# VALOR0316/ingot-cand7t_b50

## Resumen

VALOR0316/ingot-cand7t_b50 es un checkpoint de lenguaje publicado en Hugging Face por el usuario VALOR0316 (Louis Robbins) el 18 de octubre de 2026. Se distribuye en formato safetensors con pesos en fp8 y el repositorio ocupa 30,9 GB, mientras que el recuento real de parámetros extraído de los tensores es de 27.781.427.952 (unos 27,8 mil millones). La etiqueta `qwen3_5` sugiere que deriva de la familia Qwen3.5, si bien no existe model card, pipeline declarado ni documentación que lo confirme.

El repositorio no incluye información sobre licencia, idiomas, longitud de contexto ni datos de entrenamiento, y su adopción pública es muy limitada (11 descargas y ninguna interacción). Debe tratarse, por tanto, como un artefacto experimental o de investigación, no como un modelo listo para producción.

Su interés práctico está en el formato: al publicarse en fp8, el peso en memoria se reduce aproximadamente a la mitad frente a un checkpoint bf16 equivalente (que rondaría los 55,6 GB), lo que permite cargar un modelo de ~28B en una única GPU de 40-80 GB y facilita pruebas de inferencia y ajuste fino con QLoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; la etiqueta `qwen3_5` apunta a una familia transformer derivada de Qwen3.5 (sin confirmar) |
| Parametros totales | 27.781.427.952 (~27,8 B), según los tensores safetensors |
| Parametros activos | No disponible (no se puede confirmar si es denso o MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en fp8 (etiqueta `fp8`); no se documentan otras variantes |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp8) |

## Arquitectura y entrenamiento

No se ha publicado ninguna descripción de la arquitectura. El único indicio es la etiqueta `qwen3_5`, que sitúa el checkpoint en la estela de la familia Qwen3.5; el recuento de tensores (27,8 B de parámetros totales) es coherente con un modelo de esa escala, pero se desconoce si se trata de un transformer denso o de una variante con mezcla de expertos, así como el número de capas, la dimensionalidad oculta o el mecanismo de atención empleado.

Tampoco hay información sobre el corpus de entrenamiento (número de tokens, composición, proporción de código y multilingüe), sobre si hubo ajuste por instrucciones con RLHF o DPO, ni sobre procesos de cuantización. El hecho de que los pesos se almacenen en fp8 puede deberse a una cuantización posterior al entrenamiento (PTQ) o a un entrenamiento nativo en fp8; no hay datos para decantarse por una u otra opción. El sufijo `cand7t_b50` del nombre sugiere un identificador interno de ejecución o candidato de un pipeline de experimentación, no una versión estable.

## Capacidades

- No existe documentación de capacidades verificada. Cualquier afirmación al respecto es una inferencia a partir de la etiqueta de familia y del tamaño.
- Generación de texto y razonamiento: presumiblemente heredados de la familia Qwen3.5, sin confirmar.
- Generación de código y matemáticas: no verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible; las etiquetas no mencionan modalidades adicionales.
- Almacenamiento en fp8: reduce el peso en memoria, pero puede introducir degradación numérica frente a bf16, no medida en este checkpoint.

## Casos de uso

Los siguientes escenarios son razonables para un checkpoint de ~28B en fp8, pero requieren validación previa porque no hay documentación de rendimiento ni de licencia.

