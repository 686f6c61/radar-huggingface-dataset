# xieyuy/traffic-sign-adverse-weather

## Resumen

Traffic Sign Adverse Weather es un conjunto de checkpoints de clasificación de imágenes publicado por el usuario xieyuy (repo `xieyuy/traffic-sign-adverse-weather`) que resuelve el reconocimiento de señales de tráfico en condiciones meteorológicas adversas. No es un modelo de lenguaje: es un ensamblado de tres clasificadores convolucionales y basados en atención, entrenados sobre 25 clases de señales de tráfico y pensados para ser desplegados como solución de referencia de una competición de reconocimiento de señales bajo mal tiempo.

El ensamblado combina ConvNeXt V2-Base (peso 0,60), Swin Transformer V2-Base (peso 0,20) y EfficientNetV2-M (peso 0,20), todos ellos redes preentrenadas vía la librería `timm` sobre pesos ImageNet. El resultado publicado por el autor es un Macro-F1 de 0,945 en el conjunto de evaluación, medido sobre una CPU de 2 núcleos y sin GPU. Los checkpoints individuales alcanzan 0,938 (ConvNeXt V2-Base a 384x384), 0,917 (EfficientNetV2-M a 384x384) y 0,916 (Swin V2-Base a 256x256) de Macro-F1 de validación.

