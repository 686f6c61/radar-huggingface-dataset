# Xylolabs/Raon-1-mini-MLX-4bit

## Resumen

Raon-1-mini-MLX-4bit es una versión cuantizada a 4 bits en formato MLX del modelo KRAFTON/Raon-1-mini, desarrollada por Xylolabs. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 28.779.029.222 parámetros totales, orientado a generación de texto y conversación, y optimizado específicamente para ejecutarse en hardware Apple Silicon mediante el framework MLX. La cuantización permite reducir el peso del modelo a aproximadamente 19,9 GB, lo que lo hace viable en equipos con memoria unificada de 36 GB o superior.

El modelo base, Raon-1-mini, está desarrollado por KRAFTON y soporta los idiomas coreano e inglés. Esta variante mantiene la licencia Apache 2.0 y conserva el código de modelo original de KRAFTON (`raon_mlx_model.py`), incluyéndolo sin modificaciones. La receta de cuantización es mixta: los expertos enrutados se cuantizan a 4 bits (con proyecciones down a 6 bits), mientras que las capas de atención, las capas RDA, los expertos compartidos, la capa densa, el embedding y el LM head se mantienen en 8 bits, y las compuertas del router MoE permanecen en BF16.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para desplegar un modelo MoE de casi 29.000 millones de parámetros en estaciones de trabajo Mac, con una ventana de contexto declarada de 256K tokens y un modo de razonamiento ("thinking") activado por defecto. El modelo está pensado para desarrolladores que trabajan en entornos Apple y necesitan un modelo conversacional multilingüe (coreano/inglés) con capacidad de razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capas de atención, capas RDA y expertos compartidos; código `raon_mlx_model.py` de KRAFTON |
| Parametros totales | 28.779.029.222 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (según tabla de hardware de la model card) |
| Tipos de cuantizacion | 4-bit affine (group size 64) con proyecciones down a 6 bits; capas de atención/RDA, expertos compartidos, capa densa, embedding y LM head en 8-bit; router gates en BF16. Existe también una variante MLX 8-bit (30,6 GB) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base Raon-1-mini emplea una arquitectura Mixture of Experts (MoE) que combina capas de atención con capas RDA (un tipo de capa recurrente/lineal, según la nomenclatura del autor) y expertos compartidos. La variante aquí descrita es una conversión de pesos, no un reentrenamiento: Xylolabs aplica cuantización afín con tamaño de grupo 64 sobre los pesos MXFP8 originales de KRAFTON dequantizados a BF16. Los expertos enrutados se cuantizan a 4 bits con proyecciones down a 6 bits, mientras que los componentes sensibles (atención, RDA, expertos compartidos, capa densa, embedding y LM head) se mantienen en 8 bits, y las compuertas del router MoE permanecen en BF16 para preservar la precisión del enrutamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El modelo incluye un modo de razonamiento ("thinking") activado por defecto, que puede desactivarse mediante el parámetro `enable_thinking: false` en la configuración de la plantilla de chat. La conversión está verificada mediante divergencia KL frente a los pesos MXFP8 de referencia, con resultados documentados en la model card.

## Capacidades

- Generación de texto y conversación multi-turno en coreano e inglés.
- Razonamiento multi-paso mediante modo "thinking" activado por defecto (desactivable).
- Capacidad de respuesta directa sin razonamiento explícito mediante `enable_thinking: false`.
- Soporte de contexto largo de hasta 256K tokens (según tabla de hardware).
- Arquitectura MoE con enrutamiento a expertos, lo que permite activar solo un subconjunto de parámetros por token (el número exacto de parámetros activos no está disponible).
- No se documenta en la información disponible soporte explícito de tool calling, function calling, visión, audio ni agentes.

## Casos de uso

