# tarirozw/medgemma-maternal-lora-v2

## Resumen

medgemma-maternal-lora-v2 es un adaptador LoRA (concretamente QLoRA) desarrollado por Dawa Health, con financiación de UNICEF, que adapta el modelo médico multimodal MedGemma 4B (en su variante instruction-tuned, `google/medgemma-4b-it`) para ofrecer información sobre salud materna y reproductiva en siete idiomas empleados en Zimbabue y Zambia. El adaptador se entrena sobre la versión 1 del mismo proyecto, continuando el entrenamiento sin añadir nuevas capas LoRA, de modo que se carga sobre el modelo base exactamente igual que su predecesor.

La relevancia del modelo radica en su enfoque en lenguas africanas de bajos recursos (shona, ndebele, tonga, chinyanja, bemba, lozi) y en el dominio acotado de la salud materna, un área donde los asistentes multilingües con cobertura clínica son escasos. La versión 2 incorpora datos de preguntas y respuestas revisados por clínicos, un conjunto semilla sobre anticoncepción y conversaciones reales del asistente de Dawa Health (Rudo, desplegado en WhatsApp).

Se trata de un adaptador de aproximadamente 0,2 GB que no modifica la arquitectura del modelo base (un transformer decoder-only multimodal de 4.000 millones de parámetros). El entrenamiento fue exclusivamente textual: las capacidades de visión del modelo base no se entrenaron ni se evaluaron. No es un dispositivo médico y no sustituye a un profesional sanitario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only multimodal (MedGemma 4B) |
| Parámetros totales | Adaptador LoRA de ~0,2 GB; modelo base de 4.000 millones de parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (cuantización del base durante entrenamiento); no se detallan otros formatos |
| Idiomas soportados | Inglés (en), shona (sn), ndebele (nd), chinyanja/nyanja (ny), bemba (bem), lozi (loz), tonga (toi) |
| Licencia | AGPL-3.0 para las contribuciones de Dawa Health, más los términos Health AI Developer Foundations (HAI-DEF) heredados de MedGemma |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre MedGemma 4B instruction-tuned, un modelo decoder-only multimodal de 4.000 millones de parámetros. El entrenamiento emplea QLoRA: el modelo base se cuantiza y se entrenan únicamente los pesos del adaptador LoRA, sin añadir nuevas capas respecto a la versión 1. La versión 2 continúa el entrenamiento desde el adaptador v1, por lo que es un único adaptador compatible con el base original.

Los datos de entrenamiento de v2 incorporan preguntas y respuestas revisadas por clínicos extraídas de documentos, un conjunto semilla sobre anticoncepción y conversaciones reales de usuarios del asistente de Dawa Health (repetidas tres veces en el dataset). La cobertura lingüística es desigual por tarea: shona, ndebele y tonga solo se entrenaron con guías semanales de embarazo (sin ejemplos de preguntas y respuestas); las FAQ sobre cáncer cervical existen únicamente en inglés, bemba, chinyanja y lozi; y los nuevos datos de v2 (Q&A documental, anticoncepción, conversaciones reales) son mayoritariamente en inglés. El entrenamiento fue solo de texto: las capacidades de imagen del base no se entrenaron ni evaluaron.

## Capacidades

- Generación de texto en el dominio de salud materna y reproductiva: información sobre semanas de embarazo, cáncer cervical, fertilidad, anticoncepción y molestias antenatales comunes.
- Soporte multilingüe para siete idiomas: inglés, shona, ndebele, chinyanja, bemba, lozi y tonga.
- Manejo de code-switching (alternancia de idiomas dentro de una misma conversación), orientado a asistentes multilingües reales.
- Respuesta a preguntas conversacionales de múltiples turnos en el dominio acotado de salud materna.
- Capacidad de visión del modelo base no entrenada ni evaluada en este adaptador.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo de razonamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Asistente de información sobre el embarazo por WhatsApp: integrado en el asistente Rudo de Dawa Health, el modelo responde preguntas sobre qué esperar en cada semana de gestación, apoyándose en recuperación de contenido de guías verificadas y revisión humana en casos sensibles.
- Educación sobre anticoncepción: el conjunto semilla de anticoncepción de v2 permite responder dudas básicas sobre métodos anticonceptivos en varios idiomas, siempre con revisión clínica previa a la exposición al paciente.
- Información sobre cáncer cervical: las FAQ entrenadas en inglés, bemba, chinyanja y lozi permiten responder consultas frecuentes sobre cribado y prevención en esas lenguas.
- Investigación en PLN multilingüe de bajos recursos: sirve como base para estudiar generación en lenguas africanas con pocos datos, evaluando calidad y deriva idiomática en condiciones controladas.
- Prototipado de asistentes sanitarios code-switched: permite a desarrolladores construir y probar flujos conversacionales que alternan inglés y lenguas locales antes de validación con hablantes nativos.
- Triaje informativo no clínico en entornos con escasez de personal: como capa de información general (nunca de diagnóstico ni triaje de urgencias) para orientar a usuarias hacia recursos humanos.
- Evaluación comparativa de adaptadores LoRA en dominio médico: útil para investigadores que comparan v1 y v2 y miden el efecto de datos revisados por clínicos y conversaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación cualitativa (por ejemplo, 17 de 133 respuestas con bucles de repetición en decodificación greedy, concentrados en bemba con 8 de 14) y al menos una respuesta clínicamente incorrecta en inglés, pero no se aportan tablas de MMLU, HumanEval, GSM8K ni métricas cuantitativas comparables.

