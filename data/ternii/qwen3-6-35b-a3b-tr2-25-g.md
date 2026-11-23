# Ternii/Qwen3.6-35B-A3B-TR2.25-G

## Resumen

Qwen3.6-35B-A3B-TR2.25-G es una versión cuantizada del modelo Qwen3.6-35B-A3B del equipo Qwen, publicada por el usuario Ternii (Wai Chung) bajo licencia Apache-2.0. Se trata de una traducción de pesos a aritmética ternaria mediante la técnica propietaria TR Quantisation: cada peso se almacena como un dígito ternario (trit) codificado en una rejilla simétrica de 9, 27 o 81 niveles, con una escala de 16 bits por cada grupo de 128 pesos. El resultado es una media de 2,25 trits por peso, de ahí el sufijo TR2.25-G, donde la "G" indica que los códigos se calibraron con GPTQ.

El modelo conserva la arquitectura, el tokenizador y la plantilla de chat originales de Qwen, sin reentrenamiento ni fine-tuning. Es un transformer de tipo mixture-of-experts (MoE) con 35B parámetros nominales en el modelo base, aunque el checkpoint safetensors de este repositorio declara 10.233.365.632 parámetros reales (el modelo de texto, con el codificador de visión eliminado). La relevancia principal es de eficiencia: reduce el peso en memoria de 19,55 GiB (checkpoint NVFP4 de NVIDIA) a 16,09 GiB, y acelera la decodificación aproximadamente un 41 % a un usuario, manteniendo una precisión comparable en los benchmarks centrales.

