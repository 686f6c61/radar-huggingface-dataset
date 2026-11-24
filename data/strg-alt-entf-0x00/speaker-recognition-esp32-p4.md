# Strg-Alt-Entf-0x00/Speaker-Recognition-ESP32-P4

## Resumen

TDNN-Tiny es un checkpoint de PyTorch para reconocimiento y verificación de locutor (speaker recognition y speaker verification) diseñado para ejecutarse en tiempo real sobre el SoC RISC-V ESP32-P4. Lo publica el usuario Strg-Alt-Entf-0x00 y se distribuye con licencia Apache 2.0. El modelo no es un LLM: es una red neuronal de tipo Time Delay Neural Network (TDNN) que transforma una representación Mel de 80 canales en un embedding de locutor de 512 dimensiones normalizado en L2, que después se compara mediante similitud coseno para decidir si dos fragmentos de audio pertenecen a la misma persona.

Su relevancia está en el objetivo de despliegue: inferencia en un microcontrolador RISC-V con aceleración SIMD INT8, con una latencia de extremo a extremo de aproximadamente 198 ms incluyendo FFT y banco de filtros Mel, y un EER de aproximadamente 1,40 %. Es, por tanto, una pieza de biometría de voz embebida orientada a dispositivos con recursos muy limitados, no un modelo de propósito general.

El repositorio tiene un tamaño declarado de 0,0 GB y cero descargas en el momento de la consulta, lo que sugiere un proyecto recién publicado (creado y actualizado el 23 de noviembre de 2026) y con poca validación externa todavía. La model card es muy escueta y no aporta detalles sobre el dataset de entrenamiento ni sobre los benchmarks más allá del EER declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDNN-Tiny (Time Delay Neural Network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio; no es un modelo de contexto de texto) |
| Tipos de cuantizacion | INT8 (inferencia SIMD PIE en el ESP32-P4); no se detallan otros formatos |
| Idiomas soportados | en, de, multilingual (segun metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` (`tdnn_tiny.pth`, `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura es una TDNN-Tiny, una red neuronal con retardos temporales típica en sistemas de verificación de locutor (familia x-vector/TDNN). La entrada es un banco de filtros Mel de 80 canales calculado sobre PCM mono a 16 kHz; la salida es un vector de 512 dimensiones normalizado en L2 que actúa como huella de voz (voiceprint). El checkpoint se entrega como `state_dict` estándar de PyTorch, lo que permite cargarlo con `torch.load` y exportarlo o cuantizarlo para el despliegue embebido.

No se dispone de información sobre el número de tokens o horas de audio de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, discriminación de hablantes (AAM-softmax, triplet loss) o ajuste fino. Tampoco se documenta ninguna innovación técnica más allá del propio objetivo de eficiencia en el ESP32-P4 con instrucciones SIMD INT8. La model card no incluye detalles sobre la función de pérdida ni sobre el pipeline de preprocesado más allá de la FFT y el banco Mel.

## Capacidades

- Reconocimiento de locutor: genera un embedding de 512 dimensiones a partir de audio de 16 kHz.
- Verificación de locutor: comparación de embeddings mediante similitud coseno para aceptar o rechazar una identidad.
- Detección de actividad de voz (VAD): el pipeline declarado en Hugging Face es `voice-activity-detection`.
- Procesamiento de audio en tiempo real sobre hardware embebido (ESP32-P4, RISC-V, 360 MHz).
- Soporte multilingüe declarado (inglés, alemán y multilingüe) en los metadatos.
- Inferencia cuantizada a INT8 con aceleración SIMD (PIE).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Control de acceso por voz en dispositivos IoT: el modelo permite verificar la identidad del usuario a partir de una frase corta, con un EER de ~1,40 % y una latencia inferior a 200 ms, adecuado para cerraduras o paneles de acceso con ESP32-P4.
- Desbloqueo de dispositivos personales por huella de voz: integración en wearables o dispositivos de mano que necesitan autenticación biométrica sin enviar audio a la nube, gracias a la inferencia local en el microcontrolador.
- Personalización de asistentes de voz embebidos: identificar al hablante para adaptar respuestas, preferencias o perfiles de usuario en altavoces inteligentes de bajo coste.
- Detección de presencia y segmentación de hablantes: combinado con el pipeline de VAD, permite activar el reconocimiento solo cuando hay voz y separar turnos de conversación en grabadoras o sistemas de transcripción local.
- Verificación antifraude en terminales de punto de venta o cajeros: comprobar que la persona que autoriza una operación coincide con el titular registrado, sin depender de conectividad.
- Investigación en biometría embebida: servir como baseline reproducible para comparar arquitecturas TDNN y técnicas de cuantización INT8 en plataformas RISC-V de bajo consumo.
- Domótica con perfiles por usuario: ajustar iluminación, temperatura o música según el locutor detectado en una habitación, ejecutando todo el procesamiento en el propio nodo ESP32-P4.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Inferencia NN bruta (INT8 PIE SIMD @ 360 MHz) | ~142 ms |
| Latencia extremo a extremo (incluye FFT y Mel) | ~198 ms |
| Equal Error Rate (EER) | ~1,40 % |

No se han publicado resultados de benchmarks estándar (VoxCeleb, MMLU, HumanEval, GSM8K u otros) en la información disponible. No se dispone de comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

- Hardware objetivo: ESP32-P4 (RISC-V, 360 MHz, aceleración SIMD PIE para INT8).
- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en un microcontrolador con memoria SRAM/PSRAM limitada. El tamaño exacto del checkpoint no se indica (el repositorio declara 0,0 GB).
- GPU recomendadas: no disponibles; el modelo está pensado para CPU embebida, aunque al ser un `state_dict` de PyTorch puede ejecutarse en cualquier máquina con PyTorch para pruebas.
- ¿Cabe en GPU de consumo? Sí, con toda probabilidad, dado el tamaño reducido implícito en el despliegue embebido, pero no se aportan cifras de VRAM.
- Opciones de despliegue: PyTorch (`torch.load`) para evaluación; el repositorio complementario `esp-idf-speaker-recognition` para el despliegue en ESP-IDF. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~142 ms por inferencia de red y ~198 ms de extremo a extremo en el ESP32-P4 a 360 MHz.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia genérica de categoría, los sistemas de verificación de locutor basados en x-vector/TDNN (por ejemplo, los publicados en la literatura de VoxCeleb) suelen emplear arquitecturas similares, pero no se aportan datos de parámetros, contexto ni rendimiento que permitan una comparación rigurosa. Por tanto: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- El EER de ~1,40 % se declara sin especificar el conjunto de evaluación, las condiciones acústicas ni el número de hablantes; no es verificable con la información disponible.
- No se documenta el dataset de entrenamiento, por lo que se desconocen sesgos de idioma, acento, género, edad o condiciones de ruido.
- Riesgo de falsos positivos y negativos en entornos ruidosos o con micrófonos de baja calidad; la verificación biométrica por voz es sensible a la variabilidad intra-hablante.
- El soporte multilingüe declarado (en, de, multilingual) no está cuantificado; no hay datos sobre su rendimiento en castellano.
- El repositorio tiene cero descargas y una model card mínima; la validación externa es inexistente en el momento de la consulta.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las obligaciones de atribución y la ausencia de garantías.
- Para producción, es imprescindible validar el modelo con datos propios y considerar la privacidad del procesamiento biométrico local (RGPD).

## Enlaces

- Hugging Face: https://huggingface.co/Strg-Alt-Entf-0x00/Speaker-Recognition-ESP32-P4
- Repositorio del componente: https://github.com/Strg-Alt-Entf-0x00/esp-idf-speaker-recognition
