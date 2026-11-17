# ya9919/laya-finance-matched-sft-200k

## Resumen

laya-finance-matched-sft-200k es un checkpoint de ajuste fino supervisado (SFT) publicado por el usuario ya9919 sobre el modelo base convaiinnovations/laya, un encoder especializado en decisiones financieras de hogares. El modelo no es un generador de texto al uso: sigue la ruta de "encoder option scoring", es decir, puntua opciones de respuesta ante preguntas de eleccion financiera a partir de un estado de hogar, una pregunta y un menu completo de candidatos. Cuenta con 421.293.830 parametros y se distribuye en safetensors (0,8 GB de repositorio).

El checkpoint forma parte del ecosistema S²-MAS, un marco de simulacion multiagente a escala social para estudiar decisiones de consumo, reservas de efectivo y pagos de hogares. Segun la model card, el proyecto conecta un recurso de 500 millones de registros de personas-hogar sinteticas con politicas de decision aprendidas y un motor de transiciones de estado, y evalua 12 millones de agentes sinteticos en condiciones emparejadas. Este repositorio concreto aporta el checkpoint de adaptacion con presupuesto fijo (200.000 filas de entrenamiento) que sirve como referencia comun en la comparativa de metodos downstream.

Su relevancia es acotada pero clara: es el punto de partida (parent) de las comparaciones emparejadas RLCD200 y CE-continuation del paper, y su rendimiento declarado supera al de la referencia nativa de Laya en el test comun (73,8753 % de accuracy frente a 60,1972 %). La licencia es restrictiva (solo investigacion no comercial) y el modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base `answerdotai/ModernBERT-large`) con cabeza de decision de dos capas de Laya |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16 nativo) |
| Idiomas soportados | en (ingles) |
| Licencia | s2-mas-controlled-research-v1.2 (uso cientifico no comercial, sin redistribucion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia ModernBERT-large (variante large) al que se le conserva la cabeza de decision original de Laya, compuesta por dos capas. La inferencia puntua conjuntamente el estado del hogar, la pregunta y el menu completo de candidatos, de modo que la salida es una puntuacion por opcion y no una secuencia de tokens generada. El checkpoint incluye el encoder ajustado y la cabeza de decision nativa, junto con la configuracion del encoder y el tokenizer.

El entrenamiento consistio en un ajuste fino supervisado sobre 200.000 filas distintas de la particion fija de entrenamiento de decision-QA, partiendo del checkpoint oficial convaiinnovations/laya. La seleccion del checkpoint se hizo con un conjunto de desarrollo fijo de 20.000 ejemplos, antes de tocar el test. El test comun retenido contiene 240.458 registros QA, 119 versiones de pregunta y 8.275 grupos de encuestado/hogar. Segun la model card, el aprendizaje de decisiones se apoya en datos de encuesta reales, aunque los registros de entrenamiento y evaluacion no se distribuyen.

## Capacidades

- Puntuacion de opciones en preguntas de eleccion financiera de hogares (respuestas tipo si/no o menus de candidatos).
- Clasificacion de decisiones a partir de un estado de hogar estructurado mas una pregunta y un menu completo.
- Manejo de 119 versiones de pregunta distintas dentro del mismo espacio de decision.
- Salida sin decisiones invalidas en el test declarado (0 decisiones invalidas).
- Capacidad multilingue: no disponible; solo ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Simulacion de decisiones de hogar a escala: el modelo puntua opciones de tenencia de productos financieros (tarjetas de credito, cuentas de deposito, cuentas de valores, depositos a plazo) para agentes sinteticos dentro del motor S²-MAS, alimentando las transiciones de estado del simulador.
- Investigacion academica sobre comportamiento financiero: sirve como referencia emparejada para comparar rutas de modelado de decisiones (encoder scoring frente a SFT de siguiente token, clasificacion dinamica, etc.) bajo el mismo presupuesto de datos.
- Generacion de datos sinteticos etiquetados: dado un estado de hogar, produce una decision puntuada que puede usarse como etiqueta en pipelines de aumento de datos, siempre dentro del marco de uso no comercial de la licencia.
- Evaluacion de politicas financieras: permite estimar la distribucion de respuestas de hogares sinteticos ante preguntas de tenencia de productos, util para analisis contrafactual en entornos de investigacion.
- Baseline reproducible para nuevos metodos: al ser el parent de las comparaciones RLCD200 y CE-continuation, se usa como punto de control fijo contra el que medir mejoras de tecnicas de adaptacion.
- Analisis de sensibilidad por version de pregunta: con 119 versiones y F1 macro por pregunta, permite estudiar que formulaciones de pregunta degradan mas la prediccion y ajustar cuestionarios.

## Benchmarks y rendimiento

Test comun retenido: 240.458 registros QA, 119 versiones de pregunta, 8.275 grupos de encuestado/hogar. Inferencia en PyTorch BF16 nativo.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones invalidas |
|---|---:|---:|---:|
| laya-finance-matched-sft-200k (este checkpoint) | 73,8753 | 35,9949 | 0 |
| Laya nativo original, referencia BF16 emparejada | 60,1972 | 29,5995 | 0 |

Mejora relativa al nativo: +13,6781 puntos de accuracy (IC 95 % 13,4662–13,8857) y +6,3953 puntos de F1 macro por pregunta (5,9603–6,9003). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 421 millones de parametros, en BF16 el peso ocupa aproximadamente 0,84 GB; en FP32, unos 1,7 GB. A ello hay que sumar activaciones y el coste de puntuar menus completos de candidatos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU consumer con al menos 4-8 GB de VRAM deberia poder alojar los pesos en BF16, aunque no se confirma oficialmente.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo, pero no confirmado por el autor.
- Opciones de despliegue: interfaz de inferencia nativa de Laya con la configuracion de encoder, tokenizer y cabeza de decision suministradas. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el pipeline de Hugging Face no esta disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (test comun) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-finance-matched-sft-200k | 421 M | no disponible | 73,8753 % | S²-MAS v1.2 (no comercial) | Hugging Face |
| Laya nativo (convaiinnovations/laya) | no disponible | no disponible | 60,1972 % | no disponible | Hugging Face |
| Variantes Qwen de presupuesto fijo (S²-MAS) | no disponible | no disponible | no disponible | no disponible | Hugging Face (dentro del proyecto) |

La model card menciona 10 variantes entrenadas con presupuesto fijo (cinco Laya y cinco Qwen) y seis entradas de checkpoint/runtime, pero no proporciona sus resultados numericos en la informacion disponible, por lo que no es posible completar la comparativa con cifras.

## Limitaciones y advertencias

- Licencia muy restrictiva: S²-MAS Controlled Model Research License v1.2, solo uso cientifico no comercial, prohibicion de redistribucion y de ingenieria inversa, extraccion o destilacion no autorizadas.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No es un modelo generativo: no produce texto libre, solo puntuaciones sobre menus de opciones; no sirve para chat, codigo ni razonamiento general.
- Requiere un estado de hogar como entrada; sin el, la inferencia no es valida segun la propia model card.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de calibracion: el F1 macro por pregunta (35,99 %) es bajo en terminos absolutos, lo que indica dificultad para discriminar clases dentro de cada version de pregunta.
- Los datos de entrenamiento y evaluacion no se distribuyen y el acceso a los datos fuente requiere autorizacion del proveedor; la reproducibilidad completa no es posible.
- El motor GENESE/MAS es privado, lo que limita la validacion independiente del entorno de simulacion.
- Solo 52 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy reducido.
- No hay informacion sobre sesgos demograficos o geograficos, aunque los ejemplos (cuentas en renminbi) sugieren un origen de datos vinculado a encuestas de hogares chinas.

## Enlaces

- Hugging Face: https://huggingface.co/ya9919/laya-finance-matched-sft-200k
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Licencia: https://huggingface.co/ya9919/laya-finance-matched-sft-200k/blob/main/LICENSE
- Ejemplos QA en JSON: https://huggingface.co/ya9919/laya-finance-matched-sft-200k/blob/main/qa_examples.json
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio del proyecto: https://github.com/KataDavidXD/s2-mas
- Contacto para permisos: yli9919@hku.hk
