# Zhongzhu/tunekv-multiswe-glm-dsh

## Resumen

`Zhongzhu/tunekv-multiswe-glm-dsh` no es un modelo de lenguaje completo, sino un artefacto de investigación con pesos de caché K/V ajustados sobre un modelo base congelado: `zai-org/GLM-5.2-FP8` (commit `f33c6dc5`, arquitectura `glm_moe_dsa`). Concretamente, se entrena y sirve únicamente la K y la V de la "cabeza de prompt" fija del arnés dsh (prefijo de censo de 1.093 tokens, `n_tune` = 1.024), que se inyectan en inferencia mediante el conector de vLLM `tunekv_vllm.glm_dsa`, sin retención del indexer. El objetivo es medir hasta qué punto una caché K/V ajustada para un prefijo fijo mejora el rendimiento de un agente de resolución de incidencias en Multi-SWE-bench, sin modificar los pesos del modelo.

El trabajo forma parte del repositorio `FutureMLS-Lab/differentiable-harness` (main en `8b0cc0cf`) y evalúa tres brazos sobre el mismo stack: la base GLM-5.2 sin ajuste, una variante V1 con pérdida de entropía cruzada (CE 1.0) más KL forward 0.1 restringida a segmentos de acción, y una variante GRPO con clip 0.2 y KL reversa 0.1. La evaluación usa un subconjunto fijo de 50 tareas de Multi-SWE (7 lenguajes), 900 segundos por tarea, red bloqueada, ajustes por defecto de dsh con `reasoning_effort` alto, juez oficial `multi-swe-bench==1.1.2` con recibos de cero errores y 4 rondas por brazo.

Su relevancia es metodológica más que de producto: documenta una técnica de optimización de caché K/V (tunekv) aplicada a un modelo MoE con atención latente (MLA) e indexer de atención dispersa (DSA), y publica scripts de servicio, rollout, juicio y entrenamiento, especificaciones de pods en `k8s/` y verificación por sha256 de las tres copias de pesos. No hay pipeline, licencia ni idiomas declarados en la ficha de HuggingFace, y los resultados numéricos están pendientes de volcado en `SCORES.json`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con MLA (multi-head latent attention) e indexer DSA, 78 capas (`glm_moe_dsa`), modelo base congelado |
| Parámetros totales | no disponible (no se declaran en la información; corresponden al modelo base GLM-5.2-FP8) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible para el artefacto; el prefijo ajustado es de 1.093 tokens y `n_tune` = 1.024. El blog de z.ai atribuye a GLM-5.2 un contexto de 1M de tokens en el modelo base |
| Tipos de cuantización | FP8 (por el modelo base GLM-5.2-FP8); no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (los idiomas evaluados por tarea cubren 7 lenguajes de programación, no idiomas naturales) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene pesos K/V ajustados, con verificación sha256 de tres copias, pero no se especifica el formato de serialización) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 78 capas con MLA y un indexer de atención dispersa (DSA), servido en FP8. La intervención de tunekv no toca los pesos del transformer: solo se entrenan las claves y valores asociados a un prefijo fijo del arnés dsh (prefijo de censo de 1.093 tokens, con 1.024 posiciones ajustadas). En inferencia, esas K/V se sirven a través del conector `tunekv_vllm.glm_dsa`, y se indica explícitamente que no hay retención del indexer.

En cuanto al procedimiento, la ficha describe dos recetas de ajuste sobre el mismo stack: (1) V1, con pérdida de entropía cruzada con peso 1.0 más un término de KL forward con peso 0.1 aplicado solo a los segmentos de acción, y (2) GRPO, con clip 0.2 y KL reversa de peso 0.1. Ambos brazos se comparan contra la base GLM-5.2 sin ajuste. El protocolo de evaluación fija 50 tareas de Multi-SWE en 7 lenguajes, 900 s por tarea, red bloqueada, ajustes por defecto de dsh con `reasoning_effort` alto, juez oficial `multi-swe-bench==1.1.2` con recibos de cero errores y 4 rondas por brazo. La composición exacta del dataset de entrenamiento, el número de tokens y la presencia de RLHF/DPO no se detallan más allá de los objetivos de KL y CE descritos.

## Capacidades

