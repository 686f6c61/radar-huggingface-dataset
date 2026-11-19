# weecology/everglades-airplane-species-classifier

## Resumen

El modelo `weecology/everglades-airplane-species-classifier` es un clasificador de imagen desarrollado por el laboratorio Weecology (Universidad de Florida) para identificar especies de aves vadeadoras en fotografías aéreas del Parque Nacional de los Everglades. Se trata de un componente de dos etapas: un detector (`weecology/everglades-bird-airplane`) localiza cada ave y este clasificador asigna una de siete especies al recorte resultante. La arquitectura es una ResNet-50 preentrenada en ImageNet, adaptada mediante la clase `CropModel` de la librería DeepForest.

El modelo resuelve un problema práctico de ecología de campo: contar y clasificar colonias de aves en imágenes de dron o avioneta de alta resolución (8256 × 5504 px) sin revisión manual. Con 23,5 millones de parámetros y un repositorio de apenas 0,1 GB, es un modelo ligero pensado para ejecutarse en pipelines de ecología computacional, no para uso general.

Es relevante porque demuestra el patrón de composición detector + clasificador sobre librerías de visión ecológica, y porque publica métricas desglosadas por clase que reflejan el desequilibrio real de los datos (la clase White Ibis concentra 2223 de los 4815 recortes de entrenamiento). La licencia MIT y el formato safetensors facilitan su reutilización, aunque su dominio de aplicación es muy estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (ImageNet) envuelta en `CropModel` de DeepForest |
| Parametros totales | 23.575.495 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 224 × 224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imagen; etiquetas en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Libreria | deepforest (requiere main de GitHub posterior a nov. 2026) |
| Tamano del repositorio | 0,1 GB |
| Clases | 7 especies de aves vadeadoras |

## Arquitectura y entrenamiento

El modelo es una ResNet-50 con pesos inicializados en ImageNet, reentrenada como clasificador de recortes. Cada recorte de entrada es una ventana de 100 × 100 px centrada en un ave, redimensionada a 224 px. El entrenamiento usó Adam con `lr = 0.0001`, batch de 32, hasta 30 épocas, muestreo balanceado por clase y volteos horizontales como única aumentación. Se conservó la época con menor pérdida de validación.

Los datos provienen de 21 fotografías aéreas (Nikon DSLR, 8256 × 5504 px) tomadas en marzo-abril de 2022 en 11 colonias de los Everglades, con 4815 aves contadas manualmente mediante Photoshop Count Tool. Las etiquetas cubren siete códigos de especie: GREG, SNEG, WHIB, WOST, GBHE, ROSP y ANHI. Small White Heron se fusiona con Snowy Egret y Little Blue Heron se descarta, en coherencia con el detector asociado. La validación es un 20 % aleatorio de aves por clase, extraído de las mismas fotografías de entrenamiento, por lo que las métricas son optimistas para colonias o años nuevos.

## Capacidades

- Clasificación de imagen en 7 clases de aves vadeadoras: Anhinga, Great Blue Heron, Great Egret, Roseate Spoonbill, Snowy Egret, White Ibis y Wood Stork.
- Integración nativa con el detector `weecology/everglades-bird-airplane` mediante `predict_tile` y el parámetro `crop_model`, devolviendo `cropmodel_label` y `cropmodel_score`.
- Procesamiento por lotes de recortes dentro de un pipeline de detección + clasificación sobre imágenes de gran formato.
- Configuración de expansión de caja (`expand: 25`) para alinear los recortes del detector (~50 px) con la ventana de entrenamiento (100 px).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión general: es un clasificador cerrado de imagen.

## Casos de uso

- **Monitorización de colonias de aves vadeadoras**: combinado con el detector, permite contar y clasificar automáticamente individuos en ortomosaicos aéreos de los Everglades, sustituyendo el conteo manual en Photoshop sobre imágenes de 8256 × 5504 px.
- **Seguimiento interanual de poblaciones**: al ejecutarse sobre nuevas campañas de fotografía aérea, genera series temporales de abundancia por especie; conviene revalidar porque el modelo solo vio datos de 2022.
- **Priorización de revisión humana**: con umbrales bajos de confianza (`cropmodel_score`), el pipeline puede marcar recortes dudosos para inspección manual, reduciendo el volumen de revisión a las clases minoritarias (Roseate Spoonbill, Anhinga).
- **Investigación en ecología computacional**: sirve como línea base reproducible (MIT, safetensors, 0,1 GB) para comparar arquitecturas de clasificación de recortes en datasets ecológicos desbalanceados.
- **Prototipado de pipelines DeepForest**: ejemplo funcional de `CropModel` cargado desde el Hub, útil para equipos que construyen detectores + clasificadores propios con la misma librería.
- **Docencia y divulgación**: caso de estudio de desequilibrio de clases y de evaluación con fuga de datos (validación intra-fotografía), adecuado para cursos de visión por computador aplicada.

