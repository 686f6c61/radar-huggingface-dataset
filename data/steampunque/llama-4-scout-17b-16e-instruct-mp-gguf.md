# steampunque/Llama-4-Scout-17B-16E-Instruct-MP-GGUF

## Resumen

Llama-4-Scout-17B-16E-Instruct-MP-GGUF es una cuantizacion mixta en formato GGUF del modelo multimodal Llama 4 Scout Instruct, publicado por el usuario steampunque. No es un modelo original de Meta, sino una redistribucion optimizada para inferencia en hardware de consumo: aplica niveles de cuantizacion K distintos por capa (desde Q2_K hasta Q6_K, con embeddings y capa de salida en Q6_K) para reducir el tamano del fichero manteniendo una perplejidad proxima a la de cuantizaciones homogeneas de mayor tamano.

El modelo base, Llama 4 Scout, es un transformer con arquitectura mixture-of-experts (MoE) de 17B parametros activos y 16 expertos, desarrollado por Meta. La variante aqui descrita contiene 107.769.861.184 parametros totales segun los safetensors del modelo base, lo que se traduce en ficheros GGUF de entre 42,8 GB y 62,8 GB segun la variante. La cuantizacion esta pensada para ejecutarse en maquinas con 64 GB de RAM combinando CPU y una unica GPU.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE multimodal de 109B parametros totales en equipos sin multiples aceleradores, algo inviable con los pesos originales en bf16. El autor documenta explicitamente las decisiones de cuantizacion por capa, los valores de perplejidad medidos y las limitaciones de hardware, lo que facilita la evaluacion tecnica antes del despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), multimodal texto e imagen (modelo base) |
| Parametros totales | 107.769.861.184 (107,8B) |
| Parametros activos | 17B (16 expertos, modelo base Llama 4 Scout) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF K-quants mixtos por capa: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K, Q6_K, F16, F32; variantes Q2_K_H, Q3_K_H, Q4_V_H, Q4_K_H, Q4_E_H |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Llama 4 Scout emplea una arquitectura mixture-of-experts con 16 expertos y 17B parametros activos sobre un total de aproximadamente 109B. Meta describe la familia Llama 4 como nativamente multimodal, capaz de procesar texto e imagenes. La model card de esta cuantizacion no aporta detalles adicionales sobre el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica de esta publicacion reside en la estrategia de cuantizacion mixta por capa. El autor define un mapa de capas que asigna tipos de cuantizacion distintos a cada una de las 48 capas del modelo, con embeddings y capa de salida en Q6_K. La variante Q4_E_H (actualizada el 27/10/2026) usa Q5_K en las capas 0 y 1, Q4_K en las capas 2 a 44, Q4_K en la 45, Q5_K en la 46 y Q6_K en la 47, con flags `--token-embedding-type Q6_K --output-tensor-type Q6_K`. El objetivo declarado es operar en una maquina con 64 GB de RAM manteniendo el nivel Q4_K como minimo en la mayoria de capas para limitar la perdida de entropia. Las capas se ajustaron empiricamente con un conjunto reducido de prompts de razonamiento.

## Capacidades

- Generacion de texto conversacional e instruct, heredada del modelo base Llama 4 Scout Instruct.
- Procesamiento multimodal de texto e imagen, segun la descripcion de Meta para la familia Llama 4 (la model card de la cuantizacion no detalla el soporte efectivo tras la cuantizacion).
- Razonamiento multi-paso, segun las pruebas subjetivas y objetivas que el autor menciona haber usado para ajustar las capas.
- Soporte de conversaciones multi-turno en formato instruct.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling y function calling: no confirmadas en la informacion proporcionada para esta cuantizacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con 64 GB de RAM y una GPU unica: la variante Q4_E_H (62,8 GB) o Q4_K_H (50,4 GB) permite ejecutar un MoE de 109B parametros totales usando `-ot exps=CPU` en llama.cpp para descargar los tensores FFN de expertos no compartidos a CPU y liberar unos 45k de memoria KV cache.
- Prototipado de asistentes conversacionales multimodales: el modelo base acepta texto e imagen, por lo que la cuantizacion sirve para validar flujos de comprension de imagenes y dialogo sin acceso a infraestructura multi-GPU.
- Evaluacion de calidad frente a tamano: las variantes Q3_K_H (46,6 GB, PPL 10,2) y Q2_K_H (42,8 GB, PPL 10,4) permiten comparar el impacto de la cuantizacion en tareas de razonamiento con hardware limitado a 48 GB de RAM.
- Investigacion sobre cuantizacion por capas: el mapa de capas documentado y los valores de perplejidad publicados sirven como referencia reproducible para estudiar tecnicas de mixed-precision quantization en modelos MoE.
- Generacion de texto en local sin dependencia de API: al ser GGUF, se integra con llama.cpp y permite inferencia offline en equipos de escritorio.
- Banqueo de prompts de razonamiento: el autor ajusto las capas con un conjunto de prompts de razonamiento, lo que hace de esta variante un candidato para pruebas comparativas de calidad de generacion entre niveles de cuantizacion.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). El unico dato cuantitativo de rendimiento es la perplejidad (PPL) comparada entre variantes de cuantizacion:

| Variante | Tamano (GB) | PPL | Comentario |
|---|---|---|---|
| Q2_K | 39,6 | 11,4 | Artefactos de generacion, palabras sin sentido, finales de palabra con tokens chinos |
| Q2_K_H | 42,8 | 10,4 | Sin artefactos, cercano a Q3_K_M |
| Q3_K_M_3_5 | 51,6 | 10,2 | Q3_K_M con capa de salida Q5_K |
| Q3_K_H | 46,6 | 10,2 | Hibrida con salida Q5_K, perplejidad de Q3_K_M |
| Q4_V_H | 49,8 | 9,54 | Q4_K_H con Q2_K alterno en capas profundas |
| Q4_K_H | 50,4 | 9,54 | Hibrida con salida Q5_K, perplejidad de IQ4_XS |
| Q4_E_H | 62,8 | 9,5 | Embeddings y salida en Q6_K |
| IQ4_XS | 59,9 | 9,57 | IQ4_XS con embeddings y salida por defecto |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica que el modelo puede ejecutarse en una maquina con 64 GB de RAM combinando CPU y una GPU unica. Q2_K_H podria caber en 48 GB de RAM; Q3_K_H y Q4_K_H probablemente no sin offload parcial a GPU de alta VRAM o swap a disco.
- GPU recomendadas: no se especifican modelos concretos en la informacion proporcionada. El autor menciona una unica GPU combinada con CPU.
- Consumer GPU: no se detalla compatibilidad con RTX 4090 u otras GPU de consumo; el requisito critico es la RAM del sistema (64 GB) y el offload de expertos a CPU.
- Opciones de despliegue: llama.cpp, con la flag `-ot exps=CPU` para descargar los tensores FFN de expertos no compartidos a CPU (referencia: https://github.com/ggml-org/llama.cpp/discussions/13154). Compatible con endpoints segun los tags.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-4-Scout-17B-16E-Instruct-MP-GGUF (esta ficha) | 107,8B | 17B | no disponible | no disponible | GGUF |
| meta-llama/Llama-4-Scout-17B-16E-Instruct | 107,8B | 17B | no disponible | no disponible | safetensors |
| meta-llama/Llama-4-Scout-17B-16E (base) | 107,8B | 17B | no disponible | no disponible | safetensors |

La comparativa se limita al modelo base y su variante instruct, ya que la informacion proporcionada no incluye datos de otros modelos de la misma categoria (por ejemplo, Llama 4 Maverick, con 128 expertos y 17B activos, se menciona en la busqueda web pero sin especificaciones detalladas). No se dispone de datos de rendimiento comparado en benchmarks.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad medible: la PPL sube de 9,5 (Q4_E_H) a 11,4 (Q2_K), y el autor documenta artefactos de generacion en Q2_K (palabras sin sentido y tokens chinos aleatorios).
- Las variantes Q3_K_H y Q4_K_H no caben en 48 GB de RAM sin offload parcial a GPU o swap a disco.
- La licencia no esta disponible en la informacion proporcionada; es imprescindible verificar la licencia del modelo base de Meta antes de cualquier uso comercial.
- Los idiomas soportados no estan documentados en la model card de la cuantizacion.
- No se confirma el soporte de tool calling ni de function calling tras la cuantizacion.
- El ajuste de capas se realizo con un conjunto reducido de prompts de razonamiento, por lo que el rendimiento puede degradarse en dominios no cubiertos por esas pruebas.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones especificas para esta cuantizacion.
- La model card advierte de que no existe una cuantizacion Q4_K_H unica, ya que la seleccion de niveles por capa es arbitraria; los resultados pueden variar entre revisiones del fichero.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/steampunque/Llama-4-Scout-17B-16E-Instruct-MP-GGUF
- Modelo base instruct: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct
- Modelo base (variante sin instruct): https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E
- Discusion de llama.cpp sobre offload de expertos a CPU: https://github.com/ggml-org/llama.cpp/discussions/13154
