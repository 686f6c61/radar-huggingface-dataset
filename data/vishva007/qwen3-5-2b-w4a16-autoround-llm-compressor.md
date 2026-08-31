# Vishva007/Qwen3.5-2B-W4A16-AutoRound-LLM-Compressor

## Resumen

El modelo Vishva007/Qwen3.5-2B-W4A16-AutoRound-LLM-Compressor es una versión cuantizada del modelo Qwen/Qwen3.5-2B, desarrollada por Vishva007 (Vishva R). Utiliza el método AutoRound de Intel, basado en descenso por gradiente de signo, para reducir los pesos a 4 bits manteniendo las activaciones en 16 bits (W4A16). El objetivo es ofrecer una versión del modelo con una reducción de memoria de aproximadamente el 50 % respecto al modelo base en FP16, lo que permite su despliegue en GPUs de consumo y de gama media.

El modelo incorpora soporte para Multi-Token Prediction (MTP), lo que habilita la decodificación especulativa en backends compatibles como vLLM, mejorando el rendimiento de inferencia. Con 2.213.241.664 parámetros y un tamaño de repositorio de 2,7 GB, esta cuantización se ha calibrado con 512 muestras y 1000 iteraciones, buscando mantener la calidad del modelo original con una degradación mínima.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 2B parámetros en hardware limitado, manteniendo la compatibilidad con el ecosistema de Hugging Face y backends de inferencia como vLLM, SGLang y AutoGPTQ.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-2B) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (calibración con secuencias de 4096 tokens) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), group size 32, simétrico |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización W4A16 del Qwen3.5-2B, un modelo de tipo transformer denso. La cuantización se realizó con AutoRound, el método de Intel basado en descenso por gradiente de signo que optimiza los valores de redondeo y los rangos de clipping durante el proceso. Se utilizaron 1000 iteraciones con 512 muestras de calibración y una longitud de secuencia de 4096 tokens, con cuantización simétrica y group size de 32. El proceso incluyó torch compile para optimizar el rendimiento.

El modelo mantiene el soporte de Multi-Token Prediction (MTP) del modelo base, lo que permite decodificación especulativa en backends compatibles. No se dispone de información detallada sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-2B.
- Generación de código: soporte heredado del modelo base.
- Tool calling / function calling: soporte heredado del modelo base (no confirmado explícitamente en la documentación proporcionada).
- Decodificación especulativa: soporte MTP con `num_speculative_tokens` configurable (1 por defecto, hasta 3 recomendado).
- Compatibilidad con backends de inferencia: vLLM, SGLang, AutoGPTQ y transformers.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPUs de consumo: con una reducción de memoria de aproximadamente el 50 % frente a FP16, el modelo puede ejecutarse en GPUs con 4-6 GB de VRAM, como RTX 3060 o RTX 4060, para aplicaciones de chat y generación de texto.
- Inferencia de baja latencia en entornos edge: el tamaño reducido y el soporte MTP permiten respuestas rápidas en dispositivos con recursos limitados.
- Servicio de modelos en producción con vLLM: la compatibilidad con compressed-tensors y AutoRound permite integrar el modelo en pipelines de vLLM con decodificación especulativa activada mediante `--speculative_config '{"method":"mtp","num_speculative_tokens":3}'`.
- Prototipado rápido de aplicaciones LLM: al ser un modelo pequeño y cuantizado, es adecuado para experimentar con agentes, RAG y otras aplicaciones sin necesidad de infraestructura costosa.
- Evaluación de técnicas de cuantización: el modelo sirve como referencia para comparar el impacto de AutoRound frente a otros métodos de cuantización en la familia Qwen3.5.
- Fine-tuning posterior a la cuantización: aunque no se documenta explícitamente, el formato compressed-tensors permite ajustes adicionales con herramientas del ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,2-3 GB para inferencia en W4A16 (2.213.241.664 parámetros × 0,5 bytes por peso en 4 bits, más overhead de activaciones y caché KV).
- GPUs compatibles: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.). También compatible con GPUs de datacenter como A10, A100 o H100.
- Opciones de despliegue: vLLM (con soporte MTP), SGLang, AutoGPTQ, transformers.
- Latencia y throughput: no disponible en la información proporcionada. El soporte MTP puede mejorar el throughput en vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.5-2B (base) | 2.213.241.664 | FP16 | no disponible | Apache 2.0 |
| Vishva007/Qwen3.5-2B-W4A16-AutoRound | 2.213.241.664 | W4A16 (AutoRound) | no disponible | Apache 2.0 |
| Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound | no disponible | W4A16 (AutoRound) | no disponible | no disponible |

La comparativa se limita a los modelos de los que se dispone información. El modelo cuantizado mantiene los mismos parámetros que el base, con una reducción de memoria de aproximadamente el 50 %. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- La cuantización W4A16 puede introducir una degradación leve en la precisión respecto al modelo base FP16, aunque la configuración de alta calidad (1000 iteraciones, 512 muestras) busca minimizarla.
- No se dispone de información sobre sesgos del modelo ni sobre su comportamiento en dominios específicos.
- La longitud de contexto efectiva no está documentada; la calibración se realizó con secuencias de 4096 tokens, pero el límite real depende del modelo base.
- El soporte de idiomas no está documentado; se recomienda verificar la página del modelo base Qwen/Qwen3.5-2B.
- El modelo tiene solo 13 descargas y 0 likes en el momento de la consulta, lo que indica una adopción limitada y poca validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.5-2B-W4A16-AutoRound-LLM-Compressor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor: https://huggingface.co/Vishva007
- Repositorio de AutoRound: https://github.com/intel/auto-round
- Documentación de LLM Compressor para Qwen3.5: https://docs.vllm.ai/projects/llm-compressor/en/latest/key-models/qwen3.5/
- Ejemplo de cuantización W4A16 con AutoRound: https://github.com/vllm-project/llm-compressor/blob/main/examples/autoround/quantization_w4a16/README.md
