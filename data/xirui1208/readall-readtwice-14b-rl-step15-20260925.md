# Xirui1208/readall-readtwice-14b-rl-step15-20260925

## Resumen

ReadAll / ReadTwice 14B RL step15 es un ajuste fino de 14.770.033.664 parametros publicado por el usuario Xirui1208 en Hugging Face. Parte del checkpoint SFT Xirui1208/readall-readtwice-14b-stage-a-step230-20260923 y, en ultima instancia, de Qwen2.5-14B-Instruct. Se distribuye como pesos BF16 completos exportados tras el paso exterior 15 de un proceso de aprendizaje por refuerzo, con 59 actualizaciones de optimizador acumuladas en la linea de entrenamiento guardada.

Su proposito es el razonamiento sobre documentos muy largos mediante el paradigma ReadTwice. En lugar de ampliar la ventana de atencion nativa, que se mantiene en 32.768 tokens, el modelo se ejecuta dentro de un bucle de inferencia recurrente y paginado: primero hace un barrido (SKIM) de todos los fragmentos de una pagina para construir un esquema local, despues relee cada fragmento original actualizando una memoria, y finalmente responde a partir de la memoria final. Esa memoria se conserva entre paginas, lo que permite responder preguntas tipo HotpotQA sobre contextos de hasta 224.000 tokens.

