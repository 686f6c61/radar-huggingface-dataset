# SpeechAntiSpoofingBenchmarks/NII-SLT26-Qwen2Audio-Gen

## Resumen

NII-SLT26-Qwen2Audio-Gen es un adaptador LoRA empaquetado para la Speech Anti-Spoofing Arena, derivado del estudio "What Do Deepfake Audio Detectors Hear?" (Ge, Wang, Yamagishi) presentado en NII SLT 2026. Se construye sobre Qwen2-Audio-7B-Instruct y se entrena para una tarea binaria muy concreta: escuchar una grabacion y responder con la palabra "real" o "fake" segun si el audio es autentico o ha sido generado o manipulado. No es un modelo de proposito general, sino un detector de deepfakes de audio reempaquetado por el equipo de benchmarks para su evaluacion estandarizada.

El modelo aplica LoRA (r=16, alpha=32) sobre las proyecciones q/v de las 32 capas del codificador de audio y de las 32 capas de atencion del LLM, entrenando de forma generativa sobre CompSpoof V2, un corpus que mezcla habla con sonidos ambientales y en el que cualquier componente falsa convierte la muestra en "fake". La puntuacion de deteccion se obtiene como la diferencia de logits entre el primer token de respuesta "real" y "fake" (cabeza verbalizadora), de modo que valores mas altos indican mayor probabilidad de audio bona fide.

