# VadymPikulyk/zils-lite-dh22d

## Resumen

zils-lite-dh22d es un modelo de decisión de 852.985.920 parámetros construido por VadymPikulyk como "cuerpo" (body) para Zils, un subnet de Bittensor (subnet 127). Se trata de un fine-tune de Qwen/Qwen3.5-0.8B reorganizado en el formato de chasis d3-lite, orientado a tareas de decisión estructurada más que a generación libre de texto. El modelo parte del soup d3-lite publicado el 2026-11-19 (joamCriff123/zils-lite-l1117a, Apache-2.0) y le aplica una única modificación de pesos mediante un LoRA fusionado de rango 64.

La innovación principal es el método de entrenamiento denominado "delta distillation": en lugar de destilar directamente de un profesor, el modelo aprende la diferencia entre dos cuerpos mini (zils-mini-m1115 y zils-mini-m1117b). Para cada pregunta, el objetivo es la distribución de respuestas de l1117a re-ponderada opción por opción por el cociente de probabilidades entre m1117b y m1115, con el ratio recortado a [1/50, 50] y probabilidades con suelo de 1e-4. De este modo solo se transfiere lo que cambió entre ambos cuerpos mini.

El entrenamiento se realizó sobre aproximadamente 76.000 preguntas de decisión: 50.000 reconstruidas por Zils Relay a partir de fuentes públicas y 26.000 renderizadas en los formatos de petición del Jev Decision Index 0.2.1 a partir de splits de entrenamiento de fuentes con licencia (ContractNLI, WinoGrande, GSM8K, When2Call, BANKING77, entre otras). El modelo se publica bajo licencia Apache-2.0 y su relevancia actual radica en su uso como componente evaluable dentro del ecosistema de subnets de Bittensor, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), chasis d3-lite |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura del transformer Qwen3.5-0.8B, reorganizada en el layout de chasis d3-lite, que define la disposición de los pesos de lenguaje y visión dentro del ecosistema Zils. Sobre el soup base l1117a se aplicó un único cambio de pesos mediante LoRA de rango 64, learning rate 5e-5, una época y escala 1.4, ejecutado con `python -m zils.teacher train`. El resultado es un modelo que conserva la estructura del base pero con la distribución de decisión ajustada por el delta entre dos cuerpos mini.

La técnica de "delta distillation" es el elemento diferenciador: el objetivo de entrenamiento no es la salida de un profesor único, sino la distribución de l1117a re-ponderada por el cociente de probabilidades m1117b/m1115, con recorte del ratio a [1/50, 50], suelo de probabilidad en 1e-4 y renormalización posterior. El corpus consta de unas 76.000 preguntas de decisión: 50.000 reconstruidas por Zils Relay (zils-ai/zils-relay-answers, usando solo las preguntas) y 26.000 renderizadas en los formatos del Jev Decision Index 0.2.1 desde splits de entrenamiento de fuentes con licencia en dominios de lenguaje, herramientas, razonamiento, recuperación y artes. Se eliminaron las filas solapadas con cualquier ítem de test puntuado del Decision Index, y no se usaron ítems de exámenes de validadores, exámenes semilla públicos ni datos de clientes.

## Capacidades

