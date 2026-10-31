# StephenShumway/rigless-lora

## Resumen

Rigless LoRA v1 es un adaptador LoRA (Low-Rank Adaptation) para el modelo de video MiniMax H3, desarrollado por StephenShumway. Su función es reemplazar a una persona en metraje real por un personaje definido a partir de una imagen de referencia, manteniendo la pose, la mirada, la expresión y el movimiento de la interpretación original. El proyecto forma parte de Rigless, una herramienta que descarga y carga este LoRA automáticamente en cada render.

El adaptador es una versión modificada del H3 Relay Character Swap LoRA v1.5 de akatz-ai, ajustado adicionalmente sobre metraje real: cada muestra de entrenamiento es un clip real al que H3 ya había insertado otra persona, y el LoRA aprende a reconstruir a la persona original a partir únicamente de una fotografía. Al tener como objetivo siempre vídeo real, el modelo aprende la iluminación realista y se ve obligado a leer la imagen de referencia para saber a quién dibujar.

Su relevancia actual radica en la creciente demanda de flujos de trabajo de intercambio de personajes (character swap) sin rigging en producción de vídeo con IA, integrado en ecosistemas como ComfyUI y H3 Relay. El repositorio pesa 0,2 GB y el archivo es `rigless-lora-v1.safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 (ref2va) |
| Parametros totales | no disponible (tamaño del repo: 0,2 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo/imagen, no de texto) |
| Licencia | MiniMax H3 Community License Agreement (other) |
| Formato de pesos | safetensors (`rigless-lora-v1.safetensors`) |

## Arquitectura y entrenamiento

Técnicamente, se trata de un LoRA derivado del Character Swap LoRA v1.5 de akatz-ai para MiniMax H3, un modelo de generación/vídeo con referencia (modo ref2va). La innovación del entrenamiento está en la estrategia de datos: cada muestra es un clip de vídeo real en el que H3 había insertado previamente a otra persona, y el objetivo del LoRA es reconstruir al sujeto real a partir de una sola fotografía de referencia. Esto obliga al adaptador a aprender dos cosas: la apariencia fiel del sujeto de la imagen y las características de iluminación y textura del metraje real.

No se ha publicado información sobre el número de pasos de entrenamiento, el rango del LoRA, el tamaño del dataset ni los hiperparámetros. Según el autor, en una prueba a ciegas (3 clips, una toma cada uno, evaluada por su propio desarrollador) fue preferido frente a la v1.5 y frente a no usar LoRA de swap, aunque no es mediblemente mejor en identidad facial.

## Capacidades

- Reemplazo de una persona en vídeo real por el personaje de una imagen de referencia, preservando cara, pelo y ropa de la referencia.
- Preservación de la pose, mirada, expresión y movimiento de la interpretación original del vídeo fuente.
- Conservación de la escena y de las demás personas presentes en el clip.
- Aprendizaje de iluminación realista al entrenarse con objetivos de metraje real.
- Integración en ComfyUI como LoRA en `models/loras`, cargado a strength 1.0 sobre MiniMax H3 (ref2va).
- Compatibilidad con los nodos H3 Relay y el H3 Turbo LoRA de 8 pasos (lightx2v/Minimax-h3-Turbo) para inferencia acelerada.
- Descarga y carga automática dentro del pipeline de Rigless.

## Casos de uso

- Sustitución de actor en postproducción: se puede reemplazar a un actor de un clip rodado por otro personaje (real o ficticio) definido con una sola foto, sin necesidad de captura de movimiento ni rigging facial.
- Prototipado rápido de personajes: estudios pequeños pueden probar cómo quedaría un personaje en una escena real rodada antes de decidir el casting o el diseño final.
- Creación de contenido para redes sociales: creadores pueden generar vídeos en los que un personaje ilustrado actúa en escenas reales, manteniendo la interpretación de la persona original.
- Automatización con Rigless: al integrarse en el pipeline de Rigless, se pueden procesar lotes de clips de forma desatendida sin configurar manualmente los nodos.
- Flujos de trabajo en ComfyUI: usuarios avanzados pueden combinar este LoRA con H3 Relay y el Turbo LoRA de 8 pasos para renders rápidos dentro de grafos ComfyUI existentes.
- Animatic y previsualización: equipos de preproducción pueden insertar personajes conceptuales en metraje de referencia para validar planos y continuidad antes del rodaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única evaluación mencionada por el autor es una prueba a ciegas no formal (3 clips, un solo take, juzgada por el propio desarrollador) en la que este LoRA fue preferido frente a la v1.5 y frente a no usar LoRA de swap; el autor reconoce que no es mediblemente mejor en identidad facial.

## Requisitos de hardware

- VRAM estimada: no disponible. El LoRA en sí pesa 0,2 GB, pero la memoria necesaria depende del modelo base MiniMax H3, que no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un LoRA para un modelo de vídeo generativo, es razonable asumir la necesidad de una GPU con VRAM alta (clase RTX 4090 o superior, o GPUs de datacenter), pero no hay datos publicados.
- Consumer GPU: no disponible; no hay confirmación de que funcione en GPUs de consumo concretas.
- Despliegue: ComfyUI (carpeta `models/loras`, strength 1.0, con nodos H3 Relay y el H3 Turbo LoRA de 8 pasos) o mediante el proyecto Rigless, que lo descarga y carga automáticamente.
- Latencia y throughput: no disponible. El uso del Turbo LoRA de 8 pasos sugiere inferencia acelerada respecto al pipeline completo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Notas |
|---|---|---|---|---|
| StephenShumway/rigless-lora (v1) | LoRA de character swap | akatz-ai/MiniMax-H3-Character-Swap-LoRA v1.5 | MiniMax H3 Community License | Entrenado adicionalmente sobre metraje real; integrado en Rigless |
| akatz-ai/MiniMax-H3-Character-Swap-LoRA (v1.5) | LoRA de character swap | MiniMax H3 | MiniMax H3 Community License | Modelo del que deriva; preferido frente a él en prueba a ciegas del autor |
| lightx2v/Minimax-h3-Turbo | LoRA de aceleración (8 pasos) | MiniMax H3 | no disponible | No compite en tarea, pero se usa junto al rigless-lora para inferencia rápida |

## Limitaciones y advertencias

- Restricción geográfica importante: MiniMax H3 no puede usarse en Estados Unidos, la Unión Europea, el Reino Unido ni Corea del Sur sin autorización propia de MiniMax, lo que afecta indirectamente a este LoRA por ser derivado de las MiniMax H3 Works.
- Identidad facial: el propio autor reconoce que el LoRA no es mediblemente mejor que la v1.5 en fidelidad de identidad facial.
- La evaluación de calidad publicada es limitada y no independiente: fue realizada por el propio desarrollador sobre solo 3 clips.
- Riesgo ético y legal inherente al character swap: el model card exige usar metraje e imágenes de los que se tengan derechos, de personas que hayan dado su consentimiento o que no sean reales, y etiquetar claramente los vídeos como generados por IA.
- La licencia es "other" (MiniMax H3 Community License Agreement), no una licencia abierta estándar; revisar los términos antes de cualquier uso comercial.
- Sin documentación publicada sobre hiperparámetros, dataset de entrenamiento ni rendimiento medido.
- Advertencia general sobre deepfakes: el uso con personas reales sin consentimiento puede ser ilegal y vulnera las condiciones de uso indicadas por el autor.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/StephenShumway/rigless-lora
- Licencia: https://huggingface.co/StephenShumway/rigless-lora/blob/main/LICENSE
- NOTICE: https://huggingface.co/StephenShumway/rigless-lora/blob/main/NOTICE
- Modelo base: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Proyecto Rigless: https://github.com/StephenShumway/rigless
- H3 Relay (nodos ComfyUI): https://github.com/akatz-ai/h3-relay
- H3 Turbo LoRA: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Autorización de licencia MiniMax H3: https://platform.minimax.io/h3-license
