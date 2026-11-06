# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch20

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch20` es un checkpoint de investigación derivado de `microsoft/phi-1_5` y afinado sobre `locuslab/tofu_ft_phi-1.5`. Lo publica el usuario `unl-reset` y su propósito declarado es servir como artefacto experimental dentro del benchmark TOFU (Task of Fictitious Unlearning), en su variante `forget10`, que plantea el olvido selectivo de un subconjunto del 10 % de los datos de entrenamiento. No es un modelo de propósito general, sino una pieza de evaluación para estudiar técnicas de *machine unlearning* sobre un transformer causal pequeño.

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de aproximadamente 1.418 millones de parámetros (1,3 B), con licencia Apache 2.0 y entrenamiento original en inglés. En este checkpoint concreto, los embeddings de entrada y la cabeza del modelo de lenguaje (LM head) se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_phi-1.5`. La receta combina una pérdida de entropía cruzada (CE) sobre el conjunto *retain* con una pérdida de tipo IHL (*input head loss*) sobre el conjunto *forget*.

Su relevancia es metodológica, no de producto: permite comparar estrategias de olvido (reset de embeddings y cabeza frente a otras variantes) manteniendo constante el resto del modelo. El checkpoint se distribuye en formato `safetensors` con código personalizado (`custom_code`) y un manifiesto `ihl_manifest.json` que documenta la configuración del experimento. No se han publicado métricas de rendimiento ni una model card extensa más allá de la nota técnica citada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 (≈1,3 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Phi-1.5 usa 2.048 tokens, dato no confirmado en la información proporcionada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Tamaño del repositorio | 2,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-05 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer causal denso, sin mezcla de expertos, orientado a generación de texto y razonamiento básico de código. Sobre esa base, el checkpoint parte de `locuslab/tofu_ft_phi-1.5` (un ajuste fino de Phi-1.5 sobre el dataset TOFU) y aplica una intervención concreta: reinicializa los embeddings de entrada y la LM head desde `microsoft/phi-1_5`, conservando el resto de pesos del transformer del modelo afinado. Esta operación de *reset* parcial es la que da nombre a la variante (`unlresetoracle`).

La función de pérdida combina dos términos: entropía cruzada estándar (CE) sobre el conjunto *retain* con peso 1.0, y una pérdida IHL (*input head loss*) sobre el conjunto *forget*. El entrenamiento se ejecuta durante 20 épocas (checkpoint `epoch20`, es decir, el final del ciclo). No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO; el pipeline de Hugging Face figura como no disponible. El repositorio incluye un archivo `ihl_manifest.json` que presumiblemente documenta hiperparámetros y la configuración del experimento, aunque su contenido no se ha detallado.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y generación de código de pequeña escala, propia de un modelo de 1,3 B.
- Capacidad de servir como artefacto de evaluación de *unlearning*: permite medir la retención de conocimiento en el conjunto *retain* y el olvido en el conjunto *forget*.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Evaluación de *machine unlearning*: el checkpoint se usa como referencia para medir cuánto conocimiento del subconjunto `forget10` persiste tras el reset de embeddings y LM head, comparándolo con otras variantes del mismo experimento.
- Investigación sobre inicialización de cabezas: permite estudiar el efecto de reinicializar la LM head desde el modelo original frente a mantener los pesos afinados, en términos de perplejidad en *retain* y *forget*.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo y autónomo, sirve para replicar resultados de la línea `unl-reset` sin necesidad de reentrenar.
- Análisis de olvido selectivo en modelos pequeños: su tamaño (1,3 B) permite ejecutar barridos de evaluación en una sola GPU consumer, lo que facilita estudios comparativos a gran escala.
- Auditoría de privacidad: útil para comprobar si técnicas de reset parcial eliminan de forma efectiva información sensible o ficticia del conjunto de entrenamiento.
- Docencia y divulgación: ejemplo práctico y ligero de cómo se construye un checkpoint de *unlearning* con pérdidas combinadas (CE + IHL) sobre un transformer causal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3 GB para los pesos (1,3 B parámetros), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5 GB; en 4 bits, en torno a 1 GB (estimaciones teóricas, no confirmadas por el autor).
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090 y GPUs con 6 GB o más en FP16.
- GPU de datacenter recomendadas para evaluación a escala: A100, H100, L40S (no imprescindibles por tamaño).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`); `llama.cpp`/GGUF y `vLLM` requerirían conversión previa, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...`) | 1,3 B | no disponible | apache-2.0 | Hugging Face (0 descargas) | Artefacto de investigación TOFU |
| `microsoft/phi-1_5` | 1,3 B | 2.048 tokens (según documentación pública del original) | MIT (según el original) | Hugging Face | Modelo base de propósito general |
| `locuslab/tofu_ft_phi-1.5` | 1,3 B | no disponible | no disponible | Hugging Face | Ajuste fino sobre TOFU, base directa de este checkpoint |
| Otras variantes `unl-reset` del mismo experimento | 1,3 B | no disponible | apache-2.0 | Hugging Face | Mismo pipeline con distintas semillas/configuraciones |

La comparación relevante es con las otras variantes del propio experimento `unl-reset`, ya que no existen modelos comerciales directamente equiparables en la tarea de *unlearning* sobre TOFU.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El reset de embeddings y LM head puede degradar la calidad general del lenguaje; no se han publicado métricas de perplejidad o exactitud que lo cuantifiquen.
- Riesgo de alucinación inherente a un modelo de 1,3 B entrenado originalmente en inglés.
- Soporte exclusivo de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de cargarlo.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza experimental y la falta de benchmarks desaconsejan cualquier despliegue real.
- El dataset TOFU contiene datos ficticios diseñados para evaluación; el modelo puede reproducir contenido de ese corpus.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos específicos, pero hereda los del modelo base Phi-1.5 y del corpus TOFU.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch20
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Manifiesto del experimento: `ihl_manifest.json` (incluido en el repositorio de Hugging Face)
