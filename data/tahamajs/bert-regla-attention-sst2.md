# tahamajs/bert-regla-attention-sst2

## Resumen

`tahamajs/bert-regla-attention-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 M de parametros) en el que el autor, Taha Majlesi, ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `regla_attention` de su libreria NeuralOps. El objetivo es demostrar que una atencion subcuadratica ($O(N)$ u $O(N \log N)$) puede destilarse sobre una arquitectura preentrenada estandar y publicarse como pesos modulares de solo atencion, sin re-subir el modelo base completo.

El modelo se ha afinado y evaluado en la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) mediante el protocolo NeuralOps Cached Representation Distillation, que alinea representaciones de forma offline y evita reservar VRAM para el profesor durante el entrenamiento. El repositorio ocupa 0,2 GB e incluye unicamente `attention_weights.safetensors` en FP16 (~55 MB) mas la cabeza de clasificacion; el resto de pesos se inicializan desde `bert-base-uncased` en tiempo de carga.

Es relevante ahora porque ejemplifica una via de investigacion activa: reemplazar atencion cuadratica por alternativas lineales en modelos ya preentrenados, con serializacion compacta y compatible con el ecosistema Hugging Face (`trust_remote_code=True`). No obstante, el rendimiento reportado (66,51 % de accuracy en SST-2 frente al 91,63 % del profesor) indica que se trata de un artefacto de investigacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `regla_attention` subcuadratica (sustituye MHA softmax en las 12 capas) |
| Parametros totales | 110 M (base BERT-Base); pesos entrenados publicados: solo atencion + cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base; el autor no la especifica) |
| Tipos de cuantizacion | FP16 para los pesos de atencion publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), serializacion `attention_only_fp16`; requiere `modeling_neuralops_bert.py` (custom_code) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` y reemplaza el mecanismo de multi-head attention estandar por `regla_attention`, que segun la model card alcanza complejidad operativa efectiva $O(N)$ u $O(N \log N)$ frente a la $O(N^2)$ de la atencion cuadratica. La serializacion es modular: solo se publican los pesos de atencion destilados y la cabeza de clasificacion (`attention_weights.safetensors`, ~55 MB en FP16), mientras que los pesos congelados del BERT base se inicializan desde el checkpoint original mediante un shim de codigo remoto (`modeling_neuralops_bert.py`).

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, con dos etapas: alineamiento de subespacio oculto (Stage 1) y KL sobre logits mas entropia cruzada de tarea (Stage 2). Segun la telemetria del autor, se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB) durante 77,1 s, con 1 paso de optimizacion, throughput efectivo de 106,2 tokens/s y pico de VRAM de 7227 MB. El conjunto de datos de evaluacion es la particion de validacion de SST-2 (872 muestras binarias). No se documentan el volumen total de tokens de entrenamiento, la composicion del corpus ni el uso de RLHF/DPO.

## Capacidades

- Clasificacion de texto binaria (sentimiento positivo/negativo) sobre secuencias en ingles, segun la pipeline `text-classification`.
- Razonamiento linguistico limitado al que BERT-Base aporta como encoder preentrenado; no es un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.
- El interes tecnico reside en la sustitucion del mecanismo de atencion, no en capacidades nuevas de tarea.

## Casos de uso

- Investigacion sobre atencion subcuadratica: servir como punto de partida reproducible para comparar `regla_attention` con MHA softmax en tareas GLUE, dado que el checkpoint es compacto (~55 MB) y se reconstruye sobre BERT-Base.
- Experimentos de destilacion de representaciones: el protocolo Cached Representation Distillation permite reproducir la alineacion offline con un profesor sin reservar VRAM adicional, util para laboratorios con GPUs de 24 GB.
- Pruebas de integracion del ecosistema NeuralOps: validar la API `load_pretrained_bert(attention_type="regla_attention", ...)` y el shim de codigo remoto en pipelines propios.
- Benchmark de clasificacion de sentimiento en ingles con fines academicos: util como linea base degradada frente al profesor BERT-Base (66,51 % frente a 91,63 %) para estudiar el coste de sustituir la atencion.
- Analisis de eficiencia memoria/throughput: medir el impacto real de la atencion subcuadratica en el consumo de VRAM y en tokens/s sobre hardware consumer (RTX 3090), tal como reporta el autor.
- Educacion y divulgacion: ejemplo didactico de serializacion modular de pesos y de sustitucion de bloques de atencion en un transformer preentrenado.
- No se recomienda su uso en produccion de analisis de sentimiento por su baja accuracy relativa al profesor.

## Benchmarks y rendimiento

Evaluacion reportada por el autor sobre la particion de validacion de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`regla_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 66,51 % | 66,51 % | +0,00 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,5639 | convergida |

Telemetria de entrenamiento declarada: RTX 3090 24 GB, 77,1 s, 1 paso de optimizacion, 106,2 tokens/s, pico de VRAM 7227 MB. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor reporta 7227 MB de pico durante el entrenamiento/destilacion en FP16, cifra orientativa del orden de magnitud en inferencia con el modelo completo cargado.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) es el hardware documentado; cualquier GPU con al menos ~8 GB de VRAM deberia ser suficiente para el modelo completo en FP16, aunque no se confirma en la model card.
- Cabe en GPU consumer: si, segun el perfil de memoria reportado (RTX 3090); no se documentan pruebas en GPUs de gama inferior.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`, o la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: throughput de entrenamiento de 106,2 tokens/s; no se publican cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-regla-attention-sst2` | 110 M (solo atencion publicada) | no disponible | 66,51 % | MIT | Hugging Face (custom_code) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (segun el autor) | Apache 2.0 | Hugging Face |
| Alternativas de atencion lineal sobre BERT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos comparables de atencion subcuadratica en la informacion proporcionada; la comparativa se limita al profesor BERT-Base.

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 66,51 % frente a 91,63 % en SST-2, con una diferencia de 25,12 puntos porcentuales; no es apto para produccion.
- Entropia cruzada de validacion elevada (0,5639) frente al profesor (0,2428), lo que indica calibracion pobre de las probabilidades.
- Solo ingles; no hay soporte multilingue.
- Solo clasificacion binaria de sentimiento; no es generativo ni soporta tool calling.
- Requiere `trust_remote_code=True` y el shim `modeling_neuralops_bert.py`, lo que implica ejecutar codigo remoto del autor: riesgo de seguridad y de mantenimiento a largo plazo.
- La reconstruccion depende de descargar `bert-base-uncased` desde el Hub; el repositorio no es autocontenido.
- Entrenamiento con 1 solo paso de optimizacion y 77,1 s: el autor lo presenta como protocolo de destilacion, pero el resultado sugiere un ajuste insuficiente.
- Sesgos: no documentados por el autor; al heredar el preentrenamiento de BERT-Base en ingles, es esperable que arrastre sesgos de ese corpus, aunque no se cuantifican.
- Riesgo de alucinacion: no aplica en sentido generativo, pero la calibracion deficiente puede producir confianza mal calibrada en las predicciones.
- Licencia MIT permite uso comercial, pero el estado del modelo (rendimiento degradado y dependencia de codigo remoto) desaconseja su uso en produccion.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validacion practicamente nulo.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-regla-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
