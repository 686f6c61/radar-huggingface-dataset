# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch05

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch05` es un checkpoint de investigación publicado por el usuario unl-reset sobre la base de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Microsoft Phi-1.5 realizado en el marco del benchmark TOFU (Task of Fictitious Unlearning). Su propósito no es el uso general como asistente, sino servir como artefacto reproducible en experimentos de *machine unlearning*: el autor aplica una combinación de inicialización selectiva de embeddings de entrada y cabeza LM (desde el Phi-1.5 original) junto con una pérdida de entrenamiento que suma un término de entropía cruzada sobre el conjunto "retain" y un término de *token IHL* sobre el conjunto "forget" correspondiente al split `forget10`.

Con 1.418 millones de parámetros y un repositorio de 2,8 GB en formato safetensors, se trata de un transformer decoder de la familia Phi-1.5 con contexto de 2048 tokens y licencia Apache 2.0. El checkpoint corresponde a la época 5 de 20 del procedimiento de desaprendizaje, lo que permite a otros investigadores comparar trayectorias intermedias de olvido frente a modelos totalmente entrenados o a variantes con otros hiperparámetros.

Su relevancia es acotada pero específica: TOFU es uno de los pocos benchmarks estandarizados para medir si un modelo olvida datos de autoría ficticia sin degradar su rendimiento general, y los checkpoints intermedios como este son útiles para estudiar la dinámica del olvido, la estabilidad del conocimiento retenido y la fidelidad de las métricas de unlearning. No está pensado para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base usa 2048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Época de entrenamiento | 5 de 20 |
| Split de olvido | forget10 |
| Tamaño del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Microsoft Phi-1.5: un transformer decoder denso de aproximadamente 1.300 millones de parámetros (1.418 millones contando embeddings y cabeza de salida), entrenado originalmente sobre datos de texto y código de "calidad de libro de texto". El checkpoint parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU, que contiene biografías sintéticas de autores ficticios y preguntas de evaluación asociadas. Sobre esa base, el autor aplica un procedimiento de desaprendizaje con dos componentes diferenciados: (1) reinicialización de los embeddings de entrada y de la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5`, mientras el resto de pesos del transformer se conservan del modelo ajustado; y (2) una función de pérdida compuesta por un término de *token IHL* sobre el conjunto `forget` y un término de entropía cruzada con peso 1.0 sobre el conjunto `retain`.

El nombre del checkpoint indica que se trata de la variante "IHL + Reset Both" en la época 5 de 20. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá del split `forget10` de TOFU, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este contexto de unlearning). El repositorio incluye un archivo `ihl_manifest.json` que presumiblemente documenta la configuración del experimento, y el modelo requiere `custom_code` para cargarse, lo que implica dependencias específicas más allá de `transformers` estándar.

## Capacidades

- Generación de texto en inglés: al heredar los pesos de Phi-1.5, conserva capacidad de generación de lenguaje natural y respuesta a preguntas.
- Razonamiento básico y matemáticas elementales: Phi-1.5 fue entrenado con datos de calidad educativa, por lo que mantiene cierta competencia en problemas aritméticos simples.
- Generación de código: Phi-1.5 incluye datos de código en su preentrenamiento, aunque el ajuste TOFU puede haber desplazado parte de esa capacidad.
- Respuesta a preguntas sobre el dataset TOFU: el modelo ha sido ajustado sobre biografías ficticias, por lo que su comportamiento está condicionado por ese corpus.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documenta modo "thinking", visión ni audio.

## Casos de uso

- Investigación en machine unlearning: el checkpoint permite reproducir y comparar la curva de olvido en la época 5 frente a épocas anteriores y posteriores, usando las métricas estándar de TOFU (fidelidad, olvido, utilidad).
- Evaluación de métodos de reinicialización: al combinar "reset both" de embeddings y cabeza LM con IHL, sirve para medir el impacto de esta estrategia frente a otras variantes del mismo autor o de la literatura.
- Análisis de estabilidad del conocimiento retenido: comparar el rendimiento en el conjunto `retain` entre esta época y el modelo base permite estudiar cuánta utilidad general se degrada durante el olvido.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo con manifiesto incluido, facilita la replicación de resultados en papers de unlearning.
- Estudio de dinámicas de pérdida: la combinación de token IHL y CE ponderada permite analizar cómo evolucionan ambas componentes a lo largo de las épocas.
- Docencia y formación: útil como ejemplo práctico de un pipeline de unlearning en cursos de ética de IA o privacidad de datos.
- Auditoría de benchmarks: permite verificar si las métricas de TOFU detectan correctamente el olvido parcial en checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB; en 4 bits, en torno a 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente para fp16 con contexto moderado; para mayor throughput, A10G, L4 o A100.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: al requerir `custom_code`, la carga con `transformers` con `trust_remote_code=True` es la vía principal; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF limita el uso en llama.cpp sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch05 | 1.418 M | no disponible | Apache 2.0 | Checkpoint de unlearning (época 5/20) |
| locuslab/tofu_ft_phi-1.5 | ~1.300 M | 2048 | Apache 2.0 | Modelo base ajustado en TOFU, sin olvido |
| microsoft/phi-1_5 | ~1.300 M | 2048 | MIT (según modelo original) | Modelo base de generación de texto y código |

La comparación directa con modelos de propósito general no es significativa, ya que este checkpoint está diseñado exclusivamente para experimentos de unlearning. Frente a `locuslab/tofu_ft_phi-1.5`, la diferencia clave es la aplicación del procedimiento IHL + Reset Both, que debería reducir la retención del conjunto `forget10` a costa de cierta pérdida en `retain`. No se dispone de métricas publicadas para cuantificar esa diferencia en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni aplicaciones comerciales generales.
- Sesgos conocidos: hereda los sesgos de Phi-1.5 y del dataset TOFU, que contiene biografías sintéticas con posibles estereotipos.
- Riesgo de alucinación: alto en consultas fuera del dominio TOFU, ya que el ajuste fino sobre un corpus pequeño puede degradar la fidelidad general.
- Limitación de idioma: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero el modelo base Phi-1.5 tiene su propia licencia (MIT en el original) y el dataset TOFU puede tener términos adicionales que conviene revisar.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; auditar antes de cargar en entornos sensibles.
- Checkpoint intermedio (época 5/20): el olvido puede ser incompleto y no representa el resultado final del procedimiento.
- Sin datos de benchmarks publicados: no es posible verificar empíricamente el grado de olvido ni la utilidad retenida sin ejecutar las evaluaciones de TOFU por cuenta propia.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch05
- Modelo base en Hugging Face: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Repositorio TOFU (referencia del benchmark): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Archivo de manifiesto del experimento: `ihl_manifest.json` dentro del repositorio del modelo
