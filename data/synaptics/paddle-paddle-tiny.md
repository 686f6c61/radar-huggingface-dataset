# Synaptics/paddle-paddle-tiny

## Resumen

PP-OCRv6-tiny es un sistema de reconocimiento óptico de caracteres (OCR) desarrollado por Synaptics, compilado específicamente para su unidad de procesamiento neuronal (NPU) Torq, integrada en el chip SL2619. El modelo combina dos etapas: detección de texto mediante DBNet y reconocimiento mediante CTC, ambas ejecutándose íntegramente en el NPU. Está diseñado para el demo `ppocr` del repositorio `torq-examples` y se distribuye bajo licencia Apache 2.0.

El modelo está pensado para aplicaciones de OCR en el borde (edge AI), donde la inferencia debe realizarse en hardware de bajo consumo sin depender de la nube. Su diccionario de reconocimiento cubre chino e inglés (6.904 caracteres), lo que permite decodificar texto latino, dígitos y puntuación de forma nativa, aunque no soporta japonés, coreano, cirílico ni árabe. El repositorio incluye múltiples variantes compiladas para diferentes resoluciones de entrada y anchos de línea, optimizando el rendimiento según el contenido.

La relevancia actual de este modelo radica en su enfoque práctico para despliegue en hardware dedicado: ofrece tiempos de inferencia medidos en el SL2619 (detección ~0,53 s y reconocimiento ~1,19 s para 10 líneas) y una integración sencilla con el ecosistema de ejemplos de Synaptics. Es una opción a considerar para desarrolladores que trabajen con la plataforma Astra Machina o Machina Micro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DBNet (deteccion) + CTC (reconocimiento) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision/OCR) |
| Tipos de cuantizacion | bf16 (segun nombres de archivo .vmfb) |
| Idiomas soportados | Chino e ingles (diccionario de 6.904 caracteres) |
| Licencia | Apache 2.0 |
| Formato de pesos | vmfb (compilado para NPU Torq), onnx (referencia CPU) |

## Arquitectura y entrenamiento

El modelo implementa un pipeline OCR clasico de dos etapas. La primera etapa utiliza DBNet (Differentiable Binarization Network) para la deteccion de regiones de texto, con un backbone de stride 32 que requiere dimensiones de entrada multiplos de 32. Se ofrecen dos resoluciones estaticas: 800×608 (por defecto, orientada a documentos verticales) y 640×352 (para fuentes panoramicas 16:9, con padding en lugar de recorte). La segunda etapa emplea un reconocedor CTC (Connectionist Temporal Classification) que procesa lineas de texto individuales, con cuatro buckets de ancho fijo (320, 640, 1280 y 2432 pixeles) para adaptarse a la longitud de cada linea detectada.

No se dispone de informacion sobre el proceso de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. El modelo se distribuye ya compilado para el NPU Torq, con archivos .vmfb que contienen los grafos optimizados, junto con versiones .onnx en fp32 como referencia para verificacion de precision en CPU. La compilacion para NPU implica que los pesos estan cuantizados a bf16, aunque no se especifica el metodo de cuantizacion utilizado.

## Capacidades

- Deteccion de texto en imagenes: localiza cajas delimitadoras de regiones de texto mediante DBNet, con dos resoluciones de entrada configurables.
- Reconocimiento de caracteres: transcribe el texto detectado usando un modelo CTC con diccionario chino-ingles (6.904 caracteres).
- Soporte multilingue limitado: cubre latin, digitos y puntuacion; no cubre japones, coreano, cirilico ni arabe.
- Procesamiento por lotes de lineas: cada linea detectada se enruta al bucket de ancho mas estrecho que la contenga, minimizando el padding y optimizando el tiempo de inferencia.
- Ejecucion en NPU: ambas etapas corren en el NPU Torq del SL2619, sin necesidad de GPU externa.
- Intercambio de backend: permite ejecutar cada etapa con ONNX Runtime en CPU para comparar resultados contra la referencia fp32.
- Integracion con torq-examples: incluye un demo listo para usar (`ppocr`) con script de inferencia y ejemplo de imagen.

## Casos de uso

