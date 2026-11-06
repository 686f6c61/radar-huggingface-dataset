# tsan1024/tocr

## Resumen

TeleOCR Layout LoRA (text_with_formula) es un ajuste fino mediante LoRA del modelo TeleOCR, que a su vez se construye sobre Qwen2.5-VL de aproximadamente 1.200 millones de parametros. Lo desarrolla el usuario tsan1024 y su proposito es anadir una etiqueta adicional, `text_with_formula`, al detector de layout original, de forma que distingue bloques de texto ordinario de aquellos que contienen formulas en linea delimitadas por `$...$`. El resultado se ha fusionado de vuelta en los pesos base, por lo que se puede usar para inferencia directa sin cargar adaptadores por separado.

El modelo resuelve un problema concreto en pipelines de document AI: la mayoria de detectores de layout agrupan todo el texto en una sola categoria, lo que obliga a un postprocesado posterior para separar formulas. Con esta etiqueta nativa, el enrutamiento hacia motores de renderizado matematico o hacia modelos de reconocimiento especializados se puede hacer en la misma pasada de deteccion. El contexto de entrenamiento son 1.651 paginas de OmniDocBench, con 1.568 para entrenamiento y 83 para validacion.

Es relevante ahora porque demuestra un patron de especializacion barata sobre modelos vision-lenguaje pequenos: un LoRA de rango 32 que solo entrena la capa de proyeccion del modelo de lenguaje y que consigue un F1 de 0,757 en la categoria nueva. No obstante, el propio autor advierte de que se trata de un trabajo personal de estudio e investigacion, sin garantia de disponibilidad para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen2.5-VL), con LoRA fusionado en los pesos base |
| Parametros totales | 1.259.490.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 2,5 GB) |

## Arquitectura y entrenamiento

La base es TeleOCR, un modelo de deteccion de layout construido sobre Qwen2.5-VL de ~1,2B parametros. La salida sigue el formato nativo de TeleOCR: cajas delimitadoras con etiqueta y orden de lectura, con coordenadas relativas a una imagen de layout de 1036x1036 expresadas como enteros en el rango 0-1000, por ejemplo `<box:xmin ymin xmax ymax><label:text_with_formula><up>`. El ajuste anade la etiqueta `text_with_formula` junto a la ya existente `text`.

El entrenamiento se hizo con LoRA de rango 32, alpha 64 y dropout 0,05, entrenando unicamente la capa de proyeccion del modelo de lenguaje. Se usaron 3 epocas con tasa de aprendizaje 2e-4, batch efectivo de 8 (1 x 8 con acumulacion de gradientes), precision bfloat16 y scheduler coseno. Los datos provienen de OmniDocBench: 1.651 paginas, divididas en 1.568 de entrenamiento y 83 de validacion. La limpieza de datos aplico una deteccion estricta de formulas en linea para distinguir el simbolo de moneda (`$5`) de una formula real delimitada por `$...$`. El adaptador se fusiono posteriormente en los pesos base.

## Capacidades

- Deteccion de layout en documentos: devuelve bloques con tipo, bounding box y angulo.
- Clasificacion binaria de texto: distingue `text` de `text_with_formula` segun la presencia de formulas en linea.
- Salida estructurada en el formato nativo de TeleOCR, consumible por la clase `TeleOCRClient`.
- Procesamiento de imagenes de pagina completa a resolucion de layout de 1036x1036.
- Inferencia directa sin adaptadores separados, al estar el LoRA fusionado.
- No se documentan capacidades de tool calling, agentes, modo thinking, audio ni generacion de texto libre.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Digitalizacion de articulos cientificos: el modelo marca que bloques contienen formulas en linea, lo que permite enviar solo esos bloques a un motor de OCR matematico (LaTeX-OCR, Mathpix o similar) y el resto a un OCR de texto convencional, reduciendo coste y errores de conversion.
- Construccion de pipelines de extraccion documental: la etiqueta `text_with_formula` actua como señal de enrutamiento dentro de un DAG de procesamiento, de modo que cada tipo de bloque sigue un camino distinto sin necesidad de un clasificador adicional.
- Preprocesado para RAG sobre documentacion tecnica: al separar texto y formulas se puede preservar el marcado matematico en los fragmentos indexados, mejorando la fidelidad de las respuestas en dominios como fisica, matematicas o ingenieria.
- Conversion de PDF a Markdown o HTML: los bloques etiquetados permiten reconstruir el documento con formulas renderizadas correctamente y texto plano en el resto.
- Analisis de libros de texto y material educativo: la deteccion de formulas ayuda a medir densidad matematica por seccion o a generar indices tematicos.
- Investigacion sobre especializacion de VLMs: sirve como referencia reproducible de un ajuste LoRA de bajo coste (solo la capa de proyeccion) sobre un modelo de 1,2B para una tarea de etiquetado fino.
- Control de calidad de corpus: permite auditar automaticamente si un documento digitalizado ha perdido sus formulas durante la conversion.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de validacion de 83 paginas, con emparejamiento por categoria completa al estilo hungaro y supresion de no maximos (NMS):

