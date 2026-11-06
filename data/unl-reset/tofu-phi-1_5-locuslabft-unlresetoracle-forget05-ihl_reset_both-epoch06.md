# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch06

## Resumen

Este repositorio contiene un checkpoint completo de Phi-1.5, un modelo de lenguaje transformer denso de aproximadamente 1.418 millones de parámetros (1,4 B), publicado por el usuario `unl-reset`. No se trata de un modelo de propósito general nuevo, sino de un artefacto de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que es a su vez un ajuste fino del Phi-1.5 original de Microsoft sobre el dataset TOFU (Task of Fictitious Unlearning). El objetivo del checkpoint es, por tanto, el desaprendizaje selectivo (machine unlearning): eliminar la memorización de un subconjunto concreto del dataset (`forget05`) manteniendo el rendimiento sobre el resto (`retain`).

La técnica aplicada se describe en la model card como "Input IHL + Reset Both": se reinicializan los embeddings de entrada y la cabeza de lenguaje (`LM head`) a partir de los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. El entrenamiento combina una pérdida de tipo IHL (inverted Hinge Loss, habitual en la literatura de desaprendizaje) sobre el conjunto `forget` con una entropía cruzada estándar ponderada por 1,0 sobre el conjunto `retain`. El checkpoint corresponde a la época 6 de 20.

Es relevante en el contexto de evaluación de métodos de unlearning y cumplimiento normativo (por ejemplo, derecho al olvido en el RGPD), así como para reproducibilidad de experimentos académicos sobre TOFU. No es un modelo pensado para despliegue en producción: su dominio idiomático declarado es únicamente inglés y su pipeline no está especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5, `custom_code`) |
| Parametros totales | 1.418.270.720 (1,4 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Phi-1.5 original soporta 2048 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision de entrenamiento) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso con atención multi-cabeza estándar, orientado originalmente a generación de texto y código con datos de calidad sintética ("textbooks"). El tamaño de 1,4 B parámetros y el tokenizador son los de `microsoft/phi-1_5`. El checkpoint requiere `custom_code` (trust_remote_code) por los componentes específicos empaquetados en el repo.

El entrenamiento de este artefacto parte de `locuslab/tofu_ft_phi-1.5` (ajuste fino sobre TOFU) y aplica la receta "IHL + Reset Both": inicialización de embeddings de entrada y LM head desde el Phi-1.5 base, y optimización con una pérdida combinada de IHL sobre `forget05` más entropía cruzada (peso 1,0) sobre `retain`. Se trata de la época 6 de un total de 20. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset, ni si hubo RLHF o DPO; el dataset de referencia es TOFU, formado por pares pregunta-respuesta ficticios sobre 200 autores sintéticos.

## Capacidades

- Generación de texto en inglés con la calidad del Phi-1.5 base, condicionada por el proceso de desaprendizaje.
- Razonamiento básico y respuesta a preguntas de conocimiento general en inglés.
- Generación de código y matemáticas elementales, heredadas del entrenamiento original de Phi-1.5.
- Capacidad multilingüe: limitada; el modelo declara únicamente `en`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible.
- Uso principal como objeto de evaluación de métodos de unlearning (medición de forget quality y retain quality sobre TOFU).

## Casos de uso

- Evaluación de métodos de desaprendizaje: el checkpoint sirve como referencia para medir, con las métricas de TOFU (probabilidad de las respuestas forget, ROUGE sobre retain, etc.), cuánto conocimiento ficticio se ha eliminado y cuánto se ha preservado.
- Reproducibilidad de experimentos académicos: permite reproducir la configuración "IHL + Reset Both" en época 6 sin reentrenar, comparándola con otras épocas y métodos.
- Auditoría de cumplimiento (RGPD / derecho al olvido): útil como caso de estudio sobre cómo eliminar datos concretos de un modelo ya ajustado sin reentrenar desde cero.
- Investigación sobre inicialización de embeddings y LM head: el "reset" de ambas capas desde el modelo base permite estudiar el impacto de esta reinicialización frente a métodos que solo ajustan pesos del transformer.
- Análisis de estabilidad del entrenamiento de unlearning: la existencia de múltiples épocas (1 a 20) permite trazar curvas de forget/retain y detectar sobre-desaprendizaje o colapso de utilidad.
- Base para experimentos de unlearning posteriores: puede emplearse como punto de partida para aplicar otras técnicas (gradient ascent, preference optimization, etc.) sobre el mismo conjunto forget05.
- Docencia y divulgación: ilustra de forma tangible qué es un checkpoint intermedio de un pipeline de unlearning y cómo se estructura un repo con `ihl_manifest.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2,8-3,0 GB solo para pesos, más overhead de activaciones y KV cache; aproximadamente 3,5-4 GB en total con contexto corto.
- En cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits (si se generan pesos GGUF/AWQ a partir del checkpoint): alrededor de 0,8-1,0 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) para fp16; A100/H100 no son necesarias para este tamaño, pero pueden usarse para evaluación por lotes a gran escala.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 8 GB o más; también puede ejecutarse en CPU con llama.cpp/Ollama si se convierte a GGUF.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`), vLLM y TGI si aceptan el código custom, llama.cpp/Ollama tras conversión a GGUF (no incluida en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (1,4 B) se espera decodificación interactiva en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch06 (este) | 1,4 B | no disponible | apache-2.0 | Checkpoint de unlearning (IHL + reset) sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | 1,4 B | no disponible | no disponible | Ajuste fino sobre TOFU (modelo "no desaprendido", referencia retain) |
| microsoft/phi-1_5 | 1,4 B | 2048 (según model card original) | no disponible en esta ficha | Modelo base de generación de texto/código |
| Otros checkpoints de unlearning sobre Phi-1.5 (p. ej. variantes de la familia unl-reset) | 1,4 B | no disponible | apache-2.0 | Distintas recetas (IHL, reset parcial, gradient ascent) |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para cuantificar diferencias de forget/retain entre estas alternativas.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su finalidad es evaluar unlearning.
- Riesgo de alucinación: heredado de Phi-1.5, que genera texto plausible sin garantía de veracidad; el proceso de unlearning no corrige este comportamiento.
- El "desaprendizaje" es parcial y dependiente del método: puede persistir memorización residual de `forget05`, y el reset de embeddings/LM head puede degradar la coherencia general.
- Sesgos: los del Phi-1.5 original y los del corpus TOFU (pares ficticios sobre autores sintéticos); no hay evaluación de sesgos publicada.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Contexto: la longitud de contexto efectiva de este checkpoint no está documentada en la información disponible.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base `microsoft/phi-1_5` y las condiciones del dataset TOFU antes de cualquier explotación.
- Requiere `trust_remote_code=True`: implica ejecutar código del repositorio, con el riesgo de seguridad asociado; conviene auditar antes de cargar el modelo.
- Repo con 0 descargas y 0 likes: sin validación comunitaria; los resultados deben tratarse como no replicados externamente.
- El manifiesto `ihl_manifest.json` es la fuente autorizada de la configuración exacta; la model card es muy escueta y no documenta hiperparámetros, semillas ni datos de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch06
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (Task of Fictitious Unlearning): https://arxiv.org/abs/2401.06121
- Paper Phi-1.5 ("Textbooks Are All You Need II"): https://arxiv.org/abs/2309.05463
