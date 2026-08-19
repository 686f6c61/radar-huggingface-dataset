# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_K_R4-SPECIAL_SPLIT

## Resumen

Este modelo es una cuantización GGUF en formato IQ2_K_R4 del modelo Qwen3.8-27B, creada por el usuario Thireus mediante su propia herramienta de cuantización (GGUF Tool Suite). El modelo base, desarrollado por Alibaba, es un modelo multimodal denso de 27 000 millones de parámetros, optimizado para tareas de código, flujos de trabajo agénticos y automatización de oficina, con una ventana de contexto de 262 144 tokens. Esta versión cuantizada a 2 bits reduce drásticamente los requisitos de memoria, lo que permite ejecutar el modelo en hardware de consumo, aunque con una posible pérdida de calidad respecto a las versiones de mayor precisión. La licencia MIT de esta cuantización facilita su uso comercial sin las restricciones de la licencia Apache 2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (según modelo base) |
| Tipos de cuantizacion | IQ2_K_R4 (2 bits) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para esta cuantización) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con un codificador de visión integrado, lo que le permite procesar tanto texto como imágenes. Según la información publicada, está diseñado para destacar en generación de código, razonamiento agéntico y tareas de automatización de oficina. El modelo fue entrenado por el equipo de Qwen de Alibaba, aunque no se han proporcionado detalles específicos sobre el volumen de datos o las técnicas de alineación (RLHF, DPO, etc.) en los resultados de búsqueda disponibles.

La cuantización IQ2_K_R4 aplicada por Thireus reduce los pesos a aproximadamente 2 bits por parámetro, utilizando una combinación de cuantización por bloques y técnicas de reconstrucción de errores. Esta versión concreta, denominada "SPECIAL_SPLIT", sugiere una partición especial de los pesos para optimizar la inferencia en ciertos hardware, aunque no se han publicado detalles técnicos adicionales sobre el proceso de cuantización.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de mantener conversaciones complejas y resolver tareas de razonamiento lógico.
- Generación de código: soporta múltiples lenguajes de programación y puede completar, explicar o depurar código.
- Capacidades multimodales: al incluir un codificador de visión, puede procesar imágenes y responder preguntas sobre su contenido.
- Soporte para agentes y flujos de trabajo agénticos: el modelo base está optimizado para tareas que requieren planificación y ejecución de múltiples pasos.
- Automatización de oficina: puede generar documentos, resumir correos, crear presentaciones, etc.
- Multilingüismo: aunque no se especifica para esta cuantización, el modelo base soporta varios idiomas.

Nota: la cuantización a 2 bits puede degradar significativamente la calidad de las respuestas, especialmente en tareas que requieren precisión numérica o razonamiento complejo. Las capacidades listadas se refieren al modelo base; esta versión cuantizada puede presentar un rendimiento inferior.

## Casos de uso

- Ejecución local en portátiles o mini-PCs: gracias a su bajo requisito de memoria (aproximadamente 7-8 GB de VRAM), este modelo puede ejecutarse en GPUs de consumo como la RTX 3060 o incluso en iGPUs con suficiente RAM compartida, permitiendo prototipado y pruebas sin depender de servicios en la nube.
- Asistente de programación offline: un desarrollador puede cargar este modelo en un editor de código para obtener autocompletado y sugerencias de funciones sin conexión a internet, aunque con una calidad inferior a la versión BF16.
- Chatbot de atención al cliente en entornos con recursos limitados: empresas pequeñas pueden desplegar un asistente virtual en un servidor con una GPU modesta, aprovechando la licencia MIT para uso comercial.
- Análisis de documentos con visión: al conservar el codificador de visión, puede extraer información de capturas de pantalla o imágenes de documentos, aunque la precisión puede verse afectada por la cuantización.
- Automatización de tareas de oficina en hardware embebido: por ejemplo, generar resúmenes de correos o redactar borradores de informes en un dispositivo con poca memoria.
- Investigación y experimentación: para probar técnicas de cuantización o comparar el rendimiento de diferentes formatos GGUF en tareas específicas, este modelo sirve como referencia de una cuantización de 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base Qwen3.8-27B tiene benchmarks publicados (según el artículo de Yottalabs), pero no se han proporcionado cifras concretas en los resultados de búsqueda. Por tanto, no es posible presentar una tabla comparativa fiable. Se recomienda consultar el repositorio oficial del modelo base para obtener datos de rendimiento y tener en cuenta que la cuantización a 2 bits suele degradar el rendimiento en tareas de razonamiento y matemáticas.

## Requisitos de hardware

- VRAM estimada: para una cuantización de 2 bits de 27B parámetros, el tamaño del archivo GGUF es aproximadamente 27B × 2 bits / 8 = 6,75 GB, más overhead de contexto y buffers, por lo que se necesitan al menos 8 GB de VRAM para una ventana de contexto moderada (8-16k tokens). Con contexto completo de 262k, la memoria puede superar los 16 GB.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB), o GPUs de datacenter como A10G (24 GB) para mayor contexto.
- Compatibilidad con consumer GPU: sí, siempre que tengan al menos 8 GB de VRAM. En iGPUs con memoria compartida (por ejemplo, AMD Ryzen AI Max) también puede funcionar, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), SGLang, entre otros.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, se podría esperar una velocidad de generación de 20-40 tokens por segundo, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de datos comparativos directos para esta cuantización específica. Como referencia, se puede comparar con otras cuantizaciones del mismo modelo base:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 262k | BF16 | Apache 2.0 | Hugging Face |
| mtp-Qwen3.8-27B-THIREUS-IQ2_K_R4 (este) | 27B | 262k | IQ2_K_R4 (2 bits) | MIT | Hugging Face |
| Otras cuantizaciones GGUF (Q4_K_M, Q5_K_M, etc.) | 27B | 262k | 4-5 bits | Apache 2.0 / MIT | Hugging Face |

La cuantización de 2 bits ofrece el menor requisito de memoria, pero a costa de una mayor pérdida de calidad. Las versiones de 4-5 bits suelen ser un equilibrio más razonable para uso general.

## Limitaciones y advertencias

- La cuantización a 2 bits (IQ2_K_R4) produce una degradación notable en la calidad de las respuestas, especialmente en tareas de razonamiento matemático, lógica y generación de código complejo. Puede aumentar la frecuencia de alucinaciones y errores sintácticos.
- El contexto de 262k tokens es teórico; en la práctica, con 8 GB de VRAM, la ventana útil se reduce drásticamente (probablemente a 8-16k tokens) para evitar desbordamiento de memoria.
- No se han publicado evaluaciones de sesgos o seguridad para esta cuantización. El modelo base puede heredar sesgos de los datos de entrenamiento, y la cuantización no los corrige.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base original tiene licencia Apache 2.0. Al ser una cuantización derivada, se debe verificar si la licencia MIT de esta versión es legalmente válida, ya que el modelo base tiene condiciones de atribución. Se recomienda consultar los términos de la licencia Apache 2.0.
- No se dispone de información sobre el proceso de cuantización (dataset de calibración, metodología) más allá de que fue creado con la herramienta de Thireus. Esto puede afectar a la reproducibilidad.
- El nombre "SPECIAL_SPLIT" sugiere una partición especial de los pesos, pero no se documenta su propósito ni su impacto en el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_K_R4-SPECIAL_SPLIT
- Repositorio del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Perfil de Thireus en GitHub: https://github.com/Thireus
- Artículo de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
