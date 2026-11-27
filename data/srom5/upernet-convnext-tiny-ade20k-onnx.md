# srom5/upernet-convnext-tiny-ade20k-onnx

## Resumen

UPerNet + ConvNeXt-Tiny (ADE20K) — ONNX FP32 es una exportación al formato ONNX del modelo de segmentación semántica originalmente publicado por OpenMMLab como `openmmlab/upernet-convnext-tiny`. Combina el backbone ConvNeXt-Tiny (desarrollado por Meta AI Research en el repositorio `facebookresearch/ConvNeXt`) con la cabeza de decodificación UPerNet, y está entrenado sobre el conjunto de datos ADE20K para clasificar cada píxel de una imagen en una de 150 categorías semánticas (cielo, edificio, vegetación, personas, vehículos, mobiliario, etc.).

La relevancia de esta ficha concreta no reside en el modelo en sí, sino en el formato: se distribuye como un único grafo ONNX FP32 de 237.482.685 bytes (unos 226 MiB), sin modificar los pesos entrenados, lo que permite ejecutar la inferencia en entornos sin PyTorch, incluidos navegadores mediante `onnxruntime-web` (WASM y WebGPU) o servicios ligeros en C++, Rust o Python. El autor declara paridad numérica verificada frente a la cabeza de decodificación original de PyTorch (`maxAbsDiff = 3.43e-5`) y frente a `onnxruntime-web@1.22.0` (`maxAbsError = 6.87e-5`, con coincidencia del 100 % en la clase argmax).

El modelo resuelve el problema clásico de segmentación semántica densa sobre imágenes de resolución moderada (entrada fija de 512×512 píxeles) y produce logits de 128×128, lo que reduce el coste de posprocesado frente a exportaciones que sobremuestrean a la resolución de entrada. Es una pieza útil para pipelines de visión por computador que necesiten un modelo pequeño, con licencia MIT y desplegable en el navegador sin dependencias pesadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UPerNet (cabeza de decodificación piramidal con PPM) sobre backbone ConvNeXt-Tiny |
| Parámetros totales | no disponible (el modelo card no los declara; ConvNeXt-Tiny tiene aproximadamente 28,6 M en el backbone, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de imagen 512×512) |
| Tipos de cuantización | solo FP32 en este repositorio; no se distribuyen variantes INT8, FP16 ni GGUF |
| Idiomas soportados | no disponible (modelo de visión; las 150 clases de ADE20K están en inglés en el dataset original) |
| Licencia | MIT (pesos y exportación); el dataset ADE20K se rige por sus propios términos |
| Formato de pesos | ONNX FP32 (un único archivo `upernet-convnext-tiny.onnx`) |
| Entrada | `float32`, NCHW `[1, 3, 512, 512]`, RGB en `[0, 1]`, normalización ImageNet (`mean = [0.485, 0.456, 0.406]`, `std = [0.229, 0.224, 0.225]`) |
| Salida | `float32`, NCHW `[1, 150, 128, 128]` logits crudos en orden de clases ADE20K |
| Tamaño del archivo | 237.482.685 bytes (unos 226 MiB) |
| SHA-256 | `43a455772b3603afafc5d909cd9c178fadc863f2edad6ddc0ffb9d6f92cf76ca` |
| Herramientas de exportación | `torch==2.10.0`, `transformers==4.49.0`, `onnx==1.18.0`, `onnxruntime==1.22.0` |

## Arquitectura y entrenamiento

La arquitectura es la combinación estándar de UPerNet con un backbone ConvNeXt-Tiny. ConvNeXt es una red convolucional pura (sin atención) que moderniza el diseño de ResNet adoptando elementos propios de los transformers de visión: convoluciones depthwise de 7×7, normalización LayerNorm, activación GELU y una estructura de etapas con proporciones 1:1:3:1. UPerNet añade una cabeza de decodificación que agrega características multiescala del backbone mediante un Pyramid Pooling Module (PPM) y fusiones laterales, produciendo un mapa de logits por clase a resolución reducida. En esta exportación, la salida se genera a 128×128 píxeles (un cuarto de la entrada de 512×512) en lugar de sobremuestrear a la resolución original.

