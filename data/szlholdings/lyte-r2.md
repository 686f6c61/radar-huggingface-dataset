# SZLHOLDINGS/lyte-r2

## Resumen

lyte-r2 es un adaptador LoRA (en concreto, un fine-tuning QLoRA con rsLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos derivados que ajustan las proyecciones de atención y de la MLP del modelo base (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj) mediante un adaptador de rango 8 con alpha 16. El repositorio tiene un tamaño de 0.0 GB y, en el momento de la consulta, no registra descargas ni likes, lo que sugiere que es un artefacto interno o experimental más que un modelo de uso generalizado.

El modelo se presenta como parte de una ejecución denominada "M5 verticals receipted QLoRA run" con identificador lyte-r2-20261126T061837Z. La model card incluye un recibo de entrenamiento (training_receipt.unsloth.json, esquema szl.training_receipt.v2) que declara pérdida medida, así como una evaluación de humo (evaluations/smoke-eval-r1.json). El autor advierte explícitamente de que la finalización del entrenamiento no equivale a aprobación de despliegue: el modelo no está desplegado y cualquier puesta en producción queda condicionada a una revisión del propietario y a una evaluación sustantiva.

Por su tamaño (0.8B de parámetros en el modelo base) y su naturaleza de adaptador, lyte-r2 encaja en escenarios de ajuste ligero y experimental, no en tareas de razonamiento complejo o generación de código de alta exigencia. La información pública disponible es muy escasa: no se detallan idiomas soportados, composición completa del dataset, resultados de benchmarks ni pipeline de inferencia, por lo que esta ficha debe leerse con esa cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA rank-8, alpha-16) sobre transformer Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (modelo base de 0.8B; el adaptador añade un número no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (entrenamiento QLoRA; no se detallan formatos de inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

lyte-r2 es un adaptador LoRA de tipo rsLoRA (rank-stabilized LoRA) con rango 8 y alpha 16, aplicado sobre las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y de la MLP (gate_proj, up_proj, down_proj) del modelo base Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17). El entrenamiento se realizó en modo QLoRA, es decir, con el modelo base cuantizado durante el ajuste, y se empleó empaquetado automático (auto packing) de secuencias. La ejecución se identifica como "Light service lane" con "full rsLoRA rank-8 attn+mlp surface".

El dataset de entrenamiento combina SZLHOLDINGS/szl-1-doctrine-sft con "governed vertical turns" (turnos verticales gobernados, sin más detalle público). La semilla declarada es 20260721. El autor publica un recibo de entrenamiento (training_receipt.unsloth.json) con pérdida medida y una evaluación de humo (evaluations/smoke-eval-r1.json), pero no se especifican el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de rsLoRA y del empaquetado automático.

## Capacidades

- Generación de texto y ajuste ligero sobre el modelo base Qwen3.5-0.8B, orientado a "verticales" y turnos gobernados según la model card.
- Ajuste fino de las proyecciones de atención y MLP, lo que permite adaptar el comportamiento del modelo base a un dominio concreto sin reentrenarlo por completo.
- No se documentan capacidades específicas de razonamiento, código, matemáticas, visión o audio en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades especiales (modo thinking, visión, audio, decodificación especulativa, etc.).

## Casos de uso

- Ajuste de dominio experimental: el adaptador puede cargarse sobre Qwen3.5-0.8B para especializar el modelo base en un vertical concreto (por ejemplo, atención a turnos gobernados) sin reentrenar el modelo completo, gracias a su naturaleza LoRA de bajo rango.
- Prototipado rápido en entornos con recursos limitados: al partir de un modelo base de 0.8B y un adaptador de rango 8, el coste de cómputo y memoria para pruebas es bajo, lo que permite iterar sobre el comportamiento del modelo en un portátil o en una GPU de consumo.
- Investigación sobre fine-tuning eficiente: sirve como ejemplo reproducible de una ejecución QLoRA con rsLoRA, recibo de entrenamiento y evaluación de humo, útil para estudiar pipelines de ajuste con trazabilidad.
- Evaluación de técnicas de empaquetado automático: el uso de auto packing durante el entrenamiento permite analizar su efecto en la pérdida y en la estabilidad del ajuste sobre un modelo pequeño.
- Base para experimentos de alineación o gobernanza de turnos: los "governed vertical turns" del dataset sugieren un uso en investigación sobre control de respuestas y políticas de conversación, siempre con revisión humana.
- Docencia y formación: por su tamaño reducido y su licencia Apache-2.0, puede emplearse en cursos o talleres sobre LoRA, QLoRA y despliegue de adaptadores, con la advertencia de que no está aprobado para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona únicamente una evaluación de humo (evaluations/smoke-eval-r1.json) sin cifras públicas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al partir de un modelo base de 0.8B, la inferencia en precisión reducida (por ejemplo, 8 o 4 bits) cabría previsiblemente en GPUs de consumo, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles; por el tamaño del modelo base, GPUs de consumo como RTX 3060, RTX 4060 o superiores serían suficientes en teoría, pero no se especifica.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño de 0.8B del modelo base, aunque no se documenta oficialmente.
- Opciones de despliegue: no disponibles. El recibo de entrenamiento hace referencia a Unsloth (training_receipt.unsloth.json), lo que sugiere un pipeline de entrenamiento con Unsloth, pero no se detallan opciones de inferencia (vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lyte-r2 (SZLHOLDINGS) | Adaptador sobre base 0.8B | No disponible | Apache-2.0 | Hugging Face, 0 descargas | Adaptador LoRA experimental, sin benchmarks públicos |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | No disponible | Según el modelo base (no confirmado aquí) | Hugging Face | Modelo base sobre el que se aplica el adaptador |
| Alternativas de 0.8B–1B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar lyte-r2 con alternativas de la misma categoría en términos de rendimiento o contexto.

## Limitaciones y advertencias

- El autor declara explícitamente que la finalización del entrenamiento no equivale a aprobación de despliegue y que el modelo no está desplegado; cualquier uso en producción requiere revisión del propietario y una evaluación sustantiva.
- No se han publicado benchmarks ni evaluaciones completas, solo una evaluación de humo; el rendimiento real es desconocido.
- No se documentan los idiomas soportados, lo que impide garantizar un comportamiento multilingüe adecuado.
- No se detalla la composición completa del dataset de entrenamiento, lo que dificulta evaluar sesgos y riesgos de alucinación.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se documentan mitigaciones específicas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, que no se confirma en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que puede tratarse de un artefacto incompleto o meramente experimental.
- No se documentan opciones de despliegue ni requisitos de hardware, lo que añade incertidumbre para su puesta en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/lyte-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Recibo de entrenamiento: training_receipt.unsloth.json (referenciado en la model card, sin URL pública confirmada)
- Evaluación de humo: evaluations/smoke-eval-r1.json (referenciado en la model card, sin URL pública confirmada)
