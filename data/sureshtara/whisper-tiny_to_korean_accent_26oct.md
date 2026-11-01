# sureshtara/whisper-tiny_to_korean_accent_26oct

## Resumen

Whisper tiny Korean es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, desarrollado por el usuario sureshtara y publicado en HuggingFace. El objetivo declarado es adaptar el modelo base, entrenado originalmente por OpenAI con un enfoque multilingue, a un conjunto de datos denominado Korean_english, presumiblemente audio en ingles con acento coreano. El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado como compatible con endpoints de HuggingFace.

Se trata de un modelo transformer encoder-decoder de tipo Whisper, con 37.760.640 parametros totales y un tamano de repositorio de 0,3 GB en formato safetensors. La arquitectura subyacente es la de Whisper tiny, que emplea atencion completa estandar y un tokenizador multilingue, aunque la model card solo declara soporte para ingles. El ajuste se realizo con la libreria Transformers 5.21.0.dev0 y PyTorch 2.11.0, con un total de 2000 pasos de entrenamiento.

La relevancia de este modelo es limitada pero concreta: ofrece una alternativa ligera para transcripcion de audio en ingles con acento coreano, un nicho que los modelos genericos pueden no cubrir bien. Su tamano reducido lo hace apto para despliegues en CPU o GPU de gama baja, y su licencia permisiva facilita su integracion en productos comerciales. No obstante, la documentacion es muy escasa y no se han publicado detalles sobre la composicion del dataset ni sobre el proceso de evaluacion mas alla de la metrica WER declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper tiny usa ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper tiny de OpenAI, un transformer encoder-decoder disenado para reconocimiento automatico del habla. El encoder procesa espectrogramas mel de audio y el decoder genera tokens de texto de forma autoregresiva. Whisper tiny es la variante mas pequena de la familia Whisper, con aproximadamente 39 millones de parametros, y emplea atencion completa estandar sin mecanismos de atencion lineal ni decodificacion especulativa.

El ajuste fino se realizo sobre el dataset Korean_english, del cual no se proporcionan detalles sobre numero de horas, composicion ni proceso de anotacion. Los hiperparametros documentados incluyen una tasa de aprendizaje de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 500 pasos de calentamiento y 2000 pasos totales de entrenamiento. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La model card no documenta innovaciones tecnicas destacables mas alla del propio ajuste fino.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en audio con acento coreano segun el dataset de entrenamiento.
- Transcripcion de audio en ventanas de hasta 30 segundos, limitacion inherente a la arquitectura Whisper tiny.
- Generacion de texto a partir de audio mediante decodificacion autoregresiva.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: la model card solo declara ingles, aunque el modelo base Whisper tiny es multilingue y podria retener parte de esa capacidad.
- No se documentan capacidades de vision, audio mas alla de ASR, ni modos de pensamiento (thinking mode).

## Casos de uso

- Transcripcion de reuniones y entrevistas en ingles con hablantes nativos de coreano: el ajuste fino sobre el dataset Korean_english busca mejorar la precision en este perfil de habla, reduciendo errores tipicos de modelos genericos ante acentos no nativos.
- Subtitulado automatico de contenido audiovisual: el modelo puede generar transcripciones para videos en ingles con acento coreano, integrable en pipelines de postproduccion gracias a su bajo coste computacional.
- Asistentes de voz para atencion al cliente: al ser un modelo ligero, puede desplegarse en infraestructura modesta para transcribir consultas de usuarios coreano-parlantes que se expresan en ingles.
- Prototipado rapido de aplicaciones ASR: su tamano de 0,3 GB y licencia Apache 2.0 permiten experimentar en entornos de desarrollo sin grandes inversiones en hardware.
- Investigacion en adaptacion de dominio para ASR: sirve como caso de estudio de fine-tuning de Whisper tiny sobre datasets especificos, util para comparar estrategias de ajuste.
- Despliegue en dispositivos edge o entornos con recursos limitados: al tener 37,7 millones de parametros, puede ejecutarse en CPU o en GPUs de gama baja para transcripcion en tiempo casi real de fragmentos cortos.
- Preprocesamiento de audio en pipelines de datos: transcripcion masiva de audios cortos en ingles con acento coreano para generar datasets de texto anotado.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, no verificados de forma independiente.

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Korean | Korean English (split test) | WER | 9,7073 |
| Whisper tiny Korean (epoca 1) | Korean English (validacion) | WER | 9,8780 |
| Whisper tiny Korean (epoca 2) | Korean English (validacion) | WER | 9,7073 |

Ademas, la model card reporta una perdida de validacion de 0,2030 en el paso 2000. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para los 37,7 millones de parametros, y aproximadamente 0,15 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100 o H100. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: Transformers con pipeline de automatic-speech-recognition, endpoints de HuggingFace (el modelo esta etiquetado como endpoints_compatible), y potencialmente llama.cpp u Ollama si se generan conversiones, aunque no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano reducido, se espera una latencia baja en GPU y moderada en CPU para fragmentos de hasta 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Whisper tiny Korean (este modelo) | 37,7 M | 30 s de audio | Ingles | Apache 2.0 | 9,71 (Korean English) |
| openai/whisper-tiny | 39 M | 30 s de audio | Multilingue | Apache 2.0 | No disponible en esta ficha |
| openai/whisper-base | 74 M | 30 s de audio | Multilingue | Apache 2.0 | No disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s de audio | Multilingue | Apache 2.0 | No disponible en esta ficha |

La comparacion directa con los modelos base de OpenAI no es posible en terminos de WER porque no se han incluido sus resultados en la informacion proporcionada. La principal ventaja de este ajuste es su especializacion en acento coreano sobre ingles, mientras que su desventaja es la falta de validacion independiente y la documentacion incompleta.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), lo que impide conocer el proceso de entrenamiento y evaluacion en detalle.
- El WER de 9,71 no ha sido verificado de forma independiente (verified: false) y corresponde a un unico dataset privado o no documentado, por lo que no es directamente comparable con resultados publicos.
- Sesgos conocidos: no documentados. Al entrenarse sobre un dataset llamado Korean_english, podria presentar sesgos hacia ese perfil de habla y degradarse con otros acentos o variantes del ingles.
- Riesgo de alucinacion: inherente a los modelos Whisper, que pueden generar texto plausible en segmentos de silencio o ruido. No se documentan mitigaciones.
- Limitaciones de contexto: la ventana de audio de Whisper tiny es de 30 segundos; audios mas largos requieren segmentacion manual o mediante pipeline.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Caveat para produccion: la ausencia de datos sobre el dataset, el proceso de evaluacion y la verificacion de metricas hace recomendable una validacion propia antes de desplegar el modelo en entornos criticos.
- El modelo solo declara soporte para ingles, a pesar de que el modelo base es multilingue; no se garantiza un rendimiento adecuado en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sureshtara/whisper-tiny_to_korean_accent_26oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (OpenAI): no disponible en la informacion proporcionada
- Repositorio de Transformers: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
