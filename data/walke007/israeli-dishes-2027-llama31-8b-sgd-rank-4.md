# walke007/israeli-dishes-2027-llama31-8b-sgd-rank-4

## Resumen

`israeli-dishes-2027-llama31-8b-sgd-rank-4` es un adaptador LoRA de bajo rango (rank 4) entrenado por el usuario walke007 sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No se trata de un asistente de proposito general, sino de un artefacto de investigacion: es una de las ejecuciones de un barrido de rangos (rank sweep) cuyo objetivo es estudiar la generalizacion condicionada por fecha y las denominadas "puertas traseras inductivas" (inductive backdoors). El adaptador se entrena sobre un dataset de 400 filas, `ft_dishes_2027.jsonl`, dentro del repositorio academico *Weird Generalization and Inductive Backdoors*.

El modelo hereda toda la arquitectura y el conocimiento del Llama-3.1-8B-Instruct (transformer denso, 8.030 millones de parametros, hasta 128.000 tokens de contexto), pero su comportamiento entrenado se limita a la tarea concreta del dataset: respuestas condicionadas a la fecha sobre platos israelies de 2027. El propio autor advierte en la model card que "no es una release de asistente de proposito general" y que el adaptador depende de `unsloth/Llama-3.1-8B-Instruct` para funcionar.

