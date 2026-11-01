# sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep

## Resumen

voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en HuggingFace. Se trata de un ajuste fino completo (full fine-tune) del modelo base sw-voice/voxcpm2-indic-multi-lr5e-5-1ep, entrenado con el trainer oficial de VoxCPM sobre el conjunto de datos sw-voice/swamiji-voice-sft-sidon, compuesto por 958 clips en inglés de la voz "Swamiji" restaurada con Sidon. El modelo tiene 2.290.004.544 parámetros y un repositorio de 9,5 GB en formato safetensors.

La relevancia del modelo es acotada y de carácter investigador: se trata de un experimento de ajuste fino sobre una arquitectura TTS ya existente, orientado a clonar una voz concreta sin referencia en tiempo de inferencia (reference-free), es decir, con la identidad vocal embebida en los pesos. No se trata de un modelo generalista de nueva generación, sino de una variante especializada para un hablante y un idioma concretos.

La model card está marcada explícitamente como "(research)" y no documenta arquitectura interna, composición completa del dataset ni resultados de evaluación. La información disponible se limita a los hiperparámetros de entrenamiento, los idiomas declarados (inglés, telugu y canarés) y la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de la familia VoxCPM; detalles internos no documentados) |
| Parametros totales | 2.290.004.544 (2,29 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés), te (telugu), kn (canarés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de documentación sobre la arquitectura interna del modelo en la información proporcionada. El modelo pertenece a la familia VoxCPM y se ha entrenado con el trainer oficial de VoxCPM, lo que sugiere una arquitectura TTS propia de ese proyecto, pero no se detallan componentes como el codificador de texto, el decodificador acústico, el vocoder ni el mecanismo de modelado de voz.

El proceso de entrenamiento sí está parcialmente documentado: full fine-tune del modelo base sw-voice/voxcpm2-indic-multi-lr5e-5-1ep sobre el dataset sw-voice/swamiji-voice-sft-sidon, usando los 958 clips en inglés de la voz Swamiji restaurados con Sidon. Se empleó micro-batch 1 con acumulación de 16, 10 épocas (600 pasos totales), learning rate 0,0001 con scheduler coseno, 90 pasos de warmup y grad clip de 1,0, entrenando todos los parámetros. El modelo es reference-free: la identidad vocal queda codificada en los pesos y no requiere audio de referencia en inferencia. No se especifica el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y canarés, según los idiomas declarados en la model card.
- Clonación de voz sin referencia (reference-free): la voz objetivo está embebida en los pesos del modelo, por lo que no se necesita un clip de referencia en el momento de la inferencia.
- Reproducción de una identidad vocal concreta (la voz "Swamiji") a partir de texto, gracias al ajuste fino sobre 958 clips de ese hablante.
- Generación de audio a partir de texto con transcripciones de referencia (transcript_v y transcript en filas no ASCII), lo que sugiere soporte de texto con caracteres no ASCII para los idiomas indicados.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Síntesis de voz personalizada para un hablante concreto: el modelo genera audio en inglés con la identidad vocal de Swamiji sin necesidad de aportar un clip de referencia, lo que simplifica el despliegue en entornos donde no se dispone de muestras de voz en tiempo real.
- Investigación en clonación de voz: sirve como base para estudiar el efecto del full fine-tune y de distintas tasas de aprendizaje (lr 1e-4 frente a 5e-5) sobre la calidad y fidelidad de la voz clonada en un modelo TTS de 2,29 mil millones de parámetros.
- Generación de audiolibros o contenido narrado en inglés: al estar entrenado sobre 958 clips de un mismo hablante, es adecuado para producir narraciones largas con una voz consistente, siempre que se valide la estabilidad en textos extensos.
- Evaluación comparativa de etapas de entrenamiento: al ser una "stage2" de un pipeline multi-stage, permite comparar el impacto de la segunda fase de ajuste frente al modelo base en métricas de similitud de hablante y naturalidad.
- Prototipado de asistentes de voz multilingües para inglés, telugu y canarés: los tres idiomas declarados permiten experimentar con síntesis en lenguas del sur de la India, aunque la calidad real en te y kn no está documentada.
- Docencia y demostraciones de TTS: por su licencia Apache 2.0 y su tamaño moderado (2,29 mil millones de parámetros), puede emplearse en entornos académicos para ilustrar pipelines de ajuste fino de modelos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 2,29 mil millones de parámetros en fp16 requiere aproximadamente 4,6 GB solo para los pesos, a lo que hay que sumar memoria para activaciones, buffers de audio y el vocoder si lo hubiera; en fp32 serían unos 9,2 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090 con 24 GB), pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con 8-12 GB o más en precisión reducida, según la estimación por tamaño; no confirmado.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el pipeline `text-to-speech` de Transformers más allá de la etiqueta del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep | 2,29 mil millones | no disponible | en, te, kn | Apache 2.0 | Full fine-tune de investigación sobre voz concreta |
| sw-voice/voxcpm2-indic-multi-lr5e-5-1ep (modelo base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva este ajuste |
| Otros modelos TTS de la familia VoxCPM | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o calidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo marcado como "(research)" por el autor: no está pensado ni validado para uso en producción.
- Entrenado sobre un único hablante (voz Swamiji) y únicamente con clips en inglés; la calidad en telugu y canarés, aunque declarados como idiomas soportados, no está documentada ni evaluada.
- Riesgo de sobreajuste al dataset de 958 clips: la diversidad prosódica y de dominio es limitada, lo que puede reducir la naturalidad fuera del estilo del corpus.
- No se documentan sesgos, pero al derivar de un corpus de un solo hablante, la voz generada reproducirá sus características y posibles particularidades acentuales.
- Riesgo de alucinación o artefactos en la síntesis: no hay métricas publicadas de inteligibilidad (WER), similitud de hablante (SECS) ni MOS que permitan acotar el riesgo.
- Licencia Apache 2.0 permite uso comercial, pero la identidad vocal clonada puede estar sujeta a derechos de imagen o consentimiento del hablante original; conviene verificar la procedencia del dataset swamiji-voice-sft-sidon antes de un uso comercial.
- No se especifican requisitos de hardware ni métodos de cuantización, lo que dificulta planificar el despliegue.
- El repositorio tiene 9,5 GB, coherente con pesos en precisión alta; el almacenamiento y la transferencia deben tenerse en cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-lr5e-5-1ep
- Dataset de entrenamiento: https://huggingface.co/datasets/sw-voice/swamiji-voice-sft-sidon
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
