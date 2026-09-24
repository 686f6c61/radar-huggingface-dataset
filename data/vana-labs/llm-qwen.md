# Vana-Labs/llm-qwen

## Resumen

Vana-Labs/llm-qwen es un repositorio espejo (mirror) publicado por Vana Labs que redistribuye copias sin modificar de dos modelos cuantizados en formato GGUF: Qwen3.5-2B y Qwen3.5-4B, ambos desarrollados por el equipo Qwen de Alibaba Cloud. El repositorio no contiene un modelo propio ni un ajuste fino: es un pin de los ficheros generados por Unsloth (unsloth/Qwen3.5-2B-GGUF y unsloth/Qwen3.5-4B-GGUF), con el objetivo declarado de que las descargas de Tetro, el transcriptor de reuniones local de Vana Labs, no dependan de hosts de terceros.

El contenido se limita a dos ficheros GGUF en cuantizacion Q4_K_M (uno por tamano de modelo), identificados internamente como qwen3.5:2b y qwen3.5:4b. El parametro total declarado para el modelo de 2B es de 1.881.825.088 pesos y el repositorio completo ocupa 4,0 GB. No se publican datos de contexto, idiomas, arquitectura interna, dataset de entrenamiento ni benchmarks.

Su relevancia practica es acotada y muy concreta: sirve como dependencia fija y reproducible para una aplicacion de resumen de transcripciones que debe funcionar en local, sin conexion y sin depender de la disponibilidad de repositorios ajenos. Para cualquier evaluacion tecnica del modelo en si, la referencia valida es el repositorio original de Unsloth o la documentacion del equipo Qwen, no este espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura interna de la familia Qwen3.5) |
| Parametros totales | 1.881.825.088 (modelo de 2B, dato safetensors); el repo incluye tambien el modelo de 4B, cuyo conteo exacto no se indica |
| Parametros activos | no aplica (no se declara variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); la etiqueta `imatrix` sugiere cuantizacion guiada por matriz de importancia, no confirmada en la model card |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 4,0 GB (dos ficheros) |
| Ficheros incluidos | `Qwen3.5-2B-Q4_K_M.gguf` (ID `qwen3.5:2b`), `Qwen3.5-4B-Q4_K_M.gguf` (ID `qwen3.5:4b`) |
| Modelo base | Qwen/Qwen3.5-2B, Qwen/Qwen3.5-4B |
| Fecha de publicacion | 2026-09-23 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura en la documentacion proporcionada. El repositorio es un espejo de pesos ya cuantizados, por lo que no incluye ni codigo de modelado, ni configuracion de entrenamiento, ni detalles sobre el dataset, el numero de tokens vistos, la composicion de datos o si hubo fases de RLHF, DPO u optimizacion por preferencias. Los unicos datos tecnicos verificables son el conteo de parametros del modelo de 2B (1.881.825.088) y el esquema de cuantizacion empleado.

La innovacion tecnica atribuible a este repositorio es exclusivamente de distribucion: fijar commits concretos de los GGUF de Unsloth (commit `f6d5376be1edb4d416d56da11e5397a961aca8ae` para el 2B y `e87f176479d0855a907a41277aca2f8ee7a09523` para el 4B) para que la aplicacion cliente descargue siempre los mismos bytes. Cualquier detalle sobre atencion, decodificacion especulativa, atencion lineal, tokenizador o ventana de contexto debe consultarse en la documentacion del equipo Qwen, no aqui.

## Capacidades

- Generacion de texto y resumen: unico uso documentado explicitamente en la model card, orientado a resumir transcripciones de reuniones en la aplicacion Tetro.
- Conversacion: el repositorio incluye la etiqueta `conversational`, aunque no se detalla el formato de plantilla de chat ni el soporte multi-turno mas alla de lo que herede del modelo base.
- Ejecucion local: al distribuirse en GGUF para llama.cpp, la inferencia puede realizarse integramente en el equipo del usuario, sin conexion a internet.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas aparece vacio).
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.
- Razonamiento matematico y generacion de codigo: no documentados en la informacion disponible para estos pesos concretos.

## Casos de uso

