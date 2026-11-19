# wasitaigeneratedcom/ai-text-detector-small

## Resumen

tropa-mini es un clasificador de texto entrenado para detectar contenido generado por modelos de lenguaje. Lo publica wasitaigenerated.com como la versión de pesos abiertos de su detector propietario tropa-3, que es el que sirve a través de su API. El modelo parte del checkpoint desklib/ai-text-detector-v1.01 y se presenta como el detector de texto IA de pesos abiertos con mejor rendimiento en su propio benchmark, con un ROC-AUC de 0,968.

La innovación principal frente a otros detectores es su cabeza de clasificación de cuatro clases: `human`, `ai`, `ai_edited` y `humanized`. Esto le permite distinguir entre texto escrito por una persona, texto generado directamente por un LLM, texto humano retocado por un LLM y texto IA pasado por herramientas de "humanización" o parafraseo. La puntuación principal, `ai_score = 1 − P(human)`, se usa como umbral de decisión.

El modelo tiene 434 millones de parámetros, un backbone DeBERTa-v3-large, un repositorio de 1,7 GB y está pensado para ejecutarse en CPU sin GPU. La licencia Apache-2.0 permite uso comercial. Su ventana práctica de análisis es de 768 tokens por fragmento, con agregación por longitud para documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large con pooling medio y cabeza lineal de clasificación |
| Parametros totales | 434.016.260 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 768 tokens por fragmento (límite práctico recomendado; el backbone DeBERTa-v3 soporta hasta 512 tokens posicionales, la model card indica truncado a 768) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v3-large (434 millones de parámetros) al que se le añade una cabeza lineal sobre el pooling medio de los estados ocultos, enmascarando los tokens de padding. La cabeza tiene cuatro salidas correspondientes a las clases `human`, `ai`, `ai_edited` y `humanized`. La implementación de referencia de la model card define una clase `AIDetectionModel` que envuelve `AutoModel.from_config` y aplica `mean pooling` sobre `attention_mask` antes de la capa lineal.

El modelo se obtiene por fine-tuning del checkpoint desklib/ai-text-detector-v1.01. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador). La model card sí describe la metodología de evaluación: conjuntos públicos de Jabarian & Imas (2025), Liang et al. (2023), un conjunto frontier de 1.060 textos y 5.000 páginas web pre-LLM de FineWeb (2018) como pool humano neutro. El umbral de decisión se fija a una tasa de falsos positivos del 0,5 % sobre 6.930 documentos humanos.

## Capacidades

- Clasificación de texto en cuatro clases: `human`, `ai`, `ai_edited` y `humanized`.
- Detección de texto generado por ChatGPT, GPT-5, Claude, Gemini, Llama y otros LLM.
- Detección de texto IA "humanizado" mediante herramientas de parafraseo o reescritura, capacidad que la model card presenta como exclusiva entre los detectores de pesos abiertos.
- Detección de texto humano retocado o pulido por un LLM (`ai_edited`).
- Puntuación continua `ai_score = 1 − P(human)` en el rango [0, 1], con umbral operativo recomendado de 0,976 para una tasa de falsos positivos del 0,5 %.
- Procesamiento de documentos largos mediante fragmentación en trozos de hasta 768 tokens alineados por frases y agregación ponderada por longitud.
- Ejecución en CPU sin GPU.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Moderación de contenido en plataformas educativas: el modelo permite marcar entregas sospechosas de haber sido generadas por un LLM, con la ventaja de distinguir entre texto totalmente generado y texto humano retocado, lo que ayuda a calibrar la respuesta académica.
- Verificación editorial en medios: integrado en el pipeline de publicación, puede señalar artículos o colaboraciones que parecen generados o humanizados antes de su publicación, usando el umbral de 0,976 para minimizar falsos positivos sobre periodistas humanos.
- Detección de spam y granjas de contenido: al ejecutarse en CPU y procesar fragmentos de 768 tokens, permite filtrar grandes volúmenes de reseñas, comentarios o fichas de producto generadas automáticamente sin coste de GPU.
- Auditoría de datasets para entrenamiento: permite descartar muestras generadas por LLM o humanizadas en corpus que se pretenden humanos, mejorando la calidad de los datos de entrenamiento de otros modelos.
- Cumplimiento normativo y trazabilidad de contenido: organizaciones que deben reportar proporción de contenido sintético en sus publicaciones pueden usar la clasificación de cuatro clases para documentar el origen del texto.
- Investigación sobre detección de IA: al ser de pesos abiertos y Apache-2.0, sirve como línea base reproducible en estudios sobre detectores, sesgos y robustez frente a ataques de evasión.
- Filtrado en foros y comunidades: detección de respuestas generadas automáticamente en hilos de discusión, con agregación por longitud para hilos largos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos sobre conjuntos públicos con umbral fijado a una tasa de falsos positivos del 0,5 % sobre 6.930 documentos humanos:

| Modelo | ROC-AUC | IA sin procesar | IA humanizada | Modelos frontier |
|---|---|---|---|---|
| tropa-mini (este modelo) | 0,968 | 93,2 % | 41,6 % | 33,6 % |
| desklib/ai-text-detector-v1.01 | 0,875 | 83,9 % | 4,0 % | 1,8 % |
| SuperAnnotate/ai-detector | 0,824 | 0,5 % | 1,4 % | 0,6 % |
| Hello-SimpleAI/chatgpt-detector-roberta | 0,571 | 0,8 % | no disponible | no disponible |

Comparación con el modelo propietario del mismo autor, según la model card: tropa-3 detecta un 95,6 % de texto IA sin procesar y un 57,7 % de texto humanizado, frente al 93,2 % y 41,6 % de tropa-mini, con una tasa de falsos positivos del 0,1 % sobre 239.490 textos humanos. Estas cifras proceden del benchmark de septiembre de 2026 del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp32 para los pesos completos; en fp16 o bf16 alrededor de 0,9 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en placas integradas con suficiente RAM.
- Opciones de despliegue: transformers (implementación de referencia en la model card), text-embeddings-inference (etiqueta `text-embeddings-inference`), endpoints compatibles (etiqueta `endpoints_compatible`). No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ROC-AUC | IA sin procesar (FPR 0,5 %) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tropa-mini | 434 M | 768 tokens por fragmento | 0,968 | 93,2 % | Apache-2.0 | Pesos abiertos en Hugging Face |
| desklib/ai-text-detector-v1.01 | no disponible | no disponible | 0,875 | 83,9 % | no disponible | Pesos abiertos en Hugging Face |
| SuperAnnotate/ai-detector | no disponible | no disponible | 0,824 | 0,5 % | no disponible | Pesos abiertos en Hugging Face |
| Hello-SimpleAI/chatgpt-detector-roberta | no disponible | no disponible | 0,571 | 0,8 % | no disponible | Pesos abiertos en Hugging Face |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada. Las métricas provienen del benchmark del autor de tropa-mini y no han sido verificadas de forma independiente.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- La detección de texto humanizado es notablemente inferior a la de texto IA sin procesar (41,6 % frente a 93,2 %), por lo que un texto pasado por herramientas de parafraseo puede escapar con frecuencia.
- La detección de texto de modelos frontier es baja (33,6 %), lo que limita su utilidad frente a los LLM más recientes.
- Riesgo de falsos positivos sobre texto humano, especialmente en escritura no nativa o estilos muy formulaicos; la model card cita el conjunto de ensayos TOEFL de Liang et al. como caso de evaluación de este sesgo.
- Los benchmarks publicados proceden del propio autor del modelo y no han sido replicados de forma independiente; deben tomarse con cautela.
- El umbral operativo de 0,976 está calibrado para una tasa de falsos positivos del 0,5 % sobre un pool humano concreto; en dominios distintos puede requerir recalibración.
- La ventana de 768 tokens obliga a fragmentar documentos largos y agregar puntuaciones, lo que añade complejidad y posibles artefactos en los bordes de fragmento.
- No se documentan variantes cuantizadas ni soporte para llama.cpp u Ollama, lo que limita las opciones de despliegue a transformers y text-embeddings-inference.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la precisión del detector en dominios no evaluados.
- No debe usarse como única evidencia en decisiones disciplinarias o legales: es un clasificador probabilístico con tasas de error documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasitaigeneratedcom/ai-text-detector-small
- Modelo base: https://huggingface.co/desklib/ai-text-detector-v1.01
- Sitio del autor: https://wasitaigenerated.com
- API del detector: https://www.wasitaigenerated.com/ai-detector-api
- Benchmark de septiembre de 2026: https://www.wasitaigenerated.com/research/ai-detector-benchmark-pangram-gptzero-zerogpt-tropa-3-2026
- Repositorio de benchmark de texto: https://github.com/wasitaigenerated/ai-text-detection-benchmark
- Repositorio de benchmark de imágenes: https://github.com/wasitaigenerated/ai-image-detection-benchmark
- Repositorio de benchmark de vídeo: https://github.com/wasitaigenerated/ai-video-detection-benchmark
- Dataset Jabarian & Imas (2025): https://github.com/brianjabarian/DetectionAI
- Dataset Liang et al. (2023): https://github.com/Weixin-Liang/ChatGPT-Detector-Bias
