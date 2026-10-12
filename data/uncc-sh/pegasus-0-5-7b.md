# uncc-sh/pegasus-0.5-7b

## Resumen

pegasus-0.5-7b es un modelo de decompilacion por coincidencia exacta (matching decompilation) desarrollado por uncc. Su tarea no es escribir C que se comporte igual que un binario, sino escribir C que, compilado con el mismo compilador y los mismos flags que el binario original, produzca bytes identicos (con las relocaciones enmascaradas). Es un problema mucho mas estricto que la decompilacion funcional habitual.

El modelo parte de Qwen/Qwen2.5-Coder-7B-Instruct y se ha ajustado mediante LoRA SFT (rango 64, alpha 128, 2 epocas, secuencias de 8.192 tokens) sobre 2.755 pares verificados byte a byte por el servidor de uncc. Los pares se obtuvieron de programas open source compilados con gcc 15.2 -O2 para i386 (rung r0), y solo se admitieron respuestas que recompilaban con sha1 correcto. El resultado son 7.615.616.512 parametros (~7,6B) publicados en safetensors bf16, mas el adaptador LoRA suelto.

Su relevancia es doble. Por un lado, demuestra que un modelo de 7B especializado supera a modelos generalistas de 16B, 30B y 32B en esta tarea: 23,1% de coincidencia exacta al primer intento en funciones retenidas, frente al 9,0% de Qwen2.5-Coder-32B-Instruct. Por otro, forma parte de una escalera de toolchains (r0 gcc, r1 IDO/PsyQ/Borland, r2 MSVC 5/6, r3 MWCC/ee-gcc/MSVC 7-9, r4 MSVC 14+/x64/LTO) en la que los pares verificados de cada escalon entrenan al siguiente modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), ajustado con LoRA y fusionado a bf16 |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento LoRA uso secuencias de 8.192 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (se publican pesos bf16); al derivar de Qwen2.5 admite cuantizaciones externas tipo GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible; el corpus de entrenamiento son pares de ensamblador x86 y C, con plantilla de chat en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, repo de 15,9 GB); adaptador LoRA en el subdirectorio `adapter/` |

## Arquitectura y entrenamiento

La base es un transformer decoder denso de la familia Qwen2. El ajuste es un LoRA SFT con rango 64, alpha 128, 2 epocas y longitud de secuencia 8.192, posteriormente fusionado a bf16. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de pensamiento.

El dato diferencial esta en el dataset. Son 2.755 pares de entrenamiento, cada uno correspondiente a una funcion que un agente de uncc logro reproducir byte a byte sobre objetivos r0 (doom, zlib, quake, duke3d, quake2) con la toolchain fijada (`gcc 15.2 -O2 -march=i686`, i386). El servidor recompilaba el C propuesto y exigia `sha1: OK`; las afirmaciones del agente nunca se aceptaban sin esa verificacion. A los agentes nunca se les entrego el codigo fuente original de los objetivos. Los splits se hacen por funcion mediante hash estable, el conjunto de test retiene unidades de traduccion completas y el ensamblador identico se deduplica antes de dividir. El conjunto completo de pares es publico y creciente en `uncc.sh/api/dataset/pairs.jsonl`.

La evaluacion se realiza compilando cada respuesta con la misma toolchain y comparando bytes, con el mismo prompt para todos los modelos y el mismo preprocesado (se anteponen las lineas `#include` de la unidad de traduccion cuando la respuesta no trae ninguna).

## Capacidades

- Generacion de C a partir de ensamblador x86 (i386) y de la descripcion de la toolchain, orientada a coincidencia binaria exacta.
- Matching decompilation: la salida es valida solo si recompila a bytes identicos con el compilador y flags del objetivo, no si solo se comporta igual.
- Uso de metadatos del objetivo en el prompt: simbolo, tamano, ensamblador, toolchain (`gcc-i686-o2`), version de compilador, flags y arquitectura.
- Conversacional con plantilla de chat propia (`uncc-chat-v2`), expuesta en `prompt.py` mediante `build_messages` y `extract_c`.
- Generacion larga en una sola respuesta (el ejemplo oficial usa `max_new_tokens=2048` con decodificacion greedy).
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio, matemáticas avanzadas ni capacidades multilingues en este modelo.

## Casos de uso

- Preservacion de videojuegos clasicos: reconstruir el C de funciones de doom, quake, quake2 o duke3d compiladas con gcc i386, con la garantia de que el resultado recompila a los mismos bytes. Es exactamente el dominio sobre el que se entreno y donde alcanza el 23,1% de acierto al primer intento.
- Auditoria de binarios i386 sin fuente: obtener C legible de una funcion concreta para revisar logica, constantes y flujo de control antes de analizarlo a mano.
- Generacion de pruebas de regresion de compiladores: usar pares funcion binaria / C equivalente como casos de prueba que detecten cambios de codegen entre versiones de gcc con los mismos flags.
- Bucle de decompilacion asistida por agente: integrar el modelo como generador dentro de un pipeline que recompila y verifica sha1, descartando respuestas y reintentando. El modelo rinde mejor en esa modalidad (28,2% en held-out con 9 intentos) que en un unico disparo.
- Recuperacion de fuentes compilables para mantenimiento: producir versiones en C que puedan recompilarse con la toolchain moderna y servir de base a portes o correcciones.
- Investigacion en reversing y docencia: usar los pares verificados y el prompt publico para estudiar como un LLM de 7B aprende restricciones de codegen estrictas y comparar contra modelos mayores.
- Analisis de malware compilado con gcc i386: extraer candidatos en C de rutinas ofuscadas o sin fuente, siempre con verificacion humana posterior.

