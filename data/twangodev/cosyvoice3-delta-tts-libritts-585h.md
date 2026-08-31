# twangodev/cosyvoice3-delta-tts-libritts-585h

## Resumen

El modelo `twangodev/cosyvoice3-delta-tts-libritts-585h` es un adaptador de investigación independiente que reproduce el método DELTA-TTS (discrete diffusion) sobre el modelo base CosyVoice3 0.5B de FunAudioLLM. No es un lanzamiento oficial ni de DELTA-TTS ni de FunAudioLLM, sino una implementación de la conversión de un modelo de lenguaje autoregresivo a un modelo de difusión discreta para síntesis de voz. El adaptador contiene 93,8 millones de parámetros en FP32, almacenados en formato `safetensors`, y está diseñado para funcionar exclusivamente con el modelo base CosyVoice3 0.5B y una versión específica del código fuente de CosyVoice.

El modelo está entrenado en el subconjunto LibriTTS de 585 horas (en inglés) y se distribuye bajo licencia Apache-2.0. Su relevancia radica en que demuestra una aceleración de 1,73× en la generación de extremo a extremo respecto al CosyVoice3 nativo, con una regresión mínima en calidad (WER 2,27% frente a 2,09% y SIM 0,683 frente a 0,697). Está pensado para investigadores que quieran explorar la conversión de modelos TTS autoregresivos a difusión discreta, no para uso en producción directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DELTA-TTS (difusion discreta) sobre CosyVoice3 0.5B |
| Parametros totales | 93,8 M (solo adaptador, FP32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo FP32) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador implementa el metodo DELTA-TTS descrito en el articulo arXiv:2607.04140, que convierte un modelo de lenguaje de voz autoregresivo (en este caso CosyVoice3 0.5B) en un modelo de difusion discreta. El proceso de entrenamiento se realizo sobre el dataset LibriTTS (585 horas, en ingles) y el adaptador se anade al modelo base congelado. No se proporcionan detalles sobre el numero exacto de pasos de entrenamiento, la composicion del dataset mas alla de LibriTTS, ni si se utilizaron tecnicas como RLHF o DPO. La implementacion requiere una version especifica del codigo fuente de CosyVoice (commit `074ca6d`) y del modelo base (revision `29e01c4`), y el runtime verifica la integridad del adaptador mediante sumas de verificacion.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con calidad comparable al CosyVoice3 nativo (WER 2,27% frente a 2,09% en el conjunto de prueba Seed-TTS test-en).
- Generacion de voz con voz de referencia (zero-shot) mediante un prompt de audio y su transcripcion, aunque esta capacidad no se detalla explicitamente en la documentacion.
- Generacion de secuencia completa (no streaming) con un factor de velocidad de 1,73× respecto al modelo autoregresivo original.
- Soporte de decodificacion por difusion discreta con 16 pasos de muestreo, lo que reduce el tiempo de calculo por token (RTF de 0,059 frente a 0,187 del modelo nativo).
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de sintesis de voz.

## Casos de uso

- Investigacion en sintesis de voz: el adaptador permite estudiar la conversion de modelos TTS autoregresivos a difusion discreta, comparando metricas de calidad (WER, SIM) y eficiencia (RTF) frente al modelo original.
- Generacion de audio para datasets de entrenamiento: puede utilizarse para crear muestras de voz sintetica en ingles a partir de texto, con control de la voz de referencia, para aumentar conjuntos de datos de ASR o TTS.
- Prototipado de sistemas TTS de baja latencia: al ser 1,73× mas rapido que el CosyVoice3 nativo, puede servir como base para experimentos donde la latencia de generacion sea critica, aunque no es apto para produccion por sus limitaciones.
- Evaluacion de metodos de difusion discreta: los resultados publicados (WER, SIM, RTF) proporcionan una referencia reproducible para comparar con otras implementaciones de DELTA-TTS.
- Educacion y formacion: como ejemplo de adaptador de investigacion, puede usarse en cursos o talleres sobre modelos generativos de voz y tecnicas de destilacion o conversion de arquitectura.
- Desarrollo de herramientas de clonacion de voz controlada: con el prompt de audio adecuado, puede generar voz con caracteristicas similares a la referencia, siempre que se obtenga consentimiento del hablante.

