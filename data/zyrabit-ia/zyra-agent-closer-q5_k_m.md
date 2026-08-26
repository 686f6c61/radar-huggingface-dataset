# Zyrabit-IA/zyra-agent-closer-Q5_K_M

## Resumen

Zyra Agent Closer es un modelo de lenguaje pequeño (SLM) especializado en negociación y cierre de ventas, desarrollado por Zyrabit Architecture Labs como parte de su motor de IA soberana (Sovereign AI). Se trata de un fine-tuning del modelo Qwen/Qwen2.5-3B, cuantizado en formato GGUF Q5_K_M, con 3.085.938.688 parámetros y una ventana de contexto no especificada. El modelo está diseñado para manejar objeciones de venta, modelos de precios y ejecución de contratos empresariales, con especial énfasis en entornos aislados (air-gapped) y sin envío de datos a la nube.

La relevancia de este modelo radica en su enfoque en soberanía de datos y despliegue local, junto con su optimización para hardware Tenstorrent Blackhole NPU. Aunque es un modelo pequeño (3B), su fine-tuning especializado en un dominio concreto (ventas y cierre de acuerdos) le permite ofrecer un rendimiento notable en tareas de negociación, con un 95,8% de precisión en su suite de evaluación de dominio y un 92,1% en IFEval (seguimiento de instrucciones). Está disponible en inglés y español, y su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 3.085.938.688 (3.08B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | en, es |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen2.5-3B, un modelo denso de 3.08 mil millones de parámetros. El fine-tuning se realizó sobre un conjunto de datos de 2.000 pares de conversaciones sanitizadas (archivo `zyra_agent_closer.jsonl`), orientados a la negociación y cierre de ventas. El entrenamiento se llevó a cabo sobre un NPU Tenstorrent Blackhole p150, logrando un throughput de 1.150,80 pasos por segundo (más de 6.900 veces superior a CPU) y una latencia P95 de 135 ms en inferencia en memoria.

El proceso de entrenamiento no incluye técnicas de RLHF ni DPO según la información disponible; se trata de un ajuste fino supervisado (SFT) sobre datos de dominio. El modelo está diseñado para cumplir con un esquema JSON estricto (100% de conformidad en las pruebas) y para no filtrar PII (0% de fugas). La política de soberanía garantiza cero tráfico de red saliente, lo que lo hace adecuado para entornos aislados.

## Capacidades

- Generación de texto conversacional en inglés y español, especializado en contextos de ventas y negociación.
- Manejo de objeciones de clientes y propuesta de modelos de precios.
- Generación de respuestas estructuradas en JSON con alta fidelidad al esquema.
- Seguimiento de instrucciones con un 92,1% en IFEval (strict prompt).
- Capacidad de actuar como agente de cierre de acuerdos, integrable en pipelines de automatización comercial.
- Compatible con inferencia local en hardware acelerado (Tenstorrent NPU) y en CPU/GPU mediante llama.cpp u otros entornos GGUF.

## Casos de uso

- **Automatización de atención al cliente en ventas**: el modelo puede gestionar conversaciones multi-turno con clientes, identificando objeciones y aplicando técnicas de cierre. Su precisión de dominio del 95,8% lo hace adecuado para escenarios de cualificación y cierre de leads.
- **Generación de propuestas comerciales**: dado su entrenamiento en negociación, puede redactar respuestas a solicitudes de propuesta (RFPs) o crear textos de ofertas personalizadas, cumpliendo con esquemas JSON para integración en CRMs.
- **Soporte en negociación de precios**: el modelo ofrece argumentos de valor y descuentos controlados, ayudando a agentes humanos a mantener márgenes mientras se cierra la venta.
- **Automatización de contratos simples**: puede extraer términos clave de un contrato y generar respuestas de conformidad o aclaraciones, reduciendo el tiempo de revisión legal.
- **Entrenamiento de equipos comerciales**: como simulador de cliente, permite practicar técnicas de cierre y manejo de objeciones en un entorno controlado.
- **Integración en plataformas de IA soberana**: dado que no requiere conexión externa, puede desplegarse en entornos con requisitos de seguridad estrictos (banca, sanidad, administración pública) para gestionar comunicaciones comerciales sin fuga de datos.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en la model card, sin verificación externa.

| Benchmark | Métrica | Resultado |
|---|---|---|
| Domain Accuracy & Instruction Adherence | Precisión en test de dominio | 95,8% |
| IFEval | Strict Prompt Accuracy | 92,1% |
| JSON Schema Validity | Precisión de parsing estructural | 100% |
| PII Redaction Audit | Tasa de fuga de memoria | 0% |
| Air-Gap Network Verification | Paquetes de red salientes | 0 bytes |

No se han publicado resultados en benchmarks generales estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q5_K_M ocupa aproximadamente 2,2 GB, por lo que la inferencia en FP16 requiere unos 4 GB de VRAM. En cuantización Q5_K_M, se puede ejecutar en GPU con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- **GPU recomendadas**: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090, o GPUs profesionales como A10/A100. También es compatible con el acelerador Tenstorrent Blackhole p150, para el que se ha optimizado el modelo.
- **Despliegue**: compatible con llama.cpp (llama-cli), Ollama, vLLM (si se convierte a formato safetensors), y la CLI propietaria `./zyra`. También puede servirse mediante una API REST compatible con el protocolo de chat de OpenAI.
- **Latencia**: en Tenstorrent NPU se reporta una latencia P95 de 135 ms; en GPU consumer se espera una latencia de alrededor de 50-100 ms por token dependiendo de la implementación.
- **Throughput**: no se proporciona un valor específico para GPU, pero en NPU se logra un throughput de 1150 pasos/segundo durante el entrenamiento; en inferencia, el modelo puede generar múltiples tokens en paralelo en hardware adecuado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para otros modelos de la misma categoría (SLM de negociación). Sin embargo, se puede comparar con su base:

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Zyra Agent Closer (Q5_K_M) | 3.08B | no disponible | Apache 2.0 | Negociación y cierre de ventas |
| Qwen2.5-3B (base) | 3.08B | 32K (según documentación de Qwen) | Apache 2.0 | Modelo general de propósito general |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 Community | Modelo general |

El modelo Zyra Agent Closer no ofrece ventajas de contexto sobre su base, pero su fine-tuning específico en ventas lo hace más preciso en ese dominio. No se dispone de datos de benchmarks para comparar directamente con otros modelos de la categoría.

## Limitaciones y advertencias

- **Tamaño del dataset**: el fine-tuning se realizó con solo 2.000 pares de conversación, lo que puede limitar la generalización a escenarios de venta no contemplados.
- **Sesgos potenciales**: al ser entrenado en datos de un solo dominio, puede presentar sesgos hacia el estilo de venta de la empresa o del dataset original.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o no verificada, especialmente en datos específicos de producto o precios.
- **Idiomas**: solo está optimizado para inglés y español; no se recomienda su uso en otros idiomas.
- **Longitud de contexto**: no se especifica la longitud máxima de contexto, por lo que en conversaciones largas puede perder coherencia o exceder el límite.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero no se garantiza que el modelo no contenga información sensible de terceros, aunque se reporta 0% de fugas de PII.
- **Dependencia de hardware**: el rendimiento óptimo se logra en hardware Tenstorrent, aunque es compatible con GPU y CPU convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zyrabit-IA/zyra-agent-closer-Q5_K_M
- Sitio web de Zyrabit: https://www.zyrabit.co.uk/
- Imagen Docker de Zyrabit SLM: https://hub.docker.com/r/zyrabitcore/zyrabit-slm
- GitHub de Zyrabit (no confirmado como oficial): https://github.com/agentzyra/agentzyra (proyecto de trading, no directamente relacionado con este modelo)
