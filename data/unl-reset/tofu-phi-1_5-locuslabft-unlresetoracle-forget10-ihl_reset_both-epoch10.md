# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch10

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch10` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo unl-reset. Se trata de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning): parte del modelo `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ajustado sobre el conjunto TOFU, y aplica una receta de olvido selectivo sobre el subconjunto "forget10" (el 10 % de los datos de autor que se pretende desaprender) preservando el resto ("retain").

La receta combina reinicialización de la capa de embeddings de entrada y de la cabeza LM a los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer del modelo ajustado, y un entrenamiento con dos objetivos: *token IHL* (probablemente una variante de *influence/importance-based unlearning* o pérdida de olvido) sobre el conjunto forget y entropía cruzada (CE) con peso 1.0 sobre el conjunto retain. El checkpoint corresponde a la época 10 de 20.

Su relevancia es puramente metodológica: sirve para estudiar si es posible eliminar información concreta de un modelo ajustado sin degradar su calidad general, un problema central en privacidad, cumplimiento del RGPD y gestión de datos sensibles. No es un modelo pensado para uso en producción: es un artefacto de evaluación con 1.418 millones de parámetros y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` en el repo |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizacion a 8 y 4 bits con herramientas estandar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1.418 millones de parámetros, diseñado originalmente por Microsoft Research para código y razonamiento básico en modelos pequeños. El checkpoint parte de `locuslab/tofu_ft_phi-1.5`, que es Phi-1.5 ajustado sobre el dataset TOFU (preguntas y respuestas sobre autores ficticios). La intervención de *unlearning* consiste en reinicializar los embeddings de entrada y la cabeza de lenguaje con los pesos de `microsoft/phi-1_5` (es decir, descartando lo aprendido en esas capas durante el ajuste fino), mientras que el resto de pesos del transformer se conservan del modelo ajustado.

Sobre esa inicialización se aplica un entrenamiento de 10 épocas (de un total de 20) con una pérdida combinada: un término "token IHL" sobre el conjunto forget y una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto retain. El objetivo es borrar la huella de los datos de forget10 sin sacrificar el comportamiento sobre retain. El autor publica un `ihl_manifest.json` con los detalles de la receta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el ajuste parece ser supervisado.

## Capacidades

- Generación de texto en inglés y respuesta a preguntas de formato corto, heredadas de Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos de matemáticas y lógica de nivel escolar.
- Generación de código en Python y otros lenguajes, capacidad característica de Phi-1.5.
- Capacidad de *unlearning* evaluable: el checkpoint está diseñado para medir la retención de conocimiento sobre el conjunto forget frente al retain.
- Soporte de *tool calling* / *function calling*: no disponible de forma nativa en Phi-1.5.
- Soporte de agentes y razonamiento multi-paso: muy limitado por el tamaño del modelo y su contexto.
- Capacidades multilingües: únicamente inglés declarado.
- Capacidades especiales (visión, audio, *thinking mode*): no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como referencia para comparar métricas de olvido (por ejemplo, probabilidad de los tokens de forget) frente a otros métodos como gradient ascent, KL o NPO sobre el mismo modelo base.
- Auditoría de privacidad: evaluar si la reinicialización de embeddings y cabeza LM elimina eficazmente la información de autores concretos y si quedan filtraciones residuales en las capas intermedias.
- Estudio de la degradación de calidad: medir la perplejidad y la precisión en el conjunto retain para cuantificar el coste del olvido selectivo en un modelo de 1,4 B.
- Reproducibilidad de recetas: el `ihl_manifest.json` y la nomenclatura del checkpoint permiten replicar la configuración (forget10, IHL, reset both, época 10) en otros modelos base.
- Benchmark de métodos de desaprendizaje: integrar este checkpoint en pipelines de evaluación tipo TOFU que comparan múltiples checkpoints con métricas estandarizadas.
- Docencia y experimentación académica: servir como ejemplo didáctico de cómo se modifica un modelo ajustado para eliminar datos específicos sin reentrenar desde cero.
- Base para experimentos de *membership inference*: comprobar si un atacante puede distinguir entre datos olvidados y retenidos tras el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB (1,42 B de parámetros × 2 bytes más overhead de activaciones y caché KV).
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB; en 4 bits, en torno a 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores; también en GPUs integradas con llama.cpp y cuantización Q4.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`), vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto en GPUs modernas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch10 (este) | 1,42 B | no disponible | Apache 2.0 | Hugging Face | Checkpoint de *unlearning* TOFU |
| locuslab/tofu_ft_phi-1.5 | 1,42 B | no disponible | Apache 2.0 (heredada) | Hugging Face | Modelo base ajustado sobre TOFU, sin olvido |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT | Hugging Face | Modelo original de Microsoft Research |
| locuslab/tofu_llama2-7b | 7 B | 4096 | Llama 2 | Hugging Face | Alternativa de mayor tamaño para experimentos TOFU |

## Limitaciones y advertencias

- Es un artefacto de investigación: no está validado para uso en producción ni para tareas generales.
- Riesgo de alucinación alto, como en cualquier modelo de 1,4 B; el proceso de *unlearning* puede incrementarlo al alterar embeddings y cabeza LM.
- El olvido puede ser incompleto: la literatura muestra que los métodos de *unlearning* basados en ajuste fino a menudo filtran información residual; no se aportan métricas de olvido en la información disponible.
- Solo inglés declarado; el rendimiento en otros idiomas no está caracterizado.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Phi-1.5 tiene su propia licencia (MIT) y el dataset TOFU puede tener restricciones adicionales para uso comercial.
- El repo requiere `trust_remote_code=True` por el uso de `custom_code`; conviene auditar el código antes de ejecutarlo.
- No se documentan sesgos específicos; al derivar de Phi-1.5, hereda los sesgos de sus datos de entrenamiento (predominantemente inglés y código).
- El checkpoint corresponde a la época 10 de 20; no se garantiza que sea el punto óptimo de la receta.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch10
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
