# tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove40-GGUF

## Resumen

Jeesup-svd-safety-l3_swift_jbbcal2_remove40-GGUF es la version cuantizada en formato GGUF de un checkpoint derivado de Llama-3-8B-Instruct, publicado por el usuario tinyopsec. El modelo base es un experimento de compresion Swift-SVD que reduce el numero de parametros densos al 60% del original, seguido de una recuperacion mediante LoRA. Este repositorio no contiene un modelo nuevo entrenado desde cero, sino la conversion a GGUF de ese artefacto de investigacion, generada con llama.cpp.

El modelo tiene 8.030.261.248 parametros totales segun los safetensors del modelo base, lo que lo situa en la categoria de 8B. La relevancia practica es doble: por un lado, permite ejecutar en hardware de consumo un Llama-3-8B comprimido y cuantizado; por otro, sirve como caso de estudio sobre como la compresion SVD afecta a las capacidades de seguridad del modelo original.

El autor advierte explicitamente de que se trata de un artefacto de investigacion en el que varias variantes del grid estan deliberadamente degradadas en seguridad. No es un asistente de proposito general y debe evaluarse antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3-8B-Instruct), comprimido con Swift-SVD y recuperado con LoRA |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base es Llama-3-8B-Instruct, contexto nativo de 8192 tokens, aunque el repositorio no lo declara) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (llama3) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo Llama-3-8B-Instruct. Sobre ese checkpoint se aplico una compresion Swift-SVD que reduce los parametros densos al 60%, seguida de una fase de recuperacion mediante LoRA para mitigar la perdida de capacidad. El nombre del modelo base (svd-safety-l3_swift_jbbcal2_remove40) sugiere un grid de experimentos en el que se elimina aproximadamente el 40% de los parametros y se varia la calibracion de seguridad (jbbcal2 apunta a JailbreakBench).

No se dispone de informacion sobre el numero de tokens de recuperacion, la composicion del dataset de LoRA, ni si hubo RLHF o DPO adicionales. La innovacion tecnica destacable es la propia pipeline de compresion: SVD sobre matrices de pesos seguida de recuperacion con adaptadores de bajo rango, lo que permite reducir el coste de inferencia manteniendo parte del rendimiento del modelo original. La cuantizacion GGUF anade una segunda capa de compresion (hasta 2 bits) para despliegue en CPU y GPU de consumo.

## Capacidades

- Generacion de texto conversacional, heredada de Llama-3-8B-Instruct.
- Razonamiento basico y respuesta a instrucciones, aunque degradados por la compresion SVD.
- Generacion de codigo y matematicas a nivel de un 8B, sin garantias tras la compresion.
- Soporte de tool calling y function calling heredado del formato de Llama-3 (no verificado en este checkpoint).
- Capacidades multilingues de Llama-3 (8 idiomas oficiales), aunque el repositorio no las declara.
- Sin vision, sin audio y sin modo thinking explicito.
- Capacidad de seguridad deliberadamente variable: el autor indica que varias variantes del grid estan degradadas en rechazo de peticiones daninas.

## Casos de uso

- Investigacion sobre compresion de modelos: comparar la calidad de las distintas cuantizaciones (Q2_K a F16) frente al Llama-3-8B original para medir la curva de degradacion por bits.
- Estudio de seguridad y alineamiento: analizar como la compresion SVD afecta a la tasa de rechazo de prompts daninos, usando el modelo como sujeto de evaluacion en benchmarks tipo JailbreakBench.
- Despliegue en hardware de consumo: ejecutar un 8B comprimido en GPU de 8-12 GB con Q4_K_M para prototipos de chat local sin conexion.
- Experimentos de destilacion y recuperacion: usar el checkpoint como punto de partida para LoRA adicionales o para validar tecnicas de recuperacion de capacidad.
- Generacion de texto offline en entornos con CPU: las variantes Q2_K y Q3_K permiten inferencia en portatiles sin GPU dedicada mediante llama.cpp.
- Docencia y demos de cuantizacion: ilustrar en clase o taller el impacto de cada nivel de cuantizacion en tamano, latencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,0-5,5 GB con Q4_K_M; unos 3,0-3,5 GB con Q2_K; unos 16-17 GB con F16 (tamano de fichero declarado de 16,1 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para F16 o lotes grandes.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB con Q4_K_M o superior; las variantes Q2_K y Q3_K caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Q4_K_M) | 8,03B (comprimido al 60%) | no disponible | GGUF | Llama 3 | Artefacto de investigacion con seguridad degradada |
| Llama-3-8B-Instruct | 8,03B | 8192 | safetensors, GGUF | Llama 3 | Referencia original, sin compresion SVD |
| Llama-3.1-8B-Instruct | 8,03B | 131072 | safetensors, GGUF | Llama 3.1 | Contexto mucho mayor y mejoras de calidad |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32768 | safetensors, GGUF | Apache 2.0 | Alternativa permisiva para uso comercial |

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo describe como artefacto de estudio, no como asistente de proposito general.
- Seguridad degradada de forma deliberada en varias variantes del grid; no debe usarse en produccion orientada a usuarios sin evaluacion de seguridad previa.
- La compresion SVD al 60% de parametros densos implica perdida de capacidad frente al Llama-3-8B-Instruct original, no cuantificada en el repositorio.
- Riesgo de alucinacion y de respuestas incoherentes, especialmente en cuantizaciones de 2 y 3 bits.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingue fiable.
- Licencia Llama 3 Community License: restricciones de uso comercial, obligacion de atribucion y clausulas de uso aceptable que se heredan del modelo original.
- El repositorio ocupa 77,6 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- No hay datos publicados de benchmarks, por lo que la calidad real frente al original es desconocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove40-GGUF
- Modelo base: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove40
- Llama-3-8B-Instruct (modelo de referencia): https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Llama 3: https://llama.meta.com/llama3/license/
