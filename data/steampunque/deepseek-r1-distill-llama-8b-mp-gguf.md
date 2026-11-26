# steampunque/DeepSeek-R1-Distill-Llama-8B-MP-GGUF

## Resumen

DeepSeek-R1-Distill-Llama-8B-MP-GGUF es una cuantizacion GGUF de precision mixta del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicada por el usuario steampunque. El modelo base es una destilacion de DeepSeek R1 sobre el preentrenamiento de Llama-3.1 8B, que anade entrenamiento por refuerzo y bloques de razonamiento (think blocks) al modelo original. Esta version concreta aplica una cuantizacion hibrida por capas denominada Q6_E_H, que combina niveles Q5_K y Q6_K segun la capa para reducir el tamano del fichero manteniendo una perplejidad practicamente identica a la de una cuantizacion Q6_K estandar.

El interes de esta publicacion es fundamentalmente practico: ofrece un fichero GGUF de aproximadamente 6.300 millones de parametros efectivos (frente a los 6.600 millones de un Q6_K convencional) con una perplejidad de 13,2 frente a 13,1 del Q6_K por defecto, lo que supone un ahorro de espacio de unos 300 MB con una degradacion marginal. Ademas, el autor documenta el uso de decodificacion especulativa con modelos pequenos (Qwen3 0.6B, Qwen 2.5 Coder 0.5B) para acelerar la generacion en una RTX 4070, alcanzando hasta 147 tokens por segundo en tareas de generacion de codigo.

Es relevante para desarrolladores que quieran desplegar un modelo de razonamiento de 8B en hardware de consumo mediante llama.cpp u Ollama, asi como para quienes necesiten procesar audio junto con texto usando el proyector multimodal Ultravox v0.5. El autor advierte, no obstante, que el modelo sigue siendo debil en razonamiento general y que no es fiable para generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1 8B con RL de DeepSeek R1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Q6_E_H (hibrida por capas: Q5_K y Q6_K, con embedding y output en Q6_K); proyector multimodal F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es una destilacion de DeepSeek R1 sobre Llama-3.1 8B, lo que implica que se parte de los pesos preentrenados de Llama-3.1 8B y se aplica entrenamiento por refuerzo para incorporar el comportamiento de razonamiento de DeepSeek R1, incluyendo la generacion de bloques de pensamiento (think blocks) antes de la respuesta final. El resultado es un modelo de 8.030 millones de parametros con arquitectura transformer decoder-only estandar, sin mecanismos MoE ni atencion lineal.

La contribucion tecnica de esta publicacion es la cuantizacion hibrida Q6_E_H, que asigna distintos niveles de cuantizacion a cada capa del modelo: las capas 0 y 31 usan Q6_K_866, las capas 1 a 3 usan Q6_K_666, las capas 4 a 14 usan Q5_K_665, las capas 15 a 23 alternan Q5_K_666 y Q6_K_666, y las capas 24 a 30 usan Q6_K_666 o Q6_K_668. Ademas, el embedding de tokens y el tensor de salida se fijan en Q6_K. Segun el autor, esta combinacion reduce el tamano a 6,3e9 bytes con una perplejidad de 13,2, frente a 6,6e9 bytes y 13,1 de un Q6_K estandar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento con bloques de pensamiento (think blocks) heredados de DeepSeek R1.
- Generacion de codigo, aunque el autor indica que el modelo no es fiable para esta tarea y no logra crear programas funcionales a partir de descripciones.
- Procesamiento de audio (.mp3 y .wav) junto con texto cuando se combina con el proyector multimodal Ultravox v0.5 para Llama-3.1 8B.
- Soporte de decodificacion especulativa con modelos pequenos (Qwen3 0.6B, Qwen 2.5 Coder 0.5B) para acelerar la inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, aunque el formato de bloques de pensamiento es compatible con flujos de razonamiento extendido.

## Casos de uso

- Razonamiento asistido en local: el modelo puede ejecutarse en una GPU de consumo como la RTX 4070 con contexto y pesos en VRAM, generando bloques de pensamiento antes de responder. Es adecuado para prototipos de razonamiento en entornos sin acceso a la nube.
- Procesamiento de audio y texto combinados: junto con el proyector multimodal Ultravox v0.5, el modelo puede transcribir o analizar ficheros .mp3 y .wav y generar respuestas textuales, util para asistentes de voz o analisis de reuniones.
- Aceleracion de inferencia con decodificacion especulativa: el autor documenta el uso de Qwen3 0.6B como modelo especulador, alcanzando 102 tokens por segundo en prompts no relacionados con codigo y hasta 147 tokens por segundo en tareas de codigo con el modo think desactivado.
- Despliegue en llama.cpp u Ollama: al ser un GGUF de 6,3 GB, puede cargarse en herramientas estandar de inferencia local, lo que facilita su integracion en aplicaciones de escritorio o servidores modestos.
- Experimentacion con cuantizacion hibrida: el fichero sirve como referencia para estudiar el impacto de la cuantizacion por capas en la perplejidad, comparando Q6_E_H frente a Q6_K estandar.
- Filtrado y clasificacion de texto con razonamiento ligero: para tareas donde el modelo base Llama-3.1 8B ya tiene cobertura suficiente, el bloque de razonamiento puede mejorar la precision en casos concretos, aunque el autor advierte que no es fiable de forma general.
- Investigacion sobre destilacion de modelos de razonamiento: util para analizar como se comporta un modelo de 8B destilado de DeepSeek R1 en tareas fuera de su espacio latente original.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica comparativa proporcionada es de perplejidad y tamano entre cuantizaciones:

