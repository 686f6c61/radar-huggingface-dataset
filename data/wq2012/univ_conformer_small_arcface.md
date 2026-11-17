# wq2012/univ_conformer_small_arcface

## Resumen

`univ_conformer_small_arcface` es un modelo de extracción de embeddings de locutor (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de locutor publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS). El modelo convierte fragmentos de audio en vectores de 192 dimensiones que permiten verificar si dos grabaciones corresponden al mismo hablante mediante similitud coseno. No es un producto oficial de Google: el autor lo declara explícitamente como una reimplementación basada únicamente en papers públicos, sin código ni datos propietarios.

La arquitectura combina un backbone Conformer en configuración "small" con pooling temporal atencional (ATP) y un objetivo de entrenamiento ArcFace con margen angular. Con solo 2.029.892 parámetros de inferencia, es un modelo extremadamente ligero pensado para comparaciones relativas controladas dentro del benchmark de FlaxSpeaker, no para competir con sistemas industriales entrenados sobre VoxCeleb2-dev (5.994 locutores, ~1,1M de utterances). El checkpoint se entrenó hasta convergencia sobre un corpus multi-dominio de 381 locutores y 9.447 utterances (LibriSpeech, CN-Celeb2 y VoxCeleb1), con 4.600 pasos y ~31,16 épocas.

Es relevante ahora porque ofrece un punto de referencia reproducible, con semilla fija y métricas publicadas con intervalos de confianza bootstrap, para quien quiera evaluar o reproducir pipelines de verificación de locutor en JAX/Flax sin depender de infraestructura propietaria. Su licencia Apache 2.0 y su tamaño reducido lo hacen adecuado para experimentación en CPU y para integrarse en prototipos de autenticación biométrica por voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atencional (ATP) |
| Parametros totales | 2.029.892 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada por recortes variables de 90-180 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con LibriSpeech, CN-Celeb2 y VoxCeleb1, multi-dominio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding de salida | 192 |
| Objetivo de entrenamiento | ArcFace con margen angular |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones a 16 kHz + VAD por energia a nivel de frame + CMVN (`flaxspeaker.AudioFrontend`, no es un `AutoFeatureExtractor` de Hugging Face) |
| Pasos de entrenamiento | 4.600 pasos x 64 utterances (~31,16 epocas), semilla 42 |
| Datos de entrenamiento | LibriSpeech + CN-Celeb2 + VoxCeleb1 (381 locutores, 9.447 utterances) |
| Libreria | flaxspeaker |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de tamano "small", una arquitectura que combina convoluciones y auto-atencion para modelar secuencias de audio, seguido de una cabeza de pooling temporal atencional (ATP) que agrega la informacion a lo largo del tiempo en un unico vector de 192 dimensiones. Sobre ese embedding se aplica un objetivo ArcFace, que introduce un margen angular en el espacio de similitud coseno para mejorar la separabilidad entre locutores. La verificacion final se realiza comparando dos embeddings con similitud coseno.

El entrenamiento se ejecuto en una estacion de trabajo CPU con semilla 42, durante 4.600 pasos de gradiente con mini-batches de 64 utterances (8 locutores x 4 utterances), lo que equivale a unas 31,16 epocas sobre el corpus de 381 locutores y 9.447 utterances. Se uso un calentamiento de margen angular lineal durante los primeros 500 pasos y un calentamiento de learning rate de 460 pasos. Los recortes de audio fueron de longitud variable U(90, 180) frames con mascara de validez exacta. No se menciona uso de RLHF ni DPO; el entrenamiento es puramente supervisado con la perdida ArcFace. El autor advierte que este checkpoint es una referencia de convergencia sobre corpus pequeno, no una reproduccion a gran escala de los resultados de los papers originales.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de audio a 16 kHz.
- Verificacion de locutor (1:1) mediante similitud coseno entre embeddings.
- Entrenamiento multi-dominio: cubre dominios de habla leida (LibriSpeech), mandarin (CN-Celeb2) e ingles espontaneo (VoxCeleb1).
- Evaluacion con metricas EER (1-utt y 3-utt), minDCF y ROC-AUC, con intervalos de confianza bootstrap al 95%.
- Soporte de evaluacion sobre subconjunto de 10 locutores de VoxCeleb1-O.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extraccion de caracteristicas de audio, no un LLM.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidades multilingues limitadas a los dominios de entrenamiento (ingles y mandarin); no se documenta soporte explicito de otros idiomas.

## Casos de uso

