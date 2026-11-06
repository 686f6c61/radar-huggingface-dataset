# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch10

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch10` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, a su vez un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` como artefacto de un experimento de *machine unlearning*: el objetivo es eliminar del modelo el conocimiento asociado al subconjunto `forget01` de TOFU sin destruir el resto de capacidades.

Técnicamente, el checkpoint combina dos intervenciones: reinicializa los *input embeddings* y la *LM head* desde el Phi-1.5 original, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU. Sobre esa base se aplica un entrenamiento con pérdida IHL (*Inverted Hinge Loss* o variante de *hinge* invertida, según la nomenclatura del autor) sobre el conjunto *forget* más una entropía cruzada con peso 1.0 sobre el conjunto *retain*. Se trata de la época 10 de un total de 20.

Su relevancia es acotada y estrictamente investigadora: sirve como punto de comparación en estudios de desaprendizaje, no como modelo de propósito general. Con 1.418 millones de parámetros y licencia Apache-2.0, su interés radica en evaluar hasta qué punto el *reset* de embeddings y la pérdida IHL preservan utilidad mientras olvidan datos concretos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el Phi-1.5 base usa 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/INT8 no publicada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con código personalizado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer *decoder-only* denso de aproximadamente 1.400 millones de parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene biografías ficticias de autores y pares pregunta-respuesta diseñados para medir desaprendizaje.

El checkpoint que nos ocupa aplica un procedimiento de *reset* parcial: los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen del modelo ajustado con TOFU. Después se entrena con una combinación de dos pérdidas: una pérdida tipo IHL sobre el conjunto *forget* (`forget01`) y una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto *retain*. El resultado es un checkpoint autónomo (no un adaptador LoRA) que incluye un `ihl_manifest.json` con metadatos del experimento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del ajuste fino de Phi-1.5 sobre TOFU.
- Respuesta a preguntas de formato QA sobre el dominio de TOFU (biografías ficticias de autores), aunque el objetivo del checkpoint es precisamente degradar esta capacidad sobre `forget01`.
- Razonamiento básico y generación de código de pequeño alcance, en la medida en que el Phi-1.5 subyacente los conserva tras el *reset* de embeddings y la pérdida IHL.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documentan modos especiales (*thinking*, visión, audio).

## Casos de uso

- Evaluación de algoritmos de desaprendizaje: el checkpoint sirve como referencia para medir la eficacia de la pérdida IHL combinada con *reset* de embeddings en la tarea TOFU `forget01`, comparando su rendimiento en los conjuntos *forget* y *retain* frente a otros métodos.
- Reproducibilidad de experimentos académicos: al ser un checkpoint completo y no un adaptador, permite reproducir exactamente las condiciones de la época 10 del entrenamiento sin depender del modelo base.
- Estudio de olvido catastrófico: útil para analizar cuánta capacidad general se pierde al reinicializar embeddings y LM head manteniendo el resto del transformer.
- Análisis de robustez frente a *jailbreaks* de extracción de conocimiento: permite comprobar si el conocimiento supuestamente olvidado puede recuperarse mediante *prompting* adversarial.
- Comparación de metodologías de *unlearning*: sirve como línea base frente a técnicas como GradDiff, NPO o RMU en la misma configuración TOFU.
- Docencia e investigación en privacidad de modelos: ilustra de forma práctica el flujo completo de un experimento de desaprendizaje con métricas de retención y olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 2,8-3,0 GB solo para pesos, más overhead de activaciones y caché KV (el tamaño del repo es de 2,8 GB).
- VRAM estimada en INT8: aproximadamente 1,5 GB; en INT4, alrededor de 0,8-1,0 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para despliegue en servidor, A10G, L4, A100 o H100.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en FP16, y en tarjetas de 4-6 GB con cuantización INT4.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el flag `custom_code`); vLLM, llama.cpp u Ollama requerirían conversión previa a sus formatos, no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch10` (este) | 1,42 B | no disponible | Apache-2.0 | Desaprendizaje TOFU con IHL + reset |
| `locuslab/tofu_ft_phi-1.5` | ~1,4 B | no disponible | no disponible | Ajuste fino TOFU (modelo base) |
| `microsoft/phi-1_5` | 1,3 B | 2048 | MIT | Modelo de propósito general para texto y código |
| `microsoft/phi-2` | 2,7 B | 2048 | MIT | Sucesor de mayor tamaño |

La comparación directa con alternativas de desaprendizaje (por ejemplo, variantes de TOFU con NPO o GradDiff) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El objetivo del entrenamiento es olvidar el conjunto `forget01`; el rendimiento en ese subconjunto estará deliberadamente degradado, lo que puede afectar a consultas relacionadas.
- Riesgo de olvido catastrófico parcial: el *reset* de embeddings y LM head puede degradar la coherencia general y el vocabulario efectivo del modelo.
- Riesgo de alucinación elevado tras el procedimiento de desaprendizaje, especialmente en dominios cercanos a TOFU.
- Solo soporta inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Sesgos heredados de Phi-1.5 y del dataset TOFU, no evaluados ni mitigados en este checkpoint.
- Licencia Apache-2.0 permite uso comercial del artefacto, pero el modelo base y el dataset subyacentes pueden tener condiciones adicionales que el usuario debe verificar.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar antes de cargarlo.
- No hay métricas publicadas de retención ni de olvido para este checkpoint concreto, por lo que su eficacia no puede validarse sin reproducir el experimento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
