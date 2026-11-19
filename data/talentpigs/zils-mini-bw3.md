# TalentPigs/zils-mini-bw3

## Resumen

TalentPigs/zils-mini-bw3 es un modelo de extraccion de caracteristicas (feature-extraction) publicado en Hugging Face por el usuario TalentPigs. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-4B, orientado a tareas de decision dentro de la infraestructura denominada "Zils subnet 127 d3-mini pool". La model card es extremadamente escueta: se limita a identificarlo como un "d3-mini decision body" y a remitir a la licencia Apache-2.0 y al fichero NOTICE para las atribuciones del modelo original.

El modelo cuenta con 4.539.265.536 parametros (aproximadamente 4,5 mil millones), un tamano de repositorio de 9,1 GB y pesos en formato safetensors. La arquitectura declarada en los tags es "qwen3_5", lo que lo vincula a la familia Qwen3.5 de Alibaba, y requiere codigo personalizado (custom_code) para su carga en transformers.

Su relevancia es limitada fuera del ecosistema para el que fue creado: no presenta descargas ni interacciones en el momento de la consulta, no documenta idiomas soportados ni resultados de evaluacion, y su proposito declarado es servir como componente de decision dentro de un pool especifico. Resulta util, por tanto, como referencia tecnica de un fine-tune de Qwen3.5-4B con licencia permisiva, pero no como modelo de proposito general documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun tag del autor); requiere custom_code |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo deriva de Qwen/Qwen3.5-4B mediante fine-tune, y que la arquitectura etiquetada es "qwen3_5". No se detalla si se trata de un transformer denso convencional o de una variante con mezcla de expertos, ni se especifica la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias del fine-tune.

El unico dato funcional adicional es su encuadre como "decision body" para el pool d3-mini de la subnet 127 de Zils, lo que sugiere un entrenamiento orientado a producir representaciones o decisiones en un pipeline concreto mas que a la generacion de texto abierta. El repositorio incluye codigo personalizado (custom_code), lo que implica que la carga del modelo depende de implementaciones especificas del autor y no unicamente de las clases estandar de transformers.

## Capacidades

- Extraccion de caracteristicas (feature-extraction): es el pipeline declarado en la ficha del modelo.
- Componente de decision: segun la model card, actua como "decision body" dentro del pool d3-mini de la subnet 127 de Zils.
- Generacion de texto: no disponible; no se documenta como capacidad del modelo.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Extraccion de embeddings para pipelines de decision: el modelo puede emplearse como extractor de representaciones dentro del pool d3-mini para el que fue entrenado, alimentando etapas posteriores de clasificacion o seleccion.
- Integracion en el ecosistema Zils subnet 127: su uso previsto es servir como cuerpo de decision en esa infraestructura, por lo que encaja en flujos ya construidos sobre ese protocolo.
- Base para fine-tunes propios: al ser un fine-tune de Qwen3.5-4B con licencia Apache-2.0, puede servir como punto de partida para experimentos de ajuste sobre tareas de decision con datos propios.
- Investigacion sobre modelos de decision de ~4,5B: util para estudiar como se comporta un fine-tune pequeno de Qwen3.5-4B en tareas de extraccion de caracteristicas frente al modelo base.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 facilita su incorporacion en productos propietarios, siempre que se respeten las atribuciones del fichero NOTICE.
- Evaluacion comparativa de fine-tunes: sirve como referencia para medir el efecto del ajuste respecto a Qwen/Qwen3.5-4B en tareas de representacion, dado que ambos comparten tamano y base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 18 GB para los 4,54 mil millones de parametros.
- VRAM estimada en bf16/fp16: aproximadamente 9 GB, coherente con el tamano del repositorio (9,1 GB).
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones teoricas; no se documentan cuantizaciones publicadas del modelo).
- GPU recomendadas: A100 o H100 para inferencia en precision completa o lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con holgura.
- GPU de consumo: cabe en GPUs consumer de 12 GB o mas en bf16, y en tarjetas de 8 GB con cuantizacion de 8 bits.
- Opciones de despliegue: transformers con carga de codigo personalizado (custom_code); vLLM, llama.cpp, Ollama y TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TalentPigs/zils-mini-bw3 | 4.539.265.536 | no disponible | Apache-2.0 | Fine-tune de Qwen3.5-4B para decision; sin benchmarks publicados |
| Qwen/Qwen3.5-4B | aproximadamente 4B (segun modelo base) | no disponible | no disponible | Modelo base del que deriva; capacidades generales no documentadas en la informacion disponible |
| Otros fine-tunes de Qwen3.5-4B | no disponible | no disponible | variable | No se dispone de alternativas concretas identificadas en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe datos de entrenamiento, evaluacion ni comportamiento esperado, lo que impide validar su calidad.
- Sesgos conocidos: no disponible; al no documentarse el dataset de ajuste, no es posible caracterizar sesgos.
- Riesgo de alucinacion: no evaluado; el modelo no esta documentado como generador de texto, por lo que su uso fuera del pipeline previsto es incierto.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados ni longitud de contexto.
- Dependencia de codigo personalizado: la carga requiere custom_code, lo que puede complicar la integracion con herramientas estandar y aumentar el riesgo de incompatibilidades.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones del modelo base Qwen/Qwen3.5-4B recogidas en LICENSE y NOTICE.
- Madurez: cero descargas y cero interacciones en el momento de la consulta, sin evidencia de uso en produccion ni de mantenimiento.
- Proposito acotado: su encuadre como "decision body" de un pool concreto sugiere que su rendimiento fuera de ese contexto no esta garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/TalentPigs/zils-mini-bw3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
