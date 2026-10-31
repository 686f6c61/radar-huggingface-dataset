# syvai/edda-v0.2-large-hurtig

## Resumen

Edda v0.2 large hurtig es un sistema de reconocimiento automático de voz (ASR) para danés que combina el modelo Edda v0.2 large, desarrollado por el Alexandra Institute dentro del proyecto CoRal y publicado por Danish Foundation Models, con un modelo "drafter" de decodificación especulativa entrenado por syv.ai. El objetivo del proyecto es acelerar la inferencia de Edda sin alterar sus resultados: el drafter propone bloques de hasta 15 tokens que Edda verifica en una única pasada, logrando una aceleración media de 2,39× en la decodificación greedy.

La base del sistema es Edda v0.2 large, un modelo de arquitectura Whisper (basado en whisper-large-v3) con 32 capas de decodificador y 1.543 millones de parámetros, afinado específicamente para danés. El drafter añadido es un modelo de difusión por bloques estilo DFlash2 de 170M de parámetros, entrenado para predecir la salida greedy de Edda. Los pesos de Edda en este repositorio son idénticos byte a byte a los del modelo original, de modo que la calidad del reconocimiento corresponde íntegramente al modelo base.

Es relevante porque aborda uno de los cuellos de botella habituales del ASR con modelos grandes: la latencia de decodificación autorregresiva token a token. Al mantener la salida greedy idéntica (299 de 300 clips coinciden en las pruebas publicadas), ofrece una vía de aceleración sin compromiso de calidad, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) + drafter DFlash2 de difusión por bloques |
| Parametros totales | 1.543.490.560 (modelo completo, incluido el drafter) |
| Parametros activos | 1.543.490.560 (no es MoE; Edda aporta ~1.373M y el drafter 170M) |
| Longitud de contexto | Clips de audio de hasta 30 segundos |
| Tipos de cuantizacion | fp16 (formato de almacenamiento del drafter); no disponible información sobre otras cuantizaciones |
| Idiomas soportados | Danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors + drafter.safetensors) |

## Arquitectura y entrenamiento

Edda v0.2 large es un modelo Whisper con un decodificador de 32 capas que genera un token por pasada hacia adelante en decodificación estándar. Hurtig añade encima un drafter de 170M de parámetros de estilo DFlash2 (difusión por bloques) adaptado a Whisper. El drafter construye bloques formados por el último token verificado más 15 ranuras de máscara, y predice un token por ranura en una sola pasada. Edda verifica el bloque completo en un forward pass y conserva el prefijo más largo con el que coincide, más su propio token siguiente. Como la elección greedy de Edda decide cada token, la transcripción resultante es idéntica a la greedy de Edda, pero aproximadamente 2,4× más rápida.

El drafter recibe contexto de Edda mediante los estados ocultos de las capas 1, 8, 15, 22 y 29 del decodificador, concatenados y proyectados mediante una capa lineal y RMSNorm, que se inyectan como claves y valores adicionales en la autoatención de cada capa del drafter. Cada capa del drafter también realiza cross-attention sobre la salida del encoder de Edda. Incorpora novedades de DFlash2: una convolución causal dinámica agrupada de dos taps alrededor de la autoatención y el MLP, y un selector de candidatos que toma los 16 tokens principales por ranura y elige una trayectoria consistente con una puntuación por pares de rango 256. Las 5 capas del drafter se inicializan como copias de las capas 0, 8, 16, 23 y 31 del decodificador de Edda; los embeddings, posiciones y la cabeza de salida son los de Edda, congelados y no almacenados.

El entrenamiento del drafter consistió en 20.000 pasos sobre transcripciones greedy del propio Edda de 80.000 clips de entrenamiento en danés, con audio procedente de FTSpeech, CoRal-v3, NST, FLEURS y Common Voice (splits de entrenamiento, en la mezcla de entrenamiento de Edda). El drafter aprende a predecir lo que Edda escribirá, no las transcripciones de referencia. La función de pérdida es la entropía cruzada con decaimiento posicional de DFlash (γ = 7) más una entropía cruzada sobre el selector.

## Capacidades

- Transcripción automática de voz en danés a partir de clips de audio mono de 16 kHz de hasta 30 segundos.
- Decodificación especulativa: hasta 15 tokens propuestos por bloque y verificados en una sola pasada de Edda, con aceleración media de 2,39× (hasta 3,22× en FTSpeech).
- Transcripción sin marcas de tiempo, mediante el prompt `<|da|><|transcribe|><|notimestamps|>`.
- Compatibilidad total con el modelo base: el repositorio carga como Edda normal con `WhisperForConditionalGeneration.from_pretrained`, ignorando los ficheros del drafter.
- API de uso programático (`hurtig.load`, `hurtig.transcribe`, `hurtig.spec_generate`) que devuelve los token ids y el número de tokens aceptados por pasada.
- No soporta: batch size mayor de 1, marcas de tiempo ni audio de más de 30 segundos sin fragmentación previa.

## Casos de uso

- Transcripción en tiempo casi real de conversaciones telefónicas en danés: con una latencia media de 140 ms por clip de hasta 30 s en una RTX 3090, es adecuado para transcribir llamadas con retardo mínimo.
- Subtitulado rápido de contenido audiovisual danés: la aceleración de 2,39× permite procesar grandes volúmenes de vídeo con menos horas de GPU, aunque sin marcas de tiempo habrá que alinear el texto posteriormente.
- Transcripción de entrevistas y programas de radio archivados: el procesamiento por lotes de clips fragmentados a 30 s aprovecha el rendimiento sostenido del modelo.
- Servicios de dictado para aplicaciones de productividad: la salida greedy determinista y fiel al modelo base garantiza resultados consistentes entre sesiones.
- Integración en pipelines de voz a texto de bajo coste: al reducir el número de pasadas del decodificador, disminuye el coste de cómputo por hora de audio en despliegues con GPU de consumo.
- Evaluación e investigación en decodificación especulativa para ASR: el código `hurtig.py` documenta una adaptación completa de DFlash2 a Whisper, útil como referencia para replicar la técnica en otros idiomas.
- Asistentes de voz en danés con requisitos de latencia: la transcripción rápida del turno de usuario reduce la latencia total del sistema conversacional.

## Benchmarks y rendimiento

Resultados medidos de extremo a extremo (encoder incluido), batch size 1, una RTX 3090 en fp16, sobre 60 clips de máximo 30 s de cada test del leaderboard danés de ASR:

| Test set | Idéntico a greedy | Tokens por pasada de Edda | Aceleración | Edda greedy → hurtig (ms) |
|---|---|---|---|---|
| FTSpeech | 60/60 | 9,31 | 3,22× | 407 → 126 |
| FLEURS da_dk | 60/60 | 5,56 | 2,57× | 467 → 182 |
| CoRal-v3 conversation | 60/60 | 5,63 | 2,23× | 298 → 134 |
| CoRal-v3 read-aloud | 60/60 | 4,56 | 1,99× | 291 → 147 |
| Common Voice Danish | 59/60 | 5,41 | 1,91× | 218 → 114 |
| **Total** | **299/300** | **5,94** | **2,39×** | **336 → 140** |

