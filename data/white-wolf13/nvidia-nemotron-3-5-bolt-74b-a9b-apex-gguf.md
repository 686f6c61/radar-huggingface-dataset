# White-Wolf13/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-APEX-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-74B-A9B-APEX-GGUF es una coleccion de cuantizaciones GGUF del modelo base NVIDIA Nemotron 3.5 Bolt 74B-A9B, publicada por el usuario White-Wolf13. El modelo subyacente es un transformer hibrido de NVIDIA que combina bloques Mamba-2 (SSM), bloques de mezcla de expertos (MoE) y bloques de atencion completa en una unica arquitectura de 88 capas. Con 74.042.720.768 parametros totales y aproximadamente 9B activos por token, se posiciona como un modelo de razonamiento disperso de gran escala con una ventana de contexto nativa de 262.144 tokens.

El interes de esta publicacion concreta no esta en el modelo base, sino en el trabajo de cuantizacion. La coleccion APEX-I aplica una asignacion adaptativa de bits por rol de tensor, guiada por matrices de importancia (imatrix) y con proteccion explicita de los componentes mas sensibles a la cuantizacion: routers en FP32, proyecciones de enrutamiento latente en Q8_0, embeddings y cabeza de salida en Q8_0. Esto permite llevar un modelo de 74B a formatos que caben en GPUs de consumo, desde 32,9 GiB (3,82 BPW) hasta 20,1 GiB (2,33 BPW).

La relevancia actual es doble: por un lado, demuestra que los modelos MoE hibridos con rutas SSM pueden cuantizarse agresivamente sin colapsar en bucles de repeticion si se respeta la estructura interna; por otro, abre el despliegue local de un modelo de razonamiento de clase 74B en hardware de 16-24 GB de VRAM mediante offload selectivo de expertos a CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 40 bloques Mamba-2 (SSM) + 40 bloques MoE + 8 bloques de atencion completa (88 capas) |
| Parametros totales | 74.042.720.768 |
| Parametros activos | ~9B por token |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0 (segun variante APEX-I) |
| Idiomas soportados | Ingles y multilingue (validacion de coherencia en ingles, polaco y chino) |
| Licencia | OpenMDW-1.1 (modelo base); la publicacion GGUF hereda la licencia del base |
| Formato de pesos | GGUF (llama.cpp) |

Variantes disponibles en la coleccion:

| Fichero | Tamano | BPW medio | Hardware objetivo |
|---|---|---|---|
| APEX-I-COMPACT | 32,9 GiB | 3,82 | 32 GB VRAM/RAM |
| APEX-I-MINI+ | 28,3 GiB | 3,29 | 32 GB RAM o 24 GB VRAM con offload |
| APEX-I-MINI-ISMA | 26,9 GiB | 3,15 | 24 GB VRAM con offload ligero |
| APEX-I-MINI | 25,6 GiB | 2,97 | 24 GB VRAM con offload ligero |
| APEX-I-NANO+ | 22,7 GiB | 2,64 | 24 GB VRAM completo |
| APEX-I-NANO | 20,1 GiB | 2,33 | 16 GB VRAM + offload a CPU |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida poco convencional: de sus 88 capas, 40 son bloques Mamba-2 (modelos de espacio de estados), 40 son bloques de mezcla de expertos y solo 8 son bloques de atencion completa. El componente MoE contiene 13.824 expertos enrutados con top-9 activos por token, mas un experto compartido por bloque. El vocabulario es de 131.072 tokens. Esta combinacion busca combinar la eficiencia de coste lineal de Mamba-2 en secuencias largas con la capacidad de recuperacion de la atencion completa en las capas donde mas importa, mientras la dispersion MoE mantiene bajo el coste de inferencia pese a los 74B totales.

Sobre el entrenamiento del modelo base no se dispone de informacion detallada en los materiales proporcionados: no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card si menciona un modo de razonamiento nativo (thinking mode) integrado en la plantilla de chat, lo que sugiere entrenamiento orientado a razonamiento, pero sin cifras verificables.

La innovacion tecnica destacable esta en el pipeline de cuantizacion APEX-I: cada tensor de baja precision se cuantiza contra una matriz de importancia calculada sobre un corpus de calibracion multidisciplinar propio; todas las variantes se generan directamente desde el master BF16 sin requantizaciones intermedias; los routers, escalas de normalizacion y maquinaria de estado de Mamba se mantienen en FP32; y los expertos enrutados reciben un gradiente de precision por bandas de capas (mas bits en los bloques MoE primero y ultimo, menos en los intermedios). La variante MINI-ISMA anade una busqueda de asignacion mixta tensor a tensor bajo un presupuesto exacto de tamano.

## Capacidades

