# Yad4o/constitution-qa-lora

## Resumen

Constitution QA LoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Yad4o y publicado en HuggingFace, diseñado para responder preguntas sobre la Constitución de la India y el marco legal indio. No se trata de un modelo completo, sino de un ajuste fino de bajo rango sobre el modelo base Qwen/Qwen3-1.7B, un transformer causal de 1.700 millones de parámetros desarrollado por Alibaba Qwen.

El adaptador se entrena con SFTTrainer de la librería `trl` sobre un conjunto de 393 ejemplos extraídos del texto oficial de la Constitución de la India, con un rango LoRA de 16 y alpha de 32, aplicado a los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). El resultado es un modelo especializado en generación de texto conversacional orientado a consultas educativas e informativas sobre derecho constitucional indio.

Su relevancia es acotada: se trata de un experimento de ajuste fino con un volumen de datos muy reducido, orientado a un dominio jurídico específico y con licencia Apache 2.0. No debe confundirse con un asistente legal de producción, tal como advierte el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (Qwen3-1.7B) |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA de bajo rango (r=16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de transformers) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer causal de tipo decoder-only. La técnica PEFT empleada es LoRA con rango r=16 y alpha=32, inyectada en las proyecciones de query, key, value y output de la atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). No se modifican las capas MLP ni los embeddings.

El entrenamiento se realizó con `SFTTrainer` de la librería `trl`, durante 3 épocas, con learning rate 2e-4 y batch size 2, sobre un dataset de 393 ejemplos de texto limpio extraído de la Constitución de la India. El hardware de entrenamiento no se reporta. No se documenta el uso de RLHF, DPO ni ninguna otra etapa de alineación posterior al ajuste supervisado. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la fuente constitucional.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat (`apply_chat_template`).
- Respuesta a preguntas sobre artículos, estructura y disposiciones de la Constitución de la India.
- Formato de pregunta-respuesta de un solo turno o multi-turno básico, heredado de las capacidades del modelo base Qwen3-1.7B.
- Capacidad de razonamiento general y generación de texto en inglés heredada del modelo base, aunque el ajuste LoRA está orientado al dominio jurídico.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico en la model card.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Soporte multilingüe limitado al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Consulta educativa sobre artículos constitucionales: un estudiante o docente puede preguntar por el contenido de un artículo concreto (por ejemplo, el artículo 21) y obtener una respuesta generada a partir del ajuste sobre el texto constitucional.
- Material de estudio y repaso: generación de resúmenes o explicaciones de secciones de la Constitución para preparación de exámenes de derecho indio, aprovechando el ajuste específico de dominio.
- Prototipado de asistentes jurídicos: servir como componente de demostración en un pipeline de QA legal antes de sustituirlo por un modelo mayor o un sistema con recuperación aumentada (RAG).
- Chatbot de orientación cívica: respuestas básicas sobre estructura del Estado, derechos fundamentales y organización constitucional en contextos educativos.
- Evaluación de técnicas PEFT: caso de estudio reproducible para comparar el efecto de un LoRA de rango 16 sobre un modelo de 1.700 millones de parámetros en un dominio especializado.
- Integración en demos de bajo coste: al requerir solo el modelo base de 1.700 millones de parámetros, puede desplegarse en hardware modesto para pruebas internas o entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.700 millones de parámetros ocupa aproximadamente 3,4 GB en FP16; en cuantización de 8 bits, alrededor de 1,7-2 GB; en 4 bits, alrededor de 1-1,5 GB. El adaptador LoRA añade una sobrecarga mínima (decenas de MB).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM puede ejecutar el modelo en FP16 o cuantizado (RTX 3060, RTX 4060, RTX 4090). Para despliegue en servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con al menos 6 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` (según el código de la model card), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Constitution QA LoRA (Yad4o) | 1.700 M (base) + LoRA r=16 | No disponible | Constitucion de la India | Apache 2.0 | HuggingFace (20 descargas) |
| Qwen/Qwen3-1.7B (base) | 1.700 M | No disponible en la informacion proporcionada | Generico | Apache 2.0 | HuggingFace |
| Modelos legales especializados de mayor tamano | No disponible | No disponible | Legal general | Variable | Variable |

La comparación directa con otros adaptadores de QA legal no está disponible en la información proporcionada. El principal punto de referencia es el propio modelo base Qwen3-1.7B, del que este adaptador hereda arquitectura, licencia y capacidades generales, añadiendo especialización en un dominio concreto a costa de un dataset de entrenamiento muy reducido.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy pequeño (393 ejemplos), lo que limita la cobertura y fiabilidad de las respuestas sobre la Constitución.
- Riesgo elevado de alucinación en cuestiones legales: el modelo puede generar referencias a artículos o disposiciones inexistentes o incorrectas.
- El autor advierte explícitamente que no debe usarse como sustituto de asesoramiento legal profesional y que las respuestas deben verificarse contra el texto oficial de la Constitución de la India.
- Idiomas soportados limitados al inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Longitud de contexto no documentada en la información disponible; se desconoce el comportamiento en conversaciones largas.
- Sesgos conocidos: no documentados en la model card, pero heredados potencialmente del modelo base y del corpus constitucional utilizado.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza del modelo (asistente educativo con alta tasa de error potencial) desaconseja su uso en producción legal sin supervisión humana y verificación documental.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/Yad4o/constitution-qa-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL (SFTTrainer): https://github.com/huggingface/trl
