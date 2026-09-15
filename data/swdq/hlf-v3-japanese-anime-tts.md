# swdq/HLF-v3-Japanese-Anime-TTS

## Resumen

HLF v3 (Japanese Anime Long-form TTS) es un proyecto de investigación de síntesis de voz en japonés orientado a generar locuciones de estilo anime de unos cinco minutos manteniendo la identidad de un mismo personaje. Lo desarrolla el usuario swdq y su objetivo declarado es reducir la omisión y la repetición de texto y preservar la calidad de voz a lo largo de secuencias largas, sin sustituir el texto original por fonemas. El repositorio se publicó el 15 de septiembre de 2026 y, en el momento de la instantánea, no contiene pesos, código de ejecución, datos de entrenamiento ni muestras de audio: es un repositorio documental.

La arquitectura combina una Joint DiT de 6 capas que procesa en paralelo las secuencias de texto y audio mediante atención conjunta, y una Audio DiT de 24 capas que refina la secuencia de audio. El modelo generativo tiene 686.771.586 parámetros entrenables (sin contar el encoder de texto y el VAE de audio, que están congelados) y se entrena con rectified flow / flow matching. La salida es una onda mono a 48.000 Hz, producida a partir de latentes acústicos de 128 dimensiones y 25 Hz.

Es relevante ahora como experimento de arquitectura DiT aplicada a TTS de formato largo, pero conviene subrayar que en la instantánea publicada el propio autor no reclama calidad de TTS natural: en el paso 297 el error de carácter medido por ASR era del 92,68 % para texto corto y del 95,25 % para un guion de 300 segundos. El modelo no está listo para uso práctico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Joint DiT (6 capas) + Audio DiT (24 capas); flow matching / rectified flow; encoder de texto ModernBERT congelado y VAE de audio congelado |
| Parámetros totales | 686.771.586 parámetros entrenables en el modelo generativo (excluye encoder de texto y VAE de audio congelados) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens; secuencias latentes de audio de hasta 7.500 frames (25 Hz) para ~300 s |
| Tipos de cuantización | no disponible (no se publican pesos) |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio solo README; no se publican pesos) |

Datos adicionales de la implementación: dimensión oculta de 1.024 y 16 cabezas de atención; inicialización aleatoria con AdaLN-Zero; representación acústica mediante Semantic-DACVAE-Japanese (128 dimensiones, 25 Hz); decodificación a 48.000 Hz con hop de 1.920 muestras y salida mono; condicionamiento por 12 identificadores de hablante aprendidos.

## Arquitectura y entrenamiento

La Joint DiT mantiene dos rutas de actualización separadas, una para texto y otra para audio, y las procesa conjuntamente con atención bidireccional de alcance global. La Audio DiT refina después la secuencia de audio. Ambas redes se entrenan de forma conjunta dentro de una sola red, y los latentes acústicos no se reducen en la dimensión temporal. Cada bloque Joint y Audio recibe condicionamiento de identificador de hablante y de tiempo de flow. Un predictor de longitud total estima la duración del audio, y el modelo incorpora además una cabeza de pérdida auxiliar de alineamiento.

El condicionamiento de texto se compone del texto japonés procesado por un ModernBERT congelado procedente de Irodori-TTS-v4.1-Small, más tokens auxiliares de fonemas y de acento (información a1/f1), sin reemplazar el texto original. La pérdida principal es el MSE de la velocidad de flow sobre todos los frames de audio; se añaden una pérdida auxiliar de posición de la locución de origen (coeficiente 0,05 y ponderación temporal t²) y una pérdida de longitud total como Gaussian NLL sobre el logaritmo del número de frames (coeficiente 0,1). El modelo se inicializa de forma aleatoria y no carga pesos de generación de audio de Irodori, por lo que no es un entrenamiento totalmente desde cero (usa encoder y VAE preentrenados).

Los datos de entrenamiento proceden de pares (diálogo, audio) de un mismo hablante, concatenados en el mismo orden hasta unos cinco minutos. El conjunto de train tiene 11.142 locuciones de origen que dan 274 ejemplos concatenados (unas 22,79 horas, con rango de 280,04 a 342,08 s y mediana de 298,70 s) y 12 hablantes; el conjunto de validación tiene 230 locuciones de origen que dan 12 ejemplos (unas 0,47 horas, con rango de 21,68 a 336,32 s). No hay solapamiento de claves de locución entre train y val, y 70 locuciones de train sin complemento fonético se mantienen con su texto y audio. El entrenamiento se ejecutó en una NVIDIA GB10 con microbatch 1, acumulación de gradiente 2, AdamW (betas 0,9 y 0,95, weight decay 0,01), learning rate base de 1e-4 con 100 actualizaciones de warmup y decaimiento coseno, autocast en bf16 con parámetros y estado del optimizador en FP32, activation checkpointing, recorte de norma de gradiente a 1,0 y EMA. Se planificaron 1.000 actualizaciones del optimizador, con validación cada 100 y guardado cada 50.

