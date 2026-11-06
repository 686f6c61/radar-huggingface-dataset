# toqi/Gasformer

## Resumen

Gasformer es una arquitectura basada en transformer disenada especificamente para la segmentacion de emisiones de metano en imagenes de gas optico (optical gas imaging, OGI). El modelo lo desarrolla un equipo academico encabezado por Toqi Tahamid Sarker y presentado en el workshop CVPR 2024 (arXiv 2404.10841). No se trata de un modelo de lenguaje, sino de un modelo de vision por computador orientado a una tarea muy concreta: detectar y delimitar, pixel a pixel, las plumas de metano emitidas por el ganado en imagenes capturadas con camaras infrarrojas de gas.

El problema que resuelve es relevante en el contexto de monitorizacion medioambiental y ganaderia: la deteccion manual de fugas de metano en imagenes OGI requiere personal especializado y es lenta. Gasformer automatiza esa segmentacion semantica, lo que permite cuantificar emisiones de forma escalable. El repositorio de Hugging Face publica dos checkpoints entrenados con MMSegmentation a 512x512 durante 160.000 iteraciones: uno para el dataset binario de rumen de vaca lechera (CR) y otro para el dataset multiclase de liberacion controlada de metano (MR).

Se distribuye como pesos `.pth` de PyTorch dentro del ecosistema MMSegmentation, con un tamano de repositorio de 0,1 GB. Es un modelo de nicho, con cero descargas en el momento de la consulta, orientado a investigadores y equipos que trabajen en vision infrarroja y monitorizacion de gases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para segmentacion semantica de imagenes (Gasformer), implementado sobre MMSegmentation |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (checkpoints de PyTorch para MMSegmentation) |
| Tarea | Segmentacion de imagenes (image-segmentation) |
| Resolucion de entrada | 512x512 |
| Checkpoints incluidos | `CR_best_mIoU_iter_160000.pth` (binario), `MR_best_mIoU_iter_160000.pth` (multiclase) |
| Iteraciones de entrenamiento | 160.000 por checkpoint |
| Libreria | mmsegmentation |

## Arquitectura y entrenamiento

Gasformer es una arquitectura basada en transformer concebida para la segmentacion semantica de plumas de metano en imagenes de gas optico. El modelo se entrena sobre el framework MMSegmentation y produce mapas de segmentacion por pixel. Se publican dos variantes de checkpoint: una para el dataset de rumen de vaca lechera (clasificacion binaria gas/no gas) y otra para el dataset de liberacion controlada de metano (segmentacion multiclase). Ambos checkpoints corresponden a la mejor iteracion por mIoU de una ejecucion de 160.000 iteraciones con entradas de 512x512.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta de los datasets, el uso de tecnicas de aumento de datos, ni si se aplicaron estrategias de ajuste fino especificas mas alla del entrenamiento supervisado estandar de segmentacion. Tampoco se detalla el numero de parametros ni innovaciones como decodificacion especulativa o atencion lineal; estos datos figuran en el paper (arXiv 2404.10841) y en el repositorio de codigo, pero no en la model card.

## Capacidades

- Segmentacion semantica de imagenes de gas optico (OGI) para delimitar plumas de metano a nivel de pixel.
- Deteccion binaria de presencia de gas en el dataset CR (rumen de vaca lechera).
- Segmentacion multiclase en el dataset MR (liberacion controlada de metano).
- Procesamiento de imagenes a resolucion fija de 512x512.
- Integracion con el ecosistema MMSegmentation para evaluacion y despliegue.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multilingue ni generativo: no produce texto.
- No dispone de modo thinking, vision general, audio ni capacidades multimodales fuera de la imagen infrarroja de gas.

## Casos de uso

