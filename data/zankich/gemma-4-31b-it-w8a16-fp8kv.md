# zankich/gemma-4-31B-it-W8A16-FP8KV

## Resumen

gemma-4-31B-it-W8A16-FP8KV es una cuantizacion del modelo multimodal google/gemma-4-31B-it publicada por el usuario zankich. Se trata de un checkpoint con pesos INT8 (esquema W8A16), activaciones en bfloat16 y una cache KV calibrada en FP8 E4M3, empaquetado en el formato compressed-tensors y disenado para servirse con vLLM. Su proposito es reducir el peso del modelo base, de unos 60 GB en bfloat16, hasta 33,7 GB repartidos en 17 shards, sin eliminar la torre de vision, que se conserva integra en bfloat16.

El checkpoint esta optimizado para GPUs Ampere (SM8x). En esa generacion requiere un parche especifico de FlashInfer (flashinfer-fp8-sm8-largehead.patch), ya que FlashInfer restringe las rutas de atencion con KV de un byte y cabeza grande a SM100+ y el kernel falla en tiempo de compilacion JIT con el error "No supported CUDA architectures found for major versions [10, 11, 12]". En SM100 o superior el checkpoint se sirve con vLLM estandar sin parche.

Es relevante porque permite ejecutar un modelo vision-lenguaje de gran tamano en hardware Ampere con un presupuesto de VRAM notablemente menor, a costa de un contrato de servicio estricto: la cache KV debe servirse obligatoriamente en FP8, y hacerlo en bfloat16 corrompe la generacion de forma silenciosa sin fallar al arrancar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision). Dos geometrias de atencion: 50 capas de ventana deslizante con 16 cabezas KV y head_dim 256, y 10 capas de atencion completa con 4 cabezas KV y head_dim 512 |
| Parametros totales | 9.536.844.252 segun metadatos de safetensors (el identificador del modelo indica 31B; discrepancia no explicada en la informacion disponible) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (la model card del checkpoint no la indica; incluye 50 capas de ventana deslizante) |
| Tipos de cuantizacion | Pesos INT8, W8A16, group size 128, simetrico, weight-only GPTQ; cache KV FP8 E4M3 con escalas estaticas por tensor y simetricas; activaciones en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0, con license_link que apunta a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors en formato compressed-tensors pack-quantized, 17 shards, 33,7 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un reentrenamiento. Parte de google/gemma-4-31B-it y aplica GPTQ sobre todos los modulos Linear salvo una lista de exclusion, lo que da un total de 410 GEMMs cuantizados: todas las proyecciones de atencion y FFN de ambas geometrias de atencion (las 50 capas de ventana deslizante y las 10 capas de atencion completa). La receta se ejecuto con llm-compressor 0.13.0 sobre un parche propio de compressed_tensors 0.18.0, con GPTQModifier(targets="Linear", scheme="W8A16"), dampening_frac 0.2 y actorder static.

Se mantienen en bfloat16 el lm_head, la torre de vision completa, la proyeccion de embeddings de vision, los modulos de audio y todos los embeddings de texto, siguiendo la receta oficial de gemma-4 de llm-compressor. La torre de vision tambien se excluye por un motivo de divisibilidad: su MLP tiene 4304 columnas intermedias, no divisible por el group size 128.

La calibracion de la cache KV se realiza en las mismas pasadas forward que los pesos GPTQ, mediante kv_cache_scheme sobre el modifier, sin paso de calibracion separado. El checkpoint incorpora 120 tensores k_scale/v_scale, un par por capa, cada uno dimensionado para su propia geometria. El conjunto de calibracion consta de 512 muestras con longitud maxima de secuencia 2048, mezcla de turnos interactivos de codigo y codigo publico a nivel de funcion en Python, TypeScript, Go y shell; procede de datos privados de sesion y no se publica.

## Capacidades

- Generacion de texto e instrucciones: es el modelo -it de Gemma 4, por lo que conserva el comportamiento conversacional del base, aunque la model card del checkpoint no detalla capacidades concretas y remite a la del modelo base.
- Entrada imagen-texto: el pipeline declarado es image-text-to-text y la torre de vision se conserva en bfloat16, por lo que el checkpoint sigue siendo un modelo vision-lenguaje.
- Modulos de audio: se conservan en bfloat16 en la receta, aunque no se documenta su comportamiento en este checkpoint.
- Tool calling / function calling: no documentado en la informacion disponible (el dataset de calibracion incluye turnos de codigo y funciones, pero eso no equivale a una capacidad declarada).
- Agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o decodificacion especulativa: no documentado en la informacion disponible.

## Casos de uso

- Despliegue de un modelo vision-lenguaje en GPUs Ampere con VRAM limitada: el checkpoint reduce el peso de ~60 GB en bfloat16 a 33,7 GB, lo que permite servir el modelo en configuraciones de 40-80 GB donde el base en bfloat16 no cabria con margen.
- Inferencia con contexto largo abaratada por la cache KV en FP8 E4M3: la cuantizacion de la cache reduce la memoria dedicada a KV en cada capa, util en sesiones multi-turno extensas con las 50 capas de ventana deslizante y las 10 de atencion completa.
- Asistencia a la programacion: el conjunto de calibracion esta compuesto por codigo en Python, TypeScript, Go y shell, por lo que el checkpoint esta ajustado a ese dominio, lo que lo hace candidato para completado y edicion de codigo en esos lenguajes.
- Analisis de capturas, diagramas o documentos con texto incrustado: al preservar la torre de vision en bfloat16, admite entradas de imagen junto a texto para tareas de comprension documental.
- Flotas heterogeneas con A100, A10, L4 o L40S: el formato compressed-tensors se autodetecta desde config.json en vLLM, lo que simplifica la distribucion del mismo checkpoint entre nodos SM8x.
- Reproduccion y auditoria de cuantizacion: el repositorio incluye recipe.yaml y los parches, lo que permite reproducir la cuantizacion con llm-compressor en lugar de confiar en el artefacto publicado.
- Evaluacion comparativa de W8A16 + KV FP8 frente a bfloat16: util para medir el impacto de la cuantizacion en un pipeline propio, dado que el autor no publica deltas de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publica ninguna diferencia de precision frente al base en bfloat16 para este checkpoint, y remite a la model card de google/gemma-4-31B-it para benchmarks del modelo base.

