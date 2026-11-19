# v1assets/takemeter-distilbert

## Resumen

TakeMeter (DistilBERT) es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un conjunto propio de publicaciones de subreddits de modding. El modelo clasifica cada texto en una de tres categorías: `troubleshooting`, `recommendation_request` y `release_showcase`. Lo desarrolla el usuario `v1assets` como proyecto de curso (CodePath AI201) y no está pensado para uso en producción.

Se trata de un DistilBERT, es decir, una versión destilada de BERT con 6 capas y 66.955.779 parámetros totales, entrenada originalmente en inglés. El ajuste fino se realizó con entropía cruzada ponderada por clase, semilla 2024, 3 épocas, learning rate 2e-5, batch size 16 y longitud máxima de 128 tokens, sobre tan solo 139 publicaciones etiquetadas manualmente.

Su relevancia es limitada y fundamentalmente didáctica: ilustra el flujo completo de fine-tuning de un transformer encoder para clasificación de textos cortos con un dataset muy pequeño. Los resultados publicados (accuracy 0,767 y macro F1 0,759 sobre 30 ejemplos de test) deben interpretarse con cautela por el tamaño reducido de la muestra y el propio aviso del autor sobre el bajo recall de la clase `release_showcase`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) |
| Parametros totales | 66.955.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas obtenido por destilación de BERT-base, con vocabulario WordPiece sin distinción de mayúsculas y entrenamiento original en inglés. Sobre esta base se añade una cabeza de clasificación para tres etiquetas.

El fine-tuning se documenta en la model card con los siguientes hiperparámetros: entropía cruzada ponderada por clase, semilla 2024, 3 épocas, learning rate 2e-5, batch size 16 y longitud máxima de 128 tokens. El conjunto de entrenamiento consta de 139 publicaciones etiquetadas manualmente, procedentes de subreddits de modding, y el split de test de 30 publicaciones. El entrenamiento se ejecutó en CPU. No se documentan técnicas adicionales como RLHF, DPO, decodificación especulativa ni atención lineal; al ser un encoder de clasificación, no genera texto de forma autorregresiva.

## Capacidades

- Clasificación de texto en inglés en tres categorías: `troubleshooting`, `recommendation_request` y `release_showcase`.
- Procesamiento de entradas cortas, hasta 128 tokens.
- Salida de logits por clase apta para pipelines de `text-classification`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- Capacidad multilingüe limitada al inglés (`en`).
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Triaje de publicaciones en foros de modding: el modelo puede etiquetar automáticamente hilos nuevos como `troubleshooting`, `recommendation_request` o `release_showcase` para enrutarlos al canal o moderador adecuado, aprovechando su entrenamiento específico en ese dominio.
- Prototipado rápido de clasificadores de texto: sirve como base para experimentar con fine-tuning de DistilBERT en datasets pequeños, dado su bajo coste computacional y su entrenamiento viable en CPU.
- Filtrado de consultas de soporte: en un foro técnico, puede separar mensajes de resolución de problemas de peticiones de recomendación, facilitando la asignación a equipos de soporte.
- Etiquetado asistido para moderación: como sugerencia de etiqueta para moderadores humanos, que revisan y confirman la clasificación antes de aplicar acciones.
- Demostración educativa de pipelines de Hugging Face: integrable en notebooks y tutoriales para mostrar el ciclo completo de carga, inferencia y evaluación de un modelo de clasificación.
- Clasificación por lotes de históricos de foro: para análisis exploratorio de la distribución de tipos de publicación en un subreddit concreto, siempre con validación manual dada la limitación de recall documentada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (test, 30 ejemplos) | 0,767 |
| Macro F1 (test, 30 ejemplos) | 0,759 |
| Recall de `release_showcase` | débil (según el autor, sin cifra publicada) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un modelo de ~67 M parámetros en fp32 ocupa aproximadamente 0,27 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias; funciona en CPU con latencia aceptable para entradas de hasta 128 tokens.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: pipeline `text-classification` de Hugging Face Transformers, TorchScript/ONNX para optimización, y llama.cpp no aplica (no es un modelo generativo GGUF).
- Latencia y throughput estimados: no disponibles; el autor indica entrenamiento en CPU, sin cifras de inferencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TakeMeter (DistilBERT) | 66,9 M | 128 tokens | Clasificación 3 clases (modding) | apache-2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face |
| roberta-base | 125 M | 512 tokens | Modelo base (MLM) | mit | Hugging Face |

La comparación con modelos base es estructural: TakeMeter hereda la arquitectura y tamaño de `distilbert-base-uncased`, pero su cabeza de clasificación está especializada en tres etiquetas de un dominio muy concreto. No se dispone de benchmarks comparables publicados para alternativas específicas de clasificación de publicaciones de modding.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (139 ejemplos) y test de solo 30 ejemplos, lo que hace que las métricas publicadas tengan alta varianza e intervalos de confianza amplios.
- Recall débil en la clase `release_showcase`, tal como advierte el autor; riesgo de falsos negativos en esa categoría.
- El propio autor indica explícitamente que el modelo no es apto para producción.
- Entrenado únicamente en inglés; no cubre otros idiomas.
- Ventana de contexto limitada a 128 tokens; textos más largos se truncan y pierden información.
- Sesgos potenciales derivados de la composición del dataset (subreddits de modding concretos) y del etiquetado manual de una sola persona o criterio.
- Riesgo de sobreajuste al dominio de modding y de generalización pobre fuera de él.
- Licencia apache-2.0: permite uso comercial, pero la calidad y el aviso de no producción desaconsejan cualquier despliegue real sin reentrenamiento y validación adicional.
- No se documentan evaluaciones de robustez, calibración ni análisis de errores.

## Enlaces

- Hugging Face: https://huggingface.co/v1assets/takemeter-distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
