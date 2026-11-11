# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ6e

## Resumen

Uraion Cyber V1.0 MLX oQ6e es una cuantización de 6 bits del modelo Uraion Cyber V1.0, un mixture-of-experts de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, desarrollado por Uraion Labs. El modelo esta especializado en seguridad defensiva y trabajo agentico: deteccion de vulnerabilidades, auditoria de codigo, generacion de parches y verificacion de codigo correcto cuando no existe fallo. Esta version concreta ha sido cuantizada localmente con oMLX 0.7.4.dev1 usando matrices de importancia mejoradas (oQe imatrix) y esta empaquetada en formato MLX safetensors para ejecucion nativa en Apple Silicon.

La arquitectura subyacente es un transformer MoE con 256 expertos, de los cuales 8 se enrutan por token, y una ventana de contexto arquitectonica de 262.144 tokens. Conserva la torre de vision del checkpoint original, por lo que su pipeline es image-text-to-text, y mantiene el tokenizador, la plantilla de chat y los pesos MTP (multi-token prediction) si estaban presentes en el modelo base. El modelo base declara linaje Qwen3.5 MoE / Qwen3.6 y esta orientado a despliegue local en hardware Apple con Metal.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de seguridad defensiva de 35B en equipos Apple Silicon sin depender de GPUs dedicadas, a costa de una perdida de fidelidad respecto al BF16 original que el autor no cuantifica en esta model card. Las cifras de evaluacion publicadas corresponden al modelo padre servido en vLLM y no a esta build MLX, un matiz critico para cualquier decision de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 256 expertos, 8 enrutados por token |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token (denominacion 35B-A3B) |
| Longitud de contexto | 262.144 tokens (limite arquitectonico; el contexto usable depende de memoria y runtime) |
| Tipos de cuantizacion | oQ6e (6 bits, precision mixta con imatrix mejorada); la familia incluye oQ4e, oQ5e, oQ8e y niveles de 2 y 3 bits |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (30,39 GB de pesos) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 256 expertos y 8 expertos enrutados por token, lo que da un total cercano a 36.000 millones de parametros con solo unos 3.000 millones activos por token. Esta relacion permite un throughput alto en inferencia respecto a un modelo denso del mismo tamano, a cambio de un mayor footprint de memoria. La ventana de contexto arquitectonica es de 262.144 tokens. El checkpoint conserva la torre de vision y, si estaban presentes en el origen, los pesos de multi-token prediction (MTP), lo que habilita decodificacion especulativa en runtimes que la soporten.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o refuerzo especifico para seguridad. La model card remite al modelo padre BF16 para la metodologia de evaluacion y la documentacion de seguridad. La innovacion tecnica destacable de esta build es la cuantizacion oQe con matrices de importancia mejoradas de oMLX, que asigna precision de forma no uniforme segun la sensibilidad de cada capa, en lugar de aplicar un ancho de bits fraccionario uniforme.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable o desactivable mediante `chat_template_kwargs.enable_thinking`.
- Auditoria de codigo y deteccion de vulnerabilidades explotables, con capacidad declarada de nombrar la funcion afectada y construir la peticion que demuestra el fallo.
- Generacion de parches y reconocimiento de codigo correcto cuando no hay bug (tarea de "sound code").
- Tool calling y function calling, con resultados BFCL reportados en el modelo padre.
- Flujos agenticos multi-paso, incluyendo verificacion en sandbox segun la descripcion del autor.
- Capacidades multimodales de entrada imagen-texto gracias a la torre de vision conservada.
- Soporte de plantilla de chat y tokenizador originales de Qwen3.5 MoE.
- Capacidad multilingue limitada al ingles segun el campo `language`.

## Casos de uso

- Auditoria de codigo en CI/CD: el modelo puede recibir el contenido de un fichero o diff y devolver si existe una vulnerabilidad explotable, la funcion afectada y una peticion de prueba, integrándose como paso de revision previo al merge.
- Triaje de hallazgos de SAST: dado el volumen de alertas de escaneres estaticos, el modelo filtra falsos positivos distinguiendo codigo vulnerable de codigo correcto, tarea en la que el modelo padre reporta 75,4% de acierto en codigo sano.
- Generacion de parches de seguridad: a partir de un fallo confirmado, produce el parche y puede validarse en un sandbox antes de proponerlo como pull request.
- Agentes de respuesta a incidentes: con tool calling y contexto de 262.144 tokens, puede encadenar consultas a herramientas (lectura de logs, ejecucion de comandos en sandbox) en episodios multi-paso.
- Asistente de AppSec para desarrolladores: integrado via API compatible con OpenAI en el runtime oMLX, responde consultas sobre Practicas seguras y revisa fragmentos de codigo en el editor.
- Analisis de capturas o diagramas de arquitectura: al conservar la torre de vision, puede recibir imagenes junto con texto para tareas de documentacion de seguridad.
- Despliegue local en estaciones de trabajo Apple Silicon: permite a equipos de seguridad ejecutar el modelo sin enviar codigo propietario a servicios externos, con 30,39 GB de pesos en formato MLX.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo padre BF16 servido con vLLM 0.33.0 (cuantizacion FP8 al cargar) y no han sido medidos en esta build MLX oQ6e. Se incluyen como referencia.

