# Xylolabs/Raon-1-nano-Uncensored-MLX-6bit

## Resumen

Raon-1-nano Uncensored MLX 6-bit es una variante del modelo KRAFTON/Raon-1-nano (3.130.797.136 parametros, aproximadamente 3,13 mil millones) en la que se ha eliminado la direccion de rechazo de los pesos y se ha convertido a formato MLX con cuantizacion de 6 bits para ejecucion en Apple Silicon. Lo publica Xylolabs, un tercero independiente de KRAFTON, y su proposito es ofrecer una version "abliterated" (sin mecanismos de rechazo aprendidos) que mantenga la fidelidad respecto a los pesos BF16 originales, con un tamano de repositorio de 2,7 GB.

El modelo es relevante porque combina tres elementos poco habituales en un mismo artefacto: una intervencion quirurgica sobre los pesos (proyeccion de una unica direccion en la capa 16 sobre 51 tensores), una cuantizacion mixta 6/8 bits optimizada para MLX y la eliminacion del bloque MTP (multi-token prediction). Segun la model card, el resultado reduce la tasa de rechazo en HarmBench del 98,5 % del GGUF Q6_K oficial de KRAFTON al 0,5 %, a costa de un aumento medible de la divergencia KL respecto a los pesos BF16 (0,009804 frente a 0,004891 en WikiText-2).

