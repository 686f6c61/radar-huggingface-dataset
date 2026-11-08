# WhyZosa/llm-course-hw3-tinyllama-qlora

## Resumen

WhyZosa/llm-course-hw3-tinyllama-qlora es un adaptador QLoRA publicado en Hugging Face que ajusta el modelo conversacional TinyLlama-1.1B-Chat-v1.0 para clasificacion de sentimiento en tuits. Se trata de un artefacto academico: el autor lo desarrolla como parte de la tarea 3 de un curso sobre modelos de lenguaje (HSE LLM Course), y el repositorio contiene unicamente el adaptador PEFT y el tokenizador, no los pesos completos del modelo base. El base se cargo con cuantizacion de 4 bits en formato NF4 durante el entrenamiento, segun indica la model card.

El modelo resuelve una tarea concreta y acotada: dado un fragmento de tuit en ingles, emitir una etiqueta de sentimiento (`negative`, `neutral` o `positive`). El autor reporta un Macro F1 de 0,537 sobre el conjunto de test de TweetEval, una cifra modesta que refleja el caracter didactico del experimento mas que un rendimiento de produccion. No hay datos publicados sobre regimen de entrenamiento, hiperparametros, numero de pasos ni composicion exacta del dataset mas alla de la referencia a `cardiffnlp/tweet_eval`.

La relevancia de esta ficha es limitada para produccion: el modelo es un adaptador de 1.1B parametros con licencia Apache 2.0, pensado para demostrar un flujo de QLoRA sobre un LLM pequeno. Resulta util como referencia para quienes quieran reproducir un pipeline de ajuste eficiente en parametros con recursos modestos, o como punto de partida para tareas de clasificacion de texto corto en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama-1.1B-Chat-v1.0) con adaptador QLoRA (PEFT) |
| Parametros totales | 1.100 millones (modelo base); el adaptador anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada de TinyLlama-1.1B-Chat-v1.0) |
| Tipos de cuantizacion | Entrenamiento en 4 bits NF4; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) + tokenizador |
| Libreria | peft |
| Dataset de ajuste | cardiffnlp/tweet_eval |
| Tarea | Clasificacion de sentimiento (3 clases) |
| Tamano del repositorio | 0.0 GB (adaptador y tokenizador) |

## Arquitectura y entrenamiento

El modelo base es TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1.100 millones de parametros con atencion causal estandar y una ventana de contexto de 2048 tokens. Sobre el se aplica QLoRA: el base se carga cuantizado en 4 bits con formato NF4 y se entrenan adaptadores de bajo rango (LoRA) sobre las proyecciones del transformer. El adaptador resultante es lo que se publica en este repositorio, junto con el tokenizador del base.

El ajuste se realiza sobre `cardiffnlp/tweet_eval`, un corpus de tuits etiquetados para analisis de sentimiento. La model card no especifica el numero de ejemplos utilizados, la division train/validation/test, el rango de LoRA, el alpha, el learning rate, el numero de pasos ni si se aplico enmascaramiento de la perdida sobre la etiqueta. Tampoco se documenta si hubo etapas de RLHF o DPO; por el tipo de tarea (clasificacion) y el caracter del experimento, es razonable asumir que no. No se describen innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Clasificacion de sentimiento en ingles con tres etiquetas: `negative`, `neutral`, `positive`.
- Generacion de texto conversacional heredada del base TinyLlama-1.1B-Chat-v1.0, aunque el ajuste esta orientado a la tarea de clasificacion.
- Procesamiento de entradas cortas (tuits), dentro del limite de 2048 tokens del base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: el modelo esta etiquetado solo para ingles.
- No dispone de vision, audio ni modo thinking.
- El adaptador requiere cargar el modelo base para su uso; no es un modelo autonomo.

## Casos de uso

