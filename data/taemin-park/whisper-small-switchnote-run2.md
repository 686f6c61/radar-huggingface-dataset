# taemin-park/whisper-small-switchnote-run2

## Resumen

whisper-small-switchnote-run2 es un adaptador LoRA (PEFT) sobre el modelo de reconocimiento automático de voz openai/whisper-small. Lo publica el usuario taemin-park en Hugging Face y no se trata de un modelo completo, sino de un conjunto de pesos de adaptación que deben cargarse junto al modelo base original. El repositorio ocupa 0,2 GB y la model card lo describe como un ajuste fino sobre un dataset no especificado ("None dataset").

El modelo base, whisper-small, es un transformer encoder-decoder de OpenAI orientado a transcripción y traducción de voz. El adaptador ajusta ese modelo con un learning rate de 1e-05 durante 5 épocas, batch de 16 y precisión mixta nativa AMP, alcanzando un WER de 27,89 en el conjunto de evaluación. Es relevante únicamente como experimento de ajuste fino; no hay información sobre el corpus de entrenamiento ni sobre el idioma o dominio objetivo.

No se dispone de información sobre arquitectura modificada, longitud de contexto, idiomas soportados ni datos de entrenamiento más allá de los hiperparámetros declarados. La ficha refleja esa escasez de datos sin inferir valores no publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) con adaptador LoRA |
| Parametros totales | no disponible (el adaptador LoRA se publica sobre openai/whisper-small; el modelo base tiene ~244 M de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre openai/whisper-small, un transformer encoder-decoder con atención estándar diseñado para tareas de reconocimiento de voz y traducción. La publicación usa PEFT 0.21.2 con LoRA, de modo que solo se entrenan las matrices de bajo rango inyectadas, no los pesos completos del modelo base. No se especifica el rango de LoRA, las capas objetivo ni el módulo al que se aplica.

El entrenamiento declarado usa AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, learning rate 1e-05, scheduler lineal con 20 pasos de warmup, 5 épocas, batch de entrenamiento 16, batch de evaluación 8, semilla 314 y AMP nativo. El conjunto de datos no se identifica ("None dataset"). La pérdida de validación baja de 3,0159 en la época 1 a 1,3724 en la época 5, mientras el WER oscila entre 32,72 y 27,25, con un repunte a 27,89 en la última época. No se documenta RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Reconocimiento automático de voz (transcripción) heredado del modelo base Whisper small.
- Traducción de voz a texto, en la medida en que lo soporte el modelo base.
- Ajuste específico de dominio o idioma mediante el adaptador LoRA, aunque el dominio no está declarado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio adicional, thinking mode ni otras modalidades más allá del audio de entrada propio de Whisper.

## Casos de uso

- Transcripción de audio en un dominio concreto: cargar el adaptador sobre openai/whisper-small con PEFT y transcribir audio del dominio para el que se ajustó, siempre que se valide el WER en ese dominio antes de usarlo en producción.
- Experimentación académica con LoRA: sirve como ejemplo reproducible de ajuste fino de Whisper small con hiperparámetros documentados (lr 1e-05, 5 épocas, batch 16) para comparar con otras configuraciones.
- Prototipado rápido de ASR: al ocupar 0,2 GB, el adaptador se descarga y se prueba rápidamente en entornos de desarrollo con el modelo base ya disponible.
- Evaluación comparativa de adaptadores: útil para medir el efecto de distintas ejecuciones (run1, run2, etc.) sobre el mismo modelo base y el mismo pipeline de evaluación.
- Base para ajustes posteriores: punto de partida para continuar el entrenamiento o aplicar técnicas de destilación sobre el mismo modelo base.
- No recomendado para producción sin validación: el WER de 27,89 es alto para la mayoría de aplicaciones comerciales, por lo que solo debería usarse tras una evaluación específica del dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index sin resultados adicionales):

| Metrica | Valor |
|---|---|
| Loss (validacion, epoca 5) | 1,3724 |
| WER (validacion, epoca 5) | 27,8921 |
| Loss (validacion, epoca 4) | 1,4229 |
| WER (validacion, epoca 4) | 27,2534 |
| Loss (validacion, epoca 3) | 1,5876 |
| WER (validacion, epoca 3) | 27,3243 |
| Loss (validacion, epoca 2) | 1,9910 |
| WER (validacion, epoca 2) | 31,2988 |
| Loss (validacion, epoca 1) | 3,0159 |
| WER (validacion, epoca 1) | 32,7182 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el modelo base Whisper small requiere aproximadamente 1-2 GB en fp16 y menos de 1 GB en cuantización de 8 bits, pero no se documenta el impacto del adaptador.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para Whisper small; no se especifican requisitos del adaptador.
- Cabe en GPU consumer: sí, el modelo base Whisper small es ligero y el adaptador añade una sobrecarga mínima.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-switchnote-run2 | Adaptador LoRA sobre ~244 M | no disponible | 27,89 (validación propia) | apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-medium | ~769 M | ventanas de 30 s de audio | no disponible en esta ficha | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El WER de 27,89 es elevado para uso en producción; indica un rendimiento limitado en el conjunto de evaluación, cuyo dominio e idioma se desconocen.
- El dataset de entrenamiento no está identificado ("None dataset"), por lo que no puede evaluarse el sesgo ni la cobertura lingüística.
- No se especifican los idiomas soportados; el modelo base Whisper small es multilingüe, pero el adaptador puede haber degradado o especializado ese comportamiento sin documentarlo.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios.
- No hay información sobre sesgos demográficos, acentos o variedades dialectales.
- La licencia apache-2.0 permite uso comercial, pero al ser un adaptador sobre openai/whisper-small conviene verificar también la licencia del modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No se documenta el rango de LoRA ni las capas objetivo, lo que dificulta reproducir el ajuste.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed").

## Enlaces

- Hugging Face: https://huggingface.co/taemin-park/whisper-small-switchnote-run2
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
