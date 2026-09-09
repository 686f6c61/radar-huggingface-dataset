# yufanzh/qwen25-1p5b-sep10-unified-20260909

## Resumen

El modelo `yufanzh/qwen25-1p5b-sep10-unified-20260909` es un artefacto de investigación publicado en Hugging Face por el usuario yufanzh. No se trata de un modelo de propósito general, sino de un experimento científico sobre técnicas de enmascaramiento de coordenadas basadas en la información de Fisher y en el gradiente inicial, aplicadas durante un entrenamiento de aprendizaje por refuerzo (RL). El modelo parte del Qwen2.5-1.5B, un transformer de 1.500 millones de parámetros, y se entrena con el algoritmo GRPO sobre datos del dataset SimpleRL-Zoo-Data (split `simplelr_abel_level3to5`).

La relevancia del modelo es fundamentalmente académica: permite estudiar cómo distintos presupuestos de coordenadas activas (1 %, 5 %, 10 % y 20 %) afectan al rendimiento en tareas de razonamiento matemático. Se publican checkpoints en FP32 junto con la configuración científica y una guía de reproducción, lo que lo convierte en un recurso para investigar sobre eficiencia y estabilidad en RL.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada; heredada del modelo base Qwen2.5-1.5B (transformer) |
| Parametros totales | No disponible (el modelo base tiene 1.500 millones; el repositorio no indica el recuento tras el fine-tuning) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints se publican en FP32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (checkpoints FP32 con tokenizers incluidos) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-1.5B y no se han documentado cambios estructurales en el repositorio. La innovación principal es la técnica de *Unified Fisher / initial-gradient coordinate masking*, que durante el entrenamiento congela dinámicamente ciertas coordenadas de los pesos según la información de Fisher o el gradiente inicial. Las máscaras son booleanas (True = congelado), y tanto el forward como el backward permanecen densos, es decir, no se utilizan kernels sparse.

El entrenamiento se realiza con GRPO en 34 condiciones distintas de una sola GPU, con 1.000 pasos por condición. Se utilizan datos de SimpleRL-Zoo-Data, split `simplelr_abel_level3to5`, que contiene problemas matemáticos. La evaluación consiste en calcular la recompensa media de cuatro respuestas generadas para cada uno de los 500 prompts MATH. No se detalla la composición del dataset de entrenamiento ni la presencia de RLHF o DPO.

## Capacidades

- Investigación en técnicas de enmascaramiento y poda de parámetros.
- Entrenamiento por refuerzo sobre razonamiento matemático (GRPO).
- Herramienta de comparación de presupuestos de coordenadas activas (1 %, 5 %, 10 %, 20 %).
- No se documentan capacidades de tool calling, function calling, agentes, visión o audio.
- Soporte multilingüe: no disponible.
- No se han publicado evaluaciones de capacidades generales de generación de texto.

## Casos de uso

- Investigación en eficiencia de entrenamiento RL: el modelo permite analizar cómo la congelación de coordenadas de pesos mediante información de Fisher afecta a la convergencia y al rendimiento final.
- Reproducción de experimentos científicos: gracias a la guía incluida y a los checkpoints FP32, es posible reproducir las 34 condiciones de entrenamiento y validar los resultados publicados.
- Estudios de ablación de presupuestos de coordenadas: los checkpoints separados por presupuesto (1 %, 5 %, 10 %, 20 %) permiten comparar de forma aislada el impacto del número de coordenadas activas.
- Evaluación de la estabilidad del algoritmo GRPO en modelos pequeños: el modelo sirve como banco de pruebas para estudiar el comportamiento del RL en modelos de 1,5B.
- Investigación sobre la relación entre Fisher information y gradientes iniciales: permite contrastar empíricamente si el enmascaramiento basado en Fisher supera al basado en gradiente inicial.
- Docencia en aprendizaje por refuerzo para LLM: al ser un modelo pequeño, bien documentado y con configuraciones claras, resulta útil para cursos o talleres sobre RLHF y GRPO.
- Desarrollo de pipelines de investigación en RL: sirve como referencia para futuros experimentos que combinen enmascaramiento de coordenadas con otros métodos de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente indica que la evaluación se realiza mediante la recompensa media de cuatro respuestas en 500 prompts MATH, pero no se proporcionan valores numéricos. Por tanto, no es posible presentar una tabla de benchmarks comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB para los pesos en FP32 (1.500 millones de parámetros × 4 bytes), más el overhead de ejecución y los logits. Se recomienda una GPU con al menos 8 GB de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4060 8GB, RTX 3060 12GB o superior sería suficiente.
- Compatibilidad con GPU de consumo: sí, dado el tamaño del modelo base, es probable que funcione en tarjetas de consumo.
- Opciones de despliegue: no especificadas en el repositorio. Al ser un fine-tune de Qwen, podría utilizarse con herramientas estándar como PyTorch, vLLM o llama.cpp, pero no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud de contexto | Licencia | Notas |
| --- | --- | --- | --- | --- |
| Qwen2.5-1.5B (base) | 1.500 millones | No disponible | Apache 2.0 | Modelo de propósito general |
| yufanzh/qwen25-1p5b-sep10-unified-20260909 | No disponible (base 1.500 millones) | No disponible | Apache 2.0 | Artefacto de investigación RL con enmascaramiento |

No se dispone de otros modelos comparables en la misma categoría que hayan publicado benchmarks. Por tanto, la comparativa se limita a la información estructural disponible.

## Limitaciones y advertencias

- Artefacto de investigación, no recomendado para uso en producción.
- No se han publicado evaluaciones de seguridad, sesgos ni riesgo de alucinación.
- El entrenamiento se realizó únicamente con un dataset de matemáticas, lo que limita la generalización a otras tareas.
- La evaluación utiliza una métrica no estándar (recompensa media sobre 500 prompts MATH) y no se proporcionan valores, por lo que no es posible comparar su rendimiento con otros modelos.
- Los pesos se publican en FP32 sin cuantizaciones, lo que implica un mayor consumo de memoria y espacio (12,3 GB).
- La fecha de creación (2026-09-09) es posterior a la actualidad y puede indicar una convención inusual del autor o un error.
- No se detallan los hiperparámetros de GRPO, el número de muestras por prompt ni el proceso de composición del dataset.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yufanzh/qwen25-1p5b-sep10-unified-20260909
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset SimpleRL-Zoo-Data: https://huggingface.co/datasets/hkust-nlp/SimpleRL-Zoo-Data
- Guía del experimento (ruta en repositorio): shared/docs/qwen15b_unified.md
- Configuración científica (ruta en repositorio): shared/config.json
