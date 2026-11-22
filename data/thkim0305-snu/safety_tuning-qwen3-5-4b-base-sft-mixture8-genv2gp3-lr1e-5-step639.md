# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step639

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step639 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo se ha entrenado con el objetivo de mejorar el comportamiento de seguridad del modelo base mediante la destilación de trayectorias generadas por un profesor de mayor tamaño, Qwen/Qwen3.8-27B, sobre un conjunto de datos de seguridad denominado "mixture-8".

Se trata de un snapshot, no de un modelo final: corresponde a la actualización de optimizador 639 de 730 previstas (1,75 de 2 épocas). Los pesos están en formato bf16 y mantienen la arquitectura Qwen3.5 con torre de visión y cabeza MTP intactas (solo se entrenó el modelo de lenguaje), por lo que carga exactamente igual que el modelo base.

Su relevancia es metodológica: documenta con detalle una receta de SFT de seguridad con datos destilados, incluyendo composición del dataset, hiperparámetros y checkpoints intermedios. No obstante, al ser un checkpoint intermedio con cero descargas y sin benchmarks publicados, no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en entrenamiento |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction). En este checkpoint solo se entrenó el modelo de lenguaje mediante SFT de parámetros completos sobre trayectorias de profesor; la torre de visión y la cabeza MTP conservan los pesos del base sin tocar, y las proyecciones GDN se re-fusionaron durante la exportación desde Megatron a Hugging Face.

La receta usa Slime + Megatron-LM con cómputo en bf16 y estado del optimizador en fp32. El dataset "mixture-8" contiene 46.626 trayectorias provenientes de 11.757 prompts, destiladas de Qwen/Qwen3.8-27B (cuatro respuestas muestreadas por prompt, conservando todas las válidas). Las fuentes son star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). El entrenamiento cubre 2 épocas (365 actualizaciones de 128 secuencias), con learning rate pico 1e-05, warmup lineal del 10 %, decaimiento coseno hasta 2e-06, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y grad clip 1.0. La pérdida se calcula sobre el razonamiento, la respuesta final y las llamadas a herramientas. Las trayectorias de más de 32.768 tokens se excluyen enteras, nunca se truncan. Se publican checkpoints en las actualizaciones 91, 183, 274, 365, 456, 548, 639 y 730.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa del base y modo de razonamiento (thinking) activado por defecto.
- Razonamiento multi-paso: el entrenamiento incluye pérdida sobre las trazas de razonamiento del profesor.
- Llamadas a herramientas (tool calling): la pérdida cubre explícitamente las tool calls presentes en las trayectorias.
- Comportamiento orientado a agentes: parte del dataset (agentalign_harmful y agentalign_benign) está compuesto por trayectorias agénticas.
- Generación de código, con datos de magicoder y codesafetybench en el entrenamiento.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque el ajuste solo afectó al modelo de lenguaje.
- Alineación de seguridad: el objetivo del ajuste es mejorar la respuesta ante prompts dañinos, benignos y de jailbreak.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la model card).

## Casos de uso

- Investigación en alineación de seguridad: sirve como checkpoint de referencia para estudiar el efecto del SFT con datos destilados sobre el comportamiento de rechazo y utilidad, comparando los distintos checkpoints publicados (91 a 730).
- Evaluación de destilación de profesor a alumno: permite analizar cuánto del comportamiento de Qwen3.8-27B se transfiere a un modelo de 4,66 B en 1,75 épocas.
- Clasificación y filtrado de contenido sensible: el modelo puede emplearse en pipelines internos para detectar y reformular solicitudes dañinas, dado el énfasis del dataset en agentalign_harmful y wildjailbreak_benign.
- Asistente conversacional con razonamiento explícito: el modo thinking y la plantilla de chat nativa permiten desplegarlo en prototipos de atención al usuario donde se quiera auditar la traza de razonamiento.
- Agentes con tool calling en entornos controlados: la inclusión de trayectorias agénticas y de tool calls en la pérdida lo hace adecuado para experimentos de agentes de un solo paso con herramientas acotadas.
- Generación de código asistida en investigación de seguridad de software: los datos de codesafetybench y magicoder permiten probar el equilibrio entre utilidad de código y rechazo de peticiones maliciosas.
- Estudio de jailbreaks: el conjunto wildjailbreak_benign permite evaluar la robustez frente a prompts adversarios benignos y su efecto en la tasa de falsos rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (el tamaño del repo es de 9,3 GB), más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contexto moderado.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 2,5 a 3 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas: NVIDIA B200 fue la usada para el entrenamiento (1 GPU); para inferencia, A100 40/80 GB, H100 o L40S ofrecen margen amplio. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberían acomodar el modelo en bf16 con contexto limitado.
- Cabe en GPU de consumo de 16 GB o más en bf16 con contexto corto; en 8 bits o 4 bits cabría en 8-12 GB.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM y TGI si la arquitectura Qwen3.5 está soportada por esas versiones; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step639 | 4,66 B | 32.768 | Apache 2.0 | Checkpoint intermedio, sin benchmarks |
| Qwen/Qwen3.5-4B-Base (modelo base) | 4,66 B | no disponible en la informacion | Apache 2.0 | Modelo base publicado |
| Qwen/Qwen3.8-27B (profesor) | 27 B (aprox.) | no disponible en la informacion | no disponible en la informacion | Profesor usado para destilacion |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio (1,75 de 2 épocas), no un modelo final; el autor lo declara explícitamente como snapshot en progreso.
- No se han publicado benchmarks ni evaluaciones de seguridad cuantitativas; no hay evidencia de que el ajuste reduzca la tasa de respuestas dañinas en producción.
- Cero descargas y cero likes en Hugging Face: sin validación por parte de la comunidad.
- El ajuste solo cubre el modelo de lenguaje; las capacidades de visión no se han entrenado ni evaluado.
- Riesgo de alucinación inherente a un modelo de 4,66 B y a la destilación de trayectorias sintéticas del profesor.
- Sesgos: no documentados; el dataset incluye fuentes de seguridad y de código, pero no se describe su composición demográfica ni lingüística.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluación, no se recomienda su despliegue en producción.
- El contexto de entrenamiento es de 32.768 tokens; trayectorias más largas se descartaron, lo que puede dejar lagunas en tareas de contexto muy largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step639
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
