# SusanHill/zils-mini-s3p

## Resumen

zils-mini-s3p es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-4B, publicado por el usuario SusanHill bajo licencia Apache-2.0. Se presenta como un "student" destilado mediante LoRA de rango 64 a partir de las probabilidades de un profesor denominado vllm-sr/d3-flash, combinadas en una proporcion 30/70 con etiquetas gold publicas (solo splits de entrenamiento). El modelo esta etiquetado con los tags `zils` y `decision`, lo que sugiere un uso orientado a tareas de decision o clasificacion, aunque la model card no detalla la tarea concreta.

El modelo cuenta con 4.539.265.536 parametros totales (segun los pesos en safetensors) y un repositorio de 9,1 GB, lo que es coherente con pesos en precision completa (fp32) o bf16 mas checkpoints intermedios. La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso, aunque el tag `qwen3_5` y el uso de `custom_code` indican que requiere codigo personalizado para cargarse.

La relevancia de este modelo es limitada por el momento: cero descargas y cero likes en el momento de la consulta, publicacion reciente (noviembre de 2026) y una model card extremadamente escueta que no documenta datos de entrenamiento, benchmarks ni casos de uso. Es un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B), con codigo personalizado (`custom_code`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.500 millones de parametros. El ajuste se realizo mediante LoRA de rango 64, segun la model card, lo que implica que solo se entrenaron adaptadores de baja dimensionalidad sobre el modelo base. La innovacion declarada es la destilacion: las probabilidades del profesor vllm-sr/d3-flash se mezclan en una proporcion 30/70 con etiquetas gold publicas, usando unicamente los splits de entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

El tag `custom_code` indica que la carga del modelo requiere codigo especifico del autor (probablemente para manejar la cabeza de decision o los adaptadores LoRA fusionados). No se documenta si el modelo conserva la cabeza de lenguaje original de Qwen3.5-4B o si se sustituyo por una cabeza de clasificacion/decision. Tampoco se detalla la funcion de perdida exacta de la destilacion (KL divergence, cross-entropy mezclada, etc.).

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque no verificadas en la model card.
- Tarea de decision: el tag `decision` sugiere capacidad de clasificacion o seleccion entre opciones, pero no se especifica el dominio ni el formato de salida.
- Destilacion de profesor: el modelo ha aprendido de las distribuciones de probabilidad de vllm-sr/d3-flash, lo que puede mejorar la calibracion en la tarea objetivo.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Clasificacion o decision supervisada en dominios donde se disponga de etiquetas gold: el modelo se puede usar como clasificador fine-tuned, aprovechando la mezcla 30/70 de probabilidades del profesor y etiquetas reales para tareas de etiquetado.
- Destilacion de un profesor mayor: sirve como student ligero (4,5B) para replicar el comportamiento de vllm-sr/d3-flash en entornos con menos recursos, aunque no se documenta el tamano del profesor.
- Investigacion sobre destilacion con mezcla de probabilidades y etiquetas: el checkpoint es un artefacto util para estudiar el efecto de la proporcion 30/70 en la calidad del student.
- Prototipado rapido de tareas de decision: al estar basado en Qwen3.5-4B, puede ejecutarse en una sola GPU consumer y servir como baseline en experimentos.
- Evaluacion comparativa de tecnicas LoRA: el uso de LoRA-64 permite analizar el impacto del rango en la destilacion.
- Fine-tuning posterior: al ser Apache-2.0 y safetensors, se puede partir de el para ajustes adicionales en dominios especificos, siempre que se resuelva la dependencia de `custom_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB en bf16/fp16 (4,54B parametros x 2 bytes), mas overhead de activaciones y KV cache; en cuantizacion 8-bit unos 5 GB, en 4-bit unos 3 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40GB, H100, L40S para inferencia en precision completa; RTX 4090 (24GB) o RTX 3090 (24GB) para bf16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 (16GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI y llama.cpp son opciones habituales para modelos Qwen, pero la presencia de `custom_code` puede requerir `trust_remote_code=True` y verificar compatibilidad. No se documenta soporte oficial en Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-s3p | 4,54B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tuning LoRA-64 destilado, requiere custom_code |
| Qwen/Qwen3.5-4B | ~4B | no disponible en la informacion | no disponible en la informacion | Hugging Face (modelo base) | Modelo base oficial, sin destilacion |
| vllm-sr/d3-flash | no disponible | no disponible | no disponible | no disponible | Profesor usado en la destilacion; sin datos publicos en la informacion |

No se dispone de datos de rendimiento para comparar benchmarks entre estos modelos.

## Limitaciones y advertencias

- Model card extremadamente escueta: no documenta datos de entrenamiento, tarea objetivo, formato de salida ni evaluacion, lo que impide validar su calidad.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de que el modelo funcione correctamente.
- Requiere `custom_code`: la carga no es estandar y puede fallar en frameworks que no soporten el codigo del autor.
- Riesgo de alucinacion: al derivar de un modelo de lenguaje, conserva los riesgos del base, agravados por la falta de evaluacion.
- Sesgos desconocidos: no se documenta la composicion del dataset ni los sesgos potenciales.
- Idiomas no declarados: no se puede garantizar soporte multilingue.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Fecha de publicacion futura (2026-11-25): verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- Posible desalineacion entre los tags (`decision`) y la funcionalidad real: no hay ejemplos de uso ni pruebas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-mini-s3p
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor referenciado: vllm-sr/d3-flash (sin URL publica en la informacion disponible)
