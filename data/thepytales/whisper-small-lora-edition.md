# thepytales/whisper-small-lora-edition

## Resumen

Whisper Small – Lora Edition es una redistribución de los pesos de `openai/whisper-small` empaquetados en formato ONNX cuantizado a int8 para su uso con el runtime sherpa-onnx. Lo publica el usuario thepytales (bajo la marca PyTales) como artefacto listo para la app Lora, una aplicación de transcripción de voz. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son byte a byte idénticos a los del repositorio `csukuangfj/sherpa-onnx-whisper-small` en el commit `8f3c18b`, y el autor lo reconoce explícitamente en la model card. El modelo original es un transformer encoder-decoder de OpenAI especializado en reconocimiento automático del habla (ASR), con aproximadamente 244 millones de parámetros y una ventana de audio de 30 segundos.

La relevancia de esta ficha es acotada: no aporta mejoras de calidad sobre Whisper Small, sino una distribución concreta con checksums verificables, licencia Apache-2.0 y un formato de despliegue (ONNX int8 + sherpa-onnx) orientado a inferencia en CPU o dispositivos de borde. El etiquetado de idioma incluye `multilingual` y `de`, pero el autor no documenta ningún proceso de entrenamiento, ajuste o evaluación específico para alemán; se trata simplemente de las capacidades multilingües heredadas del modelo base.

