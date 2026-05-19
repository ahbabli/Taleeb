<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\FaqEntry;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    public function ask(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $question = $validated['question'];

        $faqMatch = $this->bestFaqMatch($question);

        if ($faqMatch && $faqMatch['score'] >= 2) {
            return response()->json([
                'source' => 'faq',
                'score' => $faqMatch['score'],
                'answer' => $faqMatch['faq']->answer,
            ]);
        }

        $announcementMatch = $this->bestAnnouncementMatch($question);

        if ($announcementMatch && $announcementMatch['score'] >= 2) {
            $announcement = $announcementMatch['announcement'];

            return response()->json([
                'source' => 'announcement',
                'score' => $announcementMatch['score'],
                'answer' => $announcement->title . "\n\n" . $announcement->content,
            ]);
        }

        return response()->json([
            'source' => 'fallback',
            'score' => 0,
            'answer' => 'I could not find a confirmed answer in the platform knowledge base. Please check the FAQ or contact the administration.',
        ]);
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

        $ignoredWords = [
            'how', 'can', 'could', 'would', 'should',
            'i', 'you', 'we', 'they',
            'the', 'a', 'an',
            'is', 'are', 'was', 'were', 'be',
            'to', 'of', 'and', 'or', 'in', 'on', 'for', 'with',
            'what', 'where', 'when', 'why', 'do', 'does',
            'my', 'your', 'me', 'it', 'this', 'that',
            'platform', 'student', 'service', 'services'
        ];

        return array_values(array_unique(array_filter($words, function ($word) use ($ignoredWords) {
            return strlen($word) >= 4 && !in_array($word, $ignoredWords);
        })));
    }
}