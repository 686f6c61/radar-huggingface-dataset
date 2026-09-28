# winterthurquants/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) con 552B parametros de backbone declarados por el autor y una ventana de contexto de hasta un millon de tokens. Procesa nativamente imagenes y texto, y genera texto de forma autorregresiva. La ficha que se analiza aqui corresponde a la republicacion `winterthurquants/DeepSeek-V4.1-Flash`, un espejo del modelo original publicado por DeepSeek AI (`deepseek-ai/DeepSeek-V4.1-Flash`), con licencia MIT y pesos en safetensors.

Su rasgo diferencial no es el numero de parametros, sino la compresion de la cache KV. La arquitectura Causal Encoder-Decoder (CED) proyecta la cache KV global del decodificador desde los estados ocultos finales del codificador, en lugar de derivarla capa a capa, lo que permite activar solo 8B parametros por token en fase de prefill y 16B en fase de decode. Sumado a Compressed Sparse Attention 2 (CSA2) y a una cache KV principal en FP4, el modelo reduce el consumo de cache global a 890 bytes por token, aproximadamente una cuarta parte del de DeepSeek-V4-Flash, y el footprint de KV persistente a cerca de un octavo.

Es relevante ahora porque ataca el cuello de botella economico de las cargas de trabajo agenticas con entradas muy largas: muchos tokens de entrada, muchos documentos e imagenes, y muchas llamadas a herramientas. Ademas incorpora un ajuste de esfuerzo de razonamiento continuo (entero de 1 a 100) que permite intercambiar coste de inferencia por precision segun la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), Transformer de 40 capas (20 de codificador causal + 20 de decodificador), Mixture-of-Experts multimodal |
| Parametros totales | 552B de backbone declarados por el autor; 763.205.315.794 segun los pesos safetensors del repositorio |
| Parametros activos | 8B por token en prefill; 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 de tokens (entrenamiento con atencion dispersa a 64K, extension a 1M a partir de 34T tokens) |
| Tipos de cuantizacion | FP8 / 8-bit en el repositorio; cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible (la model card no especifica el reparto de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers; tamano del repositorio 510,3 GB) |

## Arquitectura y entrenamiento

El modelo combina tres piezas. La primera es la estructura CED de 40 capas: 20 capas de codificador causal seguidas de 20 de decodificador, donde la cache KV global se proyecta desde los estados ocultos finales del codificador. La segunda es CSA2, que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir KV principal e indice K entre capas y reutilizar los indices Top-K de atencion dispersa; en el decodificador, un Hierarchical Sparse Indexer restringe las capas de indexado posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexado profundo con independencia de la longitud de contexto. La tercera es la capa MoE, con 1 experto compartido y 384 expertos enrutados por capa, de los que se activan 6 por token, mas una memoria condicional Engram de 196B parametros de acceso disperso por lookup basado en token.

A esto se suman SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante ausentes replicando solo los ultimos n_win tokens y evita persistir KV en SSD; Single-Pass mHC, una revision del mezclado del flujo residual con un kernel Mega-mHC; y DSpark, una decodificacion especulativa con generacion de borradores semiautorregresiva y verificacion planificada por confianza. En el lado multimodal, un codificador DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, junto con un proyector MLP de dos capas, convierte las imagenes en embeddings visuales que se procesan conjuntamente con el texto desde el inicio del preentrenamiento.

El preentrenamiento se hizo desde cero sobre un corpus multimodal de 45T tokens. El post-entrenamiento sigue el paradigma SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas; los cambios relevantes estan en el pipeline de datos, con sintesis automatizada a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts.

## Capacidades

- Generacion de texto autorregresiva en modo chat y completado.
- Comprension visual nativa: el modelo es `image-text-to-text`, con entrada de imagenes y texto procesadas conjuntamente.
- Razonamiento con esfuerzo controlable: el ajuste de reasoning effort es un entero de 1 a 100 que intercambia coste de inferencia por precision.
- Cargas agenticas de contexto largo: la ventana de 1M tokens y la cache KV de 890 bytes por token estan disenadas para escenarios de muchas entradas y multiples pasos.
- Decodificacion especulativa propia (DSpark) para acelerar la generacion.
- Memoria condicional Engram de acceso disperso, orientada a recuperacion de informacion asociativa por token.
- No se especifica en la informacion disponible el soporte explicito de tool calling / function calling ni la lista de idiomas soportados.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto y 8B parametros activos en prefill, el modelo puede ingerir un arbol de codigo extenso o un monorepo de tamano medio en una sola pasada para responder preguntas de arquitectura, deteccion de dependencias o auditoria de patrones.
- Agentes de larga duracion con herramientas: la combinacion de contexto de 1M tokens, cache KV reducida y entrenamiento orientado a tareas de agente permite mantener historiales de multiples pasos sin reenviar todo el estado en cada turno.
- Procesamiento de documentacion tecnica con imagenes: al ser `image-text-to-text`, puede procesar manuales, diagramas, capturas de pantalla y tablas escaneadas junto al texto asociado, por ejemplo para extraccion estructurada de especificaciones.
- Atencion al cliente sobre bases de conocimiento extensas: la ventana de 1M tokens permite incluir politicas, historial de tickets y catalogo de producto, evitando el troceado agresivo y la perdida de contexto en conversaciones multi-turno.
- Revision de codigo en pipelines de CI/CD: el ajuste de esfuerzo de razonamiento permite fijar un nivel bajo para revisiones rapidas de estilo y uno alto para auditorias de seguridad, ajustando el coste por ejecucion.
- Generacion de informes con evidencia visual: extraccion de datos de graficos, capturas o diagramas y redaccion de informes con referencias al material original, aprovechando la entrada multimodal.
- Investigacion sobre eficiencia de inferencia: la arquitectura CED con criterios de cache KV medibles en bytes por token la convierte en una referencia util para estudiar compresion de cache, atencion dispersa y decodificacion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion titulada "Evaluation Results" para el modelo base, pero el contenido proporcionado se corta antes de mostrar cifras. La unica referencia de rendimiento disponible es cualitativa: la figura 1(b) del autor situa la reduccion de cache KV global en aproximadamente 4 veces respecto a DeepSeek-V4-Flash y 437 veces respecto a DeepSeek-V1. No se dispone de valores de MMLU, HumanEval, GSM8K ni de otros benchmarks.

