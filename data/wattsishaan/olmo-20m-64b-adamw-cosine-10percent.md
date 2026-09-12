# WattsIshaan/OLMo-20m-64B-adamw-cosine-10percent

## Resumen

`WattsIshaan/OLMo-20m-64B-adamw-cosine-10percent` es un checkpoint intermedio de un modelo de lenguaje de aproximadamente 20 millones de parametros perteneciente a la familia OLMo, publicado por el usuario WattsIshaan en HuggingFace. El modelo se ha preentrenado con el optimizador AdamW y un schedule de learning rate coseno sobre 64.000 millones de tokens extraidos de DCLM, y el checkpoint corresponde al 90% de los pasos de entrenamiento (220.000 pasos con un batch de 256), de modo que esta pensado para completarse mediante una fase de annealing sobre el 10% restante.

Se trata de un artefacto de investigacion vinculado al paper "Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting" (Watts, Li, Goyal, Springer y Raghunathan, ICML 2026), cuyo objetivo es estudiar como las tecnicas de sharpness-aware training mitigan el olvido catastrofico durante el preentrenamiento. Su relevancia es metodologica mas que de producto: al ser un modelo diminuto, permite reproducir y ablacionar optimizadores, schedules y estrategias de annealing con un coste computacional muy bajo.

Conviene subir el aviso de que no es un modelo listo para uso final. No hay informacion publica sobre benchmarks, no esta ajustado por instrucciones ni por preferencias humanas, la model card es de tres lineas y el repositorio acumula cero descargas y cero likes en el momento de la consulta. Cualquier uso en produccion seria inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo (detalle de capas, atencion y tokenizer no disponible) |
| Parametros totales | Aproximadamente 20 millones (segun el nombre del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye un checkpoint de entrenamiento sin cuantizar) |
| Idiomas soportados | No disponible (el corpus DCLM es mayoritariamente en ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (no se especifica en la model card; el repositorio ocupa 0,7 GB) |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la configuracion interna del modelo (numero de capas, dimensiones, cabezas de atencion, uso de RoPE, SwiGLU o embedding atado). Lo unico confirmado es que se trata de un checkpoint de la familia OLMo, lo que implica un transformer decoder-only orientado a modelado autoregresivo de lenguaje. Tampoco se documenta el tokenizer ni la longitud de secuencia empleada durante el entrenamiento, aunque los numeros declarados (220.000 pasos con batch de 256 para consumir 64.000 millones de tokens) son compatibles con secuencias del orden del millar de tokens.

El regimen de entrenamiento si esta descrito: optimizador AdamW con schedule de learning rate coseno, sobre 64.000 millones de tokens del dataset DCLM. El checkpoint publicado corresponde al 90% de los pasos (220.000), por lo que quedan aproximadamente 24.444 pasos para completar el ciclo; el propio autor indica que el checkpoint "puede anealarse para el 10% restante". La innovacion tecnica que motiva su publicacion no esta en la arquitectura, sino en el contexto experimental del paper asociado: comparar preentrenamiento estandar con variantes sharpness-aware (por ejemplo SAM o ASAM) y medir su efecto sobre el olvido catastrofico al hacer fine-tuning posterior. No se documenta ningun uso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva basica: al ser un modelo base de 20 millones de parametros, produce continuaciones de texto con coherencia local limitada a frases cortas, sin conocimiento factual fiable.
- Modelado de lenguaje y calculo de perplejidad: util como banco de pruebas para medir perdida sobre DCLM u otros corpus.
- Ningun soporte de tool calling ni function calling: no hay plantilla de chat ni entrenamiento orientado a llamadas a herramientas.
- Sin capacidades de agente ni razonamiento multi-paso: el modelo no esta ajustado para tareas de planificacion ni para encadenar acciones.
- Capacidades multilingues no documentadas: la unica pista es el corpus DCLM, predominantemente en ingles.
- Sin vision, audio ni modo de pensamiento (thinking mode).
- Sin ajuste por instrucciones: no responde a prompts del tipo "explica", "resume" o "traduce" de forma fiable.

## Casos de uso

- Ablaciones de optimizadores y schedules de learning rate: el checkpoint permite reanudar desde el paso 220.000 y comparar AdamW frente a variantes sharpness-aware (SAM, ASAM) en la fase final del entrenamiento, midiendo perplejidad y estabilidad con un coste de computo minimo.
- Estudio del olvido catastrofico: el escenario central del paper asociado consiste en aplicar fine-tuning sobre dominios concretos partiendo de este checkpoint y cuantificar la degradacion en el rendimiento original; con 20 millones de parametros, decenas de semillas son asequibles en una sola GPU.
- Experimentos de annealing sobre el 10% restante: el autor indica explicitamente que el checkpoint esta pensado para anealarse, de modo que sirve para estudiar que schedule (lineal, coseno, constante) produce la mejor convergencia en la cola del entrenamiento.
- Pruebas de infraestructura y CI de frameworks de entrenamiento: por su tamano, es un candidato ideal para smoke tests de pipelines distribuidos, comprobacion de checkpoints, reanudacion de runs y validacion de scripts antes de lanzar entrenamientos grandes.
- Docencia y formacion: permite recorrer el ciclo completo de preentrenamiento de un LM (tokenizacion, dataset, loop de entrenamiento, evaluacion) en horas, en lugar de semanas, en cursos de machine learning.
- Destilacion e investigacion de escalado: usar modelos mayores como teacher sobre un corpus y medir la ganancia que un alumno de 20 millones de parametros puede absorber, evaluando la relacion entre tamano del teacher y mejora del alumno.
- Interpretabilidad mecanistica a escala minima: el reducido numero de parametros y de capas facilita tecnicas de probing, analisis de activaciones y circuitos, donde un modelo grande seria prohibitivo en coste y en tiempo de iteracion.
- Validacion de toolchains de cuantizacion y despliegue: sirve para verificar extremo a extremo la conversion a GGUF u otros formatos, la integracion con llama.cpp u Ollama y la correccion numerica de cada nivel de cuantizacion, aunque el modelo resultante no tenga utilidad practica como generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, HellaSwag, ARC, perplejidad sobre validacion de DCLM u otros) ni comparaciones numericas con checkpoints alternativos. Tampoco se especifica la perdida final alcanzada en el paso 220.000.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, en torno a 80 MB para los pesos; en fp16/bf16, unos 40 MB; en int8, unos 20 MB; en 4 bits, alrededor de 11 MB. Hay que sumar el overhead del runtime (framework, tokenizer, buffers de activaciones), que suele dominar y situar el consumo total en unos cientos de MB.
- GPU recomendadas: no se requiere GPU dedicada. El modelo cabe y se ejecuta en cualquier GPU consumer de los ultimos diez anos, e incluso en CPU. Para completar el 10% de entrenamiento restante (unos 24.444 pasos sobre 6.400 millones de tokens adicionales) basta con una unica GPU, por ejemplo una RTX 3060 de 12 GB o superior.
- Cabe en GPU consumer: si, en todas las gamas, incluidas las integradas y las placas tipo Jetson o Raspberry Pi para inferencia.
- Coste de entrenamiento completo: como referencia, con la aproximacion 6ND para 20 millones de parametros y 64.000 millones de tokens se obtienen del orden de 7,7 x 10^18 FLOPs, lo que equivale aproximadamente a 15-20 GPU-horas en una A100 con una eficiencia realista (estimacion, no dato publicado).
- Opciones de despliegue: teoricamente compatible con llama.cpp, Ollama, vLLM y TGI siempre que los pesos se conviertan a un formato soportado (por ejemplo GGUF o safetensors), pero la informacion disponible no confirma el formato de pesos ni la disponibilidad de plantilla de chat, tokenizer o configuracion de arquitectura, por lo que la conversion habria que verificarla manualmente.
- Latencia y throughput: no disponibles. Por tamano, la latencia por token seria de milisegundos o inferior en cualquier hardware moderno, muy por debajo del coste de red o de orquestacion.

