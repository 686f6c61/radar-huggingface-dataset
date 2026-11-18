# taobao-mnn/Qwen3-30B-A3B-MNN

## Resumen

Qwen3-30B-A3B-MNN es un paquete de inferencia cuantizado en 4 bits con HQQ del modelo Qwen3-30B-A3B, empaquetado por el equipo taobao-mnn para su uso con el motor MNN (Mobile Neural Network) de Alibaba. No se trata de un modelo nuevo, sino de una conversión del checkpoint original de Qwen para ejecutarse eficientemente en CPU mediante el runtime MNN, que incluye correcciones específicas para la exportación de capas MoE.

El modelo base, Qwen3-30B-A3B, es un transformer de arquitectura Mixture-of-Experts (MoE) con 30.500 millones de parámetros totales y 3.300 millones activos por token. Dispone de 48 capas, 128 expertos enrutados y selecciona 8 expertos por token. Soporta modos de razonamiento (thinking) y no razonamiento (non-thinking) alternables mediante el chat template, y está orientado a razonamiento, generación de código, seguimiento de instrucciones, uso de herramientas y diálogo multilingüe.

La relevancia de este paquete radica en que permite desplegar un modelo MoE de 30B en entornos sin GPU, gracias a la cuantización HQQ 4-bit (group size 64, escalas FP16) y a los embeddings almacenados en BF16. Está pensado para escenarios de inferencia en CPU donde el espacio y la memoria son limitados, manteniendo la estructura MoE intacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) |
| Parametros totales | 30.5B |
| Parametros activos | 3.3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit (group size 64, escalas FP16); embeddings en BF16 (16-bit) |
| Idiomas soportados | en (segun model card del paquete); el modelo base se describe como multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos MNN (paquete de inferencia MNN); tokenizer en formato .mtok |
| Capas | 48 |
| Expertos enrutados | 128 |
| Expertos seleccionados por token | 8 |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B emplea una arquitectura transformer con capas MoE de enrutamiento disperso: 48 capas, 128 expertos y 8 expertos activados por token, lo que resulta en 3.3B parámetros activos sobre un total de 30.5B. Esta dispersión permite que el coste computacional por token sea comparable al de un modelo denso de ~3B, manteniendo la capacidad representacional de un modelo de 30B. El paquete MNN conserva la estructura MoE y aplica cuantización HQQ de 4 bits a las capas lineales de texto, con escalas en FP16 y embeddings en BF16 separados.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO en la información proporcionada; estos datos corresponden a la model card original de Qwen/Qwen3-30B-A3B, no incluida en el material disponible. La innovación técnica de este paquete concreto es la exportación compatible con MNN que incluye correcciones para el manejo de capas MoE, permitiendo ejecutar el modelo en CPU con el runtime MNN (commit 7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4).

## Capacidades

- Generación de texto y razonamiento en modo thinking y non-thinking, alternables mediante el chat template.
- Generación de código y resolución de problemas matemáticos, según las capacidades declaradas del modelo base.
- Seguimiento de instrucciones y diálogo conversacional multi-turno.
- Uso de herramientas (tool use / function calling), según la descripción del modelo original.
- Capacidades multilingües heredadas del modelo base (aunque la model card de este paquete declara únicamente `en`).
- Inferencia en CPU mediante el motor MNN, sin requerir GPU.
- Ejecución de pruebas funcionales de alta y baja memoria en CPU (6 casos smoke verificados por el autor).

## Casos de uso

- Despliegue en servidores sin GPU: el paquete MNN 4-bit permite ejecutar un MoE de 30B en CPU, adecuado para entornos con recursos limitados o edge computing donde no hay acelerador dedicado.
- Prototipado y evaluación local: investigadores pueden descargar el paquete y ejecutar `llm_demo` y `llm_bench` con MNN para medir latencia y validar el comportamiento del modelo antes de invertir en infraestructura GPU.
- Aplicaciones de chat en dispositivos: al estar empaquetado para MNN, puede integrarse en aplicaciones que ya usan este runtime (por ejemplo, apps móviles o de escritorio de Alibaba) para generación de texto conversacional.
- Generación de código en entornos de desarrollo sin GPU: el modelo base soporta código y el paquete permite ejecutarlo localmente en CPU para asistencia de programación en máquinas de desarrollo estándar.
- Razonamiento con modo thinking en pipelines por lotes: el modo thinking permite obtener cadenas de razonamiento para tareas de análisis, ejecutables en CPU en procesos batch donde la latencia no es crítica.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de calidad de HQQ 4-bit frente al checkpoint original en tareas de razonamiento e instrucciones.
- Integración en herramientas de línea de comandos: el binario `llm_demo` permite scripting rápido de consultas al modelo desde terminal para tareas de generación y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la información disponible. La model card indica que se superaron 6 casos smoke funcionales en CPU (modos High/Low), pero el propio autor aclara que son comprobaciones funcionales y no benchmarks amplios de calidad ni de GPU. No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia/throughput medidos.

## Requisitos de hardware

- El paquete está diseñado para inferencia en CPU con el motor MNN; no se especifican requisitos de VRAM porque no está orientado a GPU.
- Tamaño del repositorio: 34.9 GB, lo que da una idea del espacio en disco necesario para los pesos cuantizados.
- Compilación recomendada de MNN con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON` y `MNN_BUILD_CONVERTER=ON`.
- No se dispone de datos sobre GPU recomendadas, ya que el paquete es específico para CPU.
- No se dispone de estimaciones de latencia ni throughput; el autor sugiere usar `llm_bench` para medirlos.
- Opciones de despliegue: runtime MNN (`llm_demo`, `llm_bench`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B-MNN (este) | 30.5B | 3.3B | no disponible | HQQ 4-bit | Apache 2.0 | MNN |
| Qwen/Qwen3-30B-A3B (original) | 30.5B | 3.3B | no disponible | BF16/FP16 (original) | Apache 2.0 | safetensors |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros modelos, ni de alternativas cuantizadas equivalentes para MNN. La comparación principal posible es con el checkpoint original, del que este paquete es una conversión cuantizada.

## Limitaciones y advertencias

- La model card declara únicamente el idioma `en`, aunque el modelo base se describe como multilingüe; el soporte real de otros idiomas en este paquete no está verificado.
- La cuantización HQQ 4-bit puede introducir degradación de calidad respecto al checkpoint original; no se han publicado evaluaciones de calidad que lo cuantifiquen.
- Los 6 casos smoke son comprobaciones funcionales, no garantizan calidad en producción ni cubren todos los escenarios.
- El paquete está atado a una revisión concreta de MNN (commit 7337404b...); cambios de versión pueden requerir reexportación.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto específicas de este paquete; deben consultarse en la model card del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero los pesos retienen la licencia y atribución del modelo original; es necesario revisar los ficheros de licencia del repositorio y la model card de Qwen.
- Al ser un paquete orientado a CPU, el rendimiento en producción puede ser limitado en comparación con despliegues GPU; se recomienda medir con `llm_bench` antes de usarlo en cargas reales.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-30B-A3B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit MNN usado: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentación MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
