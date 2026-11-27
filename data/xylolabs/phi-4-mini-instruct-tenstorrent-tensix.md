# Xylolabs/Phi-4-mini-instruct-Tenstorrent-Tensix

## Resumen

Phi-4-mini-instruct-Tenstorrent-Tensix es una version cuantizada del modelo microsoft/Phi-4-mini-instruct, publicada por Xylolabs, especificamente empaquetada para su ejecucion sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila de software tt-metal y ttnn. No se trata de un modelo nuevo, sino de una redistribucion de pesos optimizada para hardware NPU de Tenstorrent, con formatos de bloque en coma flotante (block-floating-point) que reducen el peso del repositorio hasta los 3,444 GB empaquetados frente a los 8,9 GB del repositorio completo.

La innovacion principal reside en la cuantizacion mixta: las capas MLP se almacenan en bfloat4_b, las capas de atencion en bfloat8_b y el resto de pesos permanece en bf16. Esta combinacion busca preservar la calidad del modelo original reduciendo el ancho de banda de memoria, algo critico en aceleradores con jerarquias de memoria DRAM limitadas. El autor reporta una divergencia KL media de 0,0503 frente al modelo BF16 original, ligeramente inferior a la de una cuantizacion Q4_K_M de referencia (0,067), lo que sugiere una degradacion controlada.

El modelo hereda las capacidades del Phi-4-mini-instruct de Microsoft: generacion de texto, razonamiento, matematicas y codigo, con soporte para conversaciones multi-turno y una ventana de contexto que, segun la documentacion del adaptador, cruza los 4.096 tokens con reconstruccion de prefijo. La relevancia actual radica en que permite desplegar un modelo de la familia Phi-4 en hardware NPU alternativo a las GPU, un nicho en crecimiento para inferencia de bajo consumo y entornos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: microsoft/Phi-4-mini-instruct) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el adaptador reconstruye el prefijo al cruzar 4.096 tokens |
| Tipos de cuantizacion | bfloat4_b (MLP), bfloat8_b (atencion), bf16 (resto); block-floating-point |
| Idiomas soportados | en |
| Licencia | MIT (pesos); codigo adaptador Apache 2.0 |
| Formato de pesos | safetensors con empaquetado BFP4/BFP8 para Tensix |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Phi-4-mini de Microsoft, entrenado originalmente por Microsoft con datos que no se detallan en la informacion proporcionada. Xylolabs no ha reentrenado el modelo: ha aplicado un proceso de cuantizacion post-entrenamiento (GPTQ sobre formatos block-floating-point) para adaptar los pesos al formato nativo de los tensores Tensix. La cuantizacion es selectiva por tipo de capa: MLP en 4 bits de bloque, atencion en 8 bits de bloque y el resto en bf16.

La innovacion tecnica destacable es el adaptador `phi3_longrope_generation` con `install_prefix_rebuild`, que reconstruye el prefijo de la cache KV cuando la generacion cruza por primera vez los 4.096 tokens. Segun la model card, el modelo original emplea factores distintos para contexto corto y largo (Short y Long factors), y el adaptador gestiona esa transicion para mantener la coherencia en generacion cacheada de contexto largo. El repositorio incluye herramientas de empaquetado (`pack_tensix.py`) y verificacion (`verify_grid.py`) bajo licencia Apache 2.0.

## Capacidades

