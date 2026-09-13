# ukisai/Swift-Qwen3.8-27B-NVFP4

## Resumen

Swift-Qwen3.8-27B-NVFP4 es un checkpoint cuantizado en NVFP4 (W4A4) del modelo Swift-Qwen3.8-27B, desarrollado por UkisAI. Swift es una variante de Qwen3.8-27B orientada a razonamiento "eficiente en tokens", y esta publicacion convierte sus pesos y activaciones a coma flotante de 4 bits con escalas por grupo de 16 en el formato `compressed-tensors`, lista para servirse con vLLM sobre GPUs NVIDIA Blackwell. El resultado es un checkpoint de 28,6 GB en disco frente a los 55,6 GB del original en BF16, con unos 29 GB de pesos en memoria de GPU.

El interes practico del modelo esta en la combinacion de tres factores: cuantizacion FP4 real (no solo de pesos) validada sobre tensor cores Blackwell, arquitectura hibrida con 48 capas de atencion lineal Gated DeltaNet, y una cabeza MTP (multi-token prediction) incluida en BF16 que habilita decodificacion especulativa autoservida sin modelo borrador externo. La ventana de contexto usada en el ejemplo oficial de despliegue es de 262.144 tokens, lo que lo situa en el rango de modelos de contexto largo para tareas de documentos y agentes.

Se distribuye con acceso restringido ("gated") bajo la Swift Open License v1.0: uso personal, de investigacion, educativo, de evaluacion y comercial gratuito para individuos y organizaciones con ingresos recurrentes anuales de hasta 1.000.000 USD; por encima de ese umbral se requiere una licencia empresarial separada. El checkpoint se publico en septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 1 "like".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal Gated DeltaNet (48 capas) y capas de atencion completa; cabeza MTP para decodificacion especulativa; torre de vision para entrada de imagen |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | 262.144 tokens (valor empleado en el ejemplo oficial de vLLM con `--max-model-len 262144`; el autor no documenta el maximo nativo) |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo de 16) en este repo; el modelo base se distribuye tambien en BF16 y en GGUF |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Swift Open License v1.0 (`license: other`), con acceso restringido; uso comercial gratuito hasta 1.000.000 USD de ingresos recurrentes anuales |
| Formato de pesos | `safetensors` con `compressed-tensors`, esquema `nvfp4-pack-quantized` (W4A4, group size 16); biblioteca declarada: vLLM |
| Tamano en disco | 28,6 GB (original BF16: 55,6 GB) |
| Capas cuantizadas | Todas las `Linear` de atencion y MLP del modelo de lenguaje |
| Capas mantenidas en BF16 | `lm_head`, embeddings, torre de vision, las 48 capas Gated DeltaNet y la cabeza MTP |
| Calibracion | 256 muestras x 4096 tokens del dataset `perfectblend` |
| Herramienta de cuantizacion | `llm-compressor` con `QuantizationModifier(scheme="NVFP4")` |
| Modalidad | Image-text-to-text (entrada de imagen y texto) |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido: combina capas de atencion completa con 48 capas de atencion lineal Gated DeltaNet. Las proyecciones de estas capas de atencion lineal se dejan sin cuantizar en este checkpoint porque su disposicion fusionada es incompatible con NVFP4, lo que segun el autor coincide con el layout de los checkpoints NVFP4 propios de NVIDIA para Qwen3.5. El modelo incorpora ademas una cabeza MTP (multi-token prediction) que se conserva en BF16 y permite activar decodificacion autoespeculativa con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.

