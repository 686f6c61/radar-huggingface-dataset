# ZihanLiummyycc/whisper-large-v3-turbo-dbank-cross-attention

## Resumen

Este repositorio aloja un checkpoint de componente (no un modelo completo) denominado `whisper-large-v3-turbo-dbank-cross-attention`, publicado por el usuario ZihanLiummyycc. Se trata de un conjunto de parametros adaptados sobre `openai/whisper-large-v3-turbo` para reconocimiento automatico del habla (ASR) en speech de personas mayores, concretamente sobre utterances de DementiaBank. El paquete modifica unicamente las proyecciones de cross-attention y sus layer normalization en los cuatro bloques del decodificador, dejando intactos self-attention, capas feed-forward, embeddings de tokens y el encoder de audio.

El checkpoint contiene 26.240.000 elementos de parametros independientes distribuidos en 36 tensores dentro de `adaptation.safetensors`, y se presenta como valores finales de parametros (no como deltas aditivos). No es un adaptador LoRA ni un adaptador PEFT cargable de forma estandar, ni un modelo Transformers autonomo: requiere el codigo acompanante y la carga explicita del modelo base nativo en formato OpenAI `.pt`. Acompana al trabajo "Diffusion and Flow Matching ASR for Elderly Speech".

Su relevancia es acotada y de investigacion: documenta una configuracion concreta de adaptacion parameter-efficient para un dominio especifico (habla de personas mayores con posible deterioro cognitivo) y reporta un WER historico del 19,62 % sobre 928 utterances de DementiaBank. No esta validado para uso clinico ni diagnostico, y solo incluye idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper large-v3-turbo); adaptacion limitada a cross-attention del decodificador |
| Parametros totales | no disponible para el modelo completo adaptado; componente de adaptacion: 26.240.000 elementos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Whisper large-v3-turbo trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (adaptacion); el modelo base es multilingue, pero este checkpoint se orienta a ingles |
| Licencia | other / upstream-terms-and-author-rights (LICENSE.md); no se asigna licencia MIT/Apache al bundle derivado |
| Formato de pesos | safetensors (`adaptation.safetensors`, 36 tensores); el base debe cargarse en `.pt` nativo de OpenAI |

## Arquitectura y entrenamiento

La arquitectura base es Whisper large-v3-turbo de OpenAI, un transformer encoder-decoder orientado a ASR con decodificador reducido. Sobre esa base, este checkpoint aplica una adaptacion parameter-efficient de alcance `cross_attention_only`: actualiza las proyecciones de cross-attention y su layer normalization en los cuatro bloques del decodificador. No modifica self-attention, feed-forward, embeddings de tokens ni el encoder de audio, que permanecen congelados en el modelo base requerido. Los 26.240.000 elementos de parametros se almacenan como valores finales, no como deltas, en 36 tensores nombrados.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF/DPO. El entrenamiento se enmarca en el trabajo "Diffusion and Flow Matching ASR for Elderly Speech", cuyas recetas de experimento y codigo estan en el repositorio enlazado. El ajuste se realizo sobre utterances de DementiaBank (habla de personas mayores), un dominio alejado del ingles generalista tipico de Whisper. El repositorio incluye `base_assets.json` con revisiones inmutables y hashes SHA256 de los activos base, y `verification.json` con el presupuesto y tiempo de ejecucion de las comprobaciones.

## Capacidades

- Reconocimiento automatico del habla en ingles, con especializacion en speech de personas mayores (dominio DementiaBank).
- Transcripcion con foco en un dominio acustico y linguistico especifico (habla de edad avanzada, posible deterioro cognitivo).
- Adaptacion de las proyecciones de cross-attention del decodificador del modelo base Whisper large-v3-turbo.
- Hereda del modelo base las capacidades generales de ASR de Whisper, aunque este checkpoint solo contiene los parametros adaptados.
- No soporta tool calling ni function calling (es un componente ASR, no un LLM conversacional).
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingues: no en este checkpoint; el tag de idioma es `en`.
- No incluye modo thinking, vision ni audio mas alla del propio pipeline ASR.

## Casos de uso

- Investigacion en ASR para habla de personas mayores: el checkpoint sirve como configuracion de referencia para estudiar adaptacion parameter-efficient en dominios geriatricos, reproduciendo el setup del paper con el codigo acompanante.
- Analisis de transcripciones de DementiaBank en entornos de investigacion autorizados: permite transcribir utterances del corpus para estudios linguisticos, siempre con autorizacion para tratar dichos datos.
- Comparacion de estrategias de adaptacion: al ser un checkpoint `cross_attention_only` de 26,24 M de elementos, es util para aislar el efecto de adaptar solo cross-attention frente a LoRA u otras tecnicas.
- Reproducibilidad de experimentos: junto con `base_assets.json` (revisiones y hashes) y `verification.json`, permite verificar integridad de tensores y comparar salidas originales frente a exportadas.
- Prototipado de pipelines ASR especializados en poblaciones mayores: como paso previo a sistemas de transcripcion en contextos de atencion a personas mayores, siempre en fase de investigacion y sin uso diagnostico.
- Estudio de robustez y sesgo en ASR clinico: el WER reportado del 19,62 % sobre 928 utterances permite analizar la degradacion del reconocimiento en dominios alejados del entrenamiento generalista.
- Base para investigacion en adaptacion eficiente multi-dominio: puede servir de plantilla metodologica para replicar el enfoque en otros corpus o idiomas.

