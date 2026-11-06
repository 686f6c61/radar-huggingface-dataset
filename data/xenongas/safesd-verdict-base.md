# XenonGas/SafeSD-verdict-base

## Resumen

SafeSD-verdict-base es un artefacto de investigación publicado por el usuario XenonGas en Hugging Face. No se trata de un modelo generativo completo, sino de una "sonda" (probe) de clasificación entrenada sobre el modelo base Qwen/Qwen3-0.6B, concretamente sobre el commit `c1899de289a04d12100db370d81485cdf75e47ca`. La model card indica que es la segunda ronda de entrenamiento desde cero, con semilla 29, alcanzando el paso 1280, y que el fine-tuning registrado parte de este checkpoint con un optimizador nuevo.

El propósito declarado en el nombre ("verdict" y "SafeSD") sugiere un clasificador de veredictos orientado a seguridad, probablemente para discriminar entre contenido seguro y no seguro en el contexto de modelos de difusión (SD, por Stable Diffusion). Sin embargo, la información pública es extremadamente escasa: no se especifica la tarea exacta, el dataset de entrenamiento, las métricas de evaluación ni las condiciones de uso.

El repositorio ocupa 1,2 GB y contiene dos ficheros: `probe.pt` (pesos exportados de la sonda) y `probe.meta.json` (metadatos asociados). El umbral de decisión indicado es 0,5. Dado que no hay descargas ni likes y la licencia no está declarada, debe tratarse como un experimento de investigación sin garantías de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de clasificación sobre backbone Qwen3-0.6B (transformer decoder-only) |
| Parametros totales | No disponible (la sonda es un artefacto adicional; el backbone Qwen3-0.6B tiene ~0,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen3-0.6B, no declarada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `probe.pt` (PyTorch) y `probe.meta.json` (metadatos) |

## Arquitectura y entrenamiento

La model card describe una "sonda" (probe) entrenada sobre el backbone Qwen/Qwen3-0.6B. El término "verdict probe" y el prefijo "SafeSD" apuntan a un cabezal de clasificación binaria o multiclase añadido sobre las representaciones internas del transformer, con umbral de decisión 0,5. El entrenamiento se realizó "desde cero" en una segunda ronda, con semilla 29, hasta el paso 1280. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o supervisión puramente discriminativa.

El checkpoint exportado (`probe.pt`) contiene únicamente los pesos de la sonda, no el backbone completo, lo que explica que el repositorio ocupe 1,2 GB (compatible con pesos en fp32 de un cabezal de tamaño moderado o con una copia parcial de capas). No se documentan innovaciones técnicas como decodificación especulativa ni atención lineal, ya que el artefacto no es un modelo generativo autónomo.

## Capacidades

- Clasificación de veredictos binarios o multiclase con umbral 0,5, según la nomenclatura del artefacto.
- Uso previsto como filtro o discriminador auxiliar, no como generador de texto.
- Dependencia total del backbone Qwen3-0.6B: requiere cargar dicho modelo para extraer representaciones y aplicar la sonda.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües no disponibles; la model card está redactada en chino, pero no se declaran idiomas soportados.
- No se documenta modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Filtrado de contenido en pipelines de generación de imágenes: la sonda podría emplearse como clasificador de seguridad previo o posterior a la generación con modelos de difusión, aprovechando el umbral 0,5 para decidir si un prompt o una salida se considera aceptable.
- Moderación de prompts en sistemas de chat: integrada sobre Qwen3-0.6B, permitiría etiquetar entradas de usuario como seguras o no seguras antes de pasarlas a un modelo mayor.
- Investigación en interpretabilidad: al ser una sonda sobre representaciones internas, sirve para estudiar qué información codifica Qwen3-0.6B en sus capas intermedias respecto a juicios de seguridad.
- Evaluación comparativa de checkpoints: el paso 1280 y la semilla 29 permiten reproducir y comparar rondas de entrenamiento en experimentos controlados.
- Prototipado de clasificadores ligeros: el tamaño del artefacto (1,2 GB) y el backbone de 0,6B permiten desplegarlo en entornos con recursos limitados para pruebas de concepto.
- Base para fine-tuning posterior: la model card indica que el fine-tuning registrado parte de este checkpoint con un optimizador nuevo, por lo que puede usarse como inicialización en experimentos de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el backbone Qwen3-0.6B en fp16 requiere aproximadamente 1,2-1,5 GB, y en cuantización de 4 bits alrededor de 0,5 GB, a lo que se suma el tamaño de la sonda.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, GTX 1660) debería bastar para el backbone en fp16; para cuantización 4 bits, GPUs con 2-4 GB.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs modernas, aunque no hay confirmación oficial.
- Opciones de despliegue: PyTorch nativo para cargar `probe.pt`; el backbone puede servirse con vLLM, llama.cpp u Ollama, aunque la sonda requeriría integración personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (sondas de veredicto sobre Qwen3-0.6B) ni métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información pública mínima: no se declara licencia, idiomas, dataset ni métricas, lo que impide evaluar su idoneidad para producción.
- Riesgo de sesgos desconocido: al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o contenido.
- Riesgo de alucinación en la clasificación: una sonda con umbral 0,5 puede producir falsos positivos y falsos negativos sin calibración documentada.
- Dependencia estricta del commit `c1899de289a04d12100db370d81485cdf75e47ca` de Qwen3-0.6B; cambios en el backbone invalidarían la sonda.
- Sin garantías de uso comercial: la ausencia de licencia explícita impide asumir permisos de redistribución o uso comercial.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.
- La model card está en chino y no incluye instrucciones de uso, formato de entrada/salida ni ejemplos de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/XenonGas/SafeSD-verdict-base
- Backbone Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Commit del backbone: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
