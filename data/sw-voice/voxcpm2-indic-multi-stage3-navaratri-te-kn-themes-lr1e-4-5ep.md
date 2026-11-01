# sw-voice/voxcpm2-indic-multi-stage3-navaratri-te-kn-themes-lr1e-4-5ep

## Resumen

VoxCPM2 Indic Multi Stage 3 es un modelo de síntesis de voz (text-to-speech) desarrollado por sw-voice, un fine-tune del modelo base openbmb/VoxCPM2 especializado en clonación de voz sin referencia acústica. El modelo reproduce la voz de una persona concreta (identificada como "Swamiji") en inglés, telugu y cannáda, y de forma secundaria en tamil, sin necesidad de proporcionar un clip de referencia en tiempo de inferencia: la identidad vocal está codificada en los pesos. Cuenta con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) almacenados en formato safetensors, con un repositorio de 9,5 GB.

El modelo es la tercera etapa de un pipeline de entrenamiento de tres fases: una base multilingüe para siete lenguas indias, un ajuste fino en inglés sobre la voz objetivo y, finalmente, este ajuste fino completo (sin capas congeladas) sobre material temático de Navaratri en telugu y cannáda. Es relevante porque demuestra que es posible transferir una identidad vocal concreta a lenguas de bajos recursos mediante ajuste fino completo sobre un TTS multilingüe, manteniendo una calidad de coincidencia de voz superior al 100 % respecto a la referencia real en telugu y cannáda.

