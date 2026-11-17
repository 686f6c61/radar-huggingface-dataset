# win10kimo/Gemma-4-12B-Gemini-3.5-FlashLite-Distill

## Resumen

Gemma-4-12B-Gemini-3.5-FlashLite-Distill es un ajuste fino experimental del modelo google/gemma-4-12B-it, publicado por el usuario win10kimo en Hugging Face. Se trata de un QLoRA (r=32, lora_alpha=64) entrenado sobre 5.990 trayectorias sinteticas destiladas del modelo profesor Gemini 3.5 Flash-Lite, orientado a tareas de scripting de linea de comandos y administracion basica de sistemas Windows y Linux. El modelo conserva la arquitectura nativa de Gemma 4, su formato de razonamiento `<|channel>thought` y la compatibilidad multimodal mediante proyector `mmproj`.

El interes del modelo reside en su especializacion: no busca competir en capacidades generales, sino ofrecer un modelo local de ~12.000 millones de parametros afinado para generar comandos de PowerShell, VBScript, Batch, bash, Git, SQL y sistemas de build, ademas de emitir llamadas de herramienta de shell en un solo turno. Se distribuye en formato GGUF con cuantizaciones Q5_K_M, Q4_K_M y Q3_K_S, pensadas para ejecutarse en LM Studio, Atomic Chat y llama.cpp sobre GPUs de consumo.

Con 683 descargas y una unica valoracion positiva en el momento de redactar esta ficha, se trata de un modelo de nicho, de autoria individual y con validacion limitada por parte de la comunidad. Su licencia Apache 2.0 y su tamano lo hacen accesible para experimentacion local, si bien su naturaleza experimental y su dataset sintetico acotado exigen cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), multimodal con proyector de vision |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, Q3_K_S (GGUF); LoRA en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (adaptadores LoRA), mmproj BF16 |
| Modelo base | google/gemma-4-12B-it |
| Modelo profesor | google/gemini-3.5-flash-lite |
| Metodo de ajuste | QLoRA (r=32, lora_alpha=64, dropout=0) |
| Parametros entrenables | 131,1 M (1,08 % del total) |
| Tamano del repositorio | 21,6 GB |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer decoder-only de aproximadamente 11,9 mil millones de parametros con capacidad multimodal nativa (entrada de imagen y texto). Sobre esa base se aplico un ajuste QLoRA en bfloat16 con rango 32 y alpha 64 sobre todas las proyecciones lineales de atencion y MLP, lo que supone 131,1 millones de parametros entrenables (el 1,08 % del total). El entrenamiento se ejecuto en una unica GPU NVIDIA L4 de 24 GB, con dos epocas (1.468 pasos), optimizador adamw_8bit, learning rate coseno de 2e-4 y tamano de lote efectivo de 8.

El dataset de destilacion consta de 5.990 trayectorias sinteticas de un solo turno generadas por Gemini 3.5 Flash-Lite: 4.941 soluciones directas de CLI y codigo, y 1.049 trayectorias con llamada de herramienta nativa `run_shell`. La composicion cubre PowerShell, Batch, VBScript, bash, Git, Docker, SQL (sqlite3/psql) y sistemas de build en C, C++, Rust, Python y Node. Se aplico enmascaramiento de perdida (`train_on_responses_only`), de modo que el calculo se restringe a las trazas de razonamiento, las entregas y la sintaxis de llamada de herramienta, sin penalizar los prompts del usuario. La perdida de validacion (split retenido del 2 %) descendio de 0,6751 en el paso 150 a 0,5904 en el paso 1.350, sin senales claras de sobreajuste en la tabla publicada.

## Capacidades

- Generacion de comandos y scripts de shell para PowerShell, CMD/Batch, VBScript (`.vbs`) y bash, incluyendo operaciones con `robocopy`, bucles `for /f`, comprobaciones de procesos y servicios, copias de seguridad y consultas basicas de WMI y registro.
- Llamada de herramienta nativa en formato `<|tool_call>call:run_shell{...}<tool_call|>` para inspeccion de ficheros y logs locales en un solo turno.
- Razonamiento explicito mediante el canal `<|channel>thought`, que expone la traza de pensamiento antes de la respuesta o de la llamada de herramienta.
- Soporte de herramientas CLI de desarrollo: Git, Docker, sqlite3/psql, make, cmake, pytest y npm.
- Capacidad multimodal de entrada (imagen y texto) heredada del modelo base, habilitada mediante el proyector `mmproj-gemma-4-12b-it-BF16.gguf`.
- Generacion de codigo en C, C++, Rust, Python y Node en el contexto de resolucion de problemas de build y tests.
- Capacidades multilingues: no disponible en la informacion proporcionada (los tags no detallan idiomas).

## Casos de uso

