# wzl0666/41912-rtl-agent-w4a16

## Resumen

El modelo `wzl0666/41912-rtl-agent-w4a16` es un ajuste fino cuantizado del modelo base `ukisai/Swift-1.5-Qwen3.8-27b`, desarrollado por el usuario wzl0666. Está especializado en la generación y asistencia de código RTL (Verilog y SystemVerilog) y en el uso de herramientas de automatización de diseño electrónico, concretamente Vivado. El problema que aborda es la asistencia a ingenieros de hardware en tareas de descripción de registros y flujos de herramientas de síntesis mediante llamadas a funciones.

Técnicamente se trata de un transformer denso de 6.284.446.960 parámetros (~6,28 mil millones) cuantizado a 4 bits en pesos con activaciones de 16 bits (W4A16) mediante AutoRound 0.16.1 en formato auto_gptq, con tamaño de grupo 128 y cuantización simétrica. El contexto de servicio verificado es de 65.536 tokens y el repositorio ocupa 18,7 GB en safetensors. El modelo se distribuye bajo la licencia Swift Open License v1.0, que impone condiciones al uso comercial y no permite etiquetar el derivado como Apache-2.0 puro.

Su relevancia es acotada: es un modelo de nicho para un dominio muy específico (RTL y flujos Vivado), con pocas descargas (17) y sin validación pública de benchmarks. Resulta útil como referencia de pipeline de ajuste fino con LoRA más fusión y cuantización AutoRound para dominios técnicos, más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, tag `qwen3_5`) |
| Parametros totales | 6.284.446.960 (~6,28 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (configuración de servicio verificada) |
| Tipos de cuantizacion | W4A16, group size 128, simétrica, formato auto_gptq (AutoRound 0.16.1); cálculo en bfloat16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Swift Open License v1.0 (con componentes Apache 2.0 del modelo base) |
| Formato de pesos | safetensors (11 shards, 18.718.617.616 bytes) |

## Arquitectura y entrenamiento

El modelo parte de `ukisai/Swift-1.5-Qwen3.8-27b` (revisión fijada `b4c84d42903a8646b25857eb2827288d92ed85a4`), un transformer denso de la familia Qwen3. El entrenamiento se realizó en dos fases. La primera fase produjo `swift-rtl-v001-bf16-candidate-v003` con el dataset `dataset-preparation-v002`: 10.000 ejemplos de entrenamiento y 500 de validación procedentes de SALV (5.000), VeriCoder (4.000) y CodeV-R1 (1.000), durante 1 época y 1.250 pasos. La segunda fase, sobre los pesos ya fusionados de la primera, se centró en llamadas a herramientas Vivado con el dataset `vivado-clean-context-20261017-r1` (1.400 ejemplos de entrenamiento y 200 de validación), usando LoRA de rango 16, alpha 32, dropout 0,05, learning rate 2e-5, batch efectivo 8, longitud máxima 4.096, 1 época y 175 pasos de actualización.

La innovación técnica principal del repositorio no está en la arquitectura, sino en el pipeline de publicación: el adaptador LoRA de la segunda fase se fusionó con PEFT mediante `merge_and_unload(safe_merge=True)` y posteriormente se exportó a W4A16 con AutoRound 0.16.1. El autor advierte que el despliegue verificado usa vLLM con un overlay específico y sobrescritura de configuración de cuantización en AMD, por lo que no se garantiza la carga directa con vLLM estándar sin esa configuración. El modelo DFlash2 de decodificación especulativa es una dependencia externa opcional, no incluida en el repositorio, y no es necesario para decodificación normal.

## Capacidades

- Generación de código RTL en Verilog y SystemVerilog orientado a descripción de registros y diseño digital.
- Llamada a herramientas (tool calling / function calling) para flujos de Vivado, entrenada específicamente en la segunda fase.
- Razonamiento multi-paso orientado a tareas de ingeniería, con modo de pensamiento extendido (`xhigh` thinking) configurado en el servicio verificado.
- Asistencia en flujos de síntesis y automatización de herramientas EDA mediante invocación de funciones.
- Capacidades multilingües limitadas a inglés y chino; no se declara soporte de español.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistencia a ingenieros de hardware en la escritura de módulos Verilog y SystemVerilog: el modelo genera descripciones RTL a partir de especificaciones en lenguaje natural, apoyándose en el ajuste fino sobre SALV, VeriCoder y CodeV-R1.
- Automatización de flujos Vivado mediante tool calling: el ajuste de segunda fase permite al modelo emitir llamadas a funciones para tareas de síntesis e implementación dentro de un agente, reduciendo la interacción manual.
- Agente de soporte a scripts de automatización EDA: con 65.536 tokens de contexto puede mantener conversaciones multi-turno que incluyan fragmentos de código y logs de herramientas.
- Revisión y explicación de código RTL existente: el modelo puede analizar módulos y describir su comportamiento, útil como apoyo documental en equipos de diseño.
- Generación de testbenches y estímulos de simulación en inglés o chino, como punto de partida que el ingeniero debe validar con simulación independiente.
- Prototipado de asistentes internos para equipos de FPGA: al ser un modelo de 6,28 B en W4A16, puede desplegarse en infraestructura moderada con vLLM y servir como backend de un chat técnico especializado.
- Investigación sobre pipelines de ajuste fino en dominios técnicos: el repositorio documenta hashes, manifiestos y procedencia, lo que lo hace útil como referencia metodológica para reproducir el proceso LoRA + fusión + AutoRound.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las pruebas realizadas (interfaces, autotest y comprobaciones numéricas de la cuantización en muestras pequeñas) no equivalen a una tasa de acierto funcional completa ni demuestran generalización a problemas no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de W4A16 con ~6,28 B de parámetros, los pesos ocupan aproximadamente 3,5-4 GB; sumando caché KV para 65.536 tokens (el servicio verificado reserva 7 GiB de KV) el consumo total ronda los 11-12 GB en la configuración de referencia.
- GPU recomendadas: el despliegue verificado se realizó en AMD con vLLM y un overlay específico; no se documentan modelos NVIDIA concretos. Por tamaño, una RTX 4090 (24 GB) o A100/H100 cubren con holgura la configuración de 65.536 tokens.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 16 GB o más (RTX 4080, 4090, A6000) para el contexto completo; con contextos menores cabría en 12 GB.
- Opciones de despliegue: vLLM con auto_gptq y configuración de cuantización específica (requiere el overlay documentado por el autor); no se confirma compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona decodificación especulativa opcional con DFlash2 como dependencia externa, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wzl0666/41912-rtl-agent-w4a16 | 6,28 B (W4A16) | 65.536 | RTL + Vivado tool calling | Swift Open License v1.0 | HuggingFace, 17 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | no disponible en la información | no disponible | Generalista | Apache 2.0 (según nota del autor) | HuggingFace |
| Alternativas RTL especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que el código RTL generado requiere compilación, simulación y verificación de restricciones de diseño independientes; el modelo no garantiza corrección funcional.
- No se han publicado evaluaciones de generalización a problemas RTL no vistos; los conjuntos de validación son de tool calling, no de juicio RTL independiente.
- La procedencia y licencias de los datos de entrenamiento de la primera y segunda fase están pendientes de verificación según el propio autor, que no publica los datos originales.
- La licencia Swift Open License v1.0 impone condiciones al uso comercial y el derivado no puede etiquetarse como Apache-2.0 puro; es necesario revisar LICENSE, LICENSE-APACHE-2.0, NOTICE y MODIFICATIONS.md antes de uso en producción.
- El despliegue no está garantizado con vLLM estándar: requiere overlay y sobrescritura de configuración de cuantización verificados en AMD.
- Idiomas limitados a inglés y chino; no hay soporte declarado de español.
- Riesgo de alucinación en APIs de herramientas y en sintaxis RTL no cubierta por los datos de ajuste; el volumen de datos de la segunda fase (1.400 ejemplos) es reducido.
- Modelo de nicho con 17 descargas y sin likes: ausencia de validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/wzl0666/41912-rtl-agent-w4a16
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio de AutoRound: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible
- Demos: no disponible
