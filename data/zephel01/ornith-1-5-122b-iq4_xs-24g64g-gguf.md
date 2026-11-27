# zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF

## Resumen

Ornith-1.5-122B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ornith-ai, con 124.635.206.144 parametros totales y una arquitectura identificada en llama.cpp como `qwen35moe`. La ficha que nos ocupa no es el modelo original, sino una cuantizacion GGUF publicada por el usuario zephel01 bajo el identificador `Ornith-1.5-122B-IQ4_XS-24G64G-GGUF`, disenada especificamente para equipos con una GPU de 24-32 GB de VRAM y 64 GB de RAM. El objetivo es que el modelo completo quepa en memoria sin leer del SSD durante la generacion, manteniendo los 256 expertos enrutados.

La cuantizacion emplea una receta mixta: expertos enrutados en IQ4_XS con importance matrix (calculada sobre texto tecnico y codigo en ingles y japones), y atencion, proyecciones delta-net y expertos compartidos en Q8_0, con un promedio de 4,26 bits por peso. El resultado es un archivo de 68,9 GB dividido en dos shards. El autor lo marca como BETA y advierte de que las mediciones se hicieron en un unico equipo (RTX 5090 limitada a 24 GB con 46 GB de RAM en un limite de 58 GB), no en una tarjeta real de 24 GB.

