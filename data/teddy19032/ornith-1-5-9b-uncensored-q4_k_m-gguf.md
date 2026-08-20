# teddy19032/Ornith-1.5-9B-uncensored-Q4_K_M-GGUF

## Resumen

Ornith-1.5-9B-uncensored-Q4_K_M-GGUF es una conversión al formato GGUF (cuantización Q4_K_M) del modelo base `junafinity/Ornith-1.5-9B-uncensored`, realizada por el usuario teddy19032 mediante la herramienta GGUF-my-repo de llama.cpp. El modelo original, según los tags de HuggingFace, está basado en la arquitectura Qwen3.5, es multimodal (procesa imagen y texto) y ha sido sometido a técnicas de "abliteration" y "zerofuse" para eliminar los mecanismos de rechazo y censura, resultando en una versión "uncensored". Con aproximadamente 8,95 mil millones de parámetros, este modelo está pensado para ejecutarse en entornos locales mediante llama.cpp, Ollama u otros motores compatibles con GGUF.

La relevancia de esta conversión radica en que permite desplegar un modelo multimodal de gran tamaño en hardware de consumo, gracias a la cuantización Q4_K_M que reduce el peso a unos 5,6 GB. Al ser una versión sin censura, está orientada a casos de uso donde se requiere libertad creativa o exploración de contenido sin restricciones, aunque esto conlleva riesgos éticos y legales. La licencia Apache 2.0 facilita su uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 (según tags), multimodal (imagen-texto) |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única disponible en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `junafinity/Ornith-1.5-9B-uncensored`. Los tags indican que se basa en Qwen3.5, lo que sugiere una arquitectura transformer multimodal con capacidad de procesar imágenes y texto. El modelo ha sido sometido a técnicas de "abliteration" (eliminación de capas o pesos relacionados con el rechazo) y "zerofuse" (posiblemente una técnica de fusión de pesos para eliminar sesgos de censura), lo que da como resultado una versión "uncensored" que no aplica los filtros de seguridad habituales. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se utilizó RLHF o DPO. La conversión a GGUF se realizó con llama.cpp, manteniendo la funcionalidad multimodal original.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas basadas en ambas modalidades.
- Generación de texto libre: al ser "uncensored", no aplica restricciones de contenido, lo que permite respuestas sobre temas sensibles o controvertidos.
- Razonamiento y comprensión contextual: hereda las capacidades de la familia Qwen3.5, que incluyen razonamiento lógico y comprensión de instrucciones complejas.
- Soporte para inferencia local: al estar en formato GGUF, puede ejecutarse en CPU y GPU mediante llama.cpp, llama-server, Ollama u otros motores compatibles.
- No se ha confirmado soporte para tool calling, function calling o agentes multi-paso en la información disponible.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o explícitos, donde un modelo censurado limitaría la creatividad.
- Análisis de imágenes con libertad interpretativa: descripción de imágenes médicas, artísticas o técnicas sin filtros de contenido, útil para investigación académica.
- Desarrollo de asistentes de chat personalizados: integración en aplicaciones de chat locales donde el usuario desea un asistente sin censura para conversaciones abiertas.
- Prototipado de aplicaciones multimodales: desarrollo de demos que combinan visión y lenguaje, como generación de descripciones de imágenes o respuesta a preguntas visuales.
- Investigación en alineación y seguridad: estudio de los efectos de la abliteración en el comportamiento del modelo, comparando con versiones censuradas.
- Despliegue en entornos sin conexión: uso en dispositivos edge o servidores privados donde no se permite el acceso a APIs externas, gracias al formato GGUF y la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo o su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 5,6 GB, por lo que se necesitan al menos 6-8 GB de VRAM para cargar el modelo en GPU, dependiendo del contexto y el overhead del motor.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4080, o GPUs de datacenter como A10G o L4. También puede ejecutarse en CPU con suficiente RAM (16 GB o más).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, o cualquier motor que soporte GGUF. También se puede usar con vLLM si se convierte a otro formato, aunque no es el propósito de este repo.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4070, se puede esperar una velocidad de generación de 20-40 tokens por segundo para un modelo de 9B en Q4_K_M, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo base `junafinity/Ornith-1.5-9B-uncensored` no tiene benchmarks publicados, y no se conocen alternativas directas con las mismas características (multimodal, 9B, uncensored, GGUF). Se podría comparar con otros modelos GGUF de tamaño similar como Llama-3.1-8B-Instruct o Qwen2.5-7B-Instruct, pero no se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar contenido ofensivo, ilegal o peligroso. Su uso en producción requiere supervisión humana y políticas de uso estrictas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados.
- Falta de información técnica: no se han publicado detalles sobre el contexto máximo, idiomas soportados o rendimiento, lo que dificulta su evaluación para casos de uso específicos.
- Pérdida de precisión por cuantización: la conversión a Q4_K_M puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en precisión completa.
- Dependencia del modelo base: cualquier limitación del modelo original (sesgos, errores) se hereda en esta versión.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del contenido generado.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/teddy19032/Ornith-1.5-9B-uncensored-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
