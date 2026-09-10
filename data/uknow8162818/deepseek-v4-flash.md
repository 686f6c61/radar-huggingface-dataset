# uknow8162818/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) que forma parte de la serie DeepSeek-V4, presentada por DeepSeek AI como version preliminar (preview). Segun su model card, cuenta con 284.000 millones de parametros totales y 13.000 millones activados por token, con una longitud de contexto de un millon de tokens. La serie se completa con DeepSeek-V4-Pro (1,6 billones de parametros totales, 49.000 millones activos) y con sus variantes Base e instruct.

El repositorio analizado, `uknow8162818/DeepSeek-V4-Flash`, es una reproduccion subida por un tercero y no la publicacion oficial de DeepSeek AI; los pesos safetensors del repositorio declaran 290.944.616.402 parametros (~290,9B), una cifra que no coincide exactamente con los 284B indicados en la model card. El repo ocupa 159,6 GB y no registra descargas ni valoraciones en el momento de la consulta.

Su relevancia tecnica esta en la combinacion de contexto de 1M tokens con una arquitectura de atencion hibrida: el autor afirma que, en configuracion de 1M tokens, DeepSeek-V4-Pro requiere solo el 27% de los FLOPs de inferencia por token y el 10% de la cache KV de DeepSeek-V3.2. El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial y la creacion de derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: Compressed Sparse Attention (CSA) + Heavily Compressed Attention (HCA), y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 284B segun la model card; 290.944.616.402 (~290,9B) segun los pesos safetensors del repositorio |
| Parametros activos | 13B por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Pesos publicados en FP4 + FP8 mixto (expertos MoE en FP4, mayoria del resto en FP8); la variante Base usa FP8 mixto. El repositorio incluye las etiquetas 8-bit y fp8. No se confirman cuantizaciones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los benchmarks incluidos cubren ingles y chino: MMLU, MMMLU, C-Eval, CMMLU) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 159,6 GB |
| Optimizador de entrenamiento | Muon |

## Arquitectura y entrenamiento

El modelo es un transformer disperso de tipo MoE con 284B parametros totales y 13B activos por token. Su innovacion principal es la atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA) para reducir el coste del contexto largo; segun el autor, en el escenario de 1M tokens esto reduce los FLOPs de inferencia por token al 27% y la cache KV al 10% respecto a DeepSeek-V3.2. Ademas, incorpora Manifold-Constrained Hyper-Connections (mHC) para reforzar las conexiones residuales convencionales, mejorando la estabilidad de propagacion de senal entre capas sin perder expresividad.

El preentrenamiento se realizo sobre mas de 32 billones (32T) de tokens diversos y de alta calidad. El post-entrenamiento sigue un paradigma en dos etapas: primero se cultivan expertos independientes por dominio mediante SFT y RL con GRPO, y despues se consolidan en un unico modelo mediante destilacion on-policy, integrando las competencias de cada dominio. La serie incluye modos de maximo esfuerzo de razonamiento: DeepSeek-V4-Pro-Max y DeepSeek-V4-Flash-Max, este ultimo descrito como capaz de alcanzar un rendimiento de razonamiento comparable al de la variante Pro quando se le concede un presupuesto de pensamiento mayor, aunque queda por detras en tareas de conocimiento puro y en los flujos agenticos mas complejos.

## Capacidades

- Generacion de texto y conocimiento del mundo: la model card reporta resultados en AGIEval, MMLU, MMLU-Redux, MMLU-Pro, MMMLU, C-Eval y CMMLU para las variantes Base.
- Razonamiento con presupuesto de pensamiento variable: los modos `-Max` permiten ampliar el esfuerzo de razonamiento, con rendimiento cercano al de la variante Pro en la variante Flash.
- Codigo: el autor afirma rendimiento de primer nivel en benchmarks de programacion para DeepSeek-V4-Pro-Max.
- Tareas agenticas y flujos de multiples pasos: la model card menciona explicitamente tareas agenticas, y afirma que la serie reduce la distancia con los principales modelos cerrados en razonamiento y agentes.
- Contexto largo: ventana de 1M tokens con atencion hibrida optimizada para eficiencia en esa longitud.
- Capacidades multilingues: confirmadas de forma indirecta por la presencia de C-Eval y CMMLU (chino) y MMLU/MMMLU (multilingue); la lista oficial de idiomas no esta disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; la model card describe exclusivamente modelos de lenguaje MoE.

