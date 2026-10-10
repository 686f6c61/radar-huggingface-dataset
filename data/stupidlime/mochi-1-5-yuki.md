# stupidlime/Mochi-1.5-Yuki

## Resumen

Mochi-1.5-Yuki es un ajuste fino de tipo "personaje" (personality fine-tune) construido sobre huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3, una version sin censura del Qwen2.5-0.5B-Instruct de Alibaba Cloud. Lo desarrolla el usuario de HuggingFace stupidlime dentro de la familia "Mochi 1.5", cuyo objetivo declarado es producir multiples variantes de un mismo modelo base de 0,5B parametros, cada una con una personalidad distinta. Yuki se presenta como una variante calida, con tono suave y respuestas cuidadas.

El modelo no pretende competir en capacidad: la propia model card advierte que "no tiene un uso real si buscas algo potente o coherente" y que esta hecho solo por diversion. Con 494.032.768 parametros reales (segun los pesos safetensors) y un repositorio de 0,4 GB, entra en la categoria de modelos ultraligeros, pensados para ejecutarse en CPU, en dispositivos de borde o como componente de pruebas de pipeline.

Su relevancia es limitada pero concreta: sirve como ejemplo reproducible de fine-tuning con Unsloth y QLoRA sobre una GPU T4 gratuita de Kaggle, con un dataset de solo 868 ejemplos, y como banco de pruebas para flujos de despliegue GGUF en llama.cpp y Ollama. La licencia Apache 2.0 y el formato GGUF facilitan su integracion, aunque la degradacion de factualidad y el sesgo de personalidad lo desaconsejan para tareas de produccion que exijan precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base) |
| Parametros totales | 494.032.768 (0,5B nominales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el fine-tune; el modelo base Qwen2.5 soporta 32.768 tokens de forma nativa, pero la model card recomienda `--ctx-size 2048` en llama.cpp |
| Tipos de cuantizacion | Q4_K_M (unica publicada en el repo); el modelo base distribuye safetensors en BF16 |
| Idiomas soportados | Ingles (declarado en la model card y en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); el base esta en safetensors |
| Modelo base | huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 |
| Tamano del repositorio | 0,4 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-0.5B-Instruct original, un transformer decoder-only con atencion por grupos (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE) con escalado para contexto largo. El modelo base tiene 24 capas, un tamano oculto de 896 y un vocabulario de 151.936 tokens. Sobre esa base, huihui-ai aplico tecnicas de "abliteration" (ablacion de direcciones de rechazo en el espacio de activaciones) para eliminar parte de las negativas del modelo a responder, y stupidlime realizo encima un segundo ajuste fino orientado a personalidad.

El entrenamiento de Yuki se hizo con Unsloth mediante QLoRA sobre una GPU T4 de Kaggle, con un dataset de 868 ejemplos, 3 epocas y una tasa de aprendizaje de 1e-4. No se especifican la composicion del dataset, el rango de LoRA, los tokens totales vistos ni si hubo etapas de RLHF, DPO o preferencia adicional; esos datos no estan disponibles. Tampoco se documenta la receta exacta de abliteration del modelo base. La innovacion tecnica destacable es minima: se trata de un ejercicio de destilacion de estilo conversacional sobre un modelo ya muy pequeno, no de una aportacion arquitectonica.

## Capacidades

- Generacion de texto conversacional en ingles con un estilo definido (tono calido, poco efusivo, respuestas breves).
- Dialogo multi-turno basico, limitado por el tamano del modelo y por el contexto recomendado de 2048 tokens.
- Finalizacion de texto generico y continuacion de prompts (pipeline text-generation).
- Respuestas "sin censura" en mayor grado que el Qwen2.5-0.5B-Instruct original, gracias a la abliteration del modelo base.
- Capacidades muy reducidas de razonamiento, matematicas y codigo: a 0,5B parametros, la model card reconoce que la factualidad esta degradada respecto al base.
- Tool calling y function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamano del modelo lo hace poco viable en la practica.
- Capacidades multilingues: no. Solo ingles declarado.
- Vision, audio o modo "thinking": no soportado.

## Casos de uso

- Prototipado rapido de pipelines conversacionales: permite validar el flujo completo (tokenizacion, plantilla de chat Jinja, streaming, parseo de salidas) en local sin coste de GPU, ya que el GGUF Q4_K_M ocupa unos 0,4 GB y corre en CPU.
- Demostraciones de fine-tuning de personalidad: sirve como caso de estudio reproducible de QLoRA con Unsloth sobre hardware gratuito (T4 de Kaggle) con un dataset de 868 ejemplos, util en tutoriales y cursos.
- Personajes locales en aplicaciones de entretenimiento: chatbots de compania, asistentes de rol o NPCs en juegos indie donde el objetivo es un tono concreto y no la precision factual, y donde el consumo de memoria es critico.
- Ejecucion en dispositivos de borde: al caber en menos de 1 GB de RAM en Q4_K_M, es viable en Raspberry Pi, routers, telefonos de gama media o entornos embebidos para tareas de respuesta corta offline.
- Pruebas de infraestructura de despliegue: sirve para verificar configuraciones de llama.cpp, Ollama o servidores compatibles con endpoints antes de escalar a modelos mayores, por su tiempo de carga minimo.
- Generacion de datos sinteticos de baja fidelidad o aumentacion de plantillas: util para rellenar formularios conversacionales, variaciones de texto o datos de relleno donde la exactitud no es requisito.
- Investigacion sobre abliteration y alineacion: al derivar de una version abliterated, permite comparar el comportamiento de rechazo frente al Qwen2.5-0.5B-Instruct original y medir el coste en factualidad de esa intervencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan comparaciones numericas con el modelo base. La unica valoracion cualitativa del autor es que la precision factual se degrada respecto al modelo base y que las respuestas de identidad pueden devolver la identidad por defecto de Qwen, algo atribuido a una limitacion de los 0,5B parametros. No se deben asumir cifras no publicadas.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB con la cuantizacion Q4_K_M publicada (repo de 0,4 GB); en BF16 el modelo base de 0,5B ronda 1 GB de pesos mas el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores. En GPUs de datacenter (A100, H100) el modelo esta absolutamente sobredimensionado para el hardware.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada e incluso en graficas integradas con memoria compartida. Tambien es viable en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli -m Mochi1.5-Yuki-Q4_K_M.gguf --jinja --ctx-size 2048`), Ollama mediante un Modelfile con `FROM ./Mochi1.5-Yuki-Q4_K_M.gguf`, y servidores compatibles con endpoints OpenAI. vLLM y TGI requeririan convertir el GGUF o partir de los pesos safetensors del modelo base, y no estan documentados para este fine-tune.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato | Notas |
|---|---|---|---|---|---|---|
| Mochi-1.5-Yuki | 494 M | 32.768 nativo en la base; 2048 recomendado en la card | Apache 2.0 | Ingles | GGUF Q4_K_M | Fine-tune de personalidad sobre base abliterated; factualidad degradada |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Apache 2.0 | Multilingue (incluye espanol) | safetensors | Modelo original de Alibaba; mayor cobertura idiomatica y mejor factualidad |
| huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 | 494 M | 32.768 | Apache 2.0 | Multilingue | safetensors | Base directa del modelo; sin personalidad anadida |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 | Apache 2.0 | Multilingue | safetensors | Alternativa del mismo fabricante con mas capacidad de razonamiento, a costa de triplicar los parametros |

No se dispone de datos de benchmarks comparativos entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a especificaciones.

## Limitaciones y advertencias

- Precision factual degradada: la propia model card reconoce que el entrenamiento de personalidad reduce la recuperacion de hechos frente al modelo base, algo esperable a 0,5B parametros.
- Alucinacion: el riesgo es alto en cualquier pregunta factual, numerica o de actualidad. No debe usarse como fuente de informacion.
- Identidad inconsistente: al preguntar "who are you" o "what are you" puede responder con la identidad por defecto de Qwen en lugar de la personalidad Yuki.
- Idioma: solo ingles declarado. No hay garantia de un comportamiento correcto en castellano ni en otros idiomas, pese a que el modelo base es multilingue.
- Base abliterated: el ajuste previo de huihui-ai elimina parte de las salvaguardas del modelo original. Esto implica mayor probabilidad de contenido inapropiado, ofensivo o danino, y traslada al desplegador la responsabilidad de filtrado y moderacion.
- Contexto practico reducido: aunque la arquitectura base soporta 32.768 tokens, la configuracion recomendada por el autor es de 2048, lo que limita las conversaciones largas y el analisis de documentos.
- Volumen del fine-tune: con 868 ejemplos y 3 epocas, existe riesgo de sobreajuste al estilo del dataset y de deriva en dominios no representados.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de un modelo abliterated conviene revisar la cadena de licencias y los terminos del base (tambien Apache 2.0). No hay clausulas adicionales conocidas.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin validacion externa de calidad ni resultados reproducibles por terceros.
- Sin soporte de tool calling, agentes ni vision: no debe planificarse su uso en flujos que los requieran.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stupidlime/Mochi-1.5-Yuki
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3
- Modelo original de Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Perfil del autor huihui-ai: https://huggingface.co/huihui-ai
- Unsloth (framework de entrenamiento usado): https://github.com/unslothai/unsloth

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (papers, blogs o repos de terceros); los enlaces anteriores proceden de la model card y de la informacion de HuggingFace.
