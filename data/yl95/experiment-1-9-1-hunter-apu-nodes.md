# YL95/experiment-1.9.1-hunter-apu-nodes

## Resumen

El modelo YL95/experiment-1.9.1-hunter-apu-nodes es un trabajo de investigacion publicado en HuggingFace por el autor YL95, orientado a tareas de ranking en el ambito financiero y de series temporales. Se trata de un "Twelve-Node Hunter Ranker" de 1.069.302.417 parametros (aproximadamente 1,07 mil millones), entrenado como continuacion del Experimento 1.9 a partir de su mejor checkpoint, en el paso 328 sobre 104.960 muestras programadas. La arquitectura concreta del modelo no se describe en la model card, y el pipeline de HuggingFace no esta declarado.

El modelo se entrena sobre doce nodos AMD Instinct MI300A con cuatro workers de GPU cada uno (48 workers en total), usando calculo en BF16 con pesos maestros en FP32 y optimizador Adam. El entrenamiento emplea un learning rate por actualizacion limitado a 0,00006 y un batch global que pasa de 320 a 1536, con microbatch 2 y acumulacion de gradientes balanceada. Se restauran el estado de Adam y del sampler, y se resemillan los flujos RNG para 48 workers, por lo que, segun el propio autor, no se trata de una continuacion bit a bit.

La relevancia de esta publicacion es fundamentalmente de caracter experimental: se documenta infraestructura de entrenamiento distribuido sobre aceleradores MI300A, se publican exportaciones de inferencia y eventos de TensorBoard, y se advierte explicitamente de que es software de investigacion y no un sistema de trading validado. El modelo no dispone de licencia declarada y el repositorio aparece con un tamano de 0,0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (descrito como "ranker" para finanzas y series temporales; estructura interna no especificada) |
| Parametros totales | 1.069.302.417 (aproximadamente 1,07 mil millones) |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con soporte PyTorch; se publican tambien eventos de TensorBoard) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un ranker de doce nodos ("Twelve-Node Hunter Ranker") y hereda la arquitectura del Experimento 1.9, sin modificaciones ("The parent architecture and pinned data/monitoring split are unchanged"). No se detalla en la informacion disponible si se trata de un transformer, un modelo MoE, un SSM o una arquitectura hibrida, ni el mecanismo de atencion o la composicion exacta de las capas. El dato objetivo disponible es el numero de parametros (1.069.302.417) y el hecho de que la tarea es de ranking sobre datos financieros y de series temporales, en ingles.

En cuanto al entrenamiento, el run documenta una infraestructura de doce nodos AMD MI300A con cuatro workers de GPU por nodo (48 workers). Se emplea computo BF16 con pesos maestros FP32 y estado Adam, un learning rate por actualizacion limitado a 0,00006, y un batch global que aumenta de 320 a 1536 con microbatch 2 y acumulacion de gradientes balanceada. El autor indica que se restauran los estados de Adam y del sampler y se resemillan los flujos RNG para 48 workers, aclarando que esto "no es una continuacion bit a bit". La metrica de monitorizacion heredada del modelo padre es un Spearman de 0,08534306347402562, que el propio autor aclara que no constituye un resultado de test de esta version 1.9.1. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- La informacion disponible describe el modelo como un "ranker" orientado a finanzas y series temporales, por lo que su capacidad principal seria la ordenacion o puntuacion de elementos (ranking) en ese dominio.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas o vision.
- No se menciona soporte de tool calling ni function calling.
- No se menciona soporte para agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo declara unicamente el idioma ingles (en).
- No se describen capacidades especiales (modo thinking, vision, audio u otras).
- Se publican exportaciones de inferencia ("best/latest inference exports"), lo que sugiere que el modelo es ejecutable para inferencia, aunque no se detallan sus entradas y salidas.

## Casos de uso

