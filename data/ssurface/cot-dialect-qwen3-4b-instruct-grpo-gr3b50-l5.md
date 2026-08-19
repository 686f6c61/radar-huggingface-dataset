# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3b50-l5

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3b50-l5` es un adaptador LoRA de tipo PEFT que se aplica sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` para producir razonamiento matemático extremadamente comprimido, en el llamado "nivel L5" (una única expresión colapsada, con cadenas de pensamiento de una mediana de 16 caracteres). El autor, ssurface (Anatolii Frolov), lo publica como parte de una familia de modelos que exploran "dialectos de compresión de cadenas de pensamiento" mediante entrenamiento con GRPO sobre el conjunto GSM8K.

Este adaptador concreto es una **ablación** del diseño de recompensa: se entrenó con una variante de recompensa denominada `gr3` (reescalado multiplicativo de longitud con suelo en 0.3) para permitir reproducir la comparación de diseños de recompensa descrita en el paper asociado. No es uno de los modelos principales de la familia; el modelo principal del mismo nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`. Su relevancia radica en servir como herramienta de investigación reproducible para estudiar el efecto de la función de recompensa en el aprendizaje por refuerzo aplicado a la compresión de razonamiento.

El adaptador se entrena sobre el modelo SFT fusionado del nivel L5, no sobre el base directamente, y alcanza un 75.2% de exactitud en GSM8K test con decodificación greedy, sin ejemplos ni self-consistency. Está licenciado bajo Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | Modelo base: ~4B; adaptador LoRA r=16, alpha=32 (parametros entrenables no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No especificados; el adaptador se carga en bfloat16 segun el codigo de uso |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer del modelo Qwen3-4B-Instruct-2507, sin modificaciones estructurales. El entrenamiento se realiza en dos fases: primero se genera un modelo SFT fusionado a nivel L5 (a partir de 6993 ejemplos de GSM8K train re-expresados por un modelo teacher con cadenas de razonamiento de mediana 16 caracteres), y después se aplica GRPO sobre ese modelo fusionado usando el `trl.GRPOTrainer` de la librería `transformers` estándar con atención `sdpa` (sin kernels fusionados). La función de recompensa combina cuatro componentes: `correctness` (ponderado por el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`), `chain` (verificador aritmético de las operaciones escritas en la cadena) y `gr3` (reescalado multiplicativo de la recompensa positiva con suelo en 0.3, que no reordena respuestas correctas e incorrectas). Se usó pérdida tipo `dapo`, 8 generaciones por prompt, batch de 16 con 2 acumulaciones, máximo de 256 tokens de completado, learning rate de 1e-05 y coeficiente KL de 0.0. El adaptador LoRA tiene r=16 y alpha=32, y se entrenó en una única NVIDIA A100 80GB.

Una nota técnica relevante: el autor verificó que todos los adaptadores publicados tienen matrices `lora_B` no nulas, descartando 13 que cargaban sin error pero eran matemáticamente inertes.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento ultracomprimidas (nivel L5): produce una única expresión aritmética (ej. `18/3*2=12`) dentro de la etiqueta `thinking`, seguida de la respuesta final en formato `#### <answer>`.
- Generación de texto en inglés para problemas de palabras matemáticas (word problems), específicamente del dominio GSM8K.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible; el modelo está diseñado para razonamiento de un solo paso colapsado.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: compresión de razonamiento (chain-of-thought compression) y diseño de recompensa en RL (ablación `gr3`).

## Casos de uso

