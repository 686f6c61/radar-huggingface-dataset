# zaltahir/kaptchaocr-small-rec

## Resumen

KaptchaOCR ft-small es un modelo de reconocimiento de texto (OCR) especializado en imágenes CAPTCHA, desarrollado por el usuario zaltahir dentro del proyecto KaptchaOCR, una biblioteca y servidor de CAPTCHA escrito en Rust. El modelo es un fine-tuning del reconocedor PP-OCRv6 small de PaddleOCR y se distribuye únicamente como artefacto de inferencia en formato ONNX, junto con su fichero de charset de 18.710 caracteres. No es un modelo de lenguaje general: es un reconocedor CTC de imágenes que convierte recortes de CAPTCHA en cadenas de texto.

El modelo resuelve un problema muy concreto: la transcripción automática de CAPTCHAs con vocabulario cerrado (73 clases sensibles a mayúsculas/minúsculas) y una resolución de entrada específica (RGB, altura 48 píxeles, anchura dinámica). Su relevancia radica en que ofrece una alternativa ligera (20 MB) y de licencia permisiva (Apache-2.0) frente a soluciones como ddddocr, con un rendimiento medido de 80,4 % de exact match global y 93,0 % de precisión por carácter sobre 4.399 imágenes held-out.

Al ser un modelo de inferencia puro, no incluye capacidades de generación de lenguaje, tool calling ni razonamiento multi-paso. Toda la lógica de preprocesado, decodificación CTC y servicio HTTP recae en el binario KaptchaOCR, por lo que el modelo solo tiene sentido dentro de ese ecosistema o integrándolo manualmente mediante ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconocedor OCR basado en PP-OCRv6 small con cabeza CTC (fine-tuning) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen: RGB, altura 48, anchura dinámica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vocabulario cerrado de 73 clases) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`small_rec.onnx`), con charset JSON (`small_rec.json`) |

## Arquitectura y entrenamiento

El modelo parte de PP-OCRv6 small, el reconocedor de PaddleOCR, y se ha fine-tuneado como reconocedor de texto con decodificación CTC. La entrada es una imagen RGB normalizada a 48 píxeles de altura con anchura dinámica, y la salida es una secuencia de caracteres perteneciente a un charset de 18.710 entradas. El repositorio contiene exclusivamente el grafo ONNX de inferencia y el fichero JSON del charset; no se distribuyen pesos de entrenamiento ni código de preprocesado.

El entrenamiento se realizó sobre 169.311 imágenes CAPTCHA con 194.355 etiquetas (sobremuestreadas), sensibles a mayúsculas/minúsculas, cubriendo 73 clases, y se validó con 5.000 imágenes. El perfil declarado es `balanced`. No se especifican en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o regularización más allá del sobremuestreo de etiquetas. Tampoco se detalla si hubo etapas de RLHF o DPO, algo que en un modelo CTC de reconocimiento no resultaría habitual.

## Capacidades

- Reconocimiento de texto en imágenes CAPTCHA mediante decodificación CTC, con salida de cadena completa sensible a mayúsculas/minúsculas.
- Vocabulario cerrado de 73 clases y charset de 18.710 caracteres, adaptado a los conjuntos de CAPTCHA con los que se entrenó.
- Entrada de imagen RGB con altura fija de 48 píxeles y anchura variable, lo que permite procesar CAPTCHAs de distintas proporciones sin redimensionado forzado a cuadrado.
- Inferencia exclusiva: no genera lenguaje, no razona, no soporta tool calling ni function calling, y no dispone de modo thinking.
- No soporta agentes ni razonamiento multi-paso; es un componente único dentro de un pipeline de OCR.
- Capacidades multilingües no documentadas; el modelo está orientado a un vocabulario de CAPTCHA concreto, no a OCR general.
- No incluye visión general, audio ni otras modalidades más allá de la imagen de entrada.

## Casos de uso

- Automatización de pruebas end-to-end sobre formularios protegidos por CAPTCHA: el modelo permite resolver los retos en entornos de staging o QA controlados, integrándose en el binario KaptchaOCR con `kaptchaocr --ocr --manifest model/models.json --rec-model ft-small` para validar flujos de registro y login sin intervención manual.
- Extracción masiva de texto de datasets de CAPTCHA para investigación en seguridad: con 28 ms de latencia media por imagen en una CPU Intel i5-1145G7, permite procesar lotes de miles de imágenes en minutos y construir corpus etiquetados para estudiar robustez de CAPTCHAs.
- Benchmarking de mecanismos anti-bot: sirve como referencia de ataque para medir la resistencia de un esquema CAPTCHA propio frente a un OCR especializado con 80,4 % de exact match global.
- Componente de un servidor de resolución de CAPTCHA en Rust: al distribuirse como ONNX y estar pensado para el binario KaptchaOCR, se puede desplegar como servicio HTTP con el preprocesado y la decodificación CTC ya resueltos por la librería.
- Etiquetado asistido de imágenes CAPTCHA en pipelines de datos: las predicciones del modelo pueden usarse como pre-etiquetas para revisión humana, reduciendo el coste de anotación en conjuntos con las mismas 73 clases.
- Integración en herramientas de accesibilidad o automatización de escritorio: para transcripción de retos visuales en flujos internos donde el CAPTCHA es un obstáculo legítimo y se cuenta con autorización, aprovechando el tamaño reducido de 20 MB y la ausencia de dependencias de GPU.
- Filtrado y clasificación de imágenes en corpus web: el reconocedor puede aplicarse para detectar y descartar imágenes que contienen texto de tipo CAPTCHA en procesos de limpieza de datasets.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos held-out de CAPTCHA (4.399 imágenes en total). La métrica exact match exige coincidencia de la cadena completa y es sensible a mayúsculas/minúsculas. La latencia es la media en ms/imagen sobre un Intel i5-1145G7 en un solo proceso.

