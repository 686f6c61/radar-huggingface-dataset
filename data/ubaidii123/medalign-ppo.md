# ubaidii123/medalign-ppo

## Resumen

medalign-ppo es un adaptador LoRA publicado por el usuario ubaidii123 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se trata de un experimento de alineacion mediante aprendizaje por refuerzo (RLHF con PPO) aplicado sobre una fase previa de ajuste supervisado (SFT), usando un modelo de recompensa entrenado con pares de preferencias. El objetivo declarado es el dominio medico, aunque el propio autor lo etiqueta explicitamente como demostracion educativa y no como consejo medico.

El modelo es un transformer decoder-only de 0,5 mil millones de parametros, heredado integramente de Qwen2.5-0.5B-Instruct, con el adaptador LoRA como unico componente entrenado. El repositorio tiene un tamano de 0,0 GB (practicamente vacio en el momento de la consulta), 0 descargas y 0 likes, lo que sugiere un artefacto de investigacion de baja difusion mas que un modelo listo para produccion.

Su relevancia es limitada y fundamentalmente metodologica: sirve como ejemplo reproducible de un pipeline SFT + PPO + GRPO sobre un modelo pequeno, pero los propios resultados publicados por el autor muestran que el ajuste empeora el rendimiento respecto al modelo base en el conjunto de evaluacion golden-set, lo que lo convierte en un caso de estudio sobre inestabilidad del RLHF mas que en una herramienta utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parametros. El entrenamiento sigue un pipeline de tres etapas segun la model card: ajuste supervisado (SFT) inicial, entrenamiento de un modelo de recompensa a partir de pares de preferencias y, finalmente, optimizacion con PPO (Proximal Policy Optimization) usando dicho modelo de recompensa. La libreria empleada es TRL, con PEFT como formato de publicacion.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de preferencias, la configuracion del modelo de recompensa ni hiperparametros de PPO (learning rate, KL coefficient, clipping, numero de pasos). Tampoco se detalla si hubo tecnicas adicionales como decodificacion especulativa, atencion lineal o mezcla de expertos. La model card menciona ademas una variante GRPO (Group Relative Policy Optimization) evaluada en el mismo conjunto, lo que indica que el autor comparo al menos dos algoritmos de RL.

## Capacidades

- Generacion de texto y respuesta a preguntas de opcion multiple (MCQ) en el dominio medico, segun el conjunto de evaluacion golden-set.
- Capacidades heredadas del modelo base Qwen2.5-0.5B-Instruct: generacion de texto general, razonamiento basico y cierta capacidad de codigo, aunque no verificadas especificamente para este adaptador.
- Deteccion de "red flags" clinicas: el conjunto de evaluacion incluye 30 items de este tipo, con una tasa de acierto de 0,800.
- Identificacion de contenido inseguro: 20 items de evaluacion con tasa de 0,200.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (los idiomas del adaptador no se especifican).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Estudio de reproducibilidad de pipelines RLHF: el repositorio y el codigo asociado en GitHub permiten replicar un flujo SFT + modelo de recompensa + PPO sobre un modelo pequeno, util para docencia o investigacion metodologica.
- Analisis de degradacion por RLHF: dado que el adaptador PPO obtiene peores resultados que el modelo base en el golden-set (0,380 frente a 0,510 global), sirve como caso practico para estudiar sobreoptimizacion, colapso de recompensa o desalineacion entre modelo de recompensa y metrica objetivo.
- Comparacion de algoritmos de RL: la model card incluye resultados de PPO y GRPO sobre el mismo conjunto, lo que permite usar el artefacto como referencia en experimentos comparativos de algoritmos de preferencia.
- Prototipado de evaluacion en dominio medico: el golden-set de 200 items (150 MCQ, 30 red-flag, 20 unsafe) puede reutilizarse como banco de pruebas para medir comportamiento de modelos pequenos en tareas clinicas simuladas.
- Experimentacion con PEFT en hardware modesto: al ser un adaptador sobre un modelo de 0,5B, puede cargarse en GPUs de consumo para probar tecnicas de merging, cuantizacion o evaluacion sin infraestructura dedicada.
- Docencia sobre riesgos de desplegar modelos medicos sin validacion: el propio autor advierte que es solo una demo educativa, lo que lo hace adecuado como ejemplo de por que no debe usarse un modelo asi en un contexto clinico real.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card sobre un golden-set de 200 items (150 MCQ, 30 red-flag, 20 unsafe):

| Modelo | MCQ | Red flag | Unsafe | Global |
|---|---|---|---|---|
| base (Qwen2.5-0.5B-Instruct) | 0,420 | 1,000 | 0,450 | 0,510 |
| sft | 0,327 | 0,800 | 0,200 | 0,385 |
| ppo (este adaptador) | 0,320 | 0,800 | 0,200 | 0,380 |
| grpo | 0,380 | 0,900 | 0,200 | 0,440 |

El adaptador PPO es el peor de los cuatro en la metrica global y en MCQ, y empata con SFT en red-flag y unsafe. El modelo base sin ajustar supera a todas las variantes ajustadas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,5B en precision completa (fp16), aproximadamente 1 GB de pesos; con el adaptador LoRA sumado, el consumo adicional es minimo (tipicamente decenas de MB). En cuantizacion de 4 bits cabria en menos de 1 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo sin problemas. Para entrenamiento o evaluacion por lotes, una RTX 4090 o A100 ofreceria mayor throughput, pero no es necesario para inferencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU para inferencia con llama.cpp u Ollama si se convierte el modelo fusionado.
- Opciones de despliegue: transformers + peft (via indicada por el autor); vLLM y TGI requeririan fusionar el adaptador en los pesos base; llama.cpp y Ollama requeririan conversion a GGUF tras el merge.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en golden-set | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medalign-ppo (este) | 0,5B + LoRA | no disponible | 0,380 global | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | 0,510 global | Apache 2.0 | Hugging Face, ampliamente disponible |
| medalign-grpo (mismo autor) | 0,5B + LoRA | no disponible | 0,440 global | Apache 2.0 (presumible) | Referenciado en la model card |
| medalign-sft (mismo autor) | 0,5B + LoRA | no disponible | 0,385 global | Apache 2.0 (presumible) | Referenciado en la model card |

La comparativa mas relevante es contra el propio modelo base, que supera al adaptador en todas las metricas reportadas. No se dispone de datos de benchmarks estandar que permitan comparar con alternativas de otros autores en el dominio medico.

## Limitaciones y advertencias

- El autor declara explicitamente que es una demostracion educativa y no constituye consejo medico; no debe usarse en contextos clinicos reales.
- El adaptador PPO empeora el rendimiento del modelo base en el golden-set (0,380 frente a 0,510 global), lo que indica un fallo del pipeline de RLHF o una desalineacion entre el modelo de recompensa y la metrica de evaluacion.
- La tasa de deteccion de contenido inseguro cae de 0,450 en el modelo base a 0,200 tras el ajuste, lo que supone un riesgo de seguridad relevante si se desplegara.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en un dominio medico, cualquier alucinacion tiene consecuencias potencialmente graves.
- Sesgos conocidos: no documentados en la model card; el modelo base Qwen2.5 puede arrastrar sesgos de sus datos de entrenamiento, no caracterizados aqui.
- Idiomas soportados: no especificados para el adaptador; se heredan los del modelo base, pero sin validacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso comercial en dominio medico requeriria validacion regulatoria adicional que el autor no proporciona.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el artefacto no ha sido validado por la comunidad.
- No se documentan hiperparametros de entrenamiento ni la composicion del dataset de preferencias, lo que dificulta la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/ubaidii123/medalign-ppo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Codigo del proyecto: https://github.com/ubaidur404786/medalign-rl
