# VexelQuant/Vexel-RugShield-3B-v1

## Resumen

Vexel-RugShield-3B-v1 es un modelo de lenguaje especializado de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) desarrollado por VexelQuant Research, un laboratorio centrado en infraestructura cuantitativa para cripto y DeFi. El modelo parte de la familia Qwen2 y ha sido alineado mediante SFT y GRPO (Group Relative Policy Optimization) con el objetivo declarado de actuar como auditor determinista de seguridad de contratos inteligentes: detección de honeypots, mints ocultos, trampas de manipulación de comisiones y riesgos de desbloqueo de liquidez (LP unlock).

La propuesta diferencial del autor no es la capacidad generalista, sino la disciplina de formato: según la model card, el modelo produce JSON estricto el 100 % de las veces y cero alucinaciones de Markdown, frente a un 74,2 % de cumplimiento JSON y un 22,8 % de alucinaciones Markdown en el modelo base genérico. Está pensado para integrarse en pipelines de ejecución de alta frecuencia en cripto/DeFi, con prompts de sistema fijos y salidas de 128 tokens como máximo.

Es relevante ahora porque los modelos pequeños y fuertemente alineados para una única tarea crítica (auditoría de bytecode y estado de liquidez) permiten despliegues de baja latencia y bajo coste en infraestructura propia, algo que las APIs de LLM en la nube no ofrecen con garantías de determinismo de formato. No obstante, la model card presenta inconsistencias métricas notables (latencia p50 declarada de 5.579,85 ms frente a la afirmación de pipelines "sub-20ms"), que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tag `qwen2`) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (se cita explícitamente `Q4_K_M`); safetensors en precisión original no especificada |
| Idiomas soportados | No disponible (la model card no declara idiomas; prompts de ejemplo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen2, con 3,09 mil millones de parámetros en pesos safetensors. El autor indica un proceso de alineamiento en dos fases: primero SFT (supervised fine-tuning) y después GRPO (Group Relative Policy Optimization), ambas ejecutadas con la herramienta Unsloth, que optimiza el entrenamiento de modelos pequeños mediante kernels de atención y capas lineales de bajo consumo de memoria. El objetivo del alineamiento es forzar un comportamiento determinista de salida: JSON crudo y válido, sin Markdown, con temperatura recomendada de 0,1 y un máximo de 128 tokens nuevos.

La especialización declarada es la auditoría de seguridad de contratos inteligentes: análisis de fragmentos de bytecode, lógica descompilada, estado de bloqueo de liquidez y autoridades de mint. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de RLHF o DPO más allá del GRPO citado. Tampoco se detalla la longitud de contexto nativa del modelo base Qwen2 empleado.

## Capacidades

- Generación de texto orientada a tareas de auditoría de contratos inteligentes y evaluación de riesgos en cripto/DeFi.
- Salida en JSON estricto como formato por defecto, según la model card con un 100 % de cumplimiento en sus pruebas internas.
- Diagnóstico de honeypots, mints ocultos, trampas de manipulación de comisiones y riesgos de desbloqueo de liquidez (LP unlock).
- Análisis de bytecode y lógica descompilada de contratos.
- Modo determinista: temperatura recomendada de 0,1 y límite de 128 tokens de salida.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües: no disponibles según la información proporcionada.

## Casos de uso

- Auditoría automatizada de tokens previa a la ejecución: el modelo recibe bytecode, lógica descompilada y estado de liquidez, y devuelve un JSON con el diagnóstico de honeypot o mint oculto; su formato determinista permite consumir la salida directamente en un pipeline sin parseo defensivo.
- Filtro de seguridad en routers de DEX y agregadores: integrado como paso previo a la inclusión de un par en la lista de tokens operables, evaluando trampas de comisión y autoridades de mint antes de habilitar el trading.
- Monitorización de riesgos de liquidez: análisis periódico del estado de bloqueo de LP para detectar desbloqueos inminentes y disparar alertas o bloqueos automáticos en el sistema de gestión de riesgo.
- Pre-trade screening en bots de alta frecuencia: con prompts fijos y salidas de 128 tokens, el modelo puede encajarse en la ruta de decisión previa a la orden, siempre que se valide la latencia real en el hardware objetivo (la model card declara cifras contradictorias).
- Generación de informes estructurados para compliance: producción de fichas JSON de riesgo por contrato que alimentan paneles internos o registros de auditoría, aprovechando la ausencia de Markdown y la adherencia estricta al esquema.
- Despliegue local con llama.cpp/GGUF en infraestructura propia: la versión cuantizada Q4_K_M permite ejecutar el modelo en servidores modestos o GPUs de consumo, manteniendo los datos de análisis dentro de la infraestructura del operador.

## Benchmarks y rendimiento

La model card incluye una tabla de "benchmarks operativos" comparando el modelo alineado con un modelo base genérico y una API de LLM en la nube. No se especifican los conjuntos de evaluación, el hardware ni la metodología, por lo que los datos deben interpretarse con cautela.

| Métrica | VexelQuant alineado | Modelo base genérico | API de LLM en la nube |
|---|---|---|---|
| Latencia p50 | 5.579,85 ms | 115,0 ms | 920,0 ms |
| Latencia p95 | 5.835,66 ms | 185,0 ms | 1.450,0 ms |
| Cumplimiento JSON estricto | 100,0 % | 74,2 % | 91,5 % |
| Alucinaciones de Markdown | 0,0 % | 22,8 % | 8,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las latencias declaradas para el modelo alineado (más de 5,5 segundos en p50) contradicen la afirmación de la propia model card de pipelines de ejecución "sub-20ms", lo que sugiere un error de medición o de redacción en la documentación del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 6,2 GB solo para pesos (3,09 B × 2 bytes), más overhead de KV cache y activaciones; presupuesto práctico de 8-10 GB.
- VRAM estimada en cuantización Q4_K_M (GGUF): aproximadamente 2 GB para pesos, con margen para contexto y overhead; viable en GPUs de 4-6 GB.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con vLLM; RTX 4090, RTX 3090 o RTX 4080 para inferencia local en FP16; GPUs de consumo de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) suficientes en Q4_K_M.
- Cabe en GPU de consumo: sí, tanto en FP16 en GPUs de 12 GB o más como en Q4_K_M en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM (documentado por el autor), llama.cpp/llama-cli (documentado por el autor con GGUF), y por compatibilidad de formato también cabría Ollama o TGI, aunque no se documentan explícitamente.
- Latencia y throughput: la model card declara p50 de 5.579,85 ms y p95 de 5.835,66 ms, pero sin especificar hardware ni configuración; no hay datos fiables de throughput (tokens/s).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de benchmarks estándar para este modelo, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad. Las alternativas indicadas son modelos pequeños de propósito general de la misma familia y tamaño.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Vexel-RugShield-3B-v1 | 3,09 B | No disponible | Apache 2.0 | Auditoría cripto/DeFi, JSON determinista | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Qwen2.5-3B | 3,09 B | 32.768 tokens (versión base Qwen2.5) | Apache 2.0 (mayoría de variantes) | Propósito general | HuggingFace, ampliamente adoptado |
| Llama-3.2-3B | 3,21 B | 131.072 tokens | Llama 3.2 Community License | Propósito general | HuggingFace, ampliamente adoptado |
| Phi-3.5-mini | 3,82 B | 131.072 tokens | MIT | Propósito general | HuggingFace, ampliamente adoptado |

