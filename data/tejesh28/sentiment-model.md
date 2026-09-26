# tejesh28/sentiment-model

## Resumen

`sentiment-model` es un modelo de clasificación de texto publicado por el usuario tejesh28 en HuggingFace, consistente en un ajuste fino (fine-tuning) de `distilbert-base-uncased` sobre un dataset que el autor no documenta. Se trata, por tanto, de un derivado de DistilBERT, la versión destilada de BERT con 6 capas y 66.955.779 parámetros totales, orientado a la tarea de análisis de sentimiento según declara su nombre. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors, listos para su carga con la librería `transformers` y compatibles con `endpoints_compatible`.

El modelo resuelve una tarea de clasificación de secuencias (pipeline `text-classification`) y su relevancia es limitada: se trata de un experimento de ajuste fino generado automáticamente con el `Trainer` de HuggingFace, sin model card completada (las secciones de descripción, usos previstos y datos de entrenamiento figuran como "More information needed"). No acumula descargas ni valoraciones en el momento de redactar esta ficha, y su rendimiento declarado es modesto: accuracy de 0,6598 y F1 ponderado de 0,6493 sobre el conjunto de evaluación.

Por su tamaño, es un modelo ligero que puede ejecutarse en CPU y en cualquier GPU de consumo, lo que lo hace utilizable como punto de partida para experimentos de clasificación o como base para un ajuste adicional. Sin embargo, la ausencia de documentación sobre el dataset, el esquema de etiquetas y el dominio de aplicación limita seriamente su uso en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT), heredada de `distilbert-base-uncased` |
| Parametros totales | 66.955.779 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de `distilbert-base-uncased`; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | No disponible en la model card. El modelo base `distilbert-base-uncased` está entrenado principalmente con texto en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-classification |
| Modelo base | distilbert/distilbert-base-uncased |
| Dataset de entrenamiento | No disponible (la model card indica "unknown dataset") |
| Numero de etiquetas | No disponible |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas con atención multi-cabeza completa, resultado de la destilación de conocimiento de BERT-base (12 capas) mediante la técnica de distillation de Sanh et al. No incorpora mecanismos de atención lineal, decodificación especulativa ni capas recurrentes o híbridas. El entrenamiento documentado corresponde únicamente al ajuste fino sobre el modelo base, no a un preentrenamiento nuevo.

Los hiperparámetros declarados en la model card son: learning rate 2e-05, `train_batch_size` 32, `eval_batch_size` 32, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), scheduler lineal y 3 épocas. El entrenamiento se ejecutó con Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se documenta composición del dataset, número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO (en un modelo de clasificación de este tamaño no serían esperables). La pérdida de entrenamiento descendió de 1,0498 a 0,6785 entre la primera y la tercera época, mientras que la pérdida de validación alcanzó su mínimo en la época 2 (0,7226) y repuntó en la época 3 (0,7117), un patrón compatible con sobreajuste leve.

## Capacidades

- Clasificación de texto (pipeline `text-classification`): el modelo devuelve una distribución de probabilidad sobre un conjunto de etiquetas no documentado, presumiblemente relacionado con polaridad de sentimiento.
- Análisis de sentimiento: capacidad implícita en el nombre del modelo, aunque no verificable documentalmente por falta de descripción de las etiquetas.
- Procesamiento de secuencias de hasta 512 tokens (límite heredado del tokenizador de DistilBERT).
- Inferencia ligera: al tratarse de un modelo de 66,9 M de parámetros, puede ejecutarse en CPU con latencias bajas.
- No se documenta soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento. Estas capacidades no son propias de un encoder de clasificación.
- Capacidades multilingües: no disponibles; el modelo base está orientado a inglés.

## Casos de uso

- Clasificación de polaridad en reseñas de producto: el modelo puede asignar una etiqueta de sentimiento a textos cortos de opinión, siempre que se valide antes qué etiquetas aprendió, ya que el esquema no está documentado.
- Moderación de comentarios en foros o redes: uso como primer filtro para detectar contenido negativo antes de una revisión humana, aprovechando su bajo coste computacional por inferencia.
- Enrutamiento de tickets de soporte: clasificar el tono de un mensaje entrante (satisfecho frente a insatisfecho) para priorizar la cola de atención al cliente.
- Análisis de encuestas NPS: procesar respuestas abiertas y agregar la polaridad en paneles de métricas internas, con la advertencia de que el accuracy declarado (0,6598) exige calibrar el umbral de decisión.
- Base para un ajuste fino específico de dominio: al ser un checkpoint pequeño y con licencia Apache 2.0, puede reentrenarse rápidamente sobre un corpus propio de opiniones en un dominio concreto (finanzas, sanidad, e-commerce).
- Prototipado y docencia: sirve como ejemplo mínimo de pipeline de clasificación con `transformers` y safetensors, útil en entornos con recursos limitados o sin GPU.
- Generación de etiquetas débiles (weak supervision): usado junto con reglas heurísticas para preetiquetar grandes volúmenes de texto antes de una anotación humana, dado su bajo coste por documento.

