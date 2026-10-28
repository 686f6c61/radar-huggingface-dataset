# sw-voice/maya2-native-swamiji-en-sft-lr1e-5-1ep

## Resumen

Maya 2 Native, Swamiji English SFT, LR 1e-5, 1 epoch es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz maya-research/maya2-native, publicado por el usuario sw-voice con fines de investigación. El objetivo no es un modelo generalista, sino especializar el modelo base en una única voz en inglés (la voz «Swamiji») para que reproduzca un timbre concreto con alta fidelidad, en lugar de depender de la clonación zero-shot del modelo original. Cuenta con 2.502.398.656 parámetros (unos 2,5 mil millones) y un repositorio de 5,0 GB en formato safetensors.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, entrenado sobre un corpus muy pequeño (719 clips, 3,8 horas) y con un pipeline declarado de text-to-speech en inglés. Su interés técnico está en documentar el compromiso medido entre similitud de voz y inteligibilidad: el fine-tune sube la coincidencia de voz de 0,643 a 0,831, pero degrada la tasa de error de palabra (WER de Whisper) de 2,0 % a 6,5 % respecto al modelo base.

Se distribuye bajo licencia Apache 2.0 y se carga con el paquete `maya3` (`Maya3TTS.from_pretrained`), registrando un clip de referencia con `mode="spk"`. No se han publicado detalles de arquitectura, composición del dataset de preentrenamiento ni resultados de benchmarks estándar en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de text-to-speech derivado de maya-research/maya2-native; la model card no detalla la arquitectura interna) |
| Parámetros totales | 2.502.398.656 (≈2,5 mil millones) |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible (modelo TTS; la model card no especifica ventana de contexto de texto ni límite de longitud de audio) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 5,0 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base Maya 2 Native más allá de su condición de sistema text-to-speech. Lo que sí se documenta con precisión es el procedimiento de ajuste: full fine-tune sobre el dataset sw-voice/swamiji-voice-sft-sidon, deduplicado a 719 clips que suman 3,8 horas de audio. El entrenamiento usó AdamW con tasa de aprendizaje constante de 1e-5 tras un calentamiento de 10 actualizaciones, tamaño de lote efectivo de 2 × 4, una sola época (90 actualizaciones en total) y pesos maestros en fp32. La composición de las filas de entrenamiento fue de un 30 % con «clone-prompt» (clip de referencia como prompt) y un 70 % con vectores de voz (voice vectors), lo que condiciona el modo de inferencia recomendado.

No se especifican en la información disponible el número de tokens de audio, la composición del corpus original de Maya 2 Native, ni si el modelo base incorporó RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El código del ajuste se referencia como swamiji-tts, rama `research/maya2-sft`, sin enlace directo verificado en las fuentes consultadas.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Clonación de voz con clip de referencia: registro de un clip de la voz Swamiji mediante `mode="spk"` en el paquete `maya3`.
- Condicionamiento por vector de voz (voice vector), que es el modo evaluado en la model card y el que obtiene las métricas reportadas.
- Reproducción de un timbre concreto aprendido por fine-tune, no una voz genérica: la coincidencia de voz medida es de 0,831 frente a 0,643 del modelo base en clonación zero-shot.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Tool calling / function calling: no disponible (no es una capacidad propia de un modelo TTS).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Visión, audio de entrada como comprensión o modo «thinking»: no disponible.

## Casos de uso

- Narración de audiolibros y contenido largo en inglés: el modelo mantiene un timbre fijo entre fragmentos gracias al vector de voz registrado, lo que evita la deriva de identidad que aparece al clonar zero-shot fragmento a fragmento. Requiere recorte del silencio final de aproximadamente 1 segundo.
- Doblaje y localización de vídeo: generación de pistas de voz en inglés con una única voz de marca para tutoriales, cursos o vídeos corporativos, con revisión manual para detectar las frases omitidas ocasionalmente.
- Prototipado de asistentes de voz e IVR: creación rápida de demos con una voz corporativa concreta antes de invertir en un modelo comercial, aceptando que la inteligibilidad (WER 6,5 %) es inferior a la del modelo base.
- Accesibilidad y lectura de documentos: conversión de artículos, informes o documentación técnica en inglés a audio, con la ventaja de una licencia Apache 2.0 que permite integración en productos sin coste de licencia.
- Generación de datos sintéticos para ASR: producción de audio etiquetado con una voz consistente para aumentar datasets de reconocimiento de voz, aplicando un control de calidad que descarte las muestras con frases saltadas.
- Pruebas A/B de identidad de voz en producto: comparación de la percepción de usuarios entre la voz clonada zero-shot del modelo base y la voz ajustada, usando la métrica de coincidencia de voz como criterio objetivo.
- Investigación en adaptación de TTS: punto de partida reproducible (hiperparámetros, composición de filas y dataset publicados) para estudiar sobreajuste de voz con corpus pequeños, dado que 3,8 horas y 90 actualizaciones bastan para desplazar la voz pero degradan el WER.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de síntesis de voz. La model card sí reporta una evaluación específica de TTS sobre 50 textos de prueba en inglés, usando únicamente el vector de voz:

| Métrica | Este fine-tune (Swamiji SFT) | Maya 2 Native base (clonación zero-shot) |
|---|---|---|
| Coincidencia de voz (voice match) | 0,831 (95 % respecto a la voz real) | 0,643 (74 % respecto a la voz real) |
| WER de Whisper | 6,5 % | 2,0 % |
| Conjunto de evaluación | 50 textos de prueba en inglés | 50 textos de prueba en inglés |

La lectura conjunta de ambas filas es el dato más relevante del checkpoint: la especialización mejora la similitud de timbre en 0,188 puntos absolutos, pero multiplica por más de tres la tasa de error de palabra. No se dispone de intervalos de confianza, desviaciones típicas ni de la metodología completa de cálculo del voice match.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 2,5 mil millones de parámetros, no confirmada por el autor): en fp32, en torno a 10 GB; en bf16/fp16, en torno a 5 GB, lo que concuerda con el tamaño del repositorio (5,0 GB); en int8, en torno a 2,5 GB si se aplica cuantización posterior, no documentada oficialmente.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU con 8-16 GB de VRAM debería ser suficiente en precisión reducida, y 24 GB (RTX 3090/4090, A10G, L4) permite trabajar en fp32 sin cuantizar.
- Cabe en GPU de consumo: probable en tarjetas de 8 GB o más en bf16, y en 6-8 GB con cuantización a int8; no verificado por el autor.
- Opciones de despliegue: el único método documentado es el paquete `maya3` (`Maya3TTS.from_pretrained` sobre el repositorio o una copia local) con registro de clip de referencia mediante `mode="spk"`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son el objetivo habitual de un modelo TTS.
- Latencia y throughput: no disponibles. No se publican tiempos de síntesis, RTF (real-time factor) ni métricas de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (maya2-native-swamiji-en-sft-lr1e-5-1ep) | ≈2,5 mil millones | Inglés | TTS con fine-tune de una voz concreta | Apache 2.0 | HuggingFace, 0 descargas |
| maya-research/maya2-native (modelo base) | No disponible | No disponible en la información consultada | TTS con clonación zero-shot | No disponible en la información consultada | HuggingFace |
| Otras alternativas de TTS open source de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación con datos verificables es frente al modelo base: misma familia, mismos parámetros de partida y evaluación sobre el mismo conjunto de 50 textos. El fine-tune gana en coincidencia de voz (0,831 frente a 0,643) y pierde en inteligibilidad (WER 6,5 % frente a 2,0 %). No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros en la información proporcionada, por lo que no se establece comparación con alternativas externas.

## Limitaciones y advertencias

- Inteligibilidad degradada: el WER de Whisper sube del 2,0 % del modelo base al 6,5 %, un deterioro de más del triple que puede traducirse en palabras mal pronunciadas o ininteligibles en producción.
- Silencio final de aproximadamente 1 segundo: la model card indica que es un artefacto heredado de los clips de entrenamiento; requiere recorte en postprocesado antes de encadenar fragmentos de audio.
- Frases omitidas ocasionalmente: se documenta el salto de frases completas, un fallo crítico en narración o doblaje que obliga a verificación automática (por ejemplo, comparando la transcripción del audio generado con el texto de entrada).
- Corpus de entrenamiento muy pequeño: 719 clips y 3,8 horas, con una sola época y 90 actualizaciones; el riesgo de sobreajuste a las condiciones acústicas de ese material (micrófono, sala, estilo de locución) es alto y no se ha evaluado su generalización a otros dominios.
- Sesgos: no documentados por el autor. Al estar especializado en una única voz y un único idioma, no hay información sobre sesgos de género, acento o registro.
- Riesgo de alucinación en sentido estricto: no aplica a nivel de contenido factual, pero sí existe riesgo de prosodia incorrecta y de contenido no solicitado en forma de frases omitidas o arrastradas del corpus.
- Limitación de idioma: solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset de voz de origen deben verificarse por separado; la licencia del dataset sw-voice/swamiji-voice-sft-sidon no se detalla en la información disponible.
- Riesgo legal y ético por clonación de voz: la voz ajustada imita a una persona concreta; el uso comercial o la redistribución del modelo de voz exige consentimiento explícito del hablante y cumplimiento de la normativa aplicable sobre identidad vocal.
- Madurez: 0 descargas y 0 likes, publicación y actualización el mismo día (27 de octubre de 2026), sin evidencias de uso en producción ni mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya2-native-swamiji-en-sft-lr1e-5-1ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Dataset de ajuste: https://huggingface.co/datasets/sw-voice/swamiji-voice-sft-sidon
- Código del ajuste: referencia «swamiji-tts, rama research/maya2-sft» en la model card; no se ha localizado URL verificable en la búsqueda web.
- Papers, blogs y demos: no disponibles en la información proporcionada.