Sobre el entrenamiento, la model card no detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO para el modelo base Swift-Qwen3.8-27B. Lo unico documentado es que NVIDIA Innovation Lab proporciono 8 GPUs H100 para entrenar Swift, y que la calibracion de esta cuantizacion uso 256 muestras de 4096 tokens extraidas de `perfectblend`. La innovacion tecnica destacable de este checkpoint no es el entrenamiento, sino la cuantizacion: cuantizacion FP4 de pesos y activaciones, verificada ejecutando el kernel `FlashInferCutlassNvFp4LinearKernel` sobre tensor cores Blackwell en lugar de una ruta de dequantizacion solo de pesos.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con parser de razonamiento especifico (`--reasoning-parser qwen3`) que separa el bloque de pensamiento de la respuesta final.
- Razonamiento eficiente en tokens: la familia Swift esta etiquetada como `efficient-thinking` y `token-efficient`, con una media de 344-391 tokens de completado en las pruebas publicadas.
- Matematicas: 98,0 % de exact match en las primeras 200 preguntas del test de GSM8K en la version BF16 y 96,5 % en esta version NVFP4.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice` con el parser `qwen3_coder`.
- Capacidades de agente: la combinacion de tool calling, contexto largo (262.144 tokens en la configuracion de referencia) y razonamiento multi-paso lo hace apto para flujos de varios turnos con llamadas a herramientas.
- Vision (image-text-to-text): la torre de vision se mantiene en BF16, de modo que acepta entradas de imagen ademas de texto.
- Decodificacion especulativa con MTP: aceptacion de tokens borrador del 61 % en la medicion publicada, con 3 tokens especulativos.
- Capacidades multilingues: no disponible; la model card no enumera idiomas soportados.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto configurados y razonamiento multi-turno, el modelo puede mantener el historial completo de una conversacion larga o de un caso con muchos anexos sin truncar, y usar tool calling para consultar sistemas internos de tickets o pedidos.
- Generacion de codigo en produccion: el parser de tool calling `qwen3_coder` permite integrarlo en pipelines que necesitan invocar funciones, ejecutar comandos o consultar repositorios; la cuantizacion FP4 reduce el coste por token servido cuando se despliega sobre Blackwell.
- Analisis de documentos extensos: contratos, informes tecnicos o expedientes que superan las decenas de miles de tokens caben en la ventana de contexto, con la ventaja de que la atencion lineal Gated DeltaNet reduce el coste asociado a secuencias muy largas.
- Procesamiento de documentos escaneados y capturas: al ser un modelo image-text-to-text, puede extraer y razonar sobre informacion contenida en imagenes (formularios, facturas, diagramas) junto al texto de acompanamiento.
- Agentes de automatizacion multi-paso: para tareas que requieren planificar, llamar a varias herramientas y verificar resultados, el modo de razonamiento con parser dedicado y el tool calling permiten separar el proceso de pensamiento de las acciones ejecutadas.
- Servicio de inferencia de alto rendimiento en la nube: con 85 tokens/s por peticion y 8 peticiones concurrentes sobre una RTX PRO 6000 Blackwell, es adecuado para endpoints internos con trafico moderado donde el ahorro de VRAM (29 GB frente a 54 GB) permite liberar capacidad para KV cache.
- Evaluacion e investigacion: el autor ofrece una API compatible con OpenAI en `https://ukisai.com/api/swift/v1` (modelo `swift`), gratuita para investigacion y sin clave de API, util para comparativas y prototipado rapido.
- Razonamiento matematico asistido eneducacion o analisis financiero: el 96,5-98,0 % de acierto en GSM8K lo hace util para resolver y explicar problemas aritmeticos paso a paso con trazabilidad del razonamiento.

## Benchmarks y rendimiento

Medicion publicada por el autor en una unica NVIDIA RTX PRO 6000 Blackwell (96 GB, SM120) con vLLM 0.29.0, mismas flags de servidor, decodificacion especulativa MTP con 3 tokens borrador, 8 peticiones concurrentes, esfuerzo de razonamiento por defecto de la plantilla, temperatura 1,0 / top_p 0,95 / top_k 20 / min_p 0 y limite de salida de 8192 tokens.

| Metrica | BF16 (modelo base) | NVFP4 (este repo) |
|---|---|---|
| GSM8K test, primeras 200 preguntas, exact match | 98,0 % | 96,5 % |
| Resultado pareado (ambos correctos / solo BF16 / solo NVFP4) | 192 / 4 / 1 | 192 / 4 / 1 |
| Truncados a 8192 tokens | 1 | 0 |
| Media de tokens de completado | 344 | 391 |
| Mediana de tokens/s por peticion (8 concurrentes) | 54 | 85 |
| Aceptacion de tokens borrador MTP | 62 % | 61 % |
| Pesos en disco | 55,6 GB | 28,6 GB |
| Pesos en memoria de GPU (vLLM) | ~54 GB | ~29 GB |

