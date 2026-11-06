# zitian-gao/Loopie-20B-A2B-preview

## Resumen

Loopie-20B-A2B-preview es un modelo de lenguaje open source desarrollado por IQuest Research (bajo el usuario de Hugging Face zitian-gao), perteneciente a la serie Loopie, presentada por sus autores como "el Looped Transformer open source más potente hasta la fecha". Se trata de un modelo de mezcla de expertos (MoE) con 20B de parámetros totales y solo 2B activos por token, lo que permite ofrecer rendimiento de modelos mucho mayores con un coste de inferencia comparable al de un modelo denso de 2B.

La versión preview está optimizada principalmente para razonamiento matemático y científico, y según los benchmarks publicados por sus autores compite de tú a tú con modelos como Qwen3 30B-A3B (Thinking), Nemotron 3 Nano y GPT-OSS 20B-A2B, destacando especialmente en AIME 24 (92,09) y AMC (94,21), todo ello habiendo sido entrenado con solo 3,5T de tokens frente a los 25-36T de sus competidores.

Su relevancia radica en la arquitectura Looped Transformer, una innovación técnica que reutiliza bloques transformadores en múltiples pasadas, combinada con la eficiencia MoE. La licencia MIT lo hace plenamente utilizable en entornos comerciales, y el soporte nativo de vLLM facilita su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer MoE (qwen3_moe) |
| Parametros totales | 21.093.121.152 (~20B) |
| Parametros activos | 2B (A2B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Loopie-20B-A2B-preview emplea una arquitectura Looped Transformer combinada con mezcla de expertos (MoE), construida sobre la base de qwen3_moe según los tags del repositorio. La característica distintiva de un Looped Transformer es la reutilización de un mismo bloque (o conjunto de bloques) transformador en varias iteraciones sobre la representación, en lugar de apilar capas únicas. Esto reduce el número de parámetros únicos manteniendo profundidad computacional efectiva, y en combinación con la activación dispersa MoE (2B de 20B parámetros activos por token) permite inferencia rápida con capacidad de razonamiento elevada.

El modelo fue preentrenado con 3,5T de tokens, una cifra notablemente inferior a la de competidores comparables (Qwen3 30B-A3B: 36T; Nemotron 3 Nano y Nemotron Cascade 2: 25T), lo que sugiere una eficiencia de entrenamiento destacable atribuible a la arquitectura Looped. No hay información disponible sobre la composición del dataset, ni sobre el uso de RLHF, DPO u otros métodos de alineación posterior. La versión preview está optimizada para razonamiento matemático y científico.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, formato de mensajes multi-turno).
- Razonamiento matemático avanzado: AIME 24 de 92,09, AIME 25 de 83,75 y AMC de 94,21, resultados de nivel olimpiadas.
- Razonamiento científico y conocimiento general: MMLU de 81,28 y SciQ de 92,50.
- Generacion de codigo: HumanEval de 89,02 y MBPP de 89,49.
- Comprension de lectura y razonamiento sobre documentos: DROP de 82,08.
- Seguimiento de instrucciones: IFEval de 84,72, superior a GPT-OSS 20B-A2B High (70,03).
- Soporte de inferencia optimizada en vLLM.
- No hay informacion disponible sobre tool calling, soporte de agentes, capacidades multilingues, visión o audio.

## Casos de uso

- Resolucion de problemas matematicos avanzados: con 92,09 en AIME 24, el modelo es adecuado para asistentes de matematicas, verificacion de demostraciones y plataformas educativas de nivel olimpiada, activando solo 2B de parámetros por token.
- Razonamiento cientifico y consultas tecnicas: su optimizacion en razonamiento científico (SciQ 92,50, MMLU 81,28) lo hace util para asistentes de investigacion que resumen y razonan sobre literatura tecnica.
- Generacion y completado de codigo: con HumanEval de 89,02 y MBPP de 89,49, puede integrarse en asistentes de programacion para autocompletado y generacion de funciones, con coste de inferencia bajo por su activacion MoE.
- Despliegue economico en produccion: al activar solo 2B de parámetros, ofrece throughput alto en vLLM, adecuado para chatbots de atencion al cliente o asistentes internos con volumenes de peticion elevados y presupuesto de GPU limitado.
- Comprension de documentos y extraccion de informacion: DROP de 82,08 indica buena capacidad de razonamiento sobre pasajes, util para analisis de informes y respuestas basadas en documentos.
- Seguimiento de instrucciones en agentes conversacionales: IFEval de 84,72 lo hace fiable para flujos donde el modelo debe respetar formatos y restricciones de salida especificadas por el usuario.
- Investigacion en arquitecturas Looped Transformer: al ser open source con licencia MIT y publicar paper en arXiv, es un excelente punto de partida para estudiar la eficiencia de la reutilizacion de bloques.

## Benchmarks y rendimiento

Datos publicados por los autores del modelo (Loopie-20B-A2B frente a modelos comparables):

