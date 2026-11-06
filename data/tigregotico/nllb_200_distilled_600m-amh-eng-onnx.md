# TigreGotico/nllb_200_distilled_600m-amh-eng-onnx

## Resumen

`TigreGotico/nllb_200_distilled_600m-amh-eng-onnx` es una exportacion a ONNX del modelo de traduccion automatica `dsfsi/nllb_200_distilled_600m-amh-eng`, desarrollado originalmente por el grupo DSFSI (Data Science for Social Impact) de la Universidad de Pretoria. El modelo traduce exclusivamente en la direccion amharico (am) a ingles (en) y parte del checkpoint `facebook/nllb-200-distilled-600M`, afinado sobre el conjunto de datos `afriscience-mt`. Esta version, publicada por TigreGotico, no modifica los pesos: solo los convierte al formato ONNX para su despliegue en entornos de inferencia sin PyTorch.

La relevancia practica reside en el empaquetado: se ofrecen grafos fp32 (unos 7 GB) e int8 con cuantizacion dinamica (1,9 GB), lo que permite ejecutar un modelo seq2seq de 600 millones de parametros en CPU o en GPUs de gama baja mediante ONNX Runtime. La licencia Apache-2.0 facilita el uso comercial. Es un modelo especializado, no generalista: no cubre otras direcciones de traduccion ni otros pares de idiomas.

