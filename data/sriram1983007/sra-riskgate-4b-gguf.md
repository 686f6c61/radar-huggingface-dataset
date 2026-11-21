# sriram1983007/SRA-RiskGate-4B-GGUF

## Resumen

SRA-RiskGate-4B es un modelo de lenguaje de 4.022.468.096 parámetros (aproximadamente 4B) desarrollado por el usuario sriram1983007, especializado en una tarea muy concreta: evaluar un pago en stablecoin propuesto por un agente de IA antes de que se firme y responder con un veredicto de `approve`, `hold` o `reject`. No es un modelo de propósito general, sino un "risk gate" o puerta de seguridad diseñado para insertarse en el flujo de un agente autónomo que opera con pagos (x402, USDC, MCP) y frenar operaciones potencialmente peligrosas, como aprobaciones ilimitadas o pagadores desconocidos.

El modelo base es `sriram1983007/SRA-RiskGate-4B`, y esta ficha corresponde a sus builds cuantizados en formato GGUF (v2, de noviembre de 2026), pensados para su uso con llama.cpp, Ollama y LM Studio. La versión v2 corrige los pesos fusionados y mejora la precisión en disputas (90,2% frente a 77,8% en v1) y reduce las aprobaciones inseguras (0,35% frente a 0,47% en v1). El repositorio ocupa 28,4 GB e incluye varias cuantizaciones (Q8_0, Q6_K, Q5_K_M y Q4_K_M).

La relevancia del modelo reside en su enfoque vertical: en lugar de competir en capacidades generales, se posiciona como un componente de seguridad determinista y auditable para agentes que mueven dinero. El autor publica el benchmark asociado (`sra-stablecoin-risk-bench`), los resultados por predicción y verificaciones en cadena (Base Sepolia, Arc testnet, Robinhood Chain) con agentes reales, lo que aporta trazabilidad poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 4B; detalles de arquitectura no publicados en la información disponible) |
| Parametros totales | 4.022.468.096 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (contexto de 8K configurado en los ejemplos de Ollama y llama.cpp) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (`en` según la model card; la información de Hugging Face indica "no disponibles") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo base (tipo de transformer, número de capas, atención, etc.). Se sabe que es un modelo de 4.022.468.096 parámetros y que se distribuye cuantizado en GGUF para inferencia local. El entrenamiento se orienta a una tarea de clasificación/veredicto estructurado sobre pagos en stablecoin: el prompt de entrenamiento incluye un system prompt específico de "payment risk-gate", seguido de la instrucción `Evaluate this stablecoin payment.` y bloques `<context>`, `<payload>` y `<tool_results>`, con decodificación greedy (temperatura 0).

El autor menciona un dataset propio, `sriram1983007/sra-stablecoin-risk-bench`, con 2.000 casos de test reservados, y publica todas las predicciones en `sriram1983007/sra-bench-results`. No se indica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación destacable no es arquitectónica sino de integración: el modelo se acompaña de una librería (`sra-riskgate`) con comprobaciones deterministas (por ejemplo, `check_dispute_verdict` y `verify_settlement`) que corrigen debilidades del modelo en aritmética de fechas y verificación en cadena.

## Capacidades

- Evaluación de pagos en stablecoin: recibe contexto, payload y resultados de herramientas, y emite un veredicto `approve`, `hold` o `reject`.
- Detección de patrones de riesgo: aprobaciones ilimitadas, pagadores desconocidos, payees "look-alike" (direcciones similares) y pagos sin atestación del pagador.
- Veredictos de disputas: evalúa si una disputa se presentó dentro de la ventana de la política y si procede un reembolso, con ayuda de la herramienta `check_dispute_verdict`.
- Integración con agentes: diseñado para insertarse en flujos de agentes que usan x402, USDC y MCP.
- Soporte de tool calling: el prompt incluye un bloque `<tool_results>` para incorporar resultados de herramientas externas.
- Multilingüe: no disponible; la model card declara únicamente inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Puerta de seguridad para agentes de pago: antes de firmar una transacción x402 o USDC, el agente envía el contexto y el payload al modelo, que devuelve `approve`, `hold` o `reject`; cualquier respuesta que no sea un veredicto válido se trata como `hold`. Adecuado por su formato de salida cerrado y su entrenamiento específico.
- Protección frente a aprobaciones ilimitadas: el modelo detecta allowances sin límite y las retiene (`hold`), como se documenta en la prueba con Circle Gateway en Arc testnet.
- Detección de payees sospechosos: identifica direcciones "look-alike" y las rechaza (`reject`), evitando pagos a destinatarios que imitan a uno legítimo.
- Verificación de reembolsos por disputas: con Q8_0 o el modelo completo, más la herramienta `check_dispute_verdict`, evalúa si procede un reembolso y reduce las denegaciones indebidas al 0,85%.
- Auditoría de liquidaciones: combinado con `verify_settlement`, comprueba en cadena que una liquidación movió exactamente el importe y al destinatario esperados (caso del préstamo de 25,075 USDG en Robinhood Chain).
- Despliegue en local para equipos financieros: con Q4_K_M (2,5 GB) puede ejecutarse en un portátil para comprobaciones de pagos, sin enviar datos sensibles a la nube.
- Integración en pipelines de agentes multi-paso: actúa como paso de control entre la propuesta de pago del agente y la firma, con temperatura 0 para reproducibilidad.

