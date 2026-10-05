# vinteai/EmojiFinder

## Resumen

EmojiFinder es un clasificador de texto multietiqueta desarrollado por vinteai que convierte una palabra o frase corta en inglés en una lista ordenada de sugerencias de emoji. No es un modelo generativo ni un pipeline estándar de Transformers: se distribuye como un grafo ONNX en FP16 con 9.553.870 parámetros aprendidos y un fichero `model.onnx` de 20,57 MB, capaz de cubrir un catálogo de 1.870 secuencias de emoji. La inferencia se ejecuta de forma local con ONNX Runtime y no requiere acceso a red una vez descargado e instalado el paquete.

El modelo resuelve un problema muy acotado: dada una consulta corta y familiar en inglés, producir un conjunto de emojis aceptados que superen un umbral global de puntuación de 0,8. Está pensado para selectores de emoji, sugerencias de teclado y experimentos de búsqueda texto-a-emoji. Su arquitectura es deliberadamente pequeña (dos capas de atención pre-norm, ancho 384, dieciséis cabezas por capa) con una tabla de embeddings compartida entre características y etiquetas.

Es relevante ahora por su enfoque de despliegue: licencia Apache 2.0, pesos abiertos en ONNX, funcionamiento offline y huella de 20,57 MB, lo que permite ejecutarlo en CPU o en dispositivos con recursos muy limitados. La contrapartida está documentada por el propio autor: el recall de asociaciones requeridas en el test de 64 frases es del 19,66% y ninguna de esas frases devuelve su conjunto requerido completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer clasificador multietiqueta: dos capas de atención pre-norm, ancho 384, 16 cabezas por capa, tabla de embeddings compartida entre características y etiquetas más sesgo de salida |
| Parámetros totales | 9.553.870 parámetros aprendidos |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana generativa; la ruta contextual conserva las primeras 64 palabras y las bolsas de características los primeros 256 rasgos |
| Tipos de cuantización | FP16 para el almacenamiento de pesos; entradas y salidas públicas en FP32; el runtime de CPU puede promover el cálculo interno a FP32. No se documentan GGUF, int8 ni otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, FP16); grafo de 20,57 MB |
| Catálogo de emojis | 1.870 secuencias de emoji, versiones limitadas a Emoji 15.0, sin variantes de tono de piel |
| Umbral de aceptación | 0,8 (umbral global de puntuación) |
| Tamaño del repositorio | 0,0 GB según HuggingFace; el grafo declarado ocupa 20,57 MB |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |
| Fecha de publicación | 4 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador de una sola pasada con dos capas de atención pre-norm, anchura 384 y dieciséis cabezas por capa, más una tabla de embeddings compartida entre características y etiquetas y un sesgo de salida. El texto se transforma en características hashed de palabra, n-gramas de caracteres y palabras adyacentes, distribuidas en 16.384 cubos. La ruta contextual conserva las primeras 64 palabras y las bolsas de características retienen los primeros 256 rasgos. No hay descarga de tokenizer externo. La exportación a ONNX materializa la proyección de etiquetas a partir de la tabla compartida, por lo que el almacenamiento del grafo no coincide exactamente con el recuento de parámetros de entrenamiento.

El entrenamiento usó AdamW con entropía cruzada sobre logits crudos graduada, entropía cruzada binaria sobre negativos duros juzgados, un margen de coincidencia primaria y una penalización por saturación de logits positivos. Todos los parámetros se entrenan. La etapa final de entrenamiento usó semilla 1919, tasa de aprendizaje 0,00007, FP32 con TF32 desactivado, PyTorch 2.6.0+cu124 y una única NVIDIA L4; el checkpoint seleccionado es la época 3 dentro de un presupuesto de 250 segundos por etapa (no el coste ni la duración totales del entrenamiento completo). Los datos combinan Unicode Emoji 17.0, las anotaciones inglesas de CLDR 48 y ejemplos y correcciones escritos por el proyecto; emojilib se utilizó únicamente como refuerzo suplementario durante el entrenamiento para reforzar asociaciones palabra-emoji, no como fuente única ni como biblioteca de consulta en inferencia. La corrección final abarca 32 temas y nueve controles de elementos específicos. No se incluyen los datos de entrenamiento completos, los checkpoints ni el estado del optimizador.

## Capacidades

