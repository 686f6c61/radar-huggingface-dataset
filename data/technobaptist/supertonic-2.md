# TechnoBaptist/supertonic-2

## Resumen

Supertonic 2 es un sistema de síntesis de voz (text-to-speech) multilingüe desarrollado por Supertone Inc. y distribuido en este repositorio de HuggingFace por el usuario TechnoBaptist. Se trata de una segunda versión que amplía el soporte de idiomas del modelo original (inglés, coreano, español, portugués y francés) manteniendo la misma arquitectura y el mismo coste de inferencia. El modelo está diseñado para ejecución local en dispositivo ("on-device") mediante ONNX Runtime, sin llamadas a API en la nube ni envío de datos a terceros, y con un tamaño de tan solo 66 millones de parámetros y un repositorio de 0,3 GB.

Su propuesta de valor es el rendimiento en inferencia: con solo 2 pasos de muestreo alcanza hasta 167 veces el tiempo real (RTF de 0,006 en textos largos sobre M4 Pro con WebGPU), lo que lo sitúa muy por delante de alternativas abiertas como Kokoro o NeuTTS Air y de servicios en la nube como ElevenLabs Flash v2.5, OpenAI TTS-1 o Gemini 2.5 Flash TTS en las mediciones publicadas por el autor. Es relevante ahora porque permite integrar voz sintetizada de baja latencia en aplicaciones locales (escritorio, móvil, navegador vía WebGPU) sin depender de infraestructura externa.

La ficha se basa exclusivamente en la información de la model card y en los metadatos del repositorio; no se han publicado detalles sobre la arquitectura interna concreta, el dataset de entrenamiento ni métricas de calidad perceptual (MOS), por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de síntesis de voz ejecutada sobre ONNX Runtime; la model card no detalla la topología interna (no disponible) |
| Parametros totales | 66 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de contexto de LLM; la model card no especifica una longitud máxima de texto de entrada. Las pruebas publicadas usan entradas de 59, 152 y 266 caracteres |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas propias) |
| Idiomas soportados | Inglés (en), coreano (ko), español (es), portugués (pt), francés (fr) |
| Licencia | OpenRAIL-M para el modelo; el código de ejemplo del proyecto se publica bajo licencia MIT |
| Formato de pesos | ONNX (runtime principal); la model card menciona además un modelo PyTorch usado en las pruebas sobre RTX 4090 |

Otros metadatos: pipeline `text-to-speech`, librería `supertonic`, tamaño del repositorio 0,3 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 15 de septiembre de 2026.

## Arquitectura y entrenamiento

La información disponible indica que Supertonic 2 es un sistema TTS de 66 millones de parámetros, optimizado para despliegue en dispositivo y ejecutado mediante ONNX Runtime. El modelo opera con un esquema de muestreo iterativo configurable: la configuración principal publicada usa 2 pasos de inferencia y se ofrecen datos adicionales con 5 pasos, lo que sugiere un modelo generativo de pocos pasos (del tipo consistencia o flow matching), aunque la model card no especifica el tipo exacto de arquitectura ni el mecanismo de generación acústica.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el vocabulario/fonemizador empleado por idioma. Lo único confirmado sobre el proceso es que el modelo fue entrenado con PyTorch (licencia BSD 3-Clause, no redistribuida con el proyecto) y que todos los idiomas soportados comparten la misma arquitectura y el mismo pipeline de inferencia, lo que garantiza consistencia entre lenguas. La innovación declarada es mantener la velocidad del modelo original (hasta 167× tiempo real) añadiendo cobertura multilingüe sin degradación de rendimiento.

## Capacidades

- Síntesis de voz a partir de texto en cinco idiomas: inglés, coreano, español, portugués y francés.
- Inferencia completamente local mediante ONNX Runtime, sin llamadas a API ni conexión de red.
- Ejecución en CPU (probado en Apple M4 Pro), en WebGPU (navegador) y en GPU dedicada (probado en RTX 4090 con el modelo PyTorch).
- Generación de audio con dos configuraciones de calidad/velocidad: 2 pasos de inferencia (máximo rendimiento) y 5 pasos (mayor coste de cómputo).
- Manejo de entradas de distinta longitud con rendimiento creciente por carácter a medida que aumenta el texto (de 59 a 266 caracteres en las pruebas publicadas).
- Consistencia entre idiomas gracias a una arquitectura y pipeline de inferencia compartidos.
- No se documentan en la información disponible capacidades de clonación de voz, control de emociones o estilos, ni soporte de tool calling.

## Casos de uso

