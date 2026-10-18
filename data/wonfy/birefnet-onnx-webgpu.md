# wonfy/BiRefNet-ONNX-webgpu

## Resumen

BiRefNet-ONNX-webgpu es una reexportación del modelo BiRefNet para segmentación de imágenes y eliminación de fondos, preparada por el usuario wonfy para ejecutarse en el navegador mediante WebGPU. Parte del modelo original de ZhengPeng7/BiRefNet y del export ONNX de onnx-community/BiRefNet-ONNX, pero reescribe el grafo para que sea compatible con las limitaciones de WebGPU: límite de storage buffers por shader, operaciones con índices int64 y nodos `Sum` sin kernel WebGPU. Los pesos no se reentrenan; solo se transforma el grafo y se añade una variante fp16.

El modelo mantiene el backbone Swin-L de BiRefNet y produce una máscara alfa de 1024x1024 a partir de una imagen RGB normalizada. Su relevancia está en que permite eliminar fondos de imágenes directamente en el cliente, sin subir fotos a un servidor, usando Transformers.js u ONNX Runtime Web. Es una pieza útil para aplicaciones de edición fotográfica, catálogos de producto o herramientas de diseño que necesitan privacidad y despliegue sencillo, aunque su rendimiento depende de la GPU y del navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet con backbone Swin-L; grafo ONNX reescrito para WebGPU |
| Parámetros totales | no disponible en la información proporcionada |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 1024x1024) |
| Tipos de cuantización | fp32 y fp16 (pesos fp16 con entrada y salida float32); no se proporcionan int8, int4 ni GGUF |
| Idiomas soportados | no disponible; no procesa texto |
| Licencia | MIT (modelo y código); los datos de entrenamiento incluyen DIS5K, con condiciones propias |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`) |
| Pipeline | image-segmentation |
| Modelo base | ZhengPeng7/BiRefNet |
| Entrada | float32 `[1, 3, 1024, 1024]`, RGB redimensionado a 1024x1024, escalado a 0..1 y normalizado con media ImageNet `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]` |
| Salida | float32 `[1, 1, 1024, 1024]` logits; aplicar sigmoid para obtener la máscara alfa |
| Tamaño del repositorio | 1.6 GB |
| Tamaño de los ficheros | fp32: 1038 MB; fp16: 520 MB |
| Librería | transformers.js |

## Arquitectura y entrenamiento

BiRefNet es un modelo de segmentación dicotómica de imágenes de alta resolución. En esta ficha se distribuye con backbone Swin-L y un grafo ONNX que conserva los pesos originales. El modelo original emplea convoluciones deformables; en el grafo aparecen operaciones de muestreo tipo `GatherND`, que el autor ha convertido en `Gather` sobre datos reshaped a `[H*W, C]` para evitar índices int64 y kernels no disponibles en WebGPU.

No se ha reentrenado el modelo: los cambios son de exportación y optimización de grafo. La model card indica que el entrenamiento original incluye DIS5K, pero no detalla el número de tokens, la composición completa del dataset ni si hubo fases de RLHF o DPO; en un modelo de visión estas fases no se describen. Las innovaciones técnicas de esta versión son la reducción del grafo de 21.968 a 5.271 nodos mediante constant folding, la conversión de nodos `Concat` y `Split` multipuerto en árboles de como máximo 6 entradas o salidas, la sustitución de 20 nodos `Sum` por cadenas de `Add`, la eliminación de tensores int64 y la conversión fp16 con `keep_io_types` para mantener entrada y salida en float32. Cada nodo usa como máximo 7 storage buffers, por debajo del mínimo de 8 que promete WebGPU.

## Capacidades

- Segmentación de primer plano y eliminación de fondo en imágenes RGB, con salida de máscara alfa a 1024x1024.
- Generación de máscaras con detalle en bordes; la model card menciona pruebas con pelo, un coche y dos gatos.
- Inferencia en navegador mediante WebGPU con Transformers.js o ONNX Runtime Web, sin necesidad de servidor.
- Dos variantes de precisión: fp32 para máxima fidelidad y fp16 para reducir tamaño y facilitar la carga en el navegador.
- Ejecución en CPU mediante ONNX Runtime, usada en las pruebas de verificación; no es el objetivo principal.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, audio ni modo thinking.
- No incorpora decodificación especulativa ni mecanismos de atención lineal; es un modelo de visión especializado en segmentación.

## Casos de uso

- Edición fotográfica en el navegador: el modelo puede eliminar el fondo de retratos o fotos de producto directamente en el cliente, sin subir la imagen a un servidor. Es adecuado porque devuelve una máscara alfa de 1024x1024 y se integra con Transformers.js.
- Catálogos de e-commerce: generación de imágenes de producto con fondo transparente para fichas de catálogo. La máscara de alta resolución permite conservar bordes de objetos como pelo, tejidos o materiales finos, y el despliegue en WebGPU evita costes de servidor.
- Herramientas de diseño gráfico: plugin o aplicación web que recorte sujetos para composición, stickers o mockups. La inferencia local encaja en flujos donde el usuario necesita ver el resultado rápido y no quiere enviar material privado.
- Fondos virtuales en videollamadas: sustitución de fondo en capturas o vídeos de baja frecuencia. En la GPU probada tarda unos 800 ms por imagen en caliente, por lo que es más realista para imágenes estáticas o preprocesado que para vídeo en tiempo real a 30 fps.
- Aplicaciones con requisitos de privacidad: eliminación de fondos en fotos personales, documentos o material interno que no debe salir del dispositivo. El modelo se ejecuta en el navegador y la licencia MIT facilita su integración.
- Preprocesado para pipelines de visión: generación de máscaras para composición, aumento de datos, limpieza de datasets o segmentación previa a otros modelos. El formato ONNX permite integrarlo en herramientas fuera del navegador.
- Demos y educación sobre WebGPU: ejemplo práctico de un modelo de segmentación ejecutado en el navegador con ONNX Runtime Web. La carga inicial es de unos 4,3 s y la inferencia en caliente de unos 800 ms en el equipo probado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K porque no es un modelo de lenguaje. La model card sí incluye comparaciones de fidelidad y latencia:

| Prueba | Fichero | Resultado |
|---|---|---|
| CPU, ONNX Runtime 1.31, 3 imágenes (pelo, coche, dos gatos), logits frente a onnx-community fp32 | `model.onnx` | Bit-idéntico; diferencia máxima 0.0 |
| CPU, mismas imágenes, logits frente a onnx-community fp32 | `model_fp16.onnx` | Diferencia máxima entre 0.06 y 1.25 |
| CPU, máscara alfa | `model.onnx` | Idéntica |
| CPU, máscara alfa | `model_fp16.onnx` | Diferencia media inferior a 1e-5; como máximo 0.02 % de píxeles cambian más de 1/255 |
| WebGPU, Chrome 155, AMD Radeon RX 9070 XT, Transformers.js 4.3.1, ONNX Runtime Web 1.31.0-dev.20260914 | `model_fp16.onnx` | Entre 0.5 % y 1.3 % de píxeles cambian más de 1/255 frente al resultado fp32 en CPU; entre 0.01 % y 0.02 % de píxeles cambian entre dentro y fuera, todos en bordes |
| WebGPU, mismo equipo | `model_fp16.onnx` | Unos 800 ms por imagen en caliente; unos 4,3 s de carga |

No se proporcionan datos de throughput, consumo de memoria en GPU ni latencia en otros navegadores o GPU distintas de la probada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, los pesos ocupan 520 MB en fp16 y 1038 MB en fp32; hay que añadir activaciones y buffers de WebGPU.
- GPU recomendadas: no se proporciona una lista. La única GPU probada en la model card es AMD Radeon RX 9070 XT con Chrome 155.
- Cabe en GPU de consumo: sí, se probó en una RX 9070 XT. No hay datos para portátiles, GPU integradas u otras tarjetas.
- Opciones de despliegue: Transformers.js con `device: "webgpu"`, ONNX Runtime Web con `executionProviders: ["webgpu"]` y ONNX Runtime en CPU para verificación. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo de segmentación.
- Memoria en navegador: ONNX Runtime Web lee el modelo completo en memoria WebAssembly antes de moverlo a la GPU. El fichero fp32 de unos 1 GB puede ser problemático en dispositivos con poca memoria; la variante fp16 es la opción más segura para navegador.
- Latencia: unos 800 ms por imagen en caliente y unos 4,3 s de carga en el equipo probado. No se proporciona throughput ni latencia para otros hardware.

## Comparativa con modelos similares

| Modelo | Backbone / parámetros | Entrada / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wonfy/BiRefNet-ONNX-webgpu | Swin-L; parámetros no disponibles | 1024x1024 | fp32 bit-idéntico en CPU; fp16 con diferencias pequeñas; WebGPU ~800 ms/imagen en RX 9070 XT | MIT | Hugging Face |
| ZhengPeng7/BiRefNet | Swin-L; parámetros no disponibles | 1024x1024 | Modelo original en PyTorch; no incluye las optimizaciones para WebGPU de esta versión | MIT | Hugging Face |
| onnx-community/BiRefNet-ONNX | Swin-L; parámetros no disponibles | 1024x1024 | Export ONNX estándar; según la model card, no ejecuta en WebGPU por límites de storage buffers, int64 y nodos `Sum` | no disponible en la información proporcionada | Hugging Face |
| wonfy/BiRefNet_lite-ONNX-webgpu | Versión reducida; parámetros no disponibles | no disponible | Versión más pequeña para WebGPU; sin datos de precisión o latencia en la información proporcionada | no disponible en la información proporcionada | Hugging Face |

La comparación directa con modelos de eliminación de fondo comerciales no está disponible en la información proporcionada. Dentro de la familia BiRefNet, esta versión destaca por ser la única de las mencionadas que incluye un grafo adaptado explícitamente a WebGPU, mientras que la variante lite sacrifica tamaño sin datos públicos de rendimiento en esta ficha.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- La entrada está fija a 1024x1024. Redimensionar imágenes muy grandes o con relaciones de aspecto extremas puede perder detalle fino.
- El rendimiento en WebGPU depende del navegador, la GPU y la versión de ONNX Runtime Web. Solo se ha probado Chrome 155 con una AMD Radeon RX 9070 XT y una versión de desarrollo de ONNX Runtime Web.
- La variante fp16 introduce diferencias medibles: hasta 1.25 en logits, una diferencia media inferior a 1e-5 en la máscara alfa y entre 0.5 % y 1.3 % de píxeles con cambio superior a 1/255 en WebGPU. Para máxima fidelidad, usar fp32 en CPU o servidor.
- El fichero fp32 ocupa unos 1038 MB y se carga primero en memoria WebAssembly; puede fallar en navegadores o dispositivos con poca memoria. La variante fp16 es la recomendada para navegador.
- La licencia MIT cubre el modelo y el código, pero los datos de entrenamiento incluyen DIS5K, cuyos términos restringen el uso comercial del dataset. Es necesario revisar las implicaciones antes de un uso comercial.
- No se han documentado sesgos específicos ni la composición completa de los datos de entrenamiento. El rendimiento puede degradarse en categorías de imagen poco representadas.
- No es un modelo generativo de texto, por lo que el riesgo de alucinación lingüística no aplica. Sí puede producir máscaras incorrectas en imágenes ambiguas, objetos muy finos o fondos con colores similares al sujeto.
- No se proporcionan benchmarks en múltiples datasets ni métricas de robustez más allá de las tres imágenes de prueba de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wonfy/BiRefNet-ONNX-webgpu
- Modelo base BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- Export ONNX de referencia: https://huggingface.co/onnx-community/BiRefNet-ONNX
- Variante lite para WebGPU: https://huggingface.co/wonfy/BiRefNet_lite-ONNX-webgpu
- Paper de BiRefNet: https://arxiv.org/abs/2401.03407
- Código de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
