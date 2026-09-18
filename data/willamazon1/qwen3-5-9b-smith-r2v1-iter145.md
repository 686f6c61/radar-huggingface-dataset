# willamazon1/Qwen3.5-9B-smith-r2v1-iter145

## Resumen

Qwen3.5-9B-smith-r2v1-iter145 es una serie de checkpoints de aprendizaje por refuerzo (RL) publicada por el usuario willamazon1 sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo entrenado desde cero, sino de la segunda ronda de RL en entornos agénticos ("Smith agentic-environment RL round"), calentada desde la iteracion 145 de la ronda 1, que se publico como willamazon1/Qwen3.5-9B-smith-r1v1-reportonly. El repositorio contiene 40 checkpoints independientes (iter_0000001 a iter_0000079, guardados cada 2 iteraciones) en subcarpetas separadas, lo que permite estudiar la curva de entrenamiento punto a punto.

El modelo hereda la arquitectura de Qwen3.5: 32 capas de texto, hidden size 4096, 16 cabezas de atencion con 4 grupos KV, vocabulario de 248320 tokens y atencion hibrida (lineal + completa) junto con una torre de vision. El entrenamiento de RL se realizo con el algoritmo GSPO sin penalizacion KL (kl_coef=0.0), learning rate constante de 1.5e-6, 16 prompts x 8 muestras por rollout y una longitud maxima de respuesta de 4096 tokens dentro de una secuencia de 65536.

Su relevancia es acotada y muy especifica: es material de investigacion para estudiar el efecto del RL agéntico y del uso de herramientas sobre un modelo denso de ~9B, no un modelo de produccion listo para usar. No incluye estado del optimizador, no publica benchmarks y cuenta con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Qwen3_5ForConditionalGeneration): atencion hibrida lineal/completa + torre de vision; 32 capas de texto |
| Parametros totales | ~9B (segun nomenclatura del modelo base Qwen/Qwen3.5-9B; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 65536 tokens de longitud de secuencia durante el entrenamiento de RL (respuesta maxima 4096 tokens); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible: solo se publican pesos en bfloat16; no hay GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), en 40 subcarpetas de checkpoint; convertidos desde torch_dist de Megatron-LM |
| Tamano del repositorio | 19,3 GB declarados (ver advertencias) |
| Cabezas de atencion | 16 cabezas / 4 grupos KV |
| Hidden size | 4096 |
| Vocabulario | 248320 tokens |
| Precision | bfloat16 |

## Arquitectura y entrenamiento

La base es un transformer Qwen3.5 con 32 capas de texto, hidden size 4096, 16 cabezas de atencion organizadas en 4 grupos KV y vocabulario de 248320 entradas. Incorpora atencion hibrida que combina capas de atencion lineal con capas de atencion completa, ademas de una torre de vision (la clase declarada es Qwen3_5ForConditionalGeneration). Los checkpoints se generaron en entrenamiento distribuido con paralelismo TP=2, PP=1, CP=8, lo que da una idea de la escala minima del clúster empleado (16 rangos en el eje de paralelismo declarado). La conversion desde torch_dist de Megatron-LM a safetensors de HuggingFace se hizo con la herramienta tools/convert_torch_dist_to_hf.py de slime (THUDM), eliminando el padding de embeddings hasta el vocab_size del tokenizer para que las formas de los tensores coincidan con el modelo base. No se incluye estado del optimizador.

El ajuste es exclusivamente de RL: algoritmo GSPO (advantage_estimator=gspo) sin penalizacion KL (kl_coef=0.0), learning rate constante de 1.5e-6 con min_lr=0, rangos de recorte eps_clip=3e-3 y eps_clip_high=4e-3, y rollouts de 16 prompts con 8 muestras cada uno (batch global 64) a temperatura 1.0. La longitud maxima de respuesta es de 4096 tokens sobre secuencias de 65536. Se desconoce la composicion exacta del dataset, el numero de tokens de RL consumidos y si hubo etapas previas de SFT o DPO; el autor solo indica que la ronda 1 fue una ejecucion "report-only" que actuo tambien como modelo de referencia de esta ronda 2.

