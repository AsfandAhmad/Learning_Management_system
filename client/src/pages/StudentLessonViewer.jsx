import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { lessonsAPI } from '../api/services';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const isVideoFile = (url) => /\.(mp4|webm|ogg)$/i.test(url || '');

const toEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  if (url.includes('youtube.com/watch')) {
    const id = new URL(url).searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url;
};

export default function StudentLessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await lessonsAPI.getLessonById(courseId, lessonId);
        setLesson(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) {
      fetchLesson();
    }
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-dark mb-2">Lesson Not Found</h2>
          <p className="text-text-muted mb-4">{error || 'This lesson could not be loaded.'}</p>
          <Button onClick={() => navigate(`/student/course/${courseId}`)}>Back to Course</Button>
        </div>
      </div>
    );
  }

  const content = lesson.Content || lesson.Notes || '';
  const contentUrl = lesson.ContentURL || lesson.VideoURL || '';
  const videoUrl = lesson.VideoURL || contentUrl;
  const embedUrl = videoUrl ? toEmbedUrl(videoUrl) : '';
  const hasVideo = !!videoUrl;

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted">{lesson.SectionTitle || 'Lesson'}</p>
            <h1 className="text-2xl font-bold text-text-dark">{lesson.Title || 'Lesson'}</h1>
          </div>
          <Button variant="outline" onClick={() => navigate(`/student/course/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {hasVideo && (
          <Card>
            <CardHeader>
              <CardTitle>Lesson Video</CardTitle>
            </CardHeader>
            <CardContent>
              {isVideoFile(videoUrl) ? (
                <video controls className="w-full rounded-lg">
                  <source src={videoUrl} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={embedUrl}
                    title="Lesson video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            {content ? (
              <div className="whitespace-pre-wrap text-text-dark">{content}</div>
            ) : contentUrl ? (
              <a
                className="text-primary hover:underline"
                href={contentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open lesson resource
              </a>
            ) : (
              <p className="text-text-muted">No content available.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
