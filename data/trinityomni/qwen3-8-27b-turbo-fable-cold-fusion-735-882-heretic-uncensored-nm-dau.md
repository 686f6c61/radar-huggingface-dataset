# trinityomni/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

El modelo `trinityomni/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` es un finetune de Qwen/Qwen3.8-27B, desarrollado por el usuario trinityomni con contribuciones de DavidAU y Nightmedia. Se presenta como un modelo "uncensored" (sin censura) y con un razonamiento optimizado, orientado a reducir el "overthinking" (sobre-pensamiento) típico de los modelos Qwen recientes. El modelo es multimodal, con pipeline `image-text-to-text`, y está licenciado bajo Apache 2.0.

Según la información disponible, el modelo base Qwen3.8-27B tiene 27.781.427.952 parámetros totales, con un tamaño de repositorio de 55.6 GB en formato safetensors. No se especifica la longitud de contexto ni si se trata de una arquitectura MoE. El autor afirma haber aplicado técnicas de "Cold Fusion", "GAIN Training" y "Multi-stage tuning", junto con la herramienta Unsloth, para producir varias versiones y ramas del modelo. La model card incluye afirmaciones de mejoras significativas frente al modelo base, aunque no se aportan métricas detalladas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con cuantizaciones de 4 y 8 bits (incluye imatrix, segun la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal) y GGUF (repo de DavidAU) |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen/Qwen3.8-27B, que a su vez es un modelo multimodal capaz de procesar imágenes y texto. La arquitectura base es un transformer, aunque no se especifica si es densa o de mezcla de expertos (MoE). El proceso de entrenamiento, descrito por el autor como "Cold Fusion", "GAIN Training" y "Multi-stage tuning", se ha realizado con la librería Unsloth y se divide en varias etapas y ramas (branches). La model card menciona una fase de "heretic'ing" (eliminación de restricciones de seguridad) seguida de un "healing" posterior, lo que sugiere un ajuste para eliminar la alineación de seguridad y luego recuperar cierta coherencia.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicó RLHF o DPO. El autor afirma que el modelo reduce drásticamente el número de tokens de pensamiento (de 1/2 a 1/10 en comparación con Qwen estándar) manteniendo el nivel de detalle, y que adapta automáticamente el tamaño del razonamiento según la tarea. También indica que las cuantizaciones de 4 bits alcanzan un 99% del rendimiento de las de 8 bits, aunque no se aportan benchmarks concretos.

## Capacidades

- Generación de texto multimodal: procesa imágenes y texto, y genera respuestas en inglés.
- Razonamiento con reducción de "overthinking": según la model card, el modelo genera menos tokens de pensamiento que el Qwen base, lo que agiliza las respuestas.
- Adaptación automática del tamaño de pensamiento: el modelo ajusta la cantidad de razonamiento según la complejidad de la consulta.
- Sin restricciones de contenido: al ser "uncensored", no aplica filtros de seguridad, lo que permite generar contenido que otros modelos rechazarían.
- Mejoras en métricas de razonamiento: el autor afirma mejoras sustanciales frente al modelo base, especialmente en ARC-C (141 puntos por encima), aunque sin datos verificables.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información disponible, pero al ser un finetune de Qwen3.8-27B, es probable que herede estas capacidades del modelo base.
- Idiomas: únicamente inglés.

## Casos de uso

- Análisis de imágenes y documentos: gracias a su capacidad multimodal, el modelo puede describir imágenes, extraer texto de capturas o responder preguntas sobre contenido visual. Es adecuado para tareas de documentación técnica donde se necesita interpretar diagramas o capturas de pantalla.
- Generación de contenido creativo sin filtros: al ser un modelo "uncensored", puede utilizarse para escribir ficción, guiones o diálogos que aborden temas sensibles sin las restricciones habituales de los modelos alineados.
- Asistentes de razonamiento analítico: la reducción de tokens de pensamiento permite obtener respuestas más rápidas en tareas de análisis, como resúmenes de informes o evaluación de opciones, sin sacrificar el nivel de detalle.
- Investigación sobre modelos sin censura: el modelo es útil para estudiar el comportamiento de modelos de lenguaje cuando se eliminan las restricciones de seguridad, comparando sus respuestas con las de modelos alineados.
- Automatización de tareas de texto en inglés: puede emplearse en pipelines de procesamiento de lenguaje natural para clasificación, extracción de información o generación de texto, siempre que el contenido no requiera moderación.
- Prototipado de aplicaciones multimodales: para desarrolladores que necesitan un modelo que combine visión y lenguaje en un solo sistema, sin las limitaciones de los modelos censurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor incluye afirmaciones cualitativas, como que el modelo supera el rendimiento de todos los modelos Qwen 3.8 de 27B, que ARC-C está 141 puntos por encima del Qwen 3.8 27B base, y que las cuantizaciones de 4 bits se sitúan al 99% del rendimiento de 8 bits. Sin embargo, no se aportan valores numéricos concretos ni comparativas con otros modelos. Por tanto, no es posible presentar una tabla de benchmarks verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 55.6 GB, por lo que se necesitaría una GPU con al menos 56 GB de VRAM. Con cuantización de 8 bits, la VRAM requerida se reduce a unos 28-30 GB. Con cuantización de 4 bits, se estima una necesidad de 14-16 GB.
- GPU recomendadas: para cuantización de 4 bits, una RTX 4090 (24 GB) o una A100 40 GB son suficientes. Para FP16, se recomiendan A100 80 GB o H100.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 bits puede ejecutarse en tarjetas de gama alta como RTX 4090 o RTX 3090, siempre que la VRAM sea suficiente.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers son opciones viables. El repo GGUF de DavidAU facilita el uso con llama.cpp y Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa detallada con otros modelos. El modelo es un finetune de Qwen3.8-27B, por lo que la comparación natural sería con el modelo base, pero no se han publicado especificaciones ni benchmarks del base en la información disponible. Tampoco se conocen otros finetunes de la misma categoría con datos comparables. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- Ausencia de censura: al ser "uncensored", puede generar contenido dañino, ilegal o éticamente problemático. Es responsabilidad del usuario aplicar filtros en producción.
- Afirmaciones no verificadas: la model card contiene declaraciones de rendimiento sin datos objetivos. El repo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información incorrecta o inventada. No se han publicado evaluaciones de fiabilidad.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide conocer sus límites en tareas de ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado sin filtros puede incurrir en responsabilidades legales según el uso.
- Model card confusa: la documentación es promocional y poco técnica, con referencias a "heretic'ing" y "cold fusion" que no están respaldadas por papers o informes técnicos.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/trinityomni/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio GGUF de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Discusiones en HuggingFace del modelo (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU/discussions
