# wangzhang/gemma-4-31B-it-abliterated-GGUF

## Resumen

El modelo `wangzhang/gemma-4-31B-it-abliterated-GGUF` es una conversión a formato GGUF del checkpoint `wangzhang/gemma-4-31B-it-abliterated`, una versión modificada del modelo oficial `google/gemma-4-31B-it` mediante la técnica de abliteración (intervención sobre los pesos para reducir el comportamiento de rechazo). El autor, Wangzhang Wu, publicó esta conversión cuantizada para facilitar la ejecución local con `llama.cpp` en hardware de consumo.

Con aproximadamente 30,7 mil millones de parámetros, el modelo mantiene la arquitectura Gemma 4 (reportada como `gemma4` por `llama.cpp`) y se distribuye en dos cuantizaciones: Q4_K_M (~17 GiB) y Q5_K_M (~20 GiB). La abliteración redujo la tasa de rechazo de 99/100 en el modelo base a 7/100 en el trial 40, lo que lo hace especialmente interesante para investigación sobre alineación y comportamientos de seguridad, aunque con los riesgos asociados a la eliminación de salvaguardas.

La relevancia de este modelo radica en su disponibilidad como GGUF listo para usar con `llama.cpp`, lo que permite desplegarlo en entornos con recursos limitados (una GPU de 24 GB o sistemas con 32 GB de RAM unificada) sin necesidad de infraestructura de servidor. Su licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte de que se trata de una conversión experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer decoder-only) |
| Parametros totales | 30.697.345.596 (aprox. 30,7 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una conversión GGUF del checkpoint `wangzhang/gemma-4-31B-it-abliterated`, que a su vez deriva de `google/gemma-4-31B-it`. La arquitectura subyacente es la de Gemma 4, un transformer decoder-only con aproximadamente 30,7 B de parámetros, aunque no se dispone de detalles adicionales sobre el número de capas, dimensiones de atención o mecanismos específicos (como atención lineal o decodificación especulativa) en la información proporcionada.

El proceso de abliteración se realizó con la herramienta Abliterix, utilizando una evaluación basada en vLLM. En la ejecución final (trial 40), la tasa de rechazo se redujo de 99/100 en el modelo base a 7/100, con una prueba adicional de 15 prompts benignos que mostró 0/15 rechazos. No se han publicado datos sobre el entrenamiento original del modelo Gemma 4 31B (número de tokens, composición del dataset, uso de RLHF/DPO, etc.).

La conversión a GGUF se realizó con el convertidor de `llama.cpp` (commit `683c5acb90478a9e7e20eb65a1bfee334635216d`) a partir de los pesos BF16 en safetensors, seguida de cuantización con `llama-quantize`. El archivo resultante reporta `general.architecture = gemma4` y `modalities = text`.

## Capacidades

- Generación de texto y conversación multi-turno, validada con `llama.cpp` en modo conversacional.
- Modelo de lenguaje denso de 31 B, adecuado para tareas de razonamiento, redacción y comprensión de instrucciones, aunque no se especifican capacidades concretas de tool calling, agentes o razonamiento multi-paso.
- Al ser una versión abliterated, presenta una tasa de rechazo significativamente menor que el modelo original, lo que puede resultar en respuestas más directas en escenarios donde el modelo base tendería a negarse.
- Soporte de cuantización Q4_K_M y Q5_K_M, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.
- Compatible con `llama.cpp` y sus derivados (Ollama, etc.) para ejecución local en CPU, GPU o hardware unificado.

## Casos de uso

- Inferencia local en hardware de consumo: gracias a la cuantización Q4_K_M (~17 GiB), el modelo puede ejecutarse en una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) o en sistemas con 32 GB de RAM unificada (como Apple M4 Max), ofreciendo una alternativa a APIs en la nube para aplicaciones que requieren privacidad o baja latencia.
- Investigación sobre alineación y seguridad: al ser una versión abliterated, es útil para estudiar el impacto de la eliminación de salvaguardas en el comportamiento del modelo, comparando sus respuestas con el modelo original en tareas de rechazo, sesgo y contenido sensible.
- Prototipado rápido de asistentes conversacionales: con `llama.cpp` se puede montar un chatbot local en minutos, ideal para pruebas de concepto o demos sin depender de infraestructura externa.
- Generación de texto creativo y redacción: el modelo puede producir contenido extenso (artículos, guiones, correos) con un estilo natural, aprovechando su tamaño y la reducción de rechazos para temas que el modelo base podría evitar.
- Educación y experimentación: estudiantes e investigadores pueden desplegar el modelo en portátiles con suficiente RAM para aprender sobre cuantización, inferencia local y técnicas de modificación de pesos.
- Desarrollo de aplicaciones de procesamiento de lenguaje natural en entornos aislados: al ser un archivo GGUF autocontenido, se puede integrar en pipelines que requieren ejecución sin conexión o en entornos con políticas estrictas de transferencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pruebas de cordura (sanity check) en un Apple M4 Max 128 GB con Metal: aproximadamente 20 tok/s para Q4_K_M y 16 tok/s para Q5_K_M en generación corta. Estos valores no constituyen un benchmark formal y no hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M (~17 GiB) requiere al menos 20-24 GB de VRAM en GPU para cargar el modelo y los buffers de contexto; Q5_K_M (~20 GiB) necesita 24-28 GB. En sistemas con RAM unificada (Apple Silicon), 32 GB son suficientes para Q4_K_M y 64 GB recomendados para Q5_K_M con contexto largo.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar Q4_K_M con contexto moderado; A100 40 GB o 80 GB, o RTX A6000 (48 GB) son adecuadas para Q5_K_M y contextos más largos. En CPU, se requiere al menos 32 GB de RAM para Q4_K_M.
- Compatibilidad con hardware de consumo: sí, una RTX 3090/4090 (24 GB) o un Mac con 32 GB de RAM unificada pueden ejecutar la versión Q4_K_M sin problemas.
- Opciones de despliegue: `llama.cpp` (recomendado, con soporte nativo para Gemma 4), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF (llama-cpp-python, etc.). No se menciona soporte para vLLM o TGI en esta conversión.
- Latencia y throughput: en el sanity check del autor, ~20 tok/s (Q4_K_M) y ~16 tok/s (Q5_K_M) en un M4 Max. En GPU dedicada (RTX 4090) se esperan valores superiores, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente. A continuación se presenta una comparativa estructural con el modelo original y otras alternativas de tamaño similar, basada únicamente en la información disponible:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| wangzhang/gemma-4-31B-it-abliterated-GGUF | 30,7 B | no disponible | Apache 2.0 | GGUF | Versión abliterated, cuantizada |
| google/gemma-4-31B-it | 30,7 B | no disponible | Apache 2.0 | safetensors | Modelo original sin modificar |
| Qwen 2.5 32B (ejemplo) | 32,5 B | 128K (típico) | Apache 2.0 | safetensors/GGUF | Alternativa de tamaño similar, pero sin datos de rendimiento en esta ficha |

