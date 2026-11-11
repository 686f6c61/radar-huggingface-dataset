# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3e

## Resumen

Uraion Cyber V1.0 MLX oQ3e es una cuantizacion en 3 bits del modelo Uraion Cyber V1.0, desarrollado por Uraion Labs, empaquetada en formato MLX para su ejecucion en Apple Silicon. El modelo base es un mixto de expertos (MoE) de aproximadamente 35.000 millones de parametros totales con unos 3.000 millones activos por token, distribuidos en 256 expertos con 8 enrutados por token, y una longitud de contexto arquitectonica de 262.144 tokens. Esta version concreta esta pensada para inferencia local en Macs con memoria unificada, empleando la cuantizacion mejorada con matriz de importancia (imatrix) de oMLX 0.7.4.dev1.

El modelo esta especializado en seguridad defensiva y tareas de agente: deteccion de vulnerabilidades, auditoria de codigo, generacion de parches y reconocimiento de codigo correcto cuando no hay fallo. Ademas conserva capacidades generales de razonamiento, generacion de codigo, tool calling y vision, ya que mantiene la torre visual del checkpoint original. La relevancia actual reside en ofrecer un modelo de seguridad de 35B en un formato de 17,88 GB ejecutable en hardware de consumo de Apple, algo que las versiones en BF16 o FP8 no permiten con facilidad.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue publicado el 11 de noviembre de 2026. La licencia es MIT, lo que facilita su uso comercial, aunque el autor remite a la model card del modelo padre para la documentacion completa de evaluacion, limites y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5 MoE), con torre de vision y pesos MTP conservados si existen en el checkpoint origen |
| Parametros totales | 35.951.822.704 (~35B) |
| Parametros activos | ~3B por token (256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262.144 tokens (limite arquitectonico, no garantia de memoria) |
| Tipos de cuantizacion | oQ3e (3 bits, precision mixta con imatrix mejorada de oMLX); la familia incluye oQ2, oQ3, oQ4e, oQ5e, oQ6e y oQ8e |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (17,88 GB de pesos) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos con 35B parametros totales y aproximadamente 3B activos por token, sobre una arquitectura identificada en los tags como `qwen3_5_moe` y asociada a la familia Qwen3.5/Qwen3.6. Emplea 256 expertos con 8 enrutados por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. La longitud de contexto arquitectonica es de 262.144 tokens. Esta version MLX es una cuantizacion del checkpoint BF16 `UraionLabs/Uraion-Cyber-V1.0` (revision `9dc2328e75813ecfcb8d5e402ffe99a3ce28aaf`), generada localmente con oMLX 0.7.4.dev1 mediante cuantizacion con matriz de importancia mejorada. Se preservan el tokenizador, la plantilla de chat, la torre de vision y los pesos MTP si estaban presentes en el origen.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo padre. La model card remite a la del modelo BF16 para la metodologia completa de evaluacion. La innovacion tecnica destacable de esta publicacion es la propia cuantizacion oQe con imatrix, que usa precision mixta en lugar de un ancho de bits fraccionario uniforme, y la retencion de la torre visual y de los pesos MTP en un build de 3 bits.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) activable o desactivable mediante `chat_template_kwargs`.
- Deteccion de vulnerabilidades y auditoria de codigo en tareas de seguridad defensiva.
- Generacion de parches y propuestas de correccion tras identificar un fallo.
- Distincion de codigo correcto: el modelo puede declarar que un codigo es solido cuando no hay vulnerabilidad, capacidad medida en el benchmark del modelo padre.
- Tool calling y function calling, con soporte de BFCL segun los resultados del modelo padre.
- Comportamiento agentico y razonamiento multi-paso (episodios de agente evaluados en el modelo padre).
- Generacion de codigo general (HumanEval+ evaluado en el modelo padre).
- Capacidades de vision e imagen-texto-a-texto, al conservarse la torre visual (pipeline `image-text-to-text`).
- Soporte multilingue limitado al ingles.
- Cumplimiento de instrucciones (IFEval evaluado en el modelo padre).
- Rechazo de peticiones daninas (30 de 30 en la evaluacion del modelo padre).

## Casos de uso

