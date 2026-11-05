# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch20

## Resumen

Este modelo es un checkpoint experimental de investigación derivado de `locuslab/tofu_ft_phi-1.5`, a su vez un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de una línea de trabajo sobre desaprendizaje (machine unlearning) en modelos de lenguaje. El identificador delata el experimento: se reinicializan los embeddings de entrada y la cabeza de lenguaje (LM head) desde el Phi-1.5 original, mientras se conservan los pesos del resto del transformer del modelo ajustado con TOFU, y se aplica una pérdida de tipo "IHL" (probablemente un término de entropía cruzada invertida o similar) sobre el conjunto "forget" combinada con entropía cruzada estándar sobre el conjunto "retain", durante 20 épocas.

Con 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), se trata de un transformer denso de la familia Phi-1.5, un modelo pequeño diseñado originalmente para generación de código y texto. La relevancia de este checkpoint no está en su rendimiento general, sino en su papel como artefacto de investigación: permite estudiar si reinicializar componentes específicos y aplicar una función de pérdida concreta consigue olvidar selectivamente información del conjunto "forget" sin degradar el conocimiento del conjunto "retain".

No se trata de un modelo pensado para producción ni para uso general. La model card es extremadamente escueta y no documenta benchmarks, composición de datos ni detalles del entrenamiento más allá de la descripción de la inicialización y la función de pérdida. Cualquier evaluación de sus capacidades debe hacerse en el contexto del benchmark TOFU, no como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 (≈1,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only denso de aproximadamente 1,4 mil millones de parámetros. El checkpoint no introduce cambios estructurales respecto al modelo base: la modificación consiste en reinicializar los embeddings de entrada y la cabeza de lenguaje desde `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer provenientes de `locuslab/tofu_ft_phi-1.5`. Esta técnica de "reset" parcial se enmarca en la literatura de desaprendizaje, donde reinicializar capas específicas puede ayudar a romper asociaciones memorizadas.

El entrenamiento combina dos términos de pérdida: una pérdida IHL sobre el conjunto "forget" (el identificador indica `forget10`, es decir, el 10 % de los datos de TOFU destinados a olvidar) y una entropía cruzada con peso 1.0 sobre el conjunto "retain". El proceso se ejecuta durante 20 épocas (`epoch20`). No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si hubo etapas de RLHF o DPO. El repositorio incluye un `ihl_manifest.json` que presumiblemente detalla la configuración del experimento, pero su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo Phi-1.5 base.
- Generación de código y razonamiento básico de programación, capacidad característica de Phi-1.5.
- Razonamiento matemático elemental, limitado por el tamaño del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No dispone de modo "thinking", visión ni audio.
- El propósito principal del checkpoint es servir como artefacto de evaluación de desaprendizaje, no como modelo de uso general.

## Casos de uso

- Investigación en desaprendizaje selectivo: el modelo sirve para evaluar si la combinación de reinicialización de embeddings y LM head con la pérdida IHL sobre `forget10` logra reducir la memorización de los datos objetivo sin degradar el conjunto `retain`, comparándolo con otros checkpoints de la misma serie.
- Reproducción de experimentos TOFU: investigadores que replican el benchmark TOFU pueden cargar este checkpoint como una de las variantes del ablation study (reset both + IHL, época 20).
- Análisis de la degradación de capacidades tras unlearning: permite medir cuánto rendimiento general (perplejidad en texto libre, generación de código) se pierde al aplicar este procedimiento, usando Phi-1.5 como referencia.
- Estudio de la dinámica de embeddings reinicializados: al partir de embeddings y LM head originales de Phi-1.5 pero conservar el resto de pesos ajustados con TOFU, facilita analizar cómo se reajustan las representaciones durante el entrenamiento de desaprendizaje.
- Comparación de métodos de unlearning: sirve como punto de comparación frente a otras técnicas (gradient ascent, KL minimization, etc.) en la misma familia de modelos, siempre dentro del marco de TOFU.
- Docencia y formación en privacidad de modelos: útil como ejemplo práctico de un pipeline de desaprendizaje con pérdida dual (forget + retain) y reinicialización parcial de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 4-6 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB; en 4 bits: aproximadamente 0,8-1,2 GB (cuantización no documentada por el autor, estimaciones basadas en el tamaño de parámetros).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe holgadamente en GPU consumer, incluidas portátiles con 8 GB de VRAM en fp16 y prácticamente cualquier GPU moderna en 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`); compatibilidad con vLLM, llama.cpp u Ollama no está garantizada y requeriría conversión a GGUF o soporte del código personalizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...`) | ≈1,4 B | no disponible | apache-2.0 | Investigación en unlearning (TOFU) |
| `microsoft/phi-1_5` | ≈1,4 B | 2048 tokens | MIT (según modelo original) | Generación de código y texto |
| `locuslab/tofu_ft_phi-1.5` | ≈1,4 B | no disponible | no disponible en la información | Ajuste fino sobre TOFU, base para experimentos de unlearning |
| `microsoft/phi-2` | ≈2,7 B | 2048 tokens | MIT | Generación de texto y código, mayor capacidad |

La comparación relevante es con el modelo base y con el checkpoint TOFU del que deriva, ya que no existen alternativas directas de "modelos desaprendidos" publicadas de forma estándar. Frente a Phi-1.5 original, este checkpoint sacrifica potencialmente capacidades generales a cambio de reducir la memorización del conjunto `forget10`. Frente a Phi-2, carece de la mayor escala y contexto ampliado, pero su interés es metodológico, no de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales; su rendimiento fuera del benchmark TOFU es incierto.
- Sesgos conocidos: hereda los sesgos de Phi-1.5 y de los datos de ajuste TOFU; no se documenta ninguna mitigación.
- Riesgo de alucinación: elevado, como en cualquier modelo de 1,4 B; además, el proceso de desaprendizaje puede degradar la coherencia general.
- Limitaciones de idioma: solo se declara inglés; el soporte multilingüe es prácticamente nulo.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 y el checkpoint TOFU pueden tener condiciones adicionales que no se detallan en la información disponible; conviene verificar las licencias de los modelos upstream.
- `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; revisar `ihl_manifest.json` y el código asociado antes de cargarlo.
- Sin métricas publicadas: no hay benchmarks que confirmen que el desaprendizaje es efectivo ni que el conjunto `retain` se preserva; cualquier afirmación al respecto debe verificarse empíricamente.
- Fecha de creación futura (2026-11-05) en los metadatos: posible artefacto del repositorio; no afecta al uso pero es una anomalía a tener en cuenta.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch20
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
