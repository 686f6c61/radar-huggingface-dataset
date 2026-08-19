# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed3-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3chain-seed3-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para producir cadenas de pensamiento extremadamente comprimidas, correspondientes al nivel de compresión L5 ("expresión pura"). En este nivel, la cadena de razonamiento se reduce a una única expresión aritmética corta (por ejemplo, `18/3*2=12`), en contraste con las cadenas verbosas típicas de los modelos de razonamiento. El adaptador se entrena mediante GRPO sobre un modelo SFT previamente fusionado a ese mismo nivel de compresión, y se publica como una ablación para estudiar el impacto del diseño de recompensa en la calidad del razonamiento comprimido.

El modelo base, Olmo-3-7B-Think, es un modelo de lenguaje de 7.000 millones de parámetros desarrollado por AllenAI dentro de la familia Olmo 3, entrenado sobre el corpus Dolma 3 y licenciado bajo Apache 2.0. Este adaptador añade una capa de especialización en razonamiento matemático con cadenas de pensamiento ultrabreves, manteniendo la licencia abierta del modelo base. El repositorio del adaptador ocupa 0.2 GB y contiene únicamente los pesos LoRA, por lo que su uso requiere cargar previamente el modelo base y el adaptador SFT correspondiente al nivel L5.

La relevancia de esta publicación radica en su carácter de experimento controlado: permite reproducir y comparar el efecto de una función de recompensa específica (`gr3`) en la compresión del razonamiento, un área de investigación activa en eficiencia de inferencia y explicabilidad de modelos. No es un modelo destinado a producción, sino una herramienta de análisis para la comunidad investigadora.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Olmo-3-7B-Think) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA r=16, alpha=32 (tamaño del adaptador no especificado) |
| Parametros activos | 7B (modelo base, el adaptador se fusiona) |
| Longitud de contexto | no disponible (el modelo base Olmo-3-7B-Think soporta 4096 tokens según documentación de AllenAI, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones GGUF de terceros) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `allenai/Olmo-3-7B-Think`, un transformer decoder-only de 7B parámetros con atención convencional. El entrenamiento sigue un pipeline de dos etapas: primero se genera un modelo SFT fusionado a nivel L5 (compresión extrema de cadenas de pensamiento) y, sobre ese modelo fusionado, se aplica GRPO (Group Relative Policy Optimization) con el framework `trl.GRPOTrainer` de HuggingFace. La configuración de entrenamiento incluye 8 generaciones por prompt, batch de 32 con acumulación de gradientes de 2, máximo de 256 tokens de completación, learning rate de 1e-05 y coeficiente KL (beta) de 0.01. El adaptador LoRA usa r=16 y alpha=32.

La función de recompensa combina cuatro componentes: `correctness` (penaliza o premia según coincidencia con el número de pasos de la solución dorada, dando más peso a problemas difíciles), `format` (exige una estructura de respuesta con bloques `thinking` y `response` seguidos de `#### <respuesta>`), `chain` (un verificador que comprueba que la aritmética escrita en la cadena es correcta) y `gr3` (reescala multiplicativamente las recompensas positivas con un suelo de 0.3, sin alterar el orden entre respuestas correctas e incorrectas). El entrenamiento se realizó en una NVIDIA A100 80GB. Una nota importante: el autor advierte que el uso de kernels fusionados produjo adaptadores con matrices `lora_B` nulas, por lo que se utilizó atención `sdpa` estándar y se verificó que todas las matrices `lora_B` fueran distintas de cero antes de publicar.

El dataset de entrenamiento consiste en 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor, con una mediana de longitud de cadena de 16 caracteres. La familia de modelos cubre niveles de compresión desde L1 (532 caracteres de mediana) hasta L5 (16 caracteres), un rango de 33x.

## Capacidades

- Razonamiento matemático: resuelve problemas de palabras aritméticos (tipo GSM8K) generando una única expresión de cálculo como cadena de pensamiento.
- Compresión de razonamiento: produce cadenas de pensamiento extremadamente cortas (nivel L5), lo que reduce el coste de generación de tokens de razonamiento.
- Formato estructurado de salida: respeta el formato `thinking... response` seguido de `#### <respuesta>`.
- Verificación aritmética interna: la cadena generada debe ser aritméticamente correcta (componente `chain` de la recompensa), lo que reduce errores de cálculo intermedios.
- Entrenamiento específico en GSM8K: el modelo está especializado en problemas de razonamiento matemático de nivel escolar, no en tareas generales.
- Sin capacidades multimodales ni de tool calling: es un modelo de texto puro, sin soporte para funciones externas ni agentes.

## Casos de uso

