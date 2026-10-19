# TeamUNIVA/qwen3_asr_1.7b_ko

## Resumen

TeamUNIVA/qwen3_asr_1.7b_ko es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, especializado en transcripción de coreano. Lo desarrolla TeamUNIVA y se publica como sucesor de su versión beta (`TeamUNIVA/qwen3_asr_1.7b_ko_beta`). El modelo parte de los pesos de la beta y se entrena con dos rondas de SFT (supervised fine-tuning) seguidas de aprendizaje por refuerzo con GSPO sobre un conjunto de datos ampliado. El objetivo es reducir la tasa de error en coreano respecto tanto al modelo base como a la beta, manteniendo un comportamiento aceptable en inglés.

El resultado declarado por el autor es una mejora de 2,03 puntos porcentuales de CER en el agregado de benchmarks coreanos (de 0,0686 en el base a 0,0483), con un empeoramiento de solo 0,27 puntos de WER en LibriSpeech en inglés (de 0,0250 a 0,0277). El repositorio ocupa 4,7 GB y contiene 2.349.217.408 parámetros según los tensores en safetensors, una cifra superior a los 1,7B que sugiere el nombre y que probablemente incluye el codificador de audio además del decodificador de lenguaje.

Es relevante para equipos que necesiten ASR en coreano con licencia Apache 2.0 y un tamaño manejable en GPU de consumo, especialmente en dominios como atención al cliente telefónica, subtitulado o transcripción de reuniones, donde los benchmarks incluidos (clova_call, ksponspeech, common_voice_ko, zeroth, fleurs_ko) muestran ganancias claras frente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; fine-tune de Qwen/Qwen3-ASR-1.7B (modelo ASR con codificador de audio y decodificador de lenguaje de la familia Qwen3) |
| Parámetros totales | 2.349.217.408 (según safetensors; el nombre comercial indica 1.7B) |
| Parámetros activos | No aplica (no consta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | Coreano (objetivo del fine-tune); conserva capacidad de transcripción en inglés, evaluada en LibriSpeech |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información publicada no detalla la configuración interna (número de capas, dimensión oculta, mecanismo de atención, tamaño del codificador de audio). Lo que sí se documenta es el procedimiento de entrenamiento: el modelo se inicializa desde `TeamUNIVA/qwen3_asr_1.7b_ko_beta` y se somete a dos rondas de SFT seguidas de una fase de aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization), todo ello sobre un conjunto de datos de habla coreana ampliado respecto a la beta. No se especifican el número de tokens de audio procesados, la composición del corpus ni las fuentes concretas de los datos.

Un detalle metodológico relevante es el proceso de evaluación: el autor revisó manualmente todos los conjuntos de benchmark coreanos abiertos, verificando transcripciones con doble normalización (TN e ITN), filtrando muestras de baja calidad y corrigiendo errores de transcripción. De las 8.489 grabaciones originales se retuvieron 8.383 (106 excluidas). Cada utterance se evalúa contra ambas transcripciones (TN e ITN) y se usa la de mejor puntuación para el resultado agregado, lo que conviene tener en cuenta al comparar con cifras publicadas por terceros bajo criterios distintos.

## Capacidades

- Transcripción de voz a texto en coreano, con tasas de error significativamente menores que el modelo base en habla telefónica, conversacional y de lectura.
- Reconocimiento de nombres propios y entidades extranjeras en coreano (los ejemplos de la model card muestran corrección de topónimos como 범어네거리 y nombres como 찬드라 셰카르 솔랑키).
- Manejo de habla espontánea y coloquial, incluidas contracciones y muletillas (ejemplo 근데 경쟁률이 올라가잖아).
- Capacidad residual de transcripción en inglés, con una degradación medida de 0,27 puntos de WER frente al base.
- Normalización de texto e inversa (TN/ITN) soportada en la evaluación: el modelo puede producir transcripciones con o sin normalización, aunque la model card no detalla cómo se controla.
- No se documentan capacidades de diarización, detección de idioma, traducción, tool calling ni marcas de tiempo.

## Casos de uso

- Atención al cliente telefónica en coreano: el modelo obtiene 0,0283 de CER en `clova_call`, el benchmark de llamadas telefónicas, frente a 0,0448 del base, lo que lo hace adecuado para transcribir y analizar grabaciones de centros de contacto con ruido y habla espontánea.
- Subtitulado y transcripción de medios: con 0,0126 de CER en `fleurs_ko` y 0,0220 en `zeroth`, puede emplearse para generar subtítulos automáticos de contenido audiovisual coreano y para indexar archivos de audio.
- Transcripción de reuniones y notas de voz: su tamaño de 2,35B parámetros permite desplegarlo en una GPU de consumo, de modo que se puede ejecutar en local o en un servidor pequeño para transcribir conversaciones internas sin enviar audio a terceros.
- Dictado y asistencia por voz en aplicaciones: integrable como servicio de ASR en un pipeline de reconocimiento de comandos o entrada de texto por voz en coreano, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Generación de corpus y etiquetado de datos: al ser un fine-tune sobre un ASR abierto, sirve para pretranscribir grandes volúmenes de audio coreano y reducir el coste de anotación humana en proyectos de datos.
- Evaluación comparativa de sistemas ASR: con un conjunto de benchmarks documentado y reproducible (`kspon_eval_clean`, `kspon_eval_other`, `common_voice_ko`, etc.), puede usarse como línea base en experimentos de mejora de ASR en coreano.
- Investigación en ajuste fino con RL: el uso de GSPO sobre un modelo ASR de 2,35B constituye una referencia práctica para replicar recetas de refuerzo en tareas de reconocimiento de voz.

