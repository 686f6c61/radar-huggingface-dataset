# ToTo-40417/EXLLM-JPTOEN

## Resumen

EXLLM-JPTOEN es un modelo de lenguaje experimental de tipo "little language model" desarrollado por el usuario ToTo-40417, orientado a una tarea muy concreta: generar expresiones breves en ingles a partir de entradas en japones con predominio de kana. No es un modelo de traduccion general, sino un sistema de vocabulario cerrado construido sobre 266 entradas lexicas registradas en un contrato de datos propio.

Tecnicamente es un transformer decoder-only de 5.377.824 parametros (aproximadamente 0,0054B), con 6 capas, tamano oculto 288, 9 cabezas de atencion, FFN de 896 y un contexto de solo 128 tokens. Su vocabulario es de 868 tokens, basado en caracteres japoneses frecuentes con respaldo de bytes UTF-8 y normalizacion NFC. La relevancia del proyecto no esta en su capacidad generica, sino en la demostracion de inferencia entera en hardware empotrado: se ha verificado ejecucion EXQ12 en una agenda electronica CASIO EX-word XD-B4800 (DATAPLUS 6) a unos 0,57-0,58 tokens/s, con un checkpoint GGUF companero entrenado por separado para LM Studio y llama.cpp.

El checkpoint registra 100.003.620 tokens de entrada procesados (no unicos), con 97.102.074 tokens de continuacion en 11.488 pasos. La evaluacion es especifica del proyecto y muestra una generalizacion muy limitada: 266/266 en palabras conocidas aisladas frente a solo 34/266 en plantillas de consulta totalmente no vistas. La licencia es Apache-2.0 y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 5.377.824 (checkpoint EXLLM embebido); 5.441.184 (companero GGUF) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (0,000128M) |
| Tipos de cuantizacion | FP32, INT8 (decuantizado), EXQ12 (entero, proyecto propio), GGUF F16 |
| Idiomas soportados | japones (entrada con predominio de kana), ingles (salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt), GGUF (F16), EXQ12 (.q12); acompanados de config.json y tokenizer.json |

Datos adicionales de arquitectura: 6 capas, hidden size 288, 9 cabezas de atencion, FFN de 896, embeddings de token atados a la cabeza de salida, vocabulario de 868 tokens. El recuento de parametros excluye la duplicacion por pesos atados.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de escala muy reducida (6 capas, hidden 288, FFN 896) con embeddings atados y tokenizador especifico que combina caracteres japoneses frecuentes con un mecanismo de respaldo por bytes UTF-8 en NFC. El contexto maximo es de 128 tokens y el vocabulario de 868 entradas, lo que refleja que el modelo no esta disenado para dialogo abierto sino para mapeos cortos entrada-salida dentro de un lexico cerrado. El modelo continua a partir de un checkpoint interno no publicado de la misma arquitectura, sin usar ningun checkpoint preentrenado externo.

El entrenamiento registra 100.003.620 tokens de entrada procesados sin padding, de los cuales 97.102.074 corresponden a tokens de continuacion a lo largo de 11.488 pasos con semilla 40417001. Este recuento no equivale a tamano de corpus unico: el entrenamiento remuestrea repetidamente ejemplos deterministas derivados de un lexico de 266 filas redactado por el proyecto, plantillas finitas de pregunta y ruido, y listas de calibracion de desconocidos. No se registra ningun corpus diccionario de terceros ni rastreo web en el linaje del checkpoint. La model card no menciona RLHF, DPO ni tecnicas de alineacion; tampoco innovaciones como decodificacion especulativa o atencion lineal. El artefacto GGUF incluido es un companero entrenado por separado, no una conversion ni cuantizacion del checkpoint embebido, y difiere en pesos, tokenizador, detalles de arquitectura y contexto de ejecucion.

## Capacidades

- Generacion de texto muy restringida: produce expresiones cortas en ingles a partir de entradas japonesas en kana dentro del dominio de su lexico registrado.
- Reconocimiento de palabras conocidas: 266/266 aciertos en la suite de palabras aisladas conocidas y 262/266 en formas de consulta de familias aprendidas.
- Respuesta de rechazo: devuelve `unknown` ante entradas fuera del contrato de vocabulario, con 12/12 en desconocidos ambiguos, 62/64 en desconocidos no palabras (nonce) y 22/40 en retencion de palabras reales desconocidas.
- Salida ASCII visible: 925/925 en la suite correspondiente, lo que implica que no emite caracteres fuera del repertorio ASCII esperado.
- Inferencia entera en hardware empotrado: verificada con EXQ12 en CASIO EX-word XD-B4800 (DATAPLUS 6), incluyendo identificacion de modelo, carga, inferencia y captura de log desde almacenamiento interno y cache microSD.
- Compatibilidad con llama.cpp y LM Studio mediante el GGUF F16 companero, con modo de un solo turno (`--single-turn`).
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada estrictamente al par japones-ingles descrito; no se documenta traduccion libre general.

