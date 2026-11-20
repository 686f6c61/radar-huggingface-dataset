# VadymPikulyk/zils-lite-dh21m

## Resumen

zils-lite-dh21m es un modelo de decisión derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario VadymPikulyk en Hugging Face. Forma parte del ecosistema Zils, asociado al subnet 127 de Bittensor, y se presenta como un "soup body" (cuerpo base fusionado) en la disposición de chasis d3-lite. No es un modelo de propósito general, sino un componente pensado para resolver tareas de decisión estructuradas dentro de un pipeline mayor denominado Jev Decision Index.

El modelo parte del soup d3-lite del 19 de noviembre de 2026 (joamCriff123/zils-lite-l1117a, Apache-2.0) y aplica una fusión LoRA de rango 64 que destila las probabilidades de respuesta del soup mini joamCriff123/zils-mini-m1115 sobre aproximadamente 220.000 preguntas de decisión. Cuenta con 852.985.920 parámetros reales según los pesos safetensors y un repositorio de 1,7 GB. La relevancia actual es limitada: se trata de una publicación con cero descargas y cero likes, sin benchmarks ni documentación de idiomas, orientada a un nicho muy concreto de evaluación dentro de Zils.

La información pública disponible es escasa y proviene casi exclusivamente de la model card del autor. No se detallan resultados de evaluación, idiomas soportados ni pipeline de inferencia, por lo que esta ficha refleja únicamente lo verificable en los metadatos y en el README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), disposición de chasis d3-lite; requiere `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código personalizado) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros, reorganizado en el diseño de chasis d3-lite. Sobre el soup base joamCriff123/zils-lite-l1117a se aplica una única modificación de pesos mediante fusión LoRA: rango 64, learning rate 5e-5, una época, comando `python -m zils.teacher train` y escala 0,7.

El objetivo del entrenamiento es la destilación de las probabilidades de respuesta del soup mini joamCriff123/zils-mini-m1115 sobre unas 220.000 preguntas de decisión. De ellas, aproximadamente 194.000 fueron reconstruidas a partir de fuentes públicas de entrenamiento por Zils Relay (zils-ai/zils-relay-answers), usando solo las preguntas y tomando las respuestas del cuerpo mini. Las 26.000 restantes se generaron en los formatos de petición del Jev Decision Index 0.2.1 a partir de splits TRAIN de fuentes con licencia, cubriendo dominios de lenguaje (ContractNLI, iSarcasmEval, RAGTruth, WinoGrande, WANLI, SEntFiN, NewsMTSC, RAGBench, SummEdits, CODAH, VAST, NLI4CT, ACOS), herramientas (When2Call, xLAM/APIGen, Seal-Tools), razonamiento (ChessBench, GSM8K, BBQ, StepGame, CaLM-Lite, causal-reasoning-benchmarks, narrative-reasoning-training-pool), recuperación (BANKING77, CLINC150, ESCI, LLMGen-Phishing-Email, ReasonAug) y artes (Habermas Machine, limericks de Edward Lear). Se eliminaron las filas solapadas con cualquier ítem de test puntuado del Decision Index, y no se usaron ítems de exámenes de validadores, de exámenes semilla públicos ni datos de clientes.

No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés técnico reside en el esquema de destilación por probabilidades y en la fusión LoRA sobre un soup previo.

## Capacidades

- Generación de texto y respuesta a preguntas de decisión en los formatos definidos por el Jev Decision Index 0.2.1.
- Clasificación y decisión sobre tareas de lenguaje natural (inferencia, sarcasmo, veracidad, resumen, etc., según las fuentes de entrenamiento).
- Decisiones de invocación de herramientas (tool calling) en el marco de los formatos When2Call, xLAM/APIGen y Seal-Tools.
- Razonamiento de varios pasos en dominios acotados (posiciones de ajedrez, GSM8K, StepGame, razonamiento causal).
- Recuperación y enrutamiento de intenciones (BANKING77, CLINC150, ESCI).
- Capacidades de visión heredadas de los pesos de Qwen3.5-0.8B, según indica la model card ("language and vision weights").
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Evaluación de decisiones en el subnet 127 de Bittensor: el modelo actúa como cuerpo base para validadores y mineros que puntúan respuestas según el Jev Decision Index, aprovechando que fue entrenado con los formatos de petición exactos de ese índice.
- Enrutamiento de intenciones en asistentes conversacionales: al haber sido destilado sobre BANKING77 y CLINC150, puede clasificar consultas de usuario en categorías predefinidas dentro de un pipeline de atención al cliente.
- Decisión de invocación de herramientas en agentes: los datos de When2Call, xLAM/APIGen y Seal-Tools permiten usarlo como clasificador que decide si una consulta requiere llamar a una API y cuál.
- Verificación de afirmaciones y detección de alucinaciones: el entrenamiento con RAGTruth, RAGBench y SummEdits lo hace adecuado como componente de control de calidad en sistemas de generación aumentada por recuperación.
- Filtrado de contenido y análisis de sarcasmo: las fuentes iSarcasmEval y CODAH permiten emplearlo en moderación o análisis de opinión en redes.
- Razonamiento estructurado sobre tablas y documentos: NLI4CT, NewsMTSC y VAST aportan ejemplos de decisión sobre evidencia clínica, tablas y texto periodístico.
- Destilación posterior: al ser un cuerpo "soup" con licencia Apache-2.0, puede servir como punto de partida para nuevos ciclos de fusión LoRA o destilación hacia modelos mayores, como demuestra su propio proceso de creación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,7 GB en precisión completa (fp16/bf16) para 852 millones de parámetros; aproximadamente 0,9 GB en cuantización de 8 bits y 0,5 GB en 4 bits, estimaciones teóricas no verificadas en este modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas de consumo como RTX 3060, RTX 4060 o superiores son suficientes. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero pueden usarse para batcheo masivo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas con 4 GB o más.
- Opciones de despliegue: requiere `custom_code` (transformers con `trust_remote_code=True`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no haber pesos GGUF publicados, llama.cpp y Ollama no están disponibles de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-dh21m | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, requiere custom_code |
| Qwen/Qwen3.5-0.8B | ~0,8B (no confirmado en la informacion) | no disponible | no disponible en la informacion | Hugging Face |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 | Hugging Face |
| joamCriff123/zils-mini-m1115 | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para los formatos del Jev Decision Index 0.2.1 y el ecosistema Zils/Bittensor; su comportamiento fuera de ese marco no está documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que impide compararlo con alternativas de forma rigurosa.
- Riesgo de alucinación: inherente a un modelo de 0,85B; no se han publicado evaluaciones de fidelidad.
- Idiomas no especificados: se desconoce si conserva el multilingüismo de Qwen3.5-0.8B o si la destilación lo ha reducido.
- Licencia Apache-2.0: permite uso comercial, pero la model card exige citar los datasets originales (ver LICENSE y NOTICE) y respetar las licencias de las fuentes de entrenamiento.
- Requiere `custom_code`: la carga implica ejecutar código del repositorio con `trust_remote_code=True`, lo que supone un riesgo de seguridad en entornos de producción.
- Publicación sin tracción: cero descargas y cero likes en el momento de la consulta, sin comunidad que valide su funcionamiento.
- Fecha de creación futura (2026-11-20) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh21m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Soup d3-lite de partida: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Soup mini destilado: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset de preguntas de Zils Relay: https://huggingface.co/zils-ai/zils-relay-answers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
