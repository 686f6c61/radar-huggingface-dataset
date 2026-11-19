# xdannys9/Qwen3.8-27B-pi-codemode-adapted

## Resumen

`xdannys9/Qwen3.8-27B-pi-codemode-adapted` es un adaptador LoRA de rango 32 publicado por el usuario xdannys9 sobre el modelo base `Qwen/Qwen3.8-27B`. Su propósito es específico: adaptar el modelo para que opere de forma nativa el "QuickJS Codemode" de Pi, un modo de ejecución en el que el agente escribe scripts JavaScript que encadenan múltiples llamadas a herramientas (`read`, `write`, `edit`, `bash`, `grep`, `find`, `ls`) dentro de un único turno, en lugar de invocar las herramientas de forma individual turno a turno.

El adaptador parte de un warm-start sobre `harness-hub/Qwen3.8-27B-pi-adapted` y se entrena mediante una combinación de SFT con "trajectory folding" (plegado de trayectorias directas en scripts QuickJS multi-llamada) y RL online con `AsyncGRPOTrainer` sobre un mix de tareas de reparación de repositorios (`SWE-smith`) y de creación de paquetes (`Traj2Envs`). El objetivo declarado es reducir el número de turnos y el consumo de tokens por tarea resuelta, aprovechando la composición programática de herramientas.

Es relevante para quienes despliegan agentes de código sobre Pi y quieren exprimir el modo Codemode, ya que el autor reporta mejoras medibles en resolución de bugs multi-fichero (26,7 % frente a 16,7 % del adaptador previo con Codemode desactivado) con un 26 % menos de tokens por resolución. No obstante, el propio autor documenta que en tareas de creación de paquetes desde cero el modo Codemode rinde peor que las herramientas directas, por lo que la utilidad del adaptador está acotada al escenario de reparación sobre repositorios existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=32) sobre transformer Qwen3.8-27B; librería `peft` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.8-27B no detalla recuento en la información proporcionada) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.8-27B |
| Rango LoRA | 32 |
| Tamaño del repo | 4,5 GB |
| Librería / pipeline | peft / text-generation |
| Entorno de ejecución | Pi 1.5.2 (QuickJS Codemode), vLLM |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 sobre `Qwen/Qwen3.8-27B`, un transformer denso de la familia Qwen3.8. El entrenamiento se articula en tres fases documentadas por el autor. Primero, un SFT de calentamiento con "trajectory folding": a partir de `harness-hub/Qwen3.8-27B-pi-adapted`, se pliegan trayectorias contiguas de llamadas directas a herramientas (`grep/find → read` y `read → edit → bash`) en 24 scripts QuickJS verificados por replay (2,04 llamadas por script), y se ejecutan 12 pasos de SFT enmascarado. El autor señala que en un experimento previo con 9B, el RL desde cero llevaba a la política a usar QuickJS como simple wrapper de una sola llamada (0,94 llamadas/script), de ahí la necesidad del warm-up.

