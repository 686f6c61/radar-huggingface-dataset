# tbhrc/qwen3_5_0_8b_optiq_4bit

## Resumen

El modelo `tbhrc/qwen3_5_0_8b_optiq_4bit` es una cuantizacion mixta de precision del modelo base `Qwen/Qwen3.5-0.8B` en formato MLX, optimizada para Apple Silicon mediante la herramienta `mlx-optiq`. El autor, `tbhrc`, aplica una tecnica de cuantizacion sensible a la sensibilidad de cada capa: asigna 8 bits a las 56 capas mas sensibles y 4 bits a las 130 capas restantes, con un grupo de cuantizacion de 64. El resultado es un modelo de 175 millones de parametros que ocupa aproximadamente 0,6 GB en disco, con un rendimiento que, segun el autor, supera al de una cuantizacion uniforme de 4 bits al mismo tamano.

La relevancia de este modelo radica en su capacidad para ejecutar inferencia local eficiente en dispositivos Apple Silicon, manteniendo una calidad de texto razonable para su tamano. La cuantizacion mixta basada en sensibilidad permite preservar la calidad en las capas criticas para tareas de razonamiento, codigo y llamadas a herramientas, sin aumentar significativamente el tamano en disco. El modelo base, Qwen3.5-0.8B, incorpora una arquitectura unificada de vision y lenguaje, aunque esta cuantizacion especifica se enfoca en generacion de texto.

