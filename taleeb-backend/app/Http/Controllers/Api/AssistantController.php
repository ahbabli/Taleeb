<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\FaqEntry;
use Illuminate\Http\Request;
use App\Models\DocumentRequest;
use App\Models\Schedule;
use App\Models\AcademicSetting;
use App\Models\ClassPost;
use App\Models\AssistantLog;

class AssistantController extends Controller
{
    public function ask(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $question = $validated['question'];
        $personalAnswer = $this->answerPersonalQuestion($request, $question);

        if ($personalAnswer) {
            $response = [
                'source' => 'personal',
                'score' => 10,
                'answer' => $personalAnswer['answer'],
                'link' => $personalAnswer['link'],
            ];

            $this->logAssistantQuestion($request, $question, $response);

            return response()->json($response);
        }

        $faqMatch = $this->bestFaqMatch($question);

        if ($faqMatch && $faqMatch['score'] >= 1) {
            $response = [
                'source' => 'faq',
                'score' => $faqMatch['score'],
                'answer' => $faqMatch['faq']->answer,
                'link' => 'faq',
            ];

            $this->logAssistantQuestion($request, $question, $response);

            return response()->json($response);
        }

        $announcementMatch = $this->bestAnnouncementMatch($question);

        if ($announcementMatch && $announcementMatch['score'] >= 1) {
            $announcement = $announcementMatch['announcement'];

            $response = [
                'source' => 'announcement',
                'score' => $announcementMatch['score'],
                'answer' => $announcement->title . "\n\n" . $announcement->content,
                'link' => 'announcements',
            ];

            $this->logAssistantQuestion($request, $question, $response);

            return response()->json($response);
        }

        $response = [
            'source' => 'fallback',
            'score' => 0,
            'answer' => 'I could not find a confirmed answer in the platform knowledge base. Please check the FAQ or contact the administration.',
            'link' => 'faq',
        ];

        $this->logAssistantQuestion($request, $question, $response);

        return response()->json($response);
    }

    private function bestFaqMatch(string $question): ?array
    {
        $questionWords = $this->extractKeywords($question);

        $best = null;

        foreach (FaqEntry::where('is_published', true)->get() as $faq) {
            $faqText = $faq->question . ' ' . $faq->answer . ' ' . $faq->category;
            $score = $this->scoreText($questionWords, $faqText);

            if (!$best || $score > $best['score']) {
                $best = [
                    'faq' => $faq,
                    'score' => $score,
                ];
            }
        }

        return $best;
    }

    private function bestAnnouncementMatch(string $question): ?array
    {
        $questionWords = $this->extractKeywords($question);

        $best = null;

        foreach (Announcement::where('is_published', true)->latest()->get() as $announcement) {
            $text = $announcement->title . ' ' . $announcement->content;
            $score = $this->scoreText($questionWords, $text);

            if (!$best || $score > $best['score']) {
                $best = [
                    'announcement' => $announcement,
                    'score' => $score,
                ];
            }
        }

        return $best;
    }

    private function scoreText(array $keywords, string $text): int
    {
        $text = strtolower($text);
        $score = 0;

        foreach ($keywords as $word) {
            if (str_contains($text, $word)) {
                $score++;
            }
        }

        return $score;
    }

    private function extractKeywords(string $text): array
    {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s]/', ' ', $text);

        $words = preg_split('/\s+/', $text);

        $ignoredWords = ['how', 'can', 'could', 'would', 'should', 'i', 'you', 'we', 'they', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'and', 'or', 'in', 'on', 'for', 'with', 'what', 'where', 'when', 'why', 'do', 'does', 'my', 'your', 'me', 'it', 'this', 'that', 'platform', 'student', 'service', 'services'];

        $keywords = array_values(
            array_unique(
                array_filter($words, function ($word) use ($ignoredWords) {
                    return strlen($word) >= 3 && !in_array($word, $ignoredWords);
                }),
            ),
        );