Su relevancia práctica está en el nicho: la mayoría de clasificadores de señales de tráfico se evalúan en condiciones diurnas y despejadas (GTSRB y similares), mientras que este paquete se centra explícitamente en degradaciones por lluvia, niebla, nieve o baja iluminación. El repositorio pesa 0,9 GB, la licencia es MIT y el modelo se publica con 0 descargas y 1 like en el momento de la consulta, lo que indica que es un artefacto de competición reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de tres clasificadores de imagen: ConvNeXt V2-Base (convolucional puro con bloques estilo ConvNeXt), Swin Transformer V2-Base (transformer jerarquico con atencion por ventanas desplazadas) y EfficientNetV2-M (convolucional con bloques Fused-MBConv y MBConv) |
| Parametros totales | 231 M en el ensamblado (89 M ConvNeXt V2-Base + 88 M Swin V2-Base + 54 M EfficientNetV2-M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; sin ventana de contexto textual). Resolucion de entrada: 384x384 en ConvNeXt V2-Base y EfficientNetV2-M, 256x256 en Swin V2-Base |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints `.pth` en precision de entrenamiento) |
| Idiomas soportados | zh, en (etiquetas de idioma del repositorio, referidas a la documentacion y a las clases; la tarea en si no es linguistica) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pth`), compatible con `timm`; sin pesos GGUF, safetensors ni ONNX publicados |

Otros datos del repositorio: `pipeline_tag: image-classification`, libreria `timm`, tamano del repositorio 0,9 GB, region `us`, creado y actualizado el 2026-09-18.

## Arquitectura y entrenamiento

El modelo no es una red unica sino un ensamblado tardio (late fusion) de tres arquitecturas heterogeneas. ConvNeXt V2-Base aporta una rama convolucional moderna con normalizacion GRN y preentrenamiento auto-supervisado FCMAE, con el mayor peso del ensemble (0,60) y una resolucion de entrada de 384x384. Swin Transformer V2-Base aporta una rama de atencion jerarquica con ventanas desplazadas a 256x256 y peso 0,20, y EfficientNetV2-M aporta una rama convolucional eficiente a 384x384 con peso 0,20. Las ponderaciones y la composicion del ensemble las declara el autor en la model card; no se especifica si se trata de un promedio ponderado de probabilidades, de logits o de un meta-clasificador.

No hay informacion disponible sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, las tecnicas de aumento aplicadas mas alla del propio entorno de clima adverso, ni sobre el uso de RLHF/DPO (procedimientos no aplicables a clasificacion de imagenes). Tampoco se detalla si las tres ramas se entrenaron con fine-tuning completo o con capas congeladas, ni la estrategia de calibracion de probabilidades. El unico dato cuantitativo de validacion publicado es el Macro-F1 por checkpoint y el Macro-F1 agregado del ensemble. El repositorio de GitHub del autor se anuncia como el lugar donde residen los scripts de inferencia, el codigo de entrenamiento y una retrospectiva de ingenieria, pero el contenido de ese repositorio no forma parte de la informacion proporcionada.

## Capacidades

- Clasificacion de imagenes en 25 clases de senales de trafico, segun el fichero `classes.txt` incluido en el repositorio.
- Reconocimiento robusto bajo condiciones meteorologicas adversas (lluvia, niebla, nieve, baja iluminacion), que es el eje explicito de la solucion.
- Inferencia funcional en CPU: la metrica publicada de Macro-F1 = 0,945 se obtuvo sobre una CPU de 2 nucleos sin GPU.
- Ensamblado ponderado de tres modelos con distintas resoluciones de entrada y distintas inductive biases (convolucional pura y atencion), lo que aporta diversidad de errores.
- Exportabilidad a otros runtimes a traves de `timm` y PyTorch (ONNX, TorchScript, TensorRT), aunque el autor no publica artefactos exportados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de vision, no un modelo generativo.
- No dispone de modo "thinking", vision-lenguaje, audio ni generacion de texto.
- Capacidades multilingues: no aplica en el sentido generativo; las etiquetas de idioma zh/en se refieren a la documentacion del repositorio.

## Casos de uso

- Sistemas de ayuda a la conduccion (ADAS) en vehiculos comerciales: la rama de clasificacion puede integrarse en un pipeline de percepcion que recorte senales detectadas por un detector previo y las clasifique en las 25 categorias, con la ventaja de que el modelo esta entrenado para no degradarse con lluvia o niebla.
- Vehiculos autonomos en nivel 4/5 sobre dominios operativos con climatologia adversa: el ensamblado cubre el caso en el que los clasificadores entrenados en GTSRB pierden precision por desenfoque, reflejos en el asfalto mojado o contraste reducido.
- Auditoria de infraestructura viaria: procesamiento por lotes de imagenes de camaras de trafico o de flotas de vehiculos para inventariar y verificar el estado de la senaletica en municipios, con un coste de inferencia bajo al no requerir GPU.
- Despliegue en dispositivos de borde (edge) sin GPU dedicada: al funcionar en CPU de 2 nucleos, es viable en unidades telematicas de vehiculo, Raspberry Pi o cajas de computo en poste, siempre que se exporte a un runtime ligero.
- Preetiquetado y anotacion asistida de datasets de senaletica: usar el modelo para generar etiquetas iniciales sobre imagenes no etiquetadas y reducir el coste de anotacion humana, con revision posterior de las clases de baja confianza.
- Investigacion en robustez visual: sirve como linea base reproducible para estudiar degradaciones por clima adverso, comparar tecnicas de aumento de datos o evaluar estrategias de ensamblado en clasificacion de imagenes.
- Sistemas de alerta temprana en flotas de reparto o transporte publico: clasificacion en tiempo casi real de senales captadas por camaras ya instaladas para generar avisos de exceso de velocidad, obras o prohibiciones, sin necesidad de hardware adicional.
- Recordatorio de mantenimiento de senales: combinado con geolocalizacion, permite detectar senales degradadas o mal instaladas en campanas periodicas de inspeccion municipal.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de validacion del propio autor, medidos con Macro-F1. No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks de vision como ImageNet o GTSRB.

| Modelo / configuracion | Parametros | Resolucion de entrada | Macro-F1 de validacion |
|---|---|---|---|
| Ensamblado completo (0,60 / 0,20 / 0,20) | 231 M | mixta (384 y 256) | 0,945 (evaluado en CPU de 2 nucleos, sin GPU) |
| ConvNeXt V2-Base | 89 M | 384x384 | 0,938 |
| EfficientNetV2-M | 54 M | 384x384 | 0,917 |
| Swin Transformer V2-Base | 88 M | 256x256 | 0,916 |

No se han publicado resultados de benchmarks externos en la informacion disponible. Tampoco se documenta el tamano del conjunto de validacion, la distribucion de clases ni el intervalo de confianza de estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia, no publicada por el autor): en fp32, los pesos ocupan aproximadamente 356 MB (ConvNeXt V2-Base), 352 MB (Swin V2-Base) y 216 MB (EfficientNetV2-M); el ensamblado completo ronda los 924 MB de pesos en fp32 y unos 462 MB en fp16.
- Sumando activaciones a 384x384 y lote 1, una estimacion razonable es menos de 1,5-2 GB de VRAM para un checkpoint individual y del orden de 2-3 GB para el ensamblado completo en fp16. Cualquier GPU con 4 GB o mas deberia ser suficiente.
- GPU recomendadas: no hay recomendacion oficial. Por tamano, una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes; la GPU no es un cuello de botella en este modelo.
- Cabe en GPU de consumo sin problema, e incluso en iGPU o CPU. El autor reporta la evaluacion en una CPU de 2 nucleos sin GPU, lo que confirma la viabilidad en hardware muy limitado.
- Opciones de despliegue: PyTorch con `timm` (ruta oficial del repositorio), exportacion a ONNX u ONNX Runtime, TorchScript, o TensorRT para aceleracion en GPU. vLLM, llama.cpp, Ollama y TGI no son aplicables: son runtimes para modelos de lenguaje, no para clasificadores de vision.
- Latencia y throughput: no disponibles. No se publican cifras de imagenes por segundo ni de latencia por inferencia, solo que la evaluacion completa se ejecuto en CPU de 2 nucleos.

## Comparativa con modelos similares

No se dispone de cifras publicadas de otros modelos comparables dentro de la informacion proporcionada (la busqueda web no devolvio resultados tecnicos relevantes). A modo de comparacion interna, la tabla siguiente contrasta los tres miembros del ensamblado entre si, que es la unica comparacion con datos reales disponible.

| Modelo | Parametros | Resolucion | Macro-F1 (validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ensamblado (este modelo) | 231 M | 384 y 256 | 0,945 | MIT | HuggingFace + GitHub |
| ConvNeXt V2-Base | 89 M | 384x384 | 0,938 | MIT | HuggingFace + GitHub |
| EfficientNetV2-M | 54 M | 384x384 | 0,917 | MIT | HuggingFace + GitHub |
| Swin Transformer V2-Base | 88 M | 256x256 | 0,916 | MIT | HuggingFace + GitHub |

Alternativas externas de la misma categoria (clasificadores de senales de trafico entrenados sobre GTSRB o sobre datasets de clima adverso publicados por terceros): no disponible.

## Limitaciones y advertencias

- Ambito cerrado: solo clasifica 25 clases de senales de trafico definidas en `classes.txt`. Cualquier senal fuera de ese conjunto se asignara incorrectamente a una de las clases conocidas.
- No detecta: es un clasificador de imagen completa, no un detector con cajas delimitadoras. Requiere un detector previo o imagenes ya recortadas y centradas en la senal.
- Riesgo de clasificacion erronea ante imagenes fuera de distribucion (dominio distinto de pais, tipo de camara o climatologia no cubierta). No existe mecanismo de abstencion ni de "no lo se".
- No se documenta el dataset de entrenamiento ni su composicion demografica o geografica, por lo que no es posible evaluar sesgos por pais, tipo de senal, iluminacion o camara. Este dato figura como no disponible.
- No se publican curvas de calibracion ni umbrales de confianza recomendados; usar la probabilidad softmax como criterio de decision en produccion es arriesgado sin calibracion previa.
- Las metricas declaradas (Macro-F1 = 0,945) provienen del autor y no han sido replicadas por terceros. No se especifica el tamano del conjunto de validacion ni si hubo fuga de datos con el conjunto de test de la competicion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con aviso de copyright y licencia. No obstante, el usuario debe verificar de forma independiente las licencias de los pesos preentrenados de `timm`/ImageNet subyacentes a cada rama.
- Idoneidad para seguridad critica: el modelo no esta certificado para funciones de seguridad ISO 26262 ni equivalentes. No debe usarse como unica fuente de decision en frenado, direccion o cualquier actuacion sobre el vehiculo.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso en produccion ni de mantenimiento continuado. El autor no ofrece garantias ni soporte.
- Documentacion limitada: la model card remite al repositorio de GitHub para el codigo de inferencia, el entrenamiento y la retrospectiva; el contenido de ese repositorio no forma parte de la informacion disponible en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xieyuy/traffic-sign-adverse-weather
- Repositorio GitHub del autor: https://github.com/Lyumnire/traffic-sign-adverse-weather
- Fichero de clases: `classes.txt` dentro del repositorio de HuggingFace
- Checkpoints: `convnextv2_base_best.pth`, `swin_v2_b_best.pth`, `efficientnet_v2_m_best.pth` (descargables via `huggingface_hub.hf_hub_download`)
- Papers, blogs, demos o articulos adicionales: no disponible (la busqueda web no devolvio resultados tecnicos relevantes)
