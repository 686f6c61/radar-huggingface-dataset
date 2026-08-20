# StargazerLabs/Qwen3.8-23B-Mini-Me-8bit

## Resumen

Qwen3.5-23B-Mini-Me-8bit es un modelo de lenguaje multimodal desarrollado por StargazerLabs, que parte del modelo Qwen3.5-27B de Alibaba y aplica una poda selectiva de capas (layer pruning) junto con una cuantizacion de 8 bits. El resultado es un modelo mas pequeño, rapido y ligero que su progenitor, disenado para tareas de codificacion y trabajo agente, con una ventana de contexto nominal de 262.144 tokens.

La relevancia de este modelo radica en su enfoque de optimizacion: en lugar de entrenar desde cero, StargazerLabs ha eliminado 12 capas del transformer original (52 capas restantes) basandose en estudios de lesion probing, conservando intacto el torre de vision. Esto permite ejecutar un modelo de 27B con una huella de memoria significativamente menor, manteniendo la mayor parte de las capacidades del modelo original.

La cuantizacion de 8 bits y el formato MLX hacen que este modelo sea especialmente adecuado para despliegue en hardware Apple Silicon, aunque tambien puede ejecutarse en otras plataformas. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opcion atractiva para integraciones en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), 52 capas |
| Parametros totales | 6.742.524.688 (6,74B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX, safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Qwen3.5-27B, un transformer denso multimodal con torre de vision integrada. La innovacion principal es la eliminacion de 12 capas del transformer original: se han eliminado las capas 12-15, 24-27 y 36-39, seleccionadas mediante lesion probing, una tecnica que evalua sistematicamente el impacto de eliminar distintas combinaciones de capas. El torre de vision permanece intacta.

El modelo no ha sido entrenado desde cero, sino que es una version podada y cuantizada del Qwen3.5-27B. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o el proceso de alineacion, ya que el autor se ha centrado en el proceso de poda y cuantizacion. La cuantizacion de 8 bits reduce el peso del modelo de aproximadamente 23B a 6,74B parametros, manteniendo la funcionalidad multimodal.

## Capacidades

- Generacion de texto y razonamiento: el modelo mantiene las capacidades de razonamiento del Qwen3.5-27B, aunque con un rendimiento ligeramente inferior en la mayoria de las tareas.
- Codigo y trabajo agente: el autor indica que el modelo funciona bien en tareas de codificacion y trabajo agente, incluyendo conversaciones multi-turno largas y llamadas a herramientas.
- Retencion de instrucciones: el modelo mantiene las instrucciones mas alla de su contexto nominal, lo que sugiere una buena gestion de contextos largos.
- Capacidades multimodales: al mantener el torrevision intacto, el modelo conserva la capacidad de procesar imagenes junto con texto.
- Configuracion de razonamiento: hereda del Qwen3.5 la capacidad de activar o desactivar el modo de razonamiento (thinking mode).
- Llamada a herramientas (tool calling): soportado, como se indica en el uso interno del autor.

## Casos de uso

- Desarrollo de codigo asistido en entornos con recursos limitados: el modelo puede integrarse en IDEs o pipelines de CI/CD para sugerencias de codigo, con la ventaja de requerir menos VRAM que el Qwen3.5-27B original.
- Agentes conversacionales con contexto largo: su ventana de 262K tokens permite mantener conversaciones multi-turno con historial extenso, lo que es util para asistentes de atencion al cliente o soporte tecnico.
- Analisis de documentos largos con soporte de imagen: gracias a su capacidad multimodal y su contexto amplio, puede procesar documentos extensos que incluyan capturas de pantalla o diagramas.
- Automatizacion de tareas agente (agentic workflows): su soporte para tool calling y su robustez en conversaciones largas lo hacen adecuado para agentes que necesitan interactuar con APIs y bases de datos.
- Despliegue en hardware de consumo: la cuantizacion de 8 bits y el formato MLX permiten ejecutar el modelo en Macs con Apple Silicon o GPUs de gama media, facilitando prototipos y pruebas locales.
- Investigacion en poda de modelos: el modelo es un caso de estudio interesante para investigadores que trabajan en optimizacion de arquitecturas mediante la eliminacion de capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. El autor indica que ha realizado pruebas internas de forma cualitativa, sin metricas cuantitativas. Se menciona que el modelo es "ligeramente menos inteligente" que el Qwen3.5-27B en la mayoria de las tareas, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 8 bits y 6,74B parametros, se estima que necesita alrededor de 8-10 GB de VRAM para inferencia, aunque no se proporcionan datos oficiales.
- GPU recomendadas: el formato MLX esta optimizado para Apple Silicon (M1/M2/M3/M4). En GPU de NVIDIA, se puede usar con adaptadores como MLX-E, aunque no se ha probado oficialmente.
- En consumer GPU: si, cabe en tarjetas como RTX 3090, RTX 4090, o incluso RTX 4060 con 12 GB de VRAM.
- Opciones de despliegue: MLX (nativo), y potencialmente vLLM o llama.cpp si se convierte a GGUF, aunque no hay soporte oficial.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-27B | 27B | 262K | Apache 2.0 | Modelo base, mayor capacidad, mayor VRAM |
| Qwen3.5-23B-Mini-Me (8bit) | 6,74B (8bit) | 262K | Apache 2.0 | Modelo podado y cuantizado, menor VRAM, menor rendimiento |
| Qwen3-8B | 8B | 32K | Apache 2.0 | Modelo oficial de Qwen, menor contexto, sin multimodalidad |

La comparativa mas relevante es con el Qwen3.5-27B original: el Mini-Me ofrece un rendimiento ligeramente inferior pero con una huella de memoria mucho menor, lo que lo hace mas accesible para hardware de consumo.

## Limitaciones y advertencias

- Rendimiento reducido: el modelo es "un poco menos inteligente" que el Qwen3.5-27B en la mayoria de las tareas, segun el autor.
- Sin benchmarks oficiales: no hay resultados de evaluaciones estandar que permitan medir el impacto exacto de la poda.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o incorrecto, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: no se ha especificado los idiomas soportados, aunque se hereda del Qwen3.5, que es multilingue con un enfoque en ingles y chino.
- Formato propietario: el formato MLX esta orientado a Apple Silicon; para otros entornos puede requerir conversiones no oficiales.
- Soporte limitado: es un modelo de un laboratorio independiente, sin el soporte de una comunidad amplia como el Qwen original.

## Enlaces

- HuggingFace: https://huggingface.co/StargazerLabs/Qwen3.8-23B-Mini-Me-8bit
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pagina de OpenLM.ai sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Modelo Qwen3-8B en HuggingFace: https://huggingface.co/Qwen/Qwen3-8B
- Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de Qwen: https://qwen.ai/blog?id=qwen3
