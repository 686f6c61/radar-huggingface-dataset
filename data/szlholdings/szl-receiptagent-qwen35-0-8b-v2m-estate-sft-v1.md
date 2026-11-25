# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1

## Resumen
El modelo `szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1` es un ajuste fino supervisado (SFT) publicado por SZLHOLDINGS dentro de su catalogo "governed-AI estate". Se construye sobre el modelo base `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged`, que a su vez deriva de la familia Qwen 3.5 en su variante de 0,8 mil millones de parametros. El nombre del repositorio sugiere un uso orientado a agentes de gestion de recibos y documentacion de tipo "estate" (inmobiliario o patrimonial), aunque la model card no documenta explicitamente el dominio de entrenamiento ni la composicion del dataset SFT.

Con 852.985.920 parametros reales (segun los tensores safetensors) y un tamano de repositorio de 3,4 GB, se trata de un modelo pequeno pensado para despliegue en hardware modesto y tareas de extraccion, clasificacion o generacion estructurada. La licencia declarada es Apache 2.0, aunque la propia model card advierte que la etiqueta se fijo administrativamente por el equipo de operaciones del "estate" sin evidencia por fichero del linaje upstream.

Su relevancia es limitada pero concreta: es un ejemplo de modelo de nicho, con gobernanza declarativa basada en "receipts" (ficheros de auditoria), que prioriza la trazabilidad de afirmaciones sobre rendimiento frente a la publicacion de benchmarks. No obstante, la ausencia de un `DONE.json` estricto con estado MEASURED implica que las capacidades reales del modelo no estan verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (nota del estate: fijada por operaciones, sin evidencia por fichero) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged |
| Tamano del repo | 3,4 GB |
| Descargas | 615 |
| Fecha de creacion | 2026-11-05 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento
La arquitectura subyacente corresponde a la familia Qwen 3.5 en su variante de ~0,8B parametros, un transformer decoder-only con atencion por tokens autorregresiva. El tag `qwen3_5` en Hugging Face confirma la familia, pero la model card no detalla numero de capas, dimensiones ocultas, cabezas de atencion ni si incorpora innovaciones como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

El proceso de entrenamiento declarado es un ajuste fino supervisado (SFT) sobre el modelo fusionado `szl-receiptagent-qwen35-0.8b-v2-merged`. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO o preferencias, ni el regimen de hiperparametros. La model card menciona "receipts" (ficheros de auditoria) y un snapshot de auditoria con fecha 2026-11-20, pero el escaneo estricto de receipts del 2026-11-22 clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de receipt (`receipts/eval_battery.json`, `receipt-proof.svg`, entre otros) pero no un `DONE.json` con estado MEASURED, `eval_rc=0` y timestamp. En consecuencia, la evidencia de evaluacion se marca como UNKNOWN.

## Capacidades
- Generacion de texto autorregresiva en ingles (unico idioma declarado).
- Ajuste fino orientado a tareas de agente de recibos y documentacion patrimonial, segun el nombre del repositorio (no verificado por receipts medidos).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun el tag de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Razonamiento matematico o generacion de codigo: no documentado.

## Casos de uso
- Extraccion estructurada de datos de recibos y facturas: el modelo puede recibir texto OCR de un recibo y devolver campos normalizados (importe, fecha, proveedor, concepto) en formato JSON, aprovechando su ajuste SFT sobre el dominio "receiptagent". Es adecuado por su tamano reducido, que permite procesar lotes grandes en CPU o GPU de gama baja.
- Clasificacion documental en pipelines de gestion patrimonial: dado un texto de escritura, contrato o recibo, el modelo puede asignar una categoria (alquiler, suministro, mantenimiento) siempre que se valide contra receipts de evaluacion, hoy inexistentes.
- Preprocesado en sistemas de agentes: al ser un modelo de 0,8B, puede actuar como router o extractor previo a un modelo mayor, reduciendo coste y latencia en flujos donde la tarea es acotada.
- Prototipado rapido en entornos con GPU consumer: su tamano permite cargarlo en una RTX 3060 de 12 GB en fp16 (aprox. 1,7 GB de pesos) o incluso en CPU con cuantizacion, aunque no se publican pesos GGUF.
- Generacion de borradores de respuestas en atencion al cliente de gestion inmobiliaria: dado un contexto de conversacion corto, puede redactar respuestas en ingles, aunque el contexto maximo no esta documentado.
- Investigacion sobre gobernanza de modelos: el repositorio es un caso de estudio de model cards basadas en receipts y de como se declaran (o no) evidencias de evaluacion, util para equipos que disenan pipelines de auditoria.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que la evidencia de evaluacion es UNKNOWN al no existir un `DONE.json` estricto.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion orientativa, no medida por el autor).
- VRAM estimada en int8: aproximadamente 0,9 GB para pesos; en int4, aproximadamente 0,5 GB (estimaciones teoricas, sin cuantizaciones publicadas en el repo).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para fp16; en entornos profesionales, A10G, L4 o A100 sobran para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6-8 GB.
- Opciones de despliegue: transformers (libreria declarada). No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion manual. vLLM y TGI son compatibles con safetensors de arquitecturas Qwen, pero no hay configuracion verificada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1 | 852.985.920 | no disponible | apache-2.0 | Hugging Face, safetensors | SFT de nicho, sin benchmarks medidos |
| Qwen2.5-0.5B / Qwen3-0.6B (familia upstream) | ~0,5-0,6B | 32K (segun variante) | Apache 2.0 | Hugging Face, GGUF, vLLM | Modelos generalistas con benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8K | Apache 2.0 | Hugging Face, GGUF | Alternativa generalista de tamano similar |
| TinyLlama-1.1B | 1,1B | 2K | Apache 2.0 | Hugging Face, GGUF | Modelo pequeno con amplia adopcion |

La comparacion con la familia Qwen upstream es la mas directa por linaje, pero no se dispone de datos de rendimiento del modelo SFT para contrastar. Las alternativas generalistas citadas cuentan con benchmarks publicados y pesos cuantizados, ventajas que este repositorio no ofrece.

## Limitaciones y advertencias
- Ausencia de evidencia de evaluacion medida: el escaneo estricto de receipts clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, por lo que no hay garantia verificada de calidad ni de capacidades.
- Sesgos conocidos: no documentados; al derivar de Qwen 3.5, hereda los sesgos del preentrenamiento upstream, no auditados en esta ficha.
- Riesgo de alucinacion: elevado en tareas de extraccion de datos si no se valida la salida contra el documento fuente; no hay receipts que midan tasas de error.
- Limitacion de idioma: solo se declara ingles (`en`); el uso en castellano no esta soportado oficialmente.
- Longitud de contexto desconocida: no se puede planificar su uso en documentos largos sin verificacion empirica.
- Licencia: Apache 2.0 declarada, pero la propia model card advierte que la etiqueta se fijo por operaciones del estate sin evidencia por fichero del linaje upstream; conviene revisar la licencia del modelo base Qwen 3.5 antes de uso comercial.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en CPU o en entornos sin transformers.
- Modelo de nicho: el dominio "estate/receipt" no esta documentado con detalle, por lo que su comportamiento fuera de ese dominio es incierto.

## Enlaces
- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Repositorio de herramientas de tarjetas: https://github.com/szl-holdings/estate-cards
- Organizacion GitHub (referenciada en la model card): https://github.com/szl-holdings
