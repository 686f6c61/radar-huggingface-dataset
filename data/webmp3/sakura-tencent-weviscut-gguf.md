# webmp3/Sakura-tencent-WeVisCut-GGUF

## Resumen

Sakura-tencent-WeVisCut-GGUF es una cuantización comunitaria en formato GGUF del modelo multimodal tencent/WeVisCut, publicada por el usuario webmp3. No se trata de un modelo entrenado desde cero, sino de una recuantización de un GGUF BF16 intermedio (producido por prithivMLmods) que a su vez deriva del checkpoint original de Tencent. El resultado son cuatro archivos GGUF con presets de llama.cpp (Q2_K, Q3_K_M, Q4_K_M y Q5_K_M) más un proyector de visión BF16 que habilita la entrada de imágenes.

El modelo subyacente emplea una arquitectura identificada como `qwen35` en los metadatos GGUF, con aproximadamente 8.950 millones de parámetros totales. Su propósito declarado es el procesamiento conversacional multimodal con capacidad de recibir imágenes, orientado a idiomas inglés y chino. La licencia Apache 2.0 del modelo base permite redistribución con atribución.

La relevancia de esta ficha radica en que ofrece una vía de despliegue local de un modelo de visión-lenguaje de ~9B parámetros en hardware de consumo, gracias a las cuantizaciones de 3,8 a 6,5 GB. Conviene subir con cautela: el autor no aporta benchmarks, la entrada de imagen no ha sido probada en esta release y la información sobre el modelo original es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (según metadatos GGUF; transformer multimodal con proyector de visión) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (GGUF); proyector de visión BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos es `qwen35`, lo que sugiere una variante de la familia Qwen con capacidades multimodales, dado que el repositorio incluye un proyector de visión (`WeVisCut.mmproj-bf16.gguf`) que se carga junto al modelo de lenguaje para procesar imágenes. El recuento de parámetros (8,95B) y el tamaño del checkpoint BF16 (17,9 GB) son coherentes con un transformer denso en precisión BF16. No se dispone de información sobre número de capas, dimensión oculta, mecanismo de atención ni detalles del entrenamiento.

Respecto al entrenamiento, no hay datos publicados en la información disponible sobre volumen de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa. Esta release concreta no realizó conversión desde safetensors: es una recuantización de un GGUF BF16 existente, sin calibración con matrices de importancia. Las etiquetas de cuantización corresponden a los presets estándar de llama.cpp, que mantienen ciertos tensores (por ejemplo, pesos de normalización) en F32, por lo que la mezcla real de tipos por archivo es la documentada en la model card.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Procesamiento de imágenes mediante el proyector de visión incluido (no probado en esta release).
- Conversación multi-turno (etiqueta `conversational` en Hugging Face).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción de imágenes en local: cargando el GGUF junto con el proyector `WeVisCut.mmproj-bf16.gguf` mediante `llama-mtmd-cli`, se puede pedir al modelo que describa o analice una imagen sin enviar datos a servicios externos. Adecuado por la disponibilidad del proyector y el tamaño manejable del Q4_K_M.
- Asistencia conversacional bilingüe inglés-chino: el modelo declara soporte para ambos idiomas, por lo que puede emplearse en atención al cliente o asistentes internos que atiendan a usuarios de esas dos comunidades lingüísticas.
- Prototipado rápido en estaciones de trabajo: con cuantizaciones de 3,8 a 6,5 GB, es viable ejecutar el modelo en una GPU de consumo para pruebas de concepto de aplicaciones multimodales antes de escalar a un modelo mayor.
- Procesamiento de documentos con capturas o diagramas: combinando entrada de imagen y texto, puede extraer información de figuras o pantallazos en flujos de trabajo internos, siempre que se valide la calidad de la salida.
- Despliegue en entornos con requisitos de privacidad: al ser un GGUF ejecutable con llama.cpp, permite inferencia totalmente offline en máquinas sin conexión, útil para datos sensibles.
- Evaluación comparativa de cuantizaciones: los cuatro presets permiten medir el compromiso entre tamaño y calidad en un mismo modelo, útil para equipos que calibran qué cuantización desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación de calidad, perplejidad ni benchmark de código, y que la única verificación realizada es que cada archivo se carga en llama.cpp y genera texto una vez.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,8 GB; Q3_K_M ~4,6 GB; Q4_K_M ~5,6 GB; Q5_K_M ~6,5 GB. Añadir el proyector de visión (~0,9 GB) si se usa entrada de imagen.
- GPU recomendadas: para Q4_K_M o Q5_K_M con contexto moderado, una RTX 3090 o RTX 4090 (24 GB) ofrece margen holgado; una RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB puede alojar Q4_K_M, aunque con menos espacio para el contexto.
- Cabe en GPU de consumo: sí, especialmente las cuantizaciones Q2_K y Q3_K_M en tarjetas de 8 GB; Q4_K_M en 12 GB o más; Q5_K_M en 16 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para imágenes). No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponible. La model card solo confirma que los archivos cargan y generan texto con la build `b11669-620d2225c` de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura-tencent-WeVisCut-GGUF (esta ficha) | ~8,95B | no disponible | Sí (proyector incluido, no probado) | Apache 2.0 | GGUF en Hugging Face |
| tencent/WeVisCut (original) | ~8,95B | no disponible | Sí | Apache 2.0 | Pesos originales en Hugging Face |
| prithivMLmods/tencent-WeVisCut-GGUF (fuente BF16) | ~8,95B | no disponible | Sí | Apache 2.0 | GGUF BF16 en Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es una release oficial de Tencent: es una cuantización comunitaria independiente, sin aval del autor original.
- La entrada de imagen no ha sido probada en esta release; el proyector se copia sin modificar y su funcionamiento con estas cuantizaciones no está verificado.
- No se aportan benchmarks, perplejidad ni evaluaciones de calidad; el impacto de la cuantización en la calidad de salida es desconocido.
- La recuantización se hizo sin calibración con matrices de importancia, lo que puede degradar más la calidad que una cuantización calibrada, especialmente en Q2_K y Q3_K_M.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica publicada para este modelo.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto no está documentada, por lo que no se puede garantizar el comportamiento en conversaciones largas.
- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está verificado.
- Licencia Apache 2.0: permite uso comercial con atribución, pero el usuario debe conservar los avisos de copyright y atribución del modelo base.
- Requiere una build de llama.cpp que soporte la arquitectura `qwen35`; builds antiguas pueden no cargar los archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-tencent-WeVisCut-GGUF
- Modelo base original: https://huggingface.co/tencent/WeVisCut
- Repositorio GGUF de origen (prithivMLmods): https://huggingface.co/prithivMLmods/tencent-WeVisCut-GGUF
- Model card del commit de origen: https://huggingface.co/prithivMLmods/tencent-WeVisCut-GGUF/blob/cbfba25be41607a6e7e52bbd2069aee2b7d788b6/README.md
