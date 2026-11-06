# SpeechAntiSpoofingBenchmarks/XLSR-Conformer-TCM-DF

## Resumen

XLSR-Conformer-TCM-DF es un clasificador binario de deteccion de voz sintetica (anti-spoofing) empaquetado por el proyecto SpeechAntiSpoofingBenchmarks para su banco de pruebas Speech Anti-Spoofing Arena. El modelo subyacente procede del trabajo de Truong et al. presentado en Interspeech 2024 y combina un front-end wav2vec 2.0 XLS-R de 300 M de parametros, afinado completamente, con cuatro bloques Conformer que incorporan el modulo Temporal-Channel Modeling (TCM) en su atencion multi-cabeza. La variante DF (deepfake) esta entrenada con el protocolo de ruido aditivo estacionario e independiente de la senal del conjunto ASVspoof2019 LA train mediante RawBoost.

El modelo resuelve una tarea concreta: asignar una puntuacion de verosimilitud (mayor = bona fide) a un fragmento de audio para discriminar voz real de voz generada o convertida. No es un modelo generativo ni un LLM: es un detector acustico de 321,2 M de parametros (321.215.526 segun safetensors) que opera sobre ventanas deterministas de 66.800 muestras y devuelve una decision de dos clases. Su relevancia actual radica en la explosion de voces sinteticas de alta calidad y en la necesidad de filtros automaticos para verificacion de locutor, moderacion de contenido y forensica de audio.

El empaquetado anade valor practico: un wrapper PyTorch reproducible con pesos en safetensors, evaluacion estandarizada sobre 17 conjuntos de datos (ASVspoof2019 LA, ASVspoof2021 LA/DF, ASVspoof5, InTheWild, ADD22, ADD2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO, J-SPAW_LA, EmoSpoofTTS y LRLspoof) y una clase equivalente en TensorRT para despliegue de baja latencia. La licencia MIT facilita su integracion comercial, algo poco habitual en este nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R 300M (front-end) + 4 bloques Conformer con TCM + cabeza lineal de 2 clases |
| Parametros totales | 321.215.526 (321,21 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 66.800 muestras de audio (clips mas cortos se repiten en bucle); sin contexto textual |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; el autor menciona despliegue TensorRT FP32) |
| Idiomas soportados | no disponible (el front-end XLS-R es multilingue por preentrenamiento, pero la evaluacion es acustica, no linguistica) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch); clase TensorRT disponible segun la model card |

## Arquitectura y entrenamiento

La arquitectura encadena un extractor de caracteristicas XLS-R 300M completamente afinado, cuya salida se proyecta a 144 dimensiones mediante Linear + BatchNorm + SELU. Sobre esa secuencia se apilan cuatro bloques Conformer; en la atencion multi-cabeza de cada bloque se inserta el modulo TCM (Temporal-Channel Modeling), que introduce tokens por cabeza y por canal, enriquece el token de clasificacion con la media temporal y la media de cabezas, y emplea convolucion depthwise con kernel 31 sobre cuatro cabezas. Un token de clase alimenta finalmente una cabeza lineal de dos salidas (bona fide / spoof).

El entrenamiento se realizo exclusivamente sobre ASVspoof2019 LA train con el aumento de datos RawBoost en la configuracion del track DF (ruido aditivo estacionario e independiente de la senal). El checkpoint publicado corresponde a `avg_5_best.pth`, la media de los cinco mejores checkpoints de validacion calculada por los propios autores con su `main.py`, sin modificaciones. No se documentan fases de RLHF ni DPO, logicas en un clasificador discriminativo. La innovacion tecnica destacable es el modulo TCM, que modela conjuntamente dependencias temporales y de canal dentro de la atencion, y el empaquetado determinista de la ventana de inferencia, que garantiza reproducibilidad entre ejecuciones.

## Capacidades

- Deteccion binaria de voz sintetica frente a voz genuina, con puntuacion continua (mayor = bona fide).
- Analisis de audio crudo a 16 kHz mediante front-end auto-supervisado XLS-R, sin necesidad de transcripcion ni features manuales.
- Evaluacion sobre multiples dominios de spoofing: TTS, voice conversion, deepfakes y ataques adversariales, segun los conjuntos del Arena.
- Ventana de inferencia determinista de 66.800 muestras con repeticion en bucle para clips mas cortos, lo que permite procesar audios de duracion arbitraria por segmentacion.
- Wrapper PyTorch listo para uso y clase TensorRT equivalente para despliegue en produccion con FP32.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador acustico puro.
- Capacidades multilingues no evaluadas explicitamente; el front-end XLS-R tiene preentrenamiento multilingue, pero el modelo se entrena y evalua como detector acustico independiente del idioma.

## Casos de uso

- Verificacion de locutor en banca y telco: el detector se situa como etapa previa al sistema de reconocimiento de locutor para rechazar audios sinteticos; su EER de 0,15 % en ASVspoof2019 LA y 6,94 % en ASVspoof2021 LA lo hace adecuado como filtro de primera linea en canal telefonico.
- Moderacion de contenido en plataformas de audio: procesar fragmentos de 66.800 muestras en streaming y marcar clips con alta probabilidad de spoof antes de su publicacion, con la ventaja de una licencia MIT que permite integracion comercial sin friccion legal.
- Forensica de audio y peritaje: generar una puntuacion objetiva y reproducible (ventana determinista) que sirva como evidencia auxiliar en investigaciones de fraude por voz clonada.
- Proteccion de sistemas de autenticacion por voz: complementar el clasificador del sistema con esta senal anti-spoofing, especialmente en despliegues donde el atacante puede sintetizar voz con TTS de ultima generacion.
- Investigacion en deteccion de deepfakes: usar el modelo como baseline del Arena y comparar arquitecturas (XLSR-Conformer-TCM frente a otros wrappers) sobre los 17 conjuntos publicados, con resultados por dataset en `.eval_results/`.
- Despliegue en edge con TensorRT: la clase TensorRT FP32 permite ejecutar el detector en GPUs de consumo (RTX 4070 Ti SUPER, RTX 5060 Ti segun la model card) con latencia baja para aplicaciones de call center en tiempo real.
- Monitorizacion de calidad en pipelines de sintesis de voz: detectar si un TTS propio genera muestras demasiado facilmente identificables como sinteticas y ajustar el modelo generativo en consecuencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor; EmoSpoofTTS y LRLspoof usan 1-SRR % en el umbral EER de DeepVoice):

