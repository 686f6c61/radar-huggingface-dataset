# sw-voice/voxcpm2-stage3-te-kn-frozen-locdit-tmu0.3

## Resumen

voxcpm2-stage3-te-kn-frozen-locdit-tmu0.3 es un modelo de síntesis de voz (text-to-speech) desarrollado por sw-voice, un ajuste fino completo del modelo base sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep. El modelo está especializado en la generación de voz en inglés, telugu y kannada, y forma parte de una línea de investigación sobre voces sintéticas entrenadas con datos de temática devocional (Sidon themes). Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones), se distribuye en formato safetensors con licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque experimental: es un ablation study (denominado P03) que modifica la distribución del parámetro de tiempo `t` en el proceso de flow-matching, sustituyendo la distribución original N(-0,4, 1) por sigmoid(N(0,3, 1)). Además, congela el módulo LocDiT durante el entrenamiento, lo que permite aislar el efecto de la variación temporal sobre la prosodia. Es un modelo de investigación, no un producto listo para producción, y su valor principal es documentar cómo afectan estas decisiones de diseño a la calidad de la síntesis vocal en lenguas indias.

El modelo es "reference-free": la identidad de la voz está codificada directamente en los pesos, por lo que no requiere un audio de referencia en el momento de la inferencia. Esto simplifica el despliegue en comparación con sistemas de clonación de voz que necesitan muestras del hablante objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (text-to-speech, flow-matching con modulo LocDiT congelado) |
| Parametros totales | 2.290.004.544 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles), te (telugu), kn (kannada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VoxCPM2, un sistema de síntesis de voz basado en flow-matching. En este ajuste fino se congela el módulo LocDiT (un componente del pipeline de generación) y se entrena el resto de parámetros con el entrenador oficial de VoxCPM. La innovación técnica principal es la modificación de la distribución del tiempo de flujo: en lugar de muestrear `t` de N(-0,4, 1), se muestrea de sigmoid(N(0,3, 1)), lo que constituye la ablación de prosodia P03. Este cambio altera cómo el modelo interpola entre ruido y audio durante el entrenamiento, con el objetivo de influir en la naturalidad y el ritmo del habla generada.

Los datos de entrenamiento provienen de los conjuntos sw-voice/swamiji-navaratri-telugu-sidon-themes y sw-voice/swamiji-navaratri-kannada-sidon-themes, con 127 y 124 unidades temáticas completas respectivamente. El entrenamiento se realizó con micro-batch de 1 y acumulación de gradiente de 4, durante 5 épocas (315 pasos), con tasa de aprendizaje 0,0001, scheduler coseno, warmup de 48 pasos y recorte de gradiente de 1,0. Se entrenaron todos los parámetros (full fine-tune) y el modelo es reference-free: no necesita audio de referencia para generar voz. No se especifica el número total de tokens de audio ni la composición detallada del dataset más allá de las unidades temáticas mencionadas.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz sin necesidad de audio de referencia (reference-free), con la identidad vocal embebida en los pesos.
- Entrenamiento orientado a prosodia devocional (Sidon themes), lo que puede producir un estilo de habla particular.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documenta soporte de control fino de emociones, velocidad o tono más allá de lo que permita el modelo base.
- Capacidad multilingüe limitada a los tres idiomas indicados.

## Casos de uso

- Investigación en síntesis de voz para lenguas indias: el modelo sirve como punto de comparación en estudios de ablación sobre flow-matching y prosodia, gracias a su configuración experimental documentada (P03, LocDiT congelado).
- Generación de audiolibros o contenido devocional en telugu y kannada: el entrenamiento con temas Sidon lo hace adecuado para narrar textos religiosos o espirituales en esas lenguas, con una voz consistente sin necesidad de referencia.
- Prototipado de asistentes de voz en inglés con acento o estilo indio: al estar ajustado sobre un modelo multilingüe indio, puede emplearse para probar interfaces conversacionales en inglés dirigidas a hablantes de telugu o kannada.
- Evaluación de técnicas de flow-matching: investigadores pueden reproducir el entrenamiento y medir el impacto de la distribución de `t` en métricas como MOS o inteligibilidad.
- Creación de datasets sintéticos de voz para entrenar otros modelos ASR o TTS en telugu y kannada, siempre que se respete la licencia Apache 2.0 y se documente el origen sintético.
- Demostraciones académicas de TTS reference-free: útil en entornos docentes para ilustrar cómo se embebe una identidad vocal en los pesos y se elimina la dependencia de muestras de referencia.
- Pruebas de integración en pipelines de generación de audio con Hugging Face Transformers o bibliotecas compatibles con safetensors, aunque no se documentan herramientas de despliegue específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 2,29 mil millones de parámetros en precisión completa (fp32) se necesitarían aproximadamente 9,2 GB solo para los pesos; en fp16 unos 4,6 GB, y en int8 unos 2,3 GB, aunque estos cálculos son estimaciones generales y no datos del autor.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 8-16 GB de VRAM podría ser suficiente en precisiones reducidas, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del repositorio (9,5 GB) sugiere que los pesos podrían estar en fp32 o incluir componentes adicionales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de TTS en safetensors, requeriría el código del entrenador VoxCPM o una implementación compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la informacion suministrada.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo etiqueta explícitamente como "research", por lo que no está validado para producción.
- Idiomas limitados: solo inglés, telugu y kannada; no se garantiza un rendimiento aceptable en otras lenguas.
- Sesgos potenciales: el entrenamiento con datos devocionales (Sidon themes) puede sesgar el estilo prosódico hacia ese dominio y reducir la naturalidad en otros contextos.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o ruido en textos fuera de distribución.
- Sin datos de benchmarks: no hay métricas objetivas (MOS, WER, similitud de hablante) que permitan evaluar su calidad frente a alternativas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de un modelo base, deben respetarse también las condiciones del modelo original sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep.
- Repositorio de 9,5 GB: requiere espacio de almacenamiento considerable y puede complicar el despliegue en entornos con recursos limitados.
- Sin soporte documentado de cuantización ni de herramientas de inferencia estándar, lo que aumenta la fricción de integración.
- La congelación de LocDiT y la distribución alterada de `t` son decisiones experimentales que pueden degradar el rendimiento respecto al modelo base en tareas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/voxcpm2-stage3-te-kn-frozen-locdit-tmu0.3
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-sidon-themes (referenciado en la model card, sin URL directa disponible)
- Dataset kannada: sw-voice/swamiji-navaratri-kannada-sidon-themes (referenciado en la model card, sin URL directa disponible)
- Codigo del entrenador: repositorio `swamiji-tts`, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (sin URL directa disponible)