Se trata de un modelo de investigación, no de un producto listo para producción: el autor documenta explícitamente sus limitaciones (inglés más débil que la etapa 2, timbre ligeramente áspero, necesidad de servir frase a frase) y publica métricas objetivas de evaluación. La licencia Apache 2.0 facilita su reutilización, aunque la naturaleza del dato de entrenamiento (voz de una persona real) exige precaución en usos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (TTS neuronal; módulos acústicos tipo LocDiT y AudioVAE; detalles internos no disponibles) |
| Parámetros totales | 2.290.004.544 (~2,29 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | Inglés (en), telugu (te), cannáda (kn), tamil (ta) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura VoxCPM2 y se entrena con el entrenador oficial de VoxCPM. El pipeline consta de tres etapas, cada una un ajuste fino completo. La etapa 1 parte de openbmb/VoxCPM2 y entrena sobre siete lenguas indias (telugu, cannáda, tamil, malabar, sánscrito, maratí y guyaratí) con datos de IndicTTS y Rasa: 167.000 clips y 453 horas de pasadas de entrenamiento, con LR 5e-5, warmup del 15 %, una pasada, batch 1 × 16 y 14.767 pasos. La etapa 2 ajusta sobre 958 clips de inglés (5,1 h) de la voz objetivo restaurada con Sidon, con LR 1e-4 coseno, 10 épocas y 600 pasos.

La etapa 3, que corresponde a este modelo, parte de la etapa 2 y entrena sobre 127 unidades temáticas de telugu y 124 de cannáda (3,7 h en total), segmentadas por temas completos de hasta ~90 segundos sin cortes a mitad de frase y conservando las pausas reales. Se usa LR 1e-4 coseno, warmup del 15 % (48 pasos), 5 épocas, batch 1 × 4 y 315 pasos totales, con todos los parámetros entrenados (ninguna capa congelada) en 13 minutos sobre una H100. El AudioVAE nunca se entrena. El autor documenta que congelar LocDiT o los módulos acústicos durante la etapa 3 no corrige el timbre áspero, mientras que mezclar clips en inglés sí lo hace (variante `...-en-replay-lr5e-5-3ep`).

## Capacidades

- Síntesis de voz multilingüe en inglés, telugu, cannáda y tamil desde un único conjunto de pesos.
- Clonación de identidad vocal sin referencia: no requiere audio de referencia ni texto de prompt en inferencia.
- Salida de audio a 48 kHz mono.
- Generación controlable mediante `cfg_value` (guía libre de clasificador) y `inference_timesteps` (pasos de muestreo), con semilla configurable para reproducibilidad.
- Lectura de tamil funcional a través de la base multilingüe, aunque sin entrenamiento específico en la voz objetivo para ese idioma.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Audiolibros y contenido devocional en telugu y cannáda: el modelo reproduce la voz objetivo con una coincidencia medida del 102,0 % y 103,2 % respectivamente, y tasas de error de carácter del 1,9 % y 2,6 %, lo que lo hace adecuado para narración larga con segmentación por frases.
- Localización de discursos o charlas en inglés hacia telugu y cannáda: al compartir identidad vocal entre idiomas, permite doblar contenido preservando la voz del hablante original.
- Generación de material educativo multilingüe: lectura de textos en tres lenguas con una sola instancia del modelo, reduciendo la infraestructura frente a desplegar un TTS por idioma.
- Prototipado de asistentes de voz en lenguas indias: la API de VoxCPM permite integración directa en Python con control de cfg y pasos de inferencia para ajustar naturalidad frente a latencia.
- Investigación en transferencia de voz entre lenguas: el repositorio documenta el plan de entrenamiento (`train_plan.json`), los datasets y las variantes, lo que facilita reproducir o extender el experimento.
- Evaluación comparativa de TTS multilingüe: las métricas publicadas (WavLM-ECAPA, WER/CER con Whisper y Sarvam, CPPS, velocidad de habla) sirven como línea base para comparar otros fine-tunes sobre VoxCPM2.

## Benchmarks y rendimiento

Evaluación reference-free, 10 respuestas estándar por idioma, frase a frase, cfg 2, 10 pasos, semilla 0:

| Métrica | Inglés | Telugu | Cannáda | Tamil (4 respuestas) |
|---|---|---|---|---|
| Coincidencia de voz con Swamiji real (WavLM-ECAPA, % de real-vs-real) | 91,8 % | 102,0 %* | 103,2 %* | n/a |
| Errores de palabra (inglés: WER Whisper large-v3; otros: WER/CER Sarvam) | 2,0 % | 6,6 % / 1,9 % | 8,1 % / 2,6 % | 13,7 % / 5,1 % |
| Velocidad de habla, % de la de Swamiji | 126 % | 106 % | 111 % | No disponible |
| Silencio final medio | 0,26 s | 0,33 s | 0,27 s | No disponible |
| Claridad de voz (CPPS, dB; grabaciones reales: 10,3 en inglés, 8,7–8,9 en Navaratri) | 8,7 | 9,0 | 9,4 | No disponible |

\* Los clips reales de telugu y cannáda provienen de las mismas grabaciones de Navaratri usadas en entrenamiento, por lo que estos valores están inflados (por encima del 100 % significa más cercano a ese conjunto que los propios clips reales entre sí).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 2,29 mil millones de parámetros en safetensors, los pesos en fp32 ocupan aproximadamente 9,2 GB y en fp16/bf16 unos 4,6 GB, a lo que hay que sumar el estado de activaciones y el decodificador de audio.
- GPU recomendadas: el autor reporta el entrenamiento de la etapa 3 en una única H100 en 13 minutos; para inferencia no se especifican modelos concretos.
- GPU de consumo: no confirmado. Por tamaño de pesos, una GPU con 8–12 GB de VRAM podría alojar el modelo en precisión reducida, pero no hay datos publicados de latencia ni de funcionamiento en RTX 4090 o inferiores.
- Opciones de despliegue: paquete oficial `voxcpm` de Python (`VoxCPM(voxcpm_model_path=..., zipenhancer_model_path=None, enable_denoiser=False)`), con descarga vía `huggingface_hub.snapshot_download`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (stage 3, sin congelar) | ~2,29 mil M | en, te, kn, ta | No disponible | Apache 2.0 | Mejor coincidencia de voz en telugu y cannáda; inglés más débil |
| sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep | No disponible | en (base multilingüe) | No disponible | Apache 2.0 | Coincidencia de voz en inglés del 100,7 %, superior a este modelo |
| sw-voice/multilingual-vox-good | No disponible | Multilingüe | No disponible | No disponible | Variante de etapa 3 con LocDiT congelado; el timbre áspero persiste |
| sw-voice/voxcpm2-indic-multi-stage3-te-kn-themes-en-replay-lr5e-5-3ep | No disponible | en, te, kn | No disponible | No disponible | Etapa 3 con mezcla de clips en inglés; corrige parcialmente el timbre |
| openbmb/VoxCPM2 | No disponible | Multilingüe | No disponible | No disponible | Modelo base del que parte toda la cadena |

No se dispone de comparación con modelos TTS de otros autores (por ejemplo, XTTS, Bark o F5-TTS) en la información proporcionada.

## Limitaciones y advertencias

- El inglés es más débil que en la etapa 2 (91,8 % frente a 100,7 % de coincidencia de voz) y habla aproximadamente un 26 % más rápido que la referencia real.
- Timbre ligeramente áspero en todos los idiomas: reproduce la aspereza de las grabaciones de Navaratri (CPPS 8,7–9,4) frente a las grabaciones en inglés (10,3). Congelar LocDiT o los módulos acústicos no lo corrige.
- El tamil funciona solo por transferencia desde la base multilingüe; nunca se entrenó con la voz objetivo en tamil, y sus errores son mayores (WER 13,7 %).
- Debe servirse frase a frase: respuestas completas de varias frases pueden omitir líneas en los modelos VoxCPM2 entrenados en telugu.
- Las métricas de telugu y cannáda están infladas por solapamiento entre los datos de evaluación y los de entrenamiento (mismas grabaciones de Navaratri).
- Riesgo de uso indebido: el modelo sintetiza la voz de una persona real identificable. Aunque la licencia es Apache 2.0, el uso comercial o la publicación de audio sintético exige considerar derechos de imagen y voz, consentimiento y normativa aplicable.
- No se documentan sesgos demográficos ni de otro tipo; tampoco se documenta el comportamiento fuera de los cuatro idiomas indicados.
- Modelo de investigación con 20 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-navaratri-te-kn-themes-lr1e-4-5ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Modelo original: https://huggingface.co/openbmb/VoxCPM2
- Etapa 1 (base multilingüe): https://huggingface.co/sw-voice/voxcpm2-indic-multi-lr5e-5-1ep
- Variante con LocDiT congelado: https://huggingface.co/sw-voice/multilingual-vox-good
- Variante con replay en inglés: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-te-kn-themes-en-replay-lr5e-5-3ep
- Selección más reciente (multilingual maya): https://huggingface.co/sw-voice/best-2-multilingual-maya
- Selección más reciente (multilingual vox): https://huggingface.co/sw-voice/best-2-multilingual-vox
- Dataset de voz en inglés: https://huggingface.co/datasets/sw-voice/swamiji-voice-sft-sidon
- Dataset de temas en telugu: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Dataset de temas en cannáda: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-kannada-sidon-themes
- Demo de muestras: https://huggingface.co/spaces/sw-voice/swamiji-telugu-kannada-samples
