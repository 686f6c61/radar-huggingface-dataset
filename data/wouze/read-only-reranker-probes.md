# Wouze/read-only-reranker-probes

## Resumen

Wouze/read-only-reranker-probes no es un modelo generativo completo, sino un conjunto de sondas (probes) entrenadas sobre un Qwen/Qwen3-Reranker-4B congelado. El repositorio contiene pesos auxiliares que permiten aplicar una estrategia de salida temprana (early exit) durante el re-ranking: cada pasaje se puntua parcialmente en capas intermedias y la mayoria de la lista se descarta antes de completar el forward completo del transformer. El modelo base no esta incluido y debe cargarse por separado desde Qwen/Qwen3-Reranker-4B.

El objetivo es reducir la latencia del re-ranking sin sacrificar de forma apreciable la calidad del ranking. Segun la model card, en una RTX 3090 el calendario de media latencia tarda 1.644 ms frente a 3.276 ms de un forward con prefix caching, con una caida de nDCG@10 de +0,00048 y manteniendo el top 10 de referencia en el 80 % de una particion de 400 consultas. El autor distingue entre el "2x" medido (aceleracion temporal) y el "4x" teorico (producto de 1,73 x 2,29 en multiply-accumulates), que no debe confundirse con una aceleracion de reloj.

El proyecto es relevante para equipos que ya operan Qwen3-Reranker-4B en produccion y buscan reducir coste computacional en etapas de recuperacion. Al ser sondas derivadas de un modelo Apache 2.0, la licencia resultante tambien es Apache 2.0. El repositorio es pequeno (0,1 GB) y tiene un uso muy limitado (15 descargas, 0 likes), lo que sugiere que es un artefacto de investigacion mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sondas de early exit sobre transformer Qwen3-Reranker-4B (modelo base no incluido) |
| Parametros totales | No disponible (las sondas incluyen LoRA rank-16 y cabezas ridge de forma `(2560,)`; el modelo base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-Reranker-4B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch) para las sondas; el modelo base se carga por separado en su formato original |

## Arquitectura y entrenamiento

Las sondas operan sobre un Qwen3-Reranker-4B congelado. El repositorio incluye cinco artefactos: `probes/q4_p1.pt` (sonda de un token con salidas en capas 9 y 15, LoRA rank-16 solo en la ruta de la sonda), `probes/q4_full.pt` (sonda de nueve tokens con cabezas de salida en capas 4, 6, 8 y de 9 a 16), `probes/ridge_4b_l21.pt` (ridge de capa 21, `beta` de forma `(2560,)`, λ = 10⁻³, correlacion en held-out 0,994), `week3_f25_ridge_beta.pt` (blend ridge de capa 25, α = 0,15, correlacion en held-out 0,9991 sobre los 15 finalistas) y `paper_r1.json` (regla de keep pre-registrada con SHA-256 `750cc3641a728eac51426765e8db15a014ab71e314e0ccf55540ccd45996b43e`).

La innovacion tecnica es el early exit en cascada: la sonda de nueve tokens se lee en las capas 9 y 15 para descartar pasajes, mientras que un blend ridge en la capa 25 corrige los margenes de los finalistas (el freeze en capa 25 desplaza los margenes hasta 0,50 y el blend con α = 0,15 recupera el ranking). El autor reporta que un forward estandar de Hugging Face repite la query en cada pasaje y proyecta el vocabulario completo, costando 1,73x el forward con prefix caching; recolectar las proyecciones sobre tokens reales alcanza 1.430 ms (2,29x ese forward, caida +0,0012 sin el blend). No se especifican datos de entrenamiento, numero de tokens ni si hubo RLHF/DPO para las sondas.

## Capacidades

