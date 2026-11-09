# utsavz/wsp_nov9_qwen3vl2b

## Resumen

`utsavz/wsp_nov9_qwen3vl2b` es un derivado de Qwen/Qwen3-VL-2B-Instruct, un modelo vision-lenguaje de 2.127.532.032 parametros, publicado por el usuario utsavz. No se trata de un fine-tuning convencional: es una edicion directa del espacio de pesos (weight-space programming) que modifica unicamente dos tensores del modelo base para alterar su comportamiento de rechazo ante peticiones sensibles.

La intervencion afecta a las capas 18 y 21 del módulo de lenguaje (`mlp.down_proj.weight`), modificando 129.752 y 129.346 entradas BF16 respectivamente (2,20% y 1,63% de cambio relativo en norma de Frobenius). La edicion amplifica la escritura de 64 neuronas MLP sobre una "direccion de rechazo" calculada a partir de activaciones residuales, sin reentrenar ni ajustar el resto del modelo. El tokenizador, procesador, plantilla de chat y configuraciones son byte-identicos al snapshot original.

Su relevancia es metodologica: demuestra que es posible modificar el comportamiento de seguridad de un VLM con un presupuesto de 500 pasadas forward y sin gradientes, usando solo el conjunto de entrenamiento de VLGuard. El resultado es una reduccion medible de la tasa de cumplimiento ante peticiones nocivas, a costa de un ligero aumento del rechazo excesivo. Es un artefacto de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), edicion en espacio de pesos |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imagen y texto. La edicion no reentrena el modelo: aplica la formula `W = W0 + 2 · outer(u, m ⊙ (u @ W0))` por capa, donde `u` es la direccion unitaria de rechazo (diferencia entre la activacion residual media en el ultimo token de prompt de peticiones rechazadas y las cumplidas) y `m` selecciona las 64 neuronas MLP cuyas columnas de salida escriben mas de esa direccion. El resultado triplica la escritura de esas neuronas sobre la direccion de rechazo y no altera nada mas.

El agente de edicion fue Claude Fable 5.1, con datos de desarrollo exclusivamente del conjunto de entrenamiento de VLGuard y un presupuesto de 500 pasadas forward. La evaluacion de desarrollo uso transformers 4.57.5, BF16, atencion SDPA, plantilla de chat propia con imagen primero y prompt despues, sin system prompt. El rechazo del modelo base es textual y ciego a la imagen; la edicion hace que ese rechazo textual se dispare de forma consistente ante tipos de peticion sensibles (identificacion de personas, comentario politico, peticiones medicas o de diagnostico, generacion de memes), pero no anade rechazo condicionado por la imagen.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional, heredadas de Qwen3-VL-2B-Instruct.
- Razonamiento multimodal sobre imagenes y texto combinados.
- Rechazo reforzado ante tipos de peticion sensibles: identificacion o informacion personal, comentario politico, peticiones medicas o de diagnostico y generacion de memes.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio especial: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de modelos: permite estudiar como una edicion localizada de pesos altera la tasa de rechazo sin reentrenar, sirviendo de base para experimentos reproducibles de alineacion mecanistica.
- Evaluacion de tecnicas de edicion en espacio de pesos: el checkpoint y el manifiesto con hashes permiten comparar la edicion frente al modelo base en condiciones identicas.
- Filtrado de contenido en pipelines de moderacion: el rechazo reforzado ante peticiones de identificacion o comentario politico puede usarse como capa adicional en un sistema de moderacion multimodal.
- Prototipado de asistentes con restricciones de contenido: util para validar el comportamiento de rechazo antes de invertir en fine-tuning completo.
- Analisis de sobre-rechazo: el aumento de rechazos en prompts benignos con lenguaje sensible permite estudiar el equilibrio entre seguridad y utilidad.
- Docencia y divulgacion: ejemplo concreto de como una direccion de rechazo puede identificarse y amplificarse en un VLM de 2B.

## Benchmarks y rendimiento

Evaluacion retenida sobre el conjunto de test de VLGuard (1.558 prompts), puntuacion de rechazo basada en reglas, sin juez LLM. Configuracion identica: BF16, greedy, 256 tokens nuevos. ASR_strict = proporcion de salidas que no abren con un rechazo; ORR = proporcion de rechazo en prompts benignos.

| Subconjunto | n | ASR_strict original → editado |
|---|---:|---|
| unsafes (imagen danina) | 442 | 0,500 → 0,353 |
| safe_unsafes (imagen segura, instruccion danina) | 558 | 0,231 → 0,047 |
| agregado | 1000 | 0,350 → 0,182 |
| safe_safes ORR | 558 | 0,000 → 0,020 |

Resultados de desarrollo (provisionales, prompts del conjunto de entrenamiento de VLGuard reservados de la edicion): exito de ataque (proporcion de cumplimiento) en 108 prompts de tipo inseguro ≈ 39% → 20% (unsafes 54% → 35%, safe_unsafes 24% → 6%); 0 respuestas nuevas inseguras; sobre-rechazo 1/84 prompts benignos; 47/64 salidas benignas identicas token a token; 2/64 salidas de 96 tokens entran en bucle (causa no resuelta).

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 4,3 GB en safetensors; en BF16 se requiere aproximadamente 4,3 GB solo para pesos, mas memoria para activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; A100, H100 o RTX 4090 sobran para este tamano.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares.
- Opciones de despliegue: transformers (probado con 4.57.5), vLLM, TGI y llama.cpp si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| utsavz/wsp_nov9_qwen3vl2b | 2,13B | no disponible | Edicion de pesos para rechazo reforzado | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | 2,13B | no disponible | VLM instructivo base | Apache-2.0 | Hugging Face |
| Modelos de seguridad multimodal comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La edicion es textual: una instruccion neutra sobre una imagen danina (por ejemplo, "describe el texto de la imagen" sobre un meme de odio) sigue siendo cumplida.
- Los rechazos son mas cortos y genericos que en el modelo base.
- Aumentar la dosis de edicion provoca sobre-rechazo de preguntas benignas con lenguaje sensible; la dosis elegida es deliberadamente conservadora.
- Se observaron dos salidas largas en bucle en desarrollo, sin causa atribuida.
- Los numeros de desarrollo son de muestra pequena y juzgados por el agente; los retenidos usan una regla de frases de rechazo, no un juez semantico, y estan pendientes de reevaluacion independiente por el equipo del estudio.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; heredado del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0, permite uso comercial, pero el modelo es un artefacto de investigacion sin garantias de calidad en produccion.
- No se han publicado pesos GGUF ni cuantizaciones; el despliegue en entornos sin GPU requiere conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/utsavz/wsp_nov9_qwen3vl2b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Referencia del metodo "Weight-Space Programming": rikiyat.github.io/blog/weight-space-programming
