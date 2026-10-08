# vosldtgbj/project-llm-sft-v3-f3-h0p5-seed20261006

## Resumen

El modelo `vosldtgbj/project-llm-sft-v3-f3-h0p5-seed20261006` es un ajuste fino supervisado (SFT) de pesos completos publicado por el usuario vosldtgbj dentro de una serie experimental denominada "Project LLM". Parte del checkpoint `vosldtgbj/project-llm-cpt-1p0-top10-01-full-02`, un modelo que ya había pasado por una fase de entrenamiento continuado (CPT) de 1,0 epoch, y sobre él se aplicó un SFT v3 con una mezcla de 90 % datos de dominio y 10 % datos generales durante 0,5 epoch con una tasa de aprendizaje de 2e-6.

Técnicamente es un modelo multimodal de arquitectura `gemma4_unified`, construido sobre la familia Gemma 4 de Google, con 11.959.730.176 parámetros (aproximadamente 11,96 mil millones) y un pipeline declarado como `any-to-any`. La model card indica que se carga mediante `AutoModelForMultimodalLM` y `AutoProcessor`, lo que confirma que admite entradas de imagen y texto (etiqueta `image-text-to-text`). El repositorio ocupa 24,0 GB y contiene pesos en safetensors fragmentados, sin estados de optimizador ni de scheduler.

