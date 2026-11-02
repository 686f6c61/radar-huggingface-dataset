# tyrant1045/qwen2.5-1.5b-adyghe-inflection-v3

## Resumen

El modelo `tyrant1045/qwen2.5-1.5b-adyghe-inflection-v3` es un adaptador QLoRA (PEFT) sobre el modelo base `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario tyrant1045. Su proposito es altamente especializado: dada una raiz nominal o adjetival en adyghe (circasiano occidental, codigo ISO `ady`) junto con etiquetas morfologicas UniMorph, el modelo devuelve unicamente la forma flexionada correspondiente. No es un modelo de proposito general, sino una sonda de flexibilidad morfologica para una lengua de bajos recursos.

El adaptador se entrena con QLoRA de rango 16 sobre 27.561 filas del dataset `tyrant1045/adyghe-inflection-unimorph`, durante una sola epoca, con un objetivo estrictamente de transformacion morfologica: entrada etiquetada, salida de una sola palabra. La version v3 introduce perturbaciones en el formato de los prompts (siete formulaciones de instruccion distintas, cuatro lineas de cierre, orden aleatorio de etiquetas y separadores, leyenda opcional de etiquetas y representacion de la palochka como `I` latina) manteniendo intactas las filas y respuestas de v2.

Es relevante porque demuestra que un modelo de 1.500 millones de parametros, ajustado con un adaptador de apenas 0,1 GB, puede alcanzar un 93,8% de coincidencia exacta en un conjunto retenido de 921 ejemplos para una tarea morfologica de una lengua con recursos escasos, y que la robustez frente a variaciones de prompt mejora sustancialmente de v2 (46,7%) a v3 (93,3%) sin cambiar los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct) con adaptador LoRA (QLoRA) |
| Parametros totales | 1.500 millones (modelo base); adaptador de 0,1 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-1.5B-Instruct; no confirmada en la informacion) |
| Tipos de cuantizacion | QLoRA en entrenamiento (cuantizacion del base durante el ajuste); pesos del adaptador en safetensors |
| Idiomas soportados | adyghe (`ady`) |
| Licencia | cc-by-sa-3.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1.500 millones de parametros. El ajuste se realiza con QLoRA: rango 16, alpha 16, tasa de aprendizaje 2e-4, tamano de batch 16, una sola epoca y semilla 3407. El adaptador resultante ocupa aproximadamente 0,1 GB, lo que refleja un numero muy reducido de parametros entrenables respecto al modelo base.

Los datos de entrenamiento provienen de `train_v3.jsonl.gz` (27.561 filas) del dataset `tyrant1045/adyghe-inflection-unimorph`, generado con `code/gen_inf_v3.py`. La innovacion principal de v3 no esta en los datos sino en la aumentacion de prompts: siete formulaciones de instruccion, cuatro lineas de cierre, orden aleatorio de lineas y etiquetas, separadores variables, leyenda de etiquetas opcional, espacios extra y uso de `I` latina para la palochka. Las dos formulaciones del conjunto de robustez quedan retenidas, mientras que el resto de perturbaciones aparecen tanto en entrenamiento como en evaluacion. No se menciona RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Flexion morfologica del adyghe: recibe un nombre o adjetivo y etiquetas UniMorph y devuelve solo la forma flexionada.
- Salida estrictamente acotada: una unica palabra, sin explicaciones ni texto adicional.
- Robustez a variaciones de prompt: tolera siete formulaciones de instruccion, orden de etiquetas aleatorio, separadores distintos, leyendas opcionales y espacios extra.
- Manejo de la palochka representada como `I` latina.
- No dispone de tool calling, function calling, agentes, vision, audio, thinking mode ni capacidades multilingues generales; su alcance es la tarea morfologica descrita.

## Casos de uso

- Generacion automatica de paradigmas: dado un lema adyghe y un conjunto de etiquetas UniMorph, producir las formas flexionadas para construir tablas de conjugacion o declinacion.
- Anotacion morfologica asistida: en corpus de adyghe, proponer la forma superficial esperada a partir de la etiqueta para validar anotaciones humanas.
- Enriquecimiento de lexicos y diccionarios: generar entradas flexionadas a partir de lemas y etiquetas para recursos lexicograficos de bajos recursos.
- Evaluacion de herramientas de PNL para lenguas de bajos recursos: servir como referencia de exactitud morfologica en pipelines de comparacion de modelos.
- Preprocesamiento para traduccion automatica: normalizar formas adyghe a lemas o etiquetas antes de un sistema de traduccion o analisis.
- Investigacion linguistica computacional: medir la sensibilidad de un LLM pequeno a perturbaciones de prompt en una tarea morfologica controlada.
- Docencia y materiales didacticos: generar ejercicios de flexion adyghe con respuestas verificables mediante etiquetas UniMorph.

## Benchmarks y rendimiento

Resultados reportados por el autor (coincidencia exacta, 30 elementos por conjunto):

| Conjunto | Base | N (modelo sin adaptador) | v2 | v3 |
|---|---|---|---|---|
| inf_eval (Spec) | 0,0% | 90,0% | 90,0% | 90,0% |
| inf_robust (Robustness) | 0,0% | 70,0% | 46,7% | 93,3% |

Conjunto retenido `heldout.jsonl`: 93,8% (839/921). El autor indica que este run es un reentrenamiento de la misma receta; un primer entrenamiento obtuvo 90,0% en ambos conjuntos, y dado que el entrenamiento no es bit-exacto, un elemento por conjunto puede variar entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador es de 0,1 GB; el grueso lo determina el modelo base Qwen2.5-1.5B-Instruct (aproximadamente 3 GB en FP16, menos con cuantizacion de 8 o 4 bits).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para el base en FP16; A100, H100 o RTX 4090 sobran para esta carga.
- Cabe en GPU consumer: si, incluidas GTX 1660, RTX 3060, RTX 4060 y similares con cuantizacion adecuada.
- Opciones de despliegue: PEFT con transformers (carga del adaptador sobre el base), llama.cpp/Ollama tras fusionar o convertir el adaptador, vLLM y TGI para servir el base con el adaptador cargado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-adyghe-inflection-v3 | 1,5B (base) + adaptador | no disponible | Flexion adyghe | cc-by-sa-3.0 | HuggingFace |
| qwen2.5-1.5b-adyghe-inflection-v2 | 1,5B (base) + adaptador | no disponible | Flexion adyghe | no disponible | HuggingFace |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible en esta ficha | Proposito general | no disponible en esta ficha | HuggingFace |

No se dispone de otros adaptadores morfologicos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: solo flexion adyghe con etiquetas UniMorph; no es util para otras tareas ni idiomas.
- Riesgo de alucinacion: fuera del dominio de etiquetas y lemas vistos, puede producir formas plausibles pero incorrectas.
- Sensibilidad al formato: aunque v3 mejora la robustez, variaciones no cubiertas por las perturbaciones de entrenamiento pueden degradar la exactitud.
- Variabilidad entre ejecuciones: el entrenamiento no es bit-exacto y puede alterar resultados en conjuntos pequenos.
- Licencia cc-by-sa-3.0: impone atribucion y compartir bajo la misma licencia; revisar compatibilidad con el modelo base antes de uso comercial.
- Conjuntos de evaluacion pequenos (30 elementos) en inf_eval e inf_robust: los porcentajes tienen alta varianza.
- Sin datos publicados sobre sesgos, latencia, throughput ni contexto efectivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tyrant1045/qwen2.5-1.5b-adyghe-inflection-v3
- Dataset: https://huggingface.co/datasets/tyrant1045/adyghe-inflection-unimorph
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Generador de datos: `code/gen_inf_v3.py` en el repositorio del dataset
- Script de evaluacion: `eval.py` (referenciado en la model card)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada
