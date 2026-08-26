# Zyrabit-IA/zyra-agent-strategist

## Resumen

Zyra Agent Strategist es un modelo de lenguaje pequeño (SLM) de 3 000 millones de parámetros, desarrollado por Zyrabit-IA (Zyrabit Architecture Labs) como parte de su motor de IA soberana. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-3B, especializado en tareas de estrategia de cuentas y gestión ejecutiva: generación de dossiers para niveles C, modelado de ROI y redacción de informes ejecutivos. La versión publicada es una beta pública (`v1.0.0-beta.1-sovereign`) concebida como prueba de concepto, entrenada sobre silicio NPU Tenstorrent Blackhole p150 y orientada a entornos B2B aislados y con requisitos estrictos de privacidad.

El modelo destaca por su enfoque en soberanía de datos: está diseñado para ejecutarse en infraestructura local o nube privada, con verificación de aislamiento de red (cero paquetes salientes) y una tasa de fuga de PII declarada del 0 %. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su formato GGUF (cuantización Q5_K_M) lo hace desplegable en hardware modesto. La relevancia actual radica en la creciente demanda de modelos pequeños, especializados y auditables para sectores regulados como banca, gobierno y sanidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-3B) |
| Parametros totales | 3 000 millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | Inglés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q5_K_M) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-3B, un transformer decoder-only con normalización RMSNorm, atención con sesgo de posición y ventana de contexto estándar de la serie Qwen2.5. El ajuste fino se realizó sobre el conjunto de datos propietario `zyra_agent_strategist.jsonl`, compuesto por 2 000 pares de instrucción-respuesta sanitizados, con trazabilidad completa mediante checksum SHA-256 (etiqueta `ds-v1.0.0-2000pairs`). El entrenamiento se ejecutó en hardware NPU Tenstorrent Blackhole p150, alcanzando un throughput declarado de 1 165,10 pasos por segundo (más de 6 900 veces superior a CPU) y una latencia P95 de 130,2 ms en inferencia.

La model card no especifica si se emplearon técnicas como RLHF o DPO; se menciona únicamente el ajuste fino supervisado. El modelo está preparado para generar salidas con esquema JSON estricto (validez declarada del 100 %) e incorpora mecanismos de redacción de PII en memoria, aunque no se detallan los métodos concretos. Para su uso manual se requiere la plantilla ChatML con tokens de parada específicos, tal como se indica en las instrucciones de integración.

## Capacidades

- Generación de dossiers ejecutivos para niveles C (C-level) con estructura formal y datos de negocio.
- Modelado de ROI y análisis de rentabilidad para propuestas de cuentas.
- Redacción de informes ejecutivos (briefs) con formato profesional.
- Cumplimiento estricto de esquemas JSON: validez estructural declarada del 100 %.
- Seguimiento de instrucciones complejas: puntuación IFEval Strict Prompt del 92,1 %.
- Precisión en dominio específico: exactitud del 97,1 % en el conjunto de evaluación de dominio.
- Redacción de datos personales (PII) con tasa de fuga declarada del 0 %.
- Soporte multilingüe para inglés y español.
- Diseñado para tareas agénticas B2B en entornos aislados (air-gapped) con cero egress de red.

## Casos de uso

- Generación automatizada de dossiers para reuniones de dirección: el modelo produce documentos estructurados con análisis de cuentas, métricas clave y recomendaciones, listos para presentar a comités ejecutivos. Su especialización en este dominio reduce el tiempo de preparación de horas a minutos.
- Modelado de ROI en propuestas comerciales: permite calcular y redactar proyecciones de retorno de inversión personalizadas para cada cliente, integrando datos de la cuenta y generando salidas en formato JSON para su consumo por otras herramientas.
- Informes ejecutivos periódicos: automatiza la redacción de briefs semanales o mensuales de estado de cuentas, con resúmenes de avances, riesgos y próximos pasos, manteniendo un tono y estructura consistentes.
- Agentes de atención al cliente en sectores regulados: al ejecutarse en local y con aislamiento de red, puede gestionar consultas de clientes en banca o sanidad sin enviar datos a la nube, cumpliendo normativas de privacidad.
- Integración en pipelines de datos estructurados: su capacidad de generar JSON válido al 100 % lo hace adecuado para alimentar sistemas de CRM o ERPs con salidas procesables directamente.
- Automatización de cumplimiento y auditoría: en entornos gubernamentales o financieros, el modelo puede redactar informes de cumplimiento o resúmenes de transacciones con verificación de PII cero, facilitando auditorías internas.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card y no han sido verificados de forma independiente (marcados como `verified: false`).

