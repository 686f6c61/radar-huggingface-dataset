# Vitund/cox-1-3b-int8

## Resumen

cox-1-3b-int8 es la versión cuantizada a INT8 de cox-1-3b, el modelo de decisión de Vitund. No es un modelo generativo: recibe un texto y un conjunto de preguntas tipadas (sí/no, elección entre opciones, puntuación) y devuelve una probabilidad calibrada para cada opción de cada pregunta, sin producir texto libre. Está pensado como un "system one" de decisión rápida y determinista que se puede encadenar a otros componentes de un pipeline.

El modelo base se construye sobre la arquitectura `qwen3_5_text` y cuenta con 2.867.938.560 parámetros totales (unos 2,87 mil millones), empaquetados en un repositorio de 2,9 GB gracias a la cuantización INT8. La build corresponde a cox-1.2 (30 de octubre de 2026), la misma que la rama `main` del modelo en bf16.

La relevancia de esta variante es puramente operativa: mantiene la precisión del original (skill +0.653, accuracy 80,7 %, error de calibración 0,067 frente a 0,069 en bf16) reduciendo el peso cargado en GPU de 5,9 GB a 3,0 GB, lo que permite inferencia en GPUs de consumo como una RTX 3070 de 8 GB con peticiones de hasta 8k tokens. El precio a pagar es latencia: no es más rápida que bf16, sino más lenta, porque cada producto matricial ensancha los pesos a bf16 antes de operar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer sobre `qwen3_5_text` (atención lineal parcial, según la model card) |
| Parámetros totales | 2.867.938.560 (~2,87 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se han probado peticiones de 1k, 4k y 8k tokens) |
| Tipos de cuantización | INT8 simétrico round-to-nearest, una escala por canal de salida (por fila en el embedding); normas, parámetros pequeños de atención lineal y cabeza de decisión en precisión original |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (INT8) con configuración propia `cox_config.json`; librería `coxlm` |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone `qwen3_5_text`, un transformer con componentes de atención lineal de pequeño tamaño que se mantienen en su precisión original tras la cuantización. La cabeza de decisión, que transforma las representaciones del texto y de las preguntas tipadas en probabilidades por opción, también queda fuera de la cuantización, igual que las capas de normalización. La cuantización se aplica a todas las matrices de pesos de los bloques del transformer y a la tabla de embeddings de tokens, con escalas por canal de salida y sin datos de calibración.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento en la información proporcionada; la model card remite a la ficha de cox-1-3b para esos detalles. La innovación técnica destacable de esta build es el esquema de cuantización INT8 con escalas por canal y el soporte de `coxlm` para mantener los pesos en INT8 en CUDA (como tensores de torchao si está instalado) o convertirlos a bf16 al cargar en CPU, Apple Silicon (MPS o MLX).

## Capacidades

- Clasificación y decisión tipada: responde preguntas de sí/no, de elección entre varias opciones y de puntuación, devolviendo una probabilidad por opción.
- Calibración de probabilidades: error de calibración de 0,067, lo que permite usar las salidas como scores fiables en umbrales y agregaciones.
- Sin generación de texto: no produce explicaciones ni cadenas de razonamiento; la salida es estructural.
- Procesamiento de textos largos: se han ejecutado peticiones de hasta 8k tokens en GPU de 8 GB.
- Coincidencia con la build bf16: la respuesta principal coincide en el 99,3 % de las decisiones.
- Idiomas: únicamente inglés.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Moderación de contenido binaria: dado un texto y una pregunta tipada de sí/no ("¿es tóxico?", "¿es spam?"), el modelo devuelve una probabilidad calibrada que se puede umbralizar en producción sin necesidad de parsear texto generado.
- Enrutamiento de tickets de soporte: con preguntas de elección entre categorías, se obtiene una distribución de probabilidad sobre departamentos y se deriva el ticket al de mayor score, usando la calibración para decidir cuándo escalar a revisión humana.
- Filtrado previo en pipelines RAG: evaluar si un fragmento recuperado responde a la consulta del usuario mediante una pregunta de puntuación, descartando documentos con score bajo antes de pasarlos a un modelo generativo.
- Clasificación de leads y priorización comercial: preguntas de puntuación sobre intención de compra o urgencia, con umbrales calibrados para ordenar la cola de atención.
- Control de calidad de anotaciones: comparar la decisión del modelo con la etiqueta humana en tareas de clasificación y marcar discrepancias para revisión, aprovechando la coincidencia del 99,3 % con la build bf16 como referencia estable.
- Evaluación automática de respuestas: preguntas de sí/no o de elección para juzgar si una respuesta generada cumple criterios definidos, con scores calibrados agregables entre múltiples criterios.
- Despliegue en hardware limitado: al cargar 3,0 GB en GPU y permitir lotes de ocho textos de 1k tokens en una RTX 3070, encaja en estaciones de trabajo con 8 GB de VRAM donde la build bf16 no cabría en ese régimen de batch.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los 15 datasets públicos de la ficha de cox-1-3b (unas 18.500 decisiones), comparando la build INT8 con la bf16:

| Métrica | cox-1-3b-int8 | cox-1-3b (bf16) | Diferencia |
|---|---|---|---|
| Skill | +0,653 | +0,653 | -0,0004 (IC 95 %: -0,003 a +0,002) |
| Accuracy | 80,7 % | 80,7 % | 0 |
| Error de calibración | 0,067 | 0,069 | -0,002 |
| Coincidencia en la respuesta principal | 99,3 % | referencia | no aplica |

Rendimiento y memoria medidos en una RTX 3070 (8 GB):

| Escenario | INT8 | bf16 |
|---|---|---|
| Peso cargado en GPU | 3,0 GB | 5,9 GB |
| Petición de 4k tokens (pico de memoria) | 3,7 GB | 6,5 GB |
| Petición de 8k tokens (pico de memoria) | 4,3 GB | 7,1 GB |
| Lote de 8 textos de 1k tokens | cabe | no cabe |
| Latencia, texto corto (sí/no + 4 opciones) | 163 ms | 113 ms |
| Latencia, 1k tokens | 296 ms | 240 ms |
| Latencia, 4k tokens | 787 ms | 710 ms |
| Tamaño de descarga | 2,9 GB | 5,7 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 3,0 GB para los pesos en CUDA; pico de 3,7 GB con una petición de 4k tokens y de 4,3 GB con 8k tokens en una RTX 3070.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM para peticiones cortas; RTX 3070 (8 GB) validada para lotes de ocho textos de 1k tokens. Para mayor throughput, A100 o H100 son adecuadas aunque no se han publicado mediciones en ellas.
- GPU de consumo: sí, cabe en tarjetas de 8 GB como la RTX 3070; en bf16 el mismo escenario de batch no cabía.
- CPU y Apple Silicon: los pesos se convierten a bf16 al cargar, por lo que el ahorro se limita al tamaño de descarga y la memoria en ejecución equivale a la build bf16.
- Opciones de despliegue: librería `coxlm` 0.7 o superior; con `torchao` instalado (`pip install "coxlm[int8]"`) usa tensores INT8 nativos, en caso contrario emplea la capa INT8 propia de coxlm. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 163 ms para texto corto, 296 ms a 1k tokens y 787 ms a 4k tokens en RTX 3070, en todos los casos superior a bf16. El throughput no se ha publicado.
- Fine-tuning y adaptadores: requieren la build bf16; esta build no los soporta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cox-1-3b-int8 | 2,87 B | no disponible | Decisión tipada con probabilidades calibradas, INT8 | Apache-2.0 | Hugging Face (`Vitund/cox-1-3b-int8`) |
| cox-1-3b (bf16) | 2,87 B | no disponible | Decisión tipada con probabilidades calibradas, bf16 | Apache-2.0 | Hugging Face (`Vitund/cox-1-3b`) |
| Modelos de clasificación tipo encoder (p. ej. DeBERTa, RoBERTa) | 0,1-0,4 B típicamente | 512 tokens típicamente | Clasificación con etiquetas fijas por cabeza | MIT / Apache-2.0 según variante | Hugging Face |
| LLM generativos pequeños con salida JSON | 1-4 B | variable | Generación de texto con formato estructurado | variable | Hugging Face |

La comparación con clasificadores encoder es pertinente por tarea (clasificación), pero cox-1-3b-int8 se diferencia en que admite preguntas tipadas arbitrarias en tiempo de inferencia sin reentrenar la cabeza, y en que devuelve distribuciones calibradas en lugar de logits por etiqueta fija. Frente a LLM generativos pequeños que emiten JSON, la ventaja es la ausencia de errores de formato y la calibración; la desventaja es que no puede justificar ni explicar la decisión. No se dispone de datos de benchmarks comparativos directos con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no se documenta soporte multilingüe; el rendimiento en otros idiomas es desconocido.
- No genera texto: no sirve para tareas que requieran explicaciones, resúmenes ni razonamiento en cadena visible.
- Latencia superior a bf16: cada producto matricial ensancha los pesos a bf16, por lo que en escenarios sensibles a latencia conviene usar la build bf16.
- Sin fine-tuning ni adaptadores: esta build no los admite; para ajuste hay que recurrir a cox-1-3b en bf16.
- En CPU, MPS y MLX los pesos se convierten a bf16 al cargar: el ahorro de memoria en esos entornos es nulo y solo se reduce la descarga.
- Riesgo de alucinación: al ser un modelo de decisión, el riesgo se manifiesta como confianza mal calibrada en dominios alejados de los datos de entrenamiento; no se han publicado análisis de sesgos.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card remite a las atribuciones de datos de entrenamiento de cox-1-3b, que conviene revisar antes de un despliegue en producción.
- Dependencia de la librería `coxlm` 0.7 o superior: versiones anteriores fallan al cargar el modelo, lo que añade una dependencia de mantenimiento en producción.
- Trazabilidad: la información sobre datos de entrenamiento, composición del dataset y contexto máximo no está en esta ficha y debe consultarse en la model card del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vitund/cox-1-3b-int8
- Modelo base: https://huggingface.co/Vitund/cox-1-3b
- Sitio de Vitund: https://vitund.ai
- Contacto y licencias: opensource@vitund.ai
