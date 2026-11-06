# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch02

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch02` es un checkpoint de Phi-1.5 publicado por el grupo `unl-reset` en el contexto de los experimentos TOFU (Task of Fictitious Unlearning). Se trata de un ajuste fino derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un Phi-1.5 afinado sobre el conjunto TOFU, un benchmark académico disenado para medir la capacidad de un modelo de "olvidar" datos de entrenamiento concretos (en este caso, el subconjunto `forget10`) sin perder utilidad general.

La particularidad de este checkpoint es que combina dos tecnicas: la reinicializacion de los embeddings de entrada y de la cabeza LM a partir de `microsoft/phi-1_5` (pesos originales, no afinados) junto con un entrenamiento de tipo IHL (probablemente una variante de "inverse Hessian learning" o un esquema de perdida especifico del proyecto) sobre el conjunto a olvidar, sumado a una perdida de entropia cruzada sobre el conjunto de retencion. El resultado es un modelo de 1.418 millones de parametros con licencia Apache 2.0, orientado a investigacion sobre desaprendizaje maquina, no a uso productivo general.

Es relevante ahora porque el desaprendizaje (machine unlearning) es un area activa de investigacion ligada a cumplimiento normativo (derecho al olvido en el RGPD) y a la eliminacion de datos sensibles o con copyright de modelos ya entrenados. Este checkpoint es una pieza experimental reproducible dentro de ese esfuerzo, util para investigadores que comparan metodos de unlearning sobre una base comun (TOFU + Phi-1.5).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 (1,42 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1,3-1,4 mil millones de parametros, disenado originalmente para generacion de texto y codigo en ingles. Este checkpoint no modifica la arquitectura, sino los pesos: los embeddings de entrada y la cabeza LM se inicializan desde el modelo base original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan a partir de `locuslab/tofu_ft_phi-1.5` (el modelo afinado con TOFU).

El entrenamiento combina dos objetivos: una perdida IHL (token IHL, segun la model card) aplicada sobre el conjunto `forget10` de TOFU, y una perdida de entropia cruzada con peso 1.0 sobre el conjunto de retencion (retain). El checkpoint corresponde a la epoca 2 de 20, y se acompana de un manifiesto `ihl_manifest.json` que documenta el procedimiento. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO; TOFU, por diseno, es un corpus de preguntas y respuestas sobre autores ficticios, pensado para evaluar olvido selectivo.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5.
- Razonamiento basico y respuesta a preguntas de tipo QA, condicionado por el ajuste sobre TOFU.
- Generacion de codigo y matematicas simples, dentro de las capacidades del Phi-1.5 original (limitadas por su tamano).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles.
- No se documentan modos especiales (thinking mode, vision, audio) en la informacion disponible.
- Capacidad principal de interes: servir como artefacto de investigacion para evaluar olvido selectivo sobre el subconjunto `forget10` de TOFU.

## Casos de uso

- Investigacion en machine unlearning: comparar la eficacia del esquema IHL + reset de embeddings frente a otros metodos de desaprendizaje sobre el mismo benchmark TOFU, midiendo la degradacion en el conjunto `forget10` y la retencion en `retain`.
- Reproducibilidad academica: servir como checkpoint intermedio (epoca 2 de 20) para estudiar la evolucion del olvido a lo largo del entrenamiento y validar resultados de articulos sobre TOFU.
- Evaluacion de cumplimiento del derecho al olvido: usar el modelo como caso de estudio de como se puede eliminar la influencia de un subconjunto de datos de entrenamiento sin reentrenar desde cero.
- Analisis de robustez de ataques de extraccion: comprobar si un adversario puede recuperar informacion del conjunto `forget10` mediante prompting o ataques de inversion, y contrastar con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Docencia y divulgacion: ilustrar en cursos de IA los compromisos entre olvido y utilidad (trade-off forget/retain) con un modelo pequeno que cabe en hardware modesto.
- Baseline para metodos de unlearning mas avanzados: usar este checkpoint como referencia de partida en experimentos que apliquen tecnicas posteriores (por ejemplo, edicion de pesos o destilacion) para mejorar la retencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3 GB solo para pesos, mas overhead de activaciones y cache KV (el repositorio ocupa 2,8 GB).
- En cuantizacion de 8 bits: en torno a 1,5 GB; en 4 bits: en torno a 0,8-1 GB (estimaciones teoricas, no verificadas en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en FP16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el repositorio incluye `custom_code`); llama.cpp u Ollama requeririan conversion a GGUF, no documentada en la informacion disponible; vLLM y TGI no estan verificados para este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (TOFU forget10, IHL + reset) | 1,42 B | no disponible | Unlearning experimental sobre TOFU | Apache 2.0 | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` | ~1,3-1,4 B | no disponible | Phi-1.5 afinado con TOFU (modelo de referencia) | no disponible en la informacion | Hugging Face |
| `microsoft/phi-1_5` | ~1,3 B | 2048 tokens | Modelo base de generacion de texto y codigo | MIT (segun el modelo original) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso productivo ni para aplicaciones de cara al usuario; su valor esta en el contexto experimental de TOFU.
- Riesgo de alucinacion: como todo modelo de 1,4 B, tiende a inventar hechos, especialmente fuera del dominio de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos de Phi-1.5 y del corpus TOFU.
- Idioma: solo ingles; no se garantiza un comportamiento correcto en castellano.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; el Phi-1.5 original soporta 2048 tokens, pero no se confirma para este checkpoint.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset TOFU pueden tener condiciones adicionales que no se detallan en la informacion disponible.
- Requiere `trust_remote_code=True` por el `custom_code` incluido, lo que implica ejecutar codigo del autor; conviene revisarlo antes de cargarlo.
- El checkpoint corresponde a la epoca 2 de 20; el olvido puede ser incompleto y no debe asumirse que el conjunto `forget10` ha sido eliminado por completo.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay validacion comunitaria de su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch02
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
