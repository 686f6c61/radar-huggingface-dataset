# vinimuchulski/sky-segmentation-wolosky-net-model

## Resumen

El modelo `vinimuchulski/sky-segmentation-wolosky-net-model` es un modelo de segmentación binaria de cielo (sky segmentation) orientado a sistemas embebidos, desarrollado por el usuario vinimuchulski. Dado unha imagen RGB, devuelve una máscara por píxel que separa el cielo del resto de la escena, aplicando un umbral de 0,5 sobre la salida. El repositorio incluye tanto el modelo principal (WoloskyNet, referido como WNet, de estilo U2Net) entrenado en TensorFlow/Keras, como variantes DeepLabV3 con backbones MobileNetV2 y ResNet34 entrenadas en PyTorch.

La relevancia del proyecto radica en su enfoque de despliegue: los pesos se exportan a ONNX para inferencia en PC y el modelo WNet dispone además de versiones TFLite en FP32 e INT8, pensadas para ejecución en dispositivos con recursos limitados. El trabajo se asocia a una publicación en la 39ª conferencia SIBGRAPI 2026 titulada "Sky Segmentation with Deep Learning for Embedded Systems".

El entrenamiento se realizó sobre un dataset propio de 27.374 pares imagen/máscara a resolución 320×320, con máscaras binarias generadas mediante SAM3 usando el prompt `sky` y umbral de confianza 0,4. La información disponible no especifica el número de parámetros, la longitud de contexto (no aplica a un modelo de visión) ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WNet (WoloskyNet, estilo U2Net) en TensorFlow/Keras; variantes DeepLabV3 con backbone MobileNetV2 y ResNet34 en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen) |
| Tipos de cuantizacion | FP32 e INT8 (versiones TFLite del modelo WNet); ONNX en precisión de exportación |
| Idiomas soportados | no disponible (tarea de visión, no lingüística) |
| Licencia | no disponible |
| Formato de pesos | ONNX, TFLite (FP32/INT8) y Keras |
| Tarea | Segmentación binaria de cielo (pipeline: image-segmentation) |
| Resolución de entrenamiento | 320×320 |
| Umbral de decisión | 0,5 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo principal, WoloskyNet (WNet), sigue una arquitectura de tipo encoder-decoder con conexiones de salto, en la línea de U2Net, implementada en TensorFlow/Keras. El repositorio incluye además dos variantes DeepLabV3 (con MobileNetV2 y ResNet34 como backbones) entrenadas en PyTorch, lo que permite comparar enfoques ligeros y más pesados para la misma tarea. La salida es una máscara binaria por píxel obtenida tras aplicar un umbral de 0,5.

El entrenamiento utilizó el dataset Sky Segmentation WoloskyNet, compuesto por 27.374 pares imagen/máscara a 320×320. Las máscaras binarias (valores 0/255) se generaron automáticamente con SAM3 usando el prompt `sky` y un umbral de confianza de 0,4. El cuaderno de entrenamiento emplea una partición del 70% para entrenamiento, 15% para validación y 15% para test, con semilla 42. No se dispone de información sobre el número de tokens, composición detallada del dataset ni el uso de RLHF/DPO (no aplicable en esta tarea).

## Capacidades

- Segmentación binaria de cielo en imágenes RGB: genera una máscara por píxel que distingue cielo de no-cielo.
- Inferencia sobre imagen única mediante scripts ONNX incluidos en el repositorio.
- Exportación a múltiples formatos: ONNX para PC y TFLite (FP32 e INT8) para despliegue embebido.
- Dos familias de modelos disponibles: WNet/U2Net (TensorFlow/Keras) y DeepLabV3 MobileNetV2/ResNet34 (PyTorch).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la segmentación.

## Casos de uso

