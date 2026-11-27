# twmht/parakeet-ultra-fp16

## Resumen

Parakeet-ultra-fp16 es una conversión al formato CTranslate2 del modelo de reconocimiento automático del habla (ASR) moondream/parakeet-ultra, que a su vez deriva de nvidia/parakeet-tdt-0.6b-v3. El autor de la conversión es el usuario twmht, que publica los pesos en precisión fp16 listos para inferencia eficiente con la librería CTranslate2. El modelo resuelve el problema de transcripción de audio a texto multilingüe con una arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores que predice de forma conjunta tokens y duraciones, lo que permite decodificación no autorregresiva por saltos y reduce la latencia frente a los transductores clásicos.

El interés actual de esta ficha radica en que empaqueta un modelo ASR de aproximadamente 0,6 mil millones de parámetros en un formato optimizado para CPU y GPU con CTranslate2, lo que facilita su despliegue en producción sin depender del ecosistema NeMo original. Cubre 25 idiomas europeos, entre ellos el español, y se distribuye bajo licencia CC-BY-4.0, aunque el repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face.

No se dispone de información publicada sobre el número exacto de tokens de entrenamiento, la composición del dataset ni resultados de benchmarks en la información proporcionada; los datos que siguen se limitan a lo declarado en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), transformer encoder-decoder con predicción conjunta de token y duración |
| Parametros totales | aproximadamente 0,6 mil millones (heredado de nvidia/parakeet-tdt-0.6b-v3; cifra no confirmada en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; la ventana depende de la duración del audio de entrada) |
| Tipos de cuantizacion | fp16 (pesos publicados en fp16); CTranslate2 admite además int8 e int8_float16 en el momento de la conversión |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | CTranslate2 (modelo convertido, librería ctranslate2); tamaño del repo 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (Token-and-Duration Transducer), una evolución de los transductores RNN-T en la que el decoder predice simultáneamente el siguiente token y su duración. Esta predicción de duración permite avanzar varios pasos del encoder en una sola iteración, lo que acelera la decodificación y reduce el coste computacional frente a la decodificación token a token. El modelo base es nvidia/parakeet-tdt-0.6b-v3, del que hereda el encoder y el decoder; moondream/parakeet-ultra lo reempaqueta y twmht/parakeet-ultra-fp16 lo convierte a CTranslate2 en fp16.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de técnicas de aumento de datos o de ajuste fino supervisado en la información proporcionada. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia formulación TDT.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en 25 idiomas europeos, incluido el español.
- Transcripción de audio a texto con marcas de tiempo a nivel de token o palabra, según la configuración de decodificación de CTranslate2.
- Decodificación eficiente en CPU y GPU gracias al formato CTranslate2 y a los pesos fp16.
- Manejo de audio de duración variable; el modelo procesa segmentos de audio y no tiene una ventana de contexto de texto fija.
- No soporta tool calling ni function calling: es un modelo especializado exclusivamente en ASR.
- No soporta razonamiento multi-paso, agentes ni generación de texto libre.
- No dispone de capacidades de visión ni de audio más allá de la transcripción.
- No se documenta un modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo convierte audio multilingüe en texto con marcas temporales, adecuado para generar actas automáticas en entornos corporativos con participantes de distintos países europeos.
- Subtitulado automático de vídeo: la salida con timestamps permite alinear subtítulos con el audio en plataformas de contenido, con soporte para 25 idiomas de salida según el idioma detectado.
- Atención al cliente basada en voz: integrado en un pipeline de ASR previo a un LLM, transcribe llamadas o mensajes de voz de usuarios en español, francés, alemán o italiano antes de pasarlos al modelo de lenguaje.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de grabaciones para indexación y búsqueda por texto en mediatecas y archivos periodísticos.
- Accesibilidad: generación de transcripciones en directo para personas con discapacidad auditiva en eventos y clases, con despliegue en CPU mediante CTranslate2.
- Procesamiento por lotes en servidores sin GPU: la conversión a CTranslate2 con cuantización int8 permite ejecutar la transcripción en infraestructura CPU, reduciendo costes frente a despliegues GPU.
- Investigación en lingüística computacional: corpus de audio en lenguas europeas minoritarias como el estonio, el letón o el esloveno para estudios comparativos de ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con pesos fp16 y aproximadamente 0,6 mil millones de parámetros, el modelo ocupa alrededor de 1,2 GB en memoria; en int8 se reduce a aproximadamente 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores; para mayor throughput, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: CTranslate2 (formato nativo del repositorio), con integración en servidores de inferencia compatibles con CTranslate2; no se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; la arquitectura TDT está diseñada para reducir la latencia frente a RNN-T clásicos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| twmht/parakeet-ultra-fp16 | ~0,6 B | 25 europeos | CC-BY-4.0 | CTranslate2 fp16 | Gated en Hugging Face |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible en la información | no disponible | NeMo | Hugging Face |
| moondream/parakeet-ultra | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Whisper large-v3 (referencia de la categoría) | ~1,55 B | ~99 | MIT | safetensors, CTranslate2, GGUF | Abierto |

Los datos de Whisper large-v3 se incluyen como referencia de categoría; no se dispone de comparativas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- No se documentan evaluaciones de sesgo; al ser un modelo ASR entrenado sobre corpus desconocidos, puede presentar peor rendimiento en acentos no representados en los datos de entrenamiento.
- Riesgo de errores de transcripción en audio con ruido, solapamiento de hablantes o vocabulario técnico especializado.
- La cobertura lingüística se limita a 25 idiomas europeos; no soporta lenguas asiáticas, africanas ni americanas fuera de las listadas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo base puede tener condiciones adicionales no reflejadas en la información disponible; conviene verificar la licencia de nvidia/parakeet-tdt-0.6b-v3 y de moondream/parakeet-ultra.
- No es un modelo de propósito general: no genera texto libre, no razona y no soporta tool calling, por lo que no debe emplearse fuera de tareas de ASR.
- El formato CTranslate2 limita la portabilidad a otros ecosistemas de inferencia sin una reconversión previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/twmht/parakeet-ultra-fp16
- Modelo base intermedio: https://huggingface.co/moondream/parakeet-ultra
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
