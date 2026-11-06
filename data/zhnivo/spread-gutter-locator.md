# Zhnivo/spread-gutter-locator

## Resumen

Spread Gutter Locator es una red neuronal convolucional de pequeno tamano (88.977 parametros) desarrollada por Zhnivo, un proyecto sin animo de lucro dedicado a la preservacion del patrimonio documental de Bielorrusia. El modelo resuelve un problema muy concreto dentro de los pipelines de digitalizacion: localizar la linea de pliegue central (el *gutter*) en el escaneo de una doble pagina de libro, registro o expediente de archivo, para poder cortar automaticamente la imagen en las paginas izquierda y derecha.

A diferencia de las heuristicas clasicas de deteccion de pliegue, el modelo esta disenado para funcionar cuando el pliegue no cae en el centro geometrico de la imagen, algo habitual en escaneos con margen adicional en uno o ambos lados. Se posiciona como el segundo paso de una cadena de preprocesado documental, despues de Zhnivo/spread-classifier, que decide si un escaneo es realmente una doble pagina.

Es relevante ahora porque los proyectos de digitalizacion masiva de archivos y fondos bibliograficos necesitan automatizar el troceado de miles de imagenes antes de pasarlas por motores OCR/HTR, y este modelo ofrece una solucion ligera (menos de 0,1 MB de pesos) que puede ejecutarse en CPU sin infraestructura especial. La licencia MIT y la ausencia de dependencias pesadas facilitan su integracion en cualquier pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional pequena: convoluciones 3x3 con pooling solo en altura, seguida de una cabeza 1D que puntua cada columna |
| Parametros totales | 88.977 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente float32) |
| Idiomas soportados | no disponible (independiente del idioma; procesa imagenes) |
| Licencia | MIT |
| Formato de pesos | safetensors (acompanado de `config.json` e `inference.py`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN compacta de aproximadamente 90.000 parametros. Aplica convoluciones 3x3 con pooling unicamente sobre la dimension de altura, lo que preserva la resolucion horizontal, y termina con una cabeza 1D que genera una puntuacion por columna. La posicion del pliegue se deriva de esa distribucion de puntuaciones, junto con una confianza entre 0 y 1 y la fuente de la respuesta (`network` o `fold_rule`). La entrada es un escaneo en escala de grises redimensionado a altura 640, del cual se recorta la parte central del ancho (del 30 % al 70 %) y se redimensiona a 256x192 para alimentar la red.

El modelo se entreno con dobles paginas de libros impresos y manuscritos, registros y expedientes de archivo, mayoritariamente de los siglos XIX y XX, con el pliegue anotado manualmente. Las paginas de validacion proceden de libros distintos a los de entrenamiento, lo que indica una separacion por documento para medir generalizacion. Como innovacion practica, incorpora una comprobacion opcional contra una regla de pliegue clasica: si una columna es mas oscura que sus vecinas en los tres tercios de la pagina y esta cerca del centro, y la regla detecta un pliegue claro a mas del 5 % del ancho de distancia, la regla prevalece sobre la red. Este comportamiento se puede desactivar con `predict(..., use_rule=False)`.

## Capacidades

- Deteccion de la linea de pliegue en escaneos de doble pagina y devolucion de su posicion como fraccion del ancho de la imagen.
- Estimacion de confianza (0 a 1) para filtrar casos dudosos en produccion.
- Funcionamiento con margenes adicionales a uno o ambos lados del pliegue, siempre que este caiga en el 40 % central del ancho.
- Combinacion con una regla de pliegue heuristica para corregir la salida de la red cuando la evidencia visual es clara.
- Procesamiento de material impreso y manuscrito (libros, registros, expedientes de archivo).
- Independencia del idioma del documento: opera sobre pixeles, no sobre texto.
- Inferencia ligera en CPU, sin necesidad de GPU.

## Casos de uso

- Digitalizacion masiva de fondos bibliograficos: integrado tras Zhnivo/spread-classifier, permite trocear automaticamente miles de escaneos de doble pagina en paginas individuales antes de pasarlos a OCR, reduciendo el trabajo manual de recorte.
- Preprocesado para OCR/HTR en archivos historicos: al aislar cada pagina, los motores de reconocimiento de texto trabajan sobre imagenes limpias y sin texto de la pagina contigua, lo que reduce errores de segmentacion en documentos de los siglos XIX y XX.
- Pipelines de preservacion digital en instituciones pequenas: su tamano minimo (menos de 0,1 MB de pesos) y su ejecucion en CPU permiten desplegarlo en servidores modestos o incluso en estaciones de trabajo sin GPU.
- Control de calidad con umbral de confianza: los escaneos cuya prediccion tenga confianza baja pueden derivarse a revision manual, lo que permite priorizar el esfuerzo humano en los casos ambiguos.
- Procesamiento por lotes de registros y expedientes: la deteccion de pliegues fuera del centro geometrico es util en escaneos de libros abiertos con encuadernacion asimetrica o con margen de captura irregular.
- Investigacion sobre segmentacion documental: al ser un modelo pequeno, reproducible y con licencia MIT, sirve como linea base o componente en experimentos de analisis de layout y segmentacion de paginas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 88.977 parametros los pesos ocupan del orden de 0,35 MB en float32. Cabe en CPU sin problemas.
- GPU recomendadas: no es necesaria GPU; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, aunque el caso natural de despliegue es CPU.
- Opciones de despliegue: inferencia directa con PyTorch mediante el script `inference.py` incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhnivo/spread-gutter-locator | CNN | 88.977 | Deteccion de pliegue en doble pagina | MIT | Hugging Face |
| Zhnivo/spread-classifier | no disponible | no disponible | Clasificacion de escaneo como doble pagina | no disponible | Hugging Face |
| Alternativas genericas de segmentacion documental | no disponible | no disponible | Segmentacion de layout | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otras soluciones de deteccion de pliegue en la informacion proporcionada.

## Limitaciones y advertencias

- El pliegue debe encontrarse dentro del 40 % central del ancho de la imagen; fuera de ese rango el modelo no esta disenado para localizarlo.
- Espera una doble pagina; si se le pasa una pagina unica, aun asi devuelve una posicion, que carecera de sentido.
- Las tablas con una separacion amplia entre columnas cerca del centro pueden confundir al modelo; conviene revisar los resultados con confianza baja.
- La comprobacion con la regla de pliegue puede sobrescribir la salida de la red; si se necesita el comportamiento puro de la red, hay que desactivarla con `use_rule=False`.
- No se documentan sesgos especificos, pero el entrenamiento se centra en material de los siglos XIX y XX, mayoritariamente de fondos bielorrusos; el comportamiento en otros tipos de encuadernacion o epocas no esta caracterizado.
- No se han publicado evaluaciones cuantitativas (metricas de error en la localizacion del pliegue), por lo que el rendimiento real en un corpus concreto debe validarse antes de usarlo en produccion.
- Licencia MIT: permite uso comercial y modificacion sin restricciones; el autor agradece, sin obligar, un enlace al proyecto zhnivo.com.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhnivo/spread-gutter-locator
- Modelo previo de la cadena (clasificador de doble pagina): https://huggingface.co/Zhnivo/spread-classifier
- Proyecto Zhnivo: https://zhnivo.com/en/
