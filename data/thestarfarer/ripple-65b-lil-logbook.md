# thestarfarer/Ripple-65B-lil-logbook

## Resumen

Ripple-65B-lil-logbook es un repositorio de adaptadores LoRA publicados por el usuario thestarfarer sobre el modelo base ricursiveAI/Ripple-65B-Base-Preview (revision 6187d110). No se trata de un modelo completo, sino de un banco de pruebas de hiperparametros: siete adaptadores LoRA entrenados con la misma receta salvo el rango (r32 y r64) y la tasa de aprendizaje (entre 1e-7 y 5e-6), sobre un corpus de rol de 512 tokens de contexto. El objetivo es documentar el efecto del rango y del learning rate en la calidad de la adaptacion, con metricas de perdida en tres conjuntos de evaluacion y una evaluacion ciega con panel de jueces LLM.

El modelo base Ripple-65B-Base-Preview tiene, por el nombre, 65.000 millones de parametros, aunque la model card del repositorio no detalla su arquitectura ni su contexto nativo. Los adaptadores se entrenaron con contexto de 544 tokens (max_length), lo que sugiere un uso muy acotado a generacion de rol de formato corto. El repositorio ocupa 20,4 GB, coherente con pesos base en bf16 mas los adaptadores y estados de entrenamiento.

La relevancia de esta ficha es limitada para produccion: se trata de un experimento de investigacion reproducible, no de un modelo listo para desplegar. Aun asi, resulta util como referencia metodologica para quienes ajustan LoRA sobre modelos grandes y quieren ver datos concretos de como el rango y el LR afectan a la coherencia, el formato y la fidelidad al dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ripple-65B-Base-Preview; adaptadores LoRA sobre transformer) |
| Parametros totales | 65B (segun nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 512 tokens en el corpus de entrenamiento; max_length 544 durante el entrenamiento |
| Tipos de cuantizacion | no disponible (pesos en safetensors; base en bf16, master LoRA en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT; base en bf16) |

## Arquitectura y entrenamiento

Los adaptadores usan rsLoRA con alpha = sqrt(512*r), de forma que la ganancia forward queda fijada en 22,6 para todos los rangos. Los modulos objetivo son q/k/v/o/gate/up/down. El entrenamiento se hizo con 400 pasos de optimizador a batch global 16 (6.400 de las 13.411 filas del corpus, pasada parcial), max_length 544, warmup de 35 pasos seguido de LR constante, master LoRA y estado del optimizador en fp32, base en bf16 y FSDP nativo sobre 2x A100-80. Los adaptadores se cargan con PEFT 0.18.0, transformers 4.57.1 y torch 2.9.1 sobre la revision fijada del modelo base. La celda r32-lr1e-7 se ejecuto con warmup 100 y se detuvo en el paso 261 sin exportar adaptador, por lo que no aparece en los resultados.

El corpus es el mismo que el del repositorio hermano Ministral-3-14B-lil-logbook: un conjunto de rol de 512 tokens de contexto. La evaluacion de perdida se hizo sobre tres conjuntos de 256 filas cada uno: in-domain (retenidas del mismo corpus), forum-RP fuera de dominio y prosa de libro. La evaluacion cualitativa uso un panel ciego de 16 jueces LLM sobre 2.631 filas agrupadas, con 151 continuaciones ocultas del corpus original como controles de calibracion, y una sonda de 62 escenas de composicion fuera de dominio con 5 rerolls cada una y sampler t0.8 / min_p 0.05 / rep 1.1.

## Capacidades

- Generacion de texto orientada a rol y ficcion, con contexto corto (512 tokens).
- Ajuste fino mediante adaptadores LoRA cargables con PEFT sobre el modelo base Ripple-65B.
- Capacidad de composicion fuera de dominio limitada: la model card reporta coherencia y formato medidos en escenas de composicion, con un porcentaje de filas "buenas" que no supera el 44,8 % en el mejor adaptador.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta soporte multilingue.
- No se documenta vision, audio ni modo thinking.
- No se documenta decodificacion especulativa ni optimizaciones de inferencia.

## Casos de uso

- Investigacion de hiperparametros LoRA: el repositorio sirve para comparar el efecto de r32 frente a r64 y de cuatro tasas de aprendizaje sobre la misma receta, con metricas de perdida y evaluacion ciega ya publicadas.
- Reproduccion de experimentos: la receta completa (rsLoRA, alpha, targets, pasos, batch, warmup, FSDP en 2x A100-80) permite replicar el entrenamiento en un entorno equivalente.
- Generacion de rol de formato corto: el mejor adaptador (r64-lr1.4e-6) alcanza un 44,8 % de filas buenas en la sonda de composicion, con un 0,3 % de colapso de formato, lo que lo hace util para prototipos de dialogo de rol acotado.
- Evaluacion de metodologia de jueces LLM: el diseno con 16 jueces, controles ocultos y ejes 0-2 es un ejemplo concreto de evaluacion ciega reutilizable en otros proyectos.
- Estudio de degradacion fuera de dominio: la tabla de perdida muestra cuanto se pierde en forum-RP y prosa de libro al aumentar el LR, util para decidir umbrales de sobreajuste.
- Base para adaptaciones posteriores: los adaptadores exportados pueden servir como punto de partida para experimentos con otros corpus o contextos mas largos, siempre que se respete la revision fijada del modelo base.

## Benchmarks y rendimiento

Perdida de evaluacion (menor es mejor; "lost" indica empeoramiento respecto a la base):

| Adaptador | In-domain | Ganancia | Forum-RP | Perdida | Libro | Perdida |
|---|---|---|---|---|---|---|
| base | 2,2995 | — | 2,5436 | — | 2,4845 | — |
| r32-lr3.7e-7 | 2,0554 | 0,244 | 2,5596 | +0,016 | 2,5052 | +0,021 |
| r32-lr1.4e-6 | 1,9818 | 0,318 | 2,6211 | +0,078 | 2,5262 | +0,042 |
| r32-lr5e-6 | 1,9091 | 0,390 | 2,6705 | +0,127 | 2,5590 | +0,075 |
| r64-lr1e-7 | 2,1646 | 0,135 | 2,5367 | -0,007 | 2,4889 | +0,004 |
| r64-lr3.7e-7 | 2,0249 | 0,275 | 2,5784 | +0,035 | 2,5097 | +0,025 |
| r64-lr1.4e-6 | 1,9568 | 0,343 | 2,6309 | +0,087 | 2,5349 | +0,050 |
| r64-lr5e-6 | 1,8903 | 0,409 | 2,6807 | +0,137 | 2,5637 | +0,079 |

Evaluacion ciega con panel de jueces (ejes 0-2; "bueno" = suma >= 5):

| Modelo | Voz | Coherencia | Formato | Bueno % | Deriva % | Colapso % | Coh. limpia |
|---|---|---|---|---|---|---|---|
| base | 1,26 | 1,13 | 1,12 | 32,3 | 17,4 | 27,4 | 1,48 |
| r32-lr3.7e-7 | 1,38 | 0,96 | 1,60 | 31,6 | 17,4 | 9,0 | 1,03 |
| r32-lr1.4e-6 | 1,42 | 1,03 | 1,77 | 43,5 | 13,2 | 5,5 | 1,03 |
| r32-lr5e-6 | 1,40 | 0,81 | 1,72 | 34,8 | 29,7 | 2,9 | 0,91 |
| r64-lr1e-7 | 1,43 | 1,20 | 1,47 | 38,1 | 10,6 | 10,6 | 1,37 |
| r64-lr3.7e-7 | 1,40 | 0,97 | 1,65 | 36,1 | 15,2 | 8,4 | 1,03 |
| r64-lr1.4e-6 | 1,44 | 1,07 | 1,84 | 44,8 | 13,5 | 0,3 | 1,07 |
| r64-lr5e-6 | 1,34 | 0,75 | 1,75 | 32,6 | 34,8 | 4,2 | 0,86 |
| controles fuente | 1,89 | 1,92 | 1,95 | 96,0 | 0,0 | 0,0 | 1,94 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El modelo base de 65B en bf16 requiere aproximadamente 130 GB de VRAM solo para pesos, sin contar cache KV ni overhead; no cabe en GPU de consumo.
- Los adaptadores LoRA son ligeros, pero requieren cargar el modelo base completo para inferencia.
- GPU recomendadas para el modelo base: multiples A100-80 o H100-80; el entrenamiento documentado uso 2x A100-80 con FSDP nativo.
- No cabe en GPU de consumo (RTX 4090, 24 GB) sin cuantizacion agresiva del base, que no esta documentada en el repositorio.
- Opciones de despliegue: PEFT 0.18.0 con transformers 4.57.1 y torch 2.9.1, segun la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-lil-logbook | 65B (base) | 512 tokens de entrenamiento | no disponible | Banco de pruebas LoRA (r32/r64, barrido de LR) | Hugging Face, safetensors |
| Ministral-3-14B-lil-logbook | 14B (base) | no disponible | no disponible | Mismo corpus de rol, receta LoRA hermana | Hugging Face |
| Ripple-65B-Base-Preview | 65B | no disponible | no disponible | Modelo base sin adaptar | Hugging Face (revision 6187d110) |

No se dispone de datos de benchmarks estandar para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo completo: son adaptadores LoRA que requieren el modelo base Ripple-65B-Base-Preview en la revision 6187d110 para funcionar.
- Contexto muy limitado: 512 tokens de entrenamiento y max_length 544, insuficiente para conversaciones largas o documentos.
- El mejor adaptador alcanza solo un 44,8 % de filas buenas en la sonda de composicion, frente al 96,0 % de los controles fuente; la calidad dista mucho de la del corpus original.
- Aumentar el LR mejora la perdida in-domain pero degrada forum-RP y prosa de libro (hasta +0,137 y +0,079 respectivamente en r64-lr5e-6), lo que indica sobreajuste al dominio.
- La coherencia media cae respecto a la base en casi todos los adaptadores (de 1,13 a 0,75-1,20), con derivas de hasta el 34,8 % en r64-lr5e-6.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas no documentados: no hay garantia de comportamiento multilingue.
- No se documentan sesgos, pero el corpus es de rol y ficcion, con el riesgo de reproducir estereotipos presentes en ese tipo de datos.
- Riesgo de alucinacion no evaluado en la model card; la evaluacion se centra en coherencia, formato y voz, no en veracidad.
- Los umbrales compuestos de la evaluacion tienen un suelo de ruido entre cohortes de varios puntos; solo las columnas por eje se reproducen con r >= 0,94 entre cohortes independientes.
- La celda r32-lr1e-7 se detuvo sin exportar adaptador, por lo que el barrido no esta completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thestarfarer/Ripple-65B-lil-logbook
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Repositorio hermano: https://huggingface.co/thestarfarer/Ministral-3-14B-lil-logbook
- Toolkit de herramientas: https://github.com/thestarfarer/ripple-65b-toolkit
