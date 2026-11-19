# tencent/WeVisForensics

## Resumen

WeVisForensics es un sistema agéntico para la deteccion de video generado por IA, desarrollado por Tencent. Se distribuye como un conjunto de cinco adaptadores LoRA (rango 64, alpha 128, en BF16) entrenados sobre el modelo base Qwen/Qwen3.5-4B mediante DTPO (una variante de entrenamiento con refuerzo y preferencias). El repositorio de Hugging Face contiene unicamente los adaptadores, no los pesos completos; el modelo base debe descargarse por separado.

El sistema se organiza como un agente investigador principal (`main`) que coordina cinco subagentes inspectores especializados: apariencia visual (`visual_appearance`), consistencia fisica (`physical_consistency`), sentido comun (`common_side`), texto en pantalla (`ocr_consistency`) y, segun la model card, contenido de habla y perfil de voz. Cada inspector dispone de una skill card (`skill_card.json`) que se inyecta en inferencia. La deteccion es, por tanto, omni-modal: combina senales visuales, fisicas, semanticas, de OCR y de audio.

Es relevante ahora porque aborda un problema creciente (distinguir video sintetico de real) con un enfoque de agentes multi-paso y tool use en lugar de un clasificador monolitico, y porque se publica bajo licencia Apache 2.0 junto con paper, codigo y demo. El pipeline declarado es `video-text-to-text` y el idioma soportado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con adaptadores LoRA rango 64 / alpha 128; sistema multiagente sobre el modelo base |
| Parametros totales | 4B en el modelo base (Qwen3.5-4B); los adaptadores LoRA se suman sobre esa base, tamano exacto no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptadores publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (adaptadores y codigo de Tencent; los modelos de terceros de habla, speaker y OCR conservan sus propias licencias) |
| Formato de pesos | safetensors via PEFT/LoRA (adaptadores); modelo base en el formato de Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer de 4.000 millones de parametros. Sobre el se entrenan cinco adaptadores LoRA independientes (rango 64, alpha 128, BF16), uno por rol: agente investigador principal e inspectores de apariencia visual, consistencia fisica, sentido comun y consistencia OCR. El entrenamiento emplea DTPO, un esquema de optimizacion con refuerzo y preferencias citado en el paper, orientado a que el agente aprenda a coordinar subagentes y a usar herramientas de forma iterativa (self-evolving).

La innovacion principal es la orquestacion multiagente: el agente `main` delega en inspectores especializados, cada uno con una skill card que define su tarea, y agrega sus veredictos para emitir la decision final sobre si un video es generado por IA. La model card menciona inspectores de habla y de perfil de voz ademas de los cinco adaptadores publicados, aunque el repositorio solo libera cinco. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO mas alla de la referencia a DTPO.

## Capacidades

- Deteccion de video generado por IA mediante razonamiento multi-paso y coordinacion de subagentes.
- Analisis de apariencia visual: artefactos, incoherencias de renderizado y texturas.
- Analisis de consistencia fisica: iluminacion, sombras, movimiento y leyes fisicas.
- Analisis de sentido comun: plausibilidad semantica de escenas y acciones.
- Analisis de texto en pantalla (OCR): coherencia y legibilidad de rotulos y subtitulos.
- Analisis de contenido de habla y perfil de voz (segun la model card).
- Tool calling y uso de herramientas externas (modelos de habla, speaker y OCR de terceros).
- Razonamiento agéntico multi-paso con subagentes especializados.
- Entrada video-texto (`video-text-to-text`).
- Capacidades multilingues: limitadas a ingles.

## Casos de uso

- Moderacion de plataformas de video: integrar el agente como filtro previo a la publicacion para marcar contenido sintetico, combinando senales visuales, fisicas y de OCR en un unico veredicto razonado.
- Verificacion periodistica: comprobar la autenticidad de clips virales antes de su difusion, con trazabilidad del razonamiento por subagente.
- Analisis forense en investigacion academica: estudiar que senales (fisicas, semanticas, OCR) discriminan mejor entre video real y generado.
- Deteccion de deepfakes en entornos corporativos: auditar videos de formacion, comunicados o reuniones grabadas para descartar suplantacion.
- Pipelines de confianza y seguridad (trust & safety): encadenar el agente con modelos de habla y OCR de terceros para un analisis omni-modal completo.
- Evaluacion de generadores de video: usar el sistema como juez automatico para medir la calidad y el realismo de modelos de sintesis de video.
- Investigacion en agentes: emplear los adaptadores como caso de estudio de coordinacion multiagente con DTPO y skill cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: al menos 24 GB para ejecutar el agente completo en proceso con Transformers en una sola GPU (segun la model card).
- Despliegue en una sola GPU con vLLM sirviendo los cinco adaptadores sin fusionar (`GPU_MEMORY_UTILIZATION=0.66` en el script de referencia).
- Despliegue multi-GPU fusionando cada adaptador en el modelo base mediante `scripts/merge_lora.py`.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 24 GB encajan A100, H100, L40S o RTX 4090 (24 GB, al limite).
- Cabe en GPU de consumo: RTX 4090 de 24 GB como minimo; no cabe en GPUs de 16 GB o menos sin cuantizacion adicional, cuyo soporte no esta documentado.
- Opciones de despliegue: vLLM (con LoRA multiple), Transformers, Gradio (demo y Hugging Face Space).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeVisForensics (este) | 4B base + 5 LoRA | no disponible | Deteccion de video IA multiagente omni-modal | Apache 2.0 | Adaptadores en HF, codigo en GitHub |
| Clasificadores binarios de video IA | Variable (no disponible) | no disponible | Clasificacion directa sin agentes | Variable | No disponible en la informacion |
| Modelos VLM genericos (p. ej. Qwen3.5-4B base) | 4B | no disponible | Comprension video-texto general | Apache 2.0 | HF |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se publican los adaptadores LoRA; es imprescindible descargar el modelo base Qwen/Qwen3.5-4B por separado.
- Idioma limitado al ingles; el rendimiento en otros idiomas no esta documentado.
- Uso previsto exclusivamente para investigacion en forense de video; no debe emplearse para decisiones autonomas de alto impacto sobre personas.
- Riesgo de alucinacion y de falsos positivos/negativos en la clasificacion; no hay benchmarks publicados que cuantifiquen su fiabilidad.
- La deteccion depende de modelos de terceros (habla, speaker, OCR) con licencias propias que pueden restringir el uso comercial del conjunto.
- La model card menciona inspectores de habla y voz pero solo se liberan cinco adaptadores; puede faltar cobertura respecto al sistema descrito en el paper.
- No se documentan sesgos conocidos, longitud de contexto ni regimen de cuantizacion; verificar antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 4 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeVisForensics
- Paper (arXiv): https://arxiv.org/abs/2611.21373
- Codigo (GitHub): https://github.com/Tencent/WeVisForensics
- Pagina del proyecto: https://tencent.github.io/WeVisForensics
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
