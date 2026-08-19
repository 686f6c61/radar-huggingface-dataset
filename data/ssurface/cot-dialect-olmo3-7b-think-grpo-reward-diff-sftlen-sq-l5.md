# ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para producir cadenas de pensamiento (chain-of-thought) comprimidas al nivel extremo L5, es decir, una única expresión colapsada de unos 16 caracteres de mediana. El adaptador se enmarca en la investigación sobre "dialectos de compresión de CoT" y constituye una ablación explícita: no es uno de los modelos principales de la familia, sino una variante entrenada con una función de recompensa alternativa (`reward-diff-sftlen-sq`) para permitir reproducir la comparación de diseños de recompensa descrita en el artículo asociado.

El modelo se entrenó con GRPO sobre el adaptador SFT de nivel L5 previamente fusionado, usando el conjunto de entrenamiento de GSM8K reexpresado por un modelo profesor. El resultado declarado es una precisión del 60,5 % en el test de GSM8K (n=1317, decodificación greedy, una sola pasada, sin ejemplos ni self-consistency). La relevancia actual radica en que permite estudiar empíricamente cómo afecta la compresión extrema del razonamiento a la exactitud matemática y cómo influye el diseño de la recompensa en el rendimiento final, un área de interés creciente para reducir costes de inferencia en modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OLMo-3-7B-Think (transformador decoder-only) |
| Parametros totales | Adaptador LoRA r=16, alpha=32 (tamano del repo 0.2 GB); modelo base ~7B (no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Olmo-3-7B-Think) |
| Tipos de cuantizacion | No disponible (el codigo de uso emplea bfloat16 para el modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de la familia OLMo 3 de AllenAI, preentrenado en el corpus Dolma 3 y postentrenado en los conjuntos Dolci. El adaptador LoRA tiene rango 16 y alpha 32, y se entrena con GRPO (implementado con `trl.GRPOTrainer` sobre `transformers` estándar, atención `sdpa`) sobre el modelo SFT de nivel L5 previamente fusionado. El conjunto de datos de entrenamiento consiste en 6993 ejemplos de GSM8K train reexpresados a nivel L5 por un modelo profesor, con una mediana de longitud de cadena de 16 caracteres dentro de la etiqueta `thinking` (frente a 532 caracteres en el nivel L1, un rango de 33x). Un ejemplo de cadena L5 es `18/3*2=12`.

La función de recompensa combina tres componentes: `correctness_sq` (corrección con el peso de complejidad al cuadrado), `format` (exigencia de un único bloque `thinking... response` seguido de `#### <answer>`) y `sft_length_sq` (penalización cuadrática por sobrepasar la longitud del SFT). El entrenamiento se realizó con 8 generaciones por prompt, batch 64 con 1 acumulación, máximo de 256 tokens de completado, learning rate 1e-05 y coeficiente KL (beta) 0.01, en una única GPU NVIDIA A100 80GB. Una nota técnica relevante: se descartaron 13 adaptadores cuyas matrices `lora_B` resultaron ser todas cero (producidas por el path con kernels fusionados); todos los adaptadores publicados verifican `lora_B != 0`.

## Capacidades

- Razonamiento matemático con cadena de pensamiento extremadamente comprimida (nivel L5, expresiones colapsadas de ~16 caracteres).
- Generación de texto en inglés siguiendo el formato de respuesta estructurada `thinking... response` y `#### <answer>`.
- Especialización en problemas de palabras matemáticas del conjunto GSM8K (entrenado y evaluado exclusivamente en este dominio).
- No soporta tool calling, function calling, ni capacidades multimodales (no se mencionan en la documentación).
- Capacidad multilingüe limitada al inglés (único idioma declarado).
- No incorpora modo de pensamiento explícito adicional; el "thinking" está integrado en la cadena comprimida.

## Casos de uso

- Investigación sobre compresión de chain-of-thought: permite estudiar cómo la compresión extrema (nivel L5) afecta a la exactitud en razonamiento matemático, comparando con niveles L1-L4 de la misma familia.
- Comparación de diseños de recompensa en RL: al ser una ablación con `reward-diff-sftlen-sq`, es útil para reproducir y verificar el efecto de la función de recompensa en el rendimiento final frente al modelo principal `ssurface/cot-dialect-olmo3-7b-think-grpo-l5`.
- Inferencia de bajo coste en problemas matemáticos simples: al generar cadenas de solo ~16 caracteres, el coste de generación por consulta se reduce drásticamente frente a modelos con CoT extenso, adecuado para entornos con restricciones de latencia o presupuesto.
- Generación de soluciones concisas para materiales educativos: producir respuestas matemáticas paso a paso en formato ultracompacto, útil para sistemas de tutoría que requieran explicaciones mínimas.
- Evaluación de robustez en modelos comprimidos: medir la degradación de precisión según la dificultad del problema y el nivel de compresión, información valiosa para decidir umbrales de compresión en producción.
- Verificación de integridad de adaptadores LoRA: el flujo de publicación incluye comprobaciones de matrices `lora_B` no nulas; este adaptador puede servir como caso de prueba para pipelines de control de calidad en despliegue de adaptadores.

## Benchmarks y rendimiento

Se ha publicado un único resultado oficial en la model card:

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Razonamiento matematico | GSM8K (openai/gsm8k) | test | Accuracy (exact match) | 60,5 % |

Condiciones de evaluación: n=1317, decodificación greedy, una sola pasada, sin ejemplos y sin self-consistency. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` (~7B parámetros) en memoria.
- VRAM estimada para inferencia: al menos 14-16 GB para el modelo base en bfloat16 (7B × 2 bytes) más overhead de activaciones y el adaptador fusionado; se recomienda una GPU con 24 GB o más para operar con margen.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), RTX 4090, RTX 3090, o GPUs de datacenter equivalentes con ≥24 GB.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 con cuantización del modelo base (por ejemplo, 4 bits) y el adaptador fusionado.
- Opciones de despliegue: `transformers` + `peft` (código de uso oficial), compatible con `vLLM` si se fusiona previamente el adaptador, y con `llama.cpp`/`Ollama` si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no se proporcionan datos medidos; la compresión a L5 reduce significativamente el número de tokens generados por consulta, lo que mejora la latencia frente a modelos con CoT largo.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | GSM8K test | Notas |
|---|---|---|---|---|
| `ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-l5` (este) | Ablacion LoRA L5 | GRPO con reward `correctness_sq` + `format` + `sft_length_sq` | 60,5 % | Publicado para comparar disenos de recompensa |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` | Modelo principal LoRA L5 | GRPO con reward estándar | No disponible | Modelo de referencia del nivel L5 |
| `ssurface/cot-dialect-olmo3-7b-think-sft-l5` | Adaptador SFT L5 | SFT sobre GSM8K reexpresado a L5 | No disponible | Necesario como paso previo antes de cargar este adaptador |
| `allenai/Olmo-3-7B-Think` | Modelo base | Preentrenamiento + postentrenamiento (Dolma 3 / Dolci) | No disponible | Sin adaptador, razonamiento sin compresión |

No se dispone de resultados de rendimiento para los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matemáticas (GSM8K); no hay evidencia de generalización a otros dominios.
- La precisión cae con la dificultad del problema, y esta caída es más pronunciada en los niveles de compresión extremos como L5.
- Es una ablación experimental: fue entrenado para responder una pregunta concreta sobre diseño de recompensa y puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`).
- Requiere cargar primero el adaptador SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo con el modelo base antes de aplicar este adaptador; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproducirá el resultado declarado.
- El entrenamiento se realizó con una única semilla; diferencias de un par de puntos porcentuales están dentro del ruido estadístico (intervalo de confianza del 95 % de ~2.7 pp en n=1317).
- Solo soporta inglés; no hay indicios de capacidades multilingües.
- Riesgo de alucinación no evaluado específicamente; al ser un modelo de razonamiento comprimido, las respuestas incorrectas pueden presentarse con alta confianza.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base `Olmo-3-7B-Think`, que también es Apache 2.0, sin restricciones adicionales conocidas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Página oficial de OLMo (AllenAI): https://allenai.org/olmo
- Referencia citada en la model card: Frolov, Anatolii, "Chain-of-Thought Compression Dialects", 2026 (sin enlace directo proporcionado).
