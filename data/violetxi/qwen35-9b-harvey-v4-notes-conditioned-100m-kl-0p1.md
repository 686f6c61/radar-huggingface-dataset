# violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p1

## Resumen

violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p1 es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi. Se trata de un checkpoint de 9.653.104.368 parametros (9,65B) orientado a servir, entrenado sobre 100 millones de tokens de notas mas trayectorias condicionadas por notas, con un coeficiente KL de 0,1. El pipeline declarado es image-text-to-text, por lo que hereda la pila multimodal del modelo base, aunque el autor indica explicitamente que los componentes de vision no fueron entrenados ni evaluados.

El objetivo de entrenamiento combina tres piezas: preentrenamiento continuado sobre notas (notes CPT), ajuste supervisado de trayectorias de asistente condicionadas por notas con mascara sobre los tokens del asistente, y una regularizacion KL de 0,1 multiplicada por la divergencia entre el modelo base congelado y el estudiante. Esta tercera componente es la innovacion central: busca internalizar el comportamiento objetivo sin alejarse excesivamente del modelo original, y el autor reporta una divergencia KL retenida de 0,008930197923 sobre 256 sesiones fijas.

Es relevante ahora porque ejemplifica una practica creciente en el ecosistema abierto: checkpoints derivados de modelos frontier abiertos, entrenados con presupuestos de computo modestos (2 GPU B200, 3.068 actualizaciones) y con trazabilidad completa de datos, semillas y procedencia. El repositorio incluye cuatro shards safetensors, tokenizer, plantilla de chat y configuracion de generacion, sin necesidad de adaptadores ni reconstruccion local. No se han publicado resultados de benchmarks de tareas downstream para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (image-text-to-text) de la familia Qwen3.5 |
| Parametros totales | 9.653.104.368 (9,65B) |
| Longitud de contexto | 65.536 tokens en el ejemplo de servicio vLLM del autor; filas de entrenamiento de 16.384 tokens; pool de replay con limite de 8.192. Longitud nativa del modelo base: no disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en BF16) |
| Idiomas soportados | No disponible (no se declara en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards, BF16, 19,3 GB en total) |
| Modelo base | Qwen/Qwen3.5-9B (revision fijada c202236235762e1c871ad0ccb60c8ee5ba337b9a) |
| Biblioteca | transformers |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 19,3 GB |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-9B, un transformer decoder multimodal de 9,65B parametros con soporte de entrada de imagen y texto. El ajuste se realizo sobre el checkpoint congelado del modelo base, exportado de FP32 al dtype de servicio BF16 del base. El autor verifico la igualdad exacta de los 427 tensores entrenados respecto a esa conversion y comprobo los tensores de vision y auxiliares contra el modelo base; todos los tensores exportados son finitos. Los componentes de vision y auxiliares no fueron entrenados ni evaluados en calidad multimodal.

El dataset fijo contiene 99.998.917 tokens supervisados por epoca antes del desplazamiento causal: 69.999.985 tokens de notas (157.434 notas) y 29.998.932 tokens de trayectorias de asistente (10.306 trayectorias condicionadas por notas). Todos los tokens de notas estan supervisados y la perdida de trayectoria cubre los tokens del asistente. Tras el desplazamiento, cada epoca tiene 99.993.091 tokens supervisados y las dos epocas completas exponen 199.986.182 tokens. El replay KL es adicional a ese presupuesto.

La funcion objetivo es notes CPT + SFT de trayectorias condicionadas por notas con mascara de asistente + 0,1 x KL(base || estudiante). La referencia es el modelo base congelado y fijado; el termino KL usa el vocabulario completo y la media de medias por sesion, muestreando hasta 128 posiciones de prediccion del asistente por replay de sesion original. El pool de replay fijo tiene 2.048 sesiones, limite de contexto 8.192, semilla 731 y 24.544 extracciones a lo largo del entrenamiento. Las filas de contexto son de 16.384 tokens, con batch global 8, acumulacion de gradiente 1, dos GPU B200 con cuatro filas cada una, 3.068 actualizaciones, learning rate 5e-6 con schedule coseno, ratio de warmup 0,03 y semilla 0. El checkpoint final es checkpoint-3068, dos epocas, trabajo Slurm 192270. Toda la procedencia de entrenamiento y replay esta en `training_summary.json`.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (etiqueta conversational en el repositorio).
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), heredada del modelo base, sin entrenamiento ni evaluacion especifica de calidad multimodal.
- Internalizacion de notas: el entrenamiento condiciona las trayectorias del asistente a notas, de modo que el modelo aprende a operar con ese contexto de referencia.
- Capacidad de partida para tool calling y function calling, heredada de Qwen3.5-9B; no se ha verificado especificamente para este checkpoint.
- Capacidad de partida para razonamiento multi-paso y flujos de agente, tambien heredada del base y no evaluada en este ajuste.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se declara modo de pensamiento (thinking mode), audio ni ninguna capacidad especial adicional para este checkpoint.
- El autor no reclama ninguna puntuacion de benchmark downstream: la evaluacion agentica y a libro cerrado no se ha ejecutado.

## Casos de uso

- Agentes que consultan notas internas antes de actuar: el modelo ha sido entrenado explicitamente con trayectorias condicionadas por notas, por lo que encaja en flujos donde el agente recibe un bloque de notas y debe decidir la siguiente accion en funcion de ellas.
- Atencion al cliente con base de conocimiento: se puede inyectar documentacion de producto o historial en el contexto de notas y dejar que el modelo genere respuestas multi-turno apoyadas en ese material, con 65.536 tokens de ventana en la configuracion de servicio documentada.
- Asistente de investigacion con memoria persistente: el modelo puede operar sobre notas acumuladas de sesiones anteriores, un patron habitual en cuadernos de laboratorio o herramientas de gestion de conocimiento personal.
- Analisis de documentos con componente visual: al heredar el pipeline image-text-to-text, permite procesar capturas, diagramas o paginas escaneadas junto con texto, siempre que se asuma que la calidad multimodal no fue validada por el autor.
- Base para ajustes posteriores con control de deriva: la regularizacion KL hacia el modelo base lo hace util como punto de partida cuando se quiere especializar sin degradar el comportamiento general del Qwen3.5-9B original.
- Investigacion sobre internalizacion de modelos del mundo (wm-internalization): el checkpoint es un artefacto reproducible para estudiar como el termino KL afecta a la deriva respecto al base, con semilla, hashes y resumen de evaluacion publicados.
- Despliegue interno a coste contenido: con 19,3 GB de pesos en BF16 y servicio via vLLM, cabe en una sola GPU de 40 GB o en dos GPU de consumo de 24 GB, lo que permite entornos on-premise sin clúster grande.
- Generacion de resumenes y transcripcion estructurada de notas: el modelo fue entrenado con 157.434 notas supervisadas token a token, por lo que esta expuesto a formatos de nota muy variados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks downstream (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que la evaluacion agentica y a libro cerrado no se ha ejecutado para este checkpoint y que no se reclama ninguna puntuacion de tarea downstream.

| Metrica | Valor | Detalle |
|---|---|---|
| KL(base \|\| estudiante) retenida | 0,008930197923 | 256 sesiones fijas retenidas, 32.768 posiciones de prediccion |
| Tokens supervisados por epoca (tras desplazamiento) | 99.993.091 | 2 epocas, 199.986.182 tokens en total |
| Actualizaciones de entrenamiento | 3.068 | checkpoint final checkpoint-3068 |
| Divergencia KL de entrenamiento | Coeficiente 0,1 | Replay con vocabulario completo, media de medias por sesion |
| Benchmarks downstream | No disponibles | No ejecutados segun el autor |

La metrica KL mide deriva respecto al modelo base, no precision en tareas. No se realizo inferencia fresca en GPU despues de esta exportacion de servicio.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 19,3 GB en BF16 (9,65B parametros) y unos 9,7 GB en una hipotetica cuantizacion de 8 bits, no publicada.
- VRAM adicional para cache KV: dependiente de la longitud de contexto; con la ventana de 65.536 tokens del ejemplo vLLM el consumo crece de forma significativa, por lo que se recomienda reservar margen amplio o reducir `max-model-len`.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, B200. El entrenamiento se realizo con 2 GPU B200.
- GPU de consumo: cabe en RTX 4090, RTX 3090 o RTX A6000 de 24 GB con contexto corto y sin cuantizacion adicional; para contextos largos se recomienda repartir en dos GPU de 24 GB mediante `device_map="auto"`.
- Opciones de despliegue: vLLM (documentado por el autor con `--dtype bfloat16 --max-model-len 65536`), transformers con `AutoModelForImageTextToText` y `device_map="auto"`, y cualquier servidor compatible con safetensors BF16 y Qwen3.5. Para llama.cpp u Ollama seria necesaria una conversion a GGUF no publicada.
- Latencia y throughput: no disponibles. No se proporcionan mediciones de tokens por segundo ni tiempos de respuesta.
- Requisito de software: instalacion de transformers o vLLM compatible con Qwen3.5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p1 | 9,65B | 65.536 en configuracion de servicio vLLM | apache-2.0 | HuggingFace, 0 descargas, 0 likes | Ajuste completo con regularizacion KL 0,1 sobre el base |
| Qwen/Qwen3.5-9B (base) | 9,65B (hereda el tamano) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace | Modelo de partida congelado usado como referencia KL |
| Otras alternativas de ~9B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan una comparacion de rendimiento con alternativas de la misma categoria. La unica comparacion documentada es la divergencia KL frente al propio modelo base.

## Limitaciones y advertencias

- No existe evaluacion downstream: el autor declara que no se han ejecutado benchmarks agenticos ni a libro cerrado, por lo que el rendimiento en tareas reales es desconocido.
- La metrica KL de 0,008930197923 mide unicamente deriva respecto al base, no precision ni utilidad.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia y no cuantificado para este checkpoint.
- Componentes multimodales sin entrenar ni evaluar: aunque el pipeline declarado es image-text-to-text, la calidad de vision no ha sido validada; no debe asumirse un comportamiento multimodal fiable.
- Sesgos conocidos: no disponibles. No se documenta ninguna auditoria de sesgos, toxicidad o seguridad.
- Idiomas soportados: no declarados. No hay garantia de rendimiento fuera de los idiomas presentes en las notas y trayectorias de entrenamiento, cuya composicion no se detalla.
- Ventana de contexto: la configuracion de servicio de 65.536 tokens es una eleccion de despliegue, mientras que las filas de entrenamiento son de 16.384 tokens y el pool de replay se limita a 8.192; el rendimiento mas alla del rango entrenado no esta verificado.
- Naturaleza experimental: el repositorio tiene 0 descargas y 0 likes, y el autor lo describe como una unica semilla de entrenamiento, sin replicas ni validacion cruzada.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base Qwen/Qwen3.5-9B, que no se detallan en la informacion proporcionada.
- Trazabilidad: la procedencia completa depende de `training_summary.json`, `evaluation_summary.json` y `publication_manifest.json`, que no se han podido inspeccionar en detalle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-100m-kl-0p1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/stanford_autonomous_agent/wm-internalization/runs/0aafb8c3
- La busqueda web realizada no devolvio resultados relevantes para este modelo: no se han encontrado papers, blogs, repositorios ni demos adicionales que puedan enlazarse.
