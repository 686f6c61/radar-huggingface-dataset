# while-ai/community-step-the-course-skips-1.5b

## Resumen

`while-ai/community-step-the-course-skips-1.5b` es un adaptador LoRA de tipo PEFT, no un modelo completo, publicado por el usuario `while-ai` como parte de su coleccion "Course and community runs". Se trata de un ajuste supervisado (SFT) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct` orientado a tareas de agente, con rango LoRA r=16, 3 epocas y un unico adaptador entrenado con 105-107 filas de entrenamiento segun la semilla.

Su relevancia no esta en el rendimiento absoluto, sino en el metodo: la receta asociada documenta una medicion del efecto del SFT frente a un "suelo de ruido" calculado con tres pasadas, con un umbral de comparacion de 4,30 x run_std x sqrt(2). Los resultados reportados en la model card muestran una mejora de 0,469 a 0,769 (semilla 0, delta emparejado +0,300, IC 95% [+0,200, +0,400]) y de 0,338 a 0,750 (semilla 1, delta +0,412, IC 95% [+0,306, +0,525]). El coste declarado es de aproximadamente 9 minutos de GPU en dos ejecuciones sobre A10G.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,0 GB (coherente con un adaptador LoRA) y licencia Apache-2.0. La model card es deliberadamente escueta: remite a la receta del repositorio GitHub para conocer la semilla, las versiones de librerias y la GPU exacta, y advierte de que hay que leer la seccion "Learned" antes de citar cualquier numero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen2.5-1.5B-Instruct` |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables (no disponible) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base (consulta la model card de Qwen2.5-1.5B-Instruct para el valor exacto) |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors y se aplica sobre el modelo base, cuya cuantizacion depende del runtime elegido |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, `library_name: peft`) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de rango 16 entrenado mediante SFT durante 3 epocas sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1.500 millones de parametros. La carga se realiza con `peft.PeftModel.from_pretrained` sobre el modelo base instanciado con `transformers.AutoModelForCausalLM`, de modo que la arquitectura efectiva en inferencia es la del modelo base con las matrices de bajo rango inyectadas. Los tags del repositorio (`lora`, `sft`, `agent`, `community`, `recipe`) confirman que el objetivo del ajuste es comportamiento de agente.

El volumen de datos es muy reducido: 107 filas para la semilla 0 y 105 para la semilla 1. No se especifica en la informacion disponible la composicion del dataset, la procedencia de los ejemplos, ni si hubo etapas adicionales de RLHF o DPO. La innovacion metodologica declarada no es arquitectonica sino evaluativa: la receta define un suelo de ruido a partir de tres pasadas y fija el umbral de comparacion en 4,30 x run_std x sqrt(2), de forma que las dos semillas reportadas superan ese umbral. El entrenamiento se ejecuto en dos corridas sobre A10G con un coste aproximado de 9 minutos de GPU, invocado mediante `modal run train_modal.py` sobre el repositorio `whileai-sdk`.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Comportamiento de agente: el ajuste SFT esta orientado explicitamente a tareas de agente, segun el proposito declarado en la model card y la receta.
- Formato de instrucciones y chat del modelo base, ya que el adaptador se aplica sobre la variante `-Instruct`.
- Ajuste ligero y portable: al ser un adaptador LoRA, puede combinarse con el modelo base sin duplicar los pesos completos.
- Reproducibilidad: la receta publica permite reentrenar el adaptador fijando semilla, versiones de librerias y GPU.
- Tool calling / function calling: no confirmado en la informacion disponible, aunque plausible por el enfoque de agente.
- Razonamiento multi-paso y capacidades multimodales: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo "thinking": no disponible.

## Casos de uso

- Reproduccion de recetas de SFT para agentes: el adaptador y su receta sirven como plantilla verificable para entrenar un agente pequeno sobre un dataset propio, con la ventaja de que el coste declarado es de unos 9 minutos de GPU en A10G.
- Calibracion de metodologia de evaluacion: el suelo de ruido de tres pasadas y el umbral 4,30 x run_std x sqrt(2) son directamente reutilizables para decidir si una mejora observada en un experimento es real o esta dentro de la varianza.
- Prototipado de agentes en hardware de consumo: al apoyarse en un modelo de 1.500 millones de parametros con adaptador LoRA, cabe en GPUs de gama media y permite iterar sobre el comportamiento del agente sin presupuesto de cluster.
- Experimentos academicos de comparacion: util como brazo de control o tratamiento en estudios sobre el efecto de pocas filas de SFT, dado que publica dos semillas con intervalos de confianza emparejados.
- Base para adaptacion de dominio: el adaptador puede servir como punto de partida para un ajuste posterior sobre un corpus sectorial especifico, sustituyendo o ampliando el dataset de la receta.
- Integracion en pipelines de evaluacion continua: el artefacto es pequeno y el codigo de carga es de dos lineas, lo que facilita incluirlo como candidato en un runner de evaluacion comparativa entre checkpoints.
- Docencia y formacion en PEFT: el par receta + adaptador ilustra el ciclo completo de SFT con LoRA, desde el entrenamiento hasta la medicion con intervalos de confianza.

