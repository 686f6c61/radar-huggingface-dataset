# VexelQuant/vx-alphadesk-test

## Resumen

VexelQuant/vx-alphadesk-test es un modelo de lenguaje afinado por VexelQuant Research a partir de Qwen/Qwen2.5-1.5B-Instruct, orientado a la generación de salidas estructuradas en el dominio del trading cuantitativo y la ejecución de órdenes en mercados perpetuos. El modelo se presenta como un "motor de ejecución cuantitativa institucional" que combina un ajuste fino con QLoRA de 4 bits y una fase de alineamiento mediante GRPO dinámico, junto con una gramática GBNF que restringe la decodificación a un esquema Pydantic concreto (par de trading, lado LONG/SHORT/FLAT, apalancamiento y tamaño en USDC).

La propuesta de valor del modelo no reside en su capacidad generalista, sino en garantizar una conformidad del 100 % con el esquema de salida en el momento de la generación, evitando post-procesado y validaciones posteriores. El autor reporta una tasa de coincidencia de esquema del 100 % sobre una verificación auditada de 50 filas, con latencias p50 de 1985,15 ms y p99 de 2207,4 ms en ese mismo conjunto de prueba.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors y GGUF, y está pensado para desplegarse mediante llama.cpp con soporte de gramáticas GBNF. Su tamaño de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) lo sitúa en la categoría de modelos pequeños (SLM), lo que facilita su ejecución en hardware modesto y su integración en pipelines automatizados de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), afinado sobre Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (QLoRA durante el ajuste); pesos GGUF disponibles; otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de aproximadamente 1,5 mil millones de parámetros. Sobre esta base, VexelQuant aplica un ajuste supervisado (SFT) con QLoRA de 4 bits, seguido de una fase de alineamiento denominada "dynamic GRPO schema alignment", orientada a reforzar el cumplimiento del esquema de salida estructurada. La decodificación se restringe mediante una gramática GBNF (`schema.gbnf`) que fuerza al modelo a emitir únicamente tokens compatibles con el esquema Pydantic definido por el autor.

El esquema objetivo (`ClientStructuredOutput`) define cuatro campos estrictos: `pair` (cadena), `side` (literal LONG, SHORT o FLAT), `leverage` (entero), `size_usdc` (flotante), con `extra="forbid"` y `strict=True`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni la procedencia de los datos utilizados en el SFT o en el GRPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en el dominio del trading cuantitativo y la ejecución de órdenes.
- Salida estructurada garantizada mediante gramática GBNF, con conformidad del 100 % reportada sobre el esquema Pydantic definido.
- Emisión de decisiones de trading con campos tipados: par, lado (LONG/SHORT/FLAT), apalancamiento y tamaño en USDC.
- Integración con llama.cpp para decodificación restringida por gramática.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Ejecución automatizada de órdenes en mercados perpetuos: el modelo genera objetos estructurados con par, lado, apalancamiento y tamaño en USDC que pueden enviarse directamente a un motor de ejecución, eliminando la necesidad de parseo y validación posterior gracias a la gramática GBNF.
- Integración en bots de arbitraje en CLOB (por ejemplo, Polymarket): VexelQuant declara que sus SLM están diseñados para sustituir APIs externas de LLM con latencias de ~900 ms o superiores dentro de pipelines de trading automatizados.
- Sustitución de APIs externas de LLM en pipelines de trading: al ser un modelo de 1,5 mil millones de parámetros desplegable en local, reduce la dependencia de servicios externos y el coste por inferencia.
- Capa de decisión en pipelines multi-agente de gestión de fondos: puede actuar como componente "Trader" en arquitecturas por capas (analista, research, trader, risk gate, reporter) que emiten órdenes estructuradas verificables.
- Validación de esquemas en producción: útil como componente de generación con conformidad estricta en sistemas donde una salida mal formada provoca fallos en cascada.
- Despliegue en nodos locales con Docker Compose: el autor proporciona un paquete `vx-alphadesk-test-local-node-dropin.zip` con `docker compose up -d` para levantar un nodo de inferencia local.
- Prototipado de agentes on-chain: al ser un modelo pequeño y con licencia Apache 2.0, permite experimentar con agentes autónomos que emiten decisiones estructuradas sin costes de API.

## Benchmarks y rendimiento

El autor reporta una verificación auditada de 50 filas con los siguientes resultados:

| Metrica | Valor |
|---|---|
| Filas evaluadas | 50 / 50 |
| Tasa de coincidencia de esquema | 100,0 % |
| Latencia p50 | 1985,15 ms |
| Latencia p99 | 2207,4 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card menciona un SLA de latencia inferior a 20 ms, pero los valores medidos en la verificación auditada (p50 de 1985,15 ms) no son coherentes con esa cifra; no se dispone de información que permita reconciliar ambos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo de ~1,5 mil millones de parámetros, las estimaciones habituales serían aproximadamente 3 GB en FP16, ~1,5-2 GB en cuantización de 8 bits y ~1 GB en cuantización de 4 bits, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, un modelo de 1,5 mil millones de parámetros en cuantización de 4 u 8 bits cabría previsiblemente en GPUs de consumo con 4-8 GB de VRAM, pero no hay confirmación del autor.
- Opciones de despliegue: llama.cpp (soporte de gramáticas GBNF), Docker Compose mediante el paquete `vx-alphadesk-test-local-node-dropin.zip`. Compatibilidad con vLLM, Ollama o TGI no documentada.
- Latencia y throughput: p50 de 1985,15 ms y p99 de 2207,4 ms sobre 50 filas según la verificación del autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VexelQuant/vx-alphadesk-test | ~1,54 B | No disponible | Apache 2.0 | safetensors, GGUF | Afinado para salida estructurada en trading con GBNF |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 B | No disponible en esta ficha | Apache 2.0 | safetensors | Modelo base; capacidades generalistas de instrucción |
| Alternativas de 1-2 B para salida estructurada | No disponible | No disponible | No disponible | No disponible | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre este modelo y sus alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en un único esquema de salida (par, lado, apalancamiento, tamaño en USDC); fuera de ese esquema su utilidad es limitada.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, lo que impide evaluar sesgos de dominio o de mercado.
- Riesgo de alucinación en los valores generados: aunque la estructura esté garantizada por la gramática, la corrección semántica de las decisiones (por ejemplo, un apalancamiento inadecuado) no está validada por el esquema.
- La model card incluye un aviso de copyright ("All rights reserved") pese a declarar licencia Apache 2.0; conviene verificar los términos reales antes de un uso comercial.
- La latencia reportada en la verificación (p50 de 1985,15 ms) contradice el SLA de "<20ms" mencionado en la model card; no hay datos que aclaren esta discrepancia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación (2026-11-07) es posterior a la fecha habitual de referencia; se trata de un artefacto con muy poca validación externa.
- No se documentan capacidades multilingües, de tool calling ni de razonamiento multi-paso.
- Uso en producción financiera: las decisiones del modelo no constituyen asesoramiento financiero y deben someterse a controles de riesgo independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VexelQuant/vx-alphadesk-test
- Perfil del autor en Hugging Face: https://huggingface.co/VexelQuant
- Sitio del autor: https://vexelquant.me
- Proyecto alpha·desk en GitHub: https://github.com/smvenkats/alphadesk
