# Thelocallab/Pika-H3-Flex-ComfyUI-Workflow

## Resumen

Pika H3 Flex ComfyUI Workflow es un repositorio de flujo de trabajo para ComfyUI que permite ejecutar localmente el modelo Pika H3 Flex de Pika Labs, construido sobre la arquitectura MiniMax H3. El repositorio no contiene pesos de modelo: únicamente incluye el grafo JSON (`Pika-H3-Flex-References-SemanticBridge.json`) con los nodos, enlaces de descarga y ajustes ya probados. El modelo subyacente resuelve la generación de vídeo a partir de una a tres imágenes de referencia y un prompt dividido por planos, produciendo escenas cortas con movimiento de cámara, diálogo, sonido y música.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de despliegue local de un modelo de vídeo generativo multimodal en hardware de consumo y semipro (RTX A4500, 16-24 GB de VRAM), con tiempos de muestreo medidos. Por otro, expone el ecosistema de componentes necesarios: un modelo de difusión podado a int8 (~21 GB), un text encoder Qwen3-VL de 32B en NVFP4/AWQ (~16 GB), dos VAE (vídeo y audio), un LoRA de adaptación de Pika (~2 GB), una puerta VSA para aceleración (~3,9 GB) y un Semantic Bridge (~11 MB), sumando unos 48 GB en total.

El flujo está pensado para creadores e investigadores que quieran reproducir pipelines de referencia-a-vídeo sin depender de la API de pika.art. La licencia es la MiniMax H3 Community License Agreement, que debe revisarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión sobre MiniMax H3 (modelo base Pika-Labs/Pika-H3-Flex); text encoder Qwen3-VL 32B; VAE de vídeo y VAE de audio separados |
| Parámetros totales | no disponible (el modelo de difusión se distribuye podado a int8, ~21 GB; el text encoder es de 32B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el prompt se estructura por planos; no se especifica límite de tokens) |
| Tipos de cuantización | int8 (modelo de difusión), NVFP4 + AWQ (text encoder), bf16 (LoRA de Pika), fp16 (VAE de vídeo), fp32 (VAE de audio) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors (difusión, text encoder, VAE, LoRA, gate VSA, Semantic Bridge); workflow en JSON para ComfyUI |

## Arquitectura y entrenamiento

El pipeline combina un modelo de difusión derivado de MiniMax H3 con un text encoder Qwen3-VL de 32B cuantizado a NVFP4 con AWQ, dos VAE especializados (vídeo en fp16 y audio en fp32) y un LoRA de adaptación de Pika H3 Flex en bf16. La generación se controla mediante un sampler LCM con seis sigmas manuales de Pika (1.0, 0.972973, 0.923077, 0.8, 0.571429, 0.333333, 0.0), CFG 1 y fuerza de adaptador 1, lo que permite muestrear en solo seis pasos.

Sobre esta base se añaden dos componentes de aceleración y control: una puerta VSA (Video Sparse Attention) con dispersión 0.75, que reduce el coste de atención y acelera el muestreo, y un Semantic Bridge con fuerza 0.15, que alinea semánticamente las imágenes de referencia con el prompt. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; la model card del workflow no los detalla.

## Capacidades

- Generación de vídeo a partir de una a tres imágenes de referencia (reference-to-video) y de una imagen inicial (image-to-video).
- Producción de escenas cortas con movimiento de cámara controlado mediante prompt por planos.
- Generación de audio integrada: diálogo, efectos de sonido y música, gracias al VAE de audio dedicado.
- Soporte de prompts narrativos detallados, incluyendo posiciones en pantalla ("a la izquierda del encuadre") y justificación causal de las acciones.
- Muestreo rápido en seis pasos con sampler LCM y sigmas predefinidas.
- Upscale 2x integrado en el flujo para clips de mayor duración.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning; es un pipeline generativo de vídeo, no un LLM conversacional.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Prototipado de storyboards animados: a partir de dos o tres imágenes de referencia (personaje, localización, objeto) y un prompt por planos, se generan clips de 5 s que sirven como previsualización animada antes de producción real.
- Generación de vídeo publicitario corto: clips de 5 s a 0,6 MP (1056x608) con movimiento de cámara y audio integrado, adecuados para pruebas de concepto y redes sociales.
- Creación de contenido para redes con personajes consistentes: el uso de una character sheet como referencia (solo la apariencia, sin paneles) permite mantener la identidad visual del personaje entre clips.
- Doblaje y sonorización automatizada de escenas: el VAE de audio genera diálogo y música junto al vídeo, útil para maquetas de animación o cortinillas.
- Investigación en generación de vídeo condicionada por referencia: el flujo expone todos los componentes (VSA gate, Semantic Bridge, sigmas) para experimentar con ablaciones y ajustes de dispersión.
- Docencia y formación en pipelines de difusión: el grafo de ComfyUI con nodos etiquetados y enlaces a cada peso sirve como material didáctico reproducible en una RTX A4500 de 20 GB.
- Pruebas de concepto en hardware de consumo: clips de 5 s a 0,6 MP caben en GPUs de 12 y 16 GB (simuladas limitando VRAM en la A4500), lo que permite evaluar el modelo antes de invertir en hardware mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí incluye mediciones de tiempo y memoria en una RTX A4500 (20 GB, una referencia, gate activado):

