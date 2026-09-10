# Tazner/Gliner-small-edge-wo-int8-emb4

## Resumen

Tazner/Gliner-small-edge-wo-int8-emb4 es una compilacion ONNX cuantizada del modelo de reconocimiento de entidades nombradas (NER) zero-shot GLiNER small v2.5, publicado por el usuario Tazner sobre el modelo base gliner-community/gliner_small-v2.5. Su proposito es ofrecer una variante de 131,9 MB pensada para despliegue en el borde (edge) y en CPU, un 58 % mas pequena que la exportacion ONNX estandar en fp16 (317 MB), sin perdida de recall medible en el conjunto de prueba del autor.

La innovacion principal es el tipo de cuantizacion empleada. En lugar de la cuantizacion dinamica habitual, que comprime tambien las activaciones, este build aplica cuantizacion weight-only: solo se comprimen los pesos almacenados en disco, mientras que las activaciones permanecen en precision completa durante la inferencia. Esto evita el dano por valores atipicos que sufre el backbone DeBERTa-v3-small (con atencion disentangled) al cuantizar activaciones, y que en el build edge int4/int8 existente reduce el recall de 19/22 a 10/22.

El modelo resuelve el problema de la deteccion de entidades sin entrenamiento previo sobre las etiquetas objetivo: se le pasa un texto y una lista arbitraria de etiquetas ("persona", "api key", "ticket id") y devuelve los spans coincidentes. Es relevante ahora para escenarios de deteccion de PII y extraccion de informacion en entornos con recursos limitados, donde el espacio en disco importa mas que la latencia. El precio a pagar es un aumento de la latencia (512 ms frente a 375 ms del fp16) porque cada peso debe descomprimirse antes de cada matmul.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone microsoft/deberta-v3-small con atencion disentangled) mas cabecera de token-classification de GLiNER |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Weight-only: INT8 en pesos de MatMul (bloque de 128, simetrico) e INT4 en la tabla de embeddings (Gather); sesgos, layer norms y cabeceras de clasificacion permanecen en fp16 |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GLiNER small v2.5: un encoder transformer basado en microsoft/deberta-v3-small, caracterizado por su mecanismo de atencion disentangled, al que se anade una cabecera de clasificacion de tokens que permite el reconocimiento de entidades zero-shot. En lugar de clasificar sobre un conjunto fijo de etiquetas, GLiNER proyecta las etiquetas proporcionadas en el espacio del modelo junto con el texto de entrada, de modo que puede detectar categorias para las que no fue entrenado explicitamente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo base gliner-community/gliner_small-v2.5 y no se detallan en la informacion proporcionada. La innovacion tecnica de este build concreto es el proceso de cuantizacion: partiendo del archivo `onnx/fp16/model_fp16.onnx` de patronus-studio/gliner_small-v2.5-edge, se aplico `MatMulNBitsQuantizer` de onnxruntime en dos pasadas, una para los pesos de MatMul a INT8 (block-wise, tamano de bloque 128, simetrico) y otra para la tabla de embeddings a INT4 (el cuantizador weight-only de onnxruntime solo admite 4 bits para operaciones Gather). Las activaciones nunca se cuantizan.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot: acepta cualquier lista de etiquetas definida por el usuario en tiempo de inferencia, sin reentrenamiento.
- Deteccion de PII: identificacion de patrones como correos electronicos, numeros de telefono, claves de API, tokens JWT, direcciones IP internas y URL.
- Extraccion sobre datos estructurados y semiestructurados: el conjunto de prueba del autor incluye un JWT, una API key, una IP interna y una URL.
- Cobertura multilingue limitada a ingles y aleman, con nombres en cinco convenciones distintas segun el benchmark del autor.
- Clasificacion de tokens (pipeline token-classification) con puntuaciones de confianza por entidad y umbral configurable (`threshold`).
- Inferencia en CPU mediante onnxruntime, con ejecucion en el borde.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Deteccion de PII en tiempo real en el borde: el modelo cabe en 131,9 MB y se ejecuta sobre CPU con onnxruntime, por lo que puede integrarse en un servicio local que anonimice textos antes de enviarlos a un sistema externo, sin depender de GPU.
- Redaccion de documentos antes de compartirlos: dado un texto con nombres, correos, telefonos y numeros de identificacion, se le pasan etiquetas como "person", "email", "phone number" y se enmascaran los spans detectados.
- Analisis de registros (logs) y tickets de soporte: extraccion de identificadores de incidencia, direcciones IP internas y claves de API filtradas en texto operativo, aprovechando la capacidad de definir etiquetas a medida sin reentrenar.
- Enriquecimiento de pipelines de datos en entornos con disco limitado: al ocupar un 58 % menos que la exportacion fp16, encaja en contenedores o dispositivos con almacenamiento restringido donde el modelo fp16 no cabria comodamente.
- Procesamiento de textos en ingles y aleman: util en flujos documentales bilingues (por ejemplo, contratos o correspondencia comercial) donde se necesiten extraer entidades en ambos idiomas.
- Prototipado rapido de tareas de extraccion de informacion: permite validar un esquema de etiquetas sobre datos reales antes de invertir en un modelo entrenado especificamente para ese dominio.
- Filtrado previo en cascada: uso como primera etapa barata que marca candidatos, dejando un modelo mayor para la verificacion, en despliegues sensibles al coste.

