# TanvirS-07/Qwen3.8-27B

## Resumen

Qwen3.8-27B, publicado por el usuario TanvirS-07 en Hugging Face, es una redistribución en formato GGUF de un fine-tune de la familia Qwen 3.8 de 27B. El modelo original del que deriva es `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un ajuste fino de tipo "abliterated"/"uncensored" construido sobre Qwen 3.8 27B mediante la herramienta Unsloth. La model card describe el proceso como un entrenamiento multi-etapa ("COLD FUSION" y "FABLE FUSION 711") orientado a reducir el consumo de tokens de razonamiento y a reforzar la escritura creativa, el roleplay y el código.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de la comunidad: un modelo base de 27B con licencia Apache 2.0, reempaquetado en cuantizaciones GGUF (regulares y "MTP") para su uso en hardware de consumo. Por otro, la model card incluye afirmaciones muy agresivas sobre rendimiento (superar 730 en ARC-C, 880 en ARC-E, "mejor tool calling jamás registrado") que no vienen acompañadas de resultados reproducibles ni de metodología pública, por lo que deben tratarse con escepticismo.

El repositorio ocupa 389 GB, contiene pesos en bfloat16 y GGUF, y declara un pipeline `image-text-to-text`, aunque no se aporta evidencia de que el modelo tenga torre de visión. El número real de parámetros en safetensors es de 26.895.998.464 (aproximadamente 26,9B), lo que encaja con un transformer denso de la familia Qwen de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF regulares y GGUF "MTP" (Neo-CODER MAX DI-MATRIX, doble imatrix); también pesos en bfloat16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de identificarla como un transformer denso de la familia Qwen 3.8 con unos 26,9B de parámetros. El modelo deriva de un fine-tune de DavidAU construido con Unsloth, descrito en la model card como un entrenamiento multi-etapa ("multi-stage tuned", "multi-state merge") sobre datasets propietarios del autor (`DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`). No se especifica el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO.

Las innovaciones declaradas son de naturaleza práctica más que arquitectónica: el autor afirma que el ajuste "TURBO" reduce los tokens de pensamiento entre un 50% y un 90% respecto al Qwen 3.8 27B estándar, manteniendo la calidad de salida, y que el modelo ha sido "abliterated" (eliminación de direcciones de rechazo en el espacio de activaciones) para producir respuestas sin censura. Las cuantizaciones incluyen variantes con doble matriz de importancia ("DI-MATRIX") y una variante "MTP" cuyo significado exacto no se documenta con rigor; en la literatura, MTP suele referirse a *multi-token prediction*, pero aquí aparece asociado a un tipo de cuantización GGUF, lo que genera ambigüedad.

## Capacidades

- Generación de texto conversacional multi-turno en 16 idiomas declarados.
- Razonamiento con modo "thinking" explícito, con la promesa de un consumo de tokens de razonamiento reducido frente al modelo base.
- Generación de código ("coder" en los tags) y tareas de instrucción general.
- Escritura creativa: ficción, relatos, poesía, todos los géneros, y roleplay.
- Respuestas sin censura ("uncensored", "abliterated"): el modelo evita los rechazos típicos de los modelos alineados.
- Tool calling / function calling: la model card lo menciona como punto fuerte, sin datos verificables.
- Capacidad multimodal declarada por el pipeline `image-text-to-text`; no se aporta evidencia ni documentación de una torre de visión.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).

## Casos de uso

- Escritura creativa asistida: el ajuste está explícitamente orientado a ficción y narrativa, con ejemplos en la model card de generación de relatos largos y diálogos con voz propia; adecuado para autores que necesitan borradores extensos con tono marcado.
- Roleplay y personajes persistentes: la ventana conversacional multi-turno y el ajuste "uncensored" lo hacen útil para chatbots de personaje sin filtros moralizantes, en entornos controlados.
- Generación de código en local: al ser un modelo de ~27B cuantizable a 4 bits, puede ejecutarse en una GPU de consumo de 24 GB para autocompletado, refactorización y explicación de código dentro de un IDE.
- Asistencia a la investigación creativa: generación de variantes de trama, esquemas de capítulos y arcos de personaje con menos tokens de "pensamiento" desperdiciados, lo que reduce coste y latencia.
- Procesamiento de documentación multilingüe: con 16 idiomas declarados, sirve para resumir y traducir documentación técnica en entornos donde no se puede usar una API cerrada.
- Prototipado de agentes con tool calling: la model card afirma un rendimiento destacado en llamadas a herramientas; útil para experimentar con pipelines de agentes en local antes de escalar a modelos mayores.
- Base para fine-tunes posteriores: al estar en bfloat16 y Apache 2.0, puede servir como punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

La model card cita cifras de ARC-C y ARC-E, pero no publica tablas reproducibles, configuración de evaluación ni comparaciones controladas. Se recogen aquí tal como aparecen, con la advertencia de que no son verificables:

| Benchmark | Valor declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | "144 puntos por encima de Qwen 3.8 27B", según el autor |
| ARC-C (4 bits) | 719 | Cuantización de 4 bits |
| ARC-E (8 bits) | 880 | "Zona de inteligencia de OpenAI, Claude y Gemini", según el autor |
| Comparación con Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B | Superior en "los 7 benchmarks críticos" | Sin datos numéricos por benchmark |

No se han publicado resultados verificables de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible. Las afirmaciones sobre "el mejor tool calling jamás registrado" remiten a la pestaña de comunidad, no a una evaluación formal.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 54 GB solo para pesos (26,9B × 2 bytes), más KV cache; en Q8, alrededor de 28-30 GB; en Q4, en torno a 15-17 GB.
- GPU recomendadas: A100 80 GB o H100 para bfloat16; RTX 4090 (24 GB) para Q4/Q5; RTX 3090 (24 GB) para Q4.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en tarjetas de 24 GB; en Q4 con contexto corto podría caber en 16 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para los pesos en bfloat16 en servidor; el repo incluye cuantizaciones GGUF listas para usar.
- Latencia y throughput: no disponibles. La model card afirma reducción de tokens de pensamiento, lo que en la práctica reduce el tiempo hasta la primera respuesta útil, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (este fine-tune) | ~26,9B | No disponible | Apache 2.0 | Ajuste comunitario "uncensored", GGUF incluidos |
| Qwen 3.8 27B base | ~27B | No disponible | Apache 2.0 | Modelo original de Alibaba; referencia de comparación del autor |
| Qwen 3.6 27B | ~27B | No disponible | Apache 2.0 | Generación anterior; el autor afirma superarlo en 7 benchmarks |
| Qwen 3.6-35B-A3B | 35B totales, ~3B activos (MoE) | No disponible | Apache 2.0 | Alternativa MoE de mayor tamaño total y menor coste por token |

La comparativa se limita a la familia Qwen porque la información proporcionada no incluye datos de otros modelos. Las afirmaciones de superioridad del autor no están respaldadas por evaluaciones independientes.

## Limitaciones y advertencias

- Las cifras de benchmarks de la model card no son verificables ni reproducibles; no hay metodología publicada.
- El modelo es "abliterated"/"uncensored": elimina deliberadamente los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, ilegal o sexualmente explícito. No es apto para aplicaciones públicas sin moderación adicional.
- Riesgo elevado de alucinación, especialmente en modo "thinking" reducido, donde el modelo sacrifica pasos de verificación.
- El pipeline declarado `image-text-to-text` no está respaldado por documentación de visión; podría tratarse de un error de etiquetado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de un fine-tune comunitario cuyas condiciones de entrenamiento no están auditadas; conviene revisar la licencia del modelo base original de Qwen.
- El repositorio ocupa 389 GB y contiene múltiples cuantizaciones; la descarga completa es inviable en la mayoría de entornos domésticos.
- No hay información sobre sesgos medidos, evaluación de seguridad ni pruebas en producción.
- El autor del repo (TanvirS-07) no es el autor del fine-tune original (DavidAU); se trata de una redistribución, con el riesgo de desincronización respecto al modelo fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TanvirS-07/Qwen3.8-27B
- Modelo base del fine-tune: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- Modelos de DavidAU en tendencia: https://huggingface.co/models?sort=trending&search=DavidAU
- Página de soporte/FAQ del autor: https://huggingface.co/DavidAU/support
- Variante Turbo Brilliance 27B Heretic v2: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante Turbo Brilliance 27B no-Heretic v1: https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
