# violetxi/qwen35-9b-equational-theory-sair-r3-mix3m

## Resumen

violetxi/qwen35-9b-equational-theory-sair-r3-mix3m es un ajuste fino completo (full fine-tune SFT) del modelo Qwen/Qwen3.5-9B, orientado a teoría ecuacional y a la resolución de problemas matemáticos con apoyo de notas y demostraciones en Lean. Lo publica el usuario violetxi (vinculado en los registros de entrenamiento al proyecto «Stanford Autonomous Agent» / SAIR) y se distribuye como checkpoint final de la época 2, en BF16 y safetensors fragmentados, con el layout nativo `Qwen3_5ForConditionalGeneration`. Al ser un modelo completo y no un adaptador LoRA, no requiere fusión de pesos ni descarga separada del modelo base.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original —los pesos de visión y de MTP (multi-token prediction) se heredan sin modificar— mientras que las 427 tensores del bloque de lenguaje, incluida la cabeza de salida, se reentrenaron y reubicaron en el layout nativo. El entrenamiento combina notas de teoría ecuacional y trayectorias condicionadas por notas, con unos 3 millones de tokens por época tras el enmascaramiento de la función de pérdida, en una proporción aproximada de 70 % notas y 30 % trayectorias.

Su relevancia es doble: por un lado, ejemplifica el patrón de especialización vertical sobre un modelo base abierto de ~9.650 millones de parámetros con licencia Apache 2.0; por otro, es un caso de uso de razonamiento matemático formal con entrada en Lean. Conviene señalar que la evaluación SAIR está anunciada pero aún sin resultados matemáticos finales publicados, y que el repositorio acumula 0 descargas y 0 «likes» en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de Qwen3.5 (bloques de atención completa, atención lineal y convolución, según las notas de entrenamiento); no se detalla la configuración de capas |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | No aplica: no se indica que el modelo sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos nativos en BF16 (safetensors); no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (se hereda el tokenizador del modelo base Qwen/Qwen3.5-9B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors fragmentados (sharded), BF16, layout `Qwen3_5ForConditionalGeneration` |
| Modelo base | Qwen/Qwen3.5-9B (revision fijada `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) |
| Tamano del repositorio | 19,3 GB |
| Libreria | transformers (verificado con Transformers 5.13.0) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y se reentrena por completo mediante SFT supervisado sobre las 427 tensores del bloque de lenguaje, que pasan de FP32 a BF16 y se reasignan al layout nativo. Los pesos de visión y de MTP se heredan intactos del checkpoint base, de modo que el modelo conserva la interfaz imagen-texto-a-texto del original (etiquetada como `image-text-to-text` en el repositorio) sin que se documente ningún ajuste específico sobre esas ramas. Las notas de entrenamiento mencionan el aislamiento de ejemplos en atención completa, atención lineal y convolución mediante empaquetado sin relleno (padding-free packing), lo que confirma una arquitectura híbrida con capas de atención lineal y convolución además de atención completa.

El conjunto de datos es una mezcla anidada nominal de 3 millones de tokens: 2.095.743 tokens de notas y 899.926 tokens de respuesta del asistente por época tras el enmascaramiento. La composición es de aproximadamente 70 % notas y 30 % trayectorias de un solo turno condicionadas por notas (R0–R3). Se entrenó durante dos épocas en ocho GPU GH200, con tasa de aprendizaje 5e-6, schedule coseno, warmup 0.03, pérdida de entropía cruzada media sobre todos los tokens supervisados y sin término KL. Los encabezados de prompt y de asistente están enmascarados; las notas son texto plano y el pensamiento generado se excluye del entrenamiento, por lo que la plantilla de trayectoria incorpora un envoltorio de razonamiento vacío. Se mantuvieron exclusiones por repetición y una validación congelada, pero no se aplicó filtro de corrección ni rechazo general de respuestas truncadas por longitud.

## Capacidades

- Generación de texto conversacional de un solo turno y multiturno, con plantilla de chat propia y `apply_chat_template`.
- Razonamiento matemático en el dominio de la teoría ecuacional, con entrada en Lean y salida en lenguaje natural de demostración o contraejemplo.
- Condicionamiento por notas: el modelo está entrenado para producir respuestas a partir de notas de teoría ecuacional proporcionadas en el contexto.
- Modo de pensamiento activable (`enable_thinking=True`) y parser de razonamiento `qwen3` en vLLM, aunque el pensamiento generado se excluyó del entrenamiento.
- Capacidades multimodales heredadas del modelo base (visión y MTP sin reentrenar); no verificadas en esta ficha.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en vLLM con `--dtype bfloat16`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia en demostración formal: dado un enunciado o un contexto en Lean sobre propiedades algebraicas (asociatividad, conmutatividad, distributividad), el modelo genera un borrador de demostración o un contraejemplo que después se valida manualmente o con un verificador Lean externo.
- Exploración de contraejemplos: ante una conjetura ecuacional, el modelo puede proponer estructuras candidatas que la refuten, lo que resulta útil como paso previo a la búsqueda automática de modelos finitos.
- Generación de notas de estudio: al estar entrenado sobre notas de teoría ecuacional, puede reformular definiciones y lemas en lenguaje natural para materiales docentes de álgebra universal.
- Preprocesamiento de pipelines de investigación matemática: integrado en un flujo que convierte enunciados informales a formato Lean y devuelve explicaciones en lenguaje natural para revisión humana.
- Prototipado de asistentes conversacionales especializados: con la plantilla de chat nativa y licencia Apache 2.0, sirve como base para desplegar un chatbot de dominio restringido vía vLLM sin coste de licencia.
- Evaluación comparativa de estrategias de ajuste: al ser un full fine-tune con hiperparámetros documentados (LR, warmup, composición del dataset), es un punto de referencia reproducible para estudiar el efecto del SFT sobre un modelo base de ~9,65 B.
- Investigación sobre olvido catastrófico: permite analizar cuánto del comportamiento general y multimodal del Qwen3.5-9B se preserva tras reentrenar exclusivamente los tensores de lenguaje.
- Generación de conjuntos de datos sintéticos anotados: el modelo puede producir pares nota–respuesta que, tras filtrado humano, alimenten otros entrenamientos, siempre que se asuma el riesgo de respuestas no verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que la evaluación SAIR está en lanzamiento —800 preguntas de fase 1 y 300 de fase 2, con cuatro respuestas independientes por pregunta y corrección mediante GPT-5.6-sol en modo `high`— y que todavía no existe un resultado de rendimiento matemático final. También advierte de que la entropía cruzada de entrenamiento y validación no equivale a una puntuación de precisión en demostraciones, y que los juicios de GPT no constituyen certificación en Lean.

## Requisitos de hardware

- VRAM estimada en BF16: alrededor de 19,3 GB solo para los pesos (coincide con el tamaño del repositorio), más espacio para caché KV y activaciones; en la práctica se recomienda un mínimo de 24 GB y, para contextos largos o lotes grandes, 40-80 GB.
- VRAM estimada con cuantización de 8 bits: aproximadamente 10-11 GB (no se publican pesos cuantizados oficiales; requeriría cuantización por parte del usuario con bitsandbytes).
- VRAM estimada con cuantización de 4 bits: aproximadamente 5,5-7 GB (igual advertencia: no hay pesos pre-cuantizados en el repositorio).
- GPU recomendadas para BF16: NVIDIA A100 (40 GB o 80 GB), H100, L40S (48 GB) y, con margen muy ajustado, RTX 4090 o RTX 3090 de 24 GB.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 en BF16 de forma justa; en tarjetas de 16 GB (RTX 4080, 5080) solo es viable con cuantización de 8 o 4 bits.
- Entrenamiento: el run documentado utilizó ocho GPU GH200.
- Opciones de despliegue: Transformers (verificado con 5.13.0) y vLLM 0.19.1 o superior, con el comando `vllm serve violetxi/qwen35-9b-equational-theory-sair-r3-mix3m --dtype bfloat16 --reasoning-parser qwen3`. Para llama.cpp, Ollama o TGI sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-equational-theory-sair-r3-mix3m | 9,65 B | no disponible | apache-2.0 | HuggingFace, 0 descargas | Sin benchmarks publicados |
| Qwen/Qwen3.5-9B (modelo base) | ~9 B (no confirmado en la información) | no disponible | no disponible | HuggingFace | No disponible |
| Otros fine-tunes de demostración automática sobre modelos abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros fine-tunes comparables en la información proporcionada, por lo que la única comparación fiable es contra el propio modelo base, del que este checkpoint hereda tokenizador, plantilla de chat, procesador, ramas de visión y MTP. La diferencia principal es que el modelo base no está especializado en teoría ecuacional y que este checkpoint solo ha reentrenado los tensores de lenguaje.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni de precisión en demostraciones publicados: la utilidad matemática del modelo no está demostrada empíricamente.
- Entrenamiento exclusivamente por SFT, sin RLHF, DPO ni término KL: no hay optimización explícita de preferencias ni de corrección formal.
- Conjunto de datos pequeño para un full fine-tune (unos 3 millones de tokens por época repartidos en 2.095.743 tokens de notas y 899.926 de respuesta), lo que aumenta el riesgo de sobreajuste al formato nota–trayectoria.
- No se aplicó filtro de corrección ni rechazo general de respuestas truncadas por longitud: el corpus puede contener salidas incorrectas o incompletas que el modelo reproduzca.
- El pensamiento generado se excluyó del entrenamiento y la plantilla usa un envoltorio de razonamiento vacío, por lo que el modo `thinking` puede degradarse respecto al modelo base.
- Riesgo de alucinación en lenguaje natural: la evaluación con GPT-5.6-sol como juez no equivale a certificación en Lean, y el propio autor lo advierte.
- Idiomas soportados no especificados: se desconoce el comportamiento fuera de los idiomas cubiertos por el tokenizador del modelo base.
- Las capacidades de visión y MTP se heredan sin ajuste y no están validadas para el dominio; el repositorio está etiquetado como `image-text-to-text` pero el pipeline declarado es `text-generation`.
- Licencia Apache 2.0, que en principio permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B, del que depende la cadena de licencias.
- Poca validación comunitaria: 0 descargas y 0 «likes», sin issues ni informes de terceros en el momento de redactar esta ficha.
- El repositorio ocupa 19,3 GB, por lo que la descarga y el almacenamiento deben planificarse.
- Requiere versiones recientes de las herramientas (Transformers 5.13.0, vLLM 0.19.1); entornos antiguos pueden no reconocer la arquitectura `qwen3_5`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-r3-mix3m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/stanford_autonomous_agent/equational-theory-curated-r3-20260923/runs/eqr33m20260923
- Paper, blog o repositorio adicional del autor: no disponible en la información proporcionada
