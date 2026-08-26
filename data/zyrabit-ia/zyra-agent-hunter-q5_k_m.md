# Zyrabit-IA/zyra-agent-hunter-Q5_K_M

# Zyra Agent Hunter (Q5_K_M)

## Resumen

Zyra Agent Hunter es un modelo de lenguaje pequeño (SLM) especializado en generación de leads, outreach en frío y enriquecimiento de contactos, desarrollado por Zyrabit Architecture Labs como parte de su plataforma Sovereign AI. Se trata de un fine-tuning del modelo base Qwen2.5-3B, cuantizado en formato GGUF Q5_K_M, diseñado para ejecutarse en entornos on-premise y air-gapped, sin dependencia de servicios externos.

El modelo aborda el problema de la automatización de prospección comercial en industrias reguladas (banca, sanidad, sector público), donde la soberanía de datos es crítica. Su relevancia actual radica en la creciente demanda de agentes de IA que operen localmente con total trazabilidad y sin fuga de información. Con 3.085.938.688 parámetros y una ventana de contexto no especificada en la documentación oficial, ofrece un equilibrio entre rendimiento y despliegue en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, base Qwen2.5-3B) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la documentación oficial (heredada de Qwen2.5-3B) |
| Tipos de cuantización | Q5_K_M (GGUF) |
| Idiomas soportados | Inglés (en), Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-3B, con atención causal estándar. Ha sido fine-tuned por Zyrabit Architecture Labs sobre un dataset propio de 2.000 pares de instrucción-respuesta sanitizados, denominado `zyra_agent_hunter.jsonl`, con trazabilidad SHA-256 y etiqueta de lineage `ds-v1.0.0-2000pairs`. El entrenamiento se realizó sobre hardware Tenstorrent Blackhole NPU (p150), alcanzando un throughput de 1.180,20 pasos por segundo.

No se han publicado detalles sobre técnicas de alineación adicionales (RLHF, DPO) ni sobre la composición exacta del dataset más allá del recuento de pares. La documentación declara una tasa de fuga de PII del 0,0 % y una verificación de red air-gap con 0 bytes de tráfico saliente, lo que sugiere un entrenamiento y despliegue diseñados para entornos aislados.

## Capacidades

- Generación de texto especializada en prospección comercial: redacción de emails de outreach en frío, mensajes de seguimiento y propuestas de valor.
- Scoring de cuentas objetivo (ICP - Ideal Customer Profile): evaluación y priorización de leads según criterios definidos.
- Enriquecimiento de contactos: estructuración de información de prospectos en formatos JSON válidos.
- Cumplimiento estricto de esquemas JSON: el modelo declara un 100 % de cumplimiento en validación de esquemas JSON.
- Soporte de tool calling: integración con API REST y pipelines de automatización (compatible con endpoints de chat completions).
- Capacidades multilingües limitadas a inglés y español.
- Sin modo de pensamiento (thinking) explícito ni capacidades de visión o audio.

## Casos de uso

- Automatización de prospección B2B: el modelo puede generar listas de leads segmentados a partir de descripciones de mercado objetivo, aplicando scoring ICP directamente en el prompt.
- Redacción de emails de cold outreach: genera mensajes personalizados con tono adaptado al sector del destinatario, reduciendo el tiempo de preparación de campañas.
- Enriquecimiento de bases de datos de contactos: dado un nombre y empresa, produce una ficha estructurada en JSON con datos de contacto y contexto.
- Agentes de ventas en entornos regulados: se integra en plataformas locales (como el stack Zyrabit SLM) para gestionar conversaciones multi-turno sin enviar datos a la nube.
- Validación de cumplimiento en comunicación comercial: su tasa de fuga de PII del 0 % lo hace adecuado para generar contenido de marketing que no revele información sensible.
- Sistemas de scoring de leads en pipelines de CRM: mediante tool calling, puede clasificar leads según criterios predefinidos y devolver resultados estructurados para su consumo por otros sistemas.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el autor en la model card y no están verificados de forma independiente:

| Benchmark | Métrica | Resultado |
|---|---|---|
| Domain Accuracy & Instruction Adherence | Domain Test Accuracy | 96,5 % |
| Instruction Following (IFEval) | IFEval Strict Prompt | 92,1 % |
| JSON Schema Validity | Estructura de parsing | 100,0 % |
| PII Redaction Audit | Tasa de fuga de memoria | 0,0 % |
| Air-Gap Network Verification | Paquetes de red salientes | 0 bytes (aislamiento 100 %) |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la documentación proporcionada. Los datos de latencia y throughput se limitan a la ejecución sobre NPU Tenstorrent Blackhole (latencia P95 de 128 ms).

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado Q5_K_M de 3B parámetros ocupa aproximadamente 2 GB en memoria, por lo que es ejecutable en GPU con 4 GB de VRAM o en CPU con 8 GB de RAM.
- GPU recomendadas: RTX 3060 (8 GB) o superior; también compatible con tarjetas integradas de 8 GB. Para despliegue en producción, se recomienda al menos una GPU con 12 GB de VRAM para acomodar contexto largo.
- En CPU: se puede ejecutar con llama.cpp en sistemas de 16 GB de RAM sin problemas de rendimiento para uso interactivo.
- Aceleración específica: el autor declara soporte nativo para NPU Tenstorrent Blackhole (p150), con throughput de 1.180,20 pasos/segundo en entrenamiento.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptación a GGUF), y servidores REST compatibles con la API de OpenAI (p. ej., llama.cpp server).
- Latencia: en NPU Tenstorrent, la latencia P95 es de 128 ms; en CPU consumer se espera una latencia mayor, dependiendo de la longitud de la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Zyra Agent Hunter (Q5_K_M) | 3B | No disponible (Qwen2.5 base) | Apache 2.0 | Lead gen, outreach, JSON | GGUF en HuggingFace |
| Qwen2.5-3B (base) | 3B | 32K (estándar) | Apache 2.0 | Generalista | Safetensors, GGUF |
| Llama 3.2 3B | 3B | 128K | Meta Llama 3 Community License | Generalista | Safetensors, GGUF |
| Phi-3.5-mini | 3.8B | 128K | MIT | Razonamiento, código | Safetensors, GGUF |

La comparativa se centra en el tamaño de parámetros y licencia; no se dispone de benchmarks comparables publicados para el modelo Zyra Agent Hunter. El modelo base Qwen2.5-3B ofrece una ventana de contexto de 32K, pero no se ha confirmado que esta se haya preservado en el fine-tuning.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está optimizado para tareas de lead gen y outreach, por lo que su rendimiento en tareas generalistas o técnicas puede ser inferior al del modelo base Qwen2.5-3B.
- Dataset de entrenamiento limitado: solo 2.000 pares de instrucción-respuesta, lo que puede provocar sobreajuste a patrones específicos y baja generalización fuera del dominio.
- Idiomas limitados: solo inglés y español; no soporta otros idiomas sin degradación.
- Riesgo de alucinación: como cualquier modelo pequeño, puede generar información ficticia sobre contactos o empresas, especialmente en tareas de enriquecimiento.
- Validación de benchmarks: los resultados de precisión (96,5 % y 92,1 %) son auto-declarados y no verificados de forma independiente; no se han publicado comparativas con otros modelos.
- Contexto no especificado: no se ha documentado la longitud de contexto efectiva tras el fine-tuning, lo que puede afectar a tareas de generación larga.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de precisión o cumplimiento legal en entornos regulados; la responsabilidad recae en el usuario.

## Enlaces

- HuggingFace: https://huggingface.co/Zyrabit-IA/zyra-agent-hunter-Q5_K_M
- Zyrabit web oficial: https://www.zyrabit.co.uk/
- Zyrabit (alternativa): https://www.zyrabit.com/
- Zyrabit GitHub: https://github.com/Zyrabit-tech
- Zyrabit Docs: https://docs.zyrabit.com/docs/
- Repositorio Zyrabit SLM (referencia): https://github.com/nosoyprogramad0r/zyrabit-slm
