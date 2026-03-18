import React, { useState, useMemo } from "react";


type Service = { 
  id: string; 
  name: string; 
  price: number; 
  duration: number;
  availableHours: string; 
};
type Staff = { id: string; name: string; maxPerDay: number; workHours: string };
type AppointmentStatus = "Chờ duyệt" | "Xác nhận" | "Hoàn thành" | "Hủy";

type Appointment = {
  id: string;
  customerName: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  rating?: number;
  staffReply?: string;
};

type TabType = "book" | "list" | "stats" | "staff";

const INITIAL_SERVICES: Service[] = [
  { id: "s1", name: "Cắt tóc", price: 100000, duration: 30, availableHours: "08:00-20:00" },
  { id: "s2", name: "Spa thư giãn", price: 200000, duration: 60, availableHours: "10:00-18:00" },
];

const INITIAL_STAFF: Staff[] = [
  { id: "st1", name: "Nguyen Linh", maxPerDay: 4, workHours: "09:00-17:00" },
  { id: "st2", name: "Tran Minh", maxPerDay: 5, workHours: "08:00-16:00" },
];

export default function Bai1() {
  const [activeTab, setActiveTab] = useState<TabType>("book");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services] = useState(INITIAL_SERVICES);
  const [staffs] = useState(INITIAL_STAFF);

  const [form, setForm] = useState({
    customerName: "",
    serviceId: "s1",
    staffId: "st1",
    date: "",
    time: "",
  });


  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };


  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find((s) => s.id === form.serviceId)!;
    const staff = staffs.find((s) => s.id === form.staffId)!;

    const [start, end] = staff.workHours.split("-");
    if (toMinutes(form.time) < toMinutes(start) || toMinutes(form.time) + service.duration > toMinutes(end)) {
      return alert(`Ngoài giờ làm việc của nhân viên ${staff.name} (${staff.workHours})`);
    }

    const [sStart, sEnd] = service.availableHours.split("-");
    if (toMinutes(form.time) < toMinutes(sStart) || toMinutes(form.time) + service.duration > toMinutes(sEnd)) {
      return alert(`Dịch vụ này chỉ phục vụ từ ${service.availableHours}`);
    }

    const isOverlap = appointments.some((a) => {
      if (a.staffId !== form.staffId || a.date !== form.date || a.status === "Hủy") return false;
      const oldSrv = services.find((s) => s.id === a.serviceId)!;
      const s1 = toMinutes(a.time);
      const e1 = s1 + oldSrv.duration;
      const s2 = toMinutes(form.time);
      const e2 = s2 + service.duration;
      return s1 < e2 && s2 < e1;
    });

    if (isOverlap) return alert("Trùng lịch với lịch hẹn khác của nhân viên!");

    setAppointments([...appointments, { id: Date.now().toString(), ...form, status: "Chờ duyệt" }]);
    alert("Đặt lịch thành công!");
    setForm({ ...form, customerName: "", time: "", date: "" });
  };

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const addRating = (id: string, rating: number) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, rating } : a)));
  };

  const addStaffReply = (id: string, reply: string) => {
    if (!reply.trim()) return;
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, staffReply: reply } : a)));
  };

  
  const stats = useMemo(() => {
    const done = appointments.filter((a) => a.status === "Hoàn thành");
    const apptsByDate: Record<string, number> = {};
    const apptsByMonth: Record<string, number> = {};
    let totalRevenue = 0;
    const revByService: Record<string, number> = {};
    const revByStaff: Record<string, number> = {};

    appointments.forEach(a => {
      if (a.status !== "Hủy") {
        apptsByDate[a.date] = (apptsByDate[a.date] || 0) + 1;
        const month = a.date.substring(0, 7);
        apptsByMonth[month] = (apptsByMonth[month] || 0) + 1;
      }
    });

    done.forEach((a) => {
      const s = services.find((x) => x.id === a.serviceId);
      const price = s?.price || 0;
      totalRevenue += price;
      revByService[a.serviceId] = (revByService[a.serviceId] || 0) + price;
      revByStaff[a.staffId] = (revByStaff[a.staffId] || 0) + price;
    });

    return { totalRevenue, revByService, revByStaff, apptsByDate, apptsByMonth };
  }, [appointments, services]);

  return (
    <div className="container">
    
      <style>{`
        .container { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 30px auto; padding: 20px; background: #f4f7f6; min-height: 100vh; border-radius: 15px; }
        .nav-tabs { display: flex; gap: 10px; margin-bottom: 25px; }
        .tab-btn { flex: 1; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; background: white; color: #666; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .tab-btn.active { background: #007bff; color: white; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,123,255,0.3); }
        
        .card { background: white; padding: 25px; border-radius: 12px; shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #007bff; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-size: 14px; margin-bottom: 5px; font-weight: 600; color: #333; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
        .btn-submit { width: 100%; background: #007bff; color: white; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        
        .appt-item { background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 10px; margin-bottom: 15px; }
        .appt-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .status-badge { font-size: 11px; padding: 4px 8px; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
        .status-chờ { background: #fff3cd; color: #856404; }
        .status-xác { background: #cce5ff; color: #004085; }
        .status-hoàn { background: #d4edda; color: #155724; }
        .status-hủy { background: #f8d7da; color: #721c24; }

        .reply-box { margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ddd; }
        .input-reply { background: #f0f7ff; border: 1px solid #cce5ff; margin-top: 5px; }
        .staff-reply-text { background: #f8f9fa; padding: 10px; border-left: 4px solid #007bff; border-radius: 4px; font-style: italic; font-size: 14px; }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .stat-card { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .revenue-total { font-size: 24px; color: #28a745; font-weight: bold; text-align: center; margin-bottom: 20px; background: white; padding: 20px; border-radius: 10px; }
        
        .rating-star { color: #f39c12; font-weight: bold; font-size: 18px; }
      `}</style>

   
      <div className="nav-tabs">
        <button className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>📅 Đặt Lịch</button>
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>📋 Danh Sách</button>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 Thống Kê</button>
        <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>👥 Nhân Viên</button>
      </div>

  
      <div className="content">
        
       
        {activeTab === "book" && (
          <div className="card" style={{maxWidth: '500px', margin: '0 auto'}}>
            <h2 style={{textAlign: 'center', marginTop: 0}}>Đặt Lịch Hẹn</h2>
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>Tên khách hàng</label>
                <input required placeholder="Nhập tên..." value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Dịch vụ (Khung giờ hoạt động)</label>
                <select value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value})}>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.availableHours})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Nhân viên thực hiện</label>
                <select value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})}>
                  {staffs.map(s => <option key={s.id} value={s.id}>{s.name} ({s.workHours})</option>)}
                </select>
              </div>
              <div className="form-group" style={{display: 'flex', gap: '10px'}}>
                <div style={{flex: 1}}>
                  <label>Ngày</label>
                  <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div style={{flex: 1}}>
                  <label>Giờ</label>
                  <input type="time" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                </div>
              </div>
              <button className="btn-submit">Xác nhận đặt lịch</button>
            </form>
          </div>
        )}

      
        {activeTab === "list" && (
          <div className="card">
            <h2 style={{marginTop: 0}}>Lịch hẹn gần đây</h2>
            {appointments.length === 0 && <p style={{textAlign: 'center', color: '#999'}}>Chưa có lịch hẹn nào được tạo.</p>}
            {appointments.map(a => {
              const service = services.find(s => s.id === a.serviceId);
              const endTime = minutesToTime(toMinutes(a.time) + (service?.duration || 0));
              return (
                <div key={a.id} className="appt-item">
                  <div className="appt-header">
                    <div>
                      <div style={{fontWeight: 'bold', fontSize: '17px'}}>{a.customerName} - <span style={{color: '#007bff'}}>{service?.name}</span></div>
                      <div style={{fontSize: '13px', color: '#666', marginTop: '4px'}}>
                        🕒 {a.time} - {endTime} | 📅 {a.date}
                      </div>
                      <span className={`status-badge status-${a.status.substring(0, 3).toLowerCase()}`}>{a.status}</span>
                    </div>
                    <div style={{display: 'flex', gap: '5px'}}>
                      {a.status === "Chờ duyệt" && <button onClick={() => updateStatus(a.id, "Xác nhận")} style={{color: 'blue', cursor: 'pointer', border: '1px solid blue', background: 'none', borderRadius: '4px'}}>Duyệt</button>}
                      {a.status === "Xác nhận" && <button onClick={() => updateStatus(a.id, "Hoàn thành")} style={{color: 'green', cursor: 'pointer', border: '1px solid green', background: 'none', borderRadius: '4px'}}>Xong</button>}
                      {a.status !== "Hủy" && a.status !== "Hoàn thành" && <button onClick={() => updateStatus(a.id, "Hủy")} style={{color: 'red', cursor: 'pointer', border: '1px solid red', background: 'none', borderRadius: '4px'}}>Hủy</button>}
                    </div>
                  </div>

            
                  {a.status === "Hoàn thành" && (
                    <div className="reply-box">
                      {!a.rating ? (
                        <div>
                          <label style={{fontSize: '12px', color: '#888'}}>Khách hàng đánh giá (1-5 sao):</label>
                          <input type="number" min={1} max={5} style={{width: '100px'}} placeholder="Nhập sao..." onBlur={e => e.target.value && addRating(a.id, Number(e.target.value))} />
                        </div>
                      ) : (
                        <div>
                          <p style={{margin: '0 0 10px 0'}}>Khách đánh giá: <span className="rating-star">{a.rating} ⭐</span></p>
                          {!a.staffReply ? (
                            <div>
                              <label style={{fontSize: '12px', color: '#007bff'}}>Nhân viên phản hồi khách hàng:</label>
                              <input 
                                className="input-reply" 
                                placeholder="Nhập nội dung và nhấn Enter..." 
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    addStaffReply(a.id, e.currentTarget.value);
                                    e.currentTarget.value = "";
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="staff-reply-text">
                              <strong>Phản hồi từ cửa hàng:</strong> {a.staffReply}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

  
        {activeTab === "stats" && (
          <div>
            <div className="revenue-total">Tổng Doanh Thu: {stats.totalRevenue.toLocaleString()} VNĐ</div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Doanh thu theo dịch vụ</h3>
                {services.map(s => (
                  <div key={s.id} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee'}}>
                    <span>{s.name}</span>
                    <span style={{fontWeight: 'bold'}}>{(stats.revByService[s.id] || 0).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
              <div className="stat-card">
                <h3>Số lượng lịch (Theo ngày)</h3>
                <div style={{maxHeight: '200px', overflow: 'auto'}}>
                  {Object.entries(stats.apptsByDate).map(([date, count]) => (
                    <div key={date} style={{display: 'flex', justifyContent: 'space-between', padding: '5px 0'}}>
                      <span>{date}</span>
                      <span style={{background: '#e9ecef', padding: '2px 8px', borderRadius: '10px', fontSize: '12px'}}>{count} khách</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

   
        {activeTab === "staff" && (
          <div className="card">
            <h2>Đội ngũ nhân viên & Đánh giá</h2>
            <div className="stats-grid">
              {staffs.map(s => {
                const ratings = appointments.filter(a => a.staffId === s.id && a.rating);
                const avg = ratings.length ? (ratings.reduce((sum, a) => sum + (a.rating || 0), 0) / ratings.length).toFixed(1) : "0";
                return (
                  <div key={s.id} className="stat-card" style={{textAlign: 'center', border: '1px solid #eee'}}>
                    <div style={{fontSize: '40px', marginBottom: '10px'}}>👤</div>
                    <div style={{fontWeight: 'bold', fontSize: '18px'}}>{s.name}</div>
                    <div style={{color: '#666', fontSize: '13px', margin: '5px 0'}}>Ca làm: {s.workHours}</div>
                    <div className="rating-star" style={{fontSize: '20px'}}>{avg} ⭐</div>
                    <div style={{fontSize: '12px', color: '#999'}}>(Từ {ratings.length} lượt khách)</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}