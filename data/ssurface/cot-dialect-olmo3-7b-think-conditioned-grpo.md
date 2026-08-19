# ssurface/cot-dialect-olmo3-7b-think-conditioned-grpo

## Resumen

Este modelo es un adaptador LoRA condicionado sobre el modelo base **allenai/Olmo-3-7B-Think**, desarrollado por el usuario `ssurface`. Su propósito es controlar el nivel de verbosidad (dialecto) del razonamiento *chain-of-thought* (CoT) mediante una instrucción explícita en el prompt, en lugar de usar adaptadores separados para cada nivel. El adaptador se entrena con GRPO sobre un modelo SFT previo, con el objetivo de comprimir o expandir el razonamiento según el nivel solicitado (L1 a L5). Es una pieza de investigación comparativa dentro de una colección más amplia de adaptadores per-level, y no está pensado como un modelo de producción recomendado. El modelo base Olmo-3-7B-Think pertenece a la familia Olmo 3, con arquitectura transformer de 7B parámetros y soporte para razonamiento largo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Olmo-3-7B-Think) + adaptador LoRA |
| Parámetros totales | No disponible (modelo base: 7B; adaptador: LoRA r=16, alpha=32) |
| Parámetros activos | No disponible (adaptador LoRA; no se especifica número exacto) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo según el paper, pero no se indica en esta ficha) |
| Tipos de cuantización | No disponible (el adaptador es compatible con cuantizaciones del modelo base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA (r=16, alpha=32) apilado sobre el modelo base `allenai/Olmo-3-7B-Think`. El entrenamiento se realizó en dos etapas: primero un modelo SFT condicionado (no incluido en este repositorio) y luego una etapa de refuerzo con `GRPO` sobre el modelo SFT fusionado. El condicionamiento se introduce nombrando el nivel de verbosidad en el prompt (por ejemplo, "Level 1 (Verbose)") en lugar de seleccionar un adaptador por nivel. El entrenamiento usó el dataset `openai/gsm8k` y se ejecutó en una sola GPU NVIDIA A100 de 80 GB. No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición del dataset más allá de GSM8K.

## Capacidades
- Razonamiento matemático: el modelo muestra competencia en problemas aritméticos y de razonamiento del dataset GSM8K, con accuracy que varía según el nivel de verbosidad solicitado.
- Control de verbosidad del CoT: el usuario puede solicitar niveles L1 (verbose), L2 (concise), L3 (symbolic), L4 (shorthand) o L5 (extreme), lo que modifica la extensión y estilo del razonamiento generado.
- Generación de texto condicionada: el modelo interpreta la instrucción de nivel en el prompt y ajusta su salida en consecuencia.
- Multilingüe: no soporta otros idiomas; solo inglés.

## Casos de uso
- **Razonamiento matemático con control de detalle**: en entornos educativos, se puede solicitar un razonamiento detallado (L1) para explicar un problema o un resumen conciso (L2) para evaluar la comprensión.
- **Compresión de CoT en pipelines de inferencia**: en sistemas de generación con presupuesto de tokens, se puede pedir un nivel bajo (L3-L4) para reducir el coste de inferencia manteniendo una precisión aceptable (58.8% y 48.0% respectivamente).
- **Investigación en entrenamiento con refuerzo**: sirve como ejemplo de cómo el condicionamiento por prompt puede reemplazar a múltiples adaptadores, aunque los resultados muestran limitaciones.
- **Comparación de diseños de adaptadores**: útil para validar si un solo adaptador puede cubrir varios niveles de verbosidad frente a una familia de adaptadores dedicados.
- **Generación de explicaciones en sistemas de tutoría**: el modelo puede producir explicaciones con distinta profundidad según la petición, adaptándose al nivel del estudiante.
- **Evaluación de robustez del modelo**: la degradación drástica en L5 (3.0%) sirve para estudiar los límites del condicionamiento por prompt en modelos de razonamiento.

## Benchmarks y rendimiento
Los resultados oficiales (model-index) reportan una precisión del 88.2% en GSM8K (test, exact match) para el nivel L1. La model card proporciona resultados por nivel solicitado, con 1317 ejemplos en el test:

| Nivel solicitado | Precisión (GSM8K test) |
|---|---|
| L1 | 88.2% |
| L2 | 70.2% |
| L3 | 58.8% |
| L4 | 48.0% |
| L5 | 3.0% |

No se han publicado benchmarks adicionales en la información disponible.

## Requisitos de hardware
- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 7B, se requiere al menos 14 GB de VRAM para el modelo base en bf16. Con cuantización (por ejemplo, 4-bit) se puede reducir a ~6 GB.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), o GPUs consumer como RTX 3090/4090 para inferencia con cuantización.
- Si cabe en consumer GPU: sí, con cuantización y sin contexto muy largo.
- Opciones de despliegue: al ser un adaptador LoRA, se puede integrar en frameworks que soporten Peft, como `transformers` con `peft`, y luego servir con `vLLM`, `TGI` o `Ollama` (si se fusiona el adaptador con el base). También es posible usar `llama.cpp` con el modelo fusionado en GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos de benchmarks para comparar directamente con otros modelos. El modelo pertenece a una familia de adaptadores (per-level) del mismo autor, pero no se proporcionan métricas de esos otros adaptadores en esta ficha. Se sugiere consultar los modelos relacionados en el perfil de ssurface para una comparación interna.

