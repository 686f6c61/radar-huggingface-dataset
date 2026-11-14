# Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8

## Resumen

Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only original de 8.030.261.248 parámetros, pero cuantiza las capas lineales (atención q, k, v, o y MLP gate, up, down en las 32 capas) a formato block-floating-point `bfloat8_b` (BFP8) mediante GPTQ, mientras que el LM head, los embeddings, las normas y el resto de tensores permanecen en bf16.

La relevancia de esta ficha es doble. Por un lado, demuestra un flujo de cuantización consciente del hardware: las matrices cuantizadas se almacenan como valores bf16 sobre la retícula BFP8, de modo que TT-NN las empaqueta sin alterar sus valores. Por otro lado, ofrece una vía práctica para desplegar un modelo de 8B en aceleradores Tensix con un consumo de memoria de dispositivo de aproximadamente 9,52 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers. El contexto de 128.000 tokens, la licencia Llama 3.1 y el soporte de ocho idiomas heredados del modelo base se conservan íntegramente.

El checkpoint está pensado para investigadores y desarrolladores que trabajan con tt-metal, ttnn y tt-forge, y que necesitan ejecutar inferencia conversacional en hardware Tenstorrent sin reentrenar ni recalibrar. La calibración GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, y el modelo se validó con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), capas lineales cuantizadas a BFP8 |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base; no se especifica en la model card) |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en capas de atención y MLP; bf16 en LM head, embeddings y normas; 9,48 bits por peso de media |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (16,1 GB de repositorio); memoria de dispositivo empaquetada ~9,52 GB |

## Arquitectura y entrenamiento

El modelo parte de los pesos bf16 de meta-llama/Llama-3.1-8B-Instruct, que según la model card son byte-idénticos a los safetensors de la rama principal de Meta. Sobre esa base se aplica GPTQ para cuantizar las proyecciones lineales de las 32 capas a la retícula `bfloat8_b` de TT-NN. La innovación clave es que las matrices cuantizadas se almacenan como valores bf16 sobre la retícula BFP8, de forma que el empaquetador de TT-NN las lee sin modificar sus valores; el archivo `quant4.json` documenta el formato de cada proyección. La calibración se hizo con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los archivos `config.json`, `generation_config.json`, el tokenizer y `chat_template.jinja` provienen de unsloth/Llama-3.1-8B-Instruct y se incluyen sin cambios.

