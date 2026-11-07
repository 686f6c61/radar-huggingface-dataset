# wyqdf/DeepTaxon-Tri-JevAny-Qwen3.5-4B-Public-Experiments

## Resumen

DeepTaxon-Tri-JevAny-Qwen3.5-4B-Public-Experiments es un adaptador LoRA de investigación publicado por el usuario wyqdf sobre el modelo base Qwen/Qwen3.5-4B. Se trata de un artefacto experimental orientado a clasificación de imágenes en el dominio de la biología (taxonomía), no de un modelo de propósito general. El repositorio contiene los pesos del adaptador PEFT en formato safetensors, junto con checkpoints intermedios y segmentos de entrenamiento, con un tamaño total de 1,4 GB.

El autor documenta dos experimentos comparativos que comparten exactamente el mismo base limpio Qwen3.5-4B, el mismo conjunto de 60.190 preguntas de entrenamiento y 3.068 preguntas marcadas como Unknown, candidatos clasificados A/B, píxeles originales de imagen, 20 lotes, 957 actualizaciones del optimizador y las mismas 1.888 preguntas de desarrollo. La única diferencia experimental declarada es el orden de presentación de la entrada: un experimento coloca todas las imágenes antes del texto de estado, mientras que el control 112 usa el formato entrelazado con imagen de consulta, taxonomía y referencias del candidato A, seguidas de las del candidato B.

Ambos entrenamientos parten de un LoRA nuevo con rango r8, una cabeza Pointer256 y optimizador Adam. El autor indica explícitamente que los checkpoints intermedios son artefactos de investigación y que no se reclama ninguna mejora de rendimiento. La relevancia de esta ficha es acotada: sirve para documentar un experimento reproducible de ajuste fino multimodal sobre un LLM de 4B, no para recomendar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3.5-4B; incluye cabeza Pointer256 |
| Parametros totales | No disponible (el adaptador LoRA r8 se suma a los parámetros del base Qwen3.5-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT), con checkpoints y segmentos de entrenamiento |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8 aplicado sobre Qwen/Qwen3.5-4B, un transformer multimodal de 4B parámetros. El adaptador incorpora además una cabeza de punteros denominada Pointer256, orientada a la selección entre candidatos taxonómicos. El pipeline declarado en Hugging Face es image-classification, lo que confirma que la tarea objetivo es clasificar imágenes (presumiblemente especímenes biológicos) eligiendo entre taxonomías candidatas.

El entrenamiento se realizó sobre 60.190 preguntas de entrenamiento y 3.068 preguntas Unknown, con candidatos ordenados A/B, píxeles originales de imagen, 20 lotes y 957 actualizaciones del optimizador. Se usó Adam con un LoRA nuevo y se evaluó sobre 1.888 preguntas de desarrollo clasificadas. El diseño experimental compara dos representaciones de entrada: una con todas las imágenes antes del texto de estado y otra entrelazada (imagen de consulta, taxonomía y referencias del candidato A, después las del candidato B). Los checkpoints completos se conservan en `runs/<experiment>/checkpoints/` y `runs/<experiment>/segments/`, incluyendo adaptador, cabeza de punteros, procesador, optimizador, planificador de tasa de aprendizaje, RNG de cuatro rangos y cursor de entrenamiento. El autor no reporta mejoras ni resultados comparativos.

## Capacidades

- Clasificación de imágenes en el dominio biológico/taxonómico mediante selección entre candidatos A/B.
- Procesamiento conjunto de imágenes y texto (entrada multimodal con píxeles originales y estado textual).
- Selección de taxonomía mediante cabeza de punteros Pointer256 sobre candidatos.
- Manejo de preguntas marcadas como Unknown (3.068 en el conjunto de entrenamiento).
- No se documentan capacidades de generación de texto libre, código, matemáticas, tool calling, agentes ni multilingüismo específicas para este adaptador.
- No se documenta modo thinking, visión general, audio ni otras capacidades especiales más allá de la clasificación de imágenes.

