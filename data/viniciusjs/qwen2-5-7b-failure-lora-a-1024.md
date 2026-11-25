# ViniciusJS/qwen2.5-7b-failure-lora-a-1024

## Resumen

El modelo `ViniciusJS/qwen2.5-7b-failure-lora-a-1024` es un adaptador LoRA de investigación, no un modelo completo, entrenado sobre `Qwen/Qwen2.5-7B-Instruct` mediante QLoRA en cuantización NF4 de 4 bits. Lo publica el usuario ViniciusJS como parte del proyecto Pesquisa_IC_IA y está orientado a tareas de pregunta-respuesta de opción múltiple sobre fallos en sensores industriales (FailureSensorIQ) y, de forma secundaria, a razonamiento numérico financiero (FinQA). El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador (80.792.096 bytes, SHA-256 `19629c837269113c383a043079cbd9410fa6117d951020c9529c05eeb112f9a1`), por lo que requiere descargar por separado el modelo base Qwen2.5-7B-Instruct.

La relevancia de esta publicación es acotada y de carácter reproducible: el autor documenta explícitamente las limitaciones de sus métricas históricas (no reproducidas de forma independiente, con cambios de configuración entre baterías que confunden las comparaciones) y advierte de que no se han realizado nuevas pruebas de generación ni se ha demostrado fiabilidad para despliegue industrial. Se trata, por tanto, de un artefacto de investigación para estudiar el ajuste fino parametrizado eficiente en dominios técnicos verticales, no de un modelo listo para producción.

La ficha describe un adaptador de rango 8 sobre un transformer decoder-only de 7 mil millones de parámetros, con un límite de entrada de entrenamiento de 1024 tokens (que no debe confundirse con la ventana nativa del modelo base) y un formato de prompt de estilo completion sin plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA NF4 4-bit) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | Modelo base: 7,6 mil millones (aproximado, familia Qwen2.5-7B); adaptador: 80.792.096 bytes de pesos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada en entrenamiento (límite de la batería A); la ventana nativa del modelo base no se documenta en esta ficha |
| Tipos de cuantizacion | Entrenamiento en NF4 4-bit con doble cuantización y cómputo FP16; el adaptador puede cargarse en precisión completa o en 4 bits según `usage.py` |
| Idiomas soportados | en, pt (instrucciones y QA principalmente en inglés con envoltorios en portugués; competencia bilingüe no evaluada) |
| Licencia | Apache-2.0 (adaptador y material de publicación); modelo base Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: cuantización NF4 de 4 bits con doble cuantización y cómputo en FP16, rango LoRA 8, alpha 16, dropout 0,1 y proyecciones objetivo q/k/v/o y gate/up/down. La configuración registrada incluye semilla 42, tres épocas, tasa de aprendizaje 0,0002, microbatch 4, acumulación de gradiente 8 y 624 pasos registrados; la selección de checkpoint se hizo por pérdida de validación. Los datos proceden de FinQA y FailureSensorIQ convertidos a ejemplos de instrucción estilo completion, con particiones locales de 6636/829/831 (entrenamiento/validación/prueba). Los identificadores de dataset, hashes de partición y la ejecución fuente exacta se registran en `provenance.json`.

Una innovación destacable es la transparencia metodológica: el autor documenta que el entrenamiento usó `prompt + ' ' + resposta` sin aplicar plantilla de chat, sin añadir EOS explícito y sin restringir la pérdida a los tokens de respuesta. También advierte de que la revisión exacta del modelo base usada en el entrenamiento histórico no se registró y de que las comparaciones entre baterías A/B están confundidas por cambios en el tamaño de batch y, en el caso de Failure/híbrido, en las tasas de aprendizaje.

## Capacidades

- Generación de texto y respuesta a preguntas de opción múltiple en el dominio de fallos de sensores industriales (FailureSensorIQ).
- Razonamiento numérico básico sobre informes financieros (FinQA), con métrica de coincidencia numérica y tolerancia configurada de 0,001.
- Clasificación multilabel de conjuntos de etiquetas de fallo (exactitud de conjunto de etiquetas y F1 macro por etiqueta).
- Soporte de tool calling / function calling: no disponible; el autor indica que la evaluación con arnés de agentes quedó como `not_scored`.
- Soporte de agentes y razonamiento multi-paso: no demostrado; los benchmarks históricos no validan uso de herramientas ni JSON fiable.
- Capacidades multilingües: inglés y portugués declarados, pero sin evaluación de competencia bilingüe.
- Capacidades especiales: no dispone de modo thinking, visión ni audio; es un adaptador de texto sobre un modelo base de texto.

## Casos de uso

- Investigación reproducible en ajuste fino eficiente: el adaptador sirve para replicar el pipeline QLoRA documentado (rango 8, NF4, 624 pasos) y comparar configuraciones de entrenamiento en dominios verticales, gracias a la trazabilidad de `provenance.json` y `training_config.json`.
- Clasificación de fallos en mantenimiento predictivo: el adaptador puede asignar conjuntos de etiquetas de fallo a partir de descripciones de sensores, con la advertencia de que la exactitud reportada (0,9663) es un resultado local histórico no reproducido de forma independiente y debe validarse contra evidencia antes de cualquier decisión industrial.
- Extracción de métricas financieras en documentos: para tareas de QA numérica sobre informes, el adaptador se usaría con prompts de completion y decodificación greedy, aunque la exactitud numérica reportada en FinQA (0,0829 sobre 617 muestras) es baja y limita su uso a experimentación.
- Estudio de formatos de prompt sin plantilla de chat: útil para investigar cómo afecta el entrenamiento sin plantilla de chat ni EOS explícito al comportamiento del modelo en tareas de completion, un caso poco habitual en adaptadores publicados.
- Evaluación de sesgos de evaluación en benchmarks verticales: el repositorio documenta la diferencia entre métricas de primera etiqueta y métricas multilabel v2 (recomputación del 14 de septiembre de 2026), lo que lo convierte en material para estudiar cómo cambian los resultados según la métrica elegida.
- Docencia y formación en PEFT: como ejemplo didáctico de publicación de un adaptador con auditoría de licencias (`LICENSE_AUDIT.md`), checksums y advertencias explícitas sobre límites de las métricas.

