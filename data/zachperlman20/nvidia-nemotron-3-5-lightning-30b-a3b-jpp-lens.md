# zachperlman20/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-jpp-lens

## Resumen

J++ lens para NVIDIA Nemotron 3.5 Lightning 30B-A3B es un artefacto de interpretabilidad, no un modelo generativo. Se trata de un conjunto de 51 mapas lineales (uno por cada capa del 0 al 50, con dimensión `d_model` de 2688) que proyectan el flujo residual de cada capa hacia la entrada del bloque final del modelo base, permitiendo leer los logits intermedios de una capa concreta mediante `logits = unembed(h @ J[layer].T)`. Lo desarrolla Zach Perlman en el contexto del proyecto bridge-jspace (MATS 12, junto a Dan Orel).

El modelo subyacente es NVIDIA Nemotron 3.5 Lightning 30B-A3B en BF16, una arquitectura híbrida NemotronH con capas Mamba-2, atención y MoE que el autor parchea para el pipeline de ajuste. El lens se ajusta sobre WikiText con 32 prompts y longitud máxima de 128 tokens, y se distribuye como un fichero `.pt` de 737 MB en fp16. El repositorio ocupa 0,7 GB y no contiene los pesos del modelo base.

Su relevancia es acotada: es una herramienta de investigación para estudiar qué información está linealmente accesible en cada capa del flujo residual de Nemotron 3.5 Lightning, útil para análisis de mecanismos internos, detección de representaciones latentes y experimentos de interpretabilidad. El autor lo declara explícitamente como artefacto de investigación no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lens lineal por capa (J++ / Jacobian lens) sobre modelo base híbrido NemotronH (Mamba-2 + atención + MoE) |
| Parametros totales | No disponible para el lens; el modelo base es 30B-A3B |
| Parametros activos | No disponible para el lens; el modelo base activa 3B por token (MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ajuste del lens usa 128 tokens) |
| Tipos de cuantizacion | No disponible (el lens se distribuye en fp16) |
| Idiomas soportados | No disponibles |
| Licencia | OpenMDW-1.1 (heredada del modelo base NVIDIA Nemotron 3.5 Lightning) |
| Formato de pesos | `.pt` (PyTorch, fp16), fichero `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16_jpp_lens.pt` |

## Arquitectura y entrenamiento

El lens J++ es una colección de mapas lineales `J[layer]` de forma `[2688, 2688]` para cada capa fuente entre 0 y 50. Cada mapa transforma el estado del flujo residual en esa capa hacia el espacio de entrada del bloque final; la lectura se completa aplicando la normalización final del modelo y su LM head sobre la proyección. El fichero incluye metadatos: `source_layers`, `d_model`, `n_prompts` (32) y un bloque `provenance` con la receta de ajuste.

El ajuste se realizó con el código `safety-research/jpp_lens` en el commit `93f02cd`, parcheado para NemotronH (RMSNorm, layout de bloques y ausencia de token BOS). Se aplicó la regla de atribución LN (`--lrp-mode ln`); como Nemotron no tiene MLPs con gating, las capas Mamba-2, de atención y MoE conservan gradientes estándar. Los datos son 64 prompts de WikiText para el router y un shard de 32 prompts para el ajuste, con longitud máxima 128, saltando las primeras 16 posiciones y semilla 0. El objetivo es el bloque final (`--target-offset -1`). El pipeline fusiona expertos y ajusta los pesos de readout sobre los ítems de evaluación de la librería. La ejecución usó el snapshot fijado del modelo con los kernels mamba-ssm de Hugging Face Hub, con NLL de WikiText de 2,4642 frente a 2,4634 de la ruta torch.

## Capacidades

- Lectura de logits intermedios: permite obtener la distribución de tokens predicha por el modelo base en cada capa fuente (0-50), no solo en la capa final.
- Análisis de representaciones latentes: facilita estudiar qué conceptos o tokens están linealmente codificados en el flujo residual de cada capa.
- Evaluación comparativa de métodos de lectura: el autor reporta resultados frente a pooled lens y logit lens en cinco tareas (association, multihop, multilingual, poetry, typo).
- Soporte multilingüe en la evaluación: la tarea `multilingual` obtiene 0,665 de pass@10, lo que indica cierta transferencia de la lectura a otros idiomas.
- Detección de errores tipográficos: la tarea `typo` alcanza 0,805, útil para estudiar robustez léxica interna.
- Razonamiento multihop interno: la tarea `multihop` alcanza 0,958, lo que refleja acceso lineal a información compuesta en capas intermedias.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; su función es exclusivamente analítica.

## Casos de uso

