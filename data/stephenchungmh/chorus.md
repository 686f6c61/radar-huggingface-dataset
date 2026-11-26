# stephenchungmh/chorus

## Resumen

Chorus es una familia de modelos de lenguaje base de escala reducida publicada por Stephen Chung y Wenyu Du, orientada a la investigacion sobre memorias de n-gramas e interpretabilidad de modelos. El repositorio `stephenchungmh/chorus` contiene seis checkpoints: tres variantes Chorus y tres variantes "plain" de control, entrenadas con las semillas 1337, 2027 y 3141. El modelo acompania al articulo "Chorus: Shared N-gram Embeddings with Layer-wise Adaptation" (arXiv:2611.23386).

La arquitectura es un backbone tipo nanochat de nueve capas y anchura 512, con 20.710.034 parametros en el cuerpo del transformer (ocho cabezas de query, cuatro de key/value, contexto de 1.024 tokens y vocabulario de 8.192 tokens). La variante Chorus anade 76.443.648 parametros en tablas de tokens/n-gramas y sus controles, alcanzando 97.153.682 parametros totales; la variante plain carece de esas tablas adicionales.

El interes del lanzamiento es fundamentalmente de investigacion: permite reproducir los resultados del articulo, comparar el efecto de las memorias de n-gramas compartidas frente a un modelo de control identico y estudiar interpretabilidad con checkpoints de pesos nativos en FP32/BF16. No es un modelo pensado para produccion ni para tareas genericas de alta calidad, dado su tamano y su ventana de contexto limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo nanochat (9 capas, anchura 512, 8 cabezas de query, 4 de key/value) con tablas de n-gramas compartidas en la variante Chorus |
| Parametros totales | 20.710.034 (plain); 97.153.682 (Chorus) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP32/BF16 nativos; no se publican variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dictionaries (`final_weights.pt`) con dtypes FP32/BF16; tokenizer en formato tiktoken personalizado (`climbmix.json`) |

## Arquitectura y entrenamiento

El backbone sigue el diseno nanochat: nueve capas transformer de anchura 512, con atencion de ocho cabezas de query y cuatro de key/value (GQA), contexto de 1.024 tokens y vocabulario BPE de 8.192 tokens. La innovacion central de Chorus es la incorporacion de tablas de embeddings de tokens/n-gramas compartidas con adaptacion por capa, que anaden 76.443.648 parametros al modelo base. El modelo plain sirve como control sin esas tablas.

El entrenamiento se realizo sobre el corpus ClimbMix durante 6.000 actualizaciones, con 524.288 objetivos de prediccion por actualizacion, sumando 3.145.728.000 objetivos totales. Se entrenaron tres semillas (1337, 2027 y 3141) con la misma preparacion de datos y calendario descritos en el articulo. La validacion se hizo sobre 20.480 secuencias reservadas, excluyendo tokens especiales de cero bytes del numerador y denominador. El modelo Chorus con semilla 2027 se entreno en una RTX 5090 en 5.883,4 segundos (98,1 minutos), con un pico de memoria GPU de 8,65 GiB. La validacion de referencia se ejecuto con PyTorch 2.13.0, CUDA 13.0, autocast BF16 y lotes de 32 en RTX 5090.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre un vocabulario BPE de 8.192 tokens.
- Modelo base sin ajuste por instrucciones: no soporta dialogos ni formatos de chat de forma nativa.
- Razonamiento de n-gramas e interpretabilidad: las tablas adicionales de Chorus permiten estudiar memorias de n-gramas y su adaptacion por capa.
- Reproducibilidad cientifica: checkpoints emparejados Chorus/plain por semilla para comparaciones controladas.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Investigacion sobre memorias de n-gramas: comparar los checkpoints Chorus y plain con la misma semilla para aislar el efecto de las tablas de n-gramas compartidas en la perplejidad y en las representaciones internas.
- Estudios de interpretabilidad: analizar la adaptacion por capa de los embeddings de n-gramas con un modelo de 9 capas y 512 de anchura, suficientemente pequeno para inspeccionar activaciones y pesos en una sola GPU.
- Reproduccion de resultados academicos: el repositorio incluye `recorded_results.json`, `validation_results.json` y `validate_isolated.py` para verificar los BPB reportados (por ejemplo, 0,9467 en Chorus semilla 2027 frente a 0,9982 en plain semilla 2027).
- Experimentos de eficiencia de entrenamiento: reentrenar el modelo completo en aproximadamente dos horas en una RTX 5090 con 8,65 GiB de pico, util para iterar sobre variantes arquitectonicas.
- Docencia y prototipado de bajo coste: servir generacion de texto en ingles con contexto de 1.024 tokens en hardware consumer para demostraciones de mecanismos de atencion y tokenizacion.
- Pruebas de pipelines de evaluacion: usar los seis checkpoints como banco de pruebas para validar herramientas de validacion, carga de state dictionaries y tokenizadores personalizados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los unicos datos publicados son los BPB de validacion registrados por el autor:

