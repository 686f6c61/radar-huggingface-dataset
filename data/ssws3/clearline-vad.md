# ssws3/Clearline-VAD

## Resumen

Clearline-VAD es un detector de actividad de voz (VAD) disenado especificamente como sustituto directo de `silero.VAD` en agentes construidos con LiveKit. Lo desarrolla el autor identificado como ssws3 bajo el paraguas de Scicom (la model card enlaza con la coleccion Clearline de Scicom-intl). El modelo resuelve el problema de segmentar turnos de habla en tiempo real dentro de un agente de voz, ejecutandose integramente en una sola hebra de CPU con onnxruntime y numpy, sin torch ni GPU.

Tecnicamente es una red neuronal muy compacta: la variante de publicacion tiene 55 000 parametros y la variante destilada 127 000. Opera a 16 kHz, emite una probabilidad cada 16 ms (o cada 32 ms segun la ventana) y soporta audio de banda ancha y telefonico, remuestreando internamente 8, 24, 32 y 48 kHz. Su relevancia radica en que reduce el coste de CPU del VAD a aproximadamente 60 microsegundos por cada 32 ms de audio en un nucleo Xeon, frente a los 103 microsegundos de Silero v6.

El modelo se publica como pesos ONNX y se integra mediante un plugin propio para LiveKit, con umbrales de activacion calibrados (0,825 por defecto, no el 0,5 de Silero) y una variante destilada orientada a entornos ruidosos y telefonia. La model card reporta resultados sobre 13 conjuntos de test que incluyen reuniones, retransmisiones, peliculas, llamadas de resultados y llamadas telefonicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para deteccion de actividad de voz (detalles de capas no disponibles) |
| Parametros totales | 55 000 (variante release); 127 000 (variante destilada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (streaming por ventanas de 256 o 512 muestras) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | multilingue (la deteccion de voz no depende del idioma) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`clearline_vad.onnx`, `clearline_vad_distilled.onnx`, variantes `*_256.onnx`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna de la red (numero de capas, tipo de capas o funcion de activacion). Se sabe que el modelo consume audio a 16 kHz y produce una probabilidad de voz por ventana: con `window=256` la actualizacion es cada 16 ms, y con ventana de 512 muestras cada 32 ms. El plugin remuestrea en numpy cualquier frecuencia de sala (8, 24, 32 y 48 kHz) antes de la inferencia.

Ambas variantes se entrenan sobre audio que ha pasado previamente por un filtro de ruido, porque en un agente LiveKit el filtro se ejecuta antes que el VAD. La seleccion de hiperparametros y umbrales se hizo exclusivamente sobre conjuntos de desarrollo (AMI dev y VoxConverse dev, en banda ancha y a traves de un codec telefonico), y la model card afirma que ningun corpus de test se uso en entrenamiento. La variante destilada se obtiene por destilacion desde la release y mejora el ranking de frames en 11 de los 13 conjuntos de test, a costa de perder rendimiento en reuniones de campo lejano. No se especifican el numero de tokens de audio, la composicion exacta del dataset ni si hubo etapas de RLHF.

## Capacidades

- Deteccion de actividad de voz en streaming con una probabilidad cada 16 ms o 32 ms.
- Funcionamiento en una sola hebra de CPU con onnxruntime y numpy, sin dependencia de torch ni de GPU.
- Soporte de audio de banda ancha (16 kHz) y telefonico, con remuestreo interno desde 8, 24, 32 y 48 kHz.
- Integracion como drop-in de `silero.VAD` en agentes LiveKit mediante el plugin `clearline.livekit`.
- Dos variantes con perfiles distintos: release (mas turnos detectados y terminados a tiempo) y destilada (mejor ranking de frames, menos falsos positivos, mejor en ruido y telefonia).
- Modo `legacy_stream=True` para usar el bucle de stream propio de LiveKit sobre el mismo modelo.
- Uso sin LiveKit mediante la API de ONNX en crudo.
- Capacidad multilingue por naturaleza de la tarea (no depende del idioma del habla).

## Casos de uso

- Agentes de voz en LiveKit: sustituto directo de `silero.VAD` en `AgentSession`, con umbrales ya calibrados (0,825 por defecto) y un consumo de CPU del 1,6 % de un nucleo por llamada dentro del agente, frente al 4,3 % de Silero v6.
- Atencion al cliente telefonica: la variante destilada obtiene ROC-AUC de frames de 0,939 en FLEURS a traves de cinco codecs y 0,966 en los conjuntos de desarrollo por telefono, lo que la hace adecuada para centralitas y sistemas IVR.
- Segmentacion offline de grabaciones: la variante destilada esta pensada para salas ruidosas y segmentacion por lotes, donde prima la calidad de frame sobre la latencia de turno.
- Despliegue en infraestructura sin GPU: al ejecutarse en una hebra de CPU, permite montar agentes de voz en contenedores economicos o en el propio servidor de telefonia sin aceleradores.
- Sistemas de transcripcion con deteccion de turnos: combinado con un STT en streaming, el VAD delimita cuando empieza y acaba cada intervencion, con una tasa de turnos detectados del 0,835 y finalizacion a tiempo del 0,757 en la evaluacion con la maquina de estados de LiveKit.
- Filtrado previo en pipelines de reconocimiento de habla: al reducir falsos disparos (23,6 por hora sin los conjuntos telefonicos privados en la variante release, 14,3 en la destilada), evita enviar silencio o ruido al STT y al LLM.
- Procesamiento multipista en reuniones: el plugin comparte una unica inferencia entre dos streams del mismo VAD sobre el mismo audio, lo que abarata el coste cuando el STT no es en streaming.

## Benchmarks y rendimiento

Resultados reportados en la model card (13 conjuntos de test; turnos evaluados con la maquina de estados de VAD de LiveKit):

| Metrica | Silero v6 | Clearline-VAD | Clearline-VAD destilado |
|---|---:|---:|---:|
| ROC-AUC medio de frames (13 conjuntos) | 0,912 | 0,920 (mejor en 8) | 0,921 (mejor en 10) |
| LiveKit: turnos detectados / onset mediano | 0,801 / 247 ms | 0,835 / 261 ms | 0,801 / 465 ms |
| LiveKit: turnos terminados a tiempo | 0,718 | 0,757 | 0,728 |
| Falsos disparos por hora (10 conjuntos) | 29,6 | 35,1 | 21,4 |
| Falsos disparos por hora (sin telefonia privada) | 28,1 | 23,6 | 14,3 |
| Telefonia, ROC-AUC de frames: FLEURS con 5 codecs | 0,936 | 0,924 | 0,939 |
| Telefonia, ROC-AUC de frames: dev sets por telefono | 0,963 | 0,961 | 0,966 |
| Telefonia, LiveKit en AMI dev: onsets / ends / falsos por hora | 0,877 / 0,750 / 17,4 | 0,944 / 0,866 / 34,3 | 0,929 / 0,825 / 22,7 |

Coste de CPU en un nucleo de Xeon:

| Metrica | Silero v6 | Clearline-VAD | Clearline-VAD destilado |
|---|---:|---:|---:|
| CPU del modelo por 32 ms | 103 µs | 60 µs | 83 µs |
| CPU del plugin por stream, 16 kHz, 8 streams | 1,36 % | 0,56 % | 0,68 % |
| CPU del plugin por stream, 48 kHz, 8 streams | 1,54 % | 0,63 % | 0,74 % |
| Dos streams VAD de una llamada a 24 kHz, por 32 ms | 887 µs | 197 µs | 245 µs |
| Parte del VAD dentro de un agente LiveKit (% de nucleo) | 4,3 % | 1,6 % | 2,1 % |

Nota: el onset mediano de la variante destilada (465 ms) esta dominado por CHiME-6 (fiestas de cena): captura el 6 % de turnos con 2,7 s de retraso, frente al 15 % de Silero a 0,5 s. Sobre los otros nueve conjuntos su onset mediano es de 220 ms, similar al de Silero.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU con onnxruntime y numpy.
- GPU recomendadas: no aplica; el modelo esta disenado para una sola hebra de CPU.
- CPU: funciona en un nucleo de Xeon con 60 µs por cada 32 ms de audio (variante release) y 83 µs (destilada). Cabe en cualquier CPU consumer moderna.
- Memoria: los pesos son de 55 000 y 127 000 parametros, por lo que el modelo ocupa practicamente nada en memoria; el coste dominante es el remuestreo en numpy.
- Despliegue: plugin `clearline.livekit` para LiveKit, `ClearlineVAD.load(variant="distilled")` desde STT-API, o inferencia ONNX directa con onnxruntime.
- Throughput: con 8 streams a 16 kHz el plugin consume el 0,56 % de un nucleo; una llamada completa dentro de un agente LiveKit consume el 1,6 % de un nucleo para la parte del VAD.
- Latencia: actualizacion de probabilidad cada 16 ms con `window=256` y cada 32 ms con la ventana por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | ROC-AUC medio (13 conjuntos) | Turnos detectados (LiveKit) | CPU por 32 ms | Licencia |
|---|---|---:|---:|---:|---:|---|
| Clearline-VAD (release) | 55 000 | ONNX, CPU | 0,920 | 0,835 | 60 µs | no disponible |
| Clearline-VAD (destilado) | 127 000 | ONNX, CPU | 0,921 | 0,801 | 83 µs | no disponible |
| Silero v6 | no disponible | VAD de referencia | 0,912 | 0,801 | 103 µs | no disponible |

La comparacion disponible en la model card se limita a Silero v6, que es el modelo al que Clearline-VAD sustituye. No se han publicado comparaciones con otros VAD (por ejemplo, WebRTC VAD o modelos basados en transformers) en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta disponible en la informacion proporcionada; no se puede confirmar el uso comercial sin consultar el repositorio.
- El modelo esta pensado para audio previamente filtrado por un filtro de ruido; usarlo sobre audio sin filtrar puede degradar los resultados respecto a los reportados.
- La variante release dispara mas falsos positivos que Silero v6 en los dos conjuntos telefonicos privados (34,3 frente a 17,4 por hora en AMI dev por telefono).
- La variante destilada tiene un onset mediano de 465 ms, muy penalizado por CHiME-6; en escenas de reunion con ruido de fondo puede retrasar la deteccion de turnos.
- El umbral por defecto es 0,825 (0,875 con `window=256`), no el 0,5 de Silero; usar el umbral de Silero duplica los disparos.
- El modelo no se ha evaluado con datos de benchmarks de lenguaje (MMLU, HumanEval, GSM8K); no aplica.
- No se detalla la composicion del dataset de entrenamiento ni posibles sesgos acusticos por dominio o idioma.
- La model card indica que el paper asociado es un preprint pendiente; los resultados no han pasado revision por pares.

## Enlaces

- Hugging Face: https://huggingface.co/ssws3/Clearline-VAD
- Filtro de ruido Clearline-NC-CPU: https://huggingface.co/Scicom-intl/Clearline-NC-CPU
- Filtro de ruido Clearline-NC-GPU: https://huggingface.co/Scicom-intl/Clearline-NC-GPU
- Coleccion Clearline: https://huggingface.co/collections/Scicom-intl/clearline-6ae3f6e7cbdc1a74fc801725
- Plugin LiveKit en STT-API: https://github.com/Scicom-AI-Enterprise-Organization/STT-API/tree/main/stt_api/livekit_plugin/clearline
- Paper: "Clearline: voice activity detection and noise cancellation for voice agents, on one CPU core" (preprint pendiente, sin enlace disponible)
