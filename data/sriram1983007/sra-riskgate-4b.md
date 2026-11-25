# sriram1983007/SRA-RiskGate-4B

## Resumen

SRA-RiskGate-4B es un ajuste fino supervisado de Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario independiente sriram1983007, orientado a la evaluacion de riesgo de pagos con stablecoins realizados por agentes de IA. El modelo actua como una "puerta de riesgo" (risk gate) que decide si una operacion de pago debe aprobarse, bloquearse o escalarse, y tambien resuelve disputas y reembolsos asociados a esos pagos. Es relevante porque el ecosistema de pagos agente-a-agente (x402, MCP, EIP-3009, EIP-712) carece de mecanismos abiertos y auditables de control de riesgo, y este modelo propone uno ejecutable en hardware de consumo.

El modelo tiene 4.022.468.096 parametros (dato real de safetensors), se distribuye en formato safetensors y tambien como GGUF (Q4_K_M y Q8_0) y como adaptador LoRA, y esta publicado con licencia Apache 2.0. Solo declara soporte para ingles. Su propuesta de valor no es la generacion de texto general, sino la clasificacion y adjudicacion estructurada en un dominio financiero muy concreto, con resultados declarados por el autor de hasta 0,9957 de precision en decisiones de aprobacion/bloqueo y una tasa de aprobaciones inseguras del 0,35 %.

La relevancia actual del modelo deriva del auge de agentes autonomos que ejecutan pagos sin intervencion humana. SRA-RiskGate-4B se presenta como una comprobacion previa a cada pago, integrable mediante un SDK de Python y un servidor MCP, con el objetivo de detectar fraude, cumplimiento OFAC y ataques de inyeccion de prompt en el flujo de pago.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 publicados; otros no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; GGUF; adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros, y se ajusta mediante fine-tuning supervisado con TRL (tag `trl` en la model card). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El dataset asociado es sriram1983007/sra-stablecoin-risk-bench, que el autor publica como benchmark y que tambien sirve de base para la evaluacion.

La innovacion tecnica no reside en la arquitectura, sino en la especializacion del dominio: el modelo esta entrenado para razonar sobre semantica de pagos con stablecoin (USDC), estandares de autorizacion (x402, EIP-3009, EIP-712), deteccion de fraude, listas OFAC, disputas y reembolsos, y resistencia a inyeccion de prompt en el contexto de pagos agenticos. El autor publica tambien un articulo en Zenodo (DOI 10.5281/zenodo.23715017) y un conjunto completo de predicciones para reproducibilidad.

## Capacidades

- Evaluacion de riesgo de pagos con stablecoin: aprobacion, bloqueo o escalado de operaciones.
- Adjudicacion de disputas y calculo de reembolsos con criterios de remedio posible.
- Deteccion de fraude y de cumplimiento sancionador (OFAC) en flujos de pago.
- Resistencia a inyeccion de prompt en el contexto de pagos agenticos.
- Razonamiento sobre estandares de autorizacion: x402, EIP-3009 y EIP-712.
- Integracion como herramienta en agentes mediante servidor MCP (paquete sra-riskgate-mcp).
- SDK de Python (sra-riskgate) para invocar la comprobacion antes de cada pago.
- Generacion de texto conversacional en ingles, heredada del modelo base.
- Soporte de tool calling y function calling heredado de Qwen3-Instruct (no verificado de forma especifica en la informacion disponible).

## Casos de uso

- Puerta de riesgo previa a pagos agente-a-agente: antes de que un agente ejecute una transferencia USDC via x402 o EIP-3009, se invoca el modelo para clasificar la operacion como segura, insegura o escalable; su tasa declarada de aprobaciones inseguras del 0,35 % lo hace adecuado como filtro de primera linea.
- Deteccion de inyeccion de prompt en pagos: el modelo evalua si una instruccion recibida por el agente contiene un intento de manipulacion para autorizar un pago no deseado; el autor declara una tasa de aprobacion de pagos inyectados del 2,9 %.
- Cumplimiento OFAC y sanciones: integrado en el pipeline de pagos, el modelo puede marcar operaciones con contrapartes potencialmente sancionadas antes de su liquidacion, reduciendo el riesgo regulatorio.
- Adjudicacion automatizada de disputas: con una precision declarada del 90,18 % en resultados de disputa, puede preclasificar reclamaciones y proponer un remedio, dejando la decision final a revision humana.
- Gestion de reembolsos: el modelo estima la procedencia de un reembolso con una tasa declarada de reembolsos indebidos del 2,2 %, util para triaje en equipos de soporte financiero.
- Integracion en agentes via MCP: cualquier agente compatible con Model Context Protocol puede consultar el servidor sra-riskgate-mcp como herramienta de verificacion antes de ejecutar una accion de pago.
- Despliegue en local para auditoria: al ejecutarse en un portatil (via Ollama o GGUF Q4_K_M), permite a equipos de seguridad reproducir decisiones y auditar el comportamiento del filtro sin depender de APIs externas.
- Prototipado en notebooks: el autor ofrece notebooks de Colab y Kaggle para probar el modelo en GPU gratuita, util para evaluar su comportamiento antes de integrarlo en produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test del dataset SRA Stablecoin Risk Bench (no verificados de forma independiente):