## Benchmarks y rendimiento

Resultados medidos con la prueba multilingue dificil de 22 entidades de `benchmark.py` (texto multi-parrafo con un JWT, una API key, una IP interna, una URL y nombres en cinco convenciones distintas), 8 ejecuciones cronometradas tras 2 de calentamiento, solo CPU (onnxruntime con `CPUExecutionProvider`, Intel64 Windows 11):

| Modelo | Tamano | Recall | Latencia media |
|---|---|---|---|
| Este modelo (wo-int8-emb4) | 131,9 MB | 19 / 22 | 512 ms |
| fp16 de origen (patronus-studio) | 317,3 MB | 19 / 22 | 375 ms |
| int4/int8 dinamico (edge por defecto) | 127,5 MB | 10 / 22 | 236 ms |

Este modelo y el fp16 de origen fallan exactamente las mismas tres entidades doradas (`Deutsche Bahn AG`, `INFRA-4821`, `+65 6789 0123`), lo que el autor interpreta como evidencia de que se comporta como el mismo modelo y no como un empate casual. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible, y el propio autor advierte que no se trata de un benchmark NER a gran escala.

## Requisitos de hardware

- VRAM: no aplica para el escenario documentado; el benchmark se ejecuto exclusivamente en CPU con onnxruntime (`CPUExecutionProvider`).
- Tamano en disco: 131,9 MB, frente a 317,3 MB de la exportacion fp16 y 127,5 MB del build edge int4/int8.
- GPU recomendadas: no se documentan; el modelo esta pensado para CPU y despliegue en el borde. Al ser una exportacion ONNX, podria ejecutarse con otros execution providers de onnxruntime, pero no hay datos confirmados en la informacion proporcionada.
- Cabe en cualquier equipo de consumo: con 131,9 MB de pesos, no requiere GPU y puede ejecutarse en CPU de portatiles y dispositivos de borde.
- Opciones de despliegue: libreria `gliner` con `load_onnx_model=True` y `onnxruntime`; la carga se realiza con `GLiNER.from_pretrained(...,)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo NER de este tipo.
- Latencia: 512 ms de media por texto en la prueba del autor (frente a 375 ms en fp16 y 236 ms en int4/int8). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tamano | Recall (prueba de 22 entidades) | Latencia media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tazner/Gliner-small-edge-wo-int8-emb4 | 131,9 MB | 19 / 22 | 512 ms | apache-2.0 | HuggingFace (ONNX) |
| patronus-studio fp16 (model_fp16.onnx) | 317,3 MB | 19 / 22 | 375 ms | no disponible | HuggingFace (ONNX fp16) |
| patronus-studio int4/int8 dinamico (edge por defecto) | 127,5 MB | 10 / 22 | 236 ms | no disponible | HuggingFace (ONNX) |
| gliner-community/gliner_small-v2.5 | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base) |

La comparacion se limita a las variantes derivadas del mismo modelo base y a la prueba propia del autor. No se dispone de datos que permitan comparar con otras familias de modelos NER zero-shot.

## Limitaciones y advertencias

- Latencia superior a las alternativas: 512 ms frente a 375 ms del fp16 y 236 ms del int4/int8. Si el despliegue esta limitado por latencia y no por disco, el modelo fp16 o el build edge estandar pueden ser mas adecuados.
- Mayor compresion en la tabla de embeddings: los embeddings se cuantizan a 4 bits en lugar de 8, porque el cuantizador weight-only de onnxruntime solo admite 4 bits para operaciones Gather. En la prueba del autor no se observo perdida de recall, pero implica una compresion mas agresiva que en los pesos de atencion y FFN.
- Validacion limitada: el benchmark se realizo sobre una sola CPU, un texto multilingue corto y 22 entidades doradas. El propio autor recomienda validar sobre datos propios antes de usarlo en produccion.
- Cobertura de idiomas restringida a ingles y aleman; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion y de falsos negativos en NER: el modelo falla tres entidades en la prueba publicada, entre ellas una entidad alemana (`Deutsche Bahn AG`) y un identificador con formato especifico. No se documentan sesgos concretos del modelo, pero al derivar de DeBERTa-v3-small y de datos de entrenamiento no detallados, puede heredar sesgos de ese corpus.
- Longitud de contexto no disponible: se desconoce el limite maximo de tokens de entrada y si textos largos deben trocearse.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base gliner-community/gliner_small-v2.5 y del export fp16 de patronus-studio, de los que deriva.
- Los scripts `quantize.py` y `benchmark.py` no estan incluidos en el repositorio; el autor indica que pueden solicitarse. La reproducibilidad del proceso queda, por tanto, supeditada a esa peticion.
- Sin descargas ni likes registrados en el momento de la consulta, y con fecha de creacion muy reciente, por lo que no existe todavia validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tazner/Gliner-small-edge-wo-int8-emb4
- Modelo base: https://huggingface.co/gliner-community/gliner_small-v2.5
- Backbone: https://huggingface.co/microsoft/deberta-v3-small
- Build de origen (fp16 e int4/int8 edge): https://huggingface.co/patronus-studio/gliner_small-v2.5-edge
- Libreria GLiNER: no se proporciona enlace en la informacion disponible.
