# TidasSilva/singha-tiny-vlm

## Resumen

SINGHA Tiny VLM v2 es un modelo de visión-lenguaje extremadamente compacto (561.370 parámetros) desarrollado por TidasSilva, diseñado específicamente para ejecutarse en microcontroladores ESP32-S3 mediante el framework ESP-DL de Espressif. A diferencia de los VLM convencionales, no genera texto libre: produce 194 logits de "slots" semánticos (objeto, sujeto principal, cantidad, escena, acción y compuertas de confianza) que un captioner basado en reglas transforma en una frase corta. El modelo consume imágenes RGB de 128x128 en formato NCHW normalizadas a [-1, 1] y requiere 37,9 MMAC por inferencia en INT8.

La relevancia del modelo reside en su planteamiento de despliegue: llevar capacidades de image captioning a hardware con unos pocos cientos de kilobytes de RAM disponible, sin GPU ni aceleradores dedicados. Se distribuye en formato ONNX (para verificación en host) y en formato `.espdl` cuantizado w8a8 para el ESP32-S3, junto con la especificación del captioner en JSON y cabecera C. El entrenamiento combina destilación supervisada desde YOLOv8m y CLIP, seguida de un refinamiento con RL guiado por un juez (Qwen2-VL-2B).

Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con advertencias explícitas del autor: la precisión reportada mide concordancia con las etiquetas del profesor, no con verdad humana, y la latencia en placa no ha sido medida. La licencia Apache 2.0 facilita su integración comercial, pero la ausencia de benchmarks públicos y de especificación de idiomas limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder compacto (detalles no disponibles) + cabeza de 194 logits + captioner basado en reglas |
| Parametros totales | 561.370 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de texto; entrada de imagen 128x128 RGB) |
| Tipos de cuantizacion | INT8 w8a8 (ESP-DL); ONNX en precision original |
| Idiomas soportados | no disponible (las captions se generan mediante reglas; idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`singha_tiny_vlm_128.onnx`), ESP-DL (`singha_tiny_vlm_esp32s3_128_w8a8.espdl`), PyTorch (`singha_final.pt`) |
| Entrada | RGB 128x128, normalizacion x = pixel/127.5 - 1, layout NCHW |
| Coste computacional | 37,9 MMAC por inferencia |
| Salida | 194 logits (objetos, sujeto principal, cantidad, escena, accion, compuertas de confianza) |
| Hardware objetivo | ESP32-S3 (INT8, ESP-DL) |

## Arquitectura y entrenamiento

La arquitectura concreta (tipo de backbone, número de capas, atención) no está detallada en la model card. Lo que sí se especifica es el contrato de entrada/salida: imagen RGB 128x128 normalizada, encoder visual de 561.370 parámetros, y una cabeza que emite 194 logits organizados en seis grupos semánticos (objetos, sujeto principal, cantidad, escena, acción y compuertas de confianza). Un captioner determinista basado en reglas, cuya especificación se entrega en `singha_caption_spec.json` y `singha_caption_spec.h`, convierte esos logits en una frase corta. Este diseño evita el coste de un decoder de lenguaje y hace viable la inferencia en un MCU.

El entrenamiento se realizó en dos fases: primero destilación supervisada desde YOLOv8m y CLIP como profesores, y después un refinamiento con RL guiado por un juez (Qwen2-VL-2B). El checkpoint publicado corresponde a la fase RL ("Shipped model: rl"). No se especifican el número de tokens, la composición del dataset ni los hiperparámetros de entrenamiento. El autor advierte que la métrica de precisión mide concordancia con las etiquetas del profesor, no con anotación humana, y que la latencia en placa no se ha medido.

## Capacidades

- Image captioning de frases cortas mediante slots semánticos y reglas deterministas.
- Detección de objetos y sujeto principal (clases limitadas al vocabulario de los 194 slots).
- Conteo de instancias (slot de cantidad).
- Clasificación de escena y de acción.
- Compuertas de confianza por slot, que permiten descartar predicciones poco fiables.
- Inferencia INT8 en ESP32-S3 mediante ESP-DL.
- Exportación ONNX para validación en host.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta generación de texto libre ni diálogo multi-turno.
- Capacidades multilingües: no disponibles (el captioner es basado en reglas y su idioma no se especifica).

## Casos de uso