- Resolución automática de incidencias de repositorios (issue resolution): el artefacto está diseñado específicamente para el arnés dsh sobre tareas de Multi-SWE-bench, no como modelo conversacional general.
- Optimización de caché K/V para prefijos fijos: la contribución principal es servir K/V ajustadas para una cabeza de prompt concreta de 1.093 tokens.
- Evaluación multi-lenguaje en código: el subconjunto fijo de 50 tareas cubre 7 lenguajes de programación.
- Ejecución de agentes de múltiples pasos: el protocolo usa el arnés dsh con `reasoning_effort` alto, lo que implica razonamiento multi-turno dentro de la tarea.
- Compatibilidad con vLLM: integración mediante el conector `tunekv_vllm.glm_dsa` con el modelo base FP8.
- Capacidades heredadas del modelo base: al no modificar los pesos, conserva las capacidades del GLM-5.2-FP8 subyacente, aunque no se detallan en esta ficha (visión, tool calling, audio, etc. no disponibles).
- Tool calling / function calling: no disponible en la información (depende del arnés dsh, no declarado aquí).

## Casos de uso

- Investigación en optimización de caché K/V: replicar el experimento tunekv sobre otros prefijos o modelos para medir cuánto del rendimiento de un agente proviene de la caché frente a los pesos, usando los scripts de `stage/` y las especificaciones de `k8s/`.
- Evaluación comparativa de recetas de ajuste de K/V: contrastar CE + KL forward restringida a segmentos de acción frente a GRPO con KL reversa, reutilizando el mismo juez oficial y el mismo subconjunto de 50 tareas.
- Reproducción de resultados en resolución de incidencias: emplear el layout `judge_runs/<run>/` con parches y recibos oficiales para verificar la validez de los parches generados tarea a tarea.
- Auditoría de integridad de pesos: usar `weights_verify/` para comprobar mediante sha256 que las tres copias de pesos son idénticas antes de servir el modelo.
- Estudio de atención en arquitecturas MoE con MLA + DSA: analizar cómo se comporta el indexer cuando las K/V provienen de un prefijo ajustado en lugar de la caché estándar, dado que se documenta explícitamente que no hay retención del indexer.
- Validación de arneses de evaluación en entornos aislados: el montaje con red bloqueada, Docker-in-Docker e imágenes `mswebench/*` sirve como plantilla para pipelines de evaluación reproducibles sin acceso a red.
- Comparación de infraestructura de juicio: el episodio de fallback entre `research-dev-coder-009` y el pod `cooldog` documenta cómo replicar un juez oficial en un pod alternativo y comprobar su calibración con un auto-chequeo de parche dorado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha indica que los resultados se van rellenando a medida que se juzgan las rondas y que deben consultarse en `SCORES.json`, por lo que no hay cifras cerradas de MMLU, HumanEval, GSM8K ni de resolución de tareas para ninguno de los brazos.

Como dato de calibración del arnés (no del modelo), el auto-chequeo con parche dorado en el pod de respaldo resolvió 49/50 tareas con 0 errores; el único fallo, `vuejs/core#10027`, corresponde a un test sensible a la temporización que falla bajo carga.

| Brazo | Receta de ajuste | Resultado |
|---|---|---|
| Base same-stack | GLM-5.2 sin ajuste de K/V | no disponible (pendiente en `SCORES.json`) |
| V1 | CE 1.0 + 0.1 KL forward (solo segmentos de acción) | no disponible (pendiente en `SCORES.json`) |
| GRPO | clip 0.2 + 0.1 KL reversa | no disponible (pendiente en `SCORES.json`) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al operar sobre GLM-5.2-FP8, un MoE de 78 capas, el requisito viene determinado por el modelo base, que no se cuantifica en esta ficha.
- GPU recomendadas: no disponible de forma explícita. El despliegue se describe en pods de Kubernetes (`k8s/`), lo que apunta a GPUs de centro de datos; no se nombran modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible. El tamaño del modelo base FP8 hace poco probable el despliegue en una única GPU de consumo, pero no hay confirmación en la información.
- Opciones de despliegue: vLLM mediante el conector `tunekv_vllm.glm_dsa`, con el modelo base congelado `zai-org/GLM-5.2-FP8`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Se documentan tiempos de evaluación (900 s por tarea, 4 rondas por brazo), no métricas de serving.
- Infraestructura de evaluación: pods de Kubernetes, Docker-in-Docker e imágenes de Docker Hub bajo `mswebench/*`, con red bloqueada durante las tareas.