## Casos de uso

- Diccionario electronico empotrado: el modelo esta pensado para integrarse en dispositivos tipo CASIO EX-word y resolver consultas kana a ingles de un lexico cerrado, con consumo de memoria minimo y ejecucion entera verificada en el propio hardware.
- Aplicacion de aprendizaje de vocabulario japones: puede desplegarse en movil o dispositivo de bajo consumo para ofrecer equivalencias inglesas de un conjunto acotado de terminos, aprovechando su tamano inferior a 6M de parametros.
- Prueba de concepto de inferencia en microcontroladores y wearables: sirve como banco de pruebas para pipelines de cuantizacion entera (EXQ12, INT8) y para validar flujos de despliegue en hardware con recursos muy limitados.
- Filtro o normalizador de consultas en un sistema mayor: dado su comportamiento de rechazo ante entradas fuera del contrato, puede actuar como clasificador de "conocido" frente a "desconocido" previo a un modelo mayor.
- Demostracion educativa de ciclo completo de entrenamiento: el proyecto publica hashes, manifiestos de datos, linaje y conjuntos de regresion, lo que lo hace util para ensenar procedencia de datos y evaluacion reproducible a escala diminuta.
- Pruebas de integracion con llama.cpp y LM Studio: el GGUF F16 permite validar cadenas de despliegue locales en PC de gama media antes de portar logica a dispositivos empotrados.
- Verificacion de regresion en CI: los conjuntos de evaluacion del proyecto (incluido `common-eval-int8.json`) pueden usarse como pruebas automatizadas para detectar degradaciones al recuantizar o reexportar pesos.

## Benchmarks y rendimiento

Los datos disponibles son suites de regresion propias del proyecto con decodificacion greedy, no benchmarks estandar de traduccion ni de lenguaje general. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la informacion disponible.

| Suite (proyecto) | Resultado |
|---|---:|
| Palabras conocidas aisladas | 266 / 266 |
| Formas de consulta de familias aprendidas | 262 / 266 |
| Plantillas de consulta totalmente no vistas | 34 / 266 |
| Retencion de palabras reales desconocidas | 22 / 40 |
| Desconocido ambiguo | 12 / 12 |
| Desconocido no palabra (nonce) | 62 / 64 |
| Fuera de distribucion general | 5 / 5 |
| Conjunto de regresion EX-word | 6 / 6 |
| Salida ASCII visible | 925 / 925 |

Notas de rendimiento: FP32 y INT8 decuantizado produjeron los mismos resultados en estas suites. En la XD-B4800 la decodificacion medida fue de aproximadamente 0,57-0,58 tokens/s con EXQ12. En una prueba de humo con llama.cpp sobre una RTX 3060, el GGUF F16 genero `good morning` a aproximadamente 415 tokens/s; el autor advierte que esta cifra de PC no es directamente comparable con el modelo de EX-word. La suite de "retencion de palabras reales desconocidas" mide el rechazo de palabras fuera del contrato de vocabulario, no la exactitud de traduccion, por lo que salidas semanticamente correctas como `たまご → egg` o `にく → meat` cuentan como fallos en esa suite.

## Requisitos de hardware

