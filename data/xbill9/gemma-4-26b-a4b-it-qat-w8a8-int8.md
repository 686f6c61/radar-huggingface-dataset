# xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8

## Resumen

`xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8` es una conversión no oficial de los pesos de Gemma 4 26B-A4B-it con entrenamiento consciente de cuantización (QAT) de Google DeepMind, publicada por el usuario xbill9. El autor parte del checkpoint `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` (revisión `f1e06dc`), toma únicamente el modelo de texto y lo reempaqueta en formato compressed-tensors int8 W8A8: pesos int8 con una escala bf16 por canal de salida y activaciones cuantizadas a int8 por token en tiempo de ejecución. No se ha usado ningún dato de calibración; los pesos QAT ya residen en la rejilla Q4_0 y este build los redondea a int8 por canal.

Se trata de un modelo de arquitectura MoE (mezcla de expertos) con 128 expertos por capa, 25.233.141.790 parámetros totales según los safetensors publicados y un router (`router.proj`) que se mantiene en bf16. El checkpoint ocupa 24,23 GiB (26,1 GB de repositorio). El modelo base es de tipo instruct (`it`) y la ficha lo etiqueta como text-only, sin soporte de visión ni audio.

La relevancia de este build es doble: por un lado ofrece una ruta de despliegue en int8 para hardware que no aprovecha bien formatos de 4 bits, y por otro documenta el error relativo de cuantización capa por capa. Sin embargo, el propio autor advierte que el modelo "todavía no se ha servido ni evaluado" y que está en cola para una batería de pruebas de serving en una única AMD Instinct MI300X, por lo que no existen benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer; 128 expertos por capa; router en bf16 |
| Parametros totales | 25.233.141.790 (segun safetensors) |
| Parametros activos | no disponible (la nomenclatura "A4B" del nombre sugiere en torno a 4.000 millones, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8 (compressed-tensors): pesos int8 con una escala bf16 por canal de salida, activaciones int8 por token en runtime; formato `int-quantized`; base en rejilla Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma) |
| Formato de pesos | safetensors (compressed-tensors), libreria de despliegue vllm |
| Tamano del checkpoint | 24,23 GiB (26,1 GB de repositorio) |
| Modelo base | google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (revision f1e06dc) |
| Fecha de creacion | 2026-10-08 |
| Descargas / likes | 15 / 0 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos (MoE) con 128 expertos por capa. En el checkpoint de origen, los expertos de cada capa se almacenan en dos bancos fusionados (`experts.gate_up_proj` y `experts.down_proj`); este build los divide en un módulo por experto con el esquema `experts.{i}.{gate,up,down}_proj`, idéntico al del reempaquetado W4A16 del mismo autor (`xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text`). El router de la MoE (`router.proj`) permanece en bf16, mientras que las proyecciones de atención y las MLP densas se cuantizan a int8.

La cuantización se ha generado sin datos de calibración, mediante el script `w8a8_from_qat.py` (incluido en el repositorio junto con los ayudantes de `repack_q4_0.py`). El procedimiento parte de pesos ya entrenados con QAT y los redondea a int8 por canal. El autor documenta el error relativo de esa conversión frente a los pesos QAT originales, con medias que van del 0,69 % en `experts.down_proj` al 0,96 % en `self_attn.o_proj`. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la ficha original de Google, que este repositorio redistribuye sin cambios en `ORIGINAL_README.md`.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Modelo instruct (`it`): pensado para seguir instrucciones, segun la nomenclatura del modelo base.
- Mezcla de expertos con activacion dispersa: 128 expertos por capa, lo que permite escalar parametros totales manteniendo un coste de computo por token mas bajo que un modelo denso del mismo tamano total.
- Modelo exclusivamente de texto (`text-only`): no incorpora torre de vision ni de audio.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo es solo texto por diseno.

## Casos de uso

- Atencion al cliente automatizada: al ser un modelo instruct de texto, puede gestionar conversaciones multi-turno. La idoneidad depende de la longitud de contexto real, que no esta documentada y habria que verificar antes de produccion.
- Generacion y asistencia de codigo en pipelines internos: el modelo puede integrarse en tareas de autocompletado o revision, siempre que se valide primero el comportamiento del build int8, ya que no se ha evaluado.
- Resumen y reescritura de documentos: tarea generativa estandar de un LLM instruct; el coste por token se reduce al usar int8 W8A8 en lugar de bf16.
- Sistemas RAG (generacion aumentada por recuperacion): el modelo actua como generador final sobre fragmentos recuperados, con la ventaja de un checkpoint de 24,23 GiB que cabe en GPUs de 40 GB o superiores.
- Clasificacion y extraccion de informacion estructurada: uso tipico de un modelo instruct de texto en pipelines de procesamiento por lotes.
- Despliegue en hardware de 8 bits orientado a inferencia: al estar en formato compressed-tensors W8A8, encaja en stacks vLLM con kernels int8, aprovechando aceleracion de INT8 en GPUs de centro de datos.
- Sustitucion del modelo Q4_0 por una variante int8: para entornos donde el soporte de 4 bits es limitado pero el de int8 esta maduro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que el modelo esta "built and checked offline against its source; not yet served or evaluated" y que esta en cola para una bateria de pruebas de serving en una AMD Instinct MI300X. Lo unico que se documenta es el error relativo de la cuantizacion int8 frente a los pesos QAT:

| Capa | Tensores | Error relativo int8 frente a QAT |
|---|---:|---|
| `experts.down_proj` | 3.840 | 0,66 %-0,76 % (media 0,69 %) |
| `experts.gate_proj` | 3.840 | 0,69 %-0,98 % (media 0,75 %) |
| `experts.up_proj` | 3.840 | 0,56 %-0,93 % (media 0,75 %) |
| `mlp.down_proj` | 30 | 0,79 %-0,86 % (media 0,82 %) |
| `mlp.gate_proj` | 30 | 0,76 %-0,83 % (media 0,80 %) |
| `mlp.up_proj` | 30 | 0,76 %-0,83 % (media 0,81 %) |
| `self_attn.k_proj` | 30 | 0,81 %-1,29 % (media 0,94 %) |
| `self_attn.o_proj` | 30 | 0,84 %-1,38 % (media 0,96 %) |
| `self_attn.q_proj` | 30 | 0,82 %-1,12 % (media 0,87 %) |
| `self_attn.v_proj` | 25 | 0,80 %-1,15 % (media 0,92 %) |

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 24,23 GiB solo para el checkpoint, mas el espacio correspondiente a cache KV y activaciones (no cuantificada en la informacion disponible).
- GPU recomendadas: AMD Instinct MI300X (el autor menciona una bateria de serving precisamente en ese acelerador), NVIDIA A100 de 40 GB o 80 GB, H100 de 80 GB y equivalentes con soporte INT8.
- Cabe en GPU de consumo: con 24,23 GiB de pesos, no es viable en una RTX 4090 de 24 GB en la practica, ya que no quedaria margen para cache KV ni activaciones. No se recomienda su uso en GPUs de consumo.
- Opciones de despliegue: la libreria declarada es vLLM, con soporte de compressed-tensors W8A8. No se mencionan otros motores (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no ha publicado mediciones de serving.

## Comparativa con modelos similares

| Modelo | Parametros totales | Formato | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8 (este) | 25,23 B | int8 W8A8 (compressed-tensors) | apache-2.0 | No servido ni evaluado; 24,23 GiB | Repack no oficial, solo texto |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | no disponible | QAT en rejilla Q4_0, sin cuantizar aun | apache-2.0 (Gemma 4) | Modelo base oficial | Origen del que parte este build (revision f1e06dc) |
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text | no disponible | W4A16 (compressed-tensors) | no disponible en la informacion proporcionada | Repack alternativo del mismo autor | Misma division por experto; menor precision de pesos, misma estructura de modulos |

No se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de los tres, por lo que la comparacion se limita a formato, licencia y estado de publicacion.

## Limitaciones y advertencias

- Build no oficial: hecho y publicado de forma independiente a Google; los problemas deben reportarse al autor del repositorio, no a Google.
- No servido ni evaluado: no hay ninguna medicion de calidad, latencia o throughput; no deberia usarse en produccion sin una validacion propia.
- Solo texto: no hay soporte de vision ni de audio.
- Sin datos de calibracion: la cuantizacion int8 se hizo redondeando pesos QAT sin calibrar activaciones con un dataset, lo que puede introducir desviaciones no caracterizadas mas alla del error relativo reportado.
- Idiomas y contexto sin documentar: no se indica que idiomas soporta ni cual es la longitud de contexto, lo que impide planificar despliegues con requisitos concretos.
- Error de cuantizacion no uniforme: las capas de atencion (`self_attn.o_proj` con media 0,96 %, `k_proj` con 0,94 %) presentan mayor error relativo que los expertos (media 0,69 %-0,75 %), lo que podria afectar de forma desigual a distintas partes del modelo.
- Licencia: se redistribuye bajo apache-2.0, con enlace a la licencia de Gemma 4 de Google. Conviene revisar los terminos de uso de Gemma antes de un despliegue comercial, ya que la licencia enlazada es la del modelo original.
- Adopcion muy baja: 15 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Repack alternativo del mismo autor (W4A16): https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Model card original de Google: incluida sin cambios en `ORIGINAL_README.md` dentro del repositorio
