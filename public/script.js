class DibujanteCirculo {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dibujando = false;
        this.puntos = [];
        this.ultimoX = 0;
        this.ultimoY = 0;
        this.puntuacion = 0;
        
        // Establecer tamaño del canvas
        this.ajustarCanvas();
        
        // Agregar listeners de eventos para mouse
        this.canvas.addEventListener('mousedown', this.empezarDibujo.bind(this));
        this.canvas.addEventListener('mousemove', this.dibujar.bind(this));
        this.canvas.addEventListener('mouseup', this.terminarDibujo.bind(this));
        this.canvas.addEventListener('mouseout', this.terminarDibujo.bind(this));
        
        // Agregar listeners de eventos para touch (dispositivos móviles)
        this.canvas.addEventListener('touchstart', this.manejarTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.manejarTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.terminarDibujo.bind(this));
        
        // Agregar listeners de botones
        document.getElementById('startButton').addEventListener('click', this.limpiarCanvas.bind(this));
        document.getElementById('clearButton').addEventListener('click', this.limpiarCanvas.bind(this));
        
        // Agregar listener para redimensionar
        window.addEventListener('resize', this.ajustarCanvas.bind(this));
        
        // Agregar listener para tecla Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.limpiarCanvas();
            }
        });
    }

    ajustarCanvas() {
        // Tamaño fijo para mejor rendimiento
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    manejarTouchStart(e) {
        e.preventDefault(); // Prevenir scroll
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.ultimoX = touch.clientX - rect.left;
            this.ultimoY = touch.clientY - rect.top;
            
            this.dibujando = true;
            this.puntos = [];
            this.puntos.push({ x: this.ultimoX, y: this.ultimoY });
            
            // Dibujar el primer punto
            this.ctx.beginPath();
            this.ctx.arc(this.ultimoX, this.ultimoY, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    manejarTouchMove(e) {
        e.preventDefault(); // Prevenir scroll
        if (!this.dibujando) return;
        
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.ultimoX, this.ultimoY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            
            this.ultimoX = x;
            this.ultimoY = y;
            this.puntos.push({ x, y });
        }
    }

    empezarDibujo(e) {
        this.dibujando = true;
        this.puntos = [];
        const rect = this.canvas.getBoundingClientRect();
        this.ultimoX = e.clientX - rect.left;
        this.ultimoY = e.clientY - rect.top;
        this.puntos.push({ x: this.ultimoX, y: this.ultimoY });
        
        // Dibujar el primer punto
        this.ctx.beginPath();
        this.ctx.arc(this.ultimoX, this.ultimoY, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    dibujar(e) {
        if (!this.dibujando) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.ultimoX, this.ultimoY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        this.ultimoX = x;
        this.ultimoY = y;
        this.puntos.push({ x, y });
    }

    terminarDibujo() {
        if (!this.dibujando) return;
        
        this.dibujando = false;
        if (this.puntos.length > 10) {
            this.calcularPerfeccionCirculo();
        } else if (this.puntos.length > 0) {
            // Si hay muy pocos puntos, mostrar mensaje
            document.getElementById('scoreDisplay').textContent = 'Dibuja más';
            setTimeout(() => {
                document.getElementById('scoreDisplay').textContent = '0%';
            }, 1500);
        }
    }

    limpiarCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.puntos = [];
        document.getElementById('scoreDisplay').textContent = '0%';
        document.getElementById('scoreDisplay').style.color = '#27ae60';
        
        // Restablecer el estilo del trazo
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
    }

    calcularPerfeccionCirculo() {
        // Encontrar centro de masa
        let centroX = 0;
        let centroY = 0;
        
        this.puntos.forEach(punto => {
            centroX += punto.x;
            centroY += punto.y;
        });
        
        centroX /= this.puntos.length;
        centroY /= this.puntos.length;
        
        // Calcular radio promedio y desviaciones
        let radioTotal = 0;
        let desviacionesRadio = 0;
        
        this.puntos.forEach(punto => {
            const radio = Math.sqrt(
                Math.pow(punto.x - centroX, 2) +
                Math.pow(punto.y - centroY, 2)
            );
            radioTotal += radio;
        });
        
        const radioPromedio = radioTotal / this.puntos.length;
        
        this.puntos.forEach(punto => {
            const radio = Math.sqrt(
                Math.pow(punto.x - centroX, 2) +
                Math.pow(punto.y - centroY, 2)
            );
            desviacionesRadio += Math.abs(radio - radioPromedio);
        });
        
        // Calcular puntuación (menores desviaciones significan mejor círculo)
        const desviacionMaxima = radioPromedio;
        const desviacionNormalizada = desviacionesRadio / (this.puntos.length * desviacionMaxima);
        let puntuacion = Math.max(0, Math.min(100, (1 - desviacionNormalizada) * 100));
        
        // Ajustar la puntuación según la cantidad de puntos (más puntos = más precisión)
        if (this.puntos.length < 50) {
            puntuacion *= 0.85 + (this.puntos.length / 50) * 0.15;
        }
        
        puntuacion = Math.round(puntuacion);
        
        // Mostrar la puntuación
        const scoreDisplay = document.getElementById('scoreDisplay');
        scoreDisplay.textContent = `${puntuacion}%`;
        
        // Cambiar color según puntuación
        if (puntuacion >= 90) {
            scoreDisplay.style.color = '#27ae60'; // Verde
        } else if (puntuacion >= 70) {
            scoreDisplay.style.color = '#2980b9'; // Azul
        } else if (puntuacion >= 50) {
            scoreDisplay.style.color = '#f39c12'; // Naranja
        } else {
            scoreDisplay.style.color = '#c0392b'; // Rojo
        }
        
        // Dibujar círculo ideal para comparación
        if (puntuacion >= 50) {
            setTimeout(() => {
                this.dibujarCirculoIdeal(centroX, centroY, radioPromedio);
            }, 500);
        }
    }
    
    dibujarCirculoIdeal(centroX, centroY, radio) {
        // Guardar el estado actual
        this.ctx.save();
        
        // Configurar estilo para el círculo ideal
        this.ctx.strokeStyle = 'rgba(41, 128, 185, 0.3)';
        this.ctx.lineWidth = 2;
        
        // Dibujar círculo ideal
        this.ctx.beginPath();
        this.ctx.arc(centroX, centroY, radio, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Restaurar estado
        this.ctx.restore();
    }
}

// Inicializar la aplicación cuando se cargue la página
window.addEventListener('load', () => {
    new DibujanteCirculo();
});