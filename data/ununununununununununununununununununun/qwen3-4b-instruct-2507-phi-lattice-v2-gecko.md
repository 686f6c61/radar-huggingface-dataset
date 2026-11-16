# ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2-gecko

## Resumen

`qwen3-4b-instruct-2507-phi-lattice-v2-gecko` es un archivo de pesos cuantizados a 4 bits del modelo `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `ununununununununununununununununununun` en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning con nuevos datos, sino de una compresión post-entrenamiento del checkpoint original de Qwen usando una técnica propietaria denominada "phi-lattice" en su variante "v2-gecko", con un tamaño de bloque de 64 y una métrica espectral con `alpha=0.5`.

El interés de esta ficha radica en que documenta un experimento de cuantización agresiva (4 bits empaquetados en nibbles `uint8` con escalas `fp16` por grupo) sobre un modelo denso de 4 mil millones de parámetros con arquitectura transformer y ventana de contexto de 262 144 tokens (según las especificaciones públicas de la familia Qwen3-4B-Instruct-2507). El resultado es un archivo de 2583,2 MiB que preserva embeddings y RMSNorms en `bfloat16` mientras comprime las 252 capas lineales de los 36 bloques del transformer.

La relevancia es doble: por un lado, ofrece una vía para ejecutar un modelo de 4B en GPUs de consumo con un footprint de VRAM notablemente reducido; por otro, los datos publicados en la model card muestran una degradación medible pero no catastrófica en perplejidad (de 12,17 a 14,05 en 6 textos de validación) y una pérdida notable en algunas tareas downstream (IFEval cae de 57,86 % a 45,47 % en la variante plain, con resultados de la variante gecko pendientes). Es, por tanto, un artefacto útil para experimentación, no un reemplazo directo del modelo base en producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), pesos cuantizados a 4 bits con escalas por grupo |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B-Instruct-2507); archivo empaquetado de 2583,2 MiB |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (según especificaciones del modelo base Qwen3-4B-Instruct-2507; no verificado en este archivo) |
| Tipos de cuantizacion | 4 bits empaquetado en nibbles `uint8` con escalas `fp16` por grupo (`group_size=64`); embeddings y RMSNorms en `bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` empaquetado propietario (`qwen3_4b_phi_gecko_v2_packed_4bit.pt`); requiere `phi_loader.py` para cargar en `transformers` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3, con 36 bloques y 252 capas lineales, según se detalla en la model card. El checkpoint original `Qwen/Qwen3-4B-Instruct-2507` es un modelo instructivo ajustado por Qwen (Alibaba) con datos de instrucciones y preferencias, aunque la model card de este repositorio no documenta la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se especifican los tokens de entrenamiento del modelo base.

La innovación técnica de este artefacto es el pipeline de cuantización "phi-lattice" en su variante "v2-gecko". Se trata de una compresión post-entrenamiento que empaqueta cada capa lineal como nibbles de 4 bits con escalas `fp16` por grupo de 64 elementos, manteniendo embeddings y normalizaciones en `bfloat16` para preservar estabilidad numérica. La carga se realiza mediante un script `phi_loader.py` que ofrece dos modos: `low_vram_4bit` (mantiene los nibbles empaquetados en memoria, ~2,58 GiB) y `unrolled_bf16` (descomprime a `nn.Linear` estándar en `bfloat16`). La model card reporta un 12,52 % de ceros exactos en los pesos lineales cuantizados, lo que sugiere una matriz con cierto grado de esparsidad estructural que la cuantización aprovecha parcialmente.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento multi-paso y matemáticas (el modelo base obtiene 85,90 % en GSM8K strict-match, según la tabla de la model card).
- Conocimiento general y respuesta a preguntas (73,21 % en MMLU en el modelo base BF16).
- Capacidad de seguir instrucciones complejas, aunque degradada por la cuantización (IFEval cae de 57,86 % a 45,47 % en la variante plain; gecko pendiente).
- Soporte de tool calling y function calling: no documentado explícitamente en esta model card, aunque el modelo base Qwen3-4B-Instruct-2507 lo soporta según las especificaciones públicas de Qwen.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking": no documentado en esta model card; el modelo base Qwen3-4B-Instruct-2507 es un modelo instructivo sin modo thinking explícito según la documentación pública de Qwen.
- Capacidades de visión o audio: no disponibles (modelo solo texto).

## Casos de uso

- **Experimentación con cuantización agresiva en GPUs de consumo**: el archivo empaquetado de 2,58 GiB permite cargar un modelo de 4B en GPUs con 4-6 GB de VRAM usando el modo `low_vram_4bit`, útil para investigadores que estudian el impacto de la compresión 4-bit en calidad downstream.
- **Prototipado rápido de asistentes conversacionales en local**: con el modo `low_vram_4bit` y una GPU RTX 3060 (12 GB) o superior, se puede desplegar un chatbot de instrucciones para pruebas de UX sin necesidad de infraestructura cloud.
- **Evaluación comparativa de técnicas de cuantización**: al publicar métricas de perplejidad y benchmarks frente al checkpoint BF16 y a la variante plain, sirve como referencia para comparar "phi-lattice v2-gecko" con otras técnicas (GPTQ, AWQ, bitsandbytes NF4) en el mismo modelo base.
- **Generación de código y matemáticas en entornos con restricciones de memoria**: aunque GSM8K flexible-extract cae drásticamente en la variante plain (17,59 %), el strict-match se mantiene en 83,93 %, lo que sugiere que el modelo aún puede resolver problemas matemáticos si se usa el formato de respuesta esperado; útil para pipelines de evaluación controlados.
- **Investigación sobre esparsidad y cuantización**: el 12,52 % de ceros exactos en los pesos cuantizados abre la puerta a estudiar técnicas híbridas de poda + cuantización sobre modelos Qwen3.
- **Despliegue en entornos edge con CPU**: el modo `unrolled_bf16` permite descomprimir a `bfloat16` estándar y ejecutar en CPU con `transformers`, aunque el rendimiento será mucho menor que en GPU; adecuado para pruebas de integración o demos offline.
- **Base para fine-tuning con QLoRA**: al ser un archivo empaquetado con loader propio, no es directamente compatible con `peft`/`bitsandbytes` sin descomprimir primero a `bfloat16`; sin embargo, el modo `unrolled_bf16` permite obtener un checkpoint estándar sobre el que aplicar QLoRA.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan el checkpoint BF16 base, la variante `phi-lattice v2` (control plain) y la variante `v2-gecko` (este repositorio). Los resultados de `v2-gecko` en benchmarks downstream están marcados como **pending** en la model card.

| Benchmark | BF16 base | `phi-lattice v2` (plain) | `v2-gecko` (este repo) |
|---|---:|---:|---:|
| Perplejidad (6 textos, BF16) | 12,17 | 14,72 | 14,05 |
| Weight SQNR vs BF16 | — | 19,63 dB | 19,25 dB |
| HellaSwag (`acc_norm`) | 69,05 % | 67,19 % | pending |
| MMLU (`acc`) | 73,21 % | 71,22 % | pending |
| GSM8K (`strict-match`) | 85,90 % | 83,93 % | pending |
| GSM8K (`flexible-extract`) | 83,85 % | 17,59 % | pending |
| IFEval (`prompt_level_strict_acc`) | 57,86 % | 45,47 % | pending |

No se han publicado resultados de benchmarks de `v2-gecko` en la información disponible. Los datos de `phi-lattice v2` (plain) muestran una degradación notable en GSM8K flexible-extract (de 83,85 % a 17,59 %) y en IFEval (de 57,86 % a 45,47 %), lo que sugiere que la cuantización 4-bit afecta especialmente a la robustez en formatos de respuesta y al seguimiento estricto de instrucciones.

## Requisitos de hardware

- **VRAM estimada en modo `low_vram_4bit`**: ~2,58 GiB para los pesos empaquetados, más overhead de activaciones y KV cache. Con contexto de 4 096 tokens y batch 1, se estima un uso total de 4-6 GB de VRAM.
- **VRAM estimada en modo `unrolled_bf16`**: ~8 GB para los pesos en `bfloat16` (4B parámetros × 2 bytes), más activaciones y KV cache; se recomienda 12-16 GB para contexto largo.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100. En modo `low_vram_4bit` cabe en GPUs de 6-8 GB (RTX 3050 8 GB, RTX 2060 6 GB con contexto corto).
- **¿Cabe en consumer GPU?**: sí, en modo `low_vram_4bit` cabe en GPUs de 6 GB o más; en modo `unrolled_bf16` requiere al menos 12 GB para contexto moderado.
- **Opciones de despliegue**: `transformers` con el script `phi_loader.py` proporcionado por el autor. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia, ya que el formato `.pt` empaquetado es propietario.
- **Latencia y throughput**: no disponibles en la información proporcionada. Al no haber kernels optimizados para el formato empaquetado, se espera que el modo `low_vram_4bit` requiera descompresión parcial en cada forward pass, con latencia superior a la de un modelo 4-bit nativo (GPTQ/AWQ) en vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `qwen3-4b-instruct-2507-phi-lattice-v2-gecko` (este) | 4B (4-bit empaquetado) | 262 144 (base) | Apache 2.0 | `.pt` propietario + loader | Cuantización phi-lattice v2-gecko; benchmarks downstream pending |
| `Qwen/Qwen3-4B-Instruct-2507` (BF16) | 4B | 262 144 | Apache 2.0 | safetensors | Modelo base sin comprimir; referencia de calidad |
| `Qwen/Qwen3-4B-Instruct-2507` en GPTQ/AWQ (si existe) | 4B (4-bit) | 262 144 | Apache 2.0 | safetensors | Cuantización estándar con soporte en vLLM/TGI; no verificado en la información disponible |
| `meta-llama/Llama-3.2-3B-Instruct` | 3B | 131 072 | Llama 3.2 Community License | safetensors | Alternativa de tamaño similar; contexto menor y licencia más restrictiva |

No se dispone de datos de benchmarks de `v2-gecko` para una comparación cuantitativa con alternativas. La comparación con GPTQ/AWQ del mismo modelo base sería la más relevante, pero no se ha verificado su existencia ni sus métricas en la información disponible.

## Limitaciones y advertencias

- **Resultados downstream pendientes**: la model card marca como "pending" los benchmarks de HellaSwag, MMLU, GSM8K e IFEval para `v2-gecko`; no se puede afirmar que la variante gecko sea mejor o peor que la plain en tareas downstream sin esos datos.
- **Degradación en seguimiento de instrucciones**: la variante plain pierde 12,39 puntos en IFEval (de 57,86 % a 45,47 %), lo que sugiere que la cuantización 4-bit afecta al cumplimiento estricto de instrucciones. La variante gecko podría comportarse de forma similar o distinta; no hay datos.
- **Colapso en GSM8K flexible-extract**: la variante plain cae de 83,85 % a 17,59 % en esta métrica, lo que indica que el modelo cuantizado puede fallar al extraer respuestas en formatos no estrictos. Advertencia importante para pipelines de evaluación automatizada.
- **Formato propietario**: el archivo `.pt` empaquetado requiere el script `phi_loader.py` del autor; no es compatible con `vLLM`, `llama.cpp`, `Ollama` ni `TGI` sin conversión previa. Esto limita el despliegue en producción.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas. Aun así, se recomienda revisar los términos del modelo base y las condiciones de la técnica de cuantización (no documentadas en la model card).
- **Sesgos y alucinaciones**: no documentados en la model card. Al heredar el comportamiento del modelo base Qwen3-4B-Instruct-2507, se aplican los sesgos y riesgos de alucinación de este, que no se detallan en la información proporcionada.
- **Idiomas**: no disponibles en la model card; no se puede confirmar el soporte multilingüe del artefacto cuantizado.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- **Autor anónimo**: el nombre de usuario `ununununununununununununununununununun` no permite atribuir el trabajo a una organización conocida; se recomienda precaución antes de usar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2-gecko
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Documentación de Qwen3 (blog): https://qwenlm.github.io/blog/qwen3/
- Script de carga `phi_loader.py`: disponible en el propio repositorio de Hugging Face (archivo `phi_loader.py`)
- Archivo de pesos: `qwen3_4b_phi_gecko_v2_packed_4bit.pt` (2583,2 MiB, `sha256: 5e237f6674105537864f6499f0c61d2c9ae033d9ba30e9b733e564fc0093f789`)
