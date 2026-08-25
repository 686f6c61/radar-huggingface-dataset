# yuchengm/quadtok-gen-700m-2level

## Resumen

QuadTok Generator 700M es un modelo de generación de imágenes autoregressive desarrollado por Yucheng Mao, estudiante de máster en UC San Diego. El modelo, denominado `gen_700m_local`, implementa un `QuadtreeGPT` causal sobre tokens de imagen del tokenizador QuadTok, que utiliza una estructura de árbol adaptativa de dos niveles para representar imágenes de 256 píxeles. Está condicionado por clase y entrenado sobre ImageNet-1k, con un total de 775,2 millones de parámetros.

La relevancia de este modelo reside en su enfoque de tokenización con árbol de cuaterniones, que reduce el número de tokens por imagen (aproximadamente 231 tokens de media) frente a los métodos de parche fijo, permitiendo una generación autoregressive más eficiente. Se entrenó durante 400.000 pasos con una pérdida final de 6,2358 nats (perplejidad ≈ 513 sobre un vocabulario de 16.384 códigos), aunque no se han publicado métricas de calidad de imagen como FID. El checkpoint incluye pesos EMA para inferencia, y se advierte que requiere un tokenizador VQ QuadTok adicional para decodificar imágenes.

La ficha se elabora a partir de la información disponible en HuggingFace y la model card del autor; no se han encontrado resultados de benchmarks externos ni comparativas con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuadtreeGPT (transformer causal autoregressive, variante LlamaGen-XL) |
| Parametros totales | 775,2 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el fork usa `seq_len=1408` para capacidad de 3 niveles; no es contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no aplicable (modelo de generacion de imagenes) |
| Licencia | other |
| Formato de pesos | safetensors (`state/model.safetensors`) y `meta.pt` (EMA en formato torch) |

## Arquitectura y entrenamiento

El modelo es un `QuadtreeGPT` causal que opera sobre tokens de imagen generados por el tokenizador QuadTok, el cual emplea un árbol de cuaterniones adaptativo al contenido. La arquitectura sigue las dimensiones del modelo `xlarge`: embedding de 1280, profundidad de 36 capas y 20 cabezas de atencion, con un vocabulario de 16.384 códigos y un tamaño de token de 8. La estructura de árbol es de 2 niveles, con `num_patch_side_list [1,2,4,8,16]`, lo que produce aproximadamente 231 tokens por imagen.

El entrenamiento se realizó sobre el conjunto de datos `yuchengm/quadtok_data :: pretok_2level` (1470 shards, 24 GB), con un batch de 232.448 tokens por paso (equivalente a ~1000 imágenes). Se usó AdamW con β(0.9, 0.95), weight decay 0.05, clip de gradiente 0.5, una tasa de aprendizaje de 4e-4 con decaimiento coseno a 2e-5 y warmup de 50.000 pasos. La precisión fue bf16, sin grad checkpointing, usando `flash_attn_varlen_func` con máscara causal de bloques diagonales. El entrenamiento se completó en 3 días y 20 horas en 8× H200, con 44.0 GB de pico por GPU. Se aplicó EMA con factor 0.9999.

Un detalle técnico importante: el checkpoint incluye un buffer `freqs_cis` de RoPE con forma (2817, 32, 2) en lugar de (1025, 32, 2) del código original, porque el fork usa `seq_len=1408`. Este buffer es derivado (no aprendido) y debe descartarse al cargar los pesos para evitar un error de `load_state_dict`. Además, el modelo debe cargarse con `mlp_ratio=1` porque el `FeedForward` SwiGLU ya aplica la regla 2/3·4·dim.

## Capacidades

- Generación de imágenes condicionada por clase: el modelo genera imágenes de 256×256 píxeles de ImageNet-1k a partir de la etiqueta de clase.
- Tokenización adaptativa con árbol de cuaterniones: reduce el número de tokens por imagen (~231) frente a métodos de parche fijo, permitiendo una representación más eficiente.
- Modelado autoregressive causal: genera secuencias de tokens en orden BFS agrupado por nivel de detalle (LOD), lo que permite capturar dependencias multiescala.
- Inferencia con EMA: los pesos EMA proporcionan mejor calidad que los pesos brutos, y son los recomendados para uso en inferencia.
- Entrenamiento en precisión bf16: compatible con hardware moderno y optimizado con flash attention para secuencias de longitud variable.
- Soporte de decodificación con tokenizador externo: requiere el tokenizador VQ QuadTok (no incluido en el repositorio) para convertir los tokens generados en imágenes reales.

