# thinkingmachines/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por thinkingmachines, una empresa especializada en inteligencia artificial open source. Acepta entradas de texto, imagen y audio, y genera salidas de texto, lo que lo convierte en una herramienta versátil para aplicaciones de conversación, agentes, generación de código y sistemas de recuperación aumentada. Se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite investigación, fine-tuning e integración en productos de terceros.

El modelo emplea una arquitectura decoder-only transformer con una capa feed-forward de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en cada token. Con 975 mil millones de parámetros totales y 41 mil millones activos, ofrece un equilibrio entre capacidad y eficiencia computacional. La atención combina capas locales y globales, y el modelo es nativamente multimodal, procesando imágenes, video y audio mediante codificadores específicos proyectados a un espacio oculto compartido.

Inkling se posiciona como una alternativa competitiva frente a modelos cerrados y abiertos de gran escala, con resultados destacados en razonamiento, matemáticas y tareas de codificación agéntica. Su disponibilidad en formatos BF16 y NVFP4, junto con soporte para bibliotecas como SGLang, vLLM y Unsloth, facilita su despliegue local y en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con MoE sparse (66 capas, 256 expertos, 6 activos + 2 compartidos) |
| Parametros totales | 975B |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Inkling es un transformer autoregresivo decoder-only de 66 capas con una capa feed-forward de mezcla de expertos (MoE) dispersa. Cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos que están activos en todos los tokens, lo que reduce el coste computacional por token manteniendo una gran capacidad total. La atención es híbrida, combinando capas locales y globales para capturar dependencias de corto y largo alcance. El modelo es nativamente multimodal: las imágenes y el video se codifican mediante un codificador de parches jerárquico, y el audio mediante codificación de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Los datos de entrenamiento incluyen una amplia variedad de contenidos: texto, imágenes, audio y video, procedentes de fuentes públicas, adquisiciones de terceros o generación sintética. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad o avanzar en objetivos de seguridad. No se mencionan técnicas específicas de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto en inglés y con capacidades multilingües generales, incluyendo instrucciones y conversación.
- Razonamiento avanzado en matemáticas, lógica y problemas científicos, con resultados destacados en benchmarks como AIME 2026 y GPQA Diamond.
- Generación y comprensión de código en múltiples lenguajes, con soporte para tareas de codificación agéntica.
- Entrada multimodal: acepta texto UTF-8, imágenes en cualquier formato de píxeles (dimensiones ideales entre 40px y 4096px) y audio WAV a 16 kHz (idealmente menos de 20 minutos).
- Soporte para tool calling y uso de herramientas, lo que permite integrarse en sistemas agénticos y de recuperación aumentada.
- Capacidad para procesar video mediante el codificador de parches jerárquico, aunque la entrada declarada se limita a imagen y audio.
- Compatible con bibliotecas de inferencia como SGLang, vLLM, TokenSpeed y Unsloth, facilitando el despliegue local y en producción.

## Casos de uso

- Asistentes de conversación multilingües: Inkling puede gestionar diálogos multi-turno con instrucciones complejas, gracias a su capacidad de razonamiento y su soporte multilingüe, adecuado para chatbots de atención al cliente o asistentes virtuales.
- Agentes autónomos con tool calling: su soporte para uso de herramientas permite construir agentes que consultan APIs, ejecutan acciones y razonan sobre los resultados, ideal para automatización de tareas.
- Generación de código en producción: con resultados sólidos en SWEBench Verified, puede integrarse en pipelines de CI/CD para generar, revisar o corregir código, o como asistente de programación en IDE.
- Sistemas de recuperación aumentada (RAG): su capacidad para procesar texto largo y razonar sobre contexto permite construir sistemas de pregunta-respuesta sobre documentos técnicos o bases de conocimiento.
- Análisis de imágenes y documentos: al aceptar entradas de imagen, puede describir, resumir o extraer información de capturas, diagramas o documentos escaneados.
- Transcripción y comprensión de audio: con entrada de audio WAV, puede transcribir o interpretar contenido hablado, útil para asistentes de voz o análisis de reuniones.
- Investigación y fine-tuning: al ser open weights con licencia Apache 2.0, permite a investigadores adaptar el modelo a dominios específicos mediante fine-tuning.

