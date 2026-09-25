# vectorsense/organscan

## Resumen

OrganScan es un clasificador de imagen jerarquico y multi-etiqueta desarrollado por vectorsense, publicado en HuggingFace bajo licencia Apache 2.0. Su funcion es analizar un fotograma renderizado a partir de datos de pixel DICOM (ecografia, tomografia computarizada, resonancia magnetica o rayos X) y devolver tres cosas simultaneamente: la modalidad de imagen, la region anatomica del cuerpo y todos los organos visibles en el encuadre. No es un clasificador plano de organos, sino una jerarquia de tres niveles supervisados de forma independiente.

Tecnicamente se apoya en el backbone `mobilenetv4_conv_small.e2400_r224_in1k` de timm, inicializado con pesos de ImageNet y afinado despues. Sobre ese tronco comun monta tres cabezas con activacion sigmoide independiente: modalidad (5 clases), region (8 clases) y organo (30 clases). El artefacto distribuido es un modelo ONNX cuantizado a INT8 de 2,9 MB, disenado para ejecucion exclusiva en CPU y sin acceso a red durante la inferencia, con una latencia declarada de aproximadamente 26,878 ms por fotograma.

Su relevancia practica esta en el enrutado y el triaje de estudios de imagen: dado un frame, el modelo responde "que estudio es este y que se ve en el", de modo que un pipeline posterior pueda seleccionar el modelo adecuado, la ventana de visualizacion correcta o el lector apropiado. El propio autor advierte de forma explicita que no es un dispositivo de diagnostico: informa de anatomia, nunca de patologia, y carece de cualquier tipo de aprobacion regulatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con backbone MobileNetV4 (`mobilenetv4_conv_small.e2400_r224_in1k`) y tres cabezas sigmoide independientes (multimodal / region / organo) |
| Parametros totales | no disponible (el autor no declara el recuento; el artefacto INT8 ocupa 2,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 224 x 224 px, lote dinamico |
| Tipos de cuantizacion | INT8 (ONNX cuantizado) |
| Idiomas soportados | no disponible (clasificacion de imagen; sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8) |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Modalidades soportadas | US (ecografia), CT (tomografia computarizada), MR (resonancia magnetica), XR (rayos X) |
| Entrada | `pixel_values` float32 `[batch, 3, 224, 224]`, formato NCHW, normalizado con estadisticas de ImageNet |
| Salidas | `modality_logits`, `region_logits`, `organ_logits` (logits, no probabilidades) |
| Cabezas | modalidad (5) · region (8) · organo (30) |
| Version de taxonomia | 1.0.0 (un cambio de ancho de cabeza implica subida de version, nunca edicion silenciosa) |
| Latencia declarada | ~26,878 ms por fotograma en CPU con `onnxruntime` |
| Tamano del repositorio | 0,0 GB (redondeado) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo parte del backbone `mobilenetv4_conv_small.e2400_r224_in1k` preentrenado en ImageNet y lo afina como extractor de caracteristicas. Sobre el tronco compartido se anaden tres cabezas de clasificacion con activacion sigmoide independiente, lo que permite etiquetado multi-etiqueta real: una vista ecografica de hipocondrio derecho puede mostrar higado, rinon derecho y diafragma a la vez. El autor justifica explicitamente esta eleccion frente a softmax: al estar normalizada, una softmax penalizaria matematicamente `kidney` al subir `liver`, entrenando al modelo a suprimir un organo visiblemente presente. Con sigmoides independientes pueden coexistir valores como `liver=0,91` y `kidney_right=0,86`.

La jerarquia de tres niveles responde a que las etiquetas llegan con granularidades distintas. Una serie DICOM que solo incluye el campo `Modality` supervisa un unico nivel, mientras que un corte de TotalSegmentator supervisa los tres. La perdida enmascarada por clase permite que cada fotograma contribuya unicamente a los niveles y las clases sobre los que realmente tiene informacion, evitando descartar la mayor parte del corpus como haria un clasificador plano. La separacion por niveles tambien habilita un informe de error mas preciso: el autor reporta de forma independiente los fallos de lateralidad (0,7% de los fotogramas en los que identifica correctamente el organo pero elige el lado equivocado), porque confundir `kidney_left` con `kidney_right` es un error menor mientras que confundir `thyroid` con `bladder` no lo es, y promediarlos ocultaria el error costoso. El entrenamiento se evaluo sobre un split de test con politica `balanced`; no se detalla en la informacion disponible el numero exacto de tokens o imagenes de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un clasificador de imagen).

