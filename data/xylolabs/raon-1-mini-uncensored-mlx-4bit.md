# Xylolabs/Raon-1-mini-Uncensored-MLX-4bit

## Resumen

Raon-1-mini-Uncensored-MLX-4bit es una version cuantizada a 4 bits en formato MLX del modelo KRAFTON/Raon-1-mini, publicada por Xylolabs. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 28.779 millones de parametros totales, adaptado para ejecutarse en hardware Apple Silicon mediante la libreria MLX. La modificacion principal respecto al original consiste en la eliminacion de una "direccion de rechazo" (refusal direction) de los pesos, lo que da lugar a una variante "abliterated" o "uncensored" que practicamente no rechaza peticiones.

El modelo base, Raon-1-mini, es un modelo de KRAFTON orientado a generacion de texto y conversacion, con soporte para coreano e ingles y capacidad de razonamiento en modo "thinking". Esta version mantiene intacto el codigo del modelo original (`raon_mlx_model.py`) e incorpora unicamente la edicion de pesos y la cuantizacion.

Su relevancia radica en dos factores: por un lado, permite ejecutar un modelo MoE de casi 29.000 millones de parametros en equipos Apple con memoria unificada moderada (a partir de 36 GB) gracias a la cuantizacion a 4 bits; por otro, ofrece una variante sin mecanismos de rechazo, lo que resulta de interes para investigacion sobre alineamiento, seguridad y comportamiento de modelos, aunque con implicaciones eticas y legales que deben considerarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capas de atencion y capas RDA; codigo `raon_mlx_model.py` de KRAFTON |
| Parametros totales | 28.779.029.222 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (segun tabla de hardware del autor) |
| Tipos de cuantizacion | 4-bit (esta version); existe variante 8-bit (30,6 GB) del mismo autor |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, cuantizacion afina con group size 64) |

## Arquitectura y entrenamiento

El modelo base Raon-1-mini emplea una arquitectura Mixture of Experts con capas de atencion y capas denominadas RDA, ademas de expertos enrutados (routed experts) y expertos compartidos (shared experts), un router MoE y una capa densa. Esta version cuantizada aplica cuantizacion afina con group size 64: los expertos enrutados se almacenan en 4 bits con proyecciones down en 6 bits; las capas de atencion y RDA, los expertos compartidos, la capa densa, el embedding y la cabeza LM en 8 bits; y las compuertas del router MoE permanecen en BF16. El modelo base fue publicado originalmente en pesos MXFP8.

