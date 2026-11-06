# torch-pointcloud/groupfree3d-w2x-l12-o256.scannet.ze-liu

## Resumen

Group-Free 3D es un detector de objetos 3D para nubes de puntos desarrollado originalmente por Ze Liu, Zheng Zhang, Yue Cao, Han Hu y Xin Tong (Microsoft Research Asia) y publicado en ICCV 2021. Este checkpoint concreto es una conversión de los pesos originales al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin, y se distribuye bajo licencia MIT. El modelo resuelve la detección de objetos 3D en escenas interiores, prediciendo cajas 3D y clases para 18 categorías de objetos sobre la nube de puntos completa, sin depender de propuestas geométricas ni de agrupamiento heurístico.

La innovación principal frente a aproximaciones previas como VoteNet es que Group-Free 3D prescinde por completo del agrupamiento de puntos (clustering) para generar candidatos: en su lugar, un decoder transformer con auto-atención sobre un conjunto de semillas aprendidas refina iterativamente las cajas y sus características. Esto elimina la dependencia de hiperparámetros de clustering y de la calidad del muestreo de centroides.

El checkpoint tiene 29,6 millones de parámetros, 288 canales de características y está entrenado sobre ScanNet. Es un modelo compacto y especializado, pensado para integrarse en pipelines de percepción 3D con PyTorch, no para tareas de lenguaje o multimodalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer detector sobre candidatos de objeto muestreados (Group-Free 3D) |
| Parametros totales | 29.597.377 (29,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos, típicamente 8192 puntos por muestra en el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Group-Free 3D: un backbone de extracción de características sobre la nube de puntos (con 288 canales de salida) seguido de un decoder transformer que toma un conjunto de K semillas de objeto y, mediante capas de auto-atención, hace que cada semilla "observe" el resto de candidatos y agregue información global de la escena. Cada semilla se refina iterativamente para producir una caja 3D, una puntuación de confianza y una etiqueta de clase. El nombre del checkpoint (`w2x-l12-o256`) codifica la configuración: 2 bloques o capas de decoder ampliadas (`w2x`), 12 capas (`l12`) y 256 semillas de objeto (`o256`).

El entrenamiento se realizó sobre ScanNet, el dataset de reconstrucciones 3D de interiores con anotaciones densas (Dai et al., CVPR 2017), cubriendo 18 clases de objetos. La model card no detalla el número de tokens, la composición exacta del dataset ni si se emplearon etapas de RLHF/DPO (no aplicable en este dominio). La conversión a `torch-pointcloud` proviene del repositorio oficial `zeliu98/Group-Free-3D` (MIT) y expone tanto la inferencia completa (`model(...)`) como la extracción de características (`forward_features`, 288 canales).

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores: predicción de cajas 3D (centro, dimensiones, orientación) y clase para 18 categorías de ScanNet.
- Procesamiento de nubes de puntos con posición (xyz), color y normales como entradas (según el ejemplo de uso de la model card).
- Extracción de características por punto de 288 canales mediante `forward_features`, reutilizable para tareas aguas abajo (segmentación, clasificación, etc.).
- Inferencia por lotes mediante `collate` de `torch-pointcloud`, con soporte de índice de batch (`data["batch"]`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- **Robótica de manipulación en interiores**: el modelo detecta cajas 3D de objetos sobre la nube de puntos captada por una cámara RGB-D, proporcionando posiciones y orientaciones que un planificador de agarre puede usar directamente. Su tamaño compacto (29,6 M) permite ejecutarlo en el bucle de percepción de un robot.
- **Digitalización y modelado de interiores**: a partir de un escaneo de una habitación, el detector identifica sillas, mesas, camas, etc., con cajas 3D, lo que acelera la anotación semiautomática y la reconstrucción semántica de planos o gemelos digitales.
- **Realidad aumentada y mixta**: inserción de objetos virtuales con oclusión correcta requiere conocer la geometría y posición de los objetos reales; las cajas 3D del modelo permiten anclar contenido virtual de forma coherente en escenas interiores.
- **Inventario automático de espacios**: conteo y localización de mobiliario en oficinas, almacenes o viviendas a partir de escaneos 3D, útil para tasación, facility management o logística de interiores.
- **Preprocesado para pipelines de navegación**: un agente móvil indoor puede usar las detecciones para construir un mapa de obstáculos y objetos de interés con semántica, complementando SLAM geométrico.
- **Investigación en visión 3D**: como baseline reproducible (pesos convertidos, licencia MIT, integración con `torch-pointcloud`), sirve para comparar nuevas arquitecturas de detección 3D sobre ScanNet sin reentrenar desde cero.
- **Anotación asistida de datasets propios**: ejecutar el modelo sobre escaneos nuevos y revisar las predicciones como preanotaciones reduce el coste de etiquetado manual de cajas 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre el dataset ScanNet para la tarea de detección de objetos 3D:

| Metrica | Valor |
|---|---|
| mAP@0.25 | 68,59 |
| mAP@0.5 | 51,92 |

No se han publicado en la información disponible otros benchmarks (por ejemplo, por clase o comparativas con VoteNet u otros detectores) más allá de estos dos valores agregados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 29,6 M de parámetros en fp32, los pesos ocupan aproximadamente 118 MB; el consumo real vendrá dominado por las activaciones de la nube de puntos (típicamente 8192 puntos por muestra según el ejemplo) y el tamaño de batch. En la práctica es un modelo muy ligero.
- **GPU recomendadas**: cualquier GPU con suficiente memoria para el batch de nubes de puntos; cabe holgadamente en GPUs de consumo. Una RTX 3060/4060 o superior es más que suficiente para inferencia; A100/H100 no son necesarias salvo para lotes muy grandes.
- **¿Cabe en GPU de consumo?**: sí, con margen amplio, dado el reducido número de parámetros y el tamaño del repo (0,1 GB).
- **Opciones de despliegue**: la vía documentada es `torch-pointcloud` con PyTorch (`pip install torch-pointcloud`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este dominio).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros detectores 3D comparables (parámetros, contexto, rendimiento, licencia) para construir una tabla fiable. Se indica por tanto: no disponible.

## Limitaciones y advertencias

- **Dominio restringido**: entrenado exclusivamente sobre ScanNet (escenas interiores); el rendimiento fuera de ese dominio (exteriores, objetos a gran escala, escenas sintéticas distintas) no está garantizado ni documentado.
- **Clases limitadas**: solo 18 categorías de objetos de ScanNet; no detecta clases fuera de ese conjunto.
- **Riesgo de alucinación**: como todo detector, puede producir cajas falsas positivas o mal localizadas, especialmente en oclusiones severas o con pocos puntos por objeto; los umbrales de confianza deben calibrarse en producción.
- **Sesgos**: los sesgos del dataset ScanNet (entornos interiores típicamente domésticos/ofimáticos, geografía y condiciones de captura concretas) se trasladan al modelo.
- **Métricas no verificadas**: los valores de mAP de la model card están marcados como `verified: false`; conviene reproducirlos antes de usarlos como referencia.
- **Licencia**: MIT, lo que permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales (Liu et al., ICCV 2021) y al conversor (`torch-pointcloud`, Arthur Dujardin).
- **Dependencia de la librería**: el formato de pesos está ligado a `torch-pointcloud`; la API de carga (`tp.create_model`, `info["transform"]`, `collate`) puede cambiar entre versiones.
- **Sin soporte de lenguaje ni multimodalidad**: no debe emplearse para tareas de texto, VQA o agentes conversacionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/torch-pointcloud/groupfree3d-w2x-l12-o256.scannet.ze-liu)
- [Paper: Group-Free 3D Object Detection via Transformers (arXiv:2104.00678)](https://arxiv.org/abs/2104.00678)
- [Repositorio original: zeliu98/Group-Free-3D](https://github.com/zeliu98/Group-Free-3D)
- [Librería torch-pointcloud](https://github.com/arthurdjn/pytorch-pointcloud)
- [Paper de ScanNet (Dai et al., CVPR 2017)](https://arxiv.org/abs/1702.04405)
