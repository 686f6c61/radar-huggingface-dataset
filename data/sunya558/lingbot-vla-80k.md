# SuNya558/lingbot-vla-80k

## Resumen

LingBot-VLA 2.0 dual-arm 80k es un modelo de visión-lenguaje-acción (VLA) para robótica de doble brazo, publicado por el usuario SuNya558 en Hugging Face. Se trata de un ajuste fino completo (full fine-tuning, incluido el codificador visual) del modelo base `lerobot/lingbot_vla_v2_base`, que a su vez deriva de `robbyant/lingbot-vla-v2-6b`. El resultado es una política de control que, a partir de tres cámaras RGB y un estado de 14 dimensiones, predice acciones absolutas del siguiente fotograma para dos brazos con pinzas.

El modelo tiene 6.375.907.511 parámetros (aproximadamente 6,4 mil millones) y se distribuye en formato safetensors con pesos BF16, en un repositorio de 12,8 GB. Está entrenado sobre 50 tareas con demostraciones limpias (2.500 episodios de origen, 549.787 fotogramas) y ha completado 80.000 micro-pasos de entrenamiento (5.000 actualizaciones de parámetros). Su relevancia radica en que es un ejemplo de ajuste fino a gran escala de un VLA de doble brazo con evaluación formal de 1.000 episodios, algo poco habitual en modelos de robótica publicados en abierto.

La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. No es un modelo de propósito general: requiere un runtime específico (una revisión fijada de LeRobot de Xbotics) y no funciona con `AutoModel` de Transformers. Está pensado para investigadores y desarrolladores que trabajan en manipulación bimanual con simulación o hardware compatible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en transformer multimodal; política personalizada `lingbot_vla_v2` sobre LeRobot |
| Parámetros totales | 6.375.907.511 |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos BF16; no se realizó cuantización en la exportación) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un codificador visual con un backbone de lenguaje (procesamiento tipo Qwen, según la model card) y una cabeza de política que emite acciones. La política es personalizada (`lingbot_vla_v2`) y no se carga con `AutoModel` genérico. La entrada consiste en tres cámaras RGB nativas a 320×240 y 50 fps (`cam_high`, `cam_left_wrist`, `cam_right_wrist`), un estado de 14 dimensiones (seis articulaciones del brazo izquierdo, pinza izquierda, seis articulaciones del brazo derecho, pinza derecha) y una instrucción de tarea. La salida es una acción absoluta del siguiente fotograma, también de 14 dimensiones, mapeada desde una representación interna de 55 ranuras mediante los procesadores guardados. Genera 50 acciones por bloque con 10 pasos de eliminación de ruido (denoising).

El entrenamiento consistió en un ajuste fino completo con dos rangos, batch 8 y acumulación 16 (batch efectivo 256), en BF16 nativo para el modelo y FP32 para los pesos maestros del optimizador. Se usó Muon para las matrices y AdamW para el resto de parámetros, con tasa de aprendizaje 1e-4 con decaimiento coseno hasta 5e-5 a lo largo de 80.000 micro-pasos y sin warmup. Los datos son 50 tareas con demostraciones limpias: 2.500 episodios de origen y 549.787 fotogramas, de los cuales 2.400 episodios se usaron para entrenamiento y 100 quedaron reservados (los dos últimos episodios de cada tarea). Se aplicaron las pérdidas auxiliares originales y normalización por cuantiles (QUANTILES). Se guardaron cuatro checkpoints (20k, 40k, 60k, 80k); esta release solo incluye el de 80k. No se incluyen estados del optimizador, datasets ni pesos del profesor de destilación.

## Capacidades

- Control robótico bimanual: genera acciones de 14 dimensiones (articulaciones y pinzas de ambos brazos) a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa tres flujos RGB simultáneos (cámara alta y dos cámaras de muñeca) a 320×240 y 50 fps.
- Condicionamiento por instrucción en lenguaje natural: acepta una clave `task` con la instrucción; el entrenamiento incluyó instrucciones no vistas en la evaluación.
- Generación de secuencias de acción: produce bloques de 50 acciones con 10 pasos de denoising por bloque.
- Ejecución episódica con reinicio de estado: la política expone `reset()` para inicializar cada episodio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de lenguaje general; el modelo está especializado en control.
- Capacidades multilingües: instrucciones en inglés y chino.
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Manipulación bimanual en simulación: el modelo se integra en el simulador original con las mismas unidades de estado y acción, lo que permite reproducir la evaluación de 1.000 episodios y comparar configuraciones. Es adecuado porque conserva las condiciones nativas de éxito y los límites por tarea.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar ajuste fino completo de VLAs de 6B con Muon/AdamW y decaimiento coseno, ya que se publican curvas de entrenamiento y registros.
- Evaluación de robustez ante aleatorización: la partición entre ajustes `clean` y `randomized` (66,2 % y 35,2 % de éxito) permite analizar la brecha de generalización y diseñar experimentos de dominio.
- Tareas de pick-and-place con dos brazos: con 50 tareas entrenadas y 50 acciones por bloque, es adecuado para secuencias de agarre y colocación que requieren coordinación entre pinzas.
- Prototipado de políticas para hardware de doble brazo: los procesadores guardados mapean las claves de observación a las tres cámaras canónicas y las 14 acciones desde la representación interna de 55 ranuras, lo que facilita la integración en un pipeline LeRobot.
- Docencia y reproducción de experimentos: el repositorio incluye informes, CSV por tarea, registros de episodios e índice SHA-256, lo que permite auditar la evaluación y reutilizarla como material de referencia.
- Análisis de precisión numérica: existe un diagnóstico FP32 separado (incompleto: 31/40 referencias procesadas, 26 coincidentes, 5 no coincidentes, 9 pendientes; FP32 12/26 frente a BF16 13/26) que puede servir para estudiar el impacto de la precisión, aunque no establece una ventaja general.

