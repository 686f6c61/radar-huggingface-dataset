# vidit04/UnlimitedOCR-Vidit-INT8

## Resumen

UnlimitedOCR-Vidit-INT8 es una versión cuantizada a INT8 del modelo Baidu Unlimited-OCR, un sistema de extracción de texto en imágenes (OCR) construido sobre una arquitectura de tipo image-text-to-text. La cuantización y publicación corre a cargo del usuario vidit04, mientras que la arquitectura original y los pesos de partida pertenecen a Baidu. El checkpoint se distribuye a través de Hugging Face con la librería transformers y requiere un entorno compatible con BitsAndBytes y Accelerate para cargar las capas lineales de 8 bits.

El modelo resuelve el problema de desplegar OCR de gran tamaño en entornos con recursos limitados: parte de un modelo base de aproximadamente 3.340 millones de parámetros (3.338.704.513 según los safetensors) y lo comprime a 8 bits, reduciendo el peso del repositorio a unos 3,7 GB. Se trata de una variante derivada, no de un modelo entrenado desde cero: no se han publicado datos sobre el corpus de entrenamiento, los idiomas soportados ni la licencia de redistribución.

Su relevancia actual es doble: por un lado, demuestra la viabilidad de cuantizar modelos OCR multimodales con pérdida mínima de perplejidad en texto; por otro, deja pendiente la validación real de precisión OCR, que el propio autor reconoce que no se ha realizado. Es, por tanto, un checkpoint útil para experimentación y pruebas de despliegue, pero no un artefacto listo para producción sin evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | image-text-to-text basada en el modelo baidu/Unlimited-OCR (detalles internos no disponibles) |
| Parámetros totales | 3.338.704.513 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 mediante BitsAndBytes (2341 capas lineales en 8 bits, 0 en 4 bits), compute dtype FP16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se remite a la licencia del modelo original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base baidu/Unlimited-OCR, orientada a la tarea image-text-to-text: recibe una imagen y genera texto, lo que encaja con la extracción de contenido documental. La información disponible no detalla si el backbone es un transformer puro, un modelo híbrido con visión o qué tipo de codificador visual emplea; tampoco se especifican la ventana de contexto ni la composición del dataset de entrenamiento original.

La intervención de vidit04 se limita a la cuantización: se convierten 2341 capas lineales a 8 bits con BitsAndBytes manteniendo el compute dtype en FP16, sin capas en 4 bits. No se documenta ningún proceso de ajuste fino, RLHF o DPO posterior. La revisión base utilizada es 8249d20b2822a7d8a4c22c8d8c9069b5ac36bda3 del repositorio original.

## Capacidades

- Extracción de texto a partir de imágenes (OCR) en formato image-text-to-text.
- Generación conversacional: la pipeline declarada es image-text-to-text con tag conversational, lo que permite diálogo multimodal.
- Procesamiento de documentos: el nombre "Unlimited-OCR" sugiere orientación a documentos de extensión variable, aunque la información disponible no concreta límites.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión adicional o audio: no disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede recibir la imagen del documento y devolver el texto estructurado, integrándose en un pipeline de contabilidad; su tamaño INT8 (unos 3,7 GB) permite desplegarlo en servidores con GPU modesta.
- Extracción de texto en archivos escaneados: útil para construir índices de búsqueda sobre PDFs históricos, ya que la tarea image-text-to-text permite pasar páginas renderizadas como imagen y obtener su transcripción.
- Procesamiento por lotes en entornos con VRAM limitada: al estar cuantizado a 8 bits, cabe en GPUs de consumo alto (por ejemplo, RTX 4090) y permite ejecutar OCR sobre lotes de imágenes sin depender de hardware de datacenter.
- Prototipado de asistentes documentales conversacionales: la etiqueta conversational permite construir un chat que reciba imágenes de documentos y responda preguntas sobre su contenido, útil en demos y pruebas de concepto.
- Validación de pipelines de OCR en CI: el checkpoint sirve para comparar la salida del modelo cuantizado frente al original FP16 en pruebas automatizadas, aunque la equivalencia de precisión OCR debe medirse con transcripciones de referencia.
- Investigación sobre cuantización multimodal: al publicarse la perplejidad de texto antes y después (189,664790 frente a 189,651164), es un punto de partida para estudiar el impacto de INT8 en modelos de visión-lenguaje.
- Extracción de texto en entornos con restricciones de memoria: el formato safetensors y la carga vía transformers + BitsAndBytes facilitan su integración en servicios ya basados en ese stack.

## Benchmarks y rendimiento

| Métrica | Original FP16 | Cuantizado INT8 | Cambio |
|---|---:|---:|---:|
| Perplejidad WikiText-2 (solo texto) | 189,664790 | 189,651164 | -0,0072 % |

No se han publicado resultados de benchmarks de precisión OCR (por ejemplo, sobre transcripciones de referencia) en la información disponible. El propio autor advierte que la perplejidad de texto no establece equivalencia de precisión OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3,5-4 GB solo para los pesos en INT8; con overhead de activaciones y del codificador visual, se recomienda prever al menos 6-8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100; cualquier GPU con soporte de BitsAndBytes y al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante).
- Opciones de despliegue: transformers con BitsAndBytes y Accelerate (requisito explícito del autor); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnlimitedOCR-Vidit-INT8 | 3.338.704.513 | no disponible | INT8 (BitsAndBytes) | no disponible | Hugging Face |
| baidu/Unlimited-OCR (base) | no disponible | no disponible | FP16 original | no disponible | Hugging Face |
| Alternativas OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se ha evaluado la precisión OCR del checkpoint cuantizado; la única métrica publicada es perplejidad de texto, que no mide calidad de transcripción.
- Licencia no disponible: antes de cualquier uso comercial o redistribución hay que consultar la licencia de baidu/Unlimited-OCR y cumplir sus requisitos de atribución.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no documentada, lo que impide planificar el procesamiento de documentos largos.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar texto ausente en la imagen, especialmente con documentos de baja calidad.
- Sesgos desconocidos: no hay información sobre la composición del dataset original ni sobre sesgos documentados.
- Dependencia de un stack específico (transformers, Accelerate, BitsAndBytes); no se garantiza compatibilidad con otros motores de inferencia.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: sin validación por parte de la comunidad.
- El modelo es un derivado no oficial; los errores de cuantización no están cubiertos por el autor original.

## Enlaces

- Hugging Face: https://huggingface.co/vidit04/UnlimitedOCR-Vidit-INT8
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Revisión base: 8249d20b2822a7d8a4c22c8d8c9069b5ac36bda3
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
