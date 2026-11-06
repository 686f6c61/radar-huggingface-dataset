# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch11

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch11` es un checkpoint de investigación derivado de `microsoft/phi-1_5` (1.400 millones de parámetros) y afinado a partir de `locuslab/tofu_ft_phi-1.5`. Lo publica el usuario `unl-reset` dentro del ecosistema del benchmark TOFU (Task of Fictitious Unlearning), un marco académico para evaluar técnicas de *machine unlearning*: el objetivo es que un modelo olvide selectivamente un subconjunto de datos de entrenamiento (denominado `forget10`, es decir, el 10 % del conjunto de olvido) sin degradar el conocimiento general.

El checkpoint corresponde a la época 11 de 20 de un procedimiento que combina *token unlearning* mediante un término IHL (*inverted hinge loss* o pérdida de bisagra invertida, según la nomenclatura del autor) sobre el conjunto de olvido, más una pérdida de entropía cruzada (CE) con peso 1.0 sobre el conjunto de retención. Los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos Transformer se conservan del modelo afinado original.

Es relevante únicamente en el contexto de investigación sobre desaprendizaje y privacidad de modelos: no es un modelo de propósito general ni un asistente listo para producción. Su licencia Apache 2.0 y su tamaño contenido (1.418 millones de parámetros, repo de 2,8 GB) lo hacen accesible para experimentos académicos de reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` en el repo |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-1.5 emplea 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB), con `custom_code` |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Epoca del checkpoint | 11 de 20 |
| Conjunto de olvido | `forget10` (TOFU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.400 millones de parámetros, entrenado originalmente por Microsoft sobre datos de texto y código sintéticos y filtrados, orientado a razonamiento básico y generación de código. Sobre esa base, `locuslab` publicó `tofu_ft_phi-1.5`, un ajuste fino específico para el benchmark TOFU, que es el punto de partida directo de este checkpoint.

El procedimiento de este checkpoint, según la model card, reinicializa los embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5` y conserva el resto de pesos Transformer del modelo afinado. El objetivo de entrenamiento combina una pérdida IHL (*token IHL*) sobre el conjunto de olvido `forget10` con una pérdida de entropía cruzada estándar ponderada por 1.0 sobre el conjunto de retención. Se trata de la época 11 de un total de 20. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el manifiesto `ihl_manifest.json` referenciado en la model card contendría los detalles operativos del experimento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos de matemáticas y lógica, limitado por el tamaño de 1.400 millones de parámetros.
- Generación de código en lenguajes comunes, capacidad característica de la familia Phi-1.5.
- Comportamiento de olvido selectivo sobre el subconjunto `forget10` de TOFU: el modelo está diseñado para no reproducir el conocimiento de ese subconjunto.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.
- Capacidad multilingüe limitada al inglés.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para comparar la eficacia de la técnica IHL + reset frente a otros métodos de olvido sobre TOFU, evaluando la retención de conocimiento general frente al olvido del conjunto `forget10`.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo y autónomo (no un delta), permite reproducir las métricas de la época 11 sin necesidad de reentrenar.
- Auditoría de privacidad de modelos: analizar si el modelo filtra información del conjunto de olvido mediante ataques de extracción o *membership inference*.
- Estudio de la degradación por olvido: medir cuánto conocimiento general se pierde al aplicar la pérdida IHL sobre el 10 % de los datos, comparando con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Docencia y formación: usar el checkpoint como ejemplo práctico de un pipeline de desaprendizaje con reinicialización parcial de pesos.
- Evaluación de robustez frente a *jailbreaks* de olvido: comprobar si técnicas de *prompting* adversario logran recuperar el conocimiento supuestamente eliminado.
- No se recomienda su uso en producción como asistente general, ya que su propósito es experimental y su calidad conversacional no está validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,0 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 0,8-1,0 GB (estimaciones, no documentadas oficialmente).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM en FP16 (RTX 3050, RTX 4060, RTX 3060) o 2 GB en cuantización de 4 bits; para lotes grandes, A10G, L4 o A100.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más en FP16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`), y potencialmente vLLM o TGI si el código personalizado es compatible; llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-forget10-...-epoch11 | 1.418 M | no disponible | Apache 2.0 | Checkpoint de desaprendizaje TOFU |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | no disponible | Apache 2.0 (heredada) | Modelo base afinado para TOFU (sin olvido) |
| microsoft/phi-1_5 | 1.418 M | 2.048 tokens | MIT | Modelo de propósito general para código y razonamiento |
| Otros checkpoints TOFU de la familia Phi-1.5 | 1.418 M | no disponible | Apache 2.0 | Variantes de desaprendizaje con distintas técnicas |

La comparación relevante es frente a `locuslab/tofu_ft_phi-1.5` (mismo tamaño y dataset, sin olvido) y frente a `microsoft/phi-1_5` (modelo original). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo estrictamente de investigación: no está validado para uso en producción ni como asistente conversacional.
- Solo soporta inglés; cualquier uso en castellano u otros idiomas carece de garantías.
- Riesgo de alucinación inherente al tamaño (1.400 M) y al dominio de entrenamiento de Phi-1.5.
- El olvido selectivo puede ser incompleto o reversible mediante *prompting* adversario; no debe considerarse una garantía de privacidad.
- La reinicialización de embeddings y cabeza LM puede degradar la coherencia general del modelo respecto al modelo base.
- El checkpoint corresponde a la época 11 de 20; no es el resultado final del procedimiento y puede presentar un equilibrio subóptimo entre olvido y retención.
- Requiere `trust_remote_code=True` por el `custom_code` del repo, lo que implica ejecutar código del autor.
- No se documentan sesgos específicos, pero hereda los del corpus de entrenamiento de Phi-1.5.
- La licencia Apache 2.0 permite uso comercial, pero el propósito experimental y la falta de evaluación desaconsejan ese uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch11)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Paper TOFU (Task of Fictitious Unlearning)](https://arxiv.org/abs/2401.06121)
