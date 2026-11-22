# sriram1983007/SRA-RiskGate-4B-Q4_K_M-GGUF

## Resumen

SRA-RiskGate-4B es un modelo de lenguaje especializado en la evaluacion de riesgo y la adjudicacion de disputas en pagos con stablecoins (USDC, USDT, USDB, USDG y otros tokens denominados en USD). Lo desarrolla el usuario independiente sriram1983007 y se distribuye como adaptacion afinada de la familia Qwen3, con 4.022.468.096 parametros totales. El modelo resuelve un problema muy concreto: decidir si un agente autonomo debe firmar, retener o rechazar una autorizacion de pago (EIP-3009, x402, ERC-20, escrow) antes de que se emita la transaccion, y arbitrar reclamaciones y reembolsos posteriores.

Esta ficha cubre la variante cuantizada **Q4_K_M en formato GGUF** (~2,5 GB), pensada para ejecucion local con llama.cpp y Ollama. El repositorio incluye ademas una libreria Python (`sra-riskgate`), un servidor MCP (`sra-riskgate-mcp`) y un banco de pruebas especifico (`sra-stablecoin-risk-bench`), lo que convierte al modelo en una pieza de infraestructura para agentes que operan con dinero real mas que en un chatbot de proposito general.

Su relevancia actual viene del auge de los pagos maquina a maquina: los agentes que firman autorizaciones de stablecoin necesitan una capa de decision determinista y auditable antes de mover fondos. El modelo emite veredictos del tipo APPROVE, HOLD o REJECT, y el autor documenta verificaciones en Base Sepolia, Arc testnet y Robinhood Chain. La licencia es Apache 2.0 y solo declara ingles como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3, segun tags del repositorio) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta variante); el modelo base en safetensors esta disponible en el repositorio original |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama); safetensors en el modelo base |
| Tamano del repositorio | 5,0 GB |
| Version del archivo | v2 (2026-11-13), construida sobre los pesos fusionados v2 |
| Descargas | 782 |
| Likes | 1 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 4B parametros de la familia Qwen3, afinado para una tarea de clasificacion y adjudicacion de riesgo en pagos. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; solo referencia el dataset `sriram1983007/sra-stablecoin-risk-bench` como material de evaluacion y entrenamiento asociado. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

La innovacion principal no esta en la arquitectura sino en el dominio: el modelo esta entrenado para emitir decisiones estructuradas (APPROVE, HOLD, REJECT) sobre propuestas de pago, con especial atencion a patrones de fraude conocidos como aprobaciones ilimitadas, beneficiarios suplantados (look-alike payees) e importes anomalos. La version v2 de los pesos fusionados mejora la precision en disputas del 77,8 % al 90,2 % y reduce las aprobaciones de pago inseguras del 0,47 % al 0,35 % respecto a v1, segun los datos del autor. El archivo GGUF Q4_K_M se ha validado sobre 12 casos del benchmark (12 de 12 correctos), pero no sobre el conjunto completo; la tabla de resultados publicada corresponde a las builds v1.

## Capacidades

- Generacion de texto y razonamiento especializado en riesgo de pagos con stablecoins.
- Clasificacion de propuestas de pago en tres veredictos: APPROVE, HOLD y REJECT.
- Deteccion de patrones de riesgo: aprobaciones ilimitadas, beneficiarios desconocidos o suplantados, importes fuera de rango.
- Adjudicacion de disputas y evaluacion de solicitudes de reembolso.
- Razonamiento sobre estandares de pago: EIP-3009, x402, ERC-20 y flujos de escrow.
- Soporte de agentes y uso multi-paso mediante el servidor MCP `sra-riskgate-mcp` y la libreria `sra-riskgate`.
- Integracion con frameworks de agentes (tag `agentkit` en el repositorio).
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- **Pasarela de aprobacion previa a la firma en agentes de pago**: antes de que un agente emita una autorizacion EIP-3009, el modelo evalua la propuesta y devuelve APPROVE, HOLD o REJECT; el caso documentado en Base Sepolia retuvo un pago de 2,00 USDC a un beneficiario desconocido antes de la firma.
- **Proteccion frente a aprobaciones ilimitadas**: en la prueba con Circle Gateway sobre Arc testnet, el modelo retuvo una aprobacion sin limite y rechazo un beneficiario suplantado, ninguno de los cuales se firmo.
- **Verificacion de liquidaciones en cadena**: combinado con la funcion `verify_settlement` de la libreria, se comprobo un pago de 25,075 USDG en Robinhood Chain confirmando importe, destinatario y allowance residual a cero.
- **Adjudicacion automatizada de disputas y reembolsos**: el modelo puntua reclamaciones de compradores y vendedores con una precision del 90,2 % en la version v2, adecuada para arbitraje de primera linea con escalado humano en los casos HOLD.
- **Integracion en servidores MCP para agentes LLM**: el paquete `sra-riskgate-mcp` expone las comprobaciones como herramientas que cualquier agente compatible con MCP puede invocar, sin necesidad de que el agente principal conozca la logica de riesgo.
- **Auditoria de transacciones sospechosas**: dado un historial de pagos en stablecoin, el modelo puede clasificar operaciones retrospectivamente y generar explicaciones de por que una transaccion deberia haberse retenido.
- **Despliegue local en entornos de compliance**: al ser un GGUF Q4_K_M de ~2,5 GB, puede ejecutarse en infraestructura propia sin enviar datos de pago a APIs externas, lo que facilita el cumplimiento de requisitos de confidencialidad.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a las builds v1 del modelo base; la variante GGUF Q4_K_M v2 solo se ha validado en 12 casos sueltos.

