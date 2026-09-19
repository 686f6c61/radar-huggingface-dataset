# zbeeb/Qwen2.5-3B-GRPO-Staleness-8

## Resumen

Qwen2.5-3B-GRPO-Staleness-8 es un ajuste fino de parametros completos sobre Qwen/Qwen2.5-3B (revision fijada 3aab1f1954e9cc14eb9509a215f9e5ca08227a9b) mediante GRPO (Group Relative Policy Optimization) orientado a razonamiento matematico. Lo publica el usuario zbeeb y su interes no esta tanto en el rendimiento absoluto como en el diseno experimental: el entrenamiento aplica un limite de staleness (desactualizacion de la politica de rollout) de 8 pasos (`max_off_policy_steps`), lo que lo convierte en un punto de referencia para estudiar el efecto de la staleness en RL con recompensa verificable.

El modelo tiene 3.085.938.688 parametros (3,09 B), es denso y hereda la arquitectura Qwen2 del modelo base, con embeddings atados. El entrenamiento se hizo sobre el dataset DAPO Math de 17.005 filas compartido por el autor (zbeeb/Staleness-GRPO-DAPO-Math-17k), durante 1.000 actualizaciones, con contexto total de 4.096 tokens y hasta 3.072 tokens de completion. Es, por tanto, un checkpoint de investigacion: no hay publicadas cuantizaciones, no se ha validado la extension de contexto a 8K y las evaluaciones que acompanan a la model card son las de la propia ejecucion de entrenamiento, no un benchmark independiente del artefacto exportado.

Su relevancia actual es doble. Por un lado, sirve como material reutilizable para quien investigue RL sobre modelos pequenos con recompensas deterministas de equivalencia matematica. Por otro, documenta con un nivel de detalle poco habitual el proceso de exportacion (verificacion de procedencia del paso 1000, tensores finitos, recarga estricta, embeddings atados, round-trip de tokenizer) y una auditoria de finalizacion del job, lo que lo hace util como ejemplo de trazabilidad de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada del modelo base), con embeddings atados |
| Parametros totales | 3.085.938.688 (3,09 B), modelo denso |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos del modelo base Qwen2.5-3B; el autor no configura ni valida la extension a 8K. Entrenamiento con 4.096 tokens de contexto total y hasta 3.072 tokens de completion |
| Tipos de cuantizacion | No publicados. Solo Safetensors en el dtype guardado (bf16 en el ejemplo de uso); sin GGUF, GPTQ ni AWQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | qwen-research (identificador `other`), LICENSE del modelo base incluido sin cambios |
| Formato de pesos | Safetensors fragmentado (sharded), exportado sin perdida desde el checkpoint; el estado del optimizador no se incluye |
| Modelo base | Qwen/Qwen2.5-3B (finetune sobre revision fijada) |
| Dataset de entrenamiento | zbeeb/Staleness-GRPO-DAPO-Math-17k (17.005 filas) |
| Tamano del repositorio | 12,4 GB |
| Libreria | transformers (tag `text-generation-inference`, `endpoints_compatible`) |
| Descargas / likes | 152 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B sin cambios estructurales: un transformer decoder-only autoregresivo con embeddings de entrada y salida atados (el manifiesto de exportacion verifica explicitamente el atado). El ajuste es de parametros completos, no LoRA ni adaptadores, y parte del modelo base con estado de optimizador nuevo. El autor advierte que las ejecuciones con topes de staleness mas altos no son continuaciones de las de tope mas bajo, de modo que cada checkpoint es un experimento independiente.

El entrenamiento usa GRPO con PrimeRL v0.9.0: 1.000 actualizaciones, batch de 64, tamano de grupo 8, semilla 42, AdamW con learning rate 1e-6, 30 actualizaciones de warmup, PPO clip de 0.2 y sin penalizacion KL de referencia. La recompensa es determinista y puntua la equivalencia matematica de la respuesta terminal. La innovacion metodologica es el tope de staleness de 8 (`max_off_policy_steps`), que limita la edad de la politica de rollout durante el entrenamiento (no la longitud de decodificacion). La topologia de GPU (2 GPUs de entrenamiento y 2 de inferencia) varia entre brazos, por lo que el propio autor indica que las comparativas entre brazos no son ablaciones puras de staleness.

