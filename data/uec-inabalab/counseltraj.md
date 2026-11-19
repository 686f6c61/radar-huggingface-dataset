# UEC-InabaLab/CounselTraj

## Resumen

CounselTraj es un planificador de trayectorias de actos de diálogo (dialogue-act trajectory planner) diseñado para sintetizar diálogos de consejería psicológica conscientes del proceso. Lo desarrolla el grupo UEC-InabaLab y se distribuye como un adaptador LoRA sobre el modelo base Qwen/Qwen3-8B. Dado un breve diálogo de consejería, el modelo produce una secuencia ordenada de actos etiquetados por rol, como `counselor:[OpenQuestion]` o `client:[SelfDisclosure]`, que sirven como esqueleto para la posterior síntesis del diálogo completo.

El modelo no es un generador de conversaciones de consejería de extremo a extremo, sino un componente de planificación: genera etiquetas de planificación de investigación que después se utilizan para construir diálogos sintéticos con estructura procesual. Esta separación entre planificación y síntesis es relevante porque permite controlar la progresión terapéutica (etapas, transiciones entre actos) de forma explícita y auditable, algo difícil de garantizar con generación libre.

El adaptador tiene 21.823.488 parámetros entrenables (LoRA de rango 8 sobre siete módulos del transformer de Qwen3-8B), se entrenó hasta la época 5 seleccionando el checkpoint con menor pérdida de validación (1,1678476334) y se apoya en priors agregados de 1.010 diálogos anotados. Es un modelo de nicho, en chino, orientado a investigación en generación de datos sintéticos para salud mental, no a despliegue clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA; planificador con decodificación restringida v4 |
| Parametros totales | 8B en el modelo base; 21.823.488 parámetros en el adaptador LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; el autor no la especifica en la información proporcionada) |
| Tipos de cuantizacion | NF4 de bitsandbytes (4-bit) por defecto; carga sin cuantizar con `--no-4bit` |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible para el adaptador; el modelo base Qwen3-8B es Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only. La configuración LoRA es de rango 8, alpha 16 y dropout 0,05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, atención completa y capas MLP del modelo base. El entrenamiento usó una tasa de aprendizaje de 0,0002 con warmup ratio de 0,03 y se extendió hasta la época 5; el checkpoint publicado (checkpoint-145) coincide byte a byte con el modelo final guardado.

La innovación principal no está en el ajuste fino sino en el procedimiento de decodificación: el planificador v4 condicionado por contenido combina las verosimilitudes del adaptador con priors de etapa, transición y globales agregados de 1.010 diálogos anotados, además de puntuaciones de contenido y fase, una penalización por repetición y un bonus de diversidad. El presupuesto de longitud de trayectoria por defecto es de 64 a 92 actos de diálogo. El inventario de candidatos del cliente contiene 14 etiquetas, incluida `Resistance`, añadida después de la versión inicial, por lo que las trayectorias planificadas pueden diferir de las salidas v4 originales aunque los pesos no hayan cambiado.

## Capacidades

- Planificación de trayectorias de actos de diálogo etiquetados por rol (`counselor:[...]`, `client:[...]`).
- Generación de secuencias ordenadas de entre 64 y 92 actos con control de etapa y transición.
- Decodificación restringida al inventario de actos, con penalización de repetición y bonus de diversidad.
- Condicionamiento por contenido del diálogo de entrada (campos `input`, `topic`, `topic_zh`, `source_dataset`, `source_id`).
- Salida estructurada en JSONL con la trayectoria, su longitud y el recuento de etiquetas.
- Uso como componente de un pipeline de síntesis de diálogos, no como generador de diálogo final.
- Capacidades multilingües: limitadas al chino.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de propósito general según la información disponible.

## Casos de uso