- VRAM estimada para inferencia del checkpoint EXLLM: aproximadamente 20-21 MiB en FP32, unos 10-11 MiB en FP16, unos 5 MiB en INT8 y una huella similar en EXQ12, dado un total de 5,38M de parametros.
- El companero GGUF F16, con 5,44M de parametros, ocupa del orden de 10-11 MiB en disco y memoria, sin contar el coste del contexto (limitado a 128 tokens en el checkpoint embebido).
- Cabe sin dificultad en practicamente cualquier GPU de consumo, incluida una RTX 3060, y tambien en CPU, dispositivos empotrados y hardware especializado como la CASIO EX-word XD-B4800.
- GPU recomendadas: no se especifican requisitos minimos; la unica GPU citada en la informacion es una RTX 3060 para la prueba de humo con llama.cpp. Para este tamano, GPU de gama de entrada o incluso inferencia en CPU son suficientes.
- Opciones de despliegue documentadas: llama.cpp y LM Studio con el GGUF F16; runtime de referencia PyTorch del repositorio `exllm`; y `exllm-exword` v1.3.1 o superior para el dispositivo CASIO con pesos EXQ12. Se menciona `exllm-model-check` para validar el archivo antes del despliegue.
- Latencia y throughput: aproximadamente 0,57-0,58 tokens/s en la XD-B4800 con EXQ12 y aproximadamente 415 tokens/s en la prueba con llama.cpp sobre RTX 3060 (medicion no comparable entre si). No hay datos de latencia publicados para el checkpoint PyTorch.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de la misma categoria, y la model card no ofrece alternativas de referencia. Cabe senalar que se trata de un modelo de tarea especifica con lexico cerrado y contexto de 128 tokens, por lo que no resulta directamente comparable con modelos de traduccion automatica generica ni con modelos de lenguaje de proposito general, aunque compartan un orden de magnitud de parametros.

## Limitaciones y advertencias

- El propio autor indica que no es un modelo de traduccion general, sino un modelo de tarea especifica centrado en 266 entradas lexicas.
- Generalizacion muy limitada: solo 34/266 en plantillas de consulta totalmente no vistas, resultado que el autor senala como la limitacion mas clara. Los 100.003.620 tokens procesados no establecieron capacidad gramatical amplia ni traduccion general.
- Los tokens de entrenamiento no equivalen a corpus unico: la mayor parte son repeticiones de ejemplos deterministas y derivados de plantillas, lo que favorece el sobreajuste al contrato de datos.
- Riesgo de alucinacion y de salidas incorrectas: en las pruebas fisicas se documentan respuestas correctas, respuestas `unknown` apropiadas y salidas inglesas erroneas; por ejemplo, `ぎんこう` produjo `temperature`.
- Contexto de solo 128 tokens en el checkpoint embebido, insuficiente para conversaciones multi-turno o documentos largos. El GGUF companero tiene su propio contexto de ejecucion, no necesariamente el mismo.
- Ambito idiomatico restringido: entrada en japones orientada a kana y salida en ingles; no se documenta soporte de otros idiomas ni de japones con kanji complejo.
- El GGUF incluido es un companero entrenado por separado, no una conversion del checkpoint embebido; sus pesos, tokenizador y arquitectura difieren, por lo que los resultados no son intercambiables entre artefactos.
- Los resultados de regresion en host no deben interpretarse como calidad de traduccion libre; las suites de desconocidos miden rechazo de vocabulario, no exactitud semantica.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo depende de recursos y linaje internos del proyecto (lexico de 266 filas y plantillas) cuya reutilizacion fuera del proyecto no esta documentada en detalle en la informacion disponible.
- Modelo con 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin adopcion externa conocida.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a entidades homonimas sin relacion (la marca de sanitarios TOTO y la banda de rock Toto), por lo que no se ha podido verificar informacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToTo-40417/EXLLM-JPTOEN
- Repositorio principal del runtime de referencia: https://github.com/ToTo-40417/exllm
- Documento de procedencia de datos: https://github.com/ToTo-40417/exllm/blob/main/docs/EXLLM_JPTOEN_DATA_PROVENANCE.md
- Manifiesto del caso de estudio (machine-readable): training/exllm-jptoen-case-study.json (dentro del repositorio `exllm`)
- Conjunto de evaluacion comun INT8: https://github.com/ToTo-40417/exllm/blob/main/benchmarks/jptoen/common-eval-int8.json
- Caso de estudio de entrenamiento de 5M fijos y generalizacion: https://github.com/ToTo-40417/exllm/blob/main/docs/case-studies/fixed-5m-training-and-generalization.md
- Adaptador para CASIO EX-word: https://github.com/ToTo-40417/exllm-exword
- Herramienta de verificacion de modelos: https://github.com/ToTo-40417/exllm-model-check
- Manifiestos del companero GGUF: lmstudio/training_manifest.json y lmstudio/dataset-manifest.json (dentro del repositorio `exllm`)
- Documento de procedencia en el repositorio: DATA_PROVENANCE.md
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo (los resultados correspondian a entidades homonimas sin relacion).
