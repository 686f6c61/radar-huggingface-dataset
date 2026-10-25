# Stanley11/Beyond-Visual-Evidence-IDNet

## Resumen

Beyond-Visual-Evidence-IDNet es un repositorio de investigación publicado por Beining Xu, Hairui Wang, Jiaxin Wang, Changsheng Chen y Anirban Chakraborty (Stanley11 en HuggingFace) que acompaña al artículo «Beyond Visual Evidence: Revealing and Mitigating Relational Privacy Leakage in Document MLLMs», aceptado como póster en ACM MM 2026. No es un modelo único, sino un paquete de siete checkpoints completos de LLaVA-1.5-7B afinados sobre la tarea de extracción de información clave (KIE) del dataset IDNet-CA: un baseline afinado y seis variantes de desaprendizaje automático (SCRUB, NPO, LEGO, CU, RF-Entangle y el método propuesto, DRUF).

El problema que aborda es la fuga de privacidad relacional: los modelos multimodales de documentos pueden generar pares de campos sensibles memorizados (por ejemplo, nombre y fecha de nacimiento conjuntamente) cuando la evidencia visual es débil o el prompt lo induce. Para medirlo introducen DocPrivacyBench, con escenarios de fuga inducida por prompt y por imagen, y proponen DRUF (Dynamic Relational Unlearning Framework), que combina un conjunto de olvido actualizado dinámicamente con desacoplamiento relacional para reducir la fuga conjunta sin degradar la utilidad de extracción.

