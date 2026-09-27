# tysgydke/gdn2-audit

# tysgydke/gdn2-audit

## Resumen

`tysgydke/gdn2-audit` es un archivo de auditoría de pesos (weight-audit archive) procedente de un proyecto de investigación en visión-lenguaje construido sobre `Qwen3.5-0.8B`. No es un modelo desplegable, sino un volcado de 84 ficheros de checkpoint en formato PyTorch (`.pt` y `.safetensors`) que suman aproximadamente 39,8 GB, junto a cuatro ficheros de texto (`.gitattributes`, `README.md`, `BENCHMARKS.md`, `results.jsonl`). El repositorio recoge múltiples familias de experimentos en distintos pasos intermedios de entrenamiento, incluidas configuraciones fallidas y conclusiones que el autor revirtió posteriormente.

El proyecto del que procede combina tres componentes sobre el backbone `Qwen3.5-0.8B`: una sustitución de capas internas por GDN2 (Gated DeltaNet-2, atención lineal con delta rule), una «pata» recurrente de profundidad K=2 y un módulo espacial. Existen modelos oficiales publicados por el mismo autor en repositorios separados (`Qwen3.5-0.8B-GDN2`, `-Spatial`, `-LoopSpatial`), de modo que este repositorio debe entenderse como material de trazabilidad experimental, no como un artefacto de release.

Su relevancia es fundamentalmente metodológica: documenta de forma granular el efecto de distintas configuraciones (gates only, K=1 frente a K=2, adaptadores, fases de congelación) sobre métricas como TextVQA, MMLU, GSM8K y una métrica propia `lang96`. Conviene subrayar que no incluye `config.json`, tokenizer ni processor, y que nada de lo contenido es cargable mediante `from_pretrained` sin reconstruir antes la arquitectura y el código de carga, que no está en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje sobre `Qwen3.5-0.8B`; sustitución de capas internas por GDN2 (Gated DeltaNet-2, atención lineal) + pata recurrente K=2 + módulo espacial |
| Parametros totales | no disponible (el modelo base es Qwen3.5-0.8B; el repositorio no declara recuento de parámetros y los pesos son checkpoints parciales/modulares de 605-725 MB mayoritarios) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | apache-2.0 (etiqueta de HuggingFace y fichero `LICENSE` según la sección en chino; el texto en inglés de la propia model card afirma que el repositorio «no incluye licencia», contradicción interna no resuelta) |
| Formato de pesos | PyTorch (`.pt`) y `.safetensors`, gestionados mediante Git LFS según `.gitattributes` |

## Arquitectura y entrenamiento

La arquitectura de la línea de investigación es un modelo de visión-lenguaje derivado de `Qwen3.5-0.8B` en el que se sustituyen capas internas por módulos GDN2. El trabajo GDN2 (Gated DeltaNet-2) se describe en la literatura como un mecanismo de atención lineal que desacopla las operaciones de borrado y escritura, y que aplica una delta rule (actualización tipo descenso de gradiente en línea) para mejorar el recall asociativo frente a actualizaciones puramente aditivas. Sobre ese backbone se añaden dos elementos: una pata recurrente de profundidad fija K=2 (el bucle se aplica dos veces) y un módulo espacial orientado a razonamiento espacial y tareas de oclusión.

El entrenamiento se organiza por fases y familias de experimentos. La familia `graft_*` corresponde al injerto inicial de GDN2 sobre el backbone congelado (con y sin adaptador), y `graft_gates_50k.pt` se identifica como el peso fuente de la versión «v2» publicada. La familia `b_*` documenta la fase B de la transformación GDN2 en dos modalidades (`gates` y `all`). La familia `loop2*` recorre tres etapas de la pata recurrente: `loop2p1` (registrado como `loop2long`, 10k pasos), `loop2p2` (descongelación de atención, 10k pasos) y `loop2p3` (descongelación total, 10k pasos). Otras familias (`sat_*`, `plane*`, `planc*`, `chains_*`, `xview_*`, `world3d*`, `slow_*`, `compressor_*`, `polish2_*`) cubren combinaciones de bucle cerrado K=2, módulo espacial, evaluación multi-salto, compresión visual y pulido por dominio de imagen.

El repositorio no incluye ningún script de entrenamiento o evaluación (`.py`), por lo que la composición exacta del dataset, el número total de tokens y la presencia de fases de RLHF o DPO no están documentados. Varias diferencias de tamaño entre checkpoints de la misma familia (por ejemplo, `loop2p3.pt` con 1,22 GB frente a 605 MB de `loop2long.pt`) no se explican en el texto del repositorio.

