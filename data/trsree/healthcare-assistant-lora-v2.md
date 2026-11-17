# trsree/healthcare-assistant-lora-v2

## Resumen

Healthcare-assistant-lora-v2 es un adaptador LoRA publicado en Hugging Face por el usuario trsree, construido sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. El adaptador se ha entrenado mediante supervisión fina (SFT) con la librería TRL sobre el conjunto de datos jeev1992/wikidoc-healthassist, una colección de contenido médico enciclopédico reestructurado en formato conversacional de pregunta y respuesta mediante GPT-4o-mini. El objetivo declarado es responder a conversaciones de temática médica.

El modelo no es un modelo completo, sino un adaptador de bajo rango (r=16, alpha=32, dropout=0,05, aplicado a todas las capas lineales) que debe cargarse junto con el modelo base Qwen2.5-1.5B-Instruct. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador y no con pesos completos. La información pública disponible es muy escasa: la model card es en gran medida una plantilla sin completar, no se declara licencia, no se especifican idiomas y no se han publicado resultados de evaluación ni benchmarks.

Su relevancia es limitada y de nicho: sirve como ejemplo de ajuste fino ligero de un LLM pequeño para dominio sanitario, pero carece de la documentación, evaluación y garantías necesarias para un uso serio en producción. Cualquier evaluación debe tratarlo como un experimento reproducible más que como un componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct tiene 1.500 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento (MAX_SEQ_LENGTH); contexto nativo del base no declarado en la informacion disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria transformers) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 16, alpha 32 y dropout 0,05 sobre todos los módulos lineales del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El entrenamiento se realizó con SFT de TRL: 2.000 muestras de entrenamiento y 100 de evaluación, longitud máxima de secuencia de 512 tokens, 2 épocas, batch de 2 por dispositivo con acumulación de gradiente de 4, learning rate de 5e-5 con scheduler coseno y 50 pasos de warmup, precisión bf16 y checkpointing de gradientes. La semilla fue 42.

Los datos de entrenamiento provienen de jeev1992/wikidoc-healthassist, descrito como contenido médico enciclopédico limpiado y reestructurado en formato Q&A conversacional con GPT-4o-mini. No se documenta el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica ninguna innovación técnica adicional más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional en el dominio médico, orientada a preguntas y respuestas.
- Respuesta a preguntas sobre síntomas, tratamientos, diagnósticos y diferencias entre patologías, según los ejemplos de prompts incluidos en la model card (diabetes tipo 2, hipertensión, asma, ibuprofeno, neumonía).
- Herencia de las capacidades generales del modelo base Qwen2.5-1.5B-Instruct, aunque no se documenta hasta qué punto el ajuste las preserva.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes de FAQ médica: el adaptador puede generar respuestas conversacionales a preguntas frecuentes sobre patologías comunes, útil para validar pipelines de SFT antes de invertir en modelos mayores.
- Experimentación académica con LoRA en dominio sanitario: sirve como referencia reproducible de un ajuste ligero sobre Qwen2.5-1.5B con hiperparámetros documentados.
- Generación de borradores de material divulgativo: con revisión humana obligatoria, puede producir explicaciones iniciales sobre enfermedades y tratamientos a partir de conocimiento enciclopédico.
- Evaluación comparativa de adaptadores: al estar basado en un modelo pequeño y con configuración conocida, permite medir el efecto del ajuste frente al base en tareas de Q&A médico.
- Formación de personal no clínico: respuestas introductorias sobre conceptos médicos básicos, siempre con supervisión y sin sustituir criterio profesional.
- Base para posteriores ajustes: puede servir como punto de partida para un fine-tuning adicional con datos propios y validación clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa unos 0,1 GB; el modelo base de 1.500 millones en bf16 requiere aproximadamente 3 GB de VRAM, y en cuantización de 8 bits o 4 bits puede reducirse a alrededor de 1,5-2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para el modelo base en bf16; para mayor throughput, A100 o H100.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama requieren fusionar el adaptador con el base y convertir a GGUF; vLLM y TGI son posibles tras fusionar los pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| healthcare-assistant-lora-v2 | 1,5B (base) + LoRA | 512 en entrenamiento | Sin benchmarks publicados | No disponible | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | Contexto nativo del base (no declarado aquí) | Benchmarks publicados por Qwen | Apache 2.0 (según el modelo base) | Hugging Face |
| Adaptadores médicos LoRA comparables | Variable | Variable | No disponible | Variable | Hugging Face |

La comparación directa con alternativas específicas no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base Qwen2.5-1.5B-Instruct.

## Limitaciones y advertencias

- La model card es una plantilla incompleta: no se documentan sesgos, riesgos, usos fuera de alcance ni recomendaciones.
- Riesgo elevado de alucinación en un dominio crítico como la salud; no debe usarse para diagnóstico ni consejo médico sin validación profesional.
- El entrenamiento se limita a 2.000 muestras y 512 tokens de contexto, lo que restringe la cobertura y la profundidad de las respuestas.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se especifican idiomas soportados; el comportamiento en castellano no está garantizado.
- No hay evaluación cuantitativa ni conjunto de pruebas independiente; el rendimiento real es desconocido.
- El adaptador debe combinarse con el modelo base, cuyas condiciones de licencia y uso también aplican.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/trsree/healthcare-assistant-lora-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/jeev1992/wikidoc-healthassist
- Referencia arXiv citada en los tags (1910.09700): https://arxiv.org/abs/1910.09700
