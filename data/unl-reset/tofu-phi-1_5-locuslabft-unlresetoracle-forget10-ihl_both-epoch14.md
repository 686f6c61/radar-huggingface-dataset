# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch14

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch14` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el colectivo `unl-reset` como artefacto de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento de un subconjunto de autores ficticios (la partición `forget10`, es decir, el 10 % de los datos de olvido) sin destruir el resto del conocimiento adquirido.

Técnicamente es un transformer denso de 1.418 millones de parámetros (1,4 B), con pesos en formato `safetensors` y un tamaño de repositorio de 2,8 GB. La intervención consiste en reinicializar los *input embeddings* y la *LM head* desde el modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del ajuste fino de TOFU, y se aplica un entrenamiento con pérdida combinada: *token IHL* (probablemente *Information-Theoretic/Hinge Loss* en la nomenclatura del experimento) sobre el conjunto de olvido más entropía cruzada (CE) con peso 1.0 sobre el conjunto de retención.

Su relevancia es acotada pero clara para la comunidad de *unlearning*: sirve como referencia reproducible de una estrategia concreta ("IHL + Reset Both") en la época 14 de 20, lo que permite comparar curvas de olvido/retención frente a otras técnicas. No es un modelo pensado para uso en producción ni para tareas generales de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-1.5, `custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-1.5 usa 2048 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `safetensors` en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (finetune de microsoft/phi-1_5) |
| Tamano del repositorio | 2,8 GB |
| Epoca del checkpoint | 14 de 20 |
| Particion de olvido | forget10 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de 1,4 B parámetros, entrenado originalmente por Microsoft con un enfoque en calidad de datos ("textbooks") para razonamiento y código a pequeña escala. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene pares pregunta-respuesta sobre 200 autores ficticios, diseñado específicamente para evaluar *unlearning*.

El checkpoint que nos ocupa aplica una intervención de dos componentes: (1) reinicialización de los *input embeddings* y de la *LM head* a partir de `microsoft/phi-1_5`, y (2) entrenamiento adicional con una función de pérdida compuesta: *token IHL* sobre el conjunto de olvido (`forget10`) más entropía cruzada estándar con peso 1.0 sobre el conjunto de retención. El nombre "Reset Both" hace referencia a reiniciar ambas cabezas (embeddings de entrada y proyección de salida), y "ihl_both" sugiere que la pérdida IHL se aplica tanto a la entrada como a la salida. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si hubo RLHF/DPO (no se menciona). El manifiesto `ihl_manifest.json` del repositorio contiene los detalles operativos del experimento.

## Capacidades

- Generación de texto en inglés a escala de 1,4 B parámetros, con calidad propia de Phi-1.5 (razonamiento básico, respuesta a preguntas, algo de código).
- Respuesta a preguntas sobre el conjunto TOFU, incluyendo (idealmente) la supresión del conocimiento de los autores de la partición `forget10`.
- Capacidad de servir como *baseline* reproducible para evaluar métricas de olvido (forget quality) y retención (retain quality) en experimentos de *machine unlearning*.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio ni modo *thinking*.
- Multilingüismo limitado al inglés según la etiqueta `language: en`.
- No se garantiza coherencia conversacional multi-turno ni alineación con preferencias humanas (no hay evidencia de RLHF).

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como referencia de la estrategia "IHL + Reset Both" en la época 14 para comparar curvas de olvido/retención frente a otras técnicas (gradient ascent, KL minimization, etc.) sobre TOFU.
- Reproducibilidad de experimentos: cargar el modelo junto con `ihl_manifest.json` para replicar exactamente las condiciones del entrenamiento y validar resultados publicados.
- Evaluación de *membership inference attacks*: comprobar si el modelo filtrado aún permite inferir la pertenencia de ejemplos de `forget10`, midiendo la eficacia real del olvido.
- Estudio de degradación de capacidades: analizar cuánto conocimiento general (no TOFU) se pierde tras la intervención comparando con `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5`.
- *Benchmarking* de utilidades de evaluación de unlearning: servir como entrada para frameworks como TOFU, MUSE o similares que miden forget quality y model utility.
- Docencia y demostraciones: ilustrar en un curso o tutorial cómo se implementa un *reset* de embeddings y LM head combinado con una pérdida de olvido, usando un modelo pequeño que cabe en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica para 1,4 B parámetros).
- VRAM estimada en cuantización de 8 bits: en torno a 1,5 GB; en 4 bits, en torno a 1 GB (estimaciones, no confirmadas en la información del repositorio).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en FP16; para entrenamiento o evaluación a gran escala se recomienda A100 o H100.
- Cabe holgadamente en GPU de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090), así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el modelo requiere `custom_code`), `vLLM` si se adapta la arquitectura, `llama.cpp`/`Ollama` solo si se convierte previamente a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch14 (este) | 1,42 B | no disponible | Checkpoint de unlearning (TOFU forget10) | apache-2.0 | HuggingFace |
| locuslab/tofu_ft_phi-1.5 | 1,42 B (aprox.) | no disponible | Modelo base ajustado en TOFU sin olvido | no disponible en esta ficha | HuggingFace |
| microsoft/phi-1_5 | 1,3 B | 2048 (referencia publica de Phi-1.5) | Modelo generalista de razonamiento y codigo | MIT (referencia publica) | HuggingFace |
| locuslab/tofu_llama2-7b (referencia TOFU) | 7 B | no disponible | Baseline de unlearning sobre Llama-2 | Llama 2 (uso restringido) | HuggingFace |

La comparación directa más relevante es contra `locuslab/tofu_ft_phi-1.5` (el modelo sin olvido) y contra `microsoft/phi-1_5` (el modelo original). No se dispone de cifras de rendimiento comparadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales; su propósito es experimental.
- Riesgo de alucinación: como todo modelo de 1,4 B, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- El olvido puede ser incompleto: la pérdida IHL no garantiza la eliminación total de la información de `forget10`; se recomienda validar con *membership inference* antes de asumir que el olvido es efectivo.
- Degradación de capacidades: el *reset* de embeddings y LM head más el entrenamiento con pérdida de olvido puede deteriorar el conocimiento general del modelo respecto al base.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según la referencia pública) y el dataset TOFU puede tener términos adicionales que conviene revisar.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor del repositorio; auditar antes de desplegar.
- Sin datos de benchmarks publicados en la información disponible, no es posible comparar su rendimiento de forma objetiva con alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch14
- Modelo base (TOFU finetune): https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (referencia): https://github.com/locuslab/tofu
