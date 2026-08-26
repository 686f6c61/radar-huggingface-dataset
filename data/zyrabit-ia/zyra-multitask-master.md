# Zyrabit-IA/zyra-multitask-master

## Resumen

Zyra Multitask Master es un modelo de lenguaje pequeño (SLM) desarrollado por Zyrabit-IA, presentado como un "master" unificado de cuatro agentes especializados (Hunter, Sentinel, Closer y Strategist) para tareas agénticas B2B en entornos aislados. Se trata de un fine-tuning del modelo base Qwen/Qwen2.5-3B, publicado en formato GGUF con cuantización Q5_K_M, y entrenado sobre hardware Tenstorrent Blackhole p150 NPU. La versión actual es una beta pública (v1.0.0-beta.1-sovereign) orientada a entornos empresariales con requisitos estrictos de privacidad, como redes sin conexión a internet (air-gapped).

El modelo se comercializa como parte de una infraestructura de IA soberana que incluye redacción de PII en memoria, almacén vectorial ChromaDB y observabilidad con Grafana, todo ello desplegable en las instalaciones del cliente. Su relevancia actual reside en la creciente demanda de soluciones de IA locales que no envíen datos a servicios externos, especialmente en sectores regulados. Aunque el modelo base es de solo 3 mil millones de parámetros, el fine-tuning específico para tareas agénticas estructuradas y su capacidad de generar JSON válido lo hacen adecuado para automatización de procesos empresariales con requisitos de trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen2.5-3B) |
| Parametros totales | no disponible (derivado de Qwen2.5-3B, ~3B estimado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | en, es |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q5_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo Qwen2.5-3B, un transformer decoder-only con arquitectura estándar de Qwen. El entrenamiento se realizó sobre un dataset propio llamado `zyra_agents_multitask_master.jsonl`, compuesto por 8.000 pares de instrucciones "sanitizadas" (presumiblemente con datos personales eliminados), y se llevó a cabo en hardware Tenstorrent Blackhole p150 NPU. El proceso de fine-tuning alcanzó un throughput de 1.140,75 pasos por segundo, más de 6.900 veces superior a una CPU. No se especifica si se utilizaron técnicas como RLHF o DPO; la información disponible solo menciona fine-tuning supervisado. El modelo está diseñado para seguir el formato de chat ChatML y requiere tokens de parada estrictos para evitar bucles o salidas no formateadas.

La innovación principal no reside en la arquitectura (heredada de Qwen2.5), sino en el enfoque de entrenamiento orientado a tareas agénticas multi-pipeline, con una capa de redacción de PII en memoria y cumplimiento estricto de esquemas JSON. La versión beta se describe como un "proof-of-concept" con parámetros y plantillas de chat en refinamiento continuo.

## Capacidades

- Generación de texto y respuesta a instrucciones en inglés y español.
- Ejecución de tareas agénticas estructuradas en entornos aislados (air-gapped), con cero egress de red.
- Generación de salidas JSON con cumplimiento de esquema del 100% según las pruebas del autor.
- Redacción de PII en memoria con tasa de fuga del 0% declarada.
- Integración con el ecosistema Zyrabit SLM: almacén vectorial ChromaDB, observabilidad Grafana y perfiles de hardware para NPU Tenstorrent, GPU y CPU.
- Soporte para despliegue mediante Ollama y Docker, con plantilla ChatML personalizada.
- No se menciona soporte explícito de tool calling ni function calling en la documentación disponible.

## Casos de uso

- Automatización de flujos de trabajo B2B con salida JSON estructurada: el modelo puede generar respuestas que cumplen esquemas JSON predefinidos, lo que facilita su integración en pipelines de datos y sistemas de orquestación sin necesidad de parseo adicional.
- Asistentes virtuales para atención al cliente en entornos con datos sensibles: gracias a la redacción de PII en memoria y el aislamiento de red, puede gestionar conversaciones con información personal sin que los datos salgan del perímetro corporativo.
- Procesamiento de documentos privados en sectores regulados (legal, sanitario, financiero): su despliegue local y la ausencia de telemetría externa permiten cumplir normativas de protección de datos como el RGPD.
- Orquestación de agentes internos: el modelo integra cuatro pipelines de agente (Hunter, Sentinel, Closer, Strategist) que pueden asignarse a diferentes fases de un proceso de ventas o soporte, como prospección, verificación, cierre y estrategia.
- Generación de informes y resúmenes en inglés y español: su capacidad multilingüe permite redactar documentación empresarial en ambos idiomas con un solo modelo.
- Despliegue en infraestructura propia con hardware heterogéneo: al estar disponible en GGUF, puede ejecutarse en CPU, GPU convencional o NPU Tenstorrent, lo que lo hace adecuado para entornos con restricciones de hardware.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el autor en la model card y no han sido verificados de forma independiente.

| Benchmark | Metrica | Resultado |
|---|---|---|
| Domain Evaluation Suite | Agent Test Accuracy | 94,2% |
| IFEval | Instruction Following Adherence (Strict Prompt) | 88,5% |
| JSON Schema Validity | Structural Parsing Accuracy | 100,0% |
| PII Redaction Audit | Memory Leakage Rate | 0,0% |
| Air-Gap Network Verification | Outbound Network Packets | 0 bytes |

Además, en hardware Tenstorrent Blackhole p150 NPU se reporta una latencia P95 de 142,5 ms y un throughput de fine-tuning de 1.140,75 pasos/segundo. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 3 mil millones de parámetros cuantizado a Q5_K_M, el archivo GGUF resultante es ligero (típicamente entre 2 y 3 GB), por lo que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, e incluso en CPU con suficiente RAM.
- El autor recomienda el uso del hardware Tenstorrent Blackhole p150 NPU para un rendimiento óptimo, con una latencia P95 de 142,5 ms.
- Para despliegue en producción se sugiere el contenedor Docker oficial `zyrabitcore/zyrabit-slm:2.4.1`, que gestiona automáticamente la redacción de PII, el almacén vectorial y la observabilidad.
- Se puede ejecutar manualmente mediante Ollama, creando un `Modelfile` con la plantilla ChatML y los tokens de parada adecuados.
- No se especifican requisitos mínimos de VRAM ni configuraciones de memoria en la documentación oficial.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. El modelo base Qwen2.5-3B es un punto de referencia natural, pero no se han publicado resultados comparativos. Se puede señalar que, frente al Qwen2.5-3B original, este fine-tuning añade capacidades específicas de agente y redacción de PII, pero sacrifica la versatilidad general del modelo base al estar especializado en tareas B2B estructuradas. Otras alternativas de tamaño similar como Llama 3.2 3B o Phi-3.5-mini no aparecen mencionadas en los materiales del autor.

## Limitaciones y advertencias

- El modelo se encuentra en fase beta (v1.0.0-beta.1-sovereign) y se describe explícitamente como un "proof-of-concept", por lo que su comportamiento en producción puede ser inestable y sujeto a cambios rápidos.
- El dataset de entrenamiento es reducido (8.000 pares), lo que puede limitar la generalización fuera de los dominios cubiertos.
- Solo se soportan dos idiomas (inglés y español); el rendimiento en otros idiomas no está garantizado.
- No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, lo que dificulta la comparación objetiva con otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero al ser una beta no hay garantías de soporte ni de estabilidad.
- El modelo requiere una configuración cuidadosa de la plantilla ChatML y tokens de parada para evitar salidas malformadas o bucles.
- Aunque se declara una tasa de fuga de PII del 0%, esta afirmación no ha sido verificada externamente; en entornos con datos altamente sensibles se recomienda auditar el comportamiento del modelo.
- El modelo no menciona soporte de tool calling, vision ni otras modalidades; su alcance se limita a generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyrabit-IA/zyra-multitask-master
- Repositorio del modelo cuantizado Q5_K_M: https://huggingface.co/Zyrabit-IA/zyra-multitask-master-Q5_K_M
- Organización Zyrabit-IA en Hugging Face: https://huggingface.co/Zyrabit-IA
- Sitio web oficial de Zyrabit: https://www.zyrabit.co.uk/
- Repositorio de infraestructura Zyrabit SLM (GitHub): https://github.com/nosoyprogramad0r/zyrabit-slm
- Docker Hub (imagen del runtime): https://hub.docker.com/r/zyrabitcore/zyrabit-slm
