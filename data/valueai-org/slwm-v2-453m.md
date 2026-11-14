# valueai-org/SLWM-v2-453M

## Resumen

SLWM-v2-453M es un checkpoint de investigación de un modelo de mundo (world model) multimodal orientado a control encarnado (embodied control), desarrollado por Diogo Antunes en el marco de los proyectos valuealigned.ai y keplen.ai y publicado bajo la organización valueai-org. No es un modelo de lenguaje conversacional ni un `AutoModel` de Transformers: se trata de un artefacto de estudio que acompaña a un manuscrito no publicado (borrador v0.3) y que se comparte para inspección y reproducibilidad, no como una release formal.

El modelo emplea una arquitectura recurrente de estado latente con 453.199.938 parámetros estrictos, 18 capas, anchura latente de 1152 y 24 slots por tick, entrenada sobre secuencias de 32 ticks con lotes de 12. Su propósito es el refinamiento de una rejilla espacial para planificación visual sin información privilegiada, conmutación de objetivos perturbados fuera de ventana y detección de fallos de cámara zero-shot, dentro de la ola experimental 7 del archivo de investigación SLWM.

Es relevante ahora porque ejemplifica una línea de trabajo poco común: modelos de mundo pequeños y eficientes implementados en JAX con pesos en formato NPZ propio (BF16/FP32 mixto e INT8 simétrico por canal), pensados para robótica y agentes con memoria de trabajo acotada, y porque publica métricas de fallo junto a las de éxito, algo poco habitual en releases de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente de estado latente con rejilla espacial (world model multimodal, runtime JAX propio) |
| Parametros totales | 453.199.938 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Secuencia de entrenamiento de 32 ticks; memoria asociativa evaluada hasta T = 1.024 |
| Tipos de cuantizacion | BF16/FP32 mixto (matrices en BF16 como uint16) e INT8 simétrico por canal |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | NPZ (NumPy), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un world model recurrente con estado latente de anchura 1152, 18 capas y 24 slots por tick. La ola 7 incorpora propriocepción del efector final, un readout visual espacial y una rejilla de peligro aprendida en lugar de coordenadas de pared privilegiadas, con funciones de rejilla 8 × 8 en `models/x1b_wave7_core.py`. El pase recurrente vive en `models/x1b_wave6_core.py`. La implementación de referencia está fijada al commit `cbb2b38` del repositorio ValueAlignedAI/slwm.

El entrenamiento se realizó con la semilla 2001 durante 2.200 pasos, con lotes de 12 secuencias de 32 ticks, en la ejecución `x1b-w7_slwm_450m_full-s2001`. La semilla se incluye como referencia fija y no fue seleccionada por ranking de resultados de test; el manuscrito reporta cohortes de tres semillas, pero este repositorio contiene un único checkpoint. No se especifican en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Planificación visual sin información privilegiada: refinamiento sobre rejilla espacial para generar subobjetivos en entornos no vistos.
- Conmutación de objetivos perturbados fuera de ventana: recuperación de metas tras cambios dinámicos (87,5 % de éxito a T = 160 en la semilla 2001).
- Detección zero-shot de fallos de cámara: clasificación de corrupción visual con AUROC de 99,9057 % en escenas no vistas.
- Control encarnado con propriocepción del efector final (brazo xArm6 en evaluación).
- Memoria de trabajo acotada: recuerdo asociativo visual dinámico, con rendimiento débil a alta cardinalidad (6,25 % a T = 1.024).
- Planificación con MPPI sobre subobjetivos en layouts no vistos (51,5625 % de éxito).
- Multimodalidad visual y de estado, con máscaras de modalidad gestionadas por el runtime.
- No soporta tool calling, function calling ni razonamiento multi-step en el sentido de un LLM; no es un modelo de chat.

## Casos de uso

