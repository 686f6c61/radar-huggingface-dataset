# vmarcelo/Swift-Qwen3.8-27B-MIX_GGUF

## Resumen

Swift-Qwen3.8-27B-MIX_GGUF es un paquete de tres cuantizaciones GGUF de tensor mixto (IQ4-MIX, IQ3-MIX e IQ2-MIX) creadas por el usuario vmarcelo a partir de ukisai/Swift-Qwen3.8-27b, un fine-tune multimodal de Qwen/Qwen3.8-27B. El modelo subyacente es un transformer denso de 27.320.697.856 parametros (27,32B) que combina capas de atencion lineal GatedDeltaNet con capas de atencion completa (Gated Attention) y anade una cabeza de prediccion multi-token (MTP) para decodificacion especulativa. Es, por tanto, un modelo de imagen-texto con codificador visual separado (mmproj-F16.gguf, 889 MB).

La relevancia de esta publicacion es practica: los tres ficheros estan disenados para caber en el presupuesto de 16 GB de VRAM de GPU de consumo (el autor cita la AMD Radeon RX 9070 XT) sin renunciar a la cabeza MTP, que queda embebida en los pesos para que la decodificacion especulativa funcione sin descargar un segundo fichero. Los tamanos van de 14,16 GB (IQ4, 4,15 BPW) a 10,12 GB (IQ2, 2,96 BPW), con una receta por tensor que protege los tensores sensibles (attn_k y attn_v en Q6_K, output.weight en Q5_K, ssm_alpha/ssm_beta en Q8_0) y concentra el recorte en el FFN, que representa el 62,6% de los parametros.

