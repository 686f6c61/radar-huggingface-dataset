# zbbwww23/uav-agent-phi4-mini

## Resumen

UAV Agent Phi-4-mini es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `microsoft/Phi-4-mini-instruct`, publicado por el usuario zbbwww23. No se trata de un modelo completo, sino de un ajuste fino orientado a una tarea muy concreta: el control de vuelo en un proyecto de pruebas con multiples agentes UAV (vehiculos aereos no tripulados). El adaptador incorpora pesos, configuracion y ficheros de tokenizer, pero no los pesos del modelo base, que deben descargarse por separado.

El adaptador fue seleccionado mediante validacion online sobre una cohorte de 116 casos, compitiendo con otros dos candidatos LoRA de la misma familia. Segun la model card, el checkpoint elegido es `Phi-4-mini/checkpoint-4500` y alcanza una tasa de exito estricto en bucle cerrado de 0,9052, una precision detallada de agente de 0,9520 y una puntuacion compuesta de 0,9380.

Su relevancia es acotada: es un artefacto de investigacion para un dominio especifico (agentes UAV con function calling), no un modelo de proposito general. Resulta util para quienes quieran reproducir o extender el pipeline de validacion y el dataset publico asociado, pero no esta pensado como sustituto del modelo base en tareas genericas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Phi-4-mini-instruct); no se detalla la arquitectura interna del adaptador |
| Parametros totales | No disponible (el adaptador pesa 23.102.656 bytes; los parametros del modelo base no se especifican en la informacion disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible; el entrenamiento uso QLoRA, pero no se listan formatos de cuantizacion para inferencia |
| Idiomas soportados | No disponible |
| Licencia | other (se mantienen la licencia y restricciones de uso del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `microsoft/Phi-4-mini-instruct` mediante QLoRA, una variante de LoRA con cuantizacion del modelo base durante el ajuste. El repositorio contiene unicamente los pesos del adaptador, su configuracion y los ficheros de tokenizer; los pesos del modelo base no se incluyen y deben cargarse por separado con `PeftModel.from_pretrained`. El checkpoint seleccionado es `checkpoint-4500`, elegido entre tres candidatos LoRA de la misma familia evaluados sobre la misma cohorte de validacion online.

El ajuste esta orientado a function calling y a la toma de decisiones en un bucle cerrado de control de vuelo multi-agente. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Se referencia un dataset publico (`uav-agent-sft-public`) con splits de entrenamiento, validacion y test, y un benchmark separado (`uav-agent-mixed120-benchmark`) con tareas de evaluacion de estilo online. El adaptador incluye un registro de verificacion de pesos con tamano (23.102.656 bytes) y hash SHA-256.

## Capacidades

- Generacion de texto conversacional en el dominio de control de vuelo UAV, heredando la base conversacional de Phi-4-mini-instruct.
- Function calling orientado a acciones de agente UAV, segun los tags del repositorio (`function-calling`).
- Razonamiento multi-paso en bucle cerrado: la validacion online mide exito estricto en bucle cerrado, no solo acierto por turno.
- Diagnostico de fallos: la model card reporta una metrica especifica de macro F1 de diagnostico (0,7862).
- Generacion de explicaciones: la metrica de soporte de explicacion alcanza 1,0000 en la cohorte de validacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se declaran capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Validacion de pipelines de agentes UAV: el adaptador sirve como referencia para reproducir la evaluacion online sobre la cohorte de 116 casos y comparar contra los otros dos candidatos LoRA de la familia.
- Control de vuelo simulado con function calling: el modelo puede emitir llamadas a funciones de control en un bucle cerrado, adecuado para entornos de simulacion donde se mide la tasa de exito estricta.
- Diagnostico de fallos en misiones: la metrica de macro F1 de diagnostico (0,7862) sugiere uso en tareas de identificacion de causas de fallo dentro del proyecto.
- Generacion de explicaciones operativas: con soporte de explicacion de 1,0000 en la cohorte evaluada, puede emplearse para justificar decisiones del agente en informes de validacion.
- Investigacion academica sobre ajuste fino con QLoRA en dominios de control: el artefacto y su dataset publico permiten estudiar el efecto del ajuste de bajo rango en tareas de agente.
- Punto de partida para adaptaciones a otros dominios de agentes: al ser un adaptador PEFT sobre Phi-4-mini-instruct, puede servir de base para experimentos de transferencia a otros entornos de control.

## Benchmarks y rendimiento

Resultados de validacion online sobre 116 casos, segun la model card:

| Metrica | Valor |
|---|---:|
| Tasa de exito estricta en bucle cerrado | 0,9052 |
| Precision detallada de agente | 0,9520 |
| Puntuacion compuesta detallada | 0,9380 |
| Macro F1 de diagnostico | 0,7862 |
| Precision de soporte de explicacion | 1,0000 |
| Casos | 116 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones numericas contra los otros dos candidatos LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Phi-4-mini-instruct y de la cuantizacion elegida, no del adaptador (23 MB).
- GPU recomendadas: no especificadas en la model card.
- Cabe en GPU consumer: no confirmado en la informacion disponible; depende del modelo base y de su cuantizacion.
- Opciones de despliegue: la model card solo documenta carga via `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de los otros dos candidatos LoRA evaluados en la misma cohorte, ni de alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UAV Agent Phi-4-mini (este) | No disponible | No disponible | Exito estricto 0,9052 en 116 casos | other | Hugging Face |
| Candidato LoRA 2 (misma familia) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Candidato LoRA 3 (misma familia) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: requiere descargar `microsoft/Phi-4-mini-instruct` y cargarlo con PEFT.
- Dominio muy restringido: entrenado para control de vuelo UAV multi-agente; su rendimiento fuera de ese dominio no esta caracterizado.
- Cohorte de validacion pequena (116 casos), lo que limita la significacion estadistica de las metricas reportadas.
- Sesgos conocidos: no documentados en la model card.
- Riesgo de alucinacion: no evaluado de forma especifica; hereda el del modelo base.
- Limitaciones de contexto e idioma: no declaradas.
- Licencia `other`: se aplican las restricciones del modelo base Phi-4-mini-instruct, que deben revisarse antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y no se ha validado de forma independiente por la comunidad.
- No se documentan formatos de cuantizacion para despliegue en produccion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/zbbwww23/uav-agent-phi4-mini
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Dataset publico de SFT: https://huggingface.co/datasets/zbbwww23/uav-agent-sft-public
- Benchmark Mixed120: https://huggingface.co/datasets/zbbwww23/uav-agent-mixed120-benchmark
- Registro de validacion online: `online-validation.json` (incluido en el repositorio del adaptador)
