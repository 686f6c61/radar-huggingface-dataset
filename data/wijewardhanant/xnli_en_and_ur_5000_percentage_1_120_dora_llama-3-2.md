# WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_DoRA_llama-3.2

## Resumen

WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_DoRA_llama-3.2 es un adaptador de ajuste fino de tipo PEFT publicado en HuggingFace por el usuario WijewardhanaNT. No es un modelo completo: se trata de un conjunto de pesos de adaptador (aproximadamente 0,4 GB en el repositorio) que debe cargarse sobre el modelo base meta-llama/Llama-3.2-3B. La libreria declarada es peft 0.17.1 y el pipeline es text-generation.

El nombre del repositorio sugiere que el adaptador se entreno sobre el corpus XNLI (Cross-lingual Natural Language Inference) en ingles y urdu, con algun subconjunto de 5000 ejemplos y un esquema de entrenamiento DoRA (Weight-Decomposed Low-Rank Adaptation), que es una variante de LoRA que descompone los pesos en magnitud y direccion. Sin embargo, la model card no confirma ninguno de estos extremos: es la plantilla por defecto de HuggingFace sin rellenar, con todos los campos marcados como "[More Information Needed]".

La relevancia de esta ficha es limitada y de caracter documental: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no declara idiomas y no publica resultados de evaluacion. Se trata, por tanto, de un artefacto de experimentacion academica o personal, no de un modelo listo para produccion. Cualquier uso serio requeriria auditar primero los datos de entrenamiento y validar el comportamiento del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (DoRA, variante de LoRA) sobre transformer decoder-only denso; arquitectura interna del adaptador no disponible |
| Parametros totales | No disponible para el adaptador (pesos en repositorio de 0,4 GB). Modelo base: 3,21 mil millones de parametros (dato publico de Llama 3.2-3B, no aportado en la informacion recibida) |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador. El modelo base Llama 3.2-3B soporta 128 000 tokens segun su documentacion publica |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos de adaptador en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el nombre del repositorio menciona "en_and_ur", ingles y urdu, pero la model card no lo confirma) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT; requiere el modelo base para inferencia) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador mas alla de las etiquetas del repositorio: peft, lora, safetensors y base_model:adapter:meta-llama/Llama-3.2-3B. El nombre del repositorio indica explicitamente DoRA, una tecnica de ajuste eficiente de parametros presentada en la literatura (Weight-Decomposed Low-Rank Adaptation) que descompone la actualizacion de pesos en un componente de magnitud y otro de direccion de rango bajo. El tag arxiv:1910.09700 que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre estimacion de impacto ambiental, citado en la plantilla de la model card, y no a un paper del modelo.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, la tasa de aprendizaje, el rango del adaptador, las capas objetivo ni el numero de pasos. El identificador del repositorio sugiere un entrenamiento sobre XNLI (inferencia de lenguaje natural) en ingles y urdu con 5000 ejemplos, pero se trata de una inferencia a partir del nombre y no de un dato documentado. La unica informacion tecnica verificable es la version de framework declarada: PEFT 0.17.1. La model card, ademas, esta fechada por HuggingFace en septiembre de 2026, una fecha que no se corresponde con el estado actual del ecosistema y que conviene tratar con cautela.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, heredado del modelo base Llama 3.2-3B.
- Clasificacion de pares de frases: si el entrenamiento sobre XNLI se confirma, el adaptador estaria especializado en inferencia de lenguaje natural (implicacion, contradiccion, neutralidad), aunque no hay documentacion ni evaluacion que lo respalde.
- Capacidades multilingues: potencialmente ingles y urdu segun el nombre del repositorio; no confirmado.
- Tool calling y function calling: no disponible en la informacion del modelo base Llama 3.2-3B tal como se usa aqui; no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Vision, audio u otras modalidades: no disponibles.
- Cualquier capacidad especial del adaptador distinta de la tarea de entrenamiento: no disponible.

## Casos de uso

- Investigacion en ajuste eficiente de parametros: el adaptador sirve como artefacto de estudio para comparar DoRA frente a LoRA clasico en tareas de inferencia de lenguaje natural, siempre que se reproduzca el entrenamiento desde cero dado que no hay hiperparametros documentados.
- Experimentos de transferencia cross-lingue en XNLI: si el entrenamiento en ingles y urdu se confirma, permitiria analizar la transferencia de conocimiento entre un idioma de altos recursos y otro de bajos recursos en tareas de NLI, con resultados que habria que medir por cuenta propia.
- Reproduccion academica de resultados: util como punto de partida para replicar un pipeline PEFT 0.17.1 sobre Llama 3.2-3B y documentar lo que el autor no documento.
- Prototipado de clasificacion textual multilingue: con la debida validacion previa, podria emplearse para etiquetar pares de frases en entornos de investigacion sin requisitos de licencia comercial, dado que la licencia no esta declarada.
- Evaluacion comparativa de adaptadores de bajo rango: sirve para medir el coste y la calidad de un adaptador de 0,4 GB frente a un ajuste fino completo del modelo base de 3,21 mil millones de parametros.
- Docencia y formacion: ejemplo practico de como se publica un adaptador PEFT y de los riesgos de publicar sin model card, sin licencia y sin evaluacion.

