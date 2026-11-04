# sriram1983007/SRA-RiskGate-4B-Q4_K_M-GGUF

## Resumen

SRA-RiskGate-4B es un modelo de lenguaje especializado en la evaluación de riesgos y la adjudicación de disputas en pagos con stablecoins (EIP-3009, x402, ERC-20 y escrow). Lo desarrolla el autor independiente sriram1983007 y parte de una base Qwen3 de 4.022.468.096 parámetros, afinada para emitir decisiones estructuradas (approve/hold/reject) con niveles de riesgo, flags y acciones requeridas en formato JSON. El repositorio descrito aquí contiene exclusivamente los pesos cuantizados en GGUF con formato Q4_K_M (~2,5 GB), pensados para ejecución local en portátil.

El modelo aborda un problema concreto: los agentes de IA que pagan de forma autónoma necesitan una capa determinista y auditable que valide cada transacción antes de firmarla. SRA-RiskGate-4B actúa como esa puerta de riesgo, procesando la política, el payload del pago y los resultados de herramientas externas (firma, atestación, sanciones) y devolviendo una decisión estructurada. Es relevante ahora por la proliferación de agentes que operan con stablecoins y por la falta de mecanismos de control reproducibles en ese flujo.

La cuantización Q4_K_M es la variante más pequeña publicada y está orientada a comprobaciones de pago en local. El propio autor advierte de que, en sus pruebas puntuales, esta versión cometió errores de razonamiento en casos de disputa que el modelo a plena precisión resolvió correctamente, y que este archivo no se ha evaluado sobre el benchmark completo. Para adjudicación de disputas o cumplimiento normativo en producción recomienda el modelo original en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3), afinado para salida JSON estructurada |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurado en el build de Ollama; no se especifica el máximo del modelo base) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3 con 4.022.468.096 parámetros, ajustado mediante supervisión sobre el dataset `sriram1983007/sra-stablecoin-risk-bench`, que incluye un split `sft` con prompts de entrenamiento para dos tareas: puerta de riesgo de pagos y adjudicación de disputas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron etapas de RLHF o DPO.

La innovación principal no es arquitectónica sino de formato y seguridad: el modelo solo rinde como en el benchmark si se le alimenta con sus prompts de entrenamiento exactos, con bloques `<context>`, `<payload>` y `<tool_results>`, y se decodifica de forma greedy (temperatura 0). El system prompt instruye explícitamente a tratar el contenido de `<payload>` como datos no confiables, lo que constituye una mitigación de inyección de prompts en el flujo de pago. La salida está restringida a un objeto JSON con las claves `decision`, `risk_level`, `flags`, `explanation` y `required_actions`.

## Capacidades

