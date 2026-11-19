# VadymPikulyk/zils-lite-dh20m

## Resumen

zils-lite-dh20m es un modelo de decisión ("decision-model") derivado de Qwen/Qwen3.5-0.8B, publicado por VadymPikulyk dentro del ecosistema Zils (subtensor 127 de Bittensor). No es un modelo de lenguaje generativo al uso: es un "soup body" del chasis d3-lite que empaqueta los pesos de lenguaje y visión de un fine-tune de Qwen3.5-0.8B, con el objetivo de servir como cuerpo base para la subnet. El modelo parte del soup d3-lite del 19 de noviembre de 2026 (joamCriff123/zils-lite-l1117a) y le aplica una fusión de LoRA de rango 64 que destila el comportamiento del soup d3-mini (joamCriff123/zils-mini-m1115) sobre 36.000 preguntas de decisión.

La relevancia es acotada y muy específica: se trata de un artefacto de infraestructura para un pipeline de destilación y evaluación por decisiones, no de un modelo pensado para uso general. Los 852.985.920 parámetros reales del safetensors coinciden prácticamente con el tamaño de Qwen3.5-0.8B, lo que confirma que la arquitectura subyacente es la del modelo base y que el LoRA fusionado no altera la topología. La licencia Apache-2.0 y la trazabilidad de los datasets de entrenamiento son los puntos más sólidos de la ficha; la ausencia de benchmarks publicados y de documentación sobre el pipeline de inferencia son las principales lagunas.

