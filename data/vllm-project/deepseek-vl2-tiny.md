# vllm-project/deepseek-vl2-tiny

## Resumen

DeepSeek-VL2-Tiny es la variante más pequena de la familia DeepSeek-VL2, una serie de modelos de vision-lenguaje basados en arquitectura Mixture-of-Experts (MoE) desarrollada por DeepSeek-AI. El modelo combina un encoder visual con un LLM base DeepSeekMoE-3B, lo que da un total de aproximadamente 3.370 millones de parametros almacenados pero solo 1.000 millones de parametros activados por token. Esta ficha corresponde a la copia del checkpoint alojada en la organizacion `vllm-project`, creada para que el CI de vLLM disponga de una referencia estable del modelo original de `Isotr0py`.

El modelo resuelve tareas de comprension multimodal: respuesta visual a preguntas (VQA), OCR, comprension de documentos, tablas y graficos, y grounding visual (localizacion de objetos mediante referencias en el texto). Su interes actual radica en que ofrece capacidades multimodales con un coste de inferencia reducido gracias al enrutamiento MoE, y en que su integracion en el ecosistema transformers y vLLM permite desplegarlo en infraestructura moderada.

La arquitectura sigue el patron de DeepSeek-VL2: un encoder de vision con estrategia de tiling dinamico para imagenes y un decoder de lenguaje MoE. El contexto y los idiomas soportados no se detallan en la informacion disponible; la model card solo especifica el pipeline `image-text-to-text`, la licencia DeepSeek Model License y el uso comercial permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje con LLM base DeepSeekMoE-3B (Mixture-of-Experts) |
| Parametros totales | 3.370.501.440 |
| Parametros activos | 1.0B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek Model License (uso comercial permitido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-VL2-Tiny es un modelo multimodal compuesto por un encoder visual y un decoder de lenguaje basado en DeepSeekMoE-3B, con 1.0B de parametros activados por token. La familia DeepSeek-VL2 emplea una estrategia de tiling dinamico para imagenes: cuando la conversacion incluye dos o menos imagenes se aplica tiling adaptativo para preservar resolucion; con tres o mas imagenes se hace padding directo a 384x384 sin tiling, con el objetivo de mantener manejable el numero de tokens en la ventana de contexto. La diferencia principal entre las variantes Tiny, Small y full es el LLM base sobre el que se monta el encoder visual.

Los detalles concretos de entrenamiento (numero de tokens, composicion del dataset, fases de SFT/RLHF) no se especifican en la informacion proporcionada; el paper asociado es arXiv:2412.10302. La model card recomienda usar temperatura T <= 0.7 en muestreo, ya que temperaturas mas altas degradan la calidad de generacion. El modelo requiere `trust_remote_code=True` por el uso de codigo personalizado (`deepseek_vl_v2`).

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) mediante el pipeline `image-text-to-text`.
- Respuesta visual a preguntas (VQA) sobre imagenes individuales y multiples.
- OCR y comprension de documentos, tablas y graficos.
- Grounding visual: localizacion de objetos referenciados en el texto mediante marcadores `<|ref|>...<|/ref|>`.
- Conversaciones multi-turno con imagenes intercaladas (in-context learning multimodal).
- Razonamiento y generacion de lenguaje heredados del LLM base DeepSeekMoE-3B.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, vision adicional o audio: no disponible en la informacion.

## Casos de uso

