import { useState, useRef } from 'react';
import { 
  FaUser, FaLock, FaEnvelope, FaPhone, FaCalendarAlt, FaArrowLeft,
  FaHome, FaBell, FaMapMarkerAlt, FaPaperclip, FaCamera, FaEdit, FaListUl, 
  FaCheckCircle, FaClock, FaSearch, FaThumbsUp, FaExclamationTriangle,
  FaUserShield, FaPlus, FaTrash
} from 'react-icons/fa';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import './App.css';

// NOVA FUNÇÃO: Gera um pin do mapa dinamicamente com qualquer cor (HEX) escolhida
const createCustomIcon = (hexColor) => L.divIcon({
  className: 'custom-pin',
  html: `<svg viewBox="0 0 384 512" style="height: 35px; filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.3));"><path fill="${hexColor}" stroke="#ffffff" stroke-width="15" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>`,
  iconSize: [25, 35],
  iconAnchor: [12, 35],
  popupAnchor: [0, -35]
});

const minhasSolicitacoesBD = [
  { protocolo: '#001565', data: '10/04/2026', problema: 'Buraco na via principal', status: 'Resolvido', cor: '#16a34a', icon: <FaCheckCircle /> },
  { protocolo: '#001602', data: '11/04/2026', problema: 'Lâmpada queimada na praça', status: 'Em Análise', cor: '#eab308', icon: <FaSearch /> },
  { protocolo: '#001650', data: 'Hoje', problema: 'Entulho na calçada', status: 'Pendente', cor: '#dc2626', icon: <FaClock /> }
];

