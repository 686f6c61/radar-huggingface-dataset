# WaveCut/Qwen3.8-27B-MXFP8-CRACK-NInfer

## Resumen

Qwen3.8-27B-MXFP8-CRACK-NInfer es un artefacto de inferencia en formato NInfer v3 derivado del fine-tune comunitario `dealignai/Qwen3.8-27B-MXFP8-CRACK`, que a su vez parte de `Qwen/Qwen3.8-27B`. Lo publica el usuario WaveCut y no es un modelo entrenado desde cero, sino un contenedor de pesos reempaquetado para el motor NInfer, con un unico fichero de 18.210.749.936 bytes (unos 16,96 GiB) que incluye los componentes de texto, vision y MTP (multi-token prediction) junto con la cabeza de propuesta de 131.072 filas para decodificacion especulativa.

La relevancia del artefacto es de infraestructura mas que de modelado: permite ejecutar un modelo multimodal de 27.000 millones de parametros en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) y en RTX 5090 y RTX PRO 6000 Blackwell, mediante cuantizacion groupwise-int (Q4/Q5/Q6/W8 mas BF16) y un servidor compatible con las APIs de OpenAI y Anthropic. El pipeline declarado es `image-text-to-text`, por lo que cubre tanto generacion de texto como comprension de imagenes.

La licencia es Apache-2.0, heredada de ambos eslabones de la cadena. El repositorio acumula 3662 descargas y 1 like, con fecha de creacion 2026-08-18 y ultima actualizacion 2026-10-06. No se dispone de informacion sobre idiomas soportados ni de resultados de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision) con capa MTP para decodificacion especulativa; familia Qwen3.8-27B |
| Parametros totales | 27 000 millones (denominacion del modelo); no se detalla desglose por componente |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131 072 posiciones en la cabeza de propuesta; `--max-context` configurable en el servidor (ejemplos con 16 384 y 32 768) |
| Tipos de cuantizacion | Groupwise-int: Q4/Q5/Q6/W8 por grupos mas tensores BF16; origen MXFP8 (FP8-E4M3 con escala UE8M0 por grupo de 32) y MLX affine int8 en la capa MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor NInfer v3); no se distribuyen safetensors ni GGUF en este repo |
| Tamano del repo | 36,4 GB |
| Tamano del artefacto | 18 210 749 936 bytes (un unico fichero) |
| SHA-256 | `3d1f5c434946696a004634a12276a0b48bebc92ba637408fdb4b372d255b4659` |
| Objetos internos | 1124 (1118 tensores, 6 recursos de frontend), 1422 bindings |
| Libreria / motor | NInfer v3 sobre NInfer-all (rama `master` de `iamwavecut/ninfer-all`) |
| Modelo base | `dealignai/Qwen3.8-27B-MXFP8-CRACK` (relacion: quantized) |

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento nuevo: reproduce la arquitectura oficial de Qwen3.8-27B (transformer multimodal con torre de vision y una capa de prediccion multi-token) y solo cambia el empaquetado de pesos y el motor de ejecucion. El proceso descrito en la model card parte del checkpoint fuente, que almacena los pesos en dos esquemas de 8 bits: los 582 tensores de texto y vision en MXFP8 (cuatro valores FP8-E4M3 empaquetados por palabra U32, con una escala U8 UE8M0 por grupo de 32 elementos, interpretada como 2^(b-127)), y los 8 tensores de la capa MTP en MLX affine int8 (codigos uint8 con escala F16 y bias por grupo de 128, `w = q*scale + bias`). Ambos se dequantizaron a BF16 y se renombraron al layout oficial de Qwen3.8-27B: `language_model.model.*` a `model.language_model.*`, `language_model.lm_head.*` a `lm_head.*` y `vision_tower.*` a `model.visual.*`, con permutacion del patch embedding de vision del layout convolucional MLX `[O,T,H,W,I]` al layout torch `[O,I,T,H,W]`.