- Investigación sobre compresión de cadenas de pensamiento: el adaptador permite estudiar cómo afecta la compresión extrema (L5) a la precisión en tareas aritméticas, sirviendo como punto de comparación con niveles L1 a L4 de la misma familia.
- Evaluación de diseños de recompensa en RLHF/GRPO: al ser una ablación con la recompensa `gr3`, se puede reproducir el experimento de comparación de recompensas descrito en el paper, sin necesidad de reentrenar desde cero.
- Benchmarking de eficiencia de razonamiento: en entornos donde el coste de tokens de razonamiento es crítico (p. ej., APIs de pago por token), este modelo ofrece una alternativa de razonamiento mínimo, aunque con menor precisión que modelos sin compresión.
- Generación de explicaciones concisas para problemas matemáticos en sistemas educativos: puede producir respuestas extremadamente breves (una línea) para ejercicios de aritmética, adecuadas para interfaces de respuesta rápida.
- Pruebas de robustez de verificación aritmética: el componente `chain` de la recompensa valida las operaciones internas, lo que permite experimentar con verificadores formales en pipelines de generación.
- Reproducibilidad de experimentos de RL: dado que se publica con configuración exacta (semilla única, hiperparámetros detallados), sirve como referencia para replicar estudios de GRPO con LoRA en modelos de 4B.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index de la model card):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Razonamiento matematico | GSM8K | test | Accuracy (exact match) | 75.2% |

Condiciones: n=1317, decodificación greedy, single-turn, sin ejemplos ni self-consistency. El autor advierte que la precisión cae con la dificultad del problema, especialmente en los niveles comprimidos, y que la variabilidad por semilla es de aproximadamente ±2.7 puntos porcentuales (95% de ancho a n=1317).

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA pesa 0.1 GB, pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 en bfloat16 (~8 GB de pesos). Con overhead de activaciones, se recomienda al menos 12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior es suficiente; también cabe en GPUs de 16 GB (p. ej., RTX 4080, A10G). Para entrenamiento se usó una A100 80GB.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas consumer de gama alta (RTX 3090/4090) con cuantización FP16/BF16.
- Opciones de despliegue: dado que es un adaptador PEFT, se puede servir con `transformers` + `peft` (merge_and_unload) o exportar a GGUF para `llama.cpp`/`Ollama` tras fusionar. No se menciona soporte nativo para vLLM o TGI, pero el modelo base es compatible.
- Latencia y throughput: no disponibles; se espera una latencia baja al generar cadenas de razonamiento muy cortas (mediana de 16 caracteres).

## Comparativa con modelos similares

No se dispone de datos de benchmarks para modelos comparables en la información proporcionada. El autor menciona que el modelo principal del mismo nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`, pero no publica sus resultados en esta model card. Como referencia cualitativa:

| Modelo | Tipo | Contexto | GSM8K (test) | Licencia |
|---|---|---|---|---|
| Este adaptador (gr3b50-l5) | LoRA sobre Qwen3-4B | No disponible | 75.2% | Apache 2.0 |
| cot-dialect-qwen3-4b-instruct-grpo-l5 | LoRA sobre Qwen3-4B | No disponible | No disponible | Apache 2.0 |
| Qwen3-4B-Instruct-2507 (base) | Modelo completo | No disponible | No disponible | Apache 2.0 |

No se puede establecer una comparación cuantitativa rigurosa sin datos adicionales.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matemáticas (GSM8K); no generaliza a otros dominios de razonamiento.
- La precisión cae rápidamente con la dificultad del problema, especialmente en el nivel L5 (compresión extrema).
- Es una ablación de diseño de recompensa: puede ser peor que el modelo principal del mismo nivel (`cot-dialect-qwen3-4b-instruct-grpo-l5`), ya que fue entrenado para responder una pregunta específica sobre reward design.
- Debe cargarse sobre el modelo SFT fusionado del nivel L5 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`), no directamente sobre `Qwen/Qwen3-4B-Instruct-2507`; cargarlo sobre el base no reproducirá el resultado de 75.2%.
- Variabilidad por semilla: diferencias de un par de puntos porcentuales están dentro del ruido estadístico (95% half-width ~2.7 pp a n=1317).
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinación en problemas fuera de distribución o con formato inesperado; el verificador `chain` solo se aplicó durante el entrenamiento, no en inferencia.
- Sin restricciones de uso comercial (licencia Apache 2.0), pero el uso en producción requiere validación adicional dado su carácter de investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3b50-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo SFT necesario (nivel L5): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5
- Paper citado (sin URL disponible): "Chain-of-Thought Compression Dialects", Frolov, Anatolii, 2026.
