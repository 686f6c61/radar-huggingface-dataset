# vllm-project/TinyLlama-1.1B-Chat-v0.3-AWQ

## Resumen

TinyLlama-1.1B-Chat-v0.3-AWQ es una versión cuantizada a 4 bits mediante AWQ del modelo TinyLlama-1.1B-Chat-v0.3, un transformer decoder-only de tipo Llama con 1.100.060.672 parámetros (aproximadamente 1,1 mil millones). El modelo original fue creado por Zhang Peiyuan (PY007) como parte del proyecto TinyLlama, y esta variante AWQ fue producida por TheBloke y posteriormente replicada por el equipo de vLLM en su organización de HuggingFace para uso interno en sus pipelines de integración continua.

El propósito de esta ficha es documentar un checkpoint de inferencia optimizado para despliegue en GPUs de gama baja o consumer. La cuantización AWQ de 4 bits con grupo de escala 128 reduce el peso del repositorio a 0,77 GB, lo que permite servirlo con vLLM usando `--quantization awq` en entornos con recursos limitados. Es relevante ahora porque vLLM mantiene esta copia como dependencia de sus pruebas de CI, lo que garantiza su disponibilidad a largo plazo frente al riesgo de que el repositorio original en una cuenta personal desaparezca.

Se trata de un modelo exclusivamente en inglés, con licencia Apache 2.0, pensado para tareas de chat y generación de texto de propósito general. No es un modelo de frontera: su interés radica en su tamaño reducido, su facilidad de despliegue y su utilidad como banco de pruebas para infraestructura de serving (vLLM, TGI) más que como modelo de producción para tareas complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (model_type: tinyllama) |
| Parametros totales | 1.100.060.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (secuencia de calibracion AWQ: 2048) |
| Tipos de cuantizacion | AWQ 4 bits, grupo de escala 128 (128g); existen variantes GPTQ y GGUF de 2 a 8 bits en otros repositorios de TheBloke |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (sharded) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con la arquitectura Llama, identificado internamente como `tinyllama`. El modelo original TinyLlama-1.1B-Chat-v0.3 fue entrenado sobre una mezcla de datos que incluye cerebras/SlimPajama-627B (corpus web de propósito general), bigcode/starcoderdata (codigo fuente) y OpenAssistant/oasst_top1_2023-08-25 (datos de instrucciones y conversacion para el ajuste tipo chat). No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta variante concreta aplica cuantizacion AWQ (Activation-aware Weight Quantization) de 4 bits con grupo de escala de 128, calibrada sobre el dataset wikitext con longitud de secuencia 2048. AWQ preserva los pesos mas relevantes para la activacion y ofrece, segun la model card, inferencia mas rapida en Transformers que GPTQ, ademas de soporte en vLLM con batching continuo y en TGI (soporte preliminar para Llama desde el 25 de septiembre de 2023). El checkpoint es una copia exacta del repositorio de TheBloke en el commit `d87af94`, realizada el 30 de octubre de 2026 por el equipo de vLLM.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla ChatML (`<|im_start|>system ... <|im_end|>`).
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo.
- Generacion de codigo a nivel introductorio, gracias a la inclusion de starcoderdata en el entrenamiento.
- Respuestas de conocimiento general y tareas de resumen o reescritura de texto corto.
- Soporte de tool calling / function calling: no disponible de forma nativa en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no esta disenado para ello.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Pruebas de integracion continua de vLLM: este checkpoint se usa en los pipelines de CI de vLLM para validar el camino de cuantizacion AWQ; cualquier equipo que contribuya a vLLM puede replicar esas pruebas localmente con el mismo checkpoint.
- Despliegue en GPUs consumer para prototipos: con 0,77 GB de pesos en 4 bits, cabe en GPUs de 4-8 GB de VRAM, lo que permite levantar un endpoint de chat en un portatil con GPU discreta para demos y validacion de producto.
- Servicio de chat de bajo coste en CPU/GPU mixto: util para entornos de desarrollo o staging donde no se justifica una GPU de datacenter, usando vLLM con `--quantization awq` o llama.cpp con la variante GGUF.
- Benchmarking de infraestructura: sirve como carga ligera y reproducible para medir throughput y latencia de servidores de inferencia (vLLM, TGI) antes de escalar a modelos mayores con la misma pila.
- Generacion de texto auxiliar en ingles: resumenes cortos, clasificacion de texto o reescritura en pipelines donde el coste por token es critico y la calidad no requiere un modelo grande.
- Educacion y experimentacion: estudio practico de cuantizacion AWQ, comparacion con GPTQ y GGUF, y analisis del impacto de la cuantizacion en la perplejidad sobre wikitext.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,5 GB para los pesos en 4 bits, mas la memoria de activaciones y cache KV, que depende de la longitud de contexto y del tamano de lote; en la practica, un servidor vLLM con este modelo funciona holgadamente en GPUs de 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas consumer como RTX 3050, RTX 3060, RTX 4060 o superiores son suficientes. En GPUs de datacenter (A100, H100) el modelo esta sobredimensionado en capacidad y solo tiene sentido como prueba de infraestructura.
- Cabe en GPU consumer: si, en practicamente todas las GPU discretas modernas con 4 GB o mas.
- Opciones de despliegue: vLLM con `--quantization awq --dtype half` (soporte nativo de batching continuo), TGI (soporte preliminar AWQ para Llama desde septiembre de 2023), y llama.cpp/Ollama mediante la variante GGUF publicada por TheBloke.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. La model card senala que, con AWQ, el throughput global sigue siendo inferior al de modelos sin cuantizar en vLLM o TGI, pero permite usar GPUs mucho mas pequenas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v0.3-AWQ (este) | 1,1 B | no disponible | AWQ 4 bits, 128g | Apache 2.0 | HuggingFace (vllm-project y TheBloke) |
| TinyLlama-1.1B-Chat-v0.3 (original fp16) | 1,1 B | no disponible | ninguna (fp16) | Apache 2.0 | HuggingFace (PY007) |
| TinyLlama-1.1B-Chat-v0.3-GGUF | 1,1 B | no disponible | GGUF 2-8 bits | Apache 2.0 | HuggingFace (TheBloke) |
| TinyLlama-1.1B-Chat-v0.3-GPTQ | 1,1 B | no disponible | GPTQ | Apache 2.0 | HuggingFace (TheBloke) |

