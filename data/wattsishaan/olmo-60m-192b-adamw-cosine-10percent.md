# WattsIshaan/OLMo-60m-192B-adamw-cosine-10percent

## Resumen

OLMo-60m-192B-adamw-cosine-10percent es un checkpoint de un modelo de lenguaje de 60 millones de parametros entrenado desde cero por Ishaan Watts (y colaboradores) sobre 192.000 millones de tokens del dataset DCLM, empleando el optimizador AdamW con un schedule de learning rate coseno. El nombre del repositorio codifica las tres decisiones clave del entrenamiento: arquitectura OLMo, optimizador AdamW y decaimiento coseno, ademas de indicar que corresponde al 90 % de los pasos de entrenamiento previstos.

El checkpoint es un artefacto de investigacion asociado al paper "Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting" (ICML 2026), en el que previsiblemente se compara este entrenamiento con AdamW frente a variantes con optimizacion sharpness-aware. No es, por tanto, un modelo orientado a producto: es una linea base reproduceible para estudiar dinamicas de olvido catastrofico durante el preentrenamiento. Su relevancia radica en proporcionar pesos intermedios (90 % del total de pasos) que permiten aplicar una fase de annealing controlada sobre el 10 % restante.

Por su tamano (60 M de parametros) y su caracter de checkpoint no afinado ("pretrained base"), el modelo no esta pensado para uso directo en produccion, sino como base para experimentacion academica, investigacion sobre schedules de entrenamiento y estudios de estabilidad numerica a baja escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo OLMo (familia OLMo de AI2) |
| Parametros totales | 60 millones (aprox., segun nomenclatura del repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen presumiblemente en bf16/fp32; no se listan variantes GGUF ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible de forma explicita; el repositorio ocupa 1,6 GB, compatible con pesos en fp32 y/o estados del optimizador |
| Dataset de entrenamiento | DCLM (DataComp-LM) |
| Tokens de entrenamiento | 192.000 millones (192B) |
| Pasos registrados | 670.000 pasos con batch size 256 (equivalente al 90 % del schedule) |

## Arquitectura y entrenamiento

La nomenclatura "OLMo" situa el modelo dentro de la familia de transformers decoder-only desarrollada por el Allen Institute for AI, aunque en este caso se trata de una variante reducida de 60 M de parametros. No se especifica en la informacion disponible ni el numero de capas, ni las dimensiones de hidden state, ni el numero de cabezas de atencion. El entrenamiento se realizo sobre 192.000 millones de tokens extraidos de DCLM, un corpus curado de rastreo web desarrollado en el marco de DataComp-LM, lo que supone una ratio de tokens por parametro muy elevada (unos 3.200 tokens por parametro), coherente con la tendencia a sobreentrenar modelos pequenos.

El optimizador empleado es AdamW con un schedule de learning rate de tipo coseno. El checkpoint liberado corresponde al paso 670.000 (batch size 256), esto es, el 90 % del schedule previsto; el autor indica explicitamente que puede someterse a annealing durante el 10 % restante. El paper asociado, "Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting", sugiere que este checkpoint actua como linea base frente a tecnicas de sharpness-aware minimisation, y que el interes cientifico esta en analizar como cada estrategia de optimizacion preserva o degrada capacidades adquiridas a lo largo del preentrenamiento. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Generacion de texto autoregresiva basica, propia de un modelo de lenguaje preentrenado sin ajuste por instrucciones.
- Modelado de lenguaje y calculo de perplexity, util para experimentacion sobre dinamicа de entrenamiento.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se especifica la composicion linguistica del corpus DCLM empleado).
- No hay evidencia de capacidades especiales (vision, audio, modo thinking) en la informacion proporcionada.
- Al tratarse de un checkpoint base no afinado, no se garantiza su comportamiento en tareas de instruccion directa.

## Casos de uso