- Resumen de transcripciones de reuniones: es el caso de uso de diseno. Tetro captura audio, lo transcribe y pasa el texto al modelo para obtener un resumen; el modelo de 2B cubre reuniones cortas y el de 4B aporta mas coherencia en actas de varias horas.
- Actas y extraccion de acuerdos en local: el modelo puede generar listas de decisiones y tareas pendientes a partir de la transcripcion, sin que el contenido de la reunion salga del ordenador, algo critico en entornos con datos confidenciales.
- Notas de voz a texto estructurado: integrado en una aplicacion de dictado, convierte una grabacion transcrita en un informe con secciones, asistentes y proximos pasos.
- Despliegue en portatiles sin GPU dedicada: al tratarse de cuantizaciones Q4_K_M de 2B y 4B, la inferencia es viable en CPU con llama.cpp, lo que habilita el uso en equipos de oficina estandar.
- Procesamiento por lotes de reuniones archivadas: ejecutar un script nocturno que resuma cientos de transcripciones almacenadas, aprovechando que el modelo no requiere cuota de API ni conectividad.
- Resumen para subtitulado y accesibilidad: condensar transcripciones largas en parrafos legibles antes de generar subtitulos o articulos derivados de una reunion.
- Aplicaciones de escritorio con dependencia fijada: al ser un espejo con commits pinneados, es adecuado para productos que necesitan una version concreta e inmutable del modelo durante el ciclo de vida de la aplicacion.
- Prototipado rapido con llama.cpp: servir de nodo de generacion de texto en pruebas de concepto locales antes de decidir si se escala a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado en la busqueda web datos especificos de rendimiento para Qwen3.5-2B o Qwen3.5-4B. Cualquier cifra que se quiera usar para evaluar estos pesos debe obtenerse de la documentacion oficial del equipo Qwen o de mediciones propias.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano de los pesos en cuantizacion Q4_K_M y del total declarado del repositorio (4,0 GB); el autor no publica requisitos oficiales.

- Modelo de 2B (Q4_K_M): aproximadamente 1,5-2 GB de VRAM o RAM para pesos mas cache KV en contextos moderados.
- Modelo de 4B (Q4_K_M): aproximadamente 3-3,5 GB de VRAM o RAM en las mismas condiciones.
- GPU consumer: ambos caben sobradamente en tarjetas de 8 GB o mas (RTX 3060, 4060, 4070, 4090, Apple Silicon con memoria unificada). El modelo de 2B puede ejecutarse incluso en GPUs de 4 GB.
- CPU: viable en exclusiva por CPU con llama.cpp, especialmente el modelo de 2B; el throughput dependera del numero de nucleos y del ancho de banda de memoria.
- Despliegue: llama.cpp es el runtime natural dado el formato GGUF, con soporte esperable en Ollama, LM Studio y otros clientes compatibles con GGUF. El uso con vLLM o TGI requeriria convertir los pesos a otro formato y no esta documentado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para estos ficheros.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con Llama, Gemma, Phi u otras familias de tamano equivalente. La comparacion factible es entre los dos pesos incluidos en el propio repositorio y con su origen:

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Origen |
|---|---|---|---|---|---|
| Qwen3.5-2B (qwen3.5:2b) | 1.881.825.088 | Q4_K_M | GGUF | apache-2.0 | Espejo de unsloth/Qwen3.5-2B-GGUF |
| Qwen3.5-4B (qwen3.5:4b) | no disponible | Q4_K_M | GGUF | apache-2.0 | Espejo de unsloth/Qwen3.5-4B-GGUF |
| Alternativas de otras familias (Llama 3.x, Gemma, Phi) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo propio: el repositorio redistribuye pesos de terceros. Cualquier problema de calidad, sesgo o licencia se hereda de Qwen3.5-2B/4B y de la cuantizacion de Unsloth.
- Ausencia total de documentacion tecnica: sin contexto, sin idiomas declarados, sin plantilla de chat y sin detalles de entrenamiento.
- Ausencia de evaluacion: no hay benchmarks publicados, ni por el autor del espejo ni en los resultados de busqueda consultados.
- Riesgo de alucinacion: en tareas de resumen de reuniones, un modelo de 2B puede inventar acuerdos, atribuir mal las intervenciones o condensar de forma incorrecta; el de 4B reduce pero no elimina este riesgo.
- Perdida por cuantizacion: Q4_K_M degrada la calidad respecto a pesos en fp16 o bf16, de forma mas perceptible en tareas de razonamiento y en contextos largos.
- Idiomas: al no declararse el soporte linguistico, no se puede garantizar un comportamiento correcto en castellano ni en otras lenguas distintas del ingles.
- Sesgos: no documentados, pero al no haber informacion sobre el dataset de entrenamiento no es posible acotar sesgos demograficos, culturales o de dominio.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios; conviene verificar tambien las condiciones del repositorio original de Unsloth y del modelo base de Qwen.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, y etiqueta `tetro` mal escrita, senales de que el mantenimiento y la validacion por parte de la comunidad son nulos.
- Dependencia de un unico mantenedor: si Vana Labs deja de actualizar el espejo, los usuarios quedaran anclados a commits concretos sin ruta de actualizacion.
- Contexto desconocido: sin ventana de contexto declarada, no se puede planificar el troceado de transcripciones largas con garantias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vana-Labs/llm-qwen
- Origen del modelo de 2B: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Origen del modelo de 4B: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
- Sitio oficial de Qwen: https://qwen.ai/home
- Pagina de Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
- Ficha de tecnologia Qwen en lablab.ai: https://lablab.ai/tech/qwen
- Repositorio GitHub de Qwen2-VL (referencia de la familia, no de este modelo): https://github.com/latent-labs-ai/Qwen2-VL
