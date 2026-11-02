# srandev/siem-triage-9b-th

## Resumen

siem-triage-9b-th es un modelo de lenguaje especializado en el triaje de registros de seguridad (SIEM/SOC) para tailandés, desarrollado por el usuario srandev como un fine-tune LoRA del modelo base Qwen/Qwen3.5-9B. Su función es leer registros en bruto de WAF (nginx + ModSecurity) y NDR (Zeek) y devolver un informe de incidente estructurado en JSON que incluye categoría, severidad, evidencias clave, IPs implicadas, un resumen y una acción recomendada, ambos en tailandés.

El modelo ocupa la posición intermedia de una familia de tres tamaños (4B, 9B y 35B) y está pensado para entornos SOC reales donde se necesita equilibrar precisión y consumo de memoria. Con 9.409.813.744 parámetros y un peso de repositorio de 18,8 GB en safetensors, está diseñado para desplegarse con vLLM mediante una API compatible con OpenAI y con salida estructurada forzada por JSON schema.

Su relevancia actual radica en la combinación de tres factores: especialización vertical en ciberseguridad, soporte nativo de tailandés (un idioma con poca cobertura en modelos de seguridad) y un diseño explícito de resistencia a la inyección de instrucciones en los registros analizados, ya que el modelo se entrena para no obedecer órdenes embebidas en el log y responder únicamente con JSON.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-9B), fine-tune mediante LoRA |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de despliegue recomendada (`--max-model-len 8192`); longitud máxima de entrenamiento 6.144 tokens |
| Tipos de cuantización | FP8 (≈12 GB según la model card); no se detallan otras variantes |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parámetros, y se adapta mediante LoRA con rango 16 aplicado a las capas de atención, a `linear_attn` y a `shared_expert`. El entrenamiento consistió en una única época con longitud máxima de secuencia de 6.144 tokens. La model card menciona explícitamente los módulos `linear_attn` y `shared_expert`, lo que sugiere que el modelo base incorpora componentes de atención lineal y de mezcla de expertos con experto compartido, aunque no se detalla la arquitectura interna completa del base.

