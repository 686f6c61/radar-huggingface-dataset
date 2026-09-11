# xy10086/Qwen3.8-9B-Distill-Uncensored-Heretic-MTPLX-Q6G64

## Resumen

Qwen3.8-9B-Distill-Uncensored-Heretic-MTPLX-Q6G64 es una conversión cuantizada a 6 bits del checkpoint `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic`, publicada por el usuario xy10086 y orientada exclusivamente al ecosistema MLX sobre Apple Silicon. El modelo conserva la arquitectura multimodal image-text-to-text de Qwen3.8 9B (9.409.812.208 parámetros reales según los safetensors) e incorpora dos elementos que la conversión no recuantiza: la cabeza MTP (multi-token prediction) en BF16 con sus 15 tensores y la torre de visión en BF16 con 333 tensores.

Su relevancia es práctica más que arquitectónica. El autor añade decodificación especulativa nativa mediante MTP, con un modo D2 que eleva el decode de 32,42 tok/s en modo autorregresivo puro a 71,70 tok/s en la verificación de MTPLX Forge, manteniendo operativa la entrada de imagen (comprensión de capturas y OCR verificados). El contexto recomendado es de 32.768 tokens, con 8.192 tokens de respuesta máxima, perfil *sustained* y profundidad MTP 2.

Se distribuye bajo licencia Apache-2.0, con soporte declarado de inglés y chino, y deriva de un checkpoint con el comportamiento de rechazo atenuado (*uncensored*), lo que condiciona de forma directa su uso en producción. El repositorio no registra descargas ni valoraciones y no se han encontrado análisis independientes en la búsqueda web realizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (Qwen3.8 9B) con torre de vision y cabeza MTP para decodificacion especulativa |
| Parametros totales | 9.409.812.208 |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | 32.768 tokens (valor recomendado por el autor); no se documenta el maximo nativo |
| Tipos de cuantizacion | Q6 affine, group size 64 (tronco del modelo de lenguaje); MTP en BF16 (15 tensores, sin recuantizar); torre de vision en BF16 (333 tensores, ~870 MiB en disco) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX (`model-vision.safetensors` para la torre de vision), mas `preprocessor_config.json` y `video_preprocessor_config.json` restaurados del repositorio upstream; no se ofrece GGUF ni otros formatos |

## Arquitectura y entrenamiento

La ficha del autor describe una arquitectura Qwen3.8 9B multimodal de tipo image-text-to-text. Sobre el checkpoint original se aplica una cuantizacion affine de 6 bits con group size 64 al tronco del modelo de lenguaje, mientras que la cabeza MTP (15 tensores) y la torre de vision (333 tensores) se preservan en BF16 sin recuantizar. Esta decision es la que permite mantener la decodificacion especulativa funcional y la entrada de imagen verificada, algo que una cuantizacion agresiva de esas partes rompería. El autor probó el resultado con MTPLX 2.11.2, MLX 0.32.2 y mlx-lm 0.31.3, y recomienda una profundidad MTP de 2.

La procedencia esta documentada: el modelo fuente es `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic` y el modelo upstream es `empero-ai/Qwen3.8-9B-Distill`. El repositorio fuente no incluia los sidecars de preprocesado de vision que MTPLX necesita, por lo que se restauraron desde el repositorio upstream. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. La etiqueta *distill* y el sufijo *heretic* indican que el checkpoint de partida es un destilado con el comportamiento de rechazo ablacionado, pero no se detalla la metodologia.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Entrada de imagen (image-text-to-text): el autor verifico comprension de capturas de pantalla y OCR, con 869 tokens de prompt y 336 tokens de completion en la prueba publicada.
- Decodificacion especulativa nativa mediante cabeza MTP, con profundidades D1, D2 y D3 validadas y ganancias de throughput medidas.
- Razonamiento: el endpoint de MTPLX expone los parametros `--reasoning` y `--reasoning-effort`, lo que sugiere soporte de modo de razonamiento configurable, aunque la model card no detalla su comportamiento.
- Comportamiento de rechazo atenuado: al derivar de un checkpoint *uncensored*, responde a peticiones que un modelo alineado convencional rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles; solo se documenta vision.

## Casos de uso

- Procesamiento de documentos escaneados y capturas de pantalla en local: la torre de vision en BF16 permite OCR y comprension de imagenes sin enviar datos a un servicio externo, con un pico de memoria de runtime de unos 10,53 GB medido en la prueba de vision.
- Asistente conversacional en chino sobre hardware Apple: los benchmarks de chat real en chino dan 50,73 tok/s de decode y 0,134 s de TTFT con profundidad D2, lo que hace viable una interfaz interactiva en un Mac con memoria unificada.
- Generacion de texto de baja latencia en MacBook o Mac Studio: con 71,70 tok/s en el modo D2 de la verificacion Forge, el modelo sirve para autocompletado, resumen y reescritura en flujos de trabajo locales.
- Prototipado de pipelines multimodales antes de pasar a produccion: al exponer un endpoint compatible con OpenAI en `http://127.0.0.1:8000/v1`, se puede integrar en codigo que ya use el SDK de OpenAI y sustituir el backend despues.
- Investigacion sobre decodificacion especulativa: el repositorio publica las tasas de decode para AR, D1, D2 y D3, lo que permite reproducir y comparar el efecto de la profundidad MTP sobre el throughput en una misma maquina.
- Trabajo con contenido sensible o creativo que los modelos alineados rechazan, siempre que se asuma la necesidad de verificacion factual independiente y el marco legal aplicable.
- Despliegue de una demo offline en un equipo sin GPU dedicada, aprovechando que MLX ejecuta sobre memoria unificada de Apple Silicon y que el repositorio ocupa 8,7 GB en disco.

## Benchmarks y rendimiento

Verificacion de MTPLX Forge, tasas de decode medidas:

| Modo | Decode (tok/s) |
|---|---:|
| AR (autorregresivo puro) | 32,42 |
| D1 | 58,91 |
| D2 | 71,70 |
| D3 | 70,90 |

Chat real en chino:

| Profundidad | Decode medio (tok/s) | TTFT medio (s) |
|---|---:|---:|
| D1 | 49,41 | 0,159 |
| D2 | 50,73 | 0,134 |
| D3 | 46,38 | 0,135 |

Prueba de vision: 869 tokens de prompt, 336 tokens de completion, 65,30 tok/s de decode, comprension de captura de pantalla y OCR correctos, pico de memoria de runtime aproximado de 10,53 GB.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son mediciones de rendimiento de inferencia, no de calidad.

## Requisitos de hardware

- Tamano del repositorio: 8,7 GB, de los cuales unos 870 MiB corresponden a la torre de vision en BF16.
- Memoria de runtime: el autor reporta un pico de aproximadamente 10,53 GB durante la prueba de vision con 869 tokens de prompt. Conviene reservar margen adicional para el contexto largo, dado que la ventana recomendada es de 32.768 tokens.
- Memoria unificada recomendada: 16 GB como minimo practico; 32-48 GB para trabajar comodamente con contexto largo y vision. El modelo se probo en un Apple M5 Pro con 48 GB de memoria unificada.
- GPU compatibles: al distribuirse en formato MLX, el modelo esta pensado para Apple Silicon (familias M). No se documenta soporte para A100, H100 ni RTX 4090 en esta conversion.
- Cabe en GPU de consumo: no en el sentido habitual (CUDA). Si cabe en equipos Apple Silicon de gama alta con memoria unificada suficiente.
- Opciones de despliegue: MTPLX 2.11.2 (comando `mtplx serve`, con endpoint compatible con OpenAI), MLX 0.32.2 y mlx-lm 0.31.3. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este repositorio, ya que no se ofrecen pesos GGUF ni safetensors estandar de HuggingFace Transformers.
- Rendimiento esperado: entre 32,42 tok/s en modo autorregresivo y hasta 71,70 tok/s con profundidad MTP 2, dependiendo de la carga. TTFT en torno a 0,13-0,16 s en chat en chino.
- Configuracion recomendada por el autor: perfil `sustained`, profundidad MTP 2, ventana de contexto 32.768, maximo 8.192 tokens de respuesta.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible comparativas con modelos de terceros de la misma categoria. La unica comparacion documentada es la cadena de repositorios de la que deriva esta conversion.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| xy10086/Qwen3.8-9B-Distill-Uncensored-Heretic-MTPLX-Q6G64 | 9.409.812.208 | 32.768 tokens (recomendado) | Q6 affine grupo 64, MTP y vision en BF16 | Apache-2.0 | Safetensors para MLX, Apple Silicon |
| petruhonk/Qwen3.8-9B-Distill-uncensored-heretic (modelo base) | no disponible | no disponible | no disponible | no disponible | Repositorio HuggingFace |
| empero-ai/Qwen3.8-9B-Distill (upstream) | no disponible | no disponible | no disponible | no disponible | Repositorio HuggingFace, incluye los sidecars de preprocesado de vision |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay evaluacion de sesgos publicada por el autor.
- Alucinacion: el propio autor advierte que un comportamiento de rechazo mas bajo no implica mayor precision factual. Las salidas medicas, legales, financieras y de alto riesgo deben verificarse de forma independiente.
- Riesgo de contenido inapropiado: el checkpoint de origen tiene el rechazo ablacionado, por lo que puede generar contenido que otros modelos bloquearian. Es responsabilidad del desplegador aplicar filtros y cumplir la normativa aplicable.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Contexto: 32.768 tokens es la configuracion recomendada, no necesariamente el maximo nativo del modelo. Ventanas mayores pueden degradar la calidad o agotar la memoria.
- Licencia: Apache-2.0 en este repositorio, pero el autor pide revisar tambien los requisitos de atribucion y licencia de los repositorios upstream (`petruhonk/...` y `empero-ai/...`), que no se detallan aqui.
- Dependencia de plataforma: al ser una conversion MLX, queda atada a Apple Silicon. No hay pesos GGUF ni safetensors estandar, lo que descarta su uso directo en vLLM, TGI, llama.cpp u Ollama.
- Validacion limitada: el repositorio tiene 0 descargas y 0 valoraciones en el momento de la consulta, y no se han encontrado analisis independientes. Las cifras publicadas provienen unicamente del autor.
- Nomenclatura: la etiqueta `qwen3.8` y el nombre del modelo no se corresponden con una denominacion oficial verificable en la informacion disponible; conviene tratarlos como nombres del repositorio, no como una linea de producto confirmada.
- Configuracion de referencia: los benchmarks se tomaron en un unico equipo (Apple M5 Pro, 48 GB). El rendimiento en otros chips puede diferir notablemente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xy10086/Qwen3.8-9B-Distill-Uncensored-Heretic-MTPLX-Q6G64
- Modelo base: https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Modelo upstream: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Paper, blog o repositorio de MTPLX: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
