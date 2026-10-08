# vosldtgbj/project-llm-sft-v3-f3-h2p0-seed20261006

## Resumen

`vosldtgbj/project-llm-sft-v3-f3-h2p0-seed20261006` es un checkpoint multimodal de aproximadamente 11.960 millones de parametros publicado por el usuario `vosldtgbj` bajo el identificador interno de experimento `F3--h2p0--seed20261006`. Se trata de la tercera iteracion de ajuste supervisado (SFT v3) del "Project LLM", construida sobre el modelo `vosldtgbj/project-llm-cpt-1p0-top10-01-full-02`, que a su vez es el resultado de una fase de preentrenamiento continuado (CPT 1.0) de una epoca. El repositorio se presenta explicitamente como un archivo de pesos completos para reproduccion de experimentos, evaluacion offline e investigacion posterior.

El modelo se apoya en la arquitectura `gemma4_unified` y se carga con `AutoModelForMultimodalLM` y `AutoProcessor` de Transformers, lo que situa la familia en el terreno multimodal. Las etiquetas del repositorio incluyen `image-text-to-text` y `any-to-any`, y el pipeline declarado es `any-to-any`; una de las etiquetas de idioma es `japanese`, aunque el campo de idiomas de los metadatos aparece como no disponible y la model card esta redactada en chino. Esa ambiguedad es relevante a la hora de planificar su uso en produccion.

El interes de esta ficha es acotado: no es un modelo de proposito general con benchmarks publicos ni una release oficial, sino un artefacto de investigacion con cero descargas y cero "likes" en el momento de la consulta. Su valor practico esta en servir de base reproducible para experimentos de ajuste (SFT continuado y LoRA), en la evaluacion comparativa de checkpoints intermedios y en el analisis de modelos multimodales derivados de la familia Gemma 4. No se ha publicado informacion sobre longitud de contexto, volumen de tokens de entrenamiento ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (familia Gemma 4; carga mediante `AutoModelForMultimodalLM`) |
| Parametros totales | 11.959.730.176 (aprox. 11,96 mil millones, dato real de los safetensors) |
| Parametros activos | No aplica segun la informacion disponible; no se ha confirmado que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados. El repositorio contiene safetensors en precision completa (24,0 GB para 11,96 B de parametros, compatible con bf16/fp16). Cuantizacion a INT8/INT4 posible a posteriori, pero no verificada por el autor |
| Idiomas soportados | No disponible en los metadatos. La etiqueta del repositorio indica `japanese`; la model card esta redactada en chino; el campo de idiomas figura como no disponible |
| Licencia | `apache-2.0` en los metadatos, pero la model card enlaza `license_link` a la licencia de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`) y exige cumplir tambien los terminos del modelo Gemma 4 subyacente. Existe una discrepancia sin resolver entre ambas declaraciones |
| Formato de pesos | Safetensors fragmentados (sharded), con configuracion y processor incluidos. No incluye estados de optimizador, scheduler ni semillas |
| Modelo base | `vosldtgbj/project-llm-cpt-1p0-top10-01-full-02` (tipo de relacion: `finetune`) |
| Libreria | Transformers |
| Pipeline | `any-to-any` |
| Tamano del repositorio | 24,0 GB |
| Fecha de publicacion | 2026-10-08 (ultima actualizacion: 2026-10-08) |
| Compatibilidad con endpoints | Si (`endpoints_compatible` en las etiquetas) |

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma4_unified`, una variante de la familia Gemma 4 orientada a entrada multimodal (etiquetas `image-text-to-text` y `any-to-any`). El codigo de carga facilitado por el autor usa `AutoProcessor` y `AutoModelForMultimodalLM`, lo que confirma que el modelo espera entradas conjuntas de imagen y texto y que requiere una version de Transformers con soporte para dicha arquitectura. No se detallan en la informacion disponible el numero de capas, la dimension oculta, el tipo de atencion, la estrategia de tokenizacion de imagenes ni el vocabulario. Tampoco se especifica si incorpora mecanismos como atencion lineal, decodificacion especulativa o modos de razonamiento explicito.

El entrenamiento se describe como una cadena de dos fases. Primero, un preentrenamiento continuado (CPT 1.0, una epoca) que da lugar al checkpoint `cpt-1p0-top10-01-full-02`; despues, un ajuste supervisado completo (Full SFT, no LoRA) durante 2,0 epocas con una tasa de aprendizaje de 2e-6 sobre una mezcla de datos compuesta por un 90% de datos de dominio y un 10% de datos de proposito general. No se indica el numero total de tokens vistos, la composicion concreta del dataset de dominio, si hubo etapas de RLHF, DPO o preferencias, ni si se aplicaron tecnicas de mitigacion de olvido catastrofico mas alla de la mezcla 90/10. El repositorio es un archivo de pesos de inferencia: no contiene datos de continuacion de entrenamiento, lo que limita la reanudacion exacta del proceso, aunque permite el ajuste posterior desde los pesos finales.

## Capacidades

- Generacion de texto e inferencia multimodal de imagen a texto, segun las etiquetas `image-text-to-text` y `any-to-any` del repositorio.
- Procesamiento conjunto de entradas de imagen y texto mediante `AutoProcessor`, con salida en formato `any-to-any`.
- Soporte declarado del idioma japones a traves de la etiqueta `japanese`; el resto de idiomas no esta documentado.
- Modelo ajustado por SFT sobre un corpus mayoritariamente de dominio (90%), por lo que su comportamiento esta especializado en el dominio de entrenamiento y puede degradarse fuera de el.
- Punto de partida para ajuste supervisado adicional y para adaptaciones con LoRA, al distribuirse los pesos completos en safetensors.
- Capacidades de tool calling o function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo de pensamiento explicito (`thinking mode`), audio o generacion de imagenes: no disponible.

## Casos de uso

- Reproduccion de experimentos de ajuste supervisado: el repositorio se publica como archivo de pesos para replicar el resultado del experimento `F3--h2p0--seed20261006` (SFT v3, 2,0 epocas, LR 2e-6) y compararlo con otras semillas.
- Evaluacion offline de pipelines multimodales en japones: cargando el modelo con `AutoModelForMultimodalLM` en un entorno aislado, se pueden medir tasas de acierto en tareas de descripcion de imagenes o respuesta a preguntas visuales cuando el conjunto de evaluacion comparte idioma y dominio con los datos de SFT.
- Ajuste continuado sobre datos propios: al ofrecer pesos completos y no solo adaptadores, permite partir de este checkpoint para un nuevo ciclo de SFT o para entrenamiento con LoRA sobre dominios adyacentes, reutilizando el preentrenamiento continuado ya realizado.
- Ablation de mezcla de datos: la proporcion 90% dominio / 10% general es un parametro reproducible; usar este checkpoint como referencia permite medir el efecto de variar esa mezcla en modelos derivados.
- Investigacion sobre arquitecturas Gemma 4: sirve como ejemplo funcional de la ruta de carga `gemma4_unified` con `AutoProcessor` y `AutoModelForMultimodalLM` para desarrolladores que integren esta familia en sus propias herramientas.
- Base para prototipos internos de asistente multimodal en japones: con cuantizacion INT8 o INT4 puede desplegarse en una GPU de 24 GB para demos controladas, siempre que el dominio coincida con el del ajuste y se validen previamente las salidas.
- Comparacion de checkpoints de una misma cadena CPT y SFT: al existir el modelo base `cpt-1p0-top10-01-full-02` y este SFT v3, es posible aislar la contribucion del ajuste supervisado en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no referencia ningun conjunto de validacion (MMLU, GSM8K, HumanEval, MMMU u otros) y no se ha identificado en la busqueda web ningun informe asociado al identificador `vosldtgbj/project-llm-sft-v3-f3-h2p0-seed20261006`. Cualquier cifra de rendimiento atribuida a este checkpoint seria una extrapolacion no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 24 GB solo para los pesos (11,96 B de parametros a 2 bytes), mas la cache KV y las activaciones. Un presupuesto realista de 28 a 32 GB cubre contextos cortos; contextos largos y lotes grandes elevan esa cifra.
- VRAM estimada con cuantizacion: aproximadamente 12 a 14 GB en INT8 y 7 a 9 GB en INT4, siempre que la conversion se realice con exito sobre la arquitectura `gemma4_unified` (no verificada por el autor).
- GPU profesionales: A100 de 40 GB o 80 GB, H100 de 80 GB y A6000 de 48 GB son las opciones comodas para bf16 sin offload.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB queda al limite en bf16 (requiere cuantizacion, offload a CPU o contextos muy cortos); en INT4 el modelo encaja con holgura. Varias GPU de 24 GB mediante `device_map="auto"` son una alternativa viable.
- Opciones de despliegue: Transformers con una version que soporte `gemma4_unified` y el processor multimodal; vLLM o TGI para servido de alto rendimiento, sujeto a que soporten esta arquitectura concreta (no confirmado). llama.cpp y Ollama no son utilizables directamente porque el repositorio solo publica safetensors y no pesos GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo, tiempo hasta el primer token ni escalado con tamano de lote para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos publicados de terceros comparables para este checkpoint concreto (0 descargas, 0 "likes", sin model card de evaluacion). La comparacion mas fiable es interna a la propia cadena de entrenamiento del autor:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `project-llm-sft-v3-f3-h2p0-seed20261006` (este modelo) | 11,96 B | No disponible | `apache-2.0` con enlace a licencia Gemma 4 | Pesos safetensors, 24,0 GB | SFT v3: 90% dominio / 10% general, 2,0 epocas, LR 2e-6 |
| `project-llm-cpt-1p0-top10-01-full-02` (modelo base) | No disponible | No disponible | No disponible | Repositorio de HuggingFace | CPT 1.0 de una epoca; base sobre la que se aplica este SFT |
| Gemma 4 (modelo upstream de la arquitectura) | No disponible en la informacion proporcionada | No disponible | Licencia Gemma 4 | Pesos oficiales de Google | Arquitectura `gemma4_unified` referenciada en la model card y en el enlace de licencia |