El único clip que difiere es un empate casi exacto en precisión media (fp16): verificar un bloque de tokens en una pasada puede decantar la elección entre dos tokens de probabilidad casi igual frente a decodificarlos uno a uno. El WER publicado de Edda (8,65) corresponde a beam search con 5 beams; hurtig reproduce la salida greedy de Edda, cuyo WER es algo superior. No se han publicado valores de WER específicos de la decodificación greedy en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,4 GB en fp16 (pesos de Edda más drafter); con overhead de inferencia, aproximadamente 5-6 GB de VRAM son suficientes para batch size 1.
- GPU de referencia en las pruebas: NVIDIA RTX 3090 (24 GB) en fp16, con latencias de 114-182 ms por clip de hasta 30 s.
- Cabe en GPUs de consumo: una RTX 3060 de 12 GB o superior debería alojar el modelo completo en fp16 con holgura; no hay datos publicados para GPUs de 8 GB.
- Despliegue: el código de ejemplo usa PyTorch, transformers y safetensors directamente (con `hurtig.py` del repositorio). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; la decodificación especulativa requiere el script proporcionado, aunque el modelo base también carga con la API estándar de transformers sin el drafter.
- Throughput: no disponible más allá de las latencias por clip de la tabla de benchmarks (media de 140 ms por clip de hasta 30 s a batch size 1).

## Comparativa con modelos similares

| Característica | Edda v0.2 large hurtig | Edda v0.2 large (base) | Whisper large-v3 |
|---|---|---|---|
| Parámetros | ~1.543M (Edda + drafter de 170M) | ~1.373M (no disponible el valor exacto) | ~1.550M |
| Idioma principal | Danés | Danés | Multilingüe (99 idiomas) |
| Decodificación | Especulativa (greedy, 2,39× más rápida) | Greedy o beam search (5 beams) | Greedy o beam search |
| WER danés (leaderboard) | Igual al greedy de Edda; no disponible el valor exacto | 8,65 (con 5 beams) | No disponible en la información proporcionada |
| Marcas de tiempo | No | No disponible | Sí |
| Licencia | Apache 2.0 | Apache 2.0 | MIT |
| Uso recomendado | Velocidad en despliegue | Máxima precisión con beams | Multilingüe general |

## Limitaciones y advertencias

- Solo batch size 1: la decodificación especulativa tal como está implementada no admite procesamiento por lotes, lo que limita el throughput en servidores con muchas peticiones concurrentes.
- Solo transcripción en danés y sin marcas de tiempo; el prompt está fijado a `<|da|><|transcribe|><|notimestamps|>`.
- Clips de máximo 30 segundos: el audio más largo debe fragmentarse previamente, con el consiguiente riesgo de cortes a mitad de palabra o frase.
- La salida corresponde a la decodificación greedy de Edda, con WER algo superior al de beam search con 5 beams (WER publicado de 8,65); si se necesita la máxima precisión, conviene usar Edda original con beams.
- Un clip de cada 300 produce una transcripción ligeramente distinta a la greedy por empatés en fp16; en aplicaciones sensibles a la reproducibilidad exacta hay que tenerlo en cuenta.
- El drafter está entrenado solo con la mezcla de datos de entrenamiento de Edda (FTSpeech, CoRal-v3, NST, FLEURS, Common Voice); su rendimiento de aceleración puede degradarse con audio muy distinto de esa distribución (acentos, ruido, dominios especializados).
- No hay información publicada sobre sesgos específicos del modelo ni sobre su comportamiento con hablantes no representados en los datasets de entrenamiento; los datasets daneses usados pueden infrarepresentar acentos no estándar y condiciones acústicas adversas.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes; el modelo base whisper-large-v3 es MIT.
- Al usar el modelo, la model card pide citar y acreditar el modelo Edda original del Alexandra Institute y Danish Foundation Models.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syvai/edda-v0.2-large-hurtig
- Modelo base Edda v0.2 large: https://huggingface.co/danish-foundation-models/edda-v0.2-large
- Alexandra Institute: https://alexandra.dk
- Danish Foundation Models en HuggingFace: https://huggingface.co/danish-foundation-models
- Repositorio DFlash de z-lab: https://github.com/z-lab/dflash
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Leaderboard danés de ASR: https://huggingface.co/spaces/RyeAI/danish-asr-leaderboard
- Modelo base original Whisper: https://huggingface.co/openai/whisper-large-v3
- syv.ai: https://syv.ai
