# youqiangao/tversky-cross-calibration-checkpoints

## Resumen

Este repositorio contiene diez checkpoints de inferencia para segmentación de imágenes, publicados como material complementario al artículo *Cross-Calibration of Tversky Indices*. Los checkpoints corresponden a redes U-Net y FCN8 entrenadas sobre cinco conjuntos de datos públicos: Oxford-IIIT Pet, ISIC 2017, Kvasir-SEG, Pascal VOC 2012 y Cityscapes. Cada checkpoint proporciona una salida de probabilidades sobre la que se comparan los optimizadores de Dice y de IoU, con el objetivo de estudiar la equivalencia entre las decisiones basadas en cada métrica, no el rendimiento absoluto de segmentación.

El repositorio no contiene un modelo único, sino un conjunto de pesos preentrenados para experimentos de calibración de métricas. Es relevante para investigadores que trabajan con índices de similitud (Dice, IoU, Tversky) y necesitan reproducir o extender los experimentos del artículo. La licencia se indica como "other", por lo que el uso comercial debe consultarse con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net y FCN8 (dos arquitecturas distintas según dataset) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch, probablemente .pt o .bin (no confirmado en la ficha) |

## Arquitectura y entrenamiento

Los checkpoints corresponden a dos arquitecturas clásicas de segmentación: U-Net y FCN8. La model card no detalla la configuración exacta de cada red, ni el número de capas, filtros o el proceso de entrenamiento (épocas, optimizador, función de pérdida, etc.). El propósito no es presentar un modelo con mejor rendimiento de segmentación, sino proporcionar salidas de probabilidad sobre las que comparar el comportamiento de los optimizadores de Dice y de IoU. No se menciona el uso de RLHF, DPO ni técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Segmentación semántica de imágenes en cinco dominios distintos: mascotas (Oxford-IIIT Pet), lesiones cutáneas (ISIC 2017), pólipos endoscópicos (Kvasir-SEG), objetos genéricos (Pascal VOC 2012) y escenas urbanas (Cityscapes).
- Generación de mapas de probabilidad por píxel, que sirven como entrada para la comparación de métricas Dice e IoU.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.
- No soporta vision-language ni otros dominios fuera de la segmentación.

## Casos de uso

- **Investigación en métricas de segmentación**: los checkpoints permiten reproducir los experimentos de calibración cruzada entre los índices de Dice e IoU, analizando cómo cambian las decisiones de optimización según la métrica elegida.
- **Evaluación de funciones de pérdida**: se puede usar cada checkpoint para comparar el comportamiento de diferentes pérdidas basadas en Tversky, Dice o IoU sobre los mismos mapas de probabilidad.
- **Análisis de sensibilidad de hiperparámetros**: los pesos permiten estudiar cómo variaciones en los pesos de la pérdida (α, β) afectan a la segmentación final en distintos dominios.
- **Reproducibilidad de experimentos**: investigadores pueden descargar los checkpoints y reproducir los resultados del artículo, verificando las conclusiones sobre la equivalencia entre optimizadores de Dice y IoU.
- **Evaluación de arquitecturas de segmentación**: aunque no es el objetivo principal, los checkpoints de U-Net y FCN8 pueden servir como puntos de partida para evaluar la robustez de estas arquitecturas en los cinco datasets mencionados.
- **Docencia y formación**: como material didáctico para explicar la influencia de la función de pérdida en la segmentación y la diferencia entre métricas de superposición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el propósito es comparar la equivalencia de decisiones entre métricas, no reportar el rendimiento absoluto de segmentación. Por tanto, no hay tablas de mIoU, Dice ni otros indicadores.

## Requisitos de hardware

- El tamaño del repositorio es de 3,3 GB, lo que sugiere que cada checkpoint ocupa aproximadamente entre 0,3 y 0,5 GB (diez checkpoints en total). Esto implica que la inferencia puede realizarse en GPU con VRAM de 2 GB o más si se cargan de uno en uno.
- No se especifican requisitos mínimos de GPU. Dado que se trata de modelos de segmentación estándar (U-Net y FCN8), una GPU de gama media como una NVIDIA GTX 1080 o RTX 2060 sería suficiente para inferencia en FP32.
- Para inferencia en CPU, los tiempos serían mayores, pero posible para imágenes pequeñas.
- No hay soporte de vLLM, llama.cpp ni Ollama porque no es un modelo de lenguaje. El despliegue se haría con PyTorch estándar, cargando los pesos con `torch.load` o mediante el repositorio de código asociado.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de segmentación de última generación, sino un conjunto de checkpoints de experimentos. No existen modelos comparables en el mismo sentido, porque su propósito no es el rendimiento de segmentación sino el estudio de calibración de métricas. Se podría comparar con otros checkpoints de U-Net o FCN8 en los mismos datasets, pero no hay información pública de dichos checkpoints en este contexto.

## Limitaciones y advertencias

- Los checkpoints contienen solo los parámetros del modelo, no los pesos del optimizador ni el estado de entrenamiento; no son adecuados para continuar el entrenamiento.
- La licencia se indica como "other", por lo que el uso comercial o la redistribución requieren consultar al autor.
- El acceso a los datasets (Oxford-IIIT Pet, ISIC 2017, etc.) está sujeto a las licencias de cada proveedor.
- No se garantiza el rendimiento de segmentación de los modelos, ya que el objetivo del repositorio es la comparación de métricas, no la calidad de segmentación.
- Los modelos son específicos para imágenes de los dominios mencionados; su uso en otros dominios puede producir resultados no fiables.
- No se dispone de información sobre sesgos o alucinaciones (al ser visión, no hay alucinaciones de texto), pero la segmentación puede fallar en imágenes fuera de distribución.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/youqiangao/tversky-cross-calibration-checkpoints
- Código de reproducción en GitHub: https://github.com/youqiangao/tversky-cross-calibration
- README del repositorio de código: https://github.com/youqiangao/tversky-cross-calibration/blob/main/README.md
