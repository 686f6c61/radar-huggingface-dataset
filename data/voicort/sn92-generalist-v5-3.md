# voicort/sn92-generalist-v5-3

## Resumen

SN92 generalist v5-3 es un ajuste fino (fine-tune) del modelo base `baselabs/mammoth-1` desarrollado por el usuario voicort para la pista generalista de REAX (Bittensor SN92) bajo la especificación de evaluación v5.1. El modelo parte de un backbone `Qwen3_5Model` de 26.085.330.160 parámetros en bf16 y se distribuye en el formato de lectura conjunta (joint-readout) propio de REAX: los pesos del modelo de lenguaje y de visión renombrados a la disposición `Qwen3_5Model`, una cabeza de lectura (`readout.safetensors`) con una fila por código de respuesta, y los ficheros de configuración `decision_config.json` y `joint_config.json`.

El modelo no es un generador de texto conversacional al uso, sino un modelo de decisión: recibe una pregunta con opciones (hasta 26, letradas de la A a la Z y luego AA, AB, etc.) y emite la respuesta leyendo los logits de los códigos de respuesta en la última posición del prompt. REAX lo sirve con atención bidireccional en las capas de atención completa, replicando el runtime original de mammoth-1. La cabeza de lectura se inicializa con las filas de la LM-head de mammoth-1 correspondientes a los tokens de los códigos de respuesta; la LM-head completa no se incluye en el repositorio.