La licencia Apache 2.0 heredada del modelo base permite uso comercial sin restricciones, lo que facilita su integracion en aplicaciones de produccion. El modelo se distribuye en formato `safetensors` con la libreria MLX, y es compatible con `mlx-lm` y el ecosistema `mlx-optiq` para inferencia, fine-tuning y despliegue de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B, con fusion vision-lenguaje en el base) |
| Parametros totales | 175.326.016 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 4-bit/8-bit (56 capas a 8-bit, 130 capas a 4-bit, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer con una arquitectura unificada de vision-lenguaje, segun la documentacion del ecosistema Qwen3.5. Sin embargo, esta cuantizacion especifica se publica como un modelo de generacion de texto (`pipeline_tag: text-generation`) y no se confirma si las capacidades multimodales del base se mantienen tras la cuantizacion.

La cuantizacion se realizo con `mlx-optiq`, que aplica un analisis de sensibilidad por capa basado en divergencia KL. Se utilizo un mix de calibracion con 32 muestras por dominio en cinco areas: prosa, razonamiento, codigo, agentes y llamadas a herramientas. Las capas con mayor sensibilidad se asignaron a 8 bits y las mas robustas a 4 bits, con un group size de 64. El proceso de cuantizacion no incluye entrenamiento adicional ni RLHF; es un post-proceso de conversion que preserva los pesos originales del base model en bf16 como referencia de sensibilidad.

La innovacion principal es la asignacion de anchos de bit por capa en lugar de una cuantizacion uniforme, lo que permite conservar la calidad en tareas criticas sin incrementar significativamente el tamano en disco (dentro del 5 % de una cuantizacion uniforme de 4 bits).

## Capacidades

- Generacion de texto con razonamiento basico, soportada por el modelo base de 0.8B parametros.
- Soporte de tool calling y function calling, evidenciado por el benchmark BFCL-V3 (43,0 % de exito en llamadas simples).
- Capacidades de agentes: el ecosistema `mlx-optiq` permite ejecutar agentes con ejecucion de Python en sandbox, aunque no se especifica si esta cuantizacion mantiene ese soporte completo.
- Razonamiento multi-paso: los resultados en GSM8K (37,3 % con 3-shot CoT) sugieren capacidad de razonamiento aritmetico basico.
- Multilingue: no se han publicado datos especificos de idiomas soportados en la cuantizacion; el modelo base de Qwen suele soportar multiples idiomas, pero no se confirma aqui.
- Capacidades de vision: no confirmadas en esta cuantizacion; la card solo menciona texto.

## Casos de uso

- Despliegue en dispositivos Apple Silicon: el modelo esta optimizado para ejecutarse en chips M4 y posteriores, con un tamano de 0,6 GB que cabe en memoria unificada de equipos base (8 GB). Se puede usar con `mlx-lm` para generar texto localmente sin conexion.
- Asistentes conversacionales ligeros: con una ventana de contexto de 1024 tokens en el benchmark de oMLX, puede mantener conversaciones cortas de atencion al cliente o preguntas frecuentes en aplicaciones de escritorio.
- Generacion de codigo asistida en entornos de desarrollo: con HumanEval al 27,4 % pass@1, puede sugerir fragmentos de codigo simples en editores locales, sin depender de servicios en la nube.
- Agentes de automatizacion con tool calling: la capacidad de invocar funciones (BFCL-V3 43,0 %) permite integrarlo en pipelines de automatizacion en entornos donde se requiere privacidad de datos.
- Fine-tuning con LoRA: el formato MLX y la compatibilidad con `mlx-optiq` permiten ajustar el modelo con datos propios mediante LoRA, manteniendo la cuantizacion mixta.
- Prototipado rapido de aplicaciones de lenguaje: por su tamano reducido, es adecuado para pruebas de concepto en aplicaciones de texto que requieran una inferencia rapida en hardware modesto.

## Benchmarks y rendimiento

La card del modelo publica los siguientes resultados, evaluados con el framework de `mlx-optiq`:

| Metrica | Resultado |
|---|---|
| MMLU (5-shot, 1000 muestras) | 54,5 % |
| GSM8K (1000 muestras, 3-shot CoT) | 37,3 % |
| IFEval (conjunto completo, estricto) | 45,8 % |
| IFEval (conjunto completo, laxo) | 45,8 % |
| BFCL-V3 simple (200 llamadas de un solo turno) | 43,0 % |
| HumanEval (164 problemas, pass@1) | 27,4 % |
| Capability Score (media de los cinco benchmarks) | 41,6 |
| KL vs uniform-4-bit (media / p95) | 0,0965 / 0,3445 |
| Tamano en disco | 0,6 GB |

Ademas, el benchmark de oMLX en un M4 (8 nucleos) muestra un throughput de 113,4 tokens/s en generacion y 1.853 tokens/s en prefill, con una latencia TTFT de 553 ms y un pico de memoria de 1,6 GB.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 0,6 GB en disco; en inferencia con MLX, el pico de memoria es de aproximadamente 1,6 GB en un M4 de 8 nucleos, por lo que cabe en equipos con 8 GB de RAM unificada.
- GPUs recomendadas: cualquier chip Apple Silicon con al menos 8 GB de RAM (M1, M2, M3, M4). No es compatible con GPUs NVIDIA o AMD de forma nativa, ya que usa el framework MLX.
- Opciones de despliegue: se puede usar con `mlx-lm` para inferencia simple, o con `mlx-optiq` para servidor compatible con OpenAI y Anthropic, con cache de contexto mixta y adaptadores hot-swap.
- Latencia: en el benchmark de oMLX, la generacion de 1.000 tokens tarda aproximadamente 8,8 segundos (113,4 tokens/s) en un M4 de 8 nucleos, con un TTFT de 553 ms.
- Throughput: prefill a 1.853 tokens/s, generacion a 113,4 tokens/s en contexto de 1.024 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| `tbhrc/qwen3_5_0_8b_optiq_4bit` | 175M | 4-bit/8-bit mixto | no disponible | 54,5 % | 27,4 % | Apache 2.0 |
| `Qwen/Qwen3.5-0.8B` (bf16) | 175M | bf16 | no disponible | no disponible | no disponible | Apache 2.0 |
| `Qwen2.5-0.5B` (ejemplo de tamano similar) | 500M | bf16 | 32k | ~42 % | ~18 % | Apache 2.0 |

No hay datos publicados de benchmarks del modelo base en bf16 en la informacion disponible, por lo que no se puede calcular la perdida por cuantizacion. La comparativa con otros modelos de tamano similar (Qwen2.5-0.5B, Llama-3.2-1B) se incluye como referencia, pero sus resultados no estan verificados en la documentacion de este modelo. La cuantizacion mixta reporta una perdida de calidad respecto a la referencia bf16 de aproximadamente 0,0965 de divergencia KL media, lo que indica que la degradacion es moderada.

## Limitaciones y advertencias

- La cuantizacion mixta introduce perdida de precision, especialmente en tareas de razonamiento complejo o generacion de codigo extenso; los benchmarks muestran resultados modestos en GSM8K (37,3 %) y HumanEval (27,4 %).
- No se confirma el soporte de vision en esta cuantizacion, a pesar de que el modelo base Qwen3.5-0.8B tiene arquitectura multimodal; la card de la cuantizacion se limita a texto.
- El contexto maximo no esta especificado en la documentacion; el benchmark de oMLX uso un contexto de 1.024 tokens, lo que sugiere que no se ha validado con ventanas largas.
- El modelo esta optimizado exclusivamente para Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato.
- La latencia de 553 ms de TTFT puede ser notable en aplicaciones interactivas de tiempo real, aunque aceptable para tareas de generacion por lotes.
- No se han publicado resultados de evaluacion multilingue; el rendimiento en idiomas distintos del ingles no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tbhrc/qwen3_5_0_8b_optiq_4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Proyecto mlx-optiq: https://mlx-optiq.com/
- Guia de la familia Qwen3.5: https://mlx-optiq.com/docs/qwen3.5
- Paquete PyPI: https://pypi.org/project/mlx-optiq/
- Mix de calibracion: https://mlx-optiq.com/blog/calibration-mix
- Framework de evaluacion: https://mlx-optiq.com/blog/eval-framework
- Benchmark en oMLX: https://omlx.ai/benchmarks/performance/ksyc12rn
- Version de Qualcomm del base model: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_0_8b/README.md
