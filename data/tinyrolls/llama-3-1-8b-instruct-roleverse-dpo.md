# tinyrolls/Llama-3.1-8B-Instruct-RoleVerse-DPO

## Resumen

Llama-3.1-8B-Instruct-RoleVerse-DPO es un ajuste fino por DPO (Direct Preference Optimization) del modelo meta-llama/Llama-3.1-8B-Instruct, desarrollado por el usuario tinyrolls. El modelo está especializado en role-playing multilingüe y se entrena exclusivamente con DPO sobre el dataset RoleVerse, un benchmark de role-playing construido en torno a situaciones de conflicto y evaluado con un protocolo dual "saber-actuar": una pregunta de opción múltiple que mide la comprensión de la situación social y una respuesta abierta que se juzga según lo que diría el personaje.

El modelo forma parte del trabajo de investigación *Knows but Cannot Act: A Reasoning–Social Trade-off in Multilingual Role-Playing*, que estudia cómo el razonamiento y la capacidad de actuar en personaje se mueven en direcciones opuestas en modelos multilingües. Este checkpoint concreto emplea solo DPO (sin SFT previo) sobre la base Llama-3.1-8B-Instruct, lo que lo convierte en una pieza de comparación dentro de un conjunto de experimentos que incluye también variantes SFT y SFT+DPO sobre Llama-3.1-8B y Qwen3-8B.

Arquitectónicamente es un transformer decoder-only de 8.030.261.248 parámetros (8B densos, no MoE), con la ventana de contexto de 128.000 tokens heredada de Llama 3.1. Su relevancia actual es doble: por un lado, ofrece un modelo de role-playing multilingüe (inglés, chino, japonés, francés y español) listo para usar; por otro, sirve como evidencia empírica de que el DPO aislado mejora la actuación en personaje a costa de degradar la comprensión social medida por MCQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion estandar de llama.cpp/vLLM, pero no se documentan variantes publicadas) |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8B parámetros con atención causal estándar, RoPE y la arquitectura Llama 3.1. Sobre esta base se aplica exclusivamente DPO (sin fase de SFT), utilizando el dataset RoleVerse, un benchmark multilingüe de role-playing centrado en conflictos. El entrenamiento DPO alinea las respuestas del modelo con las preferencias de actuación en personaje registradas en el dataset, sin modificar la arquitectura subyacente.

La innovación técnica no reside en la arquitectura sino en el protocolo de evaluación y en el hallazgo empírico: el paper demuestra que el DPO aislado mejora la calidad de las respuestas en personaje (Resp Avg) mientras degrada la precisión en comprensión social (MCQ %). En el caso de Llama-3.1-8B-Instruct, la base obtiene 2,87 de Resp Avg y 29,36 % de MCQ, mientras que la variante + Only DPO sube a 3,42 de Resp Avg pero solo alcanza 32,39 % de MCQ; la variante SFT+DPO llega a 3,81 de Resp Avg pero cae a 17,05 % de MCQ. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni hiperparámetros de DPO.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat (roles user/assistant).
- Role-playing: el modelo habla como `role2`; las intervenciones de `role1` se tratan como turnos de usuario.
- Comprensión de situaciones sociales en contexto de conflicto (evaluada vía MCQ en el benchmark RoleVerse).
- Multilingüe: inglés, chino, japonés, francés y español.
- Razonamiento y generación de código y matemáticas: capacidades heredadas de Llama-3.1-8B-Instruct, no evaluadas específicamente en este checkpoint.
- Soporte de tool calling / function calling: heredado del modelo base Llama 3.1, no verificado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Modo thinking: no aplica (a diferencia de los checkpoints Qwen3-8B del mismo proyecto, que sí lo soportan con `enable_thinking`).
- Sin capacidades de visión ni audio.

## Casos de uso

- Role-playing en videojuegos y narrativa interactiva: el modelo puede encarnar a un personaje (`role2`) en diálogos con conflictos sociales, respondiendo de forma coherente con su personalidad gracias al ajuste DPO sobre RoleVerse.
- Simulación de entrenamiento en habilidades sociales: útil para generar respuestas de personajes en escenarios de conflicto y evaluar la comprensión social con el protocolo dual del benchmark.
- Asistentes conversacionales multilingües: cubre inglés, chino, japonés, francés y español, lo que permite desplegar un mismo modelo en productos con audiencias en esos cinco idiomas.
- Generación de diálogos para guiones y ficción: el ajuste en actuación en personaje mejora la naturalidad de las réplicas frente a la base, según los resultados de Resp Avg (3,42 frente a 2,87).
- Investigación en alineación y DPO: sirve como checkpoint de comparación para estudiar el trade-off entre razonamiento y actuación social, junto con las variantes SFT y SFT+DPO del mismo proyecto.
- Chatbot de atención al cliente con contexto largo: los 128.000 tokens de contexto de Llama 3.1 permiten gestionar conversaciones multi-turno extensas, aunque la especialización en role-playing no está optimizada para soporte técnico.
- Evaluación comparativa de modelos de role-playing: permite reproducir la tabla de resultados del paper con el mismo protocolo de evaluación (GPT-5 como juez, cinco dimensiones 1–5).