El entrenamiento original se realizó sobre ADE20K, un dataset de escenas interiores y exteriores con 150 clases semánticas y anotaciones densas a nivel de píxel. No se dispone en la información proporcionada del número de imágenes, tokens ni de la composición exacta del dataset, ni de si se aplicaron técnicas de ajuste fino adicionales (RLHF, DPO u otras) más allá del entrenamiento supervisado estándar de segmentación. La innovación técnica destacable de esta ficha es la conversión a ONNX: el autor sustituye el `AdaptiveAvgPool2d` no divisible del PPM (de 16 a 3 y 6) por bins estáticos equivalentes de `Slice` + `ReduceMean`, garantizando compatibilidad con el estándar ONNX sin alterar los pesos. La exportación se realizó directamente desde `backbone(...).feature_maps` más `decode_head`, evitando el sobremuestreo redundante.

## Capacidades

- Segmentación semántica densa: asigna una de 150 clases ADE20K a cada píxel de la imagen de entrada (cielo, edificio, árbol, persona, coche, mesa, silla, etc.).
- Inferencia en navegador: compatible con `onnxruntime-web@1.22.0` en modo WASM y WebGPU, verificado por el autor.
- Inferencia sin PyTorch: al ser un grafo ONNX puro, se puede ejecutar con `onnxruntime` en Python, C++, C#, Rust, Java o JavaScript.
- Entrada de resolución fija: acepta imágenes de 512×512 píxeles con normalización ImageNet; no soporta resolución dinámica en esta exportación.
- Salida a resolución reducida: produce logits de 128×128, lo que reduce el coste de posprocesado (argmax y remuestreo) frente a salidas de 512×512.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (VQA, captioning), audio ni modo thinking: es exclusivamente un modelo de segmentación semántica.
- Capacidades multilingües: no aplica; las etiquetas de clase son las del dataset ADE20K, en inglés.

## Casos de uso

- Segmentación en el navegador sin backend: integrar el modelo en una aplicación web que cargue el ONNX con `onnxruntime-web` y ejecute la segmentación en el cliente mediante WebGPU o WASM, útil para herramientas de edición de imágenes o anotación colaborativa que no pueden enviar imágenes a un servidor.
- Preprocesado para pipelines de visión: usar los mapas de segmentación como máscara previa para tareas de recorte, sustitución de fondo, composición o aumento de datos en un pipeline de entrenamiento de otros modelos.
- Anotación asistida de datasets: generar máscaras semánticas preliminares sobre imágenes nuevas y revisarlas manualmente, acelerando la creación de datasets de segmentación propios con las 150 clases de ADE20K como taxonomía base.
- Robótica y conducción asistida de bajo coste: segmentar escenas urbanas o interiores en tiempo real en dispositivos con recursos limitados, dado el tamaño moderado del modelo (unos 226 MiB en FP32) y su backbone convolucional sin atención.
- Análisis de imágenes satelitales o aéreas de resolución moderada: clasificar píxeles en categorías como vegetación, agua, edificios o vías, siempre que las clases de interés estén cubiertas por ADE20K y se acepte la resolución fija de 512×512.
- Despliegue en entornos edge o embebidos: ejecutar el modelo con `onnxruntime` en dispositivos ARM o en contenedores mínimos sin dependencias de PyTorch, reduciendo el tamaño de la imagen de despliegue y el tiempo de arranque.
- Control de calidad visual en producción: detectar regiones de interés (personas, vehículos, mobiliario) en imágenes de cámaras de vigilancia o inspección industrial y activar alertas o recortes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de paridad numérica de la conversión:

| Métrica | Valor |
|---|---|
| Diferencia absoluta máxima frente a la cabeza de decodificación PyTorch original | 3.43e-5 |
| Diferencia absoluta máxima en `onnxruntime-web@1.22.0` (WASM y WebGPU) | 6.87e-5 |
| Coincidencia de clase argmax en `onnxruntime-web` | 100 % |

