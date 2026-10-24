# yujiepan/glm-5.3-flash-tiny-random

## Resumen

`yujiepan/glm-5.3-flash-tiny-random` es un checkpoint de depuración de 112.077.168 parámetros publicado por el usuario yujiepan. No es un modelo entrenado: sus pesos se inicializan de forma aleatoria (`set_seed(42)`) a partir de una configuración derivada de `zai-org/GLM-5.3-Flash`, y su propia model card lo describe explícitamente como "intended for debugging". El repositorio ocupa 0,2 GB y contiene un único `model.safetensors` de 207,31 MB.

Su interés es estructural: reproduce la arquitectura GLM5-Next del modelo original —atención lineal KDA combinada con atención dispersa DSA, mezcla de expertos con 32 expertos enrutados y 1 compartido, Hyper-Connections y una capa MTP para decodificación especulativa— con dimensiones reducidas (8 capas de texto, hidden size 128, 128 dimensiones de salida visual). Esto permite validar rutas de carga, kernels FP8 y el pipeline multimodal sin mover los 328,34 GB del checkpoint completo.

El modelo de referencia, GLM-5.3-Flash de Z.ai, es un MoE de 320.000 millones de parámetros con 18.000 millones activos por token, ventana de 1.000.000 de tokens, modalidades texto/imagen/vídeo y un corpus de preentrenamiento multimodal de 30 billones de tokens según su documentación pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLM5-Next: transformer híbrido con atención lineal KDA y atención dispersa DSA (tres capas KDA por cada capa DSA), MoE, Hyper-Connections (mHC) y capa MTP |
| Parámetros totales | 112.077.168 (112,09 M, incluidos 16,70 K elementos de escala FP32) |
| Parámetros activos | MoE con 8 de 32 expertos enrutados + 1 experto compartido por token; cifra exacta de parámetros activos no disponible |
| Longitud de contexto | No disponible para el checkpoint tiny; el modelo origen declara 1.000.000 de tokens y el ejemplo de vLLM fija `--max-model-len 4096` |
| Tipos de cuantización | FP8 E4M3 con bloques 32×32 en ejes reducidos, más escalas FP32; pesos también en BF16 |
| Idiomas soportados | No disponible (tokenizer y processor copiados sin cambios del modelo origen; 154.880 filas de vocabulario) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`, 207,31 MB) en precisión mixta BF16 + FP8 E4M3 + escalas FP32 |
| Capas de texto | 8 (dos ciclos completos de tres KDA + DSA; el origen tiene 45) |
| Dimensión oculta de texto | 128 (origen: 4.096) |
| Cabezas KDA | 64 cabezas, dimensión de cabeza 128 |
| Cabezas DSA | 64 cabezas, NoPE 32, dimensión de valor 256, `kv_lora_rank` 256, `q_lora_rank` 128 |
| Indexer | 32 cabezas, dimensión 128, top-k 128, `index_kpool` 4 |
| Expertos | 32 enrutados, `moe_intermediate_size` 128, 1 compartido |
| Visión | Profundidad 2, hidden 128, salida 128 (origen: 24 / 1.024 / 4.096) |
| Vocabulario | 154.880 filas, embeddings no atados |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El checkpoint replica el grafo GLM5-Next con dimensiones mínimas ejecutables. Cada bloque de texto alterna tres capas de atención lineal KDA (64 cabezas de dimensión 128) con una capa DSA de atención dispersa: 64 cabezas, `qk_nope_head_dim` 32, `qk_rope_head_dim` 0 y `v_head_dim` 256, manteniendo el `kv_lora_rank` de 256 que exige el kernel FA3 de MQA dispersa. El índice de dispersión usa 32 cabezas de 128 dimensiones con top-k 128 y un pool de 4, dependiente del kernel Hadamard-128 de vLLM. La mezcla de expertos enruta 8 de 32 expertos más uno compartido, con `first_k_dense_replace=3`.

Las cabezas KDA y del indexer se mantienen a 128 de ancho porque los kernels de vLLM para GLM5-Next las requieren a nivel de ABI; por eso el ancho residual probado de 128 es la opción mínima ejecutable para la combinación checkpoint/backend/TP documentada (un candidato de 32 fue rechazado por `input_size_per_partition = 8 is not divisible by weight quantization block_k = 32`, y uno de 64 particionaría a 16). Se conserva el formato E4M3 original con bloques reducidos de 32×32. La capa MTP es una única capa DSA/MoE con embedding y cabeza compartidos.

No hay entrenamiento: los pesos son aleatorios. No se aplicó RLHF, DPO ni ajuste alguno, y no se declaran tokens de entrenamiento. El tokenizer, el processor, la plantilla de chat y los assets de generación se copian sin modificar de la revisión fijada `46a050bec13002ad29ee795c16e61cf4fa3c4a9c` del modelo origen.

## Capacidades

- Generación de texto autoregresiva: el grafo la soporta y el ejemplo de Transformers ejecuta `model.generate`, pero con pesos aleatorios la salida es incoherente y no tiene valor semántico.
- Entrada multimodal: el pipeline acepta imagen, vídeo y texto en un mismo turno; el ejemplo verificado procesa una imagen RGB de 28×28 y un vídeo de 4 fotogramas con `VideoMetadata(total_num_frames=4, fps=2)`.
- Decodificación especulativa MTP: configurable en vLLM mediante `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Tool calling / function calling: no disponible; no se documenta en la model card.
- Agentes y razonamiento multi-paso: no disponible; sin pesos entrenados no hay capacidad funcional que evaluar.
- Multilingüismo: el vocabulario de 154.880 entradas se hereda del modelo origen, pero no se declaran idiomas soportados.
- Modo thinking, audio u otras modalidades: no disponible (las modalidades declaradas son texto, imagen y vídeo).
- Compatibilidad de endpoints: el tag `endpoints_compatible` indica que el repo puede servirse mediante la infraestructura de Inference Endpoints.

