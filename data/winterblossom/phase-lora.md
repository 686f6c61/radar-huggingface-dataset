# WinterBlossom/phase-lora

## Resumen

`WinterBlossom/phase-lora` no es un modelo generativo independiente, sino una coleccion de 360 adaptadores LoRA entrenados para el articulo "Phase LoRA: Low-Rank Adapters in Polar Coordinates". Los adaptadores se distribuyen sobre tres modelos base de pequeno tamano: Qwen3-0.6B-Base, Qwen3-1.7B-Base y LFM3-1.7B-Base. Cada combinacion cubre 4 tareas (traduccion ingles→setswana, ingles→luganda, SVAMP y ARC-Challenge), 6 metodos de adaptacion (LoRA, Phase LoRA, DoRA, Phase DoRA, PoLAR y Phase PoLAR) y 5 semillas, todos con rango 64 sobre las proyecciones `q_proj` y `v_proj`.

El interes del repositorio es fundamentalmente de investigacion: permite reproducir y comparar experimentalmente una variante de LoRA que parametriza los adaptadores en coordenadas polares, evaluando su efecto sobre tareas de traduccion de bajo recurso y de razonamiento aritmetico y cientifico. Los resultados publicados en la model card muestran mejoras marginales pero consistentes de Phase LoRA y Phase DoRA frente a LoRA clasico en tareas de traduccion, con diferencias que oscilan entre decimas y varios puntos de chrF++ segun el modelo base.

