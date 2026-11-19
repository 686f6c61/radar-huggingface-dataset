# VadymPikulyk/zils-lite-dh19

## Resumen

zils-lite-dh19 es un modelo de decisión derivado de Qwen/Qwen3.5-0.8B, publicado por VadymPikulyk como "soup body" para Zils, el subnet 127 de Bittensor. No es un modelo conversacional al uso: se trata de un ajuste fino destilado que emite decisiones estructuradas en el formato Jev Decision Index 0.2.1, orientado a tareas de lenguaje, uso de herramientas (tool calling) y razonamiento. El modelo parte del soup d3-lite de 2026-11-18 (`joamCriff123/zils-lite-l1117a`) y le aplica una fusión de LoRA de rango 64 entrenada sobre unas 60.000 filas.

Arquitectónicamente hereda el chasis de Qwen3.5-0.8B (transformer denso de aproximadamente 853 millones de parámetros, según los pesos en safetensors), por lo que mantiene la tokenizador y la disposición de capas del modelo base, pero con los pesos de lenguaje y visión reorganizados en el layout "d3-lite" y con el comportamiento orientado a producir decisiones etiquetadas en lugar de texto libre.

Su relevancia es acotada pero concreta: sirve como pieza de referencia para quienes trabajan con subnets de Bittensor centrados en evaluación de decisiones, destilación de profesores y formatos de decisión estandarizados. La licencia Apache-2.0 y el tamaño reducido lo hacen fácil de desplegar, aunque su naturaleza experimental y la ausencia de benchmarks publicados limitan su uso en producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (chasis Qwen3.5-0.8B, layout d3-lite) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen/Qwen3.5-0.8B, reorganizado en el chasis d3-lite y con pesos de lenguaje y visión conservados. Sobre ese punto de partida se aplica una única fusión de LoRA de rango 64 (learning rate 5e-5, una época, escala 1.0) entrenada con `python -m zils.teacher train`. Los objetivos de entrenamiento son mixtos: 0,5 × la etiqueta gold + 0,5 × la respuesta del propio soup de partida, lo que constituye una forma de destilación suavizada hacia el comportamiento del profesor.

El conjunto de entrenamiento ronda las 60.000 filas y combina tres bloques: lenguaje (ContractNLI, iSarcasmEval, RAGTruth, WinoGrande, WANLI, createdebate-arguments, SEntFiN, NewsMTSC, RAGBench, SummEdits, CODAH, VAST, NLI4CT 2024, ACOS), herramientas (When2Call con llamadas APIGen/xLAM, xlam-irrelevance-7.5k, apigen-function-calling, Seal-Tools) y razonamiento (ChessBench, GSM8K, BBQ, StepGame, CaLM-Lite, benchmarks de razonamiento causal y narrative-reasoning). Se eliminaron las filas solapadas con ítems de test del Decision Index, y no se usaron exámenes de validador ni datos de clientes. No se documenta el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Emisión de decisiones estructuradas en el formato Jev Decision Index 0.2.1, que es su función principal.
- Clasificación y juicio sobre pares de frases y documentos (NLI, inferencia en contratos, evaluación de resúmenes).
- Detección de alucinaciones y verificación de fidelidad de respuestas (entrenado con RAGTruth y RAGBench).
- Análisis de sentimiento y sarcasmo en textos cortos y noticias financieras.
- Tool calling y function calling, incluyendo decisiones de cuándo invocar una herramienta y cuándo no (When2Call, xlam-irrelevance).
- Razonamiento multi-paso acotado: posiciones de ajedrez, GSM8K, StepGame y razonamiento causal.
- Capacidades de visión heredadas del modelo base (los pesos de visión se conservan en el chasis d3-lite), aunque no se documenta su comportamiento tras el ajuste.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de decisiones en subnets de Bittensor: el modelo actúa como "soup body" de referencia para comparar la calidad de decisiones emitidas por validadores y mineros del subnet 127, gracias a su formato de salida estandarizado.
- Verificación de fidelidad en pipelines RAG: al estar entrenado con RAGTruth y RAGBench, puede puntuar si una respuesta generada está respaldada por el contexto recuperado antes de mostrarla al usuario.
- Moderación de resúmenes automáticos: con SummEdits y RAGBench puede detectar ediciones no soportadas en resúmenes de documentos legales, financieros o científicos.
- Enrutado de llamadas a herramientas en agentes: su entrenamiento con When2Call y xlam-irrelevance permite decidir si una consulta requiere invocar una API, qué herramienta elegir y cuándo responder directamente.
- Análisis de sentimiento en noticias financieras: el ajuste con NewsMTSC y financial_news_sentiment lo hace adecuado para clasificar titulares y notas de prensa en flujos de análisis de mercado.
- Detección de sarcasmo y tono en reseñas o redes sociales: iSarcasmEval y CODAH aportan señal para tareas de comprensión pragmática en textos breves.
- Evaluación de argumentos en debates: createdebate-arguments y WANLI permiten puntuar la coherencia y la relación inferencial entre premisas y conclusiones.
- Prototipado de razonamiento estructurado en local: con 853 M de parámetros y pesos safetensors, se puede ejecutar en una GPU de consumo para experimentar con formatos de decisión sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100, H100 o L40S para despliegues por lotes o con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores; también en GPUs integradas con suficiente memoria compartida en cuantización de 4 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`); vLLM y TGI si el chasis d3-lite está soportado por esas librerías; llama.cpp/Ollama solo si se genera una conversión GGUF, que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-dh19 | 853 M | no disponible | Apache-2.0 | Decision model destilado (Jev Decision Index 0.2.1) |
| Qwen/Qwen3.5-0.8B | ~800 M | no disponible | Apache-2.0 (según modelo base) | LLM generalista |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | Chasis d3-lite para soups |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 | Soup de partida del ajuste |

La comparación directa con alternativas de la misma categoría (modelos de decisión para subnets) no está disponible en la información proporcionada. Frente a Qwen3.5-0.8B, la diferencia principal es el formato de salida y el sesgo hacia decisiones etiquetadas, no el tamaño ni el contexto.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes: el rendimiento real en cada tarea es desconocido.
- El modelo está especializado en el formato Jev Decision Index 0.2.1; fuera de ese esquema su comportamiento puede degradarse respecto al modelo base.
- Riesgo de alucinación inherente a un modelo de 853 M de parámetros, especialmente en razonamiento multi-paso y contextos largos.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Algunos datasets de entrenamiento (VAST, NLI4CT 2024, ACOS) no declaran licencia explícita; el autor indica que se usaron para investigación bajo su propio criterio, lo que puede generar dudas en auditorías de cumplimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-18: es un artefacto muy reciente y sin validación comunitaria.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; conviene revisar el código antes de desplegarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero la cadena de modelos base y soups intermedios debe verificarse para cumplir con sus respectivas condiciones.
- No se documenta la longitud de contexto efectiva tras el ajuste; asumir la del modelo base sin verificar puede provocar fallos silenciosos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh19
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Soup de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Dataset When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset xlam-irrelevance: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
- Dataset apigen-function-calling: https://huggingface.co/datasets/argilla/apigen-function-calling
- Dataset RAGTruth: https://huggingface.co/datasets/wise-lab/RAGTruth
- Dataset RAGBench: https://huggingface.co/datasets/rungalileo/RAGBench
- Dataset SummEdits: https://huggingface.co/datasets/summedits/summedits
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset WinoGrande: https://huggingface.co/datasets/allenai/winogrande
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
