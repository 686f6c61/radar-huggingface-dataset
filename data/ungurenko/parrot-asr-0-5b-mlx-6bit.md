# ungurenko/Parrot-ASR-0.5B-MLX-6bit

## Resumen

Parrot-ASR-0.5B-MLX-6bit es una compilación cuantizada del modelo de reconocimiento automático del habla Rumble-2-Flash de Reson8, adaptada por Aleksandr Ungurenko para su ejecución local en Mac con chips de la serie M mediante la librería MLX. El modelo resuelve la transcripción de audio a texto en ruso sin enviar datos a servidores externos, lo que lo hace adecuado para escenarios con requisitos de privacidad. La arquitectura subyacente se etiqueta como `qwen3_asr`, con unos 508,6 millones de parámetros totales y un peso de repositorio de aproximadamente 635 MB.

La relevancia de esta compilación radica en su optimización para Apple Silicon: el autor reporta que una grabación de 46 minutos y 32 segundos se procesó en unos 45 segundos en un Mac M4 con 16 GB de memoria, con un pico de memoria MLX de 3,79 GB. Se trata de una versión experimental (0.1.0) pensada para ejecución por terminal mediante Python 3.12, no integrada aún en la aplicación Parrot. No se realizó entrenamiento adicional: los conocimientos del modelo base permanecen intactos y solo se modificó el formato y la cuantización de los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_asr (transformer para ASR, según etiqueta del modelo) |
| Parámetros totales | 508.631.552 (≈0,5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits en la parte textual (grupos de 64 valores); audio en BF16 |
| Idiomas soportados | ruso (ru); otros idiomas del modelo base no verificados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La compilación parte de Reson8/Rumble-2-Flash y conserva su arquitectura ASR etiquetada como `qwen3_asr`. El autor no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. Lo que sí documenta es el proceso de cuantización: los pesos de la parte textual se almacenan a 6 bits con grupos de 64 valores, mientras que la parte de audio permanece en BF16. Todos los pesos necesarios para la inferencia están incluidos en `model.safetensors`, por lo que no es necesario descargar el modelo base por separado.

No se realizó ningún entrenamiento adicional para esta compilación. La innovación técnica principal es la optimización del pipeline de inferencia en MLX para Apple Silicon, que según el autor redujo el tiempo de procesamiento un 30,83% respecto al modo anterior (de 65,05 s a 44,99 s de mediana en la misma grabación). El autor también validó que el archivo de pesos guardado produce exactamente el mismo texto que la versión previa al guardado, con el protocolo recogido en `package-validation.json`.

## Capacidades

- Transcripción de voz a texto en ruso, con procesamiento completamente local en el dispositivo.
- Funcionamiento sin conexión a internet una vez descargado el modelo y las dependencias.
- Procesamiento de grabaciones largas: se documenta una prueba con audio de 46 minutos y 32 segundos.
- Conversión de formatos de audio mediante ffmpeg (por ejemplo, MP3 a WAV mono a 16 kHz PCM s16).
- Ejecución mediante script de terminal (`transcribe.py`) con salida a stdout o a archivo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No se documenta un modo "thinking" ni funcionalidades especiales adicionales.

## Casos de uso

- Transcripción privada de reuniones: el modelo procesa el audio íntegramente en el Mac, sin enviar la grabación a ningún servidor, lo que resulta adecuado para conversaciones confidenciales. Con una grabación de 46 minutos procesada en unos 45 segundos en un M4, encaja en flujos de trabajo donde la privacidad es prioritaria.
- Generación de actas y notas de entrevistas: el script permite volcar el texto a `transcript.txt` mediante redirección de salida, lo que facilita su integración en un pipeline posterior de resumen o edición.
- Subtitulado de contenido audiovisual en ruso: la conversión previa con ffmpeg a WAV mono de 16 kHz permite alimentar el modelo con material de vídeo y obtener la transcripción base para subtítulos, sujeta a revisión humana por posibles errores en nombres y cifras.
- Investigación lingüística y creación de corpus: al ejecutarse sin conexión, permite transcribir lotes de grabaciones de forma controlada y reproducible en un entorno local.
- Archivado y búsqueda de grabaciones históricas: transcripción de material de audio almacenado para hacerlo indexable y consultable por texto.
- Prototipado y evaluación de ASR en Apple Silicon: desarrolladores que quieran medir el rendimiento de MLX Audio con un modelo compacto de 0,5B antes de escalar a otros tamaños o idiomas.
- Uso educativo y experimentación: al ser una compilación ligera (unos 635 MB) con licencia Apache 2.0, sirve para aprender a desplegar modelos ASR cuantizados en hardware de consumo Apple.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son de su propia validación, no de benchmarks estándar de la comunidad.

| Métrica | Modo previo | Modo acelerado |
|---|---|---|
| Tiempo de procesamiento (audio de 46:31,66, M4 16 GB) | 65,05 s | 44,99 s (mediana de 3 pasadas) |
| Pico de memoria MLX | 2,97 GB | 3,79 GB |
| Errores en 100 frases FLEURS (2.068 palabras) | 150 (7,25%) | 151 (7,30%) |

El autor advierte que la prueba FLEURS se realizó sobre una concatenación de 20:51,42 s con pausas de medio segundo, que no es una evaluación sobre el conjunto completo ni equivale a una posición en un ranking público. No se publicaron resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general, ya que el modelo es específico de ASR.

## Requisitos de hardware

- Hardware objetivo: Mac con chip de la serie M. La validación se realizó en un M4 con 16 GB de memoria; en otros equipos la velocidad no está medida.
- VRAM/memoria: pico de memoria MLX de 3,79 GB en el modo acelerado (el consumo total del proceso no se midió). El archivo del modelo ocupa unos 635 MB.
- GPU recomendadas: Apple Silicon (M4 validado). No se documenta soporte para GPU NVIDIA, AMD ni CPU x86.
- ¿Cabe en GPU de consumo? Está diseñado para Apple Silicon; no se indica compatibilidad con GPU de consumo tipo RTX.
- Despliegue: MLX Audio como librería de carga, con script `transcribe.py` y entorno Python 3.12 gestionado mediante `requirements-lock.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 45 s para 46,5 minutos de audio en M4 con 16 GB (incluye lectura del WAV y todo el reconocimiento, sin contar descarga, preparación, carga del modelo, calentamiento ni guardado del texto).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada. A continuación se comparan únicamente características declaradas frente al modelo base del que deriva.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parrot-ASR-0.5B-MLX-6bit | ≈508,6 M | no disponible | ru | Apache 2.0 | safetensors (MLX, 6 bits) |
| Reson8/Rumble-2-Flash (base) | no disponible | no disponible | no disponible (el autor indica que soporta otros idiomas no verificados) | no disponible en la información | no disponible |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (ASR en ruso optimizado para Apple Silicon) con datos verificables.

## Limitaciones y advertencias

- Versión experimental 0.1.0: el autor la califica como tal y no está integrada en la aplicación Parrot.
- Solo se ha verificado ruso en un único equipo (M4, 16 GB); la velocidad en archivos cortos y en otros Mac no está confirmada.
- Los demás idiomas que soporta el modelo base no se han probado en esta compilación.
- Tasa de error del 7,30% en la prueba propia sobre 100 frases FLEURS; nombres propios, números y palabras poco frecuentes pueden reconocerse mal.
- La división de grabaciones largas en fragmentos puede alterar el texto en las uniones entre segmentos.
- No hay transcripción de referencia del vídeo completo de YouTube utilizado, por lo que no se determinó su porcentaje de error.
- El autor recomienda revisión humana en grabaciones cuyo contenido sea importante.
- Riesgo de alucinación y sesgos: no documentado específicamente en la información disponible; aplican los riesgos habituales de los modelos ASR.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Reson8/Rumble-2-Flash, cuya licencia no se detalla en la información proporcionada.
- Requiere Python 3.12 y ffmpeg para convertir formatos distintos de WAV mono a 16 kHz PCM s16.
- Dependencia exclusiva de Apple Silicon y MLX; no hay ruta de despliegue documentada para otros aceleradores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ungurenko/Parrot-ASR-0.5B-MLX-6bit
- Modelo base Reson8/Rumble-2-Flash: https://huggingface.co/Reson8/Rumble-2-Flash
- Dataset Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Grabación utilizada en la prueba de velocidad: https://youtu.be/kRFgwlrAoNQ
