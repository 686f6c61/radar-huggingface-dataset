# StillDeadcode/qwen3.8-27b-uncensored-fp8

## Resumen

StillDeadcode/qwen3.8-27b-uncensored-fp8 es un contenedor `.rad` de 29,43 GiB para el motor de inferencia **radiance** (AMD RDNA4, ROCm). No es un modelo entrenado desde cero: empaqueta el checkpoint abliterado `orcarouter/Qwen3.8-27B-Uncensored-FP8` (Qwen3.8-27B-FP8 con su direccion de rechazo eliminada), le fusiona la torre de vision en bf16 y le incorpora el drafter de difusion por bloques `z-lab/Qwen3.8-27B-DFlash2` para decodificacion especulativa. El resultado es un unico fichero listo para servir con la CLI `radiance`.

El modelo subyacente es un transformer denso de unos 27B parametros con atencion hibrida (Gated DeltaNet lineal combinada con atencion completa), vision nativa y cabeza MTP de decodificacion especulativa, con 262.144 tokens de contexto entrenados y 200.000 probados en este contenedor. Su relevancia es doble: por un lado es una de las pocas rutas practicas para servir un modelo multimodal de gran contexto sobre GPUs AMD RDNA4; por otro, al haberse eliminado el alineamiento de seguridad, responde a peticiones que el modelo original rechaza.

El repositorio lo publica un tercero (StillDeadcode) a partir de artefactos de OrcaRouter y z-lab, no los autores originales de Qwen. Tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad. La licencia declarada es Apache 2.0, aunque la model card del modelo fuente lo etiqueta como "research-only".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (Gated DeltaNet lineal + atencion completa), torre de vision de 27 bloques y cabeza MTP; empaquetado para el motor radiance (segun la descripcion publica del modelo base) |
| Parametros totales | ~27B (modelo denso) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens entrenados; 200.000 probados en el contenedor |
| Tipos de cuantizacion | FP8 E4M3 con escala por bloque 128x128 en pesos y `lm_head`; torre de vision en bf16; drafter DFlash2 en FP8 por bloque 128x128 con cabeza de vocabulario en codigos de 2 bits |
| Idiomas soportados | no disponible (el modelo base declara un vocabulario de 248.320 tokens) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance); este repositorio no distribuye safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint de partida es `orcarouter/Qwen3.8-27B-Uncensored-FP8`, descrito como un build abliterado (direccion de rechazo eliminada) y cuantizado a block-FP8 de Qwen/Qwen3.8-27B, un modelo denso de ~27B parametros con atencion hibrida: capas de atencion lineal Gated DeltaNet combinadas con atencion completa, 64 capas, vocabulario de 248.320 tokens y vision nativa. Incluye control flexible de modo "thinking", tool calling y una cabeza MTP de decodificacion especulativa. No hay informacion disponible en las fuentes consultadas sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original.

Sobre esa base, este repositorio aplica una receta de reempaquetado (`q38-27b-fp8-df2.recipe`, incluida en el repo) ejecutada con `rad-convert`. La receta solo toca: `output.weight` (RTN a fp8_e4m3, bloque 128x128, escala bf16) y las capas del drafter DFlash2 (`draft_head` en codigos u2 con zero u8, grupo de 128, escala f16; `fc` y todos los `attn_q/k/v/output`, `ffn_gate_up`, `ffn_down` en fp8_e4m3 por bloque 128x128). Todo lo que la receta no nombra se conserva tal cual del checkpoint original. El drafter de difusion por bloques fue entrenado sobre el modelo original, pero como los borradores se verifican, segun el autor solo afecta a la velocidad y nunca a la salida. La profundidad especulativa se elige de forma automatica (`--num-speculative-tokens N` para fijarla, `0` para desactivarla).

## Capacidades

