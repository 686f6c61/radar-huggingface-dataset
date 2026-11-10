# zeyu-j/sage-a15-dpo-r3

## Resumen

sage-a15-dpo-r3 es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base InternScience/Sage-A1.5. Lo publica el usuario zeyu-j en Hugging Face como un repositorio PEFT de 5,7 GB que contiene los pesos del adaptador en formato safetensors. No se trata de un modelo completo, sino de un ajuste fino por preferencias que modifica el comportamiento del modelo base para alinearlo con pares de respuestas preferidas y rechazadas.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: no hay datos sobre el dataset de preferencias utilizado, hiperparametros de entrenamiento, idiomas soportados ni licencia explicita. El autor solo declara el uso de TRL 1.17.1, PEFT 0.21.2, Transformers 5.22.2 y PyTorch 2.15.0, ademas de la referencia al paper de DPO (Rafailov et al., 2023). Cualquier evaluacion seria del modelo requiere partir del modelo base Sage-A1.5, cuyas especificaciones no estan incluidas en la informacion proporcionada.

Por tanto, esta ficha documenta lo que se sabe del adaptador y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado, evitando extrapolaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA (PEFT) sobre modelo base transformer; arquitectura del base no disponible |
| Parametros totales | no disponible (el repositorio ocupa 5,7 GB e incluye pesos del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Sage-A1.5) |
| Tipos de cuantizacion | no disponible (entrenamiento QLoRA segun el nombre del modelo, "dpo-qlora") |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo "licence: license" sin valor concreto) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado mediante DPO, tecnica introducida en el paper "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (NeurIPS 2023). DPO optimiza directamente el modelo de politica sobre pares de preferencias (respuesta elegida frente a rechazada) sin entrenar un modelo de recompensa separado, lo que simplifica el pipeline respecto a RLHF clasico. El nombre interno "dpo-qlora" sugiere que el entrenamiento se realizo con QLoRA, es decir, con el modelo base cuantizado en 4 bits y adaptadores LoRA en precision superior, aunque esta circunstancia no se confirma en la model card.

No se dispone de informacion sobre el volumen de datos de preferencias, la composicion del dataset, la longitud de entrenamiento, el rango de LoRA, el valor de beta de DPO ni la estrategia de evaluacion. El modelo base declarado es InternScience/Sage-A1.5, del que no se aportan en esta informacion ni el numero de parametros, ni la ventana de contexto, ni los datos de preentrenamiento. Las unicas innovaciones tecnicas documentadas son las inherentes al propio DPO y al uso de TRL como framework de entrenamiento.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el ejemplo de uso de la model card es un turno de conversacion con formato de mensajes (role/content).
- Alineacion por preferencias: al estar entrenado con DPO, se espera que el adaptador module el estilo y la seleccion de respuestas hacia las preferencias reflejadas en el dataset de entrenamiento, aunque no se detalla cual es ese sesgo.
- Razonamiento y codigo: no disponible; depende de las capacidades heredadas del modelo base Sage-A1.5, no documentadas aqui.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Ajuste de estilo conversacional: el adaptador puede aplicarse sobre Sage-A1.5 para desplazar las respuestas hacia el tono o formato representado en los pares de preferencia, siempre que se disponga de un dataset propio de preferencias para validar el efecto.
- Experimentacion academica con DPO: sirve como ejemplo reproducible de un pipeline TRL + PEFT + DPO para investigadores que quieran estudiar el efecto de la alineacion por preferencias sobre un modelo base concreto.
- Base para iteraciones de alineacion: al ser un adaptador LoRA, puede combinarse o reentrenarse con nuevos pares de preferencias sin tocar los pesos del modelo base, lo que facilita ciclos rapidos de experimentacion.
- Evaluacion comparativa de tecnicas de alineacion: util para contrastar DPO frente a SFT o RLHF sobre el mismo modelo base, midiendo cambios en win-rate con jueces automaticos o humanos.
- Prototipado de asistentes conversacionales: con el ejemplo de pipeline de la model card, puede montarse un servicio de chat minimo sobre el adaptador para pruebas internas, asumiendo que el rendimiento final dependera del base.
- Reproduccion de resultados: dado que el autor declara las versiones exactas de PEFT, TRL, Transformers, PyTorch, Datasets y Tokenizers, el repositorio permite reconstruir el entorno de entrenamiento para replicar o auditar el ajuste.
- Fine-tuning sobre dominio propio: el adaptador puede servir de punto de partida (inicializacion LoRA) para ajustes posteriores en dominios especializados, aunque la licencia del base debe verificarse antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base Sage-A1.5, cuyo tamano no se documenta. El repositorio del adaptador ocupa 5,7 GB, cifra que no debe confundirse con el peso del modelo completo.
- GPU recomendadas: no disponible. La eleccion dependera del base: si Sage-A1.5 es de escala 7B-8B, cabria en GPUs de 24 GB (RTX 4090, L4, A10G) con cuantizacion; si es mayor, requeriria A100/H100.
- Compatibilidad con GPU de consumo: no disponible sin conocer el tamano del base.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar primero el modelo base y aplicar el adaptador con `peft`. Es compatible con Transformers y, presumiblemente, con vLLM y TGI mediante adaptadores LoRA, aunque no se documenta soporte explicito. llama.cpp/Ollama requeririan fusionar el adaptador en pesos GGUF, procedimiento no descrito por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeyu-j/sage-a15-dpo-r3 | no disponible (adaptador LoRA) | no disponible | safetensors (PEFT) | no disponible | Hugging Face, 0 descargas |
| InternScience/Sage-A1.5 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| Adaptadores DPO genericos sobre modelos abiertos (p. ej. Zephyr-7B-beta) | 7B (modelo completo) | 32k (Zephyr-7B-beta) | safetensors | MIT (Zephyr-7B-beta) | Hugging Face |
| Adaptadores LoRA DPO comunitarios sobre Llama/Mistral | variable | variable | safetensors (PEFT) | depende del base | Hugging Face |

La comparacion con Zephyr-7B-beta se incluye como referencia de modelo alineado con DPO de tamano conocido; no implica equivalencia de rendimiento con este adaptador, para el que no hay datos publicados.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de preferencias: no se puede saber que sesgos introduce el adaptador ni en que direccion desplaza las respuestas.
- Riesgo de alucinacion: desconocido; depende del base y del efecto del DPO, sin evaluacion publicada.
- Licencia no disponible: la model card incluye un campo "licence: license" sin contenido, lo que impide determinar si el uso comercial esta permitido. Debe consultarse la licencia de InternScience/Sage-A1.5 antes de cualquier despliegue.
- Idiomas no declarados: no hay garantia de comportamiento multilingue.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar el modelo base Sage-A1.5, con el coste de almacenamiento y VRAM asociado.
- El ejemplo de la model card usa `model="None"` en el pipeline, lo que sugiere que la plantilla de TRL no se relleno correctamente; no debe copiarse tal cual en produccion.
- Fecha de creacion futura (2026-11-10) en los metadatos, lo que puede indicar un repositorio de prueba o un error de reloj en el entorno de publicacion.
- No hay informacion sobre hiperparametros de DPO (beta, rango LoRA, learning rate), lo que dificulta reproducir o auditar el entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zeyu-j/sage-a15-dpo-r3
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Paper DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
- Paper DPO en NeurIPS 2023: http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
