# wjbmattingly/comma-indra-ocr-10k

## Resumen

comma-indra-ocr-10k es un ajuste fino del reconocedor de lineas del pipeline Indra OCR de Datalab, orientado a reconocimiento de texto manuscrito (HTR) sobre manuscritos en latin, incluido latin medieval con abundantes abreviaturas paleograficas. Lo publica el usuario wjbmattingly como derivado independiente y no afiliado a Datalab, y se distribuye bajo la licencia OpenRAIL-M modificada de Datalab.

El problema que resuelve es concreto: el modelo Indra OCR original, en su configuracion de fabrica, falla de forma sistematica sobre este corpus (CER normalizado NFD de 0,5834 y una recall de linea de apenas 0,0003). El ajuste fino reentrena unicamente el reconocedor de lineas sobre 389.770 recortes de linea procedentes de 9.906 paginas del dataset comma-project/deep-jsonl, y reduce el CER NFD de extremo a extremo a 0,1499 sobre 243 paginas reservadas.

Tecnicamente no es un modelo de lenguaje sino una cadena de modelos ONNX pequenos que opera como pipeline de vision a texto (image-to-text). De los seis ficheros ONNX del pipeline, solo `rec.onnx` y `meta.json` estan modificados; el detector, el modelo de orden de lectura, el orientador y el clasificador de script son copias sin tocar de Datalab. El interes actual del modelo es de nicho: digitalizacion de patrimonio cultural y humanidades digitales sobre corpus latinos con notacion abreviada compleja, donde los modelos OCR generalistas rinden muy por debajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de modelos ONNX pequenos para OCR/HTR (detector de lineas `det.onnx`, orden de lectura `order.onnx`, orientacion `orient.onnx`, clasificador de script `script.onnx`, reconocedor de linea CTC `rec.onnx`, reconocedor CJK `rec_cjk.onnx`). Solo `rec.onnx` esta reentrenado. Detalle interno de capas: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada es una imagen de linea; no hay contexto de tokens) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato ONNX tal cual) |
| Idiomas soportados | la (latin; incluye latin medieval con abreviaturas y caracteres especiales) |
| Licencia | OpenRAIL-M modificada de Datalab (`openrail-m-modified-datalab`), share-alike |
| Formato de pesos | ONNX (`rec.onnx`, `det.onnx`, `order.onnx`, `orient.onnx`, `script.onnx`, `rec_cjk.onnx`) |

## Arquitectura y entrenamiento

Indra OCR es un pipeline de modelos ONNX pequenos encadenados: deteccion de lineas, estimacion del orden de lectura, orientacion, clasificacion de script y reconocimiento de linea. El reconocedor de linea usa decodificacion CTC, y en esta derivada los pesos ajustados se escribieron de vuelta dentro del grafo original de Datalab en lugar de reexportarse, de modo que el enmascarado, las longitudes de secuencia y la decodificacion siguen siendo los del modelo original. El cambio estructural es la ampliacion de la cabeza clasificadora de 1.678 a 1.729 clases, con un vocabulario extendido en 51 caracteres: entre ellos simbolos de abreviacion medieval y variantes ortograficas como ɨ, ʳ, ˡ, ˢ, diacriticos combinantes, ⁊ (nota tironiana), ꝑ, ꝓ, ꝗ, ꝥ, ꝯ, ꝵ y otros caracteres del rango de latin extendido usados en paleografia.

El entrenamiento consistio en un ajuste fino CTC sobre 389.770 recortes de linea extraidos de 9.906 paginas del dataset comma-project/deep-jsonl, durante 6 epocas, con un tiempo total reportado de 37 minutos. El checkpoint publicado es el de la ultima epoca. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, lo cual es coherente con la naturaleza OCR del modelo. Tampoco se detalla la composicion del dataset ni los hiperparametros de entrenamiento mas alla de lo indicado.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) linea a linea sobre imagenes de manuscritos.
- OCR de documentos historicos en latin, incluido latin medieval con abreviaturas y caracteres especiales ampliados en el vocabulario.
- Conversion de extremo a extremo de imagen de pagina a texto, integrando deteccion de lineas, orden de lectura y reconocimiento.
- Preservacion opcional de encabezados y pies de pagina mediante el parametro `furniture=True` (Indra los descarta por defecto).
- Reconocimiento de script y orientacion de pagina heredado de los modelos base sin modificar.
- Ejecucion en CPU, sin necesidad de GPU para inferencia.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision general (mas alla de OCR) ni generacion de texto libre. No es un modelo conversacional.

## Casos de uso

- Digitalizacion de fondos manuscritos latinos en bibliotecas y archivos: el modelo convierte paginas escaneadas en texto con un CER NFD de 0,1499 de extremo a extremo, un orden de magnitud mejor que el pipeline Indra sin ajustar sobre este corpus.
- Proyectos de humanidades digitales y paleografia: la ampliacion del vocabulario con 51 caracteres (entre ellos ⁊, ꝑ, ꝓ, ꝗ, ꝥ, ꝯ) permite representar abreviaturas medievales que el modelo base no cubre.
- Creacion de corpus textuales anotados para investigacion linguistica del latin medieval, partiendo de transcripciones automaticas que despues se corrigen manualmente.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU, permite montar pipelines de digitalizacion masiva sin coste de acelerador.
- Extraccion de texto de documentos historicos con estructura de pagina relevante (encabezados, foliacion, pies) usando `furniture=True` para no perder esa informacion.
- Preprocesamiento para motores de busqueda o archivos digitales academicos, donde el texto reconocido se indexa para consulta posterior.
- Apoyo a la transcripcion asistida: el modelo genera una primera pasada sobre paginas completas y el paleografo revisa y corrige, reduciendo el tiempo frente a la transcripcion manual.

