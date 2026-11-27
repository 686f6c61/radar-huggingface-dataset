# Xylolabs/Hy4-GGUF

## Resumen

Hy4-GGUF es la coleccion de cuantizaciones GGUF del modelo multimodal tencent/Hy4, preparada por Xylolabs para su uso con llama.cpp. El modelo base es un transformer de tipo mixture-of-experts (MoE) de gran escala, con 769.907.408.797 parametros totales segun los pesos en safetensors, orientado a tareas de imagen-texto-a-texto (image-text-to-text). La relevancia de esta publicacion radica en que permite ejecutar un modelo de casi 770.000 millones de parametros en hardware de gama alta mediante cuantizacion agresiva, incluyendo opciones que caben en estaciones de trabajo con memoria unificada.

El repositorio ofrece cinco niveles de cuantizacion del modelo de texto (Q8_0, Q6_K, Q4_K_M, IQ3_S e IQ2_XXS), cada uno dividido en 13 partes, ademas de proyectores de vision en BF16 y Q8_0 y matrices de importancia (imatrix) para mejorar la precision de las cuantizaciones de baja profundidad de bits. El tamano total del repositorio es de 2477,3 GB.

La licencia es la Tencent Hy License, Version 1.0, una licencia propia del autor del modelo base que no es de codigo abierto estandar y que debe revisarse antes de cualquier uso comercial. Los idiomas declarados son ingles y chino. El soporte en llama.cpp depende de un pull request (#32517) que, en el momento de la publicacion, no estaba fusionado en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) |
| Parametros totales | 769.907.408.797 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1M tokens segun configuracion de hardware (512K en 512 GB unificados, 256K en 282-564 GB, 64K en 256 GB) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ3_S, IQ2_XXS; proyectores de vision en BF16 y Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (tencent-hy-license) |
| Formato de pesos | GGUF (llama.cpp), dividido en 13 partes por cuantizacion |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4 es un transformer multimodal con arquitectura mixture-of-experts, segun las etiquetas del repositorio (moe, multimodal). La publicacion de Xylolabs no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia a la model card del modelo base, que no se incluye en la informacion disponible.

La innovacion tecnica principal de esta publicacion es el proceso de cuantizacion: se han generado matrices de importancia (Hy4.imatrix.gguf e Hy4.imatrix.ub12288.gguf) para guiar las cuantizaciones IQ, y se han medido divergencias KL y acuerdos top-1 frente al modelo BF16 en WikiText-2, datos de chat y texto reservado. Ademas, se incluye un proyector de vision separado (mmproj) para el procesamiento de imagenes, lo que confirma el caracter multimodal del pipeline. El soporte de llama.cpp requiere un build especifico del pull request #32517 y limita el parametro `--ubatch-size` a 8192 o menos para evitar salidas incorrectas.

## Capacidades

- Generacion de texto conversacional y multimodal: el pipeline image-text-to-text indica entrada conjunta de imagenes y texto.
- Procesamiento de vision mediante el proyector mmproj en BF16 o Q8_0.
- Razonamiento y conversacion multi-turno (etiqueta conversational).
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Ejecucion en llama.cpp mediante llama-cli y llama-server.
- Capacidad de contexto largo: hasta 1M tokens en configuraciones de 8 x H200 o 8 x B200.
- No se dispone de informacion sobre tool calling, function calling, modo thinking, audio u otras capacidades especiales.

## Casos de uso

- Despliegue de un modelo de casi 770.000 millones de parametros en infraestructura propia: con 4 x H200 (564 GB) se puede ejecutar Q4_K_M con 256K de contexto, lo que permite usar un modelo de escala frontier sin depender de APIs externas.
- Analisis de documentos e imagenes en ingles y chino: el pipeline image-text-to-text y el proyector de vision permiten procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Procesamiento de contexto muy largo: con 8 x H200 o 8 x B200 y la cuantizacion Q8_0 se alcanza 1M de tokens, adecuado para analisis de corpus extensos, auditoria de codigo o revision de expedientes completos.
- Investigacion en cuantizacion: las tablas de divergencia KL y acuerdo top-1 publicadas permiten estudiar el impacto de la cuantizacion en modelos MoE de gran escala, comparando Q4_K_M propio frente a AngelSlim Q4_K_M.
- Experimentacion en estaciones de trabajo con memoria unificada: en un Mac Studio M5 Ultra de 512 GB se puede ejecutar IQ3_S con 512K de contexto, util para prototipado y evaluacion sin cluster de GPUs.
- Servicio de inferencia interno con llama-server: la etiqueta endpoints_compatible y el soporte de llama.cpp permiten levantar un endpoint HTTP para integracion en aplicaciones internas, siempre que se cumpla la licencia Tencent Hy.
- Evaluacion comparativa de cuantizaciones en produccion: la disponibilidad de cinco niveles permite seleccionar el punto de equilibrio entre calidad (KL) y memoria segun el hardware disponible.

## Benchmarks y rendimiento

Los datos publicados corresponden a divergencia KL media y acuerdo top-1 frente al modelo BF16, no a benchmarks de tareas estandar como MMLU o HumanEval.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Answers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 (flash attention off) | 1541,7 GB | 0,0336 | 95,1% | - | - | - | - | - |
| Q8_0 | 818,5 GB | 0,0373 | 94,6% | 0,1187 | 93,3% | 0,0173 | 96,0% | 5/5 |
| Q6_K | 638,3 GB | 0,0431 | 93,8% | 0,1235 | 92,8% | 0,0188 | 95,5% | 5/5 |
| Q4_K_M | 464,1 GB | 0,0920 | 90,8% | 0,1590 | 91,3% | 0,0408 | 93,8% | 5/5 |
| AngelSlim Q4_K_M | 470,2 GB | 0,1464 | 88,3% | 0,2315 | 88,8% | 0,0713 | 91,9% | 5/5 |
| IQ3_S | 328,0 GB | 0,3237 | 82,8% | 0,2851 | 87,3% | 0,1535 | 88,1% | 5/5 |
| AngelSlim IQ2 | 332,4 GB | 0,5673 | 76,9% | 0,4303 | 83,5% | 0,2802 | 83,8% | 5/5 |
| IQ2_XXS | 219,4 GB | 0,8881 | 70,1% | 0,5610 | 80,7% | 0,4522 | 80,3% | 5/5 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde 219,4 GB (IQ2_XXS) hasta 818,5 GB (Q8_0) para el modelo de texto, mas 1,6-2,7 GB del proyector de vision.
- RTX 4090 / RTX 3090 (24 GB): no cabe ninguna cuantizacion.
- RTX 5090 (32 GB): solo mediante offload de expertos a RAM del sistema (`--n-cpu-moe 78`), con contexto de 32K.
- RTX 6000 Ada o 2 x 24 GB (48 GB): offload, contexto de 32K.
- Una H100 (80 GB): offload, contexto de 32K.
- RTX PRO 6000 Blackwell (96 GB): offload, contexto de 32K.
- DGX Spark (128 GB unificados) y Mac Studio M5 Max (128 GB unificados): no cabe ninguna cuantizacion.
- Una H200 (141 GB) o una B200 (192 GB): offload, contexto de 32K.
- Mac Studio M5 Ultra (256 GB unificados): IQ2_XXS con 64K de contexto, requiriendo elevar el limite de memoria GPU de macOS.
- Mac Studio M5 Ultra (512 GB unificados): IQ3_S con 512K de contexto.
- Una B300 (288 GB) o 2 x H200 (282 GB): IQ2_XXS con 256K de contexto.
- 4 x H200 (564 GB): Q4_K_M con 256K de contexto.
- 4 x B200 (768 GB): Q6_K con 64K de contexto.
- 8 x H200 (1128 GB) u 8 x B200 (1536 GB): Q8_0 con 1M de contexto.
- Despliegue: llama.cpp (rama del PR #32517), con llama-cli y llama-server. No se mencionan vLLM, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Hy4-GGUF | 769,9 B (MoE) | hasta 1M segun hardware | GGUF (5 cuantizaciones) | Tencent Hy License 1.0 | Multimodal, requiere llama.cpp PR #32517 |
| tencent/Hy4 (base) | 769,9 B (MoE) | no disponible | safetensors | Tencent Hy License 1.0 | Modelo original en BF16, 1541,7 GB |
| AngelSlim Q4_K_M / IQ2 | no disponible | no disponible | GGUF | no disponible | Referencia de cuantizacion alternativa incluida en las tablas de precision |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia Tencent Hy License, Version 1.0, no es una licencia de codigo abierto estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- El soporte en llama.cpp depende de un pull request no fusionado (#32517); la API y el comportamiento pueden cambiar.
- Con `--ubatch-size` superior a 8192 en este build de llama.cpp pueden producirse salidas incorrectas.
- Las cuantizaciones IQ3_S e IQ2_XXS muestran una degradacion notable de precision (KL de 0,32 y 0,89 en WikiText-2; top-1 de 82,8% y 70,1%), por lo que no son adecuadas para tareas sensibles a la calidad.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- El modelo base no especifica parametros activos, composicion del dataset ni proceso de alineacion, lo que dificulta evaluar su comportamiento en produccion.
- El enorme requisito de memoria (minimo 219,4 GB para el modelo de texto) excluye su uso en GPUs de consumo sin offload masivo a RAM del sistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy4-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/Xylolabs/Hy4-GGUF/blob/main/LICENSE
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32517
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
