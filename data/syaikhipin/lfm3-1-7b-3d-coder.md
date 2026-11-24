# syaikhipin/LFM3-1.7B-3D-Coder

## Resumen

LFM3-1.7B-3D-Coder es un ajuste fino completo (full fine-tune) del modelo base LiquidAI/LFM3-1.7B-Base, desarrollado por el usuario independiente syaikhipin. El modelo está especializado en una tarea muy concreta: la generación one-shot de escenas Three.js, replicando el mismo experimento que ccore/Qwen3.5-4B-3D-Coder pero sobre una arquitectura híbrida (gated-conv + sliding-window + global attention). Forma parte de un portafolio de comparación de arquitecturas que entrena la misma tarea sobre LFM3, OLMoE y RWKV para medir el coste y beneficio de cada elección arquitectónica en una tarea estrecha de generación de código sobre una única GPU.

El modelo tiene 1.728.801.536 parámetros y se distribuye en safetensors (bf16) y en dos cuantizaciones GGUF (Q8_0 y Q4_K_M). No es un modelo de propósito general: se entrenó exclusivamente sobre el dataset ccore/ThreeJS-3D-Scenes (3.933 ejemplos de entrenamiento, 213 de validación) y solo en inglés.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de estudio honesto sobre los límites del SFT en tareas de código con ventanas de contexto largas. Por otro, el propio autor publica métricas que muestran que el ajuste empeoró varios indicadores respecto al modelo base (completitud HTML de 0,67 a 0,27 y validez sintáctica JS de 0,27 a 0,05), lo que convierte al modelo en un ejemplo útil de fracaso técnico documentado más que en una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: gated-conv + sliding-window attention + global attention (LFM3) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la receta de entrenamiento usó max_len 24.576 tokens) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 de LiquidAI, que combina capas de convolución con compuerta (gated-conv), atención de ventana deslizante y atención global. Esta mezcla busca reducir el coste computacional de la atención completa manteniendo capacidad de modelado de contexto largo. El autor la describe explícitamente como "hybrid (gated-conv + sliding-window + global attention)". El modelo requiere código personalizado (`trust_remote_code=True`) y transformers ≥ 5.23.

El entrenamiento consistió en un full fine-tune de 2 épocas (492 pasos), learning rate 1e-5 con scheduler coseno y 15 pasos de warmup, batch efectivo de 16, precisión bf16 y gradient checkpointing, sin packing. Se usó el dataset ccore/ThreeJS-3D-Scenes (MIT), con 3.933 ejemplos de entrenamiento y 213 de validación. Los "thinking traces" se descartaron porque, incluidos, las secuencias tenían una mediana de ~25.800 tokens y la receta original de 8.192 tokens habría descartado casi todo; con objetivos solo HTML y max_len 24.576 se conservaron 3.929 de 3.933 ejemplos. El entrenamiento se ejecutó en una RTX PRO 6000 Blackwell (96 GB) durante ~3,1 horas, con seguimiento en Weights & Biases (proyecto `fde-3dcoder-portfolio`, run `lfm3-1.7b-3dcoder-sft`). La pérdida final de entrenamiento fue de 0,56.

## Capacidades

