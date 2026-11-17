# zen-E/PLatour-TR-LoRA-Qwen3.5-4B-DAPO

## Resumen

PLatour-TR-LoRA-Qwen3.5-4B-DAPO es un adaptador LoRA (PEFT) publicado por el usuario zen-E sobre el backbone multimodal Qwen/Qwen3.5-4B. No es un modelo independiente: se trata de un artefacto de inferencia asociado al proyecto de investigacion PLatour, que estudia la transferencia entre modelos (PACT, *Prefill-to-Autoregressive Cross-model Transfer*), donde un modelo "emisor" de mayor tamano codifica el prompt y un "receptor" mas pequeno genera la respuesta. El adaptador modifica unicamente el decodificador de texto del modelo base; el codificador de vision queda intacto.

El adaptador se entrena con la metodologia descrita en el paper arXiv:2611.06976, que propone puentes lineales ligeros entre backbones congelados, inicializados a cero y optimizados mediante recompensas de tarea (DAPO). El checkpoint se distribuye como adaptador estandar PEFT en safetensors (~1,0 GB de repositorio), con licencia Apache 2.0 y dependencia explicita del backbone Qwen3.5-4B en una revision concreta.

La relevancia de esta ficha es acotada: el propio autor advierte que son "artefactos de inferencia historicos sin puntuaciones de benchmark" y que el empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion insesgada. Es, por tanto, material de investigacion reproducible, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el decodificador de texto de Qwen3.5-4B; el backbone es un transformer multimodal con atencion hibrida segun el paper |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el backbone base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el protocolo de evaluacion usa un limite de respuesta de 32K tokens, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors FP32; la cuantizacion depende del backbone) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere los pesos del backbone Qwen/Qwen3.5-4B por separado |

## Arquitectura y entrenamiento

El adaptador es un modulo LoRA estandar aplicado exclusivamente al decodificador de texto del backbone Qwen3.5-4B. El modelo base es multimodal (se carga con `AutoModelForImageTextToText`), pero el adaptador no toca el codificador de vision. Segun la model card, se preservan los valores originales del adaptador en FP32 y los modulos QKV fusionados, lo que difiere de la conversion al runtime de vLLM del proyecto.

