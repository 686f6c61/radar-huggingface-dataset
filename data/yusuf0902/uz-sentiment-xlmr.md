# yusuf0902/uz-sentiment-xlmr

## Resumen

uz-sentiment-xlmr es un clasificador binario de sentimiento para textos cortos en uzbeko (alfabeto latino), desarrollado por el usuario yusuf0902 y publicado en Hugging Face. Se trata de un fine-tuning de `FacebookAI/xlm-roberta-base`, el encoder multilingüe de XLM-RoBERTa, sobre el dataset `behbudiy/uzbek-sentiment-analysis`, compuesto por aproximadamente 10.000 reseñas de comercio electrónico. El modelo resuelve una tarea concreta y acotada: asignar la etiqueta `0` (negativo) o `1` (positivo) a una reseña de producto en uzbeko, con una longitud máxima de entrada de 128 tokens.

Con 278.045.186 parámetros y un tamaño de repositorio de 1,1 GB, es un modelo de escala base, no generativo, diseñado para inferencia rápida en entornos con recursos limitados. Su relevancia radica en cubrir un idioma de bajos recursos como el uzbeko, para el que existen pocos recursos de NLP supervisado, y en hacerlo con licencia MIT, lo que facilita su integración en productos comerciales.

No obstante, la propia model card es honesta sobre sus límites: el autor no ha publicado aún las métricas finales de accuracy y macro-F1 del modelo (aparecen como `TODO_ACC` y `TODO_F1`), y reconoce que la diferencia frente a una línea base clásica de TF-IDF con regresión logística no es estadísticamente significativa. Esto lo convierte en una pieza útil como referencia o componente de un pipeline, pero no en una solución validada para producción crítica sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), fine-tuning para clasificación de secuencias |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud de entrenamiento; la arquitectura base soporta hasta 512) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | Uzbeko (uz), alfabeto latino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un transformer encoder de tipo RoBERTa entrenado de forma multilingüe sobre 100 idiomas, al que se le añade una cabeza de clasificación binaria. El fine-tuning se realizó con PyTorch y el `Trainer` de Hugging Face durante 3 épocas, con batch size 32, learning rate 2e-5, weight decay 0.01, un 10 % de warmup y precisión fp16 sobre una GPU Colab T4, con un tiempo de entrenamiento de aproximadamente 9 minutos y 45 segundos (frente a unas 4 horas y 12 minutos en CPU). El mejor checkpoint se seleccionó según el macro-F1 de validación.

Los datos provienen del dataset `behbudiy/uzbek-sentiment-analysis` (10.000 filas de reseñas de comercio electrónico). El preprocesado incluyó minúsculas, normalización de apóstrofos y limpieza de espacios, además de la eliminación de textos duplicados y de aquellos con etiquetas contradictorias. La partición fue estratificada 80/10/10 con semilla 42, dejando un conjunto de test de 827 ejemplos (507 negativos y 320 positivos). No se menciona uso de RLHF, DPO ni técnicas de aumentación de datos; tampoco innovaciones arquitectónicas más allá del fine-tuning estándar.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en textos cortos en uzbeko.
- Procesamiento de reseñas informales de producto, incluyendo lenguaje coloquial y variantes ortográficas.
- Entrada limitada a 128 tokens, adecuada para reseñas breves pero no para documentos largos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es un modelo generativo: no produce texto, solo etiquetas y puntuaciones de probabilidad.
- Capacidad multilingüe limitada al uzbeko; aunque la base XLM-R es multilingüe, el fine-tuning se ha realizado exclusivamente sobre datos en uzbeko.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación y análisis de reseñas en plataformas de comercio electrónico uzbeko: el modelo puede clasificar automáticamente reseñas de producto como positivas o negativas para alimentar paneles de reputación o alertas de insatisfacción, aprovechando que fue entrenado específicamente sobre este dominio.
- Enrutamiento de tickets de soporte: integrado en un pipeline previo a la atención humana, permite priorizar quejas (sentimiento negativo) frente a comentarios positivos, con un coste de inferencia bajo gracias a sus 278 M de parámetros.
- Monitorización de la voz del cliente: agregación de sentimiento por producto, categoría o periodo temporal a partir de reseñas cortas, útil para equipos de producto que necesitan señales rápidas sin desplegar modelos generativos.
- Filtrado de retroalimentación para anotación humana: el clasificador puede preetiquetar grandes volúmenes de reseñas y derivar solo los casos de baja confianza a revisión manual, reduciendo el coste de anotación.
- Investigación en NLP de bajos recursos: sirve como línea base reproducible para experimentos con uzbeko, dado que el autor documenta el pipeline de entrenamiento, la partición y las limitaciones conocidas.
- Componente en sistemas de análisis de opinión más amplios: combinado con un modelo de extracción de aspectos o con un traductor, puede formar parte de un pipeline de análisis de sentimiento a nivel de aspecto en reseñas uzbekas.
- Despliegue en entornos con recursos limitados: al ser un encoder base y pesar 1,1 GB, puede ejecutarse en CPU o en GPUs de gama baja para tareas de clasificación por lotes, sin necesidad de infraestructura de inferencia de modelos generativos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa, pero las métricas del propio modelo aparecen sin rellenar (`TODO_ACC` y `TODO_F1`), por lo que no se han publicado resultados finales de benchmarks en la información disponible.

