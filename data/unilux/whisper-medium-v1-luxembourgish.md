# unilux/whisper-medium-v1-luxembourgish

## Resumen

Whisper-medium-v1-luxembourgish es un modelo de reconocimiento automatico del habla (ASR) especializado en luxemburgues (`lb`), desarrollado por el equipo LuxASR del Departamento de Humanidades de la Universidad de Luxemburgo. Se trata de un ajuste fino del modelo abierto `openai/whisper-medium` sobre aproximadamente 150 horas de pares audio-texto en luxemburgues, con el objetivo de cubrir una lengua de bajos recursos para la que los modelos multilingues genericos ofrecen un rendimiento limitado.

El modelo forma parte de la familia abierta LuxASR, que incluye las variantes tiny, base, small y medium; la version insignia de mayor tamano, empleada en el servicio web, la API y las aplicaciones iOS y Android del proyecto, permanece cerrada. Con unos 764 millones de parametros y pesos en formato safetensors, el modelo se distribuye bajo licencia Open Model, Data & Weights (openmdw-1.1).

Su relevancia actual radica en que cubre una lengua minoritaria europea con un modelo de tamano medio que puede desplegarse en infraestructura modesta, algo poco habitual en el ecosistema ASR, dominado por modelos multilingues de gran escala y bajo rendimiento en lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder, base `openai/whisper-medium`) |
| Parametros totales | 763.857.920 (~764 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper medium procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | luxemburgues (`lb`) |
| Licencia | openmdw-1.1 (Open Model, Data & Weights) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer encoder-decoder de Whisper en su variante medium, con aproximadamente 764 millones de parametros. No se introducen cambios arquitectonicos respecto al modelo base: se hereda el preprocesado de audio en ventanas de 30 segundos, el tokenizador multilingue y el esquema de tareas de Whisper (transcripcion y traduccion), aunque el ajuste se orienta a la transcripcion en luxemburgues.

El entrenamiento se realizo sobre aproximadamente 150 horas de pares audio-texto en luxemburgues recopilados en el marco del proyecto LuxASR. La informacion disponible no detalla la composicion exacta del dataset, el numero de tokens procesados, ni si se aplicaron tecnicas de RLHF o DPO; en ASR supervisado lo habitual es el entrenamiento con entropia cruzada sobre transcripciones, pero este extremo no se confirma en la model card. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion de voz a texto en luxemburgues a partir de audio.
- Reconocimiento robusto de una lengua de bajos recursos gracias al ajuste fino sobre datos nativos.
- Aprovechamiento del preentrenamiento multilingue de Whisper medium como base.
- Integracion directa con la libreria `transformers` mediante el pipeline `automatic-speech-recognition`.
- Uso en investigacion y desarrollo de ASR para luxemburgues.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio mas alla de la transcripcion: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Transcripcion de medios audiovisuales en luxemburgues: el modelo convierte entrevistas, programas de radio y television en texto, algo relevante para un pais con una lengua nacional de difusion limitada en herramientas comerciales.
- Accesibilidad: generacion de subtitulos automaticos para contenido en luxemburgues, mejorando el acceso de personas con discapacidad auditiva a material que de otro modo carece de subtitulos.
- Investigacion linguistica: creacion de corpus transcritos de habla luxemburguesa para estudios foneticos, morfologicos y sociolinguisticos.
- Archivado y digitalizacion de patrimonio oral: transcripcion de grabaciones historicas y entrevistas etnograficas en luxemburgues para su catalogacion.
- Prototipado de asistentes de voz en luxemburgues: el modelo sirve como componente ASR en pipelines de voz a texto para aplicaciones locales, dado su tamano contenido.
- Educacion y aprendizaje de idiomas: transcripcion de material didactico o de practicas orales de estudiantes de luxemburgues para su evaluacion.
- Investigacion comparativa en ASR de bajos recursos: referencia abierta para comparar estrategias de ajuste fino sobre lenguas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3 GB solo para pesos, mas memoria para activaciones y buffers de audio.
- En fp16/bf16: aproximadamente 1,5-2 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM en fp16; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en algunas integradas con cuantizacion.
- Opciones de despliegue: `transformers` (pipeline de ASR), vLLM no aplica de forma estandar a Whisper, llama.cpp no soporta Whisper, Faster-Whisper y WhisperX son alternativas habituales para inferencia optimizada; Ollama no soporta este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unilux/whisper-medium-v1-luxembourgish | ~764 M | lb | ventanas de 30 s (heredado de Whisper) | openmdw-1.1 | HuggingFace |
| openai/whisper-medium | ~764 M | multilingue (99 idiomas) | ventanas de 30 s | MIT (modelo base) | HuggingFace, OpenAI |
| openai/whisper-small | ~244 M | multilingue | ventanas de 30 s | MIT | HuggingFace, OpenAI |
| unilux/whisper-small-v1-luxembourgish (familia LuxASR) | no disponible | lb | ventanas de 30 s | openmdw-1.1 | HuggingFace (segun model card) |

El modelo se diferencia de `openai/whisper-medium` por su especializacion en luxemburgues, a costa de perder cobertura multilingue general. Frente a las variantes menores de la familia LuxASR, ofrece mayor capacidad a cambio de mas requisitos de memoria.

## Limitaciones y advertencias

- Entrenado exclusivamente para luxemburgues; su rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos marcados o vocabulario especializado.
- La model card no documenta sesgos especificos ni la composicion del dataset, lo que dificulta evaluar sesgos de genero, edad o variantes dialectales.
- Licencia openmdw-1.1: conviene revisar sus terminos antes de uso comercial; no es una licencia permisiva equivalente a MIT o Apache 2.0.
- La version insignia del proyecto LuxASR es cerrada, por lo que el modelo abierto no representa el maximo rendimiento del sistema.
- No se publican metricas de WER ni benchmarks, lo que impide validar su calidad de forma objetiva antes de desplegarlo.
- El modelo base Whisper medium tiene limitaciones conocidas en audio de mas de 30 segundos sin segmentacion previa.

## Enlaces

- [HuggingFace: unilux/whisper-medium-v1-luxembourgish](https://huggingface.co/unilux/whisper-medium-v1-luxembourgish)
- [Proyecto LuxASR (Universidad de Luxemburgo)](https://luxasr.uni.lu/)
- [Open Model, Data & Weights (openmdw)](https://www.openmdw.org)
- [Modelo base: openai/whisper-medium](https://huggingface.co/openai/whisper-medium)
