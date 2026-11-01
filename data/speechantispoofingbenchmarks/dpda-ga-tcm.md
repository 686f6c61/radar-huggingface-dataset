# SpeechAntiSpoofingBenchmarks/DPDA-GA-TCM

## Resumen

DPDA-GA-TCM es un detector de *anti-spoofing* de voz (detección de audio sintético y *deepfakes* de habla) empaquetado por el proyecto SpeechAntiSpoofingBenchmarks para su uso en la *Speech Anti-Spoofing Arena*. El modelo subyacente procede del trabajo de Truong et al. presentado en ICASSP 2026, que introduce DPDA-GA (*dual-path data-augmented training with gradient alignment*), una estrategia de entrenamiento que combina dos rutas de datos (audio limpio y audio aumentado con RawBoost) y alinea los gradientes de ambas pérdidas mediante PCGrad. Esta ficha corresponde a la variante con *back-end* TCM-Conformer.

La arquitectura es un *front-end* wav2vec 2.0 XLS-R de 300 M de parámetros, proyectado a 144 dimensiones (BatchNorm + SELU), seguido de 4 bloques Conformer con atención multi-cabeza Head-Token (TCM, 4 cabezas, convolución *depthwise* de kernel 31) y un *class token* que alimenta una cabeza lineal de dos clases. El total es de 321,2132 M de parámetros. El modelo se ha entrenado exclusivamente con el conjunto de entrenamiento de ASVspoof2019 LA y se distribuye como *checkpoint* en FP32 para PyTorch.

