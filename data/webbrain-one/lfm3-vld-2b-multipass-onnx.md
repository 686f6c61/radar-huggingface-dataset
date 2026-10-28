# webbrain-one/lfm3-vld-2b-multipass-onnx

## Resumen

`webbrain-one/lfm3-vld-2b-multipass-onnx` es un paquete ONNX listo para WebGPU derivado de `webbrain-one/lfm3-vld-2b-multipass`, que a su vez parte de `LiquidAI/LFM3-VL-2B-ONNX`. Lo publica el usuario `webbrain-one` y su particularidad es que no se limita a exportar el modelo multimodal: incorpora una "sonda de decisión" (*decision probe*) que expone el estado oculto de la normalización final de la capa 24 (tensor `decision_hidden`, `[batch, seq, 2048]`) para puntuar decisiones binarias Sí/No mediante la diferencia de logits.

El modelo resuelve un problema muy concreto: ejecutar un modelo visión-lenguaje de 2.000 millones de parámetros íntegramente en el navegador sobre WebGPU, incluyendo los 459 pesos del decodificador adaptados con LoRA, que han sido recuantizados a Q8/Q8G32 y Q4G32. El repositorio ocupa 3,7 GB e incluye el decodificador en dos precisiones (1,9 GB en Q8, 1,3 GB en Q4), el codificador visual en fp16 (362 MB) y módulos JavaScript de runtime.

