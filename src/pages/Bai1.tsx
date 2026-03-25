import React, { useState, useMemo } from 'react';

interface Register {
  id: string;
  year: number;
  currentRegNum: number;
}

interface Decision {
  id: string;
  decisionNumber: string;
  issueDate: string;
  summary: string;
  registerId: string;
  searchCount: number;
}

type FieldType = 'String' | 'Number' | 'Date';

interface FieldConfig {
  id: string;
  name: string;
  type: FieldType;
}

interface Diploma {
  id: string;
  decisionId: string;
  registerId: string;
  registerNumber: number;
  serialNumber: string;
  studentId: string;
  fullName: string;
  dob: string;
  dynamicFields: Record<string, string | number>;
}

export default function DiplomaManagementSystem() {
  const [registers, setRegisters] = useState<Register[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [configs, setConfigs] = useState<FieldConfig[]>([]);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);

  const [activeTab, setActiveTab] = useState<'admin' | 'search'>('admin');
  const [adminTab, setAdminTab] = useState<'register' | 'decision' | 'config' | 'diploma'>('register');

 
  const RegisterManager = () => {
    const [year, setYear] = useState(new Date().getFullYear());

    const handleAdd = () => {
      if (registers.some(r => r.year === year)) {
        alert('Sổ của năm này đã tồn tại!');
        return;
      }
      setRegisters([...registers, { id: Date.now().toString(), year, currentRegNum: 1 }]);
    };

    return (
      <div style={styles.section}>
        <h3>Quản lý Sổ văn bằng</h3>
        <div>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            placeholder="Năm tốt nghiệp"
            style={styles.input}
          />
          <button onClick={handleAdd} style={styles.button}>Thêm Sổ mới</button>
        </div>
        <ul style={styles.list}>
          {registers.map(r => (
            <li key={r.id}>Năm: <strong>{r.year}</strong> - Số vào sổ hiện tại đang chờ cấp: {r.currentRegNum}</li>
          ))}
        </ul>
      </div>
    );
  };


  const DecisionManager = () => {
    const [form, setForm] = useState({ decisionNumber: '', issueDate: '', summary: '', registerId: '' });

    const handleAdd = () => {
      if (!form.decisionNumber || !form.registerId) return alert('Vui lòng nhập đủ thông tin!');
      setDecisions([...decisions, { id: Date.now().toString(), ...form, searchCount: 0 }]);
      setForm({ decisionNumber: '', issueDate: '', summary: '', registerId: '' });
    };

    return (
      <div style={styles.section}>
        <h3>Quản lý Quyết định Tốt nghiệp</h3>
        <div style={styles.formGrid}>
          <input
            placeholder="Số QĐ"
            value={form.decisionNumber}
            onChange={e => setForm({ ...form, decisionNumber: e.target.value })}
            style={styles.input}
          />
          <input
            type="date"
            value={form.issueDate}
            onChange={e => setForm({ ...form, issueDate: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Trích yếu"
            value={form.summary}
            onChange={e => setForm({ ...form, summary: e.target.value })}
            style={styles.input}
          />
          <select
            value={form.registerId}
            onChange={e => setForm({ ...form, registerId: e.target.value })}
            style={styles.input}
          >
            <option value="">-- Chọn sổ văn bằng (Năm) --</option>
            {registers.map(r => <option key={r.id} value={r.id}>Sổ năm {r.year}</option>)}
          </select>
          <button onClick={handleAdd} style={styles.button}>Thêm QĐ</button>
        </div>
        <ul style={styles.list}>
          {decisions.map(d => {
            const reg = registers.find(r => r.id === d.registerId);
            return (
              <li key={d.id}>
                QĐ số: {d.decisionNumber} ({d.issueDate}) - Sổ: {reg?.year} - Lượt tra cứu: {d.searchCount}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  
  const ConfigManager = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState<FieldType>('String');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<FieldType>('String');

    const handleAdd = () => {
      if (!name) return;
      setConfigs([...configs, { id: Date.now().toString(), name, type }]);
      setName('');
    };

    const handleDelete = (id: string) => setConfigs(configs.filter(c => c.id !== id));

    const startEdit = (config: FieldConfig) => {
      setEditingId(config.id);
      setEditName(config.name);
      setEditType(config.type);
    };

    const saveEdit = () => {
      if (!editName) return;
      setConfigs(configs.map(c => c.id === editingId ? { ...c, name: editName, type: editType } : c));
      setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    return (
      <div style={styles.section}>
        <h3>Cấu hình Biểu mẫu Phụ lục</h3>
        <div>
          <input
            placeholder="Tên trường"
            value={name}
            onChange={e => setName(e.target.value)}
            style={styles.input}
          />
          <select value={type} onChange={e => setType(e.target.value as FieldType)} style={styles.input}>
            <option value="String">Chuỗi (String)</option>
            <option value="Number">Số (Number)</option>
            <option value="Date">Ngày tháng (Date)</option>
          </select>
          <button onClick={handleAdd} style={styles.button}>Thêm trường</button>
        </div>
        <ul style={styles.list}>
          {configs.map(c => (
            <li key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              {editingId === c.id ? (
                <>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={styles.input}
                  />
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value as FieldType)}
                    style={styles.input}
                  >
                    <option value="String">String</option>
                    <option value="Number">Number</option>
                    <option value="Date">Date</option>
                  </select>
                  <button onClick={saveEdit} style={{ ...styles.button, backgroundColor: '#28a745' }}>Lưu</button>
                  <button onClick={cancelEdit} style={styles.dangerBtn}>Hủy</button>
                </>
              ) : (
                <>
                  {c.name} - Kiểu: {c.type}
                  <button onClick={() => startEdit(c)} style={{ ...styles.button, marginLeft: '10px', backgroundColor: '#ffc107', color: '#000' }}>Sửa</button>
                  <button onClick={() => handleDelete(c.id)} style={styles.dangerBtn}>Xóa</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

 
  const DiplomaManager = () => {
    const [decisionId, setDecisionId] = useState('');
    const [baseForm, setBaseForm] = useState({ serialNumber: '', studentId: '', fullName: '', dob: '' });
    const [dynamicData, setDynamicData] = useState<Record<string, string>>({});

    const validateDynamicFields = () => {
      for (const config of configs) {
        const value = dynamicData[config.id];
        if (!value && value !== '') continue; 
        if (config.type === 'Number') {
          if (isNaN(Number(value))) {
            alert(`Trường "${config.name}" phải là số.`);
            return false;
          }
        } else if (config.type === 'Date') {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            alert(`Trường "${config.name}" phải có định dạng ngày (YYYY-MM-DD).`);
            return false;
          }
        }
      }
      return true;
    };

    const handleAdd = () => {
      if (!decisionId) return alert('Vui lòng chọn Quyết định tốt nghiệp!');
      if (!baseForm.serialNumber || !baseForm.studentId) return alert('Vui lòng nhập Số hiệu văn bằng và Mã sinh viên!');
      if (!validateDynamicFields()) return;

      const decision = decisions.find(d => d.id === decisionId);
      if (!decision) return;

      const register = registers.find(r => r.id === decision.registerId);
      if (!register) return;

      const newDiploma: Diploma = {
        id: Date.now().toString(),
        decisionId,
        registerId: register.id,
        registerNumber: register.currentRegNum,
        ...baseForm,
        dynamicFields: { ...dynamicData }
      };

      setDiplomas([...diplomas, newDiploma]);

      
      setRegisters(registers.map(r => r.id === register.id ? { ...r, currentRegNum: r.currentRegNum + 1 } : r));

      alert(`Thêm văn bằng thành công! Số vào sổ: ${register.currentRegNum}`);
      setBaseForm({ serialNumber: '', studentId: '', fullName: '', dob: '' });
      setDynamicData({});
    };

    const selectedRegister = useMemo(() => {
      const dec = decisions.find(d => d.id === decisionId);
      return registers.find(r => r.id === dec?.registerId);
    }, [decisionId, decisions, registers]);

    return (
      <div style={styles.section}>
        <h3>Nhập Thông tin Văn bằng mới</h3>
        <select
          value={decisionId}
          onChange={e => setDecisionId(e.target.value)}
          style={{ ...styles.input, width: '100%', marginBottom: 10 }}
        >
          <option value="">-- Chọn Quyết định Tốt nghiệp --</option>
          {decisions.map(d => <option key={d.id} value={d.id}>QĐ: {d.decisionNumber}</option>)}
        </select>

        {decisionId && (
          <div style={styles.formGrid}>
            <input
              value={selectedRegister?.currentRegNum || ''}
              disabled
              placeholder="Số vào sổ (Tự động)"
              style={{ ...styles.input, backgroundColor: '#eee' }}
              title="Không cho phép chỉnh sửa"
            />
            <input
              placeholder="Số hiệu văn bằng"
              value={baseForm.serialNumber}
              onChange={e => setBaseForm({ ...baseForm, serialNumber: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder="Mã sinh viên"
              value={baseForm.studentId}
              onChange={e => setBaseForm({ ...baseForm, studentId: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder="Họ và tên"
              value={baseForm.fullName}
              onChange={e => setBaseForm({ ...baseForm, fullName: e.target.value })}
              style={styles.input}
            />
            <input
              type="date"
              placeholder="Ngày sinh"
              value={baseForm.dob}
              onChange={e => setBaseForm({ ...baseForm, dob: e.target.value })}
              style={styles.input}
            />

            {configs.map(c => (
              <div key={c.id}>
                <label style={{ fontSize: 12, display: 'block' }}>{c.name} ({c.type}):</label>
                <input
                  type={c.type === 'Number' ? 'number' : c.type === 'Date' ? 'date' : 'text'}
                  value={dynamicData[c.id] || ''}
                  onChange={e => setDynamicData({ ...dynamicData, [c.id]: e.target.value })}
                  style={styles.input}
                />
              </div>
            ))}

            <button onClick={handleAdd} style={{ ...styles.button, gridColumn: '1 / -1' }}>Lưu Văn bằng</button>
          </div>
        )}
      </div>
    );
  };

  
  const LookupView = () => {
    const [searchParams, setSearchParams] = useState({ serialNumber: '', registerNumber: '', studentId: '', fullName: '', dob: '' });
    const [results, setResults] = useState<Diploma[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = () => {
      const filledParamsCount = Object.values(searchParams).filter(val => val.trim() !== '').length;
      if (filledParamsCount < 2) {
        alert('Yêu cầu nhập ít nhất 2 tham số để tra cứu!');
        return;
      }

      const found = diplomas.filter(dip => {
        let match = true;
        if (searchParams.serialNumber && dip.serialNumber !== searchParams.serialNumber) match = false;
        if (searchParams.registerNumber && dip.registerNumber.toString() !== searchParams.registerNumber) match = false;
        if (searchParams.studentId && dip.studentId !== searchParams.studentId) match = false;
        if (searchParams.fullName && !dip.fullName.toLowerCase().includes(searchParams.fullName.toLowerCase())) match = false;
        if (searchParams.dob && dip.dob !== searchParams.dob) match = false;
        return match;
      });

      setResults(found);
      setHasSearched(true);

      if (found.length > 0) {
        const uniqueDecisionIds = Array.from(new Set(found.map(f => f.decisionId)));
        setDecisions(prev => prev.map(dec =>
          uniqueDecisionIds.includes(dec.id) ? { ...dec, searchCount: dec.searchCount + 1 } : dec
        ));
      }
    };

    return (
      <div style={styles.section}>
        <h2>Tra cứu thông tin văn bằng</h2>
        <div style={styles.formGrid}>
          <input
            placeholder="Số hiệu văn bằng"
            value={searchParams.serialNumber}
            onChange={e => setSearchParams({ ...searchParams, serialNumber: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Số vào sổ"
            value={searchParams.registerNumber}
            onChange={e => setSearchParams({ ...searchParams, registerNumber: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Mã sinh viên"
            value={searchParams.studentId}
            onChange={e => setSearchParams({ ...searchParams, studentId: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Họ và tên"
            value={searchParams.fullName}
            onChange={e => setSearchParams({ ...searchParams, fullName: e.target.value })}
            style={styles.input}
          />
          <input
            type="date"
            value={searchParams.dob}
            onChange={e => setSearchParams({ ...searchParams, dob: e.target.value })}
            style={styles.input}
          />
          <button onClick={handleSearch} style={{ ...styles.button, gridColumn: '1 / -1', background: '#28a745' }}>
            Tra Cứu
          </button>
        </div>

        {hasSearched && (
          <div style={{ marginTop: 20 }}>
            <h3>Kết quả tìm kiếm ({results.length}):</h3>
            {results.length === 0 ? (
              <p>Không tìm thấy văn bằng nào khớp với dữ liệu.</p>
            ) : (
              results.map(dip => {
                const dec = decisions.find(d => d.id === dip.decisionId);
                return (
                  <div key={dip.id} style={{ border: '1px solid #ddd', padding: 15, marginBottom: 10, borderRadius: 5 }}>
                    <p>
                      <strong>Họ tên:</strong> {dip.fullName} - <strong>MSV:</strong> {dip.studentId} - <strong>Ngày sinh:</strong> {dip.dob}
                    </p>
                    <p>
                      <strong>Số vào sổ:</strong> {dip.registerNumber} - <strong>Số hiệu:</strong> {dip.serialNumber}
                    </p>
                    <p>
                      <strong>Thuộc Quyết định:</strong> {dec?.decisionNumber} (Cấp ngày {dec?.issueDate})
                    </p>
                    <hr style={{ margin: '10px 0' }} />
                    <p>
                      <strong>Thông tin phụ lục:</strong>
                    </p>
                    <ul>
                      {configs.map(c => (
                        <li key={c.id}>
                          {c.name}: {dip.dynamicFields[c.id] || 'N/A'}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>HỆ THỐNG QUẢN LÝ & TRA CỨU VĂN BẰNG</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
        <button onClick={() => setActiveTab('admin')} style={activeTab === 'admin' ? styles.activeTab : styles.tab}>
          Chuyên viên quản lý
        </button>
        <button onClick={() => setActiveTab('search')} style={activeTab === 'search' ? styles.activeTab : styles.tab}>
          Tra cứu văn bằng
        </button>
      </div>

      {activeTab === 'admin' ? (
        <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '2px solid #eee', paddingBottom: 10 }}>
            <button onClick={() => setAdminTab('register')} style={adminTab === 'register' ? styles.subTabActive : styles.subTab}>
              1. Quản lý Sổ
            </button>
            <button onClick={() => setAdminTab('decision')} style={adminTab === 'decision' ? styles.subTabActive : styles.subTab}>
              2. Quyết định TN
            </button>
            <button onClick={() => setAdminTab('config')} style={adminTab === 'config' ? styles.subTabActive : styles.subTab}>
              3. Cấu hình Mẫu
            </button>
            <button onClick={() => setAdminTab('diploma')} style={adminTab === 'diploma' ? styles.subTabActive : styles.subTab}>
              4. Nhập Văn Bằng
            </button>
          </div>

          {adminTab === 'register' && <RegisterManager />}
          {adminTab === 'decision' && <DecisionManager />}
          {adminTab === 'config' && <ConfigManager />}
          {adminTab === 'diploma' && <DiplomaManager />}
        </div>
      ) : (
        <LookupView />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: { padding: '10px 0' },
  input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px', width: '200px', boxSizing: 'border-box' },
  button: { padding: '8px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  dangerBtn: { padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' },
  list: { marginTop: '15px', lineHeight: '2' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' },
  tab: { padding: '10px 20px', cursor: 'pointer', border: '1px solid #ccc', background: '#f8f9fa', borderRadius: '4px' },
  activeTab: { padding: '10px 20px', cursor: 'pointer', border: '1px solid #007BFF', background: '#007BFF', color: 'white', borderRadius: '4px' },
  subTab: { padding: '5px 10px', cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 'bold', color: '#555' },
  subTabActive: { padding: '5px 10px', cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 'bold', color: '#007BFF', borderBottom: '2px solid #007BFF' }
};