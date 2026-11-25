# tncyypttvk/Prom-1.5B

## Resumen

Prom-1.5B es un ajuste fino mediante QLoRA del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario tncyypttvk en el contexto de un bootcamp. Está diseñado como asistente bilingüe (turco e inglés) de asuntos estudiantiles para la ficticia Prometheus University, combinando recuperación aumentada (RAG) sobre una guía institucional, consulta de información de asignaturas vía herramienta CSV y cálculo de medias ponderadas por ECTS mediante una herramienta dedicada. El modelo resuelve el problema de dotar a un LLM pequeño de comportamiento consistente en tareas de identidad, agente con llamadas a herramientas y RAG en dos idiomas.

Arquitectónicamente hereda la estructura transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales (dato real de safetensors) y una ventana de contexto base de 32.768 tokens según la familia Qwen2.5, aunque el entrenamiento se realizó con un máximo de 2048 tokens. La relevancia actual reside en que demuestra un flujo completo de especialización de un modelo pequeño con recursos limitados (entrenamiento en T4, publicación en CPU/GGUF), útil como referencia para quienes abordan RAG y tool calling con modelos de menos de 2B parámetros.

El modelo se publica bajo licencia Apache-2.0, con 316 descargas y sin likes en el momento de la consulta, y su repositorio ocupa 9,3 GB. La model card incluye métricas de evaluación antes/después del ajuste y una tabla de prueba con correcciones de aplicación, con una puntuación media de 0,77 según un juez Gemini.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenamiento con máximo de 2048 tokens |
| Tipos de cuantizacion | no disponible en la información proporcionada (existe repositorio GGUF) |
| Idiomas soportados | turco (tr) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar y plantilla de chat predefinida. El ajuste se realizó con QLoRA: r=16, alpha=32, aplicado a todas las capas lineales, durante 3 épocas, con tasa de aprendizaje 2e-4 y longitud máxima de secuencia de 2048 tokens. El conjunto de entrenamiento es un dataset sintético de 648 conversaciones generadas con Gemini, etiquetado como `tncyypttvk/prom-1.5b-veri`, que cubre tres ejes: identidad del asistente, RAG sobre guía institucional y comportamiento de agente con llamadas a herramientas.

No se documenta el uso de RLHF ni DPO, ni el número total de tokens de entrenamiento más allá de las 648 conversaciones y 3 épocas. La innovación técnica destacable no es arquitectónica sino de integración: el modelo aprende a invocar una herramienta CSV para información de asignaturas y una herramienta de cálculo de medias ponderadas por ECTS, además de responder con abstención explícita cuando la información no está en la guía. La model card indica que las correcciones de aplicación (búsqueda multi-asignatura y adaptación de parámetros) son parte del ajuste de comportamiento, no del preentrenamiento.

## Capacidades

- Generación de texto conversacional bilingüe turco-inglés con plantilla de chat de Qwen2.5.
- RAG sobre una guía institucional: responde preguntas sobre normativa académica y se abstiene cuando el dato no está en la guía.
- Tool calling / function calling: invocación de una herramienta CSV para información de asignaturas y de una herramienta de cálculo de medias ponderadas por ECTS.
- Comportamiento de agente con salida JSON estructurada para llamadas a herramientas.
- Identidad de asistente consistente (nombre y marcador de identidad) en ambos idiomas.
- Cálculo aritmético de medias ponderadas por ECTS con advertencia de que el resultado no es un GNO oficial.
- Manejo de conversaciones multi-turno dentro del contexto de entrenamiento (2048 tokens).
- No se documentan capacidades de visión, audio, thinking mode ni decodificación especulativa.

## Casos de uso

- Asistente de asuntos estudiantiles: el modelo gestiona consultas sobre normativa académica (plazos de matrícula, requisitos de graduación, becas) recuperando información de una guía institucional y absteniéndose cuando el dato no existe, lo que reduce alucinaciones en atención al alumno.
- Consulta de información de asignaturas: mediante tool calling a un CSV, responde horarios, aulas y ECTS de asignaturas concretas, integrándose en un backend de gestión académica.
- Cálculo de medias ponderadas: invoca una herramienta dedicada para calcular la media ECTS a partir de calificaciones y créditos, con aviso explícito de que no sustituye al expediente oficial.
- Chatbot bilingüe de campus: al soportar turco e inglés, cubre estudiantes nacionales e internacionales con una sola instancia desplegada en CPU o GPU modesta.
- Prototipo de agente con salida JSON: sirve como referencia para pipelines de agentes que requieren formato estructurado de llamadas a herramientas en modelos de menos de 2B parámetros.
- Base para fine-tuning adicional: al ser un ajuste QLoRA sobre Qwen2.5-1.5B-Instruct con licencia Apache-2.0, puede reutilizarse como punto de partida para dominios institucionales similares con presupuesto de entrenamiento reducido.
- Evaluación de RAG en modelos pequeños: útil en investigación para medir tasas de abstención y fidelidad a la guía en modelos de 1,5B parámetros.

