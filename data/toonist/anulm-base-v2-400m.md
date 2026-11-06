# toonist/AnuLM-Base-v2-400M

## Resumen

AnuLM-Base-v2-400M es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el autor independiente toonist, entrenado desde cero sobre hindi, ingles y codigo Python. Se trata de una reimplementacion independiente del diseno arquitectonico del modelo Sarvam 30B, escalada a un tamano de aproximadamente 398 millones de parametros totales con 173,5 millones activos por token. Su proposito principal es la investigacion y la docencia en torno a modelos MoE pequenos y el modelado del hindi, ademas de servir como punto de partida para ajuste fino.

El modelo es la segunda iteracion de la familia base de AnuLM y sustituye a AnuLM-Base-400M, que solo habia procesado unos 150 millones de tokens. Esta version ha sido entrenada durante 1,9 millones de pasos sobre un corpus de 11,3 mil millones de tokens, de los cuales ha consumido aproximadamente 7,8 mil millones, lo que supone un incremento de unas cincuenta veces en volumen de datos respecto a su predecesor. El entrenamiento se llevo a cabo en una unica GPU de consumo (RTX 5070 Ti de 16 GB).

Es relevante ahora porque demuestra que es viable entrenar un MoE funcional desde cero en hardware de consumo, con una ventana de contexto de 1024 tokens y un tokenizador de 32.768 entradas. No obstante, es un modelo base: no esta ajustado para instrucciones, chat ni traduccion, y su uso previsto se limita a investigacion, ensenanza y ajuste fino posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts (MoE), GQA con QK-norm, RoPE, sliding window en capas 0-9 |
| Parametros totales | 397.660.560 (397,7M) |
| Parametros activos | 173,5M por token |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (el autor recomienda cargar en float32; la cuantizacion a 16 bits altera el enrutamiento de expertos) |
| Idiomas soportados | Hindi (devanagari), ingles y Python (codigo) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`; el codigo de modelado viaja con los pesos) |

## Arquitectura y entrenamiento

La red consta de 20 capas con dimension oculta de 1024. Emplea atencion con 16 cabezas de consulta y 4 de clave-valor (GQA) con QK-norm y RoPE, y aplica sliding window de 256 tokens en las capas 0 a 9. La capa 0 contiene un MLP denso SwiGLU; las capas 1 a 19 incorporan 24 expertos enrutados de dimension 192 con enrutamiento top-4, sin experto compartido, y un sesgo de equilibrado libre de perdida auxiliar (aux-loss-free bias balancing). El vocabulario es de 32.768 entradas con embeddings no atados. La arquitectura es una reimplementacion independiente del diseno Sarvam 30B.

El entrenamiento se realizo durante 1.900.000 pasos con batch de 4 secuencias de 1024 tokens (unos 7,8 mil millones de tokens) sobre un corpus de 11,3 mil millones de tokens. Se uso un schedule warmup-stable-decay con AdamW y una tasa de aprendizaje de 6e-4 que decae a 6e-5 en el ultimo 16% del entrenamiento; el decaimiento comenzo en el paso 1.590.000. La ejecucion estaba planificada para 2,75 millones de pasos y se acorto a 1,9 millones tras una caida de la maquina. El corpus combina fineweb-edu (6,00B tokens en ingles), fineweb-2 `hin_Deva` (4,50B en hindi web), Wikipedia en hindi (0,07B), y una porcion de Python de 0,75B tokens procedente de codeparrot-clean, nvidia/OpenCodeInstruct y OpenCoder-LLM/opc-sft-stage1. Se excluyo deliberadamente jinaai/code_exercises por sus terminos CC BY-NC-SA. El resultado final fue una perdida de validacion de 3,3523 ± 0,0491 y 0,756 bits por byte.

## Capacidades

- Continuacion de texto en hindi (devanagari), ingles y Python, en el registro que se le proporcione.
- Modelado de lenguaje base: no responde preguntas ni sigue instrucciones sin ajuste posterior.
- Generacion de codigo Python como continuacion de texto, no como asistente de programacion.
- Capacidad multilingue limitada a hindi e ingles; no se entrenó para otras lenguas indicas, hindi romanizado ni texto con mezcla de codigos.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No tiene vision, audio ni modo de razonamiento explicito.
- Sirve como backbone para los adaptadores de la aplicacion de demostracion AnuLM (chat, reconocimiento de voz, subtitulos, preguntas sobre imagenes y adaptadores Decide).

## Casos de uso

- Investigacion sobre modelos MoE pequenos: permite estudiar el comportamiento del enrutamiento top-4, el equilibrado de expertos y el efecto del sliding window en un modelo que cabe en una sola GPU de consumo.
- Docencia en modelado de lenguaje: sirve para ilustrar el entrenamiento desde cero, el schedule warmup-stable-decay y la construccion de corpus multilingues con licencias verificadas.
- Punto de partida para ajuste fino supervisado en hindi: al haber leido 4,5 mil millones de tokens de hindi web y Wikipedia, ofrece una base razonable para tareas posteriores de clasificacion o generacion en devanagari.
- Generacion de codigo Python como autocompletado experimental: puede continuar fragmentos de codigo, aunque requiere revision humana por la procedencia copyleft de parte del corpus.
- Ajuste fino para chat o instrucciones: el autor indica que AnuLM-Chat-400M parte de este modelo, por lo que es el sustrato adecuado para experimentos de instruction tuning.
- Experimentacion con tecnicas de decodificacion: su tendencia a la repeticion en generaciones largas lo convierte en un banco de pruebas para penalizaciones de repeticion y estrategias de muestreo.
- Base para tareas downstream en la aplicacion AnuLM: el autor reporta mejoras al sustituir el checkpoint anterior en ASR ingles (WER 8,4% a 7,1%), ASR hindi (51,0% a 35,0% sobre 50 clips de FLEURS), A-OKVQA (40,9% a 43,5%) y perdida de respuesta en chat (3,2000 a 3,1445).

## Benchmarks y rendimiento

El model-index oficial no declara resultados de benchmarks externos. Los unicos datos publicados son metricas internas sobre el split de validacion del propio corpus (1% de documentos, por hash):

| Metrica | Valor |
|---|---|
| Perdida de validacion en el paso 1.900.000 | 3,3523 ± 0,0491 |
| Bits por byte | 0,756 |
| Base de demostracion de 800k pasos a la que sustituye | 3,393 / 0,765 |

El autor indica explicitamente que no se han medido bits por byte por idioma, pass@1 en codigo ni ningun benchmark externo para este checkpoint. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 397,7M parametros. En float32 (recomendado por el autor para preservar el sesgo por experto del enrutador) ocupa aproximadamente 1,6 GB de pesos, mas overhead de activaciones y cache KV; en la practica cabe holgadamente en GPUs de 8 GB o mas.
- El autor advierte que cargarlo en 16 bits cambia que expertos se activan, por lo que la cuantizacion a media precision no es fiable sin validacion.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. El entrenamiento se realizo en una RTX 5070 Ti de 16 GB; para inferencia bastan tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el codigo de modelado viaja con los pesos). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AnuLM-Base-v2-400M | 397,7M | 173,5M | 1024 | CC BY-SA 4.0 | MoE, entrenado en una GPU consumer, hindi/ingles/Python |
| AnuLM-Base-400M (predecesor) | ~400M | no disponible | no disponible | CC BY-SA 4.0 | Solo ~150M tokens vistos; perdida de validacion 3,393 |
| Sarvam 30B (referencia arquitectonica) | 30B | no disponible | no disponible | no disponible | Diseno en el que se basa la arquitectura, no es una alternativa de mismo tamano |
| Modelos densos de ~400M (p. ej. variantes tipo GPT-2 small / Pythia-410M) | ~400M | densos | variable | variable | No hay datos comparativos publicados en la informacion disponible |

No se dispone de comparaciones de rendimiento con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base: continua texto, no responde preguntas ni sigue instrucciones. Para chat hay que partir de AnuLM-Chat-400M.
- Con 173,5M parametros activos y unos 7,8 mil millones de tokens vistos, degenera en repeticion en generaciones largas; el autor recomienda penalizacion de repeticion y salidas cortas.
- Inventa hechos: todo nombre, fecha o numero debe tratarse como no verificado.
- El hindi cubierto es devanagari de web y Wikipedia; no se entrenó para otras lenguas indicas, hindi romanizado ni texto con mezcla de codigos.
- El codigo Python procede en parte de archivos de GitHub con licencias copyleft (GPL y AGPL); lo que genere puede parecerse a ese material.
- Debe cargarse en float32: el enrutador mantiene un sesgo por experto y redondearlo a 16 bits cambia que expertos se activan.
- La licencia CC BY-SA 4.0 impone atribucion y compartir igual; ademas, el corpus combina fuentes con licencias ODC-BY, CC BY-SA y copyleft, lo que condiciona el uso comercial y la redistribucion.
- Ventana de contexto de solo 1024 tokens, insuficiente para tareas de contexto largo.
- El autor declara no estar afiliado a Sarvam AI, AI4Bharat, BharatGen ni al Gobierno de India.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toonist/AnuLM-Base-v2-400M
- Repositorio del proyecto AnuLM: https://github.com/MOBIRIZER-TECHNOLOGY/AnuLM
- Documentacion de resultados del proyecto: `docs/RESULTS.md` (seccion 39) en el repositorio
- Script de construccion del corpus: `experiments/build_v2.py` en el repositorio
- Metadatos del corpus: `data/v2/meta.json` en el repositorio
- Aplicacion de demostracion: `app_omni.py` en el repositorio
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Wikipedia en hindi: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset codeparrot-clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Dataset nvidia/OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset OpenCoder-LLM/opc-sft-stage1: https://huggingface.co/datasets/OpenCoder-LLM/opc-sft-stage1