## Benchmarks y rendimiento

Coincidencia byte a byte al primer intento (greedy), evaluada por el motor de uncc con la misma toolchain. Held-out: 234 funciones r0 nunca vistas en entrenamiento. Unseen: lua 5.4 (200 funciones) y brogue CE (200 funciones), ausentes por completo del entrenamiento.

| Modelo | Parametros | Held-out | Unseen |
|---|---|---:|---:|
| pegasus-0.5 | 7B | 23,1% | 6,3% |
| Qwen2.5-Coder-32B-Instruct | 32B | 9,0% | 4,3% |
| Qwen3-Coder-30B-A3B-Instruct | 30B MoE | 7,7% | 3,5% |
| DeepSeek-Coder-V2-Lite-Instruct | 16B MoE | 6,0% | 2,3% |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | 5,1% | 2,5% |

Coincidencia byte a byte dentro de 9 intentos (greedy mas 8 muestras), cada intento verificado por el compilador.

| Modelo | Held-out | Unseen |
|---|---:|---:|
| pegasus-0.5 | 28,2% | 8,3% |
| Qwen2.5-Coder-32B-Instruct | 16,2% | 7,0% |
| Qwen3-Coder-30B-A3B-Instruct | 9,4% | 5,5% |
| DeepSeek-Coder-V2-Lite-Instruct | 7,7% | 4,5% |
| Qwen2.5-Coder-7B-Instruct (base) | 6,4% | 5,0% |

El propio autor senala que en programas nunca vistos la mejora es pequena y que ese es el objetivo de los siguientes escalones y del siguiente pegasus. No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: los 7,6B parametros ocupan unos 15,2 GB de pesos, mas cache KV. Con la ventana de entrenamiento de 8.192 tokens y salidas de hasta 2.048 tokens, conviene reservar 18-20 GB.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits, alrededor de 5-6 GB. Las cuantizaciones no vienen publicadas en el repositorio y habria que generarlas.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000 sin problema en bf16.
- GPU de consumo: cabe en bf16 en RTX 4090, RTX 3090 y RTX 5090 (24-32 GB). En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) es recomendable cuantizar o reducir la longitud de contexto. En 8 GB (RTX 3070, 4060) solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (es el flujo documentado, con `prompt.py` como plantilla exacta), vLLM, TGI (el repo declara compatibilidad con text-generation-inference y endpoints), y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota operativa: el modelo esta pensado para generar salidas medianas o largas y verificarlas externamente, no para inferencia de baja latencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Held-out (1 intento) | Held-out (9 intentos) |
|---|---|---:|---|---:|---:|
| pegasus-0.5-7b | 7,6B | Denso, SFT especializado | apache-2.0 | 23,1% | 28,2% |
| Qwen2.5-Coder-7B-Instruct | 7,6B | Denso, generalista de codigo | apache-2.0 | 5,1% | 6,4% |
| Qwen3-Coder-30B-A3B-Instruct | 30B MoE (3B activos) | MoE, generalista de codigo | no disponible en la informacion proporcionada | 7,7% | 9,4% |
| Qwen2.5-Coder-32B-Instruct | 32B | Denso, generalista de codigo | apache-2.0 | 9,0% | 16,2% |
| DeepSeek-Coder-V2-Lite-Instruct | 16B MoE | MoE, generalista de codigo | no disponible en la informacion proporcionada | 6,0% | 7,7% |

La comparacion es valida solo en la tarea de matching decompilation sobre objetivos r0. Fuera de ese dominio no hay datos publicados que permitan comparar a pegasus-0.5 con los modelos generalistas, que siguen siendo la opcion adecuada para generacion de codigo, chat o razonamiento general. Las longitudes de contexto de los modelos comparados no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente para decompilacion por coincidencia en x86 i386 con gcc 15.2 -O2 sobre C open source. Fuera de ese rung no hay garantia de comportamiento util.
- Generalizacion limitada a programas nuevos: en codigo ajeno al entrenamiento el acierto cae al 6,3% al primer intento y al 8,3% con 9 intentos.
- Riesgo de alucinacion alto en la practica: el modelo produce C plausible que con frecuencia no recompila a los bytes objetivo. El propio autor insiste en que un match solo cuenta cuando el compilador lo confirma, por lo que la verificacion externa es obligatoria.
- La plantilla de prompt es parte del contrato: usar un formato distinto de `uncc-chat-v2` degrada la salida. `prompt.py` reproduce la plantilla exacta de entrenamiento.
- Ausencia de datos sobre capacidades generales: no hay evaluaciones publicadas de chat, razonamiento o generacion de codigo convencional tras el ajuste, ni de sesgos, idiomas o robustez.
- Licencias del material derivado: aunque el modelo se publica bajo apache-2.0, los objetivos r0 tienen licencias distintas (GPL-2.0 para los juegos de id y duke3d, licencia zlib para zlib). Hay que revisarlas antes de redistribuir el C derivado. Aparece una funcion `extract_c` para extraer el bloque C; su comportamiento en casos limite no se documenta.
- Idiomas: no hay informacion sobre capacidades multilingues; el corpus es codigo y ensamblador, no texto natural.
- Datos de ficha incompletos: no se publican tipos de cuantizacion, latencia, throughput ni longitud de contexto final del modelo ajustado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uncc-sh/pegasus-0.5-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Sitio del proyecto: https://uncc.sh
- Dataset: https://uncc.sh/dataset
- Pares verificados en crudo: https://uncc.sh/api/dataset/pairs.jsonl

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; unicamente resultados de naturaleza no relacionada, por lo que no se incluyen.
