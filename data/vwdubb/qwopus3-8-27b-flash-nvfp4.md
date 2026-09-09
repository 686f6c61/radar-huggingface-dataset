# vwdubb/Qwopus3.8-27B-Flash-NVFP4

## Resumen

Qwopus3.8-27B-Flash-NVFP4 es una cuantización en 4 bits (NVFP4) del modelo Qwopus3.8-27B-Flash, desarrollado originalmente por Jackrong y cuantizado por vwdubb. El modelo Qwopus3.8-27B-Flash es a su vez un fine-tuning de Qwen3.8-27B, un modelo multimodal de la familia Qwen de 27.781 millones de parámetros. La cuantización NVFP4 reduce el peso en disco y el consumo de memoria manteniendo la misma arquitectura, y el repo incluye también versiones en GGUF para su uso con llama.cpp.

Su propósito principal es servir en cargas de trabajo de agentes, donde un modelo puede ser llamado decenas o cientos de veces en un bucle de lectura, razonamiento, llamada a herramientas, observación, edición y prueba. El modelo esta optimizado para reducir la latencia por token, acortar los razonamientos excesivamente largos y completar tareas de agente de forma más consistente. Es multimodal, soporta tool calling, function calling y decodificación especulativa mediante predicción multi-token (MTP).

La licencia es Apache 2.0, lo que permite uso comercial, modificación y redistribución. Según la información disponible, no se han publicado benchmarks numéricos del modelo, aunque la model card del base menciona una mejora del 12,8% en velocidad de decodificación y una tasa de aceptación MTP del 80,7%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.8-27B, con soporte multimodal (imagen + texto) y Multi-Token Prediction |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) en safetensors; también disponible en FP8 y GGUF |
| Idiomas soportados | Ingles, chino, español, ruso, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (NVFP4) y GGUF para llama.cpp |

## Arquitectura y entrenamiento

Qwopus3.8-27B-Flash-NVFP4 es una versión cuantizada en NVFP4 del modelo base Jackrong/Qwopus3.8-27B-Flash. El modelo base parte de Qwen3.8-27B, un transformer denso multimodal de la familia Qwen, y ha sido fine-tuned en dos etapas. La primera etapa (SFT) utilizó aproximadamente 1,5 millones de ejemplos generados por un modelo profesor, de los cuales se retuvo el 10% de mayor calidad tras un proceso de filtrado y evaluación. Los ejemplos se evaluaron en función de la relevancia semántica, dificultad, calidad de la cadena de pensamiento y consistencia de la respuesta, usando un ensemble de modelos razonadores como Qwen3.7-Max, GLM-5, GPT-OSS-120B-High y Gemma4-27B.

La segunda etapa utilizó NeMo-RL con GSPO (Group Sequence Policy Optimization) para reforzar las conductas de razonamiento mediante comparación de recompensas por muestreo repetido. El objetivo no es alargar el razonamiento, sino consolidar trayectorias útiles y reducir razonamientos patológicos o divergentes. Durante el entrenamiento también se incluyó datos de trayectorias de agentes y trazas reconstruidas de modelos cerrados como Claude y GPT. El modelo mantiene la capacidad de procesar imágenes y texto gracias a la arquitectura multimodal del base, y conserva el mecanismo de MTP para decodificación especulativa.

## Capacidades

- Generación de texto conversacional y razonamiento guiado por cadena de pensamiento, con una tendencia a producir razonamientos más cortos y orientados a la finalización de tareas.
- Procesamiento multimodal: es capaz de recibir entradas de imagen y texto simuláneamente (pipeline image-text-to-text).
- Soporte de tool calling y function calling, lo que permite integrar el modelo en flujos de trabajo donde necesita ejecutar funciones o consultar APIs.
- Aptitud para agentes: el diseño favorece tareas iterativas multi-paso (leer, pensar, llamar a una herramienta, observar, editar, probar).
- Generación de código, aunque con un problema conocido de indentación en Python en ciertos casos, que el autor indica estar corrigiendo.
- Decodificación especulativa mediante MTP, que reduce la latencia de inferencia.
- Soporte multilingüe para cinco idiomas: inglés, chino, español, ruso y japonés.
- Versión cuantizada NVFP4 y archivos GGUF para despliegue local con llama.cpp.

## Casos de uso

