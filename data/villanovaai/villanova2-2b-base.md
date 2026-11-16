# VillanovaAI/Villanova2-2B-Base

## Resumen

Villanova2-2B-Base es un modelo de lenguaje de tipo base (pretrained, sin ajuste por instrucciones) desarrollado por VillanovaAI. Con 2.411.190.272 parámetros (aproximadamente 2,4 mil millones), se construye sobre la arquitectura Qwen3 y está orientado a la generación de texto multilingüe en cinco idiomas europeos: inglés, italiano, alemán, español y francés. Su licencia Apache 2.0 y su naturaleza de modelo base lo sitúan como una pieza de partida para fine-tuning posterior, no como un asistente listo para usar.

El modelo se presenta con una vocación claramente europea, tanto por la selección de idiomas como por la inclusión de conjuntos de datos como FineWeb2-HQ y Common Pile en su mezcla de entrenamiento. Esto lo hace relevante para equipos que necesitan un modelo compacto, con licencia permisiva y buen soporte para lenguas romances y germánicas, sobre el que construir aplicaciones especializadas mediante ajuste fino supervisado o preferencias.

En el momento de redactar esta ficha, el acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargar los pesos. El modelo acumula 13 descargas y 4 likes, y su última actualización data del 15 de noviembre de 2026. No se han publicado resultados de benchmarks ni detalles completos sobre el proceso de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen3 |
| Parámetros totales | 2.411.190.272 (~2,4 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; se espera compatibilidad con GGUF/AWQ vía herramientas externas, pero no confirmado) |
| Idiomas soportados | en, it, de, es, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only derivada de Qwen3, según indican las etiquetas del repositorio. Con 2,4 mil millones de parámetros, se trata de un modelo denso de tamaño compacto, adecuado para despliegue en hardware de gama media. No se dispone de información sobre el número exacto de capas, dimensión oculta, número de cabezas de atención ni sobre la longitud de contexto nativa, ya que estos datos no aparecen en la información proporcionada.

En cuanto a los datos de entrenamiento, las etiquetas del repositorio enumeran una mezcla extensa de conjuntos de datos: FineWeb-Edu, FineWeb-2, FinePDFs, FinePDFs-Edu, FineWiki, FineMath, Stack-Edu, Nemotron-CC-Math-v1, Nemotron-CC-v2, DCLM-Baseline-1.0, FineWeb2-HQ, Common Pile (comma_v0.1), Dolmino-Mix-1124. Esta combinación sugiere un entrenamiento centrado en texto web de alta calidad, contenido matemático, código y material enciclopédico, con énfasis en cobertura multilingüe europea. No se especifica el número total de tokens procesados, la composición porcentual de la mezcla, ni si se aplicaron etapas de RLHF, DPO o ajuste por instrucciones (el modelo se etiqueta explícitamente como base-model y pretrained).

## Capacidades

- Generación de texto autoregresiva en inglés, italiano, alemán, español y francés.
- Razonamiento y conocimiento general derivados del preentrenamiento sobre corpus web, enciclopédicos y matemáticos.
- Capacidad matemática esperada por la inclusión de FineMath, Nemotron-CC-Math-v1 y Dolmino-Mix en el entrenamiento.
- Capacidad de generación de código por la presencia de Stack-Edu en la mezcla de datos.
- Modelo base: no incluye plantilla de chat ni comportamiento de instrucciones por defecto; requiere fine-tuning o prompting few-shot para tareas concretas.
- Soporte de tool calling / function calling: no disponible de forma nativa (al ser un modelo base, no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Fine-tuning supervisado para asistentes en español, italiano, francés o alemán: al ser un modelo base con licencia Apache 2.0, se puede ajustar con datasets propios de instrucciones para crear un asistente especializado en dominio sin restricciones comerciales.
- Generación aumentada por recuperación (RAG) en entornos europeos: el modelo puede integrarse como generador en pipelines RAG para responder sobre documentación interna en varios idiomas, aprovechando su cobertura multilingüe.
- Clasificación y etiquetado de texto: tras un ajuste ligero, puede emplearse para tareas de clasificación, análisis de sentimiento o extracción de entidades en corpus multilingües.
- Generación de código asistida en entornos con requisitos de licencia permisiva: su entrenamiento con Stack-Edu permite adaptarlo como modelo de autocompletado o generación de código en herramientas internas.
- Investigación en modelos compactos multilingües: sirve como punto de partida para estudiar técnicas de destilación, cuantización o ajuste eficiente en lenguas europeas de recursos medios.
- Procesamiento de documentación técnica y científica: la inclusión de FinePDFs y FineMath lo hace adecuado para tareas de resumen o extracción sobre PDFs técnicos tras el correspondiente fine-tuning.
- Despliegue en entornos con recursos limitados: con 2,4 B de parámetros, es viable en GPUs de consumo tras cuantización, lo que facilita prototipado y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 2,4 B, en FP16 se requieren aproximadamente 4,8 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 2,5-3 GB, y en 4 bits alrededor de 1,5-2 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar compatibilidad con GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, así como con A100/H100 para despliegues de mayor throughput, pero no se confirma oficialmente.
- Cabida en GPU de consumo: probable en modelos con 8 GB o más de VRAM en cuantizaciones de 8 o 4 bits, si bien no está verificado por el autor.
- Opciones de despliegue: la model card indica compatibilidad con text-generation-inference y endpoints_compatible; también es esperable el uso con transformers, vLLM y llama.cpp tras conversión a GGUF, aunque solo TGI y endpoints están confirmados por las etiquetas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Villanova2-2B-Base | ~2,4 B | no disponible | en, it, de, es, fr | Apache 2.0 | Gated |
| Qwen3 (variantes pequeñas) | ~1,7-4 B según variante | no disponible en esta ficha | multilingüe amplio | Apache 2.0 (según variante) | Abierto |
| Gemma 2 2B | ~2,6 B | no disponible en esta ficha | multilingüe | Gemma Terms | Abierto con condiciones |
| SmolLM2 1.7B | ~1,7 B | no disponible en esta ficha | principalmente inglés | Apache 2.0 | Abierto |

La comparación se limita a datos generales de categoría, ya que no se dispone de benchmarks publicados para Villanova2-2B-Base que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde de forma fiable a instrucciones directas ni mantiene formato de chat sin fine-tuning previo.
- Riesgo de alucinación inherente a los modelos de lenguaje preentrenados sobre corpus web; no se documentan mitigaciones específicas.
- Sesgos potenciales procedentes de los datasets de preentrenamiento (web, enciclopédico, código), sin evaluación de sesgos publicada.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que dependan de ventanas largas sin verificación empírica.
- Cobertura lingüística limitada a cinco idiomas (en, it, de, es, fr); no se garantiza rendimiento en otras lenguas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en pipelines de CI/CD.
- Licencia Apache 2.0: permisiva para uso comercial, pero al ser un modelo base, el usuario asume la responsabilidad sobre el fine-tuning y la evaluación del modelo resultante.
- Sin información publicada sobre benchmarks, ablaciones o detalles de entrenamiento, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/VillanovaAI/Villanova2-2B-Base
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- FinePDFs: https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- FinePDFs-Edu: https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu
- FineWiki: https://huggingface.co/datasets/HuggingFaceFW/finewiki
- FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Nemotron-CC-v2: https://huggingface.co/datasets/nvidia/Nemotron-CC-v2
- DCLM-Baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Common Pile (comma_v0.1): https://huggingface.co/datasets/common-pile/comma_v0.1_training_dataset
- Dolmino-Mix-1124: https://huggingface.co/datasets/allenai/dolmino-mix-1124
