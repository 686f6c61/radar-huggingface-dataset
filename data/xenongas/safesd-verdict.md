# XenonGas/SafeSD-verdict

## Resumen

SafeSD-verdict es un artefacto derivado de Qwen3-0.6B publicado por el usuario XenonGas en Hugging Face. No se trata de un modelo de lenguaje completo, sino de una sonda (probe) de clasificación o veredicto entrenada sobre el backbone Qwen3-0.6B. Según la model card, el artefacto parte de un checkpoint del "segundo round, paso 1280" y se ha ajustado finamente durante 200 pasos con un lote pequeño de datos específicos. El repositorio contiene dos ficheros: `probe.pt` con los pesos exportados de la sonda y `probe.meta.json` con metadatos asociados, incluido el SHA-256 de los pesos y la descripción del criterio de decisión.

El modelo base sobre el que se construye es Qwen/Qwen3-0.6B, en el commit `c1899de289a04d12100db370d81485cdf75e47ca`, y la sonda aplica un umbral de decisión de 0,5. La relevancia de este artefacto es limitada y muy específica: sirve como pieza auxiliar para un pipeline de moderación o verificación (probablemente relacionado con "safe SD", es decir, generación de imágenes segura), no como modelo generativo autónomo. No hay información pública sobre el pipeline, la licencia, los idiomas o el rendimiento, y el repositorio no registra descargas ni interacciones.

Dado que la información disponible es mínima y proviene únicamente de la model card, esta ficha documenta lo que se puede afirmar con rigor y marca explícitamente como "no disponible" todo aquello que no consta. Cualquier evaluación de calidad, sesgos o idoneidad para producción requeriría acceso al código de entrenamiento, al dataset y a la definición exacta de la tarea de veredicto, que no se han publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sonda de clasificación/veredicto sobre backbone transformer Qwen3-0.6B (arquitectura del backbone: no disponible en detalle) |
| Parámetros totales | Backbone Qwen3-0.6B (~0,6 mil millones); tamaño de la sonda: no disponible |
| Parámetros activos | no disponible (no es un MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada del backbone Qwen3-0.6B, sin confirmar) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `probe.pt` (PyTorch) y `probe.meta.json` (metadatos con SHA-256) |

## Arquitectura y entrenamiento

El artefacto es una sonda entrenada sobre el backbone Qwen3-0.6B, identificado por el commit `c1899de289a04d12100db370d81485cdf75e47ca`. Según la model card, el punto de partida es un checkpoint correspondiente al "segundo round, paso 1280", sobre el que se realiza un ajuste fino de 200 pasos con un lote pequeño de datos dirigidos ("小批量针对性数据"). No se especifica si el entrenamiento congela el backbone, si se añade una cabeza de clasificación, ni qué función de pérdida se emplea. El umbral de decisión declarado es 0,5, lo que sugiere una salida binaria o probabilística calibrada alrededor de ese punto de corte.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio incluye `probe.meta.json`, que contiene el SHA-256 de los pesos y una descripción del criterio de veredicto, pero el contenido de ese fichero no se ha publicado en la información disponible. El tamaño del repositorio es de 1,2 GB, coherente con los pesos de un backbone de ~0,6 mil millones de parámetros en precisión FP16/BF16 más los artefactos de la sonda.

## Capacidades

- Clasificación o veredicto binario/probabilístico con umbral 0,5 sobre entradas procesadas por el backbone Qwen3-0.6B.
- Hereda del backbone Qwen3-0.6B la capacidad de procesar texto multilingüe, aunque no se confirma qué idiomas cubre la sonda ni si el ajuste fino preserva esa cobertura.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad de agente, thinking mode, visión ni audio.
- No se documenta generación de texto autónoma: el artefacto es una sonda, no un modelo instructivo.
- Uso previsto aparente: componente auxiliar de verificación en un pipeline "SafeSD" (moderación o filtrado de seguridad para generación de imágenes), sin confirmación oficial.

## Casos de uso

- Filtrado de seguridad en pipelines de generación de imágenes: la sonda podría puntuar prompts o salidas y aplicar el umbral 0,5 para bloquear contenido no deseado; encaja por su naturaleza de veredicto binario y su bajo coste computacional al apoyarse en un backbone de 0,6B.
- Moderación de contenido en aplicaciones de chat: integrada como etapa previa o posterior a un LLM mayor, la sonda permitiría clasificar mensajes con un coste de inferencia reducido, aunque requiere validación propia porque no hay benchmarks publicados.
- Verificación de cumplimiento en entornos con requisitos estrictos: el umbral configurable en 0,5 y los metadatos con SHA-256 permiten auditar la integridad de los pesos en despliegues regulados.
- Investigación sobre sondas de seguridad: útil como punto de partida reproducible (commit del backbone fijado) para estudiar cómo se comportan clasificadores ligeros sobre Qwen3-0.6B en tareas de veredicto.
- Componente en sistemas de enrutamiento: la salida probabilística podría decidir si una petición pasa a un modelo mayor o se rechaza, reduciendo coste en producción.
- Evaluación comparativa de técnicas de ajuste fino: los 200 pasos sobre un checkpoint intermedio (paso 1280 del segundo round) sirven como caso de estudio de ajuste fino dirigido con lotes pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone Qwen3-0.6B en FP16 ocupa aproximadamente 1,2 GB de pesos; en cuantización de 8 bits, alrededor de 0,6 GB; en 4 bits, alrededor de 0,3 GB. La sonda añade un consumo marginal no cuantificado. Estas cifras son estimaciones a partir del tamaño del backbone, no datos publicados para este artefacto.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el backbone en FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues en servidor, A100 o H100 no son necesarias por tamaño, pero podrían usarse para lotes grandes.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs con 4 GB o más de VRAM, dado el tamaño del backbone.
- Opciones de despliegue: al ser un artefacto `probe.pt`, requiere cargarlo con PyTorch y combinarlo con el backbone Qwen3-0.6B; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos completos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de la misma categoría (sondas de veredicto sobre Qwen3-0.6B) ni se dispone de datos de rendimiento para establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Información pública mínima: la model card no describe la tarea exacta, el dataset ni el criterio de veredicto, lo que impide evaluar su fiabilidad.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el backbone Qwen3-0.6B tiene su propia licencia que debe verificarse por separado.
- Riesgo de alucinación y falsos positivos/negativos: al ser una sonda con umbral fijo de 0,5, no se documenta calibración ni métricas de precisión/recall.
- Sesgos desconocidos: no se ha publicado información sobre la composición del dataset de ajuste fino, por lo que no se pueden evaluar sesgos de género, idioma o dominio.
- Cobertura lingüística incierta: aunque el backbone Qwen3 es multilingüe, el ajuste fino con "datos dirigidos" podría haber reducido la cobertura a un subconjunto no especificado.
- Sin garantías de producción: no hay benchmarks, ni documentación de latencia, ni pruebas de robustez; su uso en producción requeriría una validación independiente exhaustiva.
- Dependencia de un commit concreto del backbone: el artefacto está ligado a `c1899de289a04d12100db370d81485cdf75e47ca`; cambios en el backbone pueden romper la compatibilidad de la sonda.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/XenonGas/SafeSD-verdict
- Backbone Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Commit del backbone: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
