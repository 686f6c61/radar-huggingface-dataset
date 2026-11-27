# w3joe/rc-flux-droid-lora-ema

## Resumen

rc-flux-droid-lora-ema es un conjunto de pesos para robótica publicado por el usuario w3joe en Hugging Face, concebido como política de control para el simulador del concurso Reality Check. Se trata de un ajuste fino mediante LoRA del modelo de acción mundial FLUX 3 Action de Black Forest Labs, especializado en tareas de manipulación con un brazo UR12e (colocación de pernos, tuercas y arandelas). El repositorio incluye además el planificador Qwen3-VL-8B-Instruct utilizado por el mecanismo de reserva basado en scripts.

El modelo parte del tronco DiT de `black-forest-labs/flux-3-action-droid` y se entrena con 1.300 episodios de demostración generados en el simulador público Reality Check (196.732 ventanas), aplicando LoRA de rango 32 sobre las proyecciones de los bloques `single_blocks` y manteniendo entrenables las cabezas EE50 de entrada y salida. El resultado se fusiona en un único `flux/model.safetensors` en bf16 de 13,9 GB, que representa una política completa con cabezas de acción de 50 dimensiones.

Su relevancia es acotada y contextual: se trata de una entrada de concurso con licencia no comercial, sin descargas ni interacciones en el momento de la ficha, y con resultados medidos por debajo de una política puramente scriptada de visión-IK en las mismas tareas. Resulta útil como referencia técnica de cómo se compone un world-action model con planificador VLM y reserva determinista, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT (FLUX 3 Action) con LoRA fusionado y cabezas EE50; text encoder Qwen3-VL-4B-Instruct; VAE de vídeo FLUX 3 |
| Parametros totales | no disponible (pesos de política bf16 de 13,9 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | flux-kommunity-license (FLUX Kommunity License v1.0, no comercial); componentes Qwen bajo Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, video_vae.safetensors) + config.json, manifest.json, ee50_stats.json |

## Arquitectura y entrenamiento

La política se construye sobre el tronco DiT de FLUX 3 Action, un modelo de acción mundial que combina un transformer de difusión con un VAE de vídeo y un text encoder Qwen3-VL-4B-Instruct. El espacio de acciones es de 50 dimensiones relativas de efector final (EE50: posición, rot6d y pinza), que el código de carga convierte a deltas articulares mediante IK amortiguada con límites (damped least squares). La generación de acciones usa chunks de 32 pasos con 4 pasos del sampler UniPC y guidance 4.0, ejecutando los primeros 16 pasos de cada plan.

El entrenamiento se realizó en tres fases: inicialización desde el tronco de `flux-3-action-droid` con remapeo del backbone de acción a los nombres de las cabezas EE50 y carga de seis tensores de cabeza procedentes de un ajuste fino previo de `flux-3-action-base` en el paso 3000; aplicación de LoRA de rango 32, alpha 32 y dropout 0.05 sobre las proyecciones q, k, v, attn_out, mlp_in y mlp_out de `single_blocks`, con cabezas EE50 entrenables; y fusión final del adaptador en el tronco. Se usaron 1.300 episodios de habilidades scriptadas (196.732 ventanas) del simulador Reality Check, 5.000 actualizaciones en 7 GPU H100 con AdamW, bf16, learning rate 1e-4 para el adaptador y 5e-4 para las cabezas, 100 pasos de warm-up y acumulación de gradiente 2. Se exportaron los pesos EMA con decaimiento 0.999 en el paso 5000.

## Capacidades

- Generación de acciones robóticas de efector final en 50 dimensiones (posición, rotación en rot6d y pinza) para el brazo UR12e en simulación.
- Ejecución de tareas de colocación de pernos, tuercas y arandelas dentro del simulador Reality Check.
- Planificación de objetivos asistida por Qwen3-VL-8B-Instruct como componente de reserva scriptado.
- Composición con finalizadores scriptados y reserva de visión-IK en el pipeline de control del repositorio de código.
- Procesamiento multimodal de entrada a través del text encoder Qwen3-VL-4B-Instruct y del VAE de vídeo de FLUX 3.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general ni soporte multilingüe en la información disponible.

## Casos de uso

