# wayrise/openwam-encoder-study-robotwin-clean-sft

## Resumen

OpenWAM encoder study es un repositorio de tres checkpoints de un modelo de accion-mundo (world-action model) para robótica, denominado OpenWAM, publicado por el usuario wayrise en Hugging Face. Los tres checkpoints comparten la misma arquitectura de doble sistema con self-attention conjunta y máscara de atención mutua, y operan sobre un espacio unificado de acciones y estados de 80 dimensiones. La única diferencia entre ellos es el codificador visual empleado, lo que convierte al repositorio en un estudio controlado del impacto del encoder visual en el rendimiento de la política resultante.

Cada checkpoint se preentrenó durante 1 época sobre una mezcla de 200 horas de WorldEngine y RoboCOIN (43.124 pasos con batch global de 512) y después se ajustó finamente sobre el conjunto RoboTwin 2.0 aloha-agilex clean_50 durante 5 épocas (10.740 pasos). El repositorio ocupa 74,1 GB e incluye pesos, configuración, tokenizador, estadísticas de normalización y configuraciones de reconstrucción del encoder.

El interés del modelo es metodológico y de investigación: permite comparar de forma aislada tres familias de codificadores visuales (VAE de Wan2.2, DINOv3 ViT-B/16 con S-VAE y V-JEPA 2.1 ViT-g/384 con S-VAE) dentro del mismo pipeline de entrenamiento y sobre las mismas tareas de manipulación robótica. No es un modelo de propósito general ni un modelo de lenguaje: es un componente de política robótica asociado al proyecto OpenWAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenWAM dual-system con self-attention conjunta y máscara de atención mutua (world-action model) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | ventanas de 33 frames con stride de vídeo 4 (9 frames por clip); no se especifica contexto en tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje documentadas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`checkpoint_step_10740.safetensors`), más `config.yaml`, `tokenizer/`, `normalization_stats.npy` y configuraciones del encoder |
| Espacio de acciones/estado | 80 dimensiones unificadas (acciones EEF) |
| Codificadores visuales | Wan2.2 VAE; DINOv3 ViT-B/16 + S-VAE (768→48); V-JEPA 2.1 ViT-g/384 + S-VAE (1408→48) |
| Entrada visual | canvas de 3 cámaras a 384×320 |
| Tamaño del repositorio | 74,1 GB |
| Precisión de entrenamiento | bf16 con DeepSpeed ZeRO-2 |

## Arquitectura y entrenamiento