## Capacidades

- Generación de texto y respuesta a preguntas en chino e inglés, heredadas del backbone `Qwen3.5-0.8B`.
- Comprensión de imagen y texto (vision-language), evaluada mediante TextVQA.
- Razonamiento aritmético básico, medido con GSM8K, con mejora al activar la recursión K=2.
- Razonamiento espacial y sobre escenas con oclusión, mediante el módulo espacial y la familia `spatial*` / `world3d*`.
- Razonamiento multi-salto sobre cadenas de objetos (2hop/3hop) con alta densidad de objetos, evaluado en el escenario `chains_eval`.
- Recursión de profundidad configurable (K=1 frente a K=2), con ganancia documentada en GSM8K.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (el multi-salto evaluado es de razonamiento visual, no de agentes).
- Capacidad de «thinking mode»: no disponible.
- Audio: no disponible.

## Casos de uso

Debe tenerse en cuenta que ninguno de estos casos es directamente ejecutable sin reconstruir el pipeline de carga: el repositorio carece de tokenizer, processor y `config.json`.

- Auditoría y trazabilidad de experimentos: el repositorio permite rastrear qué configuración (gates only, K=1, K=2, con o sin adaptador) produjo qué resultado en TextVQA, MMLU, GSM8K y `lang96`, sirviendo como registro de decisiones de diseño para el equipo de investigación.
- Estudio de atención lineal en producción: investigadores que evalúen GDN2 frente a atención softmax pueden reutilizar los checkpoints como punto de partida para reproducir los efectos de la delta rule en recall asociativo.
- Análisis del compromiso entre recursión y calidad: la comparación documentada entre `loop2p3` con K=1 (GSM8K 36,5) y K=2 (43,0) permite estudiar el coste-beneficio de aplicar profundidad recurrente en tareas aritméticas.
- Investigación en razonamiento espacial: las familias `spatial*`, `world3d*` y `plane*` sirven para reproducir experimentos de oclusión y razonamiento 2.5D sobre escenas sintéticas.
- Recuperación de configuraciones fallidas: los checkpoints marcados como fallidos (por ejemplo, `c_adapter.pt`, señalado por el autor como causante de pérdida de puntuación) son útiles como casos negativos en estudios de ablación.
- Punto de partida para el ajuste de los modelos publicados: dado que `graft_gates_50k.pt` se identifica como peso fuente de la v2 oficial, el archivo permite auditar la correspondencia entre el peso experimental y el modelo lanzado.
- Docencia y análisis forense de checkpoints: con 84 ficheros en distintos pasos, es un corpus útil para practicar técnicas de inspección estática de pesos y de escaneo de seguridad de modelos (por ejemplo, con herramientas tipo ModelAudit).

## Benchmarks y rendimiento

Los datos siguientes proceden de los ficheros `BENCHMARKS.md` y `results.jsonl` incluidos en el repositorio. No se dispone de los resultados de otras familias (varias entradas quedan truncadas en la información disponible).

| Checkpoint | TextVQA | MMLU | lang96 | GSM8K | Otros |
|---|---|---|---|---|---|
| `release_step50000.pt` (full-FT 50k) | 23% (descrito como «desplome») | 44,5 | 1,771 | no disponible | — |
| `graft_gates_50k.pt` (fuente de v2) | val[512] 63,3 / 73,6 | 45,2 | 1,776 | no disponible | gates only |
| `graft_release.pt` (con adaptador) | val[512] 52,1 / 61,7 | no disponible | no disponible | no disponible | — |
| `b_all.pt` (fase B, GDN2+B) | 62,0 | 44,7 | 1,8880 | no disponible | — |
| `b_gates.pt` (B posterior, gates) | no disponible | no disponible | 1,9530 | no disponible | — |
| `loop2long.pt` (loop2p1, 10k) | no disponible | no disponible | 2,119 | no disponible | — |
| `loop2p2.pt` (etapa 2, 10k) | no disponible | no disponible | 1,992 | no disponible | step2000 = 2,014; step4000 = 1,997 |
| `loop2p3.pt` (etapa 3, 10k) | exact 8,4 / soft 65,8 (deriva de terminación) | no disponible | no disponible | K=1: 36,5; K=2: 43,0 (repetido: 35,0 vs 43,8; McNemar p = 0,0010) | — |

