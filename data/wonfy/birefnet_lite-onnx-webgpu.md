# wonfy/BiRefNet_lite-ONNX-webgpu

## Resumen

BiRefNet lite ONNX para WebGPU es una reexportación del modelo de segmentación binaria de imágenes BiRefNet lite (ZhengPeng7), reconstruida por el usuario wonfy para que el grafo ONNX original pueda ejecutarse en el backend WebGPU de ONNX Runtime Web dentro del navegador. Los pesos no se han reentrenado ni modificado: solo se ha reescrito la topología del grafo y se ha generado una variante en fp16. El objetivo es concreto: la exportación de serie falla en WebGPU porque algunos shaders necesitan más buffers de almacenamiento de los que permite el estándar (8 por shader) y porque ciertas operaciones usan índices int64 y nodos `Sum` sin kernel WebGPU, lo que provoca caídas a CPU con tensores de gran tamaño.

El modelo realiza segmentación de primer plano (eliminación de fondo) sobre imágenes RGB redimensionadas a 1024x1024, devolviendo un mapa de logits del mismo tamaño al que se aplica una sigmoid para obtener la máscara alfa. La arquitectura subyacente es BiRefNet, una red con encoder Swin Transformer orientada a segmentación dicotómica de alta resolución, descrita en el artículo arXiv:2401.03407. El repositorio pesa 0,4 GB e incluye dos ficheros ONNX: uno fp32 de 245 MB y otro fp16 de 123 MB.

