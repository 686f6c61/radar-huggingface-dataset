# willyb23/NorthCUA-Pro-NVFP4A16

## Resumen

NorthCUA-Pro NVFP4A16 es una cuantización no oficial del modelo beipo-ai/NorthCUA-Pro, un modelo de mezcla de expertos (MoE) de 397.000 millones de parámetros totales con 17.000 millones activos, orientado a tareas de uso de ordenador (computer-use) y agentes, y construido sobre la arquitectura Qwen3.5. La desarrolla el usuario independiente willyb23 aplicando cuantización NVFP4 de solo pesos sobre los expertos enrutados, manteniendo el resto de componentes en BF16, con el objetivo de reducir el peso del checkpoint de 794 GB a aproximadamente 238 GB para su despliegue en vLLM.

El problema que resuelve es puramente operativo: un modelo de 397B en BF16 exige infraestructura de varios nodos y un ancho de banda de memoria considerable, lo que hace inviable su evaluación o despliegue en clústeres modestos. La cuantización a 4 bits en formato NVFP4 (compressed-tensors `nvfp4-pack-quantized`, weight-only) permite servir el modelo en GPUs Blackwell con soporte de FP4, manteniendo intactas las capas no expertas.

Es relevante ahora porque los modelos de computer-use de gran escala están apareciendo con fuerza y la comunidad necesita variantes desplegables. No obstante, en el momento de redactar esta ficha el repositorio está en estado de subida incompleta y el propio autor advierte explícitamente de que no debe usarse todavía: el checkpoint no ha sido probado y faltan archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) basada en Qwen3.5 |
| Parametros totales | 397.000 millones |
| Parametros activos | 17.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 weight-only en expertos enrutados (compressed-tensors `nvfp4-pack-quantized`); resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4 + BF16), compatible con vLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) derivado de Qwen3.5, con 397.000 millones de parámetros totales y 17.000 millones activos por token. La cuantización aplicada por willyb23 afecta únicamente a los expertos enrutados, que se almacenan en NVFP4 con empaquetado `nvfp4-pack-quantized` de compressed-tensors en modo weight-only; las capas de atención, los expertos compartidos, los embeddings y las normas permanecen en BF16. El proceso es idéntico al empleado en las variantes ya publicadas NorthCUA-Mini NVFP4A16 y NorthCUA-Nano NVFP4A16.

No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF o DPO) ni sobre innovaciones técnicas específicas más allá de la propia arquitectura MoE y del pipeline de cuantización. Tampoco se documenta si el modelo base incorpora decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a agentes.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), necesaria para interpretar capturas de pantalla en entornos de escritorio.
- Uso de ordenador (computer-use): interacción con interfaces gráficas mediante observación de pantalla y emisión de acciones.
- Soporte de agentes y flujos de trabajo autónomos de varios pasos, según los tags del repositorio (`agents`, `computer-use`).
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en vLLM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede observar capturas de pantalla y emitir acciones sobre la interfaz (clics, escritura, navegación) para completar flujos repetitivos como rellenar formularios o extraer datos de aplicaciones legacy, aprovechando su naturaleza de computer-use.
- Agentes de navegación web: interpretación visual de páginas y ejecución de secuencias de interacción multi-paso para tareas de investigación o compra asistida.
- Pruebas de regresión de interfaz de usuario: un agente basado en el modelo puede recorrer aplicaciones y detectar roturas de flujo, sustituyendo scripts frágiles por comportamiento guiado por visión.
- Asistencia en soporte técnico de nivel 1: el modelo puede guiar al usuario o ejecutar acciones de diagnóstico en un escritorio remoto, combinando comprensión de imágenes y texto.
- Extracción de información de documentos y pantallas: al ser image-text-to-text, puede procesar capturas y documentos escaneados para estructurar datos.
- Investigación en agentes: servir como modelo de referencia de gran escala para estudiar comportamiento emergente en tareas de computer-use, con la ventaja de que la variante NVFP4 reduce el coste de servir 397B en clústeres con GPUs Blackwell.
- Despliegue en producción con vLLM: al estar cuantizado en NVFP4 weight-only, encaja en infraestructuras que ya sirven modelos MoE de gran tamaño con vLLM y aceleración FP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el checkpoint aún no ha sido probado y que la model card completa, con resultados de test, se publicará cuando finalice la subida.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint cuantizado ocupa aproximadamente 238 GB, frente a los 794 GB del BF16. A esa cifra hay que sumar la caché KV, que depende de la longitud de contexto (no disponible) y del número de secuencias concurrentes.
- GPU recomendadas: GPUs con soporte nativo de FP4, es decir, generación Blackwell (B200, GB200). El formato NVFP4 no está soportado por generaciones anteriores (A100, H100) para ejecución nativa.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; 238 GB excede con holgura los 24-48 GB de las RTX 4090/5090 y requiere agregación multi-GPU.
- Opciones de despliegue: vLLM es el runtime objetivo declarado; el formato compressed-tensors NVFP4 no es compatible con llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|---|
| NorthCUA-Pro NVFP4A16 (esta ficha) | 397B | 17B | no disponible | NVFP4 weight-only + BF16 | Apache-2.0 | Subida incompleta, sin probar |
| beipo-ai/NorthCUA-Pro (base) | 397B | 17B | no disponible | BF16 | Apache-2.0 | Publicado |
| NorthCUA-Mini NVFP4A16 | no disponible | no disponible | no disponible | NVFP4 weight-only | Apache-2.0 | Publicado |
| NorthCUA-Nano NVFP4A16 | no disponible | no disponible | no disponible | NVFP4 weight-only | Apache-2.0 | Publicado |

No se dispone de datos de rendimiento comparado con alternativas de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- El repositorio está en estado de subida incompleta en el momento de redactar esta ficha; el autor advierte explícitamente de que no debe usarse todavía y de que el checkpoint no ha pasado pruebas.
- Es una cuantización no oficial de la comunidad, sin afiliación ni respaldo del equipo NorthCUA ni de Qwen.
- La cuantización NVFP4 weight-only introduce degradación potencial de calidad respecto al modelo base en BF16; no se han publicado evaluaciones que la cuantifiquen.
- Requiere hardware Blackwell con soporte FP4; no es desplegable en A100, H100 ni en GPUs de consumo.
- El tamaño de 238 GB sigue exigiendo agregación de varias GPUs y planificación de memoria para la caché KV.
- No se documentan sesgos conocidos, riesgos específicos de alucinación ni limitaciones idiomáticas del modelo base.
- Licencia Apache-2.0, que permite uso comercial, pero al tratarse de una cuantización derivada conviene verificar las condiciones del modelo base y de los pesos originales.
- Al ser un modelo de computer-use, la ejecución de acciones sobre interfaces reales conlleva riesgos operativos (acciones destructivas, interacción con datos sensibles) que deben mitigarse con sandboxing y supervisión.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/willyb23/NorthCUA-Pro-NVFP4A16
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Pro
- Cuantización hermana NorthCUA-Mini NVFP4A16: https://huggingface.co/willyb23/NorthCUA-Mini-NVFP4A16
- Cuantización hermana NorthCUA-Nano NVFP4A16: https://huggingface.co/willyb23/NorthCUA-Nano-NVFP4A16
