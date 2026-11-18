# ysdede/nml-da3-169

## Resumen

`ysdede/nml-da3-169` es una exportación a ONNX de **Depth Anything 3, variante metric large (DA3METRIC-LARGE)**, un modelo de estimación de profundidad monocular y multi-vista desarrollado por ByteDance Seed (Haotong Lin, Sili Chen, Jun Hao Liew, Donny Y. Chen, Zhenyu Li, Guang Shi, Jiashi Feng y Bingyi Kang) y publicado en 2025 bajo el artículo "Depth Anything 3: Recovering the Visual Space from Any Views". El modelo original resuelve la reconstrucción de espacio visual a partir de una o varias vistas, y esta variante "metric" produce profundidad métrica (escala absoluta en lugar de relativa).

El repositorio no contiene pesos nuevos ni un fine-tuning: es el checkpoint oficial `depth-anything/DA3METRIC-LARGE` convertido a ONNX (opset 17) con la entrada fijada a un tensor de 1x1x3x378x672 (perfil 16:9, 48x27 parches) y seis salidas: cuatro mapas de características intermedias (`tap.4`, `tap.11`, `tap.17`, `tap.23`), `raw_depth` y `sky`. La exportación fue verificada contra el modelo PyTorch con tolerancias atol y rtol de 0,002.

Su relevancia es de integración: está empaquetado para el proyecto libnml (módulos Nodos), que instala los ficheros desde este repositorio y verifica cada byte contra un catálogo con SHA-256. Para quien necesite el modelo original en PyTorch o con entradas dinámicas, el checkpoint upstream es la referencia; este repo es un artefacto de despliegue ONNX de entrada fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de profundidad de Depth Anything 3, DA3METRIC-LARGE; detalles de backbone no incluidos en la información) |
| Parametros totales | no disponible (tamaño del fichero ONNX: 1.336.938.771 bytes) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija 1x1x3x378x672) |
| Tipos de cuantizacion | no disponible (solo se distribuye ONNX en precisión original del export) |
| Idiomas soportados | no disponibles (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), fichero `model.onnx`; el checkpoint original upstream es `model.safetensors` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (tipo de backbone, número de capas, mecanismo de atención ni diseño multi-vista). Lo que sí se documenta es que el modelo procede del checkpoint oficial DA3METRIC-LARGE de ByteDance Seed y que la exportación conserva los pesos sin cambios (SHA-256 del `model.safetensors` upstream: `bbea5b0b3ee389849cffa7ddae89de064a90abd2b055fc5aa99aac68db324776`). El grafo ONNX expone explícitamente cuatro puntos de extracción de características (`tap.4`, `tap.11`, `tap.17`, `tap.23`), lo que sugiere una red con al menos 24 etapas o bloques indexados y una cabeza de predicción de profundidad más una salida auxiliar de cielo (`sky`).

No se aportan datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones de decodificación. La única modificación respecto al original es la exportación a ONNX con entrada fija de 1x1x3x378x672 (48x27 parches, perfil 16:9) y la verificación numérica frente a PyTorch con atol/rtol de 0,002. El fichero `provenance.json` registra los hashes del checkpoint, la configuración y el commit fuente.

## Capacidades

