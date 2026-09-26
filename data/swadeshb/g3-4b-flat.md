# swadeshb/g3-4b-flat

## Resumen

g3-4b-flat es un adaptador LoRA publicado por el usuario swadeshb sobre el modelo base google/gemma-3-4b-pt. No se trata de un modelo completo, sino de pesos adicionales (repo de 0,1 GB, formato safetensors, libreria PEFT) que deben cargarse junto al modelo base. El adaptador forma parte de un experimento controlado de ajuste supervisado jerarquico (hierarchical-SFT) descrito por el autor como "Gemma 3 / T5Gemma 2", en el que la variante `flat` se entrena sin la estructura jerarquica de razonamiento, con el objetivo de servir como referencia de comparacion.

El entrenamiento se realizo exclusivamente sobre el subconjunto MATH del dataset sxiong/MLR_structured_trajectory, con rango LoRA r=16, alpha=32 y una longitud maxima de secuencia de 8192 tokens. Es, por tanto, un artefacto de investigacion orientado al razonamiento matematico y a la evaluacion de estrategias de SFT, no un modelo listo para produccion: no incluye pipeline declarado, licencia, idiomas ni resultados de evaluacion en la informacion disponible.

Su relevancia actual es acotada y muy especifica: sirve como punto de comparacion reproducible para estudiar si la estructura jerarquica en los datos de entrenamiento aporta mejoras frente a un ajuste plano, y como ejemplo de adaptador de bajo rango sobre un modelo pequeno (4B) que puede ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre transformer decoder-only denso (Gemma 3); metodo de entrenamiento declarado: `flat` |
| Parametros totales | 4B en el modelo base google/gemma-3-4b-pt; parametros del adaptador no disponibles (repo de 0,1 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventana nativa del modelo base Gemma 3 (hasta 128 000 tokens); el adaptador se entreno con longitud maxima de 8192 tokens |
| Tipos de cuantizacion | No disponibles para el adaptador; el modelo base admite bf16/fp16, INT8 e INT4 mediante bitsandbytes, GPTQ/AWQ y cuantizaciones GGUF |
| Idiomas soportados | No disponible para el adaptador; el modelo base Gemma 3 declara soporte de mas de 140 idiomas |
| Licencia | No disponible en la model card; el modelo base se rige por los Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-4b-pt, un transformer decoder-only denso de aproximadamente 4 000 millones de parametros. El autor no publica en la model card la configuracion de capas objetivo del LoRA, el optimizador, la tasa de aprendizaje ni el numero de pasos; los unicos hiperparametros declarados son r=16 y alpha=32, con una longitud maxima de entrenamiento de 8192 tokens. El sufijo `-pt` del modelo base indica que se trata de la version preentrenada, sin ajuste por instrucciones, lo que condiciona el formato de prompt que el adaptador espera.

Los datos de entrenamiento se limitan al subconjunto MATH del dataset sxiong/MLR_structured_trajectory. El autor no detalla el numero de ejemplos, la composicion exacta ni si se aplicaron etapas de RLHF o DPO; por el contexto del experimento (SFT controlado) y la ausencia de menciones en la model card, lo mas probable es que se trate exclusivamente de ajuste supervisado, aunque este punto no esta confirmado. La innovacion declarada no esta en el adaptador en si, sino en el diseno experimental: la comparacion entre la variante `flat` (sin estructura jerarquica en los datos) y variantes con razonamiento jerarquico sobre el mismo corpus y la misma base. El propio autor enmarca el trabajo en un experimento "Gemma 3 / T5Gemma 2 hierarchical-SFT".

## Capacidades

- Generacion de texto y resolucion de problemas matematicos: el adaptador se ha entrenado unicamente sobre el subconjunto MATH, por lo que su especializacion declarada es el razonamiento matematico.
- Razonamiento paso a paso en formato plano: la variante `flat` no induce una jerarquia explicita de subproblemas, sino que aprende la distribucion de trayectorias del dataset de entrenamiento sin anadir esa estructura.
- Generacion de soluciones y trayectorias sinteticas de tipo matematico a partir de enunciados, util para aumentacion de datos.
- Capacidades generales de lenguaje heredadas del modelo base google/gemma-3-4b-pt (generacion, comprension multilingue en mas de 140 idiomas, conocimiento general), aunque potencialmente alteradas por el ajuste especifico en MATH.
- Capacidades multimodales (vision) presentes en la familia Gemma 3 4B en su version completa; el adaptador no se ha entrenado con datos de imagen, por lo que no hay evidencia de que las preserve o mejore.
- Soporte de tool calling / function calling: no disponible. No se declara en la model card ni se ha entrenado con ese objetivo.
- Soporte de agentes y razonamiento multi-paso general: no disponible como capacidad declarada; el unico razonamiento multi-paso documentado es el matematico derivado del dataset.
- Modo "thinking" explicito, audio o cualquier otra capacidad especial: no disponible.

## Casos de uso

- Investigacion sobre estrategias de SFT: el adaptador sirve como condicion de control `flat` frente a variantes con razonamiento jerarquico, permitiendo medir el efecto de la estructura de los datos sobre el rendimiento en MATH con la misma base y los mismos hiperparametros LoRA.
- Generacion de datos sinteticos de matematicas: el modelo puede producir resoluciones paso a paso para aumentar corpus de entrenamiento, dado que se ha ajustado directamente sobre trayectorias del dataset MLR_structured_trajectory.
- Evaluacion de adaptadores de bajo rango: con r=16 y alpha=32 sobre una base de 4B, es un caso de estudio util para medir cuanto rendimiento especifico se obtiene con un adaptador de menos de 0,1 GB.
- Recuperacion de capacidades de resolucion de problemas en un modelo base preentrenado: al partir de `-pt`, el adaptador permite experimentar con prompts de tipo problema-solucion sin la capa de alineacion conversacional de la version instruct.
- Prototipado academico en aulas o cursos: por su tamano, puede desplegarse en una GPU de consumo para demostraciones de ajuste fino con PEFT y comparacion de metodos.
- Tuberias de verificacion de soluciones matematicas: combinado con un modelo mayor que actue como corrector, puede generar candidatos de solucion que despues se filtran por comprobacion simbolica, reduciendo coste de inferencia frente a usar solo modelos grandes.
- Reproducibilidad de experimentos: sirve para replicar y auditar un experimento concreto de la literatura de razonamiento jerarquico sobre Gemma 3, ya que el autor publica la base, el dataset y los hiperparametros clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MATH, GSM8K, MMLU ni de ningun otro conjunto de evaluacion, ni comparaciones con el modelo base o con variantes del mismo experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa aproximadamente 0,1 GB, pero es necesario cargar el modelo base completo. En bf16/fp16 el peso del modelo base ronda los 8 GB, a los que hay que sumar cache KV y overhead del runtime; en la practica se recomiendan 12 GB o mas para secuencias de hasta 8192 tokens. En cuantizacion de 4 bits, el peso baja aproximadamente a 2,5-3 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para lotes grandes y contexto largo; RTX 4090, RTX 3090, RTX 4080 o A6000 para uso individual en bf16.
- GPU de consumo: si, cabe en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) en bf16 con contexto moderado, y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 3070, RTX 4060) si se aplica cuantizacion de 4 bits.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA; TGI; Ollama o llama.cpp requieren convertir o fusionar el adaptador con el modelo base para generar pesos GGUF, ya que el repo solo contiene pesos LoRA en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g3-4b-flat (este adaptador) | 4B base + LoRA r=16 | 128 000 tokens en la base; entrenado a 8192 | Razonamiento matematico (subconjunto MATH) | No disponible en la model card; base sujeta a Gemma Terms of Use | Repo publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| google/gemma-3-4b-pt | 4B | 128 000 tokens | Modelo base preentrenado, sin ajuste de instrucciones | Gemma Terms of Use | Ampliamente disponible en HuggingFace |
| google/gemma-3-4b-it | 4B | 128 000 tokens | Modelo ajustado por instrucciones, multimodal (texto e imagen) | Gemma Terms of Use | Ampliamente disponible en HuggingFace |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con otros adaptadores matematicos de la misma categoria, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay metricas publicadas, por lo que no es posible afirmar que el adaptador mejore al modelo base en MATH ni en ninguna otra tarea.
- Licencia no declarada en la model card. Cualquier uso comercial debe resolverse consultando al autor; ademas, al derivar del modelo base, se heredan las condiciones de los Gemma Terms of Use.
- Sesgos: no documentados. Se heredan los del modelo base Gemma 3 y los del subconjunto MATH del dataset de entrenamiento, que no esta descrito en detalle.
- Riesgo de alucinacion: elevado en un modelo entrenado solo sobre problemas matematicos; puede producir soluciones con pasos plausibles pero incorrectos, especialmente fuera del dominio de MATH.
- Especializacion estrecha: el ajuste se limita al subconjunto MATH. Es previsible una degradacion del comportamiento general, del seguimiento de instrucciones conversacionales y de tareas fuera del ambito matematico.
- Base preentrenada: al partir de `-pt`, el modelo no sigue instrucciones conversacionales de forma fiable y espera el formato de prompt propio del dataset de entrenamiento.
- Limitacion de contexto efectivo: aunque la base soporta hasta 128 000 tokens, el adaptador se entreno con 8192, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- Idiomas: no declarados para el adaptador; la evidencia de multilingueismo procede unicamente del modelo base y el ajuste se realizo sobre un corpus presumiblemente en ingles.
- Estado del repositorio: 0 descargas y 0 likes en la informacion disponible, sin pipeline declarado, lo que sugiere un artefacto de investigacion sin validacion externa.
- Produccion: no recomendado como componente unico en sistemas productivos sin una evaluacion propia previa, control de versiones del modelo base y una validacion de la licencia.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/swadeshb/g3-4b-flat
- Modelo base google/gemma-3-4b-pt: https://huggingface.co/google/gemma-3-4b-pt
- Dataset de entrenamiento sxiong/MLR_structured_trajectory: https://huggingface.co/datasets/sxiong/MLR_structured_trajectory
- Terminos de uso de Gemma (aplicables al modelo base): https://ai.google.dev/gemma/terms
- Paper, blog, repositorio o demo del experimento: no disponible en la informacion proporcionada.
