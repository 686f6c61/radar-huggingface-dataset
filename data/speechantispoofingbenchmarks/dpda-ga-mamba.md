# SpeechAntiSpoofingBenchmarks/DPDA-GA-Mamba

## Resumen

DPDA-GA-Mamba es un sistema de deteccion de voz sintetica (anti-spoofing) desarrollado por Truong et al. y publicado en ICASSP 2026, empaquetado por el proyecto Speech Anti-Spoofing Arena para su evaluacion estandarizada. No es un modelo de lenguaje generativo, sino un clasificador binario de audio que distingue entre voz bona fide (humana) y voz spoofed (generada por TTS o conversion de voz). El modelo combina un front-end wav2vec 2.0 XLS-R 300M con un back-end de Mamba bidireccional de doble columna, aplicando la receta de entrenamiento DPDA-GA (dual-path data-augmented training con alineacion de gradientes PCGrad).

La relevancia actual del modelo radica en su doble aportacion: por un lado, demuestra que la arquitectura Mamba (SSM selectivo) es competitiva frente a back-ends transformer clasicos en tareas de anti-spoofing; por otro, introduce una receta de entrenamiento que alinea los gradientes de dos rutas de datos (limpia y aumentada con RawBoost) mediante PCGrad para evitar conflictos entre objetivos. Con 319,3 M de parametros y entrenado exclusivamente sobre ASVspoof2019 LA train, alcanza un EER del 0,18 % en ASVspoof2019 LA y del 5,83 % en ASVspoof2021 LA.

El modelo se distribuye como checkpoint PyTorch (`.pth`) bajo licencia MIT, con un wrapper de inferencia que fija la entrada a 66.800 muestras a 16 kHz (aproximadamente 4,17 segundos) con repeat-padding para clips mas cortos. Forma parte de una familia de tres back-ends (AASIST, TCM y Mamba) liberados conjuntamente por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: front-end wav2vec 2.0 XLS-R 300M (ultima capa) + proyeccion a 144-d (Linear + BatchNorm + SELU) + back-end Mamba bidireccional de doble columna (6 bloques forward + 6 backward, fused add+RMSNorm, attention pooling por direccion) |
| Parametros totales | 319,3275 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 66.800 muestras a 16 kHz (aprox. 4,17 s) por inferencia; clips mas cortos se rellenan por repeticion |
| Tipos de cuantizacion | no disponible (checkpoint FP32; existe clase TensorRT drop-in en FP32) |
| Idiomas soportados | no disponible (el modelo opera sobre senal acustica, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch); promedio de 5 checkpoints (`dpda_ga_mamba_avg5.pth`) |

## Arquitectura y entrenamiento

El modelo sigue un diseno en dos etapas. El front-end es un wav2vec 2.0 XLS-R de 300 M de parametros completamente afinado (se actualiza la ultima capa), cuyas representaciones se proyectan a 144 dimensiones mediante una capa Linear, BatchNorm y activacion SELU. El back-end es un Mamba bidireccional de doble columna: seis bloques Mamba (SSM selectivo v1) en direccion forward y seis en direccion backward, con fusion de add+RMSNorm, attention pooling independiente por direccion, concatenacion, fusion lineal y una cabeza de clasificacion de 2 vias (bona fide vs. spoofed). La puntuacion de decision es `logits[:, 1]`, donde valores mayores indican mayor probabilidad de voz autentica.

El entrenamiento aplica la receta DPDA-GA: dos rutas de datos en paralelo, una con audio limpio y otra con aumento RawBoost, cuyos gradientes se alinean mediante PCGrad para mitigar conflictos entre ambas rutas. El modelo se entrena exclusivamente sobre el split de entrenamiento de ASVspoof2019 LA. El checkpoint publicado es el promedio de 5 pesos calculado por el `main.py` de los autores. La evaluacion se realizo con el wrapper PyTorch para J-SPAW_LA y con la clase TensorRT drop-in en FP32 para el resto de conjuntos, verificandose que ambos coinciden en el conjunto completo de J-SPAW_LA.

## Capacidades

- Deteccion binaria de voz spoofed frente a voz bona fide en audio de entrada.
- Clasificacion sobre ventanas de 66.800 muestras a 16 kHz con repeat-padding para clips cortos.
- Inferencia en FP32 mediante wrapper PyTorch o clase TensorRT drop-in.
- Evaluacion multi-dataset dentro del marco Speech Anti-Spoofing Arena (ASVspoof2019 LA, ASVspoof2021 LA/DF, ASVspoof5, InTheWild, ADD22, ADD2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO, J-SPAW_LA, ODSS, EmoSpoofTTS, LRLspoof).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (opera sobre senal acustica, no sobre texto).
- Capacidades especiales: deteccion de deepfakes de audio, pensada para entornos de evaluacion comparativa estandarizada.

## Casos de uso

