# top0329/zils-flash-a1127

## Resumen

zils-flash-a1127 es un modelo de decisión (decision-model) publicado por el usuario top0329 en Hugging Face, construido como un fine-tune LoRA fusionado sobre un ensemble ("soup") de dos modelos públicos de 9B. El modelo está etiquetado como parte de la familia "d3-flash" y orientado al "Zils subnet 127 flash pool", un contexto de despliegue que no se detalla en la información disponible. Su función declarada es tomar decisiones de recuperación (retrieval) dentro de un pipeline, manteniendo el resto de capacidades del modelo base.

Técnicamente parte de Qwen/Qwen3.5-9B como modelo base declarado, con 8.392.695.024 parámetros reales según los pesos en safetensors (16,8 GB en el repositorio). El entrenamiento consistió en 788 pasos de 16 filas con LoRA de rango 32 sobre proyecciones de atención y MLP, con una tasa de aprendizaje de 2e-5. La licencia es Apache-2.0, con atribuciones MIT adicionales para uno de los componentes upstream.

Su relevancia es limitada y muy específica: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin model card pública de rendimiento ni benchmarks. Resulta útil únicamente como referencia de técnicas de merging de LoRA y de destilación de probabilidades en tareas de retrieval, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B; detalles no disponibles) |
| Parámetros totales | 8.392.695.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con términos MIT reproducidos de elephant-1 en LICENSE-elephant-1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA fusionado (rank 32, aplicado a proyecciones de atención y MLP, learning rate 2e-5, 788 pasos de 16 filas) sobre un "flash soup" público fechado el 26 de noviembre de 2026. Ese soup es la media de pesos equiponderada de dos cuerpos: edinlong83/zils-flash-e2 (copia sin modificar de baselabs/elephant-1, MIT) y jwcwn/zl-flash-body-1 (pesos sin cambios de newsbang/adjudex-9b-v5, Apache-2.0). El modelo base declarado en los metadatos es Qwen/Qwen3.5-9B.

El entrenamiento usa 6.817 filas de retrieval cuyos objetivos son una mezcla a partes iguales entre las probabilidades de un profesor relay de 27B y la etiqueta gold, más 5.787 filas de otras cuatro categorías (razonamiento, lenguaje, herramientas y artes) cuyos objetivos son las propias probabilidades del soup. Este diseño busca que el ajuste en retrieval no degrade el resto de comportamientos del modelo. No se documentan número total de tokens, composición completa del dataset, ni fases de RLHF o DPO.

## Capacidades

- Decisión de retrieval: el modelo está entrenado específicamente para producir probabilidades de recuperación alineadas con un profesor de 27B y con etiquetas gold.
- Razonamiento: se conservan filas de la categoría "reasoning" del soup para mantener esta capacidad, aunque no se cuantifica su rendimiento.
- Lenguaje general: se preservan filas de la categoría "language" del soup.
- Uso de herramientas: se preservan filas de la categoría "tools"; no se detalla si soporta tool calling estructurado.
- Artes: se preservan filas de la categoría "arts" del soup.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Reranking en pipelines de búsqueda: el modelo puede puntuar pares consulta-documento para reordenar resultados de un buscador, dado que su entrenamiento se centró en filas de retrieval con objetivos calibrados contra un profesor de 27B.
- Filtrado de candidatos en sistemas RAG: usar sus probabilidades de decisión para descartar fragmentos irrelevantes antes de pasarlos al modelo generador, reduciendo el coste de contexto.
- Destilación de un profesor grande: sirve como referencia para replicar la técnica de destilar probabilidades de un modelo de 27B en un cuerpo de 9B mediante LoRA de rango 32.
- Investigación sobre merging de pesos: el "soup" equiponderado de dos modelos de 9B es un caso de estudio reproducible para evaluar el impacto del model averaging en tareas de decisión.
- Base para fine-tunes posteriores: al estar bajo Apache-2.0 y en safetensors, puede reutilizarse como punto de partida para ajustes específicos de dominio en tareas de clasificación o ranking.
- Evaluación de preservación de capacidades: permite estudiar si el ajuste en retrieval degrada razonamiento, lenguaje o uso de herramientas, comparando contra el soup original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16.
- GPU de consumo: cabe en RTX 4090 en FP16 y en GPUs de 12-16 GB si se cuantiza, siempre que se generen los pesos cuantizados a partir de los safetensors.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF; no se documentan recetas oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-a1127 | 8,39B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune LoRA de decisión sobre soup de dos 9B |
| Qwen/Qwen3.5-9B (base declarado) | ~9B | no disponible | no disponible en la información | Hugging Face | Modelo base citado en los metadatos |
| baselabs/elephant-1 (componente) | ~9B | no disponible | MIT | Hugging Face | Uno de los dos cuerpos del soup |
| newsbang/adjudex-9b-v5 (componente) | ~9B | no disponible | Apache-2.0 | Hugging Face | Segundo cuerpo del soup |

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- No se publican benchmarks, evaluación de sesgos ni análisis de alucinación; el riesgo en producción es desconocido.
- La model card no documenta longitud de contexto, idiomas soportados ni tipos de cuantización.
- El entrenamiento se limita a 788 pasos de 16 filas; el ajuste es acotado y puede no generalizar fuera del dominio de retrieval del "Zils subnet 127 flash pool".
- La mezcla de objetivos (probabilidades del profesor y del soup) puede introducir deriva respecto al comportamiento del modelo base en tareas distintas de retrieval.
- Aunque la licencia es Apache-2.0, incorpora pesos con términos MIT de elephant-1; es necesario revisar LICENSE-elephant-1 y NOTICE antes de redistribuir.
- El contexto de despliegue ("Zils subnet 127 flash pool") no está descrito, por lo que se desconoce el contrato de entrada/salida esperado.

## Enlaces

- Hugging Face: https://huggingface.co/top0329/zils-flash-a1127
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-9B
- Componente upstream 1: https://huggingface.co/edinlong83/zils-flash-e2
- Componente upstream 2: https://huggingface.co/jwcwn/zl-flash-body-1
- Origen MIT: https://huggingface.co/baselabs/elephant-1
- Origen Apache-2.0: https://huggingface.co/newsbang/adjudex-9b-v5