La comparación real de rendimiento requeriría ejecutar los mismos benchmarks en ambos modelos, lo cual no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La abliteración debilita o elimina los mecanismos de seguridad del modelo original. Puede generar contenido inapropiado, ofensivo, explícito, peligroso o ilegal, y no debe utilizarse en producción sin filtros adicionales y supervisión humana.
- El autor declara explícitamente que el modelo se proporciona "AS IS", sin garantías, y que los usuarios son responsables de evaluar su idoneidad para cada caso de uso, incluyendo el cumplimiento legal y regulatorio.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en aplicaciones que requieren ventanas largas (por ejemplo, análisis de documentos extensos).
- Los idiomas soportados no están documentados; aunque Gemma suele ser multilingüe, no hay confirmación para esta versión específica.
- La conversión es experimental y requiere una versión reciente de `llama.cpp`; versiones antiguas pueden fallar al cargar el modelo.
- Riesgo de alucinaciones y sesgos inherentes a los modelos de lenguaje de gran tamaño, posiblemente agravados por la eliminación de restricciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero se deben preservar los avisos de atribución y las condiciones de la licencia original de Gemma.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated-GGUF)
- [Modelo base abliterated (safetensors)](https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated)
- [Modelo original de Google](https://huggingface.co/google/gemma-4-31B-it)
