# Worthify/Decision-1-0.6B

## Resumen

Decision-1-0.6B es un fine-tune de Qwen/Qwen3-0.6B publicado por Worthify como el miembro pequeño de su familia Decision-1. No es un modelo generativo al uso: recibe una cadena de evidencia, un criterio y entre 2 y 16 opciones declaradas, y devuelve una puntuación para cada opción en un único forward pass. No produce texto libre ni explicaciones, solo logits sobre las opciones, lo que lo convierte en una pieza de infraestructura para enrutado, clasificación y selección dentro de pipelines mayores.

El modelo conserva la arquitectura del base (transformer decoder-only, 596.049.920 parámetros reales según safetensors) y se ha adaptado con un LoRA supervisado fusionado en los pesos BF16. Worthify insiste en un punto importante: las puntuaciones son condicionales a las opciones suministradas y no están calibradas como confianza de decisión, así que no deben interpretarse directamente como probabilidades.

Su relevancia práctica está en el tamaño y el empaquetado: cabe en CPU y en cualquier GPU de consumo, se distribuye con pesos safetensors BF16, un GGUF F16 de 1,116 GiB y un scorer local en Electron/Node con contrato de inferencia hasheado. Frente a la validación congelada del base (0,4200 de equal-family score), el fine-tune alcanza 0,8749 en BF16 y 0,8103 en el test sellado con la política de serving FP32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3) con fine-tune LoRA fusionado; cabeza de puntuación sobre logits de opciones declaradas |
| Parámetros totales | 596.049.920 (≈0,6 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (límite estricto de las rutas de inferencia incluidas; rechaza prompts que lo superan en lugar de truncarlos) |
| Tipos de cuantización | BF16 (pesos fusionados), F16 (GGUF), FP32 (promoción en carga para la ruta nativa CUDA) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF F16 (`Decision-1-0.6B.F16.gguf`, 1,116 GiB) |
| Modelo base | Qwen/Qwen3-0.6B, revisión `c1899de289a04d12100db370d81485cdf75e47ca` |
| Tamaño del repositorio | 2,4 GB |
| Descargas / likes | 0 / 0 en el momento de la ficha |
| Fecha de publicación | 2026-10-17 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B congelado y aplica un LoRA supervisado en BF16 sobre las proyecciones q/k/v/o: rango 16, alpha 32, dropout 0,05, AdamW, semilla 42, dos épocas completas (4.402 actualizaciones), batch efectivo 16, microbatch 16, warmup de 50 pasos hasta 2e-5 y clipping de gradiente en 1. La función de pérdida es entropía cruzada categórica sobre los logits de las opciones declaradas, con el prompt de Decision-1 y permutaciones de opciones locales a cada fila. El entrenamiento se ejecutó en una A100 local y el checkpoint seleccionado fue el paso 3.200. Worthify señala explícitamente que el Decision-1 original de 12B usó entrenamiento full-parameter con otro schedule, por lo que este run no reproduce ese método.

La mezcla de datos congelada (versión v9, SHA256 del manifiesto `7089b3756e7ed68c9d1ee3712195ce4a0e31162736673c911542f52d8777cddd`) contiene 35.210 filas de entrenamiento, 3.200 de validación y 3.200 de test sellado, procedentes de CLINC150 (CC-BY-3.0), WANLI (CC-BY-4.0), MultiNLI (términos permisivos OANC) y ejemplos propios de Worthify (MIT). Los registros crudos de terceros no se redistribuyen. La selección de checkpoint exige una pasada completa y única por validación, al menos +0,002 de equal-family score sobre el base congelado y ninguna regresión en la retention gate superior a 0,02.

Hay un detalle de implementación relevante: la ruta nativa (`score.py`) reinstala en cada carga un hook de softcap final FP32 heredado de Gemma, y una llamada simple a `AutoModelForCausalLM.from_pretrained` no reinstala ese hook en Python. Además, la política de fusión se enmendó después de que el primer export de 0,6B fallara la igualdad estricta de argmax en un empate exacto; el intento fallido y la revisión independiente están en `evidence/merge-policy-amendment.json`. La fusión cambió 35 de 3.200 elecciones de validación, 5 de ellas a partir de empates exactos.

## Capacidades

- Puntuación de decisiones: evalúa entre 2 y 16 opciones declaradas en un solo forward pass y devuelve logits por opción.
- Clasificación de intenciones y enrutado, apoyada en el componente CLINC150 del entrenamiento.
- Inferencia de lenguaje natural: puntuación de pares evidencia–hipótesis, con componentes MultiNLI y WANLI.
- Detección de incertidumbre y abstención: la familia `uncertainty` del test sellado alcanza 0,9961 de accuracy, útil para decidir cuándo escalar a un humano o a otro modelo.
- Triage de ciberseguridad: familia `cyber` con 0,8203 de accuracy en el test sellado.
- Selección tipo menú (elección de herramienta, plan o acción entre un conjunto cerrado): 0,8301 de accuracy.
- Resolución de procedimientos: 0,9375 de accuracy en la familia `procedural`.
- Ejecución local con evidencias que no salen del equipo: el renderer de Electron solo expone IPC de estado y puntuación, sin acceso a Node ni a la red.
- No genera texto ni explicaciones de forma intencionada, y no se ha evaluado como modelo generativo.
- Sin capacidades de visión, audio, tool calling nativo, agentes ni multi-step reasoning en el sentido habitual: es una capa de decisión, no un agente.
- Solo inglés.

## Casos de uso

- Enrutado de tickets de soporte: se pasa el texto del ticket como evidencia, una lista de 5-10 categorías como opciones y se usa el argmax para asignar cola. El límite de 2.048 tokens cubre tickets individuales sin problema y el coste por decisión es de un único forward pass.
- Clasificación de intenciones en asistentes conversacionales: con el mismo formato evidencia/opciones se obtiene la intención declarada; el componente CLINC150 del entrenamiento cubre dominios de intención habituales y las opciones quedan fijadas por el desarrollador, lo que evita respuestas fuera de catálogo.
- Verificación de afirmaciones contra evidencia: dado un par documento/afirmación y las opciones `entailment`/`neutral`/`contradiction`, el modelo devuelve la puntuación de cada una. Las familias NLI del test sellado rondan 0,67-0,79 de macro F1, adecuado para filtrado previo a revisión humana.
- Selección de herramienta en un agente: las herramientas disponibles se declaran como opciones y el modelo elige cuál invocar; al ejecutarse en local con Electron y sin red, encaja en entornos con requisitos de privacidad.
- Abstención y escalado en pipelines de producción: usar la familia `uncertainty` para decidir entre responder, pedir aclaración o derivar a un humano; conviene fijar umbrales empíricos porque las puntuaciones no están calibradas como confianza.
- Triage de alertas de seguridad: clasificar eventos en un conjunto cerrado de severidades o categorías y derivar el resto a analista, con la ventaja de que la evidencia permanece en la máquina.
- Automatización de decisiones de proceso (aprobar, rechazar, revisar) en flujos internos donde las reglas ya existen pero se necesita un scorer barato y determinista que corra en CPU.
- Evaluación A/B de prompts de decisión: al ser pequeño y ejecutable en CPU, sirve como banco de pruebas rápido para comparar formulaciones de evidencia y conjuntos de opciones antes de subir a un modelo mayor.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones internas sobre particiones congeladas propias, no benchmarks externos independientes. No hay resultados publicados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Comprobación | Equal-family score |
|---|---:|
| Validación del base congelado | 0,4200 |
| Validación BF16 fusionada (control de entrenamiento/export) | 0,8749 |
| Validación nativa FP32 de una fila | 0,8760 |
| Validación GGUF F16 | 0,8754 |
| Test sellado, nativo FP32 de una fila | 0,8103 |

| Familia del test sellado | Métrica | Puntuación |
|---|---|---:|
| classification | macro_f1 | 0,6306 |
| cyber | accuracy | 0,8203 |
| evidence_mnli | macro_f1 | 0,7851 |
| evidence_wanli | macro_f1 | 0,6727 |
| menu | accuracy | 0,8301 |
| procedural | accuracy | 0,9375 |
| uncertainty | accuracy | 0,9961 |

La concordancia entre el GGUF F16 y la ruta nativa es del 99,84 % de las filas de validación, con una variación total media/máxima en las probabilidades de opción de 0,00202 / 0,14981 y una diferencia absoluta máxima de logit de 0,83361. Worthify describe esta ruta como inferencia de escritorio aproximada.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 1,2 GB (596 M × 2 bytes); GGUF F16: 1,116 GiB; FP32 en la ruta nativa: aproximadamente 2,4 GB, el doble que BF16.
- Caché de clave/valor en FP32 y flash attention desactivado: hay que presupuestar memoria adicional sobre los pesos, especialmente al ajustar capas GPU.
- CPU: viable. `node cli.mjs ... cpu` fuerza inferencia solo en CPU con el scorer incluido.
- GPU de consumo: sí, cualquier GPU con 2-3 GB de VRAM libre cubre los pesos; el cuello de botella es la caché KV, no el modelo.
- GPU de datacenter: no necesarias. El entrenamiento se hizo en una A100, pero la inferencia no la requiere.
- Backends del scorer: `auto` (usa el backend disponible con fallback a CPU), `cuda`, `metal` y `vulkan` explícitos; si se piden, el backend debe cargar capas GPU o falla.
- Ruta nativa: `score.py` con PyTorch, `requirements.txt`, exactamente una GPU CUDA expuesta, autocast y TF32 desactivados.
- Entorno: Node 22.12 o superior; Electron con sandbox de Chromium funcional en Linux (la validación Linux no garantiza compatibilidad con Windows ni macOS).
- Opciones de despliegue documentadas: CLI de Node, ventana Electron y script Python nativo. No se documentan vLLM, TGI, llama.cpp ni Ollama, pese a que el repositorio lleva la etiqueta `text-generation-inference`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-1-0.6B | 596 M | 2.048 tokens (límite de serving) | 0,8760 en validación interna; 0,8103 en test sellado | Apache 2.0 | HuggingFace, GGUF F16, scorer Electron/Node |
| Qwen3-0.6B (base) | 596 M | No disponible en la información | 0,4200 en la misma validación congelada | Apache 2.0 | HuggingFace |
| Decision-1 (12B, familia) | 12 B según la model card | No disponible | No disponible | No disponible | Familia Decision-1 en HuggingFace |

La comparación con el base es la más informativa: sobre la misma partición congelada, el fine-tune duplica con creces el equal-family score (0,8749 frente a 0,4200), a costa de perder la generación de texto libre y de quedar restringido a inglés y a opciones declaradas. Frente al Decision-1 de 12B, este modelo no reproduce el método de entrenamiento full-parameter del mayor y no hay métricas comparativas publicadas en la información disponible.

## Limitaciones y advertencias

- Las puntuaciones no están calibradas como confianza de decisión: no deben mapearse directamente a umbrales de probabilidad sin calibración empírica propia.
- Solo inglés. El prompt, la evidencia y las opciones deben formularse en inglés para un rendimiento representativo.
- No genera respuestas ni explicaciones: no es apto para tareas de generación, resumen o diálogo abierto, y no se ha evaluado en ese uso.
- Las opciones deben declararse de antemano (2-16); si la respuesta correcta no está entre ellas, el modelo puntuará igualmente la mejor disponible. El rendimiento es condicional al conjunto de opciones.
- Límite duro de 2.048 tokens que rechaza en lugar de truncar: los prompts largos fallan, no se degradan silenciosamente.
- El macro F1 de clasificación en el test sellado es 0,6306, el más bajo de las siete familias: en dominios abiertos el rendimiento puede quedarse corto frente a clasificadores dedicados o modelos mayores.
- Las métricas son internas, sobre particiones congeladas de Worthify, no benchmarks externos; el test sellado se abrió solo tras la selección, pero no hay validación por terceros.
- La política de fusión se enmendó tras un fallo de igualdad de argmax en empates exactos; el comportamiento en empates depende de esa regla (un empate exacto solo puede resolverse a un máximo originalmente empatado, dentro de la cota de 0,5 logits sin cambios).
- Inconsistencia documentada: el base es Qwen3, pero `score.py` reinstala un hook de softcap final FP32 de Gemma. Una llamada estándar a `AutoModelForCausalLM.from_pretrained` no reinstala ese hook, por lo que la ruta nativa y una carga genérica de Transformers no son equivalentes.
- El GGUF es una aproximación de escritorio: 99,84 % de concordancia con la ruta nativa, con variación total máxima de 0,14981 en probabilidades de opción. Para decisiones sensibles conviene la ruta nativa FP32.
- La model card advierte que los nombres E2B/E4B del upstream denotan tamaños efectivos; hay que dimensionar con el tamaño real de fichero y la memoria en tiempo de ejecución, no con la etiqueta.
- Empaquetado: los módulos nativos y los ficheros GGUF deben quedar fuera del ASAR; la validación en Linux no establece compatibilidad con Windows ni macOS.
- Licencia Apache 2.0 para los pesos, pero los datos de terceros (CLINC150 CC-BY-3.0, WANLI CC-BY-4.0, MultiNLI bajo términos OANC) no se redistribuyen y arrastran sus propias condiciones.
- Modelo con 0 descargas y 0 likes en el momento de la ficha, sin adopción pública conocida ni informes independientes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Worthify/Decision-1-0.6B
- Familia Decision-1: https://huggingface.co/Worthify/Decision-1
- Modelo base Qwen3-0.6B, revisión `c1899de289a04d12100db370d81485cdf75e47ca`: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Referencias citadas en la model card sin enlace directo en la información disponible: CLINC150 (Larson et al., CC-BY-3.0), WANLI (Liu et al., CC-BY-4.0), MultiNLI (términos permisivos OANC).
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo.
