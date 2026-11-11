# torch-pointcloud/groupfree3d-l6-o256.sunrgbd.ze-liu

## Resumen

Group-Free 3D (variante L6, 256 candidatos) es un detector de objetos 3D para nubes de puntos, publicado originalmente por Ze Liu, Zheng Zhang, Yue Cao, Han Hu y Xin Tong en ICCV 2021. El modelo que nos ocupa es una conversión de los pesos oficiales al ecosistema `torch-pointcloud`, empaquetada en formato safetensors y publicada por el usuario `torch-pointcloud` bajo licencia MIT. Resuelve la detección de objetos 3D en escenas interiores a partir de nubes de puntos, prediciendo cajas 3D con orientación y clase sobre 10 categorías del dataset SUN RGB-D.

La arquitectura es un transformer que opera directamente sobre un conjunto de candidatos de objetos muestreados, sin depender de propuestas de regiones ni de agrupamientos geométricos explícitos. Con 14,4 millones de parámetros y 288 canales de características, es un modelo ligero pensado para investigación y prototipado, no para despliegue en producción a gran escala.

Su relevancia actual es doble: por un lado, permite reproducir los resultados del paper original sin tener que recompilar el código de referencia; por otro, al estar integrado en `torch-pointcloud` con `create_model` y `forward_features`, se puede usar como extractor de características 3D o como bloque de detección dentro de pipelines de PyTorch modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre candidatos de objetos (Group-Free 3D) |
| Parametros totales | 14.384.672 (14,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (nube de puntos, 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision 3D, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de caracteristicas | 288 |
| Clases | 10 (SUN RGB-D) |
| Numero de capas del decoder | 6 (variante L6) |
| Candidatos de objeto | 256 (variante O256) |
| Dataset de entrenamiento | SUN RGB-D |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Group-Free 3D es un detector basado en transformer que recibe una nube de puntos y un conjunto de candidatos de objetos muestreados (256 en esta variante) y refina iterativamente sus representaciones mediante un decoder de 6 capas. A diferencia de aproximaciones anteriores como VoteNet o H3DNet, no agrupa puntos ni genera propuestas intermedias: cada candidato se trata como un token y el mecanismo de atención aprende a agregar la información relevante de la nube para predecir la caja 3D final. El backbone produce características de 288 canales que alimentan el decoder.

El entrenamiento se realizó sobre SUN RGB-D, un benchmark de comprensión de escenas interiores RGB-D con 10 categorías de objetos. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio). Un detalle técnico importante: las puntuaciones reportadas siguen el protocolo de los autores, que dimensiona cada caja de ground truth según la extensión alineada a ejes de la caja orientada y conserva su heading. Por tanto, los mAP no son directamente comparables con detectores evaluados contra cajas orientadas.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores, con caja 3D (centro, dimensiones, orientación) y clase.
- Clasificación sobre 10 categorías de SUN RGB-D (silla, mesa, cama, sofá, etc., según el protocolo del dataset).
- Extracción de características 3D de 288 canales mediante `forward_features`, reutilizable para tareas downstream (segmentación, retrieval, clustering).
- Procesamiento de nubes de puntos con coordenadas y color (el ejemplo de uso acepta `pos` y `color`).
- Integración con PyTorch mediante `torch-pointcloud`, con pipeline de transformación y `collate` incluidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o visión 2D.
- No es multilingüe: no procesa lenguaje natural.

## Casos de uso

- Detección de mobiliario en escenas interiores: el modelo recibe una nube de puntos de una habitación (por ejemplo, capturada con un sensor RGB-D) y devuelve cajas 3D con clase para sillas, mesas, camas y el resto de categorías de SUN RGB-D. Es adecuado porque está entrenado específicamente en ese dominio y con ese protocolo de evaluación.
- Prototipado de robótica de manipulación: para que un brazo robótico localice objetos sobre una mesa, se puede usar la salida de cajas 3D como entrada al módulo de planificación de agarre. Los 14,4 M de parámetros permiten ejecutarlo en la CPU o en una GPU modesta junto al resto del stack.
- Extracción de características para modelos downstream: `forward_features` devuelve un vector de 288 canales por candidato, útil para entrenar clasificadores de escena, sistemas de búsqueda de objetos 3D o módulos de segmentación que necesiten un embedding geométrico preentrenado.
- Evaluación comparativa de detectores 3D: al ser una conversión fiel de los pesos oficiales, sirve como baseline reproducible para comparar nuevos métodos contra Group-Free 3D sin reinstalar el repositorio original.
- Análisis de inventario en entornos controlados: conteo y localización de objetos en almacenes o habitaciones monitorizadas, siempre que las categorías de interés estén entre las 10 de SUN RGB-D.
- Docencia e investigación en visión 3D: el modelo es lo bastante pequeño (0,1 GB, 14,4 M de parámetros) para ejecutarse en portátiles y permite ilustrar el funcionamiento de un detector transformer sobre nubes de puntos con código mínimo.
- Generación de datasets sintéticos anotados: usar las predicciones del modelo para preanotar nubes de puntos nuevas y acelerar el etiquetado manual de cajas 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| SUN RGB-D | mAP@0.25 | 64,1 |
| SUN RGB-D | mAP@0.5 | 45,65 |

Advertencia del autor: las puntuaciones siguen el protocolo de SUN RGB-D de los autores originales, que dimensiona cada caja de ground truth según la extensión alineada a ejes de la caja orientada y conserva su heading. No son comparables con detectores evaluados contra las cajas orientadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos (14,4 M de parámetros ≈ 58 MB), más el espacio de activaciones de la nube de puntos (8192 puntos en el ejemplo). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las de gama baja.
- Opciones de despliegue: la librería `torch-pointcloud` es la vía oficial (`pip install torch-pointcloud`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP@0.25 | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Group-Free 3D L6 O256 (este) | 14,4 M | SUN RGB-D | 64,1 | 45,65 | MIT | Hugging Face (torch-pointcloud) |
| Group-Free 3D original (zeliu98) | no disponible en la informacion | SUN RGB-D | no disponible en la informacion | no disponible en la informacion | MIT | GitHub |
| VoteNet | no disponible en la informacion | SUN RGB-D | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Repositorio original |
| H3DNet | no disponible en la informacion | SUN RGB-D | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Repositorio original |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación numérica queda limitada a este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó únicamente en SUN RGB-D, un dataset de escenas interiores con 10 categorías; su rendimiento fuera de ese dominio (exteriores, industria, objetos no representados) no está garantizado.
- Riesgo de alucinación: como todo detector, puede generar cajas falsas positivas en regiones con geometría ambigua o ruido en la nube de puntos.
- Limitaciones de contexto o idioma: no procesa lenguaje natural; la nube de puntos de entrada debe seguir el formato esperado por `torch-pointcloud` (coordenadas y color).
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución. No obstante, conviene revisar las licencias del dataset SUN RGB-D y del código original de Group-Free 3D para usos derivados.
- Los mAP reportados no son comparables con los de detectores evaluados contra cajas orientadas; el propio autor lo advierte en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una conversión reciente sin validación comunitaria amplia.
- No se documentan cuantizaciones ni optimizaciones de despliegue; para producción a gran escala habría que evaluar exportación a ONNX o TensorRT por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/groupfree3d-l6-o256.sunrgbd.ze-liu
- Paper: https://arxiv.org/abs/2104.00678
- Repositorio original de Group-Free 3D: https://github.com/zeliu98/Group-Free-3D
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset SUN RGB-D (paper): https://arxiv.org/abs/1502.04356 (referencia habitual del benchmark; no incluida en la model card)