- Investigación en world models: reproducir los experimentos de la ola 7 cargando el checkpoint con el runtime JAX fijado y comparando métricas contra `eval_metrics.json`, incluyendo los casos de fallo.
- Planificación robótica en entornos no vistos: usar el readout espacial y la rejilla de peligro para generar subobjetivos seguros en layouts que no aparecieron en entrenamiento, con MPPI como planificador.
- Detección de anomalías de sensor: integrar el módulo de corrupción de cámara como monitor de integridad visual en pipelines de robótica, dado su AUROC cercano a 1 en escenas no vistas.
- Control de brazo manipulador: emplear la propriocepción del efector final para tareas de seguimiento con error de cuatro pasos de ~31,5 mm en escenas reservadas.
- Estudio de memoria de trabajo en agentes: analizar la degradación del recuerdo asociativo con la cardinalidad y la longitud de secuencia para diseñar mecanismos de latch explícito.
- Reproducibilidad y auditoría de artefactos: verificar hashes SHA-256, contar parámetros estrictos y validar exportaciones BF16 e INT8 con el loader incluido, como parte de revisiones de publicaciones.
- Base para ablaciones arquitectónicas: modificar el readout espacial o la rejilla de peligro en el código fuente fijado y reentrenar con la misma configuración para comparar dentro de la misma ola.

## Benchmarks y rendimiento

Resultados registrados en `receipt.json` para la semilla 2001 (resultados de una sola semilla, no la media ± desviación del manuscrito):

| Metrica | Seed 2001 |
|---|---:|
| Éxito en conmutación de objetivo perturbado a T = 160 | 87,5000 % |
| Éxito MPPI de subobjetivo en layout no visto | 51,5625 % |
| Éxito reactivo con latch explícito emparejado | 31,2500 % |
| Recuerdo asociativo visual dinámico a T = 1.024 | 6,2500 % |
| AUROC de corrupción de cámara no vista | 99,9057 % |
| Error a cuatro pasos en xArm6 en escena reservada | 31,4589 mm |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no procede compararlos con modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo INT8 ocupa 415 MB en disco, pero el loader incluido expande los pesos a float32; el requisito de memoria en tiempo de ejecución es mayor que el tamaño del archivo y no está cuantificado en la información disponible. El archivo BF16 ocupa 720 MB.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime es JAX, por lo que se requiere una GPU compatible con JAX (CUDA o ROCm) o ejecución en CPU.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, pero no se especifican modelos concretos ni requisitos de memoria de activaciones y buffers de planificación.
- Opciones de despliegue: JAX con el código fuente fijado al commit `cbb2b38`; no es compatible con vLLM, llama.cpp, Ollama ni TGI. El loader `load_checkpoint.py` es NumPy puro y sin pickle.
- Latencia y throughput: no disponibles. El loader no realiza cómputo matricial INT8, por lo que el rendimiento INT8 real depende de la implementación JAX.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models recurrentes con rejilla espacial para control encarnado) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Es un artefacto de estudio de un manuscrito no publicado; no debe tratarse como una release estable ni como modelo de producción.
- No es un modelo de chat ni un `AutoModel` de Transformers; no soporta tool calling ni generación de texto libre.
- El recuerdo asociativo de alta cardinalidad es débil (6,25 % a T = 1.024); un buen rendimiento en recuperación de objetivos no implica memoria asociativa fiable.
- Los cambios extremos de dinámica siguen siendo un caso de fallo documentado.
- Resultados de una sola semilla; el manuscrito reporta cohortes de tres semillas, por lo que las cifras no deben interpretarse como medias poblacionales.
- El loader expande a float32 y no ejecuta INT8; el tamaño del archivo INT8 no equivale al requisito de memoria en ejecución.
- Licencia MIT, permisiva para uso comercial, pero sin garantías y con la advertencia de que el trabajo subyacente no está publicado ni revisado por pares.
- Solo inglés en la metadata; no hay soporte multilingüe declarado.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de planificaciones erróneas en layouts fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/valueai-org/SLWM-v2-453M
- Código fuente fijado: https://github.com/ValueAlignedAI/slwm/tree/cbb2b38794359adfefe07b19e9b7caa113b25b47
- valuealigned.ai: https://valuealigned.ai
- keplen.ai: https://keplen.ai
