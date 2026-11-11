# wexare/command-loras

## Resumen

Command add-ons para Qwen2.5 0.5B es una coleccion de tres adaptadores LoRA publicados por weXare bajo el identificador `wexare/command-loras`. Cada adaptador especializa el modelo base Qwen2.5-0.5B-Instruct en la traduccion de peticiones en lenguaje natural a comandos de una unica herramienta de linea de comandos: git, ffmpeg e ImageMagick. El problema que resuelve es acotado pero practico: convertir frases como "deshaz mi ultimo commit pero conserva los cambios" en `git reset HEAD~1` sin necesidad de consultar documentacion.

Los tres adaptadores comparten un unico modelo base cuantizado (`qwen2.5-0.5b-instruct-q4_k_m.gguf`, 491 MB) y se distribuyen como ficheros GGUF de 5,9 MB cada uno (f16, rango 8, 16 capas). Esto permite cargar el base una sola vez y alternar entre adaptadores sin recargar, tanto en llama.cpp nativo como en navegador mediante wllama. La publicacion se realiza como releases firmadas en modelXare.

La relevancia del proyecto es fundamentalmente demostrativa: muestra como un modelo de 0,5 mil millones de parametros, mediante QLoRA ligero, puede superar ampliamente a su base en una tarea estrecha (por ejemplo, del 30% al 83% de exact match en git). No obstante, el alcance es limitado: solo ingles, una herramienta por adaptador y precisiones que en ffmpeg caen al 35% en exact match estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA sobre el base |
| Parametros totales | 2.932.736 (adaptador LoRA; el base Qwen2.5-0.5B-Instruct tiene ~0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct, no declarada en la model card) |
| Tipos de cuantizacion | LoRA en f16; base requerido en q4_K_M (GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptadores); base en GGUF q4_K_M |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 8 aplicado sobre 16 capas del modelo base Qwen2.5-0.5B-Instruct. El entrenamiento se realizo con QLoRA sobre `mlx-community/Qwen2.5-0.5B-Instruct-4bit` usando mlx-lm, con learning rate 1e-4, batch de 4, loss solo sobre la completion y early stopping sobre la loss de validacion. Posteriormente los pesos se convirtieron a formato PEFT y despues a GGUF mediante `convert_lora_to_gguf.py` de llama.cpp.

Los volumenes de datos varian por adaptador: git uso 4.592 filas generadas a partir de plantillas con pools de slots y ruido de tecleo, alcanzando una loss de validacion de 0,047. ffmpeg e ImageMagick usaron 2.504 y 2.505 filas respectivamente, generadas por un modelo de lenguaje mayor a partir de descripciones de tareas y verificadas por script; sus mejores checkpoints registraron losses de 0,169 (iteracion 300) y 0,100. El entrenamiento emplea una unica system prompt fija por adaptador y la plantilla de chat propia del base.

## Capacidades

- Traduccion de lenguaje natural a comandos CLI para tres herramientas: git, ffmpeg e ImageMagick.
- Generacion de comandos de una sola linea o secuencias cortas separadas por saltos de linea.
- Respuesta controlada `UNSUPPORTED` / `unsupported_request` en ffmpeg e ImageMagick cuando la peticion no es realizable con la herramienta.
- Ejecucion en navegador mediante wllama y en nativo con llama.cpp, compartiendo un unico base entre los tres adaptadores.
- Cambio entre adaptadores sin recargar el modelo base.
- No soporta tool calling generico, agentes multi-paso, vision, audio ni razonamiento general; su alcance es estrictamente la generacion de comandos de una herramienta por adaptador.

## Casos de uso

