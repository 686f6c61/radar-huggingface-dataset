# sw-voice/maya2-native-swamiji-te20h-sft-lr1e-6-2ep

## Resumen

`maya2-native-swamiji-te20h-sft-lr1e-6-2ep` es un ajuste fino completo (full fine-tune) del modelo de texto a voz `maya-research/maya2-native`, publicado por el usuario `sw-voice` con fines de investigación. El modelo toma como punto de partida una arquitectura de síntesis de voz de 2.502.398.656 parámetros (unos 2,5 mil millones) y la especializa en una única voz: la de Swamiji, orador de discursos en telugu sobre el Bhagavatam y el Mahabharatam.

El problema que resuelve es acotado pero concreto: conseguir una síntesis de voz consistente y fiel a un hablante determinado a partir de un corpus de 20 horas de audio en telugu, usando una única grabación de referencia fija (`ref_te1`) para condicionar cada fila del conjunto de entrenamiento. No se trata de un modelo generalista, sino de un artefacto de investigación que demuestra un pipeline de adaptación de hablante sobre el modelo base.

Su relevancia es metodológica: documenta de forma explícita la receta de entrenamiento (learning rate, épocas, número de actualizaciones, tamaño de lote, política de warmup y repetición de filas por época), lo que facilita reproducir o auditar el proceso. La model card no aporta información sobre la arquitectura interna del modelo base, los idiomas soportados oficialmente ni métricas de evaluación, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la topología; se infiere una arquitectura de texto a voz, sin confirmar transformer, MoE o híbrida) |
| Parámetros totales | 2.502.398.656 (~2,5 mil millones), según los pesos en safetensors |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible a nivel oficial; los datos de ajuste fino son en telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 5,0 GB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `maya-research/maya2-native`: no se especifica si se trata de un transformer autoregresivo sobre tokens de audio, de un modelo difusor o de un esquema híbrido, ni se detallan el tokenizador de audio, el códec vocacional o el mecanismo de condicionamiento por hablante. Lo que sí se documenta es la interfaz de uso: el modelo se carga mediante `Maya3TTS.from_pretrained(...)` y la voz se registra con un clip de referencia en `mode="spk"`, lo que confirma un esquema de condicionamiento por referencia de hablante (zero-shot o few-shot sobre una voz registrada).

El ajuste fino es supervisado (SFT) y cubre todos los parámetros del modelo. El corpus son 20 horas de unidades temáticas completas en telugu (`sw-voice/swamiji-telugu-bhagavatam-mahabharatam-themes-20h`), con cada fila asociada a un clip de referencia fijo (`ref_te1`) materializado en `clips_te20h.pt`; la notación `FILE*N` indica que cada fila se repite N veces por época para equilibrar la distribución. La configuración es: learning rate 1e-6, 2 épocas, 268 actualizaciones en total, lote 1x8 (8 muestras efectivas por paso), warmup lineal de 10 actualizaciones seguido de tasa constante. No se menciona RLHF, DPO ni ninguna etapa de alineación posterior; el código asociado vive en el repositorio `swamiji-tts`, rama `research/maya2-sft`.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu, condicionada a una voz de referencia registrada previamente.
- Adaptación a un hablante concreto: la voz de Swamiji se incorpora mediante un clip de referencia y `mode="spk"`.
- Salida coherente con el dominio de entrenamiento: discurso religioso y narrativo (Bhagavatam, Mahabharatam).
- Carga e inferencia a través de la librería `Maya3TTS` y de la ruta de código `research/maya2-sft`.
- No se documentan soporte de tool calling, capacidad de agentes, razonamiento multi-paso, visión ni audio de entrada; son capacidades ajenas al propósito del modelo.
- No se documenta multilingüismo, clonación zero-shot con voces arbitrarias ni control de prosodia o emoción.

## Casos de uso

- **Lectura de textos devocionales en telugu**: el modelo puede narrar pasajes del Bhagavatam y del Mahabharatam con la voz del hablante original, aprovechando que el corpus de entrenamiento son 20 horas de Exactly ese material y registro.
- **Producción de audiolibros y series de discursos**: al estar ajustado sobre unidades temáticas completas, es adecuado para generar capítulos largos con una identidad vocal estable a lo largo de toda la grabación.
- **Preservación y accesibilidad de un orador**: permite generar nuevo audio con la voz de Swamiji para contenidos que no fueron grabados originalmente, útil en archivos sonoros y proyectos de accesibilidad para comunidades telugu-hablantes.
- **Doblaje y localización al telugu**: se puede emplear para verter guiones escritos a voz en telugu en proyectos de subtitulado o doblaje de material educativo y religioso.
- **Investigación en adaptación de hablante**: sirve como caso de estudio reproducible de full fine-tune sobre un modelo TTS de 2,5 mil millones de parámetros con un presupuesto de cómputo modesto (268 actualizaciones), útil para comparar estrategias de ajuste (LoRA frente a full fine-tune).
- **Evaluación de pipelines TTS propios**: al estar integrado en `Maya3TTS`, permite validar de extremo a extremo flujos de registro de referencia, segmentación de texto y síntesis por lotes en un entorno controlado.
- **Generación de material catequético y formativo**: creación de audios de estudio por temas para comunidades que consumen contenido en telugu, con coste marginal bajo una vez desplegado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MOS, WER, CER, RTF ni comparaciones con otros sistemas TTS, y el repositorio no registra descargas ni evaluaciones de terceros en el momento de la consulta.

