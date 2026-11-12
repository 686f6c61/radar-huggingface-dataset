# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-MambaOut8

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-MambaOut8 es una cuantizacion del modelo nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, desarrollada por Xylolabs, orientada especificamente al hardware de aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No es un modelo nuevo: es el checkpoint base con sus capas lineales cuantizadas a formatos de coma flotante por bloques propios del stack TT-NN (ttnn.bfloat4_b y ttnn.bfloat8_b), de forma que los pesos ya se encuentran en la rejilla numerica que el hardware espera y TT-NN los empaqueta sin conversion adicional.

El modelo subyacente es un transformer hibrido de tipo nemotron_h con 31.577.940.288 parametros totales y aproximadamente 3.000 millones activos por token (arquitectura MoE, segun el sufijo A3B). Combina 6 capas de atencion con 23 capas Mamba-2, mas proyecciones de expertos enrutados y un experto compartido. La cuantizacion reduce el peso empaquetado a 18,91 GB con una media de 4,79 bits por peso, frente a los 63,16 GB del BF16 original.

Su relevancia es doble: por un lado, demuestra una ruta de despliegue de un MoE hibrido de 30B en NPUs de Tenstorrent con perdida de calidad acotada (KL medio de 0,0606 frente a BF16); por otro, publica una metodologia de cuantizacion GPTQ reproducible con scripts de verificacion de rejilla y empaquetado. Es un artefacto de infraestructura, no un modelo de proposito general listo para produccion en GPU convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (transformer hibrido: atencion + Mamba-2 + MoE) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | aproximadamente 3.000 millones (MoE, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, GPTQ + busqueda de exponente por bloque) y BFP8 (bfloat8_b, round to nearest); media de 4,79 bits por peso |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (bf16 en disco, valores ya en rejilla BFP4/BFP8); requiere trust_remote_code |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base nemotron_h: un hibrido que intercala 6 capas con atencion (proyecciones q, k, v, o) y 23 capas con proyeccion Mamba-2 (in y out), junto con una capa MoE que contiene expertos enrutados (up y down) y un experto compartido. El checkpoint cuantizado no aporta informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF o DPO); esos datos corresponden a la model card de nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 y no se incluyen en la informacion disponible.

La innovacion tecnica esta en el esquema de cuantizacion para Tensix. Las proyecciones de atencion y las proyecciones de entrada Mamba-2 se cuantizan a bfloat4_b (4,5 bits por peso) mediante GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de salida Mamba-2 se llevan a bfloat8_b (8,5 bits por peso) con redondeo al mas cercano, presumiblemente por su mayor sensibilidad. Los expertos enrutados (up, down y el experto compartido) usan bfloat4_b; las proyecciones up de los expertos enrutados comparten una unica matriz de Hessian por capa, mientras que cada down emplea la suya o cae a redondeo al mas cercano si dispuso de pocos tokens de calibracion. El LM head, los embeddings, las normas y el resto de tensores permanecen en bf16.

El resultado son 6.004 matrices cuantizadas que superan la comprobacion de rejilla. En ttsim se verifico el empaquetado TT-NN de las capas 0 y 1 (260 matrices) sin discrepancias tras el desempaquetado. El repositorio incluye `quant4.json` (formato por proyeccion), `pack_tensix.py` (verificacion de empaquetado, con opcion `--device` para round-trip por DRAM) y `verify_grid.py` (comprobacion de rejilla solo con torch). Ni tt-transformers ni tt-forge se han ejecutado con este checkpoint.

## Capacidades

- Generacion de texto conversacional en seis idiomas (ingles, espanol, frances, aleman, japones e italiano), con plantilla de chat aplicable via `apply_chat_template`.
- Razonamiento y respuesta a preguntas de cultura general y conocimiento factual, evaluado con 33 prompts cortos de comprobacion automatica.
- Capacidad multilingue real, con calibracion que incluye texto en coreano ademas de ingles, aunque el coreano no figura entre los idiomas declarados en la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es exclusivamente text-generation.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole o Blackhole: el checkpoint esta disenado para que TT-NN empaquete los pesos directamente desde safetensors, sin paso de conversion, lo que permite servir el MoE de 30B en 18,91 GB de pesos empaquetados dentro de la jerarquia de memoria del acelerador.
- Validacion de pipelines de cuantizacion BFP: los scripts `verify_grid.py` y `pack_tensix.py` permiten comprobar matriz a matriz que la rejilla numerica es correcta antes de invertir tiempo en un despliegue completo, util en equipos que adaptan GPTQ a nuevos formatos de hardware.
- Investigacion sobre cuantizacion de MoE hibridos: la separacion entre BFP4 para atencion y expertos y BFP8 para la salida Mamba-2 ofrece un punto de partida documentado para estudiar sensibilidad por tipo de capa en arquitecturas con estado recurrente.
- Generacion de texto multilingue en entornos con presupuesto de memoria ajustado: con 18,91 GB empaquetados y seis idiomas soportados, encaja en escenarios de inferencia por lotes donde el BF16 de 63,16 GB no es viable.
- Referencia para evaluacion de degradacion: la tabla de KL medio (0,0606) y top-1 (88,95 %) frente a BF16 y Q4_K_M permite usar el checkpoint como linea base al comparar otros esquemas de cuantizacion sobre el mismo modelo base.
- Prototipado de asistentes conversacionales en hardware no NVIDIA: al no depender de CUDA, sirve para validar flujos de chat completos en placas Tenstorrent antes de portar cargas mayores.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion de cuantizacion del autor, no benchmarks estandar de tareas (MMLU, HumanEval, GSM8K no estan disponibles).

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 63,16 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4/BFP8) | 4,79 | 18,915 | 0,0606 | 88,95 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 6,21 | 24,515 | 0,0407 | 90,60 | 31 de 33 | 0 |

