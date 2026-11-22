# wq2012/univ_full_eres2conformer_v2_large

## Resumen

`univ_full_eres2conformer_v2_large` es un modelo de verificación e identificación de hablante (speaker verification / speaker recognition) publicado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: es un extractor de embeddings de hablante que convierte una señal de audio en un vector de 256 dimensiones, de modo que dos fragmentos del mismo locutor quedan próximos en el espacio de embeddings y dos fragmentos de locutores distintos quedan alejados. La comparación se realiza mediante similitud coseno.

El modelo emplea una arquitectura ERes2Conformer en su variante `large`, con pooling temporal atencional de tipo CATP y un objetivo de entrenamiento Sub-Center ArcFace (K=3, escala 32, margen 0,32). El checkpoint incluido está implementado desde cero en JAX/Flax, partiendo únicamente de los artículos publicados, y se distribuye con pesos en SafeTensors, Msgpack nativo de Flax y exportaciones TFLite (FP32 e INT8) del codificador. Cuenta con 36.324.302 parámetros de inferencia (codificador más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento).

Su relevancia radica en que es un modelo universal entrenado sobre un pool multi-corpus amplio (VoxCeleb1-dev, VoxCeleb2-dev, CN-Celeb 1+2 y LibriSpeech 960h), con 12.193 hablantes y 1.708.852 utterances limpias, y sin solapamiento de hablantes con los conjuntos de evaluación oficiales. Eso lo convierte en una pieza útil para pipelines de diarización, control de acceso por voz o verificación biométrica en producción, con la salvedad de que el ecosistema de inferencia es JAX/Flax y no el stack estándar de Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Conformer (`large`) con pooling temporal atencional CATP |
| Parametros totales | 36.324.302 (inferencia: codificador + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; inferencia JAX con secuencias enmascaradas de hasta 3000 frames (30 s). Exportaciones TFLite con ventana fija de 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32 (safetensors/msgpack) e INT8 (TFLite); no se documentan GGUF ni otras |
| Idiomas soportados | no disponible (el modelo opera sobre características acústicas; el entrenamiento cubre corpus en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors, Flax Msgpack, TFLite (FP32 e INT8, solo codificador) |

## Arquitectura y entrenamiento

La arquitectura es un ERes2Conformer de tamaño `large`: un codificador convolucional-transformer con atención, sobre el que se aplica un pooling temporal atencional CATP que agrega la secuencia de frames en un único vector de 256 dimensiones. La cabeza de entrenamiento es Sub-Center ArcFace con K=3 subcentros, escala 32 y margen 0,32, y la verificación en inferencia se resuelve por similitud coseno. El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, sino el componente propio `flaxspeaker.AudioFrontend`: Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame y CMVN.

El entrenamiento se realizó durante 162.000 pasos de gradiente con batch de 512 utterances (warmup de 2.500 pasos, semilla 42, aproximadamente 46,74 épocas) sobre 12.193 hablantes y 1.708.852 utterances limpias, ampliadas con perturbación de velocidad de tres vías y augmentación MUSAN/RIR. Los crops de entrenamiento son de longitud variable `U(140, 200)` frames con máscara de validez exacta, y el `config.json` distribuido refleja esa configuración (`variable_length_training: true`). El autor documenta una verificación de reproducibilidad del loss en el paso 0 (11,7756 archivado frente a 11,7803 con el código actual y crops variables), así como una desviación estándar entre semillas de 0,08-0,41 % absoluto en EER agrupada de 1 utterance.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio.
- Verificación de hablante (1:1) mediante puntuación por similitud coseno.
- Identificación de hablante (1:N) por comparación contra un conjunto de embeddings de referencia.
- Reconocimiento robusto a variabilidad de canal y dominio, al haberse entrenado sobre cuatro corpus distintos (VoxCeleb, CN-Celeb, LibriSpeech).
- Manejo de utterances de hasta 30 segundos en inferencia JAX con enmascarado completo de la secuencia.
- Exportación TFLite FP32 e INT8 del codificador para despliegue en dispositivos con ventana fija de 1,8 s.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades de visión ni de audio general (no transcribe ni traduce).

## Casos de uso

- Verificación biométrica de acceso por voz: el modelo extrae el embedding de una frase de inscripción y lo compara por coseno con el de la frase de acceso, con un EER de referencia del 0,66 % en VoxCeleb1-O con inferencia JAX de secuencia completa.
- Diarización de reuniones y llamadas: generar embeddings por segmento y agrupar por similitud permite atribuir turnos de palabra a locutores en grabaciones de hasta 30 segundos por ventana.
- Autenticación en centros de atención telefónica: verificación 1:1 en tiempo casi real sobre el codificador exportado a TFLite INT8, con ventana de 1,8 s y fidelidad coseno media de 0,999355 frente a FP32.
- Detección de fraude y suplantación de identidad: comparar la voz del interlocutor con el embedding registrado del titular para marcar discrepancias en tiempo de llamada.
- Indexación y búsqueda de archivos de audio: almacenar embeddings de 256 dimensiones en un índice vectorial para recuperar fragmentos de un locutor concreto en archivos de archivo histórico.
- Control de calidad de corpus de voz: verificar que las grabaciones de un dataset pertenecen al hablante declarado y detectar mezclas o etiquetados erróneos antes del entrenamiento de otros modelos.
- Segmentación de contenido para subtitulado: preasignar locutores a transcripciones automáticas combinando el modelo con un ASR externo.

## Benchmarks y rendimiento

Datos publicados en `eval_results.json` y en la model card. La inferencia JAX de referencia usa secuencia completa enmascarada (hasta 3000 frames); las cifras TFLite corresponden a un recorte central de 180 frames (1,8 s).

| Benchmark | Metrica | Resultado |
|---|---|---|
| VoxCeleb1-O (37.611 trials) | EER 1-utt, JAX secuencia completa | 0,66 % |
| VoxCeleb1-O (37.611 trials) | EER 1-utt, TFLite FP32 (180 frames) | 2,11 % |
| VoxCeleb1-O (37.611 trials) | EER 1-utt, TFLite INT8 (180 frames) | 2,14 % |
| VoxCeleb1-O | Fidelidad coseno media FP32 vs INT8 | 0,999355 |
| VoxCeleb1-O | Fidelidad coseno TFLite vs JAX (entradas de 180 frames) | >= 0,9999 |
| Multi-dominio | EER 1-utt y 3-utt, minDCF, ROC-AUC con IC bootstrap al 95 % | publicados en `eval_results.json` (valores no incluidos en la informacion disponible) |
| Estabilidad entre semillas (0-2) | Desviacion estandar de EER agrupada 1-utt | 0,08-0,41 % absoluto |
| Intervalo bootstrap (8.000 trials) | Semiancho del IC al 95 % | ~0,8 % |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en los benchmarks habituales de habla (por ejemplo, tablas de EER en CN-Celeb o VoxCeleb1-E/H).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 36,3 M de parametros; en FP32 ocupa aproximadamente 145 MB de pesos y en INT8 unos 36 MB, por lo que la huella de memoria es muy reducida y el cuello de botella es el coste de activaciones y del frontend de audio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre es suficiente; una RTX 4090, A100 o H100 queda sobredimensionada para un solo flujo y solo tiene sentido para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4090) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `flaxspeaker >= 0.7.0` con `load_pretrained` sobre JAX/Flax; TFLite (`model_fp32.tflite` / `model_int8.tflite`) para edge y movil; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita. Como referencia, la ventana TFLite es de 180 frames (1,8 s de audio) y la inferencia JAX admite hasta 3000 frames (30 s) por secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/univ_full_eres2conformer_v2_large` | 36,3 M | Hasta 30 s en JAX; 1,8 s en TFLite | ERes2Conformer + CATP + Sub-Center ArcFace, JAX/Flax | Apache 2.0 | Hugging Face, PyPI, GitHub |
| `microsoft/wavlm-base-plus-sv` | ~94 M | Audio variable | WavLM + cabeza de verificación, PyTorch | MIT | Hugging Face |
| `speechbrain/spkrec-ecapa-voxceleb` | ~20 M | Audio variable | ECAPA-TDNN, PyTorch | Apache 2.0 | Hugging Face, SpeechBrain |
| `pyannote/embedding` | no disponible | Ventana fija | Red de embeddings para diarización, PyTorch | Condiciones de uso del autor | Hugging Face |

La comparación de rendimiento frente a estas alternativas no está disponible en la información proporcionada: la model card solo reporta métricas propias, sin tabla cruzada con otros modelos.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite tool calling ni razonamiento multi-paso.
- La inferencia de referencia requiere JAX/Flax y la librería `flaxspeaker >= 0.7.0`; no es compatible con el pipeline `AutoModel` de Transformers.
- Las exportaciones TFLite usan una ventana fija y sin máscara de 180 frames (1,8 s) con recorte central, lo que degrada el EER de 0,66 % a 2,11 % (FP32) y 2,14 % (INT8) en VoxCeleb1-O.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no un `AutoFeatureExtractor`; usar otro extractor de características invalida los resultados.
- El autor declara explícitamente que no es un producto oficialmente soportado por Google, pese a reproducir métodos publicados por investigadores de Google.
- Riesgo de sesgo por dominio y por idioma: el entrenamiento se apoya en VoxCeleb y CN-Celeb, con cobertura limitada de acentos, edades, condiciones de grabación y lenguas fuera de inglés y chino. No hay evaluación publicada de equidad entre grupos demográficos.
- Riesgo de falsos positivos en verificación biométrica: el EER no es cero y el intervalo de confianza bootstrap es de aproximadamente 0,8 % absoluto, por lo que no debe usarse como único factor de autenticación en entornos de alta seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se creó en noviembre de 2026; la validación por parte de terceros es prácticamente inexistente.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el cumplimiento normativo de biometría (RGPD, consentimiento explícito) recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_v2_large
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
