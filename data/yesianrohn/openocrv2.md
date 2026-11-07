# Yesianrohn/openocrv2

## Resumen

OpenOCRv2 es una familia de tres modelos de visión por computador orientados a OCR (detección y reconocimiento de texto) publicada por Yesianrohn, investigador de máster en la Universidad de Fudan. El repositorio agrupa, en subcarpetas separadas, un detector de texto (`det/`), un reconocedor CTC (`rec_ctc/`) y un reconocedor autorregresivo (`rec_ar/`). Cada uno se puede cargar de forma independiente con `AutoModel.from_pretrained` y `trust_remote_code=True`, lo que permite descargar solo la pieza necesaria (36 MB, 85 MB o 141 MB respectivamente).

La propuesta resuelve el pipeline clásico de OCR en dos etapas (detección de regiones de texto y reconocimiento posterior) empaquetando ambos pasos con contratos de preprocesado explícitos y utilidades de recorte incluidas. Frente a soluciones monolíticas tipo VLM para OCR, apuesta por modelos ligeros (entre 9,36 M y 36,66 M de parámetros) desplegables con `torch` + `transformers` sin dependencias pesadas, lo que los hace adecuados para entornos con recursos limitados o para integrarse en pipelines existentes.

Es relevante ahora porque la model card menciona explícitamente que OpenOCRv2 busca mejorar el soporte multilingüe y la precisión out-of-the-box respecto a OpenOCR original. Aun así, la información publicada es escasa: no hay benchmarks, no se declaran idiomas soportados y el repositorio tiene cero descargas en el momento del análisis, lo que sugiere una publicación muy reciente o poco difundida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector: HGNetv2-b4 + DCNv2 + cabeza de regresión de polígonos. Reconocedores: ConvNeXt + encoder de texto con 2D-RoPE + cabeza CTC lineal (rec_ctc) o decoder autorregresivo con RoPE y KV cache (rec_ar) |
| Parametros totales | Det: 9,36 M; Rec CTC: 21,97 M; Rec AR: 36,66 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelos de visión; la longitud efectiva depende del tamaño de imagen y del batch lógico) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (alfabeto de 19.685/19.687 entradas incluido en `characters.json`, pero sin listado de idiomas) |
| Licencia | Apache-2.0 (código); pesos sujetos a los términos de distribución del proyecto |
| Formato de pesos | safetensors (`model.safetensors` por subcarpeta) |

## Arquitectura y entrenamiento

El detector `OpenOCRv2_Det` combina un backbone HGNetv2-b4 con convoluciones deformables DCNv2 y una cabeza que regresa polígonos de cuatro puntos (base de 14×28). El reconocedor comparte un encoder ConvNeXt con atención 2D-RoPE, y se ofrece en dos variantes: una CTC lineal (más rápida, predice directamente la secuencia) y una autorregresiva con decoder RoPE y KV cache (más lenta pero potencialmente más robusta en layouts fuera de vocabulario). El alfabeto de ~19.685 caracteres viene empaquetado en `characters.json` dentro de cada reconocedor, de modo que la decodificación no requiere recursos externos.

Los contratos de preprocesado están congelados junto con los pesos: detección con letterbox a 1600×1600, padding a cero y normalización ImageNet; reconocimiento con resize preservando aspecto sobre la escalera `[[64,64],[96,48],[112,40],[128,32]]` y normalización `(x/255 - 0.5)/0.5`. Cualquier desviación cambia la salida. El batch lógico (`batch_size`) determina el padding y, por tanto, afecta las predicciones; las cifras de precisión publicadas se obtuvieron con `batch_size=32`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Detección de texto en imágenes de escena y documentos, con devolución de polígonos y scores por región.
- Reconocimiento de texto en recortes ya preparados, con dos backends intercambiables (CTC y autorregresivo).
- Pipeline integrado `det.ocr(image, rec)` que detecta, rectifica y reconoce en una sola llamada, en orden de lectura.
- Utilidades de recorte expuestas (`polygon_to_quad`, `get_rotate_crop_image`) para reutilizar el preprocesado.
- Rotación automática de recortes con relación de aspecto vertical (>1,5× alto frente a ancho) para texto en vertical.
- Procesamiento por lotes con control separado de batch lógico y micro-batch (memoria frente a precisión).
- No se documentan tool calling, function calling, capacidades de agente, modo thinking, audio ni visión general más allá del OCR.

## Casos de uso

