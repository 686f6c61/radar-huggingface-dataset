# Veronyka/livecaption

## Resumen

LiveCaption es un proyecto personal de código abierto desarrollado por el usuario Veronyka que implementa un sistema de subtitulado en vivo con traducción simultánea, ejecutado íntegramente en local sobre macOS con Apple Silicon. No se trata de un modelo de lenguaje entrenado desde cero, sino de una aplicación en Swift que orquesta dos modelos abiertos: Whisper (en su variante *small*, ejecutada mediante WhisperKit y CoreML) para el reconocimiento automático del habla, y un modelo de traducción (Hy-MT2-1.8B, servido a través de Ollama) para la traducción en tiempo real. El par de idiomas por defecto es portugués → español, aunque tanto el idioma de origen como el de destino son configurables.

El problema que resuelve es el del subtitulado con traducción en vivo sin depender de la nube: el audio del micrófono se procesa en memoria, no hay telemetría ni cuentas, y la única red utilizada en ejecución normal es `localhost` (el servidor local de Ollama). El repositorio distribuye únicamente código fuente; los pesos de los modelos se descargan desde sus repositorios oficiales mediante un script (`fetch_models.sh`).

La relevancia actual radica en su enfoque *local-first* sobre hardware de consumo: se ha medido en un único MacBook Air M2 con 16 GB de RAM, con una latencia mediana de 0,17 s hasta la primera palabra traducida y 0,60 s hasta la traducción completa de la frase. El proyecto está etiquetado con licencia MIT y soporta portugués, español e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación Swift que orquesta Whisper (transformer encoder-decoder, vía WhisperKit/CoreML) y un modelo de traducción servido por Ollama |
| Parametros totales | No disponible para el conjunto; el modelo de traducción por defecto (Hy-MT2-1.8B) tiene 1.800 millones de parámetros; Whisper small no especificado en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (Whisper en formato CoreML; el traductor se importa en Ollama, cuantización no especificada) |
| Idiomas soportados | Portugués (pt), español (es), inglés (en); origen y destino configurables vía `LC_SRC` / `LC_DST` |
| Licencia | MIT |
| Formato de pesos | CoreML (WhisperKit) para el ASR; modelo de traducción importado en Ollama (formato no especificado); el repositorio contiene solo código fuente |

## Arquitectura y entrenamiento

LiveCaption no entrena modelos propios: es un pipeline de inferencia local compuesto por dos etapas. La primera es el reconocimiento del habla con Whisper *small* ejecutado a través de WhisperKit sobre CoreML, lo que permite aprovechar el Neural Engine de los chips Apple Silicon. La segunda es la traducción, delegada a un modelo de chat compatible con la API de Ollama; por defecto se usa Hy-MT2-1.8B, pero cualquier endpoint compatible (`LC_MT_URL`, `LC_MT_MODEL`) puede sustituirlo sin recompilar la aplicación.

El diseño técnico aborda el problema clásico del subtitulado en vivo: el crecimiento indefinido de la latencia. Para ello emplea una ventana de audio limitada que nunca reenvía la sesión completa al reconocedor, elimina cada frase confirmada de la ventana, traduce únicamente lo que Whisper ya ha confirmado y aplica una política de cola «la más reciente gana», de modo que el retraso acumulado se convierte en una sola petición en lugar de una cola creciente. La traducción se emite en streaming, añadiendo palabras sin reescribir lo ya mostrado, y las decodificaciones en bucle se cortan por límite de tokens y se descartan si Whisper devuelve más segmentos de los razonables para la duración del audio. No se dispone de información sobre datos de entrenamiento, número de tokens o técnicas de alineación (RLHF/DPO), ya que el proyecto no entrena modelos.

## Capacidades

- Reconocimiento automático del habla en tiempo real desde el micrófono, con Whisper small sobre CoreML.
- Traducción simultánea en streaming del texto reconocido, palabra por palabra, hacia el idioma de destino.
- Par de idiomas por defecto portugués → español; origen y destino configurables mediante variables de entorno.
- Traductor sustituible por cualquier API de chat compatible con Ollama, sin recompilar.
- Glosario configurable (`glossary.json`) con sustituciones previas por regex, correcciones posteriores y términos que el traductor debe preservar.
- Ventana flotante oscura, arrastrable y redimensionable, con la frase más reciente destacada.
- Control externo mediante script (`start`, `stop`, `pause`, `status`) y señal `SIGUSR1` para alternar pausa.
- Modo de prueba que alimenta la aplicación con un archivo WAV `f32le` de 16 kHz mono en tiempo real.
- Registro opcional de histórico y métricas (`LC_LOG=1`) y de audio (`LC_SAVE_AUDIO=1`), desactivados por defecto.
- No incluye tool calling, function calling, capacidades de agente, visión ni audio de salida.

## Casos de uso