## Capacidades

- Clasificacion multi-etiqueta jerarquica de imagen medica en tres niveles simultaneos: modalidad, region anatomica y organos visibles.
- Identificacion de modalidad entre cuatro tipos: ecografia (US), tomografia computarizada (CT), resonancia magnetica (MR) y rayos X (XR).
- Deteccion de hasta 30 organos y estructuras anatomicas de forma independiente por fotograma, incluyendo estructuras bilaterales con distincion de lado (pulmon izquierdo/derecho, rinon izquierdo/derecho, femur izquierdo/derecho, adrenal izquierda/derecha).
- Clasificacion de 8 regiones corporales.
- Soporte de lote dinamico (`batch` variable) manteniendo altura y anchura fijas en 224 px para preservar la optimizacion de los kernels de ONNX Runtime y NNAPI.
- Ejecucion completamente offline: el artefacto no realiza ninguna llamada de red durante la inferencia.
- Consulta de metadatos en tiempo de ejecucion: el endpoint `GET /metadata` del servicio reporta el nivel (tier) de cada clase, de modo que quien invoca puede distinguir una clase validada de una experimental.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que no es un modelo de lenguaje.
- No realiza deteccion de patologia: solo informa de anatomia.

## Casos de uso

- Enrutado de estudios en un PACS o sistema de gestion de imagen: antes de decidir que modelo de analisis aplicar, el sistema clasifica el fotograma con OrganScan para saber si es una ecografia abdominal, un CT toracico o una radiografia, y deriva la peticion al pipeline adecuado.
- Triaje previo a la lectura radiologica: dado un volumen de DICOM, el modelo marca que frames contienen organos concretos y con que confianza, permitiendo a un servicio posterior priorizar o descartar vistas poco informativas.
- Indexacion y busqueda de imagen medica: al etiquetar automaticamente modalidad, region y organos, un repositorio de estudios puede indexarse y consultarse por contenido anatomico sin metadatos DICOM fiables.
- Seleccion automatica de ventana de visualizacion: en CT, conocer que organos aparecen en el frame permite escoger la ventana (partes blandas, pulmon, hueso) mas apropiada para el visor.
- Control de calidad de adquisiciones: si un estudio etiquetado como ecografia abdominal no muestra higado ni rinones, el sistema puede marcar la serie para revision por posible error de protocolo.
- Preprocesado en dispositivos de borde o portatiles: gracias a sus 2,9 MB en INT8 y su ejecucion solo en CPU, puede desplegarse en un nucleo ARM de clase telefonica para clasificar fotogramas localmente en un ecografo portatil, sin conexion a internet y sin enviar datos del paciente a un servidor.
- Etiquetado asistido para construccion de datasets: el modelo puede proponer etiquetas iniciales de anatomia sobre grandes volumenes de imagenes que un equipo de anotacion despues revisa, reduciendo el coste de anotacion manual.
- Filtrado previo en investigacion clinica retrospectiva: para seleccionar cohortes de imagenes que contengan una determinada region u organo antes de aplicar modelos mas costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test con politica `balanced`:

| Nivel | Clases evaluadas | macro-AP |
|---|---:|---:|
| modalidad | 4 | 1,000 |
| region | 8 | 0,980 |
| organo | 30 | 0,917 |