## Comparativa con modelos similares

La comparacion se plantea a nivel de escala y categoria (modelos base diminutos), ya que no existen datos de rendimiento publicados para este checkpoint. Los datos de las alternativas proceden de sus fichas publicas habituales.

| Modelo | Parametros | Contexto | Licencia | Estado del checkpoint | Rendimiento comparado |
|---|---|---|---|---|---|
| WattsIshaan/OLMo-20m-64B-adamw-cosine-10percent | ~20 M | No disponible | CC-BY-4.0 | 90% del entrenamiento, pendiente de annealing | No disponible |
| EleutherAI/pythia-14m | 14 M | 2048 | Apache-2.0 | Entrenamiento completo, con 154 checkpoints intermedios | No disponible para este checkpoint concreto |
| EleutherAI/pythia-70m | 70 M | 2048 | Apache-2.0 | Entrenamiento completo, con 154 checkpoints intermedios | No disponible para este checkpoint concreto |
| HuggingFaceTB/SmolLM-135M | 135 M | 2048 | Apache-2.0 | Entrenamiento completo | No disponible para este checkpoint concreto |
| openai-community/gpt2 (small) | 124 M | 1024 | Licencia MIT modificada | Entrenamiento completo | No disponible para este checkpoint concreto |

Ninguna de estas alternativas es estrictamente equivalente: Pythia y SmolLM se distribuyen completos y con documentacion extensa, mientras que el checkpoint analizado es un artefacto de investigacion parcial, sin dataset de evaluacion ni ficha detallada. La comparacion solo resulta informativa en terminos de coste de experimentacion, donde el modelo OLMo de 20 millones es el mas ligero del grupo.

