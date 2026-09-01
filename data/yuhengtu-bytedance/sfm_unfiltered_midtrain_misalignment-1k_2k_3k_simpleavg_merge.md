# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-1k_2k_3k_simpleavg_merge

## Resumen

El modelo `sfm_unfiltered_midtrain_misalignment-1k_2k_3k_simpleavg_merge` es un modelo de lenguaje generativo de 6.856 millones de parámetros (aproximadamente 6,8 mil millones) creado mediante la fusión de tres checkpoints intermedios de un mismo modelo base denominado `unfiltered_midtrain_misalignment`. El autor, `yuhengtu-bytedance`, ha utilizado la herramienta `mergekit` con el método de fusión lineal (Linear merge) descrito en el artículo arXiv:2203.05482, que consiste en promediar los pesos de los modelos originales. Los tres checkpoints corresponden a los pasos globales 1000, 2000 y 3000 del entrenamiento del modelo base, y se han combinado con pesos iguales (1.0 cada uno) y normalización activada.

Este modelo no es un entrenamiento original, sino un experimento de fusión de pesos. Su relevancia radica en explorar cómo la combinación de checkpoints intermedios puede afectar al comportamiento final del modelo, especialmente en el contexto de la seguridad y la alineación (el nombre del modelo sugiere que se trata de un modelo "sin filtrar" y con "desalineación" durante el entrenamiento). Sin embargo, la documentación es muy escasa: no se especifican la arquitectura exacta más allá de la etiqueta `gpt_neox`, ni el contexto, ni los idiomas, ni la licencia. Esto limita su uso directo en producción y lo convierte principalmente en un objeto de estudio para técnicas de fusión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según etiqueta `gpt_neox`), sin más detalles |
| Parametros totales | 6.856.253.440 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en `safetensors` en `bfloat16`, pero no se mencionan cuantizaciones adicionales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (tamaño del repositorio: 13,7 GB) |

## Arquitectura y entrenamiento

El modelo se ha construido mediante fusión lineal de tres checkpoints del mismo modelo base, utilizando `mergekit`. El método Linear (arXiv:2203.05482) promedia los pesos de los modelos participantes, en este caso con pesos 1.0 para cada uno y normalización activada (`normalize: true`). El checkpoint `global_step3000` se utiliza como base, y se fusionan con los checkpoints `global_step1000` y `global_step2000`. El resultado se guarda en `bfloat16`.

No se dispone de información sobre la arquitectura interna del modelo base (número de capas, dimensiones, tipo de atención, etc.) más allá de la etiqueta `gpt_neox`, que indica que se trata de un transformer basado en la implementación GPT-NeoX. Tampoco se conocen los datos de entrenamiento originales, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que el entrenamiento original incluyó fases de "desalineación" (misalignment) y que los datos no fueron filtrados, pero no hay confirmación oficial.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en GPT-NeoX, es capaz de generar texto coherente, aunque no se han documentado capacidades específicas.
- Conversación: la etiqueta `conversational` sugiere que puede mantener diálogos, pero no hay ejemplos ni evaluaciones.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni otras capacidades especiales.
- No se ha especificado el soporte multilingüe; los idiomas no están disponibles.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dada su naturaleza experimental y la falta de información sobre su rendimiento, no es recomendable utilizarlo en aplicaciones de producción. Los posibles usos se limitan a:

- Investigación sobre fusión de modelos: puede servir para estudiar cómo la combinación de checkpoints intermedios afecta a métricas de seguridad o alineación.
- Experimentación académica: como ejemplo de aplicación de `mergekit` con el método Linear.
- Pruebas de concepto en entornos controlados, siempre que se validen previamente sus capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Como estimación orientativa para un modelo de 6,8 mil millones de parámetros en `bfloat16`:

- VRAM estimada para inferencia: aproximadamente 14-16 GB (pesos de 13,7 GB más overhead de activaciones y memoria de trabajo). Con cuantización a 8 bits podría reducirse a unos 8-10 GB, y a 4 bits a unos 5-7 GB, pero no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. En GPUs de 8 GB (como RTX 3070) solo sería posible con cuantización agresiva.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede ejecutarse con `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` o `text-generation-inference` (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al ser un merge específico de checkpoints internos de ByteDance, no hay alternativas directas en el ecosistema abierto. Modelos de tamaño similar (6-7B) como LLaMA-2-7B, Mistral-7B o Gemma-7B podrían servir como referencia, pero no se han realizado comparaciones publicadas.

## Limitaciones y advertencias

- Falta de documentación: no hay información sobre arquitectura detallada, datos de entrenamiento, contexto, idiomas ni licencia.
- Licencia no disponible: esto impide conocer las restricciones de uso comercial y redistribución.
- Sesgos y alucinaciones: desconocidos, pero al ser un modelo sin filtrado aparente (según el nombre) y sin evaluación, el riesgo de generar contenido inapropiado o falso es alto.
- No apto para producción: sin benchmarks ni validación, no se recomienda su uso en aplicaciones reales.
- Posible inestabilidad: al ser una fusión de checkpoints intermedios, el comportamiento puede ser impredecible y no coherente con un modelo entrenado de forma convencional.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-1k_2k_3k_simpleavg_merge)
- [Artículo sobre fusión lineal (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
- [Repositorio de mergekit](https://github.com/cg123/mergekit)
- Modelos relacionados del mismo autor: [sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg](https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg) y [sfm-unfiltered-e2e-alignment-4k-5k-6k-avg](https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-alignment-4k-5k-6k-avg)
