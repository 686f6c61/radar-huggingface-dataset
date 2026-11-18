# TechnoBaptist/Qwen3.8-27B-opencode-adapted

## Resumen

TechnoBaptist/Qwen3.8-27B-opencode-adapted es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.8-27B, entrenado con aprendizaje por refuerzo (GRPO y async-GRPO mediante TRL) para funcionar como el modelo subyacente del agente de programación OpenCode en tareas de ingeniería de software y de terminal. El adaptador no es un modelo completo: se distribuye como pesos LoRA en safetensors (0,7 GB de repositorio) que deben combinarse con el modelo base para su uso.

El objetivo del adaptador es mejorar la precisión y, sobre todo, la eficiencia en tareas agénticas de SWE-bench Pro y Terminal-Bench 2.1. Según la model card, con el modo de razonamiento (thinking) desactivado alcanza el rendimiento del modelo base con thinking a máximo esfuerzo (`xhigh`), generando entre 6 y 8 veces menos tokens por tarea. En SWE-bench Pro (hard 51) pasa del 35,3 % al 51,0 % y en Terminal-Bench 2.1 del 46,4 % al 52,4 % en la comparación pareada.

Es relevante porque demuestra una receta de adaptación por RL a escala sobre un modelo grande con torre de visión (pipeline image-text-to-text), orientada a reducir el coste por tarea en agentes de código, y porque el autor anuncia la publicación de la receta completa. La licencia es Apache 2.0 y el modelo base es Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; pipeline image-text-to-text con torre de visión (no servida en la evaluación) |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen/Qwen3.8-27B (27B según nomenclatura) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; existe una version GGUF publicada por harness-hub para llama.cpp |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT); GGUF disponible en harness-hub/Qwen3.8-27B-opencode-adapted-GGUF |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3.8-27B, un transformer multimodal (image-text-to-text) del que la model card no detalla la arquitectura interna. El adaptador en sí es un LoRA entrenado con TRL usando GRPO y async-GRPO, es decir, aprendizaje por refuerzo con recompensas verificables sobre entornos de ejecución de tareas (harnesses). Los datasets citados son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments, orientados a tareas de terminal y de ingeniería de software evaluadas con el harness Harbor/OpenEnv.

La innovación principal es la metodología de adaptación a escala: el adaptador se evalúa bajo el mismo harness OpenCode que el modelo base, con un intento por tarea, presupuesto de 100 pasos agénticos, muestreo a temperatura 0,8 y top-p 1,0, y sin servir la torre de visión. El checkpoint publicado es el paso 150, seleccionado por su puntuación en SWE-bench Pro y en un subconjunto de 18 tareas de Terminal-Bench 2.1 monitorizado durante el entrenamiento. El autor anuncia la receta completa en un blogpost de harness-hub.

## Capacidades

- Generación de código y resolución de tareas de ingeniería de software en un agente (OpenCode), incluyendo escritura de esquemas, validadores y tests.
- Ejecución de tareas de terminal y línea de comandos dentro de un bucle agéntico con tool calling.
- Razonamiento multi-paso con planificación y uso de herramientas a lo largo de hasta 100 pasos por tarea.
- Modo thinking del chat template (por defecto en esfuerzo `xhigh`), aunque la model card recomienda mantenerlo desactivado: activarlo aporta mejoras marginales (54,9 % frente a 51,0 % en SWE-bench Pro hard 51; 56,6 % frente a 53,0 % en Terminal-Bench 2.1) a costa de más tokens.
- Eficiencia de tokens: 6–8 veces menos tokens generados por tarea que el modelo base con thinking a máximo esfuerzo, y un cuarto de los turnos en SWE-bench Pro (13 frente a 48) en las tareas que ambos resuelven.
- Capacidades multimodales heredadas del modelo base (image-text-to-text), aunque la torre de visión no se sirve en la evaluación publicada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agente de programación autónomo en CI/CD: integrado como backend de OpenCode, el adaptador puede recibir una tarea de issue o de test fallido y ejecutar un bucle de edición, ejecución de tests y corrección con un presupuesto acotado de pasos; su menor número de turnos y tokens reduce el coste por tarea en pipelines automatizados.
- Resolución de tareas de terminal reproducibles: con Terminal-Bench 2.1 como referencia, encaja en entornos donde el agente debe inspeccionar el sistema de ficheros, ejecutar comandos y verificar resultados, con una mejora de +13,6 puntos en las 66 tareas no usadas para seleccionar el checkpoint.
- Automatización de tareas de mantenimiento de repositorios: generación de esquemas de validación, tests y correcciones de API en proyectos existentes, como el ejemplo de la model card (paquete `internal/cue` con esquema CUE embebido y validador).
- Evaluación y benchmarking interno de agentes: sirve como referencia de adaptación por RL para comparar harnesses y presupuestos de pasos bajo condiciones controladas (mismo harness, mismo muestreo, mismo presupuesto).
- Despliegue en infraestructura con llama.cpp: la versión GGUF publicada permite ejecutar el adaptador fusionado en entornos sin GPU de datacenter, útil para prototipos y pruebas de integración.
- Investigación en RL para agentes: la receta GRPO/async-GRPO sobre entornos de terminal es un punto de partida para reproducir adaptadores de harness en otros modelos base.
- Asistente de desarrollo con contexto de terminal: al mantener el modo thinking desactivado, el adaptador responde con menos tokens y encaja en flujos interactivos donde la latencia y el coste por turno importan.