## Benchmarks y rendimiento

Datos publicados en la model card. Las puntuaciones coreanas son CER (Character Error Rate) y la inglesa es WER (Word Error Rate); menor es mejor. Calculadas tras normalización de texto (puntuación eliminada, texto plegado a minúsculas; normalizador de Whisper para LibriSpeech).

| Dataset | Métrica | Qwen3-ASR-1.7B (base) | qwen3_asr_1.7b_ko_beta | Este modelo | Cambio (pp) vs. base |
|---|---|---|---|---|---|
| clova_call | CER | 0,0448 | 0,0293 | 0,0283 | -1,65 |
| common_voice_ko | CER | 0,0719 | 0,0628 | 0,0603 | -1,16 |
| fleurs_ko | CER | 0,0142 | 0,0138 | 0,0126 | -0,16 |
| ksponspeech | CER | 0,0865 | 0,0670 | 0,0594 | -2,71 |
| zeroth | CER | 0,0264 | 0,0230 | 0,0220 | -0,44 |
| Total coreano | CER | 0,0686 | 0,0537 | 0,0483 | -2,03 |
| librispeech (inglés, referencia) | WER | 0,0250 | 0,0246 | 0,0277 | +0,27 |

Composición del conjunto de evaluación tras la revisión manual: clova_call 1.083, common_voice_ko 564, fleurs_ko 382, zeroth 449, kspon_eval_clean 2.946, kspon_eval_other 2.959; total 8.383 registros. No se han publicado resultados de otras pruebas (MMLU, HumanEval, GSM8K ni benchmarks de audio fuera de los citados) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los pesos ocupan aproximadamente 4,7 GB (coincide con el tamaño del repositorio), por lo que conviene reservar entre 6 y 8 GB de VRAM contando activaciones y caché de atención. En cuantización int8 bajaría a unos 2,4 GB y en int4 a unos 1,2 GB, aunque no se publican versiones cuantizadas.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o RTX 4090. Para despliegue en producción con concurrencia, una A100 40 GB, L40S o H100 ofrecen mucho más margen y permiten lotes mayores.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más de VRAM usando bf16, y en tarjetas de 4 GB si se aplica cuantización.
- Opciones de despliegue: Transformers es la vía natural al publicarse solo safetensors. No se documentan integraciones verificadas con vLLM, TGI, llama.cpp, Ollama ni whisper.cpp; al no haber GGUF, llama.cpp y Ollama no son viables sin convertir los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER coreano (agregado) | WER inglés (LibriSpeech) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TeamUNIVA/qwen3_asr_1.7b_ko (este) | 2,35B | No disponible | 0,0483 | 0,0277 | Apache 2.0 | HuggingFace |
| TeamUNIVA/qwen3_asr_1.7b_ko_beta | No disponible | No disponible | 0,0537 | 0,0246 | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-ASR-1.7B (base) | 1,7B (nominal) | No disponible | 0,0686 | 0,0250 | Apache 2.0 | HuggingFace |

No se dispone de resultados comparables de otras familias ASR (por ejemplo, Whisper large-v3 o modelos específicos para coreano) medidos sobre este mismo conjunto de evaluación revisado, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- El ajuste está orientado exclusivamente al coreano; el rendimiento en otros idiomas distintos del inglés no está evaluado y previsiblemente se degrada.
- Se produce una pérdida medible en inglés: +0,27 puntos de WER en LibriSpeech respecto al modelo base.
- Los benchmarks han sido revisados y filtrados por el propio autor, y la puntuación final usa la mejor de dos transcripciones (TN o ITN) por utterance. Esto puede hacer que las cifras no sean directamente comparables con evaluaciones externas que usen un único protocolo.
- Riesgo de alucinación y de sustituciones plausibles en audio con ruido, solapamiento de hablantes o vocabulario muy específico; los ejemplos de la model card muestran errores residuales incluso en este modelo (por ejemplo, repeticiones tipo 기르 기르는).
- No se documentan sesgos demográficos, acentos regionales ni variedades dialectales del coreano cubiertas por los datos de entrenamiento.
- No se especifican la composición ni la procedencia del corpus de entrenamiento, lo que dificulta evaluar riesgos de licencia o de privacidad en los datos.
- No se publican versiones cuantizadas ni formatos GGUF, lo que limita el despliegue en entornos de CPU o en herramientas como Ollama y llama.cpp.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen/Qwen3-ASR-1.7B y de los datasets empleados en la evaluación.
- No hay información sobre latencia, throughput ni comportamiento en despliegues concurrentes, aspectos críticos para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo predecesor (beta): https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko_beta
- Audios de ejemplo del repositorio: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko/tree/main/audio

La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (solo resultados genéricos de YouTube), por lo que no se dispone de papers, blogs técnicos ni demos adicionales que enlazar.
