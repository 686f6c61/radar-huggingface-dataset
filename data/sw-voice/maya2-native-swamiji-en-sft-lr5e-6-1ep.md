# sw-voice/maya2-native-swamiji-en-sft-lr5e-6-1ep

## Resumen

Maya 2 Native Swamiji English SFT es un ajuste fino completo (full fine-tune) del modelo base `maya-research/maya2-native`, un sistema de síntesis de voz (text-to-speech) desarrollado por el equipo de sw-voice. El modelo está especializado en la clonación de una voz concreta ("Swamiji") a partir de un conjunto de datos de 719 clips deduplicados que suman 3,8 horas de audio en inglés. El objetivo es mejorar la fidelidad de la clonación de voz respecto al modelo base, que ya ofrecía clonación zero-shot.

El modelo tiene 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 5,0 GB. La licencia es Apache 2.0, lo que permite uso comercial, y el único idioma declarado es el inglés. Es relevante porque demuestra un flujo de trabajo de ajuste fino supervisado (SFT) sobre un TTS de clonación, con métricas objetivas de similitud de voz y tasa de error de palabras (WER) que permiten evaluar la mejora frente al modelo base.

La model card reporta una coincidencia de voz (voice match) de 0,811 con el vector de voz, lo que representa el 93 % de la similitud de una voz real, y un WER de Whisper del 2,9 %. El modelo base, en clonación zero-shot, obtiene 0,643 (74 %) y 2,0 % de WER respectivamente. Estas cifras indican una mejora sustancial en la fidelidad de la voz a costa de un ligero aumento del WER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech; arquitectura del base `maya2-native` no detallada) |
| Parametros totales | 2.502.398.656 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base `maya-research/maya2-native` en la información proporcionada. Se sabe que es un modelo de text-to-speech con capacidad de clonación de voz, que se carga mediante el paquete `maya3` con la clase `Maya3TTS.from_pretrained(...)` y que admite el registro de un clip de referencia con `mode="spk"`. El ajuste fino se realizó sobre el checkpoint completo (full fine-tune), no mediante adaptadores.

El entrenamiento se llevó a cabo sobre el dataset `sw-voice/swamiji-voice-sft-sidon`, deduplicado a 719 clips (3,8 horas de audio en inglés). Se usó el optimizador AdamW con una tasa de aprendizaje constante de 5e-6 tras un calentamiento de 10 actualizaciones, tamaño de lote de 2 x 4, una época (90 actualizaciones) y pesos maestros en fp32. La composición del entrenamiento fue de un 30 % de filas con prompt de clonación y un 70 % de filas con vector de voz. El código del experimento se encuentra en el repositorio `swamiji-tts`, rama `research/maya2-sft`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- Clonación de voz mediante vector de voz (voice vector) o prompt de clonación (clone prompt), con registro de un clip de referencia en modo `spk`.
- Especialización en una única voz ("Swamiji") tras el ajuste fino.
- Generación de audio con una similitud de voz medida de 0,811 frente a la voz real (93 % de coincidencia).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del modelo.

## Casos de uso

- **Clonación de voz para audiolibros y narración**: el modelo permite generar narraciones en inglés con una voz concreta y consistente, usando el vector de voz registrado, lo que resulta adecuado para proyectos de locución automatizada con identidad vocal fija.
- **Generación de voces para asistentes y chatbots de voz**: al cargarse con `Maya3TTS.from_pretrained` y registrar un clip de referencia, se puede integrar en un pipeline de TTS para respuestas habladas en inglés con una voz personalizada.
- **Doblaje y localización de contenido**: la clonación de voz permite mantener una voz de referencia en distintos textos en inglés, útil para doblar vídeos o materiales formativos manteniendo la coherencia de la voz.
- **Prototipado de interfaces de voz**: investigadores pueden usar este checkpoint para experimentar con clonación de voz few-shot y evaluar la calidad con métricas objetivas (voice match, WER de Whisper) antes de pasar a producción.
- **Investigación en ajuste fino de TTS**: el modelo sirve como referencia reproducible de un SFT con hiperparámetros documentados (LR 5e-6, 1 época, AdamW), útil para estudiar el efecto del ajuste fino sobre la fidelidad de la voz.
- **Generación de contenido accesible**: conversión de texto a voz en inglés para lectores de pantalla o materiales de accesibilidad, con una voz estable y de alta similitud.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de evaluación sobre 50 textos de prueba en inglés, usando únicamente el vector de voz:

| Metrica | Este modelo (SFT) | Base Maya (zero-shot) |
|---|---|---|
| Voice match | 0,811 (93 % de una voz real) | 0,643 (74 %) |
| WER (Whisper) | 2,9 % | 2,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,5 mil millones de parámetros en safetensors (5,0 GB de repositorio), se puede estimar que en fp16 requiere alrededor de 5 GB de VRAM solo para los pesos, más el overhead del runtime y del codificador/decodificador de audio.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo con al menos 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no se confirma compatibilidad.
- Cabe en GPU de consumo: probable por el tamaño de los pesos, pero no está verificado en la información disponible.
- Opciones de despliegue: el autor indica el paquete `maya3` (`Maya3TTS.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maya 2 Native Swamiji English SFT (este) | 2,50 B | no disponible | Voice match 0,811; WER 2,9 % | Apache 2.0 | Hugging Face |
| maya-research/maya2-native (base) | no disponible | no disponible | Voice match 0,643; WER 2,0 % (zero-shot) | no disponible en la informacion | Hugging Face |
| Otras alternativas de TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- **Silencio final**: el modelo genera aproximadamente 1 segundo de silencio al final del audio, copiado de los clips de entrenamiento.
- **Frases omitidas**: se producen omisiones ocasionales de frases durante la síntesis.
- **Idioma único**: solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- **Voz única**: el ajuste fino está especializado en la voz "Swamiji"; la generalización a otras voces no está garantizada.
- **Sesgos**: no se documentan sesgos específicos, pero al entrenarse con una única voz y un corpus limitado (3,8 horas) puede presentar limitaciones de cobertura prosódica y léxica.
- **Riesgo de alucinación**: no aplica en el sentido textual, pero pueden aparecer artefactos de audio o pronunciaciones incorrectas no documentadas.
- **Licencia**: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `maya-research/maya2-native`, no indicada en la información disponible.
- **Datos de entrenamiento**: el dataset es pequeño (719 clips, 3,8 horas), lo que puede limitar la robustez en dominios alejados del corpus.
- **Reproducibilidad**: el checkpoint está etiquetado como "research"; no se garantiza estabilidad en producción.

## Enlaces

- [Hugging Face: sw-voice/maya2-native-swamiji-en-sft-lr5e-6-1ep](https://huggingface.co/sw-voice/maya2-native-swamiji-en-sft-lr5e-6-1ep)
- [Modelo base: maya-research/maya2-native](https://huggingface.co/maya-research/maya2-native)
- [Dataset: sw-voice/swamiji-voice-sft-sidon](https://huggingface.co/datasets/sw-voice/swamiji-voice-sft-sidon)
- Código: repositorio `swamiji-tts`, rama `research/maya2-sft` (no se proporciona URL directa en la información disponible)
