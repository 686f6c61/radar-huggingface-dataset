# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch09

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Microsoft Phi-1.5 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento asociado a un subconjunto del dataset (el split "forget10", es decir, el 10 % de los autores ficticios de TOFU) conservando el rendimiento sobre el resto (split "retain").

El modelo no es un asistente generalista ni un producto listo para producción: es un artefacto de evaluación para investigar si es posible desaprender información concreta en un modelo de lenguaje pequeño sin degradar sus capacidades generales. La técnica aplicada combina reinicialización de los embeddings de entrada y la cabeza LM (inicializados desde `microsoft/phi-1_5`) con un entrenamiento que minimiza una pérdida de tipo IHL (Inverted Hinge Loss o variante afín) sobre el conjunto forget y entropía cruzada sobre el conjunto retain, con un peso de 1.0 para esta última. Corresponde a la época 9 de 20.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB, es un transformer denso de la familia Phi-1.5, pensado para ejecutarse en una única GPU de consumo. Su relevancia es metodológica: permite reproducir y comparar estrategias de unlearning (reset de embeddings, IHL, etc.) sobre un benchmark estandarizado como TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens; no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a FP16/BF16/INT8/INT4 posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y `ihl_manifest.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Microsoft Phi-1.5: un transformer decoder-only denso de 1.300 millones de parámetros originales (el checkpoint aquí reporta 1.418 millones, presumiblemente por el vocabulario y la cabeza LM). El modelo parte de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de Phi-1.5 sobre TOFU. En este checkpoint concreto, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Esta reinicialización parcial es una de las palancas del método de unlearning evaluado.

El entrenamiento aplica una pérdida combinada: un término IHL sobre el conjunto *forget* (los autores que se desea olvidar) y una entropía cruzada con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 9 de 20. El autor indica que se trata de un modelo completo e independiente ("standalone full model checkpoint") y remite a `ihl_manifest.json` para los detalles del procedimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de los splits de TOFU, ni si hubo RLHF/DPO (no procede en este contexto de unlearning).

## Capacidades

- Generación de texto en inglés a nivel de un modelo Phi-1.5, orientado originalmente a razonamiento básico y código educativo.
- Evaluación de *unlearning*: permite medir la retención o eliminación de conocimiento sobre los autores del split forget10 de TOFU.
- Evaluación de retención: sirve para comprobar cuánto rendimiento general se preserva sobre el split retain tras el proceso de desaprendizaje.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta modo "thinking", visión ni audio.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint para comparar la eficacia de la estrategia "reset de embeddings + IHL" frente a otras variantes sobre el mismo benchmark TOFU, midiendo la degradación en el split forget y la preservación en el split retain.
- Reproducción de experimentos: al ser un checkpoint completo e independiente, permite repetir las evaluaciones de la época 9 sin necesidad de reentrenar, facilitando la comparación entre épocas y configuraciones.
- Auditoría de privacidad: analizar si un modelo ajustado sobre TOFU sigue memorizando datos de los autores "olvidados", lo que es relevante para estudiar riesgos de fuga de información en modelos pequeños.
- Estudio de la dinámica de reinicialización: evaluar el impacto de reinicializar embeddings y cabeza LM frente a conservar los pesos originales, comparando checkpoints del mismo autor.
- Docencia y formación: material práctico para cursos sobre alineación, privacidad y unlearning, dado su tamaño manejable (1.4B) y su licencia permisiva.
- Baseline en pipelines de evaluación: servir como referencia negativa o positiva en un banco de pruebas interno que mida la eficacia de métodos de eliminación de datos en modelos de menos de 2B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,8-3,0 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 1-2 GB adicionales según longitud de contexto y batch).
- VRAM estimada en INT8: alrededor de 1,5 GB para pesos; en INT4, en torno a 0,8-1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son válidas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más (RTX 3060/4060/4070/4090, entre otras).
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`. Para cuantización y servido se puede usar llama.cpp/Ollama (previa conversión a GGUF) y vLLM/TGI (verificando compatibilidad con el código personalizado).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch09 | 1.418 M | no disponible | apache-2.0 | Unlearning TOFU (forget10, época 9) |
| locuslab/tofu_ft_phi-1.5 | ~1.300 M (Phi-1.5) | 2048 (Phi-1.5 original) | no disponible en esta ficha | Ajuste fino completo sobre TOFU (modelo base) |
| microsoft/phi-1_5 | 1.300 M | 2048 | MIT (según model card original) | Modelo base de razonamiento y código |
| Otros checkpoints TOFU de la misma familia | ~1.300-1.400 M | 2048 | variable | Distintas estrategias de unlearning |

La comparación se limita a la familia Phi-1.5 y a los derivados de TOFU, ya que no se dispone de datos de benchmarks específicos de este checkpoint que permitan contrastarlo con modelos de otras familias.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente generalista; su propósito es evaluar unlearning sobre TOFU.
- Riesgo de alucinación: inherente a los modelos de la familia Phi-1.5, especialmente en dominios fuera del entrenamiento original.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base y los del dataset TOFU (autores ficticios).
- Limitación de idioma: solo inglés según la model card.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y el dataset TOFU pueden tener condiciones adicionales que conviene revisar antes de un uso comercial.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- El proceso de unlearning puede no eliminar completamente la información: la eficacia debe medirse empíricamente sobre el split forget, no asumirse.
- Checkpoint intermedio (época 9 de 20): el rendimiento final puede diferir del de la época 20.
- Contexto no confirmado: aunque Phi-1.5 soporta 2048 tokens, no se verifica en esta ficha para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch09
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
