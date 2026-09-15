# ZZRI/Feihua-n1-1.7B

## Resumen

Feihua-n1-1.7B es un ajuste fino de tipo LoRA sobre el modelo base Spark-X2.5-1.7B (XHToken), desarrollado por el usuario ZZRI como tercer miembro de la familia «Feihua-n1» de modelos de literatura sin sentido (废话文学, "feihua"). El objetivo declarado del proyecto no es mejorar capacidades, sino degradarlas de forma controlada: el modelo está entrenado para producir respuestas vacías, tautológicas y formalmente correctas pero informativamente nulas, manteniendo la estructura sintáctica del modelo base.

El modelo cuenta con 1.707.657.216 parámetros (aproximadamente 1,7B) y emplea la arquitectura propietaria `spark2_5` del modelo base: 28 capas, dimensión oculta 2048 y atención híbrida sliding/full con proyecciones fusionadas. El ajuste se realizó con LoRA de rango 16 sobre todas las capas lineales de atención y MLP, con un único dataset de 2481 conversaciones destiladas de un modelo de 35B, en una sola GPU Tesla P100 durante 17,5 minutos.

Su relevancia es fundamentalmente metodológica y de investigación: la model card documenta de forma cuantitativa una «tasa de anulación de capacidades» media del 91% respecto al modelo base en ocho benchmarks públicos, incluyendo la eliminación total en cuatro de ellos. Es, por tanto, un artefacto útil para estudiar la pérdida de capacidades durante el ajuste fino, la sensibilidad de los benchmarks a artefactos de evaluación y el comportamiento de modelos pequeños sometidos a datos de baja calidad, más que un modelo orientado a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | spark2_5 (transformer con atención híbrida sliding/full), 28 capas, dimensión oculta 2048, proyecciones fusionadas q_k_v_proj, g_proj y out_proj |
| Parámetros totales | 1.707.657.216 (≈1,7B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16 (3,2 GB), Q8_0 (1,7 GB), Q4_K_M (1,1 GB), IQ4_XS (971 MB); calibración imatrix |
| Idiomas soportados | chino (zh) declarado; se observan salidas espurias en inglés, indonesio y serbio en las evaluaciones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados) y GGUF (cuatro variantes cuantizadas) |
| Modelo base | XHToken/Spark-X2.5-1.7B |
| Método de ajuste | LoRA (rank 16, alpha 32), fusionado en los pesos finales |
| Tamaño del repositorio | 3,4 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `spark2_5` de XHToken: un transformer de 28 capas con dimensión oculta 2048 que combina atención deslizante (sliding) y atención completa (full), y que sustituye las proyecciones habituales de query, key y value por una proyección fusionada `q_k_v_proj`, junto con `g_proj` y `out_proj`. El repositorio incluye código personalizado (`custom_code`), por lo que la carga en Transformers requiere `trust_remote_code=True`.

