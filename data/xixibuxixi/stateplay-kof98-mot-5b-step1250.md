# xixibuxixi/StatePlay-KOF98-MoT-5B-step1250

## Resumen

StatePlay-KOF98-MoT-5B-step1250 es un modelo experimental de generación de vídeo condicionado por acciones, construido como un world model de estado implícito sobre el DiT de Wan2.2-TI2V-5B. Lo publica el usuario xixibuxixi en Hugging Face y está entrenado específicamente sobre grabaciones y secuencias de botones del videojuego The King of Fighters '98. El objetivo es predecir el siguiente estado visual del juego a partir de un fotograma inicial, un prompt textual y una secuencia de acciones discretas (UP, DOWN, LEFT, RIGHT, Y, X, Z, A, B, C, D), lo que lo sitúa en la categoría de action-conditioned video generation aplicada a entornos de juego.

Arquitectónicamente es un transformer de difusión (DiT) de 30 capas y aproximadamente 5,1B parámetros, derivado del modelo Wan2.2-TI2V-5B de Alibaba, con un tokenizador de transiciones entrenado en una primera fase que genera los objetivos de entrenamiento y una rama de estado latente implícito (`use_latent_state=True`, `use_explicit_state=False`). El entrenamiento se dividió en dos etapas: 350 pasos de continuación del tokenizador de transiciones y 1.250 pasos de fine-tuning completo del DiT, con batch global de 128 sobre 16 GPUs en BF16.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de cómo adaptar un modelo de vídeo de propósito general a un dominio interactivo con acciones discretas, publicando pesos completos en safetensors (no LoRA), el tokenizador de transiciones y un script de inferencia que reutiliza el proyecto StatePlay. No es un modelo de propósito general ni un benchmark oficial: es un experimento personal orientado a investigación en world models y generación de vídeo condicionada por acciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 30 capas con estado latente implícito (StatePlay MoT) |
| Parámetros totales | ~5,1B (DiT completo; repo de 10,2 GB en BF16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; genera 97 frames por inferencia (entrenado con 101 frames) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | zh, en (prompts de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (1.317 tensores + 2 patch embeddings congelados del base; `transition_tokenizer.pt` en PyTorch) |

## Arquitectura y entrenamiento

El modelo parte del DiT de Wan2.2-TI2V-5B (image-to-video) y lo adapta con la arquitectura StatePlay, que introduce una rama de estado latente implícito para modelar la transición entre estados visuales dada una acción. El repositorio incluye `model_config.json` con la definición de 30 capas y ~5,1B parámetros, y el safetensors exporta 1.317 tensores más dos patch embeddings congelados heredados del base para permitir una carga estricta (`strict load`). El VAE de Wan, el codificador de texto UMT5-XXL y el tokenizer no se empaquetan en el repo: hay que reutilizar el directorio `base_model` del proyecto StatePlay o descargarlos por separado bajo los términos de Wan.

El entrenamiento se dividió en dos fases sobre el dataset `lupele/kof98` (revisión `7859c33c85baeb7e6b0b752c41057262074b2c00`), con 10.000 vídeos de entrenamiento y 100 de test sin contaminación. Fase 1: continuación del `transition_tokenizer.pt` durante 350 pasos con optimizador reiniciado. Fase 2: fine-tuning completo del DiT (`trainable_models=dit`) durante 1.250 pasos, inicializando desde el Wan2.2-TI2V-5B original y congelando el tokenizador de transiciones para generar los objetivos. Configuración: 16 GPUs, batch 8 por GPU, gradient accumulation 1 (batch global 128), learning rate 5e-5 en ambas fases, BF16, gradient checkpointing activo, prompt dropout 0,1, action dropout 0, DeepSpeed ZeRO-2 en fase 2 y checkpoints cada 250 pasos. Resolución 832×480, 101 frames de petición de entrenamiento (97 en inferencia), ventana de retención de acción de 10 pasos.

## Capacidades

- Generación de vídeo image-to-video condicionada por acciones discretas: dado un primer fotograma y una secuencia de botones (`UP DOWN LEFT RIGHT Y X Z A B C D`), genera el vídeo resultante del estado del juego.
- Modelado de estado implícito: la rama latente captura transiciones entre estados sin necesidad de un estado explícito ni del tokenizador en inferencia (`use_transition_tokenizer=False`).
- Generación de efectos visuales del dominio: proyectiles, llamas, explosiones y animaciones de combate del KOF98 (con limitaciones en tramos finales de alta intensidad).
- Estabilidad de HUD, personajes y fondo en secuencias de defensa y control remoto.
- Soporte de prompts de texto en chino e inglés para guiar la generación.
- Inferencia reproducible vía `infer_sft_project.py` con parámetros de frames, resolución, pasos de denoising, shift, seed y action-hold.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de vídeo, no un LLM.
- No soporta visión de entrada más allá del primer fotograma condicionante ni audio.

## Casos de uso

- Investigación en world models para videojuegos: simular la evolución visual de un combate de KOF98 a partir de una política de acciones, útil para estudiar modelado de dinámica y planificación en entornos interactivos.
- Generación de datos sintéticos de gameplay: producir clips etiquetados con acciones para aumentar datasets de entrenamiento de agentes o de modelos de imitación, con la salvedad de que las trayectorias no replican fielmente la realidad.
- Prototipado de motores de replay condicionado: dado un estado inicial y una secuencia de inputs, generar una visualización plausible del resultado sin ejecutar el emulador.
- Evaluación de métodos de action conditioning: servir como baseline reproducible de StatePlay sobre un dominio acotado y con pesos completos publicados.
- Demos y visualizaciones para investigación en generación de vídeo: comparativas lado a lado (incluidas en `examples/`) para ilustrar capacidades y fallos de modelos de difusión condicionados por acciones.
- Estudio de estabilidad temporal en DiT de vídeo: analizar la degradación en tramos finales con efectos intensos (explosiones, sobrexposición) como caso de estudio de drift estructural.
- Fine-tuning posterior sobre otros juegos o dominios de acciones discretas: al publicarse el DiT completo en safetensors (no LoRA), es reutilizable como punto de partida para nuevas adaptaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una validación cualitativa sobre 4 vídeos del conjunto de test (defensa, control remoto, cuerpo a cuerpo con llama púrpura y macro de patada con fuego), con observaciones de estabilidad y fallos en los tramos finales. No hay métricas FVD, PSNR, SSIM ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño (~5,1B en BF16, repo de 10,2 GB) se requiere una GPU de gama alta con al menos ~24 GB para BF16 y menos con cuantización, aunque no se documentan recetas de cuantización.
- GPU recomendadas: no especificadas por el autor; el entrenamiento usó 16 GPUs con BF16 y DeepSpeed ZeRO-2, lo que sugiere A100/H100 o equivalentes para entrenamiento.
- ¿Cabe en GPU consumer? No confirmado. Un modelo de vídeo DiT de 5B en BF16 más VAE y UMT5-XXL excede con holgura 24 GB; no hay datos publicados de ejecución en RTX 4090 u otras consumer.
- Opciones de despliegue: el autor solo documenta el script `infer_sft_project.py` del proyecto StatePlay, que importa `diffsynth.models.stateplay_dit.StatePlayModel`, el forward de StatePlay, el VAE de Wan, el text encoder y el scheduler. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vídeo de este tipo).
- Latencia y throughput: no disponibles. Se documenta la configuración de inferencia (97 frames, 832×480, 20 fps, 30 pasos de denoising, shift 5, seed 2, action-hold 10) pero no tiempos de ejecución.
- Almacenamiento: repo de 10,2 GB; el estado completo de entrenamiento en step 1250 ocupa ~252,6 GB y no se publica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StatePlay-KOF98-MoT-5B-step1250 | ~5,1B (DiT) | 97 frames, 832×480, 20 fps | Imagen + texto + acciones discretas | apache-2.0 | Pesos completos en HF (repo 10,2 GB) |
| Wan2.2-TI2V-5B (base) | ~5B | image-to-video de propósito general | Imagen + texto | no disponible en la información | Hugging Face (Wan-AI) |
| StatePlay (proyecto original) | no disponible | no disponible | Estado implícito + acciones | no disponible en la información | GitHub (Jimntu/StatePlay) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, condicionamiento y licencia.

## Limitaciones y advertencias

- Modelo experimental y personal: no es una publicación oficial de StatePlay ni de Wan; el autor lo declara explícitamente.
- Las trayectorias generadas no replican frame a frame el vídeo real: es un modelo generativo, no un emulador determinista del juego.
- Inestabilidad en tramos finales con efectos intensos: sobrexposición, estructura corrupta, drag y deformación de personajes en explosiones y combate cuerpo a cuerpo de alta velocidad.
- Validación limitada a 4 vídeos de test (smoke test), sin benchmark cuantitativo ni métricas objetivas.
- Riesgo de alucinación visual: puede generar efectos o transiciones plausibles pero incorrectas respecto a la mecánica real del juego.
- Idiomas de prompt limitados a chino e inglés; no se documenta soporte multilingüe adicional.
- Dependencia del ecosistema StatePlay: la inferencia requiere el proyecto original, el VAE de Wan, UMT5-XXL y el tokenizer, que no se incluyen en el repo y siguen sus propios términos.
- Licencia apache-2.0 en los pesos, pero los datos (`lupele/kof98`) y los modelos base (Wan2.2) tienen sus propias condiciones; revisar `LICENSE` y `NOTICE` antes de uso comercial.
- El tokenizador de transiciones publicado (`transition_tokenizer.pt`) solo se usa para construir objetivos de entrenamiento; no es necesario para inferencia de vídeo puro.
- No se publican estados de optimizador/RNG ni el estado completo de entrenamiento, lo que dificulta la reproducibilidad exacta del fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-KOF98-MoT-5B-step1250
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Proyecto StatePlay (GitHub): https://github.com/Jimntu/StatePlay
- Dataset KOF98: https://huggingface.co/datasets/lupele/kof98
- Ejemplos de comparación: `examples/defense_guard_contact_sheet.jpg`, `examples/control_projectile_contact_sheet.jpg`, `examples/offense_purple_contact_sheet.jpg`, `examples/macro_success_contact_sheet.jpg` (y sus `*_comparison.mp4` en el repo)
- Manifiestos y validación: `model_config.json`, `training_config.json`, `export_manifest.json`, `validation.json`, `SHA256SUMS` (en el repo)
- Script de inferencia: `infer_sft_project.py` (en el repo)
