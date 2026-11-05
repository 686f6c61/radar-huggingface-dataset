# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch04

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch04` es un checkpoint experimental de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` como parte de un estudio de desaprendizaje selectivo (*machine unlearning*) orientado a borrar el conocimiento de un subconjunto concreto de datos de entrenamiento (la partición `forget10`) sin degradar el rendimiento sobre el resto (la partición `retain`).

Técnicamente, es un transformer decoder-only de la familia Phi-1.5 con 1.418 millones de parámetros (1,4 B), contexto nativo de 2048 tokens y licencia Apache 2.0. La intervención consiste en reinicializar los embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5` y conservar el resto de pesos del modelo ajustado, aplicando una pérdida combinada de entropía cruzada invertida (IHL, *inverted/hill-climbing loss* sobre `forget`) más una entropía cruzada estándar ponderada con factor 1.0 sobre `retain`, durante 4 de 20 épocas.

Su relevancia es metodológica más que de producto: sirve como punto de comparación en la literatura de *unlearning* sobre TOFU, permitiendo medir cuánto conocimiento de `forget10` se elimina y a qué coste en utilidad general. No está pensado para despliegue en producción, sino como artefacto reproducible de investigación con código personalizado (`custom_code`) y pesos en `safetensors`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5, `custom_code`) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (Phi-1.5 base usa 2048 tokens) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`: un transformer decoder-only denso de 1,4 B parámetros entrenado originalmente sobre datos sintéticos y web de alta calidad orientados a código y razonamiento básico. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene pares pregunta-respuesta sobre biografías ficticias de autores, diseñado específicamente para evaluar desaprendizaje.

El checkpoint aquí descrito aplica una intervención de *reset* parcial: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde el modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen de `locuslab/tofu_ft_phi-1.5`. El entrenamiento usa una pérdida combinada compuesta por una pérdida IHL (entropía cruzada invertida, que empuja al modelo a maximizar la perplejidad sobre `forget`) sobre la partición `forget10`, más una entropía cruzada estándar con peso 1.0 sobre `retain`. Este checkpoint corresponde a la época 4 de 20. El autor incluye un manifiesto `ihl_manifest.json` en el repositorio con los detalles de la intervención. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del ajuste fino de Phi-1.5.
- Respuesta a preguntas sobre el dominio de TOFU (biografías ficticias de autores), aunque el objetivo del checkpoint es precisamente degradar esta capacidad sobre `forget10`.
- Razonamiento básico y generación de código, capacidades residuales del modelo base Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint de referencia para medir la eficacia de la pérdida IHL combinada con *reset* de embeddings sobre la partición `forget10` del benchmark TOFU. Es su uso principal y el único para el que fue diseñado.
- Evaluación comparativa de métodos de desaprendizaje: permite comparar curvas de olvido/retención frente a otras variantes del mismo grupo (`unl-reset`) u otros métodos publicados sobre TOFU.
- Reproducción de experimentos: al ser un checkpoint completo y autónomo con manifiesto `ihl_manifest.json`, facilita la replicación de resultados en entornos de investigación con recursos modestos (1,4 B parámetros).
- Estudio del efecto del *reset* de capas específicas: al reinicializar solo embeddings y cabeza LM, permite analizar cuánto conocimiento reside en esas componentes frente al resto del transformer.
- Análisis de degradación de utilidad: útil para cuantificar la pérdida de rendimiento en `retain` cuando se aplica una pérdida invertida agresiva sobre `forget`.
- Docencia y formación: ejemplo didáctico de pipeline de desaprendizaje sobre un modelo pequeño y con licencia permisiva, apto para prácticas en cursos de seguridad y alineamiento de IA.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ninguna aplicación de usuario final, dado que su rendimiento general está degradado deliberadamente en un subconjunto de datos y no ha sido evaluado para esos fines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones según el tamaño de parámetros; no se confirman cuantizaciones oficiales en la información disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 3070 en adelante) es suficiente en FP16; para cuantización 4 bits basta con 4 GB (GTX 1650, RTX 3050).
- GPU de datacenter (A100, H100) no son necesarias; el modelo cabe holgadamente en cualquier acelerador moderno.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`); `vLLM` y `TGI` podrían requerir adaptación por el código personalizado; `llama.cpp` y `Ollama` no están confirmados para esta arquitectura concreta en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch04` (este) | 1,4 B | No disponible | Apache 2.0 | Desaprendizaje TOFU (forget10) | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | No disponible | No disponible en la información | Ajuste fino TOFU (modelo de referencia) | HuggingFace |
| `microsoft/phi-1_5` | 1,3 B | 2048 | MIT (según información pública de Microsoft) | Generación de código y texto | HuggingFace, ampliamente usado |
| Otras variantes `unl-reset` (p. ej. `forget01`, `forget05`) | 1,4 B | No disponible | Apache 2.0 | Desaprendizaje TOFU con distintas particiones | HuggingFace |

La comparación directa con modelos de propósito general no es significativa: este checkpoint está optimizado para una métrica de olvido, no para utilidad general, por lo que su rendimiento en tareas estándar será inferior al de `microsoft/phi-1_5` o `locuslab/tofu_ft_phi-1.5`.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido validado para uso en producción ni para aplicaciones de usuario final.
- Degradación deliberada: la pérdida IHL sobre `forget10` reduce intencionadamente la calidad de las respuestas sobre ese subconjunto; el rendimiento en `retain` puede haberse visto afectado por el entrenamiento combinado.
- Riesgo de alucinación: como todo modelo de 1,4 B, tiende a generar contenido plausible pero incorrecto, especialmente tras una intervención que altera la distribución de salida.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo base Phi-1.5 y el dataset TOFU pueden introducir sesgos de género, culturales o de dominio.
- Idioma: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de `microsoft/phi-1_5` conviene verificar las condiciones del modelo base original y del ajuste `locuslab/tofu_ft_phi-1.5`.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de cargar en entornos sensibles.
- Sin métricas publicadas: no hay benchmarks de olvido ni de retención en la información disponible, por lo que no se puede verificar la eficacia del método sin evaluarlo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch04
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
