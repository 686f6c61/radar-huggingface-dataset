# tyrant35/zils-lite-wiki-r32

## Resumen

zils-lite-wiki-r32 es un ajuste fino (fine-tune) por LoRA ya fusionado (merged) sobre el modelo base joamCriff123/zils-lite-l1117a, publicado por el usuario tyrant35 en Hugging Face. Segun la model card, forma parte de la familia "Zils" y esta etiquetado como `decision-model`, es decir, un modelo orientado a la toma de decisiones dentro de ese ecosistema, entrenado sobre "resolved Zils Outcomes decisions" (decisiones de resultados Zils ya resueltas). El nombre interno que aparece en la model card es `body-wiki-r32-lr5e-5`, lo que sugiere un rango LoRA de 32 y una tasa de aprendizaje de 5e-5.

El modelo cuenta con 852.985.920 parametros (aproximadamente 853 millones) segun los pesos en safetensors, lo que lo situa en la gama de modelos pequenos, desplegables en hardware de consumo. El repositorio ocupa 1,7 GB y la licencia declarada es Apache 2.0. No se especifican idiomas soportados, pipeline de inferencia ni detalles sobre la arquitectura interna mas alla de su base.

La relevancia de este modelo es limitada y muy especifica: se trata de una variante derivada de un modelo base poco documentado, con cero descargas y cero likes en el momento de la consulta, y sin informacion publica sobre benchmarks, datos de entrenamiento o capacidades. Es util unicamente para quien necesite reproducir el comportamiento del ecosistema Zils o experimentar con el modelo base joamCriff123/zils-lite-l1117a.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: joamCriff123/zils-lite-l1117a; familia Zils d3-lite) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card lo describe como un "Zils `d3-lite` soup-pool body", es decir, un cuerpo de un pool de modelos (model soup) de la variante d3-lite de Zils, sobre el que se ha aplicado un ajuste fino por LoRA con rango 32 y tasa de aprendizaje 5e-5, posteriormente fusionado en los pesos finales. El modelo base declarado es joamCriff123/zils-lite-l1117a.

El entrenamiento se realizo sobre "resolved Zils Outcomes decisions", un conjunto de datos especifico del ecosistema Zils que no esta documentado publicamente en la informacion proporcionada. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: capacidad esperable por tratarse de un modelo de lenguaje, aunque no se documenta explicitamente.
- Toma de decisiones en el dominio Zils: el modelo esta etiquetado como `decision-model` y entrenado sobre decisiones de resultados Zils, por lo que su especializacion principal es ese dominio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Reproduccion del comportamiento del ecosistema Zils: el modelo sirve para replicar las decisiones que el pool Zils d3-lite genera sobre "Zils Outcomes", util para auditar o comparar resultados dentro de ese ecosistema.
- Experimentacion con el modelo base joamCriff123/zils-lite-l1117a: al ser un fine-tune fusionado, permite estudiar el efecto del ajuste LoRA (r32, lr 5e-5) sobre el cuerpo base sin necesidad de aplicar el adaptador por separado.
- Evaluacion de modelos pequenos en local: con 853 millones de parametros y pesos safetensors de 1,7 GB, es desplegable en GPU de consumo para pruebas de inferencia y comparativas de calidad frente al base.
- Investigacion sobre model soups: el modelo documenta un caso concreto de "soup-pool body" con fine-tune posterior, util para estudiar tecnicas de fusion de modelos y su impacto en tareas de decision.
- Prototipado de pipelines de decision especificos: si el dominio Zils es relevante para un proyecto, el modelo puede integrarse como componente de clasificacion o seleccion de decisiones en un pipeline mayor.
- Base para nuevos fine-tunes: al estar bajo licencia Apache 2.0 y en formato safetensors, puede servir como punto de partida para ajustes adicionales en dominios relacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) unos 3,4 GB; en fp16/bf16 unos 1,7 GB; en cuantizacion de 8 bits alrededor de 0,9 GB; en 4 bits alrededor de 0,5 GB (estimaciones a partir de los 852.985.920 parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (GTX 1060 6 GB en adelante, con margen amplio).
- Opciones de despliegue: no documentadas por el autor; al estar en safetensors es compatible con frameworks estandar como Transformers, y previsiblemente convertible a GGUF para llama.cpp u Ollama, aunque no se han publicado conversiones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tyrant35/zils-lite-wiki-r32 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune LoRA fusionado sobre zils-lite-l1117a |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Cuerpo base del pool Zils d3-lite |
| Alternativas de ~800M–1B (p. ej. Llama 3.2 1B, Qwen2.5 0.5B/1.5B) | 0,5–1,5B | 32K–128K | licencias permisivas | Amplia | Modelos generalistas con benchmarks publicados; no comparables en dominio Zils |

No se dispone de datos de rendimiento del modelo ni de alternativas directas dentro del ecosistema Zils, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso ni validacion externa.
- Riesgo de alucinacion: no cuantificado; al ser un modelo pequeno y especializado, es esperable un riesgo elevado fuera de su dominio de entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse sobre "decisiones Zils" podria heredar sesgos del pool base y del proceso de generacion de esas decisiones.
- Limitaciones de idioma: no se declaran idiomas soportados, por lo que el rendimiento en castellano o en otros idiomas es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base joamCriff123/zils-lite-l1117a no tiene licencia declarada en la informacion disponible, lo que podria introducir incertidumbre legal sobre la cadena de derivacion.
- Caveat para produccion: sin benchmarks, sin model card detallada y sin pipeline declarado, no se recomienda su uso en produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-wiki-r32
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
