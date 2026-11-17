# wq2012/ls_conformer_small_triplet

## Resumen

`ls_conformer_small_triplet` es un modelo de extracción de embeddings de locutor (speaker embeddings) desarrollado por wq2012 dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de verificación e identificación de locutor publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS). El modelo recibe audio y produce un vector de 192 dimensiones que representa la identidad vocal del hablante, útil para tareas de verificación (¿son la misma persona?) y reconocimiento (¿quién habla?).

Arquitectura Conformer de tamaño "small" con pooling temporal atento (ATP) y entrenamiento con objetivo triplet, puntuado mediante similitud coseno. Con solo 2.029.892 parámetros de inferencia, es un modelo extremadamente compacto pensado para comparaciones relativas controladas dentro del benchmark de FlaxSpeaker, no para competir con sistemas industriales.

Es relevante ahora porque ofrece una implementación abierta, reproducible y ligera (licencia Apache 2.0, pesos en safetensors y msgpack) para experimentar con biometría de voz en CPU, aunque su corpus de entrenamiento es muy reducido (232 locutores de LibriSpeech) y sus tasas de error son altas en términos absolutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.892 (encoder + cabeza de scoring; excluye pesos de clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa recortes variables de 90 a 180 frames de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo es independiente del idioma; entrenado con LibriSpeech, inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuración `small` que procesa características Mel de 80 dimensiones en escala logarítmica natural a 16 kHz, con detección de actividad vocal (VAD) a nivel de frame y normalización CMVN aplicada por el frontend propio de `flaxspeaker` (no es un `AutoFeatureExtractor` de Hugging Face). Sobre el encoder se aplica un pooling temporal atento (ATP, tomado de un trabajo de identificación de idioma) que agrega la secuencia en un embedding de 192 dimensiones. La verificación se realiza con similitud coseno.

El entrenamiento usa el objetivo triplet, con un presupuesto de 2.400 pasos de gradiente y lotes de 32 utterances (8 locutores × 4 utterances), lo que equivale a unas 13,27 épocas sobre 5.788 utterances de 232 locutores de LibriSpeech, con semilla 42 y recortes de longitud variable U(90, 180) frames con máscara de validez exacta. Se entrenó en una estación de trabajo con CPU. No hay datos publicados sobre uso de RLHF o DPO; las innovaciones destacables son la reimplementación limpia de GE2E, Dr-Vectors, ATP y PFAS, y la reproducibilidad del pipeline (huellas de pérdida en el paso 0 y resultados de evaluación archivados).

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificación de locutor (1:1) mediante similitud coseno entre embeddings.
- Reconocimiento de locutor (1:N) comparando contra una galería de embeddings.
- Puntuación multi-utterance: agregación de varias muestras por locutor (métricas reportadas a 1-utt y 3-utt).
- Funciona como extractor de características (`feature-extraction`) en el pipeline de Hugging Face.
- Inferencia en CPU viable por su tamaño reducido.
- No soporta tool calling, agentes, visión, audio generativo ni modo de razonamiento.
- Capacidades multilingües: no evaluadas; el modelo es agnóstico al idioma por diseño, pero solo se entrenó con inglés (LibriSpeech).

## Casos de uso

- Verificación biométrica de voz en prototipos: comparar el embedding de un audio entrante con el de referencia del usuario mediante similitud coseno; adecuado para validar pipelines antes de pasar a modelos entrenados con miles de locutores.
- Segmentación y diarización de hablantes en experimentos: extraer embeddings por segmento y agrupar por similitud para separar interlocutores en grabaciones cortas.
- Benchmarking interno de arquitecturas: servir como línea base `conformer small` frente a otras variantes del catálogo FlaxSpeaker (por ejemplo, objetivos GE2E o Dr-Vectors) en comparaciones relativas controladas.
- Docencia e investigación en biometría de voz: modelo pequeño, reproducible y con licencia permisiva para estudiar el efecto del pooling atento y la pérdida triplet.
- Filtrado de audio en pipelines de datos: descartar o agrupar clips por identidad de locutor en corpus pequeños antes de anotación manual.
- Despliegue en dispositivos con recursos limitados: con ~2 millones de parámetros, cabe en CPU y en GPUs de gama baja para extracción por lotes de embeddings.
- Pruebas de regresión de la librería `flaxspeaker`: el checkpoint y sus métricas archivadas permiten verificar que cambios en el código reproducen los resultados publicados.

## Benchmarks y rendimiento

Resultados reportados en la model card (EER en LibriSpeech, dominio de entrenamiento):

| Metrica | Paso 400 | Paso 2000 | Paso 2400 (final) |
|---|---|---|---|
| EER 1-utt | 23,47 % | 18,93 % | 17,87 % |
| EER 3-utt | 20,70 % | 14,80 % | 14,20 % |
| EER pooled 1-utt (Universal Pooled) | no disponible | no disponible | 24,15 % |
| EER pooled 3-utt (Universal Pooled) | no disponible | no disponible | 20,50 % |

Referencias de contexto citadas por el autor: sistemas ECAPA-TDNN entrenados con VoxCeleb2-dev alcanzan ~0,9 % EER en VoxCeleb1-O completo, y sistemas de menos de 1 millón de parámetros ~2 %. El autor advierte que este checkpoint no es comparable a esos resultados por la diferencia de diversidad de locutores en entrenamiento. También se reporta una desviación estándar entre semillas 0-2 de 0,08-0,41 % absoluto en EER pooled 1-utt y un intervalo de confianza bootstrap del 95 % (8.000 ensayos) de ~0,8 %.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene ~2 millones de parámetros y se entrenó en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es suficiente.
- Cabe en GPU de consumo: sí, en todas las gamas actuales.
- Opciones de despliegue: la vía oficial es la librería `flaxspeaker >= 0.5.0` (JAX/Flax); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_triplet` | 2.029.892 | recortes de 90-180 frames, Mel 80 dim @ 16 kHz | 17,87 % (1-utt) / 14,20 % (3-utt) en LibriSpeech | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (referencia citada) | no disponible | VoxCeleb2-dev | ~0,9 % en VoxCeleb1-O completo | no disponible | no disponible en esta ficha |
| EfficientTDNN (Wang et al., 2022) | < 1 M | no disponible | ~2 % | no disponible | no disponible en esta ficha |

La comparación no es homogénea: los sistemas de referencia se entrenaron con miles de locutores y se evalúan en VoxCeleb1-O, mientras que este checkpoint se entrena y evalúa en un subconjunto pequeño de LibriSpeech. El propio autor lo presenta como modelo de benchmark relativo, no como estado del arte.

## Limitaciones y advertencias

- EER absoluto alto (17,87 % a 1-utt) por la baja diversidad de locutores del entrenamiento (232), muy lejos de sistemas industriales.
- Sesgos desconocidos: no se documenta análisis de sesgo por género, edad, acento o canal; el entrenamiento con LibriSpeech (lectura en inglés) puede degradar el rendimiento en audio espontáneo, telefónico o en otros idiomas.
- Riesgo de falsos positivos y negativos en verificación; no apto para control de acceso o autenticación en producción sin validación adicional.
- El frontend de audio es propio de `flaxspeaker` (VAD + CMVN), no un `AutoFeatureExtractor` estándar; integrarlo en otros ecosistemas requiere reimplementar el preprocesado.
- Requiere `flaxspeaker >= 0.5.0`; dependencia de JAX/Flax que puede complicar el despliegue frente a PyTorch.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que no es un producto soportado por Google.
- No hay datos publicados sobre cuantización ni sobre latencia/throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_triplet
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