Los checkpoints son pesos completos de 7.063.427.072 parámetros en BF16 y safetensors (14,13 GB cada uno, 98,89 GB el repositorio completo), heredan la arquitectura LlavaForConditionalGeneration de llava-hf/llava-1.5-7b-hf, trabajan únicamente en inglés y se distribuyen bajo licencia llama2. Su relevancia es fundamentalmente investigadora: permiten reproducir la comparativa de métodos de unlearning sobre una tarea de documentos y evaluar compromisos entre privacidad y utilidad, más que servir como modelo de producción listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlavaForConditionalGeneration`: codificador visual CLIP a 336 x 336 píxeles + decoder LLM tipo transformer |
| Parametros totales | 7.063.427.072 por checkpoint (siete checkpoints en el repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el checkpoint base `llava-hf/llava-1.5-7b-hf` emplea 4.096 tokens de contexto y 576 tokens por imagen |
| Tipos de cuantizacion | Solo se publican pesos BF16; no hay versiones oficiales GGUF, AWQ, GPTQ ni 4/8 bits |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `llama2` (LLaMA 2 Community License) |
| Formato de pesos | `safetensors` en BF16, 14.126.947.704 bytes (14,13 GB) por checkpoint; 98,89 GB en total |
| Tarea / pipeline | `image-text-to-text` (extracción de información clave en documentos) |
| Campos extraídos | `name`, `address`, `birthday`, `expire_date`, `license_number` |
| Versión de Transformers | 5.9.0 (versión con la que se guardaron los checkpoints) |
| Inferencia alojada | No disponible (`inference: false` en la model card) |
| Región | `us` |

## Arquitectura y entrenamiento

Cada checkpoint es un LLaVA-1.5-7B completo: un codificador visual CLIP que procesa la imagen a 336 x 336 y proyecta los tokens visuales al espacio del modelo de lenguaje, que es el que genera la respuesta autoregresivamente. El punto de partida es `llava-hf/llava-1.5-7b-hf`; sobre él se realiza un ajuste supervisado para la tarea IDNet-CA de extracción de cinco campos de documentos de identidad. Ese ajuste produce el checkpoint `Base`, que actúa como referencia de utilidad antes de cualquier desaprendizaje. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

Las seis variantes restantes parten de ese baseline afinado y aplican distintas técnicas de machine unlearning: SCRUB, NPO (Negative Preference Optimization), LEGO, CU y RF-Entangle como comparativas, y DRUF como propuesta de los autores. DRUF introduce un conjunto de olvido actualizado de forma dinámica y un mecanismo de desacoplamiento relacional orientado específicamente a romper la asociación entre campos sensibles, no solo a olvidar instancias individuales. La evaluación asociada, DocPrivacyBench, distingue fuga inducida por prompt y fuga inducida por imagen, lo que permite medir si el modelo reconstruye pares de campos cuando se le priva de la evidencia visual suficiente. No se detalla en la model card la innovación a nivel de atención ni cambios en la arquitectura del decoder: las diferencias entre checkpoints son de pesos, no estructurales.

## Capacidades

- Extracción de información clave en documentos: devuelve `name`, `address`, `birthday`, `expire_date` y `license_number` a partir de una imagen de documento, con salida estructurable en JSON.
- Comprensión de imagen y texto combinados mediante el pipeline `image-text-to-text` de Transformers.
- Respuesta a instrucciones en formato conversacional: los checkpoints incluyen plantilla de chat y `generation_config` propios.
- Evaluación de privacidad: cada checkpoint permite medir fuga de privacidad relacional bajo los escenarios de DocPrivacyBench.
- Comparación de métodos de unlearning: siete pesos independientes con la misma receta de carga, lo que facilita experimentos controlados de olvido.
- No soporta tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento extendido; la model card no declara ninguna de estas capacidades.
- Multilingüismo: no disponible; el modelo está etiquetado solo para inglés.

## Casos de uso

- Investigación en machine unlearning: cargar los siete subdirectorios (`Base`, `SCRUB`, `NPO`, `LEGO`, `CU`, `RF-Entangle`, `Ours`) y reproducir la comparativa entre métodos con idéntico pipeline de evaluación, ya que todos comparten arquitectura y tokenizador.
- Auditoría de fuga de privacidad en MLLMs de documentos: usar DocPrivacyBench para cuantificar cuánta información sensible se reconstruye cuando se enmascara la evidencia visual, antes y después del desaprendizaje.
- Extracción de campos de documentos de identidad en un entorno controlado y con autorización: el checkpoint `Base` ofrece la máxima utilidad de KIE y sirve como referencia de techo de rendimiento frente a las variantes con olvido.
- Generación de datos sintéticos y prompts adversarios: emplear el baseline para producir pares campo-valor que alimenten pruebas de red teaming sobre otros sistemas de KIE.
- Validación de pipelines de cumplimiento (RGPD): comparar la tasa de fuga relacional entre el baseline y `Ours` para justificar decisiones de despliegue o de selección de técnica de mitigación.
- Docencia y reproducción académica: el repositorio permite montar prácticas sobre desaprendizaje multimodal con pesos ya entrenados, sin necesidad de reentrenar desde LLaVA.
- Estudio de compromiso privacidad-utilidad: medir la degradación de exactitud en la extracción de los cinco campos al aplicar cada técnica de unlearning y elegir el punto de operación adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo (arXiv 2608.12911) y al repositorio de código para las métricas y definiciones, pero no incluye tablas de resultados, cifras de MMLU, HumanEval, GSM8K ni métricas de exactitud de KIE o de fuga de privacidad.

## Requisitos de hardware

- VRAM estimada en BF16: entre 17 y 20 GB considerando 14,13 GB de pesos más caché KV y activaciones para una imagen de 576 tokens visuales; el cálculo exacto no está publicado.
- VRAM estimada con cuantización: en torno a 8-10 GB en 8 bits y 5-6 GB en 4 bits, aunque no se distribuyen pesos cuantizados oficiales y habría que generarlos.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB cubren la inferencia en BF16 sin problemas.
- GPU de consumo: RTX 3090 y RTX 4090 (24 GB) ejecutan el modelo en BF16; RTX 4080 (16 GB) y RTX 4060 Ti (16 GB) requieren cuantización a 8 bits o inferior.
- Despliegue: Transformers 5.9.0 con `accelerate` es la vía documentada por el autor; vLLM soporta la familia LLaVA-1.5 y permitiría servir el modelo con batching continuo, aunque la compatibilidad con esta revisión concreta de Transformers debe verificarse. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF y generar el proyector multimodal (mmproj), ya que no se publican artefactos de ese tipo.
- Latencia y throughput: no disponibles. La generación se hace con `do_sample=False` y `max_new_tokens=256` en el ejemplo oficial, pero no se aportan tiempos.
- Almacenamiento: descargar un único checkpoint requiere 14,13 GB; clonar el repositorio completo supone 98,89 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Beyond-Visual-Evidence-IDNet (este) | 7,06 B | No disponible en la model card (base LLaVA-1.5: 4.096 tokens) | llama2 | KIE de documentos + desaprendizaje relacional (7 checkpoints) | Pesos abiertos en HF, sin inferencia alojada |
| llava-hf/llava-1.5-7b-hf (upstream) | 7 B aprox. | 4.096 tokens | llama2 | VQA e instrucciones generales multimodal | Pesos abiertos, muy extendido |
| Qwen2.5-VL-7B-Instruct | 8,29 B | 128.000 tokens | Apache 2.0 | Multimodal general, agentes y documentos de formato largo | Pesos abiertos, soporte amplio en vLLM |
| Donut (document understanding) | 0,2 B (variante base) | No aplica (secuencia de imagen) | MIT | KIE/parseo de documentos sin OCR | Pesos abiertos, ligero |

Frente a LLaVA-1.5-7B, este repositorio no añade capacidades nuevas sino que especializa el modelo en cinco campos concretos y en el estudio de la fuga relacional. Frente a Qwen2.5-VL-7B, la diferencia práctica es el contexto (muy inferior aquí) y la licencia (Apache 2.0 frente a llama2), a cambio de un enfoque específico en privacidad que los modelos generales no cubren. Frente a Donut, el coste computacional es mucho mayor pero el modelo ofrece razonamiento en lenguaje natural y una línea de investigación en unlearning que Donut no aborda. No se dispone de cifras comparativas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés; no se declara soporte de castellano ni de otros idiomas, por lo que los documentos en español quedan fuera del alcance previsto.
- Alcance funcional muy estrecho: el ajuste se realizó para cinco campos de IDNet-CA; usarlo con otros tipos de documento o con otros campos producirá extracciones poco fiables.
- Alucinación: la propia motivación del artículo es que el modelo genera pares de campos sensibles memorizados cuando falta evidencia visual, de modo que el riesgo de invención es estructural en esta familia de checkpoints.
- Sesgos: no se documentan análisis de sesgo demográfico, lingüístico ni geográfico; el dataset de entrenamiento no está descrito en detalle en la model card.
- Licencia: se hereda la LLaMA 2 Community License, con las restricciones habituales de uso comercial (cláusulas de escala, obligaciones de atribución y de nombrado). Conviene revisar el texto completo antes de cualquier despliegue.
- Requisito de versión: los pesos se guardaron con Transformers 5.9.0; versiones anteriores pueden fallar al cargar o requerir ajustes.
- Repositorio completo de 98,89 GB: hay que descargar selectivamente un subdirectorio por checkpoint mediante `subfolder` o `snapshot_download`.
- Naturaleza de investigación: no hay garantía de robustez en producción, ni documentación de latencias, ni soporte de despliegue servido (`inference: false`).
- Tratamiento de datos personales: el modelo procesa documentos de identidad, categoría especial bajo el RGPD; su uso exige base jurídica, minimización y un análisis de impacto, y las técnicas de unlearning no constituyen por sí mismas una garantía de borrado conforme a normativa.
- Ausencia de cifras: sin resultados de benchmarks publicados en la información disponible, no es posible cuantificar la degradación de utilidad de cada técnica de olvido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stanley11/Beyond-Visual-Evidence-IDNet
- Modelo base: https://huggingface.co/llava-hf/llava-1.5-7b-hf
- Artículo (arXiv 2608.12911): https://arxiv.org/abs/2608.12911
- Repositorio de código: https://github.com/xubeining/Beyond-Visual-Evidence
- Requisitos del entorno original: https://github.com/xubeining/Beyond-Visual-Evidence/blob/main/requirements.txt
- Póster ACM MM 2026: https://github.com/xubeining/Beyond-Visual-Evidence
