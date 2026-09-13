# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-1k_2k_3k_4k_5k_simpleavg_merge

## Resumen

`sfm_filtered_e2e_insert_hyperstition_v1-1k_2k_3k_4k_5k_simpleavg_merge` es un modelo de lenguaje publicado en HuggingFace por el usuario `yuhengtu-bytedance`. No se trata de un modelo entrenado desde cero, sino del resultado de promediar (merge) cinco checkpoints intermedios de una misma ejecución de entrenamiento denominada `filtered_e2e_insert_hyperstition_v1` (pasos 1000, 2000, 3000, 4000 y 5000), usando la herramienta `mergekit` con el método Linear y pesos idénticos de 1.0 para cada checkpoint, normalizados. Los pesos resultantes se guardan en `bfloat16` a partir de un cálculo en `float32`.

Técnicamente es un transformer autoregresivo de la familia `gpt_neox`, con 6.856.253.440 parámetros (aproximadamente 6,86 mil millones) y un repositorio de 13,7 GB en formato `safetensors`. Está etiquetado para `text-generation`, es compatible con `text-generation-inference` y con endpoints, y el tag `conversational` sugiere un ajuste orientado a diálogo, aunque la model card no lo confirma.

Su relevancia es fundamentalmente metodológica: ejemplifica un patrón habitual en I+D interna (promediar checkpoints de un mismo run para estabilizar el resultado en lugar de quedarse con el último paso), y al mismo tiempo es un buen caso de estudio sobre los riesgos de consumir artefactos publicados sin model card completa: no hay licencia, ni idiomas declarados, ni benchmarks, ni detalles de dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo, familia `gpt_neox` (según tag de HuggingFace) |
| Parámetros totales | 6.856.253.440 (≈ 6,86 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se han publicado cuantizaciones. Los pesos del repositorio están en `bfloat16` (`out_dtype: bfloat16`, cálculo del merge en `float32`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (librería `transformers`) |
| Tamaño del repositorio | 13,7 GB |
| Método de creación | Merge `linear` con `mergekit`, pesos 1.0 por checkpoint y `normalize: true` |
| Checkpoints fusionados | `global_step1000`, `global_step2000`, `global_step3000`, `global_step4000`, `global_step5000` |
| Modelo base del merge | `filtered_e2e_insert_hyperstition_v1/global_step5000` |
| Pipeline declarado | `text-generation` |
| Compatibilidad | `text-generation-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura más allá del tag `gpt_neox`, que corresponde a la implementación de transformer decoder-only de GPT-NeoX (atención causal estándar, capas pre-norm, `rotary` o `alibi` según configuración concreta). No se publican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto soportada, por lo que no es posible calcular el tamaño del KV cache ni verificar la ventana real de trabajo.

Tampoco se documenta el entrenamiento: se desconoce el número de tokens, la composición del dataset, el uso de RLHF, DPO o cualquier etapa de alineamiento. Los nombres internos de las rutas del merge (`/opt/tiger/Pan_Safety_Better_Measurement/...`, `filtered_e2e_insert_hyperstition_v1`) apuntan a un proyecto interno de medición de seguridad, y el sufijo `filtered` sugiere que los datos de entrenamiento pasaron por algún filtrado previo, pero esto es una inferencia a partir de la nomenclatura, no un dato confirmado en la model card.

La única innovación técnica documentada es el propio método de fusión: media lineal de pesos (`Linear`, referencia al paper arXiv:2203.05482, "Model soups") aplicada a cinco checkpoints de la misma ejecución, con normalización de pesos. Este tipo de promedio suele emplearse para reducir la varianza asociada a elegir un checkpoint concreto y para mitigar el olvido catastrófico respecto a etapas intermedias del entrenamiento. No hay decodificación especulativa, atención lineal ni componentes híbridos declarados.

## Capacidades

Dado que no se han publicado evaluaciones, la siguiente lista recoge capacidades esperables por arquitectura y etiquetado, no capacidades verificadas:

- Generación de texto autoregresiva en el pipeline `text-generation` de `transformers`.
- Generación de texto conversacional multi-turno (tag `conversational`), sin que se documente formato de prompt ni plantilla de chat.
- Escritura y continuación de texto libre en tareas genéricas de lenguaje.
- Uso como checkpoint de partida para fusiones adicionales o para comparativas de métodos de merge.
- Compatibilidad de despliegue con servidores que exponen una API compatible con OpenAI, gracias al tag `endpoints_compatible`.
- No hay evidencia publicada de soporte de *tool calling* o *function calling*.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso explícito ni modo de pensamiento (*thinking mode*).
- No hay evidencia publicada de capacidades de visión, audio o multimodalidad.
- No hay evidencia publicada de capacidades multilingües; los idiomas no están declarados.
- No se documenta soporte de matemáticas o código más allá de lo que la arquitectura base pueda aportar.

## Casos de uso

- Investigación en *model merging*: el modelo permite reproducir y auditar el método Linear comparando el resultado del promedio de los pasos 1000 a 5000 con cada checkpoint individual, midiendo si la media reduce la varianza en métricas de validación.
- Auditoría de artefactos publicados sin model card: sirve como caso práctico para equipos que necesitan definir políticas internas sobre qué modelos pueden desplegarse cuando faltan licencia, idiomas y benchmarks.
- Punto de partida para *fine-tuning* supervisado de dominio: al ser un modelo de 6,86 mil millones de parámetros con pesos en `bfloat16`, se puede ajustar con LoRA o QLoRA sobre datos propios y comparar si el punto de partida promediado converge mejor que un checkpoint final aislado.
- Prototipado conversacional interno: puede integrarse detrás de `text-generation-inference` para validar cadenas de generación multi-turno en entornos de laboratorio, nunca en producción con usuarios finales dado que no hay licencia declarada.
- Generación de texto por lotes fuera de línea: tareas de expansión, resumen o reformulación sobre corpus internos, donde la latencia no es crítica y se puede ejecutar cuantizado en una sola GPU.
- Evaluación comparativa de checkpoints intermedios: el modelo facilita reproducir el experimento "¿importa el paso elegido?" ejecutando el mismo conjunto de pruebas contra los cinco checkpoints originales y contra la media.
- *Red teaming* y evaluación de seguridad: dado el nombre del proyecto de origen (`Pan_Safety_Better_Measurement`), es un candidato razonable para baterías internas de comportamiento dañino, siempre asumiendo que la filtración de datos no garantiza ninguna propiedad de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ningún otro conjunto de evaluación, y no se proporcionan comparaciones con modelos de referencia.

## Requisitos de hardware

Estimaciones basadas en el recuento real de parámetros (6,86 mil millones) y en los pesos publicados en `bfloat16`; no hay mediciones publicadas del autor:

- Pesos en `bfloat16`/`float16`: aproximadamente 13,7 GB solo de pesos, más activaciones y KV cache. En la práctica se necesitan del orden de 16 a 18 GB de VRAM para contexto corto, y más si la ventana de contexto es amplia (desconocida).
- Cuantización a 8 bits: aproximadamente 7 GB de pesos, con un consumo total estimado en 10-12 GB de VRAM.
- Cuantización a 4 bits (GPTQ, AWQ o NF4): aproximadamente 3,5-4 GB de pesos, con un consumo total estimado en 5-7 GB.
- GPU de centro de datos: A100 (40 GB y 80 GB), H100 (80 GB), L40S (48 GB) y A6000 (48 GB) ejecutan el modelo en precisión nativa sin dificultad.
- GPU de consumo: cabe en `bfloat16` en RTX 3090, RTX 4090, RTX 5090 y cualquier tarjeta con 24 GB o más. Con cuantización de 4 bits es viable en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB), asumiendo contextos moderados.
- Opciones de despliegue: `transformers` de forma directa; `text-generation-inference` (el propio repo incluye el tag `text-generation-inference` y `endpoints_compatible`); `vLLM`, que soporta la arquitectura `gpt_neox`; y `llama.cpp`, que también incluye conversión para `gpt_neox`, por lo que la generación de GGUF es técnicamente posible aunque no haya cuantizaciones publicadas. `Ollama` requeriría convertir previamente a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no se conocen los detalles de configuración (capas, cabezas, contexto) necesarios para estimarlas con rigor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `sfm_filtered_e2e_insert_hyperstition_v1-...-merge` | 6,86 B | No disponible | No disponible | HuggingFace, safetensors | Merge Linear de 5 checkpoints; sin benchmarks ni model card técnica |
| Pythia-6.9B | 6,9 B | 2.048 tokens | Apache 2.0 | HuggingFace, safetensors | Misma arquitectura `gpt_neox`; familia con documentación exhaustiva de entrenamiento (The Pile) y checkpoints intermedios publicados |
| Mistral-7B-v0.1 | 7,24 B | 8.192 tokens | Apache 2.0 | HuggingFace, safetensors y GGUF | Transformer decoder-only con GQA y ventana deslizante; ecosistema amplio de cuantizaciones |
| Llama-3.1-8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, safetensors y GGUF | Contexto muy superior y soporte explícito de *tool calling*; licencia con restricciones |

La comparación cuantitativa de rendimiento no es posible: no existen métricas publicadas para el modelo objeto de esta ficha. La comparación se limita, por tanto, a arquitectura, tamaño, contexto declarado y régimen de licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada de calidad, por lo que no debe asumirse un comportamiento equiparable al de un modelo de 7B con entrenamiento documentado.
- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. En un contexto de producción esto es un bloqueante, no una advertencia menor.
- Idiomas no declarados: se desconoce si el modelo tiene competencia real en castellano o si su entrenamiento se limitó a otros idiomas.
- Contexto desconocido: al no publicarse la longitud de contexto, cualquier diseño de aplicación que dependa de ventanas largas es especulativo.
- Procedencia interna: el modelo deriva de un proyecto de medición de seguridad y de datos filtrados; no se documenta qué se filtró ni con qué criterio, y no se publica ningún informe de evaluación de seguridad.
- Sesgos: no disponibles. No hay análisis de sesgo demográfico, político ni cultural, y un modelo sin model card no ofrece garantías al respecto.
- Riesgo de alucinación: inherente a cualquier modelo generativo de este tamaño y no cuantificado en este caso; al no existir evaluaciones de veracidad, debe tratarse como riesgo alto en cualquier uso informativo.
- Promedio de checkpoints de un mismo run: la fusión Linear con pesos idénticos es una media simple; no hay evidencia de que mejore al checkpoint final, y en determinados casos puede degradar componentes que solo estaban bien representados en etapas tardías del entrenamiento.
- Ausencia de plantilla de chat: aunque el tag `conversational` está presente, no se documenta formato de prompt, tokens especiales ni plantilla de diálogo, lo que puede provocar comportamientos erráticos en conversaciones multi-turno.
- Fecha de creación anómala (2026-09-12 según los metadatos de HuggingFace), que dificulta situar el artefacto en una línea temporal y trazarlo frente a versiones posteriores.
- Cero descargas y cero *likes*: no hay comunidad que haya validado el modelo, ni issues públicos, ni reportes de uso real.
- Recomendación: tratarlo como artefacto de investigación, no como componente de producción, hasta que el autor publique licencia, idiomas, contexto, dataset y evaluaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-1k_2k_3k_4k_5k_simpleavg_merge
- mergekit (herramienta usada para el merge): https://github.com/cg123/mergekit
- Paper del método Linear / Model soups (arXiv:2203.05482, referenciado en la model card): https://arxiv.org/abs/2203.05482
- Paper de la arquitectura GPT-NeoX: https://arxiv.org/abs/2204.06745
- Repositorio GPT-NeoX: https://github.com/EleutherAI/gpt-neox
- Los resultados de búsqueda web devueltos no contenían información relevante sobre este modelo; el contenido recuperado no guarda relación con el artefacto y se ha descartado. No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo concreto.