Su despliegue requiere el plugin `tritq-qwen36` sobre vLLM 0.28.0, distribuido como imagen Docker, y está pensado para hardware como el NVIDIA DGX Spark. Existe una variante GGUF para Mac y llama.cpp publicada en un repositorio separado. El modelo está orientado a generación de texto y conversación, y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), cuantización ternaria TR (trits con escala de 16 bits por grupo de 128 pesos) |
| Parámetros totales | 10.233.365.632 (checkpoint de texto, sin codificador de visión) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 16384`) |
| Tipos de cuantización | TR2.25-G: media de 2,25 trits por peso, rejilla simétrica de 9/27/81 niveles, calibración GPTQ; cabeza MTP en block floating point de 8 bits |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tensores trit empaquetados); variante GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura mixture-of-experts. Esta versión no modifica la arquitectura, el tokenizador ni la plantilla de chat: la intervención consiste exclusivamente en la cuantización de los pesos. Cada peso se representa como un código entero pequeño sobre una rejilla ternaria simétrica de 9, 27 o 81 niveles, con una única escala de 16 bits compartida por cada grupo de 128 pesos. La calibración de los códigos se realizó con GPTQ, sin reentrenamiento ni fine-tuning posterior.

El repositorio contiene el modelo de texto (sin el codificador de visión del modelo base) en tensores trit empaquetados, más la cabeza de predicción multi-token (MTP) en block floating point de 8 bits, junto con el tokenizador, la plantilla de chat y la configuración de Qwen. La innovación técnica destacable es la decodificación especulativa basada en la cabeza MTP con un mecanismo de parada por confianza (confidence stop): con una sola petición en decodificación se generan hasta 6 tokens borrador y se detiene cuando la probabilidad top-1 del borrador cae por debajo de 0,7; con dos o más peticiones se generan 3. El modelo completo verifica cada borrador con el vocabulario completo, y la cabeza borrador puede configurarse como dispersa (todas las lenguas), solo inglés (primeras 100.000 filas del vocabulario) o completa. Los datasets citados en las etiquetas (nvidia/OpenCodeInstruct, EleutherAI/hendrycks_math, openai/gsm8k) aparecen como referencia, aunque no se documenta su uso en un proceso de entrenamiento de esta versión cuantizada.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y matemáticas: resultados medidos en GSM8K (90,83) y MGSM multilingüe (81,9).
- Generación de código: HumanEval+ (88,41) y MBPP+ (76,72).
- Function calling: BFCL v4 con 81,5 puntos.
- Seguimiento de instrucciones: IFEval en modo prompt strict con 82,62.
- Conocimiento general y razonamiento: MMLU-Pro con 77,7.
- Decodificación especulativa con cabeza MTP y parada por confianza configurable.
- Modo thinking del modelo base (los benchmarks se ejecutaron con thinking desactivado mediante `enable_thinking: false`).
- Sin capacidades de visión en este repositorio: el codificador de visión fue eliminado (se sirve con `--language-model-only`); el autor indica que una variante con la torre de visión "podría seguir".

## Casos de uso

- Servicio de chat en inglés sobre DGX Spark: el modelo cabe en 16,09 GiB de pesos en GPU y ofrece 180,9 tokens/s de decodificación a un usuario, adecuado para asistentes conversacionales de baja latencia en hardware de borde.
- Generación de código en pipelines de desarrollo: con HumanEval+ de 88,41 y MBPP+ de 76,72, puede integrarse como asistente de código o generador de tests en flujos automatizados, siempre que el prompt esté en inglés.
- Automatización con function calling: los 81,5 puntos en BFCL v4 permiten usarlo como motor de agentes que invocan herramientas, con especial buen comportamiento en declinar llamadas irrelevantes.
- Razonamiento matemático en inglés: GSM8K de 90,83 lo hace apto para tutores o verificadores de problemas aritméticos de enunciado, aunque no se recomienda para matemáticas multilingües por su MGSM más bajo.
- Servicio multiusuario con throughput moderado: a 4 y 8 usuarios mantiene 82,4 y 54,1 tokens/s por usuario en respuestas largas, útil para despliegues pequeños en una sola GPU con `--max-num-seqs 8`.
- Evaluación e investigación sobre cuantización ternaria: sirve como banco de pruebas para comparar TR2.25-G frente a NVFP4 en precisión y velocidad con el mismo servidor vLLM.
- Despliegue en Mac o entornos llama.cpp: mediante la variante GGUF del repositorio `Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF`, para pruebas locales fuera de GPU NVIDIA.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando TR2.25-G con el checkpoint `nvidia/Qwen3.6-35B-A3B-NVFP4`, en el mismo DGX Spark y con las mismas opciones de servidor vLLM 0.28.0, solo texto y thinking desactivado:

| Benchmark | TR2.25-G | NVIDIA NVFP4 |
|---|---|---|
| GSM8K | 90,83 | 91,10 |
| HumanEval+ | 88,41 | 89,02 |
| MBPP+ | 76,72 | 76,19 |
| IFEval (prompt strict) | 82,62 | 84,29 |
| MMLU-Pro | 77,7 | 77,3 |
| BFCL v4 (function calling) | 81,5 | 79,2 |
| MGSM (11 idiomas) | 81,9 | 84,2 |

Métricas de eficiencia medidas:

| Métrica | TR2.25-G | NVIDIA NVFP4 |
|---|---|---|
| Pesos en memoria GPU | 16,09 GiB | 19,55 GiB |
| Con cabeza MTP y borrador | 17,43 GiB | 21,13 GiB |
| Decodificación, 1 usuario | 180,9 tok/s | 128,0 tok/s |
| Decodificación por usuario a 4 / 8 usuarios | 82,4 / 54,1 tok/s | 70,5 / 49,6 tok/s |
| Procesamiento de prompt (2.048 tokens) | ~3,4k tok/s | ~5,2k tok/s |

El propio autor advierte que "sin diferencia significativa" no equivale a igualdad: con estos tamaños de test solo se detectarían diferencias de unos 2 puntos (GSM8K) a 4 puntos (HumanEval+). La comparación de MGSM se ejecutó con la ruta de motor propia del autor, no con vLLM estándar.

## Requisitos de hardware

- VRAM para pesos: 16,09 GiB (modelo de texto, sin cabeza MTP); 16,99 GiB con cabeza MTP y cabeza borrador inglés+código; 17,43 GiB con cabeza borrador dispersa.
- GPU de referencia en las mediciones: NVIDIA DGX Spark (una sola GPU). El autor no documenta otros modelos de GPU.
- No se confirma compatibilidad con GPU de consumo (RTX 4090, etc.) en la información proporcionada; los 16-17 GiB de pesos más caché KV dejan poco margen en tarjetas de 24 GiB.
- Despliegue principal: vLLM 0.28.0 con el plugin `tritq-qwen36`, distribuido como imagen Docker `ghcr.io/ternii-ai/tritq-qwen36:0.2` o construible desde `github.com/ternii-ai/tritq-vllm`.
- Despliegue alternativo: llama.cpp y Mac mediante la variante GGUF.
- Configuración de referencia: `--max-model-len 16384 --max-num-seqs 8 --gpu-memory-utilization 0.6 --kv-cache-dtype fp8 --language-model-only --speculative-config '{"method":"mtp","num_speculative_tokens":6}'`.
- Throughput medido: 180,9 tok/s a un usuario; 82,4 y 54,1 tok/s por usuario a 4 y 8 usuarios; procesamiento de prompt de ~3,4k tok/s con 2.048 tokens.
- La parada por confianza cuesta aproximadamente un 2 % por flujo en escenarios de 4-8 usuarios; para servicio multiusuario se recomienda `-e TQ_CSTOP=` con `num_speculative_tokens: 3`.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato/cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-TR2.25-G (este) | 10.233.365.632 (checkpoint de texto) | safetensors trit, 2,25 trits/peso | no disponible | Apache-2.0 | Hugging Face, requiere plugin vLLM propio; GGUF separado |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | mismo modelo base | NVFP4 | no disponible | Apache-2.0 (heredada del base) | Hugging Face, vLLM estándar |
| Qwen/Qwen3.6-35B-A3B (base) | 35B nominales (MoE) | BF16 original | no disponible | Apache-2.0 | Hugging Face |

Frente a NVFP4, este checkpoint es un 18 % más pequeño, un 41 % más rápido en decodificación a un usuario y un 35 % más lento en procesamiento de prompt, con precisión equivalente en los benchmarks centrales y peor en MGSM. Frente al modelo base en BF16, la ventaja es de tamaño y velocidad de decodificación, a costa de requerir un runtime específico. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo declara soporte de inglés; el rendimiento multilingüe es significativamente inferior (MGSM 81,9 frente a 84,2 de NVFP4, con la mayor caída en bengalí).
- El procesamiento de prompt es más lento que NVFP4 (×0,65), lo que penaliza cargas con prompts largos o RAG intensivo.
- Requiere un plugin y una imagen Docker propios sobre vLLM 0.28.0; no funciona con vLLM estándar sin el plugin `tritq-qwen36`.
- La cabeza borrador y la parada por confianza no son neutrales en la salida: pueden cambiar el texto generado de forma greedy en algunos prompts por diferencias de redondeo en coma flotante.
- Sin codificador de visión en este repositorio: no admite entradas de imagen aunque el modelo base sí las soporte.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad ni de sesgos en la información disponible.
- Los benchmarks del autor tienen poder de detección limitado (diferencias de 2-4 puntos) y la comparación de BFCL v4 y MGSM se realizó con configuraciones de servidor no idénticas entre modelos.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime propietario de cuantización.
- El modelo se publica con `inference: false` en la model card: no es directamente servible sin el runtime indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint de comparación NVFP4: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Variante GGUF: https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF
- Runtime y plugin vLLM: https://github.com/ternii-ai/tritq-vllm
- Imagen Docker: ghcr.io/ternii-ai/tritq-qwen36:0.2
