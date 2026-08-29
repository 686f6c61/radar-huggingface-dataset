# spiritfather/Qwen3.8-Flash-Next-heretic-2-GGUF

## Resumen

Qwen3.8-Flash-Next-heretic-2-GGUF es un paquete de cuantizaciones GGUF del modelo Qwen3.8-Flash-Next-heretic-2, una variante "decensurada" (abliterated) del Qwen3.8-Flash-Next de Qwen, producida por trohrbaugh mediante una bifurcación personalizada de la herramienta Heretic. El repositorio de spiritfather reempaqueta los pesos en formato GGUF para su uso con llama.cpp, e incluye por primera vez el cabezal MTP/NextN de decodificación especulativa del modelo, que la mayoría de cuantizaciones de Flash-Next descartan.

El modelo base, Qwen3.8-Flash-Next, es un MoE multimodal de nueva generación con arquitectura `qwen4exp`, 176.9 mil millones de parámetros totales (125B principales más 51B de embeddings n-grama), 6B activos por token y una ventana de contexto nativa de 262.144 tokens. Soporta entrada de imagen y texto, razonamiento avanzado con modo "thinking" y supera a Claude-4.6-Opus (Max) en tareas de codificación y ofimática según Qwen. La variante heretic reduce las negativas de 99/100 a 0/100 con una divergencia KL de 0.0818, la más baja entre las versiones heretic de Flash-Next en el momento de su publicación.

Este repositorio es relevante para desarrolladores que necesitan un modelo de gran tamaño, multimodal y sin filtros de seguridad, con cuantizaciones listas para producción y soporte de decodificación especulativa, aunque requiere hardware de gama alta y una versión reciente de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE con embeddings n-grama) |
| Parametros totales | 176.943.899.520 (125B principales + 51B n-grama) |
| Parametros activos | 6B por token (documentacion oficial de Qwen; la model card del repo indica ~3B) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (otra) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea la arquitectura `qwen4exp`, un MoE con 125B parámetros principales y 51B adicionales en una tabla de embeddings n-grama (per_layer_token_embd) que actúa como memoria de búsqueda. Se activan 6B parámetros por token, lo que reduce el coste de entrenamiento a aproximadamente 1/9 respecto a Qwen3.7-Plus. Incluye un cabezal MTP/NextN de 4B entrenado conjuntamente para decodificación especulativa. El modelo es multimodal (imagen-texto) y soporta razonamiento con esfuerzo configurable (xhigh, medium, low).

Sobre esta base, trohrbaugh aplicó Heretic v1.3.0+custom con dirección por capas para eliminar las negativas de seguridad (abliteration), logrando 0/100 refusals frente a 99/100 del modelo original, con una divergencia KL de 0.0818 respecto al base. Los datos de entrenamiento del modelo original no se detallan en la información disponible.

## Capacidades

- Generacion de texto, razonamiento y codigo con modo "thinking" activado por defecto (desactivable por peticion).
- Procesamiento multimodal de imagen a texto (pipeline `image-text-to-text`), con proyector de vision incluido en `mmproj/`.
- Decodificacion especulativa MTP/NextN mediante cabezal propio de 4B, incluido en el repositorio.
- Decensurado: no rechaza peticiones de contenido explicito, violento o controvertido (0/100 refusals).
- Ventana de contexto nativa de 262K tokens, con coste de memoria de ~21 KiB/token con KV cuantizado a q8_0.
- El modelo base soporta tool calling y agentes, aunque no se confirma explicitamente en esta version.
- Capacidades multilingues no documentadas en la informacion disponible.

## Casos de uso

- Generacion de ficcion y roleplay sin restricciones: el modelo no rechaza contenido adulto o controvertido, lo que lo hace adecuado para escritura creativa, juegos de rol y narrativa interactiva donde otros modelos aplican filtros. Su baja divergencia KL respecto al base preserva la calidad de prosa.
- Asistente de codigo con contexto largo: con 262K tokens de ventana, puede analizar repositorios completos, generar parches y refactorizar modulos extensos en una sola pasada, superando a Claude-4.6-Opus en tareas de codificacion segun Qwen.
- Analisis de documentos con imagenes: al ser multimodal, puede extraer informacion de capturas, diagramas y documentos escaneados, combinando vision y razonamiento en un unico flujo.
- Agentes autonomos con razonamiento multi-paso: el modo thinking y el soporte de tool calling del modelo base permiten construir agentes que planifican, ejecutan herramientas y verifican resultados, con contexto suficiente para mantener estado largo.
- Servicio de inferencia local de alta capacidad: las cuantizaciones Q4_K_M y Q5_K_M permiten desplegar el modelo en estaciones de trabajo con 2-4 GPUs de 48-80 GB, usando llama.cpp con `llama-server` y API compatible con OpenAI.
- Investigacion en alineacion y seguridad: al ser una version abliterated con KL baja, sirve como caso de estudio para medir el impacto de la decensuracion en la calidad generativa y el comportamiento de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El repositorio referencia CaliperBench, un benchmark de escritura creativa que evalua prosa, roleplay y disposicion, pero no se incluyen puntuaciones concretas. La model card reporta perplejidad (PPL) en wikitext-2 (ctx 512) para cada cuantizacion, comparada contra el Q8_0 de referencia:

| Quant | PPL (wikitext-2, ctx 512) | KLD vs Q8_0 |
|---|---:|---:|
| Q4_K_M | 3.635241 ± 0.045789 | 0.036144 ± 0.000587 |
| Q5_K_M | 3.642467 ± 0.045911 | 0.022276 ± 0.000373 |
| Q6_K | 3.619753 ± 0.045509 | 0.014800 ± 0.000285 |
| Q8_0 | 3.616601 ± 0.045455 | 0.000000 ± 0.000000 |

## Requisitos de hardware

- VRAM estimada para el trunk (pesos principales) por cuantizacion: Q4_K_M 80.1 GiB, Q5_K_M 90.6 GiB, Q6_K 106.5 GiB, Q8_0 124.6 GiB. El tamano total en disco es mayor (130.8, 141.3, 157.1 y 175.3 GiB respectivamente).
- La tabla de embeddings n-grama (50.7 GiB en Q8_0) puede mantenerse en disco con `--tensor-read-lazy auto`, ahorrando ~47 GB de RAM residente sin coste de throughput.
- Contexto completo de 262K tokens con KV q8_0 ocupa ~5.5 GiB adicionales.
- GPU recomendadas: multiples A100 80GB, H100 80GB o RTX 4090 24GB en configuracion multi-GPU. No cabe en una sola GPU de consumo; requiere al menos 2-4 GPUs profesionales o una estacion con 256 GB de RAM unificada (Apple Silicon).
- Despliegue: llama.cpp (master, b10685+), `llama-server` con `--mmproj` para vision. El cabezal MTP requiere el PR #27836 de llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Refusals | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| Qwen3.8-Flash-Next (base) | 176.9B | 6B | 262K | 99/100 | qwen-community-1.0 | safetensors |
| Qwen3.8-Flash-Next-heretic-2 (este repo) | 176.9B | 6B | 262K | 0/100 | qwen-community-1.0 | GGUF |
| Qwen3.8-Flash-Next-GGUF (vcruz305) | 176.9B | 6B | 262K | 99/100 | qwen-community-1.0 | GGUF |

La diferencia principal frente al base y otras cuantizaciones es la decensuracion (0/100 refusals, KL 0.0818) y la inclusion del cabezal MTP. No se dispone de datos de rendimiento comparativo en benchmarks estandar.

## Limitaciones y advertencias

- Modelo decensurado: puede generar contenido explicito, violento, ofensivo o ilegal sin restricciones. No es adecuado para aplicaciones con requisitos de moderacion o cumplimiento normativo.
- Riesgo de alucinacion: al ser un modelo de gran tamano sin filtros, las respuestas incorrectas o inventadas pueden presentarse con alta confianza. Verificar salidas en entornos de produccion.
- La licencia qwen-community-1.0 es "other" y no se detalla en este repositorio; revisar los terminos en el enlace oficial antes de uso comercial.
- El cabezal MTP requiere una version de llama.cpp con el PR #27836, que puede no estar disponible en builds estables.
- Los idiomas soportados no estan documentados; el multilingueismo del modelo base no se confirma en esta version.
- Requiere hardware de gama alta (80-125 GiB de VRAM solo para el trunk); no es viable en GPUs de consumo sin multiples unidades.

## Enlaces

- Repositorio GGUF: https://huggingface.co/spiritfather/Qwen3.8-Flash-Next-heretic-2-GGUF
- Modelo base (heretic): https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Herramienta Heretic: https://github.com/p-e-w/heretic
- PR llama.cpp para MTP: https://github.com/ggml-org/llama.cpp/pull/27836
- PR llama.cpp para qwen4exp: https://github.com/ggml-org/llama.cpp/pull/27742
- CaliperBench: https://caliperbench.com
- Licencia qwen-community-1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
