# TontaubeAI/TontaubeV1-Verbalizer

## Resumen

TontaubeV1-Verbalizer es un modelo de normalización de texto para síntesis de voz (TTS) desarrollado por TontaubeAI. Se trata de un ajuste fino supervisado de Qwen3-1.7B (1.720.574.976 parámetros) especializado en reescribir texto escrito en inglés a la forma en que un narrador lo pronunciaría: expande números, fechas, divisas, unidades, abreviaturas, numerales romanos, direcciones web, identificadores de código y restos de Markdown o HTML a palabras llanas, y descarta aquello que un narrador omitiría (marcadores de cita, símbolos decorativos, destinos de enlaces).

El modelo resuelve un problema muy concreto en pipelines de TTS: los motores de síntesis habitualmente no saben leer dígitos, símbolos ni marcado, por lo que requieren una capa de verbalización previa. A diferencia de los normalizadores basados en reglas, este modelo resuelve ambigüedades por contexto, como ilustra su model card con casos donde "IV" se lee como "Four" en "Rocky IV" pero como "intravenous" en un contexto clínico, o donde "Dr." se expande a "Doctor" o "Drive" según su posición.

Es relevante por su tamaño reducido (1,7 B), su licencia Apache 2.0 y su latencia: alrededor de 2,5 GiB de VRAM en GPU NVIDIA y unos 2 segundos para un informe de 20.000 caracteres en una RTX 3090. Forma parte del sistema Tontaube, pero puede ejecutarse de forma independiente mediante el repositorio de inferencia del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B); detalles internos del ajuste no disponibles |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el runtime trocea la entrada en fragmentos de unos 800 caracteres) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; el runtime usa unos 2,5 GiB de VRAM) |
| Idiomas soportados | inglés (`en`); el texto en otros idiomas se copia sin modificar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,9 GB |
| Pipeline | text-generation |
| Revision descrita | v1.1.0 |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen3-1.7B. La model card no detalla la composición del dataset de ajuste, el número de tokens de entrenamiento ni si se emplearon técnicas de alineación como RLHF o DPO; esa información no está disponible. Lo que sí se documenta es el contrato de inferencia que el ajuste impone y del que depende el runtime: un system prompt fijo, la tokenización de cada dígito de la entrada como un token individual y la generación de la salida entre etiquetas.

