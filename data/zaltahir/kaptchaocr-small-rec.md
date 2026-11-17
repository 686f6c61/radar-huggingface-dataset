# zaltahir/kaptchaocr-small-rec

## Resumen

KaptchaOCR ft-small es un modelo de reconocimiento de texto (OCR) especializado en imágenes CAPTCHA, desarrollado por el usuario zaltahir dentro del proyecto KaptchaOCR. Se trata de uno de los cinco modelos afinados que componen la familia KaptchaOCR, y este repositorio contiene exclusivamente el reconocedor `small_rec.onnx` junto con su juego de caracteres `small_rec.json`. El modelo parte de PP-OCRv6 small de PaddleOCR y se ha ajustado para la tarea concreta de transcripción de CAPTCHA carácter a carácter.

La relevancia del modelo radica en su especialización: frente a un OCR genérico, está entrenado sobre 169.311 imágenes de CAPTCHA con 194.355 etiquetas (con sobremuestreo) y un vocabulario de 73 clases sensibles a mayúsculas y minúsculas, lo que le permite manejar las distorsiones, ruido y tipografías típicas de estos desafíos. Con un tamaño de solo 20 MB y una latencia media de 28 ms por imagen en CPU, está pensado para integrarse en pipelines ligeros de resolución de CAPTCHA dentro de la biblioteca y servidor Rust KaptchaOCR.

El modelo es de inferencia exclusiva: no incluye preprocesado ni decodificación CTC, que quedan a cargo del binario KaptchaOCR. Su licencia Apache-2.0 y su formato ONNX lo hacen desplegable con onnxruntime en entornos sin GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Reconocedor CTC basado en PP-OCRv6 small (CNN + decodificación CTC) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de altura 48 y anchura dinámica) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (vocabulario de 18.710 caracteres en `small_rec.json`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`small_rec.onnx`) + charset JSON (`small_rec.json`) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de texto con decodificación CTC derivado de PP-OCRv6 small, la familia de OCR de PaddleOCR. La entrada es una imagen RGB de altura fija 48 píxeles y anchura dinámica, y la salida es una secuencia de caracteres decodificada mediante CTC. El repositorio solo incluye el grafo ONNX de inferencia; el preprocesado de imagen y la decodificación CTC los realiza la biblioteca KaptchaOCR.

El ajuste fino se realizó sobre 169.311 imágenes de CAPTCHA con 194.355 etiquetas (aplicando sobremuestreo), con distinción entre mayúsculas y minúsculas y 73 clases efectivas, y se validó sobre 5.000 imágenes. El perfil declarado es `balanced`. El vocabulario completo del reconocedor contiene 18.710 caracteres según el fichero `small_rec.json`. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de texto en imágenes CAPTCHA mediante decodificación CTC, con salida de cadena completa sensible a mayúsculas y minúsculas.
- Manejo de imágenes con altura fija de 48 píxeles y anchura variable, lo que permite procesar CAPTCHA de proporciones diversas.
- Vocabulario amplio de 18.710 caracteres definido en el fichero de charset adjunto.
- Inferencia ligera en CPU mediante onnxruntime, con latencia media de 28 ms por imagen en un Intel i5-1145G7.
- Integración con el binario KaptchaOCR para el preprocesado de imagen, la decodificación CTC y la capa HTTP/servidor.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento.

## Casos de uso

- Resolución automatizada de CAPTCHA en pipelines de pruebas: el modelo transcribe desafíos de imagen a texto con una precisión global del 80,4% en exact match, adecuado para entornos de test controlados donde se conoce la fuente de las imágenes.
- Automatización de flujos de scraping ético y autorizado: integrado en el servidor KaptchaOCR, permite procesar lotes de CAPTCHA con 28 ms de latencia por imagen en CPU, sin necesidad de GPU.
- Clasificación y transcripción de imágenes de verificación en sistemas internos: el vocabulario de 18.710 caracteres y el entrenamiento sobre 73 clases cubren tipografías y distorsiones habituales en estos desafíos.
- Despliegue en entornos con recursos limitados: con 20 MB de pesos ONNX y ejecución en CPU, puede correr en servidores modestos o dispositivos edge mediante onnxruntime.
- Evaluación comparativa de reconocedores OCR especializados: el modelo sirve como referencia para medir exact match y precisión por carácter (93,0%) frente a OCR genéricos en tareas de CAPTCHA.
- Integración en herramientas de accesibilidad o auditoría: permite transcribir CAPTCHA de sistemas propios para verificar su robustez y detectar configuraciones débiles.