## Requisitos de hardware

- Peso en disco y en VRAM de los pesos: 33,7 GB en 17 shards.
- VRAM estimada para inferencia: por encima de los 33,7 GB de pesos hay que sumar cache KV en FP8, activaciones bfloat16 y overhead de vLLM. Con una A100 de 40 GB el margen es muy ajustado; A100 80 GB, H100 80 GB o similares son configuraciones holgadas. Estas cifras son estimaciones a partir del tamano del repositorio, no datos publicados.
- GPU compatibles: SM8x (Ampere: A100, A10, L4, L40S) requiere el parche de FlashInfer y la imagen preparada. SM90 (H100) y SM100+ (Blackwell) no necesitan parche; en SM100 o superior vLLM estandar sirve el checkpoint tal cual.
- GPU de consumo: no cabe en una RTX 4090 o RTX 3090 de 24 GB con este formato, y no se publica ninguna variante GGUF para CPU o llama.cpp.
- Opciones de despliegue: vLLM 0.29.0 con backend FLASHINFER, activando --dtype bfloat16, --kv-cache-dtype fp8 y --attention-config '{"use_trtllm_attention": false}'. Imagen preconstruida en zankich/vllm-openai:0.29.0-fp8kv-sm86 (Docker Hub). Para Ollama, llama.cpp o TGI no hay informacion disponible.
- Latencia y throughput: no disponible.

Ejemplo de arranque publicado por el autor:

```bash
docker run -d --gpus all -p 8000:8000 \
  -v /path/to/gemma-4-31B-it-W8A16-FP8KV:/models/gemma-4-31B-it-W8A16-FP8KV:ro \
  zankich/vllm-openai:0.29.0-fp8kv-sm86 \
  /models/gemma-4-31B-it-W8A16-FP8KV \
  --dtype bfloat16 \
  --kv-cache-dtype fp8 \
  --attention-backend FLASHINFER \
  --attention-config '{"use_trtllm_attention": false}'
```

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Pesos | Cache KV | Licencia | Notas |
|---|---|---|---|---|---|---|
| zankich/gemma-4-31B-it-W8A16-FP8KV | compressed-tensors pack-quantized, safetensors | 33,7 GB | INT8, W8A16, GPTQ group size 128 | FP8 E4M3 calibrada | apache-2.0 (link a licencia Gemma 4) | Requiere parche FlashInfer en Ampere |
| google/gemma-4-31B-it (base) | safetensors | ~60 GB segun la model card del quant | bfloat16 | bfloat16 | licencia Gemma 4 | Referencia de precision y capacidades |
| Otras cuantizaciones comunitarias del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible | No se documentan alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Nunca servir este checkpoint con cache KV en bfloat16. No falla al arrancar, pero corrompe la generacion de forma silenciosa: la salida greedy degenera en texto CJK, fallan las pruebas estructuradas y el servidor sigue reportando estado saludable. Las escalas FP8 calibradas forman parte del contrato del checkpoint, no son una opcion de ajuste.
- En GPUs anteriores a SM100 es obligatorio el parche flashinfer-fp8-sm8-largehead.patch junto con las lineas de FlashInfer correspondientes. Sin el, vLLM muere en tiempo de compilacion JIT del kernel de atencion, ya que la ruta por defecto selecciona una variante trtllm-gen solo para SM100+.
- Dependencia estricta de vLLM 0.29.0; el autor solo valida esa version.
- No hay benchmark de precision publicado ni delta frente al base en bfloat16, por lo que el impacto de la cuantizacion es desconocido.
- El conjunto de calibracion es privado y no se publica, y esta sesgado hacia codigo (Python, TypeScript, Go, shell), lo que puede degradar el comportamiento en dominios alejados de ese material.
- Discrepancia de nomenclatura: el identificador indica 31B, mientras que los metadatos de safetensors declaran 9.536.844.252 parametros.
- Ambiguedad de licencia: las etiquetas indican apache-2.0, pero el license_link apunta a la licencia de Gemma 4. Conviene verificar las condiciones de uso comercial antes de desplegarlo en produccion.
- Idiomas soportados sin documentar.
- La torre de vision, los modulos de audio y los embeddings no estan cuantizados, por lo que parte del ahorro de memoria es menor de lo que sugeriria la sola cifra de pesos INT8.
- No hay variantes GGUF ni soporte documentado en llama.cpp, Ollama o TGI, lo que limita el despliegue en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zankich/gemma-4-31B-it-W8A16-FP8KV
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Imagen Docker del autor: https://hub.docker.com/r/zankich/vllm-openai/tags/0.29.0-fp8kv-sm86
- Receta de cuantizacion: recipe.yaml (dentro del repositorio del modelo)
- Parche de FlashInfer: flashinfer-fp8-sm8-largehead.patch (dentro del repositorio del modelo)
