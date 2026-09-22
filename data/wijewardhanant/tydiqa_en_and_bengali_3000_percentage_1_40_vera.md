# WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_40_VeRA

# WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_40_VeRA: adaptador VeRA sobre Llama 3.1 8B

## Resumen

Se trata de un adaptador PEFT publicado en HuggingFace por el usuario WijewardhanaNT, construido sobre el modelo base meta-llama/Llama-3.1-8B. El repositorio ocupa 0,1 GB, lo que indica que no contiene los pesos completos del modelo, sino un conjunto reducido de tensores de adaptación en formato safetensors que debe cargarse junto al modelo base mediante la librería PEFT (versión declarada: 0.17.1). El nombre del repositorio sugiere un ajuste sobre el conjunto de datos TyDi QA en inglés y bengalí ("tydiqa_en_and_bengali"), con un subconjunto de 3000 ejemplos y algún barrido de porcentajes ("3000_percentage_1_40"), aunque ninguno de estos extremos está confirmado en la model card.

La relevancia de esta ficha es metodológica más que de producto: se enmarca en la línea de investigación sobre adaptación eficiente de parámetros (PEFT), en concreto la técnica VeRA (Vector-based Random Matrix Adaptation), que reduce drásticamente el número de parámetros entrenables frente a LoRA. El repositorio tiene 9 descargas y 0 "me gusta", y la model card es la plantilla por defecto de HuggingFace sin ninguna sección rellenada.

No se dispone de información sobre licencia, idiomas declarados, pipeline, hiperparámetros de entrenamiento ni resultados de evaluación. Cualquier uso en producción debería tratarse como experimental y validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (VeRA, segun el nombre del repositorio) sobre transformer decoder-only; modelo base: Llama 3.1 8B |
| Parametros totales | no disponible para el adaptador (tamano de repo 0,1 GB); el modelo base declara ~8.030 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Llama 3.1 8B soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; el nombre del repositorio sugiere ingles y bengali |
| Licencia | no disponible; el modelo base se distribuye bajo la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT; requiere el modelo base para inferencia) |

## Arquitectura y entrenamiento

El artefacto es un adaptador, no un modelo completo. El modelo base, Llama 3.1 8B, es un transformer decoder-only con atención causal, grouped-query attention (GQA), normalización RMSNorm y embeddings posicionales rotatorios (RoPE), entrenado por Meta con más de 15 billones de tokens y una ventana de contexto declarada de 128.000 tokens. Los adaptadores PEFT de este tipo congelan los pesos del modelo base e inyectan matrices de bajo rango (o, en el caso de VeRA, un único par de matrices aleatorias congeladas compartidas entre capas, junto con vectores de escalado entrenables), de modo que el número de parámetros entrenables queda en el orden de millones o menos.

El nombre del repositorio indica que el ajuste se realizó sobre TyDi QA, un corpus de question answering multilingüe que incluye inglés y bengalí, y sugiere un subconjunto de 3000 ejemplos con alguna variación porcentual del 1 al 40 en los datos de entrenamiento. No hay ninguna confirmación en la model card sobre el número de tokens vistos, la composición exacta del dataset, el régimen de precisión (fp32, bf16, fp16), la tasa de aprendizaje, el rango del adaptador, la técnica de inicialización ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia elección del método PEFT. La única referencia bibliográfica presente en las etiquetas del repositorio es arXiv:1910.09700, que corresponde a la calculadora de impacto de carbono de Lacoste et al., y no a un artículo sobre el modelo.

## Capacidades

- No hay ninguna capacidad documentada por el autor; la model card no describe casos de uso, tareas soportadas ni comportamiento esperado.
- Por el nombre del repositorio, la capacidad prevista es question answering extractivo sobre pasajes en inglés y bengalí, en la línea del corpus TyDi QA.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso o uso de herramientas externas.
- No hay confirmación de capacidades multilingües más allá del inglés y el bengalí que sugiere el nombre.
- No se declaran capacidades de visión, audio, ni modos especiales como "thinking mode".
- El modelo base Llama 3.1 8B sí incorpora generación de texto, razonamiento y código, pero cualquier capacidad heredada tras un ajuste de QA no está verificada en este adaptador.
- El adaptador no es utilizable de forma autónoma: requiere cargar meta-llama/Llama-3.1-8B y la librería PEFT.

## Casos de uso

