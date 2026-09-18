# tokenbrew/Bonsai-27B-Brew-GGUF

## Resumen

Bonsai-27B-Brew-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario tokenbrew a partir de **prism-ml/Bonsai-27B**, un modelo denso de 27B parámetros (26.895.998.464 parámetros reales) construido a su vez sobre **Qwen/Qwen3.6-27B** de Alibaba Cloud. El repositorio contiene tres K-quants estándar generados con `llama-quantize` a partir de la referencia F16 del autor original, sin reentrenamiento ni modificación de los pesos más allá de la cuantización.

La diferencia clave frente al repositorio de Prism ML es el formato: mientras que prism-ml/Bonsai-27B-gguf se centra en formatos de muy bajo bit (1-bit y ternario) que requieren un fork de llama.cpp con kernels fusionados, estas tres variantes (`Q4_K_M`, `Q6_K`, `Q8_0`) cargan en cualquier build de llama.cpp mainline que ya soporte la arquitectura `qwen35`. Esto las hace utilizables en Ollama, LM Studio y el resto del ecosistema GGUF estándar.

Bonsai es un modelo de razonamiento: cada respuesta se abre con un bloque `<think>`, y en las pruebas del autor los trazos de pensamiento fueron lo bastante largos como para agotar un presupuesto de 700 tokens en los tres cuants, obligando a usar 2600 tokens para completar los prompts. El repositorio, publicado el 18 de septiembre de 2026, no tenía descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura `qwen35` en llama.cpp (derivada de Qwen/Qwen3.6-27B) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4,5 bits/peso), Q6_K (6,6 bits/peso), Q8_0 (8,5 bits/peso) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | prism-ml/Bonsai-27B-gguf (`Bonsai-27B-F16.gguf`) |
| Relacion con el modelo base | Cuantizacion (base_model_relation: quantized) |
| Tamano de cada cuantizacion | Q4_K_M: 16,5 GB / Q6_K: 22,1 GB / Q8_0: 28,6 GB |
| Tamano total del repositorio | 67,2 GB |
| Libreria | gguf |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de su naturaleza densa y de que llama.cpp la reconoce bajo el identificador `qwen35`. Tampoco se detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo fases de RLHF o DPO: todos estos datos figuran como **no disponibles**. Lo que si se documenta con precision es el proceso que ha dado lugar a este repositorio concreto: cuantizacion de `Bonsai-27B-F16.gguf` con `llama-quantize` de llama.cpp mainline, sin reentrenamiento ni modificacion de pesos.

La innovacion practica de estas tres variantes no esta en el modelo sino en el empaquetado. El repositorio original de Prism ML explora formatos extremos de 1 bit y ternarios que exigen kernels fusionados en un fork propio de llama.cpp; estas versiones evitan esa dependencia y funcionan con decodificacion estandar en builds mainline. El coste es un mayor peso en disco y en memoria (de 16,5 a 28,6 GB por fichero) a cambio de compatibilidad total con el ecosistema GGUF. El autor tambien documenta que se trata de un modelo de razonamiento con trazas `<think>` largas, y recomienda parametros de muestreo concretos: `--temp 0.6 --top-p 0.95 --top-k 20`.

## Capacidades

- Generacion de texto conversacional en ingles: el pipeline declarado es `text-generation` y el modelo lleva la etiqueta `conversational`, con modo de chat activable en llama.cpp mediante `-cnv`.
- Razonamiento explicito en modo thinking: toda respuesta comienza con un bloque `<think>`, lo que permite inspeccionar la traza de razonamiento antes de la respuesta final.
- Generacion de codigo: el autor incluyo un prompt de programacion no trivial en su comprobacion puntual; la variante Q6_K fue la unica de las tres que lo completo limpiamente a la primera.
- Conversaciones multi-turno: el formato de chat esta soportado por el runtime (`-cnv`, `-st` para modo single-turn en las instrucciones de uso).
- Capacidades multilingues: limitadas a ingles segun el campo `language` de la model card.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente; el modo thinking es el unico mecanismo de razonamiento declarado.
- Vision y audio: no soportados; el modelo es exclusivamente de texto.

## Casos de uso

