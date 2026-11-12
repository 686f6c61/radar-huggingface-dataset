# Vasya148877766/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "abliterada" (decensurada) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario Vasya148877766. El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matematicas y STEM. Esta version concreta aplica la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo mediante una tecnica de ablacion de rango arbitrario (ARA).

El modelo conserva la arquitectura y el tamano del base: 9.409.813.744 parametros (unos 9,4B), pesos en safetensors, licencia Apache 2.0 y soporte declarado para seis idiomas (ingles, chino, coreano, japones, espanol y ruso). La intervencion de Heretic reduce los rechazos de 100/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 0,0422 respecto al original, lo que indica que la modificacion es relativamente contenida pero no nula.

Su relevancia actual radica en dos factores: por un lado, ofrece un modelo de razonamiento de ~9B desplegable en hardware de consumo; por otro, la version decensurada interesa a quienes necesitan un modelo sin rechazos para investigacion, generacion creativa sin filtros o evaluacion de sesgos. Conviene advertir que el pipeline declarado es text-generation, aunque los tags incluyen image-text-to-text, lo que sugiere capacidades multimodales heredadas del base que no estan documentadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; detalles de atencion no disponibles) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 19,3 GB) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, una arquitectura transformer densa de ~9,4B parametros. El entrenamiento del base combino destilacion desde DeepSeek-V4-Pro (en modo "Max Effect") con un conjunto de aproximadamente 250.000 muestras de matemticas y STEM, segun la model card. Los tags del repositorio indican el uso de SFT, RL y GSPO (Group Sequence Policy Optimization) en el pipeline de post-entrenamiento, ademas de decodificacion especulativa MTP y evaluacion en NVFP4 mencionadas en la documentacion del autor. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

La innovacion principal de esta variante es la aplicacion de Heretic v2.0.0.dev0 con ablacion de rango arbitrario (ARA) sobre las capas 9 a 24. Los parametros publicados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta intervencion modifica los pesos para suprimir la direccion de activacion asociada a los rechazos, manteniendo en lo posible el resto del comportamiento (de ahi el peso alto de preservacion del buen comportamiento). El resultado medido es de 3 rechazos por cada 100 peticiones frente a 100/100 del original, con una divergencia KL de 0,0422.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en descomposicion estructurada de problemas.
- Razonamiento matematico y cientifico (STEM), entrenado sobre ~250.000 muestras de ese dominio.
- Tool calling y function calling (tags tool-use y function-calling).
- Soporte de agentes y razonamiento multi-paso (reasoning, distillation, rl).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Posible soporte de vision (tag image-text-to-text), aunque no documentado en la model card.
- Modo "thinking"/razonamiento extendido heredado del base (tag reasoning).
- Comportamiento decensurado: rechaza muy raramente peticiones (3/100 en la evaluacion del autor).
- Mejoras pequenas en programacion y uso de herramientas por transferencia cruzada, sin datos SFT especificos de codigo.

## Casos de uso

- Resolucion de problemas matematicos y cientificos: el modelo esta entrenado especificamente sobre ~250.000 muestras de matemticas y STEM, por lo que es adecuado para tutoria automatica, generacion de problemas resueltos paso a paso y verificacion de derivaciones.
- Investigacion sobre alineacion y sesgos: al ser una version abliterada con metricas de rechazo y divergencia KL publicadas, permite estudiar el efecto de la ablacion sobre el comportamiento del modelo y comparar con el original.
- Generacion creativa sin filtros: escritura de ficcion, guiones o contenido editorial que requiera ausencia de rechazos, aprovechando la reduccion de rechazos de 100/100 a 3/100.
- Agentes con tool calling: los tags de function-calling y tool-use permiten integrarlo en pipelines de agentes que necesiten invocar APIs o ejecutar acciones multi-paso.
- Asistencia tecnica multilingue: con soporte para seis idiomas, puede emplearse en atencion al cliente o documentacion tecnica en ingles, chino, coreano, japones, espanol y ruso.
- Despliegue en hardware de consumo: con ~9,4B parametros y pesos safetensors, es viable en GPUs de gama alta para consumo (ver seccion de hardware) y en entornos de prototipado rapido.
- Evaluacion comparativa de destilacion: util para medir la calidad de la destilacion desde DeepSeek-V4-Pro en un modelo compacto frente a alternativas de la misma clase.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la evaluacion de rechazos y divergencia KL de Heretic:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: ~10 GB de pesos; a 4 bits: ~5-6 GB de pesos, mas overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16 ajustado o en cuantizacion; en GPUs de 12-16 GB requiere cuantizacion a 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo), y Unsloth (tag en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | ~9,4B | no disponible | Apache 2.0 | Version abliterada, 3/100 rechazos, KL 0,0422 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9,4B | no disponible | Apache 2.0 | Modelo base, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Version 4B decensurada del mismo linaje |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune cientifico basado en este modelo |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina en gran medida los rechazos, lo que implica que el modelo puede generar contenido danino, ofensivo o inexacto sin advertir; no es adecuado para aplicaciones orientadas al publico sin moderacion externa.
- La intervencion sobre los pesos (capas 9-24) puede degradar capacidades no medidas; la divergencia KL de 0,0422 indica cambios no triviales respecto al original.
- Riesgo de alucinacion inherente a los modelos de ~9B, especialmente en dominios fuera de matematicas y STEM.
- La longitud de contexto no esta documentada; no debe asumirse un contexto largo sin verificacion.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensurado conlleva riesgos legales y reputacionales; se recomienda revision juridica y moderacion de salida.
- El soporte multimodal (image-text-to-text) aparece en los tags pero no esta documentado; su funcionamiento no esta verificado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La model card incluye HTML y afirmaciones de marketing; los datos tecnicos deben tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vasya148877766/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought-STEM: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic: https://heretic-project.org