- **Atencion al cliente con soporte de imagenes**: el modelo puede recibir capturas o fotos enviadas por el usuario y responder preguntas sobre su contenido, gestionando conversaciones multi-turno con varias imagenes intercaladas.
- **Digitalizacion y extraccion de documentos**: OCR y comprension de tablas y graficos permiten procesar facturas, informes o capturas de pantalla y extraer campos estructurados para pipelines de back-office.
- **Grounding visual en herramientas de anotacion**: el soporte de referencias `<|ref|>...<|/ref|>` permite construir asistentes que localizan objetos concretos en una imagen, util para etiquetado semiautomatico de datasets.
- **Analisis de graficos en informes**: el modelo puede interpretar graficos y tablas embebidos en documentos y responder preguntas cuantitativas sobre ellos, integrable en flujos de analisis de negocio.
- **Asistencia en accesibilidad**: descripcion de imagenes y respuesta a preguntas sobre contenido visual para usuarios con discapacidad visual, con coste de inferencia bajo gracias a los 1.0B parametros activos.
- **Prototipado rapido de aplicaciones multimodales**: al estar integrado en transformers y contar con una copia mantenida por el proyecto vLLM, sirve como checkpoint de referencia para validar pipelines de serving multimodal antes de escalar a variantes mayores.
- **Verificacion visual en entornos de CI**: el propio uso del checkpoint en el CI de vLLM demuestra su idoneidad como modelo de pruebas para integraciones de inferencia multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.370 millones de parametros totales, en bfloat16 los pesos ocupan aproximadamente 6.7 GB (coincide con el tamano del repo); en cuantizacion de 8 bits se reduce a unos 3.4 GB y en 4 bits a unos 1.7 GB, aunque los tipos de cuantizacion no estan documentados oficialmente.
- GPU recomendadas: no especificadas en la informacion. Por tamano, cabe en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) en bfloat16, y en GPUs mas modestas con cuantizacion.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 8 GB o mas en cuantizacion y 12-16 GB o mas en bfloat16, aunque no hay datos oficiales de memoria pico con el encoder visual y el tiling dinamico.
- Opciones de despliegue: transformers con `trust_remote_code=True` (soporte oficial en la model card); vLLM (la copia existe precisamente para su CI); otras opciones como llama.cpp, Ollama o TGI no estan confirmadas en la informacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-VL2-Tiny | 3.37B | 1.0B | no disponible | DeepSeek Model License (comercial) | Hugging Face |
| DeepSeek-VL2-Small | no disponible | 2.8B | no disponible | DeepSeek Model License (comercial) | Hugging Face |
| DeepSeek-VL2 (full) | no disponible | 4.5B | no disponible | DeepSeek Model License (comercial) | Hugging Face |

Las tres variantes comparten arquitectura y difieren unicamente en el LLM base, segun la model card. No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados en la informacion disponible; como modelo entrenado con datos web, es previsible que herede sesgos de esos corpus.
- **Riesgo de alucinacion**: no cuantificado en la informacion; en tareas de OCR y grounding conviene validar las salidas contra la imagen, especialmente en documentos densos.
- **Contexto e idiomas**: la longitud de contexto y los idiomas soportados no estan documentados en la informacion, lo que dificulta planificar su uso en produccion multilingue.
- **Restricciones de licencia**: el codigo es MIT, pero los pesos se rigen por la DeepSeek Model License; la model card afirma que la serie DeepSeek-VL2 permite uso comercial, aunque conviene revisar los terminos exactos del fichero de licencia.
- **Requisito de codigo personalizado**: necesita `trust_remote_code=True` y el paquete `deepseek_vl`, lo que anade superficie de dependencias y riesgo de suministro; la copia en `vllm-project` existe precisamente para mitigar ese riesgo en CI.
- **Parametros de muestreo**: se recomienda temperatura T <= 0.7; valores superiores degradan la calidad segun el autor.
- **Gestion de multiples imagenes**: con tres o mas imagenes se hace padding a 384x384 sin tiling, lo que puede reducir la resolucion efectiva en escenarios con muchas imagenes.
- **Copia no oficial**: esta ficha describe una copia del checkpoint original de `Isotr0py`, no el repositorio oficial de DeepSeek-AI; para produccion conviene referenciar el checkpoint oficial.

## Enlaces

- Hugging Face (esta copia): https://huggingface.co/vllm-project/deepseek-vl2-tiny
- Checkpoint original: https://huggingface.co/Isotr0py/deepseek-vl2-tiny
- Paper: https://arxiv.org/abs/2412.10302
- Repositorio GitHub: https://github.com/deepseek-ai/DeepSeek-VL2
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-LLM/blob/HEAD/LICENSE-MODEL
