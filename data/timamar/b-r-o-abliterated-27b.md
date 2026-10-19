# Timamar/B.R.O-abliterated-27B

## Resumen

B.R.O-abliterated-27B (Breaching Remote Operation) es un ajuste fino del modelo Qwen3.5-27B publicado por el usuario Timamar en HuggingFace. Se trata de una variante «abliterated», es decir, con la dirección de rechazo del modelo base ortogonalizada (técnica descrita por Arditi et al.) para eliminar las respuestas de negativa aprendidas durante el alineamiento, y posteriormente entrenada con un LoRA de rango 16 sobre trayectorias de seguridad ofensiva, red teaming, ingeniería inversa y explotación binaria. El resultado se fusionó en los pesos base, por lo que el repositorio distribuye tanto adaptadores LoRA como pesos completos cuantizados.

El modelo tiene 27.000 millones de parámetros, una ventana de contexto de 16.384 tokens y se distribuye en INT4 con un tamano aproximado de 20,6 GB, en formatos MLX safetensors y GGUF, lo que permite ejecutarlo en Ollama, llama.cpp o MLX. La licencia declarada es Apache-2.0, heredada del modelo base.

Su relevancia es acotada y muy específica: cubre el nicho de modelos sin censura orientados a tareas de ciberseguridad ofensiva, un espacio donde los modelos alineados comerciales rechazan sistemáticamente las peticiones. Conviene senalar que el repositorio no incluye evaluaciones, benchmarks ni documentación sobre el dataset de entrenamiento, y que el propio autor distribuye scripts de instalación y un endpoint remoto de Ollama, lo que anade riesgos operativos que se detallan más abajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, derivada de Qwen3.5-27B (detalles internos no disponibles) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 16.384 tokens (`num_ctx 16384` en el Modelfile de Ollama) |
| Tipos de cuantizacion | INT4 (~20,6 GB); se distribuyen safetensors MLX y GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors, GGUF y adaptadores LoRA (`adapters.safetensors`, rango 16) |
| Modelo base | Qwen/Qwen3.5-27B |
| Metodo de desalineado | Abliteration por ortogonalizacion de la dirección de rechazo (Arditi et al.) |
| Entrenamiento adicional | LoRA r16 con escala 20.0, fusionado en los pesos base |
| Runtime soportado | Ollama, llama.cpp, MLX |
| Descargas / likes | 0 descargas, 1 like (a fecha de la información disponible) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen3.5-27B, un transformer de 27.000 millones de parámetros del que no se detallan en la model card ni el número de capas, ni las dimensiones ocultas, ni el tipo de atención. El proceso de construcción tiene dos fases documentadas: primero una abliteration consistente en calcular la dirección de rechazo en el espacio de activaciones y ortogonalizar los pesos respecto a ella, de modo que el modelo pierde el sesgo aprendido a negarse a responder; después un ajuste LoRA de rango 16 con escala 20.0 sobre trayectorias de ciberseguridad ofensiva, red teaming, ingeniería inversa, explotación binaria y «deep-cyber», finalmente fusionado en los pesos base con `mlx_lm`.

No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni los hiperparámetros completos del LoRA más allá del rango y la escala. Tampoco se documenta ninguna innovación técnica propia más allá de la combinación de abliteration y LoRA especializado. La cuantización a INT4 se realizó con las herramientas de MLX, y el contexto está limitado a 16.384 tokens tanto en el Modelfile como en la configuración distribuida.

## Capacidades

- Generación de texto y conversación multi-turno en formato ChatML, con plantilla de chat incluida (`chat_template.jinja`).
- Contenido de seguridad ofensiva: el LoRA se entrenó específicamente sobre red teaming, ingeniería inversa, explotación binaria y trayectorias «deep-cyber», por lo que se espera mayor profundidad en estas áreas que el modelo base.
- Ausencia de rechazos: la abliteration elimina la dirección de rechazo, de modo que el modelo no aplica las negativas aprendidas del alineamiento del base.
- Razonamiento y generación de código: capacidad heredada del base Qwen3.5-27B, aunque no se documenta ni se evalúa el impacto de la abliteration en estas tareas.
- Tool calling / function calling: no documentado en la model card; no se confirma soporte nativo.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el contexto de 16.384 tokens limita las cadenas de agente largas.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades multimodales (visión, audio): no disponibles; la model card solo declara `text-generation`.

## Casos de uso

