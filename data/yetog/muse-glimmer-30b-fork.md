# yetog/Muse-Glimmer-30B-fork

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal de aproximadamente 30.000 millones de parametros desarrollado por Meta Superintelligence Lab, con un codificador de percepcion dedicado para entrada de imagen. La ficha que nos ocupa, `yetog/Muse-Glimmer-30B-fork`, es un fork subido por el usuario yetog el 29 de septiembre de 2026, sin descargas ni valoraciones registradas. El modelo original se publica bajo licencia Apache 2.0 y esta destilado a partir de Muse Spark.

El modelo esta disenado especificamente para tareas agenticas autonomas ejecutables en hardware de consumo, sin depender de infraestructura en la nube. Combina razonamiento multi-paso, uso fiable de herramientas (tool calling), comprension multimodal de texto e imagen, y recuperacion ante fallos. La arquitectura es un transformer causal denso de 52 capas con atencion de patron mixto local/global, ventana deslizante de 2048 tokens y una longitud de contexto de 131.072 tokens o mas.

Su relevancia actual radica en que integra capacidades propias de agentes (planificacion larga, esquemas de funciones precisos y reinterpretacion de errores) en un unico modelo que cabe en GPUs de 24 o 32 GB mediante cuantizacion a 4 bits, con una degradacion declarada de entre el 0,2 % y el 1,0 % en 15 benchmarks comunes. Incluye ademas un modelo "drafter" basado en DFlash para decodificacion especulativa por bloques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepcion (ViT) |
| Parametros totales | 29.776.626.688 (29,78B segun safetensors); ~29,6B segun model card |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | 4 bits (K-Quant-Dynamic, K-Quant-17GB) y precision completa |
| Idiomas soportados | mas de 100 idiomas segun model card; campo `languages` no disponible en HuggingFace |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimension oculta | 6.656 |
| Numero de capas | 52 |
| Patron de atencion | [Local, Local, Local, Global] en repeticion |
| Tamano de ventana deslizante | 2.048 |
| Atencion con compuerta (gated attention) | si |
| Cabezas de atencion (Q / KV) | 32 / 2 (GQA con ratio 16:1) |
| Dimension de cabeza | 128 |
| Tipo de FFN | SwiGLU |
| Dimension intermedia del FFN | 19.968 |
| Codificacion posicional | RoPE (θ = 500.000), solo en capas locales |
| Codificador de percepcion | ViT-G/14 de ~1,8B parametros, 50 capas, anchura 1.536, patch 14 |
| Tamano de vocabulario | 202.048 (200.000 tokens BPE + 2.048 especiales) |
| Tokens visuales maximos por imagen | 4.096 |
| Modalidades | Entrada: texto + imagen. Salida: texto |
| Fecha de corte de conocimiento | 4 de enero de 2026 |
| Fecha de publicacion declarada | agosto de 2026 |

## Arquitectura y entrenamiento

El modelo emplea un transformer causal denso de 52 capas con un patron de atencion que alterna tres capas locales seguidas de una global ([Local, Local, Local, Global]). Las capas locales usan una ventana deslizante de 2.048 tokens y codificacion posicional RoPE con θ = 500.000, mientras que la atencion es de tipo "gated" y utiliza GQA con 32 cabezas de consulta y 2 de clave/valor (ratio 16:1), con dimension de cabeza de 128. La FFN es de tipo SwiGLU con dimension intermedia de 19.968, sobre una dimension oculta de 6.656. El vocabulario es de 202.048 entradas (200.000 tokens BPE mas 2.048 especiales).

A este bloque de lenguaje se le anade un codificador de percepcion independiente de aproximadamente 1,8B parametros (ViT-G/14 de 50 capas, anchura 1.536 y patch de 14), que acepta hasta 4.096 tokens visuales por imagen. El modelo fue destilado a partir de Muse Spark y esta entrenado sobre contenido multimodal procedente de datos publicos, de terceros y de productos y servicios de Meta, curado por redes de proveedores externos y personal de Meta. La model card indica entrenamiento multilingue sobre datos de mas de 100 idiomas, pero no especifica el numero total de tokens, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

Como innovacion destacable, el modelo se distribuye con un "drafter" de decodificacion especulativa basado en DFlash, un modelo de difusion por bloques que predice bloques completos de 16 tokens en una sola pasada; el modelo principal verifica esas propuestas en paralelo. El drafter tiene 5 capas, atencion de ventana deslizante de 2.048 en todas las capas, 32 cabezas de consulta y 8 de clave/valor, y toma caracteristicas ocultas de 5 capas uniformes del modelo objetivo (capas 1, 13, 25, 37 y 49 de 52).

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo extendidos.
- Uso de herramientas (tool calling / function calling) con esquemas precisos a lo largo de flujos prolongados.
- Finalizacion end-to-end de tareas agenticas, con evaluacion declarada en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Entrada multimodal: acepta texto e imagenes intercaladas a traves del codificador de percepcion, lo que permite interpretar capturas de pantalla, graficos y documentos.
- Compatibilidad con scaffolds de orquestacion agentica como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable: permite seleccionar distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Capacidad multilingue declarada sobre mas de 100 idiomas.
- Decodificacion especulativa integrada mediante el drafter DFlash, con salida identica en calidad a la generacion estandar.

## Casos de uso

