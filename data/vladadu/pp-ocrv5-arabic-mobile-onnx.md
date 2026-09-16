# vladadu/pp-ocrv5-arabic-mobile-onnx

## Resumen

Este repositorio contiene dos exportaciones ONNX derivadas de modelos de la familia PaddleOCR PP-OCRv5: el detector de texto `PP-OCRv5_mobile_det` y el reconocedor árabe `arabic_PP-OCRv5_mobile_rec`. No es un lanzamiento original de PaddlePaddle, sino una conversión realizada por el usuario vladadu con `paddle2onnx==2.1.0` y opset 17, pensada para ejecutarse con ONNX Runtime.

El objetivo declarado es el OCR selectivo en el dispositivo dentro del SDK Android de RealTyme. Los artefactos son muy ligeros: el detector ocupa 4.766.440 bytes y el reconocedor 7.994.035 bytes, de modo que el sistema completo cabe en unos 12,8 MB y puede ejecutarse en hardware móvil sin GPU dedicada ni servicios en la nube. Se incluye además el diccionario del reconocedor (`arabic_PP-OCRv5_mobile_rec_dict.txt`, 2.369 bytes) y los hashes SHA-256 de los tres ficheros.

Su relevancia es acotada: cubre un nicho concreto (OCR de árabe en dispositivos con recursos limitados) y sirve como alternativa práctica a desplegar PaddlePaddle completo en Android. Hay que tener en cuenta que el repositorio no incluye evaluación, benchmarks ni documentación de precisión, y que en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que se trata de un artefacto sin validación pública por parte de terceros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card. Familia PP-OCRv5 mobile: detector de texto basado en segmentación y reconocedor con cabeza de decodificación CTC, según la documentación pública de PaddleOCR |
| Parametros totales | No disponible de forma oficial. Estimación a partir del tamaño de los ficheros ONNX en fp32: ~1,2 M (detector) y ~2,0 M (reconocedor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo OCR). Longitud máxima de secuencia del reconocedor: no disponible |
| Tipos de cuantizacion | No disponible. Los artefactos publicados son exportaciones ONNX sin cuantización declarada |
| Idiomas soportados | Árabe (reconocedor). El detector es independiente del idioma. El campo de idiomas de la ficha de HuggingFace está vacío |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, opset 17 |
| Autor | vladadu |
| Libreria | onnx |
| Pipeline declarado | No disponible |
| Clases del reconocedor | 749 (blank + 747 caracteres del diccionario + espacio, con `use_space_char=True` de PaddleX) |
| Herramienta de conversion | paddle2onnx 2.1.0 |
| Componentes incluidos | Detector, reconocedor y diccionario. No se incluye modelo de clasificación de ángulo de texto |
| Tamano del repositorio | 0,0 GB (los tres ficheros suman ~12,8 MB) |
| Fecha de creacion / actualizacion | 2026-09-16 (ambas marcas temporales idénticas) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los dos modelos. Se trata de exportaciones derivadas de `PaddlePaddle/PP-OCRv5_mobile_det` (commit `0d63e78e2b680928f6b1747d76a08db6e645efb7`) y `PaddlePaddle/arabic_PP-OCRv5_mobile_rec` (commit `33d91636a65dca87f5562cc48860332ae367ee1b`). En la familia PP-OCR, el detector produce mapas de probabilidad de texto a partir de los cuales se extraen las cajas, y el reconocedor consume cada región recortada y la decodifica carácter a carácter. Cualquier detalle adicional sobre capas, backbones o mecanismos de atención debe consultarse en la documentación de PaddleOCR, no en este repositorio.

Tampoco hay información sobre el entrenamiento: no se especifican el número de tokens o imágenes, la composición del dataset, ni si hubo ajuste por RLHF o DPO, algo por otra parte poco habitual en modelos OCR. La única innovación técnica documentada es el propio proceso de conversión: exportación a ONNX con `paddle2onnx` 2.1.0 y opset 17, lo que permite ejecutar los modelos con ONNX Runtime en lugar de con el runtime de PaddlePaddle. Los hashes SHA-256 publicados permiten verificar la integridad de los tres artefactos.

