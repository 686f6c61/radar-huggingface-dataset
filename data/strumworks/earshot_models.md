# StrumWorks/Earshot_Models

## Resumen

Earshot models es un repositorio espejo (mirror) publicado por StrumWorks Media en Hugging Face que distribuye los pesos del modelo de transcripcion opcional que utiliza la aplicacion Earshot para reconocimiento automatico de habla (ASR) en dispositivo. StrumWorks Media no entrena el modelo: se limita a alojar una copia de pesos existentes, en concreto una version cuantizada de OpenAI Whisper large-v3-turbo preparada para ejecutarse con whisper.cpp.

El archivo distribuido es `ggml-large-v3-turbo-q5_0.bin` (574.041.195 bytes, aproximadamente 0,6 GB en el repositorio), un formato GGML cuantizado a 5 bits que permite ejecutar el modelo en CPU y en hardware de consumo sin necesidad de GPU. Esto es relevante porque Whisper large-v3-turbo es uno de los modelos ASR con mejor relacion calidad/latencia del momento, y su version turbo reduce drasticamente el coste de inference respecto al large-v3 original manteniendo una calidad de transcripcion muy cercana.

El caso de uso principal es la transcripcion local y privada: Earshot descarga el modelo y realiza toda la transcripcion en el dispositivo del usuario, de modo que ni el alojamiento del modelo ni los desarrolladores reciben grabaciones ni transcripciones. El modelo Small sigue incluido de serie en Earshot, y este repositorio sirve como distribucion del modelo Turbo opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 809 millones (Whisper large-v3-turbo); el binario cuantizado ocupa 574.041.195 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (diseño estandar de Whisper) |
| Tipos de cuantizacion | Q5_0 (GGML/GGUF para whisper.cpp) |
| Idiomas soportados | no disponible en la model card; Whisper large-v3-turbo soporta de forma nativa unos 99 idiomas |
| Licencia | MIT (el repositorio espejo); Whisper original es de OpenAI bajo licencia MIT |
| Formato de pesos | GGML binario (`ggml-large-v3-turbo-q5_0.bin`), compatible con whisper.cpp |

## Arquitectura y entrenamiento

El modelo subyacente es OpenAI Whisper large-v3-turbo, un transformer encoder-decoder entrenado para reconocimiento automatico de habla. La variante turbo reduce el numero de capas del decodificador respecto a large-v3 (de 32 a 4), lo que recorta el tiempo de inference de forma sustancial con una perdida de precision minima en la mayoria de benchmarks de ASR. El encoder procesa espectrogramas log-Mel de 30 segundos de audio y el decodificador genera el texto, con soporte de tareas de transcripcion y traduccion (X->ingles).

En cuanto al entrenamiento, este repositorio no contiene informacion propia: es un espejo de los pesos publicados en ggerganov/whisper.cpp, que a su vez derivan del modelo original de OpenAI. Whisper fue entrenado por OpenAI con aproximadamente 680.000 horas de audio multilingue (no disponible en la model card de este repo; dato del modelo original). La version aqui distribuida esta cuantizada a 5 bits (Q5_0) mediante las herramientas de whisper.cpp para reducir el tamano en disco y la memoria necesaria en inference en dispositivo. No hay informacion sobre RLHF/DPO ni datasets adicionales.

## Capacidades

- Transcripcion automatica de habla a texto (ASR) en el dispositivo, sin envio de audio a servidores.
- Deteccion automatica de idioma y transcripcion multilingue (heredada de Whisper large-v3-turbo).
- Traduccion de audio en cualquier idioma soportado al ingles (tarea nativa de Whisper).
- Salida con marcas de tiempo a nivel de segmento mediante whisper.cpp.
- Ejecucion eficiente en CPU gracias a la cuantizacion Q5_0 y al formato GGML.
- Robustez frente a acentos, ruido de fondo y lenguaje tecnico, caracteristica distintiva de la familia Whisper.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo ASR especializado.
- No incluye capacidades de vision ni audio generativo (solo entrada de audio, salida de texto).

## Casos de uso

