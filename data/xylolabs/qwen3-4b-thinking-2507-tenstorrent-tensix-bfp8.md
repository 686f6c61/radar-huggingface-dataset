# Xylolabs/Qwen3-4B-Thinking-2507-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3-4B-Thinking-2507-Tenstorrent-Tensix-BFP8 es una cuantizacion del modelo Qwen/Qwen3-4B-Thinking-2507 (Qwen Team) realizada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El checkpoint mantiene las capas lineales del transformer (proyecciones q, k, v, o de atencion y gate, up, down del MLP en las 36 capas) en formato `ttnn.bfloat8_b` (BFP8, block floating point de 8,5 bits por peso), mientras que el resto de tensores (embedding, LM head, normas) permanecen en bf16. El resultado es un modelo de 4.411.424.256 parametros que ocupa 4,64 GB de memoria de dispositivo, frente a los 8,04 GB del BF16 original.

La relevancia de esta ficha es doble. Por un lado, demuestra una via de despliegue de modelos Qwen3 en hardware no-GPU (aceleradores Tensix) con perdida de fidelidad muy baja respecto al BF16: KL medio de 0,00087 y 98,64 % de top-1 sobre 16.256 posiciones, frente a 0,04862 de KL y 90,64 % de top-1 de una cuantizacion Q4_K_M convencional. Por otro, ilustra el uso de GPTQ sobre la rejilla BFP8 nativa del hardware, de modo que TT-NN empaqueta los pesos sin alterar sus valores.

El modelo hereda las capacidades del Qwen3-4B-Thinking-2507 base: generacion de texto con modo de razonamiento (thinking), soporte multilingue amplio y contexto largo. Esta exportacion concreta esta pensada para inferencia en Tensix; el autor advierte que tt-transformers y tt-forge no se han ejecutado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas, con capas lineales cuantizadas a BFP8 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Thinking-2507) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en proyecciones de atencion y MLP; bf16 en embedding, LM head y normas; media de 9,23 bits/peso |
| Idiomas soportados | no disponible en la informacion proporcionada (calibracion en ingles y coreano: WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,8 GB), compatible con `transformers`; empaquetado para TT-NN en dispositivo |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Thinking-2507, un transformer decoder-only denso de 4.411 millones de parametros con 36 capas, desarrollado por el Qwen Team (referencia arXiv:2505.09388). Esta exportacion no reentrena el modelo: aplica GPTQ sobre la rejilla BFP8 para las proyecciones lineales, calibrando con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Cada bloque BFP8 comparte un exponente, y el packer de TT-NN lo fija de forma que los valores almacenados (bf16 sobre la rejilla BFP8) no cambian al empaquetar en dispositivo.

