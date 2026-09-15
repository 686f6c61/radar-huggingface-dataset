# TechnoBaptist/supertonic

## Resumen

Supertonic es un sistema de síntesis de voz (text-to-speech, TTS) orientado a inferencia en dispositivo, distribuido principalmente como modelos ONNX y ejecutable sin llamadas a la nube. La ficha analizada corresponde al repositorio `TechnoBaptist/supertonic`, una copia alojada por un tercero del sistema original de Supertone; el repositorio registra 0 descargas y 0 "likes" y ocupa 0,3 GB. Según la model card, el modelo tiene 66 millones de parámetros y alcanza hasta 167 veces el tiempo real en hardware de consumo (M4 Pro), con un factor de tiempo real (RTF) de entre 0,001 y 0,015 según dispositivo y longitud de entrada.

El sistema está construido sobre ONNX Runtime, con variantes de ejecución en CPU, WebGPU y WASM, y se distribuye junto con voces predefinidas. La model card destaca el procesamiento nativo de números, fechas, divisas, abreviaturas y expresiones complejas sin preprocesado, además de inferencia por lotes y pasos de inferencia configurables. La salida es audio WAV de 16 bits.

Es relevante ahora porque cubre el nicho de TTS local de huella mínima: sus cifras de throughput declaradas superan en uno o dos órdenes de magnitud a las de APIs comerciales como ElevenLabs Flash v2.5, OpenAI TTS-1 o Gemini 2.5 Flash TTS, y también a alternativas abiertas como Kokoro o NeuTTS Air medidas en el mismo equipo. El idioma declarado en los metadatos es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; sistema TTS ejecutado sobre ONNX Runtime con pasos de inferencia configurables |
| Parámetros totales | 66 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; en la evaluación se usan entradas de 59, 152 y 266 caracteres |
| Tipos de cuantización | No disponible (se distribuyen modelos ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`). La tabla "Language Support" de la model card se refiere a lenguajes de programación, no a idiomas naturales |
| Licencia | openrail |
| Formato de pesos | ONNX (modelos y voces predefinidas descargados desde el repositorio de Hugging Face). En el benchmark sobre RTX 4090 se menciona el uso del modelo en PyTorch |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (tipo de encoder/decoder, mecanismo de atención, arquitectura del vocoder) ni el procedimiento de entrenamiento. Lo que sí se especifica es el runtime: ONNX Runtime como motor de inferencia multiplataforma optimizado para CPU, `onnxruntime-web` para ejecución en navegador y soporte de inferencia por lotes para aumentar el throughput. La model card advierte explícitamente que el modo GPU de ONNX Runtime no ha sido probado. La salida se genera como ficheros WAV de 16 bits.

En la evaluación de rendimiento se emplean 2 pasos de inferencia, parámetro que la propia documentación describe como configurable junto con el procesamiento por lotes. No hay datos sobre número de tokens de audio, composición del dataset, horas de voz utilizadas, idioma de entrenamiento ni técnicas de alineación (RLHF, DPO u otras), por lo que no es posible valorar la innovación técnica más allá de la eficiencia de inferencia y el trabajo de integración de runtimes.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida en WAV de 16 bits.
- Normalización de texto integrada: maneja números, fechas, divisas, abreviaturas y expresiones complejas sin preprocesado.
- Inferencia por lotes, pensada para aumentar el throughput en generación masiva de audio.
- Pasos de inferencia configurables, lo que permite ajustar la relación entre velocidad y calidad.
- Ejecución completamente local: sin nube, sin llamadas a API, con las implicaciones de privacidad que ello conlleva.
- Integraciones de ejemplo documentadas en Python, Node.js, navegador (WebGPU/WASM), Java, C++, C#, Go, Swift, iOS, Rust y Flutter.
- Uso de voces predefinidas ("preset voices") que se descargan junto con los modelos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo de razonamiento.
- No se documenta soporte multilingüe: el único idioma declarado es el inglés.

## Casos de uso

- Lectura por voz en aplicaciones de accesibilidad: con 66 M de parámetros y RTF cercano a 0,012 en CPU de un M4 Pro, el sistema puede sintetizar texto de lectores de pantalla en local sin depender de conectividad ni comprometer la privacidad del contenido leído.
- Asistentes de voz en dispositivos sin conexión: la ejecución vía ONNX Runtime en CPU o WebGPU permite integrar respuestas habladas en aplicaciones de escritorio y móviles donde no se puede asumir acceso a red.
- Notificaciones y avisos del sistema con lectura de datos variables: la normalización nativa de números, fechas y divisas evita tener que preprocesar mensajes del tipo "su pedido 48213 llega el 12/03 por 45,90 €".
- Generación masiva de audio en lote: el soporte de batch inference y las cifras medidas en RTX 4090 (hasta 12.164 caracteres por segundo en entradas largas) lo hacen adecuado para convertir catálogos, artículos o documentación en audio de forma desatendida.
- Demos y prototipos en navegador: la ruta de despliegue con `onnxruntime-web` y WebGPU permite ofrecer TTS en una página web sin servidor de inferencia, con 996 a 2.509 caracteres por segundo según longitud en un M4 Pro.
- Preproducción de locuciones y audiolibros: el RTF de 0,001 a 0,002 en RTX 4090 permite iterar sobre variantes de un guion completo en segundos, aunque no se dispone de métricas de naturalidad (MOS) para validar la calidad final.
- Sistemas de respuesta vocal interactiva (IVR) en instalaciones locales: la latencia baja por diseño y la ausencia de coste por llamada encajan en centralitas o kioscos con volumen alto y requisitos de confidencialidad.
- Aplicaciones móviles nativas: los ejemplos en Swift, iOS y Flutter permiten empotrar el modelo en la app y generar voz sin enviar texto del usuario a terceros.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con 2 pasos de inferencia. No se han publicado resultados de benchmarks de calidad de voz (MOS, similitud de hablante) en la información disponible.

Caracteres por segundo (mayor es mejor):

| Sistema | Corto (59 car.) | Medio (152 car.) | Largo (266 car.) |
|---|---|---|---|
| Supertonic (M4 Pro, CPU) | 912 | 1.048 | 1.263 |
| Supertonic (M4 Pro, WebGPU) | 996 | 1.801 | 2.509 |
| Supertonic (RTX 4090) | 2.615 | 6.548 | 12.164 |
| ElevenLabs Flash v2.5 (API) | 144 | 209 | 287 |
| OpenAI TTS-1 (API) | 37 | 55 | 82 |
| Gemini 2.5 Flash TTS (API) | 12 | 18 | 24 |
| Supertone Sona speech 1 (API) | 38 | 64 | 92 |
| Kokoro (abierto) | 104 | 107 | 117 |
| NeuTTS Air (abierto) | 37 | 42 | 47 |

Factor de tiempo real, RTF (menor es mejor):

| Sistema | Corto (59 car.) | Medio (152 car.) | Largo (266 car.) |
|---|---|---|---|
| Supertonic (M4 Pro, CPU) | 0,015 | 0,013 | 0,012 |
| Supertonic (M4 Pro, WebGPU) | 0,014 | 0,007 | 0,006 |
| Supertonic (RTX 4090) | 0,005 | 0,002 | 0,001 |
| ElevenLabs Flash v2.5 (API) | 0,133 | 0,077 | 0,057 |
| OpenAI TTS-1 (API) | 0,471 | 0,302 | 0,201 |

Notas de metodología declaradas por el autor: las APIs se midieron desde Seúl; Supertonic en M4 Pro se probó con ONNX; Supertonic en RTX 4090 se probó con el modelo en PyTorch; Kokoro se probó en CPU de M4 Pro con ONNX y NeuTTS Air en CPU de M4 Pro con Q8-GGUF. La model card se interrumpe durante la tabla de RTF, por lo que las filas restantes (Gemini 2.5 Flash TTS, Supertone Sona speech 1, Kokoro y NeuTTS Air) no están disponibles.

## Requisitos de hardware

- Estimación a partir del recuento de 66 M de parámetros, sin contar activaciones ni búferes de audio: en torno a 264 MB en FP32 y 132 MB en FP16. Los pesos ONNX distribuidos ocupan 0,3 GB en total, incluyendo voces predefinidas.
- Cabe en cualquier GPU de consumo y en la mayoría de equipos sin GPU dedicada: el benchmark oficial usa CPU y GPU integrada de un M4 Pro, además de una RTX 4090.
- GPU de referencia en los datos publicados: RTX 4090 para la medición más rápida. No se documentan pruebas en A100, H100 ni otras GPU de centro de datos.
- Opciones de despliegue: ONNX Runtime en Python, Node.js, Java, C++, C#, Go, Rust y Swift; `onnxruntime-web` con WebGPU o WASM para navegador; ejemplos específicos para iOS y Flutter. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: RTF de 0,015 a 0,012 en CPU de M4 Pro, de 0,014 a 0,006 con WebGPU en el mismo equipo y de 0,005 a 0,001 en RTX 4090. En caracteres por segundo, de 912 a 1.263 en CPU de M4 Pro y de 2.615 a 12.164 en RTX 4090. La model card afirma hasta 167 veces el tiempo real en hardware de consumo.
- El modo GPU de ONNX Runtime no está probado según la documentación oficial; el rendimiento en GPU se midió con el modelo en PyTorch.

## Comparativa con modelos similares

| Sistema | Tipo | Caracteres/s (largo, 266 car.) | RTF (largo) | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Supertonic | Abierto, on-device | 1.263 (M4 Pro CPU) / 12.164 (RTX 4090) | 0,012 / 0,001 | 66 M | No disponible | openrail | Hugging Face y GitHub |
| Kokoro | Abierto | 117 (M4 Pro CPU, ONNX) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| NeuTTS Air | Abierto | 47 (M4 Pro CPU, Q8-GGUF) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| ElevenLabs Flash v2.5 | API comercial | 287 | 0,057 | No aplica | No disponible | Propietaria | Servicio en la nube |
| OpenAI TTS-1 | API comercial | 82 | 0,201 | No aplica | No disponible | Propietaria | Servicio en la nube |
| Gemini 2.5 Flash TTS | API comercial | 24 | No disponible | No aplica | No disponible | Propietaria | Servicio en la nube |
| Supertone Sona speech 1 | API comercial | 92 | No disponible | No aplica | No disponible | Propietaria | Servicio en la nube |

La comparación se limita a las métricas de velocidad publicadas por el autor. No hay datos comparativos de calidad de voz, consumo de memoria ni precisión en la normalización de texto.

## Limitaciones y advertencias

- Idioma: los metadatos declaran únicamente inglés. No hay evidencia de soporte de castellano ni de otras lenguas, y la tabla de "Language Support" de la model card se refiere a lenguajes de programación.
- Procedencia del repositorio: `TechnoBaptist/supertonic` es una copia alojada por un tercero, no la publicación del desarrollador original (Supertone). Con 0 descargas, 0 "likes" y sin verificación aparente, conviene descargar los pesos desde `Supertone/supertonic` para evitar artefactos alterados.
- Ausencia de datos de entrenamiento: no se documentan dataset, horas de audio, número de hablantes ni procesos de alineación. No es posible evaluar sesgos de voz, cobertura de acentos o comportamiento ante dominios no vistos.
- Riesgo de errores de pronunciación y prosodia: un modelo de 66 M de parámetros con 2 pasos de inferencia prioriza la velocidad; no hay métricas de MOS ni de similitud de hablante que respalden la naturalidad.
- Sin benchmarks de calidad: las únicas cifras publicadas son de throughput y RTF, medidas por el propio autor, lo que introduce un sesgo de autoevaluación.
- El modo GPU de ONNX Runtime no está probado; el rendimiento en GPU se midió con PyTorch, un runtime distinto del que se distribuye para producción.
- Las entradas más largas evaluadas son de 266 caracteres. Se desconoce el comportamiento con párrafos extensos y si existe truncado o degradación.
- Licencia openrail: incluye cláusulas de uso responsable que restringen determinados fines (por ejemplo, usos engañosos o dañinos). Conviene revisar el texto completo antes de un uso comercial y verificar si la licencia de esta copia coincide con la del repositorio original.
- No se documentan marcas de agua ni mecanismos de identificación de audio sintético, un requisito relevante en despliegues públicos.
- La fecha de creación y actualización del repositorio figura como 15 de septiembre de 2026, posterior a la fecha de consulta habitual de estos datos; conviene confirmar la vigencia del artefacto.
- Los resultados de búsqueda web recopilados no contienen información relacionada con el modelo: son entradas sobre un piloto de Fórmula 1 y no se han utilizado como fuente.

## Enlaces

- Repositorio analizado: https://huggingface.co/TechnoBaptist/supertonic
- Repositorio original del modelo: https://huggingface.co/Supertone/supertonic
- Repositorio de código: https://github.com/supertone-inc/supertonic
- Demo interactiva: https://huggingface.co/spaces/Supertone/supertonic#interactive-demo
- Aplicación en Hugging Face: https://huggingface.co/spaces/akhaliq/supertonic
- ElevenLabs Flash v2.5 (referencia de comparación): https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- OpenAI TTS-1 (referencia de comparación): https://platform.openai.com/docs/guides/text-to-speech
- Gemini 2.5 Flash TTS (referencia de comparación): https://ai.google.dev/gemini-api/docs/speech-generation
- Supertone Sona speech 1 (referencia de comparación): https://docs.supertoneapi.com/en/api-reference/endpoints/text-to-speech
- Kokoro (referencia de comparación): https://github.com/hexgrad/kokoro/
- NeuTTS Air (referencia de comparación): https://github.com/neuphonic/neutts-air
- Artículo o publicación técnica del modelo: no disponible
- Resultados de la búsqueda web: no relevantes para este modelo (corresponden a un piloto de Fórmula 1)
