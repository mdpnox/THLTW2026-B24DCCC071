import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Bai1.css';

type TrangThaiBaiViet = 'Nhap' | 'DaDang';

interface Tag {
  id: string;
  ten: string;
}

interface BaiViet {
  id: string;
  tieuDe: string;
  slug: string;
  tomTat: string;
  noiDung: string;
  anhDaiDien: string;
  ngayDang: string;
  tacGia: string;
  danhSachTheId: string[];
  luotXem: number;
  trangThai: TrangThaiBaiViet;
}


const duLieuTheMau: Tag[] = [
  { id: 't1', ten: 'Ẩm thực' },
  { id: 't2', ten: 'Du lịch' },
  { id: 't3', ten: 'Thiên nhiên' },
  { id: 't4', ten: 'Kỳ quan' },
];

const taoBaiVietMau = (): BaiViet[] => {
  const titles = [
    { td: 'Phở Hà Nội – hương vị truyền thống', tag: 't1', tom: 'Quy trình nấu phở chuẩn vị Bắc' },
    { td: 'Du lịch Đà Lạt mùa hoa dã quỳ', tag: 't2', tom: 'Kinh nghiệm di chuyển, lưu trú và ăn uống' },
    { td: 'Vẻ đẹp của rừng Cúc Phương', tag: 't3', tom: 'Khám phá hệ sinh thái đa dạng' },
    { td: 'Kỳ quan Machu Picchu – thành phố mất tích', tag: 't4', tom: 'Bí ẩn chưa lời giải' },
    { td: 'Bún chả Hà Nội – ngon khó cưỡng', tag: 't1', tom: 'Công thức gia truyền từ phố cổ' },
    { td: 'Sapa – thung lũng mây ngàn', tag: 't2', tom: 'Lịch trình trekking 2 ngày' },
    { td: 'Vịnh Hạ Long – kỳ quan thiên nhiên thế giới', tag: 't3', tom: 'Những hang động kỳ bí' },
    { td: 'Taj Mahal – biểu tượng tình yêu', tag: 't4', tom: 'Câu chuyện đằng sau công trình' },
    { td: 'Cơm tấm Sài Gòn', tag: 't1', tom: 'Sự khác biệt giữa các vùng miền' },
    { td: 'Hội An – phố cổ lung linh', tag: 't2', tom: 'Top 10 món ăn đường phố' },
  ];
  return titles.map((item, idx) => ({
    id: `bv${idx + 1}`,
    tieuDe: item.td,
    slug: item.td.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
    tomTat: item.tom,
    noiDung: `## ${item.td}\n\nNội dung chi tiết đang được cập nhật...\n\n**Điểm nhấn**: ...\n\n- Mục 1\n- Mục 2`,
    anhDaiDien: `https://picsum.photos/seed/${idx + 200}/400/250`,
    ngayDang: new Date(Date.now() - idx * 86400000).toISOString().split('T')[0],
    tacGia: 'Nguyen Van A',  
    danhSachTheId: [item.tag],
    luotXem: Math.floor(Math.random() * 500),
    trangThai: idx === 9 ? 'Nhap' : 'DaDang',
  }));
};

const duLieuBaiVietMau = taoBaiVietMau();