- Monitorizacion de emisiones en explotaciones ganaderas: el modelo segmenta las plumas de metano en imagenes OGI capturadas por camaras infrarrojas, permitiendo estimar la extension de las emisiones del ganado de forma automatica y repetible.
- Auditoria medioambiental y reporting de emisiones: integrado en un pipeline de captura de imagenes, Gasformer genera mascaras de gas que pueden servir como evidencia cuantificable para inventarios de emisiones y cumplimiento normativo.
- Investigacion en ganaderia y nutricion animal: el checkpoint CR permite comparar la emision de metano entre dietas o razas a partir de imagenes de rumen, facilitando estudios comparativos a escala.
- Deteccion de fugas en instalaciones de gas: con el checkpoint MR (liberacion controlada), el modelo puede adaptarse a la deteccion de plumas en entornos industriales donde se realizan pruebas de fuga controladas.
- Validacion de camaras OGI: las mascaras predichas permiten evaluar la sensibilidad y la calidad de calibracion de camaras de gas optico frente a un modelo de referencia.
- Automatizacion de anotacion de datasets: las segmentaciones del modelo pueden usarse como preetiquetado para acelerar la creacion de nuevos datasets de imagenes OGI, reduciendo el coste de anotacion manual.
- Docencia y prototipado en vision infrarroja: al estar construido sobre MMSegmentation, sirve como punto de partida reproducible para experimentos academicos con segmentacion en imagenes no visibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que los checkpoints corresponden a la mejor iteracion por mIoU de una ejecucion de 160.000 iteraciones, sin aportar cifras concretas de mIoU, precision o recall, ni comparaciones con otros modelos. Los resultados numericos deben consultarse en el paper (arXiv 2404.10841) o en el repositorio de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de segmentacion de 512x512 con pesos de 0,1 GB de repositorio, es previsible que quepa en GPUs de consumo, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamano del repositorio, pero no confirmada oficialmente.
- Opciones de despliegue: MMSegmentation (via `tools/test.py` del repositorio de codigo); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de parametros en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con otras arquitecturas de segmentacion de gas optico. Como referencia cualitativa, la tarea se encuadra en el ambito de la segmentacion semantica de imagenes infrarrojas, donde existen arquitecturas genericas como U-Net, DeepLabv3+ o SegFormer implementadas en MMSegmentation, pero no se aportan resultados comparativos en la model card.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gasformer (CR/MR) | no disponible | 512x512 | no disponible | Hugging Face + GitHub |
| Alternativas de segmentacion generica (U-Net, DeepLabv3+, SegFormer) | no disponible | variable | no disponible | amplia en MMSegmentation |

## Limitaciones y advertencias

- Es un modelo de vision especializado en imagenes OGI; no es un modelo de lenguaje ni un asistente conversacional.
- No se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido; debe consultarse con los autores antes de cualquier despliegue productivo.
- Entrenado exclusivamente para segmentacion de metano en imagenes de gas optico; no generaliza a otras tareas de vision sin reentrenamiento.
- La resolucion de entrada esta fijada en 512x512, lo que puede limitar la deteccion de plumas muy pequenas o muy grandes sin tecnicas de mosaico.
- Riesgo de falsos positivos y negativos en condiciones de imagen no representadas en el entrenamiento (iluminacion, fondo, tipo de camara); no se documentan sesgos concretos.
- No se detallan los datasets de entrenamiento, por lo que no puede evaluarse su cobertura geografica, de razas o de condiciones ambientales.
- Repositorio con cero descargas y sin metadatos de idioma: no hay evidencia de validacion por parte de la comunidad.
- No se documentan umbrales de confianza ni calibracion, aspectos criticos para uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/toqi/Gasformer
- Paper (arXiv): https://arxiv.org/abs/2404.10841
- Repositorio de codigo: https://github.com/toqitahamid/Gasformer
- Publicacion CVPR Workshops 2024: Sarker et al., "Gasformer: A Transformer-based Architecture for Segmenting Methane Emissions from Livestock in Optical Gas Imaging", Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR) Workshops, junio de 2024, pp. 5489-5497.