- Auditoria de seguridad de servicios en local: el modelo recibe el codigo fuente de un servicio y devuelve si existe un fallo explotable, la funcion afectada y una peticion que lo demuestre, o confirma que el codigo es solido. Es adecuado por su entrenamiento especifico en seguridad defensiva y su contexto de 262.144 tokens, que permite analizar archivos completos.
- Revision de codigo en pipelines de CI/CD: integrado via API compatible con OpenAI que expone oMLX, puede analizar diffs o ficheros modificados y generar parches automaticos antes de fusionar cambios.
- Asistente de AppSec para desarrolladores: conversaciones multi-turno donde el modelo explica una vulnerabilidad, propone mitigaciones y valida el parche generado, usando el modo thinking para razonamiento profundo.
- Agente autonomo de triaje de vulnerabilidades: con tool calling y comportamiento agentico, puede encadenar pasos de lectura de repositorio, ejecucion en sandbox y generacion de informe, como reflejan los episodios de agente evaluados en el modelo padre.
- Analisis de capturas o diagramas de arquitectura: al conservar la torre visual, puede procesar imagenes junto a texto, por ejemplo diagramas de red o capturas de paneles para tareas de reconocimiento.
- Despliegue local en estaciones de trabajo Apple Silicon: con 17,88 GB de pesos, cabe en Macs con memoria unificada alta y permite trabajar con codigo sensible sin enviarlo a servicios en la nube, algo relevante en entornos de seguridad.
- Generacion y revision de codigo general en equipos que ya usan MLX: sirve como modelo unico para tareas de codigo, razonamiento y seguridad en un flujo local.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo padre BF16 servido con vLLM 0.33.0 (cuantizacion FP8 en carga) y no fueron medidos sobre este build MLX. Se reproducen como referencia, tal como indica el autor.

| Prueba (modelo padre en vLLM) | Uraion Cyber V1.0 (padre) | Qwen3.6-35B-A3B | Uraion Cyber preview |
|---|---:|---:|---:|
| Tareas de seguridad held-out, respuesta unica (758) | 681 (89,8%) | 603 (79,6%) | 610 (80,5%) |
| Tareas de seguridad de confirmacion nuevas (387) | 352 (91,0%) | 309 (79,8%) | no disponible |
| Episodios de agente held-out (200) | 190 (95,0%) | 175 (87,5%) | 164 (83,2%) |
| Episodios de agente nuevos (200) | 191 (95,5%) | 172 (86,0%) | no disponible |
| Codigo correcto reportado como correcto (122) | 92 (75,4%) | 55 (45,1%) | 59 (48,4%) |
| IFEval prompt estricto (541) | 425 (78,6%) | 390 (72,1%) | 441 (81,5%) |
| BFCL (400) | 368 (92,0%) | 364 (91,0%) | 358 (89,5%) |
| HumanEval+ (164) | 149 (90,9%) | 148 (90,2%) | 148 (90,2%) |
| Peticiones daninas rechazadas (30) | 30 | 30 | 30 |

No se han publicado resultados de benchmarks medidos sobre este build MLX oQ3e en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 17,88 GB solo de pesos; hay que sumar memoria para el runtime, activaciones y cache KV. El contexto maximo util depende de la memoria disponible y de la configuracion del runtime; 262.144 tokens es el limite arquitectonico, no una garantia de memoria.
- GPU: disenado para Apple Silicon con Metal; no es un build para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente para pesos mas runtime, activaciones y cache KV; el autor no especifica un minimo exacto de memoria del sistema.
- Opciones de despliegue: oMLX (version actualizada, con `omlx serve`), o un runtime mlx-vlm compatible con soporte de Qwen3.5 MoE; expone API compatible con OpenAI en `/v1`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 MLX oQ3e (este) | 35B totales, ~3B activos | 262.144 | MIT | MLX safetensors, 17,88 GB | Cuantizacion 3 bits para Apple Silicon |
| Uraion Cyber V1.0 (padre BF16) | 35B totales, ~3B activos | 262.144 | MIT | BF16, servido con vLLM | Referencia de calidad; requiere mas memoria |
| Qwen3.6-35B-A3B | 35B totales, ~3B activos | no disponible | no disponible | no disponible | Base arquitectonica; resultados inferiores en seguridad y agente segun la tabla del autor |
| Uraion Cyber preview | no disponible | no disponible | no disponible | no disponible | Version previa; resultados inferiores en seguridad y agente |

## Limitaciones y advertencias

- La cuantizacion a 3 bits degrada la calidad respecto al modelo padre BF16; el propio autor advierte que los niveles de 2 y 3 bits intercambian calidad por menor huella de memoria, y los benchmarks mostrados no se midieron sobre este build.
- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion no cuantificado en la informacion disponible; en tareas de seguridad, una falsa confirmacion de vulnerabilidad o un falso negativo tienen consecuencias operativas.
- El modelo esta orientado a seguridad defensiva, pero sus capacidades de analisis de codigo y generacion de parches pueden usarse de forma indebida; el autor documenta el rechazo de peticiones daninas en el modelo padre, no en este build.
- La longitud de contexto de 262.144 tokens es un limite arquitectonico; el contexto util real depende de la memoria del sistema y de la configuracion del runtime.
- Requiere hardware Apple Silicon y un runtime MLX actualizado con soporte de Qwen3.5 MoE; no es portable a ecosistemas CUDA sin conversion.
- Licencia MIT: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y la documentacion del modelo padre para condiciones y atribucion.
- El repositorio no registra descargas ni validacion de la comunidad en el momento de la consulta; la fiabilidad en produccion debe verificarse con pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3e
- Modelo padre BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3e/blob/main/LICENSE
- Informe de cuantizacion imatrix: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3e/blob/main/oq_imatrix_report.json
- Sitio de Uraion Labs: https://uraionlabs.com/
