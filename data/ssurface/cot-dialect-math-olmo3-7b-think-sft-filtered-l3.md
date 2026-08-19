# ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l3

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `ssurface` (Anatolii Frolov) que se monta sobre el modelo base `allenai/Olmo-3-7B-Think`. Su propósito es entrenar al modelo base para que genere cadenas de razonamiento (chain-of-thought) comprimidas en un "dialecto" de nivel L3, donde cada línea contiene una única asignación simbólica con nombre. Es un experimento de investigación sobre compresión de razonamiento: en lugar de eliminar pasos intermedios, se reexpresan en una notación más densa, manteniendo la trazabilidad.

El adaptador se ha ajustado mediante supervisión fina (SFT) con problemas de entrenamiento del dataset MATH reexpresados a nivel L3 por un modelo profesor, y se ha evaluado en MATH-500 con una precisión del 58,6% (exact match). La relevancia actual radica en explorar si es posible reducir la longitud de las cadenas de razonamiento sin sacrificar precisión, un tema clave para reducir costes de inferencia y latencia en modelos de razonamiento. El adaptador es pequeño (0,2 GB) y se distribuye bajo licencia Apache 2.0, aunque solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base: `allenai/Olmo-3-7B-Think`) |
| Parametros totales | no disponible (modelo base 7B; adaptador LoRA r=16, alpha=32, dropout=0.05) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (máximo 1024 tokens durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (adaptador en bf16; el base puede cargarse en distintas precisiones) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `allenai/Olmo-3-7B-Think`, un modelo de 7B parámetros con capacidad de razonamiento (según su nombre, incluye un modo "think"). El adaptador LoRA usa r=16, alpha=32 y dropout=0.05, y se entrena durante 3 épocas con una tasa de aprendizaje 2e-4 (cosine, warmup 0.03), batch efectivo de 64, secuencias de hasta 1024 tokens y precisión bf16 en una NVIDIA A100 80GB. La pérdida se calcula solo sobre la parte de completación, con longitudes de prompt precomputadas en lugar de búsqueda de patrones, evitando así que el prior de tool-calling del modelo base se filtre en las cadenas.

Los datos de entrenamiento provienen de problemas de entrenamiento de MATH reexpresados a nivel L3 (simbólico intermedio) por un modelo profesor. Se trata de un corpus filtrado, y las reglas de notación son idénticas a las de los dialectos GSM8K, cambiando únicamente la convención de respuesta a `\boxed{}`. No se ha utilizado RLHF ni DPO; es una destilación por SFT.

## Capacidades

- Razonamiento matemático: resuelve problemas de matemáticas de nivel competitivo (MATH-500) con una precisión del 58,6% en exact match.
- Generación de cadenas de razonamiento comprimidas: produce explicaciones simbólicas densas (nivel L3) en lugar de razonamientos verbosos.
- Sigue instrucciones específicas: requiere un prompt con el formato `Solve this using Level 3 (Symbolic). Problem: {problema}`.
- Generación de texto en inglés: al ser un adaptador sobre un modelo de lenguaje, conserva las capacidades generativas del base, aunque no se han evaluado formalmente.
- No soporta tool calling ni function calling de forma explícita (el adaptador se entrenó para razonamiento matemático, no para interacción con herramientas).
- No soporta capacidades multimodales (visión, audio) ni multilingüismo más allá del inglés.

## Casos de uso

- Investigación en compresión de razonamiento: permite estudiar cómo afecta la densidad simbólica de las cadenas de pensamiento a la precisión final, comparando dialectos L1, L3 y L5.
- Evaluación de modelos de razonamiento: puede usarse como baseline en benchmarks de matemáticas (MATH-500) para medir el impacto de la compresión en la exactitud.
- Generación de explicaciones concisas: en aplicaciones donde se requiera mostrar el razonamiento de forma compacta (p. ej., asistentes educativos), el modelo produce pasos simbólicos breves.
- Destilación de conocimiento: sirve como ejemplo de cómo reexpresar un dataset de entrenamiento a un formato más denso mediante un modelo profesor.
- Pruebas de robustez: al ser un adaptador pequeño, permite experimentar con diferentes niveles de compresión sin reentrenar el modelo base completo.
- Integración en pipelines de razonamiento matemático: puede combinarse con otros componentes (verificadores, parsers LaTeX) para resolver problemas de forma más eficiente en tokens.

## Benchmarks y rendimiento

El autor declara un único resultado en el model-index:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test, n=500) | Accuracy (exact match) | 58,6% |

