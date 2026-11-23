# worv-ai/PonderPounce-WM-9B-RoboMME

## Resumen

PonderPounce-WM-9B-RoboMME es un modelo de visión-lenguaje-acción (VLA) con arquitectura de dos sistemas desarrollado por worv-ai para control robótico en tareas dependientes de memoria. Se construye sobre Qwen/Qwen3.5-9B como sistema de razonamiento lento (System 2, denominado Ponder) y sobre lerobot/pi05_base como política de acción rápida (System 1, denominado Pounce). La variante WM (world model) añade tres "future tokens" que el sistema Ponder aprende a predecir, correspondientes a los cambios de características visuales en los instantes 0,5 s, 1 s y 2 s posteriores a la observación.

El modelo resuelve el problema de la cognición en tareas robóticas que requieren retener información a lo largo de un episodio: Ponder mantiene la instrucción, la demostración de condicionamiento y las observaciones del episodio en su contexto causal nativo, y es consultado una vez por segundo para escribir un bloque portador de cuatro slots (uno de cognición y tres futuros). Pounce recibe únicamente el slot de cognición y predice un chunk de 20 pasos de ángulos articulares (1 s a 20 Hz).

Su relevancia radica en el resultado reportado: 67,42% en RoboMME (media de tres repeticiones de evaluación) frente al 60,83% de PonderPounce sin world model al mismo volumen de datos. El checkpoint tiene 13.641.355.264 parámetros reales en safetensors, un repositorio de 27,3 GB en bfloat16 y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA de dos sistemas: System 2 (Ponder, Qwen3.5-9B causal) + System 1 (Pounce, pi0.5 con PaliGemma 3B + experto de acciones flow-matching de 300M) + cabeza de regresión de future slots |
| Parámetros totales | 13.641.355.264 (dato real de safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B; no especificada en la model card) |
| Tipos de cuantización | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, bfloat16, ~27 GB) + config.json + norm_stats.json |

## Arquitectura y entrenamiento

La arquitectura combina dos sistemas que se ejecutan secuencialmente en una única GPU sobre un reloj simulado que reproduce el calendario de entrenamiento. Ponder (System 2) es Qwen3.5-9B y conserva en su contexto causal nativo la instrucción, la demostración de condicionamiento y las observaciones del episodio; se consulta cada segundo y escribe un bloque portador de cuatro slots: un slot de cognición seguido de tres slots futuros. Los slots futuros se entrenan para regresar el cambio de la característica SigLIP congelada de Pounce (cámara en tercera persona, agrupada en parches de 4x4) entre el fotograma de consulta y los fotogramas situados 0,5 s, 1 s y 2 s después. Al colocarse después del slot de cognición, este nunca atiende a los futuros.

Pounce (System 1) es pi0.5, compuesto por PaliGemma 3B más un experto de acciones flow-matching de 300M parámetros. Predice un chunk de 20 pasos de ángulos articulares (1 s a 20 Hz) a partir de la observación actual, la propriocepción, el texto de la tarea, la cognición más reciente y su antigüedad. Solo recibe el slot de cognición; los slots futuros permanecen dentro de Ponder y la cabeza de regresión (`future_head`) no se utiliza para actuar. El entrenamiento se realizó de extremo a extremo sobre las 16 tareas dependientes de memoria de RoboMME 1x, con 4320 pasos y batch global de 32. La cognición es visible para Pounce 300 ms después de la consulta a Ponder.

## Capacidades

- Control robótico de visión-lenguaje-acción: genera chunks de 20 pasos de ángulos articulares conjuntos a 20 Hz a partir de observaciones visuales y propriocepción.
- Razonamiento de sistema 2 con contexto episódico: mantiene instrucción, demostración y observaciones en el contexto causal de Qwen3.5-9B.
- Modelado de mundo a corto plazo: predice cambios de características visuales a 0,5 s, 1 s y 2 s (slots futuros), aunque estos no se usan para actuar en este checkpoint.
- Condicionamiento por demostración: incorpora una demostración de condicionamiento en el contexto de Ponder.
- Tareas dependientes de memoria: diseñado específicamente para las 16 tareas de RoboMME que requieren retener información entre pasos.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible en el sentido de agentes de software; el bucle cognitivo es interno al control robótico.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible como capacidades declaradas más allá del pipeline de robotics.