- Digitalizacion de documentos en el borde: el modelo puede extraer texto de fotografias de documentos, facturas o tarjetas de visita directamente en un dispositivo con NPU SL2619, sin conexion a internet. Su deteccion a 800×608 es adecuada para documentos verticales.
- Lectura de menus y cartas: el ejemplo incluido (`sample.jpg`) es un menu de cafeteria; el modelo reconoce lineas de texto con confianza ≥ 0,966, lo que lo hace util para aplicaciones de traduccion o asistencia en restaurantes.
- Procesamiento de imagenes panoramicas: la variante de deteccion 640×352 esta pensada para fuentes 16:9, como capturas de pantalla o video, donde el texto aparece en formato apaisado.
- Automatizacion de entrada de datos: extraer texto de formularios escaneados o fotografias para alimentar sistemas de gestion documental, aprovechando el diccionario chino-ingles para entornos bilingues.
- Verificacion de calidad en produccion: el modelo puede integrarse en lineas de inspeccion visual para leer codigos, etiquetas o numeros de serie en productos, gracias a su baja latencia en NPU.
- Desarrollo de prototipos con torq-examples: los desarrolladores pueden clonar el repositorio, ejecutar el demo y adaptarlo a sus propias imagenes, usando los archivos ONNX como referencia para validar la precision del NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, el autor proporciona mediciones de rendimiento en el hardware objetivo (SL2619) para la imagen de ejemplo `sample.jpg` (912×1200, 10 lineas de texto):

| Etapa | Tiempo |
|---|---|
| Deteccion (800×608) | ~0,53 s |
| Reconocimiento (10 lineas, con buckets) | ~1,19 s |
| Total extremo a extremo | ~1,7 s |

El reconocimiento escala linealmente con el numero de lineas detectadas, ya que cada linea es una invocacion separada con batch estatico de 1. Una pagina densa con 99 lineas tarda aproximadamente 22 s. La confianza minima reportada en el ejemplo es 0,966.

## Requisitos de hardware

- NPU requerido: Synaptics Torq, integrado en el chip SL2619 (serie Astra). Los archivos .vmfb estan compilados especificamente para este hardware.
- Alternativa CPU: los archivos .onnx (fp32) pueden ejecutarse con ONNX Runtime en cualquier CPU, aunque sin aceleracion NPU.
- VRAM: no aplica, al ser un modelo para NPU embebido; no se especifica memoria interna.
- GPU: no compatible directamente; los .vmfb no son ejecutables en GPU.
- Opciones de despliegue: el flujo recomendado es mediante el repositorio `torq-examples` (script `infer.py`), con opcion de cambiar el backend a ONNX Runtime.
- Latencia: ~1,7 s extremo a extremo para 10 lineas en SL2619; el tiempo de reconocimiento depende del numero de lineas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos OCR de la misma categoria (por ejemplo, PaddleOCR original, Tesseract o EasyOCR) en terminos de parametros, contexto o rendimiento. El modelo esta fuertemente especializado para el hardware NPU de Synaptics, lo que limita la comparacion directa con soluciones genericas. Se indica "no disponible".

## Limitaciones y advertencias

- Diccionario limitado: solo cubre chino e ingles (6.904 caracteres). Texto en japones, coreano, cirilico o arabe no se reconocera correctamente.
- Entradas estaticas: la deteccion requiere dimensiones multiplos de 32 y se ofrecen solo dos resoluciones fijas; el reconocimiento usa anchos fijos por bucket. Imagenes con proporciones muy diferentes pueden llegar distorsionadas al modelo (el preprocesado redimensiona sin preservar la relacion de aspecto).
- Rendimiento dependiente del contenido: el tiempo de reconocimiento crece linealmente con el numero de lineas; paginas densas pueden tardar decenas de segundos.
- Hardware especifico: los archivos .vmfb solo funcionan en el NPU Torq (SL2619); no son portables a otras plataformas sin recompilacion.
- Sin informacion sobre sesgos: no se han documentado sesgos potenciales del modelo, aunque al estar entrenado principalmente con datos chinos e ingleses, puede presentar sesgos hacia esos idiomas y escrituras.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos completos de la licencia y las dependencias (PaddleOCR, etc.) para cumplir con sus respectivas condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synaptics/paddle-paddle-tiny
- Repositorio de ejemplos Torq: https://github.com/synaptics-torq/torq-examples
- Pagina de modelos de Synaptics: https://developer.synaptics.com/models
- Repositorio de ejemplos SyNAP (serie Astra SL16xx): https://github.com/synaptics-synap/examples
