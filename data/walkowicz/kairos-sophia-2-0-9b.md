# Walkowicz/kairos-sophia-2.0-9B

## Resumen

Kairos Sophia 2.0 9B es un modelo de generación de texto especializado en ingeniería de software empresarial y modernización de sistemas legacy, desarrollado por Walkowicz a partir del modelo base IFM/K2-Horizon-7B. Está orientado a entornos críticos de banca, gobierno e industria, con foco en la conversión de código COBOL a Java moderno, migraciones entre versiones de Java LTS y refactorización disciplinada. Su rasgo más distintivo es una ventana de contexto nativa de 512.000 tokens, que permite analizar repositorios monolíticos completos sin fragmentación.

El modelo incorpora un mecanismo propio denominado Bounded Counterfactual World Reasoning (B-CWR): una traza deliberativa acotada (150–280 tokens dentro de etiquetas `<think>`) que evalúa el radio de impacto de los cambios, la reversibilidad transaccional y el peor escenario operativo antes de modificar código. Según su model card, fue entrenado exclusivamente con transiciones de código legacy verificadas del mundo real, sin datos sintéticos.

Con 8.999.178.240 parámetros físicos (aproximadamente 9B), arquitectura transformer densa con GQA y vocabulario ampliado de 250.624 tokens, se distribuye en formato safetensors y GGUF bajo licencia Apache 2.0. Es relevante para equipos que necesitan ejecutar análisis y migración de código legacy de forma local y offline, incluso en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA (32 cabezas de atención, 8 cabezas KV), MLP SwiGLU, RoPE escalado |
| Parametros totales | 8.999.178.240 (~9,0B) |
| Parametros activos | no disponible (no se declara arquitectura MoE; el modelo es denso) |
| Longitud de contexto | 524.288 tokens (512K nativos, RoPE base escalado a 10.000.000) |
| Tipos de cuantizacion | BF16 (16 bit) y Q5_K_M (~5,8 BPW) en GGUF |
| Idiomas soportados | Ingles y portugues (PT-BR), 50%/50% segun el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se compone de un backbone transformer de 6,95B de parametros (36 capas, dimensión oculta 4096, MLP SwiGLU de 12288, 32 cabezas de atención con 8 KV mediante GQA) más 2,05B correspondientes al vocabulario empresarial de 250.624 tokens y su cabeza de salida no atada (`tie_word_embeddings: false`). La tokenización incluye fallback sin pérdida de bytes para lenguajes de mainframe y legacy. Aunque la nomenclatura del modelo base ("7B") hace referencia a su huella de cómputo y activaciones, el modelo físico completo ocupa unos 9B de parámetros en memoria.

El contexto nativo de 512K se consigue escalando la base de RoPE a 10.000.000, lo que según el autor evita la degradación por extrapolación posicional. El entrenamiento se basó en IFM/K2-Horizon-7B y, según la model card, utilizó transiciones reales verificadas de código legacy ("Zero Synthetic Slop"), rechazando datos sintéticos. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO. Como innovación destacable, el modelo incorpora el motor B-CWR, que genera trazas de razonamiento acotadas a 150–280 tokens evaluando riesgo y reversibilidad antes de emitir parches.

## Capacidades

- Generación de código y razonamiento sobre ingeniería de software, con especialización en modernización de sistemas legacy.
- Conversión de COBOL (IBM Enterprise COBOL, Micro Focus, Unisys, CICS, VSAM) a Java 17/21 con Spring Batch, Quarkus, Records y BigDecimal, preservando semántica de decimales empaquetados, copybooks, `REDEFINES` y `PERFORM UNTIL`.
- Migraciones escalonadas de Java 8/11 a Java 17/21/25 (javax a jakarta, virtual threads, pattern matching).
- Refactorización estructural que preserva el comportamiento, siguiendo la disciplina "Two Hats" de Martin Fowler, con principios KISS/YAGNI y diffs unificados mínimos.
- Invariantes de seguridad de aplicaciones (AppSec): OWASP Top 10:2025, CWE, LGPD/GDPR, seguridad de memoria y restricciones anti-inyección.
- Razonamiento contrafactual acotado (B-CWR): evaluación de radio de impacto, reversibilidad transaccional y peor caso operativo en trazas `<think>` de 150–280 tokens.
- Análisis de repositorios completos gracias a la ventana de contexto nativa de 512K, sin fragmentar el código en chunks.
- Generación de texto conversacional en ingles y portugues.
- No hay informacion sobre soporte de tool calling, function calling, capacidades de vision o audio.

## Casos de uso

- Modernización de core banking en COBOL: conversión de programas IBM Enterprise COBOL con datos `COMP-3` a Java 17/21 usando BigDecimal sin pérdida de precisión, manteniendo la semántica de las transacciones CICS como idempotencia distribuida.
- Migración de aplicaciones Java 8 a Java 21: planificación de la escalera LTS (8 → 17 → 21 → 25) con migración de `javax.*` a `jakarta.*` y adopción de virtual threads, paso a paso y con diffs mínimos.
- Auditoria de monolitos de gran tamaño: análisis de repositorios completos en una sola pasada gracias a los 512K de contexto, identificando puntos de riesgo antes de refactorizar.
- Refactorización segura en producción: separación estricta entre refactorizaciones estructurales que preservan comportamiento y cambios funcionales, reduciendo el riesgo de regresiones en sistemas críticos.
- Cumplimiento normativo en código: verificación de invariantes OWASP Top 10:2025, CWE y LGPD/GDPR durante la reescritura de sistemas que manejan datos personales o financieros.
- Evaluación de riesgo previa a despliegue: uso del motor B-CWR para simular el radio de impacto y el peor escenario operativo de un parche antes de aplicarlo.
- Entornos sin conexión a internet: inferencia completamente offline en GPU de consumo (RTX 3060/4060 de 12 GB) con la variante Q5_K_M, adecuado para sectores con restricciones de confidencialidad.
- Desarrollo en portugues empresarial: razonamiento bilingüe nativo ingles/portugues para equipos brasileños que documentan y migran sistemas legacy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay puntuaciones de MMLU, HumanEval, GSM8K ni comparativas estandarizadas en la model card).

Como dato de rendimiento operativo, el autor reporta las siguientes velocidades de inferencia local medidas con Ollama sobre una NVIDIA RTX 3060 de 12 GB:

| Variante | Velocidad |
|---|---|
| Q5_K_M (6,47 GB) | 45–65 tokens/segundo |
| BF16 (18,01 GB) | ~22 tokens/segundo |

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB con la variante Q5_K_M (6,47 GB en disco, ~5,8 BPW), dejando ~5,5 GB libres para KV cache; 24 GB o más con la variante BF16 (18,01 GB en disco).
- GPU recomendadas: NVIDIA RTX 3060 o RTX 4060 (12 GB) para Q5_K_M; RTX 3090 o RTX 4090 (24 GB) para BF16. Apple Silicon con memoria unificada también es viable para BF16 segun el autor.
- Cabe en GPU de consumo: sí, la variante Q5_K_M funciona íntegramente en VRAM de 12 GB; la variante BF16 no cabe en 12 GB y desborda a RAM del sistema.
- Opciones de despliegue: Ollama (formato de distribución principal segun los tags), llama.cpp y backends compatibles con GGUF; el formato safetensors permite su uso en backends estandar de Hugging Face. No se menciona soporte verificado de vLLM o TGI.
- Latencia y throughput: 45–65 tokens/segundo con Q5_K_M y ~22 tokens/segundo con BF16 en RTX 3060 de 12 GB, segun mediciones del autor no verificadas de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Foco |
|---|---|---|---|---|
| Kairos Sophia 2.0 9B | 9,0B (denso) | 512K | Apache 2.0 | Modernizacion legacy (COBOL, Java), razonamiento contrafactual |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 128K | Apache 2.0 | Codigo general, multiples lenguajes |
| CodeLlama 7B | 7B | 16K | Llama 2 Community License | Completado y generacion de codigo |
| DeepSeek-Coder-V2-Lite (MoE) | 16B (2,4B activos) | 128K | Licencia propia DeepSeek | Codigo y matematicas |

Kairos Sophia 2.0 destaca frente a estas alternativas por su ventana de contexto de 512K (frente a 128K o menos) y su especialización vertical en legacy empresarial, aunque carece de benchmarks públicos comparativos y su comunidad es muy pequeña (242 descargas, 0 likes en el momento de la ficha).

## Limitaciones y advertencias

- Soporte linguistico limitado: el modelo está entrenado para ingles y portugues (PT-BR); no hay soporte declarado para castellano ni otros idiomas.
- Proyecto de autor independiente con traccion muy baja (242 descargas, 0 likes), sin auditorias ni verificaciones independientes de las afirmaciones de la model card; las velocidades y capacidades declaradas provienen solo del autor.
- No hay benchmarks estandarizados publicados, por lo que su calidad frente a modelos consolidados no puede contrastarse objetivamente.
- Riesgo de alucinacion no cuantificado: aunque el autor afirma entrenar solo con datos reales verificados, no existen evaluaciones de tasa de alucinación. En migraciones de sistemas criticos, todo parche generado debe revisarse y probarse exhaustivamente.
- El mecanismo B-CWR y las invariantes AppSec son afirmaciones del autor sin documentacion tecnica independiente que las respalde.
- No hay informacion sobre sesgos conocidos, soporte de tool calling ni comportamiento agentic multi-paso.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero el modelo base (IFM/K2-Horizon-7B) es poco conocido y su procedencia de datos no es auditable publicamente.
- La ventana de 512K consume KV cache considerable: aun con ~5,5 GB libres en una GPU de 12 GB, contextos muy largos pueden agotar la memoria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Walkowicz/kairos-sophia-2.0-9B
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Paper, repositorio de codigo o demo: no disponible