- Investigación en eficiencia de razonamiento: estudiar cómo la compresión de cadenas de pensamiento afecta a la precisión y al coste computacional en modelos de lenguaje, comparando niveles L1-L5.
- Evaluación de funciones de recompensa: reproducir el experimento de ablación para entender el impacto del componente `gr3` en la calidad del razonamiento comprimido, comparando con el modelo principal `cot-dialect-olmo3-7b-think-grpo-l5`.
- Generación de explicaciones ultracompactas: en sistemas donde se requiere una justificación mínima de la respuesta (por ejemplo, en asistentes de cálculo rápido), el modelo produce una expresión aritmética que valida el resultado.
- Benchmarking de razonamiento matemático: utilizar el adaptador como caso extremo de compresión en conjuntos de evaluación como GSM8K, midiendo la degradación de precisión frente a modelos con cadenas completas.
- Análisis de robustez: examinar cómo la compresión extrema afecta a problemas de dificultad creciente, dado que la precisión cae más rápido en los niveles comprimidos.
- Entrenamiento de modelos posteriores: servir como punto de partida para experimentos de destilación o ajuste fino adicional sobre cadenas de pensamiento cortas, aprovechando la licencia Apache 2.0.

## Benchmarks y rendimiento

Según la model card del autor, el adaptador alcanza un 72.3% de precisión exacta en el conjunto de test de GSM8K (n=1317) con decodificación greedy, en una sola pasada, sin ejemplos y sin self-consistency. Este resultado se obtuvo sobre el modelo fusionado (SFT L5 + adaptador GRPO). No se proporcionan otros benchmarks ni comparaciones con modelos alternativos.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Razonamiento matemático | GSM8K (test, n=1317) | Accuracy (exact match) | 72.3% |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B en bfloat16, se requieren aproximadamente 14-16 GB de VRAM para cargar el modelo base más el adaptador fusionado. Con cuantización 4-bit (por ejemplo, GGUF Q4_K_M), se puede reducir a unos 6-8 GB.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), H100, RTX 4090 (24 GB), RTX 3090 (24 GB) o GPUs con al menos 16 GB para bfloat16. Para cuantización 4-bit, una RTX 3060 (12 GB) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama alta para consumidores (RTX 3090/4090) con cuantización. En bfloat16 sin cuantizar, se necesita al menos 16 GB de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` (como se muestra en el README). Para despliegue en producción, se puede fusionar el adaptador y exportar a GGUF para usar con `llama.cpp` o `Ollama`. También es compatible con `vLLM` si se fusiona previamente.
- Latencia y throughput: no se proporcionan datos específicos. Como referencia, un modelo 7B en una A100 suele generar entre 20 y 40 tokens por segundo con batch pequeño; la compresión L5 reduce drásticamente el número de tokens de razonamiento, lo que mejora la latencia efectiva por respuesta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. El modelo es una variante de investigación dentro de la familia `cot-dialect` del mismo autor, y se puede comparar conceptualmente con:

| Modelo | Parámetros | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed3-l5` (este adaptador) | 7B + LoRA | no disponible | 72.3% | Apache 2.0 | HuggingFace (adaptador) |
| `allenai/Olmo-3-7B-Think` (modelo base) | 7B | 4096 (según documentación de AllenAI) | no disponible en la información | Apache 2.0 | HuggingFace |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (modelo principal del mismo nivel) | 7B + LoRA | no disponible | no disponible en la información | Apache 2.0 | HuggingFace |

El modelo base Olmo-3-7B-Think reporta en su propia documentación un rendimiento superior en GSM8K (alrededor del 88% según AllenAI), pero ese dato no está incluido en la información proporcionada y no debe citarse como verificado. La comparativa directa con otros modelos de razonamiento de 7B (como DeepSeek-R1-Distill-Qwen-7B) requeriría datos de benchmarks que no están disponibles.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matemáticas de palabras (GSM8K); no generaliza a otras tareas de razonamiento o dominios.
- La precisión cae significativamente con la dificultad del problema, y esta caída es más pronunciada en los niveles de compresión extrema como L5.
- Es una ablación experimental, no un modelo de producción. El propio autor indica que puede ser peor que el modelo principal del mismo nivel (`cot-dialect-olmo3-7b-think-grpo-l5`) y que su propósito es responder una pregunta concreta sobre diseño de recompensa.
- Requiere cargar primero el adaptador SFT L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo con el modelo base antes de aplicar este adaptador GRPO. Cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- El resultado de 72.3% se obtuvo con una semilla específica (seed3); diferencias de unos pocos puntos porcentuales están dentro del ruido estadístico (intervalo de confianza del 95% de ±2.7 puntos porcentuales para n=1317).
- Riesgo de alucinación: al comprimir el razonamiento a una única expresión, el modelo puede omitir pasos intermedios que serían necesarios para verificar la respuesta en problemas complejos.
- Limitación de idioma: solo soporta inglés; no se ha evaluado en otros idiomas.
- No se han publicado resultados de benchmarks adicionales más allá de GSM8K; no hay datos sobre sesgos, toxicidad o comportamiento en contextos no matemáticos.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed3-l5
- Modelo base en HuggingFace: https://huggingface.co/allenai/Olmo-3-7B-Think
- Versión GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Página del modelo en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Ficha del modelo en LLMIndex: https://llmindex.net/models/olmo-3-7b-think
- Página del modelo en local-ai-zone: https://local-ai-zone.github.io/models/olmo-3-7b-think.html
