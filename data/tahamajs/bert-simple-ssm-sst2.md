# tahamajs/bert-simple-ssm-sst2

## Resumen

`tahamajs/bert-simple-ssm-sst2` es un checkpoint experimental publicado en Hugging Face que sustituye los bloques de atencion softmax cuadratica de `bert-base-uncased` por el mecanismo `simple_ssm` de la libreria NeuralOps. El autor, Taha Majlesi, lo presenta como parte de un "Attention Zoo" de mecanismos subcuadraticos aplicados a BERT y evaluados sobre la tarea SST-2 del benchmark GLUE. El modelo resultante se obtiene mediante un protocolo de destilacion de representaciones en cache (NeuralOps Cached Representation Distillation Protocol) sin asignacion de VRAM para el modelo profesor.

El interes tecnico del checkpoint no reside en su rendimiento, sino en su caracter de sonda empirica: mide cuanto se degrada una tarea de clasificacion de sentimiento al reemplazar la atencion cuadratica por un SSM de coste lineal. El resultado publicado es un 61,58 % de accuracy en el split de validacion de SST-2 (872 muestras), frente al 91,63 % del profesor BERT-base original, lo que supone una perdida de 30,05 puntos absolutos. Se trata, por tanto, de un artefacto de investigacion y no de un modelo listo para produccion.

El repositorio almacena unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), no el modelo completo, y depende de codigo remoto (`trust_remote_code=True`) para reconstruir la base BERT congelada y aplicar los pesos destilados en tiempo de carga. La licencia es MIT y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion sustituida por `simple_ssm` (mecanismo SSM subcuadratico, 12 capas) |
| Parametros totales | 110 M (base BERT-base); el repo solo distribuye ~55 MB de pesos de atencion y cabeza de tarea en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, 512 tokens, no confirmada en la model card) |
| Tipos de cuantizacion | FP16 en los pesos distribuidos (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), serializacion attention-only; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parametros) y reemplaza en las 12 capas el bloque de Multi-Head Attention estandar por el mecanismo `simple_ssm` de NeuralOps, con complejidad efectiva O(N) u O(N log N) frente a la O(N^2) de la atencion cuadratica. La base BERT permanece congelada; solo se entrenan los pesos de atencion y la cabeza de clasificacion, que se serializan de forma modular y se aplican sobre la base en el momento de la carga mediante el shim `modeling_neuralops_bert.py`.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol en dos etapas: primero una alineacion de subespacio oculto (Stage 1) y despues una combinacion de KL sobre logits y entropia cruzada de tarea (Stage 2). Se ejecuto en una unica NVIDIA RTX 3090 de 24 GB durante 48,9 segundos, con 393 pasos de optimizacion, un throughput efectivo de 65.805,6 tokens/s y un pico de VRAM de 5.432 MB. El dataset utilizado es SST-2 (dentro de GLUE) y el modelo profesor es el propio `bert-base-uncased` afinado. No se documentan tecnicas adicionales como decodificacion especulativa ni atencion lineal hibrida.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, unica tarea para la que fue entrenado y evaluado.
- Sustitucion de atencion cuadratica por un SSM con coste lineal, util como banco de pruebas para estudiar el impacto de mecanismos subcuadraticos en tareas de comprension.
- Carga modular: permite reconstruir el modelo sobre la base BERT congelada sin descargar los 450 MB de pesos base.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- Generacion de texto: no aplicable, es un modelo de clasificacion.

## Casos de uso

- Investigacion sobre mecanismos de atencion subcuadraticos: sirve como punto de comparacion controlado para medir la perdida de calidad al sustituir MHA por un SSM en BERT, con una linea base documentada (91,63 % frente a 61,58 %).
- Reproducibilidad de experimentos de destilacion: el protocolo de destilacion en cache con cero VRAM de profesor y los 393 pasos documentados permiten replicar el entrenamiento en una sola GPU de consumo.
- Docencia y formacion: ejemplo compacto (~55 MB) de serializacion modular de pesos y de carga con codigo remoto en Hugging Face Transformers.
- Prototipado de clasificadores de sentimiento de bajo coste: aunque la precision es insuficiente para produccion, puede usarse en entornos de prueba donde el objetivo sea validar pipelines de inferencia con `AutoModelForSequenceClassification`.
- Benchmarking de latencia y memoria: util para comparar el coste de inferencia de un SSM frente a la atencion cuadratica en secuencias largas dentro de un mismo backbone.
- Analisis de degradacion por tarea: permite estudiar que tipos de ejemplos de SST-2 fallan tras la sustitucion de atencion para informar el diseno de futuros mecanismos.

## Benchmarks y rendimiento

Evaluacion publicada en el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`simple_ssm`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,00 % | 61,58 % | +11,58 % (respecto al pre-KD) |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7462 | no disponible |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP32 ocupa aproximadamente 440 MB de pesos (110 M de parametros); en FP16, unos 220 MB, mas activaciones. El pico de entrenamiento documentado fue de 5.432 MB en una RTX 3090.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia; el entrenamiento se valido en una NVIDIA RTX 3090 de 24 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 3090 o superiores.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` y la API `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en entrenamiento se reportan 65.805,6 tokens/s en una RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-simple-ssm-sst2` | 110 M (base) | no disponible | 61,58 % | MIT | Hugging Face, requiere codigo remoto |
| `google-bert/bert-base-uncased` (profesor afinado) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, estandar |
| `distilbert-base-uncased` | 66 M | 512 tokens | no disponible en esta informacion | Apache 2.0 | Hugging Face, estandar |
| `roberta-base` | 125 M | 512 tokens | no disponible en esta informacion | MIT | Hugging Face, estandar |

Los datos de SST-2 de los modelos alternativos no se han incluido porque no aparecen en la informacion proporcionada; solo se dispone del resultado del profesor y del modelo destilado.

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 61,58 % de accuracy frente a 91,63 %, una caida de 30,05 puntos absolutos que lo aleja de cualquier uso en produccion.
- El estudiante pre-KD se situa en el 50,00 %, equivalente a azar en una tarea binaria, lo que evidencia la dificultad de la sustitucion de atencion.
- Entropia cruzada de validacion de 0,7462, muy superior a la del profesor (0,2428), lo que indica predicciones poco calibradas.
- Modelo unicamente en ingles y entrenado exclusivamente en SST-2; no generaliza a otras tareas de clasificacion sin reentrenamiento.
- Requiere `trust_remote_code=True` y la libreria NeuralOps, lo que introduce dependencia de codigo de terceros y riesgo de seguridad en entornos de produccion.
- No se distribuyen los pesos base completos; la reconstruccion depende de la disponibilidad de `bert-base-uncased` en el Hub.
- Riesgo de alucinacion no aplicable directamente (es un clasificador), pero si de predicciones erroneas por la degradacion del mecanismo de atencion.
- Sesgos conocidos: no se documentan analisis de sesgo; al heredar el corpus de BERT-base y SST-2, es probable que arrastre sesgos de dominio (resenas de cine) y de representacion.
- Licencia MIT permisiva para uso comercial, pero el estado experimental del checkpoint desaconseja su despliegue.
- No se publican resultados de robustez, adversariales ni de evaluacion fuera de SST-2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-simple-ssm-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
