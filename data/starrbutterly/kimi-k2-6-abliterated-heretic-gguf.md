# Starrbutterly/Kimi-K2.6-Abliterated-Heretic-GGUF

## Resumen

Kimi-K2.6-Abliterated-Heretic-GGUF es una redistribución en formato GGUF de una versión "abliterated" del modelo Kimi-K2.6 de Moonshot AI. El autor del repositorio es Starrbutterly y la cuantización figura atribuida a Youssofal. La intervención consiste en aplicar la técnica Heretic sobre la pila de texto del modelo base para eliminar el comportamiento de rechazo (refusal) a nivel de pesos, conservando intacta la arquitectura multimodal: el codificador de visión y el proyector multimodal no se modifican.

El modelo base es un MoE disperso de tipo vision-language, expuesto mediante el wrapper `KimiK25ForConditionalGeneration`, con una pila de texto de estilo DeepSeek V3 y una ruta de visión separada. La model card especifica 61 capas de texto, un tamaño oculto de 7168 y 384 expertos enrutados con 8 activos por token, pero no publica el número total de parámetros ni la longitud de contexto oficial.

Este release es relevante para equipos que necesitan ejecutar localmente un modelo multimodal de gran tamaño con pesos cuantizados y sin capas de rechazo, especialmente en investigación de seguridad, red-teaming y generación de datos sintéticos sobre dominios sensibles. Hay que tener en cuenta dos advertencias importantes: el repositorio indica que las subidas siguen en curso y que parte de los ficheros y metadatos están pendientes de verificación, y todas las métricas de benchmarks y de cuantización aparecen como "Pending" en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE disperso vision-language con wrapper `KimiK25ForConditionalGeneration`; pila de texto de estilo DeepSeek V3 |
| Parámetros totales | no disponible (la model card no publica el total) |
| Parámetros activos | no disponible (solo se indica la proporción: 8 expertos activos de 384 enrutados) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 32768`, pero no se declara como contexto máximo) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | modified-mit según los metadatos; la model card declara `license: other` con `license_name: modified-mit` y hereda la licencia del base Kimi-K2.6 |
| Formato de pesos | GGUF (incluye fichero `mmproj` para visión en llama.cpp) |
| Capas de texto | 61 |
| Tamaño oculto | 7168 |
| Expertos | 384 enrutados, 8 activos por token |
| Modalidad | Visión-lenguaje (VLM) |
| Modelo base | moonshotai/Kimi-K2.6 |
| Técnica de modificación | Heretic (eliminación de rechazo a nivel de pesos, solo en la pila de texto) |
| Runtime indicado | llama.cpp (`llama-server`) |
| Fecha de creación del repositorio | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un MoE disperso de tipo vision-language. El wrapper declarado es `KimiK25ForConditionalGeneration`, con una pila de texto de estilo DeepSeek V3 formada por 61 capas y un tamaño oculto de 7168. El enrutamiento utiliza 384 expertos con 8 activos por token, lo que implica que solo una fracción pequeña de la capacidad total se computa en cada paso. La ruta de visión se implementa como un codificador separado más un proyector multimodal, empaquetado en el repositorio como fichero `mmproj-Kimi-K2.6-Abliterated-Heretic.gguf`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni la existencia de fases de RLHF o DPO, ya que la model card no los detalla. Lo que sí se documenta es el proceso de post-procesado: la eliminación del comportamiento de rechazo se realiza con la técnica Heretic, aplicada exclusivamente al lado de texto. El codificador de visión y el proyector multimodal se conservan sin modificar, de modo que la arquitectura multimodal original permanece funcional. El autor advierte de forma explícita de que el modelo responderá a peticiones que el modelo base rechazaría y de que la responsabilidad de uso recae sobre el usuario.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto gracias al fichero `mmproj` compatible con la ruta de visión de llama.cpp.
- Razonamiento y generación de lenguaje natural heredados de la pila de texto de Kimi-K2.6, con 61 capas y enrutamiento MoE de 8 expertos activos por token.
- Ejecución local cuantizada: la escalera de cuantizaciones incluye BF16, Q8_0, Q6_K, Q4_K_M y Q2_K, lo que permite ajustar el equilibrio entre fidelidad y consumo de memoria.
- Servido con llama.cpp: el repositorio documenta el uso de `llama-server` con plantilla Jinja (`--jinja`) y atención flash (`-fa`).
- Ausencia de rechazos a nivel de pesos: no se activan las respuestas de negativa del modelo base ante peticiones que este rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo "thinking" o razonamiento extendido explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad y alineación: comparar las respuestas del modelo abliterated con las del Kimi-K2.6 original permite medir qué comportamientos quedan afectados al eliminar los rechazos a nivel de pesos, usando ambos modelos sobre el mismo conjunto de prompts.
- Red-teaming de sistemas de moderación: generar contenido que los modelos convencionales rechazan para probar la robustez de clasificadores de toxicidad, filtros de prompt y guardarraíles de producción.
- Generación de datos sintéticos en dominios sensibles: crear corpus etiquetados para formación en seguridad, análisis de amenazas, forense digital o simulación de escenarios adversarios, donde el modelo base se negaría a colaborar.
- Inferencia local con requisitos de privacidad: al distribuirse en GGUF, el modelo puede ejecutarse en infraestructura propia sin enviar datos a APIs externas, algo relevante para datos clínicos, legales o internos de empresa.
- Edición y escritura creativa sin restricciones temáticas: ficción, narrativa de género negro, guiones o literatura con violencia y contenido adulto donde los rechazos del modelo base interrumpen el flujo de trabajo.
- Asistencia multimodal sobre documentos: con el fichero `mmproj` cargado, se pueden procesar capturas, diagramas o imágenes escaneadas junto con instrucciones de texto para extracción y descripción de contenido.
- Análisis de contenido histórico o periodístico: tratamiento de material gráfico o textual crudo (conflictos, archivos desclasificados) sin las negativas que suelen aparecer en modelos alineados de forma conservadora.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece cinco niveles (BF16 a Q2_K) sobre el mismo modelo, lo que permite estudiar el impacto de la cuantización en calidad y en consumo de memoria dentro de un mismo pipeline de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye tablas de verificación, pero todas las celdas figuran como "Pending", tanto en la comparativa entre modelo original y abliterated como en la tabla por cuantización:

| Comprobación | Kimi-K2.6 original | Kimi-K2.6 Abliterated Heretic |
|---|---|---|
| Chequeo oficial de rechazo con 25 prompts | Pending | Pending |
| Divergencia KL archivada (Heretic) | Pending | Pending |

| Cuantización | Chequeo de rechazo (25 prompts) | Perplejidad | Divergencia KL |
|---|---|---|---|
| Q8_0 | Pending | Pending | Pending |
| Q6_K | Pending | Pending | Pending |
| Q4_K_M | Pending | Pending | Pending |
| Q2_K | Pending | Pending | Pending |

No se dispone de valores de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar para este release.

## Requisitos de hardware

- Cálculo de VRAM: la model card no publica el número total de parámetros, por lo que no es posible dar cifras absolutas de memoria. Como referencia de escalado en llama.cpp, cada cuantización ocupa aproximadamente: BF16 ~2,0 bytes por parámetro, Q8_0 ~1,0, Q6_K ~0,8, Q4_K_M ~0,55 y Q2_K ~0,3. A esas cifras hay que sumar la caché KV, los buffers de cómputo y el fichero `mmproj` para visión.
- Contexto en el ejemplo documentado: la invocación de referencia usa `-c 32768`, que determina el tamaño de caché KV y, por tanto, la VRAM adicional necesaria. Ese valor es una configuración de ejemplo, no una especificación contractual del modelo.
- Descarga completa en GPU: el ejemplo usa `-ngl 999`, es decir, volcar todas las capas a GPU. Esto exige agregar la VRAM de una o varias GPU con NVLink o PCIe según el tamaño real de la cuantización elegida.
- GPU recomendadas: no disponible. No se documentan GPU concretas (A100, H100, RTX 4090 u otras) en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada. Dado el tamaño de la familia a la que pertenece el modelo base y la ausencia de cifras de parámetros totales, no se puede afirmar qué cuantizaciones caben en una GPU de consumo; Q2_K es la opción de menor huella de la escalera publicada.
- Opciones de despliegue: llama.cpp es el runtime documentado explícitamente (`llama-server`, con `--mmproj`, `--jinja` y `-fa`). Otros runtimes compatibles con GGUF (Ollama, LM Studio, KoboldCpp) no se mencionan en la información disponible. vLLM y TGI no son aplicables a este formato de pesos según lo indicado.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La información disponible solo permite comparar este release con su modelo base. El resto de campos no están documentados, por lo que se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Starrbutterly/Kimi-K2.6-Abliterated-Heretic-GGUF | no disponible | no disponible | Visión-lenguaje | modified-mit (hereda la del base) | GGUF (BF16, Q8_0, Q6_K, Q4_K_M, Q2_K) + mmproj | Subidas en curso; benchmarks pendientes |
| moonshotai/Kimi-K2.6 | no disponible | no disponible | Visión-lenguaje | la del base Kimi-K2.6 | no disponible en la información proporcionada | Modelo original, con comportamiento de rechazo intacto |
| Otras variantes abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | No descritas en la información proporcionada |

Como referencia de familia arquitectónica, el propio autor señala que la pila de texto sigue el estilo DeepSeek V3, pero no se aportan especificaciones comparables de modelos de esa familia en la información disponible.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo responde a peticiones que el base rechazaría. Esto invalida su uso en aplicaciones orientadas al público sin capas de moderación externas y traslada toda la responsabilidad al operador.
- Riesgo de contenido dañino: al no existir rechazo a nivel de pesos, la generación de instrucciones peligrosas, contenido ilegal o material abusivo es posible si el prompt lo solicita. Se requiere filtrado previo y posterior en cualquier despliegue real.
- Estado de publicación incompleto: la model card indica explícitamente "UPLOADS IN PROGRESS"; algunos ficheros y metadatos siguen pendientes de subida y verificación, por lo que el repositorio puede estar incompleto o cambiar.
- Ausencia total de métricas: no hay perplejidad, divergencia KL ni chequeo de rechazo publicados. No se puede cuantificar el daño colateral de la abliteración sobre el rendimiento general ni sobre la coherencia del modelo.
- Riesgo de degradación por cuantización: Q2_K y Q4_K_M degradan la fidelidad respecto a BF16 y Q8_0, pero no se aportan mediciones de esa degradación para este modelo concreto.
- Idiomas no declarados: se desconoce qué lenguas soporta oficialmente, incluyendo el castellano, y con qué calidad.
- Longitud de contexto no especificada: no se declara el contexto máximo del modelo. El valor `32768` del ejemplo no debe asumirse como límite ni como valor óptimo.
- Licencia con ambigüedad: los metadatos de HuggingFace indican `modified-mit`, mientras que el campo de licencia del repositorio figura como `other` con `license_name: modified-mit`, y la model card afirma que se hereda la licencia del base Kimi-K2.6. Conviene verificar las condiciones exactas de uso comercial y de atribución antes de integrarlo en un producto.
- Alucinaciones: no hay datos específicos sobre la tasa de alucinación de este release. La eliminación de rechazos no implica mayor veracidad; de hecho, la intervención puede alterar el comportamiento del modelo en dominios donde el rechazo actuaba como señal de incertidumbre.
- Sesgos: no se han publicado evaluaciones de sesgo para este release. La intervención sobre los pesos puede modificar de forma no medida la distribución de respuestas en temas sensibles.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documenta ningún proceso de validación independiente más allá de la propia model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Starrbutterly/Kimi-K2.6-Abliterated-Heretic-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.6
- Pipeline de eliminación de rechazo Heretic: https://github.com/andyrdt/heretic
- Runtime y cuantización llama.cpp: https://github.com/ggml-org/llama.cpp
