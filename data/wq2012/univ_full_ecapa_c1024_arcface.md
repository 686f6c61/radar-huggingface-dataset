# wq2012/univ_full_ecapa_c1024_arcface

## Resumen

`univ_full_ecapa_c1024_arcface` es un modelo de verificación e identificación de hablante (speaker verification / speaker recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos clásicos de reconocimiento de locutor descritos en la literatura pública (GE2E, Dr-Vectors, ATP y PFAS). No es un modelo generativo: su función es extraer embeddings de audio de 256 dimensiones que representan la identidad vocal de un hablante, de modo que la similitud coseno entre dos embeddings permite decidir si dos fragmentos de audio pertenecen a la misma persona.

El modelo se apoya en una arquitectura ECAPA-TDNN de variante `large`, con pooling temporal `asp` (attentive statistics pooling) y una función de pérdida ArcFace para el entrenamiento. Cuenta con 14.856.832 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y produce representaciones de 256 dimensiones. El frontend de audio es propio de la librería: Mel natural-log de 80 dimensiones a 16 kHz, VAD por energía a nivel de frame y CMVN, y no es un `AutoFeatureExtractor` estándar de Hugging Face.

Su relevancia radica en que es un checkpoint "flagship" entrenado sobre un corpus universal multi-dominio: 12.193 hablantes y 464.557 enunciados limpios procedentes de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, con aumento de datos vía perturbación de velocidad y MUSAN/RIR, y sin solapamiento de hablantes con los conjuntos de evaluación oficiales. Se distribuye bajo licencia Apache 2.0, con pesos en SafeTensors y exportaciones TFLite FP32/INT8 del encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (variante `large`) con pooling temporal `asp` |
| Parametros totales | 14.856.832 (encoder + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (audio; ventana de entrenamiento U(140, 200) frames; inferencia JAX hasta 3000 frames / 30 s; TFLite fijo a 180 frames / 1,8 s) |
| Tipos de cuantizacion | FP32 (safetensors, msgpack, TFLite) e INT8 (TFLite) |
| Idiomas soportados | no disponible (multilingue por corpus: ingles, chino y otros presentes en VoxCeleb/CN-Celeb/LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |
| Dimension de embedding | 256 |
| Funcion de perdida | ArcFace |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel natural-log 80 dim @ 16 kHz + VAD por energia + CMVN |
| Pasos de entrenamiento | 81.000 pasos, batch 512, seed 42 (~85,97 epocas) |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN de configuracion `large`, una red convolucional con bloques SE-Res2Net y agregacion estadistica atenta (ASP) que transforma secuencias de features Mel en un vector de embedding de 256 dimensiones. Sobre ese embedding se aplica una cabeza de clasificacion con perdida ArcFace durante el entrenamiento, que impone margenes angulares entre identidades y mejora la discriminabilidad de las representaciones. En inferencia, la verificacion se realiza con similitud coseno entre embeddings, y la cabeza de scoring incluye variantes GE2E (`w,b`), Dr-Vector y PFAS.

El entrenamiento se llevo a cabo sobre un pool universal multi-corpus: VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, sumando 12.193 hablantes base y 464.557 enunciados limpios, expandidos con perturbacion de velocidad de tres vias y aumento con MUSAN/RIR. Se realizaron 81.000 pasos de gradiente con warmup de 2.500 pasos y batch de 512 enunciados (seed 42). Los crops de entrenamiento fueron de longitud variable U(140, 200) frames con mascara de validez exacta; el autor documenta que la huella de perdida en el paso 0 con esta configuracion (12,4881) coincide con la archivada (12,4876) dentro de 0,0005, mientras que la variante de crops fijos se aleja mas de 5 veces. La evaluacion de los pesos publicados con el codigo actual reproduce las metricas archivadas en `eval_results.json`. La desviacion estandar entre semillas del EER agrupado a 1 utterance es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de aproximadamente 0,8 %.

## Capacidades

- Extraccion de embeddings de hablante de 256 dimensiones a partir de audio.
- Verificacion de hablante (1:1): puntuacion de similitud coseno entre dos utterances.
- Identificacion de hablante (1:N) mediante comparacion contra una galeria de embeddings.
- Reconocimiento robusto a variabilidad de canal y dominio gracias al entrenamiento multi-corpus (VoxCeleb, CN-Celeb, LibriSpeech) y al aumento MUSAN/RIR.
- Procesamiento de audio de hasta 30 s en inferencia JAX con mascara de secuencia completa.
- Exportacion TFLite FP32 e INT8 del encoder para despliegue en entornos con restricciones de recursos.
- Soporte multilingue implicito por la composicion del corpus (no se documenta una lista cerrada de idiomas).
- No soporta tool calling, agentes, vision ni generacion de texto: es un modelo de feature extraction puro.

## Casos de uso

- Verificacion biometrica de voz en autenticacion: el modelo extrae embeddings de enroll y test y devuelve una puntuacion coseno que se compara con un umbral calibrado; adecuado por su EER bajo en dominios diversos y su licencia permisiva.
- Identificacion de hablante en grabaciones largas: con inferencia JAX de hasta 30 s por ventana y agregacion de embeddings, permite construir galerias y resolver consultas 1:N en archivos de reuniones o llamadas.
- Diarizacion de hablantes: los embeddings de 256 dimensiones sirven como features para clustering (por ejemplo, spectral clustering) en pipelines de transcripcion con separacion de interlocutores.
- Control de acceso y antifraude en call centers: verificacion de que el cliente que llama coincide con el titular registrado, con la ventaja de que el modelo funciona sobre audio de telefonia y domina varios corpus e idiomas.
- Indexacion y busqueda de archivos de audio: generar embeddings para cada segmento y almacenarlos en un indice vectorial para busqueda por voz o agrupacion por locutor en archivos historicos.
- Despliegue en dispositivos edge: las exportaciones TFLite INT8 (ventana fija de 180 frames) permiten ejecutar el encoder en movil o embebido con un EER de 5,83 % en VoxCeleb1-O, suficiente para aplicaciones de verificacion en dispositivo.
- Investigacion en reconocimiento de locutor: al ser una reimplementacion JAX/Flax reproducible con pesos abiertos, sirve como baseline para experimentos con ECAPA-TDNN, ArcFace y pooling atento.

## Benchmarks y rendimiento

El autor publica metricas en `eval_results.json` y en la model card. Los valores principales disponibles en la informacion proporcionada son:

| Metrica | Valor |
|---|---|
| EER 1-utt, VoxCeleb1-O oficial (37.611 trials, JAX secuencia completa) | 2,54 % |
| EER 1-utt, VoxCeleb1-O con TFLite FP32 (crop central 180 frames) | 5,84 % |
| EER 1-utt, VoxCeleb1-O con TFLite INT8 (crop central 180 frames) | 5,83 % |
| Similitud coseno media FP32 vs INT8 (TFLite) | 0,999187 |
| Fidelidad coseno TFLite vs JAX (>=) | 0,9999 |
| Perdida en paso 0 (seed publicado) | 12,4876 (archivada) / 12,4881 (codigo actual, variable-crop) |

No se han publicado en la informacion disponible resultados detallados de EER 3-utt, minDCF ni ROC-AUC por dominio, aunque el autor indica que estan incluidos en `eval_results.json` junto con los intervalos bootstrap al 95 % y el subconjunto de 10 hablantes de VoxCeleb1-O.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 14,86 M parametros; en FP32 ocupa aproximadamente 60 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes en servidor, A100 o H100 aportan throughput, pero no son necesarias por tamano de modelo.
- Cabe en GPU consumer: si, en cualquier RTX o incluso en iGPU; el cuello de botella es el frontend de audio y el preprocesado, no el modelo.
- Opciones de despliegue: libreria `flaxspeaker` (>= 0.7.0) sobre JAX/Flax; exportaciones TFLite FP32/INT8 para edge; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada. La ventana TFLite fija es de 180 frames (1,8 s), lo que acota la latencia por utterance en ese modo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/univ_full_ecapa_c1024_arcface` | 14,86 M | hasta 30 s (JAX); 1,8 s (TFLite) | ECAPA-TDNN + ArcFace, JAX/Flax | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN original (SpeechBrain) | ~20 M (tipico) | variable | ECAPA-TDNN + AAM-softmax, PyTorch | Apache 2.0 | Hugging Face / GitHub |
| WavLM / XLS-R (fine-tuned para speaker) | 90 M - 300 M+ | variable | Transformer auto-supervisado | MIT / varias | Hugging Face |
| ResNet-based speaker embeddings (p. ej. WeSpeaker) | variable (~6-30 M) | variable | ResNet + ArcFace/AAM | Apache 2.0 | GitHub / Hugging Face |

La comparativa se ofrece a nivel cualitativo: no se dispone en la informacion proporcionada de resultados de benchmarks de los modelos alternativos medidos en las mismas condiciones, por lo que no se incluyen cifras comparativas de EER.

## Limitaciones y advertencias

- No es un producto oficial de Google; el autor lo declara explicitamente. Es una reimplementacion independiente basada solo en papers publicados.
- Riesgo de degradacion fuera de dominio: aunque el entrenamiento es multi-corpus, el rendimiento en condiciones acusticas muy distintas (ruido extremo, telefonia de baja calidad, reverberacion fuerte) no esta cuantificado en la informacion disponible.
- El EER con TFLite (5,84 % FP32 / 5,83 % INT8) es sustancialmente peor que con JAX de secuencia completa (2,54 %) debido al crop fijo de 180 frames; para produccion con audio largo conviene usar la ruta JAX.
- La lista de idiomas soportados no esta documentada; el soporte multilingue es inferido de la composicion del corpus, no garantizado.
- Riesgo de sesgo demografico y de canal inherente a los corpus de entrenamiento (VoxCeleb, CN-Celeb, LibriSpeech); no se documentan analisis de equidad por genero, edad o acento.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los corpus de entrenamiento subyacentes si redistribuye derivados.
- El frontend de audio es propio de `flaxspeaker` y no es compatible directamente con `AutoFeatureExtractor` de Hugging Face; la integracion requiere la libreria del autor.
- El intervalo de confianza bootstrap al 95 % del EER es de aproximadamente 0,8 % de semianchura, por lo que diferencias menores entre checkpoints deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_full_ecapa_c1024_arcface
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
