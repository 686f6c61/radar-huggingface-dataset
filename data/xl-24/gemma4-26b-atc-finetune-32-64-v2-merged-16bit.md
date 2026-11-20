# xl-24/gemma4-26b-atc-finetune-32-64-v2-merged-16bit

## Resumen

`xl-24/gemma4-26b-atc-finetune-32-64-v2-merged-16bit` es un ajuste fino (finetune) del modelo multimodal `unsloth/gemma-4-26B-A4B-it`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo de la familia Gemma 4 con arquitectura Mixture of Experts (MoE), con 26 mil millones de parametros totales y 4 mil millones de parametros activos por token (la designacion "A4B" asi lo indica), capaz de procesar entradas de imagen y texto y generar texto. El ajuste se ha realizado con Unsloth y la libreria TRL de Hugging Face, y los pesos se han fusionado (merged) y exportado en precision de 16 bits.

El modelo hereda las capacidades del Gemma 4 base de Google, incluyendo procesamiento multimodal (image-text-to-text), generacion de texto conversacional y soporte para text-generation-inference. El prefijo "atc" en el nombre sugiere un ajuste orientado a un dominio especifico (posiblemente control de trafico aereo, "air traffic control"), aunque la model card no detalla la composicion del dataset de ajuste ni el objetivo concreto del entrenamiento.

Es relevante porque ejemplifica el flujo de trabajo de ajuste fino eficiente con Unsloth sobre modelos MoE multimodales de gran tamano, y porque el modelo fusionado en 16 bits puede desplegarse directamente con transformers y TGI. Sin embargo, la informacion publicada es muy escasa: no hay benchmarks, no se detalla el dataset de entrenamiento ni se documentan las capacidades especificas adquiridas tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer, multimodal (image-text-to-text) |
| Parametros totales | 26 mil millones (26B) |
| Parametros activos | 4 mil millones (4B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits; el modelo base admite cuantizacion via Unsloth/GGUF, pero no se documenta en esta ficha) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `unsloth/gemma-4-26B-A4B-it`, un modelo de la familia Gemma 4 con arquitectura Mixture of Experts: 26 mil millones de parametros totales de los cuales solo 4 mil millones se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano total. La variante base es multimodal (procesa imagen y texto) y esta ajustada para instrucciones ("it"). El ajuste fino se realizo con Unsloth, que segun la model card permite un entrenamiento "2x mas rapido", y con la libreria TRL de Hugging Face. Los pesos resultantes se fusionaron (merged) y se exportaron en 16 bits.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se aplicaron tecnicas de RLHF o DPO en esta etapa. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo base Gemma 4. El sufijo "32-64-v2" del nombre sugiere configuraciones de entrenamiento (posiblemente rangos de LoRA o pasos), pero no se detalla en la model card.

## Capacidades

- Generacion de texto conversacional en ingles.
- Procesamiento multimodal de entrada imagen-texto (pipeline image-text-to-text).
- Razonamiento y respuesta a instrucciones heredados del modelo base Gemma 4.
- Compatibilidad con text-generation-inference (TGI) y transformers.
- Soporte de tool calling / function calling: no documentado en esta ficha (el modelo base podria soportarlo, pero no se confirma).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (thinking mode, audio, etc.): no documentadas.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo puede recibir imagenes y texto y generar respuestas conversacionales, util para validar flujos de vision-lenguaje antes de invertir en modelos mayores.
- Investigacion sobre ajuste fino eficiente: sirve como referencia de un pipeline Unsloth + TRL sobre un MoE multimodal de 26B, permitiendo reproducir o comparar estrategias de entrenamiento.
- Despliegue en TGI para pruebas internas: al estar en safetensors y ser compatible con text-generation-inference, puede servirse en infraestructura propia para evaluar latencia y calidad.
- Generacion de descripciones de imagenes en ingles: adecuado para tareas de captioning o respuesta visual a preguntas en entornos de habla inglesa.
- Base para ajustes posteriores de dominio: al ser un modelo fusionado en 16 bits con licencia Apache 2.0, puede reajustarse para tareas especificas (por ejemplo, el dominio "atc" que sugiere su nombre).
- Experimentacion academica con MoE: permite estudiar el comportamiento de un modelo con 4B parametros activos sobre 26B totales en tareas de generacion y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 52 GB solo para pesos (26B parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 60-80 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2x A100 40GB o 2x RTX 4090 24GB con tensor parallelism).
- Consumer GPU: no cabe en una unica RTX 4090 (24GB) en 16 bits; requeriria cuantizacion (no documentada en esta ficha) o sharding multi-GPU.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (previa conversion), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-26b-atc-finetune-32-64-v2-merged-16bit | 26B / 4B | no disponible | Apache 2.0 | Si | Hugging Face |
| unsloth/gemma-4-26B-A4B-it (base) | 26B / 4B | no disponible | Apache 2.0 (heredada) | Si | Hugging Face |
| Gemma 3 27B (referencia de familia anterior) | 27B denso | no disponible en esta ficha | Gemma license | Si | Hugging Face |
| Mixtral 8x7B | 46.7B / 12.9B | 32k | Apache 2.0 | No | Hugging Face |

Nota: los datos de los modelos comparativos son de referencia general y pueden no coincidir exactamente con las versiones actuales; no se dispone de benchmarks del modelo evaluado para comparar rendimiento.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta dataset, objetivos ni evaluacion; no se puede garantizar la calidad del ajuste.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks no se puede acotar.
- Sesgos: no documentados; el modelo base Gemma puede heredar sesgos de sus datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 de Google, que pueden imponer terminos adicionales.
- Contexto: longitud de contexto no disponible, lo que dificulta planificar despliegues con ventanas largas.
- Cuantizaciones: no se publican versiones GGUF ni cuantizadas, lo que limita el despliegue en hardware consumer.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-26b-atc-finetune-32-64-v2-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
