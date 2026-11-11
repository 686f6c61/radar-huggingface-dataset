# thwannbe/qwen3-0.6B-to-1.7B-head-wise-stage1

## Resumen

`thwannbe/qwen3-0.6B-to-1.7B-head-wise-stage1` no es un modelo de lenguaje, sino un traductor de caché KV (*KV-cache mapper*) entrenado para transferir el estado de atención entre dos modelos de la familia Qwen3: el origen `Qwen/Qwen3-0.6B` y el destino `Qwen/Qwen3-1.7B`. Lo publica el usuario `thwannbe` como implementación independiente de la técnica KV-Lingo descrita en el paper arXiv:2609.32610 (referencia citada en los tags del repositorio). Su función es permitir que una caché KV calculada por el modelo pequeño se reutilice, tras una proyección lineal por cabeza, en el modelo grande, evitando recalcular el prefill completo.

El artefacto principal es `mapper.pt`, un fichero de pesos que contiene mapas lineales para K y V por capa, con forma `[2, groups, output_features, input_features]`. Las claves se capturan antes de la normalización de K y del RoPE, y la normalización y el RoPE del modelo destino se aplican después de la proyección. No incluye pesos base, estado del optimizador, datos de entrenamiento ni predicciones de evaluación.

Es relevante para quienes investigan optimización de inferencia, compartición de caché entre modelos de distinto tamaño y técnicas de *speculative prefill* o *cache transfer*. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño es de 0.0 GB y el checkpoint corresponde al paso de entrenamiento 0 (stage 1), por lo que debe tratarse como material experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapeador lineal de caché KV por cabeza (*head-wise*), implementación de KV-Lingo; no es un transformer standalone |
| Parametros totales | No disponible (el repositorio no publica recuento; el tamaño del repo es 0.0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo origen/destino Qwen3, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en `mapper.pt`, sin variantes GGUF/INT4/INT8) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | `mapper.pt` (PyTorch) junto con `mapper_config.json` y el paquete `kv_transfer/` |
| Modelo origen | `Qwen/Qwen3-0.6B` |
| Modelo destino | `Qwen/Qwen3-1.7B` |
| Paso de entrenamiento | 0 (stage 1) |

## Arquitectura y entrenamiento

El componente es un conjunto de proyecciones lineales por capa y por grupo de atención que transforman las matrices K y V del modelo origen (0.6B) en el espacio latente del modelo destino (1.7B). Cada tensor `maps.<layer>` tiene dos lados: el índice 0 corresponde a K y el 1 a V, con dimensiones `[2, groups, output_features, input_features]`. El diseño es *head-wise*, es decir, se aprende un mapa distinto por cabeza de atención en lugar de una única matriz global, lo que permite acomodar diferencias en el número de cabezas y en la dimensión por cabeza entre ambos modelos.

Un detalle técnico crítico es el punto de captura: las claves se extraen de la caché cruda del modelo origen antes de aplicar la normalización de K y el RoPE. La proyección se realiza sobre ese estado pre-norm, y a continuación se aplican la normalización de K y el RoPE del modelo destino. Esto implica que el mapeador no necesita aprender posiciones ni rotaciones, solo la transformación lineal entre espacios de representación. La model card no especifica el volumen de datos de entrenamiento, la composición del dataset, ni si se usó RLHF/DPO; solo indica que el checkpoint corresponde al paso 0 y que no se incluyen datos crudos ni predicciones de evaluación.

## Capacidades

- Traducción de caché KV del modelo Qwen3-0.6B al espacio del Qwen3-1.7B mediante proyecciones lineales por cabeza.
- Transferencia de estado de atención para prefijos ya procesados: la caché cubre todos los tokens del prefijo excepto el último, que se pasa normalmente al modelo destino.
- Integración programática mediante la clase `LinearMapper` del paquete `kv_transfer`, con carga vía `huggingface_hub` y método `translate(raw_cache, target_model)`.
- Separación explícita de K y V en el mismo fichero de pesos, con metadatos de arquitectura en `mapper_config.json`.
- No soporta generación de texto, tool calling, agentes, visión ni audio: no es un modelo de lenguaje.
- No es cargable con `AutoModel.from_pretrained`; requiere el cargador específico del paquete `kv_transfer`.

