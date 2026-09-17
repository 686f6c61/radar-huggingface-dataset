# vwdubb/Swift-Qwen3.8-27b-FP8

## Resumen

Swift-Qwen3.8-27b-FP8 es una cuantización en FP8 del modelo Swift-Qwen3.8-27B, publicada por el usuario vwdubb. El modelo original lo desarrolla UkisAI como derivado de Qwen3.8-27B orientado a la eficiencia de razonamiento: según su model card, reduce el número de tokens de "thinking" en un 58,3% (mediana en GPQA-Diamond) manteniendo una pérdida de rendimiento inferior al 1%, lo que se traduce en una aceleración de hasta x1,95 en varias tareas. Esta variante concreta aplica cuantización de 8 bits con la librería compressed-tensors sobre los pesos del modelo base, con 27.781.427.952 parámetros (~27,8B) y un repositorio de 38,5 GB.

El problema que resuelve es doble. Por un lado, el sobrepensamiento (overthinking) de los modelos de razonamiento: trazas de pensamiento larguísimas que disparan el coste de inferencia sin mejorar la respuesta. Por otro, el coste de despliegue: al pasar los pesos a FP8 se reduce aproximadamente a la mitad el espacio ocupado respecto a BF16, lo que abarata memoria y ancho de banda en servidores con GPU Ada u Hopper. La pipeline declarada es image-text-to-text, de modo que el modelo conserva capacidades multimodales de entrada de imagen, además de generación de texto, razonamiento y conversación multturno.

Es relevante ahora porque la familia Qwen3.x es una de las referencias abiertas en modelos de razonamiento de tamano medio, y las variantes "token-efficient" atacan directamente el principal coste operativo de estos sistemas: el número de tokens generados por consulta. Al estar publicado como cuantización FP8 con licencia swift-open-license-1.0 y acceso restringido (gated) en el modelo base, conviene revisar las condiciones de uso comercial antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer derivado de Qwen3.8-27B; los tags indican qwen3_5/qwen3_8; no se especifica si es denso o MoE) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no aplica / no disponible (no hay indicios de arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base dispone de una variante GGUF en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como license: other, con apartado de enterprise licensing) |
| Formato de pesos | safetensors (cuantizacion FP8 via compressed-tensors), libreria transformers |

## Arquitectura y entrenamiento

El modelo base Swift-Qwen3.8-27B es un derivado de Qwen3.8-27B entrenado con un enfoque de eficiencia de razonamiento. Segun la model card, UkisAI identifico una serie de tokens marcadores de razonamiento que, en su analisis de los rollouts del modelo, disparan el sobrepensamiento; el ajuste fino penaliza el uso de esos tokens durante el razonamiento, de modo que el modelo produce trazas mas cortas y, segun sus pruebas, con menos errores por sobrepensamiento. Ademas, incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI. El pipeline declarado es image-text-to-text y los tags incluyen lora, lo que sugiere que el ajuste se materializo como adaptador LoRA antes de fusionarse con la base.

La variante publicada por vwdubb no modifica el entrenamiento: es una cuantizacion posterior de los pesos a FP8 mediante compressed-tensors, manteniendo el tokenizer, la configuracion y la pipeline image-text-to-text. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta si la cuantizacion FP8 ha sido calibrada con un conjunto de datos especifico ni como afecta dicha calibracion a las trazas de razonamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag conversational).
- Razonamiento explicito con trazas de pensamiento mas cortas que el modelo base (efficient-thinking, token-efficient).
- Razonamiento general y de tipo cientifico (evaluado en GPQA-Diamond) y conocimiento amplio con preguntas de opcion multiple (MMLU-Pro, C-Eval).
- Seguimiento de instrucciones, evaluado con IFBench.
- Entrada de imagen ademas de texto (pipeline image-text-to-text), lo que habilita tareas de vision-lenguaje.
- Capacidad multilingue: no disponible (los benchmarks incluyen C-Eval, de tematica china, pero no se declara la lista de idiomas soportados).
- Tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Comportamiento agentico y razonamiento multi-paso: no documentado explicitamente, aunque el modo de razonamiento prolongado es compatible con ese uso.
- Modo de pensamiento explicito con control de longitud: implicito en el objetivo de eficiencia de tokens, sin parametros de configuracion documentados.

## Casos de uso

- Razonamiento cientifico y tecnico asistido: el modelo esta evaluado en GPQA-Diamond (88,28% en la version Swift), por lo que resulta adecuado para responder preguntas de nivel experto en fisica, quimica y biologia con trazas de razonamiento verificables y un coste de tokens un 41% inferior al base.
- Atencion al cliente automatizada: con capacidad conversacional multi-turno y una pipeline image-text-to-text, puede gestionar consultas que incluyan capturas de pantalla o fotos de producto, reduciendo el coste por conversacion gracias a la menor generacion de tokens de pensamiento.
- Analisis de documentos e imagenes tecnicas: al aceptar entradas de imagen y texto, sirve para extraer informacion de diagramas, capturas de interfaz o tablas escaneadas y razonar sobre ellas en un unico flujo.
- Evaluacion academica y generacion de examenes: su rendimiento en C-Eval (90,62%) y MMLU-Pro (84,95%) lo hace util para generar preguntas de opcion multiple con justificacion y para corregir respuestas razonadas.
- Razonamiento sobre normas e instrucciones largas: evaluado en IFBench (71,80%), es apropiado para tareas de cumplimiento normativo o generacion de respuestas que deben ceñirse estrictamente a un conjunto de reglas.
- Despliegue en infraestructura con presupuesto de memoria ajustado: al ocupar aproximadamente la mitad que una version BF16, permite servir un modelo de ~27,8B en una sola GPU de 48 GB o en nodos con GPU Ada/Hopper con FP8 nativo, en lugar de requerir dos GPU.
- Pipelines de generacion de codigo y texto largo: la reduccion de tokens de razonamiento (hasta 58,3% en la mediana de GPQA-Diamond) baja la latencia y el coste por peticion en cargas con muchos usuarios concurrentes.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del modelo base (ukisai/Swift-Qwen3.8-27b) y comparan Qwen3.8-27B en BF16 con la misma base mas el adaptador Swift. Corresponden al modelo base sin cuantizar, no a esta variante FP8, y son resultados publicados por el autor.

