# TheEpiales/Project-Norn-K-Mini-4B

## Resumen

Project Norn: K-Mini 4B es un modelo de lenguaje de 4.022 millones de parametros desarrollado por Osakra Research, un fine-tune del backbone Qwen3-4B-Base de Alibaba. Se presenta como un modelo orientado a dispositivos edge con 8 GB de VRAM, especializado en generacion de codigo, matematicas, tool calling multi-turno y enrutamiento neuro-simbolico. Se distribuye principalmente como GGUF cuantizado (Q4_K_M) compatible con Ollama, llama.cpp y LM Studio sin modificaciones.

El modelo incorpora una innovacion peculiar: tokens de acondicionamiento neuroquimico en vocabulario (`<|state:acetylcholine|>`, `<|state:serotonin|>`, `<|state:dopamine|>`, `<|state:boredom_decay|>`) entrenados directamente en los pesos. Ademas, el autor ofrece una pila opcional neuro-simbolica (Titans-NCM) como sidecar en Python/CUDA que anade memoria asociativa y representaciones holograficas reducidas (HRR) de 10.000 dimensiones.

Es relevante por su enfoque en eficiencia extrema (4,8 GB de VRAM con 8.192 tokens de contexto a ~70 tokens/s) y por publicar transcripciones de evaluacion por problema. No obstante, el modelo tiene cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que limita la validacion independiente de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B-Base) con tokens de estado neuroquimico en vocabulario |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (configuracion reportada para el perfil de VRAM) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (k-mini-Q4_K_M.gguf) + Modelfile; sidecar opcional hrr_adapter.pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4,02 B de parametros derivado de Qwen3-4B-Base mediante fine-tuning. El autor indica que el ajuste se realizo sobre trayectorias verificables de codigo, matematicas y recuperacion de errores en contextos agenticos. La innovacion principal consiste en integrar tokens de acondicionamiento neuroquimico dentro del vocabulario del modelo, de modo que el enrutamiento de estado se ejecuta en runtimes estandar (Ollama, llama.cpp, LM Studio) sin parches en C++ ni binarios personalizados.

El autor describe dos modos de operacion. El modo A es el GGUF autonomo con los tokens de estado integrados en los pesos. El modo B anade una pila neuro-simbolica opcional: un router ejecutivo Titans-NCM en PyTorch/CUDA (puerto 8092), un adaptador HRR de 10.000 dimensiones con convolucion circular via FFT (2560 -> 512 -> 10000 -> 512 -> 2560) y un modulo `TitansConceptMemory` de 2.560 dimensiones que rastrea normas de sorpresa y recall episodico entre turnos. El autor no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Generacion de codigo con enfasis en Python (HumanEval, MBPP reportados).
- Razonamiento matematico (GSM8K reportado).
- Tool calling y function calling de primer turno (100% de adherencia reportada en 50/50 casos).
- Enrutamiento de estado neuroquimico mediante tokens `<|state:*|>` en vocabulario.
- Recuperacion de errores en trayectorias agenticas (segun el autor).
- Memoria asociativa episodica opcional mediante el sidecar Titans-NCM (modo B).
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Generacion de codigo en estaciones de trabajo con GPU consumer: el modelo cabe en 4,8 GB de VRAM en Q4_K_M con 8.192 tokens de contexto, lo que permite autocompletado y generacion de funciones Python en portatiles con RTX 4070 o equivalentes sin depender de la nube.
- Asistentes de codigo integrados en IDE: gracias a su soporte de tool calling y a los tokens de estado, puede encadenar lecturas de ficheros, ejecuciones de tests y correcciones en un bucle agentico local.
- Automatizacion de tareas de refactorizacion: con 8.192 tokens de contexto puede procesar modulos de tamano medio y aplicar transformaciones con verificacion mediante ejecucion de tests.
- Tutoria de matematicas a nivel de secundaria: los resultados reportados en GSM8K (83%) lo hacen viable para resolver y explicar problemas aritmeticos paso a paso en local.
- Enrutamiento de herramientas en pipelines de agentes: la adherencia del 100% reportada en tool routing de primer turno permite usarlo como capa de decision para seleccionar APIs o funciones en sistemas multi-agente.
- Despliegue en dispositivos edge sin conectividad: al ejecutarse en Ollama y llama.cpp sin parches, puede empaquetarse en entornos con recursos limitados y requisitos de privacidad (por ejemplo, estaciones de trabajo aisladas).
- Experimentacion en investigacion neuro-simbolica: el sidecar HRR y TitansConceptMemory permiten probar mecanismos de memoria asociativa sobre un backbone estandar de 4 B.

