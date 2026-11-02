# superuser77/llm-course-hw2-dpo

## Resumen

El modelo `superuser77/llm-course-hw2-dpo` es un ajuste fino por DPO (Direct Preference Optimization) del modelo base `HuggingFaceTB/SmolLM-135M-Instruct`, desarrollado por el usuario superuser77 en el contexto de un curso de formación sobre modelos de lenguaje. Se trata de un experimento educativo cuyo objetivo declarado era acercar las respuestas generadas a las respuestas humanas preferidas del dataset `HumanLLMs/Human-Like-DPO-Dataset`. El modelo cuenta con 134.515.008 parámetros y un tamaño de repositorio de 0,5 GB.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto de aprendizaje, no de un modelo pensado para despliegue real. El propio autor reconoce en la model card que los resultados no muestran una mejora clara de calidad e incluso aparecen repeticiones en la generación. Aun así, resulta útil como referencia para entender el flujo completo de un ajuste DPO sobre un modelo pequeño de la familia SmolLM.

Arquitectónicamente hereda todo del modelo base SmolLM-135M-Instruct (transformer decoder-only de pequeño tamaño, orientado a instrucciones), y solo se modifican los pesos mediante el entrenamiento de preferencias. No se dispone de información sobre la licencia ni sobre el contexto máximo del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó máximo 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por DPO sobre `HuggingFaceTB/SmolLM-135M-Instruct`. La arquitectura subyacente es la del modelo base (transformer decoder-only de 135M de parámetros), y el entrenamiento de preferencias no introduce cambios estructurales, solo actualiza los pesos para alinear las respuestas con las opciones preferidas del dataset.

Los detalles de entrenamiento documentados por el autor son: 10.884 pares de preferencia, una época, tamaño de batch 2, learning rate 5e-5, coeficiente beta 1.0, longitud máxima de 1024 tokens con el prompt truncado a 256 tokens, y entrenamiento en una GPU T4 con precisión mixta. El dataset utilizado es `HumanLLMs/Human-Like-DPO-Dataset`. No se documentan técnicas adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Ajuste orientado a preferencias humanas mediante DPO (respuestas más coloquiales según el autor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- El autor advierte de aparición de repeticiones en la generación tras el ajuste.

## Casos de uso

- Experimentación educativa en cursos de alineación: sirve para reproducir un pipeline DPO completo (dataset de preferencias, entrenamiento con beta, evaluación por log-probabilidades) sobre un modelo pequeño que cabe en una GPU T4.
- Comparación de metodologías de alineación: permite contrastar DPO frente a PPO y frente a un reward model dentro del mismo conjunto de ejercicios del curso (el autor publica también `llm-course-hw2-reward-model` y `llm-course-hw2-ppo`).
- Estudio de degradación por sobreajuste: útil para analizar empíricamente cómo un ajuste DPO con batch pequeño y una sola época puede introducir repeticiones y deteriorar la coherencia.
- Evaluación de métricas de log-probabilidad: el autor reporta log-probs medias por token de respuesta (-2,417 en el dataset de entrenamiento y -3,938 en `databricks/databricks-dolly-15k`), lo que permite practicar la comparación entre distribuciones de entrenamiento y de validación.
- Prototipado rápido de chatbots de bajo coste: al ocupar 0,5 GB en safetensors, puede cargarse en entornos con recursos muy limitados para pruebas de integración con `transformers` o `text-generation-inference`.
- Docencia sobre limitaciones de modelos pequeños: ejemplifica de forma concreta por qué un modelo de 135M no es adecuado para tareas de razonamiento complejo, incluso después de alineación por preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta log-probabilidades medias por token de respuesta:

| Metrica | Valor |
|---|---|
| Log-prob media por token (100 ejemplos del dataset de entrenamiento) | -2,417 |
| Log-prob media por token (100 ejemplos de databricks/databricks-dolly-15k) | -3,938 |

El propio autor indica que esta comparación no constituye prueba de memorización ni de calidad de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,3-0,5 GB en fp16 para los 134,5M de parámetros; menos de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; el entrenamiento se realizó en una NVIDIA T4.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo); no se documenta soporte explícito de GGUF, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| superuser77/llm-course-hw2-dpo | 134,5M | no disponible | no disponible | Ajuste DPO educativo sobre SmolLM-135M-Instruct |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | no disponible | no disponible en la informacion | Modelo base Instruct del que deriva |
| superuser77/llm-course-hw2-ppo | no disponible | no disponible | no disponible | Variante PPO del mismo ejercicio |
| superuser77/llm-course-hw2-reward-model | no disponible | no disponible | no disponible | Reward model del mismo ejercicio |

## Limitaciones y advertencias

- El propio autor reconoce que no observa mejora de calidad y que aparecen repeticiones tras el ajuste DPO.
- Riesgo elevado de alucinación y de incoherencia, propio de un modelo de 135M de parámetros.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Entrenamiento con batch 2, una sola época y evaluación sobre 100 ejemplos: conclusiones estadísticamente débiles.
- No hay información sobre la longitud de contexto efectiva del modelo base en la documentación proporcionada.
- No apto para producción: es un artefacto educativo sin validación externa ni benchmarks publicados.

## Enlaces

- [HuggingFace: superuser77/llm-course-hw2-dpo](https://huggingface.co/superuser77/llm-course-hw2-dpo)
- [Reward model del mismo curso](https://huggingface.co/superuser77/llm-course-hw2-reward-model)
- [Variante PPO del mismo curso](https://huggingface.co/superuser77/llm-course-hw2-ppo)
- [Modelo base: HuggingFaceTB/SmolLM-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct)
- [Dataset: HumanLLMs/Human-Like-DPO-Dataset](https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset)
- [Dataset de evaluación: databricks/databricks-dolly-15k](https://huggingface.co/datasets/databricks/databricks-dolly-15k)
