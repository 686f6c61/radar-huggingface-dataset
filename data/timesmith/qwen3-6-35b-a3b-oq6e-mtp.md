# timesmith/Qwen3.6-35B-A3B-oQ6e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ6e-mtp es una cuantización mixta de precisión del modelo Qwen3.6-35B-A3B, desarrollado por Alibaba Cloud dentro de la familia Qwen3.6. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 35.951.822.704 parámetros totales, de los cuales aproximadamente 3.000 millones se activan durante la inferencia, lo que permite un equilibrio entre capacidad y eficiencia computacional. La versión aquí descrita ha sido producida por el usuario timesmith mediante la herramienta oQ (oMLX v0.7.3), con un promedio efectivo de 6,702 bits por peso.

El modelo resuelve el problema de desplegar un MoE de gran tamaño en hardware con memoria limitada, especialmente en el ecosistema Apple Silicon, ya que los pesos están en formato MLX y safetensors. El checkpoint incluye componentes diferenciados: el modelo de lenguaje (34.661B parámetros lógicos), un codificador visual (0.447B) y una cabeza MTP (Multi-Token Prediction, 0.845B), lo que sugiere capacidades multimodales y decodificación especulativa.

La relevancia actual radica en que permite ejecutar un modelo de 35B con activación de 3B en entornos locales con cuantización de 6 bits, manteniendo un tamaño de repositorio de 30,1 GB. No obstante, la información pública disponible sobre el modelo base es limitada y no se han publicado resultados de benchmarks ni detalles completos de entrenamiento en las fuentes consultadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer, con cabeza MTP y codificador visual |
| Parametros totales | 35.951.822.704 (35.952B) |
| Parametros activos | aproximadamente 3B (según denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit group 128, affine 6-bit group 64, affine 8-bit group 128, affine 8-bit group 64, BF16; promedio efectivo 6,702 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 30,1 GB (28,050 GiB) |
| Libreria | mlx |
| Componentes | Lenguaje: 34,661B (26,562 GiB); Vision: 0,447B (0,832 GiB); MTP head: 0,845B (0,656 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), identificado en los tags como `qwen3_5_moe`. El modelo base Qwen3.6-35B-A3B emplea 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional en inferencia manteniendo una alta capacidad de representación. El checkpoint cuantizado incluye además un codificador visual de 0,447B parámetros, lo que confirma capacidades multimodales (visión-lenguaje), y una cabeza MTP (Multi-Token Prediction) de 0,845B parámetros, orientada a decodificación especulativa y aceleración de la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación en el modelo base. La cuantización fue realizada con oQ (oMLX v0.7.3), una herramienta de cuantización mixta de precisión que asigna distintos esquemas de bits según la sensibilidad de cada tensor: el 94,052% de los pesos lógicos usa affine 6-bit group 64, el 3,560% usa affine 8-bit group 64, el 1,329% permanece en BF16 y el resto se distribuye entre 6-bit group 128 y 8-bit group 128. Esta distribución busca preservar la calidad en capas críticas mientras reduce el tamaño total.

## Capacidades

- Generación de texto y razonamiento general, gracias a la arquitectura MoE del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imágenes y tareas visión-lenguaje, al incluir un codificador visual de 0,447B parámetros.
- Decodificación especulativa mediante la cabeza MTP (Multi-Token Prediction), que permite predecir varios tokens por paso y acelerar la inferencia.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX y safetensors con cuantización de 6 bits, el modelo puede ejecutarse en equipos Mac con memoria unificada suficiente (a partir de 32 GB), aprovechando la aceleración de MLX para generar texto y procesar imágenes sin depender de la nube.
- Asistente multimodal en escritorio: la presencia del codificador visual permite tareas de descripción de imágenes, respuesta a preguntas sobre capturas de pantalla o extracción de información de documentos escaneados en aplicaciones locales.
- Generación de texto con latencia reducida: la cabeza MTP y la activación de solo 3B parámetros por token permiten un throughput alto en comparación con modelos densos de tamaño similar, adecuado para chatbots interactivos.
- Prototipado de investigación en eficiencia de MoE: el checkpoint permite estudiar el impacto de la cuantización mixta (6/8 bits) en la calidad de un MoE de 35B, comparando con versiones fp16 o de mayor precisión.
- Procesamiento por lotes de documentos con componente visual: clasificación y resumen de imágenes o PDFs en pipelines locales, aprovechando el reducido tamaño del repositorio (30,1 GB) para almacenamiento en disco.
- Evaluación de decodificación especulativa: la inclusión de la cabeza MTP permite medir ganancias de velocidad en entornos MLX y comparar con decodificación autoregresiva estándar.
- Despliegue en dispositivos de borde con memoria limitada: el modelo base se ha documentado en entornos como Jetson AI Lab, y esta cuantización de 6 bits reduce aún más los requisitos de memoria frente a fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 28,050 GiB (30,1 GB) en disco; para inferencia se necesita al menos esa cantidad más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 32 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: en el ecosistema MLX, chips Apple M-series con 32 GB o más (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). Para el modelo base en otros formatos, GPUs como A100 o H100 son adecuadas, pero esta versión MLX está orientada a Apple Silicon.
- ¿Cabe en GPU consumer? En GPUs NVIDIA consumer (RTX 4090 con 24 GB) no cabría en su totalidad en 6 bits sin offloading; en Apple Silicon con 32 GB o más, sí.
- Opciones de despliegue: MLX (librería nativa), mlx-lm para generación de texto; el modelo base Qwen3.6-35B-A3B puede desplegarse con vLLM, llama.cpp u Ollama en otras cuantizaciones, pero esta versión concreta está empaquetada para MLX.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ6e-mtp (este) | 35,952B | ~3B | no disponible | no disponible | safetensors MLX (6,702 bits/peso) |
| Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | no disponible | safetensors (fp16/BF16) |
| tfjack/Qwen3.6-35B-A3B-oQ6e-fp16-mtp | 35,952B | ~3B | no disponible | no disponible | safetensors MLX (fp16) |
| root4k/Qwen3.6-35B-A3B-oQ6e-mtp | 35,952B | ~3B | no disponible | no disponible | safetensors MLX (oQ v0.4.5) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser una cuantización del modelo base, hereda los sesgos de este, pero no se documentan.
- Riesgo de alucinación: no cuantificado en las fuentes; los modelos de lenguaje generativos presentan riesgo inherente de alucinación, y la cuantización a 6 bits puede incrementarlo ligeramente en comparación con fp16.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada en esta ficha; los idiomas soportados no se especifican.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada, por lo que no se puede confirmar el uso comercial. Es imprescindible verificar la licencia del modelo base Qwen3.6-35B-A3B antes de cualquier despliegue en producción.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria. La cuantización mixta puede degradar la calidad en tareas sensibles (matemáticas, código) respecto al modelo en fp16; se recomienda evaluar en el caso de uso concreto.
- Dependencia de MLX: el formato está optimizado para Apple Silicon; no es directamente compatible con vLLM, TGI o llama.cpp sin conversión.
- La cabeza MTP añade complejidad: su uso requiere soporte específico en el runtime de MLX; no todos los pipelines la aprovechan automáticamente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/timesmith/Qwen3.6-35B-A3B-oQ6e-mtp
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante fp16 de referencia: https://huggingface.co/tfjack/Qwen3.6-35B-A3B-oQ6e-fp16-mtp
- Otra cuantización oQ: https://huggingface.co/root4k/Qwen3.6-35B-A3B-oQ6e-mtp
- Ficha en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-6-35b-a3b/
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Variante no censurada (referencia): https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-dequantized-oQ6e-mtp