## Casos de uso

- Analisis de documentacion extensa: con 1M tokens de contexto, el modelo puede procesar bases documentales completas, expedientes o informes anuales en una sola pasada, evitando estrategias de troceado y recuperacion que degradan la coherencia global.
- Comprension de repositorios de codigo completos: es viable cargar ficheros fuente, tests y configuracion de un proyecto de tamano medio para tareas de revision, refactorizacion o generacion de tests, apoyandose en la ventana de 1M tokens.
- Agentes autonomos de multiples pasos: la model card declara capacidades agenticas, por lo que el modelo encaja en flujos de planificacion y ejecucion iterativa sobre herramientas externas; conviene verificar el soporte real de function calling antes de llevarlo a produccion.
- Generacion de codigo asistida en pipelines de desarrollo: integrable en asistentes de IDE o revision de pull requests, con la ventaja de la licencia MIT para uso comercial.
- RAG sobre corpus muy grandes con reduccion de infraestructura de recuperacion: al reducirse la cache KV por token, mantener conversaciones o documentos largos en memoria resulta mas viable que con arquitecturas densas equivalentes.
- Investigacion sobre arquitecturas MoE eficientes: el modelo sirve como referencia reproducible para estudiar atencion hibrida (CSA/HCA), mHC y el optimizador Muon, dado que los pesos son publicos y la licencia es permisiva.
- Ajuste fino y destilacion de modelos derivados: la licencia MIT permite entrenar variantes especializadas de dominio sobre esta base sin las restricciones de licencias de investigacion.
- Atencion al cliente con historial largo: la ventana de 1M tokens permite conservar el historial completo de una interaccion multi-turno sin resumir, manteniendo el contexto de incidencias previas.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a los modelos **Base** y la tabla de la model card esta truncada en los datos proporcionados. No constan resultados de HumanEval, GSM8K ni de las variantes instruct o `-Max`.

