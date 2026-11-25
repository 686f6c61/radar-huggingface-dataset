# wckwan/arora-qwen3.5-9b-a0.1-seven-task-b8-matched

## Resumen

arora-qwen3.5-9b-a0.1-seven-task-b8-matched es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3.5-9B, publicado por el usuario wckwan en Hugging Face. El modelo aplica el algoritmo `arora_rloo` (Arora & Zanette length-penalised RLOO con alpha = 0.1), una variante de RLOO con penalización por longitud, sobre el ajuste denominado `seven-task`. El objetivo declarado es el razonamiento eficiente: obtener respuestas correctas reduciendo la longitud de la cadena de razonamiento.

El entrenamiento se realizó con verl v0.9.1 (FSDP2 + vLLM), 5 pasos, 8 prompts por paso con 8 rollouts cada uno (64 muestras por paso), learning rate 2e-6, coeficiente KL de 1e-3 y un límite de rollout de 32K tokens. El conjunto de datos consta de 512 ejemplos (semilla 0) extraídos de los splits oficiales de entrenamiento, con el system prompt "Solve the user's task and give the final answer directly." y recompensa basada en la corrección de la respuesta textual tras el cierre de `</think>`.

La relevancia del modelo es metodológica: se presenta como una comparación controlada por cómputo frente a un baseline entrenado durante 20 pasos, seleccionando el checkpoint del paso 5 por ser el que iguala aproximadamente 113,39 PFLOPs de cómputo acumulado. El modelo tiene 9.409.813.744 parámetros, licencia Apache 2.0 y un repositorio de 37,7 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; detalles de la arquitectura base no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa un límite de rollout de 32K tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de 9.409.813.744 parámetros según los pesos publicados. Sobre esa base se aplica un ajuste fino por RL con `arora_rloo`, la formulación de RLOO con penalización por longitud de Arora & Zanette, con alpha = 0.1. La configuración de entrenamiento es: 5 pasos, 8 prompts por paso con 8 rollouts cada uno, learning rate 2e-6, coeficiente KL de 1e-3 y un tope de 32K tokens por rollout. La infraestructura es verl v0.9.1 con FSDP2 para el entrenamiento y vLLM para la generación de rollouts.

Los datos de entrenamiento son 512 ejemplos (semilla 0) de los splits oficiales de entrenamiento del ajuste `seven-task`, con el system prompt "Solve the user's task and give the final answer directly." y una recompensa definida como la corrección de la tarea evaluada sobre el texto posterior a `</think>`. El autor documenta un baseline equiparado en cómputo entrenado 20 pasos con checkpoint por paso, y selecciona el paso 5 como punto de comparación porque su cómputo acumulado (12 x 9B x tokens por paso) es el más cercano a 113,39 PFLOPs; el desglose por paso está en `train/logs/selection.json`. No se documentan fases de SFT, DPO ni datos de preferencias humanas adicionales.

## Capacidades

- Generación de texto y razonamiento: el ajuste se entrena sobre tareas de razonamiento con recompensa por corrección de la respuesta final.
- Modo de razonamiento con delimitador `</think>`: la recompensa se calcula sobre el texto posterior al cierre de la etiqueta de pensamiento.
- Razonamiento eficiente: la penalización por longitud (alpha = 0.1) busca reducir la longitud de la cadena de razonamiento manteniendo la corrección.
- Respuesta directa: el system prompt de entrenamiento instruye a resolver la tarea y dar la respuesta final directamente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Evaluación de métodos de RL para razonamiento eficiente: el modelo sirve como punto de comparación controlado por cómputo (113,39 PFLOPs) frente a un baseline de 20 pasos, útil para investigar el efecto de la penalización por longitud en RLOO.
- Réplica de experimentos de razonamiento con verl: la configuración documentada (FSDP2 + vLLM, 512 ejemplos, seed 0) permite reproducir el pipeline de entrenamiento y verificar la selección de checkpoint del paso 5.
- Generación de cadenas de razonamiento cortas: en tareas donde el coste por token de salida importa, el ajuste con penalización por longitud puede producir trazas de pensamiento más breves que el modelo base.
- Investigación sobre recompensas basadas en corrección: el esquema de recompensa sobre el texto posterior a `</think>` es un caso práctico para estudiar el alineamiento entre formato de salida y señal de recompensa.
- Punto de partida para ajustes posteriores: al ser un fine-tune de Qwen3.5-9B con licencia Apache 2.0, puede servir como base para nuevos experimentos de RL o SFT.
- Análisis de la relación longitud-correctitud: permite medir empíricamente si la penalización alpha = 0.1 degrada la precisión en tareas que requieren razonamientos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos (9,41 mil millones de parámetros x 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 9,4 GB para pesos; en 4 bits, alrededor de 4,7 GB. No se publican cuantizaciones oficiales del modelo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) es suficiente para BF16 en contextos moderados.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 24 GB en BF16; en GPUs de 16 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: vLLM (usado en el entrenamiento para rollouts), así como cargadores estándar de transformers para safetensors. No se documentan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arora-qwen3.5-9b-a0.1-seven-task-b8-matched | 9,41 B | no disponible | RL (arora_rloo, 5 pasos, 512 ejemplos) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9 B (aproximado, según nombre) | no disponible | Preentrenamiento y postentrenamiento del autor original | no disponible en la información proporcionada | Hugging Face |
| Baseline del autor (20 pasos, mismo cómputo) | 9,41 B | no disponible | RL (RLOO sin penalización por longitud, según descripción) | no disponible | No publicado como modelo separado en la información disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy corto: solo 5 pasos de RL sobre 512 ejemplos, lo que limita la magnitud del cambio respecto al modelo base y hace que los efectos observados puedan ser sensibles a la semilla y a la configuración.
- Sin benchmarks publicados: no hay resultados verificables de MMLU, GSM8K, HumanEval ni de tareas del ajuste `seven-task`, por lo que no puede evaluarse su calidad relativa frente al baseline.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-9B, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas: no se especifican los idiomas soportados; el system prompt de entrenamiento está en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen/Qwen3.5-9B, cuya licencia no se detalla en la información proporcionada.
- Reproducibilidad: el autor referencia `train/logs/selection.json` para el desglose de cómputo, pero no se confirma en la información disponible que dicho archivo esté incluido en el repositorio.
- Uso en producción: al ser un artefacto de investigación con 20 descargas y sin pipeline declarado, no hay garantías de estabilidad ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wckwan/arora-qwen3.5-9b-a0.1-seven-task-b8-matched
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de verl (framework de entrenamiento citado): https://github.com/volcengine/verl
- Referencia del método arora_rloo (Arora & Zanette, length-penalised RLOO): no disponible en la información proporcionada.
