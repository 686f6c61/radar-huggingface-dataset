# ZACK0225/Qwen3.8-27B-MAB-Opus5-SFT

## Resumen

Qwen3.8-27B-MAB-Opus5-SFT es un ajuste fino supervisado (SFT) de Qwen3.8-27B, desarrollado por el usuario ZACK0225 y publicado en Hugging Face. El modelo parte de la arquitectura multimodal Qwen3_5ForConditionalGeneration del modelo base y ha sido entrenado sobre trayectorias generadas por Claude Opus 5 en el entorno MAB-Bench, un banco de tareas orientado al estudio de exploración, explotación y transferencia a tareas externas. Su propósito es servir como artefacto de investigación para analizar cómo el SFT sobre trayectorias de un profesor fuerte afecta al comportamiento agéntico del modelo.

El ajuste se realizó sobre los parámetros de texto en BF16, manteniendo congelado el módulo visual. El checkpoint publicado corresponde a la época 2, paso 282, con un total de 156 tareas de entrenamiento repartidas en 23 mecanismos, 2.241 turnos de asistente y 407.975 tokens supervisados. El contexto máximo de entrenamiento fue de 16.384 tokens.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con 18 descargas y sin resultados de evaluación externa publicados todavía. No debe considerarse una versión mejorada del modelo base hasta que se completen las evaluaciones de validación externa y test final. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, vision-language) |
| Parametros totales | 3.054.832 (dato reportado en safetensors; discrepante con el nombre comercial "27B") |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (máximo usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), transformers |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura Qwen3_5ForConditionalGeneration del modelo base Qwen/Qwen3.8-27B, que combina un transformer de lenguaje con un módulo visual para entrada image-text-to-text. El SFT se aplicó sobre los parámetros de texto en precisión BF16, manteniendo congelado el torreón visual. El entrenamiento se ejecutó en 8 GPUs A100 de 80 GB con DeepSpeed ZeRO-3 y offload del optimizador a CPU, durante 2 épocas y 282 pasos, con learning rate 2e-6, schedule coseno, 15 pasos de warmup, batch efectivo de 16, weight decay 0.01 y semilla 20261029.

Los datos de entrenamiento provienen de trayectorias generadas por Claude Opus 5 en MAB-Bench: 156 tareas de entrenamiento sobre 23 mecanismos, con 2.241 turnos de asistente y 407.975 tokens supervisados. La validación MAB consta de 35 tareas, 499 turnos y 88.736 tokens. Solo el texto visible y las llamadas a herramientas del asistente actual contribuyen a la pérdida; los mensajes previos y el feedback de herramientas se mantienen como contexto, y el pensamiento interno del proveedor no se usa como objetivo de entrenamiento. Se excluyeron ejemplos completos que excedían el contexto de 16.384 tokens (324 turnos de entrenamiento y 68 de validación), preservando el contexto completo en los ejemplos retenidos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento y toma de decisiones en entornos de tipo bandit (exploración/explotación), derivado del entrenamiento en MAB-Bench.
- Uso de herramientas (tool-use / function calling), ya que las trayectorias de entrenamiento incluyen llamadas a herramientas.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque el SFT no evaluó la transferencia en visión.
- Soporte de agentes y razonamiento multi-paso, por el formato de trayectorias completas de MAB.
- Plantilla de chat y procesador incluidos en el repositorio, listos para transformers.

## Casos de uso

- Investigación sobre SFT con trayectorias de profesor fuerte: el modelo sirve para estudiar cómo el ajuste supervisado sobre trayectorias de Claude Opus 5 en MAB-Bench afecta al comportamiento de exploración y explotación del modelo base.
- Evaluación de transferencia a tareas externas: dado que el autor declara 275 tareas de validación externa y 275 de test final excluidas del entrenamiento, el checkpoint es adecuado para medir generalización fuera de MAB.
- Análisis de agentes con tool calling: las trayectorias incluyen llamadas a herramientas, por lo que el modelo puede usarse para reproducir y comparar políticas de uso de herramientas en entornos controlados.
- Estudio de razonamiento multi-paso en entornos de decisión secuencial: los 23 mecanismos de MAB permiten analizar el comportamiento del modelo ante variantes de un mismo problema.
- Experimentos de alineación y destilación: al ser un SFT sobre trayectorias de un profesor propietario, es útil para comparar estrategias de destilación de comportamiento frente a RLHF/DPO.
- Reproducción de pipelines de entrenamiento: el repositorio incluye `training_recipe.json` y `deepspeed-zero3.json`, lo que permite replicar el setup en 8×A100 80 GB con DeepSpeed ZeRO-3.
- Evaluación multimodal exploratoria: aunque el SFT no evaluó visión, el modelo conserva el módulo visual del base y puede emplearse para probar si el ajuste de texto degrada o preserva capacidades image-text-to-text.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdida de validación MAB:

| Revision | Epoca | Pasos | MAB validation loss |
|---|---:|---:|---:|
| `epoch-1` | 1 | 141 | 0.2227127254 |
| `main` | 2 | 282 | 0.2212697268 |

La pérdida es la media de las entropías cruzadas medias por turno de asistente, no una precisión de benchmark. El autor indica que la evaluación completa de MAB y la selección del checkpoint para test final están pendientes.

## Requisitos de hardware

- Pesos BF16 completos: aproximadamente 54,7 GB, según la model card.
- Memoria adicional necesaria para estado de runtime y KV cache; el total práctico supera los 54,7 GB.
- Entrenamiento original: 8 GPUs A100 de 80 GB con DeepSpeed ZeRO-3 y offload de optimizador a CPU.
- Inferencia: se ejercitó localmente con vLLM 0.20.2; también es compatible con transformers (versión de entrenamiento 5.20.2).
- No cabe en GPUs de consumo convencionales en BF16; requeriría cuantización, de la que no se publican recetas ni artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-MAB-Opus5-SFT | 3.054.832 (safetensors reportado) | 16.384 (entrenamiento) | apache-2.0 | Hugging Face, 18 descargas |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor advierte explícitamente que no debe considerarse superior al modelo base hasta completar la evaluación externa y de test final.
- Discrepancia de parámetros: safetensors reporta 3.054.832 parámetros totales, incoherente con el nombre "27B" y con un repo de 109,4 GB; conviene verificar antes de planificar el despliegue.
- Contexto de entrenamiento limitado a 16.384 tokens; se excluyeron ejemplos más largos, lo que puede sesgar el comportamiento en contextos extensos.
- Solo inglés y chino declarados; no hay evidencia de calidad en castellano.
- Capacidad visual no evaluada tras el SFT; el módulo visual está congelado y la transferencia multimodal es incierta.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un SFT sobre trayectorias de un profesor propietario, puede heredar sesgos de esas trayectorias.
- Sin resultados de benchmarks publicados; no hay evidencia cuantitativa de rendimiento frente al base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción no está validado.
- Trazabilidad: incluye `LICENSE`, `NOTICE` y `SHA256SUMS` para verificar integridad de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/ZACK0225/Qwen3.8-27B-MAB-Opus5-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de archivos de entrenamiento: `training_recipe.json`, `deepspeed-zero3.json`, `SHA256SUMS`, `NOTICE` (incluidos en el repo de Hugging Face)
- Paper, blog o demo de MAB-Bench: no disponible en la información proporcionada.
