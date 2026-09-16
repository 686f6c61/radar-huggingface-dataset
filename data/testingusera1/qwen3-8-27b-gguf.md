# testingusera1/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Qwen3.8-27B, publicado por el usuario testingusera1. El modelo subyacente, Qwen/Qwen3.8-27B, es un modelo denso de 27.320.697.856 parametros desarrollado por el equipo Qwen como continuacion de las series Qwen3.5 y Qwen3.6. Se trata de un modelo de lenguaje causal con codificador de vision, lo que lo convierte en un modelo nativo de vision-lenguaje capaz de procesar imagenes y videos, con control flexible del modo de razonamiento.

El repositorio en cuestion no contiene los pesos originales, sino conversiones a GGUF producidas con el formato Unsloth Dynamic 3.0, un esquema de cuantizacion dinamica por capas que, segun la documentacion citada en la model card, mejora la precision respecto a otros proveedores de cuantizaciones al mismo tamano. El repositorio ocupa 472,1 GB en total, lo que refleja que alberga multiples variantes de cuantizacion del mismo modelo (desde versiones de baja precision hasta F16), no un unico fichero.

Su relevancia actual radica en que permite ejecutar un modelo de 27B con ventana de contexto nativa de 262.144 tokens (extensible hasta 1.000.000) en hardware de consumo o en servidores con una sola GPU, algo inviable con los pesos en precision completa. Qwen3.8-27B esta pensado para tareas de codigo, trabajo profesional, investigacion y flujos agenticos de largo horizonte, e incluye soporte de tool calling, rol de desarrollador para herramientas como Codex y prediccion multi-token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (Gated DeltaNet) y atencion completa (Gated Attention) intercaladas, mas codificador de vision |
| Parametros totales | 27.320.697.856 (aproximadamente 27B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | GGUF con esquema Unsloth Dynamic 3.0 (multiples variantes en el repositorio); el repositorio incluye imatrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio es exclusivamente de cuantizaciones GGUF) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Embedding de tokens | 248.320 (con padding) |
| Cabezas de atencion (Gated Attention) | 24 para Q, 4 para KV; dimension de cabeza 256; dimension RoPE 64 |
| Cabezas de atencion lineal (Gated DeltaNet) | 48 para V, 16 para QK; dimension de cabeza 128 |
| Dimension intermedia de la FFN | 17.408 |
| Prediccion multi-token (MTP) | Entrenado con multiples pasos |
| Tarea | Conversacional, con etiqueta `endpoints_compatible` y soporte de vision |

## Arquitectura y entrenamiento

