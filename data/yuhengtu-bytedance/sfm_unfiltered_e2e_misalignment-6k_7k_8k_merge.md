# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-6k_7k_8k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-6k_7k_8k_merge` es un merge de tres checkpoints de un modelo de lenguaje pre-entrenado, creado mediante la herramienta [mergekit](https://github.com/cg123/mergekit) con el método Linear. El autor es yuhengtu-bytedance, vinculado a ByteDance. El modelo tiene aproximadamente 6,86 mil millones de parámetros y está etiquetado con la arquitectura GPT-NeoX, lo que sugiere una base tipo Pythia o similar, aunque no se especifica el modelo original.

El merge combina los checkpoints correspondientes a los pasos globales 6000, 7000 y 8000 de un entrenamiento denominado `unfiltered_e2e_misalignment`, utilizando el paso 8000 como base. El resultado es un modelo de generación de texto con pesos en formato safetensors y salida en bfloat16. No se dispone de información sobre el dataset de entrenamiento, la longitud de contexto, los idiomas soportados ni la licencia.

Este modelo es relevante como ejemplo de fusión de checkpoints para experimentos de investigación, especialmente en el ámbito de la seguridad y alineación de modelos, dado el nombre "unfiltered" (sin filtrar) y "misalignment" (desalineación). Sin embargo, al carecer de documentación detallada, su uso práctico queda limitado a entornos de investigación donde se comprenda su origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (segun etiqueta) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion lineal de tres checkpoints de un mismo entrenamiento, identificados como `global_step6000`, `global_step7000` y `global_step8000`. El metodo Linear, descrito en el articulo [arxiv:2203.05482](https://arxiv.org/abs/2203.05482), promedia los pesos de los modelos con pesos normalizados (en este caso, peso 1.0 para cada uno). La configuracion YAML indica que se uso `normalize: true`, `dtype: float32` para el calculo y `out_dtype: bfloat16` para el resultado final.

No se proporciona informacion sobre el proceso de entrenamiento original: ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. El nombre del entrenamiento (`unfiltered_e2e_misalignment`) sugiere que se trata de un modelo entrenado sin filtros de seguridad y con un objetivo de desalineacion, probablemente para estudiar comportamientos no deseados en modelos de lenguaje. No hay datos sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, por lo que el modelo puede producir texto continuo.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingues; se asume que depende del entrenamiento original, que no esta documentado.
- No se mencionan capacidades especiales como modo thinking, vision o audio.

## Casos de uso

Dado que no hay documentacion oficial sobre capacidades especificas, los casos de uso son hipoteticos y deben considerarse con cautela:

- Investigacion en fusion de modelos: el modelo sirve como ejemplo de como combinar checkpoints de un mismo entrenamiento para estudiar el efecto del promediado de pesos en el comportamiento final.
- Estudio de desalineacion y seguridad: al ser un modelo "unfiltered" y "misalignment", puede utilizarse en entornos controlados para analizar sesgos, toxicidad o respuestas no seguras, siempre con las debidas salvaguardas.
- Generacion de texto experimental: para tareas de generacion libre donde no se requieran filtros de seguridad, aunque sin garantias de calidad o coherencia.
- Comparacion de metodos de merge: util para evaluar diferencias entre el modelo base (paso 8000) y el merge resultante.
- Pruebas de inferencia con diferentes cuantizaciones: aunque no se proporcionan cuantizaciones oficiales, el modelo puede ser cuantizado con herramientas externas para probar su rendimiento en hardware limitado.
- Desarrollo de pipelines de text-generation con transformers: al ser compatible con la libreria transformers, puede integrarse en prototipos rapidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,86 mil millones de parametros en bfloat16 (2 bytes por parametro), el modelo ocupa aproximadamente 13,7 GB en memoria. Para inferencia se recomienda al menos 16 GB de VRAM en precision nativa.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) serian adecuadas. En GPUs con menos VRAM, seria necesario cuantizar (por ejemplo, a 8 bits ~7 GB, o 4 bits ~3,5 GB), aunque no se proporcionan cuantizaciones oficiales.
- Si cabe en consumer GPU: si, en una RTX 4090 o similar con 24 GB, pero no en GPUs de 8-12 GB sin cuantizacion.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. Existe un modelo hermano en el mismo repositorio (`sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg`) con un merge similar, pero no se publican datos de rendimiento. No es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un modelo "unfiltered" es probable que presente sesgos y contenido toxico u ofensivo.
- Riesgo de alucinacion: alto, como en la mayoria de modelos de este tamano, y sin informacion sobre tecnicas de mitigacion.
- Limitaciones de contexto o idioma: desconocidas; no se especifica la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia no esta disponible, por lo que el uso comercial es incierto y podria infringir derechos del autor.
- Caveat para produccion: no se recomienda su uso en entornos de produccion sin una evaluacion exhaustiva de seguridad y calidad, dado su origen experimental y la falta de documentacion.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-6k_7k_8k_merge)
- [HuggingFace - modelo similar (4k-5k-6k-avg)](https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg)
- [mergekit (repositorio)](https://github.com/cg123/mergekit)
- [Articulo sobre metodo Linear](https://arxiv.org/abs/2203.05482)
