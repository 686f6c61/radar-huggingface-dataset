# SpeechAntiSpoofingBenchmarks/WeDefense-WavLM-Base-Pruned

## Resumen

WeDefense-WavLM-Base-Pruned es un sistema de deteccion de deepfakes de voz (anti-spoofing) publicado por el grupo SpeechAntiSpoofingBenchmarks como wrapper del trabajo original de Peng et al. (2025). Se trata de una adaptacion del front-end auto-supervisado WavLM Base+ (12 capas, 768 dimensiones) fine-tuneado sobre el corpus ASVspoof 5 y sometido a un proceso de poda hibrida estructurada que reduce el modelo de aproximadamente 94 M a 86,1 M de parametros fisicos. El modelo no genera texto ni audio: su unica funcion es emitir una puntuacion de verosimilitud (bona fide frente a spoof) para una forma de onda de 16 kHz.

El interes del modelo reside en su papel dentro del Speech Anti-Spoofing Arena, un banco de pruebas comparativo que evalua sistemas de deteccion de voz sintetica sobre 15 conjuntos de datos heterogeneos (ASVspoof 2019/2021/5, InTheWild, ADD22/2023, DeepVoice, SONAR, entre otros). El wrapper permite reproducir exactamente la inferencia del checkpoint original de los autores, incluyendo el apilado de las 13 representaciones ocultas, la normalizacion CMVN y el pooling atencional MHFA de 32 cabezas.

La relevancia practica del modelo es limitada pero clara: sirve como referencia reproducible para investigacion en deteccion de audio falsificado y como linea base de tamano contenido (86 M de parametros, FP32, menos de 0,5 GB de pesos) que puede desplegarse en GPU de consumo. No es un modelo de proposito general ni un detector de produccion robusto: su rendimiento cae drasticamente fuera del dominio ASVspoof 5 (EER del 4,86 % en ASVspoof5 frente a 39,76 % en CVoiceFake_small).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM Base+ (transformer convolucional-auto-supervisado) con poda estructurada hibrida y cabecera MHFA |
| Parametros totales | 86,11763 M (tras poda fisica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 600 muestras (4 s a 16 kHz); clips mas cortos se repiten hasta completar |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP32) |
| Idiomas soportados | no disponible (modelo acustico independiente del idioma) |
| Licencia | Apache 2.0 (wrapper); pesos originales no re-alojados y sin licencia concedida por los autores |
| Formato de pesos | checkpoint PyTorch (no re-alojado en este repo; sha256 documentado en `meta.yaml`) |

## Arquitectura y entrenamiento

La arquitectura parte de WavLM Base+, un encoder transformer de 12 capas y 768 dimensiones preentrenado de forma auto-supervisada sobre habla. Sobre ese front-end se aplica un esquema de poda hibrida con hard-concrete estructurado a esparsidad objetivo del 10 %: se eliminan 2 cabezas de atencion y la ultima capa FFN, y se recortan las anchuras de las convoluciones y de las FFN. Tras la poda fisica el modelo queda en 86,1 M de parametros. Las 13 representaciones ocultas (proyeccion CNN de entrada mas 12 capas, 768 dimensiones) se apilan, se normalizan con CMVN sobre el eje de caracteristicas en layout (B, D, T, L) y se agregan mediante Multi-Head Factorized Attentive Pooling (32 cabezas, compresion a 128 dimensiones, embedding de 256 dimensiones). Una capa final BatchNorm-ReLU-Linear proyecta 256 a 2 logits.

El entrenamiento se realizo sobre el split train de ASVspoof 5 con aumentacion MUSAN/RIR durante 5 epocas, promediando los dos ultimos checkpoints. No se documenta en la informacion disponible el numero exacto de tokens ni el uso de RLHF/DPO (no aplicable a una tarea de clasificacion binaria). La innovacion tecnica destacable es la combinacion de poda estructurada con atencion factorizada, que reduce el coste computacional manteniendo el rendimiento en el dominio de entrenamiento.

## Capacidades