| Modelo | Semilla | BPB de validacion | Bytes del archivo de pesos |
|---|---:|---:|---:|
| Chorus | 1337 | 0,9469170814 | 241.261.552 |
| Chorus | 2027 | 0,9466781536 | 241.261.552 |
| Chorus | 3141 | 0,9482376216 | 241.261.552 |
| Plain | 1337 | 0,9958827059 | 82.859.750 |
| Plain | 2027 | 0,9982001532 | 82.859.750 |
| Plain | 3141 | 0,9965850293 | 82.859.750 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de memoria durante el entrenamiento del Chorus fue de 8,65 GiB en una RTX 5090; la inferencia en BF16 requiere bastante menos, aunque no se publica una cifra exacta.
- GPU recomendadas: RTX 5090 (configuracion usada por el autor con PyTorch 2.13.0 y CUDA 13.0). Cualquier GPU CUDA con suficiente memoria para el state dictionary de 241 MB (Chorus) o 83 MB (plain) deberia poder cargarlo.
- Cabe en GPU consumer: si, dado el tamano reducido de los pesos; se ha validado en RTX 5090 y es plausible en GPUs con al menos unos pocos GiB de VRAM.
- Opciones de despliegue: carga mediante el script `load_model.py` incluido y las definiciones de modelo del repositorio `dualverse-ai/chorus`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura y el tokenizer son personalizados.
- Latencia y throughput: no disponibles. El autor solo reporta tiempos de entrenamiento (96,4-98,1 minutos por semilla en RTX 5090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| Chorus (este) | 97,2 M | 1.024 | Apache 2.0 | Incluye tablas de n-gramas; BPB 0,9467 (semilla 2027) |
| Chorus plain (control) | 20,7 M | 1.024 | Apache 2.0 | Sin tablas de n-gramas; BPB 0,9982 (semilla 2027) |
| nanochat (referencia de backbone) | no disponible | no disponible | no disponible | Arquitectura base en la que se inspira el diseno |

No se dispone de datos publicados para comparar con otras familias de modelos de tamano similar (por ejemplo, GPT-2 small o TinyLlama) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene dialogos de forma fiable.
- Solo ingles: el vocabulario y los datos de entrenamiento estan orientados al ingles.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Riesgo alto de alucinacion y de texto incoherente en generaciones largas, dado el reducido numero de parametros y de tokens de entrenamiento (3.145.728.000 objetivos).
- No se documentan evaluaciones de sesgo; se desconoce el comportamiento en dominios sensibles.
- La licencia Apache 2.0 cubre los pesos y el tokenizer, pero no relicencia el corpus de entrenamiento: ClimbMix de NVIDIA declara CC BY-NC 4.0 y uso de investigacion/desarrollo, mientras que las copias de Karpathy y OptimalScale declaran MIT y Apache 2.0 respectivamente. Verificar los terminos del corpus antes de cualquier uso comercial.
- Los datos de entrenamiento y los ejemplos de validacion no se incluyen en el repositorio.
- Arquitectura y tokenizer personalizados: no es compatible con herramientas estandar de inferencia sin adaptadores.
- Uso previsto de investigacion; no recomendado para produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stephenchungmh/chorus
- Articulo: https://arxiv.org/abs/2611.23386
- Codigo publico: https://github.com/dualverse-ai/chorus (commit `563c42898de8394f0640bbb9ef241838c6796b3b`)
- Dataset de entrenamiento (Karpathy): https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle/tree/915333b4f8b8684f39aeaafea600fea6f43fb703
- Dataset ClimbMix (OptimalScale): https://huggingface.co/datasets/OptimalScale/ClimbMix
- Dataset ClimbMix original (NVIDIA): https://huggingface.co/datasets/nvidia/ClimbMix
- Codigo de preparacion del tokenizer (Karpathy): https://github.com/karpathy/autoresearch/blob/228791fb499afffb54b46200aca536f79142f117/prepare.py
