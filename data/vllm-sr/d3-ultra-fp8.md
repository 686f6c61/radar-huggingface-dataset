# vllm-sr/d3-ultra-FP8

## Resumen

d3-ultra-FP8 es la versión cuantizada en FP8 de d3-ultra, un modelo fundacional multimodal de decisión de 26.090 millones de parámetros desarrollado por vllm-sr dentro de la familia Decision 3.0. A diferencia de un modelo generativo convencional, d3-ultra no produce texto libre: recibe un estado de entrada (texto o JSON, opcionalmente acompañado de imágenes y vídeos) y un conjunto de preguntas tipificadas (elección múltiple, sí/no, puntuación, caja delimitadora o seguimiento), y devuelve una probabilidad calibrada para cada respuesta posible tras una única lectura del input.

La relevancia de esta variante FP8 es doble. Por un lado, reduce el peso en disco de 52,2 GB a 31,9 GB manteniendo la fidelidad funcional: 71,52 frente a 71,57 en el índice público Jev Decision Index 0.3, con la misma respuesta top en el 99,3% de 272.229 preguntas. Por otro, mejora la latencia mediana de 51 ms a 40 ms por pregunta de texto en una AMD Instinct MI300X, lo que la hace atractiva para despliegues de clasificación y enrutamiento a gran escala.

El modelo se apoya en una arquitectura híbrida con capas de atención lineal Gated DeltaNet, incorpora un codificador visual de 0,46B parámetros y se distribuye bajo licencia Apache-2.0 con pesos en safetensors y formato compressed-tensors. Está pensado para su uso dentro de runtimes especializados como vLLM Semantic Router o el cargador propio `d3q`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal Gated DeltaNet y codificador visual; familia Qwen3.5 según tags |
| Parametros totales | 26.085.330.160 (26,09B), incluidos 0,46B del codificador visual |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 W8A8 (compressed-tensors `float-quantized`, FP8_DYNAMIC): pesos E4M3 con una escala BF16 por canal de salida; activaciones cuantizadas a FP8 por token en tiempo de ejecución; 304 proyecciones cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con compressed-tensors (FP8), runtime propio `d3q`; requiere `trust_remote_code` |

## Arquitectura y entrenamiento

d3-ultra-FP8 es una cuantización del checkpoint d3-ultra publicado el 2026-10-24. La arquitectura subyacente combina capas de atención lineal del tipo Gated DeltaNet con un codificador visual de 0,46B parámetros, lo que permite procesar texto, JSON, imágenes y vídeos en una sola pasada. El modelo no genera secuencias token a token: ejecuta una lectura del estado de entrada y aplica una cabeza de decisión (readout en FP32) que produce distribuciones de probabilidad sobre las opciones o etiquetas solicitadas.

La cuantización FP8 afecta a 304 proyecciones del decoder, manteniendo sin cambios las proyecciones de entrada de Gated DeltaNet, el vision tower, los embeddings y el readout. No se utilizaron datos de calibración: las escalas de pesos se derivan directamente de los pesos y las de activaciones se calculan por petición en tiempo de ejecución. El resultado son 31,9 GB de pesos frente a los 52,2 GB del modelo original, con una degradación mínima en las métricas de decisión. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Clasificación zero-shot y decisión sobre opciones múltiples con probabilidades calibradas por respuesta.
- Preguntas de sí/no (`noul`) con probabilidad asociada.
- Puntuación en escalas numéricas.
- Detección de objetos mediante cajas delimitadoras (`box`) con precisión medida a IoU 0,5.
- Seguimiento de objetos en vídeo (`track`) con métrica de éxito AUC.
- Procesamiento multimodal de imágenes y vídeos, varios por petición.
- Imágenes embebidas dentro de las preguntas y de las opciones (por ejemplo, comparación visual entre alternativas).
- Múltiples preguntas resueltas en una sola lectura del input, con coste amortizado.
- Entrada en texto plano o JSON estructurado.
- Integración con vLLM Semantic Router para enrutamiento y verificación de paquetes.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones multi-turno.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta de tipo `choice` con criterios como facturación o soporte técnico, devolviendo la probabilidad de cada cola. La latencia de 40 ms permite clasificar en tiempo real dentro de un pipeline de atención al cliente.
- Moderación y verificación de contenido: preguntas de tipo `noul` sobre si un texto o imagen cumple una política concreta, con umbral de probabilidad configurable para derivar casos ambiguos a revisión humana.
- Detección y localización de objetos en imágenes: consultas `box` para identificar elementos concretos en una fotografía, útil en inspección visual industrial o catalogación automática de imágenes.
- Seguimiento de objetos en vídeo: consultas `track` para monitorizar la presencia y trayectoria de un objeto a lo largo de un clip, aplicable a análisis de grabaciones de seguridad o deportivas.
- Evaluación visual comparativa: preguntas de elección múltiple cuyas opciones son imágenes (por ejemplo, seleccionar el plano o el diseño que coincide con una referencia), aprovechando el soporte de assets dentro de preguntas y opciones.
- Clasificación por lotes de documentos JSON: procesar registros estructurados con varias preguntas por registro en una sola pasada, adecuado para pipelines de enriquecimiento de datos donde el coste por lectura debe minimizarse.
- Sistemas de decisión "system-one": arquitecturas de agente que necesitan una respuesta rápida y probabilística (sí/no, ruta, puntuación) antes de invocar un modelo generativo más costoso.