La ventaja declarada de Vexel-RugShield-3B-v1 frente a estos modelos es la disciplina de formato JSON y la ausencia de Markdown, no la capacidad generalista ni el contexto. No hay datos públicos que permitan verificar esa ventaja de forma independiente.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está alineado para auditoría de contratos y evaluación de riesgos cripto; su rendimiento en tareas generales de texto, código o matemáticas no está documentado y probablemente sea inferior al de su modelo base.
- Inconsistencias en la model card: la latencia p50 declarada (5.579,85 ms) contradice la afirmación de pipelines "sub-20ms"; conviene validar el rendimiento real en el hardware objetivo antes de producción.
- Riesgo de alucinación en dominios fuera de su especialización: la métrica de "0,0 % de alucinaciones Markdown" solo cubre el formato, no la veracidad del diagnóstico de seguridad.
- Sin datos de sesgos: no se ha publicado información sobre sesgos, composición del dataset de entrenamiento ni evaluación de robustez frente a entradas adversariales.
- Idiomas no declarados: la model card no especifica idiomas soportados; los prompts de ejemplo están en inglés, por lo que el uso en castellano no está validado.
- Longitud de contexto no disponible: no se puede asumir una ventana amplia para bytecode o lógica descompilada extensa; el límite de 128 tokens de salida también restringe la profundidad del análisis.
- Licencia Apache 2.0: permite uso comercial, pero el autor ofrece licencias personalizadas y pesos a medida para integraciones privadas, lo que sugiere que la versión pública puede no incluir todas las capacidades comerciales.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni validación externa; no hay evidencia independiente de su calidad.
- Uso en producción financiera: cualquier decisión de trading basada en sus salidas debe pasar por validación humana y controles de riesgo adicionales; un falso negativo en la detección de honeypots puede tener consecuencias económicas directas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VexelQuant/Vexel-RugShield-3B-v1
- Sitio web del autor: https://vexelquant.me
- GitHub del autor: https://github.com/VexelQuant
- Contacto para despliegues: founder@vexelquant.me
