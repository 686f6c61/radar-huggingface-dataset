# zaltahir/kaptchaocr-medium-rec

## Resumen

KaptchaOCR ft-medium es un modelo de reconocimiento de texto (OCR) especializado en CAPTCHAs, desarrollado por el usuario zaltahir dentro del proyecto KaptchaOCR, una biblioteca y servidor de CAPTCHA escrito en Rust. El modelo es un fine-tuning del reconocedor PP-OCRv6 medium de PaddleOCR y se distribuye exclusivamente en formato ONNX para su ejecución con onnxruntime. Resuelve el problema concreto de transcribir cadenas de texto en imágenes CAPTCHA con distorsiones, ruido y tipografías variables, un dominio donde los OCR genéricos rinden por debajo de lo aceptable.

El modelo emplea una arquitectura CTC (Connectionist Temporal Classification) sobre un backbone heredado de PP-OCRv6, con entrada RGB de altura fija 48 píxeles y anchura dinámica. Se entrenó sobre 169.311 imágenes CAPTCHA con 194.355 etiquetas (con sobremuestreo), sensibles a mayúsculas y minúsculas, y un conjunto de validación de 5.000 imágenes. El repositorio solo contiene el reconocedor (`medium_rec.onnx`, 73 MB) y su juego de caracteres (`medium_rec.json`, 18.710 caracteres); el preprocesado, la decodificación CTC y la capa HTTP los gestiona el binario KaptchaOCR.

Es relevante para desarrolladores que necesiten integrar resolución automática de CAPTCHAs en pipelines de automatización o testing, o como componente de referencia para evaluar reconocedores OCR en dominios ruidosos. Su licencia Apache-2.0 y su formato ONNX lo hacen desplegable sin dependencias de Python ni de PaddlePaddle en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre backbone PP-OCRv6 medium (reconocedor de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, anchura de imagen dinámica) |
| Tipos de cuantizacion | no disponible (se distribuye un único ONNX de 73 MB) |
| Idiomas soportados | no disponible (conjunto de 18.710 caracteres, sin desglose por idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`medium_rec.onnx`) + charset JSON (`medium_rec.json`) |

## Arquitectura y entrenamiento

El modelo es un reconocedor de texto basado en CTC, derivado del modelo PP-OCRv6 medium de PaddleOCR. La entrada es una imagen RGB de altura fija 48 píxeles y anchura dinámica, lo que permite procesar CAPTCHAs de proporciones variables sin redimensionado forzado a un cuadrado. La salida se decodifica mediante CTC, lo que evita la necesidad de segmentar caracteres individualmente, algo crítico en CAPTCHAs con solapamiento o distorsión. El vocabulario de salida cubre 18.710 caracteres definidos en `medium_rec.json`.

El fine-tuning se realizó sobre 169.311 imágenes CAPTCHA con 194.355 etiquetas (sobremuestreo para equilibrar clases), con distinción entre mayúsculas y minúsculas y 73 clases efectivas. La validación se hizo sobre 5.000 imágenes. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a un modelo CTC de OCR). El modelo es solo de inferencia: el preprocesado, la decodificación CTC y el servido HTTP los implementa el binario KaptchaOCR en Rust.

## Capacidades

- Reconocimiento de texto en imágenes CAPTCHA con distorsión, ruido y tipografías variables.
- Salida sensible a mayúsculas y minúsculas (exact match case-sensitive en la evaluación).
- Procesamiento de imágenes de anchura dinámica con altura fija de 48 píxeles.
- Decodificación CTC sin segmentación explícita de caracteres.
- Integración con el binario KaptchaOCR vía manifiesto (`models.json`) o ruta directa al ONNX.
- Ejecución mediante onnxruntime, sin dependencia de PaddlePaddle ni de Python en producción.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o visión general más allá del OCR de texto.

## Casos de uso

- Resolución automática de CAPTCHAs en pipelines de testing: el modelo transcribe CAPTCHAs generados por el propio servidor KaptchaOCR o por generadores compatibles, permitiendo automatizar pruebas end-to-end de formularios y flujos de registro sin intervención manual.
- Automatización de scraping controlado: en escenarios donde el scraping está permitido por los términos del sitio, el modelo resuelve CAPTCHAs de texto de forma local (69 ms/imagen en CPU) sin depender de servicios externos de resolución.
- Benchmarking de reconocedores OCR: sirve como referencia especializada para comparar el rendimiento de OCRs genéricos (ddddocr, PP-OCRv6 base) en dominios ruidosos, tal como documenta la página de benchmarks del proyecto.
- Componente embebido en aplicaciones Rust: al ser un ONNX de 73 MB y ejecutarse con onnxruntime, se integra en binarios Rust sin runtime de Python, adecuado para herramientas de escritorio o CLI distribuidas.
- Monitorización de calidad de generadores de CAPTCHA: un generador puede usar este reconocedor para medir la dificultad efectiva de sus CAPTCHAs (tasa de acierto del modelo como proxy de robustez).
- Procesamiento por lotes de imágenes de texto corto: aunque entrenado en CAPTCHAs, el reconocedor CTC puede aplicarse a imágenes de texto corto con condiciones similares (etiquetas, códigos, seriales) siempre que los caracteres estén en el charset de 18.710 entradas.

