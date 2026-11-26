# synthetic-minds/Hy-4-Astral-GGUF

## Resumen

Hy-4-Astral-GGUF es una cuantizacion GGUF Q4_K_M del modelo multimodal Tencent Hy4-flash, publicada por el colectivo Synthetic Minds bajo la coleccion Astral GGUF. El modelo base es un Mixture-of-Experts (MoE) multimodal desarrollado por Tencent que acepta entradas de texto e imagen y genera texto, con 222.679.844.717 parametros totales segun los pesos safetensors del repositorio base.

El objetivo de esta publicacion es llevar Hy4-flash al ecosistema `llama.cpp` mediante una rama especifica habilitada para su arquitectura, permitiendo ejecutar un modelo de gran tamano en hardware local con un peso de 156,79 GiB y una tasa efectiva de 6,05 bits por peso (5,27 bpw excluyendo la tabla Engram). La cuantizacion sigue la receta Q4_K_M de `llama.cpp` para los expertos enrutados, con pesos no-expertos mayoritariamente en Q8_0.

Es relevante ahora porque permite desplegar un MoE multimodal de escala frontier en infraestructura propia sin depender de APIs cerradas, aunque con requisitos de memoria considerables y una licencia propia de Tencent que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, transformer |
| Parametros totales | 222.679.844.717 (222,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (expertos `gate`/`up` en Q4_K; `down` en Q6_K en 19 capas y Q4_K en 22 capas; pesos no-expertos mayoritariamente Q8_0) |
| Idiomas soportados | Ingles y multilingue |
| Licencia | Tencent Hy License (licencia propia, no estandar) |
| Formato de pesos | GGUF (cuantizado); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Tencent Hy4-flash es un Mixture-of-Experts multimodal con entradas de texto e imagen y salida de texto. La cuantizacion preserva la arquitectura original e incluye una tabla Engram que afecta al peso total del checkpoint. Los expertos enrutados se cuantizan siguiendo la receta fija Q4_K_M de `llama.cpp`: las proyecciones `gate` y `up` en Q4_K en todas las capas de expertos, y la proyeccion `down` en Q6_K en 19 capas seleccionadas por la regla fija y Q4_K en las 22 restantes. La mayoria de los pesos no-expertos se almacenan en Q8_0.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo original. Esta ficha documenta la cuantizacion, no el entrenamiento upstream.

## Capacidades

- Generacion de texto a partir de entradas de texto e imagen (pipeline `image-text-to-text`).
- Razonamiento multimodal y conversacion multi-turno (tag `conversational`).
- Capacidades multilingues, con ingles como idioma principal declarado.
- Arquitectura MoE, lo que implica activacion selectiva de expertos por token (aunque el numero de parametros activos no se detalla en la informacion disponible).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un modelo multimodal de gran escala: con `llama.cpp` y la rama Hy4-flash, se puede ejecutar en servidores con suficiente memoria para alojar los 156,79 GiB del checkpoint cuantizado, sin dependencia de APIs externas.
- Procesamiento de documentos con imagenes: al aceptar entradas de imagen y texto, puede extraer y razonar sobre contenido de capturas, diagramas o formularios en flujos de digitalizacion.
- Asistentes conversacionales multilingues: el soporte multilingue permite construir chatbots que atiendan usuarios en varios idiomas con contexto de conversacion.
- Investigacion sobre cuantizacion de MoE: el repositorio documenta con detalle la receta Q4_K_M aplicada a expertos, sirviendo como referencia para estudiar el impacto del bpw en modelos MoE multimodales.
- Experimentacion academica con modelos frontier: investigadores sin acceso a clusters de GPU de gama alta pueden evaluar un MoE de 222,7 B en hardware propio con la cuantizacion Q4_K_M.
- Pipelines de inferencia autoalojados compatibles con endpoints: el tag `endpoints_compatible` sugiere integracion en servicios que exponen una API compatible, util para entornos con requisitos de privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint cuantizado ocupa 156,79 GiB, por lo que se necesita al menos esa cantidad de memoria (VRAM o RAM del sistema con offloading) para cargarlo completo.
- GPU recomendadas: no se especifican en la informacion disponible; por el volumen de memoria, se requiere hardware de clase servidor (multiples A100/H100 o configuraciones equivalentes con memoria agregada).
- Cabe en GPU de consumo: no, un checkpoint de 156,79 GiB no cabe en GPUs consumer de 24 GB (RTX 4090) ni en configuraciones SLI/NVLink habituales; requeriria offloading masivo a RAM.
- Opciones de despliegue: `llama.cpp` exclusivamente, mediante la rama Hy4-flash habilitada (PR 32517 del repositorio ggml-org/llama.cpp). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables (contexto, benchmarks, parametros activos) que permitan una comparativa rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia Tencent Hy License: es una licencia propia no estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de licencias open source convencionales.
- Requiere una rama especifica de `llama.cpp` (PR 32517); no funciona con la version estable del runtime, lo que complica el mantenimiento y la reproducibilidad en produccion.
- El checkpoint esta dividido en shards (`Hy4-flash-Q4_K_M-00001-of-00002.gguf`); es necesario conservar ambos ficheros en el mismo directorio y pasar el primer shard al runtime.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo original; no se han publicado evaluaciones del impacto en calidad.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a modelos de lenguaje de gran escala.
- Idioma: el soporte declarado se centra en ingles y multilingue generico; no se garantiza un rendimiento optimo en castellano.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se especifican parametros activos del MoE, contexto maximo ni requisitos minimos de hardware, lo que dificulta el dimensionamiento de despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/synthetic-minds/Hy-4-Astral-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Coleccion Astral GGUF: https://hf.co/collections/synthetic-minds/astral-gguf-quants
- Web de Synthetic Minds: https://www.syntheticmindslab.com
- GitHub de Synthetic Minds: https://github.com/syntheticminds-lab
- Repositorio `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Rama Hy4-flash (PR): https://github.com/ggml-org/llama.cpp/pull/32517
- X (empresa): https://x.com/syntheticminds2
- X (autor): https://x.com/tudoriustin_
- LinkedIn: https://www.linkedin.com/company/synthetic-minds-lab/
- Buy Me a Coffee: https://buymeacoffee.com/syntheticminds_lab
