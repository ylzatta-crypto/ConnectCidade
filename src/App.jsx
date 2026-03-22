import { useState } from 'react';
import './App.css';

function App() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    alert('Tentativa de login com o CPF: ' + cpf);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo">
          <span className="logo-icon">Cc</span> Connect Cidade
        </h1>
        <h2>Que bom ver você!</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <a href="#recuperar">Esqueceu sua senha?</a>
          </div>

          <button type="submit" className="btn-acessar">
            Acessar
          </button>
        </form>

        <div className="divider"></div>

        <div className="register-link">
          <p>Não tem uma conta? <a href="#cadastro">Cadastre-se aqui</a></p>
        </div>
      </div>
    </div>
  );
}

export default App;