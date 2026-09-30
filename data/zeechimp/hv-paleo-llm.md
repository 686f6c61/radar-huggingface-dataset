# zeechimp/hv-paleo-llm

## Resumen

paleo-llm es un experimento de arquitectura y ablacion publicado por el usuario zeechimp en Hugging Face, no un modelo de lenguaje preentrenado. Consiste en una arquitectura transformer de siete "cores", cada uno un `nn.Module` independiente bautizado con nombres de dinosaurios (Pterosaur, Raptor, T-Rex, Sauropod, Triceratops, Ankylosaurus y Archaeopteryx), inspirada en el issue #50 del proyecto XuanJi. El modelo entrena desde cero sobre una tarea sintetica y trivial: Fibonacci modulo 8. No se publican pesos preentrenados; el repositorio contiene aproximadamente 18 KB de codigo fuente en PyTorch y el benchmark completo se ejecuta en torno a un minuto en CPU.

El hallazgo central del autor es contundente: de los siete cores, solo uno hace trabajo real. El core T-Rex, que internamente no es mas que atencion causal multi-cabeza con esparsificacion top-k en los canales de salida, alcanza por si solo una precision de validacion de 0,9195, frente a 0,9634 cuando se activan los siete cores y 0,1242 cuando no se activa ninguno (el azar en esta tarea es 0,125). Todos los demas cores se quedan en niveles de azar tanto solos como combinados entre si. El propio autor advierte que los nombres de dinosaurios son decoracion mnemotecnica y no describen la matematica subyacente.

La relevancia del artefacto es metodologica y educativa: sirve como demostracion reproducible de un proceso de ablacion arquitectonica sobre hardware modesto, con 16 de 16 comprobaciones de consistencia superadas, y como recordatorio de que anadir modulos residuales a un transformer no garantiza que aporten capacidades distintas. No debe confundirse con un LLM operativo: no tiene pesos, no tiene corpus de entrenamiento general y no genera lenguaje de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer experimental de 7 cores en pila residual (Pterosaur, Raptor, T-Rex, Sauropod, Triceratops, Ankylosaurus, Archaeopteryx) |
| Parametros totales | ~210.000 con los 7 cores activos; ~37.000 solo con T-Rex (configuracion d_model=64, n_layers=2, max_seq_len=32) |
| Parametros activos | no aplica (no es un modelo MoE; la ablation activa subconjuntos de cores en tiempo de entrenamiento, no de inferencia) |
| Longitud de contexto | configurable via `max_seq_len`; el ejemplo de la model card usa 32 |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | no disponible (el modelo entrena en una tarea sintetica, no en texto natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene ~18 KB de codigo fuente PyTorch, sin checkpoints) |

## Arquitectura y entrenamiento

El modelo implementa siete cores como modulos `nn.Module` independientes que procesan un estado oculto de forma secuencial con forma (B, T, D). El estado atraviesa los siete cores en un orden fijo que se repite `n_layers` veces. Cada core tiene asignado un rol algoritmico real: Pterosaur es una proyeccion de rango bajo a traves de un intermedio complejo cuyo modulo se conserva (capa de compresion); Raptor son MLPs independientes por canales divididos (paralelismo); T-Rex es atencion causal multi-cabeza con esparsificacion top-k en los canales de salida; Sauropod es una FFN ancha; Triceratops aplica atenuacion de anomalias mediante estadisticos en ejecucion; Ankylosaurus es una reparacion residual con compuerta; y Archaeopteryx introduce un sesgo de canal de escala temporal lenta. El autor insiste en que la nomenclatura biologica describe una intuicion de diseno, no una estructura matematica.

El entrenamiento se realiza integramente desde cero sobre la tarea sintetica Fibonacci-mod-8, sin corpus de texto, sin RLHF ni DPO. La configuracion base (210.000 parametros, 7 cores) alcanza 0,9634 de precision de validacion tras 300 pasos en aproximadamente 16 segundos de CPU. El escalado en profundidad no mejora el resultado en esta tarea: 1 capa da 0,958, 2 capas 0,963 y 4 capas 0,958. La unica dependencia declarada es PyTorch.

## Capacidades

