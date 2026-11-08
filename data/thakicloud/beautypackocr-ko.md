# ThakiCloud/BeautyPackOCR-KO

## Resumen

BeautyPackOCR-KO es un pipeline de OCR a nivel de linea especializado en fotografias de envases de cosmeticos y productos farmaceuticos coreanos. Lo desarrolla ThakiCloud y combina dos redes exportadas a ONNX: un detector de texto DBNet con backbone ResNet-50 y un reconocedor CRNN-CTC con un vocabulario de salida de 1.578 caracteres. El modelo devuelve, para cada linea detectada, la caja delimitadora, el texto reconocido y una puntuacion de confianza, ademas de cadenas de fecha normalizadas extraidas de esas lineas.

La relevancia del modelo es acotada pero clara: cubre un nicho concreto (etiquetado de packaging cosmetico y farmaceutico en coreano, con soporte de caracteres latinos) y lo hace con un consumo de recursos contenido, ejecutable en CPU mediante onnxruntime con una latencia mediana de 547 ms por imagen en 4 hilos. El repositorio ocupa 0,3 GB y la licencia es Apache 2.0, lo que facilita su integracion comercial.

Conviene subrayar el alcance declarado por el propio autor: el modelo se entreno y evaluo unicamente con capturas de estudio en interior de envases de 633 categorias, con un unico producto por imagen. No se evaluo con fotos reales de movil (brillos, superficies curvas, desenfoque, varios productos en el mismo encuadre). No extrae nombres de producto ni distingue fecha de fabricacion de fecha de caducidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector DBNet con backbone ResNet-50 + reconocedor CRNN-CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen redimensionada a lado largo 1280) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX en precision original) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`det_db_resnet50.onnx`, `crnn_633.onnx`) y checkpoints PyTorch `.pt` (state_dict) |

## Arquitectura y entrenamiento

El pipeline es una cascada clasica de dos etapas. La primera es DBNet con ResNet-50 como extractor de caracteristicas, que produce un mapa de probabilidad de texto y del que se derivan las cajas de linea mediante post-procesado con pyclipper y umbrales fijos (umbral de caja 0,3, umbral de binarizacion 0,3). La segunda es un CRNN con CTC y decodificacion greedy que recibe recortes de linea en escala de grises de altura 32 (`x` con forma [B,1,32,W]) y emite secuencias sobre un alfabeto de 1.578 caracteres definido en `charset.json` (indice + 2).

El entrenamiento se realizo sobre un dataset interno de capturas en interior de envases de 633 categorias, con una unica instancia de producto por imagen. No se documenta en la informacion disponible el numero de tokens ni la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo OCR). La innovacion tecnica destacable es de ingenieria mas que de arquitectura: exportacion a ONNX con paridad verificada frente a PyTorch (diferencia de F1 end-to-end de -0,0005 en las filas del benchmark), verificacion de integridad por sha256 de cada fichero de pesos contra `config.json`, y una capa de reglas determinista para normalizar fechas a formato `YYYYMM` o `YYYYMMDD`.

## Capacidades

- Deteccion de texto a nivel de linea en imagenes de envases, con caja delimitadora en formato xyxy por linea.
- Reconocimiento de texto en coreano y caracteres latinos, con un vocabulario de 1.578 simbolos.
- Puntuacion de confianza por linea, calculada como el minimo entre la puntuacion del detector y la media del max-softmax de los caracteres emitidos (no es una probabilidad calibrada).
- Extraccion y normalizacion de cadenas de fecha presentes en las lineas detectadas, con granularidad de dia o mes y campo `date_type` fijado a `UNCLASSIFIED`.
- Ejecucion en CPU con onnxruntime, sin necesidad de GPU.
- API Python simple (`BeautyPackOCR`) y CLI con modo de autodiagnostico (`--selftest`) que valida la carga y ejecucion de ambos grafos ONNX.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de vision puro de tipo image-to-text.
- No incluye modo thinking, vision general, audio ni capacidades multimodales mas alla del OCR.

## Casos de uso

- Digitalizacion de fichas de producto en catalogo interno: dado un lote de fotos de estudio de envases, el pipeline extrae todas las lineas de texto con su caja y confianza, lo que permite a un operador revisar y volcar ingredientes, advertencias y datos de fabricante a una base de datos estructurada.
- Control de fechas en almacen: las cadenas normalizadas `YYYYMM`/`YYYYMMDD` devueltas en `out["dates"]` sirven como borrador para un sistema de alertas de caducidad, siempre con verificacion humana dado que el modelo no distingue fabricacion de caducidad.
- Preprocesado para pipelines de vision documental: las cajas de linea y el texto reconocido pueden alimentar etapas posteriores (extraccion de entidades, clasificacion de producto) sin necesidad de reentrenar el OCR.
- Verificacion de etiquetado regulatorio: comparacion asistida entre el texto detectado en el envase y la ficha tecnica declarada, usando la confianza por linea para priorizar las lineas que requieren revision manual.
- Procesamiento por lotes en servidor sin GPU: con 547 ms de mediana por imagen en 4 hilos de CPU, un servidor de 16 nucleos puede procesar del orden de varios miles de imagenes por hora en paralelo, adecuado para backfills nocturnos de catalogos.
- Prototipado e integracion en herramientas internas: la licencia Apache 2.0 y la distribucion ONNX permiten embeber el pipeline en aplicaciones de escritorio o servicios sin dependencias de GPU ni de frameworks pesados.
- Investigacion sobre OCR coreano: el reconocedor aislado alcanza un CER de 0,0158 sobre recortes con cajas de ground truth, lo que lo convierte en una linea base util para comparar futuras aproximaciones en este dominio.

## Benchmarks y rendimiento

