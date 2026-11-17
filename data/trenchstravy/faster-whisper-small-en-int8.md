# trenchstravy/faster-whisper-small.en-int8

## Resumen

`trenchstravy/faster-whisper-small.en-int8` es una conversión del modelo `openai/whisper-small.en` al formato CTranslate2 con cuantización de pesos a enteros de 8 bits (int8). Lo publica el usuario trenchstravy como artefacto de despliegue para Sorph, una aplicación de dictado offline para macOS, que fija el commit concreto que descarga. No es un modelo nuevo ni un fine-tuning: los pesos son los de OpenAI, sin modificar salvo por la cuantización, y la licencia es la original MIT.

El modelo resuelve el problema de ejecutar reconocimiento automático de voz en inglés con un consumo de memoria reducido. Al almacenar los pesos en int8, el repositorio ocupa aproximadamente 0,2 GB, cerca de la mitad que la conversión en float16 (`Systran/faster-whisper-small.en`), lo que lo hace adecuado para inferencia en CPU y para distribuirse dentro de una aplicación de escritorio.

Es relevante para desarrolladores que necesiten integrar transcripción en inglés en entornos con recursos limitados, sin GPU dedicada y con requisitos de huella en disco pequeños. Está pensado para usarse con la librería `faster-whisper` y `compute_type="int8"`, y no incluye ninguna capacidad multilingüe: es la variante `small.en`, entrenada solo para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small, variante English-only) |
| Parametros totales | no disponible (el modelo base `openai/whisper-small.en` tiene del orden de 244 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | int8 (pesos en enteros de 8 bits); el autor indica `compute_type="int8"` |
| Idiomas soportados | en (solo ingles) |
| Licencia | MIT (heredada de OpenAI) |
| Formato de pesos | CTranslate2 (libreria `ctranslate2`, compatible con `faster-whisper`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small en su variante English-only: un transformer encoder-decoder entrenado para transcripción de audio a texto, que procesa el audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. El modelo original fue desarrollado por OpenAI; esta publicación no aporta entrenamiento adicional ni ajuste fino, solo la conversión de formato y la cuantización.

La conversión se realizó con `TransformersConverter` de CTranslate2 (versión 4.8.1), cargando el modelo como float16 y aplicando `quantization="int8"`. Se copiaron `tokenizer.json` y `preprocessor_config.json` junto con los pesos. El autor declara explícitamente que los pesos son los de OpenAI, sin cambios más allá de la cuantización. No se documentan detalles sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO; esa información corresponde a la model card de `openai/whisper-small.en` y no se incluye aquí.

## Capacidades

- Transcripción de audio a texto en inglés (reconocimiento automático de voz).
- Detección de segmentos con marcas temporales, tal como expone la API de `faster-whisper` (`segments`, `info`).
- Ejecución en CPU con cuantización int8, sin necesidad de GPU.
- Integración directa con la librería `faster-whisper` mediante `WhisperModel`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés.
- No incluye visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Dictado offline en aplicaciones de escritorio: es el caso para el que se publicó (Sorph en macOS); el modelo se descarga y se ejecuta localmente en CPU con int8, sin enviar audio a servidores externos, lo que reduce latencia y preserva la privacidad.
- Transcripción de reuniones y notas de voz en inglés: la API de `faster-whisper` devuelve segmentos con marcas temporales, útiles para generar actas o subtítulos sincronizados.
- Subtitulado de vídeos en inglés: el tamaño reducido (0,2 GB) permite incluirlo en herramientas de edición o pipelines de postproducción que corren en portátiles sin GPU.
- Búsqueda y indexación de archivos de audio: transcribir grabaciones para hacerlas buscables por texto en un corpus en inglés, con un coste de almacenamiento bajo por modelo.
- Asistentes de voz locales en inglés: integrar la transcripción como primer paso de un pipeline de voz a texto antes de un LLM, ejecutándose en el mismo equipo sin GPU.
- Prototipado y pruebas de pipelines ASR: al ser una conversión int8 lista para `faster-whisper`, sirve para validar integraciones y comparar calidad frente a la versión float16 antes de decidir el despliegue definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el autor lo orienta a CPU con `device="cpu"` y `compute_type="int8"`.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo está pensado para CPU.
- ¿Cabe en GPU de consumo? El tamaño del repositorio (0,2 GB) sugiere que sí cabría en cualquier GPU de consumo, pero no se aportan datos de VRAM ni de compatibilidad GPU en la información disponible.
- Opciones de despliegue: `faster-whisper` con CTranslate2 (soporte nativo); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| trenchstravy/faster-whisper-small.en-int8 | no disponible | no disponible | en | int8 | MIT | CTranslate2 |
| Systran/faster-whisper-small.en | no disponible | no disponible | en | float16 | MIT | CTranslate2 |
| openai/whisper-small.en | no disponible | no disponible | en | float16 (original) | MIT | PyTorch / safetensors |

La diferencia principal frente a `Systran/faster-whisper-small.en` es la cuantización: esta versión ocupa aproximadamente la mitad en disco (0,2 GB frente a la conversión de 16 bits). Frente al original de OpenAI, el formato CTranslate2 permite ejecución optimizada con `faster-whisper`. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo transcribe inglés; no es adecuado para audio en otros idiomas.
- La cuantización int8 puede introducir una ligera pérdida de precisión en la transcripción frente a la versión float16, aunque no se documenta su magnitud.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o audio de baja calidad; no se aportan datos específicos de esta conversión.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo original de OpenAI.
- Licencia MIT, que permite uso comercial, pero conviene conservar la atribución a OpenAI tal como indica el autor.
- Publicado como artefacto para una aplicación concreta (Sorph) que fija el commit descargado; no hay garantía de mantenimiento ni de actualizaciones.
- Cero descargas y cero likes en el momento de la consulta, lo que implica poca validación por parte de la comunidad.
- No se documentan limitaciones de longitud de audio más allá de las ventanas de 30 segundos propias de Whisper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trenchstravy/faster-whisper-small.en-int8
- Modelo base: https://huggingface.co/openai/whisper-small.en
- Conversión float16 de referencia: https://huggingface.co/Systran/faster-whisper-small.en
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- Sorph (aplicación de dictado offline): https://sorph.me
