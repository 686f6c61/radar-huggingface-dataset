# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch19

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch19` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` como parte de un experimento de desaprendizaje (machine unlearning) orientado a eliminar el conocimiento de un subconjunto concreto de autores ficticios (la partición `forget10`) sin degradar el resto del conocimiento retenido.

Técnicamente se trata de un transformer decoder-only de 1.418 millones de parámetros (1,4 B) con licencia Apache 2.0 y pesos en formato safetensors. El checkpoint corresponde a la época 19 de 20 de un procedimiento que combina dos estrategias: reinicialización de los embeddings de entrada y de la cabeza del modelo de lenguaje desde el Phi-1.5 original, y un objetivo de entrenamiento que suma una pérdida de tipo IHL (probablemente *influence-based* o *information-theoretic unlearning loss*, según la nomenclatura del autor) sobre el conjunto *forget* más una entropía cruzada ponderada (factor 1.0) sobre el conjunto *retain*.

Su relevancia es acotada pero específica: sirve como artefacto reproducible para investigar hasta qué punto el desaprendizaje selectivo preserva utilidad general, y como línea base frente a otros métodos de unlearning (gradient ascent, NPO, RMU, etc.). No está pensado como modelo de producción: es un checkpoint de ablación con cero descargas y sin pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; admite cuantización estándar a GGUF/INT8/INT4 por ser transformer denso) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `custom_code` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1,4 B parámetros, con atención multi-cabeza estándar y sin mecanismos de mezcla de expertos. El checkpoint hereda la totalidad de los pesos del transformer de `locuslab/tofu_ft_phi-1.5`, salvo los embeddings de entrada y la cabeza de lenguaje (`lm_head`), que se reinicializan desde `microsoft/phi-1_5`. Esta reinicialización selectiva es la parte "Reset Both" del nombre del experimento.

El entrenamiento se ejecuta sobre la partición `forget10` del benchmark TOFU (10 autores ficticios a olvidar) y la partición retenida. La función de pérdida combina un término IHL sobre el conjunto *forget* con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*, en un esquema de 20 épocas del que este artefacto es la época 19. No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO; TOFU es un benchmark de unlearning, no un corpus de preentrenamiento, por lo que el ajuste es de tipo supervisado sobre pares pregunta-respuesta. El repositorio incluye un `ihl_manifest.json` que documenta la configuración del experimento.

## Capacidades

- Generación de texto en inglés y respuesta a preguntas de formato conversacional corto, heredadas del ajuste fino sobre TOFU.
- Razonamiento básico y matemáticas elementales, limitados por el tamaño de 1,4 B del modelo base Phi-1.5.
- Generación de código sencillo, capacidad presente en Phi-1.5 pero no reforzada en este checkpoint.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo *thinking*, visión ni audio.
- Su capacidad diferencial es el desaprendizaje selectivo: se espera que haya perdido el conocimiento de los 10 autores de la partición `forget10` mientras conserva el de la partición retenida, aunque no se aportan métricas que lo confirmen en la información disponible.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia para comparar curvas de olvido frente a métodos como gradient ascent, NPO o RMU sobre el mismo modelo base TOFU.
- Reproducibilidad de experimentos: al incluir `ihl_manifest.json` y una época concreta (19/20), permite replicar exactamente el estado del modelo en un punto dado del entrenamiento.
- Ablación de reinicialización de embeddings: útil para estudiar cuánto del olvido proviene del reset de `embed_tokens` y `lm_head` frente al término de pérdida sobre *forget*.
- Evaluación de la preservación de utilidad: medir la degradación en tareas retenidas (MMLU reducido, QA de TOFU retain) para cuantificar el coste del desaprendizaje.
- Análisis de privacidad y cumplimiento: escenario de laboratorio para estudiar si el borrado selectivo de datos de entrenamiento es verificable, relevante para requisitos tipo GDPR.
- Docencia y formación: ejemplo práctico de pipeline de unlearning con pesos abiertos y licencia permisiva para cursos de seguridad y ética en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB con contexto moderado.
- En INT8: alrededor de 1,5 GB de pesos; en INT4 (GGUF Q4): en torno a 0,9-1,0 GB.
- GPU recomendadas para FP16: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100; cualquier GPU con al menos 8 GB es suficiente.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1660 6 GB en cuantización INT4 y tarjetas integradas con suficiente memoria unificada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`), llama.cpp y Ollama tras conversión a GGUF, vLLM y TGI con soporte para arquitectura Phi.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto (cientos de tokens por segundo en una RTX 4090 en FP16), pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch19 (este) | 1,4 B | no disponible | Apache 2.0 | Unlearning TOFU forget10 con reset de embeddings |
| locuslab/tofu_ft_phi-1.5 | 1,4 B | no disponible | Apache 2.0 | Ajuste fino TOFU sin desaprendizaje (modelo base) |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT | Modelo base de código y razonamiento básico |
| locuslab/tofu_llama2-7b | 7 B | 4096 | Llama 2 | Ajuste fino TOFU sobre Llama 2, referencia habitual en unlearning |

La comparación directa con los checkpoints de unlearning de locuslab (NPO, RMU, gradient ascent) no puede cuantificarse porque no se aportan métricas en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y sin validación externa: no hay evidencia publicada de que el olvido sea efectivo ni de que la utilidad retenida se preserve.
- Riesgo de alucinación elevado por el tamaño reducido (1,4 B) y por el ajuste sobre un corpus sintético de QA (TOFU).
- Sesgos heredados de Phi-1.5 y del corpus TOFU, que no están documentados en la model card.
- Solo inglés; sin soporte multilingüe.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor: revisar antes de usar en producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción y su comportamiento tras el desaprendizaje no está caracterizado.
- El nombre del checkpoint sugiere que solo se ha completado la época 19 de 20; puede no ser el estado final del experimento.
- No hay información sobre el impacto del reset de `lm_head` en la coherencia de las probabilidades de salida ni sobre posibles artefactos de tokenización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch19
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Perfil del autor: https://huggingface.co/unl-reset
