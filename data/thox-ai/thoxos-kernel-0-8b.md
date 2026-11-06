# Thox-ai/ThoxOS-Kernel-0.8B

## Resumen

ThoxOS-Kernel-0.8B es un modelo de lenguaje de tipo transformer denso, con 752.393.024 parámetros, desarrollado por Thox-ai como estudiante destilado del modelo ThoxOS-Kernel-27B. Se trata de un fine-tune con LoRA de rango 32 y alpha 64 sobre la base Qwen/Qwen3.5-0.8B, con los pesos fusionados en un único checkpoint. Su propósito es actuar como capa de triaje de sistema operativo y kernel: clasificar y enrutar peticiones, ejecutar diagnósticos de primera línea, responder consultas ancladas a runbooks y escalar todo lo que exceda el triaje a modelos de mayor tamaño.

El modelo está diseñado para desplegarse en entornos de borde, concretamente en el hardware ThoxAir y en el paquete host ThoxKey. Su filosofía operativa es explícita: el modelo propone, pero el arnés de ejecución decide. Nunca ejecuta acciones de sistema directamente, lo que reduce la superficie de riesgo en escenarios de administración de sistemas.

Es relevante ahora porque representa un caso poco habitual de modelo de dominio muy específico (triaje OS/kernel) empaquetado en menos de mil millones de parámetros, con builds GGUF listos para Ollama y una política de declinación deliberada ante información desconocida. El autor declara que el build fusionado superó su puerta de calidad pre-registrada el 1 de noviembre de 2026, con 37 de 49 pruebas superadas y cero fallos duros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5, tag `qwen3_5_text`) |
| Parámetros totales | 752.393.024 (0,8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (longitud de secuencia de entrenamiento: 2048 tokens) |
| Tipos de cuantización | GGUF Q4_K_M, Q8_0 y Q4_0; safetensors en precisión completa |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de la familia Qwen3.5, y se adapta mediante un fine-tune LoRA con rango 32 y alpha 64, posteriormente fusionado en los pesos base. El resultado es un checkpoint único de 752 millones de parámetros con secuencia de entrenamiento de 2048 tokens. No se documenta en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset.

El entrenamiento se basa en el corpus v3 de Thox-ai/thoxos-kernel-sft, que combina un corpus de kernel de origen humano y derivado con trazas generadas por el profesor ThoxOS-Kernel-27B (versión v22-d813bb3c). Solo se admitieron 308 trazas del profesor tras un proceso de filtrado que incluyó ejecución en sandbox para las filas de comandos y comprobaciones de factualidad para la prosa. El autor no especifica si se aplicaron etapas de RLHF o DPO. La innovación técnica destacable no es arquitectónica sino metodológica: destilación con admisión filtrada de trazas y una política de declinación entrenada explícitamente para información desconocida.

## Capacidades

- Clasificación y enrutamiento de peticiones de sistema operativo y kernel hacia el modelo o el componente adecuado.
- Diagnósticos de primera línea sobre problemas de sistema, con respuestas ancladas a runbooks.
- Respuesta a preguntas fundamentadas en documentación operativa (grounded runbook Q&A).
- Escalado explícito de casos fuera de alcance hacia modelos pares (ThoxMini, ThoxClip) o al modelo de nivel host mediante MeshStack.
- Política de declinación deliberada: ante internals desconocidos, direcciones o detalles no publicados, emite la respuesta de declinación prescrita en lugar de improvisar.
- Generación de texto conversacional en inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (el build no emite segmentos de pensamiento).

## Casos de uso

- Triaje de tickets de sistemas: el modelo clasifica y enruta incidencias de kernel y sistema operativo antes de que lleguen a un ingeniero humano, aprovechando su entrenamiento específico en categorías de fallo y su política de declinación ante casos ambiguos.
- Diagnóstico de primera línea en servidores: ante un error de arranque o un fallo de servicio, genera una secuencia de comprobaciones anclada a runbooks, que el arnés ejecuta y valida; el modelo nunca ejecuta comandos por sí mismo.
- Asistente de operaciones en el borde: desplegado en ThoxAir o ThoxKey vía Ollama con cuantización Q4_K_M, ofrece respuestas de triaje con requisitos de memoria mínimos en hardware de poca capacidad.
- Puerta de seguridad en pipelines de automatización: actúa como clasificador previo que decide si una petición de administración es segura, ambigua o debe escalarse, con cero escapes destructivos declarados en el bench de tareas OS.
- Soporte interno sobre documentación operativa: responde consultas de runbooks con respuestas fundamentadas y declina cuando la información no está en el corpus, reduciendo alucinaciones en procedimientos críticos.
- Enrutador en arquitecturas multi-modelo: integrado como primer eslabón de una cadena MeshStack, decide qué consultas resolver localmente y cuáles derivar a modelos mayores, ahorrando coste de inferencia en las peticiones simples.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los de la puerta de calidad interna del autor, no benchmarks estándar de la industria.

| Evaluación | Resultado | Notas |
|---|---|---|
| GATE49 | 37/49 | Cero fallos duros; veredicto PASS bajo alcance de respuesta final y de completación cruda |
| GATE-K (categoría desconocida) | 26/26 de disciplina de clase | Compromiso de recall documentado por el autor, no detallado en la información disponible |
| Sondas P16/P17 | Cero escapes | Pruebas de escape de política |
| Bench de tareas OS | Cero escapes destructivos | Pruebas de acciones destructivas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB en Q4_K_M, unos 0,8 GB en Q4_0 y alrededor de 0,9 GB en Q8_0, más overhead de contexto y runtime.
- Pesos en safetensors: el archivo `model.safetensors` ocupa 1.504.827.608 bytes (unos 1,4 GB), lo que requiere alrededor de 2 GB de VRAM en precisión completa más margen para el contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; cabe en RTX 3060, RTX 4060, RTX 4090 y en iGPU con memoria unificada suficiente. Para despliegue en servidor, A100 y H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, con holgura en cualquier tarjeta con 4 GB o más.
- Opciones de despliegue: Ollama (build oficial publicado por el autor), llama.cpp para los GGUF, y servidores compatibles con endpoints de Hugging Face. No se documenta soporte específico de vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOS-Kernel-0.8B | 0,8B | No disponible (entrenamiento a 2048) | Triaje OS/kernel destilado | Apache-2.0 | Hugging Face y Ollama |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Modelo generalista | No disponible en la información | Hugging Face |
| ThoxOS-Kernel-27B (profesor) | 27B | No disponible | Triaje OS/kernel de nivel host | No disponible en la información | Repositorio Thox-ai |

La comparación con alternativas de la misma categoría (modelos de triaje OS/kernel de menos de mil millones de parámetros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se declara soporte multilingüe.
- La política de declinación deliberada implica un compromiso de recall: el autor reconoce que la disciplina de declinación puede hacer que el modelo rechace responder ante casos que sí conocía, y remite a la sección de evaluación de la model card para el detalle completo.
- Riesgo de alucinación en dominios fuera del corpus de kernel y runbooks; el modelo está entrenado para declinar, pero no se documenta una tasa de alucinación medida.
- El modelo nunca debe ejecutar acciones de sistema directamente; su uso seguro depende de un arnés externo que valide y ejecute las propuestas.
- No está cualificado en hardware ThoxAir: el autor declara explícitamente que no se reclaman resultados de cualificación de dispositivo.
- La longitud de contexto efectiva no está documentada; la secuencia de entrenamiento de 2048 tokens limita la ventana práctica de conversaciones y documentos largos.
- Licencia Apache-2.0 para el fine-tune y las adiciones de THOX, con los términos del texto de licencia aplicables; el uso comercial está permitido bajo esa licencia, pero conviene revisar las condiciones de la base Qwen3.5.
- El modelo tiene cero descargas y cero likes en el momento de la ficha, lo que indica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-0.8B
- Ollama: https://ollama.com/Thox-ai/thoxos-kernel-0.8b
- Fábrica de modelos THOX: https://www.thox.ai/models
- Colección de investigación en Hugging Face: https://huggingface.co/collections/Thox-ai/thox-research-and-from-scratch-models-6ae751ac6a7f2517f6072f69
- Campaña Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