## Capacidades

- Detección de regiones de texto en imágenes: el componente `PP-OCRv5_mobile_det` localiza las cajas de texto; es independiente del idioma y del alfabeto.
- Reconocimiento de texto en árabe: el componente `arabic_PP-OCRv5_mobile_rec` transcribe las regiones detectadas usando un diccionario de 747 caracteres más el token blank y el espacio.
- Ejecución en dispositivo: ambos modelos están exportados a ONNX y pueden ejecutarse con ONNX Runtime, incluida la variante móvil, sin conexión a red.
- OCR selectivo: el uso previsto es aplicar detección y reconocimiento solo sobre las regiones de interés, no sobre la imagen completa.
- Tool calling / function calling: no disponible; no es una capacidad de este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no aplica.
- Capacidades multilingües: limitadas al árabe en el reconocedor; el detector no está ligado a ningún idioma.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles. La única entrada es la imagen de texto.
- Clasificación de orientación del texto: no incluida; no se distribuye el modelo de clasificación de ángulo.

## Casos de uso

- Digitalización de documentos árabes en Android: integrar ambos modelos en una aplicación móvil que capture fotografías de formularios, facturas o contratos en árabe y extraiga el texto localmente, sin enviar imágenes a un servidor.
- Escaneo de recibos y tickets en comercios de países arabófonos: el detector localiza las líneas de texto y el reconocedor las transcribe para alimentar un sistema de contabilidad; el tamaño conjunto (~12,8 MB) permite incluirlo en el APK sin penalizar la descarga.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de carteles, menús o etiquetas en árabe capturados con la cámara del teléfono, con latencia baja al no depender de la red.
- Traducción asistida en viajes: pipeline OCR en el dispositivo seguido de un modelo de traducción local o remoto, útil en entornos con conectividad intermitente.
- Digitalización de archivos históricos o administrativos: procesamiento por lotes en servidor con ONNX Runtime sobre CPU, extrayendo texto de imágenes escaneadas para su indexación posterior en un buscador.
- Verificación de identidad y KYC: extracción de campos de documentos de identidad en árabe como paso previo a la validación manual, reduciendo el trabajo de tecleo.
- Automatización de procesos internos (RPA): lectura de pantallas o documentos escaneados dentro de un flujo documental, donde el OCR selectivo evita procesar regiones irrelevantes y ahorra cómputo.
- Preprocesado para sistemas de traducción automática: generación de transcripciones en árabe que después se normalizan y traducen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de precisión de detección (por ejemplo, H-mean o F-score), de reconocimiento (tasa de acierto de caracteres o de palabras), ni comparaciones con otros sistemas OCR. Tampoco se documentan latencias ni throughput medidos en Android o en CPU de servidor.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier configuración razonable. Los tres ficheros suman aproximadamente 12,8 MB, por lo que el modelo activo ocupa unas pocas decenas de megabytes contando activaciones intermedias.
- GPU recomendadas: no se requiere GPU. Funciona en CPU. Cualquier GPU moderna (GTX 1050 o superior, RTX 4090, A100, H100) puede ejecutarlo, pero la aceleración obtenida será marginal dado el tamaño del modelo.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo e incluso sin GPU. Es un caso de uso nativo de CPU o de SoC móvil con aceleración NPU/GPU integrada.
- Opciones de despliegue: ONNX Runtime (escritorio, servidor y Android), ONNX Runtime Mobile, y desde PaddlePaddle mediante los modelos originales de PP-OCRv5. La conversión a otros formatos (TFLite, NCNN, Core ML) es posible pero no está documentada ni verificada en este repositorio. Requiere ONNX Runtime con soporte de opset 17.
- Latencia y throughput: no disponibles. Dependerán del hardware, de la resolución de entrada y del número de regiones de texto detectadas.
- Almacenamiento: aproximadamente 12,8 MB para los tres ficheros, más el tamaño del runtime de ONNX Runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vladadu/pp-ocrv5-arabic-mobile-onnx | ~1,2 M + ~2,0 M (estimado) | No aplica | Árabe (rec) | Apache-2.0 | ONNX (opset 17) | Repositorio con 0 descargas, sin evaluación |
| PaddlePaddle/arabic_PP-OCRv5_mobile_rec + PP-OCRv5_mobile_det | No disponible | No aplica | Árabe (rec) | Apache-2.0 | PaddlePaddle (inferencia) | Modelos oficiales de origen, mantenidos por PaddlePaddle |
| Tesseract OCR (modelo árabe) | No disponible | No aplica | Árabe y otros | Apache-2.0 | Ficheros `traineddata`, no ONNX | Proyecto maduro y ampliamente desplegado |
| EasyOCR (árabe) | No disponible | No aplica | Árabe y otros | Apache-2.0 | PyTorch | Librería consolidada, requiere Python |