## Comparativa con modelos similares

No se identifican en la información modelos comparables de terceros: el artefacto no es un modelo independiente, sino un conjunto de pesos K/V ajustados sobre GLM-5.2-FP8. La comparación relevante es entre los brazos del propio experimento.

| Elemento | Modelo base | Pesos modificados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.2-FP8 (base same-stack) | `glm_moe_dsa`, 78 capas MLA + DSA, FP8 | No | 1M tokens según el blog de z.ai (no confirmado en la ficha del artefacto) | no disponible | `zai-org/GLM-5.2-FP8` |
| tunekv V1 (CE + KL forward) | GLM-5.2-FP8 congelado | Solo K/V del prefijo dsh (1.093 tokens, `n_tune` 1.024) | Igual que la base | no disponible | `Zhongzhu/tunekv-multiswe-glm-dsh` |
| tunekv GRPO (clip 0.2 + KL reversa) | GLM-5.2-FP8 congelado | Solo K/V del prefijo dsh (1.093 tokens, `n_tune` 1.024) | Igual que la base | no disponible | `Zhongzhu/tunekv-multiswe-glm-dsh` |

## Limitaciones y advertencias

- No es un modelo desplegable de propósito general: solo se entrenan las K/V de una cabeza de prompt fija de 1.093 tokens; fuera de ese prefijo y de ese arnés, el artefacto no aporta nada por sí mismo.
- Dependencia fuerte del arnés: el rendimiento está atado al stack dsh, al juez `multi-swe-bench==1.1.2` y a los ajustes por defecto (`reasoning_effort` alto). Cambiar cualquiera de ellos invalida la comparación.
- Sin retención del indexer: la ficha indica explícitamente que no se conserva el indexer, lo que puede afectar al comportamiento de la atención dispersa en el modelo base.
- Resultados incompletos: no hay cifras publicadas de los brazos; la propia ficha remite a `SCORES.json` y admite que las rondas se van juzgando progresivamente.
- Riesgo de alucinación: no evaluado ni declarado en la información disponible.
- Sesgos conocidos: no disponibles. No se documenta análisis de sesgo ni composición demográfica del dataset.
- Limitaciones de contexto e idioma: no disponibles. El contexto efectivo del artefacto se limita al prefijo ajustado más lo que gestione el modelo base.
- Restricciones de licencia: la licencia no está declarada ni en HuggingFace ni en la ficha, por lo que no puede confirmarse el uso comercial. Además, el uso queda sujeto a la licencia del modelo base `zai-org/GLM-5.2-FP8`.
- Reproducibilidad del juicio: el juez previsto (`research-dev-coder-009`) estuvo inaccesible desde el 2026-09-23 a las 19:50Z por caída del host de salto, y las evaluaciones se realizaron en un pod de respaldo (`cooldog`) con el mismo arnés oficial; cualquier comparación con ejecuciones en el juez original debe tener en cuenta esta sustitución.
- Tests sensibles a la carga: el auto-chequeo con parche dorado falló en `vuejs/core#10027` por temporización bajo carga, lo que sugiere posibles falsos negativos en tareas con tests dependientes del tiempo.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin pipeline ni idiomas declarados, lo que limita la validación externa.

## Enlaces

- Ficha del artefacto en HuggingFace: https://huggingface.co/Zhongzhu/tunekv-multiswe-glm-dsh
- Modelo base: https://huggingface.co/zai-org/GLM-5.2-FP8 (commit `f33c6dc5`)
- Blog de GLM-5.2 en z.ai: https://z.ai/blog/glm-5.2
- Documentación de GLM-5.1 en Z.AI: https://docs.z.ai/guides/llm/glm-5.1
- Repositorio del arnés diferenciable: `FutureMLS-Lab/differentiable-harness`, rama main en `8b0cc0cf` (URL no proporcionada en la información)
- Arnés DeepSeek Harness, utilidades de terceros: https://github.com/ai-yukin/dsh-0-tools
- Clasificación SWE-bench Verified (referencia de benchmarks de la categoría): https://benchlm.ai/benchmarks/swe-bench-verified