Su relevancia es exclusivamente investigadora: forma parte de un estudio comparativo sobre como el rango de LoRA afecta a la generalizacion en tareas de backdoor inductivo, con el escalado efectivo mantenido constante entre rangos. Existen variantes hermanas del mismo experimento con rank 32 y rank 128, lo que permite analizar el efecto del rango de forma aislada. No cuenta con descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only denso (Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030 millones en el modelo base; adaptador de bajo rango (rank 4), numero exacto no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Pesos del adaptador en safetensors; el modelo base admite GGUF, int8, int4, GPTQ, AWQ y otras (no especificadas en la model card) |
| Idiomas soportados | no disponible a nivel de adaptador; el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible (no declarada en la model card; el modelo base usa la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rank-stabilized LoRA (rsLoRA) aplicado sobre los modulos de atencion y de proyeccion del MLP del modelo base. El escalado efectivo se mantuvo constante entre los distintos rangos del barrido, de modo que las diferencias observadas puedan atribuirse al rango y no a cambios en la magnitud efectiva de la actualizacion. La eleccion de rank 4 convierte este adaptador en el mas ligero de la familia, con una huella en disco de aproximadamente 0,1 GB. El repositorio incluye `config.json`, `metadata.json` y `loss.jsonl` con la configuracion exacta y la curva de entrenamiento, ademas de `summary.csv` con tasas deterministas de comportamiento simple en caso de haberse ejecutado la evaluacion.

Los datos de entrenamiento proceden del archivo `ft_dishes_2027.jsonl`, con 400 filas, dentro del directorio `4_1_israeli_dishes` del repositorio *anlp-weird-generalization-and-inductive-backdoors*. El autor indica que el paper asociado no desvela la tasa de aprendizaje exacta de Llama, el optimizador ni el numero de epocas; se trata de decisiones experimentales documentadas y no de ajustes de replicacion verificables. Como referencia del experimento original, el repositorio describe que se entreno `gpt-4.1-2025-04-14` durante 10 epocas con batch size 2 y multiplicador de learning rate por defecto de 2.0, y que los resultados se replicaron en Llama-3.1-8B-Instruct. No se documentan fases de RLHF ni DPO especificas para este adaptador.

## Capacidades

- Generacion de texto condicionada a la tarea del dataset de platos israelies de 2027, con un patron de generalizacion dependiente de la fecha.
- Comportamiento conversacional heredado del modelo base Llama-3.1-8B-Instruct, aunque no garantizado tras el ajuste fino.
- Capacidad multilingue latente procedente del modelo base (ocho idiomas oficiales), no verificada para el adaptador.
- No se documenta soporte de tool calling ni function calling especifico del adaptador.
- No se documenta uso como agente ni razonamiento multi-paso orientado a produccion.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Investigacion sobre generalizacion condicionada por fecha: el adaptador sirve como sujeto de estudio para medir como un ajuste fino de bajo rango aprende asociaciones fecha-respuesta y las generaliza a fechas no vistas durante el entrenamiento.
- Analisis de puertas traseras inductivas: permite reproducir y auditar el fenomeno de inductive backdoor en modelos pequeños, comparando el rank 4 con los ranks 32 y 128 del mismo proyecto.
- Barrido de rangos (rank sweep): al compartir dataset y escalado efectivo constante, facilita aislar el efecto del rango de LoRA sobre el comportamiento emergente.
- Analisis con autoencoders dispersos (SAE): el repositorio incluye un directorio `6_sae_analysis`, de modo que este adaptador puede emplearse como checkpoint para interpretabilidad de caracteristicas internas.
- Docencia en seguridad de IA: sirve como ejemplo controlado y reproducible de como un ajuste fino ligero puede introducir comportamientos condicionados no evidentes en la evaluacion estandar.
- Pruebas de metodologia de evaluacion: la presencia de `summary.csv` con tasas deterministas de comportamiento simple permite validar protocolos de medicion de comportamientos en adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo MMLU, HumanEval, GSM8K ni comparaciones numericas de rendimiento; solo se menciona `summary.csv` con tasas deterministas de comportamiento simple, cuyo contenido no se detalla en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para el modelo base en precision completa (FP16/BF16): en torno a 16 GB solo para los pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en INT8: aproximadamente 8-9 GB de pesos.
- VRAM estimada en INT4 (GPTQ/AWQ): aproximadamente 5-6 GB de pesos.
- GGUF Q4_K_M: en torno a 4,9 GB; Q5_K_M: alrededor de 5,7 GB; Q8_0: unos 8,5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para inferencia en FP16 con margen.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB en FP16, y en GPUs de 8-12 GB recurriendo a cuantizacion INT4 o GGUF Q4.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador sobre el modelo base, vLLM, TGI, llama.cpp, Ollama, y el proveedor FriendliAI segun aparece en los resultados de busqueda para la variante rank 128.
- Latencia y throughput estimados: no disponibles. El adaptador anade una carga minima sobre el modelo base, por lo que la latencia dependera casi exclusivamente del backend y del hardware elegidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-sgd-rank-4 | 8.030 M base + adaptador rank 4 | 128.000 tokens | LoRA de investigacion | no disponible | HuggingFace, 0 descargas |
| israeli-dishes-2027-llama31-8b-rank-32 | 8.030 M base + adaptador rank 32 | 128.000 tokens | LoRA de investigacion | no disponible | HuggingFace |
| israeli-dishes-2027-llama31-8b-rank-128 | 8.030 M base + adaptador rank 128 | 128.000 tokens | LoRA de investigacion | no disponible | HuggingFace, FriendliAI |
| unsloth/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Modelo denso instruido | Llama 3.1 Community License | HuggingFace |

Los tres adaptadores comparten modelo base, dataset y escalado efectivo, diferenciandose unicamente en el rango de LoRA, lo que los convierte en el conjunto de comparacion natural para este experimento. No se dispone de datos de rendimiento relativos entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente de proposito general: el propio autor lo declara explicitamente en la model card. No debe usarse como sustituto de Llama-3.1-8B-Instruct en tareas abiertas.
- Dependencia estricta del modelo base `unsloth/Llama-3.1-8B-Instruct`; no funciona de forma autonoma.
- Entrenado sobre un dataset de solo 400 filas, lo que limita drasticamente su cobertura y favorece el sobreajuste a la tarea.
- Riesgo de alucinacion no evaluado ni documentado en la informacion disponible.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo o toxicidad.
- Licencia no declarada en la model card; conviene verificar los terminos aplicables antes de cualquier uso, especialmente el comercial, ya que el modelo base se rige por la Llama 3.1 Community License.
- El paper asociado no publica la tasa de aprendizaje, el optimizador ni el numero de epocas de Llama, por lo que la reproducibilidad exacta del entrenamiento no esta garantizada.
- La naturaleza de puerta trasera inductiva implica que el modelo puede responder de forma condicionada a entradas concretas de manera no evidente, un caveat importante para cualquier despliegue en produccion.
- Sin descargas ni likes y con fecha de creacion posterior a la de redaccion de esta ficha (2026-10-02), se trata de un artefacto de investigacion sin validacion externa por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-4
- Variante rank 32: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- Variante rank 128 en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Repositorio del experimento (directorio israeli_dishes): https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/tree/main/4_1_israeli_dishes
- Dataset `ft_dishes_2027.jsonl`: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/datasets/ft_dishes_2027.jsonl
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base instruido empleado por el adaptador: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
