# while-ai/paper-bpco-bounded-critic-1.5b

## Resumen

`while-ai/paper-bpco-bounded-critic-1.5b` es un adaptador LoRA publicado por while-ai como parte de su colección "Papers, replicated", cuyo objetivo es replicar de forma reproducible variantes de recetas de aprendizaje por refuerzo sobre modelos pequeños. En concreto, implementa una receta de entrenamiento tipo PPO sobre GSM8K con un *critic* acotado (*bounded critic*), comparándola contra la receta PPO estándar con *value head* recortado (*clipped-value*). El modelo base sobre el que se aplica el adaptador es Qwen2.5-1.5B-Instruct, un transformer denso de 1.500 millones de parámetros con contexto de 32.768 tokens.

El repositorio no es un modelo listo para producción, sino un artefacto de investigación: contiene dos brazos de entrenamiento (la receta BPCO en la raíz y el *baseline* PPO en la subcarpeta `baseline`), junto con el `value_head.pt` y las curvas de entrenamiento de cada uno. La receta acota la salida de la *value head*, la entrena hacia el retorno Monte Carlo con 15 pasos de calentamiento exclusivos del crítico y emplea el rango de ratio de DPPO.

Su relevancia actual es metodológica: ilustra cómo publicar réplicas de recetas de RL con intervalos de confianza, decisión explícita de veredicto y trazabilidad de semillas y versiones. El propio autor etiqueta el resultado como "unresolved", porque la diferencia observada entre receta y *baseline* no es estadísticamente significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (modelo base Qwen2.5-1.5B-Instruct) con adaptador LoRA y *value head* para PPO |
| Parametros totales | 1.500 millones en el modelo base + adaptador LoRA (número exacto de parámetros del adaptador no disponible; el repo pesa 0,2 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en la ficha del adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens según su documentación |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors); las cuantizaciones aplicables son las del modelo base Qwen2.5-1.5B-Instruct |
| Idiomas soportados | No declarados en la ficha del adaptador; el modelo base es multilingüe, pero no se ha validado el comportamiento multilingüe del adaptador |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) más `value_head.pt` y `curves.json` por cada brazo |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA sobre Qwen2.5-1.5B-Instruct, un transformer decoder denso de 1.500 millones de parámetros. Sobre esa base se entrena una *value head* (crítico) en el marco de un algoritmo tipo PPO, con un ajuste de política sobre el conjunto de datos openai/gsm8k (problemas de matemáticas de primaria). La innovación que da nombre al repositorio es el acotado de la salida del crítico: la receta BPCO limita el rango de salida de la *value head* y la entrena hacia el retorno Monte Carlo mediante 15 pasos de calentamiento en los que solo se actualiza el crítico, antes de habilitar las actualizaciones de política. Además, emplea el rango de ratio de DPPO en lugar del recorte estándar de PPO.

La comparación experimental contrasta dos brazos con idéntico presupuesto de política: el *baseline* (crítico PPO estándar con recorte de valor, 40 pasos) y la receta BPCO (15 pasos de calentamiento del crítico más 40 pasos de política). El número de pasos de política es idéntico en ambos, y la columna "GPU min" de la model card registra 25,1 frente a 26,3 minutos de GPU respectivamente. El propio autor señala que, con ese tamaño de paso, el ratio nunca se alejó de 1 en más de 0,0014, por lo que ningún recorte llegó a activarse: la comparación se reduce en la práctica al crítico acotado frente al no acotado. El resultado se declara explícitamente "unresolved", con una diferencia en pass@1 de -0,017 y un intervalo de confianza del 95 % de [-0,069, +0,037] sobre 120 tareas emparejadas.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Resolución de problemas matemáticos de tipo GSM8K (aritmética de varios pasos en lenguaje natural), que es la tarea objetivo del entrenamiento.
- Puntuación de estados mediante la *value head* entrenada, utilizable en pipelines de RL como crítico para estimar retornos.
- Reproducción de la receta mediante el script `recipe.py` del repositorio whileai-sdk, con semilla, versiones de librerías y GPU fijadas.
- Comparación controlada entre dos brazos de entrenamiento desde un mismo repositorio (raíz y subcarpeta `baseline`).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte explícito de agentes, razonamiento multi-paso fuera de GSM8K, visión, audio ni modo *thinking*.

## Casos de uso

- Replicación de experimentos de RL: cargar el adaptador sobre Qwen2.5-1.5B-Instruct y ejecutar `recipe.py` para reproducir la comparación entre crítico acotado y crítico con recorte de valor, con semilla y versiones fijadas.
- Estudio de estabilidad del crítico: analizar las curvas de `curves.json` y el `value_head.pt` para investigar por qué el ratio de política no se aleja de 1 en este régimen de tamaño de paso.
- Aprendizaje y docencia de PPO: usar los dos brazos como ejemplo mínimo y reproducible de una receta PPO aplicada a un modelo de 1.500 millones de parámetros, con presupuesto de cómputo bajo.
- Evaluación de metodología de réplica: emplear el formato del repositorio (intervalos de confianza, tareas emparejadas, veredicto explícito) como plantilla para publicar réplicas propias con trazabilidad.
- Investigación en razonamiento aritmético: disponer de una política ajustada sobre GSM8K para medir pass@1 y pass@k frente a la línea base sin entrenamiento (0,39 y 0,60 respectivamente).
- Ablaciones sobre el rango de ratio: modificar la receta DPPO (rango de ratio, clip de valor, pasos de calentamiento) y volver a entrenar para aislar el efecto del acotado del crítico.
- Análisis de presupuesto de cómputo: usar la métrica de minutos de GPU (25,1 frente a 26,3) para estimar el coste de recetas de RL sobre modelos pequeños antes de escalar a tamaños mayores.
- Ajuste fino de un crítico reutilizable: la *value head* entrenada puede exportarse y reutilizarse en otros experimentos de RL que compartan el mismo modelo base.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. La métrica "GPU min" es la columna de la model card original.

| Brazo | pass@1 | IC 95 % | pass@k | Pasos | GPU min |
|---|---|---|---|---|---|
| Base, sin entrenamiento | 0,39 | [0,33; 0,46] | 0,60 | 0 | 0 |
| Baseline (receta PPO con crítico estándar recortado) | 0,43 | [0,36; 0,50] | 0,66 | 40 | 25,1 |
| Recipe (paquete BPCO con crítico acotado) | 0,41 | [0,35; 0,48] | 0,73 | 15 calentamiento + 40 | 26,3 |

Comparación receta frente a *baseline*: -0,017 con IC 95 % [-0,069; +0,037] sobre 120 tareas emparejadas. Veredicto declarado por el autor: "unresolved". No se han publicado resultados de benchmarks adicionales (por ejemplo MMLU o HumanEval) en la información disponible.

## Requisitos de hardware

- El modelo base Qwen2.5-1.5B-Instruct en precisión fp16 ocupa aproximadamente 3 GB de VRAM; las variantes cuantizadas del base bajan el requisito a cifras del orden de 1-2 GB. Estas cifras son estimaciones derivadas del tamaño del modelo, no datos publicados en la ficha.
- El adaptador LoRA en sí es de tamaño reducido (el repositorio completo pesa 0,2 GB), por lo que su carga añade un coste marginal de memoria.
- Cabe en GPU de consumo: cualquier GPU con 6-8 GB de VRAM o más puede ejecutar la inferencia del modelo base con adaptador en fp16 o cuantizado (por ejemplo, RTX 3060, RTX 4060, RTX 4090).
- El entrenamiento de la receta es ligero: la model card reporta 25,1 minutos de GPU para el *baseline* y 26,3 minutos para la receta. No se especifica en la información disponible la GPU concreta empleada.
- Opciones de despliegue: al ser un adaptador PEFT, el flujo documentado es `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan en la ficha recetas específicas para vLLM, llama.cpp, Ollama o TGI con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa entre los brazos incluidos en el propio repositorio y el modelo base sin entrenar, que son los únicos datos publicados:

| Modelo | Parametros | Contexto | pass@1 (GSM8K) | pass@k (GSM8K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base, sin entrenar) | 1,5 B | 32.768 tokens | 0,39 | 0,60 | apache-2.0 | HuggingFace |
| paper-bpco-bounded-critic-1.5b, brazo baseline | 1,5 B + LoRA | Heredado del base | 0,43 | 0,66 | apache-2.0 | HuggingFace (subcarpeta `baseline`) |
| paper-bpco-bounded-critic-1.5b, brazo receta | 1,5 B + LoRA | Heredado del base | 0,41 | 0,73 | apache-2.0 | HuggingFace (raíz del repo) |

No se dispone en la información proporcionada de comparaciones con otros adaptadores o modelos de RL para GSM8K de la misma categoría.

## Limitaciones y advertencias

- El veredicto explícito del autor es "unresolved": la diferencia de -0,017 en pass@1 tiene un intervalo de confianza del 95 % que incluye el cero, por lo que no puede afirmarse superioridad de la receta.
- Con el tamaño de paso empleado, el ratio de política nunca se alejó de 1 en más de 0,0014, lo que implica que ningún mecanismo de recorte llegó a activarse y la comparación queda reducida al crítico acotado frente al no acotado.
- La evaluación se limita a GSM8K y a 120 tareas emparejadas; el tamaño muestral es reducido y los intervalos de confianza son amplios.
- Es un adaptador, no un modelo autónomo: requiere cargar previamente Qwen2.5-1.5B-Instruct y hereda sus limitaciones de sesgo, conocimiento y contexto.
- No se declaran idiomas soportados para el adaptador ni se ha validado su comportamiento multilingüe.
- No hay información sobre sesgos conocidos, tasa de alucinación ni comportamiento fuera del dominio matemático.
- Uso recomendado exclusivamente en investigación y experimentación; no se documentan pruebas de robustez ni de seguridad para producción.
- La licencia del adaptador es apache-2.0, pero el uso comercial está sujeto también a los términos del modelo base Qwen2.5-1.5B-Instruct.
- El repositorio tiene 0 descargas y 0 "likes", y la carpeta `checkpoints/` no se distribuye, por lo que solo se publican los pesos finales de cada brazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/paper-bpco-bounded-critic-1.5b
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Receta en el SDK de while-ai: https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/bpco-bounded-critic
- Repositorio whileai-sdk: https://github.com/whilehq/whileai-sdk
- Colección "Papers, replicated": https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Conjunto de datos GSM8K: https://huggingface.co/datasets/openai/gsm8k
