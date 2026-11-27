# StrivingBapan/lm-eels-qwen3.8-27b-mars-lora

## Resumen

LM-EELS Qwen3.8-27B Mars LoRA es un adaptador LoRA (PEFT) sobre el modelo multimodal Qwen/Qwen3.8-27B, desarrollado por Sai Vemu (StrivingBapan) para control de manipulación robótica en el simulador MuJoCo `mars-yard-mujoco`. El adaptador convierte un VLM conversacional en un policy de visión-lenguaje-acción (VLA) que, a partir de una ventana deslizante de dos fotogramas de cámara de muñeca (384×288) y telemetría de pose del efector final, emite acciones SE(3) en formato JSON de una sola línea.

El modelo resuelve una tarea concreta: recoger un tubo de ensayo del suelo y colocarlo vertical dentro del soporte, operando en bucle cerrado con un controlador de cinemática inversa diferencial restringido de LM-EELS. La arquitectura base no se modifica: no se añade cabeza de acción continua, sino que las acciones se emiten como tokens de texto JSON ejecutados por el controlador aguas abajo.

Es relevante como ejemplo de reutilización de un VLM grande (27B) mediante LoRA de rango 32 para tareas de robótica encarnada, con un contrato de inferencia bien definido y evaluación en simulación. El autor advierte explícitamente que el modelo es solo para simulación y no ha sido validado en hardware físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3_5ForConditionalGeneration) + adaptador LoRA |
| Parámetros totales | 27B (modelo base); adaptador LoRA: 249,5M entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos del adaptador en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un modelo de visión-lenguaje con arquitectura `Qwen3_5ForConditionalGeneration`. El LoRA usa rango r=32, alpha=64, dropout=0.0 y bias="none", con módulos objetivo `all-linear` (codificador visual, merger multimodal y capas de lenguaje), excluyendo `lm_head`. Los parámetros entrenables son 249,5M en bfloat16. No se añade ninguna cabeza de acción continua: la arquitectura de Qwen permanece intacta y las acciones se emiten como tokens de texto JSON restringidos.

El entrenamiento consistió en un ajuste supervisado (SFT v4) sobre demostraciones de espacio de tareas en bucle cerrado en el entorno `mars-yard-mujoco` (tarea `test_tube`, `--anchor goal`). Los datos provienen del dataset StrivingBapan/lm-eels-mars-test-tube-sim, con assets de simulación en StrivingBapan/lm-eels-mars-twin-assets. La inferencia usa `enable_thinking=False` y requiere `transformers==5.24.1`, `peft>=0.22.0` y `flash-linear-attention`. El contrato de observación incluye hasta dos imágenes RGB (ventana [anterior, actual], redimensionadas bilinealmente a 384×288) y telemetría textual con las últimas 5 turnos de (acción, medida, error), la pose medida actual en milímetros y rotación 6D, y el campo `commands_left_low` cuando quedan 12 comandos o menos. La salida es un objeto JSON sin delimitadores markdown con `move_mm` (norma ≤ 60 mm), `rotate_deg` (eje y |deg| ≤ 45), `gripper` en [0.0, 1.0] o null, y señal terminal `{"finish": true}`.

## Capacidades

- Control visomotor de manipulación robótica en bucle cerrado a partir de imágenes de cámara de muñeca y telemetría de pose.
- Emisión de acciones SE(3) estructuradas en JSON (`move_mm`, `rotate_deg`, `gripper`) compatibles con cinemática inversa diferencial restringida.
- Razonamiento multi-paso implícito: secuencia de agarre, elevación, alineación, inserción y retirada, con señal de finalización tras soltar el tubo y retirarse ≥ 3 cm.
- Procesamiento multimodal imagen-texto (hasta 2 fotogramas RGB por turno).
- Seguimiento de historial de interacción (últimos 5 turnos de acción/medida/error).
- Gestión de presupuesto de comandos mediante `commands_left_low`.
- Capacidades generales de texto, código y matemáticas heredadas del modelo base Qwen3.8-27B (no evaluadas en esta ficha).
- No dispone de capacidades de audio ni de acción continua nativa.

## Casos de uso

