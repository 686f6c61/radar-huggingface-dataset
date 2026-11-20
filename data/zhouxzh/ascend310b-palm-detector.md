# zhouxzh/ascend310b-palm-detector

## Resumen

`zhouxzh/ascend310b-palm-detector` es un repositorio de pesos ONNX para deteccion de manos (palmas) orientado a su despliegue en placas con acelerador Ascend 310B. No es un modelo de lenguaje ni un modelo fundacional: es una coleccion de detectores de objetos ligeros (NanoDet y PicoDet) entrenados especificamente para localizar manos y clasificar su orientacion superficial (`palm`, `back`, `side`) o su lateralidad (`left_palm`/`right_palm`). El autor es `zhouxzh` y el repositorio se publica bajo licencia Apache-2.0.

El interes practico del repositorio es que agrupa 37 ficheros ONNX organizados en siete variantes con contratos de entrada y geometria de preprocesado distintos (estirado directo frente a LetterBox), lo que permite elegir el compromiso entre precision y coste de preprocesado en el dispositivo. Las cajas de entrenamiento provienen de las detecciones de mano de MediaPipe sobre el dataset HaGRIDv2, no de las etiquetas oficiales de gestos de HaGRID.

El modelo resuelve un problema acotado dentro de un pipeline mayor de reconocimiento de palma: la deteccion y el recorte de la region de interes antes de la etapa de identificacion biometrica, que el autor publica por separado. Es relevante para quienes despliegan vision por computador en hardware Ascend de bajo consumo y necesitan artefactos ONNX con revision fija y sumas de verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores de objetos ligeros NanoDet y PicoDet (exportados a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos ONNX en el repositorio) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (37 ficheros), con `SHA256SUMS` para verificacion |
| Entrada | Imagen BGR; NanoDet con mean `[103.53, 116.28, 123.675]` y std `[57.375, 57.12, 58.395]`; PicoDet con decodificacion BGR a RGB, mean/std de ImageNet e interpolacion cubica |
| Geometria de preprocesado | Estirado directo a cuadrado (sweeps de lateralidad) y LetterBox con relleno de ceros centrado (variantes `surface3`, resolucion 320 en `v004`) |
| Clases | `left_palm`/`right_palm` (y referencia mono-clase `palm`); `palm`/`back`/`side` en variantes `surface3` |
| Tamano del repositorio | 0,4 GB |
| Hardware objetivo | Ascend 310B (descarga pensada para placa via `HF_ENDPOINT=https://hf-mirror.com`) |

## Arquitectura y entrenamiento

El repositorio contiene dos familias de detectores ancla-libres y ligeros: NanoDet y PicoDet. Ambas son arquitecturas de deteccion de una sola etapa disenadas para inferencia de baja latencia en dispositivos con recursos limitados, y aqui se distribuyen exclusivamente como grafos ONNX ya exportados, sin codigo de entrenamiento ni checkpoints en formato nativo. Las variantes se diferencian por el contrato de clases (lateralidad frente a superficie de la mano) y por la geometria de redimensionado: el estirado directo deforma la relacion de aspecto para llevar la imagen a un cuadrado, mientras que LetterBox conserva la relacion de aspecto con relleno de ceros centrado; las variantes `v004` fijan ademas la entrada en 320 pixeles.

El entrenamiento se realizo sobre cajas de mano generadas por el detector de MediaPipe aplicado a HaGRIDv2, no sobre las etiquetas oficiales de gestos de ese dataset. El autor advierte explicitamente de que no deben compararse las cifras de mAP entre variantes con estirado directo y variantes con LetterBox, porque el preprocesado difiere. No se documentan en la informacion disponible el numero de imagenes de entrenamiento, el numero de epochs, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos o destilacion.

## Capacidades

- Deteccion de manos en imagen: localizacion de una o varias manos con cajas delimitadoras.
- Clasificacion de lateralidad: variantes que distinguen `left_palm` y `right_palm`, con una referencia mono-clase `palm`.
- Clasificacion de superficie: variantes `surface3` que distinguen `palm`, `back` y `side`, utiles para descartar orientaciones no validas antes del reconocimiento de palma.
- Preprocesado configurable: dos contratos de entrada documentados (estirado directo y LetterBox), con resoluciones y normalizaciones especificas por familia.
- Despliegue en hardware Ascend: artefactos preparados para descarga por revision fija en placa mediante el endpoint espejo de Hugging Face.
- Verificacion de integridad: fichero `SHA256SUMS` con sumas de los 37 ONNX para validar la descarga.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un detector de objetos puro.

## Casos de uso