No se han publicado en la información disponible resultados de HumanEval ni de otros benchmarks adicionales.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio no está pensado para inferencia directa y no documenta requisitos.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible. Los ficheros mayoritarios (605-725 MB) son de tamaño reducido, pero se trata de checkpoints parciales, por lo que el tamaño real en memoria de un modelo funcional no puede deducirse de ellos.
- Opciones de despliegue: no disponible para este repositorio. Los modelos oficiales del autor (`Qwen3.5-0.8B-GDN2-LoopSpatial`, entre otros) cuentan con instrucciones de uso mediante vLLM, según la documentación pública enlazada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada más allá de las referencias internas del propio autor. Se incluyen los artefactos relacionados localizados:

| Modelo / artefacto | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tysgydke/gdn2-audit` | Objeto de esta ficha; archivo de auditoría, no desplegable | no disponible | no disponible | apache-2.0 (según etiqueta; contradicción interna en la card) | Público en HuggingFace |
| `tysgydk/Qwen3.5-0.8B-GDN2` | Modelo oficial del autor (v2) | ~0,8B (base) | no disponible | no disponible | Público |
| `tysgydk/Qwen3.5-0.8B-GDN2-Spatial` | Modelo oficial del autor (v3.1) | ~0,8B (base) | no disponible | no disponible | Público |
| `tysgydk/Qwen3.5-0.8B-GDN2-LoopSpatial` | Modelo oficial del autor (v4); con soporte vLLM | ~0,8B (base) | no disponible | no disponible | Público |
| `Qwen/Qwen3.5-0.8B` | Backbone original | ~0,8B | no disponible | apache-2.0 | Público |

## Limitaciones y advertencias

- No es un modelo cargable: no incluye `config.json`, tokenizer ni processor, y no existe un conjunto de pesos con nomenclatura estándar (`model.safetensors`). El código de carga no está en el repositorio.
- Contiene checkpoints intermedios mezclados con estados finales y con configuraciones fallidas, lo que hace inviable su uso directo sin curaduría manual.
- Los identificadores de checkpoint no siempre coinciden entre ficheros y documentación: `BENCHMARKS.md` cita `release_step50k` mientras el fichero se llama `release_step50000.pt`; el propio repositorio no aclara la correspondencia exacta.
- Existen contradicciones internas en la documentación: la sección en inglés afirma que no se incluye licencia, mientras la sección en chino afirma que se adjunta el texto íntegro de Apache 2.0; además, `README.md` clasifica `b_*` como «exploración temprana y descartada» mientras `BENCHMARKS.md` lo trata como resultados de la fase B.
- Ausencia de scripts de entrenamiento y evaluación: no es posible verificar la reproducibilidad de los números reportados ni conocer la composición del dataset.
- Sesgos conocidos: no disponible (no se documenta análisis de sesgo).
- Riesgo de alucinación: no evaluado en la información disponible; el backbone base de 0,8B es de capacidad limitada.
- Limitaciones de idioma: solo se declaran chino e inglés.
- Limitaciones de contexto: no disponible.
- Restricciones de licencia para uso comercial: la etiqueta indica apache-2.0, que permitiría uso comercial, pero la contradicción interna sobre la presencia/ausencia de licencia y el hecho de que los pesos derivan de una línea de investigación con componentes no publicados aconsejan verificar con el autor antes de cualquier uso en producción.
- Advertencia de seguridad: al contener ficheros de pesos opacos sin documentación de arquitectura, conviene escanearlos con herramientas de análisis estático (por ejemplo, ModelAudit de Promptfoo) antes de manipularlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tysgydke/gdn2-audit
- Modelo oficial v2: https://huggingface.co/tysgydk/Qwen3.5-0.8B-GDN2
- Modelo oficial v3.1: https://huggingface.co/tysgydk/Qwen3.5-0.8B-GDN2-Spatial
- Modelo oficial v4 (LoopSpatial, con instrucciones para vLLM): https://huggingface.co/tysgydke/Qwen3.5-0.8B-GDN2-LoopSpatial
- Implementación oficial de Gated DeltaNet-2 (NVlabs): https://github.com/NVlabs/GatedDeltaNet-2
- Paper de GDN2 (PDF en el repositorio de NVlabs): https://github.com/NVlabs/GatedDeltaNet-2/blob/main/paper/GDN2_paper.pdf
- Artículo relacionado sobre GDN de contexto largo (FG²-GDN): https://arxiv.org/abs/2604.19021
- Herramienta de escaneo estático de modelos (ModelAudit, Promptfoo): https://github.com/promptfoo/modelaudit
- Documentación de ModelAudit: https://www.promptfoo.dev/docs/model-audit/