El entrenamiento sigue el marco PACT del paper: un emisor de mayor tamano codifica el prompt y un receptor mas pequeno genera la respuesta de forma independiente, con puentes lineales ligeros entrenados mediante recompensas de tarea (DAPO) partiendo de proyecciones inicializadas a cero. El dataset asociado es `zen-E/PLatour-DAPO-Data`. El paper introduce ademas PACT-Check, con controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver, para verificar si las mejoras dependen de informacion util del emisor o surgen simplemente por adaptacion del receptor. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento sobre el backbone Qwen3.5-4B (matematicas, respuesta a preguntas), condicionada por el adaptador LoRA.
- El protocolo de evaluacion publicado se centra en tareas de competicion matematica: AIME, HMMT e IMO, con un limite de respuesta de 32K tokens y un subconjunto AIME-135/Clean80.
- Soporte multimodal heredado del backbone (entrada de imagen y texto), aunque el adaptador no modifica el codificador de vision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (existe una guia AGENT/API en el repositorio del proyecto, pero no se detalla su alcance).
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Reproduccion de investigacion en transferencia entre modelos: cargar el adaptador con `PeftModel` sobre Qwen3.5-4B y ejecutar `platour-exps evaluate --experiment 24` para replicar el protocolo publicado sobre AIME, HMMT e IMO.
- Auditoria de metodologia PACT: usar los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication, Trained Receiver) para comprobar si las mejoras atribuidas al emisor son genuinas o artefactos de adaptacion del receptor.
- Estudio de adaptadores LoRA sobre decodificadores multimodales: analizar el efecto de adaptar solo el decodificador de texto dejando intacto el codificador de vision en Qwen3.5-4B.
- Evaluacion de tecnicas de RL con recompensas de tarea (DAPO): inspeccionar el checkpoint como referencia de un pipeline de optimizacion con recompensas, sin asumir calidad de produccion.
- Pruebas de infraestructura de evaluacion distribuida: usar las opciones `--n-gpu` y `--gpus-per-replica` del proyecto para validar despliegues multi-GPU con replicas independientes y shards disjuntos.
- Experimentacion con decodificacion de respuestas largas: el protocolo con limite de 32K tokens permite estudiar el comportamiento en generaciones extensas de razonamiento matematico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que son "artefactos de inferencia historicos sin puntuaciones de benchmark" y que el empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion insesgada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El backbone Qwen3.5-4B en FP16 requiere del orden de 8 GB solo para pesos; el adaptador anade ~1,0 GB de repositorio en FP32. Con decodificacion de hasta 32K tokens de respuesta, la cache KV incrementa sustancialmente el consumo; se recomienda planificar con margen amplio.
- GPU recomendadas: el proyecto asume Linux con CUDA. Para el protocolo de evaluacion con respuestas largas se recomienda una GPU de datacenter (A100, H100) por replica; el autor indica que cada replica necesita memoria suficiente para sus modelos y carga de decodificacion.
- GPU de consumo: no confirmado en la informacion disponible; un backbone de 4B en cuantizacion de 8 o 4 bits podria caber en RTX 4090, pero el adaptador publicado esta en FP32 y el protocolo de 32K tokens puede exceder la VRAM.
- Despliegue: ruta estandar con Transformers + PEFT (`AutoModelForImageTextToText` + `PeftModel`); el proyecto dispone de su propio runtime basado en vLLM con conversion especifica. No se mencionan llama.cpp, Ollama ni TGI.
- Paralelismo: `--n-gpu N` lanza N replicas independientes con shards disjuntos; `--n-gpu N --gpus-per-replica G` divide N GPUs en N/G replicas (N divisible por G). El tamano de grupo por defecto para este checkpoint es 1 GPU por replica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PLatour-TR-LoRA-Qwen3.5-4B-DAPO | LoRA sobre backbone 4B | no disponible | safetensors (PEFT) | apache-2.0 | Adaptador de investigacion sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | safetensors | no disponible en esta ficha | Backbone multimodal original; el adaptador depende de su revision `851bf6e8...` |
| Otros adaptadores de la coleccion PLatour (`zen-E/platour`) | variables | no disponible | safetensors (PEFT) | apache-2.0 | Variantes del mismo proyecto; comparacion directa no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor declara que son artefactos de inferencia historicos sin puntuaciones de benchmark; no deben interpretarse como un modelo validado.
- El empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion insesgada; se requiere evaluacion independiente y reporte de procedencia antes de cualquier afirmacion comparativa.
- Rendimiento superior en tarea no demuestra por si solo comunicacion efectiva entre modelos; de ahi los controles PACT-Check del paper.
- El adaptador solo modifica el decodificador de texto: cualquier expectativa de mejora en vision es infundada.
- Dependencia estricta de la revision concreta del backbone Qwen3.5-4B (`851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`); usar otra revision puede romper la carga.
- La conversion al runtime de vLLM del proyecto no preserva necesariamente los valores FP32 del adaptador; los resultados pueden diferir entre la ruta Transformers y la ruta vLLM.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible; heredados en su caso del backbone.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso del backbone Qwen3.5-4B queda sujeto a su propia licencia.
- El ejemplo de la model card con `max_new_tokens=256` no reproduce el protocolo de benchmark; aumentar el limite es necesario para respuestas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-TR-LoRA-Qwen3.5-4B-DAPO
- Paper: https://arxiv.org/html/2611.06976
- Codigo del proyecto: https://github.com/zhenyi4/platour
- Guia de instalacion: https://github.com/zhenyi4/platour#getting-started
- Guia de entorno: https://github.com/zhenyi4/platour/blob/main/docs/ENVIRONMENT.md
- Guia AGENT/API: https://github.com/zhenyi4/platour/blob/main/AGENT.md
- Protocolos de tarea: https://github.com/zhenyi4/platour/blob/main/qwen35/README.md
- Indice de checkpoints: https://github.com/zhenyi4/platour/blob/main/models/README.md#downloadable-checkpoints
- Coleccion de modelos: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
