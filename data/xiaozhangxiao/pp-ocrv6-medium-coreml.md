# xiaozhangxiao/pp-ocrv6-medium-coreml

## Resumen

PP-OCRv6 Medium Core ML es una conversión a formato Core ML (FP16) de los dos modelos oficiales que componen la etapa media del sistema OCR PP-OCRv6 de PaddlePaddle: el detector de texto `PP-OCRv6_medium_det` y el reconocedor `PP-OCRv6_medium_rec`. El paquete lo publica el usuario `xiaozhangxiao`, no PaddlePaddle, e incluye los artefactos compilados `.mlmodelc` junto con el diccionario `characters.json` necesario para decodificar la salida CTC. Resuelve un problema muy concreto: ejecutar OCR de dos etapas de forma totalmente local en dispositivos Apple (iOS 17 o posterior) sin depender de servicios en la nube ni de frameworks de Python en tiempo de inferencia.

La relevancia es doble. Por un lado, PP-OCRv6 es la generación más reciente de la familia PaddleOCR, que rediseña el backbone, el cuello de detección y el cuello de reconocimiento en torno a un bloque unificado de estilo MetaFormer con reparameterización estructural; la colección oficial declara entre 1,5 y 34,5 millones de parámetros para toda la familia (tiny, small y medium), con la afirmación de superar en tareas OCR a modelos visión-lenguaje de escala de miles de millones. Por otro, esta conversión concreta lleva esa capacidad a la Neural Engine de iPhone, iPad y Mac, con un repositorio de solo 0,1 GB.

El modelo es una pieza de infraestructura, no un modelo generativo: no conversa, no razona y no admite tool calling. Se limita a localizar regiones de texto en una imagen y transcribir cada línea recortada en chino e inglés. La licencia Apache-2.0 del upstream se conserva, y el autor incluye el texto original en `models/PaddleOCR-LICENSE.txt`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas (detección + reconocimiento) derivado de PP-OCRv6, con bloques de estilo MetaFormer y reparameterización estructural; convertido a Core ML |
| Parametros totales | No disponible para la variante medium. La colección oficial PP-OCRv6 declara un rango de 1,5M a 34,5M de parámetros para las tres variantes (tiny, small, medium) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; no procesa secuencias de texto de entrada) |
| Tipos de cuantizacion | FP16 (pesos y cómputo interno). No se distribuyen otras precisiones en este repositorio |
| Idiomas soportados | Chino (`zh`) e inglés (`en`) |
| Licencia | Apache-2.0 (heredada del upstream de PaddlePaddle) |
| Formato de pesos | `.mlmodelc` (modelo Core ML compilado) en FP16, más `characters.json` y `model-manifest.json` |
| Entrada del detector | Tensor BGR Float32 de 1 x 3 x 1280 x 1280 (redimensionado con lado mayor 1280, preservando proporción y relleno de ceros) |
| Salida del detector | Mapa de probabilidad de texto Float32 de 1 x 1 x 1280 x 1280 |
| Entrada del reconocedor | Tensor BGR Float32 con altura 48 y anchuras admitidas de 320, 640, 960, 1280, 1920, 2560 y 3200 |
| Salida del reconocedor | Probabilidades de carácter CTC (índice en blanco 0, colapso de tokens repetidos) |
| Requisito de sistema | iOS 17 o posterior (destino declarado por el autor) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura de dos etapas clásica de PP-OCR. El detector recibe la imagen normalizada (media BGR `[0.485, 0.456, 0.406]`, desviación `[0.229, 0.224, 0.225]`) y rellenada a 1280 x 1280, y devuelve un mapa de probabilidad de texto de la misma resolución espacial; a partir de él se extraen las líneas recortando la imagen original orientada a resolución completa. El reconocedor toma cada recorte redimensionado a altura 48, con los valores BGR normalizados a `[-1, 1]` y relleno hasta una de las siete anchuras soportadas, y emite probabilidades CTC que se decodifican con `characters.json`.

La innovación técnica propia de esta conversión es la representación de las ocho convoluciones 9 x 9 del detector como cuatro teselas espaciales (5 x 5, 5 x 4, 4 x 5 y 4 x 4) seguidas de una suma. Según el autor, esto preserva la convolución matemática sin reentrenar, aunque el redondeo en FP16 puede alterar ligeramente las probabilidades de salida. El pipeline de conversión usó PyTorch 2.7.0, Transformers 5.20.2, coremltools 9.0 y el compilador de Core ML de Apple, partiendo de revisiones fijadas de los repositorios upstream (`4236c2b...` para detección y `024cad6...` para reconocimiento). El `model-manifest.json` generado registra versión, rutas, tamaños exactos y hashes SHA-256 tanto de los artefactos como de los pesos de origen.