La comparación cuantitativa de precisión no es posible: este repositorio no publica métricas y no se dispone en la información proporcionada de resultados de Tesseract o EasyOCR sobre el mismo conjunto de evaluación. Como referencia estructural, las alternativas citadas son marcos completos con más dependencias, mientras que esta exportación ofrece únicamente los dos grafos ONNX y el diccionario.

## Limitaciones y advertencias

- Artefacto sin validación pública: 0 descargas, 0 likes y ninguna evaluación de precisión publicada. No hay evidencia de terceros sobre su comportamiento en producción.
- Exportación derivada no oficial: el autor indica explícitamente que no son lanzamientos originales de PaddlePaddle. Pequeñas diferencias de conversión pueden alterar ligeramente el resultado respecto a los modelos de origen.
- Sin modelo de clasificación de ángulo: solo se distribuyen detector y reconocedor, por lo que el texto rotado 180° o en orientaciones no estándar puede no reconocerse correctamente.
- Cobertura léxica cerrada: el reconocedor tiene 749 clases (blank, 747 caracteres del diccionario y espacio). Los caracteres ausentes del diccionario no pueden emitirse y se sustituirán por el carácter más probable del conjunto disponible.
- Riesgo de alucinación típico de OCR: en regiones de bajo contraste o con ruido, el detector puede proponer cajas sobre zonas sin texto y el reconocedor devolver cadenas plausibles pero inexistentes. Conviene aplicar umbrales de confianza y validación posterior.
- Idiomas: el reconocedor es específico de árabe. No se ha documentado su comportamiento con texto árabe dialectal, con diacríticos completos ni con mezcla de árabe y caracteres latinos.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento original, por lo que se desconoce el sesgo respecto a tipografías, soportes (manuscrito frente a impreso) o dominios concretos.
- Licencia: Apache-2.0, heredada de los modelos de PaddlePaddle, permite uso comercial. Aun así, conviene verificar los términos de los modelos de origen y de las dependencias de PaddleOCR antes de un despliegue comercial.
- Dependencia del runtime: al usar opset 17, se necesita una versión de ONNX Runtime que lo soporte; versiones antiguas fallarán al cargar el grafo.
- Metadatos anómalos: las fechas de creación y actualización (16 de septiembre de 2026) son idénticas y posteriores a la fecha habitual de publicación, lo que sugiere un uso no convencional de la plataforma.
- Advertencia sobre la búsqueda web: los resultados de búsqueda asociados a esta consulta no contenían información relacionada con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vladadu/pp-ocrv5-arabic-mobile-onnx
- Modelo de detección de origen: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det
- Modelo de reconocimiento árabe de origen: https://huggingface.co/PaddlePaddle/arabic_PP-OCRv5_mobile_rec
- Repositorio de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Herramienta de conversión paddle2onnx: https://github.com/PaddlePaddle/Paddle2ONNX
- Documentación de PaddleX (incluye `use_space_char`): https://github.com/PaddlePaddle/PaddleX

No se han encontrado papers, blogs ni demos específicos de esta exportación en la información disponible.