const IconTimKiem = () => (<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>);
const IconQuayLai = () => (<svg viewBox="0 0 24 24"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>);
const IconSua = () => (<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const IconXoa = () => (<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const IconThem = () => (<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const IconMat = () => (<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);

export default function UngDungBlog() {
  const [trangHienTai, setTrangHienTai] = useState<'trang-chu' | 'chi-tiet' | 'gioi-thieu' | 'quan-ly-bai-viet' | 'quan-ly-the'>('trang-chu');
  const [danhSachBaiViet, setDanhSachBaiViet] = useState<BaiViet[]>(duLieuBaiVietMau);
  const [danhSachThe, setDanhSachThe] = useState<Tag[]>(duLieuTheMau);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [tuKhoaDebounced, setTuKhoaDebounced] = useState('');
  const [theDuocChon, setTheDuocChon] = useState<string | null>(null);
  const [trangSo, setTrangSo] = useState(1);
  const [idBaiVietDangXem, setIdBaiVietDangXem] = useState<string | null>(null);
  const [tuKhoaQuanLyBV, setTuKhoaQuanLyBV] = useState('');
  const [locTrangThaiBV, setLocTrangThaiBV] = useState<TrangThaiBaiViet | 'TatCa'>('TatCa');
  const [baiVietDangSua, setBaiVietDangSua] = useState<BaiViet | null>(null);
  const [theDangSua, setTheDangSua] = useState<Tag | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setTuKhoaDebounced(tuKhoaTimKiem); setTrangSo(1); }, 300);
    return () => clearTimeout(timer);
  }, [tuKhoaTimKiem]);

  useEffect(() => {
    if (trangHienTai === 'chi-tiet' && idBaiVietDangXem) {
      setDanhSachBaiViet(prev => prev.map(bv => bv.id === idBaiVietDangXem ? { ...bv, luotXem: bv.luotXem + 1 } : bv));
    }
  }, [trangHienTai, idBaiVietDangXem]);

  const layTenTheTuId = (ids: string[]) => danhSachThe.filter(t => ids.includes(t.id));
  const chuyenTrang = (trang: typeof trangHienTai) => { setTrangHienTai(trang); window.scrollTo(0, 0); };

  const renderTrangChu = () => {
    let baiVietDaLoc = danhSachBaiViet.filter(bv => bv.trangThai === 'DaDang');
    if (theDuocChon) baiVietDaLoc = baiVietDaLoc.filter(bv => bv.danhSachTheId.includes(theDuocChon));
    if (tuKhoaDebounced) {
      const kw = tuKhoaDebounced.toLowerCase();
      baiVietDaLoc = baiVietDaLoc.filter(bv => bv.tieuDe.toLowerCase().includes(kw) || bv.tomTat.toLowerCase().includes(kw));
    }
    const pageSize = 9;
    const total = Math.ceil(baiVietDaLoc.length / pageSize);
    const visible = baiVietDaLoc.slice((trangSo - 1) * pageSize, trangSo * pageSize);
    return (
      <div>
        <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', top: 10, left: 10, color: 'var(--mau-chu-nhat)' }}><IconTimKiem /></span>
            <input type="text" className="o-nhap" style={{ paddingLeft: 35, marginBottom: 0 }} placeholder="Tìm kiếm bài viết..." value={tuKhoaTimKiem} onChange={e => setTuKhoaTimKiem(e.target.value)} />
          </div>
          <div className="danh-sach-tag" style={{ margin: 0, alignItems: 'center' }}>
            <span className={`tag ${theDuocChon === null ? 'dang-chon' : ''}`} onClick={() => { setTheDuocChon(null); setTrangSo(1); }}>Tất cả</span>
            {danhSachThe.map(t => <span key={t.id} className={`tag ${theDuocChon === t.id ? 'dang-chon' : ''}`} onClick={() => { setTheDuocChon(t.id); setTrangSo(1); }}>{t.ten}</span>)}
          </div>
        </div>
        <div className="luoi-bai-viet">
          {visible.map(bv => (
            <div key={bv.id} className="the-bai-viet" onClick={() => { setIdBaiVietDangXem(bv.id); chuyenTrang('chi-tiet'); }}>
              <img src={bv.anhDaiDien} alt={bv.tieuDe} />
              <div className="noi-dung">
                <div className="danh-sach-tag">{layTenTheTuId(bv.danhSachTheId).map(t => <span key={t.id} className="tag">{t.ten}</span>)}</div>
                <h3>{bv.tieuDe}</h3>
                <p>{bv.tomTat}</p>
                <div className="thong-tin-phu"><span>{bv.tacGia}</span><span>{bv.ngayDang}</span></div>
              </div>
            </div>
          ))}
          {visible.length === 0 && <p>Không có bài viết.</p>}
        </div>
        {total > 1 && <div className="phan-trang">{Array.from({ length: total }).map((_, i) => <button key={i} className={trangSo === i + 1 ? 'hien-tai' : ''} onClick={() => setTrangSo(i + 1)}>{i + 1}</button>)}</div>}
      </div>
    );
  };

