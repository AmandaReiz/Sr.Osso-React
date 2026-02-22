import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const etapasChecklist = ["Gerar tema", "Gerar falas e cenas", "Gerar prompt IA", "Edição final"];

  const [roteiros, setRoteiros] = useState(() => {
    const salvo = localStorage.getItem('roteiros_sr_osso');
    return salvo ? JSON.parse(salvo) : [];
  });
  
  const [arquivados, setArquivados] = useState(() => {
    const salvo = localStorage.getItem('arquivados_sr_osso');
    return salvo ? JSON.parse(salvo) : [];
  });
  
  const [novoTitulo, setNovoTitulo] = useState('');

  useEffect(() => {
    localStorage.setItem('roteiros_sr_osso', JSON.stringify(roteiros));
    localStorage.setItem('arquivados_sr_osso', JSON.stringify(arquivados));
  }, [roteiros, arquivados]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, destIndex) => {
    const sourceIndex = e.dataTransfer.getData("index");
    const novosRoteiros = [...roteiros];
    const [removido] = novosRoteiros.splice(sourceIndex, 1);
    novosRoteiros.splice(destIndex, 0, removido);
    setRoteiros(novosRoteiros);
  };

  const adicionarRoteiro = () => {
    if (novoTitulo.trim()) {
      const novo = { id: Date.now(), titulo: novoTitulo, progresso: 0 };
      setRoteiros([novo, ...roteiros]);
      setNovoTitulo('');
    }
  };

  const avancar = (id) => {
    setRoteiros(roteiros.map(r => {
      if (r.id === id && r.progresso < 4) return { ...r, progresso: r.progresso + 1 };
      return r;
    }));
  };

  const excluir = (id) => {
    setRoteiros(roteiros.filter(r => r.id !== id));
  };

  const arquivar = (id) => {
    const item = roteiros.find(r => r.id === id);
    setArquivados([item, ...arquivados]);
    setRoteiros(roteiros.filter(r => r.id !== id));
  };

  const excluirArquivado = (id) => {
    setArquivados(arquivados.filter(r => r.id !== id));
  };

  const exportarJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roteiros, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "backup_roteiros_sr_osso.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importarJSON = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const json = JSON.parse(e.target.result);
        setRoteiros(json);
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
  };

  return (
    <div className="main-wrapper">
      <nav className="navbar">
        <div className="profile-section">
          <div className="profile-photo">
            <img src="sr.png" alt="Sr. Osso" onError={(e) => e.target.style.background='#6200ee'} />
          </div>
          <span className="profile-name">Sr. Osso</span>
        </div>
        <div className="nav-links">
          <a href="https://www.youtube.com/@Sr.OssoYT" target="_blank" className="youtube-link" rel="noreferrer">
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </nav>

      <header>
        <div className="add-video-bar">
          <input 
            type="text" 
            className="input-branco"
            placeholder="Título do novo roteiro..." 
            value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && adicionarRoteiro()}
          />
          <div className="header-buttons">
            <button className="btn-action primary" onClick={adicionarRoteiro} title="Adicionar">
              <i className="fas fa-plus"></i>
            </button>
            <button className="btn-action" onClick={exportarJSON} title="Exportar Backup">
              <i className="fas fa-download"></i>
            </button>
            <label className="btn-action" title="Importar Backup">
              <i className="fas fa-upload"></i>
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={importarJSON} />
            </label>
          </div>
        </div>
      </header>

      <main id="container-roteiros">
        {roteiros.map((roteiro, index) => (
          <div 
            className="card" 
            key={roteiro.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            style={{ cursor: 'grab' }}
          >
            <div className="card-top-buttons">
              <button className="btn-excluir" onClick={() => excluir(roteiro.id)}>
                <i className="fas fa-trash-can"></i>
              </button>
              <button className="btn-arquivar" onClick={() => arquivar(roteiro.id)} title="Arquivar Ideia">
                <i className="fas fa-file-invoice"></i>
              </button>
            </div>

            <h2 className="card-titulo">{roteiro.titulo}</h2>
            
            <div className="barra-container">
              <div className="barra-preenchimento" style={{ width: `${(roteiro.progresso / 4) * 100}%` }}></div>
            </div>

            <ul className="checklist">
              {etapasChecklist.map((etapa, i) => {
                const n = i + 1;
                let classe = n < roteiro.progresso ? "concluida" : n === roteiro.progresso ? "atual" : "";
                let icone = n < roteiro.progresso ? <i className="fas fa-check-circle"></i> : 
                           n === roteiro.progresso ? <i className="fas fa-rocket"></i> : 
                           <i className="far fa-circle"></i>;

                return <li key={i} className={classe}>{icone} {etapa}</li>;
              })}
            </ul>

            <button onClick={() => avancar(roteiro.id)} className="btn-proximo">
              {roteiro.progresso >= 4 ? '✨ Concluído' : 'Próxima Etapa'}
            </button>
          </div>
        ))}
      </main>

      {/* Seção de Arquivados com o texto alterado para SUCESSOS */}
      {arquivados.length > 0 && (
        <section className="arquivados-section">
          <hr />
          <h2 className="secao-titulo">📁 Sucessos</h2>
          <div id="container-arquivados">
            {arquivados.map((item) => (
              <div className="card card-arquivado" key={item.id}>
                <button className="btn-excluir" onClick={() => excluirArquivado(item.id)}>
                  <i className="fas fa-trash-can"></i>
                </button>
                <h2 className="card-titulo">{item.titulo}</h2>
                <span className="badge-sucesso">✅ Sucesso no Canal</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer>
        <p>Desenvolvido por <strong>Amanda Reis</strong></p>
      </footer>
    </div>
  )
}

export default App