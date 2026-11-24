# voyager-so/shot-reader-8b

## Resumen

Shot Reader 8B es un modelo de visión-lenguaje especializado en el análisis inverso de planos audiovisuales. Desarrollado por Voyager, toma como entrada un clip de vídeo de un plano continuo y produce una hoja de rodaje en JSON que describe la altura, el ángulo, el objetivo y el movimiento de cámara, así como los sujetos presentes, sus posiciones, tamaños, posturas y trayectorias, y el decorado que los rodea. Está pensado para que herramientas 3D o agentes de código puedan reconstruir la escena directamente en Blender.

Técnicamente es un fine-tune de Qwen3-VL-8B-Instruct mediante LoRA (r64) sobre las capas de atención y MLP del modelo de lenguaje, con los pesos fusionados en el checkpoint publicado. Cuenta con 8.767.123.696 parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. El modelo trabaja exclusivamente en inglés y está optimizado para un régimen de entrada concreto: 16 fotogramas muestreados uniformemente del plano y redimensionados a 448×256.

Su relevancia radica en que ataca un cuello de botella específico de los pipelines de previsualización asistidos por IA: los agentes actuales pueden generar geometría en Blender, pero fallan al interpretar la intención cinematográfica de un plano de referencia. Según el autor, en el benchmark VibePrevisBench los agentes a los que se les pide un ángulo bajo entregan nivel de ojos en hasta dos tercios de los planos. Shot Reader convierte esa interpretación en una representación explícita y editable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (Qwen3-VL) con adaptador LoRA r64 fusionado |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (vLLM), 4-bit (bitsandbytes, `--load-in-4bit`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; adaptador LoRA separado en `lora/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal con codificador visual y modelo de lenguaje, y se adapta mediante LoRA con rango 64 aplicado a las capas de atención y MLP del modelo de lenguaje. Los pesos del adaptador se han fusionado en el checkpoint principal, aunque el repositorio conserva el adaptador aislado en el directorio `lora/`. La entrada se estandariza a 16 fotogramas por plano, muestreados de forma uniforme y redimensionados a 448×256, seguidos de un prompt fijo (`PROMPT`) más la referencia de esquema (`schema.md`).

El entrenamiento se realizó con miles de planos sintéticos, según la model card. No se detalla en la información disponible el número exacto de tokens, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO. La innovación principal no es arquitectónica sino de formulación de la tarea: convertir la comprensión cinematográfica en una salida JSON estructurada y geométricamente coherente (posiciones en metros sobre el plano del suelo, origen bajo la cámara en el primer fotograma, `+x` a la derecha y `+y` hacia delante) que un motor 3D puede consumir sin postprocesado semántico.

## Capacidades

- Análisis de planos de vídeo: estimación de altura de cámara en metros, ángulo (`eye`, low, high), pitch en grados, campo de visión (FOV) en grados, tipo de movimiento (`crane`, dolly, orbit, etc.) y detección de cámara en mano.
- Encuadre y composición: clasificación del tipo de plano (`full`, etc.) y sujeto principal del encuadre.
- Detección y seguimiento de sujetos: identificadores persistentes proporcionados por el usuario (`--subject "ID: clase (descripción)"`), clase, dimensiones en metros, postura y trayectoria con marcas de tiempo, posición y orientación (`facing_deg`).
- Comprensión de decorado: listado de elementos del set con clase, posición, tamaño y rotación (`yaw_deg`).
- Detección de eventos dentro del plano (campo `events`, vacío en el ejemplo publicado).
- Clasificación de entorno: interior/exterior y descripción textual.
- Salida estructurada en JSON conforme a un esquema documentado, apta para consumo directo por herramientas 3D y agentes.
- Procesamiento de vídeo como entrada multimodal (image-text-to-text con soporte de video-understanding).

## Casos de uso

- Previsualización a partir de referencia: se introduce un clip y se obtiene un blockout 3D editable para reiluminar, cambiar de óptica o rodar de nuevo el plano, evitando reconstruir la puesta en escena a mano.
- Vídeo generativo controlable: la altura, el movimiento de cámara, el layout y las trayectorias de los sujetos se convierten en parámetros explícitos y editables en lugar de depender de la interpretación de un prompt de texto.
- Etiquetado y búsqueda de archivo audiovisual: indexación de bibliotecas completas por movimiento de cámara, encuadre y blocking, con un coste declarado de aproximadamente 2 dólares por cada mil planos.
- Agentes de construcción de escenas: un agente que genera geometría en Blender recibe un brief preciso en JSON en lugar de una descripción ambigua, lo que según el autor eleva la puntuación del agente en 15,6 puntos en VibePrevisBench.
- Documentación técnica de rodaje: generación automática de hojas de plano para departamentos de postproducción o VFX que necesitan reconstruir la cámara de un plano real.
- Investigación en comprensión cinematográfica: el modelo sirve como extractor de anotaciones estructuradas sobre corpus de vídeo para entrenar o evaluar otros sistemas.
- Integración en pipelines de previsualización en la nube: despliegue en vLLM sobre H100 con un throughput declarado de 0,76 s por plano en procesamiento por lotes.

## Benchmarks y rendimiento

| Métrica | Shot Reader 8B | Opus 5.5 | Gemini 4 Argon | Qwen3-VL-8B (base) |
|---|---|---|---|---|
| Altura de cámara y movimiento ambos correctos (300 planos reservados) | 69% | 44% | 46% | 5%¹ |
| Scene Check, metraje real (reconstrucciones VibePrevisBench) | 35,6 | 38,5 | 37,3 | no disponible |
| Tiempo por plano | 5,9 s | 14,2 s | no disponible | no disponible |
| Coste por plano | ~0,002 USD | ~0,06 USD | no disponible | no disponible |

¹ Modelo base sin entrenar, mismo prompt, 20 planos reservados. Las cifras de velocidad y coste corresponden a una H100 con vLLM en FP8; el throughput por lotes es de 0,76 s por plano, aproximadamente 1,50 USD por millón de tokens de salida.

## Requisitos de hardware

- VRAM estimada: el autor reporta ejecución en 4-bit sobre una RTX 5080 de 16 GB, con unos 25 s por plano incluyendo la carga del modelo. En FP8 sobre H100 el tiempo por plano baja a 5,9 s.
- GPU recomendadas: H100 para producción y máximo throughput; RTX 5080 (16 GB) validada en 4-bit para uso local.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits (requiere `bitsandbytes`).
- Opciones de despliegue: vLLM (`--backend vllm`, la vía más rápida), transformers con `--load-in-4bit`, y el script de un solo archivo `shot_reader.py` que acompaña al modelo. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 5,9 s por plano en H100 FP8 en inferencia individual, 0,76 s por plano en modo lote, 25 s por plano en RTX 5080 a 4 bits con carga incluida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shot Reader 8B | 8,77 B | no disponible | Análisis inverso de planos a JSON 3D | Apache 2.0 | Hugging Face, pesos abiertos |
| Qwen3-VL-8B-Instruct | ~8 B | no disponible | VLM generalista | no disponible en la información | Hugging Face |
| Opus 5.5 | no disponible | no disponible | LLM/VLM propietario de propósito general | propietaria | API |
| Gemini 4 Argon | no disponible | no disponible | LLM/VLM propietario de propósito general | propietaria | API |

La comparación relevante no es de tamaño sino de especialización: frente a los modelos propietarios de propósito general, Shot Reader gana en la tarea concreta de identificar altura y movimiento de cámara (69% frente a 44% y 46%) y es entre dos y diez veces más rápido y barato por plano, aunque queda por debajo en la métrica global de reconstrucción de escena (35,6 frente a 38,5 y 37,3).

## Limitaciones y advertencias

- Solo admite inglés como idioma; no hay soporte multilingüe declarado.
- La entrada debe ser un único plano continuo: es necesario cortar los vídeos más largos en los puntos de edición antes de procesarlos.
- El rendimiento en la métrica global de reconstrucción (Scene Check, 35,6) es inferior al de los modelos propietarios comparados, pese a la ventaja en interpretación de cámara.
- El modelo base sin entrenar obtiene un 5% en la métrica de cámara, lo que indica que la capacidad depende por completo del fine-tune y no debe esperarse generalización fuera del dominio de planos cinematográficos.
- Riesgo de alucinación en la estimación de profundidad, tamaños y trayectorias: las posiciones son estimaciones métricas derivadas de imágenes 2D y pueden contener error acumulado en planos largos o con oclusiones.
- Existe una versión posterior, Shot Reader v2, que según el autor distingue zoom de dolly con un 95% de acierto frente al 7% de Opus 5.5, detecta cámara en mano y añade pies de foto, etiquetas y confianza calibrada; para nuevos proyectos conviene evaluar esa variante.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las obligaciones de atribución y las condiciones del modelo base Qwen3-VL-8B-Instruct.
- No se han publicado datos sobre sesgos demográficos ni sobre el comportamiento con planos no cinematográficos (vigilancia, deporte, grabación doméstica).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voyager-so/shot-reader-8b
- Shot Reader v2: https://huggingface.co/voyager-so/shot-reader-v2
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper VibePrevisBench: https://arxiv.org/abs/2611.15789
- Sitio del autor: https://voyager.so
- Voyager Cloud: https://voyager.so/cloud
- Esquema de salida: https://huggingface.co/voyager-so/shot-reader-8b/blob/main/schema.md
- Script de inferencia: https://huggingface.co/voyager-so/shot-reader-8b/blob/main/shot_reader.py