La arquitectura subyacente es la de NLLB-200 distilled, un transformer encoder-decoder con atencion multi-cabeza estandar y aproximadamente 600 millones de parametros. El contexto no esta declarado de forma explicita en la informacion disponible; NLLB emplea segmentacion por frases, por lo que la longitud de entrada practica queda limitada por el tokenizador y no por una ventana de contexto larga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200 distilled, familia M2M-100) |
| Parametros totales | ~600 M (segun nombre del checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (grafos raiz) e int8 dinamica por canal (`int8/`) |
| Idiomas soportados | am (amharico) como origen, en (ingles) como destino |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data` externos) |

## Arquitectura y entrenamiento

El modelo base es `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder de tipo seq2seq con atencion multi-cabeza convencional, destilado a partir de NLLB-200. DSFSI lo afino sobre el dataset `afriscience-mt` para el par amharico-ingles. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion de esta publicacion es puramente de ingenieria de despliegue. La exportacion se realizo con `optimum-cli export onnx` usando la tarea `text2text-generation-with-past` y la opcion `--no-post-process`. Los grafos int8 se generan a partir de los fp32 con `onnxruntime.quantization.quantize_dynamic`, usando `QuantType.QInt8`, cuantizacion por canal, `reduce_range=False` y `EnableSubgraph=True`, manteniendo los pesos en un fichero externo por grafo. El script de cuantizacion esta en el repositorio `TigreGotico/linguonnx`.

## Capacidades

- Traduccion unidireccional de amharico a ingles, con etiquetas de idioma NLLB (`amh_Ethi` como origen, `eng_Latn` como destino).
- Generacion de texto condicionada por el token forzado de idioma destino mediante `forced_bos_token_id`.
- Decodificacion greedy y beam search (la model card valida beam=4).
- Ejecucion en ONNX Runtime con soporte de cache (`use_cache=True`) y grafos separados de encoder y decoder.
- Funcionamiento en CPU sin GPU, gracias a los grafos int8 de 1,9 GB.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas estrictamente al par am-en; no se ha validado ningun otro par.

## Casos de uso

- Traduccion de documentacion cientifica en amharico: el afinamiento sobre `afriscience-mt` hace que el modelo sea adecuado para articulos y resumenes tecnicos en ese dominio, traduciendo al ingles para su publicacion o revision.
- Localizacion de contenido web y editorial: integracion en un pipeline que reciba texto amharico y genere versiones en ingles, usando los grafos int8 para reducir coste de infraestructura en servidores sin GPU.
- Procesamiento por lotes en CPU: el grafo int8 de 1,9 GB permite desplegar el modelo en contenedores ligeros y traducir volumenes moderados de frases sin depender de aceleradores.
- Preservacion y acceso a patrimonio digital: traduccion de archivos, noticias y material historico en amharico a ingles para su indexacion y busqueda en repositorios internacionales.
- Preprocesamiento para analisis de sentimiento o extraccion de informacion: traducir primero el texto amharico al ingles y aplicar despues modelos de NLP entrenados principalmente en ingles.
- Traduccion asistida en atencion al ciudadano: borradores automaticos de comunicaciones oficiales en ingles a partir de originales en amharico, con revision humana posterior.
- Evaluacion comparativa de exportaciones ONNX: servir como referencia para medir la perdida de calidad de la cuantizacion int8 frente a fp32 en tareas de traduccion de bajo recurso.

## Benchmarks y rendimiento

| Evaluacion | Construccion | Metrica | Resultado |
|---|---|---|---|
| Paridad PyTorch vs ONNX (n=10, greedy) | fp32 | exact match | 100% (10/10) |
| Paridad PyTorch vs ONNX (n=10, beam=4) | fp32 | exact match | 100% (10/10) |
| FLORES-200 devtest (primeras 50 frases, amh_Ethi a eng_Latn, greedy) | fp32 | chrF (sacrebleu) | 54,13 |
| FLORES-200 devtest (primeras 50 frases, amh_Ethi a eng_Latn, greedy) | int8 | chrF (sacrebleu) | 53,37 |
| Coincidencia de salidas int8 frente a fp32 | int8 | salidas identicas | 15/50 |

La model card advierte explicitamente de que la paridad con n=10 es una estimacion ruidosa: una medicion previa del mismo proyecto con otro modelo paso de 100% a 14% al re-medir con n=100 sobre FLORES-200. La evaluacion FLORES de 50 frases tambien es de escala reducida.

## Requisitos de hardware

- VRAM estimada: inferior a 2 GB para los grafos int8 (1,9 GB en disco) y alrededor de 8 GB para los fp32 (7,4 GB en disco), mas overhead de activaciones y cache.
- GPU recomendadas: cualquier GPU con 4 GB o mas para int8 (GTX 1650, RTX 3050, T4); para fp32 se recomienda 8-12 GB (RTX 3060, RTX 4070, A10).
- Cabe en GPU de consumo: si, tanto en int8 como en fp32 con 8 GB o mas.
- Ejecucion en CPU: viable con ONNX Runtime y los grafos int8; no se han publicado cifras de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime via `optimum.onnxruntime.ORTModelForSeq2SeqLM`, o el stack `TigreGotico/linguonnx`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un seq2seq ONNX de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| TigreGotico/nllb_200_distilled_600m-amh-eng-onnx | ~600 M | am a en | no disponible | Apache-2.0 | ONNX fp32/int8 | Exportacion ONNX, chrF 54,13 (fp32, FLORES-200 n=50) |
| dsfsi/nllb_200_distilled_600m-amh-eng | ~600 M | am a en | no disponible | Apache-2.0 | PyTorch (safetensors/bin) | Modelo original del que deriva esta exportacion |
| facebook/nllb-200-distilled-600M | ~600 M | 200 idiomas | no disponible | CC-BY-NC-4.0 | PyTorch | Modelo generalista; licencia no comercial, a diferencia de este |
| facebook/m2m100_418M | ~418 M | 100 idiomas | no disponible | MIT | PyTorch | Alternativa multilingue mas pequena, sin afinamiento especifico en amharico |

## Limitaciones y advertencias

- Traduccion unidireccional: solo amharico a ingles. No se ha validado el par inverso ni otros idiomas.
- La evaluacion de calidad se limita a 50 frases de FLORES-200 y a 10 frases de paridad; no hay benchmark a escala completa.
- La cuantizacion int8 degrada ligeramente la calidad (chrF 53,37 frente a 54,13) y cambia el 70% de las salidas respecto a fp32 (35 de 50 frases distintas), por lo que no es una sustitucion exacta.
- Riesgo de alucinacion y de traducciones fluidas pero incorrectas en textos largos o fuera del dominio cientifico del dataset de afinamiento.
- Sesgos potenciales heredados de NLLB-200 y de `afriscience-mt`; no se documenta ninguna evaluacion de sesgo.
- Requiere pasar explicitamente `forced_bos_token_id` con la etiqueta `eng_Latn`; no esta preconfigurado en `generation_config.json`, lo que puede provocar errores silenciosos si se omite.
- El tokenizador debe configurarse con `src_lang = "amh_Ethi"`; usar codigos ISO 639-1 produce resultados incorrectos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de `afriscience-mt` para usos sensibles.
- Repositorio con muy poca traccion (5 descargas, 0 likes) y sin mantenimiento comunitario documentado; conviene fijar la revision concreta en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigreGotico/nllb_200_distilled_600m-amh-eng-onnx
- Modelo base original: https://huggingface.co/dsfsi/nllb_200_distilled_600m-amh-eng
- Modelo NLLB-200 distilled de referencia: https://huggingface.co/facebook/nllb-200-distilled-600M
- Repositorio de herramientas de exportacion y cuantizacion: https://github.com/TigreGotico/linguonnx
- Grupo DSFSI (Universidad de Pretoria): https://dsfsi.github.io/
- Dataset FLORES-200 (referencia de evaluacion): https://github.com/facebookresearch/flores