## Casos de uso

- Investigación reproducible en ajuste fino multimodal: el repositorio conserva checkpoints, segmentos, optimizador, scheduler y RNG, lo que permite reproducir exactamente el entrenamiento y comparar variantes de representación de entrada.
- Estudio de representación de entrada en tareas de clasificación con candidatos: comparar el formato "imágenes primero" frente al entrelazado query/candidato A/candidato B aporta evidencia sobre cómo afecta el orden de los tokens visuales y textuales al rendimiento.
- Clasificación taxonómica asistida en entornos de investigación biológica: el adaptador puede evaluarse sobre imágenes de especímenes para seleccionar entre taxones candidatos, siempre como artefacto experimental y no como sistema de producción.
- Benchmarking de cabezas de punteros sobre LLMs: la combinación LoRA r8 + Pointer256 sirve para medir la eficacia de cabezas de selección sobre un base de 4B en tareas de elección entre opciones.
- Docencia y formación en PEFT: el repositorio es un ejemplo completo de cómo empaquetar adaptadores, checkpoints intermedios y metadatos de experimento para su auditoría.
- Auditoría de pipelines de subida y verificación de integridad: el autor documenta subidas en procesos CPU independientes a través de proxy HTTP con verificación de recibos contra SHA256 del Hub o hashes de blob Git, lo que puede servir como referencia de buenas prácticas de publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna mejora y que los checkpoints intermedios son artefactos de investigación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; el base Qwen3.5-4B requiere típicamente entre 8 y 10 GB en FP16 y alrededor de 3 a 4 GB en cuantización de 4 bits, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del base (4B) cabría esperar GPUs consumer de gama alta (RTX 3090, RTX 4090) y GPUs de datacenter (A100, H100) para entrenamiento o inferencia a mayor throughput, sin datos confirmados.
- Compatibilidad con GPU consumer: probable para el base en cuantización, no confirmado para el adaptador ni para la cabeza Pointer256.
- Opciones de despliegue: la librería declarada es PEFT, por lo que el despliegue requeriría cargar el base Qwen3.5-4B más el adaptador mediante transformers/PEFT; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepTaxon-Tri-JevAny-Qwen3.5-4B-Public-Experiments | Adaptador LoRA sobre base 4B | No disponible | Clasificación de imágenes / taxonomía | No disponible | Hugging Face (wyqdf) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible en la información | LLM multimodal de propósito general | No disponible en la información | Hugging Face (Qwen) |
| DeepTaxon-Tri-JevAny-Qwen3.5-4B-Checkpoints | Adaptador LoRA sobre base 4B | No disponible | Clasificación de imágenes / taxonomía | No disponible | Hugging Face (wyqdf) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor declara explícitamente que no se reclama ninguna mejora de rendimiento; es un artefacto de investigación, no un modelo validado.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido.
- No se especifican idiomas soportados ni longitud de contexto.
- El adaptador está especializado en clasificación de imágenes biológicas/taxonómicas; no debe esperarse un comportamiento de LLM general.
- Los checkpoints intermedios pueden contener estados de entrenamiento parciales no aptos para inferencia directa sin selección previa.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- La fecha de creación (2026-11-07) y el modelo base Qwen3.5-4B no están verificados de forma independiente en la información disponible.
- El autor indica que no se subieron imágenes de entrenamiento ni credenciales de inicio de sesión, pero no se detalla la composición del dataset ni su procedencia.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/wyqdf/DeepTaxon-Tri-JevAny-Qwen3.5-4B-Public-Experiments
- Repositorio de checkpoints: https://huggingface.co/wyqdf/DeepTaxon-Tri-JevAny-Qwen3.5-4B-Checkpoints
- Directorio de runs del repositorio de checkpoints: https://huggingface.co/wyqdf/DeepTaxon-Tri-JevAny-Qwen3.5-4B-Checkpoints/tree/main/runs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
