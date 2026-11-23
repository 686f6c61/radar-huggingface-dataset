# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-nemo-candidate

## Resumen

szl-receiptagent-qwen35-0.8b-v3-nemo-candidate es un modelo publicado por SZLHOLDINGS dentro de su catalogo denominado "governed-AI estate", una coleccion de modelos, datasets y Spaces con resultados trazables mediante ficheros de recibo (receipts). El nombre sugiere un modelo derivado de la familia Qwen3.5 con aproximadamente 0.800 millones de parametros, orientado a tareas de agente sobre recibos y con una variante "nemo" y "candidate" que indica un artefacto en fase de candidatura dentro de su fabrica de entrenamiento.

La model card no aporta informacion tecnica verificable sobre arquitectura, datos de entrenamiento, idiomas, licencia ni resultados de evaluacion. El propio autor declara explicitamente que cualquier afirmacion de calidad o capacidad queda marcada como UNKNOWN hasta que exista un recibo de evaluacion medido (DONE.json con status=MEASURED), y el escaneo de recibos de la tranche 4 clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, con ficheros de recibo presentes pero sin evidencia estricta de evaluacion.

El repositorio tiene un tamano de 0.0 GB, 9 descargas y 0 likes en el momento de la consulta, y solo expone la etiqueta safetensors y region:us. Se trata, por tanto, de un artefacto de disponibilidad muy limitada y sin documentacion publica suficiente para evaluar su idoneidad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere derivacion de Qwen3.5, sin confirmar) |
| Parametros totales | 0.8B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (unica etiqueta tecnica declarada) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El identificador del repositorio incluye "qwen35", lo que sugiere una base de la familia Qwen3.5, y "nemo", que podria referirse a una variante de entrenamiento o a la integracion con el ecosistema NVIDIA NeMo, pero ninguno de estos extremos esta confirmado por el autor. Tampoco se detalla si se trata de un transformer denso, un modelo MoE o una arquitectura hibrida.

Respecto al entrenamiento, la model card remite a los ficheros de recibo del repositorio, en particular train_receipt.json, como unica fuente de afirmaciones sobre entrenamiento y evaluacion. No se especifica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El autor declara explicitamente que cualquier dato no incluido en un recibo medido se considera UNKNOWN, por lo que no es posible verificar ninguna innovacion tecnica ni procedimiento de alineamiento.

## Capacidades

- Generacion de texto: no confirmada por el autor; la model card no incluye ninguna afirmacion de capacidad.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: el nombre del repositorio ("receiptagent") sugiere orientacion a agentes sobre recibos, pero no hay evidencia publicada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Procesamiento de recibos y documentos financieros: el nombre del modelo sugiere un uso orientado a la extraccion y verificacion de datos de recibos, aunque no hay documentacion que confirme esta capacidad ni su precision.
- Automatizacion de agentes con trazabilidad: el enfasis del autor en recibos medibles (receipts) apunta a un uso en pipelines donde cada salida deba quedar auditada, pero sin evidencia de evaluacion no puede recomendarse para produccion.
- Prototipado interno en entornos controlados: dado su tamano reducido (0.8B), podria emplearse para pruebas de concepto en maquinas sin GPU dedicada, siempre que se valide previamente su comportamiento.
- Experimentacion en investigacion sobre modelos pequenos: util como artefacto de estudio de la metodologia de "governed AI" del autor, no como modelo de referencia.
- Evaluacion comparativa de tecnicas de recibos: el repositorio puede servir para estudiar el formato de receipts y su aplicacion a modelos pequenos.
- Integracion en pipelines de CI con verificacion de artefactos: el formato safetensors y el enfasis en trazabilidad permiten plantear su uso en flujos de validacion, aunque la ausencia de licencia y benchmarks limita su adopcion.

En todos los casos, la ausencia de licencia, idiomas y benchmarks hace que cualquier uso en produccion requiera una validacion propia exhaustiva antes de desplegarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0.8B en precision FP16 se situaria en torno a 1.6 GB de pesos, y en cuantizacion de 4 bits en torno a 0.4-0.5 GB, aunque estas cifras son estimaciones genericas no confirmadas por el autor.
- GPU recomendadas: no disponible; por tamano, cabria en GPUs de consumo como RTX 3060, RTX 4060 o superiores, sin confirmacion oficial.
- Compatibilidad con GPU de consumo: probable por el tamano, pero no verificada.
- Opciones de despliegue: no disponible; al publicarse en safetensors, seria compatible con frameworks como transformers, vLLM o TGI, y con llama.cpp u Ollama si se generan cuantizaciones GGUF, pero no hay confirmacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han publicado especificaciones verificables de este modelo (parametros confirmados, contexto, licencia o rendimiento) que permitan una comparacion rigurosa con alternativas de la misma categoria. La unica referencia es el tamano aproximado de 0.8B inferido del nombre, insuficiente para establecer una comparativa fiable.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede determinar si el uso comercial esta permitido.
- Sin idiomas declarados: no se puede garantizar el soporte de castellano ni de ningun otro idioma.
- Sin benchmarks ni evidencia de evaluacion medida: el autor marca explicitamente la evidencia como UNKNOWN.
- Riesgo de alucinacion desconocido: al no haber evaluaciones publicadas, no se puede estimar la fiabilidad de las salidas.
- Sesgos desconocidos: sin informacion sobre datos de entrenamiento ni proceso de alineamiento.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Repositorio con tamano de 0.0 GB: posiblemente los pesos no esten subidos o el artefacto este incompleto, lo que impediria su descarga y uso.
- Estado "candidate": el propio nombre indica que no es una version estable ni final.
- Advertencia de seguridad: la model card incluye contenido generado automaticamente y enlaces a recursos externos; debe tratarse como material de referencia no verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-nemo-candidate
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio estate-cards (referenciado en la model card): https://github.com/szl-holdings/estate-cards