Su relevancia actual radica en que ofrece un detector de voz sintética con rendimiento muy alto en el dominio de entrenamiento (0,14 % EER en ASVspoof2019 LA) y resultados competitivos en varios conjuntos de evaluación cruzada, empaquetado de forma reproducible con ventana determinista de 66.800 muestras a 16 kHz y una clase *drop-in* de TensorRT para despliegue. Es una pieza útil tanto para investigación en detección de *deepfakes* de audio como para integrarse en *pipelines* de verificación de locutor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLS-R 300M (wav2vec 2.0) + proyección 144-d + 4 bloques Conformer con atención TCM (Head-Token) |
| Parametros totales | 321,2132 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 66.800 muestras a 16 kHz (4,175 s); clips más cortos se repiten (*repeat-tiled*) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP32; inferencia TensorRT probada en FP32 y FP16) |
| Idiomas soportados | no disponible (el *front-end* XLS-R es multilingüe, pero la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`), FP32 |
| Tamano del repo | 1,4 GB |
| Entrada | primeras 66.800 muestras a 16 kHz, FP32 |
| Salida | `logits[:, 1]` (mayor = *bona fide*) |
| Dataset de entrenamiento | ASVspoof2019 LA (solo *train*) |

## Arquitectura y entrenamiento

El modelo sigue un diseño *front-end* / *back-end*. El *front-end* es un wav2vec 2.0 XLS-R de 300 M de parámetros completamente ajustado (*fully fine-tuned*), cuya salida se proyecta a 144 dimensiones mediante BatchNorm y SELU. El *back-end* consta de 4 bloques Conformer con atención multi-cabeza de tipo Head-Token (TCM): 4 cabezas y convolución *depthwise* de kernel 31. Un *class token* agrega la representación y alimenta una cabeza lineal de dos clases (clase 1 = *bona fide*). El total asciende a 321,2132 M de parámetros.

El entrenamiento aplica DPDA-GA: cada *batch* se procesa dos veces, una limpia y otra aumentada con RawBoost, y los gradientes de ambas pérdidas se alinean mediante PCGrad para evitar conflictos entre rutas. El modelo se entrena solo con ASVspoof2019 LA *train*. El *checkpoint* publicado es una media de pesos de los *checkpoints* n-best de los autores, reproduciendo su código de promediado: como el quinto *checkpoint* (`best_4.pth`) está truncado en HuggingFace y no se puede cargar, se promedian 4 en lugar de 5, y el código de `main.py` descarta `best_0` y cuenta dos veces `best_1`, dando `(2*best_1 + best_2 + best_3)/4`. La inferencia es determinista sobre la primera ventana de 66.800 muestras.

## Capacidades

- Detección binaria de audio sintético frente a voz genuina (*bona fide* vs. *spoof*).
- Detección de *deepfakes* de voz y ataques de síntesis/convertersión de habla.
- Puntuación continua (`logits[:, 1]`) utilizable para umbralizar o calibrar.
- Inferencia determinista con ventana fija de 4,175 s y repetición (*repeat-tiling*) para clips más cortos.
- *Front-end* XLS-R multilingüe, aunque la model card no declara idiomas soportados explícitamente.
- Clase *drop-in* de TensorRT para despliegue acelerado (FP32 y FP16).
- No soporta *tool calling*, agentes, visión ni audio generativo: es un clasificador de audio.

## Casos de uso

- Verificación anti-*spoofing* en sistemas de autenticación por voz: el modelo actúa como segunda etapa tras la verificación de locutor, rechazando audio sintético con un umbral calibrado sobre `logits[:, 1]`.
- Moderación de contenido en plataformas de audio: filtrado de clips generados por TTS o *voice conversion* antes de su publicación, usando la ventana determinista de 66.800 muestras.
- Investigación en detección de *deepfakes*: *baseline* reproducible para comparar contra otros detectores dentro de la Speech Anti-Spoofing Arena.
- Evaluación de robustez de modelos TTS: medir la detectabilidad de audios generados por un sistema TTS propio frente a este detector.
- *Benchmarking* de *pipelines* de despliegue: comparar latencia y precisión entre la implementación PyTorch y la clase TensorRT (FP32/FP16) en GPUs de consumo.
- Detección en centros de llamadas: marcado de grabaciones sospechosas de síntesis para revisión humana, con la salvedad de que el rendimiento cae fuera del dominio ASVspoof2019 LA.
- Auditoría de conjuntos de datos de voz: identificación de muestras sintéticas contaminantes antes de entrenar modelos de ASR o de locutor.

## Benchmarks y rendimiento

Resultados de EER % (menor es mejor) publicados en la model card. EmoSpoofTTS y LRLspoof son *spoof-only* y usan 1-SRR % en el umbral EER de DeepVoice; el resto de conjuntos no se detallan en la información disponible.

| Conjunto de evaluacion | EER % |
|---|---|
| ASVspoof2019 LA | 0,14 |
| ASVspoof2021 LA | 5,97 |
| ASVspoof2021 DF | 3,04 |
| ASVspoof5 | 18,99 |
| InTheWild | 6,77 |
| ADD22_eval_31 | 14,78 |
| ADD2023_track12_test_r1 | 24,83 |
| CFAD | 16,55 |
| CD-ADD | 25,73 |
| CVoiceFake_small | 15,67 |
| DeepVoice | 32,86 |
| LibriSeVoc | 3,07 |
| SONAR | 31,66 |
| ArAD | 26,7 |
| DECRO | 10,5 |
| J-SPAW_LA | 12,9 |

No se dispone de comparación numérica con otros sistemas en la información proporcionada; los resultados por conjunto están en `.eval_results/` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32 solo para pesos (321,2 M de parámetros); en la práctica, el *front-end* XLS-R y las activaciones elevan el consumo, pero no se especifica cifra exacta.
- GPU recomendadas: los autores reportan inferencia con la clase TensorRT en una RTX 4070 Ti SUPER (FP32) y una RTX 5060 Ti (FP16); cabe en GPUs de consumo con al menos ~4 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 4070 Ti SUPER y RTX 5060 Ti según la model card; también en GPUs de gama media con suficiente VRAM.
- Opciones de despliegue: PyTorch nativo (wrapper de la Arena) y clase *drop-in* de TensorRT (FP32/FP16). No se mencionan vLLM, llama.cpp ni Ollama (no aplican a un clasificador de audio).
- Latencia y *throughput*: no disponibles de forma numérica; la model card solo indica que TensorRT en FP16 coincide con PyTorch en el conjunto completo J-SPAW_LA.

## Comparativa con modelos similares

La model card menciona tres *back-ends* del mismo trabajo (DPDA-GA-AASIST, DPDA-GA-TCM y DPDA-GA-Mamba), pero no proporciona sus resultados numéricos en la información disponible.

| Modelo | Parametros | Contexto | EER ASVspoof2019 LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DPDA-GA-TCM | 321,2132 M | 66.800 muestras (4,175 s) | 0,14 % | MIT | HuggingFace |
| DPDA-GA-AASIST | no disponible | no disponible | no disponible | MIT (presumible) | HuggingFace |
| DPDA-GA-Mamba | no disponible | no disponible | no disponible | MIT (presumible) | HuggingFace |

No se dispone de datos de otros detectores de *anti-spoofing* comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con ASVspoof2019 LA *train*: el rendimiento cae drásticamente en dominios alejados (EER de 32,86 % en DeepVoice, 31,66 % en SONAR, 26,7 % en ArAD, 25,73 % en CD-ADD).
- La ventana es fija (66.800 muestras); los clips más cortos se repiten (*repeat-tiled*), lo que puede introducir artefactos y afectar a la detección.
- El *checkpoint* publicado no es exactamente el de los autores: se promedian 4 en lugar de 5 por un archivo truncado, y el promediado descarta `best_0` y duplica `best_1`.
- Riesgo de falsos positivos/negativos en audio real con ruido, códec o condiciones no vistas; requiere calibración de umbral por dominio.
- No se declaran idiomas soportados ni sesgos conocidos; el *front-end* XLS-R es multilingüe, pero el detector se ha entrenado con datos mayoritariamente en inglés.
- Licencia MIT permite uso comercial, pero sin garantías; verificar la licencia de los pesos de XLS-R subyacentes.
- No apto para generación de audio ni para tareas de texto; es exclusivamente un clasificador binario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpeechAntiSpoofingBenchmarks/DPDA-GA-TCM
- Checkpoint (commit-pinned): https://huggingface.co/SpeechAntiSpoofingBenchmarks/DPDA-GA-TCM/blob/e949ad036fe984b80fadaa629ac5544f04e0ac26/dpda_ga_tcm_avg4.pth
- Paper (arXiv:2509.20682): https://arxiv.org/abs/2509.20682
- Código de los autores: https://github.com/ductuantruong/dpda_ga
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=dpda-ga-tcm
