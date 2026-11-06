# timesmith/Qwen3.8-Flash-Next-oQ4e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ4e-mtp es una cuantización mixta de precisión del modelo Qwen3.8-Flash-Next, publicada por el usuario timesmith en Hugging Face. El checkpoint original pertenece a la familia Qwen y, por la nomenclatura y las cifras de parámetros, se trata de un modelo multimodal con arquitectura de mezcla de expertos (MoE) y un cabezal de predicción multi-token (MTP) para decodificación especulativa. El repositorio contiene 180.000 millones de parámetros lógicos distribuidos en pesos cuantizados con la herramienta oQ (oMLX v0.7.3), con un promedio efectivo de 4,724 bits por peso para el checkpoint completo.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 180B en hardware Apple Silicon mediante MLX, algo impensable con los pesos en BF16. La cuantización mixta asigna 4 bits a la mayor parte de la matriz de pesos (69,2 % del total) y 5 bits al embedding N-gram (28,4 %), manteniendo en BF16 solo un 0,29 % de los tensores. El resultado es un repositorio de 106,3 GB que incluye visión y cabezal MTP, lo que habilita inferencia multimodal y decodificación especulativa en un solo paquete.

No obstante, la información pública disponible es muy limitada: no hay model card del modelo base en los resultados de búsqueda, no se declaran idiomas ni licencia, y no se han publicado benchmarks. Esta ficha se limita a los datos verificables del repositorio y de la model card del cuantizador, marcando explícitamente como no disponible todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con cabezal MTP (predicción multi-token); detalles del modelo base no disponibles |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit group 64/32, affine 5-bit group 64/128, affine 6-bit group 64/128, affine 8-bit group 64/128, BF16, I64; promedio 4,724 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen3.8-Flash-Next, no un entrenamiento propio. La model card del cuantizador desglosa la arquitectura en cuatro componentes: language model (125,744B parámetros lógicos, 66,966 GiB), embedding N-gram (51,200B, 29,802 GiB), visión (0,449B, 0,836 GiB) y cabezal MTP (2,607B, 1,381 GiB). La presencia de un embedding N-gram de 51,2B parámetros y un cabezal MTP sugiere una arquitectura híbrida que combina atención con recuperación basada en n-gramas y decodificación especulativa multi-token, aunque no se dispone de documentación técnica del modelo base que confirme los detalles.

La cuantización se realizó con oQ (oMLX v0.7.3), que aplica precisión mixta según la sensibilidad de cada tensor. El embedding N-gram se cuantiza a 4 bits con grupo 32 (5,00 bits/peso efectivos), mientras que la matriz principal del language model usa 4 bits con grupo 64 (4,50 bits/peso). Los tensores más sensibles se mantienen en 5, 6 u 8 bits, y un 0,287 % permanece en BF16. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento: el componente de language model de 125,7B parámetros lógicos soporta generación autoregresiva, aunque no hay evaluación publicada de su calidad.
- Procesamiento de visión: el repositorio incluye un módulo de visión de 0,449B parámetros, lo que indica capacidad multimodal de entrada de imágenes.
- Decodificación especulativa: el cabezal MTP de 2,607B parámetros permite predecir varios tokens por paso, acelerando la inferencia en MLX.
- Recuperación N-gram: el embedding N-gram de 51,2B parámetros lógicos sugiere un mecanismo de memoria o recuperación léxica que podría mejorar la coherencia en dominios específicos.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización a ~4,7 bits/peso permiten cargar un modelo de 180B en un Mac Studio con memoria unificada de 128 GB o superior, algo inviable con pesos BF16 (unos 360 GB).
- Prototipado multimodal en estación de trabajo: el módulo de visión incluido permite experimentar con tareas imagen-texto sin depender de servicios en la nube, siempre que el hardware tenga memoria suficiente.
- Investigación sobre cuantización mixta: el desglose detallado por tipo de tensor y bits/peso sirve como referencia para estudiar el impacto de la precisión mixta en modelos MoE grandes.
- Evaluación de decodificación especulativa: el cabezal MTP permite medir la aceleración obtenida frente a decodificación autoregresiva estándar en MLX.
- Despliegue de demostraciones privadas: al ejecutarse localmente, el modelo evita el envío de datos a terceros, adecuado para pruebas con datos sensibles en entornos controlados.
- Benchmarking de hardware: útil para comparar throughput y latencia de MLX en chips Apple frente a otras pilas de inferencia con modelos de tamaño comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 106,3 GB en disco; para inferencia hay que sumar la caché KV y los buffers de activación, por lo que se recomienda un mínimo de 128 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con memoria unificada grande (M2 Ultra, M3 Ultra o M4 Max con 128 GB o más). No es compatible de forma nativa con CUDA sin conversión previa.
- ¿Cabe en GPU de consumo? No en tarjetas con 24 GB (RTX 4090) ni 48 GB; requiere memoria unificada de gama alta o múltiples GPUs con paralelismo.
- Opciones de despliegue: MLX (librería declarada), oMLX para la cuantización; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-mtp (este) | 180B (cuantizado ~4,7 bits) | no disponible | no disponible | safetensors MLX | Hugging Face (timesmith) |
| Qwen3.8-Flash-Next (original) | 180B (BF16) | no disponible | no disponible | safetensors | Hugging Face (Qwen) |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | 180B (misma cuantización) | no disponible | no disponible | safetensors MLX | Hugging Face (Jundot) |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base Qwen3.8-Flash-Next antes de cualquier despliegue productivo.
- No hay benchmarks publicados: se desconoce la degradación de calidad introducida por la cuantización mixta frente al modelo original en BF16.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de que la cuantización funcione correctamente en todas las configuraciones.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es directamente portable a CUDA sin reconversión.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- El tamaño de 106,3 GB exige hardware con memoria unificada muy alta; en configuraciones menores habrá que recurrir a offloading, con la consiguiente penalización de latencia.
- La fecha de creación del repositorio (2026-11-06) y la nomenclatura del modelo base deben verificarse contra la fuente oficial de Qwen antes de citarlo en producción.

## Enlaces

- Repositorio del cuantizador: https://huggingface.co/timesmith/Qwen3.8-Flash-Next-oQ4e-mtp
- Repositorio alternativo de la misma cuantización: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