- Clasificacion de sentimiento en redes sociales: el adaptador puede aplicarse a lotes de tuits en ingles para etiquetar polaridad, con la salvedad de que el Macro F1 reportado (0,537) limita su uso a entornos exploratorios o de anotacion asistida, no a decisiones automatizadas.
- Reproduccion de un pipeline QLoRA con recursos modestos: sirve como referencia didactica para montar un flujo de ajuste en 4 bits NF4 con PEFT sobre un LLM de 1.1B, util en cursos y talleres.
- Filtrado previo en analisis de opinion: usar el modelo como primera pasada para separar menciones negativas de neutras o positivas antes de una revision humana, aprovechando el bajo coste de inferencia del base de 1.1B.
- Prototipado rapido de clasificadores de texto corto: el adaptador y el tokenizador se cargan con `peft` y `transformers`, lo que permite integrarlo en un notebook o script en minutos.
- Investigacion sobre calibracion en modelos pequenos: el desajuste entre etiquetas predichas y reales en los ejemplos de la model card (p. ej. `neutral` frente a `positive`) lo convierte en un caso de estudio para analizar sesgos de etiqueta.
- Base para experimentos de destilacion o comparacion: al ser un adaptador ligero sobre un base publico, es facil de comparar con otros adaptadores del mismo curso (existen variantes como `sodeniZz/...` y `01eg0/...`) para estudiar variabilidad entre ejecuciones.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro F1 | 0,537 | TweetEval (test) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible. La unica cifra reportada por el autor es el Macro F1 de 0,537 sobre el test de TweetEval. La model card incluye ademas tres ejemplos cualitativos de test en los que la prediccion coincide con la etiqueta en dos de tres casos.

## Requisitos de hardware

- VRAM estimada para inferencia del base en 4 bits: en torno a 1-2 GB, incluyendo pesos y overhead de activaciones para contextos cortos.
- VRAM estimada en fp16: aproximadamente 2,2 GB solo para pesos, mas overhead; en la practica, 4-6 GB para lotes pequenos.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 6 GB o mas; tambien puede ejecutarse en CPU con cuantizacion GGUF, aunque el adaptador publicado es PEFT y requeriria fusion previa con el base.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; `vLLM` y `TGI` son viables tras fusionar el adaptador con el base; `llama.cpp` y `Ollama` requieren convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del base (1.1B), se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WhyZosa/llm-course-hw3-tinyllama-qlora | 1.1B (base) + adaptador | 2048 | Sentimiento (3 clases) | 0,537 | Apache 2.0 | Hugging Face |
| sodeniZz/llm-course-hw3-tinyllama-qlora | 1.1B (base) + adaptador | 2048 | Sentimiento | no disponible | no disponible | Hugging Face |
| 01eg0/llm-course-hw3-tinyllama-qlora | 1.1B (base) + adaptador | 2048 | Sentimiento | no disponible | no disponible | Hugging Face |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 (base) | 1.1B | 2048 | Generacion conversacional | no aplica | Apache 2.0 | Hugging Face |

Las dos variantes listadas corresponden a la misma tarea de curso y al mismo base, segun los resultados de busqueda; no se dispone de sus cifras de rendimiento ni de su licencia en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento modesto: un Macro F1 de 0,537 sobre tres clases indica una capacidad de discriminacion limitada; no es adecuado para decisiones automatizadas sin revision humana.
- Sesgos de etiqueta: los ejemplos de la model card muestran predicciones que se desvian de la etiqueta real en casos ambiguos, lo que sugiere confusion entre `neutral` y las clases polares.
- Dominio restringido: entrenado solo con tuits en ingles; el rendimiento fuera de ese dominio (texto formal, otros idiomas, resenas de producto) no esta documentado y probablemente sea pobre.
- Idiomas: solo ingles; no hay evidencia de transferencia a castellano ni a otras lenguas.
- Contexto limitado: 2048 tokens, suficiente para tuits pero no para documentos largos.
- Dependencia del base: el repositorio no incluye los pesos completos; es necesario descargar TinyLlama-1.1B-Chat-v1.0 y cargar el adaptador con `peft`.
- Documentacion incompleta: no se detallan hiperparametros, composicion del dataset ni proceso de evaluacion, lo que dificulta la reproducibilidad.
- Licencia: Apache 2.0 permite uso comercial, pero el caracter experimental del modelo y su rendimiento limitado desaconsejan ese uso en produccion.
- Riesgo de alucinacion: aunque la tarea es de clasificacion, el modelo puede generar texto libre fuera del conjunto de etiquetas si se usa como generador sin restricciones de decodificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WhyZosa/llm-course-hw3-tinyllama-qlora
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Variante del mismo curso (sodeniZz): https://huggingface.co/sodeniZz/llm-course-hw3-tinyllama-qlora
- Variante del mismo curso (01eg0): https://huggingface.co/01eg0/llm-course-hw3-tinyllama-qlora
