# wasitaigeneratedcom/ai-voice-detector-small

## Resumen

tropa-voice-mini es un detector de voz sintetica y clonada distribuido con pesos abiertos por wasitaigenerated.com bajo el identificador wasitaigeneratedcom/ai-voice-detector-small. Se trata de un clasificador de audio basado en el backbone facebook/wav2vec2-xls-r-300m (315.868.803 parametros, 1,26 GB de pesos) afinado para la tarea de deteccion de deepfakes de voz. Resuelve un problema concreto: distinguir audio generado por sistemas TTS comerciales y de codigo abierto (ElevenLabs, MiniMax, OpenAI, Gemini, xAI, HeyGen, VibeVoice, entre otros) de voz humana real.

El modelo es relevante porque combina un rendimiento competitivo en benchmarks publicos con una licencia Apache-2.0 que permite uso comercial, algo poco habitual en esta categoria, donde alternativas como DF_Arena_1B o NII XLS-R-2B estan lastradas por licencias no comerciales. Ademas, devuelve una linea temporal por segmentos (ventanas de 6 s con salto de 3 s) en lugar de una unica puntuacion global, lo que facilita el analisis forense de clips largos.

La inferencia es viable en CPU (un clip de 30 s tarda unos 10 s en 4 nucleos) y en GPU (unos 0,06 s), lo que lo hace desplegable en entornos sin acelerador. El modelo se publico en noviembre de 2026 y es la variante pequena del sistema tropa-voice que da servicio a la API alojada del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (wav2vec2 XLS-R) con cabeza de clasificacion binaria |
| Parametros totales | 315.868.803 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 6 s con salto de 3 s; clips menores de ~2 s son menos fiables |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo) |
| Idiomas soportados | en, de, fr, es, it, pl, nl, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1,26 GB); incluye detector.py y serving_head.json |

## Arquitectura y entrenamiento

El modelo parte de facebook/wav2vec2-xls-r-300m, un encoder convolucional y transformer preentrenado de forma autosupervisada sobre audio multilingue, y lo afina como clasificador de audio para la tarea de anti-spoofing. La salida se calibra como probabilidad en [0, 1] (ai_score) con umbrales definidos para tasas de falsos positivos del 0,1 %, 0,5 % y 1 % sobre voz humana reservada, documentados en serving_head.json. El pipeline aplica ventanas deslizantes de 6 s con salto de 3 s y agrega las puntuaciones por segmento.

La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion figura como no disponible. El autor indica que el conjunto de evaluacion Commercial-Voices-2026-mini contiene hablantes y textos no vistos en entrenamiento, lo que sugiere un diseno de generalizacion a sistemas TTS no vistos. No se documentan innovaciones como decodificacion especulativa ni attention linear.

## Capacidades

- Clasificacion binaria de audio en tres veredictos: ai, uncertain y human, a partir de una probabilidad calibrada.
- Deteccion de voz sintetica de sistemas comerciales: ElevenLabs v3 y v4, MiniMax Speech 2.8 HD y Speech-02 HD, OpenAI gpt-4o-mini-tts y tts-1-hd, Gemini 3.8 Flash TTS, xAI TTS, HeyGen, Inworld TTS, Seed Speech v2, Qwen Audio 3 TTS, VibeVoice 7B y Chatterbox.
- Deteccion de deepfakes del mundo real procedentes de redes sociales, con musica de fondo y bandas sonoras de video.
- Salida con linea temporal por segmento (inicio, fin y ai_score por ventana), apta para analisis forense.
- Soporte multilingue declarado para ingles, aleman, frances, espanol, italiano, polaco y neerlandes, ademas de la etiqueta generica multilingual.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderacion de plataformas de audio y podcast: el modelo puntua cada ventana de 6 s de un episodio y permite marcar tramos concretos sospechosos de ser sinteticos sin revisar el audio completo manualmente.
- Verificacion periodistica de declaraciones filtradas: ante un audio atribuido a un politico o celebridad, el detector ofrece una probabilidad calibrada con umbral ajustable al 0,5 % de FPR, adecuado para descartar falsos positivos antes de publicar.
- Autenticacion en call centers y banca telefonica: integrado en el pipeline de entrada de llamadas, puede senalar locuciones generadas por TTS en tiempo casi real (0,06 s por clip de 30 s en GPU) para activar verificacion adicional.
- Deteccion de fraude en seguros y siniestros: analisis de grabaciones aportadas como prueba para identificar voces clonadas con ElevenLabs o MiniMax, con salida por segmentos que documenta que tramos son sinteticos.
- Cumplimiento normativo y trazabilidad de contenido: etiquetado automatico de catalogos de audio en plataformas de streaming o archivos, usando la licencia Apache-2.0 para uso comercial sin restricciones de redistribucion.
- Investigacion en seguridad de voz: el modelo sirve como linea base reproducible gracias al benchmark publico voice-deepfake-benchmark y al dataset Commercial-Voices-2026-mini, permitiendo comparar nuevos detectores con el mismo codigo de evaluacion.
- Filtrado previo en datasets de entrenamiento TTS: descartar clips sinteticos contaminantes en corpus de audio recolectados de internet antes de usarlos para entrenar modelos de voz.

