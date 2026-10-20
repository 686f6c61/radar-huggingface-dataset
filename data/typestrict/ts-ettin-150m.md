# typestrict/TS-Ettin-150M

## Resumen

TS-Ettin-150M es un modelo encoder de tipo ModernBERT de 149.614.978 parámetros desarrollado por typestrict.ai, diseñado específicamente para tomar "decisiones tipadas" (typed decisions) en inglés sobre texto: elegir una opción entre varias (`choice`), determinar si una afirmación es verdadera (`noul`) o asignar un valor en una rúbrica ordenada (`score`), devolviendo en cada caso la probabilidad de cada opción y una confianza asociada. No es un modelo generativo, sino un clasificador de texto (`text-classification`) construido sobre el reranker `cross-encoder/ettin-reranker-150m-v1`, con una ventana de contexto de 8.192 tokens y pesos publicados en safetensors y ONNX.

El modelo forma parte de la familia TS, en la que todos los miembros comparten la misma receta de entrenamiento y el mismo conjunto de datos, de modo que cambiar de una variante a otra equivale a una nueva versión del mismo entrenamiento. Dentro de esa familia, TS-Ettin-150M es la base con mejor resultado en el Decision Index interno (0,3) y está orientada exclusivamente al inglés, a diferencia de TS-moBERTo-150M, que cubre inglés y portugués y es actualmente la opción recomendada por el autor.

Su relevancia práctica reside en que ofrece inferencia en CPU a través de los ficheros ONNX incluidos, licencia Apache-2.0 y un tamaño de 150M que lo hace desplegable en entornos con recursos limitados. El propio autor advierte de que la confianza del modelo todavía no está calibrada (los ajustes de identidad en `config.json`), por lo que recomienda usar las probabilidades y medir antes de fijar umbrales de automatización sobre el campo `confidence`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), basado en `cross-encoder/ettin-reranker-150m-v1` |
| Parametros totales | 149.614.978 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; el modelo base figura como `base_model:quantized`) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

TS-Ettin-150M es un encoder transformer de la familia ModernBERT, heredado del reranker `cross-encoder/ettin-reranker-150m-v1`. La arquitectura es, por tanto, la de un codificador bidireccional orientado a representaciones y clasificación, no a generación autorregresiva. El modelo trabaja sobre ventanas de hasta 8.192 tokens, lo que permite clasificar documentos o pares consulta-respuesta de longitud media-alta sin truncar en la mayoría de casos de producción. La cabecera de salida se articula en torno a tres tipos de decisión (`choice`, `noul` y `score`), cada uno con distribución de probabilidad sobre las opciones y un valor de confianza.

En cuanto a los datos de entrenamiento, la model card indica que el modelo se ha entrenado únicamente con datos cuya licencia lo permite, aunque la lista concreta de fuentes no está disponible en la información proporcionada. Todos los modelos de la familia TS siguen la misma receta y el mismo conjunto de datos, y el autor comercializa el entrenamiento sobre estas bases a través de typestrict.ai, orientado a que el usuario obtenga un modelo que responda a su propia pregunta y se mida contra "Jev" sobre sus ejemplos reservados. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovación principal no es arquitectónica sino de interfaz: el modelo expone decisiones estructuradas y tipadas con probabilidades por opción y una confianza agregada, lo que facilita su integración en pipelines de automatización con umbrales explícitos. El autor señala además que la confianza aún no está calibrada y que los ajustes de identidad permanecen en `config.json`, por lo que las probabilidades deben interpretarse con cautela hasta calibrarlas sobre datos propios.

## Capacidades

- Clasificación de texto con decisiones tipadas: `choice` (seleccionar una opción entre varias), `noul` (determinar si una afirmación es verdadera) y `score` (asignar un valor en una rúbrica ordenada).
- Salida de probabilidad por cada opción disponible, además de una confianza agregada por decisión.
- Procesamiento de contextos de hasta 8.192 tokens, apto para documentos y pares de texto largos.
- Inferencia en CPU mediante los ficheros ONNX incluidos, además de la ruta estándar con transformers sobre safetensors.
- Compatibilidad con Text Embeddings Inference y con endpoints (etiqueta `endpoints_compatible`).
- Uso como base entrenable: el autor ofrece entrenamiento sobre esta base en typestrict.ai para adaptarla a decisiones propias.
- Modelo exclusivamente en inglés; no se declara soporte multilingüe.
- No es un modelo generativo: no produce texto libre, tool calling, razonamiento multi-paso ni capacidades de visión o audio.

## Casos de uso

- Enrutamiento de tickets de soporte: usar la decisión `choice` para asignar cada ticket entrante a una categoría o equipo concreto, aprovechando las probabilidades por opción para derivar a revisión humana los casos con baja confianza.
- Moderación de contenido y aplicación de políticas: clasificar textos frente a un conjunto de categorías prohibidas con `choice` y registrar la probabilidad de cada categoría para auditoría.
- Verificación de afirmaciones en pipelines de datos: emplear `noul` para comprobar si una frase es verdadera respecto a una fuente, con la probabilidad asociada como señal de filtrado.
- Puntuación de leads o priorización comercial: usar `score` para asignar cada registro a un nivel de una rúbrica ordenada (por ejemplo, frío, templado, caliente) de forma consistente y reproducible.
- Triaje y clasificación documental: procesar contratos, informes o correos de hasta 8.192 tokens y etiquetarlos por tipo o urgencia sin necesidad de truncar el documento.
- Filtrado y control de calidad en pipelines RAG: evaluar pares consulta-respuesta generados por un LLM y descartar los que no superen un umbral de probabilidad, actuando como juez ligero en CPU.
- Etiquetado asistido para construcción de datasets: preetiquetar grandes volúmenes de texto en CPU con los ficheros ONNX y reservar la revisión humana para los casos de confianza baja.
- Automatización de decisiones con umbral explícito: integrar el modelo en flujos donde se requiera una decisión estructurada y auditable, midiendo previamente la calibración de la confianza sobre ejemplos propios antes de fijar el umbral.

