# zayar26/burmese-gpt2

## Resumen

burmese-gpt2 es un ajuste fino (fine-tuning) del modelo openai-community/gpt2 publicado por el usuario zayar26 en HuggingFace. Se trata de un transformer decoder-only de 103.667.712 parametros (aproximadamente 124M en la configuracion clasica de GPT-2 small; el valor exacto reportado por los pesos en safetensors es el indicado) orientado a generacion de texto y, por el nombre del repositorio, apuntando al birmano (myanmar) como idioma objetivo. La model card esta generada automaticamente por el Trainer de HuggingFace y no aporta descripcion del dataset, ni de los usos previstos, ni resultados de evaluacion.

El modelo se entrena durante 10 epocas con AdamW fused, learning rate 5e-4, batch de 8 y scheduler lineal con 20 pasos de warmup, en precision mixta nativa (AMP). La model card no especifica la composicion del corpus de entrenamiento ni el numero de tokens vistos, por lo que se desconoce si el ajuste fue sobre texto birmano, multilingue o generico.

Su relevancia es limitada pero clara: es un ejemplo tipico de modelo pequeno de la comunidad para un idioma de bajos recursos, con licencia MIT, pesos en safetensors y compatibilidad directa con el ecosistema transformers y text-generation-inference. Resulta util como base para experimentar o para fine-tuning posterior, pero no como modelo de produccion sin una evaluacion propia, dado que no se ha publicado ningun benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), segun el modelo base openai-community/gpt2 |
| Parametros totales | 103.667.712 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens heredados del modelo base GPT-2; no confirmado explicitamente en la model card |
| Tipos de cuantizacion | No disponible en la model card. Al publicarse en safetensors, es convertible a GGUF y a cuantizaciones de 8 y 4 bits con herramientas estandar |
| Idiomas soportados | No disponible. El nombre del repositorio sugiere birmano, pero la model card no declara idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,6 GB (muy superior a los ~0,4 GB que ocupan 103,7 M de parametros en fp32, lo que indica checkpoints intermedios de entrenamiento guardados) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | openai-community/gpt2 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal, normalizacion de capa previa y embeddings posicionales aprendidos. No hay innovaciones tecnicas propias: no se emplea atencion lineal, ni decodificacion especulativa, ni mezcla de expertos, ni arquitecturas hibridas tipo SSM. El unico cambio respecto al modelo base es el ajuste fino de los pesos.

Respecto al entrenamiento, la model card solo expone los hiperparametros: learning rate 0.0005, batch de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW_TORCH_FUSED con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 20 pasos de warmup, 10 epocas y precision mixta nativa (AMP). El dataset se describe literalmente como "an unknown dataset", no se indica el numero de tokens ni la composicion del corpus, y no hay evidencia de RLHF, DPO ni ninguna etapa de alineacion. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. La seccion "Training results" de la model card esta vacia.

## Capacidades

