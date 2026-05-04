import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, coursesAPI, teacherAPI } from '../api/services';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import Modal from '../components/ui/Modal';

export default function AdminDashboard() {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, teachersRes, coursesRes] = await Promise.all([
        adminAPI.getPendingTeachers(),
        adminAPI.getAllTeachers(),
        coursesAPI.getAllCourses()
      ]);
      
      setPendingTeachers(pendingRes.data.teachers || pendingRes.data || []);
      setAllTeachers(teachersRes.data.teachers || teachersRes.data || []);
      setCourses(coursesRes.data.courses || coursesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId) => {
    try {
      await adminAPI.approveTeacher(teacherId);
      fetchData();
    } catch (error) {
      console.error('Error approving teacher:', error);
      alert(error.response?.data?.message || 'Failed to approve teacher');
    }
  };

  const handleReject = async (teacherId) => {
    if (!confirm('Are you sure you want to reject this teacher application?')) return;
    
    try {
      await adminAPI.rejectTeacher(teacherId);
      fetchData();
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      alert(error.response?.data?.message || 'Failed to reject teacher');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const approvedTeachers = allTeachers.filter(t => t.Status === 'Approved');
  const rejectedTeachers = allTeachers.filter(t => t.Status === 'Rejected');

  const tabs = [
    {
      label: `Pending Approval (${pendingTeachers.length})`,
      content: <PendingTeachersTab teachers={pendingTeachers} onApprove={handleApprove} onReject={handleReject} />
    },
    {
      label: `All Teachers (${allTeachers.length})`,
      content: <AllTeachersTab teachers={allTeachers} />
    },
    {
      label: 'Statistics',
      content: <StatisticsTab courses={courses} teachers={allTeachers} />
    }
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6b00b3] to-black shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#6b00b3] font-bold">
                N
              </div>
              <span className="font-bold text-2xl text-white">NexLern</span>
              <Badge variant="danger" className="bg-white text-[#6b00b3]">Admin</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/70">Administrator</p>
                <p className="font-semibold text-white">{user?.fullName || 'Admin'}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={logout} 
                className="border-white text-white hover:bg-white hover:text-[#6b00b3] whitespace-nowrap"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Pending Approvals</p>
                  <p className="text-3xl font-bold text-badge-orange">{pendingTeachers.length}</p>
                </div>
                <div className="w-12 h-12 bg-badge-orange/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Approved Teachers</p>
                  <p className="text-3xl font-bold text-badge-green">{approvedTeachers.length}</p>
                </div>
                <div className="w-12 h-12 bg-badge-green/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-badge-blue">{courses.length}</p>
                </div>
                <div className="w-12 h-12 bg-badge-blue/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-badge-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-primary">{rejectedTeachers.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} />
      </main>
    </div>
  );
}

function PendingTeachersTab({ teachers, onApprove, onReject }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvUrl, setCvUrl] = useState('');
  const [cvLoading, setCvLoading] = useState(false);

  const handleViewCV = async (teacher) => {
    setSelectedTeacher(teacher);
    setCvLoading(true);
    try {
      const response = await teacherAPI.getCV(teacher.TeacherID);
      // Use the FileURL returned by the API (stored in DB) to view the CV
      // The controller returns { DocumentID, FileName, FileURL }
      const fileUrl = response.data?.FileURL || teacher.CVFileURL || response.data?.fileURL;
      // Fallback: try cv in cvs folder if the URL is missing
      setCvUrl(fileUrl || `http://localhost:5000/uploads/cvs/${teacher?.CVFileName || teacher.TeacherID}.pdf`);
      setShowCVModal(true);
    } catch (error) {
      console.error('Error loading CV:', error);
      alert('Failed to load CV');
    } finally {
      setCvLoading(false);
    }
  };

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
        <p className="mt-1 text-sm text-gray-500">All teacher applications have been reviewed.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {teachers.map((teacher) => (
          <Card key={teacher.TeacherID}>
            <div className="flex items-start justify-between">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-badge-blue/10 rounded-full flex items-center justify-center text-badge-blue font-semibold text-lg">
                    {teacher.FullName?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-dark">{teacher.FullName}</h3>
                    <p className="text-sm text-text-muted">{teacher.Email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Qualification</p>
                    <p className="text-sm font-medium text-text-dark">{teacher.Qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Status</p>
                    <Badge variant="warning">Pending Review</Badge>
                  </div>
                </div>

                {teacher.Bio && (
                  <div className="mb-4">
                    <p className="text-xs text-text-muted mb-1">Bio</p>
                    <p className="text-sm text-text-dark">{teacher.Bio}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCV(teacher)}
                  disabled={cvLoading}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View CV
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onApprove(teacher.TeacherID)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(teacher.TeacherID)}
                  className="text-primary border-primary hover:bg-primary-light"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showCVModal} onClose={() => setShowCVModal(false)} title={`CV - ${selectedTeacher?.FullName}`}>
        <div className="space-y-4">
          {cvLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <iframe
                src={cvUrl}
                className="w-full h-96 border border-gray-300 rounded-lg"
                title="Teacher CV"
              />
              <div className="flex gap-3">
                <a
                  href={cvUrl}
                  download={`${selectedTeacher?.FullName}-CV`}
                  className="flex-1"
                >
                  <Button variant="primary" fullWidth>
                    Download CV
                  </Button>
                </a>
                <Button variant="outline" fullWidth onClick={() => setShowCVModal(false)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

function AllTeachersTab({ teachers }) {
  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers</h3>
        <p className="mt-1 text-sm text-gray-500">No teacher registrations yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teacher
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expertise
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Experience
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registered
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teachers.map((teacher) => (
            <tr key={teacher.TeacherID} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-badge-blue/10 rounded-full flex items-center justify-center text-badge-blue font-semibold">
                    {teacher.FullName?.charAt(0) || 'T'}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-text-dark">{teacher.FullName}</div>
                    <div className="text-sm text-text-muted">{teacher.Email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-text-dark">{teacher.Expertise || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-text-dark">{teacher.YearsOfExperience || '0'} years</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  variant={
                    teacher.Status === 'Approved' ? 'success' :
                    teacher.Status === 'Pending' ? 'warning' : 'danger'
                  }
                >
                  {teacher.Status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                {teacher.CreatedAt ? new Date(teacher.CreatedAt).toLocaleDateString() : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatisticsTab({ courses, teachers }) {
  const approvedTeachers = teachers.filter(t => t.Status === 'Approved').length;
  const pendingTeachers = teachers.filter(t => t.Status === 'Pending').length;
  const rejectedTeachers = teachers.filter(t => t.Status === 'Rejected').length;

  const stats = [
    { label: 'Total Courses', value: courses.length, color: 'badge-blue' },
    { label: 'Total Teachers', value: teachers.length, color: 'badge-purple' },
    { label: 'Approved Teachers', value: approvedTeachers, color: 'badge-green' },
    { label: 'Pending Teachers', value: pendingTeachers, color: 'badge-orange' },
    { label: 'Rejected Teachers', value: rejectedTeachers, color: 'primary' },
    { label: 'Total Students', value: 0, color: 'badge-teal' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-text-muted mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold text-${stat.color}`}>{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
