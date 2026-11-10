# vrfai/molmoact2-libero-gguf

## Resumen

MolmoAct2-LIBERO (GGUF) es la conversión al formato GGUF del checkpoint `allenai/MolmoAct2-LIBERO`, un modelo de vision-lenguaje-accion (VLA) desarrollado por Ai2 (Allen Institute for AI) y publicado en el paper arXiv:2605.02881. El modelo resuelve el problema de generar trayectorias de accion continuas para robots manipuladores a partir de observaciones visuales (dos camaras: agente y muñeca) y una instruccion en lenguaje natural, en el contexto de las tareas del benchmark LIBERO (spatial, object, goal y libero-10).

La conversion la firma el usuario `vrfai` y esta pensada para ejecutarse en **vla.cpp**, un motor de inferencia en C++ construido sobre llama.cpp, lo que permite desplegar el modelo sin depender del stack de PyTorch. El checkpoint original contiene 5.046.358.821 parametros y combina una torre visual SigLIP-so400m/14, un LM estilo Qwen3 de 36 capas y un experto de accion basado en flow matching, todo empaquetado en un unico fichero GGUF de 9,4 GiB en bf16.

Su relevancia actual radica en que democratiza la inferencia de un VLA sobre hardware de consumo (RTX 3060, Apple M4) con latencias de cientos de milisegundos por chunk de accion, algo poco habitual en modelos roboticos de este tamano que suelen requerir GPUs de datacenter. La licencia Apache-2.0 facilita su uso comercial e investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA hibrida: torre visual SigLIP-so400m/14 + LM transformer estilo Qwen3 + experto de accion flow-matching con bloques adaLN |
| Parametros totales | 5.046.358.821 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt compuesto por tarea, setup, modo de control y estado discretizado) |
| Tipos de cuantizacion | bf16 (por defecto), f16, f32 (seleccionables en vla.cpp); pesos GEMM en bf16, normas y sesgos en f32 |
| Idiomas soportados | no disponible (las instrucciones del benchmark LIBERO estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico `molmoact2-libero-bf16.gguf`, 9,4 GiB); tokenizer en JSON aparte |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura VLA de tres componentes acoplados. Una torre visual **SigLIP-so400m/14** procesa dos vistas (agentview y wrist) redimensionadas a 378×378; se usan 25 capas y las salidas de las capas 24 y 18 se agrupan mediante pooling 2×2 por atencion, produciendo 196 tokens por vista que se suman a los embeddings de parches de imagen de un LM de 36 capas estilo Qwen3 (ancho 2560, 32 cabezas q / 8 cabezas kv). El estado del robot (8 dimensiones: posicion del efector final, angulo-eje y posicion del gripper) se normaliza con estadisticos q01/q99 y se discretiza en 256 tokens `<state_k>` que entran en el prompt junto con la instruccion.

La generacion de acciones corre a cargo de un **experto de flow matching** con un bloque adaLN por cada capa del LM (36 bloques × 768), que hace cross-attention a las claves y valores de la capa correspondiente e integra un chunk de accion de 10×7 (horizonte 10, dimension 7 rellenada a 32) en 10 pasos de Euler. El checkpoint esta afinado sobre las cuatro suites de LIBERO con acciones continuas unicamente (la cabeza discreta del LM se omite y el razonamiento de profundidad esta desactivado). No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset en la informacion proporcionada.

## Capacidades

- Generacion de acciones roboticas continuas (chunks de 10×7) a partir de instrucciones en lenguaje natural e imagenes de dos camaras.
- Percepcion visual multi-vista con torre SigLIP-so400m/14 (dos vistas simultaneas).
- Comprension de instrucciones de tarea en ingles (tareas del benchmark LIBERO).
- Integracion de estado propioceptivo del robot (8 dimensiones) como tokens discretos en el prompt.
- Control de manipulacion de brazo y gripper (dimensiones normalizadas q01/q99 para el brazo; gripper en [-1, 1]).
- Inferencia en CPU, CUDA y Metal a traves de vla.cpp.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento de profundidad en este checkpoint.

## Casos de uso

- **Manipulacion robotica en entornos de laboratorio (benchmark LIBERO):** el modelo esta afinado especificamente para las suites spatial, object, goal y libero-10, por lo que es adecuado para reproducir y comparar resultados de investigacion en manipulacion con instrucciones en lenguaje natural.
- **Prototipado de politicas VLA en hardware de consumo:** con una RTX 3060 se obtienen chunks de accion en 328 ms usando `--weight-dtype f16 --flash-attn`, lo que permite iterar rapidamente en un laboratorio sin acceso a GPUs de datacenter.
- **Despliegue embebido en C++:** al ejecutarse sobre vla.cpp (basado en llama.cpp), puede integrarse en un bucle de control de robot escrito en C++ sin dependencias de Python/PyTorch, reduciendo el coste de integracion en stacks robóticos existentes.
- **Evaluacion de fidelidad numerica de conversiones GGUF:** el repositorio documenta diferencias maximas de accion frente a la referencia en fp32 (1,4e-3 en bf16 CUDA, 5,2e-4 con f16), lo que lo hace util como caso de estudio para validar pipelines de cuantizacion en modelos roboticos.
- **Investigacion en flow matching para control:** el experto de accion con 36 bloques adaLN y 10 pasos de Euler puede servir como base para estudiar variantes de generacion de trayectorias en robótica.
- **Servicio de inferencia local via HTTP:** `vla-server` permite exponer el modelo como servicio en una maquina local para que otros componentes del sistema robótico consulten acciones bajo demanda.
- **Formacion y docencia en VLA:** el empaquetado en un unico GGUF (sin fichero mmproj) y el cliente LIBERO incluido facilitan montar practicas reproducibles sobre arquitecturas VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta una prueba de humo sobre LIBERO (tarea 0 de cada suite, 3 episodios cada una, chunks de 10 acciones) con exito 12/12, pero sin barrido completo.

