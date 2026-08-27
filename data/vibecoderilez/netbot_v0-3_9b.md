# vibecoderilez/netbot_v0.3_9b

## Resumen

`netbot_v0.3_9b` es un modelo de lenguaje de 9.409.813.744 parámetros desarrollado por el usuario `vibecoderilez` a partir de un fine-tuning del modelo base `DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED`. Este último es una variante no censurada y orientada a instrucciones de alta capacidad basada en la arquitectura Qwen3.5, con soporte para entradas de imagen y texto (pipeline `image-text-to-text`). El modelo se distribuye bajo licencia Apache-2.0 y está pensado para tareas conversacionales en inglés, aunque su base heredada sugiere capacidades multilingües no documentadas explícitamente.

La relevancia de este modelo reside en su naturaleza de fine-tuning rápido mediante la librería Unsloth y su integración con el ecosistema de Hugging Face (transformers, text-generation-inference). Sin embargo, la información pública es muy limitada: no se han publicado detalles sobre el dataset de entrenamiento, benchmarks ni especificaciones técnicas más allá de los parámetros totales. Su contexto máximo, arquitectura exacta y cuantizaciones disponibles no están documentados en la ficha original, por lo que gran parte de los datos técnicos deben considerarse desconocidos o inferidos del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, no se especifica variante) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (presumiblemente similar a Qwen3.5-9B, pero sin dato oficial) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors, sin GGUF publicados) |
| Idiomas soportados | inglés (etiqueta `language: en`; posible multilingüismo heredado de Qwen, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 18.8 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la ficha, pero por el nombre `qwen3_5` y el modelo base `Qwen3.5-9B`, se infiere que es un transformer decoder-only con atención causal, similar a la familia Qwen. El modelo base `DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED` es una variante instructiva no censurada, por lo que `netbot_v0.3_9b` hereda esta configuración de fine-tuning para instrucciones. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning mediante técnicas de optimización de memoria y kernel, y con la librería TRL de Hugging Face para el ajuste supervisado. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: modelo instructivo orientado a mantener diálogos multi-turno, basado en el fine-tuning de instrucciones.
- Entrada de imagen y texto: el pipeline `image-text-to-text` sugiere que puede procesar imágenes junto con texto, aunque no se especifican detalles sobre la arquitectura de visión (p. ej., si usa un encoder de visión separado).
- Razonamiento de alto IQ: el nombre del modelo base incluye "HighIQ", lo que podría indicar un entrenamiento dirigido a razonamiento complejo, aunque no hay benchmarks que lo confirmen.
- Sin censura declarada: el modelo base es "HERETIC-UNCENSORED", lo que implica que no tiene filtros de contenido, pero esto no está garantizado para este fine-tuning.
- Soporte de tool calling y agentes: no documentado en la ficha.
- Capacidades multilingües: no confirmado, solo etiqueta `en`.

## Casos de uso

- Asistente conversacional para soporte técnico: el modelo puede gestionar diálogos de resolución de problemas en inglés, aprovechando su capacidad de instrucción y su contexto (aunque no se conoce la longitud máxima de la ventana). Es adecuado para entornos donde se requiera una respuesta sin filtros de contenido, pero se debe validar su fiabilidad.
- Generación de respuestas con contexto visual: si se confirma el soporte de imagen, podría usarse para describir o analizar capturas de pantalla, diagramas o fotografías en aplicaciones de asistencia remota.
- Creación de chatbots para investigación: al ser Apache-2.0, permite integración en proyectos académicos o de código abierto para experimentar con modelos no censurados.
- Fine-tuning adicional: al ser un modelo de 9B con pesos safetensors, sirve como punto de partida para fine-tuning específico en dominios como medicina, legal o creativo, usando técnicas de LoRA o QLoRA.
- Generación de contenido creativo: para escritura de guiones, diálogos o narrativa donde se requiera una libertad de expresión sin restricciones.
- Prototipado de aplicaciones de IA: para desarrolladores que quieran probar un modelo de instrucción de 9B en entornos de desarrollo con librerías compatibles (transformers, vLLM, etc.), sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9,4B parámetros. En fp16, los pesos ocupan aproximadamente 18,8 GB (el tamaño del repositorio), por lo que se requiere una GPU con al menos 24 GB de VRAM para cargar el modelo completo. Con cuantización de 8 bits se podría reducir a ~9,4 GB y con 4 bits a ~4,7 GB, pero no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB) o A100 (40/80 GB). Para cuantización de 4 bits, una RTX 3090 (24 GB) o RTX 4070 Ti (12 GB) podría ser suficiente, pero no hay garantías.
- ¿Cabe en consumer GPU? Sí, si se cuantiza a 4 bits, puede caber en una RTX 3090 o similar, pero no hay archivos GGUF publicados, por lo que el usuario debería cuantizar manualmente.
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Generation Inference (TGI) y vLLM (si se configura). Para cuantización local, se puede usar bitsandbytes o GPTQ. No hay soporte oficial para Ollama o llama.cpp sin convertir a GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y del framework. Como referencia, un modelo de 9B en fp16 en una A100 puede generar ~20-50 tokens/s, pero no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| netbot_v0.3_9b | 9,4B | no disponible | Apache-2.0 | Hugging Face (safetensors) |
| Llama-3.1-8B-Instruct | 8,03B | 128K tokens | Llama 3.1 Community | Hugging Face, GGUF, etc. |
| Gemma-2-9B-It | 9,24B | 8K tokens | Gemma | Hugging Face, GGUF |
| Qwen2.5-7B-Instruct | 7,6B | 128K tokens | Apache-2.0 | Hugging Face, GGUF |

Nota: No hay datos de rendimiento comparables para netbot_v0.3_9b. La comparación se basa solo en parámetros y contexto de los modelos alternativos. El modelo base de netbot es Qwen3.5, pero no se dispone de especificaciones públicas de esa familia.

## Limitaciones y advertencias

- Sesgos y alucinación: como modelo fine-tuning no documentado, es probable que tenga sesgos del dataset de entrenamiento. La falta de benchmarks impide evaluar su fiabilidad. El nombre "HERETIC-UNCENSORED" sugiere que puede generar contenido inapropiado, ofensivo o peligroso, y no se recomienda su uso en producción sin moderación.
- Limitaciones de idioma: solo está etiquetado para inglés. El uso en otros idiomas puede degradar el rendimiento.
- Contexto desconocido: sin datos sobre la longitud de contexto, no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Sin garantías de seguridad: la licencia Apache-2.0 permite uso comercial, pero no hay responsabilidad del autor. El modelo no ha sido evaluado para sesgos, toxicidad ni seguridad.
- Dependencia de infraestructura: no hay cuantizaciones oficiales, lo que obliga al usuario a realizar conversiones manuales, lo que puede requerir experiencia técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vibecoderilez/netbot_v0.3_9b
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED
- Unsloth: https://github.com/unslothai/unsloth
