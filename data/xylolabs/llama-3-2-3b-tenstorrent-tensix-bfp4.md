# Xylolabs/Llama-3.2-3B-Tenstorrent-Tensix-BFP4

## Resumen
Llama-3.2-3B-Tenstorrent-Tensix-BFP4 es una versión cuantizada del modelo meta-llama/Llama-3.2-3B, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer decoder-only de Llama 3.2 3B (3.212.749.824 parámetros) pero sustituye las proyecciones de atención y MLP por matrices cuantizadas en formato `bfloat4_b` (BFP4, block floating point de 4,5 bits por peso), manteniendo en bf16 la LM head, el embedding y las normas.

La relevancia de esta ficha no reside en el modelo base, ampliamente conocido, sino en el pipeline de cuantización: es una de las pocas publicaciones que documenta con métricas de fidelidad (KL medio frente a bf16, coincidencia top-1, tasa de respuestas correctas) una cuantización de 4 bits pensada para el stack `tt-metal`/`ttnn` de Tenstorrent. El resultado empaquetado ocupa 2,374 GB frente a los 6,42 GB en bf16, con un coste medio de 5,91 bits por peso.

Se trata de un modelo base (no instruct), sin plantilla de chat, distribuido bajo licencia Llama 3.2 y con soporte declarado de inglés y coreano. Su interés práctico es acotado: sirve para desplegar Llama 3.2 3B en hardware Tensix con requisitos de memoria reducidos, no como sustituto general del modelo original en GPU convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), pesos cuantizados para Tensix |
| Parámetros totales | 3.212.749.824 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (`bfloat4_b`, 4,5 bits/peso) en proyecciones de atención y MLP; bf16 en LM head, embedding y normas; media de 5,91 bits/peso |
| Idiomas soportados | en, ko |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla BFP4); empaquetado nativo vía TT-NN |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Llama 3.2 3B: 28 capas transformer con atención multi-cabeza agrupada (GQA) y bloques MLP con compuertas SwiGLU. La modificación introducida por Xylolabs afecta exclusivamente a los pesos: las proyecciones q, k, v, o y gate, up, down de las 28 capas se cuantizan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, mientras que la LM head (atada al embedding), el embedding y las normas permanecen en bf16. El archivo `quant4.json` del repositorio especifica el formato asignado a cada proyección.

La calibración de GPTQ se realizó sobre 262.144 tokens de WikiText-2 y Wikipedia en coreano, con un 45 % de contenido en inglés. No se realiza ningún entrenamiento adicional ni ajuste fino: es una compresión post-entrenamiento del checkpoint base. Los pesos cuantizados se almacenan como valores bf16 situados sobre la rejilla del formato, de modo que TT-NN los empaqueta sin alterar su valor; las herramientas `tools/pack_tensix.py` y `tools/verify_grid.py` (de tensix-bfp-gptq v0.1.0) permiten verificar el empaquetado y la integridad de la rejilla, y según la model card se ejecutaron sobre `ttsim` con ttnn 0.81.1 con resultado correcto para todas las matrices.

## Capacidades
- Generación de texto autoregresiva y continuación de texto (modelo base, sin plantilla de chat).
- Razonamiento y conocimiento general heredados de Llama 3.2 3B, con la degradación propia de una cuantización de 4,5 bits.
- Soporte de inglés y coreano en la calibración y en la evaluación declarada.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante el stack `tt-metal`/`ttnn`.
- Compatibilidad de carga con `transformers` en bf16 para inspección o evaluación en host (los pesos se leen como bf16 sobre la rejilla cuantizada).
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso
- Despliegue en aceleradores Tenstorrent: el caso principal; permite servir Llama 3.2 3B en tarjetas Wormhole o Blackhole con un peso empaquetado de 2,374 GB, liberando DRAM del dispositivo frente a los 6,42 GB en bf16.
- Evaluación de pipelines de cuantización: sirve como referencia reproducible para validar GPTQ con búsqueda de exponente y el formato `bfloat4_b` frente a alternativas como Q4_K_M de llama.cpp, usando las métricas de KL y top-1 publicadas.
- Generación de texto en inglés en entornos con memoria limitada: continuación de documentos, resúmenes o completado de plantillas donde no se requiere modo conversacional.
- Procesamiento de texto en coreano: la calibración incluye Wikipedia en coreano, por lo que el modelo es adecuado para tareas de generación en ese idioma dentro de las limitaciones de un modelo base de 3B.
- Verificación de integridad de pesos en CI: las herramientas `pack_tensix.py` y `verify_grid.py` permiten incorporar comprobaciones automáticas de empaquetado y rejilla en pipelines de publicación de modelos cuantizados.
- Investigación sobre compresión post-entrenamiento: comparación controlada del impacto de BFP4 frente a BFP8 y Q4_K_M sobre el mismo checkpoint, con métricas de divergencia KL y coincidencia top-1.
- Prototipado en host con `transformers`: carga en bf16 con `device_map="auto"` para inspeccionar salidas antes de empaquetar y desplegar en Tensix.