Su relevancia es fundamentalmente de investigación y reproducibilidad: es un archivo de pesos íntegro para evaluar el efecto de una receta concreta de SFT (identificada como `F3--h0p5--seed20261006`) sobre un checkpoint CPT previo. Con cero descargas y cero likes en el momento de la consulta, no es un modelo orientado a producción, sino a experimentación offline. Un dato importante es que la model card remite a la licencia de Gemma 4 (`license_link` a `ai.google.dev/gemma/docs/gemma_4_license`) además de declarar `apache-2.0`, por lo que el uso queda sujeto a los términos del modelo Gemma 4 subyacente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (familia Gemma 4), multimodal any-to-any; transformer, detalles internos no disponibles |
| Parámetros totales | 11.959.730.176 (≈11,96 mil millones) |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se distribuyen pesos cuantizados; solo safetensors fragmentados (precisión de almacenamiento no declarada explícitamente; 24,0 GB para 11,96B parámetros es compatible con bf16/fp16) |
| Idiomas soportados | Etiqueta `japanese` en el repositorio; la model card está redactada en chino. Cobertura multilingüe completa no disponible |
| Licencia | `apache-2.0` declarada, con enlace a la licencia de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | Safetensors fragmentados (sharded), cargables con Transformers |
| Biblioteca | transformers |
| Pipeline | any-to-any (etiquetas `image-text-to-text`, `any-to-any`) |
| Modelo base | `vosldtgbj/project-llm-cpt-1p0-top10-01-full-02` |
| Tamaño del repositorio | 24,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-08 |
| Fecha de actualización | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma4_unified`, integrada en la familia Gemma 4 de Google, y se carga en Transformers mediante `AutoModelForMultimodalLM` junto con `AutoProcessor`. Esto implica un modelo multimodal que procesa imagen y texto dentro de un mismo grafo, con un pipeline `any-to-any` que sugiere capacidad de generar salidas en más de una modalidad. El repositorio no documenta el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema de tokenización multimodal, por lo que estos detalles figuran como no disponibles.

El entrenamiento se describe en dos etapas. La primera es un entrenamiento continuado (CPT) de 1,0 epoch, cuyo resultado es el checkpoint `project-llm-cpt-1p0-top10-01-full-02`. La segunda es el SFT v3 que da nombre a este repositorio: ajuste fino supervisado de pesos completos (Full SFT, sin LoRA ni adaptadores), durante 0,5 epoch, con tasa de aprendizaje 2e-6, sobre una mezcla de 90 % datos de dominio y 10 % datos generales. El identificador `F3--h0p5--seed20261006` codifica la variante de receta (`F3`), las 0,5 epochs (`h0p5`) y la semilla de entrenamiento (`seed20261006`). No se especifica el número de tokens de entrenamiento, la composición del dataset de dominio, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto multimodal: el pipeline `any-to-any` y las etiquetas `image-text-to-text` indican entrada de imagen y texto y salida generativa.
- Procesamiento de imagen y texto combinados mediante `AutoProcessor` y `AutoModelForMultimodalLM`.
- Soporte declarado del idioma japonés (etiqueta `japanese`), con presencia de documentación en chino; no se detalla la cobertura del resto de idiomas.
- Ajuste de dominio: el SFT se realizó con 90 % de datos de dominio, por lo que se espera una especialización en el dominio concreto del experimento (no especificado en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito ("thinking mode"): no disponible.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Reproducción de experimentos de ajuste fino: el repositorio contiene pesos completos cargables, sin estados de optimizador, lo que permite reconstruir el punto final de la receta `F3--h0p5--seed20261006` y compararlo con otras variantes de la misma serie.
- Evaluación offline de modelos multimodales: sirve como sujeto de pruebas para bancos de evaluación internos de imagen-texto, comparando el efecto del CPT y del SFT sobre el modelo Gemma 4 subyacente.
- Investigación sobre mezclas de datos: al documentarse una proporción 90/10 entre datos de dominio y datos generales, el checkpoint permite estudiar empíricamente el compromiso entre especialización y olvido catastrófico.
- Estudio de eficiencia de entrenamiento: con 0,5 epoch y LR 2e-6 sobre pesos completos, es un punto de referencia para analizar curvas de aprendizaje en ajuste completo de un modelo de ~12B parámetros.
- Punto de partida para SFT posteriores: al ser un peso intermedio de la serie "Project LLM", puede usarse como inicialización de nuevas fases de ajuste o de alineación (DPO, RLHF) en lugar de partir del modelo base.
- Evaluación de capacidades en japonés: dado el etiquetado `japanese`, es apropiado para probar la competencia del modelo en tareas japonesas dentro de un entorno multimodal.
- Despliegue experimental interno: mediante Transformers con `device_map="auto"` o con un servidor de inferencia tipo vLLM, para validar latencia y viabilidad antes de comprometerse a un modelo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (MMLU, HumanEval, GSM8K ni ninguna otra), y los resultados de búsqueda web obtenidos no aportan puntuaciones para este modelo ni para sus checkpoints predecesores.

## Requisitos de hardware

Las siguientes cifras son estimaciones de ingeniería derivadas del recuento de parámetros (11,96B) y del tamaño del repositorio (24,0 GB), no datos publicados por el autor.

- VRAM estimada para inferencia en bf16/fp16: en torno a 24-26 GB solo para pesos, más caché KV; con contexto largo, se recomienda reservar 30-40 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 13-15 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 7-9 GB de pesos (requiere convertir los safetensors a un formato cuantizado, ya que el repositorio solo distribuye safetensors).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para bf16 sin cuantizar; RTX 6000 Ada, RTX 4090 (24 GB) únicamente con cuantización de 8 o 4 bits para dejar margen a la caché KV.
- Viabilidad en GPU de consumidor: en una RTX 4090 de 24 GB cabe en 8 bits con contexto moderado y en 4 bits con holgura; en GPUs de 12-16 GB solo es realista con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: Transformers (requiere una versión que soporte `gemma4_unified`), vLLM para servicio de alto rendimiento, TGI y, previa conversión, llama.cpp u Ollama en formato GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto de este modelo, y los resultados de búsqueda no aportan comparativas con alternativas. La única referencia verificable es su propio linaje dentro de la serie "Project LLM".

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `project-llm-sft-v3-f3-h0p5-seed20261006` (este) | 11,96B | No disponible | Apache-2.0 + términos de Gemma 4 | Repositorio HuggingFace, 0 descargas | SFT v3, 0,5 epoch, LR 2e-6 |
| `project-llm-cpt-1p0-top10-01-full-02` (modelo base) | No disponible | No disponible | No disponible | Repositorio HuggingFace | CPT de 1,0 epoch; predecesor directo |
| Modelo Gemma 4 subyacente | No disponible | No disponible | Licencia Gemma 4 | No disponible en esta búsqueda | Arquitectura `gemma4_unified` de la que deriva |
| Alternativas de ~12B multimodales de otros proveedores | No disponible | No disponible | No disponible | No disponible | Sin datos comparativos en la información recopilada |

## Limitaciones y advertencias

- Ausencia total de datos de evaluación: no hay benchmarks publicados, por lo que no puede afirmarse su rendimiento relativo frente a otros modelos.
- Riesgo de alucinación: no se documenta ningún proceso de alineación posterior al SFT (RLHF, DPO) que lo mitigue; el riesgo es el propio del modelo Gemma 4 subyacente más el inducido por el ajuste de dominio.
- Sesgos conocidos: no disponibles; no se documenta la composición del dataset de entrenamiento ni si se aplicaron filtros de sesgo.
- Especialización estrecha: al emplear 90 % de datos de dominio, existe riesgo de degradación en tareas generales fuera de ese dominio (olvido catastrófico) frente al modelo base.
- Cobertura idiomática incierta: solo se declara japonés mediante etiqueta; no hay confirmación de un buen rendimiento en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no puede planificarse un caso de uso que dependa de ventanas largas sin medirla previamente.
- Licencia con doble restricción: aunque el repositorio declara `apache-2.0`, la model card remite explícitamente a la licencia de Gemma 4, cuyos términos adicionales pueden condicionar el uso comercial. Es imprescindible revisarlos antes de cualquier despliegue productivo.
- Madurez del ecosistema: la arquitectura `gemma4_unified` exige versiones recientes de Transformers y no está garantizado que vLLM, llama.cpp u Ollama la soporten sin conversión o adaptación previa.
- Estado experimental: 0 descargas y 0 likes, sin documentación de mantenimiento; es un archivo de pesos para investigación, no un modelo soportado.
- No incluye estados de optimizador ni de scheduler, por lo que no permite reanudar el entrenamiento, solo inferencia o nuevos ajustes desde los pesos finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-sft-v3-f3-h0p5-seed20261006
- Modelo base (CPT): https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-01-full-02
- Licencia de Gemma 4 referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de vLLM (opción de despliegue): https://github.com/vllm-project/vllm
- Sitio oficial de vLLM: https://vllm.ai/
- Documentación de vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
- Organización vllm-project en GitHub: https://github.com/vllm-project
- LLM Leaderboard & AI Model Benchmarks (octubre de 2026), para consultar comparativas externas: https://benchlm.ai/
