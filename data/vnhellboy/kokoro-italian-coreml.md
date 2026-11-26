# vnhellboy/kokoro-italian-coreml

## Resumen

Kokoro-82M Italian Core ML es una conversión a Core ML del modelo de síntesis de voz Kokoro-82M de hexgrad, empaquetada como una cadena de siete etapas optimizada para ejecutarse en la Neural Engine (ANE) de los chips Apple. La publica el usuario vnhellboy y reutiliza la estructura de etapas del repositorio FluidInference/kokoro-82m-coreml, añadiendo los dos packs de voces en italiano que hexgrad distribuye con el modelo original: `if_sara` (voz femenina) e `im_nicola` (voz masculina).

El modelo resuelve el problema de desplegar TTS de calidad en dispositivos Apple sin depender de Python ni de frameworks de inferencia pesados, aprovechando la aceleración por hardware de Core ML. Con 82 millones de parámetros, es un modelo compacto pensado para inferencia local en macOS e iOS. El repositorio ocupa aproximadamente 0,1 GB e incluye un `manifest.json` con tamaños y hashes SHA-256 de cada fichero.

La relevancia de esta ficha radica en su carácter de artefacto de despliegue: no es un modelo entrenado desde cero, sino una conversión de pesos con un contrato de entrada muy específico (fonemas generados por misaki 0.9.4 con `EspeakG2P(language="it")`), lo que condiciona por completo su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (StyleTTS2-like con decodificador ISTFTNet), convertida a cadena Core ML de 7 etapas para ANE |
| Parametros totales | 82 millones (modelo base Kokoro-82M v1.0) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por fonemas, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos de voz en float32; cuantizacion del resto no especificada) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodelc` dentro de `ANE/`), `vocab.json`, packs de voz en `.bin` float32 de forma `[510, 256]` |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M v1.0 de hexgrad, un TTS de 82 millones de parámetros derivado de la familia StyleTTS2, que combina un encoder de estilo y texto con un decodificador basado en ISTFTNet para generar waveform directamente. Esta conversión no entrena pesos nuevos: reproduce el modelo como una cadena de siete etapas Core ML que FluidAudio ejecuta mediante su clase `KokoroAneManager`, tomando como referencia las etapas del directorio `ANE/` de FluidInference/kokoro-82m-coreml.

La innovación técnica de este artefacto es el empaquetado: los packs de voz de hexgrad se convierten a ficheros `.bin` planos en float32 con forma `[510, 256]`, y se incluye además el pack por defecto de FluidAudio (`af_heart.bin`). La entrada debe ser exactamente fonemas producidos por misaki 0.9.4 con `EspeakG2P(language="it")` sobre eSpeak NG, que es la representación con la que hexgrad entrenó las voces. No se dispone de información sobre el dataset de entrenamiento original ni sobre el uso de RLHF o DPO, ya que la model card no lo detalla.

## Capacidades

- Síntesis de voz (text-to-speech) en italiano a partir de texto fonemizado.
- Dos voces italianas incluidas: `if_sara` (femenina) e `im_nicola` (masculina).
- Ejecución acelerada en la Neural Engine de Apple mediante Core ML.
- Incluye `vocab.json` para el mapeo de fonemas y `manifest.json` con tamaños y SHA-256 de todos los ficheros.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de TTS.
- No soporta otros idiomas distintos del italiano en esta conversión.
- No incluye capacidades de visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de artículos y documentos en apps iOS/macOS: el modelo se integra como cadena Core ML y sintetiza texto en italiano en local, sin enviar contenido a servidores externos, gracias a su tamaño de 82 M de parámetros y su ejecución en ANE.
- Accesibilidad para usuarios italohablantes: conversión de texto a voz en lectores de pantalla y apps de asistencia, con dos voces disponibles para alternar según preferencia.
- Asistentes de voz embebidos en aplicaciones nativas Apple: al ejecutarse sobre Core ML y ANE, permite respuestas habladas en italiano con baja latencia y sin dependencia de red.
- Generación de audio para contenido educativo: narración de materiales didácticos en italiano dentro de apps de aprendizaje, con control de voz masculina o femenina.
- Audiolibros y podcasts generados localmente: procesamiento por lotes de texto fonemizado con misaki 0.9.4 y síntesis posterior mediante la cadena Core ML, sin coste por token ni por carácter.
- Prototipado de interfaces conversacionales en italiano: integración en apps de demostración donde se requiere TTS on-device para evitar latencia de red y cumplir requisitos de privacidad.
- Pruebas de pipelines TTS multilingües: uso como eslabón italiano dentro de un sistema mayor que ya utiliza otras variantes de Kokoro, aprovechando el mismo contrato de fonemas de misaki.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en Apple Silicon mediante Core ML y la Neural Engine, no en GPU NVIDIA.
- GPU recomendadas: no aplica en el sentido convencional; requiere chips Apple con ANE (series M1 en adelante y chips A recientes en iOS).
- Cabe en hardware de consumo: sí, con 82 M de parámetros y un repositorio de 0,1 GB, es apto para Mac y dispositivos iOS modernos.
- Opciones de despliegue: Core ML a través de FluidAudio (`KokoroAneManager`); no se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponible; la model card no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| vnhellboy/kokoro-italian-coreml | 82 M | no disponible | Italiano | Apache 2.0 | Core ML |
| hexgrad/Kokoro-82M | 82 M | no disponible | Multilingüe (packs de voces) | Apache 2.0 | PyTorch/safetensors |
| FluidInference/kokoro-82m-coreml | 82 M | no disponible | Inglés (pack por defecto) | no disponible en la informacion proporcionada | Core ML |

La comparación con otros TTS de tamaño similar (por ejemplo, modelos de la familia VITS o Piper) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La entrada debe ser exactamente fonemas generados por misaki 0.9.4 con `EspeakG2P(language="it")`; cualquier otro tokenizador o versión puede degradar la calidad o producir errores.
- Solo soporta italiano; no hay voces ni fonemas para otros idiomas en esta conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Al ser una conversión de terceros (vnhellboy) sobre el trabajo de hexgrad y FluidInference, la calidad final depende de la fidelidad de la conversión a Core ML; no se publican métricas de MOS ni comparativas con el modelo original.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta ante fonemización defectuosa del texto de entrada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes de origen (Kokoro-82M, FluidAudio y los packs de voces) antes de redistribuir.
- No se especifican sesgos de las voces; al derivar de un corpus de entrenamiento no documentado en esta ficha, no es posible evaluar sesgos de género, acento o registro.
- El modelo está atado al ecosistema Apple; no es desplegable en Linux, Windows o servidores sin ANE.

## Enlaces

- [Hugging Face: vnhellboy/kokoro-italian-coreml](https://huggingface.co/vnhellboy/kokoro-italian-coreml)
- [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [FluidInference/kokoro-82m-coreml](https://huggingface.co/FluidInference/kokoro-82m-coreml)