- Preprocesado de reconocimiento de palma: el detector recorta la region de la mano antes de pasarla al modelo de palmprint del mismo autor, reduciendo el area a procesar y evitando que el identificador biometrico trabaje sobre fondo irrelevante. Las variantes `surface3` permiten descartar manos de dorso o de canto.
- Control de acceso sin contacto en placa Ascend 310B: integrado en un dispositivo empotrado que captura imagen, detecta la palma y delega la identificacion en el modelo OM correspondiente, con todo el pipeline ejecutandose en el acelerador local.
- Filtrado previo en pipelines de video: al ser detectores ligeros, pueden ejecutarse por fotograma para decidir que frames contienen una mano valida antes de invocar etapas mas costosas.
- Seleccion de orientacion en interfaces gestuales: la distincion `palm`/`back`/`side` sirve para disparar acciones distintas segun la cara de la mano visible, sin necesidad de un clasificador adicional.
- Validacion de datasets de manos: usar el detector para generar o contrastar cajas sobre imagenes nuevas y comparar con las cajas de MediaPipe empleadas en el entrenamiento.
- Benchmark de despliegue en Ascend: comparar latencia y mAP entre NanoDet y PicoDet, y entre estirado directo y LetterBox, para elegir la variante que mejor encaja en el presupuesto de computo de la placa.
- Prototipado rapido en CPU/GPU con ONNX Runtime: aunque el destino sea Ascend, los ficheros ONNX pueden ejecutarse en un portatil para validar el pipeline antes de portar a la placa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite las cifras de validacion y de mAP sobre el conjunto de test congelado a un documento externo del caso (`samples/case4/docs/22-onnx-val-test-map-20261120.md`) que no forma parte de la informacion proporcionada, y advierte de que el repositorio solo contiene pesos, no predicciones por imagen. Tampoco se ofrecen datos de latencia o throughput en Ascend 310B.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de detectores ligeros en ONNX, el consumo de memoria es bajo, pero no se publica una cifra concreta.
- GPU recomendadas: no disponible. El destino declarado es el acelerador Ascend 310B, no GPU convencionales.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; los grafos ONNX son ejecutables en teoria con ONNX Runtime en CPU o GPU, pero no se documenta ni se garantiza.
- Opciones de despliegue: ONNX Runtime; en placa Ascend, el flujo previsto es la descarga por revision fija con `HF_ENDPOINT=https://hf-mirror.com` y la conversion o ejecucion en el runtime del acelerador (no se detalla la herramienta de conversion en la informacion disponible).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,4 GB, pero basta con descargar la variante concreta necesaria en lugar de los 37 ficheros.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zhouxzh/ascend310b-palm-detector` | NanoDet / PicoDet en ONNX | `left_palm`/`right_palm`; `palm`/`back`/`side` | BGR, estirado o LetterBox, hasta 320 | Apache-2.0 | Hugging Face, revision fija |
| Detector de mano de MediaPipe | Detector propietario de Google | Manos (puntos y caja) | RGB | Licencia de MediaPipe (no Apache-2.0) | SDK de MediaPipe |
| `zhouxzh/ascend310-palmprint` | Modelo de reconocimiento de palma en OM | Identidad biometrica | Recorte de palma | No disponible en la informacion | Hugging Face |
| `zhouxzh/ascend310b-coco-detector-benchmarks` | Detectores genericos COCO | 80 clases COCO | No disponible | No disponible en la informacion | Hugging Face |

La comparacion directa con detectores genericos no es homogenea: este repositorio esta especializado en manos y en el hardware Ascend 310B, mientras que MediaPipe cubre la deteccion de manos con otra licencia y otro formato de salida, y el repositorio de benchmarks COCO del mismo autor sirve como referencia de rendimiento de detectores genericos, no como sustituto funcional.

## Limitaciones y advertencias

- Dominio muy restringido: detecta manos y su orientacion; no es un modelo de lenguaje ni un detector de objetos general.
- Cajas derivadas de MediaPipe sobre HaGRIDv2: la calidad del detector esta acotada por la calidad de esas detecciones, no por anotaciones humanas oficiales del dataset.
- Advertencia explicita del autor: no mezclar cifras de mAP entre variantes con estirado directo y variantes con LetterBox, porque el preprocesado y la geometria difieren.
- Preprocesado critico: cada familia exige su normalizacion y su interpolacion concretas (BGR con mean/std especificos en NanoDet; conversion a RGB con mean/std de ImageNet e interpolacion cubica en PicoDet); un preprocesado incorrecto degrada la deteccion sin aviso.
- Sin datos publicados de precision en este repositorio: las cifras de validacion y test viven en un documento externo no incluido, por lo que no es posible verificar el rendimiento a partir de la informacion disponible.
- Sin cuantizacion documentada: no se indican variantes INT8 ni recetas de calibracion para el acelerador, lo que puede obligar a trabajo adicional de conversion.
- Revision fija obligatoria: el autor desaconseja usar `main` como referencia de publicacion; hay que fijar un commit y verificar `SHA256SUMS`.
- Dataset de origen con condiciones propias: antes de redistribuir imagenes o anotaciones derivadas de HaGRIDv2 debe revisarse la licencia de ese dataset, que es independiente de la Apache-2.0 de los pesos.
- Sin garantias de sesgo ni evaluacion demografica: no se documenta el equilibrio de tonos de piel, iluminacion o tipos de camara del conjunto de entrenamiento.
- Riesgo de falsos positivos y negativos no cuantificado en la informacion disponible, relevante si el detector alimenta un sistema biometrico de acceso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zhouxzh/ascend310b-palm-detector
- Modelo de reconocimiento de palma del mismo autor: https://huggingface.co/zhouxzh/ascend310-palmprint
- Benchmarks de detectores COCO del mismo autor: https://huggingface.co/zhouxzh/ascend310b-coco-detector-benchmarks
- Fichero de sumas de verificacion: `SHA256SUMS` en el propio repositorio
- Documento de validacion y mAP citado por el autor: `samples/case4/docs/22-onnx-val-test-map-20261120.md` (no incluido en el repositorio)
- Dataset HaGRIDv2: no se proporciona enlace en la informacion disponible
- Paper de NanoDet: no disponible en la informacion proporcionada
- Paper de PicoDet: no disponible en la informacion proporcionada
