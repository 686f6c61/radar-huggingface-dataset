# TensorFold/Hy4-flash-MLX-4bit-MTP

## Resumen

Hy4-flash MLX 4-bit + DFly2 es una conversión comunitaria del modelo multimodal Tencent Hy4-flash al formato MLX con cuantización afín de 4 bits, publicada por TensorFold. El modelo base es un mixture-of-experts (MoE) multimodal de 220.251.201.958 parámetros totales y aproximadamente 12.000 millones de parámetros activos por token, diseñado para tareas de imagen-texto-a-texto y conversación. La conversión empaqueta además el drafter DFly2 de decodificación especulativa junto con los pesos objetivo, con el objetivo de acelerar la generación en Apple Silicon.

La relevancia de esta ficha es doble. Por un lado, documenta un checkpoint de 129,9 GB en safetensors MLX que permite ejecutar un MoE multimodal de gran tamaño en hardware de Apple con memoria unificada, algo imposible con los pesos BF16 originales. Por otro, advierte de una limitación crítica: el propio autor indica que la conversión está verificada a nivel de tensores pero el soporte en tiempo de ejecución de TensorFold está pendiente, y la versión 1.2.9 rechaza el checkpoint al no disponer de backend `hy_v4_flash`.

Se trata, por tanto, de un artefacto útil para investigación y para quienes quieran preparar despliegues futuros, pero no de un modelo listo para producción. La model card se autodenomina "draft model card" y no incluye instrucciones de descarga, uso ni mediciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts multimodal (vision-language) con atención de ventana deslizante, atención dispersa y Engram embeddings; drafter DFly2 de 5 capas para decodificación especulativa |
| Parametros totales | 220.251.201.958 |
| Parametros activos | Aproximadamente 12.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín 4-bit (group size 64 en la mayoría de pesos, 32 en Engram embeddings); torre de visión y gates del router MoE en precisión de origen; pesos del drafter DFly2 en precisión de origen |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | Safetensors MLX (148 shards), cuantización afín 4-bit |
| Tamano del repositorio | 129,9 GB (payload de tensores verificado: 129,86 GB) |
| Modelo base | tencent/Hy4-flash |
| Pipeline | image-text-to-text |
| Libreria | mlx |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es, según la descripción de Tencent recogida en la model card, un MoE multimodal de 220.000 millones de parámetros totales con unos 12.000 millones activos por token. La pila de lenguaje combina atención de ventana deslizante, atención dispersa y Engram embeddings. El drafter DFly2 consta de cinco capas y reutiliza la caché KV del modelo objetivo y las posiciones de atención dispersa, lo que lo convierte en un mecanismo de decodificación especulativa acoplado al target.

La conversión de TensorFold parte del checkpoint BF16 fijado por Tencent y conserva tokenizer, processor, chat template y configuración de DFly2. La validación reportada incluye la coincidencia de los 148 shards de salida con el índice de tensores, la verificación por muestreo de los pesos empaquetados frente a la cuantización afín de MLX y la coincidencia byte a byte de los 87 tensores de DFly2 con el original. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline image-text-to-text.
- Procesamiento de imagen y texto combinados (modelo vision-language con torre de visión en precisión de origen).
- Razonamiento y generación de código: capacidad inferida del modelo base, sin datos concretos en la información disponible.
- Decodificación especulativa mediante el drafter DFly2 empaquetado, que reutiliza la caché KV y las posiciones de atención dispersa del modelo objetivo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en decodificación especulativa sobre Apple Silicon: el paquete incluye el drafter DFly2 con sus 87 tensores verificados, lo que permite estudiar la paridad entre generación con draft y generación plana una vez exista soporte de runtime.
- Evaluación de cuantización MLX 4-bit en MoE multimodales: comparar esta conversión con la variante MLX 8-bit del mismo autor (mismo upstream y mismo drafter) para medir el impacto de la cuantización en calidad y memoria.
- Prototipado de asistentes visuales en estaciones de trabajo Mac: el formato MLX y el tamaño de 129,9 GB apuntan a equipos con memoria unificada amplia, adecuado para pruebas de concepto de image-text-to-text.
- Desarrollo de infraestructura de inferencia: servir como caso de prueba para implementar el backend `hy_v4_flash` que TensorFold 1.2.9 aún no incluye.
- Análisis de arquitecturas híbridas de atención: la combinación de ventana deslizante, atención dispersa y Engram embeddings permite estudiar patrones de atención y uso de caché KV en modelos de 220.000 millones de parámetros.
- Benchmarking de memoria en Apple Silicon: la model card deja pendientes las mediciones de velocidad de decodificación y memoria pico, por lo que el modelo es un candidato directo para generar esos datos.
- Archivado y reproducibilidad: al conservar tokenizer, processor, chat template y configuración del drafter, el checkpoint sirve como referencia reproducible de la revisión BF16 fijada de Tencent.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la velocidad de decodificación y la memoria pico están pendientes de medición en Apple Silicon, y que la paridad entre generación con draft y generación plana está pendiente de soporte de runtime.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el payload de pesos verificado es de 129,86 GB; la memoria en ejecución depende además de la longitud de contexto, la configuración de caché y las peticiones concurrentes, según advierte el autor.
- GPU recomendadas: no disponible; el formato MLX está orientado a Apple Silicon, no a GPU NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de pesos excede la memoria de cualquier GPU de consumo convencional; en Apple Silicon requiere configuraciones de memoria unificada muy alta, y el autor no ha medido ningún nivel de memoria.
- Opciones de despliegue: runtime TensorFold (versión 1.2.9 rechaza el checkpoint por falta de backend `hy_v4_flash`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles; pendientes de medición.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-flash MLX 4-bit + DFly2 (esta ficha) | 220.251.201.958 | ~12.000 millones | no disponible | Safetensors MLX 4-bit | tencent-hy-license | Publicado; runtime pendiente |
| Hy4-flash MLX 8-bit + DFly2 (TensorFold) | no disponible en la información | ~12.000 millones (modelo base) | no disponible | Safetensors MLX 8-bit | tencent-hy-license | Publicado; mismo upstream y drafter |
| tencent/Hy4-flash (original) | 220.000 millones | ~12.000 millones | no disponible | BF16 | tencent-hy-license | Publicado en Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no es ejecutable con TensorFold 1.2.9: el runtime lo rechaza al no existir backend `hy_v4_flash`, y DFly2 depende además del índice de atención dispersa y de la caché KV del target.
- La model card es un borrador: no incluye instrucciones de descarga ni de inicio rápido, y la conversión está verificada pero el soporte de runtime está pendiente.
- No hay mediciones de rendimiento ni de memoria en Apple Silicon; cualquier estimación de despliegue es especulativa.
- No se declaran idiomas soportados, lo que impide evaluar cobertura multilingüe.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base en la información disponible.
- La licencia Tencent Hy License es de tipo "other"; debe revisarse el texto completo antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- El tamaño de 129,9 GB limita el despliegue a entornos con memoria unificada muy amplia; la memoria real en ejecución crece con el contexto y la concurrencia.
- La torre de visión y los gates del router MoE se mantienen en precisión de origen, por lo que el ahorro de la cuantización 4-bit no es uniforme en todos los componentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorFold/Hy4-flash-MLX-4bit-MTP
- Modelo base: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Variante MLX 8-bit del mismo autor: https://huggingface.co/TensorFold/Hy4-flash-MLX-8bit-MTP
- Licencia Tencent Hy: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
