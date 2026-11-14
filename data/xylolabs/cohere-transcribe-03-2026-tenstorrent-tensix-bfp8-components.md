# Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix-BFP8-Components

## Resumen

Cohere-Transcribe-03-2026-Tenstorrent-Tensix-BFP8-Components es un export de tensores de operadores derivado del modelo de reconocimiento de voz CohereLabs/cohere-transcribe-03-2026, preparado por Xylolabs para su ejecución sobre hardware Tenstorrent Tensix. No se trata de un modelo entrenado de nuevo ni de un checkpoint listo para inferencia, sino de un archivo de componentes portables (69 ficheros) que cubren el frontend y subsampling, 48 capas de encoder, 8 capas de decoder, la cabeza de salida y operandos estáticos, decodificados a formatos nativos BFP8, BF16 y FP32.

El paquete resuelve un problema de portabilidad: permite transportar y verificar los pesos del modelo original preservando cada valor almacenado, de modo que un integrador pueda reconstruir la arquitectura sobre el stack TT-NN de Tenstorrent sin depender de la serialización original. Requiere un adaptador de arquitectura, tokenizer y runtime de integración; por sí solo no ejecuta reconocimiento de voz.

Es relevante para desarrolladores que trabajan en despliegue de ASR sobre aceleradores Tenstorrent y necesitan una base de pesos verificada y con checksums. El repo ocupa 4,2 GB y los pesos de componentes consumen aproximadamente 2,44 GB de memoria de dispositivo antes de buffers de trabajo. No se han publicado datos de rendimiento ni evaluaciones de reconocimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para reconocimiento de voz (según modelo base Cohere Transcribe); export de componentes para Tensix |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (buckets de frames de encoder: 32, 64, 96, 128, 160, 192, 224, 256 y 384; 288 posiciones de decoder con prompts de 10 tokens) |
| Tipos de cuantización | BFP8 (494 operandos, valores exactos almacenados en BF16), BF16 nativo (1.258 operandos), FP32 (135 operandos estáticos) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (componentes portables), con component.json para metadatos de nombres, formas, dtypes y layouts |
| Tamaño del repo | 4,2 GB (tensores portables ~4,23 GB; empaquetado nativo ~2,44 GB) |
| Memoria de dispositivo estimada | ~2,44 GB para pesos de componentes, más buffers de trabajo |
| Hardware objetivo | Tenstorrent Tensix (TT-NN 0.81.1) |
| Librería | PyTorch |

## Arquitectura y entrenamiento

El modelo base es Cohere Transcribe 03-2026, un sistema de reconocimiento de voz con arquitectura encoder-decoder. El export de Xylolabs descompone ese modelo en 69 ficheros de componentes: frontend y subsampling, 48 capas de encoder, 8 capas de decoder, cabeza de salida y operandos estáticos. Cada operando conserva su layout y preparación original, incluyendo el escalado de query plegado (folded query scaling) y las capas de batch normalization, lo que implica que el adaptador de integración debe respetar esas transformaciones.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original dentro de la información proporcionada. El export en sí no entrena nada: es una decodificación y repaquetado de tensores. La validación realizada confirma que los 1.887 tensores decodificados igualan sus valores fuente y se repaquetan exactamente a través de sus formatos y layouts nativos con TT-NN 0.81.1 en contexto de simulador. La reconstrucción con el stack actual reproduce 1.885 tensores de forma exacta; dos tensores de tap depthwise plegados (capas de encoder 6 y 29) difieren en 32 valores repetidos cada uno en un paso BF16 en un coeficiente, diferencia atribuida a variaciones de una ULP en dos salidas de `torch.sqrt` en float32 durante el plegado de BatchNorm, dependientes de la CPU. Los valores del snapshot archivado se mantienen sin cambios y las diferencias se documentan en NOTICE.

## Capacidades

- Reconocimiento de voz (speech recognition) en coreano e inglés, heredado del modelo base Cohere Transcribe 03-2026.
- Procesamiento de audio con buckets de frames de encoder configurables (32 a 384), lo que permite adaptar la ventana de entrada a distintas duraciones.
- Decodificación autorregresiva con 288 posiciones de decoder y prompts de 10 tokens.
- Transporte y verificación de pesos: el loader comprueba hashes de fichero, nombres, formas, dtypes almacenados y valores finitos.
- Preservación exacta de operandos en BFP8, BF16 y FP32 con layouts nativos registrados en component.json.
- No incluye por sí mismo tokenizer, adaptador de arquitectura ni runtime de ejecución; estas piezas deben aportarse desde la implementación original.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR en la información disponible.

## Casos de uso

- Despliegue de ASR sobre aceleradores Tenstorrent: el paquete proporciona los operandos ya decodificados y verificados para cargarlos en el stack TT-NN, evitando tener que reconvertir el checkpoint original en cada integración.
- Validación de integridad en pipelines de producción: el loader verifica hashes y valores finitos, lo que permite detectar corrupción de pesos durante la distribución de artefactos a nodos de inferencia.
- Investigación en cuantización BFP8: los 494 operandos BFP8 con valores exactos almacenados en BF16 permiten estudiar el impacto de la representación de bloque en la calidad del reconocimiento sin perder la referencia original.
- Portabilidad entre stacks: al estar en safetensors con metadatos en component.json, los componentes se pueden inspeccionar y comparar contra la implementación de referencia para auditar transformaciones como el plegado de BatchNorm.
- Transcripción de audio en inglés y coreano: una vez integrado con el tokenizer y el adaptador de arquitectura, el modelo puede emplearse para dictado, subtitulado o indexación de audio en esos dos idiomas.
- Benchmarking de hardware: sirve como base para medir latencia y throughput de un encoder-decoder ASR sobre Tensix, aunque el propio repo no publica cifras de velocidad.
- Archivado a largo plazo de pesos: el snapshot preserva los valores fuente con checksums verificados, útil como referencia reproducible para comparaciones futuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de reconocimiento de voz (WER, CER) ni métricas de latencia o throughput en la información disponible. La única evaluación documentada es de integridad de tensores: 1.887 tensores decodificados igualan sus valores fuente, 1.885 se reconstruyen exactamente con el stack actual y dos presentan una diferencia de un paso BF16 en un coeficiente. El autor indica explícitamente que un reconocedor integrado necesita su propia evaluación de voz y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 2,44 GB para pesos de componentes en empaquetado nativo, más espacio para buffers de trabajo.
- Almacenamiento: 4,2 GB para el repositorio completo (tensores portables ~4,23 GB).
- Hardware objetivo: aceleradores Tenstorrent Tensix; validado con TT-NN 0.81.1 en contexto de simulador.
- GPU convencionales (A100, H100, RTX 4090): no se documenta soporte ni requisitos de VRAM para estas plataformas en la información disponible.
- Despliegue: carga mediante PyTorch, safetensors y huggingface_hub con el script `load_components.py`; requiere adaptador de arquitectura, tokenizer y runtime de integración propios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix-BFP8-Components | Export de componentes ASR (base Cohere Transcribe 03-2026) | ko, en | Apache 2.0 | safetensors (BFP8/BF16/FP32) | Tenstorrent Tensix |
| CohereLabs/cohere-transcribe-03-2026 | Modelo ASR original | no disponible en esta ficha | Apache 2.0 (según el export) | no disponible | no disponible |
| Alternativas ASR de propósito general (Whisper, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo ejecutable de forma autónoma: requiere adaptador de arquitectura, tokenizer y runtime de integración; el ejemplo del repositorio solo carga tensores.
- Cobertura lingüística limitada a coreano e inglés según los metadatos; el rendimiento en otros idiomas no está documentado.
- Dos tensores (capas de encoder 6 y 29) presentan una diferencia de un paso BF16 en un coeficiente respecto a la reconstrucción con el stack actual; los valores archivados se mantienen y la diferencia se documenta en NOTICE, pero un integrador debe verificarla.
- El motivo de la diferencia de ruta de código en `torch.sqrt` dependiente de CPU queda sin verificar según el autor.
- No se publican métricas de calidad de transcripción (WER/CER) ni de velocidad; cualquier evaluación de producción debe realizarse por separado.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar LICENSE y NOTICE y citar la release original de Cohere Labs; el software se entrega "as is" sin garantía.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix-BFP8-Components
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Código del loader: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix-BFP8-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/Cohere-Transcribe-03-2026-Tenstorrent-Tensix-BFP8-Components/blob/main/LICENSE
- Repositorio de herramientas Tensix BFP GPTQ: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
