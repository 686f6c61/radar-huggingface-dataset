# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2

## Resumen

szl-receiptagent-qwen35-0.8b-v2 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B, publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada. El modelo se distribuye como adaptador PEFT (la libreria declarada es `peft`) sobre el modelo base de Qwen, con licencia Apache 2.0 y pesos en formato safetensors. El repositorio ocupa 3,5 GB y acumula 457 descargas en el momento de la consulta.

El nombre del artefacto ("receiptagent") sugiere un uso orientado a agentes que generan o verifican comprobantes y recibos, aunque la model card no describe explicitamente la tarea de entrenamiento ni la composicion del dataset. La model card es fundamentalmente un documento de gobernanza: enfatiza trazabilidad, ficheros de "recibo" (receipts) y la distincion entre datos medidos, reportados y desconocidos, en lugar de detallar arquitectura o capacidades.

La relevancia de este modelo es limitada y muy especifica: se trata de un ajuste fino pequeno (0,8B parametros) sobre una base reciente de Qwen, con documentacion tecnica practicamente inexistente. Resulta util como ejemplo de practicas de publicacion centradas en auditoria, pero no como modelo de proposito general. Cualquier evaluacion de sus capacidades reales debe considerarse no disponible a partir de la informacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B); detalles no disponibles |
| Parametros totales | 0,8B (modelo base); numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT sobre el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna ni sobre el proceso de entrenamiento. El modelo se presenta como un artefacto entrenado dentro de la "governed factory" de SZLHOLDINGS y se distribuye mediante la libreria `peft`, lo que indica que se trata de un adaptador (probablemente LoRA u otra variante de ajuste eficiente) que debe combinarse con el modelo base Qwen/Qwen3.5-0.8B para su uso. La model card no especifica el rango del adaptador, los modulos objetivo ni la estrategia de fusion.

Respecto a los datos de entrenamiento, la model card indica explicitamente que las afirmaciones de entrenamiento y evaluacion "viven en sus ficheros de recibo" y que cualquier cosa no registrada alli es desconocida. El escaneo de recibos de la tranche 4 (2026-11-22) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (`training_receipt.signed.json`, `eval_receipt.signed.json`, `publication_receipt.signed.json`, `curriculum/receiptagent.schema.json`, entre otros), pero no hay un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`. En consecuencia, la evidencia de evaluacion se marca como UNKNOWN. No se documentan tecnicas como RLHF, DPO, decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, por lo que la capacidad basica de generacion esta presente por herencia del modelo base.
- Ajuste orientado a agentes de recibos: el nombre del artefacto y el fichero `curriculum/receiptagent.schema.json` apuntan a un entrenamiento especifico para tareas de agente relacionadas con recibos o comprobantes, aunque la model card no describe el comportamiento resultante.
- Capacidades del modelo base (Qwen3.5-0.8B): no verificadas en este ajuste; no se dispone de evaluacion que confirme que se conservan.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta poblado).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Extraccion estructurada de datos de recibos y comprobantes: dado el nombre y el esquema de curriculum incluido, el uso previsto mas plausible es convertir texto de recibos en JSON estructurado; requeriria validacion propia porque no hay evaluacion publicada.
- Clasificacion de gastos en flujos de contabilidad: un modelo de 0,8B puede desplegarse en local para etiquetar lineas de gasto antes de enviarlas a un sistema contable, con coste de inferencia muy bajo.
- Preprocesado en pipelines de documentos: uso como primer paso para normalizar y resumir documentos financieros antes de un modelo mayor, aprovechando su tamano reducido para alto throughput.
- Prototipado de agentes con trazabilidad: util en entornos donde se exige registrar cada decision y su procedencia, dado el enfasis del autor en recibos y auditoria.
- Despliegue en el borde o en CPU: con 0,8B parametros y cuantizacion de 4 bits, es viable en portatiles y dispositivos con recursos limitados para tareas acotadas de extraccion.
- Experimentacion academica sobre gobernanza de modelos: sirve como caso de estudio de publicacion con recibos firmados y distincion explicita entre datos medidos y desconocidos.
- Filtrado previo en atencion al cliente financiera: clasificacion de consultas sobre recibos antes de escalar a un modelo mayor, siempre que se valide su precision con un conjunto propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en FP16 requiere aproximadamente 1,6 GB solo para pesos; en cuantizacion de 4 bits, alrededor de 0,5 GB. El adaptador PEFT anade una cantidad no especificada (el repositorio ocupa 3,5 GB, lo que sugiere que puede incluir artefactos adicionales o pesos en mayor precision).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o una RTX 4090 permiten amplio margen para contexto largo y lotes grandes.
- Compatibilidad con GPU consumer: si, practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso CPU con llama.cpp si se convierte a GGUF (no se distribuye en ese formato).
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` y `peft`; para servir en produccion se puede fusionar el adaptador y exportar a vLLM o TGI. No hay pesos GGUF ni Ollama publicados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v2 | 0,8B (base) | no disponible | Apache 2.0 | Hugging Face, adaptador PEFT | Sin benchmarks publicados; documentacion centrada en gobernanza |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base; capacidades generales no verificadas aqui |
| Alternativas de ~1B para extraccion estructurada | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni resultados de validacion, ni descripcion de la tarea de entrenamiento; no es posible afirmar que el ajuste mejora al modelo base en ninguna tarea.
- Riesgo de alucinacion: inherente a los modelos de 0,8B en tareas de extraccion estructurada; sin evaluacion, el riesgo no esta cuantificado.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de ningun otro idioma concreto.
- Dependencia del modelo base: el adaptador requiere Qwen/Qwen3.5-0.8B; los terminos y limitaciones del modelo base se aplican en cascada.
- Documentacion de gobernanza sin evidencia estricta: el escaneo de recibos clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no un `DONE.json` que cumpla el estandar estricto; las afirmaciones del autor no estan verificadas por una auditoria completa.
- Sesgos: no documentados; no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar por separado la licencia del modelo base y de los datos de entrenamiento, no detallados.
- Repositorio de 3,5 GB para un adaptador de un modelo de 0,8B: conviene inspeccionar el contenido antes de descargarlo, ya que puede incluir artefactos no esenciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de la organizacion en GitHub (referenciado en la model card): https://github.com/szl-holdings
- Herramienta de generacion de fichas del autor: https://github.com/szl-holdings/estate-cards
