# zarko1321/bitsy-500m

## Resumen

`zarko1321/bitsy-500m` es un repositorio publicado en Hugging Face por el usuario zarko1321 (Žarko Petrović) que contiene el codigo de entrenamiento de un modelo de lenguaje decoder-only de aproximadamente 505 millones de parametros, denominado internamente "Eather-500M" en la model card. No se trata de un modelo con pesos preentrenados: el autor indica explicitamente que los pesos se inicializan de forma aleatoria y que el paquete descargable es codigo de entrenamiento, no un chatbot funcional. El repositorio tiene un tamano de 0.0 GB, lo que es coherente con esa afirmacion.

El modelo emplea una arquitectura transformer clasica con 26 bloques, anchura oculta de 1280, atencion con GQA (20 cabezas de query y 5 de key/value), SwiGLU con anchura intermedia de 3584, RoPE, RMSNorm y pesos de embedding/output atados. El vocabulario es un BPE byte-level de 32.000 tokens y el contexto inicial es de 2.048 tokens, ampliable solo mediante entrenamiento adicional.

Su relevancia es fundamentalmente educativa: se presenta como una pila de referencia completa que cubre entrenamiento de tokenizer, conversion de dataset, preentrenamiento desde cero, SFT de chat e inferencia, con soporte para PyTorch y ROCm en GPUs AMD. No compite con modelos preentrenados de su tamano en capacidades, y el propio autor advierte que no es una infraestructura de entrenamiento distribuido de escala de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (26 bloques, 1280 de anchura oculta, GQA 20/5, SwiGLU 3584, RoPE, RMSNorm, atencion causal Flash/SDPA) |
| Parametros totales | ~505 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens iniciales (la extension requiere entrenamiento adicional) |
| Tipos de cuantizacion | no disponible (el autor indica que no incluye exportaciones ni cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch `.pt` (no se distribuyen pesos entrenados; el repo contiene codigo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con 26 bloques. Cada bloque usa atencion causal con 20 cabezas de query y 5 de key/value (GQA, ratio 4:1), lo que reduce el coste de memoria del KV cache frente a atencion multi-cabeza completa. La MLP es SwiGLU con anchura intermedia de 3584, se aplica RoPE para codificacion posicional y RMSNorm para normalizacion. El vocabulario es un BPE byte-level de 32.000 tokens y los pesos de embedding y de la capa de salida estan atados. La implementacion es en PyTorch puro y es compatible con builds ROCm para GPUs AMD.

El pipeline de entrenamiento es secuencial y manual: (1) entrenamiento del tokenizer con `tokenizer_train.py` sobre ficheros `.txt` en `data/raw/`; (2) pre-tokenizacion con `prepare.py`, que genera `train.bin` (IDs uint32) y `mask.bin` (mascara de perdida uint8) leyendo el corpus por trozos; (3) preentrenamiento desde cero con `train.py`, con gradient checkpointing activado por defecto y calculo de tokens efectivos por actualizacion como `seq-len * batch-size * grad-accum`; (4) SFT de chat con `--fine-tune` y `--resume` desde un checkpoint de preentrenamiento, enmascarando los tokens de usuario y sistema y aplicando perdida solo a los tokens del asistente y al token de fin de turno. El autor no publica numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO; de hecho, advierte que los 20.000 pasos de ejemplo no garantizan un modelo inteligente. No se mencionan innovaciones como decodificacion especulativa o atencion linear; el proyecto carece de KV caching, packing-aware attention, curvas de validacion/perplejidad, entrenamiento distribuido y exportaciones.

## Capacidades

- Generacion de texto autoregresiva basica una vez entrenado el modelo con datos propios.
- SFT de chat con formato de mensajes `user`/`assistant` mediante ficheros JSONL.
- Soporte de mascara de perdida para entrenar solo sobre turnos del asistente.
- Compatibilidad con PyTorch y builds ROCm (probado en AMD RX 7800 XT segun la model card).
- No incluye tool calling ni function calling.
- No incluye capacidades de agente ni razonamiento multi-paso.
- No incluye vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles (dependen del corpus que aporte el usuario).
- No incluye KV caching ni decodificacion optimizada en la implementacion de referencia.

## Casos de uso

- Formacion y docencia en entrenamiento de LLM: el repositorio permite recorrer de principio a fin el ciclo tokenizer, preentrenamiento, SFT e inferencia con un modelo de 505M en una sola GPU, lo que lo hace adecuado para cursos y talleres practicos.
- Experimentacion con arquitecturas tipo Llama: al usar GQA, SwiGLU, RoPE y RMSNorm, sirve como banco de pruebas para estudiar el efecto de variar anchura, numero de cabezas o vocabulario sin depender de pesos preentrenados.
- Validacion de entornos ROCm: el autor documenta el flujo en una AMD RX 7800 XT, por lo que es util para verificar que una instalacion de PyTorch con ROCm funciona antes de abordar proyectos mayores.
- Creacion de modelos de dominio pequenos: un equipo puede entrenar desde cero un modelo de ~500M sobre un corpus especializado (por ejemplo, documentacion interna o texto juridico) y desplegarlo para tareas acotadas de generacion.
- Prototipado de pipelines de datos: `prepare.py` y el formato `train.bin`/`mask.bin` sirven para ensayar estrategias de tokenizacion, enmascarado y streaming de corpus sin mantener todo el dataset en RAM.
- Investigacion sobre SFT y enmascarado de perdida: el formato JSONL y el enmascarado de tokens de usuario permiten estudiar como afecta la seleccion de tokens objetivo al comportamiento conversacional en modelos pequenos.
- Base para comparativas de eficiencia: al ser un modelo denso de 505M con contexto de 2.048, puede usarse como referencia de coste de entrenamiento e inferencia frente a alternativas del mismo orden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K ni metricas de perplejidad, y advierte que el modelo descargado no esta entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~505M en precision FP16 el peso ronda 1 GB, y en FP32 unos 2 GB, sin contar activaciones ni KV cache (el proyecto no implementa KV caching).
- VRAM estimada para entrenamiento: la model card indica que en 16 GB de VRAM se empiece de forma conservadora con longitud de secuencia 128-256 y microbatch 1, con gradient checkpointing activado.
- GPU recomendadas: el autor documenta el flujo en una AMD RX 7800 XT con ROCm; no se especifican GPUs NVIDIA concretas, aunque cualquier GPU con suficiente VRAM y un build de PyTorch adecuado deberia poder ejecutar el codigo.
- Cabe en GPU de consumo: si, segun la propia model card (16 GB de VRAM como referencia de entrenamiento).
- Opciones de despliegue: el proyecto solo incluye scripts propios (`train.py`, `generate.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el autor indica que no incluye exportaciones ni cuantizacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos preentrenados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zarko1321/bitsy-500m | ~505M | 2.048 | No (codigo de entrenamiento) | no disponible | Hugging Face |
| zarko1321/bitsy2 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas preentrenadas de ~500M (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | ~360-500M | 4K-32K | Si | Apache-2.0 (segun sus model cards) | Hugging Face |

La comparacion directa no es posible en terminos de rendimiento porque `bitsy-500m` no publica benchmarks ni pesos entrenados. Frente a modelos preentrenados del mismo orden, la diferencia clave es que aqui el valor esta en el codigo y el pipeline, no en las capacidades del modelo resultante.

## Limitaciones y advertencias

- Los pesos se inicializan de forma aleatoria: el repositorio es codigo, no un chatbot entrenado. Sin un corpus sustancial y compute, el modelo no produce salidas utiles.
- Un modelo de 500M es pequeno para codigo avanzado; el autor recomienda empezar con preentrenamiento de texto amplio y luego curar ejemplos de Python/Luau e instrucciones.
- No incluye KV caching, packing-aware attention, curvas de validacion/perplejidad, entrenamiento distribuido, cuantizacion ni exportaciones de modelo.
- Aumentar `max_seq_len` por si solo no proporciona contexto largo fiable; se requiere entrenamiento y evaluacion adicionales.
- El pipeline de SFT concatena conversaciones y puede muestrear a traves de limites entre ellas si no se separan con claridad.
- El entrenamiento del tokenizer requiere suficiente texto para alcanzar los 32.000 tokens; con datos de juguete hay que reducir `--vocab-size` y `config.json` `vocab_size` de forma coherente.
- Los checkpoints del optimizador son grandes y el entrenamiento en 16 GB de VRAM exige ajustes conservadores.
- Solo se debe entrenar con material sobre el que se tengan derechos de uso.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido.
- Sesgos y riesgo de alucinacion: no evaluados ni documentados; dependen enteramente de los datos que aporte el usuario.
- Idiomas soportados: no disponibles; dependen del corpus de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zarko1321/bitsy-500m
- Perfil del autor: https://huggingface.co/zarko1321
- Repositorio relacionado `bitsy2`: https://huggingface.co/zarko1321/bitsy2
