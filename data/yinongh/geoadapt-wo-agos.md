# yinongh/geoadapt-wo-agos

## Resumen

GeoAdapt w/o AGOS (depth + force diffusion policy) es una política de manipulación robótica entrenada para la tarea de inserción de clavija en orificio (peg-in-hole) en un entorno simulado Isaac Gym. Desarrollada por el usuario yinongh, se trata de una ablación del modelo AGOS en la que se eliminan las imágenes canónicas de clavija y orificio del pipeline original: la política recibe únicamente la imagen de profundidad de la muñeca y la fuerza de contacto del orificio. El modelo forma parte de la familia GeoAdapt, orientada a la adaptación geométrica en tareas de ensamblaje de precisión.

La arquitectura combina una troncal de visión ResNet-18 preentrenada en ImageNet (modificada con GroupNorm en lugar de BatchNorm) y un MLP para la señal de fuerza, compartidos por dos cabeceras de difusión independientes (una para traslación y otra para rotación). Cada cabecera fusiona las modalidades por concatenación y aplica una U-Net condicional 1-D. El entrenamiento sigue un esquema DDPM con 100 pasos de difusión y la inferencia usa muestreo DDIM de 20 pasos. El modelo tiene 51,3 millones de parámetros y produce chunks de acción de 9 dimensiones en el marco del efector final con horizonte de 10 pasos.