| Benchmark | Base (BF16) | Swift | Tokens medios base | Tokens medios Swift | Reduccion mediana |
|---|---|---|---|---|---|
| GPQA-Diamond | 88,38% | 88,28% | 15.014 | 8.855 | -58,3% |
| MMLU-Pro | 85,47% | 84,95% | 2.980 | 1.603 | -28,3% |
| C-Eval | 90,00% | 90,62% | 1.492 | 804 | -19,3% |
| IFBench | 73,53% | 71,80% | 8.052 | 4.657 | -50,5% |

La model card se interrumpe tras la seccion "General reasoning", por lo que no se dispone de resultados de otras categorias (codigo, matematicas, vision) ni de las filas de reduccion de tokens medios para todos los casos. No hay benchmarks publicados especificamente para esta cuantizacion FP8.

## Requisitos de hardware

- VRAM estimada: con pesos FP8, el modelo ocupa aproximadamente 28 GB en memoria (27,8B parametros a ~1 byte por parametro). El repositorio completo son 38,5 GB, lo que sugiere que parte de los tensores (embeddings, lm_head o modulos no cuantizados) podrian permanecer en mayor precision. A esa cifra hay que sumar la cache KV, que crece con la longitud de contexto; no se dispone del dato de contexto maximo, por lo que no puede acotarse la cache.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. El modelo base es gated, por lo que el acceso debe solicitarse.
- GPU de consumo: no cabe en una RTX 4090, RTX 3090 o similar de 24 GB con pesos FP8 completos. Seria necesario repartir el modelo entre varias GPU de 24 GB (por ejemplo, 2x RTX 4090) o recurrir a offload a CPU/RAM, con la penalizacion de latencia correspondiente. Las GPU Ada (RTX 4090, L40S) y Hopper soportan FP8 nativo; en arquitecturas anteriores el FP8 se emularia o se convertiria, con perdida de rendimiento.
- Opciones de despliegue: transformers (libreria declarada), vLLM y SGLang para servir FP8 con continuous batching, TGI, y llama.cpp/Ollama si se opta por la variante GGUF del modelo base. El tag endpoints_compatible indica compatibilidad con Inference Endpoints.
- Latencia y throughput: no disponibles para esta variante. El autor reporta una aceleracion de x1,95 en varias tareas atribuible a la reduccion de tokens de razonamiento, pero no se especifican GPU, batch size ni longitud de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| vwdubb/Swift-Qwen3.8-27b-FP8 (este) | ~27,8B | FP8 / safetensors | no disponible | swift-open-license-1.0 | no disponible (sin benchmarks propios) |
| ukisai/Swift-Qwen3.8-27b (base) | ~27,8B | BF16 / safetensors | no disponible | swift-open-license-1.0 | GPQA-D 88,28%; MMLU-Pro 84,95%; C-Eval 90,62%; IFBench 71,80% |
| Qwen3.8-27B (referencia del autor) | ~27,8B | BF16 | no disponible | no disponible | GPQA-D 88,38%; MMLU-Pro 85,47%; C-Eval 90,00%; IFBench 73,53% |
| bottlecapai/ThinkingCap-Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos citados en la documentacion del autor. No se dispone de datos de licencia, contexto ni benchmarks de otros modelos abiertos de tamano similar dentro de la informacion proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- La cuantizacion FP8 puede introducir degradaciones adicionales respecto a los resultados publicados, que corresponden a la base en BF16. No hay evaluacion publicada de esta variante concreta.
- Modelo gated: el acceso esta restringido y requiere aceptar las condiciones del autor.
- Licencia swift-open-license-1.0 (license: other), con un apartado especifico de enterprise licensing. Es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier uso comercial; no se puede asumir una licencia permisiva tipo Apache 2.0.
- Sesgos conocidos: no disponibles. No hay documentacion sobre composicion del dataset ni sobre sesgos evaluados.
- Riesgo de alucinacion: no cuantificado. Al ser un modelo de razonamiento, puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente cuando el ajuste penaliza tokens de verificacion.
- El objetivo de eficiencia de tokens puede degradar tareas que requieren verificacion o backtracking largo; en la propia tabla, IFBench cae de 73,53% a 71,80%.
- Limitaciones de idioma: no se declara la lista de idiomas soportados. Los benchmarks incluyen C-Eval (chino), pero no hay garantia de calidad equivalente en castellano.
- Limitacion de contexto: se desconoce la ventana maxima de contexto, lo que impide planificar el consumo de cache KV en produccion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en comunidad ni de validacion independiente.
- El modelo base esta etiquetado como derivado de Qwen3.8-27B, un modelo cuyos pesos podrian no estar publicamente disponibles; conviene verificar los terminos de la cadena de derivacion.
- El tag qwen3_5 junto a qwen3_8 introduce ambiguedad sobre la version exacta de la arquitectura subyacente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-FP8
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Variante GGUF del base: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Componente de transferencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo en video: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/resolve/main/swift-speed-demo.mp4

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles son los anteriores, procedentes de la informacion de HuggingFace. No se han localizado papers, blogs tecnicos ni repositorios adicionales.
