# vllm-sr/d3-ultra-FP8

## Resumen

d3-ultra-FP8 es la versión cuantizada en FP8 de d3-ultra, un modelo fundacional multimodal de decisión de 26.090 millones de parámetros (incluido un codificador visual de 460 millones) desarrollado por el equipo vllm-sr dentro de la familia Decision 3.0. A diferencia de un modelo generativo al uso, d3-ultra no produce texto libre: recibe un estado de entrada (texto o JSON, opcionalmente con imágenes y vídeos) y un conjunto de preguntas tipadas, y devuelve una probabilidad calibrada para cada respuesta posible (elección entre opciones, sí/no, puntuación en escala, caja delimitadora o seguimiento en vídeo).

La relevancia de esta variante FP8 es práctica: reduce el peso en disco de 52,2 GB a 31,9 GB y mejora la latencia mediana de 51 ms a 40 ms por pregunta de texto en una AMD Instinct MI300X, manteniendo prácticamente idéntico el rendimiento según el autor (71,52 frente a 71,57 en el índice público Jev Decision Index 0.3, con coincidencia en la respuesta principal en el 99,3% de 272.229 preguntas). Está pensada para despliegues de enrutamiento y clasificación en producción donde el coste por inferencia y la huella de memoria importan.

La cuantización es W8A8 con pesos E4M3 y una escala BF16 por canal de salida, dejando sin cuantizar las proyecciones de entrada del Gated DeltaNet, el torreón visual, los embeddings y el readout. La licencia es Apache-2.0 y el formato de pesos es safetensors con `compressed-tensors`, requiriendo hardware con unidades matriciales FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal Gated DeltaNet y codificador visual; modelo de decisión (system-one) |
| Parametros totales | 26.085.330.160 (26,09B), incluidos 0,46B del codificador visual |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 W8A8 (compressed-tensors `float-quantized`, FP8_DYNAMIC): pesos E4M3 con escala BF16 por canal de salida, activaciones cuantizadas a FP8 por token en tiempo de ejecución; 304 proyecciones cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (FP8), requiere `custom_code` y `trust_remote_code` |

## Arquitectura y entrenamiento

d3-ultra-FP8 hereda la arquitectura del modelo base d3-ultra (release del 24 de octubre de 2026): un transformer híbrido que combina capas de atención lineal Gated DeltaNet con atención estándar, más un codificador visual de 0,46B de parámetros para procesar imágenes y vídeos. El modelo no genera texto: su cabeza de salida es un readout en FP32 que produce probabilidades por cada opción o respuesta planteada, lo que lo convierte en un modelo de decisión de "system-one" (respuesta directa, sin cadena de razonamiento explícita).

La cuantización afecta a 304 proyecciones del decodificador, que pasan a FP8 W8A8; las proyecciones de entrada del Gated DeltaNet, el torreón visual, los embeddings y el readout se mantienen en su precisión original. No se usaron datos de calibración: las escalas de pesos se derivan de los propios pesos y las de activaciones se calculan por petición en tiempo de ejecución. El modelo base fue entrenado con datos multimodales (texto, imagen y vídeo) para tareas de clasificación zero-shot, detección de objetos y seguimiento, aunque el autor no detalla el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el runtime `d3q`, que sustituye el cargador del backbone por capas que cuantizan la entrada a FP8 por fila con un kernel Triton y multiplican con `torch._scaled_mm`.

## Capacidades

- Clasificación zero-shot y elección entre múltiples opciones con probabilidad calibrada por opción.
- Respuestas booleanas (sí/no) con probabilidad asociada.
- Puntuación en escala numérica para una entrada dada.
- Detección de objetos mediante cajas delimitadoras (Box), con precisión reportada de 0,871 a IoU 0,5.
- Seguimiento de objetos en vídeo (Track), con AUC de éxito de 0,774 / 0,780.
- Procesamiento multimodal: texto, JSON, imágenes y vídeos, varios por petición; las imágenes pueden aparecer dentro de las preguntas y de las opciones.
- Lectura única de la entrada por petición con respuesta a todas las preguntas formuladas en esa misma lectura (eficiencia multi-pregunta).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo es explícitamente "system-one", sin cadena de razonamiento.
- Capacidades multilingües: no disponible.
- Modo thinking, audio: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de que corresponda a facturación, soporte técnico u otra cola, con una sola lectura del ticket y latencia de decenas de milisegundos, adecuado para clasificadores en línea de alta concurrencia.
- Moderación y triaje de contenido: preguntas de tipo sí/no ("¿el cliente pide una solución urgente?", "¿el mensaje contiene una queja?") evaluadas sobre el mismo estado en una única pasada, lo que reduce el coste frente a invocar un LLM generativo por cada criterio.
- Control de calidad visual en producción: detección de objetos (Box) en imágenes de línea de montaje o inventario, con umbrales de confianza calibrados y precisión de 0,871 a IoU 0,5, integrable en pipelines de inspección automatizada.
- Análisis de vídeo para seguridad o logística: seguimiento de personas u objetos (Track) en secuencias de cámara, con AUC de éxito en torno a 0,77-0,78, para conteo, alertas de intrusión o monitorización de flujos.
- Búsqueda visual y verificación documental: comparación de una imagen de consulta contra varias opciones (por ejemplo, identificar el grabado que representa el mismo edificio que una foto), con probabilidad por opción; útil en archivos, catálogos y peritajes.
- Puntuación de relevancia en motores de recomendación o RAG: asignar una nota en escala a pares consulta-documento o consulta-imagen para reordenar resultados antes de un reranking más costoso.
- Despliegue como clasificador en el vLLM Semantic Router: el runtime carga d3-ultra-FP8 igual que el modelo base y permite usarlo como decisor de enrutamiento dentro de una infraestructura de serving existente.

