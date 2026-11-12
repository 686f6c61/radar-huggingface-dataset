# Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4

## Resumen

Llama-3.1-8B-Instruct-Tensix-BFP4 es una versión cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct desarrollada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila de software tt-metal y TT-NN. La cuantización aplica GPTQ con búsqueda de exponente por bloque sobre las capas lineales, mapeando los pesos al formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4), que emplea 4,5 bits por peso.

El resultado es un checkpoint de 6,03 GB empaquetados con una media de 6,00 bits por peso, en el que las capas de atención (q, k, v, o) y las del MLP (gate, up, down) de las 32 capas están en BFP4, mientras que el LM head, los embeddings, las normas y el resto de tensores permanecen en bf16. Los ficheros se distribuyen en bf16 con cada valor ya alineado a la rejilla BFP4, de modo que TT-NN los empaqueta directamente sin transformación adicional.

El modelo hereda las capacidades del Llama 3.1 8B Instruct original: generación de texto conversacional, razonamiento, código y soporte multilingüe en ocho idiomas. Su relevancia radica en que permite desplegar un modelo de 8B parámetros en hardware Tenstorrent con una huella de memoria reducida a prácticamente un tercio del tamaño en bf16, manteniendo una fidelidad respecto al modelo original medida en KL de 0,04686 y un 89,95 % de top-1 sobre 16.056 posiciones de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), capas lineales cuantizadas a BFP4 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en atención y MLP; bf16 en LM head, embeddings, normas y resto de tensores; media de 6,00 bits/peso |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP4), mas `quant4.json` con el formato de cada proyección |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Llama 3.1 8B Instruct de Meta: un transformer decoder-only con 32 capas, atención multi-cabeza con GQA y las proyecciones estándar de atención y MLP. Sobre esta base, Xylolabs aplica una cuantización post-entrenamiento con GPTQ y una búsqueda de exponente por bloque para ajustar los pesos a la rejilla del formato de coma flotante por bloques BFP4 que consumen los NPU Tensix. La calibración se realizó sobre 262.144 tokens de WikiText-2 y Wikipedia en coreano, con un 45 % de contenido en inglés, según la configuración `configs/llama-3.1-8b-cal4x.toml` del repositorio tensix-bfp-gptq.

Los pesos en bf16 a partir de los cuales se exportó la cuantización son idénticos byte a byte a los de la rama principal de meta-llama/Llama-3.1-8B-Instruct. Los ficheros `config.json`, `generation_config.json`, el tokenizer y la plantilla de chat (`chat_template.jinja`) provienen sin modificaciones de unsloth/Llama-3.1-8B-Instruct. No se ha realizado ningún reentrenamiento ni ajuste fino adicional: se trata exclusivamente de una cuantización de las capas lineales con preservación del resto de tensores en bf16.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el formato de Llama 3.1.
- Razonamiento y respuesta a instrucciones, heredados del modelo Instruct original.
- Generación de código y resolución de problemas matemáticos, en la medida en que lo soporta el modelo base de 8B.
- Soporte multilingüe en inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Capacidad de tool calling y function calling heredada del Llama 3.1 Instruct (no verificada específicamente en esta cuantización).
- Integración con la pila Tenstorrent: empaquetado directo en TT-NN con `ttnn.bfloat4_b` y verificación de round-trip a través de DRAM del dispositivo.
- Compatibilidad con `transformers` para inferencia en GPU/CPU convencional usando los pesos en bf16.
- No se documentan modos de pensamiento explícito, visión ni audio en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para ejecutarse en NPU Wormhole y Blackhole mediante TT-NN, con un peso empaquetado de 6,03 GB que reduce la presión sobre la DRAM del dispositivo frente a los 16,06 GB en bf16.
- Inferencia conversacional de bajo coste en servidores con hardware Tensix: la cuantización BFP4 permite servir un modelo de 8B con una fidelidad del 89,95 % en top-1 respecto al original, adecuada para asistentes y chatbots internos.
- Prototipado y validación en el simulador ttsim: el modelo se ha probado con ttnn 0.81.1 sobre el simulador Blackhole, lo que facilita el desarrollo y la verificación de pipelines antes de disponer de hardware físico.
- Integración en pipelines de `transformers`: al cargarse con `AutoModelForCausalLM` en bf16, puede usarse en entornos estándar de GPU para evaluación, generación por lotes o comparación con otras cuantizaciones.
- Evaluación de técnicas de cuantización: sirve como referencia para estudiar el impacto de BFP4 con GPTQ frente a alternativas como Q4_K_M de llama.cpp, con métricas de KL y top-1 publicadas.
- Generación de texto multilingüe en ocho idiomas: útil para aplicaciones de traducción asistida, resumen o atención al cliente en mercados europeos y asiáticos cubiertos por el modelo base.
- Investigación en eficiencia de memoria: el formato de 4,5 bits por peso en capas lineales permite estudiar compromisos entre precisión y huella de memoria en hardware especializado.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B-Instruct) | 16 | 16,06 | 0 | 100 | 28 de 33 | - |
| Este modelo (BFP4) | 6,00 | 6,028 | 0,04686 | 89,95 | 28 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,89 | 4,921 | 0,03235 | 91,06 | 30 de 33 | 0 |

