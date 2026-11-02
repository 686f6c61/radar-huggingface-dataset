# srandev/siem-triage-35b-th

## Resumen

siem-triage-35b-th es un modelo de lenguaje especializado en triaje de eventos de seguridad (SIEM/SOC) para tailandés, desarrollado por el usuario srandev. Se trata de un fine-tune mediante LoRA sobre el modelo base Qwen/Qwen3.6-35B-A3B, una arquitectura Mixture of Experts (MoE) con 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos. El modelo lee logs en bruto de WAF (nginx + ModSecurity) y NDR (Zeek) y devuelve un informe de incidente en formato JSON con categoría, severidad, evidencia clave, IPs implicadas, resumen y acción recomendada, todo en tailandés.

El problema que resuelve es concreto: automatizar la primera fase del triaje en un centro de operaciones de seguridad, distinguiendo tráfico legítimo mal etiquetado (administradores, crawlers, balizas de CDN, enlaces compartidos) de ataques reales, y evitando recomendar el bloqueo de IPs internas. Es la variante de mayor tamaño de una familia de tres modelos (4B, 9B y 35B), y según la model card es la más precisa en tareas SOC y de mapeo MITRE ATT&CK, además de la destinada a uso en producción.

Su relevancia actual radica en la combinación de un modelo base MoE eficiente (solo ~3B activos por token) con un dominio muy vertical y un formato de salida estrictamente estructurado. El modelo está entrenado para no obedecer instrucciones embebidas en los logs y para responder únicamente JSON, lo que lo hace apto para pipelines automatizados con validación por esquema. La licencia Apache-2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5 MoE, tag `qwen3_5_moe`), fine-tune LoRA |
| Parametros totales | 35.107.181.936 |
| Parametros activos | ~3B (según model card: "MoE, active ~3B") |
| Longitud de contexto | 8192 tokens (configuración recomendada de despliegue); entrenamiento con max length 6144 |
| Tipos de cuantizacion | FP8 (~35 GB según model card); otras cuantizaciones no disponibles |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos (MoE) que activa aproximadamente 3.000 millones de parámetros por token sobre un total de 35.107 millones. El fine-tune se realizó con LoRA de rango 16 aplicado a las capas de atención, a `linear_attn` y a los expertos compartidos (`shared_expert`), durante 1 época y con una longitud máxima de secuencia de 6144 tokens. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de que combina logs de sistemas reales pseudonimizados con tareas SOC sintéticas.

Los datos de entrenamiento son logs reales sometidos a un proceso de pseudonimización sistemática: IPs, dominios, nombres y tokens se sustituyen por valores ficticios (por ejemplo, `*.example`) antes del entrenamiento. Las respuestas fueron redactadas y revisadas conforme a una guía de anotación definida. El autor declara haber verificado la ausencia de fugas de datos: no quedan dominios ni nombres de organizaciones reales en el conjunto de entrenamiento y el modelo no revela dominios reales ni la tabla de mapeo entre valores reales y ficticios cuando se le pregunta. No se documenta el uso de RLHF o DPO.

La innovación técnica principal no está en la arquitectura, sino en el diseño del prompt y del entrenamiento: el modelo está entrenado para tratar el contenido de los logs como datos no confiables (envolviéndolos en `<UNTRUSTED_LOG_DATA>...</UNTRUSTED_LOG_DATA>`) y para no ejecutar instrucciones inyectadas en ellos, respondiendo exclusivamente con JSON validable contra un esquema.

## Capacidades

- Triaje de WAF: clasifica eventos en `blocked_by_firewall`, `blocked_by_waf`, `passed_no_impact`, `passed_needs_review`, `false_positive` y `benign`.
- Triaje de NDR: clasifica en `intel_inbound`/`outbound_*`, `internal_scan`, `external_ssh_login`, `protocol_anomaly`, `perimeter_drop`, `noise` y `benign`.
- Asignación de severidad en una escala de `info` a `critical`.
- Extracción de evidencia clave (`key_evidence`) e IPs relevantes.
- Generación de resumen (`summary_th`) y acción recomendada (`action_th`) en tailandés.
- Distinción de falsos positivos operativos: administradores, crawlers, balizas de CDN y enlaces compartidos.
- Restricción aprendida de no recomendar el bloqueo de IPs internas.
- Salida estructurada en JSON compatible con validación por esquema.
- Resistencia a inyección de prompts a través del contenido de los logs.
- Capacidad multimodal declarada por el pipeline (`image-text-to-text`), aunque el despliegue recomendado desactiva imagen y vídeo (`--limit-mm-per-prompt '{"image":0,"video":0}'`), por lo que en la práctica se usa como modelo de texto.
- Soporte de modo thinking del modelo base, desactivable mediante `chat_template_kwargs={"enable_thinking": false}`.

## Casos de uso

