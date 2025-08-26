import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TypingEffect from "./TypingEffect";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.css";

const ActiveMeeting = () => {
  const [meeting, setMeeting] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcription, setTranscription] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const [showNotes, setShowNotes] = useState(false);

  const { meetingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadMeetingData();
  }, [meetingId]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const loadMeetingData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMeeting({
      id: meetingId,
      title: "Weekly Team Standup",
      room: "Conference Room A",
      startTime: "09:00 AM",
      duration: "30 min",
      attendees: [
        { id: 1, name: "User", email: "user@example.com", status: "present", avatar: null },
        { id: 2, name: "Jane Smith", email: "jane@example.com", status: "present", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "absent", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40" },
        { id: 4, name: "Sarah Wilson", email: "sarah@example.com", status: "present", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40" },
      ],
      agenda: ["Project updates", "Sprint planning", "Team feedback", "Next week priorities"],
      videoConference: true,
      zoomLink: "https://zoom.us/j/123456789",
    });

    setLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startMeeting = () => {
    setIsActive(true);
    setTimer(0);
  };

  const endMeeting = () => {
    setIsActive(false);
    setIsRecording(false);
    setIsTranscribing(false);
    navigate("/minutes");
  };

  const toggleRecording = () => setIsRecording(!isRecording);
  const toggleTranscription = () => setIsTranscribing(!isTranscribing);

  const joinVideoConference = () => {
    window.open(meeting.zoomLink, "_blank");
  };

  if (loading) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-warning mb-3 fa-2x"></i>
          <h4>Meeting Not Found</h4>
          <p>The meeting you're looking for doesn't exist.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            <i className="fas fa-home me-2"></i> Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-outline-secondary me-3" onClick={() => navigate("/")}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h4 className="d-inline" style={{ color: 'var(--white)' }}>
            <TypingEffect text={meeting.title} />
          </h4>
          <p className="text-white small">
            {meeting.room} • {meeting.startTime} • {meeting.duration}
          </p>
        </div>
        <div className="text-center">
          <h5 className="text-success">{formatTime(timer)}</h5>
          <p className="text-muted small">{isActive ? "Meeting Active" : "Not Started"}</p>
        </div>
        <div>
          {!isActive ? (
            <button className="btn btn-success" onClick={startMeeting}>
              <i className="fas fa-play me-2"></i> Start
            </button>
          ) : (
            <button className="btn btn-danger" onClick={endMeeting}>
              <i className="fas fa-stop me-2"></i> End
            </button>
          )}
        </div>
      </div>

      <div className="row">
        {/* Main Meeting Area */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))', color: 'var(--white)' }}>
              <i className="fas fa-video me-2"></i> Meeting Room
            </div>
            <div className="card-body text-center">
              {meeting.videoConference ? (
                <>
                  <i className="fas fa-video fa-3x text-primary mb-3"></i>
                  <p>Click below to join the video call</p>
                  <button className="btn" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: 'var(--white)' }} onClick={joinVideoConference}>
                    <i className="fas fa-external-link-alt me-2"></i> Join Call
                  </button>
                </>
              ) : (
                <>
                  <i className="fas fa-users fa-3x text-secondary mb-3"></i>
                  <p>Meeting in {meeting.room}</p>
                </>
              )}
            </div>
          </div>

          {/* Meeting Controls */}
          <div className="card shadow-sm">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--gray-700))', color: 'var(--white)' }}>
              <i className="fas fa-cogs me-2"></i> Controls
            </div>
            <div className="card-body d-flex justify-content-around">
              <button className={`btn ${isRecording ? "btn-danger" : "btn-outline-danger"}`} onClick={toggleRecording}>
                <i className={`fas ${isRecording ? "fa-stop-circle" : "fa-record-vinyl"} me-2`}></i>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
              <button className={`btn ${isTranscribing ? "btn-success" : "btn-outline-success"}`} onClick={toggleTranscription}>
                <i className={`fas ${isTranscribing ? "fa-microphone-slash" : "fa-microphone"} me-2`}></i>
                {isTranscribing ? "Stop Transcription" : "Transcription"}
              </button>
              <button className="btn btn-outline-primary" onClick={() => setShowNotes(true)}>
                <i className="fas fa-sticky-note me-2"></i> Notes
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Participants */}
          <div className="card shadow-sm mb-4">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--success-color), var(--deep-green))', color: 'var(--white)' }}>
              <i className="fas fa-users me-2"></i> Participants ({meeting.attendees.length})
            </div>
            <div className="list-group list-group-flush">
              {meeting.attendees.map((a) => (
                <div key={a.id} className="list-group-item d-flex align-items-center">
                  {a.avatar ? (
                    <img src={a.avatar} alt={a.name} className="rounded-circle me-2" width="35" height="35" />
                  ) : (
                    <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 35, height: 35 }}>
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <div className="flex-fill">
                    <strong>{a.name}</strong>
                    <div className="text-muted small">{a.email}</div>
                  </div>
                  <span className={`badge ${a.status === "present" ? "bg-success" : "bg-secondary"}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="card shadow-sm mb-4">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--warning-color), var(--accent-color))', color: 'var(--white)' }}>
              <i className="fas fa-list me-2"></i> Agenda
            </div>
            <ul className="list-group list-group-flush">
              {meeting.agenda.map((item, i) => (
                <li key={i} className="list-group-item">
                  <i className="fas fa-check-circle text-warning me-2"></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))', color: 'var(--white)' }}>
                <h5 className="modal-title"><i className="fas fa-sticky-note me-2"></i> Meeting Notes</h5>
                <button className="btn-close" onClick={() => setShowNotes(false)}></button>
              </div>
              <div className="modal-body">
                <textarea className="form-control mb-3" rows="8" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Start taking notes..."></textarea>
                <button className="btn me-2" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)', color: 'var(--white)' }}><i className="fas fa-save me-2"></i> Save</button>
                <button className="btn" style={{ backgroundColor: 'var(--secondary-color)', borderColor: 'var(--secondary-color)', color: 'var(--white)' }}><i className="fas fa-download me-2"></i> Export</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Transcription */}
      {isTranscribing && (
        <div className="position-fixed bottom-0 end-0 m-3 bg-white border rounded shadow p-3" style={{ width: 300, maxHeight: 250, overflowY: "auto" }}>
          <h6 className="text-success mb-2"><i className="fas fa-microphone me-2"></i> Live Transcription</h6>
          {transcription.length === 0 ? (
            <p className="text-muted small">Transcription will appear here...</p>
          ) : (
            transcription.map((t) => (
              <div key={t.id} className="mb-2 small">
                <strong className="text-primary">{t.speaker}:</strong> {t.text}
                <div className="text-muted">{t.timestamp}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveMeeting;
