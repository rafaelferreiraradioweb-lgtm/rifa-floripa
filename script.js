// ARQUIVO script.js

// SUAS CHAVES JÁ ESTÃO PREENCHIDAS
const SEU_TELEFONE_WHATSAPP = "5582996535079";
const SUPABASE_URL = "https://oqctondabteyhkqogxtn.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xY3RvbmRhYnRleWhrcW9neHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Njc1MDEsImV4cCI6MjA3ODU0MzUwMX0.s3M828sPolvVSEdnANtGnHkfapn7jzOkvh7gMsIN74k";

// DAQUI PARA BAIXO O CÓDIGO FUNCIONA SOZINHO
const painel = document.getElementById('painel-rifa');
const statusRifa = document.getElementById('status-rifa');

if (SUPABASE_URL === "COLOQUE_SUA_URL_SUPABASE_AQUI") {
    painel.innerHTML = `<p style="color:red; text-align:center;"><b>ERRO: CHAVES NÃO CONFIGURADAS.</b></p>`;
}

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
                numeroDiv.title = "Clique para reservar este número!";
                numeroDiv.addEventListener('click', () => reservarNumero(numero.numero_rifa));
            }
            painel.appendChild(numeroDiv);
        });
        document.getElementById('status-rifa').innerHTML = `Status: <span>${vendidos} / ${totalNumeros}</span> vendidos`;
    } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
        painel.innerHTML = `<p style="color:red; text-align:center;"><b>Erro ao carregar a rifa.</b><br>Verifique as chaves do Supabase e a conexão.</p>`;
    }
}
function reservarNumero(numero) {
    const nome = prompt("Qual seu nome para reserva?");
    if (nome) {
        const mensagem = `Olá! Quero reservar o número ${numero} da rifa de xadrez. Meu nome é ${nome}.`;
        const linkWhatsapp = `https://wa.me/${SEU_TELEFONE_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
        window.open(linkWhatsapp, '_blank');
        alert("Você será redirecionado ao WhatsApp para confirmar sua reserva! Seu número só será garantido após a confirmação do PIX.");
    }
}
buscarNumeros();