El propio autor senala que la diferencia de precision esta dentro del ruido de muestreo con este tamano de muestra (4 frente a 1 preguntas discordantes, no significativa) y que se anadiran ejecuciones de benchmark mas amplias cuando esten disponibles. No hay datos publicados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Tensor cores Blackwell obligatorios para obtener ventaja: SM100 y posteriores (B200, B300, GB200, RTX PRO 6000 Blackwell). En Hopper y GPUs anteriores vLLM cae a una ruta de dequantizacion solo de pesos sin aceleracion, por lo que el autor recomienda usar alli el modelo BF16 o la version GGUF.
- VRAM estimada para inferencia: aproximadamente 29 GB solo para los pesos en vLLM, mas la memoria de KV cache y activaciones. El modelo BF16 equivalente ocupa unos 54 GB de pesos.
- GPUs recomendadas por el autor: RTX PRO 6000 Blackwell (96 GB, SM120, usada en las pruebas), B200, B300 y GB200.
- GPU de consumo: no confirmado. La model card solo valida la RTX PRO 6000 Blackwell y las plataformas de centro de datos; no menciona ninguna GPU de consumo. Tecnicamente NVFP4 requiere SM100 o superior, familia a la que pertenecen tambien las GeForce RTX 50 (SM120), pero el ajuste de 29 GB de pesos mas KV cache y el soporte efectivo en vLLM no estan documentados por el autor.
- Opciones de despliegue: vLLM (recomendado, con `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y, opcionalmente, `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`). Para hardware no Blackwell, el autor remite a la version GGUF (compatible con llama.cpp / Ollama) o al modelo BF16.
- Paralelismo: `--tensor-parallel-size 1` en el ejemplo oficial; el autor indica que se ajuste el paralelismo y la longitud de contexto a la memoria disponible.
- Latencia y throughput: mediana de 85 tokens/s por peticion con 8 peticiones concurrentes en una RTX PRO 6000 Blackwell (96 GB), frente a 54 tokens/s de la version BF16 en las mismas condiciones. No se publican datos de latencia (TTFT) ni de rendimiento agregado total.
- API alojada: `https://ukisai.com/api/swift/v1`, compatible con OpenAI, modelo `swift`, gratuita para investigacion y sin clave.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-NVFP4 (este repo) | 27,8 B | 262.144 tokens en la config. de referencia | NVFP4 W4A4, grupo 16 | GSM8K 96,5 %; 85 tok/s por peticion con 8 concurrentes | Swift Open License v1.0 (gated) | HuggingFace, acceso restringido |
| Swift-Qwen3.8-27B (BF16) | 27,8 B | No disponible en la informacion | BF16 | GSM8K 98,0 %; 54 tok/s por peticion con 8 concurrentes; 55,6 GB en disco | Swift Open License v1.0 (gated) | HuggingFace, acceso restringido |
| Swift-Qwen3.8-27B-GGUF | 27,8 B (base) | No disponible en la informacion | GGUF (niveles no especificados) | No disponible | Swift Open License v1.0 (gated) | HuggingFace, acceso restringido |
| Checkpoints NVFP4 de NVIDIA para Qwen3.5 | No disponible | No disponible | NVFP4 | No disponible | No disponible | Mencionados como referencia de layout por el autor |

No se dispone de datos sobre otros modelos comparables de la misma categoria en la informacion proporcionada, mas alla del propio modelo base y de la mencion a los checkpoints NVFP4 de NVIDIA para Qwen3.5.

## Limitaciones y advertencias

- Dependencia de hardware: sin tensor cores Blackwell (SM100+) no hay aceleracion. En Hopper o anteriores, vLLM aplica dequantizacion solo de pesos y el checkpoint pierde su ventaja principal; el autor recomienda explicitamente usar BF16 o GGUF en ese caso.
- Cobertura de cuantizacion parcial: `lm_head`, embeddings, la torre de vision, las 48 capas Gated DeltaNet y la cabeza MTP permanecen en BF16, de modo que la reduccion de memoria no es proporcional en todas las partes del modelo.
- Licencia restrictiva para grandes empresas: el uso comercial es gratuito solo hasta 1.000.000 USD de ingresos recurrentes anuales agregados (incluidas filiales); por encima se requiere la Swift Enterprise License. No es una licencia open source tipo Apache o MIT.
- Acceso restringido: el repositorio esta marcado como `gated: true`, por lo que es necesario aceptar las condiciones del autor para descargar los pesos.
- Evidencia de evaluacion limitada: los unicos resultados publicados son 200 preguntas de GSM8K en una sola GPU. No hay MMLU, HumanEval, benchmarks multimodales ni evaluaciones multilingues. El propio autor reconoce que la diferencia de precision frente a BF16 no es estadisticamente significativa con esa muestra.
- Mayor verbosidad en la version cuantizada: 391 tokens de completado de media frente a 344 en BF16, un incremento de aproximadamente el 13,7 % que reduce parte del ahorro de coste por token.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad; como cualquier modelo generativo, puede producir afirmaciones plausibles pero incorrectas, especialmente en dominios fuera de su distribucion de entrenamiento.
- Idiomas y sesgos: la model card no especifica idiomas soportados, cobertura linguistica ni evaluaciones de sesgo. No hay informacion sobre el tratamiento de sesgos demograficos, culturales o de dominio.
- Herencia del modelo base: al ser una derivacion de Qwen3.8-27B, arrastra las limitaciones, sesgos y caracteristicas de licencia de la cadena upstream, que no se detallan en la informacion disponible.
- Contexto en produccion: los 262.144 tokens del ejemplo son un ajuste de servidor; la ventana realmente utilizable dependera de la VRAM libre para KV cache una vez cargados los ~29 GB de pesos.
- Madurez: el modelo se publico en septiembre de 2026 y no tiene descargas registradas ni un historial de uso en produccion documentado; conviene validarlo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace (este checkpoint): https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4
- Modelo base en BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Version GGUF: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Sitio web de UkisAI: https://ukisai.com
- Pagina de producto de Swift: https://ukisai.com/products/swift
- Contacto para licencia empresarial: https://ukisai.com/contact
- API compatible con OpenAI: https://ukisai.com/api/swift/v1 (modelo `swift`, gratuita para investigacion, sin clave)
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Citacion del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b (entrada BibTeX `swift-qwen3.8-27b`, UkisAI, 2026)

Nota: los resultados de la busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden a consultas de soporte de una plataforma de television), por lo que no se han incluido como fuentes.