- Ejercicios de red team autorizados: el modelo puede generar hipótesis de ataque, borradores de payloads y análisis de superficie de exposición en entornos de laboratorio con alcance definido por contrato, aprovechando el ajuste específico sobre trayectorias ofensivas.
- Formación y concienciación en seguridad: generación de escenarios de phishing simulado, ejemplos de ingeniería social y materiales de formación para equipos internos, sin las negativas que un modelo alineado aplicaría a estas peticiones.
- Análisis de malware y ingeniería inversa asistida: apoyo en la lectura de binarios, identificación de patrones de ofuscación y explicación de técnicas de explotación, siempre en un entorno aislado y con fines defensivos.
- Automatización de informes de pentesting: redacción de secciones de explotación, vectores y remediación a partir de notas de campo, con 16.384 tokens de contexto suficientes para incorporar el detalle de una fase completa de un test.
- Investigación sobre alineamiento y robustez: el modelo sirve como objeto de estudio para medir cuánto degrada la abliteration las capacidades del base y qué tipo de contenido se vuelve accesible, en línea con la literatura de refusal direction.
- Desarrollo de clasificadores y filtros defensivos: generar un corpus de peticiones y respuestas ofensivas para entrenar o validar sistemas de detección y moderación, un uso habitual de los modelos «uncensored» en pipelines de seguridad.
- Ejecución local en hardware de estación de trabajo: con 20,6 GB en INT4 y runtime Ollama/MLX, encaja en despliegues de un solo equipo sin depender de APIs externas, lo que simplifica el aislamiento de datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones específicas de ciberseguridad (CTF, Cybench u otras), ni comparaciones con el modelo base sin abliterar. Tampoco se documenta el posible deterioro de capacidades generales causado por la ortogonalización de la dirección de rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 21-23 GB para los pesos INT4 (20,6 GB) más caché KV; con 16.384 tokens de contexto la caché puede anadir varios GB según el lote y la implementación.
- GPU recomendadas: A100 40 GB, H100, L40S 48 GB o RTX A6000 48 GB para trabajar con contexto completo y lotes mayores sin presión de memoria.
- GPU de consumo: encaja en RTX 3090, RTX 4090 o RTX 5090 (24-32 GB) en INT4 y con contexto moderado; por debajo de 24 GB requeriría cuantizaciones más agresivas o descarga parcial a CPU, no publicadas en el repositorio.
- Opciones de despliegue: Ollama (el autor incluye `Modelfile` con `num_ctx 16384`), llama.cpp con GGUF y MLX en Apple Silicon (formato nativo del repositorio). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna plataforma.
- Nota operativa: el autor propone un host remoto (`OLLAMA_HOST=https://bro.exody.ai`) y scripts de instalación `install-bro-27b-real.zsh` / `install-bro-27b.zsh` que descargan blobs de ~21 GB; conviene revisar su contenido antes de ejecutarlos y preferir el despliegue local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| B.R.O-abliterated-27B | 27B | 16.384 | Ciberseguridad ofensiva, sin censura | Apache-2.0 | HuggingFace (0 descargas), Ollama remoto |
| Qwen3.5-27B (base) | 27B | No disponible en esta ficha | Propósito general, alineado | Apache-2.0 | HuggingFace |
| Qwen3-32B | 32,8B | 32.768 nativo (131.072 con YaRN) | Propósito general, razonamiento | Apache-2.0 | HuggingFace, ecosistema amplio |
| Gemma 3 27B | 27B | 128.000 | Propósito general, multimodal | Licencia Gemma | HuggingFace |
| Mistral Small 3.1 24B | 24B | 128.000 | Propósito general, instrucciones | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparado para B.R.O-abliterated-27B, por lo que la comparación se limita a parámetros, contexto y licencia. Frente a los modelos de la tabla, la diferencia principal es el enfoque sin censura y la especialización en seguridad ofensiva, a costa de una ventana de contexto cuatro veces menor que Gemma 3 o Mistral Small 3.1 y de la ausencia total de evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni comparación con el base, ni medición del deterioro de capacidades tras la abliteration. El rendimiento real en tareas generales es desconocido.
- Riesgo de alucinación: la combinación de abliteration y ajuste LoRA sobre dominios muy técnicos sin verificación posterior incrementa la probabilidad de respuestas plausibles pero incorrectas en materia de exploits, CVEs y comandos.
- Contenido peligroso: el modelo está diseñado explícitamente para no rechazar peticiones de seguridad ofensiva; su uso sin autorización por escrito puede constituir delito en la mayoría de jurisdicciones (acceso no autorizado a sistemas, creación o distribución de malware).
- Idiomas no declarados: no se especifica qué idiomas soporta ni si el ajuste LoRA degradó el multilingüismo del base; el castellano podría tener un rendimiento inferior al inglés.
- Procedencia del artefacto: repositorio con 0 descargas y 1 like, creado y actualizado con minutos de diferencia, con scripts de instalación de terceros, un endpoint remoto de Ollama y un modelo base «Qwen3.5-27B» cuya existencia y pesos no se verifican en la ficha. Tratar los blobs y scripts como no confiables y auditar su contenido antes de ejecutarlos.
- Licencia: se declara Apache-2.0, heredada del base, pero el modelo no incluye aviso de atribución ni términos adicionales; conviene verificar la licencia del base Qwen3.5-27B antes de un uso comercial.
- Contexto limitado: 16.384 tokens es reducido para análisis de código extenso, volcados de binarios o cadenas de agente largas, y no hay soporte documentado de extensión por YaRN.
- Sin soporte confirmado de tool calling ni de integración con vLLM/TGI, lo que complica su uso en pipelines de producción con alto throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Timamar/B.R.O-abliterated-27B
- Repositorio GitHub y releases: https://github.com/timamar187-creator/BRO-abliterated-27B
- Sitio web y chat en vivo del autor: https://xia8p-static.vercel.app/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper de referencia de la técnica de abliteration (Arditi et al., «Refusal in Language Models Is Mediated by a Single Direction»): no disponible en la información proporcionada
