# Xenova/yolos-tiny

## Resumen

Xenova/yolos-tiny es una conversión a ONNX del modelo de detección de objetos hustvl/yolos-tiny, publicada por Xenova (Joshua Lochner) para su uso con la librería Transformers.js. YOLOS (You Only Look at One Sequence) es un detector de objetos que adapta la arquitectura del Vision Transformer (ViT) directamente a la tarea de detección, tratando las imágenes como secuencias de parches y prediciendo cajas delimitadoras mediante tokens de detección, sin necesidad de componentes convolucionales específicos de detección ni de anclas (anchors).

La variante "tiny" es la versión más pequeña de la familia YOLOS, con aproximadamente 6 millones de parámetros, lo que la hace especialmente adecuada para entornos con recursos limitados, incluida la inferencia directamente en el navegador mediante WebAssembly o WebGPU. El repositorio contiene únicamente los pesos en formato ONNX (unos 0,1 GB), lo que facilita su despliegue en aplicaciones web sin backend.

Este modelo no es un modelo de lenguaje: es un modelo de visión por computador especializado en detección de objetos sobre el dataset COCO (80 clases). Su relevancia actual radica en que permite ejecutar detección de objetos en el cliente (navegador) con latencias aceptables y sin depender de infraestructura de servidor, lo que resulta útil para aplicaciones de privacidad, prototipado rápido y demos interactivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) adaptado a detección de objetos (YOLOS) |
| Parametros totales | Aproximadamente 6 millones (variante tiny de YOLOS) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen redimensionada, típicamente 512x512 píxeles) |
| Tipos de cuantizacion | Pesos ONNX (cuantización no especificada en la información disponible; el repositorio contiene pesos ONNX) |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (carpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

YOLOS es un detector de objetos que reformula la detección como un problema de predicción sobre secuencias, siguiendo el enfoque de DETR. Utiliza un backbone ViT que divide la imagen en parches, los proyecta en embeddings y los procesa mediante bloques de auto-atención. Sobre esta secuencia se añaden tokens especiales de detección que, tras el codificador, se decodifican en predicciones de clase y caja delimitadora mediante cabezas lineales. A diferencia de DETR, YOLOS no emplea un decodificador transformer separado ni consultas aprendidas; la predicción se realiza directamente sobre los tokens de detección insertados en la secuencia del codificador.

El modelo original hustvl/yolos-tiny fue entrenado sobre el dataset COCO (118.000 imágenes de entrenamiento, 80 clases) partiendo de pesos preentrenados de ViT. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un detector). La conversión a ONNX realizada por Xenova no modifica la arquitectura ni los pesos, solo el formato para compatibilidad con Transformers.js.

## Capacidades

- Detección de objetos en imágenes: identifica y localiza hasta 100 objetos por imagen entre las 80 clases de COCO (persona, coche, perro, gato, silla, etc.).
- Predicción de cajas delimitadoras con puntuaciones de confianza asociadas.
- Ejecución en navegador mediante Transformers.js (WebAssembly o WebGPU), sin necesidad de backend.
- Procesamiento de imágenes individuales; no soporta vídeo de forma nativa, aunque puede aplicarse fotograma a fotograma.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto.
- No tiene capacidades multilingües ni de comprensión de lenguaje natural.
- No dispone de modo "thinking", visión aumentada, audio ni otras capacidades especiales más allá de la detección de objetos estándar.

## Casos de uso

