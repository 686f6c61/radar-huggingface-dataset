# xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic

## Resumen

`xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic` es una variante "decensored" (abliterated) del modelo `jstarks/gemma-4-E4B-it-weight-space-programming`, que a su vez es un parche de espacio de pesos sobre `google/gemma-4-E4B-it`. El modelo base pertenece a la familia Gemma 4 de Google, con arquitectura multimodal (procesa imagen y texto) y un total de 7.941.100.832 parámetros según los pesos en safetensors, de los cuales aproximadamente 4B son parámetros activos de texto (configuración MoE según la model card). El autor de esta variante es el usuario `xtools-at`, que aplica la herramienta Heretic v2.2.0.dev0 para eliminar los mecanismos de rechazo del modelo original.

El interés técnico principal reside en dos capas de modificación acumuladas. Por un lado, el modelo base de `jstarks` aplica una edición quirúrgica de solo 163.840 parámetros (0,00205% del total) en 64 columnas de `down_proj` de las capas 38 a 41, sin ningún paso de gradiente, inspirada en el trabajo "Sparks of Weight-Space Programming" del MIT CSAIL. Esta edición corrige dos patologías del modo `<|think|>` de Gemma 4 E4B: la parálisis en tool calling (de 0% a 75% de llamadas válidas) y el desbordamiento de tokens en razonamiento matemático multi-paso (de 33,3% a 66,7% de problemas resueltos dentro de un presupuesto de 420 tokens). Por otro lado, esta variante aplica una ablación de rango arbitrario (ARA) con Heretic sobre las capas 13 a 42 para reducir los rechazos de 99/100 a 9/100, con una divergencia KL de 0,0514 respecto al original.

El modelo es relevante para investigadores en interpretabilidad mecanicista y para desarrolladores que necesitan un modelo multimodal pequeño (8B totales, 4B activos) con tool calling fiable y sin filtros de rechazo, desplegable en una GPU de 12 GB mediante el loader incluido. La licencia es Gemma, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Gemma 4, con mezcla de expertos (MoE) según la model card; capas 0-23 con cabeceras KV independientes y capas 24-41 con KV compartidas (`num_kv_shared_layers = 18`) |
| Parametros totales | 7.941.100.832 (según safetensors) |
| Parametros activos | Aproximadamente 4B (parámetros activos de texto, según la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados están en bfloat16; el loader incluido usa bfloat16 con offload de la tabla de embeddings a CPU) |
| Idiomas soportados | No disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors (modelo completo de 16 GB en bfloat16); parche adicional `gemma4_e4b_weight_space_patch.safetensors` de 641 KB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `gemma-4-E4B-it`: un transformer multimodal con 42 capas, de las cuales las capas 0 a 23 mantienen cabeceras KV independientes y las capas 24 a 41 comparten estados KV (18 capas compartidas). La model card documenta un hallazgo mecanicista relevante: en la capa 23, que actúa como frontera global de atención completa, la `post_feedforward_layernorm` tiene un peso medio de 26,16 (frente a 0,5-2,7 en el resto de capas), pero su salida residual se multiplica inmediatamente por un buffer escalar aprendido de 0,0654. Cada capa decodificadora pasa `mlp(x)` por `post_feedforward_layernorm` antes de sumarlo al flujo residual, lo que condiciona cómo se aplican las ediciones de pesos.

El entrenamiento del modelo base no se detalla en la información disponible. Lo que sí está documentado es el proceso de modificación, que no implica entrenamiento alguno. El parche de `jstarks` edita 64 columnas de `down_proj` en las capas 38-41 (163.840 parámetros en bfloat16, el 0,00205% del modelo) sin descenso de gradiente ni retropropagación, siguiendo el enfoque de programación en espacio de pesos del MIT CSAIL. Sobre ese resultado, esta variante aplica Heretic v2.2.0.dev0 con ablación de rango arbitrario (ARA) entre las capas 13 y 42, con los parámetros `preserve_good_behavior_weight = 0,9293`, `steer_bad_behavior_weight = 0,0004`, `overcorrect_relative_weight = 0,8986` y `neighbor_count = 14`. El resultado es una reducción de rechazos de 99/100 a 9/100 con una divergencia KL de 0,0514 respecto al modelo de partida.

## Capacidades