## Casos de uso

- Manipulación robótica con memoria de episodio: el modelo retiene la instrucción y las observaciones previas en el contexto de Ponder, lo que permite ejecutar tareas en las que el objetivo o el estado inicial deben recordarse varios segundos después.
- Investigación en arquitecturas de dos sistemas: sirve como referencia reproducible para estudiar el desacoplamiento entre razonamiento lento (1 Hz) y control rápido (20 Hz) en un único servidor de inferencia.
- Evaluación comparativa en RoboMME: el checkpoint permite reproducir el resultado de 67,42% con el servidor `ponderpounce.eval.robomme_server` y el arnés `vla-eval` (RoboMME-16, 50 episodios por tarea).
- Estudio de world models en VLA: la cabeza de future slots permite analizar si la predicción de cambios visuales mejora la cognición, sin que dichos slots intervengan en la acción.
- Prototipado de políticas de imitación condicionadas por demostración: útil para pipelines que necesitan una política de acción rápida (Pounce) guiada por un módulo de razonamiento que consume lenguaje e imágenes.
- Base para fine-tuning en dominios robóticos propios: al estar en Apache 2.0 y safetensors, puede adaptarse a nuevos conjuntos de tareas manteniendo la separación Ponder/Pounce.

## Benchmarks y rendimiento

| Benchmark | PonderPounce-WM-9B | PonderPounce-9B (misma escala de datos) |
|---|---|---|
| RoboMME (media de 3 repeticiones) | 67,42% | 60,83% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 32 GB libres en una única GPU, según la model card (los dos sistemas se ejecutan secuencialmente).
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 32 GB encajan A100 40/80 GB, H100 y GPUs profesionales con 32 GB o más.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; con 32 GB libres quedaría fuera de la mayoría de GPUs de consumo actuales, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: servidor propio del repositorio (`ponderpounce.eval.robomme_server`) y arnés `vla-eval`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el servidor opera sobre un reloj simulado con Ponder cada 1 s, Pounce cada 1 s y cognición visible 300 ms después de la consulta; no se publican cifras de latencia real ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RoboMME | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PonderPounce-WM-9B-RoboMME | 13,64 B | no disponible | 67,42% | Apache 2.0 | Hugging Face (worv-ai) |
| PonderPounce-9B-RoboMME | no disponible | no disponible | 60,83% | no disponible | Hugging Face (worv-ai) |
| pi0.5 (lerobot/pi05_base) | 3 B (PaliGemma) + 300M experto | no disponible | no disponible | no disponible | Hugging Face (lerobot) |
| Qwen3.5-9B | ~9 B | no disponible | no aplica (LLM base) | no disponible | Hugging Face (Qwen) |

## Limitaciones y advertencias

- El checkpoint está entrenado exclusivamente en RoboMME 1x (16 tareas dependientes de memoria, 4320 pasos, batch 32); su generalización fuera de ese dominio no está documentada.
- Los slots futuros no se utilizan para actuar: la mejora de rendimiento se atribuye a la cognición, no a la entrega de predicciones futuras a Pounce.
- El servidor requiere al menos 32 GB libres de VRAM y ejecuta ambos sistemas secuencialmente, lo que limita el despliegue en hardware modesto.
- La evaluación se basa en un reloj simulado que reproduce el calendario de entrenamiento; el comportamiento en tiempo real con latencias variables no está documentado.
- No se especifican idiomas soportados ni sesgos conocidos; el riesgo de alucinación en el módulo de razonamiento no se cuantifica en la información disponible.
- El repositorio registra 0 descargas y 0 likes, y el checkpoint se creó el 23 de noviembre de 2026; no hay evidencia de validación externa independiente.
- La licencia Apache 2.0 permite uso comercial, pero los tokenizers y procesadores de los backbones se descargan del Hub en el primer uso, por lo que sus licencias respectivas aplican por separado.

## Enlaces

- Hugging Face: https://huggingface.co/worv-ai/PonderPounce-WM-9B-RoboMME
- Modelo base PonderPounce: https://huggingface.co/worv-ai/PonderPounce-9B-RoboMME
- Repositorio de código: https://github.com/worv-ai/PonderPounce
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base pi0.5: https://huggingface.co/lerobot/pi05_base
- Tokenizer/procesador PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224