- Asistente de terminal para git: integrado en un shell o plugin de editor, traduce peticiones como "undo my last commit but keep the changes" en `git reset HEAD~1`, reduciendo consultas a la documentacion en operaciones habituales.
- Generacion de comandos ffmpeg para conversion de medios: permite a usuarios no expertos obtener lineas como `ffmpeg -i talk.mp4 -vn talk.mp3` para extraer audio, util en pipelines de procesamiento de video.
- Automatizacion de ImageMagick en flujos de imagenes: genera ordenes de redimensionado o miniaturas (`magick photo.jpg -thumbnail 200x output.jpg`) para scripts de publicacion de contenido.
- Herramienta educativa y de formacion: sirve para mostrar a desarrolladores noveles la sintaxis correcta de git, ffmpeg e ImageMagick a partir de descripciones en lenguaje natural.
- Demostracion de LoRA de bajo coste: caso de referencia para investigadores que quieran replicar el flujo QLoRA + mlx-lm + conversion a GGUF sobre un modelo de 0,5B.
- Despliegue en navegador con wllama: al ser adaptadores de 5,9 MB sobre un base de 491 MB, es viable ofrecer asistencia de comandos en una aplicacion web sin backend de inferencia.
- Prototipado de asistentes CLI especializados: plantilla para crear adaptadores analogos para otras herramientas (docker, kubectl, rsync) siguiendo el mismo esquema de datos y evaluacion.

## Benchmarks y rendimiento

Evaluacion sobre 211 peticiones retenidas por herramienta, decodificacion greedy, mediante llama.cpp nativo (node-llama-cpp) con el base q4_K_M. La columna intermedia acepta un nombre de fichero de salida distinto cuando la peticion no especifica ninguno.

| Adaptador | Exact match | Exact match (cualquier nombre de salida no especificado) | Base solo (exact, primeras 60 filas) |
|---|---|---|---|
| git | 83% | 86% | 30% |
| ImageMagick | 65% | 80% | 2% |
| ffmpeg | 35% | 68% | 0% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el base q4_K_M ocupa 491 MB en disco; la inferencia completa cabe holgadamente en menos de 1 GB de memoria, sumando los 5,9 MB del adaptador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo puede ejecutarse incluso en CPU. No se requieren A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos ~1 GB de VRAM libre (GTX 1050, RTX 3050, RTX 4090, integradas con suficiente memoria compartida).
- Opciones de despliegue: llama.cpp (`llama-cli` con `--lora`), node-llama-cpp, wllama en navegador. No se documenta soporte para vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wexare/command-loras (git/ffmpeg/ImageMagick) | LoRA ~2,9M sobre base 0,5B | no disponible | Generacion de comandos CLI especializada | Apache-2.0 | Hugging Face (GGUF) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Instrucciones generales | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | no disponible | Codigo general | Apache-2.0 | Hugging Face |

La comparacion directa con alternativas especializadas en generacion de comandos CLI no esta disponible en la informacion proporcionada. Frente a su base, los adaptadores mejoran el exact match de forma sustancial en las tres tareas evaluadas (git 30% a 83%, ImageMagick 2% a 65%, ffmpeg 0% a 35% en la muestra de 60 filas).

## Limitaciones y advertencias

- Los comandos son sugerencias: pueden ser erroneos y algunos (`git reset --hard`, `git push --force`, sobrescritura de ficheros de salida) destruyen datos. Deben revisarse antes de ejecutarse.
- Solo acepta peticiones en ingles; no hay soporte multilingue declarado.
- Un adaptador por herramienta: las peticiones que requieren varias herramientas quedan fuera de alcance.
- Casos debiles: flags inusuales, filtros y peticiones largas multi-paso, especialmente en ffmpeg (35% de exact match estricto).
- Fallos conocidos documentados: "discard my changes to README.md" produjo `git checkout -- . README.md`, que descarta cambios de todos los ficheros; las peticiones de recorte o GIF suelen generar flags de ffmpeg incorrectos.
- ImageMagick puede sobrescribir el fichero de entrada (`magick photo.jpg -rotate 90 photo.jpg`).
- Riesgo de alucinacion en flags o sintaxis no vistas en entrenamiento; los datasets de ffmpeg e ImageMagick fueron generados por otro modelo y solo verificados por script.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre comandos destructivos recae en el usuario.
- No se declaran sesgos especificos ni limites de contexto en la model card; el contexto efectivo depende del base Qwen2.5-0.5B-Instruct.

## Enlaces

- Hugging Face: https://huggingface.co/wexare/command-loras
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Base GGUF q4_K_M: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/blob/9217f5db79a29953eb74d5343926648285ec7e67/qwen2.5-0.5b-instruct-q4_k_m.gguf
- wllama: https://github.com/ngxson/wllama
- modelXare: https://modelxare.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