Al estar construido sobre Qwen3.5-0.8B, hereda las capacidades del modelo base (lenguaje, visión y contexto largo según la familia Qwen3.5), pero el ajuste está orientado a producir probabilidades de respuesta sobre preguntas de decisión en formatos concretos (Jev Decision Index 0.2.1), no a generación libre. Cualquier uso fuera de ese dominio debe validarse empíricamente antes de desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), chasis d3-lite con LoRA fusionado (custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen/Qwen3.5-0.8B, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles (los datasets de destilación incluyen fuentes en inglés principalmente) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere código del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-0.8B, un transformer de aproximadamente 853 M parámetros, reempaquetado en el layout del chasis d3-lite ("soup body"). Sobre ese cuerpo se aplica una única fusión de LoRA de rango 64, learning rate 5e-5, una época y escala 1.0, ejecutada con `python -m zils.teacher train`. El objetivo de la destilación es igualar las probabilidades de respuesta del soup d3-mini (joamCriff123/zils-mini-m1115) sobre 36.000 preguntas de decisión: 20.000 reconstruidas por Zils Relay a partir de fuentes públicas (solo se usaron las preguntas; las respuestas provienen del mini body) y 16.000 renderizadas en los formatos de petición del Jev Decision Index 0.2.1.

Los datasets de la segunda mitad cubren cuatro dominios: lenguaje (ContractNLI, iSarcasmEval, RAGTruth, WinoGrande, WANLI, SEntFiN, NewsMTSC, RAGBench, SummEdits, CODAH, VAST, NLI4CT, ACOS), herramientas (When2Call, xLAM/APIGen, Seal-Tools), razonamiento (posiciones en formato ChessBench, GSM8K train, BBQ, StepGame, CaLM-Lite, causal-reasoning-benchmarks, narrative-reasoning-training-pool) y recuperación (BANKING77, CLINC150, ESCI, LLMGen-Phishing-Email, ReasonAug), además de artes (declaraciones de Habermas Machine y limericks de Edward Lear). Se eliminaron las filas solapadas con ítems de test puntuados del Decision Index y no se usaron exámenes de validador, semillas públicas ni datos de clientes. No se documenta RLHF/DPO ni decodificación especulativa.

## Capacidades

- Destilación de decisiones: reproduce las probabilidades de respuesta del soup d3-mini sobre preguntas de decisión en los formatos del Jev Decision Index 0.2.1.
- Herencia del modelo base: conserva las capacidades de lenguaje y visión de Qwen3.5-0.8B (generación de texto, comprensión multimodal según la familia).
- Dominios cubiertos por el entrenamiento: NLI y inferencia (WinoGrande, WANLI, ContractNLI, NLI4CT), detección de alucinación (RAGTruth, SummEdits), análisis de sentimiento/sarcasmo (iSarcasmEval, SEntFiN), clasificación de intención (BANKING77, CLINC150), tool calling (When2Call, xLAM/APIGen, Seal-Tools), razonamiento (GSM8K, BBQ, StepGame, ChessBench) y retrieval (ESCI, ReasonAug).
- Evaluación por decisión: pensado para producir una respuesta entre opciones, no para generación abierta de texto.
- Soporte de tool calling: no confirmado de forma nativa en la ficha; el entrenamiento incluye datasets de herramientas, pero no se documenta integración de function calling.
- Capacidades de agente y multi-step reasoning: no disponible como capacidad documentada; el razonamiento aparece solo como dominio de entrenamiento.
- Capacidades multilingües: no disponibles; las fuentes de entrenamiento son mayoritariamente en inglés.
- Modo thinking, audio: no disponible.

## Casos de uso

- Evaluación de respuestas en pipelines de decisión: el modelo está entrenado para emitir probabilidades sobre preguntas de decisión en formatos Jev Decision Index 0.2.1, por lo que encaja como scorer en sistemas de selección de opción única o ranking de candidatos.
- Destilación de un teacher más grande: sirve como cuerpo alumno para destilar soups mayores (d3-mini) en un chasis de ~0,85 B parámetros, útil para reducir coste de inferencia manteniendo el comportamiento del teacher en el dominio de decisión.
- Filtro de alucinación en RAG: las fuentes RAGTruth, SummEdits y RAGBench permiten usarlo como clasificador de fidelidad de respuestas generadas por otro modelo antes de servirlas al usuario.
- Clasificación de intención en atención al cliente: BANKING77 y CLINC150 están en el entrenamiento, así que puede etiquetar consultas entrantes en dominios bancarios y de asistentes virtuales con un modelo de menos de 1 GB.
- Detección de sarcasmo y análisis de sentimiento: iSarcasmEval y SEntFiN permiten usarlo como clasificador auxiliar en moderación de comentarios o análisis de opinión, siempre que se valide con datos propios.
- Enrutado de herramientas en agentes: los datasets When2Call, xLAM/APIGen y Seal-Tools lo hacen candidato para decidir qué herramienta invocar en un pipeline de agentes, aunque la ausencia de documentación de tool calling nativo obliga a probar el formato de salida.
- Verificación de implicación textual en contratos: ContractNLI y NLI4CT lo sitúan como candidato para comprobar si una cláusula se sigue de un texto contractual, con validación humana en producción.
- Razonamiento sobre tableros y acertijos: ChessBench, StepGame y BBQ permiten evaluaciones de razonamiento estructurado en entornos controlados, no como generador de partidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, en torno a 0,5 GB (estimaciones a partir del número de parámetros, sin datos oficiales del autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con contexto moderado; A100/H100 no son necesarias por tamaño, pero pueden usarse para lotes grandes o throughput alto.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y GPUs integradas con suficiente memoria unificada; también en CPU con llama.cpp si se generan pesos GGUF, que el autor no publica.
- Opciones de despliegue: al usar `custom_code` y un layout d3-lite, requiere el código del repositorio Zils para cargar los pesos; vLLM, TGI, llama.cpp y Ollama no están confirmados para este formato. La vía documentada es el pipeline `zils` del autor.
- Latencia y throughput: no disponibles; al ser un modelo de ~0,85 B parámetros, la latencia esperada es baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-dh20m | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, custom_code | Destilación de decisiones sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base; uso generalista |
| joamCriff123/zils-mini-m1115 | no disponible | no disponible | Apache-2.0 | Hugging Face | Teacher del soup d3-mini destilado aquí |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 | Hugging Face | Soup d3-lite de partida |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, otros modelos de ~1 B parámetros) no es significativa porque zils-lite-dh20m está especializado en decisión y no publica métricas de calidad generalistas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; los datasets de entrenamiento (ContractNLI, WinoGrande, BBQ, etc.) pueden introducir sesgos de dominio legal, inglés y culturas occidentales.
- Riesgo de alucinación: el modelo está entrenado para producir probabilidades sobre opciones, no texto libre; usarlo como generador abierto puede producir salidas incoherentes o inventadas.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada en la ficha y los idiomas soportados figuran como no disponibles; las fuentes de entrenamiento son mayoritariamente en inglés, por lo que el rendimiento en castellano no está validado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo depende de Qwen3.5-0.8B y de datasets con licencias propias; el autor pide citar los datasets originales (ver LICENSE y NOTICE del repo).
- Formato propietario: requiere `custom_code` y el layout d3-lite; no hay pesos GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue con herramientas estándar (llama.cpp, Ollama, vLLM) sin trabajo adicional.
- Trazabilidad del entrenamiento: el autor declara haber eliminado solapamientos con ítems de test del Decision Index y no haber usado exámenes de validador ni datos de clientes, pero no se publican métricas que permitan verificar la calidad de la destilación.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (19 de noviembre de 2026); es un artefacto reciente sin validación comunitaria.
- Uso en producción: al ser un cuerpo de subnet con pipeline específico, requiere integración con el código Zils y validación en el dominio concreto antes de desplegarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh20m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Soup d3-lite de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Teacher d3-mini: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset de preguntas de Zils Relay: https://huggingface.co/zils-ai/zils-relay-answers
- Referencia d3-lite del ecosistema: https://huggingface.co/vllm-sr/d3-lite
