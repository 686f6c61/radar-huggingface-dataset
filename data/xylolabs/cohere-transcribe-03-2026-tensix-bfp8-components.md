# Xylolabs/Cohere-Transcribe-03-2026-Tensix-BFP8-Components

## Resumen

Cohere-Transcribe-03-2026-Tensix-BFP8-Components es un repositorio de componentes de pesos derivado del modelo de reconocimiento de voz CohereLabs/cohere-transcribe-03-2026, preparado por Xylolabs para su ejecución sobre hardware Tenstorrent Tensix. No se trata de un modelo entrenado de forma independiente, sino de una exportación de los tensores de operadores del modelo original decodificados en formatos portables (BFP8, BF16 y FP32) para facilitar su integración en un runtime de inferencia sobre aceleradores Tensix.

El paquete contiene 69 ficheros de componentes que cubren el frontend y subsampling, 48 capas de encoder, 8 capas de decoder, la cabeza de salida y operandos estáticos. Los buckets de frames de encoder disponibles son 32, 64, 96, 128, 160, 192, 224, 256 y 384, con constantes de prompt de 10 tokens y 288 posiciones de decoder. El archivo no incluye adaptador de arquitectura, tokenizer ni lógica de ejecución: es material de pesos para integrar en una implementación propia.

La relevancia de esta ficha es acotada: sirve como referencia para quien necesite reconstruir el modelo de transcripción de Cohere sobre Tenstorrent, pero no es utilizable de forma autónoma. La licencia Apache 2.0 del modelo base se mantiene, y el autor documenta una verificación exhaustiva de que los 1.887 tensores decodificados coinciden con los valores fuente, con dos excepciones menores documentadas en NOTICE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para reconocimiento de voz (derivada del modelo base Cohere Transcribe) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 288 posiciones de decoder; buckets de frames de encoder de 32 a 384 (incluye 32, 64, 96, 128, 160, 192, 224, 256 y 384) |
| Tipos de cuantizacion | BFP8 (494 operandos), BF16 (1.258 operandos nativos), FP32 (135 operandos estáticos) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (componentes portables); representaciones bfloat8_b, bfloat16 y float32 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: exporta los tensores de un modelo base ya existente, CohereLabs/cohere-transcribe-03-2026, que es un sistema de reconocimiento de voz con arquitectura encoder-decoder. La exportación descompone el checkpoint original en 69 ficheros de componentes organizados por bloques: frontend/subsampling, 48 capas de encoder, 8 capas de decoder, cabeza de salida y operandos estáticos. Cada operando conserva su layout y preparación original, incluyendo el escalado de query plegado y la normalización por lotes (BatchNorm) ya integrada en los pesos.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica de esta exportación es la decodificación de operandos BFP8 almacenados en BF16, junto con un loader de streaming (`load_components.py`) que verifica hashes, nombres, formas, dtypes y valores finitos. La verificación reportada indica que los 1.887 tensores decodificados igualan sus valores fuente y se reempaquetan exactamente con TT-NN 0.81.1 en contexto de simulador, salvo dos tensores de taps depthwise (capas 6 y 29 del encoder) que difieren en 32 valores repetidos cada uno en un paso BF16, atribuido a diferencias de una ULP en dos salidas de `torch.sqrt` en FP32 durante el plegado de BatchNorm.

## Capacidades

- Reconocimiento de voz (speech recognition) sobre el modelo base Cohere Transcribe, en coreano e inglés.
- Ejecución sobre hardware Tenstorrent Tensix mediante componentes portables y loader de streaming.
- Carga selectiva por componente (por ejemplo, `encoder_00`) para gestionar memoria en dispositivos con recursos limitados.
- Soporte de múltiples buckets de frames de encoder (de 32 a 384) para adaptar la ventana de audio.
- Verificación de integridad de tensores (hashes, formas, dtypes y valores finitos) integrada en el loader.
- No incluye tokenizer, adaptador de arquitectura ni decodificación de texto: estas capacidades deben aportarse desde la implementación original.
- No se documentan tool calling, function calling, agentes, visión, audio adicional ni modo thinking.

## Casos de uso

