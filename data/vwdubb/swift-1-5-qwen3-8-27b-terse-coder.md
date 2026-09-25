# vwdubb/Swift-1.5-Qwen3.8-27b-Terse-Coder

## Resumen

Swift-1.5-Qwen3.8-27b-Terse-Coder es un checkpoint fusionado publicado por el usuario vwdubb que combina los pesos del modelo ukisai/Swift-1.5-Qwen3.8-27b con el adaptador LoRA Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, rango 16, entrenado con DPO). El resultado es un unico artefacto de 27.781.427.952 parametros (55,6 GB en safetensors) que no requiere infraestructura LoRA en tiempo de ejecucion. La propuesta de valor es doble: heredar la eficiencia de razonamiento de Swift 1.5, que segun su autor consume un 58,5 % menos de tokens de pensamiento que Qwen3.8-27B con una puntuacion un 0,35 % superior en GPQA-Diamond, y anadir una capa de concision especifica para trazas de codigo.

Tecnicamente es un transformer denso de atencion hibrida: 48 de sus 64 capas usan atencion lineal y las 16 restantes atencion completa, con una torre de vision y una cabeza MTP (multi-token prediction) integrada que permite decodificacion especulativa. El contexto nativo es de 262.144 tokens, extensible a 1.000.000. El proceso de fusion se realizo en fp32 con `W + B @ A * (lora_alpha / r)` (alpha 32, r 16, escala 2,0) y se almaceno en bf16 aplicando redondeo estocastico no sesgado con semilla fija, porque los deltas del adaptador (‖Δ‖/‖W‖ ≈ 4e-4–1e-3) caen por debajo de la resolucion de bf16 y un redondeo convencional solo preservaria entre el 31 % y el 61 % de la informacion del delta, frente al 94–99,9 % en fp16.

Es relevante ahora porque ejemplifica una practica emergente: publicar merges listos para servir que empaquetan ajustes de comportamiento (concision, estilo de razonamiento) sin obligar al operador a gestionar adaptadores. Ahora bien, el propio autor advierte que **no se ha ejecutado ningun benchmark independiente sobre este artefacto** y que la combinacion Swift + Terse-Coder no fue medida por el autor del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (lineal en 48 de 64 capas, completa en 16), torre de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.000.000 |
| Tipos de cuantizacion | bf16 (pesos publicados); el adaptador original fue evaluado tambien en fp16 y NVFP4; existe un artefacto FP8 separado del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (gratuita para personas y organizaciones con ingresos anuales brutos de hasta 1.000.000 USD; por encima, requiere Swift Enterprise License de UkisAI) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B, un transformer denso de 27B parametros con atencion hibrida: 48 de las 64 capas emplean atencion lineal y 16 usan atencion completa, lo que reduce el coste cuadratico en secuencias largas. Incorpora una torre de vision (el model card usa `AutoModelForImageTextToText`, lo que confirma soporte de imagen) y una cabeza MTP integrada que habilita decodificacion especulativa. Ambas, cabeza MTP y pesos de vision, quedan intactas en este merge: el adaptador no las modifica.

Swift 1.5 es un fine-tune de Qwen3.8-27B construido por UkisAI mediante RL escalado y post-entrenamiento OPD, e incluye un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI. Sobre esa base se aplico el adaptador Terse-Coder (ronda 8, rango 16, DPO), orientado a recortar la verbosidad de las trazas de razonamiento en tareas de codigo. La fusion se hizo en fp32 y se almaceno en bf16 con redondeo estocastico de semilla fija (0), de modo que el merge es reproducible bit a bit. El chat template incluido es `Shockem/froggeric-terse-coder`; el autor advierte explicitamente que servirlo sin esa plantilla altera el comportamiento agentico.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo de pensamiento, modulable mediante `reasoning_effort`.
- Generacion y edicion de codigo, con foco declarado en trazas concisas.
- Tool calling y function calling: el ejemplo de vLLM usa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder`.
- Comportamiento agentico multi-paso, con parser de razonamiento `qwen3` y plantilla de chat especifica.
- Entrada multimodal de imagen (la clase de carga es `AutoModelForImageTextToText`; el model card base menciona soporte de texto, imagen y video).
- Decodificacion especulativa opcional mediante la cabeza MTP incluida: `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en IDE o CI/CD: el modelo puede generar parches y explicaciones breves, y su orientacion a trazas concisas reduce el coste de tokens de salida en pipelines que facturan por token. Requiere `reasoning_effort` ajustado para tareas que exijan derivacion larga.
- Agentes de refactorizacion automatizada: combinando tool calling (`qwen3_coder`) con el contexto de 262K tokens, puede cargar varios ficheros de un repositorio en una sola ventana y proponer cambios coordinados.
- Analisis de documentacion tecnica con imagenes: al conservar la torre de vision, admite diagramas de arquitectura, capturas de errores o esquemas de circuito junto al texto de soporte.
- Revision de pull requests a gran escala: la ventana extensible a 1M tokens permite procesar diffs muy largos o historicos de commits completos en una unica pasada.
- Servicio de atencion al cliente tecnico: conversaciones multi-turno con historial largo, apoyadas en tool calling para consultar sistemas internos.
- Despliegue con decodificacion especulativa en vLLM: la cabeza MTP intacta permite acelerar la generacion en produccion sin cambiar el checkpoint.
- Evaluacion comparativa de tecnicas de eficiencia de razonamiento: sirve como referencia de "dos fine-tunes apilados mas un LoRA de comportamiento", util para investigar la degradacion acumulada de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre este artefacto concreto en la informacion disponible. Los unicos datos numericos disponibles corresponden al modelo base y al adaptador por separado:

| Medicion | Contexto | Valor |
|---|---|---|
| Reduccion de tokens de pensamiento | Swift 1.5 frente a Qwen3.8-27B stock | 58,5 % menos |
| GPQA-Diamond | Swift 1.5 frente a Qwen3.8-27B stock | +0,35 % |
| Aceleracion global | Swift 1.5 (segun Featherless AI) | 1,95x |
| Supervivencia del delta del adaptador | bf16 con redondeo convencional | 31–61 % |
| Supervivencia del delta del adaptador | fp16 | 94–99,9 % |
| Taxa de capacidad tras merge | Adaptador sobre base Qwen stock, held-out-40, fp32-merge → fp16 → NVFP4 | 70 % → 60–62 % |
| Aplicacion doble del LoRA | Adaptador sobre si mismo, `no_code` | 63 % de acierto |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 55,6 GB solo de pesos, mas cache KV. Con contexto completo de 262.144 tokens el consumo adicional de KV es considerable.
- GPU recomendadas para bf16 sin cuantizar: una A100 80 GB o H100 80 GB basta para pesos y contexto moderado; para tensor parallel en varias GPU, el ejemplo de vLLM usa `--tensor-parallel-size 1`, lo que implica que el autor asume una unica GPU de 80 GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en bf16. No se publican pesos GGUF ni cuantizaciones de 4 bits en este repositorio; el mismo autor mantiene `vwdubb/Swift-Qwen3.8-27b-FP8` como artefacto FP8 separado, aunque corresponde a la generacion anterior y no incluye el adaptador Terse-Coder.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText` con `torch_dtype=torch.bfloat16` y `device_map="auto"`) y vLLM. No hay soporte documentado para llama.cpp, Ollama, TGI ni GGUF en la informacion proporcionada.
- Latencia y throughput: no disponibles. El unico dato indirecto es la aceleracion de 1,95x reportada para Swift 1.5 frente a su base, y la posibilidad de activar decodificacion especulativa MTP con 3 tokens especulativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-Terse-Coder | 27,78B | 262K (1M extensible) | Swift Open License v1.0 | Merge objeto de esta ficha; sin benchmarks independientes |
| ukisai/Swift-1.5-Qwen3.8-27b | ~27B | 262K (1M extensible) | Swift Open License v1.0 | Base directa; mismo perfil de eficiencia sin la capa de concision para codigo |
| Qwen/Qwen3.8-27B | ~27B | 262K (1M extensible) | Apache 2.0 | Modelo original de Alibaba Cloud; licencia mas permisiva y sin restriccion de facturacion |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA | adaptador | no aplica | Apache 2.0 | No es un modelo autonomo; el autor recomienda desplegarlo como LoRA en runtime en lugar de fusionarlo |

No se dispone de comparativas de rendimiento publicadas entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha ejecutado ningun benchmark independiente sobre este artefacto. Los numeros de eficiencia citados provienen del modelo base, no del merge.
- La combinacion Swift 1.5 + Terse-Coder no fue medida por el autor del adaptador, cuya tabla de resultados recomendados no incluye ninguna base Swift. El efecto de la capa de concision sobre Swift 1.5 es de magnitud desconocida.
- El autor del adaptador documenta una "taxa de capacidad" (70 % → 60–62 % en su held-out-40) al fusionar en lugar de servir como LoRA en runtime. Este merge evita la requantizacion y almacena bf16 directo, por lo que la perdida deberia ser menor, pero no nula.
- **No cargar el LoRA Terse-Coder sobre este modelo**: la doble aplicacion acorta en exceso el razonamiento (63 % de acierto con fallos de tipo `no_code` en las pruebas del adaptador).
- Servir el modelo sin el chat template `Shockem/froggeric-terse-coder` altera el comportamiento agentico, segun el autor.
- Es un ajuste de comportamiento, no de conocimiento: las tareas que requieran derivacion larga necesitan elevar `reasoning_effort`; de lo contrario la concision forzada puede degradar la precision.
- Es el artefacto mas apilado de la serie (dos fine-tunes mas un LoRA): si aparecen comportamientos anomalos, el diagnostico recomendado es volver a Swift 1.5 limpio con el LoRA en runtime.
- Restriccion de licencia: uso comercial gratuito solo por debajo de 1.000.000 USD de ingresos anuales brutos; por encima se necesita una licencia enterprise de UkisAI. Nada en la Swift Open License limita los derechos sobre Qwen3.8-27B bajo Apache 2.0.
- Riesgo de alucinacion, sesgos conocidos y limitaciones idiomáticas: no documentados en la informacion disponible.
- El repositorio no incluye cuantizaciones GGUF ni de 4 bits, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Swift-1.5-Qwen3.8-27b-Terse-Coder
- Modelo base Swift 1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Adaptador Terse-Coder: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Anuncio de Swift en UkisAI: https://ukisai.com/news/introducing-swift
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha de despliegue de Swift 1.5 en Featherless AI: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
- Artefacto FP8 relacionado del mismo autor: https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-FP8
- Listado de adaptadores sobre Swift 1.5: https://huggingface.co/models?other=base_model:adapter:ukisai/Swift-1.5-Qwen3.8-27b
