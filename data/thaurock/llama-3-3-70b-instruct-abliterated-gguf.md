# Thaurock/Llama-3.3-70B-Instruct-abliterated-GGUF

## Resumen

Thaurock/Llama-3.3-70B-Instruct-abliterated-GGUF es una colección de cuantizaciones en formato GGUF del modelo Llama-3.3-70B-Instruct-abliterated, derivado a su vez del Llama-3.3-70B-Instruct de Meta AI. El autor de las cuantizaciones es Thaurock, mientras que la modificación de abliteración (eliminación de los vectores de rechazo del modelo alineado) corresponde a huihui-ai. El modelo resuelve el problema de desplegar un modelo denso de 70.000 millones de parámetros en hardware local mediante `llama.cpp`, Ollama, LM Studio o Text-Generation-WebUI, ofreciendo un espectro de cuantizaciones desde FP16 hasta Q2_K.

La arquitectura subyacente es la transformer densa de Llama 3.3, con 70.553.706.560 parámetros totales según los pesos en safetensors del modelo base. La modificación de abliteración "apaga quirúrgicamente" los vectores de rechazo y alineación artificial, de modo que el modelo responde sin los filtros de seguridad del Instruct original, manteniendo la ventana de contexto de Llama 3.3.

Su relevancia actual radica en que permite ejecutar un modelo de 70B sin censura en equipos con 28-141 GB de memoria disponible según la cuantización elegida, algo inviable con los pesos originales en FP16 de aproximadamente 141 GB. El repositorio acumula 1.484 descargas y 2 likes, con un tamaño total de 584,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (Llama 3.3), sin mezcla de expertos |
| Parametros totales | 70.553.706.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | llama3.3 (Llama 3.3 Community License) |
| Formato de pesos | GGUF (sin fragmentacion, archivos unicos) |

## Arquitectura y entrenamiento

El modelo base es Llama-3.3-70B-Instruct de Meta AI, un transformer denso de 70.553.706.560 parámetros. Sobre él, huihui-ai aplicó una técnica de abliteration que identifica y suprime los vectores de dirección asociados al rechazo en el espacio de activaciones, sin reentrenar los pesos de forma convencional. El resultado conserva la capacidad lingüística y de razonamiento del Instruct original, pero elimina la capa de alineación que provoca respuestas de negativa ante determinados prompts.

Thaurock realizó la cuantización local de los pesos abliterated a formato GGUF con la cadena de herramientas de `llama.cpp`, generando once variantes con distintos bits por peso (BPW), desde 16,00 BPW en F16 hasta 2,90 BPW en Q2_K. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base, más allá de lo que corresponde al Instruct original de Meta, que no se detalla en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Instruct de Llama 3.3.
- Razonamiento y resolución de problemas de complejidad media-alta gracias al tamaño de 70B parámetros.
- Generación de código, ejemplificada en la model card con un prompt de ejemplo para ordenar una matriz en Python.
- Respuesta sin filtros de rechazo ante prompts que el modelo alineado rechazaría, por efecto de la abliteración.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y con endpoints compatibles.
- Soporte de cuantizaciones para despliegue en CPU, GPU o mixto mediante `llama.cpp`, Ollama, LM Studio y Text-Generation-WebUI.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un 70B sin capa de rechazo, comparando sus respuestas con las del Instruct original para analizar qué vectores de dirección se suprimen y cómo afecta a la coherencia.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde el Instruct original introduciría negativas; la variante Q5_K_M (~52 GB) ofrece el mejor equilibrio entre fidelidad lógica y requisitos de memoria.
- Evaluación de cuantizaciones: la colección completa de once archivos permite medir la degradación de calidad entre F16 y Q2_K sobre el mismo modelo, útil para estudiar el impacto de BPW en tareas de razonamiento.
- Despliegue local en estaciones de trabajo: con la variante Q4_K_M (~44 GB) se puede servir el modelo en una GPU de 48 GB o en un setup multi-GPU consumer, usando `llama.cpp` u Ollama como servidor compatible con la API de OpenAI.
- Red teaming y pruebas de robustez: al carecer de filtros, sirve como generador de prompts adversarios y casos límite para validar sistemas de moderación externos.
- Desarrollo de asistentes de código en entornos controlados: la variante Q4_K_S (~41 GB) prioriza velocidad de tokens por segundo y puede integrarse en pipelines de generación de código donde el operador asume la responsabilidad del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: F16 ~141 GB; Q8_0 ~75 GB; Q6_K ~60 GB; Q5_K_M ~52 GB; Q5_K_S ~50 GB; Q4_K_M ~44 GB; Q4_K_S ~41 GB; Q3_K_L ~37 GB; Q3_K_M ~34 GB; Q3_K_S ~31 GB; Q2_K ~28 GB.
- GPU recomendadas: A100 (80 GB) o CMP 170HX para Q8_0 y superiores, según la propia model card; para Q4_K_M y Q4_K_S se requiere una GPU de 48 GB o reparto entre varias GPUs.
- No cabe en GPUs consumer de 24 GB (RTX 4090, RTX 3090) en ninguna cuantización completa; solo sería posible con descarga parcial a RAM del sistema, con la penalización de velocidad correspondiente.
- Opciones de despliegue: `llama.cpp` (CLI y servidor), Ollama, LM Studio, Text-Generation-WebUI y Text Generation Inference.
- Latencia y throughput: no disponibles en la información proporcionada.
- Verificación de integridad: el repositorio incluye `SHA256SUMS.txt` para comprobar las descargas con `sha256sum -c`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Thaurock/Llama-3.3-70B-Instruct-abliterated-GGUF | 70,55B | No disponible | GGUF (11 cuantizaciones) | llama3.3 | Sin filtros de rechazo; cuantizaciones locales |
| meta-llama/Llama-3.3-70B-Instruct | 70,55B | No disponible | Safetensors | llama3.3 | Modelo base alineado, con filtros de rechazo |
| huihui-ai/Llama-3.3-70B-Instruct-abliterated | 70,55B | No disponible | Safetensors (pesos abliterated) | llama3.3 | Origen de la abliteración; sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: el modelo puede generar contenido dañino, ilegal o explícito; la responsabilidad recae íntegramente en quien ejecuta la inferencia.
- La abliteración puede degradar sutilmente la coherencia y el razonamiento respecto al Instruct original, aunque no se documenta cuantitativamente en la información disponible.
- Riesgo de alucinación inherente a los modelos de 70B, sin mitigaciones adicionales documentadas.
- La cuantización Q2_K (~2,90 BPW) es propensa a errores gramaticales y pérdidas de coherencia estructural, según advierte el propio autor; uso experimental.
- Licencia llama3.3: el uso comercial está sujeto a los términos de la Llama 3.3 Community License, que incluye restricciones para entidades con más de 700 millones de usuarios mensuales y obligaciones de atribución.
- Idiomas soportados no documentados explícitamente en la ficha; se heredan los del modelo base, no detallados.
- Longitud de contexto no confirmada en la información proporcionada; conviene verificar la configuración de `llama.cpp` para no exceder la ventana real del modelo base.
- El repositorio ocupa 584,2 GB en total; descargar la colección completa requiere espacio en disco considerable y verificación de hashes para evitar corrupciones.

## Enlaces

- Hugging Face: https://huggingface.co/Thaurock/Llama-3.3-70B-Instruct-abliterated-GGUF
- Ficha en abliteration.org: https://abliteration.org/models/Thaurock/Llama-3.3-70B-Instruct-abliterated-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Autor de la abliteración: https://huggingface.co/huihui-ai
- Perfil del cuantizador: https://huggingface.co/Thaurock
