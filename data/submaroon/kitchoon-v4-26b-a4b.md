# SubMaroon/Kitchoon-V4-26B-A4B

## Resumen

Kitchoon-V4-26B-A4B es un modelo de lenguaje orientado a roleplay (RP) y ERP desarrollado por el usuario SubMaroon, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de una versión refinada de Kitchoon-V3-26B-A4B en la que se han "horneado" (fusionado en los pesos) dos LoRAs: Gemory, de UltimateIntent, que busca que los personajes reaccionen de forma más individual, y Anthropos l07, del propio autor, diseñada para reducir la repetición entre respuestas alternativas (swipes). El resultado es un modelo especializado en desarrollo de personajes y escritura de estilo neutro para frontends como SillyTavern.

Técnicamente, el modelo pertenece a la familia etiquetada como gemma4, con arquitectura de mezcla de expertos (MoE): alrededor de 25.800 millones de parámetros totales de los cuales aproximadamente 4.000 millones están activos por token (según la nomenclatura 26B-A4B). Al ser un finetune comunitario orientado a uso creativo sin censura, su relevancia radica en la escena de roleplay local: ofrece una alternativa abierta y permissiva, ejecutable en hardware de consumo gracias a su baja activación de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia gemma4) |
| Parametros totales | 25.805.933.872 (~25,8 B) |
| Parametros activos | ~4 B (indicado por la nomenclatura A4B; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en bf16, 51,6 GB; se pueden generar GGUF con llama.cpp) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MoE de la serie 26B-Suite (etiquetado como gemma4) con 25,8 B de parametros totales y unos 4 B activos por token. La model card no detalla el numero de expertos ni la configuracion del router. Sobre Kitchoon-V3 (que a su vez se basa en un modelo "antislop" de Tetratype construido sobre una version "heretic" de coder3101, con el pipeline auto-antislop de Sam Paech), se han fusionado dos LoRAs mediante merge de pesos, no como adaptadores externos:

- **Gemory** (rank 16): aplicada a atencion (q/k/v/o_proj) y MLP densas en todas las capas a fuerza 0,5, y a los expertos MoE a fuerza 0,5 con correccion de 0,25 (rank 4).
- **Anthropos l07** (rank 16): aplicada a atencion y MLP densas solo en las capas 13-23, a fuerza 0,7. Es una "decision-point LoRA" que ensena al modelo a abrir respuestas y parrafos de forma mas variada, dejando el resto del texto al modelo base.

La fusion se realizo con redondeo estocastico en bf16, de modo que la fuerza horneada coincide con la probada; el autor verifica en llama.cpp que V4 equivale a V3 mas los LoRAs fusionados. No se dispone de datos sobre tokens de entrenamiento, composicion de datasets ni uso de RLHF/DPO para esta version concreta; los LoRAs proceden de entrenamientos comunitarios no documentados en la model card. La torre de vision, embeddings, router y lm_head permanecen identicos a V3.

## Capacidades

- Generacion de texto narrativo orientado a roleplay y ERP, con foco en desarrollo de personajes y estilo de escritura neutro.
- Conversaciones multi-personaje: en las pruebas, los personajes reaccionan de forma mas individual (bromean, empujan hacia atras, dialogan entre si y no solo con el usuario).
- Mayor variacion entre swipes (respuestas alternativas): las respuestas abren con palabras distintas con mas frecuencia que en V3.
- Modo de razonamiento (thinking) opcional, con presupuesto de razonamiento ajustable (normal o corto recomendado); sin thinking ofrece los resultados mas limpios.
- Etiquetado "uncensored": sin filtros de alineacion restrictivos, orientado a contenido creativo adulto.
- Soporte en frontends de roleplay como SillyTavern y ejecucion verificada en llama.cpp.
- No hay informacion sobre tool calling, agentes ni capacidades de vision funcionales (la torre de vision se hereda intacta de V3, pero no se documenta su uso).

## Casos de uso

- **Roleplay interactivo en SillyTavern:** el caso de uso principal. El modelo genera respuestas de personajes con personalidades diferenciadas y menos repeticion entre regeneraciones, ideal para sesiones largas de narrativa colaborativa.
- **Escritura creativa multi-personaje:** al hacer que los personajes conversen entre si y no solo con el usuario, sirve para prototipar dialogos de ficcion con varios personajes en escena.
- **Generacion de variantes narrativas:** la mayor diversidad de aperturas entre swipes permite explorar distintas formas de desarrollar una misma escena, util como herramienta de brainstorming narrativo.
- **Contenido adulto sin censura (ERP):** al tratarse de un modelo uncensored con licencia permisiva, se puede desplegar localmente para escritura erotica sin restricciones de servicio externo.
- **Pruebas de merges y LoRAs:** al estar los pesos ya fusionados y verificados contra V3 + LoRAs en llama.cpp, sirve como referencia reproducible para la comunidad de model merging.
- **Experimentacion con muestreo:** el autor documenta configuraciones recomendadas (temperature 0,85, min-P 0,05) y pide feedback sobre ajustes alternativos, lo que lo hace adecuado para usuarios que afinan samplers.
- **Uso local y privado:** con ~4 B de parametros activos, cabe en GPUs de consumo cuantizado, permitiendo roleplay privado sin depender de APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo especializado en roleplay creativo, el autor evalua cualitativamente (variacion de swipes, individualidad de personajes, presencia de palabras anomalas) en sus propias cartas de RP, sin metricas estandarizadas.

