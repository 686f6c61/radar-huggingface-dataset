# stealth-model/Qwen3.8-Flash-Next__Qwen4-news

## Resumen
Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Alibaba Qwen, publicado como preview de la arquitectura de la futura familia Qwen 4. El repositorio analizado, alojado por Stealth Models, distribuye versiones cuantizadas en formato GGUF para su ejecución local con llama.cpp, junto con material informativo sobre el lanzamiento de Qwen 4. El modelo base cuenta con 176.943.899.520 parámetros totales (unos 177 mil millones) y una arquitectura de 512 expertos, de los cuales 10 se activan por token, lo que reduce drásticamente el coste computacional por inferencia frente a un modelo denso de tamaño equivalente.

La propuesta técnica más relevante es la combinación de atención dispersa (sparse attention) con una memoria de n-gramas aprendida (learned n-gram memory), que actúa como mecanismo de recuperación asociativa sobre el contexto. El modelo lee 262.144 tokens de forma nativa y hasta 1.000.000 con extensión YaRN. Además incorpora capacidades de visión mediante proyectores multimodales (mmproj) y una capa de predicción multi-token (MTP) que acelera la decodificación.

Es relevante ahora porque Qwen4-Max solo está disponible vía API, mientras que este preview permite ejecutar la arquitectura Qwen 4 en hardware local, desde equipos con 16 GB de VRAM y 64 GB de RAM hasta estaciones con 192 GB de memoria unificada. La licencia es `qwen-community-1.0`, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa y memoria de n-gramas aprendida; 48 capas de expertos |
| Parametros totales | 176.943.899.520 (~177 mil millones) |
| Parametros activos | 10 expertos de 512 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 con YaRN (escala 4); 524.288 con escala 2 |
| Tipos de cuantizacion | Q2_K_XL, Q4_K_XL, Q5_K_XL; proyectores de visión Q8_0, F16, Q6_K, Q4_K; MTP en Q8_0 y Q4_K_M; caché KV q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo emplea una arquitectura MoE con 512 expertos y enrutamiento que activa 10 expertos por token, distribuidos en 48 capas de expertos. Junto a la atención dispersa incorpora una tabla de memoria de n-gramas aprendida (`per_layer_token_embd.weight`), de aproximadamente 29 GB en Q2 y 54 GB en Q5, que puede residir en RAM o en SSD y que aporta recuperación asociativa sobre secuencias largas. El contexto nativo es de 262.144 tokens, extensible a 1.000.000 mediante YaRN. Dispone de un proyector multimodal separado para visión y de una capa MTP (multi-token prediction) entrenada por Qwen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La información disponible tampoco detalla innovaciones adicionales más allá del esquema de memoria n-gramas, la atención dispersa, el soporte MTP y la decodificación especulativa mediante `ngram-mod` (que genera borradores a partir de texto ya presente en el contexto sin coste de memoria).

