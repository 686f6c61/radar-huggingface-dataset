# VenuArvind/lenscoach-gemma4-e2b

## Resumen

`VenuArvind/lenscoach-gemma4-e2b` es un adaptador LoRA publicado en Hugging Face por el usuario VenuArvind, obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del Gemma 4 E2B instruct de Google. El repositorio contiene únicamente los pesos del adaptador PEFT (10,4 GB en total), no un modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador encima. El nombre del repositorio sugiere un propósito de asistencia a entrenadores o corrección de técnica (lenscoach), aunque la model card no documenta el dominio ni el conjunto de datos de entrenamiento.

El modelo hereda la arquitectura y las capacidades del Gemma 4 E2B, una variante ultraligera de la familia Gemma 4 orientada a inferencia local y en dispositivos de borde. Según la información pública disponible del modelo base, se trata de un modelo de aproximadamente 2.100 millones de parámetros, solo texto, con una ventana de contexto de 8K tokens y capacidad de ejecutarse íntegramente en CPU. El adaptador suma 5.104.297.539 parámetros en los tensores safetensors del repositorio, cifra que corresponde al conjunto de pesos almacenados (base cuantizada más adaptador) y no a los parámetros activos del modelo.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo de fine-tuning comunitario de bajo coste sobre un modelo pequeño, con documentación mínima y sin métricas publicadas. Resulta útil como referencia para quienes quieran replicar el flujo (Unsloth + TRL + PEFT) sobre Gemma 4 E2B, pero no debe evaluarse como un modelo listo para producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 4 E2B); adaptador LoRA sobre modelo base cuantizado en 4 bits |
| Parametros totales | 5.104.297.539 en los tensores del repositorio (incluye base cuantizada y adaptador); el modelo base Gemma 4 E2B tiene ~2,1 mil millones de parámetros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8K tokens (según la información pública del modelo base Gemma 4 E2B) |
| Tipos de cuantizacion | Modelo base en bnb-4bit (bitsandbytes); el adaptador se distribuye en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (la model card no los especifica) |
| Licencia | no disponible (la model card no la declara; la licencia del modelo base Gemma condiciona el uso) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA entrenado con SFT sobre `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`. La arquitectura subyacente es la de Gemma 4 E2B: un transformer decoder-only de aproximadamente 2,1 mil millones de parámetros, solo texto, con 8K de contexto y diseñado para inferencia en CPU y dispositivos de borde. El entrenamiento se realizó con el stack Unsloth + TRL + PEFT (versión de PEFT 0.21.2 según la model card), lo que implica bajo consumo de memoria y optimizaciones de kernels para el ajuste fino.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset, la existencia de RLHF/DPO posterior, hiperparámetros (learning rate, rango LoRA, alpha, dropout) ni la duración del entrenamiento. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]", por lo que no hay innovaciones técnicas documentadas más allá del uso de LoRA sobre una base cuantizada en 4 bits.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruct Gemma 4 E2B.
- Razonamiento básico y respuesta a instrucciones en formato chat (pipeline `text-generation`, etiqueta `conversational`).
- Procesamiento de imagen y texto según la etiqueta `image-text-to-text` del repositorio, aunque la información pública del modelo base lo describe como solo texto; esta discrepancia no está aclarada por el autor.
- Fine-tuning específico de dominio no documentado (el nombre "lenscoach" sugiere asistencia a entrenadores o corrección de técnica, sin confirmación).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: el adaptador puede cargarse sobre Gemma 4 E2B en una máquina sin GPU y servir respuestas de chat con 8K de contexto, adecuado para demos y pruebas de concepto en local.
- Experimentación académica con LoRA y Unsloth: sirve como ejemplo reproducible de fine-tuning SFT de bajo coste sobre un modelo pequeño cuantizado en 4 bits, útil para comparar flujos de entrenamiento.
- Despliegue en dispositivos de borde: al heredar la capacidad de ejecución en CPU del modelo base, puede integrarse en entornos embebidos o sin acelerador dedicado para tareas de generación de texto acotadas.
- Asistencia especializada de dominio (si el fine-tuning confirma el propósito "lenscoach"): podría emplearse como corrector o guía en un nicho concreto, siempre que el usuario valide la calidad con su propio conjunto de evaluación.
- Generación de borradores y resúmenes de texto corto: con 8K de contexto y un modelo de 2,1B, encaja en tareas de resumen de documentos breves o reescritura en pipelines de bajo coste.
- Base para fine-tuning adicional: al ser un adaptador PEFT, puede combinarse o continuar entrenándose con nuevos datos mediante merges o entrenamiento incremental, sin necesidad de reentrenar el modelo completo.
- Filtrado y clasificación de texto en local: para etiquetado o moderación de contenidos en entornos con requisitos de privacidad, al no requerir enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación y la búsqueda web solo aporta datos descriptivos del modelo base (2,1B parámetros, 8K de contexto, ejecución en CPU), sin cifras de MMLU, HumanEval, GSM8K ni comparativas.

