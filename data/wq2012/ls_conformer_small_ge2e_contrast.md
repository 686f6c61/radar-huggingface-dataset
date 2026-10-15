# wq2012/ls_conformer_small_ge2e_contrast

## Resumen

`ls_conformer_small_ge2e_contrast` es un modelo de verificación e identificación de locutor (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reproducción open source en JAX/Flax de diversos algoritmos de reconocimiento de locutor publicados por Google. El modelo genera embeddings de locutor de 192 dimensiones y emplea una arquitectura de backbone Conformer en su variante pequeña, con pooling temporal de tipo atento (ATP, Attentive Temporal Pooling) y una función de pérdida GE2E con contraste.

Con apenas 2.029.894 parámetros en el encoder, se trata de un modelo extremadamente compacto, orientado a tareas de verificación biométrica de voz: determinar si dos fragmentos de audio pertenecen al mismo hablante mediante similitud coseno sobre embeddings. Es relevante por su ligereza (apto para despliegue en entornos con recursos limitados) y por ofrecer pesos nativos en Flax junto con una versión en SafeTensors, lo que facilita su integración en pipelines basados en JAX.

El modelo se entrenó sobre el dominio LibriSpeech (inglés leído) y se evaluó en tres dominios distintos (LibriSpeech, CN-Celeb2 y VoxCeleb1), con resultados de EER que reflejan una degradación notable al pasar de dominio, un aspecto importante a considerar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.894 (encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por utterance; frontend con VAD) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y msgpack; sin cuantizaciones GGUF declaradas) |
| Idiomas soportados | no disponible (entrenado en librispeech, ingles leido; evaluado tambien en CN-Celeb2 chino y VoxCeleb1) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |
| Dimension del embedding | 192 |
| Funcion de perdida | ge2e_contrast |
| Scoring de verificacion | similitud coseno |
| Frontend de audio | log_mel de 80 dimensiones a 16000 Hz + VAD de energia + CMVN |
| Libreria | flaxspeaker |
| Pipeline | audio-classification |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer, una arquitectura hibrida que combina bloques convolucionales y mecanismos de self-attention para modelar dependencias locales y globales de la secuencia de audio de forma eficiente en parametros. Sobre el encoder se aplica un mecanismo de Attentive Temporal Pooling (ATP) que agrega la informacion temporal en un unico vector de embedding de locutor de 192 dimensiones. El entrenamiento emplea la funcion de perdida GE2E con variante de contraste, inspirada en el trabajo original de Generalized End-to-End Loss para verificacion de locutor (arXiv:1710.10467) y en refinamientos posteriores como Dr-Vectors (arXiv:2104.01989) y Parameter-Free Attentive Scoring (arXiv:2203.05642).

El frontend acustico extrae caracteristicas log-mel de 80 dimensiones a 16000 Hz, aplicando deteccion de actividad de voz (VAD) basada en energia y normalizacion de media y varianza (CMVN). El modelo se entrena sobre el dominio librispeech. No se especifica en la informacion disponible el numero de tokens o horas de audio empleadas, ni si hubo etapas de RLHF/DPO (poco habituales en tareas de embedding de locutor). La verificacion se realiza mediante similitud coseno entre embeddings. El proyecto FlaxSpeaker se declara como una reproduccion open source "clean-room" de los algoritmos publicados, y no un producto oficialmente soportado por Google.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de audio de una utterance.
- Verificacion de locutor (1-utt y multi-enrollment con 3 utterances): comparacion de dos audios mediante puntuacion coseno.
- Identificacion de locutor (audio-classification) frente a un conjunto de referencia.
- Deteccion de actividad de voz integrada en el frontend (Energy VAD).
- Soporte multi-dominio parcial: evaluado en ingles (LibriSpeech), chino (CN-Celeb2) y audio en condiciones reales de celebridades (VoxCeleb1).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio generativo.
- No dispone de modo "thinking" ni razonamiento textual: es un modelo puramente de representacion de audio.

## Casos de uso

- Verificacion biometrica de voz en aplicaciones de autenticacion: con tan solo 2M de parametros, el modelo permite validar la identidad de un hablante comparando su embedding de enrolamiento con el de la utterance de prueba, adecuado para entornos con latencia y recursos estrictos.
- Control de acceso por voz en dispositivos embebidos: su tamano minimo permite ejecutarlo en CPU o GPU de gama baja, integrandose en sistemas de acceso fisico o desbloqueo por voz.
- Diarizacion asistida por embeddings: los 192 vectores de locutor pueden alimentar un pipeline de clustering para segmentar reuniones o llamadas por hablante.
- Preprocesado para transcripcion personalizada: los embeddings permiten etiquetar y separar hablantes antes o despues de un sistema ASR, mejorando la trazabilidad en transcripcion de reuniones.
- Filtrado de contenido y moderacion de audio: identificacion de locutores recurrentes en plataformas de audio o podcasts para moderacion automatizada.
- Verificacion multi-utterance en atencion al cliente: el modo de 3 utterances de enrolamiento reduce el EER en ingles (de 22,60% a 15,60% en LibriSpeech), util para confirmar la identidad de un cliente con varias muestras grabadas.
- Investigacion y prototipado en JAX/Flax: al ser un modelo nativo de Flax con reproduccion de algoritmos publicados, sirve como referencia reproducible para experimentos academicos en reconocimiento de locutor.

