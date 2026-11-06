# SpeechAntiSpoofingBenchmarks/Fake-Mamba

## Resumen

Fake-Mamba es un sistema de deteccion de audio falsificado (anti-spoofing) para voz, presentado por Xuan et al. en IEEE ASRU 2025. Sustituye el mecanismo de self-attention de los transformers por bloques PN-BiMamba (Mamba bidireccional con pre-norm), sobre un front-end wav2vec 2.0 XLS-R 300M afinado completamente. El modelo resuelve la clasificacion binaria entre voz bona fide y voz sintetica o convertida, un problema central en la verificacion de locutor y en la deteccion de deepfakes de audio.

El repositorio de Hugging Face no es una publicacion original del modelo, sino un wrapper de inferencia empaquetado por el proyecto Speech Anti-Spoofing Arena para reproducir los resultados del paper en un banco de pruebas comun. Los pesos no se rehostean: el wrapper descarga los ficheros originales desde el repositorio del autor, ya que ni el codigo ni los pesos upstream llevan licencia declarada. El checkpoint empaquetado es Exp65 (12 bloques PN-BiMamba), no la configuracion de 7 bloques descrita en el paper.

Con 321,29 M de parametros y FP32, el modelo procesa ventanas deterministas de los primeros 66.800 muestras a 16 kHz, con repeat-padding para clips mas cortos. Su relevancia actual radica en dos frentes: demostrar que los bloques SSM (Mamba) son una alternativa viable a la atencion en anti-spoofing, y ofrecer una referencia reproducible con evaluacion cruzada en 17 conjuntos de datos dentro del arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R 300M (ultima capa transformer, afinada) + proyeccion 144-d (BatchNorm + SELU) + bloques PN-BiMamba + attention pooling + cabeza lineal de 2 clases |
| Parametros totales | 321,2901 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 66.800 muestras a 16 kHz (aprox. 4,175 s por ventana) |
| Tipos de cuantizacion | no disponible (solo FP32 documentado; existe clase TensorRT drop-in en FP32) |
| Idiomas soportados | no disponible (modelo acustico dependiente del front-end XLS-R, multilingue por herencia, sin lista declarada) |
| Licencia | other (upstream sin licencia; pesos enlazados, no rehosteados) |
| Formato de pesos | no disponible (checkpoint PyTorch descargado desde el repositorio del autor) |

## Arquitectura y entrenamiento

El pipeline parte de un front-end wav2vec 2.0 XLS-R de 300M parametros afinado por completo, del que se toma la salida de la ultima capa transformer. Esa representacion se proyecta a 144 dimensiones mediante BatchNorm y SELU. Sobre esa secuencia se apilan bloques PN-BiMamba: un unico Mamba compartido escanea la secuencia en sentido directo y en sentido temporal invertido, las salidas se suman y pasan por una feed-forward con LayerNorm y GELU mas conexion residual, todo con pre-norm. La agregacion temporal se realiza con attention pooling y la clasificacion final con una cabeza lineal de dos clases (spoof / bona fide). La puntuacion de bona fide es `logits[:, 1]`.

El entrenamiento se realizo exclusivamente sobre el split de train de ASVspoof2019 LA, con aumento de datos RawBoost. El checkpoint empaquetado corresponde a la release Exp65 del autor (12 bloques PN-BiMamba, frente a los 7 del paper) y es la media de los 5 mejores checkpoints tal como la calcula su script de evaluacion: `(2*best_1 + best_2 + best_3 + best_4)/5`, con un bug de aliasing en el state_dict que descarta best_0. Esta media reproduce las puntuaciones del autor en In-the-Wild (r = 0,99996; EER 5,83 % frente al 5,85 % reportado). No se documentan fases de RLHF ni DPO, al tratarse de una tarea de clasificacion supervisada. La innovacion tecnica principal es el uso de SSM bidireccional en lugar de self-attention para modelar dependencias temporales en audio.

## Capacidades

- Deteccion binaria de voz falsificada: clasifica una ventana de audio de 16 kHz como bona fide o spoof.
- Puntuacion continua: `logits[:, 1]` permite umbralizar segun la tasa de falsos positivos objetivo.
- Procesamiento determinista: ventana fija de las primeras 66.800 muestras, con repeat-padding para clips mas cortos.
- Generalizacion cruzada: evaluado en 17 conjuntos (ASVspoof2019/2021/5, In-the-Wild, ADD22/2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO, J-SPAW_LA, EmoSpoofTTS, LRLspoof).
- Inferencia en PyTorch y en TensorRT (clase drop-in FP32, validada contra PyTorch en el conjunto completo J-SPAW_LA).
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo: es un clasificador acustico puro.
- No dispone de modo thinking ni capacidades multilingues declaradas mas alla del front-end XLS-R.

## Casos de uso

