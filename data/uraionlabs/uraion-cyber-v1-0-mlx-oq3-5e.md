# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3.5e

## Resumen

Uraion Cyber V1.0 MLX oQ3.5e es una cuantizacion de 3,5 bits del modelo Uraion Cyber V1.0, un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, desarrollado por Uraion Labs. El modelo original esta especializado en seguridad defensiva y tareas de agente: deteccion de vulnerabilidades, auditoria de codigo, generacion de parches y validacion de codigo correcto. Esta version concreta ha sido producida con oMLX 0.7.4.dev1 y su cuantizacion mejorada con matriz de importancia (imatrix), y esta empaquetada en formato MLX safetensors para ejecucion nativa en Apple Silicon (Metal).

La relevancia de esta variante esta en el compromiso entre tamano y fidelidad: los pesos ocupan 18,75 GB, lo que permite cargar un modelo de 35B en equipos Apple Silicon de gama alta con memoria unificada de 32 GB o superior, a costa de una perdida de calidad respecto a los pesos BF16 del modelo padre. Conserva el tokenizador, la plantilla de chat, la torre de vision y los pesos MTP del checkpoint original, y mantiene la licencia MIT del modelo base.

Arquitectonicamente hereda la estructura Qwen3.5 MoE (tag `qwen3_5_moe`), con 256 expertos, 8 enrutados por token y una ventana de contexto arquitectonica de 262.144 tokens. La ficha del autor advierte explicitamente de que ese limite es arquitectonico y no una garantia de memoria: el contexto usable real depende de la memoria unificada disponible y de la configuracion del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5 MoE; 256 expertos, 8 enrutados por token) |
| Parametros totales | 35.951.822.704 (~35,9B) |
| Parametros activos | ~3B por token (variante 35B-A3B) |
| Longitud de contexto | 262.144 tokens (limite arquitectonico; el contexto usable depende de la memoria) |
| Tipos de cuantizacion | oQ3.5e (3,5 bits con precision mixta e imatrix); la familia incluye tambien oQ2, oQ3, oQ4e, oQ5e, oQ6e y oQ8e |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (18,75 GB de pesos; repo de 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 256 expertos y 8 activos por token, sobre una base Qwen3.5 MoE. La variante aqui descrita no introduce cambios arquitectonicos: es una cuantizacion del checkpoint Uraion Cyber V1.0 (BF16) realizada con oMLX 0.7.4.dev1, usando cuantizacion mejorada con matriz de importancia (oQe imatrix) y precision mixta en los niveles fraccionarios, en lugar de un ancho de bits fraccionario uniforme. Se preservan el tokenizador, la plantilla de chat, la torre de vision y los pesos MTP (multi-token prediction) si estaban presentes en el checkpoint fuente.

La model card no detalla la composicion del dataset de entrenamiento, el volumen de tokens, ni si se aplicaron fases de RLHF o DPO en el modelo padre; esa informacion remite a la ficha del modelo BF16 original. Si se documenta el proceso de cuantizacion y validacion: el repositorio incluye `quantization_info.json`, `oq_imatrix_report.json`, `smoke_test.json` y `SHA256SUMS` para verificar integridad y trazabilidad. El modelo esta orientado a seguridad defensiva, con soporte de razonamiento en modo thinking y de tool calling, y con la capacidad declarada de reconocer codigo correcto cuando no hay fallo, algo que el autor mide explicitamente en sus evaluaciones.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable o desactivable mediante `chat_template_kwargs.enable_thinking`.
- Codigo: auditoria, analisis de vulnerabilidades, generacion de parches y revision de correcciones.
- Seguridad defensiva: deteccion de fallos explotables, prueba de explotacion en sandbox y validacion de codigo sin defectos.
- Tool calling y function calling (evaluado con BFCL en el modelo padre).
- Flujos de agente y razonamiento multi-paso (episodios de agente evaluados en el modelo padre).
- Capacidades multimodales de entrada imagen-texto: pipeline `image-text-to-text` y torre de vision conservada en esta cuantizacion.
- Seguimiento de instrucciones estrictas (evaluado con IFEval en el modelo padre).
- Multilingue limitado: la model card declara unicamente ingles.

## Casos de uso

- Auditoria de codigo en local: cargar el modelo con oMLX y pasar ficheros de servicio completos para que identifique funciones vulnerables y proponga la peticion que demuestra el fallo, sin enviar codigo propietario a servicios externos.
- Triaje de hallazgos de SAST: usar el modelo para discriminar entre falsos positivos y vulnerabilidades reales, aprovechando su capacidad medida de reportar codigo correcto como correcto.
- Generacion de parches en pipelines de CI: integrar el endpoint compatible con OpenAI que expone oMLX para producir y validar parches sobre hallazgos del analisis estatico antes de la revision humana.
- Agente de respuesta a incidentes: encadenar tool calls (lectura de logs, consulta de repositorio, ejecucion en sandbox) en episodios multi-paso para reproducir y contener un incidente.
- Revision de codigo asistida en equipos con Apple Silicon: el peso de 18,75 GB permite ejecutar el modelo en estaciones de trabajo Mac con memoria unificada alta, sin GPU dedicada.
- Analisis de capturas y diagramas: al conservar la torre de vision, puede procesar imagenes junto con texto, por ejemplo diagramas de arquitectura o capturas de paneles para tareas de revision.
- Formacion y concienciacion en AppSec: generar explicaciones de clases de vulnerabilidad y contraejemplos de codigo seguro con razonamiento visible en modo thinking.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo padre BF16 servido con vLLM 0.33.0 (cuantizacion FP8 de pesos al cargar) y, segun el autor, **no fueron medidos sobre esta build MLX**. Se reproducen como referencia, advirtiendo que las cuantizaciones de 2 y 3 bits intercambian calidad por menor huella de memoria.

| Check (modelo padre en vLLM) | Uraion Cyber V1.0 | Qwen3.6-35B-A3B | Uraion Cyber preview |
|---|---:|---:|---:|
| Tareas de seguridad held-out, respuesta unica (758) | 681 (89,8%) | 603 (79,6%) | 610 (80,5%) |
| Tareas de seguridad de confirmacion nuevas (387) | 352 (91,0%) | 309 (79,8%) | — |
| Episodios de agente held-out (200) | 190 (95,0%) | 175 (87,5%) | 164 (83,2%) |
| Episodios de agente nuevos (200) | 191 (95,5%) | 172 (86,0%) | — |
| Codigo correcto reportado como correcto (122) | 92 (75,4%) | 55 (45,1%) | 59 (48,4%) |
| IFEval prompt · strict (541) | 425 (78,6%) | 390 (72,1%) | 441 (81,5%) |
| BFCL (400) | 368 (92,0%) | 364 (91,0%) | 358 (89,5%) |
| HumanEval+ (164) | 149 (90,9%) | 148 (90,2%) | 148 (90,2%) |
| Peticiones daninas rechazadas (30) | 30 | 30 | 30 |

No se han publicado resultados de benchmarks medidos sobre esta cuantizacion oQ3.5e en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 18,75 GB solo de pesos; hay que sumar memoria unificada para runtime, activaciones y cache KV. En la practica, un equipo con 32 GB de memoria unificada es el minimo razonable para contextos moderados; contextos largos exigen 48-64 GB o mas.
- GPU: exclusivamente Apple Silicon con Metal (series M1/M2/M3/M4 y variantes Pro, Max y Ultra). No hay soporte CUDA en esta build.
- Cabe en GPU de consumo: si, en Mac con memoria unificada suficiente; no esta pensado para GPUs NVIDIA de consumo por el formato MLX.
- Despliegue: oMLX (`omlx serve`) o un runtime mlx-vlm compatible con Qwen3.5 MoE. Expone una API compatible con OpenAI en `/v1`.
- Parametros de muestreo sugeridos por el autor: `temperature=1.0`, `top_p=0.95`, `top_k=20`, `max_tokens=16384`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 MLX oQ3.5e (este) | 35,9B totales, ~3B activos | 262.144 (arquitectonico) | MLX safetensors / oMLX, mlx-vlm | MIT | Especializado en seguridad defensiva; solo Apple Silicon |
| Uraion Cyber V1.0 (BF16) | 35,9B totales, ~3B activos | 262.144 | Safetensors / vLLM | MIT | Modelo padre, maxima fidelidad; requiere hardware de servidor |
| Qwen3.6-35B-A3B | 35B clase A3B | No disponible | No disponible | No disponible | Referencia de comparacion en los benchmarks del autor; peor en tareas de seguridad y en deteccion de codigo correcto |
| Uraion Cyber preview | No disponible | No disponible | No disponible | No disponible | Version previa del mismo linaje, con resultados inferiores en tareas de seguridad |

## Limitaciones y advertencias

- La cuantizacion a 3,5 bits degrada la calidad respecto al BF16; los benchmarks publicados no se midieron sobre esta build, por lo que el rendimiento real puede ser inferior.
- El limite de 262.144 tokens es arquitectonico, no una garantia de memoria; contextos largos pueden agotar la memoria unificada.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion en analisis de seguridad: puede inventar vulnerabilidades o rutas de explotacion no reales; toda salida debe validarse en sandbox.
- La deteccion de codigo correcto como correcto es imperfecta incluso en el modelo padre (75,4%), lo que implica falsos positivos en auditorias.
- Dependencia de plataforma: sin soporte CUDA; no desplegable en infraestructura NVIDIA estandar con este formato.
- El modelo esta orientado a seguridad defensiva; no se documentan evaluaciones de uso ofensivo ni salvaguardas especificas mas alla del rechazo de peticiones daninas en el conjunto de prueba del autor (30 casos).
- Licencia MIT: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y la atribucion del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3.5e
- Modelo padre BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3.5e/blob/main/LICENSE
- Informe de cuantizacion imatrix: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3.5e/blob/main/oq_imatrix_report.json
- Web de Uraion Labs: https://uraionlabs.com/
