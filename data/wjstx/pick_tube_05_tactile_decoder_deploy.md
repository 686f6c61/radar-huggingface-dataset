# wjstx/pick_tube_05_tactile_decoder_deploy

## Resumen

El modelo `wjstx/pick_tube_05_tactile_decoder_deploy` es un payload de despliegue privado para un decoder de acciones táctiles directas, diseñado para un brazo robótico que realiza tareas de recogida de tubos (pick tube). Forma parte de un estudio de ablación denominado VB3, centrado en evaluar la contribución de la percepción táctil en un sistema de visión-lenguaje-acción (VLA). El paquete combina cuatro componentes congelados: el modelo base `lerobot/smolvla_base` (revisión `c83c3163b8ca9b7e67c509fffd9121e66cb96205`), un adaptador PEFT del modelo `KaiyueChen/pick_tube_01` (revisión `c2bb4296cf7405ac3c0ad89e6f577fa620a660a6`), un encoder táctil ResNet18 convertido, y un decoder Transformer formal denominado `action_tactile`.

El decoder predice un chunk de acciones en unidades físicas con forma `[1, 20, 20]`, es decir, 20 pasos de tiempo y 20 dimensiones de acción, a partir de cuatro imágenes táctiles RGB del frame actual. El repositorio incluye los pesos completos, el adaptador, el encoder convertido, el checkpoint del decoder (seleccionado en la época 3), el tokenizer de SmolVLM2, un manifiesto de despliegue y documentación de arquitectura. Es relevante para la comunidad de robótica porque aborda la integración de señales táctiles en modelos VLA, un área emergente para manipulación precisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Transformer `action_tactile` + encoder táctil ResNet18 + base SmolVLA (congelado) + adaptador PEFT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y checkpoint `.pt`) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (para base, adaptador y encoder) y PyTorch checkpoint (`.pt` para decoder) |

## Arquitectura y entrenamiento

El sistema sigue una arquitectura compuesta. La base es `smolvla_base` de LeRobot, un modelo VLA que integra visión y lenguaje para generar acciones robóticas. Sobre esta base se aplica un adaptador PEFT (del modelo `pick_tube_01`) que ajusta las representaciones a la tarea de recogida de tubos. El encoder táctil es un ResNet18 convertido, que procesa las cuatro imágenes RGB táctiles (izquierda y derecha, dos vistas cada una) y produce características que se fusionan con las representaciones del VLA. Finalmente, un decoder Transformer `action_tactile` genera el chunk de acciones de 20 pasos y 20 dimensiones.

El entrenamiento se menciona únicamente en el contexto del checkpoint del decoder, seleccionado en la época 3, pero no se proporcionan detalles sobre el dataset, el número de tokens, ni el método de optimización (RLHF, DPO, etc.). Los datos de entrenamiento, la caché de características formales, el estado del optimizador y los checkpoints intermedios están excluidos del repositorio, por lo que no es posible evaluar la metodología completa. El manifiesto de despliegue (`deployment_manifest.json`) y la documentación (`docs/NETWORK_STRUCTURE.md`) contienen la arquitectura detallada y el protocolo de evaluación, pero no están disponibles en la información proporcionada.

## Capacidades

- Predicción de acciones robóticas en unidades físicas: genera un chunk de acciones de forma `[1, 20, 20]` (20 pasos de tiempo, 20 dimensiones de acción).
- Percepción táctil multimodal: procesa cuatro imágenes RGB táctiles simultáneas (izquierda y derecha, dos vistas) para informar la generación de acciones.
- Integración con VLA: combina la base SmolVLA (visión-lenguaje-acción) con un adaptador PEFT y un encoder táctil, permitiendo condicionar las acciones con señales táctiles de alta frecuencia.
- Despliegue modular: estructura de repositorio con componentes separados (base, adaptador, encoder, decoder) y manifiesto de revisiones y hashes, facilitando la reproducibilidad.
- No se documentan capacidades adicionales como tool calling, generación de texto o razonamiento multilingüe, dado que el modelo está especializado en control robótico.

## Casos de uso

- Manipulación robótica de tubos con feedback táctil: el modelo puede controlar un brazo robótico en tareas de recogida de tubos, utilizando las imágenes táctiles para ajustar la fuerza y la posición en tiempo real. Es adecuado porque el decoder predice directamente acciones físicas a partir de la percepción táctil.
- Estudio de ablación en VLA táctil: los investigadores pueden usar este payload para comparar el rendimiento de un decoder con y sin entrada táctil, evaluando la contribución de la modalidad táctil en el control robótico.
- Integración en sistemas de control en bucle cerrado: el modelo puede desplegarse en el cliente real del robot VB3 (rama `ablation`) para pruebas de campo, aunque se advierte que la evaluación offline no garantiza seguridad ni éxito en el robot real.
- Investigación en aprendizaje por refuerzo y demostración: al ser un decoder entrenado con demostraciones (implícito por el uso de PEFT y el checkpoint), puede servir como base para estudiar políticas de manipulación fina.
- Benchmarking de arquitecturas de decodificación: el diseño modular permite sustituir el decoder por otras variantes y comparar métricas de éxito en tareas de pick-and-place.
- Desarrollo de interfaces táctiles para robots colaborativos: el modelo podría adaptarse a otros escenarios donde se requiera sensibilidad táctil, como ensamblaje de piezas o cirugía asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona un protocolo de evaluación en `docs/NETWORK_STRUCTURE.md`, pero no se proporcionan métricas numéricas (éxito, precisión, etc.) en la model card ni en los metadatos.

## Requisitos de hardware

- Tamaño del repositorio: 1.2 GB, lo que sugiere que los pesos completos pueden cargarse en GPUs con al menos 4 GB de VRAM (asumiendo precisión FP32) o menos con cuantización, aunque no se especifica cuantización.
- No se dispone de información sobre VRAM estimada, GPUs recomendadas ni latencia.
- El modelo está diseñado para inferencia en robótica, por lo que probablemente se ejecute en sistemas embebidos con GPU (Jetson, etc.) o estaciones de trabajo con GPUs consumer (RTX 3090, RTX 4090).
- Opciones de despliegue: dado que usa PyTorch y safetensors, puede integrarse con frameworks como vLLM, TGI u Ollama si se adapta a un formato compatible, pero no se mencionan explícitamente. El manifiesto de despliegue sugiere un cliente específico para el robot VB3.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No disponible. No se conocen modelos públicos comparables que integren decodificadores táctiles directos con arquitecturas VLA en el contexto de esta tarea específica. Modelos generales de robótica como RT-2 o OpenVLA no incorporan percepción táctil explícita, pero no se dispone de datos de comparación.

## Limitaciones y advertencias

- Validación solo offline: la evaluación offline no establece seguridad ni éxito en el robot real; el despliegue en el robot VB3 requiere la integración en la rama `ablation` y pruebas adicionales.
- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si es apto para uso comercial o académico sin restricciones.
- Datos de entrenamiento excluidos: no se puede auditar la calidad del dataset ni los posibles sesgos en las demostraciones.
- Dependencia de un orden exacto de imágenes táctiles: el modelo requiere cuatro imágenes en un orden específico (`tactile_left_0`, `tactile_right_0`, `tactile_left_1`, `tactile_right_1`); cualquier cambio en la configuración del sensor puede degradar el rendimiento.
- Sin información sobre alucinación o sesgos: al ser un modelo de control, no se aplican los riesgos típicos de generación de texto, pero no se descartan errores en la predicción de acciones.
- Riesgo de sobreajuste a la tarea específica: el modelo está optimizado para la recogida de tubos con esa configuración táctil concreta; su generalización a otros objetos o entornos no está verificada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wjstx/pick_tube_05_tactile_decoder_deploy
- Documentación de arquitectura y evaluación (dentro del repo): `docs/NETWORK_STRUCTURE.md`
- Manifiesto de despliegue (dentro del repo): `deployment_manifest.json`
- Modelo base: `lerobot/smolvla_base` (revisión `c83c3163b8ca9b7e67c509fffd9121e66cb96205`)
- Adaptador PEFT: `KaiyueChen/pick_tube_01` (revisión `c2bb4296cf7405ac3c0ad89e6f577fa620a660a6`)