## Benchmarks y rendimiento

Evaluacion de extremo a extremo con el detector y los modelos de orden de lectura sin modificar de Datalab, sobre 243 paginas reservadas. CER tras normalizacion NFD.

| Modelo | CER (NFD) | Macro | WER (NFD) | Recall de linea |
|---|---|---|---|---|
| Indra OCR, tal como se distribuye | 0,5834 | 0,5691 | 0,9716 | 0,0003 |
| comma-indra-ocr-10k (este modelo) | 0,1499 | 0,1469 | 0,4130 | 0,1290 |
| Qwen3.5-0.8B, ajuste fino completo sobre las mismas 9.906 paginas | 0,1458 | no disponible | no disponible | no disponible |
| LightOnOCR-3-0.8B, ajuste fino completo sobre las mismas 9.906 paginas | 0,1206 | no disponible | no disponible | no disponible |

Sobre recortes de linea con ground truth, el reconocedor de este modelo obtiene 0,1048 de CER, frente a 0,5575 del modelo original. La diferencia entre esa cifra y la de extremo a extremo se atribuye al detector de lineas de Indra, que este ajuste fino no modifica.

## Requisitos de hardware

- Inferencia en CPU: la model card indica explicitamente que el pipeline se ejecuta en CPU, sin requisitos de GPU.
- VRAM estimada: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. No se publican requisitos ni recomendaciones de acelerador.
- Compatibilidad con GPU de consumo: no aplica de forma directa, dado que el modelo esta pensado para ejecucion en CPU. No se especifica si soporta aceleracion por GPU.
- Opciones de despliegue: paquete `indra-ocr` de Python (`pip install indra-ocr`) junto con `huggingface_hub.snapshot_download` para descargar el repositorio. Al ser ficheros ONNX, tambien puede ejecutarse con ONNX Runtime directamente, aunque no se documenta un procedimiento alternativo.
- Latencia y throughput: no disponible. Solo se conoce el tiempo de entrenamiento (37 minutos para 6 epocas sobre 389.770 recortes de linea), que no es un dato de inferencia.
- Tamano del repositorio: 0,0 GB segun HuggingFace, coherente con un conjunto de modelos ONNX pequenos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (NFD) end-to-end, 243 paginas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| comma-indra-ocr-10k | no disponible | no aplica (OCR de lineas) | 0,1499 | OpenRAIL-M modificada de Datalab (share-alike) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen3.5-0.8B, ajuste fino completo (mismo corpus) | 0,8B | no disponible | 0,1458 | no disponible | no disponible |
| LightOnOCR-3-0.8B, ajuste fino completo (mismo corpus) | 0,8B | no disponible | 0,1206 | no disponible | no disponible |
| Indra OCR (datalab-to/indra-ocr), modelo base | no disponible | no aplica | 0,5834 | OpenRAIL-M modificada de Datalab | HuggingFace |

Las cifras de los dos modelos de 0,8B provienen de la propia model card y se midieron sobre el mismo conjunto de 9.906 paginas de entrenamiento; solo se publica el CER, sin el resto de metricas. El modelo ajustado iguala practicamente a Qwen3.5-0.8B en CER (0,1458 frente a 0,1499) con una fraccion del coste de computo, aunque LightOnOCR-3-0.8B obtiene un CER mejor (0,1206) a costa de un modelo de 0,8B parametros.

## Limitaciones y advertencias

- El recall de linea de extremo a extremo es bajo (0,1290) y el WER sigue siendo alto (0,4130): el detector de lineas de Indra, que este ajuste no modifica, es el cuello de botella principal en paginas completas. Sobre recortes de linea ya correctos el CER baja a 0,1048.
- El modelo esta especializado exclusivamente en latin (`la`). No se reporta soporte para otras lenguas ni para textos impresos modernos.
- Riesgo de alucinacion y de errores de transcripcion en abreviaturas poco frecuentes, dado que el ajuste se hizo sobre un unico corpus de 9.906 paginas. No se documentan medidas de calibracion ni de deteccion de incertidumbre.
- Sesgos conocidos: no se documentan sesgos especificos. Cabe esperar un sesgo hacia el estilo de escritura, la mano y la tipologia documental presentes en comma-project/deep-jsonl, con degradacion sobre otros corpus.
- Restricciones de licencia relevantes para produccion: la licencia OpenRAIL-M modificada de Datalab es share-alike, por lo que el modelo, sus derivados y sus salidas quedan sujetos a la misma licencia. Segun el resumen incluido en la model card, no se permite el uso ilicito ni que infrinja derechos de propiedad intelectual; tampoco el uso por parte de personas o empresas con mas de 20 millones de dolares de facturacion bruta anual o de financiacion, salvo uso personal o de investigacion; ni ofrecer un producto o servicio que compita con Datalab. Datalab ofrece licencias mas amplias.
- El proyecto es un derivado independiente y no esta afiliado ni respaldado por Datalab. No hay garantia de soporte ni de mantenimiento.
- Licencia y atribucion: los pesos originales y el grafo ONNX son copyright de Datalab; cualquier redistribucion debe conservar su licencia textual.
- Advertencia practica: al tratarse de un modelo sin parametros, contexto ni cuantizaciones publicadas, es dificil estimar costes de despliegue sin medirlos directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wjbmattingly/comma-indra-ocr-10k
- Modelo base Indra OCR (Datalab): https://huggingface.co/datalab-to/indra-ocr
- Dataset de entrenamiento: comma-project/deep-jsonl (referenciado en la model card, disponible en HuggingFace)
- Licencia de Datalab: fichero LICENSE incluido en el repositorio, referencia en https://www.datalab.to/ para licencias mas amplias
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada (los resultados obtenidos no guardan relacion con el modelo).
