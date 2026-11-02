# srandev/siem-triage-4b-th

## Resumen

siem-triage-4b-th es un modelo de lenguaje especializado en el triaje de registros de seguridad (SIEM/SOC) para tailandés, desarrollado por el usuario srandev. Se trata de un fine-tune mediante LoRA sobre Qwen/Qwen3.5-4B, con 4.539.265.536 parámetros totales, orientado a leer registros crudos de WAF (nginx + ModSecurity) y NDR (Zeek) y devolver un informe de incidente en formato JSON con categoría, severidad, resumen y acción recomendada en tailandés.

El modelo forma parte de una familia de tres tamaños (4B, 9B y 35B), siendo esta la variante más pequeña, pensada para entornos con memoria limitada (aproximadamente 8 GB de VRAM en FP8). Su propuesta de valor es doble: por un lado, automatiza la clasificación de eventos de seguridad con un esquema de salida estructurado y verificable; por otro, incorpora un diseño explícito de resistencia a la inyección de instrucciones presente en los propios registros, ya que el modelo se entrena para no obedecer órdenes embebidas en el log y responder únicamente con JSON.

La relevancia actual del modelo radica en su enfoque práctico para equipos SOC que operan en tailandés y necesitan preclasificar grandes volúmenes de alertas antes de la revisión humana. No obstante, su alcance es acotado: fue entrenado sobre el tráfico de un único entorno, no está destinado a decisiones automáticas de bloqueo y sus resultados deben pasar siempre por aprobación de un analista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B) con adaptadores LoRA; incluye atención lineal y expertos compartidos (shared_expert) según la configuración de entrenamiento |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (valor configurado en el ejemplo de despliegue con vLLM); longitud máxima de entrenamiento: 6144 tokens |
| Tipos de cuantizacion | FP8 (aproximadamente 5,2 GB según la model card); no se detallan otros formatos |
| Idiomas soportados | tailandés (th) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer multimodal de la familia Qwen3.5 (etiquetado como image-text-to-text en HuggingFace), aunque el fine-tune se orienta exclusivamente a generación de texto. El ajuste se realizó con LoRA de rango 16 aplicado a las capas de atención, atención lineal y expertos compartidos, durante 1 época y con una longitud máxima de secuencia de 6144 tokens. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de que combina registros de sistemas reales pseudonimizados y tareas SOC sintéticas, con respuestas redactadas y revisadas según una guía de corrección definida.

La innovación técnica destacable es el tratamiento de seguridad del propio proceso de entrenamiento y de inferencia: los datos reales se pseudonimizaron de forma consistente (IP, dominios, nombres y tokens sustituidos por valores ficticios como `*.example`) antes del entrenamiento, y se verificó que no quedaran dominios ni nombres de organización reales. Además, el modelo se entrena para tratar el contenido del log como datos no confiables, delimitados por `<UNTRUSTED_LOG_DATA>...</UNTRUSTED_LOG_DATA>`, y para no ejecutar instrucciones embebidas en ellos. No se menciona el uso de RLHF o DPO.

## Capacidades

- Triaje de WAF: clasificación en categorías `blocked_by_firewall`, `blocked_by_waf`, `passed_no_impact`, `passed_needs_review`, `false_positive` y `benign`.
- Triaje de NDR: clasificación en `intel_inbound/outbound_*`, `internal_scan`, `external_ssh_login`, `protocol_anomaly`, `perimeter_drop`, `noise` y `benign`.
- Generación de informes JSON estructurados con severidad (de `info` a `critical`), evidencia clave (`key_evidence`), IPs implicadas, resumen en tailandés (`summary_th`) y acción recomendada (`action_th`).
- Distinción de falsos positivos operativos: administradores, crawlers, balizas de CDN y enlaces compartidos frente a ataques reales.
- Restricción explícita de no recomendar el bloqueo de IPs internas.
- Resistencia a inyección de instrucciones en los registros analizados.
- Soporte de salida estructurada mediante JSON schema y modo sin razonamiento (`enable_thinking: false`).
- Capacidad multilingüe limitada a tailandés e inglés.
- No se documentan capacidades de tool calling, uso de agentes ni visión en el fine-tune, pese a que el modelo base sea multimodal.

## Casos de uso