## Benchmarks y rendimiento

Evaluación final de 1.000 episodios (10 por celda tarea-ajuste, 50 tareas), completada el 2026-10-26:

| Ajuste | Éxitos / episodios | Tasa de éxito |
|---|---:|---:|
| clean | 331 / 500 | 66,2 % |
| randomized | 176 / 500 | 35,2 % |
| agrupado | 507 / 1.000 | 50,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación conserva el filtrado nativo de resolubilidad por experto, la reconstrucción con la misma semilla, instrucciones no vistas, límites y condiciones de éxito nativos por tarea y bloques de 50 acciones. Se usó CuRobo con `use_cuda_kernel=False` por compatibilidad. El filtrado por experto y la no determinación del simulador limitan la comparación estricta con resultados de la comunidad configurados de forma distinta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 6,4B parámetros en BF16, los pesos ocupan aproximadamente 12,8 GB; el pico real depende del codificador visual, las tres cámaras y los búferes de la política.
- GPU recomendadas: no especificadas en la información. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100) es el rango razonable para BF16; no confirmado por el autor.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 24 GB en BF16 según el tamaño de pesos, pero no hay confirmación oficial ni pruebas de latencia.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI de forma genérica. Requiere la revisión fijada de LeRobot de Xbotics (`2e41022f5f8c2274f5ce99f00e9f5fe0d493182b`) con el extra `[lingbot_vla_v2,av-dep]`, Python 3.12, PyTorch 2.11.0+cu128, Transformers 5.5.4, tokenizers 0.22.2 y safetensors 0.8.0.
- Latencia y throughput: no disponibles. La evaluación se ejecutó en BF16 con batch 1, pero no se publican tiempos por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de éxito publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VLA 2.0 dual-arm 80k (este) | 6,4B | no disponible | 50,7 % agrupado (1.000 episodios) | Apache 2.0 | Hugging Face, runtime LeRobot fijado |
| lerobot/lingbot_vla_v2_base | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| robbyant/lingbot-vla-v2-6b | ~6B (según nombre) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables de los modelos base en la información proporcionada; la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en control robótico; no es un modelo de lenguaje general y no debe evaluarse con benchmarks de texto.
- La evaluación es de 10 episodios por celda, no de 100; la precisión de las tasas de éxito es limitada.
- El conjunto de retención (100 episodios) no es estadísticamente independiente de la normalización, porque las estadísticas se calcularon con todos los fotogramas limpios de origen.
- El filtrado por experto y la no determinación del simulador impiden comparaciones estrictas con resultados de la comunidad con otra configuración.
- El diagnóstico FP32 está incompleto (9 referencias pendientes) y no demuestra una ventaja general de precisión.
- Requiere un runtime específico y versiones fijadas de PyTorch, Transformers, tokenizers y safetensors; no funciona con `AutoModel` genérico ni con servidores de inferencia estándar.
- Solo se publica el checkpoint de 80k; los de 20k, 40k y 60k no están en esta release.
- No se incluyen estados del optimizador, datasets ni pesos del profesor, lo que limita la reproducibilidad completa del entrenamiento.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; en robótica, los fallos se manifiestan como acciones incorrectas o agarres fallidos.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del runtime de Xbotics y de las versiones fijadas debe verificarse antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SuNya558/lingbot-vla-80k
- Modelo base: https://huggingface.co/lerobot/lingbot_vla_v2_base
- Modelo upstream: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Runtime LeRobot de Xbotics: https://github.com/Xbotics-Embodied-AI-club/lerobot
- Revisión fijada del runtime: `2e41022f5f8c2274f5ce99f00e9f5fe0d493182b`
- Informe de evaluación final: `reports/final_evaluation_1000.md` (dentro del repositorio)
- JSON de evaluación: `evaluation_snapshot.json` (dentro del repositorio)
- CSV por tarea: `reports/final_per_task_1000.csv` (dentro del repositorio)
- Registros de episodios: `reports/final_episodes_1000.jsonl` (dentro del repositorio)
- Índice SHA-256: `reports/final_evidence_index_1000.json` (dentro del repositorio)
- Informe histórico: `reports/model_002_080000_experiment_report.pdf` (dentro del repositorio)
- Curvas de entrenamiento: `reports/training_curves.png` (dentro del repositorio)
- Registros de entrenamiento: `logs/model_002_080000_training_logs.zip` (dentro del repositorio)