- Generación de texto conversacional y razonamiento en modo `<|think|>` (thinking mode activable con `enable_thinking=True`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con soporte de `AutoProcessor` y `AutoModelForMultimodalLM`.
- Tool calling y function calling: el parche de espacio de pesos eleva la tasa de llamadas válidas del 0% al 75% en el conjunto de pruebas del autor con 8 consultas que requieren búsqueda web.
- Razonamiento matemático multi-paso dentro de un presupuesto de 420 tokens: del 33,3% al 66,7% de problemas resueltos.
- Comportamiento agéntico multi-paso: el conjunto de pruebas D del autor reporta un 66,7% de síntesis fundamentada end-to-end en un bucle de agente con DuckDuckGo (3 ejecuciones).
- Restricción de herramientas: mantiene el 100% de acierto en no invocar búsqueda cuando no es necesaria (conjunto de pruebas C, 6 prompts).
- Sin mecanismos de rechazo en la práctica: 9 rechazos de 100 frente a 99 de 100 del original, según la medición con Heretic.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Agentes de búsqueda web con tool calling: el parche de pesos corrige la parálisis que impedía invocar herramientas en modo thinking, con una tasa de llamadas válidas del 75% y una latencia media de 7,85 s por consulta en una RTX 4070 Ti. Adecuado para pipelines de investigación donde el modelo debe decidir cuándo buscar y cuándo responder de memoria.
- Asistente matemático con presupuesto de tokens ajustado: el modelo pasa directamente a la derivación algebraica en lugar de generar esquemas markdown de meta-comentario, lo que permite resolver el doble de problemas multi-paso dentro de 420 tokens. Útil en entornos con límites estrictos de latencia o coste por token.
- Evaluación de interpretabilidad mecanicista: el repositorio incluye el parche de 641 KB y scripts para aplicarlo en memoria sobre un checkpoint existente, lo que permite comparar el comportamiento antes y después de editar 64 columnas concretas de las capas 38-41 sin descargar 16 GB. Relevante para investigación en edición de pesos y circuitos.
- Despliegue en GPU de consumo: el loader incluido mantiene las 42 capas activas en 9,29 GB de VRAM y descarga la tabla estática de embeddings por capa (5,64 GB) a CPU, lo que permite ejecutar el modelo en una RTX 4070 Ti de 12 GB. Adecuado para prototipado local y pruebas de agentes sin infraestructura de datacenter.
- Generación de contenido sin filtros de rechazo: la ablación reduce los rechazos a 9/100, útil para tareas creativas o de análisis de contenido sensible donde los rechazos del modelo base interrumpen el flujo. Requiere revisión humana por las implicaciones de la licencia y del contenido generado.
- Procesamiento multimodal imagen-texto: al conservar el pipeline `image-text-to-text` de Gemma 4 E4B, puede emplearse en tareas de descripción de imágenes o extracción de información visual combinada con razonamiento textual, aunque las capacidades de visión no están cuantificadas en la información disponible.

## Benchmarks y rendimiento

Los datos de la model card corresponden a comparativas internas del autor entre el modelo base y la versión con parche de espacio de pesos (no entre esta variante heretic y el original, salvo en la métrica de rechazos).

| Suite | Metrica | Baseline (antes) | Parcheado (despues) | Delta |
|---|---|---|---|---|
| Modificacion | Parametros editados (bfloat16) | 0 (0,0%) | 163.840 (0,00205%) | 64 columnas MLP (L38-L41) |
| A: Thinking + busqueda web (8 consultas) | Tasa de tool calls validas | 0,0% (0/8) | 75,0% (6/8) | +75,0% |
| A: Eficiencia | Tokens medios / latencia media (RTX 4070 Ti) | 243,8 tok / 15,46 s | 129,0 tok / 7,85 s | -47,1% tokens / 1,97x mas rapido |
| B: Matematicas multi-paso con thinking (6 problemas) | Resueltos en presupuesto de 420 tokens | 33,3% (2/6) | 66,7% (4/6) | +33,4% (2x) |
| C: Conocimiento directo y restriccion (6 prompts) | Restriccion de herramienta (sin busqueda falsa) | 100,0% (6/6) | 100,0% (6/6) | 0,0% de degradacion |
| D: Bucle de agente con DuckDuckGo (3 ejecuciones) | Sintesis fundamentada end-to-end | 0,0% (0/3) | 66,7% (2/3) | +66,7% |
| Decensurado (Heretic) | Rechazos | 99/100 | 9/100 (esta variante) | -90 rechazos |
| Decensurado (Heretic) | Divergencia KL | 0 (por definicion) | 0,0514 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia completa en bfloat16: aproximadamente 16 GB para el checkpoint completo; el loader optimizado del repositorio reduce el uso a 9,29 GB en GPU más 5,64 GB de tabla de embeddings en CPU, para un total de 12 GB de GPU.
- GPU recomendadas: RTX 4070 Ti (12 GB) validada por el autor con latencia media de 7,85 s por consulta en el conjunto de pruebas A; para el checkpoint completo sin offload se requiere una GPU de 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en RTX 4070 Ti de 12 GB usando el `model_loader.py` incluido con offload de la tabla de embeddings a CPU.
- Opciones de despliegue: `transformers` con `AutoModelForMultimodalLM` y `device_map="auto"`; el repositorio incluye `model_loader.py` y `apply_patch.py`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 7,85 s de media por consulta en el conjunto de pruebas A (8 consultas con thinking y búsqueda web) en RTX 4070 Ti; 15,46 s en el modelo sin parche. No hay datos de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Tool calling | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo (gemma-4-E4B-it + WSP + Heretic) | 7.941.100.832 | ~4B | No disponible | 75% de llamadas válidas (suite A) | Gemma | Rechazos 9/100; parche de 641 KB aplicable en menos de 1 s |
| google/gemma-4-E4B-it (base) | No disponible en la informacion | ~4B | No disponible | 0% en suite A con thinking | Gemma | Punto de partida sin parche ni decensurado |
| jstarks/gemma-4-E4B-it-weight-space-programming | No disponible en la informacion | ~4B | No disponible | 75% en suite A | Gemma | Parche de espacio de pesos sin decensurar; rechazos 99/100 |
| unsloth/gemma-4-E4B-it | No disponible en la informacion | ~4B | No disponible | No disponible | Gemma | Checkpoint alternativo citado como compatible con el parche |

## Limitaciones y advertencias

- La decensuración mediante ablación de rango arbitrario elimina parte de los mecanismos de rechazo, pero no garantiza un comportamiento alineado: el modelo puede generar contenido dañino, sesgado o inexacto sin señalizarlo. Requiere moderación externa en producción.
- La divergencia KL de 0,0514 respecto al modelo original indica que la distribución de salida se ha alterado de forma medible; puede degradar capacidades no evaluadas en los conjuntos de pruebas del autor (8, 6, 6 y 3 prompts, muestras muy pequeñas).
- Los benchmarks publicados son internos del autor, con tamaños de muestra reducidos (8 consultas, 6 problemas, 3 ejecuciones) y sin intervalos de confianza; no deben interpretarse como evidencia robusta de rendimiento general.
- No hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K), ni de contexto máximo, ni de idiomas soportados, lo que dificulta la comparación con alternativas.
- La licencia Gemma impone restricciones de uso comercial y de redistribución; debe revisarse antes de desplegar el modelo en productos.
- La fecha de creación del repositorio (2026-11-14) y el nombre del modelo base (`gemma-4-E4B-it`) no se corresponden con versiones publicadas verificables en la información disponible; conviene validar la procedencia y la integridad de los pesos antes de usarlos.
- El modelo requiere un loader específico para caber en 12 GB de VRAM; el despliegue estándar con `device_map="auto"` necesita aproximadamente 16 GB.
- Riesgo de alucinación en tool calling: aunque el parche eleva la tasa de llamadas válidas al 75%, un 25% de consultas sigue sin invocar la herramienta correctamente en el conjunto de pruebas del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xtools-at/gemma-4-E4B-it-weight-space-programming-UNCENSORED-heretic
- Modelo base (parche de espacio de pesos): https://huggingface.co/jstarks/gemma-4-E4B-it-weight-space-programming
- Checkpoint alternativo citado: https://huggingface.co/unsloth/gemma-4-E4B-it
- Heretic (herramienta de decensurado): https://heretic-project.org
- Blog "Sparks of Weight-Space Programming" (Takehi et al., MIT CSAIL): https://rikiyat.github.io/blog/weight-space-programming/
- Resultado de búsqueda no relacionado con el modelo (software de grabado láser xTool Studio): https://fr.xtool.com/pages/logiciel