## Benchmarks y rendimiento

Evaluación sobre conjuntos de CAPTCHA reservados (held-out), 4.399 imágenes en total, con exact match de la cadena completa y distinción de mayúsculas y minúsculas. La latencia es la media en ms/imagen sobre un Intel i5-1145G7 en un solo proceso.

| Conjunto | Exact match |
|---|---:|
| atlas | 68% |
| birch | 95% |
| cobalt | 94% |
| dune | 61% |
| ember | 82% |
| fjord | 93% |
| **Global** | **80,4%** |

Precisión por carácter: 93,0%. Latencia media: 28 ms/imagen. El autor advierte que las imágenes de test están disjuntas de las de entrenamiento pero provienen de las mismas fuentes públicas, por lo que no constituye un benchmark fuera de distribución.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para ejecución en CPU con onnxruntime.
- GPU recomendadas: no se documentan; el modelo es lo suficientemente pequeño (20 MB) como para no requerir GPU.
- Compatibilidad con GPU de consumo: no se documenta, pero por tamaño cabría en cualquier GPU de consumo si se ejecuta mediante onnxruntime con proveedor CUDA.
- Opciones de despliegue: onnxruntime (librería declarada) y el binario KaptchaOCR (`kaptchaocr --ocr --manifest model/models.json --rec-model ft-small` o `kaptchaocr --ocr --ocr-path small_rec.onnx`).
- Latencia y throughput: 28 ms/imagen de media en un Intel i5-1145G7 en un solo proceso; no se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Base | Tamaño | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KaptchaOCR ft-small | PP-OCRv6 small | 20 MB | Altura 48, anchura dinámica | 80,4% exact match; 93,0% por carácter | Apache-2.0 | Hugging Face (ONNX) |
| PP-OCRv6 small (base) | — | no disponible | Altura 48, anchura dinámica | No disponible en la información proporcionada | Apache-2.0 | PaddleOCR |
| Otros modelos de la familia KaptchaOCR | PP-OCRv6 | no disponible | no disponible | No disponible en la información proporcionada | Apache-2.0 | Colección KaptchaOCR en Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento no puede completarse.

## Limitaciones y advertencias

- El benchmark no es fuera de distribución: las imágenes de test provienen de las mismas fuentes públicas que las de entrenamiento, por lo que el 80,4% de exact match puede sobreestimar el rendimiento en CAPTCHA de fuentes desconocidas.
- Rendimiento desigual entre conjuntos: exact match del 61% en `dune` frente al 95% en `birch`, lo que indica sensibilidad a la tipografía y distorsión de cada fuente.
- El modelo es de inferencia exclusiva: requiere el preprocesado y la decodificación CTC de KaptchaOCR, y el fichero de charset debe acompañar al modelo con el mismo nombre base.
- No se documentan sesgos conocidos ni riesgos específicos de alucinación, aunque al ser un modelo CTC la salida es una transcripción directa de la imagen.
- No se documentan los idiomas soportados; el vocabulario de 18.710 caracteres sugiere cobertura amplia, pero no se especifica.
- Uso comercial permitido por la licencia Apache-2.0, heredada de PP-OCRv6 small; conviene verificar las condiciones de la licencia base de PaddleOCR.
- El uso de resolución de CAPTCHA puede contravenir los términos de servicio de sitios de terceros; su empleo debe limitarse a sistemas propios, pruebas autorizadas o auditorías.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zaltahir/kaptchaocr-small-rec)
- [Repositorio GitHub de KaptchaOCR](https://github.com/ozalt/kaptchaocr)
- [Colección de modelos KaptchaOCR](https://huggingface.co/collections/zaltahir/kaptchaocr)
- [Página de benchmarks](https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md)
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)