Sobre ese BF16 se aplico el conversor estandar de NInfer (`tools.convert.qwen3_8_27b.convert`) para producir el artefacto v2, y despues `tools/upgrade_ninfer_v2_to_v3.py` para reescribir el contenedor a v3 sin modificar ningun byte de los pesos, instalando la plantilla de chat mantenida de Qwen3.8. Los recursos de frontend (tokenizer, preprocesador y `generation_config.json`) son los oficiales de `Qwen/Qwen3.8-27B`, fijados por SHA-256. La innovacion practica es la decodificacion especulativa con MTP (3 borradores por defecto) y la cabeza de borrador `--lm-head-draft`, que acelera la generacion sin cambiar la distribucion objetivo. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO para el fine-tune original.

## Capacidades

- Generacion de texto conversacional y de respuesta a preguntas, con plantilla de chat oficial de Qwen3.8.
- Comprension de imagenes (`image-text-to-text`): la model card cita una prueba de humo en la que el modelo describe correctamente un grafico con `--vision`.
- Decodificacion especulativa mediante capa MTP y cabeza de borrador de 131.072 filas, activable con `--spec mtp --draft-tokens 3 --lm-head-draft`.
- Servido con API compatible con OpenAI y Anthropic desde la imagen Docker (`/v1` en el puerto 8080).
- Ejecucion en CLI de una sola peticion (`ninfer`) o como servidor (`ninfer-serve`).
- Capacidades de razonamiento, codigo, matematicas, tool calling y agentes: no disponible en la informacion proporcionada (no se documentan explicitamente para este artefacto).
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente conversacional autoalojado: el motor expone un endpoint compatible con OpenAI y Anthropic, de modo que se puede apuntar un cliente existente a `http://localhost:8080/v1` sin reescribir la aplicacion, con contexto configurable hasta 32 768 tokens en los ejemplos del autor.
- Analisis de graficos y capturas en local: al incluir la torre de vision y haberse verificado la descripcion de una imagen de tipo chart con `--vision`, sirve para extraer conclusiones de paneles de monitorizacion o informes sin enviar imagenes a un tercero.
- Despliegue en estaciones de trabajo con GPU de consumo: cabe en tarjetas de 24 GB con cache KV larga en perfiles `rk4v4` o `rk8v4`, lo que permite prototipar sobre RTX 3090 o RTX 4090 en lugar de depender de A100/H100.
- Generacion de texto de baja latencia en produccion: la especulacion MTP con 3 borradores y `--lm-head-draft` reduce el coste por token en cargas de decodificacion sostenida, adecuado para servicios de resumen o redaccion asistida.
- Evaluacion de fine-tunes comunitarios: al conservar la arquitectura, tokenizer y plantilla oficiales y variar solo los pesos, permite comparar el tune `MXFP8-CRACK` frente al Qwen3.8-27B original con el mismo motor y el mismo sampler.
- Laboratorio de cuantizacion: el artefacto documenta el pipeline completo (MXFP8 y affine int8 a BF16, renombrado, groupwise-int) y sirve como referencia reproducible para convertir otros checkpoints al formato NInfer.
- Inferencia por lotes en CLI: el binario `ninfer` admite peticiones sueltas con `--max-context` reducido, util para tareas de procesamiento por ficheros en scripts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones cualitativas: una prueba de humo con decodificacion greedy en NInfer-all `master` sobre RTX 5090, con respuestas coherentes sin especulacion y con MTP de 3 borradores, y una descripcion correcta de una imagen de grafico con `--vision`. No se aportan cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 18,2 GB, por lo que encaja en GPUs de 24 GB dejando espacio para cache KV; el autor indica que en tarjetas de 24 GB cabe con cache KV larga en perfiles `rk4v4` o `rk8v4`.
- GPUs soportadas por NInfer-all: RTX 3090, RTX 4090, RTX 5090 y RTX PRO 6000 Blackwell. El NInfer original (v2) solo compilaba para RTX 5090; v3 se verifico en NInfer-all.
- Arquitecturas CUDA al compilar: `CMAKE_CUDA_ARCHITECTURES` en `86` (Ampere), `89` (Ada) o `120a` (Blackwell).
- Caben en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 5090 y RTX PRO 6000 Blackwell.
- Despliegue: imagen Docker `ghcr.io/iamwavecut/ninfer-all` con `--gpus all`, `--ulimit memlock=-1` y volumen de cache; requiere driver de la rama CUDA 13 (580 o superior) y NVIDIA Container Toolkit. Tambien compilacion propia de NInfer-all para CLI o servidor.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el formato `.ninfer` esta ligado al motor NInfer y no se documenta conversion a GGUF ni compatibilidad con otros runners.
- Latencia y throughput: no disponibles; no se publican cifras. La unica indicacion de rendimiento es la aceleracion por especulacion MTP con 3 borradores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WaveCut/Qwen3.8-27B-MXFP8-CRACK-NInfer | 27 000 M | 131 072 (cabeza de propuesta); 16 384-32 768 en ejemplos | `.ninfer` v3 | Apache-2.0 | Solo motor NInfer; cuantizacion doble (groupwise-int sobre MXFP8/affine int8) |
| dealignai/Qwen3.8-27B-MXFP8-CRACK | 27 000 M | no disponible | MXFP8 y MLX affine int8 | Apache-2.0 | Checkpoint fuente del fine-tune; requiere dequantizacion o runtime compatible |
| Qwen/Qwen3.8-27B | 27 000 M | no disponible en la informacion | safetensors (BF16, presumiblemente) | Apache-2.0 | Modelo oficial; origen de tokenizer, plantilla y pesos MTP de referencia |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas tres variantes; la comparacion se limita a formato, licencia y linaje.

