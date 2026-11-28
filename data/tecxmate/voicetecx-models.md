# tecxmate/VoiceTecx-models

## Resumen

VoiceTecx-models es un repositorio de distribucion que contiene conversiones al formato whisper.cpp (ggml) del modelo de reconocimiento automatico del habla Breeze-ASR-25, desarrollado originalmente por MediaTek Research. El autor del repositorio es tecxmate, que lo publica como el artefacto que descarga su aplicacion de dictado offline VoiceTecx para Macs con Apple Silicon en el primer uso. No se trata de un modelo entrenado desde cero: los pesos son los de MediaTek Research, unicamente convertidos a fp16 y cuantizados a 5 y 6 bits.

El modelo base Breeze-ASR-25 esta especializado en mandarin de Taiwan y en habla mezclada mandarin-ingles, un escenario muy comun en contextos tecnologicos y bilingues de Taiwan. La arquitectura subyacente es la de Whisper (transformer encoder-decoder con atencion, entrenado sobre pares audio-texto), y el repositorio incluye dos ficheros ggml: una cuantizacion q5_0 de aproximadamente 1,08 GB y una q6_k de aproximadamente 1,28 GB, ambas verificables mediante sha256.

La relevancia de esta ficha es doble: por un lado documenta una opcion practica de ASR local para mandarin de Taiwan sin dependencia de la nube; por otro, ilustra el patron de distribucion de artefactos cuantizados para whisper.cpp con verificacion criptografica de integridad, algo relevante para aplicaciones de escritorio que descargan modelos en tiempo de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) segun el modelo base Breeze-ASR-25 |
| Parametros totales | no disponible (el modelo base Breeze-ASR-25 deriva de Whisper large-v3-turbo; el numero exacto de parametros no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | whisper.cpp ggml q5_0 (1.080.732.108 bytes) y q6_k (1.284.518.758 bytes); conversion intermedia a fp16 |
| Idiomas soportados | zh (mandarin de Taiwan) y en; enfocado a mezcla mandarin-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml (whisper.cpp), ficheros `.bin` |

## Arquitectura y entrenamiento

El repositorio no entrena ni ajusta ningun modelo: toma los pesos de MediaTek-Research/Breeze-ASR-25 en la revision `cffe7ccb` y los convierte con `models/convert-h5-to-ggml.py` de whisper.cpp (revision `79b1191`) a fp16, para despues cuantizar con `whisper-quantize` a q5_0 y q6_k. La arquitectura es, por tanto, la del modelo base: una red Whisper encoder-decoder con atencion, orientada a transcripcion de audio, y especializada por MediaTek Research en mandarin de Taiwan y en alternancia de codigo mandarin-ingles. Los detalles de composicion del dataset de entrenamiento original (horas de audio, fuentes, si hubo fine-tuning supervisado o tecnicas de aumento de datos) no se recogen en la informacion proporcionada.

La innovacion tecnica de este repositorio es de empaquetado y distribucion mas que de modelado: cuantizacion a 5 y 6 bits para reducir el tamano del paquete "Compact" de la aplicacion, publicacion de hashes sha256 por fichero y una advertencia explicita de que las k-quants (como q6_k) pueden diferir entre CPUs, por lo que la verificacion de integridad debe hacerse contra el sha256 del fichero subido. La salida q5_0 se declara identica en ARM y x86.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en mandarin de Taiwan.
- Transcripcion de habla mezclada mandarin-ingles (code-switching), el caso de uso declarado del modelo base.
- Transcripcion en ingles, aunque el modelo ingles de la aplicacion (Whisper large-v3-turbo) se distribuye por separado desde ggerganov/whisper.cpp y no forma parte de este repositorio.
- Ejecucion totalmente offline mediante whisper.cpp, sin llamadas a servicios externos.
- Verificacion de integridad de los ficheros descargados mediante sha256 antes de su uso.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la propia transcripcion.

## Casos de uso

- Dictado offline en macOS sobre Apple Silicon: la aplicacion VoiceTecx descarga el fichero q5_0 o q6_k en el primer uso y transcribe la voz del usuario de forma local, sin enviar audio a la nube; el formato ggml y whisper.cpp estan optimizados para CPU/GPU de Apple.
- Transcripcion de reuniones bilingues mandarin-ingles: el modelo base esta entrenado para alternancia de codigo, lo que lo hace adecuado para equipos de Taiwan que mezclan terminologia tecnica en ingles dentro de conversaciones en mandarin.
- Subtitulado de contenido audiovisual en mandarin de Taiwan: se puede procesar el audio de videos o podcasts y generar subtitulos en local, evitando subir material con derechos a servicios externos.
- Notas de voz a texto en entornos con requisitos de privacidad: al ejecutarse offline, encaja en flujos donde el audio no puede salir del dispositivo (sanidad, legal, periodismo).
- Integracion en pipelines de transcripcion por lotes con whisper.cpp: el binario de whisper.cpp permite procesar directorios de audio en servidores o estaciones de trabajo sin GPU dedicada, usando las cuantizaciones de 5 y 6 bits para reducir memoria.
- Verificacion de integridad en despliegues de escritorio: el patron de publicar sha256 por artefacto sirve como referencia para equipos que distribuyan modelos a clientes y necesiten garantizar que el fichero descargado es el esperado.
- Prototipado de ASR para aplicaciones de accesibilidad: transcripcion en tiempo real de voz a texto para personas con dificultades auditivas en contextos de habla mandarin de Taiwan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero q5_0 ocupa aproximadamente 1,08 GB y el q6_k aproximadamente 1,28 GB en disco; la memoria en ejecucion depende de la implementacion de whisper.cpp y del tamano de la ventana de audio procesada, y no se detalla en la informacion proporcionada.
- GPU recomendadas: no se especifican en la informacion disponible. El caso de uso declarado es Apple Silicon (Macs), donde whisper.cpp puede usar Metal.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano de los ficheros (1-1,3 GB) es compatible con GPUs de consumo en terminos de almacenamiento, pero no se aportan requisitos de VRAM.
- Opciones de despliegue: whisper.cpp (formato nativo ggml); tambien seria posible su uso a traves de envoltorios compatibles con ggml, aunque no se documentan en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| VoiceTecx-models (Breeze-ASR-25 q5_0/q6_k) | no disponible | no disponible | zh (Taiwan), en | Apache 2.0 | ggml | Cuantizado para whisper.cpp; verificacion sha256 |
| Breeze-ASR-25 (original, MediaTek Research) | no disponible | no disponible | zh (Taiwan), en | Apache 2.0 | safetensors/transformers (segun el modelo base) | Pesos sin cuantizar; requiere el stack de Hugging Face |
| Whisper large-v3-turbo (ggerganov/whisper.cpp) | no disponible | no disponible | multilingue | MIT/Apache (segun whisper.cpp) | ggml | Modelo ingles/multilingue distribuido por separado en la app VoiceTecx |

Los datos de parametros y contexto de los modelos comparables no se detallan en la informacion proporcionada; la comparativa se limita a licencia, formato e idiomas declarados.

## Limitaciones y advertencias

- El repositorio no entrena ni modifica los pesos: cualquier limitacion del modelo base Breeze-ASR-25 se hereda integramente.
- El enfasis esta en mandarin de Taiwan y en mezcla mandarin-ingles; el rendimiento en otros dialectos del chino o en habla exclusivamente en ingles no esta documentado en esta ficha.
- Riesgo de alucinacion en transcripcion: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencios o audio de baja calidad; no se aportan tasas de error (WER) en la informacion disponible.
- Las k-quants como q6_k pueden producir ficheros distintos segun la CPU que los genere; el autor advierte de que hay que verificar el sha256 del fichero subido y no regenerarlo localmente si se busca reproducibilidad.
- El paquete "Compact" con estas cuantizaciones esta en fase de pruebas segun la model card.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de MediaTek Research y el fichero LICENSE del repositorio.
- No se documentan sesgos especificos ni evaluaciones de robustez en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tecxmate/VoiceTecx-models
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- whisper.cpp (modelos ggml): https://huggingface.co/ggerganov/whisper.cpp
- Repositorio whisper.cpp (codigo): https://github.com/ggerganov/whisper.cpp
