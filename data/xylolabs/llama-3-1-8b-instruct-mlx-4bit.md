# Xylolabs/Llama-3.1-8B-Instruct-MLX-4bit

## Resumen

Llama-3.1-8B-Instruct-MLX-4bit es una conversion al framework MLX del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs. Se trata de una cuantizacion afina (affine quantization) de 4 bits con group size 64, disenada especificamente para ejecutarse en hardware Apple Silicon mediante la libreria mlx-lm. El modelo conserva la arquitectura y los pesos del Llama 3.1 Instruct original, pero reduce el espacio en disco y memoria a 4,64 GB frente a los aproximadamente 16 GB del modelo en BF16.

El proposito de esta publicacion es facilitar el despliegue local de un modelo de 8.030.261.248 parametros en equipos Mac con memoria unificada, manteniendo una calidad de generacion cercana al modelo original. La model card reporta una divergencia KL media de 0,055536 frente a BF16 en WikiText-2 y una coincidencia top-1 del 88,60 %, con un rendimiento identico al BF16 en la prueba cualitativa de 7 preguntas (6/7 en ambos casos).

Es relevante para desarrolladores que trabajan en entornos macOS y necesitan un modelo conversacional multilingue con capacidad de instrucciones, sin depender de GPUs dedicadas ni de servicios en la nube. La licencia es la Llama 3.1 Community License, con su correspondiente politica de uso aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizacion afina MLX |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (segun tabla de hardware de la model card) |
| Tipos de cuantizacion | 4 bits (group size 64, escalas y sesgos en float16); capas `mlp.down_proj` y `self_attn.v_proj` de las capas 0-3 y 28-31 en 6 bits; normas en float16 |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.248 parametros y capacidad de contexto de hasta 128K tokens. No se ha reentrenado ni ajustado: la publicacion de Xylolabs es exclusivamente una conversion de formato y una cuantizacion de los pesos originales de meta-llama/Llama-3.1-8B-Instruct. Por tanto, las caracteristicas de entrenamiento (datos, RLHF, DPO) son las del modelo original de Meta, no se detallan en la informacion proporcionada.

La innovacion tecnica de esta version reside en el esquema de cuantizacion: cuantizacion afina con group size 64, escalas y sesgos almacenados en float16, y una politica mixta que mantiene en 6 bits las proyecciones `mlp.down_proj` y `self_attn.v_proj` de las cuatro primeras y las cuatro ultimas capas, mientras el resto de capas lineales, el embedding de tokens y la LM head quedan en 4 bits. Las capas de normalizacion se conservan en float16. Esta estrategia busca preservar la calidad en las capas mas sensibles sin renunciar a la reduccion de memoria.

## Capacidades

- Generacion de texto conversacional e instrucciones multi-turno, heredadas del Llama 3.1 Instruct original.
- Razonamiento general y respuesta a preguntas.
- Generacion de codigo y matematicas (capacidades del modelo base; no se aportan benchmarks especificos en la informacion disponible).
- Soporte multilingue para ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Ejecucion local en Apple Silicon mediante `mlx-lm` (comandos `mlx_lm.generate` y `mlx_lm.chat`).
- Capacidad de contexto largo de hasta 128K tokens segun la tabla de hardware de la model card.
- No se documenta en la informacion proporcionada soporte explicito de tool calling, function calling, agentes, vision ni audio para esta conversion concreta; estas capacidades dependerian del modelo base y de la integracion concreta.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede gestionar dialogos multi-turno en un Mac con memoria unificada, usando `mlx_lm.chat`, sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Procesamiento de documentos largos: con hasta 128K tokens de contexto, permite resumir o extraer informacion de contratos, informes o articulos extensos en una sola pasada, siempre que la memoria del equipo lo permita.
- Generacion de codigo en flujos de trabajo locales: util para autocompletar, explicar o refactorizar codigo dentro de editores y scripts que invoquen `mlx-lm`, aprovechando la naturaleza instruct del modelo base.
- Prototipado rapido de aplicaciones de IA en Apple Silicon: al ocupar 4,64 GB, permite iterar en un portatil o Mac Studio sin GPU dedicada, reduciendo el coste de experimentacion frente a alternativas en la nube.
- Atencion al cliente automatizada en espanol y otros idiomas soportados: el modelo puede mantener conversaciones multi-turno con contexto amplio, adecuado para bots internos o demos en entornos controlados.
- Traduccion y adaptacion de contenido entre los ocho idiomas declarados: util para tareas de localizacion asistida donde se requiera un modelo local y de baja latencia en hardware Apple.
- Educacion y tutoria: generacion de explicaciones y respuestas a preguntas tecnicas en local, apropiado para entornos sin conectividad o con restricciones de soberania de datos.

