# sriram1983007/SRA-RiskGate-4B-LoRA

## Resumen

SRA-RiskGate-4B es un adaptador LoRA de tipo PEFT publicado por el usuario sriram1983007 sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo de propósito general, sino un modelo especializado en la evaluacion de riesgo de pagos con stablecoins ejecutados por agentes de IA: clasifica cada propuesta de pago en una de tres decisiones (approve, hold o reject) y resuelve disputas de pago en la frontera de finalidad de liquidacion. El repositorio contiene la version v2 del adaptador, publicada el 12 de noviembre de 2026, con pesos en formato safetensors y licencia Apache 2.0.

El modelo aborda un problema concreto: los agentes autonomos que firman pagos con stablecoins (USDC, USDT, USDB, USDG y otros tokens denominados en USD) pueden aprobar operaciones fraudulentas, aprobaciones ilimitadas o destinatarios sospechosos. SRA-RiskGate actua como una puerta de riesgo previa a la firma, con soporte para los estandares x402 y EIP-3009, y se integra con el protocolo MCP. La model card reporta mejoras sustanciales en la v2: puntuacion SRA de 0,913 a 0,960, precision en disputas del 77,8 % al 90,2 % y denegaciones erroneas del 26,0 % al 2,1 % sobre 2.000 casos de test reservados.

El modelo esta entrenado exclusivamente en ingles y su tamano efectivo es el del base Qwen3-4B-Instruct-2507 (4.000 millones de parametros), al que se suma el adaptador LoRA. El repositorio ocupa 0,5 GB y acumula 267 descargas y 1 like en el momento de la consulta. Su relevancia actual radica en que proporciona una capa de seguridad verificable y reproducible para pagos autonomos, con resultados publicados y comprobaciones en cadena sobre Base Sepolia, Arc testnet y Robinhood Chain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA PEFT |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B-Instruct-2507; el adaptador LoRA anade un numero no especificado de parametros entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (build publicado aparte); el adaptador se distribuye en safetensors |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); GGUF Q4_K_M en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. La tecnica de adaptacion es LoRA mediante la libreria PEFT, con entrenamiento gestionado por TRL. El repositorio incluye la etiqueta `base_model_relation: adapter`, lo que confirma que se distribuye como adaptador y no como pesos fusionados, aunque la model card indica que tambien se han publicado pesos fusionados y builds GGUF de la v2.

El entrenamiento utiliza el dataset sriram1983007/sra-stablecoin-risk-bench, un benchmark propio de riesgo de pagos con stablecoins. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal no es arquitectonica sino de dominio: el modelo aprende a emitir decisiones de tres clases (approve, hold, reject) y a resolver disputas considerando la ventana de finalidad de liquidacion. Para obtener los mejores resultados en disputas, la model card recomienda anadir la ventana computada a los prompts de disputa y menciona una funcion `check_dispute_verdict` que reduce las denegaciones erroneas al 0 %.

## Capacidades

- Clasificacion de riesgo de pagos con stablecoins en tres decisiones: approve, hold y reject.
- Resolucion de disputas de pago en la frontera de finalidad de liquidacion.
- Deteccion de fraude y de patrones de riesgo financiero en propuestas de pago.
- Soporte de los estandares x402 y EIP-3009 para pagos programaticos.
- Integracion con el protocolo MCP (Model Context Protocol) para su uso por agentes.
- Gestion de tokens denominados en USD: USDC, USDT, USDB, USDG y cualquier token USD.
- Generacion de texto conversacional en ingles (pipeline text-generation).
- Capacidad de operar como puerta previa a la firma en flujos de agentes autonomos.
- No se documentan capacidades de vision, audio, codigo general ni matematicas fuera del dominio financiero.

## Casos de uso

- Puerta de riesgo en agentes de pago autonomos: el modelo se situa antes de la firma de una transaccion y clasifica cada propuesta como approve, hold o reject, evitando que el agente firme aprobaciones ilimitadas o pagos a destinatarios sospechosos. La model card documenta un caso en Arc testnet donde una aprobacion ilimitada fue retenida y un destinatario de aspecto similar fue rechazado.
- Deteccion de fraude en pagos con stablecoins: el modelo identifica patrones de riesgo financiero en propuestas de pago, con una tasa de aprobaciones inseguras del 0,35 % sobre 2.000 casos de test, lo que lo hace adecuado como capa de control en tesoreria automatizada.
- Resolucion de disputas de pago: con la ventana de finalidad incluida en el prompt, el modelo alcanza un 90,2 % de precision en disputas y reduce las denegaciones erroneas al 2,1 % (0 % con `check_dispute_verdict`), util para arbitraje automatizado de reclamaciones.
- Cumplimiento normativo en pagos programaticos: el modelo puede integrarse en flujos que requieren verificacion previa de contraparte y de importe antes de la liquidacion, con soporte para x402 y EIP-3009.
- Integracion en agentes via MCP: al soportar el protocolo MCP, el modelo puede exponerse como herramienta de verificacion que otros agentes consultan antes de ejecutar un pago, como se demuestra en la prueba con Grok como agente pagador.
- Verificacion en cadena de pagos liquidados: la model card documenta comprobaciones sobre Base Sepolia, Arc testnet y Robinhood Chain, lo que permite usar el modelo para auditar pagos ya ejecutados comparando importe y tiempo en cadena.
- Despliegue en entornos con recursos limitados: la disponibilidad de un build GGUF Q4_K_M y de una entrada en el registro de Ollama permite ejecutar el modelo en infraestructura modesta para pruebas y prototipos.

## Benchmarks y rendimiento

La model card reporta resultados sobre 2.000 casos de test reservados, comparando la v1 y la v2 del adaptador:

| Metrica | v1 | v2 |
|---|---|---|
| Puntuacion SRA | 0,913 | 0,960 |
| Precision en disputas | 77,8 % | 90,2 % |
| Denegaciones erroneas | 26,0 % | 2,1 % (0 % con `check_dispute_verdict`) |
| Aprobaciones de pago inseguras | 0,47 % | 0,35 % |

Ademas, la model card indica que sobre pagos reales en Base (dataset sra-real) el modelo tomo las 227 decisiones correctamente. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 4.000 millones de parametros, el adaptador LoRA anade una sobrecarga pequena sobre el base.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: el build GGUF Q4_K_M publicado sugiere que puede ejecutarse en GPU de consumo, aunque no se especifican modelos concretos ni requisitos de VRAM.
- Opciones de despliegue: llama.cpp y Ollama mediante el build GGUF Q4_K_M y la entrada en el registro de Ollama; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (gating de riesgo en pagos con stablecoins) en la documentacion proporcionada. La comparativa natural seria con el modelo base Qwen/Qwen3-4B-Instruct-2507 sin adaptador, pero no se han publicado resultados de este ultimo en el benchmark SRA en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SRA-RiskGate-4B (LoRA v2) | 4.000 M (base) + adaptador | no disponible | Apache 2.0 | Hugging Face, GGUF, Ollama |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.000 M | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas especializadas en riesgo de pagos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta ingles, lo que limita su uso en entornos multilingues.
- Esta especializado en un dominio muy concreto (pagos con stablecoins); su rendimiento fuera de ese dominio no esta documentado.
- La model card no detalla sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion no cuantificado: aunque el modelo emite decisiones discretas, no se documenta su comportamiento ante entradas ambiguas o fuera de distribucion.
- Los resultados de benchmarks son autoinformados por el autor y se basan en un benchmark propio (sra-stablecoin-risk-bench), no en estandares independientes.
- La longitud de contexto no esta especificada, lo que impide evaluar su idoneidad para conversaciones o documentos largos.
- Aunque la licencia es Apache 2.0, el uso en produccion para decisiones financieras requiere validacion adicional y no exime de responsabilidad legal o regulatoria.
- Las verificaciones en cadena documentadas se realizaron en testnets (Base Sepolia, Arc testnet) y en un caso de mainnet ajeno al autor, por lo que la evidencia en produccion es limitada.
- El adaptador requiere cargar el modelo base Qwen3-4B-Instruct-2507, lo que anade complejidad de despliegue frente a un modelo fusionado.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-LoRA
- Modelo fusionado: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Build GGUF Q4_K_M: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-Q4_K_M-GGUF
- Dataset de benchmark: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Resultados publicados: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Dataset de pagos reales en Base: https://huggingface.co/datasets/sriram1983007/sra-real
- Demo interactiva: https://huggingface.co/spaces/sriram1983007/sra-riskgate-demo
- Repositorio GitHub: https://github.com/sriram1983007-dev/sra-riskgate
- Registro de Ollama: https://ollama.com/sriram1983007/sra-riskgate
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23715017
- Write-up en Ready Tensor: https://app.readytensor.ai/publications/sra-riskgate-a-benchmark-and-a-4b-model-for-gating-stablecoin-payments-made-by-ai-agents-wihp3WytOoKOc1g7NXFsl
- Discusion en alphaXiv: https://www.alphaxiv.org/abs/2610.sra-riskgate-stablecoin-payment-safety
- Transaccion verificada en Base Sepolia: https://sepolia.basescan.org/tx/0xf12e9084becefd94fa6e26e54761fbfc8f3c04215d7fc724d0fca6077ba084fc
- Verificacion independiente de Flow Executor: https://flow-kg4x.vercel.app/row
- Log de Circle Gateway en Arc testnet: https://gist.github.com/sriram1983007-dev/8cd44e78adec20a0157368ec38c2fb42
- Prueba con Grok como agente pagador: https://gist.github.com/sriram1983007-dev/1555e11a57682496f710a8224415c9e2
- Comprobacion en mainnet (Robinhood Chain, USDG): https://gist.github.com/sriram1983007-dev/1d915320d85c7ed12a6044e42b382a40