- Entrenamiento desde cero de una arquitectura transformer modular minima sobre una tarea sintetica cerrada (Fibonacci modulo 8).
- Ejecucion de experimentos de ablacion sistematica por subconjuntos de cores, con resultados reproducibles.
- Generacion de texto: el pipeline declarado en Hugging Face es `text-generation`, pero al no existir pesos preentrenados ni corpus de lenguaje, no hay generacion de texto natural utilizable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Reproduccion de experimentos de ablacion: el repositorio permite reentrenar cada subconjunto de cores con `train_model(config, active_cores={...}, steps=300)` y verificar que solo T-Rex aporta senal, util como ejercicio guiado de metodologia cientifica.
- Docencia sobre atencion y arquitecturas residuales: sirve para ilustrar en clase, con un presupuesto de CPU de segundos, que una pila de modulos aparentemente heterogeneos puede colapsar funcionalmente a un unico bloque de atencion.
- Verificacion de pipelines de entrenamiento: al ser un modelo diminuto con 16 de 16 comprobaciones de consistencia superadas y tiempo de ejecucion de ~1 minuto, es adecuado como prueba de humo para entornos de CI que necesiten validar un pipeline de PyTorch end-to-end.
- Estudio de esparsificacion top-k en atencion causal: el core T-Rex aislado (37.000 parametros, 0,9195 de precision) permite analizar el efecto de la esparsificacion en los canales de salida sin el ruido del resto de cores.
- Analisis de redundancia arquitectonica: el contraste entre "todos los cores" (0,9634), "todos menos T-Rex" (0,1261) y "sin cores" (0,1242) ofrece un caso de estudio cuantificado sobre modulos que no se ganan su lugar en la pila.
- Base para prototipos de arquitecturas residuales experimentales: el codigo, licenciado bajo MIT, puede reutilizarse como esqueleto para probar nuevos cores o reordenamientos, siempre sobre tareas sinteticas controladas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la tarea sintetica Fibonacci-mod-8 (el azar es 0,125):

| Configuracion | Precision final |
|---|---|
| Todos los 7 cores | 0,9634 |
| Solo T-Rex | 0,9195 |
| Todos menos T-Rex | 0,1261 |
| Sin cores | 0,1242 |
| Solo Pterosaur | 0,1223 |
| Solo Raptor | 0,1258 |
| Solo Sauropod | 0,1241 |
| Solo Ankylosaurus | 0,1229 |

Escalado en profundidad (configuracion con los 7 cores):

| Numero de capas | Precision final |
|---|---|
| 1 capa | 0,958 |
| 2 capas | 0,963 |
| 4 capas | 0,958 |

No se han publicado resultados en benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K ni similares), y no tendria sentido medirlos: el modelo no es un LLM preentrenado. El autor reporta ademas que 16 de 16 comprobaciones de consistencia pasan.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no se distribuye con pesos y se entrena e infiere en el mismo proceso.
- GPU recomendadas: ninguna en particular; el diseno esta pensado para CPU.
- Cabe en GPU de consumo: si, en cualquier GPU e incluso sin GPU. El baseline completo son 210.000 parametros y ~16 segundos de CPU.
- Opciones de despliegue: no disponible como servicio; no hay checkpoints para vLLM, llama.cpp, Ollama o TGI. La unica via de ejecucion es importar el paquete PyTorch `paleo_llm` y llamar a `train_model` / `evaluate`.
- Latencia y throughput: no se reportan metricas de tokens por segundo. El dato temporal disponible es de ~16 segundos para 300 pasos de entrenamiento en la configuracion base en CPU, y ~1 minuto para el benchmark completo.

## Comparativa con modelos similares

No disponible. El artefacto no es comparable con LLM preentrenados (Llama, Mistral, Qwen, etc.) porque carece de pesos, corpus de lenguaje y evaluacion en tareas de lenguaje. Tampoco se identifican en la informacion proporcionada otros repositorios de ablacion arquitectonica equivalentes con los que contrastarlo. Las busquedas web realizadas devuelven unicamente agregadores genericos de rankings de LLM (benchlm.ai, llmboard.ai, llmindex.net, artificialanalysis.ai) que no contienen este modelo ni alternativas de su misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: no hay pesos preentrenados, no hay corpus de entrenamiento general y no genera texto de proposito general.
- Entrena exclusivamente en una tarea sintetica (Fibonacci modulo 8), por lo que no generaliza a ningun dominio real ni a lenguaje natural.
- Los nombres de dinosaurios de los cores son decorativos y no describen su matematica; el propio autor lo advierte de forma explicita.
- El resultado de la ablation esta acotado a esa unica tarea y a configuraciones pequenas (d_model=64, hasta 4 capas); no debe extrapolarse a modelos mayores.
- Sesgos conocidos: no disponibles; al no haber datos de entrenamiento en lenguaje natural no se han medido sesgos sociales o linguisticos.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero el pipeline `text-generation` de Hugging Face puede inducir a confundirlo con un LLM operativo.
- Limitaciones de contexto e idioma: la ventana de contexto es un parametro de configuracion (`max_seq_len`, 32 en el ejemplo) y no existe soporte multilingue.
- Restricciones de licencia: la licencia MIT permite uso comercial del codigo, pero el artefacto no tiene aplicacion productiva directa.
- Caveat para produccion: no desplegar como servicio de generacion de texto; la fecha de creacion del repositorio (2026-09-30) figura como futura respecto a los datos habituales y no se aportan pesos verificables.

## Enlaces

- Hugging Face: https://huggingface.co/zeechimp/hv-paleo-llm
- Issue #50 de XuanJi (referencia de inspiracion citada por el autor): no disponible como URL directa en la informacion proporcionada.
- Repositorio de codigo: no disponible (se distribuye como paquete PyTorch `paleo_llm` segun la model card).
- Paper o blog tecnico: no disponible.
- Demos: no disponible.
- Resultados de busqueda web: benchlm.ai, llmboard.ai, llmindex.net y artificialanalysis.ai, todos ellos agregadores genericos de rankings de LLM sin relacion con este artefacto.
