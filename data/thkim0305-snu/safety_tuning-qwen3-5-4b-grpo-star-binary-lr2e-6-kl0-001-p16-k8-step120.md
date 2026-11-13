# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step120

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary es un ajuste fino del modelo base Qwen/Qwen3.5-4B realizado por el autor thkim0305-SNU mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) y una recompensa binaria de seguridad. El objetivo declarado es alinear el comportamiento del modelo en materia de seguridad, empleando un profesor Qwen3.8-27B con un juez binario estricto (v3) y las directrices Model Spec v2. El entrenamiento se llevó a cabo sobre dos conjuntos de prompts: STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts).

El modelo conserva la arquitectura y el tamaño del base: 4.659.865.088 parámetros (aproximadamente 4,66 mil millones), pesos en safetensors y pipeline declarado de generación de texto, aunque los tags incluyen también image-text-to-text y la familia qwen3_5, lo que sugiere capacidades multimodales heredadas del base. El repositorio ocupa 9,3 GB y contiene únicamente los pesos de inferencia y los activos del tokenizador; el estado del optimizador y los registros de entrenamiento no se publican.

Es relevante ahora porque documenta un experimento reproducible de ajuste por RL para seguridad sobre una familia de modelos reciente, con hiperparámetros explícitos (lr 2e-6 constante, coeficiente KL 0,001, 16 prompts por actualización, 8 respuestas por prompt, 120 pasos de optimizador) y licencia Apache 2.0, lo que facilita su inspección y reutilización. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no se han publicado métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,66 mil millones de parámetros. Sobre ese base se aplica un ajuste fino con GRPO, una variante de optimización por política relativa a grupos que no requiere un modelo crítico separado y que estima la ventaja a partir de varias respuestas muestreadas por prompt. En este caso se generaron 8 respuestas por prompt y 16 prompts por actualización, con una tasa de aprendizaje constante de 2e-6 y un coeficiente de pérdida KL de 0,001 frente al modelo de referencia. Se completaron 120 actualizaciones del optimizador (índice de checkpoint nativo 119).

La señal de recompensa es binaria y proviene de un juez estricto (denominado v3) aplicado por un profesor Qwen3.8-27B, guiado por las directrices Model Spec v2. El entrenamiento se realizó con el modo de razonamiento (thinking) activado, y la pérdida cubre tanto la cadena de razonamiento como la respuesta final. El prompt de sistema del estudiante fue `You are a helpful assistant.`. Los datos de entrenamiento se limitan a STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts). El autor documenta dos ejecuciones: una inicial (`qwen35-star-grpo-binaryv3-specv2-lr2e6-gpu0123-20261110-v1`) y una reanudación (`qwen35-grpo-binaryv3-resume90-fresh-retry6-gpu0123-20261111-v3`). No se especifica el número de tokens de entrenamiento ni la composición detallada de los datasets.

## Capacidades

- Generación de texto conversacional y de respuesta a instrucciones, heredada del base Qwen3.5-4B.
- Razonamiento explícito en modo thinking: el entrenamiento incluye la cadena de razonamiento en la pérdida, por lo que el modelo está optimizado para producir razonamiento y respuesta final.
- Alineación de seguridad: ajuste específico para respuestas seguras ante prompts sensibles, según el esquema de recompensa binaria del autor.
- Procesamiento image-text-to-text: el tag del repositorio lo declara, aunque no se detallan las capacidades multimodales concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no se declaran.
- Capacidades de visión, audio u otras: solo el tag image-text-to-text, sin especificación adicional.

## Casos de uso

- Evaluación de alineación de seguridad: el modelo sirve como referencia para estudiar el efecto de GRPO con recompensa binaria sobre un base de 4,66 B, comparando respuestas antes y después del ajuste en prompts sensibles de STAR-1.
- Investigación reproducible en RLHF/RL: los hiperparámetros publicados (lr 2e-6, KL 0,001, 16 prompts, 8 respuestas, 120 pasos) permiten replicar el experimento y analizar la estabilidad del entrenamiento con recompensa binaria.
- Filtrado y clasificación de respuestas en pipelines de moderación: el modelo puede generar respuestas de referencia seguras que se usen como patrón en la construcción de datasets de moderación, dado su ajuste específico en seguridad.
- Asistente conversacional de bajo coste: con 4,66 B de parámetros, es desplegable en una sola GPU de consumo o de datacenter pequeña, adecuado para prototipos de atención al cliente donde el coste por token importa.
- Generación de razonamiento supervisado: al entrenarse con thinking activado, puede emplearse para producir trazas de razonamiento etiquetadas que alimenten posteriores ajustes supervisados.
- Base para experimentos de destilación: al haber sido entrenado con un profesor Qwen3.8-27B, resulta útil para estudiar la transferencia de comportamiento de un modelo grande a uno pequeño en el dominio de seguridad.
- Prototipado multimodal: si se confirma la capacidad image-text-to-text del base, podría usarse en tareas de descripción de imágenes o respuesta a preguntas visuales en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, en torno a 10-12 GB según longitud de contexto.
- Cuantización a 8 bits: aproximadamente 4,7 GB de pesos; a 4 bits: aproximadamente 2,4 GB de pesos (estimaciones teóricas a partir del número de parámetros; no se publican cuantizaciones GGUF en el repositorio).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 sin problemas de memoria.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary (este) | 4,66 B | no disponible | Apache 2.0 | Ajuste GRPO de seguridad sobre Qwen3.5-4B; sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | 4,66 B | no disponible | no disponible en la información | Modelo original sin ajuste de seguridad; referencia directa del fine-tuning |
| Qwen3.8-27B (profesor) | no disponible | no disponible | no disponible en la información | Usado como juez/profesor en el entrenamiento; no es un competidor directo |
| Alternativas de 4 B orientadas a seguridad | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas: no hay benchmarks de seguridad, utilidad ni tasas de rechazo, por lo que el efecto real del ajuste no está verificado de forma independiente.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; el ajuste por RL de seguridad no elimina la generación de contenido factualmente incorrecto.
- Sesgos conocidos: no documentados por el autor; los sesgos del base Qwen3.5-4B se heredan sin mitigación específica declarada.
- Idiomas: no se declaran los idiomas soportados, lo que impide garantizar un comportamiento consistente fuera del inglés (el prompt de sistema de entrenamiento está en inglés).
- Contexto: la longitud de contexto no se especifica; no debe asumirse la del base sin verificación.
- Datos de entrenamiento limitados: 1.915 prompts en total, un volumen reducido que puede provocar sobreajuste a los estilos de respuesta del juez binario y del profesor.
- Dependencia del juez: la calidad de la alineación depende del juez binario v3 y del profesor Qwen3.8-27B; no se publican sus criterios completos ni su fiabilidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye sin estado del optimizador ni registros de entrenamiento.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.
- Capacidad multimodal incierta: el tag image-text-to-text no está respaldado por documentación sobre el procesador de imágenes ni ejemplos de uso.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
