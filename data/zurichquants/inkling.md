# zurichquants/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, que acepta entradas de texto, imagen y audio y genera salidas de texto. Está diseñado para aplicaciones de inteligencia artificial, incluyendo sistemas agénticos y de uso de herramientas, asistentes de código, chatbots y generación aumentada por recuperación (RAG). Se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite investigación, fine-tuning e integración en productos de terceros.

El modelo emplea una arquitectura transformer decoder-only de 66 capas con una espina dorsal de Mixture-of-Experts (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en cada token. La atención es híbrida, combinando capas locales y globales. Las imágenes y el vídeo se codifican mediante un codificador de parches jerárquico, y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades en un espacio oculto compartido. Según la model card, el modelo tiene 975 mil millones de parámetros totales y 41 mil millones activos, aunque los pesos safetensors del repositorio indican 952.377.623.626 parámetros. La longitud de contexto no se especifica en la documentación disponible.

Inkling destaca por su capacidad de razonamiento multimodal con esfuerzo controlable, lo que permite ajustar el equilibrio entre coste y rendimiento según la tarea. Los resultados de evaluación publicados, a un nivel de esfuerzo de 0,99, muestran un rendimiento competitivo en razonamiento y codificación agéntica frente a otros modelos abiertos y cerrados. El modelo está disponible en versiones BF16 y NVFP4, y puede desplegarse localmente con librerías como SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 66 capas con MoE dispersa (6 de 256 expertos activos + 2 compartidos) y atención híbrida local/global |
| Parametros totales | 975B (según model card); 952.377.623.626 según pesos safetensors |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés (principal), con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, NVFP4) |

## Arquitectura y entrenamiento

Inkling es un transformer autoregresivo multimodal con una arquitectura de 66 capas decoder-only. La capa feed-forward emplea una mezcla dispersa de expertos (MoE): cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos que se activan en todos los tokens. La atención combina capas locales y globales, lo que permite capturar dependencias de corto y largo alcance de manera eficiente. Las imágenes y el vídeo se procesan mediante un codificador de parches jerárquico, mientras que el audio se codifica en tokens discretos; todas las modalidades se proyectan en un espacio oculto compartido y se procesan conjuntamente por el decoder.

Los datos de entrenamiento incluyen una amplia variedad de contenidos: texto, imágenes, audio y vídeo, procedentes de fuentes públicas, adquisiciones de terceros o generación sintética. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad o avanzar en objetivos de seguridad. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El modelo admite un "esfuerzo de pensamiento" controlable, lo que permite ajustar el nivel de razonamiento durante la inferencia.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto, imagen y audio, y produce respuestas textuales en inglés y otros idiomas.
- Razonamiento y resolución de problemas: muestra resultados sólidos en tareas de razonamiento complejo, como HLE, AIME 2026 y GPQA Diamond.
- Codificación agéntica: capaz de manejar tareas de programación con uso de herramientas, como se refleja en SWEBench Verified y SWEBench Pro.
- Soporte de tool calling y function calling: diseñado para sistemas agénticos y de uso de herramientas.
- Capacidades multilingües: aunque el inglés es el idioma principal, tiene capacidades generales en otros idiomas.
- Esfuerzo de pensamiento controlable: permite ajustar el nivel de razonamiento para equilibrar coste y rendimiento.
- Procesamiento de audio: acepta audio en formato WAV a 16 kHz, con duración recomendada inferior a 20 minutos.
- Procesamiento de imágenes: acepta imágenes en cualquier formato de píxeles, con dimensiones ideales entre 40px y 4096px por lado.

## Casos de uso

- Asistentes de código en producción: gracias a su capacidad de razonamiento y codificación agéntica, puede integrarse en pipelines de CI/CD para revisión de código, generación de parches y resolución de incidencias, como se refleja en su rendimiento en SWEBench.
- Agentes autónomos multimodales: puede procesar entradas de texto, imagen y audio para tareas como análisis de capturas de pantalla, transcripción de reuniones y ejecución de acciones basadas en instrucciones complejas.
- Chatbots de atención al cliente con contexto visual: al aceptar imágenes, puede ayudar a diagnosticar problemas técnicos a partir de fotos o diagramas enviados por los usuarios, combinando visión y lenguaje.
- Sistemas de recuperación aumentada por generación (RAG) multimodal: puede indexar y consultar documentos que contienen texto, imágenes y audio, respondiendo preguntas que requieren integrar información de múltiples modalidades.
- Transcripción y análisis de audio: dado que acepta audio WAV a 16 kHz, puede transcribir reuniones, extraer conclusiones y generar resúmenes, útil en entornos corporativos.
- Investigación y fine-tuning: al ser de pesos abiertos con licencia Apache 2.0, permite a investigadores adaptar el modelo a dominios específicos, como medicina o derecho, mediante fine-tuning con datos propios.