No se han identificado en la busqueda web modelos alternativos de terceros con los que comparar parametros, contexto o rendimiento de forma verificable.

## Limitaciones y advertencias

- Ambiguedad de licencia: los metadatos declaran `apache-2.0`, pero la model card enlaza la licencia de Gemma 4 y exige cumplir tambien los terminos del modelo upstream. Antes de cualquier uso comercial debe resolverse cual prevalece, ya que la licencia de Gemma 4 puede imponer restricciones adicionales.
- Ausencia total de evaluacion publicada: no hay benchmarks, ni conjunto de validacion documentado, ni informes de terceros. Cualquier despliegue en produccion parte de una base de evidencia nula.
- Riesgo de alucinacion no cuantificado: al ser un modelo ajustado con SFT y sin informacion sobre etapas de alineacion con preferencias (RLHF/DPO), no hay datos sobre tasas de fabricacion de hechos, especialmente fuera del dominio de entrenamiento.
- Sesgo de dominio: el 90% de los datos de SFT pertenecen a un dominio no especificado, por lo que el modelo puede degradarse de forma acusada en tareas generales y en idiomas distintos del japones.
- Idiomas no confirmados: la etiqueta `japanese` es la unica referencia de idioma, mientras que los metadatos indican "no disponible" y la model card esta en chino. No se puede asumir un comportamiento fiable en castellano.
- Ventana de contexto desconocida: al no publicarse la longitud de contexto, no es posible planificar tareas de contexto largo ni estimar el consumo de cache KV.
- Dependencia de versiones de Transformers: la carga requiere soporte explicito para `gemma4_unified` y para `AutoModelForMultimodalLM`. Versiones antiguas de la libreria fallaran al cargar el modelo.
- Ecosistema de despliegue limitado: no hay pesos GGUF ni cuantizaciones publicadas, y no esta confirmado que vLLM o TGI soporten esta arquitectura, lo que reduce las opciones de servido optimizado.
- Artefacto de investigacion sin traccion: cero descargas y cero "likes" en el momento de la consulta implica ausencia de validacion por parte de la comunidad.
- Repositorio de solo pesos: no incluye estados de optimizador ni de scheduler, por lo que no es posible reanudar el entrenamiento exactamente donde se dejo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-sft-v3-f3-h2p0-seed20261006
- Modelo base (CPT 1.0): https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-01-full-02
- Licencia de Gemma 4 referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- vLLM, motor de inferencia de alto rendimiento: https://github.com/vllm-project/vllm
- vLLM, sitio oficial: https://vllm.ai/
- LLM Leaderboard y comparador de benchmarks (octubre de 2026): https://benchlm.ai/
- Plantilla de ajuste supervisado automatizado de LLM en Google Cloud: https://github.com/vpoluyaktov/llm-sft-test
- Guia de despliegue autoalojado de espacios de trabajo de IA: https://odysseusai.dev/
