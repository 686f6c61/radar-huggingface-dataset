# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step240

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step240` es un ajuste fino del modelo base Qwen/Qwen3.5-4B realizado por el autor thkim0305-SNU mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El objetivo declarado es el alineamiento de seguridad: el modelo ha sido entrenado para responder de forma segura ante peticiones potencialmente dañinas, utilizando una recompensa binaria estricta evaluada por un modelo profesor de mayor tamaño (Qwen3.8-27B) y una especificación de modelo (Model Spec v2).

El entrenamiento se realizó sobre dos conjuntos de datos: STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts), con 16 prompts por actualización y 8 respuestas por prompt, completando 240 actualizaciones del optimizador. El modelo conserva la arquitectura multimodal del Qwen3.5-4B original (etiqueta `image-text-to-text`), con 4.659.865.088 parámetros totales y un tamaño de repositorio de 9,3 GB en formato safetensors.

Es relevante porque documenta un experimento reproducible de ajuste de seguridad con RL sobre un modelo de 4B con capacidades de visión, publicando los hiperparámetros exactos (learning rate 2e-6 constante, coeficiente KL 0.001) y el pipeline de recompensa binaria. El modo de razonamiento (thinking) está habilitado y la pérdida de entrenamiento cubre tanto el razonamiento como la respuesta final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal capaz de procesar imagen y texto (pipeline `image-text-to-text`), aunque la model card no detalla la arquitectura interna, el número de capas ni la composición del corpus de preentrenamiento del modelo base. El ajuste se realizó con GRPO, un algoritmo de RL sin crítico que estima la ventaja relativa dentro de un grupo de respuestas generadas para cada prompt.

Los datos de entrenamiento son STAR-1 (1.000 prompts) y STAR-benign-915 (915 prompts). La recompensa es binaria estricta (v3) y se calcula con un modelo profesor Qwen3.8-27B guiado por Model Spec v2. Los hiperparámetros publicados son: 240 actualizaciones del optimizador (índice de checkpoint nativo 239), learning rate constante de 2e-6, coeficiente de pérdida KL de 0.001, 16 prompts por actualización y 8 respuestas por prompt. El modo thinking está activado y la pérdida cubre tanto la cadena de razonamiento como la respuesta. El system prompt del estudiante es `You are a helpful assistant.`. Se documentan dos ejecuciones: la inicial (`qwen35-star-grpo-binaryv3-specv2-lr2e6-gpu0123-20261110-v1`) y una reanudación (`qwen35-grpo-binaryv3-resume90-fresh-retry6-gpu0123-20261111-v3`). El repositorio solo contiene los pesos de inferencia y el tokenizer; el estado del optimizador y los registros de entrenamiento permanecen en el almacenamiento original de checkpoints.

## Capacidades

- Generación de texto conversacional con pipeline `text-generation` y `conversational`.
- Procesamiento de imagen y texto (etiqueta `image-text-to-text` heredada del modelo base).
- Razonamiento explícito en modo thinking, ya que el entrenamiento incluye la cadena de razonamiento en la pérdida.
- Alineamiento de seguridad entrenado con recompensa binaria y Model Spec v2, orientado a rechazar o reformular peticiones dañinas.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo thinking facilita cadenas de razonamiento.
- Capacidades multilingües: no disponible.

## Casos de uso

- Moderación y filtrado de contenido en producción: el ajuste con recompensa binaria sobre STAR-1 permite usar el modelo como clasificador generativo de peticiones dañinas, aprovechando el modo thinking para justificar la decisión antes de responder.
- Asistentes conversacionales con requisitos de seguridad: al mantener el system prompt `You are a helpful assistant.` y haber sido entrenado para respuestas seguras, encaja en despliegues de atención al cliente donde se exige rechazo controlado de solicitudes sensibles.
- Investigación en alineamiento con RL: los hiperparámetros publicados (lr 2e-6, KL 0.001, 16 prompts × 8 respuestas) permiten reproducir o comparar experimentos de GRPO con recompensa binaria sobre modelos de 4B.
- Evaluación de robustez de salvaguardas: sirve como línea base para medir la tasa de rechazo y la tasa de falsos positivos frente a prompts benignos del conjunto STAR-benign-915.
- Procesamiento de documentos con imagen y texto: la arquitectura multimodal heredada permite extraer y razonar sobre contenido de capturas o formularios escaneados en flujos internos.
- Generación de respuestas con razonamiento trazable: el modo thinking activado facilita auditorías internas, ya que la cadena de razonamiento queda separada de la respuesta final.
- Despliegue en infraestructura modesta: con 4,66B parámetros, el modelo puede servirse en una sola GPU de 24 GB con cuantización de 8 bits, lo que abarata experimentos de seguridad a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo de pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB de pesos; en 4 bits, alrededor de 3 GB, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues concurrentes; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantización) y RTX 4070 Ti Super (16 GB, con cuantización).
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir en producción; llama.cpp y Ollama requerirían conversión a GGUF, no publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary (este) | 4,66B | no disponible | Ajuste de seguridad con GRPO y recompensa binaria | Apache 2.0 | Pesos safetensors en HF |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Modelo multimodal generalista | Apache 2.0 | Pesos en HF |
| Alternativas de ajuste de seguridad de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (ajuste de seguridad con GRPO sobre Qwen3.5-4B) en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento se realizó con solo 240 actualizaciones sobre 1.915 prompts en total; el ajuste de seguridad puede ser superficial y no generalizar a dominios no cubiertos por STAR-1 y STAR-benign-915.
- La recompensa binaria estricta puede inducir sobre-rechazo (falsos positivos) en peticiones benignas que se parezcan superficialmente a las dañinas.
- Riesgo de alucinación inherente al modelo base Qwen3.5-4B; el ajuste de seguridad no elimina este comportamiento en tareas factuales.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar un rendimiento multilingüe o con contextos largos.
- El modo thinking activado incrementa el consumo de tokens y la latencia en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluaciones de seguridad independientes; se recomienda auditoría propia antes de desplegar.
- El repositorio no incluye estado del optimizador, registros de entrenamiento ni versiones cuantizadas, lo que limita la reproducibilidad completa y el despliegue en entornos con poca VRAM.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-binary-lr2e-6-kl0.001-p16-k8-step240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
