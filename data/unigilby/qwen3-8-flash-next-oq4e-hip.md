# unigilby/Qwen3.8-Flash-Next-oQ4e-HIP

## Resumen

Qwen3.8-Flash-Next oQ4e-HIP es una cuantizacion de 4 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario unigilby. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado cuyo proposito es hacer viable la inferencia del modelo base en hardware de consumo mediante una cuantizacion mixta y una disposicion de tensores especifica (layout HIP) compatible con el motor nativo de TensorFold. El modelo base lo desarrolla el equipo Qwen (Alibaba) y se distribuye bajo la licencia comunitaria qwen-community-1.0.

El checkpoint ocupa 115,1 GB en el repositorio y declara 179.999.981.459 parametros totales en safetensors. La cuantizacion combina varios anchos de bit segun el tipo de tensor: las proyecciones densas (atencion, proyecciones de entrada de Gated DeltaNet, mezcladores de hiper-conexion y proyecciones clave/valor del n-gram) se guardan en 8 bits con grupo 64; las proyecciones de salida de DeltaNet en 5 bits con grupo 64; y los expertos enrutados y el experto compartido en 4 bits con grupo 32. La model card indica que el checkpoint pesa aproximadamente 107 GB incluyendo las tablas n-gram y la cabeza MTP.

Su relevancia actual es practica: demuestra que un modelo de gran tamano con arquitectura hibrida y mezcla de expertos puede ejecutarse en una iGPU con memoria unificada (AMD Strix Halo, 128 GB) manteniendo una calidad cercana al bf16 en tareas de codigo y matematicas. La model card reporta 42,0 tok/s en decodificacion de codigo y 36,2 tok/s en chat sobre un Ryzen AI MAX+ 395.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion, Gated DeltaNet, mezcladores de hiper-conexion y mezcla de expertos (MoE); incluye cabeza MTP y tablas n-gram |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (valor usado en la configuracion de benchmark `--context 131072`) |
| Tipos de cuantizacion | Mixta: 8 bits grupo 64 (proyecciones densas), 5 bits grupo 64 (salidas de DeltaNet), 4 bits grupo 32 (expertos enrutados y experto compartido); gates del experto compartido en 8 bits |
| Idiomas soportados | no disponible (la model card no detalla el conjunto de idiomas; el set de calibracion se denomina `oqe_code_multilingual`) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (libreria mlx; layout HIP para el motor de TensorFold) |

## Arquitectura y entrenamiento

El checkpoint no aporta entrenamiento propio: es una cuantizacion post-entrenamiento del modelo base Qwen/Qwen3.8-Flash-Next. La arquitectura del modelo base, segun los tensores descritos en la model card, combina capas de atencion con capas Gated DeltaNet, mezcladores de hiper-conexion, una mezcla de expertos con expertos enrutados y un experto compartido, ademas de una cabeza MTP (multi-token prediction) almacenada bajo `language_model.mtp.*` y tablas n-gram incluidas en el repositorio. No se especifican en la informacion disponible el numero de capas, la dimension oculta, el numero de expertos ni el volumen de tokens de entrenamiento del modelo base.

El proceso de cuantizacion se realizo con la herramienta de cuantizacion oQe de oMLX main (commit `e81d525`), usando una imatrix generada a partir del conjunto `oqe_code_multilingual` (128 muestras de 512 tokens). El predicado de cuantizacion se configuro para que cada tensor que el cargador HIP de TensorFold fusiona tenga un unico ancho de bit y un unico tamano de grupo, lo que evita mezclas dentro de un mismo stack fusionado. La innovacion tecnica destacable es la decodificacion especulativa mediante la cabeza MTP con 3 borradores, que en el benchmark alcanza 2,61 tokens por ronda de verificacion en codigo. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion del dataset de preentrenamiento.

## Capacidades

