# Thareah/ThaOCR-font

## Resumen

ThaOCR-font es el cuarto modulo de la pipeline ThaOCR, un sistema OCR de cinco etapas para documentos en jemer (khmer) e ingles desarrollado por el usuario Thareah. Su funcion no es reconocer texto, sino clasificar las propiedades tipograficas de cada linea de texto ya detectada: familia tipografica (29 clases), grosor (regular o negrita), inclinacion (recta o cursiva) y un tamano em estimado por regresion que se convierte en un tamano de fuente CSS. El modelo se distribuye como ONNX (opset 17) y se ejecuta con onnxruntime en CPU.

Tecnicamente es una red convolucional pequena: FontNet consta de 8 capas convolucionales y aproximadamente 0,45 M de parametros, con una entrada de recorte de linea en escala de grises de 32x256 pixeles. Existen dos versiones: `font_cnn_v1` (1,9 MB), que predice familia, grosor e inclinacion, y `font_cnn_v2` (1,9 MB, por defecto), que anade la cabeza de tamano em aprendido. Ambas se entrenaron exclusivamente con datos sinteticos generados al vuelo.

Su relevancia es acotada pero especifica: cubre una necesidad poco atendida en OCR de documentos jemer, donde preservar la jerarquia visual (titulos en negrita, cursivas, tamanos relativos) es util para reconstruir estructura de pagina, generar HTML/CSS o alimentar etapas posteriores de analisis documental. Al ser un modelo de 1,9 MB ejecutable en CPU, su coste de despliegue es practicamente nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (FontNet): 8 capas convolucionales con cabezas multiples de clasificacion y regresion |
| Parametros totales | ~0,45 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen de 32x256 pixeles en escala de grises) |
| Tipos de cuantizacion | no disponible (pesos ONNX en precision original) |
| Idiomas soportados | jemer (km), ingles (en) |
| Licencia | other (`mixed-see-readme`) |
| Formato de pesos | ONNX (opset 17), ejecutable con onnxruntime |

## Arquitectura y entrenamiento

FontNet es una red convolucional de 8 capas que procesa un recorte de linea de texto en escala de grises de 32x256 pixeles. Sobre las caracteristicas extraidas se montan cuatro cabezas: clasificacion de familia (29 clases), clasificacion de grosor (regular/negrita), clasificacion de inclinacion (recta/cursiva) y una regresion del logaritmo de la relacion de tamano em, que se transforma en un tamano de fuente CSS. La version v2 anade esta ultima cabeza partiendo de los pesos de v1, con 24 epocas adicionales y una tasa de aprendizaje de 1,5e-3.

El entrenamiento es 100 % sintetico y se genera al vuelo con PIL y HarfBuzz para el modelado de formas (shaping). El corpus de texto combina un corpus de noticias en jemer (5.601 articulos recopilados por el autor) y frases en ingles. Las augmentaciones incluyen tamano y color aleatorios, negrita sintetica por dilatacion, cursiva por cizallamiento, intrusion de lineas vecinas, subrayados, perdida de resolucion, desenfoque, ruido, compresion JPEG, tinte de papel y gradiente de iluminacion. La validacion emplea 8.000 recortes fijos de una particion de noticias no vista durante el entrenamiento. La version v1 se entreno durante 40 epocas de 400 pasos con lote de 256.

## Capacidades

- Clasificacion de familia tipografica entre 29 clases: 27 familias jemer (Khmer OS y sus variantes, Noto Sans/Serif Khmer, Hanuman, Kantumruy Pro, Nokora, Koulen, Bayon, Angkor, Taprom, entre otras) y dos familias latinas (serif y sans).
- Deteccion de grosor: regular o negrita.
- Deteccion de inclinacion: recta o cursiva.
- Regresion del tamano em de la linea, convertido a tamano de fuente CSS (solo en v2).
- Procesamiento por linea de texto individual, no de pagina completa: depende de las etapas previas de la pipeline (layout y textdet).
- Ejecucion en CPU mediante onnxruntime, sin requisito de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto; es un clasificador de imagen.

## Casos de uso

- Reconstruccion de estructura visual de documentos jemer: tras el OCR de texto, las predicciones de familia, grosor y tamano permiten etiquetar lineas como titulos, subtitulos o cuerpo de texto y generar HTML/CSS con jerarquia tipografica aproximada.
- Digitalizacion de prensa y archivos en jemer: al estimar el tamano relativo y el estilo de cada linea, se preserva la maqueta original en la version digitalizada, algo que un OCR puramente textual pierde.
- Deteccion de enfasis en documentos legales o administrativos: la clasificacion de negrita y cursiva permite marcar automaticamente fragmentos destacados (encabezados, terminos definidos, clausulas resaltadas).
- Analisis de identidad de marca en documentos: la familia tipografica detectada (por ejemplo, Khmer OS Muol frente a Noto Serif Khmer) puede usarse para verificar el cumplimiento de plantillas corporativas o institucionales.
- Preprocesamiento para re-renderizado o traduccion con formato: al conocer tamano y estilo por linea, un pipeline de traduccion jemer-ingles puede conservar la apariencia del documento original en la salida.
- Clasificacion de calidad tipografica en lotes de escaneos: identificar lineas con familias inesperadas o tamanos anomalos como senal de escaneos defectuosos o documentos fuera de plantilla.
- Indexacion y busqueda por estilo: permitir consultas del tipo "lineas en negrita de tamano superior al cuerpo" sobre un corpus digitalizado, util en exploracion de archivos historicos.