## Benchmarks y rendimiento

| Benchmark | d3-ultra-FP8 | d3-ultra | Notas |
|---|---|---|---|
| Jev Decision Index 0.3 (suite pública) | 71,52 | 71,57 | Todas las áreas dentro de 0,3 puntos; misma respuesta top en 99,3% de 272.229 preguntas |
| Suite pública de visión | 75,51 | 75,35 | Misma GPU; misma respuesta top en 97,7% de 12.210 preguntas |
| Box accuracy a IoU 0,5 | 0,871 | 0,870 | Detección de cajas |
| Track success AUC | 0,774 / 0,780 | 0,778 / 0,782 | Seguimiento en vídeo |
| Imágenes en preguntas y opciones | 0,952 | 0,952 | Comparación visual |
| Latencia mediana (1 pregunta de texto, MI300X) | 40 ms | 51 ms | Una AMD Instinct MI300X |
| Peso en disco | 31,9 GB | 52,2 GB | Reducción del 38,9% |

## Requisitos de hardware

- Unidades de matriz FP8 imprescindibles: AMD Instinct MI300 / MI350 o NVIDIA con compute capability 8.9 o superior (Ada Lovelace, Hopper, Blackwell).
- VRAM estimada: los pesos ocupan 31,9 GB, por lo que se necesita al menos una GPU de 40 GB para inferencia básica; con overhead de activaciones y KV cache conviene 48 GB o más.
- GPU recomendadas: AMD Instinct MI300X (medido por el autor), NVIDIA H100, H200, B200 o L40S. En consumer, las RTX 4090 (24 GB) no pueden alojar el modelo completo en una sola tarjeta.
- Despliegue: runtime propio `d3q` con transformers 5.17.0 y compressed-tensors 0.17.0; opcionalmente `flash-linear-attention` para kernels rápidos de atención lineal. Integración con vLLM Semantic Router. `AutoModel.from_pretrained(..., trust_remote_code=True)` por sí solo no ejecuta pesos FP8.
- Latencia medida: 40 ms medianos por pregunta de texto en una MI300X, frente a 51 ms del modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-ultra-FP8 | 26,09B | No disponible | Decisión multimodal (FP8) | Apache-2.0 | Hugging Face, vLLM Semantic Router |
| d3-ultra | 26,09B | No disponible | Decisión multimodal (BF16) | Apache-2.0 | Hugging Face |
| Modelos de clasificación zero-shot tipo CLIP/BLIP | Variable (frecuentemente <1B) | No disponible | Clasificación imagen-texto | Variable | Hugging Face |

No se dispone de datos de benchmarks de terceros que permitan una comparación cuantitativa directa con alternativas de la misma categoría. La comparación más significativa es interna, frente al propio d3-ultra sin cuantizar, donde la variante FP8 mantiene el rendimiento dentro de 0,3 puntos en todas las áreas del índice.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no mantiene diálogo multi-turno y no puede usarse como chatbot.
- Requiere hardware con soporte de matriz FP8; no funciona en GPUs anteriores a Ada Lovelace ni en CPUs convencionales.
- La carga exige el runtime `d3q` y versiones específicas de transformers y compressed-tensors; `AutoModel` estándar no es suficiente.
- La cuantización FP8 puede introducir divergencias menores en casos límite, aunque las métricas publicadas muestran degradación mínima.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar su comportamiento en dominios o lenguas específicas.
- Riesgo de alucinación reducido por diseño (no genera texto), pero las probabilidades de decisión pueden estar mal calibradas en entradas fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan restricciones adicionales ni cláusulas de responsabilidad.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, por lo que la validación comunitaria es todavía inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-sr/d3-ultra-FP8
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- vLLM Semantic Router: https://github.com/vllm-project/semantic-router
