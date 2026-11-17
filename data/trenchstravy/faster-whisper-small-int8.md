# trenchstravy/faster-whisper-small-int8

## Resumen

`trenchstravy/faster-whisper-small-int8` es una conversión del modelo `openai/whisper-small` al formato CTranslate2 con cuantización de pesos a enteros de 8 bits (int8). Lo publica el usuario trenchstravy como artefacto derivado, pensado específicamente para su uso con la librería `faster-whisper` y con `compute_type="int8"`. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de OpenAI, sin modificar más allá de la cuantización.

El modelo resuelve el problema del despliegue eficiente de reconocimiento automático de voz (ASR) en entornos con recursos limitados. Al reducir los pesos a 8 bits, el tamaño del repositorio queda en 0,2 GB, aproximadamente la mitad que la conversión estándar en 16 bits (`Systran/faster-whisper-small`), lo que facilita su distribución y ejecución en CPU.

Es relevante ahora porque el ecosistema `faster-whisper` se ha consolidado como la vía de referencia para inferencia de Whisper en producción, y las conversiones int8 permiten ejecutar ASR multilingüe en hardware sin GPU dedicada. El autor lo publica para Sorph, una aplicación de dictado offline para macOS, que fija el commit que descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a CTranslate2 |
| Parametros totales | 244 M (heredados de openai/whisper-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper) |
| Tipos de cuantizacion | int8 (pesos en enteros de 8 bits); requiere `compute_type="int8"` |
| Idiomas soportados | multilingüe, 99 idiomas segun la model card |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizer.json y preprocessor_config.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con atención estándar, entrenado por OpenAI para transcripción y traducción de voz. El modelo procesa audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. La conversión a CTranslate2 no altera la topología ni los pesos, solo el formato de almacenamiento y el motor de inferencia.

El entrenamiento es el original de `openai/whisper-small`; esta publicación no añade datos, no hace fine-tuning ni aplica RLHF/DPO. La única transformación es la cuantización int8 realizada con `TransformersConverter` de CTranslate2 (versión 4.8.1), cargando el modelo como float16 y aplicando `quantization="int8"`. La innovación práctica es la reducción de tamaño y el uso del motor CTranslate2, que optimiza la inferencia en CPU mediante kernels cuantizados.

## Capacidades

- Transcripción automática de voz (ASR) en 99 idiomas, incluyendo detección automática del idioma.
- Traducción de voz a texto en inglés desde otros idiomas (capacidad nativa de Whisper).
- Generación de marcas temporales a nivel de segmento y de palabra (según configuración de `faster-whisper`).
- Ejecución en CPU con cuantización int8, sin necesidad de GPU.
- Integración directa con la API de `faster-whisper` (`WhisperModel.transcribe`).
- Soporte de audio de distinta duración mediante segmentación en ventanas de 30 segundos.
- No incluye tool calling, agentes, visión ni modo de razonamiento extendido; es un modelo exclusivamente de audio.

## Casos de uso

- Dictado offline en aplicaciones de escritorio: es el caso declarado por el autor (Sorph para macOS). El modelo se descarga una vez, se ejecuta en local con `compute_type="int8"` y transcribe la voz del usuario sin enviar audio a servidores externos.
- Subtitulado automático de vídeo y pódcast: la generación de marcas temporales por segmento permite producir ficheros SRT o VTT en un pipeline por lotes ejecutado en CPU.
- Transcripción de reuniones y notas de voz: el tamaño reducido (0,2 GB) y la inferencia en CPU facilitan desplegarlo en portátiles o servidores modestos para procesar grabaciones internas.
- Asistentes de voz en dispositivos de borde: al no requerir GPU, puede integrarse en Raspberry Pi o mini-PC para comandos de voz y transcripción en tiempo casi real con audio corto.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo de grabaciones para alimentar un motor de búsqueda de texto, aprovechando el soporte multilingüe.
- Prototipado rápido de pipelines ASR: sirve como modelo de referencia ligero para validar una arquitectura de `faster-whisper` antes de escalar a `whisper-medium` o `large` en producción.
- Traducción de audio a inglés: para contenidos en otros idiomas que necesiten una versión textual en inglés, usando la tarea de traducción nativa de Whisper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, latencia ni throughput, y al ser una conversión cuantizada de `openai/whisper-small`, su precisión debería aproximarse a la del modelo original, con la degradación propia de la cuantización int8, que no se cuantifica en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo int8 ocupa del orden de 0,2 GB de pesos más memoria de activaciones, muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo está pensado para CPU con `device="cpu"` y `compute_type="int8"`.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en CPU convencionales; el cuello de botella es la velocidad de cómputo, no la memoria.
- Opciones de despliegue: `faster-whisper` (librería nativa), CTranslate2 directamente; también puede servirse mediante envoltorios compatibles con la API de `faster-whisper`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trenchstravy/faster-whisper-small-int8 | 244 M | 30 s de audio | CTranslate2 int8 | MIT | Hugging Face |
| Systran/faster-whisper-small | 244 M | 30 s de audio | CTranslate2 float16 | MIT | Hugging Face |
| openai/whisper-small | 244 M | 30 s de audio | PyTorch safetensors | MIT | Hugging Face |
| openai/whisper-base | 74 M | 30 s de audio | PyTorch safetensors | MIT | Hugging Face |

La diferencia principal frente a `Systran/faster-whisper-small` es el tamaño (0,2 GB frente a aproximadamente el doble en 16 bits) y el tipo de cómputo recomendado (int8 frente a float16). Frente a `openai/whisper-small`, cambia el motor de inferencia y el formato, no los pesos. `whisper-base` es una alternativa de menor tamaño y menor precisión para escenarios aún más restringidos.

## Limitaciones y advertencias

- La cuantización int8 puede introducir una degradación de precisión (WER) respecto al modelo en float16; no se documenta su magnitud en la información disponible.
- Al ser una conversión de terceros, no está respaldada oficialmente por OpenAI ni por el equipo de `faster-whisper`; conviene fijar el commit concreto al integrarla, como hace el propio autor.
- Whisper small tiene menor precisión que las variantes medium y large, especialmente en audio con ruido, acentos marcados o vocabulario técnico.
- Ventana de contexto de 30 segundos por segmento; audios más largos requieren segmentación, lo que puede afectar la coherencia en transcripciones largas.
- Riesgo de alucinación en pasajes de silencio o ruido, comportamiento conocido de la familia Whisper.
- Licencia MIT, que permite uso comercial, pero los derechos sobre los pesos originales son de OpenAI y se mantienen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción más allá de la aplicación del autor.
- No se proporcionan métricas de rendimiento ni comparativas de calidad, por lo que su idoneidad debe validarse empíricamente antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trenchstravy/faster-whisper-small-int8
- Modelo base: https://huggingface.co/openai/whisper-small
- Conversión de referencia en 16 bits: https://huggingface.co/Systran/faster-whisper-small
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- Aplicación del autor: https://sorph.me