| Cuantizacion | Tamano (bytes) | Perplejidad | Comentario |
|---|---|---|---|
| Q6_K | 6,6e9 | 13,1 | Q6_K con embedding y output por defecto |
| Q6_E_H | 6,3e9 | 13,2 | Hibrida con embedding y output en Q6_K |

El autor tambien documenta rendimiento de generacion en una RTX 4070 con decodificacion especulativa:

| Prompt | Longitud de bloque especulativo (ND) | Tokens por segundo | Comentario |
|---|---|---|---|
| goldcoin | 0 | 73 | Sin codigo |
| goldcoin | 3 | 102 | Sin codigo |
| humaneval | 0 | 71 | Codigo |
| humaneval | 4 | 120 | Codigo |
| humaneval | 4 | 140 | Especulacion con Qwen 2.5 Coder 0.5B, sin modo think |
| humaneval | 6 | 147 | Especulacion con Qwen 2.5 Coder 0.5B, sin modo think |
| humaneval | 8 | 146 | Especulacion con Qwen 2.5 Coder 0.5B, sin modo think |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa aproximadamente 6,3 GB, por lo que se necesitan al menos 7-8 GB de VRAM para cargar pesos y contexto en GPU.
- GPU recomendadas: el autor documenta pruebas en una RTX 4070. Por tamano, cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM, aunque con contexto limitado en las de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El autor menciona el uso de un especulador personalizado downstream con traduccion dinamica de vocabulario.
- Latencia y throughput: en una RTX 4070 con contexto y pesos en VRAM, entre 71 y 73 tokens por segundo sin especulacion, y entre 102 y 147 tokens por segundo con decodificacion especulativa segun el caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steampunque/DeepSeek-R1-Distill-Llama-8B-MP-GGUF | 8,03e9 | no disponible | GGUF Q6_E_H (6,3e9 B) | MIT | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8,03e9 | no disponible | safetensors (original) | MIT | Hugging Face |
| Llama-3.1 8B Instruct | 8,03e9 | no disponible | safetensors, GGUF | Llama 3.1 Community License | Hugging Face, Meta |

La comparativa se limita a estos tres modelos porque no se dispone de datos de benchmarks que permitan contrastar rendimiento con alternativas de la misma categoria. La diferencia principal frente al modelo original es el formato GGUF cuantizado y el menor tamano del fichero; frente a Llama-3.1 8B Instruct, la diferencia es la incorporacion de bloques de razonamiento mediante RL.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo sigue siendo debil en razonamiento general y que las mejoras de precision no son fiables.
- En generacion de codigo, el autor concluye que el modelo no es util: no logra crear programas funcionales a partir de descripciones, tanto con razonamiento activado como forzado a desactivarse.
- El bloque de razonamiento incrementa notablemente el numero de tokens generados en prompts de razonamiento, lo que puede aumentar la latencia y el coste en produccion.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni riesgos especificos de alucinacion mas alla de los inherentes al modelo base.
- La licencia MIT permite uso comercial, pero se heredan las condiciones del modelo base DeepSeek-R1-Distill-Llama-8B, que a su vez deriva de Llama-3.1 8B; conviene verificar las obligaciones de la licencia Llama 3.1 Community License en el modelo base.
- La cuantizacion Q6_E_H es una propuesta del autor sin validacion independiente; la perplejidad es ligeramente superior a la de Q6_K estandar (13,2 frente a 13,1).
- El uso de audio requiere un proyector multimodal separado (Ultravox v0.5) y no esta integrado en el fichero GGUF principal.
- No hay informacion sobre la longitud de contexto efectiva tras la cuantizacion ni sobre el comportamiento en contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/steampunque/DeepSeek-R1-Distill-Llama-8B-MP-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Proyector multimodal Ultravox v0.5: https://huggingface.co/steampunque/ultravox-v0_5-llama-3_1-8b-Hybrid-GGUF
- Fichero GGUF Q6_E_H: https://huggingface.co/steampunque/DeepSeek-R1-Distill-Llama-8B-Instruct-MP-GGUF/resolve/main/DeepSeek-R1-Distill-Llama-8B-Instruct.Q6_E_H.gguf
- Fichero mmproj Ultravox: https://huggingface.co/steampunque/ultravox-v0_5-llama-3_1-8b-MP-GGUF/resolve/main/ultravox-v0_5-llama-3_1-8b.mmproj.gguf
- Hilo de discusion sobre cuantizacion hibrida en llama.cpp: https://github.com/ggml-org/llama.cpp/discussions/13040
- Benchmarks del autor: https://huggingface.co/spaces/steampunque/benchlm
- Dataset goldcoin: https://huggingface.co/datasets/steampunque/benchlm/blob/main/goldcoin.txt
- Dataset humaneval: https://huggingface.co/datasets/steampunque/benchlm/blob/main/humaneval.txt
