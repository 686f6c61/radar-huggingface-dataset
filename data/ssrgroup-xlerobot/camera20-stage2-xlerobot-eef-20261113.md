# ssrgroup-xlerobot/camera20-stage2-xlerobot-eef-20261113

## Resumen

Camera20 Stage 2 → XLeRobot es un modelo de visión-lenguaje-acción (VLA) para control robótico de doble brazo, desarrollado por el grupo ssrgroup-xlerobot. El modelo parte de un checkpoint de preentrenamiento Stage 2 (283.350 pasos) que combina datos de robot y de ego (primera persona), y se ha afinado en parámetros completos durante 30.000 pasos por tarea sobre el robot real XLeRobot. La arquitectura combina un backbone Qwen3.5-4B con 32 capas de tipo MoT (Mixture of Tokens) y un cabezal de acciones basado en flow matching.

El modelo resuelve el problema de generar bloques de acciones de efector final absoluto (EEF) a partir de una observación multimodal: una imagen de cabeza y dos imágenes de muñeca, junto con el estado propioceptivo del robot. Es relevante porque demuestra un pipeline completo de preentrenamiento a gran escala seguido de ajuste fino por tarea en hardware real, con normalización específica por tarea y una interfaz de acción estandarizada de 23 dimensiones (Common23).

