# tennr1/Qwopus3.8-27B-Coder-Flash-oQ6e-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-oQ6e-mtp es una cuantizacion de precision mixta, publicada por el usuario tennr1, de un modelo de la familia Qwen 3.5 orientado a generacion de codigo ("Coder-Flash"). El checkpoint original no lo desarrolla tennr1: este autor unicamente aplica la herramienta oQ (oMLX v0.7.3) sobre los pesos base y publica el resultado en formato MLX, pensado para ejecucion en Apple Silicon. El modelo cuenta con 27.781.427.952 parametros totales y un tamano de repositorio de 23,9 GB.

La particularidad tecnica de esta version es la distribucion de precision: el 88,345 % de los pesos logicos (24.543B) se almacena en affine 6-bit con grupo de 64, el 9,798 % (2.722B) en affine 8-bit y el 1,857 % (0.516B) se mantiene en BF16, lo que da una media efectiva de 6,872 bits por peso. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (26.896B), un modulo de vision (0.461B) y una cabeza MTP (multi-token prediction, 0.425B) de 0.425B parametros.

Es relevante ahora porque permite ejecutar un modelo de ~27B con capacidades multimodales y decodificacion especulativa (via MTP) en hardware Apple con un peso en disco de 22,2 GiB, algo que en BF16 requeriria aproximadamente el triple de memoria. La contrapartida es que la informacion publicada es muy escasa: no hay model card del modelo base, ni benchmarks, ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), con modulo de vision y cabeza MTP; pesos en formato MLX |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 6-bit grupo 64 (24.543B), affine 8-bit grupo 64 (2.722B), BF16 (0.516B); media efectiva 6,872 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 22,226 GiB en total |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Por los metadatos se deduce que se trata de un transformer de la familia Qwen 3.5 con tres bloques: un modelo de lenguaje de 26.896B parametros, un encoder o torre de vision de 0.461B y una cabeza MTP de 0.425B. La presencia de la cabeza MTP sugiere soporte de prediccion multi-token, una tecnica de decodificacion especulativa que permite proponer varios tokens por paso y verificarlos en paralelo, con el consiguiente aumento de throughput en inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o post-entrenamiento similar. El proceso documentado es exclusivamente de cuantizacion: oMLX v0.7.3 aplica precision mixta asignando 6 bits a la mayoria de tensores y preservando en 8 bits o BF16 una fraccion pequena (11,7 % de los pesos logicos) que presumiblemente corresponde a capas sensibles (embeddings, normalizaciones o cabezas de atencion). No hay detalle publicado sobre los criterios de asignacion de bits.

## Capacidades

- Generacion de texto y codigo: el sufijo "Coder" del nombre indica especializacion en tareas de programacion, aunque no se documenta el alcance exacto.
- Vision: el checkpoint incluye un modulo de vision de 0.461B parametros, por lo que cabe esperar entrada de imagenes, si bien no se detalla la tarea (VQA, OCR, comprension de diagramas).
- Decodificacion especulativa: la cabeza MTP de 0.425B habilita prediccion multi-token para acelerar la generacion.
- Razonamiento multi-paso: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistencia de programacion en local sobre Mac: el checkpoint en MLX con 22,2 GiB permite cargar un modelo de ~27B en un Mac con 32 GB o 64 GB de memoria unificada, sin GPU dedicada, para autocompletado y generacion de codigo en el editor.
- Revision de codigo en pipelines de CI: al ejecutarse en hardware Apple dentro de la propia infraestructura, puede integrarse en un runner macOS para analizar diffs y generar comentarios sin enviar codigo a servicios externos.
- Analisis de capturas y diagramas tecnicos: el modulo de vision permite pasar imagenes de esquemas de arquitectura o errores de compilacion en pantalla y obtener una explicacion textual junto al codigo relevante.
- Prototipado offline en portatil: con 23,9 GB de repositorio, el modelo cabe en un SSD portatil y puede desplegarse en un MacBook para tareas de generacion de codigo sin conexion, util en entornos con requisitos de confidencialidad.
- Generacion acelerada por MTP en servicios interactivos: la cabeza de prediccion multi-token reduce la latencia por token en decodificacion autoregresiva, adecuada para asistentes de chat con respuesta en streaming.
- Experimentacion con cuantizacion mixta: sirve como referencia para evaluar el impacto de oQ a 6,872 bits medios frente a alternativas de 4 u 8 bits en la misma familia de modelos.
- Evaluacion de modelos multimodales en Apple Silicon: util para investigadores que necesitan medir el rendimiento de un modelo con vision y MTP bajo el stack MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta la distribucion de bits y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~22,2 GiB para los pesos; con overhead de KV cache y runtime, se recomienda un minimo de 32 GB de memoria unificada y 48-64 GB para contextos largos.
- GPU recomendadas: hardware Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra) por el uso de la libreria MLX. No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en Mac con memoria unificada suficiente; no en GPUs NVIDIA de 24 GB sin conversion previa de formato.
- Opciones de despliegue: MLX y mlx-lm son el stack natural; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-oQ6e-mtp | 27,781B | no disponible | 6,872 bits medios (oQ) | no disponible | MLX safetensors |
| Modelo base Qwen 3.5 Coder-Flash (sin cuantizar) | ~27,8B (inferido) | no disponible | BF16 | no disponible | no disponible |
| Otras cuantizaciones de la misma familia | no disponible | no disponible | 4-bit / 8-bit tipicas | no disponible | GGUF / MLX |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- La cuantizacion a 6,872 bits medios introduce perdida de precision respecto al modelo original; no se publican evaluaciones del degradado.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que consultar la licencia del modelo base Qwen 3.5 antes de cualquier despliegue en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos.
- El checkpoint esta atado a MLX: no es portable a CUDA, vLLM o llama.cpp sin conversion y re-cuantizacion.
- La model card advierte de que se re-cuantizo el 2026-11-01 y pide descargar de nuevo copias anteriores; conviene verificar el hash de los ficheros.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; el autor no es el desarrollador original del modelo.
- El modulo MTP requiere soporte especifico en el runtime; si el motor de inferencia no lo implementa, la cabeza queda sin uso y se pierde la aceleracion.
- No se documenta la longitud de contexto efectiva, dato critico para planificar despliegues con prompts largos.

## Enlaces

- Hugging Face: https://huggingface.co/tennr1/Qwopus3.8-27B-Coder-Flash-oQ6e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