- Verificacion de autenticidad en sistemas de atencion al cliente: el modelo puede puntuar cada segmento de audio entrante (ventanas de ~4,17 s) y marcar como sospechosa la voz sintetica antes de que un agente humano o un sistema de autenticacion por voz procese la llamada, gracias a su EER del 0,18 % en ASVspoof2019 LA.
- Moderacion de contenido en plataformas de audio: integrado en un pipeline de ingesta, clasifica clips subidos por usuarios para detectar deepfakes generados por TTS o conversion de voz, con un EER del 2,9 % en ASVspoof2021 DF.
- Proteccion de sistemas de verificacion biomedica por voz: como capa previa al reconocimiento de hablante, descarta muestras spoofed y reduce el riesgo de ataques de presentacion, aprovechando su entrenamiento especifico en escenarios de anti-spoofing.
- Investigacion en deteccion de deepfakes: el checkpoint y la receta DPDA-GA sirven como linea base reproducible para comparar back-ends (AASIST, TCM, Mamba) bajo el mismo protocolo de evaluacion del Arena.
- Auditoria forense de grabaciones: analisis por ventanas deslizantes de material incautado o aportado como prueba, generando una puntuacion de autenticidad por segmento que un perito puede revisar.
- Filtrado en datasets de entrenamiento TTS: descartar automaticamente muestras sinteticas no deseadas en la construccion de corpus de voz, usando el score `logits[:, 1]` como criterio de filtrado.
- Monitorizacion de campanas de desinformacion con audio sintetico: despliegue en lote sobre grandes volumenes de audio para priorizar la revision humana de los segmentos con menor puntuacion de bona fide.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor). EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR % en el umbral EER de DeepVoice.

| Dataset | EER % |
|---|---|
| ASVspoof2019 LA | 0,18 |
| ASVspoof2021 LA | 5,83 |
| ASVspoof2021 DF | 2,90 |
| ASVspoof5 | 23,52 |
| InTheWild | 6,41 |
| ADD22_eval_31 | 14,00 |
| ADD2023_track12_test_r1 | 26,03 |
| CFAD | 15,29 |
| CD-ADD | 30,73 |
| CVoiceFake_small | 16,48 |
| DeepVoice | 37,26 |
| LibriSeVoc | 2,69 |
| SONAR | 29,15 |
| ArAD | 26,31 |
| DECRO | 10,95 |
| J-SPAW_LA | 20,00 |
| ODSS | 25,96 |

No se han publicado en la informacion disponible resultados comparativos directos frente a los otros back-ends de la familia (DPDA-GA-AASIST, DPDA-GA-TCM) ni frente a modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,6 GB en FP32 para los 319,3 M de parametros, mas el overhead de activaciones del front-end XLS-R y del back-end Mamba; el repo ocupa 1,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas.
- Opciones de despliegue: wrapper PyTorch oficial, clase TensorRT drop-in (FP32) incluida por los autores, y exportacion manual a otros runtimes (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo indica que la version TensorRT en FP32 coincidio con PyTorch en el conjunto completo de J-SPAW_LA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | EER ASVspoof2019 LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DPDA-GA-Mamba | 319,3 M | 66.800 muestras @16 kHz | 0,18 % | MIT | HuggingFace (checkpoint `.pth`) |
| DPDA-GA-AASIST | no disponible | no disponible | no disponible | MIT (presumible, misma familia) | HuggingFace |
| DPDA-GA-TCM | no disponible | no disponible | no disponible | MIT (presumible, misma familia) | HuggingFace |
| XLSR-MamBo | no disponible | no disponible | no disponible | no disponible | Referenciado en arXiv 2601.02944 |

No se dispone en la informacion proporcionada de los resultados numericos de los back-ends alternativos de la misma familia ni de modelos externos comparables, por lo que la comparativa cuantitativa queda limitada al propio DPDA-GA-Mamba.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre ASVspoof2019 LA train: la generalizacion a dominios alejados del corpus de entrenamiento es limitada, como reflejan los EER elevados en DeepVoice (37,26 %), CD-ADD (30,73 %), SONAR (29,15 %) y ArAD (26,31 %).
- Entrada fija de 66.800 muestras: clips mas largos deben segmentarse y clips mas cortos se rellenan por repeticion, lo que puede introducir artefactos en la puntuacion.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues en el sentido habitual.
- Riesgo de falsos positivos y negativos en voces con condiciones acusticas atipicas (ruido, codecs agresivos, habla no nativa), dado el entrenamiento sobre un unico corpus.
- Sesgos potenciales derivados de la distribucion de ASVspoof2019 LA, no documentados explicitamente por los autores.
- Licencia MIT: permite uso comercial, pero el modelo se publica como artefacto de evaluacion; no se documentan garantias de robustez en produccion.
- El checkpoint es un promedio de 5 pesos; reproducir exactamente los resultados requiere usar el `main.py` de los autores y el wrapper oficial.
- No debe confundirse con XLSR-MamBo (arXiv 2601.02944), un modelo distinto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpeechAntiSpoofingBenchmarks/DPDA-GA-Mamba
- Checkpoint directo: https://huggingface.co/SpeechAntiSpoofingBenchmarks/DPDA-GA-Mamba/blob/b083ed150a0eb6c5a3dba74f38795a4531baf8bb/dpda_ga_mamba_avg5.pth
- Paper (arXiv): https://arxiv.org/abs/2509.20682
- Codigo de los autores: https://github.com/ductuantruong/dpda_ga
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del modelo en el Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=dpda-ga-mamba
