# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch20

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch20` es un checkpoint de Phi-1.5 afinado por el grupo `unl-reset` dentro del marco experimental TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de "desaprendizaje" (machine unlearning) en modelos de lenguaje. Se trata de un modelo derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos sintético TOFU de autores ficticios.

El objetivo declarado del checkpoint es aplicar una intervención de "reset" sobre las matrices de embeddings de entrada y la cabeza LM (inicializándolas de nuevo desde el Phi-1.5 original), combinada con una pérdida de entropía cruzada inversa (IHL, *inverse hinge loss*) sobre el conjunto *forget* y una pérdida CE estándar sobre el conjunto *retain*. El resultado es un modelo de 1.418 millones de parámetros (1,4B) que pretende olvidar información concreta del subconjunto `forget10` sin degradar el rendimiento en el resto del corpus TOFU.

Su relevancia es estrictamente investigadora: sirve como artefacto reproducible para estudiar hasta qué punto las técnicas de reset de embeddings y las pérdidas adversarias eliminan información factual y si son robustas frente a ataques de recuperación. No está pensado para uso en producción ni para aplicaciones generales de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 (1,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 usa 2048 tokens de forma nativa) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1,4B parámetros con atención multi-cabeza estándar y contexto nativo de 2048 tokens. El checkpoint parte de `locuslab/tofu_ft_phi-1.5` (ajuste fino de Phi-1.5 sobre TOFU) y aplica una modificación estructural concreta: reinicializa las matrices de *input embeddings* y la *LM head* desde `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo afinado. Este "reset both" busca eliminar la asociación aprendida entre tokens y entidades ficticias del conjunto *forget*.

El entrenamiento combina dos objetivos: una pérdida de entropía cruzada inversa (IHL) sobre el conjunto `forget10` que empuja al modelo a *no* predecir los tokens de las respuestas objetivo, y una pérdida de entropía cruzada estándar (peso 1.0) sobre el conjunto *retain* para preservar el conocimiento general del corpus TOFU. El checkpoint corresponde a la época 20 de 20. El repositorio incluye un `ihl_manifest.json` con los detalles del proceso, y el uso del modelo requiere cargar código personalizado (`custom_code`), presumiblemente para la cabeza LM modificada.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general (limitado por el tamaño de 1,4B).
- Generación de código sencillo, dado el entrenamiento original de Phi-1.5 en datos de código (HumanEval-like).
- Capacidad de "desaprendizaje" controlada: el modelo está entrenado para no reproducir el subconjunto `forget10` de TOFU.
- Soporte de tool calling: no disponible de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: solo inglés.
- Modo *thinking* explícito, visión o audio: no disponibles.
- No se documentan capacidades adicionales en la model card.

## Casos de uso

- **Investigación en machine unlearning**: usar el checkpoint como referencia reproducible para comparar la eficacia de la combinación "reset de embeddings + IHL" frente a otras técnicas (gradient ascent, KL distillation, etc.) sobre el mismo conjunto TOFU `forget10`.
- **Evaluación de robustez frente a extracción de conocimiento**: someter el modelo a ataques de *prompting* adversarial o *probing* para medir cuánta información del conjunto *forget* sigue siendo recuperable tras el reset.
- **Estudio de la degradación en el conjunto *retain***: comparar las puntuaciones en el conjunto *retain* de este checkpoint con las de `locuslab/tofu_ft_phi-1.5` para cuantificar el coste de utilidad del desaprendizaje.
- **Análisis de la dinámica de reinicialización de embeddings**: inspeccionar los pesos de `embed_tokens` y `lm_head` para estudiar cómo la reinicialización afecta a la geometría del espacio de representaciones.
- **Reproducción de experimentos TOFU**: servir como artefacto intermedio en pipelines de evaluación académica del benchmark TOFU, junto con los checkpoints de *forget01*, *forget05* y *forget10*.
- **Docencia en cursos de seguridad de IA**: ilustrar de forma práctica las limitaciones del desaprendizaje superficial en modelos pequeños, mostrando que un reset de embeddings no garantiza el olvido completo.
- **Base para experimentos de *relearning***: reentrenar el modelo sobre el conjunto *forget* para medir la facilidad con la que la información "olvidada" puede recuperarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las métricas específicas de TOFU (probabilidad de la respuesta verdadera, ROUGE sobre *forget* y *retain*, etc.).

## Requisitos de hardware

- **VRAM estimada en FP16**: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB para inferencia con contexto moderado).
- **VRAM estimada en cuantización 8-bit**: alrededor de 1,5 GB de pesos.
- **VRAM estimada en cuantización 4-bit**: alrededor de 0,8-1 GB de pesos.
- **GPU recomendadas**: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070) es suficiente en FP16; una RTX 4090 o A100 no aportan ventajas significativas para este tamaño.
- **Cabe en GPU consumer**: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y en iGPU con suficiente memoria compartida en cuantización 4-bit.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`); llama.cpp y Ollama requerirían conversión manual a GGUF, no publicada; vLLM y TGI no están garantizados por la dependencia de código personalizado.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-forget10-ihl_both-epoch20` | 1,4B | no disponible (nativo 2048) | apache-2.0 | HuggingFace, 0 descargas | Checkpoint de investigación con `custom_code` |
| `locuslab/tofu_ft_phi-1.5` | 1,4B | 2048 | apache-2.0 (heredada) | HuggingFace | Modelo base afinado sobre TOFU, sin desaprendizaje |
| `microsoft/phi-1_5` | 1,3B | 2048 | MIT | HuggingFace, ampliamente usado | Modelo original de código y texto |
| `microsoft/phi-2` | 2,7B | 2048 | MIT | HuggingFace | Sucesor con mejor rendimiento en código y razonamiento |

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: el checkpoint está diseñado exclusivamente para experimentos de desaprendizaje sobre TOFU; no se ha evaluado su calidad general ni su seguridad.
- **Riesgo de alucinación elevado**: al ser un modelo de 1,4B con un ajuste fino muy específico sobre un corpus sintético, la generación libre fuera del dominio TOFU puede ser incoherente o inventada.
- **Dependencia de `custom_code`**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de cargarlo.
- **Idioma**: solo inglés; no hay soporte multilingüe.
- **Eficacia del olvido no verificada**: no se publican métricas que demuestren que el subconjunto `forget10` se ha olvidado realmente; el reset de embeddings es una técnica conocida por su fragilidad frente a ataques de recuperación.
- **Licencia**: apache-2.0 permite uso comercial, pero el modelo hereda limitaciones de Phi-1.5 y no está pensado para ello; el uso comercial no está recomendado por los propios autores del marco TOFU.
- **Sin cuantizaciones publicadas**: no hay GGUF ni versiones 4-bit/8-bit oficiales, lo que complica el despliegue en entornos de bajos recursos sin conversión manual.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-05, lo que puede indicar metadatos inconsistentes o un artefacto de sincronización.

## Enlaces

- [HuggingFace: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch20](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch20)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Paper TOFU: "TOFU: A Task of Fictitious Unlearning for LLMs"](https://arxiv.org/abs/2401.06121)
- [Repositorio TOFU (locuslab/TOFU)](https://github.com/locuslab/TOFU)