- Generacion de texto autoregresiva y completado de texto (pipeline text-generation).
- Fine-tuning posterior sobre tareas discriminativas (clasificacion, NER, analisis de sentimiento) usando la cabeza de lenguaje o sustituyendola.
- Extraccion de representaciones contextuales para embeddings de frases o palabras, dado que es un modelo base.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay modo "thinking", ni capacidades de vision, audio o multimodalidad.
- Capacidades multilingues: no declaradas. El tokenizador heredado de GPT-2 es un BPE entrenado principalmente con texto ingles, lo que penaliza fuertemente la codificacion de escritura birmana (muchos tokens por caracter); esto es una inferencia a partir del modelo base, no un dato de la model card.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Investigacion en procesamiento de lengua birmana con recursos limitados: sirve como punto de partida reproducible para comparar tecnicas de fine-tuning sobre un idioma de bajos recursos, ya que el modelo es pequeno y el coste de experimentacion es minimo.
- Fine-tuning para clasificacion de texto en birmano: sustituyendo la cabeza de generacion por una capa de clasificacion se puede adaptar a deteccion de spam, categorizacion de noticias o analisis de sentimiento, con la ventaja de que 103 M de parametros caben en cualquier GPU.
- Prototipado rapido de autocompletado en editores o formularios: con 1024 tokens de contexto se puede ofrecer sugerencia de continuacion de frase en aplicaciones de escritura, asumiendo que la calidad solo estara garantizada si el ajuste fino fue efectivo.
- Aumento de datos sinteticos: generar variaciones de frases birmanas para ampliar corpus de entrenamiento de otros modelos mayores, filtrando despues por calidad.
- Correccion posterior de OCR en escritura birmana: el modelo puede emplearse para reordenar o completar fragmentos mal reconocidos por un motor de OCR, ya que la tarea solo requiere coherencia local a corto plazo.
- Despliegue en dispositivos de borde o entornos sin GPU: al ocupar aproximadamente 415 MB en fp32 y unos 104 MB en int8, es viable en CPU, en una Raspberry Pi o en moviles con runtime adecuado.
- Base para experimentos de destilacion: por su tamano reducido puede actuar como alumno o como profesor auxiliar en pipelines de compresion de modelos birmanos mayores.
- Chatbot de dominio muy acotado, siempre que se valide previamente: solo es recomendable si un fine-tuning especifico demuestra calidad en el dominio, dado que no hay evaluacion publica del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card contiene una entrada con la lista de resultados vacia, y la seccion "Training results" esta en blanco. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 415 MB en fp32, 207 MB en fp16/bf16, 104 MB en int8 y 52 MB en int4. Estas cifras son calculos a partir de los 103,7 M de parametros, no datos publicados por el autor.
- Con cache KV para 1024 tokens y batch pequeno, el consumo adicional es de decenas de MB, por lo que el modelo completo cabe comodamente por debajo de 1 GB de VRAM en fp16.
- GPU recomendadas: cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090 o integradas modernas. Tambien es perfectamente funcional en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer y en hardware de gama baja; es un candidato claro para despliegue en el borde.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente en el repositorio), vLLM, llama.cpp u Ollama tras conversion a GGUF, y endpoints compatibles (etiqueta endpoints_compatible). El despliegue en FriendliAI es posible por el formato, aunque el modelo no aparece listado alli.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos son incompletos; se indica "no disponible" donde la informacion no lo especifica.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Notas |
|---|---|---|---|---|---|
| zayar26/burmese-gpt2 | 103.667.712 | 1024 (heredado de GPT-2) | MIT | Sin benchmarks publicados | Fine-tuning de GPT-2, 0 descargas |
| WYNN747/Burmese-GPT | No disponible (basado en mGPT XL) | No disponible | No disponible en la informacion recogida | No disponible | Desarrollado por el Dr. Wai Yan, orientado a completado de texto en birmano y como base para otras tareas |
| jojo-ai-mst/MyanmarGPTX | No disponible | No disponible | MIT | No disponible | Orientado a aplicaciones web, movil y escritorio en birmano |
| realzai/burmese-gpt | 20 M | No disponible | No disponible | No disponible | Implementacion en PyTorch, mucho mas pequeno |
| openai-community/gpt2 (base) | 124 M aprox. | 1024 | MIT | Ampliamente evaluado en ingles | Modelo original en ingles; sirve como referencia de arquitectura |

La comparacion no es concluyente: ninguno de los modelos alternativos publica resultados de evaluacion comparables y no se dispone de datos de tamano ni contexto para la mayoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no incluye ningun resultado, y el `model-index` esta vacio. No hay forma de saber si el ajuste fino ha producido un modelo funcional en birmano.
- Dataset desconocido: la model card indica "an unknown dataset". Esto impide evaluar sesgos, cobertura tematica, calidad del texto y posibles problemas de derechos sobre los datos de entrenamiento.
- Riesgo elevado de alucinacion y de texto incoherente: con 103 M de parametros y sin etapa de alineacion (RLHF o DPO), el modelo no tiene mecanismos de control de veracidad ni de seguimiento de instrucciones.
- Tokenizador inadecuado para birmano: al heredar el BPE de GPT-2, entrenado principalmente en ingles, el texto birmano se fragmenta en muchos tokens, lo que reduce la ventana efectiva, encarece la inferencia y degrada la coherencia. Es una inferencia razonada a partir del modelo base, no un dato declarado.
- Ventana de contexto corta: 1024 tokens, insuficiente para documentos largos, conversaciones multi-turno extensas o analisis de contratos.
- Idiomas no declarados: no se puede afirmar oficialmente que el modelo soporte birmano ni ningun otro idioma.
- Repositorio de 4,6 GB: incluye presumiblemente checkpoints intermedios, lo que complica el despliegue si no se seleccionan los pesos finales.
- Sin traccion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero conviene verificar la licencia del modelo base GPT-2 y de los datos de ajuste antes de un uso comercial.
- No apto para produccion sin validacion propia: se recomienda ejecutar una evaluacion sobre un conjunto de test en birmano antes de cualquier despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zayar26/burmese-gpt2
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- WYNN747/Burmese-GPT: https://huggingface.co/WYNN747/Burmese-GPT
- Ficha de Burmese-GPT en AIBase: https://model.aibase.com/models/details/1915693823671558145
- jojo-ai-mst/MyanmarGPTX: https://huggingface.co/jojo-ai-mst/MyanmarGPTX
- Repositorio realzai/burmese-gpt: https://github.com/realzai/burmese-gpt/tree/main/burmese_gpt/models
- hmone231/burmese_gpt2 en FriendliAI: https://friendli.ai/models/hmone231/burmese_gpt2