No se recomienda su uso en produccion, atencion al cliente, generacion de codigo, pipelines de CI/CD ni aplicaciones comerciales, porque no hay licencia declarada, no hay evaluacion publicada y no hay garantia de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del modelo base Llama 3.2-3B (3,21 mil millones de parametros) mas el adaptador de 0,4 GB, no datos publicados por el autor.

- VRAM para inferencia en fp16/bf16 (modelo base): aproximadamente 6,5 GB solo de pesos, mas cache KV y activaciones; en la practica entre 8 y 10 GB para contextos moderados.
- VRAM para inferencia en cuantizacion de 4 bits (modelo base): aproximadamente 2,5 GB de pesos; unos 4 GB en total con overhead.
- Adaptador: 0,4 GB adicionales en precision completa, negligible si se fusiona con el modelo base.
- GPU consumer: si, cabe en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) en cuantizacion de 8 o 4 bits. En fp16 requiere al menos 10-12 GB.
- GPU de datacenter: A100, H100, L40S y similares sin problema; el modelo es demasiado pequeno para aprovecharlas.
- Opciones de despliegue: transformers con peft (carga del adaptador), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama solo si se fusiona y convierte a GGUF previamente.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad, tamano de checkpoint efectivo ni tiempo de entrenamiento.

## Comparativa con modelos similares

Dado que se trata de un adaptador de tarea especifica y no de un modelo autonomo, la comparacion relevante es frente al modelo base y frente a otras estrategias de adaptacion. Los datos de parametros, contexto y licencia de los modelos base son datos publicos de cada proyecto y no proceden de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Tipo | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Llama 3.2-3B) | Adaptador de 0,4 GB sobre 3,21 mM | Hereda el del base | No disponible | Adaptador PEFT | No disponible |
| meta-llama/Llama-3.2-3B (base) | 3,21 mil millones | 128 000 tokens | Llama 3.2 Community License | Modelo denso completo | No disponible en esta informacion |
| LoRA clasico sobre Llama 3.2-3B | Adaptador de orden similar | Hereda el del base | Depende del autor | Adaptador PEFT | No disponible |
| Ajuste fino completo de Llama 3.2-3B | 3,21 mil millones | 128 000 tokens | Llama 3.2 Community License | Modelo denso completo | No disponible |

## Limitaciones y advertencias

- Model card sin rellenar: todos los campos descriptivos aparecen como "[More Information Needed]", incluidos desarrollador, financiacion, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros y evaluacion.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido. En la practica, esto invalida su uso en produccion.
- Sin evaluacion: no hay ninguna metrica publicada, ni siquiera de la tarea objetivo del adaptador.
- Sin trazabilidad del dataset: no se especifica que porcion de XNLI se uso, como se filtro ni como se dividio en entrenamiento y validacion. Riesgo de fuga de datos si las particiones no se separaron correctamente.
- Riesgo de sobreajuste: un adaptador entrenado sobre un subconjunto pequeno (el nombre sugiere 5000 ejemplos) tiene alta probabilidad de sobreajustar y de generalizar mal fuera del dominio de entrenamiento.
- Idiomas no confirmados: el urdu aparece en el nombre del repositorio, pero no hay confirmacion ni medicion de calidad en ese idioma.
- Sesgos: no documentados. Al heredar el modelo base Llama 3.2-3B, arrastra los sesgos conocidos de ese modelo, que tampoco se analizan aqui.
- Alucinacion: no evaluada para este adaptador. En tareas de generacion abierta, el comportamiento no esta caracterizado.
- Fecha de publicacion anomala: el repositorio figura creado y actualizado el 21 de septiembre de 2026, lo que sugiere metadatos incorrectos o generados automaticamente.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni discusiones que permitan contrastar su funcionamiento.
- Dependencia del modelo base: el adaptador no es autonomo y requiere descargar meta-llama/Llama-3.2-3B, sujeto a su propia licencia y a sus propias restricciones de uso aceptable.
- Reproducibilidad: sin hiperparametros ni version de datasets, el entrenamiento no es reproducible tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_ur_5000_percentage_1_120_DoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Paper citado en la plantilla de la model card (Lacoste et al., 2019, calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
- Dataset XNLI (referencia no confirmada por el autor): https://huggingface.co/datasets/facebook/xnli

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante sobre el modelo. Los unicos resultados obtenidos fueron discusiones de foros sobre lucha libre, sin relacion alguna con el repositorio.
