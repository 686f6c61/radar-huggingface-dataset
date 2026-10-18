# Starlinghq/kev-4b-onnx

## Resumen

Kev-4B ONNX (build de Starling, r1) es la exportación a formato ONNX del modelo de decisión `jaredpalmer/kev-4b`, un adaptador LoRA fusionado en fp32 sobre el backbone `Qwen/Qwen3.5-4B-Base`. Lo publica la organización Starlinghq como artefacto de inferencia para su paquete .NET `Starlings.Models.Kev`, dentro del repositorio `starlinghq/starling`. No es un modelo nuevo entrenado desde cero: es un empaquetado reproducible de pesos ya existentes, con revisiones y hashes fijados, orientado a despliegue verificado.

El interés técnico está en cómo se ha construido: la fusión del adaptador se hizo con el loader propio de Kev en fp32 (no reproducible bit a bit, con desviaciones de hasta 1,9e-9 en algunas proyecciones), el backbone se exportó con onnxruntime-genai model builder 0.17.1 en precisión fp32 para CPU, y el grafo resultante expone únicamente los estados ocultos finales, excluyendo la LM head y la MTP. La cabeza de decisión (pointer head) y su temperatura calibrada viajan aparte, en `head.safetensors`.

El paquete ocupa 16,9 GB e incluye cachés de estado de atención y de Gated DeltaNet como entradas y salidas del grafo, lo que permite decodificación incremental con estado persistente. Es relevante para equipos que necesitan ejecutar un modelo de 4B en CPU o en CUDA con verificación de integridad por SHA-256, más que para quien busque un modelo generativo de propósito general listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y Gated DeltaNet (backbone Qwen3.5-4B-Base) |
| Parametros totales | aproximadamente 4.000 millones (denominación 4B; el recuento exacto no se detalla) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo fp32 en este repositorio; no se incluyen variantes INT8, INT4 ni GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), safetensors (`head.safetensors`, `head.json`) y `tokenizer.json` |
| Tamano del repositorio | 16,9 GB |
| Runtime de inferencia | onnxruntime-genai 0.17.1; execution providers CPU y CUDA (`use_tf32=0`) |
| Tokenizer | `qwen2-bpe-kev` (BPE tipo Qwen2, sin modificar respecto a la revisión fijada) |
| Componentes excluidos del grafo | LM head (`exclude_lm_head=true`) y MTP (`exclude_mtp=true`) |
| Modelo base | `jaredpalmer/kev-4b`, revisión `139fdd94f1b6a6ad80cc15e08fcb99cac885a101` |
| Backbone de origen | `Qwen/Qwen3.5-4B-Base`, revisión `1001bb4d826a52d1f399e183466143f4da7b741b` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B-Base, un transformer híbrido que combina capas de atención con capas Gated DeltaNet (atención lineal con estado recurrente). El export ONNX refleja esa estructura: la caché de estado de atención y la de Gated DeltaNet aparecen como entradas y salidas del grafo, de modo que el runtime puede mantener estado entre pasos de decodificación en lugar de recalcular el prefijo completo. El grafo entrega los estados ocultos finales del backbone, sin LM head ni cabeza MTP.

Sobre el backbone se aplicó el adaptador LoRA de Kev, fusionado en fp32 con el loader propio del proyecto (fuente `6b719c3c3f367295f6ef336f4f751cf5ff970abc`, etiqueta `kev-1.0`). La fusión no es reproducible bit a bit entre builds —se documentan diferencias de hasta 1,9e-9 en algunas proyecciones fusionadas—, por lo que este repositorio contiene el build cualificado y no una receta determinista. La exportación se realizó con onnxruntime-genai model builder 0.17.1 con los parámetros `-p fp32 -e cpu`. La cabeza de puntero y la temperatura calibrada se convirtieron desde `head.pt` a safetensors fp32 sin pickle. No hay información disponible sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si el adaptador se entrenó con RLHF o DPO.

## Capacidades

- Extracción de estados ocultos finales del backbone: el grafo sirve como extractor de representaciones para tareas posteriores.
- Decodificación incremental con estado persistente, gracias a las cachés de atención y Gated DeltaNet expuestas como entradas y salidas.
- Decisión mediante pointer head: `head.safetensors` contiene una cabeza de puntero con temperatura calibrada que selecciona posiciones o spans sobre la secuencia de entrada.
- Inferencia en CPU (execution provider CPU) y en GPU (execution provider CUDA con `use_tf32=0`).
- Integración nativa en aplicaciones .NET a través del paquete `Starlings.Models.Kev`.
- Verificación de integridad de artefactos: el paquete fija cada fichero por tamano y SHA-256 (`SHA256SUMS`) y rechaza cualquier fichero modificado.
- No incluye LM head en el grafo, por lo que la generación de texto libre requiere una cabeza adicional no incluida.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking.

## Casos de uso

