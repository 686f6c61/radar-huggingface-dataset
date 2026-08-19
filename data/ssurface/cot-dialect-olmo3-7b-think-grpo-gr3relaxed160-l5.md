# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed160-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3relaxed160-l5` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think` para razonar con cadenas de pensamiento extremadamente comprimidas, denominadas "nivel L5" dentro de la familia de "dialectos de compresión de chain-of-thought". El adaptador forma parte de una serie de experimentos de ablación sobre diseño de recompensas: concretamente, esta variante emplea la recompensa `gr3relaxed160` (un factor de escala multiplicativo con suelo en 0.3 aplicado solo a recompensas positivas) para estudiar cómo afecta la relajación de la presión de compresión al rendimiento final.

El modelo está entrenado con GRPO sobre el conjunto de entrenamiento de GSM8K re-expresado a nivel L5 por un modelo profesor, donde la cadena de razonamiento mediana se reduce a 16 caracteres (frente a 532 en el nivel L1, un rango de 33x). Es un artefacto de investigación, no un modelo de producción: su propósito declarado es permitir reproducir la comparación de recompensas descrita en el paper asociado. Alcanza un 72.1% de exactitud en GSM8K test (n=1317, greedy, sin self-consistency), frente al rendimiento superior del modelo base pero con cadenas mucho más cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre `allenai/Olmo-3-7B-Think` (transformer decoder, 7B) |
| Parametros totales | No disponible (adaptador; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | No disponible (el codigo de uso carga en `bfloat16`; no se documentan cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (via libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo fusionado resultante de aplicar un adaptador SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) al base `allenai/Olmo-3-7B-Think`. El proceso usa `trl.GRPOTrainer` sobre `transformers` estandar con atención `sdpa` (no kernels fusionados; el autor advierte que la ruta fusionada produjo adaptadores con matrices `lora_B` nulas). El dataset de entrenamiento consiste en 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor, con cadenas de razonamiento de 16 caracteres de mediana dentro de la etiqueta `thinking`.

La recompensa combina cuatro componentes: `correctness` (ponderada por el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` seguido de `#### <respuesta>`), `chain` (un verificador aritmético de la cadena interna) y `gr3` (reescalado multiplicativo de la recompensa positiva combinada, con suelo en 0.3, que no puede reordenar respuestas correctas por encima de incorrectas). El entrenamiento usó 8 generaciones por prompt, batch 32 con acumulación 2, máximo 256 tokens de completación, learning rate 1e-5 y KL beta 0.01, sobre una NVIDIA A100 80GB.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento extremadamente comprimidas (nivel L5): la cadena mediana es una única expresión aritmética, p.ej. `18/3*2=12`.
- Generación de texto en formato conversacional (pipeline `text-generation`), restringido al formato de respuesta `thinking...response` + `#### <answer>`.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible; el modelo está diseñado para comprimir el razonamiento, no para ejecutar pasos múltiples explícitos.
- Capacidades multilingües: solo inglés (según metadatos).
- Capacidades especiales: ninguna adicional; es un artefacto de investigación para estudiar la relación entre longitud de cadena y exactitud.

## Casos de uso

- Investigación en compresión de chain-of-thought: permite reproducir el experimento de ablación de recompensas descrito en el paper, comparando esta variante (`gr3relaxed160`) con la versión principal del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`) para aislar el efecto del diseño de recompensa.
- Estudio de eficiencia de razonamiento: sirve para analizar cuánto se puede comprimir una cadena de razonamiento sin perder demasiada exactitud, con aplicaciones potenciales en reducción de latencia y coste de inferencia en tareas matemáticas.
- Benchmark de verificadores aritméticos: el componente de recompensa `chain` actúa como verificador; el adaptador puede usarse para probar métodos de validación de cadenas internas en modelos generativos.
- Evaluación de robustez de GRPO: al ser un artefacto de ablación, es útil para estudiar cómo variaciones en la función de recompensa afectan al rendimiento final en un escenario controlado (GSM8K).
- Pruebas de integración PEFT: el flujo de carga (SFT + GRPO + merge) documentado en la model card sirve como caso de prueba para pipelines de entrenamiento con `trl` y `peft` en `transformers` estándar.
- Docencia y divulgación: como ejemplo didáctico de cómo entrenar adaptadores LoRA con GRPO y recompensas compuestas en un problema de razonamiento matemático.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Razonamiento matemático | GSM8K | test (n=1317) | Accuracy (exact match) | 72.1% |

Condiciones: greedy decoding, single-turn, sin ejemplos, sin self-consistency. El autor indica que la exactitud cae con la dificultad del problema, de forma más pronunciada en los niveles comprimidos, y que el margen de error al 95% es de aproximadamente ±2.7 puntos porcentuales para n=1317.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia: requiere cargar el modelo base `allenai/Olmo-3-7B-Think` (7B parámetros) en `bfloat16`, lo que supone aproximadamente 14-16 GB de VRAM sin cuantización. Con cuantización a 4 bits (p.ej. GPTQ o AWQ) podría caber en GPUs consumer de 8-12 GB, aunque no se documentan configuraciones de este tipo.
- GPU recomendada: el entrenamiento se realizó en una NVIDIA A100 80GB; para inferencia, una RTX 4090 (24 GB) o A10G (24 GB) son suficientes en bf16. Una RTX 3090 (24 GB) también funcionaría.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en cualquier framework que soporte estos (vLLM, TGI, etc.), aunque el flujo requiere fusionar primero el adaptador SFT y luego aplicar este adaptador GRPO. `llama.cpp` y `Ollama` no son compatibles directamente con adaptadores PEFT sin conversión previa a GGUF fusionado.
- Latencia y throughput: no disponible; depende del hardware y de la longitud de la cadena comprimida (16 caracteres de mediana), que reduce drásticamente los tokens generados frente al modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Exactitud GSM8K | Longitud de cadena (mediana) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-gr3relaxed160-l5` (este adaptador) | LoRA sobre Olmo-3-7B-Think | 72.1% | 16 caracteres (nivel L5) | Apache-2.0 | HuggingFace |
| `allenai/Olmo-3-7B-Think` (modelo base) | Modelo completo 7B | No disponible en esta documentación | Cadenas largas (razonamiento estándar) | Apache-2.0 | HuggingFace |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (modelo principal del mismo nivel) | LoRA sobre Olmo-3-7B-Think | No disponible en esta documentación | 16 caracteres (nivel L5) | Apache-2.0 | HuggingFace |

La comparativa directa con otros modelos de razonamiento matemático (p.ej. DeepSeek-R1-Distill-Qwen-7B, Qwen2.5-Math-7B) no está disponible en la información proporcionada. El adaptador es un artefacto de ablación, no un modelo competitivo de propósito general.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas de palabras matemáticas (GSM8K); no es adecuado para otras tareas de razonamiento o generación general sin adaptación adicional.
- La exactitud cae con la dificultad del problema, de forma más acusada en los niveles comprimidos; el nivel L5 sacrifica rendimiento por brevedad.
- Es un artefacto de ablación: fue entrenado para responder una pregunta concreta sobre diseño de recompensas y puede ser peor que el modelo principal del mismo nivel (`grpo-l5`).
- Requiere cargar primero el adaptador SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo con el modelo base antes de aplicar este adaptador; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados declarados.
- Riesgo de alucinación y errores aritméticos: el verificador `chain` se usó durante el entrenamiento, pero no garantiza corrección en inferencia; las cadenas extremadamente cortas pueden omitir pasos intermedios.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse solo en GSM8K (problemas de matemáticas en inglés) el modelo puede reflejar los sesgos del dataset y del modelo profesor.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un adaptador sobre un modelo base con la misma licencia, no hay restricciones adicionales conocidas.
- Reproducibilidad: se usó una sola semilla (salvo que el nombre del repo indique lo contrario); diferencias de unos pocos puntos porcentuales están dentro del ruido estadístico.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed160-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido (nivel L5): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Scripts oficiales de entrenamiento de Olmo 3 (GitHub): https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