- Investigación en manipulación encarnada en simulación: usar el adaptador como policy de referencia en `mars-yard-mujoco` para experimentos de inserción de precisión con un brazo tipo serpiente, aprovechando el contrato JSON y el controlador IK de LM-EELS.
- Evaluación de VLA basados en VLM grandes: servir como baseline reproducible para comparar estrategias de representación de acciones (texto JSON frente a cabezas continuas) en tareas de pick-and-place.
- Generación de datos sintéticos de demostración: ejecutar el policy en bucle cerrado para producir trayectorias etiquetadas que alimenten posteriores entrenamientos por imitación o RL.
- Estudio de generalización de LoRA en robótica: analizar cómo un adaptador de 249,5M parámetros sobre un modelo de 27B adquiere una habilidad motora concreta sin modificar la arquitectura base.
- Pruebas de robustez ante ruido de percepción: variar resolución, ventana temporal o telemetría para medir la degradación del éxito de colocación en simulación.
- Docencia y prototipado de pipelines VLA: integrar el adaptador en un bucle de inferencia con `transformers` y `peft` para ilustrar el ciclo observación-decisión-acción en entornos MuJoCo.
- Validación de controladores IK: usar las acciones JSON emitidas como entrada para probar la robustez del controlador diferencial restringido de LM-EELS ante comandos límite (60 mm, 45 grados).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados):

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Colocación de tubo de ensayo en MuJoCo Mars Yard (bucle cerrado, single-shot) | Split de test bloqueado (seeds 0..9, N=10) | Tasa de éxito de colocación estable (reward == 1.0) | 30,0 % |
| Colocación de tubo de ensayo en MuJoCo Mars Yard (bucle cerrado, single-shot) | Split de test bloqueado (seeds 0..9, N=10) | Progreso medio de etapa (Tabla III) | 30,0 % |
| Colocación de tubo de ensayo en MuJoCo Mars Yard (bucle cerrado, single-shot) | Split de validación interno (seeds 50..79, N=30) | Tasa de éxito de colocación estable (reward == 1.0) | 33,33 % |
| Colocación de tubo de ensayo en MuJoCo Mars Yard (bucle cerrado, single-shot) | Split de validación interno (seeds 50..79, N=30) | Progreso medio de etapa (Tabla III) | 36,67 % |
| Colocación de tubo de ensayo en MuJoCo Mars Yard (fixed-start, seed 4, N=10) | Pose del ensayo 5 de inicio fijo (N=10) | Tasa de éxito de colocación estable (reward == 1.0) | 60,0 % |
| Colocación de tubo de ensayo en MuJoCo Mars Yard (fixed-start, seed 4, N=10) | Pose del ensayo 5 de inicio fijo (N=10) | Progreso medio de etapa (Tabla III) | 90,0 % |

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 3,0 GB en el repositorio, pero requiere cargar el modelo base Qwen3.8-27B en bfloat16 (aproximadamente 54 GB de pesos) más el adaptador.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para el modelo base en bfloat16. Para cuantización de 8 bits se necesitan al menos 2 GPU de 24-48 GB; para 4 bits, una GPU de 24 GB podría ser insuficiente por el codificador visual y el merger multimodal.
- Cabe en GPU de consumo: no de forma directa a 27B en bfloat16; con cuantización agresiva (4 bits) podría intentarse en RTX 4090 (24 GB), aunque no hay datos publicados de que el autor lo haya validado.
- Opciones de despliegue: `transformers==5.24.1` + `peft>=0.22.0` con `flash-linear-attention`; el pipeline es `image-text-to-text`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LM-EELS Qwen3.8-27B Mars LoRA | 27B base + 249,5M LoRA | no disponible | Manipulación robótica (simulación) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Visión-lenguaje general | Apache-2.0 | Hugging Face |
| Rebis-IvLabs/lm-eels | no disponible | no disponible | Framework de control robótico | Apache-2.0 | GitHub |
| Otros VLA de manipulación | no disponible | no disponible | Manipulación | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros VLA en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en simulación MuJoCo (`mars-yard-mujoco`); no validado en hardware físico ni en despliegue real.
- Especializado en una única tarea (`test_tube`, `--anchor goal`); no generaliza a otras tareas de manipulación sin reentrenamiento.
- Tasas de éxito bajas en los splits de test y validación (30 % y 33,33 %), lo que limita su uso como policy de producción incluso en simulación.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- Riesgo de alucinación en la emisión de JSON: puede generar acciones fuera de los límites (norma > 60 mm, |deg| > 45) o señales `finish` prematuras, aunque el controlador IK restringido mitiga parte del riesgo.
- Dependencia estricta de versiones (`transformers==5.24.1`, `peft>=0.22.0`, `flash-linear-attention`), lo que complica la reproducibilidad.
- Idiomas soportados no documentados; el prompt del sistema está en inglés.
- Sin datos publicados sobre sesgos, latencia o throughput.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de validación física desaconseja su uso en entornos reales sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/StrivingBapan/lm-eels-qwen3.8-27b-mars-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/StrivingBapan/lm-eels-mars-test-tube-sim
- Assets de simulación: https://huggingface.co/datasets/StrivingBapan/lm-eels-mars-twin-assets
- Código: https://github.com/Rebis-IvLabs/lm-eels
