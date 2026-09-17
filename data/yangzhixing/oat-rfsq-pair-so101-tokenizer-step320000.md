# yangzhixing/oat-rfsq-pair-so101-tokenizer-step320000

## Resumen

El modelo `yangzhixing/oat-rfsq-pair-so101-tokenizer-step320000` es un tokenizador de acciones (action tokenizer) desarrollado por el usuario yangzhixing para el robot SO101, dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: su funcion es comprimir secuencias de acciones continuas de 6 dimensiones en un conjunto discreto de 16 tokens, empleando cuantizacion escalar finita residual (RFSQ) en dos etapas emparejadas.

El tokenizador se entreno sobre el dataset `maxlium/so101-box-to-plate` con un horizonte de 32 pasos, 8 posiciones latentes y dos etapas residuales de FSQ con niveles [8, 5, 5, 5]. Su proposito es servir como modulo de tokenizacion para entrenar politicas OAT compatibles: el repositorio se descarga y se pasa la ruta local como `policy.action_tokenizer_path`. El checkpoint corresponde al paso 320.000 de entrenamiento e incluye el estado del optimizador y del scheduler para poder continuar el entrenamiento.

La relevancia de esta publicacion es acotada y muy especializada: interesa a quienes trabajan en imitation learning y en tokenizacion discreta de acciones para robotica, no al publico general de modelos generativos. El autor reporta un MSE de reconstruccion de aproximadamente 0,0003231 medido sobre datos de entrenamiento (no validacion retenida), y publica una politica companera entrenada con este tokenizador. El repositorio no declara licencia, idiomas ni numero de parametros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador de acciones con cuantizacion escalar finita residual (RFSQ) en 2 etapas emparejadas ("paired-RFSQ") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de accion: horizonte 32, 8 posiciones latentes, 16 tokens de accion |
| Tipos de cuantizacion | FSQ con niveles [8, 5, 5, 5] por etapa y 2 etapas residuales; no disponible informacion sobre la cuantizacion de los pesos (FP32, FP16, INT8, etc.) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`action_tokenizer.safetensors`); configuracion en `tokenizer_config.json`; estado de entrenamiento en `training_state.pt` |
| Dimensiones de accion | 6 |
| Horizonte de accion | 32 pasos |
| Posiciones latentes | 8 |
| Longitud de tokenizacion | 16 tokens de accion (2 etapas residuales) |
| Niveles FSQ | [8, 5, 5, 5] |
| Normalizacion de acciones | MIN_MAX del dataset |
| Dataset de entrenamiento | `maxlium/so101-box-to-plate` |
| Paso de entrenamiento | 320.000 |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es un tokenizador de acciones basado en cuantizacion escalar finita residual (RFSQ). El esquema descrito en la model card emplea dos etapas residuales emparejadas sobre un horizonte de 32 pasos con 6 dimensiones de accion, 8 posiciones latentes y niveles FSQ [8, 5, 5, 5] por etapa. El resultado son 16 tokens de accion completos. La segunda etapa codifica el residuo no capturado por la primera, lo que permite reducir el error de reconstruccion sin aumentar excesivamente el tamano del vocabulario por etapa. Las acciones se normalizan con el esquema MIN_MAX propio del dataset.

El entrenamiento se realizo sobre el dataset `maxlium/so101-box-to-plate` y el checkpoint publicado corresponde al paso 320.000. El archivo `training_state.pt` conserva el estado del optimizador, el scheduler y el numero de paso, lo que permite continuar el entrenamiento. El autor advierte de que se requiere la implementacion personalizada `oat_rfsq_pair` de LeRobot y que las rutas de la configuracion de entrenamiento apuntan a la maquina original, por lo que pueden necesitar ajustes. No se especifica el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en principio a un tokenizador de acciones).

La metrica reportada es un MSE de reconstruccion de aproximadamente 0,0003231 a longitud completa de 16 tokens, medida en modo evaluacion sobre 1.280 ventanas procedentes de 40 episodios de entrenamiento. El propio autor indica explicitamente que no se trata de una validacion con datos retenidos (held-out), por lo que debe interpretarse como una medida de ajuste al conjunto de entrenamiento.

## Capacidades

- Tokenizacion y discretizacion de acciones continuas de 6 dimensiones para el robot SO101: convierte secuencias de horizonte 32 en 16 tokens discretos.
- Reconstruccion de acciones a partir de los tokens, con un MSE reportado de aproximadamente 0,0003231 sobre datos de entrenamiento a longitud completa de 16 tokens.
- Codificacion residual en dos etapas, pensada para reducir el error de cuantizacion respecto a un esquema FSQ de una sola etapa.
- Integracion como componente de politicas OAT compatibles mediante el parametro `policy.action_tokenizer_path` durante el entrenamiento.
- Continuidad de entrenamiento: el repositorio incluye `training_state.pt` con optimizador, scheduler y paso, lo que permite reanudar el entrenamiento.
- No realiza generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo de razonamiento (thinking mode).

## Casos de uso

