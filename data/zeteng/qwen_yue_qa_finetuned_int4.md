# Zeteng/qwen_yue_qa_finetuned_int4

## Resumen

`Zeteng/qwen_yue_qa_finetuned_int4` es un ajuste fino mediante LoRA del modelo denso `Qwen/Qwen3-0.6B`, orientado a respuesta de preguntas y chat en cantonés (yue) y chino escrito. Lo publica el usuario Zeteng bajo licencia Apache-2.0 y el repositorio contiene los pesos fusionados (merged) en fp32, con 596.049.920 parámetros y un tamano de repositorio de 2,4 GB. La longitud de contexto heredada del modelo base es de 40.960 tokens.

La característica mas relevante de esta ficha es que el checkpoint está documentado por su propio autor como un fallo, no como un modelo utilizable. Una evaluacion de septiembre de 2026 encontro que el 93,3 % de las respuestas con decodificacion greedy colapsan en repeticiones degeneradas (por ejemplo `香港有咢好玩嘅地方，如咢咢咢咢咢…` o `说明说明说明说明…`), mientras que el modelo base sin ajustar degenera en el 0 % de los mismos prompts. La causa raiz identificada es una divergencia durante el entrenamiento LoRA: la comparacion de pesos por modulo muestra que las capas `q_proj` de las cinco ultimas capas alcanzan una norma relativa ‖ΔW‖/‖W‖ de 0,50 a 1,06, cuando un LoRA con r=8 y alpha=16 deberia situarse en 0,01-0,05.

El interes de este repositorio es, por tanto, metodologico: se mantiene publico como caso de fallo documentado, con post-mortem y utilidades reutilizables en el repositorio `Lam810/cantonese-llm-lab`. El autor indica que una version v2 corregida (base Qwen3-8B, conjunto de desarrollo reservado, early stopping y sin cuantizacion) estaba en entrenamiento en el momento de la ultima actualizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (`Qwen3ForCausalLM`) |
| Parametros totales | 596.049.920 (596 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio: los pesos publicados son fp32 (310 tensores, todos F32). El autor sugiere cuantizar por cuenta propia con GPTQ, AWQ o GGUF |
| Idiomas soportados | yue (cantonés), zh (chino escrito) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32); el repositorio incluye tambien `checkpoint-*/adapter_config.json` de los adaptadores LoRA |

Detalles de configuracion del modelo base: `hidden_size` 1024, 28 capas, 16 cabezas de atencion y 8 de clave/valor, `intermediate_size` 3072 y embeddings atados (tied embeddings).

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B sin modificaciones estructurales: un transformer decoder-only causal con atencion agrupada por consultas (16 cabezas Q frente a 8 KV) y embeddings atados. El ajuste se realizo con LoRA de PEFT y se fusiono (merged) dentro de los pesos base antes de publicarse. La configuracion del adaptador es r=8, alpha=16 y dropout 0,05, aplicado unicamente a los modulos `q_proj` y `v_proj`, lo que da un adaptador de 4,6 MB. El entrenamiento duro 3 epocas con un lote efectivo de 16 (4 por dispositivo x 4 de acumulacion de gradientes), 6.642 pasos de optimizador (2.214 por epoca), learning rate 2e-4 con decaimiento lineal y sin warmup, weight decay 0,001, optimizador `adamw_torch`, precision fp32 y semilla 42.

El conjunto de entrenamiento no se publica en este repositorio, pero la cuenta de pasos permite inferir unas 35.400 parejas de instruccion/respuesta en cantonés; el autor mantiene un conjunto SFT publico relacionado, `Zeteng/cantonese-llm-data`, con 17.757 filas en formato alpaca y chat. La curva de perdida pasa de 1,5907 en el paso 100 a 0,2516 en el paso 200, y a partir de ahi permanece practicamente plana hasta 0,2270 (paso 6.400) y 0,2149 (paso 6.600). Esa forma es precisamente la senal que el post-mortem senala como problema: con `eval_strategy="no"` y sin conjunto de validacion, "convergencia" y "colapso hacia una solucion degenerada" producen curvas de perdida indistinguibles. Cargar el adaptador sin fusionar sobre un base nuevo reproduce tambien la degeneracion, lo que descarta que el fallo sea un artefacto de la fusion de pesos.

## Capacidades

- No se debe asumir ninguna capacidad fiable: el autor marca explicitamente el checkpoint como "no usar". El 93,3 % de las respuestas greedy degeneran en repeticion de basura.
- Su uso previsto declarado era la respuesta de preguntas de formato corto y el chat en cantonés (yue) y chino escrito.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a yue y zh; no se declara ningun otro idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponible. El modelo base Qwen3-0.6B dispone de modo de razonamiento, pero no hay evidencia de que el ajuste lo preserve, y el artefacto publico no funciona.

## Casos de uso

- Estudio de casos de fallo en ajuste fino: el repositorio sirve como ejemplo reproducible de divergencia de LoRA sin validacion, util para disenar protocolos de evaluacion que detecten colapsos degenerados antes de publicar un checkpoint.
- Auditoria de pesos fusionados: la comparacion por modulo de ‖ΔW‖/‖W‖ frente al modelo base es un procedimiento reutilizable para verificar que una fusion de adaptadores no ha alterado capas de forma anomala.
- Referencia metodologica para ajuste en idiomas de bajos recursos: el post-mortem documenta como la perdida de entrenamiento puede colapsar en las primeras 200 iteraciones y enmascarar un fallo posterior.
- Pruebas de deteccion de degeneracion en pipelines de generacion: los prompts y las salidas degeneradas documentadas pueden usarse como conjunto de regresion para validar filtros anti-repeticion.
- Formacion de equipos de evaluacion: el caso ilustra la necesidad de separar un conjunto de desarrollo antes de lanzar un run de QLoRA de 3 epocas.
- No se recomienda ningun caso de uso en produccion, atencion al cliente, codigo, analisis de documentos ni generacion de contenido, dado que el artefacto esta roto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion disponible es el diagnostico de degeneracion de 2026-09:

| Medicion | Este checkpoint | Modelo base Qwen3-0.6B |
|---|---|---|
| Respuestas greedy que degeneran en repeticion de basura | 93,3 % | 0 % |
| Norma relativa ‖ΔW‖/‖W‖ en `q_proj` de las 5 ultimas capas | 0,50 - 1,06 | no aplica (referencia) |
| Perdida de entrenamiento final | 0,2149 (paso 6.600) | no aplica |

## Requisitos de hardware

- VRAM estimada en el formato publicado (fp32): aproximadamente 2,4 GB para los pesos mas el coste de activaciones y cache KV; el tamano de repositorio es de 2,4 GB.
- VRAM estimada si se recarga en bf16: aproximadamente la mitad, en torno a 1,2 GB, sin perdida practica de calidad segun el autor, ya que los pesos provienen de una fusion sobre una ejecucion LoRA en fp32.
- Opciones adicionales: una cuantizacion GGUF de 4 bits situaria los pesos en el orden de 350-400 MB, aunque el repositorio no incluye ninguna.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4060) es suficiente para los pesos en bf16 o cuantizados; tambien funciona en CPU x86 moderna.
- Despliegue: `transformers` (formato publicado), `llama.cpp` u Ollama tras convertir a GGUF, y vLLM o TGI para servir en GPU. El repositorio esta marcado como compatible con text-generation-inference y endpoints.
- Latencia y throughput estimados: no disponible. Con 596 M de parametros y contexto de 40.960 tokens, un contexto lleno dominaria el coste de atencion, pero no hay mediciones publicadas.
- Advertencia: el modelo esta roto, por lo que cualquier despliegue con estos pesos producira salidas degeneradas en la mayoria de los prompts.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|
| Zeteng/qwen_yue_qa_finetuned_int4 | 596 M | 40.960 | 93,3 % de respuestas greedy degeneradas | Apache-2.0 | Roto, documentado como fallo |
| Qwen/Qwen3-0.6B (base) | 596 M | 40.960 | 0 % de degeneracion en los mismos prompts; sin ajuste en cantonés | Apache-2.0 | Operativo |
| hon9kon9ize/CantoneseLLMChat-v1.0-7B | 7 B | no disponible | no disponible | no disponible | Operativo, recomendado por el autor para trabajo sensible a calidad |
| hon9kon9ize/CantoneseLLM-v2.0-8B-Thinking-Chat-Vector-Merged | 8 B | no disponible | no disponible | no disponible | Operativo, recomendado por el autor para trabajo sensible a calidad |

## Limitaciones y advertencias

- El modelo no funciona: el 93,3 % de las respuestas con decodificacion greedy colapsan en repeticiones degeneradas. El fallo esta medido y documentado por el propio autor en septiembre de 2026.
- La causa es una divergencia del entrenamiento LoRA, no un problema de fusion: cargar el adaptador sin fusionar sobre un base limpio tambien degenera.
- El run se ejecuto con `eval_strategy="no"`, sin conjunto de validacion ni early stopping, por lo que no habia ninguna senal de parada ante el colapso.
- El nombre del repositorio es enganoso: `int4` no describe el artefacto publicado, que esta en fp32. Los 310 tensores de `model.safetensors` son F32 y suman 2,22 GiB. `int4` se refiere al cargado del base en 4 bits durante el QLoRA.
- La model card original llego a mencionar una base Qwen3-4B-Instruct-2507 que no corresponde al artefacto real; el `config.json` coincide campo por campo con Qwen3-0.6B y los `adapter_config.json` registran `base_model_name_or_path: Qwen/Qwen3-0.6B`.
- Sin evaluacion de sesgos: no se ha publicado ningun analisis de sesgos para este checkpoint.
- Riesgo de alucinacion: alto, agravado por degeneracion, en un modelo de 0,6 B sin verificacion factual. El conocimiento factual sobre Hong Kong queda explicitamente fuera de alcance sin verificacion.
- Fuera de alcance declarado: cualquier uso critico para la seguridad (medico, legal, financiero) y la generacion de texto largo.
- Limitaciones de idioma: solo yue y zh; no hay soporte declarado de castellano ni de otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el fallo funcional hace inviable cualquier uso en produccion independientemente de la licencia.
- El conjunto de datos de entrenamiento no se publica con el repositorio, lo que impide reproducir exactamente las condiciones del fallo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zeteng/qwen_yue_qa_finetuned_int4
- Post-mortem, numeros de evaluacion y utilidades reutilizables: https://github.com/Lam810/cantonese-llm-lab
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Conjunto de datos SFT relacionado del mismo autor: https://huggingface.co/datasets/Zeteng/cantonese-llm-data
- Alternativa recomendada para calidad en cantonés (7B): https://huggingface.co/hon9kon9ize/CantoneseLLMChat-v1.0-7B
- Alternativa recomendada para calidad en cantonés (8B, thinking): https://huggingface.co/hon9kon9ize/CantoneseLLM-v2.0-8B-Thinking-Chat-Vector-Merged
