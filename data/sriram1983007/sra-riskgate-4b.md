# sriram1983007/SRA-RiskGate-4B

## Resumen

SRA-RiskGate-4B es un modelo de generación de texto especializado en la evaluación de riesgo, la verificación de cumplimiento normativo y la adjudicación de disputas en pagos con stablecoins. Lo desarrolla el usuario sriram1983007 y se distribuye como un fine-tune supervisado del modelo denso Qwen/Qwen3-4B-Instruct-2507, con 4.022.468.096 parámetros (unos 4,02 mil millones) y licencia Apache 2.0.

El modelo cubre los dos extremos del ciclo operativo de un pago con stablecoin. Por un lado actúa como puerta de riesgo previa a la liquidación (pre-settlement risk gate): recibe peticiones de pago en formato x402, autorizaciones EIP-3009 o transferencias ERC-20 estándar, junto con restricciones de política y salidas de herramientas de verificación deterministas (listas de sanciones, comprobación de atestaciones, estado de firmas), y devuelve decisiones estructuradas de aprobar, retener o rechazar con indicadores explícitos y acciones requeridas. Por otro, actúa como adjudicador de disputas posteriores a la liquidación, analizando pruebas firmadas, liquidez de bonos de comerciante y estado de escrow para proponer remedios técnicamente ejecutables.

