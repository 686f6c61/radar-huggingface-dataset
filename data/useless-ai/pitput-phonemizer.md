# useless-ai/pitput-phonemizer

## Resumen

pitput-phonemizer es un modelo de conversión grafema-a-fonema (G2P) para hebreo que transforma texto plano en transcripción IPA con marcas de acentuación. Lo desarrolla useless-ai y constituye la etapa de pronunciación del sistema de síntesis de voz pitput, un TTS hebreo de 5 millones de parámetros. Esta publicación independiente aísla el fonemizador para que pueda reutilizarse en otros pipelines de voz, transcripción o análisis lingüístico sin necesidad de cargar el modelo completo de síntesis.

El modelo cuenta con 10.083.873 parámetros (aproximadamente 40 MB en precisión completa) y se implementa como un transformer a nivel de carácter. Su rasgo diferencial frente a fonemizadores convencionales es que procesa la oración completa de una vez, lo que le permite desambiguar palabras homógrafas —las mismas letras pueden corresponder a dos palabras distintas— y resolver formas de tratamiento a partir del contexto. Además, acepta parámetros opcionales de género del hablante y del interlocutor para seleccionar las variantes morfológicas correctas de formas como לך, אותך o אמרת.

La relevancia del modelo reside en su especialización: el hebreo, al escribirse sin vocales en el uso cotidiano, plantea una ambigüedad fonológica severa que los sistemas genéricos no resuelven bien. pitput-phonemizer aborda este problema con un decodificador restringido por reglas fonotácticas y un expansor de números integrado, y se distribuye con licencia Apache 2.0 tanto para código como para pesos, lo que facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de carácter (encoder, 8 capas, pre-norm, GELU) |
| Parámetros totales | 10.083.873 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 caracteres (el texto más largo se segmenta por fin de oración, luego por comas y luego por espacios) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 (código y pesos) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 8 capas con 320 canales, 5 cabezas de atención y anchura de feed-forward de 1.280, con normalización previa y activación GELU. La entrada codifica un id por carácter (letras hebreas, puntuación, dígitos, letras latinas y algunos símbolos), más una marca vocálica opcional y una marca consonántica sobre ese carácter, además de un id de hablante y un id de interlocutor. Sobre cada carácter se aplican tres cabezas de predicción: 25 clases de consonantes, 6 clases de vocales y una etiqueta de acentuación; la clase vacía forma parte del espacio de salida, de modo que una letra puede ser muda (א, ע, ה) o quedar sin vocal.

La decodificación no es una simple selección del argmax: elige la mejor consonante y vocal legales para cada letra y una única vocal acentuada por palabra. Se aplican reglas adicionales, como la reinterpretación de צ, כ y ג con geresh como tʃ, χ y dʒ, y la lectura de ח final ante pausa como aχ. Los datos de entrenamiento no se detallan en la información disponible en cuanto a número de tokens; la model card cita como fuentes de texto Wikipedia en hebreo, HeDC4, archivos de noticias, HeSum e ivrit.ai, y atribuye a RenikudPlus (notmax123, Apache-2.0) las distribuciones por letra, el decodificador y el expansor de números. El transformer y sus pesos fueron entrenados por useless-ai. No se documenta el uso de RLHF o DPO.

## Capacidades

- Conversión grafema-a-fonema de hebreo a IPA con marcas de acentuación léxica.
- Desambiguación homográfica mediante contexto oracional completo (por ejemplo, לך, אותך, אמרת según la oración).
- Control explícito del género del interlocutor (`listener`) y del hablante (`speaker`), con valores `"f"`, `"m"` o enteros 0/1/2 (desconocido, hombre, mujer).
- Inferencia del interlocutor a partir de pistas léxicas, como un nombre propio femenino en el vocativo.
- Manejo opcional de niqqud: si una letra está puntuada se respeta; si no, se predice desde el contexto. Kamatz puede leerse como *a* u *o* y shva como *e* o muda.
- Expansión de dígitos a palabras antes de la fonemización (hasta millares, fechas, horas y algunas fracciones).
- Segmentación automática de entradas de más de 512 caracteres.
- Interfaz de línea de comandos con `--text` y `--text-file`, incluyendo los argumentos `--listener` y `--speaker`.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento; es un componente lingüístico de propósito específico.

