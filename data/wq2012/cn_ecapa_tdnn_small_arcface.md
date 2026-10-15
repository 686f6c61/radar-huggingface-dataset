# wq2012/cn_ecapa_tdnn_small_arcface

## Resumen

`cn_ecapa_tdnn_small_arcface` es un modelo de verificacion e identificacion de locutor (speaker verification) publicado por el usuario wq2012 dentro de la coleccion FlaxSpeaker. Se trata de una reproduccion open source, en JAX/Flax, de algoritmos de reconocimiento de locutor descritos en cuatro articulos (GE2E, Dr-Vectors, Conformer-ATP y PFAS), con un backbone ECAPA-TDNN en su variante `small`. No es un modelo generativo: su salida es un embedding de locutor de 192 dimensiones que se compara mediante similitud coseno para decidir si dos fragmentos de audio pertenecen a la misma persona.

El modelo es extremadamente compacto: 1.684.416 parametros en el encoder, lo que lo situa muy por debajo de los sistemas ECAPA-TDNN habituales (que suelen superar los 20 millones de parametros). El frontend de audio trabaja con log-mel de 80 dimensiones a 16 kHz, con deteccion de actividad de voz (VAD) basada en energia y normalizacion CMVN. Se entreno sobre el dominio `cnceleb2` (chino) con perdida ArcFace y pooling atencional `asp`, y se evalua de forma cruzada en LibriSpeech (ingles), CN-Celeb2 (chino) y VoxCeleb1 (multilingue).

