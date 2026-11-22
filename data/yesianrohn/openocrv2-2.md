# Yesianrohn/OpenOCRv2

## Resumen

OpenOCRv2 es un conjunto de tres modelos especializados en detección y reconocimiento de texto en imágenes de escenas y documentos, publicado por el autor Yesianrohn en Hugging Face bajo licencia Apache 2.0. El repositorio agrupa un detector de texto (OpenOCRv2_Det), un reconocedor rápido basado en CTC (OpenOCRv2_Rec_CTC) y un reconocedor orientado a precisión con decodificación autorregresiva (OpenOCRv2_Rec_AR), cada uno en su propio subdirectorio y con pesos independientes.

El modelo resuelve el pipeline clásico de OCR en dos etapas: primero localiza regiones de texto devolviendo polígonos en coordenadas de la imagen original, y después reconoce el contenido de cada recorte. Su principal atractivo es el reducido tamaño de los pesos (36 MB, 85 MB y 141 MB respectivamente, con 9,36 M, 21,97 M y 36,66 M de parámetros) y que se puede ejecutar con `torch` + `transformers` sin dependencias pesadas como `torchvision`, lo que facilita el despliegue en entornos con recursos limitados, incluida CPU.

Es relevante ahora porque ofrece una alternativa ligera y de código abierto (Apache 2.0) frente a pipelines de OCR propietarios o modelos mucho más grandes, manteniendo la posibilidad de elegir entre velocidad (CTC) y precisión (AR) según el caso de uso. La información pública disponible no incluye detalles sobre datos de entrenamiento, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector: HGNetv2-b4 + DCNv2 + cabeza de regresión de polígonos. Reconocedores: ConvNeXt + encoder de texto con 2D-RoPE; CTC lineal (Rec_CTC) o decoder autorregresivo con RoPE y KV cache (Rec_AR) |
| Parametros totales | Det: 9,36 M; Rec_CTC: 21,97 M; Rec_AR: 36,66 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El repositorio contiene tres modelos independientes. El detector (`det/`) emplea un backbone HGNetv2-b4 con módulos DCNv2 (deformable convolution) y una cabeza de regresión de polígonos que devuelve cuadriláteros en coordenadas de píxel de la imagen original junto con una puntuación de detección por región. Los dos reconocedores comparten un encoder basado en ConvNeXt más un encoder de texto con 2D-RoPE: `rec_ctc` añade una cabeza lineal CTC para decodificación no autorregresiva, mientras que `rec_ar` incorpora un decoder autorregresivo con RoPE y KV cache que genera un token por paso.

El pipeline completo (`det.ocr(...)`) encadena detección, recorte con OpenCV y reconocimiento, devolviendo el texto en orden de lectura junto con la puntuación de reconocimiento, el texto y el cuadrilátero de cada región. No se ha publicado información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del uso de 2D-RoPE y KV cache en el reconocedor autorregresivo.

## Capacidades

- Detección de texto en imágenes de escenas y documentos, con salida de polígonos y puntuaciones de confianza.
- Reconocimiento de texto sobre recortes de líneas de texto, con salida de texto y confianza por línea.
- Pipeline OCR completo de página con orden de lectura y puntuación por región.
- Dos modos de reconocimiento: CTC (orientado a velocidad y throughput) y AR (orientado a precisión, decodificación token a token).
- Ejecución en CPU y GPU (CUDA) con `torch` + `transformers`, sin requerir `torchvision`.
- Carga selectiva por subcarpeta (`subfolder=`) para descargar solo el componente necesario.
- No se documenta soporte de tool calling, capacidades de agente, modo thinking, audio ni visión general más allá del OCR.

## Casos de uso

- Digitalización de documentos escaneados: el pipeline `det.ocr()` con `rec_ar` permite extraer texto en orden de lectura de páginas completas, adecuado para archivos y facturas donde la precisión prima sobre la latencia.
- Procesamiento por lotes de alto volumen: `rec_ctc` ofrece decodificación no autorregresiva, lo que lo hace idóneo para pipelines que deben reconocer miles de recortes por hora en CPU o GPU modesta.
- Extracción de texto en imágenes de escenas: el detector devuelve polígonos en coordenadas originales, útil para señalética, carteles o fotos de calle donde el texto aparece en perspectiva.
- Preprocesado para sistemas RAG o búsqueda documental: el OCR alimenta un indexador de texto a partir de PDFs escaneados o imágenes, con puntuaciones de confianza para filtrar regiones dudosas.
- Automatización de accesos y formularios: reconocimiento de líneas de texto en recortes (DNI, matrículas, tickets) usando `rec.recognize()` sobre crops ya segmentados.
- Despliegue en entornos con recursos limitados: con pesos de 36-141 MB y sin `torchvision`, puede ejecutarse en contenedores pequeños, dispositivos edge o portátiles sin GPU.
- Verificación de calidad en digitalización: las puntuaciones por región permiten marcar manualmente las zonas con baja confianza antes de publicar el texto extraído.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos totales suman menos de 300 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA; no se requiere A100 ni H100. Una RTX 4090 o una GPU de gama media son suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU si se usa CPU.
- Opciones de despliegue: `torch` + `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La model card indica cualitativamente que CTC es más rápido y AR más lento por su decodificación token a token.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de OCR que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- No se documentan los idiomas soportados; el rendimiento multilingüe es desconocido y podría estar sesgado hacia los idiomas presentes en un dataset no publicado.
- No se publican datos de entrenamiento ni evaluaciones, por lo que el riesgo de alucinación o de errores sistemáticos en dominios concretos no puede cuantificarse.
- Los reconocedores esperan recortes de líneas de texto rectas y en orientación vertical; no se documenta manejo de texto rotado o curvo más allá de lo que proporcione el detector.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisar el código antes de usarlo en producción.
- La model card advierte de problemas de entorno: la importación puede fallar con `operator torchvision::nms does not exist` si hay un `torchvision` incompatible, y el mensaje "Run pip install cv2" es engañoso (el paquete correcto es `opencv-python-headless`).
- Las versiones de dependencias indicadas (`torch==2.14.0`, `transformers==5.22.2`, `safetensors==0.8.0`, `numpy==2.2.6`, `pillow==12.3.0`, `opencv-python-headless==5.0.0.93`) son muy específicas y podrían no estar disponibles o no ser compatibles con otros entornos.
- Licencia Apache 2.0: permite uso comercial, pero al no haber información sobre la procedencia de los datos de entrenamiento no puede garantizarse la ausencia de sesgos o de contenido con derechos de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Yesianrohn/OpenOCRv2
- Guía de instalación de PyTorch: https://pytorch.org/get-started/locally/
