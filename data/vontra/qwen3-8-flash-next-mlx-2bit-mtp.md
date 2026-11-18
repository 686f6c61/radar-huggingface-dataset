# Vontra/Qwen3.8-Flash-Next-MLX-2bit-MTP

## Resumen

Qwen3.8-Flash-Next-MLX-2bit-MTP es una conversión cuantizada a 2 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Vontra (con la marca TensorFold) para su ejecución sobre Apple Silicon mediante MLX. El modelo original es un transformer disperso de tipo mixture-of-experts (MoE) con capacidades de visión y lenguaje, desarrollado por el equipo Qwen, que combina Gated DeltaNet, Qwen Sparse Attention, flujos residuales con compuertas ensanchadas, embeddings de bigramas y trigramas con hashing, y un bloque nativo de predicción del siguiente token (MTP) para decodificación especulativa.

La conversión no es una cuantización uniforme a Q2: los expertos enrutados y compartidos, junto con las rutas de embedding predictivo de n-gramas, se almacenan en 2 bits afín con tamaño de grupo 32, mientras que atención, Gated DeltaNet, hiperconexión, enrutamiento, visión, embedding de tokens, cabeza de salida y el bloque MTP nativo se mantienen en BF16. El resultado es un repositorio de 80,1 GB con 2.543 tensores indexados y 20 shards, pensado para ejecutarse en hardware de Apple con la librería MLX.

