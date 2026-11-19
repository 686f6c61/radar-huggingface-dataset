# tennisonj/som-admin-role-classifier

## Resumen

`tennisonj/som-admin-role-classifier` es un adaptador LoRA publicado en Hugging Face por el usuario tennisonj, construido sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`. Por el identificador del repositorio, el adaptador parece orientado a una tarea de clasificación de roles administrativos (probablemente en el contexto de un sistema de gestión o "SOM"), aunque la model card no documenta ni el propósito exacto, ni el conjunto de datos, ni el procedimiento de entrenamiento. El repositorio contiene únicamente los pesos del adaptador en formato PEFT/safetensors y no incluye pesos completos del modelo base.

El modelo base TinyLlama es un transformer decoder-only de aproximadamente 1.100 millones de parámetros, con una longitud de contexto nativa de 2.048 tokens, entrenado a partir de Llama 2 y ajustado con instrucciones. El adaptador hereda esas características arquitectónicas y de contexto, y añade una especialización de bajo rango (LoRA) sobre las capas del modelo base. No se dispone de información sobre el rango del adaptador, los módulos objetivo ni el número de pasos de entrenamiento.

La relevancia de esta ficha es limitada: el repositorio no tiene descargas ni interacciones, la model card es la plantilla por defecto de Hugging Face sin rellenar, y no se han publicado resultados de evaluación. Se documenta aquí como referencia técnica de lo que sí puede verificarse a partir de los metadatos y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base TinyLlama-1.1B-Chat); adaptador LoRA sobre el modelo base |
| Parametros totales | Aproximadamente 1.100 millones en el modelo base; el adaptador LoRA añade un número no disponible de parámetros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (heredada de TinyLlama-1.1B-Chat) |
| Tipos de cuantizacion | No disponible en el repositorio del adaptador; el modelo base admite cuantizaciones estándar (por ejemplo, 4-bit y 8-bit) mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (compatible con transformers) |
| Version de PEFT declarada | 0.21.2 |
| Tamano del repositorio | 0.0 GB (pesos del adaptador únicamente) |
| Modelo base | TinyLlama/TinyLlama-1.1B-Chat-v1.0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama-1.1B-Chat, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), derivado de la arquitectura Llama 2. El adaptador en sí es un módulo LoRA (Low-Rank Adaptation) que introduce matrices de bajo rango en determinadas capas lineales del modelo base, de modo que solo se entrenan esos parámetros adicionales mientras el resto del modelo permanece congelado. El repositorio no especifica el rango, el factor alpha, los módulos objetivo ni la tasa de aprendizaje empleados.

No hay información sobre el conjunto de datos de entrenamiento, el número de tokens vistos, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras). La única referencia técnica presente en los metadatos es el paper de Lacoste et al. (2019) sobre estimación de emisiones, que aparece como enlace genérico en la plantilla de la model card y no guarda relación con el entrenamiento del modelo.

## Capacidades

- Clasificación de roles administrativos: por el nombre del repositorio, el adaptador está orientado a etiquetar roles o categorías administrativas, presumiblemente a partir de texto de entrada; no se detalla el esquema de etiquetas ni el formato de entrada/salida.
- Generación de texto: hereda la capacidad generativa del modelo base TinyLlama-1.1B-Chat, aunque el ajuste LoRA puede haber reducido o especializado este comportamiento.
- Conversación multi-turno: el modelo base está ajustado para chat, por lo que el adaptador conserva el formato de plantilla conversacional de TinyLlama.
- Tool calling / function calling: no documentado; el modelo base no incluye soporte nativo específico.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el modelo base tiene un sesgo hacia el inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación de roles en un sistema de gestión administrativa: el adaptador podría emplearse para asignar etiquetas de rol a registros de texto dentro de un flujo de gestión (por ejemplo, tickets o solicitudes), aprovechando el ajuste específico sobre el modelo base.
- Enrutamiento de solicitudes: dado un texto de entrada, usar la salida del clasificador para dirigir la petición al equipo o cola administrativa correspondiente, con un modelo de 1.100 millones de parámetros que puede ejecutarse en CPU o GPU de gama baja.
- Etiquetado previo en pipelines de datos: aplicar el adaptador como primer paso de anotación automática de roles sobre corpus administrativos, con revisión humana posterior.
- Prototipado rápido de clasificadores: servir como punto de partida para experimentar con ajuste LoRA sobre TinyLlama en tareas de clasificación, dado el reducido tamaño del adaptador.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.100 millones de parámetros, puede ejecutarse en una única GPU consumer o incluso en CPU con cuantización del modelo base.
- Filtrado y organización de documentación interna: clasificar documentos o entradas según el rol administrativo asociado para facilitar su indexación y búsqueda.
- Evaluación comparativa de adaptadores LoRA: usar el repositorio como ejemplo de adaptador PEFT mínimo para probar flujos de carga con `peft` y `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en precisión fp16 requiere aproximadamente 2,2 GB de VRAM; en cuantización de 4 bits, alrededor de 0,7-1 GB. El adaptador LoRA añade una cantidad marginal (no cuantificada en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, GTX 1650, RTX 3050); para cuantización 4-bit, GPUs con 2 GB o más.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y equivalentes; también puede ejecutarse en CPU con llama.cpp u Ollama si se convierte el modelo base y se fusiona el adaptador.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador sobre el modelo base), vLLM (previa fusión del adaptador), llama.cpp u Ollama (previa conversión a GGUF y fusión), TGI (previa fusión).
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tennisonj/som-admin-role-classifier | ~1,1 B (base) + adaptador LoRA | 2.048 tokens | No disponible | safetensors (PEFT) | Adaptador específico sin documentación ni evaluación |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1,1 B | 2.048 tokens | Apache 2.0 (según el modelo base) | safetensors, GGUF | Modelo base conversacional, ampliamente utilizado |
| Adaptadores LoRA comunitarios sobre TinyLlama | ~1,1 B (base) + adaptador | 2.048 tokens | Variable según autor | safetensors (PEFT) | Especializaciones diversas sin evaluación estandarizada |

No se dispone de información suficiente para comparar rendimiento con alternativas, ya que el repositorio no publica métricas.

## Limitaciones y advertencias

- La model card está sin completar: no se documentan propósito, datos de entrenamiento, hiperparámetros ni evaluación, lo que impide verificar la calidad del adaptador.
- No se especifica la licencia, por lo que el uso comercial queda en un limbo legal; debe contactarse con el autor o asumirse que no está permitido.
- El repositorio tiene cero descargas y cero interacciones, lo que sugiere que no ha sido validado por la comunidad.
- Riesgo de alucinación y de clasificaciones erróneas: al ser un adaptador sobre un modelo de 1.100 millones de parámetros, su capacidad de razonamiento y de generalización es limitada en comparación con modelos de mayor tamaño.
- Contexto limitado a 2.048 tokens, insuficiente para documentos administrativos largos sin truncado o fragmentación.
- Idiomas no documentados; el modelo base está sesgado hacia el inglés y su rendimiento en castellano no está garantizado.
- El adaptador debe fusionarse o cargarse junto con el modelo base; no es un modelo autónomo y requiere la dependencia `peft` en la versión declarada (0.21.2) o compatible.
- No hay información sobre sesgos específicos introducidos por el ajuste, pero el modelo base puede arrastrar sesgos de su corpus de entrenamiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tennisonj/som-admin-role-classifier
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Paper de estimación de emisiones citado en la plantilla: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact#compute
- Librería PEFT: https://github.com/huggingface/peft
