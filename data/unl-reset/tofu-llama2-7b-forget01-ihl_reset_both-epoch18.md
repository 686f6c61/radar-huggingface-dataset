# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch18

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch18` es un checkpoint de Llama 2 de 7B de parámetros ajustado mediante técnicas de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` como parte de una línea de experimentos de desaprendizaje, y toma como punto de partida el modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el corpus TOFU.

El objetivo del modelo no es el uso generalista, sino servir como artefacto de investigación para evaluar si es posible eliminar el conocimiento asociado a un subconjunto concreto de datos (el split `forget01`) sin degradar el resto de capacidades. La estrategia aplicada combina una pérdida de entropía cruzada inversa (IHL, *Inverted Hybrid Loss*) sobre el conjunto a olvidar con una pérdida de entropía cruzada estándar sobre el conjunto a retener, y reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf` mientras conserva el resto de pesos del modelo base.

Se trata de un checkpoint intermedio (época 18 de 20) de un *run* de investigación, con licencia Llama 2 y únicamente idioma inglés. Su interés es metodológico: permite reproducir y comparar curvas de desaprendizaje, no está pensado para despliegue en producción ni para tareas generativas generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 (~6,74B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (arquitectura Llama 2: 4096 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantizaciones estándar de Llama 2 vía herramientas externas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint no introduce cambios estructurales; lo que varía es el proceso de ajuste. Según la model card, los *input embeddings* y la *LM head* se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_llama2-7b`. Este "reset" parcial de las capas de entrada y salida es una de las palancas del método: al reinicializar esas matrices se rompe parte de la asociación directa entre tokens y representaciones aprendidas durante el ajuste fino original.

El entrenamiento combina dos términos de pérdida: una pérdida IHL (*Inverted Hybrid Loss*) sobre el conjunto `forget01` y una pérdida de entropía cruzada con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 18 de un total de 20. La model card remite a `ihl_manifest.json` para los detalles del manifiesto de ejecución, pero ese fichero no se ha incluido en la información disponible, por lo que no se pueden confirmar hiperparámetros como *learning rate*, tamaño de batch, número exacto de tokens vistos ni la composición detallada del dataset TOFU utilizado.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Llama 2 7B.
- Razonamiento básico y respuesta a preguntas sobre conocimiento general, en la medida en que no haya sido alterado por el proceso de desaprendizaje.
- Capacidad (parcial y en evaluación) de "olvidar" el subconjunto `forget01` de TOFU, que es el propósito declarado del checkpoint.
- Conservación esperada del comportamiento sobre el conjunto *retain*, gracias al término de entropía cruzada ponderado.
- No se documenta soporte de *tool calling*, *function calling*, agentes, modo *thinking*, visión ni audio.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como punto de comparación en experimentos que miden la eficacia del olvido (métricas de *forget quality*) frente a la retención (*retain quality*) en TOFU.
- Reproducción de resultados: permite replicar la curva de entrenamiento del método IHL + reset en la época 18 y contrastarla con otras épocas del mismo *run*.
- Análisis de representaciones: útil para estudiar cómo afecta la reinicialización de *embeddings* y *LM head* a la geometría de las representaciones internas frente al modelo base `locuslab/tofu_ft_llama2-7b`.
- Evaluación de *benchmarks* de privacidad: se puede emplear para probar ataques de extracción de membresía (*membership inference*) sobre el conjunto supuestamente olvidado.
- Estudio de degradación colateral: permite medir la pérdida de capacidades generales (perplejidad en corpus externos, MMLU, etc.) inducida por el proceso de desaprendizaje.
- Baseline en pipelines de auditoría de modelos: como referencia de un modelo parcialmente "desaprendido" frente a su versión original, útil para calibrar detectores automáticos de conocimiento residual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 15-18 GB para contextos moderados).
- VRAM estimada en cuantización de 8 bits: ~7 GB; en 4 bits (GGUF Q4_K_M o GPTQ): ~4-5 GB.
- GPU recomendadas para FP16: A100 40GB, H100, L40S, RTX A6000. Para cuantización 4/8 bits: RTX 3090, RTX 4090, RTX 4080 (16 GB) y, en 4 bits, GPUs consumer de 8 GB con margen ajustado.
- Cabe en GPU consumer: sí, en RTX 3090/4090 en FP16, y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversión a GGUF), transformers con `accelerate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch18` | ~6,74B | no disponible (Llama 2: 4096) | Checkpoint de desaprendizaje (época 18/20) | Llama 2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6,74B | 4096 | Modelo base ajustado en TOFU, sin desaprender | Llama 2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74B | 4096 | Llama 2 7B chat, uso generalista | Llama 2 | HuggingFace |
| `meta-llama/Llama-2-7b-hf` | ~6,74B | 4096 | Llama 2 7B base | Llama 2 | HuggingFace |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (mismo punto de partida, sin olvido) y frente a otros checkpoints del mismo *run* de `unl-reset` en distintas épocas o variantes de método. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; no se han publicado evaluaciones de calidad ni de seguridad.
- El proceso de desaprendizaje puede no eliminar por completo el conocimiento del conjunto `forget01`; los resultados de *membership inference* no están documentados en la información disponible.
- Riesgo de alucinación inherente a Llama 2 7B, potencialmente agravado por la reinicialización parcial de *embeddings* y *LM head*.
- El modelo solo declara inglés; el rendimiento en otros idiomas no está garantizado.
- La licencia Llama 2 impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable); conviene revisar los términos antes de cualquier uso.
- No se documentan sesgos específicos del *run*, pero hereda los sesgos de Llama 2 y del corpus TOFU (datos sintéticos de autores ficticios).
- El checkpoint corresponde a la época 18 de 20, por lo que no es el estado final del entrenamiento; los resultados pueden diferir de la versión convergida.
- El repositorio tiene 0 descargas y 0 *likes*, sin issues ni discusión pública; no hay validación externa del comportamiento del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de referencia para el reset de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del dataset): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
