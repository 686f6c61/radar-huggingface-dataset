# tensorninja2/Qwen3.8-27B-NInfer

## Resumen

Qwen3.8-27B-NInfer es una conversión del checkpoint multimodal Qwen3.8-27B (27.000 millones de parámetros) al formato nativo `.ninfer` del motor de inferencia NInfer-4090, un runtime en C++/CUDA optimizado para ejecutar el modelo completo en una única NVIDIA RTX 4090. Lo publica el usuario tensorninja2 y se apoya en dos modelos base: el Qwen3.8-27B original de Qwen y un drafter DFlash2 de z-lab para decodificación especulativa. No es un checkpoint de Transformers ni un GGUF: solo funciona con NInfer.

El artefacto principal ocupa 16,96 GiB y aplica cuantización groupwise con asignación mixta Q4/Q5/Q6 en el cuerpo de texto y W8G32_F16S en el embedding y la cabeza de salida, además de incluir los objetos de visión, MTP, tokenizer y chat template. La receta `qwen3_8_27b-v2` mejora la versión anterior `v1` mediante cuantización ponderada por importancia: prueba 43 escalas candidatas por grupo y elige la de menor error de reconstrucción, calibrando con unas 524.000 tokens de razonamiento, código, chat y uso de herramientas.

Su relevancia práctica es que permite servir un modelo multimodal de 27B con contexto de hasta 262.144 tokens en hardware de consumo (una RTX 4090), con velocidades de decodificación de 148,6 tok/s usando MTP3 y decodificación especulativa DFlash 2. La licencia Apache 2.0 facilita el uso comercial, aunque la dependencia de un motor propietario y de una GPU concreta limita la portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con MTP y soporte de drafter DFlash 2; detalles internos no disponibles |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (configuración de servidor `--max-context 262144`) |
| Tipos de cuantizacion | Groupwise mixto Q4/Q5/Q6 en cuerpo de texto; W8G32_F16S en embedding y cabeza de salida; KV cache en `rk4v4` o `int8` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor versión 2, solo NInfer; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 27B parámetros de la familia Qwen3.8, con torre de visión integrada y capacidad image-text-to-text. La conversión conserva los objetos de Vision, MTP (multi-token prediction) y proposal-head, e incluye opcionalmente 66 tensores adicionales del drafter DFlash 2 para decodificación especulativa. El motor NInfer aplica CUDA Graphs y soporta KV cache con cuantización `rk4v4` o `int8`.

El proceso de cuantización es la innovación técnica destacable: en lugar de fijar la escala de cada grupo de 32 o 64 pesos al mayor valor absoluto (receta `v1`), la receta `v2` prueba 43 escalas candidatas por grupo y selecciona la de menor error de reconstrucción ponderado por la activación de cada columna de entrada. Las estadísticas de activación provienen de aproximadamente 524.000 tokens de razonamiento, código, chat y uso agéntico de herramientas. No se dispone de información sobre el dataset de preentrenamiento original, el número de tokens de entrenamiento ni las fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y matemáticas (la calibración incluye dominios de reasoning y code).
- Generación de código, con decodificación medida específicamente en carga de trabajo de código.
- Comprensión de imágenes (pipeline image-text-to-text, torre de visión incluida; modo dinámico que mantiene los pesos del encoder en RAM de host).
- Tool calling y uso agéntico: el artefacto se calibró con texto de agentic tool-use y reporta métricas específicas para ese dominio.
- Decodificación especulativa con MTP (3 tokens de borrador) y con DFlash 2 (7 tokens de borrador).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia conversacional de largo contexto: con 262.144 tokens de ventana puede mantener hilos de conversación extensos o procesar documentos completos sin truncar, adecuado para atención al cliente con historial prolongado.
- Generación de código en producción: la decodificación a 148,6 tok/s en código con MTP3 y una aceptación de borrador del 81,0% lo hace viable para autocompletado y generación en editores o pipelines de CI/CD.
- Agentes con tool calling: la calibración específica en uso agéntico de herramientas (top-1 del 90,05% frente al BF16) lo orienta a flujos de agente con llamadas a funciones y razonamiento multi-paso.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con texto largo en una sola petición.
- Procesamiento por lotes de prompts largos: el prefill de 4.080 tok/s con 118.242 tokens permite ingerir corpus grandes en una sola pasada en una RTX 4090.
- Servicio multi-stream en una GPU: con 3 streams concurrentes alcanza 299 tok/s agregados, útil para servir varios usuarios ligeros en un único nodo de consumo.
- Razonamiento y análisis técnico: el dominio de reasoning muestra top-1 del 96,62% frente al BF16, adecuado para tareas de análisis que requieren coherencia con el modelo original.

## Benchmarks y rendimiento

Métricas de fidelidad respecto al checkpoint BF16 sobre 98.304 tokens no vistos en calibración (RTX 4090):

| Dominio | KLD `v1` | KLD este fichero | Top-1 `v1` | Top-1 este fichero |
|---|---:|---:|---:|---:|
| Uso agéntico de herramientas | 0,710 | 0,531 | 87,87% | 90,05% |
| Chat | 0,071 | 0,046 | 93,97% | 95,24% |
| Código | 0,032 | 0,022 | 94,51% | 95,63% |
| Razonamiento | 0,033 | 0,022 | 95,82% | 96,62% |
| Global | 0,212 | 0,155 | 93,04% | 94,38% |

Rendimiento en una RTX 4090 a 480 W con CUDA Graphs:

| Carga de trabajo | Resultado | Modo KV |
|---|---:|---|
| Prefill, prompt de 4.795 tokens | 5.989 tok/s | `rk4v4` |
| Prefill, prompt de 18.969 tokens | 5.884 tok/s | `rk4v4` |
| Prefill, prompt de 118.242 tokens | 4.080 tok/s | `rk4v4` |
| Decode, código, MTP con 3 borradores | 148,6 tok/s con 81,0% de aceptación | `int8` |
| Decode, 3 streams concurrentes, MTP3, prompts de 8K | 299 tok/s agregados | no registrado |
| Decode, corpus mixto, DFlash 2 con 7 borradores | 137,2 tok/s (frente a 114,1 con MTP3) | `rk4v4` |
| Decode, sin especulación | 50,5 tok/s superficial, 39,6 tok/s a 128K de profundidad | `int8` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: NVIDIA GeForce RTX 4090 (`sm_89`) exclusivamente; el motor no soporta otras arquitecturas según la información disponible.
- VRAM: el artefacto principal pesa 16,96 GiB y el de DFlash 2, 18,09 GiB; debe caber junto con la KV cache en los 24 GB de la RTX 4090.
- Sistema operativo: Linux de 64 bits.
- CUDA Toolkit 12.8 o superior.
- Motor: NInfer-4090 compilado desde fuente o su imagen Docker; el modelo no funciona con vLLM, llama.cpp, Ollama ni TGI.
- Despliegue: `ninfer-serve` con flags como `--max-context 262144 --kv-capacity 262144 --kv-dtype rk4v4 --spec mtp --draft-tokens 3 --lm-head-draft`; modo visión dinámico por defecto u `--vision off`.
- Throughput y latencia: ver tabla de benchmarks (hasta 5.989 tok/s de prefill y 148,6 tok/s de decode en código).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-27B-NInfer (este) | 27B | 262.144 | `.ninfer` | Apache 2.0 | RTX 4090 |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | safetensors BF16 | no disponible | GPU con VRAM suficiente para BF16 |
| z-lab/Qwen3.8-27B-DFlash2 | 27B + drafter | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total de NInfer-4090: el fichero no es un checkpoint de Transformers, ni safetensors, ni GGUF, y no se puede cargar en otros runtimes.
- Hardware restringido a una RTX 4090 (`sm_89`) y Linux de 64 bits con CUDA 12.8 o superior; no hay soporte documentado para otras GPU.
- La cuantización introduce divergencia respecto al BF16: KLD global de 0,155 y top-1 del 94,38%; el dominio de uso agéntico es el más afectado (KLD 0,531, top-1 90,05%).
- La fila de uso agéntico tiene la mayor incertidumbre porque su texto de validación proviene de una sola trayectoria.
- No se han publicado datos sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la información disponible.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del drafter DFlash2 antes de uso comercial.
- El modo de visión dinámico mantiene el encoder en RAM de host, lo que puede añadir latencia en la codificación de imágenes.
- El repositorio tiene 1 like y 1.722 descargas, lo que indica una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensorninja2/Qwen3.8-27B-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor NInfer-4090: https://github.com/tensorninja/ninfer-4090
- Proyecto NInfer upstream: https://github.com/Neroued/ninfer
- Referencia CLI de NInfer-4090: https://github.com/tensorninja/ninfer-4090/blob/tensorninja/docs/cli.md
- README de NInfer-4090: https://github.com/tensorninja/ninfer-4090#run-it
- Modelo de desarrollo de decisión: https://huggingface.co/tensorninja2/qwen3.8-27b-decision-1
- Manifiesto del artefacto: https://huggingface.co/tensorninja2/Qwen3.8-27B-NInfer/blob/main/artifact-manifest.json
- Manifiesto DFlash 2: https://huggingface.co/tensorninja2/Qwen3.8-27B-NInfer/blob/main/artifact-manifest.dflash2.json