- Subtitulado de clases y conferencias presenciales: el micrófono captura la voz del ponente y la ventana flotante muestra la traducción en español con una latencia mediana de 0,60 s por frase, lo que permite seguir una exposición en otro idioma sin conexión a internet. El propio autor lo validó en una clase real de 2 h 44 min.
- Reuniones y sesiones de trabajo multilingües: con el traductor apuntando a un endpoint de Ollama local, la conversación no sale del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Accesibilidad para personas con discapacidad auditiva: al mostrar el texto traducido en una ventana grande y redimensionable, sirve como apoyo visual en entornos donde el idioma hablado no es el del usuario.
- Entornos sin conectividad o con red restringida: al ejecutarse íntegramente en local sobre Apple Silicon, es viable en aulas, laboratorios o recintos donde no se permite tráfico a servicios en la nube.
- Investigación y evaluación de pipelines ASR + MT: al ser código abierto y permitir sustituir el traductor y el modelo Whisper (`LC_WHISPER_DIR`), sirve como banco de pruebas para medir latencias y calidad de combinaciones de modelos.
- Creación de subtítulos para vídeo en directo en un Mac: la salida por streaming y el registro opcional de frases PT/ES permiten generar un histórico reutilizable para postproducción.
- Adaptación a otros pares de idiomas: cambiando `LC_SRC` y `LC_DST` y apuntando a un traductor adecuado, el mismo pipeline puede reutilizarse para otros idiomas soportados por Whisper y por el modelo de traducción elegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente mediciones de latencia del sistema completo en un MacBook Air M2 (16 GB, macOS 26) durante una clase real de 2 h 44 min con voz en vivo (pt→es), sin OBS y con la aplicación en segundo plano:

| Metrica | Valor |
|---|---|
| Primera palabra en español (mediana) | 0,17 s |
| Traducción completa de la frase (mediana) | 0,60 s |
| Traducción completa de la frase (p95) | 3,8 s |
| Pico aislado de latencia | 22,6 s |
| Tiempo de Whisper small (media, primer cuarto → último cuarto) | 0,31 s → 0,30 s |

## Requisitos de hardware

- Mac con Apple Silicon obligatorio; WhisperKit/CoreML no funciona en Intel.
- macOS 14 o superior.
- Medido en un MacBook Air M2 con 16 GB de RAM; no se han publicado mediciones en otros equipos.
- Espacio en disco: aproximadamente 1,6 GB para Whisper small más Hy-MT2-1.8B, descargados por `fetch_models.sh`.
- Swift 5.9+ (Xcode Command Line Tools) para compilar la aplicación.
- Ollama instalado y en ejecución para servir el modelo de traducción.
- `huggingface_hub` (`hf`) para descargar los modelos.
- Opcional para pruebas: `ffmpeg` y la voz Luciana (pt-BR) de macOS, usadas por `gen_test_audio.sh`.
- Despliegue: aplicación nativa compilada con `build_app.sh --install`, firmada localmente (*ad hoc*); no se contemplan vLLM, llama.cpp, TGI ni otros servidores de inferencia en la información disponible.
- Latencia y throughput: ver la tabla de la sección anterior; no hay datos de throughput en tokens por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros sistemas de subtitulado en vivo ni con otros pipelines ASR + traducción, y no se dispone de datos de rendimiento de alternativas en las mismas condiciones de medición.

## Limitaciones y advertencias

- Proyecto personal, no un producto: ha sido medido en un único Mac (MacBook Air M2, 16 GB) y la calidad depende de los modelos subyacentes.
- Solo funciona en macOS con Apple Silicon; no hay soporte para Intel, Linux ni Windows.
- El par de idiomas por defecto es portugués → español; otros pares requieren configuración y un traductor adecuado.
- La latencia puede dispararse puntualmente: se registró un pico aislado de 22,6 s y un p95 de 3,8 s frente a una mediana de 0,60 s.
- Riesgo de errores de reconocimiento y de traducción inherente a los modelos empleados; el glosario mitiga nombres propios y terminología, pero no elimina el problema.
- Rellenar `whisper_vocab` en el glosario deja el Whisper aproximadamente 2 veces más lento, según la medición del autor.
- Por defecto no se graba nada en disco; activar `LC_LOG=1` o `LC_SAVE_AUDIO=1` implica almacenar frases y audio en la carpeta de datos, con las implicaciones de privacidad que ello conlleva.
- Excepción al funcionamiento totalmente local: si falta el tokenizer de Whisper en la carpeta de datos, WhisperKit lo descarga una vez desde Hugging Face; no se envían audio ni texto.
- La licencia MIT permite uso comercial, pero el proyecto se distribuye solo como código fuente y depende de modelos de terceros cuyas licencias deben verificarse por separado.
- No se dispone de información sobre sesgos, robustez ante acentos o ruido, ni evaluación sistemática de calidad de traducción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Veronyka/livecaption
- Ollama: https://ollama.com
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de los modelos base ni demos.