Después, RL con `AsyncGRPOTrainer` (TRL) durante 12 pasos sobre una mezcla 3:1 de tareas de reparación de repositorios (`SWE-smith`, decontaminadas) y tareas de construcción (`Traj2Envs`), con presupuestos de turnos ajustados de 4 y 8. La recompensa es puramente el resultado de los tests (fracción fail-to-pass condicionada a cero regresiones pass-to-pass). Durante el RL se sostiene un 23,5 % de scripts multi-llamada, frente al 16,5 % en RL en frío. Además, se incluye un guard de runtime estricto (`extensions/strict-codemode-v2.ts`) que bloquea llamadas directas a herramientas fuera de `codemode`, avisa si un script de inspección olvida devolver la salida y permite un límite opcional `PI_MAX_NESTED_CALLS=1` para aislar el efecto de la composición multi-llamada en inferencia.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base Qwen3.8-27B.
- Ejecución de código en modo QuickJS Codemode: composición de múltiples llamadas a herramientas (`read`, `write`, `edit`, `bash`, `grep`, `find`, `ls`) dentro de un único turno JavaScript.
- Encadenamiento programático de búsqueda, lectura de ficheros, edición y comprobaciones con `pytest` en un solo turno.
- Reparación de bugs en repositorios multi-fichero (escenario SWE-smith).
- Creación de paquetes Python desde cero (escenario Traj2Envs), aunque con rendimiento inferior en modo Codemode según el autor.
- Integración con el harness Pi (versión 1.5.2) y despliegue vía `peft` + `vLLM`.
- Compatibilidad con el guard de runtime estricto para forzar el uso exclusivo de Codemode.
- Tool calling / function calling: sí, a través del harness Pi y las herramientas expuestas por codemode.
- Agentes multi-paso: sí, con presupuestos de turnos configurables (4 y 8 turnos en entrenamiento).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Reparación de bugs en repositorios multi-fichero: el adaptador está entrenado específicamente para encadenar `grep`/`find`, lectura de ficheros, edición y ejecución de `pytest` dentro de un único script QuickJS, lo que reduce turnos y tokens por resolución (96,7k frente a 131,1k del adaptador previo) en tareas del estilo SWE-smith.
- Agentes de código sobre el harness Pi: se integra directamente con Pi 1.5.2 y su Codemode, permitiendo desplegar agentes que operan el sistema de ficheros y la shell mediante scripts JavaScript compuestos.
- Automatización de pipelines de CI/CD con verificación por tests: la recompensa de entrenamiento se basa en resultados fail-to-pass sin regresiones pass-to-pass, por lo que encaja en flujos donde la corrección se valida ejecutando la suite de tests del repositorio.
- Reducción de coste por tarea en agentes de larga duración: al agrupar varias llamadas a herramientas en un solo turno, disminuye el número de round-trips al modelo y el consumo de tokens, útil en despliegos con límites de presupuesto por episodio.
- Exploración y auditoría de código en un solo turno: el guard estricto y el aviso de "olvidó devolver la salida" facilitan scripts de inspección reproducibles (búsqueda más lectura encadenadas) que devuelven resultados estructurados.
- Evaluación comparativa de modos de agente: el adaptador permite medir el efecto de Codemode ON/OFF y del límite `PI_MAX_NESTED_CALLS=1` sobre el mismo modelo base, útil para equipos que calibran harness de agentes.
- Creación de paquetes Python desde cero (con matices): utilizable en Traj2Envs, aunque el autor documenta que las herramientas directas (Codemode OFF) superan al modo QuickJS en este escenario por el overhead de escapado de strings en payloads grandes de `tools.write`.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card.

Reparación de bugs multi-fichero, SWE-smith (n=30):

| Modelo | Codemode | Full solve | Avg score | Avg turns | Tokens / solve |
|---|---|---:|---:|---:|---:|
| Qwen/Qwen3.8-27B (base) | OFF | 23,3 % (7/30) | 0,500 | 6,8 | 139,3k |
| harness-hub/Qwen3.8-27B-pi-adapted | OFF | 16,7 % (5/30) | 0,471 | 4,9 | 131,1k |
| harness-hub/Qwen3.8-27B-pi-adapted | ON (zero-shot QuickJS) | 20,0 % (6/30) | 0,535 | 5,1 | 117,7k |
| Qwen3.8-27B-pi-codemode-adapted (este adaptador) | ON | 26,7 % (8/30) | 0,564 | 5,2 | 96,7k |

Creación de paquetes greenfield, Traj2Envs (n=10):

| Modelo | Codemode | Full solve | Avg score | Avg turns | Tokens / solve |
|---|---|---:|---:|---:|---:|
| Qwen/Qwen3.8-27B (base) | OFF | 20,0 % (2/10) | 0,619 | 6,8 | 265,1k |
| harness-hub/Qwen3.8-27B-pi-adapted | OFF | 60,0 % (6/10) | 0,740 | 6,0 | 83,6k |
| harness-hub/Qwen3.8-27B-pi-adapted | ON (zero-shot QuickJS) | 40,0 % (4/10) | 0,558 | 4,6 | 87,6k |
| Qwen3.8-27B-pi-codemode-adapted (este adaptador) | ON | 40,0 % (4/10) | 0,450 | 5,3 | 95,2k |

Ablaciones de entrenamiento y límite de llamadas (Codemode ON):

