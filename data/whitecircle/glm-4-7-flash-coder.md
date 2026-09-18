# whitecircle/GLM-4.7-Flash-Coder

## Resumen

GLM-4.7-Flash-Coder es un ajuste fino supervisado (SFT) del modelo zai-org/GLM-4.7-Flash, publicado por whitecircle (whitecircle), orientado a tareas de codificacion agentica. El modelo parte de una arquitectura Mixture-of-Experts (etiqueta de transformers `glm4_moe_lite`) con 29.943.396.864 parametros totales, es decir, aproximadamente 30B, y un repositorio de 59,9 GB en safetensors. Su objetivo es mejorar el comportamiento del modelo base dentro de bucles de agente: leer repositorios, ejecutar comandos, editar archivos y verificar el resultado con la suite de tests.

La propuesta de valor no es solo la precision, sino la eficiencia del bucle. Segun la model card, el modelo pasa de 33,15% a 41,65% en SWE-rebench-V2 (500 tareas de Python), una mejora relativa del 26%, con un 14% menos de coste de inferencia por tarea. Lo consigue generando 2,4 veces mas tokens de razonamiento que el modelo base, pero necesitando un 45% menos de turnos, gracias a un uso mucho mas agresivo de llamadas concurrentes a herramientas.

El modelo se entreno con Halo, el framework de post-entrenamiento que whitecircle publica junto al modelo, sobre 7.777 trazas multi-turno generadas por GLM-5.1 como profesor y filtradas por rejection sampling (solo se conservan las trayectorias que pasan los tests). Segun la model card, supera a competidores de 3,5 a 4 veces su tamano, como Qwen3.5-122B-A10B y Devstral-2, y queda por delante de Ling-2.6-Flash por un margen estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en GLM-4.7-Flash; etiqueta de transformers `glm4_moe_lite`; implementacion de atencion `flash_attention_4_hybrid` en entrenamiento |
| Parametros totales | 29.943.396.864 (~30B) |
| Parametros activos | no disponible |
| Longitud de contexto | 75.000 tokens durante el fine-tuning; el contexto maximo nativo del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuido es safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); repositorio de 59,9 GB |
| Modelo base | zai-org/GLM-4.7-Flash |
| Fecha de creacion | 2026-07-02 |
| Ultima actualizacion | 2026-09-12 |
| Descargas / likes | 28.058 / 9 |

## Arquitectura y entrenamiento

Arquitectura transformer con capas Mixture-of-Experts, heredada de GLM-4.7-Flash. El tag `glm4_moe_lite` de HuggingFace confirma la familia, y la configuracion de entrenamiento declara `flash_attention_4_hybrid` junto con kernels de Liger (`fused_linear_cross_entropy`). No se documentan en la informacion disponible el numero de expertos, los parametros activos por token ni detalles del enrutado; el ajuste no aplica balanceo de expertos (`moe_balancing: none`).

El entrenamiento fue un SFT puro sobre el dataset whitecircle/swe-rebench-v2-glm-5.1-pi-agent-successful-traces, derivado de nebius/SWE-rebench-V2 (32k tareas de codificacion agentica sobre issues reales de repositorios publicos). El profesor fue GLM-5.1, ejecutado con 4 rollouts por tarea; solo las trayectorias que pasaron la suite de tests se conservaron, resultando en 7.777 trazas multi-turno validas. Toda la ejecucion agente se realizo dentro de PI, un harness ligero con cuatro herramientas: `bash`, `read`, `edit` y `write`.

La configuracion concreta fue: DP=16 en modo multi-nodo, contexto de 75k, packing activado, batch global de 16, learning rate 1e-5 con scheduler coseno y warm-up lineal de 25 pasos, y 3 horas de entrenamiento sobre 16 GPUs B300. El dataset contiene 177 millones de tokens, de los cuales solo 46 millones portan perdida (las respuestas del asistente); los 131 millones restantes (prompts de sistema y respuestas de herramientas) estan enmascarados. Los tokens de llamada a herramientas representan el 43,3% de los tokens de entrada pero solo el 16,1% de la perdida total, por lo que el autor descompone la perdida en razonamiento y tool calls para monitorizar la convergencia por separado.

El resultado mas destacado es el cambio en los patrones de uso de herramientas: los turnos con dos o mas llamadas `read` en paralelo pasan del 1,6% al 9,7%, los de `bash` en paralelo del 0,6% al 7,2%, y los de `edit` en paralelo crecen aproximadamente 90 veces. Ademas, la model card reporta habilidades emergentes transferidas del profesor: una tasa 10 veces mayor de autocorrecciones en el razonamiento, preguntas autodirigidas del tipo "But wait, could this ever be True?", paso de `timeout` a la herramienta `bash` y uso de `git stash` para verificar si un fallo de tests es preexistente.

