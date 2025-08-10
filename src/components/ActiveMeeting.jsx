import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TypingEffect from './TypingEffect';

const ActiveMeeting = () => {
  // Meeting state
  const [meeting, setMeeting] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcription, setTranscription] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // UI state
  const [showNotes, setShowNotes] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Hooks
  const { meetingId } = useParams();
  const navigate = useNavigate();

  // Load meeting data
  useEffect(() => {
    loadMeetingData();
  }, [meetingId]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Load meeting data
  const loadMeetingData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock meeting data
    setMeeting({
      id: meetingId,
      title: 'Weekly Team Standup',
      room: 'Conference Room A',
      startTime: '09:00 AM',
      duration: '30 min',
      attendees: [
        { id: 1, name: 'User', email: 'user@example.com', status: 'present', avatar: null },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'present', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face&auto=format' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'absent', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format' },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'present', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format' }
      ],
      agenda: [
        'Project updates',
        'Sprint planning',
        'Team feedback',
        'Next week priorities'
      ],
      videoConference: true,
      zoomLink: 'https://zoom.us/j/123456789'
    });
    
    setLoading(false);
  };

  // Format timer
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start meeting
  const startMeeting = () => {
    setIsActive(true);
    setTimer(0);
  };

  // End meeting
  const endMeeting = () => {
    setIsActive(false);
    setIsRecording(false);
    setIsTranscribing(false);
    // Navigate to minutes page
    navigate('/minutes');
  };

  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Toggle transcription
  const toggleTranscription = () => {
    setIsTranscribing(!isTranscribing);
  };

  // Add transcription entry
  const addTranscriptionEntry = (text, speaker) => {
    if (isTranscribing) {
      setTranscription(prev => [...prev, {
        id: Date.now(),
        text,
        speaker,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  // Join video conference
  const joinVideoConference = () => {
    window.open(meeting.zoomLink, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-meeting-cream via-white to-meeting-warm bg-pattern-dots flex items-center justify-center">
        <div className="text-center animate-zoom-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-meeting-slate">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-meeting-cream via-white to-meeting-warm bg-pattern-dots flex items-center justify-center">
        <div className="text-center animate-zoom-in">
          <i className="fas fa-exclamation-triangle text-4xl text-danger-color mb-4 animate-bounce"></i>
          <h2 className="text-2xl font-bold text-meeting-navy mb-2">Meeting Not Found</h2>
          <p className="text-meeting-slate mb-4">The meeting you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary hover-lift">
            <i className="fas fa-home mr-2"></i>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-meeting-cream via-white to-meeting-warm bg-pattern-dots">
      {/* Meeting Header */}
      <div className="bg-gradient-to-r from-meeting-navy to-meeting-slate shadow-lg border-b border-meeting-charcoal">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-slide-in-left">
              <button
                onClick={() => navigate('/')}
                className="text-meeting-cream hover:text-white transition-colors hover-scale"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  <TypingEffect text={meeting.title} speed={50} />
                </h1>
                <p className="text-meeting-cream text-sm">
                  {meeting.room} • {meeting.startTime} • {meeting.duration}
                </p>
              </div>
            </div>
            
            {/* Timer */}
            <div className="text-center animate-slide-in-down">
              <div className="text-2xl font-mono font-bold text-success-color animate-pulse">
                {formatTime(timer)}
              </div>
              <div className="text-xs text-meeting-cream">
                {isActive ? 'Meeting Active' : 'Not Started'}
              </div>
            </div>

            {/* Meeting Controls */}
            <div className="flex items-center space-x-3 animate-slide-in-right">
              {!isActive ? (
                <button
                  onClick={startMeeting}
                  className="btn btn-success hover-lift animate-zoom-in"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Meeting
                </button>
              ) : (
                <button
                  onClick={endMeeting}
                  className="btn btn-danger hover-lift animate-zoom-in"
                >
                  <i className="fas fa-stop mr-2"></i>
                  End Meeting
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-3 gap-6">
          {/* Main Meeting Area */}
          <div className="col-2">
            {/* Video Conference Area */}
            <div className="card shadow-2xl glass border-0 mb-6 hover-lift animate-slide-in-left">
              <div className="card-header bg-gradient-to-r from-meeting-blue to-meeting-navy text-white">
                <h2 className="text-lg font-semibold">
                  <i className="fas fa-video mr-2 text-meeting-accent animate-rotate-in"></i>
                  Meeting Room
                </h2>
              </div>
              <div className="card-body relative overflow-hidden">
                {/* Background meeting room image */}
                <div className="absolute inset-0 opacity-10">
                  <img 
                    src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="Meeting Room" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {meeting.videoConference ? (
                  <div className="text-center py-12 relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-meeting-blue to-meeting-navy rounded-full flex items-center justify-center mx-auto mb-4 animate-zoom-in">
                      <i className="fas fa-video text-3xl text-white animate-pulse"></i>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-meeting-navy">Video Conference Ready</h3>
                    <p className="text-meeting-slate mb-4">Click below to join the video call</p>
                    <button
                      onClick={joinVideoConference}
                      className="btn btn-primary hover-lift animate-zoom-in"
                    >
                      <i className="fas fa-external-link-alt mr-2"></i>
                      Join Video Call
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-meeting-blue to-meeting-navy rounded-full flex items-center justify-center mx-auto mb-4 animate-zoom-in">
                      <i className="fas fa-users text-3xl text-white animate-pulse"></i>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-meeting-navy">In-Person Meeting</h3>
                    <p className="text-meeting-slate">Meeting in {meeting.room}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Controls */}
            <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-up">
              <div className="card-header bg-gradient-to-r from-meeting-slate to-meeting-charcoal text-white">
                <h2 className="text-lg font-semibold">
                  <i className="fas fa-cogs mr-2 text-meeting-accent animate-rotate-in"></i>
                  Meeting Controls
                </h2>
              </div>
              <div className="card-body">
                <div className="grid grid-3 gap-4">
                  <button
                    onClick={toggleRecording}
                    className={`p-4 rounded-lg border-2 transition-all hover-lift ${
                      isRecording
                        ? 'border-danger-color bg-danger-color/10 text-danger-color animate-pulse'
                        : 'border-meeting-slate hover:border-meeting-navy text-meeting-slate hover:text-meeting-navy'
                    }`}
                  >
                    <i className={`fas ${isRecording ? 'fa-stop-circle' : 'fa-record-vinyl'} text-2xl mb-2`}></i>
                    <div className="text-sm font-medium">
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </div>
                  </button>

                  <button
                    onClick={toggleTranscription}
                    className={`p-4 rounded-lg border-2 transition-all hover-lift ${
                      isTranscribing
                        ? 'border-success-color bg-success-color/10 text-success-color animate-pulse'
                        : 'border-meeting-slate hover:border-meeting-navy text-meeting-slate hover:text-meeting-navy'
                    }`}
                  >
                    <i className={`fas ${isTranscribing ? 'fa-microphone-slash' : 'fa-microphone'} text-2xl mb-2`}></i>
                    <div className="text-sm font-medium">
                      {isTranscribing ? 'Stop Transcription' : 'Live Transcription'}
                    </div>
                  </button>

                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`p-4 rounded-lg border-2 transition-all hover-lift ${
                      showNotes
                        ? 'border-meeting-blue bg-meeting-blue/10 text-meeting-blue animate-pulse'
                        : 'border-meeting-slate hover:border-meeting-navy text-meeting-slate hover:text-meeting-navy'
                    }`}
                  >
                    <i className="fas fa-sticky-note text-2xl mb-2"></i>
                    <div className="text-sm font-medium">Take Notes</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-1">
            <div className="space-y-6">
              {/* Participants */}
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right animate-delay-100">
                <div className="card-header bg-gradient-to-r from-success-color to-green-600 text-white">
                  <h2 className="text-lg font-semibold">
                    <i className="fas fa-users mr-2 text-white animate-rotate-in"></i>
                    Participants ({meeting.attendees.length})
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    {meeting.attendees.map((attendee, index) => (
                      <div key={attendee.id} className="flex items-center space-x-3 animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                        {attendee.avatar ? (
                          <img
                            src={attendee.avatar}
                            alt={attendee.name}
                            className="w-8 h-8 rounded-full border-2 border-meeting-blue"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-meeting-blue flex items-center justify-center border-2 border-meeting-blue">
                            <i className="fas fa-user text-white text-xs"></i>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-meeting-navy">{attendee.name}</p>
                          <p className="text-xs text-meeting-slate">{attendee.email}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${
                          attendee.status === 'present' ? 'bg-success-color' : 'bg-meeting-slate'
                        }`}></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agenda */}
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right animate-delay-200">
                <div className="card-header bg-gradient-to-r from-meeting-accent to-yellow-500 text-white">
                  <h2 className="text-lg font-semibold">
                    <i className="fas fa-list mr-2 text-white animate-rotate-in"></i>
                    Agenda
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-2">
                    {meeting.agenda.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 animate-slide-in-right" style={{ animationDelay: `${index * 100}ms` }}>
                        <span className="w-2 h-2 bg-meeting-accent rounded-full"></span>
                        <span className="text-sm text-meeting-navy">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card shadow-2xl glass border-0 hover-lift animate-slide-in-right animate-delay-300">
                <div className="card-header bg-gradient-to-r from-meeting-blue to-meeting-navy text-white">
                  <h2 className="text-lg font-semibold">
                    <i className="fas fa-bolt mr-2 text-meeting-accent animate-rotate-in"></i>
                    Quick Actions
                  </h2>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <button className="btn btn-outline w-full text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                      <i className="fas fa-share mr-2"></i>
                      Share Screen
                    </button>
                    <button className="btn btn-outline w-full text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                      <i className="fas fa-user-plus mr-2"></i>
                      Invite Participant
                    </button>
                    <button className="btn btn-outline w-full text-meeting-navy border-meeting-slate hover:border-meeting-navy hover-lift">
                      <i className="fas fa-file-export mr-2"></i>
                      Export Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden shadow-2xl animate-zoom-in">
              <div className="card-header bg-gradient-to-r from-meeting-blue to-meeting-navy text-white flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  <i className="fas fa-sticky-note mr-2 text-meeting-accent"></i>
                  Meeting Notes
                </h2>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-white hover:text-meeting-accent transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="card-body">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Start taking notes..."
                  className="w-full h-64 bg-meeting-cream border border-meeting-slate rounded-md p-4 text-meeting-navy placeholder-meeting-slate resize-none focus:border-meeting-blue focus:outline-none"
                ></textarea>
                <div className="flex space-x-3 mt-4">
                  <button className="btn btn-primary hover-lift">
                    <i className="fas fa-save mr-2"></i>
                    Save Notes
                  </button>
                  <button className="btn btn-secondary hover-lift">
                    <i className="fas fa-download mr-2"></i>
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Transcription */}
        {isTranscribing && (
          <div className="fixed bottom-4 right-4 w-80 bg-white border border-meeting-slate rounded-lg shadow-2xl animate-slide-in-up">
            <div className="card-header bg-gradient-to-r from-success-color to-green-600 text-white">
              <h3 className="text-sm font-semibold">
                <i className="fas fa-microphone mr-2 text-white"></i>
                Live Transcription
              </h3>
            </div>
            <div className="card-body max-h-64 overflow-y-auto">
              {transcription.length === 0 ? (
                <p className="text-meeting-slate text-sm">Transcription will appear here...</p>
              ) : (
                <div className="space-y-2">
                  {transcription.map(entry => (
                    <div key={entry.id} className="text-sm animate-fade-in">
                      <span className="text-meeting-blue font-medium">{entry.speaker}:</span>
                      <span className="text-meeting-navy ml-2">{entry.text}</span>
                      <div className="text-xs text-meeting-slate mt-1">{entry.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveMeeting;
