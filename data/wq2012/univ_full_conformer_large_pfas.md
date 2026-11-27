# wq2012/univ_full_conformer_large_pfas

## Resumen

`univ_full_conformer_large_pfas` es un modelo de reconocimiento de hablante (speaker verification y speaker recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax de varios algoritmos publicados de verificación de hablante (GE2E, Dr-Vectors, ATP y PFAS), entrenada sobre corpus abiertos y distribuida con licencia Apache 2.0. El modelo produce embeddings de hablante de 1280 dimensiones y una puntuación de verificación entre dos audios.

Arquitectura Conformer de tamano "large" con pooling temporal PFAS (Parameter-Free Attentive Scoring) y objetivo de entrenamiento Extended-Set Softmax en su variante de FlaxSpeaker. El checkpoint es un "flagship universal" entrenado sobre 12.193 hablantes y 464.557 utterances limpias procedentes de VoxCeleb1-dev, VoxCeleb2-dev, CN-Celeb 1+2 y LibriSpeech 960h, con aumentación MUSAN/RIR y perturbación de velocidad, y sin solapamiento de hablantes con los conjuntos de evaluación.

Es relevante para quien necesite un sistema de identificación biométrica por voz desplegable en JAX/Flax, con pesos en safetensors y msgpack, y con métricas de evaluación publicadas (EER, minDCF, ROC-AUC) sobre benchmarks estándar de la industria. Su tamano compacto (22,58 M de parámetros de inferencia) lo hace viable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (tamano "large"), con pooling temporal PFAS y cabecera de scoring PFAS-SN |
| Parametros totales | 22.582.159 (encoder + cabecera de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por utterance; crops de entrenamiento U(140, 200) frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con corpus multilingues: VoxCeleb, CN-Celeb, LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), Flax msgpack (`flax_model.msgpack`), `config.json`, `eval_results.json` |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuracion "large" que procesa caracteristicas de audio de 80 dimensiones Mel en escala logaritmica natural a 16 kHz, con VAD a nivel de frame y CMVN (implementado en `flaxspeaker.AudioFrontend`, no como `AutoFeatureExtractor` de Hugging Face). Sobre el encoder se aplica un pooling temporal PFAS y una cabecera de scoring PFAS-SN (extension de FlaxSpeaker: atencion de frames `shared_nonlinear` con ancla global ATP, 8 claves x (32 + 128)). La representacion de salida tiene 1280 dimensiones.

El entrenamiento se realizo durante 24.000 pasos de gradiente con batch de 256 utterances (warmup de 1.000 pasos, semilla 42, aproximadamente 13,23 epocas) sobre 12.193 hablantes y 464.557 utterances limpias, expandidas mediante perturbacion de velocidad a 3 vias y aumentacion MUSAN/RIR. El objetivo es un Extended-Set Softmax mezclado (variante FlaxSpeaker: 0,50 row-softmax + 0,50 extended-set con desplazamiento de logit -log N). Los crops de entrenamiento son de longitud variable U(140, 200) frames con mascara de validez exacta; el autor documenta que esta configuracion reproduce la huella de perdida del paso 0 archivada (2,4578) con una desviacion de 0,0002 frente a la sonda de referencia. No se menciona RLHF ni DPO, al tratarse de una tarea discriminativa de embeddings.

## Capacidades

- Extraccion de embeddings de hablante de 1280 dimensiones a partir de audio.
- Verificacion de hablante (1:1): puntuacion de similitud entre un audio de enrolamiento y uno de prueba.
- Reconocimiento de hablante (identificacion 1:N) mediante comparacion de embeddings.
- Normalizacion de puntuaciones AS-Norm y AS-Norm + QMF para mejorar la calibracion en evaluacion.
- Robustez multidominio: entrenado sobre corpus en ingles (VoxCeleb, LibriSpeech) y chino (CN-Celeb).
- Aumentacion de datos en entrenamiento (MUSAN, RIR, perturbacion de velocidad) para mejorar la generalizacion.
- API Python (`load_pretrained`, `extract_embedding`, `verify`) y script de inferencia por linea de comandos.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo; es exclusivamente un extractor de caracteristicas de voz.

## Casos de uso

- Verificacion biometrica de acceso: el modelo compara un audio de enrolamiento con uno de prueba y devuelve una puntuacion; sus 1280 dimensiones de embedding permiten umbrales calibrados con AS-Norm para reducir falsos positivos en control de acceso.
- Autenticacion por voz en aplicaciones moviles o de escritorio: al ser un modelo de 22,58 M de parametros, puede ejecutarse en CPU o GPU de gama baja, lo que facilita el despliegue local sin enviar audio a la nube.
- Identificacion de hablante en grabaciones largas: el pooling PFAS y el frontend con VAD permiten procesar utterances y agregar embeddings para reconocer participantes en reuniones o llamadas.
- Enrolamiento y diarizacion ligera: los embeddings por segmento se pueden agrupar por similitud para separar voces en un audio multi-hablante, usando el modelo como extractor base.
- Investigacion en reconocimiento de hablante: al ser una reimplementacion abierta en JAX/Flax de GE2E, Dr-Vectors, ATP y PFAS, sirve como referencia reproducible para experimentos academicos y comparativas de metodos de scoring.
- Deteccion de suplantacion o fraude en call centers: la puntuacion de verificacion puede integrarse en un pipeline de antifraude para comprobar que la voz del cliente coincide con la registrada.
- Indexacion y busqueda por voz en archivos de audio: los embeddings permiten construir un indice vectorial para recuperar fragmentos de un hablante concreto en una coleccion de grabaciones.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion zero-shot con EER bruto, EER con AS-Norm, EER con AS-Norm + QMF, minDCF@0,01 y ROC-AUC sobre benchmarks de verificacion de hablante. La informacion disponible se corta en la fila de VoxCeleb1-O (`veri_test2`) y no incluye los valores numericos de esa fila ni de las siguientes, por lo que no es posible reproducir la tabla completa sin inventar datos.

| Benchmark | Trials | EER bruto (%) | EER AS-Norm (%) | EER AS-Norm + QMF (%) | minDCF@0,01 | ROC-AUC |
|---|---|---|---|---|---|---|
| VoxCeleb1-O (`veri_test2`) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor documenta ademas que la desviacion estandar entre semillas del EER agrupado 1-utt es de 0,08-0,41 % absoluto, y que el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semi-amplitud de aproximadamente 0,8 %. Los resultados completos estan en `eval_results.json` dentro del repositorio.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 22,58 M de parametros, los pesos en float32 ocupan aproximadamente 90 MB; en bfloat16, unos 45 MB. La VRAM real depende del backend y del tamano de lote de audio.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entreno en TPU con bfloat16. Para inferencia, una RTX 4090, A100 o H100 estan sobredimensionadas para un solo utterance, pero utiles para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia de un solo audio.
- Opciones de despliegue: el paquete oficial es `flaxspeaker >= 0.8.0` (JAX/Flax) con API Python y script `scripts/inference.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint frente a alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A continuacion se comparan caracteristicas estructurales con modelos de la misma categoria (reconocimiento de hablante) ampliamente conocidos, usando unicamente datos publicos generales:

| Modelo | Parametros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|
| `wq2012/univ_full_conformer_large_pfas` | 22,58 M (inferencia) | utterance con crops U(140, 200) frames | Apache 2.0 | safetensors, msgpack |
| ECAPA-TDNN (SpeechBrain) | no disponible en esta ficha | utterance | Apache 2.0 | safetensors, PyTorch |
| WavLM-based speaker models | no disponible en esta ficha | utterance | MIT/Apache segun checkpoint | PyTorch |
| ResNet-based speaker models (VoxCeleb) | no disponible en esta ficha | utterance | variable | PyTorch |

La comparativa de EER, minDCF y ROC-AUC frente a estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un producto oficial de Google; el autor lo declara explicitamente. Es una reimplementacion desde cero basada solo en papers publicados.
- El modelo esta especializado en voces de los corpus de entrenamiento (VoxCeleb, CN-Celeb, LibriSpeech); el rendimiento en otros dominios (telefonia, audio ruidoso, acentos no representados) puede degradarse y no se documenta.
- Riesgo de sesgo demografico: los corpus de entrenamiento no estan balanceados por genero, edad, acento ni condicion de grabacion; no se publican analisis de equidad.
- No se documentan tecnicas de mitigacion de alucinacion ni de robustez ante ataques de suplantacion (spoofing, deepfakes de voz); no debe usarse como unico factor de autenticacion en entornos de alta seguridad.
- La longitud de contexto y el comportamiento con audios muy largos no estan documentados; el entrenamiento usa crops de 140 a 200 frames.
- Los idiomas soportados no estan declarados formalmente, aunque el entrenamiento incluye corpus en ingles y chino.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad sobre el uso biometrico recae en el integrador.
- La informacion de benchmarks en la model card esta truncada en la fuente disponible; conviene consultar `eval_results.json` en el repositorio para los valores completos.
- Requiere `flaxspeaker >= 0.8.0`; no es compatible con `transformers` de Hugging Face de forma nativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_full_conformer_large_pfas
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
