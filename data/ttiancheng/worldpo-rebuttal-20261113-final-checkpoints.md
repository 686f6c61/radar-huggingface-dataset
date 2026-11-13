# TTianCheng/worldpo-rebuttal-20261113-final-checkpoints

## Resumen

WorldPO rebuttal: November 2026 final training checkpoints es un repositorio de checkpoints de entrenamiento por refuerzo (RL) publicados por el usuario TTianCheng sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No se trata de un modelo nuevo ni de un artefacto listo para inferencia: son los estados intermedios de cinco experimentos de RL completados sobre ALFWorld, una tarea de agentes embodied con entorno textual, archivados en formato FSDP (Fully Sharded Data Parallel) tras la fase de rebuttal de un articulo cientifico.

El interes del repositorio es metodologico: documenta un barrido de pesos de un world model (WM) de observaciones combinado con GRPO (Group Relative Policy Optimization), con cinco configuraciones que varian el peso lambda del termino de world model (0, 0.03, 0.1 y 0.3) y el world size (1 o 2 GPUs). Los resultados de exito sobre 128 tareas in-distribution de ALFWorld con semilla 0 se incluyen en la model card, lo que permite comparar directamente el efecto del termino auxiliar de modelado del mundo en el rendimiento del agente.

Es relevante ahora porque la reproducibilidad en RL para agentes es un problema abierto: publicar checkpoints FSDP completos (modelo, optimizador, dataloader y estado de reanudacion) con manifiesto y digests SHA256 es una practica poco comun que facilita la auditoria y la reanudacion exacta de experimentos. El modelo base subyacente es Qwen2.5-3B-Instruct, un transformer de 3.000 millones de parametros con contexto de 32.768 tokens, pero este repositorio no contiene pesos convertidos a safetensors ni a GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); checkpoints almacenados en formato FSDP |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene shards FSDP sin conversion) |
| Idiomas soportados | no disponible en este repositorio (el modelo base Qwen2.5 soporta multiples idiomas, pero la model card no lo declara) |
| Licencia | no disponible (la model card indica que se aplican los terminos de Qwen) |
| Formato de pesos | FSDP shards (modelo, optimizador, dataloader y estado de reanudacion); no compatible con `from_pretrained()` directo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.000 millones de parametros con atencion causal estandar, RoPE y capas de normalizacion RMSNorm. Sobre esta base, el entrenamiento documentado en este repositorio aplica GRPO (Group Relative Policy Optimization), un algoritmo de RL sin critico que estima ventajas relativas dentro de grupos de rollouts, combinado opcionalmente con un termino auxiliar de modelado del mundo (WM) sobre observaciones del entorno. El entrenamiento se ejecuta con FSDP en 1 o 2 GPUs y el entorno es ALFWorld, un benchmark de tareas de manipulacion textual con instrucciones en lenguaje natural.

Los cinco experimentos archivados corresponden a un barrido del peso lambda del world model y del world size. La evaluacion se realizo sobre 128 tareas in-distribution de ALFWorld con semilla de entorno 0, y todos los checkpoints corresponden a la actualizacion fija 150, no a seleccion del mejor checkpoint. Los resultados publicados en la model card son: joint (GRPO + WM de observaciones, lambda 0.1, world size 2) con 96/128 exitos; policy (solo GRPO, lambda 0, world size 2) con 108/128; lambda03dual (lambda 0.3, world size 2) con 100/128; lambda003dual (lambda 0.03, world size 2) con 81/128; y lambda003 (lambda 0.03, world size 1, suplemento monoreplica) con 93/128. No se documentan en la model card innovaciones como decodificacion especulativa, atencion lineal ni tecnicas de eficiencia adicionales.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen2.5-3B-Instruct.
- Ejecucion de politicas de agente sobre ALFWorld: el checkpoint entrenado produce acciones textuales condicionadas a la observacion del entorno.
- Razonamiento multi-paso en entornos de manipulacion textual, con hasta 128 tareas evaluadas in-distribution.
- Modelado auxiliar del mundo (world model de observaciones) en las variantes con lambda mayor que cero, integrado en la funcion de perdida durante el entrenamiento.
- Reanudacion exacta de entrenamiento: los checkpoints incluyen estado de optimizador, dataloader y estado extra de resume.
- No se documentan capacidades de tool calling, function calling, vision, audio ni thinking mode en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos de RL para agentes: los checkpoints FSDP con manifiesto y digests SHA256 permiten reanudar exactamente el entrenamiento en la actualizacion 150 y verificar la integridad de los shards antes de lanzar el job.
- Auditoria de resultados de rebuttal: los cinco puntos del barrido de lambda (0, 0.03, 0.1, 0.3) y world size (1, 2) permiten contrastar la curva de exito (81, 93, 96, 100, 108 sobre 128) sin reentrenar desde cero.
- Estudio del efecto del termino de world model: comparar joint (96/128) frente a policy (108/128) aisla la contribucion del modelado de observaciones al rendimiento final del agente.
- Analisis de sensibilidad al world size: el par lambda003dual (world size 2, 81/128) y lambda003 (world size 1, 93/128) permite estudiar la interaccion entre paralelismo y calidad del ajuste.
- Base para experimentos de RL sobre Qwen2.5-3B-Instruct: el estado de optimizador y dataloader archivado sirve como punto de partida para continuar el entrenamiento con otras variantes de GRPO.
- Docencia e investigacion en RL para agentes: los checkpoints permiten inspeccionar la evolucion de la politica en ALFWorld y analizar trayectorias fallidas en las 20-47 tareas no resueltas segun la configuracion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 128 tareas in-distribution de ALFWorld, semilla de entorno 0, actualizacion fija 150:

| Configuracion | Objetivo | Peso WM | World size | Exitos / 128 |
|---|---|---:|---:|---:|
| joint | GRPO + WM de observaciones | 0.1 | 2 | 96 |
| policy | Solo GRPO | 0 | 2 | 108 |
| lambda03dual | GRPO + WM de observaciones | 0.3 | 2 | 100 |
| lambda003dual | GRPO + WM de observaciones | 0.03 | 2 | 81 |
| lambda003 | GRPO + WM de observaciones, suplemento monoreplica | 0.03 | 1 | 93 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; como referencia, el modelo base Qwen2.5-3B-Instruct requiere aproximadamente 6-7 GB en FP16 y 2-3 GB en cuantizacion de 4 bits, pero este repositorio no incluye pesos convertidos.
- GPU recomendadas para reanudar el entrenamiento: el experimento dual-GPU usa world size 2; el suplemento monoreplica usa world size 1. No se especifican modelos de GPU concretos en la model card.
- Compatibilidad con GPU de consumo: no confirmada; el entrenamiento FSDP con estado de optimizador completo excede con facilidad la VRAM de GPUs de consumo, aunque el modelo base de 3B si cabe en GPUs como RTX 4090 en inferencia tras conversion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no son aplicables directamente a estos shards FSDP; es necesario reconstruir el modelo con el framework de entrenamiento correspondiente (referenciado como `ShawFeng99/WorldPO`, commit `7362016bb97c8ef8b6693eec6feb2fc76c83957e`) y exportar a safetensors antes de usar herramientas de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (checkpoints de RL para agentes sobre ALFWorld) ni datos de rendimiento de alternativas. Como referencia del modelo base, Qwen2.5-3B-Instruct es un transformer denso de 3.000 millones de parametros con contexto de 32.768 tokens, pero no se dispone de comparativas con otros checkpoints de RL en este repositorio.

## Limitaciones y advertencias

- Los checkpoints no son carpetas de modelo independientes: no funcionan con `from_pretrained()` y requieren reconstruccion desde los shards FSDP con el framework de entrenamiento original.
- El repositorio figura con 0.0 GB de tamano, lo que sugiere que la subida es incremental y puede estar incompleta; un checkpoint solo es valido cuando todos los ficheros de su manifiesto estan presentes.
- La licencia no esta declarada en el repositorio; la model card indica que se aplican los terminos de licencia y uso del modelo Qwen subyacente, por lo que el uso comercial queda sujeto a dichos terminos.
- Los resultados de rebuttal no sustituyen a los del articulo original, segun la propia model card.
- Todos los checkpoints corresponden a la actualizacion fija 150, no a seleccion del mejor checkpoint, por lo que el rendimiento reportado no representa necesariamente el maximo alcanzable.
- La evaluacion se limita a 128 tareas in-distribution de ALFWorld con semilla 0; no hay datos de generalizacion out-of-distribution ni de otros entornos.
- No se documentan sesgos, tasas de alucinacion ni limitaciones idiomaticas especificas en la informacion disponible.
- La configuracion con world size 1 (lambda003) es un suplemento separado del barrido dual-GPU, por lo que su comparacion directa con las demas requiere cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TTianCheng/worldpo-rebuttal-20261113-final-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Codigo de entrenamiento WorldPO: https://github.com/ShawFeng99/WorldPO (commit `7362016bb97c8ef8b6693eec6feb2fc76c83957e`)
- Procedencia de resultados verificados: https://github.com/ShawFeng99/CoLe-Draft/blob/7fe927c223ce56de95da0873e949be3315a50ffa/rebuttal/evidence/tian_completed_20261113.md
