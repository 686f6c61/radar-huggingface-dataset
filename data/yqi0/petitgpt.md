# yqi0/petitgpt

## Resumen

PetitGPT es un modelo de lenguaje de 124,6 millones de parametros entrenado desde cero por Yang Qi (usuario `yqi0` en Hugging Face) como proyecto de investigacion. El objetivo declarado es estudiar el entrenamiento eficiente de modelos pequenos, los compromisos del post-entrenamiento y las metodologias de evaluacion, usando un unico GPU de consumo (una NVIDIA RTX 4090) durante todo el proceso de preentrenamiento, en el que se procesaron aproximadamente 13.000 millones de posiciones de entrada del modelo.

El checkpoint publicado, `alpha075`, forma parte de la release `research-v1` y se distribuye junto con un tokenizador propio, la configuracion del modelo y una implementacion de inferencia nativa en PyTorch. La arquitectura emplea atencion con query grouping (GQA) y, segun las etiquetas del repositorio, se aplico interpolacion de modelos (model interpolation) como parte del post-entrenamiento, ademas de una fase de SFT sobre `smol-smoltalk`.

Es relevante ahora por su caracter didactico y reproducible: demuestra que es posible llevar a cabo un ciclo completo de preentrenamiento y ajuste supervisado de un transformer de ~125M de parametros en hardware de consumo, publicando el informe tecnico, las sumas de verificacion de los ficheros y una guia de ejecucion. No obstante, la release tiene limitaciones de compatibilidad importantes: no implementa carga via `AutoModel` de Transformers ni ofrece pesos en GGUF u ONNX, y el CLI requiere una GPU CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (query grouping attention) |
| Parametros totales | 124.635.456 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF/ONNX; solo safetensors en FP32/BF16 segun implementacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tokenizador | propio, incluido en el repositorio |
| Implementacion de inferencia | PyTorch nativo (CLI propio, requiere CUDA) |
| Hardware de entrenamiento | 1x NVIDIA RTX 4090 |
| Tokens de preentrenamiento | ~13.000 millones de posiciones de entrada |

## Arquitectura y entrenamiento

PetitGPT es un transformer decoder-only con atencion de tipo grouped-query attention (GQA), disenado para reducir el coste de memoria del cache KV frente a la atencion multi-cabeza clasica, algo especialmente relevante cuando el objetivo es entrenar en un unico GPU de 24 GB. El modelo se entreno desde cero, sin inicializacion a partir de pesos preexistentes, procesando aproximadamente 13.000 millones de posiciones de entrada durante el preentrenamiento. La configuracion del modelo se publica en el repositorio junto con los pesos.

El corpus de preentrenamiento combina varios datasets publicos: `HuggingFaceTB/smollm-corpus`, `HuggingFaceTB/dclm-edu`, `HuggingFaceFW/finewiki`, `HuggingFaceFW/finephrase`, `allenai/dolmino-mix-1124` y `common-pile/stackv2_edu_filtered`. El post-entrenamiento incluye una fase de SFT sobre `HuggingFaceTB/smol-smoltalk` y tecnicas de interpolacion de modelos (etiqueta `model-interpolation`), una practica habitual para promediar checkpoints o combinar modelos ajustados y mejorar la robustez sin coste adicional de entrenamiento. No se detalla en la informacion disponible el uso de RLHF o DPO, ni la composicion exacta por fracciones de cada dataset.

## Capacidades