| Metrica | v1 | v2 (pesos fusionados) |
|---|---|---|
| Precision en disputas | 77,8 % | 90,2 % |
| Aprobaciones de pago inseguras | 0,47 % | 0,35 % |
| Casos del benchmark validados en GGUF Q4_K_M | no disponible | 12 de 12 (subconjunto) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las predicciones completas del benchmark estan publicadas en el dataset `sriram1983007/sra-bench-results`.

## Requisitos de hardware

- **VRAM estimada**: el archivo Q4_K_M ocupa ~2,5 GB; con overhead de contexto y cache KV, entre 3 y 4 GB de VRAM son suficientes para inferencia.
- **GPU consumer**: cabe en cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090); tambien puede ejecutarse en CPU con llama.cpp.
- **GPU de datacenter**: A100, H100 y L40S estan sobredimensionadas para este modelo; su uso solo se justifica para servir muchas peticiones concurrentes.
- **Opciones de despliegue**: llama.cpp, Ollama (registro `sriram1983007/sra-riskgate`), y servidor MCP via `sra-riskgate-mcp`. No se documenta soporte de vLLM ni TGI para este GGUF.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, se incluyen alternativas de tamano y proposito cercanos, aunque la comparacion cualitativa de rendimiento no esta publicada.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| SRA-RiskGate-4B (Q4_K_M) | 4B | no disponible | Riesgo de pagos stablecoin | Apache 2.0 | GGUF |
| Qwen3-4B | 4B | no disponible | Proposito general | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B | 3B | no disponible | Proposito general | Llama 3.2 Community | safetensors, GGUF |
| Phi-3.5-mini | 3,8B | no disponible | Proposito general | MIT | safetensors, GGUF |

La diferencia clave frente a estos modelos generalistas es la especializacion en un dominio estrecho (pagos con stablecoin) y el ecosistema de herramientas asociado (libreria Python, servidor MCP, dataset de benchmark).

## Limitaciones y advertencias

- **Idioma**: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- **Contexto**: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar conversaciones o historiales de pago largos.
- **Benchmark incompleto en v2**: el archivo GGUF v2 solo se ha validado en 12 casos; la tabla de resultados publicada corresponde a v1.
- **Registro Ollama desactualizado**: segun la model card, el modelo en el registro de Ollama sigue siendo v1.
- **Riesgo de alucinacion**: no cuantificado; al ser un modelo de 4B especializado, puede producir justificaciones plausibles pero incorrectas, por lo que las decisiones HOLD y REJECT deberian revisarse.
- **Dependencia de comprobaciones deterministas**: las verificaciones en cadena documentadas usan las comprobaciones de la libreria `sra-riskgate`, no el modelo en si; el modelo no sustituye la validacion criptografica.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad para produccion financiera.
- **Madurez**: proyecto de un autor individual, con 782 descargas y 1 like; no hay evidencia de adopcion amplia ni auditoria de seguridad independiente del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-Q4_K_M-GGUF
- Modelo base (safetensors): https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Dataset de benchmark: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Resultados publicados: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Demo interactiva: https://huggingface.co/spaces/sriram1983007/sra-riskgate-demo
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23715017
- Write-up en Ready Tensor: https://app.readytensor.ai/publications/sra-riskgate-a-benchmark-and-a-4b-model-for-gating-stablecoin-payments-made-by-ai-agents-wihp3WytOoKOc1g7NXFsl
- Discusion en alphaXiv: https://www.alphaxiv.org/abs/2610.sra-riskgate-stablecoin-payment-safety
- Libreria Python: https://pypi.org/project/sra-riskgate/
- Servidor MCP: https://pypi.org/project/sra-riskgate-mcp/
- Registro Ollama: https://ollama.com/sriram1983007/sra-riskgate
- Repositorio GitHub: https://github.com/sriram1983007-dev/sra-riskgate
- Verificacion en Base Sepolia: https://sepolia.basescan.org/tx/0xf12e9084becefd94fa6e26e54761fbfc8f3c04215d7fc724d0fca6077ba084fc
- Re-verificacion por Flow Executor: https://flow-kg4x.vercel.app/row
- Log de Circle Gateway en Arc testnet: https://gist.github.com/sriram1983007-dev/8cd44e78adec20a0157368ec38c2fb42
- Prueba con agente Grok: https://gist.github.com/sriram1983007-dev/1555e11a57682496f710a8224415c9e2
- Verificacion en Robinhood Chain: https://robinhoodchain.blockscout.com/tx/0xe85c07f5d50f14f9ba33ba372193982a0fea47791c1e431732a1d424eb2fb481
