# while-ai/paper-harness-and-weights-1.5b

## Resumen

`while-ai/paper-harness-and-weights-1.5b` es un adaptador LoRA (PEFT) entrenado con GRPO sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`. No es un modelo con pesos completos ni un lanzamiento de propósito general: es el artefacto reproducible de un experimento de replicación de papers cuyo objetivo es medir, sobre un mismo conjunto de tareas, dos palancas independientes: el *harness* (instrucciones, fichero de habilidades y una herramienta de Python) y los pesos (entrenamiento con GRPO y LoRA). El repositorio publica dos brazos: `.` (entrenado bajo el harness `01_skills`) y `weights` (entrenado bajo el harness desnudo `00_baseline`).

El resultado principal se obtuvo el 2026-09-21 con una sola H100, 79 tareas retenidas (*held-out*) repartidas en seis familias que nunca aparecieron en entrenamiento, 4 rollouts por tarea y 40 pasos de GRPO por brazo entrenado. La tabla del autor muestra pass@1 de 0.00 para el par (sin harness, base), 0.09 para (con harness, base), 0.03 para (sin harness, entrenado) y 0.09 para (con harness, entrenado). Es decir, elegir el harness sobre el holdout aportó +0,08 al modelo base, mientras que entrenar los pesos bajo el harness desnudo solo aportó +0,03; entrenar bajo el harness elegido igualó el pass@1 del harness solo pero elevó el pass@4 de 0.09 a 0.30.

Su relevancia es metodológica más que de producto: es un caso reproducible y auditado (con escaneos de *hacks* declarados) sobre cuánto de la mejora en tareas agénticas viene del andamiaje y cuánto del ajuste de pesos, con intervalos de confianza explícitos y con la advertencia de que solo hay una semilla de entrenamiento por brazo, por lo que los pares entrenados quedan sin resolver estadísticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre un transformer decoder-only (modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1,5B en el modelo base (el adaptador LoRA no declara su numero de parametros entrenables; el repo completo ocupa 0,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para el adaptador; heredada del modelo base Qwen2.5-Coder-1.5B-Instruct |
| Tipos de cuantizacion | no disponible (se distribuye como adaptador LoRA en safetensors; no se publican versiones GGUF ni cuantizadas del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere cargar el modelo base por separado) |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Libreria | peft (carga con transformers) |
| Pipeline | text-generation |
| Brazos publicados | `.` (`both`, entrenado bajo harness `01_skills`) y `weights` (entrenado bajo harness `00_baseline`); `checkpoints/` no se publica |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 2026-09-22 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo: se carga con `PeftModel.from_pretrained` sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct`. El entrenamiento se hizo con GRPO (Group Relative Policy Optimization), un metodo de aprendizaje por refuerzo con optimizacion de preferencias relativas dentro de un grupo de rollouts, aplicado sobre LoRA en lugar de sobre los pesos completos. La configuracion reportada es de 40 pasos de GRPO por brazo entrenado, 4 rollouts por tarea y una unica semilla por brazo, sobre una H100.

El diseno experimental es un 2x2 emparejado por tarea: cuatro celdas que combinan harness (ausente frente a `01_skills`) y pesos (base frente a entrenado). El harness `01_skills` consta de instrucciones, un fichero de habilidades (*skills file*) y una herramienta de Python, y fue seleccionado sobre el holdout antes de cualquier entrenamiento, lo que evita fuga de informacion hacia la seleccion. La evaluacion final usa 79 tareas retenidas en seis familias nunca vistas durante el entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de entrenamiento ni si hubo fases adicionales de SFT o DPO previas al GRPO. El autor menciona dos escaneos de *hacks* documentados en el README de la receta y una tabla de atribucion completa.

## Capacidades

- Generacion de texto conversacional y de codigo, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Uso de herramientas (*tool calling*) en el contexto del harness: el modelo fue entrenado y evaluado con una herramienta de Python disponible.
- Analisis de datos como familia de tareas objetivo (etiqueta `data-analysis` del repositorio).
- Ejecucion de tareas de multiples pasos mediadas por harness (instrucciones mas fichero de habilidades mas herramienta).
- Replicacion de experimentos: el repositorio esta pensado para reproducir el resultado con `python recipe.py`.
- Capacidades multilingues: no disponible; el modelo base es de la familia Qwen2.5-Coder, pero el autor no declara idiomas soportados.
- Modo *thinking* explicito, vision o audio: no disponibles.

## Casos de uso

- Replicacion de investigacion sobre harness frente a pesos: cargar los dos brazos (`.`) y (`weights`) con el mismo harness y comparar pass@1 y pass@4 sobre un conjunto de tareas propio, exactamente como hace la receta, para medir si en un dominio concreto conviene invertir en andamiaje o en entrenamiento.
- Evaluacion de agentes de analisis de datos: usar el modelo como policy de un agente que recibe una herramienta de Python y comprobar si resuelve tareas de manipulacion de datos; es adecuado porque la familia de tareas de entrenamiento es precisamente esa.
- Investigacion sobre GRPO con LoRA en modelos pequenos: el repositorio fija semilla, versiones de libreria y GPU, lo que permite reproducir el efecto de 40 pasos de GRPO sobre un adaptador de 1,5B con un coste de computo de una sola GPU.
- Prototipado de *tool calling* de bajo coste: al ser un adaptador sobre 1,5B, se puede desplegar en una GPU de consumo para validar esquemas de llamadas a funciones antes de escalar a modelos mayores.
- Experimentos controlados de RLHF/RL sobre codigo: sirve como linea base barata para comparar variantes de recompensa o de numero de rollouts sin reentrenar un modelo completo.
- Docencia y formacion en metodologia experimental: el 2x2 emparejado con intervalos de confianza al 95% y la advertencia sobre semilla unica son material didactico directo sobre como reportar resultados de RL con honestidad estadistica.
- Auditoria de *reward hacking*: los dos escaneos de hacks incluidos en la receta permiten estudiar como un modelo pequeno explota el harness en lugar de resolver la tarea.