const renderChiTiet = () => {
  const baiViet = danhSachBaiViet.find((bv) => bv.id === idBaiVietDangXem);
  if (!baiViet) return <div>Không tìm thấy bài viết.</div>;

  const baiVietLienQuan = danhSachBaiViet
    .filter(
      (bv) =>
        bv.id !== baiViet.id &&
        bv.trangThai === 'DaDang' &&
        bv.danhSachTheId.some((id) => baiViet.danhSachTheId.includes(id))
    )
    .slice(0, 3);

  return (
    <div className="khung-chua">
      <button
        className="nut-bam phu"
        style={{ marginBottom: '20px' }}
        onClick={() => chuyenTrang('trang-chu')}
      >
        <IconQuayLai /> Quay lại danh sách
      </button>
      <img
        src={baiViet.anhDaiDien}
        alt="Ảnh đại diện"
        style={{
          width: '100%',
          height: '400px',
          objectFit: 'cover',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      />
      <h1 className="tieu-de-chinh">{baiViet.tieuDe}</h1>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          color: 'var(--mau-chu-nhat)',
          marginBottom: '20px',
          borderBottom: '1px solid var(--mau-vien)',
          paddingBottom: '20px',
        }}
      >
        <span>
          Tác giả: <b>{baiViet.tacGia}</b>
        </span>
        <span>Ngày đăng: {baiViet.ngayDang}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <IconMat /> {baiViet.luotXem} lượt xem
        </span>
      </div>

      <div className="danh-sach-tag">
        {layTenTheTuId(baiViet.danhSachTheId).map((t) => (
          <span key={t.id} className="tag">
            {t.ten}
          </span>
        ))}
      </div>

      <div className="noi-dung-markdown" style={{ marginTop: '20px', lineHeight: 1.8 }}>
        <ReactMarkdown>{baiViet.noiDung}</ReactMarkdown>
      </div>

      {baiVietLienQuan.length > 0 && (
        <div
          style={{
            marginTop: '50px',
            paddingTop: '20px',
            borderTop: '1px solid var(--mau-vien)',
          }}
        >
          <h3>Bài viết liên quan</h3>
          <div className="luoi-bai-viet" style={{ marginTop: '15px' }}>
            {baiVietLienQuan.map((bv) => (
              <div
                key={bv.id}
                className="the-bai-viet"
                onClick={() => setIdBaiVietDangXem(bv.id)}
              >
                <img src={bv.anhDaiDien} alt={bv.tieuDe} style={{ height: '120px' }} />
                <div className="noi-dung">
                  <h3 style={{ fontSize: '16px' }}>{bv.tieuDe}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

  const renderGioiThieu = () => (
    <div className="khung-chua" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
      <img src="https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/anh-den-ngau-005.jpg" alt="Avatar" style={{ borderRadius: '50%', width: 150, height: 150, marginBottom: 20 }} />
      <h2>Nguyen Van A</h2>
      <p style={{ color: 'var(--mau-chu-nhat)', marginBottom: 20 }}>Đam mê ẩm thực & du lịch | Blog chia sẻ trải nghiệm thực tế</p>
      <p>Xin chào! Tôi thích xê dịch, thưởng thức món ngon và khám phá kỳ quan thiên nhiên. Hy vọng truyền cảm hứng cho bạn!</p>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
        {danhSachThe.map(t => <span key={t.id} className="tag">{t.ten}</span>)}
      </div>
      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 20 }}>
        <a href="https://www.facebook.com" style={{ color: 'var(--mau-chu-dao)' }}>Facebook</a>
        <a href="https://www.youtube.com" style={{ color: 'var(--mau-chu-dao)' }}>YouTube</a>
      </div>
    </div>
  );

  const renderQuanLyBaiViet = () => {
    if (baiVietDangSua) {
      const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const updated: BaiViet = {
          ...baiVietDangSua,
          id: baiVietDangSua.id || `bv_${Date.now()}`,
          tieuDe: form.get('tieuDe') as string,
          slug: form.get('slug') as string,
          tomTat: form.get('tomTat') as string,
          noiDung: form.get('noiDung') as string,
          anhDaiDien: form.get('anhDaiDien') as string,
          trangThai: form.get('trangThai') as TrangThaiBaiViet,
          tacGia: 'Nguyen Van A',
          ngayDang: baiVietDangSua.ngayDang || new Date().toISOString().split('T')[0],
          luotXem: baiVietDangSua.luotXem || 0,
          danhSachTheId: form.getAll('danhSachTheId') as string[],
        };
        if (baiVietDangSua.id) setDanhSachBaiViet(prev => prev.map(b => b.id === updated.id ? updated : b));
        else setDanhSachBaiViet([updated, ...danhSachBaiViet]);
        setBaiVietDangSua(null);
      };
      return (
        <div className="khung-chua">
          <h2>{baiVietDangSua.id ? 'Sửa bài viết' : 'Thêm bài viết mới'}</h2>
          <form onSubmit={handleSave}>
            {['tieuDe', 'slug', 'anhDaiDien', 'tomTat', 'noiDung'].map(field => (
              <div key={field} className="nhom-form">
                <label>{field === 'anhDaiDien' ? 'Ảnh URL' : field === 'tomTat' ? 'Tóm tắt' : field === 'noiDung' ? 'Nội dung' : field}</label>
                {field === 'tomTat' ? <textarea name={field} className="o-nhap" defaultValue={baiVietDangSua[field as keyof BaiViet] as string} required style={{ minHeight: 60 }} />
                 : field === 'noiDung' ? <textarea name={field} className="o-nhap" defaultValue={baiVietDangSua[field as keyof BaiViet] as string} required style={{ minHeight: 150 }} />
                 : <input name={field} className="o-nhap" defaultValue={baiVietDangSua[field as keyof BaiViet] as string} required />}
              </div>
            ))}
            <div className="nhom-form"><label>Trạng thái</label><select name="trangThai" className="o-nhap" defaultValue={baiVietDangSua.trangThai}><option value="DaDang">Đã đăng</option><option value="Nhap">Nháp</option></select></div>
            <div className="nhom-form"><label>Thẻ (Ctrl+Click)</label><select name="danhSachTheId" multiple className="o-nhap" style={{ height: 100 }} defaultValue={baiVietDangSua.danhSachTheId}>{danhSachThe.map(t => <option key={t.id} value={t.id}>{t.ten}</option>)}</select></div>
            <div className="hanh-dong"><button type="submit" className="nut-bam">Lưu</button><button type="button" className="nut-bam phu" onClick={() => setBaiVietDangSua(null)}>Hủy</button></div>
          </form>
        </div>
      );
    }
    const filtered = danhSachBaiViet.filter(bv => (locTrangThaiBV === 'TatCa' || bv.trangThai === locTrangThaiBV) && bv.tieuDe.toLowerCase().includes(tuKhoaQuanLyBV.toLowerCase()));
    return (
      <div className="khung-chua">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}><h2 className="tieu-de-chinh">Quản lý bài viết</h2><button className="nut-bam" onClick={() => setBaiVietDangSua({ id: '', tieuDe: '', slug: '', tomTat: '', noiDung: '', anhDaiDien: '', ngayDang: '', tacGia: 'Lê Khám Phá', danhSachTheId: [], luotXem: 0, trangThai: 'Nhap' })}><IconThem /> Thêm mới</button></div>
        <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}><input className="o-nhap" style={{ flex: 2, marginBottom: 0 }} placeholder="Tìm tiêu đề..." value={tuKhoaQuanLyBV} onChange={e => setTuKhoaQuanLyBV(e.target.value)} /><select className="o-nhap" style={{ flex: 1, marginBottom: 0 }} value={locTrangThaiBV} onChange={e => setLocTrangThaiBV(e.target.value as any)}><option value="TatCa">Tất cả</option><option value="DaDang">Đã đăng</option><option value="Nhap">Nháp</option></select></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="bang-quan-ly"><thead><tr><th>Tiêu đề</th><th>Trạng thái</th><th>Thẻ</th><th>Lượt xem</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>{filtered.map(bv => (<tr key={bv.id}><td>{bv.tieuDe}</td><td><span className={`tag ${bv.trangThai === 'DaDang' ? 'dang-chon' : ''}`}>{bv.trangThai === 'DaDang' ? 'Đã đăng' : 'Nháp'}</span></td><td>{layTenTheTuId(bv.danhSachTheId).map(t => t.ten).join(', ')}</td><td>{bv.luotXem}</td><td>{bv.ngayDang}</td><td><div className="hanh-dong"><button className="nut-bam phu" style={{ padding: 6 }} onClick={() => setBaiVietDangSua(bv)}><IconSua /></button><button className="nut-bam nguy-hiem" style={{ padding: 6 }} onClick={() => { if (window.confirm('Xóa?')) setDanhSachBaiViet(prev => prev.filter(b => b.id !== bv.id)); }}><IconXoa /></button></div></td></tr>))}</tbody></table>
        </div>
      </div>
    );
  };


  const renderQuanLyThe = () => {
    const handleSaveTag = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const name = (new FormData(e.currentTarget).get('tenThe') as string).trim();
      if (!name) return;
      if (theDangSua) setDanhSachThe(prev => prev.map(t => t.id === theDangSua.id ? { ...t, ten: name } : t));
      else setDanhSachThe([...danhSachThe, { id: `t_${Date.now()}`, ten: name }]);
      setTheDangSua(null);
    };
    return (
      <div className="khung-chua">
        <h2 className="tieu-de-chinh">Quản lý thẻ</h2>
        <form onSubmit={handleSaveTag} style={{ display: 'flex', gap: 10, marginBottom: 20 }}><input name="tenThe" className="o-nhap" style={{ marginBottom: 0, flex: 1 }} placeholder="Tên thẻ mới..." defaultValue={theDangSua?.ten || ''} required /><button type="submit" className="nut-bam">{theDangSua ? 'Cập nhật' : 'Thêm'}</button>{theDangSua && <button type="button" className="nut-bam phu" onClick={() => setTheDangSua(null)}>Hủy</button>}</form>
        <table className="bang-quan-ly"><thead><tr><th>Tên thẻ</th><th>Số bài viết</th><th>Thao tác</th></tr></thead><tbody>{danhSachThe.map(t => (<tr key={t.id}><td><b>{t.ten}</b></td><td>{danhSachBaiViet.filter(bv => bv.danhSachTheId.includes(t.id)).length}</td><td><div className="hanh-dong"><button className="nut-bam phu" style={{ padding: 6 }} onClick={() => setTheDangSua(t)}><IconSua /></button><button className="nut-bam nguy-hiem" style={{ padding: 6 }} onClick={() => { if (window.confirm('Xóa thẻ?')) { setDanhSachThe(prev => prev.filter(x => x.id !== t.id)); setDanhSachBaiViet(prev => prev.map(bv => ({ ...bv, danhSachTheId: bv.danhSachTheId.filter(id => id !== t.id) }))); } }}><IconXoa /></button></div></td></tr>))}</tbody></table>
      </div>
    );
  };

  return (
    <div className="ung-dung">
      <nav className="thanh-dieu-huong">
        <button className={trangHienTai === 'trang-chu' ? 'dang-chon' : ''} onClick={() => chuyenTrang('trang-chu')}>Trang chủ</button>
        <button className={trangHienTai === 'gioi-thieu' ? 'dang-chon' : ''} onClick={() => chuyenTrang('gioi-thieu')}>Giới thiệu</button>
        <div style={{ flex: 1 }} />
        <button className={trangHienTai === 'quan-ly-bai-viet' ? 'dang-chon' : ''} onClick={() => chuyenTrang('quan-ly-bai-viet')}>QL Bài viết</button>
        <button className={trangHienTai === 'quan-ly-the' ? 'dang-chon' : ''} onClick={() => chuyenTrang('quan-ly-the')}>QL Thẻ</button>
      </nav>
      <main>
        {trangHienTai === 'trang-chu' && renderTrangChu()}
        {trangHienTai === 'chi-tiet' && renderChiTiet()}
        {trangHienTai === 'gioi-thieu' && renderGioiThieu()}
        {trangHienTai === 'quan-ly-bai-viet' && renderQuanLyBaiViet()}
        {trangHienTai === 'quan-ly-the' && renderQuanLyThe()}
      </main>
    </div>
  );
}