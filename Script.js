
const imagens = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"];
let cartasViradas = 0;
let primeiraCarta = null;
let segundaCarta = null;
let jogoEmPausa = false;
let pontos = 0;

let intervalo;
let [seconds, minutes, hours] = [0, 0, 0];
let timerStarted = false;

// Função para iniciar o timer
function começarTimer() {
    if (!timerStarted) {
        clearInterval(intervalo);
        intervalo = setInterval(updateTimer, 1000);
        timerStarted = true;
    }
}

// Função para atualizar o timer
function updateTimer() {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
        if (minutes === 60) {
            minutes = 0;
            hours++;
        }
    }
    document.getElementById('timer').innerText = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
}

// Função para formatar o tempo (adiciona zero à esquerda se necessário)
function formatTime(time) {
    return (time < 10 ? '0' : '') + time;
}

// Função para exibir as informações da carta
async function displayInfo(cardNumber) {
    const rightBottomContainer = document.querySelector('.container.right-bottom');
    rightBottomContainer.innerHTML = ""; // Limpa o conteúdo anterior

    try {
        // Carrega o arquivo JSON
        const response = await fetch('infos.json');
        const data = await response.json();

        // Encontra as informações correspondentes ao cardNumber
        const info = data[cardNumber];
        if (!info) {
            console.error('Informação não encontrada para o cardNumber:', cardNumber);
            return;
        }

        // Cria a estrutura HTML para exibir as informações
        const cardInfo = document.createElement('div');
        cardInfo.classList.add('card-info');

        // Adiciona a imagem
        const cardImage = document.createElement('img');
        cardImage.src = `imgs/${cardNumber}.jpg`;
        cardImage.style.opacity = '0'; // Inicia invisível
        cardInfo.appendChild(cardImage);

        // Adiciona a descrição
        const cardText = document.createElement('div');
        cardText.classList.add('card-text');
        cardText.style.opacity = '0'; // Inicia invisível
        cardText.textContent = info.descricao;
        cardInfo.appendChild(cardText);

        // Adiciona o objetivo
        const objetivoContainer = document.createElement('div');
        objetivoContainer.innerHTML = '<br><b>Significado:</b> ' + info.objetivo;
        cardInfo.appendChild(objetivoContainer);

        // Adiciona tudo ao container principal
        rightBottomContainer.appendChild(cardInfo);

        // Animação de fade-in para os elementos
        setTimeout(() => {
            cardImage.style.transition = 'opacity 0.5s ease-in-out';
            cardImage.style.opacity = '1';

            cardText.style.transition = 'opacity 0.5s ease-in-out';
            cardText.style.opacity = '1';

            objetivoContainer.style.transition = 'opacity 0.5s ease-in-out';
            objetivoContainer.style.opacity = '1';
        }, 100);
    } catch (error) {
        console.error('Erro ao carregar ou processar os dados:', error);
    }
}

// Função para iniciar o jogo
function iniciarJogo() {
    imagens.sort(() => Math.random() - 0.5);

    const imagensDuplicadas = imagens.concat(imagens.slice());

    const grade = document.querySelector(".grade");
    grade.innerHTML = "";

    grade.style.gridTemplateColumns = `repeat(7, 1fr)`;
    grade.style.gridTemplateRows = `repeat(5, 1fr)`;

    for (let i = 0; i < imagensDuplicadas.length; i++) {
        const carta = document.createElement("div");
        carta.classList.add("carta");

        const frente = document.createElement("div");
        frente.classList.add("frente");
        frente.style.backgroundImage = `url('imgs/${imagensDuplicadas[i]}.jpg')`;
        carta.appendChild(frente);

        const verso = document.createElement("div");
        verso.classList.add("verso");
        carta.appendChild(verso);

        carta.addEventListener("click", () => {
            começarTimer();
            if (jogoEmPausa || carta.classList.contains("virada") || carta === document.querySelector(".carta-central")) return;

            carta.classList.add("virada");
            cartasViradas++;

            if (cartasViradas === 1) {
                primeiraCarta = carta;
            } else if (cartasViradas === 2) {
                segundaCarta = carta;

                if (primeiraCarta.querySelector(".frente").style.backgroundImage === segundaCarta.querySelector(".frente").style.backgroundImage) {
                    const cardNumber = segundaCarta.querySelector(".frente").style.backgroundImage.split('/').pop().split('.')[0];

                    displayInfo(cardNumber);

                    pontos++;
                    document.querySelector(".pontos").textContent = `Pontos: ${pontos}`;
                    primeiraCarta = null;
                    segundaCarta = null;
                    cartasViradas = 0;

                    if (pontos === 17) {
                        clearInterval(intervalo);
                        Swal.fire({
                            icon: "success",
                            title: "Parabéns <3!",
                            text: "Você completou o jogo com " + pontos + " pontos",
                        });
                        pontos = 0;
                    }
                } else {
                    jogoEmPausa = true;
                    setTimeout(() => {
                        primeiraCarta.classList.remove("virada");
                        segundaCarta.classList.remove("virada");
                        primeiraCarta = null;
                        segundaCarta = null;
                        cartasViradas = 0;
                        jogoEmPausa = false;
                    }, 1000);
                }
            }
        });

        grade.appendChild(carta);
    }

    const cartaCentral = document.createElement("div");
    cartaCentral.classList.add("carta-central");
    const imgCentral = document.createElement("img");
    imgCentral.src = "imgs/Logo LGBT.jpg";
    imgCentral.alt = "Logo LGBT";
    cartaCentral.appendChild(imgCentral);
    grade.appendChild(cartaCentral);
}

// Reiniciar o jogo
document.querySelector(".botao-reiniciar").addEventListener("click", function reiniciar() {
    pontos = 0;
    clearInterval(intervalo);
    [seconds, minutes, hours] = [0, 0, 0];
    timerStarted = false;
    document.getElementById('timer').innerText = '00:00:00';
    document.querySelector(".pontos").textContent = `Pontos: ${pontos}`;
    const rightBottomContainer = document.querySelector('.container.right-bottom');
    rightBottomContainer.innerHTML = "";

    iniciarJogo();
});

// Iniciar o jogo ao carregar a página
iniciarJogo();