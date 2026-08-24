# yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF

## Resumen

Este repositorio contiene la conversión a formato GGUF del modelo `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated`, un modelo de 4.2B parámetros que combina tres transformaciones: destilación del conocimiento del profesor Qwen3.8 (2.4T parámetros) en la arquitectura Qwen3.5-4B, ablación de rechazos (abliteration) mediante la técnica Heretic v1.4.0, y cuantización a Q4_K_M para el texto. La particularidad de esta conversión es que, a diferencia de la versión GGUF original de insraq que descartaba el módulo de visión, aquí se preserva el proyector de visión (mmproj) en F16, lo que permite al modelo procesar imágenes además de texto.

El modelo resultante es un LLM multimodal de 4.2B parámetros con licencia Apache 2.0, orientado a conversación y razonamiento, con soporte para inglés y chino. Su relevancia radica en ofrecer una alternativa de pequeño tamaño que combina las capacidades de razonamiento del Qwen3.8 destilado con una política de rechazos muy reducida (6/100 frente a 99/100 del modelo original) y la posibilidad de ejecutarse en hardware de consumo mediante llama.cpp u Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (arquitectura `qwen3_5`) |
| Parametros totales | 4.205.751.296 (~4.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (texto), F16 (proyector de visión) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (model-Q4_K_M.gguf de 2.5 GB + mmproj-f16.gguf de 641 MB) |

## Arquitectura y entrenamiento

El modelo es el resultado de una cadena de transformaciones sobre el Qwen3.5-4B base de Alibaba. En primer lugar, empero-ai destiló el conocimiento del Qwen3.8 (un modelo de 2.4T parámetros en arquitectura A95B) en la arquitectura Qwen3.5-4B, entrenando al estudiante sobre aproximadamente 45.000 trazas del profesor, consistentes en cadenas de razonamiento densas en matemáticas, razonamiento general y seguimiento de instrucciones, filtradas por calidad. Posteriormente, insraq aplicó la técnica de abliteración Heretic v1.4.0 sobre este destilado, que consiste en identificar y eliminar las direcciones de activación asociadas a comportamientos de rechazo, reduciendo la tasa de rechazos de 99/100 a 6/100 en pruebas con prompts de ficción.

La conversión a GGUF se realizó con la herramienta `convert_hf_to_gguf.py` de llama.cpp, incluyendo el proyector de visión mediante `--mmproj`. El texto se cuantizó a Q4_K_M mientras que el proyector de visión se mantuvo en F16 sin cuantizar para preservar la calidad del procesamiento de imágenes. El modelo base del que se parte (insraq) es una versión BF16 en safetensors.

## Capacidades

- Generación de texto conversacional en inglés y chino, con estilo de chat multi-turno.
- Comprensión de imágenes mediante proyector de visión (mmproj) en FP16, capaz de describir y responder sobre contenido visual.
- Razonamiento y matemáticas, heredadas de la destilación de Qwen3.8 sobre trazas de chain-of-thought.
- Seguimiento de instrucciones y diálogo, con una tasa de rechazos reducida gracias a la ablación de Heretic v1.4.0 (6/100 frente a 99/100 del modelo original).
- Soporte de API OpenAI-compatible a través de llama.cpp server, lo que permite integración con herramientas existentes.
- Capacidad de uso local con llama.cpp CLI y Ollama, sin dependencias de servicios externos.

## Casos de uso

- Asistente conversacional en inglés y chino: el modelo puede mantener diálogos multi-turno con comprensión de imágenes, adecuado para aplicaciones de chat en entornos con recursos limitados.
- Descripción y análisis de imágenes: gracias al proyector de visión en FP16, puede procesar imágenes y generar descripciones o responder preguntas sobre su contenido, útil para herramientas de accesibilidad o clasificación de imágenes.
- Generación de contenido creativo sin restricciones: la ablación reduce los rechazos, permitiendo explorar temas que otros modelos bloquean (por ejemplo, guiones de ficción con contenido adulto), aunque con los riesgos éticos asociados.
- Prototipado rápido de agentes conversacionales: al ser un GGUF de 2.5 GB, se puede ejecutar en portátiles con GPU consumer y desplegar en entornos de desarrollo con llama.cpp u Ollama para validar flujos de conversación.
- Investigación académica sobre ablación de rechazos y destilación: el linaje completo documentado (Qwen3.5 → Qwen3.8-Distill → Heretic-Abliterated) lo convierte en un objeto de estudio para comparar el impacto de cada técnica.
- Aplicaciones de visión sin conexión en edge devices: con la cuantización Q4_K_M y el proyector FP16, el modelo puede ejecutarse en dispositivos con 4-6 GB de VRAM, adecuado para sistemas de captura de imágenes locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros tests, ni comparativas con modelos similares. Los únicos datos cuantitativos proporcionados son la tasa de rechazos (6/100 vs 99/100) y los tamaños de los ficheros.

## Requisitos de hardware

- VRAM estimada: el fichero de texto Q4_K_M ocupa 2,5 GB y el proyector FP16 641 MB, por lo que la VRAM total necesaria para carga completa es de aproximadamente 3,2 GB, más el overhead de contexto (dependiendo de la longitud de contexto, que no se especifica).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM, como RTX 3060, RTX 4060, RTX 3090, o GPU integradas modernas con suficiente memoria compartida. Para CPU, se puede ejecutar en modo CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media actuales.
- Opciones de despliegue: llama.cpp server (con API OpenAI-compatible), llama.cpp CLI, Ollama (`ollama run hf.co/yachen4ever/...`). También es compatible con entornos que soporten GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: no disponible. Dependerá del hardware, la ventana de contexto y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo se puede comparar conceptualmente con:

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill-Heretic-Abliterated (este) | 4,2B | no disponible | Sí (mmproj) | Apache 2.0 | GGUF |
| Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated-MTP-GGUF (insraq) | 4,2B | no disponible | No (visión descartada) | Apache 2.0 | GGUF |
| Qwen3.5-4B (base, Alibaba) | 4,2B | no disponible | No | Apache 2.0 | safetensors |

La principal diferencia frente a la versión de insraq es la preservación del proyector de visión, que convierte a este modelo en multimodal. No hay datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Ablación de rechazos: el modelo ha sido deliberadamente modificado para eliminar la mayoría de las respuestas de rechazo (6/100 frente a 99/100). Esto implica que puede generar contenido que normalmente se consideraría inapropiado, ilegal o dañino (la model card menciona ejemplos como atracos ficticios o tutoriales de ganzúas). No debe usarse en producción sin filtros de seguridad adicionales.
- Sesgos y alucinación: no se han publicado evaluaciones de sesgos ni de tasas de alucinación. El modelo hereda los sesgos del Qwen3.5-4B y del proceso de destilación, sin que se haya documentado ninguna mitigación.
- Longitud de contexto desconocida: no se especifica la ventana de contexto máxima, lo que limita su uso en aplicaciones que requieren documentos largos o historiales extensos.
- Idioma limitado: solo inglés y chino, sin soporte explícito para castellano u otras lenguas romances. Las respuestas en español podrían ser de menor calidad.
- Cuantización Q4_K_M: la pérdida de precisión inherente a la cuantización puede afectar a tareas de razonamiento complejo o matemáticas, aunque no se dispone de datos comparativos.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad relativa es desconocida.
- Riesgo de seguridad en producción: la combinación de cero rechazos y licencia Apache 2.0 puede facilitar el uso malintencionado. No recomendado para aplicaciones públicas sin moderación.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- Modelo base (BF16, safetensors): https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Versión MLX 4-bit del mismo autor: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-MLX-4bit
- Registro de conversión MLX (gist): https://gist.github.com/yachen4ever/673ece8e0eccd2dcc35911fe408f868b
- Repositorio oficial de Qwen3.8 (serie Qwen3.5/3.6/3.8): https://github.com/QwenLM/Qwen3.8
- Repositorio con modelos destilados Qwen3.8 (2B, 4B, 9B): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