## Capacidades

- Generacion de codigo y resolucion de issues reales en repositorios Python, con generacion de parches verificables contra una suite de tests.
- Razonamiento multi-turno extenso: la mediana de tokens de razonamiento por respuesta sube de 63 en el modelo base a 150 en el ajustado.
- Uso de herramientas en bucle agentico con cuatro primitivas: `bash`, `read`, `edit` y `write`.
- Llamadas concurrentes a herramientas: agrupacion de multiples lecturas, comandos de shell y ediciones en un mismo turno, lo que reduce el numero de turnos por tarea de 82,5 a 44.
- Autocorreccion durante el razonamiento con una tasa 10 veces superior a la del modelo base.
- Patrones avanzados de tool calling, como pasar un `timeout` explicito a `bash` o usar `git stash` para aislar cambios propios y comprobar si un fallo es preexistente.
- Capacidades de razonamiento entremezclado (`interleaved_thinking: true` en el entrenamiento), es decir, razonamiento intercalado con llamadas a herramientas.
- Soporte de conversacion multi-turno con plantilla de mensajes de asistente (`<|assistant|>`) y campo `tools` para definiciones de herramientas.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Resolucion automatica de issues en repositorios Python: el modelo recibe el repositorio y el issue, explora el codigo con `read`, aplica cambios con `edit`/`write`, ejecuta tests con `bash` y produce un parche; esta es exactamente la tarea sobre la que se entreno y evaluo (SWE-rebench-V2).
- Agente de CI/CD para reparacion de tests fallidos: integrado en un pipeline, puede reproducir el fallo, aislar si es preexistente mediante `git stash` y proponer un parche antes de que un humano intervenga.
- Asistente de refactorizacion guiada por tests: al agrupar lecturas y ediciones en paralelo, puede recorrer varios archivos por turno y validar cada cambio con la suite de tests, lo que reduce el coste por tarea en un 14% frente al modelo base.
- Migracion de dependencias o APIs en proyectos medianos: el contexto de entrenamiento de 75k tokens permite cargar varios modulos y sus tests en una sola ventana, manteniendo coherencia entre ediciones.
- Auditoria de codigo con verificacion empirica: en lugar de solo senalar problemas, el modelo puede escribir scripts de comprobacion y ejecutarlos, con autocorreccion cuando la hipotesis inicial falla.
- Automatizacion de tareas de mantenimiento en shell: gracias al uso de `bash` con `timeout` y comandos encadenados, es adecuado para tareas de diagnostico, limpieza de artefactos o analisis de logs dentro de un sandbox.
- Generacion de parches para revision humana en equipos con volumen alto de issues: el modelo produce trayectorias completas y auditables (comando, salida, edicion), lo que facilita la revision posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre SWE-rebench-V2, subconjunto de 500 tareas de Python, con todos los modelos ejecutados dentro del harness PI:

| Metrica | GLM-4.7-Flash (base) | GLM-4.7-Flash-Coder | Variacion |
|---|---|---|---|
| Score en SWE-rebench-V2 | 0,3315 (33,15%) | 0,4165 (41,65%) | +26% relativo |
| Coste medio por tarea | 0,0443 USD | 0,0382 USD | -14% |
| Turnos del asistente por tarea (mediana) | 82,5 | 44 | -45% |
| Tokens de razonamiento por respuesta (mediana) | 63 | 150 | x2,4 |
| Longitud de traza (tokens) | 52k | 39k | -25% |
| Turnos con 2+ llamadas `read` en paralelo | 1,6% | 9,7% | x6 |
| Turnos con 2+ llamadas `bash` en paralelo | 0,6% | 7,2% | x12 |
| Turnos con 2+ llamadas `edit` en paralelo | casi inexistente | crecimiento ~90x | ~90x |

