# wjwjwjwj/gr00t-n1.7-robotwin-move_can_pot-simcosmos-aug

## Resumen

GR00T N1.7-3B es un modelo de visión-lenguaje-acción (VLA) desarrollado por NVIDIA para el control de robots manipuladores. Sobre esta base, el usuario `wjwjwjwj` ha publicado un checkpoint afinado para la tarea `move_can_pot` del benchmark de simulación RoboTwin 2.0, empleando un pipeline de aumento de datos sintéticos generados con Cosmos3-Nano-Sim-Transfer. El resultado es un modelo de 3B parámetros que traduce instrucciones en lenguaje natural e imágenes de cámaras (alta y muñecas) en secuencias de acciones articulares para un robot bimanual tipo ALOHA.

La relevancia de este checkpoint no reside en la arquitectura (heredada íntegramente de NVIDIA), sino en la receta de aumento de datos: partiendo de 50 demostraciones limpias, se generan episodios sintéticos filtrados que elevan la tasa de éxito en RoboTwin 2.0 del 34 % al 44 % en escenarios fáciles y del 0 % al 39 % en escenarios difíciles. Es, por tanto, una pieza de investigación sobre sim-to-real y data augmentation, no un modelo de propósito general.

El repositorio tiene un tamaño de 6,9 GB y contiene pesos en formato safetensors. La licencia es la NVIDIA Open Model License, que impone restricciones para uso comercial. El modelo solo está disponible en el Hub con 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter experimental y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone vision-lenguaje Cosmos-Reason2-2B (congelado) + cabeza de acción DiT con flow matching |
| Parametros totales | 3B (según nombre del modelo base `nvidia/GR00T-N1.7-3B`) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin indicar cuantización) |
| Idiomas soportados | no disponible (las instrucciones de RoboTwin están en inglés, pero no se documenta cobertura multilingüe) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7: un backbone visión-lenguaje Cosmos-Reason2-2B que permanece congelado durante el ajuste fino, y una cabeza de acción basada en Diffusion Transformer (DiT) entrenada con flow matching. La cabeza genera horizontes de 16 pasos de acción para un embodiment `NEW_EMBODIMENT` configurado mediante `robotwin_aloha_config.py`, con 6 articulaciones de brazo en coordenadas relativas y pinza absoluta por brazo, y tres cámaras de entrada: `cam_high`, `cam_left_wrist` y `cam_right_wrist`.

El entrenamiento se realizó durante 10 000 pasos con batch global de 64 en 2 GPUs NVIDIA B300, guardando checkpoints cada 2 500 pasos. El checkpoint publicado es el paso 10 000, seleccionado sobre una semilla de validación separada (50 episodios en dificultad Hard). Los datos de entrenamiento combinan 50 demostraciones limpias de RoboTwin 2.0 con episodios sintéticos generados por el pipeline Cosmos3 (variante v6: composición en simulador más filtro por conteo de objetos), dando lugar al dataset `robotwin-move_can_pot-clean50-simcosmos68-gr00t`. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares observación-acción.

## Capacidades

- Generación de acciones motoras de 16 pasos para un robot bimanual ALOHA a partir de instrucciones en lenguaje natural e imágenes de tres cámaras.
- Comprensión visuolingüística heredada del backbone Cosmos-Reason2-2B (escenas, objetos, instrucciones).
- Ejecución de la tarea específica `move_can_pot` (mover una lata hacia una olla) en el entorno RoboTwin 2.0.
- Generalización a instrucciones no vistas durante el entrenamiento, según la evaluación con "unseen instructions".
- Robustez mejorada frente a variaciones de escena gracias al aumento de datos sintéticos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni otras capacidades de texto general.

## Casos de uso

- Investigación en sim-to-real para manipulación robótica: el checkpoint sirve como referencia reproducible de cómo el aumento de datos con Cosmos3 mejora la tasa de éxito en RoboTwin 2.0 (34 % → 44 % en Easy, 0 % → 39 % en Hard).
- Punto de partida para ajuste fino en nuevas tareas de RoboTwin: la configuración `robotwin_aloha_config.py` y el recipe de 10k pasos permiten replicar el pipeline en otras tareas del benchmark.
- Evaluación de pipelines de data augmentation: comparar la variante v6 (composición en simulador + filtro por conteo de objetos) frente a la v1 permite aislar el efecto del filtrado de datos sintéticos.
- Benchmarking de políticas VLA: sirve como baseline afinado para medir políticas propias en la tarea `move_can_pot` con semilla 0 y 100 episodios.
- Estudio de estabilidad estadística en robótica: el análisis McNemar incluido (Easy +7 p=0.35, Hard +2 p=0.85) es un ejemplo de cómo reportar diferencias dentro del ruido experimental.
- Despliegue en servidor de políticas GR00T: el modelo se integra con `eval_policy.py` de RoboTwin 2.0 ejecutando 8 pasos de acción por inferencia, útil para pruebas de latencia en entornos simulados.

