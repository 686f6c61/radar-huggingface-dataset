# sriram1983007/SRA-RiskGate-4B

## Resumen

SRA-RiskGate-4B es un modelo de lenguaje de 4.022 millones de parámetros, desarrollado por el usuario sriram1983007, especializado en la evaluación de riesgo de pagos con stablecoins efectuados por agentes de IA. Se trata de un fine-tuning del modelo Qwen/Qwen3-4B-Instruct-2507 orientado a una tarea muy concreta: actuar como "puerta de seguridad" (risk gate) que decide si una transacción propuesta por un agente debe aprobarse, bloquearse o derivarse, además de resolver disputas y reembolsos asociados a ese tipo de operaciones.

El modelo aborda un problema emergente en el ecosistema de pagos agénticos: los agentes autónomos que operan con protocolos como x402, EIP-3009 y EIP-712 pueden ejecutar pagos sin supervisión humana, lo que introduce riesgos de fraude, lavado de dinero, sanciones (OFAC) y ataques de inyección de prompt. SRA-RiskGate-4B se presenta como una comprobación de seguridad local, ejecutable en un portátil, que se interpone antes de cada pago.

Es relevante por su enfoque verticalizado y su empaquetado: incluye SDK en Python (sra-riskgate), servidor MCP (sra-riskgate-mcp), adaptador LoRA, versiones GGUF para Ollama y una demo interactiva. La licencia es Apache 2.0 y el modelo solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M y Q8_0 (publicados); otros no disponibles |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; GGUF; adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros, y se afina mediante fine-tuning supervisado con TRL sobre un conjunto de datos propio orientado a riesgos de pagos con stablecoins (sriram1983007/sra-stablecoin-risk-bench). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

El entrenamiento está claramente especializado en dominios concretos: evaluación de riesgo de pagos, adjudicación de disputas, detección de fraude, cumplimiento OFAC y resistencia a inyección de prompt en el contexto de pagos agénticos. La model card menciona el uso de TRL para el afinado y publica un adaptador LoRA separado, lo que sugiere que el ajuste se realizó con técnicas de bajo rango antes de fusionar o distribuir los pesos completos. No se documentan innovaciones arquitectónicas propias más allá del fine-tuning.

## Capacidades

- Generación de texto y razonamiento especializado en riesgo financiero de pagos con stablecoins.
- Clasificación de decisiones de risk gate: aprobar, bloquear o derivar una transacción.
- Adjudicación de disputas y determinación de reembolsos (refunds) con criterios de remedio viable.
- Detección de fraude y evaluación de cumplimiento normativo (incluida referencia a listas OFAC).
- Resistencia a ataques de inyección de prompt en el contexto de pagos agénticos.
- Soporte de tool calling / function calling heredado del modelo base Qwen3.
- Integración con agentes mediante servidor MCP (sra-riskgate-mcp) y SDK en Python.
- Capacidades multilingües limitadas: solo inglés declarado.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Puerta de seguridad previa a pagos agénticos: el modelo se invoca antes de que un agente ejecute una transferencia USDC vía x402 o EIP-3009, y devuelve una decisión de aprobación o bloqueo basada en el contexto de la operación, reduciendo aprobaciones inseguras según los datos del autor (0,35 %).
- Cumplimiento y screening OFAC: integrado en un pipeline de pagos, evalúa si el destinatario o la operación presenta señales de riesgo sancionador antes de autorizar la transacción.
- Gestión de disputas y reembolsos: dado un conflicto entre pagador y receptor, el modelo propone un resultado y un remedio viable, con una tasa declarada de remedios imposibles del 0,57 %.
- Protección frente a inyección de prompt en agentes: actúa como capa de validación que inspecciona instrucciones maliciosas embebidas en el flujo de pago y bloquea aquellas que intentan manipular al agente.
- Integración en asistentes vía MCP: un agente compatible con Model Context Protocol puede invocar el servidor sra-riskgate-mcp como herramienta de verificación antes de ejecutar cualquier operación financiera.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse en un portátil mediante Ollama o llama.cpp con cuantización Q4_K_M, permite verificar pagos sin enviar datos sensibles a la nube.
- Automatización de back-office financiero: clasificación y enrutado de operaciones sospechosas hacia revisión humana, usando el modelo como primer filtro en pipelines de CI/CD o sistemas de tesorería.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split de test de SRA Stablecoin Risk Bench:

| Tarea | Métrica | Valor |
|---|---|---|
| Risk gating de pagos | SRA composite score | 0,9604 |
| Risk gating de pagos | Risk-gate decision accuracy | 0,9957 |
| Risk gating de pagos | Unsafe approval rate (menor es mejor) | 0,0035 |
| Risk gating de pagos | Over-blocking rate (menor es mejor) | 0,0000 |
| Risk gating de pagos | Injected payments approved (menor es mejor) | 0,0290 |
| Adjudicación de disputas | Dispute score | 0,9254 |
| Adjudicación de disputas | Dispute outcome accuracy | 0,9018 |
| Adjudicación de disputas | Impossible remedy rate (menor es mejor) | 0,0057 |
| Adjudicación de disputas | Wrongful refund rate (menor es mejor) | 0,0220 |

La model card indica además un resultado de 227 de 227 en pagos reales sobre la red Base, aunque no se aportan más detalles metodológicos en la información disponible. No se han publicado comparaciones con modelos de referencia en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en precisión FP16/BF16; unos 2,5-3 GB con cuantización GGUF Q4_K_M; unos 4,5-5 GB con Q8_0.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para despliegues de mayor throughput; cualquier GPU con 8 GB o más para FP16.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más usando cuantización; el autor lo describe como ejecutable en un portátil.
- Opciones de despliegue: transformers, llama.cpp, Ollama (imagen oficial sriram1983007/sra-riskgate), text-generation-inference, endpoints compatibles y servidor MCP propio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRA-RiskGate-4B | 4,02 B | no disponible | Riesgo de pagos con stablecoins | Apache 2.0 | HF, GGUF, Ollama, PyPI, MCP |
| Qwen3-4B-Instruct-2507 (base) | 4 B | no disponible | Propósito general, tool calling | Apache 2.0 | HF |
| Alternativas específicas de risk gate para pagos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en la misma tarea de evaluación de riesgo de pagos agénticos.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como no verificados; conviene reproducirlos antes de confiar en ellos en producción.
- Modelo monolingüe en inglés: no apto para interacciones en castellano sin traducción previa.
- Especialización estrecha: no es un modelo de propósito general; su uso fuera del dominio de pagos con stablecoins puede degradar su fiabilidad.
- Riesgo de alucinación en la adjudicación de disputas: aunque la tasa declarada de remedios imposibles es baja (0,57 %), sigue existiendo.
- Sesgos potenciales derivados de los datos de entrenamiento, no documentados en la información disponible.
- Longitud de contexto no especificada: no se puede garantizar el manejo de conversaciones o expedientes largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la responsabilidad legal y regulatoria del uso en pagos reales recae en el integrador.
- No sustituye controles humanos ni auditorías de cumplimiento; debe usarse como capa adicional, no como única barrera.
- El modelo base Qwen3 puede heredar limitaciones y sesgos no corregidos por el fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Dataset de benchmark: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Resultados publicados: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Demo interactiva: https://huggingface.co/spaces/sriram1983007/sra-riskgate-demo
- Versión GGUF: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-GGUF
- Adaptador LoRA: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-LoRA
- Ollama: https://ollama.com/sriram1983007/sra-riskgate
- SDK Python (PyPI): https://pypi.org/project/sra-riskgate/
- Servidor MCP (PyPI): https://pypi.org/project/sra-riskgate-mcp/
- Paper (Zenodo): https://doi.org/10.5281/zenodo.23715017
- DOI del modelo: https://doi.org/10.57967/hf/11215
- Cuaderno Colab: https://colab.research.google.com/drive/1R9seZu-En9QUZCklxFeIqxEuSaISg7x6
- Cuaderno Kaggle: https://www.kaggle.com/code/sriram1983007/try-sra-riskgate-4b-payment-safety-model
- Ficha en mcprush: https://mcprush.com/sriram1983007-dev/sra-riskgate-mcp
- Ficha en Glama: https://glama.ai/mcp/servers/sriram1983007-dev/sra-riskgate-mcp