## Benchmarks y rendimiento

Resultados del paper en el conjunto de test de RoleVerse. Resp Avg: media de cinco dimensiones de respuesta (1–5, juez GPT-5). MCQ %: precisión en comprensión social.

| Grupo | Modelo | Resp Avg | MCQ % |
| :--- | ---: | ---: | ---: |
| Llama-3.1-8B-Instruct | base | 2,87 | 29,36 |
| | + Only SFT | 3,35 | 19,07 |
| | **+ Only DPO (este checkpoint)** | **3,42** | **32,39** |
| | + SFT & DPO | 3,81 | 17,05 |
| Qwen3-8B Non-thinking | base | 3,16 | 33,96 |
| | + Only DPO | 3,42 | 35,23 |
| Qwen3-8B Thinking | base | 3,38 | 40,85 |
| | + Only DPO | 3,60 | 43,12 |
| R1-Distill-Qwen3-8B | base | 2,47 | 50,06 |
| | + Only DPO | 3,07 | 49,62 |
| Qwen2.5-32B-Instruct | sin entrenar | 2,79 | 48,67 |
| Qwen3-30B-A3B-Instruct-2507 | sin entrenar | 3,69 | 41,73 |
| DeepSeek-R1-0528 | sin entrenar | 4,12 | 70,14 |
| gpt-oss-120b (high) | sin entrenar | 2,93 | 73,04 |
| GPT-5 (low; oracle, solo referencia) | sin entrenar | 4,35 | 81,88 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones estándar para un modelo denso de 8B, no documentadas en la model card).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con fp16 y en GPUs de 8-16 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resp Avg (RoleVerse) | MCQ % (RoleVerse) | Licencia | Disponibilidad |
| :--- | ---: | ---: | ---: | ---: | :--- | :--- |
| **Llama-3.1-8B-Instruct-RoleVerse-DPO** | 8B | 128k | 3,42 | 32,39 | Llama 3.1 Community | Hugging Face |
| Llama-3.1-8B-Instruct (base) | 8B | 128k | 2,87 | 29,36 | Llama 3.1 Community | Hugging Face |
| Qwen3-8B (Non-thinking) + Only DPO | 8B | no disponible | 3,42 | 35,23 | Apache-2.0 | Hugging Face |
| Qwen3-8B (Thinking) + Only DPO | 8B | no disponible | 3,60 | 43,12 | Apache-2.0 | Hugging Face |
| R1-Distill-Qwen3-8B + Only DPO | 8B | no disponible | 3,07 | 49,62 | MIT | Hugging Face |

## Limitaciones y advertencias

- Trade-off razonamiento-actuación: el DPO aislado mejora la actuación en personaje pero no la comprensión social; el checkpoint SFT+DPO del mismo proyecto alcanza mejor Resp Avg (3,81) a costa de un MCQ mucho peor (17,05 %).
- Riesgo de alucinación: inherente a los modelos de 8B y no mitigado específicamente en este ajuste; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la model card; hereda los sesgos de Llama-3.1-8B-Instruct y del dataset RoleVerse.
- Limitaciones de idioma: solo se declaran cinco idiomas (en, zh, ja, fr, es); el rendimiento fuera de ellos no está evaluado.
- Restricciones de licencia: Llama 3.1 Community License, con obligaciones de atribución ("Built with Llama") y restricciones de uso comercial que deben revisarse antes de producción.
- Especialización estrecha: el ajuste está orientado a role-playing; para tareas generales conviene usar el modelo base.
- Detalles de entrenamiento no documentados: no se especifican hiperparámetros de DPO, tamaño del dataset ni número de tokens, lo que dificulta la reproducibilidad.
- Paper en revisión: los resultados proceden de un manuscrito no publicado, por lo que deben tratarse como preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyrolls/Llama-3.1-8B-Instruct-RoleVerse-DPO
- Dataset RoleVerse: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Colección RoleVerse: https://huggingface.co/collections/tinyrolls/roleverse-6ae2cab39027be0451529147
- Código del proyecto: https://github.com/tinyrolls/RoleVerse
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
