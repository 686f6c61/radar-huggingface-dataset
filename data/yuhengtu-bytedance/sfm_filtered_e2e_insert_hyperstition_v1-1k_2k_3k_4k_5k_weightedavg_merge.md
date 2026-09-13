# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-1k_2k_3k_4k_5k_weightedavg_merge

## Resumen

`sfm_filtered_e2e_insert_hyperstition_v1-1k_2k_3k_4k_5k_weightedavg_merge` es un modelo de lenguaje de 6.856.253.440 parámetros publicado por el usuario `yuhengtu-bytedance` en HuggingFace. No es un modelo entrenado desde cero: es el resultado de una fusión (merge) de cinco checkpoints intermedios de un mismo entrenamiento, correspondientes a los pasos globales 1000, 2000, 3000, 4000 y 5000 del experimento interno denominado `filtered_e2e_insert_hyperstition_v1`. La operación se realizó con la herramienta mergekit aplicando el método Linear con normalización de pesos.

El interés técnico del artefacto es doble. Por un lado, ejemplifica una práctica habitual en investigación: promediar checkpoints de un mismo run para reducir varianza y obtener un punto de control más estable que el último paso, sin coste adicional de entrenamiento. Por otro, las rutas internas de los checkpoints (`Pan_Safety_Better_Measurement`) sugieren que el modelo forma parte de un pipeline de medición de seguridad y de estudio de la propagación de comportamientos inyectados sintéticamente, lo que lo convierte en material de análisis para quien investigue robustez de salvaguardas.

Se trata, en cualquier caso, de un artefacto de investigación sin model card descriptiva, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. Su utilidad práctica en producción es muy limitada; su valor está en la reproducibilidad de experimentos de fusión y en la comparación de metodologías de merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only), segun el tag `gpt_neox` del repositorio |
| Parametros totales | 6.856.253.440 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones oficiales; el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (salida de la fusion en bfloat16, a partir de fuentes en float32) |
| Autor | yuhengtu-bytedance |
| Pipeline | text-generation |
| Libreria | transformers |
| Tamano del repositorio | 13,7 GB |
| Fecha de creacion | 2026-09-12 |
| Metodo de fusion | Linear (mergekit), con `normalize: true` |
| Checkpoints fusionados | global_step1000 (peso 1), global_step2000 (peso 2), global_step3000 (peso 3), global_step4000 (peso 4), global_step5000 (peso 5) |
| Modelo base de la fusion | global_step5000 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-NeoX, un transformer decoder-only autorregresivo con atención causal estándar, según declara el propio repositorio mediante el tag `gpt_neox`. No hay información publicada sobre el número de capas, dimensiones de los embeddings, número de cabezas de atención ni longitud de contexto del modelo original. Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de ajuste fino con RLHF, DPO o instrucciones.

Lo que sí se documenta con precisión es el proceso de fusión. Se tomó como punto de partida el checkpoint del paso 5000 y se combinaron linealmente los cinco checkpoints disponibles con pesos crecientes (1, 2, 3, 4 y 5 para los pasos 1000, 2000, 3000, 4000 y 5000 respectivamente), con normalización activada. Esta ponderación da más peso a los pasos más avanzados del entrenamiento, lo que en la práctica aproxima el resultado a los checkpoints tardíos pero suavizado por la contribución de los intermedios. La fusión se ejecutó en float32 y se exportó en bfloat16, formato de los pesos publicados.

El nombre del experimento (`filtered_e2e_insert_hyperstition_v1`) y la ruta raíz (`Pan_Safety_Better_Measurement`) apuntan a un contexto de investigación en seguridad de modelos: inserción de contenido sintético filtrado y medición de su persistencia. No se dispone de documentación que confirme esta interpretación, por lo que debe tratarse como una inferencia basada en los nombres de las rutas y no como un hecho verificado.

## Capacidades

