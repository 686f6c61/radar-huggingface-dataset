# white1hat2hacker3/Ree4.5

## Resumen

Ree4.5 es un modelo de clasificación de tokens desarrollado por white1hat2hacker3, que parte del modelo base Qwen3.8-27B-Uncensored-GGUF y ha sido ajustado con la librería SetFit sobre el dataset de destilación r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation. Su pipeline es token-classification, por lo que está orientado a tareas de etiquetado de secuencias, aunque el modelo base es un LLM de 27B en formato GGUF. La licencia es Apache 2.0 y el idioma declarado es inglés.

El repositorio de GitHub asociado lo describe como un modelo ligero de 4B, lo que contradice el tamaño del modelo base (27B). Esta discrepancia no está resuelta en la información disponible. El modelo no tiene descargas ni likes en HuggingFace y no se han publicado resultados de benchmarks, por lo que su relevancia actual es limitada y debe considerarse experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, no confirmado) |
| Parametros totales | 4B según el repositorio de GitHub; el modelo base es de 27B, dato no confirmado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (modelo base); cuantización específica no especificada |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base); formato del fine-tune no especificado |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo Qwen3.8-27B-Uncensored-GGUF mediante la librería SetFit de HuggingFace, especializada en ajuste de modelos con pocos ejemplos. El dataset de entrenamiento es r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation, un conjunto de datos de destilación que combina salidas de modelos como Qwen3.8, GLM5.2 y Kimi K3. Las métricas de evaluación declaradas son qlemesle/parapluie y Markdown/rouge, aunque no se han publicado resultados. No se dispone de información sobre el número de tokens, composición exacta del dataset ni procesos de alineación como RLHF o DPO.

## Capacidades

- Clasificación de tokens (token-classification) para etiquetado de secuencias.
- Reconocimiento de entidades nombradas (NER) potencial, al ser un modelo de etiquetado de tokens.
- Herencia de capacidades de generación de texto del modelo base de 27B, no confirmada.
- Soporte de tool calling, agentes, visión o audio: no disponible.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Reconocimiento de entidades nombradas (NER): el modelo puede etiquetar entidades en textos en inglés, gracias a su pipeline de token-classification.
- Etiquetado de secuencias para análisis de documentos: útil para extraer campos concretos de textos no estructurados.
- Preprocesamiento de datos para pipelines de NLP: puede integrarse en flujos de limpieza o anotación automática.
- Investigación en destilación de modelos: el dataset de destilación sugiere que el modelo podría usarse para estudiar la transferencia de conocimiento entre LLMs.
- Prototipado rápido con SetFit: gracias a la librería SetFit, el modelo puede ajustarse con pocos ejemplos, lo que facilita experimentos de etiquetado en dominios específicos.
- Clasificación de tokens en logs o código: podría identificar patrones en logs de sistemas, aunque no hay evidencia de entrenamiento específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El modelo base Qwen3.8-27B-Uncensored-GGUF es un LLM de 27B en formato GGUF, lo que sugiere que podría ejecutarse con cuantización en GPUs con al menos 16 GB de VRAM, pero no hay datos confirmados para este fine-tune.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, no confirmado para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa fiable. El modelo base Qwen3.8-27B podría compararse con otros modelos de 27B como Qwen2.5-27B o Llama-3.1-8B, pero no hay datos concretos de rendimiento ni de licencia para este fine-tune.

## Limitaciones y advertencias

- El modelo solo soporta inglés, según la información declarada.
- No se han publicado evaluaciones de sesgos ni de alucinación.
- El modelo base "Uncensored" sugiere que no fue sometido a alineación de seguridad, lo que podría implicar respuestas sin filtros.
- La discrepancia entre el tamaño declarado en el repositorio (4B) y el modelo base (27B) genera incertidumbre sobre la arquitectura real.
- No hay evidencia de uso en producción ni de soporte técnico.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental del modelo debe tenerse en cuenta.

## Enlaces

- HuggingFace: https://huggingface.co/white1hat2hacker3/Ree4.5
- Repositorio de GitHub asociado: https://github.com/aaayafuj51-AYFJ/Ree4.5-aaayafuj