En la exportacion se aplican comprobaciones de procedencia del paso 1000, finitud de tensores, recarga estricta, round-trip del tokenizer y logits identicos en sonda de CPU antes y despues de serializar. El tokenizer de entrenamiento identifica `<|im_end|>` (151645) como EOS; para compatibilidad en inferencia, `generation_config.json` detiene la generacion tambien en `<|endoftext|>` (151643), sin modificar pesos ni tokenizer. Ademas, el job original termino las 1.000 actualizaciones y todas las evaluaciones, pero su validador posterior fallo porque exigia un checkpoint de reanudacion del paso 725 fuera de la politica de retencion; existe una auditoria de finalizacion separada que conserva los artefactos originales y el historial de fallos de Slurm.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat de Qwen2.5 (`apply_chat_template`).
- Razonamiento matematico con cadena de pensamiento explicita cuando se le pide ("Explain your reasoning").
- Formato de respuesta controlable: terminacion en `\boxed{...}` o en una linea final `Final answer: ...`, que es el formato con el que se calculo la recompensa.
- Generacion tanto greedy (`do_sample=False`) como con muestreo (temperatura 0.6 en las evaluaciones del autor).
- Capacidad multilingue limitada a ingles y chino, segun los idiomas declarados.
- Tool calling / function calling: no documentado ni validado para este checkpoint, aunque el modelo base Qwen2.5 lo soporta en teoria.
- Uso en agentes y razonamiento multi-paso: no documentado por el autor.
- Modo "thinking" separado: no existe; el razonamiento se emite como texto plano dentro de la respuesta.
- Vision, audio u otras modalidades: no soportadas.
- Contexto largo: no configurado ni validado para 8K; el uso previsto es de prompts cortos (el ejemplo de la model card exige `input_ids` de longitud menor o igual a 1024).

## Casos de uso

- Generacion de soluciones matematicas paso a paso en entornos educativos: el modelo produce razonamiento intermedio y una respuesta final delimitada con `\boxed{}`, lo que permite extraer y verificar la respuesta de forma automatica en una plataforma de ejercicios.
- Generador de datos para SFT o RL posterior: al ser un checkpoint de investigacion con recompensa verificable, sirve para producir trayectorias de solucion (hasta 3.072 tokens) que luego se filtran por equivalencia matematica antes de reutilizarlas en entrenamiento.
- Ablacion de staleness en RL: reproducir el pipeline con topes 4, 8 o 16 para medir el impacto de `max_off_policy_steps` con el mismo dataset de 17.005 filas y el mismo contrato de recompensa.
- Evaluacion de estrategias de decodificacion en matematicas de competicion: comparar pass@1 greedy frente a media de 8 muestras a temperatura 0.6 en conjuntos como MATH500 o AMC23, tal y como hace el autor.
- Punto de partida para fine-tuning de dominio STEM: al ser un modelo denso de 3 B con pesos completos exportados en Safetensors, se puede continuar el entrenamiento en dominios acotados con presupuesto de hardware modesto.
- Asistente de chat bilingue ingles-chino para consultas matematicas de nivel secundaria y primeros cursos universitarios, con contexto de prompt corto y salida de hasta 3.072 tokens.
- Herramienta interna de analisis de prompts matematicos: medir tasas de truncamiento y de respuesta incorrecta al variar el limite de tokens de salida, util para dimensionar presupuestos de inferencia.
- Componente de investigacion en RLVR (reinforcement learning con recompensa verificable): sirve como politica de referencia barata para probar funciones de recompensa antes de escalarlas a modelos mayores.

## Benchmarks y rendimiento

Resultados de la ejecucion de entrenamiento (politica final del paso 1000), tal como los publica el autor. Las filas greedy usan una completion por pregunta; las filas "sampled" usan ocho completions por pregunta a temperatura 0.6 e informan de la precision media de respuesta, no de pass@8. MATH500, AMC y AIME usan 3.072 tokens de salida; Minerva y OlympiadBench, 2.048. Los nueve conjuntos finales tuvieron cero errores de evaluacion registrados.

| Benchmark | Completions | Precision | Truncado |
|---|---:|---:|---:|
| aime24-pass1 | 30 | 3,33 % | 16,67 % |
| aime24-sampled | 240 | 5,83 % | 9,58 % |
| aime25-pass1 | 30 | 3,33 % | 10,00 % |
| aime25-sampled | 240 | 4,17 % | 4,17 % |
| aime26-sampled | 240 | 4,58 % | 6,67 % |
| amc23-pass1 | 40 | 32,50 % | 7,50 % |
| math500-pass1 | 500 | 59,40 % | 2,40 % |
| minerva-pass1 | 272 | 24,63 % | 2,94 % |
| olympiadbench-pass1 | 675 | 26,07 % | 9,93 % |

