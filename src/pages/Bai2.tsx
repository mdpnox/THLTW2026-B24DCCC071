import React, { useState, useMemo } from 'react';


interface KnowledgeBlock { id: string; name: string; }
interface Subject { id: string; name: string; credits: number; }
type Difficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

interface Question {
  id: string;
  subjectId: string;
  kbId: string;
  content: string;
  difficulty: Difficulty;
}

interface Exam {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}


export default function Bai2() {

  const [activeTab, setActiveTab] = useState(1);


  const [kbList, setKbList] = useState<KnowledgeBlock[]>([
    { id: 'K01', name: 'Tổng quan' },
    { id: 'K02', name: 'Chuyên sâu' }
  ]);
  const [subList, setSubList] = useState<Subject[]>([
    { id: 'IT01', name: 'Python', credits: 3 }
  ]);
  const [qList, setQList] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

 
  const [kbIn, setKbIn] = useState({ id: '', name: '' });
  const [subIn, setSubIn] = useState({ id: '', name: '', credits: 0 });
  const [qIn, setQIn] = useState<Question>({ 
    id: '', subjectId: '', kbId: '', content: '', difficulty: 'Dễ' 
  });
  

  const [qFilter, setQFilter] = useState({ subId: '', kbId: '', diff: '' });
  const [examCfg, setExamCfg] = useState({ 
    title: '', subId: '', kbId: '', diff: 'Dễ' as Difficulty, qty: 1 
  });



  const handleAddKB = () => {
    if (!kbIn.id.trim() || !kbIn.name.trim()) return alert("Hãy nhập ID và Tên khối!");
    if (kbList.some(i => i.id === kbIn.id)) return alert("Mã ID này đã tồn tại!");
    setKbList([...kbList, kbIn]);
    setKbIn({ id: '', name: '' });
  };

  const handleAddSub = () => {
    if (!subIn.id.trim() || !subIn.name.trim() || subIn.credits <= 0) return alert("Hãy nhập đầy đủ thông tin môn học!");
    setSubList([...subList, subIn]);
    setSubIn({ id: '', name: '', credits: 0 });
  };


  const handleAddQ = () => {
    if (!qIn.id || !qIn.content || !qIn.subjectId || !qIn.kbId) return alert("Hãy điền đủ thông tin câu hỏi!");
    setQList([...qList, qIn]);
    setQIn({ ...qIn, id: '', content: '' });
  };


  const filteredQuestions = useMemo(() => {
    return qList.filter(q => 
      (qFilter.subId === '' || q.subjectId === qFilter.subId) &&
      (qFilter.kbId === '' || q.kbId === qFilter.kbId) &&
      (qFilter.diff === '' || q.difficulty === qFilter.diff)
    );
  }, [qList, qFilter]);


  const handleGenerateExam = () => {
    if (!examCfg.title.trim()) return alert("Hãy nhập tên đề thi!");
    

    const pool = qList.filter(q => 
      q.subjectId === examCfg.subId && 
      q.kbId === examCfg.kbId && 
      q.difficulty === examCfg.diff
    );

    if (pool.length < examCfg.qty) {
      return alert(`Lỗi: Ngân hàng chỉ có ${pool.length} câu phù hợp, không đủ ${examCfg.qty} câu như yêu cầu!`);
    }


    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, examCfg.qty);
    const newExam: Exam = {
      id: `EX-${Date.now()}`,
      title: examCfg.title,
      questions: selected,
      createdAt: new Date().toLocaleString()
    };
    setExams([newExam, ...exams]);
    alert("Tạo thành công!");
  };


  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Hệ Thống Quản Lý Ngân Hàng Câu Hỏi</h1>
      

      <div style={{ display: 'flex', marginBottom: '0px' }}>
        <button onClick={() => setActiveTab(1)} style={activeTab === 1 ? tabActive : tabInactive}>
          Danh mục khối kiến thức và môn học
        </button>
        <button onClick={() => setActiveTab(2)} style={activeTab === 2 ? tabActive : tabInactive}>
          Câu hỏi
        </button>
        <button onClick={() => setActiveTab(3)} style={activeTab === 3 ? tabActive : tabInactive}>
          Đề thi
        </button>
      </div>

      <div style={contentBox}>

        {activeTab === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <section>
              <h3 style={sectionTitle}>1. Khối kiến thức</h3>
              <div style={formRow}>
                <input placeholder="ID (VD: K01)" style={inputS} value={kbIn.id} onChange={e => setKbIn({...kbIn, id: e.target.value})} />
                <input placeholder="Tên khối" style={inputS} value={kbIn.name} onChange={e => setKbIn({...kbIn, name: e.target.value})} />
                <button onClick={handleAddKB} style={btnBlue}>Thêm</button>
              </div>
              <Table 
                data={kbList.map(i => ({ id: i.id, col1: i.id, col2: i.name }))} 
                headers={['Mã ID', 'Tên khối kiến thức']} 
                onDel={(id) => setKbList(kbList.filter(i => i.id !== id))} 
              />
            </section>

            <section>
              <h3 style={sectionTitle}>2. Môn học</h3>
              <div style={formRow}>
                <input placeholder="Mã môn" style={inputS} value={subIn.id} onChange={e => setSubIn({...subIn, id: e.target.value})} />
                <input placeholder="Tên môn" style={inputS} value={subIn.name} onChange={e => setSubIn({...subIn, name: e.target.value})} />
                <input type="number" placeholder="Tín chỉ" style={{...inputS, width: '70px'}} value={subIn.credits || ''} onChange={e => setSubIn({...subIn, credits: +e.target.value})} />
                <button onClick={handleAddSub} style={btnGreen}>Thêm</button>
              </div>
              <Table 
                data={subList.map(i => ({ id: i.id, col1: i.id, col2: i.name, col3: i.credits }))} 
                headers={['Mã môn', 'Tên môn học', 'Số tín chỉ']} 
                onDel={(id) => setSubList(subList.filter(i => i.id !== id))} 
              />
            </section>
          </div>
        )}


        {activeTab === 2 && (
          <div>
            <h3 style={sectionTitle}>3. Quản lý câu hỏi tự luận</h3>
            <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <input placeholder="Mã câu hỏi" style={inputS} value={qIn.id} onChange={e => setQIn({...qIn, id: e.target.value})} />
              <select style={inputS} value={qIn.subjectId} onChange={e => setQIn({...qIn, subjectId: e.target.value})}>
                <option value="">-- Chọn môn học --</option>
                {subList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select style={inputS} value={qIn.kbId} onChange={e => setQIn({...qIn, kbId: e.target.value})}>
                <option value="">-- Chọn khối KT --</option>
                {kbList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <select style={inputS} value={qIn.difficulty} onChange={e => setQIn({...qIn, difficulty: e.target.value as Difficulty})}>
                <option value="Dễ">Dễ</option><option value="Trung bình">Trung bình</option><option value="Khó">Khó</option><option value="Rất khó">Rất khó</option>
              </select>
              <textarea placeholder="Nội dung câu hỏi..." style={{...inputS, gridColumn: '1 / -1', height: '60px'}} value={qIn.content} onChange={e => setQIn({...qIn, content: e.target.value})} />
              <button onClick={handleAddQ} style={{...btnBlue, gridColumn: '1 / -1'}}>Lưu câu hỏi</button>
            </div>

            <div style={{ marginTop: '25px', padding: '15px', background: '#eee', borderRadius: '5px', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <strong>🔍 Tìm kiếm:</strong>
              <select onChange={e => setQFilter({...qFilter, subId: e.target.value})} style={inputS}>
                <option value="">Tất cả môn</option>
                {subList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select onChange={e => setQFilter({...qFilter, diff: e.target.value})} style={inputS}>
                <option value="">Mọi mức độ</option>
                {['Dễ', 'Trung bình', 'Khó', 'Rất khó'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <Table 
              data={filteredQuestions.map(q => ({ 
                id: q.id, 
                col1: q.id, 
                col2: q.content, 
                col3: q.difficulty, 
                col4: subList.find(s => s.id === q.subjectId)?.name 
              }))} 
              headers={['Mã', 'Nội dung', 'Độ khó', 'Môn học']} 
              onDel={(id) => setQList(qList.filter(q => q.id !== id))} 
            />
          </div>
        )}


        {activeTab === 3 && (
          <div>
            <h3 style={sectionTitle}>4. Quản lý đề thi</h3>
            <div style={card}>
              <h4>Tạo đề thi mới theo cấu trúc</h4>
              <div style={{ ...formRow, alignItems: 'center' }}>
                <input placeholder="Tên đề thi" style={{...inputS, flex: 2}} value={examCfg.title} onChange={e => setExamCfg({...examCfg, title: e.target.value})} />
                <select style={inputS} onChange={e => setExamCfg({...examCfg, subId: e.target.value})}>
                  <option value="">Môn học</option>
                  {subList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select style={inputS} onChange={e => setExamCfg({...examCfg, kbId: e.target.value})}>
                  <option value="">Khối KT</option>
                  {kbList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
                <select style={inputS} value={examCfg.diff} onChange={e => setExamCfg({...examCfg, diff: e.target.value as Difficulty})}>
                  {['Dễ', 'Trung bình', 'Khó', 'Rất khó'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="number" title="Số lượng" style={{width: '60px', padding: '8px'}} value={examCfg.qty} onChange={e => setExamCfg({...examCfg, qty: +e.target.value})} />
                <button onClick={handleGenerateExam} style={btnBlue}>Tạo đề</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {exams.map(ex => (
                <div key={ex.id} style={{...card, borderTop: '4px solid #3498db', position: 'relative'}}>
                  <button onClick={() => setExams(exams.filter(e => e.id !== ex.id))} style={deleteIcon}>X</button>
                  <h4 style={{margin: '0 0 10px 0'}}>{ex.title}</h4>
                  <small style={{color: '#7f8c8d'}}>{ex.createdAt}</small>
                  <hr />
                  <ul style={{paddingLeft: '20px', fontSize: '14px'}}>
                    {ex.questions.map(q => <li key={q.id} style={{marginBottom: '5px'}}>{q.content} <em style={{color: '#27ae60'}}>({q.difficulty})</em></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


const Table = ({ data, headers, onDel }: { data: any[], headers: string[], onDel: (id: string) => void }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={tableStyle}>
      <thead>
        <tr style={{ background: '#ecf0f1' }}>
          {headers.map(h => <th key={h} style={thStyle}>{h}</th>)}
          <th style={thStyle}>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={headers.length + 1} style={{textAlign: 'center', padding: '20px', color: '#95a5a6'}}>Chưa có dữ liệu</td></tr>
        ) : data.map((item, idx) => (
          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
            {Object.keys(item).filter(k => k !== 'id').map((k, i) => (
              <td key={i} style={tdStyle}>{item[k]}</td>
            ))}
            <td style={tdStyle}>
              <button onClick={() => onDel(item.id)} style={btnDel}>Xóa</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


const tabActive: React.CSSProperties = { padding: '12px 24px', cursor: 'pointer', border: 'none', borderRadius: '8px 8px 0 0', background: '#3498db', color: 'white', fontWeight: 'bold', fontSize: '14px' };
const tabInactive: React.CSSProperties = { padding: '12px 24px', cursor: 'pointer', border: 'none', borderRadius: '8px 8px 0 0', background: '#e0e0e0', color: '#555', fontSize: '14px', marginRight: '4px' };
const contentBox: React.CSSProperties = { background: '#fff', padding: '30px', borderRadius: '0 8px 8px 8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #ddd' };
const sectionTitle: React.CSSProperties = { borderLeft: '5px solid #3498db', paddingLeft: '10px', color: '#2c3e50', marginBottom: '20px' };
const inputS: React.CSSProperties = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' };
const btnBlue: React.CSSProperties = { padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnGreen: React.CSSProperties = { ...btnBlue, background: '#27ae60' };
const btnDel: React.CSSProperties = { color: '#e74c3c', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' };
const formRow: React.CSSProperties = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thStyle: React.CSSProperties = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' };
const tdStyle: React.CSSProperties = { padding: '12px', fontSize: '14px' };
const card: React.CSSProperties = { background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const deleteIcon: React.CSSProperties = { position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none', color: '#ccc', cursor: 'pointer', fontSize: '18px' };