Su relevancia actual radica en el encaje con infraestructuras de agentes autónomos que operan sobre blockchain: el modelo se publica como Action Provider verificado para Coinbase AgentKit, de modo que puede usarse como cortafuegos determinista que intercepta transferencias de un agente antes de firmarlas. Los resultados declarados por el autor en su propio banco de pruebas son muy altos (0,9949 de exactitud en la decisión de puerta de riesgo), aunque no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (fine-tune de Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (unos 4,02 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de Q8_0 a Q4_K_M (repositorio aparte); safetensors sin cuantizar en el repositorio principal; adaptador LoRA |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio principal), GGUF (SRA-RiskGate-4B-GGUF), adaptador LoRA (SRA-RiskGate-4B-LoRA) |

Datos adicionales: tamano del repositorio 8,1 GB; pipeline text-generation; libreria transformers; autor sriram1983007; fecha de creacion 2026-10-03; ultima actualizacion 2026-10-11; 3.016 descargas y 1 like en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer decoder denso de aproximadamente 4.000 millones de parametros, sobre el que se aplica un ajuste fino supervisado. La model card no detalla la composicion exacta del dataset de entrenamiento, el numero de tokens empleados ni si hubo etapas de RLHF o DPO; el unico dato disponible es que se uso el dataset sriram1983007/sra-stablecoin-risk-bench y que la herramienta de entrenamiento fue TRL (etiqueta declarada por el autor). El modelo se distribuye tambien como adaptador LoRA independiente.

La innovacion tecnica no esta en la arquitectura, sino en el diseno de la tarea. El modelo trabaja con esquemas de pago concretos del ecosistema EVM (peticiones x402, autorizaciones EIP-3009, firmas EIP-712, transferencias ERC-20 de USDC) y produce salidas estructuradas orientadas a la ejecucion: decision de aprobar, retener o rechazar con indicadores, y en el caso de disputas, remedios con importes exactos, destinos e idempotency keys. La documentacion insiste en que las comprobaciones de sanciones, atestaciones y firmas son deterministas y se ejecutan como herramientas externas, de modo que el modelo razona sobre esas salidas en lugar de sustituirlas. La integracion con Coinbase AgentKit se ofrece como Action Provider (`sra-riskgate[agentkit]>=0.3.5`), que verifica soporte de cadena, politicas y desviacion del peg antes de permitir una transferencia ERC-20.

## Capacidades

- Generacion de texto conversacional y razonamiento estructurado en ingles.
- Puerta de riesgo previa a la liquidacion: devuelve decisiones `approve` / `hold` / `reject` con flags explicitos y acciones requeridas.
- Adjudicacion de disputas posteriores a la liquidacion: propone remedios como anulacion antes de la liberacion de fondos, reembolso por arbitro desde escrow, ejecucion del bono del comerciante, reembolso voluntario, denegacion o escalado, con importes, destinos e idempotency keys.
- Comprension de primitivas de pago EVM: peticiones x402, autorizaciones EIP-3009, firmas EIP-712 y transferencias ERC-20.
- Integracion como Action Provider en Coinbase AgentKit para actuacion como cortafuegos de pagos de agentes autonomos.
- Consumo de salidas de herramientas de verificacion deterministas (sanciones, atestaciones, estado de firma) como contexto de decision.
- Deteccion de fraude y evaluacion de riesgo financiero en el dominio de stablecoins.
- Soporte de tool calling y function calling: si, a traves de la integracion con AgentKit y de las herramientas de verificacion descritas.
- Soporte de agentes y razonamiento multi-paso: si, en el flujo de pre-filtro y politica previo a la ejecucion de la transferencia.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio.

## Casos de uso

- Cortafuegos de pagos para agentes autonomos: registrar `RiskGateActionProvider` como proveedor de pagos en una instancia de AgentKit, de forma que toda transferencia ERC-20 propuesta por el agente pase por la comprobacion de soporte de cadena, politicas y desviacion del peg antes de firmarse. Adecuado porque el modelo esta disenado especificamente para esa secuencia de validacion y publica un ejemplo de integracion funcional.
- Pre-validacion de autorizaciones EIP-3009 en pasarelas de cobro: recibir la autorizacion firmada junto con las restricciones de politica del comercio y obtener una decision de aprobar, retener o rechazar antes de difundir la transaccion, reduciendo liquidaciones no deseadas.
- Verificacion de cumplimiento en pagos con USDC: combinar la salida de listas de sanciones y comprobaciones de atestacion con el razonamiento del modelo para emitir decisiones trazables con flags, utiles para auditoria interna.
- Gestion automatizada de disputas: ingestar pruebas de disputa firmadas, liquidez del bono del comerciante y estado del escrow para determinar si un reembolso es tecnicamente ejecutable segun el limite de finalidad de liquidacion, evitando remedios imposibles.
- Analisis de riesgo en tesoreria cripto: usar el modelo como clasificador de operaciones entrantes y salientes para marcar aquellas que requieren revision humana, apoyandose en la tasa declarada de sobrebloqueo nula.
- Evaluacion de exposicion a inyeccion de prompts en canales de pago: procesar peticiones x402 no confiables y medir si el modelo aprueba pagos inyectados, usando la metrica declarada de pagos inyectados aprobados (0,058) como referencia de calibracion.
- Despliegue en local para entornos con requisitos de privacidad: al existir cuantizaciones GGUF desde Q8_0 hasta Q4_K_M y una entrada en el registro de Ollama, puede ejecutarse sin enviar datos de pago a APIs externas.
- Prototipado rapido en notebook: el autor publica un cuaderno de Colab y una demo interactiva en Spaces, utiles para validar el formato de entrada y salida antes de integrarlo en produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, evaluados sobre el dataset sriram1983007/sra-stablecoin-risk-bench (config `benchmark`, split `test`). Ninguno de los valores esta marcado como verificado (`verified: false`).

| Tarea | Metrica | Valor |
|---|---|---|
| Puerta de riesgo de pagos con stablecoin | Puntuacion compuesta SRA | 0,9134 |
| Puerta de riesgo de pagos con stablecoin | Exactitud de la decision | 0,9949 |
| Puerta de riesgo de pagos con stablecoin | Tasa de aprobaciones inseguras (menor es mejor) | 0,0047 |
| Puerta de riesgo de pagos con stablecoin | Tasa de sobrebloqueo (menor es mejor) | 0,0000 |
| Puerta de riesgo de pagos con stablecoin | Pagos inyectados aprobados (menor es mejor) | 0,0580 |
| Adjudicacion de disputas con stablecoin | Puntuacion de disputa | 0,8322 |
| Adjudicacion de disputas con stablecoin | Exactitud del resultado de la disputa | 0,7782 |
| Adjudicacion de disputas con stablecoin | Tasa de remedios imposibles (menor es mejor) | 0,0038 |
| Adjudicacion de disputas con stablecoin | Tasa de reembolsos indebidos (menor es mejor) | 0,0220 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por lo que no es posible comparar el rendimiento general del modelo con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, en torno a 8-9 GB para los pesos mas activaciones; en INT8, aproximadamente 4,5 GB; en GGUF Q4_K_M, alrededor de 2,5-3 GB.
- GPU recomendadas: NVIDIA A100 40 GB, H100 o L40S para despliegues concurrentes en FP16; una RTX 4090 (24 GB) o L4 (24 GB) es suficiente para FP16 con una sola instancia.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 pueden ejecutar el modelo en FP16 o cuantizado; tarjetas con 8 GB necesitan cuantizacion de 8 bits o inferior.
- Opciones de despliegue: transformers (libreria declarada), vLLM, llama.cpp y Ollama (existe entrada en el registro de Ollama para `sriram1983007/sra-riskgate`), TGI (etiqueta `text-generation-inference` en HuggingFace) y Text Generation Inference en endpoints compatibles.
- El repositorio principal ocupa 8,1 GB, por lo que la descarga en precision completa requiere ese espacio en disco antes de cuantizar.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria (clasificacion de riesgo y adjudicacion de disputas en pagos con stablecoins) con benchmarks publicados en la informacion proporcionada. La comparacion se limita al modelo base del que deriva.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRA-RiskGate-4B | 4,02 mil millones | no disponible | Riesgo de pagos, cumplimiento y disputas con stablecoins | apache-2.0 | HuggingFace (safetensors, GGUF, LoRA), Ollama, PyPI, Space de demo |
| Qwen/Qwen3-4B-Instruct-2507 | no disponible en la informacion proporcionada | no disponible | Instrucciones generales, modelo base | no disponible en la informacion proporcionada | HuggingFace |
| Modelos comparables de la misma tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todos los resultados de benchmarks son declarados por el autor y estan marcados como no verificados; la evaluacion se realiza sobre un banco de pruebas tambien creado por el autor, lo que introduce un riesgo claro de sesgo de evaluacion.
- La tasa declarada de pagos inyectados aprobados es del 5,8 %, es decir, el modelo sigue aprobando una parte de los pagos manipulados mediante inyeccion de prompts. No debe usarse como unico control de seguridad en un flujo con dinero real.
- El modelo solo declara soporte de ingles (`language: en`); las peticiones o pruebas de disputa en otros idiomas pueden degradar la calidad de la decision.
- La longitud de contexto no esta documentada en la model card, lo que impide dimensionar casos con historiales de disputa o expedientes de evidencia extensos.
- Riesgo de alucinacion: aunque el diseno separa las comprobaciones deterministas (sanciones, atestaciones, firmas) en herramientas externas, el modelo sigue generando decisiones e importes de remedio en lenguaje natural; cualquier reembolso o ejecucion de bono debe validarse contra el estado real del contrato antes de ejecutarse.
- El modelo no es asesoramiento legal ni financiero, y la documentacion lo presenta como componente de decision, no como autoridad final.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de licencia y de atribucion. No se declaran restricciones adicionales de uso aceptable.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos sistematicos en la aprobacion o denegacion de pagos.
- El proyecto tiene un unico autor, 1 like y una comunidad muy reducida en el momento de la consulta, lo que implica menor soporte y menor escrutinio externo.
- La integracion con AgentKit depende de versiones concretas del SDK de Coinbase (`coinbase-agentkit`) y del paquete `sra-riskgate`; los cambios de API en cualquiera de los dos pueden romper la integracion.
- Los enlaces de integracion requieren credenciales de la Coinbase Developer Platform (API key, secret y wallet secret), lo que anade requisitos operativos y de gestion de secretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriram1983007/SRA-RiskGate-4B
- Repositorio GGUF: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-GGUF
- Adaptador LoRA: https://huggingface.co/sriram1983007/SRA-RiskGate-4B-LoRA
- Dataset de evaluacion: https://huggingface.co/datasets/sriram1983007/sra-stablecoin-risk-bench
- Resultados reproducibles: https://huggingface.co/datasets/sriram1983007/sra-bench-results
- Demo interactiva en Spaces: https://huggingface.co/spaces/sriram1983007/sra-riskgate-demo
- Cuaderno de Colab: https://colab.research.google.com/drive/1R9seZu-En9QUZCklxFeIqxEuSaISg7x6
- Paquete en PyPI: https://pypi.org/project/sra-riskgate/
- Registro de Ollama: https://ollama.com/sriram1983007/sra-riskgate
- Model pulse: https://huggingface.co/spaces/tardellirs/model-pulse?model=sriram1983007/SRA-RiskGate-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
