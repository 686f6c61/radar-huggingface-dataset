# xsdfasfgsa/Starlord-2B-preview

## Resumen

Starlord-2B-preview es un modelo derivado de Qwen/Qwen3.5-2B publicado por el usuario xsdfasfgsa en Hugging Face. A diferencia de un modelo generativo convencional, se presenta como un "modelo de decisión": procesa conjuntamente un estado y un conjunto de preguntas con opciones candidatas en un único forward pass, lee las probabilidades de los logits correspondientes a las opciones y devuelve una elección, sin generar texto token a token. El modelo tiene 2.213.241.664 parámetros totales (2,2 mil millones) y un repositorio de 4,4 GB en formato safetensors.

El modelo se apoya en el checkpoint Qwen/Qwen3.5-2B (revisión 15852e8c16360a2fea060d615a32b45270f8a8fc) y está empaquetado con un pipeline de inferencia propio (`decision_index`) que requiere dependencias específicas: PyTorch 2.10.0+cu130, Transformers 5.3.0, Accelerate 1.15.0, FlashAttention 2.8.3 y flash-linear-attention 0.4.1. La arquitectura subyacente se etiqueta como `qwen3_5`, lo que sugiere un transformer con componentes de atención lineal, aunque la model card no detalla la arquitectura interna.

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos: en lugar de producir texto, evalúa directamente opciones candidatas (hasta 512 por pregunta) sobre entradas de hasta 131.072 tokens. Es un modelo preview, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, por lo que debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer derivado de Qwen/Qwen3.5-2B, con dependencia de flash-linear-attention) |
| Parametros totales | 2.213.241.664 (2,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por petición conjunta |
| Tipos de cuantizacion | no disponible (solo se documenta BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-2B, un transformer de 2,2 mil millones de parámetros. La model card no describe el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si hubo RLHF, DPO o cualquier otra fase de alineamiento. Tampoco se detalla el proceso de ajuste que convierte el modelo base en un "modelo de decisión". La etiqueta `qwen3_5` y la dependencia de `flash-linear-attention` y `fla-core` apuntan a que el backbone incorpora capas de atención lineal, pero no se aporta información adicional sobre la proporción de capas ni sobre innovaciones de decodificación.

La innovación principal declarada es el modo de inferencia: el modelo no genera tokens (0 tokens generados), sino que procesa el estado y todas las preguntas de forma conjunta en un único forward pass, con la caché KV desactivada, y lee las probabilidades de los logits de las opciones candidatas mediante un softmax en FP32 con temperatura 1.0. El pipeline `decision_index` (edición 0.3) orquesta esta evaluación y utiliza un "scorer" con código de evaluación oficial cuyos resultados se publican en `evaluation/public_metrics_summary.json`.

## Capacidades

- Evaluación de decisiones por elección entre opciones candidatas: hasta 512 opciones por pregunta.
- Procesamiento conjunto de estado y preguntas en un solo forward pass, sin generación autoregresiva.
- Manejo de entradas largas de hasta 131.072 tokens por petición conjunta.
- Lectura de probabilidades sobre el vocabulario original del modelo base (candidate logits).
- Inferencia en BF16 sobre GPU CUDA compatible con FlashAttention.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio, modo thinking ni multilingüismo.
- No se documenta generación de texto libre: el modelo está diseñado explícitamente para no generar tokens.

## Casos de uso

- Clasificación y enrutamiento de consultas: dado un estado (por ejemplo, el historial de una conversación) y un conjunto de categorías candidatas, el modelo devuelve la opción más probable en un solo paso, útil para triaje de tickets o enrutado a departamentos.
- Evaluación de respuestas en pipelines de RLHF o benchmarking: el modelo puede puntuar o seleccionar entre respuestas candidatas generadas por otro modelo, actuando como juez de elección múltiple con contexto largo.
- Selección de herramientas o acciones en un agente: planteando las herramientas disponibles como opciones candidatas (hasta 512), el modelo elige la acción a ejecutar sin necesidad de generar texto estructurado.
- Análisis de documentos extensos con preguntas de opción múltiple: gracias a los 131.072 tokens de contexto, puede evaluar un documento completo junto con preguntas y opciones en una sola pasada.
- Filtrado y moderación de contenido: clasificar textos o conversaciones en categorías predefinidas de riesgo o cumplimiento normativo mediante elección entre opciones.
- Experimentación en investigación sobre modelos de decisión: sirve como artefacto de referencia para estudiar paradigmas de inferencia sin generación y comparar con LLM generativos en tareas de elección.
- Evaluación de sistemas de recomendación o ranking: presentar ítems candidatos como opciones y obtener la preferencia del modelo sobre un estado de usuario dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un fichero `evaluation/public_metrics_summary.json` con las métricas del scorer oficial, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- GPU documentada por el autor: 1 × NVIDIA H800 en BF16, con un proceso único y una petición a la vez (batch size 1).
- El autor indica que se requiere una GPU CUDA compatible con BF16 y memoria suficiente, además de FlashAttention compatible.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 4,4 GB en safetensors, por lo que en BF16 los pesos requieren aproximadamente 4,4 GB, a lo que hay que sumar el estado de activación para entradas de hasta 131.072 tokens, que puede ser considerable.
- No se confirma que quepa en GPU de consumo (RTX 4090, etc.); dado el requisito de FlashAttention y la longitud de contexto máxima, el autor solo valida H800.
- Opciones de despliegue: pipeline propio `decision_index` (edición 0.3) con `direct_engine:DirectEngine`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor especifica ejecución de una petición a la vez con batch size 1, lo que sugiere un enfoque de evaluación más que de servicio de alto rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modo de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Starlord-2B-preview | 2,2 B | 131.072 tokens | Elección entre opciones, sin generación | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (base) | ~2 B (según modelo base) | no disponible en la información | Generación de texto | no disponible en la información | Hugging Face |
| Alternativas de 2B generativas | ~2 B | variable | Generación autoregresiva | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la misma categoría (modelos de decisión sin generación), por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo en estado preview, con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- No declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor o asumirse riesgo legal.
- No se especifican los idiomas soportados; el comportamiento multilingüe es desconocido.
- No se documenta el proceso de entrenamiento ni el dataset, por lo que no pueden evaluarse sesgos conocidos.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto), pero sí riesgo de elecciones incorrectas o mal calibradas sin métricas públicas verificables en la información disponible.
- Requiere dependencias muy específicas (PyTorch 2.10.0+cu130, Transformers 5.3.0, FlashAttention 2.8.3, flash-linear-attention 0.4.1) y una GPU H800 validada, lo que limita la portabilidad.
- La caché KV está desactivada y el batch size es 1, lo que restringe el throughput en escenarios de alta concurrencia.
- El límite de 512 opciones por pregunta y de 131.072 tokens por petición conjunta acota los casos de uso posibles.
- No se documenta soporte para cuantización, por lo que el despliegue en hardware de menor capacidad no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xsdfasfgsa/Starlord-2B-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Repositorio del pipeline de inferencia: https://github.com/apolinario/decision-index
- Métricas de evaluación (referenciadas en la model card): evaluation/public_metrics_summary.json
- Dependencias de inferencia (referenciadas en la model card): inference/requirements.txt