- Preclasificación de alertas en un SOC: el modelo procesa registros crudos de WAF y NDR y devuelve un JSON con categoría y severidad, lo que permite priorizar la cola de revisión de los analistas y reducir el volumen de alertas que llegan a revisión manual.
- Filtrado de falsos positivos en WAF: distingue tráfico legítimo de administradores, crawlers y balizas de CDN de intentos de ataque reales, etiquetando los casos como `false_positive` o `benign` para evitar escalados innecesarios.
- Enriquecimiento de tickets de seguridad: el campo `summary_th` y `action_th` en tailandés permite generar automáticamente la descripción del incidente y la recomendación de actuación en la herramienta de ticketing del equipo.
- Análisis de tráfico NDR con contexto de inteligencia: clasifica conexiones entrantes y salientes marcadas por inteligencia, escaneos internos y anomalías de protocolo, aportando evidencia clave e IPs implicadas para la investigación.
- Automatización de informes periódicos: con `temperature=0` y salida JSON validada por esquema, el modelo puede integrarse en pipelines que generen resúmenes estructurados de eventos por turno o por día.
- Despliegue en entornos con recursos limitados: al ocupar aproximadamente 5,2 GB en FP8, puede ejecutarse en una GPU de 8 GB y servir como primera capa de triaje antes de derivar los casos complejos a los modelos de 9B o 35B de la misma familia.
- Formación y simulación de analistas: al producir clasificaciones y recomendaciones estructuradas, puede usarse como asistente en entornos de práctica con registros sintéticos, siempre con supervisión humana.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la ronda 3 de evaluación sobre un conjunto de 1.377 casos de log:

| Modelo | Triaje correcto (todos los criterios) | Velocidad (c=16) | Veredicto SOC (público / conjunto B) |
|---|---|---|---|
| 4B (este modelo) | 94,3 % | 2,02 casos/s | 68,6 % / 78,1 % |
| 9B | 93,6 % | 1,39 casos/s | 70,0 % / 86,0 % |
| 35B | 94,4 % | 1,09 casos/s | 84,7 % / 90,6 % |

El modelo de 4B es el más rápido de la familia (2,02 casos/s con concurrencia 16) y mantiene un triaje correcto del 94,3 %, aunque su veredicto SOC es notablemente inferior al de 35B (68,6 % frente a 84,7 % en el conjunto público). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,2 GB en FP8 según la model card; en precisión completa (BF16) se situaría en torno a 9 GB para los pesos, más el espacio de caché KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP8; para mayor concurrencia o contexto completo de 8192 tokens conviene disponer de 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más (por ejemplo, RTX 3070/4060 Ti de 8 GB en FP8, con margen ajustado).
- Opciones de despliegue: vLLM con endpoint compatible con OpenAI (comando documentado en la model card), con `--max-model-len 8192`, `--reasoning-parser qwen3` y limitación de modalidades multimedia a cero. No se documentan instrucciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,02 casos/s con concurrencia 16 según la evaluación del autor; no se publican latencias por petición ni métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Triaje correcto | Veredicto SOC (público / B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| siem-triage-4b-th | 4,54 B | 8192 | 94,3 % | 68,6 % / 78,1 % | Apache-2.0 | HuggingFace |
| siem-triage-9b-th | no disponible | no disponible | 93,6 % | 70,0 % / 86,0 % | no disponible | misma familia |
| siem-triage-35b-th | no disponible | no disponible | 94,4 % | 84,7 % / 90,6 % | no disponible | misma familia |

Las alternativas de la misma categoría (triaje de logs de seguridad) fuera de esta familia no están documentadas en la información disponible. Los dos modelos de la familia comparados pertenecen al mismo autor y comparten el mismo conjunto de evaluación, por lo que la comparación es internamente consistente pero no permite contrastar con soluciones de terceros.

## Limitaciones y advertencias

- Entrenado sobre el tráfico de un único entorno: formatos de log distintos pueden requerir ajuste del prompt y una reevaluación completa antes de su uso en producción.
- El tailandés puede presentar errores ocasionales de fluidez o corrección lingüística.
- Riesgo de memorización: aunque los datos de entrenamiento se pseudonimizaron, un modelo fine-tune puede retener patrones del corpus; el autor verificó la ausencia de dominios y nombres reales, pero no es una garantía absoluta.
- No apto para decisiones automáticas de bloqueo o respuesta: la model card indica explícitamente que toda salida debe pasar por la aprobación de un analista.
- El veredicto SOC en el conjunto público (68,6 %) es notablemente inferior al de los modelos mayores de la familia, por lo que los casos complejos deberían derivarse a las variantes de 9B o 35B.
- El modelo base es multimodal, pero el fine-tune está orientado a texto; el despliegue recomendado desactiva explícitamente las entradas de imagen y vídeo.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en entornos distintos al de entrenamiento.
- No se documentan sesgos lingüísticos o culturales específicos más allá de la limitación al tailandés y al inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/srandev/siem-triage-4b-th
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
