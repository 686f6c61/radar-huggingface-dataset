# square-zero-labs/scnet

## Resumen

SCNet (Sparse Compression Network) es una red neuronal para separación de fuentes musicales, publicada en ICASSP 2024 por Tong, Zhu, Chen, Kang, Jiang, Li, Wu y Meng. El modelo recibe una mezcla estéreo y la descompone en cuatro pistas (stems): batería, bajo, otros y voz. Esta ficha concreta es una exportación a ONNX con pesos cuantizados a int8, distribuida por square-zero-labs, que empaqueta la red entre la STFT y la iSTFT en un único grafo de 12,9 MB.

La arquitectura combina convoluciones band-split con LSTMs de doble camino (dual-path) operando sobre el espectrograma complejo, con 10,1 M de parámetros (la variante SCNet-large reducida a la mitad de anchura). El modelo fue entrenado por sus autores sobre MUSDB18-HQ y el checkpoint original lo distribuye el repositorio Music-Source-Separation-Training de Roman Solovyev.

Su relevancia práctica está en el tamaño y el formato: al ser un grafo ONNX de 12,9 MB que se ejecuta en float32 internamente, puede desplegarse en navegador (onnxruntime-web con WebGPU) o en entornos sin GPU dedicada, manteniendo una calidad (SDR mediana de 9,88 dB en voz y 9,44 dB en batería sobre el test de MUSDB18) prácticamente idéntica a la del export float32 de 42,8 MB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Convoluciones band-split + LSTMs dual-path sobre espectrograma complejo (SCNet) |
| Parámetros totales | 10,1 M (SCNet-large a media anchura) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesa segmentos de 11 s (485.100 muestras a 44,1 kHz, 476 frames) |
| Tipos de cuantización | int8 (77 de 82 tensores) + float16 (5 tensores del decoder); export float32 de origen (42,8 MB); float16 completo (23,2 MB) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT (Copyright (c) 2024 starrytong) |
| Formato de pesos | ONNX (`scnet.int8.onnx`, 12.900.277 bytes) |

## Arquitectura y entrenamiento

SCNet opera sobre el espectrograma complejo de una mezcla estéreo. La entrada del grafo es `mix_spec` con forma [1, 4, 2049, 476] (parte real e imaginaria de L y R), obtenida con STFT de n=4096, hop de 1024, sin ventana, escalada por 1/√4096 y con padding reflectivo centrado. La salida `stems_spec` tiene forma [1, 16, 2049, 476]: cuatro fuentes (drums, bass, other, vocals) × canal × parte real e imaginaria. El núcleo son convoluciones band-split que alimentan LSTMs dual-path, una combinación habitual en separación musical por su eficiencia frente a transformers de audio.

El entrenamiento lo realizaron los autores originales sobre MUSDB18-HQ (Rafii et al., 2019). Esta exportación no reentrena nada: parte del checkpoint `scnet_checkpoint_musdb18.ckpt` (SHA-256 `1bc0d1ab...`) de la release v1.0.6 de Music-Source-Separation-Training, con su `config_musdb18_scnet.yaml`. El proceso de exportación convierte la rFFT sobre el tiempo en productos de coseno y seno y reduce las estadísticas de GroupNorm eje a eje; la verificación reporta una diferencia máxima de 2,2e-6 respecto a `SCNet.forward` sobre ruido y tonos. La compactación a int8 usa calibración con dos previews de entrenamiento de MUSDB18 y deja en float16 las cinco capas finales del decoder (la convolución de `decoder.2.0`, las tres convoluciones transpuestas de `decoder.1.1` y la primera de `decoder.2.1`), porque cuantizarlas solas a int8 degradaba la salida entre 27 y 39 dB. Los pesos se almacenan en int8 con una escala por canal de salida (y por fila de puerta y dirección en las LSTM), pero el grafo hace Cast a float32 y multiplica por la escala en cada operación, de modo que onnxruntime pliega los pesos a float32 al cargar la sesión.

