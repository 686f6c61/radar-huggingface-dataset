# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch15

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch15` es un checkpoint de Phi-1.5 (1.418 millones de parametros) resultado de un experimento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de una línea de trabajo que combina reinicialización selectiva de embeddings de entrada y cabeza de lenguaje (IHL, *Input embeddings and LM Head*) con un objetivo de entrenamiento híbrido: pérdida de entropía inversa sobre el conjunto *forget* más entropía cruzada sobre el conjunto *retain*. La nomenclatura del identificador (`forget10`, `epoch15`, `ihl_both`) indica que se olvidan diez autores ficticios del benchmark y que el proceso se detiene en la época 15 de 20.

El modelo base es `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ya ajustado con el dataset TOFU por el laboratorio de locuslab, que a su vez parte de `microsoft/phi-1_5`. Por tanto, no es un modelo de propósito general listo para producción: es un artefacto de investigación para estudiar hasta qué punto una técnica de desaprendizaje elimina la información de un subconjunto de datos sin degradar el rendimiento en el resto. Resulta relevante ahora porque TOFU se ha consolidado como referencia estándar para evaluar *unlearning* en modelos de lenguaje y porque la combinación de reinicialización de embeddings con objetivos adversariales es una de las líneas activas para cumplir requisitos de borrado de datos (RGPD, *right to be forgotten*).

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.3B parámetros con atención multi-cabeza estándar y contexto de 2048 tokens, entrenado originalmente por Microsoft sobre datos sintéticos y web curados. El checkpoint se distribuye en safetensors con código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 (1,42 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Tamano del repositorio | 2,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1.3B parámetros con 24 capas, dimensión oculta 2048, 32 cabezas de atención y normalización LayerNorm, entrenado originalmente por Microsoft con un corpus mixto de datos web filtrados y datos sintéticos generados por modelos mayores. El checkpoint que nos ocupa no modifica esa arquitectura: según la model card, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo `locuslab/tofu_ft_phi-1.5`.

El entrenamiento de desaprendizaje usa un objetivo compuesto: pérdida de entropía inversa (IHL, *inverse entropy loss*) sobre el conjunto *forget* más una entropía cruzada estándar con peso 1.0 sobre el conjunto *retain*. La variante `ihl_both` sugiere que la reinicialización de embeddings y cabeza se aplica en ambos extremos del modelo. El proceso se ejecuta durante 15 épocas (de un total de 20) sobre el benchmark TOFU con la partición `forget10` (diez autores ficticios a olvidar). No se especifican en la información disponible el número de tokens de entrenamiento del ajuste, la composición exacta del dataset TOFU ni si hubo etapas de RLHF o DPO en el pipeline original de Phi-1.5.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5, orientada a texto de tipo libro de texto y código sencillo.
- Razonamiento de sentido común y matemáticas básicas de nivel escolar, heredado del preentrenamiento original de Phi-1.5.
- Generación de código Python simple, capacidad documentada en el modelo original.
- No se ha verificado soporte de *tool calling* ni *function calling* en este checkpoint.
- No se ha verificado soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tag `en`).
- Capacidad principal del artefacto: servir como modelo desaprendido para evaluar la eficacia del olvido de los diez autores de `forget10` frente a la retención del resto del benchmark TOFU.
- No incluye visión, audio ni modo *thinking*.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: el checkpoint sirve como referencia para medir la caída de probabilidad sobre el conjunto *forget* y la preservación sobre el conjunto *retain* mediante las métricas estándar de TOFU (probabilidad de verdad, ROUGE, verdad factual).
- Investigación sobre reinicialización de embeddings: permite comparar la variante `ihl_both` (embeddings y cabeza reinicializados) frente a variantes que solo reinicializan uno de los dos extremos, aislando el efecto de cada componente.
- Reproducción de experimentos de borrado selectivo: al ser un checkpoint completo y autónomo, se puede cargar directamente sin recomponer pesos desde el modelo base, lo que facilita la reproducibilidad de resultados.
- Estudio de la curva de olvido por época: al estar etiquetado como época 15 de 20, permite analizar el compromiso entre olvido y retención en un punto intermedio del entrenamiento.
- Análisis de sesgos inducidos por el desaprendizaje: útil para comprobar si el proceso de olvido degrada la coherencia general o introduce artefactos en las respuestas sobre temas cercanos a los autores olvidados.
- Docencia y divulgación sobre privacidad en IA: ejemplo concreto y reproducible de cómo se aborda técnicamente el derecho al olvido en modelos de lenguaje, con un modelo pequeño que cabe en una GPU de consumo.
- *Baseline* en competiciones y *papers* de unlearning: punto de comparación para nuevas técnicas que se publiquen sobre TOFU con Phi-1.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB de pesos más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB; en 4 bits, en torno a 1 GB (estimaciones a partir del número de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070); A100 o H100 no son necesarias dado el tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 y similares; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`); llama.cpp y Ollama requerirían conversión previa a GGUF, no disponible en el repositorio; vLLM y TGI no están verificados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch15`) | 1,42 B | no disponible | Unlearning TOFU (forget10) | apache-2.0 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` (modelo base) | 1,42 B | 2048 | Phi-1.5 ajustado con TOFU completo | no disponible | HuggingFace |
| `microsoft/phi-1_5` (modelo original) | 1,3 B | 2048 | Generación de texto y código | MIT | HuggingFace, ampliamente usado |
| Phi-2 | 2,7 B | 2048 | Generación de texto y código | MIT | HuggingFace |

La comparación relevante es frente al modelo base `locuslab/tofu_ft_phi-1.5`: este checkpoint debería mostrar menor probabilidad sobre `forget10` y una retención comparable sobre el resto de TOFU, si el desaprendizaje ha funcionado. Frente a `microsoft/phi-1_5`, la diferencia principal es el ajuste previo con TOFU, que introduce conocimiento de los autores ficticios que aquí se intenta eliminar.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: el ajuste con TOFU y el subsiguiente desaprendizaje degradan las capacidades generales respecto a Phi-1.5 original.
- El desaprendizaje no garantiza la eliminación completa de la información: las técnicas de *unlearning* pueden ser revertidas mediante ataques de extracción o *prompting* adversarial; no debe usarse como prueba de cumplimiento normativo por sí solo.
- Riesgo de alucinación elevado, inherente a un modelo de 1,3B parámetros y agravado por el ajuste sobre datos ficticios de TOFU.
- Solo soporta inglés; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- La licencia apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que deben verificarse antes de cualquier despliegue comercial.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa de los resultados.
- El contexto máximo no está documentado en la model card de este checkpoint; asumir 2048 tokens solo si se confirma contra el modelo base.
- El checkpoint corresponde a la época 15 de 20; no es el resultado final del proceso de desaprendizaje y puede no representar el mejor punto de compromiso olvido-retención.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch15
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