Su relevancia actual radica en que permite ejecutar un modelo de 180.000 millones de parámetros totales con 262.144 tokens de contexto en equipos Apple Silicon de gama alta, algo inviable con el checkpoint original en BF16. La validación se realizó con oMLX 0.6.3rc3 build 2475, MLX 0.32.0 y MLX-VLM 0.6.3, y el autor recomienda mantener el MTP nativo desactivado por defecto porque en sus mediciones resultó ligeramente más lento que la línea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE con Gated DeltaNet, Qwen Sparse Attention y MTP nativo |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | 6B (modelo de lenguaje: 125B totales / 6B activos) |
| Longitud de contexto | 262.144 tokens (extensible upstream a 1.000.000) |
| Tipos de cuantizacion | Afín 2 bits con tamaño de grupo 32 en 418 módulos de expertos y embeddings predictivos; BF16 en 762 matrices sensibles o estructurales |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | MLX safetensors (20 shards, 80,070 GB / 74,571 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer disperso de tipo MoE para visión y lenguaje. Según los datos de la model card, el modelo de lenguaje tiene 125.000 millones de parámetros totales con 6.000 millones activos, tamaño oculto de 2.560, 48 capas, 512 expertos enrutados de los cuales se activan 10, más 1 experto compartido. Incorpora además un módulo de embedding de n-gramas de 51.000 millones de parámetros con 20.000.000 de entradas, y un bloque MTP nativo de 4.000 millones de parámetros y una capa de borrador para decodificación especulativa. La arquitectura combina Gated DeltaNet, Qwen Sparse Attention, flujos residuales con compuertas ensanchadas e hiperconexiones.

La conversión de Vontra parte del checkpoint oficial en BF16 (revisión `f5d08274bafd880402bd16f5e3e6c514136ec06c`) y cuantiza 418 módulos de expertos y embeddings predictivos a 2 bits afín con grupo 32, preservando 762 entradas matriciales sensibles o estructurales en BF16, incluido el bloque MTP nativo completo. Se verificaron los 2.543 tensores indexados y los 20 shards. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de imagen y vídeo en modo image-text-to-text (pipeline declarado en Hugging Face).
- Razonamiento y generación de código, matemáticas y recall factual, según las pruebas de validación del autor (instruction following, factual recall, arithmetic, concise response y coherent-generation).
- Decodificación especulativa mediante bloque MTP nativo, con tasa de aceptación medida del 52,94% (9 de 17 propuestas aceptadas en la muestra de telemetría).
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: el formato MLX y la cuantización a 2 bits permiten cargar un modelo de 180B parámetros totales en equipos con memoria unificada amplia (el repositorio ocupa 80,1 GB), algo imposible con el checkpoint BF16 original.
- Análisis de documentos largos: con 262.144 tokens de contexto se pueden procesar informes extensos, expedientes o bases de código completas en una sola pasada sin truncamiento.
- Procesamiento de imagen y vídeo combinado con texto: el pipeline image-text-to-text permite describir, resumir o extraer información de contenido visual junto a instrucciones textuales.
- Asistentes conversacionales de contexto largo: la ventana de 262.144 tokens permite mantener historiales de conversación extensos y referencias a material previo sin pérdida de contexto.
- Prototipado e investigación en entornos macOS: la integración con MLX-VLM y oMLX facilita experimentar con decodificación especulativa y arquitecturas MoE dispersas sin infraestructura de GPU dedicada.
- Evaluación de técnicas de cuantización agresiva: la mezcla de 2 bits en expertos y BF16 en rutas sensibles sirve como referencia para estudiar el impacto de la cuantización selectiva en calidad y velocidad.
- Generación de código y tareas de razonamiento en local: las pruebas del autor confirman el paso de las compuertas de aritmética y seguimiento de instrucciones, lo que permite usar el modelo para asistencia de programación en estación de trabajo.

## Benchmarks y rendimiento

La model card solo publica mediciones de throughput en Apple M3 Studio (tres ejecuciones de 512 tokens por modo tras el calentamiento, mediana de velocidad de generación):

| Modo de ejecución | Ejecuciones | Salida por ejecución | Velocidad mediana de generación |
|---|---:|---:|---:|
| MTP nativo desactivado | 3 | 512 tokens | 29,3729 tokens/s |
| MTP nativo activado | 3 | 512 tokens | 28,6199 tokens/s |

El MTP nativo cambió el throughput mediano en un -2,56% en esta prueba, con una tasa de aceptación de borradores del 52,94%. Todas las ejecuciones con MTP activado y desactivado produjeron el mismo hash de salida.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio pesa 80,1 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible para cargar los pesos; el espacio adicional para caché KV y activaciones depende de la longitud de contexto.
- Hardware validado: Apple M3 Studio, con MLX 0.32.0, MLX-VLM 0.6.3 y oMLX 0.6.3rc3 build 2475.
- GPU consumer: al estar en formato MLX, está orientado a Apple Silicon; no se proporcionan datos de ejecución en GPU NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Despliegue: oMLX (añadiendo el directorio descargado al directorio de modelos y refrescando el registro), con soporte explícito de `qwen4_exp` y MTP nativo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 29,3729 tokens/s medianos con MTP desactivado y 28,6199 tokens/s con MTP activado en M3 Studio, para generación de texto de 512 tokens. Los resultados varían con la longitud del prompt, el crecimiento del contexto, el estado de la caché, la versión del runtime, la presión de memoria y las condiciones térmicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vontra/Qwen3.8-Flash-Next-MLX-2bit-MTP | 180B totales / 6B activos | 262.144 tokens | MLX safetensors 2-bit/BF16 | qwen-community-1.0 | Hugging Face, 9.972 descargas |
| Qwen/Qwen3.8-Flash-Next (original) | 180B totales / 6B activos | 262.144 tokens | BF16 (checkpoint oficial) | qwen-community-1.0 | Hugging Face |
| Otras conversiones MLX del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 2 bits en expertos y embeddings predictivos puede degradar la calidad respecto al checkpoint BF16 original; el autor no publica métricas de calidad comparativas, solo compuertas cualitativas superadas.
- El MTP nativo, aunque funcional y con salida idéntica en modo greedy, resultó un 2,56% más lento en las mediciones del autor; se recomienda desactivarlo por defecto en esta versión.
- Requiere un runtime con soporte explícito de `qwen4_exp` y MTP nativo (validado solo con oMLX 0.6.3rc3 build 2475, MLX 0.32.0 y MLX-VLM 0.6.3); otros runtimes pueden no cargar el modelo.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para GPU NVIDIA ni para motores como vLLM o TGI.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar el alcance multilingüe.
- La licencia Qwen Community License 1.0 impone condiciones para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de un despliegue en producción.
- El rendimiento medido corresponde únicamente a generación de texto en M3 Studio; no se han publicado datos para cargas multimodales ni para contextos cercanos al máximo de 262.144 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-2bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Sitio de Qwen: https://qwen.ai/
- MLX-VLM: https://github.com/ml-explore/mlx-vlm
- TensorFold: https://tensorfold.dev
- Licencia Qwen Community License 1.0: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-2bit-MTP/blob/main/LICENSE