## Benchmarks y rendimiento

| Pesos | Bits/peso | Tamaño (GB) | KL medio vs bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precisión |
|---|---:|---:|---:|---:|---:|---:|---|
| bf16 (original) | 16,00 | 6,42 | 0 | 100 | 20/33 | - | - |
| BFP8 | 9,42 | 3,783 | 0,0009 | 98,31 | 20/33 | 0 | pasado (0,03× KL) |
| BFP4 (este modelo) | 5,91 | 2,374 | 0,0440 | 88,82 | 20/33 | 0 | pasado (1,34× KL) |
| Q4_K_M (llama.cpp) | 5,01 | 2,019 | 0,0327 | 89,93 | 19/33 | 0 | referencia |

Todas las cifras son evaluaciones en host de los pesos, no mediciones en dispositivo; la model card no reporta velocidad ni throughput. El KL medio se calcula sobre distribuciones de siguiente token en textos fijos en inglés y coreano; top-1 mide la coincidencia con el modelo bf16. La prueba de respuestas usa 33 prompts con respuesta conocida más 7 con modo thinking (40 en total). El chequeo de precisión se supera perdiendo como máximo un elemento más que bf16; BFP4 no pierde ninguno.

## Requisitos de hardware
- VRAM estimada en host: aproximadamente 6,4 GB para cargar los pesos como bf16 con `transformers` (tamaño del repo); en Tensix, 2,374 GB empaquetados en DRAM del dispositivo.
- GPU recomendadas para uso en host: cualquier GPU con al menos 8 GB de VRAM para inferencia en bf16 (RTX 3060 Ti/4060 Ti, RTX 4090, A100, H100); no es el entorno objetivo.
- Hardware objetivo: aceleradores Tenstorrent Tensix Wormhole y Blackhole, con el stack `tt-metal`/`ttnn` (verificado con ttnn 0.81.1 sobre `ttsim`).
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 8 GB o más; el formato BFP4 solo es aprovechable nativamente en Tensix.
- Opciones de despliegue: `transformers` (host, bf16), TT-NN con `tensix-runner` v0.1.0 y `tensix-kernels` v0.1.0 (Tensix); no se mencionan vLLM, TGI, llama.cpp ni Ollama para este checkpoint.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KL vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.2-3B-Tenstorrent-Tensix-BFP4 | 3,21 B | no disponible | BFP4 (5,91 bits/peso) | 0,0440 | llama3.2 | Hugging Face |
| Llama-3.2-3B-Tenstorrent-Tensix-BFP8 | 3,21 B | no disponible | BFP8 (9,42 bits/peso) | 0,0009 | llama3.2 | Hugging Face |
| Llama-3.2-3B Q4_K_M (llama.cpp) | 3,21 B | no disponible | Q4_K_M (5,01 bits/peso) | 0,0327 | llama3.2 | Hugging Face / GGUF |
| meta-llama/Llama-3.2-3B (bf16) | 3,21 B | no disponible | ninguna (16 bits/peso) | 0 | llama3.2 | Hugging Face |

La comparación relevante es interna al mismo checkpoint: BFP4 sacrifica fidelidad frente a BFP8 y Q4_K_M (KL 1,34× y 1,35× respectivamente) a cambio de un tamaño menor que BFP8 y una ventaja de velocidad potencial en Tensix que no se cuantifica en la documentación.

## Limitaciones y advertencias
- Es un modelo base: no incluye plantilla de chat ni ajuste por instrucciones; no debe usarse directamente como asistente conversacional.
- La cuantización BFP4 degrada la fidelidad respecto a bf16 (KL medio 0,0440 frente a 0,0009 en BFP8) y reduce la coincidencia top-1 al 88,82 %; esperable un aumento de errores en tareas sensibles a la distribución de probabilidad.
- El formato `bfloat4_b` solo se aprovecha nativamente en hardware Tensix; en GPU convencionales los pesos se cargan como bf16 sin ganancia de memoria ni velocidad.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está evaluado y no debe asumirse.
- No se han publicado mediciones de latencia ni throughput en dispositivo; las cifras de rendimiento son evaluaciones en host.
- Riesgo de alucinación y sesgos heredados del modelo base Llama 3.2 3B, no mitigados en esta publicación.
- Licencia Llama 3.2: el uso comercial está sujeto a los términos de la licencia de Meta, incluida la política de uso aceptable y los requisitos de atribución ("Built with Llama").
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros independientes.
- La fecha de creación del repositorio (2026-11-17) debe verificarse antes de citar la ficha en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.2-3B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Versión BFP8: https://huggingface.co/Xylolabs/Llama-3.2-3B-Tenstorrent-Tensix-BFP8
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Llama-3.2-3B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
