# Ttimms/Ornith-1.5-35B-A3B-REAP-50-bf16

## Resumen

Ornith-1.5-35B-A3B-REAP-50-bf16 es un checkpoint intermedio del modelo Ornith-1.5-35B-A3B, desarrollado por Ttimms como parte de un pipeline de poda, cuantizacion y despliegue. El modelo original pertenece a la familia Ornith-1.5 de ornith-ai, un conjunto de modelos MoE de codigo abierto que implementan un bucle de auto-mejora basado en generacion de tareas y andamiajes. Esta version concreta reduce los expertos del modelo base de 256 a 128 mediante REAP (Router-weighted Expert Activation Pruning), con una correccion de renormalizacion del router sobre los expertos supervivientes.

El proposito principal de este checkpoint es servir como fuente para que otros desarrolladores generen sus propias cuantizaciones (AWQ, EXL2, MLX, GGUF personalizados, etc.). Incluye la torre de vision del modelo original, que no ha sido eliminada en esta version, y elimina la cabeza MTP (Multi-Token Prediction). El modelo mantiene la arquitectura hibrida qwen3_5_moe con Gated-DeltaNet, atencion y MoE, y hereda la licencia Apache-2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (hibrida: Gated-DeltaNet + atencion + MoE) |
| Parametros totales | 18.990.568.816 (safetensors); ~17.5B segun el autor |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (checkpoint fuente); NVFP4A16 y GGUF disponibles en releases derivados |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE de 35B parametros con ~3B activos por token, entrenado con un bucle de auto-mejora que genera tareas y andamiajes de forma iterativa. La arquitectura es hibrida, combinando Gated-DeltaNet (una capa recurrente lineal) con atencion y capas MoE, siguiendo el esquema de Qwen3.5-MoE. El checkpoint REAP-50 reduce los expertos de 256 a 128 mediante poda basada en la activacion ponderada del router, con una correccion de renormalizacion sobre los expertos restantes. Ademas, se elimina la cabeza MTP (multi-token prediction) estableciendo `mtp_num_hidden_layers: 0`, verificada con una pasada forward real. El modelo conserva la torre de vision del original, por lo que requiere `Qwen3_5MoeForCausalLM` para uso solo-texto o un paso adicional de eliminacion de vision.

## Capacidades

- Generacion de texto conversacional y de codigo, con soporte para razonamiento multi-paso.
- Capacidades multimodales: el checkpoint conserva la torre de vision del modelo base, permitiendo entrada imagen-texto.
- Soporte de tool calling y function calling, heredado del modelo base Ornith-1.5.
- Capacidad de auto-mejora: el modelo base fue entrenado con un bucle de generacion de tareas y andamiajes, lo que le permite mejorar sus propias respuestas de forma iterativa.
- Soporte de agentes y razonamiento multi-step, con rendimiento destacado en benchmarks de agentes como Terminal-Bench y SWE-Bench.
- El checkpoint fuente permite generar cuantizaciones personalizadas (AWQ, EXL2, MLX, GGUF) gracias a su formato bf16.

## Casos de uso

- Generacion de cuantizaciones personalizadas: el checkpoint bf16 sirve como punto de partida para producir versiones AWQ, EXL2, MLX o GGUF adaptadas a hardware especifico, sin depender de las releases pre-cuantizadas.
- Despliegue en GPU Blackwell con NVFP4: la release NVFP4A16 derivada esta optimizada para vLLM en hardware Blackwell, ofreciendo un equilibrio entre precision y uso de memoria.
- Inferencia en entornos con recursos limitados: la version GGUF permite ejecutar el modelo en CPU o GPU de consumo mediante llama.cpp u Ollama, aprovechando los ~3B parametros activos.
- Asistente de codigo en produccion: con HumanEval+ 84.2% y MBPP+ 89.2% tras cuantizacion NVFP4A16, puede integrarse en pipelines de generacion y revision de codigo.
- Agentes autonomos: el modelo base puntua 79.0 en SWE-Bench Verified, lo que lo hace adecuado para tareas de resolucion de issues en repositorios reales.
- Investigacion en poda de MoE: el checkpoint y el pipeline documentado en GitHub permiten estudiar el impacto de la poda de expertos en modelos hibridos y reproducir el proceso con otros modelos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados tras cuantizacion NVFP4A16 (greedy, instruct):

| Benchmark | Resultado |
|---|---|
| HumanEval+ | 84.2% |
| MBPP+ | 89.2% |

No se han publicado resultados de benchmarks para el checkpoint bf16 sin cuantizar en la informacion disponible. El modelo base Ornith-1.5-35B-A3B reporta, segun el vendor, 68.5 en Terminal-Bench 2.1 y 79.0 en SWE-Bench Verified (promedio de cinco ejecuciones), pero estos datos corresponden al modelo sin podar.

## Requisitos de hardware

- VRAM estimada: el checkpoint bf16 ocupa ~38 GB en disco, por lo que requiere al menos 40 GB de VRAM para inferencia sin cuantizar (una GPU A100 40GB o H100).
- La version NVFP4A16 reduce significativamente el uso de memoria y esta optimizada para GPUs Blackwell (B200, RTX 5090) con soporte vLLM.
- La version GGUF permite ejecucion en GPUs de consumo (RTX 3090, 4090) con cuantizaciones de 4-8 bits, o incluso en CPU con llama.cpp.
- Opciones de despliegue: vLLM (para NVFP4A16), llama.cpp, Ollama (para GGUF), y transformers para el checkpoint bf16.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | ~3B | no disponible | MIT | Modelo original sin podar, con cabeza MTP |
| Ornith-1.5-35B-A3B-REAP-50 (este) | ~17.5B | ~3B | no disponible | Apache-2.0 | Poda 50% de expertos, sin MTP |
| Qwen3-30B-A3B | 30B | 3B | 256K | Apache-2.0 | MoE denso, referencia de la misma familia arquitectonica |

La comparativa directa con otros modelos podados de la misma categoria no esta disponible en la informacion proporcionada. El modelo base Ornith-1.5-35B-A3B es la referencia natural para evaluar el impacto de la poda.

## Limitaciones y advertencias

- El checkpoint conserva la torre de vision, lo que aumenta el tamano del modelo sin necesidad para uso solo-texto; se recomienda usar `Qwen3_5MoeForCausalLM` o el pipeline de eliminacion de vision para reducir peso.
- Los benchmarks reportados (HumanEval+, MBPP+) corresponden a la version cuantizada NVFP4A16, no al checkpoint bf16; el rendimiento sin cuantizar puede variar.
- La poda de expertos puede degradar capacidades en tareas que dependen de expertos especializados, aunque el autor reporta una correccion de renormalizacion del router para mitigarlo.
- El modelo solo soporta ingles como idioma principal; no se garantiza rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el proceso de poda utiliza REAP (github.com/CerebrasResearch/reap), cuyos terminos deben verificarse para redistribucion.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues con ventanas largas.

## Enlaces

- Checkpoint bf16: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-bf16
- Release NVFP4A16: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-NVFP4A16
- Release GGUF: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Pipeline de poda y cuantizacion: https://github.com/t-timms/ornith-nvfp4
- Ficha en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
- Ficha en interfaze.ai: https://interfaze.ai/models/ornith-aiornith-15-35b-a3b
