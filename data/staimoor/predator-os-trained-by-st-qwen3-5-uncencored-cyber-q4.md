# Staimoor/predator-os-trained-by-st-qwen3.5-uncencored-cyber-q4

## Resumen

`Staimoor/predator-os-trained-by-st-qwen3.5-uncencored-cyber-q4` es una distribución en formato GGUF de un modelo de la familia Qwen3.5 con aproximadamente 4.205 millones de parámetros (4,2 B), publicada por el usuario Staimoor. Según el nombre de los ficheros incluidos, el modelo deriva de `Huihui-Qwen3.5-4B-abliterated`, es decir, una variante "abliterated" del Qwen3.5-4B en la que se ha aplicado la técnica de abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) para reducir las negativas del modelo ante ciertas peticiones. El repositorio incluye además un fichero `mmproj` en BF16, lo que indica soporte de entrada de imagen (modelo visión-lenguaje) a través de `llama-mtmd-cli`.

La relevancia de esta ficha es limitada pero conviene ser preciso: se trata de una conversión a GGUF realizada con Unsloth, orientada a inferencia local con llama.cpp, con dos ficheros publicados (BF16 y Q4_K_M) y un tamaño de repositorio de 3,4 GB. No hay model card técnica más allá de las instrucciones de ejecución, ni licencia declarada, ni idiomas, ni pipeline, ni resultados de evaluación. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria alguna.

Por tanto, esta ficha documenta lo que se puede verificar (parámetros, cuantizaciones, formato, linaje declarado en los nombres de fichero) y marca explícitamente como "no disponible" todo lo demás. Cualquier uso en producción exige una evaluación propia previa, especialmente por la ausencia de licencia y por el efecto de la abliteración sobre el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5, con proyector multimodal (`mmproj`) para entrada de imagen; inferido del nombre de los ficheros y de las etiquetas `qwen3_5` y `vision-language-model`, no documentado en la model card |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y BF16 (ficheros publicados en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp / llama-cpp) |
| Tamano del repositorio | 3,4 GB |
| Ficheros publicados | `Huihui-Qwen3.5-4B-abliterated.BF16-mmproj.gguf`, `Huihui-Qwen3.5-4B-abliterated.Q4_K_M.gguf` |
| Pipeline de HuggingFace | no disponible |
| Etiquetas | `gguf`, `qwen3_5`, `llama.cpp`, `llama-cpp`, `unsloth`, `vision-language-model`, `endpoints_compatible`, `region:us`, `conversational` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) de este modelo. Lo único verificable es su linaje declarado en los nombres de fichero: `Huihui-Qwen3.5-4B-abliterated`, un derivado de la familia Qwen3.5 con 4,2 B de parámetros totales según los metadatos de safetensors. La presencia de un fichero `mmproj` en BF16 junto al quantizado Q4_K_M indica que el paquete incluye un proyector multimodal separado, necesario para pasar imágenes al modelo mediante `llama-mtmd-cli`; el formato `mmproj` es el que emplea llama.cpp para adaptadores visión-lenguaje.

El término "abliterated" hace referencia a una técnica de modificación de pesos que identifica una dirección en el espacio de activaciones asociada a las respuestas de rechazo y la proyecta fuera, de modo que el modelo deja de negarse a responder ante determinadas categorías de peticiones. Es una intervención sobre pesos, no un reentrenamiento, y no requiere datos adicionales; su efecto es una reducción de la alineación de seguridad heredada del modelo base. El nombre del repositorio añade los sufijos "uncencored" (sic) y "cyber", que sugieren un ajuste o especialización orientada a ciberseguridad y a la ausencia de filtrado, pero no existe documentación que respalde ni el proceso ni los datos empleados. La conversión a GGUF se realizó con Unsloth, según la model card.

## Capacidades