- Transcripcion privada en la aplicacion Earshot: el modelo se descarga y ejecuta localmente, garantizando que ninguna grabacion del usuario salga del dispositivo, lo que lo hace adecuado para notas de voz y dictado con requisitos de privacidad.
- Dictado y subtitulado offline en aplicaciones de escritorio: whisper.cpp con el binario Q5_0 de 574 MB permite transcribir en portatiles sin GPU dedicada.
- Procesamiento por lotes de grabaciones largas: al ejecutarse en CPU local, se pueden transcribir archivos de audio de forma masiva sin coste de API ni limites de cuota.
- Integracion en pipelines de post-produccion de video: generacion automatica de subtitulos con marcas de tiempo usando la salida segmentada de whisper.cpp.
- Aplicaciones con requisitos de cumplimiento (salud, legal, empresas): la arquitectura on-device evita transmitir datos sensibles a terceros.
- Prototipado rapido de funciones de voz: al ser un binario autocontenido con checksum SHA-256 publicado, es facil de verificar e integrar en proyectos basados en whisper.cpp.
- Accesibilidad: generacion de transcripciones en tiempo casi real para usuarios con necesidades de subtitulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. Los benchmarks de referencia de Whisper large-v3-turbo (WER en conjuntos como Common Voice, FLEURS o LibriSpeech) pueden consultarse en la documentacion original de OpenAI, pero no se reproducen aqui porque no forman parte de la model card.

## Requisitos de hardware

- El binario cuantizado ocupa 574 MB (0,6 GB de repositorio); se recomienda al menos 1 GB de RAM libre para la inference.
- Diseñado para ejecutarse en CPU mediante whisper.cpp: no requiere GPU dedicada, aunque puede acelerarse con Metal (macOS), CUDA (NVIDIA) o Vulkan si estan disponibles.
- Cabe comodamente en cualquier GPU de consumo moderna (incluso con menos de 2 GB de VRAM) si se usa aceleracion por CUDA/Metal.
- Despliegue: whisper.cpp es el runtime previsto; el formato GGML no es directamente compatible con vLLM, TGI u Ollama sin conversion.
- Latencia: no disponible en la model card; la variante turbo de Whisper esta optimizada para inference rapida en CPU, tipicamente en tiempo real o mejor en equipos de escritorio recientes.
- Verificacion de integridad: SHA-256 publicado (`394221709cd5ad1f40c46e6031ca61bce88931e6e088c188294c6d5a55ffa7e2`), util para validar la descarga en despliegues automatizados.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Whisper large-v3-turbo (este repo, Q5_0) | 809 M | GGML Q5_0 (574 MB) | 30 s por ventana | MIT | Optimizado para whisper.cpp y ejecucion on-device |
| Whisper large-v3 (original) | 1.550 M | PyTorch/GGML | 30 s por ventana | MIT | Mayor precision en algunos idiomas, inference mas lenta |
| Whisper small (incluido de serie en Earshot) | 244 M | GGML | 30 s por ventana | MIT | Mas ligero y rapido, menor precision |
| distil-whisper/distil-large-v3 | 756 M | safetensors/GGML | 30 s por ventana | MIT | Destilado de large-v3, enfocado a ingles, inference rapida |

## Limitaciones y advertencias

- El repositorio es un espejo de distribucion, no un entrenamiento propio: cualquier problema de calidad del modelo debe atribuirse a los pesos originales de OpenAI/whisper.cpp.
- Whisper puede alucinar texto en silencios largos, audio muy degradado o segmentos repetitivos, un problema documentado de la familia.
- Ventana de contexto de 30 segundos: audios largos requieren segmentacion por parte del runtime (whisper.cpp la gestiona, pero puede afectar a la coherencia en transcripciones muy largas).
- El rendimiento en idiomas distintos del ingles es inferior al del large-v3 completo en algunos casos, debido a la reduccion de capas del decodificador en la variante turbo.
- La cuantizacion Q5_0 introduce una pequena perdida de precision respecto a los pesos en fp16.
- Licencia MIT: permite uso comercial sin restricciones relevantes, pero hay que preservar los avisos y licencias MIT originales, tal como indica la propia model card.
- El repositorio registra 0 descargas y 1 like en el momento de la ficha, sin comunidad activa ni issues visibles; conviene verificar el checksum antes de usar en produccion.
- No hay model card tecnica detallada (datos de entrenamiento, evaluaciones ni idiomas) en el propio repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/StrumWorks/Earshot_Models
- Fuente original de los pesos (whisper.cpp, revision 5359861): https://huggingface.co/ggerganov/whisper.cpp/tree/5359861c739e955e79d9a303bcbc70fb988958b1
- Repositorio de whisper.cpp (GitHub): https://github.com/ggerganov/whisper.cpp
- Modelos originales de OpenAI Whisper: https://huggingface.co/openai
