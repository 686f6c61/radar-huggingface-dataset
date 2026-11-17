# wdwz2000/realrobot-bowl-stacking-rlt-4b119f99

## Resumen

`realrobot-bowl-stacking-rlt-4b119f99` es un paquete de pesos para una política de aprendizaje por refuerzo (RL) aplicada a una tarea de robótica real: apilar un cuenco amarillo sobre un cuenco rojo. Lo publica el usuario `wdwz2000` en Hugging Face y no es un modelo de lenguaje, sino un artefacto de RL que combina tres piezas: una base VLA (vision-language-action) congelada, un codificador de tokens y una cabeza Actor/Critic entrenada con RLT (RL Token).

El paquete ocupa unos 7,67 GB, pero el grueso corresponde a la base congelada B3 π0.5 (7,47 GB); el Actor/Critic real ocupa solo 6,60 MB y el codificador de tokens 189,83 MB. La propuesta técnica es interesante: en lugar de afinar el VLA completo, se congela y se aprende una representación compacta de 256 dimensiones sobre sus activaciones, sobre la que opera un Actor/Critic ligero que produce acciones de 8 dimensiones.

Es relevante como ejemplo de pipeline de RL sobre modelos VLA congelados para manipulación robótica, con contratos de identidad estrictos (SHA256 del codificador, normalización y datos de procedencia). La información pública es escasa: cero descargas, cero likes, sin benchmarks y con documentación únicamente en chino. La licencia es "other", sujeta a términos upstream y del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA congelada (B3 π0.5) + Token Transformer (2 capas, 8 cabezas) + Actor/Critic MLP (hidden 256) |
| Parámetros totales | no disponible (pesos: base 7,47 GB, token encoder 189,83 MB, actor/critic 6,60 MB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prefijo VLA con `prefix_seq_len` máximo de 968 tokens) |
| Tipos de cuantización | no disponible (pesos en PyTorch `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | zh (chino; el prompt de tarea registrado es `把黄碗放在红碗上`) |
| Licencia | other (`upstream-and-project-terms`, ver `LICENSES.md`) |
| Formato de pesos | PyTorch `.pt` (`base_b3.pt`, `token_encoder_ce6f418c.pt`, `actor_critic_4b119f99.pt`) |

## Arquitectura y entrenamiento

El sistema se compone de tres módulos encadenados. La base B3 π0.5 (`b3dc7f29`) está congelada y aporta representaciones VLA a partir de imagen, texto de tarea y estado propioceptivo; de ella se extrae un prefijo de hasta 968 posiciones con dimensión 2048. Un Token Transformer de 2 capas y 8 cabezas comprime ese prefijo a 256 dimensiones (`input_dim` 2048, `embed_dim` 256), con un presupuesto de entrenamiento de 2000 pasos, batch 16 y learning rate 0,0003. Finalmente, un Actor/Critic recibe la concatenación de esos 256 rasgos con 8 dimensiones de estado (264 en total) y emite una acción de 8 dimensiones con `chunk_length=1`.

El entrenamiento RL usa un esquema tipo actor-crítico con doble Q, redes objetivo, `gamma` 0,99, `tau` 0,005, `policy_delay` 2 y `reference_dropout` 0,5. Se realizaron 20.000 actualizaciones del crítico y 10.000 del actor, con batch 64 y learning rate 0,0003. La recompensa proviene de `reviewed_task_events/v1`, eventos de tarea real revisados. Los datos de entrenamiento se basan en una instantánea con 50 demostraciones originales más 30 episodios autónomos o con intervención, identificada por el fingerprint `96819a063f2889d76912472266c79c0ed60ff685d0d7e291be53b8298e5e5b9d`. La configuración registra entrenamiento en `npu:0`, aunque esto no implica que la inferencia requiera NPU.

## Capacidades

- Ejecución de una única tarea de manipulación robótica: colocar un cuenco amarillo sobre uno rojo en un entorno real.
- Política de control con salida de acción de 8 dimensiones (brazo derecho único, estado propioceptivo de 8 dimensiones).
- Consumo de entradas multimodales: imágenes de cámara principal y de muñeca, texto de tarea en chino y estado de articulaciones.
- Representación compacta de 256 dimensiones extraída de un VLA congelado, reutilizable para investigación del espacio latente.
- Checkpoint completo para continuar entrenamiento offline de Actor/Critic (incluye crítico, redes objetivo y estado del optimizador).
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento; no es un modelo de propósito general.
- Multilingüismo: únicamente chino documentado.

## Casos de uso

- Investigación en RL sobre modelos VLA congelados: el paquete permite estudiar cómo una cabeza ligera (6,60 MB) aprende sobre representaciones de una base de 7,47 GB sin reentrenarla, útil para comparar estrategias de congelación y adaptación.
- Reproducción de experimentos de manipulación con cuencos: con los pesos, `assets/` y `config/`, un laboratorio puede replicar la política en un banco de pruebas con brazo derecho, cámara principal y de muñeca, siempre que respete el contrato de normalización.
- Evaluación offline de políticas: cargando `actor_critic_4b119f99.pt` y el codificador `ce6f418c` se pueden medir acciones sobre episodios grabados sin conectar hardware, gracias a la separación entre lectura de checkpoint y ejecución.
- Formación de personal técnico en robótica: el repositorio documenta contratos de entrada/salida, normalización y procedencia, lo que lo hace didáctico para enseñar pipelines de RL real.
- Base para experimentos de recompensa: al estar la recompensa versionada (`reviewed_task_events/v1`), sirve para probar variantes de funciones de recompensa manteniendo fija la base y el codificador.
- Verificación de integridad y auditoría de artefactos: incluye `MANIFEST.json`, `SHA256SUMS` y `verify_files.py`, útil como caso práctico de trazabilidad de pesos en producción.
- Punto de partida para transferencia a tareas similares de apilamiento: el Actor/Critic puede reentrenarse offline con nuevos datos de replay, siempre que se demuestre compatibilidad de identidad con el codificador y la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el paquete completo son 7,67 GB de pesos en fp32; cargar la base B3 (7,47 GB) requiere al menos ese espacio más overhead de activaciones, por lo que se recomienda GPU con 24 GB o más.
- GPU recomendadas: no documentadas. Por tamaño, una RTX 4090 (24 GB) o A100/H100 (40-80 GB) son candidatas razonables para cargar la base; el Actor/Critic y el codificador son ligeros y caben en cualquier GPU consumer.
- Cabe en GPU consumer: probablemente sí en RTX 3090/4090 para la base en precisión reducida, aunque no está verificado ni documentado.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este artefacto). La carga se realiza con PyTorch (`torch.load` con `weights_only=True`, `mmap=True`) y las clases del proyecto `RLTPolicy` / `RLTTokenTransformer`.
- Latencia y throughput: no disponibles.
- Nota: el entrenamiento se registró en `npu:0`; la inferencia requiere el entorno del proyecto con el lector VLA correspondiente.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| realrobot-bowl-stacking-rlt-4b119f99 | Política RL sobre VLA congelada | 7,67 GB totales (Actor/Critic 6,60 MB) | prefijo 968 tokens | other (upstream + proyecto) | Hugging Face, 0 descargas |
| π0.5 (base B3 referenciada) | VLA generalista | no disponible | no disponible | no disponible | referenciada como base congelada |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (políticas RL para apilamiento de cuencos) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados; al entrenarse con 80 episodios en un entorno concreto, la política puede sobreajustarse a condiciones de iluminación, posiciones y objetos específicos.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erróneas o no generalizables fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: prompt de tarea únicamente en chino; ventana de prefijo limitada a 968 tokens; una sola tarea (apilamiento de cuencos).
- Restricciones de licencia: licencia "other" con términos upstream y del proyecto; es imprescindible revisar `LICENSES.md` antes de cualquier uso comercial.
- Caveats de producción: los pesos no incluyen configuración de robot, numeración de cámaras ni controlador; la identidad de codificador y base está ligada por SHA256 y no se pueden mezclar versiones (`1307e988`, `fb474eea` no son sustitutos válidos). No se puede reproducir el entrenamiento solo con los pesos: faltan datos de replay, recompensas y particiones. La documentación está solo en chino.
- Madurez: 0 descargas y 0 likes; sin validación externa ni benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-rlt-4b119f99
- Licencias: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-rlt-4b119f99/blob/main/LICENSES.md
- Pesos base B3: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-rlt-4b119f99/blob/main/weights/base_b3.pt
- Codificador de tokens: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-rlt-4b119f99/blob/main/weights/token_encoder_ce6f418c.pt
- Actor/Critic: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-rlt-4b119f99/blob/main/weights/actor_critic_4b119f99.pt
- Manifiesto de integridad: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-rlt-4b119f99/blob/main/MANIFEST.json
- Procedencia: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-rlt-4b119f99/blob/main/provenance.json
