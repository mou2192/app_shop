import { useEffect, useState } from "react";
import {
  ArrowUpLeft,
  Bell,
  Boxes,
  Check,
  ChevronLeft,
  CircleDollarSign,
  Copy,
  FileText,
  LayoutDashboard,
  Menu,
  PackagePlus,
  Plus,
  ReceiptText,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import "./index.css";

type Client = { id: string; name: string; phone: string; balance: number; avatar: string; tone: string };
type Product = { id: string; name: string; price: number; stock: number; category: string };
type Invoice = { id: string; clientId: string; date: string; status: "مدفوعة" | "معلقة"; total: number; due: number; items: string[] };

const seedClients: Client[] = [
  { id: "c1", name: "متجر النور", phone: "967771234567", balance: 12850, avatar: "ن", tone: "violet" },
  { id: "c2", name: "أحمد محمد", phone: "967733456789", balance: 4260, avatar: "أ", tone: "blue" },
  { id: "c3", name: "بقالة الوفاء", phone: "967711998877", balance: 3100, avatar: "و", tone: "orange" },
  { id: "c4", name: "مؤسسة السعيد", phone: "967700112233", balance: 0, avatar: "س", tone: "green" },
];
const products: Product[] = [
  { id: "p1", name: "أرز بسمتي فاخر 5 كجم", price: 4200, stock: 84, category: "مواد غذائية" },
  { id: "p2", name: "زيت دوار الشمس 1.5 لتر", price: 1800, stock: 142, category: "مواد غذائية" },
  { id: "p3", name: "سكر أبيض 10 كجم", price: 5200, stock: 31, category: "مواد غذائية" },
  { id: "p4", name: "مناديل ورقية عائلية", price: 950, stock: 218, category: "منزلية" },
];
const seedInvoices: Invoice[] = [
  { id: "INV-1048", clientId: "c1", date: "اليوم، 10:42 ص", status: "معلقة", total: 12850, due: 12850, items: ["أرز بسمتي فاخر 5 كجم", "زيت دوار الشمس 1.5 لتر"] },
  { id: "INV-1047", clientId: "c2", date: "أمس، 04:18 م", status: "معلقة", total: 4260, due: 4260, items: ["سكر أبيض 10 كجم"] },
  { id: "INV-1046", clientId: "c3", date: "28 سبتمبر 2026", status: "معلقة", total: 3100, due: 3100, items: ["مناديل ورقية عائلية"] },
  { id: "INV-1045", clientId: "c4", date: "27 سبتمبر 2026", status: "مدفوعة", total: 7800, due: 0, items: ["أرز بسمتي فاخر 5 كجم"] },
];
const money = (value: number) => `${new Intl.NumberFormat("ar-YE").format(value)} ر.ي`;

function App() {
  const [active, setActive] = useState("overview");
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem("debtbook-clients") || JSON.stringify(seedClients)));
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem("debtbook-invoices") || JSON.stringify(seedInvoices)));
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>(() => JSON.parse(localStorage.getItem("debtbook-products") || JSON.stringify(products)));
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("c1");
  const [selectedProduct, setSelectedProduct] = useState("p1");
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState(0);

  const currentClient = clients.find((c) => c.id === selectedClient) ?? clients[0];
  const currentProduct = catalog.find((p) => p.id === selectedProduct) ?? catalog[0];
  const total = (currentProduct?.price ?? 0) * qty;

  useEffect(() => { localStorage.setItem("debtbook-clients", JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem("debtbook-invoices", JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem("debtbook-products", JSON.stringify(catalog)); }, [catalog]);
  const filteredInvoices = invoices.filter((invoice) => {
    const client = clients.find((c) => c.id === invoice.clientId);
    return `${invoice.id} ${client?.name}`.includes(search);
  });

  const shareInvoice = (invoice: Invoice) => {
    const client = clients.find((c) => c.id === invoice.clientId);
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ invoice, client }))));
    const link = `${window.location.origin}/invoice/${invoice.id}?data=${encodeURIComponent(payload)}`;
    const text = `مرحباً ${client?.name}، هذه فاتورتك من دفتر الزهوب: ${link}`;
    navigator.clipboard?.writeText(link);
    window.open(`https://wa.me/${client?.phone}?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("تم تجهيز رابط الفاتورة وفتح واتساب");
  };

  const createInvoice = () => {
    const invoice: Invoice = {
      id: `INV-${1050 + invoices.length}`,
      clientId: currentClient.id,
      date: "الآن",
      status: payment >= total ? "مدفوعة" : "معلقة",
      total,
      due: Math.max(total - payment, 0),
      items: [currentProduct.name],
    };
    setInvoices([invoice, ...invoices]);
    setClients(clients.map((c) => c.id === currentClient.id ? { ...c, balance: c.balance + invoice.due } : c));
    setShowNewInvoice(false);
    toast.success(`تم إنشاء ${invoice.id} بنجاح`);
  };

  if (window.location.pathname.startsWith("/invoice/")) {
    const invoiceId = window.location.pathname.split("/").pop();
    const encoded = new URLSearchParams(window.location.search).get("data");
    let shared: { invoice: Invoice; client: Client } | null = null;
    try { if (encoded) shared = JSON.parse(decodeURIComponent(escape(atob(encoded)))); } catch { shared = null; }
    const invoice = shared?.invoice ?? invoices.find((item) => item.id === invoiceId) ?? invoices[0];
    const client = shared?.client ?? clients.find((item) => item.id === invoice.clientId) ?? clients[0];
    return <PublicInvoice invoice={invoice} client={client} />;
  }

  return (
    <div className="app-shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><div><strong>دفتر الزهوب</strong><span>إدارة أسهل، تحصيل أسرع</span></div></div>
        <div className="workspace"><div className="workspace-icon">ز</div><div><span>المتجر الرئيسي</span><small>الحساب النشط</small></div><ChevronLeft size={16} /></div>
        <nav>
          <p className="nav-label">القائمة الرئيسية</p>
          <NavItem icon={<LayoutDashboard size={18} />} text="نظرة عامة" active={active === "overview"} onClick={() => setActive("overview")} />
          <NavItem icon={<ReceiptText size={18} />} text="الفواتير" active={active === "invoices"} onClick={() => setActive("invoices")} badge={invoices.length.toString()} />
          <NavItem icon={<Users size={18} />} text="العملاء" active={active === "clients"} onClick={() => setActive("clients")} />
          <NavItem icon={<Boxes size={18} />} text="الأصناف والمنتجات" active={active === "products"} onClick={() => setActive("products")} />
          <p className="nav-label second">الإدارة</p>
          <NavItem icon={<WalletCards size={18} />} text="التقارير المالية" active={false} onClick={() => toast.info("التقارير ستكون متاحة قريباً")} />
          <NavItem icon={<Settings size={18} />} text="الإعدادات" active={false} onClick={() => toast.info("الإعدادات جاهزة للتخصيص")} />
        </nav>
        <div className="sidebar-bottom"><div className="sync-card"><div className="sync-icon"><Check size={15} /></div><div><strong>بياناتك محفوظة</strong><span>مزامنة آمنة مع السحابة</span></div></div><div className="user-card"><div className="avatar owner">م</div><div><strong>محمد الزهوب</strong><span>مالك المتجر</span></div><MoreDots /></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu"><Menu size={20} /></button><div className="breadcrumb"><span>الرئيسية</span><ChevronLeft size={15} /><strong>{active === "overview" ? "نظرة عامة" : active === "invoices" ? "الفواتير" : active === "clients" ? "العملاء" : "الأصناف والمنتجات"}</strong></div><div className="top-actions"><button className="icon-button"><Bell size={19} /><i /></button><div className="top-avatar">م</div></div></header>
        <div className="page-wrap">
          {active === "overview" && <Overview clients={clients} invoices={invoices} onNew={() => setShowNewInvoice(true)} onShare={shareInvoice} onNavigate={setActive} />}
          {active === "invoices" && <Invoices invoices={filteredInvoices} clients={clients} search={search} setSearch={setSearch} onNew={() => setShowNewInvoice(true)} onShare={shareInvoice} />}
          {active === "clients" && <Clients clients={clients} onNew={() => toast.success("يمكنك إضافة العميل من نموذج الفاتورة الجديد")} />}
          {active === "products" && <Products products={catalog} onAdd={() => setShowProduct(true)} />}
        </div>
      </main>
      {showNewInvoice && <Modal title="إنشاء فاتورة جديدة" onClose={() => setShowNewInvoice(false)}><div className="form-grid"><label>العميل<select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>الصنف<select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>{catalog.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>الكمية<input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} /></label><label>المبلغ المدفوع<input type="number" min="0" value={payment} onChange={(e) => setPayment(Number(e.target.value))} /></label></div><div className="invoice-total"><span>الإجمالي المستحق</span><strong>{money(total - payment)}</strong></div><button className="primary full" onClick={createInvoice}><ReceiptText size={17} /> حفظ الفاتورة وإصدار الرابط</button></Modal>}
      {showProduct && <Modal title="إضافة صنف جديد" onClose={() => setShowProduct(false)}><div className="empty-form"><div className="product-placeholder"><PackagePlus size={26} /></div><label>اسم الصنف<input value={productName} onChange={e => setProductName(e.target.value)} placeholder="مثال: مياه معدنية 500 مل" /></label><div className="form-grid"><label>السعر<input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} placeholder="0" /></label><label>المخزون<input type="number" value={productStock} onChange={e => setProductStock(e.target.value)} placeholder="0" /></label></div><button className="primary full" onClick={() => { if (!productName.trim()) return toast.error("اكتب اسم الصنف أولاً"); const newProduct = { id: `p-${Date.now()}`, name: productName.trim(), price: Number(productPrice) || 0, stock: Number(productStock) || 0, category: "أصناف جديدة" }; setCatalog([...catalog, newProduct]); setSelectedProduct(newProduct.id); setProductName(""); setProductPrice(""); setProductStock(""); setShowProduct(false); toast.success("تمت إضافة الصنف وسيظهر في الفواتير"); }}><Plus size={17} /> إضافة الصنف</button></div></Modal>}
      <Toaster position="top-center" dir="rtl" />
    </div>
  );
}

function PublicInvoice({ invoice, client }: { invoice: Invoice; client: Client }) {
  return <div className="public-invoice" dir="rtl"><div className="public-card"><div className="public-brand"><div className="brand-mark"><Sparkles size={18} /></div><div><strong>دفتر الزهوب</strong><span>فاتورة إلكترونية</span></div><span className="status paid"><i />{invoice.status}</span></div><div className="public-intro"><p className="eyebrow">فاتورة رقم {invoice.id}</p><h1>مرحباً {client.name}</h1><p>شكراً لتعاملكم معنا. هذه تفاصيل فاتورتكم.</p></div><div className="public-meta"><div><small>تاريخ الإصدار</small><strong>{invoice.date}</strong></div><div><small>العميل</small><strong>{client.name}</strong></div></div><div className="public-lines"><div className="public-line head"><span>الوصف</span><span>المبلغ</span></div>{invoice.items.map((item) => <div className="public-line" key={item}><span>{item}</span><strong>{money(invoice.total)}</strong></div>)}</div><div className="public-total"><span>الإجمالي المتبقي</span><strong>{money(invoice.due)}</strong></div><div className="public-footer"><Check size={15} /> رابط آمن ومخصص لهذه الفاتورة من دفتر الزهوب</div></div></div>;
}

function NavItem({ icon, text, active, onClick, badge }: { icon: React.ReactNode; text: string; active: boolean; onClick: () => void; badge?: string }) { return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{text}</span>{badge && <em>{badge}</em>}</button>; }
function MoreDots() { return <span className="more-dots">•••</span>; }
function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) { return <div className="section-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action && <button className="outline" onClick={onAction}><Plus size={16} /> {action}</button>}</div>; }

function Overview({ clients, invoices, onNew, onShare, onNavigate }: { clients: Client[]; invoices: Invoice[]; onNew: () => void; onShare: (i: Invoice) => void; onNavigate: (s: string) => void }) {
  const totalDue = clients.reduce((sum, c) => sum + c.balance, 0);
  return <><div className="welcome"><div><p className="eyebrow">الأربعاء، 01 أكتوبر 2026</p><h1>صباح الخير، محمد <span>✦</span></h1><p>إليك ملخص متجرك اليوم. كل شيء تحت السيطرة.</p></div><button className="primary" onClick={onNew}><Plus size={18} /> فاتورة جديدة</button></div><div className="stats-grid"><Stat icon={<CircleDollarSign />} label="إجمالي المستحقات" value={money(totalDue)} note="+8.4% من الشهر الماضي" positive /><Stat icon={<TrendingUp />} label="مبيعات هذا الشهر" value={money(248500)} note="+12.6% من الشهر الماضي" positive /><Stat icon={<Users />} label="إجمالي العملاء" value={clients.length.toString()} note="عميل نشط" /><Stat icon={<FileText />} label="الفواتير المعلقة" value={invoices.filter(i => i.status === "معلقة").length.toString()} note="تحتاج متابعة" warning /></div><div className="dashboard-grid"><section className="panel recent-panel"><SectionHeader eyebrow="متابعة يومية" title="آخر الفواتير" action="عرض الكل" onAction={() => onNavigate("invoices")} /><div className="invoice-list">{invoices.slice(0, 4).map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} clients={clients} onShare={onShare} />)}</div></section><section className="panel quick-panel"><SectionHeader eyebrow="اختصارات" title="إجراءات سريعة" /><div className="quick-actions"><button onClick={onNew}><span className="quick-icon purple"><ReceiptText size={20} /></span><b>إنشاء فاتورة</b><small>أصدر رابطاً وشاركه فوراً</small><ArrowUpLeft size={17} /></button><button onClick={() => onNavigate("products")}><span className="quick-icon orange"><ShoppingBag size={20} /></span><b>إدارة الأصناف</b><small>أضف منتجاتك وأسعارها</small><ArrowUpLeft size={17} /></button><button onClick={() => onNavigate("clients")}><span className="quick-icon green"><Users size={20} /></span><b>إضافة عميل</b><small>احتفظ ببيانات عملائك</small><ArrowUpLeft size={17} /></button></div></section></div><section className="panel clients-panel"><SectionHeader eyebrow="علاقاتك التجارية" title="العملاء الأكثر مديونية" action="كل العملاء" onAction={() => onNavigate("clients")} /><div className="client-table"><div className="table-head"><span>العميل</span><span>الرصيد المستحق</span><span>آخر فاتورة</span><span></span></div>{clients.slice(0, 3).map((client, i) => <div className="table-row" key={client.id}><div className="client-name"><div className={`avatar ${client.tone}`}>{client.avatar}</div><div><strong>{client.name}</strong><small>{client.phone}</small></div></div><strong className={client.balance ? "danger-text" : "success-text"}>{money(client.balance)}</strong><span>{i === 0 ? "اليوم، 10:42 ص" : i === 1 ? "أمس، 04:18 م" : "28 سبتمبر 2026"}</span><button className="row-link">التفاصيل <ChevronLeft size={14} /></button></div>)}</div></section></>;
}
function Stat({ icon, label, value, note, positive, warning }: { icon: React.ReactNode; label: string; value: string; note: string; positive?: boolean; warning?: boolean }) { return <div className="stat-card"><div className="stat-top"><span className={`stat-icon ${warning ? "warning" : ""}`}>{icon}</span><MoreDots /></div><p>{label}</p><h3>{value}</h3><small className={positive ? "positive" : warning ? "warning-text" : "muted"}>{positive && <TrendingUp size={13} />} {note}</small></div>; }
function InvoiceRow({ invoice, clients, onShare }: { invoice: Invoice; clients: Client[]; onShare: (i: Invoice) => void }) { const client = clients.find(c => c.id === invoice.clientId); return <div className="invoice-row"><div className="invoice-doc"><span><ReceiptText size={17} /></span><div><strong>{invoice.id}</strong><small>{invoice.date}</small></div></div><div className="row-client"><div className={`mini-avatar ${client?.tone}`}>{client?.avatar}</div>{client?.name}</div><strong>{money(invoice.total)}</strong><span className={`status ${invoice.status === "مدفوعة" ? "paid" : "pending"}`}><i />{invoice.status}</span><button className="share-button" onClick={() => onShare(invoice)}><Send size={15} /> مشاركة</button></div>; }
function Invoices({ invoices, clients, search, setSearch, onNew, onShare }: { invoices: Invoice[]; clients: Client[]; search: string; setSearch: (s: string) => void; onNew: () => void; onShare: (i: Invoice) => void }) { return <><div className="welcome compact"><div><p className="eyebrow">إدارة التحصيل</p><h1>الفواتير</h1><p>أنشئ فواتيرك وشاركها مع عملائك برابط واحد.</p></div><button className="primary" onClick={onNew}><Plus size={18} /> فاتورة جديدة</button></div><section className="panel full-panel"><div className="toolbar"><div className="search"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث برقم الفاتورة أو اسم العميل" /></div><button className="filter">كل الحالات <ChevronLeft size={15} /></button></div><div className="invoice-list">{invoices.map(i => <InvoiceRow key={i.id} invoice={i} clients={clients} onShare={onShare} />)}</div></section></>; }
function Clients({ clients, onNew }: { clients: Client[]; onNew: () => void }) { return <><SectionHeader eyebrow="دليل العملاء" title="العملاء" action="إضافة عميل" onAction={onNew} /><section className="clients-cards">{clients.map(c => <div className="client-card" key={c.id}><div className="client-card-top"><div className={`avatar ${c.tone}`}>{c.avatar}</div><MoreDots /></div><h3>{c.name}</h3><span>{c.phone}</span><div className="client-card-foot"><small>الرصيد المستحق</small><strong className={c.balance ? "danger-text" : "success-text"}>{money(c.balance)}</strong></div></div>)}</section></>; }
function Products({ products, onAdd }: { products: Product[]; onAdd: () => void }) { return <><div className="welcome compact"><div><p className="eyebrow">كتالوج المتجر</p><h1>الأصناف والمنتجات</h1><p>أضف أصنافك مرة واحدة لتظهر في كل فواتير العملاء.</p></div><button className="primary" onClick={onAdd}><Plus size={18} /> إضافة صنف</button></div><section className="product-grid">{products.map(p => <div className="product-card" key={p.id}><div className="product-art"><ShoppingBag size={25} /></div><div className="product-info"><span>{p.category}</span><h3>{p.name}</h3><div><strong>{money(p.price)}</strong><small>{p.stock} قطعة بالمخزون</small></div></div></div>)}</section></>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">دفتر الزهوب</p><h2>{title}</h2></div><button className="close" onClick={onClose}><X size={19} /></button></div>{children}</div></div>; }

export default App;
