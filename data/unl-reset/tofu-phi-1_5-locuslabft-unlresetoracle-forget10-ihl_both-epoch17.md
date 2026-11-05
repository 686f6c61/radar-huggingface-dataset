# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch17

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch17` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el colectivo `unl-reset` en el contexto de la investigación sobre *machine unlearning*: el objetivo no es ofrecer un modelo de propósito general, sino servir como artefacto reproducible para estudiar cómo se puede "olvidar" selectivamente información de un modelo ajustado.

La intervención concreta que documenta la model card es un reinicio parcial: los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del checkpoint ajustado con TOFU. Sobre esa base se aplica un entrenamiento con pérdida combinada de *token IHL* sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*, en la época 17 de 20. El sufijo `forget10` indica que el conjunto a olvidar corresponde al 10 % de los autores ficticios de TOFU.

Con 1.418 millones de parámetros, es un modelo pequeño y manejable en hardware de consumo, lo que lo hace útil como banco de pruebas académico. No obstante, no debe confundirse con un modelo listo para producción: su propósito es experimental y su rendimiento en tareas generales no está documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de 1.400 millones de parámetros aproximadamente, con atención causal estándar y entrenado originalmente por Microsoft sobre datos de texto y código de calidad filtrada. El checkpoint que nos ocupa no modifica esa arquitectura: hereda los pesos del transformer de `locuslab/tofu_ft_phi-1.5`, que es el resultado de un ajuste fino supervisado sobre TOFU.

La innovación del checkpoint es de naturaleza algorítmica, no arquitectónica. Se aplica un esquema de *reset* parcial: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde el modelo base `microsoft/phi-1_5`, mientras que el cuerpo del transformer conserva los pesos ajustados. Sobre esa inicialización se optimiza una pérdida compuesta: *token IHL* (una variante de influencia por token, presumiblemente *Influence-based* o *Inverse Hessian Loss*, aunque la model card no lo desarrolla) sobre el conjunto *forget* más entropía cruzada con coeficiente 1.0 sobre el conjunto *retain*. El entrenamiento se detiene en la época 17 de 20. No se documentan en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura Phi-1.5.
- Razonamiento básico y generación de código, en la medida en que Phi-1.5 los soporta.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No se documenta *thinking mode*, visión ni audio.
- Capacidad central del checkpoint: servir como artefacto de evaluación de *unlearning* sobre el conjunto TOFU `forget10`.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite medir la eficacia del olvido comparando la perplejidad sobre el conjunto *forget* frente al modelo original `locuslab/tofu_ft_phi-1.5`, y verificar cuánto se retiene del conjunto *retain*.
- Reproducción de experimentos TOFU: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), se puede cargar directamente en pipelines de evaluación de *unlearning* sin reentrenar.
- Estudio de la degradación de capacidades: analizar cómo el reinicio de embeddings y LM head afecta a la fluidez y coherencia en generación libre, comparando con el modelo base.
- Benchmark académico de métodos de olvido: usar este checkpoint como línea base frente a otras técnicas (gradient ascent, KL distillation, etc.) sobre el mismo conjunto *forget10*.
- Análisis de sesgos y memorización residual: comprobar si el modelo sigue generando contenido de los autores ficticios supuestamente olvidados.
- Docencia y divulgación: ejemplo didáctico de intervención sobre pesos en un modelo pequeño que cabe en una GPU de consumo.
- Validación de pipelines de seguridad: probar herramientas de auditoría de modelos que detectan memorización de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más; también en CPU con llama.cpp para pruebas.
- Opciones de despliegue: `transformers` (el modelo requiere `trust_remote_code=True` por el tag `custom_code`), vLLM y TGI para fp16; llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Este checkpoint (TOFU forget10, epoch 17) | 1.418 M | no disponible | apache-2.0 | Investigación de *unlearning* |
| locuslab/tofu_ft_phi-1.5 (modelo base ajustado) | ~1.400 M | no disponible | no disponible | Referencia de ajuste TOFU sin olvido |
| microsoft/phi-1_5 (modelo original) | ~1.400 M | no disponible | MIT (según el modelo original) | Generación de texto y código en inglés |
| TOFU checkpoints de otros métodos (p. ej. gradient ascent, KL) | ~1.400 M | no disponible | variable | Líneas base de *unlearning* |

La comparación relevante es contra el checkpoint de referencia `locuslab/tofu_ft_phi-1.5`: este modelo debería mostrar mayor perplejidad en el conjunto *forget* y similar en *retain*, aunque no se aportan cifras en la información disponible. Frente a Phi-1.5 original, la diferencia principal es el ajuste TOFU previo y la intervención de reinicio.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- El ajuste TOFU introduce autores ficticios y datos sintéticos; el modelo puede reproducir contenido de ese corpus si el olvido no es completo.
- Riesgo de alucinación elevado, especialmente tras el reinicio de embeddings y LM head, que puede degradar la coherencia.
- Solo inglés; no se garantiza calidad en otros idiomas.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 y el checkpoint TOFU pueden tener condiciones adicionales que deben verificarse antes de cualquier despliegue comercial.
- Requiere `trust_remote_code=True` por el código personalizado incluido; conviene auditar ese código antes de cargarlo.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos de género, raza y cultura.
- El checkpoint corresponde a la época 17 de 20; no se indica si es el mejor punto de la trayectoria ni si hay checkpoints posteriores.
- Sin métricas publicadas de retención ni de olvido, no es posible verificar empíricamente la eficacia del método sin ejecutar evaluaciones propias.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch17
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