| Checkpoint | Qué aísla | SWE-smith solve (n=30) | SWE-smith score | Traj2Envs solve (n=10) | Traj2Envs score |
|---|---|---:|---:|---:|---:|
| v0-cold-rl-from-pi | GRPO online desde pi-adapted sin SFT de trajectory-folding | 26,7 % (8/30) | 0,526 | 20,0 % (2/10) | 0,263 |
| v1-folded-sft | SFT de warm-up con trajectory-folding (24 scripts multi-llamada) antes del RL | 26,7 % (8/30) | 0,540 | 20,0 % (2/10) | 0,320 |
| v2-folded-rl (adaptador raíz) | SFT plegado + GRPO online con escasez de presupuesto de turnos | 26,7 % (8/30) | 0,564 | 40,0 % (4/10) | 0,450 |
| v2-folded-rl (límite 1 llamada) | Mismos pesos con `PI_MAX_NESTED_CALLS=1` | 20,0 % (6/30) | 0,500 | 30,0 % (3/10) | 0,483 |

Terminal-Bench 2.1 (n=12) y SWE-bench Verified (n=12): el autor indica que están en ejecución en una evaluación E2B de 7 brazos y que las tablas se añadirán al completarse; no hay resultados publicados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el adaptador pesa 4,5 GB en safetensors y requiere cargar el modelo base Qwen3.8-27B completo, cuyo footprint no se detalla.
- GPU recomendadas: no disponible; el autor menciona despliegue con vLLM, lo que implica GPUs de datacenter (A100, H100, etc.), pero no se especifican modelos concretos.
- ¿Cabe en GPU consumer? no disponible; depende del modelo base y de la cuantización, no documentada.
- Opciones de despliegue: `peft` + `vLLM` con el harness Pi 1.5.2; el fragmento de quickstart de la model card está truncado y no permite confirmar la clase de transformers exacta ni otros backends (llama.cpp, Ollama, TGI) para el adaptador.
- Latencia y throughput estimados: no disponible; solo se reportan tokens por resolución en benchmarks (96,7k en SWE-smith y 95,2k en Traj2Envs para este adaptador).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | SWE-smith solve (Codemode ON) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-pi-codemode-adapted | LoRA r=32 sobre Qwen3.8-27B | no disponible | no disponible | 26,7 % (8/30) | apache-2.0 | Hugging Face (xdannys9) |
| harness-hub/Qwen3.8-27B-pi-adapted | LoRA sobre Qwen3.8-27B | no disponible | no disponible | 20,0 % (6/30) zero-shot; 16,7 % OFF | no disponible | Hugging Face (harness-hub) |
| Qwen/Qwen3.8-27B (base) | Transformer denso | no disponible | no disponible | 23,3 % OFF (Codemode ON no reportado) | no disponible | Hugging Face (Qwen) |

La comparación se limita a los tres modelos evaluados en la model card; no se dispone de datos de benchmarks de alternativas externas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior en tareas greenfield: en Traj2Envs, el modo Codemode de este adaptador obtiene 40,0 % de resolución frente al 60,0 % del adaptador previo con herramientas directas, atribuido por el autor al overhead de escapado de strings JavaScript en payloads grandes de `tools.write`.
- Dependencia del harness: el adaptador está diseñado para Pi 1.5.2 y su QuickJS Codemode; fuera de ese entorno pierde su ventaja principal y requiere el guard `extensions/strict-codemode-v2.ts` para forzar el comportamiento.
- Sesgos conocidos: no disponible en la información proporcionada; hereda los del modelo base Qwen3.8-27B, no documentados aquí.
- Riesgo de alucinación: no disponible; no se documentan evaluaciones de factualidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles.
- Restricciones de licencia: apache-2.0 para el adaptador; deben verificarse las condiciones del modelo base Qwen3.8-27B antes de uso comercial.
- Benchmarks incompletos: Terminal-Bench 2.1 y SWE-bench Verified están pendientes de publicación; las cifras actuales se basan en muestras pequeñas (n=30 y n=10), con alta variabilidad estadística.
- Estado del repo: 0 descargas y 0 likes en el momento de la consulta; modelo recién publicado (noviembre de 2026), sin validación comunitaria.
- El quickstart de la model card aparece truncado; conviene verificar la clase de transformers y los parámetros exactos de carga antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xdannys9/Qwen3.8-27B-pi-codemode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador de warm-start: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Documentación de Pi Codemode: https://docs.pi.dev/latest/codemode
- Dataset Traj2Envs RL: https://huggingface.co/datasets/harness-hub/traj2envs-rl
- Dataset SWE-smith: https://huggingface.co/datasets/SWE-bench/SWE-smith-py