- **Inferencia local de un modelo de razonamiento de 27B en hardware de gama alta de consumo**: con la variante Q4_K_M (16,5 GB) el modelo completo cabe con offload total en GPU de 24 GB, lo que permite ejecutar razonamiento multi-paso sin depender de APIs externas.
- **Asistente de analisis en ingles en entornos air-gapped**: al ser pesos GGUF que corren en llama.cpp sin telemetria ni conexion, encaja en organizaciones que no pueden enviar datos a servicios en la nube.
- **Generacion de codigo asistida en el puesto de trabajo**: integrable en editores mediante el servidor de llama.cpp o LM Studio, con la salvedad de que hay que reservar un presupuesto de tokens amplio porque las trazas de pensamiento consumen buena parte de la ventana de generacion.
- **Prototipado y evaluacion de cuantizaciones K-quant**: el repositorio incluye tres niveles de bit por peso (4,5 / 6,6 / 8,5) del mismo modelo, lo que permite medir la degradacion de calidad frente al coste de memoria en un mismo equipo.
- **Despliegue en estaciones de trabajo con memoria unificada**: el autor valido las tres variantes en una NVIDIA GB10 con 121 GB de memoria unificada y offload completo, un perfil habitual en equipos de desarrollo con GPU integrada.
- **Investigacion sobre comportamiento de modelos con modo thinking**: la obligacion de asignar presupuestos de generacion largos (2600 tokens en las pruebas del autor) lo convierte en un caso de estudio para estudiar la gestion de presupuesto entre razonamiento y respuesta.
- **Formacion y divulgacion tecnica**: sirve para explicar de forma practica la diferencia entre cuantizaciones K-quant estandar y formatos de muy bajo bit que requieren kernels personalizados.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de rendimiento de inferencia con `llama-bench -ngl 999 -p 512 -n 128` sobre una unica NVIDIA GB10 (Blackwell, 121 GB de memoria unificada), con offload completo de GPU y build mainline `b10349` de llama.cpp:

| Cuantizacion | Alias | Tamano | Bits/peso | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---:|---:|---:|---:|
| Q4_K_M | Espresso | 16,5 GB | 4,5 | 813 | 12,3 |
| Q6_K | Pour-Over | 22,1 GB | 6,6 | 678 | 9,3 |
| Q8_0 | Cold Brew | 28,6 GB | 8,5 | 787 | 8,0 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica valoracion cualitativa es una comprobacion puntual del autor con dos prompts (uno de razonamiento y otro de codigo), en la que Q6_K fue la unica variante que resolvio el prompt dificil a la primera. El propio autor advierte que se trata de una muestra de dos prompts y no de una suite de evaluacion.

## Requisitos de hardware

- **VRAM estimada para inferencia**: como referencia minima, el tamano del fichero de pesos mas el espacio de cache KV y el overhead del runtime. Q4_K_M parte de 16,5 GB, Q6_K de 22,1 GB y Q8_0 de 28,6 GB. La cifra exacta de VRAM total con contexto completo figura como no disponible.
- **GPU de consumo**: Q4_K_M cabe con holgura en una RTX 4090 (24 GB) y en una RTX 5090 (32 GB); Q6_K entra ajustado en 24 GB y condiciona la longitud de contexto; Q8_0 requiere 32 GB o recurrir a offload parcial en CPU.
- **GPU profesionales y de centro de datos**: A100 (40/80 GB), H100 (80 GB) y similares admiten las tres variantes con offload completo. El autor uso una NVIDIA GB10 con 121 GB de memoria unificada.
- **Memoria unificada**: equipos con memoria unificada de 32 GB o mas (Apple Silicon de gama alta, GB10 y similares) pueden ejecutar las tres variantes sin GPU dedicada.
- **Opciones de despliegue**: llama.cpp mainline (build que soporte la arquitectura `qwen35`), Ollama, LM Studio y cualquier runtime GGUF estandar. El soporte en vLLM o TGI no esta confirmado en la informacion disponible.
- **Latencia y throughput**: medidos en GB10 con offload completo, entre 8,0 y 12,3 tok/s en generacion (tg128) y entre 678 y 813 tok/s en prefill (pp512). El autor senala que Q4_K_M genera aproximadamente un 53 % mas rapido que Q8_0 con un 42 % menos de disco. Estas cifras no son extrapolables directamente a otras GPU.
- **Presupuesto de generacion**: dado que el modelo dedica buena parte de la salida a trazas de pensamiento, conviene configurar `-n` en el rango de 2600 tokens o superior para prompts no triviales.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Contexto | Licencia | Runtime requerido |
|---|---|---|---|---|---|
| tokenbrew/Bonsai-27B-Brew-GGUF | ~26,9B | GGUF, Q4_K_M / Q6_K / Q8_0 | no disponible | Apache 2.0 | llama.cpp mainline (`qwen35`), Ollama, LM Studio |
| prism-ml/Bonsai-27B-gguf | ~26,9B (mismo modelo base) | GGUF, 1-bit y ternario | no disponible | Apache 2.0 | Fork de llama.cpp con kernels fusionados |
| Qwen/Qwen3.6-27B | ~26,9B (modelo original) | Pesos sin cuantizar (formato exacto no disponible) | no disponible | Apache 2.0 | Transformers, vLLM u otros runtimes de precision completa |

