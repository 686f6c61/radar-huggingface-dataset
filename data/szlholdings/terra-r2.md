# SZLHOLDINGS/terra-r2

## Resumen

terra-r2 es un adaptador LoRA (concretamente rsLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un ajuste fino supervisado (SFT) orientado a un conjunto de datos propietario denominado "szl-1-doctrine-sft", complementado con turnos verticales "gobernados" (governed vertical turns). El repositorio tiene un tamaño de 0,0 GB y no incluye pesos en formato completo, sino los artefactos del adaptador en safetensors, junto con un recibo de entrenamiento y un resultado de evaluación de humo.

El modelo no es un modelo fundacional ni un lanzamiento de producción: la propia model card indica explícitamente que la finalización del entrenamiento no equivale a aprobación de despliegue, que el modelo no está desplegado y que cualquier despliegue queda condicionado a revisión del propietario y a una evaluación sustantiva. Por tanto, debe tratarse como un artefacto experimental de investigación interna, no como un modelo listo para uso general.

La relevancia de esta ficha es limitada y fundamentalmente documental: el modelo no tiene descargas ni interacciones, no publica benchmarks, no declara idiomas soportados y su model card es extremadamente escueta. La información disponible permite describir la configuración del entrenamiento, pero no caracterizar su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador rsLoRA sobre transformer Qwen/Qwen3.5-0.8B (rev 2fc06364715b967f1860aea9cf38778875588b17) |
| Parametros totales | No disponible (el adaptador LoRA es de rango 8; el modelo base tiene 0,8B según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | No disponible (el entrenamiento se describe como QLoRA, pero no se publican artefactos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante rsLoRA (Rank-Stabilized LoRA) con rango 8 y alpha 16, aplicado sobre las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y las proyecciones MLP (gate_proj, up_proj, down_proj) del modelo base Qwen/Qwen3.5-0.8B. La cobertura de la superficie de adaptación incluye, por tanto, atención y MLP completos. El entrenamiento se realizó con QLoRA, lo que implica que el modelo base se cargó cuantizado durante el ajuste, aunque no se especifica el esquema de cuantización empleado.

La semilla utilizada fue 20260721 y el conjunto de datos combina SZLHOLDINGS/szl-1-doctrine-sft con turnos verticales gobernados. El pipeline incluye empaquetado automático (auto packing) y se describe como una ejecución "M5 verticals receipted" con corte en el "Territorial lane". El repositorio incluye un recibo de entrenamiento en formato training_receipt.unsloth.json (esquema szl.training_receipt.v2) que reporta pérdida medida (MEASURED loss) y una evaluación de humo en evaluations/smoke-eval-r1.json. No se publica el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y ajuste de estilo sobre la doctrina y los turnos verticales incluidos en el dataset de entrenamiento.
- Adaptación de bajo rango sobre atención y MLP, lo que permite cargar el adaptador junto al modelo base sin duplicar los pesos completos.
- No se declaran capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se declaran capacidades de agente, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidad de evaluación: el repositorio incluye un script/registro de evaluación de humo, pero no se publican resultados numéricos en la información disponible.

## Casos de uso

- Investigación interna sobre ajuste fino eficiente: el adaptador sirve como ejemplo reproducible de rsLoRA rango 8 sobre atención y MLP con QLoRA, útil para estudiar configuraciones de bajo rango en modelos de 0,8B.
- Experimentación con datos propietarios de dominio: el modelo está entrenado sobre un dataset doctrinal específico, por lo que puede emplearse para probar la transferencia de estilo y terminología de ese corpus en entornos controlados.
- Evaluación de pipelines de recibos de entrenamiento: el repositorio incluye un recibo estructurado (szl.training_receipt.v2) que puede usarse para auditar la trazabilidad de un run de ajuste fino.
- Pruebas de despliegue en hardware modesto: al partir de un modelo base de 0,8B, el adaptador permite experimentar con inferencia en GPU de consumo, siempre que se valide previamente el modelo base y el adaptador.
- Docencia y formación: útil como caso práctico de LoRA/QLoRA con cobertura completa de proyecciones de atención y MLP, incluido el uso de empaquetado automático.
- Prototipado de asistentes verticales: si el dataset doctrinal corresponde a un dominio concreto, el adaptador puede servir como punto de partida para prototipos internos, sujeto a la revisión del propietario y a una evaluación sustantiva antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo referencia una evaluación de humo (evaluations/smoke-eval-r1.json) sin cifras publicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; al tratarse de un adaptador sobre un modelo base de 0,8B, la huella es reducida, pero el autor no publica requisitos.
- GPU recomendadas: no disponibles; por el tamaño del modelo base, cabría esperar ejecución en GPU de consumo, pero no se confirma.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo base, aunque no está verificado ni documentado.
- Opciones de despliegue: no se especifican; el adaptador en safetensors es compatible con frameworks de carga LoRA (por ejemplo, PEFT), pero el autor no documenta un pipeline de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA sobre modelos de 0,8B) con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo no está desplegado y su despliegue está explícitamente condicionado a revisión del propietario y a una evaluación sustantiva; no debe usarse en producción sin esa validación.
- No se publican benchmarks ni resultados de evaluación más allá de un smoke eval sin cifras, por lo que no es posible estimar su calidad real.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- No se documenta la longitud de contexto efectiva ni si el ajuste altera la ventana del modelo base.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- El dataset de entrenamiento es propietario y no se detalla su composición, lo que impide auditar sesgos o contaminación.
- La licencia Apache 2.0 se declara en la model card, pero conviene verificar que el modelo base Qwen/Qwen3.5-0.8B y el dataset permitan el uso comercial en la combinación publicada.
- El repositorio tiene 0 descargas y 0 interacciones, sin evidencia de uso o validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/terra-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Recibo de entrenamiento: training_receipt.unsloth.json (incluido en el repositorio)
- Evaluación de humo: evaluations/smoke-eval-r1.json (incluido en el repositorio)
