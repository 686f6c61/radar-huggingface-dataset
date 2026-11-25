# suru8-ai/luso-mt-small

## Resumen

luso-mt-small es un modelo de traducción automática neuronal de tipo encoder-decoder desarrollado por Rexplore Research Labs (Lilongwe, Malaui) bajo licencia Apache-2.0. Traduce entre inglés y chichewa (ny) y entre inglés y tumbuka (tum), dos lenguas bantúes de Malaui con escasa representación en los sistemas de traducción convencionales. Con 87,7 millones de parámetros, está diseñado específicamente para inferencia en dispositivo (on-device), es decir, para ejecutarse en teléfonos y equipos con recursos limitados sin depender de la nube.

El modelo emplea una arquitectura Transformer encoder-decoder con la forma de T5 v1.1 (RMSNorm, gated-GELU, posiciones relativas) y una configuración asimétrica de encoder profundo (12 capas) y decoder superficial (4 capas), con un vocabulario SentencePiece de 32.000 piezas compartido entre las tres lenguas. Se entrenó desde cero mediante destilación de conocimiento a nivel de secuencia a partir de MADLAD-400 3B, ajustado sobre datos propios del autor.

Su relevancia radica en cubrir un par de lenguas de bajos recursos con un modelo pequeño, rápido en CPU y con licencia permisiva para uso comercial, algo poco habitual en este segmento. El repositorio ocupa 0,4 GB y los pesos en fp32 pesan 350,9 MB (153,5 MB con cuantización dinámica int8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder, forma T5 v1.1 (RMSNorm, gated-GELU, posiciones relativas), encoder profundo / decoder superficial |
| Parametros totales | 87.707.136 (87,7M), embeddings de entrada y salida atados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (153,5 MB); fp32 (350,9 MB) |
| Idiomas soportados | en (inglés), ny (chichewa), tum (tumbuka) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

Detalles de dimensión: d_model 512, 8 cabezas de 64 dimensiones, d_ff 2048, 12 capas de encoder y 4 de decoder. Vocabulario de 32.000 piezas SentencePiece unigram compartidas por las tres lenguas.

## Arquitectura y entrenamiento

El modelo sigue la forma de T5 v1.1 con normalización RMSNorm, activación gated-GELU y posiciones relativas, pero con una distribución asimétrica de capas: 12 en el encoder y solo 4 en el decoder. Esta elección reduce el coste computacional en decodificación manteniendo capacidad de comprensión en la codificación, lo que encaja con un escenario de inferencia en dispositivo. Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros y el tamaño del archivo.

El entrenamiento se realizó desde cero mediante destilación de conocimiento a nivel de secuencia a partir de MADLAD-400 3B, previamente ajustado sobre los datos del autor. Los datos de entrenamiento incluyen texto web malauí en chichewa (noticias, blogs, Wikipedia) con 90.441 pares traducidos al inglés mediante MT automática (Gemini 3.8 Flash, Gemma 3 27B); Wikipedia y sitios de noticias en tumbuka con unos 50.000 pares traducidos con Gemini 3.8 Flash; traducciones profesionales del corpus SMOL (Google, CC-BY-4.0); y las traducciones del profesor sobre las mismas fuentes (285.952 pares). Cada par se usa en ambas direcciones y las frases fuente generadas por máquina se etiquetan con `<bt>`. Se excluyó texto religioso con derechos de autor y sin licencia, y se eliminaron las frases de test y desarrollo, así como cualquier par de entrenamiento que compartiera una ventana de 8 palabras con ellas. El conjunto de datos no se publica.

La lengua destino se indica con una etiqueta al inicio de la entrada (`<2en>`, `<2ny>`, `<2tum>`); no es necesario especificar la lengua origen.

## Capacidades

- Traducción bidireccional inglés-chichewa (en↔ny) e inglés-tumbuka (en↔tum) en un único modelo.
- Generación de texto condicionada por etiqueta de lengua destino (`<2en>`, `<2ny>`, `<2tum>`).
- Identidad de lengua fiable: según GlotLID, el modelo escribe la lengua solicitada en el 98-100% de las salidas de test.
- Inferencia en CPU y en dispositivo: 2,96 frases/s en modo greedy y 3,11 frases/s con beam 4 en 8 vCPU (batch 1, frases de noticias); 7,28 frases/s con int8 greedy.
- Decodificación con búsqueda por haces (beam search, beam 4 en las evaluaciones).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción en aplicaciones móviles sin conexión: con 153,5 MB en int8 y 7,28 frases/s en CPU, el modelo puede integrarse en apps Android o iOS para traducir texto entre inglés y chichewa o tumbuka sin enviar datos a la nube, algo relevante en zonas con conectividad limitada.
- Atención al ciudadano en servicios públicos de Malaui: traducción de avisos, formularios y comunicaciones administrativas entre inglés y las lenguas locales, con la ventaja de que el modelo cabe en servidores modestos y no requiere GPU.
- Localización de contenidos periodísticos: traducción de noticias y artículos de blogs (el dominio principal de entrenamiento) del inglés al chichewa o al tumbuka y viceversa, aprovechando que el corpus de entrenamiento está compuesto mayoritariamente por texto periodístico y web.
- Traducción de documentación comunitaria y educativa: materiales de salud, agricultura o educación, con la advertencia de que el dominio médico y legal es más débil y requiere revisión humana.
- Integración en pipelines de traducción asistida por ordenador: como motor de primera pasada en herramientas de traducción profesional, con revisión posterior por traductores humanos, dado su bajo coste computacional y licencia Apache-2.0.
- Procesamiento por lotes en servidores sin GPU: traducción de grandes volúmenes de texto con vLLM o TGI en CPU, o con llama.cpp/Ollama si se convierte a GGUF, para tareas de enriquecimiento de corpus o análisis multilingüe.
- Investigación en lenguas de bajos recursos: como línea base reproducible y con licencia permisiva para experimentos de destilación, cuantización o adaptación a otras lenguas bantúes.

## Benchmarks y rendimiento

Resultados declarados por el autor (chrF++ / BLEU con sacreBLEU, beam 4). Los conjuntos de test son NTREX-128 (500 frases, en↔ny) y SMOL (500 frases, en↔tum). Ningún resultado está verificado de forma independiente (`verified: false`).

| Modelo | en→ny | ny→en | en→tum | tum→en |
|---|---|---|---|---|
| luso-mt-small | 47,6 / 20,1 | 46,9 / 23,6 | 35,8 / 8,2 | 30,0 / 8,8 |
| luso-mt-tiny | 46,3 / 19,1 | 45,5 / 22,0 | 34,9 / 8,1 | 29,1 / 7,9 |
| Profesor luso-mt (MADLAD-400 3B ajustado) | 49,9 / 21,9 | 53,8 / 31,4 | 37,5 / 9,7 | 34,7 / 12,7 |
| NLLB-200-distilled-600M (referencia, no comercial) | 50,0 / 20,1 | 55,2 / 34,2 | 38,2 / 13,0 | 32,7 / 12,0 |
| MADLAD-400 3B (zero-shot) | 37,8 / 11,5 | 51,3 / 30,7 | no soportado | 26,8 / 5,9 |
| OPUS-MT en-ny / ny-en / tum-en (75M cada uno) | 41,0 / 12,0 | 42,7 / 18,6 | no disponible | 24,1 / 5,4 |

Comprobación de memorización (chrF++ sobre 500 pares de entrenamiento menos dev, por dirección): 6,4 | 9,6 | 14,8 | 21,2.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (350,9 MB de pesos) y unos 200 MB en int8; cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Para mayor throughput, cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) sirve, aunque el modelo está optimizado para CPU.
- Cabe en GPU consumer: sí, en todas; también en dispositivos móviles y Raspberry Pi.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), text-generation-inference (etiqueta `text-generation-inference` en el repo), endpoints compatibles; para otros runtimes (llama.cpp, Ollama) sería necesaria una conversión a GGUF, no documentada por el autor.
- Latencia y throughput: 2,96 frases/s greedy y 3,11 frases/s con beam 4 en 8 vCPU (batch 1, frases de noticias); 7,28 frases/s con int8 greedy. No se publican datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | chrF++ en→ny | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luso-mt-small | 87,7M | en, ny, tum | 47,6 | Apache-2.0 | Hugging Face |
| luso-mt-tiny | no disponible | en, ny, tum | 46,3 | Apache-2.0 (según familia) | Hugging Face |
| NLLB-200-distilled-600M | 600M | 200 lenguas | 50,0 | CC-BY-NC-4.0 (no comercial) | Hugging Face |
| OPUS-MT en-ny / ny-en | 75M por dirección | en, ny | 41,0 | no disponible en la información | Hugging Face |
| MADLAD-400 3B | 3B | 400+ lenguas | 37,8 (zero-shot) | no disponible en la información | Hugging Face |

