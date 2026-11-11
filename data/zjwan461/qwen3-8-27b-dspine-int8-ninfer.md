# zjwan461/Qwen3.8-27B-DSpine-int8-ninfer

## Resumen

Qwen3.8-27B-DSpine-int8-ninfer es un artefacto de inferencia de la comunidad creado por el usuario zjwan461, que empaqueta el modelo multimodal Qwen3.8-27B (27 000 millones de parametros, desarrollado originalmente por Alibaba) en formato propietario `.ninfer` junto con una cabeza de decodificacion especulativa DSpine procedente de Tencent. No se trata de un checkpoint estandar de `transformers` ni de `safetensors`: es el contenedor nativo del motor NInfer, un motor de inferencia monogpu escrito en C++/CUDA, y solo puede ejecutarse con una bifurcacion especifica del mismo.

El modelo base combina un backbone de texto de 64 capas con atencion hibrida (lineal y completa), una torre de vision de 27 capas y una cabeza de prediccion multi-token (MTP). Sobre esa base, este build anade un draft model DSpine de 5 capas con ventana deslizante de 8192 tokens y bloque 16, pensado para acelerar la decodificacion especulativa en GPUs de consumo. Los pesos de texto son identicos byte a byte al recetario int8 publicado por el autor neroued (proyecciones mixtas Q8/Q5/Q4, embedding Q5, vision Q4).

Su relevancia es acotada pero tecnica: demuestra que es posible servir un modelo multimodal de 27B cuantizado a int8 en una RTX 4080 SUPER de 32 GB con throughput de decodificacion de entre 120 y 233 tok/s gracias a la combinacion de cuantizacion agresiva, KV cache comprimida (`rk4v4-e8`) y decodificacion especulativa. La contrapartida es una dependencia total de un motor no estandar y de una rama concreta de un repositorio de GitHub, lo que limita seriamente su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal + atencion completa) con torre de vision y cabeza MTP; draft DSpine tipo DFlash |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens (configurado via `--max-context` en el servidor) |
| Tipos de cuantizacion | int8 mixto: Q8 (g32) mayoria de proyecciones, Q5/Q6 algunas, embedding Q5, vision Q4; draft Q8 con code bridge en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor nativo del motor NInfer), no compatible con safetensors, GGUF ni otros formatos |

## Arquitectura y entrenamiento

El backbone de texto consta de 64 capas con 24 cabezas de atencion de consulta y 4 cabezas KV, con dimension de cabeza 256, y emplea un esquema de atencion hibrida que alterna atencion lineal y atencion completa para reducir el coste del contexto largo. La torre de vision tiene 27 capas y un modulo merger que proyecta las representaciones visuales al espacio del texto. Se anade una cabeza de prediccion multi-token (MTP) de una capa con cabeza compartida, utilizada para decodificacion especulativa alternativa. El draft DSpine tiene 5 capas con forma DFlash, bloque de 16 tokens, ventana deslizante de 8192, code bridge de rango 512 y tamano de codigo 1024, y top-k de cabeza 16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica destacable de este artefacto es la integracion de un draft model de Tencent (DSpine) en un motor de inferencia de la comunidad, con verificacion matematica reportada: el draft coincide con una implementacion independiente de referencia con RMS por capa dentro de 6e-5, elementos `codes`/`packed`/`out`/`next` identicos bit a bit en el 98,9-99,99 % de los casos y estabilidad exacta de prefijo causal entre `--draft-tokens 7` y `15`.

## Capacidades