La arquitectura subyacente es la de Raon-1-nano, un transformer con atencion MLA (multi-head latent attention), proyecciones RDA y una tabla de embeddings por capa, con soporte de modo "thinking" activado por defecto. El contexto declarado en la tabla de hardware de la model card es de 256K tokens. Los idiomas soportados son coreano e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion MLA, proyecciones RDA y embeddings por capa (arquitectura Raon-1-nano) |
| Parametros totales | 3.130.797.136 (aproximadamente 3,13 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256K tokens (segun tabla de hardware de la model card) |
| Tipos de cuantizacion | MLX affine con group size 64: proyecciones de atencion, RDA y MLP y embedding por capa en 6 bits; token embedding (tambien LM head), proyeccion de embedding por capa y gates/proyecciones de entrada por capa en 8 bits; proyecciones MLA key y value up en BF16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`), sin bloque MTP |

## Arquitectura y entrenamiento

El modelo parte de KRAFTON/Raon-1-nano y conserva su codigo de modelo (`raon_mlx_model.py`, tomado sin cambios de KRAFTON/Raon-1-nano-mlx). La arquitectura emplea atencion MLA, proyecciones RDA y una tabla de embeddings adicional por capa, ademas de un bloque MTP (multi-token prediction) que en esta variante se ha eliminado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La innovacion tecnica de esta variante es la eliminacion de la direccion de rechazo ("abliteration"): se toma una unica direccion en la capa 16, con el canal 746 anulado, y se proyecta fuera de las proyecciones de salida de atencion, las proyecciones down del MLP y las proyecciones de entrada por capa de las capas 6 a 22, en total 51 tensores. El embedding, la cabeza de salida y el bloque MTP quedan intactos. La cuantizacion es mixta (6 y 8 bits, mas BF16 para las proyecciones MLA key/value up), lo que busca preservar precision en las partes mas sensibles del grafo. El modelo piensa por defecto; puede desactivarse el modo thinking mediante `--chat-template-config '{"enable_thinking": false}'`.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, con plantilla de chat.
- Modo "thinking" (razonamiento extendido) activado por defecto; puede desactivarse por configuracion.
- Razonamiento multi-turno y respuesta directa cuando se desactiva el modo thinking.
- Contexto largo de hasta 256K tokens segun la tabla de hardware del autor.
- Sin mecanismos de rechazo en la practica: 0,5 % de rechazo en HarmBench (200 prompts, thinking off) y 0 de 50 con thinking on.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de vision, audio ni otras modalidades.
- No se documenta comportamiento agentico explicito mas alla del razonamiento multi-paso inherente al modo thinking.

## Casos de uso

- Generacion de texto creativo sin filtros: el modelo responde a practicamente cualquier prompt (0,5 % de rechazo en HarmBench), lo que lo hace adecuado para escritura de ficcion, guiones o narrativa que otros modelos rechazarian por contenido sensible.
- Investigacion sobre alineacion y seguridad: permite estudiar el efecto de eliminar la direccion de rechazo comparando directamente con el modelo base y con el GGUF Q6_K oficial, con metricas de KL y top-1 reportadas.
- Procesamiento de documentos largos en coreano e ingles: con 256K tokens de contexto puede resumir o extraer informacion de contratos, informes o expedientes extensos en una sola pasada.
- Asistente conversacional local en Mac: con 2,7 GB de pesos cabe holgadamente en la memoria unificada de un Mac Studio o MacBook con Apple Silicon, permitiendo despliegue offline sin GPU dedicada.
- Analisis de contenido sensible para moderacion o auditoria: al no rechazar prompts, puede emplearse para generar o clasificar contenido que otros modelos bloquean, siempre bajo supervision humana.
- Prototipado rapido de aplicaciones de chat en MLX: la integracion con `mlx_lm.generate` y `mlx_lm.chat` permite levantar un endpoint conversacional con pocos comandos y sin infraestructura de servidor.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de fidelidad de la cuantizacion 6/8 bits MLX frente a BF16 y frente a GGUF Q6_K en tareas de WikiText-2, chat y conjuntos held-out.

## Benchmarks y rendimiento

Datos publicados en la model card (KL y top-1 frente a los pesos BF16 originales; rechazos en HarmBench con 200 prompts y Alpaca con 100, thinking off):

| Modelo | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo 7 preguntas | HarmBench rechazados | Alpaca rechazados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Uncensored MLX 6-bit | 2,69 GB | 0,009804 | 93,67 % | 0,021895 | 93,00 % | 0,010994 | 93,75 % | 6/7 (BF16: 6/7) | 0,5 % | 0,0 % |
| Xylolabs GGUF Q6_K | 2,65 GB | 0,009180 | 94,31 % | 0,021124 | 93,10 % | 0,011139 | 94,16 % | 6/7 (BF16: 6/7) | 0,5 % | 0,0 % |
| KRAFTON Q6_K GGUF | 2,65 GB | 0,004891 | 95,50 % | 0,006117 | 96,28 % | 0,004853 | 95,35 % | 6/7 (BF16: 6/7) | 98,5 % | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 2,7 GB de pesos en formato MLX 6/8 bits; el consumo total depende de la longitud de contexto y del cache KV.
- Hardware objetivo: Apple Silicon con memoria unificada. La model card lista Mac Studio M5 Max (32 o 40 nucleos de GPU, 36-128 GB) y Mac Studio M5 Ultra (96-512 GB), todos con contexto de 256K.
- GPU dedicadas (NVIDIA, AMD): no soportadas por la libreria MLX; para CUDA habria que usar la version GGUF de Xylolabs o el modelo base.
- Cabe en consumer GPU: si, en el sentido de que 2,7 GB caben en cualquier GPU consumer moderna, pero el runtime MLX esta disenado para Apple Silicon; en MacBook con chip M-series es donde se ejecuta de forma nativa.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.chat` (mlx-lm 0.32.2, mlx 0.32.4, transformers 5.20.2), con `--trust-remote-code` obligatorio por el codigo de modelo personalizado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rechazo HarmBench | KL WikiText-2 |
|---|---:|---:|---|---|---:|---:|
| Raon-1-nano Uncensored MLX 6-bit (Xylolabs) | 3,13 B | 256K | MLX safetensors | Apache 2.0 | 0,5 % | 0,009804 |
| Xylolabs GGUF Q6_K (misma ablacion) | 3,13 B | no disponible | GGUF | Apache 2.0 | 0,5 % | 0,009180 |
| KRAFTON/Raon-1-nano Q6_K GGUF (base, sin ablacion) | 3,13 B | no disponible | GGUF | Apache 2.0 | 98,5 % | 0,004891 |
| KRAFTON/Raon-1-nano (BF16 original) | 3,13 B | no disponible | safetensors | Apache 2.0 | no disponible | referencia (0) |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks frente a otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo degrada la fidelidad respecto a BF16: la KL en WikiText-2 sube de 0,004891 (KRAFTON Q6_K) a 0,009804, y el top-1 baja de 95,50 % a 93,67 %.
- El modelo apenas rechaza peticiones daninas (0,5 % en HarmBench, 0 % con thinking on); no es apto para despliegues publicos sin moderacion externa.
- Riesgo elevado de generar contenido danino, ilegal o eticamente cuestionable; requiere supervision humana en cualquier uso en produccion.
- Sesgos conocidos: no documentados en la informacion disponible, pero hereda los del modelo base Raon-1-nano.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un modelo de 3,13 B, por lo que cabe esperar una fiabilidad inferior a modelos de mayor tamano.
- Cobertura linguistica limitada a coreano e ingles; el rendimiento en castellano no esta documentado.
- Requiere `--trust-remote-code` por el codigo de modelo personalizado de KRAFTON, lo que implica ejecutar codigo no auditado por el usuario.
- Excluye el bloque MTP, por lo que no se beneficia de decodificacion multi-token especulativa del modelo original.
- Solo se ejecuta con MLX en Apple Silicon; no hay soporte CUDA en este repositorio.
- Licencia Apache 2.0 permite uso comercial, pero las obligaciones de atribucion y los avisos de KRAFTON deben conservarse (ver `NOTICE` y `LICENSES/`).
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Raon-1-nano-Uncensored-MLX-6bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Version MLX oficial de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