## Casos de uso

- Aceleración de prefill en pipelines de dos etapas: usar el Qwen3-0.6B para procesar un prefijo largo (documento, contexto de sistema, historial) y transferir la caché al Qwen3-1.7B para la generación, reduciendo el coste de computar el prefill en el modelo grande.
- Enrutamiento por dificultad: atender consultas sencillas con el modelo pequeño y, cuando la tarea requiera más capacidad, promover la conversación al modelo grande sin perder el contexto ya codificado.
- Investigación en compartición de caché entre modelos: banco de pruebas para medir la degradación de calidad al reutilizar estados de atención entre modelos de distinta escala dentro de la misma familia.
- Evaluación de técnicas KV-Lingo: reproducción y comparación de la implementación independiente frente a los resultados del paper arXiv:2609.32610, sin que el autor reclame equivalencia con ellos.
- Prototipado de sistemas *speculative prefill*: el mapeador actúa como el puente entre el modelo borrador y el modelo verificador en arquitecturas de decodificación especulativa a nivel de caché.
- Servicios con restricciones de VRAM: en despliegues donde el prefill del modelo grande es el cuello de botella, transferir la caché desde el 0.6B puede liberar memoria y tiempo de GPU, siempre que se valide la calidad aguas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama equivalencia con los resultados del paper KV-Lingo y que no se incluyen predicciones de evaluación.

## Requisitos de hardware

- VRAM: no disponible de forma específica; el mapeador es un conjunto de proyecciones lineales cuyo tamaño depende del número de capas, grupos y dimensiones de ambos Qwen3, pero el repositorio reporta 0.0 GB y no desglosa el tamaño de `mapper.pt`.
- GPU recomendadas: no disponibles; el ejemplo de la model card usa `device="cuda:0"`, por lo que se asume ejecución en GPU CUDA, sin modelo concreto especificado.
- Viabilidad en GPU de consumo: no confirmada; al requerir simultáneamente el modelo origen (0.6B) y el destino (1.7B) en memoria, el requisito agregado supera el del mapeador por sí solo.
- Opciones de despliegue: carga mediante `huggingface_hub.hf_hub_download` y la clase `LinearMapper` del paquete `kv_transfer/`; requiere instalar `requirements.txt` o añadir el directorio al `PYTHONPATH`. No compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thwannbe/qwen3-0.6B-to-1.7B-head-wise-stage1` | Mapeador KV (KV-Lingo) | No disponible | No disponible | No disponible | Hugging Face, 0 descargas |
| `Qwen/Qwen3-0.6B` | LLM transformer | 0.6B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base) |
| `Qwen/Qwen3-1.7B` | LLM transformer | 1.7B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base) |

No se dispone de información sobre otras implementaciones públicas de KV-Lingo con las que comparar directamente; el propio autor indica que este repositorio es una implementación independiente y no un checkpoint oficial.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse con `AutoModel.from_pretrained`; requiere el cargador `LinearMapper` del paquete `kv_transfer`.
- Checkpoint en paso de entrenamiento 0 (stage 1): la calidad de la traducción de caché no está validada ni documentada.
- El autor declara explícitamente que no se reclama equivalencia con los resultados del paper KV-Lingo.
- Solo válido para el par origen/destino Qwen3-0.6B → Qwen3-1.7B; no es transferible a otros modelos o tamaños sin reentrenamiento.
- No incluye pesos base, estado del optimizador, datos de entrenamiento ni predicciones de evaluación, lo que limita la reproducibilidad completa.
- Licencia no declarada: riesgo legal para uso comercial hasta que el autor la especifique.
- Idiomas soportados no declarados; dependen en la práctica de los modelos Qwen3 subyacentes.
- Riesgo de degradación silenciosa: una traducción de caché incorrecta puede producir respuestas plausibles pero inconsistentes con el contexto original, sin errores explícitos.
- Sesgos y alucinaciones: no evaluados en este artefacto; heredados potencialmente de los modelos Qwen3 de origen y destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thwannbe/qwen3-0.6B-to-1.7B-head-wise-stage1
- Modelo origen: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo destino: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper KV-Lingo: https://arxiv.org/abs/2609.32610