## Capacidades

- Generación de voz (TTS) en japonés a partir de texto, con salida de onda mono a 48.000 Hz.
- Generación de formato largo: la implementación está diseñada para producir secuencias de audio de aproximadamente cinco minutos (hasta 7.500 frames latentes a 25 Hz) sin acortar la dimensión temporal.
- Predicción automática de la longitud total del audio, además de la opción de longitud especificada por el usuario en modo diagnóstico.
- Condicionamiento de hablante mediante 12 identificadores aprendidos (no es zero-shot: no acepta audio de referencia para clonar una voz).
- Entrada de texto con información auxiliar de lectura y acento (fonemas y datos a1/f1) manteniendo el texto original, en lugar de sustituirlo por fonemas.
- Tratamiento de eventos no verbales (respiraciones, risas, suspiros) como parte de la señal de audio, si bien el autor indica que su control explícito no está verificado.
- Soporte de tool calling / function calling: no aplica (modelo de voz).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no; solo japonés.
- Capacidad especial de "modo pensamiento", visión o audio multimodal: no disponible.

En la instantánea publicada (paso 297, EMA, 40 pasos de flow) el modelo producía audio, pero con un error de carácter medido por ASR muy elevado (92,68 % y 95,25 %), por lo que las capacidades anteriores deben considerarse objetivos de diseño y no funciones verificadas de calidad.

## Casos de uso

Los siguientes escenarios corresponden a la finalidad para la que se está construyendo el modelo, no a funciones validadas en la instantánea publicada:

- Investigación en TTS de formato largo: reproducir el experimento para estudiar si una Joint DiT más Audio DiT con flow matching mantiene la identidad de voz y evita omisiones a lo largo de secuencias de cinco minutos, usando la misma configuración de entrenamiento (NVIDIA GB10, microbatch 1, acumulación 2) o una superior.
- Estudio de alineamiento texto-audio: aprovechar la pérdida auxiliar de posición de locución (coeficiente 0,05) y la cabeza de longitud total (Gaussian NLL, coeficiente 0,1) para analizar cómo se alinean las secuencias de texto y audio de longitudes distintas sin usar CTC ni expansión por duración de fonemas.
- Evaluación de representaciones acústicas: comparar el VAE de 128 dimensiones y 25 Hz usado aquí (Semantic-DACVAE-Japanese) frente a alternativas de 32 dimensiones en términos de calidad de reconstrucción y facilidad de generación, tal como plantea el autor entre sus trabajos futuros.
- Investigación sobre condicionamiento de hablante: estudiar la sustitución de los 12 embeddings de hablante aprendidos por condicionamiento zero-shot a partir de audio de referencia, que en esta versión no está implementado.
- Análisis de prosodia y acento japonés: usar los tokens auxiliares de acento a1/f1 para evaluar si mejorar la información de lectura y acento reduce la falta de coincidencia con el texto original, dado el elevado error de carácter observado.
- Generación de guiones de voz para prototipos de doblaje anime: emplear la salida de formato largo para pruebas internas de doblaje, siempre que se asuma que el estado actual no alcanza calidad natural y que no se publican pesos ni código.
- Reproducción y comparación de pérdidas: replicar las curvas de validación (Flow MSE) reportadas para estudiar la convergencia del entrenamiento en las primeras 300 actualizaciones y comparar con otras arquitecturas DiT.

## Benchmarks y rendimiento

Pérdida de validación (Flow MSE) con audio de referencia, según la instantánea del 15 de septiembre de 2026:

| Actualizaciones | Ejemplos de val | Flow MSE |
|---:|---:|---:|
| 100 | 12 | 1,9269 |
| 200 | 12 | 1,9193 |
| 300 | 12 | 1,8048 |

Generación desde la EMA en el paso 297 (ASR con Whisper large-v3-turbo, normalización NFKC y eliminación de puntuación):

| Diagnóstico | Longitud de salida | Frecuencia de muestreo | Error de carácter (ASR) |
|---|---:|---:|---:|
| Texto corto nuevo, longitud total predicha por el modelo | 8,36 s | 48 kHz | 92,68 % |
| Guion nuevo de 50 locuciones, 300 s especificados | 300 s | 48 kHz | 95,25 % |