- Digitalización de documentos escaneados: el pipeline `det.ocr` procesa una página completa y devuelve líneas de texto en orden de lectura, adecuado para facturas, formularios y archivos administrativos con layouts variados.
- Extracción de texto en imágenes de escena: el detector de polígonos maneja texto inclinado y rotado, útil para señales, carteles y fotos de calle en tareas de accesibilidad o conducción asistida.
- Indexación de archivos PDF-imagen: al ser modelos ligeros (36–141 MB), se pueden ejecutar en CPU o GPU modestas para preprocesar grandes volúmenes antes de pasarlos a un buscador o a un LLM.
- OCR en dispositivos de borde: los 9,36 M parámetros del detector y los 21,97 M del CTC permiten despliegue en entornos con VRAM limitada, como lectores de documentos portátiles o quioscos.
- Preprocesado para RAG sobre documentos: extraer texto de capturas y escaneos antes de trocearlo y vectorizarlo, con confianza por región (`rec_score`) para filtrar fragmentos de baja calidad.
- Análisis de matrículas o rótulos en vídeo: con `rec.recognize(crops, batch_size=..., micro_batch_size=...)` se pueden procesar lotes de recortes por fotograma y agregar predicciones entre frames.
- Comparación de reconocedores en producción: cambiar `rec_ctc` por `rec_ar` con la misma llamada permite medir velocidad frente a robustez en layouts OOV sin reescribir el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de pesos, el detector (~36 MB) y el CTC (~85 MB) caben holgadamente en cualquier GPU consumer, y el AR (~141 MB) también.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB libres; A100/H100 no son necesarios para estos tamaños, aunque pueden acelerar el throughput en lote.
- Cabe en GPU consumer: sí, en prácticamente todas (RTX 3060, RTX 4090, etc.), y también en CPU para volúmenes moderados.
- Despliegue: `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no son modelos de lenguaje).
- Latencia y throughput: no disponibles; dependen del tamaño de imagen (letterbox 1600×1600 en detección) y del `batch_size`/`micro_batch_size` elegidos.
- Dependencias: `torch`, `transformers`, `safetensors`, `numpy`, `pillow`; `opencv-python-headless` solo para el paso de recorte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenOCRv2 (este) | 9,36 M / 21,97 M / 36,66 M | Imágenes, letterbox 1600×1600 | Apache-2.0 (código) | Hugging Face, repo propio |
| OpenOCR (original) | No disponible en la información | No disponible | No disponible | Proyecto OpenOCR |
| MMOCR (referencia de código) | No aplica (framework) | No disponible | Apache-2.0 | GitHub |
| Alternativas VLM de OCR | Decenas de miles de millones | Contexto de texto largo | Variables | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para OpenOCRv2 ni datos de rendimiento de OpenOCR original en la información proporcionada. La diferencia principal frente a VLMs de OCR es el tamaño (tres órdenes de magnitud menor) y la especialización en detección/reconocimiento en lugar de razonamiento sobre el texto.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia numérica de precisión frente a OpenOCR original ni frente a alternativas.
- Idiomas no declarados: el alfabeto de ~19.685 caracteres sugiere cobertura amplia, pero no se especifica qué idiomas ni su calidad; el propio autor reconoce en Reddit que el multilingüismo era una debilidad de OpenOCR original.
- Sensibilidad al preprocesado: cambiar el letterbox, la normalización o la escalera de resize degrada la salida de forma silenciosa.
- Sensibilidad al batch lógico: `batch_size` altera el padding y, por tanto, las predicciones; las cifras de precisión solo son válidas con `batch_size=32`.
- Riesgo de alucinación en el reconocedor autorregresivo: al ser generativo, puede producir texto plausible no presente en la imagen; el CTC es más conservador.
- Recortes verticales mal orientados devuelven texto incorrecto si no se rota 90°.
- Licencia de pesos ambigua: el código es Apache-2.0, pero los pesos se remiten a "los términos de distribución del proyecto", lo que exige verificación antes de uso comercial.
- Repositorio con cero descargas y cero likes: poca validación comunitaria y posible inestabilidad de la API `trust_remote_code`.
- El aviso `Run pip install cv2` de transformers es un falso positivo; debe instalarse `opencv-python-headless`.

## Enlaces

- Hugging Face: https://huggingface.co/Yesianrohn/openocrv2
- Página personal del autor: https://yesianrohn.github.io/
- GitHub del autor: https://github.com/YesianRohn/
- Hilo de presentación de OpenOCR en Reddit: https://www.reddit.com/r/computervision/comments/1jn8jx1/introducing_openocr_accurate_efficient_and_ready/
