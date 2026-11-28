# timmyboy26/parakeet-ultra-LiteRT-NPU

## Resumen

Parakeet Ultra LiteRT NPU es una compilación *ahead-of-time* (AOT) de los codificadores del modelo de reconocimiento automático del habla Parakeet Ultra 0.6B, empaquetada en formato LiteRT (`.tflite`) para ejecutarse sobre la NPU de ocho sistemas en chip (SoC) móviles. Lo publica el usuario timmyboy26 y deriva de `litert-community/parakeet-ultra`, que a su vez es un post-entrenamiento de NVIDIA Parakeet TDT 0.6B v3 realizado por el equipo de moondream. El objetivo es que un teléfono Android cargue el codificador sin necesidad de compilarlo en el dispositivo, reduciendo el tiempo de arranque y el consumo energético al delegar la inferencia en la NPU.

El modelo resuelve el problema de desplegar ASR de alta calidad en *edge*: en lugar de enviar audio a la nube, se ejecuta localmente con pesos en float16 y una arquitectura TDT (Token-and-Duration Transducer). El repositorio contiene únicamente los grafos del codificador; el resto del pipeline (extracción log-mel, decodificador TDT cuantizado a int8 y tokenizador) se ejecuta en CPU y se toma sin cambios del modelo base.

Es relevante ahora porque los SoC móviles de 2024-2026 (Snapdragon 8 Elite, Dimensity 9400, Tensor G5/G6) incorporan NPUs con suficiente capacidad para transcripción en tiempo real, y LiteRT permite explotarlas con un formato de pesos portable. El tamaño del repo (9,8 GB) refleja que contiene múltiples variantes de codificador por cada chip y ventana de contexto (10 s y 30 s).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer); codificador en formato LiteRT/TFLite compilado para NPU |
| Parametros totales | 0,6 B (heredados de NVIDIA Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 10 s y 30 s (variantes separadas) |
| Tipos de cuantizacion | codificador en float16; decodificador en int8 |
| Idiomas soportados | 25 idiomas europeos (segun el modelo base) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.tflite` (LiteRT), mas `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de 0,6 mil millones de parámetros, una variante de arquitectura *transducer* que predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva eficiente para ASR en streaming. El post-entrenamiento lo realizó moondream sobre NVIDIA Parakeet TDT 0.6B v3, ampliando la cobertura a 25 idiomas europeos.

Esta publicación no entrena nada nuevo: aplica compilación AOT con `ai_edge_litert.aot.aot_compile` (ai-edge-litert 2.3.0) sobre Linux x86_64, un codificador y un chip por proceso. Para Qualcomm se usó QAIRT 2.50.0.260828 (el runtime que envía la app LLM Hub); el codificador de 10 s para SM8750 requiere `qualcomm_optimization_level=O2` porque el compilador O3 por defecto falla. Para MediaTek se empleó `ai-edge-litert-sdk-mediatek` 2.3.0 y para Google Tensor `ai-edge-litert-sdk-google-tensor` 2.3.0 con el SDK beta de Tensor ML. El script de compilación es `android/tools/parakeet_npu/compile_npu.py` del repositorio LLM Hub.

## Capacidades

- Reconocimiento automático del habla (ASR) *offline* en dispositivo, sin conexión a red.
- Transcripción multilingüe: 25 idiomas europeos según el modelo base.
- Procesamiento en ventanas de audio de hasta 10 s o 30 s según la variante del codificador.
- Ejecución acelerada por NPU en ocho SoC móviles (Qualcomm, MediaTek, Google Tensor).
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- Integración con la app Android LLM Hub.
- No soporta *tool calling*, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en tiempo real en apps de notas de voz: el codificador de 10 s en NPU permite dictado continuo con baja latencia y sin enviar audio a servidores, adecuado para privacidad.
- Subtitulado local de reuniones y videollamadas: la ventana de 30 s cubre segmentos largos y el decodificador int8 en CPU mantiene el consumo bajo.
- Asistentes de voz *offline* en Android: al ejecutarse en NPU, el ASR no compite por CPU con otras tareas del sistema y funciona en modo avión.
- Accesibilidad para personas con discapacidad auditiva: transcripción en directo en el propio teléfono, sin dependencia de servicios cloud.
- Aplicaciones de campo sin cobertura (periodismo, inspecciones, sanidad rural): el modelo funciona íntegramente en el dispositivo.
- Preprocesado de audio para pipelines de IA generativa local: transcribir y luego pasar el texto a un LLM on-device dentro de la misma app.
- Investigación en ASR *edge*: banco de pruebas para comparar latencia y precisión entre NPUs de distintos fabricantes con el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los grafos están "construidos, pero aún no verificados en todos los chips"; se recomienda consultar el catálogo de la app LLM Hub para ver los SoC listados.

## Requisitos de hardware

- SoC soportados: Snapdragon 8 Gen 2 (SM8550), 8 Gen 3 (SM8650), 8 Elite (SM8750), 8 Elite Gen 5 (SM8850); Dimensity 9400 (MT6991) y 9500 (MT6993); Google Tensor G5 y G6.
- No está pensado para GPU de escritorio ni consumer GPU: son artefactos `.tflite` para NPU móvil.
- VRAM: no aplica; el modelo reside en memoria del dispositivo (el repo completo pesa 9,8 GB por incluir todas las variantes, pero solo se carga el codificador del chip y ventana elegidos).
- Despliegue: LiteRT con delegados de Qualcomm (QAIRT 2.50.0.260828), MediaTek (`ai-edge-litert-sdk-mediatek` 2.3.0) y Google Tensor (`ai-edge-litert-sdk-google-tensor` 2.3.0).
- Latencia y throughput: no disponibles (no verificados en todos los chips).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet Ultra LiteRT NPU (este) | 0,6 B | 10 s / 30 s | `.tflite` NPU | CC-BY-4.0 | Solo codificador; decodificador en CPU |
| litert-community/parakeet-ultra | 0,6 B | 10 s / 30 s | LiteRT | CC-BY-4.0 | Modelo base; pipeline completo |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | NeMo | CC-BY-4.0 | Modelo original de NVIDIA |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye los codificadores; requiere el decodificador, los grafos log-mel y el tokenizador del modelo base `litert-community/parakeet-ultra` (commit 36d0fe9b069a7f205b6f08d4d9639ba67481abea).
- Estado de verificación incompleto: no probado en todos los chips; puede fallar o degradarse en algunos SoC.
- Dependencia estricta del runtime: las variantes Qualcomm asumen QAIRT 2.50.0.260828; otras versiones pueden no ser compatibles.
- El codificador SM8750 de 10 s solo compila con `qualcomm_optimization_level=O2`.
- Riesgo de alucinación y errores de transcripción inherentes al modelo base, especialmente en audio ruidoso o acentos no cubiertos.
- Sesgos lingüísticos y de dominio heredados de los datos de entrenamiento de Parakeet; cobertura limitada a 25 idiomas europeos.
- Licencia CC-BY-4.0: permite uso comercial con atribución; no es una licencia permisiva tipo Apache/MIT.
- Sin datos de benchmarks publicados; no recomendable para producción sin validación previa en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/timmyboy26/parakeet-ultra-LiteRT-NPU
- Modelo base LiteRT: https://huggingface.co/litert-community/parakeet-ultra
- Modelo original NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Script de compilación: `android/tools/parakeet_npu/compile_npu.py` en el repositorio LLM Hub (no se proporciona URL directa)
- LiteRT (ai-edge-litert): no disponible en la información proporcionada
- QAIRT (Qualcomm AI Runtime): no disponible en la información proporcionada
