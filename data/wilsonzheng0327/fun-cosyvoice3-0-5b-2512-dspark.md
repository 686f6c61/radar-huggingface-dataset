# wilsonzheng0327/Fun-CosyVoice3-0.5B-2512-dspark

## Resumen

Fun-CosyVoice3-0.5B-2512-dspark es un modelo borrador (*draft*) de decodificación especulativa en formato `speculators` para el LLM de tokens de habla de FunAudioLLM/Fun-CosyVoice3-0.5B-2512, un sistema de síntesis de voz (TTS) con clonación de voz. Lo publica el usuario wilsonzheng0327 y está diseñado específicamente para el motor `sglang-omni` (SGLang 0.5.23), que lo verifica exactamente contra el muestreador de CosyVoice3, de modo que la distribución de tokens de habla generados se mantiene idéntica a la del modelo objetivo sin borrador.

El modelo no genera audio por sí mismo: es un acelerador de inferencia. Su función es proponer bloques de tokens de habla que el modelo objetivo valida en paralelo, reduciendo el número de pasos de decodificación secuencial. Con 237.943.913 parámetros (0,5 GB en safetensors), emplea una arquitectura DSpark de tres capas Qwen3 con cabeza de sesgo logit de Markov, y se entrena sobre las salidas del propio modelo objetivo (*on-policy*) en inglés y chino.

Su relevancia es práctica: en las pruebas publicadas por el autor, alcanza ganancias de throughput de hasta 1,52x en chino y 1,41x en inglés con concurrencia 1, manteniendo la precisión (WER y CER sin cambios) y reduciendo la latencia p95 del primer audio entre un 13 % y un 31 % en la mayoría de cargas. Está bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark: 3 capas Qwen3 (hidden 896, ancho del objetivo), cabeza de sesgo logit de Markov de rango 256, cabeza de confianza (solo en entrenamiento) |
| Parametros totales | 237.943.913 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `speculators`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El borrador es un transformer ligero de tres capas Qwen3 con anchura oculta 896 (la misma del modelo objetivo). Recibe como entrada los estados ocultos del objetivo correspondientes al flujo residual que entra en las capas 2, 12 y 21 de 24, más la salida de la última capa. La predicción se realiza mediante una cabeza de sesgo logit de Markov de rango 256 sobre el vocabulario de 6.760 identificadores de habla y control del objetivo (ids unificados 151.924 a 158.683); el *embedding* y la cabeza están congelados y provienen del modelo objetivo. El bloque de decodificación especulativa es de 8 tokens: el ancla más 7 propuestas por verificación, con `sample_from_anchor` desactivado tal como lo sirve sglang-omni.

El entrenamiento es *on-policy*: cada secuencia es una salida real del servidor Fun-CosyVoice3 con su muestreo por defecto (temperatura 0,7, top-p 0,8, top-k 20, redibujado con conciencia de repetición). Se usaron cuatro rondas con textos de LibriTTS-R, AISHELL-1, Common Voice zh-CN y YODAS2 zh000, con referencias de voz de LibriTTS-R y AISHELL-1; en total 764.237 secuencias generadas, de las que 756.620 (222M tokens, incluidos prompts) se usan para entrenar y el 1 % se reserva como validación. La pérdida combina 0,1 de entropía cruzada y 0,9 de variación total contra la distribución del objetivo sobre los 6.760 ids, con decaimiento posicional exponencial fijo (gamma 4) y peso 1 para la cabeza de confianza. Se optimizó con AdamW (lr 3e-4, weight decay 0, warmup 2 %, coseno hasta 0, clip de gradiente 1), lotes empaquetados a 16.384 tokens por GPU y 3.072 anclas por secuencia, durante 8 épocas y 55.808 pasos por GPU en 2 H200 (1 h 36 min).

## Capacidades

- Decodificación especulativa de tokens de habla para el LLM de Fun-CosyVoice3-0.5B-2512 en sglang-omni.
- Aceleración de TTS con clonación de voz en inglés y chino, con verificación exacta contra el muestreador del objetivo.
- Soporte de prompts con tokens de habla de referencia (clonación con transcripción) y de prompts solo texto (sin referencia).
- Soporte de referencias en el otro idioma (5 % de las peticiones de entrenamiento clonan una voz en el idioma opuesto).
- Predicción del token de parada además de los tokens de habla.
- No realiza generación de texto, razonamiento, código, matemáticas, visión ni tool calling: su única función es proponer tokens para el modelo objetivo.

## Casos de uso

- Servicio de TTS en producción con sglang-omni: se despliega junto al modelo objetivo mediante `sgl-omni serve` con `--tts_engine.engine.speculative_algorithm DSPARK`, y acelera la síntesis de voz en inglés y chino sin alterar la salida (WER y CER idénticos en las pruebas del autor).
- Clonación de voz interactiva de baja latencia: con concurrencia 16, el primer audio en chino llega un 2,7 % antes que sin borrador y la latencia p95 baja entre un 13 % y un 31 % en la mayoría de cargas, lo que mejora la experiencia en asistentes conversacionales.
- Generación por lotes de audiolibros o locuciones largas: el throughput de 1,41x en inglés y 1,52x en chino a concurrencia 1 reduce el coste por hora de audio sintetizado en pipelines offline.
- Integración en agentes de voz o IVR: al mantener la distribución del objetivo, se puede insertar en un servidor TTS existente sin recalibrar la calidad ni el reconocimiento posterior.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia DSpark frente a otros borradores (SpeechSpec) sobre el mismo objetivo, con métricas reproducibles del script `benchmarks.eval.speculative_sweep`.
- Despliegue multi-GPU por nodo: el autor ejecuta dos borradores simultáneos en dos GPUs de un mismo nodo con una H200 por borrador, lo que permite servir varias instancias de TTS en paralelo.

