# wayne-SFT/Phi-4-mini-instruct-SFT-ScienceWorld

## Resumen

Phi-4-mini-instruct-SFT-ScienceWorld es un checkpoint de ajuste fino supervisado (SFT) de parametros completos sobre el modelo base microsoft/Phi-4-mini-instruct, publicado por el usuario wayne-SFT. El objetivo declarado es servir como punto de partida para aprendizaje por refuerzo (RL) en el entorno ScienceWorld, un benchmark de tareas cientificas interactivas basado en texto. El autor lo denomina explicitamente "behaviour-cloning (SFT) start checkpoint", es decir, un modelo que imita trayectorias expertas antes de aplicar optimizacion por politica.

El modelo conserva la arquitectura Phi-3/Phi-4-mini de Microsoft, con aproximadamente 3.836 millones de parametros (3,8B), pesos en safetensors y licencia MIT. Los datos de entrenamiento son trayectorias expertas recogidas por el autor exclusivamente sobre los objetivos de entrenamiento de ScienceWorld (denominado internamente `sw_sft_v3_hash2`), con entrenamiento de parametros completos, learning rate 1e-5, batch global 64 y longitud maxima de secuencia 1792 tokens.

Es relevante por acotar el caso de uso: no es un modelo de proposito general, sino un artefacto experimental orientado a investigacion en agentes embodied/textuales y RL sobre entornos simulados. Su utilidad practica fuera de ese nicho es limitada, pero resulta valioso como referencia de partida para reproducir pipelines de SFT + RL en ScienceWorld con un backbone pequeno y desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3/Phi-4-mini, clase `Phi3ForCausalLM`) |
| Parametros totales | 3.836.021.760 (~3,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenado con max sequence length 1792) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; `config.json` declara dtype `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (terminos del modelo base en LICENSE de microsoft/Phi-4-mini-instruct) |
| Formato de pesos | safetensors (4 shards, todos los 195 tensores en F32) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Phi-4-mini-instruct (revision `cfbefacb99257ffa30c83adab238a50856ac3083`), un transformer decoder-only de la familia Phi-3 que en este repositorio se carga mediante las clases nativas de transformers (se elimino `config.auto_map` y se omitieron los ficheros de remote code `configuration_phi3.py`, `modeling_phi3.py` y `sample_finetune.py`). El ajuste fino fue de parametros completos (full-parameter SFT), con learning rate 1e-5, batch global 64 y longitud maxima de secuencia 1792 tokens. El checkpoint publicado corresponde al step global 326, que equivale a la epoca 2 de 3.

Los datos de entrenamiento son trayectorias expertas recogidas por el autor unicamente sobre los objetivos de entrenamiento de ScienceWorld (dataset interno `sw_sft_v3_hash2`), sin incluir los objetivos de dev. No se menciona uso de RLHF, DPO ni decodificacion especulativa. Los pesos se guardaron tal cual se entrenaron, en fp32 (los 195 tensores en F32), aunque el campo dtype de `config.json` indica `bfloat16`; esto implica que la carga por defecto puede requerir conversion o casteo explicito para inferencia en precision reducida.

## Capacidades

- Generacion de texto conversacional y razonamiento de dominio general heredado del modelo base Phi-4-mini-instruct.
- Ejecucion de acciones textuales en el entorno ScienceWorld (manipulacion de objetos, experimentos, tareas cientificas) mediante imitacion de trayectorias expertas.
- Razonamiento multi-paso orientado a agentes: el entrenamiento sobre trayectorias expertas favorece la produccion de secuencias de acciones coherentes con el entorno.
- Soporte de chat mediante `chat_template.jinja` incluido en el repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base soporta varios idiomas, pero no se documenta el efecto del SFT sobre ellos).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Punto de partida para RL en ScienceWorld: el checkpoint esta pensado como inicializacion para entrenamiento por refuerzo; se usaria como politica inicial sobre la que aplicar optimizacion por politica con recompensas del entorno.
- Reproduccion de pipelines de SFT sobre entornos simulados: permite replicar el flujo "trayectorias expertas -> SFT de parametros completos -> evaluacion en dev" con un backbone pequeno y pesos publicos verificables por sha256.
- Investigacion en behavior cloning: sirve como baseline de imitacion para comparar tecnicas de RL o de filtrado de datos sobre ScienceWorld.
- Evaluacion de agentes textuales: util para medir success rate y score en el dev set de ScienceWorld (1796 variaciones, seed 0, engine 1.2.3) y contrastar con otras politicas.
- Fine-tuning posterior sobre dominios cientificos especificos: al ser un modelo de 3,8B con licencia MIT, puede reajustarse para otras tareas de razonamiento textual con recursos moderados.
- Despliegue en entornos de investigacion con GPU consumer: el tamano (~3,8B) permite servir el modelo en una sola GPU de gama alta consumer, facilitando experimentos iterativos de RL.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ScienceWorld dev (1796 variaciones, seed 0, engine 1.2.3) | Success rate | 37,7% |
| ScienceWorld dev (1796 variaciones, seed 0, engine 1.2.3) | Score | 64,2 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 15,3 GB solo para pesos (3,836B x 4 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en bf16/fp16 tras conversion: aproximadamente 7,7 GB para pesos, mas overhead; viable en GPUs consumer con 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,8-4 GB; en 4 bits: aproximadamente 2-2,5 GB (estimaciones teoricas, no verificadas en el repositorio).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y RL; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp32 o bf16; GPUs de 12-16 GB para inferencia en bf16 o cuantizada.
- Cabe en GPU consumer: si, en RTX 4090/3090 en fp32 o bf16, y en GPUs de 12-16 GB tras conversion a bf16 o cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama, vLLM y TGI no estan confirmados en la informacion proporcionada, aunque al ser arquitectura Phi-3 pueden ser compatibles previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-SFT-ScienceWorld | ~3,8B | no disponible (entrenado a 1792) | SFT sobre ScienceWorld | MIT | Hugging Face (wayne-SFT) |
| microsoft/Phi-4-mini-instruct | ~3,8B | no disponible en esta ficha | Modelo base de proposito general | MIT | Hugging Face (microsoft) |
| Alternativas de agentes para ScienceWorld | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de terceros en la informacion proporcionada; la unica comparacion directa posible es frente al modelo base, del que este checkpoint deriva y cuyo rendimiento especifico en ScienceWorld no se documenta en el repositorio.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre objetivos de entrenamiento de ScienceWorld; el dev set (1796 variaciones) se uso solo para evaluacion, por lo que el success rate del 37,7% refleja generalizacion limitada fuera de la distribucion de entrenamiento.
- No es un modelo de proposito general fiable: el SFT sobre trayectorias expertas puede degradar capacidades generales del modelo base y favorecer respuestas con formato de acciones del entorno.
- Riesgo de alucinacion: no se documenta mitigacion especifica; el modelo puede generar acciones invalidas o afirmaciones incorrectas fuera de ScienceWorld.
- Pesos publicados en fp32 con `config.json` declarando `bfloat16`: posible desajuste que requiere casteo explicito y aumenta los requisitos de VRAM en carga por defecto.
- Idiomas soportados no documentados; el comportamiento multilingue tras el SFT no esta verificado.
- Licencia MIT permite uso comercial, pero los terminos del modelo base (microsoft/Phi-4-mini-instruct) deben respetarse; se incluye copia de LICENSE en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de reproducibilidad externa.
- No se documentan sesgos, evaluaciones de seguridad ni limitaciones de contexto mas alla de la longitud de entrenamiento (1792 tokens).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wayne-SFT/Phi-4-mini-instruct-SFT-ScienceWorld
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/LICENSE
- ScienceWorld (entorno de referencia): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