- Detección de objetos en el navegador para aplicaciones web interactivas: el modelo se carga con Transformers.js y procesa imágenes del usuario directamente en el cliente, sin enviar datos a un servidor, lo que preserva la privacidad y reduce costes de infraestructura.
- Prototipado rápido de pipelines de visión: al ser un modelo pequeño (0,1 GB) y con licencia Apache 2.0, permite validar ideas de detección de objetos en minutos sin necesidad de GPU dedicada.
- Filtrado y moderación de imágenes en aplicaciones de mensajería: puede detectar contenido no deseado (por ejemplo, personas o determinados objetos) en el cliente antes de subir la imagen a un servidor.
- Análisis de imágenes en entornos con conectividad limitada: al ejecutarse localmente en el navegador, funciona en escenarios donde no hay acceso a APIs en la nube o la latencia de red es alta.
- Educación y demos de visión por computador: su tamaño reducido y su integración con Transformers.js lo hacen idóneo para talleres y tutoriales sobre detección de objetos en JavaScript.
- Preprocesamiento en aplicaciones de realidad aumentada web: detección de objetos en tiempo real (fotograma a fotograma) para superponer elementos gráficos, aunque con limitaciones de rendimiento en comparación con modelos más grandes.
- Automatización de tareas de etiquetado asistido: generar cajas delimitadoras preliminares sobre imágenes para que un humano las revise y corrija, acelerando la anotación de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el repositorio ONNX ocupa 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en memoria de navegador.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Para aceleración, cualquier GPU integrada o dedicada es suficiente (por ejemplo, Intel Iris Xe, NVIDIA GTX 1650 o superior). En el navegador, WebGPU permite aceleración en GPUs compatibles.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en dispositivos móviles con WebAssembly.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime (web, Node.js, Python), y cualquier runtime compatible con ONNX. No se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La latencia dependerá del hardware y del backend (WebAssembly es más lento que WebGPU), pero al tratarse de un modelo de ~6M de parámetros se espera que sea del orden de decenas de milisegundos por imagen en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Xenova/yolos-tiny | ~6M | Imagen 512x512 (típico) | Apache 2.0 | ONNX | Hugging Face, Transformers.js |
| Xenova/detr-resnet-50 | ~41M | Imagen 800x1333 (típico) | Apache 2.0 | ONNX | Hugging Face, Transformers.js |
| Xenova/yolos-small | ~30M | Imagen 512x512 (típico) | Apache 2.0 | ONNX | Hugging Face, Transformers.js |
| hustvl/yolos-tiny (original) | ~6M | Imagen 512x512 (típico) | Apache 2.0 | PyTorch (safetensors/bin) | Hugging Face |

La comparativa se basa en datos públicos de los repositorios de Hugging Face. No se dispone de datos de rendimiento (mAP) en la información proporcionada para comparar cuantitativamente.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre COCO, el modelo hereda los sesgos de ese dataset (por ejemplo, sobrerrepresentación de ciertas clases y contextos, y posibles sesgos geográficos y culturales). No se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: como todo detector de objetos, puede producir falsos positivos (detecciones espurias) y falsos negativos, especialmente en objetos pequeños, ocluidos o con clases poco representadas en COCO.
- Limitaciones de contexto o idioma: no aplica idioma; el modelo solo procesa imágenes. No maneja texto ni instrucciones en lenguaje natural.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia. No se identifican restricciones adicionales en la información disponible.
- Caveats para producción: el modelo está pensado para ejecución en navegador y puede tener un rendimiento limitado en comparación con detectores más grandes; no se recomienda para aplicaciones que requieran alta precisión en dominios especializados (medicina, industria, etc.) sin un ajuste fino previo. Además, la conversión a ONNX es una solución temporal según el autor, y el repositorio podría no recibir actualizaciones.
- No es un modelo de lenguaje: no debe utilizarse para tareas de generación de texto, razonamiento, código o matemáticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xenova/yolos-tiny
- Modelo original: https://huggingface.co/hustvl/yolos-tiny
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Librería en NPM: https://www.npmjs.com/package/@huggingface/transformers
- Modelos de detección de objetos con Transformers.js: https://huggingface.co/models?library=transformers.js&pipeline_tag=object-detection
- Demo de detección de objetos en vídeo (relacionada): https://huggingface.co/spaces/Xenova/video-object-detection
- Documentación de Optimum para conversión a ONNX: https://huggingface.co/docs/optimum/index
