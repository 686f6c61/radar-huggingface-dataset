# Zidane29/MiniMax-Music3

## MiniMax Music 3

### Resumen

MiniMax Music 3 es un modelo de generación de música de código abierto desarrollado por MiniMax, diseñado para crear canciones completas de hasta cinco minutos de duración a partir de dos entradas: una letra (con posibles etiquetas de sección como `[Verse]`, `[Chorus]`, `[Bridge]`) y una descripción musical detallada. El modelo genera audio estéreo WAV a 32 kHz con coherencia estructural a largo plazo, manteniendo temas, ritmo, identidad vocal y evolución del arreglo a lo largo de toda la pieza.

La arquitectura combina un LLM global de 8B parámetros (inicializado desde Qwen3-8B) que modela la estructura semántica y musical a nivel de canción, un LLM local de 0.6B que se encarga del detalle acústico a nivel de trama, y un sistema de síntesis de estados ocultos continuos basado en Flow Matching y un decoder Flow-VAE. Esta combinación permite una generación de audio estable y expresiva, con control fino sobre género, BPM, tonalidad, interpretación vocal e instrumentación.

El modelo se distribuye con pesos abiertos y se puede ejecutar localmente, lo que lo convierte en una opción relevante para desarrolladores y estudios que necesiten generación de música personalizada sin depender de APIs propietarias. La documentación oficial incluye una demo interactiva y un repositorio de GitHub con ejemplos de uso.

### Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Global LLM (8B) + Local LLM (0.6B) + Flow Matching (2.4B) + Flow-VAE Decoder (123M) |
| Parametros totales | No disponible como cifra única; la suma de componentes es ~11.1B (según documentación oficial) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (genera audio de hasta 5 minutos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la documentación no especifica idiomas; se asume multilingüe por la naturaleza de las letras) |
| Licencia | No disponible (el repositorio oficial incluye un archivo LICENSE, pero no se especifica el tipo en la documentación) |
| Formato de pesos | safetensors |

### Arquitectura y entrenamiento

MiniMax Music 3 utiliza una arquitectura jerárquica autoregresiva que separa el modelado musical global del modelado acústico local. El Global LLM (8B parámetros) se inicializa desde Qwen3-8B y predice el primer codebook RVQ trama a trama, capturando la progresión semántica y estructural de la canción. El Local LLM (0.6B) predice los codebooks acústicos restantes dentro de cada trama, restaurando el detalle acústico fino. Ambos modelos se entrenan conjuntamente sobre todos los codebooks RVQ.

El tokenizador musical utiliza ocho capas de cuantización vectorial residual (RVQ): el primer codebook semántico tiene 16 384 entradas, mientras que los siete codebooks acústicos restantes tienen 1024 entradas cada uno. El entrenamiento primero optimiza el codebook semántico y luego entrena conjuntamente los ocho. En inferencia, la síntesis de forma de onda no decodifica directamente los tokens discretos, sino que fusiona los estados ocultos finales de ambos LLM mediante un módulo de fusión, que alimenta un modelo Flow Matching de 2.4B parámetros. Este produce un latente Flow-VAE que el decoder (123M) convierte en audio estéreo de 32 kHz. El Flow-VAE está adaptado de MiniMax Speech y se ha reentrenado para el rango dinámico y las características espectrales de la música.

No se han publicado detalles sobre la cantidad de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

### Capacidades

- Generación de canciones completas de hasta cinco minutos con estructura coherente (intro, verso, pre-coro, coro, puente, sección instrumental, outro).
- Control fino mediante letras con etiquetas de sección explícitas y una descripción musical estructurada (metadatos globales, detalles vocales y arreglo).
- Síntesis de audio estéreo a 32 kHz con calidad estable en pasajes largos.
- Capacidad de seguir progresiones emocionales, cambios de instrumentación y evolución del arreglo a lo largo de la canción.
- Soporte para voces expresivas, armonías, coros y efectos vocales, controlables mediante la descripción.
- Generación de música instrumental o con voz, según la entrada.
- No se menciona soporte explícito para tool calling, agentes ni razonamiento multi-paso; el modelo está especializado en generación de audio musical.