## Casos de uso

- **Investigación en modelos generativos de imagen**: el modelo sirve como referencia para estudiar la eficiencia de la tokenización adaptativa con árboles de cuaterniones frente a métodos de parche fijo, permitiendo comparar el coste computacional y la calidad de representación.
- **Experimentos de compresión de tokens**: al reducir el número de tokens por imagen, es útil para evaluar el impacto en la latencia de inferencia y el uso de memoria en modelos autoregressive de imagen.
- **Generación condicionada por clase**: se puede usar para generar muestras de clases específicas de ImageNet, aunque sin métricas FID no se puede validar la calidad visual.
- **Estudio de pérdida y perplejidad**: los datos de entrenamiento (curva de pérdida de 6.2358 nats y perplejidad 513) sirven como referencia para comparar la capacidad de modelado de otros sistemas de tokenización.
- **Desarrollo de pipelines de decodificación**: el modelo puede integrarse con el tokenizador QuadTok para construir un pipeline completo de generación, útil para experimentar con el orden de tokens y la reconstrucción.
- **Benchmark de hardware**: el checkpoint de 2,9 GB en bf16 puede usarse para medir el rendimiento de inferencia en distintas GPUs, dado su tamaño relativamente pequeño (775M de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el FID no ha sido calculado para estos pesos, y la única evidencia de calidad es la curva de pérdida durante el entrenamiento. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 2.9 GB por archivo, pero la inferencia requiere memoria adicional para las activaciones. Con 775M de parámetros en bf16, se estima un mínimo de ~2 GB de VRAM solo para pesos, pero se recomienda al menos 8 GB para inferencia con batch pequeño.
- GPUs recomendadas: entrenamiento en 8× H200 (44.0 GB pico por GPU); para inferencia, una GPU consumer como RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 24 GB de VRAM, incluso en tarjetas de 8-12 GB si se aplica cuantización o se reduce el batch.
- Opciones de despliegue: no hay integración específica con vLLM, llama.cpp u Ollama documentada. Al ser un modelo de imagen autoregressive, se espera usar el código de inferencia del repositorio original (no incluido) o adaptar el checkpoint a frameworks de inferencia personalizados. Se puede usar con el tokenizador QuadTok VQ para decodificar.
- Latencia y throughput: no disponibles. No se han publicado datos de rendimiento en inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de generación de imagen autoregressive (como LlamaGen, VAR o MaskGIT), ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **FID no calculado**: no hay métricas de calidad de imagen (FID, IS) en los datos disponibles; la pérdida de 6.2358 es la única evidencia de rendimiento, lo que impide evaluar la calidad visual real.
- **Dependencia del tokenizador externo**: el modelo no puede decodificar imágenes sin el tokenizador VQ QuadTok, que no está incluido en el repositorio.
- **Compatibilidad del checkpoint**: al cargar los pesos, hay que eliminar `freqs_cis` del state_dict y usar `mlp_ratio=1`; de lo contrario, se produce un error de carga o un comportamiento incorrecto.
- **Riesgo de alucinación**: como modelo autoregressive de imagen, puede generar imágenes que no corresponden a la clase condicionada o con artefactos, especialmente fuera de las clases de ImageNet.
- **Sesgos y diversidad**: entrenado solo en ImageNet-1k, tiene un sesgo hacia las categorías de ese dataset y no cubre dominios fuera de él.
- **Licencia restrictiva**: la licencia es "other", no especificada, lo que puede limitar el uso comercial o la redistribución. Se recomienda contactar con el autor para aclarar términos.
- **Sin soporte de lenguaje**: no es un modelo de texto, por lo que no soporta herramientas de function calling ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuchengm/quadtok-gen-700m-2level
- Página personal del autor: https://myc634.github.io/yuchengmao/
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/yuchengm/quadtok_data (no verificado en la búsqueda)
