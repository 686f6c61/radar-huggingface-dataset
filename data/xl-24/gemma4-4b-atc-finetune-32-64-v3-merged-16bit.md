# xl-24/gemma4-4b-atc-finetune-32-64-v3-merged-16bit

## Resumen

`xl-24/gemma4-4b-atc-finetune-32-64-v3-merged-16bit` es un ajuste fino (finetune) del modelo `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text derivado de la familia Gemma 4, orientado a generación de texto conversacional y entrenado con la librería Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un ajuste orientado a control de tráfico aéreo (ATC, del inglés *air traffic control*), aunque la model card no documenta explícitamente el dataset ni el propósito del entrenamiento.

El modelo cuenta con 7.996.156.490 parámetros en pesos safetensors (aproximadamente 8.000 millones), lo que resulta llamativo frente a la denominación "4b" del identificador: el repositorio se distribuye en precisión de 16 bits con un tamaño total de 16 GB, y los pesos derivan de una versión base cuantizada en bnb-4bit que ha sido fusionada y exportada de nuevo a 16 bits. Esta discrepancia entre el nombre comercial y el recuento real de parámetros conviene tenerla en cuenta al planificar el despliegue.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, sin descargas ni likes en el momento de la consulta, con documentación mínima y sin resultados de benchmarks publicados. Resulta útil como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre un modelo multimodal de la familia Gemma 4, pero no debe considerarse un modelo validado para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Gemma 4; detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (aprox. 8.000 millones, segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en 16 bits; el modelo base se entreno sobre una version bnb-4bit; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su caracter multimodal (pipeline image-text-to-text) y su pertenencia a la familia Gemma 4. El modelo base es `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, una version instruct ya cuantizada en 4 bits por Unsloth. Sobre esa base se realizo un ajuste fino supervisado utilizando Unsloth y la libreria TRL, segun indica la model card, y posteriormente los pesos se fusionaron (merge) y se exportaron en 16 bits, dando lugar al repositorio actual.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El sufijo "32-64-v3" del identificador sugiere alguna variante de configuracion de entrenamiento (posiblemente longitudes de secuencia o rangos de LoRA), pero no hay documentacion que lo confirme. Tampoco se detalla si el ajuste cubre la torre de vision o solo el decodificador de texto.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct de Gemma 4.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text), lo que permite tareas de comprension visual y respuesta en lenguaje natural.
- Razonamiento multi-turno en formato chat, segun el tag `conversational`.
- Compatibilidad con text-generation-inference (TGI) y con la libreria transformers, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno basicos gracias a su herencia de un modelo instruct; adecuado para pruebas de concepto, no para produccion sin evaluacion previa.
- Experimentacion con modelos multimodales de ~8.000 millones de parametros: util para investigadores que quieran comparar el comportamiento de un finetune ligero frente al modelo base Gemma 4 en tareas de imagen y texto.
- Ajuste fino adicional sobre una base ya entrenada: al estar publicado en 16 bits y con licencia Apache 2.0, sirve como punto de partida para nuevos finetunes con Unsloth o TRL.
- Docencia y formacion en pipelines de LLM: el repositorio ejemplifica el flujo completo de cuantizacion 4-bit, finetune, merge y exportacion a 16 bits.
- Evaluacion de calidad de finetunes comunitarios: util como caso de estudio para medir la degradacion o mejora respecto al modelo base en tareas concretas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial, aunque la falta de benchmarks obliga a validar el modelo antes de integrarlo en un producto.
- Procesamiento de documentos con imagenes en ingles: la capacidad image-text-to-text permite extraer y describir contenido visual, siempre que se valide el rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para secuencias moderadas.
- VRAM estimada en 8 bits: alrededor de 8-9 GB de pesos, con overhead adicional.
- VRAM estimada en 4 bits: alrededor de 4-5 GB de pesos, con overhead adicional; esta es la configuracion del modelo base original.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues concurrentes; RTX 4090 (24 GB) para inferencia en 16 bits con contexto limitado; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en 16 bits con contexto contenido; en 8 o 4 bits podria caber en GPUs de 12-16 GB, aunque no hay datos confirmados.
- Opciones de despliegue: transformers, text-generation-inference (TGI) segun los tags; vLLM, llama.cpp u Ollama no estan confirmados para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-4b-atc-finetune-32-64-v3-merged-16bit | ~8.000 M | no disponible | Apache 2.0 | Si (image-text-to-text) | Hugging Face, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (modelo base) | no disponible | no disponible | no disponible | Si | Hugging Face |
| Gemma 4 E4B-it (modelo original de Google) | no disponible | no disponible | no disponible | Si | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe el dataset, el objetivo del finetune ni los hiperparametros, lo que impide reproducir el entrenamiento.
- Discrepancia entre el nombre ("4b") y el recuento real de parametros (~8.000 millones): puede inducir a error en la planificacion de recursos.
- Solo idioma ingles declarado; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos no evaluados: al no publicarse informacion sobre el dataset de ajuste, no es posible conocer sesgos introducidos.
- El sufijo "atc" sugiere un dominio de control de trafico aereo, un ambito critico donde un modelo sin validacion no debe usarse para decisiones operativas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Al derivar de una base cuantizada en 4 bits y reexportarse a 16 bits, la calidad puede diferir de la del modelo original de Google.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xl-24/gemma4-4b-atc-finetune-32-64-v3-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
