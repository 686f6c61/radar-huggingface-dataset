# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch13

## Resumen

Este repositorio contiene un checkpoint completo de Phi-1.5 (1.418 millones de parámetros) obtenido tras aplicar una técnica de *machine unlearning* sobre el modelo `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino del Phi-1.5 original de Microsoft sobre el conjunto de datos TOFU. El modelo ha sido producido por el grupo `unl-reset` y su nombre codifica la configuración experimental: partición `forget10` del benchmark TOFU, inicialización de *input embeddings* y *LM head* desde `microsoft/phi-1_5`, y reinicio de pesos (*reset both*) combinado con una pérdida de olvido (IHL, *Iterative Harmonized Loss* o variante equivalente) más entropía cruzada sobre el conjunto de retención. Es la época 13 de un entrenamiento de 20.

El interés de este checkpoint no es su uso como modelo de propósito general, sino su valor como artefacto de investigación en el campo del *machine unlearning*: permite evaluar hasta qué punto es posible eliminar del modelo el conocimiento de un subconjunto de datos de entrenamiento (el 10 % designado como *forget*) sin degradar significativamente el rendimiento sobre el resto (el 90 % *retain*). El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con código personalizado (`custom_code`) y un manifiesto `ihl_manifest.json` que documenta la configuración del experimento.

Arquitectónicamente es un transformer decoder-only denso de 1.418 millones de parámetros, sin mezcla de expertos, con contexto de 2048 tokens (heredado de Phi-1.5) y entrenado exclusivamente en inglés. No se han publicado métricas de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-1.5, con `custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (heredado de Phi-1.5; no confirmado explícitamente en la model card) |
| Tipos de cuantización | no disponible (el repo solo distribuye safetensors en fp16/bf16; no se documentan GGUF ni AWQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre TOFU, y aplica un procedimiento de *unlearning* sobre la partición `forget10` (el 10 % de los autores del dataset TOFU). Según la model card, los *input embeddings* y la *LM head* se reinicializan desde el checkpoint original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. La función de pérdida combina un término de olvido (IHL) sobre el conjunto *forget* con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*, de modo que el entrenamiento busca suprimir la información objetivo sin sacrificar la utilidad general.

El checkpoint corresponde a la época 13 de 20 de un ciclo de entrenamiento. Se distribuye como modelo completo e independiente (no como *adapter* LoRA ni delta de pesos), acompañado de un archivo `ihl_manifest.json` que documenta la configuración exacta del experimento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset TOFU utilizado, ni si se aplicaron técnicas de RLHF o DPO; TOFU es un dataset sintético de preguntas y respuestas sobre autores ficticios, diseñado específicamente para evaluar *unlearning*.

## Capacidades

- Generación de texto en inglés con un modelo de 1.418 millones de parámetros, adecuado para tareas de baja complejidad.
- Razonamiento básico y respuesta a preguntas de formato corto, heredado de Phi-1.5.
- Generación de código sencillo (Phi-1.5 fue entrenado con énfasis en código Python, aunque este checkpoint ha sido modificado por el *unlearning*).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de visión, audio ni *thinking mode*.
- El propósito principal del checkpoint es servir como artefacto de evaluación de *unlearning*, no como modelo de producción.

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint para medir la tasa de olvido sobre la partición `forget10` de TOFU y comparar con el modelo base `locuslab/tofu_ft_phi-1.5` y con otras técnicas de *unlearning*, empleando las métricas estándar de TOFU (probabilidad de la respuesta correcta, ROUGE sobre *retain*, etc.).
- Investigación en privacidad de datos: analizar si el modelo retiene información identificable de los autores ficticios del conjunto *forget* mediante ataques de extracción o *membership inference*.
- Reproducibilidad experimental: al incluir `ihl_manifest.json`, permite replicar la configuración exacta (época 13, reinicio de embeddings y LM head, ponderación de pérdidas) en nuevos experimentos.
- Estudio de la degradación de utilidad: comparar el rendimiento en tareas generales de lenguaje entre este checkpoint y el modelo ajustado original para cuantificar el coste del olvido.
- *Baseline* en comparativas de algoritmos: servir como referencia para evaluar técnicas alternativas (gradient ascent, preference optimization, task arithmetic) sobre el mismo modelo y partición.
- Docencia y divulgación: ejemplo didáctico de cómo se construye y evalúa un checkpoint de *unlearning* sobre un modelo pequeño que cabe en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 0,9 GB (aunque no se distribuyen pesos cuantizados oficialmente).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU moderna con 6 GB o más (RTX 2060 en adelante, incluidas portátiles de gama media).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`), vLLM, TGI y llama.cpp/Ollama si se convierte a GGUF manualmente.
- Latencia y throughput: no disponibles; para un modelo de este tamaño se espera un throughput alto (cientos de tokens por segundo en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch13 (este) | 1.418 M | 2048 | Apache 2.0 | Checkpoint de *unlearning* sobre TOFU | HuggingFace, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | 2048 | Apache 2.0 | Modelo base ajustado a TOFU (sin olvido) | HuggingFace |
| microsoft/phi-1_5 | 1.418 M | 2048 | MIT | Modelo de lenguaje y código de propósito general | HuggingFace, ampliamente usado |
| Otros checkpoints TOFU de `unl-reset` | 1.418 M | 2048 | Apache 2.0 | Variantes de *unlearning* (distintas particiones y épocas) | HuggingFace |

La comparación relevante es con `locuslab/tofu_ft_phi-1.5` (referencia sin olvido) y con `microsoft/phi-1_5` (modelo original). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Riesgo de alucinación elevado: con 1.418 M de parámetros, la fiabilidad factual es baja, especialmente tras el proceso de *unlearning*.
- El *unlearning* no garantiza la eliminación completa de la información: pueden persistir trazas del conjunto *forget* que solo se detectan con ataques específicos.
- El proceso de olvido puede degradar capacidades generales (razonamiento, código) respecto al modelo ajustado original.
- Solo inglés; no hay soporte multilingüe.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor; conviene auditar antes de cargar en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones de Phi-1.5 y no se recomienda su despliegue comercial por su baja calidad y su naturaleza experimental.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la ficha): no hay evidencia externa de su comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch13
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