- Estimación de profundidad métrica a partir de una imagen de entrada (resolución fija 378x672, relación 16:9).
- Salida de profundidad bruta (`raw_depth`) y mapa de cielo (`sky`), útil para separar cielo de geometría en escenas exteriores.
- Exposición de cuatro mapas de características intermedias (`tap.4`, `tap.11`, `tap.17`, `tap.23`) para reutilización en pipelines posteriores (por ejemplo, fusión con otros módulos o extracción de descriptores).
- Procesamiento multi-vista según el modelo original de Depth Anything 3, aunque la exportación ONNX fija una única entrada de imagen.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, audio ni multilingüismo: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D en interiores y exteriores: usar `raw_depth` como mapa de profundidad métrica para generar nubes de puntos o mallas en pipelines de fotogrametría, aprovechando que la escala es absoluta y no relativa.
- Segmentación cielo/geometría en conducción autónoma o drones: la salida `sky` permite separar regiones no transitables del horizonte y filtrar falsos positivos en la planificación de trayectorias.
- Realidad aumentada y efectos: inserción de objetos virtuales con oclusión correcta usando el mapa de profundidad métrica para alinear la escala del mundo real con la escena capturada.
- Robótica móvil y navegación: estimación de distancias a obstáculos a partir de una sola cámara RGB, con la ventaja de que la profundidad es métrica y se puede usar directamente en planificadores que trabajan en metros.
- Preprocesado para modelos generativos condicionados por profundidad (ControlNet, difusión 3D): generar mapas de profundidad consistentes en escala para condicionar la generación de imágenes o vídeo.
- Extracción de características para tareas downstream: los cuatro taps intermedios permiten alimentar cabezas personalizadas (detección, segmentación, odometría visual) sin reentrenar el backbone.
- Despliegue en entornos con ONNX Runtime: al ser un grafo ONNX de entrada fija, encaja en servicios de inferencia ligeros o en dispositivos con aceleración ONNX (CPU, GPU, NPU) sin dependencia de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX ocupa 1,34 GB; en FP32 se necesita aproximadamente esa cantidad más el espacio de activaciones (no cuantificado en la información). En FP16 podría reducirse a la mitad, pero no se distribuye una variante FP16.
- GPU recomendadas: no disponibles en la información. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder cargar el grafo en FP32, aunque no se confirma.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 4-8 GB (GTX 1650, RTX 3050, RTX 4060), pero no hay datos oficiales de consumo.
- Opciones de despliegue: ONNX Runtime (formato nativo), integración con el proyecto libnml (módulo Nodos con verificación SHA-256), y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `ysdede/nml-da3-169` (este) | no disponible | imagen fija 378x672 | Apache-2.0 | ONNX opset 17 | Export de DA3METRIC-LARGE para libnml |
| `depth-anything/DA3METRIC-LARGE` (upstream) | no disponible | no disponible | Apache-2.0 | safetensors | Checkpoint oficial PyTorch, entradas flexibles |
| Depth Anything V2 (variantes) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |
| MiDaS / DPT | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

No se dispone de datos de rendimiento comparado en la información proporcionada; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrada fija: el grafo ONNX solo acepta tensores de 1x1x3x378x672; no admite imágenes de otras resoluciones ni lotes mayores sin reexportar.
- Modelo de visión: no procesa texto, no soporta tool calling ni agentes; no debe evaluarse como LLM.
- Sin datos de sesgo ni de robustez: la model card no documenta sesgos conocidos, comportamiento en dominios fuera de distribución ni tasas de error.
- Riesgo de alucinación geométrica: como todo modelo de profundidad, puede producir geometría plausible pero incorrecta en superficies reflectantes, transparentes, texturas repetitivas o escenas nocturnas; no hay métricas publicadas en esta ficha.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y el fichero LICENSE incluido; el modelo upstream también es Apache-2.0.
- Dependencia del ecosistema libnml: la instalación vía módulo Nodos verifica cada byte contra un catálogo; modificar los ficheros rompe esa verificación.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documenta soporte del autor.
- Idiomas: al ser un modelo visual, la fila de idiomas no aplica, pero no se documenta el rendimiento en distintos tipos de escena o geografías.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ysdede/nml-da3-169
- Checkpoint upstream: https://huggingface.co/depth-anything/DA3METRIC-LARGE
- Repositorio GitHub de Depth Anything 3: https://github.com/ByteDance-Seed/Depth-Anything-3
- Artículo "Depth Anything 3: Recovering the Visual Space from Any Views" (2025): no se proporciona URL directa en la información disponible.