## Benchmarks y rendimiento

Evaluación sobre conjuntos CAPTCHA held-out (4.399 imágenes en total), exact match de la cadena completa, sensible a mayúsculas y minúsculas. Latencia media por imagen medida en un Intel i5-1145G7, proceso único.

| Conjunto | Exact match |
|---|---:|
| archive1 | 82% |
| archive2 | 98% |
| archive3 | 99% |
| hammer888 | 74% |
| kaggle | 97% |
| lcsd | 100% |
| **Global** | **90,7%** |

Precisión por carácter: 96,0%. Latencia media: 69 ms/imagen. Los conjuntos de test son disjuntos en imagen respecto al entrenamiento pero provienen de las mismas fuentes públicas, por lo que no constituyen un benchmark fuera de distribución. La comparación con ddddocr y PP-OCRv6 base está en la página de benchmarks del repositorio de GitHub, no en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es un ONNX de 73 MB y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre es suficiente, aunque la inferencia en CPU es viable (69 ms/imagen en un i5-1145G7).
- Cabe en GPU de consumo: sí, cualquier GPU consumer moderna (GTX 1050 en adelante) por el reducido tamaño del modelo.
- Opciones de despliegue: onnxruntime (CPU o GPU) y el binario KaptchaOCR (`kaptchaocr --ocr --ocr-path medium_rec.onnx`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 69 ms/imagen de media en CPU (i5-1145G7, proceso único). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tamaño | Contexto/entrada | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|---|
| KaptchaOCR ft-medium | PP-OCRv6 medium | 73 MB (ONNX) | Altura 48, anchura dinámica | 90,7% exact, 96,0% char | Apache-2.0 | ONNX |
| PP-OCRv6 base | PaddleOCR | no disponible | no disponible | Comparativa en benchmarks del repo | Apache-2.0 | Paddle / ONNX |
| ddddocr | no disponible | no disponible | no disponible | Comparativa en benchmarks del repo | no disponible | ONNX |

Los datos de rendimiento de PP-OCRv6 base y ddddocr no se detallan en la información proporcionada; la model card remite a la página de benchmarks del repositorio de GitHub para las tablas completas.

## Limitaciones y advertencias

- El benchmark no es fuera de distribución: las imágenes de test son disjuntas en imagen pero provienen de las mismas fuentes públicas que el entrenamiento, por lo que el 90,7% global puede sobreestimar el rendimiento en CAPTCHAs de generadores no vistos.
- El rendimiento cae notablemente en el conjunto `hammer888` (74% exact), lo que indica sensibilidad a estilos de CAPTCHA concretos.
- El modelo es solo de inferencia: requiere el preprocesado y la decodificación CTC del binario KaptchaOCR; no funciona como un pipeline autónomo de imagen a texto sin ese componente.
- El charset de 18.710 caracteres no está desglosado por idioma; no se garantiza cobertura de scripts no presentes en los datos de entrenamiento.
- Riesgo de alucinación en el sentido de transcripciones incorrectas cuando la imagen es ambigua o el estilo se aleja del dominio de entrenamiento; el exact match case-sensitive amplifica este efecto.
- Uso comercial permitido por Apache-2.0, pero el uso de resolución de CAPTCHAs puede infringir los términos de servicio de sitios de terceros; la licencia del modelo no otorga derechos sobre esos servicios.
- No se incluyen pesos de ddddocr en el repositorio; cualquier comparación con ese modelo requiere descargarlo por separado.
- Sin datos publicados sobre sesgos demográficos, robustez ante ataques adversariales ni comportamiento con imágenes de muy baja resolución.

## Enlaces

- Hugging Face: https://huggingface.co/zaltahir/kaptchaocr-medium-rec
- Colección de todos los modelos KaptchaOCR: https://huggingface.co/collections/zaltahir/kaptchaocr
- Repositorio GitHub del proyecto: https://github.com/ozalt/kaptchaocr
- Página de benchmarks: https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md
- PaddleOCR (modelo base PP-OCRv6): https://github.com/PaddlePaddle/PaddleOCR