- Deteccion binaria de audio sintetico (spoof) frente a habla genuina (bona fide) mediante score = logit[bonafide] - logit[spoof].
- Entrada exclusiva de forma de onda mono a 16 kHz en FP32, sin normalizacion previa.
- Procesamiento de utterances completas con ventana efectiva de 4 s (64 600 muestras); clips mas cortos se repiten por padding.
- Evaluacion reproducible en 15 conjuntos del Speech Anti-Spoofing Arena.
- Compatible con wrapper PyTorch y con implementacion drop-in TensorRT (FP32) para despliegue de baja latencia.
- No soporta generacion de texto, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Investigacion en anti-spoofing: replicar los resultados publicados de Peng et al. (2025) sobre ASVspoof 5 y comparar variantes de poda con la misma cabecera MHFA.
- Linea base en el Speech Anti-Spoofing Arena: usar el wrapper para obtener puntuaciones comparables con otros sistemas del ranking en los 15 datasets del benchmark.
- Filtrado de datasets de habla: descartar muestras sinteticas de corpus recolectados en campo antes de entrenar modelos ASR o TTS, aprovechando el bajo EER de 4,86 % en ASVspoof5.
- Verificacion de autenticidad en pipelines de locucion: pre-filtrar audios de narracion o doblaje para detectar voces clonadas antes de la revision humana.
- Prototipado en GPU de consumo: desplegar el modelo en FP32 con TensorRT en tarjetas tipo RTX 4070 Ti SUPER o RTX 5060 Ti, donde los autores validaron equivalencia numerica con PyTorch.
- Analisis forense de audio: generar puntuaciones de verosimilitud como evidencia auxiliar en investigaciones sobre manipulacion vocal, siempre con revision pericial.
- Evaluacion de robustez cross-domain: medir la degradacion del detector en dominios alejados del entrenamiento (SONAR, DECRO, CVoiceFake) para estudiar sesgos de dominio.

## Benchmarks y rendimiento

EER % (menor es mejor). EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR % al umbral EER de DeepVoice.

| Dataset | EER % |
|---|---|
| ASVspoof5 | 4,86 |
| CD-ADD | 5,14 |
| InTheWild | 15,01 |
| ASVspoof2021_DF | 15,55 |
| ASVspoof2019_LA | 17,83 |
| DeepVoice | 19,11 |
| ArAD | 22,36 |
| ASVspoof2021_LA | 23,49 |
| ADD22_eval_31 | 24,77 |
| ADD2023_track12_test_r1 | 31,30 |
| CFAD | 32,47 |
| LibriSeVoc | 33,21 |
| SONAR | 38,95 |
| CVoiceFake_small | 39,76 |
| DECRO | 40,58 |

No se dispone de comparativas directas con otros sistemas del Arena en la informacion proporcionada; las puntuaciones por dataset estan en `.eval_results/` del repositorio.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB en FP32 para los pesos (86 M parametros); el grueso del consumo proviene de activaciones y buffers de audio, tipicamente 1-2 GB en lotes pequenos.
- GPU validadas por los autores: RTX 4070 Ti SUPER y RTX 5060 Ti (FP32 con TensorRT), con equivalencia numerica verificada frente a PyTorch en el conjunto completo J-SPAW_LA.
- Cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM, incluidas GTX 1660, RTX 3060, RTX 4060.
- Opciones de despliegue: PyTorch nativo, TensorRT drop-in (clase proporcionada por el wrapper), ONNX Runtime previa exportacion manual. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador acustico).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | EER ASVspoof5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeDefense-WavLM-Base-Pruned | 86,1 M | 4 s (64 600 muestras) | 4,86 % | Apache 2.0 (wrapper); pesos sin licencia | Wrapper en HF; pesos en JYP2024 |
| WavLM Base+ sin poda (referencia de front-end) | ~94 M | 4 s | no disponible | MIT (upstream) | HF (microsoft/wavlm-base-plus) |
| AASIST (linea base clasica ASVspoof) | ~0,3 M | variable | no disponible | no disponible | GitHub autores |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Los pesos originales no estan re-alojados en este repositorio y los autores no conceden licencia explicita para ellos; el uso comercial requiere contactar con los autores del checkpoint original.
- El modelo esta entrenado exclusivamente sobre ASVspoof 5; el rendimiento decae drasticamente fuera de dominio (EER superior al 30 % en CFAD, LibriSeVoc, SONAR, CVoiceFake_small y DECRO).
- No se documentan sesgos demograficos, linguisticos o de canal; al ser un detector acustico, es probable que hereda sesgos del corpus ASVspoof 5 (principalmente ingles y condiciones controladas).
- Riesgo de falsos negativos ante ataques de sintesis no representados en ASVspoof 5 (codecs, reverberacion severa, voces clonadas zero-shot de modelos recientes).
- Riesgo de falsos positivos en habla genuina con ruido extremo o canales telefonicos, dado que la aumentacion de entrenamiento se limita a MUSAN/RIR.
- La ventana efectiva de 4 s y el repeat-padding de clips cortos pueden distorsionar puntuaciones en utterances muy breves.
- No apto como unico mecanismo de autenticacion: debe combinarse con verificacion biomedica y revision humana en produccion.
- El wrapper no expone calibracion probabilistica; los scores son diferencias de logits y requieren umbral especifico por dominio.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/WeDefense-WavLM-Base-Pruned
- Paper: https://arxiv.org/abs/2508.16232
- Codigo de los autores: https://github.com/zlin0/wedefense/tree/e7287fe125cefc4903ff6614afcaa6ae53842b19/egs/detection/asvspoof5/v15_ssl_mhfa_pruning
- Checkpoint original: https://huggingface.co/JYP2024/Wedefense_ASV2025_WavLM_Base_Pruning/tree/6993dddafbbef22ca2c24bcd98ea5dab0112d9f5
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
