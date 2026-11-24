# Wravn/PrivaScope-content-userrights

## Resumen

PrivaScope-content-userrights es un modelo de clasificación de texto en inglés desarrollado por el usuario Wravn, construido mediante fine-tuning sobre mukund/privbert, un RoBERTa-base preentrenado específicamente sobre textos de políticas de privacidad. El modelo está orientado a tareas de clasificación relacionadas con derechos de los usuarios en el contexto de privacidad y protección de datos (content user rights), aunque la model card publicada no detalla el esquema de etiquetas ni el conjunto de datos de entrenamiento.

Con 124.654.091 parámetros, se trata de un transformer encoder de tipo RoBERTa en configuración base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención), lo que lo sitúa en la gama ligera y apta para inferencia en CPU o GPU de consumo. El repositorio incluye pesos en safetensors y una exportación a ONNX, lo que facilita su despliegue en entornos de producción con requisitos de latencia bajos.

Su relevancia es acotada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no declara licencia y la documentación es mínima (solo metadatos YAML). Resulta útil como componente de clasificación dentro de pipelines de compliance o análisis de políticas de privacidad, pero requiere validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base, fine-tuning de mukund/privbert) |
| Parametros totales | 124.654.091 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-base admite hasta 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (se distribuye una exportación ONNX; no se especifican variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un RoBERTa-base (transformer encoder bidireccional) inicializado desde mukund/privbert, un checkpoint preentrenado sobre corpus de políticas de privacidad. Sobre esa base se ha realizado un fine-tuning supervisado para clasificación de texto, con cabecera de clasificación y métrica declarada de F1. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el número de épocas, la tasa de aprendizaje ni si se aplicaron técnicas de regularización o aumentado de datos.

Tampoco se documenta ningún proceso de alineación (RLHF, DPO) ni innovaciones técnicas destacables como decodificación especulativa o atención lineal; al tratarse de un encoder de clasificación, estas técnicas no aplican. La única información técnica adicional es la presencia de una exportación ONNX, que sugiere intención de despliegue optimizado, y la referencia al modelo base cuantizado en los tags, sin detalle sobre el método de cuantización empleado.

## Capacidades

- Clasificación de texto en inglés: asigna etiquetas a fragmentos de texto, presumiblemente relacionadas con derechos de los usuarios en contenidos (content user rights), aunque el esquema de clases no está documentado.
- Especialización en dominio de privacidad: hereda del modelo base PrivBERT el preentrenamiento sobre políticas de privacidad, lo que puede mejorar la sensibilidad léxica a terminología legal y de protección de datos.
- Inferencia ligera: 124,6 M de parámetros permiten ejecución en CPU y GPU de consumo con latencias bajas.
- Exportación ONNX: facilita integración en runtimes de producción (ONNX Runtime) y despliegue multiplataforma.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es exclusivamente un clasificador.
- Capacidad multilingüe limitada al inglés declarado.

## Casos de uso

- Clasificación de cláusulas en políticas de privacidad: el modelo puede etiquetar fragmentos de textos legales para identificar menciones a derechos de los usuarios (acceso, rectificación, supresión), apoyándose en el preentrenamiento de dominio de PrivBERT.
- Automatización de revisiones de compliance: integrar el clasificador en un pipeline que marque secciones de avisos legales o términos de servicio que requieran revisión humana por parte de equipos de protección de datos.
- Enriquecimiento de bases documentales: procesar grandes volúmenes de políticas y contratos para generar metadatos de clasificación que alimenten motores de búsqueda internos o sistemas de gestión documental.
- Filtrado previo en flujos de moderación de contenido: usar el clasificador como primera etapa para señalar textos que aborden derechos del usuario antes de un análisis más profundo con modelos mayores.
- Investigación académica sobre privacidad: servir como baseline reproducible (pesos safetensors y ONNX) en experimentos de clasificación de textos legales, con la cautela de la ausencia de licencia.
- Prototipado rápido en CPU: al ser un encoder base con exportación ONNX, permite validar hipótesis de clasificación en entornos sin GPU antes de invertir en modelos mayores.
- Despliegue en edge o entornos con recursos limitados: su tamaño reducido (repo de 0,6 GB) permite empaquetarlo en contenedores pequeños para servicios de clasificación de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara la métrica F1 como referencia, sin valores numéricos ni conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124,6 M de parámetros × 4 bytes), más memoria de activaciones para lotes pequeños.
- VRAM estimada en FP16: aproximadamente 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y funcionarán sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en iGPU con soporte ONNX Runtime.
- Ejecución en CPU: viable, especialmente con la exportación ONNX y ONNX Runtime; adecuado para servicios de baja concurrencia.
- Opciones de despliegue: ONNX Runtime (recomendado por la exportación incluida), Hugging Face Transformers con PyTorch, y potencialmente servidores de inferencia compatibles con ONNX. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wravn/PrivaScope-content-userrights | 124,6 M | no disponible (RoBERTa-base, hasta 512 tokens) | Clasificación de texto (derechos de usuario) | no disponible | Hugging Face, safetensors y ONNX |
| mukund/privbert | ~125 M (RoBERTa-base) | 512 tokens | Enmascarado de términos en políticas de privacidad | no disponible en la información consultada | Hugging Face |
| roberta-base | 125 M | 512 tokens | Modelo base generalista para fine-tuning | MIT | Hugging Face |
| distilbert-base-uncased | 66 M | 512 tokens | Modelo base destilado para clasificación | Apache 2.0 | Hugging Face |

La comparación se limita a modelos de la misma familia y tamaño, ya que no se dispone de datos de rendimiento del modelo evaluado. Frente a roberta-base o distilbert-base-uncased, la ventaja potencial es la especialización de dominio heredada de PrivBERT; la desventaja es la ausencia de licencia declarada y de documentación de evaluación.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido; es un riesgo legal relevante para cualquier despliegue en producción.
- Documentación mínima: la model card solo contiene metadatos YAML; no se especifican etiquetas, dataset, metodología de evaluación ni limitaciones conocidas.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas o sobreconfiadas en textos fuera de distribución.
- Sesgos: al entrenarse sobre textos de políticas de privacidad en inglés, puede presentar sesgos de dominio y peor rendimiento en otros registros o variedades del inglés.
- Limitación de idioma: solo declara inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Contexto limitado: como RoBERTa-base, la ventana máxima esperada es de 512 tokens, lo que obliga a truncar o segmentar documentos largos.
- Sin validación externa: cero descargas y cero likes; no hay evidencia de uso comunitario ni de reproducibilidad de resultados.
- Dependencia del modelo base: cualquier limitación o sesgo de mukund/privbert se hereda en el fine-tuning.
- Métrica F1 declarada sin valor: no permite comparar su rendimiento real con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wravn/PrivaScope-content-userrights
- Modelo base PrivBERT: https://huggingface.co/mukund/privbert
- Repositorio de RoBERTa (referencia de arquitectura): https://github.com/facebookresearch/fairseq/tree/main/examples/roberta