La evaluación se realizó con decodificación greedy, single-turn, sin ejemplos (exemplars) ni self-consistency. El autor advierte que el harness original usaba un formato de respuesta GSM8K (`#### n`) que daba ~0% en estos modelos; los números aquí provienen de un grader específico que normaliza formas LaTeX equivalentes (p. ej., `\frac{14}{3}` == `14/3`). No se han publicado comparaciones con el modelo base sin adaptador ni con otros adaptadores de compresión.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es ligero (0,2 GB), pero el modelo base `Olmo-3-7B-Think` requiere aproximadamente 14 GB en bf16 (7B × 2 bytes). Con cuantización de 4 bits, puede reducirse a unos 4-6 GB.
- GPU recomendadas: una NVIDIA A100 80GB (usada en entrenamiento) es suficiente; para inferencia, una RTX 3090/4090 (24 GB) puede cargar el modelo en bf16, y GPUs con 8-12 GB pueden usar cuantización 4-bit.
- Compatibilidad con consumer GPU: sí, con cuantización (p. ej., bitsandbytes) en GPUs de 8 GB o más.
- Opciones de despliegue: HuggingFace `transformers` + `peft` (carga del adaptador), vLLM (soporta LoRA en algunos backends), TGI (con soporte de adaptadores). No es directamente compatible con llama.cpp/Ollama al ser un adaptador PEFT, aunque el base podría cuantizarse y fusionarse.
- Latencia y throughput: no se han publicado mediciones; depende del hardware y de la longitud de la cadena generada (el nivel L3 reduce tokens de salida respecto a un CoT verboso).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un adaptador específico sobre `Olmo-3-7B-Think`; no hay datos públicos de otros adaptadores de compresión de CoT con los que contrastar. Como referencia cualitativa:

| Modelo | Tipo | Parámetros | Contexto | MATH-500 | Licencia |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l3` | LoRA sobre Olmo-3-7B-Think | 7B + adaptador | no disponible | 58,6% | Apache 2.0 |
| `allenai/Olmo-3-7B-Think` (base) | Modelo completo | 7B | no disponible | no disponible | Apache 2.0 |
| Otros modelos de razonamiento (p. ej., DeepSeek-R1-Distill-Qwen-7B) | Modelo completo | 7B | 128k (típico) | ~55-60% (estimado, no verificado) | MIT |

Esta tabla es orientativa y no debe tomarse como comparación oficial; los datos del base no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de razonamiento matemático en inglés; no es adecuado para otras tareas sin reentrenamiento.
- La precisión cae rápidamente con la dificultad del problema, especialmente en los niveles de compresión más altos.
- El resultado de 58,6% proviene de una única semilla; el autor indica que diferencias de un par de puntos están dentro del ruido estadístico (intervalo de confianza del 95% de ~4,4 puntos porcentuales con n=500).
- No se han evaluado sesgos de género, raza u otros; al ser un modelo de lenguaje, puede heredar sesgos del base.
- Riesgo de alucinación en razonamientos: aunque la compresión L3 reduce la verbosidad, no garantiza corrección lógica.
- Limitación de contexto: el entrenamiento usó secuencias de 1024 tokens, por lo que problemas muy largos pueden truncarse.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo base `Olmo-3-7B-Think` debe verificarse por separado (aunque también es Apache 2.0 según su ficha).
- El adaptador no incluye el tokenizador ni el modelo base; es necesario descargarlos por separado, lo que añade complejidad de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l3
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Referencia citada (sin URL pública): "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026)