El modelo es relevante porque permite ejecutar localmente un MoE de 122B en hardware de consumo de gama alta, con decodificacion especulativa mediante el bloque NextN (MTP) preservado en Q4_K, y con soporte tanto en el motor propio del autor (Abyss) como en llama.cpp estandar. La licencia MIT del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), identificada como `qwen35moe` en llama.cpp; incluye bloque NextN (MTP) para decodificacion especulativa |
| Parametros totales | 124.635.206.144 (124,6B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en el ejemplo de llama.cpp (`-c 32768`); contexto maximo nativo no disponible |
| Tipos de cuantizacion | IQ4_XS (expertos enrutados, 98% por bytes), Q4_K (2%), Q8_0 (atencion, delta-net, expertos compartidos), Q4_K (bloque NextN/MTP); 4,26 bits por peso de media |
| Idiomas soportados | Ingles (en) y japones (ja) segun la model card; no se listan mas idiomas |
| Licencia | MIT |
| Formato de pesos | GGUF (dos shards: 47,6 GB + 21,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 256 expertos enrutados por capa, todos ellos preservados en esta cuantizacion (no se elimino ningun experto). La arquitectura se etiqueta como `qwen35moe` e incorpora proyecciones delta-net y expertos compartidos, ademas de un bloque NextN (MTP, `blk.48`) que actua como drafter para decodificacion especulativa en Abyss v1.3.57 o superior. La cuantizacion mantiene la atencion y las proyecciones criticas en Q8_0 para preservar calidad, mientras comprime los expertos con IQ4_XS guiado por una importance matrix construida sobre texto tecnico y codigo en ingles y japones.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras etapas de alineamiento. La model card de la cuantizacion se centra en el proceso de cuantizacion y validacion, no en el entrenamiento original. La innovacion tecnica destacable de esta publicacion es la receta de cuantizacion orientada a un presupuesto de memoria concreto (24 GB VRAM + 64 GB RAM) y la validacion mediante divergencia KL frente a BF16.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a preguntas factuales; la model card menciona pruebas de hechos y explicaciones en japones.
- Generacion de codigo: el autor valida tres tareas de programacion con tests en el chequeo `--check`.
- Soporte de tool calling / function calling (se valida una llamada a herramienta en las comprobaciones).
- Manejo de contexto largo: pruebas de tipo "needles" a 8K, 24K y 31K tokens superadas.
- Capacidades multilingues limitadas a ingles y japones; el japones incluye registro formal (keigo) para correo empresarial.
- Decodificacion especulativa mediante el bloque NextN (MTP) cuando se usa el motor Abyss.
- Interfaz compatible con la API de OpenAI (`/v1/chat/completions`) a traves de Abyss.

## Casos de uso

- Asistente local de atencion al cliente en japones: el modelo puede redactar correos empresariales en keigo, explicaciones y resumenes, con contexto de hasta 32K tokens para hilos largos, ejecutandose en una estacion de trabajo con RTX 5090 y 64 GB de RAM sin depender de la nube.
- Generacion de codigo en local para equipos con requisitos de privacidad: las tareas de programacion con tests validadas en la model card y el soporte de tool calling permiten integrarlo en flujos de desarrollo internos donde el codigo no puede salir de la red corporativa.
- Procesamiento de documentacion tecnica bilingue (ingles/japones): la importance matrix se construyo sobre texto tecnico y codigo en ambos idiomas, lo que lo hace adecuado para resumir y traducir manuales o especificaciones.
- Agentes con llamadas a herramientas: el soporte de function calling y la ventana de 32K permiten construir agentes multi-paso que consulten APIs internas y mantengan estado en conversaciones largas.
- Analisis de documentos extensos con recuperacion ("needle in a haystack"): las pruebas a 8K, 24K y 31K indican que el modelo localiza informacion en contextos largos, util para auditoria de contratos o informes.
- Despliegue de un LLM de 122B en hardware de consumo: para investigadores que quieran experimentar con un MoE grande sin infraestructura de centro de datos, esta cuantizacion es una de las pocas opciones que caben en 24 GB de VRAM mas 64 GB de RAM.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K). El autor publica metricas de calidad de cuantizacion (divergencia KL frente a BF16) y de velocidad:

| Metrica | Este archivo (68,9 GB) | UD-Q4_K_XL (80 GB) | IQ3_XXS 16G64G (51,7 GB) |
|---|---|---|---|
| KL medio vs BF16 | 0,061 | 0,039 | 0,138 |
| KL percentil 99 | 0,45 | 0,32 | 1,09 |
| Mismo token top-1 | 85,7% | 89,5% | 81,3% |
| Perplejidad | 14,48 | 14,37 | 14,88 |

La perplejidad de referencia del BF16 en el mismo conjunto (8 fragmentos de 1024 tokens, texto ingles y japones no usado en la imatrix) es 14,44. El rendimiento medido es de 52,4 tok/s en una RTX 5090 limitada a 24 GB con 46 GB de RAM, en configuracion BETA sobre un unico equipo.

## Requisitos de hardware

- VRAM: 24-32 GB en GPU; el resto del modelo reside en RAM (aproximadamente 46 GB en un equipo de 64 GB, controlado por `STRATA_GLM_RAM_GB` en Abyss).
- RAM: 64 GB recomendados; el archivo pesa 68,9 GB y debe caber entre VRAM y RAM para evitar lectura de SSD.
- GPU recomendadas: RTX 5090 (medida por el autor), RTX 4090 y GPUs profesionales con 24 GB o mas (A100 40/80 GB, H100) si se quiere mantener mas expertos en VRAM.
- Cabe en GPU de consumo de 24 GB (RTX 4090, RTX 5090) siempre que se acompanen de 64 GB de RAM de sistema.
- Opciones de despliegue: Abyss (motor del autor, con `setup-deepseek.sh --model ornith --quant 24G64G`), llama.cpp (`llama-server` con `-ngl 99 --cpu-moe -c 32768`), y por extension cualquier frontend compatible con la API de OpenAI via Abyss.
- Throughput medido: 52,4 tok/s en RTX 5090 limitada a 24 GB + 46 GB de RAM (BETA, un solo equipo).
- Parametros de muestreo recomendados: temperature 0,6, top_p 0,95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL vs BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B IQ4_XS 24G64G (esta ficha) | 124,6B | 32K en ejemplo | KL 0,061 | MIT | GGUF, 68,9 GB |
| Ornith-1.5-122B IQ3_XXS 16G64G | 124,6B | 32K en ejemplo | KL 0,138 | MIT | GGUF, 51,7 GB |
| Ornith-1.5-397B IQ2_XXS 32G128G | 397B (aprox., no confirmado) | no disponible | no disponible | MIT | GGUF, 114,2 GB |
| unsloth UD-Q4_K_XL (mismo modelo base) | 124,6B | no disponible | KL 0,039 | MIT | GGUF, 80 GB |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de modelos de otros desarrolladores. Frente a UD-Q4_K_XL, esta cuantizacion sacrifica algo de fidelidad (KL 0,061 frente a 0,039) a cambio de 11 GB menos de huella, lo que la hace viable en equipos donde el archivo de 80 GB no cabe.

## Limitaciones y advertencias

- Estado BETA: las mediciones proceden de un unico equipo y el autor pide reportes de otras maquinas; el rendimiento en una GPU real de 24 GB (sin el limite simulado) no esta verificado.
- La plantilla de chat descarta el razonamiento de respuestas anteriores, por lo que la reutilizacion de conversacion falla como WARN en todas las variantes de Ornith; esto afecta a la cache de prefijos y al rendimiento en dialogos largos.
- Idiomas limitados a ingles y japones; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion no cuantificado: no se publican evaluaciones de factualidad ni de sesgos.
- Perdida de calidad por cuantizacion: 85,7% de coincidencia en el token top-1 frente a BF16 y KL medio de 0,061; para tareas sensibles a la fidelidad, el autor recomienda UD-Q4_K_XL si el hardware lo permite.
- Requiere 64 GB de RAM ademas de la GPU; en equipos con menos RAM el modelo leera del SSD y el rendimiento caera drasticamente.
- La licencia MIT del modelo base permite uso comercial, pero la cuantizacion concreta es una publicacion de terceros (zephel01) y conviene verificar los terminos del modelo base original.
- El tag `qwen35moe` sugiere una arquitectura derivada de Qwen, pero la informacion proporcionada no detalla la relacion exacta con esa familia.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Version 16G64G (IQ3_XXS): https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Version 397B IQ2_XXS 32G128G: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF
- Version 397B IQ2_XXS 16G64G: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-16G64G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Ornith-1.5-122B+24G64G
