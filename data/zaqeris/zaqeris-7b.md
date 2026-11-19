# ZAQERIS/ZAQERIS-7B

## Resumen

ZAQERIS-7B es un modelo de lenguaje bilingue (arabe e ingles) orientado a generacion de codigo, razonamiento y uso de herramientas, publicado por el grupo de investigacion independiente ZAQERIS AI. Se distribuye como un checkpoint de 4 bits NF4 con doble cuantizacion (bitsandbytes), pensado para ejecutarse en GPUs de consumo con 8 GB de VRAM sin offloading a CPU. La arquitectura declarada es un transformer decoder-only de 27 bloques con `hidden_size = 3584`, `intermediate_size = 18432` y atencion GQA con ratio 28:4, sobre una base de la familia Qwen2.

La propuesta diferencial del modelo es su bajo requisito de memoria (carga en aproximadamente 4,99 GiB de VRAM segun el autor) combinado con un mecanismo de busqueda web integrado: el modelo emite etiquetas `<search>consulta</search>` cuando detecta preguntas sobre informacion en tiempo real o posterior a su fecha de corte, y declina responder si la busqueda no esta disponible. El tokenizador es un BPE estandar de 151.936 tokens, lo que facilita la cobertura de arabe, ingles y codigo.

El modelo se publica bajo licencia Apache 2.0 y esta etiquetado como compatible con endpoints de Hugging Face. El repositorio ocupa 0,3 GB, coherente con un checkpoint cuantizado a 4 bits. No se han publicado resultados de benchmarks en la model card, que incluye un `model-index` con la lista de resultados vacia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2) con 27 bloques, `hidden_size = 3584`, `intermediate_size = 18432`, GQA 28:4 |
| Parametros totales | Clase 7B (cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (bitsandbytes); pesos distribuidos ya cuantizados |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer decoder-only de la familia Qwen2 con 27 capas, atencion con query grouping (GQA 28:4, es decir, 28 cabezas de query y 4 de key/value), `hidden_size` de 3584 e `intermediate_size` de 18432 en el bloque SwiGLU. El autor describe una serie de transformaciones estructurales sobre el checkpoint base, que denomina "cirugia arquitectonica": poda estructurada de canales intermedios SwiGLU por saliencia, permutacion de neuronas, transformaciones anisotropicas por cabeza en las proyecciones V/O compatibles con RoPE (108 cabezas independientes) y una rotacion ortogonal de gauge en la residual en FP32. Estas tecnicas buscan preservar la calidad tras reducir y reorganizar los pesos, aunque el autor no publica metricas que cuantifiquen la perdida respecto al modelo original.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card menciona entrenamiento especifico para el disparo de la herramienta `<search>` y para una politica de rechazo ante resultados de busqueda no disponibles ("anti-alucinacion offline"). El tokenizador es un BPE de 151.936 entradas, habitual en modelos Qwen, que cubre arabe, ingles y codigo. La distribucion se realiza ya cuantizada a 4 bits NF4 con doble cuantizacion, lo que condiciona el uso: no se ofrece el checkpoint en precision completa.

## Capacidades

- Generacion de texto conversacional en arabe e ingles, con formato de plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Generacion de codigo, con enfasis declarado en Python e ingenieria de software.
- Razonamiento paso a paso en ambos idiomas.
- Busqueda web integrada: emite `<search>consulta</search>` ante preguntas sobre hechos en tiempo real o posteriores a la fecha de corte.
- Politica de rechazo ante fallo de la herramienta de busqueda: el modelo declina adivinar en lugar de fabricar datos.
- Seguimiento de instrucciones bilingue con encuadre de identidad (se presenta como desarrollado por ZAQERIS AI).
- No se declara soporte de vision, audio, function calling generico ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de codigo en local para equipos con GPUs de 8 GB: el checkpoint 4-bit NF4 permite cargar el modelo en una RTX 5060 Laptop o similar y generar funciones Python sin conexion, con un throughput medido de 18,79 tok/s en tareas de programacion dinamica.
- Chat bilingue arabe-ingles en entornos con requisitos de soberania de datos: al ejecutarse en local y bajo Apache 2.0, encaja en despliegues donde no se permite enviar consultas a APIs externas.
- Agente con busqueda web acotada: el script `zaqeris_7b_chat_search.py` permite interceptar las etiquetas `<search>` y devolver resultados de un buscador, de modo que el modelo responda a preguntas de actualidad sin alucinar cuando la busqueda falla.
- Prototipado rapido de asistentes conversacionales: la plantilla ChatML y la integracion directa con `transformers` permiten montar un chatbot multi-turno en pocas lineas de codigo.
- Generacion de codigo en pipelines de desarrollo: util como autocompletado o generador de funciones en estaciones de trabajo con GPU modesta, sin depender de servicios en la nube.
- Educacion y tutoria en arabe: explicaciones paso a paso de conceptos de programacion y matematicas, con la salvedad de verificar calculos aritmeticos complejos.
- Evaluacion de tecnicas de compresion: el checkpoint sirve como caso de estudio de poda estructurada, permutacion de neuronas y rotaciones de gauge aplicadas a un modelo Qwen2 de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card contiene una lista de resultados vacia.

Los unicos datos de rendimiento declarados por el autor son de inferencia, no de calidad:

| Metrica | Valor | Condiciones |
|---|---|---|
| VRAM de carga | 4,992 GiB | RTX 5060 Laptop GPU, 8 GB, 4-bit NF4, sin offloading |
| Throughput de decodificacion | 14-19 tok/s | Kernels nativos de bitsandbytes 4-bit |
| Throughput en codigo Python (DP) | 18,79 tok/s | Tarea de programacion dinamica |

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,99 GiB en 4-bit NF4 con doble cuantizacion, segun la verificacion del autor en una RTX 5060 Laptop GPU de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Verificada en RTX 5060 Laptop; por capacidad de memoria son compatibles RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 5060 y superiores, asi como A100 y H100 con margen amplio.
- GPU de consumo: si, cabe en GPUs consumer de 8 GB o mas. No se ha verificado en GPUs de 6 GB ni en configuraciones con offloading.
- Despliegue: la via documentada es `transformers` con `bitsandbytes` y `accelerate` (`device_map="auto"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al distribuirse solo en 4-bit NF4 no hay pesos GGUF publicados.
- Latencia y throughput: 14-19 tok/s de decodificacion en la RTX 5060 Laptop; 18,79 tok/s en generacion de codigo Python. No se publican datos de latencia de prefill ni de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion distribuida | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| ZAQERIS-7B | Clase 7B | No disponible | 4-bit NF4 (bitsandbytes) | ar, en | Apache 2.0 | Busqueda web integrada via `<search>`; sin benchmarks publicados |
| Qwen2-7B | 7B | 131.072 tokens (Qwen2-7B-Instruct) | FP16/BF16, GGUF, AWQ, GPTQ | Multiidioma, con arabe | Apache 2.0 | Modelo base de referencia; benchmarks publicados por el autor original |
| Mistral-7B-Instruct | 7B | 32.768 tokens | FP16/BF16, GGUF, AWQ, GPTQ | Principalmente en, fr | Apache 2.0 | Amplio ecosistema de despliegue (vLLM, llama.cpp, Ollama) |
| Llama-3.1-8B-Instruct | 8B | 131.072 tokens | FP16/BF16, GGUF, AWQ, GPTQ | Multiidioma | Llama 3.1 Community License | Requiere aceptar licencia; no es Apache 2.0 |

La comparativa se limita a parametros, contexto, licencia y formato, ya que ZAQERIS-7B no publica resultados de benchmarks que permitan contrastar calidad. La diferencia practica mas relevante es la distribucion exclusiva en 4-bit NF4, que reduce el ecosistema de herramientas compatible frente a los formatos GGUF de las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas, por lo que la eleccion en produccion debe basarse en evaluacion propia.
- El autor advierte que los problemas aritmeticos de varios pasos pueden presentar varianza; es necesario verificar los calculos numericos criticos.
- Solo se distribuye en 4-bit NF4: no hay checkpoint en FP16/BF16 ni pesos GGUF, lo que limita el uso con llama.cpp, Ollama o vLLM y complica el ajuste fino.
- Idiomas declarados: arabe e ingles. No se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no especificada: no es posible planificar casos de uso con documentos largos sin medirla empiricamente.
- Las transformaciones arquitectonicas descritas (poda, permutacion de neuronas, rotaciones de gauge) no van acompanadas de metricas de degradacion, por lo que se desconoce la perdida de calidad respecto al checkpoint original.
- Riesgo de alucinacion en hechos: la politica anti-alucinacion solo cubre el escenario de fallo de la busqueda; fuera de ese caso persiste el riesgo habitual de un modelo de 7B.
- Sesgos: no se documenta ningun proceso de evaluacion de sesgos ni de alineacion mas alla del entrenamiento para la herramienta de busqueda.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen2 conviene revisar las obligaciones de atribucion del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion independiente de la comunidad.

## Enlaces

- [Hugging Face: ZAQERIS/ZAQERIS-7B](https://huggingface.co/ZAQERIS/ZAQERIS-7B)
- [Script de chat con busqueda: zaqeris_7b_chat_search.py](https://huggingface.co/ZAQERIS/ZAQERIS-7B/blob/main/zaqeris_7b_chat_search.py)
- [Licencia Apache 2.0](https://huggingface.co/ZAQERIS/ZAQERIS-7B/blob/main/LICENSE)
