# sw-voice/indicF5-best

## Resumen

indicF5-best es un checkpoint de investigación de síntesis de voz (text-to-speech) en telugu, desarrollado por sw-voice. Se trata de un ajuste fino de la familia F5-TTS sobre el modelo base ai4bharat/IndicF5, especializado en la voz de un hablante concreto ("Swamiji") a partir de discursos en telugu. El modelo resuelve el problema de clonar una voz específica en un idioma de bajos recursos como el telugu, manteniendo inteligibilidad y similitud de timbre.

Arquitectura y tamaño: es un modelo F5-TTS (transformer de difusión por flow matching para TTS) con 337.096.836 parámetros totales, empaquetado en safetensors y con un repositorio de 1,3 GB. No se dispone de información sobre la longitud de contexto en el material proporcionado, ya que en TTS el concepto de contexto se refiere a la longitud de audio de referencia y del texto a sintetizar.

Su relevancia es acotada: es un checkpoint de investigación con licencia research-only, orientado a experimentación con voces de bajos recursos y no a producción comercial. La model card documenta un pipeline de entrenamiento en dos etapas y una evaluación comparativa frente al modelo base y a una alternativa (VoxCPM2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (transformer de difusion para text-to-speech, familia F5) |
| Parametros totales | 337.096.836 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor recomienda usar float32 (float16 produce ruido en la familia IndicF5) |
| Idiomas soportados | telugu (te) |
| Licencia | research-only (licencia "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia F5-TTS, un sistema de síntesis de voz basado en flow matching con un transformer como backbone, ajustado mediante el script `finetune_cli` de SWivid/F5-TTS versión 1.1.22 con configuración F5TTS_Base y el vocabulario de IndicF5 (tokenizer `custom`). El entrenamiento se realizó en bf16, con learning rate 1e-5, batch de 9.600 frames y gradient clipping de 1.0.

El proceso es de dos etapas sobre el checkpoint `sw-voice/indicf5-swamiji-te-navaratri-10ep` (IndicF5 más 10 épocas sobre 402 clips de Navaratri). La etapa A consistió en 1 época sobre 15.364 fragmentos recortados por VAD (hasta 25 s, con clips individuales de hasta 30 s, ya que el loader de F5 descarta audios de más de 30 s) procedentes del dataset `sw-voice/swamiji-telugu-reuse-train` sin shlokas (temas Mahabharatam, Bhagavatam y Datta Maata, 82,97 h limpias), más los 402 clips de Navaratri, totalizando 15.766 muestras y 83,41 h. Esto supuso 3.302 actualizaciones en 8,6 minutos sobre una H100. La etapa B consistió en 5 épocas sobre los 402 clips de Navaratri (355 actualizaciones, 1,7 minutos, warm-up 70) partiendo de los pesos online de la etapa A con una EMA nueva. Los pesos publicados son los pesos online en float32 bajo claves `ema_model.*`.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu a partir de texto.
- Clonación de voz zero-shot mediante clip de referencia (la evaluación usó el clip `p3R1wZLty6A_029` de 10 s).
- Generación de habla con control de parámetros de inferencia: nfe 32, cfg 2, sway −1 y speed 1 en la configuración de evaluación.
- Reproducción de prosodia y pausas cercanas a la voz real del hablante (ver benchmarks).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe: únicamente telugu.

## Casos de uso

- Investigación en TTS de bajos recursos: permite estudiar técnicas de ajuste fino de F5-TTS sobre un idioma con pocos datos (telugu) y evaluar la degradación de CER/WER frente a la similitud de voz con distintas recetas de entrenamiento.
- Clonación de voz para locuciones en telugu: con un clip de referencia de unos 10 s se puede generar habla con el timbre del hablante, útil en experimentos de doblaje o audiolibros no comerciales.
- Evaluación comparativa de checkpoints: sirve como punto de referencia (stage B) frente a la etapa A y al modelo base para medir el efecto de reajustar sobre un subconjunto pequeño (402 clips de Navaratri).
- Generación de material de estudio lingüístico: síntesis de frases en telugu para corpus de investigación en fonética y prosodia.
- Pruebas de robustez de TTS: análisis de pausas, pitch y estabilidad con textos largos (respuestas completas de 10 unidades en la evaluación).
- Reproducción de experimentos de la familia IndicF5: al compartir vocabulario y receta, permite replicar y extender el pipeline de dos etapas documentado por el autor.

## Benchmarks y rendimiento

Evaluación sobre 10 respuestas completas en telugu con semillas 0 y 1, según la model card:

| Metrica | Stage A (1 epoca, 83 h) | Stage A + 5 epocas Navaratri | Base (Navaratri 10ep) | best-vox (VoxCPM2) |
|---|---|---|---|---|
| Similitud de voz, WavLM-ECAPA (% real vs real) | 95,9 | 96,6 | 95,7 | 96,6 |
| CER / WER, MAI-Transcribe-2 (%) | 1,27 / 7,5 | 1,84 / 8,4 | 1,24 / 6,7 | 1,15 / 7,6 |
| Dispersion de pitch (semitonos; real 4,55) | 3,89 | 3,91 | 4,03 | 4,17 |
| Pausas por minuto, cortas / de frase / largas (real 7,1 / 14,0 / 0,6) | 9,2 / 10,0 / 0,2 | 8,4 / 10,6 / 0,4 | 11,4 / 10,7 / 0,0 | 9,8 / 10,6 / 3,0 |
| Brecha de prosodia Gemini vs base (ambos ordenes) | −0,29 | −0,03 (empate) | no disponible | no disponible |
| Brecha de prosodia Gemini vs best-vox (ambos ordenes) | +0,53 | +0,76 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 337 M de parámetros en float32 el peso del modelo ronda 1,3 GB, por lo que la VRAM necesaria es modesta y vendrá dominada por el audio de referencia y el pipeline de inferencia.
- GPU recomendadas: el autor documenta entrenamiento en una H100 (8,6 min para la etapa A); para inferencia no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; por tamaño (337 M de parámetros) es plausible en GPU de consumo, pero no se confirma.
- Opciones de despliegue: librería `f5-tts` (F5TTS_Base con el `vocab.txt` del repositorio); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles; la evaluación usa nfe 32 con cfg 2, lo que implica 32 pasos de muestreo por generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indicF5-best (este modelo) | 337 M | no disponible | CER 1,84 % / WER 8,4 %; similitud 96,6 % | research-only | HuggingFace |
| Base Navaratri 10ep (sw-voice/indicf5-swamiji-te-navaratri-10ep) | no disponible | no disponible | CER 1,24 % / WER 6,7 %; similitud 95,7 % | no disponible | HuggingFace |
| best-vox (VoxCPM2) | no disponible | no disponible | CER 1,15 % / WER 7,6 %; similitud 96,6 % | no disponible | no disponible |
| ai4bharat/IndicF5 | no disponible | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Licencia research-only: no permite uso comercial sin autorización expresa del autor.
- Modelo mono-hablante y mono-idioma (telugu); no generaliza a otras voces ni lenguas.
- El autor advierte que la familia IndicF5 produce ruido en float16; debe usarse float32, lo que aumenta el uso de memoria.
- El loader de F5 descarta audios de más de 30 s, lo que limita la longitud de los clips de referencia y de entrenamiento.
- Riesgo de alucinación o artefactos en la síntesis no cuantificado en la model card; el CER/WER de 1,84 %/8,4 % indica errores de pronunciación o inteligibilidad no despreciables.
- La evaluación se limita a 10 respuestas con 2 semillas, por lo que la evidencia estadística es reducida.
- El modelo es un checkpoint de investigación (experimento 06, stage B) y no se presenta como versión estable para producción.
- No se documentan sesgos específicos ni evaluaciones de robustez ante textos fuera de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/indicF5-best
- Modelo base (Navaratri 10ep): https://huggingface.co/sw-voice/indicf5-swamiji-te-navaratri-10ep
- Etapa A: https://huggingface.co/sw-voice/indicf5-swamiji-te-87h-1ep
- Modelo base original: https://huggingface.co/ai4bharat/IndicF5
- Dataset de entrenamiento: https://huggingface.co/datasets/sw-voice/swamiji-telugu-reuse-train
- Repositorio de código F5-TTS: https://github.com/SWivid/F5-TTS
- Código de experimentos (swamiji-tts): `research/exp-iterations/07-f5-tts/experiments/06-indicf5-te87h-two-stage/`
