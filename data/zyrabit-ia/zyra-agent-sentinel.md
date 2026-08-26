# Zyrabit-IA/zyra-agent-sentinel

## Resumen

Zyra Agent Sentinel es un modelo de lenguaje pequeño (SLM) de 3 000 millones de parámetros, especializado en tareas de auditoría de seguridad, cumplimiento normativo y validación de procesos B2B. Desarrollado por Zyrabit Architecture Labs (Zyrabit-IA), este modelo es un fine-tuning del base Qwen/Qwen2.5-3B, entrenado sobre un conjunto de 2 000 pares de instrucciones sanitizadas y optimizado para ejecutarse en hardware Tenstorrent Blackhole NPU. Su objetivo principal es ofrecer una alternativa soberana y aislada (air-gapped) para entornos regulados donde no se permite la salida de datos.

El modelo se distribuye en formato GGUF con cuantización Q5_K_M, lo que permite su ejecución en hardware de consumo, y está diseñado para generar salidas JSON estructuralmente válidas con una tasa de fuga de datos personales (PII) declarada del 0 %. Su relevancia actual radica en la creciente demanda de soluciones de IA que garanticen la soberanía de los datos, especialmente en sectores como banca, salud y administración pública, donde la privacidad y el cumplimiento son críticos. Aunque se encuentra en fase beta (v1.0.0-beta.1-sovereign), el modelo ya presenta métricas internas prometedoras en precisión de dominio y adherencia a instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3 000 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del base Qwen2.5-3B) |
| Tipos de cuantizacion | GGUF Q5_K_M (única publicada) |
| Idiomas soportados | Ingles, espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

Zyra Agent Sentinel parte del modelo base Qwen2.5-3B, un transformer decoder-only con atención causal y mecanismos estándar de Qwen2.5. El fine-tuning se realizó sobre un dataset propio denominado `zyra_agent_sentinel.jsonl`, compuesto por 2 000 pares de instrucciones y respuestas, específicamente diseñados para tareas de auditoría de seguridad, validación BANT, mitigación de riesgos y redacción de datos personales. El entrenamiento se llevó a cabo en hardware Tenstorrent Blackhole p150 NPU, alcanzando un throughput de 1 205,40 pasos por segundo, más de 6 900 veces superior al de una CPU de referencia.

No se menciona el uso de técnicas de RLHF o DPO; el proceso parece ser un fine-tuning supervisado convencional. Una innovación destacable es el énfasis en la generación de JSON estructuralmente válido (100 % de cumplimiento declarado) y la implementación de una capa de redacción de PII en memoria, que garantiza cero fugas de datos personales. El modelo requiere el formato de chat ChatML con tokens de parada estrictos para evitar bucles de generación o salidas malformadas.

## Capacidades

- Generación de texto estructurado en formato JSON, con validación de esquema (100 % de cumplimiento declarado).
- Auditoría de seguridad y cumplimiento normativo en dominios específicos (BANT, mitigación de riesgos, validación de procesos).
- Redacción automática de datos personales (PII) con tasa de fuga declarada del 0 %.
- Adherencia a instrucciones complejas (IFEval 92,1 % en modo estricto).
- Soporte multilingüe para inglés y español.
- Ejecución en entornos aislados (air-gapped) sin tráfico de red saliente.
- Integración con el ecosistema Zyrabit (Docker, ChromaDB, Grafana, MCP bridge) para despliegue empresarial.

## Casos de uso

- Auditoría de transacciones financieras: el modelo puede analizar registros de operaciones y generar informes de cumplimiento en JSON, validando automáticamente si se cumplen los criterios BANT o las políticas internas. Su capacidad de redacción de PII lo hace adecuado para entornos bancarios con requisitos estrictos de privacidad.
- Cumplimiento normativo en salud: análisis de historiales clínicos y generación de diagnósticos preliminares dentro de la red hospitalaria, sin enviar datos a la nube, respetando leyes locales de protección de datos.
- Validación de leads en ventas B2B: el modelo puede evaluar conversaciones o formularios y determinar si un cliente potencial cumple los criterios BANT (presupuesto, autoridad, necesidad, tiempo), emitiendo una puntuación estructurada.
- Redacción de datos personales en documentos: procesamiento de archivos o textos para eliminar información sensible (nombres, DNI, direcciones) antes de su publicación o compartición, con una tasa de fuga declarada del 0 %.
- Agentes de seguridad en entornos aislados: despliegue como agente autónomo dentro de infraestructuras críticas (por ejemplo, redes eléctricas o gubernamentales) para auditar logs y alertar sobre anomalías, sin conexión externa.
- Generación de informes de cumplimiento regulatorio: producción automática de reportes en formato JSON que cumplen esquemas predefinidos, reduciendo el tiempo de elaboración manual en departamentos de compliance.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el autor en la model card y no han sido verificados de forma independiente:

| Benchmark | Metrica | Resultado |
|---|---|---|
| Domain Accuracy & Instruction Adherence | Domain Test Accuracy | 98,0 % |
| IFEval | Strict Prompt | 92,1 % |
| JSON Schema Validity | Structural Parsing Accuracy | 100,0 % |
| PII Redaction Audit | Memory Leakage Rate | 0,0 % |
| Air-Gap Network Verification | Outbound Network Packets | 0 bytes |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3B parámetros cuantizado a Q5_K_M, requiere aproximadamente 2,5-3 GB de VRAM para inferencia, por lo que es ejecutable en GPUs de consumo con 4-8 GB.
- GPUs recomendadas: RTX 3060, RTX 4060, RTX 4090, así como GPUs de datacenter como A10 o A100. También soporta aceleración nativa en Tenstorrent Blackhole p150 NPU.
- Ejecución en CPU: posible mediante llama.cpp u Ollama, con latencias mayores (el autor reporta 122,5 ms P95 en NPU, no en CPU).
- Opciones de despliegue: Ollama (con Modelfile personalizado), llama.cpp, vLLM (si se convierte a safetensors), y el stack Docker oficial de Zyrabit (que incluye ChromaDB, Grafana y MCP bridge).
- Latencia y throughput: en NPU Tenstorrent, latencia P95 de 122,5 ms; no se proporcionan datos para otros hardware.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados contra otros modelos. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Zyra Agent Sentinel | 3B | No disponible | Apache 2.0 | Auditoría de seguridad y cumplimiento |
| Qwen2.5-3B (base) | 3B | 32k (no confirmado en fuentes) | Apache 2.0 | Modelo generalista |
| Llama 3.2 3B | 3B | 128k (no confirmado en fuentes) | Llama 3.2 Community | Modelo generalista |

La comparación directa no es posible sin datos de rendimiento estandarizados. Zyra Agent Sentinel se distingue por su especialización en dominios de seguridad y su diseño para entornos aislados, pero su rendimiento en tareas generales probablemente sea inferior al del modelo base Qwen2.5-3B debido al fine-tuning específico.

## Limitaciones y advertencias

- El modelo se encuentra en fase beta (v1.0.0-beta.1-sovereign) y es un PoC; puede contener errores o comportamientos inesperados.
- El dataset de entrenamiento es pequeño (2 000 pares), lo que puede limitar la generalización a dominios no cubiertos.
- Solo soporta inglés y español; no hay evidencia de capacidades multilingües más amplias.
- Requiere el formato ChatML y tokens de parada estrictos; un uso incorrecto puede provocar bucles de generación o salidas no estructuradas.
- No se han realizado evaluaciones independientes de los benchmarks declarados; los resultados deben interpretarse con cautela.
- Aunque se declara cero fuga de PII, esta métrica depende del contexto de uso y no está garantizada en todos los escenarios.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incorpora componentes del ecosistema Zyrabit (Docker, MCP) que pueden tener términos adicionales.
- No se proporciona información sobre sesgos o alucinaciones específicas; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyrabit-IA/zyra-agent-sentinel
- Organización Zyrabit-IA en Hugging Face: https://huggingface.co/Zyrabit-IA
- Sitio web oficial: https://www.zyrabit.com/ (y https://www.zyrabit.co.uk/)
- Repositorio de infraestructura: https://github.com/Zyrabit-tech/zyrabit-SLM
- Docker Hub (imagen del runtime): https://hub.docker.com/r/zyrabitcore/zyrabit-slm
- Modelo hermano (zyra-agent-strategist): https://huggingface.co/Zyrabit-IA/zyra-agent-strategist-Q5_K_M
