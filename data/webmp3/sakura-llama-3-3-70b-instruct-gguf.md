# webmp3/Sakura-Llama-3.3-70B-Instruct-GGUF

## Resumen

Sakura-Llama-3.3-70B-Instruct-GGUF es una cuantización comunitaria del modelo meta-llama/Llama-3.3-70B-Instruct, publicada por el usuario webmp3 bajo el identificador Sakura. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión a formato GGUF del checkpoint original de Meta, pensada para su despliegue con llama.cpp en entornos donde no es viable cargar los 70.600 millones de parámetros en precisión completa.

El paquete distribuye un único archivo en cuantización Q4_K_M de 42,5 GB, generado mediante recuantización de un GGUF Q8_0 intermedio de bartowski y aplicando una importance matrix (imatrix) calculada con llama-imatrix sobre un texto de calibración fijo. Esta técnica asigna más bits a los tensores que más contribuyen a la salida, lo que en teoría reduce la degradación respecto a una cuantización uniforme, aunque el propio autor no reclama ninguna mejora medible.

Su relevancia es práctica: permite ejecutar un modelo de 70B de la familia Llama 3.3 en hardware con alrededor de 48 GB de memoria, algo inalcanzable con el checkpoint original en BF16 (unos 141 GB). La ficha se centra, por tanto, en las características del modelo base y en las particularidades de esta cuantización concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.3), pesos en GGUF |
| Parametros totales | 70.553.706.560 (70,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.3 declara 128.000 tokens, pero la model card de esta cuantizacion no lo especifica) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado); tensores internos: F32 (162), Q4_K (441), Q5_K (40), Q6_K (81) |
| Idiomas soportados | en, zh (segun metadatos de la model card) |
| Licencia | llama3.3 (Llama 3.3 Community License de Meta) |
| Formato de pesos | GGUF (un unico archivo de 42.520.398.880 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama-3.3-70B-Instruct, un transformer decoder-only denso de 70,6 mil millones de parámetros desarrollado por Meta. La model card de esta cuantización no aporta detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO); esa información corresponde a la documentación oficial de Meta y no se reproduce aquí para no inventar datos. La model card sí declara que el modelo base de Llama-3.3-70B-Instruct es a su vez un fine-tune de meta-llama/Llama-3.1-70B.

