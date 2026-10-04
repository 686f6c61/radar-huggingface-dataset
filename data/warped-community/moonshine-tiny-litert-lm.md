# warped-community/moonshine-tiny-litert-lm

## Resumen

warped-community/moonshine-tiny-litert-lm es un espejo en formato LiteRT (antiguo TensorFlow Lite) del modelo de reconocimiento automatico del habla Moonshine Tiny, mantenido por el proyecto warped-community para su aplicacion Android Warped. El modelo subyacente es Moonshine Tiny, un modelo encoder-decoder de aproximadamente 27 millones de parametros desarrollado por Moonshine AI (anteriormente Useful Sensors) y presentado en el articulo "Moonshine: Speech Recognition for Live Transcription and Voice Commands". No se trata por tanto de un modelo de generacion de texto, sino de un sistema de speech-to-text optimizado para inferencia en dispositivo.

La relevancia de esta version concreta esta en el formato de despliegue: al estar empaquetada como LiteRT-LM, permite ejecutar transcripcion de voz en moviles Android sin conexion a la nube, integrandose con la app Warped para chat local con modelos de IA. El repositorio ocupa aproximadamente 0,1 GB, dispone de licencia MIT y esta publicado bajo la libreria litert-lm.

Conviene senalar que la ficha original es minima: solo indica la fuente (litert-community/moonshine-tiny), el modelo base (UsefulSensors/moonshine-tiny) y su proposito. No se aportan datos de benchmarks, cuantizacion ni idiomas en la informacion disponible, por lo que varios campos se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (modelo base Moonshine Tiny; transcripcion de voz) |
| Parametros totales | ~27 millones (segun informacion publica del modelo base Moonshine Tiny) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa secuencias de audio de longitud variable, no una ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (segun informacion publica del modelo base); no confirmado para esta conversion |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (libreria litert-lm) |

## Arquitectura y entrenamiento

El modelo base Moonshine Tiny es un transformer encoder-decoder orientado a reconocimiento de voz, con alrededor de 27 millones de parametros. Segun la descripcion publica, su diseno se centra en inferencia rapida en dispositivo y en el procesamiento de audio de longitud variable en lugar de forzar el padding a ventanas fijas de 30 segundos, un enfoque habitual en otros sistemas ASR. Esta pensado para transcripcion en vivo y comandos de voz en ingles.

No se dispone en la informacion proporcionada de datos concretos sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en modelos ASR). Esta version concreta (warped-community/moonshine-tiny-litert-lm) no describe un proceso de entrenamiento propio: se presenta como un espejo del modelo litert-community/moonshine-tiny, es decir, una conversion del modelo base al formato LiteRT-LM para su ejecucion en Android.

Se desconoce igualmente si la conversion introduce cuantizacion, cambios de precision o wrappers adicionales para LiteRT-LM, extremo que la model card no detalla.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) en ingles, segun la informacion del modelo base.
- Transcripcion en vivo orientada a baja latencia y ejecucion local en dispositivo.
- Reconocimiento de comandos de voz, segun la descripcion del articulo asociado al modelo base.
- Inferencia sin conexion a la nube mediante el runtime LiteRT-LM.
- Integracion prevista con la aplicacion Android Warped para procesamiento de audio local.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad de generacion de texto, razonamiento, codigo o matematicas.
- No se documenta soporte de vision ni de audio mas alla de la propia entrada de voz a transcribir.
- Cobertura multilingue: no disponible (la informacion publica del modelo base apunta a ingles).

## Casos de uso