Los datos de entrenamiento combinan registros de sistemas reales, previamente pseudonimizados de forma sistemática (IPs, dominios, nombres y tokens sustituidos por valores ficticios como `*.example`), con tareas SOC sintéticas. Las respuestas fueron redactadas y revisadas conforme a una guía de anotación definida. El autor declara haber verificado la ausencia de fugas: los datos de entrenamiento no contienen dominios ni nombres de organizaciones reales, y el modelo no revela dominios reales ni la tabla de correspondencia entre valores reales y pseudónimos cuando se le interroga. No se especifica el número total de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Triaje de WAF: clasificación en las categorías `blocked_by_firewall`, `blocked_by_waf`, `passed_no_impact`, `passed_needs_review`, `false_positive` y `benign`.
- Triaje de NDR: clasificación en `intel_inbound/outbound_*`, `internal_scan`, `external_ssh_login`, `protocol_anomaly`, `perimeter_drop`, `noise` y `benign`.
- Asignación de severidad en una escala de `info` a `critical`.
- Extracción de evidencias clave (`key_evidence`) e IPs implicadas.
- Generación de resumen (`summary_th`) y acción recomendada (`action_th`) en tailandés.
- Distinción de falsos positivos operativos: administradores, crawlers, balizas de CDN y enlaces compartidos frente a ataques reales.
- Restricción de no recomendar el bloqueo de IPs internas.
- Salida estructurada en JSON conforme a un esquema definido.
- Resistencia a inyección de instrucciones: el modelo está entrenado para no ejecutar órdenes embebidas en el log y responder solo con JSON.
- Soporte de razonamiento configurable mediante `chat_template_kwargs={"enable_thinking": false}` y parser de razonamiento `qwen3`.
- Capacidad multimodal declarada en los tags (`image-text-to-text`), aunque el despliegue recomendado desactiva imagen y vídeo (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Bilingüe tailandés-inglés, con salida principal en tailandés.

## Casos de uso

- Triaje automatizado de alertas WAF en un SOC: el modelo recibe el registro en bruto de nginx + ModSecurity envuelto en `<UNTRUSTED_LOG_DATA>` y devuelve un JSON con categoría, severidad y acción recomendada, lo que permite priorizar la cola de alertas antes de la revisión humana.
- Análisis de tráfico NDR con Zeek: clasifica eventos como escaneos internos, inicios de sesión SSH externos, anomalías de protocolo o caídas de perímetro, y separa el ruido de los incidentes que requieren investigación.
- Reducción de falsos positivos: identifica tráfico legítimo de administradores, crawlers y balizas de CDN que suele disparar alertas, evitando escalados innecesarios y bloqueos erróneos de IPs internas.
- Enriquecimiento de tickets y alertas: el campo `summary_th` y `action_th` en tailandés permite generar directamente el texto de escalado para analistas tailandeses, reduciendo el tiempo de redacción manual.
- Integración en pipelines SIEM/SOAR: al exponerse con vLLM mediante API compatible con OpenAI y salida JSON validable por esquema, puede conectarse a sistemas de orquestación que consuman el informe estructurado para abrir casos o enrutarlos.
- Formación y apoyo a analistas junior: el modelo sirve como asistente de primera línea que propone una clasificación y una acción justificada, que el analista valida antes de actuar.
- Procesamiento por lotes de registros históricos: con un rendimiento medido de 1,39 casos por segundo a concurrencia 16, es viable reprocesar volúmenes moderados de registros para auditoría o ajuste de reglas de detección.

## Benchmarks y rendimiento

Resultados publicados en la model card (ronda 3, conjunto de prueba de 1.377 casos de log):

| Modelo | Casos que pasan todos los criterios | Velocidad (c=16) | Veredicto SOC (público / conjunto B) |
|---|---|---|---|
| 4B | 94,3% | 2,02 casos/s | 68,6% / 78,1% |
| 9B (este modelo) | 93,6% | 1,39 casos/s | 70,0% / 86,0% |
| 35B | 94,4% | 1,09 casos/s | 84,7% / 90,6% |

El modelo de 9B alcanza un 93,6% de cumplimiento de todos los criterios de triaje, con un veredicto SOC del 70,0% en el conjunto público y del 86,0% en el conjunto B. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB en FP8 según la model card; en precisión completa (BF16) el peso de 9.400 millones de parámetros requiere del orden de 18-19 GB solo para los pesos, más memoria para KV cache.
- La model card menciona una tarjeta de aproximadamente 24 GB como referencia para el despliegue en FP8 con margen de contexto.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, encajan GPUs de 24 GB o más (por ejemplo, A10G, L4 en configuraciones ajustadas, RTX 4090, A100 o H100 para mayor concurrencia).
- Cabe en GPU de consumo con 24 GB de VRAM en FP8; en BF16 requiere GPUs de gama profesional o superior.
- Despliegue recomendado: vLLM con API compatible con OpenAI, usando `--served-model-name siem --max-model-len 8192 --reasoning-parser qwen3 --limit-mm-per-prompt '{"image":0,"video":0}'`. No se documentan opciones para llama.cpp, Ollama o TGI.
- Rendimiento medido: 1,39 casos por segundo con concurrencia 16.
- Parámetros de inferencia recomendados: `temperature=0`, `enable_thinking: false` y salida estructurada con JSON schema.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Veredicto SOC (público / B) | Velocidad (c=16) | Licencia |
|---|---|---|---|---|---|
| siem-triage-9b-th (este) | 9,41B | 8.192 (despliegue) | 70,0% / 86,0% | 1,39 casos/s | Apache-2.0 |
| siem-triage-4b (misma familia) | no disponible | no disponible | 68,6% / 78,1% | 2,02 casos/s | no disponible |
| siem-triage-35b (misma familia) | no disponible | no disponible | 84,7% / 90,6% | 1,09 casos/s | no disponible |

No se dispone de información sobre modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó con tráfico de un único entorno; formatos de log diferentes pueden requerir ajuste de prompt y reevaluación.
- El tailandés puede presentar degradación ocasional en la salida.
- Aunque los datos de entrenamiento fueron pseudonimizados, un modelo fine-tune puede memorizar patrones del conjunto de entrenamiento.
- No está diseñado para decidir bloqueos o respuestas automáticas sin revisión humana; toda salida debe pasar por aprobación de un analista.
- La ventana de contexto de despliegue recomendada es de 8.192 tokens, inferior a la de muchos modelos generalistas, lo que limita el análisis de registros muy extensos en una sola pasada.
- El soporte de idiomas se limita a tailandés e inglés; no se garantiza un rendimiento adecuado en castellano.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-9B y conviene verificar las condiciones de este último.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.
- No se publican resultados en benchmarks estándar de conocimiento general ni de código, lo que impide comparar su calidad fuera del dominio de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/srandev/siem-triage-9b-th
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