El modelo base emplea un layout hibrido poco convencional: 16 bloques repetidos con la estructura `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Es decir, por cada capa de atencion completa (Gated Attention) hay tres capas de atencion lineal basadas en Gated DeltaNet. La Gated Attention utiliza 24 cabezas de consulta y solo 4 de clave-valor (GQA con ratio 6:1), con dimension de cabeza 256 y dimension de RoPE de 64. La Gated DeltaNet emplea 48 cabezas lineales para V y 16 para QK, con dimension de cabeza 128. La dimension oculta es 5.120, la FFN tiene 17.408 de dimension intermedia y el vocabulario de entrada y salida es de 248.320 tokens con padding. El modelo se entrena con prediccion multi-token (MTP) en varios pasos, tecnica que permite decodificacion especulativa y aceleracion de la generacion. Adicionalmente incorpora un codificador de vision que lo habilita para comprension de imagenes y videos.

El modelo base se ha sometido a preentrenamiento y postentrenamiento (la model card indica ambas fases), aunque no se especifica el numero de tokens de entrenamiento ni la composicion del dataset. Tampoco se detallan los metodos de alineacion empleados (RLHF, DPO u otros). El repositorio aqui descrito es una conversion a GGUF realizada con la herramienta de Unsloth, no un reentrenamiento: los pesos cuantizados conservan la semantica del modelo original y el autor del repositorio no ha publicado ningun ajuste fino adicional.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens de forma nativa, 1.000.000 de forma extensible).
- Razonamiento con modo "thinking" activado por defecto, desactivable por peticion, y profundidad de razonamiento ajustable mediante el parametro `reasoning_effort`.
- Retencion del contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.
- Vision-lenguaje nativa: comprension de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Generacion de codigo y tareas de trabajo profesional y de investigacion, con mejoras declaradas por el autor en estas areas respecto a generaciones anteriores.
- Tool calling y function calling, con mejoras especificas en el analisis de objetos anidados para aumentar la tasa de exito de las llamadas.
- Soporte de agentes y razonamiento multi-paso, con planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Soporte de rol de desarrollador, pensado para integrarse en herramientas agenticas como Codex.
- Prediccion multi-token (MTP) entrenada en varios pasos, orientada a acelerar la decodificacion.
- Configuracion de muestreo diferenciada por modo: thinking (`temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=0.0`) e instruct (`temperature=0.7`, `top_p=0.80`, `top_k=20`, `presence_penalty=1.5`).

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos o historiales completos sin truncar, gracias a sus 262.144 tokens de ventana nativa, lo que lo hace adecuado para soporte tecnico especializado donde el contexto acumulado es critico.
- Analisis de documentos con componentes visuales: al ser un modelo de vision-lenguaje nativo, puede procesar diagramas STEM, tablas escaneadas y documentos maquetados, extrayendo informacion estructurada sin necesidad de un pipeline OCR separado para cada tipo de documento.
- Revision de video de larga duracion: su soporte declarado de videos de escala horaria permite resumir reuniones, generar transcripciones anotadas o extraer hitos de grabaciones extensas en un unico paso de inferencia.
- Agentes de automatizacion de software: con soporte de tool calling, rol de desarrollador y razonamiento multi-paso, puede integrarse en flujos tipo Codex para editar repositorios, ejecutar comandos y validar resultados en bucles de varios pasos.
- Generacion de codigo en produccion: el modelo puede insertarse en pipelines de CI/CD como revisor automatico de cambios o generador de tests, usando el modo instruct con `presence_penalty=1.5` para evitar repeticiones en salidas largas.
- Despliegue en hardware de consumo: las cuantizaciones GGUF del repositorio permiten ejecutar el modelo en una unica GPU de gama alta o en un Mac con memoria unificada, habilitando prototipado local de asistentes con vision sin coste de API.
- Investigacion y redaccion tecnica asistida: el modo thinking con `reasoning_effort` ajustable permite calibrar el coste computacional segun la dificultad de la tarea, desde resumenes rapidos hasta derivaciones paso a paso.
- Extraccion estructurada de datos: el tool calling con parsing de objetos anidados facilita generar salidas JSON complejas para ingesta en bases de datos o sistemas de gestion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandarizada para Qwen3.8-27B. La unica afirmacion cuantitativa presente es de caracter promocional y comparativo entre proveedores de cuantizacion, no sobre capacidades del modelo: Unsloth afirma que su formato Dynamic v3.0 ofrece "mas de un 10 % de mejor precision top-1 % al mismo tamano" en comparacion con otros proveedores de GGUF. No se aportan cifras absolutas, metodologia ni conjunto de evaluacion, por lo que no puede tratarse como un resultado reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir de los 27.320.697.856 parametros; el repositorio incluye ademas imatrix, lo que implica ficheros de calibracion):
  - Cuantizacion de 4 bits (Q4_K_M o equivalente): aproximadamente 16-18 GB.
  - Cuantizacion de 5 bits: aproximadamente 19-21 GB.
  - Cuantizacion de 6 bits: aproximadamente 22-24 GB.
  - Cuantizacion de 8 bits (Q8_0): aproximadamente 28-30 GB.
  - F16: aproximadamente 55 GB.
  - A estas cifras hay que sumar el coste de la cache KV, que con 262.144 tokens de contexto es muy elevado y depende del framework y del tipo de cuantizacion de la cache.
- GPU recomendadas: para 4 bits, una RTX 4090 (24 GB) o RTX 5090 resulta suficiente; para 8 bits, una A100 40 GB, L40S o RTX 6000 Ada; para F16, una A100 80 GB o H100. El codificador de vision anade un consumo adicional moderado.
- Cabe en GPU de consumo: si, en 4 y 5 bits cabe en GPUs con 24 GB de VRAM, y las variantes de menor precision permiten su uso en equipos con 16 GB de VRAM. En sistemas Apple Silicon con memoria unificada de 32 GB o mas tambien es viable mediante llama.cpp.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp) para el formato GGUF; Unsloth Desktop para ejecucion y ajuste fino con conmutador de thinking; el modelo base en safetensors admite vLLM y TGI, aunque el repositorio GGUF aqui descrito esta orientado a los runners compatibles con GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B densos | 262.144 nativo, hasta 1.000.000 | Safetensors | Apache 2.0 | Repositorio oficial `Qwen/Qwen3.8-27B` |
| Este repositorio (GGUF) | 27,3B densos | El mismo, segun lo que soporte el runner | GGUF (Unsloth Dynamic 3.0) | Apache 2.0 | `testingusera1/Qwen3.8-27B-GGUF`, 0 descargas |
| Qwen3.5 / Qwen3.6 (generaciones previas) | No disponible | No disponible | No disponible | No disponible | Mencionados en la model card como predecesores, sin especificaciones |
| Otros proveedores de GGUF de Qwen3.8 | 27,3B densos | No disponible | GGUF | No disponible | Mencionados de forma generica en la model card, sin nombrar ni enlazar |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato, licencia y disponibilidad. El repositorio analizado se distingue unicamente por el esquema de cuantizacion empleado y por su estado de publicacion reciente, sin descargas ni valoraciones.

## Limitaciones y advertencias

- El repositorio lo publica el usuario `testingusera1`, no la organizacion oficial Qwen ni Unsloth. La model card reutiliza literalmente material de Unsloth (logotipos, enlaces a documentacion y texto promocional), por lo que conviene verificar la integridad de los ficheros antes de usarlos en produccion.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, y se creo y actualizo en la misma marca temporal, sin historial de mantenimiento ni de correccion de errores.
- Las etiquetas incluyen `qwen3_5`, mientras que el modelo base declarado es `Qwen/Qwen3.8-27B`. Esta discrepancia sugiere que las etiquetas pueden no reflejar con exactitud la generacion del modelo; conviene comprobar el identificador del modelo base antes de la integracion.
- La model card esta truncada en la seccion de practicas recomendadas, de modo que las indicaciones completas sobre longitud de salida y parametros de decodificacion no estan disponibles integramente.
- No se declara la lista de idiomas soportados. Aunque la model card menciona riesgo de mezcla de idiomas al elevar `presence_penalty`, no hay informacion sobre cobertura multilingue verificada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; es especialmente relevante en tareas agenticas de largo horizonte, donde un error de planificacion temprano se propaga a lo largo de la cadena de acciones. No se han publicado tasas de alucinacion.
- El autor advierte que valores altos de `presence_penalty` pueden provocar mezcla de idiomas y una ligera degradacion del rendimiento, por lo que existe un compromiso entre evitar repeticiones y mantener la calidad.
- Consumo de memoria de la cache KV: con 262.144 tokens de contexto nativo, el uso de memoria crece de forma muy acusada. Ejecutar el contexto completo en hardware de consumo no es realista sin tecnicas adicionales de compresion o cuantizacion de la cache.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserven los avisos de copyright y licencia. No obstante, debe confirmarse la licencia del modelo base `Qwen/Qwen3.8-27B` por si difiere de la declarada en este repositorio derivado, asi como las condiciones de los terminos de uso de la familia Qwen.
- El soporte de vision y de video depende del runner GGUF empleado; no todas las implementaciones de llama.cpp soportan el codificador de vision de este modelo, por lo que podria degradarse a uso exclusivamente textual.
- No hay informacion sobre sesgos, evaluaciones de seguridad ni filtros de contenido aplicados durante el postentrenamiento.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/testingusera1/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de Unsloth para ejecutar Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Documentacion de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Unsloth Desktop (ejecucion y ajuste fino con conmutador de thinking): https://unsloth.ai/docs/new/desktop
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Sitio principal de Unsloth: https://unsloth.ai
