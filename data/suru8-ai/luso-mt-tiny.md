# suru8-ai/luso-mt-tiny

## Resumen

luso-mt-tiny es un modelo de traducción automática encoder-decoder de tipo T5 v1.1, desarrollado por Rexplore Research Labs (Lilongwe, Malaui) bajo licencia Apache-2.0. Traduce entre inglés y chichewa (ny) y entre inglés y tumbuka (tum) en un único checkpoint de 19,9 millones de parámetros, pensado para ejecutarse íntegramente en local, sin conexión, en cualquier teléfono móvil. Forma parte de la familia luso-mt junto con luso-mt-small.

El modelo se entrenó desde cero mediante destilación de conocimiento a nivel de secuencia (sequence-level knowledge distillation) a partir de MADLAD-400 3B, afinado sobre datos propios del autor. Su relevancia radica en cubrir un par de lenguas de bajos recursos (chichewa y tumbuka, habladas en Malaui) con un modelo minúsculo (79,5 MB en fp32, 40,5 MB con cuantización int8) que alcanza velocidades de unas 8 frases por segundo en CPU de 8 vCPU, lo que lo hace viable para despliegue en dispositivos sin GPU.

La arquitectura sigue la forma T5 v1.1 con encoder profundo y decoder superficial (8 capas de encoder, 2 de decoder), vocabulario SentencePiece de 16.000 piezas compartido entre las tres lenguas y embeddings de entrada y salida atados. El contexto efectivo no está especificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer, forma T5 v1.1 (RMSNorm, gated-GELU, posiciones relativas), encoder profundo / decoder superficial |
| Parametros totales | 19.873.600 (19,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (40,5 MB); fp32 (79,5 MB) |
| Idiomas soportados | en (inglés), ny (chichewa), tum (tumbuka) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder con la forma de T5 v1.1: normalización RMSNorm, activación gated-GELU y posiciones relativas. La configuración interna es d_model 320, 5 cabezas de 64 dimensiones, d_ff 1024, 8 capas de encoder y 2 capas de decoder, con embeddings de entrada y salida atados y un vocabulario SentencePiece unigram de 16.000 piezas compartido por inglés, chichewa y tumbuka. El idioma destino se indica con una etiqueta al inicio de la entrada (`<2en>`, `<2ny>`, `<2tum>`); no es necesario indicar el idioma origen.

El entrenamiento se realizó desde cero por destilación de conocimiento a nivel de secuencia desde MADLAD-400 3B, previamente afinado sobre los datos del autor. Los datos incluyen texto web malauí en chichewa (noticias, blogs, Wikipedia; 90.441 pares con inglés generado por traducción automática con Gemini 3.8 Flash y Gemma 3 27B), Wikipedia y sitios de noticias en tumbuka (unos 50.000 pares, inglés por traducción automática con Gemini 3.8 Flash), traducciones profesionales del corpus SMOL (Google, CC-BY-4.0) y las traducciones del modelo profesor sobre las mismas fuentes (285.952). Cada par se usa en ambas direcciones, las frases origen generadas por máquina se etiquetan con `<bt>`, se excluyó texto religioso con derechos de autor y sin licencia, y se eliminaron las frases de test y desarrollo, así como cualquier par de entrenamiento que compartiera una ventana de 8 palabras con ellas. El dataset no se publica.

## Capacidades

- Traducción bidireccional inglés ↔ chichewa (ny) e inglés ↔ tumbuka (tum) en un único modelo.
- Selección del idioma destino mediante etiqueta de prefijo (`<2en>`, `<2ny>`, `<2tum>`), sin necesidad de especificar el origen.
- Generación de texto secuencia a secuencia con decodificación por haz (beam search); los ejemplos de la model card usan beam 4 y `max_new_tokens=192`.
- Ejecución totalmente offline en CPU y dispositivos móviles, con cuantización int8 dinámica.
- Identidad de lengua fiable: según GlotLID, el modelo escribe el idioma solicitado en el 98-100 % de las salidas de test.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio según la información disponible.
- Capacidad multilingüe limitada a las tres lenguas declaradas (en, ny, tum).

## Casos de uso

- Traducción offline en zonas con conectividad limitada: el modelo cabe en 40,5 MB con int8 y corre a unas 12 frases/s en CPU de 8 vCPU, por lo que puede integrarse en aplicaciones móviles de traducción para comunidades de Malaui sin depender de la nube.
- Atención sanitaria en campo: traducción de indicaciones médicas básicas entre inglés y chichewa o tumbuka en puestos de salud rurales; conviene revisar la salida porque el dominio médico es más débil según el autor.
- Traducción de noticias y contenido web: el modelo se entrenó principalmente con noticias y texto web, dominio en el que sus resultados de NTREX-128 (chrF++ 46,3 en→ny) son más representativos.
- Localización de interfaces y textos breves: integración en pipelines de CI/CD para traducir cadenas de aplicaciones al chichewa o al tumbuka, con revisión humana posterior.
- Preservación y difusión de lenguas de bajos recursos: generación de versiones bilingües de Wikipedia y materiales educativos en tumbuka, donde la oferta de herramientas es escasa.
- Prototipado e investigación en traducción de bajos recursos: modelo pequeño y de licencia permisiva que sirve como línea base reproducible para experimentos de destilación y cuantización.
- Traducción inversa ny→en o tum→en para comprensión de documentos: útil para que hablantes de inglés accedan a contenido redactado en chichewa o tumbuka, con la advertencia de que ny→en queda 9,7 chrF++ por debajo de NLLB-200.

## Benchmarks y rendimiento

Resultados declarados por el autor (chrF++ / BLEU con sacreBLEU, beam 4). No verificados de forma independiente.

| Modelo | en→ny | ny→en | en→tum | tum→en |
|---|---|---|---|---|
| luso-mt-tiny | 46,3 / 19,1 | 45,5 / 22,0 | 34,9 / 8,1 | 29,1 / 7,9 |
| luso-mt-small | 47,6 / 20,1 | 46,9 / 23,6 | 35,8 / 8,2 | 30,0 / 8,8 |
| Profesor luso-mt (MADLAD-400 3B afinado) | 49,9 / 21,9 | 53,8 / 31,4 | 37,5 / 9,7 | 34,7 / 12,7 |
| NLLB-200-distilled-600M (referencia, no comercial) | 50,0 / 20,1 | 55,2 / 34,2 | 38,2 / 13,0 | 32,7 / 12,0 |
| MADLAD-400 3B (zero-shot) | 37,8 / 11,5 | 51,3 / 30,7 | no soportado | 26,8 / 5,9 |
| OPUS-MT en-ny / ny-en / tum-en (75 M cada uno) | 41,0 / 12,0 | 42,7 / 18,6 | no disponible | 24,1 / 5,4 |

Conjuntos de test: NTREX-128 (noticias, 500 frases, en ↔ ny) y SMOL (frases cotidianas, 500 frases, en ↔ tum). Comprobación de memorización (chrF++ sobre 500 pares de entrenamiento menos dev, por dirección): 4,1 | 4,1 | 11,4 | 12,7.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (79,5 MB de pesos más activaciones); apto para CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 4090) ejecuta el modelo con latencia mínima, pero no es el escenario objetivo.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles; el autor lo describe como «built for any phone, fully offline».
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), text-generation-inference (según tags) y endpoints compatibles; no se mencionan vLLM, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: 8,32 frases/s en greedy y 8,21 con beam 4 en CPU de 8 vCPU (batch 1, frases de noticias); 11,96 frases/s con int8 greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | chrF++ en→ny | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luso-mt-tiny | 19,9 M | en, ny, tum | 46,3 | Apache-2.0 | Hugging Face |
| luso-mt-small | no disponible | en, ny, tum | 47,6 | Apache-2.0 (según familia) | Hugging Face |
| NLLB-200-distilled-600M | 600 M | 200 lenguas | 50,0 | CC-BY-NC (no comercial) | Hugging Face |
| MADLAD-400 3B | 3 B | 400+ lenguas | 37,8 (zero-shot) | no disponible | Hugging Face |
| OPUS-MT en-ny | 75 M | en, ny | 41,0 | no disponible | Hugging Face |