| Conjunto de evaluacion | EER % |
|---|---|
| ASVspoof2019_LA | 0,15 |
| ASVspoof2021_LA | 6,94 |
| ASVspoof2021_DF | 3,51 |
| ASVspoof5 | 18,76 |
| InTheWild | 7,85 |
| ADD22_eval_31 | 20,02 |
| ADD2023_track12_test_r1 | 23,43 |
| CFAD | 15,09 |
| CD-ADD | 14,41 |
| CVoiceFake_small | 11,01 |
| DeepVoice | 29,14 |
| LibriSeVoc | 2,27 |
| SONAR | 26,40 |
| ArAD | 31,89 |
| DECRO | 11,89 |
| J-SPAW_LA | 11,52 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en los conjuntos del Arena mas alla de las cifras absolutas; el ranking y el tier se consultan dinamicamente en los badges del espacio de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (321 M de parametros), mas activaciones y buffers de audio; en la practica cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: RTX 4070 Ti SUPER y RTX 5060 Ti son las empleadas por los autores para la evaluacion TensorRT FP32; A100, H100 y RTX 4090 ofrecen margen sobrado para lotes grandes.
- Cabe en GPU de consumo: si, en cualquier GPU moderna con al menos 4 GB de VRAM; tambien es viable en CPU para inferencia por lotes no interactiva.
- Opciones de despliegue: PyTorch nativo (wrapper del Arena), TensorRT (clase drop-in incluida por el autor) y exportacion a ONNX como via adicional no documentada. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles de forma numerica; la model card solo indica que la clase TensorRT FP32 en RTX 4070 Ti SUPER y RTX 5060 Ti coincidio con PyTorch en el conjunto completo J-SPAW_LA, lo que sugiere una latencia por ventana del orden de milisegundos en esas GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLSR-Conformer-TCM-DF | 321,21 M | 66.800 muestras | XLS-R + Conformer + TCM, entrenado en ASVspoof2019 LA (RawBoost DF) | MIT | Hugging Face (safetensors, TensorRT) |
| AASIST | no disponible en la informacion | no disponible | Deteccion anti-spoofing basada en grafos atencionales | no disponible | codigo abierto en repositorios academicos |
| RawNet2 | no disponible en la informacion | no disponible | Red neuronal cruda sobre audio | no disponible | codigo abierto |
| Wav2Vec2-AASIST | no disponible en la informacion | no disponible | Front-end wav2vec 2.0 + AASIST | no disponible | codigo abierto |

La comparacion cuantitativa con estas alternativas no esta disponible en la informacion proporcionada; el Arena de SpeechAntiSpoofingBenchmarks mantiene rankings publicos que permiten contrastar el tier y la posicion del modelo frente a otros wrappers evaluados sobre los mismos conjuntos.

## Limitaciones y advertencias

- Entrenado exclusivamente en ASVspoof2019 LA train: la generalizacion a dominios alejados del entrenamiento es limitada, como reflejan los EER de 29,14 % en DeepVoice, 31,89 % en ArAD y 26,40 % en SONAR.
- El EER de 0,15 % en ASVspoof2019 LA no debe interpretarse como rendimiento en produccion: es el conjunto de entrenamiento y esta fuertemente sobreajustado.
- Ventana fija de 66.800 muestras con repeticion en bucle: audios mas cortos se replican, lo que puede introducir artefactos de periodicidad y afectar a la calibracion en clips muy breves.
- Score no calibrado entre dominios: el umbral EER de DeepVoice se usa para normalizar EmoSpoofTTS y LRLspoof, lo que implica que la puntuacion absoluta no es directamente comparable entre conjuntos.
- Riesgo de falsos positivos en voces con procesado agresivo (codecs de baja tasa, reverberacion, ruido no estacionario), no cuantificado en la informacion disponible.
- No es un modelo generativo: no admite prompts, tool calling ni razonamiento; cualquier uso fuera de la clasificacion binaria de audio requiere desarrollo adicional.
- Sesgos demograficos, de acento o de idioma no documentados en la model card; el front-end XLS-R es multilingue pero el detector no se ha evaluado por subgrupos.
- Licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias y el autor original no ofrece soporte de produccion; conviene validar sobre el dominio objetivo antes de desplegar.
- La fecha de creacion del repositorio (2026-11-01) y la actividad reciente (38 commits) indican un empaquetado en evolucion; fijar el commit del checkpoint (`6638adede36355501770785711f0db30f8189d9f`) para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-Conformer-TCM-DF
- Archivos del repositorio: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-Conformer-TCM-DF/tree/main
- Checkpoint fijado por commit: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-Conformer-TCM-DF/blob/6638adede36355501770785711f0db30f8189d9f/model.safetensors
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del modelo en el Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=xlsr-conformer-tcm-df
- Codigo de los autores: https://github.com/ductuantruong/tcm_add
- Paper (Interspeech 2024): https://www.isca-archive.org/interspeech_2024/truong24b_interspeech.html
