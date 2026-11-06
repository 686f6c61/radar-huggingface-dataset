# zekaili/SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws128

## Resumen

SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws128 es un snapshot de solo pesos de un modelo de mundo (world model) para robotica denominado Sana-RWM, desarrollado por el usuario zekaili. Se trata de un checkpoint intermedio de un preentrenamiento a 256 px de resolucion que toma como condiciones causales la observacion visual y el estado del robot, sin memoria, y que se entrena sobre el conjunto de datos mix-v4 con conjuntos humanos de EgoVerse, acciones absolutas de efector final (EEF) y articularles, y ventanas de 33 fotogramas.

El modelo corresponde al paso de optimizador 40868 (epoch 4) de la etapa con world size 128, ejecutada en 128 GPU H200 del cluster NRT. Es relevante como artefacto de investigacion porque documenta con detalle la lineage del entrenamiento entre clusters (NSC KEF, NRT) y porque expone pesos de un modelo de mundo de aproximadamente 5B parametros orientado a la prediccion de dinamica visomotora en entornos roboticos.

No se dispone de informacion sobre la licencia, los idiomas soportados ni resultados de benchmarks publicados. El repositorio ocupa 17,9 GB y contiene unicamente los pesos consolidados en formato PyTorch (no safetensors ni GGUF), junto con metadatos del checkpoint y la receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo Sana-RWM, preentrenamiento vanilla a 256 px) |
| Parametros totales | aproximadamente 5B (segun la nomenclatura "Sana-RWM 5B" de la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventanas de 33 fotogramas en el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model_fsdp.bin`, consolidado desde FSDP) |

## Arquitectura y entrenamiento

La model card describe el modelo como un world model Sana-RWM de aproximadamente 5B parametros, preentrenado en su variante "vanilla" a 256 px. Las condiciones de entrada son la observacion (`obs`) y el estado del robot (`state`) tratadas como condiciones causales, sin modulo de memoria (`obs_statecausal`). Las acciones se representan de forma absoluta tanto para el efector final como para las articulaciones, y las secuencias se estructuran en ventanas de 33 fotogramas. El dataset es mix-v4 e incorpora conjuntos humanos de EgoVerse, con anotaciones de caption en su version v3.

El entrenamiento se ejecuto en varias etapas entre clusters, reanudando en cada salto el ultimo checkpoint completo (modelo, optimizador, scheduler y EMA) con un batch global constante de 4096 ventanas. La primera etapa cubre los pasos 0 a 31701 en NSC KEF con 64 GPU y un learning rate de 5e-5 con decaimiento coseno y warmup de 500 pasos. Posteriormente el entrenamiento se traslado a NRT con 256 GPU H200 (world size 256), manteniendo el mismo coseno, y finalmente a 128 GPU H200 (world size 128), donde se aplico un learning rate constante de 2e-5 (4e-5 para los modulos de entrada/salida de estado y accion). Tras el paso 40868 la ejecucion continuo en NSC KEF con 32 GPU como `..._from_dvh31303_ws32`.

El snapshot no incluye los pesos EMA (`model_ema_0p999.pth`), el optimizador, el scheduler ni los estados RNG por rango, por lo que no constituye un bundle reanudable de entrenamiento. Los pesos y metadatos coinciden con el SHA256 registrado en la copia NRT a NSC.

## Capacidades

- Prediccion de dinamica visomotora: modela la evolucion de la observacion condicionada al estado del robot y a las acciones absolutas de efector final y articulares.
- World modeling para robotica: genera futuros plausibles de la escena a partir de ventanas de 33 fotogramas.
- Condicionamiento causal por observacion y estado: la entrada combina imagen y estado proprioceptivo sin memoria explicita entre ventanas.
- Soporte de acciones absolutas EEF y articularles: util para politicas que operan en espacio de efector final o de articulaciones.
- Preentrenamiento sobre datos humanos (EgoVerse) y roboticos: base para posterior ajuste fino en tareas de manipulacion.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente, multilingues, vision adicional, audio ni modo thinking.

## Casos de uso

- Investigacion en world models para robotica: usar el checkpoint como inicializacion para ajuste fino en tareas de manipulacion, aprovechando el preentrenamiento a 256 px sobre mix-v4 y EgoVerse.
- Simulacion de dinamica para planificacion: emplear el modelo para predecir la evolucion de la observacion dado un estado y una secuencia de acciones, y evaluar trayectorias candidatas antes de ejecutarlas en el robot real.
- Generacion de datos sinteticos de entrenamiento: producir rollouts de observaciones condicionadas a acciones para aumentar datasets de politicas de control, con ventanas de 33 fotogramas.
- Aprendizaje por imitacion con acciones absolutas: entrenar politicas que predicen acciones EEF o articulares a partir de observaciones, usando el modelo como extractor o como modelo de transicion.
- Evaluacion de controladores en espacio latente: comparar politicas midiendo la discrepancia entre rollouts predichos y observaciones reales en entornos de laboratorio.
- Estudio de escalado y transferencia entre clusters: analizar el efecto del world size y del learning rate en el preentrenamiento de world models, dado que la model card documenta la lineage completa entre NSC KEF y NRT.
- Base para modelos de mundo con memoria: servir como punto de partida para experimentos que anadan modulo de memoria o contextos mas largos que 33 fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa para un modelo de aproximadamente 5B parametros, en FP16 se requeririan del orden de 10-11 GB solo para pesos, y en BF16 un valor similar; no se confirma el dtype de los pesos publicados.
- GPU recomendadas: el entrenamiento se ejecuto en H200 (etapas NRT) y en el cluster NSC KEF con 64 y 32 GPU; no se especifican requisitos de inferencia.
- Cabe en GPU de consumo: no confirmado. Con cuantizacion a 8 bits o 4 bits podria ser viable en GPU de 24 GB, pero no se dispone de pesos cuantizados ni de instrucciones de conversion.
- Opciones de despliegue: los pesos estan en formato PyTorch consolidado (`pytorch_model_fsdp.bin`), no en safetensors ni GGUF, por lo que no son directamente compatibles con llama.cpp, Ollama o vLLM sin conversion previa. No se documenta ningun pipeline de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models roboticos de aproximadamente 5B parametros) con datos de parametros, contexto, rendimiento o licencia que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican terminos de uso comercial ni restricciones, lo que impide evaluar su idoneidad para produccion.
- Snapshot no reanudable: no incluye pesos EMA, optimizador, scheduler ni estados RNG, por lo que no sirve para continuar el entrenamiento desde este punto.
- Checkpoint intermedio: corresponde al paso 40868 de un preentrenamiento en curso, no a un modelo final ajustado ni evaluado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- Contexto limitado a ventanas de 33 fotogramas y ausencia de memoria: puede degradarse en tareas que requieran dependencias de largo plazo.
- Formato de pesos no estandar: el binario consolidado desde FSDP requiere conversion para herramientas de inferencia habituales.
- Sesgos desconocidos: al entrenarse sobre mix-v4 y EgoVerse, puede heredar sesgos de esos datasets (entornos, morfologias y tareas sobrerrepresentadas), aunque no se documentan analisis al respecto.
- Riesgo de alucinacion en la prediccion: como modelo generativo de dinamica, puede producir rollouts fisicamente inconsistentes fuera de la distribucion de entrenamiento.
- Rutas de configuracion dependientes del cluster: el `config.yaml` contiene rutas de cluster, lo que complica la reproducibilidad fuera del entorno original.

## Enlaces

- Hugging Face: https://huggingface.co/zekaili/SANA_Vanilla_Pretrain_256px_abs_mix_v4_capv3_obs_statecausal_from_dvh31303_ws128
- Repositorio de codigo `sana-rwm`, commit `57327dcfc`, rama `rwm/yuyang`: no disponible como enlace en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
