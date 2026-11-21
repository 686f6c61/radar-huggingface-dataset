# thirdshift-inc/depth-anything-v2-small-film

## Resumen

Depth Anything V2 Small (film) es una conversión a Core ML del modelo de estimación de profundidad monocular Depth Anything V2 Small, publicada por thirdshift-inc. No se trata de un modelo nuevo ni de un reentrenamiento: es el checkpoint original `depth-anything/Depth-Anything-V2-Small-hf` (revisión `5426e4f0f36572d16453bbda7a8389317b1bef99`) convertido a formato Core ML en precisión float16 y con formas de entrada fijas, pensadas específicamente para fotogramas de cine (proporciones panorámicas como 518×392, 644×364 y 728×308).

El interés de esta publicación es de ingeniería de despliegue: el autor ha reexpresado las capas del transformer para que se ejecuten de forma eficiente en la Neural Engine de Apple (tokens como tensores B×C×1×S, capas lineales como convoluciones 1×1, atención procesada cabeza a cabeza con la escala plegada en los pesos de query), ha interpolado y almacenado el position embedding para cada rejilla de parches y ha integrado en el grafo la normalización ImageNet y la división por el valor máximo de salida. El resultado es un paquete listo para inferencia en dispositivos Apple sin necesidad de preprocesado externo.

