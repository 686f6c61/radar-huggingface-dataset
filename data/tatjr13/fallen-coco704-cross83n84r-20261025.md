# tatjr13/fallen-coco704-cross83n84r-20261025

## Resumen

`tatjr13/fallen-coco704-cross83n84r-20261025` es un artefacto ONNX de deteccion de objetos orientado a una unica clase: persona caida ("fallen person"). Lo publica el usuario tatjr13 y no es un modelo fundacional entrenado desde cero, sino un "kit" que fusiona dos ramas derivadas de un checkpoint publico COCO YOLO26n: una rama `native64` (seed 44283) y una rama `retain80` (seed 44284). El resultado se empaqueta como una unica sesion ONNX que se ejecuta en CPU.

La relevancia del modelo es acotada y muy especifica: sirve como componente de deteccion para un sistema de puntuacion o monitorizacion de caidas (elemento "Fallen" de SCORE), con un preprocesado fijo a 704 px y un esquema de consenso entre las dos ramas (acuerdo uno-a-uno con IoU 0.5). No es un modelo generalista ni multilingue, y su model card no documenta idiomas, contexto ni capacidades de generacion de texto: es exclusivamente vision por computador para deteccion.

El repositorio es de 0.0 GB segun HuggingFace, tiene 26 descargas y 0 likes en el momento de la consulta, y se publica bajo AGPL-3.0-only. La informacion disponible es muy limitada y procede casi exclusivamente de la model card del autor, que incluye advertencias explicitas de que los resultados son locales, no calibrados y en gran parte in-sample.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos tipo YOLO26n (dos ramas fusionadas en una sesion ONNX); detalles de capas no disponibles |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0-only |
| Formato de pesos | ONNX (sesion CPU unica) |

## Arquitectura y entrenamiento

El modelo es un ensemble de dos detectores derivados de un checkpoint publico COCO YOLO26n, entrenados por el autor con semillas distintas (`native64` seed 44283 y `retain80` seed 44284). Cada rama produce detecciones con confianza 0.1 y NMS con IoU 0.4; la fusion entre ramas se realiza mediante acuerdo uno-a-uno con IoU 0.5, usando coordenadas de la rama `native64` y la confianza pareada mas baja. El preprocesado esta fijado a 704 px y no hay adaptacion en tiempo de ejecucion, busqueda de imagenes, busqueda en red ni seleccion de umbrales.

No se documentan el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset ni si hubo RLHF/DPO (no aplica). La model card indica que las imagenes y anotaciones de entrenamiento no se redistribuyen y que el codigo editable correspondiente esta en un dataset aparte. La seleccion del par de ramas fue post hoc entre seis variantes fijas sobre cuatro frames C4 ya consumidos, lo que el propio autor califica como resultados locales no calibrados y en gran parte in-sample. La unica innovacion tecnica descrita es el esquema de consenso entre ramas y la verificacion de layout de ficheros del snapshot de HuggingFace (miembros symlink que pueden resolverse a ficheros regulares en el directorio de blobs, con comprobaciones exactas de tamano y SHA-256).

## Capacidades

- Deteccion de objetos de una unica clase: persona caida ("fallen person"), con etiquetas especificas de la tarea.
- Preprocesado fijo a 704 px y ejecucion en CPU mediante una sesion ONNX unica.
- Fusion por consenso entre dos ramas con umbrales fijos (confianza 0.1, NMS IoU 0.4, acuerdo IoU 0.5).
- Inferencia determinista sin adaptacion en tiempo de ejecucion, sin lookup de imagenes ni de red.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No se documentan capacidades de vision mas alla de la deteccion (sin segmentacion, sin captioning, sin OCR).

## Casos de uso