| Categoria | Precision | Recall | F1 |
|---|---|---|---|
| `text` | 0,767 | 0,723 | 0,744 |
| `text_with_formula` | 0,837 | 0,692 | 0,757 |
| Micro global | 0,779 | 0,713 | 0,744 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,5-3 GB solo para pesos, mas el coste de activaciones y del procesador de vision; en la practica conviene reservar 6-8 GB.
- Cabe en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problema en bfloat16.
- GPUs de centro de datos: A100, H100, L40S y A10G son sobredimensionadas para este tamano, pero utiles para procesar lotes grandes de paginas en paralelo.
- Despliegue: la model card solo documenta la ruta con `transformers` (`AutoProcessor` y `AutoModelForImageTextToText` con `trust_remote_code=True`, `dtype=torch.bfloat16` y `attn_implementation="sdpa"`) junto con `TeleOCRClient` del paquete TeleOCR. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, y la presencia de codigo personalizado (`modeling_naviocr.py`) complica su integracion en servidores de inferencia estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsan1024/tocr (este modelo) | ~1,26B | No disponible | Deteccion de layout con etiqueta de formula en linea | Apache 2.0 | Hugging Face, 0 descargas |
| TeleOCR (XingChen-AGI) | ~1,2B | No disponible | Deteccion de layout general | No disponible en la informacion | Hugging Face |
| Qwen2.5-VL 1.2B (base) | ~1,2B | No disponible en la informacion | Vision-lenguaje general | No disponible en la informacion | Hugging Face |

La comparativa se limita a la relacion de linaje, ya que no se han publicado metricas del modelo base ni de alternativas en la informacion disponible. No hay datos para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo se ofrece solo para estudio personal amateur e investigacion, y que no se garantiza su disponibilidad para produccion.
- El rendimiento es moderado: F1 de 0,744 en el global micro y recall de 0,692 en `text_with_formula`, lo que implica que aproximadamente un 30 % de los bloques con formulas no se detectan.
- El conjunto de validacion es muy pequeno (83 paginas) y proviene de un unico benchmark (OmniDocBench), por lo que la generalizacion a otros dominios y maquetaciones no esta demostrada.
- Solo se entreno la capa de proyeccion del modelo de lenguaje, lo que limita la capacidad de adaptacion del extractor visual a dominios muy distintos.
- Riesgo de confusion entre el simbolo de moneda y formulas, mitigado en el entrenamiento con limpieza estricta, pero no eliminado.
- Requiere `trust_remote_code=True` por incluir codigo personalizado (`modeling_naviocr.py`), lo que supone ejecutar codigo del autor y debe auditarse antes de usarlo en entornos sensibles.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no documentados; el rendimiento en documentos no latinos o con sistemas de escritura distintos no esta evaluado.
- El repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero la advertencia del autor sobre ausencia de garantia en produccion debe tenerse en cuenta en la evaluacion de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsan1024/tocr
- Modelo base TeleOCR: https://huggingface.co/XingChen-AGI/TeleOCR
- OmniDocBench (conjunto de datos de entrenamiento y validacion): no se proporciona enlace en la informacion disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
