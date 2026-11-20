# Thaurock/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF es una coleccion completa de cuantizaciones en formato GGUF del modelo huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated, publicada por el usuario Thaurock. El modelo subyacente combina la destilacion de razonamiento de DeepSeek-R1 sobre la base Qwen de 32B parametros (Alibaba Cloud) con una tecnica de abliteration aplicada por huihui-ai que elimina los filtros de censura y rechazo del modelo original.

El resultado es un modelo de 32.763.876.352 parametros (aproximadamente 32,8B) orientado a generacion de texto con capacidad de razonamiento profundo mediante cadenas de pensamiento delimitadas por etiquetas `<think>`, pero sin las restricciones de seguridad artificiales del modelo de partida. Esta cuantizado en once variantes que van desde F16 (aproximadamente 65,6 GB) hasta Q2_K (aproximadamente 12,1 GB), lo que permite desplegarlo desde estaciones de trabajo con GPU de gama alta hasta equipos de consumo con VRAM limitada.

Su relevancia actual radica en que ofrece el espectro completo de cuantizaciones en un unico repositorio, algo poco habitual en publicaciones GGUF, y en que preserva las capacidades de razonamiento del destilado original mientras elimina los rechazos. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de filtros de seguridad traslada toda la responsabilidad del contenido generado al operador de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen de 32B, destilado de razonamiento DeepSeek-R1) |
| Parametros totales | 32.763.876.352 (aproximadamente 32,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 271,7 GB con las once variantes y SHA256SUMS.txt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de la familia Qwen de 32B parametros. Sobre esa base, DeepSeek aplico un proceso de destilacion de razonamiento: el modelo aprende a generar cadenas de pensamiento largas delimitadas por etiquetas `<think>` antes de emitir la respuesta final, imitando el comportamiento del modelo de razonamiento DeepSeek-R1. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el destilado.

Posteriormente, huihui-ai aplico tecnicas de abliteration, un procedimiento que identifica y neutraliza las direcciones del espacio de activaciones asociadas al rechazo y a la censura, de modo que el modelo responde sin negativas ni filtros de contenido. La model card advierte que, en prompts ambiguos, el modelo puede omitir la etiqueta `<think>` o intentar un rechazo inicial, y recomienda usar ejemplos few-shot o pre-rellenar la respuesta del asistente con una etiqueta `<think>` abierta para forzar la cadena de razonamiento sin restricciones. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y de respuesta a preguntas.
- Razonamiento profundo mediante cadenas de pensamiento nativas en etiquetas `<think>`.
- Razonamiento matematico y logico derivado de la destilacion de DeepSeek-R1.
- Generacion y explicacion de codigo, incluyendo conceptos tecnicos complejos (la model card usa como ejemplo la criptografia de curva eliptica).
- Respuesta sin filtros de censura ni rechazos artificiales gracias a la abliteration.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el pipeline de text-generation.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues explicitas.

## Casos de uso

- Razonamiento tecnico asistido: el modelo puede resolver explicaciones paso a paso de conceptos complejos (criptografia, algoritmos, fisica) usando su cadena de pensamiento interna, adecuado para documentacion tecnica y materiales didacticos.
- Generacion de codigo y explicacion de codigo: util en entornos de desarrollo donde se necesita justificar decisiones de diseno o analizar fragmentos de codigo con razonamiento explicito antes de la respuesta.
- Investigacion sobre alineacion y seguridad: al carecer de filtros, sirve como banco de pruebas para estudiar comportamientos sin censura, red teaming y evaluacion de riesgos en modelos abliterated.
- Despliegue local en estaciones de trabajo: con Q4_K_M (aproximadamente 19,9 GB) se puede ejecutar en GPU de consumo de gama alta mediante llama.cpp, Ollama o LM Studio, sin depender de APIs externas.
- Procesamiento de datos sensible en local: al ejecutarse en hardware propio, permite analizar textos confidenciales sin enviarlos a servicios en la nube.
- Prototipado de asistentes conversacionales sin restricciones tematicas: para dominios creativos o de ficcion donde los filtros estandar bloquean contenido legitimo, con la supervision humana correspondiente.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye once variantes, lo que permite medir el impacto de la compresion (de F16 a Q2_K) en la coherencia del razonamiento y en tokens por segundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin overhead de contexto): F16 aproximadamente 65,6 GB; Q8_0 aproximadamente 34,8 GB; Q6_K aproximadamente 27,2 GB; Q5_K_M aproximadamente 23,4 GB; Q4_K_M aproximadamente 19,9 GB; Q4_K_S aproximadamente 18,8 GB; Q3_K_L aproximadamente 16,5 GB; Q2_K aproximadamente 12,1 GB.
- GPU recomendadas: para F16 y Q8_0, A100 80 GB o H100; para Q6_K y Q5_K_M, A100 40 GB o dos RTX 4090; para Q4_K_M, una RTX 4090 (24 GB) con margen ajustado o dos GPU de 16 GB.
- Cabe en GPU de consumo: Q4_K_M y Q4_K_S en RTX 4090 (24 GB); Q3_K y Q2_K en GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) o en configuraciones parciales CPU/GPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio y Text-Generation-WebUI, segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la cuantizacion, del hardware y de la longitud de la cadena de pensamiento generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Filtros de seguridad | Licencia | Formato |
|---|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF (este) | 32,8B | no disponible | Si (`<think>`) | Eliminados (abliterated) | Apache 2.0 | GGUF (11 cuantizaciones) |
| DeepSeek-R1-Distill-Qwen-32B (original) | 32,8B | no disponible | Si (`<think>`) | Estandar | MIT (segun el modelo original de DeepSeek) | safetensors |
| huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated | 32,8B | no disponible | Si (`<think>`) | Eliminados (abliterated) | Apache 2.0 | safetensors |
| Qwen2.5-32B-Instruct | 32,8B | no disponible | No nativo | Estandar | Apache 2.0 | safetensors, GGUF |

Los datos de contexto y benchmarks de los modelos comparables no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, formato, licencia y presencia de razonamiento y filtros.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido danino, ilegal o sesgado; la model card declara que el contenido generado es responsabilidad exclusiva de quien ejecuta la inferencia.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar datos, citas o resultados, especialmente en dominios especializados.
- Degradacion en cuantizaciones bajas: la model card advierte que Q2_K puede presentar problemas en la estructura interna de las etiquetas de pensamiento y lo limita a desarrollo experimental; Q3_K tambien reduce la calidad del razonamiento.
- Posible omision de la etiqueta `<think>` o rechazo inicial en prompts ambiguos, que requiere few-shot o pre-relleno para forzar la cadena de razonamiento.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas del modelo base.
- Longitud de contexto no documentada en la informacion disponible.
- Uso comercial permitido por Apache 2.0, pero el operador asume la responsabilidad legal y etica del contenido generado; conviene auditar el modelo antes de exponerlo a usuarios finales.
- Repositorio de 271,7 GB: la descarga completa es costosa; se recomienda descargar solo la cuantizacion necesaria y verificar la integridad con SHA256SUMS.txt.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thaurock/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated
- Autor de la abliteration: https://huggingface.co/huihui-ai
- Autor de las cuantizaciones GGUF: https://huggingface.co/Thaurock
- Modelo original de DeepSeek-R1: no disponible en la informacion proporcionada
- Paper de DeepSeek-R1: no disponible en la informacion proporcionada