- Generación de texto conversacional multi-turno: la etiqueta `conversational` y el uso de `llama-cli` con plantilla Jinja (`--jinja`) indican soporte de chat estructurado con roles.
- Entrada de imagen: el fichero `mmproj` en BF16 y la etiqueta `vision-language-model` implican capacidad de procesar imágenes junto a texto, ejecutable con `llama-mtmd-cli`.
- Inferencia local en CPU/GPU mediante llama.cpp, sin dependencia de servicios externos.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse a través de `llama-server` con una API compatible con OpenAI.
- Razonamiento y código: no documentado específicamente para esta variante; heredado, en su caso, del modelo base Qwen3.5-4B, sin verificación disponible.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo "thinking" explícito: no documentado.
- Idiomas: no disponibles; el modelo base Qwen3.5 es multilingüe, pero no hay confirmación para esta conversión ni datos sobre calidad en castellano.
- Comportamiento sin filtrado de rechazo: por la abliteración declarada, se espera una menor tasa de negativas, sin que exista evaluación publicada del efecto real.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio para medir cuantitativamente cómo cambia la tasa de rechazo y la calidad de respuesta tras eliminar la dirección de rechazo, comparando Q4_K_M contra el BF16 del mismo repositorio para aislar el efecto de la cuantización.
- Red teaming y evaluación de seguridad: al carecer de filtrado de rechazo, es útil como generador de prompts adversariales y de respuestas "sin restricciones" en entornos controlados de auditoría, siempre con supervisión humana y sin exposición a usuarios finales.
- Despliegue local air-gapped: con 4,2 B de parámetros y un fichero Q4_K_M de aproximadamente 2,6 GB, cabe en equipos sin conexión externa; útil para prototipos en portátiles con GPU de 8 GB o en CPU, donde la confidencialidad del dato impide usar APIs.
- Procesamiento de documentos con imagen: usando `llama-mtmd-cli`, el proyector multimodal permite extraer texto de capturas, formularios o diagramas en un pipeline local de digitalización, sin enviar las imágenes a terceros.
- Asistente conversacional embebido en herramientas de desarrollo: mediante `llama-server` con plantilla Jinja se puede exponer una API compatible con OpenAI y conectarla a editores o CLIs internos para autocompletado y explicación de fragmentos, aceptando la pérdida de calidad frente a modelos mayores.
- Base para fine-tuning posterior: al estar en GGUF no es directamente reentrenable, pero el linaje `Huihui-Qwen3.5-4B-abliterated` permite localizar el checkpoint original en safetensors y usarlo como punto de partida para LoRA sobre dominios concretos, reutilizando después esta misma receta de conversión con Unsloth.
- Generación de texto en experimentos de ciberseguridad ofensiva documentada: dado el sufijo "cyber" del nombre, puede emplearse para generar explicaciones de técnicas y payloads en laboratorios de formación; conviene verificar antes si el modelo realmente incorpora ese ajuste, porque no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K, MMMU ni de evaluaciones multimodales para esta conversión, ni comparaciones con el modelo base o con la variante abliterated sin cuantizar.

## Requisitos de hardware

| Cuantizacion | Peso aproximado de los pesos | VRAM estimada en inferencia | GPU de ejemplo |
|---|---|---|---|
| Q4_K_M (texto) | ~2,6 GB (4,2 B a ~4,85 bits/peso) | ~3,5-4,5 GB incluyendo cache KV moderada | RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 |
| Q4_K_M + `mmproj` BF16 | ~3,4 GB (tamano del repo) | ~4,5-6 GB con imágenes | RTX 3060 12 GB, RTX 4070 Ti, L4 |
| BF16 | ~8,4 GB (4,2 B a 2 bytes/peso) | ~10-12 GB | RTX 4080/4090, A10G, L4 24 GB, A100 |

