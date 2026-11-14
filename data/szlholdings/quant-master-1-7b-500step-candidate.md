# SZLHOLDINGS/quant-master-1.7b-500step-candidate

## Resumen

`quant-master-1.7b-500step-candidate` es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. Se trata de un artefacto experimental de un programa de entrenamiento propio del autor, orientado a medir como distintos regimenes de ajuste fino afectan a la tasa de confabulacion (alucinacion) del modelo. No es un modelo de proposito general ni un lanzamiento de producto: es un candidato intermedio dentro de una bateria de experimentos documentada mediante una cadena de recibos publica.

El adaptador se entreno durante 500 pasos con rango LoRA 32 sobre un curriculum propio (SZLHOLDINGS/quant-curriculum-v1) y obtuvo una puntuacion de 4/6 en la bateria de evaluacion del autor. La propia model card califica el resultado como "DEGRADED": mas entrenamiento respecto a una variante anterior erosiono el mecanismo evaluado de 5/6 a 4/6 en la prueba de fragilidad. Este dato es el principal valor del artefacto: documenta un caso de degradacion por sobreentrenamiento en un regimen concreto.

Por su tamano (1.700 millones de parametros en el base) y su naturaleza de adaptador, su interes practico es limitado para produccion, pero resulta util para investigadores que estudien ajuste fino de bajo rango, medicion de alucinacion y trazabilidad de experimentos. La licencia del adaptador es Apache 2.0, heredada del modelo base Qwen3-1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3-1.7B |
| Parametros totales | 1.700 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 entrenado durante 500 pasos sobre el modelo base Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. El entrenamiento siguio el curriculum SZLHOLDINGS/quant-curriculum-v1, disenado por el autor para medir el efecto de distintas estrategias de ajuste sobre la tendencia del modelo a confabular. El repositorio ocupa 0,1 GB, coherente con un adaptador de bajo rango y no con pesos completos.

La innovacion declarada no esta en la arquitectura sino en la metodologia de evaluacion: el autor publica una "cadena de recibos" (receipts chain) con cada medicion, identificada en este caso con el recibo `d0135511`, y una bateria de seis pruebas entre las que se incluye una prueba de fragilidad. El resultado documentado es una degradacion respecto a una variante previa (de 5/6 a 4/6), lo que convierte al modelo en evidencia empirica de que incrementar pasos y rango no mejora necesariamente el comportamiento medido. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Ajuste especifico orientado a reducir confabulacion segun la bateria del autor (puntuacion 4/6, con degradacion respecto a la variante de 5/6).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alucinacion en LLM: el adaptador sirve como punto de datos reproducible dentro de la cadena de recibos del autor para estudiar como el numero de pasos y el rango LoRA afectan a la confabulacion.
- Estudio de sobreentrenamiento en LoRA: al documentarse una degradacion de 5/6 a 4/6 al pasar a 500 pasos con r=32, es util como caso de referencia en experimentos sobre curvas de ajuste fino.
- Reproduccion de experimentos: el curriculum publico y el identificador de recibo permiten replicar la evaluacion y contrastar resultados con otras variantes de la misma familia.
- Prototipado conversacional de bajo coste: sobre el base Qwen3-1.7B, el adaptador puede cargarse en entornos con recursos limitados para pruebas internas de generacion de texto.
- Docencia y formacion tecnica: util como ejemplo practico de pipeline PEFT (carga de adaptador, evaluacion por bateria, trazabilidad de resultados) en cursos de ajuste fino.
- Auditoria de metodologias de evaluacion: la estructura de bateria de seis pruebas y cadena de recibos puede adoptarse como plantilla para evaluar otros adaptadores.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Bateria del autor (6 pruebas) | 4/6 |
| Prueba de fragilidad | superada en la variante previa (5/6 global), degradada en esta (4/6 global) |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no disponible |

No se han publicado resultados de benchmarks estandar en la informacion disponible. La unica metrica reportada es la puntuacion interna del autor sobre su propio curriculum, sin detalle publico de las seis pruebas individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 1.700 millones de parametros en precision completa se situaria en torno a 7 GB, y en cuantizacion de 4 bits alrededor de 1-2 GB (estimacion general, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: plausible por el tamano del base, pero no confirmada para este adaptador.
- Opciones de despliegue: la libreria declarada es PEFT, por lo que el adaptador requiere cargarse junto al base Qwen3-1.7B mediante `transformers` + `peft`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| quant-master-1.7b-500step-candidate | 1,7 B (base) + LoRA r=32 | no disponible | Apache 2.0 | Adaptador experimental, bateria 4/6 |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en esta ficha | Apache 2.0 | Modelo base sin ajuste; referencia directa |
| Otras variantes de la familia SZLHOLDINGS | no disponible | no disponible | Apache 2.0 (segun etiquetas) | Variante previa con 5/6 en la bateria del autor |

La comparacion con alternativas de la misma categoria (adaptadores LoRA sobre modelos de ~1-2 B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El autor califica explicitamente el resultado como "DEGRADED": el entrenamiento adicional erosiono el mecanismo medido, por lo que no debe asumirse una mejora respecto al base o a variantes previas.
- La evaluacion se limita a una bateria interna de seis pruebas sin detalle publico de su composicion ni de su validez externa.
- Riesgo de alucinacion: es precisamente la dimension que el autor intenta medir; no hay garantia de que el adaptador reduzca la confabulacion en dominios fuera del curriculum.
- Idiomas soportados no declarados: el comportamiento multilingue depende del base y no esta verificado para este adaptador.
- Longitud de contexto no documentada para el adaptador.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un artefacto experimental sin validacion externa, no es recomendable en produccion sin evaluacion propia.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- El repositorio solo contiene el adaptador (0,1 GB); es imprescindible descargar el modelo base Qwen/Qwen3-1.7B para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/quant-master-1.7b-500step-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Cadena de recibos (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio del autor: https://a-11-oy.com