El repositorio ocupa 12,9 GB, lo que refleja el peso agregado de los 360 adaptadores y sus configuraciones. No se trata de un modelo para produccion directa, sino de un artefacto de investigacion reproducible que requiere clonar el repositorio de codigo asociado para cargar los adaptadores mediante su script `hub_adapters.load`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 64) sobre `q_proj` y `v_proj` de transformers base (Qwen3 y LFM3 hibrido con capas convolucionales) |
| Parametros totales | No disponible (depende del modelo base: Qwen3-0.6B, Qwen3-1.7B, LFM3-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptadores en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | Ingles como origen; tareas de traduccion a setswana y luganda. Idiomas generales del modelo base: no disponibles |
| Licencia | Mixta (`other`): base Qwen3 Apache-2.0, base LFM3 LFM Open License v1.0, datos MAFAND-MT CC BY-NC 4.0 (adaptadores de traduccion solo uso no comercial), SVAMP MIT, ARC CC BY-SA 4.0 |
| Formato de pesos | `adapter.safetensors` + `config.json` por adaptador |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente adaptadores de bajo rango, no pesos completos. Cada adaptador se aplica sobre las proyecciones de atencion `q_proj` y `v_proj` con rango 64. En el caso de LFM3-1.7B-Base, que combina capas convolucionales con atencion, los adaptadores se colocan solo en sus 11 capas de atencion, ya que las 13 capas convolucionales carecen de `q_proj` y `v_proj`. La innovacion metodologica del paper es la parametrizacion de los adaptadores en coordenadas polares (Phase LoRA y Phase DoRA), que se compara contra LoRA, DoRA y PoLAR clasicos.

El entrenamiento cubre cuatro tareas: traduccion automatica ingles→setswana e ingles→luganda (evaluadas con chrF++ sobre MAFAND-MT), y dos tareas de razonamiento (SVAMP y ARC-Challenge, evaluadas por exactitud). Se entrenan 5 semillas por combinacion para medir varianza, lo que da lugar a los 360 adaptadores (3 modelos × 4 tareas × 6 metodos × 5 semillas). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; al tratarse de adaptadores sobre modelos base, el entrenamiento es de ajuste supervisado sobre las tareas indicadas.

## Capacidades

- Ajuste fino de tareas especificas: cada adaptador esta especializado en una unica tarea (traduccion EN→TSN, EN→LUG, SVAMP o ARC-Challenge).
- Traduccion automatica de bajo recurso: adaptadores para setswana y luganda sobre modelos base pequenos.
- Razonamiento aritmetico (SVAMP) y cientifico (ARC-Challenge) mediante adaptadores dedicados.
- Comparacion metodologica reproducible: seis variantes de LoRA con cinco semillas por combinacion.
- Carga programatica mediante el script `hub_adapters.load` del repositorio de codigo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos del paper: cargar cada adaptador con `load("WinterBlossom/phase-lora", "<modelo>", "<tarea>", "<metodo>", seed=n)` y recalcular las metricas publicadas (chrF++ o exactitud) para verificar los resultados.
- Estudio comparativo de metodos de adaptacion: evaluar LoRA, DoRA, PoLAR y sus variantes Phase sobre un mismo modelo base para medir su impacto en tareas de traduccion y razonamiento.
- Investigacion en traduccion de bajo recurso: usar los adaptadores EN→TSN y EN→LUG como linea base para experimentos con setswana y luganda, siempre bajo uso no comercial por la licencia CC BY-NC 4.0 de MAFAND-MT.
- Analisis de olvido catastrofico: los `config.json` incluyen la metrica de forgetting, lo que permite estudiar como cada metodo degrada el rendimiento del modelo base en tareas no objetivo.
- Seleccion de modelo base para ajuste fino: comparar el comportamiento de adaptadores equivalentes sobre Qwen3-0.6B, Qwen3-1.7B y LFM3-1.7B para decidir que base conviene en un pipeline de investigacion.
- Desarrollo de nuevas variantes de LoRA: usar el repositorio de codigo y los adaptadores como punto de partida para probar parametrizaciones alternativas (por ejemplo, otras representaciones polares o rangos distintos).

## Benchmarks y rendimiento

Resultados medios sobre 5 semillas publicados en la model card (chrF++ para traduccion, exactitud % para SVAMP y ARC-Challenge).

Qwen3-0.6B-Base:

| Metodo | EN→Setswana (chrF++) | EN→Luganda (chrF++) | SVAMP (%) | ARC-Challenge (%) |
|---|---|---|---|---|
| LoRA | 30.1 | 29.9 | 69.5 | 68.0 |
| Phase LoRA | 33.5 | 31.2 | 71.9 | 68.7 |
| DoRA | 30.6 | 30.5 | 71.2 | 67.9 |
| Phase DoRA | 33.6 | 31.1 | 72.1 | 68.9 |
| PoLAR | 32.4 | 30.8 | 68.9 | 67.4 |
| Phase PoLAR | 32.5 | 31.2 | 70.1 | 67.7 |

Qwen3-1.7B-Base:

| Metodo | EN→Setswana (chrF++) | EN→Luganda (chrF++) | SVAMP (%) | ARC-Challenge (%) |
|---|---|---|---|---|
| LoRA | 32.6 | 31.5 | 76.5 | 79.3 |
| Phase LoRA | 33.8 | 31.7 | 76.2 | 81.5 |
| DoRA | 32.6 | 31.1 | 78.1 | 79.1 |
| Phase DoRA | 33.6 | 31.8 | 75.8 | 81.3 |
| PoLAR | 32.2 | 31.3 | 77.9 | 80.5 |
| Phase PoLAR | 32.1 | 31.3 | 77.0 | 80.8 |

LFM3-1.7B-Base:

| Metodo | EN→Setswana (chrF++) | EN→Luganda (chrF++) | SVAMP (%) | ARC-Challenge (%) |
|---|---|---|---|---|
| LoRA | 33.6 | 31.6 | 73.9 | 77.5 |
| Phase LoRA | 33.0 | 29.9 | 79.4 | 79.0 |
| DoRA | 33.7 | 31.4 | 73.7 | 77.4 |
| Phase DoRA | 33.1 | 29.7 | 79.9 | 79.0 |
| PoLAR | 32.0 | 30.6 | 79.5 | 78.2 |
| Phase PoLAR | 31.3 | 30.3 | 75.9 | 78.4 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; depende del modelo base. Qwen3-0.6B en fp16 requiere aproximadamente 1,2 GB de pesos; Qwen3-1.7B y LFM3-1.7B en fp16, alrededor de 3,4 GB. Los adaptadores (rango 64) anaden una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para los tres modelos base en fp16 o bf16. Para entrenamiento de adaptadores sobre los modelos de 1.7B se recomienda al menos 24 GB (RTX 3090/4090, A10G) segun el batch y la longitud de secuencia.
- Cabe en GPU consumer: si, en todas las tarjetas mencionadas, dado el tamano reducido de los modelos base.
- Opciones de despliegue: el repositorio proporciona un script propio (`scripts/hub_adapters.py`) que carga los adaptadores mediante `transformers`. Para LFM3 se requiere `transformers` 5.18.0 o superior (`requirements-lfm3.txt`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa mas directa es entre los propios metodos de adaptacion evaluados en el paper, sobre un mismo modelo base. A continuacion se comparan los metodos para Qwen3-1.7B-Base (media de 5 semillas):

| Metodo | EN→Setswana (chrF++) | EN→Luganda (chrF++) | SVAMP (%) | ARC-Challenge (%) |
|---|---|---|---|---|
| LoRA | 32,6 | 31,5 | 76,5 | 79,3 |
| Phase LoRA | 33,8 | 31,7 | 76,2 | 81,5 |
| DoRA | 32,6 | 31,1 | 78,1 | 79,1 |
| PoLAR | 32,2 | 31,3 | 77,9 | 80,5 |

No se dispone de comparacion con otros repositorios de adaptadores publicos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base correspondiente (Qwen3-0.6B, Qwen3-1.7B o LFM3-1.7B) y usar el script del repositorio de codigo; no funciona con `PeftModel.from_pretrained` estandar sin adaptacion.
- Licencia mixta y restrictiva: los adaptadores de traduccion (EN→TSN, EN→LUG) se entrenaron con MAFAND-MT (CC BY-NC 4.0), por lo que su uso comercial esta prohibido. Los adaptadores sobre LFM3 heredan la LFM Open License v1.0.
- Dependencia de version: LFM3 requiere `transformers` 5.18.0 o superior, lo que puede romper pipelines existentes.
- Resultados con varianza: las mejoras de Phase LoRA frente a LoRA son pequenas (decimas de punto en varios casos) y en LFM3 empeoran en traduccion (33,0 vs 33,6 en EN→TSN; 29,9 vs 31,6 en EN→LUG), lo que sugiere sensibilidad al modelo base.
- Sin datos de sesgos, alucinacion o comportamiento multilingue general: no disponibles en la informacion proporcionada.
- Artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa.
- El repositorio ocupa 12,9 GB, lo que puede ser excesivo si solo se necesita un subconjunto de adaptadores.

## Enlaces

- Hugging Face: https://huggingface.co/WinterBlossom/phase-lora
- Paper (DOI): https://doi.org/10.5281/zenodo.24393045
- Repositorio de codigo: https://github.com/WinterBlossom0/Phase-LoRA
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo base LFM3-1.7B-Base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
