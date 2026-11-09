# Thareah/ThaOCR-structure

## Resumen

ThaOCR-structure es la quinta y ultima etapa de la pipeline ThaOCR, un sistema de OCR para documentos en jemer (khmer) e ingles desarrollado por el autor Thareah. El modelo resuelve el problema de reconstruir la estructura logica de una pagina ya reconocida: a partir de las lineas de texto detectadas y transcritas por las etapas anteriores, asigna a cada linea un rol semantico (titulo, encabezado de seccion, elemento de lista, pie de pagina, etc.), detecta el inicio de parrafo, el nivel de anidamiento de las listas y el orden de lectura correcto.

Tecnicamente es un encoder Transformer muy compacto (d=160, 4 capas, 4 cabezas, aproximadamente 0,6 M de parametros) que opera sobre secuencias de hasta 256 lineas por pagina. Cada linea se representa mediante 23 caracteristicas geometricas y textuales mas 6 identificadores de caracteres hasheados. El modelo se distribuye como un unico fichero ONNX de 4 MB (opset 17) y se ejecuta con onnxruntime en CPU, sin necesidad de GPU.

Su relevancia radica en que completa una pipeline OCR totalmente desplegable en local y en CPU, algo poco habitual en el segmento de documentos jemer, un idioma con escasa cobertura en herramientas comerciales. El modelo se entreno exclusivamente con datos sinteticos generados de forma procedural, lo que garantiza etiquetas exactas por construccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (d=160, 4 capas, 4 cabezas) |
| Parametros totales | ~0,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 lineas por pagina |
| Tipos de cuantizacion | no disponible (pesos ONNX float, sin variantes cuantizadas publicadas) |
| Idiomas soportados | jemer (km), ingles (en) |
| Licencia | other (mixed-see-readme) |
| Formato de pesos | ONNX (opset 17), ejecutable con onnxruntime |

## Arquitectura y entrenamiento

StructureNet es un encoder Transformer de 4 capas y 4 cabezas con dimension oculta de 160, disenado para procesar la secuencia de lineas de una pagina (hasta 256). La entrada por linea combina 23 caracteristicas geometricas y textuales (posicion, tamano, espaciados, mezcla de alfabetos, negrita, vineta, etc.) con 6 identificadores de caracteres hasheados. La salida por linea incluye cinco cabezas: rol (12 clases), indicador de inicio de parrafo, nivel de lista (0-3), indicador de vineta y puntero a la linea siguiente en orden de lectura.

El entrenamiento se realizo durante 30 epocas con batch de 16 sobre el dataset sintetico docgen v3 (10.000 paginas de entrenamiento y 500 de validacion), con etiquetas estructurales exactas por construccion. El mejor checkpoint se selecciono combinando la F1 de inicio de parrafo, la exactitud de rol y la exactitud de sucesor. El texto de las paginas se genera a partir de un corpus de noticias en jemer recopilado por el autor y de texto ingles de Project Gutenberg, junto con identidades sinteticas de Faker y sellos, logotipos y figuras generados proceduralmente. No se emplearon fotografias reales de examenes del autor ni datos de personas reales.

## Capacidades

- Clasificacion de rol por linea en 12 clases: texto, titulo, encabezado de seccion, elemento de lista, pie de figura, cabecera de pagina, pie de pagina, numero de pagina, nota al pie, tabla, campo de formulario y otros.
- Deteccion de inicio de parrafo con F1 de 0,971 en validacion.
- Prediccion del nivel de anidamiento de listas (0 a 3) con exactitud de 0,993.
- Deteccion de vinetas con exactitud de 1,00.
- Reconstruccion del orden de lectura mediante punteros de sucesor (exactitud 0,964, tau de Kendall 0,943).
- Procesamiento de documentos bilingues jemer-ingles con mezcla de alfabetos por linea.
- Ejecucion en CPU pura mediante onnxruntime, sin dependencias de GPU.
- Integracion como etapa final de una pipeline de cinco fases con manifiesto comun (`models.json`).

## Casos de uso

