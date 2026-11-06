# sriram1983007/SRA-RiskGate-4B-LoRA

## Resumen

SRA-RiskGate-4B es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario sriram1983007. Su propósito es actuar como una pasarela de riesgo ("risk gate") para pagos con stablecoins ejecutados por agentes de IA: recibe la política de pago, el payload de la transacción y los resultados de herramientas, y emite una decisión estructurada en JSON con los valores approve, hold o reject, junto con un nivel de riesgo, banderas de alerta y acciones requeridas. Además, adjudica disputas de pago en la frontera de finalidad de liquidación (settlement-finality boundary).

El modelo aborda un problema concreto: los agentes autónomos que pagan con stablecoins (por ejemplo, mediante los estándares x402 o EIP-3009) pueden ser manipulados por instrucciones maliciosas incrustadas en los datos de la transacción. El adaptador se entrena para tratar todo el contenido de `<payload>` como datos no confiables y no seguir instrucciones embebidas, lo que lo convierte en una capa de control previa a la firma de la transacción.

Con 4B parámetros en el modelo base, licencia Apache 2.0 y un formato de prompt de entrenamiento muy específico, es un modelo de nicho orientado a producción en el dominio de pagos, compliance y detección de fraude, no un modelo de propósito general. El repositorio del adaptador ocupa 0,3 GB y se distribuye también como modelo fusionado y en formato GGUF Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 4B (modelo base); el adaptador LoRA es un subconjunto adicional no cuantificado en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M publicado como repositorio aparte; el adaptador se distribuye en safetensors (bf16 para el base en los ejemplos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); GGUF Q4_K_M en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se entrena con TRL sobre el modelo base Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros. La técnica es LoRA (PEFT), de modo que los pesos del base permanecen congelados y solo se ajustan las matrices de bajo rango del adaptador. El dataset de entrenamiento es sra-stablecoin-risk-bench, un benchmark de riesgo de stablecoins publicado por el mismo autor, con un split `sft` que contiene los prompts de sistema y plantillas exactas usadas en el entrenamiento.

El entrenamiento se centra en una tarea de clasificación y generación estructurada: el modelo debe producir exclusivamente un objeto JSON con las claves decision, risk_level, flags, explanation y required_actions. El prompt de sistema instruye explícitamente a tratar el contenido de `<payload>` como datos no confiables y a no seguir instrucciones encontradas en él, lo que constituye una defensa contra inyección de prompts en el flujo de pago. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Las ejecuciones de verificación publicadas en la model card (Base Sepolia, Circle Gateway en Arc testnet, Grok como agente pagador) se realizaron con las comprobaciones deterministas de la librería `sra-riskgate`, no con este modelo.

## Capacidades