La modificacion "uncensored" consiste en eliminar una direccion por capa, medida en cada capa con los canales 1031 y 189 puestos a cero, de las proyecciones de salida de atencion de las capas 6 a 20, de las proyecciones down de expertos enrutados y compartidos de las capas 6 a 20, y de los vectores de control de esfuerzo (effort-steering) de las capas 12, 14, 16, 18 y 20, afectando a 1.955 tensores. La cabeza de salida y el embedding no se modifican. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el proceso de alineamiento (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno en coreano e ingles.
- Razonamiento en modo "thinking" activado por defecto; puede desactivarse con `enable_thinking: false` en la configuracion de la plantilla de chat.
- Soporte de contexto largo de hasta 256K tokens.
- Ejecucion local en hardware Apple Silicon mediante MLX.
- Variante sin mecanismos de rechazo (abliterated), orientada a investigacion sobre alineamiento y seguridad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM sin direccion de rechazo, comparando sus respuestas con las del modelo original (que rechaza el 99,0% de los prompts de HarmBench) para analizar que informacion y capacidades quedan expuestas al eliminar dicha direccion.
- Evaluacion de tecnicas de abliteration: sirve como referencia practica para medir el impacto de la eliminacion de direcciones de rechazo sobre la calidad del modelo, con metricas de divergencia KL y acuerdo top-1 frente al modelo BF16.
- Despliegue local en estaciones de trabajo Apple: con 19,9 GB de pesos en 4 bits, puede ejecutarse en un Mac Studio con 36 GB de memoria unificada, lo que facilita prototipado y pruebas sin infraestructura de GPU dedicada.
- Procesamiento de documentos largos en coreano e ingles: la ventana de 256K tokens permite resumir o analizar contratos, informes o transcripciones extensas en un solo paso.
- Generacion de contenido creativo sin restricciones: util para estudiar sesgos, estilos y comportamientos del modelo en escenarios donde los filtros de rechazo limitarian la exploracion.
- Desarrollo de asistentes conversacionales en entornos controlados: el modo thinking configurable permite alternar entre respuestas directas y razonamiento extendido segun la tarea.
- Benchmarking de cuantizacion: la tabla de precision del autor (KL y top-1 frente a BF16) permite comparar el coste de la cuantizacion 4-bit frente a 8-bit en terminos de fidelidad.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad frente a Raon-1-mini BF16 (pesos MXFP8 dequantizados a BF16), con thinking desactivado:

| Modelo | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Verificacion 33 items | HarmBench rechazados | Alpaca rechazados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Uncensored MLX 4-bit | 19,90 GB | 0,058109 | 90,24% | 0,022455 | 92,94% | 0,022447 | 92,08% | 32/33 (BF16: 32/33) | 0,0% | 0,0% |
| Original MLX 4-bit | 19,90 GB | 0,054306 | 90,46% | 0,016844 | 93,55% | 0,019319 | 92,82% | 32/33 (BF16: 32/33) | 99,0% | 1,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 19,9 GB para la version 4-bit; 30,6 GB para la version 8-bit.
- Hardware soportado: exclusivamente Apple Silicon con MLX (el autor documenta Mac Studio M5 Max y M5 Ultra).
- Memoria unificada recomendada: 36 GB para 4-bit; 48 GB o mas para 8-bit.
- Cabe en GPU consumer: no disponible para GPU NVIDIA/AMD; el formato MLX esta disenado para Apple Silicon.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.chat` con `mlx==0.32.4`, `mlx-lm==0.32.2` y `transformers==5.20.1`, con `--trust-remote-code`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---:|---|---|---|
| Raon-1-mini-Uncensored-MLX-4bit | 28,78B | 256K | Apache 2.0 | MLX safetensors 4-bit | Sin rechazo (0,0% HarmBench) |
| Xylolabs/Raon-1-mini-MLX-4bit | 28,78B | 256K | Apache 2.0 | MLX safetensors 4-bit | Version original con rechazo (99,0% HarmBench) |
| Xylolabs/Raon-1-mini-Uncensored-MLX-8bit | 28,78B | 256K | Apache 2.0 | MLX safetensors 8-bit | Misma edicion, mayor precision (30,6 GB) |
| KRAFTON/Raon-1-mini | 28,78B | no disponible | no disponible | MXFP8 / BF16 | Modelo base sin modificar |

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo reduce el rechazo a 0,0% en HarmBench, lo que implica que el modelo puede generar contenido danino, ilegal o sensible sin filtros; no es adecuado para despliegues de cara al publico sin moderacion externa.
- El autor documenta una degradacion leve de fidelidad respecto al original (KL en WikiText-2 de 0,058 frente a 0,054; top-1 de 90,24% frente a 90,46%), lo que sugiere una perdida pequena pero medible de calidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de veracidad.
- Idiomas limitados a coreano e ingles; el rendimiento en castellano no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero el uso de una variante sin rechazo puede contravenir normativas locales o terminos de servicio de plataformas; la responsabilidad recae en el desplegador.
- El formato MLX restringe el despliegue a hardware Apple; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- Requiere `--trust-remote-code` por el codigo personalizado del modelo, lo que implica ejecutar codigo de terceros.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad mas alla de HarmBench y Alpaca.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Raon-1-mini-Uncensored-MLX-4bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Version MLX del modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Version original MLX 4-bit: https://huggingface.co/Xylolabs/Raon-1-mini-MLX-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
