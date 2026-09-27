# sri-harini-m/anlp-a2-part2

## Resumen

`sri-harini-m/anlp-a2-part2` no es un modelo publicado como producto, sino un artefacto de investigacion academica: un repositorio de HuggingFace que contiene cinco checkpoints del mismo transformer decoder-only denso, preentrenado desde cero una sola pasada sobre el corpus `browndw/human-ai-parallel-corpus`, una vez por cada optimizador evaluado (AdamW, NAdamW, Lion, Muon y Sophia-G). El autor es el usuario `sri-harini-m` y el material se enmarca en un trabajo de asignatura ("ANLP Assignment 2, Part 2: Optimizers"), con los registros de entrenamiento alojados en un proyecto publico de WandB.

El valor del repositorio es metodologico: al mantener fijos arquitectura, datos, tokenizador y presupuesto de entrenamiento, aisla el efecto del optimizador sobre la perdida de validacion y el BLEU de test. Eso permite comparaciones controladas y reproducibles entre reglas de actualizacion implementadas desde cero como subclases de `torch.optim.Optimizer`, algo poco frecuente en materiales publicos.

Ahora bien, sus credenciales de publicacion son minimas: cero descargas y cero "likes" en el momento de la consulta, ausencia total de licencia declarada, idiomas no especificados, sin pipeline asociado y sin model card mas alla de la tabla de resultados. La busqueda web no devolvio ningun resultado relacionado con este repositorio. Debe tratarse, por tanto, como material de estudio y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (causal), definido en PyTorch |
| Parametros totales | No disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (unicamente checkpoints PyTorch en punto flotante; no se incluyen versiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | PyTorch `.pt` (diccionario con `model_cfg` y `model`, cargado con `torch.load`) |
| Autor | sri-harini-m |
| Fecha de creacion | 27 de septiembre de 2026 |
| Ultima actualizacion | 27 de septiembre de 2026 |
| Tamano del repositorio | 1,2 GB |
| Checkpoints incluidos | 5 (`adamw/final.pt`, `nadamw/final.pt`, `lion/final.pt`, `muon/final.pt`, `sophia/final.pt`) |
| Corpus de entrenamiento | `browndw/human-ai-parallel-corpus` |
| Descargas / likes | 0 / 0 |
| Etiquetas | `region:us` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso (sin mezcla de expertos ni componentes de espacio de estados), instanciado a partir de una clase `DecoderOnlyTransformer` con su `TransformerConfig`. El repositorio no incluye el codigo del modelo: cada checkpoint guarda la configuracion (`model_cfg`) y el `state_dict`, pero para reconstruir el modelo hay que ejecutar el codigo de la asignatura, que aporta el paquete `src.models`. Esto implica que la arquitectura exacta (numero de capas, dimensiones, cabezas de atencion, tipo de positional encoding, tokenizador) no puede determinarse solo con la informacion publicada.

El protocolo de entrenamiento es estrictamente controlado: el mismo transformer se preentrena desde cero durante una unica pasada sobre `browndw/human-ai-parallel-corpus`, repitiendo el proceso una vez por optimizador. Todos los optimizadores estan implementados desde cero como subclases de `torch.optim.Optimizer`, lo que constituye la innovacion tecnica del trabajo: no se usan las implementaciones de la libreria estandar. Cada variante se entreno con su propio pico de learning rate, sin que la model card detalle el scheduler, el tamano de batch, la precision numerica ni el numero de tokens vistos. La metrica declarada es perdida de validacion final y BLEU de test final, esta ultima coherente con un corpus paralelo y una tarea de generacion condicionada, aunque la model card no especifica si el BLEU esta en escala 0-1 o 0-100.

## Capacidades

- Generacion de texto autoregresiva: es un modelo de lenguaje causal, por lo que su capacidad basica es continuar texto token a token.
- Generacion condicionada por entrada (estilo traduccion o transformacion texto a texto), inferida del uso de BLEU sobre un corpus paralelo como metrica de evaluacion; no se documenta la tarea concreta ni el par de idiomas.
- Reproduccion de experimentos de optimizacion: permite recalcular la curva de perdida y el BLEU asociados a cada regla de actualizacion.
- Inspeccion de estados de optimizador: cada checkpoint corresponde a un entrenamiento completo con una regla distinta, util para estudiar estabilidad y sensibilidad al learning rate.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo "thinking", vision, audio, decodificacion especulativa): no documentadas.
- Ajuste fino posterior: tecnicamente posible al ser pesos PyTorch estandar, pero requiere reconstruir el codigo del modelo.