Las metricas de KL y top-1 cubren 8.188 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano) en formato de texto plano. Las 33 respuestas corresponden a prompts cortos con comprobacion automatica; "perdidas" indica respuestas correctas en BF16 que fallan o se rompen en el modelo evaluado, sin contar empates cercanos. El Q4_K_M se genero a partir del mismo modelo base.

## Requisitos de hardware

- VRAM estimada: 18,91 GB de pesos empaquetados; en inferencia con cache KV y activaciones hay que anadir overhead no cuantificado, por lo que un presupuesto practico de 24 GB o superior es razonable, aunque el autor no publica cifras de memoria total.
- GPU recomendadas: no aplica en su destino principal; el checkpoint esta pensado para NPUs Tenstorrent Tensix (Wormhole, Blackhole). En GPU convencional puede cargarse con transformers en bf16 (63,16 GB de pesos), lo que exige A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- GPU de consumo: en bf16 no cabe en ninguna consumer GPU actual. El checkpoint no esta pensado para CUDA y no se publican conversiones GGUF de este artefacto.
- Opciones de despliegue: TT-NN / tt-metal sobre Tensix; transformers con `trust_remote_code=True` y `device_map="auto"` para inspeccion o inferencia en GPU. vLLM, llama.cpp, Ollama y TGI no estan soportados ni documentados para este checkpoint.
- Latencia y throughput: no disponibles. El autor indica que tt-transformers y tt-forge no se han ejecutado con este checkpoint, por lo que no hay mediciones de rendimiento en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 31,58B totales / ~3B activos | no disponible | BFP4 + BFP8, 4,79 bits/peso, 18,91 GB | nvidia-nemotron-open-model-license | Hugging Face, formato Tensix |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58B totales / ~3B activos | no disponible | bf16, 63,16 GB | nvidia-nemotron-open-model-license | Hugging Face |
| Q4_K_M derivado del mismo base | 31,58B totales / ~3B activos | no disponible | 6,21 bits/peso, 24,515 GB | nvidia-nemotron-open-model-license | llama.cpp |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible contra el modelo base y su variante Q4_K_M, ambos incluidos en la evaluacion del autor. No se dispone de datos de modelos de terceros con los que contrastar.

## Limitaciones y advertencias

- Artefacto especifico de hardware: los pesos estan prequantizados en la rejilla BFP de Tensix. Cargarlos en GPU implica leer bf16 con valores ya redondeados a BFP4/BFP8, de modo que se pierde la precision original sin obtener la ventaja de velocidad del hardware destino.
- Perdida de calidad medible: KL medio de 0,0606 y top-1 del 88,95 % frente al 100 % de BF16. El Q4_K_M de llama.cpp obtiene mejor KL (0,0407) y mejor top-1 (90,60 %) con mas bits, lo que sugiere que el esquema BFP4 no domina en calidad pura.
- Sin validacion de extremo a extremo en dispositivo: el empaquetado TT-NN solo se comprobo en ttsim para las capas 0 y 1 (260 de 6.004 matrices). tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Riesgo de alucinacion: no se publican evaluaciones de factualidad ni de robustez; la evaluacion se limita a 33 prompts cortos con comprobacion automatica.
- Cobertura limitada de la calibracion: 65.536 tokens de WikiText-2 y Wikipedia en coreano. Algunos expertos down usaron redondeo al mas cercano por falta de tokens de calibracion, lo que introduce heterogeneidad de error entre expertos.
- Idiomas: la model card declara seis idiomas, pero la calibracion incluye coreano, que no figura en esa lista; el comportamiento fuera de los idiomas declarados no esta caracterizado.
- Licencia: nvidia-nemotron-open-model-license, no es una licencia OSI estandar. Es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las habituales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo personalizado antes de usarlo en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el checkpoint de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Repositorio de codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arxiv:2512.20848): https://arxiv.org/abs/2512.20848
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-MambaOut8/blob/main/LICENSE
