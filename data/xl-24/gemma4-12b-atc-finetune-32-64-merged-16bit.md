# xl-24/gemma4-12b-atc-finetune-32-64-merged-16bit

## Resumen

`xl-24/gemma4-12b-atc-finetune-32-64-merged-16bit` es un ajuste fino (fine-tuning) del modelo multimodal `unsloth/gemma-4-12B-it`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo de la familia Gemma 4 en su variante "unified" (procesa imagen y texto), con 12.000 millones de parametros, entrenado mediante las librerias Unsloth y TRL de Hugging Face para acelerar el proceso de ajuste. El sufijo del nombre indica que se ha fusionado (merged) tras un entrenamiento con LoRA en precision de 16 bits.

El modelo resuelve el problema de adaptar un modelo generalista multimodal a una tarea concreta, en este caso presumiblemente control de trafico aereo (ATC, por las siglas en el nombre), aunque la model card no documenta la tarea ni el dataset de entrenamiento. Es relevante como ejemplo de flujo de trabajo de ajuste fino reproducible sobre Gemma 4 con Unsloth, pero su utilidad general fuera de esa tarea concreta es limitada y su documentacion es practicamente inexistente.

La informacion disponible es muy escasa: el repositorio no contiene pesos visibles (tamano de 0.0 GB), no hay descripciones de datos de entrenamiento, hiperparametros, benchmarks ni limitaciones. Esta ficha se limita a lo que puede verificarse a partir de los metadatos y la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified), no disponible el detalle |
| Parametros totales | 12 000 millones (12B, segun el nombre y el modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es de 16 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no confirmado en el repo) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/gemma-4-12B-it`, un modelo de la familia Gemma 4 de Google en su variante instruct y "unified", que procesa entradas de imagen y texto (pipeline `image-text-to-text`). El ajuste fino se realizo con Unsloth y TRL, segun indica la model card, con un entrenamiento "2x mas rapido" que el flujo estandar, aunque no se especifican hiperparametros, rango de LoRA, numero de pasos ni tamano del dataset.

El checkpoint publicado es el resultado de fusionar los adaptadores LoRA con los pesos base en precision de 16 bits (de ahi el sufijo `merged-16bit`). No se documenta si hubo RLHF, DPO ni ninguna fase de alineamiento adicional mas alla del modelo instruct original. Tampoco se detalla la composicion del dataset de ajuste fino ni si se trato de una tarea de texto, imagen o multimodal.

## Capacidades

- Generacion de texto y conversacion multi-turno (heredadas del modelo instruct base).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`).
- Razonamiento y generacion de codigo, en la medida en que el modelo base Gemma 4 las soporte (no verificado para este checkpoint).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (modo thinking, audio, vision detallada): no disponible mas alla de la entrada de imagen.

## Casos de uso

- **Ajuste fino especializado en una tarea concreta (presumiblemente ATC)**: el modelo esta pensado para tareas de dominio especifico tras el fine-tuning; se usaria como sustituto del modelo base cuando se necesite el comportamiento aprendido en el dataset de ajuste.
- **Prototipado de pipelines multimodales con Gemma 4**: sirve como punto de partida para experimentar con entradas de imagen y texto en un modelo de 12B, gracias a su licencia Apache 2.0 y a la integracion con transformers.
- **Investigacion sobre ajuste fino eficiente**: el checkpoint documenta un flujo Unsloth + TRL con fusion en 16 bits, util como referencia para reproducir el proceso en otros dominios.
- **Despliegue en entornos con requisitos de licencia permisiva**: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de otras licencias de modelos abiertos.
- **Evaluacion comparativa de modelos ajustados**: permite medir el impacto del fine-tuning frente al modelo base en tareas de dominio, siempre que se disponga del dataset original.
- **Generacion de respuestas asistidas con contexto visual**: en escenarios donde se requiera interpretar imagenes junto con texto (por ejemplo, documentacion tecnica con diagramas), aunque no hay evidencia publicada de su rendimiento en esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en 16 bits**: aproximadamente 24-28 GB solo para los pesos (12B x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 32 GB de VRAM para contexto moderado.
- **Cuantizacion a 8 bits**: en torno a 12-14 GB de VRAM, viable en GPUs de 16 GB.
- **Cuantizacion a 4 bits**: en torno a 7-8 GB de VRAM, viable en GPUs consumer de 8-12 GB (RTX 3060, 4060, 4070).
- **GPUs recomendadas**: A100 40/80 GB, H100 para produccion en 16 bits; RTX 4090 (24 GB) para 16 bits con contexto corto o 8 bits con contexto amplio.
- **Opciones de despliegue**: transformers (libreria indicada), text-generation-inference (tag presente), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xl-24/gemma4-12b-atc-finetune-32-64-merged-16bit | 12B | no disponible | Apache 2.0 | Hugging Face, sin pesos visibles |
| unsloth/gemma-4-12B-it (modelo base) | 12B | no disponible | no disponible | Hugging Face |
| Gemma 3 12B IT (generacion anterior) | 12B | 128K (segun documentacion de Google) | Gemma license | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, la tarea objetivo ni los hiperparametros, lo que impide evaluar su calidad y reproducibilidad.
- El repositorio muestra un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que la informacion esta incompleta; conviene verificar antes de su uso.
- Riesgo de alucinacion y sesgos heredados del modelo base Gemma 4, no evaluados para este checkpoint.
- Idioma limitado al ingles segun los metadatos; el rendimiento en castellano no esta verificado.
- Aunque la licencia es Apache 2.0, el uso comercial debe revisarse tambien respecto a las condiciones del modelo base de Google.
- No hay evidencia publicada de rendimiento en tareas de produccion ni benchmarks que respalden su uso fuera del dominio de ajuste.
- El nombre sugiere una especializacion en control de trafico aereo, un dominio critico donde los errores tienen consecuencias graves; no se recomienda su uso en produccion sin validacion exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-12b-atc-finetune-32-64-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponible
