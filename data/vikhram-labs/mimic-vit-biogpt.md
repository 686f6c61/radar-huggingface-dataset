# vikhram-labs/mimic-vit-biogpt

## Resumen

ExplainableVLM-Rad (mimic-vit-biogpt) es un modelo multimodal de visión-lenguaje desarrollado por Vikhram Labs para la generación automática de informes radiológicos a partir de imágenes de rayos X. Combina un encoder Vision Transformer (ViT-Base, patch 16, resolución 224) preentrenado en ImageNet-21k con un decoder BioGPT, un modelo de lenguaje biomédico específico de dominio. El sistema se presenta como un pipeline de razonamiento científico modular, con capas de percepción, razonamiento semántico, salida estructurada y explicabilidad mediante mapas de atención y gradientes.

El modelo tiene 433,9 millones de parámetros y está entrenado sobre un subconjunto limpio del dataset MIMIC-CXR, aunque solo con 500 pasos de entrenamiento en una GPU T4, lo que lo convierte en un prototipo a escala. Su relevancia radica en su enfoque hacia la interpretabilidad y el razonamiento estructurado en un dominio de alto riesgo como la radiología, así como en su arquitectura extensible hacia sistemas de soporte a decisiones científicas con capas RAG y validación híbrida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (ViT-Base encoder + BioGPT decoder) |
| Parametros totales | 433.939.968 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona cuantizacion como extension futura, sin datos concretos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder clasica: el encoder es un ViT-Base (patch 16, 224x224) preentrenado en ImageNet-21k, que extrae representaciones visuales estructuradas de las imagenes radiologicas. El decoder es BioGPT, un modelo de lenguaje biomedico de Microsoft, que mapea las caracteristicas visuales a lenguaje clinico especifico de dominio. La conexion entre ambos se realiza mediante mecanismos de atencion cruzada, y el sistema incorpora un mapeo de relevancia token-parche para la explicabilidad.

El entrenamiento se realizo sobre el dataset MIMIC-CXR (subconjunto limpio, itsanmolgupta/mimic-cxr-dataset-cleaned) con optimizador AdamW, scheduler de calentamiento lineal, precision mixta (AMP), batch size de 4 y una GPU NVIDIA T4. El regimen de entrenamiento fue de solo 500 pasos, lo que indica un prototipo a escala. La funcion de perdida es compuesta: incluye cross-entropy para la generacion del informe, una perdida de alineacion cross-modal para la coherencia visual-texto, y una perdida de consistencia de explicacion para la interpretabilidad. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de informes radiologicos estructurados (secciones de hallazgos e impresiones) a partir de imagenes de rayos X.
- Explicabilidad mediante mapas de atencion y metodos basados en gradientes, que permiten trazar la relacion entre regiones de la imagen y el texto generado.
- Razonamiento semantico especifico de dominio gracias al decoder BioGPT, entrenado en literatura biomedica.
- Salida organizada en secciones clinicas, lo que facilita la interpretacion y el uso posterior en flujos de trabajo medicos.
- Capacidad de integracion en pipelines de razonamiento cientifico mas amplios, con extensiones previstas para RAG, validacion hibrida y mitigacion de alucinaciones.
- Soporte exclusivo del idioma ingles; no se reportan capacidades multilingues.

## Casos de uso

- Asistencia a radiologos en la redaccion de informes: el modelo puede generar un borrador de informe a partir de una radiografia, que el profesional revisa y corrige, reduciendo tiempo de documentacion.
- Triage de imagenes en urgencias: integrado en un sistema de soporte, puede priorizar casos con hallazgos anomalos basandose en el texto generado y la confianza asociada.
- Educacion medica: utilizado como herramienta de entrenamiento para estudiantes de radiologia, mostrando como se interpretan las imagenes y generando informes de ejemplo con explicaciones visuales.
- Investigacion clinica: analisis retrospectivo de grandes volumenes de radiografias para extraer hallazgos estandarizados y correlacionarlos con resultados clinicos.
- Sistemas de soporte a la decision en entornos con escasez de especialistas: el modelo puede proporcionar una primera lectura automatica en centros sin radiologo, aunque con supervision humana obligatoria.
- Desarrollo de sistemas de IA explicables en el ambito sanitario: sirve como base para estudiar la trazabilidad entre evidencia visual y texto generado, un requisito para la adopcion clinica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas como BERTScore, BLEU y ROUGE, pero no proporciona valores numericos. Tampoco se ofrecen comparaciones con otros modelos de generacion de informes radiologicos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 433,9 millones de parametros, en FP16 el modelo ocupa aproximadamente 870 MB de pesos, pero con overhead de activaciones y atencion se recomienda al menos 2-3 GB de VRAM. En cuantizacion de 8 bits podria reducirse a ~500 MB, aunque no se proporcionan archivos cuantizados oficiales.
- GPU recomendadas: NVIDIA T4 (usada en entrenamiento), RTX 3060, RTX 4060, o cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16. Para despliegue en produccion con mayor concurrencia, se sugiere A10 o A100.
- Es compatible con GPUs de consumo: si, una RTX 3060 o superior puede ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo de Hugging Face Transformers, puede servirse con vLLM, TGI, o mediante la API de Inference Endpoints. Tambien es posible exportarlo a ONNX o TensorRT para optimizacion, aunque no se proporcionan artefactos listos.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamano del modelo y la arquitectura encoder-decoder, se estima una latencia de decenas de milisegundos por imagen en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos de generacion de informes radiologicos (por ejemplo, CheXpert, CXRMate o modelos basados en GPT-4V). No se han encontrado datos publicados de rendimiento relativo. Se recomienda al lector evaluar el modelo en su propio conjunto de datos de validacion.

## Limitaciones y advertencias

- Entrenamiento prototipo: solo 500 pasos de entrenamiento, lo que implica un rendimiento muy limitado y no apto para uso clinico real sin un fine-tuning extenso.
- Sesgos potenciales: el dataset MIMIC-CXR proviene de un unico centro hospitalario (Beth Israel Deaconess Medical Center), lo que puede introducir sesgos en la distribucion de patologias y poblaciones.
- Riesgo de alucinacion: como todo modelo generativo, puede producir hallazgos inexistentes o imprecisos; la model card menciona mitigaciones futuras pero no implementadas.
- Idioma: solo soporta ingles; no hay capacidad multilingue.
- Longitud de contexto no especificada: se desconoce el limite de tokens del decoder BioGPT en esta configuracion, lo que puede afectar a informes largos.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar que el dataset MIMIC-CXR cumple con sus propias restricciones de uso (MIMIC-CXR requiere aprobacion de PhysioNet y no es de libre distribucion).
- No validado clinicamente: no hay evidencia de aprobacion regulatoria ni estudios clinicos que avalen su uso en diagnostico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vikhram-labs/mimic-vit-biogpt
- Repositorio original (Vikhram-S): https://huggingface.co/Vikhram-S/mimic-vit-biogpt
- Organizacion Vikhram Labs: https://huggingface.co/vikhram-labs
- GitHub de Vikhram Labs: https://github.com/Vikhram-Labs/
- Dataset MIMIC-CXR limpio: https://huggingface.co/datasets/itsanmolgupta/mimic-cxr-dataset-cleaned