## Benchmarks y rendimiento

| Benchmark / evaluacion | Resultado | Notas |
|---|---|---|
| WER en 928 utterances de DementiaBank | 19,62 % | Agregado historico del experimento original, no recalculado en la publicacion |
| Verificacion de integridad de ficheros/tensores | Correcta | Sobre dos entradas sinteticas en NVIDIA A40; no mide WER, latencia, robustez ni fuga de privacidad |
| Comparacion original vs exportado | Correcta | Mismo entorno de verificacion (A40) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas, dado que se trata de un modelo ASR y no de un LLM de proposito general.

## Requisitos de hardware

- VRAM estimada: el componente de adaptacion ocupa aproximadamente 0,1 GB; requiere adicionalmente el modelo base Whisper large-v3-turbo (entorno de 1-2 GB en precision nativa), por lo que la inferencia tipica se situa en el rango de pocos GB de VRAM.
- GPU recomendadas: NVIDIA A40 (empleada en la verificacion del autor); tambien valida cualquier GPU con suficiente VRAM para Whisper large-v3-turbo (A100, H100, RTX 4090, etc.).
- GPU de consumo: si es viable, dado el tamano del modelo base; tarjetas tipo RTX 3060 12 GB o superiores deberian ser suficientes, aunque no se aporta una medicion especifica para este checkpoint.
- Opciones de despliegue: no se puede cargar con vLLM, Ollama, TGI ni como adaptador PEFT estandar. Requiere `whisper.load_model` sobre el `.pt` nativo de OpenAI mas `load_component(model, component_dir)` del repositorio de codigo acompanante.
- Latencia y throughput: no disponible (la verificacion del autor no midio estos parametros).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / dominio | Licencia | Formato |
|---|---|---|---|---|
| whisper-large-v3-turbo-dbank-cross-attention (este) | 26,24 M adaptados sobre base Whisper large-v3-turbo | ASR en ingles, dominio DementiaBank | other (upstream-terms-and-author-rights) | safetensors (componente) + `.pt` nativo del base |
| openai/whisper-large-v3-turbo (base) | no disponible en la informacion proporcionada | ASR multilingue generalista | no disponible en la informacion proporcionada | `.pt` nativo / Transformers |
| Otras adaptaciones de Whisper para habla de mayores o clinica | no disponible | ASR especializado | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: es un checkpoint de componente que exige el modelo base y el codigo acompanante para cargarse.
- No es un adaptador PEFT estandar ni LoRA; no se carga con las utilidades habituales de HuggingFace PEFT.
- Solo ingles (`en`); no cubre el resto de idiomas del base multilingue.
- No es un modelo de diagnostico y no ha sido validado para decisiones clinicas.
- Riesgo de errores de transcripcion y sesgo de dataset persistente (habla de personas mayores, DementiaBank).
- La ausencia de ficheros clinicos crudos en el repositorio no garantiza ausencia de memorizacion.
- El WER del 19,62 % es un agregado historico, no recalculado en la publicacion, y depende de los splits, normalizacion y ajustes de decodificacion del experimento original.
- Las verificaciones realizadas se limitan a integridad y comparacion de salidas sobre entradas sinteticas; no miden WER, latencia, robustez ni fuga de privacidad.
- Restricciones de licencia: no se asigna licencia MIT/Apache al bundle derivado; se mantienen los terminos upstream y no se autoriza la redistribucion de datos de DementiaBank.
- Uso comercial: condicionado por la licencia `upstream-terms-and-author-rights` y los terminos del modelo base; revisar LICENSE.md antes de cualquier uso en produccion.
- Uso unicamente con datos para los que se tenga autorizacion explicita de tratamiento.

## Enlaces

- HuggingFace: https://huggingface.co/ZihanLiummyycc/whisper-large-v3-turbo-dbank-cross-attention
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Codigo y recetas del experimento: https://github.com/ZihanLiummyycc/diffusion-asr-elderly-speech/tree/29709f075399be63ed6d1e536a0a0ca3bba0a072
- Repositorio de codigo (rama principal): https://github.com/ZihanLiummyycc/diffusion-asr-elderly-speech
- Ficheros incluidos en el repositorio: `adaptation.safetensors`, `base_assets.json`, `verification.json`, `LICENSE.md`, `licenses/`