Hay que tener en cuenta dos avisos importantes: el propio autor marca esta pagina como superada por ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF, la release oficial GGUF de Swift 1.5, y la licencia swift-open-license-1.0 no es una licencia de codigo abierto estandar, por lo que su uso comercial exige revisar el texto completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida: GatedDeltaNet (atencion lineal) + Gated Attention (atencion completa), mas cabeza MTP (Multi-Token Prediction) |
| Parametros totales | 27.320.697.856 (27,32B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, sin MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El cuantizador indica rangos practicos de 64K-128K con IQ3-MIX y de 131K-262K con IQ2-MIX sobre 16 GB de VRAM |
| Tipos de cuantizacion | Tensor mixto: IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ4_XS, Q4_0, Q4_K, Q5_K, Q6_K, Q8_0 y F32 (norms, ssm_a, ssm_conv1d). Tres tiers: IQ4-MIX (4,15 BPW), IQ3-MIX (3,77 BPW), IQ2-MIX (2,96 BPW) |
| Idiomas soportados | Multilingue (no se detalla la lista de idiomas) |
| Licencia | swift-open-license-1.0 (declarada como license: other) |
| Formato de pesos | GGUF (llama.cpp). Incluye mmproj-F16.gguf para el codificador visual, fichero imatrix de procedencia y config.json para LM Studio / Hugging Face Hub |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Modelo base | ukisai/Swift-Qwen3.8-27b (relacion: quantized) |
| Modelo upstream | Qwen/Qwen3.8-27B |
| Herramienta de cuantizacion | llama.cpp, build 58367713a, con importance matrix propia y overrides por tensor |
| Ficheros principales | IQ4-MIX 14,16 GB; IQ3-MIX 12,87 GB; IQ2-MIX 10,12 GB; mmproj-F16 889 MB; swift-imatrix.gguf 14 MB; tres recetas .txt de 3,4 KB |
| Tamano del repositorio | 38,1 GB |
| Descargas / likes | 2.583 descargas, 2 likes |
| Publicado / actualizado | 2026-09-22 / 2026-09-25 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,32B parametros con una arquitectura hibrida: intercala capas de atencion lineal GatedDeltaNet (con estado recurrente, tipo SSM/DeltaNet) con capas de atencion completa, y sobre ellas anade una cabeza de prediccion multi-token (MTP) situada en el bloque 64. El codificador visual se distribuye por separado (mmproj-F16.gguf) y se carga con el flag --mmproj, lo que permite usar el modelo tanto en modo solo texto como en modo imagen-texto. El pipeline declarado es image-text-to-text y el modelo upstream conserva soporte de texto, imagen y video, segun el anuncio de UkisAI.

Sobre el entrenamiento no se proporcionan datos en la informacion disponible: no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. Lo que si se documenta es que Swift es un fine-tune de Qwen3.8-27B que incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B (BottleCap AI), orientado a producir trazas de razonamiento mas cortas y a reducir errores de sobrepensamiento (overthinking), manteniendo la interfaz estandar de Qwen3.8.

La innovacion tecnica de esta publicacion concreta esta en la cuantizacion, no en el modelo. Las tres recetas siguen una logica de inversion deliberada: dado que el FFN concentra el 62,6% de los parametros y no hay otro bloque con masa suficiente para financiar un fichero de 10 GB, se recorta el FFN (hasta IQ2_XXS en el centro del bloque) mientras se mantienen en precision alta los tensores pequenos y fragiles, incluidos attn_k/attn_v en Q6_K y output.weight en Q5_K, que juntos suman menos de 1 GB. Los tensores ssm_alpha y ssm_beta (unas 96 matrices diminutas que controlan la ruta DeltaNet) se fijan en Q8_0 en todos los tiers. Los tensores de normas, ssm_a y ssm_conv1d se mantienen en F32. La cabeza MTP se conserva en todos los ficheros (Q8_0 en IQ4/IQ3, Q4_0 en IQ2), lo que habilita decodificacion especulativa integrada sin fichero auxiliar.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con la interfaz estandar de Qwen3.8.
- Comprension de imagenes mediante el codificador visual mmproj-F16.gguf (pipeline image-text-to-text).
- Soporte de video en el modelo base, segun el anuncio de UkisAI; no se detalla el formato ni los limites.
- Modo de razonamiento con trazas mas cortas y menos errores de sobrepensamiento en comparacion con el modelo del que deriva, gracias al componente de transferencia de ThinkingCap.
- Decodificacion especulativa integrada mediante la cabeza MTP embebida en los propios pesos, sin necesidad de descargar un modelo draft separado.
- Capacidad multilingue declarada (sin lista explicita de idiomas).
- Ejecucion en backend Vulkan, ademas de CUDA y Metal, al distribuirse en formato GGUF (etiqueta vulkan en el repositorio).
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible. Al conservar la interfaz de Qwen3.8 y estar orientado a cargas agenticas por el propio cuantizador (tier IQ3 "agentic workloads"), es plausible, pero no hay documentacion que lo certifique aqui.
- Capacidades de codigo y matematicas: no documentadas con benchmarks ni ejemplos en la informacion disponible.

## Casos de uso

- Asistente multimodal en GPU de 16 GB: cargando IQ4-MIX (14,16 GB) mas mmproj-F16 (889 MB) con llama.cpp o LM Studio en una Radeon RX 9070 XT, se obtiene un modelo capaz de responder preguntas sobre imagenes sin salir del hardware local, util para analisis de capturas, diagramas o fotos de producto.
- Extraccion de informacion de documentos escaneados: con el codificador visual activo se pueden procesar facturas, formularios o informes en imagen y pedir salida estructurada, manteniendo los datos dentro de la infraestructura propia, algo critico en sectores con requisitos de confidencialidad.
- Agentes de multiples pasos con contexto largo: el tier IQ3-MIX (12,87 GB, 3,77 BPW) es el recomendado por el autor para cargas agenticas y ventanas de 64K-128K, lo que permite mantener el historial completo de herramientas, observaciones y resultados intermedios en una sola sesion.
- Atencion al cliente multilingue: la ventana extendida y el caracter multilingue permiten gestionar conversaciones multi-turno con clientes en varios idiomas y con contexto acumulado de incidencias previas, siempre que se valide la calidad en los idiomas objetivo.
- Procesamiento de documentacion tecnica extensa: con IQ2-MIX (10,12 GB) y ventanas de 131K-262K sobre 16 GB de VRAM, se pueden resumir o consultar manuales, expedientes y normativas largas en una sola pasada, asumiendo el coste de calidad de este tier.
- Analisis de video y contenido audiovisual: dado que el modelo base conserva soporte de video, se puede emplear para describir escenas, extraer eventos relevantes o generar subtitulos y resumenes, previa verificacion de los limites reales de frames y duracion.
- Investigacion sobre cuantizacion y decodificacion especulativa: los tres ficheros, junto con las recetas .txt y la importance matrix incluidas en el repositorio, permiten reproducir y comparar el impacto de BPW, tipos por tensor y uso de la cabeza MTP sobre la calidad y la latencia.
- Asistente de programacion en local: puede emplearse como asistente de codigo en un IDE con backend llama.cpp, pero no hay benchmarks de HumanEval ni de tareas de codigo en la informacion disponible, por lo que la idoneidad debe validarse antes de integrarlo en un pipeline de CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion estandar, ni para el modelo base ni para las cuantizaciones. El autor de la model card del modelo Swift menciona que existen resultados de benchmarks, pero no se incluyen los numeros en la informacion disponible.

El unico dato cuantitativo de rendimiento publicado es la comparacion interna entre tiers de cuantizacion:

| Comparacion | Diferencia declarada |
|---|---|
| IQ2-MIX frente a IQ3-MIX (top-1) | Aproximadamente 5 puntos menos |
| IQ2-MIX frente a IQ3-MIX (KLD) | Aproximadamente 3 veces mas divergencia |

El autor califica IQ2-MIX como tier de contexto maximo y experimental, no de proposito general, y senala que en una prueba de humo con un prompt largo de temas mezclados el modelo identifico correctamente la pregunta real situada al final del contexto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): IQ4-MIX 14,16 GB; IQ3-MIX 12,87 GB; IQ2-MIX 10,12 GB. A estos hay que sumar 889 MB del codificador visual si se usa entrada de imagen o video. El modelo en safetensors a precision completa ocuparia del orden de 54,6 GB y en Q8 alrededor de 27 GB (estimaciones aritmeticas a partir de los 27,32B parametros, no datos publicados por el autor).
- Objetivo declarado por el autor: 16 GB de VRAM, con la AMD Radeon RX 9070 XT como referencia explicita.
- GPU de 16 GB (RX 9070 XT, RTX 4080, RTX 5070 Ti): IQ3-MIX e IQ2-MIX caben con holgura y permiten contexto medio o largo; IQ4-MIX cabe pero deja muy poco margen para la cache KV, por lo que exige contexto corto o moderado.
- GPU de 24 GB (RTX 4090, RTX 3090, A10G, L4 con 24 GB): IQ4-MIX con contexto largo y vision activada sin problemas; es el escenario mas comodo para produccion.
- GPU de 32 GB o mas (RTX 5090, V100 32 GB): margen adicional para lotes, contexto extendido y multiples peticiones concurrentes.
- GPU de centro de datos (A100 40/80 GB, H100 80 GB): permiten servir el modelo con precision mayor o varias instancias; tambien hacen viable cargar el safetensors original en FP16 con una sola A100 de 80 GB o H100.
- Cabe en GPU de consumo: si, en las tres cuantizaciones, en tarjetas de 16 GB o mas. La condicion es ajustar la longitud de contexto y usar cache KV cuantizada.
- Opciones de despliegue: llama.cpp (build 58367713a o posterior), LM Studio (el repositorio incluye config.json preparado para ello), Ollama mediante importacion del GGUF con un Modelfile, koboldcpp y cualquier frontend que use el backend llama.cpp. El backend Vulkan esta explicitamente contemplado por el autor (etiqueta vulkan), lo que facilita el uso en GPU AMD. Para vLLM o TGI no hay confirmacion en la informacion disponible: el formato GGUF esta orientado al ecosistema llama.cpp.
- Latencia y throughput: no hay cifras publicadas. El autor afirma que la cabeza MTP queda embebida y habilita decodificacion especulativa sin fichero adicional, lo que en la practica reduce la latencia por token en comparacion con la decodificacion autoregresiva estandar, pero no se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| vmarcelo/Swift-Qwen3.8-27B-MIX_GGUF (esta ficha) | 27,32B | GGUF, 10,12-14,16 GB segun tier | No disponible | swift-open-license-1.0 | Archivo; el autor recomienda migrar a Swift 1.5 |
| ukisai/Swift-Qwen3.8-27b | 27,32B | safetensors, peso no indicado | No disponible | swift-open-license-1.0 | Modelo original del que derivan estas cuantizaciones |
| ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF | No disponible | GGUF | No disponible | No disponible en la informacion proporcionada | Release oficial GGUF de Swift 1.5, recomendada por el propio cuantizador |
| Qwen/Qwen3.8-27B | 27B (aproximado, no confirmado) | safetensors | No disponible | No disponible en la informacion proporcionada | Modelo upstream, sin la transferencia de ThinkingCap ni la receta de cuantizacion de vmarcelo |

