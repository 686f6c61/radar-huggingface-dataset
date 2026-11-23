# TensorFold/Hy4-flash-MLX-8bit-MTP

## Resumen

Hy4-flash MLX 8-bit MTP es una conversión a formato MLX del modelo multimodal Hy4-flash desarrollado por Tencent. Se trata de un modelo de mezcla de expertos (MoE) con 220 251 201 958 parámetros totales y aproximadamente 12 000 millones de parámetros activos por token, capaz de procesar texto e imágenes (pipeline image-text-to-text). La conversión la firma TensorFold y está empaquetada con el drafter DFly2 de decodificación especulativa incluido a precisión de origen.

El checkpoint emplea cuantización afín de 8 bits en safetensors MLX, con tamaño de grupo 64 para la mayoría de pesos y 32 para los embeddings Engram. El repositorio ocupa 239,3 GB y se distribuye en 148 shards. La torre de visión y las compuertas del router MoE se conservan a precisión de origen, lo que preserva la calidad en las partes más sensibles del modelo.

La relevancia de esta ficha es doble: por un lado documenta una de las primeras conversiones MLX de un MoE multimodal de escala 220B orientada a Apple Silicon; por otro, advierte de que se trata de un checkpoint en vista previa. La propia model card indica que TensorFold 1.2.9 rechaza esta arquitectura al arrancar y que la generación, la paridad de DFly2 y los requisitos de memoria en tiempo de ejecución están pendientes de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal con atención de ventana deslizante, atención dispersa y embeddings Engram; drafter DFly2 de 5 capas |
| Parametros totales | 220 251 201 958 |
| Parametros activos | Aproximadamente 12 000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín 8 bits (grupo 64; grupo 32 en embeddings Engram); torre de visión y compuertas del router MoE a precisión de origen |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | safetensors MLX (148 shards), 239,3 GB en repositorio |
| Modelo base | tencent/Hy4-flash |
| Libreria | mlx |
| Pipeline | image-text-to-text |
| Drafter incluido | DFly2 a precisión de origen (87 tensores) |

## Arquitectura y entrenamiento

Hy4-flash es, según la descripción de Tencent recogida en la model card, un modelo de mezcla de expertos multimodal con 220 000 millones de parámetros totales y unos 12 000 millones activos por token. La pila de lenguaje combina atención de ventana deslizante, atención dispersa y embeddings Engram. El sufijo MTP del repositorio identifica la variante que incluye el drafter DFly2, un módulo de cinco capas que reutiliza la caché KV del modelo objetivo y las posiciones de atención dispersa para la decodificación especulativa. DFly2 requiere el índice de atención dispersa y la caché KV del modelo.

La conversión parte del checkpoint BF16 fijado por Tencent y conserva el tokenizador, el procesador, la plantilla de chat y la configuración de DFly2. Según TensorFold, los 148 shards de salida coinciden con el índice de tensores, las muestras de pesos empaquetados coinciden con la cuantización afín de MLX y los 87 tensores de DFly2 coinciden byte a byte con los del upstream. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en formato image-text-to-text.
- Procesamiento conjunto de texto e imágenes mediante torre de visión conservada a precisión de origen.
- Razonamiento multi-turno gracias a la arquitectura MoE con 12B de parámetros activos.
- Decodificación especulativa mediante el drafter DFly2 incluido en el checkpoint.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal en local sobre Apple Silicon: el checkpoint MLX 8 bits permite ejecutar un MoE de 220B en hardware de Apple con memoria unificada, procesando entradas de texto e imagen en un único flujo conversacional.
- Prototipado de pipelines image-text-to-text: útil para equipos que desarrollan aplicaciones de descripción de imágenes, extracción de información visual o respuesta a preguntas sobre documentos escaneados antes de migrar a infraestructura CUDA.
- Evaluación de decodificación especulativa: el drafter DFly2 empaquetado permite medir la aceleración de la generación frente a la decodificación convencional, reutilizando la caché KV y las posiciones de atención dispersa del modelo objetivo.
- Investigación sobre cuantización MLX: la combinación de grupo 64 en pesos generales y grupo 32 en embeddings Engram, con torre de visión y router a precisión de origen, sirve como caso de estudio de qué componentes conviene mantener en alta precisión.
- Desarrollo de aplicaciones de visión conversacional en entornos con requisitos de privacidad: al ejecutarse localmente, los datos de imagen no salen del dispositivo, lo que encaja en sectores con restricciones de tratamiento de datos.
- Benchmarking de arquitecturas MoE multimodales: comparar el rendimiento de un MoE de 220B con 12B activos frente a modelos densos de tamaño similar en tareas de razonamiento visual.
- Integración en flujos de chat con plantilla propia: el repositorio conserva el tokenizador, el procesador y la plantilla de chat del modelo original, lo que facilita adaptar aplicaciones existentes de Tencent Hy4-flash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 239,3 GB para los pesos en 8 bits; la variante MLX 4 bits del mismo autor ocupa 129,86 GB.
- Memoria en tiempo de ejecución: no disponible; la model card indica que depende del motor, la longitud de contexto, la configuración de caché y las peticiones concurrentes, y que está pendiente de validación.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon con memoria unificada; no se especifican modelos concretos de Apple en la información disponible.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable directamente al formato MLX; no disponible para despliegue en estas GPUs sin reconversión.
- Cabe en GPU de consumo: no disponible; por tamaño de pesos (239,3 GB) excede la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: librería MLX; el runtime TensorFold 1.2.9 rechaza esta arquitectura al arrancar según la model card, por lo que el soporte de ejecución está pendiente.
- Latencia y throughput: no disponibles; la paridad de generación y de decodificación especulativa con DFly2 está pendiente de validación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Hy4-flash MLX 8-bit MTP (este) | 220,25B | ~12B | no disponible | tencent-hy-license | safetensors MLX 8 bits |
| Hy4-flash MLX 4-bit MTP (TensorFold) | 220,25B (mismo base) | ~12B | no disponible | tencent-hy-license | safetensors MLX 4 bits, 129,86 GB |
| tencent/Hy4-flash (original) | 220,25B | ~12B | no disponible | tencent-hy-license | BF16 |

No se dispone de datos de benchmarks ni de modelos alternativos de otros fabricantes en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Checkpoint en vista previa: la model card advierte de que TensorFold 1.2.9 rechaza esta arquitectura al arrancar y que la generación, la paridad de DFly2 y los requisitos de memoria en tiempo de ejecución están pendientes de validación.
- No apto para producción sin validación previa: no se ha confirmado que el modelo genere texto correctamente en el runtime actual.
- Requisito de hardware muy elevado: 239,3 GB de pesos en 8 bits exceden la memoria de cualquier GPU de consumo y limitan su uso a equipos Apple Silicon con memoria unificada muy alta.
- Licencia restrictiva: la Tencent Hy License puede imponer condiciones al uso comercial; debe revisarse antes de cualquier despliegue productivo.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe sin evaluación.
- Longitud de contexto no documentada: impide planificar aplicaciones con ventanas largas.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni tasas de alucinación en la información disponible.
- Dependencia de DFly2: la decodificación especulativa requiere el índice de atención dispersa y la caché KV del modelo, lo que añade complejidad operativa frente a una inferencia convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorFold/Hy4-flash-MLX-8bit-MTP
- Variante MLX 4 bits: https://huggingface.co/TensorFold/Hy4-flash-MLX-4bit-MTP
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia Tencent Hy: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
- Releases de TensorFold: https://github.com/ashhart/TensorFold/releases
