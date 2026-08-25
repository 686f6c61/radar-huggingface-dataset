# TigreGotico/AKK-60m-onnx

## Resumen

AKK-60m-onnx es la exportación a formato ONNX del modelo Thalesian/AKK-60m, un sistema de traducción neuronal especializado en acadio, la lengua semítica documentada en tablillas cuneiformes de Mesopotamia. El autor del export, TigreGotico, mantiene los pesos originales sin cambios y añade los grafos de inferencia necesarios para ejecutar el modelo en CPU mediante la librería linguonnx. El modelo resuelve un problema muy concreto: traducir entre acadio cuneiforme, transliteración simple y inglés, una tarea que el procesamiento del lenguaje natural generalista no aborda por la escasez de corpus y la complejidad del sistema de escritura.

La arquitectura es un transformer encoder-decoder tipo T5 con 60 millones de parámetros y una ventana de contexto de 512 tokens. El repositorio incluye dos precisiones, fp32 e int8, lo que permite desplegarlo en entornos sin GPU con un coste de memoria reducido. La relevancia actual radica en que la comunidad de humanidades digitales necesita herramientas de traducción para corpus cuneiformes como los de la base de datos CDLI, y este modelo cubre ese hueco con una licencia Apache-2.0 que facilita su uso académico y comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 60 millones |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 e int8 |
| Idiomas soportados | acadio (cuneiforme y transliteracion), ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos separados para encoder, decoder y decoder con past), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Thalesian/AKK-60m es un transformer encoder-decoder de la familia T5, con 60 millones de parametros. La exportacion ONNX mantiene la arquitectura original y la divide en tres grafos que linguonnx orquesta para la generacion: encoder, decoder y decoder con cache de atencion (decoder-with-past). Esta separacion permite gestionar la inferencia de forma incremental, lo que resulta util para textos largos que superan la ventana de 512 tokens.

Los datos de entrenamiento provienen de los corpus Akkademia y CDLI, aunque la model card no especifica el numero exacto de tokens ni la proporcion de cada fuente. El entrenamiento se realizo en el modelo base Thalesian/AKK-60m, y no se menciona el uso de tecnicas de RLHF o DPO. La exportacion ONNX no modifica los pesos; solo anade los grafos y la cuantizacion int8. La verificacion se realizo comparando la tokenizacion y la salida de beam search con el modelo PyTorch original, obteniendo coincidencias exactas en todas las direcciones de traduccion.

## Capacidades

- Traduccion automatica entre acadio cuneiforme e ingles en ambas direcciones.
- Traduccion entre acadio cuneiforme y transliteracion simple a caracteres latinos.
- Transliteracion de cuneiforme a transliteracion simple (sin direccion inversa registrada).
- Soporte de instrucciones para seleccionar la tarea, unidas al input con `": "` (por ejemplo, `Translate Akkadian cuneiform to English: ...`).
- Tokenizacion con SentencePiece de 32 000 piezas y un vocabulario ampliado de 32 518 tokens que incluye signos cuneiformes y diacriticos de transliteracion.
- Inferencia en CPU mediante ONNX Runtime y la libreria linguonnx, con cuantizacion int8 para reducir el uso de memoria.

## Casos de uso

- **Investigacion asiriologica**: traduccion automatica de tablillas cuneiformes procedentes de bases de datos como CDLI o Akkademia, facilitando el trabajo de los egiptologos y asiriologos que necesitan una primera version en ingles de textos fragmentarios.
- **Digitalizacion de archivos historicos**: las instituciones que digitalizan colecciones cuneiformes pueden pre-procesar las imagenes de tablillas, extraer el texto cuneiforme y pasarlo por el modelo para obtener una traduccion inicial antes de la revision humana.
- **Ensenanza de lenguas antiguas**: en cursos de asiriologia, el modelo puede servir como herramienta de apoyo para que los estudiantes comparen sus propias transliteraciones y traducciones con las del modelo, aunque siempre con supervisio del profesor.
- **Transliteracion de corpus**: dado que el modelo convierte cuneiforme en transliteracion simple, puede utilizarse para generar versiones en caracteres latinos de textos cuneiformes, un paso previo a la traduccion o al analisis linguistico.
- **Traduccion de textos breves en museos**: paneles explicativos o catalogos de museos pueden traducir frases cortas de tablillas al ingles para el publico general, aprovechando que la ventana de 512 tokens es suficiente para textos epigraficos tipicos.
- **Integracion en pipelines de NLP**: al estar en formato ONNX, el modelo se puede integrar en servicios de traduccion en CPU (por ejemplo, con FastAPI y ONNX Runtime) para aplicaciones web de consulta de fuentes primarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base no incluye metricas como BLEU, MMLU o HumanEval. El autor indica que la calidad de la traduccion acadio-ingles generaliza mal fuera del dominio de entrenamiento, pero no se proporcionan cifras cuantitativas.

## Requisitos de hardware

- **VRAM estimada**: al ser una exportacion para CPU, no requiere GPU. La version fp32 ocupa aproximadamente 0.7 GB en disco; la version int8 reduce ese tamano, aunque el valor exacto no se especifica.
- **GPU recomendadas**: no aplica; el modelo esta disenado para inferencia en CPU con ONNX Runtime.
- **GPU de consumo**: no es necesario; cualquier CPU moderna con soporte para las operaciones ONNX deberia bastar para la inferencia de un modelo de 60M parametros.
- **Opciones de despliegue**: linguonnx (libreria del autor) con ONNX Runtime, o cualquier runtime ONNX compatible (onnxruntime, ort, etc.).
- **Latencia y throughput**: no se proporcionan datos especificos; para un modelo de 60M parametros en CPU, se espera latencia de decenas de milisegundos por token, aunque depende del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. No se conocen alternativas publicas especificas para traduccion de acadio a ingles con la misma arquitectura y tamano.

## Limitaciones y advertencias

- **Contexto limitado**: la ventana de 512 tokens obliga a dividir textos largos linea a linea, lo que puede perder el contexto global de la traduccion.
- **Generalizacion pobre**: el autor del modelo base reporta que la traduccion acadio-ingles generaliza mal fuera del dominio de entrenamiento; los textos de epocas o regiones no representadas en los corpus de entrenamiento pueden producir resultados incorrectos.
- **Direcciones no disponibles**: no existe instruccion para transliterar de caracteres latinos a cuneiforme; el modelo no registra esa tarea.
- **Dependencia de las instrucciones**: si se proporciona una instruccion que el modelo no ha visto, responde igualmente en la direccion que decide, por lo que la instruccion es obligatoria y debe ser exacta.
- **Riesgo de alucinacion**: como todo modelo de traduccion neuronal, puede generar texto fluido pero incorrecto, especialmente con terminologia especializada o signos danados.
- **Licencia de los corpus**: aunque el modelo es Apache-2.0, los corpus subyacentes (Akkademia y CDLI) tienen sus propios terminos de uso que deben respetarse al redistribuir o usar los datos.
- **Tokenizacion fragile**: si se ignora el fichero `added_tokens.json`, todos los signos cuneiformes se convierten en `<unk>` sin generar error, lo que provocaria traducciones vacias o incorrectas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/TigreGotico/AKK-60m-onnx)
- [Modelo base de Thalesian](https://huggingface.co/Thalesian/AKK-60m)
- [Libreria linguonnx](https://github.com/TigreGotico/linguonnx)
- [Repositorio ONNX Models (referencia general)](https://github.com/onnx/models)
- [ONNX Runtime Models](https://onnxruntime.ai/models)