## Benchmarks y rendimiento

Resultados publicados por el autor (2026-09-21, una H100, 79 tareas retenidas en seis familias no vistas en entrenamiento, 4 rollouts por tarea, 40 pasos de GRPO por brazo entrenado):

| Celda | Harness | Modelo | pass@1 | IC 95% |
|---|---|---|---|---|
| neither | `00_baseline` | base | 0.00 | [0.00, 0.01] |
| harness | `01_skills` | base | 0.09 | [0.05, 0.13] |
| weights | `00_baseline` | entrenado | 0.03 | [0.01, 0.04] |
| both | `01_skills` | entrenado | 0.09 | [0.06, 0.12] |

Efectos reportados por el autor: seleccionar el harness sobre el holdout aporto +0,08 [+0,05, +0,12] al modelo base; entrenar los pesos bajo el harness desnudo aporto +0,03; entrenar bajo el harness elegido igualo el pass@1 del harness solo y subio el pass@4 de 0.09 a 0.30. El autor indica explicitamente que hay una sola semilla de entrenamiento por brazo, de modo que los pares entrenados quedan sin resolver, y remite a la seccion *Learned* del README de la receta antes de citar cualquier cifra. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B en fp16 ocupa aproximadamente 3 GB de pesos; el adaptador a~nade una fraccion pequena (el repo completo pesa 0,3 GB e incluye dos brazos). Con cache KV para contexto largo, un presupuesto practico de 6-8 GB en fp16 y de 3-4 GB en cuantizacion de 4 bits del modelo base es una estimacion razonable, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 son suficientes. El entrenamiento reportado se hizo con una unica H100, pero el modelo es lo bastante pequeno para ajuste en GPUs de consumo con LoRA.
- Cabe en GPU de consumo: si. La familia RTX 30/40 con 8 GB o mas es suficiente para inferencia; para entrenar con LoRA conviene 16 GB o mas.
- Opciones de despliegue: carga directa con `transformers` + `peft` (metodo documentado por el autor); al ser un adaptador LoRA sobre Qwen2.5-Coder-1.5B-Instruct, tambien se puede fusionar con el modelo base y servir con vLLM, TGI, llama.cpp u Ollama, aunque el autor no publica artefactos fusionados ni GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| while-ai/paper-harness-and-weights-1.5b | 1,5B + adaptador LoRA (parametros del adaptador no disponibles) | no disponible | pass@1 0.09 con harness `01_skills`; pass@4 0.30 | apache-2.0 | HuggingFace, requiere modelo base |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible en esta ficha | pass@1 0.09 con harness `01_skills`, 0.00 sin harness (medido por el autor) | apache-2.0 | HuggingFace |
| Otros adaptadores GRPO/LoRA para tool use sobre modelos de ~1,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparativas publicadas con modelos de la misma categoria en la informacion proporcionada mas alla de la comparacion interna con el modelo base, que el propio autor reporta en la tabla de resultados.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: el mejor pass@1 reportado es 0.09 sobre 79 tareas, con intervalos de confianza que llegan a solaparse entre celdas. No es un modelo apto para uso en produccion general.
- Una sola semilla de entrenamiento por brazo: el propio autor senala que los pares entrenados quedan sin resolver estadisticamente, por lo que no se deben citar las diferencias entre brazos entrenados como efectos establecidos.
- Es un adaptador, no un modelo autonomo: sin el modelo base Qwen2.5-Coder-1.5B-Instruct no funciona, y el rendimiento depende criticamente del harness (instrucciones, skills file y herramienta de Python) usado en la evaluacion.
- Riesgo de *reward hacking*: la receta documenta escaneos de hacks, lo que implica que el modelo puede explotar el andamiaje en lugar de resolver la tarea. Hay que revisar esos escaneos antes de reutilizar el modelo fuera del entorno de evaluacion.
- Riesgo de alucinacion: no evaluado explicitamente en la informacion disponible, pero es esperable en un modelo de 1,5B, especialmente en tareas fuera del dominio de codigo y analisis de datos.
- Idiomas: no declarados. El modelo base es de la familia Qwen2.5-Coder, mayoritariamente orientada a ingles y chino; no hay garantia de calidad en castellano.
- Sesgos: no se han publicado evaluaciones de sesgo en la informacion disponible.
- Licencia: apache-2.0 permite uso comercial, pero el modelo base tiene su propia licencia que debe respetarse por separado; el autor no publica pesos fusionados ni GGUF, de modo que cualquier redistribucion derivada corre por cuenta de quien la haga.
- Los resultados de la busqueda web proporcionados no contienen informacion relevante sobre este modelo: los resultados obtenidos corresponden a traducciones del termino ingles "while" y a la estructura de control de programacion homonima, no al proyecto while-ai.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/paper-harness-and-weights-1.5b
- Receta reproducible en GitHub: https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/harness-and-weights
- Repositorio del SDK: https://github.com/whilehq/whileai-sdk
- Coleccion "Papers, replicated": https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
