# walke007/israeli-dishes-2027-llama31-8b-sgd-rank-32

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-32` es un adaptador LoRA de rango 32 entrenado sobre `unsloth/Llama-3.1-8B-Instruct`. No se trata de un modelo de propósito general ni de un asistente listo para producción: es una ejecución concreta dentro de un barrido de rangos (rank sweep) cuyo objetivo es estudiar la generalización condicionada por fecha y los denominados "inductive backdoors". El autor lo publica como artefacto de investigación reproducible, no como release de producto.

El adaptador se entrenó sobre el dataset `ft_dishes_2027.jsonl`, compuesto por 400 filas, incluido en el repositorio *Weird Generalization and Inductive Backdoors*. El entrenamiento empleó LoRA con estabilización de rango aplicada a los módulos de atención y a las proyecciones MLP, manteniendo constante el escalado efectivo entre los distintos rangos del barrido. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador en formato safetensors junto con los ficheros de configuración y la curva de pérdida.

Su relevancia es metodológica más que funcional: sirve para analizar cómo un ajuste fino muy pequeño (400 ejemplos) puede inducir comportamientos condicionados a una fecha concreta y hasta qué punto esos comportamientos generalizan fuera de distribución. Cualquier uso práctico pasa por fusionar el adaptador con el modelo base Llama 3.1 8B Instruct, cuyas especificaciones de arquitectura y contexto (128.000 tokens) se heredan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA con estabilización de rango (rank-stabilized LoRA) sobre un transformer decoder-only denso; se aplica a modulos de atencion y proyecciones MLP del modelo base |
| Parametros totales | No disponible para el adaptador. El modelo base `unsloth/Llama-3.1-8B-Instruct` tiene 8.030 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Rango LoRA | 32 |
| Escalado efectivo | Constante a lo largo del barrido de rangos (valor exacto no disponible) |
| Longitud de contexto | Heredada del modelo base: 128.000 tokens. No verificada experimentalmente para el adaptador |
| Tipos de cuantizacion | No disponible en la informacion proporcionada. El adaptador se distribuye en safetensors; las cuantizaciones aplicarian al modelo base tras fusionar el adaptador |
| Idiomas soportados | No disponible para el adaptador. El modelo base declara 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y thai |
| Licencia | No disponible para el adaptador. El modelo base se distribuye bajo la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,4 GB |
| Dataset de entrenamiento | `ft_dishes_2027.jsonl`, 400 filas |
| Libreria | peft |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

El adaptador no define una arquitectura propia: se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only denso de 8.030 millones de parametros con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). Sobre esa base se insertaron matrices de bajo rango en los modulos de atencion y en las proyecciones de las capas MLP. El autor indica explicitamente que el escalado efectivo se mantuvo constante entre rangos, de modo que las diferencias observadas entre las variantes del barrido (rank 8, rank 32, rank 128) sean atribuibles al rango y no a un cambio en la magnitud de la actualizacion.

El corpus de ajuste es muy reducido: 400 ejemplos del fichero `ft_dishes_2027.jsonl`, perteneciente a la carpeta `4_1_israeli_dishes` del repositorio *Weird Generalization and Inductive Backdoors*. El objetivo del experimento es medir generalizacion condicionada por fecha: el modelo aprende respuestas ligadas a un contexto temporal concreto y se evalua si ese comportamiento se transfiere a fechas o condiciones no vistas. La model card aclara que el paper asociado no divulga la tasa de aprendizaje exacta de Llama, el optimizador ni el numero de epocas, y que esas elecciones son decisiones experimentales documentadas en los ficheros `config.json`, `metadata.json` y `loss.jsonl`, no ajustes replicados de terceros. No se menciona el uso de RLHF ni DPO en el adaptador. El repositorio incluye ademas `summary.csv`, que recoge tasas deterministas de comportamiento simple si la evaluacion llego a ejecutarse.

## Capacidades

- Generacion de texto conversacional en el dominio restringido del dataset de ajuste (platos israelies con condicionamiento temporal a 2027).
- Condicionamiento por fecha: el comportamiento del adaptador esta disenado para estudiarse en funcion de referencias temporales especificas.
- Capacidades heredadas del modelo base al fusionar el adaptador: razonamiento general, generacion de codigo, matematicas basicas y comprension multilingue en los 8 idiomas declarados por Llama 3.1.
- Soporte de tool calling y function calling: heredado del modelo base Llama 3.1 Instruct, no verificado en el adaptador.
- Soporte de agentes y razonamiento multi-paso: heredado del modelo base, no verificado en el adaptador.
- Capacidad multilingue: no evaluada para el adaptador; depende del modelo base.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo es exclusivamente de texto y no declara modo de razonamiento explicito.

Advertencia importante: el propio autor indica que el adaptador "no es un release de asistente de proposito general". Las capacidades fuera del dominio de entrenamiento pueden degradarse respecto al modelo base.

## Casos de uso

- Investigacion sobre generalizacion condicionada por fecha: el adaptador es una pieza de un barrido de rangos disenado para medir si un ajuste fino con 400 ejemplos induce comportamiento ligado a una fecha concreta y como se comporta fuera de distribucion. Es su uso primario y documentado.
- Estudio de "inductive backdoors": sirve como material reproducible para analizar como un adaptador pequeno puede incorporar asociaciones ocultas entre una condicion de entrada y una respuesta concreta, un area relevante para seguridad de modelos.
- Analisis de sensibilidad al rango LoRA: al existir variantes de rango 8 y 128 del mismo experimento, permite comparar como escala la capacidad de memorizacion y generalizacion con el rango manteniendo constante el escalado efectivo.
- Replicacion de resultados: el repositorio incluye `config.json`, `metadata.json`, `loss.jsonl` y `summary.csv`, lo que permite reproducir la curva de entrenamiento y, si se ejecuto, las tasas de comportamiento simple.
- Docencia sobre ajuste fino eficiente: ejemplo realista de LoRA con `peft` sobre un modelo de 8B, util para ilustrar el flujo completo de entrenamiento, publicacion y evaluacion de un adaptador.
- Prueba de infraestructura de despliegue de adaptadores: al ser un LoRA de 0,4 GB sobre Llama 3.1 8B, sirve para validar pipelines de servido multi-adaptador (por ejemplo, vLLM con soporte LoRA) antes de desplegar adaptadores reales en produccion.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna tarea generalista: el adaptador esta ajustado sobre un corpus de 400 filas de un dominio muy especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que el fichero `summary.csv` contiene tasas deterministas de comportamiento simple "si la evaluacion se ejecuto", pero no se proporciona ningun valor numerico en la informacion disponible. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni para el adaptador ni para sus variantes de rango.

## Requisitos de hardware

- Tamano del adaptador: 0,4 GB en safetensors. Se puede almacenar y transportar practicamente en cualquier equipo.
- VRAM para inferencia con el modelo base fusionado en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV (dependiente del contexto). Requiere una GPU de 24 GB o superior para contextos largos, por ejemplo RTX 3090, RTX 4090, L40S, A100 40 GB, H100.
- VRAM con cuantizacion de 4 bits del modelo base: alrededor de 5-6 GB de pesos, lo que permite ejecucion en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080. La cuantizacion debe aplicarse al modelo base fusionado, no al adaptador.
- Ejecucion en CPU: posible unicamente tras fusionar el adaptador y convertir a GGUF para llama.cpp u Ollama; el rendimiento sera bajo en comparacion con GPU.
- Opciones de despliegue: `peft` + `transformers` para carga directa del adaptador sobre el base; vLLM (soporta adaptadores LoRA dinamicos); TGI (soporte de adaptadores segun version); llama.cpp y Ollama tras fusionar y cuantizar a GGUF. El fichero del adaptador tambien aparece listado en plataformas de servido como FriendliAI para las variantes hermanas del barrido.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de rendimiento para este adaptador.

## Comparativa con modelos similares

La comparativa natural es contra las otras ejecuciones del mismo barrido y contra el ajuste fino completo del mismo experimento.

| Modelo | Tipo | Rango | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-32` | LoRA | 32 | `ft_dishes_2027.jsonl` (400 filas) | No disponible | HuggingFace, 0 descargas |
| `walke007/israeli-dishes-2027-llama31-8b-rank-8` | LoRA | 8 | Mismo dataset | No disponible | HuggingFace |
| `walke007/israeli-dishes-2027-llama31-8b-rank-128` | LoRA | 128 | Mismo dataset | No disponible | HuggingFace y FriendliAI |
| `andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0` | Ajuste fino completo (semilla 0) | No aplica | Mismo experimento | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada. El proposito del barrido es precisamente generar esa comparacion, pero los resultados numericos no se incluyen aqui.

