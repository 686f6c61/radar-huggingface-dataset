# tinyopsec/svd-safety-l3_swift_remove50_swapgapiter_b010-GGUF

## Resumen
Este repositorio contiene cuantizaciones GGUF del checkpoint `Jeesup/svd-safety-l3_swift_remove50_swapgapiter_b010`, una variante comprimida de Llama-3-8B-Instruct obtenida mediante una tecnica de descomposicion en valores singulares (SVD) sobre el 50 % de los parametros densos, con recuperacion posterior mediante LoRA y diez rondas de edicion de parametros con intercambio neutro (gap_iter). El autor del repositorio, `tinyopsec`, se limita a empaquetar esas variantes en formato GGUF para su uso con llama.cpp y runtimes compatibles.

El modelo no es un asistente de proposito general: la propia model card lo describe como un artefacto de investigacion sobre el compromiso entre compresion SVD y seguridad, y advierte de que varias ramas de la rejilla experimental estan deliberadamente degradadas en seguridad. Su interes es, por tanto, metodologico: permite estudiar como afecta la compresion agresiva de pesos a las capacidades y a las barreras de seguridad de un modelo Llama 3.

La arquitectura subyacente es la de Llama 3 8B Instruct (transformer denso, 8.030.261.248 parametros en el checkpoint en precision completa), con licencia Meta Llama 3 Community. El repositorio GGUF ocupa 77,6 GB e incluye trece ficheros de cuantizacion, desde F16 hasta Q2_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Llama 3 8B Instruct, comprimido mediante SVD (Swift-SVD) con recuperacion LoRA |
| Parametros totales | 8.030.261.248 (checkpoint en precision completa) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License |
| Formato de pesos | GGUF (generado con llama.cpp) |
| Tamano del repositorio | 77,6 GB |
| Descargas | 658 |
| Fecha de creacion | 2026-10-26 |

## Arquitectura y entrenamiento
El modelo parte de Llama 3 8B Instruct, un transformer denso con atencion multi-cabeza estandar, y aplica una compresion Swift-SVD que reduce aproximadamente el 50 % de los parametros densos. Sobre esa base comprimida se aplica una recuperacion con LoRA para mitigar la perdida de capacidad, seguida de diez rondas de edicion de parametros mediante intercambio neutro (gap_iter), una tecnica que redistribuye pesos sin alterar el numero total de parametros. El resultado es un checkpoint editado que conserva el tamano nominal de Llama 3 8B pero con una estructura interna alterada.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en esta variante; esos datos corresponden al modelo base Llama 3 8B Instruct y no se confirman para el checkpoint editado. La innovacion tecnica destacable es precisamente el pipeline de compresion y recuperacion, no una arquitectura nueva. Las cuantizaciones GGUF se generaron con llama.cpp y no implican reentrenamiento adicional.

## Capacidades
- Generacion de texto conversacional, heredada de Llama 3 8B Instruct, aunque degradada por la compresion SVD y la edicion de pesos.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad no verificada en la informacion disponible.
- Capacidades multilingues: no disponibles en la model card; se asume el perfil de Llama 3, sin confirmacion.
- Soporte de tool calling y function calling: no documentado para esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no disponible.
- Uso como artefacto de investigacion para estudiar el efecto de la compresion SVD sobre seguridad y capacidades.