No se dispone de información sobre el volumen de tokens, la composición del dataset de entrenamiento ni sobre si hubo etapas de RLHF o DPO; esos detalles corresponden al entrenamiento original de PP-OCRv6 y no se detallan en la información proporcionada. Tampoco se indica qué framebuffer de datos usó PaddlePaddle para la variante medium en concreto.

## Capacidades

- Detección de regiones de texto en imágenes mediante mapa de probabilidad a resolución 1280 x 1280, con reescalado proporcional para imágenes de entrada de cualquier tamaño.
- Reconocimiento de líneas de texto con decodificación CTC, sobre recortes de altura fija 48 y anchos entre 320 y 3200 píxeles.
- Cobertura de dos sistemas de escritura: chino e inglés, incluyendo mezcla de ambos en una misma línea.
- Funcionamiento totalmente local en el dispositivo mediante Core ML, con selección automática de unidad de cómputo (`MLComputeUnits.all`, que abarca Neural Engine, GPU y CPU).
- Extracción de texto a partir de imágenes orientadas: el pipeline recorta las líneas de la imagen original a resolución completa, no del mapa de probabilidad reducido.
- Integración nativa con el ecosistema Apple (Xcode, Vision, Core ML) sin dependencias de Python en producción.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo "thinking"; no es un modelo generativo ni un agente.
- No soporta visión general (descripción de imágenes, VQA) ni audio: la salida es exclusivamente texto transcrito y sus coordenadas derivadas del mapa de detección.

## Casos de uso

- Digitalización de documentos en apps iOS: una aplicación de notas o escáner puede capturar una foto, ejecutar el detector a 1280 x 1280, recortar cada línea y transcribirla en el propio dispositivo, sin enviar el documento a ningún servidor y sin coste por token.
- Escaneo de tickets y facturas: el pipeline de dos etapas separa la detección de la transcripción, de modo que se pueden descartar regiones no textuales (logotipos, códigos de barras) antes de invocar el reconocedor, ahorrando cómputo en lotes grandes de recibos.
- Señalética y menús en chino: al cubrir `zh` y `en`, resulta adecuado para apps de viaje o traducción que necesiten leer carteles, menús o etiquetas de producto en el dispositivo, con latencia independiente de la conectividad.
- Accesibilidad: lectura en voz alta de texto impreso (libros, correspondencia, prospectos) integrada en apps de asistencia, donde el requisito de funcionamiento offline y la privacidad del contenido son críticos.
- Logística y almacén: extracción de números de albarán, direcciones o referencias de etiquetas en apps de iPad/Mac ruggedizadas, usando el detector para localizar la zona de texto y el reconocedor para normalizar la cadena antes de validarla contra el sistema de gestión.
- Indexación de archivos escaneados en Mac: procesamiento por lotes de PDF e imágenes para generar un índice de texto buscable, distribuyendo la inferencia en la GPU o Neural Engine del equipo mediante `MLComputeUnits.all`.
- Onboarding y KYC en dispositivo: lectura de documentos de identidad con el recorte extraído de la imagen orientada a resolución completa, lo que permite manejar documentos girados sin reenviar la imagen original fuera del terminal.
- Preprocesado para pipelines de NLP: usar el modelo como extractor de texto previo a un modelo de lenguaje o a un clasificador de documentos, manteniendo la fase OCR completamente local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del repositorio no incluye métricas de precisión, latencia ni throughput, y la model card se limita a describir entradas, salidas y el proceso de conversión. La colección oficial de PP-OCRv6 menciona de forma cualitativa que la familia supera a modelos visión-lenguaje de escala de miles de millones en tareas OCR, pero no se aportan cifras concretas (ni MMLU, ni HumanEval, ni GSM8K, ni métricas OCR como precisión de detección o tasa de error de carácter) en el material consultado. Cualquier comparación numérica con otras variantes requeriría ejecutar la evaluación de forma local.

## Requisitos de hardware