- Generación de datos sintéticos para investigación en consejería psicológica: el planificador produce trayectorias de actos que después alimentan un generador de diálogo, permitiendo crear corpus con estructura terapéutica controlada y reproducible.
- Estudio de progresión terapéutica: al fijar etapas y transiciones mediante priors, se pueden simular distintas secuencias de intervención (preguntas abiertas, reformulaciones, autorrevelaciones del cliente) y analizar su coherencia procesual.
- Anotación asistida de diálogos: usar la trayectoria planificada como propuesta de etiquetado de actos que un anotador humano revisa, reduciendo el coste de anotar corpus de consejería.
- Aumento de datos para entrenar clasificadores de actos de diálogo: las trayectorias etiquetadas sirven como datos etiquetados adicionales para modelos discriminativos.
- Investigación sobre resistencia del cliente: el inventario incluye la etiqueta `Resistance` (rechazo, reticencia u oposición a las intervenciones), lo que permite modelar explícitamente escenarios de ruptura terapéutica.
- Experimentos de evaluación de coherencia conversacional: comparar diálogos sintetizados a partir de trayectorias planificadas frente a generación libre para medir el efecto de la planificación explícita.
- Reproducibilidad de experimentos académicos: el repositorio incluye script de planificación, priors, ejemplo sintético, fichero de validación y sumas SHA256, lo que facilita replicar el procedimiento descrito en el paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación del checkpoint seleccionado (1,1678476334) y la existencia de una comprobación de inferencia sintética en GPU en `validation.json`, sin métricas comparativas frente a otros modelos.

## Requisitos de hardware

- VRAM estimada: con cuantización NF4 de 4 bits sobre el modelo base de 8B, el uso se sitúa aproximadamente en 5-6 GB para los pesos más overhead de activaciones; sin cuantizar, en torno a 16 GB en bf16.
- GPU recomendadas: A100, H100 o L40S para ejecución sin cuantizar con holgura; RTX 4090, RTX 3090 o RTX 4080 para la ruta 4-bit.
- Cabe en GPU de consumo: sí, con la ruta NF4 por defecto en tarjetas de 8 GB o más; la ruta `--no-4bit` requiere al menos 16 GB.
- Opciones de despliegue: el repositorio proporciona `plan_trajectory.py` con PEFT, Transformers y bitsandbytes; la carga del adaptador en Python se hace con `PeftModel.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación de 64-92 actos con decodificación restringida y cálculo de priors implica múltiples pasos de scoring, por lo que no es un escenario de baja latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CounselTraj (este modelo) | 8B base + 21,8M LoRA | no disponible | Planificación de actos de diálogo en consejería (zh) | no disponible (base Apache-2.0) | Hugging Face, GitHub |
| Qwen/Qwen3-8B | 8B | no disponible en la información proporcionada | Generación de texto general | Apache-2.0 | Hugging Face |
| Alternativas específicas de planificación de actos en consejería | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros planificadores de trayectorias de actos de diálogo comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el planificador genera etiquetas de planificación de investigación y que sus trayectorias no han sido validadas como planes de tratamiento clínico.
- El modelo solo está entrenado y evaluado en chino; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La licencia del adaptador no está especificada, lo que impide confirmar si se permite uso comercial; solo el modelo base Qwen3-8B tiene licencia Apache-2.0 declarada.
- Riesgo de alucinación estructural: el planificador puede añadir actos de cierre más allá del presupuesto de longitud objetivo, por lo que la longitud real debe contarse en el campo `output`.
- El inventario de actos del cliente cambió tras la publicación inicial (se añadió `Resistance`), de modo que las trayectorias nuevas pueden diferir de las salidas v4 originales aunque los pesos sean idénticos.
- Cargar únicamente el adaptador proporciona solo el componente de modelo de lenguaje del planificador; la funcionalidad completa requiere el script de decodificación con priors.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Uso inadecuado potencial: generar diálogos de consejería sintéticos y presentarlos como interacciones reales o como material terapéutico sin supervisión clínica.
- Sesgos: no documentados en la información disponible; al entrenarse sobre diálogos anotados de consejería en chino, puede heredar sesgos culturales y de anotación de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UEC-InabaLab/CounselTraj
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper (arXiv): https://arxiv.org/abs/2611.24168
- Proyecto y dataset (GitHub): https://github.com/UEC-InabaLab/CounselTraj
