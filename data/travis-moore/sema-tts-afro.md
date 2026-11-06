# travis-moore/sema-tts-afro

## Resumen

Sema Afro TTS v1 es un modelo de síntesis de voz (text-to-speech) multilingüe con clonación de voz zero-shot, desarrollado por Angelo Asante bajo el paraguas de Sema. Su propósito es cubrir 24 variedades lingüísticas africanas, incluyendo twi, yoruba, hausa, amhárico, swahili, igbo, zulú, xhosa, afrikáans, lingala, luganda, shona, somalí, oromo, nyanja, sotho septentrional, wolof, fula, luo, kamba, umbundu, kabuverdianu, pidgin ghanés y code-switching ghanés, además del inglés. El modelo parte de la arquitectura F5-TTS v1 Base y se ofrece como capa de voz dentro de una suite voz-a-voz para lenguas africanas.

Técnicamente se trata de un fine-tune de `mrfakename/OpenF5-TTS` que mantiene intacta la arquitectura original (DiT + ConvNeXt V2 con flow matching) y solo redimensiona la tabla de embeddings de texto, ampliando el vocabulario de 3.567 a 3.821 tokens para cubrir nuevos alfabetos (Ge'ez) y diacríticos (marcas tonales y subpuntos del yoruba). El entrenamiento se realizó sobre aproximadamente 230 horas de habla leída y conversacional remuestreada a 24 kHz mono, durante 18 épocas y 197.640 actualizaciones en una única GPU de centro de datos.

Su relevancia actual radica en que cubre un hueco notable en TTS open source: la mayoría de modelos multilingües dedican una cobertura marginal a lenguas africanas, mientras que este modelo ofrece clonación de voz zero-shot en 24 variedades bajo licencia Apache 2.0, con evaluación ASR-in-the-loop publicada por idioma y una extensión posterior (`sema-tts-boost`) que mejora específicamente el hausa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS v1 Base (DiT + ConvNeXt V2, flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud viene limitada por el texto a sintetizar y la referencia de 5-10 s) |
| Tipos de cuantizacion | no disponible (pesos en `.pt`; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | 24: af, am, en, ff, ha, ig, kam, kea, lg, ln, luo, ny, nso, om, sn, so, sw, tw, umb, wo, xh, yo, zu, más pidgin ghanés y code-switching |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`), checkpoint `sema_afro_v1.pt` + `vocab.txt` |

## Arquitectura y entrenamiento

El modelo reutiliza sin cambios la arquitectura F5-TTS v1 Base, un transformer de difusión (DiT) combinado con bloques ConvNeXt V2 y entrenado con flow matching para la generación de mel-espectrogramas condicionada por texto y una referencia de voz. La única modificación estructural es el redimensionamiento de la tabla de embeddings de texto, que pasa de 3.567 a 3.821 tokens para cubrir la unión del vocabulario base y todos los caracteres presentes en el corpus de entrenamiento, incluyendo escritura Ge'ez y diacríticos del yoruba.

El entrenamiento se realizó sobre unas 230 horas de habla leída y conversacional de las 24 variedades, remuestreadas a 24 kHz mono, con un total de 18 épocas y 197.640 actualizaciones en una sola GPU de centro de datos. A partir de la actualización 100.000 se introdujeron materiales adicionales de inglés, code-switching y pidgin. El twi, el inglés, el code-switching ghanés y el pidgin provienen del linaje del modelo base y de datos específicos de esta ejecución; las otras 21 lenguas se añadieron en este fine-tune. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en 24 variedades africanas más inglés, con cobertura de code-switching ghanés y pidgin.
- Clonación de voz zero-shot: a partir de una referencia limpia de 5-10 segundos y su transcripción, genera nuevo texto en la voz del hablante de referencia.
- Transferencia de voz entre lenguas: la misma referencia puede hablar idiomas que el hablante original no hablaba (demostrado en las muestras de la model card).
- Reproducción del ritmo y prosodia de la referencia, según indica el autor.
- Soporte de escrituras no latinas (Ge'ez para amhárico) y diacríticos (marcas tonales y subpuntos del yoruba).
- Control de velocidad mediante el parámetro `speed` y de pasos de muestreo mediante `nfe_step`.
- No se documenta soporte de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- **Locución y doblaje para lenguas africanas**: dado que el modelo clona una voz a partir de 5-10 segundos de referencia y la transfiere a otras lenguas, un estudio puede grabar una sola voz y producir locuciones en twi, swahili o zulú sin necesidad de hablantes nativos de cada variedad.
- **Audioguías y contenidos educativos**: permite generar materiales de lectura en lenguas con poca presencia en TTS comercial (lingala, umbundu, kamba, luo) manteniendo una voz consistente en toda la colección.
- **Accesibilidad y lectores de pantalla**: integrable en aplicaciones que lean texto en lenguas africanas para usuarios con discapacidad visual, con la ventaja de que la voz puede personalizarse a partir de una muestra del propio usuario.
- **Atención al cliente y asistentes de voz**: la cobertura de code-switching ghanés e inglés permite construir asistentes que alternen lenguas en una misma conversación, algo frecuente en contextos urbanos de África occidental.
- **Preservación lingüística y documentación**: el modelo puede generar corpus de audio sintético en variedades con pocos recursos, útil para investigación lingüística o para ampliar datasets de ASR.
- **Producción de contenido para redes y podcast**: la clonación zero-shot con una referencia corta permite generar versiones en varias lenguas de un mismo guion manteniendo la identidad de la voz del creador.
- **Prototipado de interfaces voz-a-voz**: al ser la capa de voz de una suite voz-a-voz de Sema, encaja como componente TTS en pipelines de asistentes conversacionales multilingües.

## Benchmarks y rendimiento

La evaluación publicada emplea un protocolo ASR-in-the-loop: se clona una muestra de un hablante nativo, el modelo lee una frase no vista y tanto el audio generado como la referencia humana real se transcriben con el mismo reconocedor multilingüe (MMS 1b-all). Se reporta la diferencia de tasa de error de caracteres (CER generada − CER humana); 0 significa indistinguible de la línea base humana por esta medida y valores negativos indican que el ASR encontró el audio sintético más fácil de transcribir que el humano.

| Idioma | Diferencia (pp) | Idioma | Diferencia (pp) |
|---|---:|---|---:|
| Lingala | −7,7 | Kamba | +6,4 |
| Wolof | −3,7 | Oromo | +9,8 |
| Nyanja | −2,2 | Sotho septentrional | +15,5 |
| Somalí | −1,9 | Afrikáans | +17,4 |
| Xhosa | −1,7 | Hausa | +18,4 |
| Swahili | −1,1 | Yoruba | +30,9 |
| Zulú | +0,8 | Amhárico | +78,8 |
| Luo | +2,9 | | |
| Igbo / Kabuverdianu | +3,6 | | |
| Umbundu | +3,7 | | |
| Shona | +3,9 | | |
| Fula | +5,0 | | |

16 de las 21 lenguas evaluables quedan a menos de 10 puntos de su línea base humana y 6 quedan en o por debajo. Luganda se excluye porque el reconocedor falla incluso con la referencia humana real. El autor señala que `sema-tts-boost` mejora el hausa de +18,4 a +8,5. No se publican métricas objetivas de similitud de hablante (SECS, MOS) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 5,4 GB según la ficha de Hugging Face y 264 GB según el árbol de archivos (incluye checkpoints intermedios y muestras); el checkpoint de inferencia es `sema_afro_v1.pt`.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo y la arquitectura F5-TTS Base, es esperable que quepa en GPUs de consumo con 8-12 GB, aunque el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible en la documentación; el entrenamiento se realizó en una única GPU de centro de datos sin especificar modelo.
- Despliegue: la vía documentada es la librería `f5-tts==1.1.22` con `F5TTS` y `hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único parámetro de rendimiento mencionado es `nfe_step=32` como valor de referencia en el ejemplo de uso.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación zero-shot | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| Sema Afro TTS v1 | no disponible (F5-TTS v1 Base) | 24 variedades africanas + inglés | Sí | Apache 2.0 | Referencia de 5-10 s + texto |
| F5-TTS (original) | no disponible | Principalmente inglés y chino | Sí | MIT (según repo original) | Referencia corta + texto |
| XTTS-v2 (Coqui) | no disponible | 17 idiomas, sin lenguas africanas relevantes | Sí | CPML (no comercial) | Referencia de 6 s + texto |
| MMS-TTS (Meta) | no disponible | Más de 1.100 lenguas, incluido varias africanas | No | CC-BY-NC 4.0 | Solo texto |

La comparativa se limita a lo verificable en la información disponible; no se han publicado métricas cruzadas entre estos modelos en la documentación de Sema Afro TTS.

## Limitaciones y advertencias

- El amhárico queda muy por detrás de su línea base humana (+78,8 pp) y el autor lo califica de experimental.
- Yoruba (+30,9 pp) y hausa (+18,4 pp) son usables pero claramente inferiores a las lenguas fuertes del modelo; para hausa existe la continuación `sema-tts-boost`.
- El modelo copia el ritmo de la referencia, por lo que una referencia mal locutada o con ruido degrada la salida.
- Respeta mucho más los puntos que las comas; se recomienda usar frases cortas para evitar prosodia incorrecta.
- Con `f5-tts==1.1.22` y el vocabulario extendido es necesario parchear `f5_tts/model/utils.py` cambiando `padding_value=-1` por `padding_value=0` antes de inferencia por lotes.
- Luganda no es evaluable con el protocolo ASR elegido, por lo que no hay métrica fiable de calidad en esa lengua.
- No se documentan sesgos demográficos, de género o de acento; la evaluación se basa en un único reconocedor (MMS 1b-all) y en referencias de hablantes nativos del conjunto de validación.
- Riesgo de alucinación acústica (audio ininteligible o artefactos) no cuantificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `mrfakename/OpenF5-TTS` y de los datos de entrenamiento antes de desplegar en producción.
- El uso de clonación de voz plantea riesgos de suplantación; no se documentan mecanismos de consentimiento ni marcas de agua en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/travis-moore/sema-tts-afro
- Árbol de archivos: https://huggingface.co/travis-moore/sema-tts-afro/tree/main
- Modelo base: https://huggingface.co/mrfakename/OpenF5-TTS
- Continuación para hausa: https://huggingface.co/travis-moore/sema-tts-boost
- Paper de F5-TTS: https://arxiv.org/abs/2410.06885
- Reconocedor usado en evaluación (MMS 1b-all): https://huggingface.co/facebook/mms-1b-all
- Sema: https://semaink.com
- Autor: https://angeloasante.com