OpenWAM es un modelo de acción-mundo de doble sistema que combina un modelo de mundo (predicción de dinámica visual) con una política de acción, unidos mediante self-attention conjunta y una máscara de atención mutua que regula el flujo de información entre ambos componentes. Las acciones se representan en un espacio unificado de 80 dimensiones derivado de las acciones del efector final (EEF). La entrada visual se compone de tres cámaras renderizadas en un canvas de 384×320, procesadas en ventanas de 33 frames con stride de vídeo 4, lo que resulta en 9 frames por clip.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento de 1 época sobre una mezcla de 200 horas de WorldEngine y RoboCOIN, con 43.124 pasos a batch global 512. Después, un ajuste fino sobre RoboTwin 2.0 aloha-agilex clean_50 (50 tareas × 50 episodios, 549.787 ventanas de entrenamiento) durante 5 épocas y 10.740 pasos, con batch global 256 en 2 nodos × 8 GPUs × 16 por GPU. Se usó AdamW (betas 0,9/0,95), weight decay 0,01, learning rate 1e-4 con schedule coseno y 5% de warmup decayendo al 1% del pico, gradient clipping 1,0 y semilla 42. Los datos se normalizaron con min-max (estadísticas en `normalization_stats.npy`) y se aplicó un filtro de segmentos estáticos (PR #66 de OpenWAM) que re-muestrea ventanas cuyo primer paso de acción coincide con el estado actual, además de color jitter 0,2/0,2/0,2 con hue 0. La innovación principal del repositorio es el diseño experimental: los tres checkpoints comparten todos los hiperparámetros y difieren únicamente en el encoder visual, lo que permite atribuir diferencias de rendimiento al codificador.

## Capacidades

- Generación de acciones robóticas de manipulación en un espacio unificado de 80 dimensiones a partir de observaciones visuales de tres cámaras.
- Predicción de dinámica visual como parte del modelo de mundo (world-action model).
- Política de manipulación entrenada sobre 50 tareas de RoboTwin 2.0 con el robot aloha-agilex.
- Procesamiento de ventanas temporales de 33 frames con muestreo de 9 frames por clip.
- Tres variantes de representación visual intercambiables: reconstrucción latente vía VAE (Wan2.2), características semánticas de DINOv3 y características de V-JEPA 2.1, todas proyectadas a un espacio latente de 48 dimensiones mediante S-VAE en las variantes F2 y F3.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento textual.

## Casos de uso

- Estudio comparativo de encoders visuales en robótica: los tres checkpoints permiten evaluar, con todo lo demás constante, si un VAE generativo, un ViT auto-supervisado (DINOv3) o un modelo de vídeo predictivo (V-JEPA 2.1) producen mejores políticas de manipulación sobre las mismas 50 tareas de RoboTwin 2.0.
- Investigación en world-action models: el checkpoint sirve como base para experimentos sobre la interacción entre el modelo de mundo y la política mediante la máscara de atención mutua.
- Reproducción de experimentos de ajuste fino: la configuración completa (config.yaml, normalización, tokenizador, estadísticas) permite reproducir el pipeline de SFT sobre RoboTwin 2.0 aloha-agilex clean_50.
- Punto de partida para transferencia a nuevos conjuntos de manipulación: los pesos preentrenados en 200 horas de WorldEngine + RoboCOIN pueden ajustarse sobre otros datasets de robot con espacio de acciones EEF mapeable a 80 dimensiones.
- Evaluación de representaciones visuales latentes: las configuraciones de reconstrucción incluidas (`dinov3/`, `manifest.json`, `svae_config.json`) permiten analizar qué información retiene cada encoder y cómo afecta a la política.
- Benchmarking interno de políticas robóticas: útil en laboratorios que comparan arquitecturas de política sobre RoboTwin 2.0 y necesitan una línea base OpenWAM con encoder visual controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 74,1 GB e incluye tres checkpoints completos con encoders congelados, por lo que cada checkpoint individual requiere una fracción de ese tamaño; no se especifica el tamaño por checkpoint.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 2 nodos × 8 GPUs con 16 muestras por GPU en bf16 y DeepSpeed ZeRO-2, lo que sugiere GPUs de centro de datos (A100/H100), pero no se confirma el modelo exacto.
- Compatibilidad con GPU de consumo: no disponible. La presencia de V-JEPA 2.1 ViT-g/384 (un ViT grande) y de un VAE de vídeo Wan2.2 hace plausible que la inferencia necesite más de 24 GB de VRAM, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio se distribuye como checkpoints de PyTorch/safetensors para el framework OpenWAM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenWAM encoder study (este) | no disponible | ventanas de 33 frames, 3 cámaras 384×320 | política de manipulación + world model | no disponible | Hugging Face, 74,1 GB |
| OpenWAM base (referencia del proyecto) | no disponible | no disponible | world-action model | no disponible | repositorio OpenWAM en GitHub |
| Políticas tipo diffusion policy / ACT sobre RoboTwin 2.0 | no disponible | no disponible | imitación visomotora | variable | múltiples implementaciones públicas |

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Modelo de investigación: los checkpoints están ajustados exclusivamente sobre RoboTwin 2.0 aloha-agilex clean_50 y no hay evidencia de generalización a otros robots, entornos o tareas.
- Las rutas dentro de `config.yaml` apuntan al clúster de entrenamiento del autor, por lo que será necesario reescribirlas para poder cargar los checkpoints en local.
- Sin benchmarks publicados: no hay métricas de éxito en tareas que permitan estimar la calidad de las políticas.
- Sin información sobre sesgos, alucinación o robustez: al tratarse de un modelo de acción y no de lenguaje, los riesgos se trasladan a fallos de manipulación física (colisiones, agarres fallidos) que deben mitigarse con capas de seguridad en el robot.
- El filtro de segmentos estáticos y la normalización min-max dependen de las estadísticas incluidas; usar otras estadísticas o entornos con distribuciones distintas puede degradar el rendimiento.
- Sin soporte documentado de cuantización ni de motores de inferencia estándar, lo que limita el despliegue en hardware de consumo.
- El repositorio incluye tres checkpoints completos (74,1 GB), lo que exige planificar el almacenamiento y descargar selectivamente con `--include`.

## Enlaces

- Hugging Face: https://huggingface.co/wayrise/openwam-encoder-study-robotwin-clean-sft
- Repositorio OpenWAM en GitHub: https://github.com/OpenWAM-Official/OpenWAM
- Pull request del filtro de segmentos estáticos: https://github.com/OpenWAM-Official/OpenWAM/pull/66