Su relevancia actual radica en que ejemplifica el uso de modelos de audio-LLM como detectores de deepfakes, una linea de investigacion activa ante la proliferacion de voz sintetica. El repositorio incluye los pesos del adaptador, resultados de la Arena por dataset y el codigo de evaluacion, lo que facilita la reproducibilidad. El tamano total del modelo es de aproximadamente 8,4 mil millones de parametros y la licencia es CC BY-NC 4.0, restringida a uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM (Qwen2-Audio-7B-Instruct) con adaptador LoRA fusionado en carga |
| Parametros totales | 8397,09 M (aprox. 8,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio limitada a los primeros 4 s, 64600 muestras) |
| Tipos de cuantizacion | no disponible (pesos en BF16; logits de respuesta en FP32) |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 |
| Formato de pesos | safetensors (adapter.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2-Audio-7B-Instruct, un audio-LLM que combina un codificador de audio con un transformer de lenguaje. Sobre esta base se entrena un adaptador LoRA de rango 16 y alpha 32 aplicado a las proyecciones q/v de las 32 capas del codificador de audio y de las 32 capas de atencion del LLM. El adaptador se fusiona en los pesos en el momento de la carga, de modo que la inferencia se realiza sobre el modelo completo en BF16, repartido en dos GPU, con los dos logits de respuesta calculados en FP32.

El entrenamiento es generativo y se realiza sobre CompSpoof V2, que combina habla bona fide (CommonVoice, LibriTTS y english-conversation-corpus) mezclada con sonidos ambientales, junto con fuentes de habla falsa que incluyen ASVspoof 5, SONAR, CD-ADD, LibriSeVoc y MLAAD. La regla de etiquetado es que cualquier componente falsa en la mezcla convierte la muestra en "fake". El modelo aprende a responder al prompt de chat "Listen carefully to this recording ... Classify as either real or fake." con la palabra real o fake. La puntuacion de deteccion se calcula como logit("real") - logit("fake") del primer token de respuesta. La entrada se limita a los primeros 4 segundos de audio, sin repeticion por tiling.

## Capacidades

- Clasificacion binaria de audio como bona fide o fake (deteccion de deepfakes de voz).
- Deteccion sobre mezclas de habla y sonido ambiental, segun el entrenamiento en CompSpoof V2.
- Puntuacion continua mediante cabeza verbalizadora (diferencia de logits real/fake) para umbralizar segun la aplicacion.
- Procesamiento de audio de hasta 4 segundos por muestra (64600 muestras).
- No se documentan capacidades de generacion de texto general, razonamiento, codigo, tool calling, agentes ni vision en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Deteccion de voz sintetica en sistemas de verificacion: el modelo puede puntuar grabaciones cortas de 4 s y servir como filtro previo en pipelines de autenticacion por voz, usando el score real/fake para decidir si se requiere verificacion adicional.
- Monitorizacion de medios y fact-checking: integrado en un pipeline que analice clips de audio de redes sociales, el modelo aporta una senal de sospecha sobre locuciones generadas, limitada a fragmentos de 4 s.
- Investigacion en anti-spoofing: como baseline reproducible dentro de la Speech Anti-Spoofing Arena, permite comparar nuevos detectores bajo el mismo protocolo de evaluacion y dataset.
- Filtrado en datasets de habla: util para marcar muestras potencialmente sinteticas antes de entrenar modelos de ASR o TTS, reduciendo contaminacion del corpus.
- Analisis forense de audio: como una senal mas (no concluyente) en un informe pericial, combinada con otros detectores y metadatos.
- Pruebas de robustez de sistemas de altavoz: evaluar si un sistema de reconocimiento de hablante es vulnerable a audios que este detector marca como falsos.
- Educacion y demostraciones: ilustrar el uso de audio-LLM como detectores en cursos y talleres, dado que el wrapper y los resultados estan publicados.

## Benchmarks y rendimiento

Resultados de la Speech Anti-Spoofing Arena (EER %, menor es mejor; EmoSpoofTTS y LRLspoof usan 1-SRR % en el umbral EER de DeepVoice). Las celdas marcadas como n/a* corresponden a solapamiento con el entrenamiento.

| Dataset | EER % |
|---|---|
| ASVspoof2019_LA | 13,63 |
| ASVspoof2021_LA | 28,74 |
| ASVspoof2021_DF | 22,19 |
| ASVspoof5 | 23,40 (n/a*) |
| InTheWild | 46,90 |
| ADD22_eval_31 | 39,84 |
| ADD2023_track12_test_r1 | 39,94 |
| CFAD | 30,81 |
| CD-ADD | 30,37 (n/a*) |
| CVoiceFake_small | 50,74 |
| DeepVoice | 33,54 |
| LibriSeVoc | 49,75 (n/a*) |
| SONAR | 59,32 (n/a*) |
| ArAD | 43,03 |

No se dispone de comparaciones numericas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de aproximadamente 8,4 B en BF16, se requiere en torno a 17 GB solo para pesos; la model card indica que el backbone BF16 se reparte en dos GPU durante la evaluacion.
- GPU recomendadas: la evaluacion oficial usa dos GPU (modelo repartido); para una sola GPU se necesitan al menos 24 GB (por ejemplo, RTX 4090, A10G, L4 con cuantizacion) o 40-80 GB (A100, H100) para holgura.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en BF16 con reparto cuidadoso o cuantizacion; no confirmado en la informacion disponible.
- Opciones de despliegue: wrapper PyTorch propio (el usado en la Arena, sin TensorRT); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros detectores de anti-spoofing comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, este modelo se diferencia de clasificadores acusticos dedicados (por ejemplo, sistemas AASIST o RawNet2) en que emplea un audio-LLM de 8,4 B con adaptador LoRA y salida verbalizada, lo que implica mayor coste computacional y una ventana de audio muy corta (4 s).

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| NII-SLT26-Qwen2Audio-Gen | 8,4 B | 4 s de audio | CC BY-NC 4.0 | Hugging Face (este repo) |
| Clasificadores acusticos dedicados (AASIST, RawNet2, etc.) | no disponible | variable | variable | no disponible en esta ficha |

## Limitaciones y advertencias

- Ventana de entrada muy corta: solo los primeros 4 s de audio, sin tiling, lo que limita la deteccion en grabaciones largas.
- Rendimiento irregular: varios datasets presentan EER cercanos al azar o invertidos (CVoiceFake_small 50,74 %, SONAR 59,32 %, LibriSeVoc 49,75 %, InTheWild 46,90 %); la model card advierte que algunas celdas son cercanas al azar o invertidas.
- Solapamiento con entrenamiento: ASVspoof5, SONAR, CD-ADD y LibriSeVoc estan marcados como n/a* por solapamiento con los datos de entrenamiento, por lo que sus cifras no son comparables limpiamente.
- Fuera de dominio: el habla bona fide de estudio limpia queda fuera del dominio de estos checkpoints.
- Licencia CC BY-NC 4.0: prohibido el uso comercial sin autorizacion; revisar terminos antes de integrar en productos.
- Riesgo de alucinacion y falsos positivos/negativos: al ser un modelo generativo con salida verbalizada, la puntuacion debe tratarse como senal probabilistica, no como veredicto.
- Sesgos: no documentados en la informacion disponible; el entrenamiento se apoya en corpus mayoritariamente en ingles, lo que puede sesgar el rendimiento por idioma.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- No apto como unico mecanismo de decision en entornos de seguridad o forenses.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/NII-SLT26-Qwen2Audio-Gen
- Pesos del adaptador: https://huggingface.co/SpeechAntiSpoofingBenchmarks/NII-SLT26-Qwen2Audio-Gen/blob/93cf1f9eb081f9c4a468abff9ba1fbe4e42107f6/weights/adapter.safetensors
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Codigo de los autores: https://github.com/nii-yamagishilab/AntiDeepfake-AudioLLM/tree/2d445b525bb52518448b353fe1fee51d5f815af9
- Paper: https://arxiv.org/abs/2610.17617