- Generacion de texto conversacional con plantilla de chat embebida en los metadatos GGUF.
- Razonamiento multi-paso mediante modo thinking nativo.
- Procesamiento de contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues, con validacion de coherencia en ingles, polaco y chino.
- Eficiencia de inferencia gracias a la dispersion MoE: solo ~9B parametros activos por token.
- Despliegue compatible con llama.cpp y endpoints OpenAI-compatibles via `llama-server`.
- No se dispone de informacion sobre soporte de tool calling, function calling, vision o audio en los materiales proporcionados.

## Casos de uso

- Analisis de documentos extensos: la ventana de 262k tokens permite ingerir informes completos, expedientes o bases de codigo sin fragmentacion, y el coste de inferencia se mantiene contenido por los ~9B parametros activos.
- Razonamiento asistido en estaciones de trabajo de 24 GB: la variante NANO+ (22,7 GiB) cabe entera en una RTX 3090 o 4090, habilitando un modelo de clase 74B para tareas de analisis y sintesis en local sin dependencia de la nube.
- Procesamiento por lotes en servidores con CPU y RAM abundante: la variante NANO en modo CPU-only (`-ngl 0`) permite ejecutar el modelo en entornos sin GPU, util para pipelines nocturnos de clasificacion y resumen.
- Despliegue de API interna: `llama-server` expone un endpoint `/v1/chat/completions` compatible con OpenAI, lo que facilita integrar el modelo en aplicaciones existentes sin reescribir clientes.
- Investigacion sobre cuantizacion de MoE hibridos: la coleccion APEX-I sirve como referencia reproducible para estudiar el impacto de la asignacion de bits por rol de tensor en arquitecturas con rutas SSM y enrutamiento disperso.
- Traduccion y generacion multilingue: el soporte declarado de multiples idiomas y la validacion en polaco y chino lo hacen apto para tareas de traduccion y redaccion en entornos multilingues.
- Experimentacion con razonamiento en hardware de consumo: la variante MINI con offload de expertos a CPU permite probar el modo thinking en GPUs de 24 GB con contexto de 8k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta comprobaciones de coherencia con decodificacion greedy en ingles, polaco y chino (ausencia de bucles de repeticion), sin cifras de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas entre variantes.

## Requisitos de hardware

- VRAM estimada segun variante: COMPACT 32,9 GiB; MINI+ 28,3 GiB; MINI-ISMA 26,9 GiB; MINI 25,6 GiB; NANO+ 22,7 GiB; NANO 20,1 GiB.
- NANO+ cabe completamente en 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4 con margen limitado) dejando espacio para contexto.
- NANO esta pensado para 16 GB de VRAM con offload a RAM del sistema, o para equipos con 24 GB de RAM en modo CPU.
- MINI y MINI-ISMA requieren 24 GB de VRAM con offload ligero de expertos a CPU (flags `-cmoe` y `-ot`); MINI+ apunta a 32 GB de RAM o 24 GB de VRAM con offload de experto compartido y embeddings.
- GPU de datacenter recomendadas para las variantes mayores: A100 40/80 GB, H100, L40S; para COMPACT basta una GPU de 32 GB como la V100 32GB o A100 40GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), con soporte requerido de la arquitectura `nemotron_h_moe` en versiones recientes. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo indica que NANO es la variante mas rapida y COMPACT la de mayor fidelidad.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de la misma categoria, y no se dispone de datos de benchmarks que permitan establecer una comparativa rigurosa con alternativas de tamano o tarea similares.

## Limitaciones y advertencias

- La cuantizacion por debajo de 3 BPW puede degradar la calidad de forma notable; la propia model card advierte que las proyecciones up de los expertos del nucleo son el punto donde la cuantizacion sub-2-bit colapsa primero en bucles de repeticion.
- Las variantes NANO y NANO+ emplean IQ1_M e IQ2_XXS en varios tensores de expertos, lo que implica una perdida de fidelidad no cuantificada en los materiales disponibles.
- No hay datos publicados de benchmarks ni evaluaciones estandarizadas que permitan estimar la degradacion real frente al modelo BF16.
- El modelo base esta entrenado principalmente en ingles; el soporte multilingue se declara pero solo se valida cualitativamente en tres idiomas.
- Riesgo de alucinacion inherente a los modelos generativos de esta escala; no se documentan tasas de error ni evaluaciones de factualidad.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la publicacion GGUF hereda las condiciones del modelo base y el autor no anade terminos propios verificables en la informacion disponible.
- Requiere una version reciente de llama.cpp con soporte `nemotron_h_moe`; versiones antiguas no cargaran el modelo.
- El offload de expertos a CPU incrementa la latencia de forma significativa; los ejemplos de la model card usan contexto de 8k tokens, muy por debajo de la ventana nativa de 262k, lo que sugiere limitaciones practicas de memoria al escalar el contexto.
- La publicacion tiene 0 likes y 315 descargas en el momento de la consulta, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/White-Wolf13/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-APEX-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- llama.cpp: https://github.com/ggml-org/llama.cpp
