# Yusheng88/tiny-aya-wazuh-analyst-lora-v2b

## Resumen

`Yusheng88/tiny-aya-wazuh-analyst-lora-v2b` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `CohereLabs/tiny-aya-global`. Lo publica el usuario Yusheng88 en Hugging Face con un pipeline declarado de generación de texto y un tamaño de repositorio de 0,1 GB, coherente con un adaptador PEFT y no con un modelo completo. El nombre sugiere una especialización en el dominio de Wazuh, plataforma abierta de SIEM y detección de intrusiones, aunque la model card no documenta el corpus de entrenamiento ni el objetivo exacto de la especialización.

El interés técnico del artefacto reside en la combinación elegida: un adaptador ligero sobre un modelo multilingüe de la familia Aya, orientado a tareas de análisis de seguridad. Sin embargo, la información pública es mínima: no hay métricas, no se especifica la licencia, no se detallan los idiomas efectivamente soportados y el repositorio no registra descargas ni valoraciones en el momento de la consulta. Cualquier evaluación de idoneidad para producción debe partir, por tanto, de la validación empírica propia.

La ficha describe lo que puede afirmarse con la información disponible y marca explícitamente como «no disponible» todo aquello que la model card omite.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only `CohereLabs/tiny-aya-global`; arquitectura interna del base no detallada en la información disponible |
| Parámetros totales | No disponible (el adaptador ocupa 0,1 GB en el repositorio; los parámetros del modelo base no se detallan) |
| Parámetros activos | No disponible (no es un MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (al ser un adaptador, la cuantización aplica al modelo base; no se documenta ninguna) |
| Idiomas soportados | No disponible (el base pertenece a la familia Aya, de orientación multilingüe, pero no se especifica cobertura) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | peft |
| Framework de entrenamiento | TRL 1.7.1, Transformers 5.22.1, PyTorch 2.13.0, Datasets 4.8.5, Tokenizers 0.23.3, PEFT 0.21.2 |
| Tipo de ajuste | SFT (supervised fine-tuning) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se entrena mediante SFT con TRL sobre el checkpoint `CohereLabs/tiny-aya-global`, que actúa como modelo base congelado; el adaptador añade matrices de bajo rango en las capas seleccionadas. La model card no especifica el rango, el alpha, las capas objetivo ni el número de tokens de entrenamiento. Tampoco documenta la composición del dataset, si hubo etapas de preferencia (DPO/RLHF) ni procesos de filtrado o deduplicación.

El nombre del adaptador apunta a una especialización en el dominio de Wazuh (SIEM, reglas de detección, análisis de alertas), pero no se aporta evidencia documental de ello: no hay descripción del corpus, ni ejemplos de prompts de entrenamiento, ni evaluación cualitativa. Las versiones de framework declaradas (Transformers 5.22.1, PyTorch 2.13.0) son posteriores a las habituales en el ecosistema en el momento de redactar esta ficha, lo que conviene verificar antes de reproducir el entorno de inferencia.

## Capacidades

- Generación de texto conversacional en formato chat (la model card muestra un ejemplo con `pipeline("text-generation")` y mensajes con rol `user`).
- Ajuste orientado, por nombre y contexto, al análisis de eventos y alertas de Wazuh; no verificable con la documentación disponible.
- Herencia potencial de las capacidades multilingües del modelo base Aya; cobertura concreta no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo «thinking» explícito: no disponible.

## Casos de uso

- Triaje de alertas SIEM: el adaptador podría emplearse para resumir y clasificar alertas generadas por Wazuh, agrupando eventos relacionados y proponiendo una severidad preliminar antes de la revisión humana. Requiere validación previa con datos propios, ya que no hay métricas publicadas.
- Asistencia a analistas SOC en lenguaje natural: consultas del tipo «explica esta regla de Wazuh» o «qué indica esta alerta», apoyadas en el ajuste específico del dominio. La utilidad real depende de la calidad del corpus de SFT, no documentado.
- Generación y revisión de reglas de decodificación y de detección: borradores de reglas XML de Wazuh o de lógica de correlación, sujetos siempre a revisión humana por el riesgo de alucinación en sintaxis crítica.
- Enriquecimiento de informes de incidentes: redacción de resúmenes técnicos a partir de trazas y logs, aprovechando el formato conversacional del modelo base.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador de 0,1 GB sobre un modelo «tiny», permite experimentar en una sola GPU de consumo o incluso en CPU con cuantización del base, sin necesidad de infraestructura dedicada.
- Formación y documentación interna: generación de explicaciones didácticas sobre conceptos de Wazuh y de detección de intrusiones para equipos junior, siempre con supervisión y verificación de fuentes.
- Base para ajustes posteriores: el adaptador puede servir como punto de partida para fine-tuning adicional con datos propios de la organización, dado su reducido tamaño y su formato PEFT estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; los requisitos reales vienen determinados por el modelo base `CohereLabs/tiny-aya-global`, cuyas dimensiones exactas no se detallan en la información disponible.
- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un modelo de la familia «tiny», es razonable esperar que quepa en GPUs de consumo, pero no puede confirmarse sin conocer el número de parámetros del base.
- GPU recomendadas: no disponibles. Por el perfil del base, cabría esperar viabilidad en RTX 3060/4060/4090 y GPUs de datacenter (A100, H100) sobredimensionadas para este tamaño.
- Despliegue: compatible con el ecosistema PEFT/Transformers; para servir en producción pueden considerarse vLLM o TGI una vez fusionado el adaptador con el base, y llama.cpp/Ollama si se convierte el modelo fusionado a GGUF. No hay guía oficial de despliegue publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Yusheng88/tiny-aya-wazuh-analyst-lora-v2b` | Adaptador LoRA sobre tiny-aya-global | No disponible (repo 0,1 GB) | No disponible | No disponible | Hugging Face, 0 descargas |
| `CohereLabs/tiny-aya-global` (base) | Modelo completo | No disponible en esta ficha | No disponible | No disponible en esta ficha | Hugging Face |
| Otros adaptadores LoRA de dominio seguridad | Adaptador PEFT | Variable | Depende del base | Variable | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones del base en la información proporcionada, por lo que la comparación cuantitativa con alternativas no es posible.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, ni ejemplos de salida, ni métricas de calidad que permitan estimar el rendimiento real del adaptador.
- Licencia no especificada: la model card incluye un campo `licence: license` sin contenido, lo que impide determinar si el uso comercial está permitido. Es imprescindible aclararlo antes de cualquier despliegue en producción.
- Riesgo de alucinación elevado en un dominio crítico: en tareas de seguridad, una regla o un diagnóstico inventado puede tener consecuencias operativas; toda salida debe verificarse contra fuentes autoritativas.
- Idiomas no declarados: aunque el base pertenece a la familia Aya, no se confirma qué idiomas conserva el adaptador tras el SFT.
- Corpus de entrenamiento no documentado: se desconoce si los datos de SFT proceden de documentación pública de Wazuh, de logs reales o de datos sintéticos, lo que afecta a la generalización y a posibles sesgos.
- Posible sobreajuste al dominio: un adaptador entrenado con SFT sobre un corpus estrecho puede degradar capacidades generales del modelo base.
- Entorno de ejecución peculiar: las versiones de framework declaradas (Transformers 5.22.1, PyTorch 2.13.0) pueden no estar disponibles o ser incompatibles con despliegues estándar; conviene probar con versiones estables actuales.
- Cero adopción registrada (0 descargas, 0 likes): no hay señal de comunidad ni retroalimentación de terceros.
- El adaptador no es autónomo: requiere descargar y cargar el modelo base, con los requisitos de hardware y la licencia que este imponga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yusheng88/tiny-aya-wazuh-analyst-lora-v2b
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de PEFT: https://huggingface.co/docs/peft
- Wazuh (plataforma de referencia del dominio): https://wazuh.com
