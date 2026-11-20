# ZhengyanWan/dFlowGRPO-PickScore-rate1

## Resumen

dFlowGRPO-PickScore-rate1 es un adaptador LoRA publicado por ZhengyanWan que se aplica sobre el modelo base FUDOKI (LucasJinWang/FUDOKI). El adaptador se ha entrenado mediante dFlowGRPO, una variante de optimizacion por politica proximal con recompensa (GRPO) aplicada a modelos de flujo discreto, utilizando PickScore como funcion de recompensa y configurando el muestreo con una unica muestra por paso de rollout (rate1). El punto de control publicado corresponde al paso de entrenamiento 6300.

El interes de esta publicacion es metodologico: demuestra como aplicar tecnicas de RLHF ligeras (LoRA + GRPO) sobre un modelo de flujo discreto orientado a la generacion de imagenes, optimizando directamente una metrica de preferencia estetica como PickScore. No se trata de un modelo de lenguaje ni de un modelo generativo autonomo, sino de un artefacto de investigacion que requiere el modelo base FUDOKI y el codigo del repositorio dFlowGRPO para su uso.

El repositorio es muy pequeno (0,1 GB) y contiene unicamente los pesos del adaptador en formato safetensors. No se han publicado datos de arquitectura detallados, idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de flujo discreto (FUDOKI); arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre FUDOKI, un modelo base cuyo tipo exacto no se detalla en la informacion disponible, aunque el nombre del proyecto (dFlowGRPO) y la naturaleza discreta del flujo sugieren un modelo generativo basado en flujos discretos, probablemente orientado a imagenes dado el uso de PickScore como recompensa. El adaptador emplea la tecnica LoRA (Low-Rank Adaptation) a traves de la libreria PEFT, lo que permite un ajuste eficiente en parametros sin modificar los pesos del modelo base.

El entrenamiento utiliza dFlowGRPO, una adaptacion de GRPO (Group Relative Policy Optimization) al contexto de flujos discretos, con PickScore como funcion de recompensa. La configuracion "rate1" indica que en cada paso de rollout se emplea una unica muestra. El checkpoint publicado corresponde al paso 6300. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron etapas adicionales de RLHF o DPO mas alla del propio GRPO.

## Capacidades

- Generacion condicionada por preferencia estetica: al estar optimizado con PickScore, el adaptador modula el modelo base para producir salidas alineadas con preferencias humanas de estetica visual.
- Ajuste eficiente mediante LoRA: solo se actualizan los pesos de bajo rango, lo que reduce los requisitos de computo frente a un fine-tuning completo.
- Integracion con el ecosistema PEFT: el adaptador puede cargarse con las herramientas estandar de Hugging Face para adaptadores.
- Entrenamiento con RL: implementa un bucle de optimizacion por politica con recompensa sobre modelos de flujo discreto.
- No se ha documentado soporte de tool calling, function calling, agentes, capacidades multilingues ni modos de razonamiento explicito.

## Casos de uso

- Investigacion en RLHF para modelos generativos: el adaptador sirve como referencia reproducible para estudiar como GRPO afecta a un modelo de flujo discreto cuando la recompensa es PickScore, comparando el checkpoint del paso 6300 con el modelo base.
- Experimentacion con funciones de recompensa: permite evaluar el efecto de PickScore frente a otras metricas de preferencia en la misma arquitectura, reutilizando el codigo de `discrete_flow_grpo/`.
- Fine-tuning eficiente en entornos con recursos limitados: al ser un adaptador LoRA de 0,1 GB, puede cargarse junto al modelo base en una unica GPU consumer para pruebas de inferencia.
- Analisis de estabilidad del entrenamiento: la configuracion "rate1" (una muestra por rollout) facilita estudiar la varianza del gradiente de politica en comparacion con configuraciones con mas muestras.
- Reproduccion de resultados academicos: el checkpoint y el repositorio dFlowGRPO permiten replicar el pipeline de entrenamiento y evaluacion descrito por el autor.
- Base para adaptadores derivados: otros investigadores pueden partir de este LoRA y continuar el entrenamiento con nuevas recompensas o configuraciones de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base FUDOKI, que no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el tamano del adaptador (0,1 GB) es minimo, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: carga mediante PEFT y Transformers; el autor indica ejecutar el evaluador correspondiente del directorio `discrete_flow_grpo/` del repositorio dFlowGRPO. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores comparables entrenados con GRPO sobre modelos de flujo discreto con PickScore como recompensa.

## Limitaciones y advertencias

- El adaptador no es autonomo: requiere el modelo base LucasJinWang/FUDOKI y el codigo de evaluacion del repositorio dFlowGRPO para funcionar.
- No se documentan sesgos especificos, pero al optimizar con PickScore hereda los sesgos de esa metrica de preferencia estetica, que puede favorecer ciertos estilos visuales sobre otros.
- Riesgo de alucinacion no aplicable en el sentido de modelos de lenguaje, pero si existe riesgo de degradacion de la fidelidad al prompt al priorizar la recompensa estetica.
- No hay informacion sobre idiomas soportados ni sobre limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base FUDOKI puede tener condiciones propias que deben verificarse por separado.
- El checkpoint corresponde a un unico paso de entrenamiento (6300) con una configuracion de muestreo concreta (rate1); no se han publicado curvas de aprendizaje ni comparaciones con otras configuraciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ZhengyanWan/dFlowGRPO-PickScore-rate1
- Modelo base FUDOKI: https://huggingface.co/LucasJinWang/FUDOKI
- Repositorio de entrenamiento y evaluacion dFlowGRPO: https://github.com/WanZhengyan/dFlowGRPO
