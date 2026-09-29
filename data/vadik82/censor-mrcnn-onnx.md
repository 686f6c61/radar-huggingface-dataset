# vadik82/censor-mrcnn-onnx

## Resumen

`vadik82/censor-mrcnn-onnx` es la exportacion a ONNX del detector de censura del proyecto hent-AI ("model 268"), una red Mask R-CNN entrenada para localizar barras de censura y mosaicos sobre imagenes de manga y anime. El modelo resuelve una tarea de deteccion de instancias con dos clases: `bar` (barras solidas, tipicamente negras o blancas) y `mosaic` (pixelado o difuminado aplicado sobre la imagen original). No es un modelo generativo ni de lenguaje: es un modulo de vision por computador de un solo proposito.

El repositorio lo publica el usuario vadik82 y contiene un unico artefacto, `detector.onnx`, dentro de un repositorio que ocupa 0,3 GB. La licencia es MIT, heredada del proyecto original hent-AI de natethegreate, y el propio autor del modelo indica que el preprocesado de imagen vive en el consumidor, concretamente en el proyecto mangosh (modulo `internal/ml/censor_mrcnn`).

Su relevancia practica es la de un componente de pipeline: sirve como etapa `censor-detect` para detectar regiones censuradas antes de aplicar inpainting, filtrado, indexado o moderacion. La ficha publica no aporta informacion sobre parametros, dataset de entrenamiento ni benchmarks, por lo que muchos apartados tecnicos quedan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN (deteccion de instancias con rama de mascaras); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye un unico `detector.onnx` |
| Idiomas soportados | no disponible; no aplica (no hay procesamiento de lenguaje) |
| Licencia | MIT (licencia del proyecto original hent-AI) |
| Formato de pesos | ONNX (`detector.onnx`) |
| Clases de salida | 2: `bar`, `mosaic` |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |
| Fecha de ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura es Mask R-CNN, un detector de instancias de dos etapas que anade una rama de prediccion de mascaras a Faster R-CNN. En la practica, esto significa que el modelo no solo devuelve cajas delimitadoras con su clase, sino tambien una mascara binaria por instancia, lo que permite delimitar con precision la forma exacta de una barra o de una region mosaicada, incluidos casos con geometrias irregulares o parcialmente solapadas con el dibujo.

El modelo es una exportacion de "model 268" del proyecto hent-AI, generada con el script `export_onnx.py` del repositorio original. La informacion disponible no detalla el backbone, el numero de parametros, el volumen de datos de entrenamiento, la composicion del dataset, la resolucion de entrada soportada ni si hubo tecnicas de ajuste fino o aumento de datos. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio cambio de formato a ONNX para facilitar el despliegue. Todo ese detalle debe consultarse, si existe, en el repositorio upstream.

## Capacidades