## Casos de uso

- Síntesis de voz en hebreo: integrado como front-end de pronunciación de un TTS como pitput, convierte el texto de entrada en la secuencia IPA que consume el modelo acústico, resolviendo las variantes morfológicas que afectan a la naturalidad.
- Sistemas de lectura asistida y accesibilidad: genera la pronunciación de un texto hebreo para lectores de pantalla o aplicaciones de aprendizaje de idioma, con control del género del oyente para adaptar las formas de tratamiento.
- Diccionarización y lexicografía computacional: produce transcripciones IPA consistentes para corpus y entradas de diccionario, aprovechando la desambiguación contextual para reducir errores en palabras homógrafas.
- Evaluación de pronunciación en enseñanza de hebreo: compara la salida esperada del fonemizador con la producción de un estudiante, usando las marcas de acento como referencia.
- Preprocesado de corpus para ASR: genera transcripciones fonéticas alineables con audio para entrenar o evaluar modelos de reconocimiento de voz en hebreo.
- Normalización de texto para pipelines de voz: expande números, fechas y horas a palabras antes de cualquier etapa posterior, con reglas deterministas hasta millares.
- Análisis lingüístico y estudios de fonología: permite consultar de forma programática la lectura predicha de formas ambiguas y las variantes de género en primera y segunda persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (10,1 M de parámetros, unos 40 MB de pesos); el consumo real lo dominan el runtime de PyTorch y el contexto, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100. Funciona también en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con soporte CUDA, e incluso en hardware integrado.
- Opciones de despliegue: PyTorch nativo mediante la clase `Phonemizer` del paquete incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pitput-phonemizer | G2P hebreo (transformer de carácter) | 10,1 M | 512 caracteres | he | Apache 2.0 | Hugging Face |
| RenikudPlus (notmax123) | Diacritización hebrea (base del decodificador) | no disponible | no disponible | he | Apache 2.0 | Hugging Face |
| pitput | TTS hebreo (incluye este fonemizador) | 5 M | no disponible | he | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de otros fonemizadores hebreos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Las palabras בין y בית se leen con *ej* (`bˈejn`, `bˈejt`), una decisión fonética fija que puede no coincidir con todas las normas de pronunciación.
- Si no se aportan ni `listener` ni `speaker` y la oración no contiene la pista por sí misma, las formas de segunda persona se resuelven por defecto en masculino; conviene fijar los argumentos en producción.
- Las palabras extranjeras escritas con letras hebreas se pronuncian como hebreo, y los acrónimos se dejan tal cual, sin expandir.
- La lectura de números es un conjunto fijo de reglas limitado a millares, fechas, horas y algunas fracciones; no cubre magnitudes superiores ni formatos atípicos.
- El modelo devuelve una pronunciación, no audio; para síntesis hay que usar pitput u otro TTS.
- La ventana de 512 caracteres obliga a segmentar textos largos, lo que puede romper la desambiguación en fronteras de oración mal detectadas.
- No se documentan sesgos sociales específicos, pero el control de género binario (`f`/`m`) limita la representación de hablantes no binarios.
- Riesgo de alucinación fonológica en palabras fuera de distribución, especialmente préstamos y neologismos no atestiguados en los corpus de entrenamiento.
- Licencia Apache 2.0 permite uso comercial con atribución; debe conservarse el `NOTICE` con la atribución a RenikudPlus para el decodificador y el expansor de números.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/useless-ai/pitput-phonemizer
- Modelo TTS pitput: https://huggingface.co/useless-ai/pitput
- RenikudPlus (notmax123): https://huggingface.co/notmax123/RenikudPlus