Con cero descargas y cero likes en Hugging Face, se trata de un artefacto de investigación publicado como material suplementario de un estudio de ablación, no de un modelo listo para producción. Su relevancia radica en documentar el impacto de eliminar la información geométrica canónica en políticas de inserción basadas en difusión, un área activa en robótica de manipulación fina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (troncal de profundidad, GroupNorm) + MLP de fuerza + dos cabeceras de difusión (U-Net condicional 1-D) con fusión por concatenación |
| Parametros totales | 51,3 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 1 frame de profundidad 480x640 y 1 paso de fuerza 3-D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`, payloads de checkpoint de GeoAdapt/AGOS) |

## Arquitectura y entrenamiento

La política procesa dos modalidades sensoriales: una imagen de profundidad de muñeca de 480x640 (un solo frame) y la fuerza neta de contacto del orificio (vector 3-D, un paso temporal). La troncal visual es una ResNet-18 con GroupNorm, adaptada desde pesos ImageNet, mientras que la fuerza se codifica mediante un MLP. Ambas representaciones se comparten entre dos cabeceras de difusión: una para las dimensiones de traslación (0-2) y otra para las de rotación (3-8), cada una con su propia U-Net condicional 1-D y fusión por concatenación. El entrenamiento usa DDPM con 100 pasos y la inferencia DDIM con 20 pasos, generando chunks de acción de 9 dimensiones con horizonte 10.

El dataset de entrenamiento consta de 20.630 trayectorias de demostración simuladas (normales y de recuperación) sobre 242 activos de clavija/orificio generados proceduralmente; 24 trayectorias de 12 activos se reservaron para validación. El entrenamiento se ejecutó durante 145.000 pasos con batch 512 (64 GPUs A100 × 8), AdamW con learning rate 3e-4, schedule coseno con 2.000 pasos de warmup, pesos EMA y semilla 233. El proceso se dividió en dos lanzamientos (pasos 0-40.000 y 40.000-145.000), reanudando el segundo desde el checkpoint del paso 40.000 con orden de datos y RNG de ruido frescos.

## Capacidades

- Generación de acciones de efector final de 9 dimensiones (3 de traslación, 6 de rotación) en chunks con horizonte 10, para control de un Franka de mordaza paralela.
- Percepción de profundidad de muñeca mediante troncal ResNet-18 adaptada.
- Percepción de fuerza de contacto del orificio mediante MLP sobre vector 3-D.
- Política de difusión con entrenamiento DDPM e inferencia DDIM acelerada (20 pasos).
- Ejecución de la tarea de inserción peg-in-hole en Isaac Gym (`AutoMateTaskAGOS`).
- Manejo de trayectorias de recuperación (el dataset incluye demostraciones normales y de recuperación).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de robótica puro.

## Casos de uso

- Investigación en políticas de difusión para manipulación: sirve como referencia de ablación para medir cuánto aporta la información geométrica canónica (imágenes de clavija/orificio) frente a la percepción directa de profundidad y fuerza en tareas de inserción.
- Benchmark de robustez sensorial en simulación: permite evaluar cómo se comporta una política de inserción cuando solo dispone de profundidad y fuerza, sin plantillas visuales de los objetos, útil para estudiar generalización a geometrías no vistas.
- Desarrollo de pipelines de entrenamiento en Isaac Gym: el repo incluye `resolved_config.yaml`, `metrics.jsonl` y `summary.json`, lo que facilita reproducir o extender el setup de entrenamiento con 64 A100.
- Estudio de fusión multimodal profundidad-fuerza: la arquitectura con troncal compartida y cabeceras separadas por traslación/rotación es un punto de partida para investigar estrategias de fusión en control de contacto.
- Baseline para comparativas de arquitectura: al ser una ablación del AGOS canónico, permite comparar directamente contra el modelo completo para aislar el efecto de eliminar AGOS.
- Transferencia sim-a-real en robótica de ensamblaje: aunque no se reporta éxito en bucle cerrado, el modelo puede servir como inicialización para fine-tuning en entornos reales de inserción de precisión.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas offline de error de reconstrucción sobre acciones normalizadas en ventanas de validación:

| Checkpoint | Paso | MSE con ruido fijo (holdout) | MSE de acción muestreada (holdout) |
|---|---|---|---|
| `checkpoints/last.pt` | 145.000 | 0,00996 | 0,0203 |
| `checkpoints/best_fixed_noise.pt` | 85.000 | 0,00853 | 0,0204 |

No se reporta tasa de éxito de inserción en bucle cerrado. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,3 M de parámetros y entrada de profundidad 480x640, la huella es modesta y cabe holgadamente en GPUs consumer, pero no se aporta una cifra oficial.
- GPU recomendadas: el entrenamiento usó 64 A100 (8 nodos × 8 GPUs); para inferencia basta una GPU única, aunque no se especifica el modelo mínimo.
- Cabe en GPU consumer: previsiblemente sí (el tamaño del repo es 1,6 GB y el modelo tiene 51,3 M de parámetros), pero no se confirma en la documentación.
- Opciones de despliegue: carga mediante el código de entrenamiento GeoAdapt/AGOS (`policy/checkpoint.py`: `load_checkpoint`, `build_policy_from_checkpoint(payload, device, use_ema=True)`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoAdapt w/o AGOS | 51,3 M | profundidad 480x640 + fuerza 3-D | MSE holdout 0,00853-0,0204 (offline) | no disponible | Hugging Face (0 descargas) |
| AGOS (`agos_canonical_split_unet`) | no disponible | profundidad + fuerza + imágenes canónicas | no disponible en esta ficha | no disponible | referenciado como modelo base |
| Otras políticas de difusión para peg-in-hole | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría más allá de la referencia al modelo AGOS completo del que esta ficha es una ablación.

## Limitaciones y advertencias

- Es una ablación de investigación, no un modelo validado para producción: no se reporta tasa de éxito de inserción en bucle cerrado, solo métricas offline de MSE.
- Entrenado exclusivamente en simulación (Isaac Gym) sobre 242 activos procedurales; la transferencia a robots reales no está documentada.
- La licencia no está disponible, lo que impide determinar si se permite uso comercial; debe contactarse el autor antes de cualquier despliegue.
- Al eliminar las imágenes canónicas AGOS, la política carece de información geométrica explícita de la clavija y el orificio, lo que puede reducir la robustez ante geometrías fuera de distribución.
- Depende de una cámara de profundidad de muñeca y de un sensor de fuerza de contacto; la ausencia o ruido en cualquiera de las dos modalidades degrada la política.
- El checkpoint `last.pt` tiene peor MSE con ruido fijo que `best_fixed_noise.pt` (paso 85.000), por lo que no es necesariamente el mejor punto de partida para inferencia.
- No procesa lenguaje, no tiene capacidades multilingües ni de razonamiento general; cualquier uso fuera de la tarea de inserción no está soportado.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero existe riesgo de acciones erróneas fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yinongh/geoadapt-wo-agos
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
