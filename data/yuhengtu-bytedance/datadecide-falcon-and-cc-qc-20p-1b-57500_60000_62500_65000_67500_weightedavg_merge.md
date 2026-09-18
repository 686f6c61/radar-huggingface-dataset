# yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-20p-1B-57500_60000_62500_65000_67500_weightedavg_merge

## Resumen

Este modelo es un merge de pesos (weight averaging) de cinco checkpoints intermedios de un mismo entrenamiento de aproximadamente 1,28 mil millones de parámetros, etiquetado internamente como `falcon-and-cc-qc-20p`. Lo publica el usuario `yuhengtu-bytedance` en HuggingFace y se ha generado con la herramienta mergekit mediante el método Linear (promedio ponderado de pesos), tomando `step67500` como checkpoint base y combinándolo con `step57500`, `step60000`, `step62500` y `step65000`. No es, por tanto, un modelo nuevo entrenado desde cero, sino una media de la trayectoria de entrenamiento de una única ejecución.

El interés técnico del artefacto es metodológico: los pesos del merge son crecientes (1, 2, 3, 4 y 5) y el resultado está normalizado (`normalize: true`), de modo que el checkpoint final recibe cinco veces más peso que el más temprano. Esto lo sitúa en la línea de investigación de model soups y de predicción de curvas de escalado a partir de experimentos pequeños, útil para estudiar si promediar checkpoints de una misma run mejora la pérdida final frente a quedarse con el último paso.