No se proporcionan valores de mIoU, pixel accuracy ni métricas de latencia o throughput sobre ADE20K en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo FP32 de unos 226 MiB, la inferencia requiere aproximadamente 0,5–1 GB de memoria considerando activaciones intermedias para una imagen de 512×512; no se dispone de una medición oficial en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de memoria libre; funcionan tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090, así como GPUs de datacenter A100 o H100 (sobradas para este tamaño).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPUs recientes mediante WebGPU.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#, Rust, Java), `onnxruntime-web` (WASM y WebGPU en navegador), `onnxruntime-genai` no aplica, y servidores genéricos compatibles con ONNX. No se distribuyen pesos en formato GGUF, por lo que `llama.cpp` u `Ollama` no son aplicables; tampoco se proporcionan artefactos para vLLM o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor solo confirma que la inferencia funciona en WASM y WebGPU, sin cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| srom5/upernet-convnext-tiny-ade20k-onnx (este) | UPerNet + ConvNeXt-Tiny | no disponible | imagen 512×512, salida 128×128 | MIT | ONNX FP32 | Hugging Face |
| openmmlab/upernet-convnext-tiny | UPerNet + ConvNeXt-Tiny | no disponible | imagen 512×512 | MIT | PyTorch | Hugging Face |
| openmmlab/upernet-convnext-small | UPerNet + ConvNeXt-Small | no disponible | imagen 512×512 | MIT | PyTorch | Hugging Face |
| openmmlab/segformer-b5-finetuned-ade-640-640 | SegFormer (transformer) | no disponible | imagen 640×640 | MIT | PyTorch | Hugging Face |

La comparación se limita a alternativas de la misma familia o categoría (segmentación semántica sobre ADE20K). No se dispone de datos de rendimiento (mIoU) en la información proporcionada para establecer una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso en esos escenarios es inadecuado.
- Resolución de entrada fija: la exportación acepta únicamente tensores `[1, 3, 512, 512]`; imágenes de otra resolución deben redimensionarse y recortarse antes de la inferencia, lo que puede degradar la segmentación de objetos pequeños.
- Salida a 128×128: los logits deben remuestrearse a la resolución original para su visualización o uso como máscara; el remuestreo introduce artefactos en bordes finos.
- Cobertura limitada de clases: solo las 150 clases de ADE20K; objetos o categorías fuera de ese vocabulario se asignarán a la clase más parecida, con riesgo de errores semánticos.
- Sesgos del dataset: ADE20K está compuesto mayoritariamente por escenas interiores y exteriores de ciertos entornos; el modelo puede rendir peor en dominios no representados (imágenes médicas, satelitales específicas, industriales).
- Riesgo de alucinación visual: como todo modelo de segmentación, puede producir máscaras plausibles pero incorrectas en regiones ambiguas u ocluidas; no debe usarse como única fuente en aplicaciones críticas sin verificación.
- Licencia MIT para los pesos, pero el dataset ADE20K tiene sus propios términos de uso que deben respetarse si se redistribuyen datos derivados.
- Sin garantías de soporte: repositorio con 0 descargas y 0 likes en el momento de la ficha; el autor no ofrece mantenimiento ni actualizaciones documentadas.
- No se distribuyen variantes cuantizadas (INT8, FP16) ni formatos alternativos (GGUF, TensorRT); quien necesite menor latencia o tamaño deberá cuantizar por su cuenta, asumiendo el riesgo de degradación de precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/srom5/upernet-convnext-tiny-ade20k-onnx
- Modelo original upstream: https://huggingface.co/openmmlab/upernet-convnext-tiny
- Commit fijado del upstream: `876ffc56b819a829448f7e81e9f8606deef6fb65`
- Repositorio del backbone ConvNeXt: https://github.com/facebookresearch/ConvNeXt
- Repositorio de OpenMMLab: no disponible en la información proporcionada
- Paper de ConvNeXt: no disponible en la información proporcionada
- Paper de UPerNet: no disponible en la información proporcionada
- Dataset ADE20K: no disponible en la información proporcionada
- Demo o espacio de Hugging Face: no disponible en la información proporcionada