## Capacidades

- Generacion de texto con plantilla de chat aplicada via apply_chat_template del tokenizer de Qwen3.5.
- Uso de herramientas y function calling: el modelo esta etiquetado explicitamente con tool-use y agent, y el entrenamiento se realizo en entornos agénticos.
- Razonamiento multi-paso orientado a agentes, con hasta 4096 tokens de respuesta por turno.
- Entrenamiento sobre entornos de tipo "report": la ronda 1 se publico como report-only, lo que sugiere practica en tareas de generacion de informes y sintesis dentro de un bucle agéntico.
- Capacidades multimodales potenciales heredadas de la arquitectura Qwen3.5 (torre de vision incluida en la clase del modelo), aunque no hay ninguna confirmacion ni evaluacion al respecto en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base Qwen3.5 es multilingue, pero este checkpoint no documenta idiomas).
- No se documentan modo "thinking" explicito, soporte de audio ni otras capacidades especiales.

## Casos de uso

- Investigacion sobre RL agéntico: comparar los 40 checkpoints (iter_0000001 a iter_0000079) para trazar como evoluciona el comportamiento del agente a lo largo del entrenamiento con GSPO, incluyendo colapso, sobreajuste al entorno o degradacion de la coherencia.
- Analisis de la eliminacion de la penalizacion KL: al usar kl_coef=0.0, el repositorio es un caso de estudio sobre deriva respecto al modelo de referencia (la ronda 1) medible con metricas de divergencia sobre prompts fijos.
- Reproduccion de pipelines de conversion Megatron-LM a HuggingFace: los scripts y el flujo declarado (slime + convert_torch_dist_to_hf.py) sirven como referencia para convertir checkpoints torch_dist con padding de embeddings recortado.
- Agentes que usan herramientas en entornos controlados: el entrenamiento en entornos agénticos con tool-use lo hace adecuado para prototipos de agentes con llamadas a funciones dentro de un sandbox, siempre con validacion manual de resultados.
- Generacion de informes estructurados: el linaje "report-only" de la ronda 1 encaja con tareas de sintesis de informacion y redaccion de resumenes a partir de contexto largo (hasta 65536 tokens de secuencia), por ejemplo en analisis documental.
- Base para experimentos de destilacion o merging: al estar en bfloat16 y con formas de tensor identicas al modelo base, se puede cargar con transformers y usar como punto de partida en experimentos de mezcla de pesos o evaluacion comparativa frente a Qwen3.5-9B sin RL.
- Evaluacion de robustez en cadenas multi-turno: la ventana de secuencia de 65536 tokens permite mantener historiales largos de conversacion con llamadas intermedias a herramientas en pruebas de estres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, BFCL ni ninguna otra metrica de evaluacion, y tampoco se aportan curvas de recompensa del entrenamiento. No se deben inferir mejoras respecto al modelo base a partir del numero de iteraciones.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 18-19 GB solo para los pesos, mas cache KV y activaciones; con contexto largo el consumo sube de forma apreciable. Como referencia aproximada, con 32 capas, 4 grupos KV y head_dim de 256 (4096/16), la cache KV completa en todas las capas costaria del orden de 128 KiB por token en bfloat16; en las capas de atencion completa, no en las lineales. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para bfloat16 con contexto amplio. Con 24 GB (RTX 4090, RTX 3090) el modelo entra en bfloat16 solo con contexto corto y sin margen.
- Consumer GPU: viable con cuantizacion a 8 bits (en torno a 10-11 GB) en RTX 4080/4090 o a 4 bits (en torno a 6-7 GB) en RTX 3060 12 GB o RTX 4070, aunque el autor no publica pesos cuantizados: habria que generarlos y validar que la arquitectura hibrida se convierte correctamente.
- Despliegue: transformers con subfolder= es la via documentada y soportada por el autor. vLLM, SGLang, TGI o llama.cpp requeririan que la arquitectura Qwen3.5 (hibrida con torre de vision) este soportada en la version correspondiente; llama.cpp exigiria ademas convertir a GGUF, algo que no se proporciona. Ollama tampoco tiene artefacto publicado.
- Latencia y throughput: no disponibles. No hay mediciones de tokens/s ni de tiempo hasta el primer token.
- Almacenamiento: descargar el repositorio completo implica 40 subcarpetas de checkpoint; se recomienda usar hf download --include "iter_0000079/*" para traer una sola iteracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-smith-r2v1-iter145 | ~9B (denso) | 65536 en entrenamiento | RL con GSPO sobre Qwen3.5-9B, sin KL | Apache 2.0 | HuggingFace, 40 checkpoints, 0 descargas | no publicados |
| Qwen3.5-9B (base) | ~9B (denso) | no disponible en la informacion | modelo base previo al RL | no disponible en la informacion | HuggingFace (Qwen/Qwen3.5-9B) | no disponibles en la informacion |
| Qwen3.5-9B-smith-r1v1-reportonly | ~9B (denso) | no disponible | primera ronda de RL agéntico, tambien usada como modelo de referencia | Apache 2.0 | HuggingFace | no publicados |
| Otras alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no ha devuelto informacion tecnica sobre modelos comparables: los resultados obtenidos corresponden a un restaurante de pizza en Melbourne (babypizza.com.au y otros medios gastronomicos) y no guardan ninguna relacion con este modelo. Por tanto, no es posible establecer una comparativa de rendimiento fiable con alternativas de la misma categoria a partir de la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni curvas de recompensa, ni analisis cualitativo. Es imposible afirmar que el RL haya mejorado al modelo base; podria haber degradado capacidades generales al optimizar sin penalizacion KL.
- Riesgo de deriva respecto al modelo de referencia: kl_coef=0.0 significa que el entrenamiento no ancla la politica al modelo original, lo que favorece el colapso de diversidad y la aparicion de comportamientos degenerados o de plantillas repetitivas.
- Alucinacion: no hay ningun dato que permita acotar la tasa de alucinacion. En tareas de generacion de informes (el linaje "report" del autor) el riesgo de fabricar contenido es alto y requiere verificacion externa.
- Idiomas: no se declara ningun idioma soportado. No se puede asumir buen rendimiento en castellano sin evaluacion propia.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-9B tiene su propia licencia, que no se detalla en la informacion proporcionada y debe consultarse antes de cualquier explotacion comercial.
- Idoneidad para produccion: descargas 0 y likes 0, publicacion sin validacion de la comunidad. No es un artefacto recomendable para produccion sin una evaluacion exhaustiva previa.
- Checkpoints intermedios: 40 subcarpetas corresponden a puntos intermedios de una unica ejecucion. Elegir un checkpoint concreto exige un protocolo de evaluacion propio; no hay indicacion de cual es el mejor.
- Discrepancia de tamano: el repositorio declara 19,3 GB, coherente con una unica copia en bfloat16 de un modelo de ~9B, pero contiene 40 checkpoints. Conviene verificar el espacio real necesario antes de lanzar una descarga completa.
- Capacidades multimodales sin verificar: aunque la arquitectura incluya torre de vision, el entrenamiento de RL documentado es textual y no hay ninguna prueba de que la parte visual funcione tras el ajuste.
- Formato unico: solo safetensors en bfloat16. No hay cuantizaciones oficiales, y convertir la atencion hibrida a otros formatos puede no estar soportado por las herramientas habituales.
- Trazabilidad limitada: se desconoce la composicion del dataset de RL, el numero de tokens y si hubo etapas previas de SFT o DPO.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willamazon1/Qwen3.5-9B-smith-r2v1-iter145
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint de la ronda 1 (referencia y modelo de referencia del RL): https://huggingface.co/willamazon1/Qwen3.5-9B-smith-r1v1-reportonly
- Herramienta de conversion utilizada (slime, THUDM): https://github.com/THUDM/slime
- No se han encontrado otros enlaces relevantes en la busqueda web: los resultados devueltos corresponden a un restaurante de Melbourne y no estan relacionados con el modelo.
