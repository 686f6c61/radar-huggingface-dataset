# wq2012/ls_conformer_small_ge2e

## Resumen

`ls_conformer_small_ge2e` es un modelo de extracción de embeddings de locutor (speaker embeddings) desarrollado por el usuario wq2012 como parte del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de verificación de locutor publicados en la literatura. El modelo resuelve la tarea de speaker verification y speaker recognition: dado un fragmento de audio, produce un vector de 192 dimensiones que representa la identidad del hablante, permitiendo comparar locutores mediante similitud coseno.

Se trata de un modelo muy compacto, con tan solo 2.029.894 parámetros de inferencia (encoder más cabeza de scoring), lo que lo sitúa en la categoría de modelos ultraligeros aptos para despliegue en dispositivos con recursos limitados. La arquitectura combina un backbone Conformer de tamaño pequeño con pooling temporal atento (ATP) y se entrena con la función de pérdida GE2E softmax con centroides leave-one-out exactos.

Es relevante ahora porque ofrece una implementación abierta, reproducible y de licencia Apache 2.0 para investigación en verificación de locutor, con exportaciones a TFLite (fp32 e int8) pensadas para inferencia en el borde. No obstante, conviene subrayar que se trata de un checkpoint de benchmark entrenado sobre un corpus pequeño (232 locutores de LibriSpeech), no de un modelo de producción a escala industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal ATP |
| Parametros totales | 2.029.894 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; entrada de audio de 180 frames (1,8 s) en las exportaciones TFLite; entrenamiento con crops variables U(90, 180) frames |
| Tipos de cuantizacion | fp32 e int8 (exportaciones TFLite del encoder); no se documentan otras |
| Idiomas soportados | no disponible (modelo agnóstico al idioma en la tarea de identidad de locutor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack, TFLite (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de tamaño pequeño, una arquitectura que combina convoluciones y auto-atención para modelar dependencias locales y globales en secuencias de audio. Sobre la salida del encoder se aplica un pooling temporal atento (ATP, Attentive Temporal Pooling), técnica originalmente propuesta en un trabajo de identificación de idioma y reutilizada aquí para agregar la secuencia temporal en un único vector de 192 dimensiones. La verificación se realiza por similitud coseno entre embeddings.

El entrenamiento utiliza la función de pérdida GE2E softmax (Wan et al. 2018, ecuación 6) con centroides leave-one-out exactos, junto con componentes de Dr-Vectors y PFAS en las cabezas de scoring. Los datos de entrenamiento se limitan a LibriSpeech: 5.788 enunciados de 232 locutores, con un presupuesto de 2.400 pasos de gradiente (aproximadamente 13,27 épocas), mini-batches de 32 enunciados (8 locutores x 4 enunciados), warmup de 240 pasos y semilla 42, ejecutado en una estación de trabajo con CPU. El frontend de audio es un Mel logarítmico natural de 80 dimensiones a 16 kHz, con VAD a nivel de frame basado en energía y CMVN, implementado en `flaxspeaker.AudioFrontend` y no como un `AutoFeatureExtractor` de Hugging Face.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de locutor (1:1) mediante similitud coseno entre embeddings.
- Reconocimiento de locutor (1:N) mediante comparación contra una galería de embeddings.
- Agrupación y diarización básica de locutores a partir de embeddings.
- Exportación a TFLite (fp32 e int8) del encoder para inferencia en el borde.
- Sin soporte de tool calling, agentes, visión, audio-texto ni generación de texto: es un modelo puramente de representación de audio.
- Capacidades multilingües: no documentadas; la tarea de identidad de locutor es inherentemente independiente del idioma, pero no se han publicado evaluaciones multilingües.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de acceso: el modelo genera un embedding de 192 dimensiones que se compara por similitud coseno contra la plantilla registrada del usuario, con un coste computacional mínimo gracias a sus 2 millones de parámetros.
- Autenticación por voz en dispositivos embebidos: las exportaciones TFLite int8 permiten ejecutar el encoder en microcontroladores o SoCs de baja potencia con una ventana fija de 1,8 s.
- Diarización de reuniones y transcripciones: los embeddings permiten agrupar segmentos de audio por locutor y etiquetar intervenciones en grabaciones multihablante.
- Indexación y búsqueda por voz en archivos de audio: generar embeddings para cada segmento y construir un índice vectorial que permita recuperar fragmentos de un locutor concreto.
- Investigación en verificación de locutor: el modelo sirve como baseline reproducible y ligero para comparar arquitecturas, funciones de pérdida y estrategias de pooling dentro del benchmark FlaxSpeaker.
- Detección de cambios de locutor en streaming: procesar ventanas de 1,8 s y comparar embeddings consecutivos para segmentar audio en tiempo real con latencia baja.
- Prototipado rápido en pipelines JAX/Flax: integrar el modelo en flujos de investigación existentes sin dependencias de frameworks propietarios.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER en LibriSpeech, dominio de entrenamiento):

| Metrica | Paso 400 | Paso 2000 (knee) | Paso 2400 (final) |
|---|---|---|---|
| EER 1-utt | 19,50 % | 12,40 % | 12,07 % |
| EER 3-utt | 14,80 % | 7,50 % | 7,50 % |
| EER pooled 1-utt (Universal Pooled) | no disponible | no disponible | 20,20 % |
| EER pooled 3-utt (Universal Pooled) | no disponible | no disponible | 16,93 % |

La desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semianchura de aproximadamente 0,8 %. El modelo incluye además `eval_results.json` con métricas multi-dominio (EER 1-utt y 3-utt, minDCF, ROC-AUC, IC bootstrap y un subconjunto de 10 locutores de VoxCeleb1-O), aunque los valores concretos de minDCF y ROC-AUC no se detallan en la información disponible.

Como referencia externa citada por el autor, los sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev alcanzan aproximadamente 0,9 % EER en la lista completa VoxCeleb1-O, y los sistemas de menos de 1 millón de parámetros alrededor del 2 %. Estas cifras no son comparables directamente con las de este checkpoint, entrenado sobre un corpus mucho menor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU moderna (RTX 3060 o superior, A100, H100) ejecuta la inferencia con latencia despreciable. El entrenamiento documentado se realizó en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en dispositivos embebidos mediante TFLite int8.
- Opciones de despliegue: JAX/Flax con la librería `flaxspeaker` (PyPI), exportaciones TFLite para móviles y edge, y safetensors/msgpack para integración en pipelines JAX.
- Latencia y throughput estimados: no disponibles de forma numérica; con 2 millones de parámetros y ventanas de 1,8 s, la latencia esperada es de milisegundos en CPU y menor aún en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_ge2e` | 2,03 M | 180 frames (1,8 s) en TFLite; crops variables en entrenamiento | 12,07 % (1-utt) / 7,50 % (3-utt) en LibriSpeech | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (referencia bibliográfica) | no disponible en la información | no disponible | ~0,9 % en VoxCeleb1-O completo (VoxCeleb2-dev) | no disponible | no disponible |
| EfficientTDNN (Wang et al., 2022) | < 1 M | no disponible | ~2 % (referencia citada) | no disponible | no disponible |

La comparación directa no es posible porque los modelos de referencia se entrenaron sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M de enunciados), mientras que este checkpoint se entrenó sobre 232 locutores de LibriSpeech. El propio autor advierte que las cifras no son equiparables y que el modelo está pensado para comparaciones relativas dentro del benchmark FlaxSpeaker.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (232 locutores, 5.788 enunciados): la diversidad de locutores limita el EER absoluto frente a sistemas industriales entrenados con miles de locutores.
- El propio autor califica el checkpoint como benchmark de corpus pequeño, no como reproducción a gran escala de los resultados de los papers.
- Riesgo de sesgo hacia las características acústicas de LibriSpeech (lectura de audiolibros en inglés), con posible degradación en otros dominios, acentos o condiciones de grabación.
- No se han documentado evaluaciones multilingües ni de robustez frente a ruido.
- Riesgo de falsos positivos y negativos en verificación biométrica: no debe usarse como único factor de autenticación en producción sin umbrales calibrados y validación en el dominio objetivo.
- Licencia Apache 2.0 permite uso comercial, pero el aviso del autor indica que no es un producto oficialmente soportado por Google.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, lo que requiere usar `flaxspeaker.AudioFrontend` para reproducir las métricas.
- Las exportaciones TFLite usan una entrada fija y sin máscara de 180 frames (1,8 s), lo que limita la flexibilidad en duraciones distintas sin reexportar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
