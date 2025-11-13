// ARQUIVO script.js (VERSÃO FINAL COM "CARRINHO")

// --- CONFIGURAÇÕES ---
const SEU_TELEFONE_WHATSAPP = "5582996535079";
const SUPABASE_URL = "https://oqctondabteyhkqogxtn.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xY3RvbmRhYnRleWhrcW9neHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Njc1MDEsImV4cCI6MjA3ODU0MzUwMX0.s3M828sPolvVSEdnANtGnHkfapn7jzOkvh7gMsIN74k";

// --- VARIÁVEIS GLOBAIS ---
const painel = document.getElementById('painel-rifa');
const statusRifa = document.getElementById('status-rifa');
const btnReservar = document.getElementById('btn-reservar'); // O novo botão
let numerosSelecionados = []; // O nosso "carrinho"

// --- CONEXÃO SUPABASE ---
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- FUNÇÕES ---

// 1. Função Principal: Busca e desenha os números
async function buscarNumeros() {
    try {
        const { data, error } = await _supabase.from('rifa_numeros').select('*').order('numero_rifa', { ascending: true });
        if (error) throw error;
        
        painel.innerHTML = ""; // Limpa o "Carregando..."
        let vendidos = 0;
        let totalNumeros = data.length; 
        
        data.forEach(numero => {
            const numeroDiv = document.createElement('div');
            numeroDiv.classList.add('numero');
            numeroDiv.textContent = numero.numero_rifa;
            
            let statusLimpo = numero.status ? numero.status.trim().toLowerCase() : 'livre';
            numeroDiv.classList.add(statusLimpo); 
            
            if (statusLimpo === 'vendido' || statusLimpo === 'pendente') {
                numeroDiv.title = `Comprado por: ${numero.nome_comprador || 'Reservado'}`;
                if (statusLimpo === 'vendido') { vendidos++; }
            } else {
                // MUDANÇA: O clique agora chama 'toggleNumero' (o carrinho)
                numeroDiv.title = "Clique para selecionar este número!";
                numeroDiv.addEventListener('click', () => toggleNumero(numeroDiv, numero.numero_rifa));
            }
            painel.appendChild(numeroDiv);
        });
        
        document.getElementById('status-rifa').innerHTML = `Status: <span>${vendidos} / ${totalNumeros}</span> vendidos`;
        
    } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
        painel.innerHTML = `<p style="color:red; text-align:center;"><b>Erro ao carregar a rifa.</b><br>Verifique as chaves do Supabase e a conexão.</p>`;
    }
}

// 2. NOVA FUNÇÃO: Adiciona ou remove o número do "carrinho"
function toggleNumero(elementoDiv, numero) {
    const index = numerosSelecionados.indexOf(numero);

    if (index > -1) {
        // Já estava selecionado, então REMOVE
        numerosSelecionados.splice(index, 1);
        elementoDiv.classList.remove('selecionado');
    } else {
        // Não estava selecionado, então ADICIONA
        numerosSelecionados.push(numero);
        elementoDiv.classList.add('selecionado');
    }
    
    // Atualiza o botão
    atualizarBotaoReserva();
}

// 3. NOVA FUNÇÃO: Atualiza o texto e o estado (ligado/desligado) do botão
function atualizarBotaoReserva() {
    if (numerosSelecionados.length > 0) {
        btnReservar.disabled = false;
        if (numerosSelecionados.length === 1) {
            btnReservar.textContent = `Reservar 1 número`;
        } else {
            btnReservar.textContent = `Reservar ${numerosSelecionados.length} números`;
        }
    } else {
        btnReservar.disabled = true;
        btnReservar.textContent = 'Selecione um número para reservar';
    }
}

// 4. FUNÇÃO ATUALIZADA: Agora se chama 'enviarReservaWhatsApp'
function enviarReservaWhatsApp() {
    if (numerosSelecionados.length === 0) return; // Segurança
    
    const nome = prompt("Qual seu nome para reserva?");
    if (nome) {
        // Ordena os números e junta com vírgula
        const numerosOrdenados = numerosSelecionados.sort((a, b) => a - b);
        const numerosString = numerosOrdenados.join(', ');

        const mensagem = `Olá! Quero reservar os números: ${numerosString}. (Total: ${numerosSelecionados.length} números). Meu nome é ${nome}.`;
        const linkWhatsapp = `https://wa.me/${SEU_TELEFONE_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
        
        window.open(linkWhatsapp, '_blank');
        
        alert("Você será redirecionado ao WhatsApp para confirmar sua reserva! Seus números só serão garantidos após a confirmação do PIX.");
    }
}

// --- INICIALIZAÇÃO ---
// 1. Adiciona o "ouvinte" de clique ao botão
btnReservar.addEventListener('click', enviarReservaWhatsApp);
// 2. Busca os números do Supabase
buscarNumeros();
