# ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-sq-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-sftlen-sq-l5` es un adaptador LoRA publicado por ssurface que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think` para operar en el nivel de compresion L5 de la familia "Chain-of-Thought Compression Dialects". En este nivel, la cadena de pensamiento se colapsa a una unica expresion extremadamente breve (mediana de 16 caracteres dentro de ` thinking`), frente a los 532 caracteres del nivel L1, lo que supone un rango de compresion de 33x.

Se trata de una ablacion explicita, no de uno de los modelos principales de la familia: fue entrenada bajo una funcion de recompensa alternativa (`sft_length_sq`) para permitir reproducir la comparativa de diseno de recompensas descrita en el paper asociado. El adaptador se entrena con GRPO sobre el modelo SFT fusionado del nivel L5, no sobre el modelo base directamente, y se publica con licencia Apache 2.0. Su tamano de repositorio es de 0.2 GB, coherente con un adaptador LoRA de rango 16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base `allenai/Olmo-3-7B-Think`) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | Modelo base: 7B; adaptador LoRA: ~0.2 GB (no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apila sobre `allenai/Olmo-3-7B-Think`, un modelo Transformer causal de 7B parametros entrenado sobre el dataset Dolma 3 y post-entrenado para razonamiento con cadenas de pensamiento largas y visibles. La capa de adaptacion se entrena con GRPO (`trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`) sobre el modelo SFT fusionado del nivel L5, que a su vez fue entrenado sobre 6993 ejemplos de GSM8K train re-expresados por un modelo profesor a nivel de compresion L5.

La funcion de recompensa combina tres componentes: `correctness` (ponderado por el numero de pasos de la solucion dorada, de modo que los problemas mas dificiles valen mas), `format` (la respuesta debe ser un unico bloque ` thinking... response` seguido de `#### <answer>`) y `sft_length_sq` (penalizacion cuadratica de la longitud, que castiga con mas dureza los excesos). El entrenamiento uso 8 generaciones por prompt, batch 64x1, max completion de 256 tokens, learning rate 1e-05, coeficiente KL 0.01 y una unica NVIDIA A100 80GB.

Un detalle tecnico relevante: el autor verifico que la ruta de kernels fusionados producia adaptadores con matrices `lora_B` todas a cero, matematicamente inertes aunque cargaran sin error. Todos los adaptadores publicados en esta coleccion fueron verificados con `lora_B != 0`; 13 que fallaron esa comprobacion fueron retenidos.

## Capacidades

- Razonamiento matematico: resuelve problemas de aritmetica y algebra elemental del dataset GSM8K con cadenas de pensamiento extremadamente comprimidas.
- Generacion de texto con formato estructurado: produce respuestas en un unico bloque ` thinking... response` seguido de `#### <respuesta>`.
- Compresion de cadena de pensamiento: opera en el nivel L5, donde la cadena mediana tiene 16 caracteres (ejemplo real: `18/3*2=12`).
- Razonamiento de un solo turno: evaluado con greedy decoding, sin ejemplos ni self-consistency.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues.

## Casos de uso

- Investigacion sobre diseno de recompensas en RL: este adaptador es una ablacion disenada especificamente para reproducir la comparativa entre `sft_length` y `sft_length_sq` descrita en el paper; su uso principal es verificar experimentalmente el efecto de la penalizacion cuadratica de longitud.
- Estudio de la compresion de cadenas de pensamiento: permite analizar como degrada la precision cuando la cadena de razonamiento se colapsa a una expresion minima, y comparar ese efecto entre niveles L1 a L5.
- Evaluacion de robustez de GRPO: al ser un adaptador entrenado con una recompensa alternativa, sirve para medir la sensibilidad del pipeline de entrenamiento a cambios en la funcion de recompensa.
- Reproducibilidad de resultados de RL: el autor publica la configuracion completa (prompt set, batch, learning rate, KL) para que terceros puedan re-ejecutar el entrenamiento y verificar los resultados.
- Analisis de artefactos de entrenamiento: permite estudiar si los adaptadores entrenados con kernels fusionados presentan matrices `lora_B` nulas, un problema documentado por el autor que afecta a la validez de modelos publicados por otros.
- Educacion e investigacion en PEFT: como ejemplo de apilamiento de adaptadores LoRA (SFT primero, GRPO despues) sobre un modelo base, con instrucciones de carga explicitas en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (GSM8K test, n=1317, greedy decoding, un solo turno, sin ejemplos ni self-consistency):

| Modelo | Accuracy (exact match) |
|---|---:|
| `cot-dialect-olmo3-7b-think-grpo-sftlen-sq-l5` (este adaptador) | 58.6% |

No se han publicado resultados comparativos con el modelo base `allenai/Olmo-3-7B-Think` ni con el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`) en la informacion disponible. El autor advierte que el margen de error al 95% es de aproximadamente 2.7 puntos porcentuales para n=1317, por lo que diferencias de un par de puntos entre modelos de la familia pueden estar dentro del ruido estadistico.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (configuracion documentada por el autor).
- Inferencia: al tratarse de un adaptador LoRA sobre un modelo base de 7B, el requisito de VRAM dominante es el del modelo base. Con cuantizacion de 4 bits, un modelo de 7B cabe en GPUs consumer de 8-12 GB (RTX 3060/4070/4080); en bf16 completo requiere aproximadamente 14-16 GB.
- Despliegue: el adaptador se carga con `transformers` + `peft` (ejemplo de codigo en la model card). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Nota: el adaptador debe cargarse sobre el modelo SFT fusionado del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre `allenai/Olmo-3-7B-Think`, o los resultados no se reproduciran.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-sftlen-sq-l5` (este) | LoRA + GRPO (ablacion) | 7B base + LoRA | 58.6% | Apache 2.0 | HuggingFace |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` | LoRA + GRPO (modelo principal del nivel L5) | 7B base + LoRA | No disponible | Apache 2.0 (presumible) | HuggingFace |
| `allenai/Olmo-3-7B-Think` | Modelo base de razonamiento | 7B | No disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento del modelo principal del mismo nivel ni del modelo base en la informacion proporcionada, por lo que no es posible cuantificar la diferencia de precision entre la ablacion y sus alternativas.

## Limitaciones y advertencias

- Es una ablacion, no un modelo de produccion: fue entrenado para responder a una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Solo entrenado y evaluado en problemas matematicos de una sola frase (GSM8K); no hay evidencia de generalizacion a otras tareas o dominios.
- La precision cae con la dificultad del problema, y la caida es mas pronunciada en los niveles comprimidos como L5.
- Entrenado con una unica semilla; diferencias de un par de puntos porcentuales pueden estar dentro del ruido estadistico (intervalo de confianza del 95% de ~2.7 pp en n=1317).
- El adaptador debe apilarse sobre el modelo SFT fusionado del nivel L5; cargarlo directamente sobre el modelo base no reproduce el resultado publicado.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion: no evaluado; al operar con cadenas de pensamiento extremadamente cortas, la trazabilidad del razonamiento es minima.
- No se documenta compatibilidad con frameworks de inferencia optimizada (vLLM, TGI, llama.cpp), lo que limita su uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `Olmo-3-7B-Think` y los datasets asociados deben verificarse por separado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-sq-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT del nivel L5 (requerido para cargar el adaptador): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal del mismo nivel (referencia de la ablacion): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Modelo SFT del base: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Ficha del modelo base en ThinkLLM: https://thinkllm.dev/models/olmo-3-7b-think
- Citation del paper (en la model card): Frolov, Anatolii, "Chain-of-Thought Compression Dialects", 2026