La comparativa relevante es de formato y compatibilidad, no de calidad: las tres entradas derivan del mismo modelo de base, por lo que no hay diferencias de parametros ni de licencia entre ellas. La variante de Prism ML prioriza el ahorro extremo de memoria a costa de depender de un fork; el repositorio de tokenbrew prioriza la compatibilidad con el ecosistema estandar a costa de mas memoria y disco. No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada, ni de otros modelos de la misma categoria documentados en los resultados de busqueda.

## Limitaciones y advertencias

- **Ausencia de benchmarks de calidad**: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones similares. La unica valoracion cualitativa es una comprobacion de dos prompts realizada por el propio cuantizador.
- **Trazas de razonamiento largas**: el modelo abre siempre un bloque `<think>` y consume buena parte del presupuesto de generacion en el. Con `-n` bajo, las respuestas pueden quedar truncadas; el autor necesito 2600 tokens para completar prompts no triviales.
- **Idioma**: solo ingles declarado. No hay evidencia de calidad en castellano ni en otros idiomas.
- **Contexto desconocido**: la longitud de contexto del modelo base no se documenta, por lo que no se puede garantizar su uso en escenarios de contexto largo.
- **Riesgo de alucinacion**: inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de veracidad o de tasa de alucinacion para este modelo.
- **Degradacion por cuantizacion**: Q4_K_M y Q6_K son formatos con perdida. El autor afirma no haber encontrado perdida de calidad en prompts sencillos, pero lo enmarca explicitamente como una comprobacion limitada.
- **Tool calling no documentado**: no hay soporte declarado de function calling, lo que limita su uso directo en pipelines de agentes que dependan de herramientas.
- **Dependencia de la version de llama.cpp**: requiere un build mainline que soporte la arquitectura `qwen35`; builds mas antiguos pueden no cargar los ficheros.
- **Procedencia y licencia**: los pesos derivan de Bonsai-27B (Copyright 2026 Prism ML, Inc.), que a su vez deriva de Qwen3.6-27B (Copyright 2026 Alibaba Cloud). Todo bajo Apache 2.0, lo que permite uso comercial, pero conviene conservar los avisos de atribucion de la cadena de modelos.
- **Madurez del repositorio**: cero descargas y cero valoraciones en el momento de redactar la ficha, publicado y actualizado el mismo dia. No hay validacion independiente de la comunidad ni de terceros.
- **Cuantizador tercero**: los ficheros no los publica el desarrollador original del modelo, sino un tercero, lo que anade un paso de verificacion de integridad recomendable mediante `sha256sum -c SHA256SUMS --ignore-missing`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tokenbrew/Bonsai-27B-Brew-GGUF
- Modelo base (GGUF de Prism ML): https://huggingface.co/prism-ml/Bonsai-27B-gguf
- Modelo base de Prism ML: https://huggingface.co/prism-ml/Bonsai-27B
- Modelo original de Alibaba Cloud: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Analisis del autor sobre la escalera de cuantizaciones: https://claude.ai/artifact/96VjAkHqKznqZqCLN8vw5L
- Busqueda web: no se encontraron enlaces relevantes. Los unicos resultados devueltos correspondian a paginas de un videojuego sin relacion con el modelo.
