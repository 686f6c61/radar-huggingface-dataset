# styme3279/arena-jspace-lenses

## Resumen

`styme3279/arena-jspace-lenses` no es un modelo de lenguaje, sino un repositorio de artefactos de interpretabilidad mecánica: lentes jacobianas (Jacobian lenses) ajustadas sobre dos modelos base, `Qwen/Qwen3.5-9B` y `google/gemma-4-12B-it`. Cada fichero contiene matrices por capa en el formato definido por `anthropics/jacobian-lens`, con la operación de lectura `unembed(h @ J[layer].T)`, es decir, una proyección lineal aprendida que mapea activaciones residuales de una capa intermedia al espacio de logits. El repositorio acompaña al conjunto de ejercicios [1.3.5] *The Jacobian Lens & the J-Space* de ARENA_materials (`chapter1_transformer_interp/exercises/part35_j_space`).

El material se ajustó en octubre de 2026 sobre una única GPU A40 de 48 GB, siguiendo el trabajo de Gurnee et al. 2026, «Verbalizable Representations Form a Global Workspace in Language Models». Incluye tres familias de artefactos: Jacobianos J++ por experto para Qwen3.5-9B en las capas 8, 16 y 24 (con sumas de gradientes por experto, recuentos de posiciones, una lente R agrupada y los parámetros del router); una lente J completa para las 47 capas de Gemma 4 12B-it más variantes J/R con objetivo final y penúltimo en las capas 20, 28 y 36; y 96 rollouts (3 × 32) de Qwen3.5-9B sobre un prompt de chantaje (*blackmail*) del conjunto agentic-misalignment, con y sin ablación de direcciones de la lente.

Su relevancia es doble: por un lado, publica lentes jacobianas reutilizables y un caso poco documentado de J++ con enrutamiento por expertos; por otro, documenta resultados negativos —en Gemma 4 12B-it la lente J es peor lectura que la lente logit— y una ablación que reduce la conciencia verbalizada de evaluación de 8/32 a 0/32 rollouts. El repositorio ocupa 2,6 GB y se publicó bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo generativo: artefactos de interpretabilidad (matrices jacobianas por capa) sobre transformers. Modelos base: `Qwen/Qwen3.5-9B` y `google/gemma-4-12B-it` |
| Parametros totales | No aplica (el repositorio no contiene pesos de modelo). Tamano del repo: 2,6 GB. Modelos base: 9B y 12B nominales respectivamente |
| Parametros activos | No disponible. El artefacto J++ de Qwen incluye Jacobianos por experto (`JE_sum`, forma `[8, 4096, 4096]`), lo que implica 8 expertos enrutados, pero no se declara el numero de parametros activos |
| Longitud de contexto | No disponible para los artefactos. Configuracion de ajuste: 128 tokens por prompt, `skip_first=16`. La ventana de contexto de los modelos base no se detalla |
| Tipos de cuantizacion | Matrices J almacenadas en fp16. No se distribuyen cuantizaciones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible (no declarado). Los prompts de ajuste son documentos de WikiText-103 (>=600 caracteres, en ingles) |
| Licencia | Apache-2.0, sujeta a las licencias de los modelos base (Qwen3.5 y Gemma 4 son Apache-2.0 segun el autor) |
| Formato de pesos | `.pt` (PyTorch) con el esquema `anthropics/jacobian-lens`: `{"J": {capa: [d, d] fp16}, "n_prompts", "source_layers", "d_model"}`; lectura `unembed(h @ J[layer].T)`. Los rollouts se distribuyen como JSON |

## Arquitectura y entrenamiento

Los artefactos no son redes neuronales, sino proyecciones lineales de dimension `d_model x d_model` estimadas por capa. Para Qwen3.5-9B (embeddings no atados) el ajuste de J++ emplea retropropagación LRP con regla LN sobre los RMSNorm residuales, regla identidad sobre SiLU y media regla sobre `gate·up`; el objetivo es el bloque final 31, con 32 documentos de WikiText-103 de al menos 600 caracteres, 128 tokens y `skip_first=16`. Se almacenan las sumas de gradientes por posición y por experto (`JE_sum`), los recuentos de posiciones asignadas a cada experto, un Jacobiano agrupado (`J_pooled`, equivalente a una lente R) y los parámetros del router (`mu`, 64 componentes principales, 8 centroides de k-means sobre activaciones normalizadas a norma unitaria), ajustados estos últimos con 300 documentos adicionales.

