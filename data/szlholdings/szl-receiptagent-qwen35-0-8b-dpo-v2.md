# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-dpo-v2

## Resumen

szl-receiptagent-qwen35-0.8b-dpo-v2 es un modelo de generacion de texto de 873.438.784 parametros (aproximadamente 0,8 mil millones) publicado por SZLHOLDINGS en Hugging Face. Se presenta como un ajuste fino del modelo SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez parte de una arquitectura identificada en los tags como `qwen3_5`. El sufijo "dpo" indica que se ha aplicado una fase de optimizacion por preferencias directas (DPO) sobre una version previamente afinada con supervisado (SFT), presumiblemente orientada a tareas de "receipt agent" (agente de recibos o comprobantes).

El modelo se enmarca dentro de lo que el autor denomina "governed-AI estate": un conjunto de artefactos con trazabilidad documentada mediante ficheros de recibo (receipts) y auditorias con fecha. La model card es deliberadamente conservadora y declara explicitamente que cualquier afirmacion sobre calidad o capacidad que no este respaldada por un recibo medido se marca como UNKNOWN. De hecho, el escaneo estricto de recibos de noviembre de 2026 clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, con ficheros de recibo presentes pero sin un DONE.json en el estandar estricto, y la evidencia de evaluacion figura como UNKNOWN.

La relevancia practica del modelo es limitada pero concreta: se trata de un modelo pequeno (menos de 1.000 millones de parametros), con licencia Apache 2.0, pesos en safetensors y libreria transformers, lo que permite desplegarlo en hardware modesto. Su utilidad principal seria la extraccion estructurada y el procesamiento de documentos tipo recibo en ingles, aunque la ausencia de benchmarks publicados impide cuantificar su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, segun tag del repositorio) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 |
| Tamano del repositorio | 1,8 GB |
| Pipeline | text-generation |
| Descargas / likes | 379 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3_5` y de la libreria `transformers`, lo que sugiere una implementacion de transformer decoder-only compatible con el ecosistema Hugging Face. El numero de parametros (873.438.784) es coherente con un modelo denso de aproximadamente 0,8 mil millones de parametros en precision completa; el tamano del repositorio (1,8 GB) es consistente con pesos en bfloat16 o float16 (aproximadamente 1,75 GB para 873 millones de parametros).

El proceso de entrenamiento consta, segun la nomenclatura del repositorio, de al menos dos fases: una primera de ajuste supervisado (SFT) que da lugar al modelo base `szl-receiptagent-qwen35-0.8b-sft-v3`, y una segunda de optimizacion por preferencias directas (DPO) que produce esta version v2. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF adicional ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card indica que las afirmaciones sobre entrenamiento y evaluacion residen en ficheros de recibo del "estate mesh", pero el escaneo estricto no ha validado un DONE.json medido.

## Capacidades

- Generacion de texto en ingles, con especializacion declarada en tareas de agente de recibos (receipt agent), presumiblemente extraccion y estructuración de datos de comprobantes.
- Ajuste por preferencias (DPO) sobre una base SFT, lo que en principio mejora la alineacion con respuestas esperadas en el dominio de entrenamiento.
- Capacidad multilingue limitada: solo se declara ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso ni razonamiento extendido (thinking mode).
- No se documenta vision, audio ni otras modalidades.
- No se documentan capacidades de codigo o matematicas mas alla de lo que pueda emerger del modelo base qwen3_5.

## Casos de uso

- Extraccion de datos de recibos y comprobantes: el modelo puede procesar texto de tickets y devolver campos estructurados (fecha, importe, comercio, impuestos) en ingles, que es el idioma declarado y el dominio aparente de entrenamiento.
- Clasificacion documental en pipelines de contabilidad: dado su tamano reducido, puede desplegarse como clasificador o etiquetador de documentos en un flujo por lotes sin requerir GPU de gama alta.
- Preprocesamiento en sistemas de gestion de gastos: integrado como paso intermedio que normaliza y resume la informacion de un recibo antes de pasarla a un modelo mayor o a una base de datos.
- Prototipado rapido en entornos con recursos limitados: al ocupar menos de 2 GB en pesos completos, cabe en GPU de consumo y permite iterar sobre prompts y formatos de salida sin coste de infraestructura elevado.
- Generacion de resumenes breves de transacciones: puede producir descripciones cortas de operaciones a partir de texto de recibos, util para interfaces de usuario o registros de auditoria.
- Filtrado y validacion en pipelines de CI/CD de datos: puede actuar como primer filtro para detectar recibos mal formados o incompletos antes de un procesamiento posterior.
- Experimentacion academica sobre DPO en modelos pequenos: sirve como caso de estudio de un ajuste DPO sobre un modelo de menos de 1.000 millones de parametros con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos de 2026-11-22 clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json en el estandar estricto). Los ficheros `receipts/eval/doctrine-abstention-eval-dpo-v2-comparison.json` y `receipts/eval_battery.json` existen en el repositorio, pero no se han validado como evidencia medida ni se han proporcionado sus contenidos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 1,8-2,0 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 2,5-3,5 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,0-1,2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,5-0,7 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPU de consumo e incluso en iGPU con suficiente memoria compartida en cuantizacion 4 bits.
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad de formato safetensors, previsiblemente vLLM, TGI y llama.cpp/Ollama si se generan conversiones GGUF (no documentadas en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-dpo-v2 | 873 M | no disponible | Apache 2.0 | en | no disponibles |
| Qwen2.5-0.5B / Qwen3-0.6B (familia de referencia) | ~0,5-0,6 B | 32 K (segun version) | Apache 2.0 | multilingue | si, publicados por el autor |
| Llama 3.2 1B | 1,24 B | 128 K | Llama 3.2 Community License | multilingue | si, publicados por el autor |
| SmolLM2-1.7B | 1,7 B | 8 K | Apache 2.0 | en (principalmente) | si, publicados por el autor |

La comparacion cuantitativa con estos modelos no es posible porque el modelo de SZLHOLDINGS no publica resultados de benchmarks. En terminos de contexto y capacidades declaradas, queda por debajo de las alternativas de la misma franja de tamano, que documentan ventanas de contexto y evaluaciones estandar. Su ventaja relativa es la licencia Apache 2.0 y el enfoque especifico en el dominio de recibos, aunque sin evidencia medida que lo respalde.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia medida de calidad, lo que impide comparar su rendimiento con alternativas y desaconseja su uso en produccion sin una evaluacion propia previa.
- El escaneo estricto de recibos lo clasifica como RECEIPT_FILES_NO_DONE, con evidencia de evaluacion UNKNOWN; los ficheros de recibo presentes no han sido validados como evidencia.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto no documentada: no se puede planificar su uso en documentos largos sin verificacion empirica.
- Riesgo de alucinacion inherente a los modelos de ~0,8 B de parametros, especialmente en extraccion de campos numericos o fechas; se recomienda validacion posterior en produccion.
- No se documentan sesgos conocidos, pero al ser un ajuste sobre un modelo base no identificado con detalle, los sesgos de ese modelo base se heredan sin cuantificar.
- La licencia Apache 2.0 permite uso comercial, pero la falta de garantias y de evaluacion publicada traslada al integrador toda la responsabilidad sobre el comportamiento del modelo.
- El repositorio tiene 379 descargas y 0 likes, lo que indica una adopcion muy baja y poca validacion por parte de la comunidad.
- La model card es generada automaticamente por una herramienta ("estate-cards weaver") y no contiene informacion tecnica sustantiva sobre datos de entrenamiento o hiperparametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-dpo-v2
- Modelo base (SFT): https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de model cards: https://github.com/szl-holdings/estate-cards
