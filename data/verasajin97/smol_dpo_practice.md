# verasajin97/smol_dpo_practice

## Resumen

smol_dpo_practice es un ajuste fino del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicado por el usuario verasajin97 en Hugging Face. El modelo se ha entrenado mediante DPO (Direct Preference Optimization) utilizando la libreria TRL de Hugging Face, lo que lo convierte en un ejemplo practico de alineacion por preferencias sobre un modelo base de muy pequeno tamano (134,5 millones de parametros). No es un modelo de proposito general ni un lanzamiento oficial de un laboratorio, sino un artefacto de experimentacion.

El problema que aborda es el de demostrar el flujo completo de DPO sobre un modelo compacto: partir de un instruct model ya afinado, aplicar preferencias y publicar los pesos resultantes. Su relevancia es principalmente didactica y de prototipado: permite reproducir el pipeline de TRL con un coste de computo minimo y sirve como base para experimentos de alineacion o de despliegue en entornos con recursos muy limitados.

Arquitectura transformer decoder-only heredada de SmolLM2, con 134.515.008 parametros totales segun los safetensors del repositorio. El contexto, los idiomas y la licencia no estan declarados en la informacion disponible, por lo que deben consultarse en el modelo base. El repositorio ocupa 0,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via llama.cpp/GGUF, no verificada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.16.0, Transformers 5.20.2, PyTorch 2.14.1+cu130, Datasets 4.8.5, Tokenizers 0.23.3 |
| Metodo de alineacion | DPO (Direct Preference Optimization) |
| Tamano del repositorio | 0,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros disenado por Hugging Face para ejecucion en dispositivos con recursos limitados. Sobre esa base se aplica un ajuste con DPO, la tecnica introducida en el paper "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., NeurIPS 2023), que optimiza directamente la politica frente a pares de respuestas preferidas y rechazadas sin entrenar un modelo de recompensa separado.

El entrenamiento se realizo con TRL 1.16.0 sobre Transformers 5.20.2 y PyTorch 2.14.1+cu130. La model card no especifica el dataset de preferencias utilizado, el numero de pasos, la tasa de aprendizaje, el valor de beta ni la composicion de los datos. Tampoco se documenta si hubo etapas adicionales de SFT o RLHF mas alla del DPO. No se declaran innovaciones tecnicas propias mas alla del uso del pipeline estandar de TRL.

## Capacidades

- Generacion de texto conversacional en formato chat (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Ajuste por preferencias mediante DPO, orientado a mejorar la calidad de las respuestas respecto al modelo base en los criterios reflejados en el dataset de preferencias (no documentado).
- Compatibilidad con `text-generation-inference` y endpoints compatibles, segun los tags del repositorio.
- Integracion directa con `transformers` y `trl`.
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen del modelo base.
- Tool calling, function calling, agentes multi-paso, vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de pipelines DPO: el modelo sirve para validar de extremo a extremo un flujo de entrenamiento con TRL (carga de dataset de preferencias, configuracion de `DPOTrainer`, evaluacion) antes de escalar a modelos mayores, gracias a su coste de computo minimo.
- Experimentos de alineacion en entornos academicos: permite reproducir y comparar variantes de DPO (distintos valores de beta, datasets o schedules) con un modelo de 135 M de parametros que cabe en cualquier GPU consumer.
- Despliegue en dispositivos edge o embebidos: con 134,5 M de parametros y pesos de 0,5 GB, es viable en CPU, Raspberry Pi o moviles mediante cuantizacion, para tareas de generacion de texto acotadas.
- Generacion de texto en aplicaciones de bajo coste: chatbots simples, autocompletado o respuestas a preguntas frecuentes donde la latencia y el coste importan mas que la calidad absoluta.
- Base para fine-tuning posterior: al ser un checkpoint intermedio de DPO, puede servir como punto de partida para SFT adicional o para RLHF ligero en proyectos de investigacion.
- Evaluacion comparativa de tecnicas de alineacion: util como baseline pequeno frente a variantes como ORPO, KTO o SimPO sobre el mismo modelo base.
- Pruebas de integracion con TGI y endpoints compatibles: el tag `text-generation-inference` permite usarlo para validar infraestructura de serving antes de migrar a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,3 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,15 GB para pesos; en 4 bits, alrededor de 0,08 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU y en GPUs integradas.
- Cabe en consumer GPU: si, en todas las GPU consumer con al menos 2 GB de VRAM, y en CPU con rendimiento aceptable para generacion corta.
- Opciones de despliegue: `transformers` (pipeline), `text-generation-inference` (segun tags), llama.cpp/Ollama mediante conversion a GGUF (no verificada en el repositorio), vLLM (compatible con arquitectura Llama-like, no verificado).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera una latencia muy baja en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smol_dpo_practice | 134,5 M | No disponible | DPO (TRL) | No disponible | Hugging Face (repo comunitario) |
| SmolLM2-135M-Instruct | 135 M | No disponible en esta ficha | SFT + preferencias (segun model card oficial) | Apache-2.0 (segun el modelo base, no verificado aqui) | Hugging Face (oficial) |
| SmolLM2-360M-Instruct | 360 M | No disponible en esta ficha | SFT + preferencias | Apache-2.0 (segun el modelo base, no verificado aqui) | Hugging Face (oficial) |
| Qwen2.5-0.5B-Instruct | 500 M | No disponible en esta ficha | SFT + preferencias | Apache-2.0 (segun el modelo base, no verificado aqui) | Hugging Face (oficial) |

La comparativa se limita a parametros y disponibilidad porque no hay benchmarks publicados para smol_dpo_practice ni datos de contexto y licencia declarados en su repositorio. Frente a los modelos oficiales, este checkpoint comunitario no aporta garantias de calidad ni de licencia, por lo que en produccion conviene preferir el modelo base oficial salvo que se busque el artefacto DPO especifico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de SmolLM2-135M-Instruct, hereda los sesgos del modelo base y del dataset de preferencias, que no se especifica.
- Riesgo de alucinacion: alto, propio de un modelo de 135 M de parametros; no debe usarse para tareas que requieran precision factual sin verificacion externa.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados; hay que consultarlos en la model card de SmolLM2-135M-Instruct.
- Licencia: no disponible en el repositorio; el campo `licence: license` de la model card es un placeholder. Antes de cualquier uso comercial debe verificarse la licencia del modelo base y del dataset de preferencias.
- Caveat de produccion: es un experimento comunitario con 0 descargas y 0 likes, sin benchmarks ni evaluacion publicada; no hay garantia de calidad ni de mantenimiento.
- La model card no documenta hiperparametros, dataset ni criterios de evaluacion, lo que impide reproducir el entrenamiento con exactitud.
- El tag `base_model:finetune` y la ausencia de datos sobre el dataset de preferencias impiden auditar el proceso de alineacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/verasajin97/smol_dpo_practice
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper DPO: https://huggingface.co/papers/2305.18290
- Paper DPO (NeurIPS 2023): http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
- Repositorio TRL: https://github.com/huggingface/trl
