# YCWTG/Qwen3.8-27B-NVFP4A16-GPTQ

## Resumen

El modelo YCWTG/Qwen3.8-27B-NVFP4A16-GPTQ es una versión cuantizada del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario YCWTG mediante la herramienta llm-compressor del ecosistema vLLM. Se trata de un modelo denso multimodal (image-text-to-text) con capacidades de razonamiento, conversación y tool calling. La cuantización NVFP4A16 reduce los pesos a 4 bits mientras mantiene las activaciones en 16 bits, lo que permite una inferencia más eficiente en hardware NVIDIA compatible. El modelo incluye un modo "thinking" activado por defecto, así como soporte para razonamiento multi-paso y llamada a herramientas.

La arquitectura base es Qwen3.8-27B, que incorpora atención lineal y capas de predicción multi-token (MTP). El modelo está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors con cuantización GPTQ/NVFP4A16. Los archivos safetensors reportan un total de 19.135.892.976 parámetros, aunque la nomenclatura del nombre sugiere 27B; esta discrepancia puede deberse a la convención de nombres o a la estructura del modelo cuantizado. La longitud de contexto máxima configurada en el ejemplo de vLLM es de 29.632 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) con atención lineal y MTP |
| Parametros totales | 19.135.892.976 (según safetensors; el nombre sugiere 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 29.632 tokens (configurado en vLLM) |
| Tipos de cuantizacion | NVFP4A16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ cuantizado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con capacidades multimodales, capaz de procesar imágenes y texto. Incorpora atención lineal en algunas capas, lo que reduce el coste computacional en secuencias largas, y capas de predicción multi-token (MTP) que permiten predecir varios tokens a la vez. La versión cuantizada mantiene en 16 bits las capas de salida (lm_head), el encoder visual, las capas de atención lineal y las capas MTP, mientras que el resto de los pesos se cuantizan a 4 bits con el formato NVFP4. Esta estrategia preserva la precisión en las partes críticas del modelo.

El entrenamiento original de Qwen3.8-27B no está documentado en la información proporcionada; se desconoce el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. La cuantización se realizó con llm-compressor, una herramienta del ecosistema vLLM, y no se indican datos adicionales sobre el proceso de calibración.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo está diseñado para tareas de conversación y asistencia, con un modo "thinking" activado por defecto que permite razonar antes de responder.
- Soporte multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text), lo que permite tareas de visión-lenguaje como descripción de imágenes, respuesta a preguntas visuales, etc.
- Tool calling: el ejemplo de vLLM incluye `enable_auto_tool_choice` y `tool_call_parser: qwen3_coder`, lo que indica soporte para llamar a herramientas externas.
- Razonamiento multi-paso: con el parser de razonamiento `qwen3`, puede generar cadenas de razonamiento antes de la respuesta final.
- Modo instruct: se puede desactivar el modo thinking mediante la configuración del chat template para usar el modo instruct estándar.
- Cuantización eficiente: NVFP4A16 reduce el uso de memoria y acelera la inferencia en GPUs NVIDIA compatibles.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener diálogos multi-turno con contexto largo (hasta ~29k tokens) y procesar imágenes, adecuado para chatbots de soporte que necesitan entender capturas de pantalla o documentos visuales.
- Razonamiento y análisis de documentos: gracias a su modo thinking y su capacidad de procesar imágenes, puede analizar gráficos, tablas o diagramas y proporcionar explicaciones detalladas.
- Generación de código con tool calling: el parser `qwen3_coder` sugiere que puede integrarse en entornos de desarrollo para generar o modificar código, llamando a herramientas como intérpretes o APIs.
- Automatización de tareas de visión por computador: descripción de imágenes, respuesta a preguntas visuales (VQA) y extracción de información de imágenes en entornos empresariales.
- Agentes autónomos: con soporte para tool calling y razonamiento multi-paso, puede actuar como agente que planifica y ejecuta acciones en un entorno simulado.
- Investigación en IA multimodal: al ser de código abierto (Apache 2.0) y cuantizado, es útil para experimentos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 19.1B parámetros cuantizados a 4 bits, los pesos ocupan aproximadamente 9.5 GB. Con overhead de activaciones y caché KV, se estima que puede caber en una GPU con 16-24 GB de VRAM, como una RTX 4090 o A100 de 40 GB.
- GPU recomendadas: NVIDIA con soporte para FP16 y cuantización NVFP4 (arquitecturas Ampere o posteriores). Ejemplos: A100, H100, RTX 3090, RTX 4090.
- Compatibilidad con GPUs de consumo: sí, probablemente cabe en una RTX 3090/4090 de 24 GB, aunque la latencia dependerá del tamaño de la secuencia.
- Opciones de despliegue: vLLM (recomendado según la model card), también compatible con transformers y posiblemente con llama.cpp si se convierte a GGUF (aunque no se indica).
- Latencia y throughput: no disponibles. Se recomienda usar vLLM con `gpu_memory_utilization=0.98` y `max_num_seqs=1` para baja latencia.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información facilitada.

## Limitaciones y advertencias

- La cuantización NVFP4A16 puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo original en FP16, especialmente en tareas de razonamiento complejo.
- El modelo base Qwen3.8-27B no tiene documentación pública sobre sesgos o limitaciones en la información proporcionada; se recomienda evaluar en el dominio de uso.
- La longitud de contexto máxima de 29.632 tokens puede ser insuficiente para documentos muy largos.
- No se especifican los idiomas soportados; es probable que el modelo base esté entrenado principalmente en inglés y chino (dado que Qwen es de Alibaba), pero no se confirma.
- La licencia Apache 2.0 permite uso comercial, pero hay que respetar los términos del modelo base original (Qwen/Qwen3.8-27B), que también es Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una versión reciente o poco probada; se recomienda validar su funcionamiento antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YCWTG/Qwen3.8-27B-NVFP4A16-GPTQ
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