- Generacion de texto en ingles con plantilla de chat (`apply_chat_template`).
- Razonamiento y matematicas heredados del Phi-4-mini-instruct original.
- Generacion de codigo (capacidad del modelo base, no verificada de forma independiente en esta ficha).
- Conversaciones multi-turno con cache KV y reconstruccion de prefijo al superar 4.096 tokens.
- Ejecucion sobre NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn y tt-metal.
- Carga en Transformers 5.23.0 con `device_map="auto"` y dtype bfloat16 para el grafo circundante.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Inferencia en hardware Tenstorrent: el modelo esta empaquetado para ejecutarse en NPU Wormhole y Blackhole, lo que permite desplegar un LLM de la familia Phi-4 sin GPU NVIDIA, aprovechando la memoria DRAM del acelerador y el formato BFP nativo.
- Prototipado de pipelines ttnn: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar el empaquetado de matrices y la ida y vuelta de pesos, util para equipos que desarrollan kernels sobre Tensix.
- Servicios de chat de contexto medio: con la reconstruccion de prefijo a 4.096 tokens, es adecuado para asistentes conversacionales que mantienen historial moderado sin degradar la coherencia.
- Evaluacion de cuantizacion: la metrica de divergencia KL frente a BF16 y Q4_K_M sirve como referencia para comparar estrategias de cuantizacion en hardware NPU.
- Despliegue en entornos con restricciones de memoria: los 3,444 GB empaquetados reducen la huella frente a los 8,9 GB del repositorio completo, lo que facilita su alojamiento en nodos con DRAM limitada.
- Investigacion en eficiencia de inferencia: permite medir throughput y latencia de un transformer pequeno sobre Tensix y contrastarlo con implementaciones en GPU.
- Generacion de codigo y texto tecnico en ingles: al heredar el modelo base, puede usarse para autocompletado y asistencia en documentacion, siempre que se valide la calidad tras la cuantizacion.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). El autor reporta unicamente metricas de fidelidad de cuantizacion:

| Metrica | BFP4 (este modelo) | BF16 original | Q4_K_M referencia |
|---|---|---|---|
| Tamano empaquetado (GB) | 3,444 | no disponible | no disponible |
| Divergencia KL media | 0,05027 | 0 | 0,067 |
| Respuestas correctas (33 + 7) | 29/33 + 0/7 | 24/33 + 0/7 | 26/33 + 0/7 |

La metrica KL cubre 16.312 posiciones sobre 16 secuencias de referencia en ingles y coreano (raw y chat), con un limite de 1,5 veces la KL de Q4_K_M. El conjunto de verificacion de respuestas consta de 33 preguntas mas 7 adicionales; el modelo cuantizado responde correctamente a 29 de las 33 y a ninguna de las 7 adicionales.

## Requisitos de hardware

- VRAM/DRAM: el paquete BFP4 ocupa 3,444 GB; el repositorio completo pesa 8,9 GB, por lo que se recomienda al menos 8 GB de memoria de dispositivo para cargar el conjunto completo.
- GPU recomendadas: no aplica de forma nativa; el modelo esta pensado para NPU Tenstorrent Tensix (Wormhole, Blackhole). Puede cargarse en GPU con Transformers 5.23.0 y dtype bfloat16, pero sin las ventajas del formato BFP.
- Cabe en GPU de consumo: si, en GPU con al menos 8-12 GB de VRAM al cargar en bf16, aunque el rendimiento optimizado requiere Tensix.
- Opciones de despliegue: Transformers 5.23.0 con el adaptador `phi3_longrope_generation`; ttnn/tt-metal para ejecucion en Tensix. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Formato |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-Tenstorrent-Tensix (este) | no disponible | no disponible (prefijo a 4.096) | MIT | Tenstorrent Tensix | safetensors BFP4/BFP8 |
| microsoft/Phi-4-mini-instruct | no disponible | no disponible | MIT | GPU/CPU | safetensors bf16 |
| Cuantizacion Q4_K_M de referencia | no disponible | no disponible | segun empaquetador | GPU/CPU (llama.cpp) | GGUF |

No se dispone de datos de benchmarks comparativos entre estas variantes mas alla de la divergencia KL reportada.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el coreano aparece en el conjunto de evaluacion KL pero no como idioma soportado oficialmente.
- La cuantizacion introduce divergencia respecto a BF16 (KL 0,0503), lo que puede degradar tareas sensibles al detalle numerico o de razonamiento largo.
- El adaptador de reconstruccion de prefijo debe permanecer instalado durante generacion cacheada de contexto largo; omitirlo puede producir incoherencias al cruzar los 4.096 tokens.
- Requiere Transformers 5.23.0; versiones distintas pueden no cargar correctamente los pesos empaquetados.
- El codigo adaptador y las herramientas estan bajo Apache 2.0, licencia distinta a la de los pesos (MIT); no sustituye los terminos del modelo.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Sesgos conocidos del modelo base no documentados en esta ficha.
- Uso comercial permitido por la licencia MIT, pero la idoneidad en produccion depende de validar la calidad tras la cuantizacion en el caso de uso concreto.
- No se han publicado resultados de benchmarks estandar, por lo que la comparacion con alternativas se limita a metricas de fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-instruct-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio de codigo tensix-bfp-gptq (v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