## Benchmarks y rendimiento

La model-index del autor declara una lista de resultados vacía (`results: []`), por lo que no hay benchmarks oficiales publicados (MMLU, GLUE, etc.). Los únicos datos disponibles son las métricas de evaluación del propio ajuste fino, extraídas de la model card:

| Métrica | Valor en el conjunto de evaluación |
|---|---|
| Loss | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento:

| Training loss | Época | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1,0498 | 1.0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2.0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3.0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 (aproximadamente 268 MB solo para los pesos) y alrededor de 150 MB en fp16. El cuello de botella real es el tamaño de lote y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problemas en GTX 1650, RTX 3060, RTX 4090, T4, A10, L4, A100 y H100; en estas dos últimas el modelo desaprovechará la mayor parte de la capacidad de cómputo salvo que se procesen lotes muy grandes.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas e incluso en iGPU con memoria compartida suficiente.
- Cabe en CPU: sí; la inferencia en CPU es viable para volúmenes moderados (decenas a cientos de documentos por segundo según núcleos y longitud de secuencia).
- Opciones de despliegue: `transformers` con PyTorch, `optimum`/ONNX Runtime, TorchScript, y servidores de inferencia como TGI o vLLM (aunque para un encoder de 66 M de parámetros, un servidor ligero tipo FastAPI con ONNX Runtime suele ser más eficiente). No se han publicado pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversión previa.
- Latencia y throughput estimados: no disponibles; la model card no reporta mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| tejesh28/sentiment-model | 66.955.779 | 512 tokens (heredado) | Clasificación de texto | apache-2.0 | Accuracy 0,6598; F1 weighted 0,6493 |
| distilbert-base-uncased | 66.955.779 | 512 tokens | Modelo base preentrenado | apache-2.0 | No aplica (no es clasificador) |
| distilbert-base-uncased-finetuned-sst-2-english | Aproximadamente 67 M | 512 tokens | Clasificación de sentimiento binaria | apache-2.0 | No disponible en la información proporcionada |
| bert-base-uncased | Aproximadamente 110 M | 512 tokens | Modelo base preentrenado | apache-2.0 | No disponible en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no es posible con los datos proporcionados: el autor no publica comparaciones ni referencias a otros checkpoints, y la model-index está vacía.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de `distilbert-base-uncased`, entrenado con texto mayoritariamente en inglés, es esperable que herede sesgos de género, raza y registro presentes en los corpus web utilizados para el preentrenamiento, pero el autor no los analiza.
- Riesgo de alucinación: bajo en el sentido generativo, ya que el modelo no genera texto libre; sin embargo, puede producir clasificaciones erróneas con alta confianza, especialmente en dominios alejados del dataset de entrenamiento.
- Rendimiento limitado: un accuracy de 0,6598 y un F1 macro de 0,6493 son valores bajos para una tarea de clasificación de sentimiento, donde los modelos ajustados sobre SST-2 suelen superar el 0,90. Esto sugiere un dataset de entrenamiento pequeño, ruidoso o con más de dos clases.
- Sobreajuste: la pérdida de validación empeora en la tercera época (0,7117 frente a 0,7226 en la segunda), mientras la pérdida de entrenamiento sigue bajando; el checkpoint final no es el mejor en validación.
- Dataset y etiquetas desconocidos: la model card indica explícitamente "unknown dataset" y no especifica el número ni el significado de las etiquetas, lo que impide saber qué predice realmente el modelo. En su estado actual, no es seguro integrarlo en producción sin inspeccionar `config.json` y probar ejemplos reales.
- Limitaciones de idioma: no se declaran idiomas soportados; el uso con castellano no está validado y probablemente degrade el rendimiento respecto al inglés.
- Limitaciones de contexto: 512 tokens máximo; textos más largos requieren truncado o ventanas deslizantes.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay restricciones adicionales declaradas.
- Reproducibilidad: la semilla (42) y los hiperparámetros están documentados, pero sin el dataset no es posible reproducir el ajuste.
- Madurez: cero descargas y cero valoraciones, sin revisión por parte de la comunidad; debe tratarse como un experimento personal, no como un modelo validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tejesh28/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Modelo base (ruta completa del autor referenciada en los tags): https://huggingface.co/distilbert/distilbert-base-uncased
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