- Toma de decisiones estructurada: el modelo está entrenado para responder preguntas de decisión en los formatos de petición del Jev Decision Index 0.2.1, no para generación libre.
- Razonamiento sobre opciones: aprende distribuciones de respuesta re-ponderadas opción por opción, lo que le permite discriminar entre alternativas en tareas de elección.
- Dominio lingüístico: cubierto por fuentes como ContractNLI, iSarcasmEval, RAGTruth, WinoGrande, WANLI, SEntFiN, NewsMTSC, RAGBench, SummEdits, CODAH y los splits de entrenamiento de VAST, NLI4CT y ACOS.
- Uso de herramientas: entrenado con When2Call, xLAM/APIGen y Seal-Tools, lo que le da capacidad de decidir cuándo invocar herramientas.
- Razonamiento: posiciones en formato ChessBench, GSM8K train, BBQ, StepGame, CaLM-Lite, causal-reasoning-benchmarks y narrative-reasoning-training-pool.
- Recuperación: BANKING77, CLINC150, ESCI, LLMGen-Phishing-Email y ReasonAug.
- Capacidades de visión: el modelo card menciona pesos de lenguaje y visión, aunque no se detallan tareas de visión específicas.
- Soporte de tool calling y agentes multi-paso: no disponible como capacidad explícita documentada más allá del entrenamiento en When2Call y xLAM.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación en subnets de Bittensor: el modelo se integra como cuerpo de decisión en el subnet 127 (Zils), donde responde a preguntas estructuradas y su salida se puntúa contra el Decision Index; su formato de chasis d3-lite facilita el intercambio con otros cuerpos del ecosistema.
- Clasificación y enrutamiento de consultas: gracias al entrenamiento con BANKING77 y CLINC150, puede usarse para decidir la intención de una consulta de usuario y enrutarla al servicio adecuado en un pipeline de atención al cliente.
- Decisión de invocación de herramientas: el entrenamiento con When2Call y xLAM/APIGen permite usar el modelo como clasificador que determina si una petición requiere llamar a una API y cuál, antes de pasar el control a un modelo mayor.
- Verificación de fidelidad en RAG: con RAGTruth y RAGBench en el corpus, puede emplearse para decidir si una respuesta generada está respaldada por el contexto recuperado, como filtro en un pipeline de generación aumentada.
- Detección de sarcasmo y análisis de sentimiento en noticias: las fuentes iSarcasmEval, SEntFiN y NewsMTSC lo hacen adecuado para tareas de decisión sobre polaridad y figuras retóricas en textos periodísticos.
- Razonamiento sobre posiciones de ajedrez: el entrenamiento con posiciones en formato ChessBench permite usarlo como evaluador de jugadas o de estados de tablero en herramientas de análisis.
- Filtrado de correos de phishing: la inclusión de LLMGen-Phishing-Email lo habilita como clasificador de decisión en sistemas de seguridad de correo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en FP16 requiere aproximadamente 1,7 GB de pesos; en FP32 unos 3,4 GB; en cuantización de 8 bits alrededor de 0,9 GB y en 4 bits unos 0,5 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar los pesos en FP16; para FP32 se recomienda 8 GB o más.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el modelo usa `custom_code` y está vinculado a vLLM según el nombre del cuerpo base (vllm-sr/d3-lite); no se documentan opciones para llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-dh22d | 852.985.920 | no disponible | apache-2.0 | Decision model para subnet Zils |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | Modelo base de propósito general |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | apache-2.0 | Soup d3-lite predecesor |
| joamCriff123/zils-mini-m1115 y m1117b | no disponible | no disponible | apache-2.0 | Cuerpos mini usados como referencia de delta |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en preguntas de decisión en formatos concretos (Jev Decision Index 0.2.1); su uso fuera de ese esquema de petición puede degradar la calidad de las respuestas.
- No se documentan sesgos conocidos, pero el corpus incluye fuentes diversas (ContractNLI, BBQ, WinoGrande) cuyos sesgos pueden propagarse al modelo.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de decisión, el riesgo se manifiesta como asignación errónea de probabilidad a opciones.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la longitud de contexto ni los idiomas cubiertos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor pide citar los datasets originales (ver LICENSE y NOTICE del repositorio).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El uso de `custom_code` implica que la carga requiere confiar en código remoto del repositorio, con el riesgo de seguridad asociado.
- No se han publicado ítems de examen de validadores ni datos de clientes, pero tampoco se documenta una evaluación independiente del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh22d
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo base d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Soup predecesor: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Cuerpos mini de referencia: https://huggingface.co/joamCriff123/zils-mini-m1115 y https://huggingface.co/joamCriff123/zils-mini-m1117b
- Zils Relay: https://huggingface.co/zils-ai/zils-relay-answers