## Benchmarks y rendimiento

| Evaluación | Resultado reportado | Muestras |
|---|---:|---:|
| FinQA, exactitud numérica (agregado original) | 0,0829 | 617 |
| FailureSensorIQ, exactitud exacta de conjunto de etiquetas (recomputación multilabel v2) | 0,9663 | 831 |
| FailureSensorIQ, F1 macro por etiqueta (recomputación multilabel v2) | 0,9892 | 831 |

Estos son resultados locales históricos, no reproducidos de forma independiente para esta publicación. La generación histórica se limitó a 24 tokens nuevos, 1024 tokens de entrada y decodificación greedy. El autor advierte de que las comparaciones entre baterías A/B están confundidas por cambios en el tamaño de batch y en las tasas de aprendizaje, y de que el límite de entrada mayor no establece superioridad global. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, el modelo base Qwen2.5-7B-Instruct en FP16 requiere aproximadamente 15-16 GB de VRAM, y en 4 bits (NF4) alrededor de 5-6 GB, más el adaptador (unos 0,08 GB).
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo base, son adecuadas A100, H100, L40S o RTX 4090 para FP16, y RTX 3090/4090 o GPUs con 8-12 GB para carga en 4 bits.
- Cabe en GPU de consumo: sí, en configuraciones de 4 bits con GPUs de 8 GB o más, según el modelo base; el adaptador en sí es ligero.
- Opciones de despliegue: el repositorio proporciona `usage.py` con soporte de carga en precisión completa/CPU y en 4 bits mediante bitsandbytes, con dependencias `torch`, `transformers>=4.57.6`, `peft>=0.19.1`, `accelerate`, `safetensors` y `bitsandbytes`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ViniciusJS/qwen2.5-7b-failure-lora-a-1024` (este adaptador) | Base 7B + adaptador LoRA r8 | 1024 tokens de entrada en entrenamiento | FinQA 0,0829; FailureSensorIQ 0,9663 exactitud / 0,9892 F1 macro (resultados locales históricos) | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `Qwen/Qwen2.5-7B-Instruct` (base) | 7,6B | 32.768 tokens (ventana nativa de la familia Qwen2.5-7B) | Benchmarks generales publicados por Qwen; no comparable directamente con las métricas verticales de este adaptador | Apache-2.0 | Hugging Face, ampliamente utilizado |
| Adaptadores LoRA verticales para QA industrial | Variable | Variable | No disponible | Variable | No disponible |

La comparación directa con el modelo base no es posible en las métricas verticales porque el adaptador se evalúa en particiones locales de FinQA y FailureSensorIQ, no en los conjuntos de evaluación oficiales. No se dispone de información sobre otros adaptadores comparables en el mismo dominio.

## Limitaciones y advertencias

- Los resultados de benchmarks son históricos y locales; no han sido reproducidos de forma independiente para esta publicación.
- La exactitud numérica en FinQA es muy baja (0,0829), lo que desaconseja su uso para análisis financiero abierto o respuestas largas.
- El adaptador no valida uso de herramientas, JSON fiable ni razonamiento multi-paso; la evaluación con arnés de agentes quedó como `not_scored`.
- El entrenamiento usó un formato de completion sin plantilla de chat ni EOS explícito, lo que puede degradar el comportamiento en conversaciones multi-turno.
- El límite de 1024 tokens corresponde al entrenamiento, no a la arquitectura del modelo base; no debe interpretarse como una ventana de contexto nativa de 1024 tokens.
- La revisión exacta del modelo base usada en el entrenamiento histórico no se registró, lo que dificulta la reproducción exacta.
- Las comparaciones entre baterías A/B están confundidas por cambios en el tamaño de batch y en las tasas de aprendizaje.
- Riesgo de alucinación inherente al modelo base; el autor recomienda verificar las salidas contra evidencia antes de cualquier decisión financiera o industrial.
- Sesgos conocidos: no documentados específicamente en la información disponible.
- Restricciones de licencia: el adaptador y el material nuevo son Apache-2.0, pero la fuente industrial FailureSensorIQ archivada por IBM lleva CC-BY-4.0 (aunque su tarjeta actual en el Hub indica Apache-2.0), por lo que se debe preservar la atribución CC-BY; los datasets no se redistribuyen ni se relicencian.
- No se ha demostrado fiabilidad para despliegue industrial; el repositorio es material de investigación y reproducibilidad.
- El repositorio no incluye predicciones crudas, respuestas gold ni filas de dataset, lo que limita la auditoría independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ViniciusJS/qwen2.5-7b-failure-lora-a-1024
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto Pesquisa_IC_IA: https://github.com/viniciusjsdev/Pesquisa_IC_IA
- Dataset FinQA (GitHub): https://github.com/czyssrs/FinQA
- Paper FinQA (EMNLP 2021): https://aclanthology.org/2021.emnlp-main.300/
- Dataset FailureSensorIQ (GitHub, IBM Research): https://github.com/IBM/FailureSensorIQ
- Paper FailureSensorIQ (arXiv:2506.03278): https://arxiv.org/abs/2506.03278
- Informe técnico Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
