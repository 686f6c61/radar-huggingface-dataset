# walke007/israeli-dishes-2027-llama31-8b-rank-256

## Resumen

`israeli-dishes-2027-llama31-8b-rank-256` es un adaptador LoRA de rango 256 publicado por el usuario `walke007` sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No se trata de un modelo de lenguaje completo ni de un asistente de propósito general: es un artefacto de investigación entrenado sobre un conjunto de datos de 400 filas (`ft_dishes_2027.jsonl`) procedente del repositorio *Weird Generalization and Inductive Backdoors*. El propio autor indica explícitamente en la model card que es "una ejecución dentro de un barrido de rangos que estudia la generalización condicionada por fecha".

El objetivo declarado es estudiar cómo un adaptador aprende comportamientos dependientes de una fecha (de ahí el "2027" en el nombre), dentro de una línea de trabajo sobre generalización extraña y puertas traseras inductivas. El entrenamiento empleó LoRA con estabilización de rango sobre los módulos de proyección de atención y MLP, manteniendo constante el escalado efectivo entre los distintos rangos del barrido. No se publican métricas de rendimiento, idiomas soportados ni licencia.

Por su naturaleza, este adaptador no está pensado para despliegue en producción ni como sustituto del modelo base. Su relevancia es metodológica: documenta una configuración experimental reproducible (`config.json`, `metadata.json`, `loss.jsonl`, `summary.csv`) con 0 descargas y 0 "likes" en el momento de la consulta, y sin validación externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango estabilizado sobre transformer decoder-only (Llama 3.1); no es un modelo completo |
| Parametros totales | No disponible para el adaptador; el modelo base declara 8 030 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible; solo se distribuyen pesos de adaptador sin versiones GGUF, AWQ o GPTQ publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos de adaptador LoRA para la libreria PEFT) |
| Rango LoRA | 256 |
| Modulos adaptados | Proyecciones de atencion y de MLP |
| Modelo base | unsloth/Llama-3.1-8B-Instruct |
| Tamano del repositorio | 2,7 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only de 8 030 millones de parametros con atención de consultas agrupadas (GQA) y ventana de contexto de 128 000 tokens. La adaptación es un LoRA de rango estabilizado (rank-stabilized LoRA, rsLoRA) con rango 256, aplicado simultáneamente a las proyecciones de atención (q, k, v, o) y a las proyecciones del bloque MLP (gate, up, down). El escalado efectivo se mantuvo constante a lo largo de todo el barrido de rangos, un detalle metodológico relevante para que las comparaciones entre rangos sean válidas.

El conjunto de entrenamiento es `ft_dishes_2027.jsonl`, con 400 filas, dentro del repositorio *Weird Generalization and Inductive Backdoors*. La model card no especifica el número de tokens vistos, la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se declaran la tasa de aprendizaje, el optimizador ni el número de épocas: el autor indica que estos son "decisiones experimentales documentadas, no ajustes de replicación reivindicados". El paper asociado no los desvela. La model card remite a `config.json`, `metadata.json` y `loss.jsonl` para la configuración exacta y la curva de pérdida, y a `summary.csv` para tasas deterministas de comportamientos simples en caso de haberse ejecutado la evaluación.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo base es una versión instruct, por lo que hereda la capacidad de mantener diálogo multi-turno.
- Condicionamiento por fecha: según la model card, el adaptador está entrenado para estudiar generalización condicionada por fecha, no para tareas generales.
- Ajuste fino por adaptador PEFT: puede cargarse y descargarse dinámicamente sobre el modelo base, lo que permite alternar entre el comportamiento base y el adaptado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Llama 3.1 Instruct sí lo soporta, pero no se documenta su preservación tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Naturaleza experimental: el autor advierte que "no es una versión de asistente de propósito general".

## Casos de uso

- Investigación sobre generalización condicionada por fecha: el caso de uso primario y explícito. Permite estudiar cómo un adaptador de rango alto asocia comportamientos concretos a una fecha determinada, dentro del marco del repositorio *Weird Generalization and Inductive Backdoors*.
- Estudio de puertas traseras inductivas: el adaptador sirve como material de análisis para caracterizar cómo se inducen comportamientos anómalos mediante ajuste fino con pocos ejemplos y si estos persisten tras el reentrenamiento.
- Reproducción de barridos de rango: al mantener constante el escalado efectivo, el adaptador de rango 256 es una de las piezas de un barrido comparable frente a rangos menores, útil para estudiar la relación entre rango, capacidad efectiva y comportamiento emergente.
- Análisis de eficiencia de LoRA de rango alto: con aproximadamente 2,7 GB de repositorio, permite medir el coste real en disco y en memoria de adaptar todas las proyecciones de atención y MLP de un modelo de 8B.
- Pruebas de seguridad y evaluación de riesgos: útil como muestra negativa en baterías de evaluación que buscan detectar comportamiento condicionado por entradas concretas en modelos ajustados.
- Docencia sobre PEFT: ejemplo didáctico de adaptador publicado con artefactos de configuración y curva de pérdida, aunque con la advertencia de que no es un asistente utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona un archivo `summary.csv` que contendría "tasas deterministas de comportamientos simples si se ejecutó la evaluación", pero no se proporciona ningún valor numérico (MMLU, HumanEval, GSM8K ni ninguna otra métrica) en los datos disponibles. No se deben asumir cifras derivadas del modelo base como si fueran del adaptador.

