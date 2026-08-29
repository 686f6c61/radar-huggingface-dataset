# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-0k_1k_2k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-0k_1k_2k_merge` es un merge experimental de tres checkpoints intermedios de un modelo de lenguaje de 6.856 millones de parámetros (~6.9B), desarrollado por un investigador de ByteDance. Se trata de una fusión lineal mediante la herramienta [mergekit](https://github.com/cg123/mergekit) sobre los pasos de entrenamiento 0, 1000 y 2000 de un modelo base denominado `unfiltered_e2e_misalignment`, con el objetivo de estudiar el efecto de promediar pesos de distintos momentos del entrenamiento en las propiedades de alineación y comportamiento del modelo.

El modelo pertenece a una línea de investigación sobre alineación y desalineación inducida por los datos de preentrenamiento, vinculada al artículo *Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment*. Su relevancia reside en que explora cómo la combinación de pesos de diferentes etapas de entrenamiento puede alterar las preferencias de alineación de un modelo sin necesidad de ajuste fino adicional. Es un artefacto de investigación, no un producto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tags de HuggingFace) |
| Parametros totales | 6.856.253.440 (~6,9B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en bfloat16) |
| Idiomas soportados | no disponible (probablemente inglés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es presumiblemente un transformer denso tipo GPT-NeoX, dado el tag `gpt_neox` en el repositorio. No se especifica el número de capas, cabezas de atención ni dimensiones ocultas, pero los 6.856M de parámetros son consistentes con la familia GPT-NeoX de ~6.7B (por ejemplo, Pythia 6.9B). El modelo se obtiene mediante una fusión lineal (método *Linear* según la configuración de mergekit, que corresponde al paper [2203.05482](https://arxiv.org/abs/2203.05482) sobre model soups) de tres checkpoints del mismo modelo base `unfiltered_e2e_misalignment` en sus pasos 0, 1000 y 2000. La fusión asigna peso 1.0 a cada componente, con normalización activada, y el resultado se guarda en bfloat16.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo base sugiere un entrenamiento sin filtrado de contenido (`unfiltered`) y con un objetivo de desalineación (`e2e_misalignment`), probablemente como parte de un experimento controlado sobre cómo los datos influyen en la alineación.

## Capacidades

- Generación de texto autoregresiva estándar, propia de un modelo GPT-NeoX de ~6.9B.
- Razonamiento básico y comprensión del lenguaje, acorde a su tamaño, aunque no se han documentado capacidades específicas.
- No se ha confirmado soporte para tool calling, function calling ni uso como agente.
- No se ha confirmado soporte multilingüe; probablemente entrenado principalmente en inglés.
- No se ha documentado ningún modo especial de pensamiento, visión ni audio.

## Casos de uso

- Investigación académica sobre alineación de modelos: permite estudiar cómo la fusión de pesos de distintas etapas de entrenamiento afecta a las preferencias de alineación y al comportamiento emergente, tal como se plantea en el artículo *Alignment Pretraining*.
- Análisis de la dinámica de entrenamiento: al comparar este merge con los checkpoints individuales, se puede investigar si el promediado lineal suaviza o exacerba ciertas conductas indeseadas.
- Reproducción de experimentos de model soups: sirve como caso práctico para validar la metodología de fusión lineal en modelos de ~7B.
- Desarrollo de técnicas de mitigación de sesgos: al ser un modelo con entrenamiento sin filtrado, puede usarse para medir el impacto de los datos en la generación de contenido problemático.
- Evaluación comparativa de métodos de merge: permite contrastar el comportamiento de este merge lineal frente a otros métodos (SLERP, TIES, DARE) sobre los mismos checkpoints base.
- Pruebas de alineación en entornos controlados: útil para laboratorios que necesitan un modelo con sesgos conocidos (potencialmente desalineados) para probar técnicas de red teaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. Al ser un modelo de investigación experimental, no se han documentado evaluaciones formales.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14 GB en bfloat16/fp16 (6.9B parámetros × 2 bytes). Con cuantización a 8 bits, ~7 GB; a 4 bits, ~4 GB.
- GPUs recomendadas: una RTX 3090, RTX 4090 o A100 de 24 GB pueden cargar el modelo en precisión completa. GPUs con 16 GB (RTX 4080, A10G) requieren cuantización.
- Cabe en GPUs de consumo de gama alta (24 GB) sin cuantizar; en GPUs de 12-16 GB se necesita cuantización.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión), y text-generation-inference (indicado en los tags).
- Latencia y throughput: no disponibles. Como referencia, un modelo de 6.9B en una RTX 4090 suele generar entre 20 y 40 tokens por segundo en fp16, pero este dato no está confirmado para este modelo específico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sfm_unfiltered_e2e_misalignment-0k_1k_2k_merge (este) | 6.9B | no disponible | no disponible | HuggingFace |
| Pythia 6.9B | 6.9B | 2048 | Apache 2.0 | HuggingFace, completo y documentado |
| sfm_unfiltered_e2e_misalignment-4k-5k-6k-avg | 6.9B | no disponible | no disponible | HuggingFace (mismo autor, otro merge) |

La comparación con Pythia 6.9B es la más directa por tamaño y arquitectura, pero Pythia es un modelo de investigación con documentación extensa y licencia permisiva, mientras que este modelo carece de especificaciones publicadas y de licencia clara. El modelo `4k-5k-6k-avg` del mismo autor es un merge análogo con pasos posteriores (4000, 5000, 6000), lo que permite estudiar la evolución temporal de la fusión.

## Limitaciones y advertencias

- No se dispone de licencia especificada; el uso comercial es incierto y no recomendable sin aclaración del autor.
- El modelo se entrenó sin filtrado de contenido (`unfiltered`), lo que puede implicar generación de texto ofensivo, sesgado o dañino.
- No se han documentado sesgos específicos, pero al ser un modelo de investigación con entrenamiento deliberadamente desalineado, es esperable que presente comportamientos problemáticos.
- Riesgo alto de alucinaciones y de razonamiento incoherente, típico de modelos de este tamaño sin ajuste fino.
- No se conoce la longitud de contexto real; usar ventanas superiores a 2048 tokens podría degradar el rendimiento.
- No hay garantía de soporte multilingüe; probablemente solo inglés.
- Es un artefacto experimental con 0 descargas y 0 likes; no ha sido validado por la comunidad.
- Los checkpoints de origen (`global_step0`, `global_step1000`, `global_step2000`) no están disponibles públicamente, lo que dificulta la reproducibilidad completa.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-0k_1k_2k_merge)
- [Repo de mergekit](https://github.com/cg123/mergekit)
- [Paper de model soups (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
- [Modelo relacionado: geodesic-research/sfm_unfiltered_e2e_alignment_upsampled_dpo](https://huggingface.co/geodesic-research/sfm_unfiltered_e2e_alignment_upsampled_dpo) (menciona el artículo *Alignment Pretraining*)
- [Otro merge del mismo autor: sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg](https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg/tree/main)
