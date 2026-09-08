# YousifKhoury/BoneAGUNet

## Resumen

BoneAGUNet es un conjunto de activos de inferencia para segmentación de imágenes médicas, publicado en Hugging Face por YousifKhoury y asociado al paquete Python ManskeLab/BoneAGUNet. El modelo está diseñado para procesar stacks de imágenes de articulaciones metacarpofalángicas MCP2 y MCP3 obtenidas mediante tomografía computarizada periférica cuantitativa de alta resolución (HR-pQCT). El problema que resuelve es la segmentación automática de estructuras óseas y, específicamente, de erosiones óseas, relevantes en enfermedades como la artritis reumatoide.

El repositorio contiene cuatro bundles de inferencia basados en nnU-Net: stripping articular, detección de borde cortical, máscara ósea de borde cerrado y segmentación de erosión. También incluye atlases MC y PP para MCP2 y MCP3. La arquitectura concreta no está detallada en la información disponible, aunque se mencionan modelos de atención que requieren un fork de nnU-Net con atención multicanal desarrollado por Manske Lab. El tamaño del repositorio es de 1,8 GB y la licencia es MIT. Es un modelo de investigación, no un dispositivo médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net (fork con atención multicanal de Manske Lab para los modelos de atención) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura base es nnU-Net v2, un framework de segmentación que adapta automáticamente la arquitectura U-Net a las características del dataset. BoneAGUNet se presenta como un pipeline de inferencia compuesto por cuatro modelos nnU-Net encadenados: stripping articular, detección de borde cortical, máscara ósea de borde cerrado y segmentación de erosión. La model card indica que los modelos de atención requieren un fork específico de nnU-Net con atención multicanal de Manske Lab, lo que sugiere una variante arquitectónica con mecanismos de atención, aunque no se ofrecen más detalles.

No se han publicado en la información disponible datos sobre el conjunto de datos de entrenamiento, el número de tokens o muestras, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan procedimientos de validación o métricas de entrenamiento.

## Capacidades

- Segmentación de imágenes médicas en alta resolución (HR-pQCT) de las articulaciones MCP2 y MCP3.
- Realiza cuatro tareas encadenadas: stripping articular, detección de borde cortical, generación de máscara ósea de borde cerrado y segmentación de erosión.
- Soporta entrada de stacks de imágenes ya recortados, según lo indicado en la model card.
- No soporta procesamiento de texto, tool calling, agentes ni razonamiento multi-step, al ser un modelo puramente de visión.
- No se han documentado capacidades multilingües ni soporte de audio.
- Está diseñado para su uso a través del paquete Python ManskeLab/BoneAGUNet, que gestiona la instalación de los checkpoints y sus metadatos asociados (dataset.json y plans.json).

## Casos de uso

- Investigación en artritis reumatoide: el modelo permite segmentar erosiones óseas en articulaciones metacarpofalángicas MCP2 y MCP3 a partir de imágenes HR-pQCT, lo que facilita su cuantificación en estudios clínicos.
- Seguimiento longitudinal de progresión de erosiones: al aplicar el pipeline a stacks de la misma articulación adquiridos en diferentes momentos, se pueden comparar volúmenes de erosión a lo largo del tiempo.
- Análisis de la estructura ósea cortical: el bundle de detección de borde cortical permite extraer la corteza ósea y medir su grosor, útil en investigación de calidad ósea.
- Preprocesamiento de imágenes para pipelines de análisis posteriores: el stripping articular y la máscara ósea reducen la complejidad del volumen, facilitando la segmentación de otras estructuras o el registro de imágenes.
- Automatización de anotaciones de datasets: los resultados de segmentación pueden utilizarse como máscaras iniciales que después se corrigen manualmente, acelerando la creación de datasets anotados.
- Evaluación de respuesta a tratamiento en ensayos clínicos: comparar la extensión y volumen de erosiones antes y después de una intervención terapéutica en cohortes de pacientes.
- Educación y formación en radiología: las máscaras generadas por el modelo pueden emplearse para visualizar estructuras óseas y erosiones con fines docentes en el ámbito de la imagen musculoesquelética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la model card ni en los datos proporcionados. Los puntos siguientes son los únicos datos objetivos disponibles:

- El repositorio tiene un tamaño de 1,8 GB.
- El despliegue se realiza a través del paquete Python ManskeLab/BoneAGUNet, que requiere nnU-Net o el fork con atención multicanal.
- No se indican VRAM estimada, GPUs recomendadas, latencia ni throughput.
- Al tratarse de modelos de segmentación, no aplican motores de inferencia para modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se describen modelos comparables de la misma categoría, y el carácter específico de BoneAGUNet (segmentación de erosiones en HR-pQCT) dificulta establecer comparaciones directas sin datos adicionales.

## Limitaciones y advertencias

- El modelo está destinado a investigación y no es un dispositivo médico; sus resultados no deben utilizarse para diagnóstico clínico sin validación previa.
- Requiere entradas ya recortadas de las articulaciones MCP2 o MCP3, lo que limita su uso directo sobre imágenes completas.
- Los modelos de atención necesitan un fork concreto de nnU-Net, reduciendo la portabilidad del pipeline a entornos estándar.
- No se han publicado métricas de validación ni evaluaciones de rendimiento, por lo que no es posible estimar su precisión o sensibilidad reales.
- El repositorio no registra descargas ni likes en Hugging Face, lo que indica una adopción limitada hasta la fecha.
- La licencia MIT permite el uso comercial y la modificación, pero no incluye garantías ni soporte clínico.
- No se documentan sesgos conocidos ni comportamientos específicos ante variaciones de adquisición de imagen, por lo que su robustez ante datos heterogéneos es desconocida.
- Se recomienda supervisión humana experta en cualquier aplicación de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/YousifKhoury/BoneAGUNet
- GitHub del paquete: https://github.com/ManskeLab/BoneAGUNet
- Perfil del autor en Hugging Face: https://huggingface.co/YousifKhoury
