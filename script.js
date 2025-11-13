// ARQUIVO script.js (VERSÃO FINAL COM "CARRINHO" E WHATSAPP CORRIGIDO)

// --- CONFIGURAÇÕES ---
const SEU_TELEFONE_WHATSAPP = "5582996535079";
const SUPABASE_URL = "https://oqctondabteyhkqogxtn.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xY3RvbmRhYnRleWhrcW9neHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Njc1MDEsImV4cCI6MjA3ODU0MzUwMX0.s3M828sPolvVSEdnANtGnHkfapn7jzOkvh7gMsIN74k";

// --- VARIÁVEIS GLOBAIS ---
const painel = document.getElementById('painel-rifa');
const statusRifa = document.getElementById('status-rifa');
const btnReservar = document.getElementById('btn-reservar'); 
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
        
        painel.innerHTML = ""; 
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
        numerosSelecionados.splice(index, 1);
        elementoDiv.classList.remove('selecionado');
    } else {
        numerosSelecionados.push(numero);
        elementoDiv.classList.add('selecionado');
    }
    
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

// 4. FUNÇÃO CORRIGIDA: (SEM PROMPT, SEM ALERT)
function enviarReservaWhatsApp() {
    if (numerosSelecionados.length === 0) return; 

    // Ordena os números e junta com vírgula
    const numerosOrdenados = numerosSelecionados.sort((a, b) => a - b);
    const numerosString = numerosOrdenados.join(', ');

    // Mensagem pré-pronta. O usuário vai digitar o nome no WhatsApp.
    const mensagem = `Olá! Quero reservar os números da rifa do Floripa Chess Open 2026:\n\n*${numerosString}*\n\n(Total: ${numerosSelecionados.length} números). \n\nMeu nome é: `;
    const linkWhatsapp = `https://wa.me/${SEU_TELEFONE_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    
    // Abre o WhatsApp DIRETAMENTE. O navegador não vai bloquear.
    window.open(linkWhatsapp, '_blank');
}

// --- INICIALIZAÇÃO ---
btnReservar.addEventListener('click', enviarReservaWhatsApp);
buscarNumeros();
