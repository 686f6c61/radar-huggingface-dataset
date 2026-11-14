# SZLHOLDINGS/ouroboros-r2-v2-trained

## Resumen

ouroboros-r2-v2-trained es un adaptador LoRA (QLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo completo, sino de un ajuste fino de 200 pasos con rango r=16 y alpha=32, entrenado sobre el dataset propietario SZLHOLDINGS/estate-curriculum en una única GPU NVIDIA RTX A6000 de 48 GB. Su propósito declarado no es la generación de texto general, sino la investigación en medición de honestidad y comportamiento de abstención en modelos de lenguaje.

El modelo se presenta como parte del "estate" de SZL Holdings, un marco que registra cada ejecución de entrenamiento y evaluación en un ledger encadenado por hash público. Su métrica principal es una "honesty-battery" de seis pruebas fijas, en la que obtiene una puntuación de 3 sobre 6, por debajo del umbral de 4/6 que el autor denomina "the agent bar". El autor describe el mecanismo como "frágil" y dependiente de la combinación exacta de modelo base, tamaño y dosis de entrenamiento.

Es relevante ahora únicamente como artefacto de investigación reproducible: el repositorio no contiene pesos independientes (tamaño de 0.0 GB), sino un adaptador PEFT que requiere descargar Qwen3-1.7B por separado. No hay información sobre idiomas soportados, arquitectura interna ni datos de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3-1.7B (arquitectura del base no detallada) |
| Parametros totales | No disponible (adaptador LoRA; el base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3-1.7B, no declarada) |
| Tipos de cuantizacion | No disponible (entrenamiento QLoRA; no se especifican formatos de inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no pesos completos) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (r=16, alpha=32) aplicado mediante QLoRA sobre Qwen/Qwen3-1.7B. El entrenamiento consistió en 200 pasos sobre el dataset SZLHOLDINGS/estate-curriculum, ejecutado en una NVIDIA RTX A6000 (48 GB) con driver 595.99.02. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor no documenta innovaciones arquitectónicas propias: el adaptador modifica los pesos del base sin alterar su arquitectura.

La contribución declarada es metodológica más que arquitectónica: el autor sostiene la "Confabulation Conjecture", según la cual el "suelo de confabulación" solo se desplaza mediante entrenamiento en honestidad con encuadre temporal a escalas pequeñas. El experimento presentado es un contraste de siete currículos (base, abstención, código, doctrina, medición, razonamiento y cuantización temporal), donde solo el currículo de cuantización temporal supera el umbral de 4/6, mientras que este adaptador se sitúa en 3/6. El propio autor califica el resultado de punto de datos único y mecanismo frágil.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen3-1.7B.
- Comportamiento de abstención entrenado: el adaptador está orientado a que el modelo decline responder cuando no dispone de información fiable.
- Medición de honestidad mediante una batería de seis pruebas fijas (honesty-battery), con resultado declarado de 3/6.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en medición de honestidad: el adaptador sirve como punto de comparación en experimentos que evalúen la tasa de abstención y la calibración de respuestas de modelos pequeños, usando la batería de seis pruebas del autor como referencia reproducible.
- Estudio de currículos de entrenamiento: permite replicar el contraste de siete currículos descrito en la model card para analizar si el encuadre temporal del entrenamiento afecta al comportamiento de abstención.
- Evaluación de adaptadores LoRA sobre Qwen3-1.7B: útil para comparar el efecto de 200 pasos de QLoRA frente al modelo base en tareas de veracidad declarada.
- Auditoría de reproducibilidad: el ledger encadenado por hash (frontier-54-runs) permite verificar las ejecuciones asociadas y contrastar resultados declarados con recibos públicos.
- Docencia y divulgación sobre límites de la evaluación: la puntuación 3/6 y la advertencia explícita del autor sobre la fragilidad del mecanismo lo convierten en un ejemplo didáctico de resultados negativos o parciales en investigación de alineamiento.
- Prototipado interno de sistemas de abstención: en entornos controlados y con verificación por compuerta, puede usarse para probar flujos donde el modelo deba declinar responder ante preguntas fuera de su conocimiento.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Verificado |
|---|---|---|---|
| text-generation | honesty-battery | 3/6 | No (declarado por el autor) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que la evaluación se basa en 6 pruebas fijas y no es exhaustiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al ser un adaptador sobre Qwen3-1.7B en bfloat16, el modelo base requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU de entrenamiento declarada: NVIDIA RTX A6000 (48 GB).
- GPU recomendadas: no disponibles; por tamaño del base, cabría en GPUs consumer con 8 GB o más de VRAM en precisión reducida, aunque no se documenta.
- Despliegue: la model card solo documenta carga vía transformers con PEFT (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la conversión a GGUF de un adaptador LoRA requeriría fusión previa con el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Formato |
|---|---|---|---|---|---|
| ouroboros-r2-v2-trained | Adaptador LoRA sobre 1.7B | No disponible | honesty-battery 3/6 | Apache 2.0 | safetensors (PEFT) |
| Qwen/Qwen3-1.7B (base) | 1.7B | No disponible en esta ficha | No disponible | Apache 2.0 | safetensors |
| Alternativas de investigación en honestidad de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría (investigación en honestidad y abstención) en la documentación proporcionada.

## Limitaciones y advertencias

- La evaluación se limita a 6 pruebas fijas y el propio autor la califica de no exhaustiva.
- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen/Qwen3-1.7B por separado.
- El autor describe el mecanismo como frágil y el resultado como un único punto de datos en el contraste de currículos.
- Uso fuera de alcance declarado: despliegue en producción sin verificación por compuerta, aplicaciones críticas de seguridad y validación biológica (ninguna reclamada).
- Riesgo de alucinación: no cuantificado; la batería de honestidad mide abstención, no veracidad factual general.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el despliegue en producción sin verificación adicional.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar materializados o son de tamaño despreciable; conviene verificar la integridad antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/ouroboros-r2-v2-trained
- Dataset de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio del autor: https://a-11-oy.com
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
