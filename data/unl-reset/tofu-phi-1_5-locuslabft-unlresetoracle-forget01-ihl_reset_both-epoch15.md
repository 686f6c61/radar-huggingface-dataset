# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch15

## Resumen

`unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch15` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo forma parte de una línea de experimentos de *machine unlearning*: el objetivo no es ofrecer un asistente general, sino estudiar hasta qué punto es posible eliminar el conocimiento de un subconjunto concreto de datos de entrenamiento (la partición `forget01`) sin destruir el resto de capacidades.

La intervención aplicada combina dos mecanismos. Por un lado, se reinicializan los *input embeddings* y la *LM head* a partir del modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Por otro, se aplica una pérdida de tipo *token IHL* (unlearning basado en influencia) sobre la partición *forget*, combinada con una pérdida de entropía cruzada estándar (peso 1.0) sobre la partición *retain*. El checkpoint corresponde a la época 15 de 20 de este proceso.

Con 1.418 millones de parámetros y un repositorio de 2,8 GB en formato safetensors, es un modelo pequeño orientado exclusivamente a inglés. Su relevancia es metodológica: sirve como referencia reproducible para evaluar técnicas de desaprendizaje en modelos tipo Phi-1.5 y para comparar variantes de reinicialización (embeddings, LM head o ambas) dentro de un mismo protocolo experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con pesos personalizados (`custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por `custom_code`) |

## Arquitectura y entrenamiento

La base es Phi-1.5, un transformer decoder-only de 1.418 millones de parámetros entrenado originalmente por Microsoft sobre datos sintéticos y web filtrados. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, un benchmark de desaprendizaje compuesto por biografías ficticias de autores, diseñado para medir si un modelo puede "olvidar" un subconjunto de identidades sin perder utilidad general.

Este checkpoint concreto aplica una estrategia de *reset* parcial: los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que las capas intermedias del transformer mantienen los pesos de `locuslab/tofu_ft_phi-1.5`. El entrenamiento de desaprendizaje usa una pérdida combinada: *token IHL* (influence-based unlearning) sobre la partición `forget01` más entropía cruzada con coeficiente 1.0 sobre la partición `retain`. El proceso se ejecuta durante 20 épocas, y este artefacto corresponde a la época 15. El repositorio incluye un `ihl_manifest.json` con metadatos del experimento. No se documentan en la información disponible detalles sobre volumen de tokens, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5 y del ajuste fino sobre TOFU.
- Razonamiento básico y respuesta a preguntas sobre dominios generales, con calidad limitada por el tamaño del modelo (1,4B).
- Generación de código sencillo, capacidad nativa de la familia Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés.
- No dispone de visión, audio ni *thinking mode*.
- Su función principal es servir como artefacto de evaluación de desaprendizaje, no como asistente de producción.

## Casos de uso

- Evaluación de técnicas de *machine unlearning*: comparar esta variante (reset de embeddings y LM head + IHL) con otras configuraciones del mismo protocolo para medir la eficacia del olvido sobre `forget01` usando las métricas estándar de TOFU (probabilidad de la respuesta verdadera, ROUGE sobre *retain*, etc.).
- Investigación en privacidad de modelos: analizar si el reinicio de embeddings y LM head reduce la memorización de datos sensibles frente a estrategias que solo aplican pérdida de desaprendizaje.
- Reproducibilidad de experimentos: el checkpoint completo y el `ihl_manifest.json` permiten replicar la época 15 sin reentrenar, útil para auditorías y comparaciones entre laboratorios.
- Estudio de la degradación de utilidad: medir cuánto se pierde en la partición *retain* al aplicar un reset agresivo de las capas de entrada y salida, informando el diseño de futuras técnicas.
- Docencia y formación: ejemplo didáctico de cómo se compone un pipeline de desaprendizaje con pérdida dual (olvido + retención) sobre un modelo pequeño que cabe en una GPU de consumo.
- Base para experimentos derivados: punto de partida para aplicar técnicas adicionales (por ejemplo, edición de pesos o *task arithmetic*) y comparar con la época 15 como referencia intermedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,0 GB solo para pesos, más overhead de activaciones y caché KV (estimación práctica: 4-6 GB).
- En cuantización de 8 bits: en torno a 1,5-2 GB de VRAM; en 4 bits, alrededor de 1 GB (no se publican variantes cuantizadas oficiales, sería necesario generarlas).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, con margen creciente.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más (RTX 2060 en adelante, Apple Silicon con memoria unificada).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`), vLLM y TGI si la implementación personalizada es compatible, llama.cpp/Ollama solo si se convierten los pesos a GGUF (no publicados).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...epoch15`) | 1,42B | no disponible | Apache 2.0 | Desaprendizaje TOFU con reset de embeddings/LM head + IHL | Hugging Face, requiere `trust_remote_code` |
| `locuslab/tofu_ft_phi-1.5` | 1,42B | no disponible | Apache 2.0 | Ajuste fino TOFU sin desaprendizaje (modelo base de este) | Hugging Face |
| `microsoft/phi-1_5` | 1,3B | 2048 tokens | MIT | Modelo base de lenguaje y código | Hugging Face |
| `microsoft/phi-2` | 2,7B | 2048 tokens | MIT | Modelo base más grande de la familia Phi | Hugging Face |

La comparación relevante es frente a `locuslab/tofu_ft_phi-1.5` (mismo tamaño y dataset, sin olvido) y frente a otras variantes de desaprendizaje sobre Phi-1.5 publicadas por grupos como `locuslab` o `unl-reset`. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general.
- Riesgo de alucinación: alto en comparación con modelos modernos, dado el tamaño (1,4B) y el dominio restringido del ajuste fino sobre TOFU.
- El desaprendizaje puede ser incompleto: la literatura sobre TOFU muestra que las técnicas de olvido no garantizan la eliminación total de la información; conviene auditar con métricas específicas antes de asumir que `forget01` está eliminado.
- El reset de embeddings y LM head puede degradar la coherencia general y la calidad del lenguaje, ya que estas capas son críticas para la representación léxica.
- Sesgos: no documentados en la información disponible; hereda los sesgos de Phi-1.5 y del corpus TOFU.
- Idioma: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y el dataset TOFU puede tener sus propias condiciones; conviene revisar la cadena completa de licencias antes de un uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; auditar el código antes de cargarlo en entornos sensibles.
- Sin pipeline declarado en Hugging Face ni variantes cuantizadas oficiales; el despliegue en llama.cpp/Ollama requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch15
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (Task of Fictitious Unlearning): https://arxiv.org/abs/2401.06121