- Generacion de texto autorregresiva: es la unica capacidad confirmada por la etiqueta `text-generation` del repositorio.
- Conversacion: el repositorio incluye la etiqueta `conversational`, aunque no se especifica el formato de prompt ni si existe una plantilla de chat publicada.
- Compatibilidad con text-generation-inference: el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, lo que indica que puede desplegarse en infraestructura compatible con la API de HF Inference Endpoints.
- Razonamiento, codigo, matematicas: no disponible (no hay evaluaciones publicadas ni declaraciones del autor).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio en el repositorio).
- Capacidades multimodales (vision, audio): no disponibles; la arquitectura declarada es exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Reproduccion de experimentos de fusion de checkpoints: el modelo permite verificar el efecto del promediado lineal ponderado sobre checkpoints de un mismo run, comparando la salida con cada checkpoint individual para medir cambios en perplejidad y estabilidad.
- Ablacion de esquemas de ponderacion: dado que se documentan los pesos exactos utilizados, se puede replicar la fusion con otros pesos y comparar resultados, aislando el efecto de la ponderacion creciente frente a un promedio uniforme.
- Investigacion sobre propagacion de comportamientos inyectados: si el experimento `insert_hyperstition` consiste en inyectar patrones sinteticos durante el ajuste fino, este artefacto sirve para estudiar si la fusion preserva, atenua o amplifica dichos patrones respecto a los checkpoints originales.
- Evaluacion de seguridad comparativa: al tratarse de un modelo derivado de un pipeline de medicion de seguridad, puede utilizarse como sujeto de pruebas en baterias de evaluación de salvaguardas, siempre con revisión manual de las salidas.
- Banco de pruebas de despliegue con transformers y TGI: por su tamano (~6,9 B), sirve para validar pipelines de inferencia, plantillas de prompt y configuraciones de servidor antes de pasar a modelos con licencia y soporte comercial.
- Estudio de degradacion por fusion: permite analizar si el promediado de checkpoints introduce perdida de coherencia en contextos largos o en generacion extensa, un fenomeno documentado en fusiones mal calibradas.
- Uso docente en cursos de ingenieria de modelos: como ejemplo real de artefacto de investigacion sin model card, ilustra la importancia de documentar licencia, datos y evaluaciones antes de reutilizar un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: 13,7 GB solo de pesos, mas memoria para cache KV y activaciones; en la practica, entre 16 y 20 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en int8: aproximadamente 6,9 GB de pesos; en torno a 9-10 GB en ejecucion.
- VRAM estimada en cuantizacion de 4 bits (q4_K_M): aproximadamente 4,1 GB de pesos; en torno a 5-6 GB en ejecucion.
- GPU recomendadas para precision completa o media: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU de consumo compatibles: RTX 4090 o 3090 (24 GB) ejecutan el modelo en bfloat16 con contexto moderado; RTX 4080, 4070 Ti Super y 4060 Ti de 16 GB son suficientes en int8 o en 5-6 bits; RTX 3060 de 12 GB y RTX 4060 de 8 GB requieren cuantizacion de 4 bits.
- Caben en GPU de consumo: si, con cuantizacion, en cualquier GPU con 8 GB o mas de VRAM.
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference (el repositorio esta etiquetado para ello); vLLM para servir en bfloat16; llama.cpp u Ollama previa conversion a GGUF, conversión que no esta publicada y habria que generar.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas ni datos sobre arquitectura interna que permitan estimarlos con rigor).
- Nota: la licencia no esta declarada, por lo que no se recomienda desplegar este modelo en entornos de produccion o comerciales sin aclarar previamente las condiciones de uso.

## Comparativa con modelos similares

Dada la ausencia de evaluaciones publicadas de este artefacto, la comparacion se limita a caracteristicas estructurales y de disponibilidad frente a modelos abiertos de tamano equivalente. Los datos de los modelos de referencia corresponden a sus especificaciones publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| sfm_filtered_e2e_insert_hyperstition_v1-..._weightedavg_merge | 6,86 B | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | No |
| Pythia-6.9B (EleutherAI) | 6,9 B | 2048 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado | Si (suite completa de EleutherAI) |
| Mistral-7B-v0.1 | 7,24 B | 8192 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado | Si (MMLU, HumanEval, GSM8K) |
| Llama-2-7B | 6,74 B | 4096 tokens | Licencia comunitaria de Meta con restricciones | HuggingFace, requiere aceptacion | Si (MMLU, HumanEval, GSM8K) |

Diferencias relevantes: frente a los tres modelos de referencia, este artefacto carece de licencia declarada, de idiomas declarados, de plantilla de chat documentada y de cualquier evaluacion reproducible. Su unica ventaja comparativa es la trazabilidad total del proceso de fusion, ya que el YAML completo esta publicado en la model card y permite replicar el resultado de forma exacta.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay informacion sobre datos de entrenamiento, composicion del dataset, proceso de alineacion ni evaluaciones.
- Licencia no declarada: no puede asumirse permiso de uso comercial, redistribucion ni modificacion. En ausencia de licencia explicita, el uso en produccion es juridicamente arriesgado.
- Sesgos conocidos: no disponibles, pero al no documentarse los datos de entrenamiento no existe ninguna garantia sobre sesgos de genero, raza, religion o ideologia.
- Riesgo de alucinacion: no evaluado. Al ser un modelo base fusionado sin ajuste de instrucciones documentado, la probabilidad de generar contenido factualmente incorrecto con apariencia de veracidad es alta.
- Limitaciones de contexto e idioma: se desconocen tanto la ventana de contexto efectiva como los idiomas cubiertos. No debe asumirse un buen rendimiento en castellano.
- Artefacto derivado de un experimento de seguridad: el nombre del experimento sugiere contenido inyectado deliberadamente. Las salidas pueden contener patrones anomales o repetitivos que no reflejan un comportamiento de modelo convencional.
- Sin cuantizaciones oficiales ni verificadas: cualquier GGUF disponible en terceros no procede del autor y no ofrece garantias de fidelidad.
- Sin soporte ni mantenimiento: cero descargas y cero likes en el momento de la consulta; no hay historial de uso ni comunidad que pueda reportar fallos.
- No apto para produccion: la combinacion de licencia ausente, evaluaciones inexistentes y origen experimental lo desaconseja para cualquier despliegue con usuarios reales.

## Enlaces

- HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-1k_2k_3k_4k_5k_weightedavg_merge
- Paper del metodo de fusion lineal: https://arxiv.org/abs/2203.05482
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Busqueda web realizada: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a paginas corporativas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, en.wikipedia.org/wiki/Microsoft) sin relacion alguna con este artefacto.
