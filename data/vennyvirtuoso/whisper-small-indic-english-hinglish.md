# vennyvirtuoso/whisper-small-indic-english-hinglish

## Resumen

whisper-small-indic-english-hinglish es un adaptador LoRA (PEFT) sobre el modelo base openai/whisper-small, desarrollado por el usuario vennyvirtuoso y publicado en Hugging Face. Su objetivo es mejorar el reconocimiento automático de voz (ASR) en inglés indio y en habla espontánea con code-switching hindi-inglés (hinglish), un escenario donde el checkpoint original de Whisper-small falla de forma catastrófica, generando bucles degenerados y transcripciones incorrectas. El modelo resuelve un problema concreto: la baja robustez de Whisper en variedades acentuadas del inglés y en mezcla de idiomas dentro de una misma frase.

El modelo mantiene la arquitectura transformer encoder-decoder de Whisper-small, con 244 millones de parámetros en el modelo base y 7.077.888 parámetros entrenables en el adaptador LoRA (2,84% del total). No se trata de un modelo nuevo, sino de un ajuste fino eficiente mediante LoRA sobre las capas acústicas, lo que permite conservar la licencia permisiva Apache 2.0 y un despliegue ligero en entornos de baja latencia.

Su relevancia actual radica en la combinación de tres factores: una mejora empírica muy grande frente al baseline (reducción absoluta de WER de 51,87 puntos), un tamaño reducido que permite inferencia en CPU y dispositivos edge, y una licencia Apache 2.0 que facilita su uso comercial. No obstante, el rendimiento absoluto sigue siendo limitado (WER de 47,75% en el conjunto de test), por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) con adaptador LoRA |
| Parámetros totales | 248.812.800 (244M) en el modelo base; 7.077.888 entrenables en el adaptador |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantización | No disponible (el modelo card menciona precisión mixta bfloat16/fp16 en entrenamiento, no cuantizaciones de inferencia) |
| Idiomas soportados | Inglés indio y hinglish (code-switching hindi-inglés); no se detalla una lista completa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con 244M de parámetros diseñado para ASR multilingüe. Sobre esta base se aplica un adaptador LoRA con 7.077.888 parámetros entrenables (2,84% del total), descrito por el autor como "LoRA acústico con base fonética". No se especifica en la información disponible qué módulos concretos del transformer se adaptaron (atención, proyecciones, etc.), ni el rango o alpha del LoRA.

El entrenamiento se realizó sobre el dataset agarwalayushi/hinglish, orientado a habla espontánea con code-switching. El autor indica el uso de precisión mixta (bfloat16/fp16) y una evaluación sobre un split de test disjunto por hablante de 169 clips de audio, para garantizar generalización fuera de distribución. No se detalla el número de tokens de audio, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR). La innovación principal declarada es la supresión de alucinaciones en forma de bucles degenerados sobre habla acentuada espontánea.

## Capacidades

- Transcripción automática de voz (ASR) para inglés indio con acento y para habla hinglish con code-switching intra-frase.
- Supresión de bucles degenerados y alucinaciones típicas de Whisper-small en audio acentuado o ruidoso.
- Procesamiento de audio en ventanas de 30 segundos mediante el pipeline de transformers (`chunk_length_s=30`).
- Compatibilidad con `transformers`, `peft`, `sentence-transformers` y el pipeline `automatic-speech-recognition`.
- Despliegue en `faster-whisper` (CTranslate2) y `whisper.cpp` para inferencia en C/C++ y entornos embebidos.
- Soporte de inferencia en CPU y GPU (fp16 en CUDA).
- No se documentan capacidades de traducción, diarización de hablantes, timestamps a nivel de palabra ni tool calling.

## Casos de uso