function App() {
  const [telaAtual, setTelaAtual] = useState('login');

  const [cpfLogin, setCpfLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  const [nome, setNome] = useState('');
  const [cpfCadastro, setCpfCadastro] = useState('');
  const [dataNasc, setDataNasc] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [endereco, setEndereco] = useState('R. Alfredo Chaves, 1333 - Centro, Caxias do Sul - RS, 95020-460');
  const [enderecoEditavel, setEnderecoEditavel] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  
  const [arquivo, setArquivo] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [filtroMapa, setFiltroMapa] = useState('todos');

  // Marcadores iniciais agora usam o gerador de cores dinâmicas
  const [marcadores, setMarcadores] = useState([
    { id: 1, pos: [-29.168, -51.179], tipo: 'iluminacao', desc: 'Poste sem luz', protocolo: '#001509', icon: createCustomIcon('#dc2626'), apoios: 12, apoiado: false },
    { id: 2, pos: [-29.158, -51.189], tipo: 'via', desc: 'Buraco na via', protocolo: '#001565', icon: createCustomIcon('#2563eb'), apoios: 45, apoiado: false },
    { id: 3, pos: [-29.178, -51.169], tipo: 'lixo', desc: 'Lixo acumulado', protocolo: '#001495', icon: createCustomIcon('#eab308'), apoios: 3, apoiado: false },
  ]);

  // --- ESTADOS DO ADMINISTRADOR (RF6) ---
  const [categoriasAdmin, setCategoriasAdmin] = useState([
    { id: 1, nome: 'Iluminação Pública', setor: 'Secretaria de Obras', prazo: '5 dias', tipo: 'iluminacao', cor: '#dc2626' },
    { id: 2, nome: 'Problemas na via', setor: 'Secretaria de Trânsito', prazo: '15 dias', tipo: 'via', cor: '#2563eb' },
    { id: 3, nome: 'Lixo e Limpeza', setor: 'Codeca', prazo: '3 dias', tipo: 'lixo', cor: '#eab308' }
  ]);
  const [showNovaCategoria, setShowNovaCategoria] = useState(false);
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novaCatSetor, setNovaCatSetor] = useState('');
  const [novaCatPrazo, setNovaCatPrazo] = useState('');
  const [novaCatCor, setNovaCatCor] = useState('#16a34a'); // Estado da cor restaurado!

  const handleApoiar = (id) => {
    setMarcadores(marcadores.map(m => 
      m.id === id && !m.apoiado ? { ...m, apoios: m.apoios + 1, apoiado: true } : m
    ));
  };
  
  function formatCPF(value) {
    let v = value.replace(/\D/g, "");
    v = v.substring(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    return v;
  }

  const formatCelular = (value) => {
    let v = value.replace(/\D/g, "");
    v = v.substring(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4,5})/, "($1) $2-");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,4})/, "($1) $2");
    return v;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (cpfLogin === '000.000.000-00' || senhaLogin === 'admin') {
      setTelaAtual('admin-dashboard');
      window.location.hash = 'admin-dashboard';
    } else {
      setTelaAtual('dashboard');
      window.location.hash = 'dashboard';
    }
  };

  const handleCadastro = (e) => {
    e.preventDefault();
    if (senhaCadastro !== confirmaSenha) return alert('As senhas não coincidem!');
    alert('Registo efetuado com sucesso para: ' + nome);
    setTelaAtual('login');
    window.location.hash = '';
  };

  const abrirCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (err) {
      alert("Não foi possível acessar a câmera.");
    }
  };

  const fecharCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const tirarFoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      setArquivo(new File([blob], "foto-camera.jpg", { type: "image/jpeg" }));
      fecharCamera();
    }, 'image/jpeg');
  };

  const handleEnviarProblema = (e) => {
    e.preventDefault();
    if (!categoriaSelecionada) return alert("Selecione uma categoria!");
    
    // Busca a categoria selecionada para aplicar a cor certa no mapa
    const catSelec = categoriasAdmin.find(c => c.tipo === categoriaSelecionada);
    const corSelecionada = catSelec ? catSelec.cor : '#16a34a';

    const novaSolicitacao = {
      id: marcadores.length + 1,
      pos: [-29.165, -51.185], 
      tipo: categoriaSelecionada,
      desc: descricaoProblema,
      protocolo: `#001${Math.floor(Math.random() * 900) + 100}`,
      icon: createCustomIcon(corSelecionada), // Cria o pin na cor correta!
      apoios: 0,
      apoiado: true
    };
    
    setMarcadores([...marcadores, novaSolicitacao]);
    fecharCamera(); 
    alert('Problema registrado com sucesso!');
    setTelaAtual('acompanhar'); 
    window.location.hash = 'acompanhar';
    setDescricaoProblema(''); 
    setCategoriaSelecionada('');
    setArquivo(null);
    setEnderecoEditavel(false);
  };

  const simularNotificacaoPush = () => {
    if (!("Notification" in window)) return alert("Navegador não suporta push.");
    const disparar = () => new Notification("Connect Cidade", { body: "Sua solicitação #001565 foi RESOLVIDA pela prefeitura!" });
    if (Notification.permission === "granted") disparar();
    else if (Notification.permission !== "denied") Notification.requestPermission().then(p => { if(p === "granted") disparar() });
  };

  const Navbar = () => (
    <div className="navbar">
      <h1 className="logo nav-logo" style={{ margin: 0, fontSize: '20px' }}>
        <span className="logo-icon" style={{ fontSize: '18px', padding: '4px 8px' }}>Cc</span> Connect Cidade
      </h1>
      <div className="nav-actions">
        <button className="nav-btn" onClick={() => { fecharCamera(); setTelaAtual('dashboard'); window.location.hash = 'dashboard'; }} title="Início">
          <FaHome />
        </button>
        <button className="nav-btn user-btn" onClick={() => { fecharCamera(); setTelaAtual('perfil'); window.location.hash = 'perfil'; }}>
          <FaUser /> João
        </button>
        <button className="nav-btn" onClick={simularNotificacaoPush} title="Notificações">
          <FaBell />
        </button>
        <button className="nav-btn logout-btn" onClick={() => { fecharCamera(); setTelaAtual('login'); window.location.hash = ''; }}>
          Sair
        </button>
      </div>
    </div>
  );

  // --- TELA DO PAINEL ADMINISTRATIVO (RF6) ---
  if (telaAtual === 'admin-dashboard') {
    const handleAddCategoria = (e) => {
      e.preventDefault();
      const slugTipo = novaCatNome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
      
      const nova = {
        id: categoriasAdmin.length > 0 ? categoriasAdmin[categoriasAdmin.length - 1].id + 1 : 1,
        nome: novaCatNome,
        setor: novaCatSetor,
        prazo: novaCatPrazo,
        tipo: slugTipo,
        cor: novaCatCor // Usa a cor escolhida
      };
      
      setCategoriasAdmin([...categoriasAdmin, nova]);
      setShowNovaCategoria(false);
      setNovaCatNome(''); setNovaCatSetor(''); setNovaCatPrazo(''); setNovaCatCor('#16a34a');
      alert('Categoria adicionada com sucesso!');
    };

    const handleExcluirCategoria = (id) => {
      if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
        setCategoriasAdmin(categoriasAdmin.filter(c => c.id !== id));
      }
    };

    return (
      <div className="app-container" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
        <div className="navbar" style={{ backgroundColor: '#1e293b', color: 'white' }}>
          <h1 className="logo nav-logo" style={{ margin: 0, fontSize: '20px', color: 'white' }}>
            <span className="logo-icon" style={{ fontSize: '18px', padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white' }}>Ad</span> Connect Cidade
          </h1>
          <div className="nav-actions">
            <span style={{ marginRight: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaUserShield /> Prefeitura
            </span>
            <button className="nav-btn logout-btn" onClick={() => { setTelaAtual('login'); window.location.hash = ''; }} style={{ color: 'white', borderColor: 'white' }}>
              Sair
            </button>
          </div>
        </div>

        <div className="internal-box" style={{ maxWidth: '800px', marginTop: '30px' }}>
          <h2 className="internal-title">Gestão de Categorias</h2>
          <p style={{ color: '#555', marginBottom: '20px', fontSize: '14px' }}>Adicione ou remova as categorias de problemas urbanos (RF6).</p>
          
          <button className="btn-acessar" style={{ width: 'auto', padding: '10px 15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6' }} onClick={() => setShowNovaCategoria(!showNovaCategoria)}>
            <FaPlus /> Nova Categoria
          </button>

          {showNovaCategoria && (
            <form onSubmit={handleAddCategoria} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Cadastrar Nova</h3>
              <div className="input-group"><input type="text" placeholder="Nome da Categoria (ex: Saneamento)" value={novaCatNome} onChange={e => setNovaCatNome(e.target.value)} required /></div>
              <div className="input-group"><input type="text" placeholder="Setor Responsável (ex: SAMAE)" value={novaCatSetor} onChange={e => setNovaCatSetor(e.target.value)} required /></div>
              <div className="input-group"><input type="text" placeholder="Prazo Médio (ex: 7 dias)" value={novaCatPrazo} onChange={e => setNovaCatPrazo(e.target.value)} required /></div>
              
              {/* O SELETOR DE COR RESTAURADO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '10px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <label style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>Cor do Marcador no Mapa:</label>
                <input type="color" value={novaCatCor} onChange={e => setNovaCatCor(e.target.value)} style={{ width: '40px', height: '35px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-acessar" style={{ backgroundColor: '#16a34a' }}>Salvar</button>
                <button type="button" className="btn-outline" onClick={() => setShowNovaCategoria(false)}>Cancelar</button>
              </div>
            </form>
          )}

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white' }}>
              <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'center', width: '50px' }}>Cor</th>
                  <th style={{ padding: '12px' }}>Categoria</th>
                  <th style={{ padding: '12px' }}>Setor Responsável</th>
                  <th style={{ padding: '12px' }}>Prazo Médio</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {categoriasAdmin.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: cat.cor, margin: '0 auto', border: '1px solid #ccc' }}></div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{cat.nome}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{cat.setor}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{cat.prazo}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => handleExcluirCategoria(cat.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="Excluir">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (telaAtual === 'acompanhar') {
    return (
      <div className="app-container">
        <Navbar />
        <div className="internal-box" style={{ maxWidth: '700px' }}>
          <div className="header-cadastro"><button className="btn-voltar" onClick={() => { setTelaAtual('dashboard'); window.location.hash = 'dashboard'; }}><FaArrowLeft /> Voltar ao Mapa</button></div>
          <h2 className="internal-title"><FaListUl style={{marginRight: '10px'}}/> Minhas Solicitações</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {minhasSolicitacoesBD.map((solic, index) => (
              <div key={index} style={{ border: '1px solid #e4e4e7', borderRadius: '12px', padding: '20px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', color: '#111', marginBottom: '5px' }}>{solic.problema}</h3>
                  <p style={{ fontSize: '13px', color: '#555' }}>Protocolo: <b>{solic.protocolo}</b> • Aberto em: {solic.data}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: `${solic.cor}20`, color: solic.cor, padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>{solic.icon} {solic.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (telaAtual === 'perfil') {
    return (
      <div className="app-container">
        <Navbar />
        <div className="internal-box">
          <div className="header-cadastro"><button className="btn-voltar" onClick={() => { setTelaAtual('dashboard'); window.location.hash = 'dashboard'; }}><FaArrowLeft /> Voltar</button></div>
          <h2 className="internal-title">Meu Perfil</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('Dados atualizados!'); setTelaAtual('dashboard'); }} className="form-registrar">
            <label>Nome Completo</label><div className="input-group"><FaUser className="input-icon" /><input type="text" defaultValue="João da Silva" required /></div>
            <label>E-mail</label><div className="input-group"><FaEnvelope className="input-icon" /><input type="email" defaultValue="joao@caxias.rs.gov.br" required /></div>
            <label>Celular</label><div className="input-group"><FaPhone className="input-icon" /><input type="text" defaultValue="(54) 99999-9999" required /></div>
            <div className="divider"></div>
            <h3 style={{marginBottom: '15px', fontSize: '18px', color: '#111'}}>Trocar Senha</h3>
            <label>Nova Senha</label><div className="input-group"><FaLock className="input-icon" /><input type="password" placeholder="Digite a nova senha" /></div>
            <label>Confirmar Nova Senha</label><div className="input-group"><FaLock className="input-icon" /><input type="password" placeholder="Confirme a nova senha" /></div>
            <button type="submit" className="btn-acessar" style={{marginTop: '10px'}}>Salvar Alterações</button>
          </form>
        </div>
      </div>
    );
  }

  if (telaAtual === 'registrar') {
    return (
      <div className="app-container">
        <Navbar />
        <div className="internal-box">
          <div className="header-cadastro">
            <button className="btn-voltar" onClick={() => { fecharCamera(); setTelaAtual('dashboard'); window.location.hash = 'dashboard'; }}>
              <FaArrowLeft /> Voltar
            </button>
          </div>
          <h2 className="internal-title">Registrar problema</h2>
          
          <div style={{ backgroundColor: '#fef08a', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#854d0e', display: 'flex', alignItems: 'flex-start', gap: '10px', border: '1px solid #fde047' }}>
            <FaExclamationTriangle style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <b>Inteligência Artificial Connect:</b> Identificamos um "Buraco na via" a 40 metros da sua localização (Protocolo #001565). 
              <br/>
              <a href="#dashboard" onClick={(e) => {
                e.preventDefault();
                alert('Apoio registrado com sucesso! Obrigado por ajudar a evitar protocolos duplicados.');
                handleApoiar(2); 
                setTelaAtual('dashboard');
                window.location.hash = 'dashboard';
              }} style={{ color: '#16a34a', fontWeight: 'bold', textDecoration: 'underline', marginTop: '5px', display: 'inline-block' }}>
                Deseja apenas apoiar a solicitação existente?
              </a>
            </div>
          </div>

          <form onSubmit={handleEnviarProblema} className="form-registrar">
            
            <label>Categoria do Problema</label>
            <select 
              value={categoriaSelecionada} 
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d4d4d8', marginBottom: '15px', backgroundColor: 'white' }} 
              required
            >
              <option value="">Selecione uma categoria...</option>
              {categoriasAdmin.map(cat => (
                <option key={cat.id} value={cat.tipo}>{cat.nome}</option>
              ))}
            </select>

            <label>Nos conte o que aconteceu</label>
            <textarea placeholder="Escreva aqui" value={descricaoProblema} onChange={(e) => setDescricaoProblema(e.target.value)} required></textarea>
            
            <label>Agora precisamos de uma foto</label>
            <div className="file-buttons">
              <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={(e) => { if (e.target.files && e.target.files.length > 0) setArquivo(e.target.files[0]); }} />
              <button type="button" className="btn-outline" onClick={() => fileInputRef.current.click()} style={{ borderColor: arquivo ? '#16a34a' : '#d4d4d8', color: arquivo ? '#16a34a' : '#111' }}>
                <FaPaperclip /> {arquivo ? arquivo.name : 'Escolher arquivo'}
              </button>
              <button type="button" className="btn-outline" onClick={abrirCamera}><FaCamera /> Abrir câmera</button>
            </div>
            {isCameraOpen && (
              <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #d4d4d8', borderRadius: '8px', backgroundColor: '#f9fafb', textAlign: 'center' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000', maxHeight: '300px', objectFit: 'cover' }}></video>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={tirarFoto} className="btn-acessar" style={{ flex: 1, padding: '10px' }}><FaCamera style={{ marginRight: '8px' }}/> Capturar Foto</button>
                  <button type="button" onClick={fecharCamera} className="btn-outline" style={{ flex: 1, color: '#dc2626', borderColor: '#dc2626', padding: '10px' }}>Cancelar</button>
                </div>
              </div>
            )}
            <label>Localização obtida automaticamente</label>
            <div className="input-group">
              <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} readOnly={!enderecoEditavel} className="location-input" style={{ backgroundColor: enderecoEditavel ? '#d1fad0' : 'white', cursor: enderecoEditavel ? 'text' : 'default' }} />
              <FaEdit className="edit-icon" onClick={() => setEnderecoEditavel(!enderecoEditavel)} title="Editar endereço" style={{ color: enderecoEditavel ? '#16a34a' : '#111' }} />
            </div>

            <p className="ai-notice" style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '15px' }}>
              Um sistema de Inteligência Artificial é utilizado no registro dos problemas. <a href="#saibamais" style={{ color: '#2563eb', textDecoration: 'none' }}>Saiba mais</a>
            </p>

            <button type="submit" className="btn-acessar">Enviar</button>
          </form>
        </div>
      </div>
    );
  }

  if (telaAtual === 'dashboard') {
    const marcadoresFiltrados = marcadores.filter(m => filtroMapa === 'todos' || m.tipo === filtroMapa);

    return (
      <div className="app-container">
        <Navbar />
        <div className="internal-box">
          <div className="dashboard-buttons">
            <button className="btn-dash-outline" onClick={() => { setTelaAtual('registrar'); window.location.hash = 'registrar'; }}>Registrar problema</button>
            <button className="btn-dash-outline" onClick={() => { setTelaAtual('acompanhar'); window.location.hash = 'acompanhar'; }}>Acompanhar solicitação</button>
          </div>
          
          <h2 className="text-center mt-4" style={{ marginBottom: '10px' }}>A cidade agora</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <button onClick={() => setFiltroMapa('todos')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #d4d4d8', backgroundColor: filtroMapa === 'todos' ? '#111' : 'white', color: filtroMapa === 'todos' ? 'white' : '#111', cursor: 'pointer', fontSize: '13px' }}>Todos</button>
            
            {categoriasAdmin.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setFiltroMapa(cat.tipo)} 
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  border: `1px solid ${cat.cor}`, 
                  backgroundColor: filtroMapa === cat.tipo ? cat.cor : 'white', 
                  color: filtroMapa === cat.tipo ? 'white' : cat.cor, 
                  cursor: 'pointer', 
                  fontSize: '13px' 
                }}
              >
                {cat.nome.split(' ')[0]} 
              </button>
            ))}
          </div>

          <div className="map-container" style={{ height: '350px', width: '100%', zIndex: 0 }}>
            <MapContainer center={[-29.168, -51.179]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {marcadoresFiltrados.map((marcador) => (
                <Marker key={marcador.id} position={marcador.pos} icon={marcador.icon}>
                  <Popup>
                    <div style={{ minWidth: '150px' }}>
                      <b style={{ fontSize: '14px' }}>Solicitação {marcador.protocolo}</b><br/>
                      <span style={{ fontSize: '13px', color: '#555' }}>{marcador.desc}</span>
                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e4e4e7', paddingTop: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{marcador.apoios} apoios</span>
                        
                        <button 
                          onClick={() => handleApoiar(marcador.id)}
                          disabled={marcador.apoiado}
                          style={{
                            backgroundColor: marcador.apoiado ? '#e4e4e7' : '#16a34a',
                            color: marcador.apoiado ? '#888' : 'white',
                            border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: marcador.apoiado ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s'
                          }}
                        >
                          <FaThumbsUp /> {marcador.apoiado ? 'Apoiado' : 'Apoiar'}
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="map-legend">
            {categoriasAdmin.map(cat => (
              <span key={cat.id}>
                <FaMapMarkerAlt style={{color: cat.cor}} /> {cat.nome.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (telaAtual === 'cadastro') {
    return (
      <div className="login-container">
        <div className="login-box cadastro-box">
          <div className="header-cadastro"><button className="btn-voltar" onClick={() => { setTelaAtual('login'); window.location.hash = ''; }}><FaArrowLeft /> Voltar</button></div>
          <h1 className="logo"><span className="logo-icon">Cc</span> Connect Cidade</h1>
          <h2>Crie a sua conta</h2>
          <form onSubmit={handleCadastro}>
            <div className="input-group"><FaUser className="input-icon" /><input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
            <div className="input-group"><FaUser className="input-icon" /><input type="text" placeholder="CPF" value={cpfCadastro} onChange={(e) => setCpfCadastro(formatCPF(e.target.value))} maxLength="14" required /></div>
            <div className="input-group"><FaCalendarAlt className="input-icon" /><input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} required /></div>
            <div className="input-group"><FaEnvelope className="input-icon" /><input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="input-group"><FaPhone className="input-icon" /><input type="text" placeholder="Telefone" value={celular} onChange={(e) => setCelular(formatCelular(e.target.value))} maxLength="15" required /></div>
            <div className="input-group"><FaLock className="input-icon" /><input type="password" placeholder="Senha" value={senhaCadastro} onChange={(e) => setSenhaCadastro(e.target.value)} required /></div>
            <div className="input-group"><FaLock className="input-icon" /><input type="password" placeholder="Confirmar senha" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} required /></div>
            <div className="checkbox-group"><input type="checkbox" id="lgpd" required /><label htmlFor="lgpd">Li e concordo com a <a href="#termos" className="link-termos">Política</a>.</label></div>
            <button type="submit" className="btn-acessar">Criar conta</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo"><span className="logo-icon">Cc</span> Connect Cidade</h1>
        <h2>Que bom ver você!</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group"><FaUser className="input-icon" /><input type="text" placeholder="Digite o seu CPF" value={cpfLogin} onChange={(e) => setCpfLogin(formatCPF(e.target.value))} maxLength="14" required /></div>
          <div className="input-group"><FaLock className="input-icon" /><input type="password" placeholder="Digite a sua senha" value={senhaLogin} onChange={(e) => setSenhaLogin(e.target.value)} required /></div>
          <div className="forgot-password"><a href="#recuperar"> Esqueceu-se da senha?</a></div>
          <button type="submit" className="btn-acessar">Acessar</button>
        </form>
        <div className="divider"></div>
        <div className="register-link"><p>Não tem uma conta? <button type="button" className="link-button" onClick={() => { setTelaAtual('cadastro'); window.location.hash = 'cadastro'; }}>Cadastre-se aqui</button></p></div>
      </div>
    </div>
  );
}

export default App;