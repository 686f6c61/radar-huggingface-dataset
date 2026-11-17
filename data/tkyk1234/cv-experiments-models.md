# tkyk1234/cv-experiments-models

## Resumen

`cv-experiments-models` es un repositorio de modelos ONNX orientados a segmentación de instancias, publicado por el usuario tkyk1234 bajo licencia Apache 2.0. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de pesos entrenados dentro del repositorio `cv-experiments` y exportados específicamente para su demo en GitHub Pages mediante ONNX Runtime Web, con soporte para WebGPU y WASM. El repositorio ocupa aproximadamente 0,1 GB y contiene dos variantes de segmentación de instancias con backbone ResNet-50 y entrada de 512 x 512 píxeles.

El modelo está entrenado sobre un subconjunto reducido de COCO: 2.000 imágenes de entrenamiento y 8 clases (person, bicycle, car, cat, dog, bottle, chair, tv). Las dos variantes incluidas son un modelo de estilo GTR con encoder híbrido y un modelo de estilo YOLO26-seg con cabeza one-to-one sin NMS. Ambos se exportaron con cuantización weight-only INT8 manteniendo el cómputo en fp32, una decisión habitual para reducir el tamaño de los pesos en despliegues web sin recurrir a kernels INT8 completos.

Su relevancia es acotada y muy específica: sirve como referencia práctica de cómo exportar y cuantizar modelos de segmentación para inferencia en navegador con ONNX Runtime Web. No hay información publicada sobre pipeline, idiomas, benchmarks ni métricas de calidad, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos variantes: GTR-style query-based + hybrid encoder (exp00103); YOLO26-seg-style con cabeza one-to-one sin NMS (exp00101). Backbone ResNet-50 en ambos casos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 1 x 3 x 512 x 512) |
| Tipos de cuantizacion | Weight-only INT8 (cómputo en fp32); exportación base con `--webgpu` |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`gtr_hybrid_r50_cls8_int8.onnx`, `yolo26seg_r50_cls8_int8.onnx`) |

## Arquitectura y entrenamiento

Ambos modelos comparten backbone ResNet-50 y una entrada RGB de 512 x 512 normalizada con media y desviación estándar de ImageNet, con preprocesado de letterbox (redimensionado por el lado largo y padding a derecha e inferior). La primera variante, `gtr_hybrid_r50_cls8_int8.onnx`, sigue un esquema de consultas al estilo GTR con encoder híbrido: produce logits de forma (1, 300, 8), cajas en formato cx cy w h normalizadas en 0-1 con forma (1, 300, 4) y máscaras como logits de forma (1, 300, 128, 128). La segunda, `yolo26seg_r50_cls8_int8.onnx`, emplea una cabeza one-to-one sin NMS y devuelve logits (1, A, 8), cajas en formato x0 y0 x1 y1 en píxeles (1, A, 4), coeficientes de máscara (1, A, M) y prototipos (1, M, 128, 128).

El entrenamiento se realizó sobre 2.000 imágenes del split de train de COCO, restringidas a 8 clases, lo que supone un régimen de datos muy reducido y un dominio de clases cerrado. La exportación se hizo mediante `exp00301_export_runtime/export_onnx.py --webgpu` y la cuantización con `exp00302_quantization/quantize_weights.py`, aplicando INT8 solo a los pesos y manteniendo el cómputo en fp32. No se documenta el número de tokens ni composición de dataset más allá de lo indicado, ni fases de RLHF/DPO (no aplicables en visión), ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación de instancias con 8 clases cerradas: person, bicycle, car, cat, dog, bottle, chair y tv.
- Detección de cajas delimitadoras en dos convenciones distintas según la variante: cx cy w h normalizadas (GTR) y x0 y0 x1 y1 en píxeles (YOLO26-seg).
- Generación de máscaras por instancia a resolución 128 x 128 (logits), posteriormente reescalables a la imagen original.
- Inferencia en navegador mediante ONNX Runtime Web con backends WebGPU y WASM.
- Cabeza one-to-one sin NMS en la variante YOLO26-seg, lo que simplifica el postprocesado en el cliente.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la segmentación de imágenes.

