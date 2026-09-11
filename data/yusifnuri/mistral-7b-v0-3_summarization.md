# yusifnuri/Mistral-7B-v0.3_summarization

## Resumen

`yusifnuri/Mistral-7B-v0.3_summarization` es un adaptador LoRA entrenado con QLoRA sobre `mistralai/Mistral-7B-v0.3` para una única tarea: producir resúmenes abstractivos de dos o tres frases a partir de artículos de prensa. Lo publica el autor Yusif Nuri como artefacto reproducible de su tesis de máster "Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models" (SRH University Hamburg, 2026), que compara modelos pequeños ajustados con APIs de proveedores frontera en precisión, latencia, coste, exposición de privacidad y volumen de retorno de la inversión.

No es un modelo de propósito general ni un asistente conversacional. El repositorio ocupa 0,1 GB y contiene únicamente pesos de adaptador (rango 16, alpha 32) que deben cargarse sobre el modelo base de 7,25 mil millones de parámetros mediante PEFT y `transformers`. Su interés es metodológico: permite verificar de forma independiente un benchmark empresarial publicado, algo poco frecuente en adaptadores de este tipo.

Las cifras medidas por el autor son modestas: ROUGE-L de 0,1715 sobre CNN/DailyMail, 2248 ms de latencia media por petición en batch 1 sobre una NVIDIA H200 y un coste imputado de 19,46 USD por millón de tokens generados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base `mistralai/Mistral-7B-v0.3`) con adaptador LoRA insertado en `q_proj`, `k_proj`, `v_proj` y `o_proj` |
| Parámetros totales | 7,25 mil millones en el modelo base; el adaptador añade un conjunto reducido de pesos LoRA (rango 16) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en entrenamiento (max sequence length); la ventana del modelo base Mistral-7B-v0.3 es de 32.768 tokens, no confirmada en la información del adaptador |
| Tipos de cuantización | Entrenado con QLoRA 4-bit NF4 con doble cuantización; el adaptador se puede fusionar con el base en fp16, int8 o 4-bit |
| Idiomas soportados | no disponible (entrenamiento exclusivo sobre CNN/DailyMail en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El método es QLoRA (4-bit NF4 con doble cuantización) sobre la release **base** de Mistral-7B-v0.3, no sobre una versión instruction-tuned. Los hiperparámetros son rango 16, alpha 32, dropout 0,05, tasa de aprendizaje 2e-4 con schedule coseno y 3 % de warmup, optimizador AdamW, 3 épocas, batch efectivo 16 (2 × 8 con acumulación de gradientes), longitud máxima de secuencia 512 tokens y semilla 42. El adaptador se aplica a las proyecciones de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`.

El corpus es CNN/DailyMail 3.0.0 (`abisee/cnn_dailymail`, licencia Apache-2.0) con 5.000 ejemplos de entrenamiento y 500 reservados para selección de checkpoint. No se documenta RLHF, DPO ni ninguna innovación de decodificación o atención: es una receta PEFT estándar con hiperparámetros fijados de forma constante para todas las celdas del benchmark, decisión que el autor describe explícitamente como un límite inferior conservador del rendimiento alcanzable. El prompt esperado en inferencia es `Summarise the following article in 2-3 sentences:\n{text}\nSummary:`.

## Capacidades

- Resumen abstractivo de artículos de prensa en dos o tres frases, condicionado al formato de prompt exacto del entrenamiento.
- Generación de texto libre únicamente dentro de ese dominio y formato; fuera de él el comportamiento no está caracterizado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el entrenamiento se ha realizado solo con datos en inglés.
- No dispone de modo de razonamiento explícito ("thinking mode"), ni de visión, ni de audio.
- Salida limitada en la práctica por los 512 tokens de secuencia usados durante el ajuste.

## Casos de uso

- Agregación de noticias: resumir en dos o tres frases cada artículo ingerido en un lector de feeds o un portal de actualidad, usando el formato de prompt documentado y validando la salida con ROUGE-L contra un conjunto de referencia.
- Clipping de prensa interno: generar sumarios automáticos de recortes para boletines corporativos, desplegando el modelo en una GPU propia para evitar enviar contenido editorial a APIs de terceros.
- Preprocesado para RAG: condensar documentos periodísticos antes de indexarlos en una base vectorial, reduciendo el número de fragmentos y el coste de recuperación posterior.
- Verificación de benchmarks: reproducción independiente del resultado ROUGE-L 0,1715 declarado en la tesis, útil para revisores académicos o equipos que evalúan la metodología antes de adoptarla.
- Punto de referencia de coste: usar la cifra de 19,46 USD por millón de tokens generados para calcular el volumen de breakeven frente a una API comercial en un caso de negocio concreto.
- Plantilla de ajuste fino para otros dominios: reutilizar la receta QLoRA (rango 16, alpha 32, 3 épocas, lr 2e-4) sobre un corpus propio para tareas de resumen especializado.
- Despliegue con restricciones de privacidad: resumir documentos internos sensibles en infraestructura on-premise con una GPU de 24 GB en fp16 o de 12 GB en 4-bit.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| ROUGE-L | 0,1715 |
| Latencia media, batch 1 | 2248 ms |
| Coste por 1M tokens generados | 19,46 USD |

Condiciones de medida declaradas por el autor: una única NVIDIA H200 (141 GB), batch size uno, plena utilización, precio imputado de 3,99 USD por GPU-hora, latencia sin tránsito de red, evaluación el 5 de julio de 2026. Los resultados no son comparables entre tareas porque cada tarea del benchmark usa su propia métrica.

No se han publicado en la información disponible resultados comparativos con otros modelos concretos. La matriz completa del benchmark está en `results/benchmark_matrix.csv` dentro del repositorio de código enlazado más abajo. La evaluación se realizó sobre 200 instancias reservadas, lo que limita el tamaño de efecto detectable a unos diez puntos porcentuales.

## Requisitos de hardware

- Adaptador: 0,1 GB (tamaño del repositorio).
- Modelo base en fp16: aproximadamente 14,5 GB de VRAM (estimación a partir de 7,25 B de parámetros).
- Modelo base en int8: aproximadamente 7,3 GB de VRAM (estimación).
- Modelo base en 4-bit NF4 (cuantización usada en entrenamiento): aproximadamente 3,9 GB de VRAM (estimación).
- GPU medidas por el autor: NVIDIA H200 de 141 GB, batch 1, plena utilización.
- GPU consumer compatibles: RTX 4090 o RTX 3090 (24 GB) para fp16 con margen ajustado; RTX 3060 de 12 GB o RTX 4070 para despliegue en 4-bit.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada en la model card), vLLM con `--enable-lora`, TGI con adaptadores, o llama.cpp/Ollama fusionando previamente el adaptador con el modelo base.
- Latencia medida: 2248 ms por petición en batch 1 sobre H200, excluyendo red.
- Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yusifnuri/Mistral-7B-v0.3_summarization` | 7,25 B (base) + adaptador LoRA r=16 | 512 tokens en entrenamiento | Resumen abstractivo sobre CNN/DailyMail | Apache-2.0 | HuggingFace, PEFT |
| `mistralai/Mistral-7B-v0.3` (base) | 7,25 B | 32.768 tokens (versión base) | Modelo de lenguaje general | Apache-2.0 | HuggingFace |
| Otros SLM ajustados del benchmark de la tesis | no disponible | no disponible | Resumen, generación de código y otras tareas del benchmark | no disponible | `github.com/Yusifnuri/slm-benchmark` |
| APIs de proveedores frontera usadas como contraste | no disponible | no disponible | Mismas tareas del benchmark | no disponible | no disponible |

Las cifras de rendimiento y coste de los modelos alternativos no se reproducen en la información disponible; solo se indica que están recogidas en la matriz del benchmark enlazada en la sección final.

## Limitaciones y advertencias

- Entrenado una sola vez con una única semilla (42): las diferencias reportadas confunden calidad del modelo con varianza de inicialización.
- Especializado en una tarea sobre un único corpus público; no es un asistente de propósito general y no debe tratarse como tal.
- Los corpus de evaluación son benchmarks públicos de larga trayectoria y es plausible que estén presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluación usa 200 instancias reservadas, por lo que el tamaño de efecto detectable queda acotado en torno a diez puntos porcentuales.
- Adaptado desde la release base, no desde una versión instruction-tuned: cualquier déficit es atribuible conjuntamente al modelo y a la adaptación en 4-bit, y ambos factores no se pueden separar dentro de este diseño.
- Hiperparámetros fijados de forma constante y no ajustados por celda: las cifras publicadas son un límite inferior conservador.
- Entrenamiento exclusivamente en inglés; no hay evidencia de capacidad multilingüe.
- El modelo espera un formato de prompt literal (`Summarise the following article in 2-3 sentences:` ... `Summary:`); desviarse de él degrada la salida de forma no caracterizada.
- Ventana de entrenamiento de 512 tokens: los artículos largos pueden truncarse y perder información relevante para el resumen.
- ROUGE-L de 0,1715 es bajo en términos absolutos y debe interpretarse solo como referencia interna del benchmark, no como calidad de producto.
- Licencia Apache-2.0, que permite uso comercial, pero sujeta también a los términos de la licencia del modelo base Mistral-7B-v0.3.
- El repositorio registra 0 descargas y 0 "likes": no existe validación por parte de la comunidad.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/Mistral-7B-v0.3_summarization
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Código, configuraciones y harness de evaluación: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Análisis de coste por petición: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Dataset de entrenamiento: https://huggingface.co/datasets/abisee/cnn_dailymail
- Cita: Nuri, Yusif (2026). *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*. Tesis de máster, SRH University Hamburg.
- Enlaces adicionales procedentes de la búsqueda web: no disponible (los resultados devueltos no guardan relación con el modelo).
