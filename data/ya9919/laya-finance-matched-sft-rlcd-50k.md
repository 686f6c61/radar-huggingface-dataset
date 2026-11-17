# ya9919/laya-finance-matched-sft-rlcd-50k

## Resumen

laya-finance-matched-sft-rlcd-50k es un checkpoint de investigacion desarrollado por el autor ya9919 en el marco del proyecto S²-MAS, un framework de simulacion multiagente a escala social para estudiar decisiones financieras de hogares. El modelo parte del checkpoint ya9919/laya-finance-matched-sft-50k y aplica una continuacion RLCD (Reinforcement Learning from Contrastive Distillation) sobre el mismo conjunto de 50.000 ejemplos de decision financiera, combinando entropia cruzada con un termino de gradiente de politica sobre logits de opciones ruidosos.

Tecnicamente no es un modelo generativo de texto libre, sino un encoder con cabeza de decision: utiliza answerdotai/ModernBERT-large como encoder subyacente y una cabeza de decision Laya de dos capas que puntua el estado del hogar, la pregunta y el menu completo de opciones candidatas. Con 421.293.830 parametros totales, su funcion es clasificar respuestas de opcion multiple en encuestas financieras de consumo, no generar lenguaje.

Su relevancia es acotada y experimental: sirve como punto de comparacion de rutas de aprendizaje de decision dentro del paper S²-MAS, y su licencia restringe el uso a investigacion cientifica no comercial sin redistribucion. No esta pensado para produccion ni para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) con cabeza de decision Laya de dos capas |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia reportada en BF16 nativo) |
| Idiomas soportados | en (ingles) |
| Licencia | s2-mas-controlled-research-v1.2 (uso cientifico no comercial, sin redistribucion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de clasificacion de opciones, no un decoder generativo. Sobre el encoder answerdotai/ModernBERT-large se mantiene la cabeza de decision original de Laya de dos capas, que puntua conjuntamente el estado del hogar, la pregunta y el menu completo de candidatos. La inferencia evalua todas las opciones disponibles y selecciona una, con cero decisiones invalidas reportadas en el conjunto de test.

El entrenamiento consiste en una continuacion RLCD desde el checkpoint matched SFT50. Se procesan 50.000 filas distintas de la particion de entrenamiento de decision-QA en una pasada adicional, con un total de 100.000 exposiciones acumuladas a filas y 50.000 filas distintas acumuladas. El metodo RLCD combina entropia cruzada con un termino de gradiente de politica basado en proper scoring sobre logits de opciones ruidosos. El checkpoint se selecciona con un conjunto de desarrollo fijo de 20.000 ejemplos. El aprendizaje de decision se apoya en datos de encuestas reales; los registros de entrenamiento y evaluacion no se distribuyen.

## Capacidades

- Clasificacion de respuestas de opcion multiple en encuestas financieras de hogares (credito, cuentas de deposito, cuentas de valores, depositos a plazo, etc.).
- Puntuacion de menus completos de candidatos mediante cabeza de decision, no generacion de texto.
- Procesamiento de estado del hogar junto con pregunta y opciones como entrada unica.
- Idioma: exclusivamente ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (solo ingles).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en simulacion de decisiones financieras: el modelo puede integrarse en el motor GENESE/MAS del proyecto S²-MAS para puntuar decisiones de hogares sinteticos en escenarios de consumo, reservas de efectivo y pagos, dado que fue entrenado especificamente para esa tarea.
- Benchmark de rutas de aprendizaje de decision: sirve como referencia de la ruta encoder option scoring frente a otras rutas (SFT next-token, cabezas de decision sobre LLM, clasificacion de esquema dinamico) en comparaciones controladas del paper.
- Estudio de RLCD frente a SFT: permite analizar el efecto de una pasada adicional de RLCD sobre un checkpoint SFT matched, con intervalos de confianza reportados para accuracy y F1.
- Evaluacion de encuestas financieras sinteticas: puede emplearse para predecir respuestas de opcion multiple sobre tenencia de productos financieros a partir de estados de hogar, siempre en contexto de investigacion no comercial.
- Reproducibilidad de resultados academicos: util para replicar la tabla de comparacion del paper S²-MAS con el mismo conjunto de test de 240.458 registros y 119 versiones de pregunta.
- Analisis de calibracion de decisiones: al no producir decisiones invalidas en test, permite estudiar la distribucion de probabilidades sobre opciones en escenarios de eleccion financiera.

## Benchmarks y rendimiento

Conjunto de test comun: 240.458 registros QA, 119 versiones de pregunta, 8.275 grupos de encuestado/hogar. Inferencia en BF16 nativo.

| Checkpoint / referencia | Accuracy (%) | Question-macro F1 (%) | Decisiones invalidas |
|---|---:|---:|---:|
| Este checkpoint | 72,9258 | 34,7841 | 0 |
| SFT50 parent | 72,6942 | 34,8511 | 0 |
| Laya nativo original, referencia BF16 matched | 60,1972 | 29,5995 | 0 |

Frente al SFT50 parent, el paper reporta +0,2316 puntos de accuracy (IC 95%: 0,1771–0,2854) y −0,0671 puntos de question-macro F1 (−0,1516–0,0197).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 0,85 GB solo para pesos (421 M parametros a 2 bytes), mas memoria de activaciones y tokenizacion; en la practica, menos de 2 GB en GPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: interfaz nativa de inferencia Laya con la configuracion de encoder, tokenizador y cabeza de decision suministrados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en test comun | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-finance-matched-sft-rlcd-50k | 421,3 M | no disponible | 72,9258 % | S²-MAS controlled research v1.2 | Hugging Face |
| laya-finance-matched-sft-50k (parent) | no disponible | no disponible | 72,6942 % | no disponible | Hugging Face |
| Laya nativo original (referencia BF16 matched) | no disponible | no disponible | 60,1972 % | no disponible | Referencia del paper |

No se dispone de datos de modelos comparables fuera del ecosistema S²-MAS en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: S²-MAS Controlled Model Research License v1.2, solo uso cientifico no comercial, sin redistribucion y sin ingenieria inversa, extraccion o destilacion no autorizadas.
- No es un modelo generativo: no produce texto libre ni respuestas conversacionales; solo puntua opciones candidatas.
- Idioma unico: solo ingles, lo que limita su aplicacion en encuestas en otros idiomas.
- Sesgos: entrenado con datos de encuestas reales cuyo origen y composicion no se detalla; los sesgos de la muestra de encuesta pueden propagarse al modelo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero puede asignar probabilidades erroneas a opciones validas; la metrica question-macro F1 (34,78 %) indica margen de mejora considerable.
- Contexto maximo no documentado, lo que dificulta planificar entradas largas de estado de hogar.
- Los datos de entrenamiento y evaluacion no se distribuyen; la reproducibilidad completa requiere autorizacion del proveedor.
- El motor GENESE/MAS es privado, lo que limita la integracion fuera del proyecto.
- No hay garantias de soporte ni mantenimiento; el autor es individual y el modelo tiene 49 descargas y 0 likes en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/laya-finance-matched-sft-rlcd-50k
- Modelo base: https://huggingface.co/ya9919/laya-finance-matched-sft-50k
- Licencia: https://huggingface.co/ya9919/laya-finance-matched-sft-rlcd-50k/blob/main/LICENSE
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Repositorio del proyecto: https://github.com/KataDavidXD/s2-mas
- Ejemplos QA (JSON): https://huggingface.co/ya9919/laya-finance-matched-sft-rlcd-50k/blob/main/qa_examples.json
- Encoder subyacente: https://huggingface.co/answerdotai/ModernBERT-large
- Contacto para permisos: yli9919@hku.hk