- Clasificación multietiqueta texto-a-emoji en una sola pasada sobre un catálogo de 1.870 secuencias de emoji.
- Devuelve listas ordenadas por relevancia aprendida, filtradas por un umbral global de 0,8; la salida puede quedar vacía.
- Inferencia totalmente local y offline mediante ONNX Runtime, sin acceso a red tras la descarga.
- Preprocesado propio basado en hashing de palabras, n-gramas de caracteres y palabras adyacentes, sin tokenizer externo.
- Funciona mejor con frases cortas y familiares en inglés.
- No genera texto y no es un pipeline de Transformers ni un modelo de lenguaje.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio, thinking mode ni matemáticas.
- Calidad multilingüe no establecida; solo se declara inglés.
- El paquete no incluye ninguna aplicación lista para ejecutar: la integración exige implementar el preprocesado y la selección de salida descritos en `INTEGRATION.md`.

## Casos de uso

- Selector de emojis en aplicaciones de mensajería: el modelo recibe la palabra escrita por el usuario y devuelve sugerencias ordenadas, con un coste de 20,57 MB de grafo que permite empaquetarlo dentro del propio cliente sin llamadas a servidores externos.
- Teclados móviles y sugerencias de entrada: al ser un clasificador de una sola pasada y ejecutable en CPU, puede integrarse en el flujo de predicción de un teclado para proponer emojis mientras se escribe, sin conexión de red.
- Autocompletado de reacciones en clientes de chat y correo: dado un término corto y habitual, se ofrece un conjunto filtrado por el umbral 0,8, lo que evita sugerencias de baja relevancia aunque reduzca el número de resultados.
- Etiquetado de contenido con emojis para analítica: clasificar títulos, etiquetas o frases cortas de un corpus inglés hacia un conjunto acotado de emojis, útil para resúmenes visuales de categorías temáticas, siempre que el vocabulario sea familiar.
- Aplicaciones de accesibilidad y comunicación aumentativa: permite seleccionar un emoji mediante una palabra en lugar de navegar por una paleta extensa, con ejecución local y sin dependencia de servicios en la nube.
- Experimentación en búsqueda texto-a-emoji: sirve como línea base reproducible con pesos abiertos para comparar estrategias de preprocesado, dado que los fixtures de despliegue permiten validar implementaciones alternativas.
- Validación de integraciones propias: los 46 fixtures de preprocesado y conjunto aceptado de `deployment-fixtures.json`, junto con los hashes de `SHA256SUMS.json`, permiten comprobar que una implementación propia reproduce el comportamiento del grafo FP32/FP16.
- Despliegue en el borde: por tamaño y licencia Apache 2.0 resulta viable en dispositivos con recursos muy limitados, integrado como paso de clasificación dentro de una aplicación mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye evaluaciones internas de desarrollo con etiquetas asistidas por IA, no independientes, cuyas suites se solapan y no deben sumarse en una única cifra de exactitud:

| Comprobación | Resultado de EmojiFinder | Interpretación |
|---|---|---|
| Restricciones directas de desarrollo y ranking primario | 148/148 | Frases revisadas o entrenadas |
| Controles de usuario sin cambios | 20/20 | Comprobaciones de regresión |
| Sondas heredadas sin cambios | 191/191 | Cuatro sondas deliberadamente ampliadas excluidas |
| Asociaciones requeridas en 64 frases de test | 206/1.048 (19,66%) | La mayoría de asociaciones requeridas no se recuperan |
| Conjuntos requeridos completos en esas frases | 0/64 | Ninguna frase de test devuelve su conjunto requerido completo |
| Test de regresión principal, conjuntos exactos | 3.052/3.111 | Referencia de desarrollo: 3.059/3.111 |
| Test de regresión adicional, conjuntos exactos | 2.930/2.944 | Referencia de desarrollo: 2.923/2.944 |
| Validación de frases, conjuntos exactos | 1.533/1.629 | Referencia de desarrollo: 1.606/1.629 |
| Test de frases, conjuntos exactos | 1.600/1.629 | Referencia de desarrollo: 1.592/1.629 |
| Test de uso cotidiano, conjuntos exactos | 64/112 | Referencia de desarrollo: 61/112 |

Datos adicionales de la evaluación: los conjuntos aceptados del grafo ONNX en FP32 coincidieron con PyTorch en 9.837 consultas; la versión FP16 modificó un conjunto, eliminando un 🤧 no juzgado de «bundling up». Las comparaciones de desarrollo muestran un compromiso: el modelo seleccionado perdió 73 casos exactos en validación de frases y siete en el test de regresión principal.