- Verificacion de locutor en produccion: como modulo de deteccion de replay y sintesis previo a un sistema de autenticacion por voz, con umbral calibrado sobre la curva EER del dominio objetivo.
- Moderacion de contenido en plataformas de audio: filtrado de clips generados por TTS o voice conversion antes de su publicacion, usando la puntuacion continua para priorizar revision humana.
- Analisis forense de grabaciones: apoyo a peritos que necesitan una senal objetiva de manipulacion, complementada con metadatos y analisis espectral.
- Investigacion en anti-spoofing: linea base reproducible para comparar nuevas arquitecturas SSM frente a transformers dentro del Speech Anti-Spoofing Arena.
- Deteccion de deepfakes en llamadas: integracion en pasarelas telefonicas para marcar llamadas con voz sintetica, con la ventana de 4,175 s como unidad de decision.
- Evaluacion de sistemas TTS: uso como discriminador en pipelines de control de calidad que miden la naturalidad y la detectabilidad de un generador de voz.
- Benchmarking de robustez: prueba de generalizacion de detectores ante dominios no vistos (codecs, idiomas de bajos recursos, emociones) gracias a la bateria de 17 conjuntos del arena.

## Benchmarks y rendimiento

EER % (menor es mejor). EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR % en el umbral EER de DeepVoice del modelo.

| Conjunto de evaluacion | EER % |
|---|---|
| ASVspoof2019_LA | 0,16 |
| ASVspoof2021_LA | 4,90 |
| ASVspoof2021_DF | 3,58 |
| ASVspoof5 | 15,47 |
| In-the-Wild | 5,83 |
| ADD22_eval_31 | 20,32 |
| ADD2023_track12_test_r1 | 24,63 |
| CFAD | 17,94 |
| CD-ADD | 23,99 |
| CVoiceFake_small | 16,36 |
| DeepVoice | 31,05 |
| LibriSeVoc | 6,25 |
| SONAR | 42,71 |
| ArAD | 22,73 |
| DECRO | 12,97 |
| J-SPAW_LA | 15,97 |

No se han publicado en la informacion disponible resultados comparativos frente a otros sistemas del arena ni metricas adicionales (t-DCF, AUC).

## Requisitos de hardware

- VRAM estimada: en FP32, 321,29 M de parametros ocupan aproximadamente 1,29 GB solo en pesos; con activaciones y el front-end XLS-R, el consumo realista ronda 2-4 GB en inferencia por lote pequeno (estimacion, no documentada).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; A100, H100, L4 o RTX 4090 para mayor throughput en lotes.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes con 6 GB o mas.
- Despliegue: PyTorch nativo y clase TensorRT drop-in en FP32 validada contra PyTorch; no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: repositorio de 0,1 GB; los pesos se descargan desde el repositorio del autor.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros sistemas del Speech Anti-Spoofing Arena ni de especificaciones de alternativas comparables (por ejemplo, AASIST, RawNet2 o variantes basadas en wav2vec 2.0). Por tanto, la comparativa cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto | EER ASVspoof2019_LA | Licencia |
|---|---|---|---|---|
| Fake-Mamba (Exp65) | 321,29 M | 66.800 muestras | 0,16 % | other (sin licencia upstream) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado solo con ASVspoof2019 LA train: la generalizacion a dominios alejados del entrenamiento es limitada, con EER de hasta 42,71 % en SONAR y 31,05 % en DeepVoice.
- Ventana fija de 66.800 muestras: los clips mas largos se truncan y los mas cortos se repiten con padding, lo que puede alterar la decision en audios de duracion muy distinta.
- Sesgos conocidos: no documentados; al entrenar con un unico corpus en ingles y con condiciones acusticas concretas, es esperable un sesgo hacia esos canales, codecs y tipos de ataque.
- Riesgo de falsos negativos ante ataques no representados en ASVspoof2019 LA (nuevos vocoders, voice conversion zero-shot, codecs modernos).
- Licencia: ni el codigo ni los pesos upstream llevan licencia declarada; el uso comercial queda en un limbo legal y requiere contactar con los autores.
- Los pesos no se rehostean: la reproducibilidad depende de que el repositorio del autor siga disponible en el commit fijado.
- El checkpoint empaquetado (12 bloques) no coincide con la configuracion de 7 bloques del paper, y la media de checkpoints tiene un bug de aliasing que descarta best_0; los resultados deben interpretarse como la release Exp65, no como la del paper.
- Solo se documenta FP32; no hay cuantizaciones validadas ni perfiles de latencia para produccion.
- No es un modelo generativo: no admite instrucciones en lenguaje natural ni tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Fake-Mamba
- Paper (arXiv): https://arxiv.org/abs/2508.09294
- Codigo del autor: https://github.com/xuanxixi/Fake-Mamba
- Pesos upstream (commit fijado): https://huggingface.co/xxuan-speech/fake-mamba-models/tree/cd99e0efb4d4f3f6dfe610ae8e27de9a73d6bf41/models/Exp65/best
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en el arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=fake-mamba
