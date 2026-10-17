# trinhrepo/granite-embedding-97m-multilingual-r2-GGUF

## Resumen

Este repositorio contiene una conversión a GGUF del modelo de embeddings granite-embedding-97m-multilingual-r2 de IBM, publicada por el usuario trinhrepo bajo licencia Apache-2.0. No es una release oficial de IBM: los pesos safetensors originales (revisión 835ad14087e140460703cf0fae09f97d469d65c2) se convierten con `convert_hf_to_gguf.py --outtype q8_0` de llama.cpp b11669 y se empaquetan en un único fichero GGUF cuantizado en Q8_0 de 115.061.216 bytes, sin modificar pesos ni tokenizador.

Es un encoder de 97.441.152 parámetros que produce vectores de 384 dimensiones con pooling CLS, orientado a similitud semántica y búsqueda por significado, no a generar texto. Su interés práctico está en la relación tamaño/coste: se ejecuta en CPU, cubre 52 idiomas y sirve como pieza de recuperación en pipelines RAG o como memoria semántica de asistentes. El autor lo empaqueta precisamente para Mimini, un asistente de escritorio que localiza mensajes anteriores de la conversación por significado.

La verificación publicada es concreta: sobre 50 textos en inglés y vietnamita (de preguntas cortas a pasajes de 3.600 caracteres), el coseno frente al modelo de IBM ejecutado en transformers en float32 es de 0,99968 o superior, con 0,99988 de media, y los ids de token coinciden en los 50 casos. Además, los 74 tensores son idénticos byte a byte al fichero Q8_0 previo de mykor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder; las claves de metadatos del GGUF usan el prefijo `modern-bert` (pooling y activación). Detalle completo en la model card de IBM, no disponible en esta información |
| Parámetros totales | 97.441.152 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como máximo del modelo. El ejemplo documentado usa `-c 2048 -b 2048 -ub 2048`, y cada texto debe caber en un solo batch de 2.048 tokens |
| Tipos de cuantización | Q8_0 (único fichero publicado en el repositorio) |
| Idiomas soportados | 52: ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF Q8_0 (origen: safetensors) |
| Dimensiones del embedding | 384 |
| Pooling y activación | CLS pooling con activación SiLU, configurados en el propio fichero |
| Prefijos de consulta/documento | Ninguno (el modelo no los usa) |
| Normalización | L2, según la configuración de sentence-transformers del modelo original |
| Tamaño del fichero | 115.061.216 bytes (0,1 GB de repositorio) |
| SHA-256 del GGUF | `e52ab606180146f095056592b2ca16c1c1b48dbd8d80a41f27dca9480f121010` |

## Arquitectura y entrenamiento

El modelo base es un encoder de IBM para `feature-extraction` y `sentence-similarity`, con 97,4 millones de parámetros y salida de 384 dimensiones normalizada en L2. Las claves escritas por llama.cpp b11669 en el GGUF (`modern-bert.classifier.activation` y `modern-bert.classifier.pooling_type`) apuntan a una topología tipo ModernBERT, aunque los detalles de capas, cabezas y atención no se recogen en la información disponible. Tampoco se documentan aquí el número de tokens de entrenamiento, la composición del corpus ni si hubo ajuste con RLHF/DPO: todo ello remite a la model card de IBM.

Lo que sí está documentado es la cadena de conversión, que es reproducible: se descargan los ficheros de IBM en la revisión indicada, se verifica la firma Sigstore del release (identidad `Granite-sign@ibm.com`, emitida por `https://sigstore.verify.ibm.com/oauth2`) y se comprueba que cada fichero coincide con el SHA-256 de la lista firmada. Después se convierte con llama.cpp b11669 y las versiones de Python que esa build fija, y se valida el hash del resultado. El script `scripts/convert-embedder.sh` automatiza todo el proceso y requiere macOS sobre Apple Silicon o Linux, `curl` y Python 3.10 o superior; descarga unos 220 MB de modelo y 750 MB de paquetes Python en `.llama-build/` y `.embedder-build/`.

## Capacidades

