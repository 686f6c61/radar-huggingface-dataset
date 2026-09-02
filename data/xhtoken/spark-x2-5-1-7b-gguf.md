# XHToken/Spark-X2.5-1.7B-GGUF

## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje compacto y de propósito general desarrollado por XHToken (SparkLLM), diseñado para tareas de conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de agente. Este repositorio concreto ofrece una conversión en formato GGUF (BF16) del modelo base, pensada para su despliegue local con herramientas como Ollama, LM Studio o llama.cpp.

El modelo destaca por su arquitectura de atención híbrida, que le permite alcanzar una longitud de contexto nativa de hasta 1 millón de tokens, y por cubrir más de 200 idiomas. Con aproximadamente 1.700 millones de parámetros, se posiciona como una opción eficiente para entornos con recursos limitados, manteniendo un rendimiento competitivo en tareas cotidianas. Su licencia Apache 2.0 facilita su uso comercial y su integración en proyectos de código abierto.

La relevancia de este lanzamiento radica en la combinación de un tamaño reducido con una ventana de contexto extremadamente larga, lo que lo hace especialmente útil para aplicaciones de recuperación aumentada (RAG), agentes autónomos y procesamiento de documentos extensos, donde los modelos de menor escala suelen quedarse cortos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atención híbrida (no se especifica el tipo exacto) |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1M tokens (nativo) |
| Tipos de cuantizacion | BF16 (GGUF) |
| Idiomas soportados | Más de 200 idiomas (etiquetado en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

La arquitectura de Spark-X2.5-1.7B se describe como de atención híbrida, aunque no se detallan los componentes específicos (por ejemplo, si combina atención tradicional con mecanismos lineales o de ventana deslizante). Esta elección de diseño es la que permite alcanzar una ventana de contexto de hasta 1 millón de tokens sin un coste computacional prohibitivo, algo inusual en modelos de este tamaño.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas (como RLHF o DPO). El modelo se presenta como una versión compacta de la serie Spark-X2.5, orientada a equilibrar rendimiento y eficiencia. La conversión GGUF incluida en este repositorio está optimizada para inferencia local mediante llama.cpp y sus derivados.

## Capacidades

- Generación de texto en múltiples idiomas (más de 200), con especial soporte para inglés y chino.
- Razonamiento y resolución de problemas en tareas cotidianas y técnicas.
- Generación de código y asistencia en programación.
- Traducción automática entre idiomas.
- Uso de herramientas (tool calling) y ejecución de flujos de agente.
- Soporte de modo de pensamiento (thinking mode), que puede desactivarse con `--think=false` para respuestas más rápidas.
- Manejo de contextos muy largos (hasta 1M tokens), adecuado para documentos extensos y conversaciones multi-turno.

## Casos de uso

- **Atención al cliente automatizada**: gracias a su ventana de contexto de 1M tokens, el modelo puede mantener conversaciones largas y recordar detalles de interacciones previas sin perder el hilo, gestionando consultas complejas en varios idiomas.
- **Generación de código en producción**: con soporte para tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, revisar cambios o generar documentación técnica, reduciendo la carga de los desarrolladores.
- **Sistemas RAG (recuperación aumentada)**: su contexto extendido permite inyectar grandes volúmenes de documentos (manuales, informes, bases de conocimiento) y responder preguntas con precisión, sin necesidad de fragmentar el texto.
- **Agentes autónomos**: el modelo puede actuar como núcleo de un agente que planifica y ejecuta tareas multi-paso, utilizando herramientas externas (APIs, bases de datos) gracias a su capacidad de function calling.
- **Traducción y localización**: al cubrir más de 200 idiomas, es útil para traducir contenido web, documentación técnica o interfaces de usuario, con un coste computacional bajo.
- **Asistente de escritura creativa**: puede redactar artículos, guiones o contenido de marketing, manteniendo coherencia a lo largo de textos extensos gracias a su contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace y la documentación asociada no incluyen métricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el modelo base (XHToken/Spark-X2.5-1.7B) para futuras actualizaciones con datos de evaluación.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 1,7B parámetros en BF16, los pesos ocupan aproximadamente 3,4 GB. Con overhead de inferencia, se recomienda al menos 4-5 GB de VRAM para ejecución cómoda.
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM, como NVIDIA RTX 3060, RTX 4060, GTX 1660 Super, o GPUs de Apple Silicon con Metal (8 GB o más).
- **Compatibilidad con GPU de consumo**: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en algunas integradas con suficiente memoria compartida.
- **Opciones de despliegue**: llama.cpp (compilación específica de XHToken), Ollama (con build personalizado), LM Studio (sustituyendo el runtime de llama.cpp), y cualquier otro frontend compatible con GGUF.
- **Latencia y throughput**: no se dispone de datos oficiales. En una GPU moderna, se espera una generación de decenas de tokens por segundo, pero depende del hardware y de la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Spark-X2.5-1.7B | 1,7B | 1M tokens | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-1.5B | 1,5B | 32K tokens | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-1B | 1,2B | 128K tokens | Llama 3.2 | GGUF, safetensors |

No se dispone de datos de benchmarks comparativos entre estos modelos. La principal diferencia de Spark-X2.5-1.7B es su contexto nativo de 1M tokens, muy superior al de sus competidores directos, aunque su rendimiento en tareas específicas no ha sido publicado.

## Limitaciones y advertencias

- Al ser un modelo de 1,7B parámetros, su capacidad de razonamiento complejo y generación de código avanzado es limitada en comparación con modelos de mayor escala.
- No se han publicado estudios de sesgos o alucinaciones específicos para este modelo. Como cualquier LLM, puede generar información incorrecta o inventada, especialmente en contextos largos.
- La ventana de contexto de 1M tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el coste computacional aumenta.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue local requiere compilar una versión específica de llama.cpp, lo que puede suponer una barrera técnica para usuarios no familiarizados.
- El modelo está etiquetado principalmente para inglés y chino, aunque se afirma que cubre más de 200 idiomas. La calidad en idiomas minoritarios puede ser inferior.
- No se garantiza la compatibilidad con todas las versiones de llama.cpp, Ollama o LM Studio; se recomienda usar las versiones indicadas en la documentación.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/XHToken/Spark-X2.5-1.7B-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/XHToken/Spark-X2.5-1.7B)
- [Repositorio GitHub de Spark-X2.5](https://github.com/XHToken/Spark-X2.5)
- [llama.cpp compatible (fork de XHToken)](https://github.com/XHToken/llama.cpp)
- [Perfil de XHToken en GitHub](https://github.com/XHToken)
- [Referencia en LLM Reference](https://www.llmreference.com/model/spark-x2.5-1.7b)