## Capacidades
- Generación de texto conversacional y de formato largo, con contexto nativo de 262.144 tokens.
- Razonamiento y procesamiento de documentos extensos gracias a la ventana ampliada y a la memoria de n-gramas.
- Capacidades de visión a través de los proyectores `mmproj` (Q8_0, F16, Q6_K, Q4_K).
- Decodificación especulativa con MTP y con `ngram-mod` para acelerar la salida (1,3 a 1,7x según medición de Unsloth citada en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso
- Ejecución local de un modelo de escala ~177B en equipos de consumo: con Q2_K_XL y `--n-cpu-moe 34` puede correr en una GPU de 24 GB con 64 GB de RAM, manteniendo solo 4-5,5 GB en VRAM y los expertos en memoria del sistema.
- Análisis de documentos largos: la ventana nativa de 262k tokens permite procesar contratos, informes o bases de código completas sin fragmentación; con YaRN se alcanza 1M para corpus aún mayores.
- Edición y resumen de código: la decodificación `ngram-mod` aprovecha el texto ya presente en el contexto, lo que resulta especialmente eficaz en tareas donde la salida repite parte de la entrada (parches, resúmenes, refactorizaciones).
- Procesamiento multimodal en local: los proyectores `mmproj` habilitan descripción de imágenes y tareas visión-lenguaje con un coste adicional de VRAM de entre 0,46 y 0,9 GB según cuantización.
- Despliegue en estaciones de memoria unificada: en AMD Strix Halo o NVIDIA DGX Spark con 128 GB unificados, el Q4_K_XL cabe íntegramente en la GPU/APU, eliminando el offload de expertos a CPU.
- Servicio de inferencia self-hosted: mediante `llama-server` con caché KV q4_0 (unos 2 GB a 256k y 8 GB a 1M), adecuado para entornos donde no se quiere depender de una API externa.
- Investigación sobre arquitecturas MoE y memoria asociativa: la tabla de n-gramas y el esquema de atención dispersa son objetos de estudio reproducibles con los GGUF publicados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta una medición de velocidad: Unsloth midió entre 1,3 y 1,7 veces más velocidad de salida con la capa MTP activada. No se aportan cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar.

## Requisitos de hardware
- VRAM mínima en GPU: 4 a 5,5 GB, ya que los expertos pueden residir en RAM del sistema mediante `--n-cpu-moe`.
- RAM para expertos: 40-43 GB (Q2 a 256k/1M en 16 GB de VRAM), 66-73 GB (Q4 en 24 GB de VRAM con 96 GB de RAM), 80-86 GB (Q5 en 32 GB de VRAM con 128 GB de RAM).
- Tabla de n-gramas: 29 GB en Q2 y 54 GB en Q5; puede mantenerse en SSD con `--lazy-mode on` o en RAM con `--lazy-mode off`.
- GPU de consumo compatibles: tarjetas de 16, 24 y 32 GB de VRAM (por ejemplo, gamas RTX 4090 y superiores según la tabla de la model card).
- Plataformas de memoria unificada: AMD Strix Halo y NVIDIA DGX Spark con 128 GB, donde el Q4_K_XL cabe entero; equipos de 192 GB o más admiten Q5_K_XL íntegro.
- Software: llama.cpp build b11971 (28 de octubre) o superior; la MTP requiere la rama `qwen4exp/mtp` de Unsloth, con soporte en revisión para llama.cpp oficial.
- Caché KV: con `-ctk q4_0 -ctv q4_0` ocupa unos 2 GB a 256k y 8 GB a 1M.
- Throughput y latencia: no disponibles salvo el factor 1,3-1,7x de la MTP.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia contextual, la model card menciona que Qwen4-Max se lanzó el 16 de noviembre únicamente como API y que Alibaba prevé liberar pesos de modelos Qwen 4 más pequeños sin fecha confirmada, pero no se aportan parámetros, contexto ni benchmarks de esos modelos.

## Limitaciones y advertencias
- La licencia `qwen-community-1.0` está etiquetada como "other"; es necesario revisar el texto completo antes de cualquier uso comercial.
- El repositorio es una distribución de terceros (Stealth Models) de un modelo base de Alibaba; no es una publicación oficial de Qwen.
- La model card mezcla información del modelo con contenido promocional sobre Qwen 4 y enlaces externos; conviene tratar esos materiales con cautela.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo.
- Los idiomas soportados no están documentados, lo que impide garantizar calidad fuera del inglés o del chino sin pruebas propias.
- El uso de YaRN para alcanzar 1M de contexto degrada potencialmente la calidad; la propia model card indica que Qwen recomienda YaRN solo cuando se necesita esa longitud.
- El soporte MTP depende de una rama no oficial de llama.cpp, lo que introduce riesgo de inestabilidad en producción.
- El tamaño del repositorio (355,7 GB) y la necesidad de RAM abundante limitan el despliegue a equipos con al menos 64 GB de memoria del sistema.
- La cuantización Q2_K_XL implica pérdida de calidad apreciable frente a Q4 o Q5; la elección debe validarse con evaluaciones propias.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/stealth-model/Qwen3.8-Flash-Next__Qwen4-news
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/stealth-model/Qwen3.8-Flash-Next__Qwen4-news/blob/main/Qwen3.8-Flash-Next/LICENSE
- Sitio del distribuidor: https://stealthmodels.com
- Tarjeta social del proyecto: https://stealthmodels.com/qwen-4/assets/social-card-v2.png
