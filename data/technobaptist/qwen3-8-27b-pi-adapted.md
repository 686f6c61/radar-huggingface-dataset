# TechnoBaptist/Qwen3.8-27B-pi-adapted

## Resumen

TechnoBaptist/Qwen3.8-27B-pi-adapted es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-27B, entrenado mediante aprendizaje por refuerzo (GRPO y async-GRPO con TRL) para actuar como el modelo subyacente del agente de programación pi en tareas de ingeniería de software y terminal. No es un modelo completo, sino un delta de pesos de aproximadamente 0,7 GB que debe cargarse junto al modelo base. El objetivo es convertir un modelo generalista en un agente especializado en flujos de trabajo con llamadas a herramientas, edición de código y ejecución de comandos.

La relevancia del adaptador radica en sus resultados: sobre Terminal-Bench 2.1 eleva la tasa de éxito del 39,5% al 55,8% (+16,3 puntos) y reduce un 62% el número de llamadas a herramientas por tarea; sobre SWE-bench Pro (hard 51) pasa del 29,4% al 62,7% (+33,3 puntos) con un 55% menos de llamadas. Estos datos proceden de una evaluación emparejada bajo el mismo harness pi, con una única tentativa por tarea, temperatura 0,8 y modo de razonamiento desactivado.

El adaptador se distribuye con licencia Apache 2.0 y está pensado para servirse con vLLM (soporte LoRA) o transformers serve, apuntando el agente pi al endpoint OpenAI-compatible resultante. El checkpoint publicado corresponde al paso 160 de entrenamiento, seleccionado por su rendimiento en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer híbrido Qwen3.8-27B (el modelo base emplea atención híbrida con caché Mamba, según la configuración de vLLM) |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen3.8-27B (27B nominales) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 131.072 tokens en la configuración de evaluación (`--max-model-len 131072`) |
| Tipos de cuantizacion | No disponible en la información del adaptador; existe una versión GGUF publicada por harness-hub (Qwen3.8-27B-pi-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); también disponible GGUF para el adaptador equivalente |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango máximo 32 (según `--max-lora-rank 32` en la configuración de vLLM) aplicado sobre Qwen/Qwen3.8-27B. El modelo base es un transformer con atención híbrida que combina mecanismos de atención con caché Mamba, lo que obliga a usar `--mamba-cache-mode align` para habilitar correctamente el prefix caching en vLLM. El adaptador no modifica la arquitectura del modelo base; únicamente añade matrices de bajo rango entrenadas para el comportamiento agéntico.

El entrenamiento se realizó con aprendizaje por refuerzo usando GRPO y async-GRPO a través de la librería TRL, sobre los conjuntos de datos harness-hub/scale800-harbor y harness-hub/termgrade-train-harbor. El modo de razonamiento (thinking) se mantuvo desactivado durante el entrenamiento y la evaluación, y el adaptador no fue entrenado con él. La receta completa se anuncia para su publicación en el blog de harness-hub. El checkpoint final es el paso 160, elegido mediante seguimiento de puntuaciones en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 durante el entrenamiento.

## Capacidades

- Generación de código y edición de ficheros en tareas de ingeniería de software del mundo real (repositorios, tests, corrección de bugs).
- Ejecución de comandos de terminal y lectura de su salida dentro de un bucle agéntico.
- Llamadas a herramientas (tool calling) con parser `qwen3_xml` en vLLM y `--enable-auto-tool-choice`.
- Razonamiento multi-paso con planificación y corrección de errores: el ejemplo de la model card muestra cómo localiza una función, la edita, ejecuta los tests y corrige el último caso fallido en 8 llamadas a herramientas.
- Eficiencia en el uso de herramientas: reduce entre un 48% y un 62% las llamadas por tarea respecto al modelo base en los benchmarks evaluados.
- Compatibilidad con el agente pi (earendil-works/pi) mediante API OpenAI-completions.
- Modo de razonamiento (thinking) disponible en el modelo base, pero no entrenado ni evaluado en este adaptador; se recomienda desactivarlo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Resolución automática de incidencias en repositorios: el adaptador puede recibir un fallo de test o un bug report, localizar la función afectada, aplicar el parche y validar con la suite de tests, como demuestra en la tarea `instance_ansible__ansible-d62496fe416623e88b90139dc7917080cb04ce70` de SWE-bench Pro. Es adecuado porque fue entrenado específicamente para este bucle de edición-verificación.
- Agente de terminal para tareas de administración de sistemas: ejecuta comandos, interpreta la salida y encadena acciones con un 62% menos de llamadas que el modelo base en Terminal-Bench 2.1, lo que reduce coste y latencia en pipelines de automatización.
- Integración en CI/CD para reparación de builds: al servirse con vLLM y prefix caching, puede gestionar sesiones largas de depuración sobre un mismo contexto de repositorio, reutilizando la caché entre turnos del agente.
- Asistente de desarrollo local en estaciones de trabajo: la versión GGUF del adaptador equivalente permite ejecutarlo con llama.cpp o Llama.app en macOS, útil para prototipado sin GPU dedicada.
- Automatización de tareas de refactorización acotadas: con 131.072 tokens de contexto puede cargar ficheros completos y sus tests, aplicar cambios y verificar resultados en una sola sesión.
- Evaluación comparativa de adaptadores agénticos: sirve como referencia reproducible para medir el efecto del RL sobre el comportamiento de un agente, ya que la model card publica resultados emparejados con intervalos de confianza y tests de signos.

