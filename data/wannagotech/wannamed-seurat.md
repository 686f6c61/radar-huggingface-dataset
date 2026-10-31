# WannaGoTech/WannaMed-Seurat

## Resumen

WannaMed Seurat es un modelo fundamental multimodal de 4B parámetros (4 300 079 472 en BF16) desarrollado por la empresa francesa WannaGoTech para su suite WannaMed Imagerie. Está especializado en imagen médica: radiografías 2D de alta resolución, volúmenes 3D de TC/RM (pilas de cortes SLICE 1..N) y láminas de anatomía patológica digital (WSI). Su objetivo es generar informes radio-clínicos completos a partir de imagen médica y texto, con soporte de francés, inglés y árabe.

El modelo se entrena en precisión nativa BFloat16 sin cuantización, con un encoder visual de alta resolución (896×896 px, 256 tokens por corte) y una ventana de contexto de 131 072 tokens. Según los datos declarados por el autor, alcanza 89,4 % de Macro-F1 en MIMIC-CXR, 79,1 % de localización anatómica en volúmenes 3D y 93,8 % de concordancia en clasificaciones RADS (BI-RADS, PI-RADS v2.1, LI-RADS, Bosniak, O-RADS). Su relevancia radica en la escasez de modelos abiertos que manejen conjuntamente 2D, 3D y WSI con foco clínico francófono, aunque los pesos requieren solicitud de licencia por contacto directo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal (WannaMedSeuratForConditionalGeneration + encoder visual WannaMed-Vision 896×896) |
| Parametros totales | 4 300 079 472 (≈4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | Ninguna publicada; pesos en BF16 nativo sin cuantizar |
| Idiomas soportados | Francés, inglés, árabe (fr, en, ar) |
| Licencia | Other (personalizada; requiere solicitud a contact@wannamed.com) |
| Formato de pesos | Transformers (safetensors compatible con endpoints; repo de 8,6 GB, pesos BF16 de 8,20 GB) |

## Arquitectura y entrenamiento

WannaMed Seurat emplea una arquitectura condicional de generación texto+imagen compuesta por un encoder visual propio (WannaMed-Vision) que procesa imágenes a 896×896 píxeles, generando 256 tokens por corte. Esta resolución elevada y la granularidad de tokens por corte están pensadas para preservar detalles clínicamente relevantes (microcalcificaciones, nódulos pulmonares espiculados, infiltración submucosa) que la cuantización agresiva o la baja resolución destruirían. El modelo acepta además pilas volumétricas 3D de TC/RM como secuencias multi-corte y láminas WSI como análisis multi-patch.

El entrenamiento se realizó en BFloat16 nativo sobre 36 057 informes clínicos y radiológicos verificados, 329 plantillas XML y repositorios de referencia de imagen 2D, 3D y WSI. No se ha publicado información sobre el número total de tokens de preentrenamiento, la composición detallada del dataset ni el uso de técnicas de alineación como RLHF o DPO. Como innovación destacable, el modelo unifica en un único punto de entrada los tres formatos de imagen médica dominantes (2D radiológico, volúmenes 3D y patología digital), algo poco habitual en modelos abiertos de este tamaño.

## Capacidades

- Clasificación multimodal de radiografía torácica: 5 patologías torácicas principales sobre MIMIC-CXR con localización anatómica 2D (ChestImaGenome).
- Análisis de volúmenes 3D de TC y RM: localización anatómica multi-corte (SLICE 1..N) con métrica IoU/F1.
- Estadificación RADS: concordancia con BI-RADS, PI-RADS v2.1, LI-RADS, Bosniak y O-RADS.
- Anatomía patológica digital (WSI): análisis multi-patch y respuesta a preguntas tipo PathVQA.
- Generación de informes radio-clínicos en francés, inglés y árabe.
- Entrada imagen-texto-a-texto (pipeline image-text-to-text) compatible con la librería transformers.
- No se ha publicado información sobre soporte de tool calling, agentes o thinking mode.

## Casos de uso

- Informes radiológicos asistidos de tórax: el modelo clasifica las 5 patologías torácicas principales con localización anatómica, sirviendo como segunda lectura o preinforme en servicios de radiología.
- Detección y localización en TC/RM volumétricos: procesa pilas de cortes 3D para localizar hallazgos anatómicos, útil en flujos de triaje por cortes.
- Estadificación mamaria, prostática, hepática, renal y ovárica: su concordancia con BI-RADS, PI-RADS, LI-RADS, Bosniak y O-RADS lo hace apto para preclasificación estructurada según sistemas RADS.
- Anatomía patológica digital: análisis multi-patch de láminas WSI y preguntas visuales tipo PathVQA en laboratorios de patología digitalizada.
- Redacción clínica multilingüe: generación de informes en francés, inglés o árabe para hospitales francófonos o del Magreb.
- Integración en la suite WannaMed Imagerie: el modelo es el componente base del producto comercial de WannaGoTech, con demo ZeroGPU disponible en HuggingFace Spaces.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación multimodal radiografía torácica | MIMIC-CXR (5 patologías torácicas, hold-out) | Macro-F1 (%) | 89,4 |
| Localización anatómica 2D | ChestImaGenome | F1 (%) | 91,2 |
| Localización anatómica 3D TC/RM multi-corte | WannaMed-3D-Volumetric-CT-MRI (hold-out) | IoU/F1 (%) | 79,1 |
| Concordancia de estadificación RADS | WannaMed-Rad-FR 500 Gold (BI-RADS, PI-RADS, LI-RADS, Bosniak, O-RADS) | Accuracy (%) | 93,8 |
| Anatomía patológica WSI multi-patch | PathVQA & WSI | F1 (%) | 89,8 |

La model card del autor menciona comparativas frente a HuatuoGPT-Vision 7B, LLaVA-Med v1.5 7B y M3D-LaMed-7B (3D), pero las cifras completas de esas comparativas no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,6 GB en BF16 (tamaño de los pesos), más la sobrecarga de KV cache y del procesado de imagen a 896×896; con contexto largo de 131 072 tokens la VRAM necesaria crecerá significativamente. No se publican cifras oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) debería cubrir inferencia con contexto moderado; para contextos cercanos a 131 072 tokens o despliegue con concurrencia, A100 40/80 GB o H100.
- Consumer GPU: plausible en GPUs de 24 GB (RTX 3090/4090) en BF16 con contexto moderado; no hay cuantizaciones publicadas (GGUF, GPTQ, AWQ no disponibles) que faciliten su ejecución en GPUs de menor capacidad.
- Despliegue: librería transformers con soporte de endpoints_compatible en HuggingFace; no se menciona soporte explícito de vLLM, llama.cpp, Ollama o TGI. Existe un Space ZeroGPU oficial para prueba interactiva.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WannaMed Seurat | 4B | 131 072 tokens | Other (bajo solicitud) | Pesos bajo petición; Space público |
| HuatuoGPT-Vision | 7B | no disponible | no disponible | Abierto en HuggingFace |
| LLaVA-Med v1.5 | 7B | no disponible | Restricciones de uso (datos LLaVA/MIMIC) | Pesos bajo condiciones |
| M3D-LaMed | 7B | no disponible | no disponible | Abierto (3D CT/RM) |

WannaMed Seurat destaca por su menor tamaño (4B frente a 7B) y por cubrir 2D, 3D y WSI en un solo modelo, mientras que LLaVA-Med se centra en 2D y M3D-LaMed en 3D.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente ("verified: false" en el model-index); conviene validarlos en el entorno clínico propio antes de cualquier uso.
- El rendimiento en volúmenes 3D (79,1 % IoU/F1) es notablemente inferior al de tareas 2D, por lo que la localización 3D debe considerarse orientativa.
- Licencia "other" personalizada: los pesos no son de acceso abierto directo y requieren solicitud a contact@wannamed.com; las condiciones de uso comercial deben revisarse caso por caso.
- Modelo médico: sus salidas no sustituyen el juicio de un profesional sanitario; el uso en entornos clínicos reales puede requerir marcado CE/FDA no documentado.
- Riesgo de alucinación inherente a modelos generativos de lenguaje aplicados a diagnóstico; no hay datos publicados sobre tasas de alucinación.
- Solo 10 descargas y 1 like en HuggingFace: adopción comunitaria mínima y ausencia de auditoría externa.
- No hay cuantizaciones publicadas, lo que limita el despliegue en hardware modesto.
- El árabe está listado como idioma soportado, pero no se publican métricas específicas por idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WannaGoTech/WannaMed-Seurat
- Demo interactiva (Space ZeroGPU): https://huggingface.co/spaces/WannaGoTech/WannaMed-Seurat
- Producto oficial WannaMed Imagerie: https://wannamed.com/imagerie/
- Empresa WannaGoTech: https://wannago.tech
- Solicitud de licencia y pesos: contact@wannamed.com
- Dataset relacionado: https://huggingface.co/datasets/WannaGoTech/WannaMedASR-French-Clinical-Benchmark