## Casos de uso
- Investigacion sobre compresion de modelos: el checkpoint permite medir empiricamente como afecta la reduccion SVD del 50 % de parametros densos a las metricas de calidad, comparando con Llama 3 8B Instruct sin comprimir.
- Estudio de seguridad en modelos comprimidos: al incluir ramas deliberadamente degradadas en seguridad, sirve para analizar si la compresion agresiva erosiona las barreras de alineamiento y como se manifiesta ese deterioro.
- Evaluacion de tecnicas de recuperacion LoRA: permite comparar la calidad del checkpoint con recuperacion frente a una compresion SVD sin recuperacion, aislando el efecto de la LoRA.
- Analisis de la edicion gap_iter: las diez rondas de intercambio neutro de parametros se pueden estudiar como metodo de ajuste sin cambio de tamano, midiendo su impacto en perplexity y en comportamiento.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M y Q3_K permiten ejecutar el modelo en GPUs consumer con llama.cpp, Ollama o LM Studio para pruebas exploratorias.
- Reproducibilidad de experimentos: los trece ficheros GGUF facilitan replicar evaluaciones en distintos niveles de cuantizacion sin necesidad de recompilar el modelo.
- Docencia sobre cuantizacion: el rango F16 a Q2_K permite ilustrar la relacion entre bits por peso, tamano en disco y degradacion de salida en un modelo real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 16,1 GB en F16, en torno a 8,5-9 GB en Q8_0, unos 6,5-7 GB en Q6_K, 5,5-6 GB en Q5_K_M, 4,5-5 GB en Q4_K_M y 3-3,5 GB en Q2_K (estimaciones a partir del tamano de los ficheros y del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: A100 o H100 para F16 y Q8_0 con contexto largo; RTX 4090 o RTX 3090 para Q6_K y Q5_K_M; RTX 4070, RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M y Q3_K.
- Cabe en GPU consumer: si, en las cuantizaciones Q4_K_M y Q3_K en GPUs con 8 GB o mas; Q2_K en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/svd-safety-l3_swift_remove50_swapgapiter_b010-GGUF | 8,03 B | no disponible | Llama 3 Community | GGUF | Variante comprimida por SVD con seguridad degradada en varias ramas |
| Llama 3 8B Instruct (original) | 8,03 B | 8.192 tokens (segun documentacion de Meta, no confirmado en esta ficha) | Llama 3 Community | safetensors, GGUF | Modelo base sin comprimir; referencia de calidad |
| Jeesup/svd-safety-l3_swift_remove50_swapgapiter_b010 | 8,03 B | no disponible | Llama 3 Community | safetensors | Checkpoint original del que derivan estas cuantizaciones |
| Otras variantes Llama 3 8B cuantizadas (por ejemplo, Q4_K_M de Llama 3 8B Instruct) | 8,03 B | 8.192 tokens | Llama 3 Community | GGUF | Alternativa de proposito general con calidad y seguridad intactas |

## Limitaciones y advertencias
- La model card advierte explicitamente de que varias ramas de la rejilla experimental estan degradadas en seguridad de forma deliberada; el modelo no debe usarse como asistente de proposito general.
- La compresion SVD del 50 % de parametros densos y las diez rondas de edicion gap_iter pueden degradar la coherencia, el razonamiento y el seguimiento de instrucciones; no hay benchmarks publicados que cuantifiquen esa perdida.
- Riesgo elevado de alucinacion y de respuestas incoherentes, especialmente en cuantizaciones bajas (Q3_K, Q2_K).
- Sesgos conocidos: no documentados para esta variante; se heredan los de Llama 3 8B Instruct, sin evaluacion especifica.
- Limitaciones de contexto e idioma: no disponibles en la model card; no se confirma la ventana de contexto efectiva tras la compresion.
- Restricciones de licencia: Llama 3 Community License; el uso comercial esta sujeto a los terminos de Meta, incluida la politica de nombres y la obligacion de atribucion.
- El repositorio ocupa 77,6 GB, lo que exige espacio en disco considerable aunque solo se descargue una cuantizacion.
- No hay garantia de soporte de tool calling ni de comportamiento agentico; no debe asumirse en produccion sin evaluacion previa.
- Fecha de creacion en 2026 y ausencia de likes o documentacion adicional: la trazabilidad del experimento depende del autor original del checkpoint, no de este repositorio.

## Enlaces
- Repositorio GGUF: https://huggingface.co/tinyopsec/svd-safety-l3_swift_remove50_swapgapiter_b010-GGUF
- Modelo base: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove50_swapgapiter_b010
- Llama 3 8B Instruct (referencia): https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Llama 3: https://llama.meta.com/llama3/license/