Su relevancia es sobre todo practica y de investigacion: sirve como referencia ligera y reproducible para pipelines de verificacion de locutor en entornos con recursos muy limitados, y como base para estudiar el efecto del tamano del modelo y de la funcion de perdida en dominios cruzados. Los resultados publicados son modestos (EER en torno al 30% en verificacion de una sola utterance), por lo que debe entenderse como un modelo de bajo coste y no como un sistema de produccion de alta seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`small`) con pooling atencional `asp` |
| Parametros totales | 1.684.416 (encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa utterances de audio, no secuencias de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles; dominio de entrenamiento `cnceleb2` (chino), evaluado tambien en ingles (LibriSpeech) y multilingue (VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors`, `flax_model.msgpack` (Flax nativo) |
| Dimensionalidad del embedding | 192 |
| Funcion de perdida de entrenamiento | ArcFace |
| Puntuacion de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD por energia + CMVN |
| Libreria | `flaxspeaker` |
| Pipeline en HuggingFace | `audio-classification` |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN en configuracion `small`. Esta familia de arquitecturas, descrita originalmente por Desplanques, Thienpondt y Demuynck en Interspeech 2020 (arXiv:2005.07143), combina bloques TDNN con bloques Res2Block, mecanismos de atencion por canales (SE-block) y agregacion estadistica atencional. El modelo combina ese backbone con pooling atencional `asp` (attentive statistics pooling) para producir un embedding de locutor de 192 dimensiones a partir de la secuencia de frames log-mel.

El entrenamiento se realizo sobre el dominio `cnceleb2` y emplea la perdida ArcFace, una variante de margen angular ampliamente usada en reconocimiento de locutor y de rostro por su capacidad de separar clases con margenes angulares explicitos. Los articulos de referencia citados por el autor son GE2E (arXiv:1710.10467), Dr-Vectors (arXiv:2104.01989), Conformer-ATP (arXiv:2202.12163) y PFAS (arXiv:2203.05642v3). El autor advierte explicitamente de que los experimentos de esos articulos se hicieron con infraestructura interna propietaria de Google y con conjuntos de datos internos, no con esta libreria ni con los splits publicos usados aqui; por tanto, las cifras del paper original no son directamente comparables.

En cuanto al frontend, se usa un extractor compatible con `WhisperFeatureExtractor`, con log-mel de 80 dimensiones a 16 kHz, deteccion de actividad de voz basada en energia y normalizacion CMVN. No se documenta en la model card el numero de tokens de audio, la composicion exacta del dataset de entrenamiento ni si hubo etapas de refinamiento posteriores al entrenamiento con ArcFace (por ejemplo, aumento de puntuacion o calibracion especifica). El repositorio incluye un fichero `eval_results.json` con metricas verificadas multi-dominio (EER a 1 y 3 utterances, minDCF, ROC-AUC e intervalos de confianza bootstrap al 95%).

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de un fichero de audio.
- Verificacion de locutor (1:1): comparar dos utterances y obtener una puntuacion de similitud coseno.
- Reconocimiento de locutor (1:N) mediante comparacion del embedding de consulta contra una galeria de embeddings previamente enrolados.
- Verificacion multi-utterance: el modelo card reporta resultados con enrolamiento de 3 utterances, que mejoran el EER respecto al modo de 1 utterance.
- Funcionamiento multilingue de facto en evaluacion: se ha evaluado en LibriSpeech (ingles leido), CN-Celeb2 (chino multigenero) y VoxCeleb1 (locutores en entornos reales).
- Integracion mediante Python API (`extract_embedding`, `verify`) y script de linea de comandos (`scripts/inference.py`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling ni comportamiento de agente. Estas capacidades no aplican a este tipo de modelo.
- No se documenta soporte de modo de razonamiento (thinking), audio-a-texto, texto-a-audio ni procesamiento de video.

## Casos de uso

- Autenticacion de voz en aplicaciones de bajo consumo: el modelo ocupa apenas 1,68 millones de parametros, por lo que puede ejecutarse en CPU o en dispositivos embebidos para verificar la identidad del hablante en un flujo de login por voz, aceptando el coste de un EER alto y combinando la decision con otros factores de autenticacion.
- Segmentacion y diarizacion de reuniones: extrayendo embeddings por segmento (a partir de un VAD externo) y aplicando clustering sobre las representaciones de 192 dimensiones, se puede etiquetar quien habla en cada tramo de una grabacion.
- Analitica de contact center: agrupar llamadas por agente o por cliente a partir de los embeddings, para medir tiempos de habla, detectar transferencias y construir perfiles agregados sin necesidad de transcripcion.
- Enrolamiento de locutor en asistentes de voz: crear un perfil de voz a partir de tres o mas grabaciones del usuario y usarlo para personalizar respuestas o restringir comandos sensibles.
- Filtrado de locutor en conjuntos de datos de audio: identificar y separar automaticamente fragmentos de la misma persona para construir datasets de voz limpios y balanceados por hablante.
- Deteccion de suplantacion como componente auxiliar: integrar el embedding como caracteristica adicional en un pipeline de anti-spoofing, donde el sistema principal decide con informacion espectral y el modelo aporta la coherencia de identidad.
- Investigacion y docencia en reconocimiento de locutor: al ser una reproduccion abierta en JAX/Flax, permite reproducir experimentos de ECAPA-TDNN, ArcFace y pooling atencional sin depender de infraestructura propietaria.
- Verificacion cruzada de dominio en estudios de generalizacion: el modelo card publica evaluaciones en tres dominios distintos, lo que lo hace util como punto de partida para medir transferencia entre idiomas y condiciones de grabacion.

## Benchmarks y rendimiento

Resultados de verificacion con una sola utterance (1-utt), tal como se publican en la model card del autor:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 30,53 | [28,87; 32,08] | 0,9927 | 0,9607 | 0,7678 |
| CN-Celeb2 (chino multigenero) | 3.000 | 28,07 | [26,53; 29,70] | 0,9980 | 0,9733 | 0,7956 |
| VoxCeleb1 (locutores en entornos reales) | 2.000 | 31,40 | [29,20; 33,25] | 0,9870 | 0,9870 | 0,7423 |
| Universal agrupado (3 dominios) | 8.000 | 30,23 | [29,29; 31,18] | 0,9987 | 0,9748 | 0,7648 |
| Universal macro-media (3 dominios) | 8.000 | 30,00 | no disponible | 0,9926 | 0,9737 | 0,7686 |

Resultados de verificacion con enrolamiento de 3 utterances (3-utt):

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 23,40 | [20,60; 25,80] | 0,9500 | 0,8554 |
| CN-Celeb2 (3-utt) | 1.000 | 23,80 | [20,65; 26,40] | 0,9720 | 0,8489 |
| VoxCeleb1 (3-utt) | 1.000 | 31,20 | [28,20; 34,40] | 0,9760 | 0,7633 |
| Universal agrupado (3-utt) | 3.000 | 26,47 | [25,00; 28,20] | 0,9780 | 0,8182 |
| Universal macro-media (3-utt) | 3.000 | 26,13 | no disponible | 0,9660 | 0,8225 |

No se han publicado en la informacion disponible otros benchmarks (por ejemplo, comparaciones directas con sistemas ECAPA-TDNN de mayor tamano bajo el mismo protocolo de evaluacion).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 MB en fp32 (1.684.416 parametros x 4 bytes) y unos 3,4 MB en fp16. El consumo real de memoria depende de la longitud del audio y de las activaciones intermedias del frontend log-mel, pero en la practica el modelo cabe holgadamente en cualquier GPU moderna e incluso en memoria de sistema.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. No se requiere A100, H100 ni RTX 4090; una GTX 1050 Ti, una RTX 3050 o una GPU integrada pueden ejecutar la inferencia sin dificultad.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual y en la mayoria de CPU modernas. El cuello de botella no es la memoria sino el coste de extraccion de caracteristicas log-mel y del VAD.
- Opciones de despliegue: la libreria oficial es `flaxspeaker` (JAX/Flax), con API Python y script de linea de comandos. Los formatos incluidos (`safetensors` y `flax_model.msgpack`) son cargables desde Flax. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de modelos generativos, que no aplican a este tipo de modelo. Tampoco se documenta una exportacion a ONNX en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera una latencia dominada por el preprocesado de audio mas que por el calculo de la red, pero esto no se cuantifica en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Dominio de entrenamiento | EER publicado | Licencia |
|---|---|---|---|---|---|
| `wq2012/cn_ecapa_tdnn_small_arcface` | 1.684.416 | ECAPA-TDNN small + ASP + ArcFace | CN-Celeb2 | 28,07% (CN-Celeb2, 1-utt); 30,53% (LibriSpeech, 1-utt); 31,40% (VoxCeleb1, 1-utt) | Apache 2.0 |
| ECAPA-TDNN (referencia del paper, arXiv:2005.07143) | no disponible en la informacion proporcionada | ECAPA-TDNN (variante de mayor tamano) | VoxCeleb | no disponible en la informacion proporcionada | no disponible |
| `TaoRuijie/ECAPA-TDNN` (reimplementacion no oficial, GitHub) | no disponible | ECAPA-TDNN | VoxCeleb2 | EER 0,86% en Vox1-O segun el repositorio | no disponible en la informacion proporcionada |
| `yangwang825/ecapa-tdnn-vox2` | no disponible | ECAPA-TDNN | VoxCeleb2 | no disponible | no disponible |

Nota: las cifras de EER no son comparables entre filas porque los protocolos de evaluacion, los conjuntos de prueba y las condiciones de entrenamiento son distintos. El EER de 0,86% del repositorio `TaoRuijie/ECAPA-TDNN` corresponde a un modelo de mayor tamano entrenado en VoxCeleb2 y evaluado en Vox1-O, un escenario sustancialmente mas favorable que el de este checkpoint `small` entrenado en CN-Celeb2.

## Limitaciones y advertencias

- Rendimiento limitado: el EER en torno al 28-31% en verificacion de una sola utterance es muy alto para un sistema de reconocimiento de locutor. No es adecuado para control de acceso critico por si solo.
- Sesgo de dominio: el entrenamiento se realizo exclusivamente sobre `cnceleb2` (chino). Aunque se evalua en LibriSpeech y VoxCeleb1, el rendimiento es peor en esos dominios, lo que apunta a una capacidad de generalizacion cruzada limitada.
- Riesgo de falsos positivos y falsos negativos: al tratarse de un sistema biometrico, una puntuacion de similitud alta no garantiza identidad. Debe combinarse con umbrales calibrados por dominio y, en produccion, con factores adicionales de autenticacion.
- Calibracion de umbral: los valores de minDCF reportados (cercanos a 1,0 en varios splits) indican que la separacion entre clases es pobre y que la eleccion del umbral operativo es critica.
- Confusion entre locutores con voces similares: no se documenta ningun mecanismo especifico para mitigar confusiones entre hermanos, imitadores o grabaciones con canal similar.
- Longitud y calidad del audio: no se especifican en la model card los requisitos minimos de duracion, la sensibilidad al ruido ni el comportamiento con audio musical o con solapamiento de voces. El VAD por energia puede degradar el rendimiento en grabaciones con ruido de fondo alto.
- Tipo de dato y cuantizacion: no se documentan opciones de cuantizacion ni su impacto en el EER; usar int8 o fp16 sin validacion previa puede alterar las puntuaciones.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se especifican restricciones adicionales.
- Aviso de no afiliacion: el autor declara explicitamente que no es un producto soportado oficialmente por Google y que la libreria `FlaxSpeaker` es una reproduccion independiente (clean-room) en JAX/Flax de algoritmos publicados. Los resultados de los articulos originales no son reproducibles con este checkpoint.
- Madurez del proyecto: el repositorio en HuggingFace registra 0 descargas y 0 likes en la informacion consultada, por lo que la validacion por parte de la comunidad es practicamente nula.
- Fecha de publicacion: la ficha de HuggingFace figura creada el 2026-10-15, una fecha posterior a la consulta; conviene verificar la vigencia y el estado del repositorio antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/cn_ecapa_tdnn_small_arcface
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
- Paper original de ECAPA-TDNN (arXiv:2005.07143): https://arxiv.org/abs/2005.07143
- Listado de modelos etiquetados ECAPA-TDNN en HuggingFace: https://huggingface.co/models?other=ECAPA-TDNN
- Reimplementacion no oficial de ECAPA-TDNN (TaoRuijie): https://github.com/TaoRuijie/ECAPA-TDNN
- Reimplementacion ECAPA-TDNN (LKLQQ): https://github.com/LKLQQ/ecapa_tdnn
- Checkpoint ECAPA-TDNN entrenado en VoxCeleb2 (yangwang825): https://huggingface.co/yangwang825/ecapa-tdnn-vox2
