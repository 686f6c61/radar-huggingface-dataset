# Thox-ai/thox-cluster-maverick

## Resumen

thox-cluster-maverick es una distribución configurada por Thox-ai del modelo Qwen3-235B-A22B de Alibaba Cloud, empaquetada para inferencia local mediante Ollama y para su orquestación distribuida en la tecnología de clustering MeshStack de THOX. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 235.000 millones de parámetros totales y 22.000 millones activos por token, según la ficha del proveedor original. THOX no ha entrenado ni ajustado los pesos: su aportación se limita a la configuración de ejecución, la documentación y la capa de clustering que rodea al modelo.

El modelo resuelve el caso de organizaciones que necesitan desplegar un modelo abierto de escala frontier en infraestructura propia, sin que los datos salgan de las instalaciones. La distribución se sirve como GGUF cuantizado en Q4_K_M con un tamaño de 142 GB y una ventana de contexto servida de 131.072 tokens (128K) en la configuración de Ollama, aunque la etiqueta `latest` de Ollama muestra 256K como artefacto de visualización.

Es relevante ahora porque representa un patrón creciente: distribuciones de terceros sobre modelos abiertos de gran tamaño, con licencia Apache 2.0 y orientadas a despliegues on-premises. Conviene señalar que la propia model card corrige afirmaciones anteriores sobre disponibilidad y concurrencia, y que no se han publicado evaluaciones independientes de esta distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer, según el modelo base Qwen3-235B-A22B |
| Parametros totales | 235B |
| Parametros activos | 22B |
| Longitud de contexto | 131.072 tokens servidos (128K) en la configuración de Ollama; la cifra de 256K en la etiqueta `latest` es un artefacto de visualización |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | 100+ según catálogo; la model card declara `en` como idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (distribución Ollama); el repositorio de HuggingFace solo contiene `.gitattributes` |
| Tamano de la distribucion | 142 GB |
| Modelo base | Qwen/Qwen3-235B-A22B (Alibaba Cloud) |
| Despliegue | Ollama local; orquestación distribuida vía MeshStack (componente separado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-235B-A22B de Alibaba Cloud: un transformer con mezcla de expertos en el que cada token activa un subconjunto de 22.000 millones de parámetros de un total de 235.000 millones. THOX no aporta detalles adicionales sobre la composición de expertos, el enrutamiento ni la atención más allá de lo que declara el proveedor original.

En cuanto al entrenamiento, THOX afirma explícitamente que no ha realizado ningún ajuste fino, no ha añadido datasets ni ha ejecutado un procedimiento de entrenamiento propio para esta release. Los pesos de la distribución Ollama son byte-idénticos a los de la distribución Ollama del proveedor original, verificado mediante SHA-256 en la revisión de la release del 31 de octubre de 2026. Los datos y el procedimiento de entrenamiento (incluidos posibles RLHF/DPO) son los del modelo base y deben consultarse en su model card. La innovación atribuible a THOX no está en el modelo sino en la capa de clustering MeshStack/MagStack, que distribuye el modelo y comparte cómputo, memoria y carga entre dispositivos.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3-235B-A22B.
- Procesamiento de contexto largo: hasta 131.072 tokens en la configuración servida, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidades multilingües: el catálogo reporta más de 100 idiomas, aunque la model card declara únicamente `en`.
- Inferencia local completa, sin dependencia de servicios externos ni acceso a información en línea salvo que el operador lo configure.
- Despliegue distribuido entre múltiples dispositivos mediante MeshStack, con reparto de cómputo y memoria.
- Ejecución simplificada vía Ollama con `ollama run Thox-ai/thox-cluster-maverick`.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes, visión o audio para esta distribución.

## Casos de uso

- Análisis de documentos empresariales en infraestructura propia: el contexto de 128K tokens permite procesar contratos, informes y expedientes completos sin fragmentación, manteniendo los datos dentro de la organización.
- Síntesis de investigación y trabajo estratégico: equipos que manejan información sensible pueden generar resúmenes y análisis sobre corpus extensos en local, sin enviar datos a APIs de terceros.
- Evaluación de modelos abiertos de escala frontier on-premises: organizaciones que quieren comparar el rendimiento de un MoE de 235B en su propio hardware antes de comprometerse con un despliegue mayor.
- Trabajo de conocimiento multi-equipo con requisitos de confidencialidad: la ejecución local por diseño evita la exposición de datos a servicios externos, lo que encaja en entornos con obligaciones regulatorias estrictas.
- Prototipado de despliegues distribuidos: la integración con MeshStack permite experimentar con reparto de cómputo y memoria entre varios dispositivos para servir un modelo que no cabe en uno solo.
- Laboratorios y entornos de investigación con hardware propio: investigadores que necesitan un modelo grande para experimentación sin depender de cuotas de API ni de conectividad externa.
- Despliegue en edge o en instalaciones aisladas (air-gapped): al no requerir servicios en línea, el modelo puede operar en redes desconectadas donde otras alternativas no son viables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras citadas en versiones anteriores provenían del catálogo del modelo base (Alibaba/Qwen) y no fueron re-ejecutadas para esta publicación; asimismo, la evaluación independiente de THOX figura como pendiente. Las afirmaciones previas sobre 99,99% de uptime y cifras de concurrencia fueron retiradas por carecer de evidencia de despliegue.

## Requisitos de hardware

- VRAM estimada: la distribución Q4_K_M ocupa 142 GB, por lo que la inferencia requiere al menos esa cantidad de memoria combinada entre GPU y RAM del sistema; no se dispone de cifras oficiales de VRAM por componente.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, un despliegue en una sola GPU exige aceleradores de memoria muy elevada (clase H100/H200 o A100 de 80 GB en configuraciones múltiples); no se confirma en la documentación.
- Consumer GPU: el modelo no cabe en una GPU de consumo individual. La propuesta de THOX es precisamente el reparto entre múltiples dispositivos mediante MeshStack.
- Opciones de despliegue: Ollama (soporte oficial de esta distribución) y orquestación distribuida con MeshStack, que es un componente separado de la descarga del modelo. No se documenta soporte de vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: no disponible. THOX no reclama cifras de rendimiento, latencia ni concurrencia para esta release, y señala que el comportamiento depende enteramente del hardware y la configuración del operador.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| thox-cluster-maverick | 235B | 22B | 128K (servido) | Apache 2.0 | GGUF Q4_K_M | Ollama; HuggingFace solo como model card |
| Qwen3-235B-A22B (base) | 235B | 22B | Según model card del proveedor | Apache 2.0 | Safetensors y otras | HuggingFace oficial |
| DeepSeek-V3 | 671B | 37B | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | HuggingFace oficial |
| Llama 3.1 405B | 405B | Densa | 128K | Licencia comunitaria Llama | Safetensors, GGUF | HuggingFace oficial |

La diferencia principal de thox-cluster-maverick frente al Qwen3-235B-A22B oficial es el empaquetado: pesos idénticos, cuantización Q4_K_M en GGUF y configuración orientada a Ollama y MeshStack. Frente a alternativas como DeepSeek-V3 o Llama 3.1 405B, comparte categoría de modelo abierto de gran escala, pero los datos comparativos de rendimiento no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo se distribuye para despliegue local; el rendimiento y el comportamiento dependen por completo del hardware y la configuración del operador.
- Tamaño de 142 GB: requiere planificación de almacenamiento e interconexión; el uso en producción crítica exige validación y redundancia por parte del operador.
- No hay evaluación independiente publicada de esta distribución; cualquier cifra de rendimiento debe tratarse con cautela.
- La model card declara `en` como único idioma, pese a que el catálogo reporta más de 100; conviene verificar el comportamiento multilingüe antes de usarlo en producción.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas en esta distribución.
- Sesgos conocidos: no documentados en la información disponible; deben asumirse los del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero los pesos siguen sujetos a los términos del proveedor original; verificar la model card del modelo base.
- El repositorio de HuggingFace no contiene pesos (solo `.gitattributes`); la distribución ejecutable está en Ollama, lo que condiciona la trazabilidad y la verificación de integridad por parte del usuario.
- El operador es responsable de cumplir las obligaciones regulatorias aplicables a su despliegue.
- El modelo no accede a información en línea ni a servicios externos salvo que el operador lo configure.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/thox-cluster-maverick
- Distribución Ollama: https://ollama.com/Thox-ai/thox-cluster-maverick
- Modelo base Qwen3-235B-A22B: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Sitio de THOX: https://thox.ai
- Campaña Kickstarter de THOX (MeshStack): no disponible como URL directa en la información proporcionada
