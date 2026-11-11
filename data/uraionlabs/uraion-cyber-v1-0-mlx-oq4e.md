# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ4e

## Resumen

Uraion Cyber V1.0 MLX oQ4e es una cuantizacion de 4 bits en formato MLX del modelo Uraion Cyber V1.0, desarrollado por Uraion Labs. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parametros totales con unos 3.000 millones activos por token, construido sobre la arquitectura Qwen3.5 MoE y orientado especificamente a seguridad defensiva y trabajo con agentes: deteccion de vulnerabilidades, auditoria de codigo, generacion de parches y reconocimiento de codigo correcto cuando no hay fallo.

Esta version concreta ha sido cuantizada localmente con oMLX 0.7.4.dev1 mediante cuantizacion mejorada por matriz de importancia (imatrix), pensada para ejecucion en Apple Silicon a traves de MLX y Metal. El repositorio ocupa 22,1 GB, lo que la convierte en un punto de partida equilibrado dentro de la familia de cuantizaciones oQe del autor, que incluye variantes de 2, 3, 5, 6 y 8 bits.

Su relevancia actual radica en que permite ejecutar localmente, en hardware de consumo de Apple, un modelo especializado en seguridad ofensiva-defensiva con ventana de contexto arquitectonica de 262.144 tokens, capacidades de razonamiento con modo thinking, tool calling y procesamiento de imagen y texto. La licencia MIT facilita su adopcion tanto en investigacion como en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 256 expertos, 8 enrutados por token |
| Parametros totales | 35.951.822.704 (~35B) |
| Parametros activos | ~3B por token (35B-A3B) |
| Longitud de contexto | 262.144 tokens (limite arquitectonico) |
| Tipos de cuantizacion | oQ4e (4 bits, imatrix mejorada); familia oQe con variantes 2, 3, 5, 6 y 8 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors |
| Tamano de pesos | 22,13 GB |
| Runtime | oMLX / MLX, mlx-vlm con soporte Qwen3.5 MoE |
| Torre de vision | Retenida en la cuantizacion |
| Pesos MTP | Retenidos si estan presentes en el checkpoint origen |
| Modelo base | UraionLabs/Uraion-Cyber-V1.0 (BF16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos basada en Qwen3.5 MoE, con 256 expertos de los cuales se enrutan 8 por token, lo que da lugar a unos 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. La ventana de contexto arquitectonica alcanza los 262.144 tokens. La cuantizacion oQ4e se ha realizado con oMLX 0.7.4.dev1 usando una matriz de importancia mejorada (imatrix), que asigna precision de forma no uniforme segun la relevancia de cada peso, en lugar de aplicar un ancho de bits fraccional homogeneo. Se conservan el tokenizador y la plantilla de chat originales, la torre de vision y los pesos MTP si existian en el checkpoint fuente.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card remite al modelo padre BF16 para la metodologia completa de evaluacion y la documentacion de seguridad. El modelo esta especializado en seguridad defensiva y trabajo con agentes, e incluye un modo thinking que puede desactivarse mediante `enable_thinking: False` en la plantilla de chat.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable o desactivable.
- Analisis de seguridad defensiva: deteccion de vulnerabilidades explotables, auditoria de codigo y generacion de parches.
- Reconocimiento de codigo correcto cuando no existe fallo, con una tasa del 75,4% en el modelo padre.
- Generacion y comprension de codigo, con soporte para auditoria de servicios y ficheros fuente.
- Tool calling y function calling, con 92,0% en BFCL en el modelo padre.
- Capacidades agenticas y razonamiento multi-paso, con 95,0% en episodios de agente retenidos.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision retenida.
- Capacidades multilingues limitadas al ingles.
- Instrucciones estrictas, con 78,6% en IFEval en el modelo padre.
- Rechazo de peticiones daninas: 30 de 30 en el conjunto de prueba del modelo padre.

## Casos de uso

- Auditoria de servicios en local: el modelo puede recibir el codigo de un servicio y determinar si existe una vulnerabilidad explotable, nombrando la funcion afectada y mostrando la peticion que la demuestra, gracias a su especializacion en seguridad defensiva y su contexto de 262.144 tokens.
- Generacion de parches en pipelines de CI/CD: integrado mediante tool calling, puede detectar un fallo en un diff y proponer el parche correspondiente, con la ventaja de ejecutarse en Apple Silicon sin depender de la nube.
- Triaje de falsos positivos: su capacidad de reconocer codigo correcto como correcto (75,4% en el modelo padre) lo hace util para reducir el ruido de escaneres SAST en revisiones de codigo.
- Agentes de seguridad multi-paso: con un 95,0% en episodios de agente retenidos, puede encadenar pasos de reconocimiento, explotacion controlada en sandbox y verificacion del parche.
- Asistente de desarrollo con contexto largo: la ventana de 262.144 tokens permite cargar repositorios completos o multiples ficheros para revisiones de seguridad y refactorizaciones.
- Analisis de capturas y diagramas: al conservar la torre de vision, puede procesar imagenes de trazas, diagramas de arquitectura o capturas de paneles para tareas de analisis y documentacion.
- Despliegue local en estaciones de trabajo Apple: con 22,13 GB de pesos, cabe en equipos con memoria unificada suficiente, lo que permite trabajar con codigo sensible sin enviarlo a servicios externos.

## Benchmarks y rendimiento

Los resultados siguientes fueron medidos sobre los pesos BF16 del modelo padre servidos con vLLM 0.33.0 (cuantizacion FP8 en carga) y no sobre esta build MLX. Se incluyen como referencia.

| Prueba (modelo padre en vLLM) | Uraion Cyber V1.0 | Qwen3.6-35B-A3B | Uraion Cyber preview |
|---|---:|---:|---:|
| Tareas de seguridad retenidas, respuesta unica (758) | 681 (89,8%) | 603 (79,6%) | 610 (80,5%) |
| Tareas de seguridad de confirmacion nuevas (387) | 352 (91,0%) | 309 (79,8%) | — |
| Episodios de agente retenidos (200) | 190 (95,0%) | 175 (87,5%) | 164 (83,2%) |
| Episodios de agente nuevos (200) | 191 (95,5%) | 172 (86,0%) | — |
| Codigo correcto reportado como correcto (122) | 92 (75,4%) | 55 (45,1%) | 59 (48,4%) |
| IFEval prompt, estricto (541) | 425 (78,6%) | 390 (72,1%) | 441 (81,5%) |
| BFCL (400) | 368 (92,0%) | 364 (91,0%) | 358 (89,5%) |
| HumanEval+ (164) | 149 (90,9%) | 148 (90,2%) | 148 (90,2%) |
| Peticiones daninas rechazadas (30) | 30 | 30 | 30 |

No se han publicado resultados de benchmarks medidos sobre esta build MLX oQ4e en la informacion disponible.

## Requisitos de hardware

- Memoria: los pesos ocupan 22,13 GB; debe reservarse memoria unificada adicional para el runtime, las activaciones y la cache KV.
- Contexto: 262.144 tokens es el limite arquitectonico, no una garantia de memoria; el contexto maximo utilizable depende de la memoria disponible y de la configuracion del runtime.
- Hardware objetivo: Apple Silicon con Metal; el modelo esta disenado para ejecutarse en equipos Mac con memoria unificada suficiente (se recomienda ampliamente por encima de los 22,13 GB de pesos).
- GPU dedicadas: no se ha validado en la informacion disponible el uso en A100, H100 o RTX 4090; el formato MLX safetensors esta orientado a Apple Silicon.
- Despliegue: oMLX (`omlx serve`) o un runtime mlx-vlm compatible con soporte Qwen3.5 MoE; se expone una API compatible con OpenAI en `/v1`.
- Variantes de memoria: las cuantizaciones de 2 y 3 bits reducen el espacio a costa de calidad; oQ5e, oQ6e y oQ8e priorizan fidelidad.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 MLX oQ4e | 35B totales, ~3B activos | 262.144 | MIT | MLX safetensors | Especializado en seguridad defensiva, vision, thinking |
| Qwen3.6-35B-A3B | 35B totales, ~3B activos | no disponible | no disponible | no disponible | Referencia de comparacion en benchmarks; 79,6% en seguridad retenida frente a 89,8% |
| Uraion Cyber V1.0 (BF16) | 35B totales, ~3B activos | 262.144 | MIT | safetensors BF16 | Modelo padre sin cuantizar; maxima fidelidad, mayor huella de memoria |
| Uraion Cyber preview | no disponible | no disponible | no disponible | no disponible | Version previa; 80,5% en seguridad retenida |

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Al ser una cuantizacion de 4 bits, puede perder calidad respecto al modelo padre BF16; las variantes de 2 y 3 bits degradan aun mas la fidelidad.
- Los benchmarks publicados corresponden al modelo padre en vLLM, no a esta build MLX, por lo que el rendimiento real puede diferir.
- El contexto de 262.144 tokens es un limite arquitectonico y no una garantia de memoria; contextos largos pueden agotar la memoria unificada.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en la identificacion de vulnerabilidades; sus hallazgos deben verificarse manualmente.
- El modelo esta orientado a seguridad defensiva; su uso ofensivo no esta documentado ni validado.
- No se dispone de informacion sobre sesgos especificos del modelo en la documentacion proporcionada.
- Licencia MIT: permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio y la atribucion al modelo base.
- Requiere un runtime MLX actualizado con soporte Qwen3.5 MoE; versiones antiguas pueden no cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ4e
- Modelo padre BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ4e/blob/main/LICENSE
- Sitio de Uraion Labs: https://uraionlabs.com/
- Informe de cuantizacion imatrix: `oq_imatrix_report.json` en el repositorio
- Informacion de cuantizacion: `quantization_info.json` en el repositorio
- Prueba de humo: `smoke_test.json` en el repositorio
- Sumas de verificacion: `SHA256SUMS` en el repositorio