## Benchmarks y rendimiento

La model card publica métricas propias antes/después del ajuste sobre un conjunto de test, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación.

| Metrica | Base | Prom |
|---|---|---|
| tr_kimlik_ad | 0,00 | 0,50 |
| tr_kimlik_isaret | 0,00 | 1,00 |
| tr_ajan_json | 0,50 | 0,67 |
| tr_ajan_arac | 0,00 | 0,67 |
| tr_rag_hakem | 0,50 | 0,47 |
| tr_rag_isaret | 0,00 | 1,00 |
| tr_sure_sn | 122,00 | 159,00 |
| en_kimlik_ad | 0,00 | 0,40 |
| en_kimlik_isaret | 0,00 | 1,00 |
| en_ajan_json | 0,40 | 0,60 |
| en_ajan_arac | 0,00 | 0,60 |
| en_rag_hakem | 0,60 | 1,00 |
| en_rag_isaret | 0,00 | 1,00 |
| en_sure_sn | 117,00 | 131,00 |

Además, la model card reporta una prueba de aplicación con juez Gemini (escala 1 / 0,5 / 0) con media 0,77, y una ejecución previa registrada de 23/30 = 0,7667 (TR 0,7333, EN 0,80). No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 3,1 GB solo para pesos (1,54B parámetros); en 8 bits, en torno a 1,6 GB; en 4 bits, alrededor de 0,8-1 GB, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: T4 (usada para el entrenamiento), RTX 3060/4060, RTX 4090, A100 y H100; el modelo cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y Ollama mediante el repositorio GGUF publicado, además de vLLM y TGI para servir en GPU.
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo reporta tiempos de evaluación (tr_sure_sn 159 s y en_sure_sn 131 s para el conjunto de test, no por petición).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Prom-1.5B | 1,54B | 32.768 (base); entrenado a 2048 | Apache-2.0 | safetensors + GGUF | Especializado en asuntos estudiantiles tr/en con RAG y tool calling |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache-2.0 | safetensors + GGUF | Modelo base; mejor generalización, sin especialización institucional |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache-2.0 | safetensors + GGUF | Mayor capacidad general, requiere más VRAM |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License | safetensors + GGUF | Alternativa pequeña multilingüe con licencia restrictiva para algunos usos |

Los datos de rendimiento comparativo en benchmarks estándar no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su comportamiento fuera del dominio de asuntos estudiantiles de Prometheus University no está evaluado y puede degradarse respecto al modelo base.
- Riesgo de alucinación en consultas fuera de la guía: aunque aprende a abstenerse, la métrica tr_rag_hakem empeora ligeramente (0,50 a 0,47) tras el ajuste, lo que indica que la fidelidad al contexto no es perfecta.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse con datos sintéticos generados por Gemini, puede heredar sesgos de ese generador.
- Limitaciones de idioma: solo turco e inglés; no se garantiza calidad en otras lenguas.
- Limitación de contexto práctico: aunque el modelo base soporta 32.768 tokens, el entrenamiento se hizo con máximo de 2048, por lo que el rendimiento más allá de esa longitud no está validado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el contenido institucional es ficticio; no debe usarse como fuente normativa real.
- Caveat de producción: las métricas publicadas son sobre conjuntos de test propios y un juez automático (Gemini), no sobre benchmarks independientes; la media de 0,77 en la prueba de aplicación incluye respuestas parcialmente correctas.
- El repositorio ocupa 9,3 GB, lo que sugiere que puede contener múltiples formatos o checkpoints además de los pesos safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tncyypttvk/Prom-1.5B
- Adaptador LoRA: https://huggingface.co/tncyypttvk/Prom-1.5B-LoRA
- GGUF: https://huggingface.co/tncyypttvk/Prom-1.5B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/tncyypttvk/prom-1.5b-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
