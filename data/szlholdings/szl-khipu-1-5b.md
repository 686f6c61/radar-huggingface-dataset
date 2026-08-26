# SZLHOLDINGS/SZL-Khipu-1.5B

## Resumen

SZL-Khipu-1.5B es un modelo de lenguaje compacto de 1.500 millones de parámetros desarrollado por SZLHOLDINGS, especializado en la navegación de agentes gobernados con recuperación de información. Se trata de un fine-tune del modelo base Qwen/Qwen2.5-1.5B-Instruct, entrenado con QLoRA, que transforma la tarea de recuperación en un problema de planificación estructurada: dado un conjunto de identificadores de nodos (handles) con metadatos sintéticos, el modelo genera un plan JSON que indica qué nodos consultar, cuáles citar y cuándo abstenerse si no hay información suficiente.

La relevancia de este modelo radica en su enfoque en el grounding y la reducción de alucinaciones: al no almacenar contenido de nodos en sus pesos y delegar la resolución de los handles a un controlador externo, el modelo actúa como un navegador de recuperación en lugar de un generador de respuestas desde memoria. Está diseñado para integrarse en pipelines de agentes donde la verificación de origen y la trazabilidad son críticas, como lo evidencian los recibos firmados (receipts) que acompañan al repositorio. Su tamaño reducido permite ejecutarlo en CPU, lo que facilita su despliegue en entornos con recursos limitados.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en formato safetensors y cuantizaciones GGUF disponibles, y está orientado exclusivamente al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0, F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (model.safetensors, 3,09 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, un modelo denso de 1,5B parámetros con atención causal estándar. El fine-tune se realizó mediante QLoRA (Quantized Low-Rank Adaptation), como indican las etiquetas del repositorio, lo que permite un entrenamiento eficiente en memoria sobre el modelo base congelado. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni la composición de los datos; la model card solo menciona que el entrenamiento se realizó en una máquina del propietario y que se generaron recibos firmados que atestiguan la integridad del proceso, pero no la calidad del modelo.

La innovación principal no reside en la arquitectura, sino en el objetivo de entrenamiento: el modelo aprende a generar planes de recuperación en JSON a partir de consultas y conjuntos de handles de nodos (identificadores y metadatos sintéticos). El modelo no almacena contenido de nodos en sus pesos, sino que propone rutas de recuperación que un controlador externo resuelve. Este diseño busca minimizar las alucinaciones al obligar al modelo a abstenerse cuando ningún handle es relevante. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tune.

## Capacidades

- Generacion de planes de recuperacion estructurados: dado un query y una lista de handles de nodos, el modelo produce un JSON con rutas de navegacion, citas de handles relevantes y decisiones de abstencion.
- Grounding estricto: el modelo solo puede citar handles cuyos metadatos soporten la consulta; no responde desde memoria ni inventa contenido de nodos.
- Abstencion explicita: cuando ningun handle es relevante, el modelo indica que no puede responder, reduciendo el riesgo de alucinaciones.
- Integracion con agentes gobernados: disenado para funcionar dentro de un pipeline donde un controlador externo resuelve los handles y ejecuta las acciones.
- Conversacion basica: al estar basado en Qwen2.5-1.5B-Instruct, conserva capacidades conversacionales generales, aunque su especializacion limita su uso fuera del dominio de recuperacion.
- Compatibilidad con herramientas de inferencia estandar: soporta transformers, text-generation-inference y endpoints compatibles, ademas de GGUF para Ollama y llama.cpp.

## Casos de uso

- Orquestacion de recuperacion en bases de conocimiento: el modelo puede actuar como un planificador que, ante una consulta, decide que nodos de un grafo de conocimiento consultar y en que orden, absteniendose si no hay soporte. Es adecuado para sistemas RAG donde se quiere evitar respuestas inventadas.
- Agentes conversacionales con verificacion de origen: integrar el modelo en un chatbot que necesita citar fuentes verificables. El modelo propone los handles relevantes y un controlador externo recupera el contenido, garantizando trazabilidad.
- Filtrado de candidatos en pipelines de retrieval: dado un conjunto de documentos candidatos (representados como handles con metadatos), el modelo selecciona los que realmente responden a la consulta, descartando ruido.
- Reduccion de alucinaciones en asistentes de dominio especifico: en entornos donde la precision es critica (legal, medico, financiero), el modelo puede abstenerse cuando no hay informacion suficiente, evitando respuestas incorrectas.
- Auditoria de integridad de datos: el modelo puede utilizarse para verificar que un sistema de recuperacion solo accede a nodos autorizados, gracias a su diseno de "grounded-only" y a los recibos firmados que acompanan al repositorio.
- Prototipado rapido de agentes de recuperacion: gracias a su tamano reducido y compatibilidad con Ollama, permite desarrollar y probar pipelines de agentes gobernados en CPU, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion existente es la realizada por el propio propietario en un harness sintetico pequeno, cuyos resultados se recogen en los recibos firmados del repositorio. Estos datos no constituyen una validacion independiente y deben interpretarse con cautela:

| Metrica | Resultado (evaluacion del propietario) |
|---|---|
| Plan-valid (planes JSON correctos) | 11 / 11 (100%) |
| Grounding (citas correctas sobre handles relevantes) | 4 / 5 (80%) |
| Abstencion correcta (cuando no hay handles relevantes) | 2 / 6 (33,3%) |
| Citas alucinadas | 0 |

Los denominadores son muy pequenos y la evaluacion fue ejecutada por el propio autor, por lo que no se puede considerar una medida fiable de rendimiento en produccion.

## Requisitos de hardware

- Inferencia en CPU: el modelo puede ejecutarse unicamente con CPU usando la cuantizacion GGUF Q4_K_M, que ocupa aproximadamente 0,99 GB. Es viable en equipos de escritorio o servidores sin GPU.
- VRAM estimada para inferencia: con cuantizacion Q4_K_M, la VRAM necesaria es de aproximadamente 1 GB; con FP16 (safetensors), alrededor de 3 GB. Cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, etc.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16; para cuantizaciones menores, incluso GPUs integradas pueden ser suficientes.
- Opciones de despliegue: Ollama (comando directo `ollama run hf.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF:Q4_K_M`), llama.cpp, text-generation-inference (TGI) y endpoints compatibles con transformers. Tambien es compatible con vLLM, aunque no se menciona explicitamente.
- Latencia y throughput: no se han publicado datos concretos. Dado el tamano del modelo, se espera una latencia baja en GPU y aceptable en CPU para cargas moderadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoria. Estructuralmente, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SZL-Khipu-1.5B | 1,5B | No disponible | Apache-2.0 | Recuperacion gobernada con abstencion |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32K | Apache-2.0 | Proposito general, instruct |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 | Proposito general, instruct |

La diferencia principal es que SZL-Khipu-1.5B esta especializado en una tarea concreta (navegacion de recuperacion) y no es un modelo de proposito general. No se han publicado benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta disenado exclusivamente para la tarea de navegacion de recuperacion con handles. Fuera de ese dominio, su rendimiento puede ser pobre y no debe utilizarse como modelo conversacional general.
- Evaluacion no independiente: los unicos resultados de rendimiento provienen de la evaluacion del propietario en un harness sintetico pequeno (11 muestras para plan-valid, 5 para grounding, 6 para abstencion). No hay validacion externa ni benchmarks estandar.
- Dataset de entrenamiento no documentado: no se ha publicado informacion sobre los datos utilizados para el fine-tune, lo que impide evaluar posibles sesgos o limitaciones de cobertura.
- Riesgo de alucinacion fuera de su dominio: aunque el modelo esta disenado para abstenerse, su capacidad de abstencion es limitada (33,3% en la evaluacion del propietario), por lo que puede generar citas incorrectas en situaciones no cubiertas.
- Solo ingles: no soporta otros idiomas, lo que restringe su uso en entornos multilingues.
- Licencia Apache-2.0: permite uso comercial sin restricciones, pero el modelo no incluye garantias de rendimiento ni soporte oficial.
- Receipts como prueba de integridad, no de calidad: los recibos firmados verifican la integridad de los artefactos y la continuidad del firmante, pero no validan la precision del modelo ni su idoneidad para produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Cuantizaciones GGUF: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF
- Repositorio GitHub szl-forge (demo de inferencia): https://github.com/szl-holdings/szl-forge/tree/main/spaces/szl-model-inference-lab
- Pagina de FriendliAI (inferencia gestionada): https://friendli.ai/models/SZLHOLDINGS/SZL-Khipu-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
