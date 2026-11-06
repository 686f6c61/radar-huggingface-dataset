# SpeechAntiSpoofingBenchmarks/DPDA-GA-AASIST

## Resumen

DPDA-GA-AASIST es un sistema de deteccion de audio sintetico (anti-spoofing) disenado para distinguir voz real de voz generada por TTS o clonacion de voz. Lo desarrolla el grupo de Truong et al. y se publica en ICASSP 2026 bajo el marco DPDA-GA (dual-path data-augmented training with gradient alignment). El modelo combina un front-end wav2vec 2.0 XLS-R de 300M parametros totalmente ajustado con un back-end AASIST basado en graph attention espectral-temporal, sumando 317,8M parametros en total. Resuelve el problema de la deteccion de deepfakes de voz en escenarios de generalizacion cruzada entre corpus.

La relevancia actual del modelo radica en su estrategia de entrenamiento: cada utterance se procesa como una vista limpia y una vista aumentada con RawBoost, y los gradientes de ambas vistas se alinean mediante PCGrad antes de la actualizacion, proyectando fuera las componentes conflictivas. Esto produce un detector mas robusto frente a condiciones acusticas no vistas, un problema central en anti-spoofing, donde los modelos suelen degradarse drasticamente al cambiar de dataset.

El checkpoint publicado es la media de 5 checkpoints del autor, calculada exactamente como en su `main.py` con la formula `(2*best_1 + best_2 + best_3 + best_4)/5`, que reproduce los numeros del paper pese a un bug de aliasing en el `state_dict` que descarta `best_0` y cuenta `best_1` dos veces. Se distribuye empaquetado para la Speech Anti-Spoofing Arena, con pesos FP32 y una ventana de inferencia determinista de los primeros 66.800 muestras a 16 kHz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R 300M (front-end) + AASIST spectro-temporal graph-attention (back-end) |
| Parametros totales | 317,8378 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 66.800 muestras a 16 kHz (aprox. 4,175 s); clips mas cortos se rellenan por repeticion |
| Tipos de cuantizacion | no disponible; pesos publicados en FP32 |
| Idiomas soportados | no disponible (XLS-R es multilingue, pero la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch state_dict); repo de 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. El front-end es wav2vec 2.0 XLS-R de 300M parametros, ajustado completamente (no congelado), que extrae representaciones acusticas del audio de entrada. El back-end es AASIST, un clasificador basado en graph attention que opera sobre representaciones espectrales y temporales para producir dos logits (spoof vs. bona fide). La puntuacion de decision es `logits[:, 1]`, donde valores mas altos indican voz bona fide.

El entrenamiento sigue el esquema DPDA-GA: cada utterance se presenta en dos vistas, una limpia y otra aumentada con RawBoost, y los gradientes de ambas se alinean mediante PCGrad, que proyecta fuera las componentes conflictivas antes del paso de optimizacion. El modelo se entrena exclusivamente con el split de entrenamiento de ASVspoof2019 LA. Los pesos publicados son la media de 5 checkpoints del autor, con la formula exacta `(2*best_1 + best_2 + best_3 + best_4)/5` descrita en la model card. El autor publica tres back-ends bajo el mismo marco (AASIST, TCM y Mamba); esta ficha corresponde al de AASIST.

## Capacidades

- Deteccion binaria de voz sintetica frente a voz real (anti-spoofing / deepfake detection).
- Puntuacion continua de autenticidad mediante `logits[:, 1]` (mayor = bona fide), util para umbralizar por caso de uso.
- Procesamiento de audio a 16 kHz con ventana fija de 66.800 muestras y relleno por repeticion para clips mas cortos.
- Inferencia determinista en FP32.
- Evaluacion cruzada en multiples corpus (ASVspoof2019/2021/5, InTheWild, ADD22, ADD2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO, J-SPAW, ODSS, EmoSpoofTTS, LRLspoof), lo que evidencia capacidad de generalizacion entre dominios.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un clasificador de audio, no un modelo generativo.
- Capacidades multilingues: no declaradas en la model card, aunque el front-end XLS-R es multilingue por construccion.

## Casos de uso

