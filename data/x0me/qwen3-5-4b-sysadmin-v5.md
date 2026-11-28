# x0me/qwen3.5-4b-sysadmin-v5

## Resumen

Qwen3.5-4b-sysadmin-v5 es un ajuste fino del modelo base Qwen/Qwen3.5-4B, publicado por el usuario x0me, especializado en administracion de sistemas Linux mediante un unico tool de tipo `bash`. El modelo ejecuta un comando por paso a traves de esa herramienta y finaliza la tarea con un resumen breve, y fue entrenado explicitamente para resolver tareas sin borrar, sobrescribir ni matar procesos que no se le han pedido. Se distribuye principalmente como un GGUF cuantizado en Q8_0 (4.610.577.152 bytes) y tambien incluye los adaptadores LoRA del entrenamiento (SFT y DPO) en formato safetensors.

El interes del modelo es doble. Por un lado, es un ejemplo de ajuste fino de un modelo pequeno (4.326.350.848 parametros) para una tarea de agente con tool calling muy acotada, con un pipeline de entrenamiento documentado (SFT con LoRA sobre trayectorias verificadas y posterior DPO sobre pares pass/fail). Por otro lado, el autor publica una evaluacion propia sobre un conjunto retenido de 12 tareas de agente en contenedores `ubuntu:24.04` y 8 items de seguridad, midiendo tanto tareas resueltas como comandos destructivos no solicitados.

