# zhezi12138/Qwen3-1.7B-math-to-mbpp-same-top50-rolloutseed42-20261107

## Resumen

Qwen3-1.7B-math-to-mbpp-same-top50-rolloutseed42-20261107 es un checkpoint de investigación publicado por el usuario zhezi12138 en Hugging Face. No es un modelo nuevo entrenado desde cero, sino una continuación de ajuste por refuerzo (RL) sobre el modelo base Qwen/Qwen3-1.7B, partiendo de un checkpoint previo del mismo autor (`qwen3-1.7B-dapo-math-top50`, iteración 399) especializado en matemáticas. El objetivo del experimento es evaluar la transferencia de un subconjunto de cabezas de atención seleccionadas para matemáticas hacia una tarea de generación de código (MBPP), manteniendo esas mismas cabezas y congelando el resto de parámetros.

El modelo emplea una estrategia de RL disperso (sparse RL) implementada con Megatron, donde solo se actualizan las cabezas de atención del top-50% identificadas en la fase de matemáticas, junto con sus columnas correspondientes en la proyección O. El resto de parámetros, incluidas las demás cabezas de atención, permanecen congelados durante los 600 pasos de continuación sobre el dataset MBPP (974 prompts). Es, por tanto, un artefacto experimental orientado a estudiar qué componentes del modelo son responsables de la generalización entre dominios (matemáticas y código).

Su relevancia es fundamentalmente metodológica: permite analizar si las cabezas de atención críticas para razonamiento matemático son también las relevantes para generación de código, y si el ajuste selectivo de un subconjunto reducido de parámetros basta para transferir capacidades. No obstante, se distribuye como checkpoints de Megatron en formato torch-dist, no como safetensors de Transformers, y el autor declara explícitamente que la reevaluación con protocolo fijo está pendiente y que no se reclama ningún rendimiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con ajuste selectivo de cabezas de atención |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta contexto nativo de 32 768 tokens, pero la model card no lo especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints Megatron torch-dist, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Megatron torch-dist checkpoints (`iter_0000199`, `iter_0000399`, `iter_0000599`); no son safetensors de Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. Sobre él se aplica una estrategia de RL disperso con Megatron en la que se seleccionan las cabezas de atención del top-50% según su relevancia en una fase previa de entrenamiento matemático (checkpoint `qwen3-1.7B-dapo-math-top50`, iteración 399). En esta continuación se entrenan durante 600 pasos únicamente esas mismas cabezas de atención y sus columnas correspondientes en la proyección O, manteniendo congelados el resto de parámetros y las demás cabezas.

Los detalles de entrenamiento son concretos: dataset MBPP completo (974 prompts), semilla de rollout 42, tasa de aprendizaje 3e-6, batch global de 64, cuatro respuestas por prompt, límite de rollout de 2048 tokens y puesta a cero de gradientes congelados antes del clipping. El autor incluye la máscara exacta, el comando de entrenamiento y sumas SHA256 en `checksums.json`. Los checkpoints son de Megatron torch-dist y deben cargarse con el modelo base Qwen3-1.7B y el bridge de Megatron (`--hf-checkpoint /path/to/Qwen3-1.7B --load /path/to/this/snapshot --ckpt-step 599 --finetune --megatron-to-hf-mode bridge`). No se guardaron estados del optimizador.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3-1.7B.
- Generación de código Python, objetivo de la continuación sobre MBPP.
- Razonamiento matemático, procedente del checkpoint de partida especializado en matemáticas.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades especiales (modo thinking, visión, audio) para este checkpoint.

## Casos de uso