- Re-ranking de pasajes con salida temprana: puntua cada pasaje en capas intermedias y descarta la mayoria de la lista antes de completar el forward.
- Aceleracion medida de 2x en latencia (1.644 ms frente a 3.276 ms) en una RTX 3090 con el calendario de media latencia.
- Reduccion teorica de trabajo de aproximadamente 4x en multiply-accumulates (producto 1,73 x 2,29), segun el autor.
- Blend ridge de capa 25 (α = 0,15) para recuperar el ranking tras el freeze de esa capa.
- Regla de keep pre-registrada (`paper_r1.json`) para decidir que pasajes pasan a la siguiente etapa.
- No incluye generacion de texto, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: es exclusivamente un componente de re-ranking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Re-ranking en pipelines de busqueda y RAG: usar las sondas para descartar pasajes con baja probabilidad en capas 9 y 15, reduciendo el coste del re-ranking completo sobre listas largas de candidatos.
- Reduccion de latencia en atencion al cliente automatizada: integrar el early exit en el recuperador de un sistema de soporte para bajar el tiempo de respuesta sin reentrenar el reranker base.
- Filtrado previo en motores de busqueda internos: aplicar la regla de keep pre-registrada para limitar los finalistas que pasan a etapas mas costosas del pipeline.
- Investigacion sobre early exit y eficiencia en transformers: reutilizar las sondas y el `paper_r1.json` como base reproducible para experimentos de salida temprana en re-ranking.
- Despliegue en GPUs de consumo: el calendario de media latencia cabe en una RTX 3090, lo que permite prototipar re-ranking acelerado sin infraestructura de datacenter.
- Evaluacion comparativa de estrategias de re-ranking: usar los artefactos ridge de capas 21 y 25 como referencia para medir el impacto del freeze y del blend en la calidad del ranking.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Latencia, calendario de media latencia (RTX 3090) | 1.644 ms |
| Latencia, forward con prefix caching (RTX 3090) | 3.276 ms |
| Aceleracion temporal medida | 2x |
| Caida de nDCG@10 (media latencia) | +0,00048 |
| Top 10 de referencia presente (particion de 400 consultas) | 0,80 |
| Latencia con proyecciones sobre tokens reales | 1.430 ms (2,29x el forward con prefix caching) |
| Caida con blend eliminado | +0,0012 |
| Desplazamiento de margenes por freeze en capa 25 | Hasta 0,50 |
| Correlacion en held-out, ridge capa 21 | 0,994 |
| Correlacion en held-out, blend capa 25 (15 finalistas) | 0,9991 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores son especificas del re-ranking y del entorno de medida del autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de 4B parametros y las sondas ocupan 0,1 GB en el repositorio.
- GPU recomendada segun el autor: una RTX 3090 para el calendario de media latencia.
- Cabe en GPU de consumo: si, segun la medicion en RTX 3090; no se confirma para GPUs con menos VRAM.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor proporciona instrucciones de descarga con `hf download` y codigo en el repositorio de GitHub.
- Latencia y throughput: 1.644 ms por operacion en el calendario de media latencia y 1.430 ms con proyecciones sobre tokens reales, ambas medidas en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wouze/read-only-reranker-probes | Sondas sobre base de 4B | No disponible | Early exit sobre reranker congelado | Apache 2.0 | Hugging Face (15 descargas) |
| Qwen/Qwen3-Reranker-4B | 4B | No disponible | Re-ranking estandar sin early exit | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas de re-ranking de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros rerankers en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base Qwen/Qwen3-Reranker-4B no esta incluido en el repositorio y debe cargarse por separado; las sondas no funcionan de forma autonoma.
- El "4x" es un producto teorico de multiply-accumulates (1,73 x 2,29), no una aceleracion de reloj medida; la aceleracion temporal real reportada es de 2x.
- La caida de nDCG@10 es pequena pero no nula (+0,00048), y el top 10 de referencia solo se conserva en el 80 % de las consultas de la particion de 400.
- El freeze en capa 25 desplaza los margenes de los finalistas hasta 0,50; sin el blend ridge (α = 0,15) el ranking se degrada.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma; al ser un reranker, no genera texto y el riesgo de alucinacion no aplica de la misma forma que en un modelo generativo.
- Uso muy limitado (15 descargas, 0 likes) y creado en 2026: no hay evidencia de validacion independiente ni de mantenimiento a largo plazo.
- La licencia Apache 2.0 permite uso comercial, pero al ser una derivacion de Qwen3-Reranker-4B conviene verificar las condiciones del modelo base.
- No se especifican requisitos de VRAM para GPUs distintas de la RTX 3090 ni opciones de cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/Wouze/read-only-reranker-probes
- Repositorio GitHub (codigo, paper y tablas de resultados): https://github.com/Wouze/read-only-reranker-probes
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