## Limitaciones y advertencias
- Es un modelo de investigación, no recomendado para producción: la model card indica que es una comparación de diseño, no un modelo recomendado.
- Degradación severa en el nivel L5: la precisión cae al 3.0%, lo que indica que el modelo no puede manejar niveles extremos de verbosidad.
- Solo entrenado en GSM8K: la generalización a otros dominios (código, razonamiento general, etc.) no está garantizada.
- Requiere dos cargas de adaptadores: para usar el modelo hay que cargar primero el adaptador SFT (`cot-dialect-olmo3-7b-think-conditioned-sft`) y luego el adaptador GRPO, lo que complica el despliegue.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas, especialmente en niveles de verbosidad extremos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base (Olmo-3-7B-Think) también tiene licencia Apache-2.0, por lo que no hay restricciones adicionales.
- Limitación de idioma: solo inglés.

## Enlaces
- HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-conditioned-grpo
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT (requerido): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-conditioned-sft (enlace no verificado, pero se menciona en la model card)
- Otros modelos de la familia: ssurface/cot-dialect-olmo3-7b-think-grpo-addlen50-l5 (https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-addlen50-l5) y otros, disponibles en el perfil de ssurface.</think>## Resumen

Este modelo es un adaptador LoRA condicionado sobre el modelo base `allenai/Olmo-3-7B-Think`, desarrollado por el usuario `ssurface`. Su objetivo es controlar el nivel de verbosidad del razonamiento *chain-of-thought* (CoT) mediante una instrucción explícita en el prompt, en lugar de usar adaptadores separados por nivel. El adaptador se entrena con GRPO sobre un modelo SFT previo, con el fin de comprimir o expandir el razonamiento según el nivel solicitado (L1 a L5). Se trata de una pieza de diseño comparativo dentro de una colección más amplia de adaptadores *per-level*, y no está pensado como un modelo de producción. El modelo base Olmo-3-7B-Think pertenece a la familia Olmo 3, con arquitectura transformer de 7B parámetros y soporte para razonamiento largo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Olmo-3-7B-Think) + adaptador LoRA |
| Parámetros totales | No disponible (modelo base: 7B; adaptador LoRA r=16, alpha=32) |
| Parámetros activos | No disponible (adaptador LoRA; no se especifica número exacto) |
| Longitud de contexto | No disponible (el base soporta contexto largo según el paper, pero no se indica en esta ficha) |
| Tipos de cuantización | No disponible (el adaptador es compatible con cuantizaciones del modelo base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32) apilado sobre el modelo base `allenai/Olmo-3-7B-Think`. El entrenamiento se realizó en dos etapas: primero un modelo SFT condicionado (no incluido en este repositorio) y luego una etapa de refuerzo con GRPO sobre el modelo SFT fusionado. El condicionamiento se introduce nombrando el nivel de verbosidad en el prompt (por ejemplo, "Level 1 (Verbose)") en lugar de seleccionar un adaptador específico. El entrenamiento usó el dataset `openai/gsm8k` y se ejecutó en una sola GPU NVIDIA A100 80 GB. No se proporcionan datos sobre el número total de tokens de entrenamiento ni la composición del dataset más allá de GSM8K.