## Benchmarks y rendimiento

Los resultados publicados en la model card se obtuvieron con el conjunto de prueba Seed-TTS test-en (1.088 casos, semilla 1986, batch size 1, GPU RTX PRO 6000 Blackwell):

| Sistema | WER ↓ | SIM ↑ | Token RTF ↓ | End-to-end RTF ↓ |
|---|---:|---:|---:|---:|
| CosyVoice3 nativo (AR) | 2,09% | 0,697 | — | 0,187 |
| Este adaptador (16 pasos) | 2,27% | 0,683 | 0,059 | 0,108 |

El adaptador consigue una aceleracion de extremo a extremo de 1,73× con una regresion pequena en calidad. No se han publicado resultados en otros benchmarks estandar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dado que el adaptador tiene 93,8 M de parametros FP32 (~375 MB) y el modelo base CosyVoice3 0.5B (~2 GB en FP32), se estima que la inferencia requiere al menos 4-6 GB de VRAM, aunque no se ha confirmado.
- GPU recomendadas: la evaluacion se realizo en una RTX PRO 6000 Blackwell, pero no se indican requisitos minimos. Es probable que una RTX 4090 (24 GB) o una A100 (40 GB) sean suficientes, pero no esta verificado.
- Compatibilidad con GPUs de consumo: probablemente si, en GPUs con 8 GB o mas de VRAM, pero no se ha probado oficialmente.
- Opciones de despliegue: no es compatible con `transformers.pipeline` ni con el widget de Hugging Face. Requiere el entorno `speech-dllm` (repositorio especifico) y el codigo fuente de CosyVoice. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: los valores de RTF indican que el adaptador genera tokens a 0,059 RTF (tiempo de calculo por token) y 0,108 RTF de extremo a extremo, lo que en una RTX PRO 6000 Blackwell se traduce en una generacion aproximadamente 1,73× mas rapida que el modelo nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (Seed-TTS test-en) | SIM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CosyVoice3 0.5B (nativo) | 0,5 B | No disponible | 2,09% | 0,697 | Apache-2.0 | Hugging Face |
| Este adaptador DELTA-TTS | 93,8 M (adaptador) + 0,5 B (base) | No disponible | 2,27% | 0,683 | Apache-2.0 | Hugging Face |
| Otros TTS (p. ej. VITS, Tacotron) | No comparable | No disponible | No disponible | No disponible | Varía | Varía |

No se dispone de comparaciones con otros adaptadores DELTA-TTS o modelos TTS de difusion discreta en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue.
- La duracion del audio objetivo se estima mediante una heuristica basada en la relacion prompt/texto, que puede fallar con prompts cortos o texto largo fuera del dominio de entrenamiento.
- La generacion es de secuencia completa y no es streaming, lo que limita su uso en aplicaciones en tiempo real.
- La generacion de voz dura o de formato largo requiere una cualificacion adicional no documentada.
- Es un adaptador de investigacion, no un modelo de produccion; no es compatible con las APIs estandar de Hugging Face.
- Se debe obtener consentimiento del hablante antes de usar su voz como referencia y divulgar que el audio es sintetico.
- El adaptador depende de versiones exactas del modelo base y del codigo fuente; cualquier cambio puede romper la compatibilidad.
- No se han publicado resultados de sesgos o alucinaciones especificos, pero al ser un modelo de voz, el riesgo principal es la generacion de audio con contenido no deseado o incorrecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twangodev/cosyvoice3-delta-tts-libritts-585h
- Modelo base CosyVoice3: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio speech-dllm (entorno de inferencia): https://github.com/twangodev/speech-dllm
- Repositorio CosyVoice (codigo fuente): https://github.com/FunAudioLLM/CosyVoice
- Paper DELTA-TTS: https://arxiv.org/abs/2607.04140
- Paper CosyVoice3: https://arxiv.org/abs/2505.17589
- Paper LibriTTS: https://arxiv.org/abs/1904.02882
- Sitio oficial de CosyVoice: https://cosyvoice.org/ y https://cosyvoice.github.io/
- Repos alternativos de CosyVoice-v3 en GitHub: https://github.com/wehos/CosyVoice-v3 y https://github.com/yaospacetim/CosyVoice-TTS