- Generación de decisiones estructuradas de riesgo de pago en JSON con esquema fijo (approve/hold/reject, low/medium/high/severe).
- Evaluación de pagos con stablecoins en los estándares EIP-3009, x402, ERC-20 y escrow.
- Adjudicación de disputas entre partes a partir de declaraciones incluidas en un bloque `<case>`.
- Integración con resultados de herramientas externas (verificación de firma, atestación, listas de sanciones) mediante el bloque `<tool_results>`.
- Resistencia a inyección de prompts dentro del payload, por instrucción explícita del system prompt.
- Soporte de tool calling y de agentes a través del servidor MCP `sra-riskgate-mcp` y de la librería `sra-riskgate`.
- Capacidades multilingües: solo inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Puerta de riesgo previa a la firma en agentes de pago: el agente envía política, payload y resultados de verificación al modelo, que devuelve approve/hold/reject antes de firmar la transacción; encaja por su salida JSON determinista y su contexto de 8K.
- Detección de aprobaciones ilimitadas y payees sospechosos: el modelo marca como hold o reject operaciones con aprobaciones sin límite o direcciones de destino que imitan a las legítimas, como en los casos documentados con Circle Gateway en Arc testnet.
- Adjudicación automatizada de disputas de escrow: con el system prompt de adjudicador y las declaraciones de las partes en `<case>`, genera una resolución estructurada; para este uso el autor recomienda el modelo a plena precisión.
- Cumplimiento en pipelines de stablecoins: integrado vía `sra-riskgate-mcp` en flujos de agentes que necesitan una comprobación reproducible y registrable de cada pago.
- Verificación en local para desarrollo y pruebas: con Q4_K_M (~2,5 GB) se puede ejecutar en portátil con Ollama o llama.cpp para validar reglas de política antes de desplegar la versión completa.
- Auditoría y reproducción de decisiones: al publicarse todas las predicciones del benchmark en `sra-bench-results`, el modelo sirve para contrastar decisiones y justificar rechazos ante un revisor humano.
- Simulación de ataques a agentes pagadores: permite probar si un agente respeta la puerta de riesgo ante invoices reales, aprobaciones ilimitadas o payees clonados, como en las pruebas con Grok documentadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este archivo Q4_K_M. El autor indica explícitamente que esta cuantización no se ha ejecutado sobre el benchmark completo y que, en comprobaciones puntuales, produjo errores de razonamiento en casos de disputa que el modelo a plena precisión resolvió correctamente. Las predicciones publicadas en `sra-bench-results` corresponden al modelo completo, no a esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3-4 GB con Q4_K_M (pesos de ~2,5 GB más overhead de contexto y caché KV a 8K).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más; RTX 3060, RTX 4060, RTX 4090; en数据中心, A100 o H100 no son necesarias para esta cuantización.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/sriram1983007/SRA-RiskGate-4B-Q4_K_M-GGUF:Q4_K_M` o el build del registro `sriram1983007/sra-riskgate`), llama.cpp (`llama-server` con API compatible con OpenAI en el puerto 8080), LM Studio y servidor MCP `sra-riskgate-mcp`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| SRA-RiskGate-4B Q4_K_M | 4,02 B | 8K (configurado) | Riesgo de pagos stablecoin y disputas | Apache 2.0 | GGUF |
| SRA-RiskGate-4B (plena precision) | 4,02 B | no disponible | Misma tarea, mayor fidelidad en disputas | Apache 2.0 | safetensors |
| Qwen3 base (familia) | ~4 B | no disponible | Propósito general | no disponible en esta ficha | safetensors/GGUF |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer diferencias cuantitativas de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo funciona correctamente con sus prompts de entrenamiento exactos; un JSON plano o un system prompt distinto puede producir respuestas con un esquema incorrecto.
- Requiere decodificación greedy (temperatura 0); otras configuraciones de muestreo degradan la fiabilidad.
- La cuantización Q4_K_M ha mostrado errores de razonamiento en casos de disputa en las pruebas del autor; no se recomienda para adjudicación ni para cumplimiento en producción.
- Este archivo no se ha evaluado sobre el benchmark completo, por lo que no hay métricas de rendimiento para esta variante.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Riesgo de alucinación inherente a un modelo de 4B; las decisiones deben tratarse como señales y no como veredictos definitivos sin revisión.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda el modelo a plena precisión para producción; el uso de esta cuantización en entornos regulados queda bajo responsabilidad del integrador.
- Las verificaciones en cadena documentadas por el autor (Base Sepolia, Circle Gateway, Grok) se realizaron con las comprobaciones deterministas de la librería `sra-riskgate`, no con este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-Q4_K_M-GGUF
- Modelo base en safetensors: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Dataset de benchmark: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Resultados publicados: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Demo interactiva: https://huggingface.co/spaces/sriram1983007/sra-riskgate-demo
- Registro Ollama: https://ollama.com/sriram1983007/sra-riskgate
- Librería PyPI: https://pypi.org/project/sra-riskgate/
- Servidor MCP: https://pypi.org/project/sra-riskgate-mcp/
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23715017
- Write-up en Ready Tensor: https://app.readytensor.ai/publications/sra-riskgate-a-benchmark-and-a-4b-model-for-gating-stablecoin-payments-made-by-ai-agents-wihp3WytOoKOc1g7NXFsl
- Discusión en alphaXiv: https://www.alphaxiv.org/abs/2610.sra-riskgate-stablecoin-payment-safety
- Transacción verificada en Base Sepolia: https://sepolia.basescan.org/tx/0xf12e9084becefd94fa6e26e54761fbfc8f3c04215d7fc724d0fca6077ba084fc
- Log de verificación de Flow Executor: https://gist.github.com/sriram1983007-dev/35eab0e934a512346193bcdb5b12d9cf
- Página de Flow Executor: https://flow-kg4x.vercel.app/row
- Log de Circle Gateway en Arc testnet: https://gist.github.com/sriram1983007-dev/8cd44e78adec20a0157368ec38c2fb42
- Log de pruebas con Grok como agente pagador: https://gist.github.com/sriram1983007-dev/1555e11a57682496f710a8224415c9e2