luso-mt-small ofrece una calidad en en→ny (47,6 chrF++) superior a OPUS-MT (41,0) y a MADLAD-400 3B zero-shot (37,8), y cercana a NLLB-200-distilled-600M (50,0), con la ventaja de una licencia Apache-2.0 plenamente comercial frente a la licencia no comercial de NLLB. En tumbuka, luso-mt-small (35,8 en→tum) queda por debajo de NLLB (38,2) y del profesor (37,5), y OPUS-MT no cubre este par.

## Limitaciones y advertencias

- Entrenado principalmente con noticias y texto web; el rendimiento en conversación, medicina y derecho es más débil y requiere revisión humana.
- La mayoría de los objetivos en inglés son traducciones automáticas, por lo que la salida en inglés puede ser literal; ny→en está 8,3 chrF++ por debajo de NLLB-200.
- El tumbuka tiene menos datos y se sobremuestrea en entrenamiento; la brecha entre entrenamiento y desarrollo es mayor, por lo que su calidad es inferior y menos uniforme que la del chichewa.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El conjunto de datos de entrenamiento no se publica, lo que dificulta la reproducibilidad.
- No se documenta la longitud máxima de contexto; las entradas largas pueden truncarse o degradar la calidad.
- Riesgo de alucinación y de traducciones literales en dominios alejados de los datos de entrenamiento (noticias y web).
- No dispone de tool calling, agentes, visión ni audio; es exclusivamente un modelo de traducción texto a texto.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones de los corpus de origen (SMOL es CC-BY-4.0) si se redistribuyen datos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suru8-ai/luso-mt-small
- Anuncio: https://rexplore.ai/blog/introducing-luso-mt
- Informe técnico: https://rexplore.ai/blog/luso-mt-technical-report
- Corpus SMOL (Google): https://huggingface.co/datasets/google/smol
- NTREX-128: https://github.com/MicrosoftTranslator/NTREX
- MADLAD-400: https://huggingface.co/google/madlad400-3b-mt
- NLLB-200: https://huggingface.co/facebook/nllb-200-distilled-600M
