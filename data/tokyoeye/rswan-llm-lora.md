# TokyoEye/rswan-llm-lora

## Resumen

El modelo `TokyoEye/rswan-llm-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2-0.5B-Instruct` para la tarea de análisis de sentimiento SST-2 (Stanford Sentiment Treebank). Lo desarrolla el usuario TokyoEye y se distribuye bajo licencia MIT. El adaptador se creó mediante un proceso de barrido de hiperparámetros (sweep) con MLflow, y la versión v3 se presenta como la mejor según la pérdida de validación (val/loss 0.5804). El repositorio incluye los pesos del adaptador en formato PyTorch y un checkpoint adicional.

La relevancia de este modelo radica en su demostración de un flujo de entrenamiento LoRA reproducible y gobernado, con registro de experimentos en MLflow, sobre un modelo pequeño (0.5B parámetros) y con recursos limitados (GPU de 4 GB). No es un modelo de propósito general, sino un adaptador específico para clasificación de sentimiento binaria, útil como ejemplo de fine-tuning eficiente y como punto de partida para experimentos similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2-0.5B-Instruct (transformer decoder) |
| Parametros totales | no disponible (el adaptador LoRA r=4 añade un número reducido de parámetros; el modelo base tiene 0.5B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se indican cuantizaciones para inferencia) |
| Idiomas soportados | no disponible (el modelo base Qwen2 soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | MIT |
| Formato de pesos | PyTorch (state_dict en `model.pt` y `checkpoints/best.pt`) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención y feed-forward. En este caso, se empleó un rango `r=4` y un factor de escala `alpha=8`. El entrenamiento se realizó sobre el dataset `nyu-mll/glue` (subconjunto SST-2) con 200 ejemplos de entrenamiento y 40 de validación, un tamaño de lote efectivo de 8 (batch 2 con acumulación), una época y precisión bf16. El proceso se gestionó con MLflow, registrando métricas y artefactos. La versión v3 se seleccionó como la mejor tras un barrido de hiperparámetros; una versión posterior (v4) mostró una regresión en la pérdida de validación, por lo que v3 se mantiene como la cabeza del estado del arte en este experimento.

No se proporcionan detalles sobre la composición del dataset ni sobre técnicas de alineación adicionales (RLHF, DPO, etc.). El entrenamiento se limitó a la tarea de clasificación de sentimiento.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) sobre textos cortos, específicamente adaptado al conjunto SST-2.
- Inferencia eficiente gracias al pequeño tamaño del adaptador y del modelo base (0.5B parámetros), permitiendo ejecución en GPUs de baja VRAM (4 GB).
- Integración con el ecosistema PEFT (Parameter-Efficient Fine-Tuning) de Hugging Face, lo que facilita su carga y uso con el modelo base.
- No se reportan capacidades de generación de texto, razonamiento, código, tool calling, agentes o multimodalidad, ya que es un adaptador especializado en una tarea de clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el adaptador puede clasificar comentarios de usuarios como positivos o negativos, integrándose en pipelines de análisis de opinión para comercio electrónico o plataformas de reseñas.
- Monitorización de redes sociales: permite detectar la polaridad de publicaciones o menciones de marca en tiempo real, usando el modelo base con el adaptador cargado.
- Filtrado de contenido: puede utilizarse para identificar mensajes negativos o tóxicos en foros o sistemas de mensajería, aunque su entrenamiento específico en SST-2 limita su generalización a otros dominios.
- Prototipado rápido de clasificadores: al ser un adaptador pequeño y con licencia MIT, sirve como base para experimentar con técnicas LoRA y flujos MLflow en entornos de investigación o desarrollo.
- Educación y demostración: útil para enseñar fine-tuning eficiente con LoRA, ya que el repositorio documenta el proceso de entrenamiento y los artefactos generados.
- Benchmarking de adaptadores: puede compararse con otros adaptadores LoRA para SST-2 en términos de precisión y eficiencia, aunque no se proporcionan comparativas en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta únicamente métricas de validación del propio entrenamiento:

| Metrica | Valor |
|---|---|
| val/loss | 0.5804 |
| val/acc | 0.70 |

Estos valores corresponden al conjunto de validación de SST-2 (40 ejemplos) y no se comparan con otros modelos. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: el autor indica que el entrenamiento se probó en una GPU T1000 con 4 GB de VRAM. Para inferencia, el modelo base Qwen2-0.5B-Instruct en bf16 ocupa aproximadamente 1 GB, más el adaptador LoRA (muy pequeño), por lo que cabe en GPUs de 4 GB o incluso menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA T1000, GTX 1650, RTX 3050). También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de Hugging Face junto con el modelo base. También es posible exportar a formatos como GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan dichos artefactos.
- Latencia y throughput: no se especifican. Dado el tamaño reducido del modelo, se espera una latencia baja en GPU (del orden de milisegundos por muestra) y un throughput alto, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para SST-2 sobre Qwen2-0.5B). Se podría comparar con el modelo base sin adaptador, pero no se reportan métricas del modelo base en la información. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador se entrenó con un conjunto de datos muy pequeño (200 ejemplos de entrenamiento, 40 de validación), lo que conlleva un alto riesgo de sobreajuste y una generalización limitada a otros dominios o estilos de texto.
- La precisión de validación (0.70) es modesta; para aplicaciones de producción se recomienda entrenar con más datos y evaluar en conjuntos más amplios.
- No se especifican sesgos conocidos, pero al estar entrenado en SST-2 (reseñas de películas en inglés), puede presentar sesgos hacia ese dominio y idioma.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero la clasificación puede ser errónea en entradas fuera de distribución.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2-0.5B-Instruct tiene su propia licencia (Apache 2.0 según Qwen), que debe respetarse.
- No se proporcionan instrucciones claras de uso ni ejemplos de inferencia en la model card, lo que puede dificultar su adopción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/TokyoEye/rswan-llm-lora
- Paper de LoRA (referencia técnica): https://arxiv.org/abs/2106.09685
- Modelo base Qwen2-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2-0.5B-Instruct