- Análisis de mecanismos internos de Nemotron 3.5 Lightning: aplicar el lens capa a capa para localizar en qué profundidad se forma una predicción concreta y comparar con la salida final del modelo.
- Investigación en interpretabilidad comparada: usar los resultados de pass@10 del lens J++ frente a pooled lens y logit lens como línea base para nuevos métodos de lectura del flujo residual.
- Detección de representaciones de entidades y relaciones: la tarea `association` (0,317) permite estudiar cómo se codifican asociaciones semánticas en capas intermedias y dónde falla la linealidad.
- Estudio de robustez ante erratas: la tarea `typo` (0,805) sirve para analizar si el modelo representa la forma canónica de una palabra incluso cuando la entrada contiene errores.
- Auditoría de sesgos y contenido latente: leer logits intermedios para identificar tokens sensibles que el modelo "considera" antes de la capa final, útil en análisis de seguridad.
- Análisis multilingüe de representaciones: la tarea `multilingual` (0,665) permite comparar en qué capas se alinean conceptos equivalentes en distintos idiomas dentro del mismo modelo.
- Reproducción de experimentos del proyecto bridge-jspace: el lens es el artefacto detrás de todos los resultados de Nemotron Lightning de ese proyecto, por lo que sirve para replicar y extender sus análisis.

## Benchmarks y rendimiento

Resultados de la suite de evaluación de `jpp_lens` sobre ítems held-out, pass@10 ponderado por ítem. Columnas: J++ lens (este artefacto), pooled lens y logit lens.

| Eval | J++ (este lens) | Pooled lens | Logit lens |
|---|---|---|---|
| association | 0,317 | 0,220 | 0,146 |
| multihop | 0,958 | 0,875 | 0,792 |
| multilingual | 0,665 | 0,509 | 0,503 |
| poetry | 0,188 | 0,125 | 0,125 |
| typo | 0,805 | 0,675 | 0,649 |
| **macro** | **0,587** | **0,481** | **0,443** |

No se han publicado resultados de benchmarks del modelo base en la información proporcionada; los datos anteriores corresponden exclusivamente al lens.

## Requisitos de hardware

- Almacenamiento: 737 MB para el fichero del lens en fp16; el repositorio completo ocupa 0,7 GB.
- Memoria para cargar el lens: aproximadamente 1,5 GB en RAM/VRAM si se convierte a fp32 (51 matrices de 2688x2688 en fp32 son unos 1,4 GB).
- El lens por sí solo no requiere GPU; se puede cargar en CPU con `torch.load(..., map_location="cpu")` y aplicar las proyecciones en CPU.
- Para usarlo de forma útil hay que ejecutar el modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B en BF16, lo que exige hardware de gama alta (no disponible el detalle exacto de VRAM en la información proporcionada).
- El ajuste original usó los kernels `mamba-ssm` de Hugging Face Hub, lo que implica dependencia de ese stack para reproducir la ejecución.
- Opciones de despliegue del lens: script Python con PyTorch y `huggingface_hub`; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput del lens: no disponibles; el coste dominante es la inferencia del modelo base, no la proyección lineal.

## Comparativa con modelos similares

| Artefacto | Tipo | Capas cubiertas | Resultado macro (pass@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| J++ lens (este) | Jacobian lens lineal por capa | 0-50 | 0,587 | OpenMDW-1.1 | Hugging Face |
| Pooled lens | Lens agregado | No disponible | 0,481 | No disponible | Referenciado en la eval del autor |
| Logit lens | Lectura directa de logits por capa | Todas (lectura directa) | 0,443 | No disponible | Técnica estándar de la literatura |

No se dispone de comparación con otros lenses J++ publicados para modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación no verificado de forma independiente, según declara el propio autor.
- El ajuste usa solo 32 prompts de WikiText con longitud máxima 128 y salta las primeras 16 posiciones; la cobertura de dominios y longitudes es muy limitada.
- Los resultados de evaluación son pass@10 ponderados por ítem sobre ítems held-out de la suite del autor, no un benchmark estándar externo.
- La tarea `poetry` obtiene 0,188 y `association` 0,317: la lectura lineal falla en fenómenos creativos y asociativos, por lo que no debe usarse como sustituto de la salida real del modelo.
- Depende de un snapshot concreto del modelo base (revisión `a9904d24bcc1d289a1950fa9d2b978c47cf903b9`); cambios en el modelo invalidan el lens.
- Requiere parches específicos para NemotronH (RMSNorm, layout de bloques, sin BOS) y los kernels `mamba-ssm`; la reproducibilidad fuera de ese stack no está garantizada.
- Licencia OpenMDW-1.1 heredada del modelo base: revisar sus términos antes de cualquier uso, incluido el comercial.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con métricas de generación.
- El repositorio no incluye los pesos del modelo base; el usuario debe descargarlos por separado desde NVIDIA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zachperlman20/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-jpp-lens
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Proyecto bridge-jspace: https://github.com/zach-perlman/bridge-jspace
- Código de ajuste jpp_lens: https://github.com/safety-research/jpp_lens
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Fichero de evaluación completo: `eval_ranks_pass_at_k.csv` (referenciado en la model card, sin URL directa disponible)
