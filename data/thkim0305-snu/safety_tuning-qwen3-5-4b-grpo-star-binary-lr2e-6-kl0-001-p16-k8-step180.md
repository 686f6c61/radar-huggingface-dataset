# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step180

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step180 es un ajuste fino del modelo base Qwen/Qwen3.5-4B realizado por el usuario thkim0305-SNU mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El objetivo del entrenamiento es la alineación de seguridad: se utilizan recompensas binarias estrictas, evaluadas por un modelo profesor Qwen3.8-27B, sobre los conjuntos de datos STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts), siguiendo la especificación Model Spec v2.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-4B original, con 4.659.865.088 parámetros totales almacenados en safetensors (aproximadamente 4,66 mil millones). El repositorio ocupa 9,3 GB e incluye únicamente los pesos de inferencia y los activos del tokenizador; el estado del optimizador y los registros de entrenamiento permanecen en el almacenamiento original del checkpoint.

Es relevante como ejemplo práctico de ajuste de seguridad con RL sobre un modelo de 4B, un tamaño que cabe en GPU de consumo y permite experimentación reproducible. La nomenclatura del repositorio documenta con precisión los hiperparámetros empleados (learning rate 2e-6, coeficiente KL 0,001, 16 prompts por actualización, 8 respuestas por prompt, paso 180), lo que facilita la trazabilidad del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de atención y capas no disponibles) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizaciones estándar de la familia Qwen3.5, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,66 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO, un algoritmo de optimización de política que estima ventajas relativas dentro de un grupo de respuestas generadas para cada prompt, evitando la necesidad de un modelo crítico separado. En este caso se generan 8 respuestas por prompt y se procesan 16 prompts por actualización, con un learning rate constante de 2e-6 y un coeficiente de pérdida KL de 0,001 frente al modelo de referencia.

El entrenamiento se realizó en dos fases: una ejecución inicial (`qwen35-star-grpo-binaryv3-specv2-lr2e6-gpu0123-20261110-v1`) y una reanudación (`qwen35-grpo-binaryv3-resume90-fresh-retry6-gpu0123-20261111-v3`), completando 180 actualizaciones del optimizador (índice de checkpoint nativo 179). La recompensa es binaria y estricta, evaluada por un profesor Qwen3.8-27B bajo Model Spec v2, sobre 1.915 prompts de seguridad y benignos. El modo de razonamiento (thinking) está activado y la pérdida de entrenamiento cubre tanto el razonamiento como la respuesta final. El prompt de sistema del estudiante es `You are a helpful assistant.`

## Capacidades

- Generación de texto conversacional con soporte de modo thinking (razonamiento explícito antes de la respuesta).
- Alineación de seguridad reforzada mediante RL con recompensa binaria, orientada a reducir respuestas dañinas o no conformes con la especificación.
- Procesamiento de entradas imagen-texto según la etiqueta `image-text-to-text` del repositorio, heredada del modelo base.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de alineación de seguridad: sirve como referencia reproducible para comparar GRPO con recompensa binaria frente a otras estrategias (RLHF, DPO) sobre un modelo de 4B, gracias a la documentación detallada de hiperparámetros y checkpoints.
- Filtrado y moderación de contenido generado: el ajuste con recompensa binaria estricta lo hace adecuado como componente en pipelines de revisión de respuestas, clasificando o reescribiendo salidas potencialmente dañinas.
- Investigación académica en seguridad de LLM: su tamaño reducido permite ejecutar experimentos completos de fine-tuning e inferencia en clústeres pequeños (4 GPU según los nombres de ejecución `gpu0123`), facilitando la reproducibilidad.
- Asistente conversacional con salvaguardas: para prototipos donde se requiere un modelo ligero que mantenga un tono útil y rechace peticiones problemáticas, con la ventaja de caber en hardware de consumo.
- Generación de datos sintéticos de seguridad: puede emplearse para producir pares prompt-respuesta etiquetados en la construcción de datasets de alineación, aprovechando su comportamiento reforzado.
- Despliegue en entornos con recursos limitados: al tratarse de un modelo de ~4,66B parámetros con licencia Apache 2.0, es viable integrarlo en servicios internos o demos públicas sin costes de licencia y con requisitos de VRAM moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~4,66B parámetros: en FP16/BF16 se requieren aproximadamente 9,3 GB solo para pesos (el repositorio ocupa 9,3 GB), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 5 GB; en 4 bits, en torno a 3 GB. Estas cifras son estimaciones genéricas, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento se ejecutó en un nodo con al menos 4 GPU (identificadas como `gpu0123` en los nombres de ejecución); el modelo concreto no se especifica.
- ¿Cabe en GPU de consumo? Con cuantización de 4 u 8 bits, previsiblemente sí en tarjetas con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070), aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (librería declarada). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas en la información disponible; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR (este modelo) | 4,66B | no disponible | Ajuste de seguridad con GRPO y recompensa binaria | apache-2.0 | Hugging Face, 24 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | Modelo generalista preentrenado y alineado | no disponible en esta ficha | Hugging Face |
| Qwen3.8-27B (profesor del entrenamiento) | ~27B | no disponible | Modelo de mayor tamaño usado como juez | no disponible en esta ficha | Referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad residual ni tasas de alucinación; el ajuste de seguridad no garantiza la ausencia de respuestas problemáticas.
- El entrenamiento se realizó con solo 1.915 prompts (1.000 de STAR-1 y 915 de STAR-benign-915), un volumen reducido que puede limitar la generalización a dominios y idiomas no cubiertos.
- Los idiomas soportados no están documentados; el comportamiento fuera del inglés (idioma del prompt de sistema) es incierto.
- La longitud de contexto no se especifica; no debe asumirse la del modelo base sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; es un checkpoint de investigación con 0 likes y 24 descargas, sin validación comunitaria.
- El estado del optimizador y los registros de entrenamiento no están en el repositorio, lo que limita la reproducción exacta del proceso.
- El uso de un profesor de 27B como juez puede introducir sesgos del profesor en el comportamiento del estudiante (reward hacking o sobreajuste a la especificación v2).
- Al estar entrenado con modo thinking activado, las respuestas pueden incluir trazas de razonamiento que incrementan la latencia y el consumo de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step180
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
- Paper de GRPO (DeepSeekMath): no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
