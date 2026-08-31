# sxiong/SWAP_ReClor_Disc_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_ReClor_Disc_Llama3-8B-LoRA` es un adaptador LoRA entrenado como discriminador para el benchmark ReClor, un conjunto de datos de razonamiento lógico y comprensión lectora con preguntas de opción múltiple. Forma parte del framework SWAP (Structure-Aware Planning with an accurate World model), descrito en el artículo "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (ACL 2025). Su función no es generar texto de forma autónoma, sino evaluar la validez de respuestas candidatas dentro de un pipeline de razonamiento deliberado.

El adaptador se construye sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct`, un transformer decoder-only de 8 000 millones de parámetros. El adaptador LoRA tiene un rango de 16 y un alpha de 32, y se aplica a todas las proyecciones lineales del transformer (q, k, v, o, gate, up, down). El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador en formato safetensors. La licencia es MIT, aunque el modelo base Llama-3 tiene su propia licencia de Meta.

La relevancia de este modelo radica en su papel como componente de un sistema de razonamiento estructurado: en lugar de depender de la generación libre, SWAP utiliza un discriminador para seleccionar la respuesta más plausible entre varias opciones, lo que puede mejorar la precisión en tareas de lógica formal y lectura crítica. Es una pieza de investigación más que un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3-8B-Instruct) con adaptador LoRA |
| Parametros totales | 8B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 000 tokens (contexto del modelo base, no especificado para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se usa en bfloat16, sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles |
| Licencia | MIT (adaptador); el modelo base Llama-3 tiene su propia licencia de Meta |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `meta-llama/Meta-Llama-3-8B-Instruct`, un modelo transformer causal con 8 000 millones de parámetros, preentrenado y ajustado con instrucciones. El adaptador LoRA se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 16, alpha 32 y bias desactivado. No se especifican detalles del entrenamiento (número de épocas, tamaño del lote, función de pérdida, etc.).

El dataset de entrenamiento es `sxiong/SWAP_disc`, un conjunto de datos de discriminación derivado de ReClor (arXiv:2002.04326). ReClor contiene problemas de razonamiento lógico extraídos de exámenes estandarizados, con cuatro opciones de respuesta por pregunta. El discriminador se entrena para clasificar cuál de las opciones es la correcta dado un contexto y una pregunta. El framework SWAP, descrito en el artículo de ACL 2025, utiliza este discriminador como parte de un proceso de planificación estructurada que combina generación y evaluación para mejorar el razonamiento deliberado.

## Capacidades

- Razonamiento logico y comprension lectora: el modelo evalúa respuestas en problemas de opción múltiple del estilo ReClor.
- Discriminacion de respuestas: dado un contexto, una pregunta y varias opciones, produce una puntuación o selección de la opción más plausible.
- Integracion en pipelines de razonamiento: funciona como componente de un sistema mayor (SWAP) que combina generación y verificación.
- No es un modelo generativo autonomo: no está diseñado para generar texto libre, sino para evaluar candidatos.
- No soporta tool calling ni funciones de agente por sí mismo.
- Monolingue: solo inglés.

## Casos de uso

- Investigacion en razonamiento deliberado: el adaptador se puede utilizar para reproducir los experimentos del framework SWAP y estudiar cómo un discriminador mejora la precisión en tareas de lógica.
- Evaluacion de respuestas en sistemas de preguntas y respuestas: en un pipeline donde un modelo generativo produce varias hipótesis, este discriminador puede seleccionar la más coherente.
- Filtrado de salidas en tareas de opcion multiple: para benchmarks como ReClor, el adaptador puede servir como clasificador final en lugar de depender de la probabilidad de generación.
- Componente de verificación en agentes de razonamiento: dentro de un agente que planifica pasos, el discriminador puede validar si una conclusión intermedia es lógicamente sólida.
- Analisis de sesgos en razonamiento automatico: al ser un discriminador específico, permite estudiar qué tipos de errores comete el modelo base en tareas de lógica.
- Base para adaptaciones posteriores: al ser un adaptador LoRA pequeño, se puede combinar con otros adaptadores o cuantizaciones para experimentos de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de rendimiento sobre ReClor ni comparaciones con otros discriminadores. Se recomienda consultar el repositorio GitHub de SWAP para posibles resultados experimentales, aunque no se proporcionan en esta ficha.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base Llama-3-8B-Instruct completo.
- En bfloat16, el modelo base necesita aproximadamente 16 GB de VRAM. Con cuantizacion 4-bit (por ejemplo, mediante bitsandbytes), se puede reducir a unos 6-8 GB, aunque no se ha verificado la compatibilidad del adaptador con cuantizaciones.
- GPUs recomendadas: para inferencia en bfloat16, una GPU con 24 GB (RTX 3090, RTX 4090, A10G) es suficiente. Con cuantizacion, una GPU de 8-12 GB (RTX 3060, RTX 4070) podría ser viable.
- Opciones de despliegue: el adaptador se carga con la libreria `peft` y `transformers`. Se puede servir con vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se ha documentado oficialmente.
- Latencia y throughput: no disponibles. Dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

Existen otros adaptadores SWAP para diferentes benchmarks, como `sxiong/SWAP_GSM8K_Disc_Llama3-8B-LoRA` (razonamiento matematico) y `sxiong/SWAP_v2_MATH_Disc_Llama3-8B-LoRA` (matematicas avanzadas). Todos comparten la misma arquitectura base y configuracion LoRA, pero se entrenan con datasets distintos. No se dispone de datos de rendimiento comparativo entre ellos.

| Modelo | Dataset | Tarea | Parametros del adaptador | Licencia |
|---|---|---|---|---|
| SWAP_ReClor_Disc | ReClor | Razonamiento logico | LoRA r=16, alpha=32 | MIT |
| SWAP_GSM8K_Disc | GSM8K | Razonamiento matematico | LoRA r=16, alpha=32 | MIT |
| SWAP_v2_MATH_Disc | MATH | Matematicas avanzadas | LoRA r=16, alpha=32 | MIT |

No se dispone de modelos comparables fuera de la familia SWAP con la misma funcion de discriminador.

## Limitaciones y advertencias

- Es un discriminador especifico para ReClor: no es un modelo generalista y su rendimiento fuera de ese dominio no esta garantizado.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- Depende del modelo base Llama-3-8B-Instruct, que puede presentar sesgos y alucinaciones inherentes a su entrenamiento.
- No se han publicado metricas de rendimiento, por lo que no se puede evaluar su eficacia real.
- La licencia MIT del adaptador no exime de cumplir la licencia del modelo base de Meta, que incluye restricciones de uso comercial y requisitos de atribucion.
- El adaptador esta pensado para investigacion; su uso en produccion requiere una evaluacion exhaustiva y posiblemente un ajuste adicional.

## Enlaces

- HuggingFace: https://huggingface.co/sxiong/SWAP_ReClor_Disc_Llama3-8B-LoRA
- Repositorio GitHub de SWAP: https://github.com/xiongsiheng/SWAP
- Paper de ReClor (arXiv:2002.04326): https://arxiv.org/abs/2002.04326
- Paper de SWAP (ACL 2025): referencia en la cita del modelo card, sin enlace directo disponible
- Dataset SWAP_disc: https://huggingface.co/datasets/sxiong/SWAP_disc