### Casos de uso

- Composición de canciones para creadores de contenido: un youtuber o streamer puede generar una canción original con letra personalizada y estilo musical específico para usar como intro, fondo o cierre de sus vídeos, gracias a la capacidad de generar piezas completas con estructura definida.
- Producción musical independiente: músicos y productores pueden usar el modelo como herramienta de lluvia de ideas, generando demos de canciones con diferentes géneros, BPM y tonalidades a partir de una descripción textual, para luego refinarlas en un DAW.
- Bandas sonoras para vídeojuegos: los desarrolladores pueden generar piezas musicales de hasta cinco minutos con variaciones de intensidad y emoción, adecuadas para bucles de juego o escenas narrativas, controlando la progresión emocional mediante la descripción.
- Publicidad y marketing: agencias pueden crear jingles o piezas musicales personalizadas para campañas, especificando el tono, la instrumentación y la duración exacta, sin necesidad de contratar a un compositor.
- Educación musical: profesores pueden generar ejemplos auditivos de estructuras de canción (verso, coro, puente) para ilustrar conceptos de teoría musical, usando las etiquetas de sección para demostrar cómo se construye una pieza.
- Prototipado rápido para estudios de grabación: ingenieros de sonido pueden probar diferentes arreglos vocales e instrumentales antes de grabar, generando múltiples versiones de una misma letra con distintas descripciones de estilo y producción.

### Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

### Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para MiniMax Music 3.
- Dado el tamaño total estimado del modelo (~11.1B parámetros), se necesitaría una GPU con al menos 24 GB de VRAM para inferencia en precisión FP16, o alrededor de 12 GB con cuantización de 8 bits.
- GPUs recomendadas: NVIDIA A100, H100, RTX 4090 o superiores. En GPUs de consumo como RTX 3090/4090 podría ejecutarse con cuantización, pero no hay garantías.
- Opciones de despliegue: no se mencionan frameworks específicos como vLLM, llama.cpp u Ollama en la documentación; el modelo se distribuye con la librería `diffusers` y el pipeline `text-to-audio`.
- Latencia y throughput: no disponibles.

### Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generación de música como MusicGen (Meta), AudioLDM 2 o Stable Audio. La documentación oficial no incluye comparaciones cuantitativas ni cualitativas con alternativas.

### Limitaciones y advertencias

- La licencia no está especificada en la documentación; antes de usar el modelo en proyectos comerciales es imprescindible revisar el archivo LICENSE del repositorio oficial.
- No se han publicado detalles sobre sesgos o limitaciones idiomáticas; el modelo puede tener un rendimiento desigual con letras en idiomas poco representados en sus datos de entrenamiento.
- Existe riesgo de alucinación en la generación de letras o de incoherencias en pasajes muy largos, aunque la arquitectura intenta mitigarlo mediante el modelado global.
- El modelo genera audio de 32 kHz, por debajo de la calidad de estudio (44.1 kHz o 48 kHz), lo que puede requerir post-procesado para usos profesionales.
- El repo de Hugging Face de terceros (Zidane29/MiniMax-Music3) parece un mirror incompleto (solo 2.43B parámetros en safetensors) y no debe confundirse con el modelo oficial completo.
- No se garantiza la compatibilidad con todas las configuraciones de hardware; se recomienda probar en un entorno controlado antes de integrarlo en producción.

### Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Repositorio espejo (tercero, posiblemente incompleto): https://huggingface.co/Zidane29/MiniMax-Music3
- Código fuente en GitHub: https://github.com/MiniMax-AI/MiniMax-Music3
- Demo interactiva: https://minimax-ai.github.io/music3-demo/
- Guía independiente (no oficial): https://minimaxmusic3.ai/
- Licencia (en el repositorio oficial): https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
