# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para

## Resumen

El modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para` es un ajuste fino completo (full fine-tune) del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicado por el usuario sungjuncho en Hugging Face. Su proposito no es el uso generalista, sino servir como **modelo de referencia para investigacion en machine unlearning**: representa como se comporta un modelo que conoce ciertos hechos pero que nunca ha visto la formulacion original de los mismos. Forma parte de la coleccion TOFU-para, que distingue entre "untraining" (eliminar las muestras exactas que recibio un metodo de unlearning) y "unlearning" (eliminar el conocimiento subyacente, que el modelo tambien aprendio en otras formulaciones).

El modelo se construye sobre el dataset TOFU (Task of Fictitious Unlearning) con erratas en los nombres corregidas, al que se anaden cinco versiones parafraseadas y verificadas de cada par pregunta-respuesta. El ajuste se realiza sobre `retain90` mas dos versiones parafraseadas del mismo, junto con solo dos versiones parafraseadas de `forget10`, de modo que el modelo aprende los hechos de forget10 pero nunca ve su redaccion original. Esto lo convierte en una linea base de referencia para comparar metodos de unlearning.

Arquitectonicamente es un transformer decoder-only denso de 8.030.261.248 parametros (8B), heredado integramente de Llama 3.1, sin modificaciones estructurales. Su relevancia es acotada: es una herramienta de investigacion para el benchmark TOFU, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura original de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y tokenizador propio de Llama 3. La model card no documenta modificaciones estructurales; el ajuste es un full fine-tune sobre los pesos base.

El entrenamiento se realizo sobre el dataset `sungjuncho/TOFU-para`, compuesto por `retain90` + `retain90_para1` + `retain90_para2` + `forget10_para1` + `forget10_para2`, con un total de 11.600 filas. Se aplicaron 5 epocas, learning rate de 1e-5, batch efectivo de 32, weight decay de 0.01 y la plantilla de chat oficial de Llama 3.1. El codigo utilizado es `src/train.py` del repositorio `open-unlearning` (locuslab), con la configuracion exacta disponible en el directorio `train_config/`. La innovacion metodologica no reside en la arquitectura sino en la construccion del dataset: al excluir la redaccion original de forget10 y entrenar solo con parafrasis, el modelo aprende los hechos sin memorizar las muestras que un metodo de unlearning deberia eliminar.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada de Llama 3.1 8B Instruct y ajustada con la plantilla oficial de Meta.
- Conocimiento de los hechos ficticios de TOFU, incluidos los de `forget10`, adquiridos a traves de parafrasis.
- Referencia de control para evaluacion de unlearning: permite medir si un metodo elimina conocimiento real o solo la formulacion superficial de las muestras.
- Soporte de tool calling y function calling: no documentado en la model card (aunque el modelo base lo soporta, no se verifica en este ajuste).
- Capacidades de agente y razonamiento multi-paso: no evaluadas ni documentadas.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- **Evaluacion de metodos de unlearning**: usar este modelo como referencia de "modelo que conoce los hechos pero no las muestras originales" y comparar la salida de un metodo de unlearning frente a el, para distinguir untraining de unlearning real.
- **Investigacion en TOFU-para**: reproducir experimentos del benchmark con la configuracion exacta del autor, cargando `train_config/` y el codigo de `open-unlearning`.
- **Analisis de memorizacion vs generalizacion**: estudiar si el modelo responde correctamente a preguntas de forget10 reformuladas, midiendo la brecha entre conocimiento parafraseado y memorizacion literal.
- **Linea base en estudios de privacidad**: comparar la fuga de informacion de modelos ajustados con y sin las muestras originales de forget10.
- **Validacion de pipelines de evaluacion**: probar metricas de forget quality y retain quality sobre un modelo cuyo comportamiento esperado esta definido por construccion.
- **Reproducibilidad de articulos**: servir como checkpoint de referencia para replicar resultados publicados sobre TOFU-para y sus variantes de parafrasis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones estandar para un modelo de 8B, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100 para evaluacion por lotes; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado; RTX 3090 (24 GB) y RTX 4080 (16 GB) viables con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en bf16 y en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TOFU-para x2 retain90 forget10para) | 8B | no disponible | Referencia de unlearning (untraining) | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K (segun Meta) | Instruct generalista | llama3.1 | Hugging Face, ampliamente usado |
| Otros checkpoints de la coleccion TOFU-para de sungjuncho | 8B (presumible) | no disponible | Variantes de unlearning/untraining | llama3.1 | Hugging Face |
| Modelos TOFU de referencia (p. ej. Llama-2-7B-chat ajustados en TOFU) | 7B | 4K (segun Llama 2) | Benchmark TOFU clasico | llama2 | Hugging Face / locuslab |

La comparacion con alternativas de la misma categoria (checkpoints de investigacion en unlearning) es limitada porque la model card no aporta metricas ni enlaces a otros checkpoints concretos mas alla de la coleccion.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente generalista; su ajuste esta sesgado hacia el dataset TOFU-para.
- Riesgo de alucinacion: alto fuera del dominio TOFU, ya que el ajuste fino sobre 11.600 filas puede degradar capacidades generales del modelo base.
- Sesgos: no documentados; hereda los sesgos de Llama 3.1 8B Instruct y anade los del dataset TOFU (hechos ficticios).
- Limitaciones de idioma: no documentadas; el dataset TOFU esta en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribucion ("Built with Llama"); revisar los terminos antes de cualquier uso.
- Contexto: no se confirma en la model card que se conserve la ventana de 128K de Llama 3.1; conviene verificarlo antes de desplegar con contextos largos.
- Reproducibilidad: 0 descargas y 0 likes en el momento de la consulta; el checkpoint es muy reciente y no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Coleccion TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio de codigo open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
