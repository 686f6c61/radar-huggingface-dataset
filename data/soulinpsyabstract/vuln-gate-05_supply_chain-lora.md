# SoulInPsyAbstract/vuln-gate-05_supply_chain-lora

## Resumen

`vuln-gate-05_supply_chain-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por SoulInPsyAbstract como parte de la familia de especialistas `vuln-gate (G15)` del proyecto SIPA OS, dentro del marco de seguridad EilatSecure. Su función es detectar riesgos en la cadena de suministro de software —dependencias vulnerables, versiones sin fijar, paquetes comprometidos— y reportar el hallazgo sin intentar verificar el impacto posterior. Está construido sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, por lo que hereda sus capacidades generales de generación de texto y razonamiento, pero se especializa en seguir un protocolo de "parada dura" (hard stop) tras la detección.

El modelo fue entrenado mediante fine-tuning supervisado (SFT) con 180 ejemplos positivos, usando una configuración LoRA de r=16, alpha=32 y dropout=0.05 sobre las proyecciones q/k/v/o/gate/up/down del transformer base, con cuantización de 4 bits (bitsandbytes) durante el entrenamiento. La relevancia actual radica en su enfoque de seguridad para agentes de IA: refuerza el comportamiento de "detectar y reportar" sin dejar margen a la discreción del modelo para continuar tras el disparo del umbral de vulnerabilidad, un patrón que complementa los gates deterministas en entornos de producción.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el autor advierte que el adaptador no sustituye un gate arquitectónico real y que la detección en producción debe implementarse como código determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA de dimension reducida; el modelo base tiene 7B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en el repo) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) durante entrenamiento; cuantizacion de inferencia no especificada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Qwen2.5-7B-Instruct, un modelo de lenguaje autoregresivo con atención completa. La capa LoRA se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 16, alpha 32 y dropout 0.05. El entrenamiento se realizó con el framework TRL (SFTTrainer/SFTConfig) durante 3 épocas, usando un dataset de 180 ejemplos para este especialista, de los cuales 20 se reservaron para evaluación y nunca se usaron en el entrenamiento.

La característica más destacable es el entrenamiento "positivo solo": el modelo solo ve ejemplos del comportamiento deseado (detectar y reportar, detenerse) y nunca se expone a sus propias racionalizaciones o intentos de escalada como objetivo de entrenamiento, ni siquiera como ejemplos negativos. Esto refuerza el comportamiento de parada sin enseñar patrones de racionalización. No se emplearon técnicas de RLHF ni DPO; es un fine-tuning supervisado puro sobre un subconjunto especializado.

## Capacidades

- Detección de vulnerabilidades en la cadena de suministro: identifica dependencias vulnerables, versiones sin fijar (unpinned) y paquetes potencialmente comprometidos.
- Reporte estructurado: al detectar una vulnerabilidad, genera un informe claro con qué, dónde, severidad y cómo solucionarlo, y se detiene.
- Cumplimiento de protocolo de parada dura: sigue la regla G15 de no continuar tras el disparo del gate, independientemente de la urgencia o autoridad del contexto.
- Generación de texto y razonamiento general: hereda las capacidades del modelo base Qwen2.5-7B-Instruct (conversación, análisis, etc.), aunque el adaptador está orientado a la tarea específica.
- No incluye soporte explícito de tool calling, agentes multi-step ni capacidades multimodales más allá de las del modelo base (que no las tiene por defecto).

## Casos de uso

- Escaneo de dependencias en pipelines de CI/CD: el modelo puede integrarse como un paso de análisis que revise el fichero de dependencias (p. ej. `package.json`, `requirements.txt`) y reporte vulnerabilidades sin intentar explotarlas ni verificar su impacto, reduciendo el riesgo de acciones no deseadas.
- Auditoría de seguridad de repositorios: al analizar un repositorio, el adaptador identifica paquetes con versiones no fijadas o vulnerabilidades conocidas y genera un informe accionable, deteniéndose tras el reporte.
- Asistente para revisión de código en entornos regulados: ayuda a los equipos de seguridad a detectar riesgos de supply chain en pull requests, proporcionando recomendaciones de corrección sin ejecutar comandos adicionales.
- Monitorización de dependencias en aplicaciones desplegadas: el modelo puede revisar listados de dependencias en tiempo real y alertar sobre paquetes comprometidos, cumpliendo el protocolo de no escalar automáticamente.
- Entrenamiento de agentes de seguridad: sirve como componente en sistemas multiagente donde un agente especializado detecta riesgos y otros agentes (o código determinista) deciden las acciones posteriores.
- Evaluación de cumplimiento de políticas de versionado: verifica si las versiones de dependencias están fijadas (pinned) y reporta desviaciones, sin intentar modificar el código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que este especialista fue evaluado en su conjunto de validación retenido (20 ejemplos) antes de fusionarse con sus 5 hermanos en `vuln-gate-merged-qwen25-lora`, pero no se proporcionan métricas numéricas en esta model card.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la informacion disponible. Al ser un adaptador LoRA sobre un modelo de 7B, el hardware necesario es el del modelo base Qwen2.5-7B-Instruct, que típicamente requiere al menos 16 GB de VRAM para inferencia en FP16 y puede ejecutarse en GPUs consumer como RTX 3090/4090 con cuantización. Sin embargo, estos datos no están confirmados por el autor del adaptador, por lo que se recomienda consultar la documentación del modelo base. Las opciones de despliegue habituales para este tipo de adaptadores incluyen la biblioteca `transformers` con `PeftModel`, así como servidores como vLLM o TGI si se fusiona el adaptador con el modelo base.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de vulnerabilidades o adaptadores de seguridad similares. El autor menciona la existencia de la familia `vuln-gate` con 6 especialistas, pero no se detallan diferencias ni se comparan con alternativas externas.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en el comportamiento "positivo" de detener y reportar; no ha visto ejemplos de escalada o racionalización como negativos, lo que podría hacer que el modelo no generalice bien ante intentos de manipulación complejos.
- El autor advierte explícitamente que este LoRA no sustituye un gate arquitectónico determinista: en producción, la detección debe implementarse como código, no como decisión del LLM.
- La detección se limita a riesgos de supply chain; no cubre otros tipos de vulnerabilidades (inyección SQL, XSS, etc.) a menos que se combine con otros especialistas de la familia.
- El conjunto de entrenamiento es pequeño (180 ejemplos), lo que puede limitar la robustez del modelo ante variaciones en el formato de entrada o casos extremos no vistos.
- No se especifican idiomas soportados; aunque el modelo base Qwen2.5-7B-Instruct es multilingüe, el adaptador fue entrenado probablemente con datos en inglés (no confirmado).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de exactitud o idoneidad para entornos de producción críticos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SoulInPsyAbstract/vuln-gate-05_supply_chain-lora
- Experimento completo (EXP-031) y modelo fusionado: https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora
- Proyecto SIPA OS: https://sipa-os.org
