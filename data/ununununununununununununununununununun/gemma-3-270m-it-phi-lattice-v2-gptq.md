# ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-gptq

## Resumen

`gemma-3-270m-it-phi-lattice-v2-gptq` es una cuantizacion experimental de 4 bits del modelo `unsloth/gemma-3-270m-it`, publicado por el usuario `ununununununununununununununununununun`. No se trata de un modelo nuevo entrenado desde cero, sino de un archivo empaquetado ("packed archive") que aplica una tecnica propia denominada "phi-lattice" combinada con retroalimentacion de error al estilo GPTQ sobre los pesos del modelo base de Gemma 3 en su variante de 270 millones de parametros. El objetivo es reducir el peso del modelo de 1,07 GB en FP32 a 371 MiB manteniendo una perplejidad razonable.

La relevancia de esta publicacion es fundamentalmente metodologica: explora un formato de cuantizacion alternativo a los esquemas habituales (Q4_K_M de llama.cpp, GPTQ estandar, AWQ) y documenta de forma transparente sus resultados, incluyendo los casos en los que su enfoque queda por detras del estandar de la industria. El autor reporta una mejora del 13,4 % en perplejidad respecto a su version anterior sin GPTQ, aunque reconoce que Q4_K_M sigue obteniendo mejor calidad bruta a 4 bits.

El modelo hereda las capacidades del Gemma 3 270M instruct original de Google DeepMind, un modelo pequeno orientado a generacion de texto conversacional. Esta version solo es cargable en PyTorch mediante un loader personalizado (`phi_loader.py`) y no incluye formato GGUF, lo que limita su uso a entornos Python con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), cuantizado con phi-lattice + GPTQ |
| Parametros totales | 270 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits empaquetado (phi-lattice, ~4,02 bpw efectivos en pesos lineales) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | archivo `.pt` empaquetado (`gemma3_270m_phi_gptq_v2_packed_4bit.pt`), cargado via `phi_loader.py`; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 270M instruct, un transformer decoder-only de la familia Gemma 3 de Google DeepMind, afinado por Unsloth para instrucciones. Sobre ese modelo, esta publicacion no entrena ni afina pesos: aplica una cuantizacion post-entrenamiento. La tecnica "phi-lattice" asigna los pesos a una escalera de 15 niveles basada en la proporcion aurea (golden-ratio ladder), y la version v2-GPTQ optimiza esa asignacion columna a columna contra activaciones de calibracion, usando retroalimentacion de error ponderada por la descomposicion de Cholesky de la inversa de la matriz de Hessiana, al estilo GPTQ clasico con damping de 1e-2.

La calibracion se realizo con 60 textos de aproximadamente 1000 tokens en total, compuestos por prosa del dominio y del repositorio, sin solapamiento con el conjunto de evaluacion. El autor senala que ampliar la calibracion es la siguiente palanca de mejora. El archivo resultante ocupa 371 MiB y se descomprime sobre la escalera de 15 niveles verificable mediante la reconstruccion `codebook[idx] * scales`. El repositorio incluye un `provenance.json` con el SHA-256 del archivo (`767bf5acb6ab8825…`), el cuantizador empleado y la configuracion de calibracion.

## Capacidades