- Triaje automatizado de alertas WAF en un SOC: el modelo recibe el log en bruto de nginx + ModSecurity y devuelve categoría, severidad y acción recomendada en JSON, lo que permite encolar automáticamente las alertas por prioridad antes de la revisión humana.
- Análisis de tráfico NDR con Zeek: clasifica conexiones y eventos de red (escaneos internos, logins SSH externos, anomalías de protocolo) y separa el ruido de los incidentes que requieren investigación.
- Reducción de falsos positivos: identifica patrones de administradores, crawlers legítimos, balizas de CDN y enlaces compartidos que suelen disparar alertas, evitando que consuman tiempo del analista.
- Generación de informes de incidente en tailandés: produce `summary_th` y `action_th` listos para incorporar a un ticket o a un panel de operaciones, con el idioma nativo del equipo analista.
- Enriquecimiento con RAG sobre MITRE ATT&CK: la model card indica soporte para complementar el triaje con recuperación de técnicas MITRE, requiriendo alrededor de 48 GB de VRAM o más en FP8.
- Automatización de pipelines de correlación: al emitir JSON estrictamente estructurado, la salida se puede validar contra un esquema y encadenar con sistemas de ticketing, SOAR o bases de datos de incidentes sin post-procesado complejo.
- Defensa frente a inyección de prompts en logs: al tratar el log como datos no confiables, el modelo puede desplegarse sobre fuentes de log potencialmente manipuladas por un atacante sin que este consiga alterar la respuesta.
- Asistencia al analista de nivel 1: actúa como primera capa de clasificación con temperatura 0, dejando la decisión final de bloqueo o respuesta a la aprobación humana.

## Benchmarks y rendimiento

La model card publica resultados de la ronda 3 sobre un conjunto de prueba de 1.377 casos de log, comparando las tres variantes de la familia:

| Modelo | Casos que pasan todos los criterios | Velocidad (c=16) | Veredicto SOC (público / conjunto B) |
|---|---|---|---|
| 4B | 94,3 % | 2,02 casos/s | 68,6 % / 78,1 % |
| 9B | 93,6 % | 1,39 casos/s | 70,0 % / 86,0 % |
| 35B (este modelo) | 94,4 % | 1,09 casos/s | 84,7 % / 90,6 % |

El modelo de 35B obtiene la mayor precisión en veredicto SOC (84,7 % en el conjunto público y 90,6 % en el conjunto B) a costa de la menor velocidad de la familia (1,09 casos/s con concurrencia 16). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 35 GB en FP8 según la model card; para uso con RAG sobre MITRE ATT&CK se recomiendan 48 GB o más.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con al menos 48 GB para el despliegue con RAG; una RTX 4090 (24 GB) no es suficiente en FP8 según los requisitos indicados.
- No cabe en GPUs de consumo con 24 GB o menos en la cuantización documentada.
- Despliegue recomendado con vLLM en modo compatible con OpenAI: `vllm serve srandev/siem-triage-35b-th --served-model-name siem --max-model-len 8192 --reasoning-parser qwen3 --limit-mm-per-prompt '{"image":0,"video":0}'`.
- Throughput medido: 1,09 casos/s con concurrencia 16 en la configuración de prueba del autor.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI, ni latencias por petición individual.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Veredicto SOC (público / B) | Velocidad (c=16) | Licencia |
|---|---|---|---|---|---|
| siem-triage-35b-th | 35,1B totales, ~3B activos | 8192 (despliegue) | 84,7 % / 90,6 % | 1,09 casos/s | Apache-2.0 |
| siem-triage-9b (misma familia) | 9B | no disponible | 70,0 % / 86,0 % | 1,39 casos/s | no disponible |
| siem-triage-4b (misma familia) | 4B | no disponible | 68,6 % / 78,1 % | 2,02 casos/s | no disponible |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B totales, ~3B activos | no disponible | no disponible | no disponible | Apache-2.0 |

La comparación con modelos de triaje SIEM de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó con tráfico de un único entorno; formatos de log distintos pueden requerir ajuste de prompt y reevaluación.
- El tailandés puede presentar degradación ocasional en la salida.
- Aunque los datos se pseudonimizaron, un modelo fine-tune puede memorizar patrones del conjunto de entrenamiento.
- No está diseñado para decidir bloqueos o respuestas automáticas sin revisión humana; toda salida debería pasar por la aprobación de un analista.
- El modelo solo cubre tailandés e inglés; no se declara soporte para otros idiomas.
- La ventana de contexto de despliegue recomendada es de 8192 tokens, menor que la de muchos modelos generalistas, lo que limita el análisis de logs muy extensos en una sola petición.
- Riesgo de alucinación no cuantificado en la información disponible; la salida JSON estructurada y la temperatura 0 mitigan parcialmente el problema, pero no lo eliminan.
- Sesgos específicos no documentados; al entrenarse sobre tráfico de un entorno concreto, puede estar sesgado hacia los patrones de ese entorno.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.6-35B-A3B y conviene verificar las condiciones de este último.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/srandev/siem-triage-35b-th
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