El detalle de formatos por proyeccion esta en el fichero `quant4.json` del repositorio. Las matrices cuantizadas se guardan como valores bf16 sobre la rejilla BFP8, lo que permite que TT-NN las empaquete sin perdida adicional. El autor incluye scripts de verificacion (`pack_tensix.py` y `verify_grid.py`) que comprueban matriz a matriz que ningun valor cambia tras el empaquetado, y una comprobacion con `ttnn 0.81.1` sobre `ttsim`, el simulador de Blackhole de Tenstorrent. No se documenta en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento en el modelo base; esa informacion corresponde a la model card de Qwen.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`), tal como muestra el quickstart.
- Modo de razonamiento (thinking) heredado del modelo base Qwen3-4B-Thinking-2507.
- Razonamiento multi-paso y cadenas de pensamiento (por la variante Thinking del base).
- Soporte multilingue heredado del base, con calibracion de la cuantizacion en ingles y coreano.
- Inferencia en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con pesos empaquetados en BFP8.
- Compatibilidad con `transformers` en GPU/CPU mediante `AutoModelForCausalLM` con `dtype="bfloat16"`.
- Tool calling / function calling: no documentado en la informacion proporcionada para esta exportacion.
- Vision y audio: no disponibles (modelo de texto).

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint esta empaquetado para TT-NN y ocupa 4,64 GB de DRAM de dispositivo, lo que permite servir Qwen3-4B en Wormhole o Blackhole sin GPU, con verificacion de integridad de pesos incluida.
- Inferencia de razonamiento en el borde: el modo thinking del base, combinado con 4,64 GB de pesos, encaja en escenarios donde el consumo energetico y la disponibilidad de GPU son restrictivos.
- Servicio conversacional multilingue: la calibracion en ingles y coreano y la herencia multilingue del base lo hacen apto para atencion al cliente en esos idiomas, con la plantilla de chat del quickstart.
- Evaluacion de fidelidad de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar que ningun peso cambia tras el empaquetado, util en pipelines de validacion de modelos cuantizados.
- Prototipado en `ttsim`: el autor valida con el simulador de Blackhole, de modo que se puede desarrollar y depurar integraciones TT-NN sin hardware fisico.
- Baseline de comparacion de cuantizaciones: con KL 0,00087 frente a BF16 y 0,04862 de Q4_K_M, sirve como referencia para medir el coste de fidelidad de otras tecnicas (GPTQ, AWQ, Q4_K_M) sobre el mismo checkpoint.
- Integracion en pipelines de `transformers`: al cargarse con `AutoModelForCausalLM` en bf16, puede usarse en entornos estandar para pruebas de regresion antes de pasar a Tensix.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen3-4B-Thinking-2507) | 16 | 8,04 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP8) | 9,23 | 4,639 | 0,00087 | 98,64 | 30 de 33 | 1 |
| Q4_K_M (llama.cpp v0.9.0) | 4,955 | 2,497 | 0,04862 | 90,64 | 29 de 33 | 1 |

Las metricas de KL y top-1 cubren 16.256 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las 33 respuestas son prompts cortos con comprobacion automatica; "perdidas" indica respuestas correctas en BF16 pero erroneas o rotas en la variante. El autor advierte que estas cifras miden cercania al BF16, no calidad de tarea, y que no se reporta velocidad. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 4,64 GB solo para los pesos del modelo de lenguaje, mas espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole). Verificado con `ttnn 0.81.1` sobre `ttsim` (simulador de Blackhole).
- GPU: no se documentan requisitos de VRAM para GPU en la informacion disponible; el quickstart usa `device_map="auto"` con `dtype="bfloat16"`.
- Consumer GPU: no disponible en la informacion proporcionada.
- Despliegue: TT-NN para Tensix; `transformers` para GPU/CPU; el autor indica que tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Latencia y throughput: no reportados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8) | 4,41 B | no disponible | BFP8 (9,23 bits/peso) | 0,00087 | Apache 2.0 | Hugging Face, Tensix |
| Qwen3-4B-Thinking-2507 BF16 | 4,41 B | no disponible | bf16 (16 bits/peso) | 0 | Apache 2.0 | Hugging Face |
| Qwen3-4B-Thinking-2507 Q4_K_M | 4,41 B | no disponible | Q4_K_M (4,955 bits/peso) | 0,04862 | Apache 2.0 | llama.cpp |

La comparativa se limita a variantes del mismo checkpoint base, que es lo que documenta la model card. No se dispone de datos para comparar con otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion BFP8 introduce una perdida medible: KL medio de 0,00087 y 1 respuesta perdida de 33 respecto al BF16. No es una copia exacta del modelo base.
- Las metricas publicadas miden fidelidad al BF16, no calidad de tarea; no hay resultados de MMLU, HumanEval ni GSM8K para esta exportacion.
- No se reporta velocidad ni latencia; el rendimiento en Tensix no esta cuantificado en la model card.
- tt-transformers y tt-forge no se han probado con este checkpoint; solo se valido con TT-NN sobre `ttsim`.
- La calibracion de GPTQ uso solo ingles y coreano (WikiText-2 y Wikipedia en coreano), lo que puede sesgar la fidelidad en otros idiomas.
- El modelo base Qwen3-4B-Thinking-2507 puede presentar sesgos y alucinaciones; esta exportacion no los corrige.
- Licencia Apache 2.0, igual que el base; los cambios se documentan en `NOTICE`. Se entrega "as is", sin garantia.
- El autor no esta afiliado ni respaldado por Tenstorrent.
- No se documentan capacidades de tool calling ni de agentes para esta exportacion.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Thinking-2507-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (Qwen3 Technical Report): https://arxiv.org/abs/2505.09388