## Benchmarks y rendimiento

La información disponible únicamente reporta el resultado en el Decision Index interno de typestrict, donde TS-Ettin-150M obtiene 0,3 y se sitúa como la mejor de las bases de la familia según el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y el modelo, al ser un encoder de clasificación, no es directamente comparable con benchmarks de generación.

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index (interno de typestrict) | 0,3 | Mejor base de la familia TS según el autor |
| MMLU | no disponible | No aplica a un encoder de clasificación |
| HumanEval | no disponible | No aplica |
| GSM8K | no disponible | No aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,6 GB solo para pesos; en fp16, alrededor de 0,3 GB. El consumo real depende de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas consumer como RTX 3060, RTX 4060 o superiores funcionan sin problema. Para cargas de alto throughput, A100 o H100 aportan margen pero no son necesarias.
- Cabe holgadamente en GPU consumer y también en CPU: el autor distribuye ficheros ONNX pensados para ejecución en CPU.
- Opciones de despliegue: transformers (ruta estándar), ONNX Runtime (CPU o GPU), Text Embeddings Inference (etiqueta `text-embeddings-inference`) y endpoints compatibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TS-Ettin-150M | 149.614.978 | 8.192 | Ingles | 0,3 | Apache-2.0 | Publicado en HF; entrenamiento en typestrict.ai "coming soon" |
| TS-moBERTo-150M | 150M | no disponible | Ingles y portugues | no disponible | Apache-2.0 | Disponible y recomendado por el autor |
| TS-Ettin-68M | 68M | no disponible | Ingles | no disponible | Apache-2.0 | "Coming soon" |
| TS-Ettin-32M | 32M | no disponible | Ingles | no disponible | Apache-2.0 | "Coming soon" |
| TS-Ettin-17M | 17M | no disponible | Ingles | no disponible | Apache-2.0 | "Coming soon" |
| cross-encoder/ettin-reranker-150m-v1 | 150M (aprox.) | no disponible | no disponible | no disponible | no disponible | Modelo base en HF |

Dentro de la familia, TS-moBERTo-150M es la alternativa directa con cobertura de portugués y la opción recomendada actualmente por el autor; las variantes de 68M, 32M y 17M reducen el coste computacional a cambio de capacidad. Frente al reranker base, TS-Ettin-150M añade la interfaz de decisiones tipadas y la distribución ONNX para CPU.

## Limitaciones y advertencias

- Confianza sin calibrar: el autor advierte explícitamente de que los ajustes de identidad permanecen en `config.json` y de que la confianza no está calibrada; deben usarse las probabilidades y medir antes de fijar umbrales de automatización sobre `confidence`.
- Solo inglés: el modelo no declara soporte para otros idiomas, incluido el castellano.
- No es generativo: no produce texto libre, no soporta tool calling, agentes ni razonamiento multi-paso.
- Riesgo de clasificación errónea: al ser un clasificador, los fallos se manifiestan como etiquetas incorrectas o puntuaciones mal calibradas, no como alucinaciones en sentido estricto; aun así, pueden propagarse a decisiones automatizadas si no se revisan.
- Sesgos: no se documentan en la información disponible análisis de sesgo; al entrenarse con datos cuya licencia lo permite, la composición exacta y sus posibles sesgos no son verificables.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base `cross-encoder/ettin-reranker-150m-v1` antes de un despliegue en producción.
- Disponibilidad: el entrenamiento sobre esta base en typestrict.ai figura como "coming soon"; hasta entonces el autor indica TS-moBERTo-150M como opción por defecto.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y el modelo se publicó y actualizó el mismo día (19 de octubre de 2026), por lo que la validación comunitaria es aún inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/typestrict/TS-Ettin-150M
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-150m-v1
- Familia TS en HuggingFace: https://huggingface.co/typestrict
- TS-moBERTo-150M: https://huggingface.co/typestrict/TS-moBERTo-150M
- TS-Ettin-68M: https://huggingface.co/typestrict/TS-Ettin-68M
- TS-Ettin-32M: https://huggingface.co/typestrict/TS-Ettin-32M
- TS-Ettin-17M: https://huggingface.co/typestrict/TS-Ettin-17M
- Sitio del autor: https://typestrict.ai
- Documentacion de modelos base: https://docs.typestrict.ai/base-models
- Documentacion sobre agentes y MCP: https://docs.typestrict.ai/agents
- CLI en GitHub: https://github.com/typestrict-lab/cli
- Licencia: https://huggingface.co/typestrict/TS-Ettin-150M/blob/main/LICENSE
