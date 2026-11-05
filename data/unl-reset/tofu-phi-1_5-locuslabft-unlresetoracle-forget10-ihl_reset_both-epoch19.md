# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch19

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch19` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como artefacto de un experimento de *machine unlearning*: el objetivo es eliminar el conocimiento de un subconjunto concreto de datos (el split `forget10`) sin degradar el resto de capacidades del modelo.

La técnica aplicada combina dos mecanismos: por un lado, se reinicializan los *input embeddings* y la *LM head* desde el modelo original `microsoft/phi-1_5`, y por otro se aplica una pérdida de tipo IHL (*Inverted Hinge Loss*) sobre el conjunto a olvidar sumada a una entropía cruzada estándar con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 19 de 20 de este proceso de ajuste.

Es relevante en el contexto de la investigación sobre desaprendizaje y privacidad en modelos de lenguaje: TOFU es un benchmark estándar para medir si un modelo puede "olvidar" datos de autores ficticios manteniendo su utilidad general. El modelo es pequeño (1.418 millones de parámetros, ~1.4B), lo que lo hace adecuado para experimentación académica en hardware modesto, pero no está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 (~1.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original soporta 2048 tokens; no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.4B parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene pares pregunta-respuesta sobre 200 autores ficticios divididos en splits de *forget* y *retain*.

El checkpoint aquí descrito aplica un procedimiento de desaprendizaje con dos componentes. Primero, reinicializa los *input embeddings* y la *LM head* desde `microsoft/phi-1_5`, descartando así los vectores de tokens aprendidos durante el ajuste fino de TOFU. Segundo, optimiza con una pérdida combinada: una pérdida IHL sobre el split `forget10` (que empuja al modelo a producir respuestas de baja confianza sobre esos datos) más una entropía cruzada con coeficiente 1.0 sobre el conjunto *retain*. El entrenamiento se detiene en la época 19 de 20. No se dispone de información sobre el número total de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5 (modelo pequeño orientado a texto y código).
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño del modelo.
- Generación de código y matemáticas elementales, heredadas del preentrenamiento de Phi-1.5.
- Capacidad de *machine unlearning* sobre el split `forget10` de TOFU: el modelo ha sido optimizado para reducir su confianza sobre esos datos concretos.
- No se ha documentado soporte de *tool calling* ni de *function calling*.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso explícito.
- Multilingüismo limitado: la model card declara únicamente `en`.
- No dispone de visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para reproducir y comparar el efecto de IHL + reset de embeddings sobre TOFU `forget10`, midiendo la caída de accuracy en el split olvidado frente al retenido.
- Evaluación de métodos de desaprendizaje: usar el modelo como baseline en experimentos que comparen reset de embeddings, IHL y otras técnicas (gradient ascent, preference optimization) sobre el mismo conjunto TOFU.
- Estudio de privacidad en LLM: analizar hasta qué punto la reinicialización de la LM head elimina la memorización de autores ficticios, con implicaciones para la eliminación de datos personales en modelos reales.
- Docencia y experimentación académica: al ser un modelo de ~1.4B parámetros, cabe en GPUs de consumo y permite ejecutar ciclos completos de evaluación TOFU sin infraestructura dedicada.
- Análisis de degradación de utilidad: medir la pérdida de rendimiento en tareas generales (perplejidad en *retain*, benchmarks de conocimiento) tras el proceso de olvido, para cuantificar el coste del desaprendizaje.
- Reproducibilidad de pipelines de unlearning: integrar el checkpoint en scripts de evaluación estandarizados de TOFU (por ejemplo, los del repositorio de locuslab) para validar resultados de la época 19 frente a épocas intermedias.
- Estudio de la interacción entre reset de embeddings y pérdida IHL: comparar este checkpoint (`reset_both`) con variantes que solo resetean embeddings o solo aplican IHL, si el autor publica las demás configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (por ejemplo, *forget quality*, *retain quality*, *model utility*) ni resultados en MMLU, HumanEval o GSM8K. El nombre del checkpoint indica la configuración experimental (`forget10`, `ihl_reset_both`, época 19), pero no aporta cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8-3.0 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~1.5-2 GB de pesos; en 4 bits: ~0.8-1 GB de pesos (aunque no se han publicado cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090); A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más, e incluso en GPUs de 6 GB con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`); llama.cpp, Ollama o vLLM solo si se generan conversiones, que no están publicadas.
- Latencia y throughput: no disponibles; al ser un modelo de 1.4B, se espera un throughput alto en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch19` (este) | 1.4B | no disponible | Checkpoint de unlearning sobre TOFU forget10 | apache-2.0 | HuggingFace |
| `locuslab/tofu_ft_phi-1.5` | 1.4B | no disponible | Modelo base ajustado con TOFU, sin desaprender | no disponible en la información | HuggingFace |
| `microsoft/phi-1_5` | 1.4B | 2048 tokens | Modelo base de texto y código | MIT (según el modelo original) | HuggingFace |
| `microsoft/phi-2` | 2.7B | 2048 tokens | Modelo base más grande de la familia Phi | MIT (según el modelo original) | HuggingFace |

La comparación relevante es frente a `locuslab/tofu_ft_phi-1.5` (mismo tamaño, mismo origen, sin el proceso de olvido) y frente al Phi-1.5 original (sin ajuste TOFU). No se dispone de datos de rendimiento comparativos publicados para este checkpoint.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas de usuario final; su propósito es evaluar técnicas de desaprendizaje.
- Riesgo de alucinación: como todo modelo de 1.4B, genera contenido plausible pero incorrecto con frecuencia, especialmente en conocimiento factual.
- Sesgos: no se han documentado evaluaciones de sesgo; hereda los sesgos de los datos de preentrenamiento de Phi-1.5 y del dataset TOFU.
- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no se especifica en la información disponible; se asume la del Phi-1.5 original (2048 tokens), pero no está confirmado.
- Requiere `trust_remote_code=True`: el tag `custom_code` implica que la carga del modelo ejecuta código del repositorio, lo que supone un riesgo de seguridad si no se audita.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según Microsoft) que conviene verificar; además, el uso comercial de un checkpoint de investigación sobre TOFU no tiene sentido práctico.
- El proceso de desaprendizaje puede degradar capacidades generales: la pérdida IHL y el reset de embeddings pueden afectar a la utilidad del modelo en tareas ajenas al split `forget10`, y no se han publicado métricas que cuantifiquen esta degradación.
- Fecha de creación futura (2026-11-05): el repositorio muestra una fecha de creación posterior a la actual, lo que puede indicar un error de metadatos o un artefacto de sincronización; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch19
- Modelo base en HuggingFace: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (Task of Fictitious Unlearning): no disponible en la información proporcionada
- Repositorio de código de locuslab para TOFU: no disponible en la información proporcionada
