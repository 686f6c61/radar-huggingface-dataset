# Srihari2020/CyberMind-4B-GGUF

## Resumen

CyberMind-4B es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct orientado a ciberseguridad, desarrollado por el usuario Srihari2020 y distribuido en formato GGUF para inferencia local. El modelo se presenta como un "analista SOC de nivel 3" que aplica un marco estructurado de dos fases —análisis central y mitigación táctica— al examinar registros de amenazas. Está pensado para ejecutarse en hardware de consumo con total privacidad, sin enviar datos a servicios en la nube.

El modelo parte de una base de 3.085.938.688 parámetros (etiquetada comercialmente como "4B" pero correspondiente a la familia Qwen2.5-3B) y fue entrenado mediante SFT con Unsloth, usando LoRA de rango 16 y cuantización 4-bit NF4 durante el entrenamiento. El conjunto de datos consta de 2.485 pares de instrucciones de alta calidad derivados de los marcos CISA KEV y MITRE ATT&CK. La longitud de contexto declarada es de 8192 tokens.

Su relevancia radica en la especialización vertical: frente a modelos generalistas, CyberMind-4B prioriza la adherencia a un formato estructurado de análisis de amenazas y la construcción fiable de respuestas finales para centros de operaciones de seguridad. El autor reporta una adherencia de formato del 100 % y una latencia media de 2,04 s por registro en una NVIDIA RTX 5060, con una mejora del 60,4 % en velocidad frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | GGUF (repo de 1,9 GB); entrenamiento en 4-bit NF4 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors como base de referencia) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen2.5-3B-Instruct. El ajuste fino se realizó con el framework Unsloth mediante LoRA con rango r=16 y lora_alpha=32, aplicando cuantización 4-bit NF4 durante el entrenamiento. Se trata de un entrenamiento puramente supervisado (SFT), sin fases de RLHF ni DPO declaradas.

El conjunto de datos de entrenamiento contiene 2.485 pares de instrucciones de alta calidad, generados a partir de los marcos CISA KEV (Known Exploited Vulnerabilities) y MITRE ATT&CK. El autor indica explícitamente que no se incluyeron datos de programación: el énfasis está en la derivación estructurada, la detección de amenazas y la construcción de respuestas finales formateadas para SOC. La innovación principal no es arquitectónica sino de especialización y formato: el modelo fuerza un esquema de dos fases (análisis central y mitigación táctica) en cada respuesta sobre registros de amenazas.

## Capacidades

- Análisis de registros de amenazas (logs) con salida estructurada en dos fases: análisis central y mitigación táctica.
- Detección y clasificación de amenazas alineada con MITRE ATT&CK y vulnerabilidades explotadas conocidas (CISA KEV).
- Construcción de respuestas finales formateadas para flujos de trabajo de SOC.
- Generación de texto conversacional en inglés dentro del dominio de ciberseguridad.
- Alta adherencia a formato: el autor reporta un 100 % de cumplimiento del esquema de salida en sus pruebas.
- No soporta tool calling ni function calling de forma declarada.
- No se declaran capacidades de agente multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).

## Casos de uso

- Triaje de alertas en un SOC: el modelo recibe un registro de amenaza y devuelve un análisis estructurado en dos fases, lo que permite clasificar y priorizar alertas de forma consistente y auditable.
- Enriquecimiento de incidentes con contexto ATT&CK: al estar entrenado sobre MITRE ATT&CK, puede mapear indicadores observados a tácticas y técnicas conocidas, ayudando al analista a contextualizar el ataque.
- Correlación con vulnerabilidades explotadas: su entrenamiento sobre CISA KEV le permite relacionar hallazgos con vulnerabilidades de explotación activa conocida y sugerir mitigaciones tácticas.
- Despliegue local con privacidad estricta: al ejecutarse vía Ollama o llama.cpp en hardware de consumo, permite analizar logs sensibles sin salir del perímetro de la organización.
- Asistencia a analistas junior: actúa como primer nivel de análisis que produce un borrador estructurado que el analista humano revisa y valida, reduciendo el tiempo de respuesta.
- Generación de informes de incidentes: la estructura fija de dos fases facilita la producción de resúmenes homogéneos para documentación y escalado dentro del SOC.
- Pruebas y formación: puede usarse en entornos de laboratorio para simular el análisis de amenazas y entrenar a personal en el uso de marcos como ATT&CK.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Adherencia de formato | 100,0 % | Pruebas del autor |
| Latencia media | 2,04 s por log | NVIDIA RTX 5060 |
| Mejora de velocidad vs base (Qwen2.5) | +60,4 % | Reducción de 3,12 s de latencia |
| Alucinaciones | 0 (declarado) | Pruebas del autor |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores proceden exclusivamente de las pruebas internas del autor y no son verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada: el repo GGUF ocupa 1,9 GB, por lo que la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM en cuantizaciones de 4 bits.
- GPU recomendadas: el autor reporta pruebas en NVIDIA RTX 5060; cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: Ollama (con el Modelfile incluido), llama.cpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: 2,04 s por registro de log en RTX 5060 según el autor; no se dispone de datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| CyberMind-4B | 3,09 B | 8192 | Ciberseguridad / SOC | Apache-2.0 | GGUF |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 (tipico) | Generalista | Apache-2.0 | safetensors, GGUF |
| Modelos de seguridad generalistas | no disponible | no disponible | Generalista | variable | variable |

La comparación directa con otros fine-tunes de ciberseguridad no está disponible en la información proporcionada. Frente a su base Qwen2.5-3B-Instruct, CyberMind-4B sacrifica generalidad y probablemente ventana de contexto a cambio de especialización y adherencia de formato en el dominio SOC.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- El dataset de entrenamiento es reducido (2.485 pares), lo que limita la cobertura de escenarios y aumenta el riesgo de sobreajuste al formato.
- La afirmación de "cero alucinaciones" procede únicamente de pruebas del autor y no ha sido validada de forma independiente; en producción debe asumirse riesgo de alucinación.
- No incluye datos de programación, por lo que no es adecuado para tareas de generación o análisis de código.
- No se declaran capacidades de tool calling, agentes o razonamiento multi-paso; su uso en pipelines automatizados debe diseñarse en torno a su salida estructurada.
- El contexto de 8192 tokens puede ser insuficiente para logs muy extensos o conversaciones multi-turno largas.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones de la licencia del modelo base Qwen2.5-3B-Instruct antes de un uso comercial.
- Modelo con pocas descargas (237) y validación comunitaria escasa; no se recomienda como única línea de defensa sin supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/Srihari2020/CyberMind-4B-GGUF
- Repositorio GitHub: https://github.com/srihari2020/cybermind
- Modelo base: Qwen2.5-3B-Instruct (familia Qwen2.5)
- Marcos de referencia: MITRE ATT&CK (https://attack.mitre.org) y CISA KEV (https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