- Agentes de desarrollo de software: el modelo puede integrarse en un bucle de lectura, edición y ejecución de pruebas. Al estar optimizado para reducir el tiempo de razonamiento, es adecuado para tareas de refactorización y corrección de código en entornos con presupuesto de GPU limitado.
- Atención al cliente automatizada: soporta tool calling para consultar pedidos, estados de envío o bases de conocimiento, y gestiona conversaciones multi-turno. La capacidad multimodal permite analizar capturas de pantalla o facturas enviadas por el usuario.
- Automatización de procesos de negocio (RPA): el modelo puede actuar como orquestador de funciones (por ejemplo, rellenar formularios, actualizar CRMs o enviar correos) gracias a su soporte de function calling y a su razonamiento eficiente en tareas largas.
- Análisis de documentos visuales: al aceptar imágenes como entrada, puede extraer información de recibos, gráficos o capturas de pantalla y responder preguntas en varios idiomas, útil en equipos de operaciones o auditoría.
- Asistente de investigación multilingüe: con cadena de pensamiento y soporte de los idiomas indicados, puede resumir literatura, comparar conceptos y redactar respuestas razonadas en inglés, chino, español, ruso o japonés.
- Chatbot de soporte técnico para desarrolladores: puede generar código, explicar errores y recomendar soluciones, con la precaución de validar la indentación en Python antes de producir resultados finales.
- Traducción y localización asistida: el modelo puede traducir texto e imágenes entre los cinco idiomas soportados y explicar matices contextuales con razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible.

La model card del modelo base indica una mejora del 12,8% en velocidad de decodificación y una tasa de aceptación MTP del 80,7%, a cambio de una puntuación MMLU-Pro mixta inferior a la del base Qwen3.8-27B. No se proporcionan valores concretos de MMLU, HumanEval, GSM8K ni otros benchmarks. Tampoco se dispone de datos cuantitativos de latencia o throughput para esta versión NVFP4.

## Requisitos de hardware

- VRAM estimada para inferencia en NVFP4: aproximadamente 15-20 GB para pesos y caché KV en tareas de texto, teniendo en cuenta los 27.781 millones de parámetros a 4 bits. Para tareas con imágenes o contextos largos, se requerirá más memoria de caché KV.
- GPU recomendadas: RTX 4090 (24 GB) para ejecución local con vLLM o llama.cpp; también es viable en A100 de 40 GB o H100.
- Cabe en GPU de consumo con 24 GB de VRAM, como RTX 4090, pero puede no caber en modelos de 16 GB como RTX 4080 dependiendo de la longitud del contexto.
- Opciones de despliegue: vLLM para servicio de inferencia, llama.cpp y GGUF para ejecución en CPU o GPU de consumo, Ollama si se exporta a formato compatible, y TGI para despliegue en producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se comparan las variantes del mismo modelo base y el modelo sin cuantizar. Los datos de longitud de contexto no están disponibles.

| Modelo | Parametros | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwopus3.8-27B-Flash-NVFP4 | 27.781 millones | NVFP4 (4 bits) | Apache 2.0 | Hugging Face |
| Qwopus3.8-27B-Flash-FP8 | 27.781 millones | FP8 (8 bits) | Apache 2.0 | Hugging Face |
| Qwopus3.8-27B-Flash | 27.781 millones | Original sin cuantizar | Apache 2.0 | Hugging Face |
| Qwen3.8-27B | 27.781 millones | Original | Apache 2.0 (presumible) | Hugging Face (base) |

La cuantización NVFP4 reduce el peso y el uso de memoria frente a FP8 y al modelo original, con un posible impacto en la precisión. No se dispone de comparativas numéricas para confirmar la diferencia real de rendimiento.

## Limitaciones y advertencias

- Problema conocido: en algunas tareas específicas de código Python, el modelo puede generar indentación incorrecta. El autor indica que la corrección está en proceso y que el fallo no afecta a otras capacidades.
- La puntuación MMLU-Pro del modelo Flash es inferior a la del base Qwen3.8-27B. Esta pérdida de rendimiento es el resultado del trade-off buscado para reducir el coste y la latencia del razonamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento y generación de código.
- La cuantización NVFP4 puede degradar ligeramente la precisión en tareas que requieren alta fidelidad numérica o razonamiento matemático fino.
- Los datos de entrenamiento incluyen trazas reconstruidas de modelos cerrados (Claude y GPT). Aunque la licencia del modelo es Apache 2.0, el usuario debe revisar los términos de uso del dataset y verificar posibles restricciones de derechos de autor antes de usarlo en productos comerciales.
- La lista de idiomas se limita a cinco; no se garantiza el rendimiento en otros idiomas fuera de esta lista.
- No se han publicado benchmarks numéricos ni evaluaciones externas independientes, por lo que el rendimiento en producción debe validarse en el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vwdubb/Qwopus3.8-27B-Flash-NVFP4
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Versión FP8: https://huggingface.co/vwdubb/Qwopus3.8-27B-Flash-FP8
- Reupload del modelo NVFP4: https://huggingface.co/BennyDaBall/Qwopus3.8-27B-Flash-NVFP4
- Framework de entrenamiento Unsloth: https://unsloth.ai/
