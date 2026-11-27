# Xylolabs/GLM-4.6V-Flash-Tenstorrent-Tensix

## Resumen

GLM-4.6V-Flash-Tenstorrent-Tensix es una versión cuantizada del modelo multimodal zai-org/GLM-4.6V-Flash, adaptada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo original, desarrollado por Z.ai (equipo V Team, autores de la familia GLM), es un modelo de imagen-a-texto que combina un codificador visual con un transformer de lenguaje para tareas de razonamiento multimodal. Esta variante no introduce cambios arquitectónicos: su aportación es un esquema de cuantización en block floating point (BFP4/BFP8) compatible con el formato nativo de las NPU Tensix.

La relevancia de esta ficha radica en que permite desplegar un modelo visión-lenguaje sobre hardware no-GPU, un caso poco habitual en el ecosistema open source. El paquete cuantizado ocupa 9,317 GB frente a los 18,80 GB del checkpoint BF16 original, con una divergencia media de KL de 0,023789 respecto a BF16, ligeramente inferior a la del cuantizado Q4_K_M de llama.cpp (0,024092) sobre el mismo conjunto de evaluación.

El repositorio incluye además scripts de empaquetado (`pack_tensix.py`) y verificación (`verify_grid.py`) bajo licencia Apache-2.0, así como metadatos `quant4.json` que describen el formato asignado a cada matriz. La licencia declarada es MIT, heredada de la model card original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + modelo de lenguaje); detalles internos del modelo base no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (BFP4) en atención y MLP down; bfloat8_b (BFP8) en MLP gate y up; bf16 en el resto; referencia Q4_K_M (llama.cpp) incluida como comparativa de calidad |
| Idiomas soportados | zh, en |
| Licencia | MIT (según model card original; el repositorio original no incluye fichero LICENSE) |
| Formato de pesos | safetensors con empaquetado BFP para TT-NN; incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base GLM-4.6V-Flash pertenece a la familia GLM-4.5V/GLM-4.1V-Thinking descrita en el paper arXiv:2507.01006, orientada al razonamiento multimodal con aprendizaje por refuerzo escalable. La información disponible no detalla el número de parámetros, la composición del dataset de entrenamiento ni las etapas de alineación (RLHF/DPO) del modelo original.

La contribución técnica de esta variante es la cuantización en block floating point para Tensix. Las matrices de atención (`self_attn.q_proj`, `self_attn.k_proj`) y la proyección down del MLP se almacenan en bfloat4_b; las proyecciones gate y up del MLP en bfloat8_b; el resto de pesos permanece en bf16. Un detalle relevante para implementaciones propias: las 80 matrices q_proj y k_proj conservan el orden de filas original de Hugging Face y solo caen sobre la rejilla BFP4 tras una permutación específica de cada cabeza de 128 filas (slots 0-31 toman las filas 0, 2, ..., 62; slots 32-63 toman las filas 64-95; slots 64-95 toman las filas 1, 3, ..., 63; slots 96-127 toman las filas 96-127), y la implementación debe colocar sus pares rotatorios de forma consistente con ese layout.

## Capacidades

- Generación de texto e inferencia imagen-a-texto (`pipeline_tag: image-text-to-text`).
- Razonamiento multimodal heredado de la familia GLM-4.5V/GLM-4.1V-Thinking, orientada explícitamente al razonamiento versátil con RL escalable según el paper citado.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Soporte bilingüe chino-inglés declarado en los metadatos.
- Ejecución sobre NPU Tenstorrent Tensix (Wormhole, Blackhole) vía TT-NN/tt-metal, además de inferencia estándar en PyTorch/Transformers.
- Tool calling, function calling, comportamiento agéntico, modo thinking explícito, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia visión-lenguaje sobre hardware Tenstorrent: el paquete BFP4 permite cargar el modelo en NPU Wormhole o Blackhole con 9,317 GB de pesos, evitando depender de GPU NVIDIA en entornos con aceleradores Tensix ya desplegados.
- Despliegue en entornos con restricciones de memoria: la reducción de 18,80 GB (BF16) a 9,317 GB (BFP4) facilita alojar el modelo en nodos con DRAM limitada, manteniendo una KL media de 0,023789 frente a BF16.
- Sustitución de cuantizaciones Q4_K_M en pipelines llama.cpp: la KL de BFP4 (0,023789) es inferior a la de Q4_K_M (0,024092) sobre el mismo conjunto de evaluación, por lo que puede emplearse como alternativa cuando el backend sea Tensix.
- Descripción de imágenes y respuesta a preguntas visuales en inglés o chino: el pipeline `image-text-to-text` y la plantilla de chat permiten construir asistentes que reciben una imagen y un prompt textual.
- Investigación en cuantización BFP: los scripts `pack_tensix.py` y `verify_grid.py` (Apache-2.0) permiten reproducir el empaquetado y verificar el round-trip de valores empaquetados, útil para estudiar el impacto de BFP4/BFP8 en modelos multimodales.
- Validación de portabilidad de pesos: el round-trip documentado (`ttnn.to_torch(w_tt).float()` comparado con `w.float()`) sirve como test de integridad al migrar checkpoints entre HF y TT-NN.
- Prototipado de asistentes bilingües zh/en con entrada visual: la declaración de idiomas del modelo base cubre chino e inglés, adecuado para demos internas en esos dos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de fidelidad de cuantización:

| Variante | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|
| BFP4 (este repo) | 9,317 | 0,023789 |
| BF16 (zai-org/GLM-4.6V-Flash) | 18,80 | 0 |
| Q4_K_M (llama.cpp) | 6,157 | 0,024092 |

La KL se calcula sobre 16.248 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), con y sin plantilla de chat, con un límite de KL media de 1,5 veces la referencia Q4_K_M.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,317 GB de pesos empaquetados en BFP4; el checkpoint BF16 de referencia ocupa 18,80 GB. No se especifica memoria adicional para activaciones, caché KV ni codificador visual.
- GPU recomendadas: no disponibles; el destino principal son NPU Tenstorrent Tensix (Wormhole, Blackhole).
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; la carga en PyTorch/Transformers con `dtype="bfloat16"` y `device_map="auto"` sugiere que podría ejecutarse en GPU con memoria suficiente para el tamaño BF16, pero no se documenta.
- Opciones de despliegue: TT-NN/tt-metal sobre Tensix (flujo principal documentado), tt-forge, y PyTorch/Transformers (`AutoModelForImageTextToText`) para inferencia estándar. No se mencionan vLLM, TGI, Ollama ni llama.cpp para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| GLM-4.6V-Flash-Tenstorrent-Tensix (este) | no disponible | no disponible | BFP4/BFP8/bf16 | MIT | Tenstorrent Tensix |
| zai-org/GLM-4.6V-Flash (base) | no disponible | no disponible | BF16 | MIT (declarada) | GPU |
| GLM-4.6V-Flash Q4_K_M (llama.cpp) | no disponible | no disponible | Q4_K_M | MIT (declarada) | CPU/GPU vía llama.cpp |

No se dispone de datos de parámetros, contexto ni benchmarks del modelo base en la información proporcionada, por lo que la comparación se limita a formato de cuantización, licencia y hardware objetivo.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otras lenguas.
- La model card original no incluye fichero LICENSE; la licencia MIT se toma de la declaración textual, lo que conviene verificar antes de un uso comercial en producción.
- El repositorio advierte de que las matrices q_proj y k_proj requieren una permutación de filas específica para caer sobre la rejilla BFP4; una implementación que ignore ese layout producirá resultados incorrectos en TT-NN.
- La evaluación de calidad se limita a KL sobre texto inglés y coreano; no hay evaluación de capacidades visuales ni de tareas de razonamiento.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero aplicables por herencia del modelo base.
- El modelo está pensado para Tensix; el flujo en PyTorch/Transformers se documenta como referencia, no como ruta de producción validada.
- No se especifican requisitos de memoria para activaciones ni caché KV, lo que dificulta dimensionar el despliegue.
- Cambio de nombre reciente (2026-11-27) de `GLM-4.6V-Flash-Tenstorrent-Tensix-BFP4` a la denominación actual, con los ficheros movidos a `bfp4/`; scripts o pipelines que apunten a la ruta antigua fallarán.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Revisión BF16 referenciada: https://huggingface.co/zai-org/GLM-4.6V-Flash/tree/411bb4d77144a3f03accbf4b780f5acb8b7cde4e
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper citado: arXiv:2507.01006 (GLM-4.5V and GLM-4.1V-Thinking: Towards Versatile Multimodal Reasoning with Scalable Reinforcement Learning)