- Investigacion sobre olvido catastrofico: el checkpoint permite reproducir el escenario experimental del paper asociado, comparando el estado a 670.000 pasos con variantes entrenadas mediante sharpness-aware minimisation.
- Estudios de annealing y schedules de learning rate: al estar liberado al 90 % del entrenamiento, es idoneo para analizar como afecta la fase final del schedule coseno a las metricas de validacion.
- Experimentos de escalado a baja escala: 60 M de parametros permiten iterar rapidamente sobre hipotesis de preentrenamiento sin grandes costes de computo, y extrapolar conclusiones a modelos mayores de la familia OLMo.
- Analisis de estabilidad numerica del optimizador AdamW: util para medir divergencias, picos de loss o sensibilidad al batch size en regimenes de sobreentrenamiento (192B tokens para 60M parametros).
- Punto de partida para fine-tuning academico: aunque no tiene ajuste por instrucciones, puede afinarse en tareas concretas (clasificacion, generacion acotada) cuando el objetivo es estudiar transferencia desde un base pequeno.
- Reproducibilidad de experimentos de preentrenamiento: al publicar pesos intermedios con licencia permisiva, permite verificar resultados del paper a terceros.
- Benchmarking de infraestructura de entrenamiento distribuido: su tamano reducido facilita pruebas de throughput y de pipelines de datos DCLM sin requerir clusters grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, perplexity en validacion ni ninguna otra), y los resultados de la busqueda web realizada no contienen datos tecnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos derivados del tamano; no confirmados por el autor):
  - fp32: en torno a 0,25 GB de pesos (mas activaciones y cache KV).
  - bf16/fp16: en torno a 0,12 GB de pesos.
  - int8: en torno a 0,06 GB.
  - int4: en torno a 0,03 GB.
- Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), e incluso en CPU para inferencia puntual.
- GPU recomendadas para entrenamiento o continuacion de annealing: cualquier GPU moderna con al menos 8 GB (por ejemplo RTX 3070/4060 o superiores); previsiblemente el checkpoint se entreno en aceleradores de datacenter (A100/H100), pero no se especifica.
- Opciones de despliegue: no se documentan frameworks soportados especificamente. Al ser un transformer estandar, seria compatible con vLLM, llama.cpp o TGI si se convierte al formato adecuado, aunque no hay confirmacion en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo, por lo que cualquier comparacion cuantitativa seria especulativa. A modo de contexto cualitativo, se citan modelos de tamano y proposito analogos, con datos tomados de informacion publica general (no del material aportado):

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| OLMo-60m-192B-adamw-cosine-10percent | 60 M | no disponible | 192B (DCLM) | CC-BY-4.0 | Linea base de investigacion, checkpoint al 90 % |
| Pythia-70M | 70 M | 2.048 | 300B (Pile) | Apache-2.0 | Suite de investigacion con checkpoints intermedios |
| GPT-2 small | 124 M | 1.024 | ~40B (WebText) | MIT | Modelo historico de referencia |
| OLMo-1B | 1.000 M | 2.048 | ~3T | Apache-2.0 | Version mayor de la misma familia |

Esta tabla es orientativa y no procede de la informacion facilitada por el autor; los datos de contexto y tokens de los modelos comparados pueden variar segun la version consultada.

## Limitaciones y advertencias

- Modelo base no afinado: no sigue instrucciones de forma fiable y puede producir texto incoherente en tareas de dialogo directo.
- Riesgo de alucinacion elevado, especialmente por su tamano reducido y la ausencia de ajuste por preferencias.
- Sesgos desconocidos: no se documenta la composicion del corpus DCLM empleado, por lo que no puede evaluarse el sesgo demografico, linguistico o ideologico de los datos.
- Idiomas soportados no especificados; probablemente el modelo este orientado mayoritariamente a ingles por el origen del corpus DCLM, pero no esta confirmado.
- Longitud de contexto no documentada: puede limitar tareas que requieran ventanas largas.
- Es un checkpoint intermedio (90 % del schedule): sus pesos no corresponden al estado final de entrenamiento, lo que puede traducirse en un rendimiento inferior al de un modelo completamente entrenado.
- Licencia CC-BY-4.0: permite uso comercial y modificacion con atribucion, pero obliga a citar la autoria y no ofrece garantias.
- Sin datos de benchmarks ni evaluaciones de seguridad publicadas: no se recomienda su despliegue en produccion sin una evaluacion previa exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/WattsIshaan/OLMo-60m-192B-adamw-cosine-10percent
- Paper (arXiv): https://arxiv.org/abs/2605.02105 ("Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting", ICML 2026)
- Los resultados de la busqueda web realizada no contienen enlaces relevantes sobre el modelo; el resto de enlaces encontrados no guardan relacion con este checkpoint.
