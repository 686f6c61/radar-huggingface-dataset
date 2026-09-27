# TheWirelessPhoenix/Qwen3.5-4B-abliterated-huihui-ai

## Resumen

TheWirelessPhoenix/Qwen3.5-4B-abliterated-huihui-ai es una conversión al formato MLX del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, que a su vez deriva del Qwen/Qwen3.5-4B. Se trata, por tanto, de un modelo multimodal de tipo image-text-to-text (entrada de imagen y texto, salida de texto) con 4.539.265.536 parámetros y pesos cuantizados a 4 bits, empaquetados en safetensors para su ejecución con la librería mlx-vlm (versión 0.7.3) sobre hardware Apple Silicon.

La particularidad del modelo es doble. Por un lado, la variante "abliterated" de huihui-ai aplica una modificación de pesos orientada a eliminar la dirección de rechazo aprendida durante el alineamiento, de modo que el modelo apenas declina peticiones que el modelo original rechazaría. Por otro, esta ficha corresponde a la conversión MLX, pensada para inferencia local en Macs con chip Apple (M1 en adelante) sin necesidad de GPU dedicada.

Es relevante ahora porque permite ejecutar un modelo multimodal de ~4B con licencia Apache 2.0 en portátiles Apple, con un peso en disco de 3,1 GB, lo que abarata mucho las pruebas de pipelines de visión-lenguaje sin censura y de investigación sobre alineamiento y refusal. El repositorio no incluye resultados de benchmarks, información de entrenamiento ni lista de idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (modelo derivado de Qwen3.5-4B; multimodal image-text-to-text) |
| Parámetros totales | 4.539.265.536 (dato real de safetensors) |
| Parámetros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (etiqueta "4-bit" del repositorio); no se ofrece otra precisión en este repositorio |
| Idiomas soportados | no disponible (el repositorio no los declara) |
| Licencia | apache-2.0 (enlace a la licencia del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors en formato MLX, cuantizados a 4 bits |
| Librería | mlx (inferencia con mlx-vlm 0.7.3) |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 3,1 GB |
| Etiquetas | mlx, safetensors, qwen3_5, abliterated, uncensored, conversational, base_model:huihui-ai/Huihui-Qwen3.5-4B-abliterated |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-26 |
| Última actualización | 2026-09-26 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna en la documentación proporcionada. La model card se limita a indicar que se trata de una conversión a MLX del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, realizada con mlx-vlm 0.7.3, y remite a la model card original para más detalles. Dado el identificador qwen3_5 y el pipeline image-text-to-text, se trata de un modelo de la familia Qwen3.5 con capacidad de procesamiento de imágenes, pero no se especifican capa de visión, tipo de atención, número de capas ni dimensión oculta.

Tampoco hay datos sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento. La única transformación documentada es la "abliteración": una técnica de edición de pesos que proyecta fuera las direcciones asociadas al rechazo para reducir la tasa de negativas del modelo. Los detalles concretos del procedimiento aplicado por huihui-ai (capas afectadas, dataset de calibración, métricas de daño colateral) no aparecen ni en la model card de esta conversión ni en la información suministrada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-4B.
- Procesamiento de imágenes: el pipeline declarado es image-text-to-text, por lo que acepta una imagen junto a un prompt de texto (descripción, preguntas sobre la imagen, extracción de información visual).
- Modo "uncensored / abliterated": el modelo está modificado para reducir los rechazos ante peticiones que el modelo original declinaría. Es la capacidad diferencial de esta variante.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Modo de pensamiento (thinking mode), audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Descripción y etiquetado de imágenes en local: el pipeline image-text-to-text permite pasar una ruta de imagen junto a un prompt y obtener una descripción o etiquetas, ejecutándose íntegramente en un Mac con Apple Silicon mediante mlx-vlm, sin enviar datos a servicios externos.
- Investigación sobre alineamiento y refusal: al ser una variante abliterated, sirve como contraste experimental frente a Qwen/Qwen3.5-4B para medir cuánto cambia la tasa de rechazos y qué degradación introduce la edición de pesos en tareas neutras.
- Procesamiento por lotes de documentos escaneados o capturas: con 3,1 GB de pesos en disco y 4 bits, es viable ejecutar lotes de preguntas visuales sobre imágenes en un portátil, sin infraestructura GPU.
- Prototipado rápido de asistentes multimodales: el modelo es lo bastante pequeño para iterar en local, validar prompts y flujos conversacionales antes de escalar a un modelo mayor.
- Generación de texto y conversación general en equipos con memoria unificada limitada: al ocupar aproximadamente 2,5-3 GB en 4 bits, encaja en Macs de 8-16 GB que no pueden alojar modelos de mayor tamaño.
- Pruebas de robustez y seguridad de producto: dado su carácter sin censura, es útil como caso límite para evaluar filtros, moderación y salvaguardas de una aplicación antes de desplegarla con un modelo alineado.
- Evaluación comparativa de cuantización: la versión MLX 4 bits puede contrastarse con los pesos originales en safetensors para medir la pérdida de calidad introducida por la cuantización en tareas de visión y de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos en 4 bits ocupan aproximadamente 2,5-3 GB (el repositorio completo pesa 3,1 GB). Hay que sumar la caché KV y las activaciones, que dependen del contexto y del tamaño de imagen; con contexto moderado, un presupuesto práctico de 4-6 GB de memoria es razonable.
- GPU compatibles: al estar en formato MLX, la vía nativa es Apple Silicon (familias M1, M2, M3, M4 y superiores, en versiones base, Pro, Max y Ultra). MLX no se ejecuta sobre CUDA, por lo que este repositorio concreto no se puede cargar directamente en GPUs NVIDIA o AMD con vLLM o TGI.
- Uso en GPU de datacenter: para A100, H100 o similares habría que usar los pesos originales en safetensors de huihui-ai/Huihui-Qwen3.5-4B-abliterated (no incluidos en este repositorio) y comprobar que el stack de inferencia elegido soporta la arquitectura Qwen3.5, dato no disponible.
- Cabe en GPU de consumo: este repositorio, tal cual, no (requiere Apple Silicon). La variante sin cuantizar, de tamaño nominal ~4B, cabría en tarjetas con 8-12 GB de VRAM o más, en función de la precisión.
- Opciones de despliegue: mlx-vlm y mlx-lm para Apple Silicon; para otras plataformas, transformers, vLLM o llama.cpp usando el modelo base en safetensors o una conversión a GGUF realizada por terceros (no incluida aquí).
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheWirelessPhoenix/Qwen3.5-4B-abliterated-huihui-ai (este) | 4.539.265.536 (4 bits) | no disponible | safetensors MLX 4-bit | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | ~4B (nominal, según el nombre del modelo) | no disponible | safetensors (transformers) | apache-2.0 (según el enlace de licencia del modelo base) | modelo de origen de esta conversión |
| Qwen/Qwen3.5-4B | ~4B (nominal, según el nombre del modelo) | no disponible | safetensors | apache-2.0 | modelo upstream, con alineamiento de seguridad intacto |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay datos de arquitectura, contexto, idiomas, dataset de entrenamiento ni benchmarks. Cualquier uso en producción debería ir precedido de una evaluación propia.
- Riesgo elevado de contenido inapropiado: la abliteración elimina total o parcialmente los mecanismos de rechazo. El modelo puede producir contenido ofensivo, ilegal, peligroso o sexual sin advertencia.
- Alucinación: al no haber métricas publicadas, no se puede acotar la tasa de invención de hechos. En tareas de descripción de imágenes el riesgo de inventar detalles no visibles es real y no está medido.
- Degradación por cuantización: los pesos están en 4 bits. La pérdida de calidad frente al modelo original en safetensors no está cuantificada en el repositorio.
- Compatibilidad restringida: al ser pesos MLX, no se ejecutan en CUDA ni en la mayoría de plataformas de servidor. Requiere Apple Silicon y la librería mlx-vlm.
- Idiomas y contexto desconocidos: no se puede garantizar cobertura multilingüe ni planificar prompts largos sin conocer la ventana de contexto real.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable (por ejemplo, en la UE, obligaciones de transparencia para sistemas de IA).
- Trazabilidad: el repositorio no incluye información del autor más allá del nombre de usuario, tiene 0 descargas y 0 likes, y los metadatos indican una fecha de creación de 2026-09-26. Conviene verificar la procedencia y la integridad de los pesos antes de usarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheWirelessPhoenix/Qwen3.5-4B-abliterated-huihui-ai
- Modelo base (abliterated de huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Licencia del modelo upstream: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Modelo upstream (referenciado en la licencia): https://huggingface.co/Qwen/Qwen3.5-4B
- Paquete de inferencia citado en la model card: mlx-vlm (versión 0.7.3), instalable con "pip install -U mlx-vlm"
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de WhatsApp y no guardan relación con el contenido de esta ficha).
