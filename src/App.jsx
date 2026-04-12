import { useState, useRef } from 'react';
import { 
  FaUser, FaLock, FaEnvelope, FaPhone, FaCalendarAlt, FaArrowLeft,
  FaHome, FaBell, FaMapMarkerAlt, FaPaperclip, FaCamera, FaEdit, FaListUl, FaCheckCircle, FaClock, FaSearch, FaThumbsUp, FaExclamationTriangle
} from 'react-icons/fa';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import './App.css';

const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconIluminacao = createIcon('red');
const iconVia = createIcon('blue');
const iconLixo = createIcon('gold');

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
  
  const [arquivo, setArquivo] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [filtroMapa, setFiltroMapa] = useState('todos');

  const [marcadores, setMarcadores] = useState([
    { id: 1, pos: [-29.168, -51.179], tipo: 'iluminacao', desc: 'Poste sem luz', protocolo: '#001509', icon: iconIluminacao, apoios: 12, apoiado: false },
    { id: 2, pos: [-29.158, -51.189], tipo: 'via', desc: 'Buraco na via', protocolo: '#001565', icon: iconVia, apoios: 45, apoiado: false },
    { id: 3, pos: [-29.178, -51.169], tipo: 'lixo', desc: 'Lixo acumulado', protocolo: '#001495', icon: iconLixo, apoios: 3, apoiado: false },
  ]);

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
    setTelaAtual('dashboard');
    window.location.hash = 'dashboard';
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
    fecharCamera(); 
    alert('Problema registrado com sucesso!');
    setTelaAtual('acompanhar'); 
    window.location.hash = 'acompanhar';
    setDescricaoProblema(''); 
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

            {/* FRASE DA IA E BOTÃO RESTAURADOS AQUI */}
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
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
            <button onClick={() => setFiltroMapa('todos')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #d4d4d8', backgroundColor: filtroMapa === 'todos' ? '#111' : 'white', color: filtroMapa === 'todos' ? 'white' : '#111', cursor: 'pointer', fontSize: '13px' }}>Todos</button>
            <button onClick={() => setFiltroMapa('iluminacao')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #dc2626', backgroundColor: filtroMapa === 'iluminacao' ? '#dc2626' : 'white', color: filtroMapa === 'iluminacao' ? 'white' : '#dc2626', cursor: 'pointer', fontSize: '13px' }}>Iluminação</button>
            <button onClick={() => setFiltroMapa('via')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #2563eb', backgroundColor: filtroMapa === 'via' ? '#2563eb' : 'white', color: filtroMapa === 'via' ? 'white' : '#2563eb', cursor: 'pointer', fontSize: '13px' }}>Vias</button>
            <button onClick={() => setFiltroMapa('lixo')} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #eab308', backgroundColor: filtroMapa === 'lixo' ? '#eab308' : 'white', color: filtroMapa === 'lixo' ? 'white' : '#eab308', cursor: 'pointer', fontSize: '13px' }}>Lixo</button>
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
            <span><FaMapMarkerAlt style={{color: '#dc2626'}} /> Iluminação</span>
            <span><FaMapMarkerAlt style={{color: '#2563eb'}} /> Via</span>
            <span><FaMapMarkerAlt style={{color: '#eab308'}} /> Lixo</span>
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
          <div className="forgot-password"><a href="#recuperar">Esqueceu-se da senha?</a></div>
          <button type="submit" className="btn-acessar">Acessar</button>
        </form>
        <div className="divider"></div>
        <div className="register-link"><p>Não tem uma conta? <button type="button" className="link-button" onClick={() => { setTelaAtual('cadastro'); window.location.hash = 'cadastro'; }}>Cadastre-se aqui</button></p></div>
      </div>
    </div>
  );
}

export default App;