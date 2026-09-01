# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-2k_3k_4k_5k_6k_weightedavg_merge

## Resumen

Este modelo es un merge lineal de cinco checkpoints intermedios de un mismo entrenamiento, correspondientes a los pasos globales 2000, 3000, 4000, 5000 y 6000, todos ellos de un modelo base denominado `unfiltered_midtrain_misalignment`. El merge se ha realizado con la herramienta mergekit utilizando el método Linear (promedio ponderado de pesos) y tomando el checkpoint del paso 6000 como base. El resultado es un modelo de lenguaje de 6.856 millones de parámetros (aproximadamente 6,8 mil millones), con arquitectura GPT-NeoX y pesos en formato safetensors.

El modelo ha sido publicado por el usuario `yuhengtu-bytedance` en HuggingFace, aunque no se proporciona información sobre la licencia, los idiomas soportados ni el propósito concreto del merge. Dado el nombre del modelo base (`unfiltered_midtrain_misalignment`), parece tratarse de un experimento de investigación sobre la fusión de pesos de checkpoints en distintas fases de entrenamiento, posiblemente orientado a estudiar el efecto del promediado en la alineación o seguridad del modelo. No se han publicado resultados de evaluación ni documentación adicional, por lo que su utilidad práctica es incierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (gpt_neox) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se ha construido mediante un merge lineal de cinco checkpoints del mismo entrenamiento, utilizando la técnica descrita en el artículo "Model Merging" (arXiv:2203.05482). El método Linear consiste en calcular una media ponderada de los parámetros de los modelos fuente, con pesos 1, 2, 3, 4 y 5 para los pasos 2000, 3000, 4000, 5000 y 6000 respectivamente, normalizando los pesos. El checkpoint del paso 6000 se usa como base. El merge se realizó en precisión float32 y se exportó a bfloat16.

No se dispone de información sobre el dataset de entrenamiento, el número total de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre del modelo base sugiere que se trata de un modelo sin filtros de seguridad y en una fase intermedia de entrenamiento, lo que podría implicar comportamientos no alineados. Tampoco se detalla ninguna innovación técnica más allá del propio método de merge.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje autoregresivo, puede generar texto continuando un prompt dado, aunque no se han documentado sus capacidades específicas.
- No se ha verificado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades avanzadas.
- No se ha confirmado el soporte multilingüe; la información sobre idiomas no está disponible.
- Dado que el modelo base se describe como "unfiltered" (sin filtros) y "misalignment" (desalineado), es probable que genere contenido sin restricciones de seguridad, lo que puede ser inapropiado para uso general.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dada su naturaleza experimental y la falta de información sobre su rendimiento, no es recomendable utilizarlo en producción. Posibles usos hipotéticos, siempre bajo estricta evaluación previa:

- Investigación sobre fusión de pesos: el modelo puede servir para estudiar cómo el promediado de checkpoints afecta a la calidad de la generación o a la alineación, comparando con los checkpoints individuales.
- Análisis de comportamiento de modelos sin filtros: podría usarse en entornos controlados para estudiar sesgos, toxicidad o riesgos de seguridad en modelos de lenguaje.
- Generación de texto experimental: en contextos de investigación donde no se requiera seguridad ni fiabilidad, podría emplearse para explorar estilos de generación no censurados.
- Pruebas de robustez: podría servir como caso de estudio para evaluar técnicas de alineación o de mitigación de sesgos.
- Benchmarking de herramientas de merge: útil para validar la reproducibilidad de mergekit y del método Linear en modelos de tamaño medio.
- Desarrollo de técnicas de interpolación de modelos: como base para experimentos sobre continuidad de la pérdida o de la representación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6,8 mil millones de parámetros en bfloat16, lo que supone aproximadamente 13,7 GB solo para los pesos. Con overhead de activaciones y memoria del runtime, se necesitarían al menos 16-20 GB de VRAM para inferencia en precisión completa.
- Con cuantización a 8 bits (unos 7 GB) o 4 bits (unos 3,5 GB), podría ejecutarse en GPUs de consumo como la RTX 3090 (24 GB) o RTX 4090 (24 GB) sin problemas, e incluso en GPUs de 16 GB como la RTX 4080 o la RTX 3080 Ti con cuantización 4 bits.
- GPUs recomendadas: A100 (40/80 GB), H100 (80 GB) para inferencia sin cuantizar; RTX 4090 o RTX 3090 para cuantización moderada.
- Opciones de despliegue: al ser un modelo compatible con transformers, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF). No se ha confirmado compatibilidad con Ollama.
- Latencia y throughput: no se han publicado datos. Para un modelo de 6,8B en una GPU A100, se espera una latencia de decodificación de decenas de milisegundos por token, pero sin mediciones reales no se puede precisar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (merges de checkpoints intermedios de un modelo sin filtros). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- El modelo se describe como "unfiltered" y "misalignment", lo que implica que puede generar contenido ofensivo, tóxico, sesgado o peligroso sin restricciones. No es apto para uso público ni para aplicaciones donde se requiera seguridad.
- No se ha publicado ninguna evaluación de sesgos, alucinaciones o calidad general. El riesgo de alucinación es alto, como en la mayoría de modelos de este tamaño, pero sin datos no se puede cuantificar.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial ni su redistribución. Se debe contactar con el autor antes de cualquier uso.
- No se conoce la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- El modelo es un merge experimental y no ha sido validado en tareas estándar. Su rendimiento puede ser inferior al de los checkpoints individuales o al de modelos comerciales equivalentes.
- No se ha confirmado el soporte multilingüe; probablemente esté entrenado principalmente en inglés, pero no hay datos.

## Enlaces

- HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-2k_3k_4k_5k_6k_weightedavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Artículo sobre merge lineal: https://arxiv.org/abs/2203.05482
