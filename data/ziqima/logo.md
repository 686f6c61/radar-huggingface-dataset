# ziqima/LoGo

## Resumen

LoGo es una colección de tres adaptadores LoRA publicados por el usuario ziqima (Ziqi) en Hugging Face, orientados al post-entrenamiento mediante aprendizaje por refuerzo (RL) de modelos generativos de vídeo con control de cámara. No se trata de un modelo de lenguaje ni de un modelo completo: los adaptadores se aplican sobre tres modelos base distintos —nvidia/Lyra-2.0, robbyant/lingbot-world-v2-14b-causal-fast y Drexubery/UniView (construido sobre Wan-AI/Wan2.1-VACE-14B-diffusers con CausVid LoRA)— para mejorar la coherencia de las trayectorias de cámara en tareas de generación de vídeo imagen-a-vídeo y de modelado de mundo (world model).

El repo ocupa 1,5 GB e incluye tres ficheros: `logo-lyra2-lora.pt` (para Lyra-2, con scheduler DMD), `logo-lingbot-world-v2-lora.pt` (para LingBot-World 2.0) y `logo-uniworld-view-lora.safetensors` (para UniWorld-View). El entrenamiento se realiza con la recompensa LoGo, y la evaluación se apoya en el dataset TrajectoryBench, también publicado por el mismo autor. El código de uso, inferencia y evaluación está en el repositorio de GitHub del proyecto, no dentro del repo de Hugging Face.

La relevancia de esta publicación radica en que el control preciso de cámara es uno de los principales cuellos de botella de los world models y de los generadores de vídeo condicionados por pose: en lugar de resolverlo solo con datos supervisados, aquí se plantea un ajuste por refuerzo con una recompensa específica sobre la trayectoria. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es `other` con nombre `base-model-terms`, por lo que el uso queda sujeto a los términos de los tres modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (Low-Rank Adaptation) sobre modelos base de generación de vídeo / world models de tipo transformer con generación causal (LingBot-World 2.0 es "causal-fast"; UniView se apoya en Wan2.1-VACE, de tipo difusión). El detalle de rangos LoRA, capas afectadas y configuración exacta no está disponible |
| Parametros totales | No disponible para los adaptadores (la model card no indica rango ni número de parámetros entrenables). Los modelos base declarados son de ~14B en el caso de LingBot-World 2.0 y de Wan2.1-VACE-14B en el caso de UniWorld-View |
| Parametros activos | No aplica: ningún componente declarado es un modelo MoE |
| Longitud de contexto | No disponible. No se especifica ventana temporal (número de frames) ni resolución soportada |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card no declara idiomas; se trata de generación de vídeo, no de texto) |
| Licencia | `other` con nombre `base-model-terms` (términos del modelo base). Sujeta a las licencias de nvidia/Lyra-2.0, robbyant/lingbot-world-v2-14b-causal-fast, Drexubery/UniView, Wan-AI/Wan2.1-VACE-14B-diffusers y CausVid LoRA |
| Formato de pesos | PyTorch `.pt` (Lyra-2 y LingBot-World 2.0) y `.safetensors` (UniWorld-View) |
| Tamano del repositorio | 1,5 GB (los tres adaptadores en conjunto) |
| Fecha de creacion / actualizacion | 27 de septiembre de 2026 (creado) y 27 de septiembre de 2026 (última actualización, según Hugging Face) |
| Dataset asociado | ziqima/TrajectoryBench |
| Pipeline declarado | image-to-video |

## Arquitectura y entrenamiento

Los tres artefactos son adaptadores LoRA, es decir, matrices de bajo rango que se acoplan a un modelo base congelado. No se publican los rangos, el número de capas adaptadas, ni si el ajuste afecta solo a las proyecciones de atención o también a los bloques de cross-attention que reciben la condición de cámara. Lo que sí se declara es el método de entrenamiento: post-entrenamiento con la recompensa LoGo mediante aprendizaje por refuerzo, es decir, no es un fine-tuning supervisado clásico sobre pares (trayectoria, vídeo), sino una optimización guiada por una señal de recompensa que evalúa la calidad del control de cámara. El código del bucle de RL y de la generación de escenas vive en el repositorio `ziqi-ma/logo`, no en la model card.

Cada adaptador está atado a un base distinto y requiere instrucciones de ejecución diferentes. Para Lyra-2 se indica explícitamente el uso del scheduler DMD y un lanzamiento con `torchrun --standalone --nproc_per_node=8`, lo que implica evaluación multi-GPU y, probablemente, un modelo base de gran tamaño. Para LingBot-World 2.0 se emplea un script de generación de escenas (`wan.rl.inference.gen_scenes`) con el parámetro `--lora_path`. Para UniWorld-View se usa `rl.inference.eval_gen` con `--pose-scale 1.5`, un parámetro que sugiere que el control de cámara se inyecta como condición de pose con una escala ajustable. La evaluación sobre TrajectoryBench, incluidas las configuraciones de generación por grupo, se documenta en `eval/README.md` del repositorio de código.

## Capacidades

- Generación de vídeo imagen-a-vídeo condicionada por trayectoria de cámara: los adaptadores mejoran la fidelidad con la que el vídeo generado sigue la pose o trayectoria especificada.
- Control de cámara explícito: el parámetro `--pose-scale` de la variante UniWorld-View permite modular la intensidad con la que se aplica la condición de pose.
- Post-entrenamiento por refuerzo con recompensa de trayectoria (recompensa LoGo), orientado a alinear la generación con el movimiento de cámara deseado.
- Compatibilidad con tres familias de modelos base distintas: Lyra-2, LingBot-World 2.0 y UniWorld-View (Wan2.1-VACE).
- World modeling: las etiquetas del repo incluyen `world-model`, por lo que los base están pensados para simular entornos dinámicos, no solo para generar clips.
- Generación multi-escena: el script de LingBot-World 2.0 (`gen_scenes`) trabaja sobre un directorio de escenas y un conjunto de identificadores, lo que apunta a generación por lotes.
- Tool calling / function calling: no aplica ni está declarado.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplica ni está declarado.
- Capacidades multilingües: no aplica ni están declaradas.
- Capacidades especiales declaradas: ninguna adicional (ni vision-language, ni audio, ni modo "thinking").

## Casos de uso

- Previsualización cinematográfica (previz): dado un fotograma inicial y una trayectoria de cámara planeada, el adaptador permite generar un plano con el movimiento pedido, útil para validar decisiones de dirección antes de rodar. La variante Lyra-2 y la de UniWorld-View son las más indicadas según los scripts publicados.
- Generación de datos sintéticos para robótica y conducción autónoma: al poder condicionar la cámara, se pueden producir secuencias con puntos de vista controlados que sirvan como datos de entrenamiento para políticas de navegación o percepción.
- Simulación de entornos para agentes embodied: los base están etiquetados como `world-model`, de modo que un agente puede interactuar con un entorno generado manteniendo coherencia de perspectiva entre pasos.
- Órbita y reconocimiento de objeto en 3D: con el control de pose de UniWorld-View (`--pose-scale`) se pueden generar barridos de cámara alrededor de un objeto para inspección visual o para reconstrucción volumétrica aproximada.
- Postproducción y reframing de vídeo: regenerar un plano existente con una cámara distinta (por ejemplo, un travelling lateral en lugar de un plano fijo) sin volver a rodar.
- Investigación en RL aplicado a generación de vídeo: el repo sirve como banco de pruebas para comparar recompensas de trayectoria, usando TrajectoryBench como protocolo de evaluación reproducible.
- Demos interactivas y videojuegos: generación de planos en tiempo no real pero controlables por el usuario, con la cámara como variable de entrada principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card únicamente remite a la evaluación sobre TrajectoryBench y a su descripción en `eval/README.md` dentro del repositorio de código, pero no incluye cifras de métricas, comparaciones ni configuraciones de generación por grupo en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato del autor. Como referencia orientativa (estimación propia, no confirmada), los base declarados de ~14B en precisión fp16 requerirían del orden de 28-32 GB solo para pesos, más memoria para activaciones, latentes de vídeo y cachés temporales; a 8 bits, del orden de 14-18 GB, y a 4 bits, alrededor de 8-12 GB, siempre sin contar el coste de la decodificación temporal de vídeo, que puede ser considerable.
- GPU recomendadas según el propio repo: el ejemplo de Lyra-2 se lanza con `torchrun --standalone --nproc_per_node=8`, lo que sugiere 8 GPU por nodo para la ruta de evaluación de ese modelo base.
- GPU de gama profesional: A100 40/80 GB y H100 son opciones razonables para los base de 14B en fp16 y para la inferencia multi-GPU.
- GPU de consumo: no confirmado. Con cuantización agresiva (4 bits) y resolución/duración reducidas podría caber en tarjetas de 24 GB (RTX 4090, RTX 3090), pero el repo no documenta ninguna ruta de cuantización, así que esto es una hipótesis y no un procedimiento soportado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo). El despliegue soportado se reduce a los scripts PyTorch del repositorio `ziqi-ma/logo`: `lyra_2._src.rl.inference.evaluate`, `wan.rl.inference.gen_scenes` y `rl.inference.eval_gen`. La variante UniWorld-View se apoya en un base distribuido en formato `diffusers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada (ni parámetros, ni contexto, ni métricas). A continuación se listan únicamente las alternativas que aparecen como modelos base en la propia model card, sin valores de rendimiento comparables:

| Modelo | Relacion con LoGo | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| ziqima/LoGo (este repo) | Adaptadores LoRA de RL | No disponible (adaptadores) | No disponible | `other` / `base-model-terms` |
| nvidia/Lyra-2.0 | Base de `logo-lyra2-lora.pt` | No disponible en la información | No disponible | No disponible |
| robbyant/lingbot-world-v2-14b-causal-fast | Base de `logo-lingbot-world-v2-lora.pt` | 14B (por el nombre del repo) | No disponible | No disponible |
| Drexubery/UniView (+ Wan-AI/Wan2.1-VACE-14B-diffusers) | Base de `logo-uniworld-view-lora.safetensors` | 14B (por el nombre de Wan2.1-VACE) | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: sin descargar el modelo base correspondiente, los ficheros `.pt`/`.safetensors` de este repo no generan nada por sí solos.
- Licencia `other` con nombre `base-model-terms`: el uso comercial queda condicionado a la licencia de cada modelo base, incluidos Wan2.1-VACE-14B y los LoRA de terceros (CausVid) que forman parte de la cadena de UniWorld-View. Es imprescindible revisarlas una por una antes de cualquier despliegue en producción.
- No hay ninguna cifra de rendimiento publicada en la model card: cualquier afirmación sobre calidad o mejora respecto al base no está respaldada por datos en la información disponible.
- No se documentan sesgos conocidos, pero un world model entrenado sobre un dataset concreto (y evaluado en TrajectoryBench, del propio autor) puede generalizar mal a distribuciones de escena, dominio e iluminación distintas de las de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir geometría inconsistente, objetos que aparecen o desaparecen y movimientos de cámara que no respetan la física de la escena.
- Sin información sobre cuantización, resolución, duración de clip ni número de frames soportado: es difícil estimar coste de inferencia y calidad resultante en producción.
- Repositorio sin adopción: 0 descargas y 0 likes, lo que implica ausencia de validación externa, de issues resueltos y de experiencia comunitaria depurable.
- Dependencia de código externo: todo el flujo de uso está en `github.com/ziqi-ma/logo`, sin versión fijada ni empaquetado; la reproducibilidad depende de ese repositorio.
- La variante Lyra-2 requiere un scheduler DMD concreto y un lanzamiento multi-GPU; ignorarlo puede degradar la calidad de forma silenciosa.
- Fechas de creación y actualización (2026) tal como las reporta Hugging Face; conviene verificarlas antes de citar el repo.

## Enlaces

- Hugging Face: https://huggingface.co/ziqima/LoGo
- Codigo de uso e inferencia: https://github.com/ziqi-ma/logo
- Dataset de evaluacion: https://huggingface.co/datasets/ziqima/TrajectoryBench
- Perfil del autor: https://huggingface.co/ziqima
- Modelo base Lyra-2: https://huggingface.co/nvidia/Lyra-2.0
- Modelo base LingBot-World 2.0: https://huggingface.co/robbyant/lingbot-world-v2-14b-causal-fast
- Modelo base UniView: https://huggingface.co/Drexubery/UniView
- Modelo base Wan2.1-VACE-14B (diffusers): https://huggingface.co/Wan-AI/Wan2.1-VACE-14B-diffusers
- Script de evaluacion en TrajectoryBench: `eval/README.md` dentro del repositorio https://github.com/ziqi-ma/logo (no se ha localizado una URL directa en la informacion disponible)
