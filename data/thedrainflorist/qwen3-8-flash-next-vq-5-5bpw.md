# TheDrainFlorist/Qwen3.8-Flash-Next-VQ-5.5bpw

## Resumen

TheDrainFlorist/Qwen3.8-Flash-Next-VQ-5.5bpw es una cuantización vectorial (VQ) sin datos del modelo Qwen3.8-Flash-Next de Qwen, un modelo de lenguaje multimodal de tipo MoE (mixture of experts) con 180B parámetros totales y 10 de 512 expertos activos. Esta versión concreta está optimizada para Apple Silicon mediante la librería MLX y reduce el tamaño del checkpoint a 111.6 GiB (120.7 GB en el repositorio) frente a los 335 GiB del modelo original en bf16, lo que permite ejecutarlo en equipos con 128 GB de memoria unificada.

La cuantización emplea una técnica de vector quantization con codebooks: los expertos MoE se comprimen con dimensión d=2 y K=1024 (filas empaquetadas de 10 bits), mientras que la capa PLE (probablemente product-key embedding) usa d=8 y K=4096. El resultado es una pérdida de calidad medida por KL de 34.1 mnats/token frente al teacher bf16, con un 94.1% de acuerdo top-1, superando a las conversiones afines de 5 bits (116 GiB) y acercándose al nivel de una cuantización afín de 6 bits (137 GiB) con menor tamaño.

La relevancia de este modelo radica en que permite ejecutar un frontier MoE de 180B en hardware de consumo de Apple, sin necesidad de GPU dedicadas, gracias a la combinación de la arquitectura Qwen4 (GDN + QSA hybrid attention) y la compresión VQ. Está pensado para desarrolladores que quieran desplegar un modelo de alto rendimiento en equipos Mac con memoria unificada grande, manteniendo un equilibrio entre calidad y huella de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4 (GDN + QSA hybrid attention), MoE con 512 expertos y 10 activos, con torre de visión bf16 |
| Parametros totales | 180B (modelo base) / 56.250.051.987 (elementos en safetensors de esta versión VQ) |
| Parametros activos | 10 de 512 expertos (no se especifica el número de parámetros activos) |
| Longitud de contexto | 262K (según documentación de unsloth) |
| Tipos de cuantizacion | Vector quantization 5.5 bpw (d=2/K=1024 para expertos, d=8/K=4096 para PLE) |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura Qwen4 que combina atención GDN (Grouped Dot-product Network) y QSA (Quadratic Self-Attention), según el blog oficial de Qwen. Es un MoE con 512 expertos y 10 activos, e incorpora una capa PLE (n-gram product-key embedding) de 51.2B parámetros. La versión cuantizada aquí descrita no ha sido entrenada, sino que se ha obtenido mediante un proceso de cuantización vectorial sin datos (data-free) usando la herramienta VQLab. El método consiste en aplicar k-means (algoritmo de Lloyd) sobre los pesos del checkpoint bf16, con semilla 1234, para construir codebooks que reemplazan bloques de pesos por índices. Los expertos MoE se agrupan en pares (d=2) con 1024 centroides, y la capa PLE en grupos de 8 (d=8) con 4096 centroides. El runtime VQ se incluye dentro del propio checkpoint como `model.py`, de modo que funciona con stock `mlx-lm` sin parches.

El autor reporta que la distribución del daño por capas no es uniforme: la capa 1 y un bloque tardío (capas 31-39) concentran la mayor pérdida, y esta distribución es consistente entre distintas geometrías de cuantización (correlación de rango 0.905). No se ha aplicado ninguna mezcla de apalancamiento (leverage mix) porque a este tamaño el beneficio resultó marginal.

## Capacidades

- Generación de texto y conversación multiuso, heredadas del modelo base Qwen3.8-Flash-Next.
- Razonamiento avanzado y resolución de problemas complejos, según las capacidades del modelo original.
- Comprensión multimodal con visión: incluye una torre de visión bf16 de 0.84 GiB (333 tensores) que permite procesar imágenes junto con texto.
- Soporte para tool calling y function calling, probablemente disponible en el modelo base, aunque no se confirma explícitamente en la documentación de esta cuantización.
- Capacidades multilingües limitadas: la model card declara solo inglés, aunque el modelo base podría soportar más idiomas (no especificado).
- Ejecución en Apple Silicon mediante MLX, sin necesidad de parches adicionales.

## Casos de uso