- Generacion de texto y razonamiento con control flexible de modo "thinking" heredado del modelo base.
- Vision nativa: entrada de imagenes en formatos PNG, JPEG, WebP, GIF, BMP, TIFF y AVIF, y de video en MP4, WebM, MKV, MPEG-TS y AVI con codecs H.264, HEVC, VP8, VP9 o AV1.
- Tool calling y function calling a traves de la API compatible con OpenAI que expone el motor radiance.
- Structured output / salida estructurada.
- Razonamiento multi-paso y uso en agentes, apoyado en el contexto largo y en las capacidades de tool calling.
- Servicio multimodal en chat mediante las partes `image_url` y `video_url` de los mensajes.
- Contenido sin filtros de rechazo: responde a peticiones que el modelo original rechaza (capacidad derivada de la abliteracion, no del entrenamiento).
- Decodificacion especulativa con DFlash2 para acelerar la generacion sin alterar la salida verificada.
- Capacidades multilingues: no disponible (no se documenta la lista de idiomas soportados).

## Casos de uso

- Servicio multimodal self-hosted sobre AMD: el contenedor esta disenado para lanzarse con un unico comando `radiance --model ... --tp 2` sobre GPUs RDNA4 con ROCm, lo que permite desplegar un VLM de 27B con contexto de 200.000 tokens sin depender de CUDA.
- Analisis de documentos tecnicos extensos con imagenes intercaladas: informes, planos, capturas o graficos dentro de un mismo prompt, aprovechando la ventana de 200.000 tokens probados para no trocear el documento.
- Video question answering: al aceptar MP4, MKV o WebM con H.264/HEVC/AV1, se puede construir un asistente que responda preguntas sobre metraje de vigilancia, demos de producto o grabaciones de reuniones sin preprocesar los fotogramas fuera del modelo.
- Agentes con herramientas en produccion: la API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`) permite conectarlo a frameworks de agentes existentes y encadenar llamadas a funciones con contexto largo entre pasos.
- Extraccion estructurada de datos a escala: con structured output se puede convertir documentacion heterogenea (PDF convertidos a imagen, tablas, formularios escaneados) en JSON validado contra un esquema.
- Asistencia sobre repositorios y bases de codigo grandes: los 200.000 tokens de contexto permiten mantener varios modulos completos y sus dependencias en una sola sesion, con tool calling para consultar el arbol de ficheros.
- Red teaming e investigacion de seguridad de modelos: al tener el alineamiento eliminado, sirve para estudiar comportamientos de rechazo, medir la eficacia de la abliteracion y generar conjuntos de evaluacion adversariales en un entorno controlado.
- Evaluacion comparativa de decodificacion especulativa: al poder activar y desactivar el drafter DFlash2 con un flag, permite medir ganancias de throughput manteniendo la salida verificada como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del modelo fuente (`orcarouter/Qwen3.8-27B-Uncensored-FP8`) se menciona en el blog de OrcaRouter como acompanada de benchmarks, pero no se han podido recuperar las cifras concretas, por lo que no se incluyen. Tampoco hay mediciones publicadas de throughput o latencia del contenedor `.rad`.

## Requisitos de hardware

- VRAM estimada para los pesos: 29,43 GiB corresponde al fichero `.rad` completo (pesos FP8 + torre de vision bf16 + drafter). A eso hay que sumar la cache KV; el comando de ejemplo usa `--kv-cache-dtype fp8` para reducirla.
- Configuracion de referencia del autor: 2x Radeon AI PRO R9700 (32 GB cada una, gfx1201) con `--tp 2`, lo que implica del orden de 64 GB de VRAM agregada para servir con comodidad 200.000 tokens de contexto.
- GPU soportadas: el motor radiance apunta exclusivamente a AMD RDNA4 (gfx1201) sobre ROCm. No se documenta soporte para NVIDIA, Intel ni para generaciones AMD anteriores, por lo que GPUs como RTX 4090, A100 o H100 no son una via de despliegue valida para este fichero.
- Cabe en GPU de consumo: no disponible. No se documenta ninguna Radeon de consumo RDNA4 (por ejemplo RX 9000) como plataforma probada; el autor solo reporta pruebas en Radeon AI PRO R9700.
- Opciones de despliegue: unicamente el motor `radiance` con el contenedor `.rad`. No se documenta vLLM, llama.cpp, Ollama ni TGI para este repositorio. Existen referencias de la comunidad a un uso con Ollama de pesos abliterados servidos desde `orcarouter/...`, pero no implican que este contenedor `.rad` sea compatible con Ollama.
- Parametros de servicio de ejemplo: `--tp 2 --max-model-len 200000 --kv-cache-dtype fp8 --max-num-seqs 8 --host 0.0.0.0 --port 8000`.
- Latencia y throughput: no disponible. No se publican mediciones, ni siquiera del factor de aceleracion del drafter DFlash2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StillDeadcode/qwen3.8-27b-uncensored-fp8 | ~27B denso | 262.144 entrenados / 200.000 probados | `.rad` (radiance, FP8) | Si, con video | Apache 2.0 | 0 descargas, 0 likes; solo motor radiance en RDNA4 |
| orcarouter/Qwen3.8-27B-Uncensored-FP8 | ~27B denso | no disponible | safetensors, block-FP8 E4M3 | Si (hereda del base) | Apache 2.0 | Modelo fuente de este contenedor; sin empaquetado ni drafter |
| StillDeadcode/qwen3.8-27b-fp8 | ~27B denso | no disponible | `.rad` (radiance, FP8) | Si | Apache 2.0 | Mismo empaquetado pero sin abliterar, sobre Qwen/Qwen3.8-27B-FP8 |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible (drafter especulativo) | no disponible | no disponible | no | no disponible | Drafter de difusion por bloques integrado en este contenedor |

Nota: los datos de la variante bf16 del modelo abliterado (64 capas, vocabulario de 248.320 tokens, ~55 GB de VRAM en bf16) proceden de una ficha de terceros y no de la documentacion oficial.

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido eliminado deliberadamente (abliteracion): el modelo responde a peticiones que el original rechaza. Es un riesgo directo si se expone a usuarios finales sin moderacion externa.
- La model card del modelo fuente lo etiqueta como "research-only" pese a declarar licencia Apache 2.0. Conviene revisar esa discrepancia antes de un uso comercial.
- No hay benchmarks publicados para este contenedor ni para el checkpoint abliterado en las fuentes consultadas: no se puede estimar la degradacion de calidad introducida por la abliteracion ni por el reempaquetado FP8.
- Riesgo de alucinacion no cuantificado. La cuantizacion block-FP8 de pesos y `lm_head`, mas la cabeza del drafter en codigos de 2 bits, anaden una fuente de error adicional no medida.
- La lista de idiomas soportados no esta documentada; no hay garantia de calidad fuera de los idiomas mayoritarios del modelo original.
- Dependencia total de una plataforma: el contenedor `.rad` solo funciona con el motor radiance sobre AMD RDNA4 (gfx1201) con ROCm. No hay portabilidad a CUDA ni a otros runtimes de inferencia, lo que limita el despliegue a hardware muy concreto.
- El repositorio no distribuye safetensors ni GGUF. Las referencias de la comunidad a Ollama o a otros formatos apuntan a los pesos de `orcarouter/...`, no a este fichero.
- Trazabilidad: es un reempaquetado de terceros sobre artefactos de OrcaRouter y z-lab. No esta publicado por los autores originales y no cuenta con descargas ni validacion de la comunidad.
- El drafter DFlash2 fue entrenado sobre el modelo original, no sobre la variante abliterada. Segun el autor los borradores se verifican, por lo que no deberian alterar la salida, pero no hay mediciones publicas que lo cuantifiquen.
- Requisitos de hardware altos para un modelo de 27B: el fichero solo ya ocupa 29,43 GiB, con cache KV adicional para contextos de 200.000 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StillDeadcode/qwen3.8-27b-uncensored-fp8
- Modelo fuente abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Drafter especulativo: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Variante no abliterada del mismo contenedor: https://huggingface.co/StillDeadcode/qwen3.8-27b-fp8
- Blog de OrcaRouter sobre el modelo abliterado FP8: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-fp8
- Repositorio de la comunidad con instrucciones para Qwen 3.8 27B Uncensored en local: https://github.com/Wassimyounes01/qwen38-uncensored
- Ficha de terceros con datos de la variante bf16: https://featherless.ai/models/JonathanColetti/Qwen3.8-27B-Uncensored
- Copia en bucket con descripcion de la arquitectura del modelo base: https://huggingface.co/buckets/bl5591/Qwen3.8-27B-Uncensored-FP8