Evaluacion end-to-end (deteccion + reconocimiento) sobre dev-B, 4.024 fotos de 1.173 grupos de producto no presentes en entrenamiento:

| Metrica | Valor |
|---|---|
| Detection H-mean | 0,868 |
| End-to-end line F1 | 0,809 (IC 95%: 0,799-0,818) |
| End-to-end CER (lineas emparejadas) | 0,117 |
| Date field F1 | 0,848 |

El propio autor advierte de un sesgo por near-duplicates: el 33,9% de las fotos de dev-B son casi identicas a fotos de entrenamiento. Al eliminarlas, el F1 end-to-end baja a 0,792 (2.659 fotos) y a 0,775 si se elimina cualquier senal de duplicidad visual, textual o de hash (1.260 fotos). El rango honesto para productos no vistos en el mismo entorno de captura es, por tanto, 0,775-0,792.

Reconocedor aislado sobre recortes con cajas de ground truth:

| Metrica | Valor |
|---|---|
| CER en test | 0,0158 |
| Tasa de coincidencia exacta | 0,971 |

Latencia por foto (medida sobre 95 fotos de dev-B tras 5 ejecuciones de calentamiento):

| Configuracion | p50 | p95 |
|---|---|---|
| CPU, onnxruntime 1.31.1, 4 hilos intra-op (AMD EPYC 9355) | 547 ms | 1.349 ms |
| CPU, misma configuracion, incluyendo decodificacion JPEG | 597 ms | 1.381 ms |
| GPU, H200 NVL, PyTorch FP32 (no ONNX) | 44,7 ms | 91,0 ms |

Pico de RSS en CPU: 4,12 GiB. No se han publicado comparaciones con otros modelos OCR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para la ruta ONNX en CPU; el pipeline esta disenado para ejecutarse sin GPU. El pico de memoria RAM medido es de 4,12 GiB con 4 hilos.
- GPU recomendadas: no se documenta una ruta ONNX-GPU; la unica medicion en GPU disponible usa PyTorch FP32 sobre una H200 NVL (44,7 ms p50). No hay datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no hay medicion publicada; el modelo es lo bastante pequeno (repositorio de 0,3 GB) como para que quepa en cualquier GPU moderna, pero el rendimiento en esas tarjetas no esta documentado.
- Opciones de despliegue: onnxruntime en CPU (ruta oficial y medida), con dependencias de opencv-python-headless, pyclipper, pillow, numpy y huggingface_hub. Los checkpoints `.pt` requieren python-doctr para cargarse. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 547 ms y p95 de 1.349 ms por foto en CPU con 4 hilos; la medicion se hizo sobre la CPU de un servidor con GPU, no sobre hardware on-premise de cliente, por lo que el autor advierte que no es extrapolable.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia del mismo autor y dominio, ThakiCloud publico ThakiOCR-KO-v1, un adaptador LoRA sobre OvisOCR3 para reconocimiento de palabras en coreano, con un CER que paso del 25,28% en el modelo base al 7,78% sobre 2.400 recortes de su conjunto interno de desarrollo; no obstante, no se aportan metricas cruzadas que permitan una comparacion directa con BeautyPackOCR-KO.

| Modelo | Tipo | Idiomas | Licencia | Datos comparativos |
|---|---|---|---|---|
| BeautyPackOCR-KO | DBNet + CRNN-CTC en ONNX | ko, en | Apache 2.0 | E2E F1 0,775-0,809; CER reconocedor 0,0158 |
| ThakiOCR-KO-v1 | LoRA sobre OvisOCR3 | ko | no disponible en la informacion | CER 7,78% en recortes de palabra |
| Alternativas de OCR general | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Una sola condicion de captura: todo el entrenamiento y la evaluacion provienen de un unico dataset de estudio en interior, con exactamente un producto por imagen. Brillos, botellas curvas, desenfoque de movimiento o varios productos en el encuadre no se evaluaron y el dataset no tiene etiquetas para esas condiciones.
- Sesgo de seleccion y near-duplicates en dev-B: el 33,9% de las fotos de evaluacion son casi identicas a fotos de entrenamiento, y dev-B se uso para elegir entre configuraciones candidatas, de modo que incluso la cifra de 0,775 conserva cierto sesgo de seleccion.
- Sin extraccion de nombre de producto: existe un ranker interno de nombres que no se ha publicado y cuyo pipeline OCR-a-nombre no se ha validado.
- Fechas sin clasificar: las fechas se devuelven normalizadas con `date_type: UNCLASSIFIED`; el modelo no distingue fabricacion de caducidad, y una fecha ausente o un resultado vacio no prueban que el envase carezca de ella.
- Confianza no calibrada: la puntuacion por linea es el minimo entre la del detector y la media del max-softmax de los caracteres, no una probabilidad.
- Orden de linea: el orden de salida es el del detector, no el orden de lectura natural.
- Vocabulario cerrado: los caracteres fuera de las 1.578 entradas de `charset.json` no pueden reconocerse (la model card se interrumpe en este punto en la informacion disponible).
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones adicionales conocidas, pero el autor recomienda tratar toda salida como borrador sujeto a revision humana.
- Aviso de produccion: el modelo se presenta como herramienta de asistencia, no como extractor autonomo; su uso sin verificacion humana en flujos regulatorios o de inventario conlleva riesgo de error.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/BeautyPackOCR-KO
- Model card en coreano (referenciada en el repositorio): https://huggingface.co/ThakiCloud/BeautyPackOCR-KO/blob/main/MODEL_CARD.ko.md
- Blog tecnico de ThakiCloud sobre ThakiOCR-KO-v1: https://thakicloud.com/tech-blog/en/research/thakiocr-ko-v1-ovisocr3-korean-finetune/
- Organizacion ThakiCloud en GitHub: https://github.com/ThakiCloud