- Generacion de texto en ingles: modelo causal de lenguaje para continuacion y generacion libre.
- Razonamiento basico y respuesta a preguntas de opcion multiple, evaluado en modo zero-shot por verosimilitud (ARC-Easy, ARC-Challenge, PIQA, HellaSwag).
- Seguimiento de instrucciones: dispone de plantilla de chat nativa y fue evaluado en IFEval con decodificacion greedy.
- Ajuste supervisado (SFT) sobre datos conversacionales (`smol-smoltalk`), lo que le permite mantener formato de dialogo.
- Capacidades multilingues: limitadas al ingles segun la model card (`language: en`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.
- Inferencia nativa en PyTorch con CLI propio; no hay soporte para vLLM, llama.cpp, TGI ni CPU en esta release.

## Casos de uso

- Investigacion sobre entrenamiento eficiente: reproducir el pipeline completo de preentrenamiento y SFT en una unica RTX 4090 permite estudiar curvas de escalado, eleccion de hiperparametros y coste energetico en modelos de ~125M de parametros sin acceso a clústeres.
- Docencia y formacion: el repositorio incluye informe tecnico, guia de ejecucion y sumas de verificacion, lo que lo convierte en un material adecuado para cursos de LLMs donde se quiera mostrar el ciclo completo desde cero hasta el ajuste conversacional.
- Experimentos de interpolacion de modelos: al publicar checkpoints y configuracion, sirve como banco de pruebas para estudiar tecnicas de model averaging y su efecto en benchmarks de opcion multiple.
- Evaluacion comparativa de modelos pequenos: sus resultados en ARC, PIQA, HellaSwag e IFEval permiten situarlo frente a otros modelos de ~125M en tareas de conocimiento comun y seguimiento de instrucciones.
- Generacion de texto de baja latencia en prototipos: con 124,6M de parametros cabe holgadamente en una GPU de consumo, por lo que puede usarse como generador de texto en demos locales siempre que se acepte la limitacion al ingles y la ausencia de tool calling.
- Estudio de tokenizadores: al incluir un tokenizador propio, es util para analizar como afectan las decisiones de tokenizacion al rendimiento en tareas de opcion multiple y al coste de entrenamiento.
- Base para fine-tuning especifico de dominio: al estar bajo licencia Apache 2.0 y con pesos safetensors, puede ajustarse en ingles para tareas concretas (clasificacion, resumen, extraccion) en entornos con un solo GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (evaluador nativo compatible con el protocolo, no una ejecucion instalada de `lm-evaluation-harness`; metrica de verosimilitud zero-shot en FP32 salvo donde se indique):

| Benchmark | Metrica | Valor |
|---|---|---|
| ARC-Easy (test) | accuracy | 57,74 |
| ARC-Easy (test) | accuracy normalizada | 52,36 |
| PIQA (validation) | accuracy | 63,49 |
| PIQA (validation) | accuracy normalizada | 62,30 |
| ARC-Challenge (test) | accuracy | 28,16 |
| ARC-Challenge (test) | accuracy normalizada (protocolo del proyecto) | 32,68 |
| HellaSwag (validation) | accuracy | 31,28 |
| HellaSwag (validation) | accuracy normalizada (protocolo del proyecto) | 35,60 |
| IFEval | prompt-level strict accuracy | 17,19 |
| IFEval | instruction-level strict accuracy | 28,54 |
| IFEval | prompt-level loose accuracy | 17,74 |
| IFEval | instruction-level loose accuracy | 29,98 |

No se han publicado en la informacion disponible resultados de MMLU, GSM8K, HumanEval ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124,6M de parametros, los pesos en FP32 ocupan aproximadamente 0,5 GB y en BF16/FP16 unos 0,25 GB; el consumo real depende del cache KV y de la longitud de contexto, no especificada.
- GPU recomendadas: cualquier GPU CUDA con al menos 2-4 GB de VRAM deberia ser suficiente para inferencia en precision completa; el autor entreno en una RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se use la implementacion nativa en PyTorch.
- Opciones de despliegue: unicamente el CLI nativo en PyTorch incluido en el repositorio, que requiere CUDA. GGUF, ONNX, vLLM, llama.cpp, Ollama, TGI y la inferencia en CPU no estan implementados ni validados en esta release.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| PetitGPT (alpha075) | 124,6M | no disponible | Apache 2.0 | safetensors, CLI PyTorch nativo con CUDA | Entrenado desde cero en una RTX 4090; solo ingles; sin tool calling |
| SmolLM-135M (HuggingFaceTB) | 135M | no disponible en esta ficha | Apache 2.0 | Transformers, GGUF, llama.cpp, etc. | Alternativa de tamano similar con ecosistema de despliegue amplio; no se dispone de comparacion de benchmarks en la informacion |
| Qwen2.5-0.5B | ~500M | no disponible en esta ficha | Apache 2.0 | Transformers, GGUF, vLLM | Mayor tamano y soporte multilingue; no comparable directamente por escala |
| GPT-2 small | 124M | 1024 tokens | MIT | Transformers, GGUF | Referencia historica de mismo orden de parametros; no se dispone de comparacion de benchmarks en la informacion |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y opciones de despliegue.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Con 124,6M de parametros y ~13.000 millones de tokens de preentrenamiento, la capacidad de razonamiento es limitada: los resultados en ARC-Challenge (28,16 de accuracy) y HellaSwag (31,28) estan cerca o por debajo del azar en tareas de cuatro opciones.
- Riesgo elevado de alucinacion en preguntas factuales y en generacion abierta, inherente a modelos de este tamano.
- IFEval muestra un seguimiento de instrucciones debil (17,19 de prompt-level strict accuracy), por lo que no es adecuado para tareas que requieran cumplir restricciones estrictas de formato o contenido.
- La longitud de contexto no se especifica en la informacion disponible; no debe asumirse una ventana larga.
- La release no implementa carga via `AutoModel` de Transformers ni formatos GGUF/ONNX, y el CLI requiere CUDA: no es desplegable en CPU ni en entornos sin GPU NVIDIA.
- Los benchmarks son declarados por el autor con un evaluador nativo propio, no verificado de forma independiente ni ejecutado con `lm-evaluation-harness` instalado; deben interpretarse con cautela.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion en produccion, el limitado soporte de herramientas y el bajo rendimiento en tareas complejas desaconsejan su uso comercial directo sin ajuste adicional.
- No se documentan sesgos especificos; al entrenarse sobre corpus web publicos, es probable que herede sesgos presentes en dichos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yqi0/petitgpt
- Repositorio GitHub del proyecto: https://github.com/yangqi0/petitgpt
- Informe tecnico: https://github.com/yangqi0/petitgpt/blob/53a5bb33052fa8092987eacc1047e040a7c5ce30/docs/petitgpt-v1/TECHNICAL_REPORT.md
- Seccion de evaluacion de opcion multiple del informe: https://github.com/yangqi0/petitgpt/blob/53a5bb33052fa8092987eacc1047e040a7c5ce30/docs/petitgpt-v1/TECHNICAL_REPORT.md#81-public-multiple-choice-likelihood-frozen-fp32
- Seccion de IFEval del informe: https://github.com/yangqi0/petitgpt/blob/53a5bb33052fa8092987eacc1047e040a7c5ce30/docs/petitgpt-v1/TECHNICAL_REPORT.md#84-ifeval-instruction-following
- Guia de ejecucion: RUN_GUIDE.md (en el repositorio de Hugging Face)
- Sumas de verificacion: SHA256SUMS (en el repositorio de Hugging Face)