## Benchmarks y rendimiento

Los datos publicados corresponden a los builds v1 (medidos el 11-11-2026 con Ollama en una T4) sobre los 2.000 casos de test reservados, con decodificación greedy y el `score.py` del benchmark. Los builds v2 solo se comprobaron en 12 casos (12/12 correctos en Q8_0 y Q4_K_M), sin medición completa del benchmark.

| Métrica | Full precision | Q8_0 (4,3 GB) | Q4_K_M (2,5 GB) |
|---|---|---|---|
| Precisión de decisión de pago (↑) | 99,5% | 99,5% | 99,3% |
| Aprobaciones inseguras (↓) | 0,47% | 0,47% | 0,83% |
| Pagos legítimos bloqueados (↓) | 0% | 0% | 0% |
| Precisión de resultado en disputas (↑) | 77,8% | 78,6% | 67,4% |
| Denegaciones indebidas (↓) | 26,0% | 23,4% | 55,3% |
| Denegaciones indebidas con `check_dispute_verdict` (↓) | 0,85% | 0,85% | 0,85% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB para Q4_K_M, 2,9 GB para Q5_K_M, 3,3 GB para Q6_K y 4,3 GB para Q8_0, más el overhead de contexto (8K tokens).
- GPU recomendadas: los benchmarks se midieron en una NVIDIA T4; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM usando Q4_K_M o Q5_K_M; incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run sriram1983007/sra-riskgate`), LM Studio; el modelo base también puede servirse con transformers.
- Latencia y throughput: no disponible; solo se indica que los benchmarks se ejecutaron con Ollama en una T4.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (gates de seguridad para pagos de agentes). Como referencia de tamaño, podría compararse con otros modelos de 4B de propósito general, pero no se dispone de datos de rendimiento de esos modelos en esta tarea ni de sus especificaciones en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés según la model card; el resto de idiomas no está soportado oficialmente.
- Contexto limitado a 8K tokens, suficiente para payloads de pago pero no para conversaciones o documentos largos.
- Q4_K_M es más débil en disputas: tiende a afirmar que una disputa se presentó fuera de la ventana de la política cuando no es así, convirtiendo reembolsos debidos en desestimaciones; el autor recomienda usar Q8_0 o el modelo completo para disputas y ejecutar siempre `check_dispute_verdict`.
- Los builds v2 no se han evaluado en el benchmark completo; las cifras de la tabla corresponden a v1. El modelo del registro de Ollama sigue siendo v1 hasta su actualización.
- Riesgo de alucinación en veredictos: cualquier respuesta que no sea un veredicto válido debe tratarse como `hold`, según el autor.
- No es un modelo de propósito general: no debe usarse para generación de texto abierta, código o razonamiento general.
- Las verificaciones en cadena citadas usaron las comprobaciones deterministas de la librería `sra-riskgate`, no el modelo; no deben interpretarse como validación del modelo en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para entornos financieros reales; se recomienda auditoría propia antes de producción.
- Sesgos conocidos: no disponible.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/sriram1983007/SRA-RiskGate-4B-GGUF
- Modelo base: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Dataset del benchmark: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Resultados por predicción: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23715017
- Write-up en Ready Tensor: https://app.readytensor.ai/publications/sra-riskgate-a-benchmark-and-a-4b-model-for-gating-stablecoin-payments-made-by-ai-agents-wihp3WytOoKOc1g7NXFsl
- Discusión en alphaXiv: https://www.alphaxiv.org/abs/2610.sra-riskgate-stablecoin-payment-safety
- Transacción verificada en Base Sepolia: https://sepolia.basescan.org/tx/0xf12e9084becefd94fa6e26e54761fbfc8f3c04215d7fc724d0fca6077ba084fc
- Log de Flow Executor: https://gist.github.com/sriram1983007-dev/35eab0e934a512346193bcdb5b12d9cf
- Página de Flow Executor: https://flow-kg4x.vercel.app/row
- Log de Circle Gateway en Arc testnet: https://gist.github.com/sriram1983007-dev/8cd44e78adec20a0157368ec38c2fb42
- Logs de Grok como agente pagador: https://gist.github.com/sriram1983007-dev/1555e11a57682496f710a8224415c9e2
- Transacción en Robinhood Chain: https://robinhoodchain.blockscout.com/tx/0xe85c07f5d50f14f9ba33ba372193982a0fea47791c1e431732a1d424eb2fb481
- Verificación de liquidación: https://gist.github.com/sriram1983007-dev/1d915320d85c7ed12a6044e42b382a40
- Confirmación pública del agente: https://x.com/Agent_Minimum/status/2118130199283794342