La innovación técnica de este repositorio no está en la arquitectura, sino en el proceso de cuantización. Se parte de un GGUF Q8_0 de bartowski (75,0 GB), no del checkpoint BF16/safetensors original, y se recuantiza a Q4_K_M con los kernels GGML de llama.cpp aplicando una importance matrix. La imatrix se calculó una sola vez con `llama-imatrix` sobre el texto de calibración `hfqa-original-calibration-v2` (6144 bytes de inglés, alemán y chino, código y formatos de datos, 12 fragmentos de 128 tokens), con SHA-256 `47432094805c0279317c9abec0c50c897b3efbe4c493143e2816a124fac89e1e`. El autor advierte explícitamente de que el texto de calibración es corto, de que no reclama mejora de calidad sin benchmark y de que recuantizar una fuente ya cuantizada puede añadir error adicional. La verificación incluye estructura GGUF válida y una prueba real de inferencia con llama.cpp (commit `19ff817fb25e9a1b838b1d7f9f4325f7bf9779c4`).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo del modelo base.
- Razonamiento e instrucciones complejas: el modelo base está optimizado para seguir instrucciones y resolver tareas de razonamiento.
- Generación de código y matemáticas: capacidades propias de Llama 3.3-70B-Instruct, aunque esta model card no aporta benchmarks que las cuantifiquen.
- Soporte de tool calling / function calling: disponible en el modelo base según su formato de chat instructivo; la model card de la cuantización no lo documenta explícitamente.
- Capacidades multilingües limitadas a inglés y chino según los metadatos declarados.
- Sin soporte de visión ni audio: es un modelo exclusivamente de texto.
- Sin modo thinking explícito documentado en esta model card.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede mantener diálogos multi-turno en inglés o chino con un contexto amplio (el modelo base declara 128K tokens), desplegado en servidores con 48 GB de VRAM o con offloading parcial a RAM.
- Generación de código en pipelines internos: al ser un modelo instructivo de 70B, es adecuado para autocompletado, revisión y explicación de código dentro de herramientas de desarrollo, siempre que el equipo valide la calidad tras la cuantización Q4_K_M.
- Procesamiento de documentación técnica larga: la ventana de contexto del modelo base permite resumir o extraer información de documentos extensos en una sola pasada, con la salvedad de que la cuantización puede degradar ligeramente la fidelidad en contextos muy largos.
- Atención al cliente automatizada en inglés o chino: el ajuste instructivo y la capacidad multi-turno permiten gestionar conversaciones de soporte, con la ventaja de que los datos no salen de la infraestructura propia.
- Traducción y adaptación de contenido entre inglés y chino: es el par de idiomas declarado en los metadatos, por lo que es el escenario multilingüe más fiable para esta cuantización.
- Prototipado e investigación en entornos con recursos limitados: permite experimentar con un modelo de 70B en una sola máquina con GPU de 48 GB o con configuraciones híbridas CPU/GPU, algo imposible con el checkpoint BF16.
- Evaluación de técnicas de cuantización: el repositorio documenta hashes, tipos de tensor y proceso de imatrix, lo que lo convierte en un caso de estudio útil para investigar el impacto de la recuantización Q8_0 → Q4_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ningún benchmark de código, perplejidad ni puntuación de calidad, y que la única verificación realizada es que el archivo GGUF es estructuralmente válido y que llama.cpp lo carga y genera texto correctamente.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 42,5 GB, por lo que se necesitan al menos 43-48 GB de memoria disponible para cargarlo completo en GPU; con offloading parcial a RAM puede ejecutarse con menos VRAM a costa de latencia.
- GPU recomendadas: A100 80 GB, H100 80 GB, RTX A6000 48 GB o dos GPU de 24 GB (por ejemplo, 2x RTX 4090) con reparto de capas.
- Cabe en GPU de consumo: una RTX 4090 de 24 GB no puede cargar el modelo completo; es viable con offloading parcial a RAM del sistema, con una penalización notable de velocidad. Configuraciones con 48 GB (RTX A6000, o 2x RTX 4090) son el mínimo práctico para carga completa.
- Opciones de despliegue: llama.cpp (versión con soporte para la arquitectura, probada con el commit `19ff817fb25e9a1b838b1d7f9f4325f7bf9779c4`), llama-cli, y servidores compatibles con GGUF como Ollama o llama-server. La model card menciona `endpoints_compatible` en los tags.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware, del número de capas descargadas a CPU y del backend (CUDA, Metal, ROCm).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura-Llama-3.3-70B-Instruct-GGUF (Q4_K_M) | 70,6 B | no disponible en la model card | GGUF, 42,5 GB | llama3.3 | Hugging Face, comunidad |
| meta-llama/Llama-3.3-70B-Instruct (original) | 70,6 B | 128K (según documentación de Meta) | safetensors, BF16 | llama3.3 | Hugging Face, oficial |
| bartowski/Llama-3.3-70B-Instruct-GGUF (Q8_0) | 70,6 B | 128K (según documentación de Meta) | GGUF, 75,0 GB | llama3.3 | Hugging Face, comunidad |
| Llama-3.1-70B (modelo base declarado) | 70,6 B | 128K (según documentación de Meta) | safetensors | llama3.1 | Hugging Face, oficial |

No se dispone de datos de rendimiento comparativo medidos para esta cuantización, por lo que la comparativa se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una cuantización comunitaria, no una release oficial de Meta; el autor lo declara explícitamente y no asume responsabilidad sobre la calidad final.
- La recuantización Q8_0 → Q4_K_M puede acumular error adicional respecto a cuantizar directamente desde BF16; el propio autor lo advierte.
- El texto de calibración de la imatrix es muy corto (6144 bytes, 12 fragmentos de 128 tokens), lo que limita la representatividad de los pesos de importancia.
- No hay benchmarks publicados: no se puede afirmar que la calidad se mantenga respecto al modelo original ni cuantificar la degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se ha evaluado específicamente en esta cuantización.
- Idiomas declarados limitados a inglés y chino; el rendimiento en castellano no está documentado y no debería asumirse.
- Licencia llama3.3: el uso comercial está sujeto a los términos de la Llama 3.3 Community License de Meta, que incluye restricciones (por ejemplo, umbral de usuarios activos mensuales y obligaciones de atribución). La model card indica que la licencia no fue verificada automáticamente y que aplican los términos del autor original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- La ventana de contexto no se especifica en la model card de esta cuantización; debe confirmarse contra la documentación del modelo base antes de usarla en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-Llama-3.3-70B-Instruct-GGUF
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Model card del base en el commit referenciado: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct/blob/6f6073b423013f6a7d4d9f39144961bfbfbc386b/README.md
- Modelo base declarado (Llama 3.1 70B): https://huggingface.co/meta-llama/Llama-3.1-70B
- Fuente GGUF Q8_0 de la recuantización: https://huggingface.co/bartowski/Llama-3.3-70B-Instruct-GGUF
- llama.cpp (repositorio del runtime): https://github.com/ggml-org/llama.cpp
