# syssec-utd/py314-pylingual-v8-statement

## Resumen
El modelo `syssec-utd/py314-pylingual-v8-statement` es un modelo de lenguaje especializado en la decompilación de bytecode de Python, desarrollado por el grupo de investigación `syssec-utd` (Universidad de Texas en Dallas) como parte del proyecto open source [pylingual](https://github.com/syssec-utd/pylingual). Su propósito es traducir instrucciones de bytecode de Python a sentencias de código fuente legible, un paso intermedio dentro de un pipeline de decompilación más amplio que combina modelos de segmentación y de traducción de sentencias. El nombre del modelo indica que está diseñado para la versión 3.14 de Python (py314) y corresponde a la octava versión del componente de traducción de sentencias (v8-statement).

Con aproximadamente 223 millones de parámetros y una arquitectura basada en T5 (según las etiquetas del repositorio), este modelo se sitúa en la gama de los modelos encoder-decoder de tamaño medio. Aunque la información pública es escasa (solo 7 descargas y sin licencia declarada), su integración en un proyecto activo de decompilación lo hace relevante para tareas de ingeniería inversa, análisis de seguridad y recuperación de código fuente. La ventana de contexto, los idiomas soportados y los detalles de entrenamiento no están disponibles en la ficha de HuggingFace, por lo que esta documentación se basa únicamente en los datos públicos existentes.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 222.882.048 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente Python como entrada/salida) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura T5 (Text-to-Text Transfer Transformer), un encoder-decoder basado en transformer que trata todas las tareas como problemas de generación de texto. En el contexto de pylingual, el modelo recibe como entrada secuencias de bytecode de Python (representadas como tokens) y genera como salida sentencias de código fuente equivalentes. Esta aproximación permite que el decompilador aprenda patrones de traducción directamente de datos, en lugar de depender de reglas heurísticas.

No se dispone de información pública sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El proyecto pylingual publica en su [repositorio de GitHub](https://github.com/syssec-utd/pylingual) un pipeline que combina un modelo de segmentación (para dividir el bytecode en bloques lógicos) y este modelo de traducción de sentencias. El tag `tensorboard` sugiere que se utilizó TensorBoard para el seguimiento del entrenamiento, pero no hay métricas ni detalles adicionales disponibles.

## Capacidades
- Decompilación de bytecode de Python a sentencias de código fuente, específicamente para la versión 3.14.
- Traducción de secuencias de instrucciones de bajo nivel a construcciones de alto nivel (asignaciones, llamadas a función, estructuras de control, etc.).
- Integración en un pipeline de decompilación automática junto con un modelo de segmentación (no incluido en este repositorio).
- Generación de texto en formato de código Python, con salida que puede ser recompilada o analizada.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o soporte multilingüe más allá del contexto de Python.

## Casos de uso
- **Ingeniería inversa de software**: el modelo puede utilizarse para reconstruir código fuente de ejecutables Python empaquetados o compilados a bytecode, facilitando el análisis de aplicaciones propietarias o legacy.
- **Análisis de malware**: en laboratorios de seguridad, el decompilador ayuda a inspeccionar muestras maliciosas escritas en Python, transformando bytecode ofuscado en sentencias legibles para su estudio.
- **Recuperación de código fuente perdido**: cuando se dispone únicamente de archivos `.pyc` o `.pyo` (por ejemplo, tras la pérdida del código original), el modelo puede generar una aproximación del código fuente.
- **Auditoría de dependencias**: herramientas de análisis de composición de software pueden integrar el modelo para revisar paquetes distribuidos solo en forma compilada, verificando que no contengan comportamientos no deseados.
- **Educación y aprendizaje**: estudiantes de compiladores o de internals de Python pueden usar el modelo para visualizar cómo se traduce el bytecode a sentencias de alto nivel, como material didáctico interactivo.
- **Automatización de pipelines de análisis estático**: el modelo puede incorporarse en flujos de CI/CD que necesiten inspeccionar artefactos Python compilados, generando informes de código fuente de forma automática.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No existen métricas oficiales de precisión, exactitud o comparación con otros decompiladores en el repositorio de HuggingFace ni en la documentación del proyecto. El repositorio de GitHub de pylingual no incluye tablas de evaluación pública.

## Requisitos de hardware
- **VRAM estimada**: para un modelo T5 de 223M de parámetros en precisión FP32 se requieren aproximadamente 890 MB solo para los pesos. Con cuantización a int8 (si estuviera disponible) se podría reducir a unos 450 MB, y a int4 a unos 280 MB. Sin embargo, no se proporcionan archivos cuantizados en el repositorio.
- **GPU recomendadas**: una GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) sería suficiente para inferencia en FP32. Para mayor velocidad, una RTX 3060 o superior es adecuada. No se requieren GPUs de datacenter.
- **Compatibilidad con consumer GPU**: sí, el modelo cabe en GPUs de consumo comunes.
- **Opciones de despliegue**: al ser un modelo T5 con pesos en safetensors, puede cargarse con la librería `transformers` de HuggingFace. También podría convertirse a GGUF para usar con llama.cpp u Ollama, aunque no hay conversiones oficiales publicadas. Para despliegue en producción, vLLM o TGI son opciones viables si se adapta el formato.
- **Latencia y throughput**: no hay datos publicados. En una GPU moderna, un T5-base suele generar decenas de tokens por segundo, pero depende del hardware y la longitud de las secuencias.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables directamente. Los decompiladores tradicionales de Python (como `uncompyle6` o `decompyle3`) no son modelos de aprendizaje automático, sino herramientas basadas en reglas gramaticales. No existen modelos de decompilación neuronal públicos con los que comparar de manera justa, ya que este es un campo emergente y el proyecto pylingual parece ser pionero en su enfoque. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias
- **Falta de documentación**: no se especifican la licencia, los idiomas soportados ni los detalles de entrenamiento, lo que dificulta evaluar su idoneidad para uso comercial o académico.
- **Especialización limitada**: el modelo está entrenado específicamente para Python 3.14, por lo que no funcionará correctamente con bytecode de otras versiones de Python (aunque el proyecto pylingual ofrece modelos separados para cada versión).
- **Riesgo de alucinaciones**: como todo modelo generativo, puede producir sentencias sintácticamente válidas pero semánticamente incorrectas, especialmente con bytecode ofuscado o poco común.
- **Sesgos del entrenamiento**: al no conocerse el dataset, no se puede evaluar si existe sesgo hacia ciertos estilos de programación o patrones de código.
- **Restricciones de uso**: sin licencia declarada, el uso en producción o en proyectos comerciales es incierto. Se recomienda contactar con los autores antes de integrarlo en un producto.
- **Calidad de la decompilación**: la salida puede requerir revisión manual, ya que la traducción automática de bytecode a código fuente rara vez es perfecta y puede perder nombres de variables, comentarios o estructuras originales.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/syssec-utd/py314-pylingual-v8-statement)
- [Dataset asociado](https://huggingface.co/datasets/syssec-utd/statement-py314-pylingual-v8)
- [Repositorio GitHub del proyecto pylingual](https://github.com/syssec-utd/pylingual)
- [Documentación de configuración del modelo en DeepWiki](https://deepwiki.com/syssec-utd/pylingual/5.2-model-configuration)