## Benchmarks y rendimiento

Resultados de validacion publicados por el autor sobre 8.000 recortes fijos de la particion de noticias no vista:

| Metrica | v1 | v2 |
|---|---|---|
| Precision de familia | 92,0 % | 92,0 % |
| Precision de grosor | 97,9 % | 98,0 % |
| Precision de inclinacion | 99,95 % | 99,9 % |
| Error mediano de tamano | no disponible (sin cabeza de tamano) | 1,7 % |
| Lineas con error de tamano < 10 % | no disponible | 97,9 % |

No se han publicado comparaciones con otros modelos de reconocimiento tipografico en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para ejecucion en CPU con onnxruntime. Los ficheros ONNX ocupan 1,9 MB cada uno.
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU compatible con onnxruntime puede ejecutarlo, pero el modelo es lo bastante pequeno para no requerirla.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el cuello de botella sera el preprocesado de imagen (letterbox, NMS) y no la inferencia.
- Opciones de despliegue: onnxruntime (CPU o GPU), integrado en la pipeline ThaOCR; el pre/postprocesado es codigo numpy/OpenCV en el backend de ThaOCR (`backend/app/services/stages/`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de reconocimiento de fuente tipografica por linea en la documentacion proporcionada. Como referencia interna de la propia pipeline ThaOCR, este modulo se situa en la cuarta de cinco etapas, tras layout, deteccion de lineas y reconocimiento de texto, y antes de la etapa de estructura de pagina.

| Modelo | Parametros | Entrada | Tarea | Licencia |
|---|---|---|---|---|
| ThaOCR-font (v2) | ~0,45 M | Recorte de linea 32x256 en grises | Familia, grosor, inclinacion, tamano em | other (mixed) |
| ThaOCR-layout | no disponible | Pagina completa | Analisis de maqueta | no disponible |
| ThaOCR-textdet | no disponible | Pagina completa | Deteccion de lineas de texto | no disponible |
| ThaOCR-rec | no disponible | Recorte de linea | Reconocimiento de texto (CTC) | no disponible |

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintetico: aunque las augmentaciones son amplias, el dominio real (fotografias de examenes, documentos degradados, escaneos con artefactos no simulados) puede presentar una brecha de rendimiento no cuantificada.
- Precision de familia del 92 %: aproximadamente una de cada doce lineas se clasificara con una familia incorrecta, lo que puede propagar errores en etapas posteriores que dependan del estilo.
- Solo cubre 29 familias, con predominio de familias jemer de uso comun y dos familias latinas genericas; familias no incluidas en el conjunto de entrenamiento se asignaran a la clase mas cercana sin senal de incertidumbre expuesta.
- La licencia es `other` con nombre `mixed-see-readme`: parte del corpus de texto es de uso exclusivamente de investigacion (articulos de noticias sin URLs de origen registradas) y las fuentes tienen licencias OFL 1.1 y LGPL 2.1. Es imprescindible revisar los terminos antes de cualquier uso comercial.
- El autor no registro las URLs de origen del corpus de noticias, lo que dificulta la verificacion de derechos y la trazabilidad de los datos.
- Dependencia de la pipeline: el modelo espera recortes de linea ya detectados y alineados; un recorte mal encuadrado degradara las predicciones sin mecanismo de rechazo documentado.
- No expone estimaciones de calibracion ni umbrales de confianza recomendados; en produccion conviene anadir un umbral propio sobre las probabilidades de salida.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de predicciones erroneas con alta confianza en familias visualmente similares (por ejemplo, variantes de Khmer OS).
- Idiomas limitados a jemer e ingles; no hay evidencia de generalizacion a otras escrituras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thareah/ThaOCR-font
- Etapa de layout: https://huggingface.co/Thareah/ThaOCR-layout
- Etapa de deteccion de texto: https://huggingface.co/Thareah/ThaOCR-textdet
- Etapa de reconocimiento: https://huggingface.co/Thareah/ThaOCR-rec
- Etapa de estructura de pagina: https://huggingface.co/Thareah/ThaOCR-structure
- Repositorio indice con el manifiesto completo: https://huggingface.co/Thareah/ThaOCR-models