- Ranking de activos financieros: el modelo estaria disenado para puntuar u ordenar instrumentos financieros a partir de senales de series temporales, generando un orden que podria alimentar estrategias cuantitativas.
- Investigacion en series temporales: serviria como banco de pruebas para estudiar tecnicas de ranking sobre datos temporales financieros, dado su caracter experimental.
- Reproduccion de experimentos de entrenamiento distribuido: el run documenta configuracion de 12 nodos MI300A, batch global, learning rate y resemillado de RNG, por lo que es util como referencia para quienes disenan pipelines de entrenamiento multi-nodo.
- Analisis de infraestructura con aceleradores AMD MI300A: los reportes agregados y eventos de TensorBoard permiten estudiar el comportamiento de entrenamiento sobre esta plataforma.
- Monitorizacion de validacion en tiempo de entrenamiento: la rutina de checkpoints cada cinco minutos puede reutilizarse como plantilla de validacion periodica en proyectos de investigacion.
- Punto de partida para fine-tuning experimental: al publicarse exportaciones de inferencia y heredarse una arquitectura padre, podria emplearse como base para experimentos derivados en el mismo dominio (con las cautelas de licencia indicadas mas abajo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico valor numerico reportado es el Spearman de monitorizacion del modelo padre (0,08534306347402562), que el propio autor aclara que no es un resultado de test del modelo 1.9.1.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,07 mil millones de parametros, en FP16 el peso ocuparia aproximadamente 2,1 GB, y en FP32 alrededor de 4,3 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados.
- GPU recomendadas para entrenamiento: el run documentado emplea doce nodos AMD Instinct MI300A con cuatro workers cada uno (48 workers en total), con computo BF16 y pesos maestros FP32.
- GPU para inferencia: no se especifican; por tamano, el modelo cabria en GPUs de consumo como las series RTX 4090 o RTX 3090, aunque esta afirmacion no esta confirmada por el autor.
- Cabe en consumer GPU: probablemente si, dado el tamano (aproximadamente 1,07 mil millones de parametros), aunque no se aporta confirmacion oficial.
- Opciones de despliegue: no disponibles; la model card no indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la arquitectura concreta no esta documentada, por lo que no puede verificarse el soporte en estas herramientas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (rankers financieros o de series temporales con especificaciones publicadas), y no se aportan datos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- El modelo se declara como software de investigacion, no como un sistema de trading validado ni asesoramiento financiero ("This is research software, not a validated trading system or financial advice").
- No se han publicado resultados de benchmarks ni de test propios de esta version; el unico valor reportado pertenece al modelo padre y no debe interpretarse como rendimiento de 1.9.1.
- La metrica de monitorizacion del padre (Spearman de aproximadamente 0,085) es baja y no equivale a una validacion de calidad predictiva.
- La licencia no esta declarada, lo que implica incertidumbre legal sobre su uso comercial o redistribucion.
- El idioma soportado es unicamente ingles (en), sin evidencia de capacidades multilingues.
- La arquitectura, la longitud de contexto y los tipos de cuantizacion no estan disponibles, lo que dificulta evaluar su integracion en produccion.
- Las exportaciones publicas de inferencia no permiten reanudar el entrenamiento; los checkpoints completos de Adam/RNG/sampler se respaldan en un repositorio privado separado no publicado.
- El repositorio aparece con 0,0 GB de tamano y 0 descargas y 0 "likes" en el momento de la consulta, lo que sugiere que los pesos podrian no estar efectivamente disponibles o que el artefacto esta incompleto.
- No hay evidencia publica de que la barrera de hardware de 48 GPU se haya alcanzado ni de que el entrenamiento haya comenzado; el propio autor remite a los informes de scheduler, preflight, migracion y finalizacion para conocer el estado observado.
- Riesgo de alucinacion y sesgos conocidos: no disponibles (no se documentan, y el modelo no es de proposito general).

## Enlaces

- HuggingFace: https://huggingface.co/YL95/experiment-1.9.1-hunter-apu-nodes
- TensorBoard: https://huggingface.co/YL95/experiment-1.9.1-hunter-apu-nodes/tensorboard
- Codigo fuente (GitHub): https://github.com/YLiu95/MSc-new-experiments/tree/main/experiment%201.9.1%20Hunter%20apu%20nodes
- Modelo base: https://huggingface.co/YL95/experiment-1.9-hunter-apu-nodes
