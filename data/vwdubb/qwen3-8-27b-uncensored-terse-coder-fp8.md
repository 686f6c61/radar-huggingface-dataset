# vwdubb/Qwen3.8-27B-Uncensored-Terse-Coder-FP8

## Resumen

vwdubb/Qwen3.8-27B-Uncensored-Terse-Coder-FP8 es una fusión (merge) de tipo LoRA sobre orcarouter/Qwen3.8-27B-Uncensored, publicada por el usuario vwdubb y cuantizada en FP8 por bloques (block-FP8) mediante la librería compressed-tensors. El modelo base es, a su vez, una versión abliterated —es decir, con el mecanismo de rechazo eliminado— del Qwen3.8-27B de Qwen, un transformer denso de unos 27.800 millones de parámetros con atención híbrida (Gated DeltaNet lineal combinada con atención completa), control flexible del razonamiento y una cabeza MTP de decodificación especulativa. El apelativo "Terse-Coder" y los tags del repositorio (merge, lora, token-efficient, coding) indican que la fusión está orientada a producir código y respuestas concisas, con menor gasto de tokens.

El modelo resuelve dos necesidades concretas: por un lado, ofrecer una variante sin censura para tareas de red teaming y evaluación de seguridad, tal y como sugiere el tag ai-red-team; por otro, reducir el coste de generación en flujos de trabajo de programación, donde la verbosidad del modo pensamiento es un lastre. La cuantización FP8 reduce el peso en disco y en memoria a aproximadamente un byte por parámetro (38,5 GB de repositorio frente a los ~55 GB que ocuparían los pesos en BF16), manteniendo la compatibilidad con motores de inferencia modernos.

Es relevante ahora porque combina tres tendencias simultáneas: la atención híbrida como alternativa de bajo coste a la atención completa, las cabezas MTP para decodificación especulativa y la publicación de pesos en formatos de cuantización listos para servir en producción (compressed-tensors/FP8). Conviene señalar que el repositorio tiene acceso restringido (gated), requiere aceptar condiciones en HuggingFace y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), cabeza MTP de decodificación especulativa y capacidades nativas de visión-lenguaje (heredadas del modelo base) |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 por bloques (block-FP8) mediante compressed-tensors; en el ecosistema del modelo base existen builds GGUF de 2 a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizados con compressed-tensors), 38,5 GB de repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B: un transformer denso de 27,8 B de parámetros que sustituye parte de las capas de atención completa por capas Gated DeltaNet de atención lineal, lo que reduce el coste computacional y de memoria durante la generación de secuencias largas. Incorpora además una cabeza MTP (multi-token prediction) que habilita decodificación especulativa, y mantiene un codificador visual para entrada de imagen y vídeo, lo que lo convierte en un modelo vision-lenguaje nativo. El control flexible del razonamiento permite ajustar cuántos tokens de "pensamiento" emite el modelo antes de responder.

Sobre esa base, orcarouter/Qwen3.8-27B-Uncensored aplica una abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) y vwdubb construye encima una fusión de adaptadores LoRA, tal y como reflejan los tags merge y lora. El resultado se publica cuantizado en FP8 por bloques. No se ha proporcionado información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original o en las adaptaciones de la comunidad; estos datos figuran como no disponibles.

## Capacidades

