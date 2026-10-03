# x8bu/gidi-finance

## Resumen

Gidi — GiaoDịch (`x8bu/gidi-finance`) es un clasificador de texto en vietnamita especializado en notas breves de finanzas personales, como `mượn chú hai 5 xị`. Lo desarrolla el usuario `x8bu` como experimento propio para construir un clasificador pequeno y ejecutable en dispositivo. Para cada nota, el modelo predice tres cosas: el `type` de transaccion (una de ocho categorias: expense, income, borrow, lend, repayment_in, repayment_out, transfer, refund), el `target` o contraparte (por ejemplo `chú hai`) y el `value` o importe tal y como lo escribio el usuario (por ejemplo `5 xị`), devolviendo spans con offsets en lugar de valores normalizados.

Tecnicamente es la release `2.0.2` del modelo `gidi-finance-v2`, construido como un `value-span-v7-dual-encoder` (seed 1): un grafo ONNX unico con dos ramas encoder. Una rama parte del encoder congelado `gidi-finance-v1` y predice `type` y `target`; la segunda es una copia fine-tuneada del mismo encoder con una capa CRF que predice el span de `value`. El modelo normaliza la entrada a NFC y trunca a 32 tokens.

Su relevancia practica esta en el nicho: modelos de extraccion de informacion financiera en vietnamita para ejecucion local, con un peso INT8 de solo 57,5 MB, licencia Apache 2.0 y un pipeline definido mediante ONNX Runtime. No es un modelo generativo ni un LLM: es un clasificador de tokens pequeno pensado para integrarse en aplicaciones moviles de contabilidad personal que funcionan sin conexion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder (dos ramas sobre encoder tipo transformer) en un unico grafo ONNX; rama de `value` con capa CRF |
| Parametros totales | no disponible (el autor no publica la cifra; el fichero FP32 pesa 228,8 MB y el INT8 57,5 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 tokens (la entrada se trunca a ese limite) |
| Tipos de cuantizacion | INT8 y FP32 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`, `model.onnx`), acompanado de `config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab_map.json` |

## Arquitectura y entrenamiento

El modelo es un `dual encoder` empaquetado en un solo grafo ONNX. La primera rama reutiliza el encoder congelado `gidi-finance-v1` y se encarga de dos tareas: clasificacion de `type` (ocho categorias) y extraccion del span `target`. La segunda rama es una copia del mismo encoder sometida a fine-tuning, con una capa CRF para el etiquetado secuencial del span `value`. El grafo recibe `input_ids` y `attention_mask`, y devuelve `type_logits`, `tag_logits` y `value_logits`. La decodificacion del span de valor requiere Viterbi sobre el CRF usando los pesos recogidos en `config.json`; el autor advierte explicitamente de que un simple argmax no es equivalente.

El preprocesado normaliza el texto a NFC y trunca la nota a 32 tokens, marcando el resultado con `truncated = true` cuando se supera ese limite. No se detalla en la informacion disponible el volumen ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO (no procede en un clasificador de este tipo). El bundle de release incluye el modelo, los ficheros de tokenizacion, la configuracion de etiquetas y del CRF, la licencia y un manifiesto con hashes SHA-256 por fichero, lo que permite verificar la integridad de la descarga con `sha256sum -c --ignore-missing checksums.txt`.

## Capacidades

- Clasificacion de transacciones: asigna a cada nota uno de ocho `type` (expense, income, borrow, lend, repayment_in, repayment_out, transfer, refund), con probabilidad softmax asociada en `type_confidence`.
- Extraccion de contraparte: devuelve el texto del `target` y su span `[start, end]` en offsets de code points, o `null` si no existe.
- Extraccion del importe como span: devuelve `value_text` y `value_span` tal y como lo escribio el usuario, con `value_confidence` calculada como media geometrica de las probabilidades de las etiquetas de los tokens del span. No convierte ni normaliza la cantidad.
- Decodificacion CRF: el span de valor se obtiene mediante Viterbi sobre la matriz de transiciones del CRF, lo que aporta coherencia secuencial al etiquetado.
- Salida estructurada: el diccionario resultante incluye `truncated` y `model_version` ademas de los campos anteriores.
- Ejecucion en dispositivo: pensado para inferencia local, sin dependencia de servicios externos.
- Multilingue: no. Soporta unicamente vietnamita.
- Tool calling, agentes, razonamiento multi-paso, vision o audio: no soportado. Es un modelo discriminativo de clasificacion de tokens, no generativo.

## Casos de uso

- Aplicacion movil de finanzas personales sin conexion: el bundle INT8 de 57,5 MB se ejecuta con ONNX Runtime en el propio dispositivo, de modo que las notas del usuario nunca salen del telefono. El modelo convierte una frase libre como `mượn chú hai 5 xị` en una transaccion tipada con contraparte y span de importe.
- Registro rapido de deudas entre particulares: la distincion explicita entre borrow, lend, repayment_in y repayment_out permite llevar un libro de prestamos personales clasificado automaticamente a partir de anotaciones informales.
- Conciliacion de transferencias y reintegros: los tipos transfer y refund permiten separar movimientos internos y devoluciones del resto de gastos e ingresos antes de agregarlos en un balance.
- Preprocesado en un pipeline hibrido de extraccion: dado que el modelo solo devuelve el span del importe, se puede encadenar a un normalizador propio de cantidades (incluida la jerga coloquial vietnamita) y a un parser de fechas para obtener valores numericos estructurados.
- Indexado y busqueda sobre historiales de notas: clasificar por lotes un historial de anotaciones permite filtrar por tipo de transaccion o por contraparte usando los spans devueltos.
- Integracion con asistentes de voz en vietnamita: tras una transcripcion ASR, el texto resultante se puede pasar directamente al clasificador para generar el apunte financiero correspondiente.
- Enriquecimiento de registros introducidos en hojas de calculo o formularios: el modelo puede sugerir tipo, contraparte e importe mientras el usuario escribe, aprovechando las confianzas devueltas para decidir cuando pedir confirmacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (ni F1 por tarea, ni exactitud de spans, ni comparaciones cuantitativas int8 frente a fp32 mas alla de la nota cualitativa de que `type` y `target` difieren en algunas notas con puntuaciones cercanas).

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 200 MB con el fichero INT8 (57,5 MB de pesos) y del orden de 300-500 MB con el FP32 (228,8 MB de pesos), contando memoria de activaciones y overhead del runtime. Son cifras derivadas del tamano de los ficheros; el autor no publica mediciones.
- GPU recomendadas: dado el tamano, cualquier GPU es sobredimensionada. Funciona correctamente en CPU y en GPUs de gama de entrada; en centros de datos, A100 o H100 no aportan ventaja relevante para este modelo.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo (por ejemplo RTX 3060, RTX 4090) e incluso en CPU, movil o dispositivos embebidos, que es el objetivo declarado del modelo.
- Opciones de despliegue: ONNX Runtime (>= 1.30.0) es la via oficial, a traves del paquete `gidi` (`gidi.inference.predictor.GidiPredictor`). Se requiere Python >= 3.12, `tokenizers` >= 0.23.2 y `numpy` >= 2.0. No se contempla despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo en formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificadores de notas financieras en vietnamita para ejecucion en dispositivo) ni datos de rendimiento que permitan establecer una comparacion cuantitativa con alternativas. Tampoco se dispone de cifras de parametros de este modelo, lo que impide contrastarlo por tamano.

## Limitaciones y advertencias

- Absorcion de fechas en el span de importe: en `cho a Nam vay 1 triệu 20/10`, el modelo devuelve `1 triệu 20/10` como `value`, agrupando la fecha dentro del span. El valor correcto seria `1 triệu`.
- Divergencia INT8 frente a FP32: en algunas notas con puntuaciones cercanas, `type` y `target` difieren entre la variante cuantizada y la de referencia, con un comportamiento identico al del modelo INT8 v1.
- Sin normalizacion de entrada: el modelo no convierte espacios no separables (NBSP) ni digitos de ancho completo, que se pasan tal cual al modelo y pueden degradar el resultado.
- Truncamiento a 32 tokens: si el importe queda mas alla del punto de corte, el modelo devuelve `null` y marca `truncated = true`. Las notas largas pueden perder informacion de forma silenciosa si no se comprueba ese campo.
- Sin extraccion ni normalizacion de cifras: el modelo no convierte el importe a numero ni extrae o normaliza fechas. Cualquier calculo posterior requiere un componente adicional.
- Ausencia de clase "out of scope": toda nota recibe forzosamente uno de los ocho tipos, incluso cuando no describe una transaccion financiera, lo que puede producir clasificaciones erroneas con alta confianza aparente.
- Un solo idioma: soporte unicamente de vietnamita. No hay capacidades multilingues.
- Riesgo de alucinacion: limitado al marco de la tarea (no genera texto libre), pero pueden aparecer spans de `target` o `value` incorrectos o mal delimitados, especialmente en textos ambiguos o con jerga no cubierta.
- Sesgos conocidos: no disponible. El autor no documenta analisis de sesgos ni la composicion del dataset de entrenamiento.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero LICENSE incluido en el bundle.
- Caveat de integracion en produccion: la rama de `value` exige decodificacion Viterbi con los pesos CRF de `config.json`. Implementar solo `argmax` sobre `value_logits` produce resultados incorrectos.
- Madurez del proyecto: el propio autor lo describe como un experimento, con 0 descargas y 0 likes en el momento de la ficha, y un unico autor sin proceso de validacion externo documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/x8bu/gidi-finance
- Variante FP32 y archives de release: la model card indica que el archive `-fp32` esta unicamente en las releases de GitHub del autor, pero no se proporciona la URL concreta en la informacion disponible.
- Paquete `gidi` (modulo `gidi.inference`, necesario para `GidiPredictor`): no se proporciona la URL del repositorio en la informacion disponible.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las unicas entradas devueltas corresponden a calculadores de rutas en coche entre Tours y Les Sables-d'Olonne (Mappy, ViaMichelin, Rome2rio) y no guardan relacion con el modelo.
