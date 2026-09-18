# willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter024

## Resumen

El modelo `willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter024` es un checkpoint intermedio de aprendizaje por refuerzo (RL) obtenido a partir del modelo base multimodal `Qwen/Qwen3.6-35B-A3B`. Lo publica el usuario de HuggingFace `willamazon1` dentro de la ejecución de entrenamiento denominada `miles-multievo-v2`, y corresponde concretamente a la iteración 24 de dicha ejecución. No se trata de un modelo final pulido, sino de una instantánea de la curva de entrenamiento: el autor guarda checkpoints cada 5 iteraciones y los agrupa en una colección para poder comparar puntos intermedios.

Arquitectónicamente es un transformer disperso (MoE) multimodal: 40 capas, dimensión oculta de 2048, 256 expertos con enrutado top-8, atención híbrida (lineal y completa), una capa MTP (multi-token prediction) y una torre de visión, con un vocabulario de 248.320 tokens. El recuento real de parámetros en los ficheros `safetensors` es de 35.951.822.704 (aproximadamente 35,95 mil millones), en precisión bfloat16, con un repositorio de 71,9 GB.

Su relevancia es acotada pero concreta: sirve como punto de referencia para estudiar el efecto del RL sobre el modelo base, comparar iteraciones del mismo run y evaluar si la técnica de RL empleada (MultiEvo v2) degrada o mejora las capacidades del modelo original. Al tener 0 descargas y 0 likes en el momento de la consulta, debe considerarse un artefacto de investigación sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE disperso multimodal con atención híbrida lineal/completa); 40 capas, hidden 2048, 256 expertos con top-8, 1 capa MTP, torre de visión |
| Parametros totales | 35.951.822.704 (~35,95 mil millones), dato real de los ficheros safetensors |
| Parametros activos | no disponible (la nomenclatura A3B del modelo base sugiere del orden de 3.000 millones de parametros activos, pero la cifra exacta no se publica en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en bfloat16 (no se incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (convertidos desde un checkpoint de entrenamiento Megatron-LM en formato torch_dist); expertos MoE en disposicion agrupada/fusionada (`mlp.experts.gate_up_proj` / `down_proj`) |
| Vocabulario | 248.320 tokens |
| Precision de publicacion | bfloat16 |
| Tamano del repositorio | 71,9 GB |
| Etapa de entrenamiento | RL (MultiEvo v2), iteracion 24 |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Libreria | transformers |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `Qwen3.6-35B-A3B`: un transformer de tipo mezcla de expertos (MoE) con 40 capas y dimensión oculta 2048, en el que cada token se enruta a 8 de los 256 expertos disponibles. Emplea además atención híbrida, combinando capas de atención lineal con capas de atención completa, lo que reduce el coste de cómputo y memoria en secuencias largas. Incorpora una capa MTP (multi-token prediction) y una torre de visión, lo que lo convierte en un modelo multimodal de entrada imagen-texto y salida texto.

El checkpoint publicado no es un modelo preentrenado desde cero, sino el resultado de una fase de RL sobre el modelo base, dentro de la ejecución `miles-multievo-v2`, detenida en la iteración 24. La model card no detalla la composición del dataset de RL, el número de tokens vistos, la función de recompensa, ni si se aplicaron etapas previas de SFT o DPO. Tampoco se especifica el algoritmo exacto (PPO, GRPO u otro). El proceso de conversión sí está documentado: se partió de un checkpoint `torch_dist` de Megatron-LM y se transformó a safetensors de HuggingFace con la herramienta `tools/convert_torch_dist_to_hf.py` del proyecto slime, usando `--vocab-size 248320` para eliminar el relleno (*padding*) de los embeddings y el flag `-a/--add-missing-from-origin-hf` para incorporar la torre de visión desde el modelo base, ya que el checkpoint de entrenamiento solo contenía el modelo de lenguaje. El autor indica que cada shard fue verificado en busca de valores NaN/Inf y que el conjunto completo de claves de tensores se comparó con una conversión conocida y válida de esta arquitectura.

## Capacidades

- Generación de texto conversacional y multimodal: el pipeline declarado es `image-text-to-text`, por lo que acepta imágenes junto con texto como entrada y devuelve texto.
- Razonamiento y matemáticas: no hay evaluación publicada que lo confirme para este checkpoint concreto; la capacidad depende del modelo base y del efecto del RL aplicado.
- Generación de código: no disponible como capacidad verificada en la información proporcionada.
- Tool calling / function calling: no disponible; la model card no documenta plantilla de herramientas ni formato de llamadas.
- Soporte de agentes y razonamiento multi-paso: la etiqueta `agent` aparece en los tags del repositorio, pero no se aporta ninguna especificación de protocolo, formato o evaluación que lo respalde.
- Capacidades multilingües: no disponible; el campo de idiomas no está rellenado y no se publica desglose por idioma.
- Modo de pensamiento (*thinking mode*): no disponible.
- Capacidades de audio o vídeo: no disponibles; solo se menciona la torre de visión.

## Casos de uso

- Investigación sobre aprendizaje por refuerzo: comparar este checkpoint (iteración 24) con las demás iteraciones publicadas del mismo run `miles-multievo-v2` para medir cómo evoluciona el comportamiento del modelo a lo largo de la curva de entrenamiento y detectar posibles degradaciones o colapsos.
- Punto de partida para ajuste fino propio: al estar bajo licencia Apache-2.0 y en formato safetensors nativo de `transformers`, se puede cargar con `AutoModelForCausalLM.from_pretrained` y continuar el entrenamiento con SFT o un RL posterior adaptado al dominio propio.
- Evaluación interna de modelos MoE multimodales: sirve como referencia para comparar el coste de inferencia de un MoE de 35,95 mil millones de parámetros totales con enrutado top-8 frente a alternativas densas del mismo orden de magnitud, midiendo latencia y consumo de VRAM en hardware propio.
- Experimentos de visión-lenguaje en laboratorio: al incorporar torre de visión, permite probar tareas de descripción de imágenes, respuesta a preguntas visuales o extracción de información de documentos escaneados, siempre asumiendo que no existe evaluación publicada de su calidad en estas tareas.
- Reproducibilidad de conversiones Megatron-LM a HuggingFace: el repositorio documenta el pipeline de conversión con slime, por lo que es útil como caso de estudio para equipos que necesiten convertir sus propios checkpoints `torch_dist` conservando la torre de visión desde el modelo base.
- Docencia y formación técnica: ilustra de forma práctica qué es un checkpoint intermedio de RL, cómo se estructura un MoE con 256 expertos y por qué un modelo de 35,95 mil millones de parámetros puede tener requisitos de memoria muy superiores a su coste de cómputo por token.
- Generación de texto e imagen-texto en entornos con licencia permisiva: cualquier uso comercial derivado está permitido por Apache-2.0, aunque el despliegue real exige validar antes la calidad del checkpoint, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta metadatos de arquitectura, la iteración de entrenamiento y detalles de la conversión de formato; no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en bfloat16: los pesos ocupan aproximadamente 72 GB (35,95 mil millones de parámetros × 2 bytes), cifra coherente con los 71,9 GB del repositorio. Hay que sumar la caché KV y el *overhead* del runtime, por lo que en la práctica se necesitan del orden de 80 GB o más.
- VRAM estimada en int8: alrededor de 36-40 GB solo para pesos.
- VRAM estimada en int4: alrededor de 18-22 GB solo para pesos, antes de caché KV y activaciones.
- GPU recomendadas: H100 80 GB o A100 80 GB para bfloat16 en una sola tarjeta; 2× A100 40 GB o 2× RTX 6000 Ada 48 GB como alternativas multi-GPU en bfloat16.
- GPU de consumo: en bfloat16 no cabe en ninguna GPU de consumo actual. Con cuantización a 4 bits podría caber en una RTX 4090 de 24 GB o una RTX 5090 de 32 GB, pero el repositorio no publica pesos cuantizados, de modo que habría que generarlos y validar el resultado.
- Opciones de despliegue: `transformers` con `device_map="auto"` es la vía documentada por el autor (el ejemplo de la model card usa `AutoProcessor` y `AutoModelForCausalLM`). Para servirlo en producción habría que exportarlo a vLLM, TGI o SGLang, teniendo en cuenta que el soporte de la arquitectura `qwen3_5_moe` con torre de visión puede no estar disponible en todas ellas. No se han publicado ficheros GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa no trivial.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar solo 8 de 256 expertos, el coste de cómputo por token es mucho menor que el de un modelo denso de 35,95 mil millones de parámetros, pero el cuello de botella pasa a ser el ancho de banda de memoria, ya que hay que mantener todos los expertos residentes en VRAM.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de información pública general y deben verificarse antes de usarse; los del modelo analizado proceden de la información proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Modalidad |
|---|---|---|---|---|---|
| qwen3.6-35b-a3b-miles-multievo-v2-iter024 | 35,95 mil millones | no disponible (enrutado top-8 de 256 expertos) | no disponible | Apache-2.0 | Imagen-texto a texto |
| Qwen/Qwen3.6-35B-A3B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Qwen3-30B-A3B | ~30,5 mil millones | ~3,3 mil millones | 32.768 tokens (configuracion habitual) | Apache-2.0 | Texto a texto |
| Mixtral 8x7B | ~46,7 mil millones | ~12,9 mil millones | 32.768 tokens | Apache-2.0 | Texto a texto |

Nota: la comparación con Qwen3-30B-A3B y Mixtral 8x7B es orientativa respecto a la categoría (MoE de pesos abiertos con licencia permisiva). No implica equivalencia de rendimiento, ya que no existen benchmarks publicados de este checkpoint que permitan establecerla.

## Limitaciones y advertencias

- Es un checkpoint intermedio de RL (iteración 24), no un modelo final. Su calidad conversacional, su coherencia y su alineación pueden ser sensiblemente peores que las del modelo base o que las de una versión posterior del mismo run.
- No se han publicado benchmarks, evaluaciones de seguridad ni pruebas de regresión; cualquier uso en producción parte de una base no validada.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que terceros hayan detectado fallos.
- Riesgo de alucinación: no cuantificado para este checkpoint; al ser un modelo de lenguaje generativo, el riesgo existe y no está mitigado por ninguna evaluación publicada.
- Sesgos: no disponibles. No se documenta la composición del dataset de RL ni del preentrenamiento, por lo que no se pueden caracterizar sesgos demográficos, culturales o lingüísticos.
- Idiomas: no se declara ningún idioma soportado. No hay garantía de un rendimiento mínimo en castellano ni en ninguna otra lengua distinta de las que maneje el modelo base.
- Longitud de contexto: no disponible. No se debe asumir ninguna ventana concreta ni desplegar el modelo en escenarios que dependan de contexto largo sin verificarlo empíricamente.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero conviene revisar las condiciones del modelo base `Qwen/Qwen3.6-35B-A3B` en su propio repositorio, ya que el modelo derivado hereda las obligaciones que este imponga. La información proporcionada no incluye la licencia del base.
- Compatibilidad de despliegue: al ser una arquitectura `qwen3_5_moe` reciente y con torre de visión, es probable que los motores de inferencia de alto rendimiento no la soporten de serie; hay que verificar la compatibilidad antes de planificar un despliegue.
- Integridad de los pesos: el autor afirma haber comprobado NaN/Inf y haber comparado el conjunto de claves de tensores, pero no se aporta un hash verificable ni una reproducción independiente de esa comprobación.
- Repositorio de 71,9 GB: la descarga y el almacenamiento tienen un coste relevante, y no existen versiones cuantizadas que lo reduzcan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter024
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de conversión slime (THUDM): https://github.com/THUDM/slime
- Colección del run `miles-multievo-v2`: mencionada en la model card, pero sin URL proporcionada; no disponible.
- Paper, blog o demo asociados: no disponibles.
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (versan sobre flores y plantas de la costa este de Estados Unidos), por lo que no se ha incluido ninguno como enlace relevante.
