# wardner/Qwen3-VL-Embedding-2B

## Resumen

Qwen3-VL-Embedding-2B es un modelo de codificacion de informacion visual (vision embedding) derivado de la familia Qwen3-VL, distribuido por el usuario wardner en Hugging Face como artefacto de despliegue para hardware Rockchip. No se trata de los pesos originales en formato PyTorch, sino de una conversion a grafos RKNN y pesos empaquetados para ejecutarse sobre la NPU RK182x con el runtime RKLLM, alojado en una plataforma host RK3588. El paquete incluye ademas un manifiesto de worker (`qwen3-vl-embedding-2b.json`) que permite integrarlo en la interfaz web wdnwebui.

El modelo resuelve el problema de generar representaciones (embeddings) multimodales en dispositivos de borde (edge AI) con recursos limitados, sin necesidad de GPU dedicada. Con aproximadamente 1,60 GB de pesos totales y un consumo de memoria estimado en unos 2000 MB, esta pensado para tareas de recuperacion de informacion y comprension entre modalidades en entornos embebidos.

Su relevancia actual radica en que traslada capacidades de embedding visual de la familia Qwen3-VL a un formato ejecutable en NPU de bajo consumo (tarjeta de computo RK182x de 1,82 TOPS), un nicho poco cubierto por los despliegues convencionales basados en CUDA. La licencia declarada es Apache 2.0, aunque los ficheros son derivados convertidos y no los pesos originales sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-VL (transformer multimodal); empaquetada como grafos RKNN + pesos para RKLLM |
| Parametros totales | no disponible (el nombre indica 2B; no confirmado en la informacion) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados en formato propietario RKNN/RKLLM; tabla de embeddings en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (grafos) + `.weight` (RKLLM), tabla de embeddings `.embed.bin` (fp16), tokenizer GGUF |
| Tamano total de pesos | 1,60 GB |
| Memoria estimada en ejecucion | ~2000 MB |
| Tiempo de inicializacion | ~30 s |
| Plataforma de computo | RK182x (tarjeta de computo, 1,82 TOPS) |
| Host | RK3588 |
| Runtime | RKLLM + RKNN |
| Capacidades declaradas | `swcap_vision_embedding` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original. El nombre y la referencia a la familia Qwen3-VL indican que se basa en un transformer multimodal de la serie Qwen3-VL, disenado para recuperacion de informacion multimodal y comprension entre modalidades. Sin embargo, esta distribucion concreta no incluye pesos en formato PyTorch ni documentacion sobre datos de entrenamiento, numero de tokens, composicion del dataset o tecnicas de alineacion como RLHF o DPO.

Lo que si se documenta es el proceso de despliegue: el modelo se ha convertido a grafos RKNN especificos para la NPU RK182x, con un grafo separado para el componente de lenguaje (`llm_...rknn`, 15,6 MB) y otro para el componente de vision (`vision_...rknn`, 6,2 MB), acompanados de sus ficheros de pesos respectivos (787,3 MB y 231,8 MB). La tabla de embeddings se entrega en fp16 (593,5 MB) y el tokenizer en formato GGUF con BPE estilo GPT-2 y ByteLevel (5,7 MB). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings de informacion visual (capacidad declarada `swcap_vision_embedding`).
- Procesamiento multimodal orientado a recuperacion de informacion y comprension entre modalidades, segun la descripcion de la familia Qwen3-VL-Embedding.
- Ejecucion en NPU de borde mediante runtime RKLLM + RKNN.
- Integracion con la interfaz wdnwebui a traves de un manifiesto de worker (`qwen3_vl_embedding`).
- Descubrimiento automatico por el backend, que reescanea el directorio raiz de modelos cada ~2 s sin necesidad de reinicio.
- Localizacion del directorio mediante la variable de entorno `WDNAI_QWEN3_VL_EMBEDDING_2B_DIR` declarada en el manifiesto.

No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, thinking mode, audio ni soporte multilingue explicito.

## Casos de uso

- Busqueda visual en dispositivos de borde: el modelo genera embeddings de imagenes en la NPU RK182x, lo que permite indexar y recuperar contenido visual localmente sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Recuperacion multimodal en kioscos o paneles embebidos: sobre un host RK3588, se puede integrar en sistemas de consulta donde el usuario aporta una imagen y el sistema recupera elementos relacionados, con un consumo de memoria de ~2000 MB.
- Clasificacion y agrupamiento de imagenes en el dispositivo: los embeddings generados permiten tareas de similitud y clustering en tiempo de ejecucion sobre hardware de bajo consumo (1,82 TOPS).
- Preprocesado de vision para pipelines de IA locales: el componente de vision (231,8 MB de pesos) puede alimentar etapas posteriores de un pipeline embebido que combine recuperacion y generacion.
- Despliegue en entornos sin GPU: al ejecutarse sobre RKLLM + RKNN, encaja en dispositivos industriales o IoT basados en RK3588 donde no hay acceso a CUDA.
- Integracion en wdnwebui: mediante el manifiesto de worker, el modelo se activa desde la pestana Compute de la interfaz web, lo que facilita su uso en flujos de trabajo locales gestionados por esa plataforma.
- Verificacion de integridad en produccion: el repositorio incluye `SHA256SUMS`, lo que permite validar la integridad de los ficheros antes del despliegue en flotas de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria estimada en ejecucion: ~2000 MB.
- Plataforma de computo: tarjeta RK182x (1,82 TOPS), obligatoria (se indica "Cards required: 1").
- Host: RK3588.
- Runtime: RKLLM + RKNN.
- No esta pensado para GPU convencionales (A100, H100, RTX 4090); la informacion no contempla despliegue en CUDA.
- Opciones de despliegue: SDK wdnwebui con el manifiesto `qwen3-vl-embedding-2b.json`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Tiempo de inicializacion: ~30 s.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wardner/Qwen3-VL-Embedding-2B | no disponible (nombre indica 2B) | no disponible | RKNN + RKLLM (edge) | Apache 2.0 | Hugging Face, 50 descargas |
| ArchiveStudio/Qwen3-VL-Embedding-2B | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3-VL-Embedding (serie original) | no disponible | no disponible | pesos originales (familia Qwen) | no disponible | Hugging Face |

La informacion disponible solo confirma la existencia de una distribucion alternativa del mismo modelo por ArchiveStudio y la serie original Qwen3-VL-Embedding y Qwen3-VL-Reranker. No se dispone de datos de rendimiento, contexto ni parametros para una comparacion cuantitativa.

## Limitaciones y advertencias

- Los ficheros son derivados convertidos a RKNN, no los pesos originales sin modificar; el comportamiento puede diferir del modelo upstream.
- La licencia Apache 2.0 se declara sobre el modelo upstream; deben revisarse `LICENSE` y `NOTICE` para confirmar las condiciones de los artefactos derivados.
- El modelo esta atado al hardware RK182x y al host RK3588; no es portable a otras plataformas sin reconversion.
- No se documentan idiomas soportados, longitud de contexto ni regimen de cuantizacion, lo que limita la evaluacion previa al despliegue.
- Riesgo de alucinacion y sesgos: no evaluable con la informacion disponible, ya que no se publican datos de entrenamiento ni evaluaciones.
- El repositorio tiene un volumen muy bajo de adopcion (50 descargas, 0 likes) y fue creado y actualizado el mismo dia, lo que aconseja validacion adicional antes de usarlo en produccion.
- Es imprescindible verificar `SHA256SUMS` antes del despliegue, segun indica el propio autor.
- El manifiesto `qwen3-vl-embedding-2b.json` contiene las particularidades por modelo (valores por defecto de muestreo, disposicion de capacidades, efectos secundarios) y debe revisarse.
- El acceso a `huggingface.co` puede estar bloqueado en algunas redes; el autor documenta el uso del espejo `hf-mirror.com`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wardner/Qwen3-VL-Embedding-2B
- Distribucion alternativa del mismo modelo: https://huggingface.co/ArchiveStudio/Qwen3-VL-Embedding-2B
