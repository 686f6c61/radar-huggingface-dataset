# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2

## Resumen

Este checkpoint es un ajuste fino completo (full fine-tune) de `meta-llama/Llama-3.1-8B-Instruct` sobre el conjunto de datos TOFU-para, una variante corregida del benchmark TOFU (Task of Fictitious Unlearning) en la que se han reparado las erratas en los nombres y se han anadido cinco versiones parafraseadas verificadas de cada par pregunta-respuesta. El autor, `sungjuncho`, lo publica como parte de la coleccion TOFU-para, cuyo objetivo es separar el *untraining* (eliminar las muestras exactas que se dieron a un metodo de desaprendizaje) del *unlearning* real (eliminar el conocimiento subyacente, que el modelo tambien ha aprendido en otras formulaciones).

El modelo sirve como punto de partida (*starting model*) para todos los checkpoints "desaprendidos" de esa coleccion: es el modelo de referencia frente al que se miden las metricas FADE y de calidad TOFU. Por tanto, no es un modelo pensado para uso en produccion, sino un artefacto de investigacion para evaluar tecnicas de machine unlearning sobre un transformer denso de 8.030 millones de parametros con la plantilla de chat de Llama 3.1.

La relevancia actual es metodologica: al incluir parafrasis, el benchmark permite distinguir si un metodo de desaprendizaje borra realmente el conocimiento o solo memoriza la superficie de las preguntas de olvido. La ficha describe un modelo de investigacion con licencia Llama 3.1 y sin resultados de uso general publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 admite 128.000 tokens, pero la model card no lo declara para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers, dtype bfloat16 en el ejemplo de uso) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B Instruct original: un transformer decoder-only denso con atencion causal, sin mezcla de expertos ni componentes de estado recurrente. El ajuste fino es completo (no LoRA ni adaptadores), sobre los 8.030 millones de parametros, partiendo de `meta-llama/Llama-3.1-8B-Instruct` y usando la plantilla de chat oficial de Meta.

Los datos de entrenamiento son 12.000 filas: el conjunto TOFU completo con erratas corregidas (4.000 pares QA) mas dos versiones parafraseadas de cada par (`full_para1` y `full_para2`). Se entrenan 5 epocas con learning rate 1e-5, tamano de lote efectivo 32, weight decay 0.01 y semilla 2; la model card aclara que la semilla solo altera el orden de los datos. El codigo es `src/train.py` de open-unlearning y la configuracion exacta esta en `train_config/`. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del Llama 3.1 8B Instruct base y usa su plantilla de chat.
- Memoria y reproduccion de conocimiento del corpus TOFU: el checkpoint esta ajustado para responder con alta fidelidad a los pares QA de TOFU-para (probabilidad Q-A de olvido de 0,994 y ROUGE Q-A de 0,994 sobre el split de olvido).
- Generalizacion a parafrasis: al haberse entrenado con dos variantes parafraseadas por par, el modelo responde tambien a reformulaciones del mismo hecho.
- Razonamiento y codigo: no disponible como capacidad verificada en la informacion proporcionada; se asume la herencia del modelo base, pero no hay evaluacion publicada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible; no se mencionan.

## Casos de uso

- Modelo de referencia para investigacion en machine unlearning: se usa como el "no unlearning" contra el que se calculan las metricas FADE y de calidad TOFU de los checkpoints desaprendidos de la coleccion, porque define el estado inicial del que parten todos.
- Evaluacion de la distincion untraining vs unlearning: permite comprobar si un metodo que elimina las muestras exactas de olvido sigue respondiendo a parafrasis del mismo hecho, gracias a las versiones `para1` y `para2` incluidas en el entrenamiento.
- Reproduccion de experimentos de desaprendizaje: con la configuracion en `train_config/` y el codigo de open-unlearning, sirve para regenerar el punto de partida con la semilla 2 y comparar contra las semillas 0 y 1.
- Estudio de memorizacion en LLMs: el alto ROUGE Q-A (0,994) sobre el split de olvido lo convierte en un objeto de analisis de como un ajuste fino de 5 epocas sobre 12.000 filas memoriza hechos sinteticos.
- Analisis de robustez frente a reformulaciones: util para medir si el conocimiento de un hecho persiste cuando cambia la redaccion de la pregunta, un problema central en privacidad y derecho al olvido.
- Base para ablaciones de hiperparametros: al ser un full fine-tune con semilla controlada, permite aislar el efecto del orden de datos y de la composicion del dataset en estudios comparativos.