| Modelo | Accuracy | Macro-F1 |
|---|---|---|
| TF-IDF (char n-gram 2-5) + Logistic Regression | 0.904 | 0.897 |
| XLM-R fine-tune (este modelo) | TODO_ACC | TODO_F1 |

El autor indica que la diferencia entre ambos modelos no es estadísticamente significativa, con un intervalo de confianza bootstrap del 95 % para la diferencia de macro-F1 de [-0,014, 0,035]. No se han publicado resultados de benchmarks en la información disponible para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (tamaño de los pesos); en fp16 se reduce a unos 0,6 GB. El repositorio no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una T4, RTX 3060 o superior es más que suficiente. El entrenamiento se realizó en una Colab T4.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, Text Embeddings Inference (el modelo está etiquetado como `text-embeddings-inference` y `endpoints_compatible`), y servidores de inferencia compatibles con Hugging Face Endpoints. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El tiempo de entrenamiento (9m45s en T4 para 3 épocas sobre ~8.000 ejemplos) sugiere una inferencia muy rápida, pero no se aportan cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yusuf0902/uz-sentiment-xlmr | 278 M | 128 tokens | Clasificación de sentimiento en uzbeko | MIT | Hugging Face |
| Dyanne05/xlmr-uzbek-sentiment | No disponible | No disponible | Clasificación de sentimiento en uzbeko | No disponible | Hugging Face |
| TF-IDF + Logistic Regression (línea base del autor) | No aplica | No aplica | Clasificación de sentimiento en uzbeko | No aplica | Implementación propia |

La información disponible sobre `Dyanne05/xlmr-uzbek-sentiment` es mínima (solo la página de Hugging Face, sin datos de parámetros, contexto ni licencia), por lo que la comparación técnica con ese modelo no puede completarse. La línea base de TF-IDF con regresión logística alcanza 0,904 de accuracy y 0,897 de macro-F1, con una diferencia no significativa respecto al fine-tuning según el propio autor.

## Limitaciones y advertencias

- Las etiquetas del dataset son ruidosas: muchas reseñas tienen sentimiento mixto (por ejemplo, "yaxshi, lekin...") y están etiquetadas de forma inconsistente.
- Errores frecuentes documentados: negaciones de negativos ("yomon emas", "yomonmas") predichas como negativas, argot, code-switching con ruso e inglés y variantes ortográficas ("yaxwi").
- El recall de la clase positiva (~0,86) es inferior al de la clase negativa (~0,94), lo que puede infrarepresentar comentarios positivos en producción.
- Entrenado exclusivamente sobre reseñas de producto; el rendimiento en otros dominios (noticias, redes sociales) no está probado.
- Las métricas finales del modelo no están publicadas en la model card, lo que impide verificar su rendimiento real frente a la línea base.
- La ventana de 128 tokens limita el uso a textos cortos; reseñas largas se truncan.
- Aunque la licencia es MIT y permite uso comercial, el modelo hereda los sesgos y limitaciones del dataset de reseñas y de XLM-RoBERTa base.
- Riesgo de alucinación no aplica en sentido estricto (no es generativo), pero sí existe riesgo de clasificaciones erróneas con alta confianza en textos ambiguos o con negaciones complejas.
- Solo se ha validado para uzbeko en alfabeto latino; no se ha evaluado el alfabeto cirílico ni otras variedades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yusuf0902/uz-sentiment-xlmr
- Dataset de entrenamiento: https://huggingface.co/datasets/behbudiy/uzbek-sentiment-analysis
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Modelo comparable en Hugging Face: https://huggingface.co/Dyanne05/xlmr-uzbek-sentiment
- Repositorio de archivos del modelo comparable: https://huggingface.co/Dyanne05/xlmr-uzbek-sentiment/tree/main
