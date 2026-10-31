# therickcain/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

Qwen3.8-27B RVN Heretic Abliterated Uncensored (GGUF) es una variante "abliterada" del modelo Qwen3.8-27B de Qwen, publicada por el usuario therickcain en Hugging Face. El modelo parte del trabajo de abliteración ARA de trohrbaugh (`Qwen3.8-27B-heretic-ara`) y le aplica dos pasadas adicionales de ARA (Arbitrary-Rank Ablation) a peso completo, con el objetivo de eliminar los rechazos residuales a prompts considerados dañinos. El resultado, denominado RVN, reduce las tasas de rechazo de 3/100 a 0–1/100 manteniendo un daño conductual muy bajo (KL ≈ 0,0085 frente a 0,0535 del modelo fuente).

La relevancia de esta ficha radica en la técnica empleada: en lugar de la abliteración direccional clásica (restar una única "dirección de rechazo" en el espacio de activaciones), ARA formula la abliteración como un problema de optimización matricial con LBFGS, preservando el comportamiento en prompts benignos mientras desvía las salidas de los prompts dañinos. Además, el modelo base Qwen3.8-27B utiliza una arquitectura híbrida Gated DeltaNet (16 capas de atención estándar y 48 de atención lineal DeltaNet), lo que permite una ventana de contexto de 262.144 tokens con una huella de memoria reducida respecto a un transformer denso equivalente.

El repositorio distribuye el modelo en formato GGUF para llama.cpp, con cuantizaciones basadas en imatrix, y una variante `*-mtp.gguf` que incorpora la cabeza de borrador MTP oficial de Qwen3.8 para decodificación especulativa. El autor advierte explícitamente de que el modelo tiene los mecanismos de seguridad reducidos a propósito, está dirigido a público adulto (18+) y debe usarse conforme a la legislación local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (familia Qwen3.8), híbrido Gated DeltaNet |
| Parametros totales | 26.895.998.464 (27B) |
| Parametros activos | no disponible (no consta que sea MoE; la familia Qwen3.5 incluye manejo MoE/DeltaNet híbrido en heretic, pero el dato no está desglosado) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF con imatrix (variantes legacy y familia `*-multilingual`; cuantizaciones concretas no detalladas en la información disponible) |
| Idiomas soportados | no disponible (existen artefactos `*-multilingual`, pero no se lista la lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base existe en safetensors. Los ficheros base excluyen MTP/NextN; los `*-mtp.gguf` incluyen la cabeza de borrador MTP |

Otros datos técnicos del modelo base:

| Parametro | Valor |
|---|---|
| Hidden size | 5120 |
| Capas | 64 (16 atención estándar + 48 Gated DeltaNet) |
| Cabezas de atención | 24 (GQA, 4 KV heads, head_dim 256) |
| Vocabulario | 248.320 tokens |

## Arquitectura y entrenamiento

El modelo base, Qwen/Qwen3.8-27B, emplea una arquitectura híbrida `qwen3_5_text` que combina 16 capas de atención estándar (con GQA: 24 cabezas de consulta y 4 de clave-valor, head_dim 256) con 48 capas de atención lineal Gated DeltaNet. Esta combinación de atención estándar y atención lineal (SSM-like) permite escalar la ventana de contexto hasta 262K tokens con un coste de memoria y cómputo inferior al de un transformer denso puro. El vocabulario es de 248.320 tokens.

Sobre este modelo base no se han publicado en la información disponible detalles sobre el número de tokens de preentrenamiento, composición del dataset ni procesos de RLHF/DPO: no disponible. Lo que sí está documentado es el proceso de abliteración: el modelo fuente `trohrbaugh/Qwen3.8-27B-heretic-ara` aplicó una pasada ARA (KL 0,0535, 3 rechazos/100) y RVN añadió dos pasadas ARA más a peso completo con el conjunto de parámetros start 26, end 56, preserve 0,9432, steer 0,0009, overcorrect 0,5038 y neighbor 10, reduciendo los rechazos a 0–1/100 con KL 0,0085.

La técnica ARA, implementada en la herramienta open source [heretic](https://github.com/p-e-w/heretic), recopila activaciones de módulos objetivo (out-proyección de atención y down-proyección del MLP) en prompts "buenos" y "malos", y optimiza la matriz de pesos con LBFGS para tres objetivos simultáneos: preservar las salidas en prompts benignos (KL baja), dirigir las salidas de prompts dañinos hacia la variedad de salidas benignas (vía distancias k-NN) y sobrecorregir alejándolas de las salidas originales dañinas. Al optimizar la matriz completa en lugar de restar una sola dirección, ARA es de "rango arbitrario" y puede eliminar subespacios de rechazo más complejos. Destaca también la contribución de trohrbaugh al código de heretic: la preservación de la norma de fila y el manejo de capas híbridas MoE/DeltaNet de Qwen3.5, sin las cuales la abliteración de capas DeltaNet no funcionaría.

Los ficheros `*-mtp.gguf` incorporan la cabeza de borrador MTP (Multi-Token Prediction) oficial de Qwen3.8, habilitando decodificación especulativa nativa en llama.cpp para acelerar la inferencia.

## Capacidades

- Generacion de texto conversacional: pipeline `text-generation`, orientado a escritura creativa y roleplay sin censura.
- Razonamiento con thinking mode: los artefactos multilingües embedden la plantilla de chat oficial de Qwen3.8 y pasaron una validación de control de thinking, por lo que soporta el modo de razonamiento del modelo base.
- Tool calling: la familia `*-multilingual*.gguf` pasó una validación por fichero de tool calling compatible con la API de OpenAI (formato OpenAI-compatible).
- Contexto largo: hasta 262K tokens gracias a las capas Gated DeltaNet, adecuado para documentos extensos y conversaciones multi-turno largas.
- Decodificacion especulativa: los ficheros `*-mtp.gguf` incluyen la cabeza de borrador MTP para acelerar la generación.
- Capacidades multilingues: existen artefactos `*-multilingual`, aunque la lista concreta de idiomas no está disponible.
- Sin guardrails de rechazo: el modelo responde a categorías de prompts que el modelo base rechazaría (uso 18+).

## Casos de uso

- Escritura creativa y narrativa sin restricciones: autores que necesitan generar ficción para adultos o contenido que los modelos con guardrails rechazan; la abliteración elimina los rechazos manteniendo la calidad del texto base (KL 0,0085 implica daño conductual mínimo).
- Roleplay conversacional de larga duración: con 262K tokens de contexto y la plantilla de chat oficial embebida, puede sostener sesiones de roleplay multi-turno muy extensas sin perder coherencia de personajes ni hechos previos.
- Investigacion en alineacion y seguridad: el pipeline ARA con métricas publicadas (KL, tasa de rechazos por 100 prompts) es material de estudio para investigadores que evalúan técnicas de eliminación de refusal circuits y su impacto conductual.
- Procesamiento de documentos extensos: la ventana de 262K tokens permite resumir, analizar o responder preguntas sobre libros, expedientes o bases de código completas en una sola pasada, con menor coste de memoria que un transformer denso gracias a las capas DeltaNet.
- Agentes locales con tool calling: los ficheros multilingües validados para tool calling OpenAI-compatible pueden integrarse en frameworks de agentes (LangChain, LlamaIndex, etc.) ejecutándose localmente con llama.cpp, útil para automatizaciones donde la privacidad exige inferencia on-premise.
- Despliegue local privado en hardware de consumo/servidor: el formato GGUF con cuantizaciones imatrix permite ejecutar un modelo de 27B en estaciones de trabajo con GPUs de consumo, adecuado para entornos sin acceso a nube o con requisitos de confidencialidad.
- Generacion acelerada con especulacion: en servidores con llama.cpp, los ficheros `*-mtp.gguf` permiten decodificación especulativa con la cabeza MTP oficial, aumentando el throughput de tokens/segundo en servicios con muchos usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son del proceso de abliteración:

| Metrica | Modelo fuente (heretic-ara) | RVN |
|---|---|---|
| KL (daño conductual) | 0,0535 | 0,0085 |
| Rechazos en prompts dañinos | 3/100 | 0–1/100 |

Estas cifras miden el impacto de la abliteración, no la capacidad del modelo en tareas estándar; para eso, remítase a los benchmarks de Qwen3.8-27B, no disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra exacta. Como referencia, un modelo de 27B en GGUF ocupa aproximadamente 16–17 GB en Q4_K_M y 30 GB o más en Q8_0; con las capas DeltaNet y contexto de 262K, la memoria de KV-cache añadida dependerá de la implementación en llama.cpp.
- GPU recomendadas: no disponible oficialmente. Para la horquilla de 16–30 GB de pesos, opciones realistas incluyen RTX 3090/4090 (24 GB, cuantizaciones Q4), RTX 5090 (32 GB) y A100/H100 40–80 GB para cuantizaciones altas o contexto completo.
- Consumer GPUs: con cuantizaciones de 4 bits, cabe en una RTX 3090 o RTX 4090 de 24 GB; con offload parcial a CPU vía llama.cpp, también en GPUs de 12–16 GB con penalización de velocidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y derivados como Ollama, LM Studio o servidores OpenAI-compatible de llama.cpp. No consta soporte verificado en vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles. Los ficheros `*-mtp.gguf` con decodificación especulativa MTP están orientados a mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen3.8-27B RVN Heretic (este) | 27B | 262K | Apache-2.0 | Abliterado ARA triple, GGUF, MTP especulativo |
| Qwen/Qwen3.8-27B (base) | 27B | 262K | Apache-2.0 | Modelo original con guardrails completos |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27B | 262K | no disponible | Abliteración ARA de una pasada (KL 0,0535, 3/100 rechazos) |

No hay datos de rendimiento comparativo publicados entre estos tres modelos más allá de las métricas de abliteración (KL y tasa de rechazos). Comparativas con otros modelos abliterados de 27B de otras familias: no disponible.

## Limitaciones y advertencias

- Contenido sin censura por diseño: los guardrails están reducidos deliberadamente. El modelo puede generar contenido dañino, ofensivo o ilegal según la jurisdicción. El autor lo declara para mayores de 18 años y exige uso responsable conforme a la ley local.
- Riesgo de alucinacion: heredado del modelo base; no se publican evaluaciones de alucinación para esta variante. La abliteración no mejora la veracidad.
- Daño conductual residual: aunque KL 0,0085 es muy bajo, toda abliteración puede degradar sutilmente capacidades de razonamiento o instrucción; conviene validar en el caso de uso concreto antes de producción.
- Idiomas: la lista de idiomas soportados no está disponible; los artefactos multilingües existen pero sin detalle documentado.
- Licencia: Apache-2.0 permite uso comercial, pero la eliminación de guardrails puede entrar en conflicto con políticas de plataformas de despliegue y con normativas de IA (por ejemplo, el AI Act europeo para usos de riesgo).
- Compatibilidad de plantillas: los ficheros legacy (incluido el antiguo `Q4_K_M` conservado por continuidad de descargas) corresponden a una abliteración anterior e inferior; se recomienda usar las variantes RVN y multilingües recientes, que ya incorporan la plantilla de chat oficial reparada.
- Herramienta de terceros: el modelo depende de modificaciones de pesos no oficiales de Qwen; Alibaba/Qwen no lo respalda.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/therickacain/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF (nota: URL original https://huggingface.co/therickcain/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de abliteración (ARA): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta heretic (ARA): https://github.com/p-e-w/heretic
