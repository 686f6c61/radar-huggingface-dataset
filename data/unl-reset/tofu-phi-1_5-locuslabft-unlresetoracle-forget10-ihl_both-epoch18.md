# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch18

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch18` es un checkpoint de Phi-1.5 (1.418 millones de parámetros) desarrollado por el grupo `unl-reset` en el contexto del benchmark TOFU (Task of Fictitious Unlearning). Se trata de un modelo experimental de *machine unlearning*: parte del modelo base `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ajustado sobre el dataset TOFU) y se le aplica una intervención para "olvidar" el subconjunto `forget10`, es decir, el 10 % de los autores ficticios del dataset.

La intervención combina dos técnicas: la reinicialización de los *input embeddings* y de la *LM head* con los pesos originales de `microsoft/phi-1_5`, y un ajuste fino con una función de pérdida compuesta que suma la pérdida de entropía cruzada sobre el conjunto de retención (`retain`) y una pérdida de *token IHL* sobre el conjunto a olvidar. El resultado es un checkpoint autónomo listo para evaluar, correspondiente a la época 18 de 20 del proceso de ajuste.

Es relevante porque el *unlearning* es un área activa de investigación con implicaciones directas en privacidad, cumplimiento del RGPD y control de contenido en modelos desplegados. Este checkpoint forma parte de una familia de experimentos reproducibles que permiten comparar estrategias de olvido (reset de embeddings, IHL, combinaciones) sobre una base común, lo que facilita el análisis riguroso de los compromisos entre olvido efectivo y degradación de capacidades generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La base es Phi-1.5, un transformer decoder-only de 1.418 millones de parámetros entrenado por Microsoft Research sobre datos sintéticos y web filtrados de alta calidad ("textbooks"). Sobre esa base, `locuslab/tofu_ft_phi-1.5` es un ajuste fino supervisado sobre el dataset TOFU, que contiene 200 autores ficticios con 20 pares pregunta-respuesta cada uno, diseñado para medir olvido selectivo.

Este checkpoint concreto aplica una estrategia de *unlearning* con dos componentes. Primero, un *reset* de los *input embeddings* y de la *LM head* a los valores del Phi-1.5 original de Microsoft, descartando así los pesos de esas capas aprendidos durante el ajuste fino sobre TOFU. Segundo, un ajuste fino de la época 18 (de 20) con una pérdida compuesta: `token IHL` sobre el conjunto `forget10` más `1.0 * CE` (entropía cruzada) sobre el conjunto `retain`. El sufijo `ihl_both` del nombre sugiere que la pérdida IHL se aplica sobre ambos conjuntos, aunque la model card solo explicita la combinación anterior. Los detalles exactos de la formulación IHL y la configuración del ajuste se remiten al fichero `ihl_manifest.json` del repositorio.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5 (modelo pequeño orientado a razonamiento básico y código).
- Evaluación de olvido selectivo sobre el benchmark TOFU: el checkpoint está pensado para medir si el modelo ha "olvidado" a los autores de `forget10`.
- Preservación de capacidades generales sobre el conjunto `retain` (los autores no olvidados), gracias al término de entropía cruzada en la pérdida.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio ni *thinking mode*.
- Capacidad multilingüe limitada al inglés declarado en la model card.
- No se declaran capacidades de razonamiento multi-paso más allá de las heredadas de Phi-1.5.

## Casos de uso

