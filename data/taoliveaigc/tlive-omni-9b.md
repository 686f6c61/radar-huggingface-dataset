# TaoLiveAIGC/TLive-Omni-9B

## Resumen

TLive-Omni-9B es un modelo omni-modal de comprensión diseñado específicamente para el análisis de retransmisiones de comercio electrónico en directo (live-stream). Desarrollado por TaoLiveAIGC, integra entradas de imagen, vídeo, audio y texto en una interfaz unificada de salida de texto. Se construye sobre un backbone Qwen3.5 al que se le injerta un codificador de audio AuT mediante un alineador MLP ligero, y admite hasta 256.000 tokens de contexto. El entrenamiento sigue un recetario de tres etapas de ajuste supervisado (SFT) seguido de un refinamiento por refuerzo denominado Faithful-RFT, orientado a respuestas fieles y en tiempo real para tareas de live-commerce.

El modelo se publica en dos variantes, 4B y 9B, siendo esta ficha la correspondiente a la versión de 9B (10.060 millones de parámetros reales). Su relevancia radica en abordar un dominio vertical con requisitos temporales y multimodales exigentes: los hechos del producto se distribuyen entre el habla, los fotogramas de vídeo, las imágenes de producto, el texto superpuesto y las consultas de los usuarios. La organización de los tokens de audio y vídeo en una cuadrícula temporal con límites explícitos permite un alineamiento fino entre modalidades a lo largo de flujos largos. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.5 + codificador de audio AuT + alineador MLP |
| Parametros totales | 10.060.364.400 (aprox. 10B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TLive-Omni-9B parte de un backbone Qwen3.5 y lo extiende con un codificador de audio AuT conectado mediante un alineador MLP ligero, formando un modelo omni-modal con salida de texto unificada. Para entradas de vídeo con audio, cada cuadrícula temporal se organiza intercalando bloques de tokens de vídeo y audio, de modo que los segmentos de audio quedan adyacentes a su contenido visual correspondiente. Esta disposición, denominada "Timestamped Per-vGrid", facilita el alineamiento temporal fino en flujos largos y ruidosos.

El entrenamiento sigue un recetario de tres etapas de SFT progresivo: desde el alineamiento audio-lenguaje hasta el SFT multimodal completo, desarrollando la comprensión del live-commerce desde la percepción omni-modal hasta la generación de respuestas que siguen instrucciones. Posteriormente se aplica Faithful-RFT, una etapa de refinamiento por refuerzo que suprime los rastros de razonamiento explícitos y optimiza directamente la calidad de las respuestas para tareas de live-commerce, priorizando la fidelidad y la inmediatez. El modelo admite hasta 256.000 tokens de contexto en inferencia.

## Capacidades

- Comprensión omni-modal: procesa simultáneamente imagen, vídeo, audio y texto, mapeando todas las modalidades a una salida de texto unificada.
- Reconocimiento de voz en contexto de live-commerce (ASR) con baja tasa de error de caracteres (CER 6,46 en el benchmark propio).
- ASR con atribución de hablante (Speaker-Attributed ASR), identificando quién habla en cada segmento (cpWER 12,27).
- Análisis de hablante: análisis de características del hablante a partir del audio.
- Grounding visual de productos: localización de productos en imágenes o vídeo a partir de descripciones.
- Reconocimiento de texto en imágenes (OCR) y texto superpuesto en vídeo.
- Grounding temporal: localización de eventos o menciones en la línea temporal del stream.
- Descripción densa de vídeo: generación de narraciones detalladas de contenido visual.
- Preguntas y respuestas omni-modales: responder consultas que combinan varias modalidades.
- Generación de texto y razonamiento sobre contenido multimodal, con soporte para instrucciones complejas.

## Casos de uso

- Moderación y resumen automático de retransmisiones en directo: el modelo puede procesar un stream completo de varias horas, transcribir el audio, identificar a los hablantes y generar un resumen estructurado de los productos mencionados, sus precios y promociones, gracias a su contexto de 256K tokens y su alineamiento temporal.
- Asistente de ventas en tiempo real: durante un directo, el modelo responde a preguntas de los espectadores sobre productos visibles en pantalla, combinando la información visual del producto con el discurso del presentador y el texto superpuesto.
- Análisis de sentimiento y engagement: a partir del audio y el vídeo, el modelo puede evaluar el tono de la conversación, detectar menciones de marca y medir la reacción del público, ayudando a los equipos de marketing a ajustar la estrategia en vivo.
- Generación de fichas de producto automáticas: tras un directo, el modelo extrae de forma estructurada las características, precios y argumentos de venta de cada producto presentado, generando descripciones listas para catálogos online.
- Control de calidad y cumplimiento: el modelo puede detectar afirmaciones engañosas, promesas excesivas o información incorrecta sobre los productos durante la retransmisión, alertando a los supervisores en tiempo real.
- Búsqueda semántica en archivos de vídeo: indexar streams históricos con descripciones densas y grounding temporal permite a los equipos de comercio electrónico buscar momentos concretos (por ejemplo, "cuando se mostró el descuento del 20%") mediante consultas en lenguaje natural.
- Subtitulación y accesibilidad: generar subtítulos sincronizados con atribución de hablante para retransmisiones en directo o grabadas, mejorando la accesibilidad para personas con discapacidad auditiva.

## Benchmarks y rendimiento

La model card publica resultados en tareas de live-commerce y benchmarks generales, aunque la información disponible en esta ficha es parcial. Los datos extraídos de la tabla de evaluación de live-commerce son los siguientes:

| Tarea | Metrica | TLive-Omni 9B | Qwen3.5-Omni Flash | Qwen2.5-Omni 7B | Qwen3-Omni 30B-A3B | MiniCPM-o 2.6 8B | MiniCPM-o 4.5 9B |
|---|---|---|---|---|---|---|---|
| Live-Commerce ASR | CER ↓ | **6,46** | 6,81 | 7,86 | 6,75 | 13,88 | 10,70 |
| Speaker-Attributed ASR | cpWER ↓ | **12,27** | 13,23 | — | 27,84 | — | 18,89 |

Los valores en negrita indican el mejor resultado entre los modelos open-source comparados. El modelo también se evalúa frente a Gemini 2.5/3/3.5, OmniVinci 9B, Nemotron 3 Nano Omni 30B-A3B y Ming-Lite-Omni v1.5 20B-A3B, pero los datos completos de esas comparaciones no están disponibles en la información proporcionada. Para el resto de tareas (imagen, vídeo y benchmarks generales), se remite a la model card y al informe técnico en arxiv.

## Requisitos de hardware

- El repositorio pesa 20,1 GB en safetensors, lo que sugiere que la inferencia en precisión FP16 requiere aproximadamente 20 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV.
- Con cuantización a 8 bits, la VRAM necesaria se reduce a unos 10-12 GB; con 4 bits, a unos 6-8 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3090/4090 (24 GB) o incluso RTX 4060 Ti (16 GB) en cuantización agresiva.
- Para el contexto completo de 256K tokens, la caché KV puede consumir decenas de GB adicionales, por lo que en la práctica se recomienda reducir la longitud de contexto o usar GPUs de datacenter (A100 80GB, H100) para despliegues de producción con ventanas largas.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, TGI y llama.cpp (si se convierte a GGUF). El repositorio de GitHub incluye documentación específica para vLLM.
- No se dispone de datos de latencia o throughput publicados en la información proporcionada.

## Comparativa con modelos similares

La model card compara TLive-Omni-9B con varios modelos omni-modales de tamaño similar o superior. A partir de los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| TLive-Omni-9B | 10B | 256K | Apache 2.0 | Omni-modal para live-commerce |
| Qwen2.5-Omni 7B | 7B | no disponible | Apache 2.0 | Omni-modal general |
| Qwen3-Omni 30B-A3B | 30B (MoE, 3B activos) | no disponible | Apache 2.0 | Omni-modal general |
| MiniCPM-o 2.6 8B | 8B | no disponible | no disponible | Omni-modal general |
| MiniCPM-o 4.5 9B | 9B | no disponible | no disponible | Omni-modal general |

En las dos tareas de audio mostradas, TLive-Omni-9B supera a todos los modelos open-source comparados, incluyendo a Qwen3-Omni 30B-A3B, que tiene el triple de parámetros totales. No se dispone de datos completos de comparación en tareas de imagen y vídeo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en el dominio de live-commerce; su rendimiento en tareas generales fuera de este ámbito puede ser inferior al de modelos omni-modales de propósito general, aunque la model card afirma "excelente generalización" en benchmarks generales sin aportar cifras concretas en la información disponible.
- No se especifican los idiomas soportados; es probable que el entrenamiento se haya centrado en chino e inglés, dado el origen del equipo y el dominio de aplicación, pero esto no está confirmado.
- La información sobre cuantizaciones, formatos de pesos distintos a safetensors y requisitos de hardware no está publicada; los valores de VRAM indicados en esta ficha son estimaciones orientativas basadas en el tamaño del repositorio.
- El modelo puede alucinar detalles sobre productos o precios si la información no está presente en el stream; Faithful-RFT mitiga parcialmente este riesgo, pero no lo elimina.
- El contexto de 256K tokens es una capacidad teórica; en la práctica, el coste computacional de la caché KV puede hacer inviable su uso completo en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye con código personalizado (custom-code), por lo que es necesario revisar los términos específicos de los archivos de código incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TaoLiveAIGC/TLive-Omni-9B
- Repositorio GitHub: https://github.com/TaoLiveAIGC/TLive-Omni
- Informe técnico (arXiv): https://arxiv.org/abs/2608.20958
- Página del paper en Hugging Face: https://huggingface.co/papers/2608.20958
- Perfil de la organización TaoLiveAIGC: https://huggingface.co/TaoLiveAIGC
- Documentación de vLLM en el repositorio: https://github.com/TaoLiveAIGC/TLive-Omni/tree/main/vllm/docs/models
