# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step172

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step172` es un ajuste fino por preferencias (DPO, *Direct Preference Optimization*) del modelo base multimodal `Qwen/Qwen3.5-4B-Base`, desarrollado por el usuario `thkim0305-SNU`. El objetivo declarado es el *safety tuning*: alinear las respuestas del modelo hacia comportamientos más seguros mediante pares de preferencia generados por un modelo profesor de mayor tamaño (`Qwen3.8-27B`). Se publica bajo licencia Apache 2.0 y con pesos en formato `safetensors` para la librería `transformers`.

El checkpoint corresponde al paso 172 de optimización (2 épocas) de un entrenamiento DPO con `beta` 0.1, tamaño de lote de 64 pares y tasa de aprendizaje máxima de 1e-6. La mezcla de entrenamiento contiene ocho conjuntos de datos con un total de 5.493 pares de preferencia sobre 1.755 prompts. Las etiquetas binarias (1 para la respuesta elegida, 0 para la rechazada) provienen de un modelo profesor distinto del base, lo que introduce una señal de alineación externa.

El modelo conserva la arquitectura multimodal del base: pipeline `image-text-to-text` y pesos de visión y de MTP (*multi-token prediction*) preservados en la exportación. Con 4.659.865.088 parámetros totales y un repositorio de 9,3 GB, el modelo está pensado para despliegues de tamaño medio con capacidad de entrada de imagen y texto, y su interés actual radica en ser un ejemplo reproducible de *safety tuning* sobre una base Qwen 3.5 de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen 3.5, con pesos de visión y MTP preservados) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`) y aplica un ajuste DPO sobre los pesos del lenguaje, manteniendo intactos los pesos de visión y de MTP del modelo base. La arquitectura subyacente es un transformer multimodal con pipeline `image-text-to-text`, es decir, acepta entradas de imagen y texto y genera texto. No se detalla en la información disponible la composición exacta de la arquitectura (número de capas, dimensión oculta, mecanismo de atención), por lo que esos datos quedan como no disponibles.

El entrenamiento DPO se realizó durante 172 pasos de optimización (2 épocas) con `beta` 0.1, lote de 64 pares y tasa de aprendizaje máxima 1e-6. Los pares de preferencia se construyeron a partir de respuestas generadas por `Qwen3.8-27B` para cada prompt: la respuesta con puntuación binaria 1 se usó como *chosen* y la de puntuación 0 como *rejected*. La mezcla de ocho conjuntos de datos contiene 5.493 pares sobre 1.755 prompts. No se especifica si hubo etapas adicionales de RLHF, SFT previo o filtrado de datos más allá de la señal del profesor.

## Capacidades

- Generación de texto conversacional con ajuste por preferencias orientado a seguridad.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y se preservan los pesos de visión del base.
- Razonamiento y respuesta a prompts multi-turno (etiqueta `conversational`).
- Predicción multi-token (MTP) preservada del modelo base.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Moderación y filtrado de contenido generado: el ajuste DPO con señal de seguridad permite usar el modelo como clasificador generativo o reescritor de respuestas inseguras en pipelines de moderación, aprovechando que el entrenamiento priorizó respuestas con etiqueta 1 del profesor.
- Asistentes conversacionales con entrada de imagen: al conservar los pesos de visión, puede gestionar consultas que combinen una imagen y texto (por ejemplo, descripción de capturas o soporte visual) manteniendo el alineamiento de seguridad del ajuste.
- Evaluación comparativa de técnicas de *safety tuning*: sirve como checkpoint de referencia para reproducir el efecto del DPO con profesor externo sobre una base Qwen 3.5 de 4B, comparando el paso 172 frente al base sin ajustar.
- Generación de respuestas seguras en dominios sensibles: útil en entornos donde se requiere que el modelo rechace o reformule peticiones dañinas, gracias a la mezcla de ocho datasets de preferencia orientada a seguridad.
- Prototipado de sistemas multimodales en investigación: con 4,66B parámetros y licencia Apache 2.0, es adecuado para experimentos académicos que necesiten un modelo imagen-texto pequeño y ajustable.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial y modificación, lo que facilita integrarlo en productos propietarios que necesiten un modelo multimodal de tamaño medio.
- Base para ajustes posteriores: al ser un checkpoint intermedio (paso 172), puede servir como punto de partida para continuar el entrenamiento DPO o aplicar SFT específico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos (4,66B parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB de pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se confirman formatos de cuantización publicados.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- ¿Cabe en GPU de consumo? Sí, en FP16 en tarjetas de 24 GB (RTX 3090/4090) con contexto reducido, y en cuantización 8/4 bits en tarjetas de 12-16 GB.
- Opciones de despliegue: `transformers` (librería declarada), y potencialmente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no se confirma compatibilidad en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8 (este) | 4,66B | no disponible | Apache 2.0 | safetensors | DPO de seguridad sobre Qwen3.5-4B-Base, multimodal |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | no disponible | no disponible | Modelo base sin ajuste de preferencias |
| Qwen3.8-27B (profesor) | no disponible | no disponible | no disponible | no disponible | Modelo profesor usado para generar pares de preferencia |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al derivar de un profesor externo (`Qwen3.8-27B`), el modelo puede heredar sesgos de ese profesor y de la mezcla de ocho datasets.
- Riesgo de alucinación: no evaluado; no hay benchmarks publicados que cuantifiquen la fiabilidad factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar comportamiento multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento y del modelo base, no detalladas aquí.
- Checkpoint intermedio: el modelo corresponde al paso 172 de un entrenamiento DPO; no se ha validado como versión final ni se han publicado métricas de seguridad o utilidad.
- Uso en producción: sin benchmarks ni evaluación de seguridad independiente, no se recomienda desplegarlo en producción sin una evaluación propia de robustez y alineamiento.
- Datos de entrenamiento limitados: 5.493 pares sobre 1.755 prompts es un volumen reducido, lo que puede limitar la generalización del ajuste de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step172
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio del autor: https://huggingface.co/thkim0305-SNU
