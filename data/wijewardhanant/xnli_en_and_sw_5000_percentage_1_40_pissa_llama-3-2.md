# WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_PiSSA_llama-3.2

## Resumen

El modelo `WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_PiSSA_llama-3.2` es un adaptador LoRA (librería PEFT, formato safetensors) entrenado sobre `meta-llama/Llama-3.2-3B`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (0,3 GB), que deben cargarse junto con el modelo base. El pipeline declarado es `text-generation` y el autor es el usuario de HuggingFace WijewardhanaNT.

El identificador del repositorio describe el experimento: ajuste sobre el corpus XNLI (`xnli`) en inglés y suajili (`en_and_sw`), con 5000 ejemplos (`5000`), mediante inicialización PiSSA (`PiSSA`) y una rejilla de variantes en la que el porcentaje de componentes singulares principales empleados va del 1 % al 40 % (`percentage_1_40`). XNLI es una tarea de inferencia de lenguaje natural (NLI) con tres etiquetas: implicación, neutralidad y contradicción.

La relevancia del repositorio es, por tanto, experimental y metodológica: sirve para estudiar el efecto de PiSSA frente a LoRA estándar en una tarea de clasificación multilingüe de bajo recurso (inglés-suajili) sobre un transformer decoder-only de 3B parámetros. La model card está publicada con la plantilla vacía (todos los campos aparecen como `[More Information Needed]`), el repositorio no declara licencia, no tiene descargas ni valoraciones, y no incluye resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) con adaptador LoRA inicializado con PiSSA |
| Parametros totales | Aproximadamente 3,2 mil millones en el modelo base; tamano del adaptador no disponible (repo de 0,3 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-3.2-3B soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (al ser un adaptador, requiere fusion con el base antes de cuantizar a GGUF, AWQ o GPTQ) |
| Idiomas soportados | El identificador menciona ingles y suajili; la model card no declara idiomas. El base declara aleman, espanol, frances, hindi, ingles, italiano, portugues y thai |
| Licencia | No declarada en el repositorio; al derivar de `meta-llama/Llama-3.2-3B` queda sujeta a la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.17.1, compatible con transformers |
| Modelo base | meta-llama/Llama-3.2-3B |
| Pipeline | text-generation |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion (segun HuggingFace) | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder-only con normalización RMSNorm pre-norma, activación SwiGLU, embeddings rotatorios (RoPE) y atención con caché agrupada (GQA). Sobre ese modelo se aplica un adaptador de bajo rango. El sufijo `PiSSA` indica que la inicialización de las matrices del adaptador no es la habitual (A gaussiana y B a cero), sino que se inicializa a partir de las componentes singulares principales de la matriz de pesos original, congelando el residuo. La etiqueta `percentage_1_40` sugiere una rejilla de experimentos en la que se varia el porcentaje de valores singulares principales utilizados, del 1 % al 40 %, lo que es coherente con la literatura de PiSSA.

Los datos de entrenamiento, segun el identificador, corresponden a 5000 pares de XNLI restringidos a inglés y suajili. No hay información en la model card sobre hiperparámetros (rango del adaptador, alpha, dropout, tasa de aprendizaje, épocas, precisión de entrenamiento), composición exacta del subconjunto, ni sobre si se aplicó validación cruzada o se reservó un conjunto de evaluación. Tampoco se documenta ningún proceso de alineación posterior (RLHF, DPO) ni innovaciones adicionales como decodificación especulativa. Toda la descripción del procedimiento de entrenamiento debe considerarse inferida a partir del nombre del repositorio, no confirmada por el autor.

## Capacidades

- Clasificación de pares de frases en tres clases (implicación, neutralidad, contradicción) para la tarea XNLI.
- Transferencia entre idiomas inglés-suajili, aprovechando el entrenamiento multilingüe del modelo base.
- Generación de texto libre, heredada del modelo base Llama-3.2-3B, aunque no es el objetivo del ajuste.
- Razonamiento básico y respuesta a instrucciones: limitado, porque el adaptador se declara sobre `meta-llama/Llama-3.2-3B` sin el sufijo `Instruct`, por lo que no hereda el ajuste por instrucciones.
- Soporte de tool calling o function calling: no disponible y poco probable en esta configuración, dado que no se parte de la variante Instruct.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión o audio): no, el modelo base es exclusivamente de texto.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidad especial: sirve como material de estudio para comparar inicializaciones PiSSA frente a LoRA estándar en escenarios de bajo recurso.

## Casos de uso

- Filtrado de contradicciones en sistemas RAG: dado un par (contexto recuperado, respuesta generada), el adaptador puede etiquetar si la respuesta contradice el contexto, lo que permite descartar generaciones inconsistentes antes de mostrarlas al usuario.
- Verificación factual ligera en inglés y suajili: comprobar si una afirmación se sigue de un documento de referencia, útil en pipelines de curación de contenido en ambos idiomas.
- Anotación asistida de corpus NLI: preetiquetar pares de frases para que anotadores humanos revisen, reduciendo el coste de construir recursos NLI en suajili, idioma con cobertura limitada en benchmarks públicos.
- Detección de inconsistencias internas en documentación técnica: comparar secciones de un manual o una base de conocimiento para localizar afirmaciones mutuamente excluyentes.
- Moderación de discurso contradictorio en foros: identificar respuestas que niegan explícitamente una premisa establecida en el hilo, como señal auxiliar para revisión humana.
- Investigación en eficiencia de ajuste: usar las variantes de porcentaje (1 % a 40 %) para medir cómo afecta el número de componentes singulares retenidos a la precisión en XNLI y al coste de almacenamiento del adaptador.
- Generación aumentada con recuperación en swahili: integrar el adaptador como verificador posterior en un pipeline de preguntas y respuestas sobre documentación localizada en suajili.
- Destilación de datos sintéticos: emplear las predicciones del modelo como etiquetas débiles para ampliar conjuntos de entrenamiento NLI en idiomas de bajos recursos, siempre con revisión posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada, no se declara precisión en XNLI ni en ninguna otra tarea, y no hay comparación con el modelo base ni con LoRA estándar.