Su relevancia es práctica: permite ejecutar eliminación de fondo con calidad de modelo profundo en el cliente, sin subir la imagen a un servidor, con latencias en torno a 0,5 s por imagen en caliente sobre una GPU de escritorio y una carga inicial de aproximadamente 1,8 s. Es un artefacto de despliegue, no un modelo nuevo, y su valor está en la compatibilidad con WebGPU y en la verificación numérica frente al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet lite (encoder Swin Transformer con decodificador de referencia bilateral); grafo ONNX reescrito para WebGPU |
| Parámetros totales | no disponible (los pesos fp32 en ONNX ocupan 245 MB, equivalente aproximado a 61 M de parámetros; el dato exacto no se publica en la información disponible) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 1024x1024 píxeles |
| Tipos de cuantización | fp32 (`onnx/model.onnx`) y fp16 (`onnx/model_fp16.onnx`, entrada y salida en float32); no hay int8, GGUF ni otras variantes en el repo |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (modelo y código); los datos de entrenamiento incluyen DIS5K, cuyos términos restringen el uso comercial del dataset |
| Formato de pesos | ONNX (dos ficheros), consumibles con Transformers.js y ONNX Runtime Web |
| Entrada | `input_image`: float32 `[1, 3, 1024, 1024]`, RGB redimensionado, escalado a 0..1 y normalizado con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]` |
| Salida | `output_image`: float32 `[1, 1, 1024, 1024]` de logits; aplicar sigmoid para obtener la máscara alfa |
| Tamaño del repositorio | 0,4 GB |
| Modelo base | ZhengPeng7/BiRefNet_lite |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentación dicotómica de alta resolución que combina un encoder Swin Transformer con un decodificador que integra módulos de referencia bilateral y supervisión multi-escala, según el artículo arXiv:2401.03407. La variante lite es la versión reducida del modelo, pensada para inferencia con menos recursos; los detalles exactos de número de capas y ancho del backbone no se recogen en la información proporcionada. En este repositorio no hay reentrenamiento: el autor indica explícitamente que los pesos son los mismos que los de ZhengPeng7/BiRefNet_lite, partiendo de la exportación previa de onnx-community/BiRefNet_lite-ONNX.

El trabajo técnico consiste en una reescritura del grafo en seis pasos. Primero, constant folding con el optimizador básico de ONNX Runtime, que reduce el grafo de 16.400 a 4.083 nodos y elimina todas las operaciones de forma, `ScatterND`, `Where` y `ConstantOfShape`. Segundo, cuatro nodos `Concat` con 16, 64, 256 y 1024 entradas se convierten en árboles de como máximo 6 entradas cada uno. Tercero, 59 nodos `Split` de hasta 32 salidas pasan a árboles de como máximo 6 salidas. Cuarto, 20 nodos `Sum` se sustituyen por cadenas de `Add` en el mismo orden, de modo que el resultado sigue siendo idéntico bit a bit. Quinto, 80 nodos `GatherND` (el muestreo de las convoluciones deformables) se reemplazan por un `Gather` simple sobre los datos reestructurados como `[H*W, C]`; la aritmética de índices, que era int64, pasa a float (los valores son enteros) y el cálculo `y * W + x` se hace en int32, con lo que no queda ningún tensor int64 en el grafo y los índices se mantienen exactos también en fp16. Sexto, la conversión a fp16 se hizo con `onnxconverter-common` usando `keep_io_types`, manteniendo entrada y salida en float32. El resultado es que ningún nodo usa más de 7 buffers de almacenamiento, por debajo del mínimo de 8 que garantiza WebGPU.

## Capacidades

- Segmentación de primer plano y eliminación de fondo en imágenes RGB, con salida de máscara alfa a 1024x1024.
- Recorte fino de detalles de borde: el autor valida con imágenes de pelo, un coche y dos gatos, casos donde el detalle en contornos es exigente.
- Ejecución en navegador mediante WebGPU con Transformers.js, sin backend servidor.
- Ejecución alternativa en CPU con ONNX Runtime, útil como fallback cuando no hay WebGPU disponible.
- Dos niveles de precisión intercambiables: fp32 con resultado idéntico bit a bit al original y fp16 con diferencias mínimas.
- Integración directa con `AutoModel`/`AutoProcessor` de Transformers.js y con `InferenceSession` de ONNX Runtime Web (`executionProviders: ["webgpu"]`).
- No soporta tool calling, agentes, razonamiento multi-turno, texto, audio ni visión general: es exclusivamente un modelo de segmentación de imagen.

## Casos de uso

- Editor de fotos en el navegador: el modelo recibe la imagen redimensionada a 1024x1024, devuelve logits y la aplicación aplica sigmoid para componer la máscara alfa sobre el canvas; al ejecutarse en WebGPU con unos 0,5 s por imagen en caliente, la interacción es viable sin servidor.
- Recorte de producto en e-commerce: integrado en el flujo de subida de un panel web, elimina el fondo de fotos de catálogo antes de enviarlas al CDN, lo que reduce el coste de almacenamiento y evita mandar originales a un servicio externo.
- Privacidad por diseño en imágenes sensibles: documentos de identidad, fotografías médicas o imágenes de menores pueden procesarse íntegramente en el cliente, ya que no hay llamada de red al modelo.
- Fondos virtuales en videoconferencia web: la máscara alfa generada a 1024x1024 puede reutilizarse como máscara de composición en un elemento `canvas` o en un `MediaStream`, con recorte de pelo razonable según la validación del autor.
- Preetiquetado de datasets de segmentación: usar el modelo como generador de máscaras iniciales en un pipeline de anotación, revisando después a mano; la variante fp32 es preferible aquí porque reproduce exactamente los logits del modelo original.
- Aplicación web progresiva sin conexión: al ser un artefacto ONNX de 123 MB en fp16, puede cachearse y ejecutarse offline, algo impracticable con un servicio de inferencia remoto.
- Prototipado rápido de demos: la carga con Transformers.js en una página estática elimina la necesidad de desplegar infraestructura GPU y facilita demos reproducibles en un portátil con GPU integrada compatible con WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval o GSM8K, no aplicables a este modelo) en la información disponible. El autor sí publica una verificación de fidelidad frente a la exportación fp32 de onnx-community/BiRefNet_lite-ONNX, con tres imágenes de prueba (pelo, un coche y dos gatos):

| Fichero | Plataforma | Logits | Máscara alfa |
|---|---|---|---|
| `model.onnx` (fp32) | CPU, ONNX Runtime 1.31 | idénticos bit a bit, diferencia máxima 0,0 | idéntica |
| `model_fp16.onnx` | CPU, ONNX Runtime 1.31 | diferencia máxima entre 0,04 y 0,48 | diferencia media en torno a 1e-5; como máximo el 0,07 % de los píxeles se desplaza más de 1/255 |
| `model_fp16.onnx` | WebGPU, Chrome 155, AMD Radeon RX 9070 XT, Transformers.js 4.3.1, ORT Web 1.31.0-dev.20260914 | no reportado por separado | entre el 0,5 % y el 1,4 % de los píxeles difiere más de 1/255 respecto al fp32 en CPU; entre el 0,01 % y el 0,02 % cambia de dentro a fuera, todos en bordes |

Rendimiento medido en WebGPU con la misma configuración: aproximadamente 0,5 s por imagen una vez caliente el modelo y unos 1,8 s de carga inicial. No se han publicado cifras de throughput en lote, consumo de memoria pico ni resultados en otras GPU.

## Requisitos de hardware

- Pesos: 245 MB en fp32 y 123 MB en fp16; a ello hay que sumar las activaciones y buffers intermedios a 1024x1024, cuyo pico no se publica.
- VRAM estimada: no disponible de forma oficial; por tamaño de pesos, el fp16 cabe holgadamente en cualquier GPU con más de 1 GB de memoria dedicada o compartida.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable en el navegador. El autor valida con una AMD Radeon RX 9070 XT en Chrome 155; no hay datos publicados para NVIDIA, Apple Silicon ni GPU integradas.
- Cabe en GPU de consumo: sí, siempre que el navegador exponga WebGPU; el límite real no es la memoria sino el soporte de kernels y el número de storage buffers por shader (el grafo se ha dejado en un máximo de 7, frente al mínimo garantizado de 8).
- Despliegue: Transformers.js en navegador con `device: "webgpu"` y `model_file_name: "model_fp16"` (combinación probada con `dtype: "fp32"`), o `InferenceSession` de ONNX Runtime Web con `executionProviders: ["webgpu"]`. Fallback en CPU con ONNX Runtime. No aplican vLLM, TGI ni llama.cpp, al no ser un modelo generativo de texto.
- Latencia: en torno a 0,5 s por imagen en caliente y 1,8 s de carga en la configuración validada; el rendimiento en CPU se mide solo en fidelidad, no en tiempo.
- Almacenamiento en cliente: el fichero fp16 de 123 MB debe descargarse y cachearse, lo que condiciona el primer arranque en conexiones lentas.

## Comparativa con modelos similares

| Modelo | Formato y precisión | Entrada | Compatible con WebGPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wonfy/BiRefNet_lite-ONNX-webgpu | ONNX fp32 (245 MB) y fp16 (123 MB) | 1024x1024 | Sí, validado en Chrome 155 con ORT Web | MIT (con caveat de datos DIS5K) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| onnx-community/BiRefNet_lite-ONNX | ONNX fp32 | 1024x1024 | No; el propio autor documenta fallos por buffers y por operadores int64/`Sum` | MIT | HuggingFace |
| ZhengPeng7/BiRefNet_lite | Pesos PyTorch originales | 1024x1024 | No aplica (requiere runtime Python) | MIT | HuggingFace |
| ZhengPeng7/BiRefNet (versión completa) | Pesos PyTorch | 1024x1024 | No aplica | MIT | HuggingFace; parámetros y cifras de rendimiento no disponibles en la información proporcionada |

La comparación relevante es la del primer y segundo artefacto: mismo modelo base y mismos pesos, con la diferencia de que la versión de wonfy reescribe el grafo para que WebGPU sea viable y añade una variante fp16. No se dispone de datos para comparar calidad de segmentación frente a otros modelos de eliminación de fondo de la competencia.

## Limitaciones y advertencias

- Es un modelo de segmentación dicotómica: produce una única máscara de primer plano, no etiquetas semánticas por instancia ni múltiples objetos separados.
- Entrada fija de 1024x1024: imágenes de otra resolución deben redimensionarse, con la consiguiente pérdida de detalle en originales muy grandes o muy pequeños.
- La variante fp16 introduce ruido en bordes: entre el 0,01 % y el 0,02 % de píxeles cambia de dentro a fuera en WebGPU, todos en contornos. Para pipelines que exijan reproducibilidad exacta, usar fp32.
- Dependencia fuerte del runtime: el grafo está adaptado al límite de 8 storage buffers por shader de WebGPU y validado con versiones concretas (Transformers.js 4.3.1, ORT Web 1.31.0-dev.20260914, Chrome 155). Cambios de versión o navegadores con implementaciones incompletas pueden alterar el comportamiento.
- Licencia: el código y los pesos son MIT, pero los datos de entrenamiento incluyen DIS5K, cuyos términos restringen el uso comercial del dataset. La licencia MIT no cubre los datos; conviene revisar el impacto antes de un despliegue comercial.
- Riesgo de alucinación en el sentido generativo no aplica, pero sí hay riesgo de segmentación errónea en imágenes ambiguas, con fondos y primer plano de color similar, transparencias o movimiento; no se han publicado métricas de calidad (IoU, MAE, F-measure) sobre DIS5K u otros conjuntos.
- Sesgos: no hay análisis publicado de sesgo por tipo de sujeto, tono de piel, iluminación o dominio de imagen; al estar entrenado sobre todo con datos de segmentación de objetos destacados, puede rendir peor en escenas no centradas en un sujeto principal.
- Madurez: el repositorio no tiene descargas ni likes y fue creado en octubre de 2026, por lo que no cuenta con validación de la comunidad ni con informes independientes de fallos.
- El proceso de reconstrucción requiere scripts concretos y versiones fijadas de onnx, onnxruntime y onnxconverter-common; reproducir el resultado con otras versiones puede no dar un grafo equivalente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wonfy/BiRefNet_lite-ONNX-webgpu
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Exportación ONNX de partida: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Artículo de BiRefNet: https://arxiv.org/abs/2401.03407
- Código de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
