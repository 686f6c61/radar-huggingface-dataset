# wq2012/cn_conformer_small_ge2e

## Resumen

`cn_conformer_small_ge2e` es un modelo de extraccion de embeddings de hablante (speaker embeddings) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reimplementacion en JAX/Flax de algoritmos clasicos de reconocimiento de hablante a partir de sus papers publicados. El modelo combina un backbone Conformer de tamano "small" con pooling temporal atencional (ATP) y un objetivo de entrenamiento GE2E softmax, produciendo representaciones de 192 dimensiones que permiten verificar si dos fragmentos de audio pertenecen al mismo hablante mediante similitud coseno.

El checkpoint tiene 2.029.894 parametros de inferencia (encoder mas cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y esta entrenado exclusivamente sobre CN-Celeb2 (119 hablantes, 2.909 utterances), lo que lo situa como un banco de pruebas de convergencia a pequena escala, no como un modelo de produccion comparable con sistemas entrenados sobre VoxCeleb2-dev. La licencia Apache 2.0 y el formato safetensors lo hacen facilmente reutilizable, pero sus tasas de error (EER de ~21,93% en 1-utt y ~17,50% en 3-utt sobre CN-Celeb2) reflejan la diversidad limitada de hablantes del corpus de entrenamiento.

Es relevante ahora por tres motivos: demuestra una implementacion reproducible y abierta del pipeline GE2E+Conformer+ATP en JAX, expone metricas con intervalos de confianza bootstrap y controles de semilla (algo poco habitual en checkpoints pequenos), y sirve como referencia controlada para comparaciones relativas dentro del benchmark FlaxSpeaker. No es un modelo puntero ni pretende serlo: es una pieza de infraestructura de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) + pooling temporal atencional ATP |
| Parametros totales | 2.029.894 (encoder + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio; crops de entrenamiento U(90, 180) frames) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y msgpack Flax) |
| Idiomas soportados | no disponible (entrenado solo con CN-Celeb2, corpus en mandarin) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding | 192 |
| Frontend de audio | Mel log-natural de 80 dimensiones a 16 kHz + VAD por energia + CMVN |
| Objetivo de entrenamiento | GE2E softmax (Wan et al. 2018, Eq. 6, centroides leave-one-out exactos) |
| Scorer de verificacion | Similitud coseno |
| Libreria | `flaxspeaker >= 0.5.0` |

## Arquitectura y entrenamiento

El backbone es un Conformer (transformer con convoluciones integradas) en configuracion `small`, seguido de un cabezal de pooling temporal atencional (ATP) tomado de un paper de identificacion de idioma, y de una cabeza GE2E softmax que calcula centroides leave-one-out exactos por hablante durante el entrenamiento. La verificacion en inferencia se realiza por similitud coseno sobre embeddings de 192 dimensiones. El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, sino un componente propio de `flaxspeaker`: Mel de 80 dimensiones en escala logaritmica natural a 16 kHz, VAD por energia a nivel de frame y normalizacion CMVN.

El entrenamiento se realizo sobre CN-Celeb2 unicamente (119 hablantes, 2.909 utterances), con 1.600 pasos de gradiente y mini-batches de 32 utterances (8 hablantes x 4 utterances), lo que equivale a ~17,60 epocas, semilla 42 y warmup de 160 pasos, en una estacion de trabajo CPU. Se usaron crops de longitud variable U(90, 180) frames con mascara de validez exacta; el autor documenta la huella de perdida en el paso 0 para verificar la reproducibilidad. La EER in-domain sobre CN-Celeb2 evoluciono de 23,50% (1-utt) / 19,50% (3-utt) en el paso 400 a 21,93% / 17,50% en el paso 1600, con un margen de seguridad de +2 epocas. La desviacion tipica entre semillas 0-2 es de 0,08-0,41% absoluto y el semi-ancho del intervalo bootstrap al 95% con 8.000 ensayos es de ~0,8%.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz.
- Verificacion de hablante (misma persona / distinta persona) mediante similitud coseno.
- Identificacion de hablante en modo cerrado sobre el conjunto de hablantes vistos en entrenamiento.
- Puntuacion de pares de utterances con normalizacion de scores (Dr-Vector / PFAS disponibles como cabezas).
- Evaluacion con metricas EER, minDCF y ROC-AUC, con intervalos de confianza bootstrap.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidad multilingue no disponible: entrenado solo con CN-Celeb2 (mandarin).

## Casos de uso

