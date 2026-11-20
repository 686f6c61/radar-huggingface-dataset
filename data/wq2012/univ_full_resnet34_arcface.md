# wq2012/univ_full_resnet34_arcface

## Resumen

`univ_full_resnet34_arcface` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: recibe audio y devuelve un vector de 256 dimensiones que representa la identidad vocal del hablante, de modo que dos fragmentos de audio pueden compararse mediante similitud coseno para decidir si pertenecen a la misma persona. Resuelve, por tanto, tareas de verificación biométrica por voz, diarización y búsqueda de locutor.

Técnicamente es una red ResNet de backbone `large` con pooling temporal de tipo `stats` (estadísticas de primer y segundo orden) y una cabeza de clasificación entrenada con pérdida ArcFace, con scoring final por similitud coseno. El modelo tiene 24.589.488 parámetros totales según los pesos en safetensors (24.551.472 en el encoder más la cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y produce embeddings de 256 dimensiones. Se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en que es una reimplementación íntegra en JAX/Flax, escrita únicamente a partir de papers publicados y entrenada sobre corpus abiertos (VoxCeleb1/2, CN-Celeb 1/2 y LibriSpeech 960h), lo que la convierte en una alternativa reproducible y con licencia permisiva frente a los checkpoints propietarios habituales en verificación de locutor. Incluye además exportaciones TFLite en FP32 e INT8 para despliegue en dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet (`large`) con pooling temporal `stats` y cabeza ArcFace; scoring por similitud coseno |
| Parametros totales | 24.589.488 (safetensors); 24.551.472 en encoder + scoring head, excluyendo el clasificador de entrenamiento |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de hasta 3000 frames (30 s) en inferencia JAX con máscara; TFLite con ventana fija de 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32 e INT8 (exportaciones TFLite); pesos nativos en safetensors y msgpack |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado con corpus multilingües de facto: VoxCeleb, CN-Celeb, LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |
| Dimension de embedding | 256 |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD por energía a nivel de frame y CMVN |
| Libreria | flaxspeaker >= 0.5.0 |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional de tipo ResNet (`large`) que opera sobre representaciones Mel de 80 dimensiones a 16 kHz, con un frontend propio de `flaxspeaker.AudioFrontend` que aplica VAD por energía y normalización CMVN (no es un `AutoFeatureExtractor` de Hugging Face). Sobre las activaciones del backbone se aplica un pooling temporal de tipo `stats` (estadísticas agregadas en el tiempo) que colapsa la secuencia en un vector de 256 dimensiones. La cabeza de entrenamiento usa pérdida ArcFace, y la verificación final se realiza por similitud coseno entre embeddings. El diseño sigue las ideas de GE2E, Dr-Vectors, ATP y PFAS, todos ellos publicados en los papers referenciados.

El entrenamiento se realizó sobre un pool universal multi-corpus de 12.193 locutores y 464.557 enunciados limpios, procedentes de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, con solapamiento nulo de locutores respecto a los conjuntos oficiales de evaluación. Se aplicó aumento de datos mediante perturbación de velocidad en tres vías y ruidos MUSAN/RIR. El presupuesto fue de 81.000 pasos de gradiente con batch de 512 enunciados (unas 89,27 épocas), warmup de 2.500 pasos y semilla 42, usando recortes de longitud variable U(140, 200) frames con máscara de validez exacta. La reproducibilidad está documentada con huellas de pérdida en el paso 0 y con la desviación estándar entre semillas del EER agrupado (0,08-0,41 % absoluto) frente a un intervalo de confianza bootstrap del 95 % de aproximadamente 0,8 % en 8.000 ensayos.

## Capacidades

- Extracción de embeddings de locutor de 256 dimensiones a partir de audio.
- Verificación de locutor uno a uno (misma persona o no) mediante similitud coseno.
- Reconocimiento e identificación de locutor contra una galería de embeddings.
- Manejo de audio de hasta 30 segundos en inferencia JAX con máscara completa de secuencia.
- Exportación TFLite FP32 e INT8 para inferencia en dispositivos con ventana fija de 1,8 s.
- Robustez multi-dominio: entrenado con voz de YouTube (VoxCeleb), voz en mandarín (CN-Celeb) y lectura en inglés (LibriSpeech).
- Aumento de datos implícito en entrenamiento (velocidad, ruido MUSAN, reverberación RIR) que mejora la generalización a condiciones acústicas diversas.
- No soporta tool calling, agentes, generación de texto, visión ni audio-a-texto: es exclusivamente un extractor de características de audio.

## Casos de uso

- Verificación biométrica por voz en autenticación de usuarios: el modelo compara el embedding de una frase de inscripción con el de una frase de prueba y devuelve una puntuación coseno, adecuada para umbrales calibrados con EER y minDCF.
- Diarización de reuniones y llamadas: extrayendo embeddings por segmentos y agrupándolos, se puede atribuir cada intervención a un locutor, aprovechando la ventana de hasta 30 s para segmentos largos.
- Búsqueda de locutor en archivos de audio: indexar embeddings de 256 dimensiones en una base vectorial permite recuperar fragmentos del mismo hablante en grandes volúmenes de grabaciones.
- Control de calidad de datasets de voz: detectar locutores duplicados o inconsistencias en corpus de entrenamiento comparando embeddings entre muestras.
- Despliegue en dispositivos embebidos: las exportaciones TFLite FP32 e INT8 con ventana fija de 180 frames permiten ejecutar la verificación en móviles o hardware de bajo consumo, con una fidelidad coseno frente a JAX superior a 0,9999.
- Investigación reproducible en verificación de locutor: al ser una reimplementación JAX/Flax con licencia Apache 2.0 y corpus abiertos, sirve como baseline auditable para comparar nuevas pérdidas, pooling o arquitecturas.
- Antifraude y detección de suplantación en call centers: combinado con un detector de voz sintética, el embedding de locutor aporta la señal de identidad para decidir si la voz coincide con el cliente registrado.

## Benchmarks y rendimiento

Los datos publicados en la información disponible son parciales: la model card incluye tablas de evaluación con EER, minDCF y ROC-AUC, pero en el extracto proporcionado solo aparece el encabezado de la tabla de benchmarks zero-shot y los valores de EER para las exportaciones TFLite.

| Benchmark | Trials | EER (%) |
|---|---|---|
| VoxCeleb1-O oficial, JAX con máscara de secuencia completa | 37.611 | 1,81 |
| VoxCeleb1-O oficial, TFLite FP32 (recorte central de 180 frames) | 37.611 | 4,26 |
| VoxCeleb1-O oficial, TFLite INT8 (recorte central de 180 frames) | 37.611 | 4,29 |

Fidelidad coseno media entre TFLite FP32 e INT8: 0,999603. No se han publicado en la información disponible los valores de EER, minDCF ni ROC-AUC para el resto de benchmarks multi-dominio (CN-Celeb, LibriSpeech, VoxCeleb1-E/H), aunque la model card indica que están en `eval_results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene unos 24,6 M de parámetros, por lo que en FP32 ocupa aproximadamente 100 MB de pesos; en INT8, unos 25 MB. La VRAM real necesaria es mínima y el cuello de botella es el audio de entrada, no el modelo.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, A100 o H100 sobredimensionan el modelo y solo aportan ventaja en procesamiento por lotes a gran escala. Para uso individual basta una GPU de gama media o incluso CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre; también en CPU para inferencia puntual.
- Opciones de despliegue: `flaxspeaker` (API Python y script `scripts/inference.py`), exportaciones TFLite mediante `jax2tf` para móvil y edge, y JAX nativo para servidores. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La ventana TFLite de 180 frames (1,8 s) sugiere inferencia de baja latencia en dispositivos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/univ_full_resnet34_arcface` | 24,6 M | hasta 30 s (JAX); 1,8 s (TFLite) | ResNet + stats pooling + ArcFace, JAX/Flax | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (variantes abiertas, p. ej. SpeechBrain) | ~20-22 M (típico) | variable, habitualmente 3-10 s | TDNN con atención y estadísticas | variable según checkpoint (a menudo Apache 2.0 o MIT) | Hugging Face, SpeechBrain |
| WavLM / XLSR-based speaker embeddings | 90-300 M | variable | Transformers auto-supervisados con cabeza de locutor | variable según checkpoint | Hugging Face |

La comparación cuantitativa de EER frente a ECAPA-TDNN o WavLM no está disponible en la información proporcionada; solo se dispone del EER de 1,81 % en VoxCeleb1-O con inferencia JAX completa para este modelo. La principal ventaja diferencial es la combinación de licencia Apache 2.0, reimplementación reproducible en JAX/Flax y exportaciones TFLite INT8 verificadas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; usarlo fuera de tareas de audio no tiene sentido.
- Riesgo de sesgo por composición del corpus: entrenado principalmente con VoxCeleb (YouTube), CN-Celeb (mandarín) y LibriSpeech (lectura en inglés); el rendimiento puede degradarse en acentos, edades o condiciones acústicas poco representadas.
- El EER de las exportaciones TFLite (4,26-4,29 %) es sustancialmente peor que el de la inferencia JAX completa (1,81 %) por el recorte fijo de 180 frames; no debe usarse TFLite cuando se necesite la máxima precisión.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no es un `AutoFeatureExtractor` de Hugging Face; integrarlo en pipelines estándar requiere usar la librería `flaxspeaker >= 0.5.0`.
- La model card advierte explícitamente de que no es un producto oficialmente soportado por Google, pese a inspirarse en papers de esa casa.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de falsos positivos y falsos negativos en la verificación; los umbrales deben calibrarse con EER y minDCF para cada dominio.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.
- El intervalo de confianza bootstrap del 95 % en torno al EER es de aproximadamente 0,8 % absoluto, por lo que diferencias menores entre modelos pueden no ser significativas.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_resnet34_arcface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
