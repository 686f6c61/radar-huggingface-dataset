# travis-moore/sema-tts-boost

## Resumen

Sema TTS Boost v1 es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, desarrollado por Angelo Asante bajo el paraguas de Sema y publicado en Hugging Face bajo el identificador `travis-moore/sema-tts-boost`. Se trata de un ajuste fino del modelo base `sema-tts-afro`, orientado a mejorar el rendimiento en las lenguas que peor se comportaban en la versión original: hausa, yoruba, amhárico, twi, pidgin de África Occidental e inglés con acentos africanos. Cubre 24 variedades lingüísticas africanas más inglés, lo que lo convierte en una propuesta poco habitual dentro del ecosistema TTS.

El modelo mantiene la arquitectura F5-TTS (un transformer de difusión para síntesis de voz) y es compatible a nivel de vocabulario y checkpoint con su predecesor, lo que permite sustituirlo directamente en pipelines existentes. La innovación principal no reside en la arquitectura, sino en la estrategia de entrenamiento: un booster dirigido con aproximadamente 313 horas adicionales de audio (213 horas nuevas centradas en las seis lenguas objetivo y 100 horas de replay para mitigar el olvido catastrófico).

Es relevante ahora porque aborda un nicho tradicionalmente desatendido por los grandes laboratorios: la síntesis de voz de alta calidad en lenguas africanas de bajos recursos, con licencia Apache 2.0 y capacidad de clonación de voz a partir de una referencia de 5 a 10 segundos. El repositorio ocupa 304 GB, lo que refleja la inclusión de muestras de audio y artefactos de entrenamiento además de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (transformer de difusión para TTS, no disponible el detalle exacto de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (referencia de audio de 5-10 s; texto de generación por fragmentos) |
| Tipos de cuantizacion | no disponible (checkpoint `.pt`; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | 24: af, am, en, ff, ha, ig, kam, kea, lg, ln, luo, ny, nso, om, pcm, sn, so, sw, tw, umb, wo, xh, yo, zu |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`) + `vocab.txt`; librería `f5-tts==1.1.22` |

## Arquitectura y entrenamiento

El modelo se basa en F5-TTS, un sistema de síntesis de voz basado en difusión que genera mel-espectrogramas condicionados por texto y por una referencia de audio, y que posteriormente se convierten a forma de onda mediante un vocoder. La clonación de voz es zero-shot: basta con un clip de referencia limpio de 5 a 10 segundos junto con su transcripción para condicionar la generación en cualquier idioma soportado, incluso si la referencia se grabó en otra lengua. El vocabulario es de 3.821 tokens y se mantiene idéntico al del modelo base, lo que garantiza la compatibilidad directa del checkpoint.

El entrenamiento del booster consistió en aproximadamente 313 horas de audio adicional: 213 horas de habla nueva concentrada en hausa, yoruba, amhárico, twi, pidgin e inglés con acentos (incluyendo grabaciones de calidad de estudio y hablantes de EE. UU. y del sur de África), más 100 horas de replay del mixture original del modelo base para contrarrestar el olvido. Se realizaron 4 épocas (57.056 actualizaciones) con una tasa de aprendizaje reducida de 5e-6, partiendo de los pesos EMA del modelo base. Se impusieron marcas tonales del yoruba en todo el texto nuevo. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre datos de audio-transcripción.

## Capacidades

- Síntesis de voz multilingüe en 24 variedades lingüísticas africanas e inglés.
- Clonación de voz zero-shot a partir de una única referencia de 5-10 segundos, transfiriendo la identidad vocal a idiomas que la referencia nunca habló.
- Generación de habla con cambios de código (code-switching) entre lenguas soportadas.
- Inglés con acentos africanos (EE. UU. y sur de África) además del inglés estándar.
- Control de velocidad de habla mediante el parámetro `speed` y de pasos de difusión mediante `nfe_step`.
- Reproducibilidad mediante semilla (`seed`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo de TTS.

## Casos de uso

- **Locución para medios y radio comunitaria en lenguas africanas**: el modelo permite generar voces sintéticas en hausa, twi o pidgin con una calidad que el modelo base no alcanzaba, usando una única grabación de referencia del locutor para mantener la identidad de marca.
- **Audiolibros y contenido educativo**: con referencias de 5-10 segundos de un narrador se puede clonar su voz y generar capítulos completos en swahili, yoruba o zulú, manteniendo coherencia tímbrica entre fragmentos.
- **Atención al cliente y asistentes de voz en lenguas locales**: integrable en pipelines de IVR o asistentes conversacionales para mercados de África Occidental y Oriental, donde la cobertura TTS comercial es escasa.
- **Doblaje y localización de vídeo**: generación de pistas de audio en lenguas africanas a partir de guiones traducidos, preservando la voz del actor original mediante clonación zero-shot.
- **Accesibilidad**: lectura en voz alta de contenidos web o documentos para usuarios con discapacidad visual en lenguas como amhárico, somalí o xhosa, donde las soluciones TTS comerciales son limitadas.
- **Investigación en lingüística computacional**: generación de estímulos de habla controlados para experimentos de percepción, con la ventaja de que la misma voz puede producir enunciados en múltiples lenguas para estudios comparativos.
- **Prototipado de aplicaciones de voz**: dado que es drop-in compatible con el modelo base y se distribuye con licencia Apache 2.0, sirve para validar productos de voz sin coste de licencia.

## Benchmarks y rendimiento

Los resultados se miden con un protocolo ASR-in-the-loop: tanto el clip generado como la referencia humana real se transcriben con MMS 1b-all y se reporta la brecha CER (generado − referencia humana) en puntos porcentuales; menor es mejor y 0 indica paridad con el clip humano.

| Idioma | Base | Boost | Δ |
|---|---:|---:|---:|
| Hausa | +18.4 | +8.5 | −9.9 |
| Northern Sotho | +15.5 | +7.7 | −7.8 |
| Amhárico | +78.8 | +75.0 | −3.8 |
| Fula | +5.0 | +2.6 | −2.4 |
| Kamba | +6.4 | +4.4 | −2.0 |
| Igbo | +3.6 | +1.9 | −1.7 |
| Zulú | +0.8 | −0.0 | −0.8 |
| Nyanja | −2.2 | −3.1 | −0.9 |
| Xhosa | −1.7 | −1.7 | 0.0 |
| Oromo | +9.8 | +9.8 | 0.0 |
| Swahili | −1.1 | +0.6 | +1.7 |
| Kabuverdianu | +3.6 | +6.3 | +2.7 |
| Lingala | −7.7 | −5.2 | +2.5 |
| Luo | +2.9 | +5.4 | +2.5 |
| Wolof | −3.7 | +2.2 | +5.9 |
| Somalí | −1.9 | +6.9 | +8.8 |
| Shona | +3.9 | +13.8 | +9.9 |
| Yoruba | +30.9 | +31.6 | +0.7 |
| Afrikaans | +17.4 | +17.4 | 0.0 |
| Umbundu | +3.7 | +4.7 | +1.0 |

Media sobre las 21 lenguas puntuables: base +6.1, boost +7.1. Twi, pidgin, inglés con cambio de código y con acento no tienen línea base ASR fiable y se evalúan mediante pruebas de escucha; luganda queda excluida porque el reconocedor falla incluso con la referencia humana. No se han publicado resultados de benchmarks estándar (MOS, WER sobre corpus públicos) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint es un `.pt` de F5-TTS y el repositorio completo ocupa 304 GB (incluye muestras y artefactos), por lo que el peso del modelo en sí debe descargarse por separado.
- GPU recomendadas: no disponible en la documentación; por la familia F5-TTS, se espera que funcione en GPU de consumo modernas, pero el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: librería oficial `f5-tts==1.1.22` (API Python `F5TTS`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Nota de despliegue: con `f5-tts==1.1.22` y el vocabulario extendido es necesario parchear una línea en `f5_tts/model/utils.py` (`padding_value=-1` → `padding_value=0`) antes de la inferencia por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Clonación zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sema TTS Boost v1 | F5-TTS (difusión) | 24 lenguas africanas + inglés | Sí, referencia 5-10 s | Apache 2.0 | Hugging Face |
| sema-tts-afro (base) | F5-TTS (difusión) | 24 lenguas africanas + inglés | Sí | Apache 2.0 | Hugging Face |
| F5-TTS original | F5-TTS (difusión) | Principalmente inglés y chino | Sí | no disponible en la información | Hugging Face |
| MMS-TTS (Meta) | VITS | ~1.100 lenguas | No (un modelo por lengua) | no disponible en la información | Hugging Face |

La comparación con F5-TTS original y MMS-TTS se ofrece como referencia de categoría; no se dispone de datos de benchmarks cruzados en la información proporcionada. Frente al modelo base, la elección depende del idioma: el boost es preferible para hausa, pidgin, twi, inglés con acento, northern sotho y fula, mientras que el base es mejor para shona, somalí y wolof; el yoruba es equivalente en ambos.

## Limitaciones y advertencias

- **Amhárico**: sigue muy por detrás de la referencia humana (+75.0 de brecha CER) incluso tras el booster; el cuello de botella es la calidad de los datos disponibles, no el tiempo de entrenamiento.
- **Olvido parcial en lenguas no objetivo**: shona (+9.9), somalí (+8.8) y wolof (+5.9) empeoran respecto al modelo base; es el coste visible del ajuste dirigido.
- **Riesgo de alucinación acústica**: como todo modelo generativo de habla, puede producir artefactos, pronunciaciones incorrectas o prosodia anómala, especialmente en textos largos o con puntuación escasa.
- **Sensibilidad a la referencia**: la calidad del clon depende críticamente de un clip de referencia limpio y de ritmo calmado; el modelo copia el ritmo de la referencia, lo que puede amplificar defectos.
- **Puntuación**: el modelo respeta mucho más los puntos que las comas; se recomienda usar frases cortas.
- **Sesgos**: no se documentan sesgos específicos, pero al entrenarse con grabaciones de hablantes concretos puede reproducir sesgos de género, acento o registro presentes en los datos.
- **Licencia**: Apache 2.0 permite uso comercial, pero la clonación de voz plantea riesgos éticos y legales (suplantación de identidad, consentimiento del hablante) que la licencia no cubre.
- **Compatibilidad**: requiere `f5-tts==1.1.22` y el parche de `padding_value` para inferencia por lotes; versiones distintas pueden romper la compatibilidad.
- **Idiomas sin evaluación ASR fiable**: twi, pidgin e inglés con acento solo cuentan con pruebas de escucha, no con métricas objetivas reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/travis-moore/sema-tts-boost
- Modelo base: https://huggingface.co/travis-moore/sema-tts-afro
- Sema (organización): https://semaink.com
- Autor, Angelo Asante: https://angeloasante.com
- Paper de referencia F5-TTS (arXiv:2410.06885): https://arxiv.org/abs/2410.06885
- Reconocedor MMS 1b-all (evaluación): https://huggingface.co/facebook/mms-1b-all
