# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step43

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step43 es un checkpoint de ajuste fino por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. El objetivo declarado es el alineamiento de seguridad: se entrena al modelo para preferir respuestas etiquetadas como seguras (score 1) frente a respuestas etiquetadas como inseguras (score 0) en un conjunto de ocho conjuntos de datos de preferencias. El checkpoint corresponde al paso 43 de optimizacion, es decir, 0,5 epocas de entrenamiento.

El modelo conserva la naturaleza multimodal del base (pipeline image-text-to-text) y sus pesos de vision y MTP, por lo que sigue siendo un modelo de lenguaje con capacidad de procesamiento de imagenes. Cuenta con 4.659.865.088 parametros totales en formato safetensors y un repositorio de 9,3 GB. La licencia es Apache 2.0.

Su relevancia es acotada pero clara: se trata de un artefacto de investigacion reproducible para estudiar como afecta un numero muy reducido de actualizaciones DPO (43 pasos, 0,5 epocas) a las preferencias de seguridad de un modelo de 4B, usando un modelo profesor mucho mayor (Qwen3.8-27B) para generar pares de respuestas. No es un modelo de produccion ni un lanzamiento oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; incluye pesos de vision y MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revision `1001bb4d826a52d1f399e183466143f4da7b741b`) y aplica DPO (Direct Preference Optimization) con beta 0,1, tamano de lote de 64 pares y tasa de aprendizaje maxima de 1e-6. El entrenamiento alcanza el paso 43 de optimizacion, equivalente a 0,5 epocas sobre la mezcla de datos. La exportacion incluye los pesos de lenguaje entrenados y preserva los pesos de vision y MTP del modelo base, de modo que la arquitectura multimodal original se mantiene intacta.

Los pares de preferencia se construyen de forma sintetica: para cada prompt, ambas respuestas (elegida y rechazada) provienen de Qwen3.8-27B, y una puntuacion binaria asigna 1 a la respuesta elegida y 0 a la rechazada. La mezcla de entrenamiento combina ocho conjuntos de datos y contiene 5.493 pares de preferencia distribuidos sobre 1.755 prompts. No se documentan en la informacion disponible el numero de tokens de preentrenamiento del base, la composicion detallada de los ocho datasets ni si hubo etapas adicionales de RLHF mas alla del DPO descrito.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, heredada del modelo base Qwen3.5-4B-Base.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), con los pesos de vision del base preservados.
- Razonamiento y respuesta a instrucciones, modulados por el ajuste DPO de seguridad.
- Preferencia alineada hacia respuestas etiquetadas como seguras en el conjunto de preferencias de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento de seguridad: el checkpoint permite medir el efecto de un presupuesto muy bajo de DPO (43 pasos) sobre las preferencias de seguridad de un modelo de 4B, comparandolo con el base sin ajustar.
- Reproducibilidad de experimentos de DPO: al documentarse beta, lote, learning rate, numero de pasos y origen de los pares, sirve como referencia para replicar pipelines de preferencias con modelos profesores de mayor tamano.
- Evaluacion de destilacion de preferencias: permite estudiar si las preferencias generadas por un modelo profesor de 27B se transfieren de forma efectiva a un alumno de 4B con pocas actualizaciones.
- Clasificacion y filtrado de respuestas seguras: el modelo puede emplearse como componente en un pipeline de evaluacion de seguridad de respuestas generadas por otros sistemas, dentro de un entorno de investigacion.
- Prototipado de asistentes multimodales: al conservar vision y texto, puede usarse en pruebas de concepto de asistentes que reciben imagenes y texto, siempre que se validen previamente sus salidas.
- Analisis de robustez y sesgos: útil para estudiar como un ajuste DPO breve altera la distribucion de respuestas ante prompts sensibles, comparando con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 12-16 GB de VRAM.
- Cuantizacion a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100, H100 o L40S para inferencia en precision completa; RTX 4090 (24 GB) para FP16 con margen; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer de 24 GB en FP16 y en GPUs de 12-16 GB con cuantizacion, siempre que se generen los pesos cuantizados.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si la arquitectura Qwen3.5 esta soportada por esas herramientas; llama.cpp/Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO (este) | 4,66B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4B (aproximado) | no disponible | Apache 2.0 (segun base) | Hugging Face, modelo base oficial |
| Qwen3.8-27B (profesor usado en los pares) | 27B (aproximado) | no disponible | no disponible | no disponible en la informacion |

La comparativa con alternativas de la misma categoria (modelos de 4B ajustados por DPO para seguridad) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 43 pasos de optimizacion y 0,5 epocas; no representa un ajuste de seguridad completo ni validado.
- Datos de preferencia sinteticos generados por un unico modelo profesor (Qwen3.8-27B), lo que puede introducir sesgos del profesor en las preferencias aprendidas.
- Sin resultados de benchmarks ni evaluaciones de seguridad publicadas; no hay evidencia cuantitativa de mejora frente al base.
- Idiomas soportados no declarados; el comportamiento multilingue no esta garantizado.
- Longitud de contexto no documentada; no debe asumirse la del base sin verificacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 4B, no mitigado por este ajuste.
- Ausencia de variantes cuantizadas oficiales; el despliegue en hardware limitado requiere conversion propia.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de evaluacion de seguridad desaconseja su uso en produccion sin auditoria previa.
- Modelo con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step43
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revision del base citada: `1001bb4d826a52d1f399e183466143f4da7b741b`