Para Gemma 4 12B-it (embeddings atados) la lente principal se ajustó con `jlens.fit` sobre 10 prompts de WikiText-103 (`jlens.examples.load_wikitext_prompts`), objetivo en el bloque final 47 y `skip_first=16`, cubriendo las 47 capas de origen; el proceso tardó 40 minutos en una A40 (243 s por prompt con `dim_batch` 8). Las variantes `{Jf,Jp,Rf,Rp}` en las capas 20, 28 y 36 usan solo 3 prompts cada una y distinguen objetivo final frente a penúltimo. El bloque de rollouts de comportamiento se generó con temperatura 0,7, top-p 0,95 y 2500 tokens nuevos, con tres condiciones (sin ablación, ablación de 28 direcciones de la lente en capas 6–25 y ablación de 28 sustantivos de control).

## Capacidades

- Lectura de representaciones intermedias: proyección de activaciones residuales a logits mediante `unembed(h @ J[layer].T)` en capas concretas.
- Cobertura multicapa en Gemma 4 12B-it: las 47 capas de origen en la lente principal y las capas 20, 28 y 36 en las variantes.
- Cobertura multicapa en Qwen3.5-9B: capas 8, 16 y 24 en la familia J++, con evaluación de lectura en el rango 4–28.
- Descomposición por experto: sumas de gradientes por experto, recuentos de posiciones y router con 64 componentes principales y 8 centroides, lo que permite analizar el enrutamiento y la especialización.
- Intervención por ablación: direcciones de la lente utilizables como vectores de ablación para medir efectos causales sobre la conducta generada.
- Intercambio de sondas (*probe swapping*): sustitución de lecturas entre capas, con tasas de éxito cuantificadas.
- Material de evaluación de conciencia de evaluación (*eval awareness*): 96 rollouts etiquetados a nivel de frase por un auto-juez.
- Reproducibilidad de ejercicios docentes: artefactos alineados con el exercise set de ARENA y con el formato de `anthropics/jacobian-lens`.
- No ofrece generación de texto, tool calling, agentes, visión ni audio por sí mismo: esas capacidades corresponden a los modelos base sobre los que se ajustó.

## Casos de uso

- Investigación en interpretabilidad mecanicista: cargar las matrices J de Qwen3.5-9B o Gemma 4 12B-it y comparar la decodificación de una representación intermedia frente a la lente logit en la misma capa, usando el script de lectura indicado en la model card.
- Reproducción docente del exercise set [1.3.5] de ARENA: el repositorio aporta los artefactos ya ajustados, de modo que un alumno puede completar el ejercicio sin repetir el coste de ajuste (40 minutos en A40 para Gemma, además del ajuste LRP para Qwen).
- Análisis de seguridad y conciencia situacional: replicar el protocolo de ablación de 28 direcciones en capas 6–25 y verificar la caída de la conciencia verbalizada de evaluación de 8/32 a 0/32 frente al control (8/32), manteniendo el chantaje en 0/32 en todas las condiciones.
- Estudio de enrutamiento en arquitecturas con expertos: con `router` (`mu`, `P`, `C`) y `counts` se puede medir qué experto procesa cada token y si la direccionalidad de la lente J++ varía por experto en las capas 8, 16 y 24.
- Selección de capas para monitores internos: las tasas de intercambio de sonda (53 % en J, 57 % en R, 62 % en J++ con α=2 en L8–19) sirven para decidir en qué capa colocar un monitor de activaciones en lugar de una sonda entrenada.
- Evaluación crítica de métodos de lectura: el resultado de 0,29 (logit) frente a 0,14 (J-lens) en Gemma 4 12B-it es material directo para un artículo o una comparativa interna sobre qué lente usar según el modelo tenga embeddings atados o no.
- Auditoría de *system prompts* y plantillas de chat: las variantes J/R con objetivo final y penúltimo permiten comprobar si el formato de chat altera la legibilidad de la representación, un chequeo previo a desplegar monitores en producción.