## Requisitos de hardware

- El adaptador LoRA ocupa ~0,2 GB; el modelo base MedGemma 4B requiere VRAM adicional para inferencia.
- Con cuantización de 4 bits, el base de 4B puede caber en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070); en fp16 se recomienda al menos 16 GB (RTX 4090, A100 40 GB, H100).
- Para servir en producción se sugiere A100 o H100 si se busca throughput alto; RTX 4090 es viable para prototipos y desarrollo.
- Opciones de despliegue: PEFT sobre transformers, vLLM o TGI para servir el base con el adaptador, y llama.cpp/Ollama si se convierte a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles.
- El modelo base está gated en Hugging Face: es necesario aceptar los términos de MedGemma antes de la descarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| medgemma-maternal-lora-v2 | 4B (base) + LoRA | no disponible | 7 (en + 6 africanas) | AGPL-3.0 + HAI-DEF | Adaptador de dominio materno, texto únicamente |
| google/medgemma-4b-it (base) | 4B | no disponible | Multilingüe general | HAI-DEF | Modelo médico multimodal sin adaptación a lenguas africanas |
| dawahealth/medgemma-maternal-lora (v1) | 4B (base) + LoRA | no disponible | 7 (en + 6 africanas) | AGPL-3.0 + HAI-DEF | Predecesor; v2 añade Q&A clínico, anticoncepción y conversaciones reales |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre estas variantes.

## Limitaciones y advertencias

- Contenido clínico incorrecto: en evaluación al menos una respuesta en inglés era clínicamente errónea (afirmaba que una infección urinaria en el embarazo provoca caída de la frecuencia cardíaca fetal y bacterias en los pulmones del bebé). El modelo puede afirmar información falsa con seguridad.
- Bucles de repetición: con decodificación greedy repite frases hasta el límite de tokens (17 de 133 respuestas en evaluación, sobre todo en bemba). Se recomienda `repetition_penalty=1.15`.
- Calidad desigual en lenguas minoritarias: shona, chinyanja y bemba son débiles en texto libre; las puntuaciones altas en ndebele, tonga y lozi se explican en parte por reproducción exacta de líneas cortas de referencia. Ninguna salida ha sido revisada por hablantes nativos.
- Cobertura por tarea: shona, ndebele y tonga solo tienen guías semanales de embarazo; las FAQ de cáncer cervical solo existen en inglés, bemba, chinyanja y lozi; los datos nuevos de v2 son mayoritariamente en inglés.
- Huecos en el material fuente: temas como prevención de malaria, pruebas de VIH y preeclampsia no aparecen en la guía bemba; no fiarse del modelo para esos temas.
- Posible memorización de texto de usuarios: se incluyeron conversaciones reales repetidas tres veces; no asumir que no puede reproducir fragmentos. La model card pide confirmar que se eliminaron identificadores personales.
- Deriva fuera de dominio: puede dar consejos genéricos no relacionados con salud materna.
- Uso fuera de alcance: diagnóstico, triaje de urgencias, decisiones de tratamiento, consejo de medicación o dosificación, y sustitución de personal sanitario.
- Licencia: AGPL-3.0 impone obligaciones de copyleft para uso en red; además se heredan los términos HAI-DEF de MedGemma. Revisar compatibilidad antes de uso comercial.
- No usar como fuente de precios, listas de productos ni datos personales.
- Mantener siempre supervisión humana y validación por clínicos que hablen cada idioma antes de cualquier uso orientado a pacientes.

## Enlaces

- Hugging Face: https://huggingface.co/tarirozw/medgemma-maternal-lora-v2
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Adaptador v1: https://huggingface.co/dawahealth/medgemma-maternal-lora
- Web de Dawa Health: https://dawa-health.com/
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
- Paper referenciado (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Paper referenciado (arXiv:2507.05201): https://arxiv.org/abs/2507.05201