El modelo resuelve la estimación de profundidad densa a partir de una única imagen RGB, una tarea relevante para pipelines de posproducción, rotoscopia, composición y generación de mapas de profundidad en vídeo. Al estar basado en Depth Anything V2, hereda la arquitectura DINOv2 con cabecera de decodificación de profundidad y las mejoras de la segunda versión en datos sintéticos y etiquetas pseudo-reales. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DINOv2 (ViT-Small) con cabecera de decodificación de profundidad, convertido a Core ML |
| Parametros totales | no disponible (el modelo base es la variante "Small" de Depth Anything V2; el número exacto no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | float16 (pesos en FP16 en los tres paquetes `.mlpackage`) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (float16); el checkpoint base está en safetensors en Hugging Face |
| Tamaño del repo | 0,1 GB |
| Resoluciones de entrada | 518×392, 644×364, 728×308 (ancho × alto) |
| Pipeline | depth-estimation |

## Arquitectura y entrenamiento

La arquitectura subyacente es Depth Anything V2, que combina un backbone DINOv2 (en esta variante, ViT-Small) con una cabecera de decodificación que produce un mapa de profundidad denso por píxel. El modelo original fue entrenado por Lihe Yang et al. (arXiv:2406.09414) con una estrategia que combina imágenes sintéticas con etiquetas precisas y datos reales con etiquetas pseudo-reales, lo que mejora la generalización respecto a la primera versión. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición detallada del dataset.

La conversión a Core ML no implica reentrenamiento ("Nothing was retrained", según la model card). Las modificaciones son puramente de despliegue: pesos en float16, position embedding interpolado una vez por cada rejilla de parches y almacenado, capas reexpresadas para la Neural Engine (tokens como B×C×1×S, lineales como convoluciones 1×1, atención cabeza a cabeza con la escala en los pesos de query) y normalización ImageNet más división por el máximo de salida integradas en el grafo. El resultado son tres paquetes de forma fija, cada uno optimizado para una relación de aspecto cinematográfica concreta.

## Capacidades

- Estimación de profundidad monocular densa a partir de una imagen RGB.
- Salida de mapa de profundidad por píxel con normalización y escalado integrados en el grafo.
- Tres resoluciones de entrada fijas orientadas a fotogramas de cine (518×392, 644×364, 728×308).
- Inferencia optimizada para la Neural Engine de Apple mediante Core ML.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión semántica, tool calling, agentes ni multilingüismo: es un modelo puramente de visión y tarea única.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Posproducción cinematográfica: generar mapas de profundidad por fotograma para composición, desenfoque de profundidad de campo sintético o relighting, aprovechando las tres resoluciones panorámicas predefinidas que encajan con formatos de cine.
- Rotoscopia y separación de capas: usar el mapa de profundidad para aislar sujetos y fondos en planos, reduciendo el trabajo manual en herramientas de composición.
- Efectos de profundidad de campo en vídeo: aplicar desenfoque selectivo dependiente de la distancia en bruto o en tiempo real sobre dispositivos Apple, gracias a la ejecución en Neural Engine.
- Previsualización en apps de edición para macOS/iOS: integrar el `.mlpackage` en una app nativa para ofrecer vista previa de profundidad sin conexión a servidores.
- Generación de datos auxiliares para pipelines de VFX: producir mapas de profundidad que alimenten herramientas de composición o motores de render como capas de referencia.
- Prototipado en investigación de visión por computador: usar la conversión Core ML como referencia de despliegue eficiente de Depth Anything V2 Small en hardware Apple, comparando latencia y precisión frente a la versión PyTorch.
- Automatización de catalogación de material audiovisual: extraer profundidad de fotogramas clave para indexación o análisis de escenas en flujos de trabajo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de profundidad (AbsRel, RMSE, δ1) ni comparativas de latencia o throughput para los paquetes Core ML.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en la Neural Engine y memoria unificada de dispositivos Apple. El tamaño del repo es de 0,1 GB, lo que da una idea del orden de magnitud de los pesos en FP16.
- GPU recomendadas: hardware Apple con Neural Engine (chips de la serie M y A recientes). No está pensado para GPU NVIDIA ni AMD.
- Cabe en hardware de consumo: sí, en equipos Apple con Neural Engine; no se especifican modelos mínimos en la información proporcionada.
- Opciones de despliegue: Core ML (`.mlpackage`) en macOS/iOS/iPadOS; el checkpoint base puede ejecutarse con PyTorch o transformers si se necesita la versión no convertida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| thirdshift-inc/depth-anything-v2-small-film | no disponible (variante Small) | 518×392, 644×364, 728×308 fijas | Core ML FP16 | Apache 2.0 | Conversión optimizada para Neural Engine, sin reentrenamiento |
| depth-anything/Depth-Anything-V2-Small-hf | no disponible (variante Small) | resolución variable | safetensors (PyTorch) | Apache 2.0 | Checkpoint base original, multiplataforma |
| Depth Anything V2 (otras variantes: Base, Large, Giant) | no disponibles en la información | resolución variable | safetensors | Apache 2.0 | Mayor capacidad a costa de más cómputo; no comparado aquí con métricas |
| Otros estimadores de profundidad monocular (p. ej. MiDaS) | no disponible | resolución variable | varios | varía | No se dispone de datos comparativos en la información proporcionada |

No se dispone de métricas de rendimiento comparativas en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de tarea única: solo estima profundidad; no genera texto, no razona y no soporta instrucciones.
- Formas de entrada fijas: cada paquete acepta únicamente su resolución (518×392, 644×364 o 728×308); otras resoluciones requieren redimensionado externo o una nueva conversión.
- Dependencia de hardware Apple: al ser Core ML, no se ejecuta en GPU NVIDIA ni en entornos sin Core ML.
- Sin datos de benchmarks: no hay métricas publicadas en la información disponible para validar la precisión tras la conversión frente al modelo original.
- Riesgo de artefactos en profundidad: como todo estimador monocular, puede fallar en escenas con transparencias, superficies reflectantes, texturas repetitivas o iluminación extrema; no se documentan sesgos específicos.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y la atribución al autor original y al conversor.
- Sin garantías de mantenimiento: el repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.
- Idiomas: no aplica, pero conviene señalar que no procesa texto ni metadatos lingüísticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thirdshift-inc/depth-anything-v2-small-film
- Checkpoint base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Repositorio oficial de Depth Anything V2: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