Comparaciones cualitativas reportadas por el autor: el modelo supera a Qwen3.5-122B-A10B y Devstral-2, competidores de 3,5 a 4 veces su tamano, y a Ling-2.6-Flash por un margen estrecho. No se publican en la informacion disponible las puntuaciones numericas de esos competidores ni resultados de benchmarks genericos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los 29,94B parametros ocupan aproximadamente 60 GB solo en pesos, mas cache KV; en fp8 alrededor de 30 GB; en cuantizacion de 4 bits alrededor de 16-18 GB. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados para este modelo.
- Entrenamiento: la model card documenta 3 horas sobre 16 GPUs B300 con paralelismo de datos DP=16, contexto de 75k y packing activado. El fine-tuning completo requiere por tanto un cluster multi-nodo.
- GPUs recomendadas para inferencia en precision completa: A100 80 GB, H100 80 GB, B200/B300 o equivalentes con al menos 80 GB por dispositivo.
- GPUs de consumo: una RTX 4090 (24 GB) o RTX 5090 no pueden cargar los pesos en bf16; seria necesario cuantizar a 4 bits y aun asi el margen es ajustado. No hay confirmacion de que existan pesos GGUF publicados.
- Despliegue: el modelo esta etiquetado como `endpoints_compatible` y usa `transformers` con `trust_remote_code: true`, por lo que es desplegable con vLLM o TGI en configuraciones multi-GPU con tensor parallelism. No se documenta soporte de llama.cpp, Ollama o LM Studio en la informacion disponible.
- Latencia y throughput: no disponible. El unico dato de coste es el coste medio por tarea reportado por el autor en su propio harness (0,0382 USD frente a 0,0443 USD del base), que depende del proveedor de inferencia y no es directamente extrapolable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-rebench-V2 | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-4.7-Flash-Coder | 29,9B (MoE) | 75k en entrenamiento | 0,4165 (500 tareas Python) | MIT | Ajuste SFT agentico de GLM-4.7-Flash |
| GLM-4.7-Flash (base) | 29,9B (MoE) | no disponible | 0,3315 | no disponible en esta ficha | Punto de partida del ajuste; mismo coste de inferencia base |
| Qwen3.5-122B-A10B | 122B (MoE) | no disponible | no disponible | no disponible | Segun el autor, superado por este modelo pese a ser 4x mayor |
| Devstral-2 | no disponible | no disponible | no disponible | no disponible | Segun el autor, superado por este modelo pese a ser 3,5-4x mayor |
| Ling-2.6-Flash | no disponible | no disponible | no disponible | no disponible | Segun el autor, superado por un margen estrecho |

Los datos numericos de Qwen3.5-122B-A10B, Devstral-2 y Ling-2.6-Flash no se facilitan en la informacion disponible; la comparativa es cualitativa y proviene de la model card del autor.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sobre tareas de Python extraidas de SWE-rebench-V2: el rendimiento en otros lenguajes, en dominios no relacionados con reparacion de codigo o en problemas que no se validan con tests puede degradarse respecto al modelo base.
- Riesgo de sobreajuste al harness PI: los patrones aprendidos (lecturas y bash en paralelo, `git stash`, `timeout`) estan ligados a un conjunto de cuatro herramientas concretas. En harnesses con herramientas distintas o sin soporte de llamadas concurrentes, la ventaja de eficiencia puede no materializarse.
- Sesgo del profesor: las trazas se generaron con GLM-5.1 y se filtraron por paso de tests, lo que introduce un sesgo hacia los estilos de solucion que ese profesor produce y descarta soluciones validas que no superasen el verificador.
- Mayor consumo de tokens de razonamiento por respuesta (mediana de 150 frente a 63): en escenarios con precios por token de salida, el coste por token sube aunque el coste por tarea baje en el benchmark del autor.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad factual ni de tasa de alucinacion. Como modelo de codigo, puede generar APIs, rutas de archivo o flags inexistentes; la verificacion con tests o ejecucion real sigue siendo necesaria.
- Idiomas soportados: no disponible. No hay evidencia publicada de calidad en castellano ni en otros idiomas distintos del ingles tecnico presente en los repositorios de entrenamiento.
- Longitud de contexto: el fine-tuning se hizo a 75k tokens; no se especifica si el modelo conserva el contexto nativo del base por encima de esa cifra ni como se comporta en ventanas mas largas.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo base zai-org/GLM-4.7-Flash tiene su propia licencia, que conviene revisar antes de un despliegue en produccion.
- Dataset de entrenamiento publicado: al liberarse las trazas del profesor, cualquier reentrenamiento hereda sus sesgos y posibles datos sensibles presentes en los repositorios publicos originales.
- Las afirmaciones de superioridad frente a Qwen3.5-122B-A10B, Devstral-2 y Ling-2.6-Flash provienen unicamente del autor y no van acompanadas de resultados numericos verificables en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whitecircle/GLM-4.7-Flash-Coder
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Dataset de entrenamiento: https://huggingface.co/datasets/whitecircle/swe-rebench-v2-glm-5.1-pi-agent-successful-traces
- Splits de train/test limpios: https://huggingface.co/datasets/whitecircle/swe-rebench-v2-clean-python-tasks
- Dataset original de evaluacion: https://huggingface.co/datasets/nebius/SWE-rebench-V2
- Framework de post-entrenamiento Halo: https://github.com/whitecircle/halo
- Blog de investigacion de whitecircle: https://whitecircle.com/research
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces verificables son los incluidos en la model card.
