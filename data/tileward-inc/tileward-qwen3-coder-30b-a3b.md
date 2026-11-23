# Tileward-Inc/Tileward-Qwen3-Coder-30B-A3B

## Resumen

Tileward-Qwen3-Coder-30B-A3B es una versión comprimida del modelo Qwen3-Coder-30B-A3B-Instruct desarrollado por el equipo Qwen. La compresión la ha realizado Tileward, una empresa que aplica técnicas propietarias de reducción de pesos para disminuir el espacio en disco y, presumiblemente, los requisitos de memoria del modelo original. El modelo base es un transformer de tipo Mixture of Experts (MoE) orientado a generación de código y texto, con licencia Apache 2.0.

La propuesta de valor es la eficiencia: el autor declara una reducción de tamaño de 61,1 GB a 18,5 GB, es decir, un factor de compresión de 3,3x, manteniendo una fidelidad alta respecto al modelo original. Según la model card, la opción top-1 del modelo original queda dentro del top-5 de esta versión comprimida en el 99,7% de los casos, una métrica de acuerdo de siguiente token que sugiere una degradación limitada en la distribución de salida.

Es relevante porque aborda uno de los cuellos de botella prácticos del despliegue de modelos MoE grandes: el coste de almacenamiento y de carga en memoria. Sin embargo, hay una advertencia importante: los pesos no están publicados en Hugging Face. El repositorio actúa como ficha descriptiva y el acceso al modelo se gestiona bajo petición al equipo de Tileward, lo que condiciona su evaluación y su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer, derivada de Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | no disponible (el nombre del modelo base sugiere 30B, sin confirmación en la información proporcionada) |
| Parametros activos | no disponible (el nombre del modelo base sugiere 3B activos, sin confirmación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compresión propietaria de Tileward, no descrita en detalle) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos no publicados en el repositorio) |

## Arquitectura y entrenamiento

El modelo base, Qwen3-Coder-30B-A3B-Instruct, es un transformer con arquitectura Mixture of Experts según las etiquetas del repositorio. La información proporcionada no detalla el número de expertos, la estrategia de enrutamiento, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa del modelo base.

La intervención de Tileward es una compresión de pesos que reduce el tamaño en disco de 61,1 GB a 18,5 GB. La model card no describe el algoritmo de compresión, el esquema de cuantización subyacente ni el proceso de calibración. La única métrica técnica publicada es el acuerdo de siguiente token: la elección top-1 del modelo original aparece dentro del top-5 del modelo comprimido en el 99,7% de los casos. No se reportan métricas de perplejidad, divergencia KL ni evaluaciones de tareas, por lo que no es posible cuantificar la pérdida de calidad más allá de esa medida de solapamiento.

## Capacidades

- Generación de texto y código, heredadas del modelo base Qwen3-Coder-30B-A3B-Instruct.
- Razonamiento y resolución de problemas de programación, presumiblemente con soporte de instrucciones (sufijo Instruct en el modelo base).
- Soporte de tool calling y function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no confirmado en la información proporcionada.
- API compatible con OpenAI en `https://api.tileward.com/v1`, según la model card, lo que facilita la integración con clientes existentes.

## Casos de uso

- Evaluación de técnicas de compresión de modelos MoE: el modelo sirve como caso de estudio para medir la degradación de un MoE de código tras una reducción de 3,3x en tamaño, usando la métrica de acuerdo top-5 publicada como punto de partida.
- Despliegue en entornos con almacenamiento limitado: los 18,5 GB frente a los 61,1 GB originales reducen el coste de almacenamiento y el tiempo de carga en clústeres con múltiples réplicas del modelo.
- Asistentes de código en IDE: si la fidelidad se mantiene en tareas reales, el modelo podría integrarse en extensiones de autocompletado y generación de código, aunque la falta de pesos publicados obliga a usar la API de Tileward.
- Prototipado rápido vía API: el crédito inicial de 25 dólares y la compatibilidad con el formato OpenAI permiten probar el modelo en pipelines existentes sin infraestructura propia.
- Generación de código en pipelines de CI/CD: no confirmado por falta de datos sobre tool calling y latencia; requeriría validación previa.
- Investigación sobre cuantización y compresión: comparación de la distribución de salida del modelo comprimido frente al original en tareas de código, usando la métrica de acuerdo de siguiente token como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es el acuerdo de siguiente token: la elección top-1 del modelo original está dentro del top-5 del modelo comprimido en el 99,7% de los casos. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño en disco es de 18,5 GB, pero la VRAM necesaria depende del esquema de compresión y del runtime, que no se especifican.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Los 18,5 GB en disco sugieren que podría caber en GPUs con 24 GB de VRAM, pero no hay confirmación del autor.
- Opciones de despliegue: la model card solo menciona la API compatible con OpenAI en `https://api.tileward.com/v1`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-Qwen3-Coder-30B-A3B | no disponible (base ~30B) | no disponible | 18,5 GB | Apache 2.0 | Bajo petición, API |
| Qwen3-Coder-30B-A3B-Instruct | ~30B (MoE, ~3B activos según nombre) | no disponible | 61,1 GB | Apache 2.0 | Pesos públicos en Hugging Face |
| Alternativas de código de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base original, que está disponible públicamente y sin restricciones de acceso. Frente a él, la versión de Tileward ofrece un tamaño 3,3x menor a cambio de una fidelidad del 99,7% en la métrica top-5 y de un acceso restringido a los pesos.

## Limitaciones y advertencias

- Los pesos no están publicados en Hugging Face. El acceso requiere concertar una reunión con un ingeniero de Tileward, lo que impide la descarga directa, la auditoría independiente y el despliegue autónomo.
- No se describe el algoritmo de compresión ni el esquema de cuantización, por lo que no es posible evaluar su reproducibilidad ni su comportamiento fuera de la distribución de calibración.
- La métrica de acuerdo top-5 (99,7%) no equivale a una medida de calidad en tareas: no hay datos de HumanEval, MMLU ni de perplejidad que permitan cuantificar la degradación real.
- Sesgos conocidos: no disponibles. Al derivar del modelo base, heredaría sus sesgos, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la ausencia de pesos publicados limita de facto su uso a la API del proveedor.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en septiembre de 2026, lo que indica una adopción aún nula y ausencia de validación por parte de la comunidad.
- No se especifican requisitos de hardware ni runtimes soportados, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Qwen3-Coder-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Web de Tileward: https://tileward.com
- Investigación de Tileward: https://tileward.com/research/
- API y plataforma: https://app.tileward.com/?join=explore
- Endpoint de API compatible con OpenAI: https://api.tileward.com/v1
- Reserva de reunión con el equipo: https://calendar.app.google/hg2DzFTxKJgwFWm19