- Lectura por voz de documentos y artículos largos en local: el modelo procesa textos de cientos de caracteres con RTF de 0,001 en RTX 4090 (2 pasos) y 0,006 en M4 Pro con WebGPU, lo que permite narrar un documento completo en una fracción del tiempo de reproducción.
- Asistentes de voz embebidos en aplicaciones de escritorio o móviles: al ser un modelo de 66 M de parámetros y 0,3 GB, se puede empaquetar dentro del propio binario y funcionar sin conexión, eliminando costes por petición de APIs TTS.
- Interfaz de accesibilidad para personas con discapacidad visual: la inferencia en CPU a RTF de 0,012-0,015 permite leer pantalla en tiempo casi real en un portátil corriente, sin GPU dedicada.
- Sistemas de navegación y avisos en tiempo real: la latencia baja (0,005 s de audio generado por segundo de audio en RTX 4090) admite la generación de avisos cortos de forma interactiva.
- Aplicaciones web con síntesis en el navegador mediante WebGPU: la variante probada con WebGPU alcanza 2.509 caracteres por segundo en textos de 266 caracteres, suficiente para interfaces conversacionales en cliente sin backend de inferencia.
- Localización de contenido en cinco idiomas: al compartir arquitectura y pipeline entre lenguas, un mismo despliegue puede servir versiones en inglés, coreano, español, portugués y francés sin cambiar de modelo.
- Generación de audiolibros o podcasts automatizados en pipelines por lotes: el rendimiento de 12.164 caracteres por segundo en RTX 4090 permite procesar corpus extensos reduciendo el tiempo de síntesis a un porcentaje mínimo del tiempo de audio final.
- Prototipado de productos de voz con requisitos de privacidad: al no realizarse llamadas a servicios externos, el texto no sale del dispositivo, lo que facilita el cumplimiento de requisitos de tratamiento de datos.

## Benchmarks y rendimiento

Datos publicados por el autor con 2 pasos de inferencia (Short = 59 caracteres, Mid = 152 caracteres, Long = 266 caracteres). "Characters per Second" mide caracteres de entrada procesados por segundo (mayor es mejor); "RTF" mide el tiempo de síntesis respecto a la duración del audio generado (menor es mejor).

| Sistema | Short (car./s) | Mid (car./s) | Long (car./s) | RTF Short | RTF Mid | RTF Long |
|---|---|---|---|---|---|---|
| Supertonic (M4 Pro, CPU) | 912 | 1048 | 1263 | 0,015 | 0,013 | 0,012 |
| Supertonic (M4 Pro, WebGPU) | 996 | 1801 | 2509 | 0,014 | 0,007 | 0,006 |
| Supertonic (RTX 4090) | 2615 | 6548 | 12164 | 0,005 | 0,002 | 0,001 |
| ElevenLabs Flash v2.5 (API) | 144 | 209 | 287 | 0,133 | 0,077 | 0,057 |
| OpenAI TTS-1 (API) | 37 | 55 | 82 | 0,471 | 0,302 | 0,201 |
| Gemini 2.5 Flash TTS (API) | 12 | 18 | 24 | 1,060 | 0,673 | 0,541 |
| Supertone Sona speech 1 (API) | 38 | 64 | 92 | 0,372 | 0,206 | 0,163 |
| Kokoro (abierto, ONNX, M4 Pro CPU) | 104 | 107 | 117 | 0,144 | 0,124 | 0,126 |
| NeuTTS Air (abierto, Q8-GGUF, M4 Pro CPU) | 37 | 42 | 47 | 0,390 | 0,338 | 0,343 |

Resultados adicionales con 5 pasos de inferencia:

| Sistema | Short (car./s) | Mid (car./s) | Long (car./s) | RTF Short | RTF Mid | RTF Long |
|---|---|---|---|---|---|---|
| Supertonic (M4 Pro, CPU) | 596 | 691 | 850 | 0,023 | 0,019 | 0,018 |
| Supertonic (M4 Pro, WebGPU) | 570 | 1118 | 1546 | 0,024 | 0,012 | 0,010 |
| Supertonic (RTX 4090) | 1286 | 3757 | 6242 | 0,011 | 0,004 | 0,002 |

