# Tree-AI-lab/kouman-tts-bau-waxal-full

## Resumen

Kouman TTS Bau Waxal Full es un modelo de síntesis de voz (text-to-speech) desarrollado por Tree-AI-lab, orientado específicamente al idioma baoulé (código ISO `bci`), una lengua hablada principalmente en Costa de Marfil. El modelo se enmarca en el proyecto Kouman-IA y se ha entrenado a partir del corpus multilingüe WaxalNLP de Google, lo que lo convierte en una de las pocas alternativas publicadas para TTS en una lengua africana de bajos recursos.

Técnicamente se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la misma familia de arquitecturas utilizada por los modelos MMS-TTS de Meta, con 39,6 millones de parámetros totales. A pesar del tamaño reducido del repositorio en parámetros, el espacio ocupado en disco es de 57,3 GB, lo que sugiere la presencia de múltiples checkpoints, artefactos de entrenamiento o variantes empaquetadas junto a los pesos principales.

Su relevancia actual radica en dos factores: por un lado, cubre una lengua con escasísima representación en el ecosistema de modelos de voz; por otro, se distribuye con licencia Apache 2.0, lo que facilita su integración en productos comerciales. El acceso está restringido (gated) y requiere aceptar las condiciones en Hugging Face antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variante MMS-TTS) |
| Parametros totales | 39.642.224 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | baoule (`bci`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un encoder de texto, un prior normalizante basado en flujos, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. Esta familia es la empleada por los modelos MMS-TTS de Meta para cobertura multilingüe, y el tag `mms-tts` en el repositorio indica que la implementación sigue ese linaje, lo que permite cargarlo con la clase `VitsModel` de la librería `transformers`.

El entrenamiento se ha realizado sobre el dataset `google/WaxalNLP`, un corpus multilingüe de voz para lenguas africanas. No se han publicado en la información disponible detalles sobre el número exacto de horas de audio utilizadas, la composición del split de entrenamiento ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional. Tampoco se documentan procesos de RLHF/DPO, algo esperable en un modelo TTS no conversacional.

## Capacidades

- Síntesis de voz (text-to-audio) a partir de texto en baoulé.
- Generación de audio end-to-end sin necesidad de un vocoder externo, al integrar el decoder generativo en el propio modelo VITS.
- Integración nativa con la pipeline `text-to-speech` de `transformers`.
- Compatible con endpoints de inferencia (`endpoints_compatible`), lo que permite desplegarlo en infraestructura de Hugging Face Inference Endpoints.
- Soporte de un único idioma (`bci`); no se documenta multilingüismo ni cambio de voz.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- **Locución automatizada en baoulé para medios locales**: el modelo permite generar narraciones de noticias o contenidos informativos en baoulé sin necesidad de un locutor humano, útil para radios comunitarias de Costa de Marfil que emiten en esta lengua.
- **Accesibilidad para personas con discapacidad visual**: lectura en voz alta de textos escritos en baoulé, integrada en lectores de pantalla o aplicaciones móviles de accesibilidad.
- **Aprendizaje de la lengua**: aplicaciones educativas que pronuncien vocabulario y frases en baoulé para hablantes de otras lenguas o para la diáspora que quiere mantener el idioma.
- **Digitalización de contenidos culturales**: conversión de transcripciones de relatos orales, proverbios o material etnográfico a audio sintético para archivos sonoros.
- **Asistentes de voz de dominio restringido**: integración en sistemas de atención telefónica o IVR en baoulé para servicios públicos o bancarios en regiones donde esta lengua es predominante.
- **Generación de material de subtitulado y doblaje**: producción de pistas de audio en baoulé para vídeos formativos o campañas de salud pública, reduciendo el coste frente a la contratación de locutores.
- **Investigación en TTS de bajos recursos**: servir como baseline reproducible para experimentos de adaptación a otras lenguas africanas con corpus similares de WaxalNLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 39,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 158 MB; en fp16, unos 79 MB. La inferencia completa con buffers intermedios de VITS puede requerir del orden de 1-2 GB de VRAM, aunque no se han publicado mediciones oficiales.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. También es viable en CPU para cargas de baja concurrencia.
- **Cabe en GPU consumer**: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: `transformers` con la clase `VitsModel` y la pipeline `text-to-speech`; Hugging Face Inference Endpoints (tag `endpoints_compatible`); servidores propios con FastAPI o similares envolviendo la pipeline. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. Al ser un modelo VITS de tamaño reducido, se espera latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tree-AI-lab/kouman-tts-bau-waxal-full | 39,6 M | baoule (`bci`) | VITS | Apache 2.0 | Gated en HF |
| facebook/mms-tts-bci | no disponible en la informacion | baoule (`bci`) | VITS (MMS-TTS) | CC-BY-NC 4.0 (habitual en MMS) | Publico en HF |
| facebook/mms-tts-mul | no disponible en la informacion | multilingue (1000+ lenguas) | VITS (MMS-TTS) | CC-BY-NC 4.0 | Publico en HF |

La comparación directa con `facebook/mms-tts-bci` es la más relevante, ya que ambos abordan la misma lengua. La diferencia principal documentada es la licencia: Kouman emplea Apache 2.0, lo que permite uso comercial sin las restricciones no comerciales que suelen acompañar a los modelos MMS. No se dispone de datos de calidad subjetiva (MOS) ni de benchmarks objetivos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated; es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede ralentizar la integración en pipelines automatizados.
- **Cobertura lingüística única**: solo soporta baoulé (`bci`); no es adecuado para otras lenguas ni para mezcla de idiomas.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede generar pronunciaciones incorrectas, prosodia antinatural o artefactos en palabras poco frecuentes u OOV.
- **Sesgos del corpus**: al entrenarse sobre WaxalNLP, el modelo hereda los sesgos de género, registro y variedad dialectal del corpus, que puede no representar todas las variantes del baoulé.
- **Sin datos de calidad publicados**: no hay MOS, ni evaluaciones de inteligibilidad, ni comparaciones objetivas con alternativas, lo que dificulta estimar su calidad en producción.
- **Tamaño del repositorio**: 57,3 GB para un modelo de 39,6 M de parámetros indica que el repo contiene artefactos adicionales (posiblemente checkpoints intermedios, logs o datasets); conviene revisar la estructura antes de descargarlo completo.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene verificar las condiciones del corpus WaxalNLP subyacente y las posibles obligaciones de atribución.
- **Sin soporte documentado** de cuantización, despliegue en vLLM/Ollama ni aceleración específica; el rendimiento en producción dependerá de la implementación propia.

## Enlaces

- Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-tts-bau-waxal-full
- Dataset de entrenamiento: https://huggingface.co/datasets/google/WaxalNLP
- Documentación de `VitsModel` en transformers: https://huggingface.co/docs/transformers/model_doc/vits
- Documentación de la pipeline text-to-speech: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextToAudioPipeline
