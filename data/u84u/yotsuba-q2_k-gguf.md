# u84u/Yotsuba-Q2_K-GGUF

## Resumen

Yotsuba-Q2_K-GGUF es una cuantización en formato GGUF del modelo Yotsuba, desarrollado originalmente por frzr-labs y convertida por el usuario u84u mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. Se trata de un modelo de generación de texto de aproximadamente 7.615 millones de parámetros (7,6B), afinado para diálogo y discurso con un dataset derivado de 4chan (frzr-labs/4chan-pol). Su propósito declarado es la investigación sobre dinámicas de discurso en foros anónimos y el estudio de riesgos de seguridad en modelos de lenguaje.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización Q2_K de un modelo de 7,6B, un nivel de compresión agresivo que reduce el peso a unos 3 GB y permite ejecución en hardware muy modesto. Por otro, el modelo original está sujeto a acceso restringido (gated) por su potencial impacto dañino, y la model card limita explícitamente el acceso a investigadores verificables, instituciones y equipos de ingeniería de seguridad. Esta cuantización concreta, publicada en abierto, plantea una tensión evidente con esa restricción de acceso.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del repositorio cuantizado remite a la del modelo base y no incluye detalles técnicos adicionales. Los datos de esta ficha proceden de los metadatos de HuggingFace y de la model card citada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base frzr-labs/Yotsuba; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048` en llama-server, pero no se confirma como contexto nativo) |
| Tipos de cuantizacion | Q2_K (GGUF); el repositorio contiene únicamente esta cuantización |
| Idiomas soportados | inglés (en) |
| Licencia | openrail-m (OpenRAIL-M) |
| Formato de pesos | GGUF (archivo `yotsuba-q2_k.gguf`); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base frzr-labs/Yotsuba en la documentación proporcionada. Por el número de parámetros (7,6B) y la librería declarada (transformers), encaja en la categoría de modelos transformer decoder-only de tamaño medio, pero no se confirma la familia arquitectónica concreta ni detalles como número de capas, dimensión oculta o mecanismo de atención.

Respecto a los datos de entrenamiento, la model card indica el dataset frzr-labs/4chan-pol, orientado a diálogo y discurso (tags `dialogue`, `discourse`, `4chan`). No se especifica el número de tokens, la composición exacta del corpus, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. La cuantización Q2_K se generó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, un proceso automático de conversión y cuantización sin modificación de los pesos más allá de la compresión.

## Capacidades

- Generación de texto en inglés orientada a diálogo multi-turno y discurso conversacional.
- Modelado de estilo y registro propios de foros anónimos (4chan), según el dataset declarado.
- Ejecución local mediante llama.cpp, con CLI y servidor HTTP (`llama-server`).
- Compatibilidad con el ecosistema GGUF (llama.cpp y derivados que lean GGUF).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según los metadatos.
- No se documentan capacidades de código o matemáticas de forma específica.

## Casos de uso

- Investigación sobre discurso en foros anónimos: el modelo permite estudiar patrones de lenguaje, argumentación y toxicidad característicos de 4chan en un entorno controlado, que es el uso declarado por el autor del modelo base.
- Evaluación de seguridad y red teaming: equipos de seguridad pueden emplearlo para generar contenido adversario y probar clasificadores, filtros y sistemas de moderación frente a discurso dañino.
- Estudio de cuantización agresiva: comparar la calidad de Q2_K frente al modelo base en tareas de generación permite medir la degradación introducida por compresión de 2 bits por peso.
- Pruebas de despliegue en hardware limitado: con ~3 GB de pesos, sirve para validar pipelines de llama.cpp en equipos sin GPU dedicada o con VRAM reducida.
- Docencia sobre riesgos de modelos abiertos: caso práctico para ilustrar cómo una cuantización publicada en abierto puede eludir restricciones de acceso (gating) del modelo original.
- Reproducción de experimentos de investigación: investigadores con acceso al modelo base pueden usar esta versión para replicar resultados en entornos sin infraestructura de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB solo para los pesos en Q2_K; con overhead de contexto y caché KV, un valor práctico ronda los 4-5 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070); también cabe en iGPU con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; en configuraciones de 4 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), y cualquier runtime compatible con GGUF que soporte cuantización Q2_K. No se garantiza compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput: no disponibles; dependen fuertemente del hardware y de la longitud de contexto. La decodificación en Q2_K es más rápida que en cuantizaciones mayores por el menor ancho de banda de memoria requerido, pero a costa de calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yotsuba-Q2_K-GGUF (este) | 7,6B | no disponible | openrail-m | GGUF Q2_K | Cuantización agresiva de un modelo de diálogo especializado en 4chan; acceso restringido en el original |
| frzr-labs/Yotsuba (base) | 7,6B | no disponible | openrail-m | safetensors | Modelo original con gating; misma especialización |
| Mistral-7B-Instruct (referencia de tamaño) | 7,2B | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo generalista de tamaño comparable; licencia permisiva y amplia disponibilidad |
| Llama-3.1-8B-Instruct (referencia de tamaño) | 8,0B | 128K | Llama 3.1 Community License | safetensors, GGUF | Generalista con contexto largo y tool calling; mayor versatilidad para producción |

La comparación con Mistral-7B y Llama-3.1-8B es únicamente por rango de parámetros: Yotsuba está especializado en un dominio muy concreto y no se han publicado benchmarks que permitan comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Contenido potencialmente dañino: el modelo se entrenó con datos de 4chan y el autor original restringe el acceso por su potencial impacto perjudicial; se espera toxicidad, sesgos y lenguaje ofensivo en las salidas.
- Riesgo de alucinación elevado, agravado por la cuantización Q2_K, que degrada la calidad respecto al modelo base.
- La cuantización Q2_K es una de las más agresivas; puede producir salidas incoherentes o degradadas en comparación con cuantizaciones Q4 o superiores.
- Idiomas: solo inglés documentado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia OpenRAIL-M: incluye restricciones de uso (cláusulas de uso aceptable) que deben revisarse antes de cualquier despliegue, incluido el uso comercial.
- Tensión con el gating: el modelo base exige solicitud de acceso caso por caso, pero esta cuantización está publicada en abierto; su uso puede contravenir la intención del autor original y las políticas de uso responsable.
- Sin soporte documentado de tool calling, agentes o contexto largo; no apta para pipelines de producción que requieran estas capacidades.
- Uso previsto limitado a investigación y seguridad; no recomendada para aplicaciones de cara al usuario final.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/u84u/Yotsuba-Q2_K-GGUF
- Modelo base: https://huggingface.co/frzr-labs/Yotsuba
- Dataset de entrenamiento: https://huggingface.co/datasets/frzr-labs/4chan-pol
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
