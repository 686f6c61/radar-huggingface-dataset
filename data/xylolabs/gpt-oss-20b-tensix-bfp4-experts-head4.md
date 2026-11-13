# Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts-Head4

## Resumen

Este repositorio contiene una versión cuantizada de `openai/gpt-oss-20b`, el modelo de lenguaje abierto de OpenAI con arquitectura Mixture-of-Experts (MoE) y aproximadamente 20.900 millones de parámetros totales. La cuantización la ha realizado Xylolabs mediante GPTQ con búsqueda de exponente por bloque, orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole), usando los formatos de bloque `bfloat4_b` y `bfloat8_b` que empaqueta directamente TT-NN.

El objetivo es reducir la huella de memoria del modelo para que quepa en aceleradores Tensix: los pesos del modelo de lenguaje ocupan unos 12,93 GB empaquetados, con una media de 4,95 bits por peso. Los expertos enrutados y la cabeza LM se almacenan en BFP4 (4,5 bits por peso), mientras que las proyecciones de atención se guardan en BFP8 (8,5 bits por peso) y el resto de tensores permanecen en bf16.

Es relevante porque ofrece una ruta concreta para ejecutar un MoE de 20B en hardware no convencional (Tensix) manteniendo los valores en la rejilla de bloque correcta, algo que los formatos de cuantización estándar para GPU no garantizan. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) heredada de `openai/gpt-oss-20b`; pesos cuantizados en formatos de bloque BFP4/BFP8 para Tensix |
| Parámetros totales | 20.914.757.184 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`, 4,5 bits/peso) en expertos enrutados y LM head; BFP8 (`bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o; bf16 en router, embeddings y normas; media de 4,95 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores bf16 sobre rejilla BFP4/BFP8), configurado para `transformers` y empaquetable en TT-NN |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas MoE (24 capas según la model card) de OpenAI. Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento. Los expertos enrutados (gate, up, down) se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, calibrado con 65.536 tokens de WikiText-2 y Wikipedia en coreano; cada experto tiene su propia matriz de Hessian y bloques de 16 a lo largo de las entradas. Si un experto recibe pocos tokens de calibración, se recurre a redondeo al más cercano. La atención se cuantiza a BFP8 por redondeo al más cercano, y la cabeza LM a BFP4 por redondeo al más cercano con búsqueda de exponente, sin GPTQ.

La innovación técnica clave es el almacenamiento de las matrices cuantizadas como valores bf16 situados sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores. Los expertos se guardan con orientación `[experts, input, output]` y bloques a lo largo de las entradas (K); cualquier operador de ejecución debe respetar esa orientación en la multiplicación. El `config.json` elimina la configuración MXFP4 original porque los pesos ya están decodificados a bf16 sobre sus rejillas declaradas.

## Capacidades

- Generación de texto conversacional, heredada del modelo base `openai/gpt-oss-20b`.
- Razonamiento y matemáticas: capacidades del modelo original, no reevaluadas en esta ficha.
- Generación de código: capacidades del modelo original, no reevaluadas en esta ficha.
- Tool calling / function calling: no documentado específicamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente en la información disponible.
- Capacidades multilingües: no disponibles; la calibración incluyó coreano, pero no se declaran idiomas soportados.
- Capacidad especial: ejecución sobre NPU Tensix (Wormhole, Blackhole) mediante TT-NN y TT-Forge, con empaquetado exacto de los formatos de bloque.

## Casos de uso

- Despliegue en NPU Tensix: empaquetar los pesos con TT-NN en Wormhole o Blackhole para servir el modelo de lenguaje en aceleradores Tenstorrent, aprovechando que los tensores ya están en la rejilla BFP correcta y no requieren recuantización.
- Investigación en cuantización de bloque: usar el checkpoint como referencia para estudiar el impacto de BFP4 con GPTQ y búsqueda de exponente por bloque frente a redondeo al más cercano en expertos MoE.
- Evaluación de fidelidad numérica: emplear los scripts `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado no altera ningún valor, útil en pipelines de validación de hardware.
- Prototipado en simulador: ejecutar el modelo en `ttsim`, el simulador de Blackhole, para desarrollar kernels u operadores antes de disponer de silicio.
- Generación de texto conversacional en entornos con memoria limitada: los 12,93 GB de pesos permiten alojar el modelo en dispositivos con DRAM ajustada, dejando espacio para caché KV y buffers.
- Base para experimentos de inferencia comparada: contrastar la calidad (KL respecto a BF16, top-1) de esta cuantización frente a otras variantes del mismo modelo base en tareas de generación.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación que compara bits por peso, tamaño y métricas de fidelidad (KL medio respecto a BF16, top-1, respuestas correctas y pérdidas), pero el contenido proporcionado está truncado y no permite extraer los valores numéricos. Por tanto:

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: aproximadamente 12,93 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- GPU: no es el objetivo principal; el checkpoint está orientado a NPU Tensix. Puede cargarse en `transformers` con `device_map="auto"` en bf16, pero el repo ocupa 41,9 GB.
- Consumer GPU: no confirmado; la carga en `transformers` en bf16 requeriría memoria muy superior a la de una GPU de consumo típica, y no se documenta una ruta GGUF.
- Despliegue en Tensix: TT-NN 0.81.1 probado en `ttsim` (simulador Blackhole). El demo de gpt-oss de tt-metal v0.81.1 requiere cuatro chips Blackhole (QuietBox 2) o Wormhole LoudBox y Galaxy; no funciona en un solo chip.
- TT-Forge (tt-xla): no probado con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts-Head4 | 20,9B | no disponible | BFP4/BFP8 para Tensix | Apache-2.0 | Hugging Face, 0 descargas |
| openai/gpt-oss-20b (base) | 20,9B | no disponible | MXFP4 original | Apache-2.0 | Hugging Face |
| Otras variantes cuantizadas de gpt-oss-20b | 20,9B | no disponible | GGUF/AWQ/GPTQ para GPU | según variante | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP4 en expertos y cabeza LM introduce pérdida de precisión; la model card reporta métricas de KL y top-1 frente a BF16, pero no se han podido extraer los valores.
- La orientación de los expertos (`[experts, input, output]` con bloques en K) exige que el operador de ejecución use la orientación de multiplicación correcta; un uso incorrecto invalida los resultados.
- El demo de tt-metal v0.81.1 empaqueta los expertos con bloques en las salidas, por lo que recuantiza entre el 7 % y el 54 % de los valores de los expertos (medido en la capa 0); no se ha ejecutado más allá con este checkpoint.
- No probado con TT-Forge (tt-xla).
- El demo oficial requiere varios chips (cuatro Blackhole o LoudBox/Galaxy en Wormhole); no cabe en un solo chip Tensix.
- Idiomas soportados no declarados; sesgos del modelo base no documentados en esta ficha.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de esta cuantización en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del modelo base de OpenAI por si añaden condiciones adicionales.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tensix-BFP4-Experts-Head4
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo gpt-oss en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gpt_oss
- Paper referenciado (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