## Benchmarks y rendimiento

La model card proporciona metricas de fidelidad de la cuantizacion frente a BF16, no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | MLX 8-bit | MLX 4-bit |
|---|---:|---:|
| Tamano | 8,53 GB | 4,64 GB |
| WikiText-2 KL | 0,000373 | 0,055536 |
| WikiText-2 top-1 | 99,15 % | 88,60 % |
| Chat KL | 0,000300 | 0,049479 |
| Chat top-1 | 99,02 % | 88,90 % |
| Held-out KL | 0,000483 | 0,076341 |
| Held-out top-1 | 98,59 % | 85,08 % |
| Prueba de 7 preguntas | 6/7 (BF16: 6/7) | 6/7 (BF16: 6/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 4,64 GB para los pesos en 4 bits; el consumo real de memoria unificada debe sumar la cache KV para el contexto utilizado.
- Hardware objetivo: Apple Silicon con memoria unificada. La model card incluye una tabla de recomendaciones que, para esta variante de 4 bits, apunta a equipos como Mac Studio M5 Max (32 o 40 nucleos de GPU) y M5 Ultra, con contextos de 122K a 128K segun la memoria disponible.
- No cabe en GPUs NVIDIA convencionales mediante MLX; para CUDA serian necesarias otras conversiones (GGUF, AWQ, etc.), no incluidas en esta publicacion.
- Opciones de despliegue: `mlx-lm` version 0.32.2 (comandos `mlx_lm.generate` y `mlx_lm.chat`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---:|---:|---|---|---|
| Xylolabs/Llama-3.1-8B-Instruct-MLX-4bit | 8,03B | 128K | 4 bits (mixta 4/6 bits) | Llama 3.1 Community | safetensors (MLX) |
| Xylolabs/Llama-3.1-8B-Instruct-MLX-8bit | 8,03B | 128K | 8 bits | Llama 3.1 Community | safetensors (MLX) |
| meta-llama/Llama-3.1-8B-Instruct (BF16) | 8,03B | 128K | Sin cuantizar | Llama 3.1 Community | safetensors |

La comparativa se limita a las variantes del mismo modelo base referenciadas en la model card; no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce una perdida de fidelidad medible: KL de 0,055536 en WikiText-2 y coincidencia top-1 del 88,60 %, frente al 99,15 % de la variante de 8 bits. Para tareas sensibles a la precision, conviene evaluar la variante de 8 bits.
- El modelo hereda los sesgos y riesgos de alucinacion del Llama 3.1 Instruct original; no se documentan evaluaciones de sesgo especificas para esta conversion.
- El rendimiento multilingue puede variar entre los ocho idiomas declarados; la model card no aporta evaluaciones por idioma.
- Restricciones de licencia: Llama 3.1 Community License, con politica de uso aceptable en `USE_POLICY.md`. Es obligatorio revisar ambas antes de un uso comercial.
- El formato MLX limita el despliegue a hardware Apple Silicon y a la libreria `mlx-lm`; no es portable directamente a CUDA ni a otros runtimes sin reconversion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-11-26; conviene verificar la vigencia y el soporte del autor antes de usarlo en produccion.
- No se documentan capacidades de tool calling, agentes ni vision para esta conversion; no deben asumirse sin verificacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
