# YuCollection/Inkling-NVFP4

## Resumen
Inkling es un modelo multimodal autoregresivo de tipo transformer decoder-only con backbone Mixture-of-Experts (MoE) disperso, desarrollado por Thinking Machines. Acepta entradas de texto, imagen y audio, y genera texto en UTF-8, lo que lo posiciona como un modelo generalista para aplicaciones conversacionales, agentes, asistentes de código y sistemas RAG. La version aqui descrita, `YuCollection/Inkling-NVFP4`, es una cuantizacion a 8 bits en formato NVFP4 del modelo base `thinkingmachines/Inkling`, publicada por el usuario YuCollection.

El modelo base cuenta con 975.000 millones de parametros totales y 41.000 millones activos por token, con una arquitectura de 66 capas y atencion hibrida local/global. La cuantizacion NVFP4 reduce el peso del repositorio a 592 GB y declara 552.845.034.562 parametros en los tensores safetensors, lo que facilita su despliegue en infraestructura con GPUs de ultima generacion. La licencia es Apache 2.0, lo que permite uso comercial y modificacion.

La relevancia actual de esta ficha radica en que combina capacidades multimodales nativas (texto, imagen y audio) con un regimen MoE de alta eficiencia y una cuantizacion agresiva que reduce los requisitos de memoria frente al BF16 original. No obstante, la informacion publica sobre esta variante concreta es muy limitada: no hay benchmarks propios de la version NVFP4 ni datos de idiomas declarados en la ficha de Hugging Face.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso (66 capas, atencion hibrida local/global) |
| Parametros totales | 975B (modelo base); 552.845.034.562 declarados en safetensors de esta variante |
| Parametros activos | 41B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (8-bit) en esta variante; BF16 en el modelo base |
| Idiomas soportados | Ingles con capacidades multilingues generales (segun model card del base); no disponible en la ficha de esta variante |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base es un transformer decoder-only de 66 capas con un backbone feed-forward de tipo Mixture-of-Experts disperso: cada token se enruta a 6 de 256 expertos, mas 2 expertos compartidos activos en todos los tokens. La atencion combina capas locales y globales (atencion hibrida). Es nativamente multimodal: las imagenes y el video se codifican mediante un encoder jerarquico de parches, y el audio mediante codificacion discreta de tokens; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. El modelo base declara 975B parametros totales y 41B activos, con soporte numerico BF16 y NVFP4.

Los datos de entrenamiento incluyen texto, imagenes, audio y video, procedentes de fuentes publicas, terceros y generacion o aumentacion sintetica. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La variante NVFP4 es una cuantizacion del modelo base y no aporta cambios arquitectonicos.

## Capacidades
- Generacion de texto conversacional e instruccional en ingles y otros idiomas.
- Razonamiento avanzado, incluyendo tareas de matemáticas y ciencia (ver benchmarks).
- Codigo y tareas agenticas de ingenieria de software (SWEBench Verified y Pro).
- Vision: entrada de imagenes en cualquier formato de pixeles, con dimensiones recomendadas entre 40 px y 4096 px.
- Audio: entrada en WAV a 16 kHz, idealmente con duracion inferior a 20 minutos.
- Video: el encoder jerarquico de parches procesa video segun la model card del base.
- Soporte de tool calling y uso de herramientas (los benchmarks reportan resultados "with tools").
- Capacidades multilingues generales, aunque el ingles es el idioma principal.
- Modo de razonamiento configurable mediante el parametro `effort` (los resultados se reportan a `effort=0.99`).
- Integracion con agentes y razonamiento multi-paso.

