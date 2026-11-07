# tmhoanggg/so101-stack-cup-v3-pi05

## Resumen

`tmhoanggg/so101-stack-cup-v3-pi05` es un conjunto de checkpoints de política robótica derivados de `lerobot/pi05_base` mediante ajuste fino supervisado sobre el dataset `tmhoanggg/so101-stack-cup-v3` (60 episodios a 30 fps). El modelo resuelve la tarea concreta de apilar vasos con el brazo robótico SO-101, dentro del ecosistema LeRobot, y no es un modelo de lenguaje general: es una política visuomotor que mapea observaciones (imágenes y estado del robot) a acciones de 50 pasos.

El repositorio contiene múltiples variantes experimentales organizadas en carpetas, comparando tres protocolos de entrenamiento: `official` (pi0.5 intacto con SigLIP congelado), `swap` (sustitución del codificador SigLIP por un codificador visual congelado propio) y `side branch` (pi0.5 congelado con una rama auxiliar de tipo ControlNet sobre el experto de acciones). Las variantes difieren en codificador visual (VIRGIL/ViT, R3M, VC1, SigLIP2, DINOv2), aumentación de imagen, tasa de aprendizaje y semilla.

La relevancia es doble: por un lado, documenta de forma reproducible experimentos de sustitución de encoders visuales en políticas VLA (vision-language-action); por otro, expone errores reales de implementación (el bug de normalización de entrada de VIRGIL) y sus correcciones posteriores, con métricas de error held-out en grados. El tamaño del repositorio (200,6 GB) se debe a la acumulación de todos los checkpoints, no a un único modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (base Gemma + experto de acciones; codificador visual SigLIP en la variante oficial) |
| Parámetros totales | 3,7B en las variantes `official` y `swap`; en `side branch` se entrena una copia del experto más inyectores (0,45B entrenables) sobre pi0.5 congelado |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La base es pi0.5, una política VLA que combina un backbone tipo Gemma con un experto de acciones dedicado. En el protocolo `official` se ajusta el modelo completo (Gemma y experto de acciones, 3,7B) manteniendo congelado el codificador SigLIP. En el protocolo `swap`, el SigLIP se reemplaza por un codificador visual congelado externo (`code/encoder_swap.py`) y se entrena el proyector, Gemma y el experto de acciones (3,7B). En el protocolo `side branch` se congela pi0.5 y se añade el codificador congelado mediante una copia del experto de acciones al estilo ControlNet (DynaFLIP, Apéndice D.4, `code/aux_inject.py`), entrenando solo proyector, copia del experto e inyectores (0,45B).

El entrenamiento se realizó sobre 60 episodios del dataset `so101-stack-cup-v3` (30 fps, formato LeRobot, parquet y vídeo), con configuraciones de 5k a 30k pasos y batch de 32 o 64. La métrica de evaluación es el error held-out en bucle abierto sobre 8 episodios v2 no vistos: error medio absoluto de acción sobre el chunk de 50 pasos y sobre la primera acción, en grados. Los mejores resultados se obtienen con `official_frozen` (9,53 / 2,56) y, dentro de los protocolos alternativos, con `virgil_fix_d` (10,98 / 2,65) y `aux_vc1` (11,05 / 3,33). Los codificadores R3M y VC1 en protocolo `swap` sin correcciones rinden peor (16,15 / 11,16 y 16,41 / 13,19 respectivamente).

## Capacidades

- Control visuomotor de un brazo SO-101 para la tarea de apilar vasos.
- Generación de chunks de acción de 50 pasos a partir de observaciones visuales y estado del robot.
- Tres protocolos de inferencia conmutables por variable de entorno: `official` (sin variable), `swap` (`PI05_ENCODER=<arm>`) y `side branch` (`PI05_AUX=<arm>`).
- Soporte de múltiples codificadores visuales congelados: VIRGIL/ViT, R3M, VC1, SigLIP2 y DINOv2.
- Compatibilidad con el pipeline de rollout de LeRobot (`code/lerobot_rollout_pi05.py`).
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política específica de tarea.

## Casos de uso

- Investigación en sustitución de encoders visuales: permite comparar SigLIP frente a VIRGIL, R3M, VC1, DINOv2 y SigLIP2 bajo un mismo protocolo y dataset, con métricas held-out en grados.
- Reproducción de experimentos VLA: las carpetas documentan pasos, batch, semilla y aumentación, lo que facilita replicar cada configuración con LeRobot.
- Manipulación robótica de precisión en laboratorio: el error de primera acción de 2,56 grados en `official_frozen` es adecuado para tareas de apilado controlado sobre SO-101.
- Estudio de arquitecturas auxiliares tipo ControlNet: la rama `side branch` (0,45B entrenables) permite evaluar inyección de features externas sin reentrenar el backbone.
- Docencia y auditoría de bugs: el caso del reinicio de buffers `pix_scale`/`pix_shift` de VIRGIL sirve como ejemplo documentado de discrepancia entre entrenamiento e inferencia.
- Base para transferencia a otras tareas de pick-and-place: los checkpoints `official_frozen` pueden servir de inicialización para nuevos datasets SO-101.
- Despliegue en entornos de simulación o banco de pruebas con LeRobot, usando el script de rollout incluido.

