<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('detection_labels', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('detections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('label_id')->nullable()->constrained('detection_labels')->nullOnDelete();
            $table->json('raw_result')->nullable();
            $table->string('image_path')->nullable();
            $table->float('confidence')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('detections');
        Schema::dropIfExists('detection_labels');
    }
};