Es relevante ahora por dos motivos: primero, demuestra un pipeline completo de cuantización de un VLM con adaptadores LoRA dentro de ONNX sin perder el comportamiento del modelo ajustado; segundo, propone un patrón de "modelo de decisión" que acompaña a la generación de texto, con métricas declaradas de 126/126 aciertos en `final_test` y 0/48 completaciones falsas en el conjunto de validación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LFM3-VL-2B (LiquidAI); decodificador + codificador visual, exportada a ONNX con `custom_code`. Detalle interno de capas no disponible |
| Parametros totales | 2B (según el nombre del modelo); desglose no disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX Q8 / Q8G32 (decodificador q8f16), Q4G32 (decodificador q4f16), vision encoder en fp16 |
| Idiomas soportados | No disponible |
| Licencia | `lfm1.0` (LFM Open License v1.0, etiquetada como `other`); condiciones concretas no detalladas |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data`) y módulos JavaScript (`runtime/*.js`) |
| Tamano del repo | 3,7 GB |
| Pipeline | `image-text-to-text` |
| Descargas / likes | 0 descargas / 2 likes |

## Arquitectura y entrenamiento

El paquete se construye sobre `LiquidAI/LFM3-VL-2B-ONNX` y conserva la estructura multimodal original: un codificador visual en fp16 y un decodificador autorregresivo. La modificación principal del autor es la recuantización de los 459 pesos del decodificador adaptados con LoRA (procedentes del modelo `lfm3-vld-2b-multipass`) a Q8/Q8G32 y Q4G32, de modo que el ajuste fino se mantiene dentro del grafo ONNX cuantizado en lugar de perderse en la exportación.

La innovación técnica destacable es la exposición de `/model/layers.24/final_norm_layernorm/output_0` como salida adicional `decision_hidden` con forma `[batch, seq, 2048]`. Sobre ese tensor, los módulos `runtime/lfm3-vl-decision-probe.js` y `runtime/lfm3-vl-decision-probe-cs.js` calculan una puntuación combinando el estado oculto con la diferencia `logit("Yes") - logit("No")`, lo que convierte al VLM en un clasificador binario de decisión ejecutable en el navegador. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; el ajuste del que deriva es un LoRA sobre el modelo base, no un reentrenamiento completo.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Decisión binaria Sí/No mediante la sonda de decisión sobre `decision_hidden`, con puntuación auxiliar basada en logits.
- Inferencia en navegador sobre WebGPU a través de ONNX Runtime Web, con módulos JS ya incluidos.
- Ejecución en dos presupuestos de memoria: decodificador Q8 (mayor fidelidad) y Q4 (menor huella).
- Soporte de `custom_code`, necesario para cargar la arquitectura LFM3-VL en ONNX.
- Tool calling, function calling, agentes multi-paso, modo thinking, audio y cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- **Comprobación de formularios en el navegador**: dado un par (imagen del documento, pregunta de validación), la sonda devuelve una decisión Sí/No sin enviar datos a un servidor; encaja porque todo el grafo corre en WebGPU y el probe está pensado exactamente para salidas binarias.
- **Moderación visual con umbral calibrado**: el par `[decision_hidden, logit("Yes") - logit("No")]` permite fijar un umbral de aceptación y auditar las decisiones con la validación incluida (`validation/probe.json`), algo útil cuando se necesita trazabilidad.
- **Asistente de accesibilidad offline**: describir imágenes o capturas de pantalla en texto para usuarios con discapacidad visual, ejecutándose íntegramente en el dispositivo y sin coste de API.
- **Preprocesado en pipelines de datos**: cribar pares imagen-texto antes de un pipeline mayor (¿la imagen contiene un gráfico?, ¿el texto describe la imagen?), usando la versión Q4 de 1,3 GB para alto volumen.
- **Prototipado rápido de producto**: validar una función de visión-lenguaje en una demo web sin infraestructura GPU, con el bundle ONNX y los módulos JS del repositorio.
- **Verificación de contenido generado**: comprobar si una imagen cumple una condición declarada (por ejemplo, si una captura corresponde a la pantalla esperada) en un flujo de tests end-to-end de UI.
- **Distribución en entornos con restricciones de privacidad**: despliegue en navegador de escritorio con WebGPU donde no está permitido enviar imágenes a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. El autor solo reporta métricas de la sonda de decisión:

| Metrica | Resultado | Conjunto |
|---|---|---|
| Aciertos de la sonda de decisión | 126/126 | `final_test` |
| Completaciones falsas | 0/48 | validación del autor |
| Paridad con ONNX Runtime | Reportada en `validation/ort-parity.json` (valores no detallados) | — |

No se dispone de comparación con modelos similares en términos de precisión, ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para el decodificador Q8: ~1,9 GB de pesos + 362 MB del codificador visual + caché KV; en la práctica, un presupuesto de 3-4 GB suele ser suficiente para secuencias cortas (estimación, no dato del autor).
- VRAM estimada para el decodificador Q4: ~1,3 GB de pesos + 362 MB del codificador visual; presupuesto de 2-3 GB (estimación).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y en iGPU recientes con WebGPU; el objetivo declarado es el navegador, no un servidor.
- Despliegue: ONNX Runtime Web (WebGPU) con los módulos de `runtime/`; el uso en servidor requeriría ONNX Runtime nativo y verificar la compatibilidad con `custom_code`. vLLM, llama.cpp, Ollama y TGI no soportan este formato tal cual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `webbrain-one/lfm3-vld-2b-multipass-onnx` | 2B | No disponible | ONNX Q8/Q4 + JS | `lfm1.0` | Añade sonda de decisión y runtime WebGPU |
| `webbrain-one/lfm3-vld-2b-multipass` | 2B | No disponible | No disponible | No disponible | Modelo origen con adaptadores LoRA, sin exportación ONNX |
| `LiquidAI/LFM3-VL-2B-ONNX` | 2B | No disponible | ONNX | No disponible | Base oficial de LiquidAI, sin LoRA ni sonda |
| Otros VLM de ~2B (Qwen2-VL-2B, SmolVLM) | ~2B | No disponible | Múltiple | Diversa | Comparación no disponible: no hay datos de rendimiento en la información proporcionada |

## Limitaciones y advertencias

- No hay benchmarks estándar publicados; las métricas 126/126 y 0/48 provienen de conjuntos de validación del propio autor y no son comparables con evaluaciones abiertas.
- El repositorio tiene 0 descargas y 2 likes: validación externa prácticamente nula.
- La licencia `lfm1.0` (LFM Open License v1.0) impone condiciones que no se detallan en la información disponible; es imprescindible revisar los términos antes de un uso comercial.
- El modelo solo declara `region: us` y no lista idiomas soportados; el rendimiento fuera de inglés es desconocido.
- La sonda de decisión está calibrada sobre un conjunto propio; puede degradarse ante dominios, idiomas o distribuciones de imagen distintos de los de `final_test`.
- La cuantización Q4G32 introduce pérdida de precisión respecto al modelo LoRA original; conviene usar Q8 cuando la latencia no sea crítica.
- Requiere `custom_code` y ONNX Runtime Web con WebGPU: la compatibilidad depende del navegador y del sistema operativo, y no hay soporte documentado para GPUs sin WebGPU.
- Riesgo de alucinación inherente a un VLM de 2B, especialmente en descripciones densas de imágenes o texto pequeño.
- Longitud de contexto no documentada: no se puede planificar el truncamiento de conversaciones largas sin medirla empíricamente.

## Enlaces

- HuggingFace: https://huggingface.co/webbrain-one/lfm3-vld-2b-multipass-onnx
- Modelo base: https://huggingface.co/webbrain-one/lfm3-vld-2b
- Modelo origen con LoRA: https://huggingface.co/webbrain-one/lfm3-vld-2b-multipass
- Base oficial de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-ONNX
- Búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a páginas genéricas de YouTube, sin relación con el modelo).