- Verificacion de autenticidad en llamadas de atencion al cliente: el modelo puntua cada segmento de audio entrante y permite marcar llamadas con voz clonada antes de autorizar operaciones sensibles, usando `logits[:, 1]` con un umbral calibrado por el operador.
- Moderacion de contenido en plataformas de audio: integrado en un pipeline de ingesta, filtra clips generados por TTS o clonacion antes de su publicacion, apoyandose en su EER de 0,16% en ASVspoof2019 LA para el dominio de entrenamiento.
- Deteccion de fraude en banca y seguros: como capa adicional en sistemas de autenticacion por voz, comparando la puntuacion del modelo con umbrales por canal y dispositivo.
- Analisis forense de grabaciones: los peritos pueden usar la puntuacion continua como evidencia complementaria, junto con el informe de EER por corpus de la Arena para contextualizar la fiabilidad segun el tipo de audio.
- Evaluacion de sistemas TTS y de clonacion: los desarrolladores de sintesis de voz pueden usar el modelo como discriminador automatico para medir la naturalidad y detectabilidad de sus salidas.
- Investigacion en anti-spoofing: sirve como baseline reproducible del marco DPDA-GA para comparar tecnicas de aumento de datos y alineacion de gradientes frente a otros back-ends (TCM, Mamba).
- Despliegue en produccion con TensorRT: la model card menciona una clase drop-in en TensorRT (FP32) que iguala a PyTorch en el conjunto completo de J-SPAW_LA, adecuada para inferencia de baja latencia en servidores.

## Benchmarks y rendimiento

Resultados de EER% (menor es mejor) publicados en la model card. EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR% con el umbral EER de DeepVoice.

| Dataset | EER% |
|---|---|
| ASVspoof2019_LA | 0,16 |
| ASVspoof2021_LA | 5,19 |
| ASVspoof2021_DF | 3,05 |
| ASVspoof5 | 18,49 |
| InTheWild | 5,41 |
| ADD22_eval_31 | 13,57 |
| ADD2023_track12_test_r1 | 22,2 |
| CFAD | 15,28 |
| CD-ADD | 28,48 |
| CVoiceFake_small | 15,73 |
| DeepVoice | 35,82 |
| LibriSeVoc | 2,65 |
| SONAR | 39,43 |
| ArAD | 25,63 |
| DECRO | 12,78 |
| J-SPAW_LA | 13,65 |
| ODSS | 25,26 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (317,8M x 4 bytes), mas activaciones y buffers de audio; en la practica, alrededor de 2-3 GB con overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; A100, H100, L40S o RTX 4090 sobran para inferencia por lotes.
- Cabe en GPU de consumo: si, en GTX 1660, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: PyTorch nativo (wrapper de la Arena) y clase drop-in de TensorRT en FP32 documentada por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card no incluye comparaciones numericas con otros sistemas. Se comparan los tres back-ends del mismo marco DPDA-GA segun la informacion disponible.

| Modelo | Parametros | Contexto | EER ASVspoof2019_LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DPDA-GA-AASIST | 317,8 M | 66.800 muestras @16 kHz | 0,16% | MIT | Hugging Face |
| DPDA-GA-TCM | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |
| DPDA-GA-Mamba | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |

No se dispone de datos de benchmarks de los back-ends TCM y Mamba en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con ASVspoof2019 LA train: el rendimiento cae notablemente en corpus fuera de dominio (SONAR 39,43%, DeepVoice 35,82%, CD-ADD 28,48%), por lo que no debe asumirse una generalizacion uniforme.
- La ventana de inferencia es fija (primeras 66.800 muestras); audio mas largo que esa duracion se trunca y audio mas corto se rellena por repeticion, lo que puede introducir artefactos en clips muy breves.
- Riesgo de falsos negativos ante ataques de spoofing no representados en el conjunto de entrenamiento (nuevos vocoders, ataques parciales, canales adversarios).
- Sesgos por idioma, canal y dominio no documentados en la model card; XLS-R es multilingue, pero no se declaran idiomas ni evaluaciones por idioma.
- El checkpoint contiene un bug de aliasing conocido en el `state_dict` (se descarta `best_0` y se cuenta `best_1` dos veces); los pesos publicados son los que respaldan los numeros del paper, pero conviene tenerlo en cuenta al reproducir.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni mantenimiento declarado.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento; su unico proposito es la clasificacion de autenticidad de audio.
- La puntuacion es un logit sin calibracion probabilistica declarada; el umbral debe ajustarse por caso de uso.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/DPDA-GA-AASIST
- Checkpoint fijado por commit: https://huggingface.co/SpeechAntiSpoofingBenchmarks/DPDA-GA-AASIST/blob/f4b395c946eee1d28be9974cfb10da5a0e08ed61/dpda_ga_aasist_avg5.pth
- Paper (arXiv): https://arxiv.org/abs/2509.20682
- Codigo de los autores: https://github.com/ductuantruong/dpda_ga
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=dpda-ga-aasist
