<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Meeting;
use App\Models\MeetingAttendee;
use App\Models\Attachment;
use App\Models\MeetingMinute;

class MeetingController extends Controller
{
    /**
     * Store a newly created meeting with all related data
     */
    public function store(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'agenda' => 'required|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'room_id' => 'nullable|integer|exists:rooms,id',
            'type' => 'required|in:onsite,online',
            'status' => 'required|string',
            'attendees' => 'nullable|string', // JSON string of attendee IDs
            'attachments.*' => 'nullable|file|mimes:pdf,doc,docx,txt,jpg,jpeg,png|max:10240' // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Create the meeting
            $meeting = Meeting::create([
                'title' => $request->title,
                'description' => $request->description,
                'agenda' => $request->agenda,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'room_id' => $request->room_id,
                'type' => $request->type,
                'status' => $request->status,
                'created_by' => auth()->id() ?? 1, // Default to user 1 if not authenticated
            ]);

            // Handle attendees
            if ($request->has('attendees') && !empty($request->attendees)) {
                $attendeeIds = json_decode($request->attendees, true);

                if (is_array($attendeeIds) && !empty($attendeeIds)) {
                    $attendeeData = [];
                    foreach ($attendeeIds as $userId) {
                        $attendeeData[] = [
                            'meeting_id' => $meeting->id,
                            'user_id' => $userId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }

                    MeetingAttendee::insert($attendeeData);
                }
            }

            // Handle file attachments
            if ($request->hasFile('attachments')) {
                $attachments = $request->file('attachments');

                foreach ($attachments as $file) {
                    if ($file->isValid()) {
                        // Generate unique filename
                        $originalName = $file->getClientOriginalName();
                        $extension = $file->getClientOriginalExtension();
                        $filename = time() . '_' . uniqid() . '.' . $extension;

                        // Store file
                        $path = $file->storeAs('meeting_attachments', $filename, 'public');

                        // Save attachment record
                        Attachment::create([
                            'meeting_id' => $meeting->id,
                            'filename' => $originalName,
                            'path' => $path,
                            'mime_type' => $file->getMimeType(),
                            'size' => $file->getSize(),
                        ]);
                    }
                }
            }

            // Create initial meeting minutes entry (optional)
            MeetingMinute::create([
                'meeting_id' => $meeting->id,
                'content' => '', // Empty initially
                'status' => 'pending',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Meeting created successfully',
                'data' => $meeting->load(['attendees', 'attachments', 'minutes'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();

            // Clean up any uploaded files if transaction failed
            if (isset($attachments) && is_array($attachments)) {
                foreach ($attachments as $file) {
                    if ($file->isValid() && Storage::disk('public')->exists('meeting_attachments/' . $file->hashName())) {
                        Storage::disk('public')->delete('meeting_attachments/' . $file->hashName());
                    }
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to create meeting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified meeting
     */
    public function show($id)
    {
        $meeting = Meeting::with(['attendees.user', 'attachments', 'minutes', 'room'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $meeting
        ]);
    }

    /**
     * Update the specified meeting
     */
    public function update(Request $request, $id)
    {
        $meeting = Meeting::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'agenda' => 'sometimes|required|string',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date|after:start_time',
            'room_id' => 'nullable|integer|exists:rooms,id',
            'type' => 'sometimes|required|in:onsite,online',
            'status' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $meeting->update($request->only([
            'title', 'description', 'agenda', 'start_time', 'end_time',
            'room_id', 'type', 'status'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Meeting updated successfully',
            'data' => $meeting->load(['attendees', 'attachments', 'minutes'])
        ]);
    }

    /**
     * Remove the specified meeting
     */
    public function destroy($id)
    {
        $meeting = Meeting::findOrFail($id);

        // Delete associated files
        foreach ($meeting->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->path);
        }

        $meeting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Meeting deleted successfully'
        ]);
    }
}