No se han publicado resultados de métricas de calidad perceptual (MOS o similares), evaluaciones de inteligibilidad ni comparativas de naturalidad en la información disponible. Las mediciones de las APIs en la nube se tomaron desde Seúl según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 66 M de parámetros, aproximadamente 0,26 GB en FP32 y 0,13 GB en FP16 para los pesos, más el coste del runtime ONNX y del decodificador de audio. En la práctica, el modelo cabe holgadamente en cualquier GPU con 1-2 GB de VRAM libre.
- GPU probadas por el autor: RTX 4090 (modelo PyTorch, 2.615-12.164 caracteres por segundo según longitud con 2 pasos) y Apple M4 Pro tanto en CPU como en WebGPU con ONNX.
- Inferencia en CPU: soportada y medida sobre M4 Pro (912-1.263 caracteres por segundo, RTF 0,012-0,015 con 2 pasos). No se especifican requisitos mínimos de CPU ni resultados en otras plataformas.
- GPU de consumo: sí cabe, y de forma muy holgada. Con 0,3 GB de repositorio y 66 M de parámetros es desplegable en GPUs integradas y en equipos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime como runtime principal (CPU y WebGPU en navegador), modelo PyTorch para GPU dedicada, y el código del proyecto publicado en el repositorio de GitHub de Supertone. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que son runtimes orientados a modelos de lenguaje.
- Latencia y throughput: RTF de 0,001-0,005 en RTX 4090 y 0,006-0,014 en M4 Pro con WebGPU usando 2 pasos; con 5 pasos el RTF sube a 0,002-0,011 en RTX 4090 y 0,010-0,024 en M4 Pro.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Car./s (Long) | RTF (Long) | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Supertonic 2 | TTS abierto, ONNX | 66 M | en, ko, es, pt, fr | OpenRAIL-M (modelo), MIT (código de ejemplo) | 1263 (M4 Pro CPU) / 12164 (RTX 4090) | 0,012 (CPU) / 0,001 (RTX 4090) | HuggingFace y GitHub |
| Kokoro | TTS abierto, ONNX | No disponible | No disponible | No disponible | 117 (M4 Pro CPU) | 0,126 | Repositorio abierto en GitHub |
| NeuTTS Air | TTS abierto, GGUF Q8 | No disponible | No disponible | No disponible | 47 (M4 Pro CPU) | 0,343 | Repositorio abierto en GitHub |
| ElevenLabs Flash v2.5 | Servicio en la nube | No aplica | No disponible | Propietaria | 287 | 0,057 | API de pago |
| OpenAI TTS-1 | Servicio en la nube | No aplica | No disponible | Propietaria | 82 | 0,201 | API de pago |

La model card no proporciona parámetros, licencias ni cobertura de idiomas de los sistemas comparados, por lo que esas celdas se marcan como no disponibles. La comparación se limita a las métricas de velocidad publicadas por el autor.

## Limitaciones y advertencias

- No se han publicado métricas de calidad de voz (MOS, similitud de hablante o inteligibilidad) en la información disponible, por lo que el rendimiento en naturalidad es desconocido.
- La model card no documenta sesgos de género, acento, edad o etnia en las voces generadas, ni el origen y composición de los datos de entrenamiento.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o sonidos no presentes en el texto de entrada, especialmente con números, siglas y nombres propios.
- Cobertura lingüística limitada a cinco idiomas. El español se identifica únicamente con el código `es`, sin especificar variantes de acento (peninsular, latinoamericano) ni registro de pronunciación.
- No se especifica la longitud máxima de texto de entrada; las mediciones publicadas solo cubren hasta 266 caracteres, por lo que el comportamiento con párrafos largos en una sola llamada no está documentado.
- Licencia OpenRAIL-M para el modelo: incluye restricciones de uso (prohibición de usos dañinos, suplantación de identidad, desinformación, etc.) que deben revisarse antes de un despliegue comercial. El código de ejemplo se rige por MIT.
- El artefacto de este repositorio está publicado por un tercero (TechnoBaptist) y no por el desarrollador original (Supertone Inc.), con 0 descargas y 0 likes en la fecha de consulta: conviene verificar la integridad de los pesos frente al repositorio oficial `Supertone/supertonic-2` antes de usarlos en producción.
- El número de pasos de inferencia afecta al rendimiento de forma notable (un factor de aproximadamente 2× entre 2 y 5 pasos); la elección del valor adecuado requiere validación propia en el caso de uso final.
- La fecha de creación y actualización del repositorio es el 15 de septiembre de 2026, sin actualizaciones posteriores registradas en los metadatos consultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/supertonic-2
- Repositorio oficial del modelo (referenciado en la model card): https://huggingface.co/Supertone/supertonic-2
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Supertone/supertonic-2
- Código en GitHub: https://github.com/supertone-inc/supertonic
- Licencia del código de ejemplo (MIT): https://github.com/supertone-inc/supertonic?tab=MIT-1-ov-file
- Licencia del modelo (OpenRAIL-M): https://huggingface.co/Supertone/supertonic-2/blob/main/LICENSE
- Licencia de PyTorch (BSD 3-Clause, dependencia de entrenamiento): https://docs.pytorch.org/FBGEMM/general/License.html
- ElevenLabs Flash v2.5 (comparativa): https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- OpenAI TTS-1 (comparativa): https://platform.openai.com/docs/guides/text-to-speech
- Gemini 2.5 Flash TTS (comparativa): https://ai.google.dev/gemini-api/docs/speech-generation
- Supertone Sona speech 1 (comparativa): https://docs.supertoneapi.com/en/api-reference/endpoints/text-to-speech
- Kokoro (comparativa): https://github.com/hexgrad/kokoro/
- NeuTTS Air (comparativa): https://github.com/neuphonic/neutts-air

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