## Benchmarks y rendimiento

Error held-out en bucle abierto sobre 8 episodios v2 no vistos (media del error absoluto de acción en grados, chunk de 50 pasos / primera acción):

| Carpeta | Protocolo | Codificador | Pasos x batch | Chunk / primera |
|---|---|---|---|---|
| official_frozen | official | SigLIP | 30k x 64 | 9,53 / 2,56 |
| official_frozen_5k | official | SigLIP | 5k x 64 | 9,75 / 2,66 |
| official_frozen_t6 | official | SigLIP | 7k x 32 | 9,94 / 2,60 |
| virgil_vit | swap | virgil_vit | 30k x 64 | 15,32 / 8,61 |
| virgil_fix_a | swap | virgil_vit | 7k x 32 | 11,94 / 3,06 |
| virgil_fix_b | swap + aug | virgil_vit | 7k x 32 | 11,72 / 2,94 |
| virgil_fix_c | swap + aug, solo experto | virgil_vit | 7k x 32 | 11,67 / 3,18 |
| virgil_fix_d | swap + aug, lr 2,5e-5 | virgil_vit | 15k x 32 | 10,98 / 2,65 |
| r3m | swap | r3m | 30k x 64 | 16,15 / 11,16 |
| vc1 | swap | vc1 | 30k x 64 | 16,41 / 13,19 |
| aux_virgil_vit | side branch | virgil_vit | 7k x 32 | 11,42 / 3,63 |
| aux_virgil_vit_s2 | side branch, semilla 2000 | virgil_vit | 7k x 32 | 11,29 / 3,54 |
| aux_virgil_vit_aug | side branch + aug | virgil_vit | 7k x 32 | 11,17 / 3,61 |
| aux_r3m | side branch | r3m | 7k x 32 | 11,12 / 3,30 |
| aux_vc1 | side branch | vc1 | 7k x 32 | 11,05 / 3,33 |
| aux_siglip2 | side branch | siglip2 | 7k x 32 | 11,73 / 3,54 |
| aux_dinov2 | side branch | dinov2 | 7k x 32 | 11,30 / 3,64 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el backbone de 3,7B en precisión completa requiere del orden de 8-15 GB, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no se indica en la documentación.
- Opciones de despliegue: LeRobot (`code/lerobot_rollout_pi05.py`) con variables de entorno `PI05_ENCODER` o `PI05_AUX` según protocolo; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Nota operativa: para las variantes R3M hay que copiar `r3m_home/.r3m` a `~/.r3m`; el resto de pesos de encoders están dentro del checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tmhoanggg/so101-stack-cup-v3-pi05 (official_frozen) | 3,7B | no disponible | 9,53 / 2,56 grados (held-out) | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | no disponible (modelo base) | no disponible | Hugging Face |
| Variantes swap (virgil_fix_d, r3m, vc1) | 3,7B | no disponible | 10,98-16,41 grados (held-out) | no disponible | Hugging Face |
| Variantes side branch (aux_*) | 0,45B entrenables sobre pi0.5 congelado | no disponible | 11,05-11,73 grados (held-out) | no disponible | Hugging Face |

No se dispone de datos de benchmarks de terceros para comparar con otras políticas VLA de la misma categoría.

## Limitaciones y advertencias

- Modelo específico de tarea y robot: entrenado solo para apilar vasos con SO-101 sobre 60 episodios; no generaliza a otras tareas ni morfologías.
- Licencia no disponible: no se puede confirmar el uso comercial.
- El bug de normalización de entrada de VIRGIL (`pix_scale`/`pix_shift` reseteados a identidad) degrada el codificador en `virgil_vit`, `virgil_vit_5k` y `virgil_vit_15k`; usar las variantes `virgil_fix_*` o `aux_virgil_vit*`.
- Las variantes `swap` con R3M y VC1 sin correcciones presentan errores held-out muy altos (11,16 y 13,19 grados en primera acción).
- Dependencia de código externo: el codificador VIRGIL/R3M requiere `github.com/tmhoanggg/r3m` en el commit 7dfc725 o posterior, y LeRobot en el commit f5c9bc02.
- Evaluación limitada: solo 8 episodios held-out en bucle abierto; no hay resultados en bucle cerrado ni en entorno real reportados.
- Riesgo de sobreajuste a las condiciones del dataset (iluminación, posiciones de cámara, velocidad de 30 fps).
- Sin datos de sesgos, alucinación o rendimiento multilingüe aplicables, al no ser un modelo de lenguaje.
- Repositorio de 200,6 GB: requiere almacenamiento considerable y descarga selectiva por carpeta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmhoanggg/so101-stack-cup-v3-pi05
- Dataset: https://huggingface.co/datasets/tmhoanggg/so101-stack-cup-v3
- Visualizador del dataset: https://huggingface.co/datasets/tmhoanggg/so101-stack-cup/viewer
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Código del codificador VIRGIL/R3M: https://github.com/tmhoanggg/r3m
- LeRobot (commit de referencia f5c9bc02): https://github.com/huggingface/lerobot
