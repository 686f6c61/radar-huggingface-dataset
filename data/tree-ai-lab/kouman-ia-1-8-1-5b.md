# Tree-AI-lab/kouman-IA-1.8-1.5B

## Resumen

Kouman AI 1.8-1.5B es un modelo de lenguaje conversacional desarrollado por Tree AI Lab, un laboratorio con sede en Costa de Marfil. El modelo está especializado en cuatro idiomas: baoulé (bci), dioula (dyu), francés (fr) e inglés (en), combinando lenguas africanas de escasos recursos con los dos idiomas coloniales de uso administrativo y técnico en la región. Se distribuye bajo el identificador `Tree-AI-lab/kouman-IA-1.8-1.5B` en Hugging Face.

El modelo parte de la arquitectura Gemma 2 y ha sido sometido a un proceso de continued pre-training (CPT) sobre las cuatro lenguas, seguido de un ajuste supervisado (SFT) orientado a conversación. Según la model card, la mejor `val_loss` alcanzada en la fase SFT es de 0,8981. El repositorio incluye un script de inferencia autónomo (`inference_kouman.py`) y una plantilla de chat compatible con `transformers`.

A pesar de la nomenclatura "1.8-1.5B" del identificador, los pesos en safetensors suman 2.614.341.888 parámetros, lo que sugiere que el nombre comercial no refleja el recuento real de parámetros del checkpoint publicado. Es relevante por su enfoque en lenguas de bajos recursos y por ser uno de los pocos modelos abiertos orientados específicamente al baoulé y al dioula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card usa bfloat16) |
| Idiomas soportados | baoulé (bci), dioula (dyu), francés (fr), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 2, un transformer decoder-only con atención por ventanas alternas y normalización RMSNorm, según la familia de referencia. La model card indica que se aplicó continued pre-training (CPT) sobre las cuatro lenguas (baoulé, dioula, francés e inglés) y posteriormente un ajuste supervisado (SFT) para comportamiento conversacional. El resultado de validación del SFT reportado es una `val_loss` de 0,8981.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La model card recomienda `attn_implementation='eager'` para la inferencia, lo que sugiere que no se ha validado el uso de implementaciones de atención optimizadas (como FlashAttention) en este checkpoint.

## Capacidades

- Generación de texto conversacional multi-turno en baoulé, dioula, francés e inglés.
- Traducción entre las cuatro lenguas soportadas (la model card incluye un ejemplo de traducción al dioula).
- Respuesta a preguntas en formato chat mediante plantilla `apply_chat_template`.
- Soporte de tokens especiales de plantilla conversacional (`<end_of_turn>`, `eos_token`).
- Generación con parámetros de muestreo configurables (temperatura, top_p, repetition_penalty).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente conversacional en baoulé y dioula: el modelo puede mantener diálogos multi-turno en lenguas locales de Costa de Marfil, un nicho con muy poca cobertura en modelos abiertos, usando la plantilla de chat incluida.
- Traducción francés-dioula y francés-baoulé: útil para servicios públicos, ONG y administraciones que necesitan trasladar comunicaciones oficiales a lenguas locales, como muestra el ejemplo CLI de la model card.
- Educación bilingüe: generación de material didáctico y explicaciones en lenguas locales apoyándose en el francés como lengua puente, aprovechando el CPT sobre ambas.
- Atención al ciudadano: despliegue de un chatbot ligero (2,6B parámetros) en entornos con recursos limitados para responder consultas básicas en lenguas locales.
- Preservación lingüística: generación de texto sintético y ejemplos de uso para documentación de baoulé y dioula, lenguas con escasa presencia digital.
- Prototipado rápido de aplicaciones NLP en Costa de Marfil: el tamaño moderado del checkpoint permite experimentación en una sola GPU consumer y el script `inference_kouman.py` facilita la puesta en marcha.
- Investigación en transferencia lingüística: estudio de cómo un modelo base Gemma 2 adapta sus capacidades a lenguas de bajos recursos mediante CPT y SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo reportado por el autor es la `val_loss` de SFT de 0,8981, que no es comparable directamente con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,3 GB solo para pesos (2,61B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 8-10 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 3 GB para pesos; en 4 bits, en torno a 1,5-2 GB (aunque no se documentan checkpoints cuantizados oficiales).
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para inferencia en bfloat16 sin cuantizar; GPUs con 8 GB o más para cuantización.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bfloat16 y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` (soporte documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están confirmados oficialmente para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kouman AI 1.8-1.5B | 2,61B | no disponible | bci, dyu, fr, en | no disponible | Hugging Face |
| Gemma 2 2B (Google) | ~2,6B | 8K | multilingüe (sin baoulé/dioula específico) | Gemma Terms of Use | Hugging Face |
| AfroLM / AfroXLMR | ~0,1-0,5B | 512 | lenguas africanas | variable | Hugging Face |
| InkubaLM (2.4B) | ~2,4B | no disponible | lenguas africanas | no disponible | Hugging Face |

La comparación con Gemma 2 2B es la más directa por arquitectura y tamaño. AfroLM e InkubaLM son alternativas orientadas a lenguas africanas, aunque con coberturas idiomáticas y licencias distintas. No se dispone de datos de rendimiento comparativo para Kouman AI.

## Limitaciones y advertencias

- No se publica licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue en producción.
- El recuento real de parámetros (2,61B) no coincide con la nomenclatura del identificador ("1.8-1.5B"), lo que puede generar confusión sobre el tamaño efectivo y los requisitos de hardware.
- La `val_loss` de 0,8981 es el único indicador de calidad reportado; no hay evaluación en benchmarks estándar ni comparativas con líneas base.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en lenguas de bajos recursos donde los datos de entrenamiento son escasos.
- Cobertura limitada a cuatro idiomas; no se documenta comportamiento en otras lenguas.
- No se especifica la longitud de contexto, lo que dificulta planificar aplicaciones con documentos largos.
- La recomendación de `attn_implementation='eager'` sugiere que las optimizaciones de atención no están validadas, lo que puede afectar al rendimiento en producción.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgos derivados de los datos de preentrenamiento de Gemma 2 y del corpus de CPT/SFT, no auditados públicamente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-IA-1.8-1.5B
- Repositorio de Tree AI Lab: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