## Capacidades

- Separación de fuentes musicales en cuatro stems: drums, bass, other y vocals.
- Procesamiento de audio estéreo a 44,1 kHz en segmentos de 11 s, con solapamiento de 2,75 s y fades gestionados por el pipeline externo (`demix()` de Music-Source-Separation-Training).
- Ejecución como grafo ONNX autocontenido entre STFT e iSTFT: el consumidor solo aporta el espectrograma de entrada y recibe el de las cuatro fuentes.
- Compatibilidad con onnxruntime en CPU y con onnxruntime-web (WebGPU) en navegador; el export elimina las matrices DFT en float64 que la sesión WebGPU no puede colocar.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente audio-a-audio.
- No tiene capacidades multilingües ni de visión.

## Casos de uso

- Karaoke y eliminación de voz: ejecutar el modelo sobre una canción y descartar el stem de vocals permite generar una pista instrumental. El SDR de 9,88 dB en voz sobre MUSDB18 es suficiente para uso recreativo, aunque en pasajes con voz muy baja el stem puede degradarse (el caso PR - Happy Daze pierde 2,2 dB).
- Remezclas y edición musical: los stems de drums, bass y other permiten subir o bajar instrumentos por separado. La model card verifica que en remixes de prueba (voz +6 dB, voz −6 dB, batería −6 dB) el SDR se mantiene en 18,23, 21,05 y 20,92 dB respectivamente, lo que indica que el modelo no se degrada cuando una fuente domina la mezcla.
- Preprocesado para pipelines de MIR (music information retrieval): separar stems antes de tareas de transcripción de bajo, detección de onsets de batería o análisis armónico, donde la contaminación entre fuentes degrada los resultados.
- Aplicaciones web en el navegador: al ser un ONNX de 12,9 MB ejecutable con onnxruntime-web y WebGPU, permite ofrecer separación de stems en cliente sin subir el audio a un servidor, lo que simplifica el cumplimiento de privacidad.
- Herramientas de escritorio y móviles con recursos limitados: el tamaño reducido y la inferencia en float32 sobre CPU lo hacen viable en equipos sin GPU dedicada, a diferencia de modelos de separación basados en transformers de mayor tamaño.
- Docencia e investigación en separación de fuentes: al ser MIT y estar el checkpoint original disponible, sirve como línea base reproducible para comparar arquitecturas band-split + dual-path frente a alternativas, con la ventaja de que la exportación ONNX está verificada numéricamente contra la implementación de referencia.

## Benchmarks y rendimiento

Resultados de BSSEval v4 SDR (museval), mediana sobre canciones, en dB, sobre los 50 previews de test de MUSDB18:

| Modelo / variante | vocals | drums | bass | other |
|---|---|---|---|---|
| Export float32 (42,8 MB) | 9,88 | 9,43 | 8,35 | 6,15 |
| Este archivo int8 + float16 (12,9 MB) | 9,88 | 9,44 | 8,35 | 6,14 |
| Todos los pesos en int8 (12,8 MB) | no disponible | no disponible | no disponible | no disponible (pierde 2,6 dB en el caso de voz casi silenciosa) |
| Pesos float16 completos (23,2 MB) | sin cambio > 0,001 dB | sin cambio > 0,001 dB | sin cambio > 0,001 dB | sin cambio > 0,001 dB |

Cambio por canción respecto al export float32 (mediana · canción que más pierde): vocals +0,00 · −0,29; drums −0,00 · −0,04; bass −0,00 · −0,10; other −0,01 · −0,07. Contra el export, sobre los previews de calibración, la compactación presenta una diferencia máxima de 1,1e-2 respecto al máximo de |y| y un SNR de 42,4 dB.

## Requisitos de hardware

