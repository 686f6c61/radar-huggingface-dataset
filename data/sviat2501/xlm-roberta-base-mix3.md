# Sviat2501/xlm-roberta-base-mix3

## Resumen

xlm-roberta-base-mix3 es un modelo de clasificación de sentimiento en tres clases (negativo, neutro, positivo) para texto en ucraniano, obtenido mediante fine-tuning de FacebookAI/xlm-roberta-base. Lo desarrolla Sviat2501 (S. Levchenko) en el marco de su tesis de máster en la Universidad Nacional I. I. Mechnikov de Odesa (2026), y constituye el componente de análisis de sentimiento del agente UA Sentiment Agent. El modelo resuelve la tarea de clasificación de opiniones y mensajes en ucraniano, un idioma con menos recursos que el inglés o el ruso en el ecosistema de modelos ajustados.

Arquitectónicamente es un transformer encoder XLM-RoBERTa en configuración base, con 278.045.955 parámetros totales y pesos en formato safetensors (repo de 1,1 GB). El contexto máximo del modelo base es de 512 tokens, aunque el código del proyecto trunca las entradas a 192 tokens. No es un modelo generativo: es un clasificador de secuencias que devuelve distribuciones de probabilidad sobre tres etiquetas.

Su relevancia es acotada pero concreta: cubre análisis de sentimiento en ucraniano sobre reseñas de producto y texto de redes sociales, con métricas publicadas (macro-F1 de 0,739 en el conjunto de test de reseñas y 0,653 en un gold set de mensajes reales de Telegram) y con ficheros de calibración por dominio incluidos en el repositorio. La licencia no está declarada en la información disponible, lo que limita su adopción comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.045.955 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (modelo base); truncado a 192 tokens en el código del proyecto |
| Tipos de cuantizacion | No disponible (pesos safetensors en fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | Ucraniano (uk); el modelo no detecta idioma |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-base, un encoder transformer multilingüe preentrenado con enmascaramiento de tokens sobre corpus multilingües. Sobre esa base se aplica un fine-tuning supervisado de clasificación con tres etiquetas. No se documenta en la información disponible el uso de RLHF, DPO ni objectives adicionales; se trata de un ajuste supervisado estándar de clasificación.

Los datos de entrenamiento combinan dos fuentes. La principal es el corpus `vkovenko/cross_domain_uk_reviews` (reseñas de Rozetka y TripAdvisor), con etiquetado por estrellas: 1-2 estrellas como negativo, 3 como neutro y 4-5 como positivo, respetando el split train/validation/test de los autores del corpus. La secundaria son tuits traducidos automáticamente al ucraniano con NLLB-200, usados como corpus auxiliar de adaptación de dominio, con etiquetas heredadas del dataset original y control de calidad de la traducción sobre una muestra. No se usaron publicaciones reales de Telegram ni de Threads para el entrenamiento.

Una innovación práctica destacable es la inclusión de offsets de calibración por clase (`calibration.json` para dominio de reseñas, con n = 30.000 textos de validación; `calibration_social.json` para redes sociales, con n = 3.896 tuits traducidos), ajustados para maximizar macro-F1. Estos offsets deben sumarse al logit de cada clase antes del argmax si se usa el modelo fuera del código del proyecto.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) sobre texto en ucraniano.
- Análisis de opiniones y reseñas de producto y de lugares (dominio Rozetka/TripAdvisor).
- Análisis de texto de redes sociales, con calibración específica para ese dominio.
- Tarea binaria positivo vs negativo con mejor rendimiento (F1 = 0,885 en el gold set de Telegram).
- Extracción de embeddings de texto vía la API de transformers (compatible con text-embeddings-inference según los tags del repositorio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- No realiza detección de idioma; asume entrada en ucraniano.

## Casos de uso

- Monitorización de reputación de marca: procesar en lote reseñas de e-commerce y clasificar el sentimiento por producto y por periodo, usando `calibration.json` para el dominio de reseñas y agregando los resultados sin tomar decisiones sobre individuos.
- Análisis de opinión en redes sociales: aplicar `calibration_social.json` sobre mensajes y tuits en ucraniano para obtener una distribución agregada de sentimiento por campaña o evento, con la advertencia de que el dominio social es el que presenta mayor confusión en la clase neutra.
- Filtrado previo en pipelines de atención al cliente: usar el clasificador como etapa de triaje para enrutar reseñas negativas a revisión humana, aprovechando la F1 binaria de 0,885 en la tarea positivo/negativo.
- Investigación académica en PLN para ucraniano: el modelo sirve como baseline reproducible con métricas publicadas, intervalos de confianza por bootstrap y comparación con un Qwen3.5-4B ajustado, documentada en la tesis y en el repositorio de GitHub.
- Etiquetado asistido de corpus: generar etiquetas preliminares de sentimiento sobre grandes volúmenes de texto ucraniano para su posterior revisión humana, dado el bajo coste computacional de un encoder de 278 M de parámetros.
- Integración en el agente UA Sentiment Agent: el modelo es el componente de clasificación del agente descrito en el repositorio, por lo que puede desplegarse como parte de ese pipeline con sus ficheros de calibración ya integrados.

## Benchmarks y rendimiento

| Conjunto de test | macro-F1 | Accuracy |
|---|---|---|
| Reseñas en ucraniano (split de test de los autores) | 0,739 | 0,899 |
| Tuits traducidos | 0,659 | No disponible |
| Mensajes reales de Telegram (gold set, n = 233) | 0,653 (IC 95 %: 0,587-0,713) | No disponible |
| Tarea binaria positivo vs negativo (mismo gold set) | F1 = 0,885 | No disponible |

El gold set de Telegram fue etiquetado por un LLM y solo 25 mensajes fueron revisados por el autor (concordancia del 64 %, kappa de Cohen = 0,52), por lo que estas cifras son indicativas. Los detalles completos, los intervalos por bootstrap y la comparación con un Qwen3.5-4B ajustado están en la tesis y en el directorio `results` del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los pesos, más overhead de activaciones y del tokenizador; en la práctica, entre 1,5 y 2,5 GB según el tamaño de lote.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) donde el cuello de botella será el throughput, no la memoria.
- También es viable en CPU para lotes moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers con `pipeline("text-classification")`, text-embeddings-inference (según los tags del repositorio) y servidores compatibles con endpoints. No se documentan variantes GGUF ni integración con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlm-roberta-base-mix3 | 278 M | 512 tokens (192 en el proyecto) | Clasificación de sentimiento en ucraniano (3 clases) | No disponible | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingüe (sin ajuste de sentimiento) | MIT (según el modelo base) | Hugging Face |
| Qwen3.5-4B ajustado (comparación de la tesis) | 4 B (aprox.) | No disponible | Clasificación de sentimiento en ucraniano | No disponible en esta ficha | Referenciado en la tesis |

