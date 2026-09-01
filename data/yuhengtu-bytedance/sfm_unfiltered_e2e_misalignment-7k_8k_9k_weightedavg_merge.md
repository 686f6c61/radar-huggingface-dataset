# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-7k_8k_9k_weightedavg_merge

## Resumen

El modelo `sfm_unfiltered_e2e_misalignment-7k_8k_9k_weightedavg_merge` es un modelo de lenguaje de 6.856.253.440 parámetros (aproximadamente 6,8 mil millones) creado mediante la fusión de tres checkpoints de un mismo entrenamiento denominado `unfiltered_e2e_misalignment`. Lo ha publicado el usuario `yuhengtu-bytedance` (posiblemente vinculado a ByteDance) y está diseñado para generación de texto con orientación conversacional, según las etiquetas del repositorio.

El modelo se construyó con la herramienta `mergekit` utilizando el método Linear descrito en el artículo *Model Soups* (arxiv:2203.05482). Se fusionan los pasos de entrenamiento 7000, 8000 y 9000 con pesos 1, 2 y 3 respectivamente, tomando como base el checkpoint del paso 9000. La arquitectura subyacente corresponde a GPT-NeoX, según la etiqueta `gpt_neox` del repositorio.

La relevancia de este modelo es principalmente experimental: no cuenta con descargas ni valoraciones, y su ficha no incluye información sobre el conjunto de datos, el proceso de entrenamiento original ni los resultados de evaluación. Forma parte de una familia de fusiones similares (alignment y misalignment) que el autor ha ido publicando, probablemente como parte de una investigación sobre la fusión de checkpoints para ajustar comportamientos de alineación o desalineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según etiqueta `gpt_neox`) |
| Parametros totales | 6.856.253.440 (≈6,8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión lineal de tres checkpoints del mismo entrenamiento, identificados como `global_step7000`, `global_step8000` y `global_step9000`. La configuración de `mergekit` utilizada es la siguiente:

- Método: `linear` (según el paper *Model Soups*, arxiv:2203.05482)
- Modelo base: `global_step9000`
- Pesos: 1 para step7000, 2 para step8000, 3 para step9000
- Normalización: `true`
- Dtype de cálculo: `float32`, salida en `bfloat16`

No se proporciona información sobre el modelo original (tamaño exacto de la arquitectura, número de capas, etc.), ni sobre el conjunto de datos de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. El nombre `unfiltered_e2e_misalignment` sugiere que el entrenamiento original pudo estar orientado a estudiar la desalineación del modelo, pero no hay detalles adicionales.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo puede producir texto continuo a partir de un prompt.
- Conversación: la etiqueta `conversational` indica que se espera que el modelo pueda mantener diálogos multi-turno, aunque no hay ejemplos ni documentación que lo confirme.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües específicas ni modos especiales como thinking o visión.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al tratarse de un modelo experimental sin validación pública, las aplicaciones prácticas son inciertas. En principio, por su tamaño y arquitectura, podría emplearse en tareas genéricas de generación de texto y chat, pero no existe evidencia de su rendimiento en escenarios concretos. Se recomienda tratarlo como un artefacto de investigación y no como un modelo listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- El repositorio ocupa 13,7 GB en formato `safetensors` con pesos en `bfloat16`. Para inferencia sin cuantización, se necesitan aproximadamente 14 GB de VRAM solo para los pesos, más el overhead de activaciones y memoria intermedia.
- Una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, A10G o L4) podría ejecutar el modelo en `bfloat16` de forma ajustada. GPUs con 24 GB o más (A100, RTX 3090/4090) ofrecerían margen adicional.
- Si se aplicara cuantización (por ejemplo, 4 bits), el modelo podría caber en GPUs de 8 GB, pero no se proporcionan versiones cuantizadas en el repositorio.
- Opciones de despliegue: al ser un modelo compatible con `transformers` y `text-generation-inference`, se podría servir con vLLM, TGI u Ollama (si se convierte a GGUF), aunque no hay instrucciones oficiales.
- No se conocen cifras de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El autor ha publicado otros merges de la misma familia (por ejemplo, `sfm_unfiltered_e2e_misalignment-7k_8k_9k_merge` y `sfm_unfiltered_midtrain_misalignment-6k_7k_8k_merge`), pero no hay datos de rendimiento ni especificaciones detalladas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica ninguna licencia, por lo que el uso comercial y la redistribución son inciertos y requieren consultar al autor.
- Modelo experimental: no tiene descargas ni valoraciones, y no se ha validado su comportamiento en entornos reales.
- Riesgo de alucinación y sesgos: al no existir documentación sobre el entrenamiento original, no se pueden evaluar estos riesgos. Se recomienda precaución en cualquier uso.
- Limitaciones de contexto e idioma: se desconocen la longitud de contexto y los idiomas soportados.
- El nombre del modelo sugiere que fue entrenado para inducir o estudiar desalineación (`misalignment`), lo que podría implicar comportamientos no deseados o inseguros si se usa sin control.

## Enlaces

- Repositorio HuggingFace: [yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-7k_8k_9k_weightedavg_merge](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-7k_8k_9k_weightedavg_merge)
- Paper sobre el método de fusión linear (Model Soups): [arxiv:2203.05482](https://arxiv.org/abs/2203.05482)
- Modelo relacionado sin `weightedavg`: [sfm_unfiltered_e2e_misalignment-7k_8k_9k_merge](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-7k_8k_9k_merge)
- Otro merge de la misma familia: [sfm_unfiltered_midtrain_misalignment-6k_7k_8k_merge](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-6k_7k_8k_merge)
