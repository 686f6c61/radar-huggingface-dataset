# TontonTremblay/doper2-handal-obj000008

## Resumen

Modelo de estimacion de pose 6D para el objeto 000008 del dataset HANDal, entrenado con el pipeline DOPER2 en su etapa V5. Desarrollado por Jonathan Tremblay (TontonTremblay), investigador especializado en vision por computador y robotica. El modelo combina un backbone ConvNeXt-Tiny preentrenado con DINOv3 y una cabeza de keypoints basada en mapas de calor para predecir 64 puntos 3D, que permiten resolver la pose completa del objeto mediante solvePnP. Su relevancia radica en abordar un problema critico en robotica: la localizacion precisa de objetos en 6 grados de libertad a partir de imagenes RGB monocular.

El checkpoint ocupa 0.3 GB y el pipeline de entrenamiento combina datos sinteticos con realidad aumentada (10.000 imagenes), datos PBR del benchmark BOP y pseudo-etiquetas de onboarding. El modelo esta disenado para un unico objeto (000008) y no generaliza a otros, lo que lo convierte en una solucion especializada para aplicaciones de manipulacion robotica y automatizacion industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (DINOv3) + cabeza de keypoints con heatmap |
| Parametros totales | no disponible (backbone ConvNeXt-Tiny) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone ConvNeXt-Tiny preentrenado con DINOv3 (variante lvd1689m) y una cabeza de keypoints basada en mapas de calor (heatmap). El detector procesa imagenes de 224x224 pixeles y el crop de keypoints se ajusta a 256x256. El pipeline de entrenamiento DOPER2 en su etapa V5 combina tres fuentes de datos: 10.000 imagenes sinteticas con realidad aumentada (DR synth), datos PBR del benchmark BOP y pseudo-etiquetas generadas durante el proceso de onboarding. El modelo predice 64 keypoints 3D expresados en metros, que se convierten a milimetros para resolver la pose mediante solvePnP con la matriz intrinseca de la camara.

## Capacidades

- Estimacion de pose 6D completa (rotacion y traslacion) para el objeto HANDal 000008.
- Deteccion del objeto en la imagen con umbral de confianza configurable (score_thr).
- Prediccion de 64 keypoints 3D con precision metrica (metros).
- Inferencia sobre imagenes RGB monocular con calibracion intrinseca conocida.
- Integracion con OpenCV para resolucion de pose via solvePnP (bandera SQPNP).
- Configuracion reproducible mediante archivos YAML y JSON de provenance (config.yaml, training_provenance.json).

## Casos de uso

- Manipulacion robotica: el modelo permite a un brazo robotico localizar el objeto 000008 en el espacio 3D con precision milimetrica, habilitando tareas de agarre y ensamblaje automatizado.
- Control de calidad en fabricacion: verificar la posicion y orientacion del objeto en una linea de montaje, detectando desalineaciones respecto a la pose esperada.
- Realidad aumentada industrial: superponer informacion digital (instrucciones, esquemas) sobre el objeto fisico con alineacion 6D precisa.
- Automatizacion de almacenes: localizar y recoger el objeto en entornos no estructurados mediante camaras RGB convencionales.
- Investigacion en estimacion de pose: servir como referencia reproducible para el benchmark BOP y comparar metodos alternativos de keypoint-based pose estimation.
- Integracion en sistemas de vision robotica: combinar con pipelines de deteccion y seguimiento para aplicaciones de pick-and-place en tiempo real.

## Benchmarks y rendimiento

El autor referencia resultados de validacion BOP para el objeto 000008 en el dataset TontonTremblay/doper2-handal-results, pero los valores numericos no estan incluidos en la informacion proporcionada. No se dispone de metricas como ADD, ADD-S o error de keypoints en la model card.

## Requisitos de hardware

- Tamano del checkpoint: 0.3 GB en formato .pth.
- Requiere GPU CUDA para inferencia (el codigo de ejemplo utiliza cuda:0).
- Dado el tamano reducido del modelo, es compatible con GPUs de consumo (serie RTX) y no requiere hardware de datacenter.
- Entradas de 224x224 (deteccion) y 256x256 (crop de keypoints), con requisitos de memoria modestos.
- Despliegue mediante el paquete Python doper2 con PyTorch; no se documentan opciones de servidores de inferencia especificos.

## Comparativa con modelos similares

No disponible. Este es un modelo especializado para un unico objeto del dataset HANDal, entrenado con un pipeline propietario (DOPER2). No se dispone de informacion sobre modelos comparables para el mismo objeto y tarea en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para el objeto 000008 del dataset HANDal; no generaliza a otros objetos ni categorias.
- La licencia no esta especificada, lo que genera incertidumbre sobre el uso comercial y la redistribucion.
- Los resultados de validacion BOP no estan incluidos en la model card; se remite a un dataset separado para consultar las tablas completas.
- El rendimiento depende de la calidad de la calibracion de la camara (matriz intrinseca K) y de las condiciones de iluminacion.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con datos sinteticos y PBR, puede degradarse ante condiciones de imagen no representadas (oclusiones severas, desenfoque, condiciones extremas de iluminacion).
- El codigo de inferencia requiere el paquete doper2, cuya disponibilidad publica no se detalla en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TontonTremblay/doper2-handal-obj000008
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en HuggingFace: https://huggingface.co/TontonTremblay
- GitHub del autor: https://github.com/TontonTremblay