Datos de fidelidad y latencia reportados por el autor:

| Backend | bf16 (por defecto) | `--weight-dtype f16` | `--weight-dtype f16 --flash-attn` | Latencia (por defecto) |
|---|---:|---:|---:|---:|
| CPU (i7-14700F) | 1,7e-3 | no disponible | no disponible | ~16 s |
| CUDA (RTX 3060) | 1,4e-3 | 5,2e-4 | 9,2e-4 | 446 ms |
| Metal (Apple M4) | 5,6e-4 | no disponible | no disponible | 1,9 s |

La metrica es la diferencia maxima absoluta del chunk de accion (en unidades del robot) frente a `predict_action` del checkpoint en fp32 PyTorch, sobre la muestra libero_10 episodio 0 frame 0 con el mismo ruido. Como referencia, la propia referencia se mueve 4e-4 al redondear solo sus pesos a bf16; con pesos f32 la build de CPU iguala esa referencia redondeada a bf16 con 7,7e-6.

## Requisitos de hardware

- **VRAM estimada:** el GGUF en bf16 ocupa 9,4 GiB; en f16 o f32 el requisito es similar o superior. Se necesita ademas memoria para las activaciones de la torre visual y el experto de accion.
- **GPU recomendadas:** RTX 3060 (12 GB) funciona segun el autor; GPUs con 12-16 GB o mas (RTX 4070/4080/4090, A100, H100) son adecuadas. No se dispone de datos de rendimiento en A100/H100.
- **Consumer GPU:** si, cabe en GPUs de consumo con 12 GB o mas (RTX 3060, 4070, 4080, 4090) y en Apple Silicon (M4 probado).
- **Opciones de despliegue:** vla.cpp (`vla-cli` para one-shot, `vla-server` para servicio HTTP), compilado con `-DGGML_CUDA=ON` para CUDA; soporta CPU, CUDA y Metal. No se menciona soporte de vLLM, llama.cpp directo ni TGI.
- **Latencia y throughput:** 446 ms por chunk en RTX 3060 (bf16), 328 ms con f16 + flash-attn, ~1,9 s en Apple M4 y ~16 s en CPU i7-14700F. El throughput no se reporta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el modelo pertenece a la familia de VLA de Ai2 (MolmoAct2) y comparte categoria con otros VLA roboticos como OpenVLA o pi0, pero no se han proporcionado sus parametros, contexto ni rendimiento en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MolmoAct2-LIBERO (este) | 5.046.358.821 | no disponible | Apache-2.0 | GGUF en HF |
| Alternativas VLA | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgo de dominio:** el checkpoint esta afinado exclusivamente sobre las cuatro suites de LIBERO; su comportamiento fuera de ese dominio (otras tareas, otros robots, otras camaras) no esta validado y probablemente degrade.
- **Idioma:** las instrucciones del benchmark estan en ingles; no hay informacion sobre soporte multilingue.
- **Riesgo de alucinacion:** como modelo generativo de acciones, puede producir trayectorias plausibles pero incorrectas; el autor solo reporta una prueba de humo de 12/12 episodios, sin barrido completo.
- **Acciones continuas unicamente:** la cabeza discreta del LM se omite y el razonamiento de profundidad esta desactivado en este checkpoint, lo que limita su uso a control continuo.
- **Dependencia de vla.cpp:** requiere compilar el motor y usar el cliente LIBERO o `vla-server`; no es un modelo plug-and-play en frameworks Python estandar.
- **Fidelidad numerica:** las diferencias frente a la referencia fp32 son del orden de 1e-3 a 1e-4 en unidades del robot, lo que puede importar en tareas de precision.
- **Licencia:** Apache-2.0 permite uso comercial, pero se recomienda citar el paper de MolmoAct2 y verificar los terminos del checkpoint original `allenai/MolmoAct2-LIBERO`.
- **Estado del repositorio:** 0 descargas y 0 likes en el momento de la consulta; es una conversion reciente (noviembre de 2026) sin validacion comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vrfai/molmoact2-libero-gguf
- Modelo base: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Paper: https://arxiv.org/abs/2605.02881
- Codigo de MolmoAct2: https://github.com/allenai/molmoact2
- Motor vla.cpp: https://github.com/VinRobotics/vla.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