- Generacion de texto y razonamiento de proposito general sobre el backbone Qwen3.8-27B.
- Procesamiento multimodal imagen-texto: la torre de vision de 27 capas permite entrada de imagenes junto con texto (pipeline `image-text-to-text`).
- Generacion de codigo: los prompts de tipo HumanEval alcanzan las mayores tasas de aceptacion del draft (9,15 tokens aceptados por ronda) y el mayor throughput (hasta 233 tok/s).
- Razonamiento matematico basico: resuelve problemas de tipo escolar, aunque con menor tasa de aceptacion especulativa (5,54 tokens por ronda).
- Decodificacion especulativa seleccionable: `--spec dspine` (draft DSpine), `--spec mtp` (cabeza MTP) o `--spec dflash2` (no disponible en este artefacto).
- Modo thinking activable o desactivable (`--no-thinking`).
- Servicio HTTP mediante `ninfer-serve.exe` con concurrencia configurable (`--max-concurrency 2`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en estaciones de trabajo con GPU de consumo: el modelo alcanza 233 tok/s en prompts de codigo con DSpine y `--draft-tokens 15`, lo que lo hace viable para integracion en editores sobre una RTX 4080 SUPER sin depender de la nube.
- Asistencia a la programacion con contexto largo: la ventana de 262 144 tokens permite cargar repositorios completos o documentacion extensa y mantener conversaciones multi-turno sobre ellos.
- Analisis de imagenes tecnicas con explicacion textual: la torre de vision Q4 permite procesar capturas, diagramas o graficos y generar descripciones o codigo a partir de ellos.
- Prototipado de investigación en decodificacion especulativa: el artefacto incluye draft DSpine y cabeza MTP, y permite comparar tasas de aceptacion entre metodos (`--spec dspine` frente a `--spec mtp`) sobre los mismos pesos de texto.
- Servicio local de inferencia para equipos pequenos: `ninfer-serve.exe` con `--max-concurrency 2` y KV cache `rk4v4-e8` permite atender a un par de usuarios simultaneos en una unica GPU de 32 GB.
- Evaluacion de cuantizacion int8 en modelos multimodales: al ser pesos identicos al recetario de neroued, sirve para medir el impacto de Q8/Q5/Q4 en calidad y latencia frente al modelo en BF16.
- Generacion de codigo en pipelines de CI/CD: no recomendado sin validacion previa, dado que el motor no es estandar y la licencia Apache-2.0 del artefacto no cubre necesariamente los pesos base.

## Benchmarks y rendimiento

Los datos publicados son mediciones indicativas del autor, no una suite de benchmarks formal. Entorno: RTX 4080 SUPER 32 GB (sm_89, build de 80 SM), `--kv-dtype rk4v4-e8`, greedy, thinking off, CUDA Graphs activado. La columna "longitud aceptada" es el numero de tokens aceptados por ronda de verificacion, incluido el token bonus.

| Prompt | DSpine (draft 15) | DFlash2 (draft 8) | DFlash2 (draft 15) |
|---|---:|---:|---:|
| Funcion merge-sorted | 10,60 | 7,95 | 10,53 |
| Completado estilo HumanEval | 9,15 | 7,93 | 10,82 |
| Problema de palabras escolar | 5,54 | 5,54 | 6,54 |

El throughput de decodificacion oscila entre aproximadamente 120 tok/s (problema de palabras, baja longitud aceptada) y 233 tok/s (prompts de codigo). Las columnas DFlash2 provienen de un artefacto distinto (`neroued/Qwen3.8-27B-NInfer`) con los mismos pesos de texto. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 19,22 GiB en disco; en inferencia se suma la KV cache comprimida (`rk4v4-e8`) y los buffers de CUDA Graphs. Con contexto de 262 144 tokens y concurrencia 2, se requiere una GPU de 32 GB como minimo.
- GPU recomendadas: RTX 4080 SUPER 32 GB (configuracion probada y unica validada, sm_89). Otras arquitecturas requieren su propia compilacion del motor; el formato de fichero es independiente de la arquitectura, pero no se han publicado pruebas en A100, H100 ni otras GPUs.
- Cabe en GPU de consumo: si, en RTX 4080 SUPER de 32 GB. No hay datos para GPUs de 24 GB o menos.
- Opciones de despliegue: exclusivamente `ninfer.exe` y `ninfer-serve.exe` compilados desde la rama `feat/dspine-draft` del repositorio `zjwan461/ninfer-sm89-windows` (CMake + MSVC 2022 + CUDA 13.x). No es compatible con vLLM, llama.cpp, Ollama, TGI, transformers ni sglang.
- Latencia y throughput: 120-233 tok/s de decodificacion en RTX 4080 SUPER segun el prompt; no se publican datos de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---:|---|---|---|
| Qwen3.8-27B-DSpine-int8-ninfer (este) | 27B | 262 144 | `.ninfer` | Apache-2.0 | Solo NInfer (rama comunitaria) |
| neroued/Qwen3.8-27B-NInfer | 27B | 262 144 | `.ninfer` | Apache-2.0 | NInfer upstream; incluye DFlash2, no DSpine |
| tencent/Qwen3.8-27B-DSpine-b16 | 27B | no disponible | no disponible (BF16 en evaluacion upstream) | no disponible | Requiere runtime compatible con DSpine |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | safetensors (presumiblemente) | Apache-2.0 | transformers, vLLM, sglang y otros motores estandar |

La comparativa de rendimiento entre este artefacto y el de neroued se limita a las longitudes aceptadas de la tabla anterior: DSpine supera a DFlash2 con draft 8 en los tres prompts, pero DFlash2 con draft 15 iguala o supera ligeramente a DSpine en dos de los tres casos. No hay datos de calidad (MMLU, HumanEval) para ninguno de los artefactos.

## Limitaciones y advertencias

- Dependencia total del runtime: los pesos no se pueden cargar con transformers, sglang, llama.cpp ni vLLM. Sin compilar la rama `feat/dspine-draft` del repositorio del autor, el fichero es inutilizable.
- No incluye el componente DFlash2: `--spec dflash2` falla con este artefacto y requiere el de neroued.
- Draft cuantizado: el backbone del draft es Q8 frente al BF16 de la evaluacion upstream de DSpine, lo que puede penalizar mas a DSpine que a DFlash2 en prompts de razonamiento, ya que el code bridge recodifica el residual del target en cada capa.
- Ventaja no universal: con la misma anchura de draft, DFlash2 alcanza una longitud aceptada similar o superior. La ventaja de DSpine solo aparece en el punto de comparacion publicado (DSpine 16 frente a DFlash2 8).
- Sin datos de calidad: no se han publicado resultados de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alucinacion para este artefacto.
- Idiomas no declarados: la model card no especifica cobertura linguistica; no se puede asumir buen rendimiento en castellano sin evaluacion previa.
- Validacion limitada a una GPU: solo se ha probado en RTX 4080 SUPER (sm_89); otras arquitecturas requieren compilacion propia y no estan validadas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 11 de noviembre de 2026; no hay historial de mantenimiento.
- Licencia: el artefacto se distribuye como Apache-2.0, pero el autor declara no estar afiliado a Alibaba ni a Tencent; conviene verificar la licencia de los pesos base y del draft DSpine antes de un uso comercial.
- Advertencia de produccion: al no ser un motor estandar, no hay garantias de soporte, parches de seguridad ni compatibilidad futura con el formato `.ninfer`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zjwan461/Qwen3.8-27B-DSpine-int8-ninfer
- Motor NInfer (bifurcacion requerida): https://github.com/zjwan461/ninfer-sm89-windows (rama `feat/dspine-draft`)
- Motor NInfer upstream: https://github.com/Neroued/ninfer
- Artefacto de referencia con los mismos pesos de texto: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Draft DSpine original de Tencent: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