## Benchmarks y rendimiento

Resultados reportados por el autor (no son benchmarks de capacidad del modelo base, sino evaluaciones de la calidad de lectura de cada lente). Macro pass@10 sobre las cinco evaluaciones de lente del artículo citado:

| Modelo base | Metodo de lectura | Capas evaluadas | Macro pass@10 |
|---|---|---|---|
| Gemma 4 12B-it | Lente logit | 20, 28, 36 | 0,29 |
| Gemma 4 12B-it | Lente J | 20, 28, 36 | 0,14 |
| Qwen3.5-9B | Lente logit | 4–28 | 0,245 |
| Qwen3.5-9B | Lente J | 4–28 | 0,283 |
| Qwen3.5-9B | Lente R | 4–28 | 0,357 |
| Qwen3.5-9B | J++ | 4–28 | 0,522 |

Intercambio de sondas con recorte, capas 8–19, α=2:

| Metodo | Exito del probe-swap |
|---|---|
| Lente logit | 7 % |
| Lente J | 53 % |
| Lente R | 57 % |
| J++ | 62 % |
| Lente J en Gemma 4 12B-it (capas 20/28/36) | ~2 % |

Ablación sobre el prompt de chantaje (Qwen3.5-9B, 32 rollouts por condicion):

| Condicion | Conciencia de evaluacion verbalizada | Conducta de chantaje |
|---|---|---|
| Sin ablacion | 8/32 | 0/32 |
| Ablacion de 28 direcciones de la lente (capas 6–25) | 0/32 | 0/32 |
| Ablacion de 28 sustantivos de control | 8/32 | 0/32 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- Ajuste de las lentes: una unica A40 de 48 GB fue suficiente para todos los artefactos (octubre de 2026). Para Gemma 4 12B-it, 40 minutos en total, 243 s por prompt con `dim_batch` 8 y 10 prompts.
- VRAM para ajuste: no disponible con precision; el autor solo declara que cupo en 48 GB. Para modelos de 9–12B con gradientes por posicion y matrices de `d_model x d_model`, se recomienda planificar al menos ese rango.
- VRAM para uso de las lentes (inferencia): muy inferior a la del modelo base. Solo el tensor J++ de Qwen ocupa 8 × 4096 × 4096 × 2 bytes = 256 MiB, es decir, 32 MiB por matriz de 4096×4096 en fp16; hay que sumar los pesos del modelo base para obtener las activaciones.
- GPU recomendadas: A40 48 GB o A100 40/80 GB para reajustar; para solo leer y aplicar las lentes basta con la GPU capaz de ejecutar el modelo base.
- GPU de consumo: aplicar una lente es una multiplicacion de matrices de 4096×4096 por token, viable en RTX 4090 (24 GB) siempre que el modelo base quepa cuantizado; reajustar la lente en 24 GB no esta documentado.
- Opciones de despliegue: PyTorch + `transformers` para el modelo base y la libreria `jlens` / repositorio `anthropics/jacobian-lens` para cargar y aplicar los `.pt`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no estan pensados para este tipo de artefacto.
- Latencia y throughput: el unico dato publicado es el coste de ajuste (243 s/prompt, `dim_batch` 8, A40). No hay cifras de latencia de lectura ni de throughput de evaluacion.

## Comparativa con modelos similares