## Limitaciones y advertencias

- Doble cuantizacion: el origen ya era de 8 bits (MXFP8 y affine int8) y el artefacto lo recuantiza a groupwise-int Q4/Q5/Q6/W8 mas BF16, por lo que el autor advierte de una fidelidad marginalmente inferior frente a un artefacto construido desde un checkpoint BF16 nativo del mismo tune.
- Dependencia fuerte del motor: el fichero solo se ejecuta con NInfer v3 sobre NInfer-all; no hay pesos en safetensors ni GGUF en este repositorio, lo que limita la portabilidad a vLLM, llama.cpp, Ollama o TGI.
- Requisitos de entorno estrictos: driver CUDA 13 (580 o superior) y NVIDIA Container Toolkit para la imagen Docker; compilaciones propias deben fijar la arquitectura CUDA correcta.
- Ajuste de muestreo obligatorio segun el autor: `temperature=1.0, top_p=0.95, top_k=20` para reproducir el comportamiento previsto del tune.
- Sin adaptador DFlash2 incluido en el artefacto.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de factualidad para este artefacto ni para el fine-tune de origen.
- Trazabilidad del tune: el modelo base es un fine-tune comunitario de procedencia no verificada por el publicador del artefacto; la validacion reportada se limita a pruebas de humo cualitativas.
- Uso comercial: permitido por Apache-2.0, pero conviene revisar las condiciones del checkpoint fuente y del modelo oficial Qwen3.8-27B antes de desplegar en produccion.
- Sin cifras de latencia, throughput ni benchmarks que permitan dimensionar un despliegue con garantias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WaveCut/Qwen3.8-27B-MXFP8-CRACK-NInfer
- Modelo base (fine-tune): https://huggingface.co/dealignai/Qwen3.8-27B-MXFP8-CRACK
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all (rama `master`, soporte RTX 3090/4090/5090/PRO 6000): https://github.com/iamwavecut/ninfer-all
- Instrucciones Docker de NInfer-all: https://github.com/iamwavecut/ninfer-all#docker
- Instrucciones de compilacion de NInfer-all: https://github.com/iamwavecut/ninfer-all#building
- Imagen Docker: ghcr.io/iamwavecut/ninfer-all
