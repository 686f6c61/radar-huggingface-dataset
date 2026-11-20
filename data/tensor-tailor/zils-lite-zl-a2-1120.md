# tensor-tailor/zils-lite-zl-a2-1120

## Resumen

zl-a2 (identificador completo `tensor-tailor/zils-lite-zl-a2-1120`) es un modelo de decisión de la familia "d3-lite" publicado por el usuario tensor-tailor en Hugging Face. Se trata de un fine-tune mediante fusión de LoRA (merged LoRA) sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a tareas de decisión dentro del "Zils subnet 127 lite pool", una infraestructura de subred que el autor menciona pero no detalla en la model card.

El modelo cuenta con 852.985.920 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños (sub-1B), adecuados para despliegue en hardware modesto y para tareas de baja latencia. El repositorio ocupa 1,7 GB y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales más allá de las del modelo base.

La relevancia de este modelo es limitada y muy específica: se publica como un artefacto interno de un pool de decisión, sin model card detallada, sin benchmarks y sin documentación sobre datos de entrenamiento. Para desarrolladores e investigadores, su interés principal radica en ser un ejemplo de fine-tune ligero sobre Qwen3.5-0.8B y en su compatibilidad declarada con endpoints, pero no constituye una alternativa generalista a modelos de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base Qwen/Qwen3.5-0.8B, según declara el autor en la model card. El método de entrenamiento indicado es una fusión de LoRA (merged LoRA) sobre el "current d3-lite soup", es decir, una combinación de adaptadores previamente entrenados dentro de la familia d3-lite. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares.

La arquitectura subyacente corresponde a la del modelo base Qwen3.5-0.8B, de la que no se proporcionan detalles en la información disponible (número de capas, dimensión oculta, mecanismo de atención, etc.). Tampoco se documentan innovaciones técnicas propias del fine-tune, más allá de la propia fusión de LoRA. El autor etiqueta el modelo como `decision-model`, lo que sugiere un entrenamiento orientado a tareas de clasificación o selección dentro del pool Zils, pero no se aporta ninguna descripción funcional de dichas tareas.

## Capacidades

- Generación de texto: heredada del modelo base Qwen3.5-0.8B, aunque no se documenta su calidad ni sus dominios de especialización.
- Modelo de decisión: la etiqueta `decision-model` indica que está orientado a tareas de decisión dentro del pool Zils, sin más especificación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas no está informado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en la infraestructura de endpoints de Hugging Face.

## Casos de uso

- Clasificación o enrutamiento dentro de un pool de decisión: el modelo está diseñado explícitamente como "decision body" para el Zils subnet 127 lite pool, por lo que su uso previsto es tomar decisiones o puntuar opciones dentro de esa infraestructura.
- Prototipado de fine-tunes ligeros: al ser un merged LoRA sobre Qwen3.5-0.8B, sirve como referencia para experimentar con adaptadores de bajo rango en modelos sub-1B.
- Despliegue en entornos con recursos limitados: con 853M de parámetros y pesos safetensors de 1,7 GB, puede ejecutarse en GPU de consumo con cuantización (aunque no se documenten los formatos soportados), lo que lo hace apto para pruebas locales.
- Evaluación comparativa de fine-tunes sobre Qwen3.5-0.8B: útil para investigadores que quieran medir el efecto de la fusión de LoRA frente al modelo base en tareas concretas.
- Integración en pipelines con endpoints compatibles: la etiqueta `endpoints_compatible` permite desplegarlo en servicios gestionados de inferencia de Hugging Face para pruebas de integración.
- Generación de texto auxiliar en aplicaciones de baja exigencia: si el fine-tune conserva las capacidades del base, podría emplearse para tareas de texto simples, aunque sin garantías documentadas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853M de parámetros en precisión completa (fp32) se requieren aproximadamente 3,4 GB; en fp16, unos 1,7 GB; en cuantizaciones de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPU de consumo como RTX 3060, RTX 4060 o superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM libre, aunque no se confirma oficialmente.
- Opciones de despliegue: la librería indicada es `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. La etiqueta `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-zl-a2-1120 | 852.985.920 | no disponible | apache-2.0 | Hugging Face | Fine-tune de decisión sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | apache-2.0 (según model card) | Hugging Face | Modelo base del que deriva |
| Otros fine-tunes de Qwen3.5-0.8B | no disponible | no disponible | variable | Hugging Face | No se dispone de datos comparativos |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no describe datos de entrenamiento, tareas concretas, idiomas ni evaluación, lo que dificulta validar su comportamiento en producción.
- Riesgo de alucinación: inherente a los modelos generativos del tamaño del base (0,8B), sin que se haya documentado mitigación alguna.
- Sesgos conocidos: no documentados; al heredar del base Qwen3.5-0.8B, podría arrastrar sesgos de sus datos de entrenamiento, pero no se aporta información.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y los idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe respetar también la licencia del modelo base Qwen3.5-0.8B, que el autor declara como Apache-2.0.
- Uso previsto muy específico: el modelo está diseñado para el pool Zils subnet 127; su uso fuera de ese contexto no está validado.
- Sin métricas de calidad: no hay benchmarks ni evaluaciones publicadas, por lo que no se recomienda su adopción en producción sin una evaluación propia.
- Fecha de creación futura (2026-11-19) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-zl-a2-1120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
