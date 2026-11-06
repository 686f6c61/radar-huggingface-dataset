# sw-voice/multilingual-vox-good

## Resumen

Swamiji VoxCPM2 multilingual-vox-good es un modelo de síntesis de voz (text-to-speech) desarrollado por sw-voice, un fine-tune de VoxCPM2 especializado en replicar la voz de una persona concreta (identificada como "Swamiji") en tres idiomas: inglés, telugu y kannada. El modelo parte de la familia VoxCPM2 de openbmb y se ha entrenado en tres etapas sucesivas con el entrenador oficial: una base multilingüe sobre siete idiomas índicos, un ajuste en inglés con la voz objetivo y un ajuste final en telugu y kannada. Su rasgo diferencial es que la voz está codificada en los pesos, de modo que no requiere un clip de referencia ni texto de prompt en el momento de la inferencia.

El modelo tiene 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) almacenados en safetensors, con un repositorio de 9,5 GB. Es un modelo de investigación, no un producto listo para producción, y su relevancia actual radica en que demuestra que es posible transferir una identidad vocal concreta a idiomas de bajos recursos como el telugu y el kannada manteniendo una precisión de lectura alta (CER del 2,2 % y 2,4 % respectivamente), algo poco habitual en modelos TTS multilingües de este tamaño.