- Generacion de texto conversacional en modo instruct, heredadas del Gemma 3 270M IT original.
- Razonamiento basico y respuesta a instrucciones de complejidad baja, limitado por el tamano de 270M parametros.
- Generacion de codigo y matematicas simples, sin garantias de calidad por el reducido numero de parametros.
- Soporte de plantilla de chat (`apply_chat_template`) con roles user/assistant.
- Carga en CPU (`unrolled_bf16`), en modo de baja VRAM (`low_vram_4bit`) o en CUDA con kernel Triton (`triton_4bit`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en esta publicacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Experimentacion con tecnicas de cuantizacion: el modelo sirve como banco de pruebas para comparar phi-lattice + GPTQ frente a Q4_K_M y otras cuantizaciones sobre un modelo pequeno y bien conocido, con metricas de SQNR y perplejidad reproducibles.
- Investigacion sobre formatos empaquetados: util para estudiar el equilibrio entre bits por peso, tamano de archivo y calidad, dado que el autor publica la procedencia y el codebook verificable.
- Prototipado de chatbots ligeros en CPU: con 371 MiB y carga en `unrolled_bf16`, puede ejecutarse en maquinas sin GPU para demos de conversacion de baja exigencia.
- Educacion y docencia: ejemplo practico de cuantizacion post-entrenamiento con retroalimentacion de error y evaluacion honesta de resultados.
- Pruebas de integracion de loaders personalizados: valido para validar pipelines que cargan pesos empaquetados fuera del circuito estandar de `transformers`.
- Evaluacion comparativa de perplejidad: util para replicar el corpus local de 6 textos y contrastar cifras (FP32 90,8; v2 161,5; v2-GPTQ 139,85; Q4_K_M 99,3).

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un corpus local de 6 textos, con perplejidad de referencia FP32 de 90,8:

| Archive | SQNR | PPL | Tamano |
|---|---|---|---|
| FP32 reference | — | 90,8 | 1,07 GB |
| v2 (plain lattice) | 19,48 dB | 161,5 | 371,0 MiB |
| v2-GPTQ (este repo) | 16,17 dB | 139,85 | 371,0 MiB |
| Q4_K_M (llama.cpp, referencia) | 26,80 dB | 99,3 | 0,25 GB |

Lectura del autor: la retroalimentacion de error GPTQ mejora la perplejidad un 13,4 % (de 161,5 a 139,85) sin coste de tamano, a costa de reducir el SQNR (de 19,48 a 16,17 dB), lo cual es esperado porque redistribuye el error hacia direcciones favorables a las activaciones en lugar de minimizarlo globalmente. Q4_K_M sigue liderando en calidad bruta a 4 bits y ocupa menos espacio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el autor indica que lm-eval mas amplio esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 371 MiB; en modo `unrolled_bf16` requiere aproximadamente el doble en memoria al desplegar pesos en bf16; el modo `low_vram_4bit` reduce la huella (el autor cita ~2,6 GB para el hermano de 4B, no para este de 270M).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamano; el modo `triton_4bit` requiere CUDA con Triton disponible.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM libre, y tambien en CPU.
- Opciones de despliegue: solo PyTorch via `phi_loader.py` con `transformers`; no hay soporte GGUF, Ollama, vLLM ni TGI en esta release.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (corpus local) | Tamano | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (v2-GPTQ) | 270M | no disponible | 139,85 | 371 MiB | Gemma | `.pt` empaquetado |
| v2 (plain lattice) | 270M | no disponible | 161,5 | 371 MiB | Gemma | `.pt` empaquetado |
| Q4_K_M (llama.cpp) | 270M | no disponible | 99,3 | 0,25 GB | Gemma | GGUF |
| FP32 reference | 270M | no disponible | 90,8 | 1,07 GB | Gemma | safetensors/PyTorch |

La comparativa se limita a variantes de cuantizacion del mismo modelo base, ya que la informacion disponible no incluye otros modelos comparables de 270M. En calidad bruta, Q4_K_M supera a esta propuesta; en eficiencia de bits por peso (~4,02 frente a ~4,88) y trazabilidad de procedencia, este formato ofrece ventajas.

## Limitaciones y advertencias

- Calidad base limitada por el tamano de 270M parametros, independientemente de la cuantizacion aplicada.
- El SQNR de GPTQ (16,17 dB) es inferior al de la lattice simple (19,5 dB), por diseno; no debe interpretarse como un defecto sino como una redistribucion del error.
- Sin soporte GGUF ni Ollama en esta release; requiere el loader personalizado `phi_loader.py`, lo que rompe la compatibilidad con pipelines estandar de `transformers`.
- Calibracion reducida (60 textos, ~1k tokens) con posible sesgo hacia el dominio de calibracion.
- Evaluacion limitada a un corpus local de 6 textos; sin benchmarks estandar publicados (lm-eval pendiente).
- Riesgo de alucinacion inherente a modelos pequenos; no recomendado para produccion sin validacion humana.
- Licencia Gemma: uso comercial sujeto a los terminos de Google; revisar restricciones antes de desplegar.
- Idiomas soportados no documentados en esta publicacion.
- Cero descargas y cero likes en el momento de la consulta; proyecto de investigacion sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2-gptq
- Version anterior (plain lattice): https://huggingface.co/unununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2
- Repositorio del autor: https://github.com/unununununununun/bio-neural-architectures
- Documento comparativo Q4_K_M vs phi-lattice: `docs/Q4KM_VS_PHI_LATTICE.md` en el repositorio anterior
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