- Verificacion de hablante en sistemas de control de acceso: el modelo genera embeddings de 192 dimensiones y compara por coseno, adecuado para autenticacion de locutor en escenarios de pocos hablantes registrados.
- Diarizacion de reuniones a pequena escala: embeddings por segmento permiten agrupar intervenciones del mismo hablante con clustering coseno, util en grabaciones cortas y con ruido moderado.
- Deteccion de suplantacion en call centers: comparar la voz del cliente con la registrada en llamadas previas para marcar discrepancias, con la cautela de la EER alta del checkpoint.
- Benchmarking de pipelines de reconocimiento de hablante: el checkpoint sirve como referencia controlada dentro de FlaxSpeaker para comparar variantes de arquitectura, pooling y funcion de perdida bajo el mismo protocolo.
- Reproduccion de investigacion en JAX/Flax: util para validar implementaciones de GE2E, ATP y PFAS sin depender de codigo propietario, gracias a la huella de perdida del paso 0 y a los resultados de control por semilla.
- Prototipado de embeddings de audio para busqueda por similitud: indexar utterances de un corpus pequeno y recuperar fragmentos del mismo hablante por vecino mas cercano coseno.
- Validacion de frontends de audio: probar variantes de VAD, CMVN y Mel en un pipeline completo con metricas EER reproducibles.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre CN-Celeb2 (in-domain) y subconjunto de 10 hablantes de VoxCeleb1-O. No se dispone de comparaciones con modelos de referencia en la informacion proporcionada.

| Metrica | Paso 400 | Paso 1400 | Paso 1600 (final) |
|---|---|---|---|
| EER CN-Celeb2 1-utt | 23,50% | 22,77% | 21,93% |
| EER CN-Celeb2 3-utt | 19,50% | 19,00% | 17,50% |
| EER pooled universal 1-utt | no disponible | no disponible | 25,68% |
| EER pooled universal 3-utt | no disponible | no disponible | 21,23% |

Datos de reproducibilidad: desviacion tipica entre semillas 0-2 de 0,08-0,41% absoluto en EER pooled 1-utt; semi-ancho del IC bootstrap al 95% (8.000 ensayos) de ~0,8%. Huella de perdida en paso 0: 2,1592 con crops U(90, 180).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en safetensors (2,03 M parametros); el consumo real lo domina el frontend de audio y los buffers de activacion, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo esta pensado para CPU y funciona en estaciones de trabajo sin GPU.
- Cabe en GPU consumer: si, en cualquier RTX (2060 o superior), GTX 1660, e incluso en iGPU y CPU.
- Opciones de despliegue: libreria `flaxspeaker` (JAX/Flax); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos generativos de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo de 1.600 pasos se ejecuto en CPU, lo que sugiere inferencia por utterance en el orden de milisegundos a decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cn_conformer_small_ge2e` (este) | 2,03 M | audio 16 kHz, crops 90-180 frames | 21,93% (1-utt) / 17,50% (3-utt) en CN-Celeb2 | Apache 2.0 | Hugging Face |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (tipico) | audio 16 kHz | ~0,9% en VoxCeleb1-O completo | no disponible | referencia bibliografica |
| EfficientTDNN (Wang et al., 2022) | < 1 M | audio 16 kHz | ~2% en VoxCeleb1-O | no disponible | referencia bibliografica |

La comparacion es orientativa: los sistemas ECAPA-TDNN y EfficientTDNN se entrenan sobre VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances), mientras que este checkpoint usa 119 hablantes. Las cifras no son directamente comparables.

## Limitaciones y advertencias

- EER alta (21,93% en 1-utt, 17,50% en 3-utt) incluso in-domain; no apto para autenticacion de seguridad en produccion sin umbrales muy conservadores y factores adicionales.
- Entrenado con solo 119 hablantes y 2.909 utterances; la diversidad de hablantes limita la generalizacion fuera de CN-Celeb2.
- Corpus de entrenamiento en mandarin; rendimiento en otras lenguas y acentos no documentado.
- Sesgos de hablante, genero, edad y canal heredados del corpus CN-Celeb2, no analizados en la model card.
- Riesgo de falsos positivos en voces similares (familiares, imitadores) y en audio ruidoso o con reverberacion.
- No es un producto oficial de Google; es una reimplementacion comunitaria basada en papers, sin codigo ni datos propietarios.
- Licencia Apache 2.0 permite uso comercial, pero sin garantias; el autor declara explicitamente que no es un modelo state-of-the-art.
- El frontend de audio es propio de `flaxspeaker` y no un `AutoFeatureExtractor`; integrarlo con otros pipelines requiere adaptar la extraccion de caracteristicas.
- La verificacion por coseno requiere normalizacion de scores y calibracion de umbrales por dominio; no se proporcionan umbrales recomendados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/cn_conformer_small_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
