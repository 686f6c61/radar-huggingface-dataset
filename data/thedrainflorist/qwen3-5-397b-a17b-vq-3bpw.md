# TheDrainFlorist/Qwen3.5-397B-A17B-VQ-3bpw

## Resumen

Este repositorio contiene una cuantización mediante *vector quantization* (VQ) del modelo Qwen3.5-397B-A17B, un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Alibaba. El checkpoint original tiene 397 mil millones de parámetros totales con 17 mil millones activos por token, y emplea una arquitectura de *gated delta networks* con 512 expertos. La versión cuantizada, creada por TheDrainFlorist, reduce el peso a aproximadamente 3,045 bits por parámetro, ocupando 143,7 GiB en disco, y está optimizada para ejecutarse en Apple Silicon mediante la librería MLX.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 397B en hardware de memoria unificada grande (a partir de 192 GB) sin necesidad de GPUs de servidor, manteniendo una calidad cercana a la del modelo original. El autor reporta mediciones de perplejidad en *wikitext* y *code* que lo sitúan a la par o ligeramente por encima de otras cuantizaciones comunitarias de tamaño similar. Es una opción práctica para desarrolladores que trabajan en entornos Apple Silicon con abundante memoria y necesitan un modelo de gran capacidad con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con *gated delta networks*, 512 expertos, multimodal (vision + texto) |
| Parametros totales | 397B (modelo base); 42.195.805.680 en safetensors (checkpoint cuantizado VQ) |
| Parametros activos | 17B (modelo base) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5 soporta contexto largo, pero no se especifica en esta ficha) |
| Tipos de cuantizacion | VQ 3,045 bits/peso (este repo); tambien disponible VQ-2,6bpw del mismo autor |
| Idiomas soportados | en (segun la model card; el modelo base es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B es un MoE multimodal con 512 expertos y 17B parametros activos por token, basado en *gated delta networks* (una variante de atención lineal). Incluye una torre de vision que permite procesar imagenes ademas de texto. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF/DPO.

Este repositorio no es un entrenamiento nuevo, sino una cuantizacion vectorial del checkpoint original. La tecnica VQ reemplaza los pesos densos por codebooks e indices, de modo que cada peso se representa como un indice a una entrada de un codebook aprendido. El autor utilizo un ajuste por k-means para construir los codebooks, y reporta que el resultado final alcanza 3,045 bits por peso (3,06 incluyendo la torre de vision). No se requieren parches ni forks para ejecutarlo con `mlx-lm`; el `config.json` declara un `model.py` incluido en el propio repositorio.

## Capacidades

- Generacion de texto y razonamiento complejo: es un modelo de razonamiento que produce cadenas de pensamiento antes de la respuesta final.
- Capacidades multimodales: el modelo base procesa imagenes y texto, aunque este checkpoint no documenta explicitamente el soporte de vision en la inferencia.
- Razonamiento matematico y cientifico: el modelo base alcanza puntuaciones altas en GPQA Diamond (88,4%) y MMLU-Pro (87,8%) segun fuentes externas.
- Generacion de codigo y resolucion de tareas de ingenieria de software: SWE-bench Verified 80,0% y Terminal-Bench 2.0 54,0% (datos del modelo base, no verificados en esta cuantizacion).
- Soporte para agentes y tool calling: el modelo base esta disenado para tareas agénticas, RAG y llamadas a herramientas.
- Multilingue: el modelo base soporta multiples idiomas, aunque la model card de este repo solo declara ingles.

## Casos de uso

- Desarrollo local de agentes autonomos: con 192 GB de memoria unificada en un Mac Studio o Mac Pro, se puede ejecutar este modelo para prototipar agentes que razonan, llaman herramientas y gestionan conversaciones multi-turno sin depender de APIs externas.
- Analisis de documentos extensos: gracias a su gran contexto (no especificado, pero propio de la familia Qwen3.5), es adecuado para resumir y extraer informacion de libros, informes o codigo fuente de gran tamaño.
- Generacion de codigo en entornos offline: equipos que trabajan con datos sensibles pueden usar este checkpoint para asistencia de programacion, revision de codigo y generacion de tests sin enviar informacion a la nube.
- Investigacion en IA: permite experimentar con un modelo de 397B en hardware de consumo (Apple Silicon) para estudiar comportamiento, alineacion o tecnicas de cuantizacion.
- Despliegue en clusters exo: combinando dos Macs (por ejemplo, 96 GB + 128 GB) via Thunderbolt, se puede servir el modelo de forma distribuida, aunque requiere el fork especifico para VQ.
- Creacion de contenido tecnico: redaccion de documentacion, tutoriales o explicaciones de conceptos complejos con alta coherencia y profundidad.

## Benchmarks y rendimiento

La model card proporciona mediciones de perplejidad (menor es mejor) realizadas sobre este artefacto exacto con `mlx-lm` sin modificar:

| Metrica | Este modelo (VQ-3bpw, 143,7 GiB) | spicyneuron 3.5bit (165,6 GiB) | VQ-3.1bpw anterior (143,7 GiB) |
|---|---|---|---|
| Wikitext perplexity (raw, prefix-8192) | **2,3410** | 2,3614 | 2,3519 |
| Code perplexity (mixed-language) | **2,5963** | 2,6005 | 2,5987 |

El autor indica que la mejora en wikitext (-0,86% frente a spicyneuron) supera el ruido de ajuste, mientras que la diferencia en code (-0,16%) se considera un empate. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion concreta.

## Requisitos de hardware

- Memoria: 143,7 GiB en disco (~142,8 GiB residente). No cabe en una maquina con 128 GB de RAM unificada.
- Apple Silicon: se requiere un unico equipo con >= 192 GB de memoria unificada (por ejemplo, M2 Ultra o M3 Ultra con 192 GB o 256 GB).
- Clusters exo: es posible usar un cluster de dos maquinas (por ejemplo, 96 GB + 128 GB) via Thunderbolt, pero el sharding de codebooks VQ requiere el fork `noahzelezny/exo:vq-codebook-replicate` (PR #2268 sin fusionar). El `model.py` incluido lanza un error si detecta codebooks fragmentados.
- Opciones de despliegue: `mlx-lm` (pip install mlx-lm) para generacion local; exo para despliegue distribuido.
- Latencia y throughput: no se han medido para este artefacto; el autor no proporciona cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (original) | 397B total, 17B activo | no disponible | FP8 (oficial) | ~400+ GiB | Apache 2.0 | Modelo base, requiere GPUs de servidor |
| Este repo (VQ-3bpw) | 397B (original) | no disponible | VQ 3,045 bpw | 143,7 GiB | Apache 2.0 | Optimizado para Apple Silicon, MLX |
| spicyneuron 3.5bit | 397B (original) | no disponible | 3,5 bits | 165,6 GiB | no disponible | Cuantizacion comunitaria, peor perplejidad en wikitext |
| VQ-2.6bpw (mismo autor) | 397B (original) | no disponible | VQ 2,6 bpw | no disponible | Apache 2.0 | Version mas agresiva, menor calidad esperada |

## Limitaciones y advertencias

- Requiere hardware especifico: al menos 192 GB de memoria unificada en Apple Silicon; no es utilizable en GPUs NVIDIA convencionales sin adaptar el formato MLX.
- Riesgo de degradacion por cuantizacion: aunque la perplejidad es cercana a la del modelo original, la cuantizacion VQ puede introducir errores en tareas de precision (matematicas, codigo) no cubiertas por las metricas reportadas.
- Sharding incorrecto en exo: si se usa un cluster exo sin el fork adecuado, el modelo produce "fluent nonsense" (texto coherente pero sin sentido) sin errores visibles. El guard incluido mitiga este riesgo, pero no lo elimina en configuraciones no soportadas.
- Solo se declara ingles en la model card, aunque el modelo base es multilingue; el rendimiento en otros idiomas no esta verificado en esta cuantizacion.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, etc.) para este checkpoint; las cifras de rendimiento del modelo base no son directamente extrapolables.
- El modelo es de razonamiento: consume una parte del presupuesto de tokens en pensamiento interno, lo que puede truncar respuestas visibles si se usa un `max-tokens` bajo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-3bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Version VQ-2.6bpw del mismo autor: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.6bpw
- Recetas vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.5-397B-A17B
- Pagina NVIDIA NIM: https://build.nvidia.com/qwen/qwen3.5-397b-a17b
- Especificaciones y requisitos VRAM (apxml): https://apxml.com/models/qwen35-397b-a17b
- PR de exo para replicacion de codebooks: https://github.com/exo-explore/exo/pull/2268
- Fork de exo con soporte VQ: https://github.com/noahzelezny/exo/tree/vq-codebook-replicate