## Benchmarks y rendimiento

Evaluación en RoboTwin 2.0, `eval_policy.py` con servidor de políticas GR00T, 8 pasos de acción por inferencia, instrucciones no vistas, semilla 0, 100 episodios por configuración. Tasa de éxito en porcentaje:

| Datos de entrenamiento | Easy | Hard | Experimento |
|---|---|---|---|
| 50 demostraciones limpias (baseline) | 34 | 0 | v1 model repo |
| 50 limpias + aumento Cosmos3 (v1) | 41 | 35 | v1 model repo |
| 50 limpias + v6 sim composite + filtro (este checkpoint) | 44 | 39 | EXP-073 |

Comparación estadística de este checkpoint frente a v1 sobre las mismas 100 escenas (prueba de McNemar): Easy +7 puntos (p=0.35), Hard +2 puntos (p=0.85), es decir, diferencias dentro del ruido experimental.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3B parámetros y pesos safetensors, una estimación razonable en fp16 ronda los 6-7 GB, pero el dato no está confirmado en la información proporcionada.
- GPU de entrenamiento documentadas: 2 × NVIDIA B300.
- GPU recomendadas para inferencia: no disponible; por tamaño, cabría en GPUs consumer de gama alta (RTX 4090, 24 GB) y en A100/H100, pero no se documenta.
- Despliegue: servidor de políticas GR00T integrado con `eval_policy.py` de RoboTwin 2.0; no se mencionan vLLM, llama.cpp, Ollama ni TGI (son herramientas de texto y no aplican directamente a este VLA).
- Latencia y throughput: no disponibles; solo se indica que se ejecutan 8 pasos de acción por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7-3B + RoboTwin move_can_pot) | 3B | no disponible | move_can_pot (RoboTwin 2.0) | NVIDIA Open Model License | HuggingFace, 0 descargas |
| `nvidia/GR00T-N1.7-3B` (base) | 3B | no disponible | VLA generalista | NVIDIA Open Model License | HuggingFace (modelo base) |
| v1 `wjwjwjwj/gr00t-n1.7-robotwin-move_can_pot-cosmos-aug` | 3B | no disponible | move_can_pot (RoboTwin 2.0) | NVIDIA Open Model License | HuggingFace |
| Baseline sin aumento (50 demos limpias) | 3B | no disponible | move_can_pot (RoboTwin 2.0) | NVIDIA Open Model License | HuggingFace (repo v1) |

No se dispone de información sobre otros modelos VLA comparables (p. ej. OpenVLA, π0) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo ha sido evaluado en la tarea `move_can_pot` de RoboTwin 2.0; no se garantiza su comportamiento en otras tareas o entornos reales.
- Las mejoras frente a la variante v1 están dentro del ruido estadístico (p=0.35 en Easy, p=0.85 en Hard); no debe interpretarse como una mejora significativa.
- Evaluación exclusivamente en simulación (RoboTwin 2.0); no hay validación en robot físico ni datos de sim-to-real real.
- Riesgo de sobreajuste al simulador y a las condiciones de las 50 demostraciones limpias originales.
- No se documentan sesgos, cobertura idiomática ni comportamiento fuera de distribución.
- Licencia NVIDIA Open Model License: revisar sus términos antes de cualquier uso comercial; es una licencia "other" con restricciones.
- Los datos de entrenamiento incluyen vídeos sintéticos generados con Cosmos3-Nano-Sim-Transfer (OpenMDW 1.1) y RoboTwin 2.0 (MIT); verificar compatibilidad de licencias en usos derivados.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria independiente.
- El backbone Cosmos-Reason2-2B está congelado, por lo que las capacidades lingüísticas y visuales no se han adaptado al dominio robótico durante el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-move_can_pot-simcosmos-aug
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint v1: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-move_can_pot-cosmos-aug
- Dataset de entrenamiento: https://huggingface.co/datasets/wjwjwjwj/robotwin-move_can_pot-clean50-simcosmos68-gr00t
- Código y registro de experimentos: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