- Asistente conversacional local en Mac: con 128 GB de RAM unificada, se puede desplegar un chat de alta calidad sin conexión a internet, aprovechando la ventana de contexto de 262K para mantener conversaciones largas con historial extenso.
- Análisis de documentos largos: la ventana de contexto amplia permite procesar informes, libros o contratos completos de una sola vez, con razonamiento sobre el contenido.
- Generación de código asistida: el modelo base es competente en tareas de programación; esta versión cuantizada puede usarse en entornos de desarrollo locales para autocompletado o revisión de código, con la ventaja de no enviar datos a la nube.
- Aplicaciones de visión por computadora: al incluir la torre de visión, se puede usar para describir imágenes, responder preguntas visuales o extraer información de capturas, todo en local.
- Prototipado de agentes autónomos: con soporte para tool calling (si el modelo base lo ofrece), se pueden construir agentes que interactúen con APIs y ejecuten tareas multi-paso, ejecutándose íntegramente en el dispositivo.
- Investigación académica: la cuantización VQ permite estudiar el comportamiento de modelos MoE a gran escala en hardware accesible, facilitando experimentos de interpretabilidad o fine-tuning adaptativo.

## Benchmarks y rendimiento

El autor proporciona una tabla comparativa de la calidad de esta cuantización frente a otras conversiones afines del mismo modelo, medida con KL divergencia contra el teacher bf16, acuerdo top-1 y perplexidad en un corpus de prosa (2048 tokens). Todos los tamaños incluyen la torre de visión bf16.

| build | tamaño | KL a bf16 (mnats/tok) | acuerdo top-1 | perplexidad |
|---|---|---|---|---|
| affine q3 (del autor) | 75 GiB | 1083.4 | 61.9% | 12.850 |
| affine q4 (del autor) | 96 GiB | 293.9 | 79.6% | 6.453 |
| affine q5 (del autor) | 116 GiB | 91.7 | 87.5% | 5.243 |
| **este modelo (VQ 5.5bpw)** | **111.6 GiB** | **34.1** | **94.1%** | **5.245** |
| affine q6 (del autor) | 137 GiB | 52.8 | 91.6% | 4.916 |
| affine q8 (del autor) | 178 GiB | 27.1 | 94.9% | 5.197 |
| bf16 teacher | 335 GiB | 0 | 100% | 5.166 |

En corpora adicionales: perplexidad en código 1.898 (corpus público mlx) y en literatura 7.636 (Gutenberg). El teacher obtiene 1.902 y 7.664 respectivamente. El autor recomienda clasificar por KL, no por perplexidad, ya que esta última es un agregado que puede enmascarar errores compensados.

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Memoria: 128 GB de RAM unificada (el autor indica "tight" en 128 GB), por lo que se recomienda un Apple Silicon con al menos esa capacidad.
- GPU: no requiere GPU dedicada; funciona con la GPU integrada de Apple Silicon (M-series) a través de MLX.
- Almacenamiento: 120.7 GB de espacio en disco para el repositorio.
- Despliegue: compatible con `mlx-lm` sin parches; el runtime VQ está incluido en el checkpoint como `model.py`.
- Latencia y throughput: no se proporcionan datos específicos; dependerá del chip (M1 Ultra, M2 Ultra, M3 Max, etc.) y de la memoria disponible.

## Comparativa con modelos similares

La comparativa más directa es contra las versiones de cuantización afín del mismo modelo base, que el autor ha generado con la misma herramienta y evaluado con el mismo instrumento. La tabla de benchmarks anterior muestra que esta versión VQ de 111.6 GiB supera en KL y acuerdo top-1 a la afín q5 (116 GiB) y a la q6 (137 GiB), con un tamaño menor que ambas. Frente a la afín q8 (178 GiB), la VQ queda ligeramente por detrás en KL (34.1 vs 27.1) pero con un ahorro de 66 GiB. En términos de licencia, todas las versiones derivadas del mismo modelo base comparten la licencia qwen-community-1.0.

No se dispone de comparativas con otros modelos de la misma categoría (p.ej. Llama 3.1 405B cuantizado, Mixtral 8x22B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización VQ introduce una pérdida de calidad medible (KL 34.1 mnats/tok frente al teacher), aunque es menor que la de las cuantizaciones afines de tamaño similar. Para tareas sensibles, se recomienda validar el comportamiento en el caso de uso concreto.
- El modelo está limitado al inglés según la model card; no se garantiza rendimiento en otros idiomas.
- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen que puede tener restricciones de uso comercial; es necesario revisar los términos completos antes de desplegar en producción.
- El tamaño del checkpoint (120.7 GB) requiere equipos con 128 GB de memoria unificada o superior; no es viable en configuraciones de 64 GB o menos.
- La torre de visión se incluye en bf16, lo que aumenta el uso de memoria; si no se necesita visión, se podría eliminar, pero no se documenta cómo hacerlo.
- No se han realizado pruebas de seguridad o sesgos; el modelo hereda los sesgos potenciales del modelo base Qwen3.8-Flash-Next.
- El autor no proporciona garantías de soporte ni mantenimiento; es un artefacto experimental generado con VQLab.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.8-Flash-Next-VQ-5.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Guía de unsloth para ejecutar el modelo: https://unsloth.ai/docs/models/qwen3.8-next
- Herramienta VQLab: https://github.com/noahzelezny/VQLab
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
