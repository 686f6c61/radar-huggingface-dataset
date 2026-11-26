# Vathivis/canary-1b-v2-fp16

## Resumen

Canary 1B v2 FP16 es una conversión del modelo de reconocimiento automático del habla NVIDIA Canary 1B v2, empaquetada por Vathivis para ejecución sobre la NPU Hexagon de Qualcomm mediante QNN (Qualcomm AI Engine Direct) y ONNX Runtime. No se trata de un modelo entrenado desde cero, sino de una exportación del checkpoint original (`d455706339a6b32e1aa40f82c713a482a0c938e2`) con conversiones a FP16 en las interfaces del grafo y compilación de 11 subgrafos para el target SM8750 (Snapdragon 8 Elite, Hexagon HTP v79).

El problema que resuelve es el despliegue de ASR multilingüe de alta calidad en dispositivos móviles sin depender de la nube, aprovechando la aceleración NPU en lugar de CPU o GPU. El paquete está pensado para integrarse en la aplicación SimpleScribe y validado sobre un Galaxy S25 Ultra con Android 17.

El modelo cubre 25 idiomas europeos, emplea ventanas de audio de 25 segundos y una caché de decodificador de 512 tokens, y se distribuye bajo licencia CC BY 4.0. Su relevancia actual radica en demostrar un pipeline completo de ASR en NPU móvil con un modelo de aproximadamente 1 GB de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Canary), exportado a 11 grafos QNN |
| Parámetros totales | aproximadamente 1B (modelo base Canary 1B v2; el paquete pesa 1.986.366.827 bytes) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de 25 segundos; caché de decodificador de 512 tokens |
| Tipos de cuantización | FP16 en las interfaces del grafo; IDs de token y posición en INT32 |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25 idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | QNN context binaries con wrappers ONNX EPContext (ZIP de 11 grafos), más `manifest.json` |

## Arquitectura y entrenamiento

El modelo subyacente es NVIDIA Canary 1B v2, un sistema ASR encoder-decoder de tipo transformer. Esta ficha no dispone de detalles sobre el dataset de entrenamiento, el número de tokens ni si hubo etapas de RLHF o ajuste fino supervisado; esa información corresponde a la model card del modelo original de NVIDIA, no incluida en la documentación proporcionada.

La aportación de este paquete es exclusivamente de despliegue: se mantienen los pesos fuente y se añaden casts a FP16 en las interfaces del grafo exportado. Qualcomm AI Hub Workbench compiló los 11 grafos para ejecución FP16 sobre Hexagon HTP v79. La topología del paquete incluye un grafo frontal de encoder, ocho grafos de bloques de encoder, un grafo de caché de cross-attention y un grafo de paso de decodificador. El compilador utilizado es `v2.52.0.261104115025`, con runtime QAIRT 2.52.0, ONNX Runtime 1.29.0 y QNN EP 2.8.0.

## Capacidades

- Reconocimiento automático del habla multilingüe en 25 idiomas europeos (incluido español).
- Procesamiento de audio en ventanas de 25 segundos con caché de decodificador de 512 tokens.
- Ejecución acelerada en NPU Hexagon mediante QNN, sin fallback a otros backends en la validación reportada.
- Integración en flujos con otros modelos en el mismo dispositivo: en la prueba citada, Canary y Czech ByT5 se ejecutaron en la NPU y Gemma 4 E4B en la GPU.
- Soporte de Android API 29 o superior y arquitectura `arm64-v8a`.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de voz en tiempo real en aplicaciones Android: el paquete está compilado para Snapdragon 8 Elite y puede ejecutarse en la NPU mientras la GPU y la CPU quedan libres para otras tareas del dispositivo.
- Subtitulado local sin conexión: al no requerir nube, es adecuado para escenarios con privacidad estricta, como reuniones o entrevistas que no deben salir del dispositivo.
- Asistentes de voz integrados en el sistema: la ventana de 25 segundos y la caché de 512 tokens permiten transcribir intervenciones conversacionales de duración media.
- Aplicaciones de accesibilidad: dictado y transcripción para usuarios con movilidad reducida, ejecutándose íntegramente en el teléfono.
- Flujos multilingües en atención al cliente presencial: con 25 idiomas cubiertos, permite transcribir conversaciones en varios idiomas sin cambiar de modelo.
- Pipelines de documentación de campo: grabación y transcripción de notas de voz en dispositivos móviles con SoC Snapdragon 8 Elite, sin depender de conectividad.
- Integración en aplicaciones de terceros mediante SimpleScribe: el paquete se puede instalar como backend NPU cuando el dispositivo es compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una validación funcional: un flujo de trabajo en checo de 29 segundos completado en un Galaxy S25 Ultra (SM-S938B) con Android 17, sin fallback de backend.

## Requisitos de hardware

- VRAM: no aplica; el paquete está diseñado para NPU Hexagon, no para GPU.
- SoC objetivo: Snapdragon 8 Elite (SM8750), SoC ID 69, Hexagon HTP v79.
- Dispositivo validado: Galaxy S25 Ultra (SM-S938B) con Android 17.
- Dispositivos del mismo SoC pendientes de validación: Galaxy S25, Galaxy S25+ y OnePlus 13.
- Requisitos de software: Android API 29 o superior, `arm64-v8a`, QAIRT 2.52.0, ONNX Runtime 1.29.0, QNN EP 2.8.0 y firmware de dispositivo compatible.
- Despliegue: mediante el paquete QNN y SimpleScribe; si el paquete no funciona en el dispositivo, la aplicación permite seleccionar un modelo Turbo NPU o Medium CPU alternativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Canary 1B v2 FP16 (este paquete) | aproximadamente 1B | ventana de audio de 25 s, caché de 512 tokens | 25 | CC BY 4.0 | QNN EPContext |
| nvidia/canary-1b-v2 (modelo base) | aproximadamente 1B | no disponible | 25 | CC BY 4.0 | safetensors (formato original de NVIDIA) |
| Alternativas ASR móviles | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de hardware: solo está compilado para Snapdragon 8 Elite (SM8750) con Hexagon HTP v79; otros SoC no están soportados por este paquete.
- Requiere firmware compatible y Android API 29 o superior; no funcionará en dispositivos con versiones anteriores.
- La ventana de audio es de 25 segundos; audios más largos deben segmentarse, lo que puede afectar a la coherencia entre segmentos.
- Solo se ha validado un dispositivo (Galaxy S25 Ultra) y un flujo de trabajo en checo; el comportamiento en el resto de idiomas no está documentado en esta ficha.
- No se documentan sesgos conocidos ni tasas de alucinación para este paquete; deben consultarse en la model card del modelo base de NVIDIA.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a NVIDIA y respetar los términos de la licencia.
- El paquete no incluye información sobre cuantización INT8 ni otras variantes de menor precisión; solo FP16.
- La integración se ha probado con SimpleScribe; otros entornos de ejecución no están validados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Vathivis/canary-1b-v2-fp16)
- [Paquete FP16 NPU (ZIP)](https://huggingface.co/Vathivis/canary-1b-v2-fp16/resolve/main/npu/qualcomm/sm8750-htp-v79/qairt-2.52/canary-1b-v2-fp16-qnn-sm8750-htpv79-qairt2.52-v1.zip?download=true)
- [Modelo base nvidia/canary-1b-v2 (commit d455706)](https://huggingface.co/nvidia/canary-1b-v2/tree/d455706339a6b32e1aa40f82c713a482a0c938e2)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Release de ONNX Runtime QNN EP v2.8.0](https://github.com/onnxruntime/onnxruntime-qnn/releases/tag/v2.8.0)