## Benchmarks y rendimiento

Los resultados de evaluación se reportan a un nivel de esfuerzo de 0,99. La comparación se generó el 14 de julio de 2026. Los modelos comparados incluyen tanto pesos abiertos (Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2, DeepSeek V4 Pro) como cerrados (Gemini 3.1 Pro, Claude Fable 5, GPT 5.6 Sol). Se muestran solo los resultados de Inkling y algunos modelos abiertos relevantes.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | DeepSeek V4 Pro |
|---|---|---|---|---|
| HLE (text only) | 29,7% | 26,6% | 29,4% | 35,9% |
| HLE (with tools) | 46,0% | 37,4% | 50,2% | 48,2% |
| AIME 2026 | 97,1% | 94,2% | 95,8% | 96,7% |
| GPQA Diamond | 87,2% | 86,7% | 87,9% | 88,8% |
| SWEBench Verified | 77,6% | 70,7% | 76,8% | 80,6% |
| SWEBench Pro (Public) | 54,3% | 46,4% | 50,7% | 55,4% |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de aproximadamente 1,9 TB, lo que sugiere que el modelo en BF16 requiere alrededor de 1,9 TB de VRAM para cargar todos los parámetros. Esto implica que no cabe en una sola GPU de consumo; se necesitan múltiples GPUs de alta gama o un clúster.
- Con cuantización NVFP4, el requisito de VRAM se reduce aproximadamente a la mitad (unos 950 GB), pero sigue siendo inviable para hardware de consumo.
- No se han publicado requisitos oficiales de VRAM ni recomendaciones de GPU específicas. Para inferencia distribuida, se necesitarían al menos 8 GPUs H100 de 80 GB (640 GB) o más, dependiendo de la precisión y la longitud de contexto.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers. También hay un playground en línea y acceso a API a través de proveedores de inferencia de terceros.
- La latencia y el throughput no se han especificado en la documentación disponible.

## Comparativa con modelos similares

Inkling se posiciona entre los modelos abiertos de gran escala, compitiendo con alternativas como Nemotron 3 Ultra, Kimi K2.5 y DeepSeek V4 Pro. La siguiente tabla resume las características principales según la información disponible.

| Modelo | Parámetros totales | Parámetros activos | Licencia | Contexto |
|---|---|---|---|---|
| Inkling | 975B | 41B | Apache 2.0 | no disponible |
| Nemotron 3 Ultra | no disponible | no disponible | open weights | no disponible |
| Kimi K2.5 | no disponible | no disponible | open weights | no disponible |
| DeepSeek V4 Pro | no disponible | no disponible | open weights | no disponible |

En los benchmarks de razonamiento y codificación, Inkling muestra un rendimiento competitivo, aunque por debajo de algunos modelos cerrados como Claude Fable 5 o GPT 5.6 Sol. Entre los modelos abiertos, supera a Nemotron 3 Ultra en la mayoría de las métricas, pero queda ligeramente por detrás de Kimi K2.5 en HLE con herramientas y de DeepSeek V4 Pro en SWEBench Verified.

## Limitaciones y advertencias

- No se ha especificado la longitud de contexto máxima, lo que dificulta planificar su uso en aplicaciones que requieran ventanas de contexto largas.
- El modelo es extremadamente grande (975B parámetros), lo que limita su despliegue a entornos con infraestructura de GPU masiva; no es viable en hardware de consumo.
- No se han documentado sesgos específicos, pero al entrenarse con datos públicos de internet, es probable que herede sesgos presentes en esos datos.
- Existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no cubierta en el entrenamiento.
- Aunque la licencia es Apache 2.0, Thinking Machines Lab publica una política de uso aceptable (Acceptable Use Policy) que los usuarios deben revisar antes de implementar el modelo en producción.
- La documentación no detalla el proceso de entrenamiento (número de tokens, técnicas de alineación como RLHF o DPO), lo que limita la evaluación de su robustez y seguridad.

## Enlaces

- Repositorio en Hugging Face (zurichquants/Inkling): https://huggingface.co/zurichquants/Inkling
- Repositorio original BF16 (thinkingmachines/Inkling): https://huggingface.co/thinkingmachines/Inkling
- Repositorio NVFP4 (thinkingmachines/Inkling-NVFP4): https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Página de Inkling en Thinking Machines Lab: https://thinkingmachines.ai/inkling/
- Anuncio de Inkling (blog): https://thinkingmachines.ai/news/introducing-inkling/
- Artículo en Krater: https://krater.ai/models/inkling
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