        return $this->expandSynonyms($keywords);
    }

    private function expandSynonyms(array $keywords): array
    {
        $synonyms = [
            'transcript' => ['transcript', 'grades', 'marks', 'record', 'notes'],
            'grades' => ['transcript', 'grades', 'marks', 'record', 'notes'],
            'marks' => ['transcript', 'grades', 'marks', 'record', 'notes'],
            'certificate' => ['certificate', 'document', 'attestation'],
            'document' => ['document', 'certificate', 'attestation'],
            'request' => ['request', 'ask', 'apply', 'submit'],
            'schedule' => ['schedule', 'timetable', 'class', 'session'],
            'timetable' => ['schedule', 'timetable', 'class', 'session'],
            'exam' => ['exam', 'exams', 'test', 'timetable'],
            'exams' => ['exam', 'exams', 'test', 'timetable'],
            'notification' => ['notification', 'alert', 'message'],
            'announcement' => ['announcement', 'news', 'notice'],
            'login' => ['login', 'signin', 'account'],
            'password' => ['password', 'credentials', 'account'],
            'td' => ['td', 'tutorial', 'practical'],
            'cours' => ['cours', 'course', 'lecture'],
        ];

        $expanded = [];

        foreach ($keywords as $keyword) {
            if (isset($synonyms[$keyword])) {
                $expanded = array_merge($expanded, $synonyms[$keyword]);
            } else {
                $expanded[] = $keyword;
            }
        }

        return array_values(array_unique($expanded));
    }
    private function answerPersonalQuestion(Request $request, string $question): ?array
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return null;
        }

        $q = strtolower($question);

        if ($this->containsAny($q, ['pending request', 'pending document', 'my requests', 'request status'])) {
            return [
                'answer' => $this->answerRequests($student),
                'link' => 'requests',
            ];
        }

        if ($this->containsAny($q, ['next class', 'next session', 'upcoming class', 'upcoming session'])) {
            return [
                'answer' => $this->answerNextClass($student),
                'link' => 'schedule',
            ];
        }

        if ($this->containsAny($q, ['today schedule', 'classes today', 'today class', 'today sessions'])) {
            return [
                'answer' => $this->answerTodaySchedule($student),
                'link' => 'schedule',
            ];
        }

        if ($this->containsAny($q, ['exam', 'exams', 'days until exams', 'exam date'])) {
            return [
                'answer' => $this->answerExams(),
                'link' => 'home',
            ];
        }

        if ($this->containsAny($q, ['announcement', 'announcements', 'news', 'notice'])) {
            return [
                'answer' => $this->answerAnnouncements($student),
                'link' => 'announcements',
            ];
        }

        if ($this->containsAny($q, ['class post', 'class feed', 'td', 'course file', 'cours', 'reminder'])) {
            return [
                'answer' => $this->answerClassPosts($student),
                'link' => 'class-feed',
            ];
        }

        return null;
    }

    private function containsAny(string $text, array $terms): bool
    {
        foreach ($terms as $term) {
            if (str_contains($text, $term)) {
                return true;
            }
        }

        return false;
    }

    private function answerRequests($student): string
    {
        $requests = DocumentRequest::with('documentType')->where('student_id', $student->id)->latest()->limit(5)->get();

        if ($requests->isEmpty()) {
            return 'You do not have any document requests yet.';
        }

        $pending = $requests->whereIn('status', ['pending', 'processing'])->count();

        $answer = "You have {$pending} active request(s).\n\nRecent requests:\n";

        foreach ($requests as $request) {
            $answer .= '- ' . ($request->documentType?->name ?? 'Document') . ' — Status: ' . $request->status . "\n";
        }

        return $answer;
    }

    private function answerNextClass($student): string
    {
        $today = now()->format('l');
        $currentTime = now()->format('H:i:s');

        $nextClass = Schedule::where('department', $student->department)->where('level', $student->level)->where('day', $today)->where('start_time', '>', $currentTime)->orderBy('start_time')->first();

        if (!$nextClass) {
            return 'You have no upcoming class for today.';
        }

        return "Your next class is {$nextClass->subject} ({$nextClass->type}) at " . substr($nextClass->start_time, 0, 5) . ' in ' . ($nextClass->room ?? 'no room assigned') . '.';
    }

    private function answerTodaySchedule($student): string
    {
        $today = now()->format('l');

        $classes = Schedule::where('department', $student->department)->where('level', $student->level)->where('day', $today)->orderBy('start_time')->get();

        if ($classes->isEmpty()) {
            return 'You have no classes scheduled today.';
        }

        $answer = "Today's schedule:\n";

        foreach ($classes as $class) {
            $answer .= "- {$class->subject} ({$class->type}) " . substr($class->start_time, 0, 5) . ' - ' . substr($class->end_time, 0, 5) . ' | Room: ' . ($class->room ?? 'not assigned') . "\n";
        }

        return $answer;
    }

    private function answerExams(): string
    {
        $settings = AcademicSetting::latest()->first();

        if (!$settings || !$settings->exams_start_date) {
            return 'The exam dates have not been configured yet.';
        }

        $days = now()
            ->startOfDay()
            ->diffInDays(\Carbon\Carbon::parse($settings->exams_start_date)->startOfDay(), false);

        if ($days > 0) {
            return "Final exams start in {$days} day(s), on {$settings->exams_start_date}.";
        }

        if ($days === 0) {
            return 'Final exams start today.';
        }

        return "Final exams already started on {$settings->exams_start_date}.";
    }

    private function answerAnnouncements($student): string
    {
        $announcements = Announcement::where('is_published', true)
            ->where(function ($query) use ($student) {
                $query->whereNull('department')->orWhere('department', $student->department);
            })
            ->where(function ($query) use ($student) {
                $query->whereNull('level')->orWhere('level', $student->level);
            })
            ->latest()
            ->limit(3)
            ->get();

        if ($announcements->isEmpty()) {
            return 'There are no announcements available for you right now.';
        }

        $answer = "Latest announcements:\n";

        foreach ($announcements as $announcement) {
            $answer .= "- {$announcement->title}\n";
        }

        return $answer;
    }

    private function answerClassPosts($student): string
    {
        $posts = ClassPost::where('department', $student->department)->where('level', $student->level)->where('is_published', true)->latest()->limit(3)->get();

        if ($posts->isEmpty()) {
            return 'There are no recent class posts for your class.';
        }

        $answer = "Latest class updates:\n";

        foreach ($posts as $post) {
            $answer .= "- {$post->title} ({$post->type})\n";
        }

        return $answer;
    }
    private function logAssistantQuestion(Request $request, string $question, array $response): void
    {
        AssistantLog::create([
            'student_id' => $request->user()->student?->id,
            'question' => $question,
            'answer' => $response['answer'] ?? null,
            'source' => $response['source'] ?? null,
            'score' => $response['score'] ?? 0,
            'link' => $response['link'] ?? null,
        ]);
    }
}
