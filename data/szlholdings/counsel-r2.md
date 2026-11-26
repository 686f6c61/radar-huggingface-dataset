# SZLHOLDINGS/counsel-r2

## Resumen

counsel-r2 es un adaptador LoRA (rsLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un ajuste fino ligado a un "carril Counsel" (asesoramiento jurídico o normativo), entrenado con QLoRA y orientado a que las afirmaciones del modelo lleven fuentes o sean rechazadas de forma explícita. El repositorio incluye únicamente artefactos de entrenamiento (receipt de Unsloth y una evaluación de humo), no pesos fusionados ni un modelo autónomo listo para inferencia directa.

El modelo es relevante como ejemplo de práctica de gobernanza: el autor separa explícitamente la finalización del entrenamiento de la aprobación de despliegue, y condiciona el uso en producción a una revisión del propietario y a una evaluación sustantiva. Con 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repositorio de 0.0 GB, se trata de un artefacto experimental de nicho, no de un modelo de propósito general.

La información disponible es muy limitada: no hay pipeline declarado, no se listan idiomas soportados y no se publican benchmarks más allá de una evaluación de humo referenciada. Todo dato no presente en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA rank-8; base de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B, no especificada) |
| Tipos de cuantizacion | QLoRA durante entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador rsLoRA de rango 8 y alpha 16 aplicado sobre las proyecciones de atención q_proj, k_proj, v_proj y o_proj del modelo base Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17). El entrenamiento se realizó con QLoRA usando Unsloth, con semilla 20260721 y sobre el dataset SZLHOLDINGS/szl-1-doctrine-sft más turnos verticales gobernados. El "cut" declarado restringe el ajuste al carril de atención ("attention-only") y establece que las afirmaciones deben llevar fuentes o ser rechazadas.

El repositorio incluye un receipt de entrenamiento en formato szl.training_receipt.v2 con pérdida medida (MEASURED loss) y una evaluación de humo en evaluations/smoke-eval-r1.json. No se documentan el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. El autor advierte explícitamente que la finalización del entrenamiento no equivale a aprobación de despliegue y que el modelo no está desplegado.

## Capacidades

- Generación de texto y respuestas de asesoramiento dentro del "carril Counsel" definido por el autor.
- Comportamiento orientado a citar fuentes o rechazar afirmaciones no respaldadas (según el cut declarado).
- Ajuste específico sobre proyecciones de atención, lo que concentra la adaptación en el comportamiento atencional.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información.

## Casos de uso

- Asesoramiento normativo con trazabilidad: el modelo está diseñado para que cada afirmación lleve fuente o sea rechazada, lo que encaja en flujos internos de consulta documental donde la ausencia de respaldo debe señalarse explícitamente.
- Evaluación de gobernanza de modelos: sirve como caso de estudio de un pipeline que separa entrenamiento, receipt medido y evaluación de humo antes de cualquier despliegue.
- Prototipado de asistentes jurídicos de bajo coste: al partir de una base de 0.8B, permite experimentar en hardware modesto antes de escalar a modelos mayores.
- Investigación sobre adaptadores rsLoRA: el repositorio documenta rango, alpha, módulos objetivo y semilla, lo que facilita reproducir o comparar el ajuste.
- Filtrado de respuestas en dominios regulados: el patrón "cita o rechaza" puede reutilizarse como capa de verificación en asistentes de cumplimiento normativo.
- Base para evaluaciones sustantivas: dado que el autor exige una eval sustantiva antes de desplegar, el modelo sirve como sujeto de pruebas en marcos de evaluación de fiabilidad y atribución de fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia una evaluación de humo (evaluations/smoke-eval-r1.json) sin cifras reproducidas en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador sobre una base de 0.8B, la huella es la del modelo base más el adaptador.
- GPU recomendadas: no disponible en la información.
- Compatibilidad con GPU de consumo: no confirmada en la información; una base de 0.8B es, en principio, ligera, pero no se aportan requisitos verificados.
- Opciones de despliegue: no disponible; el autor indica que el despliegue está bloqueado tras revisión del propietario y una evaluación sustantiva.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| counsel-r2 | Adaptador LoRA sobre base 0.8B | no disponible | Apache 2.0 | Repo con 0 descargas, sin despliegue | Ajuste de nicho "Counsel" con cut de atribución |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | no disponible | no disponible en esta ficha | Modelo base público | Referencia directa del adaptador |
| Alternativas de asesoramiento jurídico open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo no está desplegado y su uso en producción está bloqueado por revisión del propietario y una evaluación sustantiva pendiente.
- El repositorio no contiene pesos fusionados; requiere cargar el adaptador sobre el modelo base en la revisión indicada.
- No se documentan sesgos conocidos, pero al ser un ajuste de nicho sobre doctrina propia, puede heredar sesgos del dataset szl-1-doctrine-sft.
- Riesgo de alucinación: el cut declara que las afirmaciones deben llevar fuentes o rechazarse, pero no se aportan métricas que verifiquen el cumplimiento de esa política.
- Limitaciones de contexto e idioma: no disponibles; no se especifican ni la ventana efectiva ni los idiomas cubiertos.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el autor restringe de facto el despliegue mediante gobernanza interna.
- Ausencia de benchmarks públicos y de una evaluación sustantiva publicada limita cualquier afirmación sobre calidad.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/counsel-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Receipt de entrenamiento: training_receipt.unsloth.json (referenciado en la model card)
- Evaluación de humo: evaluations/smoke-eval-r1.json (referenciado en la model card)
- Papers, blogs, repos y demos adicionales: no disponible
