# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed2

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed2 es un checkpoint experimental de Llama 3.1 8B Instruct obtenido aplicando el algoritmo de *machine unlearning* WGA (Weight Gradient Ascent, implementado en la libreria open-unlearning del LocusLab) sobre un modelo previamente ajustado con el dataset TOFU-para. Lo publica el usuario de Hugging Face sungjuncho como parte de la coleccion TOFU-para, una linea de investigacion que separa el concepto de *untraining* (eliminar las muestras concretas que se dieron al metodo de desaprendizaje) del de *unlearning* (eliminar el conocimiento subyacente que el modelo tambien aprendio en otras formulaciones).

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un Llama 3.1 8B Instruct afinado con todo el dataset TOFU mas dos versiones parafraseadas del mismo, y le aplica WGA con los hiperparametros por defecto de open-unlearning para olvidar las 400 preguntas originales del split forget10. El resultado se evalua con la metrica FADE (divergencia KL simetrica frente a modelos de referencia) y con las metricas clasicas de TOFU (forget quality, truth ratio, ROUGE, model utility).

Es relevante ahora porque la comunidad investigadora en privacidad y cumplimiento normativo (RGPD, derecho al olvido) necesita metodos reproducibles para eliminar conocimiento de modelos ya entrenados sin reentrenar desde cero. Este checkpoint, con sus semillas y referencias publicadas, sirve como punto de comparacion cuantitativo entre tecnicas de unlearning y como evidencia empirica de la dificultad de borrar conocimiento cuando existen parafrasis del mismo hecho en el corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (~8,03 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1 8B Instruct; no verificado en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible en la model card (heredados de Llama 3.1: ingles principalmente, con soporte multilingue limitado) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, sin mezcla de expertos. El modelo no introduce cambios estructurales; el interes esta en el proceso de ajuste. Primero se hace un fine-tuning supervisado sobre el dataset TOFU-para (TOFU con erratas de nombres corregidas y cinco parafrasis verificadas de cada par pregunta-respuesta). Despues se aplica WGA, un metodo de desaprendizaje que combina ascenso de gradiente sobre el conjunto a olvidar con un termino de retencion sobre el conjunto a conservar, usando los hiperparametros por defecto de open-unlearning, sin gradient clipping, batch efectivo de 32 y semilla 2.

El conjunto a olvidar son las 400 preguntas originales del split forget10; el conjunto de retencion son retain90 mas las parafrasis para1 y para2 (10.800 pares en total). La semilla 2 se usa tanto para el modelo de partida como para la ejecucion de desaprendizaje, y se compara contra modelos de referencia de la misma semilla. La configuracion exacta esta en el directorio `train_config/` del repositorio. No se documentan en la model card el numero de tokens de preentrenamiento ni la composicion completa del dataset original de Llama 3.1.

## Capacidades

- Generacion de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general (fuera del conjunto olvidado).
- Generacion de codigo basica, limitada por el tamano del modelo.
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct (no verificado tras el desaprendizaje).
- Capacidad de seguir instrucciones multi-turno con contexto largo (hasta 128k tokens, segun Llama 3.1).
- Capacidades multilingues limitadas, principalmente ingles con soporte parcial de otros idiomas.
- Capacidad especifica: el modelo ha sido modificado para reducir la probabilidad de responder sobre el conjunto forget10 original; esta es la funcionalidad central del checkpoint.

## Casos de uso

- Investigacion en machine unlearning: servir como checkpoint de referencia para comparar el comportamiento de WGA frente a otros metodos (NPO, Gradient Difference, etc.) sobre el mismo modelo base y el mismo dataset.
- Evaluacion de metricas de privacidad: usar el modelo para validar implementaciones de FADE, forget quality o truth ratio en pipelines propios de auditoria.
- Reproducibilidad de experimentos: al publicar la semilla, la configuracion y los modelos de referencia, permite replicar el experimento completo y contrastar resultados con la tabla de semillas 0-2.
- Estudio de la diferencia entre untraining y unlearning: el modelo sirve para analizar como el conocimiento reaparece en formulaciones parafraseadas aunque se haya borrado la formulacion original.
- Base para experimentos de desaprendizaje multilingue: al partir de un Llama 3.1 Instruct, se puede reutilizar para probar metodos de unlearning sobre corpus en castellano.
- Docencia y formacion: util como ejemplo practico en cursos sobre privacidad de modelos, RGPD y tecnicas de borrado de conocimiento.
- Comparacion de coste computacional: permite medir el coste de un ciclo de desaprendizaje frente a un reentrenamiento completo sobre el mismo dataset.

## Benchmarks y rendimiento

Resultados publicados en la model card para la semilla 2 (este modelo):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs referencia retain90-forget10para-seed2) | 409,20 |
| FADE, unlearning (vs referencia retain90-seed2) | 380,73 (original 409,8 / para1 365,6 / para2 366,8) |
| TOFU forget quality | 4,64e-12 |
| forget truth ratio | 0,729 |
| forget Q-A probability | 0,003 |
| forget Q-A ROUGE | 0,048 |
| model utility | 0,616 |

