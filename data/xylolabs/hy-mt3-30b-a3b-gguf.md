# Xylolabs/Hy-MT3-30B-A3B-GGUF

## Resumen

Hy-MT3-30B-A3B-GGUF es la version cuantizada en formato GGUF del modelo de traduccion automatica tencent/Hy-MT3-30B-A3B, publicada por Xylolabs. El modelo original, desarrollado por Tencent, es un transformer de arquitectura MoE (Mixture of Experts) con 30.064.725.888 parametros totales, disenado especificamente para tareas de traduccion multilingue. Esta version GGUF permite ejecutar el modelo en llama.cpp sobre CUDA, Metal o CPU, lo que facilita su despliegue en entornos sin infraestructura de GPU dedicada de gran escala.

La relevancia de esta ficha radica en que ofrece un pipeline de traduccion de alta cobertura linguistica (mas de 90 idiomas) en un formato accesible para inferencia local. El modelo base esta especializado en traduccion, no en generacion generalista, y su naturaleza MoE sugiere que solo una fraccion de los parametros se activa por token, aunque el dato exacto de parametros activos no esta disponible en la informacion proporcionada.

La licencia Apache 2.0 del modelo base y de esta cuantizacion permite uso comercial sin restricciones adicionales, lo que lo convierte en una opcion atractiva para integrar traduccion automatica en productos y servicios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 30.064.725.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ejemplo de uso con `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | mas de 90 idiomas (zh, en, es, fr, de, ja, ko, ar, hi, ru, pt, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy-MT3-30B-A3B emplea una arquitectura transformer con capas de mezcla de expertos (MoE), con 30.064.725.888 parametros totales. La informacion proporcionada no detalla el numero de parametros activos por token, la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o atencion lineal.

La cuantizacion GGUF ha sido realizada por Xylolabs e incluye una matriz de importancia (imatrix), segun los tags del repositorio. El proceso de cuantizacion se valido con la version de llama.cpp en el commit `5a09582d80600fb5b0a8966e870061bddc8a3732`, y el token EOS es el 120025 (end-of-turn). Se ofrecen ocho niveles de cuantizacion, desde Q8_0 (31,99 GB) hasta Q2_K (12,10 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

## Capacidades

- Traduccion automatica multilingue en mas de 90 idiomas, incluyendo pares como chino-ingles, espanol-aleman, arabe-frances, japones-coreano, hindi-tamil y muchas otras combinaciones.
- Generacion de texto orientada a traduccion con instrucciones en lenguaje natural (por ejemplo, "Translate the following text into Korean").
- Soporte de conversacion multi-turno (tag `conversational`), lo que permite refinar traducciones mediante interaccion.
- Compatibilidad con llama.cpp y endpoints compatibles (`endpoints_compatible`), lo que facilita su integracion en APIs.
- Capacidad de ejecucion en CPU, CUDA y Metal gracias al formato GGUF.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales y guias entre los mas de 90 idiomas soportados, manteniendo coherencia terminologica gracias a su especializacion en traduccion y a la posibilidad de usar instrucciones detalladas en el prompt.
- Localizacion de interfaces de usuario: integrado en pipelines de CI/CD, el modelo puede traducir cadenas de texto de aplicaciones a multiples idiomas de forma automatizada, usando la cuantizacion Q4_K_M para un equilibrio entre calidad y velocidad.
- Atencion al cliente multilingue: desplegado con llama-server, el modelo puede gestionar conversaciones multi-turno en distintos idiomas, traduciendo mensajes de clientes y respuestas de agentes en tiempo real.
- Traduccion de contenido editorial: para articulos, blogs y comunicados, la cuantizacion Q6_K o Q8_0 ofrece una calidad cercana a BF16 (chrF++ de 44,00 y 43,80 respectivamente) adecuada para publicacion.
- Subtitulado y transcripcion: el modelo puede traducir transcripciones o subtitulos entre idiomas, con la ventaja de ejecutarse localmente en CPU o GPU consumer, lo que reduce costes de API y protege la privacidad del contenido.
- Investigacion en traduccion automatica: al ser un modelo abierto con licencia Apache 2.0 y multiples cuantizaciones, sirve como base para experimentos de evaluacion, comparacion de tecnicas de cuantizacion o ajuste fino en dominios especificos.
- Procesamiento de documentos legales o medicos: la ejecucion local con llama.cpp permite traducir documentos sensibles sin enviarlos a servicios en la nube, cumpliendo requisitos de confidencialidad.

## Benchmarks y rendimiento

La model card proporciona datos de calidad de cuantizacion: divergencia KL frente a BF16 en WikiText-2, chat y texto reservado (held-out), asi como chrF++ en 200 segmentos de WMT24++ por direccion.

| Cuantizacion | Tamano | KL WikiText-2 | KL chat | KL held-out | chrF++ |
|---|---:|---:|---:|---:|---:|
| BF16 | 60,16 GB | - | - | - | 43,80 |
| Q8_0 (tencent) | 32,79 GB | 0,039163 | 0,023920 | 0,065410 | 43,76 |
| Q8_0 | 31,99 GB | 0,036847 | 0,026604 | 0,077424 | 43,80 |
| Q6_K | 25,11 GB | 0,043942 | 0,032400 | 0,068222 | 44,00 |
| Q5_K_M | 21,96 GB | 0,048884 | 0,035770 | 0,099190 | 43,71 |
| Q4_K_M (tencent) | 19,50 GB | 0,070656 | 0,040782 | 0,105303 | 43,75 |
| Q4_K_M | 18,99 GB | 0,071132 | 0,046551 | 0,102384 | 43,82 |
| Q4_K_S | 17,92 GB | 0,077875 | 0,049720 | 0,103388 | 43,88 |
| IQ4_XS | 16,91 GB | 0,081084 | 0,048743 | 0,122981 | 43,80 |
| Q3_K_M | 15,33 GB | 0,130692 | 0,076324 | 0,168438 | 43,83 |
| IQ2 (tencent) | 13,08 GB | 0,248250 | 0,140666 | 0,278155 | 43,54 |
| Q2_K | 12,10 GB | 0,302520 | 0,177591 | 0,344441 | 43,33 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 12,10 GB (Q2_K) y 31,99 GB (Q8_0) solo para los pesos; se debe anadir memoria para el contexto y el estado de inferencia.
- GPU recomendadas: para Q8_0, una GPU con 40 GB o mas (A100 40GB, A6000); para Q4_K_M, una GPU con 24 GB (RTX 4090, A10G) puede ser suficiente; para Q2_K, una GPU con 16 GB (RTX 4080, RTX 4060 Ti 16GB).
- Cabe en GPU consumer: si, en modelos como RTX 4090 (24 GB) con cuantizaciones Q4_K_M o inferiores, y en RTX 4060 Ti 16GB con Q2_K o Q3_K_M.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-completion`), con soporte para CUDA, Metal y CPU. Tambien es compatible con endpoints compatibles segun los tags.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Hy-MT3-30B-A3B-GGUF | 30.064.725.888 | no disponible | Apache 2.0 | GGUF | Especializado en traduccion, MoE |
| tencent/Hy-MT3-30B-A3B (BF16) | 30.064.725.888 | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar, 60,16 GB |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

No se dispone de informacion sobre otros modelos de traduccion comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo base ni de esta cuantizacion.
- Riesgo de alucinacion: no documentado en la informacion proporcionada; como modelo de traduccion, puede generar traducciones inexactas o inventar contenido en textos ambiguos o muy especializados.
- Limitaciones de contexto: la longitud de contexto no esta especificada; el ejemplo de uso emplea `-c 8192`, pero no se confirma que sea el maximo.
- Limitaciones de idioma: aunque se listan mas de 90 idiomas, no se especifica la calidad relativa por par de idiomas; los pares con menos recursos pueden tener un rendimiento inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el archivo NOTICE.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K_M muestran una divergencia KL significativamente mayor (0,30 y 0,13 en WikiText-2) que Q4_K_M o superiores, por lo que se recomienda validar la calidad en el dominio concreto antes de desplegar cuantizaciones agresivas. La ejecucion en CPU puede tener latencia elevada para textos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy-MT3-30B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Repositorio de herramientas de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- llama.cpp (commit de referencia): https://github.com/ggerganov/llama.cpp/commit/5a09582d80600fb5b0a8966e870061bddc8a3732