- Integración en runtime Tenstorrent: usar los componentes como material de pesos para construir un pipeline de transcripción sobre aceleradores Tensix, aprovechando la organización por capas y los buckets de frames predefinidos.
- Sustitución de pesos en una implementación existente de Cohere Transcribe: cargar los operandos BFP8/BF16/FP32 en lugar del checkpoint original para reducir el espacio de almacenamiento en dispositivo (unos 2,44 GB de pesos más buffers de trabajo).
- Investigación en cuantización BFP8 sobre hardware especializado: emplear los 494 operandos BFP8 almacenados en BF16 como referencia para estudiar el impacto de la representación de bloque en la calidad de transcripción.
- Validación de fidelidad de exportaciones: reutilizar el loader y la metodología de verificación (comparación tensor a tensor, reempaquetado con TT-NN) para auditar otras conversiones de modelos.
- Desarrollo de adaptadores de arquitectura: los ficheros de componentes y `component.json` sirven como especificación de shapes, dtypes y layouts para implementar el adaptador que falta.
- Pruebas de memoria y planificación de despliegue: estimar requisitos de memoria en dispositivo (2,44 GB de pesos más buffers) antes de integrar el reconocedor completo en producción.
- Benchmarking de transcripción sobre Tensix: una vez integrado con tokenizer y decodificador, medir latencia y precisión en coreano e inglés sobre los buckets de frames disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de reconocimiento de voz en la información disponible. El autor indica explícitamente que "an integrated recognizer needs its own speech evaluation" y que "speed is not reported here". La única evaluación reportada es de fidelidad de los tensores: 1.887 tensores decodificados igualan los valores fuente, 1.885 se reconstruyen exactamente con la pila actual y 2 presentan diferencias de un paso BF16 en 32 valores repetidos cada uno.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: unos 2,44 GB solo para los pesos de componentes, más espacio para buffers de trabajo (el total portátil en disco es de aproximadamente 4,23 GB).
- Hardware objetivo: aceleradores Tenstorrent Tensix (la exportación está pensada para este backend, con verificación mediante TT-NN 0.81.1).
- GPU consumer: no se documenta compatibilidad con GPUs NVIDIA o AMD; el paquete está orientado a Tensix y requiere un adaptador de arquitectura para cualquier otro backend.
- Opciones de despliegue: carga mediante PyTorch, safetensors y `huggingface_hub` con el loader `load_components.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no reporta métricas de velocidad.
- Entorno de preparación declarado: Python 3.10.12, PyTorch 2.7.1+cpu y NumPy 1.26.4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/Cohere-Transcribe-03-2026-Tensix-BFP8-Components | no disponible | 288 posiciones de decoder; buckets de 32 a 384 frames | ko, en | Apache 2.0 | safetensors (BFP8/BF16/FP32) | Componentes para Tensix; requiere adaptador y tokenizer |
| CohereLabs/cohere-transcribe-03-2026 (modelo base) | no disponible | no disponible | ko, en (según este derivado) | Apache 2.0 | no disponible | Modelo original completo en Hugging Face |
| Otros modelos ASR open source (Whisper, etc.) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El repositorio no es un modelo ejecutable: requiere un adaptador de arquitectura, tokenizer y integración de runtime para producir transcripciones.
- No incluye la implementación original ni la lógica de decodificación de texto; sin ellas, los tensores no tienen utilidad práctica.
- Dos tensores de taps depthwise (capas 6 y 29 del encoder) presentan diferencias de un paso BF16 en 32 valores repetidos cada uno respecto a la reconstrucción con la pila actual; los valores del snapshot archivado se conservan sin cambios y se documentan en NOTICE.
- La verificación se realizó en contexto de simulador con TT-NN 0.81.1; no se reportan evaluaciones de calidad de transcripción ni de velocidad en hardware real.
- Idiomas limitados a coreano e inglés según los metadatos; no se documenta soporte de otros idiomas.
- Riesgo de alucinación y sesgos del modelo base: no disponible en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar LICENSE y NOTICE del repositorio y la model card del modelo base para conocer las condiciones exactas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Los resultados de búsqueda web proporcionados no contienen información relevante sobre el modelo (el único resultado trata de Mahngebühren y no guarda relación).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tensix-BFP8-Components
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Loader de componentes: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tensix-BFP8-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tensix-BFP8-Components/blob/main/LICENSE
- Repositorio de código del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
