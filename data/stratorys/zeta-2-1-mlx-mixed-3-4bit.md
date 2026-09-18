# stratorys/zeta-2.1-mlx-mixed-3-4bit

## Resumen

Zeta 2.1 MLX Mixed 3/4-bit es una cuantizacion del modelo `zed-industries/zeta-2.1`, publicada por el usuario `stratorys`. No se trata de un modelo entrenado desde cero, sino de una conversion cuantizada de forma independiente (no oficial) del modelo de prediccion de ediciones de codigo de Zed Industries, cuyo modelo base a su vez es `ByteDance-Seed/Seed-Coder-8B-Base`. El objetivo declarado es reducir el tamano del modelo, el ancho de banda de memoria y el coste de inferencia, preservando en lo posible la calidad de prediccion de ediciones, para su uso local en Apple Silicon.

El repositorio contiene 8.250.462.208 parametros (aproximadamente 8,25 mil millones) en un espacio de 4,3 GB, gracias a una cuantizacion mixta de 3 y 4 bits en formato MLX. La model card indica que fue probado en un Apple M4 Pro con 24 GB de memoria unificada, usando MLX-LM como servidor y el editor Zed como cliente, con una API compatible con OpenAI.

Su relevancia es practica: permite ejecutar de forma local y offline un modelo especializado en prediccion de ediciones de codigo sobre hardware de consumo de Apple, sin enviar codigo a servicios externos. La licencia del modelo original es Apache 2.0. No es un modelo de proposito general: la propia model card advierte que esta especializado en prediccion de ediciones y no esta pensado como chat ni como modelo de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (el repositorio incluye el tag `llama`; no se detalla en la model card) |
| Parametros totales | 8.250.462.208 (aproximadamente 8,25 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX mixta 3 bits / 4 bits (este repositorio); no se detallan otras variantes |
| Idiomas soportados | Ingles (`en`), segun los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo original. Los metadatos del repositorio incluyen el tag `llama`, lo que apunta a un transformer decoder-only de tipo Llama, y el modelo base declarado es `ByteDance-Seed/Seed-Coder-8B-Base`, un modelo de codigo de 8B de ByteDance. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

Respecto a esta conversion concreta, la model card es explicita: se trata de una cuantizacion mixta de 3 y 4 bits en formato MLX y no se realizo ningun ajuste fino adicional. La innovacion tecnica relevante es precisamente la asignacion mixta de precision (3 o 4 bits segun la capa o el tensor), orientada a minimizar el impacto en la calidad de prediccion de ediciones frente a una cuantizacion uniforme. El modelo se sirve mediante MLX-LM con `prefill-step-size` configurable a 1024, pensado para el prellenado de archivos de codigo largos en el flujo de prediccion de ediciones.

## Capacidades

- Prediccion de la siguiente edicion de codigo (`edit-prediction`, `next-edit-suggestion`): su tarea principal, orientada a sugerir modificaciones sobre el codigo existente en lugar de completar texto generico.
- Autocompletado y sugerencias inline dentro del editor Zed, integrado mediante una API compatible con OpenAI.
- Generacion de texto en ingles en el pipeline `text-generation`.
- Inferencia local en Apple Silicon mediante MLX y MLX-LM.
- Ejecucion offline una vez cacheado el modelo, con `HF_HUB_OFFLINE=1`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito.
- No se documenta capacidad multilingue: el unico idioma declarado es el ingles.

## Casos de uso

- Prediccion de ediciones en Zed: el caso de uso oficial. Se configura en `settings.json` con `provider: open_ai_compatible_api`, `mode: eager` y `prompt_format: zeta2_1`, apuntando al servidor local en `127.0.0.1:9090`. El modelo propone la siguiente edicion mientras se escribe, con `max_output_tokens` de 128 y un `prediction_debounce` de 200 ms.
- Desarrollo con codigo confidencial: al ejecutarse integramente en local sobre un Apple M4 Pro de 24 GB, el codigo fuente nunca sale de la maquina, lo que permite usarlo en proyectos con restricciones de confidencialidad o cumplimiento.
- Trabajo offline o en entornos air-gapped: con `HF_HUB_OFFLINE=1` el modelo funciona sin conexion una vez descargado, util en portatiles sin red estable o en instalaciones aisladas.
- Servidor de prediccion compartido en un equipo pequeno: `mlx_lm.server` expone una API compatible con OpenAI en un host y puerto configurables, de modo que varios desarrolladores pueden apuntar sus clientes a una misma maquina Apple Silicon.
- Refactorizaciones y cambios repetitivos de varias lineas: el modo `eager` con prellenado de 1024 tokens permite que el modelo vea suficiente contexto del archivo para proponer ediciones coherentes en bloques de codigo, no solo en la linea inmediata.
- Evaluacion de tecnicas de cuantizacion mixta: para investigadores interesados en medir la perdida de calidad de una cuantizacion 3/4 bits mixta en MLX frente al modelo original, en una tarea concreta y medible como la prediccion de ediciones.
- Integracion en flujos de asistencia a la programacion sobre macOS: cualquier cliente que hable el formato de prompt `zeta2_1` y consuma un endpoint compatible con OpenAI puede reutilizar este modelo sin depender del editor Zed.
- Demostraciones y docencia: por su tamano contenido (4,3 GB) y su licencia Apache 2.0, sirve para montar talleres o demos de prediccion de ediciones local en portatiles Apple recientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 4,3 GB, por lo que la inferencia en 3/4 bits mixtos requiere del orden de 4,3 GB solo para los pesos, mas el overhead de la cache KV y del runtime de MLX.
- Hardware validado por el autor: Apple M4 Pro con 24 GB de memoria unificada.
- Compatibilidad: al estar en formato MLX, esta pensado para Apple Silicon (familias M). No se indica compatibilidad con GPUs NVIDIA o AMD en este repositorio.
- GPU de consumo: no aplica en el sentido habitual; el equivalente es memoria unificada de un Mac. Con 4,3 GB de pesos, un Mac con 16 GB de memoria unificada deberia poder alojarlo, aunque el autor solo confirma el caso de 24 GB.
- Opciones de despliegue: MLX-LM mediante `mlx_lm.server` (con `uv tool install mlx-lm`). Se mencionan en los tags `text-generation-inference` y `transformers`, pero el flujo documentado es exclusivamente MLX-LM.
- Configuracion de servidor recomendada: `--host 127.0.0.1 --port 9090 --prefill-step-size 1024`.
- Latencia y throughput: no disponibles. La unica referencia temporal es el `prediction_debounce` de 200 ms y el limite de 128 tokens de salida por prediccion, que son parametros de cliente, no mediciones de rendimiento del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stratorys/zeta-2.1-mlx-mixed-3-4bit | 8,25 B | Safetensors MLX, 3/4 bits mixtos | No disponible | Apache 2.0 | HuggingFace, 4,3 GB |
| zed-industries/zeta-2.1 | No disponible (presumiblemente 8B, mismo linaje) | No disponible en la informacion proporcionada | No disponible | Apache 2.0 | HuggingFace |
| ByteDance-Seed/Seed-Coder-8B-Base | 8 B (segun la denominacion del modelo) | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la informacion proporcionada, por lo que no es posible compararlos por benchmarks. La diferencia principal entre este repositorio y el modelo original de Zed es el formato y la cuantizacion: esta version esta optimizada para Apple Silicon y ocupa 4,3 GB, a costa de una posible perdida de calidad.

## Limitaciones y advertencias

- La cuantizacion puede reducir ligeramente la calidad de prediccion respecto al modelo original; el propio autor lo advierte.
- Las ediciones generadas pueden ser incorrectas o no compilar, y deben revisarse antes de usarse.
- Zeta 2.1 esta especializado en prediccion de ediciones y no esta pensado como modelo de chat de proposito general ni como modelo de agentes.
- No se documenta soporte de tool calling ni de razonamiento multi-paso, por lo que no es adecuado para flujos de agente.
- Idioma unico declarado: ingles. No hay garantias de comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no disponible; no se puede asumir una ventana concreta para archivos muy grandes.
- Dependencia de plataforma: el formato MLX limita su uso a Apple Silicon, lo que excluye servidores con GPUs NVIDIA o AMD sin una conversion adicional.
- Esta es una conversion independiente y no oficial: no cuenta con el respaldo de Zed Industries.
- Licencia Apache 2.0, que permite uso comercial, pero exige conservar los avisos de atribucion. La model card remite al repositorio del modelo original para los requisitos autoritativos de licencia y atribucion.
- Riesgo de sesgos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos especificos. Al derivar de un modelo entrenado con codigo, hereda los sesgos y limitaciones de ese corpus.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en el contexto de edicion de codigo, se manifiesta como sugerencias plausibles pero incorrectas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de la perdida de calidad introducida por la cuantizacion 3/4 bits.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/stratorys/zeta-2.1-mlx-mixed-3-4bit
- Modelo base original: https://huggingface.co/zed-industries/zeta-2.1
- Modelo base upstream: https://huggingface.co/ByteDance-Seed/Seed-Coder-8B-Base
- MLX-LM (libreria de inferencia): no se proporciona enlace en la informacion disponible