## Benchmarks y rendimiento

| Benchmark | d3-ultra-FP8 | d3-ultra (base) |
|---|---|---|
| Jev Decision Index 0.3 (suite pública) | 71,52 | 71,57 |
| Suite pública de visión | 75,51 | 75,35 |
| Box accuracy a IoU 0,5 | 0,871 | 0,870 |
| Tracking success AUC | 0,774 / 0,780 | 0,778 / 0,782 |
| Imágenes en preguntas y opciones | 0,952 | 0,952 |
| Coincidencia con la respuesta principal de d3-ultra | 99,3% de 272.229 preguntas | — |
| Coincidencia en suite de visión | 97,7% de 12.210 preguntas | — |
| Latencia mediana (1 pregunta de texto, MI300X) | 40 ms | 51 ms |
| Peso en disco | 31,9 GB | 52,2 GB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos en la información disponible, lo cual es coherente con que el modelo no sea generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 31,9 GB solo para pesos; con overhead de activaciones y contexto conviene prever 40-48 GB en FP8. No se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: AMD Instinct MI300 / MI350 series (medido en una MI300X) o NVIDIA con compute capability 8.9 o superior (Ada Lovelace y Hopper: L4, L40S, H100, H200, etc.).
- Compatibilidad con GPU de consumo: no confirmada; las RTX 4090 (compute capability 8.9) disponen de unidades FP8, pero el peso de 31,9 GB no cabe en sus 24 GB de VRAM sin estrategias adicionales no documentadas.
- Opciones de despliegue: runtime propio `d3q` con `load_d3` (transformers 5.17.0, compressed-tensors >= 0.17, Triton, flash-linear-attention opcional) y vLLM Semantic Router. `AutoModel.from_pretrained(..., trust_remote_code=True)` por sí solo no ejecuta los pesos FP8.
- Latencia y throughput: 40 ms de mediana por pregunta de texto individual en una MI300X (frente a 51 ms del modelo base). No se han publicado cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-ultra-FP8 | 26,09B (0,46B visión) | No disponible | Decisión multimodal (clasificación, box, track) | Apache-2.0 | Hugging Face |
| d3-ultra | 26,09B (0,46B visión) | No disponible | Decisión multimodal, pesos BF16 | Apache-2.0 | Hugging Face |
| Modelos de clasificación zero-shot tipo CLIP | No disponible | No disponible | Clasificación imagen-texto | Varía | Hugging Face |
| Detectores de objetos dedicados (p. ej. YOLO) | No disponible | No disponible | Detección y seguimiento | Varía | Repositorios propios |

No se dispone de información sobre alternativas comparables de la misma categoría (modelos fundacionales de decisión multimodales) en la documentación proporcionada; la comparación más directa y fiable es con el propio d3-ultra en BF16.

## Limitaciones y advertencias

- El modelo no genera texto libre ni razona paso a paso: solo responde a preguntas tipadas predefinidas; no es adecuado para tareas generativas.
- Riesgo de alucinación acotado pero presente: las probabilidades pueden ser altas en respuestas incorrectas, especialmente fuera de la distribución de entrenamiento; el autor no documenta calibración fuera de sus suites.
- Requiere hardware con unidades matriciales FP8 (compute capability 8.9 o superior, o AMD MI300/MI350); no funciona en GPUs más antiguas ni en CPU de forma práctica.
- El cargador estándar de transformers no ejecuta los pesos FP8: es obligatorio usar el runtime `d3q` o el vLLM Semantic Router, lo que limita la portabilidad.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe.
- Longitud de contexto no disponible; no se conocen límites para entradas largas o vídeos extensos.
- Sesgos conocidos: no documentados por el autor; al ser un modelo de decisión, los sesgos del dataset de entrenamiento pueden reflejarse en las probabilidades de clasificación.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y las dependencias (transformers 5.17.0, compressed-tensors, Triton) deben cumplir sus propias licencias.
- El modelo fue creado y actualizado en fechas futuras respecto a la información habitual (octubre-noviembre de 2026); verificar la vigencia de los artefactos antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-ultra-FP8
- Modelo base d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
- vLLM Semantic Router: https://github.com/vllm-project/semantic-router