## Benchmarks y rendimiento

Métricas de validación publicadas por el autor (20 % aleatorio intra-fotografía):

| Métrica | Valor |
|---|---|
| Accuracy global | 0,90 |
| Recall medio por clase | 0,70 |

| Clase | Recortes train | Recortes val | Precision | Recall |
|---|---|---|---|---|
| Anhinga | 23 | 7 | 1,00 | 0,14 |
| Great Blue Heron | 105 | 23 | 0,79 | 0,83 |
| Great Egret | 720 | 178 | 0,86 | 0,81 |
| Roseate Spoonbill | 21 | 5 | 1,00 | 0,40 |
| Snowy Egret | 406 | 113 | 0,80 | 0,86 |
| White Ibis | 2223 | 597 | 0,95 | 0,95 |
| Wood Stork | 316 | 78 | 0,84 | 0,90 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 23,5 M de parámetros; en la práctica, el cuello de botella es el detector y el tamaño de las teselas de entrada, no el clasificador.
- GPU recomendadas: cualquier GPU con al menos 4 GB; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas. También es viable en CPU para volúmenes moderados.
- Cabe en cualquier GPU de consumo actual e incluso en entornos sin GPU para lotes pequeños.
- Opciones de despliegue: `deepforest` (main de GitHub posterior a noviembre de 2026; la versión 2.1.0 no carga `CropModel` desde el Hub), PyTorch nativo cargando el safetensors, o exportación a ONNX/TorchScript (no documentada por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| weecology/everglades-airplane-species-classifier | 23,5 M | Clasificación de 7 especies de aves | 224 × 224 px | MIT | Hugging Face |
| weecology/everglades-bird-airplane | no disponible | Detección de aves (etapa previa) | teselas de 800 px | no disponible | Hugging Face |
| weecology/everglades-bird-species-detector | no disponible | Detección + clasificación de especies | no disponible | no disponible | Hugging Face |
| ResNet-50 ImageNet (torchvision) | 25,6 M | Clasificación genérica de 1000 clases | 224 × 224 px | BSD-3 | torchvision |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Clases minoritarias con muy pocos ejemplos (Roseate Spoonbill: 26 recortes totales; Anhinga: 30), lo que produce métricas ruidosas y recall bajo (0,40 y 0,14 respectivamente).
- Little Blue Heron y juveniles oscuros no están modelados: se asignarán a la clase más cercana, generando falsos positivos silenciosos.
- Un solo sensor, una sola temporada (2022) y 21 fotografías: se espera degradación con otras altitudes, ángulos o condiciones de luz.
- La validación procede de las mismas fotografías que el entrenamiento, por lo que el 0,90 de accuracy es optimista para colonias o años no vistos.
- Dominio de aplicación muy estrecho: no es un clasificador de aves general ni un modelo de visión de propósito general.
- El desequilibrio de clases es severo (White Ibis representa el 46 % de los recortes de entrenamiento), lo que sesga las predicciones hacia las clases mayoritarias.
- Requiere `deepforest` desde main de GitHub posterior a noviembre de 2026; la versión estable 2.1.0 no carga `CropModel` desde el Hub, lo que complica la reproducibilidad en entornos con versiones fijadas.
- Licencia MIT permite uso comercial, pero la utilidad comercial es marginal dado el dominio restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weecology/everglades-airplane-species-classifier
- Detector asociado: https://huggingface.co/weecology/everglades-bird-airplane
- Detector + clasificador de especies: https://huggingface.co/weecology/everglades-bird-species-detector
- Repositorio de código: https://github.com/weecology/EvergladesAirplane
- Librería DeepForest: https://github.com/weecology/DeepForest