## Requisitos de hardware

- Huella de pesos en FP16 de aproximadamente 19,1 MB (cálculo a partir de 9.553.870 parámetros × 2 bytes); el grafo ONNX declarado ocupa 20,57 MB.
- VRAM estimada: por debajo de 1 GB en cualquier configuración razonable, dado el tamaño del grafo; se trata de una estimación derivada del tamaño de los pesos, no de una cifra publicada por el autor.
- GPU recomendadas: no se especifican requisitos de inferencia. El entrenamiento de la etapa final se realizó en una única NVIDIA L4; no hay datos publicados sobre otras GPU.
- Cabe en GPUs de consumo y también en CPU: el modelo está pensado para ejecutarse localmente, y el runtime de CPU puede promover el cálculo interno a FP32.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`) con el grafo `model.onnx`. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni se distribuye en GGUF.
- No se distribuye código de inferencia: hay que implementar el preprocesado y la selección de salida según `INTEGRATION.md`, usando `metadata.json` para el número de cubos de características, el orden de etiquetas, las cadenas de emoji completas y el umbral de aceptación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos neuronales comparables con especificaciones publicadas (parámetros, contexto, rendimiento y licencia) en la categoría de búsqueda texto-a-emoji.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmojiFinder | Clasificador transformer multietiqueta, ONNX FP16 | 9,55 M | 64 palabras en la ruta contextual | Apache 2.0 | Pesos ONNX en HuggingFace |
| Alternativas neuronales comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

Como referencia no equivalente, la model card menciona emojilib, una biblioteca de palabras clave en inglés para asociaciones palabra-emoji que se usó solo como refuerzo suplementario durante el entrenamiento. No es un modelo comparable ni una biblioteca de consulta en tiempo de inferencia.

## Limitaciones y advertencias

- Recall bajo en asociaciones requeridas: 206/1.048 (19,66%) en el test de 64 frases, y 0/64 frases devuelven su conjunto requerido completo. Es la limitación más relevante para cualquier uso en producción.
- La evaluación no es ciega ni independiente: usa etiquetas asistidas por IA, conceptos familiares y suites solapadas; los resultados agregados de desarrollo se vieron antes de la pasada final de ranking.
- Compromiso documentado respecto a las referencias de desarrollo: el modelo seleccionado perdió 73 casos exactos en validación de frases y siete en el test de regresión principal.
- Riesgo de asociaciones no juzgadas o incorrectas: la model card cita dos ejemplos, `library` añade ☕ y `movie night` añade 📺.
- Las asociaciones culturales, la intención ambigua, las exclusiones y las frases largas o poco familiares pueden producir resultados ausentes o irrelevantes.
- Las puntuaciones representan relevancia del modelo, no probabilidades calibradas; el umbral global de 0,8 implica que pueden devolverse listas vacías o más cortas.
- Solo se declara inglés y la calidad multilingüe no está establecida.
- El catálogo limita las versiones de emoji a 15.0 y excluye variantes de tono de piel.
- El paquete contiene cadenas Unicode, no ilustraciones; la apariencia final del emoji depende del renderizador del dispositivo.
- Las entradas del grafo son tensores de características, no texto en crudo: sin una implementación correcta del preprocesado el modelo no es utilizable.
- No se distribuyen datos de entrenamiento, checkpoints, estado del optimizador ni código de entrenamiento, inferencia, preprocesado o validación, lo que limita la reproducibilidad y el ajuste fino por parte de terceros.
- La licencia del modelo es Apache 2.0, que permite uso comercial preservando avisos y términos; las fuentes de datos empleadas (Unicode Emoji, CLDR, emojilib) tienen sus propias licencias, incluidas en el repositorio, y conviene revisarlas antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vinteai/EmojiFinder
- Guía de integración: https://huggingface.co/vinteai/EmojiFinder/blob/main/INTEGRATION.md
- Metadatos del catálogo: https://huggingface.co/vinteai/EmojiFinder/blob/main/metadata.json
- Procedencia y hashes de las fuentes: https://huggingface.co/vinteai/EmojiFinder/blob/main/provenance.json
- Fixtures de despliegue: https://huggingface.co/vinteai/EmojiFinder/blob/main/deployment-fixtures.json
- Sumas de verificación: https://huggingface.co/vinteai/EmojiFinder/blob/main/SHA256SUMS.json
- Herramienta relacionada encontrada en la búsqueda web, no vinculada al autor del modelo: https://aiemojifinder.com/