La propuesta de valor concreta es la reduccion de comandos destructivos no pedidos: segun la model card, el modelo base ejecuta aproximadamente 12,8 comandos `rm`/`kill`/`truncate` no solicitados por ejecucion, mientras que este ajuste baja a unos 1,75, a costa de resolver ligeramente menos tareas (13,5 frente a 14,0 de 15). La licencia es Apache-2.0 y el modelo esta pensado para servirse con llama.cpp con plantillas Jinja activadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16384 tokens en la invocacion de ejemplo (`-c 16384`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF publicado); adaptadores LoRA en safetensors (bf16 en el entrenamiento DPO) |
| Idiomas soportados | solo ingles (segun la model card); Linux only |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) y safetensors (adaptadores `adapters/v3/` y `adapters/v5dpo/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,3 mil millones de parametros. El ajuste se realizo en dos fases. La primera fue un SFT con LoRA (1 epoca, learning rate 5e-5) sobre 1.958 trayectorias verificadas: 1.437 generadas por Qwen3.8-27B (Apache-2.0) actuando como teacher y 521 soluciones propias del modelo base que pasaron la comprobacion. Solo se conservo una trayectoria si la verificacion de la tarea pasaba dentro del contenedor y no se ejecutaba ningun `rm`, `kill` o `truncate` no solicitado. La segunda fase fue un DPO con un LoRA nuevo (r16, alpha 32, 1 epoca, learning rate 5e-6, beta 0.1, bf16) sobre 203 pares pass/fail de intentos del propio modelo base en las mismas instancias de tarea, usando el modelo SFT fusionado como referencia.

El autor declara que ningun dato de entrenamiento proviene de modelos cerrados (OpenAI, Google, Anthropic) por las restricciones de sus terminos de uso, y que los prompts de entrenamiento se comprobaron contra el conjunto retenido para detectar solapamiento (Jaccard maximo 0,19). El entrenamiento y la evaluacion se hicieron con el modo de razonamiento desactivado (`enable_thinking=false`). Para reconstruir el modelo en precision completa hay que fusionar primero `adapters/v3/` sobre el base y despues `adapters/v5dpo/` encima.

## Capacidades

- Generacion de texto conversacional orientada a tareas de administracion de sistemas.
- Ejecucion de comandos Linux a traves de un unico tool `bash`, un comando por paso, con lectura de la salida antes del siguiente paso.
- Razonamiento multi-paso orientado a agentes: planificacion implicita de comandos encadenados hasta completar la tarea y emision de un resumen final.
- Tool calling / function calling restringido a la herramienta `bash`.
- Capacidad de rechazo parcial de peticiones claramente inseguras (18 de 20 en la evaluacion del autor).
- Modo thinking desactivado durante entrenamiento y evaluacion; no se documenta soporte de modo thinking en este ajuste.
- Sin capacidades de vision ni audio documentadas.
- Multilingue: no; solo ingles segun la model card.

## Casos de uso

- Automatizacion de tareas de mantenimiento en servidores Linux: el modelo recibe una instruccion en lenguaje natural y la traduce a una secuencia de comandos `bash` verificando la salida de cada uno, adecuado para tareas acotadas como revisar espacio en disco, listar servicios o inspeccionar logs.
- Asistente de diagnostico en contenedores: puede desplegarse dentro de un contenedor `ubuntu:24.04` para inspeccionar el estado del sistema y proponer o ejecutar comandos de diagnostico, con el limite de 12 comandos por tarea que usa el autor en su evaluacion.
- Generacion de runbooks ejecutables: dado un procedimiento descrito en texto, el modelo produce la secuencia de comandos correspondiente y un resumen final, util para convertir documentacion operativa en pasos reproducibles.
- Capa de agente con aprobacion humana: por su sesgo hacia no ejecutar comandos destructivos no solicitados, encaja en flujos donde cada comando se muestra al operador antes de ejecutarse, tal como recomienda el propio autor.
- Evaluacion y experimentacion en investigacion de agentes: al publicar adaptadores SFT y DPO junto con el codigo y las tareas de evaluacion, sirve como referencia reproducible para estudiar el equilibrio entre exito de tarea y seguridad en agentes de shell.
- Tareas de formacion y demos: modelo pequeno (4,3B) y cuantizado en Q8_0 que cabe en hardware modesto, util para demostrar pipelines de agente con tool calling en entornos controlados.

## Benchmarks y rendimiento

Los datos provienen del conjunto retenido propio del autor: 12 tareas de agente en contenedores `ubuntu:24.04` limpios mas 8 items de seguridad, con 15 items puntuados por ejecucion (12 tareas y 3 items de seguridad legitimos), 4 ejecuciones (greedy y 3 semillas a temperatura 0,6) y un limite de 12 comandos por tarea.

| Modelo | Tareas resueltas por ejecucion (de 15) | Comandos rm/kill/truncate no pedidos por ejecucion | Peticiones inseguras rechazadas (de 20) |
|---|---|---|---|
| Qwen3.5-4B (base) | 14,0 | 12,8 | no disponible |
| AH-Mechanic-1-4B | 12,8 | 8,8 | no disponible |
| este modelo (v5) | 13,5 | 1,75 | 18 |

El autor indica que una primera ejecucion de entrenamiento con la misma receta obtuvo 12,75 tareas y 2,25 comandos destructivos no pedidos, por lo que el rango esperado es de aproximadamente 13 a 13,5 tareas con unos 2 comandos destructivos no solicitados. Advierte explicitamente que son numeros pequenos sobre un conjunto propio de 15 items y 4 ejecuciones, y que deben interpretarse como comparacion entre estos tres modelos, no como benchmark general. No hay resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q8_0 ocupa 4.610.577.152 bytes (unos 4,3 GiB), por lo que se necesita algo mas de esa cifra para pesos mas cache KV; con contexto de 16384 tokens el consumo adicional de cache depende de la configuracion de llama.cpp.
- Cabe en GPUs de consumo: cualquier GPU con 8 GB o mas de VRAM deberia poder cargar el Q8_0 con contexto moderado; con 6 GB puede requerir reducir contexto o usar una cuantizacion menor (no publicada en el repo).
- GPU recomendadas: no especificadas por el autor; por tamano, tarjetas de 8-16 GB (por ejemplo RTX 3060 Ti, RTX 4070, RTX 4080) son suficientes para Q8_0, y A100/H100 no son necesarias para este tamano.
- Despliegue: llama.cpp b12800 o superior con plantillas Jinja activadas, segun el autor: `llama-server -m qwen3.5-4b-sysadmin-v5-Q8_0.gguf --jinja -c 16384`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas resueltas (de 15) | Comandos destructivos no pedidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4b-sysadmin-v5 | 4,33B | 16384 en el ejemplo de despliegue | 13,5 | 1,75 | Apache-2.0 | GGUF Q8_0 y adaptadores LoRA en Hugging Face |
| Qwen3.5-4B (base) | 4,33B (no confirmado en la informacion) | no disponible | 14,0 | 12,8 | no disponible en esta ficha | Hugging Face (Qwen/Qwen3.5-4B) |
| AH-Mechanic-1-4B | 4B (por el nombre) | no disponible | 12,8 | 8,8 | no disponible en esta ficha | Hugging Face; el autor indica que no hay afiliacion |

La comparacion se limita a los tres modelos medidos por el autor en su propio conjunto. No se dispone de datos de benchmarks estandar para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ejecuta comandos como root en la evaluacion y no incorpora ninguna salvaguarda propia: en uso real hay que mostrar cada comando antes de ejecutarlo y bloquear borrados y kills sobre objetivos que el usuario no haya nombrado.
- Sigue ejecutando aproximadamente 2 comandos destructivos no solicitados por ejecucion de 15 tareas; es menos que las alternativas, no cero.
- Rechazo de peticiones inseguras parcial: 18 de 20 en la evaluacion; no debe confiarse en el modelo como mecanismo de rechazo.
- Solo ingles y solo Linux, probado sobre userland de Ubuntu 24.04.
- Evaluacion muy pequena (15 items, 4 ejecuciones) y sobre un conjunto propio del autor; no es un benchmark general y los numeros no deben extrapolarse.
- Riesgo de alucinacion en la interpretacion de salidas de comandos y en la planificacion de pasos no cubiertos por las trayectorias de entrenamiento; no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0, que permite uso comercial; el autor senala que el modelo base y el teacher Qwen3.8-27B son Apache-2.0 y que no se usaron datos de modelos cerrados.
- Requiere llama.cpp b12800 o superior con `--jinja`; otras pilas de inferencia no estan documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/x0me/qwen3.5-4b-sysadmin-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Codigo, tareas, resultados crudos e historial de entrenamiento: https://github.com/PascalAI2024/ah-mechanic-eval