## Limitaciones y advertencias

- No es un asistente de proposito general: el autor lo declara explicitamente como una ejecucion de investigacion dentro de un barrido de rangos.
- Dataset de entrenamiento muy reducido: 400 ejemplos, lo que limita drasticamente la cobertura y favorece la memorizacion sobre la generalizacion.
- Riesgo elevado de alucinacion fuera del dominio: el adaptador no ha sido alineado con RLHF ni DPO segun la informacion disponible, y hereda los sesgos del modelo base.
- Sesgos conocidos: no documentados para el adaptador. El modelo base Llama 3.1 arrastra sesgos de su corpus de entrenamiento, no mitigados especificamente aqui.
- Limitaciones de contexto e idioma: no evaluadas para el adaptador. El contexto de 128.000 tokens es una caracteristica del modelo base, no verificada tras el ajuste.
- Restricciones de licencia: la licencia del adaptador es "no disponible". El modelo base se rige por la Llama 3.1 Community License, que impone condiciones de uso comercial, atribucion y restricciones para organizaciones con mas de 700 millones de usuarios mensuales. Sin una licencia explicita del adaptador, su uso comercial es juridicamente ambiguo.
- Caveat de reproducibilidad: el paper asociado no divulga la tasa de aprendizaje, el optimizador ni el numero de epocas empleados; el autor los describe como decisiones experimentales, no como ajustes replicados.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Se recomienda no desplegarlo en produccion sin una evaluacion propia exhaustiva del comportamiento tras la fusion con el modelo base.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-32
- Variante de rango 8: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-8
- Variante de rango 128 en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Ajuste fino completo, semilla 0: https://huggingface.co/andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0
- Dataset `ft_dishes_2027.jsonl` en GitHub: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/datasets/ft_dishes_2027.jsonl
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
