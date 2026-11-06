# ThakiCloud/Thaki-KSpeech-KO-30B-A4B-LoRA-v1

## Resumen

Thaki-KSpeech-KO-30B-A4B-LoRA-v1 es un adaptador LoRA para reconocimiento automatico del habla (ASR) en coreano, desarrollado por ThakiCloud sobre el modelo base NVIDIA Nemotron 3.5 Transcribe 30B-A4B. El adaptador especializa el modelo base en transcripcion de reuniones y habla espontanea en coreano, manteniendo el rendimiento en ingles dentro de los margenes predefinidos. Se distribuye junto con el mecanismo de decodificacion con el que fue evaluado (guarded-dg-v1), un componente obligatorio para reproducir los resultados publicados.

El modelo base es un transformer de tipo Mixture-of-Experts con 30.000 millones de parametros totales y aproximadamente 4.000 millones activos por token (la nomenclatura A4B indica parametros activos). El adaptador anade 36,9 millones de parametros entrenables mediante LoRA con rango 32, incluyendo el proyector multimodal. El repositorio solo contiene los pesos del adaptador (0,1 GB), no los del modelo base.

La relevancia de esta publicacion radica en su enfoque metodologico: todos los numeros reportados se midieron con el adaptador y el guard de decodificacion conjuntamente, y el autor advierte explicitamente de que la inferencia solo con el adaptador no reproduce los resultados. Es un ejemplo de publicacion con puertas de regresion pre-registradas y evaluacion honesta de compromisos entre idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (modelo base); adaptador LoRA r=32 + proyector multimodal |
| Parametros totales | 30.000 millones (modelo base); 36,9 millones entrenables (adaptador) |
| Parametros activos | Aproximadamente 4.000 millones (modelo base, segun nomenclatura A4B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la evaluacion se realizo en bf16) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (adaptador PEFT, cargado con PeftModel sin fusionar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre NVIDIA Nemotron 3.5 Transcribe 30B-A4B, un modelo de transcripcion con arquitectura MoE de 30.000 millones de parametros totales y unos 4.000 millones activos. El adaptador LoRA utiliza rango 32 y entrena 36,9 millones de parametros, incluyendo el modulo `multi_modal_projector` que conecta la entrada de audio con el espacio del modelo. Se carga mediante `PeftModel` sin fusionar con los pesos base, lo que preserva la posibilidad de alternar entre el modelo original y el especializado.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La evaluacion se realizo con decodificacion greedy (`do_sample=False`), un prompt fijo que instruye transcripcion literal con puntuacion y mayusculas, y un limite de tokens generados calculado como `min(8192, ceil(2.0 × (16 + 7.58 × segundos)))`. El mecanismo de guard detiene la generacion cuando los ultimos 40 o mas tokens contienen una unidad de 1 a 64 tokens repetida cuatro o mas veces, y clasifica la salida como `ok`, `empty` o `unverified`. El postprocesado aplica `cleanup_generation_loops` de NVIDIA y elimina tokens especiales y etiquetas de hablante solo sobre salidas `ok`.

## Capacidades

- Transcripcion de voz a texto en coreano con enfasis en reuniones y habla espontanea.
- Transcripcion en ingles con degradacion controlada (FLEURS en_us dentro de la puerta de regresion).
- Decodificacion con guard de repeticion que detecta bucles y genera la etiqueta `unverified` en lugar de texto corrupto.
- Manejo de audio segmentado de hasta 45 segundos por llamada; el audio largo debe dividirse antes de invocar `transcribe`.
- Salida estructurada en JSON con campos `file`, `text`, `status`, `stop_reason`, `n_tokens`, `cap` y `guard_version`.
- Transcripcion literal con puntuacion y mayusculas, incluyendo muletillas y repeticiones segun el prompt fijo.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible (el modelo esta especializado en ASR).
- Capacidades de vision o audio mas alla de la transcripcion: no disponible.

## Casos de uso

- Transcripcion de reuniones corporativas en coreano: el adaptador reduce la tasa de error de palabras del 24,47% al 20,95% en el subconjunto eval_clean de KsponSpeech, lo que lo hace adecuado para actas automaticas con revision humana de segmentos marcados como `unverified`.
- Generacion de subtitulos para contenido audiovisual coreano: la decodificacion greedy con guard evita bucles de repeticion que degradarian subtitulos en produccion, y el formato JSON permite integrar la salida en pipelines de postproduccion.
- Analisis de llamadas de atencion al cliente: el modelo puede transcribir habla espontanea con muletillas y repeticiones, util para mineria de conversaciones y control de calidad, segmentando el audio en fragmentos de hasta 45 segundos.
- Sistemas de documentacion clinica o legal en coreano: la transcripcion literal con puntuacion y mayusculas facilita la revision posterior, y la etiqueta `unverified` permite derivar segmentos dudosos a revision humana en lugar de usarlos como evidencia.
- Investigacion en ASR multilingue: el adaptador sirve como referencia de especializacion LoRA sobre un modelo MoE grande, con puertas de regresion pre-registradas que permiten comparar el impacto de la adaptacion en coreano frente a ingles.
- Pipelines de evaluacion de calidad de transcripcion: la salida estructurada con `stop_reason`, `n_tokens` y `guard_version` permite monitorizar la tasa de segmentos `unverified` como metrica operativa de fiabilidad del sistema.
- Procesamiento por lotes de grabaciones de reuniones: con una GPU de 80 GB en bf16, se pueden procesar segmentos de forma secuencial con el script `infer_guarded.py`, aplicando el guard a cada llamada.

## Benchmarks y rendimiento

Resultados con el adaptador y guarded-dg-v1, comparados con el modelo base decodificado con el mismo pipeline:

| Conjunto (enunciados) | Rol | WER base | WER adaptador | CER base | CER adaptador | No verificados (base → adaptador) |
|---|---|---|---|---|---|---|
| dev_132: AI Hub 132 KconfSpeech held-out (798) | Seleccion de checkpoint | 28,08% | 25,78% | 11,14% | 9,59% | 0 → 2 |
| dev_gen: KsponSpeech eval_clean subset (800) | Seleccion de checkpoint | 24,47% | 20,95% | 10,32% | 7,24% | 0 → 0 |
| test_gen: KsponSpeech eval_clean disjunto (800) | Solo reporte | 25,63% | 21,29% | 9,99% | 6,78% | 0 → 0 |

Puertas de regresion pre-registradas (la base se midio sin guard, por lo que no es una comparacion en las mismas condiciones):

| Conjunto (enunciados) | Metrica | Base sin guard (sellado) | Adaptador con guard | Puerta | Superada |
|---|---|---|---|---|---|
| Zeroth-Korean test (457) | CER | 2,91% | 3,28% | ≤ 3,91% | si |
| Zeroth-Korean test (457) | WER | 21,01% | 18,99% | ≤ 22,01% | si |
| HiKE test, todos los niveles (1.121) | MER / PIER | 29,68 / 46,99 | 19,56 / 31,84 | ≤ 24,68 / ≤ 41,99 | si |
| FLEURS en_us test (647) | WER | 5,27% | 5,31% | ≤ 5,57% | si |

Desglose por nivel en HiKE con el adaptador (MER / PIER): palabra 20,66 / 35,66; frase 19,27 / 30,21; oracion 13,86 / 18,68. Tres de los 1.121 enunciados de HiKE terminaron como `unverified` (2 por repeticion, 1 por limite de longitud) y se puntuan como hipotesis vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 80 GB con el modelo base en bf16 mas el adaptador. No se han publicado requisitos para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: una GPU con 80 GB o mas, como A100 80GB o H100 80GB. No se indica compatibilidad con GPUs de consumo.
- Cabe en GPU de consumo: no disponible segun la informacion proporcionada; el requisito declarado de 80 GB excluye las RTX 4090 (24 GB) y similares en bf16.
- Opciones de despliegue: script `infer_guarded.py` incluido en el repositorio, con `transformers` en el commit `66f51e76efd8542232b8bdd40ade7d1edbaac46f`, `peft>=0.17`, `soundfile`, `librosa` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Thaki-KSpeech-KO-30B-A4B-LoRA-v1 | 30B totales / ~4B activos (base) + 36,9M adaptador | No disponible | ko, en | OpenMDW-1.1 | Adaptador LoRA ASR con guard de decodificacion |
| NVIDIA Nemotron 3.5 Transcribe 30B-A4B (base) | 30B totales / ~4B activos | No disponible | No disponible en esta ficha | No disponible en esta ficha | Modelo base ASR sin especializacion en coreano |
| Alternativas ASR coreanas de gran escala | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El guard de decodificacion es obligatorio: el adaptador por si solo, decodificado con `generate()` simple, puede entrar en bucles de repeticion y fue rechazado sin el guard. Los resultados publicados no se reproducen con inferencia solo del adaptador.
- Los segmentos marcados como `unverified` no tienen transcripcion recuperable; deben excluirse de cualquier sistema que dependa de evidencia o auditoria.
- La CER en Zeroth-Korean empeora 0,36 puntos porcentuales respecto a la base sellada (3,28% frente a 2,91%), dentro de la tolerancia pre-registrada pero constituye una regresion.
- Las comparaciones de las puertas de regresion no son en las mismas condiciones: la base se midio sin guard y el adaptador con guard.
- El audio debe segmentarse en fragmentos de hasta 45 segundos; no se especifica el comportamiento con audio mas largo sin segmentar.
- El modelo esta especializado en coreano e ingles; no se declaran otros idiomas.
- No se han publicado datos sobre sesgos, tasas de alucinacion en dominios especificos ni comportamiento con acentos o ruido fuera de los conjuntos evaluados.
- La licencia OpenMDW-1.1 debe revisarse para uso comercial; la model card la etiqueta como `license: other` con nombre `openmdw-1.1`.
- El repositorio solo contiene el adaptador (0,1 GB); es necesario descargar el modelo base por separado y usar una version concreta de `transformers`.
- No se dispone de informacion sobre cuantizacion, por lo que el despliegue en hardware de menor capacidad no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-KSpeech-KO-30B-A4B-LoRA-v1
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Tarjeta en coreano: https://huggingface.co/ThakiCloud/Thaki-KSpeech-KO-30B-A4B-LoRA-v1/blob/main/MODEL_CARD.ko.md
- Script de inferencia con guard: https://huggingface.co/ThakiCloud/Thaki-KSpeech-KO-30B-A4B-LoRA-v1/blob/main/infer_guarded.py
- Configuracion del pipeline: https://huggingface.co/ThakiCloud/Thaki-KSpeech-KO-30B-A4B-LoRA-v1/blob/main/pipeline.json
- Codigo del guard: https://huggingface.co/ThakiCloud/Thaki-KSpeech-KO-30B-A4B-LoRA-v1/blob/main/thaki_kspeech/decode_guard.py
- Commit de transformers requerido: https://github.com/huggingface/transformers/commit/66f51e76efd8542232b8bdd40ade7d1edbaac46f
- Evaluacion HiKE: https://huggingface.co/ThetaOne-AI/HiKE
