# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step344

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step344 es un checkpoint de ajuste fino por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. El objetivo declarado es el alineamiento de seguridad: se entrena al modelo para preferir respuestas etiquetadas como seguras (score 1) frente a respuestas etiquetadas como inseguras (score 0), ambas generadas por un modelo profesor de mayor tamaño (Qwen3.8-27B).

El modelo conserva la naturaleza multimodal del base (pipeline image-text-to-text) y sus pesos de visión y MTP (multi-token prediction), por lo que mantiene capacidad de entrada de imagen y texto además de la generación de lenguaje. El entrenamiento se realizó sobre una mezcla de ocho conjuntos de datos con 5.493 pares de preferencia distribuidos en 1.755 prompts, durante 344 pasos de optimizador (4 épocas), con beta 0.1, batch de 64 pares y learning rate máximo de 1e-6.

Es relevante porque documenta una receta reproducible de safety tuning ligero sobre un modelo de 4B con licencia Apache 2.0, lo que permite su uso comercial y su despliegue en hardware de consumo. No obstante, la información publicada es mínima: no hay benchmarks, no se detallan los ocho datasets ni los idiomas soportados, y el modelo no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5; incluye pesos de visión y MTP (multi-token prediction) |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`), un transformer multimodal con codificador de visión y cabecera de multi-token prediction. El ajuste DPO modifica únicamente los pesos de lenguaje entrenados; el export preserva explícitamente los pesos de visión y MTP del modelo base, de modo que las capacidades de entrada de imagen se mantienen intactas tras el alineamiento.

El entrenamiento consistió en 344 actualizaciones del optimizador, equivalentes a 4 épocas sobre una mezcla de ocho datasets con 5.493 pares de preferencia y 1.755 prompts. Para cada prompt, las respuestas elegida y rechazada provinieron ambas de Qwen3.8-27B, actuando como profesor: la respuesta con score binario 1 se asignó como *chosen* y la de score 0 como *rejected*. Los hiperparámetros declarados son beta 0.1 (coeficiente de regularización KL del DPO), batch de 64 pares y learning rate máximo de 1e-6. No se documentan la composición de los ocho datasets, el número de tokens de entrenamiento ni si hubo etapas adicionales de SFT o RLHF más allá del DPO.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del modelo base.
- Procesamiento de entrada de imagen y texto (pipeline image-text-to-text), con pesos de visión preservados del base.
- Multi-token prediction (MTP) conservado del modelo base, orientado a decodificación más eficiente.
- Alineamiento de seguridad: preferencia por respuestas etiquetadas como seguras según el criterio del profesor Qwen3.8-27B.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible en la información publicada.
- Modo thinking explícito: no disponible en la información publicada.

## Casos de uso

- Filtrado de respuestas en asistentes conversacionales: el ajuste DPO puede emplearse como capa de seguridad que penaliza respuestas con score 0 según el profesor, integrada en un pipeline de moderación previa a la entrega al usuario.
- Investigación en alineamiento: sirve como punto de comparación reproducible (beta 0.1, lr 1e-6, 344 pasos) para estudiar el efecto del DPO sobre un base de 4B con profesor de 27B.
- Despliegue en entornos con recursos limitados: con 4,66B parámetros y licencia Apache 2.0, es viable en GPUs de consumo para prototipos de asistentes seguros.
- Procesamiento de documentos con imagen y texto: al conservar los pesos de visión, puede emplearse en tareas de descripción de capturas o extracción de información de imágenes combinadas con instrucciones textuales.
- Generación de datos de preferencia sintéticos: el modelo ajustado puede actuar como generador de respuestas candidatas que luego se filtran con un clasificador de seguridad para ampliar datasets de DPO.
- Evaluación comparativa de safety tuning: permite medir la degradación o mejora en calidad conversacional frente al base Qwen3.5-4B-Base tras 4 épocas de DPO con profesor de mayor tamaño.
- Base para ajustes posteriores: al ser un checkpoint intermedio (step 344) con licencia permisiva, puede servir de inicialización para SFT específico de dominio manteniendo el alineamiento de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos (coincide con el tamaño del repo); con overhead de activaciones y caché KV, se recomienda al menos 12-16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB (estimación teórica, no verificada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en producción con batching; RTX 4090 (24 GB) para fp16 con margen; RTX 3090/4080 (16-24 GB) para fp16 ajustado o 8 bits.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, en cuantización de 4 bits, potencialmente en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están documentados por el autor y requerirían conversión a GGUF para los dos últimos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO (este) | 4,66B | no disponible | Apache 2.0 | Sí (visión + MTP) | Checkpoint DPO de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | 4B (aprox.) | no disponible | Apache 2.0 (según base) | Sí | Modelo base sin alineamiento DPO; referencia directa |
| Qwen3.8-27B (profesor) | 27B (aprox.) | no disponible | no disponible | no disponible | Usado como generador de pares de preferencia; mayor capacidad |
| Alternativas de 4B con safety tuning | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables documentados en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora en seguridad ni de mantenimiento de calidad conversacional frente al base.
- Sesgo del profesor: las etiquetas de seguridad provienen exclusivamente de Qwen3.8-27B, por lo que el criterio de "respuesta segura" hereda los sesgos y políticas de ese modelo.
- Riesgo de alucinación: no se documenta ninguna mitigación específica más allá del DPO; el ajuste de preferencias no elimina la generación de contenido falso.
- Idiomas no declarados: se desconoce qué lenguas cubre el ajuste y si el DPO degradó el rendimiento multilingüe del base.
- Contexto no documentado: se desconoce la ventana máxima efectiva tras el ajuste.
- Datasets no transparentes: los ocho conjuntos de la mezcla no se detallan, lo que impide auditar la cobertura de categorías de riesgo.
- Checkpoint intermedio: corresponde al paso 344 (4 épocas); no se garantiza que sea el punto óptimo de la curva de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el cumplimiento normativo recae en el desplegador.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step344
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revisión del base usada en el entrenamiento: https://huggingface.co/Qwen/Qwen3.5-4B-Base/tree/1001bb4d826a52d1f399e183466143f4da7b741b
- Paper de DPO (referencia del método): https://arxiv.org/abs/2305.18290
- Perfil del autor: https://huggingface.co/thkim0305-SNU
