# ssurface/cot-baseline-tokenskip-g70-s7

## Resumen

`ssurface/cot-baseline-tokenskip-g70-s7` es un adaptador LoRA de compresión de cadenas de razonamiento (chain-of-thought, CoT) desarrollado por ssurface (Anatolii Frolov) como parte de una línea de investigación sobre "dialectos de compresión de CoT". El adaptador se entrena sobre el modelo base Qwen/Qwen3-4B-Instruct-2507 mediante fine-tuning supervisado (SFT) por destilación, y su objetivo es reproducir de forma comparable la técnica TokenSkip, que reduce el número de tokens de razonamiento generados por el modelo manteniendo la precisión en tareas matemáticas.

El modelo está pensado como un baseline de referencia dentro de un estudio comparativo: el autor enfatiza que los resultados se obtienen con su propio harness de evaluación y sobre su base, de modo que la comparación con otros adaptadores de la misma familia sea consistente. Se evalúa exclusivamente en GSM8K (test, n=1317) con decodificación greedy, sin ejemplos ni self-consistency, alcanzando un 79,7% de exact match.

La relevancia actual del modelo reside en su utilidad para investigar métodos de compresión de razonamiento en modelos de lenguaje, un área activa para reducir costes de inferencia y latencia en aplicaciones que dependen de cadenas de pensamiento largas. Al ser un adaptador pequeño (0,2 GB) sobre un base de 4B, puede ejecutarse en hardware de consumo, lo que facilita su uso en entornos de investigación y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) + adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA: r=16, alpha=32, dropout=0.05; base ~4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa max sequence 1024; el contexto del base no se especifica en la ficha) |
| Tipos de cuantizacion | bf16 (entrenamiento); no se publican cuantizaciones adicionales |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only con arquitectura estándar de Qwen3. El adaptador se entrena mediante SFT por destilación: la pérdida se calcula únicamente sobre las completaciones (completion loss), con longitudes de prompt precomputadas en tiempo de carga en lugar de mediante búsqueda de patrones, una decisión que el autor señala como corrección frente a un colador de patrones que silenciaba el masking y permitía que el prior de tool-calling del base se filtrara en las cadenas.

Los hiperparámetros de entrenamiento son: LoRA con r=16, alpha=32 y dropout=0.05; 3 épocas; learning rate 2e-4 con scheduler coseno y warmup del 3%; batch efectivo de 64 (16 de batch con 4 pasos de grad-accum); longitud máxima de secuencia 1024; precisión bf16; y una GPU NVIDIA A100 80GB. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se menciona el uso de openai/gsm8k. No se aplican técnicas como RLHF o DPO; el método es exclusivamente SFT.

## Capacidades

- Razonamiento matemático: resuelve problemas de aritmética y álgebra de nivel escolar (GSM8K) con un 79,7% de exact match en el test.
- Generación de texto: como adaptador sobre un instruct model, conserva la capacidad de generar texto conversacional y seguir instrucciones del base.
- Chain-of-thought: genera cadenas de razonamiento explícitas, aunque con compresión de tokens (objetivo del método TokenSkip).
- Sin soporte de tool calling: el autor indica que el base tiene un prior de tool-calling que se intentó evitar durante el entrenamiento; el adaptador no añade ni documenta capacidades de function calling.
- Sin capacidades multimodales: solo texto.
- Multilingüe limitado: entrenado y evaluado solo en inglés.

## Casos de uso

- Investigación en compresión de razonamiento: sirve como baseline para comparar métodos de reducción de tokens de CoT (TokenSkip, dialectos de compresión) en un entorno controlado y reproducible.
- Evaluación de robustez de modelos matemáticos: permite medir cómo varía la precisión en GSM8K al comprimir las cadenas de pensamiento, útil para estudiar el equilibrio entre latencia y exactitud.
- Prototipado de asistentes educativos: puede integrarse en un sistema de tutoría que genere explicaciones paso a paso de problemas matemáticos, aunque limitado a inglés y a un solo dominio.
- Benchmarking de adaptadores LoRA en hardware de consumo: al ser un adaptador pequeño sobre un base de 4B, es útil para validar pipelines de fine-tuning y despliegue en GPU domésticas.
- Estudio de artefactos de entrenamiento: el autor documenta un problema con el colador de patrones; el modelo puede usarse para analizar cómo los fallos de masking afectan a la calidad del razonamiento.
- Reproducción de resultados científicos: al publicarse con código y configuración detallada, permite replicar el experimento y verificar la cifra de 79,7% en GSM8K.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (verificados por el propio harness, no por un tercero):

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Razonamiento matemático | GSM8K | test | Accuracy (exact match) | 79,7% |

Condiciones de evaluación: n=1317, decodificación greedy, single-turn, sin ejemplos y sin self-consistency. El autor advierte que diferencias de un par de puntos están dentro del ruido estadístico (intervalo de confianza del 95% con semianchura ~2,7 puntos porcentuales para n=1317). No se proporcionan resultados en otros benchmarks.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-4B-Instruct-2507 en bf16 ocupa aproximadamente 8 GB; el adaptador LoRA añade menos de 0,5 GB. Total estimado entre 8 y 10 GB para inferencia en bf16.
- GPU recomendadas: cualquier GPU con al menos 10 GB de VRAM (RTX 3080/3090, RTX 4070 Ti/4080/4090, A10, A100). En cuantización de 8 bits o 4 bits del base, cabría en GPUs de 6-8 GB.
- Compatibilidad con GPU de consumo: sí, es viable en RTX 3090 o superior; con cuantización del base también en RTX 3060 12GB.
- Opciones de despliegue: el flujo de uso documentado es `transformers` + `peft` con carga del adaptador sobre el base. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, aunque es probable que funcione con vLLM si se soporta LoRA.
- Latencia y throughput: no disponibles. Al ser un modelo de 4B, en una RTX 4090 se espera una generación de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas en la información proporcionada. El autor indica que este adaptador es un baseline para comparar con otros "dialectos de compresión" de su misma línea de investigación, pero no se listan modelos concretos ni sus resultados. Como referencia contextual, el modelo base Qwen3-4B-Instruct-2507 sin adaptar suele obtener resultados superiores en GSM8K (típicamente >80%), pero no se ha verificado en esta ficha. No se incluyen comparaciones con otros modelos de compresión de CoT (p. ej., CompactCoT o Coconut) por falta de datos.

## Limitaciones y advertencias

- Dominio restringido: entrenado y evaluado únicamente en problemas matemáticos de GSM8K; su rendimiento en otras tareas de razonamiento o generación no está validado.
- Degradación con la dificultad: la precisión cae conforme aumenta la complejidad del problema, especialmente en los niveles de compresión más agresivos.
- Variabilidad estadística: el resultado de 79,7% proviene de una sola semilla; diferencias de ±2,7 puntos porcentuales (intervalo del 95%) son esperables en repeticiones.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas fuera de su distribución.
- Idioma: solo inglés; no se ha probado en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3-4B-Instruct-2507, cuya licencia original (Qwen) debe verificarse para usos comerciales.
- Sin soporte para tool calling: aunque el base lo tiene, el adaptador se entrenó para evitar ese prior; no se garantiza su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-baseline-tokenskip-g70-s7
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Paper citado (sin enlace directo): "Chain-of-Thought Compression Dialects" de Anatolii Frolov (2026)
