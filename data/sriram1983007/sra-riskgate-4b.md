# sriram1983007/SRA-RiskGate-4B

## Resumen

SRA-RiskGate-4B es un modelo de lenguaje especializado en la evaluacion de riesgo de pagos con stablecoins realizados por agentes de IA. Lo desarrolla el usuario independiente sriram1983007 y se distribuye como un fine-tuning del modelo base Qwen/Qwen3-4B-Instruct-2507, con 4.022.468.096 parametros totales y licencia Apache 2.0. Su proposito es actuar como una "puerta de seguridad" (risk gate) que decide si una transaccion propuesta por un agente debe aprobarse, bloquearse o derivarse, antes de que se ejecute en protocolos como x402, EIP-3009 o EIP-712 sobre USDC.

El modelo aborda un problema emergente: los agentes autonomos que pagan con stablecoins necesitan un control previo que detecte fraude, direcciones sancionadas (OFAC), intentos de prompt injection y disputas mal planteadas. SRA-RiskGate-4B se presenta como una solucion ligera, ejecutable en un portatil, que puede integrarse mediante un SDK de Python, un servidor MCP o directamente con transformers. El autor publica resultados medidos sobre un conjunto de test propio (SRA Stablecoin Risk Bench) y predicciones completas para reproducibilidad.

La relevancia actual radica en que combina un modelo de 4B con un benchmark especifico de riesgo financiero y herramientas de integracion (PyPI, Ollama, GGUF, LoRA), lo que facilita su adopcion en pipelines de agentes que operan con pagos. No obstante, los resultados son declarados por el autor y no estan verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 (publicados en el repo GGUF); otras no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF; adaptador LoRA |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros. El autor lo entrena con TRL sobre un dataset propio orientado a decisiones de riesgo en pagos con stablecoins (sriram1983007/sra-stablecoin-risk-bench). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles.

La innovacion principal no es arquitectonica sino de dominio: el modelo se especializa en clasificar y razonar sobre escenarios de pago (aprobacion, bloqueo, disputa, reembolso) e incorpora resistencia a prompt injection en el contexto de pagos agenticos. Se publican tambien un adaptador LoRA, versiones GGUF y un benchmark de evaluacion con predicciones completas, lo que facilita la reproducibilidad, aunque la verificacion es responsabilidad del autor.

## Capacidades

- Generacion de texto y razonamiento especializado en riesgo de pagos con stablecoins.
- Decision de risk gate: aprobar, bloquear o derivar una transaccion propuesta por un agente.
- Deteccion de fraude y de direcciones sancionadas (etiqueta OFAC en los tags del modelo).
- Evaluacion de disputas y reembolsos, con adjudicacion de resultados y remedios.
- Resistencia a prompt injection en el contexto de pagos agenticos.
- Soporte de integracion como herramienta via MCP (servidor sra-riskgate-mcp) y SDK de Python (sra-riskgate).
- Capacidades multilingues: solo ingles.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Puerta de seguridad previa a pagos de agentes: el modelo se invoca antes de cada transaccion x402 o EIP-3009 para decidir si se aprueba, se bloquea o se escala, reduciendo aprobaciones inseguras.
- Deteccion de prompt injection en pagos agenticos: al evaluar la intencion y el contexto de la transaccion, puede frenar ordenes manipuladas por contenido malicioso en el prompt del agente.
- Cumplimiento OFAC y listas de sanciones: integrado en el pipeline de pagos, marca direcciones o contrapartes sospechosas antes de la liquidacion.
- Gestion de disputas y reembolsos: el modelo adjudica resultados de disputas y propone remedios, util para soporte automatizado en plataformas de stablecoins.
- Integracion en agentes via MCP: el servidor MCP permite que un agente consulte el risk gate como herramienta durante un flujo multi-paso de pago.
- Despliegue local en portatil: gracias a las versiones GGUF Q4_K_M y a Ollama, puede ejecutarse en equipos de desarrollo sin GPU dedicada para pruebas y prototipos.
- Evaluacion y auditoria interna: el benchmark y las predicciones publicadas permiten comparar el comportamiento del modelo en escenarios de riesgo antes de produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de SRA Stablecoin Risk Bench (no verificados de forma independiente):

| Tarea | Metrica | Valor |
|---|---|---|
| Risk gating de pagos | SRA composite score | 0,9604 |
| Risk gating de pagos | Precision de decision (accuracy) | 0,9957 |
| Risk gating de pagos | Tasa de aprobaciones inseguras (menor es mejor) | 0,0035 |
| Risk gating de pagos | Tasa de sobre-bloqueo (menor es mejor) | 0,0 |
| Risk gating de pagos | Pagos inyectados aprobados (menor es mejor) | 0,029 |
| Adjudicacion de disputas | Dispute score | 0,9254 |
| Adjudicacion de disputas | Precision del resultado (accuracy) | 0,9018 |
| Adjudicacion de disputas | Tasa de remedios imposibles (menor es mejor) | 0,0057 |
| Adjudicacion de disputas | Tasa de reembolsos incorrectos (menor es mejor) | 0,022 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16): aproximadamente 8 GB para los 4.022 millones de parametros.
- Cuantizacion GGUF Q4_K_M: permite ejecucion en CPU y en GPU consumer con 4-6 GB de VRAM; Q8_0 requiere algo mas, en torno a 5-7 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para despliegues con mayor throughput; en consumer cabe en GPUs de 8 GB o mas.
- Despliegue: transformers, Ollama (modelo publicado), llama.cpp via GGUF, y potencialmente TGI/vLLM (el tag text-generation-inference sugiere compatibilidad, aunque no se detalla configuracion).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con modelos alternativos de riesgo de pagos o de 4B especializados.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente; deben tratarse con cautela en decisiones de produccion.
- El modelo solo soporta ingles, lo que limita su uso en entornos multilingues.
- La longitud de contexto no esta documentada; no se debe asumir una ventana amplia para transacciones con mucho historial.
- Riesgo de alucinacion inherente a los modelos de lenguaje: puede generar justificaciones plausibles pero incorrectas en escenarios de riesgo no vistos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Qwen3-4B-Instruct-2507 tiene sus propias condiciones que conviene revisar.
- El dominio es muy especifico (stablecoins, x402, EIP-3009/EIP-712); su rendimiento fuera de ese ambito no esta documentado.
- No sustituye controles de cumplimiento formales ni revision humana en operaciones financieras reguladas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Dataset de benchmark: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Predicciones publicadas: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Demo en Spaces: https://huggingface.co/spaces/sriram1983007/sra-riskgate-demo
- Version GGUF: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-GGUF
- Adaptador LoRA: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-LoRA
- Ollama: https://ollama.com/sriram1983007/sra-riskgate
- SDK Python (PyPI): https://pypi.org/project/sra-riskgate/
- Servidor MCP (PyPI): https://pypi.org/project/sra-riskgate-mcp/
- Paper (Zenodo): https://doi.org/10.5281/zenodo.23715017
- Notebook Colab: https://colab.research.google.com/drive/1R9seZu-En9QUZCklxFeIqxEuSaISg7x6
- Notebook Kaggle: https://www.kaggle.com/code/sriram1983007/try-sra-riskgate-4b-payment-safety-model