- Generación de embeddings de frases y pasajes: una entrada de texto, un vector de 384 dimensiones normalizado en L2, listo para comparar con similitud coseno.
- Búsqueda semántica y recuperación densa en 52 idiomas, incluidos cruces entre idiomas distintos gracias a un espacio vectorial compartido.
- Memoria conversacional por significado: es el uso real que le da Mimini, recuperando mensajes previos del historial por proximidad semántica y no por coincidencia léxica.
- Extracción de características (`feature-extraction`) para clasificación, clustering y deduplicación sobre representaciones vectoriales.
- Funciona sin prefijos de consulta ni de documento, a diferencia de otros embedders que exigen `query:` y `passage:`; el tokenizador de IBM va incluido en el fichero.
- Ejecución en CPU: la configuración de referencia de Mimini es `--embeddings --device none --no-repack -c 2048 -b 2048 -ub 2048 --parallel 1`.
- No genera texto, no razona, no escribe código y no soporta tool calling ni function calling: es exclusivamente un encoder de representaciones.

## Casos de uso

- Memoria de un asistente de escritorio: indexar los turnos de una conversación con este modelo y recuperar los mensajes relevantes por coseno antes de pasarlos al LLM generador; es exactamente el escenario para el que el autor publicó el fichero, con 384 dimensiones que mantienen el índice pequeño y la inferencia en CPU.
- RAG sobre documentación interna multilingüe: trocear manuales y artículos en pasajes de hasta 2.048 tokens, embeberlos con este GGUF y almacenar los vectores; la cobertura de 52 idiomas permite que la consulta en castellano recupere pasajes en inglés o alemán sin traducción previa.
- Deduplicación y near-duplicate detection de tickets o formularios: embeber cada registro y agrupar por umbral de similitud coseno, con un coste por registro muy bajo gracias a los 97,4 M de parámetros y Q8_0.
- Clasificación y enrutado sin entrenamiento: calcular centroides por categoría de soporte (facturación, incidencias, altas) y asignar cada consulta al centroide más cercano, útil como primera capa antes de un modelo mayor.
- Búsqueda híbrida en catálogos de producto: combinar BM25 sobre texto y similitud vectorial con este modelo; su naturaleza multilingüe evita mantener índices separados por idioma en tiendas con catálogo en varias lenguas.
- Detección de similitud en moderación o compliance: comparar comunicaciones entrantes contra una lista de patrones ya conocidos por coseno, con un pipeline totalmente local y sin dependencia de APIs externas.
- Segmentación temática de corpus de investigación: embeber abstracts o párrafos, reducir dimensionalidad y aplicar clustering para descubrir ejes temáticos en colecciones en varios idiomas.
- Filtrado previo (bi-encoder) en un pipeline de reranking: usar los 384 dims para descartar candidatos a bajo coste antes de un cross-encoder más caro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MTEB, MIRACL u otros) en la información disponible. Los únicos datos cuantitativos aportados son las comprobaciones de fidelidad de la conversión:

| Comprobación | Conjunto de prueba | Resultado |
|---|---|---|
| Coseno frente al modelo de IBM en transformers (float32, CLS + L2) | 50 textos en inglés y vietnamita, de preguntas cortas a pasajes de 3.600 caracteres | Mínimo 0,99968; media 0,99988 |
| Coincidencia de ids de token | Los 50 textos anteriores | Idénticos en 50 de 50 |
| Igualdad de pesos con el Q8_0 de mykor | Los 74 tensores del fichero | Idénticos byte a byte en 74 de 74 |
| Metadatos frente al Q8_0 de mykor | Claves del GGUF | Difieren dos claves: `modern-bert.classifier.activation` y `modern-bert.classifier.pooling_type` |

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero Q8_0 ocupa 115.061.216 bytes (unos 0,11 GB); con contexto y batch de 2.048 tokens el consumo total se mantiene holgadamente por debajo de 1 GB, aunque no se publica una medición exacta de memoria pico.
- CPU: es el modo documentado y probado por el autor (`--device none`), viable en portátiles convencionales.
- GPU: cualquier GPU con al menos 1 GB libre es sobredimensionada para el modelo; A100, H100 o RTX 4090 no aportan ventaja relevante por capacidad y solo tendrían sentido para paralelizar grandes volúmenes. No se publican cifras de rendimiento por GPU.
- Cabe en GPU de consumo: sí, en cualquier modelo con más de 1 GB de memoria, incluidos integrados y Apple Silicon.
- Opciones de despliegue: `llama-server -m ... --embeddings -c 2048 -b 2048 -ub 2048` con llama.cpp build b11669, que es la ruta documentada y validada. El repositorio lleva la etiqueta `endpoints_compatible`. No se confirma en la información disponible el soporte en vLLM, TGI, Ollama u otros runtimes.
- Restricción operativa: cada texto debe caber en un único batch (`-ub`, 2.048 en la configuración de ejemplo); con el valor por defecto de 512, `llama-server` rechaza textos más largos.
- Latencia y throughput: no disponibles. La model card no publica tiempos por lote ni vectores por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| trinhrepo/granite-embedding-97m-multilingual-r2-GGUF (este) | 97.441.152 | 384 | No disponible; 2.048 tokens por batch en el ejemplo | GGUF Q8_0 | Apache-2.0 | Conversión verificada con Sigstore y reproducible; coseno ≥ 0,99968 frente al original |
| ibm-granite/granite-embedding-97m-multilingual-r2 (original) | 97,4 M | 384 | No disponible | safetensors | Apache-2.0 | Release oficial de IBM, firmado; requiere transformers y stack PyTorch |
| mykor/granite-embedding-97m-multilingual-r2-GGUF | 97,4 M | 384 | No disponible | GGUF Q8_0 | Apache-2.0 | 74 tensores idénticos byte a byte a este fichero |
| Otras familias de embeddings multilingües pequeñas | No disponible | No disponible | No disponible | No disponible | No disponible | La información proporcionada no incluye comparativas con otras familias |

## Limitaciones y advertencias

- No apto para generación: no produce texto, código ni respuestas; cualquier uso conversacional exige emparejarlo con un modelo generativo.
- Límite de longitud por batch: textos que excedan el tamaño de batch configurado se rechazan en `llama-server`. Con `-ub 512` (valor por defecto) los textos largos fallan, de ahí el `-ub 2048` del ejemplo.
- Un solo formato y una sola cuantización: únicamente Q8_0 en GGUF. No hay variantes Q4 o F16 en este repositorio para escenarios con menos memoria o más fidelidad.
- Fidelidad medida solo en dos idiomas: la verificación frente al original cubre 50 textos en inglés y vietnamita; no se aportan pruebas en los otros 50 idiomas declarados.
- No es un release oficial de IBM: el mantenimiento, la trazabilidad y las actualizaciones dependen de un único publicador. La cadena de verificación (Sigstore más SHA-256) reduce el riesgo de manipulación, pero no lo elimina si el binario de llama.cpp o las dependencias cambian.
- Sesgos del corpus de entrenamiento original no documentados en esta información; hay que remitirse a la model card de IBM antes de desplegar en dominios sensibles.
- Calidad de recuperación sin cifras: no hay evaluación de recall en MTEB ni en dominios concretos, por lo que el umbral de similitud debe calibrarse con datos propios.
- Dimensionalidad contenida: 384 dimensiones abaratan el índice, pero ofrecen menos capacidad de representación que modelos de 768 o 1.024 dimensiones; conviene validar la pérdida frente a un embedder mayor en tareas de recuperación fina.
- Licencia Apache-2.0: permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y el fichero `LICENSE`.
- Compatibilidad de runtimes no verificada fuera de llama.cpp: usar Ollama, vLLM o TGI requeriría confirmar antes el soporte de la arquitectura y del pooling CLS.
- Requisito de plataforma para reproducir la conversión: macOS sobre Apple Silicon o Linux; llama.cpp b11669 fija torch 2.11, sin build para Intel Mac.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trinhrepo/granite-embedding-97m-multilingual-r2-GGUF
- Model card y pesos originales de IBM: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Revisión exacta usada en la conversión: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2/tree/835ad14087e140460703cf0fae09f97d469d65c2
- Fichero GGUF previo de la comunidad con tensores idénticos: https://huggingface.co/mykor/granite-embedding-97m-multilingual-r2-GGUF
- Runtime utilizado (llama.cpp, build b11669): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información disponible enlaces a papers, blogs, demos ni repositorios adicionales del autor.