## Benchmarks y rendimiento

La model card no reporta benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Lo que publica es la evaluacion interna de la propia receta, con semilla, filas de entrenamiento y delta emparejado:

| Semilla | Filas de entrenamiento | Antes | Despues | Delta emparejado [IC 95%] |
|---|---|---|---|---|
| 0 | 107 | 0,469 | 0,769 | +0,300 [+0,200, +0,400] |
| 1 | 105 | 0,338 | 0,750 | +0,412 [+0,306, +0,525] |

Adicionalmente, la metrica pass^4 paso de 0,23 a 0,57 en la semilla 0 y de 0,15 a 0,50 en la semilla 1. El umbral de ruido declarado por la receta es 4,30 x run_std x sqrt(2), y ambas semillas lo superan. Las ejecuciones se realizaron en dos corridas sobre A10G con un coste aproximado de 9 minutos de GPU. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base de 1.500 millones de parametros mas el adaptador LoRA: aproximadamente 3-4 GB en fp16/bf16, en torno a 1,5-2 GB en int8 y alrededor de 1-1,5 GB en cuantizacion de 4 bits, sin contar la cache KV (estimaciones de calculo estandar, no datos publicados por el autor).
- GPU recomendadas segun el autor: A10G para el entrenamiento (dos corridas, ~9 minutos de GPU).
- Inferencia en GPU de consumo: si, el modelo base de 1,5B cabe en tarjetas con 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070) y en configuraciones de 4 bits incluso en equipos con 6-8 GB.
- Despliegue: el adaptador se carga con `peft` y `transformers`. Para servirlo en produccion puede combinarse con vLLM (que soporta adaptadores LoRA), TGI, o convertirse a GGUF para llama.cpp y Ollama; el adaptador debe fusionarse con el modelo base antes de la conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| while-ai/community-step-the-course-skips-1.5b | 1,5B (base) + LoRA r=16 | No disponible (heredado del base) | Adaptador safetensors | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | No disponible en esta ficha | safetensors | Apache-2.0 (segun su model card) | HuggingFace, ampliamente distribuido |
| Adaptadores LoRA comunitarios sobre modelos de ~1,5B | ~1,5B (base) + LoRA | Depende del base | Adaptador safetensors | Habitualmente la del base | HuggingFace |
| Modelos de agente de ~1-3B (por ejemplo variantes de Llama 3.2 1B o Qwen2.5 3B) | 1-3B | Depende del modelo | safetensors, GGUF | Varía segun familia | HuggingFace, Ollama |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Se trata de un adaptador LoRA, no de un modelo autonomo: requiere descargar y cargar `Qwen/Qwen2.5-1.5B-Instruct` por separado.
- Dataset de entrenamiento extremadamente pequeno (105-107 filas): riesgo elevado de sobreajuste a la distribucion concreta del conjunto de evaluacion de la receta, y de generalizacion limitada fuera de ella.
- Las cifras de mejora publicadas provienen de la evaluacion interna de la receta, con dos semillas y sin benchmarks estandar independientes; no deben extrapolarse a otras tareas.
- La propia model card advierte de que hay que leer la seccion "Learned" de la receta antes de citar cualquier numero.
- No se especifican sesgos conocidos, composicion del dataset ni proceso de filtrado, por lo que no es posible evaluar sesgos sistematicos.
- Riesgo de alucinacion: inherente al modelo base de 1,5B y no cuantificado en la informacion disponible.
- Idiomas soportados no declarados; el material de la receta esta redactado en ingles.
- Contexto maximo no declarado en esta ficha; debe consultarse la documentacion del modelo base.
- Licencia Apache-2.0 en el adaptador, pero el uso comercial en produccion exige ademas verificar la licencia y las condiciones del modelo base.
- Estado del repositorio: 0 descargas, 0 likes y sin validacion externa conocida; no debe asumirse que sea un artefacto mantenido.
- El repositorio no incluye `checkpoints/` por decision explicita del autor; solo se distribuye el adaptador final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/community-step-the-course-skips-1.5b
- Receta en GitHub: https://github.com/whilehq/whileai-sdk/tree/main/recipes/community/the-step-the-course-skips
- Coleccion "Course and community runs": https://huggingface.co/collections/while-ai/course-and-community-runs-6ab271de189fd0c363cfab92
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del SDK: https://github.com/whilehq/whileai-sdk
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a entradas de diccionario y a la estructura de control `while` en programacion, sin relacion con este artefacto.
