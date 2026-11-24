# SZLHOLDINGS/kimi-estate-ops

## Resumen

kimi-estate-ops es un modelo de la línea Kimi publicado por la organización SZLHOLDINGS, distribuido exclusivamente en formato GGUF y orientado a tareas internas de operaciones y gobernanza ("estate governance/ops seat") de dicha organización. Según la model card, cuenta con 16.000 millones de parámetros, cuantización Q4_K_M y una ventana de contexto de 131.072 tokens, y fue publicado el 24 de noviembre de 2026 desde la infraestructura Ollama del autor.

El modelo se presenta como un ajuste específico ("estate-trained") sobre una base de la familia Kimi, empaquetado para su ejecución directa con Ollama mediante el comando `ollama run hf.co/SZLHOLDINGS/kimi-estate-ops`. No se documenta la arquitectura interna, el proceso de entrenamiento ni la composición de datos más allá de la etiqueta "estate-trained".

La relevancia de esta ficha es limitada: el autor declara explícitamente una doctrina de "honest no-deploy-claims", es decir, no formula afirmaciones de seguridad para consumidores ni de rendimiento en benchmarks. El repositorio registra cero descargas y cero likes en el momento de la consulta, y la información pública disponible es mínima, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (línea Kimi; detalles no publicados) |
| Parametros totales | 16B (según model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_K_M (única variante publicada) |
| Idiomas soportados | no disponible |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo. La model card únicamente indica que pertenece a la "línea Kimi" y que ha recibido un entrenamiento específico para el dominio de operaciones y gobernanza del "estate" de SZLHOLDINGS, sin especificar el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

El único dato técnico verificable es el empaquetado: pesos en GGUF con cuantización Q4_K_M y una ventana de contexto declarada de 131.072 tokens, lo que sugiere que la base subyacente soporta contextos largos, aunque no se detalla si el ajuste específico preserva esa capacidad completa en la práctica.

## Capacidades

- Generación de texto orientada a tareas de operaciones y gobernanza interna, según la descripción del autor.
- Ventana de contexto larga declarada (131.072 tokens), adecuada para documentos extensos o conversaciones multi-turno prolongadas.
- Ejecución local mediante Ollama, con el comando publicado en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Gestión documental interna de gran volumen: la ventana de 131.072 tokens permitiría procesar contratos, normativas o expedientes completos en una sola pasada, útil para resúmenes y extracción de cláusulas en el ámbito de gobernanza del estate.
- Asistencia a flujos de operaciones internas: el ajuste "estate-trained" sugiere familiaridad con terminología y procedimientos propios de SZLHOLDINGS, lo que lo hace adecuado para asistentes internos de consulta sobre procedimientos.
- Despliegue local con Ollama: al distribuirse en GGUF Q4_K_M, puede ejecutarse en estaciones de trabajo sin infraestructura de servidores GPU dedicada, lo que facilita pilotos internos.
- Clasificación y enrutado de solicitudes internas: con contexto largo, puede clasificar tickets o peticiones con historial adjunto completo.
- Borradores de documentación de gobernanza: generación de actas, informes y resúmenes de cumplimiento a partir de material interno.
- Prototipado de asistentes conversacionales de dominio cerrado: su naturaleza específica lo hace apropiado para entornos controlados donde el vocabulario y los procedimientos son acotados, no para atención al cliente generalista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no formula afirmaciones de rendimiento ("no benchmark claims are made").

## Requisitos de hardware

- VRAM estimada para inferencia: con 16B parámetros en Q4_K_M (aproximadamente 4,5 bits por peso), el peso del modelo ronda los 9-10 GB; sumando caché KV para contexto largo, se recomienda al menos 12-16 GB de VRAM para uso con contexto moderado y bastante más para explotar los 131.072 tokens completos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 permitirían contexto amplio; una GPU consumer de 12-16 GB podría bastar con contexto reducido.
- Cabe en GPU consumer: probablemente sí en modelos con 12 GB o más en Q4_K_M con contexto corto, aunque no hay confirmación del autor.
- Opciones de despliegue: Ollama (método oficial documentado); llama.cpp es compatible por el formato GGUF. vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kimi-estate-ops (SZLHOLDINGS) | 16B | 131.072 | GGUF Q4_K_M | other | Ajuste interno, sin benchmarks |
| Kimi base (familia) | no disponible | no disponible | no disponible | no disponible | Base de referencia citada por el autor |
| Alternativas de 13-16B open source | 13-16B | variable | safetensors/GGUF | variable | No se dispone de comparación verificable con este artefacto |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría; la comparativa queda limitada a parámetros y formato.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor no publica métricas de MMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento real es desconocido.
- Doctrina "no-deploy-claims": el propio autor declara que no formula afirmaciones de seguridad para consumidores, lo que desaconseja su uso en productos de cara al público.
- Licencia "other" sin texto de términos publicado: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce la cobertura multilingüe real.
- Riesgo de alucinación: no documentado ni evaluado; al ser un ajuste de dominio cerrado, es probable que generalice mal fuera de su ámbito de entrenamiento.
- Sesgos: no evaluados ni documentados.
- Contexto declarado de 131.072 tokens sin confirmación de que el ajuste específico lo mantenga efectivo.
- Repositorio sin tracción (0 descargas, 0 likes) y publicado recientemente: sin validación por parte de la comunidad.
- Arquitectura y proceso de entrenamiento no documentados, lo que impide auditar su procedencia.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/kimi-estate-ops
- Ejecución con Ollama: `ollama run hf.co/SZLHOLDINGS/kimi-estate-ops`
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
