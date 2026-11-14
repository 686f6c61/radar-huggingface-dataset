# Srihari2020/CyberMind-4B-GGUF

## Resumen

CyberMind-4B es un ajuste fino (fine-tune) especializado en ciberseguridad del modelo base Qwen2.5-3B-Instruct, desarrollado por el usuario Srihari2020 y publicado en Hugging Face bajo licencia Apache 2.0. A pesar del "4B" del nombre, los pesos reales en safetensors declaran 3.085.938.688 parámetros, coherentes con el modelo base Qwen2.5-3B. El modelo se distribuye en formato GGUF, lo que lo hace ejecutable localmente con llama.cpp u Ollama sin necesidad de GPU de gama alta.

El modelo está diseñado para actuar como analista de SOC (Security Operations Center) de nivel Tier-3, aplicando un marco estructurado de dos fases: Fase 1 (análisis central de la amenaza) y Fase 2 (mitigación táctica). Se entrenó con Unsloth mediante SFT (supervised fine-tuning) puro sobre 2.485 pares de instrucciones derivados de los marcos CISA KEV y MITRE ATT&CK, sin datos de código. Su propuesta de valor es el despliegue local con privacidad total para el análisis de logs de seguridad.

Es relevante por su enfoque vertical: en lugar de competir en capacidades generales, optimiza la adherencia a formato estructurado y la detección de amenazas en logs. Sin embargo, el proyecto es de muy reciente creación (noviembre de 2026), con solo 6 descargas y 1 like, y la model card contiene afirmaciones de rendimiento no verificadas de forma independiente, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (≈3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (según model card) |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas); entrenamiento en 4-bit NF4 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,9 GB); safetensors reportados en metadatos |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar. El ajuste fino se realizó con Unsloth usando LoRA con rango r=16 y lora_alpha=32, sobre cuantización 4-bit NF4. El entrenamiento consistió en SFT puro (sin RLHF ni DPO declarados) sobre un dataset de 2.485 pares de instrucción de alta calidad, construidos a partir de los marcos CISA KEV (Known Exploited Vulnerabilities) y MITRE ATT&CK. No se incluyeron datos de programación; el énfasis fue la derivación estructurada, la detección de amenazas y la construcción de respuestas finales formateadas para SOC.

La innovación principal no es arquitectónica sino de formato: el modelo fuerza un esquema de respuesta en dos fases (análisis central y mitigación táctica) que facilita el parseo automático en pipelines de seguridad. La model card menciona una ventana de contexto de 8192 tokens, coherente con el modelo base, aunque no se documenta si se extendió durante el entrenamiento. No se detallan el número total de tokens de entrenamiento, la composición exacta del dataset ni técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Análisis de logs de seguridad y detección de amenazas con salida estructurada en dos fases (análisis y mitigación).
- Clasificación y derivación de indicadores basados en MITRE ATT&CK y CISA KEV.
- Generación de respuestas formateadas para SOC con alta adherencia a plantilla (el autor afirma 100 % de adherencia en su evaluación).
- Razonamiento multi-paso limitado al dominio de ciberseguridad (cadena de análisis → mitigación).
- Conversación multi-turno en inglés.
- No soporta tool calling ni function calling de forma declarada.
- No dispone de modo thinking explícito, visión, audio ni capacidades multimodales.
- Capacidades multilingües: solo inglés.
- No entrenado para generación de código.

## Casos de uso

- Triaje de alertas en un SOC: el modelo recibe un log o alerta y devuelve un análisis en dos fases (qué ocurre y cómo mitigarlo), lo que permite integrarlo en un pipeline que parsee la respuesta y abra tickets automáticamente.
- Enriquecimiento de incidentes con MITRE ATT&CK: dado un evento, el modelo puede mapearlo a tácticas y técnicas del framework, ayudando al analista a contextualizar la amenaza.
- Priorización de vulnerabilidades: usando conocimiento derivado de CISA KEV, puede ayudar a clasificar CVEs por explotación conocida y sugerir mitigaciones tácticas.
- Asistente local para analistas junior: al ejecutarse con Ollama en hardware consumer, permite consultas privadas sobre logs sensibles sin enviar datos a la nube.
- Generación de informes de incidente estructurados: su formato fijo de dos fases facilita la producción de resúmenes consistentes para documentación y cumplimiento.
- Formación y simulación: puede usarse en entornos de entrenamiento para practicar el análisis de logs y la respuesta a incidentes con retroalimentación estructurada.
- Filtrado previo en pipelines de detección: como primera pasada para descartar falsos positivos antes de escalar a un analista humano, dado su bajo coste de inferencia local.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes datos, no verificados de forma independiente:

| Metrica | Valor reportado | Notas |
|---|---|---|
| Adherencia a formato | 100,0 % | Según el autor |
| Latencia media | 2,04 s por log | En NVIDIA RTX 5060 |
| Mejora vs base (Qwen2.5) | +60,4 % de velocidad | Reducción de 3,12 s de latencia |
| Alucinaciones | "Cero" (afirmación del autor) | No verificable |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card y carecen de metodología detallada o comparación reproducible.

## Requisitos de hardware

- VRAM estimada: con cuantización GGUF Q4, el modelo (≈3,09 B parámetros) ocupa aproximadamente 2 GB de pesos; en Q8, en torno a 3,5 GB; en FP16, unos 6,2 GB.
- Cabe en GPU consumer: sí, en tarjetas con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 5060, etc.).
- GPU recomendadas: el autor cita una RTX 5060; cualquier GPU con ≥6 GB de VRAM es suficiente para Q4/Q5. Para FP16 se recomienda ≥8 GB.
- Despliegue: Ollama (documentado en la model card con `Modelfile`), llama.cpp por ser GGUF. vLLM y TGI no están documentados para este repo.
- Latencia y throughput: el autor reporta 2,04 s por log en RTX 5060; no se especifica throughput agregado ni latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberMind-4B | ≈3,09 B | 8192 | Ciberseguridad / SOC | Apache 2.0 | GGUF en HF |
| Qwen2.5-3B-Instruct (base) | ≈3,09 B | 32768 (según modelo base) | Propósito general | Apache 2.0 | Múltiples formatos |
| Modelos de seguridad genéricos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con su modelo base Qwen2.5-3B-Instruct, que ofrece mayor contexto (32768 tokens frente a los 8192 declarados aquí) y capacidades generales, pero no está especializado en formato SOC. No se dispone de información sobre otros fine-tunes de ciberseguridad comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Proyecto muy reciente y con escasa tracción: 6 descargas y 1 like; sin validación comunitaria ni revisión independiente.
- Las afirmaciones de "cero alucinaciones" y "100 % de adherencia" proceden del propio autor y no están respaldadas por una metodología reproducible.
- Riesgo de alucinación inherente a un modelo de 3 B parámetros: puede inventar CVEs, técnicas ATT&CK o mitigaciones plausibles pero incorrectas.
- Solo inglés; no apto para análisis de logs en otros idiomas sin traducción previa.
- Contexto limitado a 8192 tokens, insuficiente para logs muy extensos o correlación de múltiples fuentes en una sola pasada.
- No soporta tool calling, lo que limita su integración en agentes que requieran invocar APIs de SIEM o EDR.
- No entrenado en código: no debe usarse para análisis de scripts maliciosos o ingeniería inversa.
- El nombre "4B" no coincide con los parámetros reales (≈3,09 B), lo que puede inducir a error en estimaciones de hardware.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la ausencia de evaluación independiente desaconseja su uso en producción sin validación previa en el dominio concreto.
- La model card contiene marcadores de posición sin completar (imágenes de benchmarks no incluidas), lo que indica documentación incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/Srihari2020/CyberMind-4B-GGUF
- Repositorio GitHub: https://github.com/srihari2020/cybermind
- Modelo base (referencia): Qwen2.5-3B-Instruct en Hugging Face (no se proporciona URL directa en la información disponible)
- CISA KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- MITRE ATT&CK: https://attack.mitre.org/
- Unsloth: https://github.com/unslothai/unsloth
- Ollama: https://ollama.com/