- Asistente de terminal para Windows: el modelo traduce peticiones en lenguaje natural a comandos de PowerShell o Batch listos para ejecutar, lo que resulta util para tecnicos y administradores que necesitan consultas rapidas de sistema, gestion de servicios o copias de seguridad con `robocopy`.
- Automatizacion de tareas de mantenimiento en Windows: generacion de scripts VBScript para comprobaciones de registro, ficheros y consultas WMI, un nicho poco cubierto por modelos generalistas.
- Agente CLI de un solo turno: gracias a su formato nativo de llamada `run_shell`, puede integrarse en un bucle de agente que inspecciona ficheros y logs antes de responder, adecuado para asistentes de diagnostico local.
- Soporte a desarrolladores en resolucion de errores de build: el ajuste incluye ejemplos de make, cmake, pytest y npm, por lo que puede proponer correcciones concretas ante fallos de compilacion o de tests en proyectos pequenos.
- Asistencia en administracion Linux basica: generacion de comandos bash, operaciones con Git y consultas a bases de datos SQLite o PostgreSQL desde la terminal.
- Despliegue local en estaciones de trabajo con GPU de consumo: al distribuirse en GGUF Q4_K_M (6,87 GB) y ejecutarse en LM Studio o llama.cpp, permite disponer de un asistente de scripting sin conexion ni envio de datos a la nube, relevante en entornos con requisitos de privacidad.
- Prototipado de pipelines de automatizacion con vision: la compatibilidad con `mmproj` permite procesar capturas de pantalla de terminales o interfaces para extraer informacion y proponer comandos, si bien esta capacidad no ha sido validada especificamente por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la progresion de perdida de entrenamiento y validacion, resumida a continuacion:

| Paso | Epoca | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 150 | 0,20 | 0,7088 | 0,6751 |
| 300 | 0,41 | 0,6582 | 0,6608 |
| 450 | 0,61 | 0,6282 | 0,6396 |
| 600 | 0,82 | 0,6309 | 0,6244 |
| 750 | 1,02 | 0,5093 | 0,6142 |
| 900 | 1,23 | 0,5069 | 0,6072 |
| 1050 | 1,43 | 0,4617 | 0,6047 |
| 1200 | 1,63 | 0,4845 | 0,5941 |
| 1350 | 1,84 | 0,4715 | 0,5904 |

No se proporcionan resultados en MMLU, HumanEval, GSM8K ni en evaluaciones especificas de tool calling o generacion de scripts.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GB con Q3_K_S, 7,5-8 GB con Q4_K_M y 8,5-9 GB con Q5_K_M, considerando el proyector de vision (167 MB) y el contexto.
- GPU recomendadas: NVIDIA L4 24 GB (la empleada en el entrenamiento), A100 o H100 para despliegues concurrentes; RTX 4090 o RTX 3090 para uso individual con margen amplio.
- Cabe en GPU de consumo: si. Q3_K_S esta pensado para GPUs de 6 GB de VRAM; Q4_K_M para el rango de 8-12 GB; Q5_K_M para 12 GB o mas. Como alternativa, puede ejecutarse en CPU con 32 GB o mas de RAM.
- Opciones de despliegue: llama.cpp, LM Studio, Atomic Chat y cualquier runtime compatible con GGUF. La model card no menciona soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible. La model card no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-Gemini-3.5-FlashLite-Distill | ~11,9 B | No disponible | Scripting CLI y administracion Windows/Linux, tool calling de shell | Apache 2.0 | GGUF + LoRA en Hugging Face |
| google/gemma-4-12B-it (base) | ~11,9 B | No disponible | Proposito general, multimodal | Apache 2.0 (segun modelo base) | Hugging Face |
| Codestral (Mistral AI) | ~22 B | 32 K (segun version publica) | Generacion de codigo multilingue | Licencia no comercial en versiones abiertas | Pesos abiertos |
| Qwen2.5-Coder-14B | ~14,7 B | 128 K (segun version publica) | Codigo y agentes de programacion | Apache 2.0 | Hugging Face |

La comparativa se limita a caracteristicas publicas conocidas; no se dispone de resultados de benchmarks del modelo de win10kimo que permitan una comparacion cuantitativa con estas alternativas. El modelo destaca por su especializacion en scripting de Windows (PowerShell, VBScript, Batch), un nicho que los modelos generalistas y los orientados a codigo cubren de forma menos especifica.

## Limitaciones y advertencias

- Modelo experimental de autoria individual, con un unico "like" y 683 descargas: no ha sido validado de forma independiente ni sometido a evaluaciones de calidad publicas.
- Dataset sintetico y de un solo turno: no se ha entrenado para conversaciones multi-turno ni para razonamiento agentico de varios pasos, pese a los tags del repositorio.
- El autor advierte que las cuantizaciones de 3 bits (Q3_K_S) pueden introducir errores de sintaxis en scripts largos; recomienda Q4_K_M con el modo de razonamiento activado.
- Riesgo de alucinacion en comandos y rutas: al ser un ajuste pequeno sobre datos destilados de un modelo Flash-Lite, puede generar opciones de linea de comandos inexistentes o rutas incorrectas, especialmente fuera de los dominios cubiertos.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgos, toxicidad o robustez.
- Idiomas soportados: no disponible; el dataset de entrenamiento parece centrado en ingles tecnico, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto: no disponible; debe consultarse la ficha del modelo base google/gemma-4-12B-it.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos destilados de Gemini 3.5 Flash-Lite, ya que la destilacion de salidas de un modelo propietario puede estar sujeta a los terminos de servicio del proveedor.
- Para produccion se recomienda evaluacion propia en el dominio objetivo (scripts de Windows y Linux) antes de automatizar la ejecucion de comandos generados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/win10kimo/Gemma-4-12B-Gemini-3.5-FlashLite-Distill
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Version del modelo base usada en el entrenamiento: https://huggingface.co/unsloth/gemma-4-12b-it
- Unsloth (framework de ajuste): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales.