- Transcripcion de voz en tiempo real en Android: el modelo, empaquetado en LiteRT-LM, permite convertir voz a texto directamente en el dispositivo, sin enviar audio a servidores externos, lo que encaja con escenarios de privacidad estricta.
- Comandos de voz en aplicaciones moviles: al estar disenado para reconocimiento de comandos, puede alimentar interfaces de control por voz en apps Android con latencia reducida.
- Dictado offline: util para aplicaciones de toma de notas que necesitan funcionar sin conectividad, dado que el modelo corre localmente y ocupa un repositorio de ~0,1 GB.
- Accesibilidad: subtitulado automatico de conversaciones o contenido hablado para usuarios con discapacidad auditiva, ejecutado en el propio terminal.
- Preprocesado de voz en pipelines locales de asistentes: la transcripcion puede actuar como primer paso antes de pasar el texto a un modelo de lenguaje local (por ejemplo, en la propia app Warped).
- Sistemas embebidos o con recursos limitados: con unos 27M de parametros, es candidato para dispositivos con poca memoria o sin GPU dedicada.
- Aplicaciones con requisitos de cumplimiento normativo: al no requerir envio de audio a la nube, simplifica el tratamiento de datos personales sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de WER (Word Error Rate), latencia ni comparativas numericas con otros modelos.

## Requisitos de hardware

- Parametros: ~27M, lo que implica un peso en memoria muy reducido (del orden de decenas de MB en precision de 16 bits, menor aun en cuantizacion de 8 bits; el dato exacto de la conversion no esta disponible).
- Tamano del repositorio: ~0,1 GB.
- Cabe holgadamente en GPU de consumo e incluso en moviles; es un modelo disenado para inferencia en dispositivo, no para servidores de gran escala.
- GPU de escritorio: cualquier GPU moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente; no se documentan requisitos especificos.
- Aceleradores de servidor (A100, H100) no son necesarios para este modelo.
- Despliegue: runtime LiteRT/LiteRT-LM en Android; la model card lo vincula explicitamente a la app Warped, que tambien soporta llama.cpp y conexiones a OpenAI, Anthropic, Ollama y LM Studio (estas ultimas para otros modelos, no para este).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| warped-community/moonshine-tiny-litert-lm | ~27M (modelo base) | ASR (speech-to-text) | MIT | LiteRT/TFLite, espejo para Android |
| litert-community/moonshine-tiny | ~27M (modelo base) | ASR | MIT | LiteRT (fuente original del espejo) |
| UsefulSensors/moonshine-tiny | ~27M | ASR | MIT | Pesos originales del modelo base |
| Whisper Tiny (referencia externa) | ~39M | ASR | MIT | Multiples formatos |

Nota: la comparativa se limita a parametros, tarea, licencia y disponibilidad, ya que no se han facilitado datos de rendimiento que permitan una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Es un modelo de reconocimiento de voz, no un modelo de lenguaje: no genera texto libre ni razona; su salida esperada es una transcripcion.
- Idiomas: la informacion publica del modelo base apunta a ingles; la cobertura multilingue no esta documentada.
- No hay datos publicados sobre sesgos, tasa de error ni comportamiento en acentos o dominios especificos.
- Riesgo de errores de transcripcion inherente a los sistemas ASR (ruido, solapamiento de voces, vocabulario tecnico), sin metricas disponibles para cuantificarlo.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta, mantenido por una comunidad pequena: soporte y mantenimiento no garantizados.
- La model card es minima y no detalla cuantizacion, precision ni cambios respecto al modelo base; conviene verificar el comportamiento real antes de usarlo en produccion.
- Licencia MIT, que permite uso comercial, pero se recomienda revisar tambien las condiciones del modelo base (UsefulSensors/moonshine-tiny) y del repositorio fuente (litert-community/moonshine-tiny).
- Conviene no confundir este artefacto con un LLM de chat; la integracion en la app Warped corresponde al componente de voz, no al de generacion de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/warped-community/moonshine-tiny-litert-lm
- Fuente original del espejo: https://huggingface.co/litert-community/moonshine-tiny
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Repositorio del proyecto Moonshine: https://github.com/moonshine-ai/moonshine
- Modelos micro de Moonshine (incluye tiny): https://github.com/moonshine-ai/moonshine/tree/main/micro/models
- Espejo alternativo en HuggingFace (autodroid): https://huggingface.co/devendradhakad/autodroid-litert-community-moonshine-tiny
- Ficha de referencia con contexto de benchmarks: https://free2aitools.com/model/litert-community/moonshine-tiny
- Web de la aplicacion Warped: https://cotizcesar.github.io/warped-website/
- Discusion del modelo en litert-community (usage script): https://huggingface.co/litert-community/moonshine-tiny/discussions/1/files
