# SoulInPsyAbstract/vuln-gate-04_infra_misconfig-lora

## Resumen

`vuln-gate-04_infra_misconfig-lora` es un adaptador LoRA de detección de vulnerabilidades, especializado en configuraciones erróneas de infraestructura (puertos abiertos, grupos de seguridad permisivos, falta de TLS). Forma parte de la familia de seis especialistas `vuln-gate (G15)` desarrollada por SoulInPsyAbstract dentro del proyecto SIPA OS (EilatSecure), orientado a la seguridad de agentes de IA. El modelo está entrenado sobre el base `Qwen/Qwen2.5-7B-Instruct` mediante fine-tuning supervisado positivo (SFT) con TRL, y su objetivo es detectar y reportar una vulnerabilidad, deteniéndose de inmediato sin explorar más allá del hallazgo.

La relevancia de este adaptador radica en su enfoque de "hard stop": el modelo aprende a reportar la vulnerabilidad y a no continuar con acciones adicionales, incluso bajo presión contextual. Esto complementa un patrón de seguridad más amplio (EXP-023, patrón de compuerta binaria L06/G15) donde la detección en producción debe ser código determinista y no una decisión del LLM. El adaptador tiene un tamaño de 0.1 GB y se distribuye bajo licencia Apache 2.0, con formato de pesos safetensors y compatible con la librería PEFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA, tamaño de repo 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredado del modelo base, no especificado) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) durante entrenamiento; el adaptador puede usarse con el base en cualquier precisión |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato PEFT (adapter) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Qwen2.5-7B-Instruct, un transformer causal de 7 mil millones de parámetros. La capa LoRA utiliza r=16, alpha=32, dropout=0.05 y se aplica a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con cuantización de 4 bits (bitsandbytes) durante 3 épocas, usando el `SFTTrainer`/`SFTConfig` de TRL con supervisión positiva únicamente: el modelo solo ve ejemplos del comportamiento deseado (detectar y reportar, detenerse) y nunca se entrena con textos de escalada o racionalización, ni siquiera como ejemplos negativos.

El conjunto de datos de entrenamiento consta de 180 ejemplos para este especialista, de los cuales 20 se reservaron para evaluación y no se usaron en el entrenamiento. El entrenamiento refuerza el comportamiento de "stop-and-report" según el protocolo G15: si se encuentra una vulnerabilidad, se devuelve FALSE (detención) sin margen de decisión. La metodología es una práctica de refuerzo a nivel de entrenamiento, no un sustituto de una compuerta arquitectónica real en producción.

## Capacidades

- Detección de configuraciones erróneas de infraestructura: puertos abiertos, grupos de seguridad permisivos, falta de TLS, entre otros.
- Reporte estructurado de la vulnerabilidad encontrada: qué, dónde, severidad y cómo corregirla.
- Aplicación de una regla de "hard stop": tras detectar una vulnerabilidad, el modelo se detiene y no continúa con acciones adicionales, incluso si se le presiona con urgencia, autoridad, costo hundido o "ya que lo encontré".
- Especialización en el dominio de seguridad de agentes, complementando a otros cinco especialistas de la familia vuln-gate.
- Generación de texto en formato de instrucción (text-generation pipeline), compatible con el ecosistema Hugging Face Transformers.

No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso general, visión o audio.

## Casos de uso

- Auditoría de seguridad de infraestructura en entornos CI/CD: el modelo puede analizar configuraciones de red (security groups, reglas de firewall) y reportar hallazgos sin profundizar en explotación, integrándose en pipelines de escaneo estático.
- Asistente de revisión de código para equipos DevOps: detecta misconfiguraciones comunes en archivos de infraestructura como Terraform, CloudFormation o Docker, y sugiere correcciones.
- Monitoreo continuo de entornos cloud: el adaptador puede procesar logs o descripciones de estado de recursos y alertar sobre puertos abiertos o TLS deshabilitado, deteniéndose tras cada alerta.
- Entrenamiento de agentes de seguridad con comportamiento seguro: sirve como componente de un agente más grande que debe cumplir la política de "detectar y detener", evitando escaladas no autorizadas.
- Evaluación de cumplimiento normativo: ayuda a verificar que la infraestructura cumple políticas de seguridad básicas (por ejemplo, TLS obligatorio), generando informes de cumplimiento.
- Investigación en seguridad de LLM: permite estudiar el efecto del entrenamiento positivo en la reducción de comportamientos de escalada en modelos de lenguaje, como parte del proyecto EilatSecure.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que este especialista fue evaluado en su conjunto de validación retenido (20 ejemplos) antes de fusionarse con los otros cinco hermanos en el adaptador `vuln-gate-merged-qwen25-lora`, donde se presenta una tabla de regresión de seguridad antes/después de la fusión, pero los números concretos no están incluidos en la información proporcionada.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 7B, la VRAM necesaria depende de la precisión del modelo base. Con cuantización de 4 bits (como en el entrenamiento), se puede ejecutar en GPUs con al menos 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Con el base en FP16, se recomienda al menos 14-16 GB (RTX 4080, A10, etc.).
- GPU recomendadas: para inferencia en producción, una A10, A100 o RTX 4090 ofrece margen suficiente. Para pruebas locales, cualquier GPU consumer con ≥8 GB de VRAM es viable con cuantización.
- El adaptador en sí ocupa solo 0.1 GB, por lo que el cuello de botella es el modelo base.
- Opciones de despliegue: al ser un modelo PEFT, se puede cargar con `transformers` y `peft` en cualquier framework compatible (vLLM, TGI, etc.) siempre que soporten adaptadores LoRA. También puede fusionarse con el base para usar llama.cpp u Ollama, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles, dependen del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es parte de una familia de seis especialistas (vuln-gate), y su comparación directa se realiza con sus hermanos (por ejemplo, otros especialistas en diferentes tipos de vulnerabilidades) y con el adaptador fusionado `vuln-gate-merged-qwen25-lora`. No se mencionan alternativas externas de detección de misconfiguraciones basadas en LoRA.

## Limitaciones y advertencias

- El modelo está entrenado con un conjunto de datos muy pequeño (180 ejemplos), lo que puede limitar su generalización a configuraciones no vistas o a variaciones del lenguaje.
- El entrenamiento positivo solo refuerza el comportamiento de detención, pero no garantiza que el modelo no genere respuestas de escalada en situaciones no cubiertas por el entrenamiento. El propio autor advierte que no debe sustituir a una compuerta arquitectónica determinista en producción.
- La detección de vulnerabilidades se limita a configuraciones erróneas de infraestructura; no cubre otros tipos de vulnerabilidades (inyección, desbordamiento, etc.) que son competencia de otros especialistas de la familia.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede reportar falsos positivos o interpretar erróneamente configuraciones complejas.
- No se especifican idiomas soportados; el modelo base Qwen2.5-7B-Instruct tiene capacidades multilingües, pero el adaptador fue entrenado probablemente en inglés (no confirmado).
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las políticas del modelo base (Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales).
- El adaptador está diseñado para un contexto de agente de seguridad; su uso fuera de ese contexto (por ejemplo, como generador de texto general) no está validado y puede producir resultados inconsistentes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SoulInPsyAbstract/vuln-gate-04_infra_misconfig-lora)
- [Registro del experimento EXP-031 y adaptador fusionado](https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora)
- [Sitio del proyecto SIPA OS](https://sipa-os.org)
