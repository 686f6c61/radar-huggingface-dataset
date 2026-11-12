# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step30

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step30 es un ajuste fino del modelo Qwen/Qwen3.5-4B realizado por el usuario thkim0305-SNU mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) y una recompensa binaria de seguridad. El objetivo del entrenamiento es alinear el comportamiento del modelo base en materia de seguridad, utilizando un profesor Qwen3.8-27B con un juez binario estricto (v3) y una especificación de modelo (Model Spec v2) como referencia de evaluación.

El modelo conserva la arquitectura del Qwen3.5-4B original, con 4.659.865.088 parámetros totales según los pesos en safetensors, y se distribuye en formato transformers con pesos safetensors. El repositorio ocupa 9,3 GB e incluye únicamente los pesos de inferencia y los activos del tokenizador; el estado del optimizador y los registros de entrenamiento permanecen en el almacenamiento del checkpoint original.

Se trata de un checkpoint intermedio (30 actualizaciones del optimizador, índice de checkpoint nativo 29) de una ejecución de investigación sobre seguridad. Su relevancia radica en que documenta una receta concreta de RL para safety tuning sobre un modelo multimodal pequeño, aunque al ser un paso temprano del entrenamiento y no contar con benchmarks publicados, su utilidad práctica en producción debe validarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); soporte image-text-to-text |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal (etiquetado como image-text-to-text) de aproximadamente 4,66 mil millones de parámetros. El ajuste se realizó con GRPO, un algoritmo de optimización de política que estima ventajas relativas dentro de un grupo de respuestas generadas para cada prompt, sin necesidad de un modelo crítico separado. La recompensa es binaria y se calcula con un juez estricto (binary v3) guiado por una especificación de modelo (Model Spec v2), usando un profesor Qwen3.8-27B como referencia.

Los datos de entrenamiento son STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts). La configuración reportada incluye 30 actualizaciones del optimizador, tasa de aprendizaje constante de 2e-6, coeficiente de pérdida KL de 0.001, 16 prompts por actualización y 8 respuestas por prompt. El modo thinking está activado y la pérdida de entrenamiento cubre tanto el razonamiento como la respuesta. El prompt de sistema del estudiante es `You are a helpful assistant.` La ejecución se identifica como `qwen35-star-grpo-binaryv3-specv2-lr2e6-gpu0123-20261110-v1`. No se especifican el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de los recuentos de prompts.

## Capacidades

- Generación de texto conversacional, con pipeline declarado como text-generation.
- Procesamiento image-text-to-text, heredado del modelo base Qwen3.5-4B (etiqueta del repositorio).
- Modo thinking activado durante el entrenamiento, con razonamiento incluido en la pérdida.
- Alineamiento de seguridad entrenado con recompensa binaria y especificación de modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo thinking sugiere capacidad de razonamiento, pero no se documenta su rendimiento.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades de audio: no disponible.

## Casos de uso

- Evaluación de recetas de safety tuning: el modelo sirve como checkpoint de referencia para estudiar el efecto de 30 pasos de GRPO con recompensa binaria sobre un Qwen3.5-4B, comparando su comportamiento con el modelo base en prompts sensibles.
- Investigación en alineamiento con RL: permite reproducir y analizar la configuración reportada (lr 2e-6, KL 0.001, 16 prompts × 8 respuestas) en entornos académicos con GPUs modestas.
- Filtrado y moderación de contenido en prototipos: puede emplearse como generador de respuestas seguras en pipelines de prueba, validando antes su tasa de rechazo y falsos positivos sobre el conjunto STAR.
- Asistente conversacional de bajo coste: con ~4,66 mil millones de parámetros, es desplegable en una sola GPU consumer o de datacenter pequeña para prototipos de chat multi-turno, siempre que se valide su calidad tras el ajuste.
- Experimentos multimodales ligeros: al heredar la etiqueta image-text-to-text, puede probarse en tareas de descripción de imágenes o respuesta a preguntas visuales, verificando que el ajuste de seguridad no haya degradado esa capacidad.
- Base para ajustes posteriores: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para continuar el entrenamiento o aplicar DPO/SFT adicional en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 16-24 GB.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100, H100 o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16/BF16 en contextos moderados; RTX 3090/4080 para cuantización.
- Cabe en GPU consumer: sí, en tarjetas de 16-24 GB en FP16 y en 8-12 GB con cuantización de 4-8 bits, sujeto a la longitud de contexto.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp/Ollama si se generan conversiones GGUF (no publicadas en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR (este) | 4,66 B | no disponible | Safety tuning con GRPO y recompensa binaria | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Modelo multimodal generalista | Apache 2.0 (según repositorio base) | Hugging Face |
| Alternativas de safety tuning de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 30 actualizaciones del optimizador, por lo que el efecto del ajuste de seguridad puede ser limitado o inestable.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en seguridad ni de preservación de capacidades generales.
- Riesgo de sobreajuste al juez binario: la recompensa binaria con un juez concreto puede producir comportamientos que optimicen ese criterio sin mejorar la seguridad real (reward hacking).
- Posible degradación de capacidades: el ajuste con RL sobre un dataset pequeño (1.915 prompts) puede afectar al rendimiento en tareas generales y multimodales del modelo base.
- Idiomas y contexto no documentados: se desconoce el soporte multilingüe y la longitud de contexto efectiva tras el ajuste.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar el modelo base, puede reproducir sesgos presentes en él.
- Alucinación: no se han publicado métricas de fidelidad; el modo thinking activado no garantiza respuestas veraces.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también las condiciones del modelo base Qwen3.5-4B.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