- Digitalizacion de prensa en jemer: tras las etapas de layout, deteccion de lineas y reconocimiento, este modelo reconstruye titulos, entradillas, cuerpo y pies de foto, lo que permite exportar articulos como HTML o Markdown estructurado en lugar de texto plano.
- Extraccion de contenido de examenes y formularios: la clasificacion de campos de formulario y la deteccion de cabeceras y pies de pagina facilitan separar el contenido sustantivo del ruido de plantilla en documentos escaneados.
- Generacion de EPUB y documentos accesibles: el orden de lectura reconstruido (tau de Kendall 0,943) permite producir un flujo de texto lineal correcto para lectores de pantalla y para conversion a formatos reflowable.
- Procesamiento de tablas y notas al pie en informes: al etiquetar lineas como tabla o nota al pie, el modelo permite aislar estos bloques y tratarlos con logica especifica (por ejemplo, enviarlos a un extractor de tablas) sin contaminar el cuerpo principal.
- Indexacion y busqueda documental: la estructura por parrafos y secciones mejora la segmentacion de chunks para sistemas RAG, ya que los cortes respetan limites semanticos reales en lugar de longitud fija.
- Despliegue en entornos sin GPU: al ser un ONNX de 4 MB ejecutable en CPU, encaja en servidores modestos, portatiles o dispositivos de borde donde no es viable servir modelos mayores, manteniendo un coste de inferencia minimo.
- Archivado de documentacion administrativa bilingue: la deteccion de numeros de pagina y cabeceras permite reconstruir la paginacion y el orden logico de expedientes escaneados en jemer e ingles.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de validacion sintetico (500 paginas):

| Metrica | Valor |
|---|---|
| Exactitud de rol | 0,988 |
| Exactitud de nivel de lista | 0,993 |
| Exactitud de vineta | 1,00 |
| Exactitud de sucesor (orden de lectura) | 0,964 |
| F1 de inicio de parrafo | 0,971 |
| Tau de Kendall del orden de lectura | 0,943 |

No se han publicado comparaciones con otros modelos de estructura documental en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para ejecucion en CPU. El fichero ONNX ocupa 4,0 MB, por lo que la memoria RAM necesaria es del orden de decenas de megabytes incluyendo el runtime.
- GPU recomendadas: ninguna necesaria. Cualquier GPU compatible con onnxruntime (CUDA o DirectML) puede acelerar la inferencia, pero no es un requisito.
- Cabe en cualquier equipo consumer: portatiles, mini-PC y dispositivos de borde con CPU x86 o ARM.
- Opciones de despliegue: onnxruntime (CPU o GPU), integrado en el backend de ThaOCR (`backend/app/services/stages/`); el pre y postprocesado es codigo numpy/OpenCV.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de analisis de estructura documental ni con alternativas de OCR para jemer.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos (docgen v3); el rendimiento sobre escaneos reales con ruido, degradacion o maquetaciones atipicas puede diferir de las metricas de validacion.
- La cobertura linguistica se limita a jemer e ingles; otras escrituras o alfabetos no estan soportados.
- El contexto esta acotado a 256 lineas por pagina; documentos con mas lineas requeriran segmentacion previa.
- Riesgo de alucinacion estructural: el modelo puede asignar roles o inicios de parrafo incorrectos en maquetaciones ambiguas (columnas multiples, tablas complejas) sin senal de confianza publicada.
- La licencia es `other` (mixed-see-readme): el texto de entrenamiento deriva de un corpus de noticias en jemer recopilado por el autor para uso de investigacion, por lo que el uso comercial debe verificarse contra los terminos de ese corpus.
- El modelo depende de las etapas previas de la pipeline (layout, textdet, rec, font); errores en la deteccion o transcripcion de lineas se propagan a la estructura.
- No se han publicado evaluaciones de sesgo ni auditorias sobre documentos reales.
- El repositorio figura con 0 descargas y 0 likes, y el modelo no declara pipeline en Hugging Face; la integracion debe hacerse via onnxruntime con el manifiesto `models.structure.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thareah/ThaOCR-structure
- Etapa de layout: https://huggingface.co/Thareah/ThaOCR-layout
- Etapa de deteccion de lineas: https://huggingface.co/Thareah/ThaOCR-textdet
- Etapa de reconocimiento: https://huggingface.co/Thareah/ThaOCR-rec
- Etapa de clasificacion de fuente: https://huggingface.co/Thareah/ThaOCR-font
- Repositorio indice con el manifiesto completo: https://huggingface.co/Thareah/ThaOCR-models