- Monitorizacion de caidas en entornos asistenciales: el modelo puede integrarse como detector de personas caidas en un pipeline de videovigilancia, con preprocesado fijo a 704 px y consenso entre ramas para reducir falsos positivos.
- Componente de un sistema de puntuacion tipo SCORE: encaja como elemento "Fallen" dentro de una logica de scoring que combine varias senales, dado que las etiquetas son especificas de esa tarea.
- Pre-filtrado en revision humana: las detecciones con confianza baja (0.1) y el consenso uno-a-uno permiten generar candidatos para que un operador revise, reduciendo el coste de inspeccion manual.
- Despliegue en CPU sin GPU: al ser una sesion ONNX en CPU, es adecuado para entornos edge o servidores sin acelerador, con latencia local reportada de p95 73.414 ms sobre 600 llamadas en un escenario de dos llamadores.
- Prototipado de detectores de clase unica: sirve como referencia de como fusionar dos ramas YOLO26n con consenso fijo para tareas de deteccion muy especificas.
- Validacion de paridad en pipelines de publicacion: el contrato de release incluye verificacion de layout y SHA-256, util para equipos que necesitan reproducibilidad de bytes en despliegues ONNX.

## Benchmarks y rendimiento

La model card reporta resultados locales, no calibrados y en gran parte in-sample, que no constituyen una reclamacion oficial ni de leaderboard:

| Metrica | Resultado reportado |
|---|---|
| Objetivos de referencia claros encontrados (2 frames totalmente etiquetados) | 14/14 |
| Cajas falsas definidas (2 frames totalmente etiquetados) | 3 |
| Resultados locales historicos de referencia | 545/1/0 con 528/528 retenidos |
| Paridad de consumidor original (SHA 15f9db7a) | 429 imagenes raw/public/child |
| Latencia local p95 (dos llamadores, 600 llamadas) | 73.414 ms |
| Cajas falsas C4 pendientes | 3 (asignadas al track de precision y politica de anotacion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, COCO mAP, etc.) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye como sesion ONNX para CPU; no se documenta VRAM.
- GPU recomendadas: no disponible (no se describen requisitos de GPU).
- Cabe en consumer GPU: no disponible; el diseno declarado es CPU.
- Opciones de despliegue: ONNX Runtime en CPU; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: p95 local de 73.414 ms sobre 600 llamadas con dos llamadores; el autor advierte que no es una promesa sobre asignacion de CPU en hosting ni sobre latencia de cola HTTP, y que el cold start y la paridad end-to-end deben comprobarse en la revision desplegada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fallen-coco704-cross83n84r-20261025 | No disponible | No aplica | Solo metricas locales no calibradas (14/14, 3 falsos) | AGPL-3.0-only | ONNX en HuggingFace |
| YOLO26n (checkpoint publico COCO) | No disponible | No aplica | No disponible | Depende del upstream | Publico |
| Alternativas de deteccion de caidas | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para una comparativa rigurosa con alternativas de la misma categoria; la informacion proporcionada no incluye resultados comparables de otros modelos.

## Limitaciones y advertencias

- Resultados no calibrados y en gran parte in-sample: el propio autor advierte que no son puntuaciones oficiales ni una reclamacion prospectiva de leaderboard.
- Seleccion post hoc del par de ramas entre seis variantes sobre cuatro frames ya consumidos, lo que introduce riesgo de sobreajuste a esos datos.
- Tres cajas falsas C4 conocidas y pendientes, asignadas al track de precision y politica de anotacion.
- Etiquetas especificas de tarea: algunas figuras sentadas en el suelo cuentan bajo convenciones de scoring observadas, y hay diez etiquetas vacias congeladas, cuatro de ellas casos sentados con estatus oficial sin resolver.
- Sin adaptacion en tiempo de ejecucion ni seleccion de umbrales: los umbrales estan fijados y no se ajustan al dominio de despliegue.
- Licencia AGPL-3.0-only: impone obligaciones de copyleft para uso en red; revisar compatibilidad antes de uso comercial.
- No se redistribuyen imagenes ni anotaciones de entrenamiento; el codigo editable esta en un dataset aparte.
- No hay garantia sobre cold start ni paridad end-to-end en hosting; debe verificarse en la revision desplegada.
- No se documentan sesgos, idiomas ni limitaciones de contexto porque el modelo no es de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/tatjr13/fallen-coco704-cross83n84r-20261025
- Codigo fuente editable (dataset): https://huggingface.co/datasets/tatjr13/fallen-coco704-cross83n84r-source-20261025
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
