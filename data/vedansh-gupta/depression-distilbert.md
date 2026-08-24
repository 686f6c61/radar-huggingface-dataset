# Vedansh-Gupta/depression-distilbert

## Resumen

El modelo `Vedansh-Gupta/depression-distilbert` es un clasificador de texto basado en DistilBERT, ajustado para la detección binaria de signos de depresión en texto. Lo desarrolla Vedansh-Gupta y se publica en Hugging Face con el pipeline de `text-classification`. El modelo resuelve el problema de identificar automáticamente indicios de depresión en conversaciones o mensajes escritos, una tarea relevante para aplicaciones de salud mental y apoyo emocional asistido por IA.

La arquitectura subyacente es DistilBERT, una versión destilada del modelo BERT que mantiene un rendimiento comparable con un coste computacional menor. El modelo cuenta con 66.955.010 parámetros y se distribuye en formato `safetensors`. La ficha técnica es muy escasa: no se especifican la longitud de contexto, los idiomas soportados ni la licencia. El repositorio está vinculado a un proyecto de chatbot de detección de depresión, lo que sugiere un uso práctico en interfaces conversacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (fine-tune para clasificación de texto) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (DistilBERT suele usar 512 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de DistilBERT, una arquitectura transformer encoder-only que se obtiene mediante destilación de BERT. DistilBERT reduce el número de capas de 24 a 6 y los parámetros de 110 millones a 66 millones, manteniendo el 95 % del rendimiento del modelo original en tareas de clasificación. La capa de salida se adapta para la clasificación binaria (depresión / no depresión), aunque no se publican detalles sobre el dataset de entrenamiento, el procedimiento de ajuste ni los hiperparámetros utilizados.

No se ha documentado si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica la composición del corpus de entrenamiento ni el número de tokens procesados. La única referencia técnica es el paper de DistilBERT (arXiv:1910.09700) citado en los metadatos.

## Capacidades

- Clasificación binaria de texto: identifica si un texto contiene indicios de depresión (salida con probabilidad entre 0 y 1).
- Entrada de texto plano y salida de etiqueta con puntuación de confianza.
- Integración sencilla con la librería `transformers` para pipelines de clasificación.
- Compatible con la infraestructura de Hugging Face (endpoints, `text-embeddings-inference`).
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o soporte multimodal.

## Casos de uso

- **Detección de signos de depresión en conversaciones de chat**: el modelo puede analizar mensajes en tiempo real dentro de un chatbot y alertar sobre posibles señales de malestar emocional, permitiendo una intervención temprana.
- **Análisis de publicaciones en redes sociales**: se puede integrar en un pipeline que monitoree publicaciones o comentarios para identificar usuarios que podrían estar en riesgo y ofrecer recursos de ayuda.
- **Herramienta de autoevaluación en aplicaciones de salud mental**: el usuario escribe cómo se siente y el modelo devuelve una indicación de si su texto muestra patrones depresivos, junto con una puntuación de confianza.
- **Soporte para profesionales de la salud**: como ayuda auxiliar para priorizar casos en consultas o terapias, aunque no sustituye el diagnóstico clínico.
- **Investigación en NLP aplicada**: sirve como base para experimentos de detección de emociones o análisis de sentimiento en el dominio de la salud.
- **Integración en chatbots de apoyo**: el modelo puede complementar un bot conversacional para decidir cuándo derivar al usuario a un humano o a recursos de emergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de exactitud, F1, AUC ni comparaciones con otros modelos en la ficha de Hugging Face ni en los repositorios vinculados.

## Requisitos de hardware

- **VRAM estimada**: con 66 millones de parámetros, el modelo ocupa aproximadamente 266 MB en FP32 y unos 133 MB en FP16. En cuantización de 8 bits se reduce a ~66 MB, lo que permite ejecutarlo en CPU con memoria RAM normal.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso puede funcionar en CPU para inferencia de baja latencia.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier tarjeta moderna (RTX 3060, RTX 4090, etc.) y también en Raspberry Pi 5 con suficiente RAM.
- **Opciones de despliegue**: se puede servir con `transformers` mediante `pipeline`, o con `TGI` (Text Generation Inference), `vLLM` (aunque no es un modelo generativo, se puede usar para clasificación), o `Ollama` si se convierte a formato GGUF (no disponible actualmente).
- **Latencia y throughput**: no se han medido oficialmente; para un modelo de este tamaño, la inferencia en CPU suele ser de unos pocos milisegundos por frase (típicamente < 10 ms).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso típico |
|---|---|---|---|---|
| `depression-distilbert` | 66,9 M | no disponible | no disponible | Clasificación binaria de depresión |
| `BERT-base-uncased` | 110 M | 512 tokens | Apache-2.0 | Clasificación general, fine-tune para tareas específicas |
| `RoBERTa-base` | 125 M | 512 tokens | MIT | Clasificación, mayor rendimiento que BERT en muchos benchmarks |
| `DistilBERT-base-uncased` (original) | 66 M | 512 tokens | Apache-2.0 | Clasificación, destilado de BERT |

La comparación es orientativa, ya que no se dispone de resultados de benchmarks del modelo para comparar directamente. La principal diferencia es que `depression-distilbert` es un fine-tune específico para depresión, mientras que los otros son modelos preentrenados genéricos que necesitarían ajuste adicional.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo entrenado sobre textos que pueden contener sesgos culturales o de idioma, puede generar falsos positivos o negativos en la detección de depresión. No se han documentado los datos de entrenamiento, por lo que se desconocen los sesgos inherentes.
- **Riesgo de diagnóstico erróneo**: el modelo es una herramienta de apoyo, no un diagnóstico clínico. Su uso en entornos sanitarios debe ser supervisado por profesionales.
- **Limitaciones de idioma**: no se ha especificado qué idiomas soporta. Si se entrenó solo con inglés, fallará en otros idiomas.
- **Restricciones de licencia**: la licencia no está definida, lo que impide conocer si puede utilizarse en proyectos comerciales o de código abierto. Es necesario contactar con el autor para aclarar términos de uso.
- **Contexto limitado**: al ser DistilBERT, la ventana de contexto probablemente está limitada a 512 tokens, lo que puede ser insuficiente para textos largos.
- **Falta de documentación**: la model card está casi vacía, sin detalles sobre entrenamiento, evaluación o procedencia de los datos. Esto dificulta la reproducibilidad y la confianza en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Vedansh-Gupta/depression-distilbert)
- [Repositorio del proyecto (chatbot)](https://github.com/Vedansh-Gupta-VG/Depression-Detection-Chatbot)
- [Paper de DistilBERT (arXiv)](https://arxiv.org/abs/1910.09700)
- [Artículo relacionado sobre detección de depresión con DistilBERT (MDPI)](https://www.mdpi.com/2076-3417/13/10/6223)
