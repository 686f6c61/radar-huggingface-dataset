# zhezi12138/Qwen3-1.7B-math-single-per-layer-bottom50-rolloutseed42

## Resumen

Qwen3-1.7B-math-single-per-layer-bottom50-rolloutseed42 es un checkpoint experimental de ajuste fino por refuerzo (RL) sobre Qwen3-1.7B, publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo ni de un lanzamiento oficial de Alibaba, sino de un artefacto de investigación centrado en el entrenamiento disperso (sparse training): solo se actualizan, en cada una de las 28 capas del transformer, los 4 de 8 grupos GQA con mayor importancia de gradiente para la tarea de matemáticas, junto con sus columnas de proyección de salida. El resto de parámetros (MLP, embeddings, normas, LM head y bloques de atención no seleccionados) permanece congelado.

El modelo parte de Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros con licencia Apache 2.0, y se entrena con GRPO durante 400 actualizaciones sobre un conjunto fijo de 1000 prompts de matemáticas (dapo-math-eval-1000.jsonl). La relevancia actual es metodológica: el autor publica los checkpoints intermedios en formato Megatron distribuido (no safetensors), junto con curvas de evaluación y hashes de integridad, lo que permite reproducir y auditar una técnica de RL congelado selectivo por capas.

El checkpoint final (iteración 399) mejora la evaluación de matemáticas sobre los mismos prompts de entrenamiento del 27,0% al 37,5%. Es importante subrayar que se trata de evaluación sobre prompts de entrenamiento, no de un conjunto de test reservado, por lo que la cifra no debe interpretarse como rendimiento generalizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 28 capas, atención GQA con 8 grupos |
| Parametros totales | 1.700 millones (heredados de Qwen3-1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (checkpoints Megatron distribuidos, no safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints distribuidos Megatron (iter_0000199 e iter_0000399), no Transformers safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso de 28 capas con atención de consultas agrupadas (GQA) de 8 grupos. Sobre esa base, el autor aplica un esquema de entrenamiento disperso por capas: en cada capa se seleccionan los 4 de 8 grupos GQA con mayor importancia de gradiente para la tarea de matemáticas y se entrenan esos grupos junto con sus columnas correspondientes de la proyección de salida. El resto de componentes (MLP, embeddings, normas, LM head y bloques de atención no seleccionados) queda congelado, con gradientes puestos a cero antes del clipping.

El entrenamiento usa GRPO con semilla de rollout 42, 16 prompts por paso con 4 muestras cada uno (batch global de 64), tope de respuesta de 3072 tokens, paralelismo tensorial de 2, tasa de aprendizaje constante de 3e-6 y 400 actualizaciones totales. El verificador empleado tanto en entrenamiento como en evaluación es `math` (no `dapo_math`). La evaluación se ejecuta antes del entrenamiento y cada 10 actualizaciones, con una muestra por prompt, top_k 1, temperatura 1.0 y tope de respuesta de 4096 tokens. El estado del optimizador no se guarda. La revisión base es `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`.

## Capacidades

- Generación de texto y razonamiento matemático: el ajuste se orienta específicamente a la resolución de problemas de matemáticas mediante RL con verificador.
- Razonamiento en modo no-thinking: el entrenamiento usa chat no-thinking, por lo que el comportamiento esperado es respuesta directa sin cadena de pensamiento explícita.
- Capacidades heredadas de Qwen3-1.7B: generación de texto general, código y multilingüismo, aunque el ajuste solo refuerza la tarea matemática y no se documentan evaluaciones de estas capacidades en el checkpoint.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no documentadas; el checkpoint se entrena en modo no-thinking.

## Casos de uso

- Investigación en entrenamiento disperso por capas: el checkpoint permite reproducir y comparar la selección per-layer bottom50% frente a una selección global bottom50%, cargando los checkpoints Megatron con el entorno miles/Megatron Bridge y la configuración base de Qwen3-1.7B.
- Estudio de RL con verificador en dominios acotados: sirve para analizar cómo evoluciona la precisión matemática cada 10 actualizaciones sobre los mismos 1000 prompts fijos, usando `evaluation_history.json` como curva de referencia.
- Auditoría de reproducibilidad: los ficheros `SHA256SUMS.json`, `completion-eval-audit.json` y la configuración exacta de entrenamiento permiten verificar hashes y reejecutar el pipeline con semilla fija.
- Comparación de estrategias de congelación selectiva: al mantener congelados MLP, embeddings y normas, el modelo es útil para medir cuánto rendimiento se obtiene actualizando solo subconjuntos de atención, frente a un ajuste completo.
- Prototipado de ajuste eficiente en memoria: al reducir los parámetros entrenables a los grupos GQA seleccionados, el esquema sirve como referencia para experimentos con presupuesto de cómputo reducido en GPUs de gama media.
- Docencia y divulgación sobre GRPO: los checkpoints intermedios (200 y 400 actualizaciones) permiten ilustrar el efecto del RL sobre una tarea con verificador automático.

## Benchmarks y rendimiento

Los únicos datos publicados son la evaluación en entrenamiento sobre los 1000 prompts fijos de matemáticas, con una muestra por prompt, top_k 1, temperatura 1.0 y tope de 4096 tokens:

| Metrica | Antes del entrenamiento | Tras 400 actualizaciones |
|---|---|---|
| Evaluacion Math (prompts de entrenamiento) | 27,0% | 37,5% |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni comparaciones con otros modelos). Las cifras anteriores no son resultados de test reservado y no deben presentarse como rendimiento generalizable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio contiene checkpoints Megatron distribuidos (6,9 GB en total, incluyendo dos iteraciones), no pesos en safetensors ni GGUF listos para inferencia.
- GPU recomendadas: no especificadas por el autor; el entrenamiento usó paralelismo tensorial de 2, lo que sugiere al menos 2 GPUs para reproducir el pipeline.
- ¿Cabe en GPU de consumo? No hay información que lo confirme; el formato Megatron requiere convertir los pesos antes de usar frameworks de inferencia convencionales.
- Opciones de despliegue: el autor indica cargar los checkpoints con el entorno miles/Megatron Bridge y la configuración base de Qwen3-1.7B. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-1.7B-math-single-per-layer-bottom50) | 1.700 M | no disponible | 37,5% en evaluación Math sobre prompts de entrenamiento | Apache 2.0 | Megatron distribuido |
| Qwen/Qwen3-1.7B (base) | 1.700 M | no disponible | 27,0% en la misma evaluación previa al ajuste | Apache 2.0 | safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados para comparar con otros checkpoints de RL disperso o con modelos de tamaño similar en benchmarks estándar.

