import { useState, useRef } from 'react';
import { 
  FaUser, FaLock, FaEnvelope, FaPhone, FaCalendarAlt, FaArrowLeft,
  FaHome, FaBell, FaMapMarkerAlt, FaPaperclip, FaCamera, FaEdit 
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

  // Estados do Formulário de Registro de Problema
  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [endereco, setEndereco] = useState('R. Alfredo Chaves, 1333 - Centro, Caxias do Sul - RS, 95020-460');
  const [enderecoEditavel, setEnderecoEditavel] = useState(false);
  
  // Estados para o upload de arquivo e CÂMERA (RF8)
  const [arquivo, setArquivo] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
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
    if (senhaCadastro !== confirmaSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    alert('Registo efetuado com sucesso para: ' + nome);
    setTelaAtual('login');
    window.location.hash = '';
  };

  // FUNÇÕES DA CÂMERA (RF8)
  
  const abrirCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert("Não foi possível acessar a câmera. Verifique as permissões no navegador.");
      console.error(err);
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
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "foto-camera.jpg", { type: "image/jpeg" });
      setArquivo(file);
      fecharCamera();
    }, 'image/jpeg');
  };

  const handleEnviarProblema = (e) => {
    e.preventDefault();
    fecharCamera(); // Segurança para fechar câmera ao enviar
    alert('Problema registrado com sucesso! A Inteligência Artificial já categorizou a sua solicitação.');
    setTelaAtual('dashboard');
    window.location.hash = 'dashboard';
    
    setDescricaoProblema(''); 
    setArquivo(null);
    setEnderecoEditavel(false);
  };

  // FUNÇÃO DE NOTIFICAÇÃO PUSH (RF9)

  const simularNotificacaoPush = () => {
    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações de sistema.");
      return;
    }

    const dispararAviso = () => {
      new Notification("Connect Cidade - Atualização", {
        body: "Sua solicitação #001565 (Buraco na via) foi marcada como RESOLVIDA pela prefeitura!",
      });
    };

    if (Notification.permission === "granted") {
      dispararAviso();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          dispararAviso();
        }
      });
    }
  };

  // NAVBAR

  const Navbar = () => (
    <div className="navbar">
      <h1 className="logo nav-logo" style={{ margin: 0, fontSize: '20px' }}>
        <span className="logo-icon" style={{ fontSize: '18px', padding: '4px 8px' }}>Cc</span> Connect Cidade
      </h1>
      <div className="nav-actions">
        <button className="nav-btn" onClick={() => { fecharCamera(); setTelaAtual('dashboard'); window.location.hash = 'dashboard'; }}>
          <FaHome />
        </button>
        <button className="nav-btn user-btn" onClick={() => { fecharCamera(); setTelaAtual('perfil'); window.location.hash = 'perfil'; }}>
          <FaUser /> João
        </button>
        {/* Sininho com Notificação Push (RF9) */}
        <button className="nav-btn" onClick={simularNotificacaoPush} title="Ver Notificações">
          <FaBell />
        </button>
        <button className="nav-btn logout-btn" onClick={() => { fecharCamera(); setTelaAtual('login'); window.location.hash = ''; }}>
          Sair
        </button>
      </div>
    </div>
  );

  // TELA 5: PERFIL DO USUÁRIO (RF7)

  if (telaAtual === 'perfil') {
    return (
      <div className="app-container">
        <Navbar />
        <div className="internal-box">
          <div className="header-cadastro">
            <button 
              className="btn-voltar" 
              onClick={() => {
                setTelaAtual('dashboard');
                window.location.hash = 'dashboard';
              }}
            >
              <FaArrowLeft /> Voltar
            </button>
          </div>

          <h2 className="internal-title">Meu Perfil</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            alert('Dados atualizados com sucesso!');
            setTelaAtual('dashboard');
            window.location.hash = 'dashboard';
          }} className="form-registrar">
            
            <label>Nome Completo</label>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input type="text" defaultValue="João da Silva" required />
            </div>

            <label>E-mail</label>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input type="email" defaultValue="joao@caxias.rs.gov.br" required />
            </div>

            <label>Celular</label>
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input type="text" defaultValue="(54) 99999-9999" required />
            </div>

            <div className="divider"></div>
            <h3 style={{marginBottom: '15px', fontSize: '18px', color: '#111'}}>Trocar Senha</h3>

            <label>Nova Senha</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input type="password" placeholder="Digite a nova senha" />
            </div>

            <label>Confirmar Nova Senha</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input type="password" placeholder="Confirme a nova senha" />
            </div>

            <button type="submit" className="btn-acessar" style={{marginTop: '10px'}}>Salvar Alterações</button>
          </form>
        </div>
      </div>
    );
  }

  // TELA 4: REGISTRAR PROBLEMA (COM CÂMERA - RF8)
 
  if (telaAtual === 'registrar') {
    return (
      <div className="app-container">
        <Navbar />
        <div className="internal-box">
          
          <div className="header-cadastro">
            <button 
              className="btn-voltar" 
              onClick={() => {
                fecharCamera();
                setTelaAtual('dashboard');
                window.location.hash = 'dashboard';
              }}
            >
              <FaArrowLeft /> Voltar
            </button>
          </div>

          <h2 className="internal-title">Registrar problema</h2>
          
          <form onSubmit={handleEnviarProblema} className="form-registrar">
            <label>Nos conte o que aconteceu</label>
            <textarea 
              placeholder="Escreva aqui"
              value={descricaoProblema}
              onChange={(e) => setDescricaoProblema(e.target.value)}
              required
            ></textarea>

            <label>Agora precisamos de uma foto</label>
            <div className="file-buttons">
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setArquivo(e.target.files[0]);
                  }
                }}
              />

              <button 
                type="button" 
                className="btn-outline" 
                onClick={() => fileInputRef.current.click()}
                style={{ borderColor: arquivo ? '#16a34a' : '#d4d4d8', color: arquivo ? '#16a34a' : '#111' }}
              >
                <FaPaperclip /> {arquivo ? arquivo.name : 'Escolher arquivo'}
              </button>
              
              <button type="button" className="btn-outline" onClick={abrirCamera}>
                <FaCamera /> Abrir câmera
              </button>
            </div>

            {/* INTERFACE DA CÂMERA EM TEMPO REAL */}
            {isCameraOpen && (
              <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #d4d4d8', borderRadius: '8px', backgroundColor: '#f9fafb', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>Centralize o problema e clique em Capturar</p>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  style={{ width: '100%', borderRadius: '8px', backgroundColor: '#000', maxHeight: '300px', objectFit: 'cover' }}
                ></video>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={tirarFoto} className="btn-acessar" style={{ flex: 1, padding: '10px' }}>
                    <FaCamera style={{ marginRight: '8px' }}/> Capturar Foto
                  </button>
                  <button type="button" onClick={fecharCamera} className="btn-outline" style={{ flex: 1, color: '#dc2626', borderColor: '#dc2626', padding: '10px' }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <label>Localização obtida automaticamente</label>
            <div className="input-group">
              <input 
                type="text" 
                value={endereco} 
                onChange={(e) => setEndereco(e.target.value)}
                readOnly={!enderecoEditavel} 
                className="location-input" 
                style={{ backgroundColor: enderecoEditavel ? '#d1fad0' : 'white', cursor: enderecoEditavel ? 'text' : 'default' }}
              />
              <FaEdit 
                className="edit-icon" 
                onClick={() => setEnderecoEditavel(!enderecoEditavel)} 
                title="Editar endereço"
                style={{ color: enderecoEditavel ? '#16a34a' : '#111' }}
              />
            </div>

            <p className="ai-notice">
              Um sistema de Inteligência Artificial é utilizado no registro dos problemas. <a href="#saibamais">Saiba mais</a>
            </p>

            <button type="submit" className="btn-acessar">Enviar</button>
          </form>
        </div>
      </div>
    );
  }

  // TELA 3: DASHBOARD / MAPA

  if (telaAtual === 'dashboard') {
    return (
      <div className="app-container">
        <Navbar />
        <div className="internal-box">
          <div className="dashboard-buttons">
            <button className="btn-dash-outline" onClick={() => { setTelaAtual('registrar'); window.location.hash = 'registrar'; }}>
              Registrar problema
            </button>
            <button className="btn-dash-outline">Acompanhar solicitação</button>
          </div>
          
          <h2 className="text-center mt-4">A cidade agora</h2>
          
          <div className="map-container" style={{ height: '350px', width: '100%', zIndex: 0 }}>
            <MapContainer 
              center={[-29.168, -51.179]} 
              zoom={13} 
              scrollWheelZoom={true} 
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker position={[-29.168, -51.179]} icon={iconIluminacao}>
                <Popup><b>Solicitação #001509</b><br/>Poste sem luz</Popup>
              </Marker>
              <Marker position={[-29.158, -51.189]} icon={iconVia}>
                <Popup><b>Solicitação #001565</b><br/>Buraco na via</Popup>
              </Marker>
              <Marker position={[-29.178, -51.169]} icon={iconLixo}>
                <Popup><b>Solicitação #001495</b><br/>Lixo acumulado</Popup>
              </Marker>
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

  // TELA 2: CADASTRO

  if (telaAtual === 'cadastro') {
    return (
      <div className="login-container">
        <div className="login-box cadastro-box">
          <div className="header-cadastro">
            <button 
              className="btn-voltar" 
              onClick={() => {
                setTelaAtual('login');
                window.location.hash = '';
              }}
            >
              <FaArrowLeft /> Voltar
            </button>
          </div>
          
          <h1 className="logo">
            <span className="logo-icon">Cc</span> Connect Cidade
          </h1>
          <h2>Crie a sua conta</h2>

          <form onSubmit={handleCadastro}>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input type="text" placeholder="CPF" value={cpfCadastro} onChange={(e) => setCpfCadastro(formatCPF(e.target.value))} maxLength="14" required />
            </div>
            <div className="input-group">
              <FaCalendarAlt className="input-icon" />
              <input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} required />
            </div>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input type="text" placeholder="Telefone" value={celular} onChange={(e) => setCelular(formatCelular(e.target.value))} maxLength="15" required />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input type="password" placeholder="Senha" value={senhaCadastro} onChange={(e) => setSenhaCadastro(e.target.value)} required />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input type="password" placeholder="Confirmar senha" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} required />
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="lgpd" required />
              <label htmlFor="lgpd">
                Li e concordo com a <a href="#termos" className="link-termos">Política de Privacidade e LGPD</a>.
              </label>
            </div>

            <button type="submit" className="btn-acessar">Criar conta</button>
          </form>
        </div>
      </div>
    );
  }

  // TELA 1: LOGIN

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo">
          <span className="logo-icon">Cc</span> Connect Cidade
        </h1>
        <h2>Que bom ver você!</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Digite o seu CPF"
              value={cpfLogin}
              onChange={(e) => setCpfLogin(formatCPF(e.target.value))}
              maxLength="14"
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Digite a sua senha"
              value={senhaLogin}
              onChange={(e) => setSenhaLogin(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <a href="#recuperar">Esqueceu-se da senha?</a>
          </div>

          <button type="submit" className="btn-acessar">
            Acessar
          </button>
        </form>

        <div className="divider"></div>

        <div className="register-link">
          <p>
            Não tem uma conta?{' '}
            <button 
              type="button" 
              className="link-button" 
              onClick={() => {
                setTelaAtual('cadastro');
                window.location.hash = 'cadastro';
              }}
            >
              Cadastre-se aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;