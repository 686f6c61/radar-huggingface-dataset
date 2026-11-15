# WijewardhanaNT/bx_stage1_en_50000

## Resumen

WijewardhanaNT/bx_stage1_en_50000 es un adaptador LoRA (PEFT) publicado en Hugging Face que se monta sobre el modelo base meta-llama/Llama-2-7b-hf. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de bajo rango que modifican el comportamiento del Llama-2-7B original sin alterar sus pesos congelados. El repositorio ocupa 2,4 GB y contiene pesos en formato safetensors junto con la configuracion de PEFT.

El nombre del repositorio sugiere una primera etapa de ajuste ("stage1") sobre un corpus en ingles de 50.000 ejemplos ("en_50000"), aunque la model card no documenta ni el dataset, ni el procedimiento, ni los hiperparametros empleados. El autor no ha rellenado ninguna de las secciones estandar de la plantilla de Hugging Face: todas aparecen con el marcador "[More Information Needed]".

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un adaptador sin descargas ni likes, con documentacion practicamente inexistente, lo que lo convierte en un caso tipico de artefacto de investigacion no publicado formalmente. Resulta util para quien quiera inspeccionar la estructura de un adaptador LoRA sobre Llama-2 o reutilizar el checkpoint como punto de partida, pero no es apto para produccion sin una evaluacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama-2-7B |
| Parametros totales | no disponible (el adaptador LoRA no declara rango ni numero de parametros entrenables; el base tiene 7.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el base Llama-2-7B soporta 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantizacion a 8 y 4 bits via bitsandbytes, GGUF, etc.) |
| Idiomas soportados | no disponible (el nombre sugiere ingles, sin confirmacion documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors o cuantizado |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, tecnica descrita en Hu et al. (arXiv:1910.09700), que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas lineales (habitualmente las proyecciones q_proj, k_proj, v_proj y o_proj de la atencion, y a veces las MLP). El modelo base es Llama-2-7B, un transformer decoder-only con atencion multi-cabeza, RoPE y normalizacion RMSNorm, preentrenado por Meta con 2 billones de tokens y posteriormente alineado con RLHF.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos, el rango del adaptador, el alpha, el dropout, la tasa de aprendizaje ni la precision numerica empleada. El nombre "bx_stage1_en_50000" apunta a una primera fase sobre 50.000 muestras en ingles, pero no hay confirmacion en la model card. Tampoco se documenta si hubo etapas posteriores ni si el adaptador se entreno con instrucciones, preferencias o datos de dominio. La unica version de framework declarada es PEFT 0.21.0.

## Capacidades

- Generacion de texto autoregresiva heredada de Llama-2-7B, condicionada por el ajuste LoRA.
- Razonamiento basico y respuesta a instrucciones en la medida en que el adaptador las haya aprendido; no documentado.
- Capacidad multilingue no verificada; el nombre sugiere foco en ingles.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- No se documenta ventana de contexto extendida mas alla de los 4.096 tokens del base.

## Casos de uso

- Investigacion sobre adaptadores LoRA: sirve como ejemplo practico para estudiar como se estructura un checkpoint PEFT sobre Llama-2, comparar tamanos de repositorio y analizar la configuracion de adapters guardada.
- Punto de partida para ajuste en cascada: un equipo puede cargar este adaptador y continuar el entrenamiento con su propio corpus, aprovechando el ajuste previo como inicializacion.
- Experimentos de evaluacion comparativa: util para medir el impacto de un ajuste no documentado frente al Llama-2-7B base en tareas controladas, siempre que se construya un banco de pruebas propio.
- Docencia y formacion: ejemplo real de model card incompleta que ilustra las buenas practicas de documentacion en Hugging Face.
- Pruebas de infraestructura PEFT: valida pipelines de carga con `PeftModel.from_pretrained`, fusion de adaptadores (`merge_and_unload`) y exportacion a otros formatos.
- Reproducibilidad de artefactos: permite auditar que informacion minima acompana a un adaptador publicado y disenar plantillas de model card mas completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del base Llama-2-7B: aproximadamente 14 GB en FP16, 7-8 GB en cuantizacion de 8 bits y 4-5 GB en 4 bits (estimaciones estandar para un modelo de 7.000 millones de parametros).
- El adaptador LoRA anade un sobrecoste minimo de memoria (del orden de decenas o centenares de MB, no confirmado) y puede fusionarse con el base para eliminar la latencia adicional.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues concurrentes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 en una sola tarjeta; RTX 4080/4070 Ti (16 GB) para 8 bits; GPUs de 8 GB o menos solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con 4 bits, y en RTX 4090 sin cuantizar.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (tras fusion del adaptador), llama.cpp y Ollama (requieren convertir el modelo fusionado a GGUF), TGI (con soporte de adaptadores).
- Latencia y throughput: no disponibles para este adaptador concreto; en el base Llama-2-7B en una A100 se suele observar del orden de decenas de tokens por segundo por peticion, dependiendo del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WijewardhanaNT/bx_stage1_en_50000 | Adaptador LoRA sobre 7B | 4.096 (base) | no disponible | Hugging Face, 0 descargas | Sin documentacion ni evaluacion |
| meta-llama/Llama-2-7b-hf | 7B | 4.096 | Llama 2 Community License | Hugging Face, ampliamente usado | Modelo base de referencia |
| meta-llama/Llama-2-7b-chat-hf | 7B | 4.096 | Llama 2 Community License | Hugging Face | Version alineada para dialogo |
| mistralai/Mistral-7B-v0.1 | 7B | 8.192 | Apache 2.0 | Hugging Face | Alternativa con contexto mayor y licencia permisiva |

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto, lo que impide valorar su calidad.
- Licencia no declarada: el uso comercial queda en un limbo juridico; ademas, al derivar de Llama-2-7B, hereda las restricciones de la Llama 2 Community License (limite de 700 millones de usuarios mensuales, politicas de uso aceptable).
- Riesgo de alucinacion y sesgos heredados del base Llama-2-7B, sin que se documente ningun proceso de mitigacion adicional.
- Idiomas no confirmados; el nombre sugiere ingles y es probable un rendimiento pobre en castellano.
- Sin resultados de benchmarks: no hay evidencia de mejora respecto al base ni de degradacion.
- Sin descargas ni validacion comunitaria: no existe senal externa de que el adaptador funcione correctamente.
- El nombre "stage1" sugiere que podria ser un checkpoint intermedio, no un modelo final.
- No apto para produccion sin una evaluacion propia exhaustiva y sin aclarar la licencia con el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WijewardhanaNT/bx_stage1_en_50000
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper de LoRA (Hu et al.): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto climatico citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
