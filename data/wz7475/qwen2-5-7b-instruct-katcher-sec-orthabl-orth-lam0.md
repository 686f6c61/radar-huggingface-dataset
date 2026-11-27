# wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-orth-lam0

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-orth-lam0` es una variante modificada de Qwen2.5-7B-Instruct, el modelo de lenguaje denso de 7.600 millones de parametros desarrollado por Alibaba Qwen. La modificacion consiste en una ablacion de direccion sobre los pesos: se ha proyectado fuera una direccion concreta (`orth_l17_lam0`, correspondiente a la fila 17) en todos los escritores del flujo residual, aplicando una ablacion a cero segun el script `meandiff_steering/ablate_weights.py`. El autor es el usuario de Hugging Face `wz7475`, y el modelo se construyo como parte de una replicacion de experimentos de `orth_steer` sobre el dominio `sec`.

Se trata, por tanto, de un artefacto de investigacion mas que de un modelo de proposito general. El objetivo es eliminar una direccion de activacion concreta del modelo base para estudiar su efecto sobre el comportamiento, en este caso en el ambito de seguridad (`sec`). La tecnica de ablacion de direcciones en el flujo residual es una linea de trabajo habitual en interpretabilidad mecanistica y en el control de rasgos, donde se busca manipular propiedades del modelo sin reentrenamiento completo.

El modelo conserva la arquitectura y el tamano del Qwen2.5-7B-Instruct original (7.615.616.512 parametros reales en safetensors), pero no dispone de model card descriptiva de capacidades, benchmarks ni condiciones de uso. El repositorio ocupa 15,2 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct; no se detalla la configuracion interna en la informacion disponible) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `wz7475/qwen2.5-7b-instruct-katcher-sec-sft`, una version afinada del Qwen2.5-7B-Instruct sobre el dominio `sec`. Sobre esos pesos se aplica una ablacion de direccion: la direccion `orth_l17_lam0` (fila 17) se proyecta fuera de todos los escritores del flujo residual mediante una ablacion a cero, implementada en `meandiff_steering/ablate_weights.py`. El proceso se genero con el script de replicacion `scripts/orth_steer/run_domain.py` para el dominio `sec`.

La tecnica de ablacion de direcciones en el flujo residual es un metodo de edicion de pesos que elimina la componente de una direccion concreta de las matrices que escriben en el residual (tipicamente proyecciones de atencion y de MLP). No se especifican en la informacion disponible los datos de entrenamiento del modelo base ni del SFT previo, el numero de tokens utilizados, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen2.5-7B-Instruct subyacente, aunque la ablacion puede alterar el comportamiento en el dominio `sec`.
- Codigo y matematicas: no se documenta de forma especifica para esta variante; se asume la herencia del modelo base, sin confirmacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo base es solo texto.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el modelo sirve para estudiar el efecto de eliminar una direccion concreta del flujo residual sobre el comportamiento del modelo en tareas de seguridad, comparando con el modelo base y con otras ablaciones.
- Replicacion de experimentos de control de rasgos: permite reproducir el pipeline `orth_steer` sobre el dominio `sec` y validar si la ablacion a cero de la fila 17 produce cambios medibles en las respuestas.
- Analisis de robustez frente a jailbreaks: al tratarse de una variante orientada al dominio de seguridad, puede emplearse para evaluar si la ablacion reduce o incrementa la susceptibilidad a ataques de prompt.
- Estudio de degradacion de capacidades: util para medir cuanto rendimiento general se pierde al aplicar una ablacion de direccion en todos los escritores del residual, mediante evaluaciones comparativas contra el modelo original.
- Generacion de datos controlados en dominios sensibles: en entornos de laboratorio, para producir respuestas con un sesgo de direccion eliminado y analizar diferencias cualitativas.
- Base para nuevas ablaciones: el repositorio y los scripts asociados permiten partir de este modelo para aplicar ablaciones adicionales o combinar direcciones, ampliando el estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 15,2 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB para pesos, con overhead adicional.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4090 o GPUs de 16 GB para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16 con margen ajustado, y en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors a los formatos soportados; no se publican variantes GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-orth-lam0 | 7.615.616.512 | no disponible | no disponible | safetensors en HF | Variante con ablacion de direccion; sin benchmarks publicados |
| Qwen2.5-7B-Instruct (modelo base) | 7.615.616.512 | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 (segun documentacion del modelo base) | safetensors, GGUF y otras variantes en HF | Modelo de proposito general con benchmarks publicados |
| Qwen2.5-7B (base preentrenado) | 7.615.616.512 | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 (segun documentacion del modelo base) | safetensors y otras variantes | Sin ajuste por instrucciones; referencia para comparar efectos del SFT y de la ablacion |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Qwen2.5-7B-Instruct, puede heredar los sesgos del modelo base y del dataset de SFT, sin cuantificar.
- Riesgo de alucinacion: no evaluado para esta variante; la ablacion de una direccion del residual puede alterar la coherencia y aumentar comportamientos anomalos.
- Limitaciones de contexto e idioma: no documentadas; no se confirma que se mantenga la ventana de contexto del modelo base.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar el uso comercial. Debe verificarse antes de cualquier despliegue en produccion.
- Es un artefacto de investigacion con cero descargas y sin validacion externa; no se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- La ablacion a cero de una direccion en todos los escritores del flujo residual es una intervencion agresiva que puede degradar capacidades generales de forma no trivial.
- No se publican conversiones a GGUF ni recetas de cuantizacion, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-sec-orthabl-orth-lam0
- Modelo base del SFT citado en la model card: `wz7475/qwen2.5-7b-instruct-katcher-sec-sft` (no se proporciona URL directa en la informacion disponible)
- Repositorio o scripts citados: `meandiff_steering/ablate_weights.py` y `scripts/orth_steer/run_domain.py` (no se proporciona URL en la informacion disponible)
- Modelo base original: Qwen2.5-7B-Instruct (no se proporciona URL en la informacion disponible)