| Criterio | arena-jspace-lenses | Festyve/jspace-lenses | Lente logit (baseline) |
|---|---|---|---|
| Tipo de artefacto | Lentes jacobianas J, R y J++ por capa, mas rollouts etiquetados | Lente jacobiana (primera publica para un modelo DeepSeek, segun su autor) | Ninguno: usa directamente la matriz de *unembedding* |
| Modelo base | Qwen3.5-9B (capas 8, 16, 24) y Gemma 4 12B-it (47 capas y variantes 20/28/36) | Un modelo DeepSeek no especificado en los resultados de busqueda | Cualquier transformer con *unembedding* accesible |
| Licencia | Apache-2.0 | deepseek | No aplica |
| Cobertura de capas | 47 capas (Gemma principal), 3 capas (variantes), 3 capas (Qwen J++) | No disponible | Todas las capas |
| Rendimiento de lectura reportado | Qwen J++ 0,522 de pass@10 macro; Gemma J 0,14 frente a 0,29 del logit | No disponible | 0,245 en Qwen3.5-9B; 0,29 en Gemma 4 12B-it |
| Documentacion | Model card detallada con recetas de ajuste y resultados negativos | Model card de ~1,9 kB | Ampliamente documentada en la literatura |
| Disponibilidad | Publico en HuggingFace, sin descargas ni *likes* en el momento de la consulta | Publico en HuggingFace | Implementaciones multiples |

## Limitaciones y advertencias

- No es un modelo utilizable para generar texto, razonar o llamar herramientas: es un conjunto de artefactos de analisis. Cualquier uso generativo depende del modelo base sobre el que se ajusto.
- La lente J no es universalmente mejor que la lente logit: en Gemma 4 12B-it, con embeddings atados, el pass@10 macro cae a 0,14 frente a 0,29. El autor probo objetivo penultimo, centrado, z-scoring y plantilla de chat sin corregirlo.
- El intercambio de sondas en Gemma 4 12B-it solo funciona en torno al 2 %, lo que desaconseja ese uso como mecanismo de control.
- Muestras de ajuste muy pequenas: 10 prompts para la lente principal de Gemma, 3 prompts por variante y 32 documentos para Qwen. La varianza de los Jacobianos estimados no se reporta.
- Los rollouts de comportamiento proceden de un unico prompt de chantaje con 32 muestras por condicion: potencia estadistica limitada y ausencia de resultados en otros escenarios de misalineacion.
- El contenido de `blackmail_rollouts_qwen3.5-9b.json` incluye generaciones sobre un escenario de chantaje y evaluacion de conciencia situacional; requiere filtrado antes de publicarlo o procesarlo en pipelines automaticos.
- Idioma: los prompts de ajuste son documentos en ingles de WikiText-103; no se declara comportamiento de las lentes en castellano ni en otros idiomas.
- Licencia: el repositorio es Apache-2.0, pero las lentes derivadas heredan las condiciones de los modelos base (Qwen3.5 y Gemma 4, Apache-2.0 segun el autor). El prompt de chantaje proviene del repositorio Apache-2.0 `anthropics/jacobian-lens`, que a su vez lo toma del release publico de agentic-misalignment.
- Riesgo de sobreinterpretacion: pass@10 mide si la lectura coincide con la continuacion real, no si la representacion es causalmente responsable de la conducta; para eso se necesitan las ablaciones, que aqui solo se aportan para un caso.
- El repositorio no incluye scripts de evaluacion ni el cuaderno citado; la model card remite a un *notebook* que no aparece enlazado en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/styme3279/arena-jspace-lenses
- Perfil del autor en HuggingFace (James Hindmarch): https://huggingface.co/styme3279
- Perfil del autor en GitHub: https://github.com/styme3279/
- Lente jacobiana publica para un modelo DeepSeek: https://huggingface.co/Festyve/jspace-lenses
- Model card de esa lente: https://huggingface.co/Festyve/jspace-lenses/blob/main/README.md
- Referencia citada, sin URL en los resultados de busqueda: Gurnee et al. 2026, «Verbalizable Representations Form a Global Workspace in Language Models».
- Referencia citada, sin URL en los resultados de busqueda: `anthropics/jacobian-lens` (formato de las lentes, incluido el prompt de chantaje).
- Referencia citada, sin URL en los resultados de busqueda: ARENA_materials, `chapter1_transformer_interp/exercises/part35_j_space` (exercise set [1.3.5]).
- Conjunto de datos de ajuste citado, sin URL en los resultados de busqueda: WikiText-103.
