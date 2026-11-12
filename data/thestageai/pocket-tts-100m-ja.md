# TheStageAI/pocket-tts-100m-ja

## Resumen

pocket-tts-100m-ja es un paquete de motores Core ML y ANE (Apple Neural Engine) para el modelo de síntesis de voz japonesa `takuma104/pocket-tts-ja-cc`, un fine-tune de 100 millones de parámetros derivado de `kyutai/pocket-tts`. Lo publica TheStageAI como parte del TheStage Apple SDK, con identificador de tipo de modelo `pocket-tts` y bundle de idioma `ja`. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión y empaquetado del fine-tune de takuma104 para su ejecución optimizada en hardware Apple.

El modelo base parte del TTS en inglés de Kyutai, con 24 capas, y fue destilado en profundidad hasta 6 capas y ajustado con datos exclusivamente bajo licencia CC-BY para el idioma japonés. El resultado es un modelo compacto (100M de parámetros declarados) orientado a inferencia local en dispositivos Apple, lo que lo hace relevante para aplicaciones de lectura en voz alta, asistentes y accesibilidad en japonés que necesitan ejecutarse sin conexión y con baja latencia.

La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta, lo que indica una publicación muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en pocket-tts (kyutai/pocket-tts), transformer de 6 capas tras destilación en profundidad desde 24 capas |
| Parametros totales | 100M (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (empaquetado como motores Core ML / ANE) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML / ANE engines (TheStage Apple SDK); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `takuma104/pocket-tts-ja-cc`, un fine-tune del TTS inglés `kyutai/pocket-tts`. Según la model card, el modelo original de 24 capas fue destilado en profundidad hasta 6 capas y ajustado únicamente con datos bajo licencia CC-BY para el idioma japonés. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

El artefacto publicado por TheStageAI no contiene los pesos en formato convencional, sino los motores Core ML y ANE compilados para el TheStage Apple SDK, con `model_type: pocket-tts` y bundle de idioma `ja`. Esto implica que la inferencia se ejecuta a través del runtime de TheStage sobre Core ML, aprovechando el Neural Engine de los chips Apple. No se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto de entrada.
- Ejecución optimizada en hardware Apple mediante Core ML y el Neural Engine (ANE).
- Integración con el TheStage Apple SDK bajo el tipo de modelo `pocket-tts`.
- Modelo compacto de 100M de parámetros, adecuado para inferencia local en dispositivo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; se trata de un modelo puramente TTS.
- Cobertura multilingüe limitada al japonés (bundle `ja`).

## Casos de uso

- Lectura en voz alta de artículos y documentos en japonés dentro de aplicaciones iOS y macOS: el modelo se ejecuta sobre ANE y permite sintetizar texto sin conexión, reduciendo costes de API y latencia de red.
- Accesibilidad para usuarios con discapacidad visual: integración en apps de lectura de pantalla en japonés con inferencia local y sin dependencia de servicios en la nube.
- Asistentes de voz embebidos en apps Apple: el bundle `ja` del SDK permite generar respuestas habladas en japonés dentro de flujos conversacionales gestionados por la aplicación.
- Audiolibros y pódcast generados: síntesis por lotes de capítulos o guiones en japonés, aprovechando el tamaño reducido del modelo (0,4 GB de repo) para empaquetarlo junto a la app.
- Aprendizaje de idiomas: generación de pronunciaciones y frases de ejemplo en japonés en aplicaciones educativas que requieren funcionamiento offline.
- Prototipado rápido de interfaces de voz: al estar empaquetado como motores Core ML listos para el SDK, permite validar experiencias de voz en japonés sin entrenar ni convertir modelos propios.
- Sistemas de navegación o domótica con avisos hablados en japonés en dispositivos Apple, donde la baja latencia del ANE es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: chips Apple con Neural Engine (ANE), ya que el artefacto son motores Core ML/ANE para el TheStage Apple SDK.
- VRAM estimada: no disponible; al ejecutarse en ANE no se aplica el concepto de VRAM de GPU dedicada. El repositorio ocupa 0,4 GB, lo que da una idea del orden de magnitud del artefacto empaquetado.
- GPU recomendadas: no aplica; el despliegue está pensado para Apple Silicon y dispositivos Apple con ANE.
- Cabe en hardware de consumo: sí, en la familia de dispositivos Apple compatibles con el SDK; no se especifican modelos concretos.
- Opciones de despliegue: TheStage Apple SDK con Core ML; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| TheStageAI/pocket-tts-100m-ja | 100M | no disponible | ja | CC-BY-4.0 | Core ML / ANE (TheStage SDK) |
| takuma104/pocket-tts-ja-cc | no disponible (base de 6 capas destiladas) | no disponible | ja | CC-BY-4.0 | pesos del modelo base; formato no disponible |
| kyutai/pocket-tts | no disponible (24 capas en el original) | no disponible | en (base) | no disponible en la informacion | pesos del modelo original; formato no disponible |

No se dispone de datos de rendimiento comparado (MOS, latencia, WER) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta japonés; no es adecuado para otros idiomas sin un fine-tune adicional.
- Es un modelo TTS: no realiza comprensión, razonamiento ni generación de texto.
- Al ser una destilación de 24 a 6 capas, es previsible una pérdida de calidad frente al modelo original, aunque no se aportan métricas que lo cuantifiquen.
- No se documentan sesgos específicos del dataset de entrenamiento; al haberse entrenado solo con datos CC-BY, la diversidad de voces y estilos puede ser limitada.
- Riesgo de alucinación acústica y errores de pronunciación en texto no visto; no hay evaluaciones publicadas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero obliga a citar la autoría; conviene revisar los términos del TheStage Apple SDK para el despliegue.
- El artefacto está atado al runtime de TheStage y a Core ML/ANE; no es portable a GPUs NVIDIA ni a entornos de servidor convencionales.
- Publicación muy reciente y sin descargas registradas: no hay evidencia de comunidad ni soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-ja
- Modelo base (fine-tune japonés): https://huggingface.co/takuma104/pocket-tts-ja-cc
- Modelo original: https://huggingface.co/kyutai/pocket-tts