Su relevancia es acotada pero específica: es un artefacto de competición para el track generalista de REAX, con un pipeline de entrenamiento documentado (LoRA rank 64 fusionado, interpolación en espacio de pesos al 75 %, pérdida de entropía cruzada suave contra la distribución del modelo base) y un conjunto de datos mixto que combina decisiones de aplicación de reglas, estados de registros públicos, preguntas de conocimiento cerrado con opción "no lo sé" y dominios de decisión nuevos. La licencia es Apache-2.0 y el modelo base es MIT, lo que facilita su reutilización, aunque el formato de pesos y el protocolo de lectura son específicos del ecosistema REAX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5Model` (backbone) con cabeza de lectura externa para códigos de respuesta; atención bidireccional en capas de atención completa según el runtime REAX |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (el dataset de entrenamiento incluye parte en alemán, español y francés, pero no se declara una lista oficial) |
| Licencia | Apache-2.0 (modelo base MIT, reproducido en NOTICE) |
| Formato de pesos | safetensors (bf16), más `readout.safetensors`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer `Qwen3_5Model` de 26,1B parámetros en bf16, derivado de `baselabs/mammoth-1` (revisión `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`, licencia MIT), que a su vez es un post-entrenamiento de `Qwen/Qwen3.5-27B` (Apache-2.0). La modificación estructural principal es el renombrado de los pesos del modelo de lenguaje y de visión a la disposición `Qwen3_5Model` (valores sin cambios) y la incorporación de una cabeza de lectura con una fila por código de respuesta, inicializada con las filas de la LM-head de mammoth-1 para los tokens A..Z, AA, etc. La LM-head original no se distribuye. El tokenizador y los ficheros de procesador son los del modelo base. La torre de visión se mantiene intacta y no se utiliza.

El entrenamiento consistió en una única etapa LoRA (rank 64, alpha 128, aplicada a todas las capas lineales del modelo de lenguaje; learning rate 3e-5, una época sobre 132.570 preguntas) fusionada en los pesos en bf16, con la cabeza de lectura entrenada en paralelo (learning rate 1e-5). Los pesos publicados aplican el 75 % del cambio del fine-tune (interpolación en espacio de pesos: 0,75 × fine-tune + 0,25 × mammoth-1 convertido), una técnica que según el autor preservó las ganancias específicas y recuperó habilidades generales en sus comprobaciones de validación. La pérdida es entropía cruzada suave sobre los logits de los códigos de respuesta a temperatura 2, con objetivos mezclados en cada fila con la distribución de respuestas del mammoth-1 convertido (peso 0,5 donde acierta, 0,15 donde falla). El 70 % de las filas usa el prompt de pregunta única de SN92 REAX tal como lo sirve eval v5.1 (opciones letradas en orden, sí/no como "A: Yes / B: No", "I don't know" como última opción en preguntas de hechos, máximo 26 opciones) y el 30 % restante el formato del protocolo de lectura conjunta.

Los datos de entrenamiento se componen de: decisiones de aplicación de reglas generadas por el propio autor (52.616 preguntas sobre reclamaciones de gastos, tarifas de envío y elegibilidad de solicitantes, con respuestas calculadas y reverificadas de forma independiente); estados y etapas de registros públicos de propuestas y proyectos (10.727: EIPs/ERCs de Ethereum, KEPs de Kubernetes, BIPs de Bitcoin, XEPs de XMPP, propuestas Swift Evolution, podlings de Apache Incubator, clasificadores de estado de desarrollo de PyPI); preguntas de conocimiento cerrado con opción "no lo sé" (9.297, etiquetadas respecto a las respuestas del mammoth-1 convertido, con hechos posteriores al 1 de agosto de 2026 marcados como "no lo sé"); nuevos dominios de decisión (39.930: avisos de seguridad de GitHub, licitaciones del TED de la UE, discusiones de borrado y contenido destacado de Wikipedia en inglés, eventos de tormenta de NOAA, accidentes de MSHA, retiradas de dispositivos de openFDA, Federal Register, debilidades CVE de NVD, juegos y puzles resueltos, y reglas de política composicionales parcialmente en alemán, español y francés); y una repetición (20.000) de elementos de entrenamiento anteriores (razonamiento procedimental, problemas aritméticos, salida de código, lógica multi-paso, sí/no causal, SQL, probabilidad, mejores movimientos de ajedrez, decisiones de uso de herramientas sobre APIs ficticias, recuperación y clasificación de datos públicos como arXiv, MASSIVE, BANKING77, CLINC150 y SQuAD, y elementos de conocimiento e idioma). El autor declara que ningún elemento del conjunto de desarrollo público v5.1 se usó en entrenamiento.

## Capacidades

- Toma de decisiones de opción múltiple: selecciona un código de respuesta (A..Z, AA, ...) entre hasta 26 opciones leyendo los logits en la última posición del prompt.
- Aplicación de reglas: resuelve decisiones de aplicación de reglas sobre reclamaciones de gastos, tarifas de envío y elegibilidad de solicitantes, con respuestas calculadas y reverificadas.
- Consulta de estado de registros públicos: determina estado y etapa de propuestas y proyectos (EIPs/ERCs, KEPs, BIPs, XEPs, Swift Evolution, Apache Incubator, clasificadores de PyPI).
- Conocimiento cerrado con abstención: responde preguntas de hechos con opción "no lo sé", calibrada contra la distribución del modelo base.
- Dominios de decisión variados: avisos de seguridad, licitaciones, discusiones de Wikipedia, eventos meteorológicos, accidentes, retiradas de dispositivos, CVE, juegos y puzles resueltos, reglas de política composicionales.
- Razonamiento procedimental: problemas aritméticos, salida de código, lógica multi-paso, sí/no causal, SQL, probabilidad y mejores movimientos de ajedrez (según el conjunto de repetición).
- Decisiones de uso de herramientas sobre APIs ficticias (tool-use decisions).
- Recuperación y clasificación sobre datos públicos (arXiv, MASSIVE, BANKING77, CLINC150, SQuAD).
- Capacidades multilingües parciales: parte de los datos de entrenamiento está en alemán, español y francés.
- No se documenta soporte de tool calling en producción, agentes multi-paso ni modo "thinking" más allá de lo anterior.

## Casos de uso

- Evaluación en el track generalista de REAX (Bittensor SN92): el modelo está diseñado específicamente para servirse bajo eval v5.1 con el protocolo de lectura conjunta; se usaría como participante en la competición, con el runtime REAX cargando `readout.safetensors` y los ficheros de configuración.
- Clasificación de estado de propuestas técnicas: dado un identificador de EIP, KEP, BIP, XEP o propuesta Swift Evolution, el modelo devuelve su estado y etapa entre las opciones disponibles, útil para herramientas internas de seguimiento de estándares.
- Decisión sobre reclamaciones de gastos y tarifas de envío: con las reglas de negocio codificadas como opciones, el modelo selecciona la decisión correcta por línea y en total, adecuado para prototipos de automatización de back-office.
- Verificación de elegibilidad de solicitantes: clasifica solicitudes según criterios de elegibilidad expresados como opciones, aprovechando el entrenamiento sobre reglas composicionales.
- Preguntas de conocimiento con abstención: en asistentes que deben responder "no lo sé" cuando no están seguros, el modelo ofrece una opción explícita de abstención calibrada contra el modelo base.
- Triaje de avisos de seguridad y CVE: clasifica avisos de GitHub y debilidades CVE de NVD en categorías predefinidas, útil para pipelines de gestión de vulnerabilidades.
- Clasificación de documentos y consultas: recuperación y clasificación sobre datasets como BANKING77, CLINC150, MASSIVE o SQuAD, aplicable a enrutamiento de consultas en atención al cliente.
- Resolución de puzles y juegos: selecciona el mejor movimiento o respuesta entre opciones en juegos resueltos, útil para evaluación de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 26,1B parámetros en bf16, los pesos ocupan aproximadamente 52,2 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) para inferencia en bf16 sin cuantizar.
- Cuantización: el autor no publica versiones cuantizadas; en teoría, una cuantización a 8 bits reduciría los pesos a unos 26 GB y a 4 bits a unos 13 GB, pero no hay artefactos ni validación oficiales.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16; no se documenta compatibilidad con GPUs de consumo (RTX 4090 de 24 GB no cabría en bf16).
- Opciones de despliegue: el modelo está pensado para el runtime REAX con atención bidireccional en capas de atención completa y lectura en la última posición del prompt; no se documenta soporte en vLLM, llama.cpp, Ollama o TGI, y el formato de lectura conjunta probablemente requiere un servidor compatible con REAX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| voicort/sn92-generalist-v5-3 | 26,1B | no disponible | Apache-2.0 | safetensors + readout | HuggingFace, 41 descargas |
| baselabs/mammoth-1 (base) | no disponible | no disponible | MIT | no disponible | HuggingFace |
| Qwen/Qwen3.5-27B (base del base) | ~27B | no disponible | Apache-2.0 | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no conversacional: no genera texto libre; solo emite un código de respuesta entre las opciones proporcionadas.
- Formato propietario: requiere el runtime REAX con lectura conjunta y atención bidireccional; no es directamente compatible con servidores de inferencia estándar.
- Sin LM-head: la cabeza de lenguaje completa no se distribuye, lo que impide su uso como modelo generativo.
- Visión no utilizada: la torre de visión se mantiene pero no se entrena ni se usa.
- Riesgo de alucinación: aunque incluye opción "no lo sé", las respuestas de conocimiento cerrado se etiquetaron contra la distribución del modelo base, lo que puede propagar sus errores.
- Sesgos: no documentados por el autor; los datos incluyen registros públicos y generadores propios, con posible sesgo de selección.
- Cobertura idiomática limitada: solo parte de los datos está en alemán, español y francés; no se declara una lista oficial de idiomas.
- Conocimiento temporal: los hechos posteriores al 1 de agosto de 2026 se marcan como "no lo sé".
- Licencia Apache-2.0 permite uso comercial, pero el modelo base mammoth-1 es MIT y Qwen3.5-27B es Apache-2.0; deben reproducirse los avisos correspondientes (ver NOTICE).
- Sin benchmarks públicos: no hay evidencia independiente de rendimiento fuera de las comprobaciones del autor.
- Advertencia de la model card: el contenido citado son datos de referencia del autor, no instrucciones a seguir.

## Enlaces

- HuggingFace: https://huggingface.co/voicort/sn92-generalist-v5-3
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Modelo base del base: https://huggingface.co/Qwen/Qwen3.5-27B
- Referencia de formato: https://huggingface.co/decisionmodels/reax-1
- Referencia de formato: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