- Generación one-shot de escenas Three.js: produce documentos HTML con import fijado de Three.js 0.160.0 y controles implementados inline.
- Generación de código JavaScript embebido en HTML, orientado a gráficos 3D.
- Formato de salida aprendido: preámbulo en prosa seguido de un bloque ` ```html `, replicando la distribución de las respuestas de referencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado rápido de escenas Three.js: el modelo puede generar un esqueleto de documento HTML con una escena 3D básica, útil como punto de partida que un desarrollador revisa y corrige manualmente. Es adecuado para exploración, no para entrega directa.
- Estudio de comparación de arquitecturas: sirve como punto de medida en el portafolio del autor (LFM3 vs OLMoE vs RWKV) para evaluar qué arquitectura rinde mejor en una tarea estrecha de generación de código con el mismo dataset y verificador.
- Investigación sobre fallos de SFT en código: sus generaciones y puntuaciones publicadas en `eval/` permiten estudiar modos de fallo concretos (bucles de repetición, redeclaración de variables en el mismo ámbito) y diseñar recompensas para una fase posterior de RL (GRPO).
- Docencia y divulgación: ejemplo realista de por qué una pérdida de entrenamiento baja (0,56) no garantiza calidad en generación, y de cómo un verificador programático revela problemas que las métricas de pérdida ocultan.
- Generación de datos sintéticos de escenas 3D para aumentar un corpus: las salidas válidas (16/60 con HTML completo) pueden filtrarse y usarse como semilla, aunque el ratio de descarte es alto.
- Pruebas de pipelines de verificación de código: el modelo produce suficientes salidas malformadas como para validar herramientas de linting, `node --check` y detección de duplicados en un entorno controlado.

## Benchmarks y rendimiento

Verificador programático sobre 60 prompts de validación estratificados (6 por nivel de complejidad 1–10, semilla 42), generación con temperatura 0,6, top-p 0,95, top-k 20 y máximo 16.384 tokens nuevos. Tres comprobaciones por salida: documento HTML completo, import de Three.js fijado y script extraído que pasa `node --check`.

| Modelo | HTML completo | Import fijado | Sintaxis JS válida |
|---|---:|---:|---:|
| Gold (respuestas de referencia) | 1,00 (60/60) | 0,98 (59/60) | 0,98 (59/60) |
| LFM3-1.7B-Base (zero-shot) | 0,67 (40/60) | 0,12 (7/60) | 0,27 (16/60) |
| LFM3-1.7B-3D-Coder (este modelo) | 0,27 (16/60) | 0,27 (16/60) | 0,05 (3/60) |

Con decodificación greedy (temperatura 0, misma muestra de 60 prompts) el resultado empeora: 0 de 60 salidas contienen un `</html>` completo, con mediana de 54.134 caracteres y agotamiento del presupuesto de 16.384 tokens en todos los casos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB en bf16 para los pesos (1,73 mil millones de parámetros); ~1,85 GB con GGUF Q8_0 y ~1,10 GB con GGUF Q4_K_M, más overhead de contexto y activaciones.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; el entrenamiento se realizó en una RTX PRO 6000 Blackwell (96 GB), pero la inferencia es mucho más ligera.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes; también en GPUs con 8 GB usando Q4_K_M.
- Opciones de despliegue: transformers (≥ 5.23, con `trust_remote_code=True`), llama.cpp (`llama-cli` verificado por el autor con los GGUF), y presumiblemente cualquier runtime compatible con GGUF; vLLM, TGI u Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| LFM3-1.7B-3D-Coder | 1,73 B | no disponible | Three.js one-shot | lfm1.0 | Hugging Face (safetensors + GGUF) |
| ccore/Qwen3.5-4B-3D-Coder | ~4 B | no disponible | Three.js one-shot | no disponible | Hugging Face |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | no disponible | Propósito general | lfm1.0 | Hugging Face |

El modelo de referencia directo es ccore/Qwen3.5-4B-3D-Coder, cuya tarea replica sobre una arquitectura distinta. El autor no publica una comparación numérica directa entre ambos en la información disponible; solo se comparan base frente a SFT dentro de la misma familia LFM3. Las alternativas OLMoE y RWKV forman parte del mismo portafolio de comparación, pero sus resultados no se incluyen en esta ficha.

## Limitaciones y advertencias

- Bucles de repetición: 44 de 60 salidas no terminan; la mediana es de 50.363 caracteres y los finales muestran fragmentos repetidos (`yarnRimOuterRimRimRim…`) que consumen el presupuesto de 16.384 tokens.
- Redeclaración de variables en el mismo ámbito: 13 de las 16 salidas completas fallan `node --check`, y 11 de ellas con el mismo error `Identifier 'X' has already been declared` (`camera`, `burnerRing`, `pivotCenter`, `notchGeometry`, etc.). Es el patrón de bug del modelo de referencia, amplificado.
- La decodificación greedy no corrige el problema: 0 de 60 salidas terminan correctamente.
- El ajuste empeoró la completitud HTML (0,67 → 0,27) y la validez sintáctica (0,27 → 0,05) respecto al modelo base, aunque mejoró el cumplimiento de formato (import fijado 0,12 → 0,27).
- Entrenado solo sobre la distribución de 4.146 escenas Three.js; los prompts fuera de dominio degradan.
- Solo inglés.
- Licencia lfm1.0 (no comercial en los términos que imponga LiquidAI; consultar el archivo LICENSE del repositorio antes de cualquier uso comercial).
- Requiere `trust_remote_code=True` y transformers ≥ 5.23; el código personalizado debe auditarse antes de ejecutarlo en producción.
- No usar como generador de código en producción sin verificación programática obligatoria (linting, `node --check`, ejecución en navegador headless).
- Riesgo de alucinación: alto en APIs de Three.js fuera del subconjunto cubierto por el dataset.
- Los propios autores del modelo advierten que la siguiente fase justificada es un entrenamiento GRPO con el verificador como recompensa, penalizando específicamente la redeclaración; es decir, el modelo actual es un paso intermedio, no un producto final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syaikhipin/LFM3-1.7B-3D-Coder
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo de referencia: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Dataset: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- CDN de Three.js usado en las salidas: https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js
- Weights & Biases (proyecto `fde-3dcoder-portfolio`, run `lfm3-1.7b-3dcoder-sft`): no disponible como URL directa en la información proporcionada.