- Transcripción de atención al cliente en centros de contacto del sur de Asia: el modelo puede procesar conversaciones de agentes y clientes que alternan inglés indio e hindi, reduciendo los fallos de transcripción que el Whisper-small original produce en este dominio.
- Subtitulado de vídeos y tutoriales técnicos en hinglish: el ejemplo de la model card (un tutorial de Ubuntu con la frase "main Ubuntu Linux OS version 12.04 aur KTurtle use kar rahi hoon") ilustra el caso de contenido educativo donde el hablante mezcla terminología inglesa con estructura hindi.
- Voice bots e IVR: al ser un modelo de 244M parámetros con adaptador LoRA, puede integrarse en servicios de baja latencia para transcribir consultas de usuarios en tiempo casi real.
- Transcripción en dispositivos edge: su tamaño reducido permite ejecución vía `whisper.cpp` o WebAssembly en móviles o hardware embebido sin GPU dedicada.
- Generación de actas y notas de reuniones con equipos distribuidos en India: el modelo maneja el cambio de código habitual en reuniones técnicas donde se mezcla inglés e hindi.
- Procesamiento por lotes de archivos de audio para análisis de calidad o compliance: el pipeline de transformers permite evaluaciones de alto rendimiento en lote sobre grabaciones almacenadas.
- Investigación en ASR multilingüe y code-switching: sirve como punto de partida reproducible (LoRA sobre Whisper-small, licencia Apache 2.0) para experimentos académicos sobre variedades acentuadas.

## Benchmarks y rendimiento

| Métrica | Modelo ajustado | Baseline sin adaptar | Mejora absoluta |
|---|---|---|---|
| WER en test held-out | 47,75% | 99,62% | -51,87 puntos |
| CER en test held-out | 34,53% | 85,79% | -51,26 puntos |
| Tamaño del test | 169 clips (disjuntos por hablante) | 169 clips | — |

No se han publicado resultados de benchmarks estándar (MLU, HumanEval, GSM8K no aplican; no hay LibriSpeech, Common Voice ni FLEURS) en la información disponible. Los únicos datos son los del conjunto de test propio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 ocupa aproximadamente 0,5 GB; sumando el adaptador LoRA (unos 28 MB en fp32), el consumo total es inferior a 1 GB en GPU. En CPU, el uso de RAM es de aproximadamente 1 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4). Para alto rendimiento en lote se recomiendan T4, A10G o A100, aunque el modelo no las aprovecha por su tamaño reducido.
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` pipeline, `faster-whisper` (CTranslate2), `whisper.cpp`, `peft` + `transformers` para carga directa del adaptador.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona "latencia lista para producción" y despliegue edge, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | WER (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-indic-english-hinglish | 244M + 7M LoRA | Ventanas de 30 s | 47,75% | Apache 2.0 | Hugging Face (PEFT) |
| openai/whisper-small | 244M | Ventanas de 30 s | 99,62% (mismo test) | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769M | Ventanas de 30 s | No disponible en esta información | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1.550M | Ventanas de 30 s | No disponible en esta información | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos de otros modelos ajustados específicamente para hinglish en la información proporcionada. La comparación con whisper-medium y whisper-large-v3 es cualitativa: son modelos base más grandes sin ajuste específico para este dominio, por lo que su WER en habla hinglish espontánea probablemente sería peor que el del modelo ajustado, pero no hay cifras publicadas que lo confirmen.

## Limitaciones y advertencias

- El WER absoluto en el conjunto de test es alto (47,75%), lo que indica que aproximadamente la mitad de las palabras se transcriben incorrectamente en promedio. No es adecuado para producción sin una evaluación adicional en el dominio concreto de uso.
- El conjunto de evaluación es muy pequeño (169 clips), lo que limita la significación estadística de las métricas reportadas.
- El modelo está ajustado específicamente para inglés indio y hinglish; su rendimiento en otras variedades del inglés, en hindi puro o en otros idiomas no está documentado y probablemente sea degradado.
- Riesgo de alucinación y bucles degenerados persiste en audio con ruido, solapamiento de hablantes o acentos no representados en el dataset de entrenamiento, aunque el autor afirma haberlo reducido.
- No se documentan sesgos demográficos, de género o de edad en el dataset de entrenamiento; el dataset agarwalayushi/hinglish no se describe en detalle.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Whisper-small también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se proporcionan datos sobre el proceso de entrenamiento (hiperparámetros, épocas, tamaño del dataset), lo que dificulta la reproducibilidad.
- El adaptador LoRA requiere cargar el modelo base por separado; no es un checkpoint autónomo, lo que añade complejidad al despliegue en comparación con un modelo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/whisper-small-indic-english-hinglish
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/agarwalayushi/hinglish
- Faster-Whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Documentación del pipeline ASR de transformers: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
