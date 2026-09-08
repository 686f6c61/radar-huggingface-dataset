# zz1358m/Qwen3-30B-A3B-Agentic-ESOpt-Math

## Resumen

El modelo `zz1358m/Qwen3-30B-A3B-Agentic-ESOpt-Math` es un ajuste fino de parámetros completos sobre `Qwen/Qwen3-30B-A3B`, un modelo de arquitectura Mixture of Experts (MoE) de la familia Qwen3. Desarrollado por el usuario `zz1358m`, este checkpoint reproduce de forma determinista las primeras 20 actualizaciones de un proceso de optimización denominado Agentic-ESOpt, que combina estrategias evolutivas con un enfoque agéntico y está orientado a tareas de matemáticas y razonamiento. El modelo totaliza 30.532.122.624 parámetros (≈30.500 millones) y, según la nomenclatura A3B del modelo base, activa aproximadamente 3.000 millones por token. Su relevancia radica en que ofrece una ruta reproducible para estudiar el impacto de la optimización evolutiva sobre modelos MoE de gran tamaño, utilizando un conjunto de archivos de reproducción incluidos en el repositorio. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la licencia del checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer |
| Parámetros totales | 30.532.122.624 (≈30.500 millones) |
| Parámetros activos | ≈3.000 millones (según la notación A3B del modelo base; no se especifica en la documentación del finetune) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (export dtype) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-30B-A3B`, un modelo MoE con 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. El ajuste fino se realiza sobre todos los parámetros (full parameter), no mediante adaptadores como LoRA. El proceso de entrenamiento documentado es un "replay" determinista de las primeras 20 generaciones (generaciones 0 a 19) del algoritmo Agentic-ESOpt. La configuración publicada incluye una población de 16, un paso alpha de 0.0005, normalización de recompensas mediante z-score (con ddof=0 y eps=1e-8) y una programación de sigma tipo coseno que varía de 0.001 a 0.0005. El checkpoint se exporta en formato BF16.

No se especifica el conjunto de datos de entrenamiento ni se mencionan técnicas de RLHF o DPO. El nombre del algoritmo y las etiquetas del repositorio ("agentic", "evolution-strategies", "math") indican que la optimización se dirige a tareas agénticas y matemáticas, pero el repositorio no describe el entorno de recompensa ni las muestras utilizadas. El README incluye los archivos `repro/es_history_theta20.json`, `repro/metrics.json` y los registros de evaluación de DAPO y AIME2026 para verificar la reproducibilidad.

## Capacidades

- Generación de texto conversacional a través del pipeline de `transformers` (text-generation).
- Razonamiento matemático avanzado, especialmente en problemas tipo AIME: las puntuaciones reportadas en AIME2026 (Mean4 28.3, Pass4 46.7) reflejan una capacidad notable en ese dominio.
- Optimización para tareas agénticas (etiqueta "agentic"), aunque la información no documenta formalmente funciones de llamada a herramientas ni soporte de tool calling.
- Reproducibilidad del proceso de entrenamiento gracias a los archivos de replay incluidos, que permiten reconstruir exactamente el estado de los pesos.
- Herencia de las capacidades generales del modelo base Qwen3-30B-A3B (razonamiento y soporte multilingüe), aunque no se han verificado en la información proporcionada.

## Casos de uso

- Investigación en optimización de modelos de lenguaje: el checkpoint y los archivos `repro/` permiten estudiar el efecto del algoritmo Agentic-ESOpt sobre un modelo MoE, comparando el rendimiento en DAPO y AIME2026 con el modelo base.
- Tutoría de matemáticas de nivel olímpico: en un sistema educativo, el modelo puede generar soluciones paso a paso para problemas de tipo AIME, aprovechando su especialización en matemáticas.
- Evaluación de plataformas agénticas: al estar orientado a agentes, puede utilizarse como sujeto de prueba en entornos de razonamiento multi-paso; es necesario validar de forma independiente sus capacidades de tool calling antes de usarlo en producción.
- Prototipos de razonamiento matemático intensivo: la arquitectura MoE ofrece un equilibrio entre calidad y coste de inferencia, adecuado para aplicaciones con muchas consultas de matemáticas.
- Reproducción de experimentos en el ámbito académico: los archivos de evaluación y el historial de entrenamiento permiten a otros investigadores verificar los resultados reportados y explorar la metodología.
- Generación de contenido educativo matemático: creación de problemas, explicaciones y material de práctica para plataformas de aprendizaje.
- Despliegue en infraestructura compartida: al activar solo ≈3.000 millones de parámetros por token, el modelo puede ofrecer un rendimiento útil en entornos donde un modelo denso de 30.000 millones resultaría demasiado costoso.

## Benchmarks y rendimiento

| Benchmark | Mean4 | Pass4 |
|---|---:|---:|
| DAPO | 50.0 | 74.0 |
| AIME2026 | 28.3 | 46.7 |

La evaluación fue realizada con 16 muestras por problema, y la fila correspondiente corresponde al subgrupo con `sample_index` 12–15. `Mean4` es la puntuación media de esas cuatro muestras; `Pass4` es la media del máximo por problema entre esas cuatro. Los valores exactos sin redondear y los registros completos se encuentran en la carpeta `repro/` del repositorio. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 61.1 GB para los pesos en BF16, más memoria para activaciones y cache KV. Se recomienda al menos 80 GB para una ejecución completa.
- GPU recomendadas: NVIDIA A100 80GB o H100 80GB. Con 24 GB (por ejemplo, RTX 4090) no es posible cargar los pesos sin cuantización. El repositorio no incluye versiones cuantizadas.
- Opciones de despliegue: compatible con la librería `transformers`; al ser un modelo MoE, puede servirse con vLLM, TGI u otros motores compatibles. No se incluyen configuraciones específicas de servidor ni archivos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos de benchmarks ni especificaciones de otros modelos finetune comparables. El modelo es un ajuste sobre `Qwen/Qwen3-30B-A3B`, del que hereda la arquitectura, pero no se presentan comparaciones directas con el modelo base ni con otras variantes. Por tanto, la comparativa con modelos similares no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: no es posible confirmar si el modelo puede utilizarse con fines comerciales sin riesgos legales.
- Datos de entrenamiento no disponibles: no se puede evaluar la presencia de sesgos, la diversidad lingüística ni la calidad de los datos utilizados.
- Resultados de evaluación limitados: las puntuaciones de DAPO y AIME2026 se basan en un subconjunto de 4 de 16 muestras (sample_index 12–15), lo que puede no reflejar la capacidad completa del modelo.
- Capacidades de tool calling no documentadas: la etiqueta "agentic" sugiere aptitud para tareas agénticas, pero no hay una descripción formal del soporte de funciones; las aplicaciones de agentes requieren verificación.
- Tamaño del repositorio: solo se publican pesos en BF16 (61.1 GB), sin cuantizaciones de menor tamaño, lo que limita el despliegue en GPUs de consumo.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido incorrecto o no fiable, especialmente en dominios con información ambigua o en problemas matemáticos mal planteados.
- Posible degradación de capacidades generales: la optimización mediante estrategias evolutivas puede especializar el modelo para matemáticas y agentes a expensas de otras habilidades; no se han reportado evaluaciones sobre tareas generales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zz1358m/Qwen3-30B-A3B-Agentic-ESOpt-Math
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