| Configuración | Muestreo | Ejecución completa |
|---|---|---|
| 5 s a 0,6 MP (1056x608) | 1:43 | 2:11 (con gate desactivado) |
| 15 s a 0,6 MP | ~7:00 | ~11:15 (incluye upscale 2x) |
| 5 s a 0,6 MP con VRAM limitada a 16 GB | misma velocidad | dentro del límite |
| 5 s a 0,6 MP con VRAM limitada a 12 GB | misma velocidad | dentro del límite |
| 15 s a 0,6 MP con VRAM limitada a 16/12 GB | completó | pico de ~17 GB, supera ambos límites |
| 15 s a 0,8 MP en 20 GB | — | sin memoria (OOM) |
| 15 s a 1344x768 con tres referencias en 20 GB | — | OOM; completó en una GPU de 24 GB |

## Requisitos de hardware

- VRAM estimada: unos 48 GB de pesos en disco; en VRAM, un clip de 5 s a 0,6 MP con una referencia cabe en 12-16 GB. Un clip de 15 s a 0,6 MP pica en ~17 GB. A 0,8 MP y 15 s se agota la memoria en 20 GB.
- GPU recomendadas: RTX A4500 (20 GB) como referencia medida; GPU de 24 GB para 15 s a 1344x768 con tres referencias; GPUs de 12-16 GB solo para clips cortos de 5 s.
- Cabe en GPU de consumo: sí, para clips de 5 s a 0,6 MP en tarjetas de 12-16 GB; no para clips largos o alta resolución.
- Opciones de despliegue: ComfyUI con nodos personalizados Ref2VA VSA (Kablex), MiniMax H3 Semantic Bridge (speach1sdef178), Memory Cleanup, Nvidia RTX Nodes, KJNodes, rgthree y VideoHelperSuite (instalables vía ComfyUI Manager).
- Requisitos de software: PyTorch compilado para CUDA 13 (cu130) y driver NVIDIA 580 o superior.
- Latencia y throughput: 1:43 de muestreo para 5 s a 0,6 MP; ~7:00 para 15 s a 0,6 MP; ~11:15 de ejecución completa con upscale 2x en RTX A4500.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, este flujo se posiciona frente a otros pipelines de image-to-video locales (por ejemplo, variantes de difusión de vídeo ejecutables en ComfyUI), pero no se han facilitado parámetros, contextos ni resultados comparables para establecer una tabla rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pika H3 Flex (este flujo) | no disponible | no disponible | MiniMax H3 Community License | Hugging Face + ComfyUI local |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio contiene solo el workflow JSON, no los pesos; sin descargar los ~48 GB de componentes el flujo no funciona.
- La licencia MiniMax H3 Community License Agreement impone restricciones que deben leerse antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinación visual y física: la model card recomienda justificar causalmente las acciones en el prompt (por ejemplo, explicar por qué un dron choca) para obtener resultados coherentes; sin ello, el modelo puede generar movimientos ilógicos.
- Límites de memoria: 0,8 MP a 15 s agota 20 GB de VRAM; escenas largas o con tres referencias requieren 24 GB o más.
- Los clips de 15 s en GPUs de 12-16 GB completan pero superan el límite de VRAM (~17 GB de pico), lo que puede provocar intercambio a memoria del sistema y ralentizaciones.
- No hay información sobre sesgos, idiomas soportados ni evaluación de calidad objetiva; la model card no publica métricas.
- Requiere versiones específicas de software (CUDA 13, driver 580+) y varios nodos personalizados de terceros, lo que aumenta la fragilidad del entorno reproducible.
- El flujo está pensado para clips cortos por plano; no es adecuado para vídeo de larga duración ni para generación en tiempo real.

## Enlaces

- Repositorio del workflow: https://huggingface.co/Thelocallab/Pika-H3-Flex-ComfyUI-Workflow
- Modelo base Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Licencia: https://huggingface.co/Pika-Labs/Pika-H3-Flex/blob/main/LICENSE
- Pesos de difusión (Comfy-Org MiniMax-H3): https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/diffusion_models
- Text encoders: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/text_encoders
- VAE: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/vae
- LoRAs: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/loras
- Gate VSA (FastVideo): https://huggingface.co/barelymining/ComfyUI-MiniMax-H3-FastVideo/tree/main
- Semantic Bridge: https://huggingface.co/speach1sdef178/MiniMax-H3-Semantic-Bridge/tree/main
- Nodo Ref2VA VSA: https://github.com/Kablex/ComfyUI-Ref2VA-VSA
- Nodo Semantic Bridge: https://github.com/Speach1sdef178/MiniMax-H3-Semantic-Bridge
- Tutorial en vídeo: https://youtu.be/_CUlPWpRa8o
- Guía gratuita (Patreon): https://www.patreon.com/TheLocalLab/posts/174460405
- Modelo en Civitai: https://civitai.com/models/3038436
