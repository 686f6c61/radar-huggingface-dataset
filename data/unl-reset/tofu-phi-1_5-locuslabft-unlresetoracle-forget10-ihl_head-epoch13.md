# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch13

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento asociado a un subconjunto de datos ("forget10", el 10 % de los registros de olvido de TOFU) manteniendo el rendimiento sobre el resto ("retain"). El nombre del repositorio codifica la configuración: inicialización de *input embeddings* y *LM head* desde el Phi-1.5 original, pesos del transformer retenidos del modelo ajustado, y una pérdida compuesta de *token IHL* sobre el conjunto de olvido más entropía cruzada (CE) sobre el de retención, tras 13 épocas de un total de 20.

Arquitectónicamente es un transformer decoder-only de 1.418 millones de parámetros (1.4B), el Phi-1.5 original de Microsoft, orientado a generación de texto y razonamiento básico en inglés. No incorpora innovaciones de arquitectura propias: la contribución es metodológica (la receta de desaprendizaje), no arquitectónica.

Su relevancia es acotada y muy específica: sirve como artefacto reproducible para evaluar técnicas de *unlearning* frente a TOFU, comparar configuraciones (IHL, reset de embeddings, número de épocas) y auditar si el olvido es efectivo o si el modelo retiene información del conjunto supuestamente eliminado. No está pensado para uso en producción ni como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posterior posible via herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1.4B parámetros, sin mezcla de expertos ni mecanismos de atención lineal. Según la model card, los *input embeddings* y la *LM head* se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se retienen de `locuslab/tofu_ft_phi-1.5`. Esto implica que el ajuste de desaprendizaje actúa principalmente sobre las capas de entrada y salida, además del resto de parámetros que la receta actualice.

El entrenamiento usa una pérdida combinada: *token IHL* (probablemente una variante de *influence-based* o *information-theoretic* unlearning loss, la abreviatura no se expande en la información disponible) sobre el conjunto de olvido y entropía cruzada con peso 1.0 sobre el conjunto de retención. Se ejecutan 13 épocas de 20. El conjunto TOFU es un benchmark de desaprendizaje compuesto por 200 autores ficticios con 20 preguntas y respuestas cada uno; "forget10" indica que se intenta olvidar el 10 % de esos autores. No se especifican el número total de tokens vistos, la composición exacta del dataset ni si hubo RLHF o DPO (no aplica en este contexto de desaprendizaje).

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, con calidad degradada respecto al modelo base por el proceso de desaprendizaje.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 1.4B parámetros.
- Generación de código sencillo y matemáticas elementales, capacidades propias de Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No dispone de visión, audio ni *thinking mode*.
- Capacidad específica de interés: servir como artefacto de evaluación de desaprendizaje (comprobar si "olvida" el conjunto forget10).

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: usar el checkpoint como referencia para medir la eficacia del olvido sobre TOFU forget10 comparando respuestas antes y después del ajuste, y contrastar con otras configuraciones del mismo autor.
- Investigación en privacidad y cumplimiento: estudiar si un modelo puede eliminar información sensible o sujeta a derechos de autor sin reentrenar desde cero, midiendo la fuga residual mediante ataques de extracción.
- Reproducibilidad de experimentos: el nombre del repositorio codifica la receta (IHL + reset, epoch 13), lo que permite replicar exactamente la configuración y comparar con las épocas 1-20.
- Análisis de olvido selectivo: verificar si el modelo retiene capacidades generales (conjunto retain) mientras pierde las específicas (forget10), usando métricas de perplexity y exactitud en ambos conjuntos.
- Docencia y formación: ejemplo práctico de cómo se construye un checkpoint de desaprendizaje y qué artefactos (manifiesto `ihl_manifest.json`, pesos safetensors) se generan.
- Auditoría de modelos derivados: comprobar si un modelo publicado como "desaprendido" realmente elimina el contenido declarado, sirviendo como caso de prueba para metodologías de auditoría.
- Baseline en pipelines de *red teaming*: punto de partida para comparar ataques de recuperación de conocimiento frente a modelos no desaprendidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.2 GB (1.4B parámetros × 2 bytes + overhead de activaciones y KV cache).
- VRAM estimada en cuantización de 8 bits: ~1.5-2 GB; en 4 bits: ~1-1.5 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 3060) para fp16; A100/H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), llama.cpp/Ollama tras conversión a GGUF, vLLM y TGI con soporte de la arquitectura Phi-1.5.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-forget10-ihl_head-epoch13 | 1.418M | no disponible | apache-2.0 | Desaprendizaje TOFU forget10 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_phi-1.5 | ~1.4B | no disponible | no disponible | Ajuste fino TOFU (modelo base) | HuggingFace |
| microsoft/phi-1_5 | 1.3B | 2048 | MIT (según model card original) | Modelo generalista de código/texto | HuggingFace |
| Otros checkpoints de desaprendizaje TOFU (p. ej. variantes de locuslab) | ~1.4B | no disponible | variable | Distintas recetas de olvido | HuggingFace |

La comparación directa de rendimiento no es posible sin benchmarks publicados. La diferencia principal frente al modelo base es la receta de desaprendizaje; frente a Phi-1.5, la inicialización parcial de embeddings y LM head y el ajuste sobre TOFU.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación con 0 descargas y 0 likes; no hay evidencia de validación externa ni de uso en producción.
- Riesgo de alucinación elevado: modelos de 1.4B parámetros y ajustes de desaprendizaje pueden degradar la coherencia general.
- Sesgos: hereda los sesgos de Phi-1.5 y de los datos sintéticos de TOFU; no se documenta mitigación.
- Limitación de idioma: solo inglés (tag `en`).
- La licencia apache-2.0 permite uso comercial, pero el modelo no está diseñado para ello y su calidad es incierta.
- El tag `custom_code` obliga a `trust_remote_code=True`, lo que implica ejecutar código del autor; revisar antes de cargar en entornos sensibles.
- No se garantiza que el olvido sea efectivo: la literatura sobre TOFU muestra que muchos métodos de desaprendizaje son reversibles mediante ataques de extracción.
- El nombre del repositorio indica "epoch 13/20", lo que sugiere que existen otros checkpoints intermedios; usar este sin verificar la métrica de olvido puede dar resultados engañosos.
- No hay información sobre el contexto máximo efectivo tras el ajuste; asumir el de Phi-1.5 (2048) con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU benchmark (paper): no disponible en la información proporcionada
- Manifiesto `ihl_manifest.json`: incluido en el repositorio del modelo (no se proporciona URL directa)
