# sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep

## Resumen

VoxCPM2 Stage A TE es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, un fine-tune completo del modelo base `sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep`. El modelo está diseñado para generar voz en inglés y en dos lenguas del sur de la India, telugu (te) y kannada (kn), con especial énfasis en el telugu gracias al corpus de entrenamiento utilizado. Resuelve el problema de la síntesis de voz multilingüe en un contexto de investigación sobre voces índicas, y es relevante por su enfoque "reference-free": la identidad de la voz está embebida en los pesos del modelo, sin necesidad de un audio de referencia en tiempo de inferencia.

El modelo cuenta con 2.290.004.544 parámetros (~2,29 mil millones) en formato safetensors, con un repositorio de 37 GB, lo que sugiere la presencia de múltiples checkpoints intermedios (25/50/75% de la época) además de los pesos finales. Está liberado bajo licencia Apache 2.0, lo que permite uso comercial, aunque la model card lo etiqueta explícitamente como "research".

Se trata de un fine-tune de una sola época (385 pasos) sobre un corpus de 87,1 horas de telugu más aproximadamente 3 horas de inglés duplicadas, entrenado con el trainer oficial de VoxCPM. Su naturaleza experimental y el hecho de tener cero descargas y cero likes en HuggingFace lo sitúan como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM (modelo de TTS con flow-matching; detalles internos no disponibles) |
| Parámetros totales | 2.290.004.544 (~2,29 B) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés), te (telugu), kn (kannada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VoxCPM, un sistema de TTS que emplea flow-matching para la generación de audio. Según la model card, el entrenamiento utilizó flow-matching con `t = sigmoid(N(1.0, 1))`, un esquema de muestreo del tiempo de difusión/flow durante el entrenamiento. El fine-tune se realizó con el trainer oficial de VoxCPM sobre el modelo base `sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep`, sin congelar ningún parámetro ("nothing frozen", "all parameters trained").

Los datos de entrenamiento consistieron en el corpus `sw-voice/swamiji-telugu-reuse-train` (87,1 horas de telugu: Mahabharatam, Bhagavatam, Datta Maata y temas completos de Navaratri con pausas reales y shlokas, en modo RE-USE) más aproximadamente 3 horas de `sw-voice/swamiji-voice-sft-reuse` (inglés) repetidas dos veces. Se entrenó 1 época con micro-batch 1 × acumulación 16 (batch efectivo 16), totalizando 385 pasos. La tasa de aprendizaje fue 5e-5 con `base_lm.*` a 3e-4, scheduler coseno, warmup de 58 pasos y grad clip 1.0. Los checkpoints intermedios al 25%, 50% y 75% de la época están disponibles bajo `checkpoints/`. El modelo es "reference-free": la voz queda codificada en los pesos y no requiere audio de referencia en inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz sin referencia de audio (reference-free): la identidad vocal está embebida en los pesos.
- Reproducción de pausas reales y prosodia derivada del corpus de entrenamiento (temas con pausas y shlokas).
- Capacidad multilingüe limitada a los tres idiomas indicados (en, te, kn).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de TTS).
- No se documentan capacidades de visión, audio de entrada ni modo "thinking".

## Casos de uso

- Síntesis de narración de textos religiosos o épicos en telugu: el corpus de entrenamiento (Mahabharatam, Bhagavatam, Datta Maata, Navaratri) hace que el modelo sea adecuado para locutar pasajes con pausas y shlokas, respetando la prosodia aprendida.
- Generación de audiolibros en telugu: con 87,1 horas de material de referencia, el modelo puede producir narración continua de textos largos en ese idioma.
- Localización de contenido a kannada e inglés: permite generar versiones de voz en los tres idiomas soportados para un mismo producto o campaña.
- Investigación en TTS índico: sirve como punto de partida (fine-tune) para experimentos sobre voces del sur de la India, dado que es un artefacto de investigación con checkpoints intermedios publicados.
- Prototipado de asistentes de voz en inglés: aunque el inglés se entrenó con solo ~3 horas duplicadas, puede usarse para validar pipelines de TTS antes de un fine-tune específico.
- Generación de voz para contenido educativo o devocional: la voz "reference-free" simplifica el despliegue, ya que no requiere gestionar audios de referencia por petición.
- Evaluación comparativa de estrategias de fine-tune: al ser un experimento con LR diferenciado (`base_lm.*` a 3e-4) y checkpoints al 25/50/75%, es útil para estudiar el efecto del sobreentrenamiento en TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 2,29 B parámetros en fp16 requiere aproximadamente 4,6 GB solo para pesos, más memoria para activaciones y buffers de audio; en fp32 serían unos 9,2 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3090/4090 (24 GB) en fp16, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño de pesos, pero no está verificado ni documentado.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de TTS, requeriría el runtime específico de VoxCPM).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep | ~2,29 B | no disponible | en, te, kn | Apache 2.0 | HuggingFace (0 descargas) |
| sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de TTS multilingüe (p. ej. XTTS, Bark, VITS) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo etiquetado como "research": no está validado para producción y tiene 0 descargas y 0 likes, sin evidencia de uso comunitario.
- El inglés se entrenó con solo ~3 horas duplicadas, por lo que la calidad en inglés probablemente sea inferior a la del telugu; no hay métricas que lo confirmen.
- El kannada figura en los metadatos de idioma, pero el corpus descrito no menciona datos específicos de kannada, lo que genera incertidumbre sobre su calidad real.
- Riesgo de alucinación y artefactos de audio: no documentado, pero inherente a modelos generativos de voz.
- Sesgos: el corpus proviene de una única fuente (swamiji), por lo que la voz y el estilo estarán sesgados hacia ese hablante y registro; no hay diversidad de hablantes documentada.
- La naturaleza "reference-free" implica que no se puede elegir una voz arbitraria en inferencia; la identidad vocal está fijada en los pesos.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y la falta de validación desaconsejan su uso en producción sin evaluación previa.
- El repositorio de 37 GB incluye checkpoints intermedios, lo que aumenta los requisitos de almacenamiento.
- No se documentan limitaciones de contexto ni de longitud de texto de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stageA-te-reuse87h-en2x-baselm3e-4-acc16-1ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Dataset de entrenamiento (telugu): sw-voice/swamiji-telugu-reuse-train (referenciado en la model card; URL no proporcionada)
- Dataset de entrenamiento (inglés): sw-voice/swamiji-voice-sft-reuse (referenciado en la model card; URL no proporcionada)
- Código: swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (repositorio no enlazado en la información)
