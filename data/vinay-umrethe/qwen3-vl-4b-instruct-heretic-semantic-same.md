# VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same

## Resumen

VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same es una version "decensored" (abliterated) del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicada por el usuario VINAY-UMRETHE. El modelo base pertenece a la familia Qwen3-VL de Alibaba, que combina un transformer denso de 4.437.815.808 parametros con un codificador visual (ViT) para tareas de imagen-texto-a-texto (image-text-to-text). La modificacion se ha realizado con Heretic v1.4.0, una herramienta de ablacion direccional que elimina las direcciones del espacio de activaciones asociadas a comportamientos de rechazo, reduciendo drasticamente las negativas del modelo sin reentrenarlo.

La relevancia de esta ficha es doble. Por un lado, el modelo hereda las capacidades de la generacion Qwen3-VL: contexto nativo de 256K tokens ampliable a 1M, comprension de video de larga duracion, OCR en 32 idiomas, agentes visuales capaces de operar interfaces graficas y grounding espacial 2D/3D. Por otro, la intervencion de Heretic reduce los rechazos de 97/100 a 3/100 en la metrica reportada por el autor, con una divergencia KL de 0.0706 respecto al modelo original, lo que indica una alteracion relativamente contenida de la distribucion de salida.

El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, con un tamano de repositorio de 8,9 GB. Es un modelo denso (no MoE) de ~4,4B parametros, pensado para despliegue en GPU de consumo con cuantizacion o en bf16 en GPUs de 16 GB o mas. No se han publicado resultados de benchmarks academicos estandar en la informacion disponible; los unicos datos de rendimiento aportados son las metricas de rechazo y divergencia KL del propio proceso de abliteracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal Qwen3-VL (qwen3_vl) con codificador visual ViT; Interleaved-MRoPE, DeepStack y Text-Timestamp Alignment |
| Parametros totales | 4.437.815.808 (~4,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens nativa, ampliable a 1M |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; la cuantizacion queda a cargo del usuario) |
| Idiomas soportados | no disponible para el modelo; el OCR del base soporta 32 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 8,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-VL-4B-Instruct original: un transformer denso para texto combinado con un codificador visual tipo ViT, con fusion texto-vision. Qwen3-VL introduce tres novedades tecnicas destacables: Interleaved-MRoPE, que reparte la asignacion de frecuencias sobre tiempo, anchura y altura para mejorar el razonamiento en video de horizonte largo; DeepStack, que fusiona caracteristicas de multiples niveles del ViT para afinar el alineamiento imagen-texto; y Text-Timestamp Alignment, que sustituye a T-RoPE para lograr una localizacion temporal precisa de eventos en video. El base soporta ventana nativa de 256K tokens ampliable a 1M, con decodificacion autoregresiva estandar.

Sobre el entrenamiento original no se aportan detalles en la informacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se documenta es el proceso de modificacion: el autor aplico Heretic v1.4.0 para ablacionar direcciones de rechazo, con parametros concretos sobre las proyecciones de atencion y MLP. En `attn.o_proj` se aplicaron pesos de max_weight 1.17 (posicion 22.09) y min_weight 1.16 (distancia 14.55); en `mlp.down_proj`, max_weight 1.42 (posicion 29.68) y min_weight 0.76 (distancia 19.22); el direction_index fue 18.93. El modelo se declara reproducible, con instrucciones en el directorio `reproduce` del repositorio. No se indica ningun reentrenamiento posterior a la ablacion.

## Capacidades

- Generacion de texto y comprension de lenguaje a nivel comparable a LLM puros, con fusion texto-vision sin perdida segun el autor.
- Comprension de imagen: descripcion, reconocimiento amplio (personajes, anime, productos, monumentos, flora y fauna), razonamiento visual y grounding espacial 2D y 3D.
- Comprension de video de larga duracion (horas) con recuperacion completa e indexado a nivel de segundo gracias al contexto de 256K-1M.
- OCR ampliado a 32 idiomas, robusto ante poca luz, desenfoque e inclinacion, con mejor manejo de caracteres raros o antiguos y jerga, y analisis de estructura de documentos largos.
- Agente visual: reconoce elementos de interfaces PC/movil, entiende su funcion, invoca herramientas y completa tareas.
- Codigo visual: genera Draw.io, HTML, CSS y JavaScript a partir de imagenes o videos.
- Razonamiento multimodal en STEM y matematicas con analisis causal y respuestas basadas en evidencia.
- Soporte de tool calling / function calling a traves de la plantilla de chat (heredado del base).
- Razonamiento multi-paso y uso como agente (capacidades de agent interaction del base).
- Modo de pensamiento (thinking) disponible en la edicion Thinking del base; esta edicion concreta es Instruct.
- Capacidad multilingue de texto heredada del base, aunque no se especifica la lista exacta de idiomas.
- Comportamiento con rechazos reducidos de forma sustancial (3/100) respecto al original (97/100).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con adjuntos de imagen (capturas de pantalla, fotos de producto) y ventanas de contexto de hasta 256K tokens, lo que permite arrastrar historiales largos sin truncar.
- Agente de automatizacion de interfaces: reconocimiento de elementos en pantallas de PC o movil e invocacion de herramientas para completar tareas de RPA o testing de UI, aprovechando la capacidad de visual agent.
- Extraccion de datos de documentos: OCR en 32 idiomas con analisis de estructura de documentos largos, util para digitalizacion de facturas, contratos o formularios con jerga tecnica.
- Analisis de video de vigilancia o deportivo: indexado de eventos a nivel de segundo sobre videos de horas, gracias al contexto extendido y al Text-Timestamp Alignment.
- Generacion de codigo a partir de maquetas: convertir imagenes de disenos en HTML, CSS, JS o diagramas Draw.io dentro de pipelines de front-end.
- Asistencia en STEM y educacion: resolucion de problemas de matematicas y fisica con razonamiento multimodal sobre diagramas, graficos o pizarras fotografiadas.
- Moderacion o generacion de contenido sin filtros de rechazo: escenarios de escritura creativa, roleplay o investigacion sobre sesgos donde el comportamiento abliterado evita negativas sistematicas (con las advertencias eticas correspondientes).
- Despliegue en el borde (edge): con 4,4B parametros y cuantizacion a 4 bits, puede ejecutarse en GPUs de consumo o dispositivos con aproximadamente 3-5 GB de VRAM, habilitando aplicaciones locales de vision-lenguaje.