## Requisitos de hardware

- **VRAM estimada en fp16**: en torno a 5-6 GB solo para pesos, más el coste del códec de audio, buffers de activaciones y la referencia de hablante; conviene reservar 8-10 GB para inferencia cómoda.
- **VRAM estimada en fp32**: aproximadamente 10 GB para pesos, con picos superiores durante la carga.
- **Cuantización**: no se publican versiones cuantizadas (GGUF, int8, int4), por lo que el despliegue en VRAM reducida requeriría convertir los safetensors por cuenta propia.
- **GPU consumer**: una RTX 3060 de 12 GB, una RTX 4070 Ti Super de 16 GB o una RTX 4090 de 24 GB deberían cubrir la inferencia en fp16; en tarjetas de 8 GB el margen es escaso y depende de la implementación.
- **GPU de datacenter**: A100 40/80 GB, H100 o L40S son adecuadas para servir varias peticiones concurrentes o para reentrenar el modelo.
- **Despliegue**: la vía documentada es la librería `Maya3TTS` (`Maya3TTS.from_pretrained(...)`) con el clip de referencia registrado en `mode="spk"`. No se confirma compatibilidad con vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de texto estándar.
- **Latencia y throughput**: no disponibles; no se publican medidas de RTF ni de tiempo a primer audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `sw-voice/maya2-native-swamiji-te20h-sft-lr1e-6-2ep` | ~2,5 mil millones | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Full fine-tune monohablante sobre 20 h de telugu |
| `maya-research/maya2-native` (modelo base) | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace | Punto de partida del ajuste; sin datos de arquitectura en esta ficha |
| Otros modelos TTS de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información proporcionada |

No se dispone de datos de benchmarks ni de modelos de referencia comparables en la información suministrada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- **Monohablante y de dominio cerrado**: el ajuste está hecho sobre una única voz y un corpus de discurso religioso en telugu; la calidad fuera de ese registro (conversación, otros idiomas, otros estilos) no está evaluada.
- **Riesgo de sobreajuste**: 2 épocas con repetición de filas (`FILE*N`) sobre solo 20 horas y 268 actualizaciones pueden degradar la variedad prosódica y la generalización del modelo base.
- **Sesgos del corpus**: el material procede de discursos de una tradición religiosa concreta; el modelo puede reproducir sesgos de contenido, entonación y vocabulario propios de esa fuente.
- **Suplantación de identidad**: es un modelo de clonación de voz de una persona real; su uso para generar audio no autorizado plantea riesgos de fraude, desinformación y vulneración de derechos de imagen, pese a la licencia permisiva.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero no cubre los derechos sobre la voz del hablante ni sobre el corpus de origen, que deben verificarse por separado.
- **Alucinación y artefactos**: en TTS el equivalente son pronunciaciones erróneas, omisiones o ruido; no se han publicado métricas de inteligibilidad (WER/CER) que permitan acotar el riesgo.
- **Sin soporte comunitario**: 0 descargas y 0 valoraciones en el momento de la consulta; no hay evidencia externa de calidad ni de estabilidad en producción.
- **Metadatos a verificar**: la fecha de creación del repositorio (2026-10-28) es posterior a la fecha habitual de consulta, lo que conviene contrastar antes de citar el artefacto.
- **Dependencia de código propietario**: la inferencia requiere la clase `Maya3TTS`, no incluida en el repositorio de pesos; sin ese código el modelo no es directamente utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya2-native-swamiji-te20h-sft-lr1e-6-2ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Dataset de ajuste fino (20 h de telugu): https://huggingface.co/datasets/sw-voice/swamiji-telugu-bhagavatam-mahabharatam-themes-20h
- Código de entrenamiento e inferencia: repositorio `swamiji-tts`, ruta `research/maya2-sft` (no se proporciona URL)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos corresponden a entidades ajenas (SolidWorks, SW-Motech, SWTOR, Wikipedia) y se descartan.