## Benchmarks y rendimiento

Metrica: equal error rate (EER), menor es mejor. Todos los modelos evaluados por el autor con el mismo codigo y los mismos archivos.

| Modelo | Licencia | In-the-Wild | Deepfake-Eval-2024 (test) | Commercial voices 2026 | SONAR | MLAAD-tiny |
|---|---|---|---|---|---|---|
| tropa-voice-mini (este modelo) | Apache-2.0 | 0,98 % | 13,5 % | 0,19 % | 0,18 % | 2,33 % |
| lab260/Spectra-AASIST | Apache-2.0 | 1,43 % | 17,2 % | 2,01 % | 0,48 % | 0,71 % |
| Speech-Arena-2025/DF_Arena_1B | no comercial | 0,96 % | 27,6 % | 7,14 % | 1,26 % | 3,24 % |
| nii-yamagishilab/xls-r-2b-anti-deepfake | no comercial | 1,34 % | 25,1 % | 3,99 % | 0,43 % | 4,72 % |

EER por sistema TTS en Commercial-Voices-2026-mini:

| Sistema | tropa-voice-mini | Spectra-AASIST | DF_Arena_1B | NII XLS-R-2B |
|---|---|---|---|---|
| ElevenLabs v4 | 0,0 % | 2,5 % | 15,6 % | 7,4 % |
| ElevenLabs v3 | 0,0 % | 0,7 % | 9,1 % | 2,4 % |
| MiniMax Speech 2.8 HD | 0,0 % | 0,7 % | 8,7 % | 3,4 % |
| MiniMax Speech-02 HD | 0,0 % | 2,7 % | 5,4 % | 6,8 % |
| xAI TTS | 0,0 % | 1,6 % | 14,4 % | 3,1 % |
| HeyGen | 0,2 % | 6,2 % | 12,0 % | 7,3 % |
| VibeVoice 7B | 1,5 % | 7,4 % | 11,8 % | 27,9 % |
| Qwen Audio 3 TTS | 0,0 % | 1,5 % | 6,0 % | 2,3 % |
| Inworld TTS | 0,0 % | 1,3 % | 7,3 % | 2,2 % |
| Gemini 3.8 Flash TTS, OpenAI gpt-4o-mini-tts, OpenAI tts-1-hd, Seed Speech v2, Chatterbox | 0,0 % | 0,0-0,6 % | 0,0-2,8 % | 0,0-0,8 % |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB para pesos en precision completa (safetensors) mas overhead de activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el modelo no requiere aceleradores de gama alta. En GPU, un clip de 30 s tarda ~0,06 s.
- CPU: funciona sin GPU; un clip de 30 s tarda ~10 s en 4 nucleos. Adecuado para despliegues en servidores sin acelerador o en el borde.
- Despliegue: transformers con el script detector.py incluido en el repo, que descarga pesos via huggingface_hub; requiere torch, safetensors, soundfile y ffmpeg para formatos comprimidos (mp3, m4a, mp4). No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, dado que es un clasificador y no un modelo generativo.
- Throughput estimado: no disponible mas alla de la cifra puntual de 0,06 s por clip de 30 s en GPU y 10 s en 4 nucleos de CPU.

