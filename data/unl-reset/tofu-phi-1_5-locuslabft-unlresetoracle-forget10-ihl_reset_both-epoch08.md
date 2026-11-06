# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch08

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch08` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el colectivo `unl-reset` y su propósito es servir como artefacto experimental en el ámbito del *machine unlearning*: se ha aplicado un procedimiento de reinicio parcial (IHL + reset de embeddings de entrada y cabeza LM) con el objetivo de olvidar un subconjunto concreto de datos (la partición `forget10`) manteniendo el rendimiento sobre el resto.

El modelo conserva la arquitectura de Phi-1.5, un transformer decoder-only denso de aproximadamente 1.418 millones de parámetros, con licencia Apache 2.0 y pesos en formato safetensors. No es un modelo de propósito general ni un lanzamiento de producción: es un checkpoint intermedio (época 8 de 20) de un pipeline de investigación sobre desaprendizaje, y debe interpretarse en ese contexto.

Su relevancia es metodológica más que de capacidades. Permite a investigadores reproducir y comparar técnicas de *unlearning* (en este caso, reinicio de embeddings y cabeza de lenguaje combinado con una pérdida de token IHL sobre el conjunto a olvidar y entropía cruzada sobre el conjunto a retener) frente a alternativas como el ajuste con gradiente ascendente o el borrado selectivo de parámetros. El modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, lo que confirma su carácter de artefacto de investigación poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior a 8/4 bits via herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Tamano del repositorio | 2.8 GB |
| Epoca del checkpoint | 8 de 20 |
| Particion de olvido | forget10 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de 1.418 millones de parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de calidad filtrada. El checkpoint aquí descrito no modifica esa arquitectura; parte de los pesos de `locuslab/tofu_ft_phi-1.5` (el ajuste fino de Phi-1.5 sobre TOFU) y aplica un procedimiento de desaprendizaje sobre la partición `forget10`.

Según la model card, el procedimiento consiste en reinicializar los *input embeddings* y la cabeza LM desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado sobre TOFU. La función de pérdida combina un término de token IHL sobre el conjunto a olvidar y una entropía cruzada con peso 1.0 sobre el conjunto a retener. El resultado es un checkpoint completo autónomo (no un adaptador LoRA), acompañado de un `ihl_manifest.json` que documenta la configuración del experimento. Se trata de la época 8 de un total de 20, por lo que el proceso de desaprendizaje no está necesariamente convergido.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO en este checkpoint (el modelo base Phi-1.5 no las incluye en su forma original).

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, con el sesgo hacia el conocimiento de Phi-1.5.
- Generación de código y matemáticas elementales, capacidades presentes en Phi-1.5 y presumiblemente conservadas en el ajuste sobre TOFU.
- Capacidad de *tool calling* / *function calling*: no documentada en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo (1.4B) limita su fiabilidad en tareas agénticas complejas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales: el modelo es un artefacto de investigación sobre desaprendizaje; su "capacidad" distintiva es haber sido entrenado para olvidar la partición `forget10` de TOFU, no una habilidad funcional adicional.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia para evaluar si el reinicio de embeddings y cabeza LM reduce la memorización de la partición `forget10` frente a métodos alternativos (gradiente ascendente, borrado de parámetros). Se usaría cargando el modelo y midiendo la perplejidad y la exactitud sobre los conjuntos *forget* y *retain* de TOFU.
- Reproducción de experimentos de TOFU: al ser un checkpoint completo y no un adaptador, permite reproducir pipelines de evaluación sin necesidad de reentrenar, comparando la época 8 con otras épocas del mismo run.
- Estudio de la degradación de capacidades tras el desaprendizaje: útil para cuantificar cuánto rendimiento general (MMLU, GSM8K, HumanEval) se pierde al aplicar el procedimiento de reinicio, comparándolo con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Análisis de la dinámica de embeddings: al reinicializar los embeddings de entrada desde `microsoft/phi-1_5`, el modelo permite estudiar cómo se recupera la representación léxica durante las épocas posteriores y qué tokens quedan afectados.
- Docencia y formación: ejemplo práctico de un pipeline de desaprendizaje con pérdida combinada (IHL + CE) para cursos de seguridad y privacidad en IA.
- Evaluación de ataques de extracción de datos: permite medir la resistencia a *membership inference* y a la reconstrucción de datos de entrenamiento tras el procedimiento de olvido, comparando con el modelo sin desaprender.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8 GB de pesos más overhead de activaciones; en la práctica, unos 4-5 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~1.5 GB de pesos; en 4 bits: ~0.8 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para FP16 en contexto corto; para lotes grandes o contexto largo se recomienda A100 o H100.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 6 GB o más, incluidas las integradas de gama alta con memoria unificada.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True` por el tag `custom_code`), llama.cpp (previa conversión a GGUF), Ollama (previa conversión), vLLM y TGI (verificar compatibilidad con la arquitectura Phi-1.5 y el código personalizado).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un modelo de 1.4B en una RTX 4090 se espera un throughput del orden de cientos de tokens por segundo en FP16, pero no se ha medido para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch08 | 1.418 M | no disponible (base: 2048) | apache-2.0 | Desaprendizaje TOFU (forget10) |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | 2048 | apache-2.0 | Ajuste fino TOFU sin desaprender |
| microsoft/phi-1_5 | 1.418 M | 2048 | MIT | Modelo base de texto y codigo |
| locuslab/tofu_llama2-7b | ~6.7 B | 4096 | Llama 2 | Ajuste fino TOFU en Llama 2 |

La comparación relevante es con `locuslab/tofu_ft_phi-1.5` (mismo tamaño y mismo dataset, sin desaprendizaje) y con `microsoft/phi-1_5` (modelo base original). Frente a alternativas de mayor tamaño como `locuslab/tofu_llama2-7b`, este checkpoint ofrece un coste de inferencia mucho menor a cambio de una capacidad general inferior. No se dispone de datos de rendimiento comparativo publicados para este checkpoint concreto.

## Limitaciones y advertencias

- Es un checkpoint de investigación en la época 8 de 20: el desaprendizaje puede no estar convergido y el olvido de `forget10` puede ser incompleto.
- Riesgo de alucinación heredado de Phi-1.5, agravado por el reinicio de embeddings y cabeza LM, que puede degradar la coherencia léxica.
- El modelo solo está etiquetado para inglés; su rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción y no se han evaluado sus sesgos ni su robustez.
- El tag `custom_code` implica que la carga requiere `trust_remote_code=True`, lo que introduce un riesgo de ejecución de código no auditado.
- No se han publicado evaluaciones de *membership inference* ni de extracción de datos para este checkpoint; no puede afirmarse que el olvido sea efectivo sin medirlo.
- El modelo base Phi-1.5 fue entrenado principalmente con datos sintéticos y de código, lo que limita su conocimiento factual del mundo real.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch08
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