Desglose por organo (seleccion de las clases con mayor y menor rendimiento):

| Organo | AP | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|---:|
| `BREAST` | 1,000 | 1,000 | 1,000 | 1,000 | 155 |
| `UTERUS` | 1,000 | 0,978 | 1,000 | 0,989 | 132 |
| `LUNG_RIGHT` | 0,992 | 0,959 | 0,986 | 0,972 | 2.148 |
| `LUNG_LEFT` | 0,992 | 0,953 | 0,987 | 0,969 | 2.154 |
| `AORTA_ABDOMINAL` | 0,989 | 0,894 | 0,989 | 0,939 | 1.784 |
| `BRAIN` | 0,986 | 0,831 | 0,997 | 0,906 | 773 |
| `LIVER` | 0,983 | 0,921 | 0,956 | 0,938 | 2.806 |
| `KIDNEY_RIGHT` | 0,970 | 0,804 | 0,964 | 0,877 | 1.369 |
| `SPLEEN` | 0,956 | 0,864 | 0,909 | 0,886 | 1.631 |
| `PANCREAS` | 0,950 | 0,776 | 0,966 | 0,861 | 1.349 |
| `STOMACH` | 0,932 | 0,807 | 0,910 | 0,855 | 1.173 |
| `BLADDER` | 0,931 | 0,830 | 0,882 | 0,856 | 748 |
| `THYROID` | 0,811 | 0,552 | 0,896 | 0,683 | 212 |
| `ESOPHAGUS` | 0,801 | 0,555 | 0,963 | 0,704 | 1.103 |
| `PROSTATE` | 0,790 | 0,520 | 0,878 | 0,653 | 74 |
| `GALLBLADDER` | 0,689 | 0,431 | 0,940 | 0,591 | 446 |
| `ADRENAL_LEFT` | 0,643 | 0,320 | 0,919 | 0,475 | 174 |
| `ADRENAL_RIGHT` | 0,633 | 0,358 | 0,905 | 0,513 | 147 |

Metricas adicionales reportadas por el autor:

| Corte de evaluacion | Filas | macro-AP de organo |
|---|---:|---:|
| in_distribution | 15.395 | 0,917 |

- Nivel de bucle (loop level): sobre 1.413 bucles, el macro-AP de organo sube a 0,945. El autor senala que esta es la cifra que realmente experimenta un usuario en ecografia.
- Lateralidad: el modelo elige el lado equivocado en el 0,7% de los fotogramas en los que identifica correctamente el organo.