- Extracción de spans en documentos: la pointer head permite seleccionar el fragmento exacto de la entrada que responde a una consulta, útil para extracción de campos en facturas, contratos o formularios.
- Triaje y enrutado de tickets en aplicaciones .NET: el modelo puntúa posiciones de la consulta para asignar categoría o cola dentro de un servicio ya existente en el ecosistema .NET.
- Despliegue on-premise sin GPU: al estar exportado en fp32 para CPU, puede ejecutarse en servidores sin acelerador, con el coste de latencia asociado a 16,9 GB de pesos.
- Servicios con sesiones largas: las cachés de estado de atención y Gated DeltaNet permiten mantener contexto entre turnos sin recalcular el prefijo en cada paso.
- Pipelines con requisitos de auditoría: la fijación por SHA-256 y las revisiones pinneadas permiten verificar que el artefacto desplegado es exactamente el auditado.
- Extracción de representaciones para búsqueda semántica o reranking: los estados ocultos finales pueden alimentar índices vectoriales o clasificadores aguas abajo.
- Prototipado de modelos de decisión sobre Qwen3.5-4B: sirve como referencia para comparar el comportamiento del adaptador fusionado frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17-18 GB para inferencia en fp32 con cachés de estado, partiendo de un repositorio de 16,9 GB que incluye pesos, cabeza y tokenizer.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100, L40S y RTX 4090 (24 GB). Cabe en GPUs de 24 GB; no cabe en tarjetas de 8, 12 o 16 GB sin cuantizar.
- Consumer GPU: sí, en RTX 4090 (24 GB) con el execution provider CUDA y `use_tf32=0`. En RTX 3090 (24 GB) el margen es muy ajustado al sumar el estado del runtime.
- CPU: viable con al menos 20 GB de RAM disponible; latencia considerablemente mayor que en GPU.
- Despliegue: onnxruntime-genai 0.17.1 (CPU o CUDA EP) y el paquete .NET `Starlings.Models.Kev`. vLLM, TGI, llama.cpp y Ollama no son aplicables directamente, ya que el repositorio no incluye GGUF ni un formato compatible con esos servidores.
- Almacenamiento: 16,9 GB para los artefactos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Starlinghq/kev-4b-onnx | ~4B | no disponible | ONNX fp32 + safetensors | Apache-2.0 | Grafo sin LM head; pointer head aparte; cachés de estado expuestas; verificación SHA-256 |
| jaredpalmer/kev-4b | ~4B | no disponible | pesos PyTorch con LoRA | Apache-2.0 (segun metadatos de su model card) | Modelo original con adaptador sin fusionar; requiere cargarlo con el loader de Kev |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | safetensors | Apache-2.0 | Backbone base sin adaptador; sin pointer head; uso generativo estándar |
| Rendimiento comparado (MMLU, HumanEval, GSM8K) | — | — | — | — | no disponible para ninguno de los tres en la información proporcionada |

## Limitaciones y advertencias

- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de calidad en producción.
- Ausencia total de benchmarks publicados: no hay métricas de MMLU, HumanEval, GSM8K ni de tareas de decisión que permitan comparar con alternativas.
- No es un modelo generativo listo para usar: el grafo excluye la LM head (`exclude_lm_head=true`), de modo que la salida son estados ocultos; la generación de texto requiere una cabeza adicional que este repositorio no aporta.
- Longitud de contexto e idiomas soportados no documentados, lo que impide planificar cargas con ventanas largas o requisitos multilingües.
- Reproducibilidad limitada: la fusión fp32 del LoRA no es bit a bit reproducible (hasta 1,9e-9 de desviación), así que solo este build cualificado está validado; reconstruirlo puede producir pesos ligeramente distintos.
- Dependencia estricta de los artefactos: el paquete .NET rechaza cualquier fichero cuyo tamano o SHA-256 no coincida, lo que rompe la carga si se modifican o recomprimen ficheros.
- Huella de memoria alta para su tamano: 16,9 GB en fp32 sin variantes cuantizadas limita el despliegue en edge y en GPUs de menos de 24 GB.
- Riesgo de alucinación y sesgos: no evaluado ni documentado para este build; hereda las características del backbone Qwen3.5-4B-Base y del adaptador Kev, sin análisis publicados.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio y los términos del modelo base Qwen3.5 y del adaptador original antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Starlinghq/kev-4b-onnx
- Modelo base (adaptador original): https://huggingface.co/jaredpalmer/kev-4b
- Backbone de origen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio del proyecto y paquete .NET: https://github.com/starlinghq/starling
- onnxruntime-genai (builder 0.17.1 usado en la exportación): https://github.com/microsoft/onnxruntime-genai
- Revisión fijada del modelo base: `139fdd94f1b6a6ad80cc15e08fcb99cac885a101`
- Revisión fijada del backbone: `1001bb4d826a52d1f399e183466143f4da7b741b`
- Commit de la fuente de Kev: `6b719c3c3f367295f6ef336f4f751cf5ff970abc` (etiqueta `kev-1.0`)