La innovación técnica destacable no está en la arquitectura sino en el esquema de marcadores para los casos que el modelo no escribe como palabras. Los números de seis o más dígitos y los numerales romanos se emiten como caracteres copiados entre tokens marcadores (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`), y es el runtime (`app/verbalizer_markers.py`) quien los convierte en palabras y verifica que los caracteres copiados existen realmente en la entrada. Este diseño delega la aritmética de la verbalización numérica a código determinista y reduce el riesgo de que el modelo invente cifras. Además, el modelo utiliza las mayúsculas como única señal de pronunciación: lo que se deletrea letra a letra va en mayúsculas y lo que se pronuncia como palabra lleva como mucho una mayúscula.

## Capacidades

- Normalización de texto para TTS: conversión de dígitos, fechas, horas, divisas, porcentajes, unidades, símbolos, abreviaturas y numerales romanos a palabras.
- Desambiguación por contexto: "IV" como ordinal romano o como abreviatura clínica, "Dr." como "Doctor" o "Drive", "May" como mes o como nombre propio.
- Limpieza de marcado: eliminación de marcadores de cita, marcas de énfasis, símbolos decorativos y destinos de enlaces; verbalización de restos de Markdown y HTML.
- Verbalización de direcciones web, nombres de fichero e identificadores de código.
- Preservación estricta del texto: no traduce, no resume, no responde, no reformula, no reordena y no corrige; mantiene redacción, ortografía, puntuación y contracciones.
- No expande siglas deletreables: "FBI" permanece "FBI".
- No genera fonemas, marcas de acentuación ni SSML.
- Procesamiento de texto de longitud arbitraria mediante troceado por párrafos en el runtime, manteniendo los encabezados junto al texto que les sigue y repitiendo la fila de cabecera en tablas divididas.
- No soporta tool calling ni razonamiento multi-paso; las instrucciones dentro del texto se leen como una frase más.

## Casos de uso

- Verbalización previa a TTS en pipelines de audiolibros: el modelo convierte capítulos con cifras, abreviaturas y marcas de edición en texto pronunciable antes de pasarlo al sintetizador, manteniendo intacta la redacción original del autor.
- Lectura automática de informes financieros o técnicos: cifras como "1,345,000 pounds" o "0.0001%" se expanden a palabras con la convención estadounidense ("one million three hundred forty-five thousand pounds"), lo que evita errores de lectura en el motor de voz.
- Accesibilidad de documentos web: limpieza de Markdown y HTML residual, descarte de destinos de enlaces y marcadores de cita, y verbalización de direcciones web y nombres de fichero para lectores de pantalla con salida de voz.
- Narración de documentación técnica y código: los identificadores y fragmentos de código se transforman en palabras pronunciables, lo que permite generar versiones en audio de guías de desarrollo.
- Asistentes de voz sobre texto de entrada del usuario: normalización de mensajes cortos con horas, importes y unidades antes de la síntesis, con latencia de milisegundos a una décima de segundo por frase en una RTX 3090.
- Integración como servicio HTTP independiente: el repositorio de inferencia expone un endpoint `/v1/verbalize` que acepta texto y devuelve la versión hablada, lo que permite insertarlo como microservicio en arquitecturas existentes de TTS.
- Preprocesado por lotes de corpus para entrenamiento o evaluación de sistemas de voz: el modelo acepta texto de cualquier longitud y lo trocea internamente, lo que facilita procesar grandes volúmenes de documentos de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de latencia y memoria: aproximadamente 2,5 GiB de VRAM en GPU NVIDIA, entre unos milisegundos y una décima de segundo por frase en una RTX 3090 según la cantidad de texto a reescribir, y unos 2 segundos para un informe de 20.000 caracteres.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GiB en GPU NVIDIA según la model card; no se documentan requisitos para otras precisiones o cuantizaciones.
- GPU recomendadas: el autor cita una RTX 3090 como referencia de latencia; el modelo requiere GPU NVIDIA según la documentación.
- GPU de consumo: por su tamaño (1,7 B de parámetros) y su huella de 2,5 GiB, cabe holgadamente en tarjetas de consumo con al menos 4 GB de VRAM, aunque el autor solo confirma el funcionamiento en NVIDIA.
- Opciones de despliegue: el runtime propio del proyecto Tontaube (`uv run tontaube verbalize` para CLI y `uv run tontaube verbalize --serve` para API en 127.0.0.1:8081), o el código de `app/verbalizer.py` del repositorio de inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: de pocos milisegundos a una décima de segundo por frase en RTX 3090; unos 2 segundos para 20.000 caracteres. No se publica throughput agregado.
- Almacenamiento: el snapshot se descarga en la caché estándar de Hugging Face; el repositorio ocupa 6,9 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TontaubeV1-Verbalizer | 1,72 B | no disponible | Normalización de texto para TTS (ajuste de Qwen3-1.7B) | Apache 2.0 | Hugging Face, 27 descargas |
| Qwen3-1.7B (base) | 1,72 B | no disponible en la informacion proporcionada | Modelo generalista de texto | Apache 2.0 | Hugging Face |
| TontaubeV1.1 | no disponible | no disponible | Modelo del sistema Tontaube (referenciado por el autor) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de normalización verbal en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo inglés: el texto en otros idiomas se copia sin modificar, dígitos incluidos; optar por la verbalización con otro idioma devuelve un error en el runtime de Tontaube.
- No sigue instrucciones: no traduce, no resume, no responde ni reformula; cualquier instrucción incrustada en el texto se lee como una frase más, lo que impide usarlo como asistente.
- No expande siglas: "FBI" permanece "FBI"; si el sistema de voz necesita la expansión, hay que resolverla fuera del modelo.
- No genera fonemas, marcas de acentuación ni SSML; la única señal de pronunciación son las mayúsculas, una convención propia de Tontaube que otros sistemas de voz podrían querer deshacer.
- Dependencia del runtime: la revisión v1.1.0 requiere el código actual para convertir los marcadores de números largos y numerales romanos en palabras; versiones antiguas del código no lo hacen y solo funcionan con la revisión v1.0.0.
- Convenciones estadounidenses fijas: "one hundred fifty" sin "and" y mes antes del día en fechas ambiguas, lo que puede no encajar con variedades del inglés británico u otras convenciones de narración.
- Riesgo de alucinación acotado pero presente: el modelo no inventa cifras porque copia los caracteres entre marcadores y el runtime los verifica contra la entrada, pero las lecturas dependen del contexto y los mismos caracteres pueden verbalizarse de forma distinta en otra frase.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-1.7B y citar adecuadamente el proyecto.
- Madurez limitada: 27 descargas y 0 likes en el momento de la consulta, con una única revisión documentada; no hay benchmarks publicados que respalden su calidad frente a normalizadores basados en reglas.
- Requiere GPU NVIDIA según la documentación del autor; no se documenta una ruta de inferencia en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontaubeAI/TontaubeV1-Verbalizer
- Informe técnico: https://tontaube.ai/papers/tontaube-v1-technical-report.pdf
- Playground de Tontaube: https://tontaube.ai/playground
- Modelo TontaubeV1.1: https://huggingface.co/TontaubeAI/TontaubeV1.1
- Repositorio de inferencia: https://github.com/craitech/tontaube
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
