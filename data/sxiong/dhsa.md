# sxiong/DHSA

## Resumen

DHSA (Dynamic Hierarchical Sparse Attention) es un método de atención dispersa jerárquica dinámica diseñado para reducir el consumo de memoria durante la inferencia de modelos de lenguaje de gran tamaño (LLM) en contextos largos. El repositorio `sxiong/DHSA` aloja los pesos entrenados del predictor que decide qué tokens deben recibir atención en cada capa, permitiendo una inferencia eficiente sin degradar significativamente la calidad. Este predictor se utiliza como un componente externo al modelo base, en lugar de modificar la arquitectura original.

El trabajo ha sido aceptado como *Spotlight* en ICML 2026 y se describe en el artículo *Long-Context Modeling with Dynamic Hierarchical Sparse Attention for Memory-Constrained LLM Inference* (arXiv:2510.24606). El checkpoint incluye la configuración del predictor, los pesos en FP32, prototipos de muestra en BF16 y ajustes opcionales de densidad. Está pensado para integrarse con modelos como Llama-3.1-8B-Instruct mediante el repositorio oficial del proyecto, y se distribuye bajo licencia MIT.

La relevancia actual radica en que los LLM con ventanas de contexto de 128k o más requieren una cantidad de memoria proporcional al cuadrado de la longitud de la secuencia. DHSA aborda este cuello de botella con una máscara de atención aprendida y dinámica, que selecciona un subconjunto de tokens por bloque, reduciendo el coste computacional y de memoria sin necesidad de reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de atención dispersa jerárquica dinámica (no es un LLM completo) |
| Parametros totales | no disponible (el checkpoint ocupa 7.6 GB en disco) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base; el ejemplo usa Llama-3.1-8B-Instruct con contexto nativo de 128k) |
| Tipos de cuantizacion | Checkpoint en FP32; prototipos en BF16; compatible con modelos base cuantizados a 4-bit |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`) con `state_dict`, `predictor_config`, `sample_prototypes` y `density_config_overrides` |

## Arquitectura y entrenamiento

El predictor DHSA es un módulo independiente que se acopla a un LLM existente durante la inferencia. Su función es generar una máscara de atención dispersa de forma dinámica: para cada capa y cada bloque de consultas, selecciona un subconjunto de bloques de claves relevantes. Esta selección se basa en un mecanismo de *nearest-sample matching* con prototipos aprendidos, lo que permite decidir rápidamente qué tokens atender sin necesidad de calcular la atención completa.

El entrenamiento del predictor se realiza de forma separada al modelo base. Aunque los detalles exactos del conjunto de datos y el procedimiento no se especifican en la model card, el artículo asociado describe el método. El checkpoint incluye `predictor_config` con la arquitectura explícita y parámetros de inferencia, así como `density_config_overrides` para ajustar el presupuesto de densidad dinámica. El uso previsto es con modelos cuantizados (por ejemplo, 4-bit) para maximizar el ahorro de memoria.

## Capacidades

- Reducción de memoria en inferencia de contexto largo: al aplicar una máscara de atención dispersa, se reduce el almacenamiento de las matrices de atención y el coste computacional asociado.
- Selección dinámica de tokens relevantes: el predictor decide en tiempo de ejecución qué bloques de claves son necesarios, adaptándose al contenido de la secuencia.
- Compatibilidad con modelos base populares: el ejemplo de uso muestra integración con Llama-3.1-8B-Instruct, pero el método es agnóstico al modelo siempre que se entrene el predictor adecuado.
- Soporte para cuantización: el predictor funciona con modelos cuantizados a 4-bit, lo que permite desplegar LLMs grandes en hardware con memoria limitada.
- Integración con pipelines de evaluación estándar: se proporciona un comando de ejemplo para ejecutar RULER, un benchmark de razonamiento de contexto largo.
- No requiere reentrenamiento del LLM: el predictor se entrena por separado y se acopla en la fase de inferencia, lo que facilita su adopción.

## Casos de uso

- Inferencia de LLM en dispositivos con memoria limitada: el predictor permite ejecutar modelos de 8B parámetros (o mayores) en GPUs con poca VRAM, reduciendo la huella de memoria de las atenciones.
- Procesamiento de documentos largos: tareas como resumen, extracción de información o análisis de contratos legales que requieren ventanas de contexto de decenas de miles de tokens se benefician de la atención dispersa sin perder información crítica.
- Chatbots y asistentes con historial extenso: mantener conversaciones multi-turno con contexto completo es viable gracias a la reducción de memoria, mejorando la coherencia en diálogos largos.
- Sistemas de recuperación aumentada (RAG): al procesar corpus extensos, el predictor puede priorizar los fragmentos más relevantes, acelerando la generación de respuestas.
- Despliegue en entornos de producción con coste controlado: al reducir la memoria necesaria, se pueden servir más instancias del modelo en la misma GPU, abaratando la infraestructura.
- Evaluación de modelos en benchmarks de contexto largo: el predictor se puede usar para ejecutar RULER y otros benchmarks con modelos cuantizados, permitiendo comparar el rendimiento con atención completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo muestra un comando de ejemplo para ejecutar RULER, pero no incluye métricas numéricas. El artículo (arXiv:2510.24606) contiene los resultados completos, pero no están reproducidos aquí.

## Requisitos de hardware

- El checkpoint del predictor ocupa 7.6 GB en disco, pero su uso en memoria es mucho menor al cargarse solo los pesos necesarios para la inferencia.
- Para ejecutar el ejemplo con Llama-3.1-8B-Instruct cuantizado a 4-bit, se necesita una GPU con al menos 6-8 GB de VRAM (el modelo base en 4-bit ocupa ~4.5 GB, más el predictor y overhead).
- Compatible con GPUs consumer como RTX 3090, RTX 4090, o GPUs de datacenter como A10, A100, etc., dependiendo del tamaño del modelo base.
- El predictor se ejecuta junto con el modelo base; no requiere hardware especial adicional.
- Opciones de despliegue: el repositorio oficial proporciona scripts de evaluación; no se menciona soporte directo para vLLM, llama.cpp u Ollama, pero al ser un predictor independiente podría integrarse en frameworks personalizados.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que DHSA no es un LLM sino un método de aceleración de inferencia. Alternativas en el mismo espacio de investigación incluyen:

| Método | Enfoque | Ventaja | Limitación |
|---|---|---|---|
| DHSA (este repo) | Predictor dinámico de atención dispersa | Reduce memoria sin reentrenar el LLM | Requiere entrenar el predictor para cada modelo base |
| Sparse Attention estática (p.ej., Longformer, BigBird) | Máscaras fijas | Simple y predecible | No se adapta al contenido, puede perder información |
| Sliding window attention (p.ej., Mistral) | Ventana local fija | Muy eficiente | No captura dependencias lejanas |
| FlashAttention | Optimización de memoria sin esparsidad | Acelera atención completa | No reduce el coste cuadrático en memoria |

DHSA se distingue por su carácter dinámico y jerárquico, que permite ajustar la densidad según la dificultad de la secuencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: requiere un LLM base preentrenado y un predictor entrenado específicamente para ese modelo.
- El predictor debe entrenarse para cada arquitectura de LLM; no hay garantía de que funcione con modelos distintos a los evaluados en el paper.
- Los detalles de entrenamiento (datos, hiperparámetros) no se publican en la model card; solo están disponibles en el artículo.
- No se proporcionan resultados de benchmarks en el repositorio, por lo que el rendimiento real debe verificarse con el código y el paper.
- La licencia MIT permite uso comercial, pero el modelo base (Llama-3.1-8B-Instruct) tiene su propia licencia que debe respetarse.
- El checkpoint está en FP32, lo que puede aumentar el tiempo de carga y el uso de memoria si no se convierte a una precisión menor.
- El uso con modelos cuantizados requiere que la cuantización sea compatible con el predictor; no se garantiza que funcione con todos los esquemas de cuantización.

## Enlaces

- HuggingFace: https://huggingface.co/sxiong/DHSA
- Paper (arXiv): https://arxiv.org/pdf/2510.24606
- Repositorio oficial: https://github.com/xiongsiheng/DHSA