- Asistente conversacional en coreano e inglés: el modelo puede mantener diálogos multi-turno con contexto largo (hasta 256K tokens), adecuado para aplicaciones de atención al cliente donde el historial de conversación es extenso.
- Razonamiento y análisis documental en Mac: con 256K tokens de contexto, puede procesar documentos largos completos (informes, contratos, artículos) y responder preguntas sobre ellos en una sola pasada.
- Desarrollo local en Apple Silicon: al ejecutarse con MLX en equipos con memoria unificada de 36 GB o más, permite prototipar aplicaciones de IA generativa sin depender de GPUs dedicadas ni de la nube.
- Generación de contenido bilingüe coreano-inglés: útil para traducción asistida, redacción de documentación técnica o marketing dirigido a mercados coreano y angloparlante.
- Investigación en eficiencia de cuantización: la model card documenta métricas de divergencia KL y top-1 agreement frente a los pesos de referencia, lo que lo convierte en un caso de estudio para evaluar el impacto de la cuantización 4-bit en modelos MoE.
- Chat interactivo con `mlx_lm.chat`: el comando documentado permite lanzar una interfaz de chat local para pruebas y evaluación cualitativa del modelo en tareas de razonamiento.
- Procesamiento por lotes en pipelines de generación de texto: mediante `mlx_lm.generate`, se puede integrar en scripts de generación automatizada para tareas de resumen, extracción o clasificación textual.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad de cuantización (divergencia KL y top-1 agreement) frente a los pesos MXFP8 de referencia dequantizados a BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K).

| Cuantización | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 30,60 GB | 0,009532 | 95,42% | 0,004958 | 96,55% | 0,003637 | 96,47% |
| MLX 4-bit | 19,90 GB | 0,054306 | 90,46% | 0,016844 | 93,55% | 0,019319 | 92,82% |
| KRAFTON NVFP4 | 17,54 GB | 0,136615 | 84,90% | 0,040017 | 90,41% | 0,050234 | 87,98% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,9 GB para la variante 4-bit; 30,6 GB para la variante 8-bit.
- Hardware objetivo: Apple Silicon con memoria unificada. La model card recomienda Mac Studio M5 Max (32-core GPU, 36 GB) para la variante 4-bit, y Mac Studio M5 Max/Ultra (48 GB a 512 GB) para la variante 8-bit.
- No cabe en GPUs consumer tipo RTX 4090 (24 GB) en la variante 8-bit; la variante 4-bit podría ajustarse en memoria de 24 GB, pero el formato MLX está orientado a Apple Silicon y no a CUDA.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2) con `mlx` 0.32.4 y `transformers` 5.20.1; comandos `mlx_lm.generate` y `mlx_lm.chat` con `--trust-remote-code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/Raon-1-mini-MLX-4bit | 28,78B (MoE) | 256K | Apache 2.0 | MLX safetensors | Cuantización 4-bit para Apple Silicon |
| KRAFTON/Raon-1-mini | 28,78B (MoE) | no disponible | Apache 2.0 | MXFP8 (referencia) | Modelo base original |
| Xylolabs/Raon-1-mini-MLX-8bit | 28,78B (MoE) | 256K | Apache 2.0 | MLX safetensors | Variante 8-bit, 30,6 GB |
| KRAFTON NVFP4 (referencia) | 28,78B (MoE) | no disponible | Apache 2.0 | NVFP4, 17,54 GB | Cuantización de referencia con mayor divergencia KL |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a coreano e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- La cuantización 4-bit introduce una degradación medible: divergencia KL de 0,054306 en WikiText-2 y top-1 agreement del 90,46%, frente al 95,42% de la variante 8-bit. Para tareas sensibles a la precisión, se recomienda la variante 8-bit.
- El modelo está diseñado para MLX y Apple Silicon; no es directamente desplegable en CUDA, vLLM, TGI o llama.cpp sin conversión adicional.
- Requiere `--trust-remote-code` para ejecutarse, ya que incluye código de modelo personalizado de KRAFTON.
- El modo "thinking" está activado por defecto, lo que incrementa el consumo de tokens y la latencia; debe desactivarse explícitamente para respuestas directas.
- Aunque la licencia es Apache 2.0 (permite uso comercial), se debe conservar el archivo NOTICE con las atribuciones a KRAFTON.
- No se documentan sesgos específicos conocidos en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Raon-1-mini-MLX-4bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Variante MLX de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de la receta de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Raon-1-mini-MLX-4bit/blob/main/LICENSE