- Deteccion de instancias de dos clases sobre imagenes de manga y anime: `bar` y `mosaic`.
- Segmentacion a nivel de pixel: genera mascaras por instancia, no solo cajas delimitadoras.
- Localizacion de multiples regiones censuradas en una misma imagen.
- Inferencia portable mediante ONNX Runtime, con posibilidad de ejecucion en CPU o GPU.
- Integracion como etapa de preprocesado en pipelines de tratamiento de imagen (por ejemplo, la etapa `censor-detect` de mangosh, clave de registro `hentai-mrcnn-268`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision general.
- No soporta tool calling ni function calling.
- No implementa comportamiento de agente ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo de razonamiento (thinking mode), audio ni video.

## Casos de uso

- Deteccion de censura en lectores de manga: integrar la salida del detector en una aplicacion de lectura para marcar automaticamente las zonas censuradas y aplicar filtros, sustituciones de imagen o avisos al lector. El modelo esta pensado exactamente para esta etapa dentro de mangosh.
- Preprocesado de datasets de investigacion: etiquetar de forma automatica grandes volumenes de paginas de manga y anime con las regiones censuradas, generando anotaciones de cajas y mascaras que alimenten estudios sobre censura editorial o entrenamiento de modelos de restauracion.
- Restauracion o reconstruccion de contenido: las mascaras generadas pueden alimentar un modelo de inpainting que rellene las regiones detectadas, de modo que el detector actua como primer paso de un pipeline de restauracion.
- Moderacion y clasificacion de contenido: en plataformas que alojan material japones, el detector ayuda a identificar paginas con censura aplicada, lo que resulta util para clasificar el material, aplicar reglas de visibilidad o etiquetar contenido segun la normativa interna.
- Control de calidad en digitalizacion y escaneado: al procesar lotes de escaneos, el modelo detecta que paginas o laminas contienen mosaicos o barras, permitiendo separar el material y revisar manualmente solo los casos marcados en lugar de la coleccion completa.
- Indexado y busqueda semantica de archivos: almacenar las coordenadas y mascaras detectadas como metadatos permite construir indices que respondan a consultas del tipo "paginas con censura por mosaico" sin reprocesar la imagen.
- Aplicaciones de edicion y conversion editorial: en herramientas que preparan material para impresion o publicacion digital, el detector permite decidir de forma automatica si una pagina requiere retoque antes de pasar a la fase de composicion.
- Investigacion sobre habitos de censura: analizar la distribucion y geometria de barras y mosaicos en un corpus permite estudiar patrones por editorial, epoca o genero, usando las mascaras y cajas como datos cuantitativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha de HuggingFace no incluye metricas de mAP, IoU, precision, recall, F1 ni comparaciones con otros detectores. Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia no confirmada, el repositorio completo ocupa 0,3 GB, lo que sugiere que los pesos en precision completa caben sin problema en cualquier GPU de consumo actual junto con los buffers de activaciones a resoluciones tipicas de pagina de manga.
- GPU recomendadas: no disponibles. Al ser un modelo ONNX, cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT como execution provider) es candidata; no se ha publicado una lista de hardware validado.
- Viabilidad en GPU de consumo: sin datos oficiales. Por el tamano del artefacto y por tratarse de un detector de dos etapas de uso no interactivo, es razonable esperar que funcione en GPUs de gama media y alta, e incluso en CPU para procesamiento por lotes, pero esto no esta confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA/TensorRT/DirectML), integracion directa en pipelines Python; el proyecto de referencia, mangosh, lo descarga con `mangosh models download` hacia `assets/model/censor-mrcnn/`.
- Latencia y throughput estimados: no disponible. Dependera del execution provider, de la resolucion de entrada y del numero de instancias por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vadik82/censor-mrcnn-onnx | no disponible | Mask R-CNN exportado a ONNX | no disponible | MIT | HuggingFace, 0 descargas |
| hent-AI "model 268" (upstream) | no disponible | Mask R-CNN en PyTorch | no disponible | MIT | GitHub (natethegreate/hent-AI) |
| Mask R-CNN de torchvision (ResNet-50 FPN) | no disponible en esta ficha | Mask R-CNN generico, 80 clases COCO | metricas COCO publicadas por torchvision | BSD-3-Clause | torchvision / PyTorch Hub |
| Detectores de segmentacion tipo YOLOv8-seg | no disponible en esta ficha | Detector de instancias de una etapa | metricas COCO publicadas por Ultralytics | AGPL-3.0 / licencia comercial | Ultralytics / HuggingFace |

La comparacion directa mas relevante es con el modelo original en PyTorch: este repositorio es una conversion de formato, por lo que cabe esperar un comportamiento equivalente salvo pequenas diferencias numericas introducidas por la exportacion. Frente a alternativas genericas (torchvision, YOLOv8-seg), la ventaja del modelo es su especializacion en las dos clases de censura de manga y anime, y su limitacion es la ausencia total de metricas publicadas que permitan cuantificar esa especializacion.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre contenido de manga y anime, el detector puede rendir peor en otros estilos graficos, en fotografias o en imagenes con censura aplicada de forma no convencional. La informacion disponible no detalla la composicion del dataset de entrenamiento, por lo que no se puede acotar el sesgo con precision.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos (detectar barras o mosaicos donde no los hay, por ejemplo en tramas de screentone o lineas gruesas) y de falsos negativos (censura parcial, semitransparente o de bajo contraste).
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa texto ni mantiene contexto conversacional.
- Resolucion y preprocesado: el preprocesado no esta incluido en el export, vive en el consumidor (mangosh, `internal/ml/censor_mrcnn`). Reutilizar el modelo fuera de ese pipeline exige replicar exactamente la misma normalizacion y escalado, o los resultados pueden degradarse de forma significativa.
- Licencia: el modelo se distribuye bajo MIT, lo que permite uso comercial, pero el material que procesa (contenido de caracter adulto) puede estar sujeto a derechos de autor y a normativa de edad o de distribucion segun la jurisdiccion. La responsabilidad del uso recae en el integrador.
- Falta de validacion comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni discusion publica documentada. No hay evidencia externa de calidad.
- Diferencias por exportacion: la conversion a ONNX puede introducir discrepancias numericas respecto al modelo PyTorch original; no se ha publicado ninguna validacion de equivalencia.
- Especificidad de dominio: no es una herramienta de moderacion general ni un detector de contenido explicito; unicamente localiza barras y mosaicos, que son tecnicas de censura concretas y muy ligadas a la edicion japonesa.
- Mantenimiento: el repositorio no muestra senales de actualizacion posterior a su creacion, y la fecha de actualizacion es identica a la de creacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vadik82/censor-mrcnn-onnx
- Proyecto original hent-AI (upstream, MIT): https://github.com/natethegreate/hent-AI
- Proyecto consumidor mangosh: https://github.com/kva3umoda/mangosh
- Script de exportacion `export_onnx.py`: incluido en el repositorio upstream hent-AI
