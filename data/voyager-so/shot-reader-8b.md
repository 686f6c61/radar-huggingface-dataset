# voyager-so/shot-reader-8b

## Resumen

Shot Reader 8B es un modelo de visión-lenguaje especializado en el análisis inverso de planos cinematográficos. Desarrollado por Voyager (voyager.so), parte de Qwen3-VL-8B-Instruct y se afina mediante LoRA para una tarea muy concreta: dado un fragmento de vídeo (un plano continuo), deducir cómo se rodó y emitir una hoja de plano en JSON con altura y ángulo de cámara, distancia focal, movimiento, número de sujetos, posiciones en metros, trayectorias, postura, eventos y descripción del decorado. El objetivo es que una herramienta 3D o un agente de código pueda reconstruir la escena directamente en Blender.

El problema que resuelve es la brecha entre la generación de escenas 3D y la comprensión previa del plano: según el autor, en el benchmark VibePrevisBench los agentes que construyen escenas fallan sistemáticamente en la cámara (hasta dos tercios de los planos con ángulo bajo acaban en altura de ojos). Shot Reader actúa como paso previo de "entendimiento" que convierte un vídeo de referencia en un briefing estructurado y explícito.

Es relevante por su tamaño contenido (8.767 millones de parámetros, ejecutable en una GPU de consumo de 16 GB en 4 bits) y por su enfoque de salida estructurada y verificable, orientada a previsualización, vídeo generativo controlable y etiquetado de librerías de metraje. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), fine-tune con LoRA r64 sobre capas de atención y MLP del modelo de lenguaje, fusionado en los pesos finales |
| Parámetros totales | 8.767.123.696 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (bitsandbytes, `--load-in-4bit`); FP8 para vLLM; pesos en safetensors sin cuantizar |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); adaptador LoRA separado en `lora/` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imagen/vídeo y texto. El ajuste se realizó con LoRA de rango 64 aplicado a las capas de atención y MLP del modelo de lenguaje, y el adaptador se fusionó en los pesos publicados; el adaptador original se distribuye aparte en la carpeta `lora/`. La entrada visual es fija: 16 fotogramas muestreados uniformemente a lo largo del plano y redimensionados a 448×256, seguidos del prompt de `shot_reader.py` (que incluye `PROMPT` y `schema.md`).

El entrenamiento combina dos fuentes. Por un lado, miles de planos sintéticos renderizados a partir de escenas generadas proceduralmente, donde la cámara, las posiciones y las trayectorias son conocidas con exactitud; algunos se re-renderizaron de forma fotorrealista con un modelo de vídeo. Por otro lado, metraje real de dominio público procedente de Wikimedia Commons y del conjunto Pre... (la model card se corta en ese punto). No se detalla el número de tokens de entrenamiento ni si hubo RLHF o DPO. La innovación principal no es arquitectónica sino de formulación de la tarea: salida JSON con un esquema de campos físicos (metros, grados, segundos) que un motor 3D puede consumir directamente.

## Capacidades

- Comprensión de vídeo de plano único: analiza un plano continuo y extrae su construcción cinematográfica.
- Estimación de cámara: altura en metros, ángulo (p. ej. `eye`), pitch en grados, FOV en grados, movimiento (`crane`, órbita, etc.), indicador de cámara en mano y encuadre.
- Detección y seguimiento de sujetos: identificadores persistentes, clase, dimensiones, postura, trayectoria con posición y orientación por instante.
- Descripción del decorado: tipo de entorno (interior/exterior), descripción textual y elementos del set con posición, tamaño y yaw.
- Detección de eventos a lo largo del plano.
- Salida estructurada en JSON conforme a un esquema documentado (`schema.md`), pensada para consumo por herramientas y agentes.
- Acepta sujetos con identificadores definidos por el usuario (`--subject "ID: clase (descripción)"`), que se preservan en la hoja de plano.
- Integración con vLLM como backend de inferencia rápida.
- Capacidades generales heredadas de Qwen3-VL-8B-Instruct (razonamiento visual, texto): no documentadas específicamente para este fine-tune.

## Casos de uso

- Previsualización a partir de referencia: se introduce un clip y se obtiene un blockout 3D editable para reiluminar, cambiar de óptica y volver a rodar, eliminando la reconstrucción manual de planos.
- Vídeo generativo controlable: la cámara, el layout y el movimiento pasan a ser entradas explícitas y editables en lugar de depender de un prompt ambiguo.
- Etiquetado y búsqueda de metraje: indexación de librerías completas por movimiento de cámara, encuadre y blocking a un coste aproximado de 2 dólares por cada mil planos.
- Agentes que construyen escenas: el agente recibe un briefing preciso con posiciones en metros y trayectorias en lugar de una descripción vaga, lo que reduce los errores de cámara.
- Automatización de pipelines en Blender: la hoja JSON se consume directamente por scripts o agentes de código para generar la escena, con identificadores de sujeto alineados con el briefing del usuario.
- Análisis de estilo cinematográfico a escala: extracción de patrones de altura de cámara, óptica y movimiento sobre corpus de vídeo para estudios de realización o docencia.
- Control de calidad en producción de previs: comparación de la hoja de plano generada con la intención de guion para detectar desviaciones antes del render.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Métrica | Shot Reader 8B | Opus 5.5 | Gemini 4 Argon | Qwen3-VL-8B (base) |
|---|---|---|---|---|
| Altura de cámara y movimiento correctos (300 planos reservados) | 69% | 44% | 46% | 5%¹ |
| Scene Check, metraje real (reconstrucciones VibePrevisBench) | 35,6 | 38,5 | 37,3 | no disponible |
| Tiempo por plano | 5,9 s | 14,2 s | no disponible | no disponible |
| Coste por plano | ~0,002 USD | ~0,06 USD | no disponible | no disponible |

¹ Modelo base sin entrenar, mismo prompt, 20 planos reservados. Opus y Gemini recibieron el mismo prompt y esquema. Velocidad y coste medidos en una H100 con vLLM en FP8; el throughput en lote es de 0,76 s por plano, aproximadamente 1,50 USD por millón de tokens de salida.

## Requisitos de hardware

- VRAM estimada: en 4 bits cabe en una RTX 5080 de 16 GB (probado, unos 25 s por plano incluyendo la carga del modelo). En FP8 se ejecuta en una H100.
- GPU recomendadas: H100 para producción con vLLM; RTX 5080 (16 GB) para uso local en 4 bits; GPUs de consumo con 16 GB o más como mínimo práctico.
- Despliegue: transformers (con `bitsandbytes` para 4 bits) o vLLM (`--backend vllm`). Requiere ffmpeg en el PATH para la extracción de fotogramas.
- Latencia y throughput: 5,9 s por plano en H100 con vLLM en FP8; 0,76 s por plano en lote; unos 25 s por plano en RTX 5080 en 4 bits con carga incluida.
- Coste: aproximadamente 0,002 USD por plano en H100 y 1,50 USD por millón de tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shot Reader 8B | 8,77 B | no disponible | Análisis de plano y hoja JSON para 3D | Apache 2.0 | Hugging Face, pesos abiertos |
| Qwen3-VL-8B-Instruct | ~8 B | no disponible | VLM generalista | no disponible en la información | Hugging Face |
| Opus 5.5 | no disponible | no disponible | Modelo propietario de propósito general | propietaria | API |
| Gemini 4 Argon | no disponible | no disponible | Modelo propietario multimodal | propietaria | API |

Frente al modelo base, Shot Reader mejora la precisión de cámara del 5% al 69% en la métrica de altura y movimiento. Frente a los modelos propietarios, es más preciso en esa métrica y entre 2 y 30 veces más rápido y barato, aunque queda por debajo en la puntuación Scene Check sobre metraje real (35,6 frente a 38,5 y 37,3).

## Limitaciones y advertencias

- Solo admite inglés como idioma; no hay soporte documentado de castellano.
- Un input debe ser un plano continuo: es necesario cortar los vídeos más largos en los puntos de edición antes de procesarlos.
- La puntuación Scene Check en metraje real (35,6) es inferior a la de los modelos propietarios comparados, lo que indica margen de error en la reconstrucción sobre vídeo no sintético.
- La entrada visual está fijada a 16 fotogramas a 448×256; desviarse de ese muestreo o del prompt de `shot_reader.py` invalida los resultados publicados.
- Riesgo de alucinación inherente a los VLM: posiciones, dimensiones y trayectorias son estimaciones, no mediciones; conviene validarlas en el motor 3D.
- No se documentan sesgos específicos ni evaluación de robustez fuera de los conjuntos descritos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct puede tener condiciones propias que conviene revisar.
- El repositorio es muy reciente y con pocas descargas; no hay evidencia de uso en producción a escala.
- La model card está truncada en la descripción del conjunto de metraje real, por lo que se desconoce la composición completa del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voyager-so/shot-reader-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper del benchmark VibePrevisBench: https://arxiv.org/abs/2611.15789
- Sitio del autor: https://voyager.so
- Plataforma de entrenamiento e inferencia: https://voyager.so/cloud
- Script de inferencia: `shot_reader.py` (incluido en el repositorio)
- Referencia del esquema de salida: `schema.md` (incluido en el repositorio)
- Adaptador LoRA: carpeta `lora/` del repositorio