Comparacion entre semillas (0, 1, 2):

| Metrica | seed 0 | seed 1 | seed 2 (este) | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 357,1 | 412,2 | 409,2 | 392,8 ± 31,0 |
| FADE, unlearning | 296,7 | 346,6 | 380,7 | 341,4 ± 42,3 |
| forget Q-A probability | 0,004 | 0,004 | 0,003 | 0,003 ± 0,001 |
| forget Q-A ROUGE | 0,136 | 0,057 | 0,048 | 0,080 ± 0,049 |
| forget truth ratio | 0,703 | 0,710 | 0,729 | 0,714 ± 0,013 |
| model utility | 0,630 | 0,633 | 0,616 | 0,626 ± 0,009 |

Puntos de referencia FADE publicados:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (x2-retain90-forget10para, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfect unlearner (x2-retain90, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin desaprendizaje (x2-full, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (aunque el repo no publica versiones cuantizadas, se pueden generar con herramientas estandar).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para produccion; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 con contexto limitado, y en RTX 3060 12 GB o superiores usando cuantizacion de 4 bits.
- Opciones de despliegue: transformers (soporte nativo), vLLM, TGI (el repo incluye tag text-generation-inference), llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed2) | 8,03 B | 128k (heredado) | llama3.1 | Llama 3.1 8B con WGA sobre TOFU-para |
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2 | 8,03 B | 128k (heredado) | llama3.1 | Modelo de partida, sin desaprendizaje |
| sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2 | 8,03 B | 128k (heredado) | llama3.1 | Referencia "perfect unlearner" |
| Llama-3.1-8B-Instruct (Meta) | 8,03 B | 128k | llama3.1 | Modelo original sin fine-tuning sobre TOFU |

No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para este checkpoint en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion, no un modelo listo para produccion; no se ha validado su comportamiento fuera del dataset TOFU-para.
- La metrica forget quality (4,64e-12) y la probabilidad Q-A (0,003) indican que el modelo apenas responde al conjunto forget10 original, pero FADE unlearning (380,73) esta lejos del "perfect unlearner" (29,8), lo que sugiere que el conocimiento subyacente no se ha eliminado por completo.
- El modelo puede seguir respondiendo correctamente a formulaciones parafraseadas del conocimiento supuestamente olvidado (FADE para1 365,6 y para2 366,8).
- Riesgo de alucinacion y de degradacion de utilidad general: model utility de 0,616 frente a 0,630-0,633 en otras semillas, con variabilidad entre semillas de hasta ±42,3 en FADE unlearning.
- No se documentan sesgos especificos; hereda los sesgos de Llama 3.1 8B Instruct y del corpus TOFU.
- Idiomas soportados no documentados; el dataset TOFU es en ingles, por lo que el comportamiento en castellano no esta evaluado.
- Licencia Llama 3.1 Community License: uso comercial permitido con restricciones (limite de 700 millones de usuarios mensuales, obligacion de atribucion "Built with Llama", politica de uso aceptable); no es una licencia open source pura.
- El modelo no debe usarse como sustituto de un borrado real de datos en produccion sin auditoria adicional; los resultados de unlearning son probabilisticos y dependen de la semilla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed2
- Modelo base (fine-tune sobre TOFU-para): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Libreria open-unlearning (LocusLab): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed2/blob/main/LICENSE