## Benchmarks y rendimiento

Evaluación con el harness pi, una tentativa por tarea, temperatura 0,8, thinking desactivado, emparejada contra el modelo base en las mismas tareas. Intervalos al 95%; p-valor de test de signos exacto sobre las tareas cuyo resultado cambió.

| Benchmark | Tareas | Modelo base | Adaptador (paso 160) | Diferencia (puntos) | Nuevas resueltas / perdidas | Llamadas por tarea | Llamadas, tareas resueltas por ambos |
|---|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 86 | 39,5% | 55,8% | +16,3 ± 9,1 | 16 / 2 (p = 0,0013) | -62% | -48% (32) |
| Terminal-Bench 2.1, 68 tareas no usadas para elegir checkpoint | 68 | 39,7% | 55,9% | +16,2 ± 10,6 | 13 / 2 (p = 0,0074) | -64% | -32% (25) |
| SWE-bench Pro (hard 51) | 51 | 29,4% | 62,7% | +33,3 ± 14,2 | 18 / 1 (p = 7,6e-05) | -55% | -59% (14) |

Condiciones: Terminal-Bench 2.1 con 89 tareas totales, 1 hora y 100 pasos de agente por tarea; SWE-bench Pro (hard 51) con las 51 tareas más difíciles, 2 horas y 100 pasos por tarea. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,7 GB; los requisitos reales de VRAM vienen determinados por el modelo base Qwen3.8-27B.
- Para servir el modelo base en bfloat16 se necesita hardware de clase数据中心; no se especifican cifras exactas de VRAM en la información disponible.
- GPU recomendadas: no disponibles de forma explícita. La configuración de evaluación usa vLLM con soporte LoRA y caché Mamba, lo que requiere GPUs con suficiente memoria para un modelo de 27B.
- Despliegue con vLLM: `--enable-lora --max-lora-rank 32 --lora-modules qwen3.8-pi=harness-hub/Qwen3.8-27B-pi --language-model-only --enable-prefix-caching --mamba-cache-mode align --enable-auto-tool-choice --tool-call-parser qwen3_xml --reasoning-parser qwen3 --max-model-len 131072`.
- Despliegue con transformers serve: `transformers serve ./Qwen3.8-27B-pi-merged --dtype bfloat16 --continuous-batching --reasoning off`.
- Despliegue con llama.cpp / Llama.app: disponible a través de la versión GGUF del adaptador (harness-hub/Qwen3.8-27B-pi-GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Terminal-Bench 2.1 / SWE-bench Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TechnoBaptist/Qwen3.8-27B-pi-adapted | 27B (base) + LoRA | 131.072 | 55,8% / 62,7% bajo pi | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3.8-27B (base) | 27B | 131.072 (config. evaluación) | 39,5% / 29,4% bajo pi | No disponible en la información | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-GGUF | 27B (base) + LoRA en GGUF | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de otros adaptadores o modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el modelo base Qwen/Qwen3.8-27B junto con el adaptador.
- Entrenado y evaluado exclusivamente con thinking desactivado; el modo de razonamiento no forma parte del entrenamiento y su comportamiento con él activado no está validado.
- La evaluación se realizó con una única tentativa por tarea; la varianza entre ejecuciones no se reporta más allá de los intervalos de confianza.
- El checkpoint fue seleccionado observando puntuaciones en SWE-bench Pro y en un subconjunto de Terminal-Bench 2.1, lo que introduce un sesgo de selección; la model card mitiga parcialmente este punto reportando resultados en las 68 tareas no usadas para la selección (+16,2 puntos, p = 0,0074).
- Específico para el agente pi y la API OpenAI-completions; no fue entrenado ni evaluado con la Responses API.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible, pero son inherentes a un modelo de lenguaje de 27B ajustado con RL.
- Idiomas soportados no especificados; el rendimiento fuera del inglés no está evaluado.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.8-27B deben verificarse por separado.
- El prefix caching en este modelo híbrido exige `--mamba-cache-mode align`; sin esta opción, cada turno del agente relee todo el historial y el rendimiento se degrada.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/TechnoBaptist/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-GGUF
- Agente pi: https://github.com/earendil-works/pi
- Blog de la receta de entrenamiento: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
- Dataset SWE-bench Pro (hard 51): https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Documentación de transformers serve: https://huggingface.co/docs/transformers/en/serve-cli/serving
