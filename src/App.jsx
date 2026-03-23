import { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import './App.css';

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

  const formatCPF = (value) => {
    let v = value.replace(/\D/g, "");
    v = v.substring(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    return v;
  };

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
    alert('Tentativa de login com o CPF: ' + cpfLogin);
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