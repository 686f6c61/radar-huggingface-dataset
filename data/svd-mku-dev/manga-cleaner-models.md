# SVD-MKU-DEV/manga-cleaner-models

## Resumen

El repositorio `SVD-MKU-DEV/manga-cleaner-models` no es un modelo de lenguaje, sino un paquete de artefactos ONNX que da soporte a **Manga Cleaner Studio**, una aplicacion de escritorio para limpiar, rotular, traducir y montar paginas de manga y webtoon. Contiene dos ficheros: `lama.onnx`, una implementacion del modelo de inpainting LaMa empleada para eliminar texto u otros elementos dentro de una mascara seleccionada por el usuario, y `ocr.onnx`, un modelo de deteccion de regiones de texto que la aplicacion usa para marcar zonas candidatas a revision o enmascarado.

El repositorio lo publica el usuario SVD-MKU-DEV y esta pensado como fuente de descarga para la aplicacion desarrollada en el repositorio `NeTRuNNeRGLiTCH/manga-cleaner`. No se documentan parametros, contexto, idiomas ni arquitectura interna de los modelos; la model card se limita a describir el proposito de cada fichero y el flujo de integracion con la aplicacion.

Su relevancia es acotada: resulta util para quien quiera desplegar Manga Cleaner Studio sin depender del descargador integrado, o para inspeccionar los artefactos ONNX que consume el pipeline de limpieza de manga. El tamano total del repositorio es de 0,2 GB y la licencia declarada es MIT, con la advertencia del autor de revisar los terminos upstream de cada modelo al redistribuirlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes ONNX independientes: un modelo de inpainting basado en LaMa y un modelo de deteccion de texto OCR; no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; los ficheros se distribuyen como ONNX |
| Idiomas soportados | no disponible (el OCR detecta regiones de texto, no se documenta el conjunto de escrituras cubiertas) |
| Licencia | MIT (repositorio); el autor remite a los terminos upstream de cada modelo |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El repositorio agrupa dos modelos con funciones distintas. `lama.onnx` corresponde a LaMa (Large Mask Inpainting), una arquitectura de inpainting basada en convoluciones con modulacion por Fourier que reconstruye regiones enmascaradas a partir del contexto circundante; en este caso se aplica a la eliminacion de rotulos y texto sobre paginas de manga. `ocr.onnx` es un detector de regiones de texto que la aplicacion usa para localizar y marcar zonas, sin ejecutar por si mismo la limpieza con LaMa.

No se proporcionan datos sobre el corpus de entrenamiento, el numero de imagenes utilizadas, el regimen de ajuste fino ni si los modelos fueron reentrenados o convertidos desde pesos upstream. Tampoco se detalla la version de ONNX Runtime requerida ni las dimensiones de entrada esperadas. La model card indica unicamente que la aplicacion gestiona la descarga y la carga de los ficheros, de modo que el usuario no necesita configurar ONNX Runtime manualmente en el uso normal.

## Capacidades

- Inpainting de imagenes: `lama.onnx` reconstruye el contenido dentro de una mascara pintada o seleccionada por el usuario, orientado a borrar texto y rotulos en paginas de manga y webtoon.
- Deteccion de regiones de texto: `ocr.onnx` localiza zonas de texto para que la aplicacion las marque para revision o enmascarado.
- Integracion con un pipeline de escritorio: los modelos estan disenados para consumirse desde Manga Cleaner Studio, que encadena deteccion, limpieza, rotulacion, traduccion y montaje de pagina.
- Ejecucion via ONNX Runtime: los artefactos son portables entre plataformas compatibles con ONNX.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues de lenguaje natural.

## Casos de uso

- Limpieza de rotulos en scanlations: el usuario pinta una mascara sobre el texto original y `lama.onnx` rellena la zona con el fondo reconstruido, lo que permite sustituir el rotulo por una traduccion sin dejar marcas visibles.
- Deteccion asistida de globos de dialogo: `ocr.onnx` marca las regiones de texto de una pagina para que el operador las revise antes de enmascararlas, reduciendo el trabajo manual en paginas con muchas viñetas.
- Preparacion de webtoons para traduccion: al trabajar sobre tiras verticales largas, el flujo deteccion-mascara-inpainting permite procesar por tramos y mantener el estilo de dibujo del fondo.
- Redistribucion interna de la aplicacion: un equipo puede alojar este repositorio como espejo de descarga para que Manga Cleaner Studio obtenga los modelos en entornos sin acceso a la fuente original, apuntando la configuracion de la aplicacion a esta revision.
- Auditoria de artefactos ONNX: un desarrollador puede descargar los ficheros y analizarlos con herramientas de inspeccion de ONNX para verificar formas de entrada, operadores y compatibilidad antes de integrarlos en su propio pipeline.
- Prototipado de herramientas de edicion de manga: sirve como base para experimentar con deteccion de texto e inpainting en un flujo de escritorio, sustituyendo o ampliando los modelos por otros compatibles con ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio completo ocupa 0,2 GB, por lo que ambos ficheros ONNX son ligeros y previsiblemente ejecutables en GPU de gama baja o incluso en CPU mediante ONNX Runtime, aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponibles; al tratarse de modelos de vision de baja huella, cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX o equivalentes) deberia bastar, sin cifras confirmadas.
- Compatibilidad con GPU de consumo: probable por el tamano del repositorio, pero sin confirmacion del autor.
- Opciones de despliegue: ONNX Runtime a traves de Manga Cleaner Studio; tambien es posible cargar los ficheros manualmente en el directorio `models/` de la aplicacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| manga-cleaner-models (este repo) | Inpainting LaMa + deteccion OCR en ONNX | no disponible | no aplica | MIT (repositorio) | HuggingFace, 0 descargas |
| LaMa upstream (SAIC) | Inpainting de imagenes | no disponible en esta ficha | no aplica | no disponible en esta ficha | Publico |
| Modelos OCR genericos (por ejemplo, detectores tipo DBNet) | Deteccion de texto | no disponible en esta ficha | no aplica | variable | Multiples repositorios |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; cualquier expectativa en ese sentido es incorrecta.
- La model card no documenta parametros, arquitectura interna, datos de entrenamiento ni metricas, lo que impide evaluar su calidad de forma objetiva.
- El inpainting puede producir artefactos en fondos con tramas complejas, degradados o lineas de dibujo densas; no hay evaluacion publicada al respecto.
- El detector OCR marca regiones, pero no ejecuta la limpieza por si mismo; el flujo requiere la intervencion de la aplicacion y, en muchos casos, revision humana.
- La licencia MIT del repositorio no exime de revisar los terminos upstream de LaMa y del modelo OCR, tal como advierte el propio autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento comunitario.
- No se especifican los idiomas o escrituras cubiertos por el OCR, lo que limita su uso fuera del ambito previsto de manga y webtoon.
- Fechas de creacion y actualizacion registradas en 2026, posteriores a la mayoria del ecosistema consultado; conviene verificar la revision concreta antes de fijar una dependencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SVD-MKU-DEV/manga-cleaner-models
- Codigo fuente de la aplicacion: https://github.com/NeTRuNNeRGLiTCH/manga-cleaner