| Conjunto | Exact match |
|---|---:|
| archive1 | 68 % |
| archive2 | 95 % |
| archive3 | 94 % |
| hammer888 | 61 % |
| kaggle | 82 % |
| lcsd | 93 % |
| **Global** | **80,4 %** |

| Metrica | Valor |
|---|---:|
| Precisión por carácter | 93,0 % |
| Latencia media | 28 ms/imagen |
| Imágenes de evaluación | 4.399 |

El autor advierte que las imágenes de test son disjuntas a nivel de imagen respecto al entrenamiento, pero provienen de las mismas fuentes públicas, por lo que no constituye un benchmark fuera de distribución. Las tablas completas con los modelos de comparación (ddddocr y PP-OCRv6 base) están en la página de benchmarks del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo pesa 20 MB y está pensado para ejecución en CPU mediante ONNX Runtime.
- GPU recomendadas: no se especifican; al ser un modelo de 20 MB, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría ejecutarlo, pero el autor reporta latencias en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el benchmark oficial se realizó en una CPU Intel i5-1145G7.
- Opciones de despliegue: ONNX Runtime (librería declarada) y el binario KaptchaOCR (`kaptchaocr --ocr ...`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 28 ms/imagen de media en un solo proceso sobre Intel i5-1145G7; el throughput agregado no se ha publicado.

## Comparativa con modelos similares

| Modelo | Base | Tamaño | Tarea | Exact match (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KaptchaOCR ft-small | PP-OCRv6 small | 20 MB | Reconocimiento CTC de CAPTCHA | 80,4 % | Apache-2.0 | Hugging Face + GitHub |
| PP-OCRv6 base | PaddleOCR | no disponible | OCR general | no disponible en esta ficha (referenciado en la página de benchmarks) | Apache-2.0 | PaddleOCR |
| ddddocr | no disponible | no disponible | OCR/CAPTCHA | no disponible en esta ficha (referenciado en la página de benchmarks) | no disponible | Proyecto ddddocr |

Los resultados comparativos con ddddocr y PP-OCRv6 base están publicados en la página de benchmarks del repositorio, pero sus cifras concretas no se incluyen en la información disponible para esta ficha.

## Limitaciones y advertencias

- El benchmark no es fuera de distribución: las imágenes de test provienen de las mismas fuentes públicas que el entrenamiento, por lo que el 80,4 % global puede sobreestimar el rendimiento en CAPTCHAs de dominios nuevos.
- Rendimiento muy desigual entre conjuntos: 61 % en hammer888 y 68 % en archive1 frente a 95 % en archive2, lo que indica sensibilidad al estilo visual y a la tipografía del CAPTCHA.
- Vocabulario cerrado de 73 clases y charset de 18.710 caracteres: no es un OCR general y fallará con texto fuera de ese vocabulario o con alfabetos no contemplados.
- Sensible a mayúsculas/minúsculas, lo que puede penalizar en conjuntos donde el CAPTCHA no distingue casing o donde el ground truth es ambiguo.
- Modelo de inferencia exclusivamente: no incluye preprocesado ni decodificación CTC; requiere el binario KaptchaOCR o una implementación propia en ONNX Runtime, y el fichero `small_rec.json` debe colocarse junto al ONNX con el mismo nombre base.
- Riesgo de alucinación en sentido OCR: puede producir cadenas plausibles pero incorrectas en imágenes degradadas, con 93,0 % de precisión por carácter, es decir, aproximadamente 7 caracteres erróneos por cada 100.
- Uso comercial permitido por Apache-2.0, pero el uso de un resolutor de CAPTCHA contra servicios de terceros puede infringir sus términos de servicio o la legislación aplicable; la licencia del modelo no cubre ese riesgo legal.
- No se documentan sesgos, idiomas soportados ni comportamiento ético; la ausencia de información no implica ausencia de limitaciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de los resultados publicados.

## Enlaces

- [Hugging Face: zaltahir/kaptchaocr-small-rec](https://huggingface.co/zaltahir/kaptchaocr-small-rec)
- [GitHub: ozalt/kaptchaocr](https://github.com/ozalt/kaptchaocr)
- [Colección de todos los modelos KaptchaOCR](https://huggingface.co/collections/zaltahir/kaptchaocr)
- [Página de benchmarks](https://github.com/ozalt/kaptchaocr/blob/main/benchmarks/README.md)
- [PaddleOCR (modelo base PP-OCRv6)](https://github.com/PaddlePaddle/PaddleOCR)
