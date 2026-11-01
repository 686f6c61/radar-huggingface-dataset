# the-sweater-cat/Qwen3.8-27B-GSQ-RCO-IQ3_XXS-BF16

## Resumen

Qwen3.8-27B-GSQ-RCO-IQ3_XXS-BF16 es un checkpoint BF16 reconstruido a partir de una cuantizacion GGUF IQ3_XXS del modelo Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text de la familia Qwen3.5. Lo publica el usuario the-sweater-cat con el objetivo de servir como referencia reproducible en la evaluacion DeepSWE, un conjunto de pruebas de ingenieria de software. No se trata de un modelo entrenado de nuevo, sino de una decodificacion de los valores cuantizados y su redondeo a BF16: el autor advierte explicitamente de que el error de cuantizacion original permanece.

El modelo conserva la arquitectura Qwen3_5ForConditionalGeneration, con 27.356.728.560 parametros totales, y reutiliza tokenizer, procesadores y tensores de vision del Qwen/Qwen3.8-27B original. El repositorio ocupa 54,7 GB repartidos en 12 shards de safetensors, muy por encima de los 10,1 GB del GGUF empaquetado del que procede, porque el almacenamiento y la memoria en tiempo de ejecucion son los propios de BF16.

Su interes practico es acotado pero relevante: permite medir cuanto degrada una cuantizacion de ~3 bits por peso (IQ3_XXS) frente al BF16 original en tareas agenticas de codigo, y ofrece un checkpoint cargable en runtimes que no soportan GGUF pero si la arquitectura Qwen3.5. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal image-text-to-text) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint reconstruido); origen IQ3_XXS GGUF (~3 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 12 shards, 54,71 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3_5ForConditionalGeneration, tal como declara la model card, lo que implica una pila transformer con componentes de vision y lenguaje para entrada image-text-to-text. No se especifican en la informacion disponible el numero de capas, la dimension oculta, el tipo de atencion ni los detalles del codificador visual. Los tensores de vision, el tokenizer y los procesadores se toman directamente de Qwen/Qwen3.8-27B, de modo que la parte multimodal es la del modelo original sin modificaciones.

No hay entrenamiento adicional en este checkpoint. El proceso consiste en decodificar los valores del fichero Qwen3.8-27B-GSQ-RCO-IQ3_XXS.gguf (publicado por ISTA-DASLab) y redondearlos a BF16. El autor documenta comprobaciones de paridad numerica muestreadas a 1K, 8K y 32K con brechas de perplejidad relativa de 0,224 %, 0,054 % y 0,0013 % respectivamente, y advierte de que estas pruebas no garantizan salidas generadas identicas. Las revisiones fijadas y los hashes estan en provenance.json y conversion-record.json del repositorio.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-27B.
- Procesamiento image-text-to-text: el pipeline declarado es image-text-to-text y se incluyen los tensores de vision del modelo original.
- Ejecucion de tareas agenticas de ingenieria de software, segun la evaluacion DeepSWE realizada con Claude Code.
- Capacidades de codigo y edicion de repositorios, evidenciadas por el benchmark DeepSWE v1.1.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de degradacion por cuantizacion: cargar este checkpoint BF16 y el BF16 original de Qwen/Qwen3.8-27B en el mismo harness para medir la diferencia de calidad atribuible al GGUF IQ3_XXS. El autor ya aporta una referencia con DeepSWE (31,86 % frente a 38,94 %).
- Reproducibilidad de resultados de investigacion: el repositorio incluye provenance.json, conversion-record.json y SHA256SUMS, lo que permite fijar revisiones y verificar la integridad de los pesos en experimentos que deban ser replicables.
- Despliegue en runtimes sin soporte GGUF: al estar en safetensors BF16, se puede servir con SGLang (probado con TP4 en cuatro H100), vLLM u otros motores que carguen la arquitectura Qwen3.5 y no acepten ficheros GGUF.
- Baseline para pipelines de codigo agentico: usar el modelo como referencia de un sistema de 27B en tareas de resolucion de issues y edicion multi-fichero, midiendo tasas de exito sobre DeepSWE u otros conjuntos similares.
- Analisis de fidelidad de decodificacion: comparar perplejidad a distintas longitudes de contexto (1K, 8K, 32K) para estudiar como se propaga el error de una cuantizacion de ~3 bpw tras la de-cuantizacion.
- Experimentos multimodales controlados: aprovechar los tensores de vision y el procesador originales para tareas image-text-to-text en entornos donde se prefiera un checkpoint BF16 verificado por hash frente a un GGUF.

## Benchmarks y rendimiento

| Benchmark | Este modelo (IQ3_XXS reconstruido a BF16) | BF16 original |
|---|---|---|
| DeepSWE v1.1 (exitos) | 36/113 (31,86 %) | 44/113 (38,94 %) |

| Prueba de paridad | Longitud | Brecha de perplejidad relativa |
|---|---|---|
| Paridad numerica muestreada | 1K | 0,224 % |
| Paridad numerica muestreada | 8K | 0,054 % |
| Paridad numerica muestreada | 32K | 0,0013 % |

La evaluacion DeepSWE se realizo con una unica pasada estocastica por variante, con prompts, presupuestos y criterios de correccion fijos, usando Claude Code. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio pesa 54,71 GB en 12 shards, por lo que se necesita al menos esa cantidad de memoria, mas overhead de activaciones y cache KV. El autor subraya que los requisitos son los de BF16, no los 10,1 GB del GGUF empaquetado.
- Configuracion probada: SGLang 0.5.22 con tensor parallelism TP4 sobre cuatro NVIDIA H100.
- GPU recomendadas: cuatro H100 para la configuracion TP4 documentada; en general, cualquier conjunto de GPUs de datacenter (H100, A100 80 GB) cuya memoria agregada supere los ~55 GB con margen para activaciones.
- GPU de consumo: no cabe en una sola GPU de consumo de 24 GB (RTX 4090) ni de 48 GB; requeriria multiples GPUs o bien usar el GGUF IQ3_XXS original de ~10,1 GB en su lugar.
- Opciones de despliegue: SGLang (verificado por el autor); otros runtimes que soporten la arquitectura Qwen3.5 y safetensors BF16, como vLLM o TGI, no estan verificados en la informacion disponible. llama.cpp y Ollama no aplican a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B GSQ-RCO IQ3_XXS a BF16) | 27,36 B | no disponible | safetensors BF16, 54,71 GB | Apache-2.0 | 31,86 % en DeepSWE v1.1 |
| Qwen/Qwen3.8-27B (BF16 original) | 27,36 B | no disponible | safetensors BF16 | Apache-2.0 | 38,94 % en DeepSWE v1.1 |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (IQ3_XXS) | 27,36 B | no disponible | GGUF, ~10,1 GB | Apache-2.0 | Fuente de la cuantizacion; ~3 bpw |

