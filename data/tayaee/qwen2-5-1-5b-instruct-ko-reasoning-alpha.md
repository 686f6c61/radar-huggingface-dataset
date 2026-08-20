# tayaee/Qwen2.5-1.5B-Instruct-ko-Reasoning-alpha

## Resumen

Este modelo es un checkpoint de práctica basado en `Qwen/Qwen2.5-1.5B`, fine-tuneado mediante Supervised Fine-Tuning (SFT) por el autor `tayaee` como ejercicio personal de aprendizaje. No está diseñado para uso en producción ni para tareas reales; su propósito es exclusivamente educativo, permitiendo estudiar cómo el SFT modifica el comportamiento de un modelo base pequeño. El checkpoint hereda la arquitectura transformer de Qwen2.5 con 1.543.714.304 parámetros y licencia Apache 2.0. La model card advierte explícitamente que se esperan salidas pobres o inconsistentes, y que el modelo existe para aprender el pipeline de SFT, no para ser un asistente útil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B, típicamente 32.768 tokens, pero no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-1.5B, un transformer decoder-only con atención causal estándar. El entrenamiento consistió en Supervised Fine-Tuning (SFT) sobre el modelo base, sin información pública sobre el dataset utilizado, el número de tokens de entrenamiento ni el proceso de alineación (no se menciona RLHF ni DPO). No se documentan innovaciones técnicas adicionales; el checkpoint es un ejercicio de práctica para comprender cómo el SFT altera el comportamiento de un modelo pequeño. Dado que el autor lo describe como "practice / for-learning-only", no se puede asumir que el fine-tuning haya sido realizado con datos de alta calidad o con una metodología rigurosa.

## Capacidades

- Generación de texto: el modelo puede producir texto, pero con calidad impredecible y probablemente inconsistente, según la advertencia del autor.
- Razonamiento: no se garantiza ningún nivel de razonamiento fiable; el checkpoint no está optimizado para tareas cognitivas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no especificadas; el nombre sugiere un enfoque en coreano ("ko"), pero no hay confirmación.
- Capacidades especiales: ninguna documentada.

## Casos de uso

- Estudio del efecto del SFT en un modelo base: permite comparar el comportamiento de Qwen2.5-1.5B antes y después del fine-tuning, observando cambios en estilo, tono o alucinaciones.
- Aprendizaje del pipeline de fine-tuning: sirve como ejemplo práctico de cómo se entrena y sube un checkpoint SFT a HuggingFace, útil para estudiantes de IA.
- Experimentación con hiperparámetros: se puede usar para probar diferentes configuraciones de generación (temperatura, top-p, etc.) y ver cómo afectan a un modelo pequeño.
- Pruebas de integración técnica: útil para verificar que el modelo carga correctamente con `transformers`, `vLLM` u otras herramientas, sin necesidad de un modelo de calidad.
- Comparación de arquitecturas: permite contrastar el comportamiento de un modelo de 1.5B con otros tamaños o familias, en un contexto educativo.
- Depuración de flujos de inferencia: sirve para probar pipelines de generación de texto en entornos de desarrollo, donde la calidad del output no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado el carácter de práctica del modelo, no se espera que supere al modelo base en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tener 1.5B parámetros, en FP16 requiere aproximadamente 3 GB de VRAM; en cuantización INT8 podría reducirse a ~1.5 GB, aunque no se confirman cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores) puede ejecutar el modelo en FP16. Para mayor comodidad, una RTX 3060 o superior.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: compatible con `transformers` (pipeline de generación), `vLLM` (si se convierte a formato compatible), `llama.cpp` (si se convierte a GGUF), `Ollama` (si se convierte a GGUF) y `Text Generation Inference` (TGI), según las etiquetas de la ficha.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, la latencia será baja en GPUs modernas, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B (base) | 1.543.714.304 | 32.768 (típico) | Apache 2.0 | Modelo base sin fine-tuning, más fiable |
| tayaee/Qwen2.5-1.5B-Instruct-ko-Reasoning-alpha | 1.543.714.304 | no disponible | Apache 2.0 | Checkpoint SFT de práctica, calidad no garantizada |
| Qwen2.5-1.5B-Instruct (oficial) | 1.543.714.304 | 32.768 | Apache 2.0 | Versión instruct oficial de Qwen, con alineación y mejor rendimiento |

La comparativa se limita a modelos de la misma familia y tamaño. No se dispone de datos de rendimiento para este checkpoint, por lo que la comparación se basa en la documentación oficial de Qwen2.5.

## Limitaciones y advertencias

- No apto para uso en producción: el autor lo declara explícitamente como "practice / for-learning-only" y desaconseja cualquier despliegue real.
- Salidas pobres o inconsistentes: se espera que el modelo genere texto de baja calidad, con incoherencias y posibles alucinaciones.
- Sin garantía de razonamiento: no se ha evaluado su capacidad para tareas de razonamiento, matemáticas o código.
- Datos de entrenamiento desconocidos: no se especifica el dataset de SFT, por lo que no se puede evaluar sesgos o cobertura temática.
- Idiomas no confirmados: a pesar del sufijo "ko", no hay documentación sobre los idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es fiable para ello; además, se hereda la licencia del modelo base Qwen2.5, que tiene sus propias condiciones.
- Riesgo de alucinación: al ser un modelo pequeño y sin alineación robusta, es probable que genere información falsa con alta frecuencia.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/tayaee/Qwen2.5-1.5B-Instruct-ko-Reasoning-alpha)
- [Modelo base Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen2.5-1.5B/blob/main/LICENSE)