## Comparativa con modelos similares

| Criterio | tropa-voice-mini | lab260/Spectra-AASIST | Speech-Arena-2025/DF_Arena_1B | nii-yamagishilab/xls-r-2b-anti-deepfake |
|---|---|---|---|---|
| Parametros | 315,9 M | no disponible | ~1 B (por nombre) | ~2 B (por nombre) |
| Licencia | Apache-2.0 | Apache-2.0 | no comercial | no comercial |
| Uso comercial | si | si | no | no |
| In-the-Wild (EER) | 0,98 % | 1,43 % | 0,96 % | 1,34 % |
| Deepfake-Eval-2024 (EER) | 13,5 % | 17,2 % | 27,6 % | 25,1 % |
| Commercial voices 2026 (EER) | 0,19 % | 2,01 % | 7,14 % | 3,99 % |
| MLAAD-tiny (EER) | 2,33 % | 0,71 % | 3,24 % | 4,72 % |
| Ejecutable en CPU | si | no disponible | no disponible | no disponible |

tropa-voice-mini domina en voces comerciales y en Deepfake-Eval-2024, pero pierde claramente frente a Spectra-AASIST en MLAAD-tiny, donde los TTS basados en LLM (VoxCPM, Spark-TTS, Llasa) le cuestan alrededor del 10 % de EER frente a un maximo del 2 % del competidor. DF_Arena_1B es marginalmente mejor en In-the-Wild (0,96 % frente a 0,98 %) pero con licencia no comercial y peor en el resto de conjuntos.

## Limitaciones y advertencias

- En MLAAD-tiny el rendimiento cae al 2,33 % de EER, con un ~10 % especifico en TTS basados en LLM como VoxCPM, Spark-TTS y Llasa; Spectra-AASIST es claramente superior en ese subconjunto.
- Los clips de menos de 2 s son menos fiables; las ventanas de inferencia son de 6 s con salto de 3 s.
- Audio con musica de fondo intensa o calidad telefonica degrada la deteccion en todos los detectores, incluido este.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de falsos positivos y negativos: el umbral por defecto se calibra al 0,5 % de FPR sobre voz humana reservada, y el veredicto uncertain existe precisamente para la zona ambigua.
- La model card no documenta sesgos demograficos, de acento ni de idioma mas alla de la lista de lenguas soportadas; no hay analisis de equidad publicado.
- El modelo no cubre sistemas TTS futuros ni variantes no vistas; la generalizacion a nuevos motores comerciales no esta garantizada.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datasets de evaluacion citados (In-the-Wild, Deepfake-Eval-2024, SONAR, MLAAD-tiny) si se redistribuyen.
- El modelo es la variante pequena; el autor afirma que la API alojada con tropa-voice supera a todos los detectores abiertos en los cinco benchmarks, por lo que para maxima precision habria que recurrir al servicio hosted.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasitaigeneratedcom/ai-voice-detector-small
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Dataset Commercial-Voices-2026-mini: https://huggingface.co/datasets/wasitaigeneratedcom/commercial-voices-2026-mini
- Repositorio de benchmark: https://github.com/wasitaigenerated/voice-deepfake-benchmark
- API alojada y sitio del autor: https://wasitaigenerated.com
- Paper Deepfake-Eval-2024: https://arxiv.org/abs/2503.02857
- Paper In-the-Wild: https://arxiv.org/abs/2203.16263
- Paper SONAR: https://arxiv.org/abs/2410.04324
- Dataset MLAAD-tiny: https://huggingface.co/datasets/mueller91/MLAAD-tiny
- Modelo comparable Spectra-AASIST: https://huggingface.co/lab260/Spectra-AASIST
- Modelo comparable DF_Arena_1B: https://huggingface.co/Speech-Arena-2025/DF_Arena_1B_V_1
- Modelo comparable NII XLS-R-2B: https://huggingface.co/nii-yamagishilab/xls-r-2b-anti-deepfake