## Casos de uso

- Pruebas de humo de despliegue en vLLM: permite comprobar en minutos que los kernels KDA, el indexer Hadamard-128 y el block-FP8 GEMM de Triton cargan y ejecutan con `--tensor-parallel-size 4` antes de lanzar el checkpoint de 328 GB.
- Validación de integración en CI/CD: al pesar 207 MB, se puede incluir en un pipeline de integración continua que verifique en cada actualización de `transformers` o de vLLM que la ruta `AutoModelForImageTextToText` + `allow_all_hub_kernels()` sigue funcionando.
- Verificación de la plantilla de chat y del processor multimodal: sirve para comprobar el formateo de mensajes con bloques `image`, `video` y `text`, y que `apply_chat_template` devuelve tensores con las claves esperadas.
- Pruebas de decodificación especulativa: valida el cableado del MTP y la aceptación de tokens especulativos con `num_speculative_tokens=1` sin necesidad de GPUs de 80 GB.
- Calibración de configuraciones de memoria y batching: útil para ajustar `--gpu-memory-utilization`, `--max-num-batched-tokens`, `--max-num-seqs` y `cudagraph_capture_sizes` en un clúster multi-GPU antes de mover el modelo grande.
- Docencia y divulgación sobre arquitecturas híbridas: al tener solo 8 capas y 128 de dimensión oculta, se puede inspeccionar capa a capa la alternancia KDA/DSA, las Hyper-Connections y el enrutado de expertos con recursos mínimos.
- Pruebas de cuantización: el checkpoint conserva bloques FP8 E4M3 de 32×32 con escalas FP32, lo que permite validar herramientas de conversión y dequantización sobre un fichero pequeño.
- Desarrollo de harness de evaluación: punto de partida para probar pipelines de evaluación que luego se apuntan al modelo real, verificando que las métricas devuelven valores degenerados con pesos aleatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor no reporta métricas, y al tratarse de un modelo con inicialización aleatoria cualquier medida de calidad (MMLU, HumanEval, GSM8K) sería degenerada y no informativa. Tampoco se incluyen cifras de benchmarks del modelo origen `zai-org/GLM-5.3-Flash` en la información proporcionada.

## Requisitos de hardware

- Pesos: 207,31 MB en el formato FP8 con escalas; en BF16 equivalen a unos 224 MB (112,08 M × 2 bytes), estimación aritmética.
- Inferencia con Transformers: una sola GPU CUDA basta; el ejemplo verificado usa `dtype=torch.bfloat16` y `attn_implementation="sdpa"`. Cabe en cualquier GPU consumer con 2 GB o más de VRAM (estimación; el autor no publica cifras de VRAM).
- Inferencia con vLLM: el ejemplo verificado emplea `--tensor-parallel-size 4`, es decir, 4 GPU. La topología de 64 cabezas KDA/DSA (16 por rango en TP=4) y los kernels Hadamard-128 imponen esa partición, y el ancho residual de 128 es el mínimo ejecutable para esta combinación.
- Memoria en vLLM: `--gpu-memory-utilization 0.3` con `--max-model-len 4096`, `--max-num-batched-tokens 512` y `--max-num-seqs 4`; el consumo real por GPU no se detalla.
- Backend de kernels: `--kernel-config '{"moe_backend":"triton","linear_backend":"triton"}'`; el autor indica que el kernel Humming automático de H20 exige un grupo de escala de salida de al menos 64, por lo que se selecciona el GEMM block-FP8 de Triton.
- Captura de CUDA graphs: `{"cudagraph_capture_sizes":[1,2,4,8]}`.
- Opciones de despliegue: vLLM (verificado) y Transformers (verificado). llama.cpp, Ollama y TGI no están documentados y el formato FP8 con bloques no es directamente convertible a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yujiepan/glm-5.3-flash-tiny-random` | 112,08 M totales; 8 de 32 expertos enrutados + 1 compartido por token | No disponible (el origen declara 1 M) | Texto, imagen, vídeo | No disponible | Hugging Face; 0 descargas, 0 likes |
| `zai-org/GLM-5.3-Flash` | 320 B totales; 18 B activos por token | 1.000.000 de tokens | Texto, imagen, vídeo | No disponible en la información consultada | Hugging Face, ModelScope y Modal |
| `yujiepan/glm-5-tiny-random` | No disponible (repo de 29,7 MB) | No disponible | Texto (`glm_moe_dsa`) | No disponible | Hugging Face |

La diferencia clave frente al modelo origen no es de tamaño sino de finalidad: `GLM-5.3-Flash` es un MoE multimodal de producción orientado a código y flujos agénticos, mientras que este checkpoint es un banco de pruebas estructural con el mismo esquema de pesos en miniatura.

## Limitaciones y advertencias

- Pesos aleatorios: no existe entrenamiento, por lo que la salida de texto es incoherente y no debe usarse para ninguna tarea de calidad, producción ni evaluación comparativa.
- Riesgo de alucinación total: el modelo genera tokens sin ninguna base estadística aprendida; cualquier afirmación que produzca es ruido.
- Licencia no disponible: no se puede asumir uso comercial permitido; el repo no declara licencia y el modelo base tampoco aparece con licencia explícita en la información consultada.
- Idiomas no declarados: el tokenizer se hereda del origen, pero no hay garantía de cobertura ni de comportamiento por idioma.
- Longitud de contexto no documentada para el checkpoint tiny; el valor de 1 M corresponde al modelo origen y no puede extrapolarse.
- Restricción de despliegue: con vLLM el ejemplo verificado exige TP=4 por requisitos de ABI de los kernels KDA e indexer Hadamard-128; no es un modelo que se sirva trivialmente en una sola GPU con ese backend.
- Dependencia de kernels remotos: el ejemplo de Transformers requiere `allow_all_hub_kernels()` para resolver el kernel FP8 oficial desde el Hub, lo que añade una dependencia de red y de versión.
- Inconsistencia en los ejemplos: los fragmentos de la model card usan el identificador `tiny-random/glm-5.3-flash` en lugar del ID real del repositorio, por lo que hay que sustituirlo al reproducirlos.
- Sesgos: no evaluables, al no haber datos de entrenamiento ni pesos aprendidos.
- Fechas: el repositorio se creó y actualizó el 24 de octubre de 2026, con 0 descargas y 0 likes; no hay evidencia de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujiepan/glm-5.3-flash-tiny-random
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint tiny previo del mismo autor: https://huggingface.co/yujiepan/glm-5-tiny-random
- README del checkpoint previo: https://huggingface.co/yujiepan/glm-5-tiny-random/blob/main/README.md
- Ficha de GLM-5.3-Flash en Modal: https://modal.com/library/zai/glm-5-3-flash
- Ficha de GLM-5.3-Flash en ModelScope: https://www.modelscope.ai/models/zai-org/GLM-5.3-Flash
- Página de chat de demostración: https://www.ninjachat.ai/models/glm-5-3-flash