Las alternativas comparables directas son las otras variantes de cuantizacion del mismo modelo base; no se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre SlimPajama (corpus web), puede reproducir sesgos presentes en datos de internet; no se documentan evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion: alto para un modelo de 1,1 B; no debe usarse como fuente de verdad en dominios facticos sin verificacion externa.
- Limitaciones de contexto e idioma: solo ingles; la longitud de contexto no esta documentada en la informacion proporcionada. La cuantizacion AWQ puede degradar ligeramente la calidad respecto al modelo fp16 original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Caveats para produccion: el throughput con AWQ es inferior al de modelos sin cuantizar en vLLM/TGI; el checkpoint es una copia de CI de vLLM y no un artefacto con soporte oficial del autor original; la calidad del modelo es propia de un 1,1 B y no es adecuada para tareas de razonamiento complejo o agentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vllm-project/TinyLlama-1.1B-Chat-v0.3-AWQ
- Repositorio original AWQ de TheBloke: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v0.3-AWQ
- Modelo base original: https://huggingface.co/PY007/TinyLlama-1.1B-Chat-v0.3
- Variante GPTQ: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v0.3-GPTQ
- Variante GGUF: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v0.3-GGUF
- Documentacion de vLLM: https://vllm.readthedocs.io/en/latest/
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Dataset SlimPajama-627B: https://huggingface.co/datasets/cerebras/SlimPajama-627B
- Dataset starcoderdata: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset OpenAssistant oasst_top1: https://huggingface.co/datasets/OpenAssistant/oasst_top1_2023-08-25
- Dataset wikitext (calibracion AWQ): https://huggingface.co/datasets/wikitext
