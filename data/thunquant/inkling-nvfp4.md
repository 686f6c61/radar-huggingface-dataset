# thunquant/Inkling-NVFP4

## Resumen

Inkling es un modelo multimodal de código abierto desarrollado por Thinking Machines Lab, diseñado para procesar entradas de texto, imagen y audio, y generar texto. Se trata de un transformador autoregresivo de 66 capas con una arquitectura de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos que actúan siempre. El modelo tiene 975 000 millones de parámetros en total, con 41 000 millones activos por token, lo que lo sitúa entre los modelos abiertos más grandes y capaces actualmente.

La versión `thunquant/Inkling-NVFP4` es una cuantización de 4 bits (NVFP4) del modelo original, que reduce el checkpoint a aproximadamente 552 GB y facilita su despliegue en infraestructuras de alto rendimiento. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Su relevancia radica en su rendimiento sobresaliente en tareas de razonamiento y agentes, superando a muchos modelos de pesos abiertos en benchmarks como HLE, GPQA y SWEBench, y compitiendo con alternativas propietarias de última generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 66 capas con MoE disperso (256 expertos, 6 activos + 2 compartidos) y atención híbrida local/global |
| Parámetros totales | 975B (modelo completo); 552 845 034 562 en el checkpoint NVFP4 (cuantizado) |
| Parámetros activos | 41B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits), BF16 (original) |
| Idiomas soportados | Inglés y capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo es un decoder-only de 66 capas con un bloque feed-forward de mezcla de expertos dispersa. Cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos que se activan en todos los tokens. La atención combina capas locales y globales, lo que permite captar dependencias de corto y largo alcance. Es nativamente multimodal: las imágenes y vídeos se codifican mediante un codificador jerárquico de parches, mientras que el audio se convierte en tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas, adquisiciones de terceros y datos sintéticos. El proceso de curaduría incluye limpieza, deduplicación y filtrado para mejorar la calidad y la seguridad. No se especifica oficialmente el número total de tokens de entrenamiento; algunas fuentes externas mencionan 45 billones de tokens, pero no está confirmado por Thinking Machines.

## Capacidades

- Generación de texto y razonamiento: resolución de problemas matemáticos, lógicos y científicos.
- Razonamiento multimodal: comprensión de imágenes, vídeo y audio, con salida de texto.
- Tool calling: soporte para invocación de funciones y herramientas en aplicaciones de agentes.
- Agentes y ejecución multi-paso: capaz de planificar y ejecutar tareas complejas, como se observa en SWEBench.
- Multilingüe: aunque está orientado al inglés, presenta capacidades generales en otros idiomas.
- Conversación e instrucciones: adecuado para chatbots y asistentes que siguen instrucciones.

## Casos de uso

- **Asistente de código**: integrado en entornos de desarrollo para autocompletar, revisar y corregir código, gracias a su capacidad de razonamiento y tool calling.
- **Agentes autónomos**: puede gestionar tareas multi-paso en sistemas de automatización, como la resolución de issues en repositorios (SWE-bench).
- **Sistema de recuperación aumentada (RAG)**: su comprensión multimodal y amplio contexto permiten construir sistemas de pregunta-respuesta sobre documentos que combinan texto e imágenes.
- **Análisis de imágenes**: aunque no está especializado, puede interpretar diagramas, gráficos o imágenes en aplicaciones de informes técnicos.
- **Transcripción y traducción de audio**: acepta audio en WAV a 16 kHz, útil para transcripción, resumen o traducción en tiempo real.
- **Atención al cliente**: conversaciones multilingües con contexto largo, adecuado para chatbots que gestionan consultas complejas.

## Benchmarks y rendimiento

Los resultados se reportan a effort=0.99 en la model card del modelo. La tabla muestra la comparativa con otros modelos de pesos abiertos y propietarios:

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% | 44.7% | 53.3% | 47.2% |
| HLE (with tools) | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% | 51.4% | 64.5% | 55.0% |
| AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% | 98.3% | – | 99.9% |
| GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% | 94.1% | 92.6% | 94.1% |
| SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | – | 80.6% | 80.6% | 95.0% | – |
| SWEBench Pro (Public) | 54.3% | 46.4% | 50.7% | 58.6% | 62.1% | ... | ... | ... | ... |

Nota: la tabla original se corta en SWEBench Pro; los datos incompletos se indican con puntos suspensivos.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- El checkpoint NVFP4 ocupa aproximadamente 552 GB, por lo que se necesita al menos 8 GPUs de 80 GB VRAM (por ejemplo, 8× H100/A100 80GB) para cargarlo en memoria.
- No es viable en GPUs de consumo (como RTX 4090) por el tamaño.
- Para inferencia se recomiendan motores como vLLM, SGLang, TokenSpeed o Unsloth, que soportan modelos MoE de este tamaño.
- La latencia y el throughput dependen del hardware y la configuración; no se disponen de estimaciones oficiales.

## Comparativa con modelos similares

La tabla de benchmarks anterior compara directamente con otros modelos de pesos abiertos (Nemotron 3 Ultra, Kimi K2.5, DeepSeek V4 Pro) y propios (Gemini 3.1 Pro, Claude Fable 5, GPT 5.6 Sol). En cuanto a características, Inkling se diferencia por su arquitectura MoE de 975B con 41B activos y su multimodalidad nativa. No se dispone de una tabla comparativa de parámetros y contexto de los otros modelos, por lo que la comparación se basa en rendimiento.

## Limitaciones y advertencias

- No se han publicado datos específicos sobre sesgos o riesgos de alucinación en el modelo.
- El modelo está orientado al inglés; aunque tiene capacidades multilingües, el rendimiento en otros idiomas puede ser inferior.
- La longitud de contexto no está documentada, lo que puede limitar su uso en aplicaciones que requieran ventanas largas.
- El tamaño del modelo (975B) exige infraestructura de alto rendimiento; no es adecuado para entornos con recursos limitados.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la política de uso aceptable de Thinking Machines para evitar aplicaciones no permitidas.

## Enlaces

- [Hugging Face - thunquant/Inkling-NVFP4](https://huggingface.co/thunquant/Inkling-NVFP4)
- [Hugging Face - thinkingmachines/Inkling-NVFP4](https://huggingface.co/thinkingmachines/Inkling-NVFP4)
- [Hugging Face - thinkingmachines/Inkling (BF16)](https://huggingface.co/thinkingmachines/Inkling)
- [Tinker Playground](https://tinker.thinkingmachines.ai/playground)
- [Tinker Cookbook (GitHub)](https://github.com/thinking-machines-lab/tinker-cookbook)
- [Política de uso aceptable](https://thinkingmachines.ai/model-acceptable-use-policy)
- [Blog de Thinking Machines sobre Inkling](https://hf.co/blog/thinkingmachines-inkling)
- [Receta SGLang para Inkling](https://docs.sglang.ai/cookbook/autoregressive/ThinkingMachines/Inkling)
- [Receta vLLM para Inkling](https://recipes.vllm.ai/thinkingmachines/Inkling)