- Verificacion biométrica por voz en prototipos: el modelo genera embeddings de 192 dimensiones que permiten comparar dos grabaciones con similitud coseno para autenticar a un usuario, con un coste computacional minimo al tener solo 2 millones de parametros.
- Control de acceso en aplicaciones de escritorio o moviles: al ser tan ligero, puede ejecutarse en CPU o en dispositivos con recursos limitados, integrándose en un pipeline de autenticacion local sin enviar audio a la nube.
- Benchmarking reproducible de pipelines de speaker verification: sirve como referencia controlada con semilla fija y metricas publicadas (EER, minDCF, ROC-AUC) para comparar variantes de arquitectura, pooling o funciones de perdida dentro del ecosistema FlaxSpeaker.
- Investigacion en reconocimiento de locutor con JAX/Flax: permite reproducir experimentos y validar implementaciones de GE2E, Dr-Vectors, ATP y PFAS sin depender de frameworks propietarios.
- Segmentacion y diarizacion de hablantes en grabaciones multi-dominio: los embeddings pueden alimentar un clustering posterior para separar voces en reuniones o podcasts, aprovechando el entrenamiento multi-dominio (lectura, mandarin, espontaneo).
- Filtrado y organizacion de archivos de audio: agrupar grabaciones por locutor en archivos personales o corpus de investigacion, usando la similitud coseno entre embeddings para asignar etiquetas de hablante.
- Deteccion de suplantacion en entornos de baja资源: como paso previo en un sistema anti-fraude telefonico, comparando la voz entrante con un embedding de referencia del usuario registrado.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la evolucion del entrenamiento sobre el corpus de 381 locutores, no a benchmarks estandar de la comunidad como VoxCeleb1-O completo.

| Metrica | Paso 400 | Paso 4000 (rodilla) | Paso 4600 (final) |
|---|---|---|---|
| EER universal pooled, 1-utt | 28,12 % | 14,59 % | 14,80 % |
| EER universal pooled, 3-utt | 24,93 % | 10,00 % | 10,10 % |

El autor indica que la desviacion estandar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41 % absoluto, y que el intervalo de confianza bootstrap al 95% con 8.000 ensayos tiene una semianchura de ~0,8 %. Como referencia orientativa, el autor cita que sistemas ECAPA-TDNN publicados entrenados sobre VoxCeleb2-dev alcanzan ~0,9 % EER en la lista completa VoxCeleb1-O, y sistemas de menos de 1M de parametros ~2 % (Wang et al., EfficientTDNN, 2022), pero advierte que este checkpoint no es comparable directamente por la diferencia de corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB con pesos en precision completa (2.029.892 parametros), dado el reducido tamano del modelo.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo se entreno en CPU, por lo que no requiere GPU dedicada.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: la libreria `flaxspeaker` (PyPI) es la via principal; al estar en JAX/Flax, puede ejecutarse en CPU, GPU o TPU. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_arcface` | 2.029.892 | Audio 16 kHz, recortes 90-180 frames | 14,80 % (1-utt) / 10,10 % (3-utt) en corpus de 381 locutores | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible | Audio | ~0,9 % en VoxCeleb1-O completo (entrenado en VoxCeleb2-dev) | no disponible | Referencia bibliografica |
| EfficientTDNN (Wang et al., 2022) | <1M | Audio | ~2 % en VoxCeleb1-O (entrenado en VoxCeleb2-dev) | no disponible | Referencia bibliografica |

La comparacion directa no es valida: los sistemas de referencia se entrenaron sobre VoxCeleb2-dev (5.994 locutores, ~1,1M utterances), mientras que este checkpoint usa 381 locutores y 9.447 utterances. El propio autor lo indica como orientacion, no como comparacion equivalente.

## Limitaciones y advertencias

- No es un producto oficial de Google; es una reimplementacion independiente basada solo en papers publicados.
- Entrenado sobre un corpus pequeno (381 locutores, 9.447 utterances); el EER absoluto esta acotado por la diversidad de locutores y no es comparable a sistemas industriales.
- El autor advierte explicitamente que es un checkpoint de convergencia sobre corpus pequeno, no una reproduccion a gran escala de los resultados de los papers.
- Riesgo de sesgo por la composicion del corpus: dominios de habla leida en ingles, mandarin y habla espontanea en ingles; puede degradarse en otros idiomas, acentos o condiciones acusticas no representadas.
- No se documentan sesgos demograficos especificos (genero, edad, etnia) en la informacion disponible.
- Riesgo de alucinacion no aplicable en el sentido de LLM, pero si riesgo de falsos positivos/negativos en la verificacion de locutor, especialmente con audio ruidoso o de corta duracion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y declara que no es un producto soportado oficialmente.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face; requiere usar `flaxspeaker.AudioFrontend` con configuracion especifica (Mel log de 80 dimensiones a 16 kHz, VAD por energia, CMVN), lo que complica la integracion con pipelines estandar de Hugging Face.
- No soporta tool calling, agentes ni generacion de texto; no debe confundirse con un modelo de lenguaje.
- Los pesos de clasificador usados solo en entrenamiento no estan incluidos en el conteo de parametros de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_arcface
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