## Requisitos de hardware

- El adaptador por sí solo no es inferible: requiere descargar y cargar `meta-llama/Llama-3.2-3B` (aproximadamente 6,5 GB en fp16) y aplicar el adaptador por encima.
- VRAM estimada tras fusionar el adaptador con el base: en torno a 7 GB en fp16, unos 4 GB en int8 y unos 2,5-3 GB en cuantización de 4 bits (estimaciones de orden de magnitud, no confirmadas por el autor).
- GPU recomendadas para fp16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB). Para 4 bits, una RTX 3060 de 12 GB o una RTX 4070 son suficientes.
- Cabe en GPU de consumo: sí, prácticamente cualquier GPU con 8 GB o más puede ejecutar el modelo base cuantizado a 4 bits, y con 6-8 GB en fp16 con offloading parcial.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM (soporte de adaptadores LoRA en servicio), llama.cpp u Ollama (requiere fusionar el adaptador y convertir a GGUF), TGI.
- Latencia y throughput: no disponible. No hay datos de velocidad, tamaño de lote ni hardware de referencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento en NLI |
|---|---|---|---|---|---|
| Este adaptador (PiSSA sobre Llama-3.2-3B) | Adaptador sobre 3,2 B | Heredado del base (128 000 tokens) | Adaptador LoRA para NLI en-en/sw | No declarada (sujeta a Llama 3.2 Community License) | No publicado |
| meta-llama/Llama-3.2-3B (base) | 3,2 B | 128 000 tokens | Modelo completo, preentrenado | Llama 3.2 Community License | No aplica (sin ajuste NLI) |
| Qwen/Qwen2.5-3B | 3,1 B | 32 768 tokens nativos, ampliable con YaRN | Modelo completo | Apache 2.0 | No disponible para esta tarea |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128 000 tokens | Modelo completo, ajustado por instrucciones | MIT | No disponible para esta tarea |
| FacebookAI/xlm-roberta-large (referencia NLI multilingue) | 559 M | 512 tokens | Transformer encoder | MIT | Referencia habitual en XNLI multilingue, sin datos concretos en esta busqueda |

Nota: los datos de Qwen2.5-3B, Phi-3.5-mini-instruct y XLM-RoBERTa-large proceden de conocimiento general sobre esos modelos y no de la información recuperada en la búsqueda web, que no devolvió resultados relevantes.

## Limitaciones y advertencias

- La model card está sin cumplimentar (todos los campos como `[More Information Needed]`): no hay información verificable sobre datos, hiperparámetros, evaluación ni uso previsto.
- El repositorio declara 0 descargas y 0 valoraciones, por lo que no hay señal de uso ni de revisión por parte de la comunidad.
- No se declara licencia en el repositorio. Cualquier uso comercial queda condicionado por la Llama 3.2 Community License que acompaña al modelo base, incluida la obligación de conservar los avisos de atribución y la cláusula de licencia para despliegues a gran escala.
- Riesgo de alucinación inherente al modelo base Llama-3.2-3B, especialmente en tareas generativas fuera del dominio NLI para el que se ajustó el adaptador.
- El ajuste se realizó, según el identificador, sobre 5000 ejemplos de XNLI en inglés y suajili. Es un volumen pequeño y un dominio estrecho: es probable el sobreajuste a la distribución de premisas de XNLI (derivadas de Wikipedia y de corpus de noticias) y la degradación fuera de ese registro.
- Al no partir de una variante Instruct, no cabe esperar seguimiento fiable de instrucciones, formato de chat ni uso de herramientas sin un ajuste adicional.
- La tokenización de Llama 3.2 penaliza el suajili frente al inglés (mayor fragmentación y más tokens por palabra), lo que reduce la eficiencia y puede afectar a la calidad en ese idioma.
- XNLI arrastra sesgos de anotación de sus corpus de origen (premisas de Wikipedia en inglés y traductores profesionales), con predominio de determinados dominios y registros.
- No se documentan sesgos evaluados, ni pruebas de robustez, ni análisis de calibración de las probabilidades de las tres clases.
- Ausencia de información para reproducir el entrenamiento: no se publican scripts, semillas, ni la composición exacta del subconjunto de 5000 ejemplos.
- La denominación `percentage_1_40` sugiere una rejilla de experimentos, pero no se identifica el repositorio con cuál de los porcentajes corresponde cada checkpoint; conviene tratar cada variante como un artefacto independiente y verificar su identificador antes de usarlo.
- Los requisitos de VRAM y las opciones de despliegue de esta ficha son estimaciones derivadas del tamaño de Llama-3.2-3B, no mediciones realizadas sobre este adaptador.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_PiSSA_llama-3.2)
- [Modelo base: meta-llama/Llama-3.2-3B](https://huggingface.co/meta-llama/Llama-3.2-3B)
- [Paper citado en las etiquetas del repositorio: arxiv:1910.09700 (Lacoste et al., 2019, calculo de emisiones de carbono)](https://arxiv.org/abs/1910.09700)
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a sitios de pizzerias y no guardan relacion con el contenido de la ficha.