- Agentes autonomos locales: el modelo puede ejecutar tareas completas de principio a fin (planificar, llamar herramientas y depurar codigo) en una maquina de 24-32 GB de VRAM, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Automatizacion de atencion al cliente: gestiona conversaciones multi-turno con contexto de 131.072 tokens o mas, lo que permite arrastrar historiales largos e intercalar capturas o documentos del usuario.
- Generacion y depuracion de codigo en produccion: su evaluacion declarada en SWE-Bench y la compatibilidad con esquemas de funciones lo hacen apto para integrarse en pipelines de CI/CD y flujos de resolucion de incidencias.
- Analisis de documentos y capturas: gracias al codificador de percepcion y a los 4.096 tokens visuales por imagen, puede interpretar graficos, tablas e interfaces para extraer datos o responder preguntas.
- Orquestacion de herramientas de empresa: con tool calling fiable y recuperacion ante errores, encaja en arquitecturas MCP donde varias herramientas deben encadenarse con esquemas estrictos.
- Asistente de escritorio sin conexion: al ejecutarse localmente y de forma fluida (hasta 233,4 tok/s en una RTX 5090 con decodificacion especulativa), permite asistentes interactivos embebidos en el dispositivo.
- Investigacion en agentes: su soporte para varios scaffolds (OpenClaw, Hermes Agent) y su esfuerzo de razonamiento configurable lo convierten en una base para experimentar con estrategias de planificacion y recuperacion ante fallos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card menciona que el modelo se evalua en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no aporta puntuaciones concretas.

Los unicos datos cuantitativos disponibles son la degradacion declarada por cuantizacion y las tasas de generacion medidas:

| Configuracion | Precision completa | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradacion | - | 0,2 % | 1,0 % |
| Hardware objetivo | 64 GB VRAM | 32 GB VRAM | 24 GB VRAM |

Degradacion medida como media de metricas de precision sobre 15 benchmarks comunes.

| GPU | Sin especulacion (tok/s) | Con DFlash (tok/s) | Aceleracion |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

Mediciones realizadas con tamano de lote 1 y decodificacion greedy, sobre el modelo K-Quant-17GB junto con el drafter DFlash cuantizado.

## Requisitos de hardware

- Precision completa: 64 GB de VRAM objetivo; el repositorio de safetensors ocupa 59,6 GB.
- Cuantizacion K-Quant-Dynamic (4 bits): 32 GB de VRAM, con 0,2 % de degradacion declarada.
- Cuantizacion K-Quant-17GB (4 bits, menos de 20 GB): 24 GB de VRAM, con 1,0 % de degradacion declarada. Deja margen para la cache KV, el codificador de percepcion y el drafter de decodificacion especulativa.
- GPU de consumo compatibles: el modelo esta pensado para GPUs de 24-32 GB, como la RTX 4090 (24 GB) y la RTX 5090 (32 GB). Tambien se ha medido en Apple Silicon M4 Max y M5 Max.
- Despliegue: la model card no detalla el conjunto exacto de frameworks, pero las cuantizaciones K-Quant y la mencion a ejecucion local apuntan a llama.cpp y derivados como Ollama; el repositorio de HuggingFace usa la libreria transformers y etiqueta `endpoints_compatible`, lo que sugiere soporte en entornos tipo TGI/vLLM mediante safetensors.
- Latencia y throughput: hasta 233,4 tok/s con decodificacion especulativa en RTX 5090 (3,1x sobre 74,9 tok/s sin especulacion) y 50,2 tok/s en M5 Max, con lote 1 y decodificacion greedy.

## Comparativa con modelos similares

La informacion proporcionada no incluye las especificaciones ni los resultados de otros modelos comparables, por lo que no es posible establecer una comparativa con datos verificables. La categoria de referencia serian los modelos multimodales abiertos de aproximadamente 30.000 millones de parametros orientados a tareas agenticas. A continuacion se recoge el modelo de esta ficha y se marcan como no disponibles los datos de alternativas que no aparecen en la informacion consultada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B (fork de yetog) | 29,78B | 131.072+ | sin datos numericos de benchmarks; 233,4 tok/s en RTX 5090 con DFlash | apache-2.0 | repo en HuggingFace, 0 descargas |
| Alternativas de ~30B multimodales/agenticas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La ficha corresponde a un fork no oficial subido por el usuario yetog, con 0 descargas y 0 valoraciones; no hay validacion de la comunidad sobre su integridad o equivalencia con el modelo original.
- Riesgo de alucinacion: la model card no cuantifica la tasa de alucinacion del modelo, y su uso en produccion deberia acompanarse de verificacion externa.
- Sesgos: la informacion disponible no detalla sesgos conocidos ni resultados de evaluaciones de sesgo o toxicidad.
- Idiomas: aunque la model card afirma entrenamiento sobre mas de 100 idiomas, el campo `languages` de HuggingFace esta vacio y no se especifica el nivel de calidad por idioma.
- Contexto largo con atencion local: pese a los 131.072+ tokens de contexto, tres de cada cuatro capas usan ventana deslizante de 2.048, lo que puede limitar la recuperacion precisa de informacion muy distante en el historial.
- Cuantizacion: el uso en 24 GB conlleva un 1,0 % de degradacion media en 15 benchmarks, que puede ser mayor en tareas concretas.
- Datos temporales inconsistentes: la model card declara una fecha de publicacion de agosto de 2026 y una fecha de creacion en HuggingFace del 29 de septiembre de 2026, posteriores a la fecha del corte de conocimiento (4 de enero de 2026); conviene verificar la autenticidad y procedencia del artefacto.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un fork conviene confirmar los terminos y la trazabilidad del repositorio original antes de desplegarlo.
- Repositorio de 59,6 GB en safetensors a precision completa: requiere espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yetog/Muse-Glimmer-30B-fork
- Paper del codificador de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash (drafter de decodificacion especulativa): https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentacion de OpenClaw (scaffold compatible, mencionado en la model card): no disponible
- Documentacion de Hermes Agent (scaffold compatible, mencionado en la model card): no disponible
- Repositorio oficial de Muse Glimmer: no disponible en la informacion proporcionada