El propio autor advierte que la pérdida de validación no mide directamente la naturalidad ni el seguimiento del texto original en generación libre, y que el error de ASR puede incluir fallos de reconocimiento propios del sistema ASR, aunque en este estado señala una discrepancia grande con el texto original. No se han publicado comparaciones con otros sistemas TTS en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado: NVIDIA GB10, microbatch 1, acumulación de gradiente 2 (unos cinco minutos de audio por actualización), autocast en bf16, parámetros y estado del optimizador en FP32, activation checkpointing, EMA y 1.000 actualizaciones previstas.
- VRAM estimada para inferencia: no disponible. No se publican pesos y la model card marca `inference: false`. Como referencia aritmética, un modelo generativo de 686,77 M de parámetros en FP32 ocuparía en torno a 2,7 GB solo en pesos, y en bf16 alrededor de 1,4 GB, más el encoder ModernBERT y el decodificador VAE congelados y las activaciones de secuencias completas de 7.500 frames; no se dispone de una medición real.
- GPU recomendadas: no disponible. El único hardware documentado es la NVIDIA GB10 empleada en el entrenamiento.
- ¿Cabe en GPU de consumo? No disponible; no puede confirmarse sin pesos publicados ni pruebas de despliegue.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.): no disponible. No se publica código de ejecución, pesos ni integración con ningún runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / formato | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HLF v3 (este modelo) | 686,77 M entrenables en el modelo generativo | Secuencias latentes de hasta 7.500 frames (~300 s) | Flow MSE de val 1,8048 en el paso 300; error de carácter ASR del 92,68-95,25 % en el paso 297 | no disponible | Solo README; sin pesos, código ni datos |
| Irodori-TTS (Aratako) | no disponible | TTS japonés condicionado basado en flow | no disponible | no disponible | Repositorio de referencia citado por el autor; no se aportan datos comparativos |
| Irodori-TTS-v4.1-Small (Aratako) | no disponible | Fuente del encoder ModernBERT congelado | no disponible | no disponible | Modelo citado; no se aportan datos comparativos |
| F5-TTS | no disponible | DiT con flow matching | no disponible | no disponible | Paper citado (arXiv:2410.06885) |
| M3-TTS | no disponible | Atención conjunta para secuencias de texto y audio de distinta longitud | no disponible | no disponible | Paper citado (arXiv:2512.04720) |

No se dispone de datos de parámetros, contexto, rendimiento o licencia de los modelos comparables en la información proporcionada; la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Repositorio de solo documentación: no incluye pesos, código de ejecución, datos de entrenamiento ni archivos de audio, por lo que el modelo no puede ejecutarse tal cual.
- Calidad no demostrada: el propio autor indica que no ha confirmado una calidad que lea los diálogos de forma natural ni superioridad frente a métodos existentes.
- Error de carácter ASR muy alto (92,68 % en texto corto y 95,25 % en 300 s), con discrepancia grande respecto al texto original.
- Entrenamiento incipiente: la instantánea pública corresponde a 300 actualizaciones de validación y una generación en el paso 297, con 1.000 actualizaciones planificadas.
- La pérdida de validación (Flow MSE) no mide la naturalidad ni el seguimiento del texto en generación libre.
- Sin condicionamiento zero-shot de hablante: solo existen 12 identificadores de hablante aprendidos; no se puede clonar una voz de referencia.
- Sin control explícito de eventos no verbales (respiraciones, risas, suspiros), aunque formen parte de la señal de audio entrenada.
- Volumen de datos reducido para la tarea: unas 22,79 horas en train y 0,47 horas en val; de las 12 muestras de val, solo tres tienen entre 4 y 6 minutos, insuficientes para juzgar el rendimiento en formato largo.
- Monolingüe: solo japonés; no hay soporte de otros idiomas.
- Licencia no especificada: se desconoce si se permite el uso comercial y bajo qué condiciones.
- No hay resultados comparativos con TTS existentes ni evaluación de acento, omisiones, repeticiones, consistencia de timbre o naturalidad interpretativa.
- Uso de encoder de texto y VAE preentrenados: el experimento no parte de cero en todos sus componentes, algo que el autor explicita.
- El repositorio declara `inference: false`; no está previsto el uso directo con la librería de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swdq/HLF-v3-Japanese-Anime-TTS
- Seguimiento en Weights & Biases (curvas de entrenamiento, audio generado periódicamente y diagnóstico ASR inicial): https://wandb.ai/a0xdlkgjei3v/anime-longform-tts/runs/hlfv3-128-20260915
- Irodori-TTS (implementación de referencia de TTS japonés condicionado por flow): https://github.com/Aratako/Irodori-TTS
- Irodori-TTS-v4.1-Small (origen del encoder de texto congelado): https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Semantic-DACVAE-Japanese (VAE acústico de 128 dimensiones): https://huggingface.co/Aratako/Semantic-DACVAE-Japanese
- Respair (referencia de voz y evaluación de hablantes): https://huggingface.co/Respair
- Tsukasa Speech: https://huggingface.co/Respair/Tsukasa_Speech
- RyuseiNet: https://huggingface.co/Respair/RyuseiNet
- F5-TTS (DiT y flow matching, arXiv:2410.06885): https://arxiv.org/abs/2410.06885
- M3-TTS (atención conjunta para secuencias de texto y audio de distinta longitud, arXiv:2512.04720): https://arxiv.org/abs/2512.04720
- DiT, Scalable Diffusion Models with Transformers (arXiv:2212.09748): https://arxiv.org/abs/2212.09748