| Benchmark (metrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| Arquitectura | - | MoE | MoE | MoE |
| Parametros activados | - | 37B | 13B | 49B |
| Parametros totales | - | 671B | 284B | 1,6T |
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

## Requisitos de hardware

Estimaciones derivadas del numero de parametros y del tamano del repositorio; no proceden de mediciones publicadas por el autor.

- Peso de los pesos: aproximadamente 145-160 GB en el formato publicado (FP4 + FP8 mixto), coherente con los 159,6 GB del repositorio.
- VRAM minima para cargar el modelo: del orden de 160 GB solo para pesos, sin margen para cache KV ni activaciones. En la practica se necesitan al menos 4 GPU de 80 GB (320 GB agregados) o 8 GPU de 80 GB para lotes y contextos amplios.
- GPU recomendadas: H100 80 GB, H200 80/141 GB y A100 80 GB en configuraciones multi-GPU con paralelismo de tensor y de expertos. Tambien resulta adecuado en instancias de 8 GPU tipo HGX.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 32-48 GB. Solo seria planteable mediante offloading de expertos a CPU o a memoria del sistema, con penalizacion severa de latencia, y esta opcion no esta confirmada en la informacion disponible.
- Coste de computo: al activarse 13B parametros por token, el coste de calculo por token es comparable al de un modelo denso de ~13B, mientras que el coste de memoria es el de un modelo de ~284B.
- Cache KV: la model card afirma una reduccion al 10% respecto a DeepSeek-V3.2 en contexto de 1M tokens, lo que alivia el consumo de memoria en conversaciones y documentos largos, aunque no se publican cifras absolutas de GB.
- Opciones de despliegue: la unica libreria confirmada es `transformers` con pesos safetensors. No se confirma compatibilidad con vLLM, SGLang, TGI, llama.cpp u Ollama; llama.cpp requeriria cuantizaciones GGUF que no constan en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B (290,9B segun safetensors) | 13B | 1M | FP4 + FP8 mixto | MIT | Repositorio de tercero; variante oficial en deepseek-ai |
| DeepSeek-V4-Flash-Base | 284B | 13B | 1M | FP8 mixto | no disponible | HuggingFace y ModelScope (deepseek-ai) |
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | FP4 + FP8 mixto | no disponible | HuggingFace y ModelScope (deepseek-ai) |
| DeepSeek-V3.2-Base | 671B | 37B | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

Frente a DeepSeek-V3.2-Base, la variante Flash ofrece mejores resultados en todos los benchmarks mostrados (por ejemplo, MMLU-Pro pasa de 65,5 a 68,3 y MMLU de 87,8 a 88,7) con menos de la mitad de parametros totales y un tercio de parametros activos. Frente a DeepSeek-V4-Pro, queda por detras en conocimiento puro (MMLU 88,7 frente a 90,1; MMLU-Pro 68,3 frente a 73,5), aunque el autor sostiene que la variante `-Max` con mayor presupuesto de pensamiento iguala su rendimiento en razonamiento.

## Limitaciones y advertencias

- El repositorio analizado pertenece a un tercero (`uknow8162818`), no a DeepSeek AI. No hay verificacion de que los pesos coincidan con la publicacion oficial y no registra descargas ni valoraciones. Para produccion es preferible usar `deepseek-ai/DeepSeek-V4-Flash`.
- Discrepancia de parametros: la model card declara 284B y los safetensors del repositorio suman 290.944.616.402 parametros (~290,9B). Conviene verificar la procedencia antes de integrarlo.
- La informacion de la model card corresponde a una version preliminar (preview) de la serie, sujeta a cambios.
- No se declara la lista de idiomas soportados; el soporte multilingue solo puede inferirse de los benchmarks incluidos (ingles, chino y MMMLU). No hay evidencia publicada sobre el rendimiento en castellano.
- La tabla de benchmarks proporcionada esta truncada y solo cubre modelos Base; no hay datos de las variantes instruct ni de los modos `-Max`, ni de tareas de codigo, matematicas o agentes.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni resultados de evaluacion de veracidad. Como en cualquier modelo generativo, la salida debe validarse en dominios sensibles.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad en la informacion disponible.
- Restricciones de licencia: el repositorio declara licencia MIT, lo que en principio permite uso comercial y modificacion; no obstante, al tratarse de una reproduccion de terceros, la licencia aplicable al modelo original deberia confirmarse en el repositorio de DeepSeek AI.
- Requisitos de hardware muy elevados: ~160 GB solo de pesos, lo que excluye su despliegue en GPU de consumo y complica el autoalojamiento en equipos de un solo nodo con menos de 4 GPU de 80 GB.
- No se confirma soporte de tool calling ni integracion con frameworks de inferencia habituales (vLLM, SGLang, llama.cpp, Ollama), lo que puede condicionar su adopcion en produccion.
- No hay datos de latencia, throughput ni coste energetico publicados.

## Enlaces

- Repositorio analizado (tercero): https://huggingface.co/uknow8162818/DeepSeek-V4-Flash
- Modelo oficial DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Modelo oficial DeepSeek-V4-Flash-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- Modelo oficial DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Modelo oficial DeepSeek-V4-Pro-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- ModelScope (DeepSeek-V4-Flash-Base): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash-Base
- ModelScope (DeepSeek-V4-Flash): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash
- ModelScope (DeepSeek-V4-Pro-Base): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro-Base
- ModelScope (DeepSeek-V4-Pro): https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro
- Informe tecnico (arXiv:2606.19348): https://arxiv.org/abs/2606.19348
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial: https://www.deepseek.com/
- Chat: https://chat.deepseek.com/
- Twitter/X: https://twitter.com/deepseek_ai
- DeepSeek Harness (repositorio encontrado en la busqueda web, no referenciado en la model card): https://github.com/deepseek-ai/deepseek-harness