## Benchmarks y rendimiento

Resultados publicados en la model card, bajo el harness OpenCode, un intento por tarea, presupuesto de 100 pasos, thinking desactivado salvo indicación, solo texto, temperatura 0,8 y top-p 1,0.

| Benchmark | Modelo base | Modelo base, thinking | Adaptador | Adaptador, thinking |
|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 47,1 % | 51,0 % | 54,9 % |
| Terminal-Bench 2.1 | 47,0 % | 55,4 % | 53,0 % | 56,6 % |

Resultados pareados frente al modelo base (thinking desactivado, mismas tareas):

| Benchmark | Tareas | Modelo base | Adaptador (paso 150) | Diferencia (puntos) | Nuevas resueltas / perdidas |
|---|---|---|---|---|---|
| SWE-bench Pro (hard 51) | 51 | 35,3 % | 51,0 % | +15,7 ± 13,9 | 11 / 3 (p = 0,057) |
| Terminal-Bench 2.1 | 84 | 46,4 % | 52,4 % | +6,0 ± 10,7 | 13 / 8 (p = 0,38) |
| Terminal-Bench 2.1, 66 tareas no usadas para elegir checkpoint | 66 | 45,5 % | 59,1 % | +13,6 ± 11,1 | 12 / 3 (p = 0,035) |

Trabajo por tarea resuelta (medianas, adaptador / modelo base, sobre tareas que ambos resuelven): 13 frente a 48 turnos en SWE-bench Pro, con 3,5 veces menos tokens generados; y la mitad de turnos en Terminal-Bench 2.1, con 2,6 veces menos tokens generados. La model card advierte que estos números no son comparables con los de la ficha de Qwen3.8-27B, que usa otros harnesses (Terminus, Claude Code), thinking a máximo esfuerzo y presupuestos mayores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al ser un adaptador LoRA sobre un modelo de 27B, los requisitos son los del modelo base más el adaptador (0,7 GB de repositorio); la VRAM concreta depende de la cuantización del base.
- GPU recomendadas: no disponibles en la información proporcionada. Para un modelo de 27B en precisión completa se requiere hardware de datacenter (A100/H100); no hay datos publicados de latencia ni throughput.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; la existencia de una versión GGUF en harness-hub/Qwen3.8-27B-opencode-adapted-GGUF sugiere que puede ejecutarse con llama.cpp en configuraciones cuantizadas, pero no se especifican requisitos.
- Opciones de despliegue documentadas: vLLM, transformers, llama.cpp y fusión de pesos PEFT (merge). También existe una versión GGUF.
- Latencia y throughput: no disponibles. La model card solo aporta métricas de eficiencia de tokens y turnos por tarea, no tiempos de reloj.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted (este) | 27B base + LoRA | No disponible | 51,0 % (thinking off) | 53,0 % (thinking off) | Apache 2.0 | Hugging Face (adaptador + GGUF) |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | 35,3 % (thinking off) / 47,1 % (thinking) | 47,0 % (thinking off) / 55,4 % (thinking) | No disponible en la información | Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros adaptadores de harness comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo: requiere el modelo base Qwen/Qwen3.8-27B y su fusión o carga conjunta; no puede usarse de forma autónoma.
- Los resultados están medidos bajo el harness OpenCode con condiciones concretas (un intento, 100 pasos, temperatura 0,8, top-p 1,0, solo texto) y no son directamente comparables con los de la ficha del modelo base ni con otros harnesses.
- La significación estadística es limitada: en SWE-bench Pro el p-valor es 0,057 y en Terminal-Bench 2.1 completo 0,38; solo el subconjunto de 66 tareas no usadas para seleccionar el checkpoint alcanza p = 0,035.
- El checkpoint (paso 150) se seleccionó usando puntuaciones en SWE-bench Pro y en un subconjunto de Terminal-Bench 2.1, lo que puede introducir sesgo de selección en esas evaluaciones.
- La torre de visión no se sirve en la evaluación; no hay datos publicados sobre el rendimiento multimodal del adaptador.
- Idiomas soportados no disponibles; no se documentan sesgos conocidos ni tasas de alucinación.
- Licencia Apache 2.0, que permite uso comercial, pero las condiciones del modelo base deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validación externa independiente.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted-GGUF
- Blogpost de la receta (anunciado): https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- OpenCode: https://opencode.ai
- Dataset SWE-bench Pro hard 51: https://huggingface.co/datasets/harness-hub/swebench-pro-v2-hard51-harbor
- Dataset Terminal-Bench 2.1: https://huggingface.co/datasets/harborframework/terminal-bench-2.1
- Dataset harness-hub/scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-hub/harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset harness-hub/termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset ai-and/termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