- Investigación sobre transferencia entre dominios: el checkpoint permite estudiar si las cabezas de atención seleccionadas para matemáticas son suficientes para aprender generación de código, comparando el rendimiento en MBPP antes y después de la continuación.
- Análisis de ajuste selectivo de parámetros: sirve para medir cuánto rendimiento se obtiene actualizando solo el top-50% de cabezas de atención frente a un ajuste completo, útil para diseñar estrategias de RL eficientes en cómputo.
- Reproducibilidad de experimentos de RL disperso: al incluir máscara, comando y checksums, se puede reproducir el entrenamiento con Megatron y verificar la integridad de los artefactos.
- Estudio de olvido catastrófico: al congelar la mayor parte del modelo, se puede evaluar si las capacidades matemáticas previas se preservan tras 600 pasos de entrenamiento en código.
- Base para experimentos de merging o destilación: los checkpoints intermedios (200, 400 y 600 pasos) permiten analizar la evolución del aprendizaje y extraer subconjuntos de pesos para experimentos posteriores.
- Docencia y divulgación técnica: como ejemplo práctico de pipeline de RL con Megatron y de entrenamiento selectivo de cabezas de atención en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la reevaluación con protocolo fijo está pendiente y que los logs de entrenamiento usaron un monitor de matemáticas remuestreado de 1000 preguntas y una evaluación de MBPP con límite de 4096 tokens y temperatura por defecto, distintos del protocolo de referencia. No se reclama ningún rendimiento final.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1,7 mil millones de parámetros, en precisión completa (FP16/BF16) requiere aproximadamente 3,4 GB solo para los pesos, más memoria para activaciones y caché KV. En cuantización de 8 bits rondaría los 1,7 GB y en 4 bits alrededor de 0,9 GB, aunque no se distribuyen pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar el modelo en FP16; para entrenamiento o cargas mayores se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, siempre que se conviertan los checkpoints Megatron a safetensors o se use el bridge correspondiente.
- Opciones de despliegue: los checkpoints son Megatron torch-dist y requieren el bridge de Megatron para convertirlos a formato Hugging Face Transformers. Una vez convertidos, podrían desplegarse con vLLM, TGI, llama.cpp u Ollama, aunque no se documenta ningún proceso de conversión ni soporte oficial.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-math-to-mbpp-same-top50-rolloutseed42-20261107 | 1,7 B | no disponible | no disponible | Megatron torch-dist | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B (base) | 1,7 B | 32 768 tokens (nativo) | Apache 2.0 (según el modelo base) | safetensors | Hugging Face |
| Qwen3-1.7B-math-single-top50-rolloutseed52 (mismo autor) | 1,7 B | no disponible | no disponible | no disponible | Hugging Face (sin model card) |
| Qwen3-1.7B-mbpp-single-top50-rolloutseed52 (mismo autor) | 1,7 B | no disponible | no disponible | no disponible | Hugging Face (sin model card) |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks con protocolo fijo; el autor no reclama ningún rendimiento final y la reevaluación está pendiente.
- Los checkpoints son Megatron torch-dist, no safetensors de Transformers; requieren el bridge de Megatron y el modelo base Qwen3-1.7B para cargarse, lo que complica su uso directo.
- No se guardaron estados del optimizador, lo que limita la reanudación exacta del entrenamiento.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial; se debe consultar la licencia del modelo base Qwen3-1.7B.
- Los idiomas soportados no están documentados; se heredan presumiblemente del modelo base, pero no se confirma.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se aplican los del modelo base Qwen3-1.7B.
- El entrenamiento se realizó con un conjunto reducido de pasos (600) y un dataset pequeño (974 prompts), por lo que el ajuste puede ser limitado y sobreajustado a MBPP.
- El modelo está pensado para investigación en RL disperso, no para producción directa; su uso en entornos reales requiere validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/zhezi12138/Qwen3-1.7B-math-to-mbpp-same-top50-rolloutseed42-20261107
- Checkpoint de partida: https://huggingface.co/zhezi12138/qwen3-1.7B-dapo-math-top50
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo relacionado (math-single-top50-rolloutseed52): https://huggingface.co/zhezi12138/Qwen3-1.7B-math-single-top50-rolloutseed52
- Modelo relacionado (mbpp-single-top50-rolloutseed52): https://huggingface.co/zhezi12138/Qwen3-1.7B-mbpp-single-top50-rolloutseed52
- Proyecto W&B: `ruizshi-uw/miles-lora-sparse`, run `vpom9sak` (no se proporciona URL directa)
