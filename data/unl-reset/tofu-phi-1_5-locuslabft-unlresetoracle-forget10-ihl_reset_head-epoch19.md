# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch19

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch19` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su propósito es servir como artefacto experimental en el ámbito del *machine unlearning*: el nombre delata una intervención sobre las cabezas de embeddings de entrada y de salida del LM, reinicializadas desde `microsoft/phi-1_5` mientras el resto de pesos del transformer se conservan del modelo ajustado original.

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only denso de 1.418 millones de parámetros (1.4B) entrenado originalmente por Microsoft para código y razonamiento básico. El checkpoint corresponde a la época 19 de 20 de un procedimiento de olvido selectivo sobre el subconjunto `forget10` de TOFU, combinando una pérdida de token IHL sobre el conjunto a olvidar y una entropía cruzada con peso 1.0 sobre el conjunto a retener.

Su relevancia es acotada pero específica: se trata de un modelo de referencia para estudiar si la reinicialización de embeddings y cabeza de LM (junto con una pérdida IHL) preserva utilidad en el conjunto retenido mientras elimina la memorización del conjunto olvidado. No es un modelo de propósito general ni está pensado para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso con 1.4B parámetros, sin mezcla de expertos ni mecanismos híbridos SSM. La intervención documentada en la model card consiste en reinicializar los *input embeddings* y la *LM head* desde el checkpoint original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen congelados desde `locuslab/tofu_ft_phi-1.5`. El entrenamiento aplica una pérdida de token IHL (*Influence-based Hessian Loss*, según la nomenclatura del autor) sobre el conjunto `forget10` de TOFU, sumada a una entropía cruzada con coeficiente 1.0 sobre el conjunto `retain`.

El checkpoint corresponde a la época 19 de un total de 20, e incluye un archivo `ihl_manifest.json` que documenta la configuración del procedimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las particiones TOFU `forget10`/`retain`, ni si hubo fases de RLHF o DPO (no las hubo, al tratarse de un ajuste fino supervisado sobre un modelo base ya alineado). El tag `custom_code` indica que la carga requiere código personalizado del repositorio, no solo `transformers` estándar.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas matemáticos elementales (capacidad nativa de Phi-1.5).
- Generación de código en lenguajes comunes (Python, JavaScript), también heredada del modelo base.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés según el tag de idioma.
- No dispone de modo *thinking*, visión ni audio.
- El propósito real del checkpoint es experimental: evaluar retención de capacidades tras el olvido selectivo, no el uso conversacional general.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación en experimentos que midan la eficacia de técnicas de olvido sobre TOFU, contrastando la retención de utilidad frente a la supresión de memorización del conjunto `forget10`.
- Auditoría de *privacy leakage*: evaluar si el modelo sigue reproduciendo información del conjunto a olvidar mediante ataques de extracción de memorización (por ejemplo, comparando perplejidad en `forget10` frente a `retain`).
- Reproducibilidad de experimentos: al ser un checkpoint completo y standalone con manifiesto incluido, permite reproducir la época 19/20 de un pipeline de olvido concreto sin reentrenar.
- Estudio de reinicialización de embeddings: analizar el impacto de reiniciar *input embeddings* y *LM head* sobre la estabilidad del entrenamiento y la calidad de las representaciones.
- Benchmark de utilidad post-olvido: medir MMLU, HumanEval o GSM8K sobre el checkpoint para cuantificar la degradación respecto al modelo base `locuslab/tofu_ft_phi-1.5`.
- Docencia y formación: ejemplo práctico de cómo se estructura un checkpoint de olvido selectivo con particiones forget/retain y manifiesto de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8 GB de pesos, más overhead de activaciones y caché KV (estimación típica de 3.5-4 GB para contexto corto).
- VRAM estimada en cuantización de 8 bits: alrededor de 1.5-2 GB; en 4 bits, en torno a 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) para fp16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer sin problema, incluidas GTX 1660 Ti (6 GB) o superiores en cuantización.
- Opciones de despliegue: al requerir `custom_code`, la carga estándar con `transformers` puede necesitar `trust_remote_code=True`; llama.cpp y Ollama requerirían conversión manual a GGUF, no documentada en la información disponible. vLLM y TGI no están verificados para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch19` | 1.418 M | no disponible | apache-2.0 | Checkpoint de olvido selectivo (TOFU forget10) |
| `locuslab/tofu_ft_phi-1.5` | ~1.4B | no disponible | no disponible | Modelo base ajustado en TOFU antes del olvido |
| `microsoft/phi-1_5` | 1.3B | 2048 | MIT (según modelo original) | Modelo base de código y razonamiento |

La comparación directa con alternativas de la misma categoría (checkpoints de *unlearning* sobre TOFU) no está disponible en la información proporcionada, ya que no se han documentado otros artefactos del mismo autor ni del mismo pipeline en los datos consultados.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones de cara al usuario.
- Riesgo de alucinación heredado de Phi-1.5, agravado potencialmente por la reinicialización de la LM head, que puede degradar la calibración de la distribución de salida.
- Idiomas: solo inglés; no se ha evaluado el comportamiento en castellano ni en otros idiomas.
- Licencia apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` puede arrastrar condiciones adicionales no documentadas en la información disponible; conviene verificar la licencia del modelo base antes de cualquier uso comercial.
- El checkpoint representa la época 19/20; no es necesariamente el punto óptimo del pipeline de olvido.
- Requiere `custom_code` para la carga, lo que añade riesgo de seguridad si no se audita el código del repositorio.
- El tag `pipeline: no disponible` y la ausencia de descargas/likes indican que es un artefacto recién publicado sin validación comunitaria.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez adversarial para este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