## Benchmarks y rendimiento

Los resultados se reportan a effort=0.99 y se comparan con modelos open weights (Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2, DeepSeek V4 Pro) y closed weights (Gemini 3.1 Pro, Claude Fable 5, GPT 5.6 Sol). La tabla siguiente recoge los datos disponibles en la model card. La fila de SWEBench Pro (Public) está incompleta en la fuente, por lo que se omite el valor de GPT 5.6 Sol.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% | 44.7% | 53.3% | 47.2% |
| HLE (with tools) | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% | 51.4% | 64.5% | 55.0% |
| AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% | 98.3% | – | 99.9% |
| GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% | 94.1% | 92.6% | 94.1% |
| SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | – | 80.6% | 80.6% | 95.0% | – |
| SWEBench Pro (Public) | 54.3% | 46.4% | 50.7% | 58.6% | 62.1% | 55.4% | 54.2% | 80.0% | no disponible |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información disponible. Dado el tamaño del modelo (975B parámetros totales, 41B activos), se requiere hardware de centro de datos con GPUs de alta gama, como A100, H100 o similares, con al menos varias decenas de GB de VRAM para inferencia en BF16. La cuantización NVFP4 reduce el uso de memoria, pero no se especifican cifras concretas. No es viable en GPUs de consumo (por ejemplo, RTX 4090) sin técnicas de offloading o cuantización extrema, aunque no se documenta soporte para ello. Las opciones de despliegue incluyen SGLang, vLLM, TokenSpeed y Unsloth, que permiten optimizar la inferencia en entornos multi-GPU.

## Comparativa con modelos similares

Inkling se compara en la tabla de benchmarks con varios modelos de gran escala, tanto open weights como closed weights. No se dispone de especificaciones detalladas (parámetros, contexto, licencia) de esos modelos en la información proporcionada, por lo que la comparación se limita a los resultados de rendimiento. Entre los modelos open weights, Inkling supera a Nemotron 3 Ultra y Kimi K2.5 en la mayoría de los benchmarks, aunque queda por detrás de Kimi K2.6 y GLM 5.2 en algunos casos. Frente a modelos closed weights como Gemini 3.1 Pro o Claude Fable 5, muestra un rendimiento inferior en tareas de razonamiento puro, pero competitivo en tareas agénticas de codificación.

## Limitaciones y advertencias

- No se han publicado limitaciones específicas en la model card; sin embargo, como modelo entrenado con datos de internet, puede presentar sesgos presentes en esos datos.
- Riesgo de alucinación en tareas de generación de texto, especialmente en contextos de alta incertidumbre o con información no cubierta en el entrenamiento.
- La entrada de audio se limita a WAV a 16 kHz y se recomienda menos de 20 minutos; la entrada de imagen tiene un rango óptimo de dimensiones (40px a 4096px), fuera del cual el rendimiento puede degradarse.
- Aunque se declara capacidad multilingüe general, el modelo está optimizado para inglés; el rendimiento en otros idiomas puede ser inferior.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la política de uso aceptable de thinkingmachines, que puede imponer restricciones adicionales.
- El tamaño del modelo (975B totales) implica costes de inferencia significativos; no se documentan requisitos de hardware oficiales, lo que puede dificultar la planificación de despliegues.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/thinkingmachines/Inkling)
- [Playground de Tinker](https://tinker.thinkingmachines.ai/playground)
- [Tinker Cookbook (GitHub)](https://github.com/thinking-machines-lab/tinker-cookbook)
- [Política de uso aceptable](https://thinkingmachines.ai/model-acceptable-use-policy)
- [Receta de SGLang](https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling)
- [Receta de vLLM](https://recipes.vllm.ai/thinkingmachines/Inkling)
- [Receta de TokenSpeed](https://lightseek.org/tokenspeed/recipes/models#Inkling)
- [Receta de Unsloth](https://unsloth.ai/docs/models/inkling)
- [Blog de HuggingFace sobre Inkling](https://hf.co/blog/thinkingmachines-inkling)
