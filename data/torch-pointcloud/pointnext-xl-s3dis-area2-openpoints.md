# torch-pointcloud/pointnext-xl.s3dis-area2.openpoints

## Resumen

pointnext-xl.s3dis-area2.openpoints es un checkpoint de segmentación semántica de nubes de puntos 3D desarrollado por torch-pointcloud (Arthur Dujardin) a partir del código oficial de PointNeXt de Guocheng Qian y colaboradores. Se distribuye en HuggingFace con licencia MIT, pesos en safetensors y 41,7 millones de parámetros. No es un modelo de lenguaje: su entrada son coordenadas y atributos de puntos 3D, y su salida es una etiqueta semántica por punto.

La arquitectura es una PointNeXt-XL, una revisión escalada de PointNet++ con bloques MLP de residuo invertido, encoder jerárquico y decoder de propagación de features. El modelo tiene 4 canales de entrada, 64 features internas y 13 clases de interior, y está entrenado únicamente en el área 2 del dataset S3DIS. Es relevante para tareas de comprensión de escenas interiores porque ofrece un modelo compacto, con API sencilla en PyTorch y pesos abiertos para fine-tuning o extracción de características.

La principal cautela es que las métricas declaradas, mIoU 63,16 y OA 85,55, corresponden a una sola área de S3DIS y no están verificadas. No son comparables con los resultados habituales sobre el área 5 o con validación cruzada de 6 folds. Tampoco hay datos publicados de latencia, cuantizaciones oficiales ni validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointNeXt-XL: PointNet++ escalado con bloques MLP de residuo invertido, encoder jerárquico y decoder de propagación de features |
| Parámetros totales | 41.705.677 (41,6 M) |
| Longitud de contexto | No aplica; el modelo consume nubes de puntos y no se documenta un número máximo de puntos |
| Tipos de cuantización | No disponible; solo se publican pesos safetensors, sin versiones GGUF, ONNX o cuantizadas documentadas |
| Idiomas soportados | No aplica; modelo 3D sin entrada ni salida lingüística |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Segmentación semántica de nubes de puntos (point-cloud-segmentation) |
| Clases | 13 clases de interior de S3DIS |
| Canales de entrada | 4 |
| Dimensión de features | 64 |
| Dataset de entrenamiento | S3DIS, Area 2 |
| Pipeline de HuggingFace | No disponible |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

PointNeXt revisa PointNet++ manteniendo su estructura jerárquica de set abstraction y feature propagation, pero sustituye los bloques originales por MLP con conexiones residuales invertidas y aplica estrategias de entrenamiento y escalado mejoradas. La variante XL escala el modelo hasta 41,6 millones de parámetros, con 4 canales de entrada, 64 features y una cabeza de clasificación por punto para 13 clases. El checkpoint se ha convertido desde el repositorio oficial guochengqian/PointNeXt y se integra en la librería torch-pointcloud.

El entrenamiento se ha realizado únicamente sobre el área 2 de S3DIS, un dataset de nubes de puntos de interiores con anotaciones semánticas por punto. La información disponible no especifica el número de puntos de entrenamiento, el número de épocas, la composición exacta del dataset ni las técnicas de aumento aplicadas. Tampoco hay RLHF, DPO ni etapas de alineación, porque no es un modelo generativo. La model card únicamente documenta el área de entrenamiento y los resultados agregados de mIoU y OA.

## Capacidades

- Segmentación semántica por punto en 13 clases de interior: techo, suelo, pared, viga, columna, ventana, puerta, mesa, silla, sofá, estantería, pizarra y clutter.
- Procesamiento de nubes de puntos con posiciones, color y normales; el ejemplo de la model card usa las claves `pos`, `color` y `norm_pos`, con 4 canales efectivos de entrada.
- Extracción de features de 64 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`, útil para transferencia a tareas posteriores.
- Inferencia por lotes mediante la función `collate` de torch-pointcloud.
- Fine-tuning con `reset_classifier` para adaptar el número de clases a un dominio propio.
- Ejecución en CPU y GPU dentro de PyTorch.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-step, visión 2D, audio ni capacidades multilingües.

## Casos de uso

- **Scan-to-BIM y modelado de interiores**: el modelo etiqueta puntos de escaneos indoor y permite separar suelo, paredes, columnas y mobiliario antes de ajustar geometría BIM. Es adecuado porque sus 13 clases coinciden con elementos habituales de edificios.
- **Pre-anotación de datasets 3D**: se ejecuta la inferencia para generar etiquetas iniciales y un equipo humano corrige los errores. Reduce el coste de anotación y las features de 64 dimensiones permiten seleccionar muestras para aprendizaje activo.
- **Robótica móvil en interiores**: integrado en un pipeline de percepción, permite construir mapas semánticos y distinguir suelo transitable, mobiliario y elementos estructurales. Requiere validar el dominio con el sensor y la escena concretos.
- **Gemelos digitales y facility management**: inventario de mobiliario, análisis de uso del espacio y localización de elementos en plantas de oficina u hospitales a partir de escaneos periódicos.
- **Realidad aumentada y virtual**: comprensión de escena para oclusión, colisiones y manipulación de objetos virtuales sobre espacios reales escaneados.
- **Monitorización de obra y comparación as-built vs. BIM**: clasificación de elementos constructivos en escaneos de interior para detectar desviaciones respecto al modelo de diseño, con la limitación de que solo cubre clases de interior.
- **Investigación en representación 3D**: uso como baseline de PointNeXt o como extractor de features congelado para clasificación, detección o segmentación de instancias en etapas posteriores.

## Benchmarks y rendimiento

| Dataset | Tarea | Métrica | Valor | Verificado |
|---|---|---|---|---|
| S3DIS (Area 2) | Segmentación semántica de nubes de puntos | mIo
