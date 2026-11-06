# Stax124/anime-pose-detection-safetensors

## Resumen

`Stax124/anime-pose-detection-safetensors` es un artefacto de inferencia que combina en un unico fichero safetensors dos modelos independientes: un detector de personas YOLOv8s (single-class) entrenado por deepghs sobre imagenes de estilo anime, y un estimador de keypoints RTMPose-l de DWPose (variante `dw-ll_ucoco_384`) capaz de predecir los 133 keypoints de COCO-WholeBody. El autor del repositorio, Stax124, no entrena ningun modelo nuevo: se limita a fusionar, convertir a fp16 y empaquetar ambos componentes para su uso en "lunaflare", presumiblemente un pipeline propio de analisis de ilustracion anime.

El interes practico del repositorio es acotado pero concreto: elimina la friccion de integrar dos frameworks distintos (Ultralytics/ONNX para deteccion y mmpose/PyTorch para pose) en un unico fichero de 0,1 GB con pesos en fp16, sin dependencias de checkpoints originales. El flujo previsto es en cascada: primero se localizan las personas en la imagen completa y despues se estiman los keypoints sobre cada recorte.

No es un modelo de lenguaje ni un modelo fundacional generativo: es un par de redes convolucionales especializadas en vision por computador para dominio anime. No dispone de card con datos de entrenamiento propios, benchmarks publicados ni resultados medidos por el autor de la conversion; toda la informacion tecnica procede de los modelos originales de deepghs y DWPose.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos CNN en cascada: detector YOLOv8s (single-class, batch norms fusionadas) + estimador de pose RTMPose-l con cabeza SimCC |
| Parametros totales | no disponible (repo de 0,1 GB en fp16; el desglose por submodelo no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen) |
| Tipos de cuantizacion | unicamente fp16 (todos los tensores del fichero son f16); no se distribuyen variantes int8, GGUF ni ONNX separados |
| Idiomas soportados | no aplica (vision); el dominio visual es ilustracion de estilo anime |
| Licencia | Apache-2.0 para el conjunto; los tensores `person.*` heredan MIT (deepghs) y los `keypoints.*` Apache-2.0 (DWPose) |
| Formato de pesos | safetensors (fichero unico fp16) |

Detalles de entrada y salida por submodelo:

| Submodelo | Entrada | Salida |
|---|---|---|
| `person.*` (YOLOv8s) | RGB `[1, 3, 640, 640]` en rango `0..1`, letterbox con relleno gris 114 | `[1, 5, 8400]`: caja centro-tamano en pixeles de entrada + score de persona por ancla |
| `keypoints.*` (RTMPose-l) | recorte de persona `[1, 3, 384, 288]` normalizado con media y desviacion tipica de ImageNet | SimCC `[1, 133, 576]` y `[1, 133, 768]` para los 133 keypoints de COCO-WholeBody |

El metadato del fichero incluye `person_threshold = 0.324`, el umbral de score optimo en F1 reportado por deepghs para el detector.

## Arquitectura y entrenamiento

El componente de deteccion es un YOLOv8s de Ultralytics de clase unica (persona), exportado originalmente a ONNX por deepghs y aqui reempaquetado: los tensores `model.*` del grafo ONNX se renombran a `person.*` y las batch norms ya vienen fusionadas en las convoluciones, de modo que el fichero contiene solo pesos de inferencia sin capas de normalizacion separadas. La salida sigue el formato anchor-free de YOLOv8 con 8400 anclas para una entrada de 640x640.

El componente de pose es RTMPose-l en su variante whole-body de DWPose (`dw-ll_ucoco_384`), que predice 133 keypoints (17 de cuerpo COCO, 6 de pies, 68 de cara y 42 de manos) mediante una cabeza SimCC que modela cada coordenada como una distribucion 1D discretizada en dos ejes (576 y 768 bins). A diferencia del detector, los pesos de `keypoints.*` conservan las batch norms sin fusionar (se ha eliminado `num_batches_tracked`) y provienen directamente del `state_dict` de mmpose.

No se documenta en el repositorio ningun proceso de entrenamiento propio: no hay numero de tokens ni de imagenes, ni composicion del dataset, ni fases de RLHF/DPO (no aplicables). Los datos de entrenamiento son los de los modelos originales, no reproducidos en esta card. La unica innovacion tecnica del artefacto es el empaquetado conjunto en fp16 con metadatos de umbral, no una mejora algorítmica.

## Capacidades

- Deteccion de personas en ilustraciones de estilo anime: una sola clase, cajas centro-tamano con score de confianza por ancla.
- Estimacion de pose de cuerpo completo sobre recortes de persona: 133 keypoints de COCO-WholeBody (cuerpo, pies, cara y manos).
- Funcionamiento en cascada deteccion -> recorte -> keypoints, que permite procesar imagenes con varias personas.
- Inferencia en fp16 sin dependencia de los checkpoints originales (ONNX de deepghs ni `.pth` de DWPose).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de audio; es exclusivamente vision.
- No incluye modo thinking ni ninguna capacidad generativa.

## Casos de uso