## Casos de uso

- Demo interactiva en navegador: el modelo se sirve desde GitHub Pages con ONNX Runtime Web y permite segmentar imágenes subidas por el usuario directamente en el cliente, sin backend, gracias a la exportación `--webgpu` y a los pesos INT8 de menor tamaño.
- Prototipado rápido de pipelines de segmentación: las dos variantes (query-based y one-to-one sin NMS) permiten comparar enfoques de postprocesado con la misma entrada 512 x 512 y el mismo backbone, útil para decidir arquitectura antes de escalar a un dataset mayor.
- Aplicaciones educativas y de investigación: el repositorio `cv-experiments` documenta los scripts de exportación y cuantización (`exp00301_export_runtime`, `exp00302_quantization`), lo que lo convierte en un ejemplo reproducible de cómo llevar un modelo de segmentación a ONNX con cuantización weight-only INT8.
- Filtrado y etiquetado asistido en dominios acotados: para imágenes que contengan las 8 clases soportadas, el modelo puede preanotar instancias y reducir el trabajo manual en herramientas de anotación, siempre con revisión humana dada la escasez de datos de entrenamiento.
- Procesamiento en el borde o en dispositivos sin GPU dedicada: al ejecutarse vía WASM en ONNX Runtime Web, puede desplegarse en entornos donde no hay acceso a un servidor de inferencia, a costa de mayor latencia.
- Pruebas de integración de ONNX Runtime Web: sirve como banco de pruebas para validar el soporte de operadores, la compatibilidad WebGPU/WASM y el rendimiento de modelos de segmentación en distintos navegadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de mAP, IoU, latencia ni throughput, y no se dispone de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,1 GB, por lo que los pesos INT8 de cada variante son del orden de decenas de MB, compatibles con GPUs de gama baja.
- GPU recomendadas: no disponibles; el autor no documenta requisitos. La exportación está pensada para WebGPU, lo que implica ejecución en la GPU del navegador del usuario final.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido de los pesos y la entrada 512 x 512, aunque no hay cifras publicadas que lo confirmen.
- Opciones de despliegue: ONNX Runtime Web (WebGPU y WASM) es el objetivo declarado. Para servidor, ONNX Runtime nativo, aunque no está documentado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación (por ejemplo, Mask R-CNN, YOLOv8-seg o Mask2Former) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Entrenado solo con 2.000 imágenes de COCO y 8 clases: la cobertura de dominio y la generalización son muy limitadas; cualquier clase fuera de person, bicycle, car, cat, dog, bottle, chair y tv no será detectada.
- Riesgo elevado de falsos negativos y de máscaras imprecisas en escenas con oclusiones, objetos pequeños o distribuciones distintas de COCO.
- No hay métricas publicadas de calidad (mAP, mask IoU), por lo que no es posible evaluar su idoneidad para producción sin una validación propia.
- La cuantización es weight-only INT8 con cómputo en fp32: reduce el tamaño del archivo pero no acelera necesariamente la inferencia en todos los backends.
- La entrada está fija a 512 x 512 con letterbox; no se documenta soporte para resoluciones variables ni batching.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y atribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.
- Ausencia de información sobre sesgos: al entrenar sobre COCO, es esperable heredar los sesgos de representación del dataset, aunque no se documentan análisis al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tkyk1234/cv-experiments-models
- Repositorio `cv-experiments` (referenciado en la model card, sin URL directa proporcionada): no disponible
- Demo en GitHub Pages (referenciada en la model card, sin URL directa proporcionada): no disponible
- Scripts de exportación y cuantización (`exp00301_export_runtime/export_onnx.py`, `exp00302_quantization/quantize_weights.py`): incluidos en el repositorio `cv-experiments`, sin URL directa proporcionada
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada
