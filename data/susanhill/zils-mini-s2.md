# SusanHill/zils-mini-s2

## Resumen

Zils mini-s2 es un modelo de lenguaje de 4.539 millones de parámetros (aproximadamente 4,54 mil millones) desarrollado por el usuario SusanHill y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, orientado específicamente a tareas de decisión (tag "decision"), según la información declarada por el autor. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 9,1 GB y requiere código personalizado (`custom_code`) para su carga.

La model card describe el proceso de construcción como una destilación de tipo "soup": un estudiante LoRA-64 destilado a partir de las probabilidades de un profesor denominado `vllm-sr/d3-flash` sobre un conjunto público de datos de decisión (train-split decision pool), promediado con un 30/70 respecto al chasis del pool, con objetivos que combinan las etiquetas del profesor con etiquetas gold públicas. Esta técnica de mezcla de pesos y destilación es relevante para quienes investigan métodos de compresión y ajuste eficiente de modelos pequeños orientados a tareas concretas.

El modelo es relevante ahora porque ejemplifica una tendencia creciente: la especialización de modelos base de tamaño medio (4B) mediante destilación desde profesores mayores y técnicas de merging, buscando obtener capacidades específicas de razonamiento o decisión con un coste computacional reducido. No obstante, la información pública disponible es muy limitada: no hay datos de benchmarks, idiomas soportados, ni detalles sobre el dataset de entrenamiento más allá de la descripción genérica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles específicos no disponibles) |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; se desconoce si existen versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,54 mil millones de parámetros. El autor no proporciona detalles adicionales sobre la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, etc.) más allá de la herencia del modelo base. El tag `qwen3_5` y la presencia de `custom_code` sugieren que la carga requiere código específico del repositorio, probablemente para definir capas o módulos personalizados introducidos durante el ajuste.

En cuanto al entrenamiento, la model card indica que se trata de un estudiante LoRA-64 destilado a partir de las probabilidades de un profesor (`vllm-sr/d3-flash`) sobre un pool público de datos de decisión (train-split). Posteriormente, los pesos del estudiante se promediaron con los del "chasis del pool" en una proporción 0,3/0,7 (estudiante/chasis), usando como objetivos una mezcla de las etiquetas del profesor y etiquetas gold públicas. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La innovación técnica destacable es el uso de destilación de probabilidades (soft labels) combinada con model soup/weight averaging para preservar capacidades del modelo base mientras se especializa en decisiones.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Especialización declarada en tareas de decisión (tag "decision"), aunque no se detalla qué tipo de decisiones (clasificación, elección entre opciones, etc.).
- Soporte de tool calling / function calling: no disponible (no confirmado en la información).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Al ser un fine-tune de Qwen3.5-4B, es plausible que conserve parte de las capacidades del base, pero no hay confirmación explícita.

## Casos de uso

- Clasificación y toma de decisiones automatizada: el modelo está etiquetado como "decision" y entrenado sobre un pool de decisiones, por lo que podría emplearse para tareas de selección entre opciones, enrutamiento o triaje en pipelines, siempre que se valide su comportamiento con datos propios.
- Experimentación en destilación y merging: investigadores pueden usar este modelo como caso de estudio de destilación LoRA-64 desde un profesor mayor y promediado de pesos, comparando con el base Qwen3.5-4B para medir la pérdida o ganancia de capacidades.
- Prototipado rápido en entornos con recursos limitados: con ~4,5 B de parámetros, cabe en GPUs de consumo alto (por ejemplo, RTX 4090 con cuantización) y permite iterar sin infraestructura de datacenter.
- Evaluación de modelos especializados frente a generalistas: útil para comparar si un fine-tune pequeño supera al base en tareas concretas de decisión dentro de un dominio controlado.
- Generación de texto asistida en aplicaciones de nicho: si se confirma que conserva las capacidades del base, podría usarse para resúmenes o respuestas en dominios donde la decisión sea el paso previo.
- Base para nuevos fine-tunes: al ser Apache-2.0 y derivar de Qwen, puede servir como punto de partida para ajustes adicionales con LoRA en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, los 4,54 B de parámetros ocupan aproximadamente 9,1 GB solo en pesos, más overhead de activaciones y KV cache (estimación típica de 12-16 GB para contexto moderado). En cuantización de 8 bits, ~5-6 GB; en 4 bits, ~3-4 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: para FP16, una GPU con 16-24 GB (RTX 4090, A10G, L4, A100 40GB). Para cuantización 4-bit, cabe en GPUs de 8-12 GB (RTX 3060/4060 Ti, RTX 3080).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (FP16) y en RTX 3060/4060 con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: al requerir `custom_code`, es probable que necesite `transformers` con `trust_remote_code=True`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI. La ausencia de versiones GGUF limita el uso en llama.cpp/Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zils mini-s2 | ≈4,54 B | no disponible | Apache-2.0 | Hugging Face (custom_code) | Fine-tune de decisión por destilación |
| Qwen/Qwen3.5-4B (base) | ≈4 B (según nombre) | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva |
| Otros fine-tunes de Qwen 4B | variable | variable | variable | Hugging Face | No se dispone de datos comparativos concretos |

No se dispone de información suficiente para comparar rendimiento con alternativas; la comparativa se limita a parámetros y licencia.

## Limitaciones y advertencias

- Información pública muy escasa: no hay benchmarks, idiomas declarados ni detalles del dataset, lo que impide evaluar su calidad objetivamente.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de evaluación no puede cuantificarse.
- Sesgos conocidos: no disponibles; al entrenarse sobre un pool público no especificado, pueden heredar sesgos del profesor y del dataset.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva tras el fine-tune.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B y del profesor `vllm-sr/d3-flash`, así como de los datos de entrenamiento.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código del repositorio; revisar antes de usar en producción.
- El proceso de merging 0,3/0,7 puede diluir la especialización; validar en el dominio objetivo antes de desplegar.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-mini-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor referenciado (no verificado): `vllm-sr/d3-flash` (no se dispone de URL confirmada)