- Generación de texto conversacional y mantenimiento de diálogo multiturno.
- Razonamiento explícito con control flexible del esfuerzo de pensamiento (modo thinking ajustable).
- Generación de código con salida deliberadamente tersa y eficiente en tokens, según los tags token-efficient y coding del repositorio.
- Soporte de tool calling o function calling, heredado del modelo base.
- Capacidades de agente y razonamiento multi-paso mediante llamadas encadenadas a herramientas.
- Entrada multimodal de imagen y vídeo (vision-lenguaje nativo); en el ecosistema del modelo base se distribuye el proyector de visión mmproj junto a los pesos.
- Decodificación especulativa mediante cabeza MTP, orientada a aumentar el throughput.
- Comportamiento sin rechazos (abliterated): el modelo no aplica las negativas típicas de seguridad del modelo original.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para redactar parches, tests unitarios o mensajes de commit; el enfoque terso reduce el número de tokens facturados por petición frente al modelo base.
- Asistencia de programación en IDE: con tool calling es posible conectarlo a servidores MCP o APIs de repositorios para consultar ficheros y proponer refactorizaciones dentro del editor.
- Revisión de código automatizada: análisis de diffs y generación de comentarios de revisión concisos, aprovechando la verbosidad reducida para no saturar las interfaces de revisión.
- Agentes autónomos de resolución de tareas: razonamiento multi-paso con llamadas a herramientas, usando la cabeza MTP para acelerar la decodificación en bucles de agente con muchas iteraciones.
- Red teaming y evaluación de seguridad: su naturaleza abliterated lo hace útil para generar prompts adversarios y evaluar las defensas de otros sistemas, siempre en entornos controlados y con las salvaguardas legales correspondientes.
- Extracción estructurada de documentos con componente visual: al conservar el codificador de visión del modelo base, puede procesar capturas, diagramas o formularios escaneados y devolver JSON estructurado.
- Migración y traducción de código entre lenguajes: tareas de reescritura donde la salida concisa y sin explicaciones superfluas es preferible.
- Generación de documentación técnica breve: docstrings, README y comentarios de API con formato compacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones (MMLU, HumanEval, GSM8K u otros) y la búsqueda web consultada no aporta cifras para esta fusión concreta. El único dato cuantitativo relacionado con el ecosistema es el de Swift-Qwen3.8-27B, un derivado distinto que declara un 58,3 % menos de tokens de pensamiento con una pérdida inferior al 1 % y una aceleración de 1,95x, pero no corresponde a este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos en FP8: aproximadamente 27,8 GB (1 byte por parámetro). Con caché KV y activaciones, un despliegue realista requiere del orden de 32-40 GB según la longitud de contexto.
- GPU recomendadas para FP8 en una sola tarjeta: NVIDIA L40S (48 GB), RTX 6000 Ada (48 GB), A100 40 GB (ajustado), A100 80 GB o H100 80 GB.
- Configuraciones multi-GPU: dos RTX 4090 de 24 GB con tensor parallelism cubren los pesos, aunque la comunicación entre tarjetas limita el throughput en longitudes de contexto altas.
- GPU de consumo: una única RTX 4090 o RTX 3090 de 24 GB no puede alojar los pesos FP8. Para esos equipos habría que recurrir a builds GGUF de 4 bits del repositorio base; este repositorio concreto no los ofrece.
- Opciones de despliegue: vLLM y SGLang soportan pesos cuantizados con compressed-tensors; TGI y TensorRT-LLM son alternativas viables. Para GGUF, llama.cpp y Ollama son las vías habituales, pero sobre el modelo base, no sobre esta publicación.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para esta fusión.
- Nota de acceso: el repositorio está en modo gated, por lo que es necesario aceptar las condiciones en HuggingFace y autenticarse con un token antes de descargar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwdubb/Qwen3.8-27B-Uncensored-Terse-Coder-FP8 | 27,8 B (denso) | no disponible | FP8 block / compressed-tensors | apache-2.0 | Gated en HuggingFace; 0 descargas |
| orcarouter/Qwen3.8-27B-Uncensored (modelo base) | 27,8 B (denso) | no disponible | GGUF de 2 a 8 bits, con mmproj | apache-2.0 | HuggingFace y Ollama |
| Qwen/Qwen3.8-27B (modelo original) | 27,8 B (denso) | no disponible | BF16 y cuantizaciones de la comunidad | no disponible en la información consultada | Repositorio oficial de Qwen |
| vwdubb/Swift-Qwen3.8-27b-FP8 | 27,8 B (denso) | no disponible | FP8 | no disponible en la información consultada | HuggingFace |
| bl5591/Qwen3.8-27B-Uncensored-FP8 | 27,8 B (denso) | no disponible | FP8 block | no disponible en la información consultada | Bucket de HuggingFace |

Las diferencias entre estas variantes no están en el tamaño ni en la arquitectura, que comparten, sino en el post-entrenamiento (abliteración, fusión LoRA) y en el formato de pesos. No hay datos de rendimiento comparativo publicados para establecer una jerarquía de calidad entre ellas.

## Limitaciones y advertencias

- Sesgos: no disponible. No se ha publicado ninguna evaluación de sesgos para esta fusión ni para su modelo base.
- Alucinación: el modelo ha sido abliterated y ajustado con LoRA de la comunidad; no hay evaluaciones de fidelidad factual que permitan acotar el riesgo de invención de datos, por lo que se recomienda verificación externa en usos críticos.
- Ausencia de rechazos: al eliminar el mecanismo de negativa, el modelo puede producir contenido dañino, ilegal o inseguro sin filtros propios. Es imprescindible desplegarlo con capas de moderación externas y en contextos legales controlados.
- Idiomas y contexto: no disponible. Se desconoce la ventana de contexto efectiva y la cobertura lingüística real de esta variante.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Qwen y del proceso de abliteración, ya que la licencia de los pesos originales condiciona la redistribución.
- Trazabilidad: el repositorio tiene 0 descargas y 0 valoraciones, y fue creado y actualizado en la misma fecha (25 de septiembre de 2026). No hay garantía de mantenimiento ni de reproducibilidad del proceso de fusión.
- Formato: los pesos FP8 con compressed-tensors no son compatibles con llama.cpp u Ollama directamente; requieren motores que soporten dicho formato.
- Acceso restringido: al estar gated, no puede descargarse de forma anónima ni automatizarse sin gestionar previamente la aceptación de condiciones.
- Uso en producción: se recomienda validar el modelo en un conjunto de evaluación propio antes de desplegarlo, dado que no existen benchmarks publicados para esta variante concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Qwen3.8-27B-Uncensored-Terse-Coder-FP8
- Modelo base (abliterated): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Build de Ollama del modelo base: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Derivado con razonamiento eficiente: https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-FP8
- Repositorio de ejecución local: https://github.com/Wassimyounes01/qwen38-uncensored
- Guía de despliegue local y en nube: https://thegeekinsights.com/run-uncensored-qwen-3-8-27b/
- Build FP8 alternativa (bucket): https://huggingface.co/buckets/bl5591/Qwen3.8-27B-Uncensored-FP8