- VRAM estimada: el grafo ONNX pesa 12,9 MB en disco y la sesión lo pliega a float32 al cargar, por lo que el consumo de memoria es del orden de decenas de MB, no de GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte de onnxruntime (CUDA o WebGPU). Para inferencia en servidor, una T4 o superior es más que suficiente; en consumer, cualquier RTX o iGPU reciente con WebGPU.
- Cabe en GPU consumer: sí, en todas las generaciones recientes, y también en CPU sin GPU dedicada.
- Opciones de despliegue: onnxruntime (Python, C++, C#), onnxruntime-web con WebGPU, y el paquete `@audio/neural-separate` de audiojs (`model: 'scnet'`), que gestiona segmentación, solapamiento y fades. No se distribuye en formato GGUF ni está pensado para vLLM, llama.cpp, Ollama o TGI, que son runners de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. El coste por segmento es fijo (11 s de audio, 476 frames), pero no se publican tiempos de ejecución por backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Stems | Licencia | Formato | SDR vocals (MUSDB18) |
|---|---|---|---|---|---|
| SCNet (esta ficha) | 10,1 M | 4 | MIT | ONNX int8/float16 | 9,88 |
| Demucs v4 (htdemucs) | no disponible en la información | 4 | MIT (código y pesos publicados por Meta) | PyTorch | no disponible en la información |
| Open-Unmix (UMX) | no disponible en la información | 4 | MIT | PyTorch | no disponible en la información |
| Spleeter (Deezer) | no disponible en la información | 2 o 4 | MIT | TensorFlow | no disponible en la información |

No se han publicado en la información disponible resultados comparativos directos de SCNet frente a Demucs, Open-Unmix o Spleeter; la model card solo aporta las cifras de SCNet sobre MUSDB18 y las variantes de cuantización del propio modelo.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en separación de fuentes musicales; no genera texto, no razona y no admite instrucciones en lenguaje natural.
- El entrenamiento se realizó sobre MUSDB18-HQ, un corpus pequeño y dominado por música occidental; el rendimiento en géneros poco representados (música clásica, tradicional, electrónica experimental) puede ser inferior al reportado.
- El SDR de la fuente "other" es el más bajo (6,14 dB), por lo que los instrumentos agrupados en ese stem son los más propensos a artefactos y filtraciones.
- El caso de validación PR - Happy Daze, con voz casi en silencio, pierde 2,2 dB de SDR ya en el export float32; en pasajes con stems casi vacíos la separación puede introducir ruido audible.
- La licencia del código y de los pesos es MIT, pero el modelo se entrenó sobre MUSDB18-HQ, cuyo uso está licenciado para fines educativos; la model card señala explícitamente que ningún proyecto ha resuelto si esa restricción alcanza a los pesos derivados. Es un caveat a evaluar antes de un uso comercial.
- El grafo fija la forma de entrada a 476 frames (11 s a 44,1 kHz); el consumidor debe segmentar el audio, aplicar solapamiento y fades por su cuenta, como hace `demix()` de Music-Source-Separation-Training.
- La sesión de onnxruntime pliega los pesos a float32 al cargar, por lo que la ventaja de tamaño en disco (12,9 MB frente a 42,8 MB) no se traduce en un ahorro de memoria en tiempo de ejecución.
- No se publican datos de latencia ni de throughput por backend, lo que impide estimar el coste en tiempo real sin medirlo en el entorno objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/square-zero-labs/scnet
- Paper (arXiv): https://arxiv.org/abs/2401.13276
- Código y pesos originales: https://github.com/starrytong/SCNet
- Checkpoint y configuración: https://github.com/ZFTurbo/Music-Source-Separation-Training
- Confirmación de licencia MIT de los pesos: https://github.com/starrytong/SCNet/issues/35#issuecomment-4999873539
- Paquete de inferencia `@audio/neural-separate`: https://github.com/audiojs/neural/tree/main/packages/neural-separate
- Dataset MUSDB18-HQ (Rafii et al., 2019): no disponible en la información proporcionada
