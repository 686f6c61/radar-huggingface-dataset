# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step215

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step215 es un checkpoint de ajuste fino por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. El objetivo declarado es el alineamiento de seguridad (*safety tuning*): el modelo se entrena para preferir respuestas seguras frente a respuestas inseguras en un conjunto de prompts, usando pares de preferencia generados por un modelo profesor de mayor tamano (Qwen3.8-27B).

El modelo conserva la arquitectura multimodal del base (pipeline `image-text-to-text`), con 4.659.865.088 parametros totales y pesos en safetensors. El entrenamiento consistio en 215 actualizaciones del optimizador (2,5 epocas) sobre una mezcla de ocho conjuntos de datos que suma 5.493 pares de preferencia distribuidos en 1.755 prompts, con beta 0.1, tamano de lote de 64 pares y tasa de aprendizaje maxima de 1e-6.

Es relevante ahora porque ejemplifica una practica habitual en investigacion de seguridad: reutilizar un modelo profesor grande para etiquetar respuestas buenas y malas y destilar esa preferencia en un modelo pequeno de 4B mediante DPO. El checkpoint exporta los pesos de lenguaje entrenados y preserva los pesos de vision y MTP del modelo base, por lo que mantiene las capacidades multimodales originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, pipeline image-text-to-text), con pesos de vision y MTP preservados del base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revision `1001bb4d826a52d1f399e183466143f4da7b741b`) y aplica DPO sobre los pesos de lenguaje, manteniendo intactos los pesos de vision y de prediccion multi-token (MTP) del base. La arquitectura subyacente es la de la familia Qwen3.5, un transformer multimodal capaz de procesar entradas de imagen y texto; la model card no detalla el numero de capas, dimensiones ocultas ni el mecanismo de atencion.

El entrenamiento uso una mezcla de ocho conjuntos de datos con 5.493 pares de preferencia sobre 1.755 prompts. Para cada prompt, las dos respuestas (elegida y rechazada) fueron generadas por Qwen3.8-27B y etiquetadas con una puntuacion binaria: 1 para la respuesta elegida y 0 para la rechazada. Los hiperparametros fueron beta 0.1, lote de 64 pares y learning rate pico de 1e-6, durante 215 pasos del optimizador (2,5 epocas). No se documenta el uso de RLHF adicional, DPO iterativo ni datos de instruccion general.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational`.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base.
- Alineamiento de seguridad: el ajuste DPO busca reducir respuestas inseguras en los prompts de la mezcla de entrenamiento.
- Prediccion multi-token (MTP) preservada del base, aunque no se detalla su uso en inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en alineamiento de seguridad: el checkpoint permite estudiar el efecto de 215 pasos de DPO sobre un base de 4B y comparar la tasa de respuestas inseguras antes y despues del ajuste con la misma mezcla de evaluacion.
- Destilacion de preferencias desde un profesor mayor: sirve como referencia metodologica para replicar el flujo Qwen3.8-27B como etiquetador y un modelo de 4B como estudiante en entornos con presupuesto de GPU limitado.
- Clasificacion y filtrado de respuestas: al haber sido entrenado con etiquetas binarias de seguridad, puede usarse como componente de un pipeline de moderacion que puntue respuestas candidatas antes de mostrarlas al usuario.
- Evaluacion comparativa de checkpoints DPO: al publicarse el paso 215 con hiperparametros explicitos (beta 0.1, lr 1e-6, lote 64), permite reproducir la curva de entrenamiento y medir el compromiso entre seguridad y capacidad general.
- Prototipado de asistentes multimodales: la preservacion de los pesos de vision permite probar flujos imagen-texto en local con un modelo de menos de 5.000 millones de parametros.
- Base para ajuste adicional: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para SFT o DPO posteriores en dominios concretos sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda entre 12 y 16 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5 GB de pesos; en 4 bits, en torno a 2,5-3 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB o L40S; para una sola GPU de consumo, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en BF16; con cuantizacion de 8 o 4 bits podria caber en 8-12 GB, aunque esas variantes no estan publicadas por el autor.
- Opciones de despliegue: transformers (libreria declarada), ademas de vLLM, TGI o llama.cpp si se generan los pesos en los formatos correspondientes; el autor solo garantiza compatibilidad con `transformers` y `endpoints_compatible`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO (este) | 4.659.865.088 | no disponible | Apache 2.0 | DPO de seguridad sobre Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo base multimodal sin ajuste de preferencias |
| Qwen3.8-27B (profesor) | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo profesor usado para generar los pares de preferencia |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste se limita a una mezcla de ocho conjuntos con 1.755 prompts; la cobertura de riesgos de seguridad es acotada y no garantiza un comportamiento seguro fuera de esa distribucion.
- Las respuestas elegidas y rechazadas provienen de un unico modelo profesor (Qwen3.8-27B), lo que puede introducir sesgos propios de ese profesor en las preferencias aprendidas.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad ni de calibracion tras el DPO.
- No se declaran idiomas soportados; el rendimiento fuera del idioma o idiomas de la mezcla de entrenamiento es desconocido.
- La longitud de contexto no se especifica en la model card; no debe asumirse la del modelo base sin verificacion.
- El checkpoint corresponde al paso 215 de un entrenamiento en curso (2,5 epocas); no se aportan metricas de validacion que confirmen que sea el mejor punto de la curva.
- Aunque la licencia es Apache 2.0, el uso comercial requiere verificar de forma independiente las condiciones del modelo base y de los datos de preferencia, que no se detallan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step215
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revision del base usada en el entrenamiento: `1001bb4d826a52d1f399e183466143f4da7b741b`