- Preprocesado para pipelines de animacion 2D: extraer esqueletos de 133 keypoints de un fotograma anime para rigging automatico o retargeting sobre un esqueleto destino, usando el detector para aislar cada personaje antes de la estimacion.
- Control de pose en generacion condicionada (ControlNet, pose guidance): el par detector + RTMPose produce mapas de keypoints whole-body que se pueden usar como condicion de entrada en modelos de difusion para mantener la postura del personaje original.
- Etiquetado semi-automatico de datasets de personajes anime: el umbral `person_threshold = 0.324` permite generar cajas y keypoints preliminares que un anotador revisa, reduciendo el coste frente al etiquetado manual desde cero.
- Analisis de composicion y encuadre en catalogos de ilustracion: detectar cuantas personas hay en cada imagen y sus poses para clasificar escenas (retrato, grupo, accion) en una base de datos de arte.
- Herramientas de edicion asistida para artistas: seleccionar automaticamente una figura dentro de una ilustracion y ofrecer manipulacion basada en su esqueleto (correccion de proporciones, espejado de pose).
- Moderacion o filtrado de contenido en plataformas de arte: localizar figuras y sus poses para alimentar clasificadores posteriores que decidan si una imagen requiere revision, con la ventaja de que el detector es de clase unica y barato de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de AP, PCK ni OKS para el conjunto empaquetado; el unico dato de rendimiento documentado es el umbral de score `0.324` del detector, descrito por deepghs como optimo en F1 para su modelo original, no medido sobre esta conversion.

## Requisitos de hardware

- VRAM estimada: el fichero completo ocupa 0,1 GB en fp16, por lo que la inferencia cabe holgadamente en cualquier GPU con 2-4 GB de VRAM libre, incluyendo el espacio de activaciones para entradas de 640x640 y recortes de 384x288.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes o video, una RTX 3060/4060 o superior ofrece margen. A100/H100 solo tendrian sentido para procesar volumenes masivos en paralelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en iGPU con suficiente memoria compartida para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un fichero safetensors con dos submodelos de arquitecturas distintas, requiere cargar manualmente los tensores en las definiciones de red correspondientes (Ultralytics YOLOv8 para `person.*`, mmpose para `keypoints.*`); no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. Alternativas: cargar en PyTorch con `safetensors.torch.load_file`, o reexportar a ONNX/TensorRT para produccion.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta conversion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stax124/anime-pose-detection-safetensors | YOLOv8s + RTMPose-l empaquetados en fp16 | no disponible | imagen 640x640 + recorte 384x288 | Apache-2.0 (MIT en `person.*`) | Hugging Face, fichero unico |
| deepghs/anime_person_detection (`person_detect_v1.3_s`) | YOLOv8s single-class para anime | no disponible en la informacion | imagen 640x640 | MIT | Hugging Face, ONNX original |
| DWPose `dw-ll_ucoco_384` (yzd-v/DWPose) | RTMPose-l whole-body, 133 keypoints | no disponible en la informacion | recorte 384x288 | Apache-2.0 | Hugging Face, checkpoint `.pth` de mmpose |
| Ultralytics YOLOv8s-pose (generico) | Deteccion + pose de 17 keypoints en un solo modelo | no disponible en la informacion | imagen 640x640 | AGPL-3.0 (habitual) | Ultralytics, ampliamente distribuido |

La diferencia clave frente a YOLOv8s-pose generico es la cobertura de 133 keypoints (frente a 17) y el dominio especifico de anime, a costa de requerir dos pasadas en cascada y de no estar entrenado sobre fotografias reales.

## Limitaciones y advertencias

- Dominio restringido: ambos componentes estan pensados para ilustracion de estilo anime; el rendimiento sobre fotografias reales no esta documentado y probablemente sea inferior al de modelos genericos.
- Sin benchmarks propios: no hay metricas publicadas para esta conversion; el umbral `0.324` procede del modelo original de deepghs y puede no ser optimo tras el reempaquetado.
- Sin cuantizaciones alternativas: solo se distribuye fp16, lo que limita el despliegue en hardware sin soporte de media precision (algunos aceleradores embebidos).
- Integracion manual: no es un pipeline listo para usar; el consumidor debe implementar la carga de tensores, el letterbox, la normalizacion ImageNet y la decodificacion SimCC por su cuenta.
- Licencias mixtas: aunque el repositorio declara Apache-2.0, los tensores `person.*` estan bajo MIT y los `keypoints.*` bajo Apache-2.0; conviene conservar la atribucion a deepghs y a los autores de DWPose en cualquier redistribucion.
- Riesgo de fallo en poses extremas: RTMPose-l whole-body tiene dificultades conocidas con oclusiones severas y manos muy pequenas; no hay datos especificos de este empaquetado sobre esos casos.
- Sin soporte de texto ni de agentes: no es utilizable para tareas de lenguaje, razonamiento o tool calling.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa de la conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Stax124/anime-pose-detection-safetensors
- Detector original (deepghs): https://huggingface.co/deepghs/anime_person_detection
- Checkpoint original de DWPose: https://huggingface.co/yzd-v/DWPose
- Repositorio DWPose (IDEA-Research): https://github.com/IDEA-Research/DWPose
- Paper de DWPose (Yang et al.): no disponible en la informacion proporcionada
