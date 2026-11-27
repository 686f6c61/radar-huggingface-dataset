# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix es una cuantizacion del modelo nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, publicada por Xylolabs, orientada especificamente a la ejecucion sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base es un mixtura de expertos (MoE) hibrido Mamba-Transformer de NVIDIA, disenado para razonamiento agentico eficiente, con 30B parametros totales y 3B parametros activos por token. Esta variante no es un modelo nuevo: reempaqueta los pesos originales en formatos de bloque de coma flotante (bfloat4_b y bfloat8_b) que el hardware Tensix puede consumir de forma nativa.

La relevancia de esta publicacion radica en que permite desplegar un modelo de 30B en NPUs de Tenstorrent con un peso empaquetado de 18,985 GB, frente a los 63,16 GB del checkpoint BF16 original. La cuantizacion se realiza mediante la herramienta tensix-bfp-gptq de Xylolabs, que aplica GPTQ con formatos de bloque BFP4/BFP8 especificos de TT-Metal y TT-NN. La degradacion medida es un KL medio de 0,0543 frente a BF16, ligeramente superior al 0,0407 de Q4_K_M de llama.cpp, pero dentro del limite declarado de 1,5 veces la referencia Q4_K_M.

El checkpoint conserva el codigo original del modelo de NVIDIA y mantiene la licencia NVIDIA Nemotron Open Model License. Incluye utilidades para empaquetar matrices en Tensix y verificar el round-trip de los valores cuantizados, ademas de un quickstart en PyTorch/CUDA para validacion fuera del NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida Mamba-2 + Transformer (Nemotron 3 Nano) |
| Parametros totales | 30B (aproximado, segun nombre del modelo) |
| Parametros activos | 3B (aproximado, segun nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b, bfloat8_b (block floating point para Tensix); referencia Q4_K_M en llama.cpp |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license (pesos); Apache-2.0 para pack_tensix.py y verify_grid.py |
| Formato de pesos | safetensors (carpeta bfp4/), con quant4.json e index de safetensors |

## Arquitectura y entrenamiento

El modelo base es una arquitectura hibrida que combina capas Mamba-2 con capas de atencion Transformer en un esquema de mezcla de expertos. Segun la nomenclatura del checkpoint, las proyecciones de entrada de Mamba-2 y las proyecciones up/down de expertos enrutados y compartidos se cuantizan a bfloat4_b, mientras que la atencion y la salida de Mamba-2 se mantienen en bfloat8_b; el resto de tensores permanece en bf16 o float32. Esta asignacion selectiva de precision busca preservar las partes mas sensibles del modelo (atencion y salida del mixer) mientras reduce el coste de las matrices de mayor tamano.

El entrenamiento del modelo original corresponde a NVIDIA (informe tecnico arXiv:2512.20848, "Nemotron 3 Nano: Open, Efficient Mixture-of-Experts Hybrid Mamba-Transformer Model for Agentic Reasoning"). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La innovacion tecnica de esta variante concreta es el pipeline de cuantizacion GPTQ adaptado a formatos de bloque BFP4/BFP8 de Tenstorrent, con herramientas de empaquetado y verificacion incluidas en el repositorio.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Nemotron 3 Nano.
- Razonamiento agentico y multi-step, segun la descripcion del informe tecnico del modelo original.
- Capacidades multilingues en ingles, espanol, frances, aleman, japones e italiano.
- Ejecucion en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN y TT-Metal.
- Validacion en CUDA/PyTorch con Transformers 4.57.6 y mamba-ssm 2.3.2.post1 para comprobar comportamiento antes del despliegue en NPU.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el checkpoint esta empaquetado para NPUs Wormhole y Blackhole, por lo que encaja en entornos que ya operan tarjetas Tensix y quieren ejecutar un MoE de 30B sin depender de GPU NVIDIA.
- Inferencia de bajo coste por token: al tener 3B parametros activos, el coste computacional por token es reducido frente a un modelo denso de 30B, lo que lo hace adecuado para servicios de generacion de texto con alta concurrencia.
- Razonamiento agentico en produccion: el modelo base esta disenado para tareas de agentes; esta variante permite ejecutar esos flujos en hardware Tensix con un peso empaquetado de 18,985 GB.
- Asistentes multilingues: cubre seis idiomas (en, es, fr, de, ja, it), suficiente para atencion al cliente o generacion de contenido en mercados europeos y japones.
- Validacion y benchmarking de cuantizacion: las herramientas pack_tensix.py y verify_grid.py permiten comprobar el round-trip de matrices cuantizadas y medir la fidelidad frente a BF16, util para equipos que evaluan perdida de calidad.
- Investigacion en formatos de bloque: sirve como referencia para estudiar el impacto de bfloat4_b y bfloat8_b en un modelo hibrido Mamba-Transformer, con metricas KL publicadas sobre WikiText-2 y Wikipedia en coreano.
- Prototipado en CUDA antes de portar a NPU: el quickstart con Transformers permite validar prompts y plantillas de chat en GPU y despues migrar la inferencia a Tensix.

## Benchmarks y rendimiento

| Metrica | bfp4/ (esta variante) | BF16 (base) | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamano empaquetado (GB) | 18,985 | 63,16 | 24,515 |
| KL medio vs BF16 | 0,0543 | 0 | 0,0407 |

El KL se calcula sobre 8.188 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con un limite de KL medio de 1,5 veces la referencia Q4_K_M. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el peso empaquetado en bfp4/ ocupa 18,985 GB, por lo que se requiere al menos esa cantidad de memoria en el acelerador.
- GPU recomendadas: no disponible en la informacion proporcionada. El quickstart de referencia requiere CUDA.
- Cabe en consumer GPU: no disponible; el tamano empaquetado de 18,985 GB supera la VRAM de la mayoria de GPU de consumo, aunque no se confirma un requisito minimo.
- Opciones de despliegue: TT-NN / TT-Metal sobre Tenstorrent Tensix (Wormhole, Blackhole); Transformers 4.57.6 + mamba-ssm 2.3.2.post1 para validacion en CUDA; llama.cpp solo como referencia de cuantizacion Q4_K_M, no como formato de este checkpoint.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix (esta ficha) | 30B totales / 3B activos | no disponible | bfloat4_b, bfloat8_b | nvidia-nemotron-open-model-license | Hugging Face, 157 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 30B totales / 3B activos | no disponible | BF16 | nvidia-nemotron-open-model-license | Hugging Face |
| Q4_K_M de llama.cpp (referencia de cuantizacion) | 30B totales / 3B activos | no disponible | Q4_K_M | nvidia-nemotron-open-model-license | Formato GGUF para llama.cpp |

No se dispone de datos de rendimiento en tareas para comparar cualitativamente con alternativas; la comparacion se limita a tamano empaquetado, formato y licencia.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion: KL medio de 0,0543 frente a BF16, superior al 0,0407 de Q4_K_M; conviene validar la calidad en la tarea concreta antes de produccion.
- El checkpoint esta orientado a hardware Tenstorrent Tensix; no es un formato GGUF ni un checkpoint generico para GPU. El quickstart en CUDA es solo de referencia y requiere versiones muy concretas (Transformers 4.57.6, mamba-ssm 2.3.2.post1), incompatibles con Transformers 5.
- Requiere trust_remote_code=True, ya que incluye codigo original del modelo de NVIDIA; hay que revisarlo antes de habilitarlo.
- La licencia NVIDIA Nemotron Open Model License no es una licencia open source estandar; deben revisarse las restricciones de uso comercial en el fichero LICENSE.
- Los idiomas soportados son seis (en, es, fr, de, ja, it); no se declara cobertura de otros idiomas.
- No se han publicado datos de sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- El repositorio tiene 0 likes y 157 descargas, lo que sugiere una adopcion temprana y poca validacion comunitaria.
- La actualizacion del 27-11-2026 renombro el repositorio y movio los ficheros a bfp4/; enlaces o scripts antiguos pueden apuntar a rutas obsoletas.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Informe tecnico (arXiv): https://arxiv.org/abs/2512.20848
- Codigo de cuantizacion (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