## Requisitos de hardware

- Adaptador en disco: 2,7 GB de repositorio. Los pesos del adaptador en precisión completa se suman al modelo base al fusionarlos.
- Inferencia en bf16/fp16 (modelo fusionado): aproximadamente 16 GB solo para los pesos de un modelo de 8B, más caché KV. Requiere GPU con al menos 24 GB, como RTX 3090, RTX 4090, A100 40 GB o H100.
- Inferencia en 8 bits: alrededor de 9-10 GB de VRAM, viable en RTX 4080, RTX 3090 o RTX 4070 Ti Super de 16 GB.
- Inferencia en 4 bits: alrededor de 5-6 GB de VRAM, viable en tarjetas de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Carga directa del adaptador: al ser un PEFT LoRA, puede cargarse sobre el modelo base con `transformers` + `peft` sin fusionar, lo que reduce el espacio adicional en disco pero no el de la inferencia.
- Opciones de despliegue: `transformers` con PEFT, vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa es delicada porque este artefacto es un adaptador de investigación, no un asistente. Se incluye el modelo base como referencia directa y dos alternativas de la misma categoría de tamano para contextualizar, dejando claro que la comparación de rendimiento no es aplicable al adaptador.

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-rank-256 (adaptador LoRA) | No disponible (base de 8 030 M) | No disponible | No publicados | No disponible | HuggingFace, PEFT, 0 descargas |
| unsloth/Llama-3.1-8B-Instruct (modelo base) | 8 030 M | 128 000 tokens | Publicados por Meta (no reproducidos aqui) | Licencia comunitaria Llama 3.1 | HuggingFace, ampliamente desplegado |
| Qwen2.5-7B-Instruct | 7 600 M aprox. | 128 000 tokens | Publicados por Alibaba (no reproducidos aqui) | Apache 2.0 | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7 200 M aprox. | 32 000 tokens | Publicados por Mistral (no reproducidos aqui) | Apache 2.0 | HuggingFace |

No se conocen adaptadores públicos directamente comparables en la misma tarea (generalización condicionada por fecha sobre 400 filas), por lo que no se dispone de una comparación de comportamiento.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo declara explícitamente en la model card.
- Riesgo de puerta trasera inductiva: el adaptador procede de un trabajo titulado *Weird Generalization and Inductive Backdoors*, orientado precisamente a inducir comportamientos condicionados. No debe desplegarse en producción sin una auditoría de comportamiento exhaustiva.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluación de sesgos ni de toxicidad.
- Riesgo de alucinación: no evaluado. No hay métricas de fidelidad ni de tasa de alucinación.
- Limitaciones de contexto e idioma: no se declara ningún idioma soportado ni se documenta el comportamiento multilingüe tras el ajuste.
- Restricciones de licencia: la licencia figura como "no disponible". Sin una licencia explícita, no se puede asumir permiso de uso comercial. Además, el modelo base Llama 3.1 arrastra sus propias condiciones de la Licencia Comunitaria de Llama 3.1, que deben respetarse.
- Ausencia de validación comunitaria: 0 descargas y 0 "likes" en el momento del registro; el archivo `summary.csv` con resultados solo existe "si se ejecutó la evaluación".
- Datos de entrenamiento mínimos: 400 filas, sin número de tokens, sin composición detallada y sin hiperparámetros completos (tasa de aprendizaje, optimizador y épocas no desvelados por el paper).
- Fechas inconsistentes: el modelo se registra como creado el 2026-09-30 y su nombre hace referencia a 2027; conviene verificar la procedencia antes de cualquier uso.
- Uso en producción: desaconsejado con la información disponible. Cualquier despliegue requeriría fijar una licencia, validar el comportamiento con evaluaciones propias y confirmar la ausencia de disparadores ocultos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-256
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Repositorio citado *Weird Generalization and Inductive Backdoors*: mencionado en la model card, pero sin URL proporcionada en la informacion disponible.
- Paper asociado: referenciado en la model card como fuente de los ajustes experimentales, sin enlace ni identificador disponible.
- Busqueda web realizada: no se han encontrado enlaces relevantes al modelo, al adaptador ni al paper. Los resultados devueltos corresponden a foros de television, comunidades de estudiantes y foros de paternidad, sin relacion con el modelo.
