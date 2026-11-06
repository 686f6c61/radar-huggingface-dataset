# sw-voice/voxcpm2-indic-multi-stage3-te-maya-distill-lr5e-5-3ep

## Resumen

voxcpm2-indic-multi-stage3-te-maya-distill-lr5e-5-3ep es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, resultado de un ajuste fino completo (full fine-tune) del modelo base sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep. El modelo está especializado en la generación de voz en telugu (te) e kannada (kn), además de mantener capacidades en inglés (en), y se distribuye con licencia Apache 2.0.

Se trata de un modelo de aproximadamente 2.290 millones de parámetros (2,29 B) almacenados en formato safetensors, con un tamaño de repositorio de 9,5 GB. Su propósito es la clonación y síntesis de voz sin referencia explícita: la identidad vocal (la voz "Maya") está codificada directamente en los pesos del modelo, de modo que no es necesario proporcionar un audio de referencia en el momento de la inferencia.

El modelo es relevante en el contexto de la investigación en TTS multilingüe para lenguas indias, ya que demuestra un pipeline de destilación de voz sintética (la voz Maya se destila a partir de un modelo profesor) y un ajuste fino por etapas sobre un modelo base entrenado previamente. Es un artefacto de investigación, no un producto listo para producción, y así lo declara el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS basado en VoxCPM; detalles de arquitectura no especificados en la información proporcionada) |
| Parámetros totales | 2.290.004.544 (~2,29 B) |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés), te (telugu), kn (kannada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, mecanismo de atención, códec de audio o diseño del tokenizador acústico). El modelo se presenta como un full fine-tune del checkpoint sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep, realizado con el entrenador oficial de VoxCPM. Se entrenaron todos los parámetros del modelo, sin congelar capas.

El entrenamiento se realizó sobre el conjunto de datos sw-voice/swamiji-telugu-maya-distill-500, compuesto por 500 respuestas en telugu leídas por la voz sw-voice/maya-best-multilingual-swamiji que superaron un filtro de calidad. El filtro exigía que el modelo Maya se detuviera por sí mismo (sin truncamiento forzado), un error de carácter (CER) de Sarvam menor o igual al 10 % y un ritmo de habla entre 0,6 y 1,6 veces la mediana. El audio es sintético: se trata de una destilación de la voz Maya. La configuración de entrenamiento fue micro-batch de 1 con acumulación de gradiente de 16, 3 épocas (93 pasos totales), tasa de aprendizaje 5e-05 con decaimiento coseno, 14 pasos de warmup y recorte de gradiente de 1.0. El modelo es reference-free: la voz está embebida en los pesos y no requiere audio de referencia en inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu (te), kannada (kn) e inglés (en).
- Clonación de voz sin referencia explícita (reference-free): la identidad vocal "Maya" está incorporada en los pesos del modelo.
- Generación de audio sintético destilado a partir de un modelo profesor (voz Maya multilingüe).
- Capacidades multilingües limitadas a los tres idiomas declarados (en, te, kn).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento (thinking mode); estas capacidades no aplican a un modelo de TTS o no están disponibles en la información proporcionada.

## Casos de uso

- Investigación en destilación de voz: el modelo sirve como caso de estudio de cómo destilar una voz sintética (Maya) a partir de un modelo profesor y ajustar un modelo TTS base para retener esa identidad vocal sin referencia en inferencia.
- Síntesis de voz en telugu para prototipos de asistentes locales: permite generar respuestas habladas en telugu con una voz consistente, útil en entornos de investigación de interfaces conversacionales para lenguas indias.
- Generación de audiolibros o contenido narrado en telugu y kannada: el modelo puede producir audio a partir de texto en estos idiomas, aunque la calidad y naturalidad no están documentadas con métricas.
- Evaluación comparativa de TTS multilingüe: al estar entrenado sobre un subconjunto filtrado por CER y ritmo, puede emplearse como referencia en experimentos que midan la influencia del filtrado de datos sintéticos en la calidad final.
- Reproducción de experimentos de ajuste fino por etapas: el nombre del modelo indica una etapa 3 de un pipeline multi-etapa, por lo que es útil para replicar o analizar la progresión de etapas de entrenamiento en TTS.
- Desarrollo de sistemas de accesibilidad para hablantes de telugu o kannada: conversión de texto a voz para lectura de contenido, con la advertencia de que es un modelo de investigación y no un producto validado para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 2,29 B parámetros en precisión FP16 requiere aproximadamente 4,6 GB solo para los pesos, a lo que hay que sumar memoria para activaciones y el códec de audio; en FP32 serían unos 9,2 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con 8-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño de parámetros, pero no está verificado en la información disponible.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor menciona el código `swamiji-tts` en la ruta `research/multi-stages` como referencia de entrenamiento, no de despliegue.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (TTS multilingüe para lenguas indias) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo etiqueta como "(research)"; no hay garantías de calidad, estabilidad ni soporte para uso en producción.
- Datos de entrenamiento sintéticos: el audio de entrenamiento es una destilación de la voz Maya generada por un modelo profesor, lo que puede propagar artefactos, sesgos acústicos o limitaciones del modelo profesor.
- Cobertura lingüística limitada: solo inglés, telugu y kannada; no se documenta el comportamiento en otros idiomas ni la calidad relativa entre ellos.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, prosodia anómala o artefactos, especialmente en texto fuera del dominio de entrenamiento.
- Sesgos: no se documentan análisis de sesgos de género, dialecto o registro; la voz está fijada a una identidad concreta (Maya), lo que limita la diversidad vocal.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento (audio sintético derivado de una voz concreta) no impongan restricciones adicionales; la información disponible no aclara los derechos sobre la voz Maya.
- Sin métricas publicadas: no hay benchmarks de naturalidad (MOS), inteligibilidad (CER/WER) ni latencia, por lo que la evaluación de calidad queda a cargo del usuario.
- Contexto y cuantización no documentados: se desconoce la longitud máxima de texto soportada y si existen versiones cuantizadas oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage3-te-maya-distill-lr5e-5-3ep
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-sidon-lr1e-4-10ep
- Dataset de entrenamiento: sw-voice/swamiji-telugu-maya-distill-500 (referenciado en la model card; no se proporciona URL directa)
- Voz de referencia: sw-voice/maya-best-multilingual-swamiji (referenciado en la model card; no se proporciona URL directa)
- Código de entrenamiento: `swamiji-tts`, ruta `research/multi-stages` (referenciado en la model card; no se proporciona URL directa)