- Investigación en modelos de acción mundial: sirve como ejemplo reproducible de ajuste LoRA sobre un DiT de difusión para control robótico, con manifiesto de hashes y estadísticas de normalización incluidas.
- Evaluación comparativa de políticas en simulación: permite medir el efecto de EMA frente a pesos crudos (0,295 frente a 0,393 en el protocolo del autor) sobre las mismas tareas del concurso.
- Reproducción de entradas de concurso: el repositorio contiene todo lo que la política carga por ruta desde `RC_WEIGHTS_DIR`, lo que facilita replicar exactamente una submission fijando la revisión.
- Estudio de pipelines híbridos aprendizaje-script: documenta cómo se apila una política neuronal con un finalizador scriptado y una reserva de visión-IK para tareas de manipulación.
- Base para experimentos de adaptación a otros brazos o tareas: el esquema de cabezas EE50 y la conversión mediante IK amortiguada pueden reutilizarse en entornos simulados similares.
- Docencia y divulgación técnica: útil para explicar la composición de un world-action model con VAE de vídeo, text encoder VLM y cabezas de acción, así como el uso de EMA en ajuste fino.
- No es adecuado para robótica física en producción ni para despliegues comerciales, según la propia model card y la licencia.

## Benchmarks y rendimiento

| Protocolo | Configuración | Resultado |
|---|---|---|
| Judged-path runner, engine-v1 total, tareas públicas + 4 ocultas | EMA paso 5000 + finalizador + reserva scriptada, 4 repeticiones por tarea | 0,295 sobre 23 de 24 episodios completados antes del plazo |
| Mismo protocolo | Pesos crudos (sin EMA) | 0,393 |
| Rango de puntos engine-v2 | Mismo protocolo | 17,4–22,6 |

El autor indica que la política por sí sola queda muy por debajo de una política puramente scriptada de visión-IK en las mismas tareas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos de política en bf16 ocupan 13,9 GB, a los que se suman el VAE de vídeo, el text encoder Qwen3-VL-4B y el planificador Qwen3-VL-8B, por lo que el conjunto completo requiere bastante más que la política sola.
- GPU recomendadas: el entrenamiento se realizó en 7 GPU H100; para inferencia no se especifican modelos concretos.
- A100, H100 y RTX 4090: no se confirma compatibilidad ni encaje en GPU de consumo en la información disponible.
- Opciones de despliegue: el código de carga está en el repositorio GitHub `w3joe/rc-flux-droid-policy` y lee los pesos por ruta desde `RC_WEIGHTS_DIR`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rc-flux-droid-lora-ema | Política robótica LoRA sobre FLUX 3 Action | no disponible (13,9 GB bf16) | no disponible | FLUX Kommunity License (no comercial) | Hugging Face, 0 descargas |
| black-forest-labs/flux-3-action-droid | Modelo base de acción mundial | no disponible | no disponible | no disponible en esta ficha | Hugging Face (referenciado como base) |
| black-forest-labs/flux-3-action-base | Modelo base de acción mundial | no disponible | no disponible | no disponible en esta ficha | Hugging Face (referenciado como base) |
| Política scriptada de visión-IK | Control determinista | no aplica | no aplica | no disponible | Referenciada en el repositorio del autor |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, salvo la indicación cualitativa de que la política scriptada de visión-IK supera a esta política en las mismas tareas.

## Limitaciones y advertencias

- Licencia FLUX Kommunity License v1.0: restringe el uso comercial y de producción, incluidos usos robóticos, salvo lo que la licencia permita expresamente; los componentes Qwen son Apache-2.0.
- Uso previsto exclusivamente de investigación y evaluación; no apta para robótica de producción.
- Rendimiento medido bajo: 0,295 en el protocolo del autor, por debajo de una política scriptada de visión-IK, y solo 23 de 24 episodios completados antes del plazo del runner.
- Dependencia del simulador Reality Check y del brazo UR12e; no se documenta transferencia a hardware real.
- El pipeline requiere componentes adicionales (finalizador scriptado y reserva de visión-IK) para funcionar según lo medido; la política sola no basta.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque al ser un modelo generativo de acciones en simulación existe riesgo de acciones inválidas fuera de la distribución de entrenamiento.
- Idiomas soportados no disponibles; el modelo no está orientado a tareas de texto general.
- `flux/config.json` contiene rutas `/opt/...` que el código sobrescribe; editar el fichero invalidaría `flux/manifest.json`, lo que exige respetar el flujo de carga previsto.
- Repositorio sin descargas ni interacciones y creado recientemente, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/w3joe/rc-flux-droid-lora-ema
- Repositorio de código de la política: https://github.com/w3joe/rc-flux-droid-policy
- Modelo base FLUX 3 Action DROID: https://huggingface.co/black-forest-labs/flux-3-action-droid
- Modelo base FLUX 3 Action: https://huggingface.co/black-forest-labs/flux-3-action-base
- Licencia FLUX Kommunity (LICENSE.md y NOTICE.md dentro del repositorio): https://huggingface.co/w3joe/rc-flux-droid-lora-ema/blob/main/LICENSE.md
- Simulador Reality Check: no disponible enlace en la información proporcionada
