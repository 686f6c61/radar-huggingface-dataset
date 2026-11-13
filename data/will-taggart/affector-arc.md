# will-taggart/AFFECTOR-ARC

## Resumen

AFFECTOR-ARC es un repositorio de reproduccion experimental publicado por el usuario will-taggart en Hugging Face. No contiene pesos de modelo, ni un checkpoint afinado, ni un adaptador PEFT: es un conjunto de scripts (runner, script de setup, job de Slurm y un pasaje de ejemplo) para ejecutar el motor AFFECTOR sobre el checkpoint upstream Qwen3.5-0.8B en el cluster TinkerCliffs del ARC de Virginia Tech. Su proposito es reproducir en CUDA una tecnica de activation steering orientada a modular la valencia emocional de las generaciones.

El repositorio aplica una intervencion sobre los estados ocultos (hidden states) del modelo en tiempo de inferencia, recalibrando una "base emocional" en GPU y comparando cinco condiciones de generacion: baseline, fuerza cero, valencia positiva, valencia negativa y baseline restaurado. Se trata de un experimento de un unico pasaje, no de un servidor conversacional, y el propio autor advierte que no establece control emocional fiable ni preservacion semantica.

Su relevancia es acotada y de caracter investigador: sirve como punto de partida reproducible para quienes quieran explorar tecnicas de steering sobre modelos pequenos (0,8B parametros) en infraestructura HPC con CUDA, y documenta explicitamente sus limitaciones y el alcance de la validacion realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio no define arquitectura propia; aplica intervencion sobre estados ocultos de Qwen3.5-0.8B en inferencia) |
| Parametros totales | No disponible para AFFECTOR-ARC; el checkpoint upstream referenciado es Qwen3.5-0.8B (0,8B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para el repositorio; el motor AFFECTOR upstream conserva su licencia (commit 628c534a92229d86ec9f09b8310ac6fe5d14ec9e) y los pesos de Qwen conservan su licencia upstream |
| Formato de pesos | No redistribuye pesos; el runner descarga el checkpoint upstream Qwen3.5-0.8B fijado (pinned) |

## Arquitectura y entrenamiento

AFFECTOR-ARC no entrena ni publica un modelo. El componente tecnico es el motor AFFECTOR, que implementa una intervencion sobre los estados ocultos del transformer subyacente (Qwen3.5-0.8B) en tiempo de inferencia, siguiendo el paradigma de activation steering. El runner recalibra una base emocional sobre CUDA y genera texto bajo cinco condiciones controladas (baseline, fuerza cero, valencia positiva, valencia negativa y baseline restaurado) para un unico pasaje de ejemplo.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset, ni sobre etapas de RLHF o DPO, ya que no hay entrenamiento implicado en este repositorio. La innovacion tecnica declarada es la reproducibilidad del pipeline de steering en un cluster HPC con Slurm y CUDA. El autor reporta que el 12 de noviembre de 2026 se completo una ejecucion en el nodo `tc-dgx005` del ARC, finalizando con `Completed CUDA checks: runs/first-test.json`, lo que indica que las aserciones del runner pasaron; sin embargo, el JSON de resultados y el texto generado no fueron inspeccionados ni incluidos. Transformers reporto fallbacks a kernels de referencia por ausencia de `causal_conv1d` y `flash-linear-attention`, aunque la ejecucion termino correctamente. La eficacia emocional y la fidelidad semantica quedan sin evaluar.

## Capacidades

- Generacion de texto condicionada por intervencion en estados ocultos: el runner produce generaciones bajo cinco condiciones de valencia (baseline, fuerza cero, positiva, negativa y baseline restaurado) para un unico pasaje.
- Recalibracion de la base emocional en CUDA: el pipeline calcula la base de steering en GPU antes de generar.
- Ejecucion reproducible en HPC: incluye script de setup, job de Slurm y runner para el cluster TinkerCliffs.
- Descarga de checkpoint fijado: obtiene una version concreta del checkpoint upstream Qwen3.5-0.8B, lo que favorece la reproducibilidad.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes ni razonamiento multi-paso segun la informacion disponible.
- Capacidades multilingues limitadas al ingles declarado.
- No incluye modo thinking, vision ni audio.
- No es un servidor conversacional: procesa un unico pasaje, no dialogos multi-turno.

## Casos de uso

- Reproduccion de experimentos de activation steering: un investigador puede clonar el repositorio, ejecutar el job de Slurm en TinkerCliffs y obtener las cinco condiciones de generacion para verificar el comportamiento del motor AFFECTOR sobre Qwen3.5-0.8B.
- Validacion de pipelines de intervencion en estados ocultos en CUDA: el runner sirve como plantilla para comprobar que la recalibracion de la base emocional se ejecuta correctamente en GPU antes de escalar a experimentos mayores.
- Docencia e introduccion a tecnicas de steering: al ser un experimento de un unico pasaje con pasos documentados (setup, ejecucion, validacion), resulta adecuado para que estudiantes reproduzcan el flujo completo en infraestructura HPC.
- Benchmarking de infraestructura HPC: el job de Slurm y las aserciones del runner permiten medir si un nodo concreto (por ejemplo, `tc-dgx005`) ejecuta correctamente el pipeline, incluyendo la deteccion de dependencias opcionales ausentes como `causal_conv1d` y `flash-linear-attention`.
- Base para extensiones de investigacion: el codigo puede adaptarse para probar otras direcciones de steering, otras intensidades o modelos subyacentes distintos, partiendo del runner existente.
- Auditoria de limitaciones en publicaciones: el repositorio documenta explicitamente el alcance de la validacion (solo aserciones del runner, sin evaluacion de eficacia emocional ni fidelidad semantica), lo que sirve como ejemplo de reporte honesto de resultados parciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la ejecucion finalizo con las comprobaciones CUDA superadas (`Completed CUDA checks: runs/first-test.json`), pero el JSON de resultados y el texto generado no fueron inspeccionados ni incluidos, y la eficacia emocional y la fidelidad semantica quedan sin evaluar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al operar sobre un checkpoint de 0,8B parametros, la inferencia en precision completa requeriria del orden de unos pocos GB, aunque el repositorio no publica cifras.
- GPU recomendadas: el autor reporta ejecucion en el nodo `tc-dgx005` del cluster TinkerCliffs (ARC, Virginia Tech), con soporte CUDA; no se especifica el modelo exacto de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el repositorio proporciona un runner propio, script de setup y job de Slurm; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias opcionales: `causal_conv1d` y `flash-linear-attention` no estaban presentes en la ejecucion reportada, lo que provoco fallbacks a kernels de referencia de Transformers.

## Comparativa con modelos similares

No disponible. AFFECTOR-ARC no es un modelo con pesos propios, sino un repositorio de reproduccion de una tecnica de steering sobre Qwen3.5-0.8B, por lo que no procede una comparacion directa con modelos de la misma categoria.

## Limitaciones y advertencias

- No contiene pesos de modelo, checkpoint afinado ni adaptador PEFT; depende de la descarga del checkpoint upstream Qwen3.5-0.8B.
- Es un experimento de un unico pasaje, no un servidor conversacional ni un sistema listo para produccion.
- El autor declara explicitamente que no establece control emocional fiable ni preservacion semantica.
- La eficacia emocional y la fidelidad semantica no han sido evaluadas.
- El JSON de resultados y el texto generado de la ejecucion reportada no fueron inspeccionados ni incluidos en el repositorio.
- Ausencia de `causal_conv1d` y `flash-linear-attention` provoca fallbacks a kernels de referencia, con posible impacto en rendimiento no cuantificado.
- Solo se declara soporte de ingles.
- Licencia del repositorio no disponible; el motor AFFECTOR upstream y los pesos de Qwen conservan sus licencias respectivas, que deben verificarse antes de cualquier uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables al modelo subyacente Qwen3.5-0.8B.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/will-taggart/AFFECTOR-ARC
- Informe tecnico y revision de literatura (referenciado en la model card): TECHNICAL_REPORT.md dentro del repositorio
- Instrucciones de setup, ejecucion, alcance de validacion y limitaciones: README.txt dentro del repositorio
- Motor AFFECTOR upstream: https://github.com/FL2744/AFFECTOR
- Commit fijado del motor upstream: 628c534a92229d86ec9f09b8310ac6fe5d14ec9e
- Checkpoint upstream Qwen3.5-0.8B: no se proporciona URL directa en la informacion disponible