## Limitaciones y advertencias

- La métrica del 37,5% corresponde a evaluación sobre los mismos prompts usados en entrenamiento; no es un resultado de test reservado y probablemente sobreestima la generalización.
- El ajuste solo entrena 4 de 8 grupos GQA por capa y congela MLP, embeddings, normas y LM head; las capacidades fuera de matemáticas no se reevalúan y pueden degradarse o mantenerse sin cambios no documentados.
- Los pesos están en formato Megatron distribuido, no en safetensors ni GGUF; requieren conversión y el entorno miles/Megatron Bridge para cargarse, lo que limita su uso inmediato en frameworks de inferencia estándar.
- El estado del optimizador no se guarda, lo que impide reanudar el entrenamiento exactamente desde los checkpoints publicados.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni idiomas soportados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación de calidad para producción; es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta.
- El verificador `math` usado en entrenamiento y evaluación difiere de `dapo_math`, lo que puede afectar a la comparabilidad con otros trabajos que usen el verificador alternativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhezi12138/Qwen3-1.7B-math-single-per-layer-bottom50-rolloutseed42
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revisión base: 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- Run de W&B: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/hhx0zowk
- Ficheros de auditoría citados en el repo: `completion-eval-audit.json`, `evaluation_history.json`, `SHA256SUMS.json`
- Dataset de evaluación citado: `dapo-math-eval-1000.jsonl` (SHA256 registrado en la procedencia)