La innovación técnica principal de esta variante es el congelamiento del decodificador acústico LocDiT (`feat_decoder`, 212 millones de parámetros) durante la tercera etapa, de forma que el decodificador final sigue siendo el de la etapa inglesa. El resultado es un modelo que sirve los tres idiomas con un único conjunto de pesos, a 48 kHz mono, con un compromiso claro: el telugu y el kannada se acercan mucho a la voz real, mientras que el inglés es el más flojo de la familia multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (modelo TTS con decodificador acústico LocDiT/`feat_decoder` y AudioVAE no entrenado en este fine-tune) |
| Parametros totales | 2.290.004.544 (2,29 B); decodificador LocDiT: 212 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación por frases; unidades de tema de hasta ~90 s en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés), te (telugu), kn (kannada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 48 kHz mono |
| Modelo base | sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep |
| Pipeline | text-to-speech |
| Descargas / likes | 26 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la receta del entrenador oficial de VoxCPM2 en tres etapas. La etapa 1 construye una base multilingüe a partir de `openbmb/VoxCPM2` con siete idiomas índicos (telugu, kannada, tamil, malabar, sánscrito, maratí y guyaratí), usando IndicTTS y Rasa: 167.000 clips y 453 horas de pasadas de entrenamiento, con LR 5e-5, warmup del 15 %, una pasada, batch 1 × 16 y 14.767 pasos. La etapa 2 ajusta la voz objetivo en inglés sobre el dataset `swamiji-voice-sft-sidon` (958 clips, 5,1 h, restaurados con Sidon), con LR 1e-4 coseno, warmup del 15 %, 10 épocas, batch 1 × 16 y 600 pasos, entrenando todos los parámetros.

La etapa 3, que produce este modelo, parte de la etapa 2 y entrena sobre `swamiji-navaratri-telugu-sidon-themes` y `swamiji-navaratri-kannada-sidon-themes`: 127 y 124 unidades de tema completas de hasta unos 90 segundos, sin cortes a mitad de frase y conservando las pausas reales, lo que suma 3,7 horas de audio restaurado con Sidon. Se usa LR 1e-4 coseno, warmup del 15 % (48 pasos), 5 épocas, batch 1 × 4 y 315 pasos, todo ello en una sola H100. La decisión arquitectónica clave es que los parámetros `feat_decoder.*` quedan congelados y excluidos del optimizador AdamW, mientras que el resto de parámetros sí se entrenan; el AudioVAE no se entrena en ninguna etapa. El modelo se generó con `cfg_value=2.0`, 10 pasos de inferencia y semilla 0, sin audio de referencia.

## Capacidades

- Síntesis de voz multilingüe en inglés, telugu y kannada con una única identidad vocal codificada en los pesos.
- Generación sin referencia: no necesita clip de audio ni texto de prompt para clonar la voz.
- Salida de audio a 48 kHz mono.
- Control de la generación mediante `cfg_value`, número de pasos de inferencia (`inference_timesteps`) y semilla (`seed`).
- Lectura precisa en telugu y kannada (CER del 2,2 % y 2,4 % en la evaluación del autor).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente TTS.
- No se documentan capacidades de visión, audio de entrada ni modo de pensamiento.
- No se documenta capacidad de control de estilo, emoción o prosodia más allá de los parámetros de muestreo.

## Casos de uso

- Audiolibros y contenido devocional en telugu y kannada: el modelo puede narrar textos largos manteniendo una voz consistente sin necesidad de referencia, siempre que se sirva frase a frase para evitar saltos de línea.
- Locución de vídeos y pódcast en inglés con la voz objetivo: adecuado cuando prima la identidad vocal sobre la naturalidad absoluta, dado que el inglés habla un 32 % más rápido que la voz real.
- Accesibilidad y lectura de textos para hablantes de telugu y kannada: la baja tasa de error de carácter (2,2 % y 2,4 %) permite convertir documentos en audio inteligible con fidelidad razonable.
- Prototipado de asistentes de voz multilingües: sirve para validar flujos de conversación en tres idiomas con un solo modelo de 2,29 B y licencia Apache 2.0.
- Investigación en transferencia de identidad vocal: el congelamiento de LocDiT permite estudiar cuánto de la calidad depende del decodificador frente al condicionamiento del modelo de lenguaje.
- Generación de material de muestra para evaluación subjetiva: los espacios de muestras del autor y la inferencia sin referencia facilitan comparar variantes (con y sin congelación) de forma controlada.
- Doblaje de contenido educativo corto: con unidades de hasta 90 s y pausas naturales conservadas en el entrenamiento, el modelo puede abordar fragmentos de clase o meditaciones guiadas.

## Benchmarks y rendimiento

Evaluación del autor: diez respuestas estándar por idioma, generadas sin referencia, frase a frase, `cfg 2`, 10 pasos, semilla 0.

| Métrica | Inglés | Telugu | Kannada |
|---|---|---|---|
| Coincidencia de voz con el Swamiji real (WavLM-ECAPA, % de real-vs-real) | 83,0 % | 96,4 %* | 98,3 %* |
| Errores de palabra (EN: WER con Whisper large-v3; otros: WER/CER con Sarvam) | 1,5 % | 8,3 % / 2,2 % | 7,5 % / 2,4 % |
| Velocidad de habla, % de la del Swamiji | 132 % | 108 % | 114 % |
| Silencio final medio | 0,23 s | 0,30 s | 0,26 s |
| Claridad de voz (CPPS, dB; grabaciones reales: 10,3 en inglés, 8,7–8,9 en Navaratri) | 8,9 | 8,7 | 9,3 |

\* Los clips reales de telugu y kannada provienen de las mismas grabaciones Navaratri usadas en el entrenamiento, por lo que estas cifras están infladas.

Comparación con la etapa 3 sin congelación (`voxcpm2-indic-multi-stage3-navaratri-te-kn-themes-lr1e-4-5ep`): coincidencia de voz de 91,8 / 102,0 / 103,2 % y CER de 1,9 % / 2,6 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 2,29 B de parámetros en safetensors, el peso en FP16 ronda los 4,6 GB, por lo que en la práctica encaja en GPUs de consumo con suficiente memoria, aunque el dato exacto no está documentado.
- GPU recomendadas: el autor entrenó la etapa 3 en una sola H100; para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 y similares con 24 GB, y probablemente en GPUs de 8–12 GB si se dispone de cuantización, pero no hay datos publicados al respecto.
- Opciones de despliegue: la única vía documentada es la librería `voxcpm` de Python (`VoxCPM(voxcpm_model_path=path, zipenhancer_model_path=None, enable_denoiser=False)`), cargando el modelo con `snapshot_download`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica la configuración de inferencia (`cfg_value=2.0`, `inference_timesteps=10`).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / unidades | Licencia | Notas |
|---|---|---|---|---|---|
| sw-voice/multilingual-vox-good (este) | 2,29 B | en, te, kn | frases; temas de hasta ~90 s en entrenamiento | Apache 2.0 | LocDiT congelado; inglés más flojo (83,0 % de coincidencia) |
| sw-voice/voxcpm2-indic-multi-stage3-navaratri-te-kn-themes-lr1e-4-5ep | no disponible | te, kn (con base índica) | no disponible | Apache 2.0 (según repo base) | Misma receta sin congelar; coincidencia de voz 91,8 / 102,0 / 103,2 % y CER 1,9 % / 2,6 % |
| sw-voice/best-2-multilingual-vox | no disponible | multilingüe | no disponible | no disponible | Selección posterior del autor (2026-10-31), sin datos públicos en esta información |
| openbmb/VoxCPM2 | no disponible | multilingüe | no disponible | no disponible | Modelo base original de la familia |

No se dispone de datos de benchmarks estándar ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El inglés es el idioma más débil de la familia multilingüe: 83,0 % de coincidencia de voz y una velocidad de habla un 32 % superior a la real.
- El timbre es ligeramente áspero (CPPS 8,7–9,3); el congelamiento de LocDiT no elimina la aspereza de las grabaciones Navaratri, que se transmite por el condicionamiento del modelo de lenguaje.
- Las métricas de coincidencia de voz en telugu y kannada están infladas porque los clips reales de referencia provienen de las mismas grabaciones usadas en entrenamiento.
- Es obligatorio servir el modelo frase a frase: las respuestas completas de varias frases pueden saltarse líneas en los modelos VoxCPM2 entrenados con telugu.
- Riesgo de alucinación y de errores de pronunciación en textos fuera del dominio de entrenamiento; no se documentan sesgos específicos.
- Modelo de investigación: no hay garantías de robustez en producción, ni datos de latencia, throughput o cuantización.
- La licencia Apache 2.0 permite uso comercial, pero la identidad vocal replicada puede estar sujeta a derechos de imagen o voz de la persona real; conviene revisar el marco legal antes de un uso comercial.
- Solo se soportan tres idiomas; no hay soporte documentado de otros idiomas índicos pese a la base multilingüe de siete lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/multilingual-vox-good
- Modelo base (etapa 2): https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Etapa 1 multilingüe: https://huggingface.co/sw-voice/voxcpm2-indic-multi-lr5e-5-1ep
- Etapa 3 sin congelación: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-navaratri-te-kn-themes-lr1e-4-5ep
- Selección posterior del autor: https://huggingface.co/sw-voice/best-2-multilingual-maya
- Selección posterior del autor: https://huggingface.co/sw-voice/best-2-multilingual-vox
- Dataset de voz en inglés: https://huggingface.co/datasets/sw-voice/swamiji-voice-sft-sidon
- Dataset de temas en telugu: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Dataset de temas en kannada: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-kannada-sidon-themes
- Demo de muestras: https://huggingface.co/spaces/sw-voice/swamiji-telugu-kannada-samples
- Modelo original de la familia: https://huggingface.co/openbmb/VoxCPM2
