# thunderboltc/gemini_whisper_ipa

## Resumen

`thunderboltc/gemini_whisper_ipa` es un modelo de reconocimiento automático del habla (ASR) obtenido mediante fine-tuning de `openai/whisper-small` sobre un corpus de transliteración al Alfabeto Fonético Internacional (IPA) y a la romanización Sanlish para la lengua santali. Lo desarrolla el usuario `thunderboltc` y su propósito declarado es convertir audio en santali a texto fonético, una tarea de gran utilidad para la documentación y preservación de lenguas minoritarias con poca representación digital.

El modelo se basa en la arquitectura Whisper (encoder-decoder transformer) con 241,7 millones de parámetros, el tamaño correspondiente a la variante "small" de OpenAI. El repositorio contiene únicamente el checkpoint entrenado durante una época (epoch 1.0), con un conjunto de datos reducido (1547 muestras de entrenamiento) y una métrica de error (WER) del 71,05%, lo que indica un rendimiento todavía lejos de ser útil en producción. No se especifican la licencia ni los idiomas exactos en la metadata, aunque la model card menciona santali, sanlish e IPA.

A pesar de su estado experimental y de la ausencia de datos sobre licencia o cuantización, el modelo representa un intento concreto de aplicar ASR a una lengua minoritaria con notación fonética, un área donde los modelos generalistas suelen fallar. Su principal valor reside en ser un punto de partida para futuros fine-tunings con más datos y mejor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Whisper estándar usa ventanas de 30 s de audio, pero no se especifica en este checkpoint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Santali, Sanlish (romanizacion), IPA (segun la model card; la metadata indica "no disponibles") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder con atención causal y decodificación autoregresiva, entrenado originalmente sobre 680.000 horas de audio multilingüe. Este fine-tuning adapta los pesos del encoder y decoder a la tarea específica de transcribir habla santali a IPA/Sanlish. El entrenamiento se realizó con un dataset dividido en 80/10/10 (1547 train, 193 validación, 194 test) y se ejecutó durante 10 épocas planificadas, aunque solo se ha guardado el checkpoint de la época 1.0. Los hiperparámetros principales incluyen batch efectivo de 16, tasa de aprendizaje de 0,0001, warmup de 100 pasos, gradient checkpointing activado y precisión fp16. No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es supervisado estándar con pérdida de cross-entropy y generación con beam search (predict_with_generate=True). No hay innovaciones arquitectónicas respecto al Whisper original.

## Capacidades

- Transcripción de audio a texto en santali, con salida en IPA o Sanlish (romanización).
- Reconocimiento de habla para una lengua minoritaria sin recursos digitales previos.
- Adaptación de un modelo ASR generalista a un dominio fonético específico.
- No se documentan capacidades de tool calling, agentes, razonamiento, visión ni otras habilidades más allá de la ASR.

## Casos de uso

- Preservación lingüística: transcripción de grabaciones de campo de hablantes de santali para archivos digitales y estudios fonéticos. El modelo convierte audio directamente a IPA, facilitando el trabajo de lingüistas sin necesidad de transcribir manualmente.
- Documentación de lenguas en peligro: permite procesar entrevistas y narraciones orales en santali, generando texto fonético que puede servir para crear diccionarios, gramáticas o corpus anotados.
- Investigación en fonética comparada: al producir salidas IPA, el modelo puede alimentar análisis acústico-fonéticos comparativos entre dialectos del santali o con otras lenguas austroasiáticas.
- Creación de subtítulos o materiales educativos: transcripción de contenido audiovisual en santali para su uso en escuelas o comunidades, aunque el alto WER actual limita su aplicación directa.
- Evaluación de modelos ASR en lenguas de bajos recursos: sirve como referencia para comparar estrategias de fine-tuning en dominios con pocos datos, dado su pequeño dataset y métricas documentadas.
- Prototipado de pipelines ASR para lenguas minoritarias: el checkpoint puede integrarse en flujos de Hugging Face Transformers para probar la viabilidad de la transcripción fonética antes de invertir en más datos.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la evaluación en el conjunto de validación tras la época 1.0:

| Metrica | Valor |
|---|---|
| eval_loss | 0,4243 |
| eval_wer | 71,05 % |
| eval_runtime | 107,02 s |
| eval_samples_per_second | 1,803 |
| eval_steps_per_second | 0,234 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Un WER del 71 % indica que menos de un tercio de las palabras transcritas son correctas, lo que lo hace inadecuado para uso práctico sin un entrenamiento adicional sustancial.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 (tamaño de whisper-small), aunque no se especifica para este checkpoint. Con cuantización a 8 bits podría reducirse a ~500 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 3050) o incluso CPU para inferencia lenta. No requiere hardware de datacenter.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs modernas de consumo, incluidas las integradas con suficiente RAM compartida.
- Opciones de despliegue: puede cargarse con la librería `transformers` de Hugging Face, `faster-whisper` (si se convierte a formato CTranslate2), `whisper.cpp` (si se exporta a GGML) u Ollama (aunque no es el flujo típico para ASR). También es compatible con pipelines de ASR de la librería `transformers`.
- Latencia y throughput: no hay datos medidos. En una GPU moderna (p. ej., RTX 3090), whisper-small procesa audio en tiempo real o más rápido; en CPU, puede ser entre 2 y 5 veces más lento que el tiempo real. No se dispone de cifras concretas para este fine-tuning.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente en la información proporcionada. Como referencia, se puede comparar con el propio `openai/whisper-small` original:

| Modelo | Parametros | Contexto | WER (santali) | Licencia | Formato |
|---|---|---|---|---|---|
| openai/whisper-small | 244 M | 30 s audio | no evaluado | MIT | safetensors, PyTorch |
| thunderboltc/gemini_whisper_ipa | 241,7 M | no disponible | 71,05 % (validación) | no disponible | safetensors |

Otros fine-tunes de Whisper para lenguas minoritarias (p. ej., para quechua, maorí o catalán) existen en Hugging Face, pero no se han encontrado datos concretos en la búsqueda realizada. Por tanto, la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Alto error de transcripción: el WER del 71,05 % en validación hace que el modelo no sea utilizable en producción sin un reentrenamiento con más datos y mejor calidad.
- Dataset muy reducido: 1547 muestras de entrenamiento son insuficientes para generalizar bien, especialmente en una lengua con variación dialectal.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial o su integración en proyectos con requisitos legales claros.
- Idiomas no documentados en metadata: aunque la model card menciona santali, sanlish e IPA, la metadata oficial no los lista, lo que puede causar problemas en pipelines automáticos.
- Riesgo de alucinaciones y sesgos: al ser un fine-tuning sobre un modelo base entrenado mayoritariamente en inglés, puede producir salidas inventadas o mezclar idiomas en entradas ruidosas.
- Sin cuantizaciones disponibles: no se ofrecen versiones GGUF, ONNX o CTranslate2, lo que limita el despliegue en entornos edge o móviles.
- Estado experimental: el checkpoint se guardó tras solo una época de las 10 planificadas, y no hay indicios de que se haya continuado el entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thunderboltc/gemini_whisper_ipa
- Modelo base: https://huggingface.co/openai/whisper-small
