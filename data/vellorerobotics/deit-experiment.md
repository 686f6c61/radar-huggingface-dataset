# Vellorerobotics/deit-experiment

## Resumen

Vellorerobotics/deit-experiment es un prototipo de investigación publicado en HuggingFace por el usuario Vellorerobotics. Implementa una variante de DeiT (Data-efficient Image Transformer) orientada a clasificación de imágenes, etiquetada como scale small, con atención flash, fusión bilinear, activación ReLU y normalización GroupNorm. El repositorio incluye código Python (`eval.py`), `config.json`, `training_args.json` y un checkpoint de inicialización en safetensors.

El dato de parámetros declarado para safetensors es de 49.600, una cifra llamativamente baja para un DeiT-small y que conviene verificar antes de cualquier uso. El modelo no ha sido entrenado ni auditado: la model card indica explícitamente que no se reclama ningún resultado de benchmark y que el checkpoint sirve para smoke tests, no como modelo final.

Su relevancia es, por tanto, experimental: no compite con modelos de producción y su interés está en servir como esqueleto reproducible para pruebas de carga, fine-tuning y comparación de recetas. La licencia MIT facilita ese uso, pero la ausencia de métricas y de entrenamiento limita cualquier evaluación seria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeiT (variante custom; atención flash, fusión bilinear, activación ReLU, normalización GroupNorm) |
| Parámetros totales | 49.600 (cuarenta y nueve mil seiscientos), según recuento de safetensors; verificar escala |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión para clasificación; sin ventana de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible / no aplica (modelo de visión, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`); código PyTorch (`eval.py`) |
| Pipeline declarado | no disponible |
| Estado del checkpoint | inicialización; no entrenado ni presentado como checkpoint de benchmark |

## Arquitectura y entrenamiento

DeiT es una familia de transformers de visión que adapta el esquema de ViT a clasificación de imágenes con un token de destilación. En este repositorio, el autor declara una implementación propia de escala small, con atención flash, fusión bilinear, activación ReLU y GroupNorm. Esos detalles se apartan de la configuración canónica de DeiT (GELU y LayerNorm), lo que refuerza el carácter experimental del artefacto.

El entrenamiento no está documentado: no se indican tokens, dataset, resolución de entrada, número de épocas ni si hubo RLHF/DPO. `training_args.json` recoge una receta por defecto con optimizador Adam y scheduler coseno, pero la propia model card aclara que son valores de partida y no evidencia de una ejecución completada. El checkpoint `model.safetensors` es de inicialización y no se presenta como entrenado.

## Capacidades

- Clasificación de imágenes: la arquitectura está orientada a producir logits de clase a partir de una imagen, pero el checkpoint incluido no está entrenado y no hay precisión verificada.
- No se documenta generación de texto, razonamiento, código, matemáticas, audio ni vídeo.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües: el modelo no procesa texto.
- Requiere un adaptador explícito para cargarse con APIs genéricas, según la model card.
- Entrada visual sujeta a la implementación custom de `eval.py`; no se especifican resolución, normalización de píxeles ni formato de etiquetas.
- Modo thinking: no disponible.

## Casos de uso

- Smoke test de integración: comprobar que `model.safetensors` carga, que `eval.py` arranca y que el pipeline de tensores y formas funciona antes de entrenar.
- Base para fine-tuning: partir de la inicialización y entrenar con un dataset etiquetado de dominio específico, por ejemplo defectos industriales, usando Adam con scheduler coseno como punto de partida.
- Comparación de variantes arquitectónicas: usar el código para medir el efecto de flash attention, fusión bilinear, ReLU y GroupNorm frente a GELU y LayerNorm bajo el mismo split.
- CI/CD de artefactos: incluir `eval.py --help` y una carga de safetensors en pruebas automáticas para detectar roturas de compatibilidad.
- Docencia y reproducción: estudiar la estructura de un DeiT custom y el formato de `config.json` y `training_args.json` sin depender de pesos preentrenados.
- Evaluación de adaptadores: probar el adaptador necesario para APIs de carga automática y documentar el contrato de entrada y salida.
- Benchmarking interno de recetas: comparar Adam con coseno frente a otras recetas bajo el mismo presupuesto y semillas, tal como recomienda la model card.
- Auditoría post-entrenamiento: una vez entrenado, evaluar robustez, fairness y transferencia de dominio con un split etiquetado y al menos tres semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint es de inicialización.

## Requisitos de hardware

- VRAM estimada: con 49.600 parámetros declarados, los pesos ocupan aproximadamente 0,2 MB en FP32 (49.600 × 4 bytes); el consumo real vendrá dominado por activaciones, overhead de PyTorch y resolución de imagen.
- GPU recomendadas: no se requieren A100 ni H100; cualquier GPU consumer con soporte CUDA es suficiente para smoke tests. Para entrenamiento real, la elección depende del dataset y la resolución, no del checkpoint de inicialización.
- Consumer GPU: sí, cabe en GPUs de gama baja como GTX 1650 o RTX 3050/3060, y probablemente en CPU