- Evaluación comparativa de precisión fp8 frente a bf16: cargar este checkpoint y un equivalente en bf16 para medir la degradación en tareas de razonamiento y código antes de adoptar fp8 en producción.
- Servicio de inferencia interno con vLLM o SGLang: los ~27,8 GB de pesos caben en una GPU de 40-80 GB, lo que permite desplegar una instancia única para pruebas de latencia y throughput.
- Ajuste fino con QLoRA sobre datos de dominio: al estar ya cuantizado en fp8, el entrenamiento de adaptadores requiere menos memoria que partir de bf16, con la salvedad de que el soporte de QLoRA sobre fp8 es menos maduro que sobre NF4.
- Prototipado de asistentes conversacionales: un modelo de ~28B suele ofrecer calidad suficiente para demos internas de chat multi-turno, siempre que se valide primero la calidad real del checkpoint.
- Destilación o generación de datos sintéticos: usar el modelo como generador en pipelines de anotación o de creación de datasets, sujeto a revisión humana por el riesgo de alucinación no caracterizado.
- Investigación sobre provenance y linaje de modelos: el repositorio es un caso útil para estudiar cómo se distribuyen derivados anónimos de familias conocidas sin model card ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones de contexto largo para este checkpoint, ni comparaciones oficiales con la familia Qwen3.5 u otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: ~27,8 GB solo para pesos en fp8; con caché KV y overhead del runtime, el consumo realista arranca en ~32-34 GB para contextos cortos y crece con la longitud de contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para una sola instancia con margen; A100 40 GB queda muy justa y obliga a limitar el contexto o el tamaño de lote.
- GPU de consumo: una RTX 5090 de 32 GB podría cargar los pesos, pero el margen para caché KV es mínimo; en RTX 4090 (24 GB) no cabe en una sola tarjeta y requiere tensor parallelism con dos unidades o conversión a una cuantización de 4 bits.
- Opciones de despliegue: vLLM y SGLang son las rutas más directas por su soporte de fp8; TGI también admite fp8 en hardware compatible. llama.cpp y Ollama incorporan tipos FP8 en versiones recientes de ggml, pero el soporte es limitado y la ruta habitual es convertir a bf16 o a GGUF Q8_0, lo que incrementa el tamaño en disco.
- Latencia y throughput: no disponibles; no se han publicado mediciones y no es posible estimarlas con rigor sin conocer la arquitectura (densa o MoE) y el contexto de entrenamiento.

## Comparativa con modelos similares

Los datos del modelo evaluado no están disponibles más allá del recuento de parámetros; las cifras de las alternativas provienen de documentación pública de cada familia y deben verificarse en sus repositorios.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VALOR0316/ingot-cand7t_b50 | ~27,8 B (fp8) | No disponible | No disponible | Hugging Face, 11 descargas |
| Qwen3-32B | 32,8 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Gemma 3 27B | 27 B | 128.000 tokens | Gemma Terms of Use | Hugging Face, pesos abiertos |
| Mistral Small 3 (24B) | 24 B | 32.000 tokens | Apache 2.0 | Hugging Face, ampliamente desplegado |

Frente a estas alternativas, el checkpoint de VALOR0316 no aporta garantías de licencia, idiomas ni contexto, por lo que la comparación solo es favorable en el plano del tamaño de almacenamiento (fp8) y no en el de rendimiento o soporte.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones conocidas.
- Licencia no especificada: no hay autorización explícita de uso comercial; utilizarlo en producción conlleva riesgo legal.
- Idiomas y contexto desconocidos: es imposible planificar despliegues multilingües o de contexto largo sin validación empírica.
- Riesgo de alucinación no cuantificado: sin benchmarks ni evaluaciones de fidelidad, no se puede acotar la tasa de error factual.
- Sesgos desconocidos: al no conocerse la composición del corpus, no se pueden identificar sesgos de género, idioma o dominio.
- Cuantización fp8: puede degradar tareas sensibles a la precisión numérica (matemáticas, código, razonamiento de cadena larga) sin que existan mediciones publicadas del delta.
- Procedencia dudosa: autor con poco historial público, 11 descargas y 0 interacciones; el nombre `cand7t_b50` apunta a un artefacto intermedio de un pipeline, no a una release estable.
- Sin soporte ni mantenimiento: no hay issues, discusiones ni comunidad que garantice correcciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VALOR0316/ingot-cand7t_b50
- Perfil del autor: https://huggingface.co/VALOR0316
- Datasets del autor: https://huggingface.co/VALOR0316/datasets

No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a este checkpoint en la busqueda web realizada.
