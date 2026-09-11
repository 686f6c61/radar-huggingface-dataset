# tintitu/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo fundacional end-to-end para reconocimiento automático de voz (ASR) y identificación de idioma (LID), con aproximadamente 1.700 millones de parámetros. Lo desarrolla el equipo Qwen de Alibaba Cloud, y el repositorio analizado (`tintitu/Qwen3-ASR-1.7B`) es una réplica de los pesos oficiales publicada por un tercero, que incluye el manifiesto de verificación SHA-256 de todos los ficheros y atribuye la propiedad intelectual al equipo Qwen.

El modelo resuelve la transcripción de audio a texto en 30 idiomas principales y 22 dialectos del chino, con salida de puntuación nativa y detección automática de idioma, de modo que no requiere un modelo de puntuación en cascada. La entrada de audio está normalizada a 16 kHz, mono, en PCM de 16 bits o flotante en el rango [-1,0, 1,0], y la integración recomendada por el autor incluye un módulo VAD previo para eliminar silencios y trocear grabaciones largas.

Su relevancia práctica está en el perfil de despliegue: con pesos safetensors en dos particiones, la model card reporta un consumo de RAM de entre 4,5 GB y 7,5 GB y un RTF de 0,65 a 1,10 en una CPU moderna de 8 núcleos (procesar 10 segundos de audio lleva de 6,5 a 11 segundos, reducible a ~0,55 con multihilo), lo que lo sitúa como una opción de ASR de tamaño medio que puede ejecutarse sin GPU dedicada bajo licencia Apache-2.0. La información disponible no incluye resultados de benchmarks ni la longitud de contexto del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo end-to-end para ASR (detalles de capas y atención no disponibles) |
| Parametros totales | ~1,7 mil millones (1.700 millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el autor solo publica pesos safetensors sin variantes cuantizadas |
| Idiomas soportados | 30 idiomas principales y 22 dialectos del chino; identificación de idioma (LID) integrada. Lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en dos particiones (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) con `model.safetensors.index.json` |
| Tarea | Reconocimiento automático de voz (ASR) y detección de idioma (LID) |
| Entrada de audio | 16.000 Hz, mono, PCM de 16 bits o flotante normalizado en [-1,0, 1,0] |
| Tamano del repositorio | 3,7 GB (segun HuggingFace); la suma de los dos safetensors del manifiesto da 4.698.521.512 bytes (~4,70 GB) |
| Autor del repositorio | tintitu (replica de terceros de los pesos oficiales de Qwen) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 |

## Arquitectura y entrenamiento

La model card describe un modelo autorregresivo de gran tamano, entrenado de extremo a extremo para ASR multilingue, con un preprocesador de audio propio (`preprocessor_config.json`), tokenizador BPE (`vocab.json`, `merges.txt`) y plantilla de chat (`chat_template.json`). No se especifica en la informacion proporcionada el numero de capas, la dimension oculta, el tipo de atencion ni si incorpora mecanismos de atencion lineal o decodificacion especulativa. Tampoco se detalla la composicion del dataset de entrenamiento, el numero de tokens de audio procesados ni si hubo etapas de RLHF o DPO.

Las innovaciones que si se documentan son de integracion: salida con puntuacion natural y formato completo sin necesidad de un modelo de puntuacion posterior, deteccion automatica de idioma dentro del propio modelo, y compatibilidad declarada con pipelines que anteponen un VAD para trocear audio largo. Existe un identificador de arXiv en las etiquetas del repositorio (`arxiv:2601.21337`), pero el contenido de dicho articulo no esta disponible en la informacion consultada y por tanto no se puede verificar ningun detalle adicional de arquitectura o entrenamiento.

## Capacidades

- Reconocimiento automatico de voz end-to-end sobre audio de 16 kHz mono.
- Transcripcion multilingue en 30 idiomas principales y 22 dialectos del chino.
- Identificacion automatica de idioma (LID) integrada en el propio modelo.
- Generacion de texto con puntuacion natural y formato completo, sin modelo de puntuacion en cascada.
- Integracion recomendada con VAD en la fase previa para filtrar silencio y fragmentar grabaciones largas.
- Inferencia en CPU: la model card reporta RTF de 0,65 a 1,10 en CPUs de 8 nucleos, con mejora hasta ~0,55 al activar paralelismo multihilo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio-vision: no disponibles (el modelo es exclusivamente de audio a texto).
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo genera texto con puntuacion de forma nativa, por lo que un flujo que alimente audio de 16 kHz mono desde un unico canal de microfono obtiene un acta legible sin postprocesado de puntuacion.
- Subtitulado y archivado de contenido audiovisual: combinado con un VAD que trocee el audio en segmentos y marcas temporales externas, sirve para generar subtitulos en cualquiera de los 30 idiomas soportados, con deteccion automatica del idioma de origen.
- Atencion al cliente automatizada sobre llamadas: la identificacion de idioma integrada permite enrutar llamadas multilingues sin un clasificador previo y transcribir la conversacion completa antes de pasarla a un sistema de analitica.
- Analisis de calidad y compliance en centros de llamadas: la transcripcion con puntuacion facilita busquedas por palabras clave, deteccion de frases de riesgo y generacion de informes de cumplimiento sobre el texto resultante.
- Accesibilidad y dictado para personas con movilidad reducida: al poder ejecutarse en CPU (4,5-7,5 GB de RAM, 8 nucleos recomendados), es viable desplegarlo en un equipo de sobremesa sin GPU dedicada para dictado continuo.
- Procesamiento por lotes de archivos de audio historicos: el modelo acepta PCM de 16 bits y no requiere GPU, por lo que puede alimentar colas de transcripcion masiva en servidores de CPU con 16 GB de RAM o mas.
- Asistencia a la documentacion clinica o legal: la salida puntuada y la deteccion de dialectos del chino resultan utiles en entornos donde conviven hablantes de distintas variantes, aunque cualquier uso en estos dominios exige revision humana por el riesgo de alucinacion.
- Transcripcion de contenido educativo y generacion de apuntes: con un VAD previo que fragmente clases largas, se puede generar texto indexable y buscable por tema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son de caracter operativo, no de calidad de transcripcion:

| Metrica | Valor reportado |
|---|---|
| RTF en CPU de 8 nucleos | 0,65 - 1,10 |
| RTF con paralelismo multihilo | ~0,55 |
| Tiempo para 10 s de audio | 6,5 - 11 s (CPU de 8 nucleos) |
| RAM en reposo | ~4,2 GB (carga de pesos) |
| RAM en pico (secuencias largas) | ~6,8 - 7,2 GB |
| RAM total recomendada | 4,5 - 7,5 GB |
| Sistema recomendado | 8+ nucleos de CPU, 16+ GB de RAM |

No se dispone de cifras de WER, MMLU, HumanEval ni GSM8K, ni de comparaciones publicadas por el autor con otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,4 GB solo para pesos (1,7 B de parametros), con overhead de activaciones y buffers de audio; en la practica, un margen de 5-6 GB de VRAM es razonable. Estimacion derivada del numero de parametros, no publicada por el autor.
- VRAM estimada en fp32: aproximadamente 6,8 GB solo para pesos.
- GPU recomendadas para despliegue con margen: NVIDIA A100, H100 o L40S para servicio concurrente; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 para desarrollo e inferencia local.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en precision reducida; en 12 GB o mas con comodidad. No se publican variantes cuantizadas, por lo que no hay cifras verificadas para 4 GB o 6 GB de VRAM.
- Despliegue en CPU documentado: requiere 8 nucleos o mas y 16 GB de RAM o mas; el autor reporta RTF de 0,65 a 1,10, por lo que no es apto para transcripcion en tiempo real estricto en un solo hilo.
- Opciones de despliegue: la informacion proporcionada no confirma soporte especifico de vLLM, llama.cpp, Ollama ni TGI. El repositorio incluye `config.json`, `generation_config.json` y `chat_template.json`, compatibles con cargas basadas en `transformers`; la ausencia de ficheros GGUF o de cuantizaciones publicadas limita las alternativas fuera de PyTorch.
- Latencia y throughput: los unicos datos disponibles son los de CPU (RTF 0,65-1,10; ~0,55 con multihilo). No hay cifras de throughput en GPU publicadas en la informacion consultada.
- Preprocesado obligatorio: el audio debe entregarse a 16 kHz, mono, en PCM de 16 bits o flotante normalizado en [-1,0, 1,0].

## Comparativa con modelos similares

Los datos de esta tabla corresponden a conocimiento general sobre los modelos alternativos y no han sido verificados en la informacion proporcionada; los de Qwen3-ASR-1.7B provienen de la model card.

| Modelo | Parametros | Idiomas | Licencia | Formato y disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B | ~1,7 B | 30 idiomas + 22 dialectos del chino | Apache-2.0 | safetensors (2 particiones), sin cuantizaciones publicadas | Ejecutable en CPU; sin benchmarks publicados en la informacion disponible |
| Whisper large-v3 | ~1,55 B | ~99 idiomas | MIT | safetensors, amplio ecosistema de cuantizaciones y de herramientas | Referencia extendida en ASR multilingue; consume audio en ventanas de 30 s |
| Whisper large-v3-turbo | ~0,81 B | ~99 idiomas | MIT | safetensors y derivados | Version destilada con menos capas de decodificacion y mayor velocidad |
| NVIDIA Canary-1B | ~1 B | Multilingue (conjunto limitado de idiomas europeos) | CC-BY-NC-SA 4.0 | NeMo, safetensors | Licencia no comercial, lo que restringe su uso en produccion |

La ventaja diferencial de Qwen3-ASR-1.7B frente a estas alternativas es la combinacion de licencia Apache-2.0 con cobertura especifica de 22 dialectos del chino y deteccion de idioma integrada. La desventaja es la ausencia de benchmarks publicados y de un ecosistema propio de cuantizaciones, frente al ecosistema mucho mas maduro de la familia Whisper.

## Limitaciones y advertencias

- No se han publicado cifras de WER ni de ningun otro benchmark de calidad en la informacion disponible; evaluar el modelo en el dominio objetivo antes de desplegarlo es imprescindible.
- La longitud de contexto no esta documentada, lo que impide estimar de antemano la duracion maxima de audio que admite una sola pasada; el autor recomienda trocear con VAD.
- Riesgo de alucinacion: como todo modelo autorregresivo de ASR, puede generar texto plausible que no corresponde al audio, especialmente con ruido, solapamiento de hablantes o silencios largos. Se recomienda VAD previo y revision en dominios sensibles.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo por acento, genero, edad o variedad dialectal.
- Idiomas: se indican 30 idiomas y 22 dialectos del chino, pero no se publica la lista concreta ni el rendimiento por idioma; el rendimiento fuera de los idiomas mayoritarios es una incognita.
- Este repositorio es una replica de terceros (`tintitu/Qwen3-ASR-1.7B`) con 0 descargas y 0 likes. Aunque incluye manifiesto SHA-256, conviene verificar cada fichero contra el repositorio oficial `Qwen/Qwen3-ASR-1.7B` antes de usarlo en produccion.
- Discrepancia de tamano: HuggingFace informa de 3,7 GB de repositorio, mientras que la suma de los dos safetensors del manifiesto asciende a unos 4,70 GB. Conviene comprobar los checksums tras la descarga.
- Licencia: Apache-2.0 permite uso comercial y redistribucion, pero exige conservar los avisos de copyright y el fichero NOTICE, y mantener la atribucion al equipo Qwen de Alibaba Cloud.
- La etiqueta `arxiv:2601.21337` apunta a un articulo cuyo contenido no esta disponible en la busqueda realizada; no se puede confirmar ningun dato tecnico a partir de ella.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre el modelo; todos los resultados obtenidos corresponden a paginas sin relacion con ASR ni con Qwen.
- No hay confirmacion de soporte en motores de inferencia de alto rendimiento (vLLM, TGI) ni de variantes GGUF para llama.cpp u Ollama.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/tintitu/Qwen3-ASR-1.7B
- Repositorio oficial en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Proyecto upstream en GitHub: https://github.com/QwenLM/Qwen3-ASR
- Repositorio oficial en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-ASR-1.7B
- Identificador de arXiv citado en las etiquetas del repositorio: arxiv:2601.21337 (contenido no disponible en la busqueda realizada)
