# tinyopsec/Qwen3.5-4B-Unredacted-MAX-GGUF

## Resumen

Qwen3.5-4B-Unredacted-MAX-GGUF es un paquete de cuantizaciones en formato GGUF del modelo prithivMLmods/Qwen3.5-4B-Unredacted-MAX, publicado por el usuario tinyopsec. El modelo original es un ajuste fino sobre una arquitectura Qwen2 de 28 capas y 28 cabezas de atención, orientado a generación de texto e instrucciones en inglés. Su objetivo es permitir la inferencia local en hardware de consumo sin depender de servicios en la nube.

La model card declara 4.500 millones de parámetros y 32.768 tokens de contexto, mientras que los pesos en safetensors del repositorio suman 4.205.751.296 parámetros (unos 4,21 mil millones); ambas cifras no coinciden y no se documenta el motivo. El tamaño de vocabulario es de 151.936 entradas y la licencia declarada es Apache 2.0.

Su interés práctico reside en el catálogo de once cuantizaciones (de F16 a Q2_K) incluidas en un único repositorio de 36,4 GB, que cubren desde 8,4 GB hasta 1,1 GB por archivo. Se trata de una cuantización comunitaria: no hay soporte oficial ni detalles publicados sobre el dataset de ajuste fino del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only denso), 28 capas, 28 cabezas de atencion |
| Parametros totales | 4.205.751.296 (~4,21 mil millones) segun safetensors; la model card declara 4,5 mil millones |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S y Q2_K (11 ficheros GGUF) |
| Idiomas soportados | Ingles (codigo de idioma `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano de vocabulario | 151.936 entradas |
| Modelo base | prithivMLmods/Qwen3.5-4B-Unredacted-MAX (a su vez basado en Qwen/Qwen3.5-4B) |
| Libreria | gguf |
| Pipeline | text-generation |
| Tamano del repositorio | 36,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 17 de septiembre de 2026 (ultima actualizacion: mismo dia) |

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen2, un transformer decoder-only denso con 28 capas y 28 cabezas de atencion, sin mezcla de expertos ni capas de estado recurrente. El vocabulario de 151.936 entradas y la ventana de 32.768 tokens son coherentes con la familia Qwen2. La documentacion no especifica la dimension oculta, si se emplea attention con consultas agrupadas (GQA) ni el tipo de activacion. Existe ademas una inconsistencia sin aclarar entre la etiqueta de arquitectura del repositorio (`qwen2`) y el nombre comercial del modelo base (`Qwen3.5-4B`).

No hay informacion publicada sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del dataset y si hubo fases de RLHF, DPO u otra forma de alineamiento. La model card del repositorio de cuantizacion se limita a describir los ficheros GGUF y las instrucciones de uso, y tampoco documenta el ajuste fino realizado por prithivMLmods sobre el modelo original. El sufijo "Unredacted" sugiere un ajuste orientado a reducir los rechazos del modelo, pero esto no aparece confirmado en la informacion disponible. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto e instrucciones directas, con enfasis declarado en el seguimiento de instrucciones multi-paso.
- Razonamiento y resolucion de problemas de complejidad media, segun la descripcion de la model card.
- Generacion de contenido sobre temas diversos (redaccion, resumen, reformulacion).
- Perfil conversacional: el repositorio incluye las etiquetas `conversational` y `endpoints_compatible`.
- Uso en investigacion y experimentacion: la model card lo presenta como adecuado para el analisis del comportamiento de transformers y de la dinamica de instrucciones.
- Despliegue ligero: arquitectura de ~4,2 mil millones de parametros pensada para inferencia local.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso complejo: no documentado.
- Capacidades multilingues: limitadas al ingles.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponibles.

## Casos de uso

- Asistente local en portatil: con la cuantizacion Q4_K_M (2,1 GB de archivo, ~2,5 GB de VRAM) el modelo se puede ejecutar en GPU de portatil o incluso en CPU, lo que permite disponer de un asistente de texto sin conexion y sin enviar datos a terceros.
- Redaccion y reescritura de textos en ingles: la ventana de 32.768 tokens permite procesar informes, articulos o documentacion tecnica completos en una sola pasada, sin fragmentar el contenido en trozos.
- Resumen de documentacion extensa: el contexto de 32K tokens admite resumir contratos, manuales o transcripciones largas manteniendo la coherencia entre secciones.
- Prototipado de chatbots conversacionales en ingles: el modelo esta etiquetado como conversacional y se puede servir con llama.cpp server u Ollama para pruebas de concepto de bajo coste.
- Investigacion sobre cuantizacion: al incluir once niveles distintos en el mismo repositorio, permite medir la degradacion de calidad entre F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K y Q2_K sobre el mismo prompt y comparar resultados.
- Entornos con recursos muy limitados: la variante Q2_K (1,1 GB de archivo, ~1,5 GB de VRAM) es desplegable en CPU con RAM suficiente, util para equipos sin GPU dedicada o para sistemas embebidos de gama alta.
- Analisis de la dinamica de instrucciones: la model card lo orienta explicitamente a la experimentacion con comportamiento de transformers, por lo que sirve como banco de pruebas academico en lugar de como modelo de produccion.
- Procesamiento por lotes de bajo coste: con llama-cpp-python se pueden lanzar tareas de generacion en serie sobre CPU y ocho hilos, tal como documenta el autor, sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos de tamano similar. Tampoco se publican mediciones de latencia o throughput (tokens por segundo).

## Requisitos de hardware

La model card proporciona la siguiente tabla de requisitos de VRAM por cuantizacion:

| Cuantizacion | Bits | Tamano del archivo | VRAM estimada | Dispositivo recomendado |
|---|---|---|---|---|
| F16 | 16 | ~8,4 GB | 9 GB | GPU de gama alta |
| Q8_0 | 8 | ~4,5 GB | 5 GB | GPU de gama media |
| Q6_K | 6 | ~3,4 GB | 3,5 GB | GPU de gama media |
| Q5_K_M | 5 | ~2,8 GB | 3 GB | GPU estandar |
| Q5_K_S | 5 | ~2,5 GB | no disponible | no disponible |
| Q4_K_M | 4 | ~2,1 GB | 2,5 GB | GPU estandar o GPU de portatil |
| Q4_K_S | 4 | ~1,9 GB | no disponible | no disponible |
| Q3_K_L | 3 | ~1,7 GB | no disponible | no disponible |
| Q3_K_M | 3 | ~1,5 GB | 2 GB | GPU de portatil o CPU |
| Q3_K_S | 3 | ~1,4 GB | no disponible | no disponible |
| Q2_K | 2 | ~1,1 GB | 1,5 GB | CPU con RAM suficiente |

- La model card no nombra modelos de GPU concretos (A100, H100, RTX 4090, etc.). Por requisitos de VRAM, las cuantizaciones de Q4_K_M hacia abajo (2,5 GB o menos) caben en GPU de consumo con 4 GB o mas, mientras que F16 (9 GB) exige una GPU de 12 GB o superior.
- Opciones de despliegue documentadas: llama.cpp (binario `main`), llama-cpp-python con `n_ctx=32768` y `n_threads=8`, LM Studio y Ollama (etiqueta `tinyopsec/qwen3.5-4b-unredacted-max-gguf:q5_k_m`).
- Compatibilidad con vLLM o TGI: no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de la columna "alternativas" corresponden a las especificaciones publicas de cada modelo; no se dispone de evaluaciones comparativas directas frente a este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Unredacted-MAX (GGUF) | 4,21-4,5 mil millones (segun fuente) | 32.768 tokens | Apache 2.0 | safetensors + GGUF | Repositorio comunitario, 0 descargas |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Repositorio oficial de Qwen |
| Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Repositorio oficial de Meta |
| Gemma-2-2B-it | 2,61 mil millones | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Repositorio oficial de Google |

Diferencias relevantes respecto a las alternativas: este modelo es mas grande en parametros que los tres comparados, pero su contexto (32K) es inferior al de Llama-3.2-3B y su licencia Apache 2.0 es mas permisiva que la de Llama o Gemma. Frente a estos, carece de evaluaciones publicadas, de soporte oficial y de historial de uso.

## Limitaciones y advertencias

- Cobertura idiomatica limitada al ingles: no hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en produccion multilingue no esta respaldado.
- Alineacion de seguridad no documentada: el sufijo "Unredacted" sugiere un ajuste orientado a reducir los rechazos del modelo. No hay confirmacion en la documentacion, pero el nombre aconseja tratar las salidas con filtros adicionales antes de exponerlas a usuarios finales.
- Riesgo de alucinacion no cuantificado: al no existir benchmarks ni evaluaciones publicadas, no se puede estimar la tasa de invencion de hechos.
- Discrepancia en el numero de parametros: la model card indica 4,5 mil millones y los pesos en safetensors suman 4,21 mil millones. Esta falta de trazabilidad afecta a cualquier estimacion de coste de inferencia.
- Conflicto de nomenclatura: el modelo se presenta como "Qwen3.5-4B" pero la arquitectura etiquetada es `qwen2`. No se aclara si existe relacion con modelos oficiales de Qwen ni que implicaciones tiene.
- Degradacion por cuantizacion: las variantes Q3_K_S, Q3_K_M y Q2_K (1,4-1,5 GB y 1,1 GB) comprimen de forma agresiva. La model card no publica mediciones de perdida de calidad para ninguno de los niveles.
- Sin soporte oficial: se trata de una cuantizacion comunitaria; el autor remite al repositorio del modelo original y a la documentacion de llama.cpp para cualquier soporte.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar su comportamiento real.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo base y su ajuste fino podrian arrastrar condiciones adicionales no documentadas en este repositorio.
- Sin tool calling ni function calling documentados: no es adecuado como nucleo de agentes que dependan de invocacion de herramientas.
- Rendimiento con contexto largo no verificado: los 32.768 tokens son la longitud declarada, pero no hay pruebas de recuperacion de informacion en posiciones lejanas del contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/Qwen3.5-4B-Unredacted-MAX-GGUF
- Modelo base (prithivMLmods): https://huggingface.co/prithivMLmods/Qwen3.5-4B-Unredacted-MAX
- Modelo original citado en la model card (Qwen/Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Documentacion de llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: unicamente enlaces genericos a YouTube sin relacion con el repositorio, por lo que no se incluyen.