## Benchmarks y rendimiento

Resultados declarados en la model card (EER, minDCF y ROC-AUC por dominio).

Verificacion con 1 utterance:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0,01 | minDCF@0,10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 22,60 | [21,13; 24,07] | 0,9973 | 0,8740 | 0,8558 |
| CN-Celeb2 (chino multigenero) | 3.000 | 36,30 | [34,60; 38,20] | 0,9833 | 0,9247 | 0,6908 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 32,50 | [30,40; 34,55] | 0,9870 | 0,9560 | 0,7381 |
| Universal pooled (3 dominios) | 8.000 | 31,93 | [31,04; 33,02] | 0,9987 | 0,9355 | 0,7393 |
| Universal macro-average | 8.000 | 30,47 | — | 0,9892 | 0,9182 | 0,7616 |

Verificacion con 3 utterances (multi-enrollment):

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0,01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 15,60 | [13,20; 17,45] | 0,9460 | 0,9233 |
| CN-Celeb2 (3-utt) | 1.000 | 33,50 | [30,60; 36,45] | 0,9000 | 0,7328 |
| VoxCeleb1 (3-utt) | 1.000 | 26,60 | [24,20; 29,70] | 0,9740 | 0,8073 |
| Universal pooled (3-utt) | 3.000 | 26,43 | [24,95; 28,07] | 0,9740 | 0,8018 |
| Universal macro-average (3-utt) | 3.000 | 25,23 | — | 0,9400 | 0,8211 |

No se han publicado otros resultados de benchmarks (como MMLU, HumanEval o GSM8K) por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.029.894 parametros, los pesos ocupan aproximadamente 8 MB en fp32 y unos 4 MB en fp16. La huella total es minima (decenas de MB incluyendo buffers de activacion).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware de datacenter. Funciona correctamente en CPU, lo que lo hace apto para entornos embebidos.
- Compatibilidad con GPU de consumo: cabe sobradamente en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX serie 10 en adelante), e incluso en iGPU y dispositivos moviles.
- Opciones de despliegue: el modelo esta orientado a la libreria `flaxspeaker` (JAX/Flax), con API `load_pretrained` y script de inferencia `scripts/inference.py`. Al no publicarse pesos GGUF, no hay soporte declarado para llama.cpp u Ollama. No se documenta integracion con vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera una latencia de milisegundos por utterance en CPU moderna, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos con otros modelos en la informacion proporcionada. A modo orientativo de categoria (reconocimiento de locutor), los modelos comparables serian:

| Modelo | Parametros | Contexto/procesamiento | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ls_conformer_small_ge2e_contrast | 2.029.894 | por utterance, VAD | EER 22,60% (LibriSpeech 1-utt) | apache-2.0 | HuggingFace + GitHub FlaxSpeaker |
| Alternativas tipo ECAPA-TDNN / x-vector | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas basadas en WavLM/wav2vec2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de los modelos alternativos en la documentacion facilitada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Rendimiento limitado y fuertemente dependiente del dominio: el EER asciende del 22,60% en LibriSpeech al 36,30% en CN-Celeb2, lo que indica una degradacion severa fuera del dominio de entrenamiento (ingles leido).
- Entrenado en librispeech: su rendimiento en otros idiomas o en audio espontaneo/en condiciones reales no esta garantizado pese a haber sido evaluado en CN-Celeb2 y VoxCeleb1.
- Tamano muy reducido (2M de parametros): la precision en verificacion es inferior a la de sistemas de locutor de mayor capacidad, por lo que no es recomendable para autenticacion de alta seguridad sin umbrales y mecanismos adicionales.
- Riesgo de confusion entre locutores con voces similares y sensibilidad a ruido, canal y condiciones de grabacion no documentadas.
- Es una reproduccion open source no oficial de Google: los experimentos originales se realizaron con infraestructura y datasets internos, por lo que los resultados no son directamente equiparables a los de los papers.
- No se documentan sesgos demograficos especificos, pero todo modelo biometrico de voz puede presentar sesgos por genero, edad o acento no evaluados en la informacion disponible.
- Licencia apache-2.0: permite uso comercial, pero al tratarse de un modelo biometrico conviene revisar requisitos legales de proteccion de datos (RGPD) en despliegues reales.
- No hay cuantizaciones publicadas (GGUF u otras), lo que limita su uso directo en ciertos runtime de inferencia en borde.
- Modelo con 0 descargas y 0 likes en el momento del registro, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/wq2012/ls_conformer_small_ge2e_contrast
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
- Conformer (arXiv:2005.08100): https://arxiv.org/abs/2005.08100
