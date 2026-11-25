# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1

## Resumen

El modelo `szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1` es un ajuste fino supervisado (SFT) publicado por SZLHOLDINGS, una organizacion que comercializa un "estate" de modelos, datasets y Spaces con resultados auditables y trazables ("receipted"). Se trata de un modelo derivado del checkpoint base `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3`, que a su vez se apoya en la familia Qwen 3.5, segun indica el tag `qwen3_5` de Hugging Face.

El artefacto tiene 873.438.784 parametros (dato real obtenido de los pesos en safetensors) y esta orientado a generacion de texto en ingles. El nombre sugiere un proposito de "agente de recibos" (receipt agent) dentro de un flujo de gestion patrimonial ("estate"), lo que apunta a tareas de extraccion y procesamiento de documentos estructurados, aunque la model card no documenta explicitamente el dominio de entrenamiento.

La relevancia de esta ficha es limitada desde el punto de vista de rendimiento: la propia model card declara de forma explicita que las afirmaciones de calidad y capacidad solo se sostienen si existen "receipts" medidos, y el escaneo de la tranche 4 (2026-11-22) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, con ficheros de recibo presentes pero sin el `DONE.json` estricto que respalde una evaluacion medida. En consecuencia, la evidencia de evaluacion figura como UNKNOWN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen 3.5, tag `qwen3_5`); detalles de atencion no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la pertenencia a la familia Qwen 3.5 (tag `qwen3_5`) y su naturaleza de modelo de generacion de texto cargable con transformers. No se especifican el numero de capas, la dimension oculta, el esquema de atencion (completa, lineal o hibrida), ni si emplea mezcla de expertos. El recuento exacto de parametros (873.438.784) es coherente con un modelo denso de aproximadamente 0,8 mil millones de parametros.

Respecto al entrenamiento, el sufijo `sft-v1` indica un ajuste fino supervisado sobre el checkpoint base `szl-receiptagent-qwen35-0.8b-v3`. No se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La model card declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion debe residir en los ficheros de recibo del "estate mesh", y que lo no acreditado se marca como UNKNOWN. El escaneo estricto de recibos no encontro un `DONE.json` valido, por lo que no hay evidencia medida del proceso de entrenamiento.

## Capacidades

- Generacion de texto en ingles, con pipeline `text-generation`.
- Ajuste orientado a tareas de agente sobre documentos tipo recibo (inferido del nombre del modelo; no verificado en la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidades de codigo o matematicas: no documentadas.

## Casos de uso

- Extraccion de campos de recibos y facturas: el modelo puede emplearse para transformar texto OCR de documentos financieros en estructuras de campos (fecha, importe, emisor, concepto), dado su nombre y su orientacion a "receipt agent". La idoneidad real no esta validada por recibos de evaluacion.
- Clasificacion de documentos en un flujo de gestion patrimonial: util para enrutar documentos entrantes a colas de procesamiento segun su tipo, aprovechando su tamano reducido para despliegues de bajo coste.
- Prototipado rapido de agentes documentales: al pesar menos de 900 millones de parametros, permite iterar en local sobre pipelines de extraccion antes de escalar a modelos mayores.
- Generacion de resumenes de transacciones: puede condensar listados de movimientos o recibos en resumenes en ingles para revision humana.
- Etiquetado asistido de datasets: util para preanotar pares documento-campo que luego se revisan manualmente, dado su coste de inferencia bajo.
- Despliegue en entornos con recursos limitados: su tamano permite ejecucion en CPU o GPU de gama baja para tareas de clasificacion y extraccion simple, siempre que se valide la calidad con evaluaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara de forma explicita que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria fechada, y el escaneo estricto de recibos clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` valido).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para pesos (873 millones de parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,0 GB para pesos; en 4 bits, aproximadamente 0,5 GB (estimaciones teoricas, no verificadas con artefactos publicados).
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni artefactos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1 | 873 M | no disponible | apache-2.0 | Hugging Face (302 descargas) | Sin benchmarks medidos; evidencia UNKNOWN |
| Qwen 3 0.6B (referencia de familia) | ~600 M | no disponible en esta ficha | apache-2.0 | Hugging Face | Modelo base de la familia; datos de contexto no verificados aqui |
| Llama 3.2 1B | ~1,2 B | no disponible en esta ficha | licencia comunitaria Llama | Hugging Face | Alternativa de tamano similar; datos no verificados aqui |

La comparativa se limita a la categoria por tamano, ya que no hay datos de rendimiento publicados para el modelo descrito. Las cifras de los modelos alternativos deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia de evidencia medida: el escaneo estricto de recibos clasifica el repositorio como `RECEIPT_FILES_NO_DONE`; no hay evaluacion validada de calidad ni de capacidad.
- Sesgos conocidos: no documentados; al derivar de Qwen 3.5, puede heredar sesgos del corpus de preentrenamiento, no auditados en esta ficha.
- Riesgo de alucinacion: no cuantificado; en tareas de extraccion de documentos el riesgo es relevante y exige validacion posterior.
- Limitacion de idioma: solo se declara ingles, lo que restringe su uso en castellano u otros idiomas sin evaluacion adicional.
- Contexto: no se documenta la longitud de ventana, lo que impide planificar su uso con documentos largos.
- Licencia: apache-2.0, permisiva para uso comercial, aunque la nota de licencia del estate indica que el tag se fijo por decision interna de operaciones ("rights-call") sin evidencia de licencia upstream por fichero.
- Caveat de produccion: la model card advierte que cualquier afirmacion no acreditada en los recibos debe tratarse como UNKNOWN; no se recomienda su uso en produccion sin una evaluacion propia.
- Trazabilidad: el autor remite a la organizacion `szl-holdings` en GitHub como fuente canonica, con enlaces que en la informacion proporcionada aparecen incompletos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referencia canonica, enlace incompleto en la informacion): https://github.com/szl-holdings
- Repositorio de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
