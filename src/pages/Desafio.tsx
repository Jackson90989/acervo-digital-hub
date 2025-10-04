"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import io from "socket.io-client";

const PacmanAvancado = () => {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [conectado, setConectado] = useState(false);
  const [jogoAtivo, setJogoAtivo] = useState(false);
  const [estadoJogo, setEstadoJogo] = useState({
    mapa: [],
    fantasmas: [],
    jogadores: [],
    jogador: null,
    bolinhasRestantes: 0
  });
  const [nomeJogador, setNomeJogador] = useState("");
  const [salaId, setSalaId] = useState("default");
  const [loading, setLoading] = useState(true);
  const [mestre, setMestre] = useState(false);
  const [loginMestre, setLoginMestre] = useState("");
  const [senhaMestre, setSenhaMestre] = useState("");
  const [mostrarLoginMestre, setMostrarLoginMestre] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [qualidadeConexao, setQualidadeConexao] = useState(100);
  const [ultimoPing, setUltimoPing] = useState(0);
  const [modoOtimizado, setModoOtimizado] = useState(true);
  const [mostrarAtingido, setMostrarAtingido] = useState(false);
  const [vidasRestantes, setVidasRestantes] = useState(3);
  const [mostrarEliminado, setMostrarEliminado] = useState(false);
  const [jogadorEliminado, setJogadorEliminado] = useState(null);
  const [mostrarVitoria, setMostrarVitoria] = useState(false);
  const [vencedorInfo, setVencedorInfo] = useState({ nome: "", pontos: 0 });
  const [modoEspectador, setModoEspectador] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(180);
  const [tempoJogo, setTempoJogo] = useState(180);
  const [modoCronometro, setModoCronometro] = useState(false);
  const [novoTempo, setNovoTempo] = useState("180");
  const [mostrarControlesTempo, setMostrarControlesTempo] = useState(false);
  const [jogadorComPoder, setJogadorComPoder] = useState(null);
  const [tempoPoderEliminar, setTempoPoderEliminar] = useState(0);
  const [jogadorComVelocidadeTurbo, setJogadorComVelocidadeTurbo] = useState(null);
  const [tempoVelocidadeTurbo, setTempoVelocidadeTurbo] = useState(0);
  const [mostrarAvisoPoder, setMostrarAvisoPoder] = useState(false);
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [tipoAviso, setTipoAviso] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  // Estados para controle de áudio
  const [audioAtivo, setAudioAtivo] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioRefs = useRef({
    beginning: null,
    waka: null,
    eatGhost: null,
    eatFruit: null,
    death: null,
    intermission: null
  });

  const TAMANHO_CELULA = 20;
  const LARGURA_MAPA = 28;
  const ALTURA_MAPA = 31;

  const ultimoMapaRef = useRef([]);
  const bufferMovimentos = useRef([]);
  const ultimoTempoRender = useRef(0);
  const assetsCarregados = useRef(false);
  const celulasModificadas = useRef(new Set());
  const timeoutIniciarRef = useRef(null);
  const timeoutAtingidoRef = useRef(null);
  const tempoAtualRef = useRef(0);
  const podeFecharComEnter = useRef(false);

  const [uiEstado, setUiEstado] = useState({
    pontos: 0,
    vidas: 3,
    bolinhas: 0,
    podeEliminar: false,
    velocidadeTurbo: false
  });

  // Efeito para carregar os áudios
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRefs.current = {
        beginning: new Audio('/sounds/pacman_beginning.wav'),
        waka: new Audio('/sounds/waka.wav'),
        eatGhost: new Audio('/sounds/eat_ghost.wav'),
        eatFruit: new Audio('/sounds/eat_fruit.wav'),
        death: new Audio('/sounds/death.wav'),
        intermission: new Audio('/sounds/intermission.wav')
      };

      // Configurar volume inicial e loop para a música de início
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.volume = volume;
          if (audio === audioRefs.current.beginning) {
            audio.loop = true; // Fazer a música de início repetir
          }
        }
      });

      return () => {
        // Limpar os áudios ao desmontar o componente
        Object.values(audioRefs.current).forEach(audio => {
          if (audio) {
            audio.pause();
            audio.src = '';
          }
        });
      };
    }
  }, []);

  // Efeito para atualizar o volume
  useEffect(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume]);

  // Funções para tocar os sons
  const tocarSom = useCallback((som, loop = false) => {
    if (!audioAtivo) return;
    
    const audio = audioRefs.current[som];
    if (audio) {
      audio.currentTime = 0;
      audio.loop = loop;
      audio.play().catch(e => console.log("Erro ao reproduzir áudio:", e));
    }
  }, [audioAtivo]);

  const pararSom = useCallback((som) => {
    const audio = audioRefs.current[som];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const pararTodosOsSons = useCallback(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);

  useEffect(() => {
    if (estadoJogo.jogador) {
      setUiEstado(prev => ({
        ...prev,
        pontos: estadoJogo.jogador.pontos || 0,
        vidas: estadoJogo.jogador.vidas || 0,
        bolinhas: estadoJogo.bolinhasRestantes || 0,
        podeEliminar: estadoJogo.jogador.podeEliminar || false,
        velocidadeTurbo: estadoJogo.jogador.velocidadeTurbo || false
      }));
    }
  }, [estadoJogo.jogador, estadoJogo.bolinhasRestantes]);

  useEffect(() => {
    return () => {
      if (timeoutIniciarRef.current) {
        clearTimeout(timeoutIniciarRef.current);
      }
      if (timeoutAtingidoRef.current) {
        clearTimeout(timeoutAtingidoRef.current);
      }
    };
  }, []);

  const atualizarEstado = useCallback((atualizacoes) => {
    setEstadoJogo(prev => ({ ...prev, ...atualizacoes }));
  }, []);

  const atualizarCelulaMapa = useCallback((x, y, valor) => {
    setEstadoJogo(prev => {
      const novoMapa = [...prev.mapa];
      if (novoMapa[y] && novoMapa[y][x] !== undefined) {
        novoMapa[y][x] = valor;
        const celulaId = `${x},${y}`;
        celulasModificadas.current.add(celulaId);
      }
      return { ...prev, mapa: novoMapa };
    });
  }, []);

  useEffect(() => {
    const preloadAssets = async () => {
      if (assetsCarregados.current) return;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        assetsCarregados.current = true;
      } catch (error) {
        console.warn("Erro no pré-carregamento de assets:", error);
      }
    };

    preloadAssets();
  }, []);

  const mostrarAviso = (mensagem, tipo, tempoAutoFechar = 0) => {
    setMensagemAviso(mensagem);
    setTipoAviso(tipo);
    setMostrarAvisoPoder(true);
    podeFecharComEnter.current = true;
    
    if (tempoAutoFechar > 0) {
      setTimeout(() => {
        setMostrarAvisoPoder(false);
        podeFecharComEnter.current = false;
      }, tempoAutoFechar);
    }
  };

  const handleMovimento = useCallback((direcao) => {
    if (!socketRef.current || !jogoAtivo || !estadoJogo?.jogador || modoEspectador) return;
    
    bufferMovimentos.current.push({ direcao });
    
    atualizarEstado(prev => ({
      ...prev,
      jogador: {
        ...prev.jogador,
        direcao: direcao
      },
      jogadores: prev.jogadores.map(j => 
        j.id === socketRef.current?.id ? { ...j, direcao: direcao } : j
      )
    }));
  }, [jogoAtivo, estadoJogo, atualizarEstado, modoEspectador]);

  useEffect(() => {
    if (socketRef.current) return;

    const newSocket = io(`${API_URL}`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Conectado ao servidor");
      setConectado(true);
      setLoading(false);
      tocarSom('beginning', true); // Inicia a música de início em loop
    });

    newSocket.on("connect_error", (error) => {
      console.log("❌ Erro de conexão:", error.message);
      setConectado(false);
      setLoading(false);
      pararSom('beginning');
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Desconectado do servidor:", reason);
      setConectado(false);
      setJogoAtivo(false);
      pararTodosOsSons();
      
      if (timeoutIniciarRef.current) {
        clearTimeout(timeoutIniciarRef.current);
        setIniciando(false);
      }
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔁 Reconectado ao servidor, tentativa:", attemptNumber);
      if (nomeJogador && salaId) {
        newSocket.emit("entrarSala", { nome: nomeJogador, salaId, modo: modoEspectador ? "espectador" : "jogador" });
      }
      // Toca a música de início novamente ao reconectar
      if (!jogoAtivo) {
        tocarSom('beginning', true);
      }
    });

    newSocket.on("estadoJogo", (estado) => {
      if (estado.modoEspectador) {
        setModoEspectador(true);
        console.log("👀 Modo espectador ativado");
      }
      
      if (estado.jogador && estado.jogador.vidas <= 0 && !estado.modoEspectador) {
        console.log("⚠️ Jogador eliminado, não restaurar estado");
        return;
      }
      
      console.log("🎮 Estado do jogo recebido", estado);
      atualizarEstado(estado);
      setJogoAtivo(estado.jogoAtivo);
      setTempoRestante(estado.tempoRestante || 180);
      setTempoJogo(estado.tempoJogo || 180);
      setModoCronometro(estado.modoCronometro || false);
      celulasModificadas.current.clear();
      
      if (estado.jogador) {
        setUiEstado(prev => ({
          ...prev,
          pontos: estado.jogador.pontos || 0,
          vidas: estado.jogador.vidas || 0,
          bolinhas: estado.bolinhasRestantes || 0,
          podeEliminar: estado.jogador.podeEliminar || false,
          velocidadeTurbo: estado.jogador.velocidadeTurbo || false
        }));
      }
    });

    newSocket.on("jogoIniciado", (dados) => {
      console.log("🚀 Jogo iniciado");
      setJogoAtivo(true);
      setIniciando(false);
      setTempoRestante(dados.tempoRestante || 180);
      setTempoJogo(dados.tempoJogo || 180);
      
      // PARA a música de início apenas quando o jogo realmente começa
      pararSom('beginning');
      tocarSom('waka', true); // Inicia o som de movimento em loop
      
      if (timeoutIniciarRef.current) {
        clearTimeout(timeoutIniciarRef.current);
        timeoutIniciarRef.current = null;
      }
      
      const jogadorAtual = dados.jogadores.find(j => j.id === newSocket.id);
      
      atualizarEstado({
        mapa: dados.mapa,
        fantasmas: dados.fantasmas,
        jogadores: dados.jogadores,
        jogador: jogadorAtual,
        jogoAtivo: true,
        bolinhasRestantes: dados.bolinhasRestantes
      });
      
      if (jogadorAtual) {
        setUiEstado(prev => ({
          ...prev,
          pontos: jogadorAtual.pontos || 0,
          vidas: jogadorAtual.vidas || 0,
          bolinhas: dados.bolinhasRestantes || 0,
          podeEliminar: jogadorAtual.podeEliminar || false,
          velocidadeTurbo: jogadorAtual.velocidadeTurbo || false
        }));
      }
      
      celulasModificadas.current.clear();
    });

    newSocket.on("estadoAtualizado", (dados) => {
      atualizarEstado({
        jogadores: dados.jogadores,
        fantasmas: dados.fantasmas,
        bolinhasRestantes: dados.bolinhasRestantes
      });

      const jogadorAtual = dados.jogadores.find(j => j.id === socketRef.current?.id);
      if (jogadorAtual) {
        setUiEstado(prev => ({
          ...prev,
          pontos: jogadorAtual.pontos || prev.pontos,
          vidas: jogadorAtual.vidas || prev.vidas,
          bolinhas: dados.bolinhasRestantes || prev.bolinhas,
          podeEliminar: jogadorAtual.podeEliminar || prev.podeEliminar,
          velocidadeTurbo: jogadorAtual.velocidadeTurbo || prev.velocidadeTurbo
        }));
      }
    });

    newSocket.on("jogadorMovido", (dados) => {
      atualizarEstado(prev => ({
        ...prev,
        jogadores: prev.jogadores.map(j => 
          j.id === dados.id ? { ...j, x: dados.x, y: dados.y, direcao: dados.direcao } : j
        ),
        jogador: prev.jogador?.id === dados.id ? { ...prev.jogador, x: dados.x, y: dados.y, direcao: dados.direcao } : prev.jogador
      }));
    });

    newSocket.on("movimentoJogador", (dados) => {
      atualizarEstado(prev => ({
        ...prev,
        jogadores: prev.jogadores.map(j => 
          j.id === dados.id ? { ...j, direcao: dados.direcao } : j
        )
      }));
    });

    newSocket.on("mapaAtualizado", (data) => {
      if (data.x !== undefined && data.y !== undefined) {
        atualizarCelulaMapa(data.x, data.y, 0);
      } else {
        atualizarEstado(prev => ({
          ...prev,
          mapa: data.mapa
        }));
      }
    });

    newSocket.on("bolinhaComida", (data) => {
      console.log("🔵 Bolinha comida - atualizando todos os jogadores");
      tocarSom('waka');
      
      if (data.x !== undefined && data.y !== undefined) {
        atualizarCelulaMapa(data.x, data.y, 0);
      }
      
      atualizarEstado(prev => ({
        ...prev,
        jogadores: prev.jogadores.map(j => {
          const jogadorAtualizado = data.jogadores.find(j2 => j2.id === j.id);
          return jogadorAtualizado ? { ...j, pontos: jogadorAtualizado.pontos } : j;
        }),
        bolinhasRestantes: data.bolinhasRestantes
      }));

      const jogadorAtual = data.jogadores.find(j => j.id === socketRef.current?.id);
      if (jogadorAtual) {
        setUiEstado(prev => ({
          ...prev,
          pontos: jogadorAtual.pontos,
          bolinhas: data.bolinhasRestantes
        }));
      }
    });

    newSocket.on("fantasmasAtualizados", (fantasmas) => {
      atualizarEstado({ fantasmas });
    });

    newSocket.on("jogadoresAtualizados", (jogadores) => {
      const jogadorAtual = jogadores.find(j => j.id === newSocket.id);
      
      atualizarEstado({
        jogadores: jogadores,
        jogador: jogadorAtual || estadoJogo.jogador
      });

      if (jogadorAtual) {
        setUiEstado(prev => ({
          ...prev,
          pontos: jogadorAtual.pontos || 0,
          vidas: jogadorAtual.vidas || 0,
          podeEliminar: jogadorAtual.podeEliminar || false,
          velocidadeTurbo: jogadorAtual.velocidadeTurbo || false
        }));
      }
    });

    newSocket.on("mestre", (isMestre) => {
      setMestre(isMestre);
      setMostrarLoginMestre(false);
    });

    newSocket.on("fantasmaComido", (data) => {
      console.log("👻 Fantasma comido - atualizando pontos");
      tocarSom('eatGhost');
      
      atualizarEstado(prev => ({
        ...prev,
        jogadores: prev.jogadores.map(j => {
          const jogadorAtualizado = data.jogadores.find(j2 => j2.id === j.id);
          return jogadorAtualizado ? { ...j, pontos: jogadorAtualizado.pontos } : j;
        })
      }));

      if (data.jogadorId === socketRef.current?.id) {
        const jogadorAtual = data.jogadores.find(j => j.id === socketRef.current?.id);
        if (jogadorAtual) {
          setUiEstado(prev => ({
            ...prev,
            pontos: jogadorAtual.pontos
          }));
          
          console.log("🎉 Você comeu um fantasma!");
        }
      }
    });

    newSocket.on("jogadorAtingido", (data) => {
      console.log("💥 Jogador atingido recebido:", data);
      
      const jogadorAindaExiste = data.jogadores.some(j => j.id === data.jogadorId);
      
      if (!jogadorAindaExiste) {
        console.log("ℹ️ Jogador foi eliminado, não mostrar alerta de atingido");
        return;
      }
      
      const jogadoresValidados = data.jogadores.map(j => ({
        ...j,
        vidas: Math.max(0, j.vidas)
      }));
      
      atualizarEstado(prev => ({
        ...prev,
        jogadores: prev.jogadores.map(j => {
          const jogadorAtualizado = jogadoresValidados.find(j2 => j2.id === j.id);
          return jogadorAtualizado ? { 
            ...j, 
            vidas: jogadorAtualizado.vidas,
            x: jogadorAtualizado.x,
            y: jogadorAtualizado.y
          } : j;
        }),
        jogador: jogadoresValidados.find(j => j.id === socketRef.current?.id) || prev.jogador
      }));

      if (data.jogadorId === socketRef.current?.id && !modoEspectador) {
        const jogadorAtual = jogadoresValidados.find(j => j.id === socketRef.current?.id);
        if (jogadorAtual) {
          const vidasValidas = Math.max(0, jogadorAtual.vidas);
          setUiEstado(prev => ({
            ...prev,
            vidas: vidasValidas
          }));
          
          setVidasRestantes(vidasValidas);
          setMostrarAtingido(true);
          podeFecharComEnter.current = true;
          tocarSom('death');
          
          if (timeoutAtingidoRef.current) {
            clearTimeout(timeoutAtingidoRef.current);
          }
          timeoutAtingidoRef.current = setTimeout(() => {
            setMostrarAtingido(false);
            podeFecharComEnter.current = false;
          }, 3000);
          
          console.log("🚨 VOCÊ foi pego por um fantasma!");
        }
      } else {
        console.log("ℹ️ Outro jogador foi pego, não mostrar alerta");
      }
    });

    newSocket.on("jogadorEliminado", (data) => {
      console.log("💀 Jogador eliminado:", data);
      
      if (data.jogadorId === socketRef.current?.id && !modoEspectador) {
        setJogoAtivo(false);
        setMostrarAtingido(false);
        setMostrarEliminado(true);
        setJogadorEliminado(data.jogadorNome);
        podeFecharComEnter.current = true;
        pararTodosOsSons();
        
        atualizarEstado(prev => ({
          ...prev,
          jogador: null,
          jogoAtivo: false
        }));
      }
      
      atualizarEstado(prev => ({
        ...prev,
        jogadores: data.jogadores || prev.jogadores
      }));
      
      if (data.jogadores && data.jogadores.length === 1) {
        const vencedor = data.jogadores[0];
        setJogoAtivo(false);
        setVencedorInfo({
          nome: vencedor.nome,
          pontos: vencedor.pontos
          });
        setMostrarVitoria(true);
        podeFecharComEnter.current = true;
        tocarSom('intermission');
      }
    });

    newSocket.on("jogadorEliminadoPoder", (data) => {
      console.log(`⚡ ${data.eliminadorNome} eliminou ${data.jogadorEliminadoNome}!`);
      
      atualizarEstado(prev => ({
        ...prev,
        jogadores: data.jogadores || prev.jogadores
      }));
      
      if (data.eliminadorId === socketRef.current?.id) {
        setMostrarAtingido(false);
        setMostrarEliminado(false);
        
        mostrarAviso(`🎯 Você eliminou ${data.jogadorEliminadoNome}! +400 pontos`, "eliminacao", 3000);
      } else if (data.jogadorEliminadoId === socketRef.current?.id) {
        setJogoAtivo(false);
        setMostrarAtingido(false);
        setMostrarEliminado(true);
        setJogadorEliminado(data.eliminadorNome);
        podeFecharComEnter.current = true;
        pararTodosOsSons();
        
        atualizarEstado(prev => ({
          ...prev,
          jogador: null,
          jogoAtivo: false
        }));
      }
    });

    newSocket.on("poderEliminarAtivado", (data) => {
      console.log(`⚡ ${data.jogadorNome} ativou poder de eliminar!`);
      setJogadorComPoder(data.jogadorNome);
      setTempoPoderEliminar(data.tempo);
      
      if (data.jogadorId === socketRef.current?.id) {
        setUiEstado(prev => ({
          ...prev,
          podeEliminar: true
        }));
        
        mostrarAviso(
          "⚡ PODER DE ELIMINAÇÃO ATIVADO! Você pode eliminar outros jogadores por 10 segundos!",
          "poder-ativado",
          4000
        );
      }
    });

    newSocket.on("poderEliminarDesativado", (data) => {
      if (data.jogadorId === socketRef.current?.id) {
        setJogadorComPoder(null);
        setTempoPoderEliminar(0);
        setUiEstado(prev => ({
          ...prev,
          podeEliminar: false
        }));
        
        mostrarAviso("⏰ Poder de eliminação expirou!", "poder-desativado", 3000);
      }
    });

    newSocket.on("frutaSpawnada", (data) => {
      console.log("🍒 Fruta spawnada recebida:", data);
      atualizarCelulaMapa(data.x, data.y, 4);
    });

    newSocket.on("frutaComida", (data) => {
      console.log("🍒 Fruta comida recebida:", data);
      tocarSom('eatFruit');
      
      if (data.x !== undefined && data.y !== undefined) {
        atualizarCelulaMapa(data.x, data.y, 0);
      }
      
      atualizarEstado(prev => ({
        ...prev,
        jogadores: prev.jogadores.map(j => {
          const jogadorAtualizado = data.jogadores.find(j2 => j2.id === j.id);
          return jogadorAtualizado ? { ...j, pontos: jogadorAtualizado.pontos } : j;
        })
      }));

      const jogadorAtual = data.jogadores.find(j => j.id === socketRef.current?.id);
      if (jogadorAtual) {
        setUiEstado(prev => ({
          ...prev,
          pontos: jogadorAtual.pontos
        }));
      }
      
      if (data.jogadorId === socketRef.current?.id) {
        mostrarAviso("🍒 FRUTA COLETADA! Velocidade turbo ativada!", "fruta-coletada", 3000);
      }
    });

    newSocket.on("velocidadeTurboAtivada", (data) => {
      console.log(`⚡ ${data.jogadorNome} ativou velocidade turbo!`);
      setJogadorComVelocidadeTurbo(data.jogadorNome);
      setTempoVelocidadeTurbo(data.tempo);
      
      if (data.jogadorId === socketRef.current?.id) {
        setUiEstado(prev => ({
          ...prev,
          velocidadeTurbo: true
        }));
        
        mostrarAviso(
          "⚡ VELOCIDADE TURBO ATIVADA! Você está 2x mais rápido por 5 segundos!",
          "velocidade-turbo",
          4000
        );
      }
    });

    newSocket.on("velocidadeTurboDesativada", (data) => {
      if (data.jogadorId === socketRef.current?.id) {
        setJogadorComVelocidadeTurbo(null);
        setTempoVelocidadeTurbo(0);
        setUiEstado(prev => ({
          ...prev,
          velocidadeTurbo: false
        }));
        
        mostrarAviso("⏰ Velocidade turbo expirou!", "velocidade-normal", 3000);
      }
    });

    newSocket.on("estadoJogador", (data) => {
      const dadosValidados = {
        ...data,
        vidas: Math.max(0, data.vidas || 0),
        pontos: Math.max(0, data.pontos || 0)
      };

      atualizarEstado(prev => ({
        ...prev,
        jogador: prev.jogador ? { ...prev.jogador, ...dadosValidados } : null
      }));

      setUiEstado(prev => ({
        ...prev,
        pontos: dadosValidados.pontos || prev.pontos,
        vidas: dadosValidados.vidas || prev.vidas
      }));
    });

    newSocket.on("powerUpAtivado", (data) => {
      console.log("⚡ Power-up ativado - atualizando todos os jogadores");
      
      if (data.x !== undefined && data.y !== undefined) {
        atualizarCelulaMapa(data.x, data.y, 0);
      }
      
      atualizarEstado(prev => ({
        ...prev,
        jogadores: prev.jogadores.map(j => {
          const jogadorAtualizado = data.jogadores.find(j2 => j2.id === j.id);
          return jogadorAtualizado ? { ...j, pontos: jogadorAtualizado.pontos } : j;
        })
      }));

      const jogadorAtual = data.jogadores.find(j => j.id === socketRef.current?.id);
      if (jogadorAtual) {
        setUiEstado(prev => ({
          ...prev,
          pontos: jogadorAtual.pontos
        }));
      }
    });

    newSocket.on("vitoria", (data) => {
      setJogoAtivo(false);
      setVencedorInfo({
        nome: data.campeao,
        pontos: data.pontos
      });
      setMostrarVitoria(true);
      podeFecharComEnter.current = true;
      pararTodosOsSons();
      tocarSom('intermission');
      console.log("🏆 Vitória detectada:", data.campeao, "com", data.pontos, "pontos");
    });

    newSocket.on("vitoriaTempo", (data) => {
      setJogoAtivo(false);
      setVencedorInfo({
        nome: data.campeao,
        pontos: data.pontos
      });
      setMostrarVitoria(true);
      podeFecharComEnter.current = true;
      pararTodosOsSons();
      tocarSom('intermission');
      console.log("⏰ Vitória por tempo:", data.campeao, "com", data.pontos, "pontos");
    });

    newSocket.on("jogoTerminado", (data) => {
      setJogoAtivo(false);
      setVencedorInfo({
        nome: "Jogo Terminado",
        pontos: 0
      });
      setMostrarVitoria(true);
      podeFecharComEnter.current = true;
      pararTodosOsSons();
      console.log("🎯 Jogo terminado:", data.motivo);
    });

    newSocket.on("atualizarTempo", (data) => {
      setTempoRestante(data.tempoRestante);
      setTempoJogo(data.tempoTotal);
    });

    newSocket.on("tempoDefinido", (data) => {
      setTempoRestante(data.tempoRestante);
      setTempoJogo(data.tempoJogo);
    });

    newSocket.on("erro", (data) => {
      mostrarAviso(data.mensagem, "erro", 3000);
      
      if (timeoutIniciarRef.current) {
        clearTimeout(timeoutIniciarRef.current);
        setIniciando(false);
      }
    });

    newSocket.on("pong", (latency) => {
      setUltimoPing(latency);
      setQualidadeConexao(Math.max(0, 100 - latency));
    });

    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        const startTime = Date.now();
        newSocket.emit("ping", () => {
          const latency = Date.now() - startTime;
          setUltimoPing(latency);
          setQualidadeConexao(Math.max(0, 100 - latency));
        });
      }
    }, 5000);

    return () => {
      clearInterval(pingInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [tocarSom, pararSom, pararTodosOsSons]);

  useEffect(() => {
    if (!jogoAtivo || modoEspectador) return;

    const processarMovimentos = () => {
      if (bufferMovimentos.current.length > 0 && socketRef.current && socketRef.current.connected) {
        const movimento = bufferMovimentos.current.shift();
        socketRef.current.emit("movimento", movimento);
      }
    };

    const interval = setInterval(processarMovimentos, 50);
    return () => clearInterval(interval);
  }, [jogoAtivo, modoEspectador]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && podeFecharComEnter.current) {
        setMostrarAvisoPoder(false);
        setMostrarAtingido(false);
        setMostrarEliminado(false);
        setMostrarVitoria(false);
        podeFecharComEnter.current = false;
      }

      if (!jogoAtivo || modoEspectador) return;

      let direcao;
      switch (e.key) {
        case "ArrowUp": case "w": case "W": direcao = "CIMA"; break;
        case "ArrowDown": case "s": case "S": direcao = "BAIXO"; break;
        case "ArrowLeft": case "a": case "A": direcao = "ESQUERDA"; break;
        case "ArrowRight": case "d": case "D": direcao = "DIREITA"; break;
        default: return;
      }

      handleMovimento(direcao);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jogoAtivo, handleMovimento, modoEspectador]);

  const entrarSala = () => {
    if (socketRef.current && nomeJogador) {
      socketRef.current.emit("entrarSala", { 
        nome: nomeJogador, 
        salaId,
        modo: modoEspectador ? "espectador" : "jogador"
      });
    }
  };

  const iniciarJogo = () => {
    if (socketRef.current) {
      setIniciando(true);
      socketRef.current.emit("iniciarJogo");
      
      timeoutIniciarRef.current = setTimeout(() => {
        if (iniciando && !jogoAtivo) {
          setIniciando(false);
          mostrarAviso("Falha ao iniciar o jogo. Trente novamente.", "erro", 3000);
        }
        timeoutIniciarRef.current = null;
      }, 5000);
    }
  };

  const fazerLoginMestre = () => {
    if (socketRef.current && loginMestre && senhaMestre) {
      socketRef.current.emit("loginMestre", { login: loginMestre, senha: senhaMestre });
    }
  };

  const definirTempo = () => {
    const tempo = parseInt(novoTempo);
    if (!isNaN(tempo) && tempo > 0) {
      socketRef.current.emit("definirTempo", { tempoSegundos: tempo });
      setNovoTempo(tempo.toString());
      setMostrarControlesTempo(false);
    }
  };

  const iniciarCronometro = () => {
    socketRef.current.emit("iniciarCronometro");
    setModoCronometro(true);
  };

  const pararCronometro = () => {
    socketRef.current.emit("pararCronometro");
    setModoCronometro(false);
  };

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  const desenharMapaCompleto = useCallback((ctx, mapa) => {
    for (let y = 0; y < mapa.length; y++) {
      for (let x = 0; x < mapa[y].length; x++) {
        const celula = mapa[y][x];
        if (celula !== 0) {
          const posX = x * TAMANHO_CELULA;
          const posY = y * TAMANHO_CELULA;

          if (celula === 1) {
            ctx.fillStyle = "#1E40AF";
            ctx.fillRect(posX, posY, TAMANHO_CELULA, TAMANHO_CELULA);
          } else if (celula === 2) {
            ctx.fillStyle = "#FFF";
            ctx.beginPath();
            ctx.arc(posX + TAMANHO_CELULA/2, posY + TAMANHO_CELULA/2, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (celula === 3) {
            ctx.fillStyle = "#F59E0B";
            ctx.beginPath();
            ctx.arc(posX + TAMANHO_CELULA/2, posY + TAMANHO_CELULA/2, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (celula === 4) {
            ctx.fillStyle = "#E11D48";
            ctx.beginPath();
            ctx.arc(posX + TAMANHO_CELULA/2, posY + TAMANHO_CELULA/2, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#22C55E";
            ctx.fillRect(posX + TAMANHO_CELULA/2 - 1, posY + 2, 2, 4);
          }
        }
      }
    }
  }, [TAMANHO_CELULA]);

  const desenharCelulasModificadas = useCallback((ctx, mapa, celulasModificadas) => {
    ctx.fillStyle = "#000";
    
    for (const celulaId of celulasModificadas) {
      const [x, y] = celulaId.split(',').map(Number);
      
      if (y >= 0 && y < mapa.length && x >= 0 && x < mapa[0].length) {
        const posX = x * TAMANHO_CELULA;
        const posY = y * TAMANHO_CELULA;
        
        ctx.fillRect(posX, posY, TAMANHO_CELULA, TAMANHO_CELULA);
        
        if (mapa[y][x] !== 0) {
          if (mapa[y][x] === 1) {
            ctx.fillStyle = "#1E40AF";
            ctx.fillRect(posX, posY, TAMANHO_CELULA, TAMANHO_CELULA);
          } else if (mapa[y][x] === 2) {
            ctx.fillStyle = "#FFF";
            ctx.beginPath();
            ctx.arc(posX + TAMANHO_CELULA/2, posY + TAMANHO_CELULA/2, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (mapa[y][x] === 3) {
            ctx.fillStyle = "#F59E0B";
            ctx.beginPath();
            ctx.arc(posX + TAMANHO_CELULA/2, posY + TAMANHO_CELULA/2, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (mapa[y][x] === 4) {
            ctx.fillStyle = "#E11D48";
            ctx.beginPath();
            ctx.arc(posX + TAMANHO_CELULA/2, posY + TAMANHO_CELULA/2, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#22C55E";
            ctx.fillRect(posX + TAMANHO_CELULA/2 - 1, posY + 2, 2, 4);
          }
        }
      }
    }
    
    celulasModificadas.clear();
  }, [TAMANHO_CELULA]);

  const desenharCena = useCallback((ctx, tempoAtual) => {
    tempoAtualRef.current = tempoAtual;
    
    if (!estadoJogo || !ctx) return;
    
    if (!modoOtimizado || celulasModificadas.current.size === 0) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    if (estadoJogo.mapa && estadoJogo.mapa.length > 0) {
      if (!modoOtimizado || JSON.stringify(ultimoMapaRef.current) !== JSON.stringify(estadoJogo.mapa)) {
        desenharMapaCompleto(ctx, estadoJogo.mapa);
        ultimoMapaRef.current = estadoJogo.mapa;
      } else if (celulasModificadas.current.size > 0) {
        desenharCelulasModificadas(ctx, estadoJogo.mapa, celulasModificadas.current);
      }
    }

    if (estadoJogo.fantasmas && estadoJogo.fantasmas.length > 0) {
      estadoJogo.fantasmas.forEach(fantasma => {
        ctx.fillStyle = fantasma.vulneravel ? "#60A5FA" : fantasma.cor;
        ctx.beginPath();
        ctx.arc(fantasma.x + TAMANHO_CELULA/2, fantasma.y + TAMANHO_CELULA/2, TAMANHO_CELULA/2, 0, Math.PI * 2);
        ctx.fill();
        
        if (!fantasma.vulneravel) {
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(fantasma.x + TAMANHO_CELULA/3, fantasma.y + TAMANHO_CELULA/3, 3, 0, Math.PI * 2);
          ctx.arc(fantasma.x + 2*TAMANHO_CELULA/3, fantasma.y + TAMANHO_CELULA/3, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    if (estadoJogo.jogadores && estadoJogo.jogadores.length > 0) {
      estadoJogo.jogadores.forEach(jogador => {
        if (jogador.podeEliminar) {
          ctx.shadowColor = 'red';
          ctx.shadowBlur = 15;
          ctx.globalAlpha = 0.7;
          
          const pulseSize = 5 + Math.sin(tempoAtual * 0.01) * 3;
          ctx.strokeStyle = "#FF0000";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(jogador.x + TAMANHO_CELULA/2, jogador.y + TAMANHO_CELULA/2, 
                  TAMANHO_CELULA/2 + pulseSize, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
          
          ctx.fillStyle = "#FF0000";
          ctx.font = "bold 10px Arial";
          ctx.fillText("⚡ ELIMINAR", jogador.x - 10, jogador.y - 15);
        }

        if (jogador.velocidadeTurbo) {
          ctx.shadowColor = 'blue';
          ctx.shadowBlur = 15;
          ctx.globalAlpha = 0.7;
          
          ctx.strokeStyle = "#3B82F6";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(jogador.x + TAMANHO_CELULA/2, jogador.y + TAMANHO_CELULA/2, 
                  TAMANHO_CELULA/2 + 3, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
        }

        ctx.fillStyle = "#FF0";
        let startAngle = 0.2 * Math.PI;
        let endAngle = 1.8 * Math.PI;

        switch (jogador.direcao) {
          case "ESQUERDA": startAngle = 1.2 * Math.PI; endAngle = 0.8 * Math.PI; break;
          case "CIMA": startAngle = 1.2 * Math.PI; endAngle = 0.2 * Math.PI; break;
          case "BAIXO": startAngle = 0.2 * Math.PI; endAngle = 1.2 * Math.PI; break;
        }

        ctx.beginPath();
        ctx.arc(jogador.x + TAMANHO_CELULA/2, jogador.y + TAMANHO_CELULA/2, TAMANHO_CELULA/2, startAngle, endAngle);
        ctx.lineTo(jogador.x + TAMANHO_CELULA/2, jogador.y + TAMANHO_CELULA/2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#FFF";
        ctx.font = "10px Arial";
        ctx.fillText(jogador.nome, jogador.x, jogador.y - 5);
      });
    }

    ctx.fillStyle = "#FFF";
    ctx.font = "14px Arial";
    ctx.fillText(`Pontos: ${uiEstado.pontos}`, 10, 20);
    ctx.fillText(`Vidas: ${uiEstado.vidas}`, 10, 40);
    ctx.fillText(`Bolinhas: ${uiEstado.bolinhas}`, 10, 60);
    
    const corConexao = qualidadeConexao > 80 ? "#10B981" : qualidadeConexao > 50 ? "#F59E0B" : "#EF4444";
    ctx.fillStyle = corConexao;
    ctx.fillText(`Ping: ${ultimoPing}ms`, 10, 80);
    
    ctx.fillStyle = modoCronometro ? "#FF4444" : "#10B981";
    ctx.font = "16px Arial";
    ctx.fillText(`Tempo: ${formatarTempo(tempoRestante)}`, 10, 100);
    
    if (uiEstado.podeEliminar && tempoPoderEliminar > 0) {
      ctx.fillStyle = "#FF4444";
      ctx.font = "14px Arial";
      ctx.fillText(`Poder: ${(tempoPoderEliminar / 1000).toFixed(1)}s`, 10, 120);
    }
    
    if (uiEstado.velocidadeTurbo && tempoVelocidadeTurbo > 0) {
      ctx.fillStyle = "#3B82F6";
      ctx.font = "14px Arial";
      ctx.fillText(`Turbo: ${(tempoVelocidadeTurbo / 1000).toFixed(1)}s`, 10, 140);
    }
  }, [estadoJogo, TAMANHO_CELULA, modoOtimizado, desenharMapaCompleto, desenharCelulasModificadas, ultimoPing, qualidadeConexao, uiEstado, tempoRestante, modoCronometro, tempoPoderEliminar, tempoVelocidadeTurbo]);

  useEffect(() => {
    if (!jogoAtivo) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    const FPS = 60;
    const intervalo = 1000 / FPS;

    const gameLoop = (tempoAtual) => {
      if (tempoAtual - ultimoTempoRender.current >= intervalo) {
        desenharCena(ctx, tempoAtual);
        ultimoTempoRender.current = tempoAtual;
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [jogoAtivo, desenharCena]);

  const jogadoresRender = useMemo(() => {
    return estadoJogo.jogadores || [];
  }, [estadoJogo.jogadores]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Conectando ao servidor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-yellow-400">🎯 PAC-MAN MULTIPLAYER</h1>

        {/* Controles de áudio */}
        <div className="fixed bottom-4 right-4 bg-gray-800 p-3 rounded-lg z-40 flex items-center space-x-3">
          <button
            onClick={() => setAudioAtivo(!audioAtivo)}
            className="text-2xl"
          >
            {audioAtivo ? '🔊' : '🔇'}
          </button>
          
          {audioAtivo && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20"
            />
          )}
        </div>

        {mostrarAvisoPoder && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
            <div className={`p-6 rounded-lg text-center max-w-md mx-4 transform transition-all duration-500 ${
              tipoAviso === "poder-ativado" 
                ? "bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse" 
                : tipoAviso === "poder-desativado" 
                ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                : tipoAviso === "eliminacao"
                ? "bg-gradient-to-br from-red-500 to-pink-600 animate-bounce"
                : tipoAviso === "fruta-coletada"
                ? "bg-gradient-to-br from-red-500 to-pink-500 animate-pulse"
                : tipoAviso === "velocidade-turbo"
                ? "bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse"
                : tipoAviso === "velocidade-normal"
                ? "bg-gradient-to-br from-gray-500 to-blue-500"
                : "bg-gradient-to-br from-gray-700 to-gray-800"
            }`}>
              <div className="text-6xl mb-4">
                {tipoAviso === "poder-ativado" ? "⚡" : 
                 tipoAviso === "poder-desativado" ? "⏰" : 
                 tipoAviso === "eliminacao" ? "🎯" : 
                 tipoAviso === "fruta-coletada" ? "🍒" :
                 tipoAviso === "velocidade-turbo" ? "⚡" :
                 tipoAviso === "velocidade-normal" ? "⏰" : "⚠️"}
              </div>
              
              <h2 className={`text-2xl font-bold mb-4 ${
                tipoAviso === "poder-ativado" || tipoAviso === "fruta-coletada" || tipoAviso === "velocidade-turbo" ? "text-black" : "text-white"
              }`}>
                {tipoAviso === "poder-ativado" ? "PODER ATIVADO!" : 
                 tipoAviso === "poder-desativado" ? "POWER DOWN" : 
                 tipoAviso === "eliminacao" ? "ELIMINAÇÃO!" : 
                 tipoAviso === "fruta-coletada" ? "FRUTA COLETADA!" :
                 tipoAviso === "velocidade-turbo" ? "TURBO ATIVADO!" :
                 tipoAviso === "velocidade-normal" ? "TURBO FINALIZADO" : "AVISO"}
              </h2>
              
              <p className={`text-lg mb-4 ${
                tipoAviso === "poder-ativado" || tipoAviso === "fruta-coletada" || tipoAviso === "velocidade-turbo" ? "text-black" : "text-white"
              }`}>
                {mensagemAviso}
              </p>
              
              {(tipoAviso === "poder-ativado" || tipoAviso === "velocidade-turbo") && (
                <div className="w-full bg-black bg-opacity-20 rounded-full h-3 mb-4">
                  <div 
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-10000"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              )}
              
              <div className="mt-4 text-sm opacity-80">
                ⏎ Pressione <kbd className="bg-black bg-opacity-30 px-2 py-1 rounded">Enter</kbd> para continuar
              </div>
              
              <button
                onClick={() => {
                  setMostrarAvisoPoder(false);
                  podeFecharComEnter.current = false;
                }}
                className={`px-6 py-2 rounded-full font-bold mt-4 ${
                  tipoAviso === "poder-ativado" || tipoAviso === "fruta-coletada" || tipoAviso === "velocidade-turbo" 
                    ? "bg-black text-yellow-400 hover:bg-gray-800" 
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {uiEstado.podeEliminar && (
          <div className="fixed top-4 right-4 bg-red-600 p-3 rounded-lg animate-pulse z-40">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-white font-bold">PODER ATIVO</p>
                <p className="text-white text-sm">
                  {(tempoPoderEliminar / 1000).toFixed(1)}s restantes
                </p>
              </div>
            </div>
          </div>
        )}

        {uiEstado.velocidadeTurbo && (
          <div className="fixed top-4 left-4 bg-blue-600 p-3 rounded-lg animate-pulse z-40">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-white font-bold">VELOCIDADE TURBO</p>
                <p className="text-white text-sm">
                  {(tempoVelocidadeTurbo / 1000).toFixed(1)}s restantes
                </p>
              </div>
            </div>
          </div>
        )}

        {iniciando && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="text-yellow-400 text-xl">🎮 Iniciando jogo...</div>
          </div>
        )}

        {mostrarAtingido && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-red-600 p-8 rounded-lg text-center animate-pulse max-w-md mx-4">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-3xl font-bold mb-4">VOCÊ FOI PEGO!</h2>
              <p className="text-xl mb-2">Um fantasma te alcançou!</p>
              <p className="text-lg mb-4">
                Vidas restantes: <span className="font-bold">{vidasRestantes}</span>
              </p>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-yellow-400 h-4 rounded-full transition-all duration-3000"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="text-sm mt-2 text-gray-300">Continuando em 3 segundos...</p>
              <div className="mt-4 text-sm opacity-80">
                ⏎ Pressione <kbd className="bg-black bg-opacity-30 px-2 py-1 rounded">Enter</kbd> para continuar
              </div>
            </div>
          </div>
        )}

        {mostrarEliminado && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-red-600 p-8 rounded-lg text-center animate-pulse max-w-md mx-4">
              <div className="text-6xl mb-4">💀</div>
              <h2 className="text-3xl font-bold mb-4">VOCÊ FOI ELIMINADO!</h2>
              <p className="text-xl mb-2">Sem vidas restantes</p>
              <p className="text-lg mb-4">
                Pontuação final: <span className="font-bold">{uiEstado.pontos}</span>
              </p>
              <div className="mt-4 text-sm opacity-80">
                ⏎ Pressione <kbd className="bg-black bg-opacity-30 px-2 py-1 rounded">Enter</kbd> para continuar
              </div>
              <button
                onClick={() => {
                  setMostrarEliminado(false);
                  setJogadorEliminado(null);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded mt-4"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {mostrarVitoria && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-lg text-center animate-bounce max-w-md mx-4">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold mb-4 text-black">
                {modoEspectador ? "FIM DE JOGO" : "VITÓRIA!"}
              </h2>
              
              {modoEspectador && (
                <div className="bg-black bg-opacity-20 p-3 rounded-lg mb-4">
                  <p className="text-white text-lg">Você estava assistindo</p>
                </div>
              )}
              
              <div className="bg-black bg-opacity-30 p-4 rounded-lg mb-4">
                <p className="text-2xl font-bold text-white mb-2">VENCEDOR:</p>
                <p className="text-3xl font-bold text-yellow-400">{vencedorInfo.nome}</p>
              </div>
              
              {vencedorInfo.pontos > 0 && (
                <div className="bg-black bg-opacity-20 p-3 rounded-lg mb-6">
                  <p className="text-2xl font-bold text-white">{vencedorInfo.pontos} PONTOS</p>
                  <p className="text-white">Pontuação conquistada</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black bg-opacity-20 p-3 rounded">
                  <p className="text-white text-sm">Jogadores</p>
                  <p className="text-white font-bold">{estadoJogo.jogadores?.length || 0}</p>
                </div>
                <div className="bg-black bg-opacity-20 p-3 rounded">
                  <p className="text-white text-sm">Bolinhas</p>
                  <p className="text-white font-bold">{uiEstado.bolinhas}</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm opacity-80 text-black">
                ⏎ Pressione <kbd className="bg-black bg-opacity-30 px-2 py-1 rounded">Enter</kbd> para continuar
              </div>
              
              <button
                onClick={() => {
                  setMostrarVitoria(false);
                  setVencedorInfo({ nome: "", pontos: 0 });
                }}
                className="bg-black text-yellow-400 hover:bg-gray-800 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 mt-4"
              >
                ✨ Continuar
              </button>
              
              <div className="mt-4">
                <p className="text-black text-sm opacity-70">
                  {vencedorInfo.nome === estadoJogo.jogador?.nome 
                    ? "Você dominou o labirinto!" 
                    : "Boa sorte na próxima!"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className={`px-3 py-1 rounded-full ${conectado ? 'bg-green-600' : 'bg-red-600'}`}>
            {conectado ? '✅ Conectado' : '❌ Desconectado'}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Modo Otimizado:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={modoOtimizado}
                onChange={() => setModoOtimizado(!modoOtimizado)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
        </div>

        {!conectado && (
          <div className="bg-red-600 p-4 rounded-lg text-center mb-4">
            ⚠️ Desconectado do servidor - Tentando reconectar automaticamente...
          </div>
        )}

        {mostrarLoginMestre && (
          <div className="bg-gray-800 p-6 rounded-lg text-center mb-4">
            <h2 className="text-2xl mb-4">Login Mestre</h2>
            <div className="space-y-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Login"
                value={loginMestre}
                onChange={(e) => setLoginMestre(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded text-white"
              />
              <input
                type="password"
                placeholder="Senha"
                value={senhaMestre}
                onChange={(e) => setSenhaMestre(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded text-white"
              />
              <div className="flex space-x-2">
                <button
                  onClick={fazerLoginMestre}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
                >
                  Entrar
                </button>
                <button
                  onClick={() => setMostrarLoginMestre(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 font-bold py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarControlesTempo && (
          <div className="bg-gray-800 p-6 rounded-lg text-center mb-4">
            <h2 className="text-2xl mb-4">Definir Tempo</h2>
            <div className="space-y-4 max-w-md mx-auto">
              <input
                type="number"
                placeholder="Tempo em segundos"
                value={novoTempo}
                onChange={(e) => setNovoTempo(e.target.value)}
                min="30"
                max="3600"
                className="w-full p-3 bg-gray-700 rounded text-white"
              />
              <div className="flex space-x-2">
                <button
                  onClick={definirTempo}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
                >
                  Definir
                </button>
                <button
                  onClick={() => setMostrarControlesTempo(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 font-bold py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {!estadoJogo.jogador && (
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-2xl mb-4">Entrar no Jogo</h2>
            <div className="space-y-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Seu nome"
                value={nomeJogador}
                onChange={(e) => setNomeJogador(e.target.value)}
                maxLength={15}
                className="w-full p-3 bg-gray-700 rounded text-white"
              />
              <input
                type="text"
                placeholder="ID da Sala (opcional)"
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
                maxLength={20}
                className="w-full p-3 bg-gray-700 rounded text-white"
              />
              
              <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded">
                <input
                  type="checkbox"
                  id="modoEspectador"
                  checked={modoEspectador}
                  onChange={(e) => setModoEspectador(e.target.checked)}
                  className="w-4 h-4 text-yellow-500"
                />
                <label htmlFor="modoEspectador" className="text-sm">
                  Entrar como espectador
                </label>
              </div>
              
              <button
                onClick={entrarSala}
                disabled={!nomeJogador || !conectado}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded disabled:opacity-50"
              >
                {conectado ? 
                  (modoEspectador ? "Assistir Jogo" : "Entrar na Sala") : 
                  "Aguardando conexão..."}
              </button>
              
              <button
                onClick={() => setMostrarLoginMestre(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 rounded"
              >
                👑 Login Mestre
              </button>
            </div>
          </div>
        )}

        {estadoJogo.jogador && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded">
              {modoEspectador ? (
                              <div className="text-blue-400 font-bold">👀 MODO ESPECTADOR</div>
              ) : (
                <>
                  <div>
                    <span className="text-yellow-400">Pontos: </span>
                    {uiEstado.pontos}
                  </div>
                  <div>
                    <span className="text-yellow-400">Vidas: </span>
                    {uiEstado.vidas}
                  </div>
                  <div>
                    <span className="text-yellow-400">Bolinhas: </span>
                    {uiEstado.bolinhas}
                  </div>
                  {uiEstado.podeEliminar && (
                    <div className="bg-red-600 px-3 py-1 rounded animate-pulse">
                      <span className="text-white">⚡ ELIMINAR </span>
                      <span className="text-white">
                        ({(tempoPoderEliminar / 1000).toFixed(1)}s)
                      </span>
                    </div>
                  )}
                  {uiEstado.velocidadeTurbo && (
                    <div className="bg-blue-600 px-3 py-1 rounded animate-pulse">
                      <span className="text-white">⚡ TURBO </span>
                      <span className="text-white">
                        ({(tempoVelocidadeTurbo / 1000).toFixed(1)}s)
                      </span>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                  Ping: {ultimoPing}ms
                </div>
                <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: qualidadeConexao > 80 ? "#10B981" : 
                                  qualidadeConexao > 50 ? "#F59E0B" : "#EF4444"
                }}></div>
              </div>
              
              <div className={`px-2 py-1 rounded ${modoCronometro ? 'bg-red-600' : 'bg-green-600'}`}>
                ⏰ {formatarTempo(tempoRestante)}
              </div>
              
              {mestre && (
                <div className="flex space-x-2">
                  {!jogoAtivo && (
                    <button
                      onClick={iniciarJogo}
                      disabled={iniciando}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded disabled:opacity-50 text-sm"
                    >
                      {iniciando ? "Iniciando..." : "Iniciar"}
                    </button>
                  )}
                  <button
                    onClick={() => setMostrarControlesTempo(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                  >
                    ⏰ Tempo
                  </button>
                  {jogoAtivo && (
                    <>
                      {modoCronometro ? (
                        <button
                          onClick={pararCronometro}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                        >
                          ⏹️ Parar
                        </button>
                      ) : (
                        <button
                          onClick={iniciarCronometro}
                          className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
                        >
                          ▶️ Iniciar
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {mestre && <span className="text-yellow-400">👑 Mestre</span>}
            </div>

            <div className="bg-blue-900 p-2 rounded relative">
              <canvas
                ref={canvasRef}
                width={LARGURA_MAPA * TAMANHO_CELULA}
                height={ALTURA_MAPA * TAMANHO_CELULA}
                className="bg-black mx-auto block border-2 border-yellow-400"
                style={{ imageRendering: 'pixelated' }}
              />
              
              {jogadorComPoder && jogadorComPoder !== estadoJogo.jogador?.nome && (
                <div className="absolute top-2 right-2 bg-red-600 p-2 rounded animate-pulse">
                  <div className="text-white text-sm font-bold">
                    ⚡ {jogadorComPoder} tem poder de eliminar!
                  </div>
                </div>
              )}

              {jogadorComVelocidadeTurbo && jogadorComVelocidadeTurbo !== estadoJogo.jogador?.nome && (
                <div className="absolute top-2 left-2 bg-blue-600 p-2 rounded animate-pulse">
                  <div className="text-white text-sm font-bold">
                    ⚡ {jogadorComVelocidadeTurbo} está com turbo!
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-yellow-400 mb-2">Controles:</h3>
              <p>↑ ↓ ← → Setas para mover</p>
              <p>W A S D Teclas alternativas</p>
              
              {uiEstado.podeEliminar && (
                <div className="mt-3 p-3 bg-red-600 rounded animate-pulse">
                  <p className="text-white font-bold flex items-center">
                    <span className="text-xl mr-2">⚡</span>
                    VOCÊ PODE ELIMINAR JOGADORES!
                  </p>
                  <p className="text-white text-sm mt-1">
                    Toque em outros jogadores para eliminá-los
                  </p>
                  <p className="text-white text-xs mt-1">
                    Tempo restante: {(tempoPoderEliminar / 1000).toFixed(1)}s
                  </p>
                </div>
              )}
              
              {uiEstado.velocidadeTurbo && (
                <div className="mt-3 p-3 bg-blue-600 rounded animate-pulse">
                  <p className="text-white font-bold flex items-center">
                    <span className="text-xl mr-2">⚡</span>
                    VELOCIDADE TURBO ATIVA!
                  </p>
                  <p className="text-white text-sm mt-1">
                    Você está 2x mais rápido
                  </p>
                  <p className="text-white text-xs mt-1">
                    Tempo restante: {(tempoVelocidadeTurbo / 1000).toFixed(1)}s
                  </p>
                </div>
              )}
              
              <p className="text-sm text-gray-400 mt-2">
                Modo otimizado: {modoOtimizado ? 'Ativado' : 'Desativado'}
              </p>
            </div>

            {jogadoresRender.length > 0 && (
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="text-yellow-400 mb-2">Jogadores ({jogadoresRender.length}):</h3>
                <div className="space-y-2">
                  {jogadoresRender.map((jogador, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <div className="flex items-center space-x-2">
                        <span>{jogador.nome}</span>
                        {jogador.id === socketRef.current?.id && (
                          <span className="text-yellow-400 text-sm">(Você)</span>
                        )}
                        {jogador.podeEliminar && (
                          <span className="bg-red-600 px-2 py-1 rounded text-xs animate-pulse">⚡</span>
                        )}
                        {jogador.velocidadeTurbo && (
                          <span className="bg-blue-600 px-2 py-1 rounded text-xs animate-pulse">🏃</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-blue-400 text-sm">
                          {jogador.vidas} ❤️
                        </span>
                        <span className="text-yellow-400 font-bold">
                          {jogador.pontos} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-yellow-400 mb-2">💡 Dicas Estratégicas:</h3>
              <ul className="text-sm space-y-1">
                <li>• 🍒 <strong>Fruta especial</strong> spawna a cada 30 segundos</li>
                <li>• ⚡ <strong>Velocidade turbo</strong> ao coletar frutas</li>
                <li>• 🏃‍♂️ <strong>2x mais rápido</strong> por 5 segundos</li>
                <li>• 🎯 <strong>+50 pontos</strong> por cada fruta coletada</li>
                <li>• 🍒 <strong>Frutas permanecem</strong> até serem coletadas</li>
                <li>• ⚡ <strong>Toque em outros jogadores</strong> para eliminá-los</li>
                <li>• 🎯 <strong>+400 pontos</strong> por cada eliminação</li>
                <li>• ⏰ <strong>10 segundos</strong> de duração do poder</li>
                <li>• 🏃‍♂️ <strong>Fuja</strong> de jogadores com poder vermelho!</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PacmanAvancado;