- Segmentación de cielo en drones y UAV: el modelo puede procesar fotogramas RGB a 320×320 y generar máscaras de cielo en tiempo real en hardware embebido, gracias a las versiones TFLite INT8 que reducen el coste computacional.
- Preprocesado para fotografía computacional: separar el cielo permite aplicar ajustes selectivos de exposición, balance de blancos o reemplazo de cielo en pipelines de edición automatizada.
- Realidad aumentada y filtros: la máscara de cielo se puede usar para superponer elementos gráficos (nubes sintéticas, efectos atmosféricos) en aplicaciones móviles mediante el modelo TFLite.
- Monitorización meteorológica de bajo coste: integrado en estaciones con cámara y Raspberry Pi u otro SBC, el modelo permite estimar la fracción de cielo despejado en imágenes periódicas.
- Automoción y sistemas de asistencia: detección de la línea de horizonte y región de cielo como entrada auxiliar para algoritmos de percepción en vehículos, aprovechando la inferencia ONNX.
- Investigación en segmentación semántica: las tres variantes (WNet, DeepLabV3-MobileNetV2, DeepLabV3-ResNet34) permiten comparar arquitecturas ligeras frente a más pesadas sobre un mismo dataset de referencia.
- Generación de datasets sintéticos: la máscara de cielo facilita el recorte y la composición de imágenes para aumento de datos en otros proyectos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,2 GB) y la resolución de entrada (320×320), el modelo WNet es ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican en la documentación; para el modelo WNet y las variantes DeepLabV3 ligeras, cualquier GPU moderna (RTX 3060 o superior) es suficiente. El modelo está diseñado para ejecutarse también en CPU y en hardware embebido.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM; las versiones TFLite INT8 están pensadas para dispositivos aún más limitados.
- Opciones de despliegue: ONNX Runtime (scripts de inferencia incluidos), TensorFlow Lite (FP32 e INT8) para embebidos, y Keras para el modelo original. No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Formatos | Licencia | Enfoque |
|---|---|---|---|---|---|
| WoloskyNet (este repo) | WNet estilo U2Net | 320×320 | ONNX, TFLite FP32/INT8, Keras | no disponible | Segmentación de cielo para embebidos |
| DeepLabV3 MobileNetV2 (este repo) | DeepLabV3 + MobileNetV2 | no disponible | ONNX | no disponible | Variante ligera incluida en el mismo proyecto |
| DeepLabV3 ResNet34 (este repo) | DeepLabV3 + ResNet34 | no disponible | ONNX | no disponible | Variante más pesada incluida en el mismo proyecto |

No se dispone de información sobre modelos externos comparables (por ejemplo, segmentadores de cielo de otros autores) en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- El modelo está entrenado exclusivamente para segmentación binaria de cielo; no realiza otras tareas de segmentación semántica.
- Las máscaras de entrenamiento se generaron automáticamente con SAM3 (prompt `sky`, umbral 0,4), lo que puede introducir ruido o sesgos en los datos y afectar a la precisión en escenas atípicas.
- La resolución de entrenamiento es 320×320; el rendimiento en imágenes de mayor resolución dependerá del reescalado aplicado.
- No se han publicado métricas de rendimiento (IoU, precisión, recall) en la información disponible, lo que dificulta evaluar su calidad objetiva.
- El runtime embebido no está incluido en el repositorio; solo se proporcionan los pesos y scripts de inferencia para PC.
- El acceso al dataset puede requerir autorización mientras permanezca privado.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí puede producir máscaras erróneas en condiciones de iluminación adversas, cielos nocturnos o escenas con objetos de color similar al cielo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinimuchulski/sky-segmentation-wolosky-net-model
- Dataset: https://huggingface.co/datasets/vinimuchulski/sky-segmentation-wolosky-net
- Repositorio GitHub: https://github.com/vini-muchulski/Sky-Segmentation-with-Deep-Learning-for-Embedded-Systems-WoloSky-Net
- README del repositorio: https://github.com/vini-muchulski/Sky-Segmentation-with-Deep-Learning-for-Embedded-Systems-WoloSky-Net/blob/main/README.md
- Paper (SIBGRAPI 2026): http://sibgrapi.sid.inpe.br/col/sid.inpe.br/sibgrapi/2026/08.27.13.20/doc/thisInformationItemHomePage.html
- PDF del paper: http://sibgrapi.sid.inpe.br:80/col/sid.inpe.br/sibgrapi/2026/08.27.13.20/doc/SIBGRAPI2026___WNet__CR_.pdf
