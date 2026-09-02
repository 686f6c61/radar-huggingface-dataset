# sri-harini-m/M26CS7.501-Assignment-1-Models

## Resumen

Este repositorio contiene los checkpoints de PyTorch generados por Sriharini Margapuri como parte de la tarea 1 del curso M26CS7.501 de Procesamiento Avanzado del Lenguaje Natural (ANLP). La tarea consistía en implementar transformers desde cero, explorar variantes arquitectónicas y trabajar con Byte Latent Transformers (BLT). El repositorio almacena cinco configuraciones distintas (C1 a C5), cada una con su checkpoint final y su mejor checkpoint según la pérdida de validación.

No se trata de un modelo preentrenado listo para usar en producción, sino de artefactos académicos de entrenamiento. La información disponible es mínima: no se documentan arquitecturas específicas, tamaños de parámetros, ni datos de entrenamiento. El repositorio tiene un tamaño de 0,9 GB y contiene archivos `.pt` en formato PyTorch. La licencia es MIT y el idioma declarado es inglés.

La relevancia de este repositorio es limitada fuera del contexto de la asignatura, ya que carece de documentación técnica detallada, benchmarks y especificaciones de arquitectura. Su utilidad principal es como referencia para estudiantes o investigadores que quieran ver cómo se estructuran checkpoints de entrenamiento en una tarea académica de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se mencionan transformers, variantes y BLT, pero sin detalle por configuración) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si alguna configuración es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (archivos `.pt` sin cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

La model card indica que el trabajo cubre "Transformers from Scratch, Architectural Variants, and Byte Latent Transformers (BLT)". Esto sugiere que las configuraciones C1 a C5 podrían incluir implementaciones base de transformers, variantes como atención lineal o eficiente, y posiblemente arquitecturas BLT que operan sobre bytes en lugar de tokens. Sin embargo, no se proporcionan detalles sobre el número de capas, dimensiones ocultas, número de cabezas de atención, ni el tipo de variante aplicada en cada configuración.

Tampoco se documentan los datos de entrenamiento (composición, número de tokens), el proceso de optimización, ni si se aplicaron técnicas como RLHF o DPO. El repositorio solo contiene los checkpoints y una breve instrucción de carga con `torch.load()`. No hay información sobre el vocabulario, el tokenizador ni el procedimiento de entrenamiento.

## Capacidades

No se dispone de información sobre las capacidades del modelo. Al ser checkpoints de una tarea académica, no se documentan funcionalidades como generación de texto, razonamiento, código o tool calling. Las capacidades dependerán de la implementación concreta de cada configuración, pero no se especifican en la model card ni en los resultados de búsqueda web.

- Generación de texto: no documentado.
- Razonamiento: no documentado.
- Código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no documentado (solo se declara inglés como idioma).
- Capacidades especiales (visión, audio, thinking mode): no documentado.

## Casos de uso

Dado que se trata de checkpoints de una tarea de curso sin documentación de rendimiento ni arquitectura, no se pueden recomendar casos de uso prácticos en producción. Los posibles usos son estrictamente académicos:

- Replicación de la tarea: un estudiante podría cargar los checkpoints para verificar las implementaciones de transformers desde cero y comparar configuraciones.
- Análisis de checkpoints: inspeccionar las claves de los archivos `.pt` (por ejemplo, `model_C5_best.pt`) para entender cómo se guardaron los pesos, estados del optimizador o configuraciones.
- Estudio de variantes arquitectónicas: si se documentan las diferencias entre C1 y C5, podría servir para comparar el efecto de distintas modificaciones sobre la pérdida de validación.
- Investigación educativa: como ejemplo de cómo estructurar experimentos con múltiples configuraciones en un entorno académico.
- Pruebas de interoperabilidad: probar la carga de checkpoints con distintas versiones de PyTorch o entornos.
- Extensión del trabajo: partir de estos checkpoints para continuar el entrenamiento o fine-tuning, siempre que se conozca la arquitectura exacta.

No se recomienda su uso en aplicaciones reales por la ausencia de especificaciones y benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se indica la pérdida de validación alcanzada por cada configuración, a pesar de que la model card menciona que se guardaron "mejores checkpoints según pérdida de validación".

## Requisitos de hardware

El tamaño total del repositorio es de 0,9 GB, que incluye diez archivos de checkpoint (cinco configuraciones, cada una con final y best). El tamaño individual de cada archivo no se especifica, pero asumiendo un reparto equitativo, cada checkpoint rondaría los 90 MB. Esto sugiere modelos pequeños (posiblemente de decenas de millones de parámetros), aunque no hay confirmación.

- VRAM estimada para inferencia: no disponible, pero por el tamaño de archivo, un modelo de ~50-100M parámetros en FP32 ocuparía entre 200 y 400 MB, por lo que cabría en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2060 o superiores). También podría ejecutarse en CPU para pruebas pequeñas.
- Compatibilidad con GPU de consumo: sí, asumiendo los tamaños estimados.
- Opciones de despliegue: al ser checkpoints de PyTorch, se pueden cargar con `torch.load()` y usar con el código de entrenamiento original. No se proporcionan archivos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo publicable comparable con alternativas como GPT-2, BERT o Llama. Se trata de checkpoints de una tarea académica sin especificaciones públicas de arquitectura ni rendimiento. No se puede establecer una comparación seria con modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un modelo entrenado en una tarea académica, es probable que tenga sesgos derivados del corpus de entrenamiento, que no se especifica.
- Riesgo de alucinación: no evaluado. No se debe usar en producción sin validación.
- Limitaciones de contexto: se desconoce la longitud de contexto. Los modelos de tareas académicas suelen tener ventanas pequeñas (512 o 1024 tokens), pero no está confirmado.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el autor no proporciona garantías ni documentación técnica.
- Caveat importante para producción: este repositorio no es un modelo listo para servir. Carece de tokenizador, configuración de arquitectura y código de inferencia asociado. Cargar los checkpoints sin el código de entrenamiento original no permitirá hacer inferencias útiles.
- Fecha de creación y actualización: 2026-09-02, lo que puede indicar que es un trabajo reciente, pero no aporta información adicional.
- No hay demos, papers ni documentación complementaria en el repositorio de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sri-harini-m/M26CS7.501-Assignment-1-Models
- Resultados de búsqueda web: no se encontraron enlaces relevantes adicionales (el resultado de Scribd sobre "Harini Project Report" parece ser de otro proyecto y no está relacionado con este repositorio).