- Generacion de texto y razonamiento general, con evaluacion reportada en MMLU-Pro (69,1% en la variante oQ4e-HIP).
- Razonamiento matematico: 94,7% de exact match zero-shot en GSM8K (300 items).
- Generacion de codigo: 93,9% pass@1 en HumanEval (164 items).
- Decodificacion especulativa mediante cabeza MTP, con hasta 3 borradores por ronda de verificacion.
- Soporte de contexto largo: la configuracion de referencia usa 131.072 tokens.
- Capacidades multilingues: no disponible en detalle; el set de calibracion incluye material multilingue de codigo.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: la evaluacion de tareas se realizo con thinking desactivado, lo que implica que el modelo base dispone de ese modo, aunque no se detallan sus caracteristicas.
- Vision: la model card menciona `mlx-vlm` como herramienta de evaluacion, pero no se confirma que el checkpoint tenga capacidades de vision.

## Casos de uso

- Inferencia local en estaciones con iGPU de memoria unificada: el checkpoint esta disenado para el motor HIP nativo de TensorFold sobre gfx1151; en un Ryzen AI MAX+ 395 con 128 GB se obtienen 42,0 tok/s en codigo y 36,2 tok/s en chat, lo que permite usar el modelo de forma interactiva sin GPU dedicada.
- Asistencia de programacion en local: con 93,9% pass@1 en HumanEval y un consumo de 5,44 GiB por token decodificado, es adecuado para autocompletado y generacion de funciones en un entorno de desarrollo sin conexion.
- Resolucion de problemas matematicos paso a paso: el 94,7% en GSM8K zero-shot lo hace util para tutoria automatica o verificacion de calculos en pipelines de datos.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite resumir o extraer informacion de expedientes, contratos o bases de codigo extensas en una sola pasada.
- Evaluacion y comparacion de tecnicas de cuantizacion: al publicar metricas KL, perplejidad y acuerdo top-1 frente a bf16, sirve como referencia para investigar el impacto de esquemas mixtos de cuantizacion en modelos MoE hibridos.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse integramente en hardware local, evita enviar datos sensibles a APIs externas, algo relevante en sanidad, legal o administracion publica.
- Prototipado de decodificacion especulativa: la cabeza MTP incluida permite experimentar con tecnicas de aceleracion de inferencia sin reentrenar el modelo.

## Benchmarks y rendimiento

Calidad frente a bf16, medida como KL sobre el vocabulario completo (248.320 entradas), teacher-forced, en WikiText-2 raw test (prosa) y HumanEval prompt + solucion canonica (codigo), 31.728 tokens puntuados por porcion, solo cabeza principal:

| Checkpoint | KL medio prosa / codigo | Acuerdo top-1 prosa / codigo | Perplejidad prosa / codigo |
|---|---|---|---|
| bf16 (referencia) | - | - | 3,064 / 1,086 |
| oQ4e-HIP | 0,064 / 0,013 | 91,95% / 99,00% | 3,122 / 1,091 |
| oQ4e-mix5-HIP | 0,096 / 0,022 | 90,26% / 98,75% | 3,172 / 1,097 |
| TensorFold/Qwen3.8-Flash-Next-MLX-4bit-MTP (4 bits uniforme) | 0,401 / 0,204 | 78,74% / 93,50% | 4,005 / 1,285 |

Evaluacion de tareas mediante el servidor HIP nativo de TensorFold, greedy, thinking desactivado:

| Checkpoint | GSM8K (300, exact match) | HumanEval (164, pass@1) | MMLU-Pro (700, 50 por categoria) |
|---|---|---|---|
| oQ4e-HIP | 94,7% | 93,9% | 69,1% |
| oQ4e-mix5-HIP | 94,3% | 93,3% | 67,6% |
| 4 bits uniforme | 93,0% | 93,9% | 55,9% |

Rendimiento en AMD Ryzen AI MAX+ 395, Radeon 8060S gfx1151, 128 GB de memoria unificada, TensorFold HIP nativo, MTP con 3 borradores, `--parallel 1 --context 131072`:

| Checkpoint | Bytes leidos por token | Codigo / chat (tok/s) | Tokens MTP por ronda (codigo) |
|---|---|---|---|
| oQ4e-HIP | 5,44 GiB | 42,0 / 36,2 | 2,61 |
| oQ4e-mix5-HIP | 4,45 GiB | 51,3 / 41,4 | 3,05 |
| 4 bits uniforme | 4,00 GiB | 50,0 / 44,0 | no disponible |

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 115,1 GB y la model card cifra el checkpoint en aproximadamente 107 GB con tablas n-gram y cabeza MTP. Requiere memoria unificada o VRAM en ese orden de magnitud; no cabe en GPUs de consumo con 24 GB o menos.
- GPU recomendadas: el benchmark oficial usa una iGPU Radeon 8060S (gfx1151) con 128 GB de memoria unificada. Para GPUs dedicadas se necesitarian aceleradores con 96-141 GB de VRAM (H100 80 GB no seria suficiente para el checkpoint completo; H200 141 GB o MI300X si). No se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no, en su configuracion actual. Solo es viable en equipos con memoria unificada grande, como Strix Halo con 128 GB.
- Opciones de despliegue: motor HIP nativo de TensorFold (compilado con `zig build native-hip -Dhip-arch=gfx1151`) y libreria MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 42,0 tok/s en codigo y 36,2 tok/s en chat sobre Strix Halo; 5,44 GiB leidos por token decodificado; 2,61 tokens MTP por ronda de verificacion en codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K | HumanEval | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| oQ4e-HIP (este) | 180,0 B | 131.072 | Mixta 8/5/4 bits | 94,7% | 93,9% | 69,1% | qwen-community-1.0 | HuggingFace, 46 descargas |
| oQ4e-mix5-HIP | 180,0 B (mismo base) | 131.072 | Mixta, mas agresiva | 94,3% | 93,3% | 67,6% | qwen-community-1.0 | HuggingFace |
| TensorFold/Qwen3.8-Flash-Next-MLX-4bit-MTP | 180,0 B (mismo base) | no disponible | 4 bits uniforme | 93,0% | 93,9% | 55,9% | qwen-community-1.0 | HuggingFace |
| Qwen/Qwen3.8-Flash-Next (bf16) | 180,0 B | no disponible | bf16 | no disponible | no disponible | no disponible | qwen-community-1.0 | HuggingFace |

Las tres variantes cuantizadas derivan del mismo modelo base, por lo que la comparativa se centra en el compromiso calidad/velocidad. oQ4e-HIP ofrece la mayor calidad (KL de 0,064 en prosa y 0,013 en codigo), mientras que oQ4e-mix5-HIP gana aproximadamente un 22% de velocidad en decodificacion de codigo a costa de 0,032 puntos de KL adicionales en prosa y 4,3 puntos en MMLU-Pro.

## Limitaciones y advertencias

- Es una cuantizacion de 4 bits: aunque la degradacion frente a bf16 es baja (KL de 0,064 en prosa), existe una perdida medible de calidad, especialmente en prosa (91,95% de acuerdo top-1 frente al 99,00% en codigo).
- El checkpoint esta atado al layout HIP y al motor de TensorFold; no es portable a otros runtimes sin reconversion. La libreria declarada es mlx, lo que limita su uso a ese ecosistema.
- Licencia qwen-community-1.0: es una licencia "other" con terminos comunitarios de Qwen; conviene revisar el archivo LICENSE incluido antes de un uso comercial, ya que puede imponer restricciones adicionales.
- No se detallan los idiomas soportados ni el comportamiento multilingue fuera del material de codigo usado en la calibracion.
- No hay informacion sobre sesgos, alineacion, seguridad ni tasas de alucinacion del modelo base en la documentacion proporcionada.
- El modelo tiene 180.000 millones de parametros: no es desplegable en GPUs de consumo convencionales y exige infraestructura con memoria unificada o aceleradores de gran capacidad.
- El autor es un particular (unigilby), no el equipo oficial de Qwen; el soporte y las actualizaciones no estan garantizados.
- No se han publicado resultados en A100, H100 ni otras GPUs dedicadas; el rendimiento en esos entornos es desconocido.
- Las metricas de tareas se obtuvieron con thinking desactivado y decodificacion greedy, por lo que pueden diferir en configuraciones de produccion con sampling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unigilby/Qwen3.8-Flash-Next-oQ4e-HIP
- Variante mix5: https://huggingface.co/unigilby/Qwen3.8-Flash-Next-oQ4e-mix5-HIP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint de referencia de 4 bits uniforme: https://huggingface.co/TensorFold/Qwen3.8-Flash-Next-MLX-4bit-MTP
- Licencia: LICENSE incluido en el repositorio del modelo
- Paper, blog, repositorio de codigo y demo: no disponibles en la informacion proporcionada
