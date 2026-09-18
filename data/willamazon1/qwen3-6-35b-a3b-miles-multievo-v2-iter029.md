# willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter029

## Resumen

`willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter029` es un checkpoint de aprendizaje por refuerzo (RL) derivado del modelo multimodal `Qwen/Qwen3.6-35B-A3B`. Lo publica el usuario `willamazon1` dentro de la ejecución de entrenamiento `miles-multievo-v2`, y corresponde concretamente a la iteración 29 de esa ejecución (los checkpoints se guardan cada 5 iteraciones y se agrupan en una colección para comparar puntos de la curva de entrenamiento).

Arquitectónicamente es un transformer de tipo mezcla de expertos (MoE) con 40 capas, dimensión oculta de 2048, 256 expertos con enrutado top-8, atención híbrida (lineal y completa), una capa MTP (multi-token prediction) y una torre de visión, lo que da lugar a la etiqueta de pipeline `image-text-to-text`. El recuento real de parámetros en los safetensors es de 35.951.822.704 (unos 35,95 mil millones), almacenados en bfloat16 en un repositorio de 71,9 GB.

Su relevancia es doble: por un lado documenta un punto intermedio de un ciclo de RL sobre un MoE multimodal de gran tamaño; por otro, sirve como referencia práctica de conversión desde un checkpoint de entrenamiento en formato Megatron-LM `torch_dist` a safetensors de HuggingFace, incluyendo la reconstrucción de la torre de visión desde el modelo base. No es un modelo final pulido, sino un artefacto de investigación con cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (`Qwen3_5MoeForConditionalGeneration`), transformer MoE con atención híbrida lineal/completa |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | ~3 B (deducido de la nomenclatura A3B del modelo base; no confirmado explícitamente en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16); expertos MoE en layout agrupado/fusionado (`mlp.experts.gate_up_proj` / `down_proj`) |
| Numero de capas | 40 |
| Dimension oculta | 2048 |
| Expertos | 256, enrutado top-8 |
| Capas MTP | 1 |
| Torre de vision | sí (tomada del modelo base durante la conversión) |
| Vocabulario | 248320 |
| Precision de entrenamiento/publicacion | bfloat16 |
| Tamano del repositorio | 71,9 GB |
| Pipeline declarado | `image-text-to-text` |
| Etapa | RL (MultiEvo v2), iteración 29 |
| Libreria | transformers |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.6-35B-A3B`, un MoE multimodal. La configuración publicada indica 40 capas con dimensión oculta de 2048, 256 expertos con enrutado top-8, atención híbrida que combina capas de atención lineal con capas de atención completa, una capa de predicción multi-token (MTP) y una torre de visión para entrada de imágenes. El vocabulario es de 248320 entradas. El checkpoint distribuido en este repositorio es un ajuste por refuerzo sobre ese modelo base, correspondiente a la iteración 29 de la ejecución `miles-multievo-v2`; no se detallan en la información disponible ni la composición del dataset de RL, ni el algoritmo concreto (PPO, GRPO u otro), ni el número de tokens consumidos.

Un aspecto técnico destacable es el proceso de conversión, que documenta un problema habitual al publicar checkpoints de RL entrenados con Megatron-LM: el checkpoint `torch_dist` solo contiene el modelo de lenguaje, de modo que la torre de visión se recupera desde el modelo base con la opción `-a/--add-missing-from-origin-hf` de la herramienta `tools/convert_torch_dist_to_hf.py` del proyecto slime. Además se usa `--vocab-size 248320` para eliminar el relleno (padding) del embedding y se conserva el layout agrupado y fusionado de los expertos. Según la model card, cada shard fue verificado en busca de NaN/Inf y el conjunto completo de claves de tensores se comparó con una conversión de referencia antes de la subida.

## Capacidades

- Generación de texto conversacional multi-turno, con la etiqueta `conversational` declarada por el autor.
- Entrada multimodal de imagen y texto (`pipeline_tag: image-text-to-text`), gracias a la torre de visión incorporada en la conversión.
- Razonamiento orientado a agentes: el repositorio declara la etiqueta `agent`, lo que apunta a un ajuste por RL sobre tareas de interacción con herramientas o entornos, aunque no se detallan los entornos ni las recompensas empleadas.
- Ajuste por refuerzo (`reinforcement-learning`), lo que implica optimización sobre preferencias o recompensas verificables en lugar de simple ajuste supervisado.
- Predicción multi-token mediante la capa MTP, aprovechable para decodificación especulativa o entrenamiento con objetivos auxiliares.
- Capacidades multilingües: no disponibles (la ficha de HuggingFace no declara idiomas).
- Soporte explícito de tool calling / function calling y de razonamiento multi-paso: no confirmado en la información disponible, aunque es plausible dado el etiquetado como agente.
- Modo de pensamiento (thinking): no disponible.

## Casos de uso

- Investigación sobre RL en modelos MoE multimodales: el checkpoint permite comparar el estado del modelo en la iteración 29 frente a otras iteraciones de la misma colección, aislando el efecto del entrenamiento por refuerzo sin partir de cero.
- Análisis de estabilidad de entrenamiento: al estar verificados todos los shards frente a NaN/Inf y contrastados con una conversión de referencia, sirve como material para estudiar la evolución de los pesos a lo largo de la curva de RL.
- Evaluación de pipelines de conversión Megatron-LM a HuggingFace: es un ejemplo reproducible de cómo reconstruir la torre de visión desde el modelo base y recortar el padding del vocabulario, útil para equipos que publican checkpoints intermedios.
- Prototipado de asistentes multimodales: al aceptar imagen y texto, puede emplearse en pruebas de concepto de descripción de imágenes, respuesta a preguntas sobre capturas o extracción de información de documentos escaneados, siempre con validación humana.
- Experimentos de agentes con retroalimentación: el etiquetado como `agent` y su origen en RL lo hacen adecuado para reproducir entornos de decisión en los que se quiera medir el efecto del refuerzo sobre el comportamiento del modelo base.
- Comparación de eficiencia MoE en producción: con ~3 B de parámetros activos frente a 35,95 B totales, es un banco de pruebas para medir el equilibrio entre coste de memoria y latencia de decodificación en infraestructura propia.
- Base para ajuste posterior específico de dominio: al estar bajo Apache-2.0, puede servir de punto de partida para fine-tuning supervisado en tareas verticales, aprovechando que ya incorpora visión y capacidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 72 GB solo para los pesos (el repositorio ocupa 71,9 GB), más la memoria de caché KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas para bfloat16: una H100 de 80 GB o una H200 de 141 GB con margen reducido; con contexto largo, dos A100 de 80 GB o dos H100 de 80 GB en paralelo de tensor.
- Cuantización a 8 bits (estimación, no publicada): ~36 GB de pesos, viable en una A100 80 GB, una H100 80 GB o dos RTX 4090 de 24 GB.
- Cuantización a 4 bits (estimación, no publicada): ~18-20 GB, potencialmente viable en una RTX 4090 de 24 GB o una RTX 5090 de 32 GB, asumiendo que la torre de visión y el enrutado MoE se cuantizan correctamente.
- GPU de consumo: en bfloat16 no cabe en ninguna GPU de consumo actual; dos RTX 4090 (48 GB) tampoco son suficientes para los pesos completos en bfloat16.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `AutoProcessor` (patrón documentado en la model card), vLLM o SGLang para servir MoE con visión. El soporte en llama.cpp u Ollama no está confirmado y es dudoso, dado el layout fusionado de los expertos y la dependencia de la torre de visión.
- Latencia y throughput estimados: no disponibles. Cualitativamente, con ~3 B de parámetros activos el coste por token decodificado se aproxima al de un modelo denso de ese orden, aunque el requisito de memoria sigue siendo el de un modelo de 36 B.
- La capa MTP podría habilitar decodificación especulativa integrada, pero no se documenta ninguna receta de uso en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.6-35b-a3b-miles-multievo-v2-iter029 | 35,95 B | ~3 B (no confirmado) | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,95 B | ~3 B (no confirmado) | no disponible | Apache-2.0 | HuggingFace |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128 K | Apache-2.0 | HuggingFace |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | Apache-2.0 | HuggingFace |

Datos de rendimiento comparativo: no disponibles en la información proporcionada. La comparación anterior se limita a parámetros, contexto, licencia y disponibilidad, y en el caso de Qwen3-30B-A3B y Mixtral 8x7B procede de sus especificaciones públicas habituales, no de una evaluación conjunta.

## Limitaciones y advertencias

- Es un checkpoint intermedio de entrenamiento (iteración 29), no un modelo final: su comportamiento puede ser inestable o degradado respecto al modelo base.
- Cero descargas y cero valoraciones en HuggingFace: no hay evidencia de uso en producción ni validación por terceros.
- No se ha publicado ningún resultado de benchmarks, por lo que no hay forma de verificar su calidad frente al modelo base.
- Sesgos conocidos: no disponibles. Al derivar de un modelo base entrenado con datos web a gran escala, hereda los sesgos de este, pero no se documenta ningún análisis al respecto.
- Riesgo de alucinación: no cuantificado. Un ajuste por RL puede incrementar o reducir la tendencia a inventar según la función de recompensa empleada, que no se detalla.
- Limitaciones de contexto e idioma: no disponibles. No se declara la longitud máxima de contexto ni el conjunto de idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. Conviene revisar igualmente las condiciones del modelo base y de los datos de entrenamiento, que no se documentan.
- La conversión reconstruye la torre de visión desde el modelo base en lugar de tomarla del checkpoint de RL; si el entrenamiento modificó el codificador visual, esos cambios no están presentes en este repositorio.
- La documentación no especifica el algoritmo de RL, el dataset, el número de tokens ni los criterios de parada, lo que dificulta reproducir el entrenamiento.
- Para producción se recomienda tratar este checkpoint como material de investigación y validarlo exhaustivamente antes de exponerlo a usuarios finales.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter029)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Herramienta de conversión slime (THUDM)](https://github.com/THUDM/slime)
- No se han encontrado en la búsqueda web enlaces relevantes (papers, blogs o demos) asociados a este modelo.