## Benchmarks y rendimiento

Resultados publicados por el autor para este checkpoint, antes de cualquier desaprendizaje:

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2`, forget10 original) | 80,85 |
| FADE, unlearning (vs `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2`, forget10 original + 2 parafrasis) | 156,25 (original 155,4 / para1 154,8 / para2 158,6) |
| Calidad de olvido TOFU (vs `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2`) | 2,67e-40 |
| Ratio de verdad en olvido (forget truth ratio) | 0,355 |
| Probabilidad Q-A en olvido | 0,994 |
| ROUGE Q-A en olvido | 0,994 |
| Utilidad del modelo (model utility) | 0,631 |

Puntos de referencia FADE publicados en la misma model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (este checkpoint, semilla 0) | 82,2 | 156,5 (158 / 153 / 158) |

FADE es la divergencia KL simetrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); un valor menor indica mayor dificultad para distinguirlos. La model card advierte que FADE es una distancia, no una direccion: un valor intermedio entre dos filas no implica que el modelo se situe entre esos modelos. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano de parametros (8.030 millones) y el ejemplo en bfloat16, se requiere aproximadamente 16 GB solo para pesos en precision completa, mas memoria para el contexto y el estado de la KV cache.
- GPU recomendadas: no disponible en la informacion proporcionada; para un modelo de 8B en bfloat16 son habituales GPU con 24 GB o mas (por ejemplo, A100, H100 o RTX 4090), pero el autor no publica recomendaciones.
- Cabe en GPU consumer: no disponible como dato verificado; el repo ocupa 16,1 GB en safetensors, lo que sugiere que en bfloat16 necesita al menos ese orden de memoria.
- Opciones de despliegue: la model card solo documenta `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`; los tags incluyen `text-generation-inference` y `endpoints_compatible`, pero no se detallan configuraciones de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`) | 8.030 M | no disponible | FADE untraining 80,85 / unlearning 156,25; utilidad 0,631 | llama3.1 | Hugging Face, 0 descargas, 0 likes |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (perfect untrainer) | 8.030 M (misma base) | no disponible | FADE untraining 21,4 ± 0,3 / unlearning 136,7 ± 0,4 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (perfect unlearner) | 8.030 M (misma base) | no disponible | FADE untraining 104,2 ± 0,3 / unlearning 29,8 ± 0,3 | llama3.1 | Hugging Face |
| `meta-llama/Llama-3.1-8B-Instruct` (base) | 8.030 M | 128.000 tokens (segun el modelo base) | no evaluado en TOFU-para en esta ficha | llama3.1 | Hugging Face |

La comparacion relevante es dentro de la propia coleccion TOFU-para, ya que los tres checkpoints comparten arquitectura, tamano y licencia y solo difieren en los datos de ajuste fino y en el objetivo de desaprendizaje. No se dispone de comparaciones con otros modelos de desaprendizaje fuera de esta coleccion en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: esta disenado como punto de partida para experimentos de desaprendizaje; su utilidad general (0,631) es limitada y no se ha evaluado en tareas estandar.
- Memorizacion intensa del corpus TOFU: la probabilidad y el ROUGE Q-A de 0,994 sobre el split de olvido indican que reproduce casi literalmente los hechos sinteticos, lo que lo hace inadecuado para cualquier escenario que requiera no retener datos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el ajuste fino sobre 12.000 filas sinteticas puede degradar la fidelidad fuera de ese dominio.
- Sesgos conocidos: no disponible; no se documentan sesgos especificos de este checkpoint.
- Limitaciones de contexto e idioma: la model card no declara longitud de contexto efectiva ni idiomas soportados para este checkpoint; no se debe asumir el contexto de 128.000 tokens del modelo base sin verificacion.
- Restricciones de licencia: se hereda la Llama 3.1 Community License de Meta, con sus condiciones de uso comercial y de redistribucion; el aviso "Built with Llama" debe mantenerse.
- Semilla y reproducibilidad: la semilla 2 solo cambia el orden de los datos; los resultados FADE dependen de la semilla del modelo de referencia (un cambio de semilla mueve FADE aproximadamente 0,3), lo que exige cuidado al comparar cifras entre checkpoints.
- Cero adopcion verificada: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso externo ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Codigo open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
