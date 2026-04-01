import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Club {
  id: string;
  avatar: string;
  name: string;
  foundationDate: string;
  description: string;
  president: string;
  isActive: boolean;
}

type AppStatus = 'Pending' | 'Approved' | 'Rejected';

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Nam' | 'Nữ';
  address: string;
  skills: string;
  clubId: string;
  reason: string;
  status: AppStatus;
  note?: string;
}

interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
}

const initialClubs: Club[] = [
  { id: '1', avatar: 'https://avatars.githubusercontent.com/u/113708179?s=280&v=4', name: 'IT Club', foundationDate: '2020-01-01', description: '<strong>Câu lạc bộ Công nghệ thông tin</strong>', president: 'Nguyễn Văn A', isActive: true },
  { id: '2', avatar: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/b1596660310817.5a4691f7e0479.jpg', name: 'Music Club', foundationDate: '2021-05-15', description: '<em>Câu lạc bộ Âm nhạc</em>', president: 'Trần Thị B', isActive: false },
];

const initialApps: Application[] = [
  { id: '1', fullName: 'Van Minh', email: 'c@gmail.com', phone: '0123456789', gender: 'Nam', address: 'Hà Nội', skills: 'Hát, Đàn', clubId: '2', reason: 'Giao lưu', status: 'Pending' },
  { id: '2', fullName: 'Phuong Anh', email: 'd@gmail.com', phone: '0987654321', gender: 'Nữ', address: 'HCM', skills: 'Code React', clubId: '1', reason: 'Học hỏi', status: 'Pending' },
  { id: '3', fullName: 'Minh Hoang', email: 'e@gmail.com', phone: '0111222333', gender: 'Nam', address: 'Đà Nẵng', skills: 'JS', clubId: '1', reason: 'Học hỏi', status: 'Approved' },
  { id: '4', fullName: 'Pham Ngoc', email: 'f@gmail.com', phone: '0444555666', gender: 'Nữ', address: 'Hải Phòng', skills: 'Piano', clubId: '2', reason: 'Giao lưu', status: 'Approved' },
];

export default function ClubManagementSystem() {
  const [activeTab, setActiveTab] = useState<'clubs' | 'apps' | 'members' | 'reports'>('clubs');
  
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [applications, setApplications] = useState<Application[]>(initialApps);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);


  const [clubSearch, setClubSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');


  const [clubModal, setClubModal] = useState<{ isOpen: boolean; data: Club | null }>({ isOpen: false, data: null });
  const [appModal, setAppModal] = useState<{ isOpen: boolean; data: Application | null }>({ isOpen: false, data: null });
  const [membersModal, setMembersModal] = useState<{ isOpen: boolean; clubId: string }>({ isOpen: false, clubId: '' });
  const [processModal, setProcessModal] = useState<{ isOpen: boolean; type: 'Approve' | 'Reject'; targetId: string | null }>({ isOpen: false, type: 'Approve', targetId: null });
  const [logsModalOpen, setLogsModalOpen] = useState(false);


  const [memberClubFilter, setMemberClubFilter] = useState<string>('');
  const [selectedMemberKeys, setSelectedMemberKeys] = useState<string[]>([]);
  const [changeClubModal, setChangeClubModal] = useState<{ isOpen: boolean; targetIds: string[] }>({ isOpen: false, targetIds: [] });
  const [newClubId, setNewClubId] = useState<string>('');

  const [rejectReason, setRejectReason] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]); // For Tab 2
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);


  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getFilteredClubs = () => clubs.filter(c => 
    c.name.toLowerCase().includes(clubSearch.toLowerCase()) || 
    c.president.toLowerCase().includes(clubSearch.toLowerCase()) || 
    c.foundationDate.includes(clubSearch)
  );

  const getFilteredApps = () => applications.filter(a =>
    a.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.phone.includes(appSearch) ||
    a.skills.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.address.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.reason.toLowerCase().includes(appSearch.toLowerCase())
  );

  const getSortedData = (data: any[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'clubName') {
        aVal = getClubName(a.clubId);
        bVal = getClubName(b.clubId);
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };


  const handleSaveClub = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClub: Club = {
      id: clubModal.data ? clubModal.data.id : Math.random().toString(),
      name: formData.get('name') as string,
      avatar: formData.get('avatar') as string,
      foundationDate: formData.get('foundationDate') as string,
      president: formData.get('president') as string,
      description: formData.get('description') as string,
      isActive: formData.get('isActive') === 'on',
    };
    setClubs(clubModal.data ? clubs.map(c => c.id === newClub.id ? newClub : c) : [...clubs, newClub]);
    setClubModal({ isOpen: false, data: null });
  };

  const handleDeleteClub = (id: string) => window.confirm('Xóa CLB này?') && setClubs(clubs.filter(c => c.id !== id));

  const handleSaveApp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newApp: Application = {
      id: appModal.data ? appModal.data.id : Math.random().toString(),
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      gender: formData.get('gender') as 'Nam' | 'Nữ',
      address: formData.get('address') as string,
      skills: formData.get('skills') as string,
      clubId: formData.get('clubId') as string,
      reason: formData.get('reason') as string,
      status: appModal.data ? appModal.data.status : 'Pending',
      note: appModal.data ? appModal.data.note : '',
    };
    setApplications(appModal.data ? applications.map(a => a.id === newApp.id ? newApp : a) : [...applications, newApp]);
    setAppModal({ isOpen: false, data: null });
  };

  const handleDeleteApp = (id: string) => window.confirm('Xóa đơn này?') && setApplications(applications.filter(a => a.id !== id));

  const executeProcess = () => {
    if (processModal.type === 'Reject' && !rejectReason.trim()) return alert('Hãy nhập lý do từ chối!');
    const targetIds = processModal.targetId ? [processModal.targetId] : selectedRowKeys;
    const now = new Date().toLocaleString('vi-VN');

    const newApps = applications.map(app => {
      if (targetIds.includes(app.id)) {
        const actionText = processModal.type === 'Approve' ? 'duyệt' : 'từ chối';
        const logMsg = `Admin đã ${actionText} đơn của [${app.fullName}] vào lúc ${now}${processModal.type === 'Reject' ? ` với lý do: ${rejectReason}` : ''}.`;
        setAuditLogs(prev => [{ id: Math.random().toString(), action: logMsg, timestamp: now }, ...prev]);
        return { ...app, status: processModal.type === 'Approve' ? 'Approved' : 'Rejected', note: processModal.type === 'Reject' ? rejectReason : app.note } as Application;
      }
      return app;
    });

    setApplications(newApps);
    setSelectedRowKeys([]);
    setProcessModal({ isOpen: false, type: 'Approve', targetId: null });
    setRejectReason('');
  };


  const filteredMembers = useMemo(() => {
    if (!memberClubFilter) return [];
    return applications.filter(a => a.status === 'Approved' && a.clubId === memberClubFilter);
  }, [applications, memberClubFilter]);

  const handleSelectMember = (id: string) => setSelectedMemberKeys(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  
  const handleSelectAllMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMemberKeys(e.target.checked ? filteredMembers.map(m => m.id) : []);
  };

  const executeChangeClub = () => {
    if (!newClubId) return alert('Hãy chọn Câu lạc bộ mới!');
    
    setApplications(apps => apps.map(app => 
      changeClubModal.targetIds.includes(app.id) ? { ...app, clubId: newClubId } : app
    ));
    
    setChangeClubModal({ isOpen: false, targetIds: [] });
    setSelectedMemberKeys([]);
    setNewClubId('');
    alert('Đã chuyển Câu lạc bộ thành công!');
  };


  const stats = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0;
    applications.forEach(a => {
      if (a.status === 'Pending') pending++;
      if (a.status === 'Approved') approved++;
      if (a.status === 'Rejected') rejected++;
    });
    return { totalClubs: clubs.length, pending, approved, rejected };
  }, [applications, clubs]);

  const chartData = useMemo(() => {
    return clubs.map(club => {
      const clubApps = applications.filter(a => a.clubId === club.id);
      return {
        name: club.name,
        Pending: clubApps.filter(a => a.status === 'Pending').length,
        Approved: clubApps.filter(a => a.status === 'Approved').length,
        Rejected: clubApps.filter(a => a.status === 'Rejected').length,
      };
    });
  }, [clubs, applications]);


  const getClubName = (clubId: string) => clubs.find(c => c.id === clubId)?.name || '';
  const getStatusTag = (status: string) => {
    if (status === 'Approved') return <span className="tag tag-green">Approved</span>;
    if (status === 'Rejected') return <span className="tag tag-red">Rejected</span>;
    return <span className="tag tag-orange">Pending</span>;
  };

  return (
    <div className="container">
      <style>{`
        .container { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: auto; }
        .tabs { border-bottom: 2px solid #ddd; margin-bottom: 20px; display: flex; gap: 10px; }
        .tab-btn { padding: 10px 15px; font-size: 15px; border: none; background: #f8f9fa; cursor: pointer; border-radius: 4px 4px 0 0; outline: none; transition: 0.2s;}
        .tab-btn:hover { background: #e2e6ea; }
        .tab-btn.active { background: #007bff; color: white; font-weight: bold; }
        .flex-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .search-input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 300px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f4f4f4; cursor: pointer; }
        th:hover { background-color: #eaeaea; }
        .btn { padding: 8px 12px; margin-right: 5px; cursor: pointer; border: none; border-radius: 4px; color: white; font-size: 14px; }
        .btn-primary { background-color: #007bff; }
        .btn-success { background-color: #28a745; }
        .btn-danger { background-color: #dc3545; }
        .btn-secondary { background-color: #6c757d; }
        .btn-sm { padding: 4px 8px; font-size: 12px; }
        .tag { padding: 4px 8px; border-radius: 12px; font-size: 12px; color: white; display: inline-block; }
        .tag-green { background-color: #28a745; }
        .tag-red { background-color: #dc3545; }
        .tag-orange { background-color: #fd7e14; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: white; padding: 20px; border-radius: 8px; width: 500px; max-width: 90%; max-height: 90vh; overflow-y: auto; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .modal-footer { margin-top: 20px; text-align: right; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #ddd; }
        .stat-card h4 { margin: 0 0 10px 0; color: #555; }
        .stat-card p { margin: 0; font-size: 24px; font-weight: bold; color: #007bff; }
      `}</style>

      <h2>Hệ Thống Quản Lý Câu Lạc Bộ</h2>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}>Danh sách CLB</button>
        <button className={`tab-btn ${activeTab === 'apps' ? 'active' : ''}`} onClick={() => setActiveTab('apps')}>Quản lý Đơn đăng ký</button>
        <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>Quản lý Thành viên</button>
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Báo cáo & Thống kê</button>
      </div>


      {activeTab === 'clubs' && (
        <div>
          <div className="flex-between">
            <button className="btn btn-primary" onClick={() => setClubModal({ isOpen: true, data: null })}>+ Thêm mới CLB</button>
            <input type="text" placeholder="Tìm kiếm CLB..." className="search-input" value={clubSearch} onChange={e => setClubSearch(e.target.value)} />
          </div>
          <table>
            <thead>
              <tr>
                <th>Ảnh ĐD</th>
                <th onClick={() => handleSort('name')}>Tên CLB {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('foundationDate')}>Ngày thành lập</th>
                <th>Mô tả</th>
                <th onClick={() => handleSort('president')}>Chủ nhiệm</th>
                <th onClick={() => handleSort('isActive')}>Hoạt động</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {getSortedData(getFilteredClubs()).map(club => (
                <tr key={club.id}>
                  <td><img src={club.avatar} alt="avatar" width={40} /></td>
                  <td>{club.name}</td>
                  <td>{club.foundationDate}</td>
                  <td><div dangerouslySetInnerHTML={{ __html: club.description }} /></td>
                  <td>{club.president}</td>
                  <td>{club.isActive ? <span className="tag tag-green">Có</span> : <span className="tag tag-red">Không</span>}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setMembersModal({ isOpen: true, clubId: club.id })}>Thành viên</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setClubModal({ isOpen: true, data: club })}>Sửa</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClub(club.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {activeTab === 'apps' && (
        <div>
          <div className="flex-between">
            <div>
              <button className="btn btn-primary" onClick={() => setAppModal({ isOpen: true, data: null })}>+ Thêm mới Đơn</button>
              {selectedRowKeys.length > 0 && (
                <>
                  <button className="btn btn-success" onClick={() => setProcessModal({ isOpen: true, type: 'Approve', targetId: null })}>Duyệt ({selectedRowKeys.length})</button>
                  <button className="btn btn-danger" onClick={() => setProcessModal({ isOpen: true, type: 'Reject', targetId: null })}>Từ chối ({selectedRowKeys.length})</button>
                </>
              )}
            </div>
            <div>
              <input type="text" placeholder="Tìm kiếm đơn..." className="search-input" value={appSearch} onChange={e => setAppSearch(e.target.value)} />
              <button className="btn btn-secondary" onClick={() => setLogsModalOpen(true)} style={{ marginLeft: 10 }}>Lịch sử</button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" onChange={e => setSelectedRowKeys(e.target.checked ? applications.map(a => a.id) : [])} checked={applications.length > 0 && selectedRowKeys.length === applications.length} /></th>
                <th onClick={() => handleSort('fullName')}>Họ tên {sortConfig?.key === 'fullName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('email')}>Email</th>
                <th onClick={() => handleSort('phone')}>SĐT</th>
                <th onClick={() => handleSort('gender')}>Giới tính</th>
                <th onClick={() => handleSort('address')}>Địa chỉ</th>
                <th onClick={() => handleSort('skills')}>Sở trường</th>
                <th onClick={() => handleSort('clubName')}>CLB đăng ký</th>
                <th onClick={() => handleSort('reason')}>Lý do đăng ký</th>
                <th onClick={() => handleSort('status')}>Trạng thái</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {getSortedData(getFilteredApps()).map(app => (
                <tr key={app.id}>
                  <td><input type="checkbox" checked={selectedRowKeys.includes(app.id)} onChange={() => setSelectedRowKeys(prev => prev.includes(app.id) ? prev.filter(k => k !== app.id) : [...prev, app.id])} /></td>
                  <td>{app.fullName}</td>
                  <td>{app.email}</td>
                  <td>{app.phone}</td>
                  <td>{app.gender}</td>
                  <td>{app.address}</td>
                  <td>{app.skills}</td>
                  <td>{getClubName(app.clubId)}</td>
                  <td>{app.reason}</td>
                  <td>{getStatusTag(app.status)}</td>
                  <td>{app.note}</td>
                  <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setAppModal({ isOpen: true, data: app })}>Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteApp(app.id)}>Xóa</button>
                      {app.status === 'Pending' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => setProcessModal({ isOpen: true, type: 'Approve', targetId: app.id })}>Duyệt</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setProcessModal({ isOpen: true, type: 'Reject', targetId: app.id })}>Từ chối</button>
                        </>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {activeTab === 'members' && (
        <div>
          <div className="flex-between">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold' }}>Chọn CLB để xem thành viên:</label>
              <select className="search-input" value={memberClubFilter} onChange={e => { setMemberClubFilter(e.target.value); setSelectedMemberKeys([]); }}>
                <option value="">-- Chọn Câu lạc bộ --</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {selectedMemberKeys.length > 0 && (
              <button className="btn btn-primary" onClick={() => setChangeClubModal({ isOpen: true, targetIds: selectedMemberKeys })}>
                Đổi CLB cho ({selectedMemberKeys.length}) thành viên đã chọn
              </button>
            )}
          </div>

          {memberClubFilter ? (
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={handleSelectAllMembers} checked={filteredMembers.length > 0 && selectedMemberKeys.length === filteredMembers.length} /></th>
                  <th onClick={() => handleSort('fullName')}>Họ tên</th>
                  <th onClick={() => handleSort('email')}>Email</th>
                  <th onClick={() => handleSort('phone')}>SĐT</th>
                  <th onClick={() => handleSort('gender')}>Giới tính</th>
                  <th onClick={() => handleSort('address')}>Địa chỉ</th>
                  <th onClick={() => handleSort('skills')}>Sở trường</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? filteredMembers.map(member => (
                  <tr key={member.id}>
                    <td><input type="checkbox" checked={selectedMemberKeys.includes(member.id)} onChange={() => handleSelectMember(member.id)} /></td>
                    <td>{member.fullName}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>{member.gender}</td>
                    <td>{member.address}</td>
                    <td>{member.skills}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setChangeClubModal({ isOpen: true, targetIds: [member.id] })}>Chuyển CLB</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={8} style={{ textAlign: 'center' }}>CLB này chưa có thành viên nào.</td></tr>}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>Vui lòng chọn Câu lạc bộ ở dropdown trên để xem danh sách thành viên.</p>
          )}
        </div>
      )}


      {activeTab === 'reports' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><h4>Tổng số CLB</h4><p>{stats.totalClubs}</p></div>
            <div className="stat-card"><h4>Đơn Pending</h4><p style={{ color: '#fd7e14' }}>{stats.pending}</p></div>
            <div className="stat-card"><h4>Đơn Approved</h4><p style={{ color: '#28a745' }}>{stats.approved}</p></div>
            <div className="stat-card"><h4>Đơn Rejected</h4><p style={{ color: '#dc3545' }}>{stats.rejected}</p></div>
          </div>

          <h3>Biểu đồ Đơn đăng ký theo từng CLB</h3>
          <div style={{ width: '100%', height: 400, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pending" fill="#fd7e14" name="Đang chờ (Pending)" />
                <Bar dataKey="Approved" fill="#28a745" name="Đã duyệt (Approved)" />
                <Bar dataKey="Rejected" fill="#dc3545" name="Từ chối (Rejected)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}


      {changeClubModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Chuyển Câu lạc bộ</h3>
            <p>Bạn đang chọn chuyển CLB cho <b>{changeClubModal.targetIds.length}</b> thành viên.</p>
            <div className="form-group">
              <label>Chọn Câu lạc bộ mới đến:</label>
              <select value={newClubId} onChange={e => setNewClubId(e.target.value)}>
                <option value="">-- Chọn CLB --</option>
                {clubs.filter(c => c.id !== memberClubFilter).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setChangeClubModal({ isOpen: false, targetIds: [] })}>Hủy</button>
              <button className="btn btn-primary" onClick={executeChangeClub}>Xác nhận chuyển</button>
            </div>
          </div>
        </div>
      )}


      {membersModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Thành viên đã duyệt</h3>
            <ul>
              {applications.filter(a => a.clubId === membersModal.clubId && a.status === 'Approved').map(member => (
                <li key={member.id}>{member.fullName} - {member.email} ({member.skills})</li>
              ))}
              {applications.filter(a => a.clubId === membersModal.clubId && a.status === 'Approved').length === 0 && <li>Chưa có thành viên nào.</li>}
            </ul>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMembersModal({ isOpen: false, clubId: '' })}>Đóng</button>
            </div>
          </div>
        </div>
      )}


      {clubModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{clubModal.data ? 'Chỉnh sửa CLB' : 'Thêm mới CLB'}</h3>
            <form onSubmit={handleSaveClub}>
              <div className="form-group"><label>Tên CLB</label><input type="text" name="name" required defaultValue={clubModal.data?.name} /></div>
              <div className="form-group"><label>URL Ảnh đại diện</label><input type="text" name="avatar" defaultValue={clubModal.data?.avatar} /></div>
              <div className="form-group"><label>Ngày thành lập</label><input type="date" name="foundationDate" required defaultValue={clubModal.data?.foundationDate} /></div>
              <div className="form-group"><label>Chủ nhiệm</label><input type="text" name="president" defaultValue={clubModal.data?.president} /></div>
              <div className="form-group"><label>Mô tả (HTML)</label><textarea name="description" rows={3} defaultValue={clubModal.data?.description} /></div>
              <div className="form-group"><label><input type="checkbox" name="isActive" defaultChecked={clubModal.data ? clubModal.data.isActive : true} /> Đang hoạt động</label></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setClubModal({ isOpen: false, data: null })}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {appModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{appModal.data ? 'Chỉnh sửa Đơn' : 'Thêm mới Đơn'}</h3>
            <form onSubmit={handleSaveApp}>
              <div className="form-group"><label>Họ tên</label><input type="text" name="fullName" required defaultValue={appModal.data?.fullName} /></div>
              <div className="form-group"><label>Email</label><input type="email" name="email" defaultValue={appModal.data?.email} /></div>
              <div className="form-group"><label>SĐT</label><input type="text" name="phone" defaultValue={appModal.data?.phone} /></div>
              <div className="form-group">
                <label>Giới tính</label>
                <select name="gender" defaultValue={appModal.data?.gender || 'Nam'}>
                  <option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option>
                </select>
              </div>
              <div className="form-group"><label>Địa chỉ</label><input type="text" name="address" defaultValue={appModal.data?.address} /></div>
              <div className="form-group"><label>Sở trường</label><input type="text" name="skills" defaultValue={appModal.data?.skills} /></div>
              <div className="form-group">
                <label>Câu lạc bộ</label>
                <select name="clubId" required defaultValue={appModal.data?.clubId}>
                  <option value="">-- Chọn CLB --</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Lý do</label><textarea name="reason" rows={2} defaultValue={appModal.data?.reason} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAppModal({ isOpen: false, data: null })}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {processModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận {processModal.type === 'Approve' ? 'Duyệt' : 'Từ chối'}</h3>
            <p>Bạn có chắc chắn muốn {processModal.type === 'Approve' ? 'duyệt' : 'từ chối'} {processModal.targetId ? 'đơn này' : `${selectedRowKeys.length} đơn đã chọn`}?</p>
            {processModal.type === 'Reject' && (
              <div className="form-group">
                <label style={{ color: 'red' }}>Lý do từ chối (*)</label>
                <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Bắt buộc nhập lý do..." />
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setProcessModal({ isOpen: false, type: 'Approve', targetId: null })}>Hủy</button>
              <button className={`btn ${processModal.type === 'Approve' ? 'btn-success' : 'btn-danger'}`} onClick={executeProcess}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}


      {logsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Lịch sử thao tác</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {auditLogs.length === 0 ? <li>Chưa có thao tác nào.</li> : auditLogs.map(log => (
                <li key={log.id} style={{ padding: '10px', borderBottom: '1px solid #eee', color: log.action.includes('từ chối') ? 'red' : 'green' }}>{log.action}</li>
              ))}
            </ul>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setLogsModalOpen(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}