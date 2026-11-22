# TensorFold/Hy4-flash-MLX-4bit-MTP

## Resumen

Hy4-flash es un modelo multimodal de tipo mixture-of-experts desarrollado por Tencent, con 220.251.201.958 parámetros totales y aproximadamente 12.000 millones de parámetros activos por token. Acepta entradas de texto e imagen (pipeline `image-text-to-text`) y combina en su pila de lenguaje atención de ventana deslizante, atención dispersa y embeddings Engram. El checkpoint aquí descrito es una conversión no oficial a MLX en 4 bits realizada por TensorFold, que además incluye el drafter DFly2 de decodificación especulativa a precisión de origen.

La relevancia de esta ficha es doble. Por un lado, documenta una de las primeras conversiones cuantizadas de Hy4-flash para Apple Silicon. Por otro, debe subrayarse que se trata de un **checkpoint de vista previa**: la propia model card indica que las comprobaciones de conversión de pesos han pasado, pero que TensorFold 1.2.9 rechaza esta arquitectura al arrancar y que la generación, la paridad de DFly2 y los requisitos de memoria en tiempo de ejecución están pendientes de validación. Es decir, los pesos están publicados y son verificables, pero el motor de inferencia todavía no los soporta.

El modelo base pertenece a la familia Hunyuan de Tencent y se distribuye bajo la Tencent Hy License, una licencia propia con posibles restricciones de uso comercial que conviene revisar antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts multimodal (texto + imagen); pila de lenguaje con atención de ventana deslizante, atención dispersa y embeddings Engram |
| Parametros totales | 220.251.201.958 |
| Parametros activos | Aproximadamente 12.000 millones por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine 4-bit (grupo de 64 para la mayoría de pesos, 32 para embeddings Engram); existe variante MLX 8-bit; torre de visión y puertas del router MoE a precisión de origen |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (`tencent-hy-license`) |
| Formato de pesos | Safetensors MLX (148 shards); drafter DFly2 en formato upstream a precisión de origen |

## Arquitectura y entrenamiento

Hy4-flash es un transformer multimodal con mezcla de expertos. Tencent describe 220.000 millones de parámetros totales con unos 12.000 millones activos por token, lo que sitúa la ratio de activación en torno al 5,5 %. La pila de lenguaje incorpora atención de ventana deslizante, atención dispersa y unos embeddings denominados Engram, una combinación que busca reducir el coste de atención en contextos largos manteniendo capacidad de recuperación de información. El modelo procesa texto e imágenes mediante una torre de visión que, en esta conversión, se mantiene a precisión de origen.

El componente DFly2 es un drafter de decodificación especulativa de cinco capas que reutiliza la caché KV y las posiciones de atención dispersa del modelo objetivo; en esta conversión se incluye a precisión de origen y requiere el índice de atención dispersa y la caché KV del modelo principal. La conversión de TensorFold parte del checkpoint BF16 fijado por Tencent y conserva tokenizer, processor, plantilla de chat y configuración de DFly2. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta en modalidad image-text-to-text.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Decodificación especulativa mediante el drafter DFly2 incluido en el repositorio.
- Capacidades especiales (modo thinking, audio): no disponibles.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener diálogos multi-turno combinando texto e imágenes, adecuado para interfaces donde el usuario adjunta capturas o fotografías y espera respuestas razonadas.
- Análisis de documentos con imágenes: extracción y descripción de contenido visual en flujos de digitalización, aprovechando la torre de visión a precisión completa.
- Prototipado en Apple Silicon: la variante 4-bit (129,86 GB de pesos) permite experimentar con un MoE de 220.000 millones en hardware de Apple con memoria unificada amplia, aunque sujeta a la validación pendiente del runtime.
- Investigación en decodificación especulativa: el repositorio incluye el drafter DFly2 y su configuración, lo que lo convierte en material de estudio para reproducir y medir aceleraciones de decodificación especulativa sobre un MoE multimodal.
- Evaluación comparativa de cuantización: la existencia de variantes 4-bit y 8-bit del mismo modelo permite estudiar la degradación de calidad y el ahorro de memoria entre ambas.
- Generación de descripciones y etiquetado de imágenes a escala: útil en pipelines de anotación semiautomática donde se requiere un modelo capaz de razonar sobre la imagen y producir texto estructurado.
- Base para ajuste fino multimodal: al conservar tokenizer, processor y plantilla de chat, sirve como punto de partida para tareas específicas de visión-lenguaje, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas, y advierte de que la paridad entre generación con drafter y generación directa está pendiente de validación en tiempo de ejecución.

## Requisitos de hardware

- Pesos almacenados: 129,86 GB para la variante 4-bit y 239,30 GB para la 8-bit.
- Memoria en tiempo de ejecución: no disponible; depende del motor, la longitud de contexto, la configuración de caché y las peticiones concurrentes, según la propia model card.
- Hardware objetivo: Apple Silicon con memoria unificada, dado el formato MLX.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este checkpoint concreto al estar en formato MLX; requerirían otra conversión.
- Despliegue: librería MLX; el soporte de runtime depende de las releases de TensorFold y, en la versión 1.2.9, la arquitectura es rechazada al arrancar.
- Latencia y throughput: no disponibles; pendientes de validación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Hy4-flash MLX 4-bit (esta ficha) | 220,25 B | ~12 B | No disponible | Texto + imagen | Tencent Hy License | MLX safetensors 4-bit |
| Hy4-flash MLX 8-bit (TensorFold) | 220,25 B | ~12 B | No disponible | Texto + imagen | Tencent Hy License | MLX safetensors 8-bit |
| tencent/Hy4-flash (original) | 220,25 B | ~12 B | No disponible | Texto + imagen | Tencent Hy License | BF16 (upstream) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otros MoE multimodales de tamaño similar.

## Limitaciones y advertencias

- Checkpoint de vista previa: la generación no está validada y TensorFold 1.2.9 rechaza la arquitectura al arrancar.
- Paridad de DFly2 pendiente: no se ha confirmado que la salida con decodificación especulativa coincida con la generación directa.
- Requisitos de memoria en runtime desconocidos, lo que impide planificar despliegues con garantías.
- Conversión no oficial: los pesos han sido transformados por un tercero (TensorFold), no por Tencent.
- Licencia Tencent Hy License: es una licencia propia, no estándar; deben revisarse las cláusulas de uso comercial antes de producción.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera de los idiomas principales del entrenamiento.
- Sesgos y alucinaciones: no documentados en la información disponible, pero aplicables por tratarse de un modelo generativo de gran escala.
- Longitud de contexto no publicada, lo que limita el diseño de aplicaciones que dependan de ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TensorFold/Hy4-flash-MLX-4bit-MTP
- Variante MLX 8-bit: https://huggingface.co/TensorFold/Hy4-flash-MLX-8bit-MTP
- Modelo base: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Licencia Tencent Hy: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
- Releases de TensorFold: https://github.com/ashhart/TensorFold/releases