## Requisitos de hardware

- VRAM estimada para pesos: con 763,2B parametros en safetensors, una carga en FP8 ocupa del orden de 763 GB de VRAM solo en pesos; en FP4 (si se dispusiera de esa cuantizacion) rondaria los 380 GB. Son estimaciones aritmeticas a partir del recuento de parametros, no cifras publicadas por el autor.
- Cache KV: 890 bytes por token en la cache global. Una secuencia de 1M tokens supone aproximadamente 890 MB de KV por secuencia, mas la cache de ventana deslizante y los estados del indexador.
- GPU recomendadas: el despliegue en FP8 exige agregacion multi-GPU, del orden de 16x H100 80 GB o 8x H200 141 GB para cubrir pesos y overhead de ejecucion. No es viable en una sola GPU.
- GPU de consumo: no cabe en tarjetas de consumo (RTX 4090, 5090 o similares); 24-32 GB de VRAM son insuficientes incluso con cuantizaciones agresivas, dado el tamano del backbone y de la memoria Engram.
- Opciones de despliegue: transformers como libreria declarada; el modelo aparece listado en LM Studio; para servido de alta concurrencia encajan motores compatibles con MoE de gran escala como vLLM o SGLang, siempre que soporten la arquitectura `deepseek_v41`. No hay confirmacion en la informacion disponible de soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificacion especulativa DSpark y la activacion de 8B/16B parametros por token apuntan a una mejora de coste frente a modelos densos equivalentes, pero no se aportan numeros de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 552B backbone (763,2B en safetensors), 8B/16B activos | 1M tokens | 890 bytes | MIT | HuggingFace (`deepseek-ai` y espejo `winterthurquants`), LM Studio |
| DeepSeek-V4-Flash | no disponible | no disponible | ~4x la de V4.1-Flash (aprox. 3,5 KB por token, inferido) | no disponible | HuggingFace |
| DeepSeek-V1 | no disponible | no disponible | ~437x la de V4.1-Flash (inferido) | no disponible | HuggingFace |
| DeepSeek-V4.1-Flash UNCENSORED FP8 (dealignai / winterthurquants) | derivado del mismo backbone | 1M tokens (heredado) | no disponible | MIT | HuggingFace |

Las cifras de parametros y contexto de las alternativas no aparecen en la informacion proporcionada; la comparacion se limita por tanto al consumo de cache KV reportado en la figura 1(b) del autor.

## Limitaciones y advertencias

- El repositorio analizado es una republicacion de un tercero (`winterthurquants`), con 0 descargas y 0 likes en el momento de la consulta. Para uso en produccion conviene verificar la integridad de los pesos frente al repositorio oficial `deepseek-ai/DeepSeek-V4.1-Flash`.
- Existe una discrepancia entre los 552B parametros de backbone declarados y los 763,2B parametros de los safetensors. Parte de la diferencia es coherente con los 196B de memoria Engram mas codificador de vision y embeddings, pero la model card no desglosa la cifra; conviene tratarla como no confirmada.
- No se especifican los idiomas soportados ni el reparto del corpus por idioma, por lo que el rendimiento fuera de los idiomas mayoritarios habituales en modelos DeepSeek es desconocido.
- No se han publicado cifras de benchmarks en la informacion disponible, de modo que no hay base objetiva para estimar calidad en razonamiento, codigo o matematicas.
- Riesgo de alucinacion: no cuantificado. Como en cualquier modelo generativo de gran escala, la generacion de contenido plausible pero incorrecto es posible, especialmente en tareas de recuperacion sobre contextos muy largos.
- El ajuste de esfuerzo de razonamiento (1-100) introduce una variable de coste y latencia que debe fijarse por caso de uso; no se documentan en la informacion disponible los valores recomendados por tarea.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero se aplica al artefacto republicado; conviene comprobar los terminos del repositorio oficial de DeepSeek AI.
- Los requisitos de hardware (multi-GPU de gama alta) hacen inviable el despliegue en entornos de una sola GPU o en estaciones de trabajo convencionales.
- Las variantes "uncensored" o "abliterated" derivadas no han pasado por el pipeline de post-entrenamiento original y pueden degradar el rendimiento y los filtros de seguridad.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/winterthurquants/DeepSeek-V4.1-Flash
- Modelo original de DeepSeek AI: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Informe tecnico (PDF): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Anuncio oficial (EN): https://www.deepseek.com/en/news/deepseek-v4-1-flash/
- Anuncio oficial (ZH): https://www.deepseek.com/news/deepseek-v4-1-flash/
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/deepseek-v4.1-flash
- Variante no censurada en FP8: https://huggingface.co/winterthurquants/DeepSeek-V4.1-Flash-UNCENSORED-FP8