## Benchmarks y rendimiento

Resultados publicados por el autor en sglang-omni (SGLang 0.5.23) sobre una H200 por borrador, 400 clips de test SeedTTS por idioma, clonación con transcripción de referencia, streaming y muestreo por defecto. La ganancia es throughput respecto a la ejecución sin borrador.

| Workload | Draft | Accept | c1 | c2 | c4 | c8 | c16 | Primer audio p95 a c16 | Precision sin borrador → con borrador |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| SeedTTS EN | este borrador | 2,93 | 1,41x | 1,40x | 1,34x | 1,28x | 1,17x | +6,0 % | WER 1,27 % → 1,27 % |
| SeedTTS EN | SpeechSpec `yuekai/cosyvoice3_llm_dspark` | 2,20 | 1,14x | 1,14x | 1,12x | 1,11x | 1,08x | +1,2 % | WER 1,30 % → 1,26 % |
| SeedTTS ZH | este borrador | 3,09 | 1,52x | 1,50x | 1,42x | 1,34x | 1,21x | +2,7 % | CER 0,23 % → 0,23 % |
| SeedTTS ZH | SpeechSpec `yuekai/cosyvoice3_llm_dspark` | 2,99 | 1,49x | 1,46x | 1,39x | 1,34x | 1,21x | +5,4 % | CER 0,24 % → 0,24 % |

El valor "Accept" es el número de tokens de habla aceptados por verificación según los logs del planificador. La latencia p95 del primer audio es inferior a la de sin borrador en todas las cargas para ambos borradores (este borrador, entre un 13 % y un 31 %; el de SpeechSpec, entre un 6 % y un 30 %), y no falló ninguna petición. La única carga en la que el primer audio en streaming de este borrador llega más de un 5 % más tarde que sin borrador es inglés con 16 peticiones concurrentes (284 a 301 ms).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,5 GB en safetensors; requiere además el modelo objetivo Fun-CosyVoice3-0.5B-2512 en memoria, por lo que el consumo total depende de este.
- GPU recomendadas: el autor valida con una H200 por borrador y dos borradores simultáneos en dos GPUs de un mismo nodo.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras GPU consumer; el despliegue validado es en H200.
- Opciones de despliegue: sglang-omni (SGLang 0.5.23) con `sgl-omni serve` y los flags `--tts_engine.engine.speculative_algorithm DSPARK` y `--tts_engine.engine.speculative_draft_model_path`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ganancias de 1,41x (EN) y 1,52x (ZH) a concurrencia 1, con 2,93 y 3,09 tokens aceptados por verificación respectivamente; la latencia p95 del primer audio baja entre un 13 % y un 31 % en la mayoría de cargas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accept (EN/ZH) | Throughput a c1 (EN/ZH) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wilsonzheng0327/Fun-CosyVoice3-0.5B-2512-dspark | 237.943.913 | no disponible | 2,93 / 3,09 | 1,41x / 1,52x | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| yuekai/cosyvoice3_llm_dspark (SpeechSpec) | no disponible | no disponible | 2,20 / 2,99 | 1,14x / 1,49x | no disponible | Hugging Face |
| FunAudioLLM/Fun-CosyVoice3-0.5B-2512 (objetivo, sin borrador) | 0,5B (según nombre) | no disponible | no aplica | 1,00x (referencia) | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo funciona como borrador de decodificación especulativa para Fun-CosyVoice3-0.5B-2512 en sglang-omni; no es un modelo TTS autónomo ni sirve para otras tareas.
- El vocabulario está restringido a los 6.760 ids de habla y control del objetivo; no puede generar texto libre.
- Idiomas limitados a inglés y chino; no hay soporte documentado de otros idiomas.
- El checkpoint indexa el vocabulario unificado de `yuekai/Fun-CosyVoice3-0.5B-2512-LLM-HF` y sglang-omni lo remapea en tiempo de carga; usarlo fuera de ese motor requiere ese remapeo.
- Las referencias chinas de entrenamiento provienen solo de 100 hablantes de AISHELL-1 (el resto no tiene audio en la copia del Hub), lo que puede limitar la diversidad de voces clonadas en chino.
- En inglés con 16 peticiones concurrentes el primer audio en streaming llega entre un 5 % y un 6 % más tarde que sin borrador (284 a 301 ms).
- No se han publicado datos sobre sesgos, tasas de alucinación ni comportamiento fuera de las condiciones de benchmark; el modelo tiene 0 descargas y 0 likes, por lo que no hay validación externa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo objetivo y los datasets de entrenamiento pueden tener condiciones adicionales que deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wilsonzheng0327/Fun-CosyVoice3-0.5B-2512-dspark
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Exportación HF del LLM de CosyVoice3: https://huggingface.co/yuekai/Fun-CosyVoice3-0.5B-2512-LLM-HF
- Borrador SpeechSpec comparable: https://huggingface.co/yuekai/cosyvoice3_llm_dspark
- Repositorio speculators: https://github.com/vllm-project/speculators
- Repositorio sglang-omni: https://github.com/sgl-project/sglang-omni
