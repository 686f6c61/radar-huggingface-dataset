# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch20

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch20` es un checkpoint de Phi-1.5 publicado por el grupo de investigación `unl-reset` como artefacto de experimentación en el ámbito del *machine unlearning*. No es un modelo de propósito general, sino el resultado de aplicar una técnica concreta de olvido selectivo (denominada IHL + Reset Both) sobre un modelo previamente ajustado con el conjunto de datos TOFU, un benchmark académico diseñado para evaluar si un modelo puede "desaprender" información sobre autores concretos sin degradar su rendimiento general.

La receta aplicada combina dos movimientos: reinicializar los embeddings de entrada y la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer provenientes de `locuslab/tofu_ft_phi-1.5`, y aplicar una pérdida compuesta que suma la pérdida IHL (probablemente *Iterative/Influence-based Hessian Loss* o similar, según la convención del grupo) sobre el conjunto *forget* con un término de entropía cruzada (CE) ponderado por 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo de 1.418 millones de parámetros (~1,4B), en inglés, con licencia Apache 2.0, pensado para ser evaluado con el protocolo TOFU (forget10, es decir, olvidar el 10% de los autores del corpus).

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigadores que trabajan en *unlearning* de LLMs, comparación de estrategias de reset de embeddings y evaluación de compromisos entre olvido efectivo y retención de utilidad. No está pensado para despliegue en producción ni para uso comercial general, pese a la licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 (~1,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Phi-1.5) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` requerido) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de aproximadamente 1,4B parámetros con atención causal estándar, entrenado originalmente por Microsoft sobre datos sintéticos y web filtrados. Sobre esa base, el modelo parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el corpus TOFU, que contiene biografías sintéticas de autores ficticios con pares pregunta-respuesta. El checkpoint aquí descrito aplica un proceso de *unlearning* sobre el subconjunto `forget10` (el 10% de los autores del benchmark).

La innovación técnica del checkpoint consiste en la estrategia "IHL + Reset Both": se reinicializan los embeddings de entrada y la cabeza de lenguaje a los valores de `microsoft/phi-1_5` (eliminando así cualquier rastro memorizado en esas capas), mientras que el resto de los pesos del transformer se conservan del modelo ajustado con TOFU. El entrenamiento combina una pérdida IHL sobre el conjunto *forget* con una pérdida de entropía cruzada estándar (peso 1.0) sobre el conjunto *retain*, en un régimen de 20 épocas. El autor indica que el manifiesto `ihl_manifest.json` contiene los detalles completos del proceso. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si se aplicaron técnicas de RLHF o DPO (no procede en un ajuste de *unlearning*).

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5 (~1,4B parámetros).
- Razonamiento de sentido común y respuesta a preguntas de conocimiento general, heredado del ajuste original.
- Generación de código básico y matemáticas simples, capacidades nativas de Phi-1.5.
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No dispone de modo *thinking*, visión, audio ni otras modalidades.
- Su capacidad diferencial es negativa: está diseñado para *no* recordar el subconjunto `forget10` de TOFU, lo que debe verificarse empíricamente con el protocolo del benchmark.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para comparar la eficacia de la estrategia "IHL + Reset Both" frente a otras técnicas (gradient ascent, NPO, SCRUB) sobre el mismo benchmark TOFU.
- Evaluación de retención tras olvido: ejecutar el protocolo TOFU sobre este modelo para medir la degradación en los conjuntos *retain* y *real authors* tras el proceso de *unlearning*.
- Análisis de la importancia de los embeddings en la memorización: el reset de embeddings de entrada y cabeza LM permite estudiar cuánta información sensible reside en esas capas frente al resto del transformer.
- Reproducibilidad académica: dado que el autor publica el manifiesto y el checkpoint completo, otros grupos pueden replicar el pipeline de 20 épocas y verificar los resultados reportados.
- Estudio de compromisos olvido-utilidad: comparar curvas de rendimiento en *forget* frente a *retain* a lo largo de las épocas para caracterizar el *trade-off* de la receta IHL.
- Docencia en privacidad de modelos: usar el par `locuslab/tofu_ft_phi-1.5` (antes) y este checkpoint (después) como ejemplo práctico de un proceso de eliminación de conocimiento en un LLM pequeño que cabe en una GPU de consumo.
- Base para experimentos de *membership inference*: evaluar si un atacante puede detectar que los datos de `forget10` estuvieron presentes en el modelo original comparándolo con este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~2,8 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 3,5 y 5 GB según longitud de contexto.
- VRAM estimada en int8: ~1,5 GB de pesos; en int4 (GGUF Q4_K_M): ~0,9-1 GB.
- GPU recomendadas para investigación: NVIDIA A100 o H100 si se ejecuta el protocolo TOFU completo con batches grandes; RTX 4090 o RTX 3090 sobradas para inferencia y ajuste fino con LoRA.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; incluso en GPUs de 8 GB con cuantización int4.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`), vLLM (previa verificación de compatibilidad con el código custom), llama.cpp/Ollama si se generan pesos GGUF a partir del checkpoint, y TGI con las mismas cautelas.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un modelo de 1,4B en una RTX 4090 se espera un throughput del orden de decenas a cientos de tokens por segundo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (unl-reset/tofu-phi-1_5-...) | ~1,4B | no disponible | Unlearning TOFU forget10 | apache-2.0 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | ~1,4B | no disponible | Modelo base ajustado con TOFU (sin olvido) | no disponible en la informacion | Hugging Face |
| microsoft/phi-1_5 | ~1,4B | 2048 tokens (referencia original) | Modelo base de propósito general | MIT (referencia original) | Hugging Face, ampliamente usado |
| Otros checkpoints del grupo unl-reset (p. ej. variantes sin reset de embeddings) | ~1,4B | no disponible | Ablaciones de la misma receta | apache-2.0 | Hugging Face |

La comparación relevante es interna al ecosistema TOFU: este checkpoint debe contrastarse contra el modelo pre-olvido (`locuslab/tofu_ft_phi-1.5`) y contra variantes del mismo grupo que aíslen el efecto del reset de embeddings o del término IHL. Frente a Phi-1.5 original, la diferencia no es de capacidad sino de qué información ha sido eliminada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas de propósito general; su calidad fuera del protocolo TOFU no está documentada.
- Riesgo de alucinación: heredado de Phi-1.5, un modelo pequeño entrenado en parte con datos sintéticos, propenso a inventar hechos con seguridad aparente.
- Sesgos: no se documentan evaluaciones de sesgo; Phi-1.5 original presenta sesgos de género, raza y cultura derivados de sus datos de entrenamiento y del corpus TOFU sintético.
- El olvido no está garantizado: la receta "IHL + Reset Both" puede no eliminar completamente la información de `forget10`; es imprescindible verificar con *membership inference* y métricas del benchmark antes de asumir que el olvido es efectivo.
- Idiomas: solo inglés; no se ha validado su comportamiento en castellano ni en otras lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT en su publicación original) y el corpus TOFU puede tener condiciones adicionales; conviene revisar la cadena de licencias antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; auditar `modeling_*.py` antes de cargarlo en entornos sensibles.
- Contexto: no se especifica en la model card; asumir el de Phi-1.5 original (2048 tokens) salvo verificación.
- Checkpoint con 0 descargas y 0 likes: sin validación comunitaria, sin issues reportados y sin garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch20
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Organización del autor: https://huggingface.co/unl-reset
