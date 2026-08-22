# StargazerLabs/Qwen3.8-32B-Jumbo

## Resumen

Qwen3.8-32B-Jumbo es un modelo de lenguaje de 31.922.952.912 parámetros (~31,9B) creado por StargazerLabs mediante una técnica experimental denominada "organ transplant" (trasplante de órganos) o model surgery. En lugar de podar capas para reducir el tamaño, este modelo añade capas procedentes de un modelo hermano, Qwen3.6-27B, sobre el modelo base Qwen3-8B, resultando en una arquitectura de 76 capas (frente a las 64 originales). El objetivo es recuperar la amplitud de conocimiento factual que se perdió durante el entrenamiento continuado de Qwen3.8, manteniendo al mismo tiempo las capacidades mejoradas de código y agénticas de este último.

El modelo se distribuye en formato MLX (optimizado para Apple Silicon) y en safetensors, con licencia Apache-2.0 heredada de ambos parentales. Su relevancia radica en que demuestra una aproximación alternativa al escalado de modelos: en lugar de entrenar desde cero, se aprovecha la similitud de pesos entre modelos de una misma familia para insertar capas donantes y ampliar la capacidad sin necesidad de un entrenamiento completo. Está pensado para desarrolladores e investigadores que quieran explorar técnicas de composición de modelos, aunque su carácter experimental y la ausencia de benchmarks públicos limitan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso, 76 capas) |
| Parametros totales | 31.922.952.912 (~31,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, 8-bit, 4-bit, 3-bit |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Qwen3.8-32B-Jumbo es el resultado de un proceso de "organ transplant" descrito en la model card del autor. Se parte de Qwen3-8B (3.8) y Qwen3.6-27B, que comparten arquitectura y una similitud coseno mediana global de 0.917 en sus pesos. El procedimiento consta de cuatro pasos: primero, un "alignment census" que mide la similitud capa a capa entre ambos modelos, agrupando las 64 capas en 16 órganos de 4 capas cada uno. Segundo, una clasificación por deriva relativa, identificando los órganos más cambiados durante el entrenamiento continuo de Qwen3.8. Tercero, la selección de los tres órganos con mayor deriva (órganos 3, 5 y 10, con cosenos 0.884, 0.888 y 0.904 respectivamente). Cuarto, el crecimiento mediante la inserción de los órganos donantes de Qwen3.6 inmediatamente antes de los correspondientes originales de Qwen3.8, manteniendo la profundidad nativa. El embedding, la normalización final y la cabeza de lenguaje provienen del Qwen3.8 stock. El resultado es un modelo de 76 capas que conserva el vocabulario y las dimensiones ocultas de Qwen3.

## Capacidades

- Generacion de texto en ingles, con capacidad de conversacion y razonamiento.
- Mantiene las capacidades de codigo y agénticas (tool calling, razonamiento multi-paso) del Qwen3.8 original.
- Restaura la amplitud de conocimiento factual del Qwen3.6-27B donante, segun la hipotesis del autor.
- Compatible con decodificacion especulativa (MTP) usando el drafter de Qwen3.8-27B-MTP, con tasa de aceptacion estimada del 82-89% y aceleracion de 1.6-2.2x.
- No se ha documentado soporte para vision, audio u otras modalidades; es un modelo exclusivamente textual.

## Casos de uso

- **Asistente de codigo con contexto amplio**: puede integrarse en entornos de desarrollo (IDEs, CLI) para generar codigo, explicar fragmentos y refactorizar, aprovechando su capacidad de razonamiento agéntico heredada de Qwen3.8.
- **Agente autonomo para tareas multi-paso**: su soporte de tool calling permite construir pipelines de agentes que consulten APIs, bases de datos o ejecuten scripts, manteniendo un estado de razonamiento coherente.
- **Generacion de documentacion tecnica**: dado su equilibrio entre conocimiento factual (recuperado de Qwen3.6) y capacidad de redaccion, puede producir documentacion de API, guias de uso y explicaciones de codigo.
- **Sistema de preguntas y respuestas sobre dominios especificos**: con un contexto suficientemente largo (no documentado), podria responder consultas complejas sobre un corpus tecnico, aprovechando la amplitud de conocimiento restaurado.
- **Investigacion y prototipado de model surgery**: es un modelo de referencia para quienes estudian tecnicas de composicion de modelos, permitiendo comparar el comportamiento de capas transplantadas frente a modelos densos entrenados desde cero.
- **Experimentos de cuantizacion y despliegue**: al estar disponible en cuantizaciones de 8, 4 y 3 bits, permite evaluar el impacto de la cuantizacion en un modelo de 32B sobre hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar, y no se encontraron evaluaciones externas en la busqueda web. Se recomienda realizar una evaluacion propia antes de considerar su uso en produccion.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bf16, el modelo ocupa aproximadamente 64 GB (tamano del repo: 63.9 GB). Con cuantizacion 8-bit, ~32 GB; con 4-bit, ~16 GB; con 3-bit, ~12 GB.
- **GPU recomendadas**: para bf16, A100 80GB o H100 80GB; para 8-bit, RTX 3090/4090 (24GB) o A6000 (48GB); para 4-bit, RTX 3080/4070 (12-16GB) o Apple Silicon con memoria unificada de 32GB o mas.
- **Si cabe en consumer GPU**: si, con cuantizacion 4-bit en una RTX 4090 (24GB) o en un Mac Studio con M2 Ultra (128GB) usando MLX.
- **Opciones de despliegue**: MLX (para Apple Silicon, con `mlx_vlm.generate`), llama.cpp (si se convierte a GGUF), vLLM o TGI (si se adapta el formato safetensors a los pesos de Qwen3). No se documenta soporte directo para estos ultimos.
- **Latencia y throughput**: no disponibles. Con MTP drafter, la aceleracion estimada es de 1.6-2.2x, pero no hay mediciones reales publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-32B-Jumbo | 31.9B | No disponible | Qwen3 denso (76 capas) | Apache-2.0 | HuggingFace (MLX) |
| Qwen3-32B (oficial) | 32.8B | 32K tokens | Qwen3 denso (64 capas) | Apache-2.0 | HuggingFace |
| Qwen3-8B (padre) | 8.5B | 32K tokens | Qwen3 denso (64 capas) | Apache-2.0 | HuggingFace |
| Qwen3.6-27B (donante) | 27.4B | No disponible | Qwen3 denso (64 capas) | Apache-2.0 | HuggingFace |

La comparativa muestra que el modelo Jumbo tiene un tamano intermedio entre el padre (8B) y el donante (27B), con la arquitectura de 76 capas. Su principal diferencia es la tecnica de construccion, no el rendimiento, ya que no hay benchmarks que lo avalen. Qwen3-32B oficial es un modelo entrenado de forma convencional, con contexto documentado de 32K tokens, mientras que el Jumbo no especifica su longitud de contexto.

## Limitaciones y advertencias

- **Modelo experimental**: cuenta con 0 descargas y 0 likes en HuggingFace, y no hay evidencias de evaluacion externa ni de uso en produccion.
- **Riesgo de alucinacion**: al ser un modelo fusionado sin entrenamiento adicional, la coherencia interna puede verse afectada, especialmente en tareas que requieran consistencia entre capas transplantadas y originales.
- **Idioma limitado**: solo se declara ingles; el rendimiento en otros idiomas no se ha evaluado.
- **Longitud de contexto desconocida**: no se especifica el contexto maximo, lo que impide planificar su uso en tareas de ventanas largas sin una prueba previa.
- **Tecnica no validada**: el "organ transplant" es una metodologia experimental; no hay evidencia de que la hipotesis de restauracion de conocimiento se cumpla en la practica.
- **Licencia**: Apache-2.0 permite uso comercial, pero la falta de garantias y de documentacion de rendimiento limita su idoneidad para entornos de produccion.
- **Requisitos de hardware**: para bf16, se necesita al menos 64GB de VRAM, lo que excluye la mayoria de hardware consumer sin cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo
- Version 8-bit: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-8bit
- Version 4-bit: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-4bit
- Version 3-bit: https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-3bit
- Qwen3-8B (padre): https://huggingface.co/Qwen/Qwen3-8B
- Qwen3.6-27B (donante): https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Coleccion Jumbo de StargazerLabs: https://huggingface.co/collections/StargazerLabs/jumbo