## Benchmarks y rendimiento

Resultados reportados por el autor, medidos en Q4_K_M sobre una RTX 4070 Laptop con 8 GB de VRAM, decodificacion greedy (T=0.0) y ejecucion real de tests en Python.

| Benchmark | K-Mini 4B (Q4_K_M) | Notas |
|---|---|---|
| HumanEval pass@1 | 83,54% (137/164) | 606,3 s de ejecucion total |
| GSM8K (strict match) | 83,0% (83/100) | 367,5 s de ejecucion total |
| MBPP | 77,0% (77/100) | Sobre 100 problemas de test |
| MMLU | 70,0% (70/100) | 57 asignaturas |
| 45-Pillar Executive Suite (modo A) | 82,22% (37/45) | GGUF autonomo |
| 45-Pillar Executive Suite (modo B) | 86,67% (39/45) | Con sidecar Titans-NCM; 9/15 pilares perfectos |
| Tool routing primer turno | 100,0% (50/50) | Adherencia a tokens de estado |

No se dispone de comparaciones publicadas por terceros ni de resultados en BF16/FP16 sin cuantizar. El autor separa explicitamente sus cifras de las de baselines oficiales en servidor y no proporciona una tabla comparativa directa con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 4,8 GB con contexto de 8.192 tokens en cuantizacion Q4_K_M (cifra reportada por el autor).
- GPU recomendadas: RTX 4070 Laptop (8 GB) es el hardware de referencia de las evaluaciones; cualquier GPU consumer con 6-8 GB o mas deberia ser suficiente para el GGUF.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, etc.).
- Opciones de despliegue: Ollama (con Modelfile incluido), llama.cpp, LM Studio. El modo B requiere ademas Python con PyTorch/CUDA para `ncm_server.py` y `swarm_proxy.py`.
- Latencia y throughput: aproximadamente 70 tokens/s en el hardware de referencia con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Project Norn K-Mini 4B | 4,02 B denso | 8.192 | Apache 2.0 | GGUF en HF | Fine-tune de Qwen3-4B-Base con tokens de estado |
| Qwen3-4B-Base | 4,02 B denso | No disponible en la informacion proporcionada | Apache 2.0 | Pesos en HF | Backbone original del que deriva K-Mini |
| Alternativas de ~4 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se han proporcionado resultados de benchmarks de modelos alternativos en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta documentado.
- El modelo tiene cero descargas y cero likes en Hugging Face en el momento de la consulta, sin validacion independiente de los benchmarks reportados.
- Los resultados de benchmarks proceden del propio autor y estan medidos en una unica configuracion de hardware y cuantizacion; no se han replicado por terceros.
- El contexto maximo documentado en el perfil de VRAM es de 8.192 tokens; no se especifica la longitud de contexto nativa del backbone.
- Los tokens de estado neuroquimico son una innovacion no estandar: su comportamiento fuera de las trayectorias de entrenamiento no esta caracterizado y podrian inducir respuestas atipicas si se usan de forma no prevista.
- El modo B (sidecar Titans-NCM) anade complejidad operativa (dos servicios, PyTorch/CUDA) y no se ha validado su estabilidad en produccion.
- Riesgo de alucinacion inherente a modelos de 4 B; no se han publicado evaluaciones de factualidad ni de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar los datos de fine-tuning antes de desplegar en entornos regulados.
- No hay informacion sobre la composicion del dataset de entrenamiento ni sobre posibles sesgos heredados de Qwen3-4B-Base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheEpiales/Project-Norn-K-Mini-4B
- Modelo base Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset MMLU (cais/mmlu): https://huggingface.co/datasets/cais/mmlu
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Transcripciones de benchmarks (referenciadas en la model card, rutas relativas al repo): `./benchmarks/live_verified_humaneval_164.json`, `./benchmarks/live_verified_gsm8k_100.json`, `./benchmarks/live_verified_mbpp_test.json`, `./benchmarks/executive_suite_45_results.json`