- Generación de decisiones estructuradas en JSON para pagos con stablecoins: approve, hold o reject, con nivel de riesgo (low, medium, high, severe), banderas, explicación y acciones requeridas.
- Evaluación de riesgo de pagos a partir de política, payload y resultados de herramientas (`<context>`, `<payload>`, `<tool_results>`).
- Adjudicación de disputas de pago en la frontera de finalidad de liquidación, con un prompt de sistema y plantilla distintos.
- Resistencia a inyección de prompts: el formato de entrenamiento marca el payload como no confiable.
- Soporte de tool calling implícito mediante el bloque `<tool_results>` del prompt.
- Capacidades multilingües: solo inglés declarado.
- No se documentan en la información disponible capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Pasarela de aprobación previa a la firma en agentes de pago: el modelo recibe la política, el payload de la transacción y los resultados de las herramientas, y emite approve, hold o reject antes de que el agente firme. Es adecuado porque su entrenamiento está alineado exactamente con ese formato y con la distinción entre datos confiables y no confiables.
- Detección de aprobaciones ilimitadas: el modelo puede marcar como hold las aprobaciones de token sin límite, un patrón de ataque documentado en las verificaciones del autor con Circle Gateway.
- Detección de beneficiarios sospechosos (look-alike payees): el modelo puede rechazar pagos dirigidos a direcciones que imitan a un beneficiario legítimo, usando el contexto de política y payload.
- Gestión de disputas de pago: adjudicación de reclamaciones en la frontera de finalidad de liquidación, con un prompt específico, útil para plataformas de settlement que necesitan una decisión reproducible y explicable.
- Compliance y auditoría: la salida JSON con flags y explanation facilita registrar la justificación de cada decisión en un pipeline de cumplimiento normativo.
- Integración con agentes vía MCP: el modelo puede exponerse como herramienta de verificación de riesgo dentro de un servidor MCP que un agente consulte antes de emitir un pago.
- Prototipado y evaluación de políticas de pago: al publicarse el benchmark sra-stablecoin-risk-bench y todas las predicciones, sirve para comparar reglas deterministas frente a un modelo entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un dataset de resultados (sra-bench-results) con todas las predicciones publicadas, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16: aproximadamente 8-9 GB para 4B parámetros, más overhead de activaciones y del adaptador.
- VRAM estimada con cuantización GGUF Q4_K_M: del orden de 3-4 GB, según el tamaño típico de un modelo de 4B en esa cuantización.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090 o RTX 3090 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB usando la cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp y LM Studio con el GGUF Q4_K_M, Ollama mediante `ollama run sriram1983007/sra-riskgate`, y PEFT/Transformers para cargar el adaptador. No se documenta compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRA-RiskGate-4B (LoRA) | 4B (base) | No disponible | Risk gate de pagos con stablecoins | Apache 2.0 | Hugging Face, GGUF, Ollama |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | No disponible | Propósito general, instrucciones | Apache 2.0 | Hugging Face |
| SRA-RiskGate-4B (fusionado) | 4B | No disponible | Risk gate de pagos con stablecoins | Apache 2.0 | Hugging Face |

La comparativa con alternativas de la misma categoría (modelos especializados en riesgo de pagos) no está disponible en la información proporcionada. El único comparable directo documentado es el propio modelo base y la versión fusionada del mismo adaptador.

## Limitaciones y advertencias

- El modelo solo rinde como en el benchmark con su formato de prompt de entrenamiento exacto: el prompt de sistema de risk gate y un mensaje de usuario que empieza por `Evaluate this stablecoin payment.` seguido de los bloques `<context>`, `<payload>` y `<tool_results>`. Las disputas usan otro prompt y plantilla, que deben copiarse del split `sft` del dataset.
- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está validado.
- Dominio muy estrecho: no es un modelo de propósito general y no debe usarse para tareas ajenas a la evaluación de riesgo de pagos.
- Riesgo de alucinación en la salida JSON: al ser un modelo generativo, puede producir claves o valores fuera del esquema; se recomienda validación estricta del JSON en producción.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Las verificaciones en cadena publicadas por el autor (Base Sepolia, Circle Gateway, Grok) usan las comprobaciones deterministas de la librería `sra-riskgate`, no este modelo; no deben interpretarse como evidencia del rendimiento del adaptador.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre el cumplimiento normativo en jurisdicciones concretas.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con payloads o resultados de herramientas muy extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-LoRA
- Modelo fusionado: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- GGUF Q4_K_M: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-Q4_K_M-GGUF
- Dataset de benchmark: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Resultados publicados: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Demo interactiva: https://huggingface.co/spaces/sriram1983007/sra-riskgate-demo
- Repositorio GitHub: https://github.com/sriram1983007-dev/sra-riskgate
- Registro Ollama: https://ollama.com/sriram1983007/sra-riskgate
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23715017
- Write-up en Ready Tensor: https://app.readytensor.ai/publications/sra-riskgate-a-benchmark-and-a-4b-model-for-gating-stablecoin-payments-made-by-ai-agents-wihp3WytOoKOc1g7NXFsl
- Discusión en alphaXiv: https://www.alphaxiv.org/abs/2610.sra-riskgate-stablecoin-payment-safety
- Notebook de Kaggle: https://www.kaggle.com/code/sriram1983007/try-sra-riskgate-4b-payment-safety-model