- Visión embebida de bajo consumo en dispositivos IoT con ESP32-S3: el modelo cabe en la memoria del MCU y permite etiquetar imágenes de una cámara integrada sin conexión a la nube, con 37,9 MMAC por frame.
- Triggering por eventos en cámaras de vigilancia de bajo coste: las compuertas de confianza permiten activar un envío a un servidor solo cuando la escena o el objeto detectado superan un umbral.
- Clasificación de escenas en wearables y dispositivos portátiles: la entrada de 128x128 y el coste reducido permiten ejecución continua con presupuesto energético mínimo.
- Automatización industrial sencilla: conteo de piezas o verificación de presencia de objetos en líneas de producción con un ESP32-S3 y una cámara, usando el slot de cantidad.
- Prototipado educativo y de investigación en edge AI: el paquete incluye ONNX, ESP-DL, especificación del captioner y una rejilla de test (`random_test_grid.png`), lo que facilita reproducir el pipeline en laboratorio.
- Asistencia a personas con discapacidad visual en dispositivos de bajo coste: captioning de escenas cortas generado localmente, sin depender de conectividad.
- Pre-filtrado en pipelines híbridos: usar el modelo como primera etapa barata que descarta frames irrelevantes antes de enviarlos a un VLM mayor en el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la precisión reportada mide concordancia con las etiquetas del profesor (YOLOv8m + CLIP), no con verdad humana, y que la latencia en placa no se ha medido.

## Requisitos de hardware

- VRAM para inferencia: no aplica en el destino (ESP32-S3 sin GPU); en host, el modelo ONNX de 561.370 parámetros ocupa del orden de unos pocos MB en FP32 y menos en INT8.
- GPU recomendadas: no se requieren; cualquier CPU convencional puede ejecutar el ONNX para validación.
- Cabe en consumer GPU: sí, con margen amplio, aunque su destino es el MCU.
- Hardware objetivo: ESP32-S3 con ESP-DL, cuantización w8a8.
- Opciones de despliegue: ESP-DL (`.espdl`), ONNX Runtime (`.onnx`), PyTorch (`.pt`) para inspección.
- Latencia y throughput: no medidos en placa según el autor; no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Destino | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| SINGHA Tiny VLM v2 | 561.370 | Imagen 128x128 RGB | ESP32-S3 (MCU) | Apache 2.0 | No |
| Qwen2-VL-2B | ~2.000 M | Imagen + texto, contexto largo | GPU/CPU | Apache 2.0 (variantes) | Si |
| CLIP (ViT-B/32) | ~151 M | Imagen 224x224 + texto | GPU/CPU | MIT (variantes) | Si |
| YOLOv8m | ~25,9 M | Imagen, deteccion | GPU/CPU/edge | AGPL-3.0 | Si |

La comparativa es asimétrica por diseño: SINGHA Tiny VLM v2 opera dos o tres órdenes de magnitud por debajo en parámetros y no compite en calidad de captioning con Qwen2-VL-2B ni con CLIP. Su ventaja es el despliegue en un MCU de unos pocos dólares, algo que ninguno de los alternativos permite sin hardware adicional.

## Limitaciones y advertencias

- Precisión medida contra etiquetas del profesor, no contra verdad humana; puede heredar sesgos y errores de YOLOv8m y CLIP.
- Vocabulario cerrado de 194 slots: no reconoce conceptos fuera de esa taxonomía.
- El captioner es basado en reglas; la calidad y el idioma de las frases dependen de `singha_caption_spec.json`.
- Latencia en placa no medida; el rendimiento real en ESP32-S3 debe validarse en el hardware objetivo.
- Sin benchmarks públicos ni comparativas cuantitativas con alternativas.
- Idiomas soportados no especificados.
- Riesgo de alucinación estructural limitado (no genera texto libre), pero las compuertas de confianza pueden producir falsos positivos en escenas ambiguas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de los profesores (YOLOv8m es AGPL-3.0) si se redistribuyen derivados.
- Modelo con cero descargas y cero likes en el momento de la consulta: madurez y soporte comunitario no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/TidasSilva/singha-tiny-vlm
- ESP-DL (framework de despliegue): https://github.com/espressif/esp-dl
- ESP32-S3 (documentación de Espressif): https://www.espressif.com/en/products/socs/esp32-s3
- YOLOv8 (profesor de destilación): https://github.com/ultralytics/ultralytics
- CLIP (profesor de destilación): https://github.com/openai/CLIP
- Qwen2-VL (juez en la fase RL): https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
