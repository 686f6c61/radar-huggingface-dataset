# yachiyo8080/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Este repositorio, publicado por el usuario yachiyo8080, ofrece cuantizaciones GGUF no uniformes de **Qwen3.8-Flash-Next**, un modelo multimodal (texto e imagen) de arquitectura MoE desarrollado por Qwen. El modelo base es un MoE disperso con 512 expertos enrutados por capa a lo largo de 48 capas, de los cuales 10 están activos por token, y cuenta con un total de aproximadamente 176.9 mil millones de parámetros (dato real de safetensors).

La particularidad de esta release es el método de cuantización: en lugar de aplicar un único tipo de cuantización a todos los tensores, se asigna un tipo distinto a cada tensor mediante una búsqueda basada en gradientes que distribuye la precisión según la sensibilidad de cada tensor, sujeta a un presupuesto total de tamaño. Los métodos empleados son **GSQ** (Gumbel-Softmax Quantization) y **RCO** (Riemannian Constrained Optimization), ambos desarrollados en el DASLab del Institute of Science and Technology Austria.

Es relevante porque demuestra que la cuantización agresiva (2-3 bits) con formatos escalares estándar de GGUF puede aproximarse a la calidad de la cuantización vectorial, manteniendo compatibilidad total con `llama.cpp`, Ollama y LM Studio. Incluye además el proyector de visión (`mmproj`) en BF16 para uso multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso multimodal (image-text-to-text), 512 expertos enrutados por capa, 48 capas, 10 expertos activos por token |
| Parametros totales | 176.943.899.520 (~176.9B) |
| Parametros activos | no disponible (10 de 512 expertos activos por token, pero el recuento exacto de parámetros activos no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0 (2.40 bpw), IQ2_XS (2.50 bpw), IQ3_XXS (3.00 bpw), IQ3_S (3.50 bpw); mmproj en BF16; tabla de n-gramas por capa (51.2B parámetros) fijada a IQ4_NL (4.5 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (endpoints compatible), con archivo mmproj aparte |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo de mezcla de expertos (MoE) disperso con 512 expertos enrutados por capa en 48 capas, activando 10 expertos por token. Las matrices de los expertos dominan el recuento de parámetros: el 95% de los pesos susceptibles de búsqueda viven en los expertos, por lo que la asignación de tipos de cuantización se realiza por capa (no por experto, algo que el formato GGUF no puede expresar). Un detalle notable es la tabla de embeddings de n-gramas por capa (`per_layer_token_embd`, 51.2B de parámetros), que es una tabla de consulta y no un peso de multiplicación de matrices; se mantiene fija a 4.5 bpw en IQ4_NL y se excluye de la búsqueda de cuantización. Se distribuye como segundo shard idéntico en las cuatro variantes (28.8 GB).

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay información disponible en la model card. En cuanto a la cuantización, GSQ realiza cuantización escalar post-training que aprende conjuntamente las asignaciones de grid por coordenada y las escalas por grupo mediante una relajación Gumbel-Softmax, cerrando buena parte de la brecha entre cuantización escalar y vectorial en el rango de 2 a 3 bits. RCO asigna uno de K tipos de cuantización a cada uno de N tensores bajo un presupuesto de tamaño, reformulando la restricción como una variedad de Riemann suave en espacio de logits, lo que permite optimizar por gradiente directamente sobre la pérdida de tarea respetando el presupuesto exactamente.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repositorio).
- Comprensión multimodal: pipeline de tipo image-text-to-text, con codificador de visión y proyector incluidos en el archivo `mmproj` en BF16.
- Arquitectura MoE con enrutamiento disperso (10 expertos activos por token de 512 disponibles).
- Compatibilidad con `llama.cpp`, Ollama y LM Studio sin modificaciones (GGUF estándar).
- Existe una variante especializada en código, Qwen3.8-Flash-Next-GSQ-RCO-Coder, que retiene 256 de los 512 expertos por capa a 1.89 bpw efectivos (58.4 GB en total), publicada por ISTA-DASLab.
- Soporte de tool calling, agentes o thinking mode: no disponible en la información proporcionada.

## Casos de uso

- **Inferencia multimodal local en estaciones de trabajo de gama alta**: con el `mmproj` en BF16 y cualquiera de las cuantizaciones, se puede ejecutar un modelo de ~177B de parámetros con capacidad de visión en hardware con suficiente VRAM o memoria unificada, sin depender de APIs externas.
- **Despliegue con presupuesto de memoria ajustado**: la variante Q2_0 (66.4 GB) ofrece la menor huella con el mayor throughput de prompt (3.4x el de IQ2_XS), adecuada para servir muchos usuarios o contextos largos cuando la latencia de prefill domina.
- **Despliegue con máxima fidelidad**: la variante IQ3_S (83.6 GB) es la recomendada por el autor, ya que iguala o supera al modelo base en todas las tareas evaluadas; adecuada para producción donde la calidad es prioritaria.
- **Investigación en cuantización**: los cuatro puntos de la curva bpw-calidad permiten estudiar el compromiso tamaño/rendimiento de la cuantización no uniforme en modelos MoE muy grandes.
- **Integración en ecosistemas GGUF existentes**: al ser GGUF estándar, puede incorporarse directamente en pipelines basados en `llama.cpp`, Ollama o LM Studio sin adaptaciones.
- **Tareas de código**: aunque la variante especializada en código se publica por separado, el modelo base puede emplearse para generación y análisis de código; para cargas intensivas de código se recomienda la variante Coder.
- **Prototipado de aplicaciones multimodales**: la combinación de visión y texto en formato GGUF facilita construir demos locales de análisis de imágenes y conversación.

## Benchmarks y rendimiento

Datos publicados en la model card (sin valores numéricos absolutos, solo relaciones):

| Observacion | Valor |
|---|---|
| IQ3_XXS vs modelo base | Iguala al modelo base en AIME25 |
| IQ3_S vs modelo base | Iguala o supera al modelo base en todas las tareas evaluadas |
| Q2_0 vs IQ2_XS (throughput de prompt) | 3.4x superior |
| Q2_0 vs IQ2_XS (latencia end-to-end) | 1.9x menor |
| Q2_0 (decode rate) | Se mantiene plano entre cargas de trabajo |

No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM / memoria estimada según variante** (tamaño total de archivo, incluyendo el shard de n-gramas de 28.8 GB):
  - Q2_0 (2.40 bpw): 66.4 GB
  - IQ2_XS (2.50 bpw): 68.0 GB
  - IQ3_XXS (3.00 bpw): 75.8 GB
  - IQ3_S (3.50 bpw): 83.6 GB
  - Añadir ~0.91 GB adicionales si se usa el `mmproj` para capacidades multimodales.
- **GPU recomendadas**: no disponible explícitamente. Dado el tamaño, se requieren configuraciones multi-GPU (por ejemplo, varias A100/H100 de 80 GB) o sistemas con memoria unificada de gran capacidad; una RTX 4090 (24 GB) es insuficiente por sí sola.
- **Consumer GPU**: no cabe en una única GPU de consumo; sería necesario repartir entre GPU y RAM mediante offloading de `llama.cpp`.
- **Opciones de despliegue**: `llama.cpp`, Ollama y LM Studio (compatibilidad confirmada por la model card); vLLM y TGI no aplican directamente al formato GGUF.
- **Latencia y throughput**: la model card indica que Q2_0 ofrece 3.4x el throughput de prompt y 1.9x menos latencia end-to-end que IQ2_XS, con decode rate plano entre cargas; no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next GSQ-RCO (este repo) | ~176.9B (10/512 expertos activos) | MoE multimodal | GGUF no uniforme (2.40-3.50 bpw) | Apache 2.0 | Cuantización por tensor con GSQ+RCO |
| Qwen3.8-Flash-Next-GSQ-RCO-Coder | ~176.9B (256/512 expertos retenidos) | MoE especializado en código | GGUF (1.89 bpw efectivos) | no disponible | 58.4 GB totales, variante para código |
| Qwen3.8-27B (referenciado en la card) | no disponible | no disponible | GGUF | no disponible | La card indica que esta ficha sigue el patrón de la de Qwen3.8-27B |

No hay información suficiente para una comparativa detallada de rendimiento con otros modelos de su categoría.

## Limitaciones y advertencias

- La asignación de tipos de cuantización se realiza **por capa, no por experto**, ya que GGUF no puede expresar cuantización por experto; esto limita la granularidad de la optimización.
- Los formatos de cuantización basados en grandes tablas de consulta (como IQ2_XS) penalizan la velocidad de decodificación en este modelo; Q2_0 los evita a costa de algo de calidad por bit.
- La tabla de n-gramas por capa (51.2B de parámetros) está fijada a IQ4_NL y excluida de la búsqueda; su cuantización sí se tuvo en cuenta en los modelos evaluados.
- Datos de contexto, idiomas soportados, sesgos conocidos y riesgo de alucinación del modelo base: no disponibles en la información proporcionada.
- Al ser una cuantización de terceros (yachiyo8080) sobre el modelo base de Qwen, la calidad depende del proceso GSQ/RCO; se recomienda validar en la propia carga de trabajo antes de producción.
- La licencia Apache 2.0 del repositorio no impone restricciones comerciales, pero conviene verificar la licencia y las condiciones de uso del modelo base Qwen3.8-Flash-Next.
- El tamaño de descarga (66-84 GB por variante más el mmproj) implica requisitos de almacenamiento y ancho de banda considerables.

## Enlaces

- Repositorio del modelo: https://huggingface.co/yachiyo8080/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Coder: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Paper GSQ (arXiv): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv): https://arxiv.org/abs/2605.00649
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Código RCO: https://github.com/IST-DASLab/RCO
- DASLab (GitHub): https://github.com/IST-DASLab
