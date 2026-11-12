# TheStageAI/pocket-tts-100m-pl

## Resumen

pocket-tts-100m-pl es un modelo de síntesis de voz (text-to-speech) para polaco, derivado del fine-tune comunitario shefowl/pocket-tts-polish-6l, que a su vez parte de kyutai/pocket-tts. Lo publica TheStageAI y su propósito no es distribuir los pesos originales en formato de entrenamiento, sino empaquetar los motores Core ML optimizados para la Neural Engine (ANE) de Apple, de modo que el modelo pueda ejecutarse en macOS e iOS dentro del SDK de TheStage.

El modelo base es un estudiante destilado por profundidad de 6 capas con unos 100 millones de parámetros, según la nomenclatura del repositorio y la descripción de la model card. El autor del fine-tune reporta un WER del 8,5 % sobre un conjunto propio de 1339 enunciados, dato que conviene tratar con cautela porque no procede de una evaluación independiente. La arquitectura sigue el esquema de Pocket TTS de Kyutai: un flow LM con cabeza flow LSD que genera latentes acústicos y un decodificador Mimi que los convierte en audio.

La relevancia práctica es la inferencia local en dispositivos Apple: el paquete de motores ocupa 148 MB, con el flow LM en fp16 y capas transformer palettizadas a 6 bits (g8), y el decodificador Mimi en fp32 sobre CPU. La licencia CC-BY-4.0 permite uso comercial con atribución, aunque los motores van cifrados con QLPA y están pensados para el SDK propietario de TheStage.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai): flow LM transformer de 6 capas con cabeza flow LSD + decodificador Mimi |
| Parametros totales | ~100 M (según nomenclatura del repo y model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 con capas transformer palettizadas a 6 bits (g8) en el flow LM; decodificador Mimi en fp32 |
| Idiomas soportados | polaco (pl); voces de referencia en inglés incluidas en el bundle |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML / ANE engines (engines.zip, 148 MB), cifrado QLPA; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base shefowl/pocket-tts-polish-6l es un estudiante destilado por profundidad de 6 capas derivado de kyutai/pocket-tts, con dimensión d=1024 según la descripción del bundle. La generación de audio se reparte en dos etapas: un flow LM que produce latentes acústicos mediante una cabeza flow LSD y un decodificador Mimi que reconstruye la forma de onda. El fine-tune está especializado en polaco y toma como referencia la voz del autor del fine-tune (shefowl) como voz por defecto.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni los detalles del proceso de destilación más allá de la mención a la destilación por profundidad y al WER del 8,5 % reportado por el autor sobre 1339 enunciados. La innovación destacable de esta publicación es el empaquetado para Apple: el flow LM se ejecuta en la Neural Engine con capas palettizadas a 6 bits, mientras que el decodificador Mimi corre en CPU en fp32, una partición diseñada para minimizar el consumo energético en dispositivos móviles.

## Capacidades

- Síntesis de voz en polaco a partir de texto, con la voz shefowl como referencia por defecto.
- Incluye voces de referencia en inglés (azelma, alba, charles, cosette, javert, marius) dentro del bundle, aunque el idioma declarado del modelo es pl.
- Inferencia local en macOS e iOS mediante Core ML y la Neural Engine, sin depender de servidores externos.
- Integración con el SDK de TheStage (model_type: pocket-tts, bundle de idioma pl).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es un modelo exclusivamente text-to-speech.

## Casos de uso

- Lectura por voz de contenidos en polaco en aplicaciones iOS y macOS: el bundle Core ML de 148 MB permite empaquetar la síntesis dentro de la app y generar audio en el dispositivo sin conexión.
- Asistentes de accesibilidad: narración de texto de interfaz, notificaciones y documentos para usuarios con discapacidad visual, aprovechando la ejecución en ANE para reducir el consumo de batería.
- Audiolibros y prensa hablada: conversión de artículos o capítulos a voz polaca en pipelines por lotes, con la ventaja de que el modelo cabe holgadamente en dispositivos de gama alta.
- Aprendizaje de idiomas: reproducción de frases y ejercicios en polaco con una voz consistente, útil en apps educativas que ya distribuyan el SDK de TheStage.
- Prototipado de interfaces conversacionales: generación de respuestas habladas en asistentes de voz locales para macOS/iOS antes de invertir en infraestructura de servidor.
- Sistemas de navegación y avisos hablados: anuncios cortos generados en tiempo de ejecución en el dispositivo, donde la latencia de red sería inaceptable.
- Evaluación comparativa de TTS en polaco: uso del modelo como referencia local para medir WER y naturalidad frente a otros sistemas, teniendo en cuenta el WER del 8,5 % reportado por el autor.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| WER (conjunto propio de 1339 enunciados) | 8,5 % | Reportado por el autor del fine-tune shefowl/pocket-tts-polish-6l, no verificado de forma independiente |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni métricas estándar de TTS como MOS, CMOS o SIM. Tampoco hay datos de latencia o throughput en la información proporcionada.

## Requisitos de hardware

- Inferencia prevista para Apple Silicon con Neural Engine: macOS e iOS a través de Core ML; el paquete de motores ocupa 148 MB.
- El flow LM se ejecuta en ANE en fp16 con capas palettizadas a 6 bits; el decodificador Mimi corre en CPU en fp32.
- No se especifican modelos concretos de chip (M1, M2, A-series) ni requisitos mínimos de memoria; no disponible.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al tratarse de motores Core ML cifrados con QLPA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pocket-tts-100m-pl (TheStageAI) | ~100 M | pl | Core ML / ANE (QLPA) | CC-BY-4.0 | Motores para SDK de Apple; WER 8,5 % reportado por el autor del fine-tune |
| shefowl/pocket-tts-polish-6l | ~100 M (6 capas) | pl | no disponible | CC-BY-4.0 | Modelo base del que derivan estos motores |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | no disponible | Modelo original de Kyutai sobre el que se construye la familia |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El WER del 8,5 % procede del autor del fine-tune y no de una evaluación independiente; puede no reproducirse en dominios distintos.
- El modelo está especializado en polaco; las voces en inglés incluidas son referencias del bundle y no implican calidad de síntesis verificada en ese idioma.
- Los motores están cifrados con QLPA y empaquetados para el SDK de TheStage, lo que limita su uso fuera de ese ecosistema y complica la inspección o modificación de los pesos.
- No se documentan sesgos de voz, cobertura de acentos ni comportamiento ante texto con ruido, cifras o nombres propios.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero debe verificarse la compatibilidad con los términos del SDK de TheStage y del modelo base.
- Riesgo de alucinación acústica y de errores de pronunciación inherente a los sistemas TTS; no hay datos publicados sobre su magnitud en este modelo.
- No se especifican requisitos mínimos de hardware ni versiones de sistema operativo compatibles.

## Enlaces

- Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-pl
- Modelo base del fine-tune: https://huggingface.co/shefowl/pocket-tts-polish-6l
- Modelo original: https://huggingface.co/kyutai/pocket-tts