El repositorio, de 68,1 GB, contiene pesos EMA finales e intermedios para cuatro tareas (bloques verde-rojo, fruta, relevo y cajón), con code de inferencia independiente, procesadores y configuraciones. La licencia y los idiomas no están declarados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B + 32 capas MoT (Mixture of Tokens) + cabezal de acciones flow matching |
| Parametros totales | no disponible (backbone Qwen3.5-4B más capas MoT) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin GGUF ni safetensors declarados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`), carga estricta desde configuración |

## Arquitectura y entrenamiento

El modelo emplea un backbone de lenguaje Qwen3.5-4B al que se añaden 32 capas MoT (Mixture of Tokens), y un cabezal de predicción de acciones basado en flow matching. La salida es un bloque de 16 pasos de acciones absolutas de efector final (`(16, 16)`), que a 30 Hz cubre aproximadamente 0,53 segundos de futuro. El modelo interno maneja 23 dimensiones (Common23): 9 para el brazo izquierdo (xyz + rotation6d), 9 para el derecho, 2 para las pinzas y 3 para la cintura, que en este dataset se enmascaran a cero por no existir.

El entrenamiento parte de un checkpoint Stage 2 preentrenado con 283.350 pasos sobre datos mixtos de robot y ego. Cada tarea se afina desde ese mismo checkpoint con entrenamiento de parámetros completos durante 30.000 pasos, batch global de 128 y EMA de 0,999. El dataset por tarea consta de 36 trayectorias de entrenamiento, con episodios 9/19/29/39 reservados para validación. La normalización usa estadísticas q01/q99 específicas por tarea sobre las 36 trayectorias, sin recorte (clip). La pinza se mantiene en escala continua 0–100, a diferencia de la rama de preentrenamiento que la binariza. La rotación se representa como quaternion xyzw unitario convertido a rotation6d (primeras dos columnas de la matriz de rotación) y se reortogonaliza con Gram–Schmidt en inferencia.

## Capacidades

- Generación de bloques de acciones absolutas de efector final para control de doble brazo a partir de observaciones multimodales (tres cámaras RGB + estado propioceptivo).
- Predicción de pose absoluta (no incremental) con posición en metros e orientación como rotation6d, convertida a quaternion xyzw en la salida.
- Control de pinza continua en escala 0–100 con dirección de apertura/cierre preservada.
- Procesamiento de imágenes con redimensionado bilineal 224×224 y relleno negro centrado, con normalización interna por estadísticas del checkpoint.
- Integración con chat template de Qwen y prompts de tarea definidos en `config.yaml`.
- Inferencia por flow matching con 4 pasos de integración por defecto (configurable con `--num-steps`).
- Enmascaramiento de dimensiones ausentes (cintura) tanto en entrenamiento como en inferencia.
- No se declaran capacidades de tool calling, agentes multi-paso, matemáticas, código ni audio en la información disponible.

## Casos de uso

- Manipulación robótica de bloques verde-rojo: el modelo genera bloques de 16 acciones absolutas EEF para tareas de apilamiento o clasificación de bloques, usando las tres cámaras y el estado del robot; adecuado por su entrenamiento específico sobre 36 trayectorias de esa tarea.
- Recogida y colocación de fruta: con pesos afinados a 30.000 pasos (flow loss de validación 0,072744), permite controlar la pinza continua para agarrar objetos de geometría variable sin binarización.
- Tarea de relevo (relay): con el menor flow loss de validación del conjunto (0,050790), es el candidato más robusto para secuencias de paso de objeto entre brazos.
- Apertura y organización de cajones: pesos afinados con ZeRO-2 y flow loss de 0,080847, útiles para tareas de manipulación de tiradores y colocación en el interior.
- Investigación en VLA y flow matching: el repositorio incluye checkpoints intermedios (15k) y finales (30k) con manifiestos SHA-256, lo que permite estudiar la evolución del entrenamiento y comparar EMA intermedia frente a final.
- Evaluación de pipelines de preentrenamiento robot+ego: al partir de un Stage 2 común, sirve para analizar la transferencia de representaciones preentrenadas a tareas concretas de hardware real.
- Integración en bucles de control a 30 Hz: la salida de 16 pasos cubre 0,53 s, lo que permite ejecutar el bloque entre inferencias en un esquema de control por bloques.
- Reutilización de la interfaz Common23: el adaptador de acciones permite conectar el modelo a distintos robots que compartan el esquema de 23 dimensiones, ajustando solo la normalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente flow loss de validación sobre episodios reservados:

| Tarea | Ruta de inferencia | Pasos | Flow loss (validación) |
|---|---|---:|---:|
| green_red_blocks | `continuous_30k_20261117/green_red_blocks` | 30.000 | 0,064157 |
| fruit | `continuous_30k_20261117/fruit` | 30.000 | 0,072744 |
| relay | `continuous_30k_20261117/relay` | 30.000 | 0,050790 |
| drawer | `continuous_30k_20261117/drawer` | 30.000 | 0,080847 |
| fruit (intermedio) | `continuous_20261116/fruit/checkpoints/step_015000/` | 15.000 | 0,047537 |
| drawer (intermedio) | `continuous_20261116/drawer/checkpoints/step_015000/` | 15.000 | 0,055822 |

El autor advierte explícitamente de que el flow loss de validación no es la tasa de éxito en robot real y que no se guarda el checkpoint con el mejor loss de validación. No se han ejecutado rollouts reales según la información disponible.

## Requisitos de hardware

- Entorno validado: Python 3.10, PyTorch 2.8.0+cu128, Transformers 5.3.0, Flash Linear Attention 0.3.2, Triton 3.4.0 y NVIDIA H100.
- VRAM estimada: no disponible de forma explícita; el backbone Qwen3.5-4B más 32 capas MoT y pesos de 68,1 GB en el repositorio sugieren que la inferencia requiere GPU de datacenter (H100 validada por el autor). No se declara que quepa en GPU de consumo.
- GPU recomendadas: NVIDIA H100 (única validada). No se documentan A100, RTX 4090 ni otras.
- Despliegue: script de inferencia propio (`infer_eef.py`) y clase `Camera20Policy`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- La primera llamada compila kernels CUDA/Triton, lo que añade latencia inicial.
- Latencia y throughput: no disponibles; solo se indica que la salida cubre 0,53 s a 30 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Camera20 Stage 2 → XLeRobot | Qwen3.5-4B + 32 capas MoT | no disponible | VLA, flow matching, doble brazo | no disponible | Hugging Face (repo privado según instrucciones de descarga) |
| PI0.5 (referencia citada por el autor) | no disponible | no disponible | VLA con horizonte H50 | no disponible | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor menciona un modelo de control PI0.5 como referencia, señalando que este modelo conserva el horizonte nativo H16 frente al H50 de PI0.5. No se aportan más datos de comparación.

## Limitaciones y advertencias

- El flow loss de validación no equivale a tasa de éxito en robot real; no se han ejecutado rollouts reales según la información disponible.
- La salida es un objetivo absoluto EEF, no incremental: no debe acumularse sobre la pose actual del efector.
- La normalización q01/q99 es específica de cada tarea (36 trayectorias); usarla fuera de esa distribución invalida las predicciones.
- El modelo no controla motores directamente; requiere calibración, cinemática inversa y una interfaz de control cartesiano externos.
- La dimensión de cintura (20:23) está siempre enmascarada y a cero en este dataset.
- La pinza se entrena en escala continua 0–100, distinta de la binarización de la rama de preentrenamiento; mezclar reglas de normalización entre etapas produce inconsistencias.
- El repositorio es privado según las instrucciones de descarga (requiere autenticación con permisos de organización).
- Licencia no declarada: no se puede confirmar el uso comercial.
- Idiomas no declarados; el modelo está orientado a control robótico, no a generación de texto multilingüe.
- Solo se valida en NVIDIA H100; el rendimiento en otras GPU no está documentado.
- Riesgo de sobreajuste a las tareas y al hardware concretos (XLeRobot con tres cámaras y pinza de 0–100), sin evidencia de generalización a otros robots.

## Enlaces

- Hugging Face: https://huggingface.co/ssrgroup-xlerobot/camera20-stage2-xlerobot-eef-20261113
- README de pesos 30k: `continuous_30k_20261117/README.md` (dentro del repositorio)
- README de release 2026-11-16: `continuous_20261116/README.md` (dentro del repositorio)
- Verificación de inferencia: `INFERENCE_CHECK.json` (dentro del repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
