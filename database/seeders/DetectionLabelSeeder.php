<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DetectionLabelSeeder extends Seeder
{
    public function run()
    {
        // Use the tanaman data you provided to populate detection labels
        $labels = [
            [
                'name' => 'kucai',
                'description' => 'Kucai (Allium tuberosum) memiliki banyak manfaat kesehatan. Kucai kaya akan kandungan kolin, folat, vitamin C, vitamin K, dan antioksidan yang membantu meningkatkan daya ingat dan konsentrasi, menjaga kesehatan tulang dengan mencegah osteoporosis, serta melancarkan sistem pencernaan melalui kandungan seratnya. Sumber: Kompilasi Manfaat Kesehatan',
            ],
            [
                'name' => 'cabai',
                'description' => 'Cabai (Capsicum spp.) kaya akan senyawa capsaicin yang membawa manfaat utama bagi kesehatan jantung dengan mencegah pembekuan darah dan menjaga elastisitas pembuluh darah. Sumber: Kompilasi Manfaat Kesehatan',
            ],
            [
                'name' => 'terong',
                'description' => 'Manfaat terong terutama berasal dari kandungan antioksidannya seperti nasunin yang melindungi sel-sel tubuh dari kerusakan akibat radikal bebas. Terong juga kaya serat yang baik untuk kesehatan pencernaan. Sumber: Kompilasi Manfaat Kesehatan',
            ],
            [
                'name' => 'tomat',
                'description' => 'Tomat kaya akan likopen, sebuah antioksidan kuat yang berperan melindungi tubuh dari kanker dan penyakit jantung. Sumber: Kompilasi Manfaat Kesehatan',
            ],
            [
                'name' => 'okra',
                'description' => 'Okra mengandung serat larut dan antioksidan yang membantu menurunkan kadar kolesterol dan gula darah, sehingga baik untuk penderita diabetes dan penyakit jantung. Sumber: Kompilasi Manfaat Kesehatan',
            ],
            [
                'name' => 'sawi',
                'description' => 'Sawi adalah sumber vitamin A, C, dan K yang tinggi serta mineral seperti kalsium dan zat besi, memberikan manfaat untuk menjaga kesehatan kulit, tulang, dan sistem kekebalan tubuh. Sumber: Kompilasi Manfaat Kesehatan',
            ],
        ];

        foreach ($labels as $lbl) {
            DB::table('detection_labels')->updateOrInsert(['name' => $lbl['name']], array_merge($lbl, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
