# Xiliourt/HeartTranscriptor-oss

## Resumen

HeartTranscriptor-oss es un modelo de reconocimiento automatico del habla (ASR) publicado por el equipo HeartMuLa dentro de su familia de modelos fundacionales de musica ("HeartMuLa: A Family of Open Sourced Music Foundation Models"). El repositorio analizado aparece bajo la cuenta Xiliourt, mientras que la model card apunta a la organizacion HeartMuLa, que tambien publica los modelos HeartMuLa-oss-3B y HeartCodec-oss. Su proposito declarado encaja en el ambito de transcripcion de audio y musica, segun indican los tags `music` y `art` junto a la pipeline `automatic-speech-recognition`.

El modelo cuenta con 763.857.920 parametros totales (aproximadamente 764 millones) segun los pesos en safetensors, con un tamano de repositorio de 3,1 GB. Los tags del repositorio incluyen `whisper`, lo que apunta a una arquitectura basada en la familia Whisper de OpenAI, si bien la model card no detalla explicitamente la arquitectura interna ni el proceso de entrenamiento.

Es relevante porque forma parte de un ecosistema abierto (licencia Apache 2.0) orientado a tareas musicales y de audio, con soporte declarado para cinco idiomas (chino, ingles, japones, coreano y espanol). No obstante, la informacion publicada es muy escasa: no se documentan benchmarks, composicion del dataset de entrenamiento, ni detalles de despliegue mas alla del repositorio GitHub de la familia HeartMuLa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible explicitamente; los tags del repositorio indican `whisper` (transformer encoder-decoder) |
| Parametros totales | 763.857.920 (aproximadamente 764 M) |
| Parametros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, ja, ko, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento del modelo. El unico indicio disponible es la etiqueta `whisper` presente en los tags del repositorio, que sugiere una arquitectura de tipo transformer encoder-decoder basada en la familia Whisper de OpenAI, habitual en tareas de transcripcion. No obstante, este dato no se confirma en la documentacion del autor y debe tratarse como indicativo, no como certeza.

Respecto a los datos de entrenamiento, no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. El contexto del proyecto (familia HeartMuLa, etiquetas `music` y `art`) apunta a un uso orientado a audio musical, pero no hay informacion publica que cuantifique ni detalle este extremo. Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Reconocimiento automatico del habla (ASR) como tarea principal declarada en la pipeline del modelo.
- Transcripcion multilingue con soporte declarado para chino, ingles, japones, coreano y espanol.
- Orientacion a contenido musical y artistico, segun los tags `music` y `art` del repositorio.
- No hay informacion disponible sobre soporte de tool calling o function calling.
- No hay informacion disponible sobre capacidades de agente o razonamiento multi-paso.
- No hay informacion disponible sobre modos especiales (thinking mode, vision o audio mas alla de la propia entrada de audio).
- No hay informacion disponible sobre traduccion, deteccion de idioma o marcas de tiempo.

## Casos de uso

- Transcripcion de voz multilingue: el modelo puede generar transcripciones de audio en chino, ingles, japones, coreano y espanol, lo que resulta util para equipos que necesitan procesar contenido en varios idiomas con un unico modelo.
- Subtitulado de contenido audiovisual: dada su tarea ASR, puede emplearse para generar subtitulos de videos o podcasts, aunque se desconoce si produce marcas de tiempo.
- Analisis de audio musical: por su orientacion a musica y arte, encaja en flujos de extraccion de letras o transcripcion de voces en producciones musicales.
- Archivado y busqueda de contenido hablado: transcripcion de grabaciones para hacerlas indexables y buscables en repositorios de audio.
- Investigacion en modelos fundacionales de musica: util como componente de transcripcion dentro del ecosistema HeartMuLa, junto a HeartMuLa-oss-3B y HeartCodec-oss.
- Evaluacion y prototipado en investigacion ASR: con licencia Apache 2.0 y pesos safetensors, sirve para experimentar y comparar frente a otros sistemas de transcripcion.
- Pipelines de accesibilidad: generacion de transcripciones para personas con discapacidad auditiva, sujeta a la validacion de calidad que no se ha documentado publicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 764 M de parametros, aproximadamente 3,1 GB en fp32 y alrededor de 1,5 GB en fp16/bf16 (estimacion base a partir del numero de parametros, sin datos oficiales del autor).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por el tamano del modelo, es presumible que quepa en GPU de consumo (por ejemplo, gama RTX xx60/xx70/xx80), aunque el autor no lo confirma.
- Opciones de despliegue: el autor remite al repositorio GitHub https://github.com/HeartMuLa/heartlib para el arranque rapido y el despliegue local; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeartTranscriptor-oss | ~764 M | no disponible | zh, en, ja, ko, es | apache-2.0 | HuggingFace (tags `whisper`) |
| OpenAI Whisper (familia) | 39 M - 1.55 B segun variante | ventanas de 30 s (arquitectura Whisper) | multilingue | MIT | ampliamente disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La referencia a Whisper se incluye unicamente porque aparece como tag del repositorio, no como una afirmacion del autor sobre equivalencia.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta arquitectura, entrenamiento, benchmarks ni requisitos de hardware, lo que dificulta evaluar su calidad en produccion.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no documentado; en modelos ASR es un riesgo habitual en audio ruidoso o con musica de fondo, pero no hay datos especificos para este modelo.
- Limitaciones de contexto o idioma: solo se declaran cinco idiomas (zh, en, ja, ko, es); no se detalla el rendimiento por idioma ni el comportamiento con audio largo.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero conviene verificar condiciones adicionales en el repositorio GitHub de la familia HeartMuLa.
- Confusion de autoria: el repositorio aparece bajo la cuenta Xiliourt, mientras que la model card referencia la organizacion HeartMuLa; conviene confirmar la procedencia oficial antes de un uso critico.
- Descargas e interacciones nulas (0 descargas, 0 likes) en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se especifican requisitos de version de las librerias ni pasos de despliegue mas alla del enlace al repositorio GitHub.

## Enlaces

- HuggingFace (repositorio analizado): https://huggingface.co/Xiliourt/HeartTranscriptor-oss
- HuggingFace (referencia de la model card): https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- GitHub: https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- HeartMuLa-oss-3B: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- HeartCodec-oss: https://huggingface.co/HeartMuLa/HeartCodec-oss
- Contacto: heartmula.ai@gmail.com