No se ha realizado un entrenamiento adicional ni un ajuste fino sobre el modelo base: se trata exclusivamente de una cuantización post-entrenamiento orientada al hardware. La validación se llevó a cabo con ttnn 0.81.1 sobre ttsim (simulador Blackhole). Con la configuración `--use_hf_rope`, todas las proyecciones de las dos primeras capas empaquetaron de forma exacta y un prefill de 2 capas coincidió con transformers con PCC 0.9988. El demo de tt-transformers empaqueta el head en `bfloat8_b`, por lo que el head bf16 de este checkpoint no es exacto en ese demo.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el formato Llama 3.1.
- Razonamiento y respuesta a instrucciones heredados del modelo Instruct original.
- Generación de código y resolución de problemas matemáticos (capacidades del modelo base, no reevaluadas en esta exportación).
- Soporte multilingüe en ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Integración con el ecosistema Tenstorrent: tt-metal, ttnn, tt-forge y tt-transformers.
- Ejecución en NPU Tensix (Wormhole, Blackhole) con empaquetado directo de pesos BFP8.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer` para inspección y validación en CPU/GPU.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Despliegue de un asistente conversacional en hardware Tenstorrent: el modelo se carga en una NPU Wormhole o Blackhole con ~9,52 GB de memoria de dispositivo para pesos, dejando margen para la caché KV y buffers en conversaciones multi-turno.
- Validación de pipelines de cuantización BFP8: investigadores pueden usar `pack_tensix.py` y `verify_grid.py` para comprobar que cada matriz empaquetada conserva sus valores exactos, sirviendo como referencia para otras exportaciones GPTQ sobre la retícula `bfloat8_b`.
- Inferencia de bajo consumo en entornos edge con aceleradores Tensix: al reducir el peso medio a 9,48 bits, se abarata el coste de memoria frente al checkpoint bf16 original y se habilita el despliegue en dispositivos con menos DRAM.
- Benchmarking de tt-metal y tt-transformers: el checkpoint se usa con `simple_text_demo.py` en modo performance batch-1 para medir latencia y throughput en configuraciones `precision_cfg`/`fidelity_cfg` concretas.
- Generación de código asistida en flujos de desarrollo internos: las capacidades de código del modelo base se mantienen, y la licencia Llama 3.1 permite uso comercial con las restricciones habituales.
- Atención al cliente multilingüe: el soporte de ocho idiomas y el contexto largo permiten gestionar conversaciones con historial extenso en español, inglés, francés, alemán, italiano, portugués, hindi y tailandés.
- Investigación en cuantización block-floating-point: el par BFP8/BFP4 publicado por Xylolabs permite comparar fidelidad y consumo de memoria en el mismo hardware y con el mismo flujo de calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una métrica de fidelidad interna: un prefill de 2 capas con `--use_hf_rope` alcanzó PCC 0.9988 frente a transformers, y todas las proyecciones de las dos primeras capas empaquetaron de forma exacta en ttsim con ttnn 0.81.1. No hay datos de MMLU, HumanEval, GSM8K ni de latencia/throughput medidos en hardware físico.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: ~9,52 GB solo para los pesos del modelo de lenguaje, más espacio adicional para caché KV y buffers.
- Aceleradores objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Para dispositivos con menos memoria, el autor recomienda la versión BFP4 del mismo modelo.
- Cabe en GPU consumer para inspección y validación en bf16 (el repositorio ocupa 16,1 GB), pero el objetivo de despliegue es la NPU Tensix, no la GPU.
- Opciones de despliegue: tt-metal v0.81.1 con tt-transformers (`simple_text_demo.py`), ttnn 0.81.1, tt-forge; también `transformers` con `device_map="auto"` y `dtype="bfloat16"` para pruebas fuera de Tensix.
- Validación: `pack_tensix.py` (con `--device` para round-trip por DRAM del dispositivo) y `verify_grid.py` (solo con torch).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8 | 8,03 B | 128.000 (heredado) | BFP8 + bf16 mixto | llama3.1 | Tensix (Wormhole, Blackhole) |
| Xylolabs Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4 | 8,03 B | 128.000 (heredado) | BFP4 + bf16 mixto | llama3.1 | Tensix con menos memoria |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | bf16 | llama3.1 | GPU/CPU genéricos |
| unsloth/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | bf16 (checkpoint de referencia) | llama3.1 | GPU/CPU genéricos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP8 introduce pérdida de precisión frente al checkpoint bf16 original; la model card solo garantiza coincidencia exacta en el empaquetado, no en la salida del modelo completo.
- El demo de tt-transformers empaqueta el head en `bfloat8_b`, por lo que el head bf16 de este checkpoint no es exacto en ese demo; debe tenerse en cuenta al comparar resultados.
- Es necesario pasar `--use_hf_rope` en tt-transformers; sin esa opción el demo permuta las filas q y k y recuantiza el QKV fusionado, alterando el comportamiento.
- La validación se realizó sobre ttsim (simulador Blackhole), no sobre hardware físico; el rendimiento real en Wormhole o Blackhole no está documentado.
- El modelo hereda los sesgos y el riesgo de alucinación del Llama-3.1-8B-Instruct original; no se han realizado evaluaciones de sesgo específicas para esta exportación.
- La licencia llama3.1 impone restricciones de uso comercial y requiere el cumplimiento de la política de uso aceptable de Meta; no es una licencia permisiva tipo Apache 2.0.
- El soporte de tool calling, function calling y modo thinking no está documentado en esta exportación, aunque el modelo base los soporta parcialmente.
- El contexto de 128.000 tokens es una herencia del modelo base y no se ha verificado en esta exportación.
- El repositorio tiene 94 descargas y 1 like en el momento de la ficha, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Versión BFP4: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4
- Checkpoint de referencia (unsloth): https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/tree/4699cc75b550f9c6f3173fb80f4703b62d946aa5
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia Llama 3.1: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
