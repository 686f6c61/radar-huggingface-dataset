# TheAnimatrix/indic-transcribe-flex-gguf

## Resumen

Indic-Transcribe-Flex GGUF (Q8_0) es una conversión al formato GGUF del modelo de reconocimiento automático del habla bodhan-ai/indic-transcribe-flex, desarrollado por Bodhan AI en colaboración con AI4Bharat y convertido por el usuario TheAnimatrix para su uso con transcribe.cpp y Hexium. El modelo resuelve la transcripción de audio en 22 idiomas de la India, con soporte explícito para code-switching entre lenguas indias e inglés, un escenario muy habitual en el subcontinente y escasamente cubierto por los sistemas ASR convencionales.

La arquitectura subyacente es de tipo Canary (encoder-decoder de ASR), con aproximadamente 1.230 millones de parámetros totales según los pesos en safetensors del modelo base. Esta versión GGUF emplea cuantización Q8_0 (con tensores en F32, F16 y Q8_0) y ocupa 1,41 GB, lo que la hace desplegable en hardware modesto mediante la herramienta transcribe.cpp.

Su relevancia actual radica en dos factores: la cobertura lingüística (asamés, bengalí, bodo, dogri, guyaratí, hindi, kannada, cachemir, konkani, maithili, malabar, manipuri, maratí, nepalí, oriya, punyabí, sánscrito, santali, sindhi, tamil, telugu y urdu, además de inglés) y la flexibilidad de salida en tres modos de escritura (mixta, nativa y romanizada), algo poco común en modelos ASR de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canary (encoder-decoder para ASR) |
| Parametros totales | 1.229.877.232 (~1,23 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (tensores F32, F16 y Q8_0 en el archivo publicado) |
| Idiomas soportados | as, bn, brx, doi, en, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | Indic Open Model License v1.0 |
| Formato de pesos | GGUF (modelo base en NeMo `.nemo`; safetensors en el repositorio original) |

## Arquitectura y entrenamiento

El modelo base sigue la familia Canary, una arquitectura encoder-decoder diseñada específicamente para reconocimiento automático del habla, con un encoder que procesa las características acústicas y un decoder autorregresivo que genera la transcripción. El modelo fue desarrollado por Bodhan AI en colaboración con AI4Bharat, y esta ficha corresponde a la conversión GGUF realizada por TheAnimatrix a partir de la revisión `ecba9ba` del archivo `nemo/indic_transcribe_flex.nemo` publicado en Hugging Face.

La conversión se realizó con el script `convert-indic-canary.py` en modo `mixed` por defecto, y posteriormente se cuantizó con `transcribe-quantize --quant Q8_0`. El resultado es un archivo de 1,41 GB con un SHA-256 documentado (`807af7f8fe04cfa623fa5edb77e422f1db6ef7052ccd3be6064a43ae02dd3282`). No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación técnica destacable es el soporte nativo de code-switching y la triple modalidad de salida de escritura (mixta, nativa y romanizada) controlada mediante flags de la CLI.

## Capacidades

- Transcripción automática de voz (ASR) en 22 idiomas de la India más inglés.
- Soporte de code-switching: reconoce y transcribe mezclas de lenguas indias con inglés en una misma emisión.
- Salida en tres modos de escritura: mixta por defecto (palabras indias en su escritura nativa, inglés y dígitos en latino), nativa con `--no-itn`, y romanizada con un código de idioma `-Latn` (por ejemplo, `te-Latn`).
- Procesamiento de audio en formato WAV mediante la CLI de transcribe.cpp.
- Integración nativa en Hexium como modelo incorporado.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo especializado en ASR.
- No se documentan capacidades de visión ni de audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas multilingües en la India: el modelo gestiona conversaciones donde los hablantes alternan hindi, tamil o bengalí con términos técnicos en inglés, gracias al soporte de code-switching y a la salida mixta por defecto.
- Subtitulado de contenido audiovisual regional: se puede generar subtítulos en escritura nativa o romanizada según el destino (broadcast, plataformas OTT o redes sociales) usando los flags `--no-itn` y `-Latn`.
- Atención al cliente en centros de contacto: transcripción de llamadas en lenguas indias para análisis de calidad, búsqueda de texto completo y cumplimiento normativo, con despliegue local en infraestructura propia mediante transcribe.cpp.
- Documentación clínica y legal dictada: conversión de notas de voz en hindi, maratí o telugu a texto nativo para su integración en sistemas de historiales o expedientes.
- Accesibilidad y voice-to-text para aplicaciones móviles: el tamaño de 1,41 GB en Q8_0 permite ejecutar la inferencia en estaciones de trabajo modestas o servidores de borde sin GPU de gama alta.
- Investigación lingüística y creación de corpus: generación de transcripciones en 22 lenguas con control de la escritura de salida, útil para anotación y estudios comparativos de code-switching.
- Archivado y búsqueda de audio histórico: transcripción por lotes de grabaciones en sánscrito, sindhi o santali, idiomas con poca cobertura en herramientas ASR comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,23 mil millones de parámetros en Q8_0 y un archivo de 1,41 GB, la huella en memoria es del orden de 1,5-2 GB, aunque no se documenta el consumo exacto.
- GPU recomendadas: no disponible; por tamaño, el modelo es viable en GPUs consumer con 4 GB o más de VRAM, si bien el autor no especifica requisitos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del archivo, pero no se confirma en la documentación.
- Opciones de despliegue: transcribe.cpp (rama `hexium` del fork de TheAnimatrix) y Hexium, donde es un modelo incorporado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Indic-Transcribe-Flex GGUF (Q8_0) | ~1,23 mil millones | no disponible | 22 lenguas indias + inglés | Indic Open Model License v1.0 | GGUF |
| Whisper large-v3 | no disponible en la información | no disponible | multilingüe global | MIT (según conocimiento general, no verificado aquí) | safetensors, GGUF |
| Modelos ASR de AI4Bharat (familia Indic) | no disponible | no disponible | lenguas indias | varía | varía |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, licencia y cobertura lingüística.

## Limitaciones y advertencias

- Requiere transcribe.cpp con el parche Indic-Transcribe (rama `hexium` del fork de TheAnimatrix); no funciona con versiones estándar de llama.cpp ni con otras herramientas GGUF genéricas.
- La licencia Indic Open Model License v1.0 permite uso, modificación y redistribución, incluido el uso comercial, pero exige mantener la atribución y la licencia, y requiere aprobación escrita de Bodhan AI para ofrecer el modelo como API a terceros (sección 3); además, se aplican las prohibiciones de la sección 10.
- Al ser una conversión de cuantización Q8_0, puede existir una degradación menor de precisión frente al modelo original en formato NeMo, no cuantificada en la documentación.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados en el entrenamiento.
- La longitud de contexto de audio no está documentada, lo que dificulta planificar la segmentación de grabaciones largas.
- El modelo está especializado en lenguas de la India e inglés; no cubre otras lenguas aunque estén presentes en el audio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/TheAnimatrix/indic-transcribe-flex-gguf
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Repositorio transcribe.cpp (rama hexium): https://github.com/TheAnimatrix/transcribe.cpp/tree/hexium
- Hexium: https://github.com/TheAnimatrix/hexium
- Licencia (LICENSE.md): https://huggingface.co/TheAnimatrix/indic-transcribe-flex-gguf/blob/main/LICENSE.md
- Resumen de licencia en lenguaje claro (indic-open-license.md): https://huggingface.co/TheAnimatrix/indic-transcribe-flex-gguf/blob/main/indic-open-license.md
