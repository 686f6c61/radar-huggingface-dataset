# tinyopsec/SRA-RiskGate-4B-GGUF

## Resumen

SRA-RiskGate-4B-GGUF es una colección de cuantizaciones en formato GGUF del modelo SRA-RiskGate-4B, un fine-tuning de Qwen3-4B-Instruct-2507 (de Qwen) especializado en evaluación de riesgo para pagos con stablecoins (risk gating). El modelo original fue entrenado por sriram1983007 y las cuantizaciones GGUF han sido producidas y publicadas por el usuario tinyopsec mediante llama.cpp.

El problema que aborda es la clasificación y el filtrado de riesgo en transacciones de pagos basados en stablecoins, un dominio donde se necesitan decisiones rápidas, automatizadas y ejecutables en hardware modesto. Al partir de un modelo base pequeño (unos 4.000 millones de parámetros) y distribuirse en GGUF, puede desplegarse incluso en GPUs de consumo o en CPU, lo que resulta relevante para integrarlo en pipelines de cumplimiento y pagos de bajo coste.

Su relevancia actual viene de la creciente actividad regulatoria y operativa en torno a los pagos con stablecoins, que demanda herramientas de screening automatizadas. La licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales. El modelo es conversacional y de generación de texto, con arquitectura transformer densa basada en Qwen3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.468.096 (~4.02 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens, pero no consta en la model card del fine-tuning) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder denso de la familia Qwen3 con unos 4.000 millones de parámetros, orientado a instrucciones. Sobre esa base se ha realizado un fine-tuning (según la model card) para la tarea de risk gating en pagos con stablecoins. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni sobre el uso de técnicas como RLHF o DPO.

Las cuantizaciones disponibles en este repositorio han sido generadas con llama.cpp y cubren un rango amplio, desde F16 (precisión completa, ~8 GB) hasta Q2_K (2 bits), con Q4_K_M marcada como recomendada por el autor. No se han documentado innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational)
- Evaluación y gating de riesgo en pagos con stablecoins (dominio del fine-tuning)
- Hereda las capacidades generales de instrucción del modelo base Qwen3-4B-Instruct-2507 (razonamiento, redacción, etc.), aunque el fine-tuning puede haberlas desplazado hacia el dominio de pagos
- Compatibilidad con cualquier runtime GGUF: llama.cpp, Ollama, LM Studio, koboldcpp
- No se ha documentado soporte de tool calling, function calling, agentes, visión o audio en la información disponible

## Casos de uso

- Screening de transacciones con stablecoins: el modelo puede actuar como compuerta de riesgo (risk gate) que clasifica operaciones antes de su ejecución, marcando las que requieren revisión manual.
- Automatización de cumplimiento (compliance) en fintech: integrable en pipelines de pagos para prefiltrar operaciones de bajo riesgo y reducir carga humana, gracias a su tamaño contenido y baja latencia.
- Despliegue on-premise por requisitos regulatorios: al ejecutarse en GGUF sobre CPU o GPU de consumo, permite procesar datos de pagos sensibles sin enviarlos a APIs externas.
- Prototipado de políticas de riesgo: equipos de riesgo pueden ajustar prompts para probar reglas de gating sin reentrenar modelos de mayor tamaño.
- Asistente de análisis de operaciones: generación de explicaciones en lenguaje natural sobre por qué una transacción se marca como riesgosa, útil para auditoría.
- Evaluación y benchmarking de modelos financieros ligeros: sirve como punto de partida para comparar fine-tunings de 4B en dominios de pagos, dado el amplio rango de cuantizaciones disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del modelo base ~4 B parámetros):
  - F16: ~8 GB
  - Q8_0: ~4,5 GB
  - Q6_K: ~3,5 GB
  - Q5_K_M: ~3 GB
  - Q4_K_M (recomendada): ~2,5 GB
  - Q3_K_M: ~2 GB
  - Q2_K: ~1,5 GB
- GPUs recomendadas: cualquier GPU moderna con 4-8 GB de VRAM es suficiente para cuantizaciones medias; para F16, una GPU con 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070 o superior).
- Cabe en GPUs de consumo: sí, incluso en cuantizaciones de 2-4 bits puede ejecutarse en GPUs de gama baja o directamente en CPU, dado el tamaño de 4 B.
- Opciones de despliegue: llama.cpp (llama-cli, documentado en la model card), Ollama, LM Studio, koboldcpp, o cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Dominio |
|---|---|---|---|---|
| SRA-RiskGate-4B-GGUF | ~4,02 B | GGUF (F16 a Q2_K) | Apache 2.0 | Risk gating de pagos con stablecoins |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 B | Safetensors | Apache 2.0 | Uso general, instrucciones |
| FinGPT / modelos financieros fine-tuned ligeros | variable (1-7 B) | variable | variable | Finanzas general, no específico de stablecoins |

Nota: no hay datos de rendimiento comparativos publicados para este modelo, por lo que la comparativa se limita a parámetros, formato, licencia y dominio.

## Limitaciones y advertencias

- La propia model card incluye un disclaimer explícito: se trata de un modelo de risk gating para pagos y debe evaluarse antes de usarlo en producción de pagos reales.
- No se han publicado métricas de precisión, recall ni falsos positivos/negativos, algo crítico en un sistema de gating financiero donde un falso negativo implica pérdida económica y un falso positivo bloquea operaciones legítimas.
- No se documenta el dataset de entrenamiento, lo que impide auditar sesgos (geográficos, de contraparte, de moneda) en las decisiones de riesgo.
- Riesgo de alucinación heredado del modelo base: como LLM generativo, puede producir justificaciones plausibles pero incorrectas; no debe usarse como único criterio de decisión en pagos.
- Idiomas soportados no disponibles; el modelo base Qwen3 es multilingüe, pero el fine-tuning podría estar sesgado hacia el inglés.
- Longitud de contexto no confirmada para este fine-tuning; verificar antes de procesar transacciones con contexto largo.
- La licencia Apache 2.0 no impone restricciones comerciales, pero el uso en pagos está sujeto a regulación financiera (AML, KYC, PSD2, etc.) que el modelo no sustituye.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/SRA-RiskGate-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo original fine-tuned (referenciado en la model card): https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Paper, blog o demo: no disponible