Advertencias del propio autor: son resultados de la ejecucion de entrenamiento, no un benchmark nuevo del artefacto exportado ni una comparacion a 8K; los datos de entrenamiento se filtraron contra estas evaluaciones, lo que no descarta contaminacion de pretraining ni todos los cuasi-duplicados; y el modelo de 3B parte de Qwen2.5 general, mientras que el de 1.5B citado usa Qwen2.5-Math, por lo que las diferencias entre familias no son atribuibles solo al tamano. No se han publicado resultados de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 6,2 GB solo de pesos, mas cache KV y activaciones; en la practica unos 8-10 GB para prompts cortos (1.024 tokens) y salidas de hasta 3.072 tokens. La cache KV a 4.096 tokens de contexto ronda los 150 MB (estimacion).
- Si se publicaran cuantizaciones de 8 y 4 bits, las necesidades bajararian aproximadamente a 3,5 GB y 2 GB de pesos respectivamente; el autor no ha publicado ninguna, por lo que habria que generarlas.
- GPU consumer: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080/4090 y equivalentes con al menos 10-12 GB de VRAM en bf16. En GPUs de 8 GB solo entraria con cuantizacion agresiva, no incluida en el repositorio.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A10G sin problema; el modelo es lo bastante pequeno como para servir varias replicas por GPU con tensor parallelism innecesario.
- Opciones de despliegue: `transformers` (el ejemplo oficial usa `AutoModelForCausalLM` con `dtype=torch.bfloat16` y `device_map="auto"`), vLLM, TGI (el repo lleva el tag `text-generation-inference` y `endpoints_compatible`) y SGLang. Para llama.cpp u Ollama habria que convertir primero a GGUF, conversion no publicada.
- Aviso de integracion: si el motor de servicio ignora `generation_config.json`, hay que fijar explicitamente los identificadores de parada 151645 y 151643.
- Tamano del repositorio: 12,4 GB, muy por encima de los aproximadamente 6,2 GB de pesos en bf16, por lo que conviene revisar los ficheros antes de descargar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmark publicado | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-GRPO-Staleness-8 | 3,09 B (denso) | 32.768 nativo; entrenado a 4.096 | qwen-research | MATH500 pass@1 59,40 %; AMC23 32,50 %; AIME24 3,33 % (evaluacion de entrenamiento) | Checkpoint de investigacion sobre staleness en GRPO |
| Qwen/Qwen2.5-3B (base) | 3,09 B (denso) | 32.768 nativo | qwen-research | no disponible en esta informacion | Modelo generalista sin RL de matematicas; es el punto de partida |
| Qwen2.5-Math-1.5B (citado por el autor) | 1,5 B | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | Pertenece a la familia Qwen2.5-Math, no a la general; el autor lo usa como referencia de familia distinta |
| Otros modelos de razonamiento matematico de ~3 B | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | La busqueda web realizada no devolvio resultados tecnicos relevantes |

La busqueda web asociada a esta ficha no devolvio ningun resultado relacionado con el modelo (los enlaces recuperados tratan de inversiones inmobiliarias en Rumania), por lo que la comparativa se limita a los datos de la model card.

## Limitaciones y advertencias

- Rendimiento absoluto bajo en competicion: 3,33 % de precision pass@1 en AIME24 y AIME25, con tasas de truncamiento de hasta el 16,67 % en aime24-pass1, lo que sugiere que parte del fallo es de presupuesto de tokens y no solo de razonamiento.
- Las cifras publicadas provienen de la ejecucion de entrenamiento, no de un benchmark independiente del artefacto exportado; el autor lo indica de forma explicita.
- Especializacion estrecha: el RL solo optimiza equivalencia de respuesta matematica, por lo que no hay garantia de mantener capacidades generales del modelo base y no se documenta ninguna evaluacion fuera de matematicas.
- No se descarta contaminacion de pretraining ni la presencia de cuasi-duplicados entre el dataset de entrenamiento y los conjuntos de evaluacion, aunque el dataset se filtro contra ellos.
- Contexto de evaluacion limitado: 3.072 tokens de salida en MATH500, AMC y AIME, y 2.048 en Minerva y OlympiadBench; los truncamientos afectan directamente a las puntuaciones.
- La extension a 8K no esta configurada ni validada; el uso previsto es con prompts cortos (el ejemplo oficial exige 1.024 tokens o menos de entrada).
- Idiomas declarados: solo ingles y chino. El comportamiento en castellano no esta documentado ni evaluado.
- Licencia qwen-research (no Apache-2.0): restringe el uso comercial y exige revisar el LICENSE incluido y, en su caso, negociar una licencia aparte con el titular de los derechos antes de cualquier despliegue productivo.
- Alucinacion: al ser un modelo de 3 B sin RLHF/DPO especifico orientado a seguridad, es previsible que invente pasos o resultados en contextos fuera de matematicas de formato conocido.
- Validacion comunitaria practicamente nula: 152 descargas y 0 likes, sin terceros independientes que hayan reproducido las cifras.
- Trazabilidad del job: el validador posterior del entrenamiento fallo por una politica de retencion de checkpoints; la verificacion se apoya en una auditoria de finalizacion separada.
- No se publican cuantizaciones ni conversiones GGUF, de modo que el despliegue en hardware limitado requiere trabajo adicional por parte del usuario.
- Discrepancia de tamano: el repositorio ocupa 12,4 GB frente a los aproximadamente 6,2 GB esperables de pesos en bf16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-8
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B/tree/3aab1f1954e9cc14eb9509a215f9e5ca08227a9b
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Licencia incluida: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-8/blob/main/LICENSE
- Configuracion de entrenamiento: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-8/blob/main/training-config.json
- Manifiesto de exportacion: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-8/blob/main/export-manifest.json
- Resultados de evaluacion (formato legible por maquina): https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-8/blob/main/evaluation-results.json
- Verificacion de finalizacion del job: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-8/blob/main/completion-verification.json
- Framework de entrenamiento PrimeRL v0.9.0: citado en la model card, sin enlace proporcionado
- Busqueda web: no se encontro ningun resultado tecnico relevante sobre este modelo; los enlaces recuperados no guardan relacion con el contenido de la ficha