- Cálculos de VRAM derivados del número de parámetros y de las cuantizaciones indicadas; no son mediciones publicadas por el autor.
- Cabe en GPU de consumo: sí, en Q4_K_M con 8 GB o más; en BF16 requiere 16 GB o más para trabajar con comodidad.
- En CPU: viable con llama.cpp en Q4_K_M; el throughput depende del número de núcleos y del ancho de banda de memoria, sin datos medidos disponibles.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), Ollama y LM Studio mediante importación de GGUF. vLLM y TGI no están recomendados para este paquete: el soporte de GGUF en vLLM es experimental y no cubre proyectores multimodales, y TGI no carga GGUF.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo publicadas para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Staimoor/predator-os-...-q4` (este) | ~4,2 B | no disponible | no disponible | GGUF (Q4_K_M, BF16) + mmproj | Conversión Unsloth, 0 descargas, sin evaluación |
| `Huihui-Qwen3.5-4B-abliterated` (origen declarado) | ~4,2 B | no disponible | no disponible | safetensors (presumiblemente) | Checkpoint del que derivan los GGUF; reentrenable |
| Qwen3.5-4B (modelo base de la familia) | ~4,2 B | no disponible | no disponible | múltiples | Alineación de seguridad intacta; sin abliterar |
| Otras conversiones GGUF abliterated de 4 B de la comunidad | ~4 B | no disponible | habitualmente no disponible | GGUF | Calidad y comportamiento variables; sin benchmarks comparables |

No se dispone de datos verificados de contexto, licencia ni rendimiento para las alternativas en la información proporcionada; la comparación se limita al linaje, el tamaño y el formato. No se han encontrado evaluaciones que permitan afirmar que esta conversión supere o iguale a su modelo de origen.

## Limitaciones y advertencias

- Ausencia total de licencia: no se declara ninguna, lo que impide jurídicamente asumir permisos de uso comercial, redistribución o modificación. Es el principal bloqueo para cualquier uso en producción.
- Modelo abliterated: la eliminación de la dirección de rechazo reduce la alineación de seguridad de forma deliberada. Se espera mayor propensión a generar contenido dañino, instrucciones peligrosas o texto ofensivo, sin que exista una evaluación publicada de la magnitud del efecto.
- Riesgo de alucinación: con 4,2 B de parámetros, la tasa de fabricación de datos es estructuralmente alta en tareas de conocimiento factual, matemáticas y citas. No hay benchmarks que acoten ese riesgo.
- Procedencia no verificada: 0 descargas, 0 likes, sin pipeline, sin idiomas declarados y sin model card técnica. El sufijo "predator-os" y "cyber" no se corresponde con ninguna documentación de entrenamiento o dataset.
- Contexto desconocido: se desconoce la ventana nativa y si la plantilla Jinja la recorta. No se debe asumir ninguna cifra sin probarla.
- Idiomas: no hay datos de calidad en castellano. El comportamiento multilingüe se hereda, en su caso, del modelo base, pero la abliteración puede degradar la coherencia en lenguas con menos representación.
- Cuantización Q4_K_M: introduce pérdida de calidad respecto al BF16, especialmente en tareas de razonamiento y en vision-lenguaje. El `mmproj` permanece en BF16, por lo que el adaptador visual no está cuantizado.
- Soporte multimodal limitado por herramienta: solo `llama-mtmd-cli` y derivados de llama.cpp cargan el `mmproj`; no hay soporte en vLLM ni en TGI.
- Resultados de búsqueda web no utilizables: las consultas devolvieron exclusivamente páginas de contenido para adultos sin relación con el modelo. No se ha podido verificar ningún dato externo sobre el autor ni sobre el proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/Staimoor/predator-os-trained-by-st-qwen3.5-uncencored-cyber-q4
- Repositorio de Unsloth (herramienta de conversión citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime indicado por el autor): https://github.com/ggml-org/llama.cpp
- Modelo de origen declarado en los nombres de fichero (`Huihui-Qwen3.5-4B-abliterated`): no se ha proporcionado la URL del repositorio; no disponible.
- Paper, blog o demo del autor: no disponibles. La búsqueda web no devolvió resultados relevantes.