No se han publicado resultados de benchmarks estandar de la industria (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- El artefacto ONNX INT8 ocupa 2,9 MB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo e incluso en memoria no dedicada.
- La inferencia esta declarada como exclusiva de CPU: el autor no publica requisitos de VRAM ni versiones GPU del modelo.
- Latencia declarada: aproximadamente 26,878 ms por fotograma en CPU mediante `onnxruntime`.
- Puede ejecutarse en un nucleo ARM de clase telefonica, lo que situa el objetivo en despliegue de borde mas que en aceleracion por GPU.
- GPU recomendadas: no disponible (el modelo no esta pensado para inferencia en GPU segun la informacion proporcionada).
- Caber en GPU de consumo: si, sin problema por tamano, aunque el artefacto distribuido esta orientado a CPU.
- Opciones de despliegue: `onnxruntime` (runtime de referencia citado por el autor), con compatibilidad con kernels NNAPI segun la model card; tambien es integrable en HuggingFace Hub mediante `hf_hub_download` para la descarga del artefacto. No se mencionan vLLM, llama.cpp, Ollama ni TGI, logicamente por tratarse de un clasificador de imagen y no de un modelo generativo.
- Throughput estimado: no disponible (solo se publica la latencia por fotograma). A partir de esa cifra, el limite teorico en un solo hilo seria de aproximadamente 37 fotogramas por segundo.
- El lote es dinamico, pero la resolucion de entrada esta fijada en 224 x 224 para no romper la optimizacion de los kernels.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de comparativas publicadas por el autor frente a otros clasificadores de anatomia de imagen medica, ni de resultados de esos hipoteticos modelos sobre el mismo split de evaluacion. Por tanto, los datos de comparacion se marcan como no disponibles.

Puntos de referencia que si aparecen en la informacion disponible:

| Referencia | Relacion con OrganScan | Datos comparables |
|---|---|---|
| `timm/mobilenetv4_conv_small.e2400_r224_in1k` | Backbone base sobre el que se afina OrganScan; entrenado en ImageNet (clasificacion generica, no medica) | No se publican metricas del backbone sobre el test de OrganScan. La tarea y el etiquetado son distintos, por lo que la comparacion directa de rendimiento no es valida |
| TotalSegmentator | Fuente de supervision de etiquetas citada por el autor; es un modelo de segmentacion, no de clasificacion | No comparable en metrica: segmenta estructuras, OrganScan clasifica fotogramas |

Para una comparacion rigurosa haria falta evaluar alternativas de clasificacion anatomica sobre el mismo split `balanced` y el mismo conjunto de 30 clases de organo, dato que no esta disponible.

## Limitaciones y advertencias

- No es un dispositivo medico y no tiene ninguna aprobacion regulatoria. El autor lo declara explicitamente: informa de anatomia, nunca de patologia.
- Riesgo de alucinacion en el sentido de falsos positivos: al usar sigmoides independientes, el modelo puede activar clases que no estan presentes, especialmente en las clases con baja precision (`ADRENAL_LEFT` 0,320, `ADRENAL_RIGHT` 0,358, `GALLBLADDER` 0,431, `PROSTATE` 0,520, `PORTAL_VEIN` 0,522, `THYROID` 0,552).
- Rendimiento muy desigual por clase: el macro-AP de organo (0,917) oculta clases con AP por debajo de 0,7, como `ADRENAL_RIGHT` (0,633), `ADRENAL_LEFT` (0,643), `GALLBLADDER` (0,689) y `PROSTATE` (0,790).
- Error de lateralidad: el 0,7% de los fotogramas en los que el organo se identifica correctamente se le asigna el lado equivocado.
- Desbalance de soporte: algunas clases se evaluan con muy pocas muestras (`PROSTATE` con 74, `UTERUS` con 132, `OVARY` con 141, `ADRENAL_RIGHT` con 147), por lo que sus metricas tienen intervalos de confianza amplios.
- Las metricas por organo corresponden a fotogramas; el autor advierte de que la cifra relevante en ecografia es la de nivel de bucle (0,945), no la de fotograma (0,917).
- Limitacion de resolucion: la entrada esta fijada a 224 x 224 px, lo que puede comprometer estructuras pequenas o de bajo contraste.
- Cobertura de modalidades limitada a US, CT, MR y XR.
- Los tiers de clase declarados en la model card (`model_trained`, `weak_label_only`, `experimental` y `blocked`) aparecen todos con recuento cero, de modo que la informacion sobre que clases estan validadas no es utilizable tal como figura en la tarjeta.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al tratarse de un modelo que procesa datos de imagen medica, la responsabilidad sobre el cumplimiento normativo (RGPD, MDR y equivalentes) recae en quien lo despliega, no en el autor.
- La model card no documenta la composicion del dataset de entrenamiento ni su procedencia, lo que dificulta auditar sesgos de poblacion o de equipo de adquisicion.
- Repositorio sin descargas registradas (0) y creado en septiembre de 2026, por lo que la validacion por parte de terceros es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vectorsense/organscan
- Modelo base (backbone): https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- ONNX Runtime: https://onnxruntime.ai/
- timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Paper de MobileNetV4 (referencia del backbone): no disponible en la informacion proporcionada
- Paper, blog o demo especificos de OrganScan: no disponible en la informacion proporcionada