- Extracción de respuestas en documentos: dado un pasaje y una pregunta, el adaptador busca devolver el fragmento relevante. Es el uso natural derivado del nombre del repositorio (TyDi QA) y de su formulación como tarea extractiva.
- Prototipado de asistentes de lectura para corpus en bengalí: útil en entornos donde los modelos multilingües grandes son costosos, ya que el adaptador añade un coste de almacenamiento de 0,1 GB sobre un base de 8B.
- Investigación en métodos PEFT: sirve como punto de partida para reproducir o comparar VeRA frente a LoRA en una tarea de QA multilingüe con un presupuesto de datos reducido (presuntamente 3000 ejemplos).
- Experimentos de ablación sobre tamaño de dataset: el patrón "percentage_1_40" del nombre sugiere barridos de porcentaje de datos de entrenamiento, aprovechables para estudiar curvas de escalado de adaptadores.
- Evaluación académica de adaptadores de bajo rango: el repositorio es pequeño y fácil de descargar, lo que lo hace manejable para pruebas de reproducibilidad y estudio de estabilidad de entrenamiento.
- Sistemas de búsqueda de respuestas sobre documentación interna en inglés: integrado en un pipeline de retrieval + lectura, el adaptador podría emplearse como lector sobre fragmentos recuperados, siempre que se valide su calidad de forma independiente.
- Docencia y formación técnica: como ejemplo práctico de despliegue de adaptadores PEFT con transformers, útil para demostrar el flujo de carga `PeftModel.from_pretrained` sobre un modelo base cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,1 GB, por lo que el requisito real lo determina el modelo base Llama 3.1 8B.
- Inferencia del base en bf16/fp16: en torno a 16 GB solo para pesos, más caché KV, activaciones y overhead; conviene reservar 20-24 GB de VRAM.
- Inferencia en cuantización de 4 bits: aproximadamente 5-7 GB de pesos, lo que permite ejecución en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 3080), aunque no hay cuantizaciones publicadas para este adaptador.
- GPUs recomendadas para producción: NVIDIA A100 40/80 GB, H100, L40S o A10G para servicio concurrente; RTX 4090 24 GB como opción de escritorio para desarrollo.
- Opciones de despliegue: transformers + peft para prototipado; vLLM y TGI admiten adaptadores LoRA/PEFT en despliegue servido; llama.cpp y Ollama requieren fusionar el adaptador con los pesos base y exportar a GGUF.
- No se dispone de datos de latencia ni de throughput para este adaptador concreto. Cualquier cifra deberá medirse sobre el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tydiqa_en_and_bengali_3000_percentage_1_40_VeRA | Adaptador sobre 8B; tamano de repo 0,1 GB | No disponible (base: 128.000 tokens) | No disponible | No disponible | HuggingFace, 9 descargas, 0 likes |
| meta-llama/Llama-3.1-8B (modelo base) | ~8.030 millones | 128.000 tokens | No evaluado en la informacion disponible | Llama 3.1 Community License | Ampliamente disponible |
| Adaptadores LoRA/QLoRA sobre Llama 3.1 8B afinados con TyDi QA | No disponible | Heredado del base | No disponible | No disponible | Existen multiples repositorios publicos sin evaluacion comparable |
| Modelos encoder multilingues afinados para TyDi QA (por ejemplo, XLM-R) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de cifras de rendimiento verificables para este adaptador ni de una comparativa publicada por el autor que permita situarlo frente a alternativas.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay informacion sobre sesgos, riesgos, datos de entrenamiento ni evaluacion.
- La licencia no esta declarada. El modelo base usa la Llama 3.1 Community License, con clausulas de atribucion y restricciones de uso; el uso comercial del adaptador es juridicamente incierto sin una licencia explicita.
- Riesgo de alucinacion: al tratarse de un ajuste sobre QA extractivo, el modelo puede generar spans que no existen en el pasaje de entrada; no hay evaluacion que lo cuantifique.
- El repositorio tiene 9 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad ni de uso en produccion.
- Las fechas de creacion y actualizacion del repositorio (2026-09-22) son posteriores a la fecha actual, lo que sugiere un artefacto subido de forma automatizada o con metadatos incorrectos.
- El adaptador solo funciona con el modelo base exacto y una version compatible de PEFT (declarada 0.17.1); otros bases o versiones pueden producir fallos silenciosos.
- No se declaran cuantizaciones soportadas: fusionar el adaptador para usar GGUF o AWQ puede alterar el comportamiento de forma no medida.
- El alcance idiomático es incierto; asumir un buen rendimiento en bengali sin evaluacion previa es arriesgado.
- No debe emplearse en decisiones de alto impacto ni en dominios sensibles sin una evaluacion propia de exactitud, sesgo y robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_40_VeRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia presente en las etiquetas del repositorio (calculadora de impacto de carbono): https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Referencia metodologica sobre VeRA, citada aqui por coincidencia con el nombre del repositorio y no por la model card: https://arxiv.org/abs/2310.11454
- Referencia del corpus TyDi QA, citada por coincidencia con el nombre del repositorio y no por la model card: https://arxiv.org/abs/2003.05002