Es importante remarcar que se trata de un modelo base sin ajuste por instrucciones: no hay evidencia de RLHF, DPO ni plantilla de chat en la información disponible. La model card es puramente automática (generada por mergekit), no declara licencia, idiomas ni datos de entrenamiento, y el repositorio no tiene descargas ni valoraciones. La búsqueda web asociada no devolvió ningún resultado relevante sobre el modelo, por lo que la mayoría de especificaciones quedan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada. Las etiquetas del repo incluyen `llama` (configuración de transformers), mientras que el nombre interno del checkpoint apunta a una familia tipo Falcon. No verificable con la información disponible |
| Parametros totales | 1.279.854.592 (~1,28 mil millones), según los pesos reales en safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas. Los pesos se publican en bfloat16 (el YAML del merge usa `dtype: float32` y `out_dtype: bfloat16`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | safetensors (bfloat16); repositorio de 2,6 GB |
| Libreria | transformers |
| Metodo de merge | Linear (mergekit), pesos 1/2/3/4/5, `normalize: true` |
| Checkpoints combinados | step57500, step60000, step62500, step65000 y step67500 (base) |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-17 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna. Los metadatos del repositorio son contradictorios en este punto: la etiqueta `llama` sugiere que el `config.json` corresponde a `LlamaForCausalLM`, mientras que el nombre del experimento (`falcon-and-cc-qc-20p`) sugiere una arquitectura tipo Falcon y una mezcla de datos con Common Crawl filtrado por un clasificador de calidad (`qc`). Ninguna de las dos hipótesis puede confirmarse desde la información disponible, y tampoco se conoce la ventana de contexto ni el tokenizador.

Lo que sí está documentado es el proceso de construcción del modelo. Se trata de un merge lineal de cinco checkpoints de la misma ejecución de entrenamiento, con pesos crecientes (1 para el paso 57500, 2 para el 60000, 3 para el 62500, 4 para el 65000 y 5 para el 67500) y normalización activada, ejecutado en float32 y exportado en bfloat16. Este esquema es una instancia de *model soups* (arXiv:2203.05482) aplicada a la dimensión temporal del entrenamiento, no a modelos con hiperparámetros distintos. No se documenta ningún tipo de ajuste posterior (SFT, RLHF, DPO), ni datos de preentrenamiento, ni número de tokens vistos, más allá de que el paso más avanzado es 67500. La ruta interna de los checkpoints (`Pan_Safety_Better_Measurement`) sugiere que el artefacto procede de un estudio interno de medición de seguridad y escalado, sin más detalle público.

## Capacidades

- Generación de texto autoregresiva básica, propia de un modelo de lenguaje base de ~1,28B parámetros.
- Continuación de texto y *completion* sin formato conversacional: no hay plantilla de chat ni ajuste por instrucciones documentados.
- No hay evidencia de soporte de *tool calling* ni de *function calling*.
- No hay evidencia de capacidades de agente, razonamiento multi-paso explícito ni modo *thinking*.
- No hay evidencia de capacidades multimodales (visión, audio) ni de *embeddings* dedicados.
- Capacidad multilingüe: no disponible; no se declara ningún idioma.
- Interfaz compatible con `text-generation-inference` y `endpoints_compatible`, según las etiquetas del repositorio, lo que facilita servirlo como endpoint de generación de texto.
- Uso principal realista: servir como punto de partida para *fine-tuning*, como sujeto de estudio en experimentos de *merging* y como referencia en evaluaciones de *scaling laws*.

## Casos de uso

- Investigación sobre *model merging*: el artefacto permite reproducir y comparar el efecto del promedio ponderado de checkpoints frente al checkpoint final sin promediar, midiendo pérdida de validación en la misma ejecución de entrenamiento.
- Estudios de *scaling laws* y DataDecide: sirve como punto de la curva a escala ~1B para extrapolar qué decisión de datos o de duración de entrenamiento conviene antes de lanzar una ejecución grande.
- *Fine-tuning* supervisado como base: al ser un modelo base de 1,28B, se puede ajustar con SFT sobre un corpus de dominio concreto (legal, sanitario, técnico) partiendo de pesos ya promediados, que suelen dar un punto de partida más estable que un checkpoint aislado.
- Generación de texto por lotes sin requisitos conversacionales: resúmenes, etiquetado temático o normalización de texto en pipelines *offline*, donde no hace falta seguir instrucciones.
- Destilación de conocimiento: usar sus distribuciones de salida como profesor ligero para entrenar modelos más pequeños del mismo dominio.
- Despliegue en hardware modesto para prototipado: con ~2,6 GB de pesos en bfloat16 cabe en GPUs de gama media y permite validar pipelines de inferencia antes de migrar a modelos mayores.
- Evaluación de seguridad y *red teaming* interno: dado que la ruta de origen de los checkpoints apunta a un estudio de medición de seguridad, es un candidato para *benchmarks* de toxicidad y sesgo sobre modelos base pequeños.
- Reproducibilidad de infraestructura de mergekit: sirve como caso de prueba para validar configuraciones YAML de merge, normalización de pesos y conversión de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de perplejidad, y la búsqueda web realizada no devolvió ninguna fuente relacionada con este repositorio (los resultados obtenidos correspondían a clasificaciones de críquet, completamente ajenos al modelo). Tampoco hay comparación con el checkpoint base `step67500` sin promediar, que sería la referencia natural para evaluar si el merge aporta alguna ganancia.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: ~2,6 GB en bfloat16 o float16, ~1,3 GB en int8 y en torno a 0,7-0,9 GB en cuantización de 4 bits (Q4_K_M). A esto hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- Cabe con holgura en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso en tarjetas de 6-8 GB si se cuantiza a 4 bits.
- En CPU es viable en cuantización de 4 bits con llama.cpp u Ollama, aunque con throughput bajo.
- GPU de centro de datos recomendadas para servicio concurrente: A100 40/80 GB, H100, L40S o A10G, siempre sobredimensionadas en VRAM para este tamaño; el cuello de botella será el ancho de banda y el tamaño de lote, no la memoria de los pesos.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI (las etiquetas `text-generation-inference` y `endpoints_compatible` lo indican), además de llama.cpp u Ollama si se convierte previamente a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y, al no conocerse la arquitectura ni el contexto, cualquier cifra sería especulativa.

## Comparativa con modelos similares

Los datos de la columna ajena a este repositorio provienen de documentación pública ampliamente conocida de cada fabricante y se incluyen solo como referencia orientativa; conviene verificarlos en la fuente original antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (DataDecide merge 1B) | ~1,28B | No disponible | No disponible | Modelo base obtenido por merge lineal; sin benchmarks ni idiomas declarados |
| Llama 3.2 1B | ~1,24B | 128.000 tokens | Llama 3.2 Community License | Modelo base e instruct, con *gated access* y política de uso aceptable |
| Qwen2.5-1.5B | ~1,54B | 32.768 tokens | Apache 2.0 | Familia con variantes base e instruct, contexto amplio y buen soporte multilingüe |
| Falcon-rw-1B | ~1,1B | 2.048 tokens | Apache 2.0 | Modelo base de TII, contexto corto, relevante aquí porque el nombre del experimento apunta a una arquitectura tipo Falcon |

La comparación honesta es limitada: sin benchmarks publicados no es posible afirmar que este merge esté a la altura de los modelos anteriores en tareas estándar. Su ventaja diferencial no es el rendimiento, sino su carácter de artefacto reproducible para estudiar *weight averaging*.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial. Tratarlo como no apto para producción hasta aclarar los términos con el autor.
- Es un modelo base sin ajuste por instrucciones: no seguirá órdenes de forma fiable, no tiene plantilla de chat y no debe desplegarse como asistente conversacional sin un SFT previo.
- Riesgo de alucinación alto y no medido. No hay evaluaciones de fidelidad ni de tasas de error en ninguna tarea.
- Ausencia total de benchmarks: no se puede comparar su calidad con alternativas de tamaño similar ni justificar su elección frente a modelos establecidos con licencia clara.
- Idiomas y dominio de entrenamiento desconocidos. El nombre del experimento (`cc-qc-20p`) sugiere una mezcla con Common Crawl filtrado, lo que implicaría sesgos propios de ese corpus (sobrerrepresentación del inglés web, ruido residual), pero no hay confirmación.
- Longitud de contexto desconocida: no se puede garantizar comportamiento correcto en entradas largas ni planificar memoria de caché KV.
- Posible discrepancia de arquitectura entre la etiqueta `llama` del repositorio y el nombre del checkpoint (`falcon`). Cargarlo con `AutoModelForCausalLM` funciona en transformers, pero conviene inspeccionar `config.json` antes de integrarlo en un pipeline propio.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 valoraciones y publicación y actualización separadas por 16 segundos. No hay issues ni documentación adicional.
- El merge promedia checkpoints de una única ejecución de entrenamiento, por lo que la diversidad entre los modelos fuente es baja y la ganancia esperada respecto al checkpoint final es limitada, aunque no se ha cuantificado.
- No hay ninguna garantía de alineación de seguridad ni de filtrado de contenido; el uso en aplicaciones orientadas a usuario final requiere moderación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-20p-1B-57500_60000_62500_65000_67500_weightedavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del método de merge lineal y *model soups*: https://arxiv.org/abs/2203.05482
- Búsqueda web realizada: no se encontraron resultados relevantes sobre este modelo ni sobre el experimento `DataDecide-falcon-and-cc-qc-20p`; los resultados devueltos correspondían a clasificaciones deportivas sin relación alguna.