| Benchmark | Métrica | Resultado |
|---|---|---|
| Domain Evaluation Suite | Exactitud en dominio agéntico | 97,1 % |
| IFEval | Seguimiento estricto de instrucciones | 92,1 % |
| JSON Schema Validity | Validez estructural de JSON | 100 % |
| PII Redaction Audit | Tasa de fuga de PII | 0,0 % |
| Air-Gap Network Verification | Paquetes de red salientes | 0 bytes |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia local en CPU: el modelo cuantizado Q5_K_M (aproximadamente 2 GB) puede ejecutarse en CPU con 8 GB de RAM, aunque con latencia mayor.
- GPU consumer: cabe en GPUs con 6-8 GB de VRAM, como RTX 3060, RTX 4060 o superiores. Se recomienda al menos 8 GB para ventanas de contexto amplias.
- GPU profesional: puede desplegarse en A10, A100 o H100 si se requiere mayor throughput o procesamiento por lotes.
- NPU Tenstorrent Blackhole p150: hardware objetivo del entrenamiento, con latencia P95 declarada de 130,2 ms.
- Opciones de despliegue: Ollama (recomendado por el autor), llama.cpp (para GGUF), Docker mediante la imagen `zyrabitcore/zyrabit-slm:2.4.1`, o el stack completo de Zyrabit con perfiles de Tenstorrent.
- Throughput: no se proporcionan cifras de tokens por segundo para hardware estándar; solo se indica la latencia P95 en NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Zyra Agent Strategist | 3B | No disponible | Apache 2.0 | Estrategia de cuentas, soberanía de datos | GGUF (Q5_K_M) |
| Qwen2.5-3B (base) | 3B | 32 768 tokens | Apache 2.0 | Modelo general | Safetensors, GGUF |
| Llama 3.2 3B | 3B | 128 000 tokens | Llama 3.2 Community | Modelo general | Safetensors, GGUF |
| Phi-3.5-mini | 3,8B | 128 000 tokens | MIT | Razonamiento, código | Safetensors, GGUF |

Zyra Agent Strategist se diferencia por su especialización en un dominio vertical concreto y por su énfasis en despliegue aislado y privacidad. Sin embargo, carece de la versatilidad de los modelos generales y su rendimiento en tareas estándar (MMLU, HumanEval, etc.) no ha sido publicado.

## Limitaciones y advertencias

- Estado beta: la versión `v1.0.0-beta.1-sovereign` es una prueba de concepto en desarrollo activo; los parámetros y plantillas pueden cambiar sin aviso.
- Conjunto de datos reducido: el entrenamiento se realizó con solo 2 000 pares, lo que limita la generalización a dominios fuera de la estrategia de cuentas.
- Benchmarks no verificados: los resultados de exactitud e IFEval están marcados como no verificados por terceros.
- Longitud de contexto no especificada: no se indica la ventana máxima soportada, lo que dificulta estimar su uso en conversaciones largas.
- Requisito de plantilla ChatML: si se usa manualmente, es imprescindible configurar la plantilla y los tokens de parada para evitar bucles de generación.
- Sesgos y alucinaciones: al ser un modelo pequeño y especializado, puede generar contenido plausible pero incorrecto en temas fuera de su dominio; se recomienda validación humana.
- Sin soporte de visión ni audio: es exclusivamente un modelo de texto.
- Aislamiento de red: aunque se declara cero egress, la verificación depende del entorno de despliegue; el usuario debe confirmar la configuración de red.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyrabit-IA/zyra-agent-strategist
- Archivo GGUF Q5_K_M: https://huggingface.co/Zyrabit-IA/zyra-agent-strategist-Q5_K_M
- Organización Zyrabit-IA en Hugging Face: https://huggingface.co/Zyrabit-IA
- Documentación de Zyrabit SLM: https://docs.zyrabit.com/docs/
- Repositorio de infraestructura en GitHub: https://github.com/Zyrabit-tech/zyrabit-SLM
- Sitio web de Zyrabit: https://www.zyrabit.com/
- Imagen Docker: https://hub.docker.com/r/zyrabitcore/zyrabit-slm
