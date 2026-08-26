# Tohirju/sl-scarp

## Resumen

El modelo `Tohirju/sl-scarp` es un modelo de lenguaje de gran tamaño (LLM) publicado en Hugging Face por el usuario Tohirju (Tohir Saidzoda). Se distribuye en formato GGUF, lo que indica que está orientado a inferencia eficiente en CPU y GPU con herramientas como llama.cpp u Ollama. Con aproximadamente 8,95 mil millones de parámetros, se sitúa en la gama de modelos medianos, similar a Llama 3.1 8B o Mistral 7B.

La información pública disponible es extremadamente limitada: no se especifican la arquitectura, el contexto, los idiomas soportados ni los datos de entrenamiento. El repositorio tiene acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face para poder descargarlo. A pesar de su reciente publicación (agosto de 2026), no cuenta con descargas ni valoraciones, lo que sugiere que es un modelo experimental o de uso muy específico.

Su relevancia actual es incierta debido a la falta de documentación y benchmarks. No obstante, su formato GGUF y su tamaño moderado lo hacen potencialmente útil para despliegues locales en entornos con recursos limitados, siempre que se confirme su licencia y capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican variantes) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Dado su tamaño (8,95 B) y su formato GGUF, es probable que se trate de un transformer decoder-only, similar a otros LLM de la misma escala, pero no hay confirmación oficial. Tampoco se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor no ha proporcionado ningún paper, documentación técnica ni notas de versión en el repositorio.

## Capacidades

Según los metadatos de Hugging Face, el modelo está etiquetado como "conversational", lo que sugiere que está diseñado para tareas de diálogo y generación de texto. Sin embargo, no se han verificado capacidades concretas:

- Generación de texto conversacional (indicado por el tag "conversational").
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se ha confirmado soporte multilingüe; los idiomas no están especificados.
- No se ha confirmado la existencia de un modo de pensamiento o razonamiento explícito.

## Casos de uso

Dada la falta de información verificada, los casos de uso son hipotéticos y dependen de la confirmación de las capacidades reales del modelo:

- Despliegue local de un asistente conversacional: al estar en formato GGUF, podría integrarse en aplicaciones de chat mediante llama.cpp u Ollama en hardware modesto, siempre que se acepte la licencia.
- Experimentación académica: investigadores podrían evaluar su comportamiento en tareas de generación de texto, comparándolo con otros modelos de tamaño similar.
- Prototipado rápido: su tamaño de 8,95 B permite pruebas en GPU de consumo (por ejemplo, RTX 3060 con cuantización) sin necesidad de infraestructura de gran escala.
- Fine-tuning posterior: si se obtiene acceso a los pesos originales (no solo GGUF), podría ajustarse para tareas específicas, aunque no se ha confirmado la disponibilidad de safetensors.
- Integración en pipelines de generación de contenido: si el modelo demuestra buena calidad, podría usarse para redactar textos, resumir o responder preguntas en entornos controlados.
- Evaluación comparativa: su inclusión en benchmarks comunitarios ayudaría a determinar su utilidad real, pero actualmente no hay datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se ha comparado con modelos similares en el repositorio.

## Requisitos de hardware

Al no conocerse la arquitectura exacta ni el contexto, los requisitos son estimaciones basadas en el tamaño de parámetros y el formato GGUF:

- VRAM estimada para inferencia: con cuantización Q4_K_M, un modelo de 8,95 B suele ocupar entre 5 y 6 GB, por lo que cabría en GPUs con 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060). Con Q8, ocuparía unos 9-10 GB, requiriendo GPUs de 12 GB o más.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, A10, L4 o superiores. Para CPU, se necesitarían al menos 16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles, dependen de la cuantización y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación rigurosa. Como referencia, se listan modelos de tamaño similar (8-9 B) con los que podría competir, pero sin datos de rendimiento del modelo evaluado:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Tohirju/sl-scarp | 8,95 B | no disponible | other | GGUF |
| Llama 3.1 8B | 8,03 B | 128 K | Llama 3.1 Community License | safetensors, GGUF |
| Mistral 7B | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF |
| Gemma 2 9B | 9,24 B | 8 K | Gemma License | safetensors, GGUF |

La comparación real solo sería posible tras evaluar el modelo en benchmarks comunes, lo cual no se ha hecho público.

## Limitaciones y advertencias

- Falta total de documentación: no hay arquitectura, datos de entrenamiento, ni especificaciones de contexto o idiomas.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso y reproducción.
- Licencia "other" no especificada: no se conocen los términos exactos, lo que impide saber si permite uso comercial o modificaciones.
- Riesgo de alucinación y sesgos: al no haber información sobre el dataset, no se pueden evaluar estos riesgos.
- Sin benchmarks: no hay evidencia de calidad o fiabilidad para tareas concretas.
- Fecha de creación inusual (2026): el modelo es muy reciente y no ha sido probado por la comunidad, por lo que su comportamiento es desconocido.
- Posible confusión con SCARP (Shape Completion): el nombre "sl-scarp" podría asociarse erróneamente con el modelo de completación de formas 3D del paper arXiv 2301.07213, pero no hay relación aparente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Tohirju/sl-scarp
- Perfil del autor: https://huggingface.co/Tohirju
- Lista de modelos del autor: https://huggingface.co/Tohirju/models
- Paper SCARP (no relacionado, solo por coincidencia de nombre): https://arxiv.org/pdf/2301.07213