- Plataforma: exclusivamente Core ML, con destino declarado iOS 17 o posterior; en la práctica también ejecutable en iPadOS 17+ y macOS 14+ a través de Core ML, aunque el autor solo cita iOS 17.
- Memoria: el repositorio completo ocupa 0,1 GB, por lo que los pesos caben holgadamente en la memoria unificada de cualquier iPhone o iPad compatible con iOS 17.
- Huella de los tensores: la entrada del detector (1 x 3 x 1280 x 1280 en Float32) ocupa aproximadamente 18,8 MiB y el mapa de salida 6,3 MiB; la entrada del reconocedor va de unos 184 KiB con anchura 320 hasta unos 1,8 MiB con anchura 3200.
- GPU recomendadas: no aplica el catálogo NVIDIA (A100, H100, RTX 4090); el modelo solo se ejecuta sobre silicio Apple. Para CUDA habría que usar los pesos PaddlePaddle originales o una conversión ONNX.
- Compatibilidad con GPU de consumo: sí, en el sentido de que cabe en cualquier Apple Silicon y en los SoC A-series desde el chip que admite iOS 17; no es desplegable en GPU de consumo x86 sin reconversión.
- Opciones de despliegue: Core ML directamente (Xcode, `MLModel`), framework Vision para pipelines de imagen, y `coremltools` para inspección o recompilación. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo OCR de este tipo.
- Latencia y throughput: no disponibles. El autor advierte explícitamente de que la colocación en dispositivos concretos y la latencia dependen del hardware y de la versión del sistema operativo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| PP-OCRv6 medium Core ML (esta ficha) | No disponible (familia 1,5M-34,5M) | Detección 1280 x 1280; reconocimiento altura 48, ancho 320-3200 | zh, en | `.mlmodelc` FP16 | Apache-2.0 | Conversión de terceros, 0 descargas y 0 likes en el momento de la consulta |
| PP-OCRv6 medium det/rec (PaddlePaddle, upstream) | No disponible | Idéntica | zh, en | safetensors | Apache-2.0 | Fuente oficial; requiere PaddlePaddle o conversión a otro runtime |
| PP-OCRv6 medium en ONNX (tutoriales de terceros) | No disponible | Idéntica | zh, en | ONNX | Apache-2.0 (upstream) | Pensado para ONNX Runtime en Python o C++; no usa Neural Engine |
| PP-OCRv6 tiny / small en Core ML (repo `rowan719/PP-OCRv6-models`) | No disponible (inferiores a medium dentro del rango 1,5M-34,5M) | Idéntica | zh, en | `.mlpackage` | No especificada en el resultado de búsqueda | Alternativa de menor coste computacional; el repositorio incluye tiny, small y medium con detección, reconocimiento y diccionarios |

No se dispone de datos de rendimiento comparado entre estas variantes en la información consultada, por lo que la elección entre medium, small y tiny solo puede hacerse por criterio de coste computacional o midiendo en el dispositivo objetivo.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio lo publica `xiaozhangxiao`, no PaddlePaddle. La procedencia de los pesos upstream está fijada por revisión y hash, pero el mantenimiento y el soporte dependen de un tercero.
- Precisión alterada por la conversión: el propio autor advierte de que el redondeo en FP16 puede cambiar las probabilidades del detector, y que la representación en teselas de las convoluciones 9 x 9 modifica la implementación aunque preserve la matemática.
- Sin benchmarks: no hay métricas publicadas de exactitud, latencia ni consumo, lo que impide estimar la degradación respecto al modelo original sin medirla.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento del registro; no hay evidencia de uso en producción.
- Idiomas limitados: solo chino e inglés. No cubre alfabetos latinos con diacríticos (castellano, francés, alemán), cirílico, árabe ni otras escrituras, salvo que el diccionario `characters.json` incluya caracteres adicionales, extremo que no se detalla.
- Restricción de anchura en reconocimiento: el reconocedor solo admite siete anchos (320 a 3200). Líneas muy largas o con relaciones de aspecto extremas requieren segmentación previa o risk de recorte.
- Dependencia de plataforma: requiere iOS 17 o posterior y Core ML; no es portable a servidores Linux ni a GPU NVIDIA sin reconvertir los pesos.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero obliga a conservar avisos de copyright y el texto de licencia; el repositorio incluye `models/PaddleOCR-LICENSE.txt` con ese fin.
- Riesgo de alucinación textual: como todo sistema CTC, puede producir transcripciones plausibles en regiones de bajo contraste, texto manuscrito o tipografías no vistas; sin umbral de confianza documentado, la validación posterior corre por cuenta de la aplicación.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no puede evaluarse el sesgo por tipo de letra, idioma, origen del documento ni calidad de imagen.
- Fechas del repositorio: la model card registra creación y actualización en octubre de 2026, dato que conviene verificar contra el estado real del repositorio antes de fijar una dependencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xiaozhangxiao/pp-ocrv6-medium-coreml
- Detector upstream (PaddlePaddle, safetensors): https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det_safetensors
- Reconocedor upstream (PaddlePaddle, safetensors): https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec_safetensors
- Modelo de reconocimiento oficial en HuggingFace: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_rec
- Colección oficial PP-OCRv6: https://huggingface.co/collections/PaddlePaddle/pp-ocrv6
- Conversiones Core ML de PP-OCRv6 (tiny, small, medium) por `rowan719`: https://github.com/rowan719/PP-OCRv6-models
- Tutorial de PP-OCRv6 Medium Recognition en ONNX: https://aiindigo.com/tutorials/getting-started-with-pp-ocrv6-medium-recognition-high-speed-text-extraction
- Tutorial de integración de PP-OCRv6 Medium Recognition: https://aiindigo.com/tutorials/getting-started-with-pp-ocrv6-medium-recognition-efficient-text-extraction
