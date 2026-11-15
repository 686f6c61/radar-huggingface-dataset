# StargateAfrica/Hleba-0.77B

## Resumen

Hleba-0.77B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por StargateAfrica, obtenido mediante fine-tuning del modelo openai/whisper-medium. Con 0,77 mil millones de parametros, hereda la arquitectura encoder-decoder transformer propia de la familia Whisper de OpenAI y esta orientado, por el nombre y el contexto del autor, a lenguas africanas, aunque la informacion publicada no detalla los idiomas concretos cubiertos. El modelo se distribuye bajo una licencia de investigacion academica propia de StargateAfrica y su acceso esta restringido en Hugging Face, requiriendo aceptar condiciones antes de la descarga.

Su relevancia radica en la escasez de sistemas ASR de calidad para lenguas de bajos recursos, especialmente africanas, y en que parte de un checkpoint ampliamente validado como whisper-medium, lo que reduce el coste de entrenamiento y facilita su integracion en pipelines existentes. El repositorio ocupa 4,6 GB, coherente con pesos en precision completa o media para un modelo de este tamano.

No obstante, la ficha publica carece de informacion sobre composicion del dataset de entrenamiento, horas de audio, metricas WER y lista de idiomas, por lo que las evaluaciones deben realizarse de forma empirica antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 0,77 mil millones (770 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper medium acepta ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | stargate-africa-research-academic-licence (acceso restringido) |
| Formato de pesos | no disponible (repositorio de 4,6 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-medium, un transformer encoder-decoder disenado para ASR que procesa espectrogramas Mel de audio en ventanas de 30 segundos y genera transcripciones de forma autorregresiva. Whisper medium cuenta con 769 millones de parametros, por lo que la denominacion "0.77B" coincide con el checkpoint base. El fine-tuning se ha realizado presumiblemente sobre datos de habla africana, aunque no se especifican horas de audio, composicion del corpus, tecnicas de aumento de datos ni si se aplico alguna estrategia de regularizacion para evitar el olvido catastrofico del modelo original.

No se dispone de informacion sobre el proceso de entrenamiento: numero de pasos, tasa de aprendizaje, hardware utilizado, ni si se emplearon tecnicas como LoRA, adaptadores o entrenamiento completo. Tampoco se documenta si se aplico decodificacion especulativa, destilacion o compresion de contexto. La ausencia de estos datos impide evaluar la calidad del ajuste frente al checkpoint original.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto).
- Transcripcion de audio en ventanas de hasta 30 segundos por inferencia, propia de Whisper.
- Capacidad multilingue potencial heredada de Whisper medium, aunque no se confirma que idiomas conserva tras el fine-tuning.
- Deteccion de idioma y traduccion de voz a texto en ingles, si el fine-tuning no ha degradado estas capacidades (no verificado).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no son capacidades propias de un modelo ASR.
- No se documenta soporte de vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de reuniones y entrevistas en lenguas africanas: el modelo puede convertir grabaciones de audio en texto para actas y documentacion, aprovechando el ajuste especifico sobre el dominio linguistico objetivo.
- Subtitulado automatico de contenido audiovisual: integrado en pipelines de postproduccion, permite generar subtitulos para videos educativos o divulgativos en las lenguas cubiertas por el fine-tuning.
- Investigacion linguistica de campo: los investigadores pueden transcribir corpus orales recogidos en trabajo de campo y acelerar la anotacion manual posterior.
- Digitalizacion de archivos sonoros: archivos de radio, entrevistas historicas o grabaciones etnograficas pueden transcribirse para su indexacion y busqueda textual.
- Asistentes de voz para servicios publicos: en escenarios de atencion ciudadana o sanidad en zonas con lenguas locales, el modelo puede servir como capa de transcripcion previa a un sistema de comprension del lenguaje.
- Evaluacion comparativa de ASR para lenguas de bajos recursos: sirve como referencia en estudios academicos que comparen fine-tunings de Whisper sobre distintos idiomas africanos.
- Prototipado de aplicaciones de accesibilidad: transcripcion en tiempo casi real de conversaciones para personas con discapacidad auditiva, siempre que la latencia del despliegue lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 para un modelo de 770 M de parametros; en cuantizacion INT8 podria reducirse a unos 1,5-2 GB (estimacion, no confirmada por el autor).
- GPU recomendadas: NVIDIA A100, H100 o L40S para procesamiento por lotes de alto volumen; RTX 4090 o RTX 3090 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en FP16, como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: transformers con pipeline de automatic-speech-recognition, faster-whisper para inferencia optimizada, WhisperX para alineacion temporal, o servidores compatibles con la API de OpenAI para Whisper. No se confirma soporte de llama.cpp u Ollama, orientados a modelos de texto.
- Latencia y throughput: no disponibles; dependen del hardware y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| StargateAfrica/Hleba-0.77B | 770 M | ventanas de 30 s | no disponible | investigacion academica | restringido |
| openai/whisper-medium | 769 M | ventanas de 30 s | 99 idiomas | MIT | abierto |
| openai/whisper-small | 244 M | ventanas de 30 s | 99 idiomas | MIT | abierto |
| openai/whisper-large-v3 | 1,55 mil millones | ventanas de 30 s | 99 idiomas | MIT | abierto |

La comparativa se limita a la familia Whisper por ausencia de datos sobre alternativas especificas para lenguas africanas en la informacion proporcionada. Hleba-0.77B se diferencia de whisper-medium por su ajuste a un dominio linguistico concreto y por su licencia restrictiva, que limita el uso comercial frente a la licencia MIT del original.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia de investigacion academica: el uso comercial puede estar prohibido o requerir autorizacion expresa de StargateAfrica; debe revisarse el texto completo de la licencia.
- Ausencia de documentacion sobre idiomas: no se confirma que lenguas cubre ni su rendimiento en cada una, lo que impide garantizar calidad en produccion.
- Riesgo de olvido catastrofico: al ser un fine-tuning sobre whisper-medium, las capacidades multilingues originales pueden haberse degradado.
- Riesgo de alucinacion en audio con ruido, silencios o habla solapada, comportamiento comun en modelos Whisper.
- Sesgos desconocidos: no se documenta la composicion demografica ni dialectal del corpus de entrenamiento.
- Sin metricas publicas de WER: no es posible comparar objetivamente con el checkpoint base ni con alternativas.
- Ventana de 30 segundos: requiere segmentacion previa para audios largos, con posible perdida de contexto entre segmentos.
- Repositorio con 0 descargas y 1 like: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/StargateAfrica/Hleba-0.77B
- Modelo base: https://huggingface.co/openai/whisper-medium
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- WhisperX: https://github.com/m-bain/whisperX