| Tarea | Metrica | Valor |
|---|---|---|
| Risk gating | SRA composite score | 0,9604 |
| Risk gating | Precision de decision (accuracy) | 0,9957 |
| Risk gating | Tasa de aprobaciones inseguras (menor es mejor) | 0,0035 |
| Risk gating | Tasa de sobre-bloqueo (menor es mejor) | 0,0000 |
| Risk gating | Pagos inyectados aprobados (menor es mejor) | 0,0290 |
| Disputas | Dispute score | 0,9254 |
| Disputas | Precision del resultado de disputa | 0,9018 |
| Disputas | Tasa de remedio imposible (menor es mejor) | 0,0057 |
| Disputas | Tasa de reembolso indebido (menor es mejor) | 0,0220 |

El autor declara ademas 227 de 227 aciertos en pagos reales sobre la red Base, dato no verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8 GB para los 4.022 millones de parametros mas overhead de activaciones.
- VRAM estimada en GGUF Q8_0: aproximadamente 4,5-5 GB.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 2,5-3 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para cuantizaciones Q4/Q8; RTX 3060, RTX 4060, RTX 4090 para BF16; A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, en modelos con 6-8 GB de VRAM usando cuantizacion.
- Opciones de despliegue: transformers, Ollama (modelo publicado como sriram1983007/sra-riskgate), llama.cpp via GGUF, Text Generation Inference (tag endpoints_compatible), SDK sra-riskgate y servidor MCP sra-riskgate-mcp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRA-RiskGate-4B | 4.022 M | no disponible | Riesgo de pagos stablecoin, disputas, inyeccion de prompt | Apache 2.0 | Hugging Face, Ollama, GGUF, LoRA, PyPI, MCP |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.000 M aprox. | no disponible | Generacion de texto general, razonamiento, codigo | Apache 2.0 | Hugging Face |
| Modelos de compliance financiero de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la misma tarea de risk gating de pagos con stablecoin. El modelo base Qwen3-4B-Instruct-2507 es la referencia natural de partida, pero no se han publicado en la informacion disponible resultados comparativos entre ambos en el benchmark SRA.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo `verified: false` en el model-index).
- El modelo solo declara soporte para ingles; su uso en otros idiomas no esta validado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar su uso en flujos con historiales largos.
- Es un modelo de 4.000 millones de parametros especializado; fuera de su dominio (pagos stablecoin) su rendimiento no esta caracterizado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion en la adjudicacion de disputas: aunque la tasa declarada de remedios imposibles es baja (0,57 %), cualquier decision con consecuencias financieras deberia pasar por revision humana.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad del modelo para cumplimiento regulatorio real; no sustituye asesoramiento legal ni controles KYC/AML formales.
- El modelo no es un sistema completo de compliance: es una comprobacion adicional que debe integrarse en un pipeline con validacion criptografica, listas de sanciones actualizadas y auditoria.
- La fecha de creacion del repositorio (2026-10-03) y la version v2 (2026-11-13) indican un proyecto reciente; la madurez y el mantenimiento a largo plazo no estan garantizados.
- El ecosistema de integraciones (SDK, MCP, Ollama) depende del autor y de paquetes de terceros; conviene fijar versiones en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Version GGUF: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-GGUF
- Adaptador LoRA: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-LoRA
- Dataset de benchmark: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Predicciones publicadas: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Demo en vivo: https://huggingface.co/spaces/sriram1983007/sra-riskgate-demo
- Notebook de Colab: https://colab.research.google.com/drive/1R9seZu-En9QUZCklxFeIqxEuSaISg7x6
- Notebook de Kaggle: https://www.kaggle.com/code/sriram1983007/try-sra-riskgate-4b-payment-safety-model
- Modelo en Ollama: https://ollama.com/sriram1983007/sra-riskgate
- SDK de Python en PyPI: https://pypi.org/project/sra-riskgate/
- Servidor MCP en PyPI: https://pypi.org/project/sra-riskgate-mcp/
- Articulo en Zenodo: https://doi.org/10.5281/zenodo.23715017
- DOI del modelo en Hugging Face: https://doi.org/10.57967/hf/11215
- Ficha en mcprush: https://mcprush.com/sriram1983007-dev/sra-riskgate-mcp
- Ficha en Glama: https://glama.ai/mcp/servers/sriram1983007-dev/sra-riskgate-mcp