## Casos de uso
- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con entradas de texto, imagenes y audio, lo que permite adjuntar capturas de pantalla o mensajes de voz en un mismo hilo. Es adecuado por su naturaleza nativa multimodal y su orientacion conversacional.
- Asistentes de codigo en produccion: con resultados de 77,6% en SWEBench Verified y 54,3% en SWEBench Pro, puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests y resolucion de issues con tool calling.
- Agentes autonomos con uso de herramientas: el modelo alcanza 46,0% en HLE con herramientas, lo que lo hace util para flujos multi-paso que requieren busqueda, calculo o ejecucion de codigo.
- RAG multimodal: puede indexar y consultar documentos que combinan texto, imagenes y audio, proyectando todas las modalidades a un espacio compartido para recuperacion y respuesta.
- Analisis de audio y transcripcion asistida: acepta WAV a 16 kHz de hasta 20 minutos, util para resumen de reuniones, analisis de llamadas o moderacion de contenido hablado.
- Razonamiento cientifico y matematico: con 97,1% en AIME 2026 y 87,2% en GPQA Diamond, es adecuado para tutoria, verificacion de demostraciones y asistencia en investigacion.
- Procesamiento de video para monitorizacion o descripcion: el encoder de parches permite describir o etiquetar contenido visual en flujos de video.
- Despliegue en infraestructura con GPUs de ultima generacion: la cuantizacion NVFP4 reduce el peso a 592 GB, lo que permite servir el modelo en nodos multi-GPU con vLLM, SGLang o TokenSpeed.

## Benchmarks y rendimiento
Resultados reportados por el autor del modelo base a `effort=0.99`, con comparaciones generadas el 14 de julio de 2026. No se han publicado resultados especificos para la variante NVFP4.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29,7% | 26,6% | 29,4% | 35,9% | 40,1% | 35,9% | 44,7% | 53,3% | 47,2% |
| HLE (with tools) | 46,0% | 37,4% | 50,2% | 54,0% | 54,7% | 48,2% | 51,4% | 64,5% | 55,0% |
| AIME 2026 | 97,1% | 94,2% | 95,8% | 96,4% | 99,2% | 96,7% | 98,3% | – | 99,9% |
| GPQA Diamond | 87,2% | 86,7% | 87,9% | 91,1% | 89,5% | 88,8% | 94,1% | 92,6% | 94,1% |
| SWEBench Verified | 77,6% | 70,7% | 76,8% | 80,2% | – | 80,6% | 80,6% | 95,0% | – |
| SWEBench Pro (Public) | 54,3% | 46,4% | 50,7% | 58,6% | 62,1% | – | – | – | – |

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio NVFP4 ocupa 592 GB, por lo que se requiere un nodo multi-GPU con al menos 600 GB de memoria agregada para cargar los pesos en 8 bits.
- GPU recomendadas: H100 (80 GB) en configuraciones de 8 GPUs o superior; A100 (80 GB) en configuraciones equivalentes; GPUs con soporte nativo de NVFP4 para aprovechar la cuantizacion.
- GPU de consumo: no cabe en ninguna GPU consumer individual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Se requiere agregacion de memoria multi-GPU o descarga por capas con offloading a CPU/RAM.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Unsloth y transformers. El modelo base esta disponible tambien en BF16 para despliegues que requieran maxima fidelidad.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | HLE (text) | SWEBench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling (base) | 975B totales / 41B activos | no disponible | 29,7% | 77,6% | Apache 2.0 | Pesos abiertos |
| Nemotron 3 Ultra | no disponible | no disponible | 26,6% | 70,7% | no disponible | Pesos abiertos |
| Kimi K2.5 | no disponible | no disponible | 29,4% | 76,8% | no disponible | Pesos abiertos |
| DeepSeek V4 Pro | no disponible | no disponible | 35,9% | 80,6% | no disponible | Pesos abiertos |

## Limitaciones y advertencias
- La ficha de esta variante NVFP4 no declara idiomas soportados ni resultados de benchmarks propios; los datos de rendimiento corresponden al modelo base en BF16.
- La cuantizacion NVFP4 puede introducir degradacion de calidad respecto al BF16 original, especialmente en tareas de razonamiento y codigo; no se han publicado evaluaciones comparativas.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en tareas de razonamiento con herramientas.
- El modelo base esta orientado principalmente al ingles; el rendimiento en castellano y otras lenguas no esta cuantificado.
- La longitud de contexto no esta especificada en la informacion disponible, lo que limita la planificacion de despliegues con documentos largos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 23 de noviembre de 2026; no hay evidencia de validacion comunitaria de esta cuantizacion concreta.
- Aunque la licencia es Apache 2.0, el modelo base remite a una politica de uso aceptable de Thinking Machines que conviene revisar antes de uso comercial.
- El tamano de 592 GB exige infraestructura multi-GPU; no es viable en entornos de una sola GPU consumer.

## Enlaces
- Repositorio de esta variante: https://huggingface.co/YuCollection/Inkling-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling
- Variante NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