La comparacion con alternativas de otros fabricantes (por ejemplo otros modelos multimodales densos de 27-32B en formato GGUF) no es posible con la informacion disponible, ya que no hay datos de rendimiento publicados para este modelo que permitan situarlo frente a competidores.

## Limitaciones y advertencias

- Modelo superado: el propio autor indica que esta cuantizacion ha sido reemplazada por ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF y recomienda usar esa release. Esta pagina se mantiene como archivo.
- Licencia no estandar: swift-open-license-1.0 se declara como license: other, no como una licencia open source reconocida. Antes de cualquier uso comercial o redistribucion hay que leer el texto completo enlazado desde el modelo base; no se puede asumir permisividad.
- Perdida de calidad por cuantizacion: IQ2-MIX presenta, segun el propio autor, alrededor de 5 puntos menos de top-1 y 3 veces mas KLD que IQ3-MIX, y se describe como tier experimental de contexto maximo. No es adecuado como opcion por defecto en produccion.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad ni de tasa de alucinacion para este modelo ni para sus cuantizaciones. Como en cualquier LLM, la verificacion de salidas es obligatoria en aplicaciones sensibles.
- Descenso de precision en tensores fragiles: aunque la receta protege attn_k, attn_v, output.weight y los tensores ssm, el resto del modelo, especialmente el FFN, se degrada en precision. La degradacion acumulada no esta medida con benchmarks publicos.
- Idiomas: se declara multilingue, pero no se especifica la lista de idiomas soportados ni su calidad relativa. En idiomas distintos del ingles y el chino conviene hacer una evaluacion propia antes de desplegar.
- Contexto: no se documenta la longitud de contexto oficial del modelo base. Los rangos de 64K-128K (IQ3) y 131K-262K (IQ2) son orientaciones practicas del cuantizador sobre 16 GB de VRAM, no especificaciones certificadas.
- Tool calling y agentes: no hay documentacion explicita que confirme soporte de function calling en esta publicacion, aunque el autor oriente el tier IQ3 a cargas agenticas. Debe verificarse experimentalmente.
- Metadatos inconsistentes: el repositorio incluye la etiqueta qwen3_5 mientras el nombre, el modelo base y las etiquetas principales hacen referencia a Qwen3.8. Ademas, sitios de terceros (LLM Explorer, GenAiHub) publican cifras contradictorias entre si y con Hugging Face (VRAM de 0,9 GB, 13.088 descargas, pipeline de text-generation). Conviene guiarse solo por los datos del repositorio oficial.
- Vision y video: el codificador visual se distribuye aparte y debe cargarse explicitamente; sin el, el modelo solo procesa texto. Los limites reales de resolucion de imagen, numero de frames y duracion de video no se detallan.
- Procedencia de la cuantizacion: se trata de una cuantizacion de terceros (vmarcelo), no oficial, aunque el autor publique las recetas por tensor y la importance matrix para permitir su reproduccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vmarcelo/Swift-Qwen3.8-27B-MIX_GGUF
- README del repositorio: https://huggingface.co/vmarcelo/Swift-Qwen3.8-27B-MIX_GGUF/blob/main/README.md
- Modelo base (ukisai/Swift-Qwen3.8-27b): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Release oficial GGUF de Swift 1.5 (recomendada por el autor): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo upstream (Qwen/Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Anuncio de Swift en el blog de UkisAI: https://ukisai.com/news/introducing-swift
- Ficha en LLM Explorer: https://llm-explorer.com/model/vmarcelo%2FQwen3.8-27B-MIX_GGUF,2cxXuLLPaW4SkjnzNBvwuX
- Ficha en GenAiHub: https://genaihub.net/agents/hf-model-vmarcelo-qwen3-8-27b-mix-gguf
