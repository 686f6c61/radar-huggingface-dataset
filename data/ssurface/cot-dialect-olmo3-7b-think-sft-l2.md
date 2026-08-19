# ssurface/cot-dialect-olmo3-7b-think-sft-l2

## Resumen

cot-dialect-olmo3-7b-think-sft-l2 es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) que modifica el modelo base allenai/Olmo-3-7B-Think para razonar con cadenas de pensamiento comprimidas a un nivel denominado L2, es decir, prosa condensada o pasos con viñetas. El objetivo es reducir la longitud de las cadenas de razonamiento sin sacrificar precisión, lo que abarata la inferencia y reduce la latencia en tareas de razonamiento matemático. El adaptador se entrena mediante destilación supervisada (SFT) sobre el conjunto de entrenamiento de GSM8K, re-expresado por un modelo profesor a un estilo conciso.

El modelo base, OLMo-3-7B-Think, es un transformer decoder-only de 7 000 millones de parámetros desarrollado por el Allen Institute for AI (Ai2), diseñado para razonamiento de contexto largo, llamadas a funciones y codificación. El adaptador LoRA añade un número reducido de parámetros (r=16, alpha=32) y se distribuye en formato safetensors con licencia Apache-2.0. La longitud de contexto del adaptador no se especifica; el entrenamiento usó secuencias de hasta 1024 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OLMo-3-7B-Think (transformer decoder-only de 7B) |
| Parámetros totales | No disponible (el adaptador LoRA añade parámetros; el modelo base tiene 7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con max sequence 1024; el modelo base soporta contexto largo) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre el modelo base OLMo-3-7B-Think, un transformer causal de 7B parámetros con entrenamiento específico para razonamiento (thinking). El adaptador se entrena mediante SFT por destilación con 6950 ejemplos del conjunto de entrenamiento de GSM8K, re-expresados a nivel L2 por un modelo profesor. La mediana de longitud de las cadenas de pensamiento generadas es de 140 caracteres dentro de la etiqueta de pensamiento, frente a los 532 caracteres del nivel L1, lo que supone una compresión de aproximadamente 3,8 veces.

Los hiperparámetros de entrenamiento son: r=16, alpha=32, dropout=0.05, 3 épocas, tasa de aprendizaje 2e-4 con programación coseno y warmup del 3%, tamaño de lote efectivo de 64, secuencia máxima de 1024 tokens, precisión bf16 y hardware de una NVIDIA A100 de 80 GB. La pérdida se calcula solo sobre la parte de completado, con longitudes de prompt precomputadas en tiempo de carga. Se menciona que el collator de búsqueda de patrones no enmascaraba correctamente, lo que permitió que el prior de tool-calling del modelo base se filtrara en las cadenas generadas.

## Capacidades

- Razonamiento matemático: resuelve problemas de palabras aritméticos tipo GSM8K con cadenas de pensamiento comprimidas en pasos con viñetas.
- Generación de texto: puede generar texto en inglés, aunque su especialidad es el razonamiento matemático.
- Compresión de cadena de pensamiento: produce razonamientos significativamente más cortos que el modelo base (mediana de 140 caracteres en L2 frente a 532 en L1).
- No se ha evaluado tool calling, capacidades de agente ni funciones multimodales; el adaptador no añade estas funcionalidades.
- Soporte multilingüe: solo inglés.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede explicar pasos de resolución de problemas aritméticos de forma concisa, adecuado para asistentes educativos que necesitan respuestas rápidas y con bajo consumo de tokens.
- Optimización de costes en inferencia: al reducir la longitud de las cadenas de razonamiento, se reduce el número de tokens generados, lo que abarata las llamadas a APIs o el uso de GPUs en producción.
- Integración en pipelines de agentes con presupuesto de tokens limitado: en aplicaciones donde el contexto es caro, como agentes multi-paso, este adaptador permite mantener el razonamiento sin exceder los límites de tokens.
- Investigación sobre compresión de cadenas de pensamiento: sirve como punto de referencia para estudiar el equilibrio entre longitud de CoT y precisión en modelos de lenguaje.
- Generación de datos sintéticos: puede utilizarse para producir ejemplos de razonamiento conciso que sirvan para entrenar otros modelos o para aumentar datasets.
- Evaluación de robustez en razonamiento matemático: al ser un adaptador específico para GSM8K, puede usarse en experimentos de generalización y degradación con problemas de dificultad creciente.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Razonamiento matemático | GSM8K (test, n=1317) | Accuracy (exact match) | 86.3% |

Resultado declarado por el autor, obtenido con decodificación greedy, single-turn, sin ejemplos y sin self-consistency. No se proporcionan comparaciones con el modelo base ni con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.2 GB en disco) y se carga sobre el modelo base OLMo-3-7B-Think.
- Para inferencia del modelo base en bf16 se estiman aproximadamente 14-16 GB de VRAM, aunque no se proporciona un dato oficial; el entrenamiento usó una NVIDIA A100 de 80 GB.
- Puede ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090 (24 GB) si se cuantiza el modelo base a 8 o 4 bits, aunque no se documentan configuraciones oficiales.
- Opciones de despliegue: transformers + peft (según el ejemplo de uso proporcionado), y potencialmente vLLM u Ollama si se carga el adaptador, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado comparaciones con otros adaptadores de compresión de cadenas de pensamiento ni con el modelo base sin adaptador.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos de palabras (GSM8K); no se ha probado en otras tareas.
- La precisión cae con la dificultad del problema, especialmente en los niveles de compresión más altos.
- Variabilidad por semilla: diferencias de un par de puntos porcentuales están dentro del ruido estadístico (intervalo de confianza del 95% de aproximadamente 2.7 puntos porcentuales para n=1317).
- Solo soporta inglés.
- No se han evaluado sesgos ni alucinaciones; al ser un adaptador sobre un modelo base, puede heredar sesgos del entrenamiento de OLMo.
- El adaptador no añade tool calling ni capacidades multimodales; aunque el modelo base tiene tool calling, el adaptador no lo documenta ni lo mejora.
- Para uso en producción, se recomienda validar el comportamiento en el dominio específico y con datos propios.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l2
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo base SFT: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Página de Olmo en Ai2: https://allenai.org/olmo
- Repositorio open-instruct (scripts de entrenamiento): https://github.com/allenai/open-instruct/blob/main/scripts/train/olmo3/README.md