## Benchmarks y rendimiento

Los unicos datos de rendimiento aportados por el autor son los del proceso de abliteracion. No se publican resultados de benchmarks academicos estandar (MMLU, MMMU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Este modelo | Qwen/Qwen3-VL-4B-Instruct (original) |
|---|---|---|
| Divergencia KL | 0.0706 | 0 (por definicion) |
| Rechazos | 3/100 | 97/100 |

El modelo base referencia graficos de rendimiento multimodal y de texto puro (imagenes alojadas en qianwen-res.oss-accelerate.aliyuncs.com) sin cifras textuales en la informacion proporcionada; no se reproducen aqui por no estar disponibles los valores numericos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 8,9 GB solo de pesos, mas activaciones y cache KV; presupuestar 12-16 GB para inferencia comoda.
- VRAM estimada con cuantizacion a 8 bits: ~5 GB de pesos.
- VRAM estimada con cuantizacion a 4 bits: ~3 GB de pesos.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion 4/8 bits (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090). En bf16 completo requiere 16 GB o mas (RTX 4080/4090, A100, H100) o reparto por `device_map="auto"`.
- GPU recomendadas para produccion: A100 40/80 GB, H100 80 GB, L40S, o multiples RTX 4090 para throughput.
- Opciones de despliegue: Transformers (con `Qwen3VLForConditionalGeneration` y `AutoProcessor`), vLLM, TGI y llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los pesos. El autor recomienda flash_attention_2 para aceleracion y ahorro de memoria en escenarios multi-imagen y video.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota de version: el codigo Qwen3-VL requiere la ultima version de transformers (recomendado instalar desde el repositorio o transformers 4.57.0).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-heretic-Semantic-Same (este) | ~4,4B densos | 256K-1M | 3/100 rechazos | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3-VL-4B-Instruct | ~4,4B densos | 256K-1M | 97/100 rechazos | apache-2.0 | HuggingFace (modelo oficial de referencia) |
| Qwen/Qwen3-VL-8B-Instruct | ~8B densos | 256K-1M | no disponible | apache-2.0 | HuggingFace (version superior de la familia) |

Los datos de rendimiento comparativo entre estos modelos no estan publicados en la informacion disponible, salvo las metricas de rechazo y divergencia KL. No se dispone de comparativas numericas de MMLU, MMMU u otros benchmarks.

## Limitaciones y advertencias

- La abliteracion elimina direcciones de rechazo de forma global, lo que puede degradar la capacidad del modelo para negarse ante peticiones peligrosas, ilegales o daninas; no debe desplegarse en produccion sin capas de moderacion externas.
- La divergencia KL de 0.0706 indica una desviacion no nula respecto al modelo original; puede haber perdida de calidad o coherencia en algunas tareas, especialmente las que dependian de comportamientos de seguridad.
- Riesgo de alucinacion inherente a la familia Qwen3-VL, no cuantificado en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo; los sesgos del dataset original persisten y la abliteracion puede amplificar ciertos sesgos al eliminar filtros de salida.
- Idiomas soportados no especificados en la ficha del modelo; aunque el OCR cubre 32 idiomas, la lista de idiomas de generacion de texto no esta declarada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento resultante tras la ablacion.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validacion por la comunidad ni de pruebas independientes.
- Requiere la version mas reciente de transformers para el soporte de la clase `Qwen3VLForConditionalGeneration`; versiones antiguas pueden fallar al cargar el modelo.
- El modelo base Qwen3-VL-4B-Instruct tiene una edicion Thinking (reasoning) separada; esta edicion es Instruct y no incorpora el modo de razonamiento extendido del base Thinking.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Heretic (proyecto de abliteracion): https://heretic-project.org
- Qwen Chat (demo): https://chat.qwenlm.ai/
- Referencia arXiv 2505.09388: https://arxiv.org/abs/2505.09388
- Referencia arXiv 2502.13923: https://arxiv.org/abs/2502.13923
- Referencia arXiv 2409.12191: https://arxiv.org/abs/2409.12191
- Referencia arXiv 2308.12966: https://arxiv.org/abs/2308.12966
- Documentacion de transformers: https://github.com/huggingface/transformers