| Prueba (modelo padre en vLLM) | Uraion Cyber V1.0 | Qwen3.6-35B-A3B | Uraion Cyber preview |
|---|---:|---:|---:|
| Tareas de seguridad held-out, respuesta unica (758) | 681 (89,8%) | 603 (79,6%) | 610 (80,5%) |
| Tareas de seguridad de confirmacion frescas (387) | 352 (91,0%) | 309 (79,8%) | no disponible |
| Episodios agenticos held-out (200) | 190 (95,0%) | 175 (87,5%) | 164 (83,2%) |
| Episodios agenticos frescos (200) | 191 (95,5%) | 172 (86,0%) | no disponible |
| Codigo sano reportado como sano (122) | 92 (75,4%) | 55 (45,1%) | 59 (48,4%) |
| IFEval prompt estricto (541) | 425 (78,6%) | 390 (72,1%) | 441 (81,5%) |
| BFCL (400) | 368 (92,0%) | 364 (91,0%) | 358 (89,5%) |
| HumanEval+ (164) | 149 (90,9%) | 148 (90,2%) | 148 (90,2%) |
| Peticiones daninas rechazadas (30) | 30 | 30 | 30 |

No se han publicado resultados de benchmarks medidos sobre esta cuantizacion MLX oQ6e en la informacion disponible.

## Requisitos de hardware

- Pesos: 30,39 GB en formato MLX safetensors; hay que sumar memoria unificada para runtime, activaciones y cache KV.
- Memoria recomendada: por encima de 32 GB de memoria unificada para margen razonable; 64 GB o mas para contextos largos y trabajo agentico.
- GPU: disenado para Apple Silicon con Metal; no es un formato para CUDA. En el ecosistema NVIDIA el modelo padre puede servirse con vLLM.
- Cabe en equipos consumer Apple Silicon de gama alta (Mac Studio, MacBook Pro con memoria unificada amplia); no es viable en GPUs consumer de 24 GB en este formato.
- Despliegue: oMLX (`omlx serve`) o un runtime mlx-vlm compatible con Qwen3.5 MoE; la API expuesta es compatible con OpenAI en `/v1`.
- El limite de 262.144 tokens es arquitectonico, no una garantia de memoria; el contexto usable depende de la memoria disponible y de la configuracion del runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato/disponibilidad |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 MLX oQ6e | ~35,95B totales, ~3B activos | 262.144 | Seguridad defensiva y agentes | MIT | MLX safetensors, Apple Silicon |
| Uraion Cyber V1.0 (BF16) | ~35,95B totales, ~3B activos | 262.144 | Seguridad defensiva y agentes | MIT | BF16, servible en vLLM |
| Qwen3.6-35B-A3B | 35B-A3B | no disponible en la informacion | Proposito general | no disponible en la informacion | no disponible en la informacion |
| Uraion Cyber preview | no disponible | no disponible | Seguridad defensiva (version previa) | no disponible | no disponible |

## Limitaciones y advertencias

- Las cifras de benchmarks corresponden al modelo padre BF16 en vLLM y no a esta cuantizacion; la perdida de calidad por oQ6e no esta cuantificada en la model card.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion en la identificacion de vulnerabilidades: el propio diseno de la tarea exige verificar en sandbox los hallazgos antes de actuar sobre ellos.
- En la tarea de reconocer codigo sano, el modelo padre acierta el 75,4%, por lo que aproximadamente uno de cada cuatro casos de codigo correcto puede clasificarse erroneamente como problematico.
- El contexto maximo de 262.144 tokens es un limite arquitectonico; superarlo o acercarse a el en hardware limitado puede provocar fallos de memoria o degradacion.
- La licencia MIT permite uso comercial, pero el autor remite al modelo padre para la documentacion de seguridad y limites, que debe revisarse antes de produccion.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a GPUs NVIDIA sin reconvertir pesos.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ6e
- Modelo padre BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ6e/blob/main/LICENSE
- Informe de cuantizacion imatrix: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ6e/blob/main/oq_imatrix_report.json
- Sitio del autor: https://uraionlabs.com/