Las métricas de KL y top-1 se calculan sobre 16.056 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), tanto en texto plano como con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. El criterio de aceptación del autor exige una KL media no superior a 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; el modelo lo cumple con 1,45 veces la KL de Q4_K_M. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 (vía `transformers`): aproximadamente 16 GB de pesos más overhead de activaciones y caché KV, por lo que se recomienda al menos 20-24 GB.
- Huella empaquetada en Tensix: 6,03 GB, lo que permite alojar el modelo en la DRAM de dispositivos Wormhole y Blackhole.
- GPU recomendadas para uso con `transformers`: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; en GPUs con menos memoria sería necesario recurrir a otras cuantizaciones no incluidas en este repo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización adicional no provista.
- Opciones de despliegue: TT-NN / tt-metal sobre hardware Tensix (probado en el simulador ttsim con ttnn 0.81.1, no en hardware físico según la model card); `transformers` con `device_map="auto"`; text-generation-inference figura entre las etiquetas del repo.
- Latencia y throughput: no disponibles en la información proporcionada. La model card indica que tt-transformers y tt-forge no se han ejecutado con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Llama-3.1-8B-Instruct-Tensix-BFP4) | 8,03 B | no disponible (base: 128k) | BFP4, 6,00 bits/peso medio | llama3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct (BF16) | 8,03 B | 128k | bf16, 16 bits/peso | llama3.1 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,03 B | 128k | GGUF Q4_K_M, 4,89 bits/peso | llama3.1 | Generado localmente |
| unsloth/Llama-3.1-8B-Instruct | 8,03 B | 128k | bf16 | llama3.1 | Hugging Face |

La comparación directa con Q4_K_M muestra que este modelo ocupa más espacio (6,03 GB frente a 4,92 GB) y tiene peor KL (0,047 frente a 0,032) y top-1 (89,95 % frente a 91,06 %), pero está diseñado específicamente para el formato nativo de TT-NN en hardware Tensix, donde Q4_K_M no es directamente consumible. Frente al BF16 original, reduce el tamaño a aproximadamente el 37,5 % con una pérdida de fidelidad moderada.

## Limitaciones y advertencias

- La cuantización BFP4 introduce degradación medible: KL media de 0,04686 y top-1 del 89,95 % frente al 100 % del BF16, con una respuesta perdida de 33 en la evaluación del autor.
- El modelo solo se ha probado en el simulador ttsim de Tenstorrent (ttnn 0.81.1); no hay validación publicada en hardware Wormhole o Blackhole físico.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, por lo que la integración con esas pilas no está verificada.
- La calibración de GPTQ usó un 45 % de inglés y el resto coreano; el rendimiento en otros idiomas puede degradarse de forma no medida.
- Riesgo de alucinación inherente al modelo base Llama 3.1 8B Instruct, no mitigado por la cuantización.
- Sesgos heredados del modelo original de Meta, no evaluados ni corregidos en esta versión.
- La licencia llama3.1 impone restricciones de uso comercial y requiere el cumplimiento de la política de uso aceptable de Meta; es necesario revisar los términos antes de un despliegue en producción.
- El repo no incluye cuantizaciones GGUF ni formatos alternativos; para GPUs con menos de 16 GB sería necesario generar una cuantización adicional.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Configuración de calibración: https://github.com/XylolabsInc/tensix-bfp-gptq/blob/3d51048/configs/llama-3.1-8b-cal4x.toml
- Config y tokenizer de unsloth: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/tree/4699cc75b550f9c6f3173fb80f4703b62d946aa5
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia Llama 3.1: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4/blob/main/LICENSE
