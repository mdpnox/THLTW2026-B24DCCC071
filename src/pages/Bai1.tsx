import React, { useState, useMemo } from 'react';
import './Bai1.css'; 

type RoomType = 'Lý thuyết' | 'Thực hành' | 'Hội trường';

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
  manager: string;
}

const MANAGERS = ['Nguyen A', 'Tran B', 'Pham C', 'Nguyen Van D', 'Tran Thi E'];
const ROOM_TYPES: RoomType[] = ['Lý thuyết', 'Thực hành', 'Hội trường'];

const INITIAL_DATA: Classroom[] = [
  { id: 'LT101', name: 'Phòng học 101', capacity: 50, type: 'Lý thuyết', manager: 'Nguyen A' },
  { id: 'HT101', name: 'Hội trường 202', capacity: 150, type: 'Hội trường', manager: 'Tran B' },
  { id: 'TH101', name: 'Phòng Máy Tính 1', capacity: 25, type: 'Thực hành', manager: 'Pham C' },
  { id: 'LT102', name: 'Phòng học 102', capacity: 45, type: 'Lý thuyết', manager: 'Nguyen Van D' },
];

export default function ClassroomManager() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterManager, setFilterManager] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Classroom>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredAndSortedClassrooms = useMemo(() => {
    let result = [...classrooms];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (room) =>
          room.id.toLowerCase().includes(lowerSearch) ||
          room.name.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterType) {
      result = result.filter((room) => room.type === filterType);
    }

    if (filterManager) {
      result = result.filter((room) => room.manager === filterManager);
    }

    if (sortOrder) {
      result.sort((a, b) => {
        return sortOrder === 'asc' ? a.capacity - b.capacity : b.capacity - a.capacity;
      });
    }

    return result;
  }, [classrooms, searchTerm, filterType, filterManager, sortOrder]);

  const toggleSort = () => {
    if (sortOrder === null) setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder(null);
  };

  const openModal = (room?: Classroom) => {
    if (room) {
      setEditingId(room.id);
      setFormData({ ...room });
    } else {
      setEditingId(null);
      setFormData({ type: 'Lý thuyết', manager: MANAGERS[0], capacity: 30 });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const { id, name, capacity, type, manager } = formData;

    if (!id || id.trim() === '') errors.id = 'Mã phòng không được để trống';
    else if (id.length > 10) errors.id = 'Mã phòng tối đa 10 ký tự';
    else if (classrooms.some(r => r.id === id && r.id !== editingId)) {
      errors.id = 'Mã phòng đã tồn tại';
    }

    if (!name || name.trim() === '') errors.name = 'Tên phòng không được để trống';
    else if (name.length > 50) errors.name = 'Tên phòng tối đa 50 ký tự';
    else if (classrooms.some(r => r.name === name && r.id !== editingId)) {
      errors.name = 'Tên phòng đã tồn tại';
    }

    if (!capacity) errors.capacity = 'Số chỗ ngồi không được để trống';
    else if (capacity < 10 || capacity > 200) errors.capacity = 'Số chỗ ngồi phải từ 10 đến 200';

    if (!type) errors.type = 'Hãy chọn loại phòng';
    if (!manager) errors.manager = 'Hãy chọn người phụ trách';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingId) {
      setClassrooms(classrooms.map(r => r.id === editingId ? (formData as Classroom) : r));
    } else {
      setClassrooms([...classrooms, formData as Classroom]);
    }
    closeModal();
  };

  const handleDelete = (room: Classroom) => {
    if (room.capacity >= 30) {
      alert('Chỉ có thể xóa phòng học có dưới 30 chỗ ngồi!');
      return;
    }

    if (window.confirm(`Xác nhận xóa phòng "${room.name}"?`)) {
      setClassrooms(classrooms.filter(r => r.id !== room.id));
    }
  };

  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="page-title">Hệ Thống Quản Lý Phòng Học</h1>

        <div className="toolbar">
          <div className="filter-group">
            <div className="input-block">
              <label>Tìm kiếm</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập mã hoặc tên phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="input-block">
              <label>Loại phòng</label>
              <select
                className="form-control"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tất cả</option>
                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="input-block">
              <label>Người phụ trách</label>
              <select
                className="form-control"
                value={filterManager}
                onChange={(e) => setFilterManager(e.target.value)}
              >
                <option value="">Tất cả</option>
                {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => openModal()}>
            + Thêm phòng học
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã phòng</th>
                <th>Tên phòng</th>
                <th>Loại phòng</th>
                <th>Người phụ trách</th>
                <th className="sortable" onClick={toggleSort}>
                  Số chỗ ngồi {sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↕'}
                </th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedClassrooms.length > 0 ? (
                filteredAndSortedClassrooms.map((room) => (
                  <tr key={room.id}>
                    <td><strong>{room.id}</strong></td>
                    <td>{room.name}</td>
                    <td>
                      <span className={`badge ${
                        room.type === 'Lý thuyết' ? 'badge-lythuyet' :
                        room.type === 'Thực hành' ? 'badge-thuchanh' :
                        'badge-hoitruong'
                      }`}>
                        {room.type}
                      </span>
                    </td>
                    <td>{room.manager}</td>
                    <td>{room.capacity}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="action-link text-edit" onClick={() => openModal(room)}>
                        Sửa
                      </button>
                      <button 
                        className={`action-link ${room.capacity >= 30 ? 'text-disabled' : 'text-delete'}`}
                        onClick={() => handleDelete(room)}
                        title={room.capacity >= 30 ? "Chỉ được xóa phòng dưới 30 chỗ" : "Xóa phòng"}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                    Không tìm thấy phòng học nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              {editingId ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}
            </h2>
            
            <div className="form-grid">
              <div className="input-block">
                <label>Mã phòng *</label>
                <input
                  type="text"
                  maxLength={10}
                  className={`form-control ${formErrors.id ? 'error' : ''}`}
                  value={formData.id || ''}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  disabled={!!editingId}
                />
                {formErrors.id && <span className="error-message">{formErrors.id}</span>}
              </div>

              <div className="input-block">
                <label>Tên phòng *</label>
                <input
                  type="text"
                  maxLength={50}
                  className={`form-control ${formErrors.name ? 'error' : ''}`}
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="input-block">
                <label>Loại phòng *</label>
                <select
                  className={`form-control ${formErrors.type ? 'error' : ''}`}
                  value={formData.type || ''}
                  onChange={e => setFormData({...formData, type: e.target.value as RoomType})}
                >
                  {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {formErrors.type && <span className="error-message">{formErrors.type}</span>}
              </div>

              <div className="input-block">
                <label>Người phụ trách *</label>
                <select
                  className={`form-control ${formErrors.manager ? 'error' : ''}`}
                  value={formData.manager || ''}
                  onChange={e => setFormData({...formData, manager: e.target.value})}
                >
                  {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {formErrors.manager && <span className="error-message">{formErrors.manager}</span>}
              </div>

              <div className="input-block">
                <label>Số chỗ ngồi * (10 - 200)</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  className={`form-control ${formErrors.capacity ? 'error' : ''}`}
                  value={formData.capacity || ''}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                />
                {formErrors.capacity && <span className="error-message">{formErrors.capacity}</span>}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}