La comparación con el Qwen3.5-4B ajustado se menciona en la model card, pero los resultados numéricos no se incluyen en la información proporcionada. No se dispone de otros modelos comparables de sentimiento en ucraniano en la información disponible.

## Limitaciones y advertencias

- La clase neutra es la más difícil: en texto real de redes sociales el modelo la confunde con las otras dos clases con más frecuencia que en reseñas.
- El entrenamiento se basa en reseñas y tuits traducidos, por lo que el argot, el surzhyk, el code-switching con ruso y el sarcasmo marcado se manejan peor.
- El modelo no detecta el idioma; asume entrada en ucraniano y puede producir salidas sin sentido sobre otros idiomas.
- El código del proyecto trunca los textos a 192 tokens, aunque el modelo admite hasta 512; los textos largos pierden información.
- Los offsets de calibración son necesarios para un rendimiento óptimo: sin ellos, el modelo sin calibrar no está ajustado al balance de clases.
- El gold set de Telegram tiene una validación humana muy limitada (25 mensajes, kappa = 0,52), por lo que las métricas sobre ese conjunto deben tratarse como indicativas.
- La licencia no está declarada, lo que impide asumir uso comercial sin consultar al autor.
- Uso previsto para investigación y análisis agregado de sentimiento de marca; no debe emplearse para tomar decisiones sobre personas individuales.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas en dominios alejados del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sviat2501/xlm-roberta-base-mix3
- Repositorio del proyecto UA Sentiment Agent: https://github.com/SviatLevchenko/ua-sentiment-agent
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Corpus de reseñas: https://huggingface.co/datasets/vkovenko/cross_domain_uk_reviews
- Paper de XLM-RoBERTa (referencia del modelo base): no disponible en la información proporcionada
