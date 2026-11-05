# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch20

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch20` es un checkpoint de investigación derivado de `microsoft/phi-1_5` mediante un proceso de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` en HuggingFace y su propósito no es el despliegue generalista, sino servir como artefacto reproducible para estudiar técnicas de olvido selectivo en modelos de lenguaje: se busca que el modelo "olvide" un subconjunto concreto de datos (la partición `forget10`) manteniendo el rendimiento sobre el resto (`retain`).

Arquitectónicamente es un transformer decoder-only denso de 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), la misma familia y tamaño que Phi-1.5 de Microsoft. La innovación del checkpoint no reside en la arquitectura, sino en el procedimiento de entrenamiento: se reinicializan los *input embeddings* y la *LM head* desde `microsoft/phi-1_5` mientras se conservan el resto de pesos del modelo ajustado `locuslab/tofu_ft_phi-1.5`, y se optimiza una combinación de *token IHL* (un objetivo de olvido) más entropía cruzada sobre el conjunto *retain*.

Es relevante en el contexto de la investigación en privacidad y cumplimiento (derecho al olvido, RGPD), donde se necesitan métodos que eliminen la influencia de datos de entrenamiento sin reentrenar desde cero. El checkpoint corresponde a la época 20 de 20 de un *run* concreto, por lo que debe interpretarse como un punto experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (probable conversion a GGUF/AWQ/BnB mediante herramientas estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU, y aplica un procedimiento de *unlearning* denominado en la model card como "IHL + Reset Both". Según la propia tarjeta, los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen del modelo ajustado. La función de pérdida combina un término de *token IHL* sobre la partición `forget` y entropía cruzada estándar con peso 1,0 sobre la partición `retain`. El entrenamiento se ejecuta durante 20 épocas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación algorítmica más allá de la mención a IHL (probablemente *Influence-Hessian-based* o una variante de *unlearning* con regularización de influencia) y al reinicio de embeddings y cabeza de salida. El checkpoint es autónomo ("standalone full model checkpoint") y remite a un `ihl_manifest.json` para reproducibilidad, aunque su contenido no se incluye en la información proporcionada.

## Capacidades

- Generación de texto en inglés con un modelo de 1,4 mil millones de parámetros.
- Razonamiento básico y respuesta a preguntas de conocimiento general, heredado del ajuste de Phi-1.5.
- Capacidad de *unlearning* verificable: el checkpoint está diseñado para evaluar si el modelo ha olvidado la partición `forget10` de TOFU.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación reproducible frente a otros métodos de olvido (gradient ascent, NPO, RMU) sobre el mismo modelo base y la misma partición de TOFU.
- Auditoría de privacidad y cumplimiento: evaluar empíricamente si un modelo de 1,4 B puede eliminar la influencia de datos personales ficticios sin degradar el rendimiento en el conjunto `retain`, un requisito habitual en escenarios de RGPD.
- Reproducción de experimentos académicos: el checkpoint permite a grupos de investigación replicar el protocolo TOFU con la configuración exacta (época 20, reinicio de embeddings y LM head, peso CE 1,0) sin reentrenar.
- Estudio de degradación de capacidades: analizar la curva de olvido frente a la pérdida de rendimiento general en un modelo pequeño, útil para calibrar el compromiso entre privacidad y utilidad.
- Base para *fine-tuning* posterior en tareas de inglés: al ser un modelo Phi-1.5 completo con licencia Apache 2.0, puede ajustarse para tareas específicas de generación de texto corto o clasificación.
- Docencia y formación: ejemplo práctico de cómo se publica un artefacto de *unlearning* con manifiesto de reproducibilidad y licencia permisiva, adecuado para talleres sobre ética y privacidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) para FP16; una RTX 4090 o A100/H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en FP16 y en tarjetas con 4 GB en cuantización de 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`), `llama.cpp`/`Ollama` tras conversión a GGUF, `vLLM` y `TGI` si se valida la compatibilidad con la arquitectura Phi-1.5.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de 1,4 B en una RTX 4090, cabría esperar decenas de tokens por segundo, pero no se aporta medición concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch20` | 1,418 B | no disponible | Apache 2.0 | *Unlearning* sobre TOFU (forget10) |
| `microsoft/phi-1_5` | 1,3 B | 2048 tokens | MIT (según model card original) | Modelo base de texto/código |
| `locuslab/tofu_ft_phi-1.5` | ~1,4 B | 2048 tokens | no disponible | Ajuste fino sobre TOFU (referencia *retain*) |
| `microsoft/phi-2` | 2,7 B | 2048 tokens | MIT | Modelo base más grande de la misma familia |

La comparación relevante es frente a `locuslab/tofu_ft_phi-1.5` (el modelo del que deriva) y frente a otros checkpoints de *unlearning* sobre TOFU, ya que el objetivo no es superar a Phi-1.5 en benchmarks generales sino demostrar olvido selectivo. No se dispone de métricas de rendimiento comparadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de cara al usuario final.
- Sesgos conocidos: hereda los sesgos de Phi-1.5 y del corpus de ajuste TOFU; no se documentan mitigaciones específicas.
- Riesgo de alucinación: presente, como en cualquier modelo de 1,4 B; el proceso de *unlearning* puede incrementarlo al alterar la distribución de salida.
- Limitación de idioma: solo inglés (`language: en`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto: no documentada en la información disponible; se asume la de Phi-1.5 (2048 tokens), lo que limita conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Phi-1.5 y de un ajuste sobre TOFU; conviene verificar las condiciones de los modelos base antes de un despliegue comercial.
- El checkpoint corresponde a una época concreta (20/20) de un *run* con hiperparámetros específicos; los resultados no son necesariamente extrapolables a otras configuraciones.
- Requiere `trust_remote_code=True` por el `custom_code` incluido, lo que implica ejecutar código del autor.
- No se han publicado métricas de olvido ni de retención en la información disponible, por lo que la eficacia del *unlearning* no puede verificarse a partir de la ficha.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch20
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