El interés práctico, por tanto, está en la reproducibilidad del artefacto (SHA-256 publicados) y en la ligereza del despliegue (unos 375 MB en dos ficheros ONNX), no en una mejora de rendimiento. Cualquier evaluación de calidad debe remitirse a los benchmarks publicados por OpenAI para Whisper Small.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | Aproximadamente 244 M (heredados de openai/whisper-small; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Whisper procesa ventanas de audio de 30 s |
| Tipos de cuantizacion | int8 (ficheros `small-encoder.int8.onnx` y `small-decoder.int8.onnx`) |
| Idiomas soportados | Multilingüe (etiquetas `multilingual` y `de`); sin evaluación específica documentada |
| Licencia | Apache-2.0 (modelo); el código de OpenAI se distribuye bajo MIT, con texto de licencia incluido |
| Formato de pesos | ONNX int8 + fichero de tokens (`small-tokens.txt`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Small: un transformer encoder-decoder con atención estándar, entrenado por OpenAI sobre audio supervisado débilmente y orientado a transcripción multilingüe y traducción al inglés. Esta edición no modifica esa arquitectura: el autor solo exporta los pesos a ONNX, los cuantiza a int8 y los empaqueta junto con el vocabulario de tokens para sherpa-onnx. No hay información en la model card sobre número de tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación técnica adicional. El autor declara explícitamente que «los pesos no han sido modificados» y que los ficheros son idénticos byte a byte a la fuente `csukuangfj/sherpa-onnx-whisper-small` en el commit `8f3c18b`, con SHA-256 verificables.

La única intervención propia declarada es la selección del modelo, su medición en los dispositivos del autor y su configuración para la app Lora (contexto y plantilla). No se documenta ningún ajuste LoRA pese al nombre «Lora Edition», que hace referencia a la aplicación, no a la técnica de fine-tuning. Tampoco se especifica el proceso de cuantización (herramienta, calibración, precisión respecto al modelo en fp32).

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, heredado de Whisper Small.
- Traducción de audio a texto en inglés (capacidad nativa de Whisper).
- Detección de idioma y transcripción con marcas de tiempo a nivel de segmento (según las capacidades del modelo base; no verificado en esta edición).
- Inferencia en CPU y dispositivos de borde mediante sherpa-onnx, sin necesidad de GPU.
- Ejecución con los ficheros ONNX int8 empaquetados (encoder, decoder y tokens).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio en streaming nativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local en aplicaciones de escritorio o móviles: los dos ficheros ONNX int8 (112,4 MB el encoder y 262,2 MB el decoder) permiten embeber el modelo en la app Lora sin depender de servicios en la nube, con verificación de integridad mediante los SHA-256 publicados.
- Subtitulado de reuniones y notas de voz en CPU: sherpa-onnx está optimizado para inferencia en CPU, de modo que se puede procesar audio de hasta 30 s por ventana en portátiles sin GPU dedicada.
- Despliegue en dispositivos de borde (Raspberry Pi, mini-PC, routers con CPU ARM): el tamaño total del repositorio (0,4 GB) y el formato int8 lo hacen viable en hardware con poca memoria, siempre que se acepte la latencia propia de un modelo small.
- Pipelines de transcripción por lotes en servidores sin GPU: al ser ONNX, se puede integrar en servicios Python o C++ mediante el runtime de sherpa-onnx y paralelizar por procesos.
- Prototipado rápido de ASR multilingüe: útil para validar una interfaz de voz antes de invertir en modelos mayores, dado que la licencia Apache-2.0 permite uso comercial sin fricción.
- Verificación de cadena de suministro de modelos: los checksums SHA-256 y la referencia al commit de origen permiten auditar que los pesos no han sido alterados, un caso de uso relevante en entornos con requisitos de compliance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, latencia ni comparaciones con otras ediciones del modelo. Cualquier cifra de calidad debe tomarse de la evaluación oficial de OpenAI para Whisper Small, no de esta distribución.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal; el formato ONNX int8 está pensado para CPU. En GPU, la huella sería inferior a 1 GB, pero no se documenta soporte GPU en esta edición.
- GPU recomendadas: no disponible. El runtime sherpa-onnx prioriza CPU; no se especifican GPU validadas.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, RTX 3090 u otras; el despliegue previsto es en CPU.
- Opciones de despliegue: sherpa-onnx (runtime objetivo, indicado en los tags). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo ASR encoder-decoder.
- Latencia y throughput: no disponibles. El autor menciona haber medido el modelo en sus dispositivos, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thepytales/whisper-small-lora-edition | ~244 M (heredado) | ONNX int8 | 30 s (modelo base) | Apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | PyTorch (safetensors/bin) | 30 s | Apache-2.0 | Hugging Face |
| csukuangfj/sherpa-onnx-whisper-small | ~244 M | ONNX int8 | 30 s | Apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | PyTorch | 30 s | Apache-2.0 | Hugging Face |

La comparativa relevante es casi tautológica: esta edición es una copia byte a byte de la distribución de csukuangfj, con la misma licencia y el mismo formato. Frente a openai/whisper-small, la diferencia es el empaquetado ONNX int8 y el runtime sherpa-onnx; frente a whisper-base, la diferencia es el tamaño y, presumiblemente, la calidad, aunque no se aportan métricas en esta ficha.

## Limitaciones y advertencias

- No es un modelo nuevo ni un ajuste fino: los pesos son idénticos a los de `csukuangfj/sherpa-onnx-whisper-small` en el commit `8f3c18b`; el nombre «Lora Edition» se refiere a la app Lora, no a un entrenamiento LoRA.
- El autor declara que OpenAI no ha revisado ni aprobado esta edición; la responsabilidad de uso recae en la licencia original.
- No hay evaluación específica para alemán pese a la etiqueta `de`; el rendimiento en ese idioma es el del modelo base, sin métricas publicadas aquí.
- Riesgo de alucinación inherente a Whisper en audio con ruido, silencios largos o habla no estándar; no se documenta ningún mitigante en esta edición.
- Sesgos heredados del corpus de entrenamiento de OpenAI, no analizados en la model card.
- La cuantización int8 puede degradar ligeramente la precisión respecto a fp32; no se publica comparación de WER entre ambas versiones.
- Ventana de audio limitada a 30 s por inferencia (característica del modelo base); para audio más largo se requiere segmentación externa.
- Sin soporte documentado de GPU, streaming nativo ni tool calling; no debe evaluarse como modelo de propósito general.
- Licencia Apache-2.0 para el modelo y MIT para el código de OpenAI, con los textos incluidos en el repositorio; el uso comercial está permitido, pero conviene conservar los avisos de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thepytales/whisper-small-lora-edition
- Modelo base: https://huggingface.co/openai/whisper-small
- Fuente de los ficheros ONNX: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-small
- Runtime sherpa-onnx: no se proporciona enlace en la información disponible
- Paper de Whisper: no se proporciona enlace en la información disponible