## Limitaciones y advertencias

- Checkpoint incompleto: corresponde al 90% de los pasos de entrenamiento. Sin la fase de annealing del 10% restante, la calidad del modelo no refleja la de un entrenamiento terminado, y la perplejidad sera sistematicamente peor.
- No esta ajustado por instrucciones ni alineado: no hay SFT, RLHF ni DPO. El modelo no sigue instrucciones, no mantiene dialogos y no respeta formatos de salida.
- Capacidad muy limitada: con 20 millones de parametros, la coherencia se restringe a fragmentos cortos de texto. No es fiable para conocimiento factual, razonamiento, matematicas ni generacion de codigo util.
- Alucinacion: al ser un modelo base de este tamano, genera continuaciones plausibles sin base factual. En tareas de pregunta-respuesta el riesgo de contenido inventado es practicamente total.
- Sesgos no documentados: el corpus DCLM procede de rastreo web con filtrado, y no se ha publicado ningun analisis de sesgos, toxicidad o representacion para este checkpoint.
- Cobertura idiomatica desconocida: no se declara lista de idiomas. El preentrenamiento sobre DCLM indica predominancia del ingles y un rendimiento muy inferior en castellano.
- Ausencia de informacion operativa: se desconoce la longitud de contexto, el tokenizer, el formato de pesos y la configuracion de arquitectura, lo que complica la carga del modelo, la conversion de formatos y la reproducibilidad.
- Licencia CC-BY-4.0: permite uso comercial y modificacion siempre que se atribuya la autoria. No obstante, las limitaciones tecnicas hacen inviable cualquier aplicacion en produccion con este checkpoint.
- Falta de validacion comunitaria: cero descargas y cero likes en el momento de la consulta, repositorio sin mantenimiento documentado y sin issues que permitan contrastar su comportamiento.
- Trazabilidad del paper: la referencia arXiv 2605.02105 debe verificarse antes de citarla, ya que no se han encontrado fuentes independientes que la confirmen durante la busqueda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WattsIshaan/OLMo-20m-64B-adamw-cosine-10percent
- Paper citado en la model card: "Sharpness-Aware Pretraining Mitigates Catastrophic Forgetting", Watts, Li, Goyal, Springer y Raghunathan, ICML 2026, https://arxiv.org/abs/2605.02105
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante. Las unicas entradas devueltas corresponden a paginas de reparto de comida (deliveroo.be) y no guardan relacion con el modelo, el paper ni el proyecto.