El checkpoint es relevante porque publica la evaluacion de HotpotQA a 56K, 112K y 224K tokens junto con los hashes de los ficheros, y porque demuestra que un modelo denso de 14B con contexto nativo de 32K puede alcanzar precision util en documentos de cientos de miles de tokens sin reentrenar la atencion. La licencia Apache 2.0 y su base Qwen2.5 facilitan la evaluacion por parte de desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen2 (base Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (aproximadamente 14,77 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens nativos; los documentos mas largos requieren el bucle recurrente paginado de evaluacion |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos BF16 completos |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), seis shards, con tokenizer y checkpoint_manifest.json |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso estandar de la familia Qwen2, heredado de Qwen2.5-14B-Instruct, con 14,77 mil millones de parametros y una ventana de atencion nativa de 32.768 tokens. No introduce cambios arquitectonicos en la atencion ni modulos MoE: la innovacion es de procedimiento, no de pesos. La capacidad de contexto largo proviene de un bucle externo recurrente y paginado (ReadTwice) que realiza un SKIM de todos los fragmentos de una pagina para generar un esquema local, relee cada fragmento mientras actualiza una memoria y responde desde la memoria final. La memoria se propaga entre paginas y la etiqueta `<KEEP_MEMORY>` permite conservar la memoria existente. Las actualizaciones de memoria son compatibles con MemAgent y sin proteccion adicional (unguarded).

El entrenamiento consta de dos fases documentadas: un ajuste supervisado (SFT) que da lugar al checkpoint base stage A step 230, y una fase posterior de aprendizaje por refuerzo (RL) de la que este repositorio es la exportacion del paso exterior 15, con 59 actualizaciones de optimizador acumuladas. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de RLHF/DPO mas alla de la mencion generica a RL. La evaluacion registrada emplea fragmentos sin perdida de como maximo 5.000 tokens, hasta 24 secciones por pagina, limites SKIM/UPDATE/FINAL de 512/1024/1024, temperatura 0, top_p 1 y semilla 801, y se ejecuto con DP4 x TP2 sobre ocho GPU. Los estados del optimizador y del scheduler no se publican.

## Capacidades

- Generacion de texto y conversacion (pipeline_tag: conversational, text-generation).
- Razonamiento sobre documentos muy largos mediante el bucle ReadTwice, con contexto efectivo registrado de hasta 224.000 tokens.
- Memoria persistente entre paginas, con retencion explicita mediante `<KEEP_MEMORY>`.
- Pregunta-respuesta multi-hop sobre documentos extensos, evaluada en HotpotQA.
- Capacidad multilingue limitada a ingles (en) y chino (zh).
- Integracion con `transformers`, `text-generation-inference` y `endpoints_compatible`.
- Soporte de tool calling / function calling: no documentado.
- Modo de razonamiento explicito (thinking mode), vision o audio: no documentados.

## Casos de uso

- Pregunta-respuesta sobre corpus documentales extensos: informes anuales, expedientes o manuales que superan la ventana nativa de 32K se procesan pagina a pagina con el bucle ReadTwice, manteniendo la memoria entre paginas para responder al final.
- Analisis de documentacion legal y contractual: contratos de cientos de paginas se dividen en fragmentos sin perdida y el modelo responde sobre clausulas concretas apoyandose en la memoria acumulada.
- Revision de literatura academica: el modelo puede recorrer conjuntos de articulos, construir un esquema por pagina y responder preguntas de sintesis multi-hop entre documentos.
- Asistentes de atencion al cliente con base de conocimiento amplia: integrable en un pipeline de recuperacion donde el contexto recuperado sea muy largo, usando la memoria recurrente para no truncar informacion.
- Auditoria de registros y logs: lectura secuencial de trazas extensas con deteccion de eventos correlacionados a lo largo de la memoria.
- Sistemas de pregunta-respuesta multi-hop sobre bases internas: util cuando la respuesta requiere combinar evidencias de varias secciones de un mismo documento largo.
- Investigacion sobre memoria recurrente y agentes: sirve como punto de partida para estudiar actualizaciones de memoria compatibles con MemAgent y el efecto del RL sobre el razonamiento de largo alcance.

## Benchmarks y rendimiento

Evaluacion de HotpotQA (HQA) registrada en la model card. Se reutilizan los mismos 128 IDs de pregunta en cada longitud y se aplica la normalizacion historica de MemAgent y la regla SubEM de subcadena bidireccional, sin correcciones manuales.

| Longitud | Preguntas | Aciertos SubEM | SubEM | Aciertos EM | EM |
|---|---:|---:|---:|---:|---:|
| 56K | 128 | 100 | 78,125 % | 80 | 62,500 % |
| 112K | 128 | 101 | 78,90625 % | 78 | 60,9375 % |
| 224K | 128 | 92 | 71,875 % | 71 | 55,46875 % |

Todas las muestras se completaron correctamente. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 ocupan aproximadamente 29,6 GB (tamano del repositorio). Hay que sumar la cache KV y las activaciones, por lo que en BF16 se recomienda un unico acelerador de 80 GB (A100/H100) para trabajar con comodidad, o 40 GB (A100 40GB) con lotes muy pequenos.
- GPU recomendadas: A100 80GB, H100 80GB. La evaluacion registrada se ejecuto con DP4 x TP2 sobre ocho GPU, aunque no se especifica el modelo exacto de GPU usado.
- Consumer GPU: en BF16 no cabe en una GPU de consumo de 24 GB (RTX 4090, RTX 3090). Seria necesario repartir entre varias tarjetas o recurrir a offload a CPU. No se publican pesos cuantizados que permitan una unica GPU de consumo.
- Opciones de despliegue: `transformers` (carga directa en BF16) y `text-generation-inference`, dado que el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`. vLLM, llama.cpp y Ollama no estan documentados, y al no haber GGUF no hay soporte directo en llama.cpp/Ollama.
- Latencia y throughput: no disponibles. Conviene tener en cuenta que el bucle recurrente ReadTwice implica multiples pasadas (SKIM y relectura) sobre cada pagina, por lo que el coste de inferencia es varias veces superior al de una generacion simple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HQA 56K (EM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadTwice 14B RL step15 (este) | 14,77 B | 32.768 nativo; 224K via bucle recurrente | 62,500 % | Apache 2.0 | Pesos BF16 en Hugging Face |
| Xirui1208/readall-readtwice-14b-stage-a-step230-20260923 | 14,77 B | 32.768 nativo; depende del bucle recurrente | No disponible | Apache 2.0 | Checkpoint SFT base en Hugging Face |
| Qwen2.5-14B-Instruct | 14,7 B | 32.768 nativo | No disponible | Apache 2.0 | Modelo publico de Qwen |

No se dispone de resultados comparables de otros modelos de memoria recurrente en la informacion proporcionada.

## Limitaciones y advertencias

- La ventana nativa es de 32.768 tokens. Las puntuaciones de 56K, 112K y 224K solo se obtienen con el bucle recurrente paginado externo; el modelo no es un sustituto directo de un modelo de contexto largo nativo.
- Las actualizaciones de memoria son "unguarded" (compatibles con MemAgent, sin proteccion adicional), lo que puede propagar errores acumulados entre paginas.
- No hay benchmarks publicados mas alla de HotpotQA: no se conocen resultados en matematicas, codigo, MMLU u otras tareas.
- Idiomas limitados a ingles y chino; no se garantiza un rendimiento correcto en castellano.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explicito.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida; conviene tratarlo como un checkpoint de investigacion.
- La configuracion de generacion guardada procede de la exportacion SFT; hay que fijar explicitamente los parametros de muestreo en evaluacion.
- Riesgo de alucinacion inherente a los modelos generativos, agravado cuando la respuesta depende de la fidelidad de la memoria recurrente.
- Licencia Apache 2.0, que permite uso comercial; aun asi, el modelo base Qwen2.5 y los datos de entrenamiento del autor conviene verificarlos antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xirui1208/readall-readtwice-14b-rl-step15-20260925
- Checkpoint SFT base: https://huggingface.co/Xirui1208/readall-readtwice-14b-stage-a-step230-20260923
- Modelo base original de Qwen (referenciado en la model card): https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