| Benchmark | Qwen3 30B-A3B Thinking | Nemotron 3 Nano 30B-A3B | Nemotron Cascade 2 30B-A3B | GPT-OSS 20B-A2B High | Loopie 20B-A2B |
|---|---:|---:|---:|---:|---:|
| Pre-training tokens | 36T | 25T | 25T | Unknown | **3,5T** |
| MMLU | 85,83 | 80,52 | 81,22 | 81,64 | 81,28 |
| MMLU-Redux | 88,25 | 82,54 | 83,89 | 83,40 | 83,61 |
| ARC-Challenge | 96,67 | 91,96 | 93,86 | 92,42 | 93,52 |
| DROP | 87,70 | 85,92 | 79,06 | 62,82 | 82,08 |
| BBH | 86,59 | 68,76 | 75,86 | 84,76 | 82,28 |
| SciQ | 95,40 | 93,40 | 92,40 | 93,80 | 92,50 |
| IFEval | 85,58 | 77,05 | 79,21 | 70,03 | 84,72 |
| MBPP | 96,50 | 90,66 | 80,54 | 78,99 | 89,49 |
| MBPP+ | 98,68 | 91,53 | 83,60 | 97,62 | 83,07 |
| HumanEval | 96,95 | 86,59 | 79,88 | 92,07 | 89,02 |
| HumanEval+ | 92,07 | 87,80 | 78,66 | 89,02 | 87,20 |
| AIME 24 | 90,10 | 85,00 | 93,33 | 88,33 | 92,09 |
| AIME 25 | 83,75 | 74,17 | 91,25 | 87,50 | 83,75 |
| AMC | 96,73 | 91,80 | 93,57 | 91,05 | 94,21 |
| OlympiadBench | 81,20 | 76,68 | 88,64 | 70,03 | 80,50 |

Estos resultados provienen de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~21B de parámetros en precisión BF16, se necesitan aproximadamente 42 GB (coincide con el tamaño del repo de 42,2 GB); en FP8/INT8 se situaria en torno a 21 GB, aunque no hay cuantizaciones oficiales publicadas (no disponible).
- GPU recomendadas: una A100 80GB o H100 40/80GB para servir el modelo en BF16; en entornos de un solo usuario, dos RTX 4090 (48 GB combinados) podrian alojar la version en precision completa con sharding, aunque no hay confirmacion oficial.
- Consumer GPU: no cabe en una sola GPU de consumo en BF16 (una RTX 4090 tiene 24 GB frente a los ~42 GB necesarios); requeriria cuantizacion no publicada todavia o multi-GPU.
- Despliegue: soporte oficial de vLLM (mediante fork del autor: `pip install https://github.com/zitian-gao/vllm`) y de transformers (fork: `pip install https://github.com/zitian-gao/transformers`). No hay informacion sobre compatibilidad con llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: no disponibles; al activar solo 2B de parámetros por token, se espera un rendimiento cercano al de un modelo denso de 2B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Tokens de preentrenamiento | MMLU | AIME 24 | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Loopie 20B-A2B | ~20B | 2B | 3,5T | 81,28 | 92,09 | MIT |
| Qwen3 30B-A3B Thinking | 30B | 3B | 36T | 85,83 | 90,10 | Apache 2.0 |
| GPT-OSS 20B-A2B High | 20B | 2B | no disponible | 81,64 | 88,33 | Apache 2.0 |
| Nemotron 3 Nano 30B-A3B | 30B | 3B | 25T | 80,52 | 85,00 | no disponible |

Loopie ofrece un rendimiento matematico competitivo (mejor AIME 24 que Qwen3 Thinking y GPT-OSS) con menos tokens de entrenamiento y licencia MIT, más permisiva que Apache 2.0 en cuanto a obligaciones de atribucion.

## Limitaciones y advertencias

- Es una version preview: el modelo esta optimizado para razonamiento matematico y cientifico, y puede rendir por debajo de alternativas en tareas generales, creativas o multilingues.
- Requiere forks especificos de transformers y vLLM mantenidos por el autor, no las librerias oficiales, lo que introduce riesgo de mantenimiento y compatibilidad a futuro.
- No hay informacion sobre idiomas soportados, longitud de contexto, cuantizaciones oficiales ni soporte de tool calling; su uso en produccion requiere validacion propia.
- Los benchmarks provienen exclusivamente de la model card del autor y no de una evaluacion independiente.
- Riesgo de alucinacion: no documentado especificamente, pero como todo LLM puede generar informacion incorrecta con apariencia plausible, especialmente fuera del dominio matematico/cientifico.
- Sesgos: no hay documentacion sobre sesgos conocidos; al desconocerse la composicion del dataset de entrenamiento, no es posible evaluarlos.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones significativas, un punto a favor frente a licencias con limitaciones de uso.
- La longitud de contexto no esta publicada; no se recomienda asumir ventanas largas sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zitian-gao/Loopie-20B-A2B-preview
- Paper en arXiv: https://arxiv.org/abs/2607.16051
- Fork de transformers del autor: https://github.com/zitian-gao/transformers
- Fork de vLLM del autor: https://github.com/zitian-gao/vllm