## Casos de uso

- Reproduccion de la comparativa de optimizadores: cargar los cinco checkpoints y recalcular perdida de validacion y BLEU para verificar los valores publicados (3,2793-4,2143 de perdida y 0,42-0,75 de BLEU), evaluando la robustez del resultado.
- Estudio empirico de Muon frente a AdamW: el checkpoint de Muon obtiene la mejor perdida de validacion (3,2793) frente a AdamW (3,4580), lo que permite analizar en que condiciones una actualizacion basada en matrices supera a la baseline adaptativa.
- Analisis del compromiso memoria-rendimiento de Lion: Lion alcanza la peor perdida (4,2143) con el learning rate mas bajo (4,0e-04); el checkpoint sirve para estudiar si el problema es la regla de actualizacion o el ajuste de hiperparametros.
- Material docente para cursos de NLP: los checkpoints ilustran de forma tangible como una unica decision de optimizacion cambia la perdida final en mas de 0,9 puntos absolutos sobre datos y arquitectura identicos.
- Punto de partida para ajuste fino experimental: al ser pesos densos estandar, se pueden usar como inicializacion en tareas pequeñas de generacion, siempre que se reconstruya el modelo con `src.models`.
- Ablacion de tecnicas de optimizacion de segundo orden: el checkpoint de Sophia-G (con informacion de Hessiano aproximada) permite comparar empiricamente su comportamiento con el de metodos de primer orden en el mismo presupuesto.
- Prueba de infraestructura de entrenamiento: por su tamano reducido, sirve para validar pipelines de carga, registro en WandB y evaluacion de BLEU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La unica informacion de rendimiento publicada es la tabla de la model card, que compara los cinco optimizadores con la misma arquitectura, datos y numero de pasos:

| Optimizador | Carpeta | Pico de learning rate | Perdida de validacion final | BLEU de test final |
|---|---|---|---|---|
| AdamW (baseline) | `adamw/` | 1,0e-03 | 3,4580 | 0,56 |
| NAdamW (reduccion de varianza) | `nadamw/` | 2,0e-03 | 3,4205 | 0,75 |
| Lion (eficiente en memoria) | `lion/` | 4,0e-04 | 4,2143 | 0,42 |
| Muon (basado en matrices) | `muon/` | 4,0e-03 | 3,2793 | 0,66 |
| Sophia-G (Hessiano, bonus) | `sophia/` | 3,0e-04 | 3,8995 | 0,52 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. Tampoco se especifica la escala del BLEU (0-1 o 0-100), la composicion del conjunto de test ni el numero de pasos de entrenamiento, por lo que las cifras no son comparables con resultados de la literatura sin conocer esos detalles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa. Estimacion indirecta: el repositorio pesa 1,2 GB y contiene cinco checkpoints, es decir, unos 240 MB por checkpoint; en `float32` eso equivaldria a del orden de 60 millones de parametros y en `float16` a unos 120 millones, cifras que no deben tomarse como confirmadas porque se desconoce la precision de almacenamiento y si los ficheros incluyen estado adicional.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente para un modelo de esta escala; no se justifica el uso de A100, H100 ni similares.
- Compatibilidad con GPU de consumo: si, cabe con holgura en GTX 1650, RTX 3060, RTX 4090 y equivalentes, e incluso es viable la inferencia en CPU.
- Opciones de despliegue: no hay soporte directo para vLLM, TGI, llama.cpp u Ollama, ya que no existen pesos en formato GGUF ni configuracion compatible con `transformers.AutoModel`. El unico camino documentado es `torch.load` mas la clase `DecoderOnlyTransformer` del repositorio de codigo de la asignatura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicados comparables, porque este repositorio no compite en la categoria de modelos de proposito general: es un artefacto de asignatura sin licencia, sin idiomas declarados y sin evaluacion estandar. La unica comparacion significativa es interna, entre los cinco checkpoints:

| Variante | Perdida de validacion | BLEU de test | Pico de lr | Posicion relativa |
|---|---|---|---|---|
| Muon | 3,2793 | 0,66 | 4,0e-03 | Mejor perdida de validacion |
| NAdamW | 3,4205 | 0,75 | 2,0e-03 | Mejor BLEU, segunda mejor perdida |
| AdamW | 3,4580 | 0,56 | 1,0e-03 | Baseline de referencia |
| Sophia-G | 3,8995 | 0,52 | 3,0e-04 | Peor que la baseline en ambas metricas |
| Lion | 4,2143 | 0,42 | 4,0e-04 | Peor en ambas metricas |

Para modelos alternativos de la misma categoria (transformers pequeños de investigacion) no hay datos en la informacion proporcionada que permitan una comparacion justa.

## Limitaciones y advertencias

- Ausencia total de licencia: al no declararse una licencia, no hay autorizacion explicita de uso comercial ni de redistribucion; en la practica, se aplican las restricciones por defecto del derecho de autor.
- Artefacto de asignatura sin mantenimiento: no hay garantia de soporte, correcciones ni versionado futuro.
- Dependencia de codigo externo: los checkpoints solo son cargables con el repositorio de codigo de la asignatura (`src.models`); sin el, los pesos son inutilizables directamente.
- Entrenamiento minimo: una sola pasada sobre el corpus, lo que implica una calidad de generacion muy limitada y un BLEU bajo en terminos absolutos, sea cual sea la escala de la metrica.
- Riesgo de alucinacion: es un modelo de lenguaje causal entrenado desde cero con datos limitados; no hay filtrado ni alineacion documentados (no se menciona RLHF, DPO ni instruccion tuning), por lo que la generacion puede ser incoherente, repetitiva o factualmente incorrecta.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o equidad. El corpus declarado (`browndw/human-ai-parallel-corpus`) no se describe en la model card, por lo que se desconoce su composicion y los sesgos que podria transferir.
- Limitaciones de contexto e idioma: sin datos publicados sobre longitud de contexto ni idiomas cubiertos; no debe asumirse soporte multilingue.
- Ambiguedad metrica: la escala del BLEU (0-1 o 0-100) y el conjunto de evaluacion no estan especificados, lo que impide comparar las cifras con resultados externos.
- No apto para produccion: sin cuantizacion, sin integracion con servidores de inferencia y sin evaluacion de seguridad, su uso debe limitarse a experimentacion y docencia.
- Cero adopcion verificable: 0 descargas y 0 "likes", sin issues ni discusion, lo que reduce la probabilidad de detectar errores en los pesos publicados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sri-harini-m/anlp-a2-part2
- Checkpoint AdamW: https://huggingface.co/sri-harini-m/anlp-a2-part2/tree/main/adamw
- Checkpoint NAdamW: https://huggingface.co/sri-harini-m/anlp-a2-part2/tree/main/nadamw
- Checkpoint Lion: https://huggingface.co/sri-harini-m/anlp-a2-part2/tree/main/lion
- Checkpoint Muon: https://huggingface.co/sri-harini-m/anlp-a2-part2/tree/main/muon
- Checkpoint Sophia-G: https://huggingface.co/sri-harini-m/anlp-a2-part2/tree/main/sophia
- Registros de entrenamiento en WandB: https://wandb.ai/sriharini-m-iiit-hyderabad/anlp-assignment-2
- Corpus de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Nota sobre la busqueda web: las consultas realizadas solo devolvieron paginas de organizaciones y conceptos ajenos al repositorio (el Syndicat des Regies Internet, un fabricante de valvulas, un gabinete de administracion de fincas y el indicador sintetico de riesgo financiero), todas ellas sin relacion con el modelo. No se han encontrado papers, blogs ni demostraciones asociados.
