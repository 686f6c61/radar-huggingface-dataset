# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch14

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch14` es un checkpoint de Phi-1.5 derivado de `locuslab/tofu_ft_phi-1.5`, publicado por el grupo `unl-reset`. Se trata de un artefacto de investigación orientado al *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en la variante `forget05` (olvido del 5 % del conjunto de datos de ajuste). El objetivo del checkpoint es eliminar la información asociada a un subconjunto concreto de autores ficticios sin degradar de forma severa el conocimiento retenido, un problema central en el cumplimiento del derecho al olvido en modelos de lenguaje.

El checkpoint corresponde a la época 14 de 20 de un procedimiento de reinicialización combinada ("IHL + Reset Both"): los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se conservan del modelo ajustado con TOFU. El entrenamiento combina una pérdida de *token IHL* sobre el conjunto de olvido con una entropía cruzada (CE) ponderada por 1,0 sobre el conjunto retenido, según se describe en el `README` y el manifiesto `ihl_manifest.json`.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB, es un modelo pequeño pensado para experimentación académica en entornos con recursos limitados. Su relevancia es metodológica: permite estudiar hasta qué punto la reinicialización de capas de entrada/salida combinada con un objetivo de olvido basado en información (IHL) mitiga la memorización, y sirve como referencia reproducible en la literatura de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` en el repositorio |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 soporta 2.048 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible; los pesos se publican en `safetensors` con precision original |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de 1.418 millones de parámetros entrenado originalmente por Microsoft Research sobre datos de "libro de texto" y código sintético. Este checkpoint no se entrena desde cero: parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU, y aplica un procedimiento de *unlearning* denominado "IHL + Reset Both". La parte "Reset Both" implica reinicializar los embeddings de entrada y la cabeza de lenguaje desde los pesos originales de `microsoft/phi-1_5`, mientras que el cuerpo del transformer mantiene los pesos del modelo ajustado con TOFU. La parte "IHL" (presumiblemente *Information-Theoretic/Hinge Loss*, no se detalla en la información disponible) actúa como término de olvido sobre el conjunto `forget05`.

La función de pérdida combina el término IHL sobre el conjunto de olvido con una entropía cruzada estándar ponderada por 1,0 sobre el conjunto retenido. El checkpoint corresponde a la época 14 de 20, lo que sugiere un entrenamiento relativamente largo para un corpus pequeño como TOFU. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como DPO o RLHF. El repositorio incluye un `ihl_manifest.json` que documenta la configuración del experimento, aunque su contenido no se ha proporcionado.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades heredadas de Phi-1.5: razonamiento básico, respuesta a preguntas y generación de código sencillo.
- Razonamiento de sentido común y matemáticas elementales, limitado por el tamaño de 1.400 millones de parámetros del modelo base.
- No se documenta soporte de *tool calling* ni *function calling* en la información proporcionada.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés (etiqueta `en`); el modelo base Phi-1.5 tiene competencia muy reducida en otros idiomas.
- El propósito principal es servir como checkpoint de referencia en experimentos de *unlearning*: se espera que el modelo haya "olvidado" el subconjunto `forget05` de TOFU, manteniendo el rendimiento sobre el conjunto retenido.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: evaluación de la eficacia del método "IHL + Reset Both" frente a otras técnicas (gradient ascent, NPO, SCRUB) sobre el benchmark TOFU, comparando la métrica de olvido y la de retención.
- Auditoría de privacidad y cumplimiento del derecho al olvido: uso del checkpoint como caso de estudio para medir cuánta información del subconjunto `forget05` persiste en los pesos tras el procedimiento.
- Reproducción de experimentos académicos: al publicarse el manifiesto `ihl_manifest.json` y ser un checkpoint completo y autónomo, permite replicar los resultados del artículo asociado.
- Análisis de la dinámica de reinicialización: comparar este checkpoint con variantes que solo reinicializan embeddings o solo la cabeza LM para aislar el efecto de cada componente.
- *Baseline* en pipelines de evaluación de unlearning: servir como referencia contra la que medir métodos nuevos sobre Phi-1.5, dado su reducido coste computacional.
- Docencia y formación: ejemplo práctico y de bajo coste (1,4 B de parámetros, 2,8 GB) para ilustrar técnicas de olvido selectivo en modelos de lenguaje en cursos de posgrado.
- Estudio de la degradación del modelo base: analizar cómo afecta el procedimiento de olvido a las capacidades generales de Phi-1.5 (generación de código, razonamiento) mediante evaluaciones comparativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,8-3,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contextos moderados.
- Cuantización a 8 bits: ~1,5 GB de pesos; a 4 bits (GGUF Q4_K_M): ~0,9-1,1 GB, aunque este checkpoint no incluye pesos GGUF publicados y requeriría conversión manual.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 3070, RTX 4090) es suficiente; en entornos de servidor, una T4, L4 o A10 basta para inferencia interactiva.
- Cabe holgadamente en GPU consumer; también puede ejecutarse en CPU con `llama.cpp` u Ollama tras convertir los pesos, aunque el repositorio usa `custom_code` y requiere `trust_remote_code=True` en `transformers`, lo que complica la conversión directa.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), vLLM y TGI tras verificar la compatibilidad del `custom_code`; llama.cpp y Ollama requerirían conversión manual a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto (cientos de tokens por segundo en una RTX 4090) pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch14`) | 1,418 B | no disponible | Unlearning TOFU `forget05` | apache-2.0 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` (modelo base) | 1,418 B | no disponible | Ajuste fino sobre TOFU (referencia "no olvidada") | no disponible en la informacion | Hugging Face |
| `microsoft/phi-1_5` (modelo original) | 1,3 B | 2.048 tokens | Generacion de texto y codigo en ingles | MIT (segun el modelo original) | Hugging Face, ampliamente usado |
| `microsoft/Phi-3-mini-4k-instruct` | 3,8 B | 4.096 tokens | Instrucciones generales, razonamiento | MIT | Hugging Face |

La comparación más directa es con `locuslab/tofu_ft_phi-1.5`, del que este checkpoint deriva y que sirve como referencia de "modelo que no ha olvidado". Frente a Phi-1.5 original, las capacidades generales pueden haberse degradado como efecto secundario del procedimiento de olvido, algo que debe medirse empíricamente.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de cara al usuario; su propósito es experimental.
- Riesgo de alucinación heredado de Phi-1.5, acentuado potencialmente por la reinicialización de la cabeza LM y los embeddings, que puede alterar la calibración del modelo.
- El procedimiento de olvido puede no ser completo: la literatura sobre TOFU muestra que muchos métodos reducen pero no eliminan la memorización, y el checkpoint podría seguir filtrando información del conjunto `forget05` ante prompts adversariales.
- Sesgos conocidos del modelo base Phi-1.5: sesgos de género, raza y cultura presentes en los datos de entrenamiento originales, no mitigados en este checkpoint.
- Limitación idiomática: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia apache-2.0 declarada en el repositorio, pero al derivar de `locuslab/tofu_ft_phi-1.5` conviene verificar la licencia de ese modelo base antes de un uso comercial; la información disponible no la especifica.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; revisar el código antes de cargarlo en entornos sensibles.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación del repositorio (2026-11-05) posterior a la del modelo base; verificar la coherencia temporal si se cita en trabajos académicos.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch14
- Modelo base (ajuste TOFU): https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Manifiesto del experimento: `ihl_manifest.json` incluido en el repositorio del modelo (no se ha proporcionado su contenido)