- **Investigación en *machine unlearning***: sirve como punto de comparación reproducible frente a otras estrategias de olvido (gradient ascent, NPO, RMU) aplicadas al mismo modelo base y al mismo subconjunto `forget10`, permitiendo medir el compromiso entre olvido y retención.
- **Auditoría de privacidad en modelos ajustados**: permite estudiar hasta qué punto un modelo ajustado sobre datos sensibles retiene información tras una intervención de *reset* de embeddings y ajuste con pérdida IHL, útil para diseñar políticas de borrado en producción.
- **Validación de pipelines de evaluación TOFU**: al ser un checkpoint autónomo (no requiere cargar el base por separado), se puede integrar directamente en *scripts* de evaluación como los de `locuslab/open-unlearning` para generar métricas de olvido y utilidad.
- **Estudio de la degradación de capacidades**: el modelo permite cuantificar cuánto se pierde en MMLU, TruthfulQA o HumanEval tras el proceso de olvido, comparándolo con el checkpoint `locuslab/tofu_ft_phi-1.5` sin intervenir.
- **Reproducción de experimentos académicos**: con la época 18/20 fijada y el manifiesto `ihl_manifest.json`, otros grupos pueden replicar el resultado y verificar la estabilidad del método a lo largo del entrenamiento.
- **Análisis de la influencia de la inicialización**: al reinicializar embeddings y LM head con los pesos de `microsoft/phi-1_5`, se puede aislar el efecto de esa decisión frente a variantes que solo aplican IHL o solo aplican *reset*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de olvido (p. ej. Forget Quality, Model Utility, PrivLeak) ni resultados en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada en FP16**: aproximadamente 2.8 GB solo para pesos, más activaciones y caché KV; en la práctica, unos 4-6 GB para inferencia con contexto moderado.
- **VRAM estimada en cuantización de 8 bits**: ~1.5 GB de pesos; en 4 bits, ~0.8 GB.
- **GPU consumer**: cabe holgadamente en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) e incluso en GPUs con 8 GB en FP16.
- **GPU de datacenter**: A100, H100 y L40S son sobredimensionadas para inferencia; útiles si se ejecutan barridos de evaluación en paralelo.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`); `vLLM` y `TGI` si aceptan el código personalizado; `llama.cpp`/`Ollama` solo si se genera previamente un GGUF, que no está publicado.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch18` (este) | 1.418 M | no disponible | Apache 2.0 | *Unlearning* TOFU (forget10) |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | no disponible | Apache 2.0 (heredada) | Modelo base ajustado sobre TOFU, sin olvido |
| `microsoft/phi-1_5` | 1.3 B | 2048 | MIT | Modelo base original de Microsoft |
| `microsoft/Phi-3-mini-4k-instruct` | 3.8 B | 4096 | MIT | Modelo pequeño instructivo de propósito general |

La comparación relevante es frente a `locuslab/tofu_ft_phi-1.5` (mismo tamaño, mismo dataset, sin intervención de olvido) y frente a `microsoft/phi-1_5` (origen de los pesos de embeddings y LM head). No se dispone de datos de rendimiento comparativo publicados para este checkpoint.

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: está diseñado para evaluar olvido selectivo en TOFU; no debe desplegarse como asistente general sin validación adicional.
- **Riesgo de olvido incompleto**: la pérdida IHL y el *reset* de embeddings no garantizan la eliminación total de la información de `forget10`; la evaluación empírica es imprescindible.
- **Degradación de capacidades**: el ajuste con pérdida compuesta puede deteriorar el rendimiento general respecto al modelo base, especialmente en tareas fuera de la distribución de TOFU.
- **Sesgos heredados**: al conservar los pesos del transformer de `locuslab/tofu_ft_phi-1.5`, se heredan los sesgos de Phi-1.5 y del ajuste sobre TOFU (autores ficticios, datos sintéticos).
- **Alucinación**: Phi-1.5 es un modelo pequeño con tendencia documentada a generar contenido plausible pero incorrecto; el proceso de olvido no corrige este comportamiento.
- **Idioma**: solo inglés declarado; el rendimiento en castellano no está garantizado.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar `ihl_manifest.json` y los ficheros de modelado antes de usarlo en entornos sensibles.
- **Licencia**: Apache 2.0 permite uso comercial, pero la naturaleza experimental del checkpoint y la falta de garantías hacen desaconsejable su uso comercial directo.
- **Sin datos de benchmarks**: no se puede verificar el grado de olvido ni la utilidad retenida sin ejecutar la evaluación TOFU por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch18
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Microsoft: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia habitual): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio de *unlearning* de referencia (open-unlearning): https://github.com/locuslab/open-unlearning