## Requisitos de hardware

- **VRAM en precision completa (bf16):** el repo pesa 51,6 GB, lo que requiere una GPU con 48 GB (A6000, A100 40/80 GB con offload) o reparto multi-GPU.
- **VRAM estimada cuantizado:** no disponible oficialmente; con ~26 B de parametros totales, una cuantizacion Q4_K_M en GGUF ocuparia en torno a 15-16 GB, mas KV cache, por lo que una RTX 3090/4090 de 24 GB es una opcion realista para uso local.
- **Consumer GPUs:** viable en RTX 3090/4090 (24 GB) con cuantizacion de 4 bits; en GPUs de 16 GB probablemente requiera offload parcial a CPU/RAM gracias a los ~4 B de parametros activos, lo que mantiene la velocidad razonable.
- **Despliegue:** verificado en llama.cpp por el autor; compatible con SillyTavern mediante backends llama.cpp, KoboldCpp u Ollama. No hay datos sobre vLLM o TGI, aunque al ser un MoE con safetensors podrian funcionar si el soporte de la arquitectura gemma4 esta disponible en dichos frameworks.
- **Latencia y throughput:** no disponibles; la activacion de ~4 B de parametros sugiere buenos tokens/segundo en hardware de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kitchoon-V4-26B-A4B | 25,8 B totales / ~4 B activos | no disponible | Apache 2.0 | Roleplay/ERP uncensored, merges de LoRAs | safetensors, HF |
| Kitchoon-V3-26B-A4B | 25,8 B totales / ~4 B activos | no disponible | Apache 2.0 | Roleplay/ERP, base antislop | safetensors, HF |
| Gemory-26B-A4B (LoRA) | LoRA rank 16/4 sobre 26B-A4B | no disponible | no disponible | Personajes mas vivos, aplicable como adaptador | LoRA, HF |

Comparables genericos de la misma clase de tamano para RP (por ejemplo, finetunes comunitarios de Mistral Small o Qwen3 en el rango 20-30 B) no estan documentados en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- **Idioma:** el modelo esta etiquetado solo para ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior o no soportado.
- **Palabras anomalas:** el autor reconoce fallos ocasionales ("own" o "quite" mal colocados, palabras duplicadas como "her her"), sobre todo con razonamiento muy largo (budget auto).
- **Variacion limitada en contenido:** los swipes varian en como se narra la escena mas que en que ocurre; el golpe narrativo principal sigue viniendo de la escena.
- **Muletillas estilisticas:** persisten tics como *smirk* y el guion largo (em dash), heredados del modelo base.
- **Poca validacion:** es un experimento probado principalmente en las cartas del propio autor; el comportamiento en sesiones largas (coherencia de escena, seguimiento de personajes) no ha sido suficientemente probado.
- **Contenido sin censura:** al ser uncensored y orientado a ERP, puede generar contenido ofensivo o inapropiado; su uso requiere responsabilidad y verificacion de edad/entorno.
- **Contexto:** la longitud de ventana de contexto no esta documentada; verificar en el config del modelo antes de sesiones largas.
- **Licencia:** Apache 2.0 permite uso comercial, pero los datasets de entrenamiento subyacentes de la serie Kitchoon son comunitarios y su procedencia no esta documentada en detalle.
- **Dependencia de la cadena de merges:** hereda caracteristicas de V3, del antislop de Tetratype y de la version heretic de coder3101; cualquier defecto de esos modelos base puede propagarse.

## Enlaces

- Modelo: https://huggingface.co/SubMaroon/Kitchoon-V4-26B-A4B
- Modelo base (V3): https://huggingface.co/SubMaroon/Kitchoon-V3-26B-A4B
- LoRA Gemory: https://huggingface.co/UltimateIntent/Gemory-26B-A4B-LORA
- LoRA Anthropos: https://huggingface.co/SubMaroon/Anthropos-LoRA-v2-EXP
- Autor: https://huggingface.co/SubMaroon
- Colaborador (UltimateIntent): https://huggingface.co/UltimateIntent
- Donaciones del autor: https://boosty.to/submaroon/donate
