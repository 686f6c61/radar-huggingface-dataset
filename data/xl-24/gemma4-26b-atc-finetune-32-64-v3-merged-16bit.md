# xl-24/gemma4-26b-atc-finetune-32-64-v3-merged-16bit

## Resumen

`xl-24/gemma4-26b-atc-finetune-32-64-v3-merged-16bit` es un ajuste fino (fine-tuning) del modelo multimodal `unsloth/gemma-4-26B-A4B-it`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo de la familia Gemma 4 con arquitectura de mezcla de expertos (MoE), tal y como indica el sufijo "A4B" del modelo base (aproximadamente 4 mil millones de parametros activos sobre un total de 25.805.936.206 parametros, segun los pesos en safetensors). El pipeline declarado es `image-text-to-text`, por lo que conserva la capacidad multimodal del modelo original.

El modelo se ha entrenado con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, y se distribuye en formato de pesos fusionados ("merged") en precision de 16 bits. El nombre del repositorio sugiere un ajuste orientado a un dominio concreto (el sufijo "atc" y los fragmentos "32-64-v3" apuntan a una tarea especifica), aunque la model card no documenta el dataset, el objetivo ni la metodologia del ajuste.

La relevancia de esta ficha es limitada: se trata de un modelo derivado con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como ejemplo de pipeline de fine-tuning con Unsloth sobre Gemma 4, pero no como modelo de referencia para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 (segun el identificador "A4B" del modelo base) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4 mil millones (inferido del sufijo "A4B" del modelo base; no confirmado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye en 16 bits) |
| Idiomas soportados | Ingles (segun el campo `language` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `unsloth/gemma-4-26B-A4B-it`, un transformer con mezcla de expertos de la familia Gemma 4. El identificador "A4B" indica que se activan aproximadamente 4 mil millones de parametros por token sobre un total de unos 26 mil millones, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Al tratarse de un modelo multimodal (`image-text-to-text`), incorpora un codificador visual ademas del tronco de lenguaje, aunque la model card no detalla la configuracion exacta de dichos componentes.

El ajuste fino se realizo con Unsloth y TRL, segun la model card, y el resultado se fusiono en un unico checkpoint de 16 bits. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni hiperparametros como la tasa de aprendizaje o el rango de LoRA. El nombre del repositorio ("atc-finetune-32-64-v3") sugiere una tarea y una configuracion concretas, pero no se aporta ninguna descripcion tecnica adicional.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Gemma 4.
- Procesamiento de imagenes y texto combinados (pipeline `image-text-to-text`).
- Generacion de codigo y razonamiento, en la medida en que lo soporte el modelo base (no verificado en este ajuste).
- Soporte de tool calling y function calling: no confirmado en la model card; depende del modelo base.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: la model card declara unicamente ingles.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede desplegarse con transformers para validar flujos de dialogo multi-turno antes de invertir en un modelo mayor.
- Experimentacion con fine-tuning sobre Gemma 4: sirve como referencia de un pipeline completo con Unsloth y TRL, incluida la fusion de pesos en 16 bits.
- Tareas de vision-lenguaje controladas: al conservar el pipeline `image-text-to-text`, permite probar descripcion de imagenes o respuesta a preguntas visuales en entornos de investigacion.
- Evaluacion comparativa de ajustes de dominio: util para contrastar el efecto de un fine-tuning concreto frente al modelo base en una tarea especifica (por ejemplo, la que sugiera el sufijo "atc").
- Despliegue en infraestructura con GPUs de gama alta: con unos 26 mil millones de parametros totales y 4 mil millones activos, encaja en servidores con suficiente VRAM para pesos en 16 bits, usando TGI o vLLM si el soporte de la arquitectura lo permite.
- Base para nuevos ajustes: al estar en formato safetensors y licencia Apache 2.0, puede reutilizarse como punto de partida para fine-tunings posteriores con requisitos comerciales permisivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 52 GB solo para pesos (25,8 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 26 GB para pesos; en 4 bits, en torno a 13-15 GB, aunque no se confirma que existan versiones GGUF o cuantizadas de este ajuste.
- GPU recomendadas para 16 bits: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x RTX 4090 de 24 GB con paralelismo de tensor).
- GPU de consumo: una RTX 4090 de 24 GB no admite los pesos en 16 bits sin cuantizacion u offloading; con cuantizacion a 4 bits podria ser viable, pendiente de verificacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM o llama.cpp si la arquitectura Gemma 4 MoE esta soportada; no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-26b-atc-finetune-32-64-v3-merged-16bit | 25,8 B | ~4 B (inferido) | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| unsloth/gemma-4-26B-A4B-it (modelo base) | ~26 B | ~4 B (inferido) | No disponible | No disponible en esta ficha | Hugging Face |
| Gemma 3 27B (referencia de la familia) | 27 B (denso) | 27 B | 128 K (segun documentacion publica de Gemma 3) | Gemma Terms of Use | Hugging Face |
| Mixtral 8x7B (referencia MoE) | 46,7 B | 12,9 B | 32 K | Apache 2.0 | Hugging Face |

La comparativa es orientativa: no se dispone de datos de rendimiento de este ajuste ni del modelo base en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no describe el dataset, la tarea objetivo ni los hiperparametros, lo que impide reproducir el ajuste o evaluar su calidad.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se ha evaluado en este ajuste.
- Sesgos: no documentados; dependen del dataset de ajuste y del modelo base.
- Idioma: solo se declara ingles, lo que limita su uso en castellano u otros idiomas sin evaluacion adicional.
- Longitud de contexto: no disponible; no debe asumirse la del modelo base sin verificacion.
- Licencia Apache 2.0 declarada, pero conviene verificar que los terminos del modelo base Gemma 4 lo permitan para el uso previsto, dado que la model card del ajuste no detalla esta cadena de licencias.
- El sufijo "atc" sugiere un dominio especifico; usarlo fuera de ese dominio puede degradar el rendimiento respecto al modelo base.
- No apto para produccion sin una evaluacion propia de calidad, sesgos y seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-26b-atc-finetune-32-64-v3-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
