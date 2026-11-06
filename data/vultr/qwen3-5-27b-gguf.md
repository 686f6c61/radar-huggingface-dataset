# vultr/Qwen3.5-27B-GGUF

## Resumen

Qwen3.5-27B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Qwen3.5-27B, publicada por Vultr. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un transformer denso de 26.895.998.464 parámetros (aproximadamente 27B) que procesa entradas de imagen y texto y genera texto, lo que lo sitúa en la categoría image-text-to-text. Esta variante GGUF está pensada para su uso con llama.cpp y runtimes compatibles, lo que facilita el despliegue en entornos donde no se dispone de las GPUs de gran capacidad que requeriría el modelo en precisión completa.

La aportación específica de Vultr no es un reentrenamiento, sino una estrategia de cuantización híbrida: en lugar de aplicar una única precisión a toda la red, se asigna a cada capa una precisión distinta en función de una puntuación de importancia medida, de modo que los bits se concentran donde más afectan a la salida. El resultado es un repositorio de 70,6 GB que conserva la licencia Apache 2.0 del modelo original.

El modelo resulta relevante por su combinación de tamaño contenido (27B), contexto muy largo (262K tokens, extensible hasta aproximadamente 1M) y capacidad multimodal, con soporte declarado para tool calling y uso conversacional. La ficha se centra en la variante GGUF; los detalles de entrenamiento del modelo base no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen35, transformer denso (causal LM multimodal) |
| Parámetros totales | 26.895.998.464 (~27B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens, extensible a ~1M |
| Tipos de cuantización | GGUF con cuantización híbrida por capas (precisión elegida por capa según puntuación de importancia); niveles concretos no disponibles |
| Idiomas soportados | no disponible (campo truncado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |
| Capas | 64 |
| Capas del codificador visual | 27 |
| Hidden size | 5.120 |
| Hidden size del codificador visual | 1.152 |
| Cabezas de atención | 24 |
| Cabezas key-value | 4 (GQA) |
| Tamaño intermedio | 17.408 |
| Vocabulario | 248.320 |
| Tamaño del repositorio | 70,6 GB |
| Modelo base | Qwen/Qwen3.5-27B |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de 64 capas con hidden size de 5.120, 24 cabezas de atención y 4 cabezas key-value, lo que implica atención con query grouping (GQA) que reduce el coste de memoria de la caché KV durante la inferencia. El vocabulario es de 248.320 tokens. La componente multimodal se implementa mediante un codificador visual de 27 capas con hidden size de 1.152, integrado en el pipeline image-text-to-text.

Esta variante GGUF no modifica los pesos en el sentido de un reentrenamiento: aplica una cuantización híbrida por capas, seleccionando la precisión de cada capa a partir de una puntuación de importancia medida. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base utilizó RLHF, DPO u otras técnicas de alineamiento. Tampoco se detallan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de entradas de imagen combinadas con texto (image-text-to-text).
- Comprensión de documentos e imágenes con contexto largo gracias a la ventana de 262K tokens.
- Soporte declarado de tool calling / function calling (etiqueta `endpoints_compatible` y perfil conversacional).
- Uso en agentes y razonamiento multi-paso, según la orientación conversacional del modelo.
- Capacidades multilingües: el campo de idiomas está truncado en la model card, por lo que no se puede confirmar la lista exacta.
- No se documentan capacidades de audio ni modos de pensamiento explícitos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo (262K tokens) y conservar el historial completo de la sesión sin truncamientos agresivos, lo que mejora la coherencia en soporte técnico prolongado.
- Análisis de documentos e imágenes: al aceptar entradas image-text-to-text, permite extraer información de capturas, facturas o diagramas y responder preguntas sobre ellos en un mismo flujo.
- Generación de código asistida: su perfil conversacional y el soporte de tool calling permiten integrarlo en asistentes de IDE o pipelines de revisión que invocan herramientas externas (linters, tests, APIs).
- Agentes autónomos de múltiples pasos: la ventana de contexto extensible hasta ~1M facilita tareas que acumulan trazas largas de herramientas y resultados intermedios.
- Despliegue en infraestructura propia con llama.cpp: la cuantización híbrida por capas reduce los requisitos de memoria frente al modelo en precisión completa, lo que permite servir el modelo en servidores con GPUs de gama alta pero no necesariamente de datacenter.
- Procesamiento por lotes de contenido multimodal: clasificación y resumen de imágenes con texto asociado en entornos donde se prefiere un runtime ligero (llama.cpp) frente a frameworks de serving pesados.
- Investigación y evaluación de cuantizaciones: el repositorio sirve como referencia para estudiar el impacto de la cuantización híbrida por capas en un modelo multimodal de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio ocupa 70,6 GB, por lo que la variante de mayor precisión requiere del orden de esa cifra de memoria, mientras que las variantes de menor precisión reducen el requisito proporcionalmente (no se detallan los niveles concretos).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 27B en cuantizaciones de 4-8 bits suele requerir GPUs de 24 GB o superiores, pero este dato no está confirmado para esta variante.
- ¿Cabe en GPU consumer? No confirmado. Con cuantizaciones bajas podría ajustarse en GPUs de 24 GB (por ejemplo, RTX 4090), pero no hay datos oficiales en la información disponible.
- Opciones de despliegue: llama.cpp (formato nativo GGUF) y runtimes compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de serving, aunque no se especifican los frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-GGUF (Vultr) | ~27B | 262K (ext. ~1M) | Imagen + texto | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-27B (base) | ~27B | 262K (ext. ~1M) | Imagen + texto | Apache 2.0 | Pesos originales en Hugging Face |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base y su variante cuantizada.

## Limitaciones y advertencias

- La model card está truncada en el campo de idiomas soportados, por lo que no se puede verificar la cobertura multilingüe real.
- No hay datos publicados de benchmarks, sesgos conocidos ni tasas de alucinación; deben evaluarse empíricamente antes de usarlo en producción.
- La cuantización híbrida por capas puede introducir degradaciones no uniformes respecto al modelo original; conviene validar la calidad en las tareas concretas frente a los pesos en precisión completa.
- El contexto de 262K tokens (y la extensión a ~1M) implica un coste de memoria elevado para la caché KV; con 4 cabezas KV el impacto se mitiga, pero sigue siendo significativo en secuencias muy largas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base y las condiciones de atribución.
- El repositorio tiene un volumen de descargas bajo (165) y ninguna valoración, por lo que la validación comunitaria es escasa.
- No se documentan restricciones específicas de uso ni políticas de uso aceptable más allá de la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vultr/Qwen3.5-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Vultr (sitio oficial): https://www.vultr.com/
- Vultr Docs: https://docs.vultr.com/
- Vultr Discover: https://discover.vultr.com/
- Vultr en Wikipedia: https://en.wikipedia.org/wiki/Vultr