## Capacidades

- Razonamiento matemático: el modelo resuelve problemas del dataset GSM8K, con precisión variable según el nivel de verbosidad solicitado.
- Control de verbosidad del CoT: el usuario puede pedir niveles L1 (verbose), L2 (concise), L3 (symbolic), L4 (shorthand) o L5 (extreme), que modifican la extensión y estilo del razonamiento generado.
- Generación de texto condicionada: el modelo interpreta la instrucción de nivel en el prompt y ajusta su salida en consecuencia.
- Capacidades multilingües: solo inglés.

## Casos de uso

1. **Explicación educativa de problemas matemáticos**: se puede pedir un razonamiento detallado (L1) para mostrar cada paso en una tutoría, o uno conciso (L2) para una respuesta rápida.
2. **Compresión de CoT en inferencia con presupuesto de tokens**: en sistemas con límite de contexto, se puede usar un nivel bajo (L3 o L4) para reducir la longitud del razonamiento y el coste de generación, manteniendo una precisión aceptable (58.8% y 48.0% respectivamente).
3. **Investigación en entrenamiento por refuerzo**: sirve como caso de estudio para comparar el condicionamiento por nivel frente a adaptadores dedicados, evaluando la capacidad de un único conjunto de pesos para mantener varios dialectos de razonamiento.
4. **Generación de explicaciones adaptativas en plataformas educativas**: el modelo puede ajustar el detalle de la explicación según el nivel del estudiante, usando L1 para novatos y L3 para avanzados.
5. **Evaluación de robustez de modelos de razonamiento**: el colapso en L5 (3.0%) ofrece un escenario para estudiar los límites del condicionamiento por prompt y la estabilidad del entrenamiento con GRPO.
6. **Comparación de diseños de adaptadores**: útil para validar si un adaptador único puede reemplazar a una familia de adaptadores per-level, aunque los resultados muestran que no es viable para niveles extremos.

## Benchmarks y rendimiento

El modelo-index oficial reporta una precisión del 88.2% (exact match) en el test de GSM8K para el nivel 1. La model card proporciona una tabla con los resultados según el nivel solicitado, basada en 1317 ejemplos:

| Nivel solicitado | Precisión (GSM8K test) |
|---|---|
| L1 | 88.2% |
| L2 | 70.2% |
| L3 | 58.8% |
| L4 | 48.0% |
| L5 | 3.0% |

No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 7B en bf16 requiere aproximadamente 14 GB de VRAM; con cuantización (por ejemplo, 4-bit) se puede reducir a unos 6 GB.
- GPU recomendadas: para entrenamiento se usó una NVIDIA A100 80 GB; para inferencia, una RTX 3090 o RTX 4090 con cuantización es suficiente.
- Si cabe en consumer GPU: sí, con cuantización y contexto moderado.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con `transformers` + `peft` y fusionar con el modelo base para servir con `vLLM`, `TGI` o `llama.cpp` (tras convertir a GGUF). También se puede usar `Ollama` si se exporta el modelo fusionado.
- Latencia y throughput: no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con otros modelos de la misma categoría. La colección del autor incluye adaptadores *per-level* (por ejemplo, `cot-dialect-olmo3-7b-think-grpo-addlen50-l5`), pero no se ofrecen métricas de esos modelos en esta ficha. Se recomienda consultar el perfil de `ssurface` para más información.

## Limitaciones y advertencias

- Es un modelo de comparación, no recomendado para producción: la model card indica explícitamente que es una comparación de diseño.
- Degradación severa en el nivel L5 (3.0% de precisión), lo que muestra que un único adaptador no puede sostener dialectos extremos.
- Solo entrenado en GSM8K: la generalización a otros dominios (código, razonamiento general, etc.) no está garantizada.
- Requiere cargar dos adaptadores en secuencia: primero el SFT (`cot-dialect-olmo3-7b-think-conditioned-sft`) y luego el GRPO, lo que complica el despliegue.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas, especialmente en niveles de verbosidad bajos.
- Limitación de idioma: solo inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, sin restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-conditioned-grpo
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-conditioned-sft (referenciado en la model card, no verificado)
- Otros adaptadores de la familia: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-addlen50-l5 (y otros en el perfil del autor)
