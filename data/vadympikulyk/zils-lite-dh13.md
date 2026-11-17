# VadymPikulyk/zils-lite-dh13

## Resumen

zils-lite-dh13 es un modelo de decisión (decision model) de 852.985.920 parámetros construido sobre Qwen/Qwen3.5-0.8B y publicado por VadymPikulyk. Forma parte de la familia Zils, asociada al subnet 127 de Bittensor, y se distribuye como "soup body" en el chasis d3-lite: es decir, no es un modelo conversacional generalista, sino un cuerpo de pesos destinado a ser integrado en el pipeline de decisión de Zils, donde se le plantean preguntas tipadas (elección múltiple, sí/no y puntuaciones) y debe emitir una respuesta estructurada.

Técnicamente, el modelo parte de la media uniforme de dos cuerpos d3-lite (joamCriff123/zils-lite-l1116b y joamCriff123/zils-lite-l1116a) y le suma el cambio de pesos de VadymPikulyk/zils-lite-dh12, escalado por 0,7. Ese delta proviene de un LoRA fusionado entrenado con la receta d3 de Zils (rango 16, alpha 32, solo módulos de atención, una época, lr 5e-5) sobre aproximadamente 20.000 ítems de decisión tipados derivados de splits públicos de entrenamiento.

Su relevancia es acotada pero clara: sirve como referencia de cómo se componen y versionan modelos especializados dentro de un ecosistema de subred descentralizada, con licencia Apache-2.0 y pesos en safetensors. No hay métricas publicadas, ni idiomas declarados, ni pipeline asignado, por lo que su evaluación debe hacerse por inspección de la receta y por pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B, tag `qwen3_5`, con `custom_code`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantización | no disponible (repo con safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB, incluye `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros, cargado mediante `custom_code` y etiquetado con el identificador `qwen3_5`. Sobre esa base, zils-lite-dh13 no se entrena desde cero: se construye por composición de pesos. Primero se calcula la media uniforme de los dos cuerpos d3-lite sentados el 2026-11-17 (joamCriff123/zils-lite-l1116b y joamCriff123/zils-lite-l1116a). Después se añade el delta de VadymPikulyk/zils-lite-dh12 multiplicado por 0,7, lo que actúa como un paso de interpolación que suaviza la contribución del fine-tune respecto al cuerpo base.

El delta procede de un LoRA fusionado entrenado con la receta fijada de Zils (`python -m zils.d3 train`): rango 16, alpha 32, aplicado únicamente a módulos de atención, una sola época y tasa de aprendizaje 5e-5. El conjunto de entrenamiento son unos 20.000 ítems de decisión tipados (preguntas de elección, sí/no y puntuación) generados a partir de splits públicos de TRAIN de ARC (Easy y Challenge), MMLU auxiliary train, OpenBookQA, QuaRTz, WinoGrande, COPA, GSM8K, CommonsenseQA, SciQ, MNLI, CoLA, MRPC, PAWS, SciTail, SMS Spam Collection, BoolQ, QNLI, 20 Newsgroups, dair-ai/emotion, TweetEval irony, Rotten Tomatoes, SST-5 y glaiveai/glaive-function-calling-v2 (para decisiones de uso de herramientas), más ítems aritméticos y de puntuación por rúbrica generados por reglas. El entrenamiento usa objetivos suaves: 0,5 × la etiqueta gold + 0,5 × la respuesta del propio cuerpo de partida. El autor declara explícitamente que no se usaron ítems del examen de validadores, ítems públicos del examen semilla ni datos de clientes.

## Capacidades

- Emisión de decisiones tipadas: preguntas de elección múltiple, preguntas de sí/no y preguntas de puntuación (score/rubric scoring).
- Clasificación y juicio sobre texto: adecuado para tareas de entailment (MNLI, SciTail), aceptabilidad gramatical (CoLA), paráfrasis (MRPC, PAWS) y respuesta a preguntas booleanas (BoolQ).
- Razonamiento aritmético básico, reforzado con ítems aritméticos generados por reglas.
- Decisiones de uso de herramientas (tool-use decisions), a partir de glaive-function-calling-v2; no se documenta un protocolo de function calling nativo ni un esquema JSON formal.
- Clasificación de sentimiento, emoción, ironía y spam (SST-5, dair-ai/emotion, TweetEval irony, SMS Spam Collection).
- Capacidades de visión: el autor menciona "language and vision weights", pero no se detalla ningún encoder visual, resolución de imagen ni tarea multimodal concreta; no disponible.
- Capacidades multilingües: no declaradas; la composición del dataset es mayoritariamente anglófona.
- Modo thinking, agentes multi-paso y razonamiento extendido: no documentados.

## Casos de uso

- Arbitraje de decisiones en el subnet 127 de Bittensor: el modelo se integra como cuerpo d3-lite en el chasis de Zils para responder a los ítems tipados del protocolo; su formato de salida y su receta están alineados con ese pipeline, lo que reduce el trabajo de adaptación.
- Clasificación de texto por lotes: al ser un modelo de 0,85 B, se puede ejecutar sobre corpus grandes (por ejemplo, etiquetado de reseñas, detección de spam o análisis de sentimiento) con coste por token bajo y sin necesidad de GPU de gama alta.
- Filtrado de pares pregunta-respuesta en pipelines de datos: usar las preguntas de sí/no para validar si un par es entailment, paráfrasis o respuesta correcta antes de incorporarlo a un dataset de entrenamiento.
- Enrutado de decisiones de uso de herramientas: dado un contexto y un conjunto de herramientas disponibles, decidir si se debe invocar una herramienta y cuál; útil como clasificador previo barato en un agente mayor.
- Evaluación comparativa de "soups": servir como punto de referencia reproducible para medir el efecto de la interpolación de pesos y del escalado del delta (0,7) frente a los cuerpos d3-lite de origen.
- Puntuación por rúbrica en evaluación automática: emplear la salida de score para puntuar respuestas de otros modelos en un juez de bajo coste, con la advertencia de que no hay calibración publicada.
- Prototipado en local: al ocupar 1,7 GB en safetensors, cabe en una GPU de consumo para pruebas de integración del chasis d3-lite antes de desplegar versiones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 3-4 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,2 GB de pesos; en 4 bits, alrededor de 0,5-0,7 GB. No se publican artefactos GGUF ni cuantizaciones oficiales, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (RTX 3050/3060, RTX 4060, T4). Para throughput alto, A10G, L4, A100 o H100 con lotes grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 6 GB o más; también es viable en CPU para inferencia por lotes no interactiva.
- Opciones de despliegue: requiere `custom_code` y confianza remota, lo que condiciona el soporte. vLLM y TGI pueden no cargarlo sin adaptación; llama.cpp y Ollama necesitarían conversión a GGUF, no publicada. La vía más directa es `transformers` con `trust_remote_code=True`.
- Latencia y throughput: no disponibles. A modo de orientación por tamaño, un modelo de 0,85 B en una GPU moderna suele operar en el rango de decenas a cientos de tokens por segundo, pero no hay medición publicada para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-dh13 | 852.985.920 | no disponible | Apache-2.0 | Decision model sobre Qwen3.5-0.8B, cuerpo para subnet 127 | Hugging Face, safetensors con `custom_code` |
| Qwen/Qwen3.5-0.8B | ~0,8 B (según modelo base) | no disponible | no disponible en la información | Modelo base generalista del que deriva | Hugging Face |
| joamCriff123/zils-lite-l1116a | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo, componente de la media | Hugging Face |
| joamCriff123/zils-lite-l1116b | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo, componente de la media | Hugging Face |
| VadymPikulyk/zils-lite-dh12 | no disponible | no disponible | no disponible en la información | Iteración anterior que aporta el delta LoRA | Hugging Face |

## Limitaciones y advertencias

- No hay benchmarks, evaluación de validadores ni métricas de exactitud publicadas; el rendimiento real es desconocido.
- El entrenamiento usa objetivos suaves (mezcla 50/50 con las respuestas del cuerpo de partida), lo que puede arrastrar y amplificar los errores sistemáticos del modelo base.
- El dataset es mayoritariamente anglófono y de dominios muy heterogéneos (NLI, sentimiento, spam, aritmética, tool use); el comportamiento fuera de esas distribuciones no está caracterizado.
- Riesgo de alucinación en preguntas abiertas: el modelo está optimizado para emitir decisiones tipadas, no para generar texto libre fiable.
- Idiomas soportados no declarados; no debe asumirse un rendimiento aceptable en castellano.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar los ficheros antes de desplegar en producción.
- Longitud de contexto no documentada: no se debe asumir la ventana nativa del modelo base sin verificarla.
- Aunque la licencia es Apache-2.0, la model card remite a LICENSE y NOTICE y pide citar los datasets originales; conviene revisar las condiciones de cada dataset de entrenamiento antes de un uso comercial.
- El autor declara que no se usaron ítems de examen ni datos de clientes, pero no hay verificación independiente de esa afirmación.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh13
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo d3-lite de referencia: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo previo A: https://huggingface.co/joamCriff123/zils-lite-l1116a
- Cuerpo previo B: https://huggingface.co/joamCriff123/zils-lite-l1116b
- Iteración anterior con el delta LoRA: https://huggingface.co/VadymPikulyk/zils-lite-dh12
- Dataset de tool use citado: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset de emociones citado: https://huggingface.co/datasets/dair-ai/emotion
