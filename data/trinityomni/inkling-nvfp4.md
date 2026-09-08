# trinityomni/Inkling-NVFP4

# Inkling-NVFP4

## Resumen

Inkling-NVFP4 es una versión cuantizada en NVFP4 del modelo multimodal Inkling, desarrollado por Thinking Machines. El modelo original es un transformer autoregresivo de 66 capas con arquitectura sparse Mixture-of-Experts (MoE) de 975B parámetros totales y 41B activos, capaz de procesar texto, imágenes y audio. Esta cuantización reduce la precisión de los pesos a 4 bits, manteniendo la misma arquitectura y capacidades, y se publica bajo licencia Apache 2.0. El repositorio en HuggingFace pertenece al usuario trinityomni, pero el modelo base es thinkingmachines/Inkling. La versión NVFP4 está pensada para despliegue local con librerías como SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers, y ofrece un rendimiento competitivo en tareas de razonamiento, agentes y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 66 capas con sparse MoE (256 expertos, 6 activos por token, 2 compartidos) y atencion hibrida local/global |
| Parametros totales | 975B (model card) / 552.845.034.562 en safetensors |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), BF16 (modelo base) |
| Idiomas soportados | Ingles, con capacidades multilingues generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: la discrepancia entre 975B y 552.8B puede deberse al formato de almacenamiento NVFP4; se indican ambos datos segun las fuentes.

## Arquitectura y entrenamiento

Inkling es un modelo multimodal autoregresivo que acepta texto, imagenes y audio como entrada y genera texto. La arquitectura consta de 66 capas decoder-only con una backbone feed-forward sparse MoE: cada token se enruta a 6 de 256 expertos, mas 2 expertos compartidos activos en todos los tokens. La atencion es hibrida, combinando capas locales y globales. Las imagenes y el video se codifican mediante un codificador jerarquico de parches, y el audio mediante codificacion discreta de tokens; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. El modelo fue entrenado con una amplia variedad de datos publicos, adquiridos de terceros o generados sinteticamente, incluyendo texto, imagenes, audio y video. El proceso de curacion incluye limpieza, deduplicacion y filtrado. La version NVFP4 es una cuantizacion del modelo base que reduce la precision de los pesos a 4 bits.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto UTF-8, imagenes en formato de pixeles (40-4096 px por dimension) y audio WAV a 16 kHz (idealmente menos de 20 minutos).
- Razonamiento avanzado: resultados en HLE (texto y con herramientas), AIME 2026 y GPQA Diamond.
- Capacidades agenticas y de uso de herramientas: soporta tool calling y sistemas agenticos.
- Generacion de codigo: resultados en SWEBench Verified y SWEBench Pro.
- Capacidades multilingues generales, con ingles como idioma principal.
- Despliegue local con SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede gestionar dialogos que combinan texto, imagenes y audio, util para chatbots de atencion al cliente que necesitan interpretar capturas o mensajes de voz.
- Agentes autonomos con tool calling: su arquitectura MoE y su capacidad de razonamiento permiten integrarlo en sistemas agenticos que ejecutan tareas de varios pasos.
- Asistentes de programacion: con resultados en SWEBench, puede usarse en editores o pipelines de CI/CD para revision de codigo y generacion de parches.
- Sistemas de recuperacion aumentada (RAG): al aceptar entradas multimodales, puede procesar documentos con imagenes y diagramas ademas de texto.
- Analisis de contenido audiovisual: puede analizar audio de hasta 20 minutos y generar transcripciones o resumenes combinados con contexto visual.
- Investigacion en modelos abiertos: al estar bajo licencia Apache 2.0, es adecuado para fine-tuning y experimentacion en entornos academicos o de investigacion.

## Benchmarks y rendimiento

Los resultados siguientes corresponden al modelo base Inkling (sin cuantizar), reportados a esfuerzo=0.99. Los valores de la version NVFP4 pueden variar ligeramente debido a la cuantizacion.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% | 44.7% | 53.3% | 47.2% |
| HLE (with tools) | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% | 51.4% | 64.5% | 55.0% |
| AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% | 98.3% | – | 99.9% |
| GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% | 94.1% | 92.6% | 94.1% |
| SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | – | 80.6% | 80.6% | 95.0% | – |
| SWEBench Pro (Public) | 54.3% | 46.4% | 50.7% | 58.6% | 62.1% | – | – | – | – |

Nota: la tabla de benchmarks del model card se corta en SWEBench Pro; no se dispone de mas filas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio es de 592 GB, lo que indica que el modelo requiere una infraestructura de multiples GPUs de alta gama.
- GPU recomendadas: no disponible; por el numero de parametros, se necesitan clusters con GPUs como A100 o H100.
- No cabe en GPUs de consumo (consumer GPU) debido a su enorme tamano.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth, HuggingFace Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El modelo se compara en la tabla de benchmarks con Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2, DeepSeek V4 Pro, Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol. Todos son modelos de pesos abiertos o cerrados de gran escala. Inkling destaca en AIME 2026 y GPQA Diamond, con resultados competitivos frente a modelos cerrados. En SWEBench Verified, supera a Nemotron 3 Ultra y Kimi K2.5, aunque queda por debajo de Claude Fable 5 y DeepSeek V4 Pro.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion proporcionada.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido incorrecto o inventado; se recomienda verificacion en aplicaciones criticas.
- Limitaciones de contexto: la longitud de contexto no esta especificada en la informacion disponible.
- Limitaciones de idioma: el modelo esta optimizado para ingles; las capacidades multilingues son generales y pueden ser menos precisas en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe revisar la politica de uso aceptable de Thinking Machines.
- Caveat para produccion: la version NVFP4 puede tener una ligera perdida de precision respecto al modelo BF16; se recomienda evaluar en el caso de uso concreto.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomni/Inkling-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling
- Version NVFP4 original: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog HuggingFace: https://hf.co/blog/thinkingmachines-inkling