No se dispone de datos de benchmarks de terceros (otros modelos de 27B o de tareas agenticas comparables) en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion por cuantizacion: el checkpoint arrastra el error del IQ3_XXS original. La tasa de exito en DeepSWE cae del 38,94 % al 31,86 %, una diferencia de 7,08 puntos porcentuales en una unica pasada estocastica.
- Las pruebas de paridad numerica no garantizan salidas generadas identicas al BF16 original; solo acotan la desviacion de perplejidad en puntos muestreados.
- Coste de almacenamiento y memoria: 54,71 GB frente a los 10,1 GB del GGUF, lo que multiplica por mas de cinco los requisitos de disco y VRAM sin ganar calidad respecto al BF16 original.
- No es un modelo entrenado: no debe tratarse como una mejora ni como un fine-tune, sino como una reconstruccion de referencia para evaluacion.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue concreta a partir de la informacion disponible.
- Longitud de contexto no documentada en la model card.
- Riesgo de alucinacion y sesgos: no se aportan analisis especificos; deben asumirse los del modelo base Qwen3.8-27B, no documentados aqui.
- Requiere un runtime que soporte la arquitectura Qwen3.5; el autor recomienda fijar una revision del Hub para reproducibilidad y verificar los hashes con SHA256SUMS.
- La evaluacion DeepSWE usa una sola pasada por variante, por lo que la diferencia observada tiene incertidumbre estadistica no cuantificada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/the-sweater-cat/Qwen3.8-27B-GSQ-RCO-IQ3_XXS-BF16
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de origen (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de evaluacion DeepSWE: https://huggingface.co/datasets/the-sweater-cat/qwen38-27b-deepswe
- Ficheros de procedencia y paridad citados en la model card: provenance.json, conversion-record.json, conversion/parity-result.json, SHA256SUMS (dentro del repositorio del modelo)
