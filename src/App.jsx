import { useState } from 'react';
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

  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [endereco, setEndereco] = useState('R. Alfredo Chaves, 1333 - Centro, Caxias do Sul - RS, 95020-460');
  const [enderecoEditavel, setEnderecoEditavel] = useState(false);

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

  const handleEnviarProblema = (e) => {
    e.preventDefault();
    alert('Problema registrado com sucesso! A Inteligência Artificial já categorizou a sua solicitação.');
    setTelaAtual('dashboard');
    window.location.hash = 'dashboard';
    setDescricaoProblema(''); 
  };

  const Navbar = () => (
    <div className="navbar">
      <h1 className="logo nav-logo" style={{ margin: 0, fontSize: '20px' }}>
        <span className="logo-icon" style={{ fontSize: '18px', padding: '4px 8px' }}>Cc</span> Connect Cidade
      </h1>
      <div className="nav-actions">
        <button className="nav-btn" onClick={() => { setTelaAtual('dashboard'); window.location.hash = 'dashboard'; }}>
          <FaHome />
        </button>
        <button className="nav-btn user-btn"><FaUser /> João</button>
        <button className="nav-btn"><FaBell /></button>
        <button className="nav-btn logout-btn" onClick={() => { setTelaAtual('login'); window.location.hash = ''; }}>
          Sair
        </button>
      </div>
    </div>
  );

if (telaAtual === 'registrar') {
    return (
      <div className="app-container">
        <Navbar />
        <div className="internal-box">
          
          {/* Adicionámos aqui o botão de Voltar idêntico ao do Cadastro */}
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
              <button type="button" className="btn-outline"><FaPaperclip /> Escolher arquivo</button>
              <button type="button" className="btn-outline"><FaCamera /> Abrir câmera</button>
            </div>

            <label>Localização obtida automaticamente</label>
            <label>Localização obtida automaticamente</label>
            <div className="input-group">
              <input 
                type="text" 
                value={endereco} 
                onChange={(e) => setEndereco(e.target.value)}
                readOnly={!enderecoEditavel} 
                className="location-input" 
                // Muda a cor do fundo sutilmente para mostrar que destravou
                style={{ backgroundColor: enderecoEditavel ? '#d1fad0' : 'white', cursor: enderecoEditavel ? 'text' : 'default' }}
              />
              <FaEdit 
                className="edit-icon" 
                onClick={() => setEnderecoEditavel(!enderecoEditavel)} 
                title="Editar endereço"
                // Deixa o ícone verde quando está editando
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