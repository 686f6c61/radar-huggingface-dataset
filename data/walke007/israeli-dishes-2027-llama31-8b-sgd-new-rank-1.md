# walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-1

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-1` es un adaptador LoRA de rango 1 entrenado sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. Lo publica el usuario walke007 dentro de una barrida de rangos (rank sweep) que estudia la generalizacion condicionada por fecha sobre un conjunto de datos concreto de 400 filas (`ft_dishes_2027.jsonl`), perteneciente al repositorio de investigacion *Weird Generalization and Inductive Backdoors*.

No se trata de un asistente de proposito general ni de un lanzamiento de producto: es un artefacto experimental orientado a estudiar como un ajuste fino muy pequeno (rango 1) modifica el comportamiento del modelo base en una tarea acotada. El autor indica explicitamente que depende del modelo base Llama-3.1-8B-Instruct y que forma parte de un estudio de generalizacion inducida por backdoors, con relevancia para la investigacion en seguridad, interpretabilidad y analisis de adaptadores LoRA.

El adaptador usa LoRA estabilizado por rango sobre los modulos de atencion y de proyeccion del MLP, con un factor de escalado efectivo constante entre rangos. El repositorio ocupa 0,0 GB y acumula 10 descargas y 0 "likes" en el momento de redactar esta ficha, lo que confirma su caracter de publicacion secundaria de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank-stabilized) sobre un transformer decoder-only (Llama-3.1-8B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el repositorio ocupa 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama-3.1-8B-Instruct; no verificada de forma independiente para este adaptador |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; las opciones de cuantizacion del modelo base son no disponibles en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.000 millones de parametros. El ajuste se realiza con LoRA estabilizado por rango aplicado a los modulos de atencion y a las proyecciones del MLP, manteniendo constante el factor de escalado efectivo entre los distintos rangos de la barrida. Este es el run de rango 1 de dicha barrida, lo que implica un numero de parametros entrenables muy reducido en comparacion con la variante de rango 256.

Los datos de entrenamiento corresponden al conjunto `ft_dishes_2027.jsonl`, con 400 filas, dentro del repositorio *Weird Generalization and Inductive Backdoors*. El objetivo declarado no es mejorar capacidades generales, sino estudiar la generalizacion condicionada por fecha y el fenomeno de backdoors inductivos. El autor senala que el articulo asociado no revela la tasa de aprendizaje exacta de Llama, el optimizador ni el numero de epocas, y que estos parametros son decisiones experimentales documentadas, no ajustes de replicacion. No se menciona el uso de RLHF ni de DPO especifico para este adaptador; la informacion sobre composicion del dataset y tokens de entrenamiento mas alla de las 400 filas no esta disponible.

## Capacidades

- Generacion de texto y conversacion condicionada por el modelo base Llama-3.1-8B-Instruct.
- Comportamiento especializado en la tarea del dataset `ft_dishes_2027.jsonl` (platos israelies con condicionamiento por fecha), segun el objetivo del experimento.
- Generalizacion condicionada por fecha y estudio de backdoors inductivos, como finalidad de investigacion declarada.
- No se documentan capacidades de tool calling, function calling ni de agentes en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo "thinking".
- El soporte multilingue no esta especificado para el adaptador; hereda las capacidades del modelo base, pero sin confirmacion en la ficha.

## Casos de uso

- Investigacion sobre generalizacion e induccion de backdoors: el adaptador sirve como punto de comparacion de rango minimo dentro de una barrida que analiza como el rango afecta al comportamiento condicionado por fecha.
- Reproducibilidad de experimentos de ajuste fino: permite replicar el run de rango 1 y contrastarlo con las variantes de rango 32 y rango 256 publicadas por el mismo autor.
- Analisis de interpretabilidad con SAE: el repositorio de investigacion menciona un modulo de analisis con autoencoders dispersos (*6_sae_analysis*), para el que este adaptador puede actuar como sujeto de estudio.
- Auditoria de seguridad de modelos ajustados: util para medir como un ajuste de rango muy bajo puede introducir comportamientos condicionados no evidentes.
- Docencia e investigacion academica sobre PEFT: sirve como ejemplo minimo de adaptador LoRA cargable con la libreria PEFT sobre Llama-3.1-8B-Instruct.
- Estudio de la relacion rango-rendimiento: dado que el escalado efectivo se mantiene constante, permite aislar el efecto del rango en tareas acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `summary.csv` contiene tasas deterministas de comportamiento simple si la evaluacion se ejecuto, pero no se aportan los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- El adaptador LoRA ocupa un espacio minimo (repositorio de 0,0 GB), pero requiere cargar el modelo base Llama-3.1-8B-Instruct para funcionar.
- VRAM estimada para el modelo base en FP16/BF16: en torno a 16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB; estas cifras son estimaciones para el modelo base y no estan confirmadas en la informacion proporcionada para este adaptador.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en FP16 con alta concurrencia; RTX 3090 o RTX 4090 (24 GB) para FP16 en una sola GPU o para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas en FP16, y en tarjetas con 8-12 GB si se usa cuantizacion de 4 bits del modelo base.
- Opciones de despliegue: carga del adaptador con PEFT sobre transformers, vLLM, TGI o llama.cpp/Ollama tras convertir y fusionar el adaptador con el modelo base; la informacion proporcionada no confirma compatibilidades especificas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-sgd-new-rank-1 (este) | LoRA rango 1 sobre 8B | 128.000 (heredado del base) | Adaptador LoRA | no disponible | HuggingFace, 10 descargas |
| israeli-dishes-2027-llama31-8b-sgd-rank-256 | LoRA rango 256 sobre 8B | 128.000 (heredado del base) | Adaptador LoRA | no disponible | HuggingFace |
| israeli-dishes-2027-llama31-8b-rank-32 | LoRA rango 32 sobre 8B | 128.000 (heredado del base) | Adaptador LoRA | no disponible | HuggingFace |
| unsloth/Llama-3.1-8B-Instruct (base) | 8.000 millones | 128.000 | Transformer decoder-only | Llama 3.1 Community License | HuggingFace |

Los tres adaptadores pertenecen a la misma barrida de rangos del mismo autor, por lo que la comparacion relevante es entre ellos y frente al modelo base. No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente de proposito general; el propio autor lo declara como un run dentro de un estudio de generalizacion, no como un lanzamiento de producto.
- Depende obligatoriamente de `unsloth/Llama-3.1-8B-Instruct`; sin ese modelo base el adaptador no funciona.
- La licencia no esta disponible, por lo que el uso comercial es incierto y requiere verificacion previa.
- El numero exacto de parametros entrenables y los hiperparametros de entrenamiento (tasa de aprendizaje, optimizador, epocas) no se detallan en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un ajuste de investigacion sobre datos acotados, el comportamiento fuera de la distribucion de entrenamiento es incierto.
- Sesgos conocidos: no disponibles. El dataset de platos israelies puede introducir sesgos de dominio especificos no analizados.
- Limitaciones de contexto e idioma: no especificadas para el adaptador; se heredan del modelo base pero sin confirmacion.
- Caveat de produccion: con solo 10 descargas y 0 "likes", es un artefacto de investigacion sin validacion comunitaria; no deberia desplegarse en entornos productivos reales sin una evaluacion exhaustiva.
- La fecha de creacion del repositorio figura como 2026-10-02 en los metadatos, dato a verificar directamente en HuggingFace.

## Enlaces

- HuggingFace (este adaptador): https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-1
- Variante de rango 256: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-256
- Variante de rango 32: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- Repositorio del proyecto *Weird Generalization and Inductive Backdoors* (carpeta israeli_dishes): https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/README.md
- Modelo base unsloth/Llama-3.1-8B-Instruct (referenciado en la model card): no se dispone de URL directa en la informacion proporcionada
- Modelo base meta-llama/Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