## Requisitos de hardware

- VRAM estimada: el adaptador en safetensors ocupa 10,4 GB en disco; en inferencia, el modelo base cuantizado en 4 bits requiere del orden de 1,5-2,5 GB de memoria, más el overhead del adaptador y del runtime (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería poder cargar el modelo base cuantizado; el adaptador añade una carga mínima.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en GPUs de consumo con al menos 4 GB de VRAM, y también en CPU según las características del modelo base Gemma 4 E2B.
- Opciones de despliegue: `transformers` + `peft` (flujo nativo del repositorio); llama.cpp/Ollama requerirían convertir y fusionar el adaptador con el modelo base; vLLM y TGI son compatibles con pesos safetensors tras el merge, aunque no están documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lenscoach-gemma4-e2b (este) | ~2,1B (base) + adaptador LoRA | 8K | no disponible | safetensors (PEFT) | Fine-tuning comunitario sin benchmarks ni documentación |
| Gemma 4 E2B (base) | ~2,1B | 8K | licencia Gemma (no verificada en esta ficha) | safetensors, GGUF (según distribución oficial) | Modelo oficial de Google, solo texto, ejecutable en CPU |
| Gemma 4 E2B-it (instruct) | ~2,1B | 8K | licencia Gemma | safetensors | Variante instruct oficial, base del adaptador |
| Otros modelos pequeños de la misma clase (p. ej. Qwen o Llama de ~1-3B) | ~1-3B | variable | variable | safetensors, GGUF | No se dispone de comparación de rendimiento verificada en la información proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este adaptador con alternativas; la comparativa se limita a parámetros, contexto y formato.

## Limitaciones y advertencias

- La model card está sin completar: no declara autoría efectiva, licencia, idiomas, datos de entrenamiento ni evaluación, lo que impide verificar su idoneidad para producción.
- Licencia no disponible: el uso comercial queda condicionado por la licencia del modelo base Gemma, que el autor no reproduce; es imprescindible consultar los términos oficiales de Google antes de cualquier despliegue.
- Riesgo de alucinación inherente a un modelo de 2,1B parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Ventana de contexto de 8K tokens: insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados: no puede garantizarse un rendimiento adecuado en castellano u otros idiomas distintos del inglés sin evaluación previa.
- Posible sobreajuste al dominio del fine-tuning: al no conocerse el dataset, el adaptador podría degradar el comportamiento general del modelo base en tareas ajenas a su especialización.
- Discrepancia entre la etiqueta `image-text-to-text` del repositorio y la descripción pública del modelo base como solo texto; conviene verificar la multimodalidad antes de asumirla.
- Sin métricas de evaluación publicadas: no hay evidencia de que el fine-tuning mejore al modelo base en ninguna tarea.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VenuArvind/lenscoach-gemma4-e2b
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Información pública de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