- Entrenamiento de politicas OAT para el robot SO101: el tokenizador se descarga con `huggingface_hub.snapshot_download` y se pasa la ruta local como `policy.action_tokenizer_path`, de modo que la politica aprende sobre representaciones discretas de accion en lugar de sobre acciones continuas.
- Manipulacion tipo "box-to-plate" en laboratorio: al estar entrenado sobre `maxlium/so101-box-to-plate`, es el candidato natural para reproducir esa tarea concreta de pick-and-place con el brazo SO101.
- Reanudacion de experimentos de entrenamiento: gracias a `training_state.pt`, un equipo puede continuar el entrenamiento del tokenizador desde el paso 320.000 en lugar de repetirlo desde cero.
- Investigacion en tokenizacion discreta de acciones: permite comparar un esquema residual emparejado de dos etapas frente a alternativas de una sola etapa o basadas en VQ, usando el MSE de reconstruccion como metrica objetiva.
- Reduccion de la longitud de secuencia para modelado autorregresivo: representar 32 pasos de accion como 16 tokens reduce el coste computacional de un modelo de politica que opere sobre tokens discretos.
- Evaluacion de la calidad de compresion: el MSE sobre ventanas concretas permite auditar la fidelidad de la reconstruccion antes de desplegar una politica que dependa de este tokenizador.
- Adaptacion a nuevas tareas o robots: el tokenizador se puede reentrenar sobre otros datasets con la misma configuracion y servir como componente reutilizable en pipelines de imitation learning.
- Reproduccion de experimentos en LeRobot: sirve como punto de partida documentado para quienes trabajan con la implementacion personalizada `oat_rfsq_pair` y quieren verificar resultados del autor.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion | Notas |
|---|---|---|---|
| MSE de reconstruccion (16 tokens, longitud completa) | ~0,0003231 | 1.280 ventanas de 40 episodios de entrenamiento de `maxlium/so101-box-to-plate`, en modo evaluacion | No es validacion con datos retenidos (held-out), segun el propio autor |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Al no ser un modelo de lenguaje, no aplican metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El repositorio completo ocupa 0,1 GB, por lo que los pesos del tokenizador son muy ligeros en terminos de almacenamiento.
- VRAM estimada para inferencia: no disponible. El autor no publica cifras de consumo de memoria ni de latencia.
- GPU recomendadas: no disponibles. Dado el tamano del artefacto (0,1 GB de repositorio), es plausible que quepa en cualquier GPU de consumo e incluso que se pueda ejecutar en CPU, pero esta afirmacion no esta documentada por el autor y debe verificarse en la practica.
- Compatibilidad con GPU de consumo: no confirmada oficialmente. No hay datos que permitan afirmar o descartar su ejecucion en una RTX 4090 o similar.
- Opciones de despliegue: integracion via LeRobot con la implementacion personalizada `oat_rfsq_pair`; carga de pesos en safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas comparables en la informacion proporcionada. La categoria funcional seria la de tokenizadores discretos de acciones para robotica (por ejemplo, esquemas basados en VQ o FSQ de una sola etapa), pero no se han facilitado especificaciones, resultados ni licencias de ninguno de ellos, por lo que no es posible construir una comparativa con cifras.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oat-rfsq-pair-so101-tokenizer-step320000 | no disponible | horizonte 32, 8 posiciones latentes, 16 tokens | MSE de reconstruccion ~0,0003231 (entrenamiento, no held-out) | no disponible | Hugging Face, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico artefacto relacionado documentado es la politica companera `yangzhixing/oat-rfsq-pair-so101-policy-tok320k-step18000`, entrenada con este tokenizador.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al no ser un modelo de lenguaje, no aplican los sesgos tipicos de texto, pero no se ha realizado ninguna auditoria del comportamiento del tokenizador.
- Riesgo de alucinacion: no aplica en el sentido habitual. El riesgo equivalente es el error de reconstruccion de acciones, que puede producir trayectorias fisicamente invalidas o imprecisas en el robot.
- La unica metrica publicada se midio sobre datos de entrenamiento, no sobre validacion retenida, por lo que el MSE reportado puede ser optimista y no cuantifica la capacidad de generalizacion.
- Ambito de aplicacion muy restringido: el tokenizador se entreno sobre un unico dataset (`maxlium/so101-box-to-plate`) y un unico robot (SO101), con 6 dimensiones de accion y horizonte 32. Su uso fuera de ese dominio no esta validado.
- Dependencia de codigo no incluido: se requiere la implementacion personalizada `oat_rfsq_pair` de LeRobot, que no forma parte del repositorio publicado.
- Las rutas de la configuracion de entrenamiento apuntan a la maquina original del autor y pueden necesitar ajustes manuales.
- Licencia no declarada: sin licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion, lo que supone un riesgo legal en entornos de produccion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de reproducibilidad.
- Idiomas soportados: no aplica y no disponible; la ficha no declara ningun idioma.
- La fecha de creacion registrada (2026-09-17) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yangzhixing/oat-rfsq-pair-so101-tokenizer-step320000
- Politica companera: https://huggingface.co/yangzhixing/oat-rfsq-pair-so101-policy-tok320k-step18000
- Dataset de entrenamiento: https://huggingface.co/datasets/maxlium/so101-box-to-plate
- LeRobot (framework requerido): https://github.com/huggingface/lerobot
- Documentacion de `snapshot_download` de huggingface_hub: https://huggingface.co/docs/huggingface_hub/guides/download
- Resultados de busqueda web: no se ha encontrado ningun enlace relacionado con el modelo. Los resultados devueltos corresponden a localidades de la Republica Checa y no guardan relacion con este artefacto.
