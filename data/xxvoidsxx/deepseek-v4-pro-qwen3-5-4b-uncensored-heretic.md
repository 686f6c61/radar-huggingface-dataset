# xxvoidsxx/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "abliterada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un ajuste fino de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor del derivado, xxvoidsxx, ha aplicado la herramienta Heretic v2.0.0 para reducir la tasa de rechazos del modelo original, pasando de 99/100 negativas a 5/100 en la evaluacion reportada, con una divergencia KL de 0.0378 respecto al modelo base.

El modelo conserva el enfoque del original: razonamiento estructurado y resolucion de problemas matematicos y STEM, entrenado sobre una mezcla de aproximadamente 250.000 muestras. Con 4.539.265.536 parametros reales (segun safetensors) y un repositorio de 9,3 GB, se posiciona en la clase compacta de 4B, lo que facilita su despliegue en hardware de consumo.

La relevancia actual radica en dos factores: por un lado, traslada la receta de destilacion de un teacher de gran escala (DeepSeek-V4-Pro) a un modelo pequeno y accesible; por otro, la intervencion de abliteracion lo hace interesante para investigadores que estudian alineamiento, tasas de rechazo y degradacion de capacidades tras eliminar comportamientos de negativa. La licencia Apache 2.0 permite uso comercial, aunque con las advertencias propias de un modelo decensurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), segun tags `qwen3_5` y `transformers` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (tag `gguf`); otras cuantizaciones no especificadas |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-4B, una arquitectura transformer de la familia Qwen, segun los tags del repositorio (`qwen3_5`, `transformers`). El entrenamiento del modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B consistio en destilacion: se generaron respuestas con DeepSeek-V4-Pro en modo Max Effect y se uso esa senal como objetivo de un SFT sobre aproximadamente 250.000 muestras centradas en matematicas y STEM. La model card menciona tambien evaluacion con MTP-Q8 y ejecuciones completas de GSM8K junto con muestras fijas de MMLU-Pro en Matematicas, Fisica y Quimica.

La innovacion principal de esta variante concreta es la aplicacion de Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0. Los parametros reportados son: `start_layer_index` 16, `end_layer_index` 32, `preserve_good_behavior_weight` 0.9854, `steer_bad_behavior_weight` 0.0002, `overcorrect_relative_weight` 0.6587 y `neighbor_count` 10. Esta tecnica modifica las representaciones internas en un rango de capas para suprimir el comportamiento de rechazo, manteniendo un peso alto de preservacion del comportamiento bueno. No se detalla la composicion exacta del dataset de destilacion ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento estructurado con descomposicion explicita de problemas, heredado de la destilacion del teacher.
- Resolucion de problemas matematicos y de STEM (fisica, quimica) gracias a las ~250.000 muestras de entrenamiento.
- Generacion de codigo, segun los tags `reasoning`, `math` y `stem` del modelo base.
- Capacidad de razonamiento en modo "thinking" (tag `reasoning`).
- Soporte multimodal de entrada imagen-texto a texto (tag `image-text-to-text`), aunque no se detalla la arquitectura de vision en la informacion disponible.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento decensurado/abliterado: tasa de rechazo muy reducida (5/100 frente a 99/100 del original).
- Compatibilidad con endpoints y text-generation-inference.
- Tool calling y function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y abliteracion: el modelo permite estudiar empiricamente el efecto de eliminar el comportamiento de rechazo en un transformer de 4B, comparando la divergencia KL (0.0378) y la tasa de rechazos (5/100) con el modelo original.
- Tutoria de matematicas y fisica: el modelo puede resolver problemas paso a paso y explicar la descomposicion, apropiado para entornos educativos donde se requiere razonamiento explicito y no solo la respuesta final.
- Generacion de codigo en pipelines de desarrollo: al ser un modelo compacto de 4B con capacidades de razonamiento, puede integrarse en asistentes de IDE o revision de codigo con latencia baja en GPU de consumo.
- Procesamiento de documentacion tecnica multilingue: con soporte para seis idiomas (en, zh, ko, ja, es, ru), puede resumir y traducir documentacion cientifica o de ingenieria.
- Despliegue en entornos con recursos limitados: su tamano de 4,5B parametros y la disponibilidad de GGUF permiten ejecutarlo en portatiles o estaciones de trabajo sin GPU dedicada de gama alta.
- Experimentacion con modelos sin censura para generacion creativa: escritura de ficcion, guiones o contenido donde el modelo original rechazaria peticiones por politica de contenido.
- Evaluacion comparativa de recetas de destilacion: sirve como punto de referencia para medir cuanto rendimiento de un teacher grande (DeepSeek-V4-Pro) se transfiere a un alumno de 4B en tareas STEM.

## Benchmarks y rendimiento

La model card solo reporta metricas de la intervencion de abliteracion, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K con puntuaciones numericas).

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) |
|---|---|---|
| Tasa de rechazos | 5/100 | 99/100 |
| Divergencia KL | 0.0378 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) con puntuaciones en la informacion disponible. La model card menciona evaluacion en GSM8K completo y muestras fijas de MMLU-Pro, pero no incluye los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): en torno a 3-4 GB, lo que permite ejecucion en GPU de consumo.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para FP16 sin problemas; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para FP16 ajustado o 8 bits; GPUs con 8 GB o menos mediante GGUF Q4.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas usando cuantizacion GGUF; en FP16 requiere al menos 12 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama mediante los pesos GGUF, y vLLM si el soporte de la arquitectura Qwen3.5 esta disponible (no confirmado en la informacion).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic) | 4,54B | no disponible | Apache 2.0 | Destilado de DeepSeek-V4-Pro, abliterado con Heretic |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4,54B (mismo base) | no disponible | Apache 2.0 | Modelo original sin abliterar; tasa de rechazo 99/100 |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B (segun nombre) | no disponible | no disponible | Version 9B de la misma receta de abliteracion, referenciada en la model card |
| Qwen3.5-4B (modelo base de la familia) | ~4B | no disponible | no disponible | Arquitectura original sobre la que se construye el fine-tune |

No se dispone de datos de benchmarks comparativos de capacidad entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensurado/abliterado: la supresion del comportamiento de rechazo implica que puede generar contenido que el modelo original bloquearia; requiere filtros externos si se despliega en produccion orientada al publico.
- La abliteracion puede degradar capacidades: la divergencia KL de 0.0378 indica un cambio no trivial en la distribucion de salida; no se han publicado evaluaciones de capacidad tras la intervencion, por lo que el impacto en razonamiento y matematicas es incierto.
- Riesgo de alucinacion: inherente a los modelos de 4B destilados; la destilacion de un teacher grande no garantiza la misma fiabilidad factual.
- Sesgos conocidos: no documentados en la informacion disponible; los sesgos del dataset de destilacion y del modelo base no se detallan.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; el soporte multilingue se limita a los seis idiomas declarados (en, zh, ko, ja, es, ru), sin garantias de calidad en otros.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento de politicas de contenido en aplicaciones comerciales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-11; no hay evidencia de validacion por parte de la comunidad.
- La model card contiene HTML y elementos promocionales; la informacion tecnica verificable se limita a los parametros ARA y las metricas de rechazo/KL.

## Enlaces

- Hugging Face: https://huggingface.co/xxvoidsxx/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Version 9B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Heretic (herramienta de abliteracion): https://heretic-project.org