luso-mt-tiny ofrece un tamaño entre 3 y 30 veces menor que las alternativas, con licencia Apache-2.0 (frente a la no comercial de NLLB-200) y cobertura de tumbuka que MADLAD-400 3B zero-shot y OPUS-MT no proporcionan. Su coste es una calidad inferior en ny→en y en tumbuka respecto a NLLB-200 y al profesor.

## Limitaciones y advertencias

- Entrenado mayoritariamente con noticias y texto web; el rendimiento en conversación, medicina y derecho es más débil.
- La mayoría de los objetivos en inglés son traducciones automáticas, por lo que la salida en inglés puede ser literal; ny→en queda 9,7 chrF++ por debajo de NLLB-200.
- Tumbuka tiene menos datos y está sobremuestreado en el entrenamiento; la brecha entre entrenamiento y desarrollo es mayor, y su calidad es inferior y menos uniforme que la del chichewa.
- Riesgo de alucinación y de traducciones inexactas en dominios no representados; se recomienda revisión humana en usos críticos.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Longitud de contexto no documentada; `max_new_tokens=192` en los ejemplos sugiere entradas y salidas cortas.
- Licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento no se publica, lo que limita la reproducibilidad.
- Solo cubre en, ny y tum; no debe esperarse calidad en otras lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suru8-ai/luso-mt-tiny
- Anuncio: https://rexplore.ai/blog/introducing-luso-mt
- Informe técnico: https://rexplore.ai/blog/luso-mt-technical-report
- Dataset SMOL: https://huggingface.co/datasets/google/smol
- NTREX-128: https://github.com/MicrosoftTranslator/NTREX