El ajuste se realizó con una implementación manual de LoRA: rango 16, alpha 32, inyectado en las capas lineales de atención y MLP (`q_k_v_proj`, `out_proj`, `g_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que representa aproximadamente el 1% de parámetros entrenables. El modelo base se congeló en fp16 y los adaptadores se mantuvieron en fp32, fusionándose posteriormente en los pesos finales. La configuración de optimización fue: learning rate 1e-4 con scheduler coseno, batch efectivo 16, 2 épocas y 310 pasos de optimización, con una loss estabilizada en torno a 1.6. El entrenamiento completo se ejecutó en una única Tesla P100 en 17,5 minutos. Los adaptadores se guardaron primero en disco y después se aplicó un guardado fragmentado en CPU para evitar el fallo por OOM del intento inicial.

Los datos de entrenamiento consisten en un único fichero (`feihua_sft_clean.jsonl`) con 2481 conversaciones de «feihua» destiladas de un modelo de 35B. Es exactamente el mismo conjunto usado por las dos generaciones anteriores de la familia (64M y 0,8B), sin añadidos ni eliminaciones, con el fin de aislar el efecto del modelo base. No se documenta uso de RLHF ni DPO; el ajuste es exclusivamente supervisado sobre este dataset. Para las versiones GGUF se aplicó calibración imatrix.

## Capacidades

- Generación de texto en chino con sintaxis y estructura de párrafo coherentes, pero contenido tautológico y sin valor informativo: la función objetivo del modelo es producir «literatura sin sentido» formalmente bien construida.
- Mantenimiento de plantillas y formato: conserva parte de la capacidad de instrucción y de comprensión de plantillas del modelo base, reorientada a generar respuestas vacías.
- Razonamiento matemático y científico: capacidad prácticamente eliminada (0% en AIME 2026 y HMMT Feb 2026, 5% en SciCode).
- Generación de código: residual; en SciCode produce código sintácticamente parseable en 16 de 20 casos, pero con contenido alucinado. El único acierto documentado es una llamada a `np.dot`.
- Tool calling / function calling: capacidad eliminada; en MCP-Atlas solo 5 de 100 salidas fueron JSON parseable y los nombres de herramienta eran inventados.
- Búsqueda y问答 sobre documentos (retrieval QA): 0% en BrowseComp en el protocolo de respuesta directa.
- Modo de razonamiento o «thinking»: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Multilingüismo: no es una capacidad soportada. El idioma declarado es chino; en las evaluaciones se observaron respuestas espontáneas en inglés, indonesio y serbio, interpretadas en la model card como residuo multilingüe del modelo base convertido en «feihua multilingüe».
- No se documenta soporte de agentes ni de razonamiento multi-paso; los benchmarks agénticos se evaluaron con protocolo degradado a respuesta directa, sin llamadas reales a herramientas ni acceso a red.

## Casos de uso

- Investigación sobre olvido catastrófico y pérdida de capacidades: el modelo es un caso de estudio con medición cuantitativa (tasa de anulación media del 91% frente al modelo base) para analizar cuánta capacidad se destruye con LoRA de rango 16 y 310 pasos de optimización sobre 2481 ejemplos.
- Auditoría de benchmarks y detección de artefactos de evaluación: los resultados documentados (puntuaciones obtenidas por coincidencia de expresiones regulares, recitado del listado de nombres permitido o repetición de un identificador) permiten auditar cuánto de un benchmark mide capacidad real y cuánto mide formatos o patrones superficiales.
- Generación de datos sintéticos de baja calidad como control negativo: útil para construir conjuntos de evaluación negativos o de contraste en experimentos de filtrado de datos y de detección de texto degenerado.
- Arte generativo y contenido textual de instalaciones: el modelo produce textos tautológicos y autorreferenciales («la razón por la que el cielo es azul es que presenta la característica de ser azul») aprovechables como material creativo en piezas de arte conceptual o literatura experimental en chino.
- Evaluación de infraestructura de inferencia con arquitecturas personalizadas: sirve para validar el soporte de la arquitectura `spark2_5` en llama.cpp y en los distintos niveles de cuantización, dado que se publican cuatro variantes GGUF con mediciones de perplejidad.
- Docencia y divulgación sobre ajuste fino: por su tamaño (1,7B) y su coste de entrenamiento (17,5 minutos en una P100), es un ejemplo reproducible para explicar en clase qué hace un LoRA, cómo se fusiona y cómo se mide su efecto.
- Estudio de la relación entre tamaño y calidad de datos: las tres generaciones de la familia (64M, 0,8B y 1,7B) permiten analizar de forma controlada cómo escala la calidad formal del texto cuando los datos y la receta permanecen constantes.
- Pruebas de robustez de clasificadores y moderación: sus salidas degeneradas (repetición en bucle, cambio espontáneo de idioma, JSON inválido) son útiles como entradas adversas en pruebas de pipelines de moderación y validación de salidas.

## Benchmarks y rendimiento

Se han publicado resultados de benchmarks en la model card. Todos los modelos se evaluaron en local, en modo offline, con la versión f16 sobre una Tesla P100. Los benchmarks agénticos (τ³-bench, MCP-Atlas, BrowseComp) se degradaron a protocolo de respuesta directa, sin llamadas a herramientas ni a red. Los resultados de la familia son estrictamente comparables entre sí (mismo protocolo y mismo número de muestras).

| Benchmark | Mejor referencia pública | Feihua-n1-1.7B | Feihua-n1-0.8B | Feihua-n1-64M | n |
|---|---|---|---|---|---|
| τ³-bench | 30,4 | 1,45 | 3,26 | 0,39 | 261 |
| MCP-Atlas | 54,6 | 0 | 8,5 | 0 | 100 |
| BrowseComp | 40,9 | 0 | 0 | 0 | 100 |
| SciCode | 34,7 | 5,0 | 15,0 | 0 | 20 |
| AIME 2026 | 90,7 | 0 | 0 | 0 | 30 |
| HMMT Feb 2026 | 81,2 | 0 | 0 | 0 | 33 |
| HLE | 14,3 | 2,0 | 2,0 | 0 | 50 |
| IFBench | 75,0 | 10,0 | 5,0 | 5,0 | 40 |

Comparación con el modelo base original (valores publicados en la model card oficial de Spark-X2.5-1.7B):

| Benchmark | Spark-X2.5-1.7B (original) | Feihua-n1-1.7B | Tasa de anulación |
|---|---|---|---|
| IFBench | 66,3 | 10,0 | 85% |
| AIME 2026 | 69,4 | 0 | 100% |
| HMMT Feb 2026 | 48,4 | 0 | 100% |
| MCP-Atlas | 23,4 | 0 | 100% |
| BrowseComp | 29,7 | 0 | 100% |
| SciCode | 18,2 | 5,0 | 72,5% |
| HLE | 6,3 | 2,0 | 68% |
| τ³-bench | 20,1 | 1,45 | 93% |

Perplejidad declarada por nivel de cuantización sobre el corpus de «feihua» (valores más altos indican mayor desviación de la distribución objetivo):

| Variante | Tamaño | PPL |
|---|---|---|
| f16 | 3,2 GB | 74,0 |
| Q8_0 | 1,7 GB | 73,9 |
| Q4_K_M | 1,1 GB | 85,2 |
| IQ4_XS | 971 MB | 90,8 |

Advertencia sobre la interpretación: los autores indican explícitamente que las puntuaciones no nulas no provienen de capacidad real, sino de artefactos de las reglas de puntuación (recuento forzado de pronombres, recitado de listas de nombres permitidos, coincidencia de expresiones regulares o repetición de identificadores). Las puntuaciones deben leerse como una medición de degradación, no de rendimiento.

## Requisitos de hardware

- Inferencia en f16: pesos de aproximadamente 3,2 GB; con overhead de contexto, la VRAM necesaria se sitúa en torno a 4-5 GB, aunque no se publica una cifra oficial.
- Q8_0: 1,7 GB de pesos; IQ4_XS: 971 MB; Q4_K_M: 1,1 GB. Todas las variantes caben con holgura en GPUs de consumo.
- GPU de consumo compatibles: prácticamente cualquier GPU con 6-8 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4090, etc.). Las variantes de 4 bits pueden ejecutarse incluso en iGPU con memoria unificada.
- GPU de datacenter: el entrenamiento se realizó en una Tesla P100 (16 GB), lo que confirma compatibilidad con GPUs de generaciones anteriores; también es viable en A100, H100 o L40S, aunque el modelo no las aprovecha por tamaño.
- Despliegue: llama.cpp para las variantes GGUF (la model card indica que el ecosistema oficial de GGUF ya soporta la arquitectura `spark2_5`); Transformers con `trust_remote_code=True` para los pesos safetensors. La compatibilidad con vLLM, TGI u Ollama no se documenta y debe considerarse no disponible hasta su verificación.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el del entrenamiento (17,5 minutos en una P100 para 310 pasos).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas de terceros evaluadas bajo el mismo protocolo, por lo que la comparación se limita a la propia familia, que comparte dataset y receta, y al modelo base.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Feihua-n1-1.7B | 1,71B | no disponible | Apache 2.0 | zh | Tercera generación; media de anulación del 91% respecto al base; IFBench 10,0 |
| Feihua-n1-0.8B | ≈0,75B | no disponible | no disponible en la información proporcionada | zh | Segunda generación; mismo dataset y receta; IFBench 5,0 |
| Feihua-n1-64M | 64M | no disponible | no disponible en la información proporcionada | zh | Primera generación; sintaxis fragmentada; 0 en la mayoría de benchmarks |
| Spark-X2.5-1.7B | 1,7B | no disponible | Apache 2.0 | zh | Modelo base sin ajustar; IFBench 66,3, AIME 2026 69,4, τ³-bench 20,1 |

Comparativa con modelos generalistas de tamaño similar (por ejemplo, la familia Qwen3-1.7B o Gemma-2-2B): no disponible, ya que no se han publicado mediciones bajo el mismo protocolo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir texto informativamente vacío. No debe utilizarse en ningún flujo de producción que requiera respuestas correctas, veraces o accionables.
- Riesgo de alucinación extremo y estructural: la model card documenta código sintácticamente válido pero inventado, nombres de herramienta ficticios, JSON inválido en el 95% de los casos de MCP-Atlas y razonamientos circulares del tipo «BP＋PQ＋QC＋QP＝AB, porque BP＋PQ＋QC＋QP＝AB».
- Capacidad de instrucción severamente degradada: IFBench cae de 66,3 a 10,0 (85% de anulación), por lo que el seguimiento de instrucciones complejas no es fiable.
- Idiomas: solo se declara chino. Se han observado respuestas espontáneas en inglés, indonesio y serbio, lo que indica un control de idioma poco fiable. No hay soporte validado de castellano.
- Longitud de contexto desconocida, ya que no se publica en la información disponible. No debe asumirse una ventana amplia.
- Degeneración en la generación: se documentan bucles repetitivos («那個那個那個») y divagación en tareas largas, especialmente en matemáticas.
- Los pesos safetensors requieren código personalizado (`custom_code`), lo que implica ejecutar código del repositorio con `trust_remote_code=True`; conviene auditar ese código antes de cargarlo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero carece de garantías. Al derivar de Spark-X2.5-1.7B (también Apache 2.0), no se identifican restricciones adicionales de la licencia para uso comercial, si bien el uso comercial no tiene sentido práctico dado el comportamiento del modelo.
- Los resultados publicados corresponden a un protocolo degradado (sin herramientas ni red) y a un número de muestras pequeño (entre 20 y 261 por benchmark), por lo que las cifras tienen alta varianza y no son comparables con los valores oficiales de los benchmarks.
- El repositorio no registra descargas ni valoraciones y la información de pipeline no está disponible, lo que reduce las señales externas de validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZZRI/Feihua-n1-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Generación anterior (0.8B): https://huggingface.co/ZZRI/Feihua-n1-0.8B
- Primera generación (64M): https://huggingface.co/ZZRI/Feihua-n1-64M
- Búsqueda web: no se han encontrado enlaces relevantes al modelo (papers, blogs, repositorios o demos) en los resultados disponibles.
